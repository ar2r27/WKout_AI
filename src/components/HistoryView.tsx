import React, { useState } from 'react';
import {
  History,
  Calendar,
  Clock,
  Dumbbell,
  Trash2,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  TrendingUp
} from 'lucide-react';
import { WorkoutSession } from '../types';

interface HistoryViewProps {
  sessions: WorkoutSession[];
  onDeleteSession: (sessionId: string) => void;
  onGoToWorkout: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onDeleteSession,
  onGoToWorkout
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Compute aggregate statistics
  const totalWorkouts = sessions.length;
  const totalVolume = sessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
  const totalDurationMinutes = Math.round(
    sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
  );
  const totalSets = sessions.reduce((acc, s) => acc + (s.totalSets || 0), 0);

  const toggleExpand = (id: string) => {
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-400" /> Dziennik & Historia Treningów
        </h1>
        <p className="text-xs text-zinc-400">
          Wszystkie Twoje zrealizowane sesje treningowe z tonażem, seriami i notatkami.
        </p>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Treningi</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {totalWorkouts}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">ukończonych sesji</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Łączny Tonaż</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {(totalVolume / 1000).toFixed(1)} <span className="text-xs text-zinc-400">ton</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{totalVolume.toLocaleString()} kg</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Czas na sali</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {totalDurationMinutes} <span className="text-xs text-zinc-400">min</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {(totalDurationMinutes / 60).toFixed(1)} godzin
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Serie Robocze</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {totalSets}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">wykonanych serii</div>
        </div>
      </div>

      {/* Sessions History List */}
      {sessions.length === 0 ? (
        <div className="p-10 rounded-3xl bg-zinc-900 border border-zinc-800 text-center">
          <Dumbbell className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
          <h3 className="text-lg font-bold text-white">Brak zapisanych treningów</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Twój dziennik treningowy czeka na pierwszy zapis. Rozpocznij trening już teraz!
          </p>
          <button
            onClick={onGoToWorkout}
            className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs inline-flex items-center gap-1.5 shadow-glow-green transition"
          >
            <Zap className="w-4 h-4" /> Rozpocznij Trening
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const dateStr = new Date(session.startTime).toLocaleDateString('pl-PL', {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            const minutes = Math.round(session.durationSeconds / 60);

            return (
              <div
                key={session.id}
                className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-md"
              >
                {/* Session Card Top */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-4 cursor-pointer hover:bg-zinc-850/50 transition flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-medium">{dateStr}</span>
                      {session.fatigueRating && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Zmęczenie: {session.fatigueRating}/5
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-white mt-1">{session.dayName}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{session.planTitle}</p>

                    {/* Quick metrics row */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-zinc-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-bold font-mono text-emerald-400">
                          {session.totalVolumeKg?.toLocaleString()} kg
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{session.totalSets} serii</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Czy na pewno chcesz usunąć ten wpis z historii?')) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition"
                      title="Usuń wpis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1 text-zinc-500">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Exercises Breakdown */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-zinc-800 bg-zinc-950/60">
                    {session.notes && (
                      <div className="mb-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                        <span className="font-bold text-zinc-400 block mb-1">Notatki z treningu:</span>
                        {session.notes}
                      </div>
                    )}

                    <div className="space-y-3">
                      {session.exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-white mb-2">
                            <span>{ex.name}</span>
                            <span className="text-zinc-500 font-normal">
                              {ex.sets.filter((s) => s.completed).length} serii wykonanych
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {ex.sets
                              .filter((s) => s.completed)
                              .map((set, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200"
                                >
                                  {set.weight}kg × {set.reps}
                                  {set.rpe ? ` @RPE${set.rpe}` : ''}
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
