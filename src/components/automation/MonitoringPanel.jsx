import React from "react";
import { Eye, TrendingUp, Clock, Tag, Image, Layers } from "lucide-react";

const METRICS = [
  { label: "Orari ottimali", value: "20:00 – 23:00", icon: Clock, hint: "Peak engagement" },
  { label: "Personaggio top", value: "Twink · cyber", icon: TrendingUp, hint: "+38% interazioni" },
  { label: "Hashtag vincenti", value: "14 individuati", icon: Tag, hint: "Aggiornati 2h fa" },
  { label: "Foto per set", value: "8–12", icon: Image, hint: "Range ideale" },
  { label: "Rapporto teaser", value: "3 cens · 2 teaser", icon: Layers, hint: "Frequenza ottimale" },
];

export default function MonitoringPanel() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-3.5 h-3.5 text-cyan-300" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">Monitoraggio concorrenti</span>
      </div>
      <p className="text-xs text-white/40 leading-relaxed mb-4">
        Analisi continua e ottimizzata di prezzi, orari, descrizioni, personaggi, hashtag, foto, angolazioni, stili e organizzazione della frequenza.
      </p>
      <div className="space-y-2.5">
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                <Icon className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-white/40">{m.label}</p>
                <p className="text-sm font-medium text-white/90 truncate">{m.value}</p>
              </div>
              <span className="shrink-0 text-[10px] text-emerald-300/80">{m.hint}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}