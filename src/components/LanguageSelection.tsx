import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LanguageSelectionProps {
  onSelect: (language: 'python' | 'javascript' | 'cpp') => void;
  onBack: () => void;
}

const languages = [
  {
    id: 'python' as const,
    name: 'Python',
    icon: '🐍',
    color: 'from-yellow-500 to-blue-500',
    description: 'Perfect for beginners. Clean syntax, powerful libraries, and widely used in AI/ML.',
  },
  {
    id: 'javascript' as const,
    name: 'JavaScript',
    icon: '⚡',
    color: 'from-yellow-400 to-orange-500',
    description: 'The language of the web. Build interactive websites and modern applications.',
  },
  {
    id: 'cpp' as const,
    name: 'C++',
    icon: '⚙️',
    color: 'from-blue-500 to-purple-600',
    description: 'High-performance computing. Used in games, systems, and competitive programming.',
  },
];

const LanguageSelection = ({ onSelect, onBack }: LanguageSelectionProps) => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
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
            <h1 className="text-3xl md:text-4xl font-bold">Choose a Language</h1>
            <p className="text-muted-foreground">Select a programming language to start learning</p>
          </div>
        </div>

        {/* Language Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {languages.map((lang, index) => (
            <button
              key={lang.id}
              onClick={() => onSelect(lang.id)}
              className="glass-card p-6 text-left group hover:scale-[1.02] transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${lang.color} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {lang.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-3 group-hover:gradient-text transition-colors">
                {lang.name}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {lang.description}
              </p>

              {/* Hover indicator */}
              <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Start Learning</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
