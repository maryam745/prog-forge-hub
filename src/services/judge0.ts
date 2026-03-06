const JUDGE0_URL = 'http://localhost:2358';

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
  language: string
): Promise<{ output: string; isError: boolean }> {
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    return { output: `Unsupported language: ${language}`, isError: true };
  }

  try {
    const response = await fetch(
      `${JUDGE0_URL}/submissions/?base64_encoded=false&wait=true`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: languageId,
        }),
      }
    );

    if (!response.ok) {
      return { output: `Judge0 error: ${response.status} ${response.statusText}`, isError: true };
    }

    const result: Judge0Result = await response.json();

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
      isError: result.status?.id !== 3, // 3 = Accepted
    };
  } catch (error: any) {
    return {
      output: `Connection error: ${error.message}. Make sure Judge0 is running on port 2358.`,
      isError: true,
    };
  }
}
