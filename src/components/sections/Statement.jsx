import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import StatementCard from "@/components/site/StatementCard";
import InlineTile from "@/components/site/InlineTile";
import { track } from "@/lib/track";

const SENTENCE_LINES = [
  "Clean, fast websites with",
  "real working backends,",
  "crafted for small businesses",
  "that want more customers.",
];

// Words that get a small inline project tile right after them.
const TILE_AFTER = [1, 5, 9, 12];

const LINES = (() => {
  let i = -1;
  return SENTENCE_LINES.map((line) => line.split(" ").map((word) => ({ word, i: ++i })));
})();
const TOTAL = LINES.reduce((n, line) => n + line.length, 0);

export default function Statement({ projects = [], onOpenProject }) {
  const ref = useRef(null);

  const open = (project, el) => {
    if (!onOpenProject) return;
    track("project_open");
    onOpenProject(project, el);
  };
  const isMobile = useIsMobile();
  const [filled, setFilled] = useState(0);

  const bigCards = projects.filter((p) => p.featured !== false).slice(0, 2);
  const tiles = projects.filter((p) => !bigCards.includes(p));

  // words fill one by one, scrubbed to scroll
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.9"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const n = Math.round(Math.max(0, Math.min(1, v)) * TOTAL);
    setFilled((prev) => (prev === n ? prev : n));
  });

  // the two cards drift against each other as the section passes
  const drift = useScroll({ target: ref, offset: ["start end", "end start"] });
  const aX = useTransform(drift.scrollYProgress, [0, 0.5, 1], [-160, 0, 36]);
  const aY = useTransform(drift.scrollYProgress, [0, 1], [70, -60]);
  const aR = useTransform(drift.scrollYProgress, [0, 0.5, 1], [-7, -2, 0.5]);
  const bY = useTransform(drift.scrollYProgress, [0, 0.5, 1], [180, 0, -44]);
  const bX = useTransform(drift.scrollYProgress, [0, 1], [44, -18]);

  const styleA = isMobile ? undefined : { x: aX, y: aY, rotate: aR };
  const styleB = isMobile ? undefined : { y: bY, x: bX };

  return (
    <section ref={ref} className="relative overflow-hidden bg-background lg:min-h-[100svh]">
      <motion.span
        aria-hidden="true"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-6 top-12 z-20 block h-3.5 w-3.5 lg:left-10 lg:top-20"
        style={{ background: "var(--cream)" }}
      />

      <div className="mx-auto w-full max-w-[1600px] px-5 py-24 sm:px-8 lg:max-w-none lg:px-0 lg:py-0">
        <div className="lg:absolute lg:right-[3%] lg:top-[16%] lg:w-[60%]">
          <h2 className="relative z-10 font-heading text-[7.6vw] font-extrabold leading-[1.08] tracking-tight lg:text-[3.05vw] lg:leading-[1.06]">
            {LINES.map((line, li) => (
              <span key={li} className="lg:block lg:whitespace-nowrap">
                {line.map((item) => {
                  const isCream = item.i < filled;
                  const isLast = item.i === TOTAL - 1;
                  const tileIdx = TILE_AFTER.indexOf(item.i);
                  return (
                    <React.Fragment key={item.i}>
                      <span
                        className="transition-colors duration-300"
                        style={{
                          color: isCream ? "#D4C6A8" : "#6b6558",
                          textShadow: isLast && filled >= TOTAL ? "0 0 28px rgba(212,198,168,0.65)" : "none",
                        }}
                      >
                        {item.word}
                      </span>
                      {tileIdx >= 0 && tiles.length > 0 && (
                        <InlineTile project={tiles[tileIdx % tiles.length]} variant={item.i} active={isCream} />
                      )}{" "}
                    </React.Fragment>
                  );
                })}
              </span>
            ))}
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mt-8 font-body text-sm text-[#8C8573] sm:text-base lg:max-w-[32%]"
          >
            Built for clinics, salons, gyms, stores, hotels and travel brands.
          </motion.p>

          {/* mobile: the two cards swipe horizontally. desktop: they break out
              of the row and float over the sentence. */}
          <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:contents">
            {bigCards[0] && (
              <motion.div
                style={styleA}
                className="w-[80vw] shrink-0 snap-center sm:w-[62vw] lg:absolute lg:left-[-76%] lg:top-0 lg:z-10 lg:w-[66%]"
              >
                <StatementCard project={bigCards[0]} index={0} onOpen={(el) => open(bigCards[0], el)} />
              </motion.div>
            )}
            {bigCards[1] && (
              <motion.div
                style={styleB}
                className="w-[80vw] shrink-0 snap-center sm:w-[62vw] lg:absolute lg:right-[4%] lg:top-[62%] lg:z-20 lg:w-[56%]"
              >
                <StatementCard project={bigCards[1]} index={1} onOpen={(el) => open(bigCards[1], el)} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}