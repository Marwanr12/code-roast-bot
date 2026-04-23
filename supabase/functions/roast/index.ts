const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a savage but hilarious comedy roast master who reviews code. You deliver roasts in a STRUCTURED, organized way — like a stand-up comedian with a clipboard.

You MUST call the deliver_roast function. Provide:

1. **detectedLanguage**: Auto-detect the programming language from the code itself (e.g. "JavaScript", "TypeScript", "Python", "C++", "Java", "PHP", "Go", "Rust", "Ruby", "Swift", "Kotlin", "C#", "HTML", "CSS", "SQL", "Bash", "Unknown"). Use ONLY the code — ignore any hints.
2. **opener**: One brutal punchline opener (1–2 sentences, max 30 words). Set the tone.
3. **issues**: An array covering EVERY single problem you can find in the code — do NOT limit yourself to a fixed number. If the code has 2 issues, return 2. If it has 15 issues, return 15. Be thorough and exhaustive. Each issue has:
   - title: short punchy label (max 6 words, e.g. "Variable names from a fever dream")
   - burn: 1–2 sentence funny roast about that specific problem (max 40 words)
   - emoji: ONE emoji that matches the burn
4. **verdict**: One closing summary line (max 25 words).
5. **backhandedCompliment**: A single backhanded compliment (max 25 words).
6. **flames**: integer 1–5 (1 = disaster, 5 = surprisingly okay).

Rules:
- Be funny, sarcastic, specific to the actual code
- Roast the CODE, never the person
- Cover ALL issues you can find: bad variable names, messy logic, inefficiencies, anti-patterns, missing error handling, security problems, code style, naming conventions, dead code, magic numbers, missing types, poor abstractions, etc.
- Each issue must be DISTINCT — don't repeat the same problem twice
- Make critiques idiomatic to the detected language
- No markdown formatting inside strings — plain text only`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY missing from environment");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "Missing code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Detect the programming language and roast this code:\n\n\`\`\`\n${code}\n\`\`\`` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "deliver_roast",
              description: "Deliver a comedy roast of the given code.",
              parameters: {
                type: "object",
                properties: {
                  detectedLanguage: { type: "string", description: "The programming language auto-detected from the code." },
                  opener: { type: "string", description: "One brutal punchline opener, 1-2 sentences." },
                  issues: {
                    type: "array",
                    minItems: 1,
                    description: "Cover ALL issues in the code. No fixed limit.",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short punchy label, max 6 words." },
                        burn: { type: "string", description: "1-2 sentence funny roast for this issue." },
                        emoji: { type: "string", description: "ONE emoji matching the burn." },
                      },
                      required: ["title", "burn", "emoji"],
                      additionalProperties: false,
                    },
                  },
                  verdict: { type: "string", description: "One closing summary line." },
                  backhandedCompliment: { type: "string", description: "A single backhanded compliment." },
                  flames: { type: "integer", minimum: 1, maximum: 5, description: "1=disaster, 5=surprisingly okay" },
                },
                required: ["opener", "issues", "verdict", "backhandedCompliment", "flames"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "deliver_roast" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Whoa, slow down. Too many roasts." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Out of AI credits. Top up in Lovable workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Even our AI refused to look at this code 💀" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Even our AI refused to look at this code 💀" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const args = JSON.parse(toolCall.function.arguments);

    // Persist code + roast to the database (best-effort, non-blocking)
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_KEY) {
        await fetch(`${SUPABASE_URL}/rest/v1/roasts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            language: language || "Unknown",
            code,
            opener: args.opener,
            issues: args.issues,
            verdict: args.verdict,
            backhanded_compliment: args.backhandedCompliment,
            flames: args.flames,
          }),
        });
      }
    } catch (storeErr) {
      console.error("Failed to store roast:", storeErr);
    }

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("roast error:", e);
    return new Response(
      JSON.stringify({ error: "Even our AI refused to look at this code 💀" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
