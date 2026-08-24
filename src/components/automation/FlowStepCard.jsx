import React from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

export default function FlowStepCard({ stage, index, status, isLast, onAdvance, mode }) {
  const Icon = stage.icon;
  const isRunning = status === "running";
  const isDone = status === "done";

  return (
    <div className="relative pl-14 sm:pl-16">
      {/* Timeline node + connector */}
      <div className="absolute left-0 top-0 flex flex-col items-center">
        <div
          className={cn(
            "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition-all duration-500",
            isDone && "border-emerald-400/50 bg-emerald-500/15 shadow-[0_0_24px_-4px_rgba(52,211,153,0.6)]",
            isRunning && "border-fuchsia-400/60 bg-fuchsia-500/15 shadow-[0_0_28px_-4px_rgba(232,121,249,0.7)]",
            !isDone && !isRunning && "border-white/10 bg-white/[0.04]"
          )}
        >
          {isDone ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : isRunning ? (
            <Loader2 className="w-4 h-4 text-fuchsia-300 animate-spin" />
          ) : (
            <Icon className="w-4 h-4 text-white/35" />
          )}
        </div>
        {!isLast && (
          <div className={cn("w-px flex-1 mt-1.5 transition-colors duration-500", isDone ? "bg-gradient-to-b from-emerald-400/40 to-emerald-400/10" : "bg-white/10")} style={{ minHeight: "2rem" }} />
        )}
      </div>

      {/* Glassy card */}
      <div
        className={cn(
          "mb-4 rounded-[1.5rem] border p-5 backdrop-blur-xl transition-all duration-500",
          isRunning
            ? "border-fuchsia-400/25 bg-fuchsia-500/[0.06] shadow-[0_8px_40px_-16px_rgba(232,121,249,0.5)]"
            : isDone
            ? "border-white/10 bg-white/[0.04]"
            : "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.045]"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-white/30">{String(index + 1).padStart(2, "0")}</span>
              <h3 className={cn("text-sm sm:text-base font-semibold leading-tight", isDone || isRunning ? "text-white" : "text-white/80")}>{stage.title}</h3>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-white/50 leading-relaxed">{stage.subtitle}</p>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-white/45">
            {stage.agent}
          </span>
        </div>

        {isRunning && stage.detail && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {stage.detail.map((d, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300" />
                {d}
              </div>
            ))}
          </div>
        )}

        {mode === "manual" && status === "running" && (
          <button
            onClick={onAdvance}
            className="mt-4 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-2 text-xs font-medium text-fuchsia-200 transition-all hover:bg-fuchsia-500/25 active:scale-95"
          >
            Conferma e prosegui →
          </button>
        )}
      </div>
    </div>
  );
}