import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Play,
  Dumbbell,
  Clock,
  Sparkles,
  ChevronRight,
  Edit2,
  Check,
  Search,
  X,
  Upload
} from 'lucide-react';
import { WorkoutPlan, WorkoutDay, PlanExercise, ExerciseDefinition } from '../types';
import { EXERCISE_DATABASE } from '../data/exercises';

interface PlanViewProps {
  plans: WorkoutPlan[];
  activePlan: WorkoutPlan | null;
  onSelectActivePlan: (planId: string) => void;
  onSavePlan: (plan: WorkoutPlan) => void;
  onDeletePlan: (planId: string) => void;
  onStartDaySession: (day: WorkoutDay) => void;
  onGoToCoach: () => void;
  onOpenBackupModal?: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  plans,
  activePlan,
  onSelectActivePlan,
  onSavePlan,
  onDeletePlan,
  onStartDaySession,
  onGoToCoach,
  onOpenBackupModal
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');

  if (!activePlan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
          <Calendar className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
          <h2 className="text-xl font-bold text-white">Brak planu treningowego</h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
            Porozmawiaj ze swoim Trenerem AI, który rozpisze dla Ciebie idealny plan pod Twój cel i sprzęt, lub wgraj własny plik z kopią zapasową.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onGoToCoach}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm inline-flex items-center gap-2 shadow-glow-green transition"
            >
              <Sparkles className="w-4 h-4" /> Ułóż plan z Trenerem AI
            </button>
            {onOpenBackupModal && (
              <button
                onClick={onOpenBackupModal}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white font-bold text-sm inline-flex items-center gap-2 transition"
              >
                <Upload className="w-4 h-4 text-cyan-400" /> Wgraj z pliku JSON / Kopia
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentDay = activePlan.days[selectedDayIndex] || activePlan.days[0];

  const handleAddExerciseToCurrentDay = (def: ExerciseDefinition) => {
    if (!currentDay) return;

    const newEx: PlanExercise = {
      id: `ex-${Date.now()}`,
      exerciseId: def.id,
      name: def.name,
      muscleGroup: def.muscleGroup,
      equipment: def.equipment[0] || 'Sprzęt',
      targetSets: 3,
      targetReps: '8-10',
      targetRpe: 8,
      restSeconds: 90,
      notes: def.tips || ''
    };

    const updatedPlan: WorkoutPlan = {
      ...activePlan,
      updatedAt: new Date().toISOString(),
      days: activePlan.days.map((d, idx) => {
        if (idx === selectedDayIndex) {
          return {
            ...d,
            exercises: [...d.exercises, newEx]
          };
        }
        return d;
      })
    };

    onSavePlan(updatedPlan);
    setIsAddExerciseModalOpen(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const updatedPlan: WorkoutPlan = {
      ...activePlan,
      updatedAt: new Date().toISOString(),
      days: activePlan.days.map((d, idx) => {
        if (idx === selectedDayIndex) {
          return {
            ...d,
            exercises: d.exercises.filter((ex) => ex.id !== exerciseId)
          };
        }
        return d;
      })
    };
    onSavePlan(updatedPlan);
  };

  const handleUpdateExerciseField = (
    exerciseId: string,
    field: keyof PlanExercise,
    val: any
  ) => {
    const updatedPlan: WorkoutPlan = {
      ...activePlan,
      updatedAt: new Date().toISOString(),
      days: activePlan.days.map((d, idx) => {
        if (idx === selectedDayIndex) {
          return {
            ...d,
            exercises: d.exercises.map((ex) => {
              if (ex.id === exerciseId) {
                return { ...ex, [field]: val };
              }
              return ex;
            })
          };
        }
        return d;
      })
    };
    onSavePlan(updatedPlan);
  };

  // Filter exercises in library modal
  const filteredExercises = EXERCISE_DATABASE.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      item.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle = muscleFilter === 'all' || item.muscleGroup === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const muscleGroups = [
    'all',
    'Klatka piersiowa',
    'Plecy',
    'Czworogłowe ud',
    'Dwugłowe ud / Pośladki',
    'Barki',
    'Biceps',
    'Triceps',
    'Brzuch',
    'Łydki'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Plan selector & header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              {activePlan.author === 'ai' ? 'Stworzony przez AI' : 'Plan Użytkownika'}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              Cel: {activePlan.goal}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">{activePlan.title}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{activePlan.description}</p>
        </div>

        {/* Quick action: ask AI */}
        <div className="flex items-center gap-2">
          {plans.length > 1 && (
            <select
              value={activePlan.id}
              onChange={(e) => onSelectActivePlan(e.target.value)}
              className="bg-zinc-900 border border-zinc-750 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onGoToCoach}
            className="px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Zmień z AI
          </button>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {activePlan.days.map((day, idx) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayIndex(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
              selectedDayIndex === idx
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-glow-green'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <span>{day.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                selectedDayIndex === idx ? 'bg-black/20 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {day.exercises.length}
            </span>
          </button>
        ))}
      </div>

      {/* Day Overview Banner */}
      {currentDay && (
        <div className="mt-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white">{currentDay.name}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Fokus: <span className="text-emerald-400">{currentDay.targetFocus}</span> • Ok. {currentDay.estimatedDuration} min
            </p>
          </div>

          <button
            onClick={() => onStartDaySession(currentDay)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-glow-green transition"
          >
            <Play className="w-3.5 h-3.5 fill-black" /> Trenuj Dzisiaj
          </button>
        </div>
      )}

      {/* Exercise List */}
      <div className="mt-4 space-y-3">
        {currentDay && currentDay.exercises.map((ex, exIdx) => (
          <div
            key={ex.id || exIdx}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10">
                    {ex.muscleGroup}
                  </span>
                  <span className="text-xs text-zinc-500">#{exIdx + 1}</span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">{ex.name}</h4>
              </div>

              <button
                onClick={() => handleRemoveExercise(ex.id)}
                className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition"
                title="Usuń ćwiczenie z planu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Configurable Exercise Parameters */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-zinc-800/80">
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Serie</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={ex.targetSets}
                  onChange={(e) =>
                    handleUpdateExerciseField(ex.id, 'targetSets', parseInt(e.target.value) || 1)
                  }
                  className="w-full bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                />
              </div>

              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Powtórzenia</span>
                <input
                  type="text"
                  value={ex.targetReps}
                  onChange={(e) => handleUpdateExerciseField(ex.id, 'targetReps', e.target.value)}
                  placeholder="8-10"
                  className="w-full bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                />
              </div>

              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Przerwa (sek.)</span>
                <input
                  type="number"
                  step="15"
                  min="30"
                  value={ex.restSeconds}
                  onChange={(e) =>
                    handleUpdateExerciseField(ex.id, 'restSeconds', parseInt(e.target.value) || 60)
                  }
                  className="w-full bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                />
              </div>

              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hidden sm:block">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Cel RPE</span>
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  max="10"
                  value={ex.targetRpe || 8}
                  onChange={(e) =>
                    handleUpdateExerciseField(ex.id, 'targetRpe', parseFloat(e.target.value) || 8)
                  }
                  className="w-full bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Notes / Tips */}
            {ex.notes && (
              <p className="text-xs text-zinc-400 mt-2 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/60 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-zinc-300">{ex.notes}</span>
              </p>
            )}
          </div>
        ))}

        {/* Add Exercise to Day Button */}
        <button
          onClick={() => setIsAddExerciseModalOpen(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Dodaj ćwiczenie do tego dnia z bazy
        </button>
      </div>

      {/* Exercise Library Modal */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-750 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Baza Ćwiczeń</h3>
                <p className="text-xs text-zinc-400">
                  Wybierz ćwiczenie, aby dodać je do {currentDay.name}
                </p>
              </div>
              <button
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-zinc-800 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  placeholder="Szukaj po nazwie (np. wyciskanie, przysiad, podciąganie)..."
                  className="w-full bg-zinc-950 border border-zinc-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Muscle Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {muscleGroups.map((mg) => (
                  <button
                    key={mg}
                    onClick={() => setMuscleFilter(mg)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      muscleFilter === mg
                        ? 'bg-emerald-500 text-black'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {mg === 'all' ? 'Wszystkie' : mg}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {filteredExercises.map((def) => (
                <div
                  key={def.id}
                  onClick={() => handleAddExerciseToCurrentDay(def)}
                  className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                        {def.muscleGroup}
                      </span>
                      <span className="text-[10px] text-zinc-500 capitalize">{def.category}</span>
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition mt-0.5">
                      {def.name}
                    </div>
                    <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{def.tips}</div>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-emerald-500 group-hover:text-black text-zinc-400 transition">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
