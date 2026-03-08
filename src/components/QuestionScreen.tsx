import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Play, Loader2, Code2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getQuestions, Question, MCQ, ShortQuestion } from '@/questions';
import { getChallengesForLevel, Challenge } from '@/data/challenges';
import { executeCode } from '@/services/judge0';
import Editor from '@monaco-editor/react';

interface QuestionScreenProps {
  language: 'python' | 'javascript' | 'cpp';
  category: 'basic' | 'intermediate' | 'advanced';
  level: number;
  onComplete: (score: number, answers: Record<number, string | number>) => void;
  onBack: () => void;
}

type CombinedItem =
  | { kind: 'question'; data: Question }
  | { kind: 'challenge'; data: Challenge };

const monacoLangMap: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  cpp: 'cpp',
};

const QuestionScreen = ({ language, category, level, onComplete, onBack }: QuestionScreenProps) => {
  const questions = getQuestions(language, category, level);
  const challenges = getChallengesForLevel(language, category, level);

  const items: CombinedItem[] = [
    ...questions.map((q): CombinedItem => ({ kind: 'question', data: q })),
    ...challenges.map((c): CombinedItem => ({ kind: 'challenge', data: c })),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [showResult, setShowResult] = useState(false);

  // Coding challenge state
  const [codeSolutions, setCodeSolutions] = useState<Record<number, string>>({});
  const [codeOutputs, setCodeOutputs] = useState<Record<number, { output: string; isError: boolean; passed: boolean }>>({});
  const [runningCode, setRunningCode] = useState(false);
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});

  const currentItem = items[currentIndex];

  const handleMCQAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  };

  const handleShortAnswer = (value: string) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const handleCodeChange = (value: string | undefined) => {
    setCodeSolutions({ ...codeSolutions, [currentIndex]: value || '' });
  };

  const handleRunCode = async (challenge: Challenge) => {
    const code = codeSolutions[currentIndex] || challenge.starterCode;
    setRunningCode(true);

    try {
      const testCase = challenge.testCases[0];
      const result = await executeCode(code, language, testCase?.input || '');
      const output = result.output.trim();
      const passed = !result.isError && testCase && output.includes(testCase.expectedOutput);

      setCodeOutputs({
        ...codeOutputs,
        [currentIndex]: { output, isError: result.isError, passed: !!passed },
      });

      if (passed) {
        setAnswers({ ...answers, [currentIndex]: 1 }); // Mark as correct
      }
    } catch {
      setCodeOutputs({
        ...codeOutputs,
        [currentIndex]: { output: 'Execution failed', isError: true, passed: false },
      });
    } finally {
      setRunningCode(false);
    }
  };

  const isAnswerCorrect = (index: number): boolean => {
    const item = items[index];
    const answer = answers[index];
    if (!item || answer === undefined) return false;

    if (item.kind === 'challenge') {
      return answer === 1;
    }

    const q = item.data as Question;
    if (q.type === 'mcq') return answer === (q as MCQ).correct;
    if (q.type === 'short') {
      const correctAnswer = (q as ShortQuestion).answer.toLowerCase();
      return typeof answer === 'string' && answer.toLowerCase().includes(correctAnswer);
    }
    return false;
  };

  const calculateScore = () => {
    let score = 0;
    items.forEach((_, i) => { if (isAnswerCorrect(i)) score++; });
    return score;
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleFinish = () => {
    onComplete(calculateScore(), answers);
  };

  const canProceed = () => {
    if (!currentItem) return false;
    if (currentItem.kind === 'challenge') {
      return answers[currentIndex] === 1 || codeOutputs[currentIndex]?.passed === false;
    }
    return answers[currentIndex] !== undefined;
  };

  if (showResult) {
    const score = calculateScore();
    const passed = score >= Math.ceil(items.length * 0.6);

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="glass-card p-8 max-w-lg w-full text-center animate-scale-in">
          <div
            className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-orange-400 to-red-500'
            }`}
          >
            {passed ? <CheckCircle className="w-12 h-12 text-background" /> : <XCircle className="w-12 h-12 text-background" />}
          </div>

          <h2 className="text-3xl font-bold mb-2 neon-text">
            {passed ? 'Level Complete!' : 'Try Again!'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {passed
              ? 'Great job! You passed this level.'
              : `You need at least ${Math.ceil(items.length * 0.6)} correct answers to pass.`}
          </p>

          <div className="text-5xl font-bold gradient-text mb-6">
            {score} / {items.length}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {items.map((item, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isAnswerCorrect(i) ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
                title={item.kind === 'challenge' ? `Coding: ${(item.data as Challenge).title}` : undefined}
              >
                {item.kind === 'challenge' ? (
                  isAnswerCorrect(i) ? <Code2 className="w-5 h-5 text-green-400" /> : <Code2 className="w-5 h-5 text-red-400" />
                ) : isAnswerCorrect(i) ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={onBack} className="flex-1">Back to Levels</Button>
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
    if (!currentItem) return null;

    if (currentItem.kind === 'challenge') {
      const challenge = currentItem.data as Challenge;
      const output = codeOutputs[currentIndex];
      const currentCode = codeSolutions[currentIndex] ?? challenge.starterCode;

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">{challenge.title}</h3>
          </div>
          <p className="text-muted-foreground">{challenge.description}</p>

          {challenge.testCases[0] && (
            <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
              {challenge.testCases[0].input && (
                <p><span className="text-muted-foreground">Input:</span> <code className="text-primary">{challenge.testCases[0].input}</code></p>
              )}
              <p><span className="text-muted-foreground">Expected:</span> <code className="text-green-400">{challenge.testCases[0].expectedOutput}</code></p>
            </div>
          )}

          <div className="rounded-lg overflow-hidden border border-border/50">
            <Editor
              height="200px"
              language={monacoLangMap[language]}
              value={currentCode}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 8 },
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleRunCode(challenge)}
              disabled={runningCode}
              className="gap-2 bg-gradient-to-r from-primary to-accent"
              size="sm"
            >
              {runningCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {runningCode ? 'Running...' : 'Run & Test'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint({ ...showHint, [currentIndex]: !showHint[currentIndex] })}
              className="gap-1 text-muted-foreground"
            >
              <Lightbulb className="w-4 h-4" />
              Hint
            </Button>
          </div>

          {showHint[currentIndex] && challenge.hints[0] && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-300">
              💡 {challenge.hints[0]}
            </div>
          )}

          {output && (
            <div className={`rounded-lg p-3 text-sm font-mono ${
              output.passed ? 'bg-green-500/10 border border-green-500/30' : output.isError ? 'bg-red-500/10 border border-red-500/30' : 'bg-muted/30 border border-border/50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {output.passed ? (
                  <><CheckCircle className="w-4 h-4 text-green-400" /><span className="text-green-400 font-semibold">Test Passed!</span></>
                ) : (
                  <><XCircle className="w-4 h-4 text-red-400" /><span className="text-red-400 font-semibold">{output.isError ? 'Error' : 'Test Failed'}</span></>
                )}
              </div>
              <pre className="whitespace-pre-wrap text-xs opacity-80">{output.output}</pre>
            </div>
          )}
        </div>
      );
    }

    const q = currentItem.data as Question;

    if (q.type === 'mcq') {
      const mcq = q as MCQ;
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

    if (q.type === 'short') {
      const short = q as ShortQuestion;
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

  const getItemLabel = () => {
    if (!currentItem) return '';
    if (currentItem.kind === 'challenge') return 'Coding Challenge';
    const q = currentItem.data as Question;
    return q.type === 'mcq' ? 'Multiple Choice' : 'Short Answer';
  };

  const getItemLabelColor = () => {
    if (!currentItem) return '';
    if (currentItem.kind === 'challenge') return 'bg-purple-500/20 text-purple-300';
    const q = currentItem.data as Question;
    return q.type === 'mcq' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300';
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
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Level {level}</p>
            <p className="font-medium">
              Question {currentIndex + 1} of {items.length}
            </p>
          </div>
          <div className="w-10" />
        </div>

        <div className="h-2 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / items.length) * 100}%`,
              background: 'var(--gradient-primary)',
            }}
          />
        </div>

        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getItemLabelColor()}`}>
            {getItemLabel()}
          </span>
        </div>

        <div className="glass-card p-6 mb-6">{renderQuestion()}</div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2 bg-gradient-to-r from-primary to-accent"
          >
            {currentIndex === items.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen;
