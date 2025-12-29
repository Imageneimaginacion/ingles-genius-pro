import React, { useState, useEffect, useRef } from 'react';
import { Level, LessonData, VocabularyItem, UserProfile } from '../types';
import { generateLesson } from '../services/geminiService';
import { Loader2, Rocket, Check, X, Volume2, ArrowLeft, Star, Play, Save, CheckCircle, BookOpen, RotateCcw, Globe, Briefcase, Heart, Coffee, Lock, Trophy, Clock, Coins, ArrowRight, Zap, Hexagon, Circle, List, Map as MapIcon, LayoutGrid, PlayCircle, Brain, MessageCircle, Target, Smile, ChevronRight, Sparkles, Award, Flag } from 'lucide-react';

interface LessonGeneratorProps {
    user: UserProfile;
    setUser: (u: Partial<UserProfile>) => void;
    onLogout: () => void;
    onBack?: () => void;
    onComplete?: (score: number, topic: string) => void;
    activeMission?: any; // Added prop to receive selected mission
}

import { LEVEL_MISSIONS, getMissionId } from '../data/missions';

const LessonGenerator: React.FC<LessonGeneratorProps> = ({ user, setUser, onLogout, onBack, onComplete, activeMission: initialActiveMission }) => {
    // Legacy mapping (simplified for this view)
    const level = user.level || Level.A1;
    const userAge = user.age;
    const completedTopics = user.completedTopics || [];

    // If an active mission is passed, start in 'briefing' mode, otherwise 'map'
    const [view, setView] = useState<'map' | 'briefing' | 'lesson' | 'reward'>(initialActiveMission ? 'briefing' : 'map');
    // ... rest of state
    const [displayMode, setDisplayMode] = useState<'map' | 'list'>('map');
    const [currentTopic, setCurrentTopic] = useState('');
    const [currentMissionData, setCurrentMissionData] = useState<any>(null); // Store mission meta
    const [lessonData, setLessonData] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(false);

    // Gameplay State
    const [currentStep, setCurrentStep] = useState(-1);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [checkStatus, setCheckStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [combo, setCombo] = useState(0);
    const [scoreStats, setScoreStats] = useState({ correct: 0, total: 0, coinsEarned: 0 });

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    const isAdult = userAge >= 18;
    const pathNodes = LEVEL_MISSIONS[level] || LEVEL_MISSIONS[Level.A1];

    // Speech Recognition Setup
    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                // Auto-check if close enough?
                validateSpeech(text);
            };
            recognition.onerror = (e: any) => {
                console.error(e);
                setIsListening(false);
                alert("Microphone error. Please try typing or ensure permissions are granted.");
            };
            recognition.onend = () => setIsListening(false);
            recognition.start();
        } else {
            alert("Speech recognition not supported in this browser.");
        }
    };

    const validateSpeech = (text: string) => {
        if (!lessonData) return;
        const currentQuiz = lessonData.quiz[currentStep];
        // Simple fuzzy match check
        // Ideally we check against the 'correctAnswer' or expected phrase
        // For standard quiz, maybe we require them to say the option?
        // Let's assume for 'speak' type mission, the 'activeProduction' or specific quiz type handles this.
        // For now, if the text contains the correct answer heavily
        if (text.toLowerCase().includes(currentQuiz.correctAnswer.toLowerCase())) {
            setSelectedOption(currentQuiz.correctAnswer);
            // handleCheck(); // Auto triggers?
            // Let user confirm
        }
    };

    // Auto-start mission if passed via props
    useEffect(() => {
        if (initialActiveMission && !lessonData && !loading) {
            // Check if we need to find the full mission node data
            // For now, assuming initialActiveMission contains necessary meta or is just the ID type
            // But LessonGenerator expects full node data usually.
            // Let's find the node in LEVEL_MISSIONS based on the type/ID if needed, 
            // OR just use what's passed if it matches the shape.

            // If initialActiveMission is just a string (e.g. 'vocab'), find the first available mission of that type?
            // Or if it's the full object.
            // GalacticDashboard passes the ID 'vocab', 'grammar'. 
            // We need to find the specific topic node associated with that ID/Type or just start the next available one.

            if (typeof initialActiveMission === 'string') {
                // It's a type like 'vocab'. Find first unlocked or next mission of that type.
                // For simplicity, let's just use the first available mission or the 'nextMissionIndex' logic logic but filtered.
                // Actually, let's just trigger the 'activeMission' calculated below (line 68) if it matches.
                if (activeMissionNode) {
                    prepareMission(activeMissionNode.topic, activeMissionNode);
                }
            } else {
                prepareMission(initialActiveMission.topic, initialActiveMission);
            }
        }
    }, [initialActiveMission]);



    // ... code ...

    // Find first unlocked mission to suggest via "START" button
    const nextMissionIndex = pathNodes.findIndex((node, idx) => {
        const id = getMissionId(level, node.topic);
        const completed = completedTopics.includes(id);
        const prevCompleted = idx === 0 || completedTopics.includes(getMissionId(level, pathNodes[idx - 1].topic));
        return !completed && prevCompleted;
    });
    // Rename to avoid conflict with prop
    const activeMissionNode = nextMissionIndex !== -1 ? pathNodes[nextMissionIndex] : pathNodes[0];

    // --- ACTIONS ---

    const prepareMission = async (topic: string, meta: any) => {
        setLoading(true);
        setCurrentTopic(topic);
        setCurrentMissionData(meta);
        try {
            // For briefing preview, we might not strictly need full generation yet, 
            // but to show "Objective" we do. In a real app, objective might be pre-fetched or static.
            // Here we generate full lesson to populate the briefing accurately.
            const data = await generateLesson(level, topic, userAge);
            setLessonData(data);
            setView('briefing');
        } catch (e: any) {
            console.error(e);
            alert("Error connecting to Mission Control: " + (e.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const startMission = () => {
        setCurrentStep(-1);
        setCombo(0);
        setScoreStats({ correct: 0, total: 0, coinsEarned: 0 });
        setView('lesson');
    };

    const handleCheck = () => {
        if (!selectedOption || !lessonData) return;
        const currentQuiz = lessonData.quiz[currentStep];
        const isCorrect = selectedOption === currentQuiz.correctAnswer;

        if (isCorrect) {
            setCheckStatus('correct');
            const newCombo = combo + 1;
            setCombo(newCombo);
            setScoreStats(prev => ({ ...prev, correct: prev.correct + 1, coinsEarned: prev.coinsEarned + (newCombo > 2 ? 2 : 1) }));
            if (!isAdult) speak("Correct!");
        } else {
            setCheckStatus('wrong');
            setCombo(0);
            if (!isAdult) speak("Try again!");
        }
    };

    const handleNext = () => {
        if (!lessonData) return;
        setCheckStatus('idle');
        setSelectedOption(null);

        if (currentStep === -1) {
            setCurrentStep(0);
            return;
        }

        if (currentStep < lessonData.quiz.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setCurrentStep(100);
        }
    };

    const finishMission = (input: string) => {
        if (!lessonData) return;
        const total = lessonData.quiz.length;
        const accuracy = (scoreStats.correct / total) * 100;

        if (accuracy >= 80) {
            // Play spatial success sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio autoplay prevented"));

            // onComplete Legacy replacement
            const earnedXp = accuracy >= 90 ? 100 : 50;
            const topicId = getMissionId(currentTopic);
            const newCompleted = [...completedTopics, topicId];

            const updates = {
                coins: user.coins + 20,
                // Add XP handling if needed or integrate to stats
                completedTopics: newCompleted
            };
            setUser(updates);

            // Call parent onComplete if provided
            if (onComplete) {
                onComplete(accuracy, topicId);
            }

            // Trigger parent sync happens via setUser wrapper in App.tsx
            setView('reward');
        } else {
            alert("Mission Failed. Accuracy too low. Try again.");
            setView('map');
        }
    };

    const speak = (text: string) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        window.speechSynthesis.speak(u);
    };

    // --- RENDERERS ---

    if (view === 'map') {
        return (
            <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-700 ${isAdult ? 'bg-[#0F131A]' : 'bg-gradient-to-b from-sky-400 via-blue-400 to-blue-200'}`}>

                {/* --- HEADER --- */}
                <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg backdrop-blur-md border 
                        ${isAdult ? 'bg-space-primary/20 text-space-primary border-space-primary/50' : 'bg-white text-blue-500 border-white'}`}>
                            {isAdult ? 'IG' : <img src="https://api.dicebear.com/9.x/bottts/svg?seed=RobotHappy" className="w-8 h-8" />}
                        </div>
                        {!isAdult && (
                            <div className="hidden sm:block">
                                <h2 className="text-[10px] font-bold uppercase text-white/80 tracking-widest">Cadet</h2>
                                <h1 className="text-lg font-black text-white tracking-tight">{user?.name || 'Pilot'}</h1>
                            </div>
                        )}
                    </div>

                    {/* Right Area */}
                    <div className="flex items-center gap-4">
                        {/* Title / Range */}
                        <div className={`hidden md:block px-4 py-2 rounded-full backdrop-blur-md ${isAdult ? 'bg-[#151924]/80 border border-space-light' : 'bg-white/20 border border-white/30'}`}>
                            <span className={`font-bold text-xs uppercase tracking-widest ${isAdult ? 'text-space-muted' : 'text-white'}`}>
                                Level A1–C2
                            </span>
                        </div>

                        {/* Kids Coin Counter */}
                        {!isAdult && (
                            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                <Coins className="text-yellow-400 fill-current" size={16} />
                                <span className="font-bold text-white text-sm">{user?.coins || 0}</span>
                            </div>
                        )}
                    </div>
                </div>

                {displayMode === 'map' ? (
                    // --- HIGH FIDELITY MAP VIEW ---
                    <div className="flex-1 relative w-full h-full flex flex-col">

                        {/* --- ADULT MODE: DARK NEBULA --- */}
                        {isAdult && (
                            <>
                                {/* Title */}
                                <div className="absolute top-24 left-0 w-full text-center z-10">
                                    <h1 className="text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                        MISSION MAP
                                    </h1>
                                    <div className="w-12 h-1 bg-cyan-500 mx-auto mt-2 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                                </div>

                                {/* Map Container */}
                                <div className="flex-1 flex items-center justify-center relative overflow-hidden pt-20 pb-32">
                                    {/* Background Stars */}
                                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.1 }}></div>

                                    <div className="relative w-full max-w-md h-[500px]">
                                        {/* Nodes */}
                                        {pathNodes.map((node, idx) => {
                                            const id = getMissionId(level, node.topic);
                                            const completed = completedTopics.includes(id);
                                            const unlocked = idx === 0 || completedTopics.includes(getMissionId(level, pathNodes[idx - 1].topic));
                                            const isCurrent = unlocked && !completed;

                                            // Zigzag Layout approximation
                                            const positions = [
                                                { bottom: '10%', left: '50%', translate: '-50%' }, // A1 (Bottom Center)
                                                { bottom: '35%', left: '20%', translate: '-50%' }, // A2 (Left)
                                                { bottom: '35%', right: '20%', translate: '50%' }, // B1 (Right)
                                                { bottom: '60%', left: '50%', translate: '-50%' }, // B1 (Top Center - Next loop)
                                                { bottom: '85%', left: '50%', translate: '-50%' }  // C1
                                            ];
                                            const pos = positions[idx % positions.length];

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => unlocked && prepareMission(node.topic, node)}
                                                    disabled={!unlocked && !completed}
                                                    className={`absolute transition-all duration-300 group ${isCurrent ? 'z-20 scale-125' : 'z-10 hover:scale-110'}`}
                                                    style={{ bottom: pos.bottom, left: pos.left, right: pos.right, transform: `translateX(${pos.translate || 0})` }}
                                                >
                                                    <div className={`
                                                    rounded-full flex items-center justify-center border-2 relative
                                                    ${isCurrent
                                                            ? 'w-24 h-24 bg-[#0F131A] border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]'
                                                            : (completed ? 'w-16 h-16 bg-[#151924] border-green-500' : 'w-16 h-16 bg-[#151924] border-gray-700 opacity-60')
                                                        }
                                                `}>
                                                        {/* Content inside Node */}
                                                        {isCurrent ? (
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-2xl font-bold text-white">A{idx + 1}</span>
                                                                <div className="text-[10px] font-bold text-cyan-400 mt-1">25%</div>
                                                                {/* Progress Ring SVG */}
                                                                <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                                                                    <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#151924" strokeWidth="4" />
                                                                    <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#22d3ee" strokeWidth="4" strokeDasharray="100" strokeDashoffset="75" strokeLinecap="round" />
                                                                </svg>
                                                            </div>
                                                        ) : (
                                                            <span className={`font-bold ${completed ? 'text-green-500' : 'text-gray-500'}`}>
                                                                {idx < 2 ? 'A' : 'B'}{idx + 1}
                                                            </span>
                                                        )}

                                                        {/* Flag for key nodes */}
                                                        {idx === 3 && (
                                                            <div className="absolute -top-3 -right-2 text-orange-500 drop-shadow-lg animate-bounce">
                                                                <Flag size={20} fill="currentColor" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {/* Connecting Lines (Static for layout) */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-30">
                                            <path d="M 50% 15% L 20% 35% L 50% 60% L 80% 35% L 50% 15%" stroke="cyan" strokeWidth="1" fill="none" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Footer Button */}
                                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-[#0F131A] to-transparent">
                                    <button
                                        onClick={() => prepareMission(activeMissionNode.topic, activeMissionNode)}
                                        className="w-full max-w-md mx-auto bg-[#151924] border border-cyan-500/50 text-white font-black text-xl py-4 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-cyan-900/20 transition-all uppercase tracking-[0.2em]"
                                    >
                                        Start
                                    </button>
                                </div>
                            </>
                        )}

                        {/* --- KIDS MODE: PLANETARY ADVENTURE --- */}
                        {!isAdult && (
                            <>
                                <div className="absolute top-24 left-0 w-full text-center z-10">
                                    <h1 className="text-4xl font-black text-white drop-shadow-lg tracking-wide" style={{ textShadow: '0px 4px 0px rgba(0,0,0,0.2)' }}>
                                        MISSION MAP
                                    </h1>
                                </div>

                                <div className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar pb-32 pt-10">
                                    {/* Mascot */}
                                    <div className="absolute top-10 left-4 animate-float z-20">
                                        <img src="https://api.dicebear.com/9.x/bottts/svg?seed=RobotHappy" className="w-24 h-24 drop-shadow-2xl" />
                                    </div>

                                    {/* SVG Wavy Path */}
                                    <svg className="absolute top-0 left-0 w-full h-[1200px] pointer-events-none z-0">
                                        <path
                                            d="M 50 100 Q 200 250 50 400 T 50 700" // Simplified wave
                                            fill="none"
                                            stroke="#60a5fa"
                                            strokeWidth="40"
                                            strokeLinecap="round"
                                            className="opacity-50"
                                        />
                                        <path
                                            d="M 50 100 Q 200 250 50 400 T 50 700"
                                            fill="none"
                                            stroke="#93c5fd"
                                            strokeWidth="20"
                                            strokeLinecap="round"
                                            strokeDasharray="30 30"
                                        />
                                    </svg>

                                    {/* Planets */}
                                    <div className="relative w-full max-w-md mx-auto h-[800px] pt-32">
                                        {pathNodes.map((node, idx) => {
                                            const id = getMissionId(level, node.topic);
                                            const completed = completedTopics.includes(id);
                                            const unlocked = idx === 0 || completedTopics.includes(getMissionId(level, pathNodes[idx - 1].topic));

                                            // Zigzag positions
                                            const x = idx % 2 === 0 ? '10%' : '60%';
                                            const y = idx * 140;

                                            // Planet Colors
                                            const colors = ['bg-green-400', 'bg-blue-400', 'bg-red-400', 'bg-yellow-400', 'bg-purple-400'];
                                            const color = colors[idx % colors.length];

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => unlocked && prepareMission(node.topic, node)}
                                                    disabled={!unlocked && !completed}
                                                    className={`absolute w-24 h-24 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-transform duration-300
                                                    ${unlocked ? 'hover:scale-110 cursor-pointer' : 'opacity-60 grayscale'}
                                                    ${color}
                                                `}
                                                    style={{ left: x, top: y }}
                                                >
                                                    {/* Planet Texture */}
                                                    <div className="absolute w-6 h-6 bg-white/20 rounded-full top-3 right-4"></div>
                                                    <div className="absolute w-3 h-3 bg-white/20 rounded-full bottom-5 left-6"></div>

                                                    {completed ? (
                                                        <Check size={40} className="text-white drop-shadow-md" strokeWidth={4} />
                                                    ) : (
                                                        <span className="font-black text-xl text-white drop-shadow-md">
                                                            {idx * 25}%
                                                        </span>
                                                    )}

                                                    {/* Active Flag */}
                                                    {unlocked && !completed && (
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                                            <Flag size={32} className="text-yellow-400 fill-current drop-shadow-lg animate-bounce" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Bottom Clouds & Button */}
                                <div className="absolute bottom-0 w-full h-48 pointer-events-none z-30">
                                    {/* Cloud SVG Shapes */}
                                    <div className="absolute bottom-0 w-full h-32 bg-white opacity-90 rounded-t-[50%] scale-x-150"></div>
                                    <div className="absolute bottom-0 w-full h-24 bg-white/80 rounded-t-[60%] scale-x-125 translate-x-20"></div>

                                    <div className="absolute bottom-8 left-0 w-full flex justify-center pointer-events-auto">
                                        <button
                                            onClick={() => prepareMission(activeMissionNode.topic, activeMissionNode)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl py-4 px-16 rounded-3xl shadow-[0_10px_0_rgb(30,58,138)] active:shadow-none active:translate-y-[10px] transition-all uppercase"
                                        >
                                            Start
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // --- LIST VIEW (Fallback/Overview) ---
                    <div className="flex-1 overflow-y-auto px-4 pt-28 pb-24 animate-fade-in max-w-3xl mx-auto w-full">
                        <h2 className={`text-xl font-black mb-6 ${isAdult ? 'text-white' : 'text-white drop-shadow-md'}`}>All Missions</h2>
                        <div className="grid gap-4">
                            {pathNodes.map((node, idx) => {
                                const id = getMissionId(level, node.topic);
                                const completed = completedTopics.includes(id);
                                const unlocked = idx === 0 || completedTopics.includes(getMissionId(level, pathNodes[idx - 1].topic));

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => unlocked && prepareMission(node.topic, node)}
                                        className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer
                                        ${isAdult
                                                ? (unlocked ? 'bg-[#151924] border-space-light hover:border-space-primary' : 'bg-transparent border-gray-800 opacity-50')
                                                : (unlocked ? 'bg-white/90 border-white hover:scale-[1.02]' : 'bg-black/20 border-transparent text-white opacity-60')
                                            }
                                    `}
                                    >
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${isAdult ? 'bg-space-dark' : `bg-gradient-to-br ${node.color}`}`}>
                                            {completed ? <Check className="text-white" /> : <node.icon className="text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold text-lg ${isAdult ? 'text-white' : 'text-space-dark'}`}>{node.topic}</h3>
                                            <div className="flex gap-3 text-xs opacity-70 font-medium uppercase">
                                                <span className="flex items-center gap-1"><Clock size={12} /> {node.duration}</span>
                                                <span className="flex items-center gap-1"><Zap size={12} /> {node.xp} XP</span>
                                            </div>
                                        </div>
                                        {unlocked && !completed && <PlayCircle size={28} className={isAdult ? 'text-space-primary' : 'text-space-secondary'} />}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (view === 'briefing') {
        const structureItems = [
            { label: "Objective", icon: Target, time: "1 min" },
            { label: "Vocabulary", icon: BookOpen, time: "3 min" },
            { label: "Guided Practice", icon: Brain, time: "2 min" },
            { label: "Final Quiz", icon: CheckCircle, time: "2 min" }
        ];

        return (
            <div className={`min-h-screen flex items-center justify-center p-4 animate-fade-in ${isAdult ? 'bg-[#0F131A]' : 'bg-gradient-kids'}`}>
                <div className={`w-full max-w-md relative overflow-hidden transition-all duration-500
                  ${isAdult
                        ? 'bg-[#151924] border border-space-primary/30 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]'
                        : 'bg-white/95 backdrop-blur-md border-4 border-white rounded-[2.5rem] shadow-2xl'
                    }
              `}>
                    {/* Header */}
                    <div className={`px-6 py-4 flex items-center justify-between border-b ${isAdult ? 'border-space-light' : 'border-gray-100'}`}>
                        <button onClick={() => setView('map')} className={`p-2 rounded-full transition-colors ${isAdult ? 'text-space-muted hover:text-white hover:bg-space-light' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft size={20} />
                        </button>
                        <span className={`text-xs font-bold uppercase tracking-widest ${isAdult ? 'text-space-primary' : 'text-space-secondary'}`}>
                            {isAdult ? `Sector ${level.split(' ')[0]} Briefing` : 'Mission Ready!'}
                        </span>
                        <div className="w-8"></div> {/* Spacer */}
                    </div>

                    {/* Mascot / Icon Hero */}
                    <div className={`relative h-40 flex items-center justify-center overflow-hidden ${isAdult ? 'bg-space-dark' : 'bg-blue-50'}`}>
                        {isAdult ? (
                            <>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                                <div className="w-24 h-24 rounded-full bg-space-primary/10 border border-space-primary flex items-center justify-center shadow-[0_0_30px_rgba(62,198,255,0.2)] z-10">
                                    <Rocket size={48} className="text-space-primary" strokeWidth={1.5} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute top-4 left-10 text-yellow-300"><Star size={24} fill="currentColor" /></div>
                                    <div className="absolute bottom-4 right-10 text-pink-300"><Heart size={20} fill="currentColor" /></div>
                                </div>
                                <img
                                    src="https://api.dicebear.com/9.x/bottts/svg?seed=RobotHappy"
                                    className="w-32 h-32 drop-shadow-xl animate-bounce z-10"
                                    alt="Mascot"
                                />
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <Loader2 className={`animate-spin ${isAdult ? 'text-space-primary' : 'text-blue-500'}`} size={48} />
                                <p className={`font-bold animate-pulse ${isAdult ? 'text-space-muted' : 'text-gray-500'}`}>
                                    {isAdult ? 'Establishing Uplink...' : 'Generando Misión...'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <h1 className={`text-3xl font-black mb-2 leading-tight ${isAdult ? 'text-white' : 'text-space-dark'}`}>
                                        {lessonData?.title || (isAdult ? 'Mission Initialized' : 'Misión Lista')}
                                    </h1>
                                    <div className="flex justify-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${isAdult ? 'bg-space-dark border border-space-light text-space-muted' : 'bg-gray-100 text-gray-600'}`}>
                                            <Clock size={12} /> {currentMissionData?.duration || '5 min'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${isAdult ? 'bg-space-primary/10 text-space-primary border border-space-primary/30' : 'bg-yellow-100 text-yellow-600'}`}>
                                            <Zap size={12} fill="currentColor" /> {currentMissionData?.xp || 50} XP
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isAdult ? 'text-space-muted' : 'text-gray-400'}`}>Mission Outline</h3>
                                    {structureItems.map((item, i) => (
                                        <div key={i} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isAdult ? 'bg-space-dark/50 border border-space-light/50' : 'bg-gray-50 border border-gray-100'}`}>
                                            <div className={`p-2 rounded-lg ${isAdult ? 'bg-space-card text-space-primary' : 'bg-white text-space-secondary shadow-sm'}`}>
                                                <item.icon size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`font-bold text-sm ${isAdult ? 'text-white' : 'text-gray-800'}`}>{item.label}</h4>
                                            </div>
                                            <span className={`text-xs font-medium ${isAdult ? 'text-space-muted' : 'text-gray-400'}`}>{item.time}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={startMission}
                                    disabled={!lessonData}
                                    className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3
                                  ${isAdult
                                            ? 'bg-space-primary text-white hover:bg-blue-500 shadow-blue-500/20 disabled:bg-gray-700 disabled:shadow-none disabled:cursor-not-allowed'
                                            : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-pink-500/30 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:cursor-not-allowed'
                                        }`}
                                >
                                    <Play fill="currentColor" size={20} /> {isAdult ? 'Start Mission' : '¡Despegar!'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- REWARD SCREEN ---
    if (view === 'reward') {
        return (
            <div className={`min-h-screen flex items-center justify-center p-4 animate-fade-in ${isAdult ? 'bg-[#0F131A]' : 'bg-gradient-kids'}`}>
                <div className={`relative w-full max-w-md rounded-3xl overflow-hidden text-center shadow-2xl transition-all duration-500
                  ${isAdult
                        ? 'bg-[#151924] border border-space-primary/40 p-10 shadow-[0_0_50px_rgba(62,198,255,0.1)]'
                        : 'bg-white/90 backdrop-blur-md border-4 border-white p-8'
                    }
              `}>
                    {/* Confetti / Sparkles (Kids) */}
                    {!isAdult && (
                        <>
                            <Sparkles className="absolute top-10 left-10 text-yellow-400 animate-pulse" size={32} />
                            <Star className="absolute top-20 right-10 text-pink-400 animate-spin-slow" size={24} />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none"></div>
                        </>
                    )}

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4 opacity-80">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isAdult ? 'bg-space-primary text-white' : 'bg-gradient-brand text-white'}`}>IG</div>
                            <span className={`font-bold tracking-widest uppercase text-xs ${isAdult ? 'text-white' : 'text-space-dark'}`}>Inglés Genius Pro</span>
                        </div>

                        <h1 className={`text-4xl font-black uppercase mb-2 ${isAdult ? 'text-white drop-shadow-lg' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'}`}>
                            Reward
                        </h1>
                    </div>

                    {/* Trophy Hero */}
                    <div className="relative mb-10 inline-block">
                        {isAdult ? (
                            <div className="relative z-10">
                                <Trophy size={100} className="text-space-primary drop-shadow-[0_0_30px_rgba(62,198,255,0.5)]" strokeWidth={1} />
                                <div className="absolute inset-0 bg-space-primary blur-[60px] opacity-20 rounded-full"></div>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <div className="absolute inset-0 animate-ping bg-yellow-400 rounded-full opacity-20 scale-150"></div>
                                <img
                                    src="https://api.dicebear.com/9.x/bottts/svg?seed=RobotHappy"
                                    className="w-32 h-32 mx-auto drop-shadow-2xl animate-bounce relative z-20"
                                    alt="Winner"
                                />
                                <Trophy size={64} className="absolute -bottom-4 -right-4 text-yellow-400 fill-current z-30 drop-shadow-lg rotate-12" />
                            </div>
                        )}
                    </div>

                    {/* Stats Card */}
                    <div className={`rounded-2xl p-6 mb-8 flex flex-col gap-3
                      ${isAdult
                            ? 'bg-[#0F131A] border border-space-light/50'
                            : 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-white shadow-inner'
                        }
                  `}>
                        <div className="flex justify-center items-center gap-2">
                            <span className={`text-3xl font-black ${isAdult ? 'text-space-primary' : 'text-yellow-500'}`}>+{scoreStats.coinsEarned * 50} XP</span>
                        </div>
                        <div className="flex justify-center items-center gap-2">
                            <Coins size={20} className="text-yellow-400 fill-current" />
                            <span className={`text-xl font-bold ${isAdult ? 'text-white' : 'text-space-dark'}`}>{scoreStats.coinsEarned * 10}</span>
                        </div>
                        {combo > 2 && (
                            <div className={`text-sm font-bold uppercase tracking-wide ${isAdult ? 'text-space-accent' : 'text-green-500'}`}>
                                +{combo * 2} Combo Bonus
                            </div>
                        )}
                    </div>

                    {/* Level Up Bar */}
                    <div className="mb-8">
                        <div className={`flex justify-between text-xs font-bold uppercase mb-2 ${isAdult ? 'text-space-muted' : 'text-gray-500'}`}>
                            <span>Level Up</span>
                            <span>80%</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isAdult ? 'bg-space-dark' : 'bg-gray-200'}`}>
                            <div className={`h-full w-[80%] rounded-full relative overflow-hidden ${isAdult ? 'bg-space-primary shadow-[0_0_10px_#3EC6FF]' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}>
                                <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                            </div>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={() => setView('map')}
                        className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-xl transition-transform hover:scale-[1.02] active:scale-95
                          ${isAdult
                                ? 'bg-space-primary text-white hover:bg-blue-500 shadow-blue-500/20'
                                : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-orange-500/30'
                            }
                      `}
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // --- GAMEPLAY (QUIZ) ---

    if (!lessonData) return null;

    // Explanation Phase
    if (currentStep === -1) {
        return (
            <div className="max-w-3xl mx-auto pt-8 animate-fade-in px-4">
                <div className={`border-2 rounded-theme p-8 shadow-theme relative
                  ${isAdult ? 'bg-space-card border-space-light' : 'bg-white border-white'}
              `}>
                    <button onClick={() => setView('map')} className={`absolute top-4 right-4 ${isAdult ? 'text-space-muted' : 'text-gray-400'}`}><X /></button>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-4xl">{lessonData.emoji}</span>
                        <h1 className={`text-2xl font-bold ${isAdult ? 'text-white' : 'text-space-dark'}`}>{lessonData.title}</h1>
                    </div>

                    <div className="prose prose-invert max-w-none mb-8">
                        <div className={`p-6 rounded-2xl border-l-4 mb-6
                          ${isAdult ? 'bg-space-dark border-space-primary' : 'bg-blue-50 border-blue-400'}
                      `}>
                            <p className={`text-lg leading-relaxed ${isAdult ? 'text-white' : 'text-space-dark'}`}>{lessonData.explanation_es}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lessonData.vocabulary.map((v, i) => (
                                <div key={i} className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all
                                  ${isAdult
                                        ? 'bg-space-dark border-space-light hover:border-space-primary'
                                        : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md'
                                    }
                              `} onClick={() => speak(v.word)}>
                                    <div>
                                        <div className={`font-bold ${isAdult ? 'text-white' : 'text-space-dark'}`}>{v.word}</div>
                                        <div className={`text-xs ${isAdult ? 'text-space-muted' : 'text-gray-500'}`}>{v.translation}</div>
                                    </div>
                                    <Volume2 size={16} className={isAdult ? 'text-space-primary' : 'text-blue-500'} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleNext} className={`w-full py-4 font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-colors
                      ${isAdult ? 'bg-white text-space-dark hover:bg-gray-200' : 'bg-space-dark text-white hover:bg-gray-800'}
                  `}>
                        Iniciar Práctica <ArrowRight />
                    </button>
                </div>
            </div>
        );
    }

    // Production Phase
    if (currentStep === 100) {
        return (
            <div className="max-w-2xl mx-auto pt-12 px-4 animate-fade-in">
                <div className={`border-2 rounded-theme p-8 text-center shadow-theme
                 ${isAdult ? 'bg-space-card border-space-accent' : 'bg-white border-pink-400'}
              `}>
                    <h2 className={`text-2xl font-bold mb-4 ${isAdult ? 'text-white' : 'text-space-dark'}`}>Desafío Final</h2>
                    <p className={`mb-6 ${isAdult ? 'text-space-muted' : 'text-gray-600'}`}>{lessonData.activeProduction}</p>
                    <textarea className={`w-full h-32 border rounded-xl p-4 outline-none mb-6
                      ${isAdult
                            ? 'bg-space-dark border-space-light text-white focus:border-space-accent'
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-pink-400'
                        }
                  `} placeholder="Escribe tu respuesta..."></textarea>
                    <button onClick={() => finishMission("skipped")} className={`w-full py-4 text-white font-black rounded-xl uppercase tracking-widest shadow-lg transition-all
                      ${isAdult ? 'bg-space-accent' : 'bg-pink-500 hover:bg-pink-600'}
                  `}>
                        Completar Misión
                    </button>
                </div>
            </div>
        );
    }

    // Quiz Phase
    const question = lessonData.quiz[currentStep];
    const progress = ((currentStep + 1) / lessonData.quiz.length) * 100;

    return (
        <div className={`flex flex-col min-h-screen transition-colors duration-500 ${isAdult ? 'bg-space-bg' : 'bg-gradient-to-b from-sky-400 to-sky-600'}`}>
            {/* Game HUD */}
            <div className={`px-6 py-4 flex items-center justify-between sticky top-0 z-20 border-b backdrop-blur-md
              ${isAdult ? 'bg-space-card/90 border-space-light' : 'bg-white/90 border-white/50'}
          `}>
                <button onClick={() => setView('map')}><X className={isAdult ? 'text-space-muted' : 'text-gray-500'} /></button>
                <div className="flex-1 max-w-md mx-4">
                    <div className={`h-3 rounded-full overflow-hidden ${isAdult ? 'bg-space-dark border border-space-light' : 'bg-gray-200'}`}>
                        <div className={`h-full transition-all duration-500 ${isAdult ? 'bg-space-primary' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {combo > 1 && (
                        <div className="hidden md:flex items-center gap-1 animate-combo bg-yellow-400 text-black px-3 py-1 rounded-full font-black text-xs uppercase transform rotate-3">
                            <Zap size={14} fill="currentColor" /> {combo}x Combo
                        </div>
                    )}
                    <div className={`font-bold ${isAdult ? 'text-white' : 'text-space-dark'}`}>{scoreStats.correct * 10} XP</div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24 pt-8">
                <div className="w-full max-w-2xl relative">
                    {/* Quiz Card */}
                    <div className={`border-2 rounded-theme p-8 shadow-2xl relative overflow-hidden
                       ${isAdult ? 'bg-space-card border-space-light' : 'bg-white border-white/50'}
                   `}>
                        <h2 className={`text-2xl font-bold text-center mb-8 mt-4 ${isAdult ? 'text-white' : 'text-space-dark'}`}>{question.question}</h2>

                        <div className="space-y-3">
                            {question.options.map((opt, idx) => {
                                const isSelected = selectedOption === opt;
                                const isCorrect = checkStatus !== 'idle' && opt === question.correctAnswer;
                                const isWrong = checkStatus !== 'idle' && isSelected && opt !== question.correctAnswer;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => { if (checkStatus === 'idle') { setSelectedOption(opt); speak(opt); } }}
                                        disabled={checkStatus !== 'idle'}
                                        className={`w-full p-4 rounded-xl border-2 text-lg font-bold transition-all flex items-center gap-4 ${isCorrect ? 'bg-green-500 border-green-600 text-white' :
                                            isWrong ? 'bg-red-500 border-red-600 text-white shake' :
                                                isSelected
                                                    ? (isAdult ? 'bg-space-primary/20 border-space-primary text-white' : 'bg-blue-100 border-blue-400 text-blue-900') :
                                                    (isAdult
                                                        ? 'bg-space-dark border-space-light text-space-muted hover:border-space-primary hover:text-white'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-white hover:shadow-md')
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-black border 
                                            ${isSelected || isCorrect || isWrong ? 'border-white/50 bg-white/20' : 'border-current opacity-50'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        {opt}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Speech Control */}
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={isListening ? () => { } : startListening}
                                className={`p-4 rounded-full transition-all flex flex-col items-center gap-2
                                    ${isListening
                                        ? 'bg-red-500 animate-pulse text-white shadow-[0_0_20px_#ef4444]'
                                        : (isAdult ? 'bg-space-card border border-space-light text-space-muted hover:text-white hover:border-space-primary' : 'bg-white border-2 border-gray-100 text-gray-400 hover:text-blue-500 hover:border-blue-200')
                                    }
                                `}
                            >
                                <div className="relative">
                                    <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${isListening ? 'bg-white/30 animate-ping' : ''}`}></div>
                                    <MessageCircle size={24} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {isListening ? 'Listening...' : 'Tap to Speak Answer'}
                                </span>
                            </button>
                        </div>
                        {transcript && (
                            <div className="text-center mt-4 opacity-70 italic text-sm">
                                "{transcript}"
                            </div>
                        )}

                        <button
                            onClick={checkStatus === 'idle' ? handleCheck : handleNext}
                            disabled={!selectedOption}
                            className={`w-full py-4 mt-8 font-black rounded-xl uppercase tracking-widest shadow-xl transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3
                                ${isAdult
                                    ? (checkStatus === 'idle'
                                        ? 'bg-space-primary text-white disabled:bg-gray-800 disabled:text-gray-600'
                                        : (checkStatus === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'))
                                    : (checkStatus === 'idle'
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white disabled:from-gray-300 disabled:to-gray-400'
                                        : (checkStatus === 'correct' ? 'bg-green-400 text-white' : 'bg-red-400 text-white'))
                                }
                            `}
                        >
                            {checkStatus === 'idle' ? 'Check Answer' : 'Continue'} <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Feedback Bar */}
            <div className={`fixed bottom-0 left-0 right-0 p-6 border-t transition-transform duration-300 z-50
              ${checkStatus === 'idle' && !selectedOption ? 'translate-y-full' : 'translate-y-0'}
              ${checkStatus === 'correct'
                    ? 'bg-green-100 border-green-500'
                    : (checkStatus === 'wrong' ? 'bg-red-100 border-red-500' : (isAdult ? 'bg-space-card border-space-light' : 'bg-white border-gray-200'))}
          `}>
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    {checkStatus === 'idle' ? (
                        <button onClick={handleCheck} className={`w-full py-4 font-black uppercase tracking-widest rounded-xl shadow-lg hover:brightness-110
                           ${isAdult ? 'bg-space-primary text-white' : 'bg-green-500 text-white'}
                       `}>
                            Verificar
                        </button>
                    ) : (
                        <>
                            <div className={`flex items-center gap-4 ${checkStatus === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${checkStatus === 'correct' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                                    {checkStatus === 'correct' ? <Check size={28} strokeWidth={4} /> : <X size={28} strokeWidth={4} />}
                                </div>
                                <div>
                                    <h3 className="font-black text-xl uppercase">{checkStatus === 'correct' ? '¡Correcto!' : 'Incorrecto'}</h3>
                                    {checkStatus === 'wrong' && <p className="text-sm font-bold">Respuesta: {question.correctAnswer}</p>}
                                </div>
                            </div>
                            <button onClick={handleNext} className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-white shadow-lg ${checkStatus === 'correct' ? 'bg-green-600' : 'bg-red-600'}`}>
                                Continuar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonGenerator;