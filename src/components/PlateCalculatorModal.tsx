import React, { useState } from 'react';
import { X, Calculator, AlertCircle } from 'lucide-react';

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeight?: number;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialWeight = 60
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight);
  const [barWeight, setBarWeight] = useState<number>(20); // standard Olympic barbell

  if (!isOpen) return null;

  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];

  const calculatePlates = () => {
    let remainingPerSide = Math.max(0, (targetWeight - barWeight) / 2);
    const result: { weight: number; count: number }[] = [];

    for (const plate of availablePlates) {
      if (remainingPerSide >= plate) {
        const count = Math.floor(remainingPerSide / plate);
        result.push({ weight: plate, count });
        remainingPerSide = Math.round((remainingPerSide - count * plate) * 100) / 100;
      }
    }

    return {
      platesPerSide: result,
      remainder: remainingPerSide
    };
  };

  const { platesPerSide, remainder } = calculatePlates();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kalkulator Talerzy</h3>
              <p className="text-xs text-zinc-400">Ile założyć na każdą stronę sztangi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Docelowy ciężar (kg)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="2.5"
                min={barWeight}
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-2 text-xl font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-1">
                {[-5, +2.5, +5].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => setTargetWeight((prev) => Math.max(barWeight, prev + delta))}
                    className="px-2.5 py-2 text-xs font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Waga gryfu (sztangi)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[20, 15, 10].map((w) => (
                <button
                  key={w}
                  onClick={() => setBarWeight(w)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    barWeight === w
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-zinc-850 border-zinc-750 text-zinc-400 hover:text-white'
                  }`}
                >
                  {w} kg {w === 20 ? '(Olimp.)' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-5 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
          <div className="text-xs font-medium text-zinc-400 mb-2">
            Na każdą ze stron nałóż:
          </div>

          {platesPerSide.length === 0 ? (
            <div className="text-sm text-zinc-500 italic py-2">
              Tylko sam gryf ({barWeight} kg), bez dodatkowych talerzy.
            </div>
          ) : (
            <div className="space-y-2">
              {platesPerSide.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded-full ${
                        item.weight >= 20
                          ? 'bg-blue-500'
                          : item.weight >= 15
                          ? 'bg-yellow-500'
                          : item.weight >= 10
                          ? 'bg-green-500'
                          : 'bg-zinc-400'
                      }`}
                    />
                    <span className="font-bold text-white text-sm">{item.weight} kg</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    x {item.count} {item.count > 1 ? 'sztuki' : 'sztuka'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {remainder > 0 && (
            <p className="text-[11px] text-amber-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Zostaje {remainder * 2}kg do pełnego ciężaru (potrzebne mniejsze talerze mikro).</span>
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition"
        >
          Gotowe
        </button>
      </div>
    </div>
  );
};
