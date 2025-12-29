import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import { Level, AppMode, UserProfile, ShopItem, LEVEL_ORDER, VocabularyItem, DailyChallenge } from './types';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import LessonGenerator from './pages/LessonGenerator';
import ChatTutor from './pages/ChatTutor';
import Shop from './pages/Shop';
import Achievements from './pages/Achievements';
import ReviewCenter from './pages/ReviewCenter';
import VideoStudio from './pages/VideoStudio';
import MobileNav from './components/MobileNav';
import OnboardingTutorial from './components/OnboardingTutorial';
import PlacementTest from './components/PlacementTest';
import LevelUpModal from './components/LevelUpModal';
import LandingPage from './components/LandingPage';
import OnboardingFlow from './components/OnboardingFlow';
import AuthScreen from './components/AuthScreen';
import GalacticDashboard from './components/GalacticDashboard';
import SolarSystem from './components/SolarSystem';
import MissionPlayer from './components/MissionPlayer'; // New Mission Player
import { Briefcase, Rocket } from 'lucide-react';
import { apiService } from './services/api';

// --- NORMALIZATION HELPERS ---
function safeJsonParse<T>(value: any, fallback: T): T {
    try {
        if (typeof value === "string") return JSON.parse(value) as T;
        return (value as T) ?? fallback;
    } catch {
        return fallback;
    }
}

function normalizeUserFromApi(userData: any): UserProfile {
    // Handle backend sending "stats" object vs flat fields
    const stats = userData.stats || {};

    // Credits: backend uses 'credits', frontend uses 'coins' (or 'credits' in some places)
    // We map backend 'credits' to frontend 'coins' for continuity
    const coins = typeof userData.coins === "number" ? userData.coins : (typeof userData.credits === "number" ? userData.credits : (stats.credits || 0));
    const xp = typeof userData.xp === "number" ? userData.xp : (stats.xp_total || 0);

    const rawStreak = userData.streak ?? stats.streak;
    const streak =
        typeof rawStreak === "number"
            ? {
                current: rawStreak,
                best: rawStreak,
                lastLoginDate: new Date().toISOString().slice(0, 10),
            }
            : rawStreak ?? { current: 0, best: 0, lastLoginDate: null };

    const inventory =
        Array.isArray(userData.inventory)
            ? userData.inventory
            : safeJsonParse<string[]>(userData.inventory, []);

    return {
        id: userData.id ?? String(Date.now()),
        name: userData.name ?? "Astronauta",
        email: userData.email ?? "",
        age: userData.age ?? 0,
        avatar: userData.avatar ?? null,
        theme: userData.theme ?? "default",
        activeBadge: userData.activeBadge ?? null,

        level: userData.level ?? Level.A1,
        placementTestCompleted: !!userData.placementTestCompleted,

        coins,
        xp,

        streak,
        achievements: userData.achievements || {
            lessonsCompleted: stats.missions_completed || 0,
            wordsLearned: stats.words_learned || 0,
            quizPerfect: 0
        },
        inventory,

        vocabularyBank: Array.isArray(userData.vocabularyBank) ? userData.vocabularyBank : [],
        dailyChallenges: Array.isArray(userData.dailyChallenges) ? userData.dailyChallenges : [],

        isPremium: !!userData.isPremium,
        challengeDate: userData.challengeDate ?? null,
        unlockedLevelIndex: userData.unlockedLevelIndex ?? 0,
        unlockedLevels: Array.isArray(userData.unlockedLevels) ? userData.unlockedLevels : [],
        completedMissions: Array.isArray(userData.completedMissions) ? userData.completedMissions : [],
        certificates: Array.isArray(userData.certificates) ? userData.certificates : [],
    };
}

const STARTER_AVATARS = [
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/9.x/bottts/svg?seed=Robot1",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Midnight"
];

