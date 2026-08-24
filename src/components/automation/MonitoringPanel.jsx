import React from "react";
import { Eye, Clock, TrendingUp, Tag, Image, Layers } from "lucide-react";

const METRICS = [
  { label: "Orari ottimali", value: "20:00 – 23:00", icon: Clock, hint: "Peak" },
  { label: "Personaggio top", value: "Twink · cyber", icon: TrendingUp, hint: "+38%" },
  { label: "Hashtag vincenti", value: "14", icon: Tag, hint: "Live" },
  { label: "Foto per set", value: "8–12", icon: Image, hint: "Ideale" },
  { label: "Rapporto teaser", value: "3 · 2", icon: Layers, hint: "Ottimale" },
];

export default function MonitoringPanel() {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/15">
          <Eye className="w-3.5 h-3.5 text-cyan-300" />
        </div>
        <span className="text-sm font-semibold text-white/90">Monitoraggio concorrenti</span>
      </div>
      <p className="text-xs text-white/45 leading-relaxed mb-4">
        Analisi continua e ad alta ottimizzazione: prezzi, orari, descrizioni, personaggi, hashtag, foto, angolazioni, stili e organizzazione della frequenza.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-3 transition-colors hover:bg-white/[0.06]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10">
                <Icon className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-white/40 leading-tight">{m.label}</p>
                <p className="text-sm font-medium text-white/90 truncate">{m.value}</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300/90">{m.hint}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}