import { supabase } from '@/integrations/supabase/client';

export const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  cpp: 54,
  java: 62,
};

export interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
}

export async function executeCode(
  sourceCode: string,
  language: string,
  stdin?: string
): Promise<{ output: string; isError: boolean }> {
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    return { output: `Unsupported language: ${language}`, isError: true };
  }

  try {
    const { data, error } = await supabase.functions.invoke('execute-code', {
      body: {
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin || '',
      },
    });

    if (error) {
      return { output: `Error: ${error.message}`, isError: true };
    }

    const result = data as Judge0Result;

    if (result.stdout) {
      return { output: result.stdout, isError: false };
    }
    if (result.stderr) {
      return { output: result.stderr, isError: true };
    }
    if (result.compile_output) {
      return { output: result.compile_output, isError: true };
    }
    return {
      output: result.status?.description || 'Code executed successfully (no output)',
      isError: result.status?.id !== 3,
    };
  } catch (error: any) {
    return {
      output: `Connection error: ${error.message}`,
      isError: true,
    };
  }
}
