import React from 'react';
import { BookOpen, MessageCircle, GraduationCap } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, setMode }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setMode('home')}>
            <div className="bg-brand-500 p-2 rounded-lg text-white mr-2">
              <GraduationCap size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              Inglés <span className="text-brand-600">Genius Pro</span>
            </h1>
          </div>

          <nav className="flex space-x-2 sm:space-x-4">
            <button
              onClick={() => setMode('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'home' 
                  ? 'bg-brand-100 text-brand-900' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setMode('learn')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'learn' 
                  ? 'bg-brand-100 text-brand-900' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BookOpen size={18} className="mr-1 sm:mr-2" />
              Lecciones
            </button>
            <button
              onClick={() => setMode('chat')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'chat' 
                  ? 'bg-brand-100 text-brand-900' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MessageCircle size={18} className="mr-1 sm:mr-2" />
              Tutor AI
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;