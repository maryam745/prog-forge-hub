import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildPrompt(language: string, category: string, topic: string | undefined, mode: string, count: number) {
  const topicStr = topic ? ` on the topic: ${topic}` : "";

  if (mode === "mcq") {
    return `Generate exactly ${count} multiple choice questions for ${language} at ${category} difficulty level${topicStr}.

Return a JSON array where each item has this format:
{
  "type": "mcq",
  "question": "question text",
  "options": ["A", "B", "C", "D"],
  "correct": 0
}

Rules:
- "correct" is 0-indexed option index
- All questions MUST be specifically about ${topic || language}
- Mix difficulty within the ${category} level
- Return ONLY the JSON array, no markdown or explanation`;
  }

  if (mode === "short") {
    return `Generate exactly ${count} short answer questions for ${language} at ${category} difficulty level${topicStr}.

Mix of two types:
1. Conceptual one-word or very short answer questions (e.g. "What keyword is used to define a function in Python?")
2. "Find the error" questions — show a small code snippet with a bug and ask the user to identify the error in one word or short phrase

Return a JSON array where each item has this format:
{
  "type": "short",
  "question": "question text (include code snippet in backticks if it's a find-the-error question)",
  "answer": "correct short answer",
  "hasCode": true/false,
  "codeSnippet": "the buggy code if hasCode is true, otherwise omit"
}

Rules:
- At least 4 out of ${count} should be "find the error" type with code snippets
- "answer" should be a concise answer (1-5 words max)
- All questions MUST be specifically about ${topic || language}
- Return ONLY the JSON array, no markdown or explanation`;
  }

  if (mode === "coding") {
    return `Generate exactly ${count} coding problems for ${language} at ${category} difficulty level${topicStr}.

Return a JSON array where each item has this format:
{
  "type": "coding",
  "title": "Problem Title",
  "description": "Problem description explaining what to implement",
  "exampleInput": "example input",
  "exampleOutput": "expected output",
  "hint": "optional hint"
}

Rules:
- Problems should be solvable in ${language}
- All problems MUST be specifically about ${topic || language}
- Mix difficulty within the ${category} level
- Return ONLY the JSON array, no markdown or explanation`;
  }

  if (mode === "level") {
    return `Generate a programming quiz for ${language} at ${category} difficulty level${topicStr}.

Return exactly 10 MCQ questions, 5 short answer questions, and 5 coding problems as a JSON array (20 items total).

MCQ format:
{
  "type": "mcq",
  "question": "question text",
  "options": ["A", "B", "C", "D"],
  "correct": 0
}

Short answer format:
{
  "type": "short",
  "question": "question text",
  "answer": "correct short answer",
  "hasCode": true/false,
  "codeSnippet": "buggy code if hasCode is true, otherwise omit"
}

Coding problem format:
{
  "type": "coding",
  "title": "Problem Title",
  "description": "Problem description explaining what to implement",
  "exampleInput": "example input",
  "exampleOutput": "expected output",
  "hint": "optional hint"
}

Rules:
- MCQ "correct" is 0-indexed option index
- At least 2 short answer questions should be "find the error" type with code snippets
- Coding problems should be solvable in ${language}
- ALL questions must be specifically about ${topic || language}
- First put all MCQs, then short answers, then coding problems
- Return ONLY the JSON array, no markdown or explanation`;
  }

  // fallback: mixed (legacy)
  const numMCQ = Math.ceil(count * 0.6);
  const numCoding = count - numMCQ;
  return `Generate a programming quiz for ${language} at ${category} difficulty level${topicStr}.

Return exactly ${numMCQ} MCQ questions and ${numCoding} coding problems as a JSON array.

MCQ format:
{
  "type": "mcq",
  "question": "question text",
  "options": ["A", "B", "C", "D"],
  "correct": 0
}

Coding problem format:
{
  "type": "coding",
  "title": "Problem Title",
  "description": "Problem description explaining what to implement",
  "exampleInput": "example input",
  "exampleOutput": "expected output",
  "hint": "optional hint"
}

Rules:
- MCQ "correct" is 0-indexed option index
- Coding problems should be solvable in ${language}
- Mix difficulty within the ${category} level
- Return ONLY the JSON array, no markdown or explanation`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language, category, topic, count, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = buildPrompt(language, category, topic, mode || "mixed", count || 10);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are a programming quiz generator. Always respond with valid JSON arrays only. No markdown, no explanation.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Failed to generate quiz" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let questions;
    try {
      questions = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", jsonStr);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
