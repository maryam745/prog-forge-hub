import { ArrowLeft, Trash2, Code2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SavedSession } from '@/hooks/useProgress';

interface SavedSessionsProps {
  sessions: SavedSession[];
  onDelete: (id: string) => void;
  onBack: () => void;
}

const SavedSessions = ({ sessions, onDelete, onBack }: SavedSessionsProps) => {
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Saved Sessions</h1>
            <p className="text-muted-foreground">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        {/* Sessions List */}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(session.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
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
