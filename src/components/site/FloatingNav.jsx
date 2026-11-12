import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LINKS = [
  { id: "work", label: "Projects" },
  { id: "process", label: "Process" },
  { id: "about", label: "About" },
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function FloatingNav() {
  const [shrunk, setShrunk] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["work", "process", "about", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[9990] flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
      <motion.nav
        initial={false}
        animate={{
          paddingLeft: shrunk ? 8 : 14,
          paddingRight: shrunk ? 8 : 14,
          paddingTop: shrunk ? 6 : 10,
          paddingBottom: shrunk ? 6 : 10,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="pointer-events-auto glass flex items-center gap-1 rounded-full shadow-[0_18px_50px_-12px_rgba(0,0,0,0.75)]"
      >
        {LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToId(link.id)}
            className={`rounded-full px-3 py-2 text-[12px] font-medium tracking-wide transition-colors sm:text-[13px] ${
              active === link.id ? "text-[#12100C]" : "text-[#8C8573] hover:text-[#D4C6A8]"
            }`}
            style={active === link.id ? { background: "var(--cream)" } : undefined}
          >
            {link.label}
          </button>
        ))}

        <button
          onClick={() => scrollToId("contact")}
          className="ml-1 flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{ background: "rgba(212,198,168,0.08)", borderColor: "rgba(212,198,168,0.22)" }}
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "var(--cream)" }}>
            <span className="font-heading text-[13px] font-extrabold text-[#12100C]">L</span>
            <span
              className="absolute -bottom-0 -right-0 h-2.5 w-2.5 rounded-full border-2"
              style={{ background: "var(--online)", borderColor: "#12100C" }}
            />
          </span>
          <span className="font-heading text-[13px] font-bold tracking-tight text-[#D4C6A8]">Let's talk</span>
        </button>
      </motion.nav>
    </div>
  );
}