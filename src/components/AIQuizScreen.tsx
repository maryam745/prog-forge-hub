import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Zap, RotateCcw, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { executeCode } from '@/services/judge0';

interface AIQuizScreenProps {
  questions: any[];
  onBack: () => void;
}

const AIQuizScreen = ({ questions, onBack }: AIQuizScreenProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [showResult, setShowResult] = useState(false);
  const [codeInputs, setCodeInputs] = useState<Record<number, string>>({});
  const [codeOutputs, setCodeOutputs] = useState<Record<number, { output: string; isError: boolean }>>({});
  const [runningCode, setRunningCode] = useState<number | null>(null);

  const currentQuestion = questions[currentIndex];

  const handleMCQAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  };

  const handleCodeChange = (value: string) => {
    setCodeInputs({ ...codeInputs, [currentIndex]: value });
  };

  const handleRunCode = async (language: string) => {
    const code = codeInputs[currentIndex] || '';
    if (!code.trim()) return;

    setRunningCode(currentIndex);
    const langMap: Record<string, string> = {
      Python: 'python',
      JavaScript: 'javascript',
      'C++': 'cpp',
    };
    const result = await executeCode(code, langMap[language] || 'python');
    setCodeOutputs({ ...codeOutputs, [currentIndex]: result });
    setAnswers({ ...answers, [currentIndex]: code });
    setRunningCode(null);
  };

  const isAnswerCorrect = (index: number): boolean => {
    const q = questions[index];
    const answer = answers[index];
    if (!q || answer === undefined) return false;

    if (q.type === 'mcq') {
      return answer === q.correct;
    }
    if (q.type === 'coding') {
      const output = codeOutputs[index];
      if (!output) return false;
      return !output.isError && output.output.trim().length > 0;
    }
    return false;
  };

  const calculateScore = () => {
    return questions.reduce((score, _, i) => score + (isAnswerCorrect(i) ? 1 : 0), 0);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (showResult) {
    const score = calculateScore();
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto animate-slide-up">
          <div className="glass-card p-8 text-center mb-8">
            <div
              className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                passed ? 'bg-gradient-to-br from-success to-primary' : 'bg-gradient-to-br from-orange-400 to-destructive'
              } animate-glow-pulse`}
            >
              {passed ? <CheckCircle className="w-12 h-12 text-background" /> : <XCircle className="w-12 h-12 text-background" />}
            </div>
            <h2 className="text-3xl font-bold mb-2 neon-text">{passed ? 'Excellent!' : 'Keep Practicing!'}</h2>
            <p className="text-muted-foreground mb-4">{passed ? 'Great job on this quiz!' : 'You need at least 60% to pass.'}</p>
            <div className="text-6xl font-bold gradient-text mb-2">{score} / {total}</div>
            <p className="text-xl text-muted-foreground mb-8">{percentage}% correct</p>
            <Button variant="outline" onClick={onBack} className="gap-2 cyan-glow-hover">
              <ArrowLeft className="w-4 h-4" /> Back to Topics
            </Button>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 gradient-text">Review</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
                    isAnswerCorrect(i) ? 'bg-success/20 text-success border border-success/50' : 'bg-destructive/20 text-destructive border border-destructive/50'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    if (currentQuestion.type === 'mcq') {
      return (
        <div className="space-y-4">
          <p className="text-xl font-medium mb-6">{currentQuestion.question}</p>
          {currentQuestion.options?.map((option: string, i: number) => (
            <button
              key={i}
              onClick={() => handleMCQAnswer(i)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                answers[currentIndex] === i
                  ? 'bg-primary/20 border-2 border-primary cyan-glow'
                  : 'bg-muted/50 border-2 border-transparent hover:bg-muted hover:border-primary/30'
              }`}
            >
              <span className="font-medium mr-3 text-primary">{String.fromCharCode(65 + i)}.</span>
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (currentQuestion.type === 'coding') {
      const output = codeOutputs[currentIndex];
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">{currentQuestion.title}</h3>
          <p className="text-muted-foreground">{currentQuestion.description}</p>
          {currentQuestion.exampleInput && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm font-medium mb-1">Example Input:</p>
              <pre className="text-sm font-mono">{currentQuestion.exampleInput}</pre>
              <p className="text-sm font-medium mt-3 mb-1">Expected Output:</p>
              <pre className="text-sm font-mono">{currentQuestion.exampleOutput}</pre>
            </div>
          )}
          {currentQuestion.hint && (
            <p className="text-sm text-muted-foreground italic">💡 Hint: {currentQuestion.hint}</p>
          )}
          <textarea
            value={codeInputs[currentIndex] || ''}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full h-48 p-4 bg-muted rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Write your solution here..."
            spellCheck={false}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => handleRunCode('Python')}
              disabled={runningCode === currentIndex}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              {runningCode === currentIndex ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {runningCode === currentIndex ? 'Running...' : 'Run Code'}
            </Button>
          </div>
          {output && (
            <div className={`bg-muted/50 rounded-xl p-4 font-mono text-sm ${output.isError ? 'text-destructive' : ''}`}>
              <p className="text-xs font-medium mb-1 text-muted-foreground">Output:</p>
              <pre className="whitespace-pre-wrap">{output.output}</pre>
            </div>
          )}
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
            <p className="text-sm text-primary font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" /> AI Generated Quiz
            </p>
            <p className="font-medium">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="w-10" />
        </div>

        <div className="h-2 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, background: 'var(--gradient-primary)' }}
          />
        </div>

        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              currentQuestion?.type === 'mcq' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
            }`}
          >
            {currentQuestion?.type === 'mcq' ? 'Multiple Choice' : 'Coding Problem'}
          </span>
        </div>

        <div className="glass-card p-6 mb-6">{renderQuestion()}</div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0} className="gap-2 cyan-glow-hover">
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={answers[currentIndex] === undefined}
            className="gap-2 bg-gradient-to-r from-primary to-secondary text-background"
          >
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIQuizScreen;
