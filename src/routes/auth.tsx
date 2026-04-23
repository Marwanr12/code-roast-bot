import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Roast My Code 🔥" },
      { name: "description", content: "Sign in to save and revisit every roast of your code." },
    ],
  }),
});

function AuthPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/" });
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            toast.error("Account already exists. Try signing in.");
            setMode("signin");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Welcome! Time to get roasted. 🔥");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(
            error.message.toLowerCase().includes("invalid")
              ? "Wrong email or password."
              : error.message,
          );
          return;
        }
        toast.success("Welcome back, brave coder.");
        navigate({ to: "/" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />
      <section className="px-4 py-12 md:py-20 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 md:p-8"
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔥</div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {mode === "signin" ? "Sign in to view your roast history" : "Save every roast forever"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-input rounded-lg px-3 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-[#ff2d78] font-mono text-sm min-h-[44px]"
                placeholder="you@example.com"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="bg-input rounded-lg px-3 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-[#ff2d78] font-mono text-sm min-h-[44px]"
                placeholder="••••••••"
              />
              {mode === "signup" && (
                <span className="text-xs text-muted-foreground font-mono">
                  Min 6 characters. Leaked passwords are blocked.
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-neon text-white font-display font-bold text-base rounded-xl py-3 min-h-[48px] shadow-neon-mixed disabled:opacity-50 hover:shadow-neon-pink transition-shadow"
            >
              {submitting ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm font-mono text-muted-foreground">
            {mode === "signin" ? (
              <>
                No account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-[#ff2d78] hover:underline font-semibold"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have one?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="text-[#ff2d78] hover:underline font-semibold"
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs font-mono text-muted-foreground hover:text-foreground">
              ← Back home
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
