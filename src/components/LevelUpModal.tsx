import React, { useEffect, useState } from 'react';
import { Level } from '../types';
import { Battery, BatteryMedium, Zap, Star, Award, ArrowUp, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  oldLevel: Level;
  newLevel: Level;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ oldLevel, newLevel, onClose }) => {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  // Helper to get visual props based on level string
  const getLevelVisuals = (lvl: Level) => {
    if (lvl.includes('A1')) return { icon: Battery, color: 'text-green-400', bg: 'bg-green-400', label: 'A1' };
    if (lvl.includes('A2')) return { icon: BatteryMedium, color: 'text-green-500', bg: 'bg-green-500', label: 'A2' };
    if (lvl.includes('B1')) return { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400', label: 'B1' };
    if (lvl.includes('B2')) return { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500', label: 'B2' };
    if (lvl.includes('C1')) return { icon: Star, color: 'text-purple-400', bg: 'bg-purple-400', label: 'C1' };
    return { icon: Award, color: 'text-purple-600', bg: 'bg-purple-600', label: 'C2' };
  };

  const OldIcon = getLevelVisuals(oldLevel).icon;
  const NewIcon = getLevelVisuals(newLevel).icon;
  const newVisuals = getLevelVisuals(newLevel);

  useEffect(() => {
    // SEQUENCE:
    // 0ms: Mount
    // 100ms: Phase 1 (Show Old Level, Start Shaking)
    // 2500ms: Phase 2 (Explosion Flash)
    // 2600ms: Phase 3 (Show New Level Slam)
    // 3500ms: Phase 4 (Buttons & Text appear)
    
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => setPhase(3), 2600);
    const t4 = setTimeout(() => setPhase(4), 3500);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ${phase >= 1 ? 'opacity-90' : 'opacity-0'}`}></div>

      {/* PHASE 2: SUPERNOVA FLASH */}
      {phase === 2 && (
        <div className="absolute inset-0 bg-white z-[210] animate-supernova pointer-events-none"></div>
      )}

      <div className="relative z-[220] flex flex-col items-center w-full max-w-lg p-4">
        
        {/* PHASE 1: OLD LEVEL DESTRUCTION */}
        {phase === 1 && (
          <div className="flex flex-col items-center animate-shake-hard">
            <div className="text-space-muted font-bold text-xl uppercase tracking-widest mb-4 opacity-80">Sector Completado</div>
            <div className="w-40 h-40 rounded-full bg-space-card border-4 border-gray-600 flex items-center justify-center shadow-2xl grayscale relative overflow-hidden">
               <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
               <OldIcon size={80} className="text-gray-400" />
            </div>
            <h2 className="text-4xl font-black text-gray-500 mt-6 line-through opacity-50">{oldLevel.split(' ')[0]}</h2>
          </div>
        )}

        {/* PHASE 3: NEW LEVEL REVEAL */}
        {phase >= 3 && (
          <div className="flex flex-col items-center">
            {/* Particle Effects (Simplified CSS) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full ${newVisuals.bg}`} 
                         style={{
                             transform: `rotate(${i * 30}deg) translate(150px)`,
                             animation: `ping 1s ease-out ${i * 0.1}s infinite`
                         }}
                    ></div>
                ))}
            </div>

            {/* SHOCKWAVE RING */}
            <div className={`absolute top-24 w-64 h-64 rounded-full border-4 ${newVisuals.color.replace('text', 'border')} animate-shockwave opacity-0`}></div>

            {/* ICON CONTAINER */}
            <div className={`
                w-48 h-48 rounded-full bg-space-dark border-4 ${newVisuals.color.replace('text', 'border')} 
                flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.5)] 
                relative overflow-hidden
                animate-bounce
            `}>
               <div className={`absolute inset-0 ${newVisuals.bg} opacity-20 blur-xl animate-pulse`}></div>
               <NewIcon size={100} className={`${newVisuals.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]`} />
               
               {/* Shine */}
               <div className="absolute -top-10 -left-10 w-32 h-60 bg-white opacity-20 rotate-45 blur-lg animate-float"></div>
            </div>

            {/* TEXT REVEAL */}
            <div className={`mt-8 text-center transition-all duration-700 transform ${phase >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowUp className="text-green-400 w-8 h-8 animate-bounce" />
                    <h3 className="text-green-400 font-bold text-xl uppercase tracking-widest">Nivel Ascendido</h3>
                </div>
                
                <h1 className={`text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-2 drop-shadow-lg`}>
                    {newVisuals.label}
                </h1>
                <p className="text-space-secondary text-lg font-bold tracking-wide uppercase">{newLevel.split('-')[1]?.trim() || 'Advanced'}</p>
            </div>

            {/* STATS & BUTTON */}
            {phase >= 4 && (
                <div className="mt-10 w-full animate-fade-in">
                    <div className="flex justify-center gap-6 mb-8">
                        <div className="bg-space-card border border-space-primary p-4 rounded-2xl flex flex-col items-center min-w-[100px] shadow-lg transform hover:scale-110 transition-transform">
                            <Sparkles className="text-yellow-400 mb-2" />
                            <span className="text-2xl font-bold text-white">+200</span>
                            <span className="text-xs text-space-muted uppercase font-bold">XP Bonus</span>
                        </div>
                        <div className="bg-space-card border border-space-secondary p-4 rounded-2xl flex flex-col items-center min-w-[100px] shadow-lg transform hover:scale-110 transition-transform">
                            <Award className="text-space-secondary mb-2" />
                            <span className="text-2xl font-bold text-white">Nuevo</span>
                            <span className="text-xs text-space-muted uppercase font-bold">Rango</span>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full bg-white hover:bg-gray-100 text-space-dark font-black text-xl py-5 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)] uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95"
                    >
                        Continuar Misión
                    </button>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelUpModal;