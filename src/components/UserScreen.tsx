import { useState } from 'react';
import { User, Users, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserScreenProps {
  users: string[];
  onSelectUser: (name: string) => void;
  onCreateUser: (name: string) => void;
}

const UserScreen = ({ users, onSelectUser, onCreateUser }: UserScreenProps) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Please enter a name');
      return;
    }
    if (users.includes(trimmed)) {
      setError('This user already exists');
      return;
    }
    onCreateUser(trimmed);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-slide-up">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5">
              <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Welcome to ProgNest</h2>
            <p className="text-muted-foreground">Enter your name to get started</p>
          </div>

          {/* New user input */}
          <div className="space-y-4 mb-8">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter your name..."
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-muted border-border/50 focus:border-primary h-12 text-lg"
              />
              <Button
                onClick={handleCreate}
                className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive animate-fade-in">{error}</p>
            )}
          </div>

          {/* Existing users */}
          {users.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Or continue as:</span>
              </div>
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user}
                    onClick={() => onSelectUser(user)}
                    className="w-full p-4 bg-muted/50 hover:bg-muted rounded-xl flex items-center justify-between group transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{user}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserScreen;
