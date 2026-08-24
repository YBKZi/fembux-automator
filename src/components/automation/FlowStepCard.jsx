import React from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

export default function FlowStepCard({ stage, index, status, isLast }) {
  const Icon = stage.icon;
  const isRunning = status === "running";
  const isDone = status === "done";

  return (
    <div className="relative pl-11">
      <div className="absolute left-0 top-0 flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-xl transition-all duration-500",
            isDone && "border-emerald-400/50 bg-emerald-500/15 shadow-[0_0_18px_-4px_rgba(52,211,153,0.6)]",
            isRunning && "border-fuchsia-400/60 bg-fuchsia-500/15 shadow-[0_0_22px_-4px_rgba(232,121,249,0.7)]",
            !isDone && !isRunning && "border-white/10 bg-white/[0.04]"
          )}
        >
          {isDone ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : isRunning ? <Loader2 className="w-3.5 h-3.5 text-fuchsia-300 animate-spin" /> : <Icon className="w-3.5 h-3.5 text-white/35" />}
        </div>
        {!isLast && <div className={cn("w-px flex-1 mt-1 transition-colors duration-500", isDone ? "bg-emerald-400/30" : "bg-white/10")} style={{ minHeight: "1.25rem" }} />}
      </div>

      <div
        className={cn(
          "mb-2.5 rounded-xl border px-3.5 py-2.5 backdrop-blur-xl transition-all duration-500",
          isRunning ? "border-fuchsia-400/25 bg-fuchsia-500/[0.06]" : isDone ? "border-white/10 bg-white/[0.035]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10px] text-white/25">{String(index + 1).padStart(2, "0")}</span>
            <h3 className={cn("text-sm font-medium truncate", isDone || isRunning ? "text-white" : "text-white/75")}>{stage.title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-white/40">{stage.agent}</span>
          </div>
        </div>
        <p className="mt-0.5 text-[11px] text-white/45 leading-snug line-clamp-2">{stage.subtitle}</p>
      </div>
    </div>
  );
}