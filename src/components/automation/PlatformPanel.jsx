import React from "react";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

const PLATFORMS = [
  { id: "x", name: "X", handle: "@fembux", dot: "bg-white" },
  { id: "reddit", name: "Reddit", handle: "r/twinkboys", dot: "bg-orange-400" },
  { id: "redgifs", name: "RedGifs", handle: "fembux", dot: "bg-rose-400" },
  { id: "patreon", name: "Patreon", handle: "fembux", dot: "bg-fuchsia-400" },
];

export default function PlatformPanel({ activeIds = [] }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-sm font-semibold text-white/90">Posting trasversale</span>
      </div>
      <p className="text-xs text-white/45 leading-relaxed mb-4">
        Pubblicazione coordinata su tutte le piattaforme. Il set completo va in automatico su Patreon a fine ciclo.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {PLATFORMS.map((p) => {
          const active = activeIds.includes(p.id);
          return (
            <div
              key={p.id}
              className={cn(
                "rounded-2xl border p-3.5 transition-all duration-500 backdrop-blur-xl",
                active ? "border-emerald-400/30 bg-emerald-500/[0.08] shadow-[0_0_24px_-8px_rgba(52,211,153,0.5)]" : "border-white/[0.07] bg-white/[0.03]"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-2 h-2 rounded-full", p.dot)} />
                  <span className="text-xs font-semibold text-white/90">{p.name}</span>
                </div>
                {active ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Circle className="w-3 h-3 text-white/20" />}
              </div>
              <p className="mt-1.5 text-[11px] text-white/40">{p.handle}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}