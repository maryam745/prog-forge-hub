import { ArrowLeft, Trash2, Code2, Calendar, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SavedSession } from '@/hooks/useProgress';

interface SavedSessionsProps {
  sessions: SavedSession[];
  onDelete: (id: string) => void;
  onBack: () => void;
  onHome?: () => void;
}

const fileExtensions: Record<string, string> = {
  javascript: 'js',
  python: 'py',
  cpp: 'cpp',
};

const SavedSessions = ({ sessions, onDelete, onBack, onHome }: SavedSessionsProps) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = (session: SavedSession) => {
    const ext = fileExtensions[session.language] || 'txt';
    const filename = `code_${session.language}_${new Date(session.timestamp).toISOString().slice(0, 10)}.${ext}`;
    const blob = new Blob([session.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="back-button">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Saved Sessions</h1>
              <p className="text-muted-foreground">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
          {onHome && (
            <Button variant="ghost" size="icon" onClick={onHome} className="shrink-0">
              <Home className="w-5 h-5" />
            </Button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
              <Code2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No saved sessions</h3>
            <p className="text-muted-foreground">
              Your saved code sessions will appear here. Go to "Run Your Own Code" to create one!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className="glass-card p-6 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        session.language === 'javascript'
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                          : session.language === 'cpp'
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-500'
                          : 'bg-gradient-to-br from-blue-500 to-green-500'
                      }`}
                    >
                      <Code2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">{session.language}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(session.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(session)}
                      className="text-muted-foreground hover:text-primary"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(session.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="bg-muted rounded-xl p-4 overflow-hidden">
                  <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap overflow-x-auto max-h-40">
                    {session.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSessions;
