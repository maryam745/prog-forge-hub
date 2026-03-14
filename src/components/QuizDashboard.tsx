import { ArrowLeft, Home, Trophy, Clock, Zap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface QuizHistoryEntry {
  id: string;
  language: string;
  topic: string;
  mode: string;
  score: number;
  total: number;
  pointsEarned: number;
  timeTaken: number;
  timestamp: string;
}

interface QuizDashboardProps {
  history: QuizHistoryEntry[];
  totalQuizPoints: number;
  quizzesCompleted: number;
  onDelete: (id: string) => void;
  onBack: () => void;
  onHome?: () => void;
}

const modeLabels: Record<string, string> = {
  mcq: 'MCQs',
  short: 'Short Answers',
  coding: 'Coding',
};

const QuizDashboard = ({ history, totalQuizPoints, quizzesCompleted, onDelete, onBack, onHome }: QuizDashboardProps) => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="back-button">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold gradient-text">Quiz Dashboard</h1>
          {onHome && (
            <Button variant="ghost" size="icon" onClick={onHome}>
              <Home className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quiz Points</p>
              <p className="text-2xl font-bold gradient-text">{totalQuizPoints}</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quizzes Completed</p>
              <p className="text-2xl font-bold">{quizzesCompleted}</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold">
                {history.length > 0
                  ? Math.round(history.reduce((sum, h) => sum + (h.score / h.total) * 100, 0) / history.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Quiz History</h2>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No quizzes completed yet. Start a quiz to see your history!</p>
          ) : (
            <div className="space-y-3">
              {[...history].reverse().map((entry) => {
                const percentage = Math.round((entry.score / entry.total) * 100);
                const passed = percentage >= 60;
                const mins = Math.floor(entry.timeTaken / 60);
                const secs = entry.timeTaken % 60;
                return (
                  <div key={entry.id} className={`p-4 rounded-xl border ${passed ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${passed ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                          {percentage}%
                        </div>
                        <div>
                          <p className="font-medium text-sm">{entry.topic}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{entry.language}</Badge>
                            <Badge variant="outline" className="text-xs">{modeLabels[entry.mode] || entry.mode}</Badge>
                            <span className="text-xs text-muted-foreground">{mins}m {secs}s</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold">{entry.score}/{entry.total}</p>
                          <p className="text-xs text-primary">+{entry.pointsEarned} pts</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(entry.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDashboard;
