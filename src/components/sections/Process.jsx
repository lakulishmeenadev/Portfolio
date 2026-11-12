import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const STEPS = [
  { n: "1", title: "Discover", l1: "We talk through your business, your customers and what the site needs to do.", l2: "You get a clear scope and a fixed quote before anything starts." },
  { n: "2", title: "Design", l1: "I design a first mockup, usually within 48 hours.", l2: "You see the layout and the feel before a single line is built." },
  { n: "3", title: "Build", l1: "I build it mobile-first, fast and clean.", l2: "Real content, working forms, and an admin dashboard where it helps." },
  { n: "4", title: "Launch and support", l1: "We go live on your domain, tested on real phones.", l2: "Then I stay available for updates and small changes." },
];

function StackCard({ index, children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 18%", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0.55, 1], [1, 0.5]);

  return (
    <div ref={ref} className="relative h-[74vh] sm:h-[70vh]">
      <div className="sticky" style={{ top: `calc(14vh + ${index * 1.1}rem)` }}>
        <motion.div style={{ scale, opacity }} className="mx-auto w-full max-w-4xl">
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function CardShell({ children }) {
  return (
    <div className="glass overflow-hidden rounded-3xl p-7 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.95)] sm:p-10">
      <div className="absolute inset-0 opacity-50" style={{ background: "linear-gradient(140deg, rgba(212,198,168,0.10), transparent 55%)" }} />
      <div className="relative">{children}</div>
    </div>
  );
}

export default function Process({ settings, testimonials }) {
  const showTestimonials = settings.show_testimonials !== false && testimonials && testimonials.length > 0;

  return (
    <section id="process" className="relative px-5 py-28 sm:px-8">
      <div className="pointer-events-none sticky top-0 -mb-[40vh] flex h-[60vh] items-center justify-center overflow-hidden">
        <span className="font-heading text-[26vw] font-extrabold uppercase leading-none tracking-tighter text-[#D4C6A8] opacity-[0.06]">
          Process
        </span>
      </div>

      <div className="relative mx-auto max-w-4xl">
        <p className="mb-10 font-body text-[12px] uppercase tracking-[0.3em] text-[#8C8573]">How it works</p>
        {STEPS.map((s, i) => (
          <StackCard key={s.n} index={i}>
            <CardShell>
              <div className="flex items-start gap-5">
                <span className="font-heading text-[13vw] font-extrabold leading-none tracking-tighter text-[#D4C6A8] opacity-30 sm:text-[5rem]">
                  {s.n}
                </span>
                <div className="pt-2">
                  <h3 className="font-heading text-2xl font-extrabold uppercase tracking-tight text-[#D4C6A8] sm:text-4xl">
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-[#8C8573]">{s.l1}</p>
                  <p className="mt-2 max-w-xl font-body text-base leading-relaxed text-[#8C8573]">{s.l2}</p>
                </div>
              </div>
            </CardShell>
          </StackCard>
        ))}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 rounded-2xl border px-6 py-5 font-body text-base text-[#D4C6A8]"
          style={{ borderColor: "rgba(212,198,168,0.2)" }}
        >
          Send all feedback in one batch for faster results.
        </motion.p>

        {showTestimonials && (
          <div className="mt-32">
            <p className="mb-10 font-body text-[12px] uppercase tracking-[0.3em] text-[#8C8573]">What clients say</p>
            {testimonials.map((t, i) => (
              <StackCard key={t.id} index={i}>
                <CardShell>
                  <p className="font-heading text-xl font-semibold leading-snug text-[#D4C6A8] sm:text-2xl">"{t.quote}"</p>
                  <p className="mt-6 font-body text-sm uppercase tracking-[0.2em] text-[#8C8573]">
                    {t.author}
                    {t.role_business ? ` — ${t.role_business}` : ""}
                  </p>
                </CardShell>
              </StackCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}