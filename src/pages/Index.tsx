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
import QuizModeScreen from '@/components/QuizModeScreen';
import AIQuizScreen from '@/components/AIQuizScreen';
import QuizDashboard from '@/components/QuizDashboard';
import { getQuestions } from '@/questions';

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
  | 'quiz-mode-select'
  | 'ai-quiz'
  | 'ai-quiz-category'
  | 'quiz-dashboard';

const languageNames: Record<string, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
};

const Index = () => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'cpp' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'basic' | 'intermediate' | 'advanced' | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [aiQuizQuestions, setAIQuizQuestions] = useState<any[]>([]);
  const [quizTopic, setQuizTopic] = useState<string>('');
  const [quizTopicCategory, setQuizTopicCategory] = useState<string>('');
  const [quizMode, setQuizMode] = useState<'mcq' | 'short' | 'coding'>('mcq');

  const {
    currentUser, progress, users, savedSessions, quizHistory,
    loadUser, createUser, completeLevel, addQuizPoints, addQuizHistory, deleteQuizHistory,
    getLevelProgress, getCompletedLevels, getLanguageCompletedLevels, getTotalCompletedLevels,
    saveSession, deleteSession, logout,
  } = useProgress();

  useEffect(() => {
    if (currentUser && progress && screen === 'user') setScreen('dashboard');
  }, [currentUser, progress, screen]);

  const goHome = () => setScreen('dashboard');

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

  // Load from question bank (instant)
  const handleSelectLevel = (level: number) => {
    if (!selectedLanguage || !selectedCategory) return;
    setSelectedLevel(level);
    const questions = getQuestions(selectedLanguage, selectedCategory, level);
    if (questions.length > 0) {
      setScreen('questions');
    } else {
      alert('No questions available for this level yet.');
    }
  };

  const handleCompleteLevel = (score: number, answers: Record<number, string | number>) => {
    if (selectedLanguage && selectedCategory && selectedLevel) {
      completeLevel(selectedLanguage, selectedCategory, selectedLevel, score, answers);
    }
    setScreen('levels');
  };

  const handleSelectTopic = (topic: string, category: string) => {
    setQuizTopic(topic);
    setQuizTopicCategory(category);
    setScreen('quiz-mode-select');
  };

  const handleStartAIQuiz = (questions: any[], mode: 'mcq' | 'short' | 'coding') => {
    setAIQuizQuestions(questions);
    setQuizMode(mode);
    setScreen('ai-quiz');
  };

  const handleQuizComplete = (score: number, total: number, timeTaken: number) => {
    addQuizPoints(score);
    addQuizHistory({
      language: languageNames[selectedLanguage!] || selectedLanguage!,
      topic: quizTopic,
      mode: quizMode,
      score,
      total,
      pointsEarned: score,
      timeTaken,
    });
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
            getLanguageCompletedLevels={getLanguageCompletedLevels}
            onChooseLanguage={() => setScreen('language-selection')}
            onRunCode={() => setScreen('run-code')}
            onViewSessions={() => setScreen('saved-sessions')}
            onQuizDashboard={() => setScreen('quiz-dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'language-selection':
        return <LanguageSelection onSelect={handleSelectLanguage} onBack={() => setScreen('dashboard')} />;
      case 'language-intro':
        if (!selectedLanguage) return null;
        return (
          <LanguageIntro
            language={selectedLanguage}
            progress={progress}
            getCompletedLevels={getCompletedLevels}
            onStart={handleStartLanguage}
            onBack={() => setScreen('language-selection')}
          />
        );
      case 'menu':
        if (!selectedLanguage) return null;
        return (
          <MenuScreen
            language={selectedLanguage}
            onLevels={() => setScreen('category-selection')}
            onRunCode={() => setScreen('run-code')}
            onQuiz={() => setScreen('topics')}
            onBack={() => setScreen('language-intro')}
            onHome={goHome}
          />
        );
      case 'category-selection':
        if (!selectedLanguage) return null;
        return (
          <CategorySelection
            language={selectedLanguage}
            completedLevels={(cat) => getCompletedLevels(selectedLanguage, cat)}
            onSelect={handleSelectCategory}
            onBack={() => setScreen('menu')}
            onHome={goHome}
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
            onHome={goHome}
          />
        );
      case 'questions':
        if (!selectedLanguage || !selectedCategory || !selectedLevel) return null;
        return (
          <QuestionScreen
            language={selectedLanguage}
            category={selectedCategory}
            level={selectedLevel}
            questions={getQuestions(selectedLanguage, selectedCategory, selectedLevel)}
            onComplete={handleCompleteLevel}
            onBack={() => setScreen('levels')}
            onHome={goHome}
          />
        );
      case 'topics':
        if (!selectedLanguage) return null;
        return <TopicsScreen language={selectedLanguage} onSelectTopic={handleSelectTopic} onBack={() => setScreen('menu')} onHome={goHome} />;
      case 'quiz-mode-select':
        if (!selectedLanguage) return null;
        return (
          <QuizModeScreen
            language={selectedLanguage}
            topic={quizTopic}
            category={quizTopicCategory}
            onStartQuiz={handleStartAIQuiz}
            onBack={() => setScreen('topics')}
            onHome={goHome}
          />
        );
      case 'ai-quiz':
        return (
          <AIQuizScreen
            questions={aiQuizQuestions}
            language={selectedLanguage!}
            topic={quizTopic}
            mode={quizMode}
            onBack={() => setScreen('quiz-mode-select')}
            onHome={goHome}
            onQuizComplete={handleQuizComplete}
            onRetry={() => {}}
          />
        );
      case 'ai-quiz-category':
        return (
          <AIQuizScreen
            questions={aiQuizQuestions}
            language={selectedLanguage!}
            onBack={() => setScreen('category-selection')}
            onHome={goHome}
            onQuizComplete={handleQuizComplete}
          />
        );
      case 'quiz-dashboard':
        return (
          <QuizDashboard
            history={quizHistory}
            totalQuizPoints={progress?.quizPoints || 0}
            quizzesCompleted={progress?.quizzesCompleted || 0}
            onDelete={deleteQuizHistory}
            onBack={() => setScreen('dashboard')}
            onHome={goHome}
          />
        );
      case 'run-code':
        return <RunCodeScreen onSave={(lang, code) => saveSession(lang, code)} onBack={() => setScreen('menu')} onHome={goHome} />;
      case 'saved-sessions':
        return <SavedSessions sessions={savedSessions} onDelete={deleteSession} onBack={() => setScreen('dashboard')} onHome={goHome} />;
      default:
        return null;
    }
  };

  return <div className="min-h-screen bg-background">{renderScreen()}</div>;
};

export default Index;
