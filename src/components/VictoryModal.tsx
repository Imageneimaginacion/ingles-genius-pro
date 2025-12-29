import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface VictoryModalProps {
    courseTitle: string;
    onClose: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ courseTitle, onClose }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 overflow-hidden"
            >
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/20 blur-[150px] rounded-full animate-pulse-slow"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                </div>

                <div className="relative w-full max-w-lg text-center z-10">

                    {/* Floating Particles/Stars */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                                x: Math.random() * 400 - 200,
                                y: Math.random() * 400 - 200,
                                rotate: Math.random() * 360
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: "easeOut"
                            }}
                            className="absolute top-1/2 left-1/2 text-yellow-400 pointer-events-none"
                        >
                            <Star fill="currentColor" size={20 + Math.random() * 20} />
                        </motion.div>
                    ))}

                    {/* Main Trophy */}
                    <motion.div
                        initial={{ scale: 0, rotate: -720, y: 100 }}
                        animate={{ scale: 1, rotate: 0, y: 0 }}
                        transition={{ type: "spring", bounce: 0.6, duration: 1.5 }}
                        className="relative w-64 h-64 mx-auto mb-12"
                    >
                        {/* Glow behind trophy */}
                        <div className="absolute inset-0 bg-yellow-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>

                        <div className="relative w-full h-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 rounded-full flex items-center justify-center border-[6px] border-yellow-200 shadow-[0_0_100px_rgba(251,191,36,0.8)] ring-4 ring-yellow-500/50">
                            <Trophy size={120} className="text-yellow-50 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" strokeWidth={1.5} />

                            {/* Shine effect */}
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 animate-shine" />
                        </div>

                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-4 border border-dashed border-yellow-400/50 rounded-full"
                        />
                    </motion.div>

                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 mb-6 uppercase tracking-wider drop-shadow-2xl"
                    >
                        ¡VICTORIA!
                    </motion.h1>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mb-10"
                    >
                        <p className="text-gray-400 text-lg uppercase tracking-widest font-bold mb-2">Has completado el curso</p>
                        <p className="text-3xl md:text-4xl text-white font-black bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm inline-block shadow-lg">
                            {courseTitle}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="flex flex-col gap-4 items-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(250, 204, 21, 0.6)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="w-full max-w-sm px-8 py-5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-black text-xl rounded-2xl shadow-2xl transition-all uppercase tracking-widest border border-yellow-300/30 flex items-center justify-center gap-3 group"
                        >
                            <Sparkles className="animate-spin-slow group-hover:animate-spin" /> Ver Tu Recompensa
                        </motion.button>

                        <p className="text-gray-500 text-sm animate-pulse">Tu certificado oficial está listo para imprimirse.</p>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VictoryModal;
