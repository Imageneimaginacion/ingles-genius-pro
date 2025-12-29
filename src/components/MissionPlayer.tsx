import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Check, X, Mic, Volume2, ArrowRight, Sparkles, Award, Coins, Star, Trophy, Rocket, Heart } from 'lucide-react';
import CertificateModal from './CertificateModal';
import VictoryModal from './VictoryModal';

interface MissionPlayerProps {
    missionId: number;
    onComplete: (xp: number) => void;
    onBack: () => void;
    onNextMission?: (id: number) => void;
    user?: any;
    hearts?: number;
    onConsumeHeart?: () => void;
}
// Mock sounds
const playCorrect = () => console.log("Ding!");
const playIncorrect = () => console.log("Buzz!");
const playComplete = () => console.log("Tada!");

const MissionPlayer: React.FC<MissionPlayerProps> = ({ missionId, onComplete, onBack, onNextMission, user, hearts, onConsumeHeart }) => {
    const [mission, setMission] = useState<any>(null);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);
    const [creditsEarned, setCreditsEarned] = useState(0);
    const [isLevelUp, setIsLevelUp] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showVictory, setShowVictory] = useState<string | null>(null);
    const [nextMissionId, setNextMissionId] = useState<number | null>(null);

    // Interactive State
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'incorrect'>('neutral');

    useEffect(() => {
        // Reset state when missionId changes (for Next Lesson flow)
        setStep(0);
        setCompleted(false);
        setXpEarned(0);
        setCreditsEarned(0);
        setIsLevelUp(false);
        setShowCertificate(false);
        setShowVictory(null);
        setNextMissionId(null);
        loadMission();
    }, [missionId]);

    const loadMission = async () => {
        setLoading(true);
        const res = await apiService.getMission(missionId);
        if (res.success) {
            setMission(res.mission);
        }
        setLoading(false);
    };

    // Get current section
    const currentSection = mission?.sections?.[step];
    const payload = currentSection?.payload;

    const playAudio = (text: string) => {
        // Fallback to TTS if no audio file
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleVerify = (answer: string) => {
        if (!payload) return;
        if (hearts !== undefined && hearts <= 0) return; // Prevent action if no hearts

        let isCorrect = false;

        if (currentSection.key === 'vocabulary' || currentSection.key === 'listening' || currentSection.key === 'grammar') {
            if (answer === payload.correct) isCorrect = true;
        } else if (currentSection.key === 'speaking') {
            // Fuzzy match or exact match for now
            if (answer.toLowerCase().includes(payload.phrase.toLowerCase())) isCorrect = true;
        }

        if (isCorrect) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
            if (onConsumeHeart) onConsumeHeart();
            // Allow retry or move on? For now, just shake or show error
            setTimeout(() => setFeedback('neutral'), 1000);
        }
    };

    const startListening = () => {
        const speech = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (speech) {
            const recognition = new speech();
            recognition.lang = 'en-US';
            recognition.start();
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(transcript);
                handleVerify(transcript);
            };
        } else {
            // Mock for dev without mic
            const mock = payload?.phrase || "Hello World";
            setUserInput(mock);
            handleVerify(mock);
        }
    };

    const handleNext = async () => {
        setFeedback(null); // Reset feedback
        if (mission && step < (mission.sections.length - 1)) {
            setStep(prev => prev + 1);
            setUserInput('');
        } else {
            // FINISH
            try {
                if (mission) {
                    const res = await apiService.submitMission(mission.id, 100); // 100% score for now
                    if (res.success) {
                        setXpEarned(res.xp_gained);
                        setCreditsEarned(res.credits_gained || 0);
                        setIsLevelUp(res.course_completed || false);

                        // Check for Course Completion Message
                        if (res.course_completed) {
                            setShowVictory(res.course_completed.replace("¡Felicidades! Has completado el curso ", "").replace(".", ""));
                        }
                        // Capture Next Mission ID
                        if (res.next_mission_id) {
                            setNextMissionId(res.next_mission_id);
                        }
                    }
                }
            } catch (e) {
                console.error("Submit error", e);
            }
            setCompleted(true);
            playComplete();
        }
    };

    if (loading) return <div className="text-white p-10">Cargando Misión...</div>;
    if (!mission) return <div className="text-red-500 p-10">Error al Cargar Misión</div>;

    if (completed) {
        if (showVictory) {
            return <VictoryModal courseTitle={showVictory} onClose={() => { setShowVictory(null); setShowCertificate(true); }} />;
        }

        return (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-white p-4">
                <CertificateModal
                    isOpen={showCertificate}
                    onClose={() => setShowCertificate(false)}
                    userName={user?.name || "Cadete"}
                    courseName={showVictory || "Misión Espacial"}
                    date={new Date().toLocaleDateString()}
                    level={user?.english_level || "Nivel Completado"}
                />

                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                </div>

                {isLevelUp ? (
                    <div className="text-center z-10 animate-in fade-in zoom-in duration-500">
                        <Award size={100} className="text-yellow-400 mx-auto mb-6 animate-bounce" />
                        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                            ¡CURSO COMPLETADO!
                        </h1>
                        <p className="text-2xl text-gray-300 mb-8">¡Has dominado este sector!</p>

                        <div className="flex justify-center gap-8 mb-10">
                            <div className="flex flex-col items-center bg-white/10 p-6 rounded-2xl border border-white/20">
                                <span className="text-4xl font-bold text-yellow-400 mb-2">+100</span>
                                <span className="text-sm uppercase tracking-widest">Créditos Extra</span>
                            </div>
                            <div className="flex flex-col items-center bg-white/10 p-6 rounded-2xl border border-white/20">
                                <span className="text-4xl font-bold text-green-400 mb-2">+1</span>
                                <span className="text-sm uppercase tracking-widest">Núcleo de Vida</span>
                            </div>
                        </div>

                        <Button variant="neon" size="lg" className="w-full md:w-auto mb-4" onClick={() => setShowCertificate(true)}>
                            <Award className="mr-2" /> Ver Certificado
                        </Button>
                    </div>
                ) : (
                    <div className="text-center z-10 animate-in fade-in zoom-in duration-500">
                        <Sparkles size={80} className="text-yellow-400 mx-auto mb-6 animate-pulse" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">¡Misión Cumplida!</h1>
                    </div>
                )}

                <div className="flex gap-8 mb-12 z-10 mt-8">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-brand-primary/20 flex items-center justify-center mb-2 border-2 border-brand-primary shadow-neon">
                            <span className="text-2xl font-bold text-brand-primary">+{xpEarned}</span>
                        </div>
                        <span className="font-bold text-gray-400">XP Ganada</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2 border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                            <span className="text-2xl font-bold text-yellow-500">+{creditsEarned}</span>
                        </div>
                        <span className="font-bold text-gray-400">Créditos</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 z-10">
                    <Button variant="primary" size="lg" onClick={() => { onComplete(xpEarned); onBack(); }} className="px-12 py-4 text-xl">
                        Regresar a Órbita
                    </Button>

                    {nextMissionId && onNextMission && (
                        <Button variant="neon" size="lg" onClick={() => { onComplete(xpEarned); onNextMission(nextMissionId); }} className="px-12 py-4 text-xl flex items-center gap-2 bg-green-500 hover:bg-green-400 border-green-300 shadow-green-500/50">
                            Siguiente Lección <Rocket />
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (!currentSection || !payload) return <div>No Content</div>;

        const track = currentSection.key;

        if (track === 'vocabulary') {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <h2 className="text-2xl text-gray-400 mb-6 uppercase tracking-wider text-sm font-semibold">Vocabulary Card</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl items-center">
                        {/* Info Column */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
                            <div className="text-6xl md:text-7xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                {payload.word}
                            </div>
                            <div className="text-2xl text-gray-400 mb-8 italic font-light">{payload.translation}</div>

                            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 w-full">
                                {payload.options.map((opt: string) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleVerify(opt)}
                                        className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-brand-primary/50 transition-all text-lg font-medium active:scale-95"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Image/Emoji Column */}
                        {(payload.image || payload.emoji) && (
                            <div className="order-1 md:order-2 flex justify-center md:justify-end">
                                <div className="relative group max-w-[280px] md:max-w-md w-full aspect-square md:aspect-auto md:h-[400px] flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>

                                    {payload.emoji ? (
                                        <div className="relative z-10 text-[120px] md:text-[180px] leading-none drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300 cursor-default select-none animate-bounce-slow">
                                            {payload.emoji}
                                        </div>
                                    ) : (
                                        <img
                                            src={payload.image}
                                            alt={payload.word}
                                            className="relative w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10 transform group-hover:scale-[1.02] transition-transform duration-500"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (track === 'grammar') {
            return (
                <div className="text-center">
                    <h2 className="text-2xl text-gray-400 mb-4">Grammar Check</h2>
                    <div className="text-3xl font-bold mb-8">{payload.question}</div>
                    <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                        {payload.options.map((opt: string) => (
                            <button key={opt} onClick={() => handleVerify(opt)} className="p-4 bg-white/10 rounded-xl hover:bg-white/20 border border-white/10 transition-colors">
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        if (track === 'listening') {
            return (
                <div className="text-center">
                    <button
                        className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-8 hover:bg-blue-400 shadow-lg shadow-blue-500/50 transition-all hover:scale-105"
                        onClick={() => playAudio(payload.transcript || payload.audio_text)}
                    >
                        <Volume2 size={40} />
                    </button>
                    <p className="mb-4 text-xl">What did you hear?</p>
                    <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                        {payload.options.map((opt: string) => (
                            <button key={opt} onClick={() => handleVerify(opt)} className="p-4 bg-white/10 rounded-xl hover:bg-white/20 text-left border border-white/10">
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        if (track === 'speaking') {
            return (
                <div className="text-center">
                    <h2 className="text-2xl text-gray-400 mb-4">Speak this phrase</h2>
                    <div className="text-4xl font-bold mb-2">{payload.phrase}</div>
                    <div className="text-xl text-gray-500 mb-8">{payload.translation}</div>

                    <button
                        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 transition-all hover:scale-105 ${userInput ? 'bg-green-500' : 'bg-pink-500'}`}
                        onClick={startListening}
                    >
                        <Mic size={40} />
                    </button>

                    {userInput && (
                        <div className="p-4 bg-white/5 rounded-lg">
                            <p className="text-sm text-gray-400">You said:</p>
                            <p className="text-xl">{userInput}</p>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="text-center">
                <h2 className="text-xl mb-4">Track: {track}</h2>
                <p>Content type not supported yet.</p>
                <pre className="text-left bg-black p-4 rounded overflow-auto text-xs">{JSON.stringify(payload, null, 2)}</pre>
                <div className="mt-8">
                    <Button onClick={() => setFeedback('correct')}>Skip</Button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-40 bg-gray-900 text-white flex flex-col p-4">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <button onClick={onBack}><X /></button>
                    <div className="h-2 flex-1 mx-4 bg-gray-700 rounded-full relative">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${((step + 1) / (mission?.sections?.length || 1)) * 100}%` }}></div>
                    </div>

                    {hearts !== undefined && (
                        <div className="flex items-center gap-1.5 text-red-500 font-black mr-4 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <Heart className="fill-red-500" size={18} />
                            <span className="text-lg">{hearts}</span>
                        </div>
                    )}

                    <span>{step + 1}/{mission?.sections?.length || 1}</span>
                </div>

                {/* Content */}
                <Card variant="glass" className="flex-1 flex flex-col items-center justify-center p-8">
                    {renderContent()}
                </Card>

                {/* Footer Feedback */}
                <div className={`mt-4 p-4 rounded-xl flex justify-between items-center transition-all ${feedback === 'correct' ? 'bg-green-500/20 border border-green-500' : feedback === 'incorrect' ? 'bg-red-500/20 border border-red-500' : 'bg-transparent'}`}>
                    {feedback === 'correct' && (
                        <>
                            <div className="flex items-center gap-2 text-green-400 font-bold">
                                <Check /> Excellent!
                            </div>
                            <Button variant="primary" onClick={handleNext}>Continue <ArrowRight size={16} /></Button>
                        </>
                    )}
                    {feedback === 'incorrect' && (
                        <div className="flex items-center gap-2 text-red-400 font-bold">
                            <X /> Try Again
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MissionPlayer;
