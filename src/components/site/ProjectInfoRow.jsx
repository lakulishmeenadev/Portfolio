import React from "react";

// Small cream uppercase labels with their values. Columns whose field is empty
// are dropped — nothing is invented, and TYPE falls back to "Website".
export default function ProjectInfoRow({ project }) {
  const columns = [
    { label: "Category", value: project.type },
    { label: "Year", value: project.year },
    { label: "Type", value: project.page_type || "Website" },
    { label: "Client", value: project.client },
    { label: "Services", value: project.services },
  ].filter((c) => c.value && String(c.value).trim());

  if (!columns.length) return null;

  return (
    <div
      className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-y py-6 sm:gap-x-16"
      style={{ borderColor: "rgba(212,198,168,0.14)" }}
    >
      {columns.map((c) => (
        <div key={c.label} className="min-w-[104px]">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-[#D4C6A8]">{c.label}</p>
          <p className="mt-2 font-body text-sm text-[#8C8573]">{c.value}</p>
        </div>
      ))}
    </div>
  );
}