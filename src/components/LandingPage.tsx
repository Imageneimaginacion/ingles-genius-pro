import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Zap, Award, Rocket, Star, CheckCircle, ArrowRight } from 'lucide-react';

interface LandingPageProps {
    mode: 'adult' | 'kid';
    onGetStarted: () => void;
    onSignIn: () => void;
    toggleMode: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ mode, onGetStarted, onSignIn, toggleMode }) => {
    const isAdult = mode === 'adult';

    return (
        <div className={`min-h-screen w-full flex items-center justify-center p-4 md:p-8 transition-colors duration-700 overflow-y-auto
            ${isAdult ? 'bg-space-dark' : 'bg-gradient-kids'}
        `}>
            {/* Main Card Container */}
            <div className={`relative w-full max-w-6xl min-h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row 
                ${isAdult ? 'bg-space-card/80 border border-space-light backdrop-blur-xl' : 'bg-white/90 backdrop-blur-xl border-4 border-purple-300'}
            `}>
                {/* Left Content */}
                <div className="flex-1 p-6 md:p-10 flex flex-col justify-center z-10 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-lg
                ${isAdult
                                ? 'bg-gradient-to-br from-space-primary to-space-primary-dark text-white'
                                : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                            }
            `}>
                            <Rocket size={24} className="text-white" />
                        </div>
                        <span className={`text-lg font-bold ${isAdult ? 'text-white' : 'text-gray-800'}`}>Inglés Genius Pro</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={`text-4xl md:text-6xl font-black mb-4 leading-tight
                ${isAdult ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500'}
            `}
                    >
                        {isAdult ? "Domina el Inglés." : "¡Aventura Espacial!"}
                        <br />
                        <span className={isAdult ? 'text-space-primary' : 'text-space-secondary'}>
                            {isAdult ? "Desbloquea tu Futuro." : "Aprende Jugando."}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`text-base md:text-lg mb-6 max-w-md
                ${isAdult ? 'text-space-muted' : 'text-gray-600 font-medium'}
            `}
                    >
                        {isAdult
                            ? "La plataforma impulsada por IA diseñada para profesionales. Aprende más rápido con misiones personalizadas y escenarios del mundo real."
                            : "¡Únete a la tripulación! Gana monedas, colecciona robots y aprende inglés con misiones divertidas."}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="space-y-3 mb-8"
                    >
                        {[
                            { text: isAdult ? "Ecosistema Gamificado" : "Misiones Divertidas", icon: isAdult ? Globe : Rocket, color: "text-blue-400" },
                            { text: isAdult ? "Lecciones Inteligentes de IA" : "Gana Estrellas y XP", icon: isAdult ? Zap : Star, color: "text-yellow-400" },
                            { text: isAdult ? "Progreso Certificado" : "Colecciona Premios", icon: isAdult ? Award : CheckCircle, color: "text-green-400" }
                        ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`p-1.5 rounded-full ${isAdult ? 'bg-space-dark' : 'bg-purple-100'}`}>
                                    <feat.icon className={feat.color} size={18} />
                                </div>
                                <span className={`text-sm md:text-base font-medium ${isAdult ? 'text-gray-300' : 'text-gray-700'}`}>{feat.text}</span>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-3"
                    >
                        <button
                            onClick={onGetStarted}
                            className={`group px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                        ${isAdult
                                    ? 'bg-space-primary text-white hover:bg-space-primary-dark shadow-space-primary/20'
                                    : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-orange-400/30'
                                }
                    `}
                        >
                            {isAdult ? "Empezar" : "¡Empezar Ya!"}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={onSignIn}
                            className={`px-6 py-3 rounded-xl font-bold text-lg transition-colors border-2
                        ${isAdult
                                    ? 'border-space-light text-gray-400 hover:text-white hover:border-white'
                                    : 'border-purple-200 text-purple-500 hover:bg-purple-50'
                                }
                    `}
                        >
                            {isAdult ? "Iniciar Sesión" : "Ya tengo cuenta"}
                        </button>
                    </motion.div>
                </div>

                {/* Right Decoration */}
                <div className={`hidden md:flex flex-1 items-center justify-center relative overflow-hidden
            ${isAdult ? 'bg-space-dark/50' : 'bg-gradient-kids'}
        `}>
                    {isAdult ? (
                        <div className="relative w-full h-full">
                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, #3EC6FF 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-space-primary rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-dashed border-space-secondary rounded-full opacity-30"
                            />

                            {/* Floating Cards */}
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-20 right-20 bg-space-card p-4 rounded-xl border border-space-light shadow-2xl"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle size={16} className="text-green-500" /></div>
                                    <span className="text-white font-bold text-sm">Meta Diaria Cumplida</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full w-32 overflow-hidden"><div className="h-full bg-green-500 w-[80%]"></div></div>
                            </motion.div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                            <motion.img
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, y: [0, -20, 0] }}
                                transition={{
                                    scale: { duration: 0.5 },
                                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                }}
                                src="https://api.dicebear.com/9.x/bottts/svg?seed=RobotHappy&backgroundColor=transparent"
                                alt="Mascot"
                                className="w-80 h-80 drop-shadow-2xl relative z-10"
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute top-20 right-20"
                            >
                                <Star className="text-yellow-300" size={40} fill="currentColor" />
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
