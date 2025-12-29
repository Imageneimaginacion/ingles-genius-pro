
import { Rocket, Star, Zap, Heart, Hexagon, Coffee, Coins, Circle, Briefcase, Sun, Home } from 'lucide-react';
import { Level } from '../types';

export const LEVEL_MISSIONS: Record<string, { topic: string, icon: any, color: string, duration: string, xp: number, type: 'vocab' | 'grammar' | 'speak' | 'listening' }[]> = {
    [Level.A1]: [
        { topic: 'Introduction', icon: Rocket, color: 'from-pink-500 to-purple-500', duration: '5 min', xp: 50, type: 'vocab' },
        { topic: 'Greetings', icon: Star, color: 'from-blue-500 to-cyan-500', duration: '6 min', xp: 60, type: 'speak' },
        { topic: 'Numbers', icon: Zap, color: 'from-yellow-400 to-orange-500', duration: '8 min', xp: 70, type: 'vocab' },
        { topic: 'Family', icon: Heart, color: 'from-red-400 to-pink-600', duration: '10 min', xp: 80, type: 'grammar' },
        { topic: 'Objects', icon: Hexagon, color: 'from-indigo-500 to-violet-600', duration: '5 min', xp: 50, type: 'vocab' },
    ],
    [Level.A2]: [
        { topic: 'Routine', icon: Coffee, color: 'from-green-400 to-emerald-600', duration: '8 min', xp: 80, type: 'grammar' },
        { topic: 'Shopping', icon: Coins, color: 'from-yellow-500 to-amber-600', duration: '10 min', xp: 90, type: 'speak' },
        { topic: 'Weather', icon: Sun, color: 'from-cyan-400 to-blue-500', duration: '7 min', xp: 70, type: 'vocab' },
        { topic: 'Home', icon: Home, color: 'from-purple-500 to-indigo-500', duration: '9 min', xp: 85, type: 'vocab' },
        { topic: 'Transport', icon: Rocket, color: 'from-orange-500 to-red-500', duration: '12 min', xp: 100, type: 'grammar' },
    ],
    // Add other levels as needed (mocked for now)
    [Level.B1]: [],
    [Level.B2]: [],
    [Level.C1]: [{ topic: 'Advanced Science', icon: Zap, color: 'from-indigo-500 to-purple-500', duration: '15 min', xp: 150, type: 'vocab' }],
    [Level.C2]: []
};

// Helper function to generate standardized ID
export const getMissionId = (level: string, topic: string) => `${level.split(' ')[0]}_${topic}`;
