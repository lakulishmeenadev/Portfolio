import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import BrowserMock from "./BrowserMock";
import { track } from "@/lib/track";

// Browser-framed project card. Clicking the card opens the project page; the
// circular arrow opens the live site. The screenshot keeps its natural height
// inside a 16:10 window; hovering scrolls it top-to-bottom over ~5s and eases
// back.
export default function StatementCard({ project, index = 0, className, style, onOpen }) {
  const frameRef = useRef(null);
  const innerRef = useRef(null);
  const y = useMotionValue(0);
  const [dims, setDims] = useState(null);
  const cover = project.cover;

  useEffect(() => {
    if (!cover) return undefined;
    let alive = true;
    const probe = new window.Image();
    probe.onload = () => {
      if (alive && probe.naturalWidth) setDims({ w: probe.naturalWidth, h: probe.naturalHeight });
    };
    probe.src = cover;
    return () => {
      alive = false;
    };
  }, [cover]);

  const scrollDown = () => {
    const frameH = frameRef.current ? frameRef.current.clientHeight : 0;
    const innerH = innerRef.current ? innerRef.current.offsetHeight : 0;
    const dist = innerH - frameH;
    if (dist > 8) animate(y, -dist, { duration: 5, ease: "linear" });
  };
  const scrollBack = () => animate(y, 0, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });

  const host = project.url ? project.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : project.display_name;

  const open = (el) => {
    if (onOpen) onOpen(el);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={scrollDown}
      onMouseLeave={scrollBack}
      onFocus={scrollDown}
      onBlur={scrollBack}
      onClick={(e) => open(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(e.currentTarget);
        }
      }}
      aria-label={`${project.display_name} — open project page`}
      className={cn("group block cursor-pointer", className)}
      style={style}
    >
      <div
        className="relative overflow-hidden rounded-2xl transition-transform duration-500 group-hover:-translate-y-1.5"
        style={{
          border: "1px solid rgba(212,198,168,0.2)",
          background: "#17140F",
          boxShadow: "0 50px 120px -50px rgba(0,0,0,0.95)",
        }}
      >
        <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: "rgba(212,198,168,0.12)" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: "rgba(212,198,168,0.22)" }} />
          <span className="h-2 w-2 rounded-full" style={{ background: "rgba(212,198,168,0.16)" }} />
          <span className="h-2 w-2 rounded-full" style={{ background: "rgba(212,198,168,0.12)" }} />
          <span
            className="ml-3 truncate rounded-full px-3 py-1 font-body text-[10px] tracking-wide text-[#8C8573]"
            style={{ background: "rgba(212,198,168,0.06)" }}
          >
            {host}
          </span>
        </div>

        <div ref={frameRef} className="relative aspect-[16/10] w-full overflow-hidden">
          {cover && dims ? (
            <motion.div ref={innerRef} style={{ y }} className="absolute inset-x-0 top-0 flex">
              <Image
                src={cover}
                alt={`${project.display_name} homepage`}
                fittingType="fit"
                originWidth={dims.w}
                originHeight={dims.h}
                className="w-full"
              />
            </motion.div>
          ) : (
            <BrowserMock variant={index} />
          )}
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
            className="absolute right-3 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
            style={{ background: "var(--cream)", color: "#12100C" }}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4 px-1">
        <span className="font-heading text-[13px] font-bold uppercase tracking-wide text-[#D4C6A8]">{project.display_name}</span>
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#8C8573]">{project.type}</span>
      </div>
    </div>
  );
}