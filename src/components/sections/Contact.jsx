import { db } from "@/lib/dataClient";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Copy, Check } from "lucide-react";

import ProjectThumb from "@/components/site/ProjectThumb";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia", "Ireland", "Germany", "France", "Spain", "Italy",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland", "Poland", "Portugal",
  "United Arab Emirates", "Saudi Arabia", "Singapore", "Malaysia", "New Zealand", "South Africa", "Brazil", "Mexico",
  "Japan", "South Korea", "China", "Indonesia", "Philippines", "Vietnam", "Thailand", "Turkey", "Israel", "Other",
];
const BUSINESS_TYPES = ["Clinic", "Salon", "Gym", "Store", "Hotel", "Travel", "Restaurant", "Cafe", "Real estate", "Other"];
const BUDGETS = ["Under $200", "$200 – $300", "$300 – $500", "$500 – $1,000", "$1,000+", "Not sure yet"];

// Zone A thumbnails: a loose ring around the headline. Big — 22–26vw on desktop
// (≈300–420px at 1440px) — with the outer ones cropped by the side edges and the
// middle pair tucked in behind the headline. Slight rotations, 16:10 shape.
const DESKTOP_SPOTS = [
  { left: "-6%", top: "2%", w: "26vw", rot: -3.5, depth: 1.2, bob: 14 },
  { right: "-5%", top: "3%", w: "25vw", rot: 2.5, depth: 0.8, bob: 12 },
  { left: "2%", top: "33%", w: "24vw", rot: -2, depth: 1.4, bob: 16 },
  { right: "1%", top: "36%", w: "24vw", rot: 3, depth: 1.0, bob: 13 },
  { left: "-5%", bottom: "3%", w: "23vw", rot: -1.5, depth: 1.3, bob: 15 },
  { right: "-4%", bottom: "4%", w: "22vw", rot: 4, depth: 0.9, bob: 11 },
];

// Under 900px: four thumbs at 45% width, cropped by the side edges.
const MOBILE_SPOTS = [
  { left: "-8%", top: "4%", w: "45%", rot: -3, depth: 0.5, bob: 8 },
  { right: "-8%", top: "13%", w: "45%", rot: 2, depth: 0.5, bob: 8 },
  { left: "-6%", bottom: "6%", w: "45%", rot: 2.5, depth: 0.5, bob: 8 },
  { right: "-6%", bottom: "1%", w: "45%", rot: -2, depth: 0.5, bob: 8 },
];

