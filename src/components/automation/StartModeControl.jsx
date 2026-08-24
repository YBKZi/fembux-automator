import React from "react";
import { Hand, GitBranch, Zap, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "manual", label: "Manuale", icon: Hand },
  { id: "semi", label: "Semi", icon: GitBranch },
  { id: "auto", label: "Auto", icon: Zap },
];

export default function StartModeControl({ mode, onModeChange, running, onRun, onReset, currentStage }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-2xl">
      {/* Segmented modes */}
      <div className="flex gap-1 rounded-xl bg-black/20 p-1">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              disabled={running}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50",
                active ? "bg-fuchsia-500/20 text-white shadow-[0_0_18px_-6px_rgba(232,121,249,0.7)]" : "text-white/45 hover:text-white/80"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {currentStage && (
        <span className="hidden sm:flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {currentStage}
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={running}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
        >
          {running ? <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
          {running ? "In corso…" : "Avvia"}
        </button>
        <button
          onClick={onReset}
          disabled={running}
          className="rounded-xl border border-white/10 px-2.5 py-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}