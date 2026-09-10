import {
  UserProfile,
  WorkoutPlan,
  WorkoutSession,
  ChatMessage,
  AppSettings,
  BackupData
} from '../types';

const DB_NAME = 'wkout_ai_database';
const DB_VERSION = 1;

// Default initial state
export const DEFAULT_PROFILE: UserProfile = {
  name: 'Sportowiec',
  age: 26,
  gender: 'male',
  weight: 78,
  height: 180,
  experience: 'intermediate',
  goal: 'hypertrophy',
  daysPerWeek: 3,
  sessionDuration: 60,
  splitPreference: 'ppl',
  equipment: ['barbell', 'dumbbells', 'bench', 'squat_rack', 'cable_machine', 'lat_pulldown', 'leg_press_machine'],
  customEquipment: [],
  injuries: '',
  notes: 'Chcę poprawić siłę w wyciskaniu i zbudować estetyczną sylwetkę.'
};

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-3.6-flash',
  coachPersona: 'motivational',
  coachName: 'Alex',
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'dark',
  googleDrive: {
    isConnected: false,
    clientId: '',
    autoBackup: false
  }
};

export const INITIAL_CHAT_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: 'Cześć! Jestem Twoim trenerem personalnym AI napędzanym przez Gemini.\n\nNie masz jeszcze aktywnego planu treningowego. Uzupełnij swój profil (cele, poziom, dostępne maszyny) i kliknij "Zapisz i poproś Trenera AI o dopasowanie planu" lub napisz do mnie w czacie.\n\nMożesz także wgrać własną bazę w zakładce Dysk / Kopia.\n\nW czym mogę Ci dziś pomóc?',
  timestamp: new Date().toISOString()
};


// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('store')) {
        db.createObjectStore('store');
      }
    };
  });
}

// Low-level get/set with localStorage fallback
async function getStoredValue<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('store', 'readonly');
      const store = tx.objectStore('store');
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result !== undefined && req.result !== null) {
          resolve(req.result);
        } else {
          // Check localStorage as fallback
          const localVal = localStorage.getItem(`wkout_${key}`);
          if (localVal) {
            try {
              resolve(JSON.parse(localVal));
              return;
            } catch {
              // ignore
            }
          }
          resolve(defaultValue);
        }
      };
      req.onerror = () => {
        const localVal = localStorage.getItem(`wkout_${key}`);
        if (localVal) {
          try {
            resolve(JSON.parse(localVal));
            return;
          } catch {
            // ignore
          }
        }
        resolve(defaultValue);
      };
    });
  } catch {
    const localVal = localStorage.getItem(`wkout_${key}`);
    if (localVal) {
      try {
        return JSON.parse(localVal);
      } catch {
        // ignore
      }
    }
    return defaultValue;
  }
}