function FloatingThumb({ project, index, spot, mx, my, onOpen, mobile = false }) {
  const x = useTransform(mx, [-0.5, 0.5], [spot.depth * 16, -spot.depth * 16]);
  const y = useTransform(my, [-0.5, 0.5], [spot.depth * 14, -spot.depth * 14]);

  const pos = { width: spot.w, x, y, rotate: spot.rot };
  if (spot.left) pos.left = spot.left;
  if (spot.right) pos.right = spot.right;
  if (spot.top) pos.top = spot.top;
  if (spot.bottom) pos.bottom = spot.bottom;

  const card = (
    <div className="relative">
      <ProjectThumb
        project={project}
        index={index}
        className={cn("shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]", mobile ? "opacity-50" : "opacity-70")}
      />
      <span
        className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: "var(--cream)", color: "#12100C" }}
      >
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </div>
  );

  return (
    <motion.div
      style={pos}
      className={cn(
        "pointer-events-none absolute z-[1]",
        mobile ? "block min-[900px]:hidden" : "hidden min-[900px]:block"
      )}
    >
      <motion.div
        animate={{ y: [0, index % 2 ? spot.bob : -spot.bob, 0] }}
        transition={{ duration: 9 + index, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-auto relative"
        data-cursor="view"
      >
        {project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.display_name} — open live site`}
            className="block"
            onClick={() => track("visit_site")}
          >
            {card}
          </a>
        ) : (
          <div
            onClick={(e) => {
              track("project_open");
              onOpen(project, e.currentTarget);
            }}
          >
            {card}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-body text-[11px] uppercase tracking-[0.22em] text-[#8C8573]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "h-12 w-full rounded-xl bg-white/[0.03] px-4 font-body text-sm text-[#D4C6A8] outline-none transition-colors placeholder:text-[#8C8573]/60 focus:border-[#D4C6A8]/50";

export default function Contact({ projects, settings, faqs, onOpenProject, onExploreAll }) {
  const email = settings.contact_email || "lakulishmeena.dev@gmail.com";
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 80, damping: 20 });
  const smy = useSpring(my, { stiffness: 80, damping: 20 });

  const [form, setForm] = useState({ name: "", email: "", country: "India", business_type: "Clinic", budget_range: "Not sure yet", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const startedAt = useRef(Date.now());

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await db.functions.invoke("submitInquiry", {
        ...form,
        honeypot,
        elapsed: Date.now() - startedAt.current,
      });
      if (res.data && res.data.ok) {
        setStatus("sent");
      } else {
        setError((res.data && res.data.error) || "Something went wrong.");
        setStatus("error");
      }
    } catch (err) {
      const data = err && err.response && err.response.data;
      if (data && data.error === "rate_limited") {
        setError("You've already sent a few messages. Please try again in an hour.");
      } else {
        setError((data && data.error) || "Something went wrong. You can also email me directly.");
      }
      setStatus("error");
    }
  };

  const talk = () => {
    navigator.clipboard.writeText(email).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    window.location.href = `mailto:${email}`;
  };

  const thumbs = projects.slice(0, 6);
  const mobileThumbs = thumbs.slice(0, 4);

  return (
    <section id="contact" className="relative" onMouseMove={onMove}>
      {/* ZONE A — headline, buttons, location line. Thumbnails live only here. */}
      <div className="relative z-[1] h-[85vh] overflow-hidden min-[900px]:h-screen">
        {mobileThumbs.map((p, i) => (
          <FloatingThumb
            key={`m-${p.id}`}
            project={p}
            index={i}
            spot={MOBILE_SPOTS[i % MOBILE_SPOTS.length]}
            mx={smx}
            my={smy}
            onOpen={onOpenProject}
            mobile
          />
        ))}
        {thumbs.map((p, i) => (
          <FloatingThumb
            key={p.id}
            project={p}
            index={i}
            spot={DESKTOP_SPOTS[i % DESKTOP_SPOTS.length]}
            mx={smx}
            my={smy}
            onOpen={onOpenProject}
          />
        ))}

        {/* soft dark vignette so the headline stays readable over the ring */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background:
              "radial-gradient(ellipse 62% 58% at 50% 50%, rgba(18,16,12,0.94) 0%, rgba(18,16,12,0.82) 42%, rgba(18,16,12,0.35) 68%, rgba(18,16,12,0) 88%)",
          }}
        />

        <div className="relative z-[3] mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-5 text-center sm:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-[12vw] font-extrabold uppercase leading-[0.9] tracking-tight text-[#D4C6A8] sm:text-[6vw]"
          >
            Let's build something together.
          </motion.h2>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={talk}
              className="flex h-12 items-center gap-3 rounded-full pl-1.5 pr-6 transition-transform hover:scale-[1.03]"
              style={{ background: "var(--cream)", color: "#12100C" }}
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#12100C" }}>
                <span className="font-heading text-[14px] font-extrabold text-[#D4C6A8]">L</span>
                <span className="absolute -bottom-0 -right-0 h-2.5 w-2.5 rounded-full border-2" style={{ background: "var(--online)", borderColor: "var(--cream)" }} />
              </span>
              <span className="font-heading text-[13px] font-bold uppercase tracking-wide">Let's talk</span>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 opacity-60" />}
            </button>

            <button
              onClick={onExploreAll}
              className="group flex h-12 items-center gap-2 rounded-full border px-6 font-heading text-[13px] font-bold uppercase tracking-wide text-[#D4C6A8] transition-transform hover:scale-[1.03]"
              style={{ borderColor: "rgba(212,198,168,0.28)" }}
            >
              Explore all projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <p className="mt-4 font-body text-[12px] uppercase tracking-[0.22em] text-[#8C8573]">
            Based in India. Working worldwide.
          </p>
        </div>
      </div>

      {/* ZONE B — form, About and FAQ on a solid background, below Zone A. */}
      <div className="relative z-[3] bg-background px-5 pb-28 pt-24 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div
            className="rounded-3xl p-6 sm:p-9"
            style={{ background: "#17140F", border: "1px solid rgba(212,198,168,0.15)" }}
          >
            {status === "sent" ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(212,198,168,0.16)" }}>
                  <Check className="h-6 w-6 text-[#D4C6A8]" />
                </span>
                <h3 className="mt-6 font-heading text-3xl font-extrabold uppercase tracking-tight text-[#D4C6A8]">Thank you</h3>
                <p className="mt-3 max-w-sm font-body text-base leading-relaxed text-[#8C8573]">
                  Your message is in. I'll reply personally, usually within a day — check your inbox for a confirmation.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name">
                    <input required value={form.name} onChange={set("name")} className={inputClass} style={{ border: "1px solid rgba(212,198,168,0.15)" }} placeholder="Your name" />
                  </Field>
                  <Field label="Email">
                    <input required type="email" value={form.email} onChange={set("email")} className={inputClass} style={{ border: "1px solid rgba(212,198,168,0.15)" }} placeholder="you@business.com" />
                  </Field>
                  <Field label="Country">
                    <select value={form.country} onChange={set("country")} className={inputClass} style={{ border: "1px solid rgba(212,198,168,0.15)" }}>
                      {COUNTRIES.map((c) => <option key={c} value={c} className="bg-[#17140F]">{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Business type">
                    <select value={form.business_type} onChange={set("business_type")} className={inputClass} style={{ border: "1px solid rgba(212,198,168,0.15)" }}>
                      {BUSINESS_TYPES.map((c) => <option key={c} value={c} className="bg-[#17140F]">{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Budget range (USD)">
                    <select value={form.budget_range} onChange={set("budget_range")} className={inputClass} style={{ border: "1px solid rgba(212,198,168,0.15)" }}>
                      {BUDGETS.map((c) => <option key={c} value={c} className="bg-[#17140F]">{c}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Message">
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    className="w-full rounded-xl bg-white/[0.03] px-4 py-3 font-body text-sm text-[#D4C6A8] outline-none transition-colors placeholder:text-[#8C8573]/60 focus:border-[#D4C6A8]/50"
                    style={{ border: "1px solid rgba(212,198,168,0.15)", resize: "vertical" }}
                    placeholder="Tell me about your business and what you need."
                  />
                </Field>

                {/* honeypot — hidden from humans */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="absolute h-0 w-0 opacity-0"
                  style={{ position: "absolute", left: "-9999px" }}
                  aria-hidden="true"
                />

                {error && <p className="font-body text-sm text-[#e0a0a0]">{error}</p>}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex h-12 items-center justify-center gap-2 rounded-full font-heading text-[13px] font-bold uppercase tracking-wide transition-transform hover:scale-[1.02] disabled:opacity-60"
                  style={{ background: "var(--cream)", color: "#12100C" }}
                >
                  {status === "sending" ? "Sending…" : "Send enquiry"}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <p className="font-body text-[11px] leading-relaxed text-[#8C8573]/70">
                  No spam, no sharing. Your details are only used to reply to you.
                </p>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-10">
            <div>
              <p className="font-body text-[12px] uppercase tracking-[0.3em] text-[#8C8573]">About</p>
              <p className="mt-4 font-body text-base leading-relaxed text-[#8C8573]">{settings.about_text}</p>
            </div>

            <div>
              <p className="mb-4 font-body text-[12px] uppercase tracking-[0.3em] text-[#8C8573]">FAQ</p>
              <div className="flex flex-col gap-1">
                {faqs.map((f, i) => (
                  <div key={f.id} className="border-b" style={{ borderColor: "rgba(212,198,168,0.12)" }}>
                    <button
                      onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    >
                      <span className={`font-heading text-base font-bold tracking-tight transition-colors ${activeFaq === i ? "text-[#D4C6A8]" : "text-[#8C8573]"}`}>
                        {f.question}
                      </span>
                      <span className="text-[#D4C6A8]">{activeFaq === i ? "−" : "+"}</span>
                    </button>
                    {activeFaq === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="overflow-hidden pb-4 font-body text-sm leading-relaxed text-[#8C8573]"
                      >
                        {f.answer}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}