import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source_code, language_id, stdin } = await req.json();
    const RAPIDAPI_KEY = Deno.env.get("JUDGE0_RAPIDAPI_KEY");

    if (!RAPIDAPI_KEY) {
      return new Response(
        JSON.stringify({ error: "JUDGE0_RAPIDAPI_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!source_code || !language_id) {
      return new Response(
        JSON.stringify({ error: "source_code and language_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Submit code to Judge0
    const submitResponse = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,compile_output,status,time,memory`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code,
          language_id,
          stdin: stdin || "",
        }),
      }
    );

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error("Judge0 API error:", submitResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Judge0 API error: ${submitResponse.status}` }),
        { status: submitResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await submitResponse.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("execute-code error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
