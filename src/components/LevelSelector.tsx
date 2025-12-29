
import React from 'react';
import { Level, LEVEL_ORDER } from '../types';
import { Check, Star, Zap, Award, Battery, BatteryMedium, Lock, ArrowUpCircle } from 'lucide-react';

interface LevelSelectorProps {
  selectedLevel: Level;
  onSelect: (level: Level) => void;
  unlockedIndex: number; // 0 to 5
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ selectedLevel, onSelect, unlockedIndex }) => {
  const levels = [
    {
      id: Level.A1,
      label: "A1 - Intro",
      icon: <Battery className="w-6 h-6 text-green-400" />,
      desc: "Presentarse, información básica."
    },
    {
      id: Level.A2,
      label: "A2 - Básico",
      icon: <BatteryMedium className="w-6 h-6 text-green-500" />,
      desc: "Rutinas diarias, entorno inmediato."
    },
    {
      id: Level.B1,
      label: "B1 - Intermedio",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      desc: "Viajes, opiniones simples, textos."
    },
    {
      id: Level.B2,
      label: "B2 - Alto",
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      desc: "Fluidez con nativos, ideas complejas."
    },
    {
      id: Level.C1,
      label: "C1 - Avanzado",
      icon: <Star className="w-6 h-6 text-purple-400" />,
      desc: "Social, académico, profesional."
    },
    {
      id: Level.C2,
      label: "C2 - Experto",
      icon: <Award className="w-6 h-6 text-purple-600" />,
      desc: "Dominio casi nativo y preciso."
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-space-muted font-bold text-sm uppercase mb-3 tracking-widest">Seleccionar Nivel CEFR</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {levels.map((lvl, index) => {
          const isLocked = index > unlockedIndex;
          const isCompleted = index < unlockedIndex;
          
          return (
            <button
              key={lvl.id}
              onClick={() => !isLocked && onSelect(lvl.id)}
              disabled={isLocked}
              className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                isLocked 
                  ? 'border-space-light bg-space-dark opacity-60 cursor-not-allowed grayscale' 
                  : selectedLevel === lvl.id
                    ? 'border-space-primary bg-space-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.3)] scale-105 z-10'
                    : 'border-space-light bg-space-card hover:border-space-secondary hover:scale-[1.02]'
              }`}
            >
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 rounded-xl backdrop-blur-[1px]">
                   <Lock className="text-space-muted" size={24} />
                </div>
              )}

              <div className="flex justify-between items-start mb-1">
                <div className={`p-1.5 rounded-lg border border-space-light ${isCompleted ? 'bg-space-success/20 border-space-success' : 'bg-space-dark'}`}>
                  {isCompleted ? <Check size={20} className="text-space-success" /> : lvl.icon}
                </div>
                {selectedLevel === lvl.id && (
                  <div className="bg-space-primary rounded-full p-0.5 text-white animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <h3 className={`font-bold text-sm ${isLocked ? 'text-space-muted' : 'text-white'}`}>{lvl.label}</h3>
              <p className="text-xs text-space-muted mt-1 leading-tight line-clamp-2">{lvl.desc}</p>
              
              {isCompleted && !isLocked && (
                  <div className="mt-2 text-[10px] font-bold text-space-success uppercase flex items-center gap-1">
                      <Check size={10} /> Completado
                  </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelector;
