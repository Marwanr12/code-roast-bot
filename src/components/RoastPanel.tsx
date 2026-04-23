import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { FlameRating } from "./FlameRating";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "C++", "Java", "PHP", "Go", "Rust", "Other"];
const MAX_CHARS = 2000;

type RoastResult = {
  roast: string;
  flames: number;
  backhandedCompliment: string;
};

export function RoastPanel() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result?.flames === 5) {
      const end = Date.now() + 1500;
      const colors = ["#ff2d78", "#7b2fff", "#ffffff"];
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [result]);

  const handleRoast = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/roast`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ code: code.slice(0, MAX_CHARS), language }),
      });

      if (resp.status === 429) {
        setError("Whoa, slow down. The roast oven is overheating. 🔥");
        return;
      }
      if (resp.status === 402) {
        setError("Out of AI credits. Add some in your Lovable workspace.");
        return;
      }
      if (!resp.ok) {
        setError("Even our AI refused to look at this code 💀");
        return;
      }

      const data = (await resp.json()) as RoastResult;
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Even our AI refused to look at this code 💀");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `${result.roast}\n\n${"🔥".repeat(result.flames)} (${result.flames}/5)\n\n"${result.backhandedCompliment}"\n\n— Roasted by RoastMyCode`;
    await navigator.clipboard.writeText(text);
    toast.success("Roast copied. Now go cry in monospace.");
  };

  const handleTweet = () => {
    if (!result) return;
    const text = `My code just got roasted: "${result.roast.slice(0, 180)}..." ${"🔥".repeat(result.flames)}\n\nGet roasted too:`;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  const charCount = code.length;
  const overLimit = charCount > MAX_CHARS;
  const disabled = loading || !code.trim() || overLimit;

  return (
    <section id="roast" className="px-4 pb-20 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT — input */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-5 md:p-6 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-display text-xl md:text-2xl font-bold">Your Code 🫣</h2>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-input text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-[#ff2d78] font-mono"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value.slice(0, MAX_CHARS + 200))}
            placeholder="// Paste your masterpiece here...\nfunction doStuff(x, y) { ... }"
            spellCheck={false}
            className="w-full min-h-[260px] md:min-h-[360px] bg-black/70 border border-border rounded-xl p-4 font-mono text-sm text-foreground/95 resize-y focus:outline-none focus:ring-2 focus:ring-[#ff2d78]/60 placeholder:text-muted-foreground/50"
          />

          <div className="flex items-center justify-between text-xs">
            <span className={overLimit ? "text-destructive font-semibold" : "text-muted-foreground"}>
              {charCount} / {MAX_CHARS} characters
            </span>
            {overLimit && <span className="text-destructive">Too much code, even for us.</span>}
          </div>

          <motion.button
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            onClick={handleRoast}
            disabled={disabled}
            className="bg-gradient-neon text-white font-display font-bold text-lg rounded-xl py-4 min-h-[52px] shadow-neon-mixed disabled:opacity-40 disabled:cursor-not-allowed transition-shadow hover:shadow-neon-pink"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block animate-spin-slow">🔥</span> Roasting...
              </span>
            ) : (
              <span>Roast It 🔥</span>
            )}
          </motion.button>
        </motion.div>

        {/* RIGHT — output */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 md:p-6 flex flex-col gap-4 min-h-[420px]"
        >
          <h2 className="font-display text-xl md:text-2xl font-bold">The Roast 🎤</h2>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground"
              >
                <span className="text-6xl animate-flame">🔥</span>
                <p className="font-mono text-sm">Sharpening the knives...</p>
              </motion.div>
            )}

            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 text-center"
              >
                <span className="text-6xl">💀</span>
                <p className="text-foreground/90 font-display text-lg">{error}</p>
              </motion.div>
            )}

            {!loading && !error && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-5 flex-1"
              >
                {result.flames === 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.8 }}
                    className="text-center text-5xl"
                  >
                    💀
                  </motion.div>
                )}

                <p className="text-base md:text-lg leading-relaxed text-foreground/95 whitespace-pre-wrap">
                  {result.roast}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-3 py-3 border-y border-border">
                  <span className="text-sm text-muted-foreground font-mono">Severity</span>
                  <FlameRating flames={result.flames} />
                </div>

                <blockquote className="border-l-4 border-[#7b2fff] pl-4 italic text-foreground/80">
                  "{result.backhandedCompliment}"
                </blockquote>

                <div className="flex flex-wrap gap-3 mt-auto pt-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 min-w-[140px] min-h-[44px] bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-lg px-4 py-2 transition-colors"
                  >
                    📋 Copy Roast
                  </button>
                  <button
                    onClick={handleTweet}
                    className="flex-1 min-w-[140px] min-h-[44px] border border-[#ff2d78] text-[#ff2d78] hover:bg-[#ff2d78] hover:text-white font-semibold rounded-lg px-4 py-2 transition-colors"
                  >
                    🐦 Share on Twitter
                  </button>
                </div>
              </motion.div>
            )}

            {!loading && !error && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-3 text-center text-muted-foreground"
              >
                <span className="text-5xl opacity-60">🎙️</span>
                <p className="font-mono text-sm max-w-xs">
                  Your roast will appear here. Hope your variable names are good. They aren't.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
