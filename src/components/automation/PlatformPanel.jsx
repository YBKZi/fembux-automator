import React from "react";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

const PLATFORMS = [
  { id: "x", name: "X", dot: "bg-white" },
  { id: "reddit", name: "Reddit", dot: "bg-orange-400" },
  { id: "redgifs", name: "RedGifs", dot: "bg-rose-400" },
  { id: "patreon", name: "Patreon", dot: "bg-fuchsia-400" },
];

export default function PlatformPanel({ activeIds = [] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-xs font-medium text-white/80">Posting trasversale</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PLATFORMS.map((p) => {
          const active = activeIds.includes(p.id);
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2 transition-all duration-500",
                active ? "border-emerald-400/30 bg-emerald-500/[0.08]" : "border-white/[0.06] bg-white/[0.025]"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", p.dot)} />
                <span className="text-xs font-medium text-white/85">{p.name}</span>
              </div>
              {active ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Circle className="w-3 h-3 text-white/20" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}