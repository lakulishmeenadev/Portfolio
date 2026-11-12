import React, { useEffect, useRef, useState } from "react";

// Cream square cursor with smooth lag (desktop only).
// Grows over links; becomes a "VIEW" pill over project panels.
export default function CustomCursor() {
  const ref = useRef(null);
  const [mode, setMode] = useState("idle"); // idle | grow | view
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let x = mx;
    let y = my;
    let raf;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onOver = (e) => {
      const el = e.target && e.target.closest ? e.target.closest("[data-cursor]") : null;
      if (el) {
        setMode(el.getAttribute("data-cursor") === "view" ? "view" : "grow");
        return;
      }
      const interactive = e.target && e.target.closest
        ? e.target.closest("a, button, input, textarea, select, [role='button']")
        : null;
      setMode(interactive ? "grow" : "idle");
    };
    const onDown = () => setMode((m) => (m === "idle" ? "press" : m));
    const onUp = () => setMode("idle");

    const loop = () => {
      x += (mx - x) * 0.2;
      y += (my - y) * 0.2;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    loop();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  const size = mode === "view" ? 78 : mode === "grow" ? 46 : mode === "press" ? 12 : 16;

  return (
    <>
      <style>{`@media (pointer: fine){ body, body *{ cursor: none !important; } }`}</style>
      <div
        ref={ref}
        className="pointer-events-none fixed left-0 top-0 z-[9999] flex items-center justify-center rounded-[3px] mix-blend-difference"
        style={{
          width: size,
          height: mode === "view" ? 30 : size,
          background: "var(--cream)",
          borderRadius: mode === "view" ? 999 : 3,
          transition: "width .28s cubic-bezier(.22,1,.36,1), height .28s cubic-bezier(.22,1,.36,1), border-radius .28s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {mode === "view" && (
          <span className="font-heading text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#12100C]">
            View
          </span>
        )}
      </div>
    </>
  );
}