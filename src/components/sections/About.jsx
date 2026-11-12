import React, { useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import AboutPortrait from "@/components/site/AboutPortrait";

const DEFAULT_STATEMENT =
  "I build websites and simple dashboards for small businesses that need their site to bring in customers, not just look good.";
const DEFAULT_SKILLS =
  "Website design, Landing pages, Mobile-first layouts, Enquiry and booking forms, Admin dashboards, Redesigns, SEO basics, Site updates";
const DEFAULT_PARAGRAPH =
  "I'm just starting out, so I keep things simple: one clear brief, one round of feedback in a single batch, and a fast first mockup. Every site comes with a working backend you can edit yourself.";
const DEFAULT_LOCATION = "Based in India. Working with clients worldwide.";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function CopyEmail({ email }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 16 });
  const y = useSpring(my, { stiffness: 220, damping: 16 });

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 14);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const copy = () => {
    navigator.clipboard.writeText(email).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={copy}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y, borderColor: "rgba(212,198,168,0.28)" }}
      className="flex h-11 w-fit items-center gap-2 rounded-full border px-5 font-heading text-[12px] font-bold tracking-[0.18em] text-[#D4C6A8]"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 opacity-70" />}
      {copied ? "COPIED" : "COPY EMAIL"}
    </motion.button>
  );
}

export default function About({ settings = {} }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const statement = (settings.about_statement || "").trim() || DEFAULT_STATEMENT;
  const skills = (settings.about_skills || "").trim() || DEFAULT_SKILLS;
  const paragraph = (settings.about_paragraph || "").trim() || DEFAULT_PARAGRAPH;
  const location = (settings.about_location || "").trim() || DEFAULT_LOCATION;
  const email = settings.contact_email || "lakulishmeena.dev@gmail.com";

  const words = statement.split(/\s+/).filter(Boolean);
  const [filled, setFilled] = useState(0);

  // words fill one by one, scrubbed to scroll position
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.7"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    const n = Math.round(Math.max(0, Math.min(1, v)) * words.length);
    setFilled((prev) => (prev === n ? prev : n));
  });

  const shown = reduce ? words.length : filled;

  return (
    <section id="about" ref={ref} className="relative overflow-hidden px-5 py-28 sm:px-8">
      <motion.span
        aria-hidden="true"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-6 top-10 z-20 block h-3.5 w-3.5 lg:left-10 lg:top-16"
        style={{ background: "var(--cream)" }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-16">
          <h2 className="font-heading text-[9.5vw] font-extrabold leading-[1.06] tracking-tight sm:text-[7vw] lg:text-[3vw]">
            {words.map((w, i) => {
              const on = i < shown;
              const current = !reduce && i === shown - 1;
              return (
                <span
                  key={i}
                  className="inline-block transition-colors duration-300"
                  style={{
                    color: on ? "#D4C6A8" : "#5c5749",
                    textShadow: current ? "0 0 26px rgba(212,198,168,0.55)" : "none",
                    marginRight: "0.24em",
                  }}
                >
                  {w}
                </span>
              );
            })}
          </h2>

          <AboutPortrait src={settings.portrait_image} />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-20 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16"
        >
          <motion.div variants={fadeUp}>
            <p className="font-body text-[12px] uppercase tracking-[0.3em] text-[#8C8573]">[ WHAT I DO BEST ]</p>
            <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-[#D4C6A8]">{skills}</p>
          </motion.div>
          <motion.p variants={fadeUp} className="max-w-xl font-body text-sm leading-relaxed text-[#D4C6A8]">
            {paragraph}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="mt-16 h-px w-full origin-left"
          style={{ background: "rgba(212,198,168,0.18)" }}
        />

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-[13px] text-[#8C8573]">{location}</p>
          <CopyEmail email={email} />
        </div>
      </div>
    </section>
  );
}