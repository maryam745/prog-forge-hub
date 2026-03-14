import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Play, Loader2, Code2, Lightbulb, Clock, Home, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { executeCode } from '@/services/judge0';
import Editor from '@monaco-editor/react';

interface QuestionScreenProps {
  language: 'python' | 'javascript' | 'cpp';
  category: 'basic' | 'intermediate' | 'advanced';
  level: number;
  questions: any[];
  onComplete: (score: number, answers: Record<number, string | number>) => void;
  onBack: () => void;
  onHome?: () => void;
}

const monacoLangMap: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  cpp: 'cpp',
};

const QuestionScreen = ({ language, category, level, questions, onComplete, onBack, onHome }: QuestionScreenProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [showResult, setShowResult] = useState(false);
  const [codeSolutions, setCodeSolutions] = useState<Record<number, string>>({});
  const [codeOutputs, setCodeOutputs] = useState<Record<number, { output: string; isError: boolean; passed: boolean }>>({});
  const [runningCode, setRunningCode] = useState(false);
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [stdinInputs, setStdinInputs] = useState<Record<number, string>>({});
  const [showStdin, setShowStdin] = useState<Record<number, boolean>>({});

  // Elapsed timer
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (showResult) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showResult]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const currentItem = questions[currentIndex];

  const handleMCQAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  };

  const handleShortAnswer = (value: string) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const handleCodeChange = (value: string | undefined) => {
    setCodeSolutions({ ...codeSolutions, [currentIndex]: value || '' });
  };

  const handleRunCode = async () => {
    const q = currentItem;
    const code = codeSolutions[currentIndex] || q.starterCode || '';
    setRunningCode(true);

    try {
      const stdin = stdinInputs[currentIndex] || q.exampleInput || '';
      const result = await executeCode(code, language, stdin);
      const output = result.output.trim();
      const expected = (q.exampleOutput || q.testCases?.[0]?.expectedOutput || '').trim();
      const passed = !result.isError && expected && output.includes(expected);

      setCodeOutputs({
        ...codeOutputs,
        [currentIndex]: { output, isError: result.isError, passed: !!passed },
      });

      if (passed) {
        setAnswers({ ...answers, [currentIndex]: 1 });
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
    const q = questions[index];
    const answer = answers[index];
    if (!q || answer === undefined) return false;

    if (q.type === 'coding') return answer === 1;
    if (q.type === 'mcq') return answer === q.correct;
    if (q.type === 'short') {
      const correctAnswer = (q.answer || '').toLowerCase();
      return typeof answer === 'string' && (answer.toLowerCase().includes(correctAnswer) || correctAnswer.includes(answer.toLowerCase()));
    }
    return false;
  };

  const calculateScore = () => {
    return questions.reduce((score: number, _: any, i: number) => score + (isAnswerCorrect(i) ? 1 : 0), 0);
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

  // Enter key to go next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !showResult && canProceed()) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, answers, showResult, codeOutputs]);

  const handleFinish = () => {
    onComplete(calculateScore(), answers);
  };

  const canProceed = () => {
    if (!currentItem) return false;
    if (currentItem.type === 'coding') {
      return answers[currentIndex] === 1 || codeOutputs[currentIndex]?.passed === false;
    }
    return answers[currentIndex] !== undefined;
  };

  if (showResult) {
    const score = calculateScore();
    const passed = score >= Math.ceil(questions.length * 0.6);
    const mins = Math.floor(elapsedTime / 60);
    const secs = elapsedTime % 60;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="glass-card p-8 max-w-lg w-full text-center animate-scale-in">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-orange-400 to-red-500'}`}>
            {passed ? <CheckCircle className="w-12 h-12 text-background" /> : <XCircle className="w-12 h-12 text-background" />}
          </div>

          <h2 className="text-3xl font-bold mb-2 neon-text">
            {passed ? 'Level Complete!' : 'Try Again!'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {passed ? 'Great job! You passed this level.' : `You need at least ${Math.ceil(questions.length * 0.6)} correct answers to pass.`}
          </p>

          <div className="text-5xl font-bold gradient-text mb-2">{score} / {questions.length}</div>
          <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Time taken: {mins}m {secs}s
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {questions.map((_: any, i: number) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAnswerCorrect(i) ? 'bg-green-500/20' : 'bg-red-500/20'}`}
              >
                {isAnswerCorrect(i) ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8 flex-wrap justify-center">
            <Button variant="outline" onClick={onBack} className="flex-1 max-w-[200px]">Back to Levels</Button>
            {passed && (
              <Button onClick={handleFinish} className="flex-1 max-w-[200px] bg-gradient-to-r from-primary to-accent">
                Save & Continue
              </Button>
            )}
            {onHome && (
              <Button variant="ghost" onClick={onHome} className="gap-2">
                <Home className="w-4 h-4" /> Home
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderQuestion = () => {
    if (!currentItem) return null;

    if (currentItem.type === 'coding') {
      const currentCode = codeSolutions[currentIndex] ?? currentItem.starterCode ?? '';
      const output = codeOutputs[currentIndex];

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">{currentItem.title}</h3>
          </div>
          <p className="text-muted-foreground">{currentItem.description}</p>

          {(currentItem.exampleInput || currentItem.testCases?.[0]) && (
            <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
              {(currentItem.exampleInput || currentItem.testCases?.[0]?.input) && (
                <p><span className="text-muted-foreground">Input:</span> <code className="text-primary">{currentItem.exampleInput || currentItem.testCases?.[0]?.input}</code></p>
              )}
              <p><span className="text-muted-foreground">Expected:</span> <code className="text-green-400">{currentItem.exampleOutput || currentItem.testCases?.[0]?.expectedOutput}</code></p>
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

          {/* Stdin Input */}
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <button
              onClick={() => setShowStdin({ ...showStdin, [currentIndex]: !showStdin[currentIndex] })}
              className="w-full px-4 py-2 bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">User Input (stdin)</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {showStdin[currentIndex] ? 'Hide' : 'Add input'}
              </span>
            </button>
            {showStdin[currentIndex] && (
              <textarea
                value={stdinInputs[currentIndex] || ''}
                onChange={(e) => setStdinInputs({ ...stdinInputs, [currentIndex]: e.target.value })}
                className="w-full h-20 p-3 bg-transparent font-mono text-sm resize-none focus:outline-none"
                spellCheck={false}
                placeholder="Enter input values (each on a new line)..."
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRunCode}
              disabled={runningCode}
              className="gap-2 bg-gradient-to-r from-primary to-accent"
              size="sm"
            >
              {runningCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {runningCode ? 'Running...' : 'Run & Test'}
            </Button>
            {currentItem.hint || currentItem.hints?.[0] ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint({ ...showHint, [currentIndex]: !showHint[currentIndex] })}
                className="gap-1 text-muted-foreground"
              >
                <Lightbulb className="w-4 h-4" />
                Hint
              </Button>
            ) : null}
          </div>

          {showHint[currentIndex] && (currentItem.hint || currentItem.hints?.[0]) && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-300">
              💡 {currentItem.hint || currentItem.hints?.[0]}
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

    if (currentItem.type === 'mcq') {
      return (
        <div className="space-y-4">
          <p className="text-xl font-medium mb-6">{currentItem.question}</p>
          {currentItem.options?.map((option: string, i: number) => (
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

    if (currentItem.type === 'short') {
      const isCodeQ = currentItem.hasCode && currentItem.codeSnippet;
      return (
        <div className="space-y-4">
          <p className="text-xl font-medium mb-6">{currentItem.question}</p>
          {isCodeQ && (
            <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{currentItem.codeSnippet}</pre>
            </div>
          )}
          {isCodeQ ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rewrite the corrected program:</p>
              <textarea
                value={(answers[currentIndex] as string) || ''}
                onChange={(e) => handleShortAnswer(e.target.value)}
                placeholder="Write the corrected code here..."
                className="w-full h-40 p-4 bg-muted/50 border-2 border-transparent rounded-xl font-mono text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                spellCheck={false}
              />
            </div>
          ) : (
            <input
              type="text"
              placeholder="Type your answer..."
              value={(answers[currentIndex] as string) || ''}
              onChange={(e) => handleShortAnswer(e.target.value)}
              className="w-full p-4 bg-muted/50 border-2 border-transparent rounded-xl font-medium focus:outline-none focus:border-primary transition-colors"
            />
          )}
        </div>
      );
    }

    return null;
  };

  const getItemLabel = () => {
    if (!currentItem) return '';
    if (currentItem.type === 'coding') return 'Coding Challenge';
    if (currentItem.type === 'mcq') return 'Multiple Choice';
    return 'Short Answer';
  };

  const getItemLabelColor = () => {
    if (!currentItem) return '';
    if (currentItem.type === 'coding') return 'bg-purple-500/20 text-purple-300';
    if (currentItem.type === 'mcq') return 'bg-blue-500/20 text-blue-300';
    return 'bg-green-500/20 text-green-300';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto animate-slide-up">
        {/* Timer bar */}
        <div className="sticky top-4 z-20 glass-card px-4 py-3 mb-6 flex items-center justify-between rounded-2xl">
          <button onClick={onBack} className="back-button">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Level {level}</p>
            <p className="font-medium">
              {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-mono text-sm text-primary">
              <Clock className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </div>
            {onHome && (
              <Button variant="ghost" size="icon" onClick={onHome} className="h-8 w-8">
                <Home className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="h-2 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, background: 'var(--gradient-primary)' }}
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
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen;
