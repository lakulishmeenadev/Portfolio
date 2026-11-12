import { db } from "@/lib/dataClient";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const SiteContext = createContext(null);

export const useSite = () => useContext(SiteContext);

export function SiteProvider({ children }) {
  const [state, setState] = useState({
    projects: [],
    settings: {},
    faqs: [],
    testimonials: [],
    loading: true,
  });

  const load = useCallback(async () => {
    try {
      const [projects, settingsList, faqs, testimonials] = await Promise.all([
        db.entities.Project.list("order", 100),
        db.entities.SiteSetting.list(),
        db.entities.FAQ.list("order", 50),
        db.entities.Testimonial.list("order", 50),
      ]);

      // One image per project now — the page image doubles as the cover on
      // every panel.
      const withImages = projects
        .filter((p) => p.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((p) => ({ ...p, cover: p.pageImage || null }));

      setState({
        projects: withImages,
        settings: settingsList[0] || {},
        faqs: faqs.filter((f) => f.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0)),
        testimonials: testimonials.filter((t) => t.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0)),
        loading: false,
      });
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SiteContext.Provider value={{ ...state, reload: load }}>
      {children}
    </SiteContext.Provider>
  );
}