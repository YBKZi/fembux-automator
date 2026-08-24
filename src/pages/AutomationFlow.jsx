import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, Power, Cpu, Sparkles, Download, Eye, Share2, Crown, Activity, Settings as SettingsIcon, AlertTriangle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import StartModeControl from "@/components/automation/StartModeControl";
import FlowStepCard from "@/components/automation/FlowStepCard";
import MonitoringPanel from "@/components/automation/MonitoringPanel";
import PlatformPanel from "@/components/automation/PlatformPanel";
import GrokBriefPanel from "@/components/automation/GrokBriefPanel";
import GeneratedImages from "@/components/automation/GeneratedImages";
import ScheduleEditor from "@/components/automation/ScheduleEditor";
import AutoPanel from "@/components/automation/AutoPanel";
import UpcomingRuns from "@/components/automation/UpcomingRuns";

const STAGES = [
  { id: "trend", title: "Analisi Trend", subtitle: "Grok studia i trend e sceglie il personaggio", icon: TrendingUp, agent: "Grok" },
  { id: "runpod", title: "Attivazione RunPod", subtitle: "Avvio GPU 4090 su RunPod", icon: Power, agent: "RunPod" },
  { id: "a1111", title: "Avvio A1111", subtitle: "Endpoint A1111 pronto sul pod", icon: Cpu, agent: "A1111" },
  { id: "generate", title: "Generazione Set", subtitle: "Prompt Grok → immagini su Stable Diffusion", icon: Sparkles, agent: "SD" },
  { id: "shutdown", title: "Chiusura + Download", subtitle: "Pod spento, foto salvate", icon: Download, agent: "RunPod" },
  { id: "monitor", title: "Monitoraggio", subtitle: "Prezzi, orari, hashtag, stili", icon: Eye, agent: "Grok" },
  { id: "crosspost", title: "Posting Trasversale", subtitle: "Post su X e Reddit in coordinata", icon: Share2, agent: "Pipeline" },
  { id: "patreon", title: "Pubblicazione Patreon", subtitle: "Set completo su Patreon", icon: Crown, agent: "Patreon" },
];

