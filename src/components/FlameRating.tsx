import { motion } from "framer-motion";

export function FlameRating({ flames }: { flames: number }) {
  const safeFlames = Math.max(1, Math.min(5, flames));
  return (
    <div className="flex items-center gap-1" aria-label={`${safeFlames} out of 5 flames`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
          className={`text-2xl md:text-3xl ${i < safeFlames ? "" : "grayscale opacity-25"}`}
        >
          🔥
        </motion.span>
      ))}
    </div>
  );
}
