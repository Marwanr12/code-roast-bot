import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative px-4 pt-20 md:pt-28 pb-12 md:pb-16 max-w-7xl mx-auto text-center overflow-hidden">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-7xl md:text-8xl mb-6 inline-block animate-flame"
      >
        🔥
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="font-display text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-4"
      >
        Roast My <span className="text-gradient-neon glow-text-pink">Code</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-mono"
      >
        Paste your code. Prepare to be destroyed.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground font-mono"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff2d78] animate-pulse" />
        AI roast master is online and unfiltered
      </motion.div>
    </section>
  );
}
