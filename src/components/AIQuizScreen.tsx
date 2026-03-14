import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Zap, Play, Loader2, Clock, AlertTriangle, LogOut, Home, RotateCcw, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { executeCode } from '@/services/judge0';
import { supabase } from '@/integrations/supabase/client';

interface AIQuizScreenProps {
  questions: any[];
  language: 'python' | 'javascript' | 'cpp';
  topic?: string;
  mode?: 'mcq' | 'short' | 'coding';
  onBack: () => void;
  onHome?: () => void;
  onQuizComplete?: (score: number, total: number, timeTaken: number) => void;
  onRetry?: () => void;
}

const TIMER_SECONDS: Record<string, number> = {
  mcq: 5 * 60,
  short: 10 * 60,
  coding: 15 * 60,
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const AIQuizScreen = ({ questions, language, topic, mode, onBack, onHome, onQuizComplete, onRetry }: AIQuizScreenProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [showResult, setShowResult] = useState(false);
  const [timeOver, setTimeOver] = useState(false);
  const [codeInputs, setCodeInputs] = useState<Record<number, string>>({});
  const [codeOutputs, setCodeOutputs] = useState<Record<number, { output: string; isError: boolean }>>({});
  const [runningCode, setRunningCode] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS[mode || 'mcq'] || 300);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [stdinInputs, setStdinInputs] = useState<Record<number, string>>({});
  const [showStdin, setShowStdin] = useState<Record<number, boolean>>({});

  // AI validation state
  const [validating, setValidating] = useState(false);
  const [aiResults, setAiResults] = useState<Record<number, { correct: boolean; explanation: string }>>({});

  const totalTime = TIMER_SECONDS[mode || 'mcq'] || 300;
  const currentQuestion = questions[currentIndex];

  const isAnswerCorrect = useCallback((index: number): boolean => {
    // If we have AI validation result, use that
    if (aiResults[index] !== undefined) return aiResults[index].correct;

    const q = questions[index];
    const answer = answers[index];
    if (!q || answer === undefined) return false;

    if (q.type === 'mcq') return answer === q.correct;
    if (q.type === 'short') {
      const correct = (q.answer || '').trim().toLowerCase();
      const given = String(answer).trim().toLowerCase();
      return given === correct || correct.includes(given) || given.includes(correct);
    }
    if (q.type === 'coding') {
      const output = codeOutputs[index];
      if (!output || output.isError) return false;
      const expected = (q.exampleOutput || '').trim();
      const actual = output.output.trim();
      if (!expected) return actual.length > 0;
      return actual === expected;
    }
    return false;
  }, [questions, answers, codeOutputs, aiResults]);

  const calculateScore = useCallback(() => {
    return questions.reduce((score: number, _: any, i: number) => score + (isAnswerCorrect(i) ? 1 : 0), 0);
  }, [questions, isAnswerCorrect]);

  const validateShortAnswers = useCallback(async () => {
    const shortAnswers = questions
      .map((q: any, i: number) => ({ q, i }))
      .filter(({ q, i }: any) => q.type === 'short' && answers[i] !== undefined);

    if (shortAnswers.length === 0) return;

    setValidating(true);
    try {
      const toValidate = shortAnswers.map(({ q, i }: any) => ({
        question: q.question,
        userAnswer: String(answers[i]),
        correctAnswer: q.answer,
        hasCode: q.hasCode || false,
        codeSnippet: q.codeSnippet || '',
        isRewrite: q.hasCode || false,
      }));

      const { data, error } = await supabase.functions.invoke('validate-answer', {
        body: { answers: toValidate, language },
      });

      if (!error && data?.results) {
        const newResults: Record<number, { correct: boolean; explanation: string }> = {};
        shortAnswers.forEach(({ i }: any, idx: number) => {
          if (data.results[idx]) {
            newResults[i] = data.results[idx];
          }
        });
        setAiResults(newResults);
      }
    } catch (err) {
      console.error('Validation failed:', err);
    } finally {
      setValidating(false);
    }
  }, [questions, answers, language]);

  const finishQuiz = useCallback(async () => {
    setTimeTaken(totalTime - timeLeft);
    setShowResult(true);

    // Validate short answers via AI
    await validateShortAnswers();

    const score = calculateScore();
    onQuizComplete?.(score);
  }, [totalTime, timeLeft, calculateScore, onQuizComplete, validateShortAnswers]);

  // Timer
  useEffect(() => {
    if (showResult || timeOver) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showResult, timeOver]);

  // Time over
  useEffect(() => {
    if (timeLeft === 0 && !showResult && !timeOver) {
      setTimeTaken(totalTime);
      setTimeOver(true);
    }
  }, [timeLeft, showResult, timeOver, totalTime]);

  const handleMCQAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  };

  const handleShortAnswer = (value: string) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const handleCodeChange = (value: string) => {
    setCodeInputs({ ...codeInputs, [currentIndex]: value });
  };

  const handleStdinChange = (value: string) => {
    setStdinInputs({ ...stdinInputs, [currentIndex]: value });
  };

  const handleRunCode = async () => {
    const code = codeInputs[currentIndex] || '';
    if (!code.trim()) return;
    setRunningCode(currentIndex);
    const result = await executeCode(code, language, stdinInputs[currentIndex] || undefined);
    setCodeOutputs({ ...codeOutputs, [currentIndex]: result });
    setAnswers({ ...answers, [currentIndex]: code });
    setRunningCode(null);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleRetry = () => {
    setTimeOver(false);
    setShowResult(false);
    setCurrentIndex(0);
    setAnswers({});
    setCodeInputs({});
    setCodeOutputs({});
    setStdinInputs({});
    setAiResults({});
    setTimeLeft(TIMER_SECONDS[mode || 'mcq'] || 300);
    setTimeTaken(0);
    if (onRetry) onRetry();
  };

  const isTimeLow = timeLeft <= 60;

  // TIME OVER SCREEN
  if (timeOver && !showResult) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-destructive to-orange-500 flex items-center justify-center animate-pulse">
            <Clock className="w-12 h-12 text-background" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-destructive">⏰ Time Over!</h2>
          <p className="text-muted-foreground mb-8">
            You ran out of time. You can retry the quiz or go back.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Button>
            <Button onClick={handleRetry} className="gap-2 bg-gradient-to-r from-primary to-secondary text-background">
              <RotateCcw className="w-4 h-4" /> Retry Quiz
            </Button>
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

  // RESULTS SCREEN
  if (showResult) {
    const score = calculateScore();
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 60;
    const mins = Math.floor(timeTaken / 60);
    const secs = timeTaken % 60;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto animate-slide-up">
          <div className="glass-card p-8 text-center mb-8">
            {validating ? (
              <div className="py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                <h2 className="text-xl font-bold mb-2">Validating Answers...</h2>
                <p className="text-muted-foreground">AI is checking your short answers</p>
              </div>
            ) : (
              <>
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${passed ? 'bg-gradient-to-br from-success to-primary' : 'bg-gradient-to-br from-orange-400 to-destructive'} animate-glow-pulse`}>
                  {passed ? <CheckCircle className="w-12 h-12 text-background" /> : <XCircle className="w-12 h-12 text-background" />}
                </div>
                <h2 className="text-3xl font-bold mb-2 neon-text">{passed ? 'Excellent!' : 'Keep Practicing!'}</h2>
                <p className="text-muted-foreground mb-4">{passed ? 'Great job on this quiz!' : 'You need at least 60% to pass.'}</p>
                <div className="text-6xl font-bold gradient-text mb-2">{score} / {total}</div>
                <p className="text-xl text-muted-foreground mb-2">{percentage}% correct</p>
                <p className="text-sm text-muted-foreground mb-8 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time taken: {mins}m {secs}s
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button variant="outline" onClick={onBack} className="gap-2 cyan-glow-hover">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button onClick={handleRetry} className="gap-2 bg-gradient-to-r from-primary to-secondary text-background">
                    <RotateCcw className="w-4 h-4" /> Retry
                  </Button>
                  {onHome && (
                    <Button variant="ghost" onClick={onHome} className="gap-2">
                      <Home className="w-4 h-4" /> Home
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          {!validating && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 gradient-text">Review</h3>
              <div className="space-y-3">
                {questions.map((q: any, i: number) => {
                  const correct = isAnswerCorrect(i);
                  const aiResult = aiResults[i];
                  return (
                    <div key={i} className={`p-4 rounded-xl border ${correct ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${correct ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{q.question || q.title}</p>
                          {q.type === 'short' && (
                            <div className="mt-1">
                              <p className="text-xs text-muted-foreground">
                                Your answer: <span className={correct ? 'text-success' : 'text-destructive'}>{String(answers[i] || '—')}</span>
                                {!correct && <> | Correct: <span className="text-success">{q.answer}</span></>}
                              </p>
                              {aiResult?.explanation && (
                                <p className="text-xs text-muted-foreground mt-1 italic">AI: {aiResult.explanation}</p>
                              )}
                            </div>
                          )}
                          {q.type === 'mcq' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Correct: {q.options?.[q.correct]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderCodingResult = () => {
    const output = codeOutputs[currentIndex];
    if (!output) return null;
    const expected = (currentQuestion.exampleOutput || '').trim();
    const correct = !output.isError && expected && output.output.trim() === expected;

    return (
      <div className="space-y-3">
        <div className={`rounded-xl p-4 font-mono text-sm ${output.isError ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted/50'}`}>
          <p className="text-xs font-medium mb-1 text-muted-foreground">Your Output:</p>
          <pre className="whitespace-pre-wrap">{output.output}</pre>
        </div>
        {!output.isError && expected && (
          <div className={`rounded-xl p-4 flex items-center gap-3 ${correct ? 'bg-success/10 border border-success/40' : 'bg-destructive/10 border border-destructive/40'}`}>
            {correct ? <CheckCircle className="w-5 h-5 text-success shrink-0" /> : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
            <div>
              <p className={`font-semibold ${correct ? 'text-success' : 'text-destructive'}`}>
                {correct ? '✅ Correct!' : '❌ Incorrect.'}
              </p>
              {!correct && <p className="text-sm text-muted-foreground mt-1">Expected: <code className="bg-muted px-1 rounded">{expected}</code></p>}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getTypeBadge = () => {
    const t = currentQuestion?.type;
    if (t === 'mcq') return { label: 'Multiple Choice', cls: 'bg-primary/20 text-primary' };
    if (t === 'short') return { label: 'Short Answer', cls: 'bg-secondary/20 text-secondary' };
    return { label: 'Coding Problem', cls: 'bg-accent/20 text-accent' };
  };

  const badge = getTypeBadge();

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

    if (currentQuestion.type === 'short') {
      const isCodeQuestion = currentQuestion.hasCode && currentQuestion.codeSnippet;
      return (
        <div className="space-y-4">
          <p className="text-xl font-medium">{currentQuestion.question}</p>
          {isCodeQuestion && (
            <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{currentQuestion.codeSnippet}</pre>
            </div>
          )}
          {isCodeQuestion ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rewrite the corrected program below:</p>
              <textarea
                value={String(answers[currentIndex] || '')}
                onChange={(e) => handleShortAnswer(e.target.value)}
                placeholder="Write the corrected code here..."
                className="w-full h-40 p-4 bg-muted/50 border-2 border-transparent rounded-xl font-mono text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                spellCheck={false}
              />
            </div>
          ) : (
            <input
              type="text"
              value={String(answers[currentIndex] || '')}
              onChange={(e) => handleShortAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full p-4 bg-muted/50 border-2 border-transparent rounded-xl font-medium focus:outline-none focus:border-primary transition-colors"
            />
          )}
        </div>
      );
    }

    if (currentQuestion.type === 'coding') {
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
                onChange={(e) => handleStdinChange(e.target.value)}
                className="w-full h-20 p-3 bg-transparent font-mono text-sm resize-none focus:outline-none"
                spellCheck={false}
                placeholder="Enter input values (each on a new line)..."
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRunCode} disabled={runningCode === currentIndex} className="bg-green-600 hover:bg-green-700 gap-2">
              {runningCode === currentIndex ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {runningCode === currentIndex ? 'Running...' : 'Run & Check'}
            </Button>
          </div>
          {renderCodingResult()}
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
        {/* Timer bar with Quit */}
        <div className={`sticky top-4 z-20 glass-card px-4 py-3 mb-6 flex items-center justify-between rounded-2xl ${isTimeLow ? 'border-destructive/50 animate-pulse' : ''}`}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Quiz</span>
          </div>
          <div className={`flex items-center gap-2 font-mono font-bold text-lg ${isTimeLow ? 'text-destructive' : 'text-primary'}`}>
            {isTimeLow && <AlertTriangle className="w-4 h-4" />}
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{currentIndex + 1}/{questions.length}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuitDialog(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 h-8 px-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Quit</span>
            </Button>
          </div>
        </div>

        <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, background: 'var(--gradient-primary)' }}
          />
        </div>

        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badge.cls}`}>
            {badge.label}
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

      {/* Quit Confirmation Dialog */}
      <Dialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">Quit Quiz?</DialogTitle>
            <DialogDescription>
              Do you really want to quit this quiz? Your progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowQuitDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onBack} className="gap-2">
              <LogOut className="w-4 h-4" /> Yes, Quit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIQuizScreen;
