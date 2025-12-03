import { UserProgress } from '@/hooks/useProgress';
import { Trophy, Code2, BookOpen, History, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  progress: UserProgress;
  completedLevels: number;
  onChooseLanguage: () => void;
  onRunCode: () => void;
  onViewSessions: () => void;
  onLogout: () => void;
}

const Dashboard = ({
  progress,
  completedLevels,
  onChooseLanguage,
  onRunCode,
  onViewSessions,
  onLogout,
}: DashboardProps) => {
  const totalLevels = 63; // 3 languages × 3 categories × 7 levels
  const percentage = Math.round((completedLevels / totalLevels) * 100);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              Welcome back, <span className="gradient-text">{progress.name}</span>
            </h1>
            <p className="text-muted-foreground">Ready to continue your journey?</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-3xl font-bold gradient-text">{progress.totalPoints}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Levels Completed</p>
                <p className="text-3xl font-bold">{completedLevels} <span className="text-lg text-muted-foreground">/ {totalLevels}</span></p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-3xl font-bold">{percentage}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedLevels} of {totalLevels} levels</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                background: 'var(--gradient-primary)',
              }}
            />
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onChooseLanguage}
            className="glass-card p-6 text-left group hover:scale-[1.02] transition-all duration-300"
          >
            <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-effect">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              Choose Language
            </h3>
            <p className="text-sm text-muted-foreground">
              Learn Python, JavaScript, or C++ through interactive lessons
            </p>
          </button>

          <button
            onClick={onRunCode}
            className="glass-card p-6 text-left group hover:scale-[1.02] transition-all duration-300"
          >
            <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-secondary transition-colors">
              Run Your Own Code
            </h3>
            <p className="text-sm text-muted-foreground">
              Practice coding in a free-form environment
            </p>
          </button>

          <button
            onClick={onViewSessions}
            className="glass-card p-6 text-left group hover:scale-[1.02] transition-all duration-300"
          >
            <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
              <History className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
              View Saved Sessions
            </h3>
            <p className="text-sm text-muted-foreground">
              Review your previously saved code sessions
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
