import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[9997] h-[2px] w-full origin-left"
      aria-hidden="true"
    >
      <div className="h-full w-full" style={{ background: "linear-gradient(90deg, rgba(212,198,168,0.35), var(--cream))" }} />
    </motion.div>
  );
}