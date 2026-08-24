import React from "react";
import { Hand, GitBranch, Zap, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "manual", label: "Manuale", desc: "Confermi ogni tappa", icon: Hand },
  { id: "semi", label: "Semi-Auto", desc: "Pausa ai checkpoint", icon: GitBranch },
  { id: "auto", label: "Automatico", desc: "Flusso continuo", icon: Zap },
];

export default function StartModeControl({ mode, onModeChange, running, onRun, onReset, currentStage }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Mode segmented control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/50">Modalità di partenza</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {MODES.map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id)}
                  disabled={running}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 transition-all duration-300 disabled:opacity-50",
                    active
                      ? "border-fuchsia-400/50 bg-fuchsia-500/15 shadow-[0_0_30px_-8px_rgba(232,121,249,0.6)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                  )}
                >
                  <Icon className={cn("w-4 h-4 transition-colors", active ? "text-fuchsia-300" : "text-white/40")} />
                  <div className="text-left">
                    <span className={cn("block text-sm font-medium leading-tight", active ? "text-white" : "text-white/70")}>{m.label}</span>
                    <span className="block text-[10px] text-white/40">{m.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 lg:shrink-0">
          <button
            onClick={onRun}
            disabled={running}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all hover:shadow-fuchsia-500/50 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {running ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                In esecuzione…
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Avvia flusso
              </>
            )}
          </button>
          <button
            onClick={onReset}
            disabled={running}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 backdrop-blur-xl"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {currentStage && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 px-4 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/70">In corso: <span className="text-white font-medium">{currentStage}</span></span>
        </div>
      )}
    </div>
  );
}