const App: React.FC = () => {
    // --- STATE DEFINITIONS ---
    const [mode, setMode] = useState<AppMode>('learn');
    const [level, setLevel] = useState<Level>(Level.A1);

    // NEW LMS STATE
    const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
    const [activeMissionId, setActiveMissionId] = useState<number | null>(null);

    // Temporary local state for immediate UI updates, synced with user profile
    const [xp, setXp] = useState(0);
    const [coins, setCoins] = useState(0);
    const [hearts, setHearts] = useState(20);

    const [user, setUser] = useState<UserProfile | null>(null);

    // Navigation State
    // Default to 'loading' ONLY if token exists
    const [viewState, setViewState] = useState<'landing' | 'onboarding' | 'auth' | 'app' | 'loading'>(() => {
        return localStorage.getItem('token') ? 'loading' : 'landing';
    });

    // Registration / Login State
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [regAge, setRegAge] = useState('25');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [loginPreviewMode, setLoginPreviewMode] = useState<'adult' | 'kid'>('adult');
    const [showPassword, setShowPassword] = useState(false);

    const [showWelcomeBack, setShowWelcomeBack] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState<{ old: Level, new: Level } | null>(null);

    // Context from Onboarding
    const [onboardingData, setOnboardingData] = useState<any>(null);

    // --- HELPER FUNCTIONS ---

    const generateDailyChallenges = (): DailyChallenge[] => {
        return [
            {
                id: `dc_${Date.now()}_1`,
                description: "Completa 1 Misión",
                target: 1, current: 0, completed: false,
                rewardXP: 50, rewardCoins: 20, type: 'lesson'
            },
            {
                id: `dc_${Date.now()}_2`,
                description: "Obtén 80% o más en un Quiz",
                target: 1, current: 0, completed: false,
                rewardXP: 30, rewardCoins: 15, type: 'quiz_score'
            },
            {
                id: `dc_${Date.now()}_3`,
                description: "Usa el Chat Tutor",
                target: 1, current: 0, completed: false,
                rewardXP: 20, rewardCoins: 10, type: 'speak'
            }
        ];
    };

    const togglePreviewMode = () => {
        setLoginPreviewMode(prev => {
            const next = prev === 'adult' ? 'kid' : 'adult';
            if (next === 'adult') document.documentElement.classList.add('theme-adult');
            else document.documentElement.classList.remove('theme-adult');
            return next;
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('user_profile');
        localStorage.removeItem('token'); // Clear auth token
        setUser(null);
        setViewState('landing');
        setMode('learn');
        setAuthMode('signin');
        setActiveCourseId(null);
        setActiveMissionId(null);
        document.documentElement.classList.remove('theme-adult');
    };

    const loadUserFromBackend = (userData: any) => {
        const safeUser = normalizeUserFromApi(userData);

        if (safeUser.age >= 18) document.documentElement.classList.add('theme-adult');
        else document.documentElement.classList.remove('theme-adult');

        setUser(safeUser);
        setCoins(safeUser.coins);
        setXp(safeUser.xp);

        // Try to set level from index if available, else default
        if (typeof safeUser.unlockedLevelIndex === 'number') {
            setLevel(LEVEL_ORDER[safeUser.unlockedLevelIndex] || Level.A1);
        }

        localStorage.setItem('user_profile', JSON.stringify(safeUser));
        setViewState('app');
    };

    const handleAuthAction = async (data?: any) => {
        // --- 1. GOOGLE LOGIN (REAL BACKEND) ---
        if (data?.google && data?.token) {
            try {
                const decoded: any = jwtDecode(data.token);
                const googleData = {
                    token: data.token,
                    email: decoded.email,
                    name: decoded.name,
                    google_id: decoded.sub,
                    picture: decoded.picture
                };

                const res = await apiService.googleLogin(googleData);
                if (res.success && res.user) {
                    loadUserFromBackend(res.user);
                } else {
                    alert("Google Error: " + (res.error || "Server connection failed"));
                }
            } catch (error) {
                console.error("Token Decode Error", error);
                alert("Could not verify Google Secure Token");
            }
            return;
        }

        // --- 2. STANDARD AUTH WITH FASTAPI BACKEND ---
        const name = data?.name || regName;
        const email = data?.email || regEmail;
        const password = data?.password || regPassword;
        const confirmPassword = data?.confirmPassword || regConfirmPassword;
        const age = parseInt(data?.age || regAge || "0");
        const accepted = data?.termsAccepted !== undefined ? data.termsAccepted : termsAccepted;

        if (!name && authMode === 'signup') return;
        if (!email && authMode === 'signin') { alert("Please enter email"); return; }

        if (authMode === 'signup') {
            if (!password || !confirmPassword) { alert("Missing password"); return; }
            if (password !== confirmPassword) { alert("Passwords do not match"); return; }
            if (!accepted) { alert("Accept terms"); return; }

            // CALL REGISTER API
            // Merge onboarding data if available
            const payload = {
                name,
                email,
                password,
                age,
                ...onboardingData
            };

            const res = await apiService.register(payload);
            if (res.success) {
                // Auto Login after register
                const loginRes = await apiService.login({ email, password });
                if (loginRes.success) {
                    // Start fresh flow
                    loadUserFromBackend(loginRes.user);
                }
            } else {
                console.error("Registration Error Payload:", res);
                const errorMsg = typeof res.error === 'string' ? res.error : JSON.stringify(res.error || "Unknown Error");
                alert("Error de Registro: " + errorMsg + "\nVerifica que el correo no esté en uso.");
            }
        } else {
            // CALL LOGIN API
            const res = await apiService.login({ email, password });
            if (res.success) {
                loadUserFromBackend(res.user);
            } else {
                alert("Login failed: " + (res.error || "Check credentials"));
            }
        }
    };

    const handleUpdateUser = (updates: Partial<UserProfile>) => {
        if (user) {
            const updated = { ...user, ...updates };
            setUser(updated);
            localStorage.setItem('user_profile', JSON.stringify(updated));

            // Force visual update for theme immediately
            if (updates.theme) {
                document.documentElement.className = '';
                if (updates.theme === 'midnight') document.documentElement.classList.add('theme-midnight');
                if (updates.theme === 'adult') document.documentElement.classList.add('theme-adult');
            }

            if (user.email) {
                // Ensure we send only what's needed or strictly what changed to avoid overwrites
                // Specifically passing avatar and theme if present
                const payload: any = { ...updates };
                // If updates contains avatar, ensure it's sent
                if (updates.avatar) payload.avatar = updates.avatar;

                apiService.updateProfile(user.email, payload);
            }
        }
    };

    // --- MISSION COMPLETION HANDLING ---
    const handleMissionComplete = (xpGained: number) => {
        // Optimistic UI Update
        const newXp = xp + xpGained;
        setXp(newXp);

        // Refresh full stats in background
        apiService.getStats().then(res => {
            if (res.success && res.stats) {
                setXp(res.stats.xp);
                setCoins(res.stats.credits);
                setUser(prev => prev ? {
                    ...prev,
                    xp: res.stats.xp,
                    coins: res.stats.credits,
                    streak: { ...prev.streak, current: res.stats.streak },
                    certificates: res.certificates || prev.certificates,
                    vocabularyBank: res.vocabularyBank || prev.vocabularyBank,
                    achievements: res.achievements || prev.achievements
                } : null);
            }
        });

        // setActiveMissionId(null); // Decoupled: handled by onBack or onNextMission
    };

    // --- SHOP LOGIC ---
    const handleBuy = (item: ShopItem): boolean => {
        if (!user) return false;

        if (coins >= item.price) {
            const newCoins = coins - item.price;
            let newInventory = [...(user.inventory || [])];

            // Handle Consumables vs Inventory Items
            if (item.category === 'powerup') {
                if (item.id === 'heart_refill') {
                    setHearts(20); // Immediate effect
                    alert("Vidas restauradas!");
                }
                if (item.id === 'shield_1') {
                    // Add to inventory if not there
                    if (!newInventory.includes(item.id)) newInventory.push(item.id);
                }
            } else {
                if (!newInventory.includes(item.id)) newInventory.push(item.id);
            }

            // Update local state
            setCoins(newCoins);
            setUser(prev => prev ? { ...prev, coins: newCoins, inventory: newInventory } : null);

            // Sync with backend
            handleUpdateUser({ coins: newCoins, inventory: newInventory });

            return true;
        }
        return false;
    };

    // --- THEME EFFECT ---
    useEffect(() => {
        if (user?.theme) {
            document.documentElement.className = ''; // Reset
            if (user.theme === 'midnight') {
                document.documentElement.classList.add('theme-midnight');
            } else if (user.theme === 'adult') {
                document.documentElement.classList.add('theme-adult');
            }
        }
    }, [user?.theme]);

    // --- INITIAL LOAD ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Validate token or just load stats
            apiService.getStats().then(res => {
                if (res.success && res.stats) {
                    // Mock user object recreation from stats + token info would be key here, but simplified:
                    const savedUser = JSON.parse(localStorage.getItem('user_profile') || 'null');
                    if (savedUser) {
                        loadUserFromBackend({
                            ...savedUser,
                            xp: res.stats.xp,
                            coins: res.stats.credits,
                            streak: res.stats.streak, // Fixed structure
                            // Hydrate lists
                            certificates: res.certificates || [],
                            vocabularyBank: res.vocabularyBank || []
                        });
                    } else {
                        // Token exists but no profile? Logout security
                        handleLogout();
                    }
                } else {
                    handleLogout();
                }
            }).catch(() => handleLogout()); // If ping fails
        }
    }, []);

    // 6. Safety Net for "Zombie" State (App mode but no user)
    // This catches the black screen issue if state gets desynced
    useEffect(() => {
        if (viewState === 'app' && !user) {
            console.warn("State Mismatch: App mode without user. Resetting.");
            setViewState('landing');
        }
    }, [viewState, user]);


    // 5. Loading
    if (viewState === 'loading') {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500
                 ${loginPreviewMode === 'adult' ? 'bg-space-dark text-white' : 'bg-gradient-kids text-white'}
            `}>
                <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-bold animate-pulse">Cargando tu universo...</p>
            </div>
        );
    }



    // --- MAIN RETURN ---


// --- RENDER HELPERS ---
    const renderContent = () => {
        if (mode === 'daily_challenge') return <div className="text-white text-center mt-20">Desafíos Diarios (Próximamente)</div>;
        if (mode === 'shop' && user) return <Shop user={{ ...user, coins: coins }} onBuy={handleBuy} onActivate={(item) => {
            if (item.id.startsWith('theme_')) {
                handleUpdateUser({ theme: item.id === 'theme_dark_pro' ? 'midnight' : 'default' });
            } else if (item.id.startsWith('badge_') || item.id === 'mascot_hero' || item.id === 'frame_galaxy') {
                const updates: any = { activeBadge: item.id };
                if (item.id === 'badge_biz') {
                    // CEO Logic
                    updates.achievements = {
                        ...user.achievements,
                        lessonsCompleted: (user.achievements?.lessonsCompleted || 0) + 3
                    };
                    alert("¡CEO ACTIVADO! ⚡\nHas recibido +3 Lecciones completadas de bonificación.");
                } else if (item.id === 'mascot_hero') {
                    alert("¡Traje de Superhéroe Equipado! 🦸‍♂️\nTu robot ahora luce invencible.");
                }
                handleUpdateUser(updates);
            }
        }} />;
        if (mode === 'achievements' && user) return <Achievements user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />;
        if (mode === 'review' && user) return <ReviewCenter user={user} onUpdateUser={handleUpdateUser} />;
        switch (mode) {
            case 'learn':
                if (activeMissionId) {
                    return (
                        <MissionPlayer
                            missionId={activeMissionId}
                            onComplete={handleMissionComplete}
                            onBack={() => setActiveMissionId(null)}
                            onNextMission={(id) => setActiveMissionId(id)}
                            user={user}
                            hearts={hearts}
                            onConsumeHeart={() => {
                                setHearts(curr => {
                                    if (curr <= 1) {
                                        alert("¡Te has quedado sin vidas! Ve al Arsenal para recargar.");
                                        setActiveMissionId(null); // Boot them out to shop/dashboard
                                        setMode('shop');
                                        return 0;
                                    }
                                    return curr - 1;
                                });
                            }}
                        />
                    );
                }

                if (activeCourseId) {
                    return (
                        <SolarSystem
                            courseId={activeCourseId}
                            onMissionSelect={(id) => setActiveMissionId(id)}
                            onBack={() => setActiveCourseId(null)}
                        />
                    );
                }

                return (
                    <GalacticDashboard
                        user={user!}
                        onSelectCourse={(id) => setActiveCourseId(id)}
                    />
                );

            case 'chat':
                return <ChatTutor level={level} user={user} onUpdateUser={handleUpdateUser} />;
            case 'video': // Studio
            case 'studio':
                return <VideoStudio user={user} onUpdateUser={handleUpdateUser} />;
            default:
                return null;
        }
    };

    // 1. Landing
    if (viewState === 'landing') {
        return (
            <LandingPage
                mode={loginPreviewMode}
                toggleMode={togglePreviewMode}
                onGetStarted={() => setViewState('onboarding')}
                onSignIn={() => {
                    setAuthMode('signin');
                    setViewState('auth');
                }}
            />
        );
    }

    // 2. Onboarding
    if (viewState === 'onboarding') {
        return (
            <OnboardingFlow
                initialAgeGroup={loginPreviewMode === 'adult' ? 'adult' : 'kid'}
                onBack={() => setViewState('landing')}
                onComplete={(data) => {
                    setOnboardingData(data);
                    setRegName(data.name);
                    setAuthMode('signup');
                    setViewState('auth');
                }}
            />
        );
    }

    // 3. Auth
    if (viewState === 'auth') {
        return (
            <div className={`min-h-screen h-full flex items-center justify-center p-4 transition-colors duration-500 overflow-y-auto
                 ${loginPreviewMode === 'adult' ? 'bg-space-dark' : 'bg-gradient-kids'}
            `}>
                <div className="w-full max-w-md my-8">
                    <AuthScreen
                        mode={loginPreviewMode}
                        authMode={authMode}
                        setAuthMode={setAuthMode}
                        onBack={() => setViewState('landing')}
                        onSubmit={handleAuthAction}
                        initialValues={{ name: regName }}
                    />
                </div>
            </div>
        );
    }

    // 4. App (Logged In)
    if (viewState === 'app' && user) {
        return (
            <HashRouter>
                <div className={`min-h-screen flex ${user?.age >= 18 ? 'bg-space-dark text-space-light' : 'bg-gradient-kids text-white'}`}>

                    {/* Navigation */}
                    <div className="hidden md:block w-64 fixed h-full z-20 bg-[#1e293b]"> {/* Fallback bg for kid mode visibility */}
                        <Sidebar currentMode={mode} setMode={setMode} onLogout={handleLogout} />
                    </div>
                    <div className="md:hidden fixed bottom-16 sm:bottom-0 w-full z-50">
                        <MobileNav currentMode={mode} setMode={setMode} />
                    </div>

                    {/* Content */}
                    <main className="flex-1 md:ml-64 pb-24 md:pb-0 min-h-screen overflow-x-hidden">
                        <div className="max-w-7xl mx-auto pt-4 md:pt-6 px-4">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </HashRouter>
        );
    }

    

    // Fallback UI (instead of returning null)
    if (viewState === 'app' && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Sincronizando...</p>
                </div>
            </div>
        );
    }

    return null;
};

export default App;
