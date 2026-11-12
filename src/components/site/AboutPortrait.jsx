import React, { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Image } from "@/components/ui/image";

const OPEN = "inset(0% 0% 0% 0%)";

export default function AboutPortrait({ src }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  // Scroll position drives the wipe and the parallax drift.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.55"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40]);
  const inset = useTransform(scrollYProgress, [0.05, 0.45], [100, 0]);
  const wipe = useTransform(inset, (v) => `inset(${v}% 0% 0% 0%)`);
  const clipPath = reduce ? OPEN : wipe;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(mx, { stiffness: 90, damping: 18 });
  const rotateX = useSpring(my, { stiffness: 90, damping: 18 });

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 9);
    my.set(-((e.clientY - r.top) / r.height - 0.5) * 9);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div ref={ref} className="mx-auto w-full max-w-md lg:max-w-none">
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ y, rotateX, rotateY, transformPerspective: 1000 }}
      >
        <motion.div
          style={{ clipPath, border: "1px solid rgba(212,198,168,0.18)" }}
          className="relative aspect-[3/4] overflow-hidden rounded-3xl"
        >
          {src ? (
            <Image src={src} alt="Portrait" className="h-full w-full" fittingType="fill" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: "linear-gradient(160deg, #1d1a14, #0c0a07)" }}
            >
              <span className="font-heading text-[6rem] font-extrabold leading-none text-[#D4C6A8]">L</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}