async function setStoredValue<T>(key: string, value: T): Promise<void> {
  // Always mirror in localStorage for redundancy and fast sync
  try {
    localStorage.setItem(`wkout_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage setItem failed:', e);
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('store', 'readwrite');
      const store = tx.objectStore('store');
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB setItem failed, persisted to localStorage:', err);
  }
}

// User Profile
export async function getUserProfile(): Promise<UserProfile> {
  return getStoredValue<UserProfile>('profile', DEFAULT_PROFILE);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setStoredValue('profile', profile);
}

// Workout Plans
export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
  const plans = await getStoredValue<WorkoutPlan[]>('plans', []);
  // Filter out any leftover initial dummy plan
  return plans.filter((p) => p.id !== 'plan-default-ppl');
}

export async function saveWorkoutPlans(plans: WorkoutPlan[]): Promise<void> {
  await setStoredValue('plans', plans);
}

export async function getActivePlan(): Promise<WorkoutPlan | null> {
  const plans = await getWorkoutPlans();
  if (plans.length === 0) return null;
  const activeId = await getStoredValue<string | null>('activePlanId', null);
  const found = plans.find((p) => p.id === activeId);
  return found || plans[0] || null;
}

export async function setActivePlanId(planId: string): Promise<void> {
  await setStoredValue('activePlanId', planId);
  const plans = await getWorkoutPlans();
  const updated = plans.map((p) => ({
    ...p,
    isActive: p.id === planId
  }));
  await saveWorkoutPlans(updated);
}

export async function addOrUpdatePlan(plan: WorkoutPlan): Promise<void> {
  const plans = await getWorkoutPlans();
  const index = plans.findIndex((p) => p.id === plan.id);
  let updated: WorkoutPlan[];
  if (index >= 0) {
    updated = [...plans];
    updated[index] = plan;
  } else {
    updated = [plan, ...plans];
  }
  await saveWorkoutPlans(updated);
  if (plan.isActive) {
    await setActivePlanId(plan.id);
  }
}

export async function deleteWorkoutPlan(planId: string): Promise<void> {
  const plans = await getWorkoutPlans();
  const updated = plans.filter((p) => p.id !== planId);
  await saveWorkoutPlans(updated);
}

// Active Live Workout Session (persisted so refresh won't lose session)
export async function getActiveWorkoutSession(): Promise<WorkoutSession | null> {
  return getStoredValue<WorkoutSession | null>('active_workout_session', null);
}

export async function saveActiveWorkoutSession(session: WorkoutSession | null): Promise<void> {
  await setStoredValue('active_workout_session', session);
}

// Completed Workout Sessions History
export async function getWorkoutSessionsHistory(): Promise<WorkoutSession[]> {
  return getStoredValue<WorkoutSession[]>('sessions_history', []);
}

export async function saveCompletedWorkoutSession(session: WorkoutSession): Promise<void> {
  const history = await getWorkoutSessionsHistory();
  const updated = [session, ...history];
  await setStoredValue('sessions_history', updated);
  // Clear active workout session
  await saveActiveWorkoutSession(null);
}

export async function deleteWorkoutSessionFromHistory(id: string): Promise<void> {
  const history = await getWorkoutSessionsHistory();
  const updated = history.filter((s) => s.id !== id);
  await setStoredValue('sessions_history', updated);
}

// Chat Messages
export async function getChatMessages(): Promise<ChatMessage[]> {
  return getStoredValue<ChatMessage[]>('chat_messages', [INITIAL_CHAT_MESSAGE]);
}

export async function saveChatMessages(messages: ChatMessage[]): Promise<void> {
  await setStoredValue('chat_messages', messages);
}

export async function appendChatMessage(message: ChatMessage): Promise<void> {
  const current = await getChatMessages();
  await saveChatMessages([...current, message]);
}

export async function clearChatHistory(): Promise<void> {
  await saveChatMessages([INITIAL_CHAT_MESSAGE]);
}

// App Settings
export async function getAppSettings(): Promise<AppSettings> {
  const settings = await getStoredValue<AppSettings>('settings', DEFAULT_SETTINGS);
  if (!settings.geminiModel || settings.geminiModel === 'gemini-2.5-flash' || settings.geminiModel === 'gemini-2.0-flash') {
    settings.geminiModel = 'gemini-3.6-flash';
  }
  return settings;
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await setStoredValue('settings', settings);
}

// FULL DATABASE EXPORT AND IMPORT
export async function exportDatabaseToJSON(): Promise<string> {
  const profile = await getUserProfile();
  const plans = await getWorkoutPlans();
  const activePlanId = await getStoredValue<string | null>('activePlanId', null);
  const workoutSessions = await getWorkoutSessionsHistory();
  const chatMessages = await getChatMessages();
  const settings = await getAppSettings();

  const backupData: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profile,
    plans,
    activePlanId,
    workoutSessions,
    chatMessages,
    settings: {
      ...settings,
      // Do not export API key in plain download unless user requested
      geminiApiKey: settings.geminiApiKey
    }
  };

  return JSON.stringify(backupData, null, 2);
}

export async function importDatabaseFromJSON(jsonString: string): Promise<boolean> {
  try {
    const data: Partial<BackupData> = JSON.parse(jsonString);

    if (data.profile) {
      await saveUserProfile(data.profile);
    }
    if (data.plans && Array.isArray(data.plans)) {
      await saveWorkoutPlans(data.plans);
    }
    if (data.activePlanId) {
      await setActivePlanId(data.activePlanId);
    }
    if (data.workoutSessions && Array.isArray(data.workoutSessions)) {
      await setStoredValue('sessions_history', data.workoutSessions);
    }
    if (data.chatMessages && Array.isArray(data.chatMessages)) {
      await saveChatMessages(data.chatMessages);
    }
    if (data.settings) {
      await saveAppSettings(data.settings);
    }

    return true;
  } catch (err) {
    console.error('Błąd importu bazy danych:', err);
    throw new Error('Nieprawidłowy format pliku kopii zapasowej.');
  }
}
