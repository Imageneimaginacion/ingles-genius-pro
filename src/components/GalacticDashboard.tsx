import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, BookOpen, Headphones, Home, Star, Lock, PlayCircle, Zap, Check, Rocket, Mic, Activity, Target } from 'lucide-react';
import { UserProfile } from '../types';
import { apiService } from '../services/api';

interface GalacticDashboardProps {
    user: UserProfile;
    onSelectCourse: (courseId: number) => void;
}

const GalacticDashboard: React.FC<GalacticDashboardProps> = ({ user, onSelectCourse }) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [trackStats, setTrackStats] = useState<any[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            const res = await apiService.getCourses();
            if (res.success) {
                setCourses(res.courses);
            }
        };
        fetchCourses();
    }, []);

    // Time-based Greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    // Determine Active Course: Find the first unlocked course not yet completed, or the last unlocked one.
    const activeCourseId = React.useMemo(() => {
        if (courses.length === 0) return 1;
        // Priority 1: First unlocked course that is NOT 100% complete
        const currentWork = courses.find(c => c.is_unlocked && (c.progress_percent || 0) < 100);
        if (currentWork) return currentWork.id;

        // Priority 2: If all unlocked are complete, show the highest level unlocked (the latest achievement)
        const lastUnlocked = [...courses].filter(c => c.is_unlocked).pop();
        return lastUnlocked ? lastUnlocked.id : 1;
    }, [courses]);

    // Calculate Global Progress & Current Level Display
    const activeCourse = courses.find(c => c.id === activeCourseId);

    // Calculate total progress across ALL courses
    const globalProgress = React.useMemo(() => {
        if (!courses.length) return 0;
        const totalMissionsAllCourses = courses.reduce((acc, c) => acc + (c.total_missions || 0), 0);
        const totalCompletedAllCourses = courses.reduce((acc, c) => acc + (c.completed_count || 0), 0);

        if (totalMissionsAllCourses === 0) return 0;
        return Math.round((totalCompletedAllCourses / totalMissionsAllCourses) * 100);
    }, [courses]);

    // Use active course level or user level fallback
    const headerLevel = activeCourse ? activeCourse.level : (user.level || 'A1');

    useEffect(() => {
        if (activeCourseId) {
            apiService.getSolarSystem(activeCourseId).then(res => {
                if (res.success && res.solar_system) {
                    // Map backend "solar_system" tracks to our display stats
                    const stats = res.solar_system.map((track: any) => {
                        const total = track.missions.length;
                        const completed = track.missions.filter((m: any) => m.status === 'completed').length;

                        let icon = BookOpen;
                        let color = 'text-blue-400';
                        let bar = 'bg-blue-500';

                        if (track.key === 'vocabulary') { icon = BookOpen; color = 'text-blue-400'; bar = 'bg-blue-500'; }
                        else if (track.key === 'grammar') { icon = Target; color = 'text-purple-400'; bar = 'bg-purple-500'; }
                        else if (track.key === 'listening') { icon = Headphones; color = 'text-green-400'; bar = 'bg-green-500'; }
                        else if (track.key === 'speaking') { icon = Mic; color = 'text-orange-400'; bar = 'bg-orange-500'; }

                        return {
                            id: track.id,
                            label: track.title, // or track.key capitalized
                            val: completed,
                            max: total,
                            icon, color, bar
                        };
                    });
                    setTrackStats(stats);
                }
            });
        }
    }, [activeCourseId]);

    return (
        <div className="min-h-screen w-full relative overflow-x-hidden bg-[#0F131A] text-white font-sans">
            {/* Subtle Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">

                {/* 1. STATE-DRIVEN HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-white/5 pb-8"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Sistema en Línea
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">{user.name}</span>
                            <span className="animate-pulse ml-2">🚀</span>
                        </h1>
                        <div className="flex items-center gap-4 text-gray-400 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                            <Activity size={16} className="text-blue-400" />
                            <span className="font-mono text-sm">Nivel Orbital <strong className="text-white">{headerLevel}</strong></span>
                            <span className="w-px h-4 bg-white/10"></span>
                            <span className="font-mono text-sm text-blue-300">{globalProgress}% Completado (Total)</span>
                        </div>
                    </div>

                    {/* 4. GAMIFICATION STATUS CAPSULE */}
                    <div className="flex gap-4">
                        <div className="group relative bg-[#151924] border border-white/10 hover:border-yellow-500/50 transition-colors rounded-2xl p-4 flex flex-col min-w-[140px]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-yellow-500"><Zap size={20} fill="currentColor" /></span>
                                <span className="text-[10px] uppercase text-gray-500 font-bold">Créditos</span>
                            </div>
                            <span className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">{user.coins}</span>
                            <span className="text-[10px] text-gray-500">50 para sig. rango</span>
                        </div>

                        <div className="group relative bg-[#151924] border border-white/10 hover:border-orange-500/50 transition-colors rounded-2xl p-4 flex flex-col min-w-[140px]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-orange-500"><Star size={20} fill="currentColor" /></span>
                                <span className="text-[10px] uppercase text-gray-500 font-bold">Racha</span>
                            </div>
                            <span className="text-2xl font-black text-white group-hover:text-orange-400 transition-colors">{user.streak?.current || 0} Días</span>
                            <span className="text-[10px] text-gray-500">¡Mantenla viva!</span>
                        </div>
                    </div>
                </motion.div>


                {/* 2. CTA PRINCIPAL / COURSE GRID */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-300 mb-6 flex items-center gap-2">
                        <Target size={20} className="text-blue-500" /> Elige tu próxima órbita
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-20">
                    {courses.map((course, index) => {
                        const isActive = course.id === activeCourseId;
                        const isLocked = !course.is_unlocked;

                        return (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative group rounded-3xl overflow-hidden transition-all duration-300 ${isActive
                                    ? 'lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-[#1a1f2e] to-[#151924] border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/10'
                                    : isLocked
                                        ? 'bg-[#0a0c10] border border-white/5 opacity-60 cursor-not-allowed'
                                        : 'bg-[#151924]/80 border border-white/5 hover:border-white/10 grayscale hover:grayscale-0 opacity-80 hover:opacity-100 cursor-pointer'
                                    }`}
                                onClick={() => !isLocked && onSelectCourse(course.id)}
                            >
                                {/* Active Glow Effect */}
                                {isActive && <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>}

                                <div className={`p-8 ${isActive ? 'md:p-10' : ''}`}>
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            {isActive && (
                                                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-500/20">
                                                    Misión Actual
                                                </span>
                                            )}
                                            <h3 className={`font-black text-white mb-2 leading-tight ${isActive ? 'text-4xl' : 'text-2xl text-gray-400 group-hover:text-white'}`}>
                                                {course.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm font-medium tracking-wide">
                                                {isActive ? "Tu próxima misión te espera. Sistemas listos." : (isLocked ? "Completa el sector anterior para desbloquear." : "Misión desbloqueada. Click para iniciar.")}
                                            </p>
                                        </div>
                                        <div className={`p-4 rounded-2xl ${isActive ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white/5'}`}>
                                            {isActive ? <Rocket className="text-white animate-pulse" size={32} /> : (isLocked ? <Lock className="text-gray-600" size={24} /> : <PlayCircle className="text-green-500" size={24} />)}
                                        </div>
                                    </div>

                                    {/* 3. VISUAL TRACK PROGRESS */}
                                    {isActive && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                            {trackStats.map((track) => (
                                                <div key={track.id} className="bg-[#0F131A] p-3 rounded-xl border border-white/5">
                                                    <div className={`p-2 w-full flex items-center gap-2 mb-2 ${track.color}`}>
                                                        <track.icon size={16} />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{track.label}</span>
                                                    </div>

                                                    {/* Segmented Bar */}
                                                    <div className="flex gap-1 h-1.5 w-full">
                                                        {[...Array(track.max)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`flex-1 rounded-full transition-all duration-500 ${i < track.val ? track.bar : 'bg-white/5'}`}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-2 text-right text-[10px] text-gray-500 font-mono">
                                                        {track.val}/{track.max}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <button
                                        onClick={() => !isLocked ? onSelectCourse(course.id) : null}
                                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 transition-all ${isActive
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99]'
                                            : isLocked
                                                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                                : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30'
                                            }`}
                                    >
                                        {isActive ? (
                                            <> <PlayCircle size={20} fill="currentColor" className="text-blue-200" /> CONTINUAR MISIÓN </>
                                        ) : isLocked ? (
                                            <> <Lock size={16} /> BLOQUEADO </>
                                        ) : (
                                            <> <PlayCircle size={20} fill="currentColor" className="text-green-200" /> MISIÓN DESBLOQUEADA </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GalacticDashboard;
