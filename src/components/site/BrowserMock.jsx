import React from "react";
import { cn } from "@/lib/utils";

// CSS browser-frame mockup with a mini wireframe — the fallback when a project
// has no screenshot yet. Four wireframe variants keep the gallery varied.
export default function BrowserMock({ variant = 0, className, compact = false }) {
  const v = Math.abs(variant) % 4;
  const line = "rounded-full";
  const soft = { background: "rgba(212,198,168,0.10)" };
  const softer = { background: "rgba(212,198,168,0.06)" };

  return (
    <div className={cn("flex h-full w-full flex-col", className)} style={{ background: "#17140F" }}>
      <div
        className="flex items-center gap-1.5 border-b px-3 py-2"
        style={{ borderColor: "rgba(212,198,168,0.12)" }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(212,198,168,0.22)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(212,198,168,0.16)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(212,198,168,0.12)" }} />
        <div className={cn("ml-3 h-3 flex-1", line)} style={softer} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        {v === 0 && (
          <>
            <div className="h-2 w-1/3 rounded-full" style={soft} />
            <div className="h-6 w-4/5 rounded-md sm:h-8" style={{ background: "rgba(212,198,168,0.14)" }} />
            <div className="h-6 w-2/3 rounded-md sm:h-8" style={{ background: "rgba(212,198,168,0.10)" }} />
            <div className="mt-auto grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg" style={softer} />
              ))}
            </div>
          </>
        )}
        {v === 1 && (
          <div className="grid flex-1 grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <div className="h-5 w-3/4 rounded-md" style={{ background: "rgba(212,198,168,0.14)" }} />
              <div className="h-2 w-full rounded-full" style={soft} />
              <div className="h-2 w-5/6 rounded-full" style={softer} />
              <div className="mt-auto h-8 w-24 rounded-full" style={{ background: "rgba(212,198,168,0.16)" }} />
            </div>
            <div className="rounded-lg" style={{ background: "rgba(212,198,168,0.08)" }} />
          </div>
        )}
        {v === 2 && (
          <>
            <div className="h-8 w-full rounded-lg" style={{ background: "rgba(212,198,168,0.12)" }} />
            <div className="grid flex-1 grid-cols-2 gap-2">
              <div className="rounded-lg" style={softer} />
              <div className="rounded-lg" style={soft} />
            </div>
            <div className="h-2 w-1/2 rounded-full" style={softer} />
          </>
        )}
        {v === 3 && (
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 w-1/4 rounded-full" style={soft} />
            <div className="grid flex-1 grid-cols-3 gap-2">
              <div className="col-span-2 rounded-lg" style={{ background: "rgba(212,198,168,0.12)" }} />
              <div className="flex flex-col gap-2">
                <div className="flex-1 rounded-lg" style={softer} />
                <div className="flex-1 rounded-lg" style={softer} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}