const PLATFORM_MAP = { crosspost: ["x", "reddit"], patreon: ["patreon"] };

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
  const [generatedImages, setGeneratedImages] = useState([]);
  const [crosspostResults, setCrosspostResults] = useState(null);
  const [error, setError] = useState(null);
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
    setGeneratedImages([]);
    setCrosspostResults(null);
    setError(null);
    setRunning(false);
  }, []);
  const setStatus = (id, st) => setStatuses((prev) => ({ ...prev, [id]: st }));

  const invoke = async (name, payload) => {
    const res = await base44.functions.invoke(name, payload || {});
    const data = res?.data ?? res;
    if (res?.error || data?.error) throw new Error(res?.error || data?.error || "Errore backend");
    return data;
  };

  const runFrom = useCallback((startIndex) => {
    let i = startIndex;
    const runStep = async () => {
      if (i >= STAGES.length) { setRunning(false); return; }
      const stage = STAGES[i];
      setStatus(stage.id, "running");
      setError(null);
      try {
        if (stage.id === "trend") {
          setLoadingBrief(true);
          const brief = await invoke("generateGrokBrief", { hint: "" });
          setGrokBrief(brief);
          setLoadingBrief(false);
          if (userId) {
            base44.entities.AutomationRun.create({
              owner_id: userId, mode: "manual", source: "manual", status: "done",
              scheduled_for: new Date().toISOString(), triggered_at: new Date().toISOString(), brief,
            }).then(() => loadRuns()).catch(() => {});
          }
        } else if (stage.id === "runpod") {
          await invoke("startPod", {});
        } else if (stage.id === "a1111") {
          // A1111 lives inside the pod image; ready once pod is up. No separate call.
        } else if (stage.id === "generate") {
          const prompts = grokBrief?.prompts?.length ? grokBrief.prompts : ["photorealistic portrait, cinematic lighting"];
          const res = await invoke("runGeneration", { prompts });
          setGeneratedImages(res.images || []);
        } else if (stage.id === "shutdown") {
          await invoke("stopPod", {});
        } else if (stage.id === "monitor") {
          // Monitoring: informational, reuses brief analysis.
        } else if (stage.id === "crosspost") {
          const img = generatedImages.find((g) => g.image_url)?.image_url || null;
          const text = `${grokBrief?.character ? grokBrief.character + " · " : ""}${(grokBrief?.hashtags || []).join(" ")}`.trim();
          const out = {};
          try { out.reddit = await invoke("postToReddit", { imageUrl: img, title: text || "New set", nsfw: true }); } catch (e) { out.reddit = { error: e.message }; }
          try { out.x = await invoke("postToX", { imageUrl: img, text: text.slice(0, 280) }); } catch (e) { out.x = { error: e.message }; }
          setCrosspostResults(out);
          if (PLATFORM_MAP[stage.id]) setActivePlatforms((p) => [...new Set([...p, ...PLATFORM_MAP[stage.id]])]);
        } else if (stage.id === "patreon") {
          // Patreon posting: requires creator OAuth + media upload (deferred).
        }
        setStatus(stage.id, "done");
        if (PLATFORM_MAP[stage.id] && stage.id !== "crosspost") setActivePlatforms((p) => [...new Set([...p, ...PLATFORM_MAP[stage.id]])]);
        i += 1;
        if (i >= STAGES.length) { setRunning(false); return; }
        timers.current.push(setTimeout(runStep, 250));
      } catch (e) {
        setError(`${stage.title}: ${e.message}`);
        setStatus(stage.id, "idle");
        setRunning(false);
      }
    };
    runStep();
  }, [userId, loadRuns, grokBrief, generatedImages]);

  const handleRun = () => {
    if (running) return;
    const nextIndex = STAGES.findIndex((s) => statuses[s.id] !== "done");
    if (nextIndex === -1) { reset(); timers.current.push(setTimeout(() => runFrom(0), 50)); return; }
    setRunning(true);
    runFrom(nextIndex);
  };

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
            <Link to="/settings" className="ml-1 rounded-lg border border-white/10 p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white" title="Impostazioni">
              <SettingsIcon className="w-3.5 h-3.5" />
            </Link>
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
            <ScheduleEditor times={semiTimes} saving={saving} onSave={(t) => { setSemiTimes(t); saveConfig({ mode: "semi", semi_times: t, enabled: true }); }} />
          </div>
        )}

        {mode === "auto" && (
          <div className="mb-5">
            <AutoPanel enabled={autoEnabled} nextSlot={nextSlot} onToggle={(v) => { setAutoEnabled(v); saveConfig({ mode: "auto", enabled: v }); }} />
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 backdrop-blur-2xl">
            <AlertTriangle className="mt-0.5 w-3.5 h-3.5 shrink-0 text-red-300" />
            <p className="text-xs text-red-200/90 leading-snug">{error}</p>
            <Link to="/settings" className="ml-auto shrink-0 rounded-lg border border-red-400/30 px-2 py-1 text-[10px] text-red-200 hover:bg-red-500/20">Impostazioni</Link>
          </div>
        )}

        {(loadingBrief || displayBrief) && (
          <div className="mb-5">
            <GrokBriefPanel brief={displayBrief} loading={loadingBrief} />
          </div>
        )}

        {generatedImages.length > 0 && (
          <div className="mb-5">
            <GeneratedImages images={generatedImages} />
          </div>
        )}

        {crosspostResults && (
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-2xl">
            <div className="mb-2 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-xs font-medium text-white/80">Posting</span>
            </div>
            <div className="grid gap-1.5">
              {crosspostResults.reddit && (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-[11px]">
                  <span className="text-white/55">Reddit</span>
                  {crosspostResults.reddit.url ? <a href={crosspostResults.reddit.url} target="_blank" rel="noreferrer" className="text-emerald-300 underline">pubblicato</a> : <span className="text-red-300">{crosspostResults.reddit.error}</span>}
                </div>
              )}
              {crosspostResults.x && (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-[11px]">
                  <span className="text-white/55">X</span>
                  {crosspostResults.x.url ? <a href={crosspostResults.x.url} target="_blank" rel="noreferrer" className="text-emerald-300 underline">pubblicato</a> : <span className="text-red-300">{crosspostResults.x.error}</span>}
                </div>
              )}
            </div>
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