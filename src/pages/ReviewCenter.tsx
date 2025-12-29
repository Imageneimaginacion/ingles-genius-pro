
import React, { useState, useEffect } from 'react';
import { WordItem, UserProfile } from '../types';
import { Brain, Volume2, ArrowRight, CheckCircle, Clock, Dumbbell } from 'lucide-react';

interface ReviewCenterProps {
  user: UserProfile | null;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

const ReviewCenter: React.FC<ReviewCenterProps> = ({ user, onUpdateUser }) => {
  const [dueWords, setDueWords] = useState<WordItem[]>([]);
  const [currentCard, setCurrentCard] = useState<WordItem | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    if (user && user.vocabularyBank) {
      const now = Date.now();
      // Filter words where nextReview is in the past
      const due = user.vocabularyBank.filter(w => w.nextReview <= now);
      setDueWords(due);
      if (due.length > 0) setCurrentCard(due[0]);
    }
  }, [user]);

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  // Simple SM-2 inspired Algorithm
  const handleReview = (difficulty: 'hard' | 'good' | 'easy') => {
    if (!currentCard || !user || !user.vocabularyBank) return;

    let nextInterv = 1;
    let nextEase = currentCard.easeFactor;
    let streak = currentCard.streak;

    if (difficulty === 'hard') {
      nextInterv = 1; // Reset to 1 day
      streak = 0;
      nextEase = Math.max(1.3, nextEase - 0.2);
    } else if (difficulty === 'good') {
      nextInterv = streak === 0 ? 1 : streak === 1 ? 3 : Math.round(currentCard.interval * nextEase);
      streak += 1;
    } else {
      // Easy
      nextInterv = streak === 0 ? 2 : streak === 1 ? 4 : Math.round(currentCard.interval * nextEase * 1.3);
      streak += 1;
      nextEase += 0.15;
    }

    const ONE_DAY_MS = 86400000;
    const updatedWord: WordItem = {
      ...currentCard,
      interval: nextInterv,
      easeFactor: nextEase,
      streak: streak,
      nextReview: Date.now() + (nextInterv * ONE_DAY_MS)
    };

    // Update user profile
    const newBank = user.vocabularyBank.map(w => w.id === updatedWord.id ? updatedWord : w);
    onUpdateUser({ vocabularyBank: newBank });

    // Move to next card
    const remaining = dueWords.slice(1);
    setDueWords(remaining);

    setIsFlipped(false);
    if (remaining.length > 0) {
      setCurrentCard(remaining[0]);
    } else {
      setSessionComplete(true);
      setCurrentCard(null);
    }
  };

  if (!user) return null;

  if (sessionComplete || !currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in px-4 text-center">
        <div className="w-24 h-24 bg-space-success/20 rounded-full flex items-center justify-center mb-6 border-2 border-space-success">
          <Dumbbell size={48} className="text-space-success" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2">¡Entrenamiento Completado!</h2>
        <p className="text-white text-lg mb-8 max-w-md bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg font-medium">
          Has repasado todo tu vocabulario pendiente por hoy. Tu memoria neural está optimizada al 100%.
        </p>
        <div className="bg-space-card p-6 rounded-2xl border border-space-light flex gap-8 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{user.vocabularyBank?.length || 0}</div>
            <div className="text-xs text-space-muted uppercase">Total Palabras</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-space-secondary">0</div>
            <div className="text-xs text-space-muted uppercase">Pendientes</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-white uppercase tracking-widest flex items-center justify-center gap-3">
          <Brain className="text-pink-500" /> Gimnasio Mental
        </h1>
        <p className="text-white text-sm mt-2 bg-black/20 px-4 py-1 rounded-full backdrop-blur-md inline-block font-semibold shadow-sm border border-white/10">
          {dueWords.length} palabras pendientes de repaso hoy
        </p>
      </div>

      {/* Flashcard */}
      <div
        className="w-full max-w-md h-80 perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-space-card border-2 border-space-primary rounded-3xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)] p-8 hover:scale-[1.02] transition-transform">
            <span className="text-xs font-bold text-space-muted uppercase tracking-widest mb-4">Inglés</span>
            <h2 className="text-4xl font-extrabold text-white text-center mb-6">{currentCard.word}</h2>
            <button
              onClick={(e) => { e.stopPropagation(); speak(currentCard.word); }}
              className="p-3 bg-space-dark rounded-full hover:text-space-secondary transition-colors"
            >
              <Volume2 size={24} />
            </button>
            <p className="absolute bottom-6 text-space-muted text-xs animate-pulse">Toca para voltear</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-space-dark border-2 border-space-secondary rounded-3xl flex flex-col items-center justify-center shadow-xl p-8">
            <span className="text-xs font-bold text-space-secondary uppercase tracking-widest mb-2">Significado</span>
            <h3 className="text-3xl font-bold text-white mb-6 text-center">{currentCard.translation}</h3>

            <div className="bg-space-card p-4 rounded-xl w-full text-center border border-space-light/30">
              <p className="text-gray-300 italic">"{currentCard.example}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {isFlipped ? (
        <div className="flex gap-4 mt-10 animate-fade-in">
          <button
            onClick={() => handleReview('hard')}
            className="px-6 py-3 bg-space-card border border-space-error text-space-error font-bold rounded-xl hover:bg-space-error hover:text-white transition-colors"
          >
            Difícil (1d)
          </button>
          <button
            onClick={() => handleReview('good')}
            className="px-6 py-3 bg-space-card border border-space-secondary text-space-secondary font-bold rounded-xl hover:bg-space-secondary hover:text-white transition-colors"
          >
            Bien ({Math.round(currentCard.interval * currentCard.easeFactor)}d)
          </button>
          <button
            onClick={() => handleReview('easy')}
            className="px-6 py-3 bg-space-card border border-space-success text-space-success font-bold rounded-xl hover:bg-space-success hover:text-white transition-colors"
          >
            Fácil ({Math.round(currentCard.interval * currentCard.easeFactor * 1.3)}d)
          </button>
        </div>
      ) : (
        <div className="h-[72px] mt-10"></div> // Spacer
      )}
    </div>
  );
};

export default ReviewCenter;
