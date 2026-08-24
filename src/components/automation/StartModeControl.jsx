import React from "react";
import { Hand, GitBranch, Zap, Play, Square, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "manual", label: "Manuale", desc: "Confermi ogni tappa", icon: Hand },
  { id: "semi", label: "Semi-Auto", desc: "Pausa ai checkpoint", icon: GitBranch },
  { id: "auto", label: "Automatico", desc: "Flusso continuo", icon: Zap },
];

export default function StartModeControl({ mode, onModeChange, running, onRun, onReset, currentStage }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">Modalità di partenza</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              disabled={running}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-all duration-300 disabled:opacity-50",
                active
                  ? "border-fuchsia-400/60 bg-fuchsia-500/10 shadow-[0_0_24px_-6px_rgba(232,121,249,0.5)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              )}
            >
              <Icon className={cn("w-4 h-4 transition-colors", active ? "text-fuchsia-300" : "text-white/40")} />
              <span className={cn("text-xs font-medium", active ? "text-white" : "text-white/60")}>{m.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-white/40 leading-relaxed mb-5">
        {MODES.find((m) => m.id === mode).desc}. Il flusso parte da qui e percorre tutte le tappe.
      </p>

      <div className="flex gap-2">
        <button
          onClick={onRun}
          disabled={running}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition-all hover:shadow-fuchsia-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {running ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              In esecuzione…
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Avvia flusso
            </>
          )}
        </button>
        <button
          onClick={onReset}
          disabled={running}
          className="rounded-xl border border-white/10 px-3 py-2.5 text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {currentStage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/60">In corso: <span className="text-white/90">{currentStage}</span></span>
        </div>
      )}
    </div>
  );
}