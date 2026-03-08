import { useState } from 'react';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface TopicsScreenProps {
  language: 'python' | 'javascript' | 'cpp';
  onStartQuiz: (questions: any[]) => void;
  onBack: () => void;
}

const languageNames = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
};

const topicsByLanguage: Record<string, { category: string; topics: string[] }[]> = {
  python: [
    { category: 'Basic', topics: ['Variables & Data Types', 'Operators', 'Strings', 'Lists & Tuples', 'Dictionaries', 'Control Flow', 'Loops'] },
    { category: 'Intermediate', topics: ['Functions', 'Modules & Packages', 'File Handling', 'Exception Handling', 'OOP Basics', 'Inheritance', 'Decorators'] },
    { category: 'Advanced', topics: ['Generators & Iterators', 'Async/Await', 'Metaclasses', 'Context Managers', 'Threading', 'Design Patterns', 'Testing'] },
  ],
  javascript: [
    { category: 'Basic', topics: ['Variables & Scope', 'Data Types', 'Operators', 'Strings & Arrays', 'Objects', 'DOM Manipulation', 'Events'] },
    { category: 'Intermediate', topics: ['Functions & Closures', 'Callbacks', 'Promises', 'Async/Await', 'Classes', 'Modules', 'Error Handling'] },
    { category: 'Advanced', topics: ['Prototypes', 'Event Loop', 'Web APIs', 'Performance', 'Testing', 'Design Patterns', 'TypeScript Basics'] },
  ],
  cpp: [
    { category: 'Basic', topics: ['Variables & Types', 'Operators', 'Arrays', 'Strings', 'Pointers', 'References', 'Control Flow'] },
    { category: 'Intermediate', topics: ['Functions', 'Classes & Objects', 'Inheritance', 'Polymorphism', 'Templates', 'STL Containers', 'File I/O'] },
    { category: 'Advanced', topics: ['Smart Pointers', 'Move Semantics', 'Multithreading', 'Lambdas', 'Template Metaprogramming', 'Memory Management', 'Design Patterns'] },
  ],
};

const TopicsScreen = ({ language, onStartQuiz, onBack }: TopicsScreenProps) => {
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null);

  const handleTopicClick = async (topic: string, category: string) => {
    setLoadingTopic(topic);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          language: languageNames[language],
          category: category.toLowerCase(),
          topic,
          count: 10,
        },
      });

      if (error) throw error;
      if (data?.questions && Array.isArray(data.questions)) {
        onStartQuiz(data.questions);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err: any) {
      console.error('Quiz generation failed:', err);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoadingTopic(null);
    }
  };

  const categories = topicsByLanguage[language] || [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="back-button">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text neon-text">{languageNames[language]}</span> Quiz Topics
            </h1>
            <p className="text-muted-foreground">Select a topic to generate an AI quiz</p>
          </div>
        </div>

        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.category}>
              <h2 className="text-xl font-bold mb-4 gradient-text">{cat.category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTopicClick(topic, cat.category)}
                    disabled={loadingTopic !== null}
                    className="glass-card p-4 text-left group hover:scale-[1.02] transition-all duration-300 cyan-glow-hover disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {topic}
                      </span>
                      {loadingTopic === topic ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicsScreen;
