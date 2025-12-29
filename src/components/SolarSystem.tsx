import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { Lock, Check, Star, Play, Rocket } from 'lucide-react';
import { Card } from './ui/Card';

interface SolarSystemProps {
    courseId: number;
    onMissionSelect: (missionId: number) => void;
    onBack: () => void;
}

const ORBIT_COLORS = {
    vocabulary: '#4F46E5', // Indigo
    grammar: '#10B981',    // Emerald
    listening: '#F59E0B',  // Amber
    speaking: '#EC4899'    // Pink
};

const SolarSystem: React.FC<SolarSystemProps> = ({ courseId, onMissionSelect, onBack }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [courseId]);

    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            const maxOrbitSize = 800; // ample buffer for largest orbit
            const padding = 40;
            const availableWidth = window.innerWidth - padding;
            const availableHeight = window.innerHeight - 200; // Account for header/nav

            const scaleW = availableWidth / maxOrbitSize;
            const scaleH = availableHeight / maxOrbitSize;

            // Use the smaller scale to fit both dimensions, but cap at 1.0 to avoid upscaling blur
            const newScale = Math.min(Math.min(scaleW, scaleH), 1.0);
            setScale(Math.max(newScale, 0.4)); // Don't go too small
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await apiService.getSolarSystem(courseId);
        if (res.success) {
            setData(res);
        }
        setLoading(false);
    };

    if (loading) return <div className="text-white text-center p-20 animate-pulse">Scanning Solar System...</div>;
    if (!data) return <div className="text-red-500 text-center p-20">System Failure. Connection Lost.</div>;

    const tracks = data.solar_system;

    return (
        <div className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-black/40 rounded-3xl backdrop-blur-sm border border-white/5">

            {/* Scaled Container */}
            <div
                style={{ transform: `scale(${scale})` }}
                className="relative flex items-center justify-center transition-transform duration-300 ease-out origin-center"
            >
                {/* CENTRAL STAR (The Course) */}
                <div className="absolute z-10 flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-yellow-400 shadow-[0_0_50px_rgba(251,191,36,0.5)] animate-pulse-slow flex items-center justify-center">
                        <Rocket className="text-yellow-900 w-12 h-12" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-white tracking-widest uppercase text-shadow-glow whitespace-nowrap">
                        {data.course.title}
                    </h2>
                    <span className="text-yellow-400 font-mono text-sm">{data.course.level}</span>
                </div>

                {/* ORBITS */}
                <div className="relative w-[800px] h-[800px] flex items-center justify-center">
                    {tracks.map((track: any, idx: number) => {
                        // Calculate orbit size (increasing)
                        const size = 300 + (idx * 160);
                        const radius = size / 2;

                        // Dynamic Rotation Config
                        const duration = 40 + (idx * 20); // 40s, 60s, 80s...
                        const isEven = idx % 2 === 0;

                        return (
                            <motion.div
                                key={track.id}
                                className="absolute rounded-full border border-white/10 flex items-center justify-center pointer-events-none"
                                style={{
                                    width: size,
                                    height: size,
                                    borderColor: `${ORBIT_COLORS[track.key as keyof typeof ORBIT_COLORS]}40`
                                }}
                                animate={{ rotate: isEven ? 360 : -360 }}
                                transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
                            >
                                {/* Track Label - Counter Rotate to keep upright */}
                                <motion.div
                                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[50%] bg-black/60 px-2 py-1 rounded text-xs text-white/70 uppercase tracking-widest border border-white/10 whitespace-nowrap z-30 pointer-events-auto"
                                    animate={{ rotate: isEven ? -360 : 360 }}
                                    transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
                                >
                                    {track.title}
                                </motion.div>

                                {/* MISSIONS (Nodes) */}
                                {track.missions.map((mission: any, mIdx: number) => {
                                    // Distribute missions along the circle
                                    const totalMissions = track.missions.length;
                                    const angleStep = 360 / totalMissions;
                                    const angleDeg = (mIdx * angleStep) - 90;
                                    const angleRad = (angleDeg * Math.PI) / 180;

                                    const x = radius * Math.cos(angleRad); // Relative to center of orbit div
                                    const y = radius * Math.sin(angleRad); // Relative to center of orbit div

                                    const isLocked = mission.status === 'locked';
                                    const isCompleted = mission.status === 'completed';

                                    return (
                                        <motion.button
                                            key={mission.id}
                                            onClick={() => !isLocked && onMissionSelect(mission.id)}
                                            whileHover={!isLocked ? { scale: 1.2 } : {}}
                                            animate={{ rotate: isEven ? -360 : 360 }} // Counter-rotate node container to keep icon upright? Or let it spin? Let's counter-rotate for readability.
                                            transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
                                            className={`
                                                absolute w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors z-20 pointer-events-auto
                                                ${isLocked
                                                    ? 'bg-gray-800 border-gray-600 text-gray-400 cursor-not-allowed grayscale'
                                                    : isCompleted
                                                        ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                                                        : 'bg-white text-space-dark border-white shadow-[0_0_20px_white] animate-pulse-slow'
                                                }
                                            `}
                                            style={{
                                                left: `calc(50% + ${x}px - 24px)`, // Center + offset - half width
                                                top: `calc(50% + ${y}px - 24px)`,
                                                boxShadow: !isLocked && !isCompleted ? `0 0 15px ${ORBIT_COLORS[track.key as keyof typeof ORBIT_COLORS]}` : ''
                                            }}
                                            title={mission.title}
                                        >
                                            {isLocked ? <Lock size={16} /> : isCompleted ? <Check size={20} strokeWidth={3} /> : <Play size={20} fill="currentColor" />}
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <button onClick={onBack} className="absolute top-6 left-6 text-white/50 hover:text-white flex items-center gap-2 z-40 bg-black/50 px-3 py-1 rounded-full">
                ← Back to Galaxy Map
            </button>
        </div>
    );
};

export default SolarSystem;
