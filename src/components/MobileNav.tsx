
import React from 'react';
import { AppMode } from '../types';
import { Home, MessageCircle, User, Store, Clapperboard } from 'lucide-react';

interface MobileNavProps {
   currentMode: AppMode;
   setMode: (mode: AppMode) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentMode, setMode }) => {
   return (
      <div className="flex justify-around py-4 bg-space-card/95 backdrop-blur-lg border-t border-space-border text-space-muted fixed bottom-0 left-0 w-full z-50 pb-safe">
         <button onClick={() => setMode('learn')} className="flex flex-col items-center justify-center active:scale-95 transition-transform p-2">
            <Home size={28} strokeWidth={2.5} className={currentMode === 'learn' || currentMode === 'home' ? "text-brand-primary drop-shadow-neon" : "text-space-muted"} />
         </button>
         <button onClick={() => setMode('chat')} className="flex flex-col items-center justify-center active:scale-95 transition-transform p-2">
            <MessageCircle size={28} strokeWidth={2.5} className={currentMode === 'chat' ? "text-brand-primary drop-shadow-neon" : "text-space-muted"} />
         </button>

         <button onClick={() => setMode('shop')} className="flex flex-col items-center justify-center active:scale-95 transition-transform p-2">
            <Store size={28} strokeWidth={2.5} className={currentMode === 'shop' ? "text-brand-primary drop-shadow-neon" : "text-space-muted"} />
         </button>
         <button onClick={() => setMode('achievements')} className="flex flex-col items-center justify-center active:scale-95 transition-transform p-2">
            <User size={28} strokeWidth={2.5} className={currentMode === 'achievements' ? "text-brand-primary drop-shadow-neon" : "text-space-muted"} />
         </button>
      </div>
   );
};

export default MobileNav;
