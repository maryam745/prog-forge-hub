import { useState, useEffect } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { supabase } from '@/integrations/supabase/client';
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
import { Loader2, Zap } from 'lucide-react';

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
  | 'level-loading'
  | 'run-code'
  | 'saved-sessions'
  | 'topics'
  | 'quiz-mode-select'
  | 'ai-quiz'
  | 'ai-quiz-category';

const languageNames: Record<string, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
};

// Level topics for generating questions
const levelTopics: Record<string, Record<string, string[]>> = {
  python: {
    basic: ['Input & Output','Variables & Data Types','Type Casting & Formatting','Arithmetic & Assignment Operators','Comparison & Logical Operators','Bitwise & Identity Operators','Strings - Basics & Indexing','Strings - Methods & Formatting','Lists - Create & Access','Lists - Methods & Slicing','Tuples & Named Tuples','Dictionaries','Sets & Frozensets','Conditional Statements','Loops - for & while'],
    intermediate: ['Loop Control & Comprehensions','Functions - Basics','Functions - Args & Return Types','Lambda, Map & Filter','Recursion','Modules & Packages','File Handling - Read & Write','File Handling - CSV & JSON','Exception Handling','OOP - Classes & Objects','OOP - Inheritance','OOP - Encapsulation & Abstraction','Polymorphism','Magic Methods & Dunder','Regular Expressions'],
    advanced: ['Decorators','Generators & Iterators','Context Managers','Closures & Scope','Async/Await','Threading & Multiprocessing','Metaclasses','Descriptors & Properties','Data Structures (Stacks, Queues)','Algorithm Basics','Unit Testing','Design Patterns'],
  },
  javascript: {
    basic: ['Console & Output','Variables - let, const, var','Data Types & typeof','Type Coercion & Conversion','Arithmetic & Assignment Operators','Comparison & Logical Operators','Strings - Basics & Methods','Strings - Template Literals','Arrays - Create & Access','Arrays - Methods (push, pop, etc)','Objects - Basics','Objects - Destructuring & Spread','Conditional Statements','Loops - for, while, for...of','DOM Basics & Selectors'],
    intermediate: ['DOM Manipulation & Events','Functions - Declaration & Expression','Arrow Functions & this','Closures & Scope','Callbacks','Promises','Async/Await','Error Handling - try/catch','Classes & Constructors','Inheritance & super','Modules - import/export','Array Methods - map, filter, reduce','JSON & Fetch API','LocalStorage & SessionStorage','Regular Expressions'],
    advanced: ['Prototypes & Prototype Chain','Event Loop & Task Queue','Generators & Iterators','Proxy & Reflect','WeakMap & WeakSet','Web APIs (Intersection, Resize)','Web Workers','Performance Optimization','Testing - Jest Basics','Design Patterns','TypeScript Basics','TypeScript Advanced Types'],
  },
  cpp: {
    basic: ['Input & Output (cin/cout)','Variables & Data Types','Type Casting','Arithmetic & Assignment Operators','Comparison & Logical Operators','Bitwise Operators','Strings - C-style & std::string','String Methods & Operations','Arrays - 1D','Arrays - 2D & Multidimensional','Pointers - Basics','Pointers & Arrays','References','Conditional Statements','Loops - for, while, do-while'],
    intermediate: ['Functions - Basics & Overloading','Functions - Default & Inline','Recursion','Structures & Enums','Classes & Objects','Constructors & Destructors','Inheritance','Polymorphism & Virtual Functions','Operator Overloading','Templates - Function & Class','STL - Vectors & Deque','STL - Maps & Sets','STL - Algorithms','File I/O (fstream)','Exception Handling'],
    advanced: ['Smart Pointers (unique, shared)','Move Semantics & Rvalue Refs','Lambda Expressions','Multithreading - Basics','Multithreading - Mutex & Locks','Template Metaprogramming','Memory Management & RAII','STL Iterators & Adapters','Data Structures (Stack, Queue)','Algorithm Complexity','Unit Testing','Design Patterns'],
  },
};

const Index = () => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'cpp' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'basic' | 'intermediate' | 'advanced' | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [levelQuestions, setLevelQuestions] = useState<any[]>([]);
  const [aiQuizQuestions, setAIQuizQuestions] = useState<any[]>([]);
  const [quizTopic, setQuizTopic] = useState<string>('');
  const [quizTopicCategory, setQuizTopicCategory] = useState<string>('');
  const [quizMode, setQuizMode] = useState<'mcq' | 'short' | 'coding'>('mcq');

  const {
    currentUser, progress, users, savedSessions,
    loadUser, createUser, completeLevel, addQuizPoints, getLevelProgress,
    getCompletedLevels, getTotalCompletedLevels, saveSession, deleteSession, logout,
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

  const handleSelectLevel = async (level: number) => {
    setSelectedLevel(level);
    setScreen('level-loading');

    // Generate 20 questions via AI
    try {
      const lang = selectedLanguage!;
      const cat = selectedCategory!;
      const topics = levelTopics[lang]?.[cat];
      const topic = topics?.[level - 1] || `Level ${level}`;

      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          language: languageNames[lang],
          category: cat,
          topic,
          count: 20,
          mode: 'level',
        },
      });

      if (error) throw error;
      if (data?.questions && Array.isArray(data.questions)) {
        setLevelQuestions(data.questions);
        setScreen('questions');
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.error('Level generation failed:', err);
      alert('Failed to generate level questions. Please try again.');
      setScreen('levels');
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
      case 'level-loading':
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center animate-pulse">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-spin-slow">
                <Zap className="w-12 h-12 text-background" />
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-2">Generating Level Questions...</h2>
              <p className="text-muted-foreground">Creating 20 topic-specific questions</p>
            </div>
          </div>
        );
      case 'questions':
        if (!selectedLanguage || !selectedCategory || !selectedLevel) return null;
        return (
          <QuestionScreen
            language={selectedLanguage}
            category={selectedCategory}
            level={selectedLevel}
            questions={levelQuestions}
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
            mode={quizMode}
            onBack={() => setScreen('quiz-mode-select')}
            onHome={goHome}
            onQuizComplete={addQuizPoints}
            onRetry={() => {}}
          />
        );
      case 'ai-quiz-category':
        return <AIQuizScreen questions={aiQuizQuestions} language={selectedLanguage!} onBack={() => setScreen('category-selection')} onHome={goHome} onQuizComplete={addQuizPoints} />;
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
