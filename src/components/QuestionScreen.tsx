import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getQuestions, Question, MCQ, ShortQuestion } from '@/questions';

interface QuestionScreenProps {
  language: 'python' | 'javascript' | 'cpp';
  category: 'basic' | 'intermediate' | 'advanced';
  level: number;
  onComplete: (score: number, answers: Record<number, string | number>) => void;
  onBack: () => void;
}

const QuestionScreen = ({ language, category, level, onComplete, onBack }: QuestionScreenProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [showResult, setShowResult] = useState(false);

  const questions = getQuestions(language, category, level);
  const currentQuestion = questions[currentIndex];

  const handleMCQAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  };

  const handleShortAnswer = (value: string) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const isAnswerCorrect = (index: number): boolean => {
    const q = questions[index];
    const answer = answers[index];

    if (!q || answer === undefined) return false;

    if (q.type === 'mcq') {
      return answer === (q as MCQ).correct;
    } else if (q.type === 'short') {
      const correctAnswer = (q as ShortQuestion).answer.toLowerCase();
      return typeof answer === 'string' && answer.toLowerCase().includes(correctAnswer);
    }
    return false;
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((_, i) => {
      if (isAnswerCorrect(i)) score++;
    });
    return score;
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    const score = calculateScore();
    onComplete(score, answers);
  };

  if (showResult) {
    const score = calculateScore();
    const passed = score >= 6;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="glass-card p-8 max-w-lg w-full text-center animate-scale-in">
          <div
            className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-orange-400 to-red-500'
            }`}
          >
            {passed ? (
              <CheckCircle className="w-12 h-12 text-background" />
            ) : (
              <XCircle className="w-12 h-12 text-background" />
            )}
          </div>

          <h2 className="text-3xl font-bold mb-2 neon-text">
            {passed ? 'Level Complete!' : 'Try Again!'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {passed
              ? 'Great job! You passed this level.'
              : 'You need at least 6 correct answers to pass.'}
          </p>

          <div className="text-5xl font-bold gradient-text mb-6">
            {score} / {questions.length}
          </div>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isAnswerCorrect(i) ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                {isAnswerCorrect(i) ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back to Levels
            </Button>
            {passed && (
              <Button onClick={handleFinish} className="flex-1 bg-gradient-to-r from-primary to-accent">
                Save & Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    if (currentQuestion.type === 'mcq') {
      const mcq = currentQuestion as MCQ;
      return (
        <div className="space-y-4">
          <p className="text-xl font-medium mb-6">{mcq.question}</p>
          {mcq.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleMCQAnswer(i)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                answers[currentIndex] === i
                  ? 'bg-primary/20 border-2 border-primary'
                  : 'bg-muted/50 border-2 border-transparent hover:bg-muted'
              }`}
            >
              <span className="font-medium mr-3">{String.fromCharCode(65 + i)}.</span>
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (currentQuestion.type === 'short') {
      const short = currentQuestion as ShortQuestion;
      return (
        <div className="space-y-4">
          <p className="text-xl font-medium mb-6">{short.question}</p>
          <Input
            type="text"
            placeholder="Type your answer..."
            value={(answers[currentIndex] as string) || ''}
            onChange={(e) => handleShortAnswer(e.target.value)}
            className="h-14 text-lg bg-muted border-border/50"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="back-button">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Level {level}</p>
            <p className="font-medium">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="w-10" />
        </div>

        <div className="h-2 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              background: 'var(--gradient-primary)',
            }}
          />
        </div>

        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              currentQuestion?.type === 'mcq'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-green-500/20 text-green-300'
            }`}
          >
            {currentQuestion?.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
          </span>
        </div>

        <div className="glass-card p-6 mb-6">{renderQuestion()}</div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={answers[currentIndex] === undefined}
            className="gap-2 bg-gradient-to-r from-primary to-accent"
          >
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen;
