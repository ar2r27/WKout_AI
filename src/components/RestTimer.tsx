import React, { useEffect, useState } from 'react';
import { Play, Pause, X, Plus, RotateCcw, Bell } from 'lucide-react';
import { sounds } from '../utils/audio';

interface RestTimerProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isOpen,
  onClose,
  soundEnabled
}) => {
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  // Sync with prop change
  useEffect(() => {
    setTotalTime(initialSeconds);
    setTimeLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isOpen || !isRunning) return;

    if (timeLeft <= 0) {
      if (soundEnabled) {
        sounds.playTimerFinished();
      }
      setIsRunning(false);
      return;
    }

    // Audible tick in last 3 seconds
    if (soundEnabled && timeLeft <= 3 && timeLeft > 0) {
      sounds.playTick();
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (soundEnabled) {
            sounds.playTimerFinished();
          }
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning, timeLeft, soundEnabled]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 100;

  const addTime = (secs: number) => {
    setTimeLeft((prev) => Math.max(0, prev + secs));
    setTotalTime((prev) => Math.max(prev, timeLeft + secs));
    setIsRunning(true);
  };

  const setPreset = (secs: number) => {
    setTotalTime(secs);
    setTimeLeft(secs);
    setIsRunning(true);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-80 z-50 bg-zinc-900/95 border border-emerald-500/40 rounded-2xl shadow-2xl backdrop-blur-xl p-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className={`w-4 h-4 ${timeLeft === 0 ? 'text-emerald-400 animate-bounce' : 'text-zinc-400'}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Czas Przerwy
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
          title="Zamknij stoper"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-between my-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-zinc-500 font-medium">
            / {Math.floor(totalTime / 60)}:{String(totalTime % 60).padStart(2, '0')}
          </span>
        </div>

        {/* Play / Pause */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2.5 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => addTime(30)}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-0.5"
            title="+30 sekund"
          >
            <Plus className="w-3.5 h-3.5" /> 30s
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden my-2">
        <div
          className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2 border-t border-zinc-800/80">
        {[45, 60, 90, 120].map((sec) => (
          <button
            key={sec}
            onClick={() => setPreset(sec)}
            className="py-1 text-xs font-medium rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 transition"
          >
            {sec}s
          </button>
        ))}
      </div>
    </div>
  );
};
