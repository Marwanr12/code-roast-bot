const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a savage but hilarious comedy roast master who reviews code. When given code, you roast it brutally but funnily — like a stand-up comedian.

Rules:
- Point out bad variable names, messy logic, inefficiencies
- Be funny, sarcastic, use emojis
- Keep it under 150 words
- End with one "backhanded compliment"
- Never be actually mean or offensive about the person, only the code
- Rate the code from 1-5 flames (1 = disaster, 5 = surprisingly okay)

You MUST call the deliver_roast function with your response.`;

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
                  roast: { type: "string", description: "The funny roast, under 150 words." },
                  flames: { type: "integer", minimum: 1, maximum: 5, description: "1=disaster, 5=surprisingly okay" },
                  backhandedCompliment: { type: "string", description: "A single backhanded compliment." },
                },
                required: ["roast", "flames", "backhandedCompliment"],
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
