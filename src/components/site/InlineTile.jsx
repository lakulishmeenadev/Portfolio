import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Image } from "@/components/ui/image";

// A tiny inline "emoji" tile inside the sentence: a project screenshot or a
// gradient mini-wireframe. Springs in when its word fills, tilts to the cursor.
export default function InlineTile({ project, variant = 0, active = false }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 260, damping: 20 });
  const sry = useSpring(ry, { stiffness: 260, damping: 20 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 34);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 34);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const isLink = Boolean(project && project.url);
  const Tag = isLink ? "a" : "span";
  const linkProps = isLink
    ? { href: project.url, target: "_blank", rel: "noopener noreferrer", "aria-label": `${project.display_name} — open live site` }
    : {};

  return (
    <motion.span
      className="mx-[0.16em] inline-block align-middle"
      style={{ perspective: 400 }}
      initial={false}
      animate={active ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.45, opacity: 0, y: 5 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
    >
      <motion.span className="block" style={{ rotateX: srx, rotateY: sry }}>
        <Tag
          {...linkProps}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="block h-[0.78em] w-[1.42em] overflow-hidden rounded-[0.18em]"
          style={{ border: "1px solid rgba(212,198,168,0.28)" }}
        >
          {project && project.cover ? (
            <Image src={project.cover} alt="" fittingType="fill" className="h-full w-full" />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center gap-[0.06em]"
              style={{ background: "linear-gradient(135deg, rgba(212,198,168,0.42), rgba(140,133,115,0.14))" }}
            >
              <span className="h-[0.2em] w-[0.2em] rounded-[0.04em]" style={{ background: "rgba(18,16,12,0.45)" }} />
              <span className="h-[0.2em] w-[0.2em] rounded-[0.04em]" style={{ background: "rgba(212,198,168,0.5)" }} />
            </span>
          )}
        </Tag>
      </motion.span>
    </motion.span>
  );
}