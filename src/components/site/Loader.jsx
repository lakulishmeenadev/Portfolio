import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Loader: counter 000→100 over ~2s, blinking ONLINE dot, pulsing TAP TO ENTER.
// On tap: circular clip-path reveal expanding from the tap point. Shown once per session.
export default function Loader({ onEnter }) {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem("vantly_entered") !== "1";
    } catch (e) {
      return true;
    }
  });
  const [count, setCount] = useState(0);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const started = useRef(false);

  useEffect(() => {
    if (!visible) return;
    const duration = 2000;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 2);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const handleEnter = (e) => {
    if (started.current) return;
    started.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX || rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((e.clientY || rect.top + rect.height / 2) / window.innerHeight) * 100;
    setOrigin({ x, y });
    try {
      sessionStorage.setItem("vantly_entered", "1");
    } catch (err) {
      /* ignore */
    }
    setTimeout(() => {
      setVisible(false);
      if (onEnter) onEnter();
    }, 950);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[10000] flex flex-col justify-between overflow-hidden bg-[#12100C] px-6 py-6 sm:px-10 sm:py-8"
          initial={{ clipPath: `circle(150% at ${origin.x}% ${origin.y}%)` }}
          animate={{ clipPath: `circle(150% at ${origin.x}% ${origin.y}%)` }}
          exit={{ clipPath: `circle(0% at ${origin.x}% ${origin.y}%)` }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          onClick={handleEnter}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleEnter(e)}
        >
          <div className="flex items-start justify-between">
            <span className="font-heading text-sm font-extrabold uppercase tracking-[0.35em] text-[#D4C6A8]">
              Lakulish Meena
            </span>
            <span className="hidden font-body text-[11px] uppercase tracking-[0.25em] text-[#8C8573] sm:block">
              Web design
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="font-heading text-[22vw] font-extrabold leading-none tracking-tighter text-[#D4C6A8] sm:text-[14vw]">
              {String(count).padStart(3, "0")}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <span className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.25em] text-[#8C8573]">
              <motion.span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--online)" }}
                animate={{ opacity: [1, 0.15, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
              />
              Online
            </span>

            {count >= 100 && (
              <motion.span
                className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-[#D4C6A8]"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                Tap to enter
              </motion.span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}