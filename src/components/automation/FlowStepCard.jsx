import React from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2, Circle } from "lucide-react";

export default function FlowStepCard({ stage, index, status, isLast, onAdvance, canAdvance, mode }) {
  const Icon = stage.icon;
  const isRunning = status === "running";
  const isDone = status === "done";

  return (
    <div className="relative pl-12">
      {/* Timeline node */}
      <div className="absolute left-0 top-0 flex flex-col items-center">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-500",
            isDone && "border-emerald-400/60 bg-emerald-500/15 shadow-[0_0_20px_-4px_rgba(52,211,153,0.6)]",
            isRunning && "border-fuchsia-400/70 bg-fuchsia-500/15 shadow-[0_0_24px_-4px_rgba(232,121,249,0.7)]",
            !isDone && !isRunning && "border-white/10 bg-white/[0.03]"
          )}
        >
          {isDone ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : isRunning ? (
            <Loader2 className="w-4 h-4 text-fuchsia-300 animate-spin" />
          ) : (
            <Icon className={cn("w-4 h-4", "text-white/30")} />
          )}
        </div>
        {!isLast && (
          <div className={cn("w-px flex-1 mt-1 transition-colors duration-500", isDone ? "bg-emerald-400/30" : "bg-white/10")} style={{ minHeight: "2.5rem" }} />
        )}
      </div>

      {/* Card */}
      <div
        className={cn(
          "mb-5 rounded-2xl border p-4 transition-all duration-500",
          isRunning
            ? "border-fuchsia-400/30 bg-fuchsia-500/[0.04] shadow-[0_0_40px_-12px_rgba(232,121,249,0.4)]"
            : isDone
            ? "border-white/10 bg-white/[0.02]"
            : "border-white/[0.06] bg-white/[0.015]"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-white/30">{String(index + 1).padStart(2, "0")}</span>
              <h3 className={cn("text-sm font-medium", isDone || isRunning ? "text-white" : "text-white/70")}>{stage.title}</h3>
            </div>
            <p className="mt-1 text-xs text-white/45 leading-relaxed">{stage.subtitle}</p>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/40">
            {stage.agent}
          </span>
        </div>

        {isRunning && stage.detail && (
          <div className="mt-3 space-y-1.5">
            {stage.detail.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-white/50">
                <Circle className="w-1 h-1 fill-fuchsia-300 text-fuchsia-300" />
                {d}
              </div>
            ))}
          </div>
        )}

        {mode === "manual" && status === "running" && (
          <button
            onClick={onAdvance}
            className="mt-3 rounded-lg border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-200 transition-colors hover:bg-fuchsia-500/20"
          >
            Conferma e prosegui →
          </button>
        )}
      </div>
    </div>
  );
}