import { useState } from 'react';
import { ArrowLeft, Play, Save, CheckCircle, Loader2, Terminal, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { executeCode } from '@/services/judge0';
import Editor from '@monaco-editor/react';

interface RunCodeScreenProps {
  onSave: (language: string, code: string) => void;
  onBack: () => void;
}

const starterCodes: Record<string, string> = {
  javascript: `// JavaScript Playground
// Write your code here!

function greet(name) {
  return "Hello, " + name + "!";
}

// Test your function
console.log(greet("World"));`,
  python: `# Python Playground
# Write your code here!

def greet(name):
    return f"Hello, {name}!"

# Test your function
print(greet("World"))`,
  cpp: `// C++ Playground
// Write your code here!
#include <iostream>
using namespace std;

int main() {
    string name = "World";
    cout << "Hello, " << name << "!" << endl;
    return 0;
}`,
};

const monacoLanguageMap: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
  cpp: 'cpp',
};

const RunCodeScreen = ({ onSave, onBack }: RunCodeScreenProps) => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(starterCodes.javascript);
  const [stdin, setStdin] = useState('');
  const [showInput, setShowInput] = useState(true);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(starterCodes[lang]);
    setOutput('');
  };

  const languages = [
    { id: 'javascript', label: 'JavaScript', gradient: 'from-yellow-500 to-orange-500' },
    { id: 'python', label: 'Python', gradient: 'from-blue-500 to-green-500' },
    { id: 'cpp', label: 'C++', gradient: 'from-purple-500 to-indigo-500' },
  ];

  const runCode = async () => {
    setOutput('');
    setIsRunning(true);
    setIsError(false);

    const result = await executeCode(code, language, stdin || undefined);
    setOutput(result.output);
    setIsError(result.isError);
    setIsRunning(false);
  };

  const handleSave = () => {
    if (code.trim().length < 10) {
      toast({
        title: 'Cannot save',
        description: 'Please write some code before saving.',
        variant: 'destructive',
      });
      return;
    }

    onSave(language, code);
    toast({
      title: 'Session saved!',
      description: 'Your code has been saved successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="back-button">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Code Playground</h1>
              <p className="text-muted-foreground">Write and run your own code</p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex bg-muted rounded-xl p-1 flex-wrap gap-1">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  language === lang.id
                    ? `bg-gradient-to-r ${lang.gradient} text-white`
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Code Editor */}
          <div className="glass-card overflow-hidden">
            <div className="p-3 bg-card border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm text-muted-foreground font-mono">
                {language === 'javascript' ? 'script.js' : language === 'python' ? 'main.py' : 'main.cpp'}
              </span>
            </div>
            <Editor
              height="400px"
              language={monacoLanguageMap[language]}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: language === 'python' ? 4 : 2,
                wordWrap: 'on',
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Console Panel */}
          <div className="glass-card overflow-hidden flex flex-col">
            <div className="p-3 bg-card border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Console</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={runCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
                  {isRunning ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
                  {isRunning ? 'Running...' : 'Run'}
                </Button>
                <Button size="sm" variant="outline" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>

            {/* Output Area */}
            <div className="h-[280px] p-4 overflow-auto font-mono text-sm border-b border-border">
              {isRunning ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executing code...
                </div>
              ) : output ? (
                <pre className={`whitespace-pre-wrap ${isError ? 'text-destructive' : ''}`}>{output}</pre>
              ) : (
                <p className="text-muted-foreground">
                  Click "Run" to execute your code...
                </p>
              )}
            </div>

            {/* Stdin Input - integrated in console */}
            <div className="bg-muted/30">
              <div className="px-4 pt-2 flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Input (stdin) — provide input before running</span>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                className="w-full h-[100px] px-4 py-2 bg-transparent font-mono text-sm resize-none focus:outline-none placeholder:text-muted-foreground"
                spellCheck={false}
                placeholder={'> Enter input values here (one per line)\n> e.g. 5\n> Hello'}
              />
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="font-medium">Tips</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• JavaScript, Python aur C++ supported hain with full syntax highlighting</li>
            <li>• Code runs on a real server via Judge0 API</li>
            <li>• "User Input" section use karo agar program mein input lena hai (scanf, input(), prompt)</li>
            <li>• Save your sessions to review them later</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RunCodeScreen;
