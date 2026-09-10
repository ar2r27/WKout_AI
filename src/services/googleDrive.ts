import { exportDatabaseToJSON, importDatabaseFromJSON, getAppSettings, saveAppSettings } from './db';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

const DRIVE_FILE_NAME = 'wkout_ai_backup.json';
const DRIVE_MIME_TYPE = 'application/json';

let currentAccessToken: string | null = null;

export function isGoogleAuthLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.google?.accounts?.oauth2;
}

/**
 * Initiates Google OAuth2 login via Google Identity Services Token Client
 */
export async function authenticateGoogleDrive(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isGoogleAuthLoaded()) {
      reject(
        new Error(
          'Google Identity Services nie zostały jeszcze załadowane. Sprawdź połączenie internetowe.'
        )
      );
      return;
    }

    if (!clientId.trim()) {
      reject(new Error('Wprowadź Google Client ID w ustawieniach integracji Dysku Google.'));
      return;
    }

    try {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (response) => {
          if (response.error) {
            reject(new Error(`Błąd autoryzacji Google: ${response.error}`));
            return;
          }
          if (response.access_token) {
            currentAccessToken = response.access_token;
            // Update settings
            const settings = await getAppSettings();
            settings.googleDrive.isConnected = true;
            settings.googleDrive.clientId = clientId.trim();
            await saveAppSettings(settings);
            resolve(response.access_token);
          } else {
            reject(new Error('Nie otrzymano tokenu autoryzacji od Google.'));
          }
        }
      });

      client.requestAccessToken();
    } catch (err: any) {
      reject(new Error(`Inicjalizacja Google Auth nie powiodła się: ${err?.message || err}`));
    }
  });
}

/**
 * Find existing backup file on Google Drive
 */
async function findBackupFile(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!res.ok) {
    throw new Error(`Błąd wyszukiwania na Dysku Google (${res.status})`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

/**
 * Save / upload database backup to Google Drive
 */
export async function backupToGoogleDrive(tokenOverride?: string): Promise<{ success: boolean; date: string }> {
  const token = tokenOverride || currentAccessToken;
  if (!token) {
    throw new Error('Brak aktywnej sesji Google Drive. Kliknij "Połącz z Dyskiem Google".');
  }

  const jsonContent = await exportDatabaseToJSON();
  const existingFileId = await findBackupFile(token);

  if (existingFileId) {
    // Update existing file content
    const updateRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': DRIVE_MIME_TYPE
        },
        body: jsonContent
      }
    );

    if (!updateRes.ok) {
      throw new Error(`Nie udało się zaktualizować pliku na Dysku (${updateRes.status})`);
    }
  } else {
    // Create new file with metadata
    const metadata = {
      name: DRIVE_FILE_NAME,
      mimeType: DRIVE_MIME_TYPE,
      description: 'Automatyczna kopia zapasowa danych WKout AI (profile, plany, treningi)'
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${DRIVE_MIME_TYPE}\r\n\r\n` +
      jsonContent +
      closeDelimiter;

    const createRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      }
    );

    if (!createRes.ok) {
      throw new Error(`Nie udało się utworzyć pliku na Dysku (${createRes.status})`);
    }
  }

  const now = new Date().toISOString();
  const settings = await getAppSettings();
  settings.googleDrive.lastBackupDate = now;
  await saveAppSettings(settings);

  return { success: true, date: now };
}

/**
 * Download and restore database from Google Drive
 */
export async function restoreFromGoogleDrive(tokenOverride?: string): Promise<boolean> {
  const token = tokenOverride || currentAccessToken;
  if (!token) {
    throw new Error('Brak aktywnej sesji Google Drive. Połącz się ponownie.');
  }

  const fileId = await findBackupFile(token);
  if (!fileId) {
    throw new Error('Nie znaleziono pliku kopii zapasowej wkout_ai_backup.json na Twoim Dysku Google.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Błąd pobierania pliku z Dysku Google (${res.status})`);
  }

  const jsonText = await res.text();
  await importDatabaseFromJSON(jsonText);
  return true;
}

/**
 * Disconnect Google Drive
 */
export async function disconnectGoogleDrive(): Promise<void> {
  currentAccessToken = null;
  const settings = await getAppSettings();
  settings.googleDrive.isConnected = false;
  await saveAppSettings(settings);
}
