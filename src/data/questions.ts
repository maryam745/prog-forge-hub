export interface MCQ {
  type: 'mcq';
  question: string;
  options: string[];
  correct: number;
}

export interface ShortQuestion {
  type: 'short';
  question: string;
  answer: string;
}

export interface CodingChallenge {
  type: 'coding';
  challengeId: string;
}

export type Question = MCQ | ShortQuestion | CodingChallenge;

export interface LevelQuestions {
  [level: number]: Question[];
}

export interface CategoryQuestions {
  basic: LevelQuestions;
  intermediate: LevelQuestions;
  advanced: LevelQuestions;
}

export interface LanguageQuestions {
  python: CategoryQuestions;
  javascript: CategoryQuestions;
  cpp: CategoryQuestions;
}

const createLevelQuestions = (lang: string, cat: string, level: number): Question[] => {
  const langTopics: Record<string, Record<string, string[]>> = {
    python: {
      basic: ['variables', 'data types', 'operators', 'strings', 'lists', 'tuples', 'dictionaries'],
      intermediate: ['functions', 'modules', 'file handling', 'exceptions', 'OOP basics', 'inheritance', 'decorators'],
      advanced: ['generators', 'async/await', 'metaclasses', 'context managers', 'threading', 'multiprocessing', 'design patterns'],
    },
    javascript: {
      basic: ['variables', 'data types', 'operators', 'strings', 'arrays', 'objects', 'DOM basics'],
      intermediate: ['functions', 'closures', 'callbacks', 'promises', 'async/await', 'classes', 'modules'],
      advanced: ['prototypes', 'event loop', 'web APIs', 'performance', 'testing', 'design patterns', 'TypeScript basics'],
    },
    cpp: {
      basic: ['variables', 'data types', 'operators', 'arrays', 'strings', 'pointers', 'references'],
      intermediate: ['functions', 'classes', 'inheritance', 'polymorphism', 'templates', 'STL basics', 'file I/O'],
      advanced: ['smart pointers', 'move semantics', 'multithreading', 'lambda expressions', 'template metaprogramming', 'memory management', 'design patterns'],
    },
  };

  const topic = langTopics[lang][cat][level - 1];

  const mcqs: MCQ[] = [
    {
      type: 'mcq',
      question: `In ${lang}, what is the correct way to work with ${topic}?`,
      options: [
        `Use the standard ${topic} syntax`,
        `Import a special module for ${topic}`,
        `${topic} is not supported`,
        `Use external library`,
      ],
      correct: 0,
    },
    {
      type: 'mcq',
      question: `Which statement about ${topic} in ${lang} is TRUE?`,
      options: [
        `${topic} can improve code readability`,
        `${topic} always decreases performance`,
        `${topic} is deprecated`,
        `${topic} requires compilation`,
      ],
      correct: 0,
    },
    {
      type: 'mcq',
      question: `What is a common use case for ${topic}?`,
      options: [
        'Data storage and manipulation',
        'Only for debugging',
        'Not commonly used',
        'Only in legacy code',
      ],
      correct: 0,
    },
    {
      type: 'mcq',
      question: `When working with ${topic}, which practice is recommended?`,
      options: [
        'Follow language conventions',
        'Ignore documentation',
        'Avoid testing',
        'Skip error handling',
      ],
      correct: 0,
    },
  ];

  const shorts: ShortQuestion[] = [
    {
      type: 'short',
      question: `Name one key concept related to ${topic} in ${lang}.`,
      answer: topic,
    },
    {
      type: 'short',
      question: `What keyword or syntax is commonly used for ${topic}?`,
      answer: lang === 'python' ? 'def' : lang === 'javascript' ? 'function' : 'void',
    },
    {
      type: 'short',
      question: `In one word, describe what ${topic} helps with.`,
      answer: 'organization',
    },
  ];

  const codings: CodingChallenge[] = [
    { type: 'coding', challengeId: `${lang}_${cat}_${level}_1` },
    { type: 'coding', challengeId: `${lang}_${cat}_${level}_2` },
    { type: 'coding', challengeId: `${lang}_${cat}_${level}_3` },
  ];

  return [...mcqs, ...shorts, ...codings];
};

const createCategoryQuestions = (lang: string): CategoryQuestions => {
  const categories: CategoryQuestions = {
    basic: {},
    intermediate: {},
    advanced: {},
  };

  ['basic', 'intermediate', 'advanced'].forEach((cat) => {
    for (let level = 1; level <= 7; level++) {
      categories[cat as keyof CategoryQuestions][level] = createLevelQuestions(lang, cat, level);
    }
  });

  return categories;
};

export const questions: LanguageQuestions = {
  python: createCategoryQuestions('python'),
  javascript: createCategoryQuestions('javascript'),
  cpp: createCategoryQuestions('cpp'),
};

export const getQuestions = (
  language: 'python' | 'javascript' | 'cpp',
  category: 'basic' | 'intermediate' | 'advanced',
  level: number
): Question[] => {
  return questions[language][category][level] || [];
};
