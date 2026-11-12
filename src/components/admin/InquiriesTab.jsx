import React, { useEffect, useMemo, useState } from "react";
import { adminCall } from "@/lib/adminApi";
import { Download, Trash2, ChevronDown, Search } from "lucide-react";

const STATUSES = ["New", "Contacted", "Quote sent", "Won", "Not a fit"];
const PRIORITIES = ["Low", "Normal", "High"];

const card = "rounded-2xl border p-5";
const borderStyle = { borderColor: "rgba(212,198,168,0.12)" };
const inputCls = "h-11 rounded-xl bg-white/[0.03] px-3 font-body text-sm text-[#D4C6A8] outline-none placeholder:text-[#8C8573]/60";
const inputStyle = { border: "1px solid rgba(212,198,168,0.18)" };

export default function InquiriesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await adminCall("list", { entity: "Inquiry", sort: "-created_date", limit: 500 });
    setItems((data && data.records) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const okStatus = status === "All" || i.status === status;
        const t = q.toLowerCase();
        const okQ =
          !t ||
          [i.name, i.email, i.message, i.country, i.business_type, i.budget_range]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(t));
        return okStatus && okQ;
      }),
    [items, q, status]
  );

  const update = async (id, data) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...data } : i)));
    await adminCall("update", { entity: "Inquiry", id, data });
  };

  const exportCsv = async () => {
    const data = await adminCall("exportInquiries");
    const blob = new Blob([data.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inquiries.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteSamples = async () => {
    if (!window.confirm("Delete all sample inquiries?")) return;
    await adminCall("deleteSamples");
    load();
  };

  const sampleCount = items.filter((i) => i.is_sample).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8573]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, message…" className={`${inputCls} w-full pl-9`} style={inputStyle} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} style={inputStyle}>
          <option value="All" className="bg-[#17140F]">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="bg-[#17140F]">{s}</option>)}
        </select>
        <button onClick={exportCsv} className="flex h-11 items-center gap-2 rounded-full px-4 font-body text-[13px] text-[#12100C]" style={{ background: "var(--cream)" }}>
          <Download className="h-4 w-4" /> CSV
        </button>
        {sampleCount > 0 && (
          <button onClick={deleteSamples} className="flex h-11 items-center gap-2 rounded-full border px-4 font-body text-[13px] text-[#8C8573]" style={inputStyle}>
            <Trash2 className="h-4 w-4" /> Delete samples ({sampleCount})
          </button>
        )}
      </div>

      {loading ? (
        <p className="font-body text-sm text-[#8C8573]">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="font-body text-sm text-[#8C8573]">No inquiries match.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((i) => {
            const isOpen = open === i.id;
            return (
              <div key={i.id} className={card} style={borderStyle}>
                <button onClick={() => setOpen(isOpen ? null : i.id)} className="flex w-full items-start justify-between gap-4 text-left">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-base font-bold text-[#D4C6A8]">{i.name}</span>
                      {i.is_sample && <span className="rounded-full px-2 py-0.5 font-body text-[10px] uppercase tracking-wide" style={{ background: "rgba(212,198,168,0.14)" }}>Sample</span>}
                      <span className="rounded-full px-2 py-0.5 font-body text-[10px] uppercase tracking-wide" style={{ background: "rgba(80,200,120,0.14)", color: "#8fe0a8" }}>{i.status}</span>
                      <span className="font-body text-[11px] uppercase tracking-wide text-[#8C8573]">{i.priority}</span>
                    </div>
                    <p className="mt-1 truncate font-body text-sm text-[#8C8573]">{i.email} · {i.country || "—"} · {i.business_type || "—"}</p>
                    {!isOpen && <p className="mt-2 line-clamp-1 font-body text-sm text-[#8C8573]/80">{i.message}</p>}
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[#8C8573] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="mt-5 flex flex-col gap-4 border-t pt-5" style={borderStyle}>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div><p className="font-body text-[11px] uppercase tracking-wide text-[#8C8573]">Budget</p><p className="font-body text-sm text-[#D4C6A8]">{i.budget_range || "—"}</p></div>
                      <div><p className="font-body text-[11px] uppercase tracking-wide text-[#8C8573]">Received</p><p className="font-body text-sm text-[#D4C6A8]">{i.created_date ? new Date(i.created_date).toLocaleString() : "—"}</p></div>
                    </div>

                    <div>
                      <p className="font-body text-[11px] uppercase tracking-wide text-[#8C8573]">Message</p>
                      <p className="mt-1 whitespace-pre-wrap font-body text-sm leading-relaxed text-[#D4C6A8]">{i.message}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-body text-[11px] uppercase tracking-wide text-[#8C8573]">Status</span>
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => update(i.id, { status: s })}
                          className="rounded-full px-3 py-1.5 font-body text-[12px]"
                          style={i.status === s ? { background: "var(--cream)", color: "#12100C" } : { border: "1px solid rgba(212,198,168,0.18)", color: "#8C8573" }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-body text-[11px] uppercase tracking-wide text-[#8C8573]">Priority</span>
                      {PRIORITIES.map((p) => (
                        <button
                          key={p}
                          onClick={() => update(i.id, { priority: p })}
                          className="rounded-full px-3 py-1.5 font-body text-[12px]"
                          style={i.priority === p ? { background: "var(--cream)", color: "#12100C" } : { border: "1px solid rgba(212,198,168,0.18)", color: "#8C8573" }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <label className="flex flex-col gap-2">
                      <span className="font-body text-[11px] uppercase tracking-wide text-[#8C8573]">Internal notes</span>
                      <textarea
                        rows={3}
                        defaultValue={i.internal_notes || ""}
                        onBlur={(e) => update(i.id, { internal_notes: e.target.value })}
                        className="w-full rounded-xl bg-white/[0.03] px-3 py-2 font-body text-sm text-[#D4C6A8] outline-none"
                        style={inputStyle}
                      />
                    </label>

                    <div className="flex gap-3">
                      <a href={`mailto:${i.email}`} className="rounded-full px-4 py-2 font-body text-[13px] text-[#12100C]" style={{ background: "var(--cream)" }}>Reply by email</a>
                      <button
                        onClick={async () => {
                          if (!window.confirm("Delete this inquiry?")) return;
                          await adminCall("delete", { entity: "Inquiry", id: i.id });
                          load();
                        }}
                        className="rounded-full border px-4 py-2 font-body text-[13px] text-[#8C8573]"
                        style={inputStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}