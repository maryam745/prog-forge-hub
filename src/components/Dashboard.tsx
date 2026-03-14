import { UserProgress, getBadge, LEVELS_PER_LANGUAGE } from '@/hooks/useProgress';
import { Trophy, Code2, BookOpen, History, LogOut, Sparkles, Award, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

interface DashboardProps {
  progress: UserProgress;
  completedLevels: number;
  getLanguageCompletedLevels: (lang: string) => number;
  onChooseLanguage: () => void;
  onRunCode: () => void;
  onViewSessions: () => void;
  onQuizDashboard: () => void;
  onLogout: () => void;
}

const languageIcons: Record<string, string> = {
  python: '🐍',
  javascript: '⚡',
  cpp: '⚙️',
};

const Dashboard = ({
  progress,
  completedLevels,
  getLanguageCompletedLevels,
  onChooseLanguage,
  onRunCode,
  onViewSessions,
  onQuizDashboard,
  onLogout,
}: DashboardProps) => {
  const totalLevels = 126;
  const percentage = Math.round((completedLevels / totalLevels) * 100);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto animate-slide-up flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              Welcome back, <span className="gradient-text">{progress.name}</span>
            </h1>
            <p className="text-muted-foreground">Ready to continue your journey?</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-muted-foreground hover:text-destructive">
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

        {/* Language Badges */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Language Badges</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(['python', 'javascript', 'cpp'] as const).map((lang) => {
              const completed = getLanguageCompletedLevels(lang);
              const badge = getBadge(completed, LEVELS_PER_LANGUAGE);
              return (
                <div key={lang} className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl mb-2 shadow-lg`}>
                    {languageIcons[lang]}
                  </div>
                  <p className="text-sm font-semibold capitalize">{lang === 'cpp' ? 'C++' : lang}</p>
                  <p className={`text-xs font-bold bg-gradient-to-r ${badge.color} bg-clip-text text-transparent`}>{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{completed}/{LEVELS_PER_LANGUAGE}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedLevels} of {totalLevels} levels</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, background: 'var(--gradient-primary)' }} />
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={onChooseLanguage} className="glass-card p-6 text-left group hover:scale-[1.02] transition-all duration-300">
            <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-effect">
              <Code2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">Choose Language</h3>
            <p className="text-sm text-muted-foreground">Learn through interactive lessons</p>
          </button>

          <button onClick={onRunCode} className="glass-card p-6 text-left group hover:scale-[1.02] transition-all duration-300">
            <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <Code2 className="w-7 h-7 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-secondary transition-colors">Run Code</h3>
            <p className="text-sm text-muted-foreground">Practice in free-form environment</p>
          </button>

          <button onClick={onQuizDashboard} className="glass-card p-6 text-left group hover:scale-[1.02] transition-all duration-300">
            <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-accent transition-colors">Quiz Dashboard</h3>
            <p className="text-sm text-muted-foreground">View quiz history & stats</p>
          </button>

          <button onClick={onViewSessions} className="glass-card p-6 text-left group hover:scale-[1.02] transition-all duration-300">
            <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-success to-secondary flex items-center justify-center">
              <History className="w-7 h-7 text-success-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-success transition-colors">Saved Sessions</h3>
            <p className="text-sm text-muted-foreground">Review saved code sessions</p>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
