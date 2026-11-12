import React, { useEffect } from "react";
import { motion } from "framer-motion";
import ProjectInfoRow from "./ProjectInfoRow";
import ProjectPanel from "./ProjectPanel";

const rise = (delay) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

// The single case-study page: name, subtitle, info row, tinted panel, intro.
export default function ProjectCase({ project, scrollRef }) {
  useEffect(() => {
    const el = scrollRef && scrollRef.current;
    if (el) el.scrollTop = 0;
  }, [scrollRef]);

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="font-heading text-[13vw] font-extrabold uppercase leading-[0.95] tracking-tight text-[#D4C6A8] sm:text-[7.5vw] lg:text-[5.2vw]">
        <span className="block overflow-hidden pb-[0.08em]">
          <motion.span
            key={project.id}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {project.display_name}
          </motion.span>
        </span>
      </h2>

      {project.subtitle && (
        <motion.p {...rise(0.22)} className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-[#8C8573]">
          {project.subtitle}
        </motion.p>
      )}

      <motion.div {...rise(0.3)}>
        <ProjectInfoRow project={project} />
      </motion.div>

      <ProjectPanel project={project} scrollRef={scrollRef} />

      {project.intro && (
        <motion.div
          {...rise(0.05)}
          className="mt-20 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-12"
        >
          <p className="font-body text-[11px] uppercase tracking-[0.5em] text-[#8C8573]">Introduction</p>
          <p className="font-body text-base leading-relaxed text-[#D4C6A8]/85">{project.intro}</p>
        </motion.div>
      )}
    </div>
  );
}