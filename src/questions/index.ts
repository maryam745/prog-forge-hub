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

export interface CodingQuestion {
  type: 'coding';
  question: string;
  starterCode: string;
  exampleInput?: string;
  exampleOutput: string;
  testCases?: { input: string; expectedOutput: string }[];
}

export type Question = MCQ | ShortQuestion | CodingQuestion;

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

import pythonQuestions from './pythonQuestions';
import javascriptQuestions from './javascriptQuestions';
import cppQuestions from './cppQuestions';

export const questions: LanguageQuestions = {
  python: pythonQuestions,
  javascript: javascriptQuestions,
  cpp: cppQuestions,
};

export const getQuestions = (
  language: 'python' | 'javascript' | 'cpp',
  category: 'basic' | 'intermediate' | 'advanced',
  level: number
): Question[] => {
  return questions[language]?.[category]?.[level] || [];
};
