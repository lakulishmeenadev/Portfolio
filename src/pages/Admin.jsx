import React, { useState } from "react";

import { Lock } from "lucide-react";
import { setAdminPassword, clearAdminPassword } from "@/lib/adminApi";
import { requireSupabase } from "@/lib/supabase";
import InquiriesTab from "@/components/admin/InquiriesTab";
import ProjectsTab from "@/components/admin/ProjectsTab";
import ContentTab from "@/components/admin/ContentTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import SettingsTab from "@/components/admin/SettingsTab";

const TABS = [
  { id: "inquiries", label: "Inquiries" },
  { id: "projects", label: "Projects" },
  { id: "content", label: "Content" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("inquiries");

  React.useEffect(() => {
    let active = true;
    (async () => {
      const client = requireSupabase();
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;
      const { data } = await client.from("profiles").select("role").eq("id", user.id).single();
      if (active && data?.role === "admin") { setAuthed(true); setAdminPassword(); }
      else if (active) { await client.auth.signOut(); clearAdminPassword(); }
    })().catch(() => {});
    return () => { active = false; };
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      const { data: profile, error: profileError } = await requireSupabase().from("profiles").select("role").eq("id", data.user.id).single();
      if (profileError || profile?.role !== "admin") {
        await requireSupabase().auth.signOut();
        throw new Error("This account is not an administrator.");
      }
      setAdminPassword();
      setAuthed(true);
    } catch (e2) {
      setErr(e2.message || "Unable to sign in.");
    }
    setBusy(false);
  };

  if (!authed) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-[#12100C] px-5">
        <form onSubmit={login} className="glass w-full max-w-sm rounded-3xl p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(212,198,168,0.12)" }}>
            <Lock className="h-5 w-5 text-[#D4C6A8]" />
          </span>
          <h1 className="mt-6 font-heading text-2xl font-extrabold uppercase tracking-tight text-[#D4C6A8]">Admin</h1>
          <p className="mt-2 font-body text-sm text-[#8C8573]">Sign in with your Supabase admin account.</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            autoComplete="username"
            required
            className="mt-6 h-12 w-full rounded-xl bg-white/[0.03] px-4 font-body text-sm text-[#D4C6A8] outline-none placeholder:text-[#8C8573]/60"
            style={{ border: "1px solid rgba(212,198,168,0.18)" }}
          />
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            autoFocus
            className="mt-6 h-12 w-full rounded-xl bg-white/[0.03] px-4 font-body text-sm text-[#D4C6A8] outline-none placeholder:text-[#8C8573]/60"
            style={{ border: "1px solid rgba(212,198,168,0.18)" }}
          />
          {err && <p className="mt-3 font-body text-sm text-[#e0a0a0]">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full font-heading text-[13px] font-bold uppercase tracking-wide disabled:opacity-60"
            style={{ background: "var(--cream)", color: "#12100C" }}
          >
            {busy ? "Checking…" : "Enter"}
          </button>
          <a href="/" className="mt-5 block text-center font-body text-[12px] uppercase tracking-[0.2em] text-[#8C8573] hover:text-[#D4C6A8]">
            Back to site
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#12100C] text-[#D4C6A8]">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b bg-[#12100C]/90 px-5 py-4 backdrop-blur sm:px-8" style={{ borderColor: "rgba(212,198,168,0.12)" }}>
        <div className="flex items-center gap-3">
          <span className="font-heading text-sm font-extrabold uppercase tracking-[0.3em]">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="font-body text-[12px] uppercase tracking-[0.2em] text-[#8C8573] hover:text-[#D4C6A8]">View site</a>
          <button
            onClick={() => {
              clearAdminPassword();
              requireSupabase().auth.signOut();
              setAuthed(false);
              setPw("");
              setEmail("");
            }}
            className="rounded-full border px-4 py-2 font-body text-[12px] uppercase tracking-[0.2em] text-[#8C8573] hover:text-[#D4C6A8]"
            style={{ borderColor: "rgba(212,198,168,0.18)" }}
          >
            Log out
          </button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b px-3 py-2 no-scrollbar sm:px-6" style={{ borderColor: "rgba(212,198,168,0.08)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="shrink-0 rounded-full px-4 py-2 font-body text-[13px] transition-colors"
            style={tab === t.id ? { background: "var(--cream)", color: "#12100C" } : { color: "#8C8573" }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          {tab === "inquiries" && <InquiriesTab />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "content" && <ContentTab />}
          {tab === "analytics" && <AnalyticsTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}