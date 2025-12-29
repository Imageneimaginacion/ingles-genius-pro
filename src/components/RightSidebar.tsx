import React from 'react';
import { motion } from 'framer-motion';
import { Level, LEVEL_ORDER } from '../types';
import { Flame, Gem, Heart, Zap, Check, Crown, Lock, Trophy } from 'lucide-react';
import LevelSelector from './LevelSelector';

interface RightSidebarProps {
    level: Level;
    setLevel: (l: Level) => void;
    xp: number;
    hearts: number;
    isPremium: boolean;
    togglePremium: () => void;
    progress?: {
        p1: number;
        p2: number;
    };
    unlockedIndex?: number;
    currentLevelProgress?: number;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
    level,
    setLevel,
    xp,
    hearts,
    isPremium,
    togglePremium,
    progress,
    unlockedIndex = 0,
    currentLevelProgress = 0
}) => {

    const p1Val = progress ? Math.min(progress.p1, 10) : 0;
    const p2Val = progress ? Math.min(progress.p2, 20) : 0;

    // Constants for progression
    const LESSONS_TO_UNLOCK_NEXT = 5;
    const progressPercent = Math.min(100, (currentLevelProgress / LESSONS_TO_UNLOCK_NEXT) * 100);
    const nextLevelName = LEVEL_ORDER[unlockedIndex + 1] ? LEVEL_ORDER[unlockedIndex + 1].split(' ')[0] : 'Max';

    return (
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col h-full text-space-text overflow-y-auto custom-scrollbar"
        >
            {/* Stats Header */}
            <div className="flex gap-6 mb-6 font-bold justify-end">
                <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-2 bg-space-card/50 px-3 py-1 rounded-full border border-space-light/30">
                    <Flame className="text-orange-500 fill-current" size={20} />
                    <span className="text-orange-500">2</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-2 bg-space-card/50 px-3 py-1 rounded-full border border-space-light/30">
                    <Gem className="text-space-secondary fill-current" size={20} />
                    <span className="text-space-secondary">{xp}</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-2 bg-space-card/50 px-3 py-1 rounded-full border border-space-light/30">
                    {isPremium ? (
                        <Heart className="text-space-accent fill-current" size={20} />
                    ) : (
                        <Heart className="text-space-error fill-current" size={20} />
                    )}
                    <span className={isPremium ? "text-space-accent" : "text-space-error"}>
                        {isPremium ? "∞" : hearts}
                    </span>
                </motion.div>
            </div>

            {/* Level Progress Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-space-card border border-space-primary/30 rounded-2xl p-5 mb-6 shadow-lg relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                    <Trophy size={60} />
                </div>
                <h3 className="text-sm font-bold text-space-muted uppercase tracking-wider mb-2">Siguiente Nivel</h3>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-extrabold text-white">{nextLevelName}</span>
                    <span className="text-space-primary font-bold">{currentLevelProgress}/{LESSONS_TO_UNLOCK_NEXT}</span>
                </div>
                <div className="h-3 bg-space-dark rounded-full overflow-hidden border border-space-light">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-space-secondary to-space-primary"
                    />
                </div>
                <p className="text-xs text-space-muted mt-2">Completa lecciones para desbloquear la siguiente fase.</p>
            </motion.div>

            <LevelSelector selectedLevel={level} onSelect={setLevel} unlockedIndex={unlockedIndex} />

            {/* Premium / Progress Status */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`border rounded-2xl p-6 mb-6 relative overflow-hidden transition-all text-left w-full ${isPremium
                    ? 'bg-space-card border-space-accent shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                    : 'bg-space-card border-space-light'
                    }`}
            >

                <div className="flex items-center gap-3 mb-3 relative z-10">
                    {isPremium ? <Crown className="text-space-accent fill-current" /> : <Lock className="text-space-muted" />}
                    <h3 className={`font-bold text-lg ${isPremium ? 'text-space-accent' : 'text-white'}`}>
                        {isPremium ? 'Premium Activo' : 'Estado: Cadete'}
                    </h3>
                </div>

                {!isPremium ? (
                    <div className="space-y-4 relative z-10">
                        <p className="text-xs text-space-muted">
                            Completa los niveles para desbloquear Premium gratis y obtener tu Certificado.
                        </p>

                        <div className="w-full py-2 bg-space-dark text-space-muted font-bold rounded-xl text-center text-xs mt-2 border border-space-light">
                            <Lock size={12} className="inline mr-1" /> BLOQUEADO
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <p className="text-space-muted text-sm mb-4">
                            Tienes acceso total. Vidas infinitas. Certificado otorgado.
                        </p>
                        <div className="w-full py-3 bg-space-accent text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                            <Check size={20} /> GENIUS LEVEL
                        </div>
                    </div>
                )}
            </motion.div>

            <footer className="mt-auto py-4 text-center text-xs text-space-muted font-bold uppercase">
                <p>Inglés Genius Pro © 2124</p>
            </footer>
        </motion.div>
    );
};

export default RightSidebar;