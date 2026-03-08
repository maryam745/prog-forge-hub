import { ArrowLeft, BookOpen, Code2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuScreenProps {
  language: 'python' | 'javascript' | 'cpp';
  onLevels: () => void;
  onRunCode: () => void;
  onQuiz: () => void;
  onBack: () => void;
}

const languageNames = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
};

const MenuScreen = ({ language, onLevels, onRunCode, onQuiz, onBack }: MenuScreenProps) => {
  const menuItems = [
    {
      title: 'Levels',
      description: 'Progress through structured lessons from basic to advanced',
      icon: BookOpen,
      gradient: 'from-primary to-secondary',
      onClick: onLevels,
    },
    {
      title: 'Run Your Own Code',
      description: 'Write and execute code freely in a sandbox environment',
      icon: Code2,
      gradient: 'from-secondary to-accent',
      onClick: onRunCode,
    },
    {
      title: 'Quiz',
      description: 'Test your knowledge with AI-generated quizzes on any topic',
      icon: Brain,
      gradient: 'from-accent to-primary',
      onClick: onQuiz,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={onBack}
            className="back-button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text neon-text">{languageNames[language]}</span>
            </h1>
            <p className="text-muted-foreground">Choose how you want to practice</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={item.onClick}
                className="glass-card p-8 text-left group hover:scale-[1.03] transition-all duration-300 animate-slide-up cyan-glow-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <Icon className="w-10 h-10 text-background" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;
