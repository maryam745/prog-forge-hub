import { ArrowLeft, Lock, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LevelsScreenProps {
  language: 'python' | 'javascript' | 'cpp';
  category: 'basic' | 'intermediate' | 'advanced';
  getLevelProgress: (level: number) => { completed: boolean; score: number } | null;
  onSelect: (level: number) => void;
  onBack: () => void;
}

const categoryNames = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const languageNames = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
};

const levelTopics: Record<string, Record<string, string[]>> = {
  python: {
    basic: [
      'Input & Output',
      'Variables & Data Types',
      'Type Casting & Formatting',
      'Arithmetic & Assignment Operators',
      'Comparison & Logical Operators',
      'Bitwise & Identity Operators',
      'Strings - Basics & Indexing',
      'Strings - Methods & Formatting',
      'Lists - Create & Access',
      'Lists - Methods & Slicing',
      'Tuples & Named Tuples',
      'Dictionaries',
      'Sets & Frozensets',
      'Conditional Statements',
      'Loops - for & while',
    ],
    intermediate: [
      'Loop Control & Comprehensions',
      'Functions - Basics',
      'Functions - Args & Return Types',
      'Lambda, Map & Filter',
      'Recursion',
      'Modules & Packages',
      'File Handling - Read & Write',
      'File Handling - CSV & JSON',
      'Exception Handling',
      'OOP - Classes & Objects',
      'OOP - Inheritance',
      'OOP - Encapsulation & Abstraction',
      'Polymorphism',
      'Magic Methods & Dunder',
      'Regular Expressions',
    ],
    advanced: [
      'Decorators',
      'Generators & Iterators',
      'Context Managers',
      'Closures & Scope',
      'Async/Await',
      'Threading & Multiprocessing',
      'Metaclasses',
      'Descriptors & Properties',
      'Data Structures (Stacks, Queues)',
      'Algorithm Basics',
      'Unit Testing',
      'Design Patterns',
    ],
  },
  javascript: {
    basic: [
      'Console & Output',
      'Variables - let, const, var',
      'Data Types & typeof',
      'Type Coercion & Conversion',
      'Arithmetic & Assignment Operators',
      'Comparison & Logical Operators',
      'Strings - Basics & Methods',
      'Strings - Template Literals',
      'Arrays - Create & Access',
      'Arrays - Methods (push, pop, etc)',
      'Objects - Basics',
      'Objects - Destructuring & Spread',
      'Conditional Statements',
      'Loops - for, while, for...of',
      'DOM Basics & Selectors',
    ],
    intermediate: [
      'DOM Manipulation & Events',
      'Functions - Declaration & Expression',
      'Arrow Functions & this',
      'Closures & Scope',
      'Callbacks',
      'Promises',
      'Async/Await',
      'Error Handling - try/catch',
      'Classes & Constructors',
      'Inheritance & super',
      'Modules - import/export',
      'Array Methods - map, filter, reduce',
      'JSON & Fetch API',
      'LocalStorage & SessionStorage',
      'Regular Expressions',
    ],
    advanced: [
      'Prototypes & Prototype Chain',
      'Event Loop & Task Queue',
      'Generators & Iterators',
      'Proxy & Reflect',
      'WeakMap & WeakSet',
      'Web APIs (Intersection, Resize)',
      'Web Workers',
      'Performance Optimization',
      'Testing - Jest Basics',
      'Design Patterns',
      'TypeScript Basics',
      'TypeScript Advanced Types',
    ],
  },
  cpp: {
    basic: [
      'Input & Output (cin/cout)',
      'Variables & Data Types',
      'Type Casting',
      'Arithmetic & Assignment Operators',
      'Comparison & Logical Operators',
      'Bitwise Operators',
      'Strings - C-style & std::string',
      'String Methods & Operations',
      'Arrays - 1D',
      'Arrays - 2D & Multidimensional',
      'Pointers - Basics',
      'Pointers & Arrays',
      'References',
      'Conditional Statements',
      'Loops - for, while, do-while',
    ],
    intermediate: [
      'Functions - Basics & Overloading',
      'Functions - Default & Inline',
      'Recursion',
      'Structures & Enums',
      'Classes & Objects',
      'Constructors & Destructors',
      'Inheritance',
      'Polymorphism & Virtual Functions',
      'Operator Overloading',
      'Templates - Function & Class',
      'STL - Vectors & Deque',
      'STL - Maps & Sets',
      'STL - Algorithms',
      'File I/O (fstream)',
      'Exception Handling',
    ],
    advanced: [
      'Smart Pointers (unique, shared)',
      'Move Semantics & Rvalue Refs',
      'Lambda Expressions',
      'Multithreading - Basics',
      'Multithreading - Mutex & Locks',
      'Template Metaprogramming',
      'Memory Management & RAII',
      'STL Iterators & Adapters',
      'Data Structures (Stack, Queue)',
      'Algorithm Complexity',
      'Unit Testing',
      'Design Patterns',
    ],
  },
};

const LevelsScreen = ({
  language,
  category,
  getLevelProgress,
  onSelect,
  onBack,
}: LevelsScreenProps) => {
  const topics = levelTopics[language][category];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="back-button">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              {languageNames[language]} - <span className="gradient-text">{categoryNames[category]}</span>
            </h1>
            <p className="text-muted-foreground">Complete all 7 levels to master this category</p>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 7 }, (_, i) => i + 1).map((level, index) => {
            const progress = getLevelProgress(level);
            const isCompleted = progress?.completed;
            const score = progress?.score || 0;
            const isLocked = level > 1 && !getLevelProgress(level - 1)?.completed;

            return (
              <button
                key={level}
                onClick={() => !isLocked && onSelect(level)}
                disabled={isLocked}
                className={`glass-card p-6 text-left group transition-all duration-300 animate-slide-up ${
                  isLocked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-[1.02]'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isCompleted
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                        : isLocked
                        ? 'bg-muted'
                        : 'bg-gradient-to-br from-primary to-accent'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-7 h-7 text-white" />
                    ) : (
                      <span className="text-2xl font-bold text-white">{level}</span>
                    )}
                  </div>
                  {isCompleted && (
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-400">{score}</span>
                      <span className="text-muted-foreground">/10</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                  Level {level}
                </h3>
                <p className="text-sm text-muted-foreground">{topics[level - 1]}</p>

                {!isLocked && !isCompleted && (
                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Circle className="w-4 h-4 mr-2" />
                    <span>10 Questions</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelsScreen;
