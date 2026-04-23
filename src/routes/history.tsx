import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "Your Roast History 🔥" },
      { name: "description", content: "Every code submission and roast you've ever received." },
    ],
  }),
});

type RoastIssue = { title: string; burn: string; emoji: string };
type RoastRow = {
  id: string;
  language: string;
  code: string;
  opener: string;
  issues: RoastIssue[];
  verdict: string;
  backhanded_compliment: string;
  flames: number;
  created_at: string;
};

function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<RoastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("roasts")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        toast.error("Couldn't load your roasts.");
      } else {
        setRows((data ?? []) as unknown as RoastRow[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    const { error } = await supabase.from("roasts").delete().eq("id", id);
    if (error) {
      setRows(prev);
      toast.error("Couldn't delete that roast.");
    } else {
      toast.success("Roast deleted.");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background grid-bg">
        <Header />
        <div className="px-4 py-20 text-center text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />
      <section className="px-4 py-10 md:py-14 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Your <span className="text-gradient-neon">Roast History</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground font-mono">
            Every piece of code you've submitted, with its roast. Only you can see this. 🔒
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground font-mono">
            <span className="text-4xl block mb-3 animate-flame">🔥</span>
            Loading the embarrassment...
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-border bg-card">
            <div className="text-5xl mb-3">🎙️</div>
            <p className="font-display text-lg font-bold">No roasts yet.</p>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Go submit some code and get destroyed.
            </p>
            <Link
              to="/"
              className="inline-block mt-5 bg-gradient-neon text-white font-display font-bold rounded-xl px-5 py-3 shadow-neon-mixed hover:shadow-neon-pink transition-shadow"
            >
              Roast me 🔥
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map((row, i) => {
              const isOpen = openId === row.id;
              return (
                <motion.li
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : row.id)}
                    className="w-full text-left p-4 md:p-5 flex items-start gap-3 hover:bg-black/30 transition-colors"
                  >
                    <div className="shrink-0 text-2xl pt-0.5">{"🔥".repeat(row.flames)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono font-semibold text-[#ff2d78] bg-[#ff2d78]/10 border border-[#ff2d78]/30 rounded-md px-2 py-0.5">
                          {row.language}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {new Date(row.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-display font-bold text-sm md:text-base truncate">
                        🎤 {row.opener}
                      </p>
                    </div>
                    <span className="shrink-0 text-muted-foreground font-mono text-xs mt-1">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 md:px-5 pb-5 flex flex-col gap-4 border-t border-border pt-4">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                          Submitted code
                        </p>
                        <pre className="bg-black/70 border border-border rounded-lg p-3 font-mono text-xs text-foreground/90 overflow-x-auto max-h-60">
                          {row.code}
                        </pre>
                      </div>

                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                          Issues ({row.issues.length})
                        </p>
                        <ol className="flex flex-col gap-2">
                          {row.issues.map((it, idx) => (
                            <li
                              key={idx}
                              className="rounded-lg border border-border bg-black/40 p-3"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-xl shrink-0">{it.emoji}</span>
                                <div>
                                  <h3 className="font-display font-bold text-sm text-[#ff2d78]">
                                    #{idx + 1} {it.title}
                                  </h3>
                                  <p className="text-sm text-foreground/90">{it.burn}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="rounded-lg bg-gradient-to-r from-[#ff2d78]/10 to-[#7b2fff]/10 border border-[#7b2fff]/30 p-3">
                        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                          Verdict
                        </p>
                        <p className="text-sm">📌 {row.verdict}</p>
                      </div>

                      <blockquote className="border-l-4 border-[#7b2fff] pl-3 italic text-foreground/80 text-sm">
                        💬 "{row.backhanded_compliment}"
                      </blockquote>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-xs font-mono text-muted-foreground hover:text-destructive border border-border hover:border-destructive rounded-lg px-3 py-2 min-h-[36px] transition-colors"
                        >
                          🗑️ Delete this roast
                        </button>
                      </div>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        )}
      </section>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
