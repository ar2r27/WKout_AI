import React, { useState } from 'react';
import {
  User,
  Dumbbell,
  Target,
  Clock,
  ShieldAlert,
  Save,
  Sparkles,
  Check,
  Plus,
  Cpu
} from 'lucide-react';
import { UserProfile } from '../types';
import { EQUIPMENT_OPTIONS } from '../data/exercises';

interface ProfileViewProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onAskCoachToAdaptPlan: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onSaveProfile,
  onAskCoachToAdaptPlan
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [customEquipInput, setCustomEquipInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleEquipment = (equipId: string) => {
    setFormData((prev) => {
      const exists = prev.equipment.includes(equipId);
      const updated = exists
        ? prev.equipment.filter((id) => id !== equipId)
        : [...prev.equipment, equipId];
      return { ...prev, equipment: updated };
    });
  };

  const selectAllEquipment = () => {
    setFormData((prev) => ({
      ...prev,
      equipment: EQUIPMENT_OPTIONS.map((e) => e.id)
    }));
  };

  const selectHomeDumbbellsOnly = () => {
    setFormData((prev) => ({
      ...prev,
      equipment: ['dumbbells', 'bench', 'resistance_bands', 'bodyweight']
    }));
  };

  const selectBodyweightOnly = () => {
    setFormData((prev) => ({
      ...prev,
      equipment: ['bodyweight', 'pullup_bar', 'resistance_bands']
    }));
  };

  const addCustomEquipment = () => {
    if (!customEquipInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      customEquipment: [...prev.customEquipment, customEquipInput.trim()]
    }));
    setCustomEquipInput('');
  };

  const removeCustomEquipment = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      customEquipment: prev.customEquipment.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = () => {
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // BMI calculation
  const heightM = (formData.height || 180) / 100;
  const bmi = (formData.weight / (heightM * heightM)).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" /> Profil, Cele & Maszyny
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Na tej podstawie Twój Trener AI dobiera odpowiednie ćwiczenia, objętość i maszyny.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow-green'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" /> Zapisano!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Zapisz Profil
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Basic Bio */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" /> Parametry Ciała
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Imię</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Wiek (lata)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 20 })}
                className="w-full bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Waga (kg)</label>
              <input
                type="number"
                step="0.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 70 })}
                className="w-full bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Wzrost (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 175 })}
                className="w-full bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500 pt-3 border-t border-zinc-800">
            <span>
              Szacowane BMI: <strong className="text-emerald-400 font-mono">{bmi}</strong>
            </span>
            <span>•</span>
            <span>Zapotrzebowanie kaloryczne kalkulowane dynamicznie przez AI</span>
          </div>
        </div>

        {/* 2. Goal and Experience */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" /> Główny Cel & Doświadczenie
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2">Główny Cel:</label>
              <div className="space-y-1.5">
                {[
                  { id: 'hypertrophy', label: 'Budowa Masy Mięśniowej (Hipertrofia)', desc: 'Maksymalizacja objętości i kształt mięśni' },
                  { id: 'fat_loss', label: 'Redukcja / Rzeźba (Spalanie tłuszczu)', desc: 'Deficyt, zachowanie siły i gęstość' },
                  { id: 'strength', label: 'Siła Maksymalna (Trójbój / Wielostawy)', desc: 'Progresja ciężaru 1RM' },
                  { id: 'endurance', label: 'Wytrzymałość & Kondycja', desc: 'Wydolność tlenowa i beztlenowa' },
                  { id: 'calisthenics', label: 'Kalistenika & Masa Własnego Ciała', desc: 'Dipy, podciąganie, muscle-up' }
                ].map((g) => (
                  <label
                    key={g.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                      formData.goal === g.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="goal"
                      checked={formData.goal === g.id}
                      onChange={() => setFormData({ ...formData, goal: g.id as any })}
                      className="mt-1 text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{g.label}</div>
                      <div className="text-[11px] text-zinc-500">{g.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2">
                Poziom Zaawansowania:
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'beginner', label: 'Początkujący (0 - 1 rok)', desc: 'Nauka techniki, adaptacja układu nerwowego' },
                  { id: 'intermediate', label: 'Średniozaawansowany (1 - 3 lata)', desc: 'Znajomość ćwiczeń, stała progresja' },
                  { id: 'advanced', label: 'Zaawansowany (3+ lata)', desc: 'Zaawansowana periodyzacja, praca blisko upadku' }
                ].map((lvl) => (
                  <label
                    key={lvl.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                      formData.experience === lvl.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="experience"
                      checked={formData.experience === lvl.id}
                      onChange={() => setFormData({ ...formData, experience: lvl.id as any })}
                      className="mt-1 text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{lvl.label}</div>
                      <div className="text-[11px] text-zinc-500">{lvl.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Weekly Frequency & Duration */}
              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
                    <span>Częstotliwość w tygodniu:</span>
                    <span className="text-emerald-400 font-bold">{formData.daysPerWeek} dni</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={formData.daysPerWeek}
                    onChange={(e) =>
                      setFormData({ ...formData, daysPerWeek: parseInt(e.target.value) })
                    }
                    className="w-full accent-emerald-500 bg-zinc-950 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>2 dni</span>
                    <span>3 dni</span>
                    <span>4 dni</span>
                    <span>5 dni</span>
                    <span>6 dni</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
                    <span>Długość sesji treningowej:</span>
                    <span className="text-emerald-400 font-bold">{formData.sessionDuration} minut</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[45, 60, 75, 90].map((min) => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => setFormData({ ...formData, sessionDuration: min })}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                          formData.sessionDuration === min
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {min} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Available Equipment & Machines */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" /> Dostępny Sprzęt & Maszyny
              </h3>
              <p className="text-xs text-zinc-400">
                Zaznacz maszyny i przyrządy, do których masz dostęp na swojej siłowni lub w domu:
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={selectAllEquipment}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cała Siłownia
              </button>
              <button
                type="button"
                onClick={selectHomeDumbbellsOnly}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Hantle w domu
              </button>
              <button
                type="button"
                onClick={selectBodyweightOnly}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Masa ciała
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {EQUIPMENT_OPTIONS.map((item) => {
              const isChecked = formData.equipment.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleEquipment(item.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between select-none ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/60 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-750'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{item.name}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : 'border-zinc-700'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Equipment user addition */}
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-400 mb-2">
              Inne niestandardowe maszyny / sprzęt:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customEquipInput}
                onChange={(e) => setCustomEquipInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomEquipment())}
                placeholder="np. Maszyna do Hack-Przysiadów, Trap Bar, AirBike..."
                className="flex-1 bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addCustomEquipment}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Dodaj
              </button>
            </div>

            {formData.customEquipment.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.customEquipment.map((eq, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs flex items-center gap-1.5"
                  >
                    {eq}
                    <button
                      onClick={() => removeCustomEquipment(idx)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Limitations and Injuries */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-4 h-4" /> Bóle, Kontuzje & Ograniczenia Ruchowe
          </h3>
          <p className="text-xs text-zinc-400 mb-3">
            Trener AI automatycznie wykluczy ćwiczenia obciążające te stawy i dobierze bezpieczne zamienniki.
          </p>

          <textarea
            value={formData.injuries}
            onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
            placeholder="np. Ból w prawym kolanie przy głębokim zgięciu, unikać klasycznych przysiadów; lekki ból w odcinku lędźwiowym..."
            className="w-full bg-zinc-950 border border-zinc-750 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 h-24 resize-none"
          />
        </div>

        {/* Final CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-green transition"
          >
            <Save className="w-4 h-4" /> Zapisz Profil
          </button>

          <button
            onClick={() => {
              handleSave();
              onAskCoachToAdaptPlan();
            }}
            className="flex-1 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-emerald-400 font-extrabold text-sm flex items-center justify-center gap-2 border border-emerald-500/30 transition shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> Zapisz i poproś Trenera AI o dopasowanie planu
          </button>
        </div>
      </div>
    </div>
  );
};
