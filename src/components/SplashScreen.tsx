import { useEffect, useState } from 'react';
import { Code2, Terminal, Braces } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return p + 4;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Code2 className="absolute top-20 left-20 w-8 h-8 text-primary/30 animate-float" />
        <Terminal className="absolute top-32 right-32 w-10 h-10 text-secondary/30 animate-float delay-300" />
        <Braces className="absolute bottom-40 left-40 w-6 h-6 text-accent/30 animate-float delay-700" />
        <Code2 className="absolute bottom-20 right-20 w-12 h-12 text-primary/20 animate-float delay-500" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center animate-scale-in">
        {/* Logo */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-primary via-accent to-secondary p-1 glow-effect animate-pulse-glow">
            <div className="w-full h-full bg-card rounded-3xl flex items-center justify-center">
              <div className="relative">
                <Code2 className="w-16 h-16 text-primary" />
                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-bold mb-4 gradient-text font-display">
          ProgNest
        </h1>
        
        {/* Tagline */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-fade-in">
          Master Programming, One Level at a Time
        </p>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200 ease-out"
              style={{
                width: `${progress}%`,
                background: 'var(--gradient-primary)',
              }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Loading... {progress}%
          </p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
};

export default SplashScreen;
