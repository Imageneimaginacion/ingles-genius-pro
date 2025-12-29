import React, { useState } from 'react';
import { Rocket, MessageCircle, Store, User, ArrowRight, Check } from 'lucide-react';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bienvenido a Inglés Genius Pro",
      desc: "Tu misión es dominar el inglés para explorar nuevas galaxias. Aquí tienes tu equipo básico.",
      icon: <Rocket size={64} className="text-space-primary animate-bounce" />,
      color: "border-space-primary"
    },
    {
      title: "Misiones de Aprendizaje",
      desc: "Completa lecciones interactivas adaptadas a tu nivel. ¡Cuidado! Necesitas 80% de precisión para avanzar.",
      icon: <div className="relative"><Rocket size={64} className="text-yellow-400" /><span className="absolute top-0 right-0 text-2xl">📚</span></div>,
      color: "border-yellow-400"
    },
    {
      title: "Enlace de Comunicación",
      desc: "Practica conversación con tu Tutor AI. Puedes hablar, escribir e incluso enviar FOTOS para analizar.",
      icon: <MessageCircle size={64} className="text-space-secondary" />,
      color: "border-space-secondary"
    },
    {
      title: "Arsenal y Tienda",
      desc: "Gana XP y Gemas para comprar mejoras, vidas y personalizaciones para tu avatar.",
      icon: <Store size={64} className="text-space-accent" />,
      color: "border-space-accent"
    },
    {
      title: "Tu Perfil de Cadete",
      desc: "Rastrea tu progreso, colecciona medallas y descarga tus certificados oficiales.",
      icon: <User size={64} className="text-green-400" />,
      color: "border-green-400"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[200] bg-space-dark/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className={`bg-space-card border-2 ${currentStep.color} rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-500`}>
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-space-dark via-white/20 to-space-dark"></div>
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className={`w-24 h-24 rounded-full bg-space-dark border-4 ${currentStep.color} flex items-center justify-center mb-6 shadow-xl`}>
            {currentStep.icon}
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-4">{currentStep.title}</h2>
          <p className="text-space-muted text-lg leading-relaxed">{currentStep.desc}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-3 h-3 rounded-full transition-all ${idx === step ? `bg-white scale-125` : 'bg-space-light'}`}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full bg-white text-space-dark font-extrabold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          {step === steps.length - 1 ? (
            <>Comenzar Misión <Check size={20} /></>
          ) : (
            <>Siguiente <ArrowRight size={20} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingTutorial;