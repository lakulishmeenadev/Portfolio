import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowDown, Copy, Check } from "lucide-react";

function MaskLine({ text, delay = 0, className, style }) {
  return (
    <motion.span className={`block overflow-hidden ${className || ""}`} style={style}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block will-change-transform"
          initial={{ y: "115%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, delay: delay + i * 0.028, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

function GlassBadge({ children, style, innerStyle }) {
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 18, delay: 1.15 }}
      className="pointer-events-none absolute hidden select-none md:block"
    >
      <motion.div
        style={innerStyle}
        className="glass relative overflow-hidden rounded-2xl px-4 py-3 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.9)]"
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: "linear-gradient(135deg, rgba(212,198,168,0.16), rgba(212,198,168,0) 60%)" }}
        />
        <span className="relative font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4C6A8] sm:text-[12px]">
          {children}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function Hero({ settings, projectCount }) {
  const email = settings.contact_email || "lakulishmeena.dev@gmail.com";
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 120, damping: 20 });
  const smy = useSpring(my, { stiffness: 120, damping: 20 });

  const line1x = useTransform(smx, [-0.5, 0.5], [26, -26]);
  const line2x = useTransform(smx, [-0.5, 0.5], [-30, 30]);
  const line3x = useTransform(smx, [-0.5, 0.5], [20, -20]);
  const badgeRotX = useTransform(smy, [-0.5, 0.5], [10, -10]);
  const badgeRotY = useTransform(smx, [-0.5, 0.5], [-12, 12]);

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      /* clipboard unavailable */
    }
  };

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col justify-between px-5 pb-28 pt-6 sm:px-8 sm:pt-8">
      <div className="flex items-start justify-between">
        <span className="font-heading text-[13px] font-extrabold uppercase leading-[1.05] tracking-[0.3em] text-[#D4C6A8]">
          Lakulish Meena
        </span>

        <button
          onClick={copyEmail}
          className="group flex items-center gap-2 rounded-full glass px-4 py-2.5 text-[#D4C6A8] transition-transform hover:scale-[1.03]"
          aria-label="Copy email address"
        >
          <span className="font-body text-[12px] tracking-wide sm:text-[13px]">{email}</span>
          {copied ? <Check className="h-3.5 w-3.5" style={{ color: "var(--online)" }} /> : <Copy className="h-3.5 w-3.5 opacity-60" />}
        </button>
      </div>

      <div ref={wrapRef} onMouseMove={onMove} className="relative my-10">
        <h1 className="relative font-heading text-[15vw] font-extrabold uppercase leading-[0.86] tracking-tight text-[#D4C6A8] sm:text-[11vw] lg:text-[8.6vw]">
          <MaskLine text="Websites that" delay={0.15} style={{ x: line1x }} />
          <MaskLine text="get you" delay={0.4} style={{ x: line2x }} />
          <span className="flex flex-wrap items-end gap-x-5">
            <MaskLine text="customers" delay={0.62} style={{ x: line3x }} />
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="mb-[1.5vw] flex h-[7vw] w-[7vw] max-h-16 max-w-16 items-center justify-center rounded-full border"
              style={{ borderColor: "rgba(212,198,168,0.3)" }}
            >
              <motion.span animate={{ y: [0, 7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
                <ArrowDown className="h-5 w-5 text-[#D4C6A8]" />
              </motion.span>
            </motion.span>
          </span>
        </h1>

        <GlassBadge
          style={{ right: "2%", top: "30%" }}
          innerStyle={{ rotateX: badgeRotX, rotateY: badgeRotY, transformStyle: "preserve-3d" }}
        >
          48 hrs first mockup
        </GlassBadge>
        <GlassBadge
          style={{ right: "8%", bottom: "4%" }}
          innerStyle={{ rotateX: badgeRotX, rotateY: badgeRotY, transformStyle: "preserve-3d" }}
        >
          +2 years experience
        </GlassBadge>
      </div>

      <div className="flex flex-col gap-6">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.7 }}
          className="max-w-2xl font-body text-base leading-relaxed text-[#8C8573] sm:text-lg"
        >
          {settings.hero_text}
        </motion.p>

        <div className="flex items-end justify-between">
          <span className="font-body text-[12px] uppercase tracking-[0.28em] text-[#8C8573]">
            Sharp details. Fast delivery.
          </span>
          <div className="flex items-center gap-3">
            <span className="font-body text-[12px] uppercase tracking-[0.28em] text-[#8C8573]">Scroll</span>
            <span className="relative block h-[1px] w-16 overflow-hidden" style={{ background: "rgba(212,198,168,0.2)" }}>
              <motion.span
                className="absolute inset-y-0 left-0 block w-1/2"
                style={{ background: "var(--cream)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}