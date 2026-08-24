import React from "react";
import { cn } from "@/lib/utils";

export default function ServiceCard({ title, description, icon: Icon, fields, values, onChange, status }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
          {Icon ? <Icon className="w-3.5 h-3.5 text-white/80" /> : null}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-white/90">{title}</h3>
          {description ? <p className="text-[10px] text-white/40">{description}</p> : null}
        </div>
        {status && (
          <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[9px]", status === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/40")}>
            {status === "ok" ? "Pronto" : "Da configurare"}
          </span>
        )}
      </div>
      <div className="grid gap-2">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="text-[10px] text-white/45">{f.label}</span>
            <input
              type={f.type || "text"}
              inputMode={f.type === "number" ? "numeric" : undefined}
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
              placeholder={f.placeholder || ""}
              className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white/90 placeholder:text-white/25 focus:border-fuchsia-400/40 focus:outline-none"
            />
          </label>
        ))}
      </div>
    </div>
  );
}