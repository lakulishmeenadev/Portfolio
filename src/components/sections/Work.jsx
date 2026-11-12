import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import ProjectThumb from "@/components/site/ProjectThumb";
import { track } from "@/lib/track";

const CATEGORIES = ["All", "Travel", "Hotel", "Beauty", "Health", "Other"];
const CORE = ["Travel", "Hotel", "Beauty", "Health"];

const matches = (p, cat) => {
  if (cat === "All") return true;
  if (cat === "Other") return !CORE.includes(p.type);
  return p.type === cat;
};

function useIsMobile() {
  const [m, setM] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const fn = () => setM(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return m;
}

function PanelMeta({ project }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-5">
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-extrabold uppercase tracking-tight text-[#D4C6A8] sm:text-2xl">
            {project.display_name}
          </p>
          <p className="font-body text-[11px] uppercase tracking-[0.22em] text-[#8C8573]">
            {project.type} {project.year ? `· ${project.year}` : ""}
          </p>
        </div>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              track("visit_site");
            }}
            aria-label={`${project.display_name} — open live site`}
            className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110"
            style={{ background: "var(--cream)", color: "#12100C" }}
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </>
  );
}

function CurvedGallery({ projects, onOpenProject, onActiveChange }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const panelRefs = useRef([]);
  const activeRef = useRef(0);
  const velocityRef = useRef(0);
  const dragRef = useRef(null);
  const movedRef = useRef(0);

  const count = projects.length;

  useEffect(() => {
    activeRef.current = 0;
  }, [count]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;
    let prev = 0;

    const update = () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (section && stage && count > 1) {
        const rect = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
        const raw = p * (count - 1);
        activeRef.current += (raw - activeRef.current) * (reduced ? 1 : 0.085);

        const active = activeRef.current;
        velocityRef.current = active - prev;
        prev = active;

        const stageWidth = stage.clientWidth;
        const spacing = Math.min(stageWidth * 0.52, 760);

        panelRefs.current.forEach((el, i) => {
          if (!el) return;
          const offset = i - active;
          const abs = Math.abs(offset);
          const x = offset * spacing;
          const z = -abs * 280;
          const ry = -offset * 27;
          const sc = Math.max(0.58, 1 - abs * 0.13);
          const op = Math.max(0.12, 1 - abs * 0.34);
          el.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${ry}deg) scale(${sc})`;
          el.style.opacity = String(op);
          el.style.zIndex = String(200 - Math.round(abs * 10));
          el.style.filter = `brightness(${Math.max(0.35, 1 - abs * 0.42)})`;
        });

        if (stage) {
          const blur = Math.min(Math.abs(velocityRef.current) * 9, 5);
          stage.style.filter = blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : "none";
        }
        if (onActiveChange) onActiveChange(Math.round(active));
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [count, onActiveChange]);

  const scrollToIndex = (i) => {
    const el = sectionRef.current;
    if (!el || count < 2) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (i / (count - 1)) * total, behavior: "smooth" });
  };

  // keyboard arrows while the gallery is on screen
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.5 || r.bottom < window.innerHeight * 0.5) return;
      const idx = Math.round(activeRef.current) + (e.key === "ArrowRight" ? 1 : -1);
      if (idx >= 0 && idx < count) {
        e.preventDefault();
        scrollToIndex(idx);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  const onPointerDown = (e) => {
    if (e.pointerType === "touch") return;
    dragRef.current = { x: e.clientX, y: window.scrollY };
    movedRef.current = 0;
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    movedRef.current = Math.max(movedRef.current, Math.abs(dx));
    window.scrollTo(0, dragRef.current.y - dx * 2.6);
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const handlePanelClick = (i, e) => {
    if (movedRef.current > 8) return;
    const abs = Math.abs(i - activeRef.current);
    if (abs < 0.5) {
      track("project_open");
      onOpenProject(projects[i], e.currentTarget);
    } else {
      scrollToIndex(i);
    }
  };

  const height = `${count * 62 + 100}vh`;

  return (
    <div ref={sectionRef} className="relative" style={{ height }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* faint perspective grid floor */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 overflow-hidden" style={{ perspective: "600px" }}>
          <div
            className="absolute inset-x-[-50%] bottom-[-20%] top-0"
            style={{
              transform: "rotateX(70deg)",
              transformOrigin: "bottom",
              backgroundImage:
                "linear-gradient(rgba(212,198,168,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(212,198,168,0.10) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              maskImage: "linear-gradient(to top, black, transparent 70%)",
              WebkitMaskImage: "linear-gradient(to top, black, transparent 70%)",
            }}
          />
        </div>

        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          className="relative h-full w-full cursor-grab active:cursor-grabbing"
          style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
        >
          {projects.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => (panelRefs.current[i] = el)}
              onClick={(e) => handlePanelClick(i, e)}
              data-cursor="view"
              className="group absolute left-1/2 top-1/2 w-[62vw] max-w-[820px] will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              <ProjectThumb project={p} index={i} className="shadow-[0_50px_140px_-50px_rgba(0,0,0,0.95)]" />
              <PanelMeta project={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileCarousel({ projects, onOpenProject }) {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-8 no-scrollbar" data-native-scroll>
      {projects.map((p, i) => (
        <div
          key={p.id}
          className="group relative w-[80vw] shrink-0 snap-center"
          style={{ transform: i % 2 ? "rotate(1.4deg)" : "rotate(-1.4deg)" }}
          onClick={(e) => {
            track("project_open");
            onOpenProject(p, e.currentTarget);
          }}
        >
          <ProjectThumb project={p} index={i} />
          <PanelMeta project={p} />
        </div>
      ))}
    </div>
  );
}

function FullList({ projects, onOpenProject }) {
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div className="relative px-5 pb-16 sm:px-8" onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      <div className="mx-auto max-w-6xl border-t" style={{ borderColor: "rgba(212,198,168,0.15)" }}>
        {projects.map((p, i) => (
          <div
            key={p.id}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={(e) => {
              track("project_open");
              onOpenProject(p, e.currentTarget);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                track("project_open");
                onOpenProject(p, e.currentTarget);
              }
            }}
            className="group flex w-full cursor-pointer items-center gap-4 border-b py-5 text-left transition-colors sm:py-7"
            style={{ borderColor: "rgba(212,198,168,0.15)" }}
          >
            <span className="w-10 shrink-0 font-body text-[12px] tracking-widest text-[#8C8573]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 font-heading text-[7vw] font-extrabold uppercase leading-none tracking-tight text-[#8C8573] transition-colors duration-300 group-hover:text-[#D4C6A8] sm:text-[3.4vw]">
              {p.display_name}
            </span>
            <span className="hidden w-32 font-body text-[12px] uppercase tracking-[0.2em] text-[#8C8573] sm:block">
              {p.type}
            </span>
            <span className="hidden w-16 font-body text-[12px] tracking-widest text-[#8C8573] sm:block">{p.year}</span>
            {p.url ? (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  track("visit_site");
                }}
                aria-label={`${p.display_name} — open live site`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#8C8573] transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:text-[#D4C6A8]"
                style={{ border: "1px solid rgba(212,198,168,0.2)" }}
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : (
              <span className="h-10 w-10 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* cursor-following preview */}
      <AnimatePresence>
        {hover !== null && (
          <motion.div
            className="pointer-events-none fixed z-[9994] hidden w-[320px] -translate-x-1/2 -translate-y-1/2 lg:block"
            style={{ left: pos.x, top: pos.y }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <ProjectThumb project={projects[hover]} index={hover} className="shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Work({ projects, onOpenProject, label, view: viewProp, onViewChange }) {
  const [internalView, setInternalView] = useState("featured");
  const view = viewProp !== undefined ? viewProp : internalView;
  const setView = onViewChange || setInternalView;
  const [cat, setCat] = useState("All");
  const [activeIdx, setActiveIdx] = useState(0);
  const isMobile = useIsMobile();

  const filtered = useMemo(() => projects.filter((p) => matches(p, cat)), [projects, cat]);

  const onActiveChange = React.useCallback((i) => setActiveIdx(i), []);

  const changeCat = (c) => {
    setCat(c);
    if (view === "featured") {
      const el = document.getElementById("work");
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
    }
  };

  return (
    <section id="work" className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-3 px-5 pt-24 sm:px-8 sm:pt-28">
        <div className="pointer-events-auto flex items-center justify-between gap-4">
          <span className="font-body text-[12px] uppercase tracking-[0.3em] text-[#8C8573]">
            {label || "Test gallery"}
          </span>
          {view === "featured" && !isMobile && filtered.length > 0 && (
            <span className="font-heading text-[13px] font-bold tracking-widest text-[#D4C6A8]">
              {String(Math.min(activeIdx + 1, filtered.length)).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
            </span>
          )}
        </div>
        <div className="pointer-events-auto flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => changeCat(c)}
              className="rounded-full px-3.5 py-2 font-body text-[12px] tracking-wide transition-colors"
              style={
                cat === c
                  ? { background: "var(--cream)", color: "#12100C" }
                  : { border: "1px solid rgba(212,198,168,0.18)", color: "#8C8573" }
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {view === "featured" ? (
        isMobile ? (
          <div className="pt-44">
            <MobileCarousel projects={filtered} onOpenProject={onOpenProject} />
          </div>
        ) : (
          <CurvedGallery projects={filtered} onOpenProject={onOpenProject} onActiveChange={onActiveChange} />
        )
      ) : (
        <div className="pt-44">
          <FullList projects={filtered} onOpenProject={onOpenProject} />
        </div>
      )}

      {/* Featured / Full toggle */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-5 pb-28 sm:px-8 sm:pb-10">
        <div className="pointer-events-auto glass flex rounded-full p-1">
          {["featured", "full"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="rounded-full px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.18em] transition-colors"
              style={view === v ? { background: "var(--cream)", color: "#12100C" } : { color: "#8C8573" }}
            >
              {v === "featured" ? "Featured" : "Full"}
            </button>
          ))}
        </div>
        {view === "full" && (
          <span className="pointer-events-auto font-body text-[12px] uppercase tracking-[0.3em] text-[#8C8573]">
            {String(filtered.length).padStart(2, "0")} projects
          </span>
        )}
      </div>
    </section>
  );
}