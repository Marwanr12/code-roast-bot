const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a savage but hilarious comedy roast master who reviews code. You deliver roasts in a STRUCTURED, organized way — like a stand-up comedian with a clipboard.

You MUST call the deliver_roast function. Provide:

1. **opener**: One brutal punchline opener (1–2 sentences, max 30 words). Set the tone.
2. **issues**: An array of 3–5 specific problems. Each issue has:
   - title: short punchy label (max 6 words, e.g. "Variable names from a fever dream")
   - burn: 1–2 sentence funny roast about that specific problem (max 40 words)
   - emoji: ONE emoji that matches the burn
3. **verdict**: One closing summary line (max 25 words).
4. **backhandedCompliment**: A single backhanded compliment (max 25 words).
5. **flames**: integer 1–5 (1 = disaster, 5 = surprisingly okay).

Rules:
- Be funny, sarcastic, specific to the actual code
- Roast the CODE, never the person
- Point out: bad variable names, messy logic, inefficiencies, anti-patterns, missing error handling
- Match the language given (idiomatic critiques)
- No markdown formatting inside strings — plain text only`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, language } = await req.json();
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
          { role: "user", content: `Language: ${language || "Unknown"}\n\nCode:\n\`\`\`\n${code}\n\`\`\`` },
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
                  opener: { type: "string", description: "One brutal punchline opener, 1-2 sentences." },
                  issues: {
                    type: "array",
                    minItems: 3,
                    maxItems: 5,
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
