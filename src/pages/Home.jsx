import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SiteProvider, useSite } from "@/lib/siteContext";
import { track } from "@/lib/track";
import Loader from "@/components/site/Loader";
import CustomCursor from "@/components/site/CustomCursor";
import ScrollProgress from "@/components/site/ScrollProgress";
import SmoothScroll from "@/components/site/SmoothScroll";
import FloatingNav from "@/components/site/FloatingNav";
import ProjectOverlay from "@/components/site/ProjectOverlay";
import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import Work from "@/components/sections/Work";
import Process from "@/components/sections/Process";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

function HomeInner() {
  const { projects, settings, faqs, testimonials, loading } = useSite();
  const [overlay, setOverlay] = useState(null);
  const [workView, setWorkView] = useState("featured");

  useEffect(() => {
    if (loading) return;
    try {
      if (sessionStorage.getItem("vantly_pv") === "1") return;
      sessionStorage.setItem("vantly_pv", "1");
    } catch (e) {
      /* ignore */
    }
    track("page_view");
  }, [loading]);

  const openProject = (project, el) => {
    const index = projects.findIndex((p) => p.id === project.id);
    if (index < 0) return;
    let origin = null;
    if (el && el.getBoundingClientRect) {
      const r = el.getBoundingClientRect();
      origin = { top: r.top, right: r.right, bottom: r.bottom, left: r.left };
    }
    setOverlay({ index, origin });
  };

  const navigate = (dir) => {
    setOverlay((o) => {
      if (!o) return o;
      const next = (o.index + dir + projects.length) % projects.length;
      return { index: next, origin: null };
    });
  };

  const exploreAll = () => {
    setWorkView("full");
    setTimeout(() => {
      const el = document.getElementById("work");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <>
      <Loader />
      <CustomCursor />
      <ScrollProgress />
      <SmoothScroll />

      {!loading && (
        <main>
          <Hero settings={settings} projectCount={projects.length} />
          <Statement projects={projects} onOpenProject={openProject} />
          <Work
            projects={projects}
            onOpenProject={openProject}
            label={settings.gallery_label}
            view={workView}
            onViewChange={setWorkView}
          />
          {settings.show_process !== false && (
            <Process settings={settings} testimonials={testimonials} />
          )}
          <About settings={settings} />
          <Contact
            projects={projects}
            settings={settings}
            faqs={faqs}
            onOpenProject={openProject}
            onExploreAll={exploreAll}
          />
          <Footer />
        </main>
      )}

      <FloatingNav />

      <AnimatePresence>
        {overlay && !loading && (
          <ProjectOverlay
            projects={projects}
            index={overlay.index}
            origin={overlay.origin}
            onClose={() => setOverlay(null)}
            onNavigate={navigate}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  return (
    <SiteProvider>
      <HomeInner />
    </SiteProvider>
  );
}