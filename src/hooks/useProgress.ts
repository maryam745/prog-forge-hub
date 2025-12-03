import { useState, useEffect } from 'react';

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
}

export interface SavedSession {
  id: string;
  language: string;
  code: string;
  timestamp: string;
}

const defaultProgress = (name: string): UserProgress => ({
  name,
  languages: {
    python: { basic: {}, intermediate: {}, advanced: {} },
    javascript: { basic: {}, intermediate: {}, advanced: {} },
    cpp: { basic: {}, intermediate: {}, advanced: {} },
  },
  totalPoints: 0,
});

export const useProgress = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('prognest_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    const storedSessions = localStorage.getItem('prognest_sessions');
    if (storedSessions) {
      setSavedSessions(JSON.parse(storedSessions));
    }

    const lastUser = localStorage.getItem('prognest_current_user');
    if (lastUser) {
      loadUser(lastUser);
    }
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
  };

  const createUser = (name: string) => {
    const newProgress = defaultProgress(name);
    setProgress(newProgress);
    setCurrentUser(name);

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

  const getLevelProgress = (language: string, category: string, level: number) => {
    if (!progress) return null;
    return progress.languages[language]?.[category]?.[level] || null;
  };

  const getCompletedLevels = (language: string, category: string) => {
    if (!progress) return 0;
    const categoryProgress = progress.languages[language]?.[category] || {};
    return Object.values(categoryProgress).filter((l) => l.completed).length;
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
    localStorage.removeItem('prognest_current_user');
  };

  return {
    currentUser,
    progress,
    users,
    savedSessions,
    loadUser,
    createUser,
    completeLevel,
    getLevelProgress,
    getCompletedLevels,
    getTotalCompletedLevels,
    saveSession,
    deleteSession,
    logout,
  };
};
