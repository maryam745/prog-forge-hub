import { useState, useEffect } from 'react';
import { useProgress } from '@/hooks/useProgress';
import SplashScreen from '@/components/SplashScreen';
import UserScreen from '@/components/UserScreen';
import Dashboard from '@/components/Dashboard';
import LanguageSelection from '@/components/LanguageSelection';
import LanguageIntro from '@/components/LanguageIntro';
import MenuScreen from '@/components/MenuScreen';
import CategorySelection from '@/components/CategorySelection';
import LevelsScreen from '@/components/LevelsScreen';
import QuestionScreen from '@/components/QuestionScreen';
import RunCodeScreen from '@/components/RunCodeScreen';
import SavedSessions from '@/components/SavedSessions';
import TopicsScreen from '@/components/TopicsScreen';
import AIQuizScreen from '@/components/AIQuizScreen';

type Screen =
  | 'splash'
  | 'user'
  | 'dashboard'
  | 'language-selection'
  | 'language-intro'
  | 'menu'
  | 'category-selection'
  | 'levels'
  | 'questions'
  | 'run-code'
  | 'saved-sessions'
  | 'topics'
  | 'ai-quiz'
  | 'ai-quiz-category';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'cpp' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'basic' | 'intermediate' | 'advanced' | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [aiQuizQuestions, setAIQuizQuestions] = useState<any[]>([]);

  const {
    currentUser, progress, users, savedSessions,
    loadUser, createUser, completeLevel, getLevelProgress,
    getCompletedLevels, getTotalCompletedLevels, saveSession, deleteSession, logout,
  } = useProgress();

  useEffect(() => {
    if (currentUser && progress && screen === 'user') setScreen('dashboard');
  }, [currentUser, progress, screen]);

  const handleSplashComplete = () => setScreen(currentUser && progress ? 'dashboard' : 'user');
  const handleSelectUser = (name: string) => { loadUser(name); setScreen('dashboard'); };
  const handleCreateUser = (name: string) => { createUser(name); setScreen('dashboard'); };
  const handleLogout = () => { logout(); setScreen('user'); };

  const handleSelectLanguage = (lang: 'python' | 'javascript' | 'cpp') => {
    setSelectedLanguage(lang);
    setScreen('language-intro');
  };

  const handleStartLanguage = () => setScreen('menu');

  const handleSelectCategory = (cat: 'basic' | 'intermediate' | 'advanced' | 'runcode') => {
    if (cat === 'runcode') {
      setScreen('run-code');
    } else {
      setSelectedCategory(cat);
      setScreen('levels');
    }
  };

  const handleSelectLevel = (level: number) => { setSelectedLevel(level); setScreen('questions'); };

  const handleCompleteLevel = (score: number, answers: Record<number, string | number>) => {
    if (selectedLanguage && selectedCategory && selectedLevel) {
      completeLevel(selectedLanguage, selectedCategory, selectedLevel, score, answers);
    }
    setScreen('levels');
  };

  const handleStartAIQuiz = (questions: any[]) => {
    setAIQuizQuestions(questions);
    setScreen('ai-quiz');
  };

  const handleGenerateCategoryQuiz = (questions: any[]) => {
    setAIQuizQuestions(questions);
    setScreen('ai-quiz-category');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />;
      case 'user':
        return <UserScreen users={users} onSelectUser={handleSelectUser} onCreateUser={handleCreateUser} />;
      case 'dashboard':
        if (!progress) return null;
        return (
          <Dashboard
            progress={progress}
            completedLevels={getTotalCompletedLevels()}
            onChooseLanguage={() => setScreen('language-selection')}
            onRunCode={() => setScreen('run-code')}
            onViewSessions={() => setScreen('saved-sessions')}
            onLogout={handleLogout}
          />
        );
      case 'language-selection':
        return <LanguageSelection onSelect={handleSelectLanguage} onBack={() => setScreen('dashboard')} />;
      case 'language-intro':
        if (!selectedLanguage) return null;
        return <LanguageIntro language={selectedLanguage} onStart={handleStartLanguage} onBack={() => setScreen('language-selection')} />;
      case 'menu':
        if (!selectedLanguage) return null;
        return (
          <MenuScreen
            language={selectedLanguage}
            onLevels={() => setScreen('category-selection')}
            onRunCode={() => setScreen('run-code')}
            onQuiz={() => setScreen('topics')}
            onBack={() => setScreen('language-intro')}
          />
        );
      case 'category-selection':
        if (!selectedLanguage) return null;
        return (
          <CategorySelection
            language={selectedLanguage}
            completedLevels={(cat) => getCompletedLevels(selectedLanguage, cat)}
            onSelect={handleSelectCategory}
            onGenerateQuiz={handleGenerateCategoryQuiz}
            onBack={() => setScreen('menu')}
          />
        );
      case 'levels':
        if (!selectedLanguage || !selectedCategory) return null;
        return (
          <LevelsScreen
            language={selectedLanguage}
            category={selectedCategory}
            getLevelProgress={(level) => getLevelProgress(selectedLanguage, selectedCategory, level)}
            onSelect={handleSelectLevel}
            onBack={() => setScreen('category-selection')}
          />
        );
      case 'questions':
        if (!selectedLanguage || !selectedCategory || !selectedLevel) return null;
        return (
          <QuestionScreen
            language={selectedLanguage}
            category={selectedCategory}
            level={selectedLevel}
            onComplete={handleCompleteLevel}
            onBack={() => setScreen('levels')}
          />
        );
      case 'topics':
        if (!selectedLanguage) return null;
        return <TopicsScreen language={selectedLanguage} onStartQuiz={handleStartAIQuiz} onBack={() => setScreen('menu')} />;
      case 'ai-quiz':
        return <AIQuizScreen questions={aiQuizQuestions} onBack={() => setScreen('topics')} />;
      case 'ai-quiz-category':
        return <AIQuizScreen questions={aiQuizQuestions} onBack={() => setScreen('category-selection')} />;
      case 'run-code':
        return <RunCodeScreen onSave={(lang, code) => saveSession(lang, code)} onBack={() => setScreen('menu')} />;
      case 'saved-sessions':
        return <SavedSessions sessions={savedSessions} onDelete={deleteSession} onBack={() => setScreen('dashboard')} />;
      default:
        return null;
    }
  };

  return <div className="min-h-screen bg-background">{renderScreen()}</div>;
};

export default Index;
