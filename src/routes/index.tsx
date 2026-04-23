import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Hero } from "@/components/Hero";
import { RoastPanel } from "@/components/RoastPanel";
import { ExamplesSection } from "@/components/ExamplesSection";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Roast My Code 🔥 — AI roasts your terrible code" },
      {
        name: "description",
        content:
          "Paste your code. Prepare to be destroyed. An AI comedy roast master reviews your code with brutal, hilarious honesty.",
      },
      { property: "og:title", content: "Roast My Code 🔥" },
      { property: "og:description", content: "Paste your code. Prepare to be destroyed." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <Hero />
      <RoastPanel />
      <ExamplesSection />
      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground font-mono">
        <p>Made with 💀 and AI</p>
        <p className="mt-1 text-xs opacity-70">No actual roasters were harmed in the making of this app.</p>
      </footer>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
