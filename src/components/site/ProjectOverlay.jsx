import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import ProjectCase from "./ProjectCase";
import { track } from "@/lib/track";

// Full-screen project page. Expands from the clicked panel and slides between
// projects.
export default function ProjectOverlay({ projects, index, origin, onClose, onNavigate }) {
  const project = projects[index];
  const scrollRef = useRef(null);
  const originRef = useRef(origin);
  const prevIndex = useRef(index);
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef(null);

  useEffect(() => {
    document.body.dataset.scrollLock = "true";
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.dataset.scrollLock = "false";
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNavigate(1);
      else if (e.key === "ArrowLeft") onNavigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNavigate]);

  const dir = index >= prevIndex.current ? 1 : -1;
  useEffect(() => {
    prevIndex.current = index;
  }, [index]);

  if (!project) return null;

  const o = originRef.current;
  const clipFrom = o
    ? `inset(${Math.max(0, o.top)}px ${Math.max(0, window.innerWidth - o.right)}px ${Math.max(0, window.innerHeight - o.bottom)}px ${Math.max(0, o.left)}px round 20px)`
    : "inset(38% 38% 38% 38% round 20px)";

  return (
    <motion.div
      className="fixed inset-0 z-[9995]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-[#0B0A07]/85 backdrop-blur-md" onClick={onClose} />

      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ clipPath: clipFrom, opacity: 0.6 }}
        animate={{ clipPath: "inset(0px 0px 0px 0px round 0px)", opacity: 1 }}
        exit={{ clipPath: clipFrom, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        style={{ background: "#12100C", transform: `translateY(${dragY}px)` }}
      >
        <div
          ref={scrollRef}
          data-native-scroll
          className="h-full overflow-y-auto overscroll-contain px-5 pb-44 pt-24 sm:px-10 sm:pt-28"
          onTouchStart={(e) => {
            dragStart.current = e.touches[0].clientY;
          }}
          onTouchMove={(e) => {
            if (dragStart.current == null) return;
            const el = scrollRef.current;
            if (el && el.scrollTop <= 0) {
              const d = e.touches[0].clientY - dragStart.current;
              if (d > 0) setDragY(d);
            }
          }}
          onTouchEnd={() => {
            if (dragY > 130) onClose();
            else setDragY(0);
            dragStart.current = null;
          }}
        >
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: dir * 70 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProjectCase project={project} scrollRef={scrollRef} />
          </motion.div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close project"
          className="glass absolute right-4 top-4 z-30 flex h-12 w-12 items-center justify-center rounded-full text-[#D4C6A8] transition-transform hover:scale-105 sm:right-6 sm:top-6"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Sticky controls */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-4 sm:p-6">
          <div className="glass pointer-events-auto flex items-center gap-1 rounded-full p-1.5">
            <button
              onClick={() => onNavigate(-1)}
              aria-label="Previous project"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#D4C6A8] transition-colors hover:bg-white/[0.07]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("visit_site")}
                className="flex h-11 items-center gap-2 rounded-full px-5 font-heading text-[12px] font-bold uppercase tracking-wide transition-transform hover:scale-[1.03]"
                style={{ background: "var(--cream)", color: "#12100C" }}
              >
                Visit live site <ArrowUpRight className="h-4 w-4" />
              </a>
            )}

            <button
              onClick={() => onNavigate(1)}
              aria-label="Next project"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#D4C6A8] transition-colors hover:bg-white/[0.07]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}