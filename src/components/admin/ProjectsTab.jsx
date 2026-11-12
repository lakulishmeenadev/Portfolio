import React, { useEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { adminCall, uploadPublicImage } from "@/lib/adminApi";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Sparkles, Images } from "lucide-react";

const TYPES = ["Automotive", "Travel", "Beauty", "Hotel", "Beverage", "Music", "Film", "Health", "Other"];
const card = "rounded-2xl border p-5";
const borderStyle = { borderColor: "rgba(212,198,168,0.12)" };
const inputCls = "h-11 w-full rounded-xl bg-white/[0.03] px-3 font-body text-sm text-[#D4C6A8] outline-none placeholder:text-[#8C8573]/60";
const inputStyle = { border: "1px solid rgba(212,198,168,0.18)" };
const labelCls = "font-body text-[11px] uppercase tracking-wide text-[#8C8573]";

const emptyProject = {
  display_name: "",
  type: "Other",
  page_type: "Website",
  url: "",
  year: "2026",
  subtitle: "",
  intro: "",
  client: "",
  services: "",
  accentColor: "",
  pageImage: "",
  featured: true,
  visible: true,
  order: 0,
};

function Badge({ children, warn = false }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 font-body text-[10px] uppercase tracking-wide"
      style={
        warn
          ? { background: "rgba(200,120,80,0.18)", color: "#e0a074", border: "1px solid rgba(224,160,116,0.3)" }
          : { background: "rgba(212,198,168,0.08)", color: "#8C8573", border: "1px solid rgba(212,198,168,0.18)" }
      }
    >
      {children}
    </span>
  );
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);
  const [bulk, setBulk] = useState(null);
  const [introDraft, setIntroDraft] = useState({});
  const [drafting, setDrafting] = useState(null);
  const bulkRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const p = await adminCall("list", { entity: "Project", sort: "order", limit: 100 });
    setProjects((p && p.records) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (id, data) => {
    setProjects((list) => list.map((p) => (p.id === id ? { ...p, ...data } : p)));
    await adminCall("update", { entity: "Project", id, data });
  };

  const addProject = async () => {
    const res = await adminCall("create", {
      entity: "Project",
      data: { ...emptyProject, display_name: "New project", order: projects.length },
    });
    if (res && res.record) {
      setProjects((list) => [...list, res.record]);
      setOpen(res.record.id);
    }
  };

  const removeProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await adminCall("delete", { entity: "Project", id });
    load();
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= projects.length) return;
    const a = projects[index];
    const b = projects[target];
    const next = [...projects];
    next[index] = b;
    next[target] = a;
    setProjects(next);
    await adminCall("update", { entity: "Project", id: a.id, data: { order: target } });
    await adminCall("update", { entity: "Project", id: b.id, data: { order: index } });
  };

  const uploadOne = async (id, file) => {
    if (!file) return;
    setBusy(id);
    try {
      const url = await uploadPublicImage(file);
      await save(id, { pageImage: url });
    } catch (e) {
      window.alert("Upload failed. Please try again.");
    }
    setBusy(null);
  };

  // Bulk upload matches the files to the projects in the order shown below.
  const uploadBulk = async (files) => {
    const list = [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const total = Math.min(list.length, projects.length);
    setBulk({ done: 0, total });
    for (let i = 0; i < total; i += 1) {
      try {
        const url = await uploadPublicImage(list[i]);
        await save(projects[i].id, { pageImage: url });
      } catch (e) {
        /* keep going through the batch */
      }
      setBulk({ done: i + 1, total });
    }
    setBulk(null);
    load();
  };

  const draftIntro = async (p) => {
    setDrafting(p.id);
    try {
      const res = await adminCall("draftIntro", { name: p.display_name, category: p.type, url: p.url });
      if (res && res.intro) setIntroDraft((d) => ({ ...d, [p.id]: res.intro }));
    } catch (e) {
      window.alert("Could not draft an intro. Please try again.");
    }
    setDrafting(null);
  };

  const commitIntro = (p, value) => {
    save(p.id, { intro: value });
    setIntroDraft((d) => {
      const next = { ...d };
      delete next[p.id];
      return next;
    });
  };

  if (loading) return <p className="font-body text-sm text-[#8C8573]">Loading…</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={addProject}
          className="flex h-11 w-fit items-center gap-2 rounded-full px-5 font-body text-[13px] text-[#12100C]"
          style={{ background: "var(--cream)" }}
        >
          <Plus className="h-4 w-4" /> Add project
        </button>
        <button
          onClick={() => bulkRef.current && bulkRef.current.click()}
          className="flex h-11 w-fit items-center gap-2 rounded-full border px-5 font-body text-[13px] text-[#8C8573]"
          style={inputStyle}
        >
          <Images className="h-4 w-4" /> Bulk upload page images
        </button>
        <input
          ref={bulkRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            uploadBulk(e.target.files);
            e.target.value = "";
          }}
        />
        {bulk && (
          <span className="font-body text-[12px] text-[#8C8573]">
            Uploading {bulk.done} / {bulk.total}…
          </span>
        )}
      </div>

      <p className="font-body text-[12px] leading-relaxed text-[#8C8573]">
        Bulk upload matches the files to the projects in the order shown below (files are sorted by name).
      </p>

      {projects.map((p, index) => {
        const isOpen = open === p.id;
        const introValue = introDraft[p.id] !== undefined ? introDraft[p.id] : p.intro || "";
        return (
          <div key={p.id} className={card} style={borderStyle}>
            <div className="flex items-center gap-3">
              <button onClick={() => setOpen(isOpen ? null : p.id)} className="flex flex-1 items-center gap-4 text-left">
                <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg" style={{ border: "1px solid rgba(212,198,168,0.15)" }}>
                  {p.pageImage ? (
                    <Image src={p.pageImage} alt="" className="h-full w-full" fittingType="fill" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-body text-[10px] text-[#8C8573]">No image</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-bold text-[#D4C6A8]">{p.display_name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="font-body text-[12px] text-[#8C8573]">
                      {p.type} · {p.year}
                    </span>
                    {!p.pageImage && <Badge warn>Missing image</Badge>}
                    {p.visible === false && <Badge>Hidden</Badge>}
                    {p.featured && <Badge>Featured</Badge>}
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => move(index, -1)} className="rounded-lg border p-2 text-[#8C8573]" style={inputStyle} aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => move(index, 1)} className="rounded-lg border p-2 text-[#8C8573]" style={inputStyle} aria-label="Move down">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="mt-5 flex flex-col gap-5 border-t pt-5" style={borderStyle}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Name</span>
                    <input defaultValue={p.display_name} onBlur={(e) => save(p.id, { display_name: e.target.value })} className={inputCls} style={inputStyle} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Category</span>
                    <select defaultValue={p.type} onChange={(e) => save(p.id, { type: e.target.value })} className={inputCls} style={inputStyle}>
                      {TYPES.map((t) => (
                        <option key={t} value={t} className="bg-[#17140F]">
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Type</span>
                    <input
                      defaultValue={p.page_type || "Website"}
                      onBlur={(e) => save(p.id, { page_type: e.target.value })}
                      className={inputCls}
                      style={inputStyle}
                      placeholder="Website"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Live URL</span>
                    <input defaultValue={p.url} onBlur={(e) => save(p.id, { url: e.target.value })} className={inputCls} style={inputStyle} placeholder="https://" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Year</span>
                    <input defaultValue={p.year} onBlur={(e) => save(p.id, { year: e.target.value })} className={inputCls} style={inputStyle} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Client (optional)</span>
                    <input defaultValue={p.client} onBlur={(e) => save(p.id, { client: e.target.value })} className={inputCls} style={inputStyle} placeholder="Leave empty to hide" />
                  </label>
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className={labelCls}>Services (optional)</span>
                    <input defaultValue={p.services} onBlur={(e) => save(p.id, { services: e.target.value })} className={inputCls} style={inputStyle} placeholder="Leave empty to hide" />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Subtitle</span>
                  <input defaultValue={p.subtitle} onBlur={(e) => save(p.id, { subtitle: e.target.value })} className={inputCls} style={inputStyle} />
                </label>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className={labelCls}>Introduction</span>
                    <button
                      onClick={() => draftIntro(p)}
                      disabled={drafting === p.id}
                      className="flex h-9 items-center gap-2 rounded-full border px-3.5 font-body text-[12px] text-[#D4C6A8] disabled:opacity-50"
                      style={inputStyle}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> {drafting === p.id ? "Drafting…" : "Draft intro"}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={introValue}
                    onChange={(e) => setIntroDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                    onBlur={(e) => commitIntro(p, e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] px-3 py-2.5 font-body text-sm text-[#D4C6A8] outline-none placeholder:text-[#8C8573]/60"
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder="A short paragraph shown next to the Introduction label."
                  />
                  <span className="font-body text-[11px] text-[#8C8573]/70">
                    Drafts are a starting point — review and edit before you click away to save.
                  </span>
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className={labelCls}>Accent colour</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={p.accentColor || "#8C8573"}
                        onChange={(e) => save(p.id, { accentColor: e.target.value })}
                        className="h-11 w-14 cursor-pointer rounded-xl bg-transparent p-1"
                        style={inputStyle}
                        aria-label="Accent colour"
                      />
                      {p.accentColor ? (
                        <button onClick={() => save(p.id, { accentColor: "" })} className="rounded-full border px-3 py-2 font-body text-[12px] text-[#8C8573]" style={inputStyle}>
                          Use auto
                        </button>
                      ) : (
                        <span className="font-body text-[11px] text-[#8C8573]/70">Auto from the image</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <p className={labelCls}>Page image</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    {p.pageImage && (
                      <div className="relative h-20 w-32 overflow-hidden rounded-lg" style={{ border: "1px solid rgba(212,198,168,0.15)" }}>
                        <Image src={p.pageImage} alt="" className="h-full w-full" fittingType="fill" />
                        <button
                          onClick={() => save(p.id, { pageImage: "" })}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                          aria-label="Remove page image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 font-body text-[13px] text-[#8C8573]" style={inputStyle}>
                      <Upload className="h-4 w-4" /> {p.pageImage ? "Replace image" : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          uploadOne(p.id, e.target.files[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {busy === p.id && <span className="font-body text-[12px] text-[#8C8573]">Uploading…</span>}
                  </div>
                  <p className="mt-2 font-body text-[11px] text-[#8C8573]/70">
                    This one image is the project page image and also becomes its cover on every panel.
                  </p>
                </div>

                <div className="flex flex-wrap gap-5">
                  <label className="flex items-center gap-2 font-body text-sm text-[#8C8573]">
                    <input type="checkbox" checked={p.visible !== false} onChange={(e) => save(p.id, { visible: e.target.checked })} /> Visible
                  </label>
                  <label className="flex items-center gap-2 font-body text-sm text-[#8C8573]">
                    <input type="checkbox" checked={p.featured !== false} onChange={(e) => save(p.id, { featured: e.target.checked })} /> Featured
                  </label>
                </div>

                <button
                  onClick={() => removeProject(p.id)}
                  className="flex w-fit items-center gap-2 rounded-full border px-4 py-2 font-body text-[13px] text-[#8C8573]"
                  style={inputStyle}
                >
                  <Trash2 className="h-4 w-4" /> Delete project
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}