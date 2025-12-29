import React from 'react';
import { motion } from 'framer-motion';
import { AppMode } from '../types';
import { Home, MessageCircle, Store, User, Rocket, LogOut, Brain } from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  onLogout?: () => void;
  userParams?: {
    xp?: number;
    level?: string;
    avatar?: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, onLogout, userParams }) => {
  const navItems = [
    { id: 'learn', label: 'MISIONES', sub: 'Campaña Principal', icon: Home, badge: '1 NUEVA' },
    { id: 'review', label: 'ENTRENAMIENTO', sub: 'Práctica Diaria', icon: Brain },
    { id: 'chat', label: 'COMUNICACIONES', sub: 'IA Conversacional', icon: MessageCircle },
    { id: 'shop', label: 'ARSENAL', sub: 'Tecnología y Recursos', icon: Store },
    { id: 'achievements', label: 'PERFIL', sub: 'Rango y Estadísticas', icon: User, isAvatar: true },
  ];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col p-4 h-full bg-[#0F131A] border-r border-white/5 shadow-2xl z-50 relative"
    >
      {/* Brand Header */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mb-10 px-2 py-4 flex items-center gap-3 cursor-pointer group"
        onClick={() => setMode('learn')}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/10 border border-white/10 relative z-10">
            <Rocket className="text-white" size={24} />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight leading-none">
            Inglés Genius <span className="text-blue-500">Pro</span>
          </h1>
          <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Plataforma Educativa</span>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="space-y-3 flex-1">
        {navItems.map((item) => {
          const isActive = currentMode === item.id || (item.id === 'learn' && currentMode === 'home');

          return (
            <motion.button
              key={item.id}
              onClick={() => setMode(item.id as AppMode)}
              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
              whileTap={{ scale: 0.98 }}
              className={`w-full group flex items-center gap-4 px-3 py-3 rounded-xl transition-all border ${isActive
                ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
            >
              {/* Icon Container */}
              <div className={`relative p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500 group-hover:text-gray-300'}`}>
                {item.isAvatar && userParams?.avatar ? (
                  <div className="relative">
                    <img src={userParams.avatar} alt="User" className="w-5 h-5 rounded-full object-cover" />
                    {/* Mini Progress Ring Mock */}
                    <svg className="absolute -top-1 -left-1 w-7 h-7 rotate-[-90deg]" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="text-transparent" />
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="60" strokeDashoffset="20" className="text-blue-500" strokeLinecap="round" />
                    </svg>
                  </div>
                ) : (
                  <item.icon size={20} strokeWidth={2.5} />
                )}
              </div>

              {/* Text Context */}
              <div className="text-left flex-1">
                <div className={`text-sm font-black tracking-wide ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white transition-colors'}`}>
                  {item.label}
                </div>
                <div className="text-[10px] text-gray-500 font-medium tracking-wider uppercase group-hover:text-blue-400/80 transition-colors">
                  {item.sub}
                </div>
              </div>

              {/* Badge */}
              {item.badge && !isActive && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-[9px] font-bold text-white shadow-lg shadow-blue-500/40 animate-pulse">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-white/5 pt-6">
        <motion.button
          whileHover={{ x: 4, color: '#EF4444' }}
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-red-500/10"
        >
          <LogOut size={18} strokeWidth={2.5} />
          Desconectar
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;