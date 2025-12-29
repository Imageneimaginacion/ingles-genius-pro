
import React from 'react';
import { DailyChallenge } from '../types';
import { CheckCircle, Circle, Gift, Zap } from 'lucide-react';

interface DailyChallengesProps {
  challenges: DailyChallenge[];
  onClaim: (id: string) => void;
}

const DailyChallenges: React.FC<DailyChallengesProps> = ({ challenges, onClaim }) => {
  // Calculate progress
  const completedCount = challenges.filter(c => c.completed).length;
  const progressPercent = (completedCount / Math.max(1, challenges.length)) * 100;

  return (
    <div className="bg-space-card border border-space-light rounded-2xl p-4 shadow-lg mb-6">
      <div className="flex justify-between items-center mb-3">
         <h3 className="text-sm font-bold text-space-muted uppercase tracking-widest flex items-center gap-2">
             <Zap size={16} className="text-yellow-400" /> Misiones Diarias
         </h3>
         <span className="text-xs font-bold text-white bg-space-dark px-2 py-1 rounded-md">
             {completedCount}/{challenges.length}
         </span>
      </div>
      
      {/* Overall Progress */}
      <div className="h-1.5 bg-space-dark rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="space-y-3">
          {challenges.map(challenge => (
              <div key={challenge.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${challenge.completed ? 'bg-space-dark/50 border-space-success/30' : 'bg-space-dark border-space-light'}`}>
                  <div className="flex items-center gap-3">
                      {challenge.completed ? (
                          <CheckCircle className="text-space-success" size={20} />
                      ) : (
                          <Circle className="text-space-muted" size={20} />
                      )}
                      <div>
                          <p className={`text-sm font-bold ${challenge.completed ? 'text-space-muted line-through' : 'text-white'}`}>
                              {challenge.description}
                          </p>
                          <div className="text-xs text-space-muted flex gap-2 mt-0.5">
                              <span className="text-yellow-400 flex items-center gap-0.5">+{challenge.rewardXP} XP</span>
                              <span className="text-space-secondary flex items-center gap-0.5">+{challenge.rewardCoins} Coins</span>
                          </div>
                      </div>
                  </div>

                  {challenge.current >= challenge.target && !challenge.completed && (
                      <button 
                        onClick={() => onClaim(challenge.id)}
                        className="bg-yellow-400 text-space-dark text-xs font-bold px-3 py-1.5 rounded-lg animate-bounce"
                      >
                          Reclamar
                      </button>
                  )}
                  
                  {!challenge.completed && challenge.current < challenge.target && (
                      <div className="text-xs font-bold text-space-muted">
                          {challenge.current}/{challenge.target}
                      </div>
                  )}
              </div>
          ))}
      </div>
    </div>
  );
};

export default DailyChallenges;
