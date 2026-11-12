import React from "react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import BrowserMock from "./BrowserMock";

// A single 16:10 project panel: cover screenshot (object-cover, rounded, thin
// cream border) or the CSS browser-frame mockup fallback.
export default function ProjectThumb({ project, index = 0, className, imgClassName }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", className)}
      style={{ border: "1px solid rgba(212,198,168,0.18)", background: "#17140F" }}
    >
      <div className="aspect-[16/10] w-full">
        {project.cover ? (
          <Image
            src={project.cover}
            alt={`${project.display_name} — ${project.type || "project"}`}
            className={cn("h-full w-full", imgClassName)}
            fittingType="fill"
            loading="lazy"
          />
        ) : (
          <BrowserMock variant={index} />
        )}
      </div>
    </div>
  );
}