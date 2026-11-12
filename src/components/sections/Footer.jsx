import React from "react";

export default function Footer() {
  const phrase = "Sharp details. Fast delivery.";
  return (
    <footer className="relative overflow-hidden border-t px-5 pb-32 pt-16 sm:px-8" style={{ borderColor: "rgba(212,198,168,0.12)" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-sm font-extrabold uppercase tracking-[0.3em] text-[#D4C6A8]">Lakulish Meena</span>
          <span className="font-body text-[12px] uppercase tracking-[0.22em] text-[#8C8573]">
            Based in India. Working worldwide.
          </span>
        </div>
        <a
          href="/admin"
          className="font-body text-[12px] uppercase tracking-[0.22em] text-[#8C8573] transition-colors hover:text-[#D4C6A8]"
        >
          Admin
        </a>
      </div>

      <div className="mt-16 flex w-full overflow-hidden">
        <div className="animate-marquee flex shrink-0 gap-10 whitespace-nowrap">
          {[0, 1].map((k) => (
            <span key={k} className="flex shrink-0 gap-10">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="text-outline font-heading text-[13vw] font-extrabold uppercase leading-none tracking-tighter sm:text-[9vw]">
                  {phrase}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}