import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { Image } from "@/components/ui/image";
import { dominantColor } from "@/lib/dominantColor";

const DEFAULT_ACCENT = "#8C8573";

function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "").trim();
  if (h.length !== 6) return null;
  const n = Number.parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(c) {
  const h = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

// A dark version of the project colour fading to near-black, plus a brighter
// glow on one side.
function buildTint(hex) {
  const c = hexToRgb(hex) || hexToRgb(DEFAULT_ACCENT);
  const lift = (v) => Math.min(255, Math.round(v + 52));
  const dim = (v) => Math.round(v * 0.5);
  return {
    glow: `rgba(${lift(c.r)}, ${lift(c.g)}, ${lift(c.b)}, 0.5)`,
    mid: `rgba(${dim(c.r)}, ${dim(c.g)}, ${dim(c.b)}, 0.9)`,
  };
}

// One large rounded panel tinted to the project, holding the single site
// screenshot inside a 16:10 window.
export default function ProjectPanel({ project, scrollRef }) {
  const frameRef = useRef(null);
  const [accent, setAccent] = useState(project.accentColor || DEFAULT_ACCENT);
  const [dims, setDims] = useState(null);
  const [mode, setMode] = useState("cover");

  const y = useMotionValue(0);
  const maxRef = useRef(0);
  const scrubRef = useRef(0);
  const holding = useRef(false);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 160, damping: 20 });
  const sry = useSpring(ry, { stiffness: 160, damping: 20 });

  // accent colour: admin override, otherwise read off the screenshot itself
  useEffect(() => {
    if (project.accentColor) {
      setAccent(project.accentColor);
      return undefined;
    }
    let alive = true;
    setAccent(DEFAULT_ACCENT);
    dominantColor(project.pageImage).then((c) => {
      if (alive && c) setAccent(rgbToHex(c));
    });
    return () => {
      alive = false;
    };
  }, [project.pageImage, project.accentColor]);

  // natural size of the screenshot
  useEffect(() => {
    if (!project.pageImage) {
      setDims(null);
      return undefined;
    }
    let alive = true;
    const probe = new window.Image();
    probe.onload = () => {
      if (alive && probe.naturalWidth) setDims({ w: probe.naturalWidth, h: probe.naturalHeight });
    };
    probe.src = project.pageImage;
    return () => {
      alive = false;
    };
  }, [project.pageImage]);

  // how far the screenshot can travel inside the 16:10 window
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const measure = () => {
      const fw = el.clientWidth;
      const fh = el.clientHeight;
      if (!dims || !fw || !fh) {
        maxRef.current = 0;
        return;
      }
      const rendered = fw * (dims.h / dims.w);
      if (rendered > fh + 6) {
        maxRef.current = rendered - fh;
        setMode((m) => (m === "scroll" ? m : "scroll"));
      } else {
        maxRef.current = 0;
        setMode((m) => (m === "cover" ? m : "cover"));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dims]);

  useEffect(() => {
    y.set(0);
    scrubRef.current = 0;
    holding.current = false;
    rx.set(0);
    ry.set(0);
  }, [project.id, y, rx, ry]);

  // taller screenshots are scrubbed to the page scroll
  const { scrollYProgress } = useScroll({
    target: frameRef,
    container: scrollRef,
    offset: ["start end", "end start"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const p = Math.max(0, Math.min(1, (v - 0.25) / 0.6));
    scrubRef.current = -p * maxRef.current;
    if (!holding.current) y.set(scrubRef.current);
  });

  const startScroll = () => {
    if (maxRef.current < 8) return;
    holding.current = true;
    animate(y, -maxRef.current, { duration: 6, ease: "linear" });
  };
  const stopScroll = () => {
    if (!holding.current) return;
    holding.current = false;
    animate(y, scrubRef.current, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
  };

  const onTilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 9);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 9);
  };
  const endTilt = () => {
    rx.set(0);
    ry.set(0);
  };

  const tint = buildTint(accent);
  const host = project.url ? project.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-14 overflow-hidden rounded-[28px] px-5 py-14 sm:px-10 sm:py-20"
      style={{
        border: "1px solid rgba(212,198,168,0.10)",
        background: `radial-gradient(85% 70% at 76% 12%, ${tint.glow} 0%, rgba(0,0,0,0) 58%), radial-gradient(120% 120% at 26% 104%, ${tint.mid} 0%, rgba(0,0,0,0) 74%), #0A0906`,
      }}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 block h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: tint.glow, filter: "blur(90px)" }}
        animate={{ x: ["-16%", "14%", "-16%"], y: ["-12%", "10%", "-12%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex justify-center" style={{ perspective: 1200 }}>
        <motion.div
          style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
          onPointerMove={onTilt}
          onPointerLeave={endTilt}
          className="w-[88%] sm:w-[74%] lg:w-[66%]"
        >
          <div
            ref={frameRef}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") startScroll();
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") stopScroll();
            }}
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse") startScroll();
            }}
            onPointerUp={stopScroll}
            onPointerCancel={stopScroll}
            className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl"
            style={{
              border: "1px solid rgba(212,198,168,0.18)",
              background: "#0E0C09",
              boxShadow: "0 40px 110px -40px rgba(0,0,0,0.95)",
            }}
          >
            {project.pageImage && dims ? (
              mode === "scroll" ? (
                <motion.div style={{ y }} className="absolute inset-x-0 top-0">
                  <Image
                    src={project.pageImage}
                    alt={`${project.display_name} homepage`}
                    fittingType="fit"
                    originWidth={dims.w}
                    originHeight={dims.h}
                    className="w-full object-cover object-top"
                  />
                </motion.div>
              ) : (
                <Image
                  src={project.pageImage}
                  alt={`${project.display_name} homepage`}
                  fittingType="fill"
                  focalPointX={0.5}
                  focalPointY={0}
                  className="h-full w-full object-cover object-top"
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center px-6 text-center">
                <div>
                  <p className="font-heading text-[8vw] font-extrabold uppercase leading-[0.95] tracking-tight text-[#D4C6A8] sm:text-[3.4vw]">
                    {project.display_name}
                  </p>
                  {host && (
                    <p className="mt-4 font-body text-[10px] uppercase tracking-[0.32em] text-[#8C8573]">{host}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}