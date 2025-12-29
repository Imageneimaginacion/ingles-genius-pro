import React, { useState, useRef } from 'react';
import { UserProfile, Certificate } from '../types';
import { Camera, Award, Trophy, User, Scroll, Download, Share2, Star, Zap, Target, Rocket, Lock, Settings, Volume2, Bell, Moon, Sun, LogOut, Edit2, Check, Globe, Clock, Shield, BarChart2, Music, X, Save, Mail, Key, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';

import CertificateModal from '../components/CertificateModal';
import VictoryModal from '../components/VictoryModal';

interface AchievementsProps {
    user: UserProfile | null;
    onUpdateUser: (updates: Partial<UserProfile>) => void;
    onLogout?: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ user, onUpdateUser, onLogout }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewCert, setViewCert] = useState<Certificate | null>(null);
    const [showVictoryPreview, setShowVictoryPreview] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Profile Edit State
    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    // Settings State
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [notifEnabled, setNotifEnabled] = useState(true);

    if (!user) return <div className="text-white text-center mt-20">Inicia sesión.</div>;

    const isAdult = user.age >= 18;
    const userLevel = Math.floor((user?.achievements?.lessonsCompleted || 0) / 5) + 1;

    // Stats Calculation
    const totalXP = user.stats?.xp_total || ((user.achievements?.lessonsCompleted || 0) * 50 + (user.achievements?.wordsLearned || 0) * 10 + user.coins);
    const missionsCompleted = user.stats?.lessonsCompleted || user.achievements?.lessonsCompleted || 0;
    const wordsLearned = user.achievements?.wordsLearned || 0;
    const timeSpent = Math.round(missionsCompleted * 8.5);

    // Level Progress Calculation
    const currentLevelProgress = user.stats?.currentLevelProgress || 0;
    const LESSONS_PER_LEVEL = 5;
    const progressToNext = Math.min(100, Math.round((currentLevelProgress / LESSONS_PER_LEVEL) * 100));

    const avatars = [
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka",
        "https://api.dicebear.com/9.x/bottts/svg?seed=Robot1",
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Midnight",
        "https://api.dicebear.com/9.x/pixel-art/svg?seed=Gamer",
        "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Spooky",
        "https://api.dicebear.com/9.x/notionists/svg?seed=Leo",
        "https://api.dicebear.com/9.x/micah/svg?seed=Callie"
    ];

    const badgeList = [
        { id: 'b1', title: 'Primer Despegue', desc: 'Completa tu primera lección.', req: 1, key: 'lessonsCompleted' as keyof NonNullable<UserProfile['achievements']>, icon: Rocket },
        { id: 'b2', title: 'Cadete Espacial', desc: 'Completa 10 lecciones.', req: 10, key: 'lessonsCompleted' as keyof NonNullable<UserProfile['achievements']>, icon: Star },
        { id: 'b3', title: 'Tirador Preciso', desc: 'Obtén puntuación perfecta en 5 quizzes.', req: 5, key: 'quizPerfect' as keyof NonNullable<UserProfile['achievements']>, icon: Target },
        { id: 'b4', title: 'Enciclopedia Viva', desc: 'Aprende 50 palabras nuevas.', req: 50, key: 'wordsLearned' as keyof NonNullable<UserProfile['achievements']>, icon: Zap }
    ];

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                if (file.size > 2 * 1024 * 1024) {
                    alert("La imagen es muy grande. Intenta con una menor a 2MB.");
                    return;
                }
                onUpdateUser({ avatar: base64 });
                alert("Avatar actualizado y guardado.");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleShare = (title: string, text: string) => {
        const shareData = { title: `Inglés Genius Pro: ${title}`, text: text, url: window.location.href };
        if (navigator.share) navigator.share(shareData).catch((err) => console.log('Error sharing', err));
        else alert(`[SIMULACIÓN DE COMPARTIR]\n\n"${text}"`);
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        const updates: any = {};
        if (editForm.name !== user.name) updates.name = editForm.name;
        if (editForm.email !== user.email) updates.new_email = editForm.email;
        if (editForm.password) updates.password = editForm.password;

        if (Object.keys(updates).length > 0) {
            const res = await apiService.updateProfile(user.email, updates);
            if (res?.success) {
                const localUpdates: any = {};
                if (updates.name) localUpdates.name = updates.name;
                if (updates.new_email) localUpdates.email = updates.new_email;
                onUpdateUser(localUpdates);
                setShowEditModal(false);
                alert("Perfil actualizado exitosamente.");
            } else {
                alert("Error al actualizar perfil: " + (res?.error || "Desconocido"));
            }
        } else {
            setShowEditModal(false);
        }
        setLoading(false);
    };

    // --- STYLES ---
    const cardClass = isAdult
        ? 'bg-[#151924] border border-space-primary/30 shadow-lg'
        : 'bg-white border-2 border-white shadow-xl';

    const textPrimary = isAdult ? 'text-white' : 'text-space-dark';
    const textMuted = isAdult ? 'text-space-muted' : 'text-gray-500';

    return (
        <div className="animate-fade-in pb-32">

            {/* --- EDIT MODAL --- */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isAdult ? 'bg-[#151924] border border-space-primary' : 'bg-white border-2 border-purple-200'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-xl font-bold uppercase tracking-widest ${textPrimary}`}>Editar Perfil</h2>
                            <button onClick={() => setShowEditModal(false)}><X className={textMuted} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-1 ${textMuted}`}>Nombre</label>
                                <div className={`flex items-center gap-2 p-3 rounded-xl border ${isAdult ? 'bg-space-dark border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <User size={18} className={textMuted} />
                                    <input
                                        value={editForm.name}
                                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className={`bg-transparent outline-none w-full text-sm font-bold ${isAdult ? 'text-white' : 'text-gray-900'}`}
                                        placeholder="Tu Nombre"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-bold uppercase mb-1 ${textMuted}`}>Email / ID</label>
                                <div className={`flex items-center gap-2 p-3 rounded-xl border ${isAdult ? 'bg-space-dark border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <Mail size={18} className={textMuted} />
                                    <input
                                        value={editForm.email}
                                        onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                        className={`bg-transparent outline-none w-full text-sm font-bold ${isAdult ? 'text-white' : 'text-gray-900'}`}
                                        placeholder="Correo Electrónico"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-bold uppercase mb-1 ${textMuted}`}>Nueva Contraseña</label>
                                <div className={`flex items-center gap-2 p-3 rounded-xl border ${isAdult ? 'bg-space-dark border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <Key size={18} className={textMuted} />
                                    <input
                                        type="password"
                                        value={editForm.password}
                                        onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                        className={`bg-transparent outline-none w-full text-sm font-bold ${isAdult ? 'text-white' : 'text-gray-900'}`}
                                        placeholder="Dejar en blanco para mantener"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowEditModal(false)} className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs ${isAdult ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={loading}
                                className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs text-white flex items-center justify-center gap-2 shadow-lg ${isAdult ? 'bg-space-primary hover:bg-blue-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                            >
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CERTIFICATE MODAL --- */}
            <CertificateModal
                isOpen={!!viewCert}
                onClose={() => setViewCert(null)}
                userName={user.name}
                courseName={viewCert?.title || "Curso Completado"}
                date={viewCert?.date || new Date().toLocaleDateString()}
                level={viewCert?.level || user.level}
            />

            {/* Victory Preview */}
            {showVictoryPreview && (
                <VictoryModal
                    courseTitle="Inglés Básico A1"
                    onClose={() => setShowVictoryPreview(false)}
                />
            )}

            {/* --- HEADER --- */}
            <div className={`p-6 mb-8 sticky top-0 z-20 backdrop-blur-md bg-opacity-95 border-b flex items-center justify-between
          ${isAdult ? 'bg-[#0F131A]/90 border-space-light' : 'bg-white/90 border-white shadow-sm'}
      `}>
                <div className="flex items-center gap-3">
                    <User className={isAdult ? "text-space-primary" : "text-purple-500"} size={24} />
                    <h1 className={`text-xl font-extrabold uppercase tracking-widest ${textPrimary}`}>
                        {isAdult ? "Perfil de Usuario" : "Perfil de Cadete"}
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowVictoryPreview(true)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${isAdult ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10' : 'border-yellow-400 text-yellow-500 hover:bg-yellow-50'}`}>
                        <Trophy size={14} /> Ver Victoria
                    </button>
                    <button onClick={() => setShowEditModal(true)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${isAdult ? 'border-space-primary text-space-primary hover:bg-space-primary hover:text-white' : 'border-purple-300 text-purple-500 hover:bg-purple-50'}`}>
                        <Settings size={14} /> Editar Perfil
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT COLUMN: HERO & SETTINGS (lg:col-span-5) --- */}
                <div className="lg:col-span-5 space-y-6">

                    {/* PROFILE HERO CARD */}
                    <div className={`relative rounded-[2rem] p-8 overflow-hidden ${cardClass}`}>
                        {/* Decorative BG */}
                        {isAdult ? (
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(62,198,255,0.15),_transparent)] pointer-events-none"></div>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-kids opacity-10 pointer-events-none"></div>
                                <Star className="absolute top-4 right-4 text-yellow-300 animate-spin-slow" size={28} />
                                <Rocket className="absolute bottom-4 left-4 text-purple-300 opacity-50" size={24} />
                            </>
                        )}

                        <div className="flex flex-col items-center text-center relative z-10">
                            {/* Avatar */}
                            <div className="relative group mb-4 flex flex-col items-center">
                                {/* BADGE GLOW / CONTAINER */}
                                <div className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center mb-4 transition-all duration-500 relative
                                    ${user.activeBadge === 'badge_biz'
                                        ? 'bg-[#0F131A] border-[4px] border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,1)] ring-4 ring-yellow-400/40 scale-105'
                                        : user.activeBadge === 'frame_galaxy'
                                            ? 'bg-[#0F131A] border-[4px] border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,1)] ring-4 ring-cyan-400/40 scale-105'
                                            : user.activeBadge === 'mascot_hero'
                                                ? 'bg-blue-600 border-[4px] border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.8)] ring-4 ring-blue-500 scale-105'
                                                : (isAdult
                                                    ? 'bg-[#0F131A] border-2 border-space-primary shadow-[0_0_20px_rgba(62,198,255,0.3)]'
                                                    : 'bg-white border-4 border-yellow-400 shadow-xl')
                                    }
                                `}>
                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={48} className="opacity-50" />}

                                    {/* LIGHTNING BOLT FOR CEO BADGE */}
                                    {user.activeBadge === 'badge_biz' && (
                                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2 border-4 border-[#0F131A] text-black shadow-lg animate-pulse z-20">
                                            <Zap size={24} className="fill-current" />
                                        </div>
                                    )}

                                    {/* SPARKLES FOR GALAXY FRAME */}
                                    {user.activeBadge === 'frame_galaxy' && (
                                        <>
                                            <div className="absolute -top-2 -right-2 text-cyan-300 animate-spin-slow z-20"><Sparkles size={28} className="fill-current" /></div>
                                            <div className="absolute -bottom-2 -left-2 text-purple-400 animate-pulse z-20"><Sparkles size={20} className="fill-current" /></div>
                                        </>
                                    )}

                                    {/* SUPERHERO SUIT OVERLAY */}
                                    {user.activeBadge === 'mascot_hero' && (
                                        <>
                                            <div className="absolute -bottom-1 -right-1 text-4xl z-20 animate-bounce-slow filter drop-shadow-lg">🦸‍♂️</div>
                                            <div className="absolute top-0 left-0 w-full h-full border-4 border-red-500 rounded-full opacity-50 animate-ping pointer-events-none"></div>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105
                                    ${isAdult ? 'bg-space-primary' : 'bg-purple-500'}
                                `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Camera size={14} /> Subir Foto
                                        </div>
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </div>

                            {/* Name & Edit */}
                            <div className="flex items-center gap-2 mb-1 cursor-pointer group" onClick={() => setShowEditModal(true)}>
                                <h2 className={`text-3xl font-black ${textPrimary}`}>{user.name}</h2>
                                <Edit2 size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${textMuted}`} />
                            </div>

                            <p className={`text-sm font-bold uppercase tracking-widest mb-6 ${isAdult ? 'text-space-primary' : 'text-purple-500'}`}>
                                Nivel {userLevel} • {isAdult ? 'Operativo' : 'Cadete Espacial'}
                            </p>

                            {/* XP Progress Bar */}
                            <div className="w-full mb-6">
                                <div className={`flex justify-between text-xs font-bold uppercase mb-2 ${textMuted}`}>
                                    <span>Progreso XP</span>
                                    <span>{progressToNext}%</span>
                                </div>
                                <div className={`h-3 rounded-full overflow-hidden ${isAdult ? 'bg-[#0F131A] border border-gray-700' : 'bg-gray-100 border border-white'}`}>
                                    <div className={`h-full transition-all relative ${isAdult ? 'bg-space-primary shadow-[0_0_10px_#3EC6FF]' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`} style={{ width: `${progressToNext}%` }}>
                                        {!isAdult && <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>}
                                    </div>
                                </div>
                            </div>

                            {/* Avatar Grid */}
                            <div className="w-full">
                                <p className={`text-xs font-bold uppercase mb-3 text-left ${textMuted}`}>Seleccionar Avatar</p>
                                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {avatars.map((src, idx) => (
                                        <button key={idx} onClick={() => onUpdateUser({ avatar: src })} className={`w-12 h-12 rounded-full border-2 flex-shrink-0 overflow-hidden transition-all ${user.avatar === src ? (isAdult ? 'border-space-primary scale-110' : 'border-purple-500 scale-110') : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                            <img src={src} className="w-full h-full bg-gray-100" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SETTINGS CARD */}
                    <div className={`rounded-2xl p-6 ${cardClass}`}>
                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${textMuted}`}>
                            <Settings size={16} /> Configuración del Sistema
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Efectos de Sonido', sub: 'Audio del juego', state: soundEnabled, set: setSoundEnabled, icon: Volume2, color: 'text-blue-400' },
                                { label: 'Notificaciones', sub: 'Recordatorios diarios', state: notifEnabled, set: setNotifEnabled, icon: Bell, color: 'text-orange-400' }
                            ].map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isAdult ? 'bg-[#0F131A] hover:bg-gray-800' : 'bg-gray-50 hover:bg-blue-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isAdult ? 'bg-[#151924]' : 'bg-white shadow-sm'}`}>
                                            <item.icon size={18} className={isAdult ? item.color : 'text-gray-600'} />
                                        </div>
                                        <div>
                                            <div className={`font-bold text-sm ${textPrimary}`}>{item.label}</div>
                                            <div className={`text-xs ${textMuted}`}>{item.sub}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => item.set(!item.state)}
                                        className={`w-10 h-6 rounded-full relative transition-colors ${item.state ? (isAdult ? 'bg-space-primary' : 'bg-green-400') : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${item.state ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            ))}

                            {/* Mode Switch */}
                            <div className={`flex items-center justify-between p-3 rounded-xl ${isAdult ? 'bg-[#0F131A]' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isAdult ? 'bg-[#151924]' : 'bg-white shadow-sm'}`}>
                                        {isAdult ? <Moon size={18} className="text-purple-400" /> : <Sun size={18} className="text-yellow-500" />}
                                    </div>
                                    <div>
                                        <div className={`font-bold text-sm ${textPrimary}`}>{isAdult ? 'Modo Adulto' : 'Modo Niños'}</div>
                                        <div className={`text-xs ${textMuted}`}>Tema de UI</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!isAdult) {
                                            alert("¡Acceso restringido! Pide ayuda a tus padres para cambiar el modo.");
                                            return;
                                        }

                                        const newAge = isAdult ? 10 : 25;
                                        onUpdateUser({ age: newAge });
                                        if (newAge >= 18) document.documentElement.classList.add('theme-adult');
                                        else document.documentElement.classList.remove('theme-adult');
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isAdult ? 'border-space-primary text-space-primary hover:bg-space-primary hover:text-white' : 'border-purple-400 text-purple-600 hover:bg-purple-50 opacity-50 cursor-not-allowed'}`}
                                >
                                    {isAdult ? 'Cambiar' : 'Bloqueado'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: STATS & ACHIEVEMENTS (lg:col-span-7) --- */}
                <div className="lg:col-span-7 space-y-6">

                    {/* STATS OVERVIEW */}
                    <div className={`rounded-2xl p-6 ${cardClass}`}>
                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${textMuted}`}>
                            <BarChart2 size={16} /> Datos de Rendimiento
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total XP', val: totalXP, icon: Zap, color: 'text-yellow-400' },
                                { label: 'Misiones', val: missionsCompleted, icon: Rocket, color: 'text-blue-400' },
                                { label: 'Palabras', val: wordsLearned, icon: Globe, color: 'text-green-400' },
                                { label: 'Minutos', val: timeSpent, icon: Clock, color: 'text-purple-400' }
                            ].map((stat, i) => (
                                <div key={i} className={`p-4 rounded-xl text-center ${isAdult ? 'bg-[#0F131A] border border-gray-800' : 'bg-gray-50 border border-gray-100'}`}>
                                    <stat.icon size={24} className={`mx-auto mb-2 ${stat.color}`} />
                                    <div className={`text-xl font-black ${textPrimary}`}>{stat.val}</div>
                                    <div className={`text-[10px] uppercase font-bold ${textMuted}`}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BADGES */}
                    <div className={`rounded-2xl p-6 ${cardClass}`}>
                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${textMuted}`}>
                            <Award size={16} /> Insignias Ganadas
                        </h3>
                        <div className="grid gap-3">
                            {badgeList.map(badge => {
                                const current = user.achievements ? (user.achievements[badge.key] || 0) : 0;
                                const unlocked = current >= badge.req;
                                const progress = Math.min(100, (current / badge.req) * 100);

                                return (
                                    <div key={badge.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all
                                ${isAdult
                                            ? (unlocked ? 'bg-[#0F131A] border-space-primary/30' : 'bg-[#0F131A]/50 border-transparent opacity-50')
                                            : (unlocked ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-transparent opacity-60')
                                        }
                            `}>
                                        <div className={`p-3 rounded-full ${unlocked ? (isAdult ? 'bg-space-dark text-space-secondary' : 'bg-white shadow-sm text-yellow-500') : 'bg-gray-800 text-gray-600'}`}>
                                            {unlocked ? <badge.icon size={20} /> : <Lock size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h4 className={`text-sm font-bold ${textPrimary}`}>{badge.title}</h4>
                                                {!unlocked && <span className="text-[10px] font-bold opacity-60">{Math.round(progress)}%</span>}
                                            </div>
                                            {unlocked
                                                ? <p className={`text-[10px] ${isAdult ? 'text-space-primary' : 'text-green-600'}`}>Desbloqueado</p>
                                                : <div className="h-1.5 w-full bg-gray-700 rounded-full mt-2 overflow-hidden"><div className="h-full bg-space-primary" style={{ width: `${progress}%` }}></div></div>
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CERTIFICATES */}
                    <div className={`rounded-2xl p-6 ${cardClass}`}>
                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${textMuted}`}>
                            <Scroll size={16} /> Certificados
                        </h3>
                        {(!user.certificates || user.certificates.length === 0) ? (
                            <div className={`p-8 rounded-xl border border-dashed text-center flex flex-col items-center gap-3
                        ${isAdult ? 'border-gray-700 bg-[#0F131A]/50' : 'border-gray-300 bg-gray-50'}
                    `}>
                                <Award size={40} className="opacity-20" />
                                <p className={`text-xs font-bold uppercase ${textMuted}`}>Completa Fase 1 y 2 para desbloquear.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {user.certificates.map((cert) => (
                                    <div key={cert.id} onClick={() => setViewCert(cert)} className={`p-4 rounded-xl border cursor-pointer transition-transform hover:scale-[1.01] flex items-center justify-between
                                ${isAdult ? 'bg-[#0F131A] border-space-accent/40 hover:border-space-accent' : 'bg-yellow-50 border-yellow-200 hover:bg-white shadow-sm'}
                            `}>
                                        <div>
                                            <h4 className={`font-bold text-sm ${textPrimary}`}>{cert.title}</h4>
                                            <p className={`text-xs opacity-70 ${textMuted}`}>{cert.date}</p>
                                        </div>
                                        <Award className={isAdult ? "text-space-accent" : "text-yellow-500"} size={24} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-12 flex justify-center">
                <button
                    onClick={onLogout}
                    className={`px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-widest border-2 transition-all flex items-center gap-3 shadow-lg
                  ${isAdult
                            ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                            : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'
                        }
              `}
                >
                    <LogOut size={20} /> Cerrar Sesión
                </button>
            </div>

        </div>
    );
};

export default Achievements;