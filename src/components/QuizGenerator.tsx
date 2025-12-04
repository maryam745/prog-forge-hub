import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Play, Lightbulb, Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getQuestions, Question, MCQ, ShortQuestion, CodingChallenge } from '@/data/questions';
import { getChallenge } from '@/data/challenges';

interface QuizGeneratorProps {
  language: 'python' | 'javascript' | 'cpp';
  category: 'basic' | 'intermediate' | 'advanced';
  onBack: () => void;
}

const QuizGenerator = ({ language, category, onBack }: QuizGeneratorProps) => {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [showResult, setShowResult] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [codeInput, setCodeInput] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateQuiz();
  }, [language, category]);

  const generateQuiz = () => {
    setIsGenerating(true);
    
    // Collect all questions from all 7 levels
    const allMCQs: MCQ[] = [];
    const allShorts: ShortQuestion[] = [];
    const allCodings: CodingChallenge[] = [];

    for (let level = 1; level <= 7; level++) {
      const levelQuestions = getQuestions(language, category, level);
      levelQuestions.forEach(q => {
        if (q.type === 'mcq') allMCQs.push(q as MCQ);
        else if (q.type === 'short') allShorts.push(q as ShortQuestion);
        else if (q.type === 'coding') allCodings.push(q as CodingChallenge);
      });
    }

    // Shuffle and pick 10 of each type
    const shuffledMCQs = allMCQs.sort(() => Math.random() - 0.5).slice(0, 10);
    const shuffledShorts = allShorts.sort(() => Math.random() - 0.5).slice(0, 10);
    const shuffledCodings = allCodings.sort(() => Math.random() - 0.5).slice(0, 10);

    // Combine and shuffle the final 30 questions
    const combined = [...shuffledMCQs, ...shuffledShorts, ...shuffledCodings];
    const finalQuiz = combined.sort(() => Math.random() - 0.5);

    setQuizQuestions(finalQuiz);
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setCodeOutput('');
    setCodeInput('');
    
    setTimeout(() => setIsGenerating(false), 1500);
  };

  const currentQuestion = quizQuestions[currentIndex];

  useEffect(() => {
    if (currentQuestion?.type === 'coding') {
      const challenge = getChallenge((currentQuestion as CodingChallenge).challengeId);
      if (challenge) {
        setCodeInput(challenge.starterCode);
      }
    }
    setShowHint(false);
    setCodeOutput('');
  }, [currentIndex, currentQuestion]);

  const handleMCQAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  };

  const handleShortAnswer = (value: string) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const handleCodeChange = (code: string) => {
    setCodeInput(code);
    setAnswers({ ...answers, [currentIndex]: code });
  };

  const runCode = () => {
    if (currentQuestion?.type !== 'coding') return;
    
    const challenge = getChallenge((currentQuestion as CodingChallenge).challengeId);
    if (!challenge) return;

    try {
      if (language === 'javascript') {
        try {
          const result = eval(`(function() { ${codeInput}; return typeof helloWorld === 'function' ? helloWorld() : 'Function not found'; })()`);
          setCodeOutput(`Output: ${result}`);
        } catch (e: any) {
          setCodeOutput(`Error: ${e.message}`);
        }
      } else {
        setCodeOutput(`Simulated output for ${language}:\n${challenge.testCases[0]?.expectedOutput || 'No output'}`);
      }
    } catch (e: any) {
      setCodeOutput(`Error: ${e.message}`);
    }
  };

  const isAnswerCorrect = (index: number): boolean => {
    const q = quizQuestions[index];
    const answer = answers[index];

    if (!q || answer === undefined) return false;

    if (q.type === 'mcq') {
      return answer === (q as MCQ).correct;
    } else if (q.type === 'short') {
      const correctAnswer = (q as ShortQuestion).answer.toLowerCase();
      return typeof answer === 'string' && answer.toLowerCase().includes(correctAnswer);
    } else if (q.type === 'coding') {
      return typeof answer === 'string' && answer.length > 20;
    }
    return false;
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((_, i) => {
      if (isAnswerCorrect(i)) score++;
    });
    return score;
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
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

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-spin-slow">
            <Zap className="w-12 h-12 text-background" />
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Generating AI Quiz...</h2>
          <p className="text-muted-foreground">Creating 30 unique questions</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const score = calculateScore();
    const percentage = Math.round((score / 30) * 100);
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
              {passed ? (
                <CheckCircle className="w-12 h-12 text-background" />
              ) : (
                <XCircle className="w-12 h-12 text-background" />
              )}
            </div>

            <h2 className="text-3xl font-bold mb-2 neon-text">
              {passed ? 'Excellent Work!' : 'Keep Practicing!'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {passed ? 'You passed the AI-generated quiz!' : 'You need at least 60% to pass.'}
            </p>

            <div className="text-6xl font-bold gradient-text mb-2">
              {score} / 30
            </div>
            <p className="text-xl text-muted-foreground mb-8">{percentage}% correct</p>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onBack} className="gap-2 cyan-glow-hover">
                <ArrowLeft className="w-4 h-4" />
                Back to Categories
              </Button>
              <Button onClick={generateQuiz} className="gap-2 bg-gradient-to-r from-primary to-secondary text-background">
                <RotateCcw className="w-4 h-4" />
                Generate New Quiz
              </Button>
            </div>
          </div>

          {/* Wrong Answers Section */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 gradient-text">Review Your Answers</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {quizQuestions.map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
                    isAnswerCorrect(i) 
                      ? 'bg-success/20 text-success border border-success/50' 
                      : 'bg-destructive/20 text-destructive border border-destructive/50'
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
      const short = currentQuestion as ShortQuestion;
      return (
        <div className="space-y-4">
          <p className="text-xl font-medium mb-6">{short.question}</p>
          <Input
            type="text"
            placeholder="Type your answer..."
            value={(answers[currentIndex] as string) || ''}
            onChange={(e) => handleShortAnswer(e.target.value)}
            className="h-14 text-lg bg-muted border-primary/30 focus:border-primary"
          />
        </div>
      );
    }

    if (currentQuestion.type === 'coding') {
      const coding = currentQuestion as CodingChallenge;
      const challenge = getChallenge(coding.challengeId);

      if (!challenge) return <p>Challenge not found</p>;

      return (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2 text-primary">{challenge.title}</h3>
              <p className="text-muted-foreground">{challenge.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="text-muted-foreground hover:text-primary"
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              Hint
            </Button>
          </div>

          {showHint && (
            <div className="p-3 bg-accent/10 rounded-lg text-sm text-accent animate-fade-in border border-accent/30">
              💡 {challenge.hints[0]}
            </div>
          )}

          <div className="hacker-card overflow-hidden">
            <div className="p-2 bg-muted border-b border-primary/30 flex items-center justify-between">
              <span className="text-sm text-primary font-mono">{challenge.language}</span>
              <Button size="sm" onClick={runCode} className="bg-success hover:bg-success/80 text-background">
                <Play className="w-4 h-4 mr-1" />
                Run
              </Button>
            </div>
            <textarea
              value={codeInput}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full h-48 p-4 bg-transparent font-mono text-sm resize-none focus:outline-none text-foreground"
              spellCheck={false}
            />
          </div>

          {codeOutput && (
            <div className="p-4 hacker-card font-mono text-sm animate-fade-in">
              <p className="text-primary mb-2">Output:</p>
              <p className="whitespace-pre-wrap">{codeOutput}</p>
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-xl border border-primary/20">
            <p className="text-sm text-primary mb-2">Test Cases:</p>
            {challenge.testCases.map((tc, i) => (
              <div key={i} className="text-sm font-mono">
                <span className="text-muted-foreground">Input:</span> {tc.input || 'None'}
                <span className="mx-2 text-primary">→</span>
                <span className="text-success">{tc.expectedOutput}</span>
              </div>
            ))}
          </div>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-sm text-primary font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Generated Quiz
            </p>
            <p className="font-medium">
              Question {currentIndex + 1} of {quizQuestions.length}
            </p>
          </div>
          <div className="w-10" />
        </div>

        <div className="h-2 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`,
              background: 'var(--gradient-primary)',
            }}
          />
        </div>

        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              currentQuestion?.type === 'mcq'
                ? 'bg-primary/20 text-primary'
                : currentQuestion?.type === 'short'
                ? 'bg-success/20 text-success'
                : 'bg-accent/20 text-accent'
            }`}
          >
            {currentQuestion?.type === 'mcq'
              ? 'Multiple Choice'
              : currentQuestion?.type === 'short'
              ? 'Short Answer'
              : 'Coding Challenge'}
          </span>
        </div>

        <div className="glass-card p-6 mb-6">{renderQuestion()}</div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-2 cyan-glow-hover"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={answers[currentIndex] === undefined}
            className="gap-2 bg-gradient-to-r from-primary to-secondary text-background"
          >
            {currentIndex === quizQuestions.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
