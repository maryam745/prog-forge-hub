import { useState, useEffect } from 'react';
import { QuizHistoryEntry } from '@/components/QuizDashboard';

export interface UserProgress {
  name: string;
  languages: {
    [language: string]: {
      [category: string]: {
        [level: number]: {
          completed: boolean;
          score: number;
          answers: Record<number, string | number>;
        };
      };
    };
  };
  totalPoints: number;
  quizPoints: number;
  quizzesCompleted: number;
}

export interface SavedSession {
  id: string;
  language: string;
  code: string;
  timestamp: string;
}

export type BadgeTier = 'beginner' | 'bronze' | 'silver' | 'gold' | 'platinum';

const defaultProgress = (name: string): UserProgress => ({
  name,
  languages: {
    python: { basic: {}, intermediate: {}, advanced: {} },
    javascript: { basic: {}, intermediate: {}, advanced: {} },
    cpp: { basic: {}, intermediate: {}, advanced: {} },
  },
  totalPoints: 0,
  quizPoints: 0,
  quizzesCompleted: 0,
});

export const getBadge = (completedLevels: number, totalLevels: number): { tier: BadgeTier; label: string; color: string } => {
  const pct = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
  if (pct >= 90) return { tier: 'platinum', label: 'Platinum', color: 'from-cyan-300 to-cyan-500' };
  if (pct >= 70) return { tier: 'gold', label: 'Gold', color: 'from-yellow-400 to-amber-500' };
  if (pct >= 45) return { tier: 'silver', label: 'Silver', color: 'from-gray-300 to-gray-400' };
  if (pct >= 20) return { tier: 'bronze', label: 'Bronze', color: 'from-orange-400 to-orange-600' };
  return { tier: 'beginner', label: 'Beginner', color: 'from-muted to-muted-foreground/30' };
};

// Per language: basic 15 + intermediate 15 + advanced 12 = 42
export const LEVELS_PER_LANGUAGE = 42;

export const useProgress = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryEntry[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('prognest_users');
    if (storedUsers) setUsers(JSON.parse(storedUsers));

    const storedSessions = localStorage.getItem('prognest_sessions');
    if (storedSessions) setSavedSessions(JSON.parse(storedSessions));

    const lastUser = localStorage.getItem('prognest_current_user');
    if (lastUser) loadUser(lastUser);
  }, []);

  const loadUser = (name: string) => {
    const storedProgress = localStorage.getItem(`prognest_progress_${name}`);
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    } else {
      setProgress(defaultProgress(name));
    }
    setCurrentUser(name);
    localStorage.setItem('prognest_current_user', name);

    const storedHistory = localStorage.getItem(`prognest_quiz_history_${name}`);
    if (storedHistory) setQuizHistory(JSON.parse(storedHistory));
    else setQuizHistory([]);
  };

  const createUser = (name: string) => {
    const newProgress = defaultProgress(name);
    setProgress(newProgress);
    setCurrentUser(name);
    setQuizHistory([]);

    const updatedUsers = [...users, name];
    setUsers(updatedUsers);
    localStorage.setItem('prognest_users', JSON.stringify(updatedUsers));
    localStorage.setItem(`prognest_progress_${name}`, JSON.stringify(newProgress));
    localStorage.setItem('prognest_current_user', name);
  };

  const saveProgress = (updatedProgress: UserProgress) => {
    setProgress(updatedProgress);
    if (currentUser) {
      localStorage.setItem(`prognest_progress_${currentUser}`, JSON.stringify(updatedProgress));
    }
  };

  const completeLevel = (
    language: string,
    category: string,
    level: number,
    score: number,
    answers: Record<number, string | number>
  ) => {
    if (!progress) return;

    const updatedProgress = { ...progress };
    if (!updatedProgress.languages[language]) {
      updatedProgress.languages[language] = { basic: {}, intermediate: {}, advanced: {} };
    }
    if (!updatedProgress.languages[language][category]) {
      updatedProgress.languages[language][category] = {};
    }

    const previousScore = updatedProgress.languages[language][category][level]?.score || 0;
    updatedProgress.languages[language][category][level] = {
      completed: true,
      score,
      answers,
    };

    updatedProgress.totalPoints += score - previousScore;
    saveProgress(updatedProgress);
  };

  const addQuizPoints = (score: number) => {
    if (!progress) return;
    const updatedProgress = {
      ...progress,
      totalPoints: progress.totalPoints + score,
      quizPoints: (progress.quizPoints || 0) + score,
      quizzesCompleted: (progress.quizzesCompleted || 0) + 1,
    };
    saveProgress(updatedProgress);
  };

  const addQuizHistory = (entry: Omit<QuizHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: QuizHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const updated = [...quizHistory, newEntry];
    setQuizHistory(updated);
    if (currentUser) {
      localStorage.setItem(`prognest_quiz_history_${currentUser}`, JSON.stringify(updated));
    }
  };

  const deleteQuizHistory = (id: string) => {
    const updated = quizHistory.filter((h) => h.id !== id);
    setQuizHistory(updated);
    if (currentUser) {
      localStorage.setItem(`prognest_quiz_history_${currentUser}`, JSON.stringify(updated));
    }
  };

  const getLevelProgress = (language: string, category: string, level: number) => {
    if (!progress) return null;
    return progress.languages[language]?.[category]?.[level] || null;
  };

  const getCompletedLevels = (language: string, category: string) => {
    if (!progress) return 0;
    const categoryProgress = progress.languages[language]?.[category] || {};
    return Object.values(categoryProgress).filter((l) => l.completed).length;
  };

  const getLanguageCompletedLevels = (language: string) => {
    if (!progress) return 0;
    let total = 0;
    const lang = progress.languages[language];
    if (!lang) return 0;
    Object.values(lang).forEach((cat) => {
      total += Object.values(cat).filter((l) => l.completed).length;
    });
    return total;
  };

  const getTotalCompletedLevels = () => {
    if (!progress) return 0;
    let total = 0;
    Object.values(progress.languages).forEach((lang) => {
      Object.values(lang).forEach((cat) => {
        total += Object.values(cat).filter((l) => l.completed).length;
      });
    });
    return total;
  };

  const saveSession = (language: string, code: string) => {
    const session: SavedSession = {
      id: Date.now().toString(),
      language,
      code,
      timestamp: new Date().toISOString(),
    };
    const updated = [...savedSessions, session];
    setSavedSessions(updated);
    localStorage.setItem('prognest_sessions', JSON.stringify(updated));
    return session;
  };

  const deleteSession = (id: string) => {
    const updated = savedSessions.filter((s) => s.id !== id);
    setSavedSessions(updated);
    localStorage.setItem('prognest_sessions', JSON.stringify(updated));
  };

  const logout = () => {
    setCurrentUser(null);
    setProgress(null);
    setQuizHistory([]);
    localStorage.removeItem('prognest_current_user');
  };

  return {
    currentUser,
    progress,
    users,
    savedSessions,
    quizHistory,
    loadUser,
    createUser,
    completeLevel,
    addQuizPoints,
    addQuizHistory,
    deleteQuizHistory,
    getLevelProgress,
    getCompletedLevels,
    getLanguageCompletedLevels,
    getTotalCompletedLevels,
    saveSession,
    deleteSession,
    logout,
  };
};
