import React, { useEffect, useState } from "react";
import { Image } from "@/components/ui/image";
import { adminCall, uploadPublicImage } from "@/lib/adminApi";
import { Plus, Trash2, Upload } from "lucide-react";

const card = "rounded-2xl border p-5";
const borderStyle = { borderColor: "rgba(212,198,168,0.12)" };
const inputCls = "h-11 w-full rounded-xl bg-white/[0.03] px-3 font-body text-sm text-[#D4C6A8] outline-none placeholder:text-[#8C8573]/60";
const areaCls = "w-full rounded-xl bg-white/[0.03] px-3 py-2 font-body text-sm text-[#D4C6A8] outline-none";
const inputStyle = { border: "1px solid rgba(212,198,168,0.18)" };
const labelCls = "font-body text-[11px] uppercase tracking-wide text-[#8C8573]";

export default function ContentTab() {
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [f, t, s] = await Promise.all([
      adminCall("list", { entity: "FAQ", sort: "order", limit: 100 }),
      adminCall("list", { entity: "Testimonial", sort: "order", limit: 100 }),
      adminCall("list", { entity: "SiteSetting", limit: 1 }),
    ]);
    setFaqs((f && f.records) || []);
    setTestimonials((t && t.records) || []);
    setSettings(((s && s.records) || [])[0] || null);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const saveFaq = async (id, data) => {
    setFaqs((list) => list.map((x) => (x.id === id ? { ...x, ...data } : x)));
    await adminCall("update", { entity: "FAQ", id, data });
  };
  const saveTestimonial = async (id, data) => {
    setTestimonials((list) => list.map((x) => (x.id === id ? { ...x, ...data } : x)));
    await adminCall("update", { entity: "Testimonial", id, data });
  };
  const saveSettings = async (data) => {
    setSettings((s) => ({ ...s, ...data }));
    await adminCall("update", { entity: "SiteSetting", id: settings.id, data });
  };

  const addFaq = async () => {
    const res = await adminCall("create", { entity: "FAQ", data: { question: "New question", answer: "Answer", order: faqs.length, visible: true } });
    if (res && res.record) setFaqs((l) => [...l, res.record]);
  };
  const addTestimonial = async () => {
    const res = await adminCall("create", { entity: "Testimonial", data: { quote: "New testimonial", author: "Client name", role_business: "", order: testimonials.length, visible: true } });
    if (res && res.record) setTestimonials((l) => [...l, res.record]);
  };

  if (loading) return <p className="font-body text-sm text-[#8C8573]">Loading…</p>;

  return (
    <div className="flex flex-col gap-8">
      {settings && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-extrabold uppercase tracking-tight text-[#D4C6A8]">Site texts</h2>
          <div className={card} style={borderStyle}>
            <div className="grid gap-3">
              <label className="flex flex-col gap-1.5"><span className={labelCls}>Gallery label</span><input defaultValue={settings.gallery_label} onBlur={(e) => saveSettings({ gallery_label: e.target.value })} className={inputCls} style={inputStyle} /></label>
              <label className="flex flex-col gap-1.5"><span className={labelCls}>Hero intro line</span><textarea rows={2} defaultValue={settings.hero_text} onBlur={(e) => saveSettings({ hero_text: e.target.value })} className={areaCls} style={inputStyle} /></label>
              <label className="flex flex-col gap-1.5"><span className={labelCls}>About paragraph</span><textarea rows={3} defaultValue={settings.about_text} onBlur={(e) => saveSettings({ about_text: e.target.value })} className={areaCls} style={inputStyle} /></label>
            </div>
          </div>
        </section>
      )}

      {settings && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-extrabold uppercase tracking-tight text-[#D4C6A8]">About section</h2>
          <div className={card} style={borderStyle}>
            <div className="grid gap-3">
              <label className="flex flex-col gap-1.5"><span className={labelCls}>Statement (the large opening text)</span><textarea rows={3} defaultValue={settings.about_statement} onBlur={(e) => saveSettings({ about_statement: e.target.value })} className={areaCls} style={inputStyle} /></label>
              <label className="flex flex-col gap-1.5"><span className={labelCls}>Skills (comma-separated)</span><textarea rows={2} defaultValue={settings.about_skills} onBlur={(e) => saveSettings({ about_skills: e.target.value })} className={areaCls} style={inputStyle} /></label>
              <label className="flex flex-col gap-1.5"><span className={labelCls}>Paragraph</span><textarea rows={3} defaultValue={settings.about_paragraph} onBlur={(e) => saveSettings({ about_paragraph: e.target.value })} className={areaCls} style={inputStyle} /></label>
              <label className="flex flex-col gap-1.5"><span className={labelCls}>Location line</span><input defaultValue={settings.about_location} onBlur={(e) => saveSettings({ about_location: e.target.value })} className={inputCls} style={inputStyle} /></label>
            </div>

            <div className="mt-5">
              <p className={labelCls}>Portrait</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {settings.portrait_image && (
                  <div className="h-[112px] w-[84px] shrink-0 overflow-hidden rounded-lg" style={inputStyle}>
                    <Image src={settings.portrait_image} alt="" className="h-full w-full" fittingType="fill" />
                  </div>
                )}
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 font-body text-[13px] text-[#8C8573]" style={inputStyle}>
                  <Upload className="h-4 w-4" /> {settings.portrait_image ? "Replace portrait" : "Upload portrait"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      e.target.value = "";
                      if (!file) return;
                      setUploading(true);
                      try {
                        const url = await uploadPublicImage(file);
                        await saveSettings({ portrait_image: url });
                      } catch (err) {
                        window.alert("Upload failed. Please try again.");
                      }
                      setUploading(false);
                    }}
                  />
                </label>
                {settings.portrait_image && (
                  <button onClick={() => saveSettings({ portrait_image: "" })} className="flex h-11 items-center gap-2 rounded-full border px-4 font-body text-[13px] text-[#8C8573]" style={inputStyle}>
                    <Trash2 className="h-4 w-4" /> Remove portrait
                  </button>
                )}
                {uploading && <span className="font-body text-[12px] text-[#8C8573]">Uploading…</span>}
              </div>
              <p className="mt-2 font-body text-[11px] text-[#8C8573]/70">Shown in the About section. Leave empty to use the monogram panel.</p>
            </div>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-extrabold uppercase tracking-tight text-[#D4C6A8]">FAQs</h2>
          <button onClick={addFaq} className="flex h-10 items-center gap-2 rounded-full px-4 font-body text-[13px] text-[#12100C]" style={{ background: "var(--cream)" }}><Plus className="h-4 w-4" /> Add FAQ</button>
        </div>
        {faqs.map((f) => (
          <div key={f.id} className={card} style={borderStyle}>
            <label className="flex flex-col gap-1.5"><span className={labelCls}>Question</span><input defaultValue={f.question} onBlur={(e) => saveFaq(f.id, { question: e.target.value })} className={inputCls} style={inputStyle} /></label>
            <label className="mt-3 flex flex-col gap-1.5"><span className={labelCls}>Answer</span><textarea rows={3} defaultValue={f.answer} onBlur={(e) => saveFaq(f.id, { answer: e.target.value })} className={areaCls} style={inputStyle} /></label>
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 font-body text-sm text-[#8C8573]"><input type="checkbox" checked={f.visible !== false} onChange={(e) => saveFaq(f.id, { visible: e.target.checked })} /> Visible</label>
              <button onClick={async () => { await adminCall("delete", { entity: "FAQ", id: f.id }); setFaqs((l) => l.filter((x) => x.id !== f.id)); }} className="flex items-center gap-2 rounded-full border px-4 py-2 font-body text-[13px] text-[#8C8573]" style={inputStyle}><Trash2 className="h-4 w-4" /> Delete</button>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-extrabold uppercase tracking-tight text-[#D4C6A8]">Testimonials</h2>
          <button onClick={addTestimonial} className="flex h-10 items-center gap-2 rounded-full px-4 font-body text-[13px] text-[#12100C]" style={{ background: "var(--cream)" }}><Plus className="h-4 w-4" /> Add testimonial</button>
        </div>
        <p className="font-body text-[13px] text-[#8C8573]">The "What clients say" section stays hidden until at least one visible testimonial is added.</p>
        {testimonials.map((t) => (
          <div key={t.id} className={card} style={borderStyle}>
            <label className="flex flex-col gap-1.5"><span className={labelCls}>Quote</span><textarea rows={3} defaultValue={t.quote} onBlur={(e) => saveTestimonial(t.id, { quote: e.target.value })} className={areaCls} style={inputStyle} /></label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5"><span className={labelCls}>Author</span><input defaultValue={t.author} onBlur={(e) => saveTestimonial(t.id, { author: e.target.value })} className={inputCls} style={inputStyle} /></label>
              <label className="flex flex-col gap-1.5"><span className={labelCls}>Business / role</span><input defaultValue={t.role_business} onBlur={(e) => saveTestimonial(t.id, { role_business: e.target.value })} className={inputCls} style={inputStyle} /></label>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 font-body text-sm text-[#8C8573]"><input type="checkbox" checked={t.visible !== false} onChange={(e) => saveTestimonial(t.id, { visible: e.target.checked })} /> Visible</label>
              <button onClick={async () => { await adminCall("delete", { entity: "Testimonial", id: t.id }); setTestimonials((l) => l.filter((x) => x.id !== t.id)); }} className="flex items-center gap-2 rounded-full border px-4 py-2 font-body text-[13px] text-[#8C8573]" style={inputStyle}><Trash2 className="h-4 w-4" /> Delete</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}