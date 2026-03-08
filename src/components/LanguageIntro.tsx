import { ArrowLeft, BookOpen, Trophy, Zap, CheckCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProgress } from '@/hooks/useProgress';

interface LanguageIntroProps {
  language: 'python' | 'javascript' | 'cpp';
  progress: UserProgress | null;
  getCompletedLevels: (language: string, category: string) => number;
  onStart: () => void;
  onBack: () => void;
}

const languageInfo = {
  python: {
    name: 'Python',
    icon: '🐍',
    color: 'from-yellow-500 to-blue-500',
    description:
      'Python is a high-level, interpreted programming language known for its simplicity and readability. It emphasizes code readability with significant whitespace and provides a clean, intuitive syntax that makes it perfect for beginners.',
    features: [
      'Easy to learn and read',
      'Extensive standard library',
      'Great for data science & AI',
      'Cross-platform compatibility',
    ],
    useCases: ['Web Development', 'Data Analysis', 'Machine Learning', 'Automation'],
  },
  javascript: {
    name: 'JavaScript',
    icon: '⚡',
    color: 'from-yellow-400 to-orange-500',
    description:
      'JavaScript is the programming language of the web. It enables interactive web pages and is an essential part of web applications. Modern JavaScript (ES6+) brings powerful features like classes, modules, and async/await.',
    features: [
      'Runs in browsers & servers',
      'Event-driven programming',
      'Dynamic and flexible',
      'Huge ecosystem (npm)',
    ],
    useCases: ['Web Development', 'Mobile Apps', 'Server-side', 'Desktop Apps'],
  },
  cpp: {
    name: 'C++',
    icon: '⚙️',
    color: 'from-blue-500 to-purple-600',
    description:
      'C++ is a powerful general-purpose programming language. It offers high performance and fine-grained control over system resources. It is widely used in game development, system programming, and competitive programming.',
    features: [
      'High performance',
      'Object-oriented',
      'Memory management',
      'Hardware access',
    ],
    useCases: ['Game Development', 'System Software', 'Embedded Systems', 'Competitive Programming'],
  },
};

const totalByCategory: Record<string, number> = { basic: 15, intermediate: 15, advanced: 12 };

const LanguageIntro = ({ language, progress, getCompletedLevels, onStart, onBack }: LanguageIntroProps) => {
  const info = languageInfo[language];

  const basicCompleted = getCompletedLevels(language, 'basic');
  const intermediateCompleted = getCompletedLevels(language, 'intermediate');
  const advancedCompleted = getCompletedLevels(language, 'advanced');
  const totalCompleted = basicCompleted + intermediateCompleted + advancedCompleted;
  const totalLevels = totalByCategory.basic + totalByCategory.intermediate + totalByCategory.advanced;
  const langPercentage = totalLevels > 0 ? Math.round((totalCompleted / totalLevels) * 100) : 0;

  // Calculate language-specific points from levels
  const langPoints = progress?.languages[language]
    ? Object.values(progress.languages[language]).reduce((catTotal, cat) => {
        return catTotal + Object.values(cat).reduce((lvlTotal, lvl) => lvlTotal + (lvl.score || 0), 0);
      }, 0)
    : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto animate-slide-up">
        {/* Back button */}
        <button onClick={onBack} className="back-button mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Hero */}
        <div className="glass-card p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div
              className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center text-5xl shadow-lg`}
            >
              {info.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">{info.name}</h1>
              <p className="text-muted-foreground">Learn {info.name} from scratch</p>
            </div>
          </div>

          <p className="text-lg text-foreground/80 leading-relaxed mb-8">{info.description}</p>

          <Button
            onClick={onStart}
            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            {totalCompleted > 0 ? 'Continue Learning' : 'Get Started'}
          </Button>
        </div>

        {/* Statistics */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your {info.name} Progress
          </h3>

          {/* Overall progress bar */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall</span>
              <span className="font-medium">{totalCompleted}/{totalLevels} levels ({langPercentage}%)</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${langPercentage}%`, background: 'var(--gradient-primary)' }}
              />
            </div>
          </div>

          {/* Category breakdown */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Basic', completed: basicCompleted, total: totalByCategory.basic },
              { name: 'Intermediate', completed: intermediateCompleted, total: totalByCategory.intermediate },
              { name: 'Advanced', completed: advancedCompleted, total: totalByCategory.advanced },
            ].map((cat) => (
              <div key={cat.name} className="bg-muted/30 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{cat.name}</p>
                <p className="text-lg font-bold">
                  {cat.completed}<span className="text-sm text-muted-foreground font-normal">/{cat.total}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Points */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Level Points:</span>
              <span className="font-bold">{langPoints}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Quizzes Done:</span>
              <span className="font-bold">{progress?.quizzesCompleted || 0}</span>
            </div>
          </div>
        </div>

        {/* Features & Use Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Key Features</h3>
            </div>
            <ul className="space-y-3">
              {info.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Use Cases</h3>
            </div>
            <ul className="space-y-3">
              {info.useCases.map((useCase, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  {useCase}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageIntro;