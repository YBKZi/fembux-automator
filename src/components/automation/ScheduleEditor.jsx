import React, { useState, useEffect } from "react";
import { Clock, Plus, X, Save } from "lucide-react";

export default function ScheduleEditor({ times, onSave, saving }) {
  const [local, setLocal] = useState(times || []);
  const [input, setInput] = useState("");

  useEffect(() => setLocal(times || []), [times]);

  const add = () => {
    const v = input.trim();
    if (!/^\d{2}:\d{2}$/.test(v)) return;
    if (!local.includes(v)) setLocal([...local, v].sort());
    setInput("");
  };
  const remove = (t) => setLocal(local.filter((x) => x !== t));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <Clock className="w-3.5 h-3.5 text-fuchsia-300" />
        <span className="text-xs font-medium text-white/80">Orari programmati</span>
        <span className="ml-auto text-[10px] text-white/40">Ricorrente giornaliero</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
        {local.length === 0 && <span className="text-[11px] text-white/35 self-center">Nessun orario impostato</span>}
        {local.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-1 text-[11px] text-fuchsia-100">
            {t}
            <button onClick={() => remove(t)} className="text-fuchsia-200/60 hover:text-white"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-white outline-none focus:border-fuchsia-400/50 [color-scheme:dark]"
        />
        <button onClick={add} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-white/60 hover:bg-white/10 hover:text-white">
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onSave(local)}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" /> {saving ? "…" : "Salva"}
        </button>
      </div>
    </div>
  );
}