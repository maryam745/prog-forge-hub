import { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface TopicsScreenProps {
  language: 'python' | 'javascript' | 'cpp';
  onSelectTopic: (topic: string, category: string) => void;
  onBack: () => void;
}

const languageNames = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
};

const topicsByLanguage: Record<string, { category: string; topics: string[] }[]> = {
  python: [
    { category: 'Basic', topics: ['Input & Output', 'Variables & Data Types', 'Type Casting', 'Operators', 'Strings', 'Lists', 'Tuples', 'Dictionaries', 'Sets', 'Conditionals', 'Loops'] },
    { category: 'Intermediate', topics: ['Functions', 'Lambda & Map/Filter', 'Recursion', 'Modules & Packages', 'File Handling', 'Exception Handling', 'OOP Basics', 'Inheritance', 'Polymorphism', 'Regular Expressions'] },
    { category: 'Advanced', topics: ['Decorators', 'Generators & Iterators', 'Context Managers', 'Async/Await', 'Threading', 'Metaclasses', 'Design Patterns', 'Unit Testing'] },
  ],
  javascript: [
    { category: 'Basic', topics: ['Console & Output', 'Variables & Scope', 'Data Types & Coercion', 'Operators', 'Strings', 'Arrays', 'Objects', 'Conditionals', 'Loops', 'DOM Basics'] },
    { category: 'Intermediate', topics: ['Functions & Closures', 'Arrow Functions', 'Callbacks', 'Promises', 'Async/Await', 'Classes', 'Modules', 'Array Methods', 'JSON & Fetch', 'Error Handling'] },
    { category: 'Advanced', topics: ['Prototypes', 'Event Loop', 'Generators', 'Proxy & Reflect', 'Web APIs', 'Web Workers', 'Performance', 'Testing', 'Design Patterns', 'TypeScript'] },
  ],
  cpp: [
    { category: 'Basic', topics: ['Input & Output', 'Variables & Data Types', 'Type Casting', 'Operators', 'Strings', 'Arrays', 'Pointers', 'References', 'Conditionals', 'Loops'] },
    { category: 'Intermediate', topics: ['Functions', 'Recursion', 'Structures & Enums', 'Classes & Objects', 'Inheritance', 'Polymorphism', 'Templates', 'STL Containers', 'File I/O', 'Exception Handling'] },
    { category: 'Advanced', topics: ['Smart Pointers', 'Move Semantics', 'Lambdas', 'Multithreading', 'Template Metaprogramming', 'Memory Management', 'Design Patterns', 'Unit Testing'] },
  ],
};

const TopicsScreen = ({ language, onSelectTopic, onBack }: TopicsScreenProps) => {
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
            <p className="text-muted-foreground">Select a topic, then choose your quiz mode</p>
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
                    onClick={() => onSelectTopic(topic, cat.category)}
                    className="glass-card p-4 text-left group hover:scale-[1.02] transition-all duration-300 cyan-glow-hover"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {topic}
                      </span>
                      <Sparkles className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
