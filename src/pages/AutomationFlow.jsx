import React, { useState, useRef, useCallback } from "react";
import {
  TrendingUp, Power, Cpu, Sparkles, Download, Eye, Share2, Crown, Activity,
} from "lucide-react";
import StartModeControl from "@/components/automation/StartModeControl";
import FlowStepCard from "@/components/automation/FlowStepCard";
import MonitoringPanel from "@/components/automation/MonitoringPanel";
import PlatformPanel from "@/components/automation/PlatformPanel";
import GrokBriefPanel from "@/components/automation/GrokBriefPanel";
import { base44 } from "@/api/base44Client";

const STAGES = [
  { id: "trend", title: "Analisi Trend", subtitle: "Grok studia i trend e sceglie il personaggio", icon: TrendingUp, agent: "Grok", detail: [] },
  { id: "runpod", title: "Attivazione RunPod", subtitle: "Accensione GPU 4090 on-demand", icon: Power, agent: "RunPod", detail: [] },
  { id: "a1111", title: "Avvio A1111", subtitle: "Checkpoint Stellar Bara", icon: Cpu, agent: "A1111", detail: [] },
  { id: "generate", title: "Generazione Set", subtitle: "Prompt Grok → immagini, con filtraggio qualità", icon: Sparkles, agent: "SD", detail: [] },
  { id: "shutdown", title: "Chiusura + Download", subtitle: "Pod spento, foto salvate per giorno/ciclo", icon: Download, agent: "RunPod", detail: [] },
  { id: "monitor", title: "Monitoraggio", subtitle: "Prezzi, orari, hashtag, stili, frequenza", icon: Eye, agent: "Grok", detail: [] },
  { id: "crosspost", title: "Posting Trasversale", subtitle: "X, Reddit, RedGifs in coordinata", icon: Share2, agent: "Pipeline", detail: [] },
  { id: "patreon", title: "Pubblicazione Patreon", subtitle: "Set completo in automatico", icon: Crown, agent: "Patreon", detail: [] },
];

const PLATFORM_MAP = { crosspost: ["x", "reddit", "redgifs"], patreon: ["patreon"] };

export default function AutomationFlow() {
  const [mode, setMode] = useState("auto");
  const [statuses, setStatuses] = useState(() => Object.fromEntries(STAGES.map((s) => [s.id, "idle"])));
  const [running, setRunning] = useState(false);
  const [activePlatforms, setActivePlatforms] = useState([]);
  const [grokBrief, setGrokBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach((t) => clearTimeout(t)); timers.current = []; };
  const reset = useCallback(() => {
    clearTimers();
    setStatuses(Object.fromEntries(STAGES.map((s) => [s.id, "idle"])));
    setActivePlatforms([]);
    setGrokBrief(null);
    setLoadingBrief(false);
    setRunning(false);
  }, []);
  const setStatus = (id, st) => setStatuses((prev) => ({ ...prev, [id]: st }));

  const runFrom = useCallback((startIndex) => {
    let i = startIndex;
    const runStep = () => {
      if (i >= STAGES.length) { setRunning(false); return; }
      const stage = STAGES[i];
      setStatus(stage.id, "running");
      if (stage.id === "trend") {
        setLoadingBrief(true);
        base44.functions.invoke("generateGrokBrief", { hint: "" })
          .then((res) => setGrokBrief(res.data))
          .catch(() => {})
          .finally(() => { setLoadingBrief(false); timers.current.push(setTimeout(finish, 400)); });
        return;
      }
      const finish = () => {
        setStatus(stage.id, "done");
        if (PLATFORM_MAP[stage.id]) setActivePlatforms((prev) => [...new Set([...prev, ...PLATFORM_MAP[stage.id]])]);
        i += 1;
        if (mode === "semi" && stage.id === "generate") { setRunning(false); return; }
        if (mode === "manual") { setRunning(false); return; }
        timers.current.push(setTimeout(runStep, 350));
      };
      timers.current.push(setTimeout(finish, 1600));
    };
    runStep();
  }, [mode]);

  const handleRun = () => {
    if (running) return;
    const nextIndex = STAGES.findIndex((s) => statuses[s.id] !== "done");
    if (nextIndex === -1) { reset(); timers.current.push(setTimeout(() => runFrom(0), 50)); return; }
    setRunning(true);
    runFrom(nextIndex);
  };

  const handleAdvance = () => {
    const idx = STAGES.findIndex((s) => statuses[s.id] === "running");
    if (idx === -1) return;
    setStatus(STAGES[idx].id, "done");
    if (PLATFORM_MAP[STAGES[idx].id]) setActivePlatforms((prev) => [...new Set([...prev, ...PLATFORM_MAP[STAGES[idx].id]])]);
    const after = idx + 1;
    if (after >= STAGES.length) { setRunning(false); return; }
    setStatus(STAGES[after].id, "running");
  };

  const currentStage = STAGES.find((s) => statuses[s.id] === "running");
  const doneCount = Object.values(statuses).filter((s) => s === "done").length;
  const progress = Math.round((doneCount / STAGES.length) * 100);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-48 left-1/4 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[130px]" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-violet-600/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-4 py-6 sm:py-8 lg:px-8">
        {/* Header */}
        <header className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/70">fembux</span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
            <Activity className="w-3.5 h-3.5 text-white/30" />
            <span className="text-xs text-white/55">
              {running ? "In esecuzione" : doneCount === STAGES.length ? "Completato" : "In attesa"}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${running ? "bg-fuchsia-400 animate-pulse" : doneCount === STAGES.length ? "bg-emerald-400" : "bg-white/30"}`} />
          </div>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
              Flusso d'<span className="bg-gradient-to-r from-fuchsia-400 to-violet-300 bg-clip-text text-transparent">Automazione</span>
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-1.5 w-20 sm:w-28 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-400 transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[11px] text-white/50 tabular-nums">{progress}%</span>
            </div>
          </div>
        </header>

        {/* Control bar */}
        <div className="mb-5">
          <StartModeControl mode={mode} onModeChange={setMode} running={running} onRun={handleRun} onReset={reset} currentStage={currentStage?.title} />
        </div>

        {(loadingBrief || grokBrief) && (
          <div className="mb-5">
            <GrokBriefPanel brief={grokBrief} loading={loadingBrief} />
          </div>
        )}

        {/* Flow */}
        <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 sm:p-4 backdrop-blur-2xl">
          <div className="mb-3 flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-violet-400" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/45">Tappe</span>
          </div>
          {STAGES.map((stage, i) => (
            <FlowStepCard key={stage.id} stage={stage} index={i} isLast={i === STAGES.length - 1} status={statuses[stage.id]} mode={mode} onAdvance={handleAdvance} canAdvance={running} />
          ))}
        </section>

        {/* Bottom grid */}
        <section className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <MonitoringPanel />
          <PlatformPanel activeIds={activePlatforms} />
        </section>
      </div>
    </div>
  );
}