
import React from 'react';

export enum Level {
  A1 = 'A1 (Principiante)',
  A2 = 'A2 (Básico)',
  B1 = 'B1 (Intermedio)',
  B2 = 'B2 (Intermedio Alto)',
  C1 = 'C1 (Avanzado)',
  C2 = 'C2 (Maestría)'
}

export const LEVEL_ORDER = [Level.A1, Level.A2, Level.B1, Level.B2, Level.C1, Level.C2];

export interface VocabularyItem {
  word: string;
  translation: string;
  example: string;
}

export interface WordItem extends VocabularyItem {
  id: string;
  topic: string;
  learnedDate: number;
  nextReview: number;
  easeFactor: number;
  interval: number;
  streak: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface LessonData {
  title: string;
  emoji: string;
  explanation_es: string;
  explanation_en: string;
  vocabulary: VocabularyItem[];
  quiz: QuizQuestion[];
  objective: string;
  activeProduction: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachment?: string;
}

export interface Certificate {
  id: string;
  title: string;
  level: string;
  date: string;
  imageUrl?: string;
}

export interface DailyChallenge {
  id: string;
  description: string; // "Complete 2 speaking missions"
  target: number; // 2
  current: number; // 1
  completed: boolean;
  rewardXP: number;
  rewardCoins: number;
  type: 'lesson' | 'quiz_score' | 'speak' | 'streak';
}

export interface Streak {
  current: number;
  best: number;
  lastLoginDate: string; // YYYY-MM-DD
}

export interface UserProfile {
  id: string; // Added to fix TS error
  name: string;
  email?: string; // For auth
  password?: string; // For auth
  age: number;
  isPremium: boolean;
  theme?: string; // "default", "adult", "midnight"
  preferredVoiceURI?: string;
  avatar?: string;
  lastActive?: number;

  // Game State
  coins: number;
  xp: number; // Added to fix TS error
  streak: Streak;
  inventory: string[]; // IDs of owned items
  dailyChallenges: DailyChallenge[];
  challengeDate: string; // Date when challenges were generated

  completedTopics?: string[];
  unlockedLevelIndex?: number;
  unlockedLevels?: string[]; // Added
  completedMissions?: any[]; // Added (UserMissionProgress objects or similar)
  tutorialCompleted?: boolean;
  placementTestCompleted?: boolean;
  level?: string;
  activeBadge?: string; // ID of the equipped badge
  vocabularyBank?: WordItem[];

  stats?: {
    savedLessons: number;
    lessonsCompleted: number;
    currentLevelProgress: number;
    phase1Progress: number;
    phase2Progress: number;
    phase3Progress: number;
  };
  achievements?: {
    lessonsCompleted: number;
    wordsLearned: number;
    quizPerfect: number;
  };
  certificates?: Certificate[];
}

export interface ShopItem {
  id: string;
  title: string;
  desc: string;
  price: number;
  currency: 'xp' | 'coins';
  icon: React.ReactNode;
  category: 'cosmetic' | 'powerup';
  reqAge?: 'kid' | 'adult' | 'all'; // For filtering shop
}

export type AppMode = 'home' | 'learn' | 'chat' | 'shop' | 'achievements' | 'review' | 'studio';
