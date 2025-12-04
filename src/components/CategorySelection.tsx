import { ArrowLeft, Zap, Flame, Crown, Code2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategorySelectionProps {
  language: 'python' | 'javascript' | 'cpp';
  completedLevels: (category: string) => number;
  onSelect: (category: 'basic' | 'intermediate' | 'advanced' | 'runcode') => void;
  onGenerateQuiz: (category: 'basic' | 'intermediate' | 'advanced') => void;
  onBack: () => void;
}

const categories = [
  {
    id: 'basic' as const,
    name: 'Basic',
    icon: Zap,
    color: 'from-primary to-secondary',
    description: 'Start with fundamentals. Learn syntax, variables, and basic operations.',
  },
  {
    id: 'intermediate' as const,
    name: 'Intermediate',
    icon: Flame,
    color: 'from-secondary to-accent',
    description: 'Level up your skills. Functions, OOP, and more complex concepts.',
  },
  {
    id: 'advanced' as const,
    name: 'Advanced',
    icon: Crown,
    color: 'from-accent to-primary',
    description: 'Master advanced topics. Design patterns, optimization, and best practices.',
  },
  {
    id: 'runcode' as const,
    name: 'Run Your Own Code',
    icon: Code2,
    color: 'from-primary to-accent',
    description: 'Practice freely. Write and run your own code in a sandbox environment.',
  },
];

const languageNames = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
};

const CategorySelection = ({
  language,
  completedLevels,
  onSelect,
  onGenerateQuiz,
  onBack,
}: CategorySelectionProps) => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text neon-text">{languageNames[language]}</span> Categories
            </h1>
            <p className="text-muted-foreground">Choose your difficulty level</p>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            const completed = cat.id === 'runcode' ? 0 : completedLevels(cat.id);
            const total = cat.id === 'runcode' ? 0 : 7;

            return (
              <div
                key={cat.id}
                className="glass-card p-6 group hover:scale-[1.02] transition-all duration-300 animate-slide-up cyan-glow-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => onSelect(cat.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-8 h-8 text-background" />
                    </div>
                    {cat.id !== 'runcode' && (
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">{completed}</span>
                        <span className="text-muted-foreground">/{total}</span>
                        <p className="text-xs text-muted-foreground">Levels</p>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>

                  {cat.id !== 'runcode' && (
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(completed / total) * 100}%`,
                          background: 'var(--gradient-primary)',
                        }}
                      />
                    </div>
                  )}
                </button>

                {/* Generate Quiz Button */}
                {cat.id !== 'runcode' && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateQuiz(cat.id);
                    }}
                    className="w-full mt-4 bg-gradient-to-r from-accent to-primary text-background gap-2 hover:opacity-90"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate AI Quiz (30 Questions)
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;
