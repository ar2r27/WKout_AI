import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Dumbbell,
  Sparkles,
  Calculator,
  ChevronDown,
  ChevronUp,
  Award,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  WorkoutPlan,
  WorkoutDay,
  WorkoutSession,
  ExerciseLog,
  WorkoutSetLog
} from '../types';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { sounds } from '../utils/audio';

interface ActiveWorkoutProps {
  activePlan: WorkoutPlan | null;
  activeSession: WorkoutSession | null;
  onStartSession: (day: WorkoutDay) => void;
  onUpdateSession: (session: WorkoutSession) => void;
  onFinishSession: (session: WorkoutSession) => void;
  onCancelSession: () => void;
  onTriggerRestTimer: (seconds: number) => void;
  soundEnabled: boolean;
  onAskCoachAboutSession: (summaryText: string) => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  activePlan,
  activeSession,
  onStartSession,
  onUpdateSession,
  onFinishSession,
  onCancelSession,
  onTriggerRestTimer,
  soundEnabled,
  onAskCoachAboutSession
}) => {
  // Elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(activeSession?.durationSeconds || 0);
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);
  const [calcInitialWeight, setCalcInitialWeight] = useState(60);
  const [expandedExerciseNotes, setExpandedExerciseNotes] = useState<Record<string, boolean>>({});

  // Summary finish modal
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [fatigueRating, setFatigueRating] = useState<number>(3);
  const [difficultyRating, setDifficultyRating] = useState<number>(3);

  // Interval for workout clock
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        // Periodic sync
        if (next % 15 === 0) {
          onUpdateSession({
            ...activeSession,
            durationSeconds: next
          });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // If no workout in progress -> show day selector
  if (!activeSession) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Play className="w-6 h-6 text-emerald-400" /> Rozpocznij Trening
          </h1>
          <p className="text-sm text-zinc-400">
            Wybierz dzień ze swojego aktywnego planu lub rozpocznij wolną sesję.
          </p>
        </div>

        {activePlan ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Aktywny Plan Treningowy
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{activePlan.title}</h2>
                  <p className="text-xs text-zinc-400">{activePlan.description}</p>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mt-4">
              Wybierz Dzień Treningowy:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePlan.days.map((day) => (
                <div
                  key={day.id}
                  className="p-5 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 transition flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {day.estimatedDuration} min
                      </span>
                      <span className="text-xs text-zinc-500">
                        {day.exercises.length} ćwiczeń
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                      {day.name}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">{day.targetFocus}</p>

                    <div className="mt-4 space-y-1.5 border-t border-zinc-800/80 pt-3">
                      {day.exercises.slice(0, 4).map((ex, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="truncate max-w-[200px]">• {ex.name}</span>
                          <span className="text-zinc-500 font-mono">
                            {ex.targetSets} × {ex.targetReps}
                          </span>
                        </div>
                      ))}
                      {day.exercises.length > 4 && (
                        <span className="text-[11px] text-zinc-500 italic block">
                          + jeszcze {day.exercises.length - 4} ćwiczeń...
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartSession(day)}
                    className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-green transition"
                  >
                    <Play className="w-4 h-4 fill-black" /> Rozpocznij Ten Trening
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
            <Dumbbell className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
            <h3 className="text-lg font-bold text-white">Brak aktywnego planu</h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
              Przejdź do zakładki <b>Trener AI</b>, aby wygenerować swój pierwszy inteligentny plan treningowy, lub stwórz go w <b>Mój Plan</b>.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ACTIVE WORKOUT IN PROGRESS VIEW
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  // Calculate live volume
  let liveVolume = 0;
  let totalSetsCompleted = 0;
  activeSession.exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      if (s.completed) {
        liveVolume += (s.weight || 0) * (s.reps || 0);
        totalSetsCompleted += 1;
      }
    });
  });

  const toggleSetCompleted = (exIdx: number, setIdx: number) => {
    const updated = { ...activeSession };
    const setObj = updated.exercises[exIdx].sets[setIdx];
    const isNowCompleted = !setObj.completed;
    setObj.completed = isNowCompleted;

    if (isNowCompleted) {
      if (soundEnabled) {
        sounds.playSetCompleted();
      }
      // Trigger rest timer
      const targetRest = 90; // default
      onTriggerRestTimer(targetRest);
    }

    onUpdateSession(updated);
  };

  const updateSetWeight = (exIdx: number, setIdx: number, val: number) => {
    const updated = { ...activeSession };
    updated.exercises[exIdx].sets[setIdx].weight = Math.max(0, val);
    onUpdateSession(updated);
  };

  const updateSetReps = (exIdx: number, setIdx: number, val: number) => {
    const updated = { ...activeSession };
    updated.exercises[exIdx].sets[setIdx].reps = Math.max(0, val);
    onUpdateSession(updated);
  };

  const updateSetRpe = (exIdx: number, setIdx: number, rpe: number) => {
    const updated = { ...activeSession };
    updated.exercises[exIdx].sets[setIdx].rpe = rpe;
    onUpdateSession(updated);
  };

  const addSetToExercise = (exIdx: number) => {
    const updated = { ...activeSession };
    const prevSet = updated.exercises[exIdx].sets.slice(-1)[0];
    updated.exercises[exIdx].sets.push({
      setNum: updated.exercises[exIdx].sets.length + 1,
      weight: prevSet ? prevSet.weight : 50,
      reps: prevSet ? prevSet.reps : 10,
      rpe: prevSet ? prevSet.rpe : 8,
      completed: false
    });
    onUpdateSession(updated);
  };

  const removeSetFromExercise = (exIdx: number, setIdx: number) => {
    const updated = { ...activeSession };
    if (updated.exercises[exIdx].sets.length > 1) {
      updated.exercises[exIdx].sets.splice(setIdx, 1);
      // Re-index set numbers
      updated.exercises[exIdx].sets.forEach((s, idx) => {
        s.setNum = idx + 1;
      });
      onUpdateSession(updated);
    }
  };

  const openPlateCalcForWeight = (weight: number) => {
    setCalcInitialWeight(weight);
    setIsPlateCalcOpen(true);
  };

  const handleFinishConfirm = () => {
    // Fire confetti celebration!
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const finishedSession: WorkoutSession = {
      ...activeSession,
      endTime: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      totalVolumeKg: liveVolume,
      totalSets: totalSetsCompleted,
      completed: true,
      notes: sessionNotes,
      fatigueRating,
      difficultyRating
    };

    onFinishSession(finishedSession);
    setIsFinishModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-24">
      {/* Top sticky workout control banner */}
      <div className="sticky top-16 z-20 bg-zinc-950/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 mb-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Trening w toku
              </span>
            </div>
            <h2 className="text-lg font-black text-white">{activeSession.dayName}</h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-750 text-emerald-400 font-mono font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            {/* Finish Workout Button */}
            <button
              onClick={() => setIsFinishModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-glow-green transition"
            >
              <CheckCircle2 className="w-4 h-4" /> Zakończ
            </button>

            {/* Cancel */}
            <button
              onClick={() => {
                if (window.confirm('Czy na pewno chcesz porzucić bieżący trening?')) {
                  onCancelSession();
                }
              }}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 transition"
              title="Porzuć trening"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Volume & Sets summary bar */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Ukończone serie:</span>
            <span className="font-bold text-white font-mono">{totalSetsCompleted}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 justify-end">
            <span>Tonaż (Volume):</span>
            <span className="font-bold text-emerald-400 font-mono">{liveVolume.toLocaleString()} kg</span>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {activeSession.exercises.map((ex, exIdx) => {
          const isNotesExpanded = expandedExerciseNotes[ex.exerciseId];
          return (
            <div
              key={ex.exerciseId || exIdx}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      {ex.muscleGroup}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{ex.name}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openPlateCalcForWeight(ex.sets[0]?.weight || 60)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400 text-xs transition"
                    title="Kalkulator talerzy na gryf"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sets Table */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-800">
                      <th className="pb-2 w-12 text-center">Seria</th>
                      <th className="pb-2 text-center">Ciężar (kg)</th>
                      <th className="pb-2 text-center">Powt.</th>
                      <th className="pb-2 text-center hidden sm:table-cell">RPE</th>
                      <th className="pb-2 w-16 text-center">Status</th>
                      <th className="pb-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {ex.sets.map((set, setIdx) => (
                      <tr
                        key={setIdx}
                        className={`transition ${
                          set.completed ? 'bg-emerald-500/5' : 'hover:bg-zinc-850/50'
                        }`}
                      >
                        {/* Set index */}
                        <td className="py-2.5 text-center font-bold font-mono text-zinc-400">
                          {set.setNum}
                        </td>

                        {/* Weight input */}
                        <td className="py-2.5 text-center">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              step="2.5"
                              min="0"
                              value={set.weight}
                              onChange={(e) =>
                                updateSetWeight(exIdx, setIdx, parseFloat(e.target.value) || 0)
                              }
                              className="w-16 bg-zinc-950 border border-zinc-750 focus:border-emerald-500 rounded-lg py-1 px-1.5 text-center font-mono font-bold text-white text-sm focus:outline-none"
                            />
                          </div>
                        </td>

                        {/* Reps input */}
                        <td className="py-2.5 text-center">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={set.reps}
                              onChange={(e) =>
                                updateSetReps(exIdx, setIdx, parseInt(e.target.value) || 0)
                              }
                              className="w-14 bg-zinc-950 border border-zinc-750 focus:border-emerald-500 rounded-lg py-1 px-1.5 text-center font-mono font-bold text-white text-sm focus:outline-none"
                            />
                          </div>
                        </td>

                        {/* RPE Selector */}
                        <td className="py-2.5 text-center hidden sm:table-cell">
                          <select
                            value={set.rpe || 8}
                            onChange={(e) => updateSetRpe(exIdx, setIdx, parseFloat(e.target.value))}
                            className="bg-zinc-950 border border-zinc-750 text-zinc-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
                          >
                            <option value="6">RPE 6 (4 zapas)</option>
                            <option value="7">RPE 7 (3 zapas)</option>
                            <option value="8">RPE 8 (2 zapas)</option>
                            <option value="9">RPE 9 (1 zapas)</option>
                            <option value="10">RPE 10 (Upadek)</option>
                          </select>
                        </td>

                        {/* Complete button */}
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => toggleSetCompleted(exIdx, setIdx)}
                            className={`p-1.5 rounded-xl transition ${
                              set.completed
                                ? 'bg-emerald-500 text-black shadow-glow-green font-bold'
                                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750'
                            }`}
                          >
                            {set.completed ? (
                              <CheckCircle2 className="w-5 h-5 fill-black text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                        </td>

                        {/* Delete set */}
                        <td className="py-2.5 text-right">
                          {ex.sets.length > 1 && (
                            <button
                              onClick={() => removeSetFromExercise(exIdx, setIdx)}
                              className="text-zinc-600 hover:text-red-400 p-1"
                              title="Usuń serię"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Set Button */}
              <button
                onClick={() => addSetToExercise(exIdx)}
                className="mt-3 w-full py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-dashed border-zinc-750 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Dodaj serię
              </button>
            </div>
          );
        })}
      </div>

      {/* Finish Summary Modal */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-750 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="text-center pb-4 border-b border-zinc-800">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Trening Ukończony</h3>
              <p className="text-xs text-zinc-400">Świetna robota, zapiszmy Twoje osiągnięcia.</p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 my-4">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Czas</div>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  {minutes}m {seconds}s
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Tonaż</div>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                  {liveVolume} kg
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Serie</div>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  {totalSetsCompleted}
                </div>
              </div>
            </div>

            {/* Feedback ratings */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Poziom zmęczenia (1 - Lekko, 5 - Ekstremalne wyczerpanie):
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFatigueRating(val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        fatigueRating === val
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : 'bg-zinc-850 text-zinc-400 border-zinc-750 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Twoje notatki / samopoczucie:
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="np. Dobra pompa na klatce, barki czułem stabilnie, za tydzień +2.5kg na ławce..."
                  className="w-full bg-zinc-950 border border-zinc-750 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 h-20 resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={handleFinishConfirm}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm shadow-glow-green transition"
              >
                Zapisz trening w Dzienniku
              </button>
              <button
                onClick={() => {
                  const summary = `Właśnie ukończyłem trening: ${activeSession.dayName}! Czas trwania: ${minutes} min, łączny tonaż: ${liveVolume} kg, serie: ${totalSetsCompleted}. Moje notatki: "${sessionNotes || 'brak'}". Zmęczenie: ${fatigueRating}/5. Jak oceniasz ten trening i co sugerujesz na kolejną sesję?`;
                  handleFinishConfirm();
                  onAskCoachAboutSession(summary);
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-emerald-500/20"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Zapisz i zapytaj Trenera AI o ocenę sesji
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plate Calculator Modal */}
      <PlateCalculatorModal
        isOpen={isPlateCalcOpen}
        onClose={() => setIsPlateCalcOpen(false)}
        initialWeight={calcInitialWeight}
      />
    </div>
  );
};
