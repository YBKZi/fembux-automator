import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  TrendingUp, Power, Cpu, Sparkles, Download, Eye, Share2, Crown, Activity,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import StartModeControl from "@/components/automation/StartModeControl";
import FlowStepCard from "@/components/automation/FlowStepCard";
import MonitoringPanel from "@/components/automation/MonitoringPanel";
import PlatformPanel from "@/components/automation/PlatformPanel";
import GrokBriefPanel from "@/components/automation/GrokBriefPanel";
import ScheduleEditor from "@/components/automation/ScheduleEditor";
import AutoPanel from "@/components/automation/AutoPanel";
import UpcomingRuns from "@/components/automation/UpcomingRuns";

const STAGES = [
  { id: "trend", title: "Analisi Trend", subtitle: "Grok studia i trend e sceglie il personaggio", icon: TrendingUp, agent: "Grok" },
  { id: "runpod", title: "Attivazione RunPod", subtitle: "Accensione GPU 4090 on-demand", icon: Power, agent: "RunPod" },
  { id: "a1111", title: "Avvio A1111", subtitle: "Checkpoint Stellar Bara", icon: Cpu, agent: "A1111" },
  { id: "generate", title: "Generazione Set", subtitle: "Prompt Grok → immagini, con filtraggio qualità", icon: Sparkles, agent: "SD" },
  { id: "shutdown", title: "Chiusura + Download", subtitle: "Pod spento, foto salvate per giorno/ciclo", icon: Download, agent: "RunPod" },
  { id: "monitor", title: "Monitoraggio", subtitle: "Prezzi, orari, hashtag, stili, frequenza", icon: Eye, agent: "Grok" },
  { id: "crosspost", title: "Posting Trasversale", subtitle: "X, Reddit, RedGifs in coordinata", icon: Share2, agent: "Pipeline" },
  { id: "patreon", title: "Pubblicazione Patreon", subtitle: "Set completo in automatico", icon: Crown, agent: "Patreon" },
];

const PLATFORM_MAP = { crosspost: ["x", "reddit", "redgifs"], patreon: ["patreon"] };

