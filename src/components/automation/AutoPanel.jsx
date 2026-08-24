import React from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

function fmtSlot(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" }).format(new Date(iso));
  } catch { return null; }
}

export default function AutoPanel({ enabled, onToggle, nextSlot }) {
  const slot = fmtSlot(nextSlot);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <Zap className="w-3.5 h-3.5 text-violet-300" />
        <span className="text-xs font-medium text-white/80">Decisione automatica</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-white/90">{enabled ? "Grok sceglie gli orari ottimali" : "Disattivato"}</p>
          <p className="text-[11px] text-white/45 truncate">
            {enabled ? (slot ? `Prossimo slot: ${slot}` : "In attesa di pianificazione") : "Attiva per lasciare decidere Grok"}
          </p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", enabled ? "bg-fuchsia-500" : "bg-white/15")}
        >
          <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", enabled ? "left-[22px]" : "left-0.5")} />
        </button>
      </div>
    </div>
  );
}