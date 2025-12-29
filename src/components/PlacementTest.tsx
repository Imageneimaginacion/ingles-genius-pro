
import React, { useState } from 'react';
import { Rocket, Brain, Check, ArrowRight, Target } from 'lucide-react';
import { Level } from '../types';

interface PlacementTestProps {
  onComplete: (suggestedLevel: Level, age: number, goal: string) => void;
  initialName: string;
  initialAge: number;
}

const PlacementTest: React.FC<PlacementTestProps> = ({ onComplete, initialName, initialAge }) => {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [score, setScore] = useState(0);

  // Simple assessment questions
  const questions = [
    {
      q: "How do you say 'Buenos días' in English?",
      options: ["Good night", "Good morning", "Hello", "Good bye"],
      ans: "Good morning",
      value: 1
    },
    {
      q: "Complete: She _____ play soccer.",
      options: ["don't", "doesn't", "not", "no"],
      ans: "doesn't",
      value: 2
    },
    {
      q: "Translate: 'He estado trabajando aquí por dos años.'",
      options: ["I am working here for two years", "I have been working here for two years", "I work here since two years", "I was working here two years"],
      ans: "I have been working here for two years",
      value: 3
    }
  ];

  const goals = [
    { id: 'travel', label: 'Viajar / Turismo', icon: '✈️' },
    { id: 'school', label: 'Escuela / Universidad', icon: '🎓' },
    { id: 'work', label: 'Trabajo / Negocios', icon: '💼' },
    { id: 'fun', label: 'Hobby / Diversión', icon: '🎮' }
  ];

  const handleAnswer = (option: string, correct: string, val: number) => {
    if (option === correct) setScore(s => s + val);
    setStep(s => s + 1);
  };

  const finish = () => {
    // Simple logic to determine initial level
    let suggested = Level.A1;
    if (score >= 5) suggested = Level.B1;
    else if (score >= 2) suggested = Level.A2;
    
    onComplete(suggested, initialAge, goal);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-space-dark flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-space-card border-2 border-space-primary rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-space-secondary/20 rounded-full blur-3xl"></div>
        
        {step === 0 && (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 bg-space-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              <Target size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">¡Hola, {initialName}!</h1>
            <p className="text-space-muted mb-8">Antes de despegar, necesitamos calibrar tus sistemas de navegación.</p>
            
            <h3 className="text-space-secondary font-bold uppercase tracking-widest mb-4 text-sm">¿Cuál es tu objetivo principal?</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {goals.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${goal === g.id ? 'bg-space-primary/20 border-space-primary text-white' : 'bg-space-dark border-space-light text-gray-400 hover:border-gray-500'}`}
                >
                  <span className="text-2xl block mb-1">{g.icon}</span>
                  <span className="text-xs font-bold uppercase">{g.label}</span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => goal && setStep(1)}
              disabled={!goal}
              className="w-full bg-gradient-brand text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              INICIAR DIAGNÓSTICO
            </button>
          </div>
        )}

        {step > 0 && step <= questions.length && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
               <span className="text-space-muted font-bold text-xs uppercase">Pregunta {step} de {questions.length}</span>
               <Brain className="text-space-secondary" size={20} />
             </div>
             
             <h2 className="text-xl font-bold text-white mb-8">{questions[step - 1].q}</h2>
             
             <div className="space-y-3">
               {questions[step - 1].options.map(opt => (
                 <button
                   key={opt}
                   onClick={() => handleAnswer(opt, questions[step - 1].ans, questions[step - 1].value)}
                   className="w-full text-left p-4 rounded-xl bg-space-dark border border-space-light text-gray-300 hover:border-space-secondary hover:text-white transition-colors font-medium"
                 >
                   {opt}
                 </button>
               ))}
             </div>
          </div>
        )}

        {step > questions.length && (
           <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                <Check size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Calibración Completa</h2>
              <p className="text-space-muted mb-6">Hemos analizado tus respuestas.</p>
              
              <div className="bg-space-dark p-6 rounded-2xl border border-space-light mb-8">
                <p className="text-xs text-space-muted uppercase font-bold mb-2">Nivel Recomendado</p>
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                   {score >= 5 ? 'B1 - Intermedio' : score >= 2 ? 'A2 - Básico' : 'A1 - Principiante'}
                </div>
              </div>
              
              <button 
                onClick={finish}
                className="w-full bg-space-success text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                COMENZAR AVENTURA <ArrowRight size={20} />
              </button>
           </div>
        )}

      </div>
    </div>
  );
};

export default PlacementTest;
