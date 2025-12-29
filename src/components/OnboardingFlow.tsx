import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Rocket, Briefcase, Globe, BookOpen, Star, Check, ChevronRight, Clock, Bell } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface OnboardingFlowProps {
    initialAgeGroup: 'kid' | 'teen' | 'adult';
    onBack: () => void;
    onComplete: (data: any) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ initialAgeGroup, onBack, onComplete }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        english_level: '',
        motivation: '',
        daily_goal_min: 10,
        notifications: false,
        start_point: '', // New / Existing
        name: '' // Will assume name is collected at registration time or duplicate here if needed. 
        // The prompt implies "start questions" then register. 
        // We will collect the data here and pass to AuthScreen.
    });

    const handleNext = () => {
        if (step < 6) {
            setStep(prev => prev + 1);
        } else {
            onComplete(data);
        }
    };

    const updateData = (field: string, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const slideVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                            Evaluación Inicial
                        </h1>
                        <p className="text-space-muted mb-8 text-lg">
                            Responde 7 preguntas cortas para evaluarte y personalizar tu experiencia.
                        </p>
                        <Button variant="neon" size="lg" className="px-12" onClick={handleNext}>
                            ¡Comenzar! <Rocket className="ml-2" />
                        </Button>
                    </>
                );
            case 2:
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-6">¿Cuánto inglés sabes?</h2>
                        <div className="space-y-3 w-full">
                            {[
                                { val: 'A', text: 'Estoy empezando (A1)' },
                                { val: 'B', text: 'Puedo mantener conversaciones simples (A2)' },
                                { val: 'C', text: 'Puedo conversar sobre varios temas (B1-B2)' },
                                { val: 'D', text: 'Puedo debatir en detalle (C1-C2)' }
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    onClick={() => { updateData('english_level', opt.val); handleNext(); }}
                                    className={`w-full p-4 rounded-xl border text-left flex items-center transition-all ${data.english_level === opt.val
                                            ? 'bg-brand-primary/20 border-brand-primary'
                                            : 'bg-space-card/50 border-space-border hover:bg-space-card'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-space-dark border border-white/20 flex items-center justify-center mr-4 font-bold">
                                        {opt.val}
                                    </div>
                                    <span className="font-medium text-lg">{opt.text}</span>
                                </button>
                            ))}
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-6">¿Por qué quieres aprender inglés?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            {[
                                { val: 'A', text: 'Ejercitar mi mente', icon: Star },
                                { val: 'B', text: 'Impulsar carrera', icon: Briefcase },
                                { val: 'C', text: 'Diversión', icon: Rocket }, // Changed Fun icon
                                { val: 'D', text: 'Estudios', icon: BookOpen }
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    onClick={() => { updateData('motivation', opt.val); handleNext(); }}
                                    className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${data.motivation === opt.val
                                            ? 'bg-brand-secondary/20 border-brand-secondary shadow-lg'
                                            : 'bg-space-card/50 border-space-border hover:bg-space-card'
                                        }`}
                                >
                                    <opt.icon size={32} className="text-blue-400" />
                                    <span className="font-medium text-lg text-center">{opt.text}</span>
                                </button>
                            ))}
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-6">¿Cuál es tu meta diaria?</h2>
                        <div className="space-y-4 w-full">
                            {[
                                { val: 3, text: 'Relajado (3 min/día)' },
                                { val: 10, text: 'Normal (10 min/día)' },
                                { val: 30, text: 'Serio (30 min/día)' }
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    onClick={() => { updateData('daily_goal_min', opt.val); handleNext(); }}
                                    className={`w-full p-5 rounded-xl border text-left flex items-center justify-between transition-all ${data.daily_goal_min === opt.val
                                            ? 'bg-green-500/20 border-green-500'
                                            : 'bg-space-card/50 border-space-border hover:bg-space-card'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Clock className="text-green-400" />
                                        <span className="font-bold text-lg">{opt.text}</span>
                                    </div>
                                    {data.daily_goal_min === opt.val && <Check className="text-green-500" />}
                                </button>
                            ))}
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
                            <Bell size={48} className="text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">¡Hábito Atómico!</h2>
                        <p className="text-space-muted mb-8">
                            Permite notificaciones para no perder tu racha y convertir el aprendizaje en un hábito.
                        </p>
                        <div className="flex flex-col gap-3 w-full">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => { updateData('notifications', true); handleNext(); }}
                            >
                                Permitir Notificaciones
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => { updateData('notifications', false); handleNext(); }}
                            >
                                Ahora no
                            </Button>
                        </div>
                    </>
                );
            case 6:
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-6">¿Desde dónde empezamos?</h2>
                        <div className="space-y-4 w-full">
                            <button
                                onClick={() => { updateData('start_point', 'new'); onComplete({ ...data, start_point: 'new' }); }}
                                className="w-full p-6 rounded-xl border border-space-border bg-space-card/50 hover:bg-space-card hover:border-brand-primary transition-all text-left group"
                            >
                                <h3 className="text-xl font-bold mb-1 group-hover:text-brand-primary transition-colors">A) Primera vez</h3>
                                <p className="text-space-muted">Voy a aprender inglés desde cero.</p>
                            </button>

                            <button
                                onClick={() => { updateData('start_point', 'existing'); onComplete({ ...data, start_point: 'existing' }); }}
                                className="w-full p-6 rounded-xl border border-space-border bg-space-card/50 hover:bg-space-card hover:border-brand-secondary transition-all text-left group"
                            >
                                <h3 className="text-xl font-bold mb-1 group-hover:text-brand-secondary transition-colors">B) Ya sé algo</h3>
                                <p className="text-space-muted">Quiero hacer una prueba de nivel.</p>
                            </button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen w-full bg-space-black text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none bg-space-gradient opacity-50"></div>

            <Card variant="glass" className="w-full max-w-2xl relative z-10 min-h-[400px] flex flex-col p-8 border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    {step > 1 && (
                        <button onClick={() => setStep(step - 1)} className="text-space-muted hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div className="flex-1 flex justify-center gap-1 mx-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-brand-primary' : 'bg-space-border'}`}></div>
                        ))}
                    </div>
                    <div className="w-6"></div> {/* Spacer */}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col items-center text-center w-full"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </Card>
        </div>
    );
};

export default OnboardingFlow;
