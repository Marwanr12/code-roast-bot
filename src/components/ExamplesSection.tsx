import { motion } from "framer-motion";
import { FlameRating } from "./FlameRating";

const examples = [
  {
    code: `function doStuff(x, y) {
  var a = x;
  var b = y;
  return a + b;
}`,
    roast:
      "Oh wow, 'doStuff'? Truly Shakespearean naming. You declared `a = x` and `b = y` like you're translating ancient hieroglyphs. This is JavaScript, not a hostage negotiation. Just write `x + y`. 🤡",
    flames: 1,
  },
  {
    code: `const data = users.filter(u => u.active)
  .map(u => u.name)
  .filter(n => n);`,
    roast:
      "A filter, then a map, then ANOTHER filter to remove falsy names? You're paying for three loops when one would do. Your CPU just filed a restraining order. ☕",
    flames: 3,
  },
  {
    code: `if (isLoggedIn == true) {
  if (user != null) {
    if (user.name != "") {
      hello();
    }
  }
}`,
    roast:
      "Three nested ifs to say hello? It's a greeting, not a TSA checkpoint. `==` instead of `===` is the cherry on this indentation cake. 🎂",
    flames: 2,
  },
];

export function ExamplesSection() {
  return (
    <section className="px-4 py-20 md:py-28 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-3">
          Greatest Hits <span className="text-gradient-neon">🎤</span>
        </h2>
        <p className="text-muted-foreground text-lg">A small museum of digital atrocities.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {examples.map((ex, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-[#ff2d78]/50 transition-colors"
          >
            <pre className="font-mono text-xs md:text-sm bg-black/60 rounded-lg p-4 overflow-x-auto text-foreground/90 border border-border">
              <code>{ex.code}</code>
            </pre>
            <p className="text-sm md:text-base leading-relaxed">{ex.roast}</p>
            <div className="mt-auto pt-2 border-t border-border">
              <FlameRating flames={ex.flames} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
