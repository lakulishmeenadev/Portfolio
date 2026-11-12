import React, { useEffect, useState } from "react";
import { adminCall } from "@/lib/adminApi";

const card = "rounded-2xl border p-5";
const borderStyle = { borderColor: "rgba(212,198,168,0.12)" };
const inputCls = "h-11 w-full rounded-xl bg-white/[0.03] px-3 font-body text-sm text-[#D4C6A8] outline-none placeholder:text-[#8C8573]/60";
const inputStyle = { border: "1px solid rgba(212,198,168,0.18)" };
const labelCls = "font-body text-[11px] uppercase tracking-wide text-[#8C8573]";

export default function SettingsTab() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await adminCall("list", { entity: "SiteSetting", limit: 1 });
    setSettings(((res && res.records) || [])[0] || null);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async (data) => {
    setSettings((s) => ({ ...s, ...data }));
    await adminCall("update", { entity: "SiteSetting", id: settings.id, data });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (loading) return <p className="font-body text-sm text-[#8C8573]">Loading…</p>;
  if (!settings) return <p className="font-body text-sm text-[#8C8573]">No settings record found.</p>;

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className={card} style={borderStyle}>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Contact email (shown on the site)</span>
          <input defaultValue={settings.contact_email} onBlur={(e) => save({ contact_email: e.target.value })} className={inputCls} style={inputStyle} />
        </label>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className={labelCls}>Notification email (receives enquiries)</span>
          <input defaultValue={settings.notification_email} onBlur={(e) => save({ notification_email: e.target.value })} className={inputCls} style={inputStyle} />
        </label>
      </div>

      <div className={card} style={borderStyle}>
        <p className={labelCls}>Sections</p>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex items-center gap-3 font-body text-sm text-[#D4C6A8]">
            <input type="checkbox" checked={settings.show_process !== false} onChange={(e) => save({ show_process: e.target.checked })} /> Show Process section
          </label>
          <label className="flex items-center gap-3 font-body text-sm text-[#D4C6A8]">
            <input type="checkbox" checked={settings.show_testimonials !== false} onChange={(e) => save({ show_testimonials: e.target.checked })} /> Allow testimonials block
          </label>
        </div>
      </div>

      {saved && <p className="font-body text-[13px]" style={{ color: "#8fe0a8" }}>Saved.</p>}
    </div>
  );
}