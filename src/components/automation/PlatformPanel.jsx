import React from "react";
import { cn } from "@/lib/utils";
import { Check, Circle, ExternalLink } from "lucide-react";

const PLATFORMS = [
  { id: "x", name: "X / Twitter", handle: "@fembux", color: "text-white" },
  { id: "reddit", name: "Reddit", handle: "r/twinkboys", color: "text-orange-400" },
  { id: "redgifs", name: "RedGifs", handle: "fembux", color: "text-rose-400" },
  { id: "patreon", name: "Patreon", handle: "fembux", color: "text-fuchsia-400" },
];

export default function PlatformPanel({ activeIds = [] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">Posting trasversale</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {PLATFORMS.map((p) => {
          const active = activeIds.includes(p.id);
          return (
            <div
              key={p.id}
              className={cn(
                "rounded-xl border p-3 transition-all duration-500",
                active ? "border-emerald-400/30 bg-emerald-500/[0.06]" : "border-white/[0.06] bg-white/[0.015]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-medium", p.color)}>{p.name}</span>
                {active ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Circle className="w-3 h-3 text-white/20" />
                )}
              </div>
              <p className="mt-1 text-[11px] text-white/40">{p.handle}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[11px] text-white/40">
        <ExternalLink className="w-3 h-3" />
        <span>Il set completo viene pubblicato automaticamente su Patreon a fine ciclo.</span>
      </div>
    </div>
  );
}