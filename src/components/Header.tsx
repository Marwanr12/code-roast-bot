import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function Header() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out. Your code is safe… for now.");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="font-display font-bold text-lg flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <span>RoastMyCode</span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-3">
          {loading ? null : user ? (
            <>
              <Link
                to="/history"
                className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                activeProps={{ className: "text-[#ff2d78]" }}
              >
                History
              </Link>
              <span className="hidden sm:inline text-xs font-mono text-muted-foreground max-w-[160px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm font-semibold rounded-lg px-3 py-2 border border-border hover:border-[#ff2d78] hover:text-[#ff2d78] transition-colors min-h-[40px]"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-bold rounded-lg px-4 py-2 bg-gradient-neon text-white shadow-neon-mixed hover:shadow-neon-pink transition-shadow min-h-[40px] inline-flex items-center"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
