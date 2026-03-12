import { useState } from 'react';
import { ArrowLeft, Brain, FileText, Code, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QuizModeScreenProps {
  language: 'python' | 'javascript' | 'cpp';
  topic: string;
  category: string;
  onStartQuiz: (questions: any[], mode: 'mcq' | 'short' | 'coding') => void;
  onBack: () => void;
}

const languageNames = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
};

const modes = [
  {
    id: 'mcq' as const,
    title: 'MCQs',
    description: '10 multiple choice questions to test your conceptual knowledge',
    icon: Brain,
    time: '10 min',
    color: 'from-primary to-secondary',
    badgeClass: 'bg-primary/20 text-primary',
  },
  {
    id: 'short' as const,
    title: 'Short Answers',
    description: '10 short answer questions including "find the error" code snippets',
    icon: FileText,
    time: '15 min',
    color: 'from-secondary to-accent',
    badgeClass: 'bg-secondary/20 text-secondary',
  },
  {
    id: 'coding' as const,
    title: 'Coding Challenges',
    description: '10 coding problems — write, run, and test your solutions',
    icon: Code,
    time: '30 min',
    color: 'from-accent to-primary',
    badgeClass: 'bg-accent/20 text-accent',
  },
];

const QuizModeScreen = ({ language, topic, category, onStartQuiz, onBack }: QuizModeScreenProps) => {
  const [loadingMode, setLoadingMode] = useState<string | null>(null);

  const handleModeClick = async (mode: 'mcq' | 'short' | 'coding') => {
    setLoadingMode(mode);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          language: languageNames[language],
          category: category.toLowerCase(),
          topic,
          count: 10,
          mode,
        },
      });

      if (error) throw error;
      if (data?.questions && Array.isArray(data.questions)) {
        onStartQuiz(data.questions, mode);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err: any) {
      console.error('Quiz generation failed:', err);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto animate-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="back-button">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text neon-text">Choose Quiz Mode</span>
            </h1>
            <p className="text-muted-foreground">
              {languageNames[language]} — {topic}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isLoading = loadingMode === mode.id;
            const isDisabled = loadingMode !== null;

            return (
              <button
                key={mode.id}
                onClick={() => handleModeClick(mode.id)}
                disabled={isDisabled}
                className="w-full glass-card p-6 text-left group hover:scale-[1.01] transition-all duration-300 cyan-glow-hover disabled:opacity-50"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center shrink-0`}>
                    {isLoading ? (
                      <Loader2 className="w-7 h-7 text-background animate-spin" />
                    ) : (
                      <Icon className="w-7 h-7 text-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {mode.title}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${mode.badgeClass} flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        {mode.time}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">{mode.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizModeScreen;
