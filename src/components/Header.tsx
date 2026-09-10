import React from 'react';
import { Cloud, CloudOff, Database, Dumbbell, Sparkles } from 'lucide-react';
import { GoogleDriveConfig } from '../types';

interface HeaderProps {
  googleDrive: GoogleDriveConfig;
  onOpenBackupModal: () => void;
  onOpenAIModal?: () => void;
  activeWorkoutActive: boolean;
  onGoToActiveWorkout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  googleDrive,
  onOpenBackupModal,
  activeWorkoutActive,
  onGoToActiveWorkout
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-black shadow-glow-green">
            <Dumbbell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                WKout
              </span>
              <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Twój Trener Personalny Gemini</p>
          </div>
        </div>

        {/* Action badges & Drive Sync status */}
        <div className="flex items-center gap-2">
          {/* Active workout pill if in progress */}
          {activeWorkoutActive && (
            <button
              onClick={onGoToActiveWorkout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-500 text-black hover:bg-emerald-400 transition animate-pulse shadow-glow-green"
            >
              <span className="w-2 h-2 rounded-full bg-black"></span>
              Trening w toku!
            </button>
          )}

          {/* Google Drive / Database Sync button */}
          <button
            onClick={onOpenBackupModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 transition text-zinc-300"
            title="Zarządzaj bazą danych i Dyskiem Google"
          >
            {googleDrive.isConnected ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-zinc-300">Dysk Google</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline text-zinc-300">Baza Lokalna</span>
                <CloudOff className="w-3 h-3 text-zinc-500 hidden sm:inline" />
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
