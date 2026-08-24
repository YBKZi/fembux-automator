import React from "react";
import { Eye, Clock, TrendingUp, Tag, Image, Layers } from "lucide-react";

const METRICS = [
  { label: "Orari", value: "20–23h", icon: Clock },
  { label: "Personaggio", value: "Cyber twink", icon: TrendingUp },
  { label: "Hashtag", value: "14", icon: Tag },
  { label: "Foto/set", value: "8–12", icon: Image },
  { label: "Teaser", value: "3·2", icon: Layers },
];

export default function MonitoringPanel() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <Eye className="w-3.5 h-3.5 text-cyan-300" />
        <span className="text-xs font-medium text-white/80">Monitoraggio concorrenti</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-2">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3 text-cyan-300/80" />
                <span className="text-[10px] text-white/40">{m.label}</span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-white/90">{m.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}