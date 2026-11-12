import React, { useEffect, useState } from "react";
import { adminCall } from "@/lib/adminApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const LABELS = {
  page_view: "Page views",
  plan_click: "Plan clicks",
  project_open: "Project opens",
  visit_site: "Visit live site",
  form_submit: "Form submissions",
};

export default function AnalyticsTab() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminCall("stats", { days }).then((res) => {
      if (active) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [days]);

  const totals = (data && data.totals) || {};
  const series = (data && data.series) || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="glass flex w-fit rounded-full p-1">
        {[7, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className="rounded-full px-5 py-2 font-heading text-[12px] font-bold uppercase tracking-[0.18em]"
            style={days === d ? { background: "var(--cream)", color: "#12100C" } : { color: "#8C8573" }}
          >
            {d} days
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-body text-sm text-[#8C8573]">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(LABELS).map((k) => (
              <div key={k} className="rounded-2xl border p-5" style={{ borderColor: "rgba(212,198,168,0.12)" }}>
                <p className="font-body text-[11px] uppercase tracking-wide text-[#8C8573]">{LABELS[k]}</p>
                <p className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-[#D4C6A8]">{totals[k] || 0}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(212,198,168,0.12)" }}>
            <p className="mb-4 font-body text-[11px] uppercase tracking-wide text-[#8C8573]">Daily activity</p>
            {series.length === 0 ? (
              <p className="font-body text-sm text-[#8C8573]">No activity recorded in this period yet.</p>
            ) : (
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,198,168,0.08)" />
                    <XAxis dataKey="day" tick={{ fill: "#8C8573", fontSize: 11 }} stroke="rgba(212,198,168,0.2)" />
                    <YAxis tick={{ fill: "#8C8573", fontSize: 11 }} stroke="rgba(212,198,168,0.2)" allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#17140F", border: "1px solid rgba(212,198,168,0.2)", borderRadius: 12, color: "#D4C6A8" }} />
                    <Bar dataKey="page_view" name="Page views" fill="#D4C6A8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="project_open" name="Project opens" fill="#8C8573" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="form_submit" name="Form submissions" fill="#50C878" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <p className="font-body text-[12px] leading-relaxed text-[#8C8573]/70">
            Counts are privacy-friendly: only event types and daily totals are stored — no personal data, no cookies.
          </p>
        </>
      )}
    </div>
  );
}