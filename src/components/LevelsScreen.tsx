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
    basic: ['Variables', 'Data Types', 'Operators', 'Strings', 'Lists', 'Tuples', 'Dictionaries'],
    intermediate: ['Functions', 'Modules', 'File Handling', 'Exceptions', 'OOP Basics', 'Inheritance', 'Decorators'],
    advanced: ['Generators', 'Async/Await', 'Metaclasses', 'Context Managers', 'Threading', 'Multiprocessing', 'Design Patterns'],
  },
  javascript: {
    basic: ['Variables', 'Data Types', 'Operators', 'Strings', 'Arrays', 'Objects', 'DOM Basics'],
    intermediate: ['Functions', 'Closures', 'Callbacks', 'Promises', 'Async/Await', 'Classes', 'Modules'],
    advanced: ['Prototypes', 'Event Loop', 'Web APIs', 'Performance', 'Testing', 'Design Patterns', 'TypeScript'],
  },
  cpp: {
    basic: ['Variables', 'Data Types', 'Operators', 'Arrays', 'Strings', 'Pointers', 'References'],
    intermediate: ['Functions', 'Classes', 'Inheritance', 'Polymorphism', 'Templates', 'STL Basics', 'File I/O'],
    advanced: ['Smart Pointers', 'Move Semantics', 'Multithreading', 'Lambdas', 'TMP', 'Memory Mgmt', 'Patterns'],
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
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