export default function AutomationFlow() {
  const [mode, setMode] = useState("manual");
  const [configId, setConfigId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [semiTimes, setSemiTimes] = useState([]);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [runs, setRuns] = useState([]);
  const [statuses, setStatuses] = useState(() => Object.fromEntries(STAGES.map((s) => [s.id, "idle"])));
  const [running, setRunning] = useState(false);
  const [activePlatforms, setActivePlatforms] = useState([]);
  const [grokBrief, setGrokBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [saving, setSaving] = useState(false);
  const timers = useRef([]);

  const loadRuns = useCallback(async () => {
    try {
      const me = userId ? { id: userId } : await base44.auth.me();
      const list = await base44.entities.AutomationRun.filter({ owner_id: me.id }, "-scheduled_for", 20);
      setRuns(list);
    } catch {}
  }, [userId]);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUserId(me.id);
        const cfgs = await base44.entities.AutomationConfig.filter({ created_by_id: me.id });
        let cfg = cfgs[0];
        if (!cfg) cfg = await base44.entities.AutomationConfig.create({ mode: "manual", semi_times: [], enabled: false });
        setConfigId(cfg.id);
        setMode(cfg.mode || "manual");
        setSemiTimes(Array.isArray(cfg.semi_times) ? cfg.semi_times : []);
        setAutoEnabled(cfg.mode === "auto" && !!cfg.enabled);
      } catch {}
      loadRuns();
    })();
    const iv = setInterval(loadRuns, 60000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConfig = async (patch) => {
    if (!configId) return;
    setSaving(true);
    try { await base44.entities.AutomationConfig.update(configId, patch); } catch {}
    setSaving(false);
  };

  const handleModeChange = async (m) => {
    setMode(m);
    setGrokBrief(null);
    const enabled = m === "semi" ? true : (m === "auto" ? autoEnabled : false);
    await saveConfig({ mode: m, enabled });
    loadRuns();
  };

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
          .then((res) => {
            setGrokBrief(res.data);
            if (userId) {
              base44.entities.AutomationRun.create({
                owner_id: userId, mode: "manual", source: "manual", status: "done",
                scheduled_for: new Date().toISOString(), triggered_at: new Date().toISOString(), brief: res.data,
              }).then(() => loadRuns()).catch(() => {});
            }
          })
          .catch(() => {})
          .finally(() => { setLoadingBrief(false); timers.current.push(setTimeout(finish, 400)); });
        return;
      }
      const finish = () => {
        setStatus(stage.id, "done");
        if (PLATFORM_MAP[stage.id]) setActivePlatforms((prev) => [...new Set([...prev, ...PLATFORM_MAP[stage.id]])]);
        i += 1;
        if (i >= STAGES.length) { setRunning(false); return; }
        timers.current.push(setTimeout(runStep, 350));
      };
      timers.current.push(setTimeout(finish, 1600));
    };
    runStep();
  }, [userId, loadRuns]);

  const handleRun = () => {
    if (running) return;
    const nextIndex = STAGES.findIndex((s) => statuses[s.id] !== "done");
    if (nextIndex === -1) { reset(); timers.current.push(setTimeout(() => runFrom(0), 50)); return; }
    setRunning(true);
    runFrom(nextIndex);
  };

  const currentStage = STAGES.find((s) => statuses[s.id] === "running");
  const doneCount = Object.values(statuses).filter((s) => s === "done").length;
  const progress = Math.round((doneCount / STAGES.length) * 100);

  const latestRunBrief = runs.find((r) => r.status === "done" && r.brief && r.brief.character)?.brief || null;
  const displayBrief = grokBrief || latestRunBrief;

  const pendingRuns = runs
    .filter((r) => r.status === "pending")
    .sort((a, b) => Date.parse(a.scheduled_for) - Date.parse(b.scheduled_for));
  const nextSlot = pendingRuns[0]?.scheduled_for || null;

  const statusLabel = mode === "manual"
    ? (running ? "In esecuzione" : doneCount === STAGES.length ? "Completato" : "Pronto")
    : mode === "semi" ? "Programmato"
    : autoEnabled ? "Automatico" : "Auto off";
  const dotClass = running ? "bg-fuchsia-400 animate-pulse" : mode === "auto" && autoEnabled ? "bg-emerald-400" : "bg-white/30";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-48 left-1/4 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[130px]" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-violet-600/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-4 py-6 sm:py-8 lg:px-8">
        <header className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/70">fembux</span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
            <Activity className="w-3.5 h-3.5 text-white/30" />
            <span className="text-xs text-white/55">{statusLabel}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
          </div>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
              Flusso d'<span className="bg-gradient-to-r from-fuchsia-400 to-violet-300 bg-clip-text text-transparent">Automazione</span>
            </h1>
            {mode === "manual" && (
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-1.5 w-20 sm:w-28 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-400 transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[11px] text-white/50 tabular-nums">{progress}%</span>
              </div>
            )}
          </div>
        </header>

        <div className="mb-5">
          <StartModeControl mode={mode} onModeChange={handleModeChange} running={running} onRun={handleRun} onReset={reset} />
        </div>

        {mode === "semi" && (
          <div className="mb-5">
            <ScheduleEditor
              times={semiTimes}
              saving={saving}
              onSave={(t) => { setSemiTimes(t); saveConfig({ mode: "semi", semi_times: t, enabled: true }); }}
            />
          </div>
        )}

        {mode === "auto" && (
          <div className="mb-5">
            <AutoPanel
              enabled={autoEnabled}
              nextSlot={nextSlot}
              onToggle={(v) => { setAutoEnabled(v); saveConfig({ mode: "auto", enabled: v }); }}
            />
          </div>
        )}

        {(loadingBrief || displayBrief) && (
          <div className="mb-5">
            <GrokBriefPanel brief={displayBrief} loading={loadingBrief} />
          </div>
        )}

        {mode === "manual" && (
          <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 sm:p-4 backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-violet-400" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/45">Tappe</span>
            </div>
            {STAGES.map((stage, i) => (
              <FlowStepCard key={stage.id} stage={stage} index={i} isLast={i === STAGES.length - 1} status={statuses[stage.id]} />
            ))}
          </section>
        )}

        {mode !== "manual" && (
          <section className="mb-5">
            <UpcomingRuns runs={runs} />
          </section>
        )}

        <section className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <MonitoringPanel />
          <PlatformPanel activeIds={activePlatforms} />
        </section>
      </div>
    </div>
  );
}