import { useEffect } from "react";

// Lightweight inertial wheel scrolling.
// It smooths wheel input against the REAL window scroll (never a transform wrapper),
// so sticky/pinned sections keep working correctly.
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    let target = window.scrollY;
    let current = window.scrollY;
    let rafId = null;
    let animating = false;

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const loop = () => {
      current += (target - current) * 0.115;
      if (Math.abs(target - current) < 0.4) {
        current = target;
        window.scrollTo(0, current);
        animating = false;
        rafId = null;
        return;
      }
      window.scrollTo(0, current);
      rafId = requestAnimationFrame(loop);
    };

    const onWheel = (e) => {
      if (e.ctrlKey) return; // allow pinch-zoom
      // Let overlays / inner scrollers handle their own scrolling.
      if (document.body.dataset.scrollLock === "true") return;
      const scroller = e.target.closest && e.target.closest("[data-native-scroll]");
      if (scroller) return;
      if (e.deltaMode === 1) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      if (!animating) {
        target = window.scrollY;
        current = window.scrollY;
      }
      target = Math.max(0, Math.min(target + e.deltaY, maxScroll()));
      if (!animating) {
        animating = true;
        rafId = requestAnimationFrame(loop);
      }
    };

    // Keep target synced when the page is scrolled by other means (scrollbar, keyboard, anchors).
    const onScroll = () => {
      if (!animating) {
        target = window.scrollY;
        current = window.scrollY;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}