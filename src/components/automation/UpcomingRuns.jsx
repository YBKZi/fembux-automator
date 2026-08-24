import React from "react";
import { Calendar, Check, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" }).format(new Date(iso));
  } catch { return "—"; }
}

const STATUS = {
  pending: { icon: Clock, cls: "text-white/50 border-white/10 bg-white/[0.03]" },
  running: { icon: Loader2, cls: "text-fuchsia-200 border-fuchsia-400/30 bg-fuchsia-500/10" },
  done: { icon: Check, cls: "text-emerald-200 border-emerald-400/30 bg-emerald-500/10" },
  failed: { icon: Clock, cls: "text-red-200 border-red-400/30 bg-red-500/10" },
};

export default function UpcomingRuns({ runs }) {
  const sorted = [...runs].sort((a, b) => Date.parse(b.scheduled_for) - Date.parse(a.scheduled_for)).slice(0, 8);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <Calendar className="w-3.5 h-3.5 text-cyan-300" />
        <span className="text-xs font-medium text-white/80">Flussi</span>
      </div>
      {sorted.length === 0 ? (
        <p className="text-[11px] text-white/35 py-2">Nessun flusso programmato. Verrà pianificato automaticamente.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {sorted.map((r) => {
            const s = STATUS[r.status] || STATUS.pending;
            const Icon = s.icon;
            return (
              <li key={r.id} className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg border", s.cls)}>
                  <Icon className={cn("w-3.5 h-3.5", r.status === "running" && "animate-spin")} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/90 truncate">
                    {fmt(r.scheduled_for)} · {r.brief?.character || "Brief in attesa"}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wide text-white/40">{r.source}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}