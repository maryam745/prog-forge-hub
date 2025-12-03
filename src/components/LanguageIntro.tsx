import { ArrowLeft, BookOpen, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LanguageIntroProps {
  language: 'python' | 'javascript' | 'cpp';
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

const LanguageIntro = ({ language, onStart, onBack }: LanguageIntroProps) => {
  const info = languageInfo[language];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto animate-slide-up">
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

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
            Get Started
          </Button>
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
