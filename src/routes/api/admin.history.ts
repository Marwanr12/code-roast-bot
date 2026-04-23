import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Constant-time string comparison to prevent timing attacks
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/admin/history")({
  server: {
    handlers: {
      // Read all roasts (admin only)
      POST: async ({ request }) => {
        const expected = process.env.ADMIN_HISTORY_PASSWORD;
        if (!expected) {
          return new Response(JSON.stringify({ error: "Admin password not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: { password?: string; action?: string; id?: string };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!body.password || !safeEqual(body.password, expected)) {
          return unauthorized();
        }

        // Delete a roast
        if (body.action === "delete") {
          if (!body.id) {
            return new Response(JSON.stringify({ error: "Missing id" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          const { error } = await supabaseAdmin.from("roasts").delete().eq("id", body.id);
          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
          return Response.json({ ok: true });
        }

        // List roasts
        const { data, error } = await supabaseAdmin
          .from("roasts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return Response.json({ roasts: data ?? [] });
      },
    },
  },
});
