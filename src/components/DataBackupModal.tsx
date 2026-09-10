import React, { useState, useRef } from 'react';
import {
  X,
  Database,
  Cloud,
  CloudOff,
  Download,
  Upload,
  RefreshCw,
  Key,
  Sliders,
  Check,
  AlertTriangle,
  ExternalLink,
  Shield,
  Volume2,
  VolumeX,
  CheckCircle2
} from 'lucide-react';
import { AppSettings, BackupData } from '../types';
import { exportDatabaseToJSON, importDatabaseFromJSON } from '../services/db';
import {
  authenticateGoogleDrive,
  backupToGoogleDrive,
  restoreFromGoogleDrive,
  disconnectGoogleDrive,
  isGoogleAuthLoaded
} from '../services/googleDrive';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  onRefreshAppState: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onRefreshAppState
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDriveBusy, setIsDriveBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Local JSON Export
  const handleExportJSON = async () => {
    try {
      const json = await exportDatabaseToJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `wkout_ai_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'Baza danych została pomyślnie wyeksportowana do pliku JSON!'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Błąd eksportu: ${err?.message || 'Nieznany błąd'}`
      });
    }
  };

  // Local JSON Import
  const handleImportFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        await importDatabaseFromJSON(text);
        setStatusMessage({
          type: 'success',
          text: 'Pomyślnie zaimportowano bazę danych z pliku! Odświeżam stan...'
        });
        onRefreshAppState();
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Nie udało się zaimportować: ${err?.message || 'Nieprawidłowy format'}`
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Connect Google Drive
  const handleConnectGoogleDrive = async () => {
    if (!localSettings.googleDrive.clientId.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Wprowadź swój Google OAuth Client ID poniżej, aby połączyć się z Dyskiem Google.'
      });
      return;
    }

    setIsDriveBusy(true);
    setStatusMessage(null);

    try {
      await authenticateGoogleDrive(localSettings.googleDrive.clientId);
      const updated = {
        ...localSettings,
        googleDrive: {
          ...localSettings.googleDrive,
          isConnected: true
        }
      };
      setLocalSettings(updated);
      onUpdateSettings(updated);
      setStatusMessage({
        type: 'success',
        text: 'Połączono pomyślnie z Dyskiem Google!'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Błąd połączenia z Google: ${err?.message || err}`
      });
    } finally {
      setIsDriveBusy(false);
    }
  };

  // Save to Google Drive
  const handleBackupToDrive = async () => {
    setIsDriveBusy(true);
    setStatusMessage(null);

    try {
      const res = await backupToGoogleDrive();
      const updated = {
        ...localSettings,
        googleDrive: {
          ...localSettings.googleDrive,
          lastBackupDate: res.date
        }
      };
      setLocalSettings(updated);
      onUpdateSettings(updated);
      setStatusMessage({
        type: 'success',
        text: `Kopia zapasowa wkout_ai_backup.json została zapisana na Twoim Dysku Google!`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Błąd zapisu na Dysku: ${err?.message || err}`
      });
    } finally {
      setIsDriveBusy(false);
    }
  };

  // Restore from Google Drive
  const handleRestoreFromDrive = async () => {
    if (!window.confirm('Czy na pewno chcesz przywrócić dane z Dysku Google? Nadpisze to obecny stan aplikacji.')) {
      return;
    }

    setIsDriveBusy(true);
    setStatusMessage(null);

    try {
      await restoreFromGoogleDrive();
      setStatusMessage({
        type: 'success',
        text: 'Dane zostały pomyślnie przywrócone z Dysku Google!'
      });
      onRefreshAppState();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Błąd przywracania: ${err?.message || err}`
      });
    } finally {
      setIsDriveBusy(false);
    }
  };

  // Disconnect Google Drive
  const handleDisconnectDrive = async () => {
    await disconnectGoogleDrive();
    const updated = {
      ...localSettings,
      googleDrive: {
        ...localSettings.googleDrive,
        isConnected: false
      }
    };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    setStatusMessage({
      type: 'info',
      text: 'Odłączono od Dysku Google.'
    });
  };

  // Save General Settings
  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    setStatusMessage({
      type: 'success',
      text: 'Ustawienia zostały zapisane!'
    });
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-750 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Baza Danych, Dysk Google & AI
              </h2>
              <p className="text-xs text-zinc-400">
                Zarządzanie kopiami zapasowymi, synchronizacją chmury i API Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : statusMessage.type === 'error'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}
            >
              {statusMessage.type === 'success' && <Check className="w-4 h-4 shrink-0" />}
              {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* 1. LOCAL DATABASE SECTION */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Lokalna Baza Danych (IndexedDB)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Offline-First
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Wszystkie Twoje dane (plany, historia treningów, rozmowy z trenerem) są w pełni prywatne i zapisane w pamięci Twojej przeglądarki na urządzeniu.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                className="py-2.5 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-cyan-400" /> Pobierz Kopię Bazy (.JSON)
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4 text-emerald-400" /> Przywróć z pliku .JSON
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFileSelected}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* 2. GOOGLE DRIVE BACKUP SECTION */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" /> Kopia Zapasowa na Dysku Google
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  localSettings.googleDrive.isConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}
              >
                {localSettings.googleDrive.isConnected ? 'Połączono z Dyskiem' : 'Niepołączony'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Automatycznie lub ręcznie synchronizuj swoje plany i historię treningów ze swoim osobistym kontem Google Drive.
            </p>

            {/* Google Client ID Config */}
            <div className="space-y-2 mb-3">
              <label className="block text-xs font-semibold text-zinc-300">
                Google OAuth Client ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.googleDrive.clientId}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      googleDrive: { ...localSettings.googleDrive, clientId: e.target.value }
                    })
                  }
                  placeholder="np. 123456789-abc.apps.googleusercontent.com"
                  className="flex-1 bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
                {!localSettings.googleDrive.isConnected ? (
                  <button
                    onClick={handleConnectGoogleDrive}
                    disabled={isDriveBusy}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold text-xs transition whitespace-nowrap shadow-glow-green"
                  >
                    Połącz
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnectDrive}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-red-400 border border-zinc-700 text-xs font-bold transition whitespace-nowrap"
                  >
                    Odłącz
                  </button>
                )}
              </div>
              <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                <span>Wymagany scope: drive.file (bezpieczny, dostęp tylko do pliku tej aplikacji)</span>
              </div>
            </div>

            {/* Drive Backup & Restore Buttons */}
            {localSettings.googleDrive.isConnected && (
              <div className="pt-2 border-t border-zinc-850 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleBackupToDrive}
                    disabled={isDriveBusy}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Cloud className="w-4 h-4" /> Zapisz kopię na Dysku Google
                  </button>
                  <button
                    onClick={handleRestoreFromDrive}
                    disabled={isDriveBusy}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-4 h-4 ${isDriveBusy ? 'animate-spin' : ''}`} />
                    Przywróć z Dysku
                  </button>
                </div>

                {localSettings.googleDrive.lastBackupDate && (
                  <div className="text-[11px] text-zinc-500 text-center">
                    Ostatnia kopia na Dysku:{' '}
                    <span className="text-zinc-400 font-medium">
                      {new Date(localSettings.googleDrive.lastBackupDate).toLocaleString('pl-PL')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. GEMINI AI CONFIGURATION */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" /> Google Gemini API (Trener AI)
              </h3>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                Pobierz darmowy klucz <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Wprowadź swój klucz z Google AI Studio, aby uzyskać dostęp do najpotężniejszych modeli (lub korzystaj z wbudowanego inteligentnego symulatora).
            </p>

            <div className="space-y-3">
              {/* API Key Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Klucz API Gemini:
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={localSettings.geminiApiKey}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })
                    }
                    placeholder="AIzaSy..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl pl-3 pr-20 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-2 px-2 py-0.5 text-[10px] font-bold text-zinc-400 hover:text-white bg-zinc-800 rounded-md"
                  >
                    {showApiKey ? 'Ukryj' : 'Pokaż'}
                  </button>
                </div>
              </div>

              {/* Model Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Model AI Gemini:
                  </label>
                  <select
                    value={localSettings.geminiModel}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, geminiModel: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-750 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Zalecany)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Szybki)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Głęboka analiza)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Styl & Persona Trenera:
                  </label>
                  <select
                    value={localSettings.coachPersona}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        coachPersona: e.target.value as any
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-750 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="motivational">Motywujący i Energetyczny</option>
                    <option value="analytical">Analityczny (Evidence-Based)</option>
                    <option value="strict">Wymagający i Rygorystyczny</option>
                    <option value="friendly">Partnerski i Spokojny</option>
                  </select>
                </div>
              </div>

              {/* Sound & Cues toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  {localSettings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-zinc-500" />
                  )}
                  <span>Dźwięki stopera i powiadomień</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      soundEnabled: !localSettings.soundEnabled
                    })
                  }
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition ${
                    localSettings.soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-black shadow-md"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-900">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold transition"
          >
            Zamknij
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold shadow-glow-green transition"
          >
            Zapisz Ustawienia
          </button>
        </div>
      </div>
    </div>
  );
};
