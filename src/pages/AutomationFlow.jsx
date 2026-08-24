import React, { useState, useRef, useCallback } from "react";
import {
  TrendingUp, Power, Cpu, Sparkles, Download, Eye, Share2, Crown, Activity,
} from "lucide-react";
import StartModeControl from "@/components/automation/StartModeControl";
import FlowStepCard from "@/components/automation/FlowStepCard";
import MonitoringPanel from "@/components/automation/MonitoringPanel";
import PlatformPanel from "@/components/automation/PlatformPanel";

const STAGES = [
  {
    id: "trend",
    title: "Analisi Trend",
    subtitle: "Grok studia Google Trends e decide il personaggio del post di oggi.",
    icon: TrendingUp,
    agent: "Grok",
    detail: ["Lettura Google Trends", "Selezione personaggio", "Bozza concetto visivo"],
  },
  {
    id: "runpod",
    title: "Attivazione RunPod",
    subtitle: "Accensione on-demand della GPU 4090 affittata.",
    icon: Power,
    agent: "RunPod",
    detail: ["Boot istanza GPU", "Verifica disponibilità", "Montaggio storage"],
  },
  {
    id: "a1111",
    title: "Avvio A1111",
    subtitle: "Caricamento interfaccia e checkpoint Stellar Bara da CivitAI.",
    icon: Cpu,
    agent: "A1111",
    detail: ["Avvio webui A1111", "Checkpoint Stellar Bara", "Configurazione sampler"],
  },
  {
    id: "generate",
    title: "Generazione Set",
    subtitle: "Prompt di Grok → immagini, con filtraggio automatico delle foto non abbastanza belle.",
    icon: Sparkles,
    agent: "Stable Diffusion",
    detail: ["Prompt dinamici da Grok", "Generazione batch", "Filtraggio qualità"],
  },
  {
    id: "shutdown",
    title: "Chiusura Pod + Download",
    subtitle: "Il pod viene spento e le foto scaricate in locale, divise per giorno e ciclo di generazione.",
    icon: Download,
    agent: "RunPod",
    detail: ["Spegnimento pod", "Download /gg/ciclo/", "Libero storage"],
  },
  {
    id: "monitor",
    title: "Monitoraggio Concorrenti",
    subtitle: "Continuo e ottimizzato: prezzi, orari, descrizioni, personaggi, hashtag, foto, angolazioni, stili, frequenza.",
    icon: Eye,
    agent: "Grok",
    detail: ["Scrape concorrenti", "Aggiornamento metriche", "Suggerimenti"],
  },
  {
    id: "crosspost",
    title: "Posting Trasversale",
    subtitle: "Pubblicazione coordinata su X, Reddit e RedGifs con descrizioni e hashtag adattati.",
    icon: Share2,
    agent: "Pipeline",
    detail: ["Pubblicazione X", "Cross-post Reddit", "Upload RedGifs"],
  },
  {
    id: "patreon",
    title: "Pubblicazione Patreon",
    subtitle: "Il set completo viene pubblicato automaticamente su Patreon.",
    icon: Crown,
    agent: "Patreon",
    detail: ["Upload set completo", "Impostazione tier", "Pubblicazione post"],
  },
];

const PLATFORM_MAP = { crosspost: ["x", "reddit", "redgifs"], patreon: ["patreon"] };

export default function AutomationFlow() {
  const [mode, setMode] = useState("auto");
  const [statuses, setStatuses] = useState(() => Object.fromEntries(STAGES.map((s) => [s.id, "idle"])));
  const [running, setRunning] = useState(false);
  const [activePlatforms, setActivePlatforms] = useState([]);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  const reset = useCallback(() => {
    clearTimers();
    setStatuses(Object.fromEntries(STAGES.map((s) => [s.id, "idle"])));
    setActivePlatforms([]);
    setRunning(false);
  }, []);

  const setStatus = (id, st) => setStatuses((prev) => ({ ...prev, [id]: st }));

  const runFrom = useCallback(
    (startIndex) => {
      let i = startIndex;
      const stepDuration = 1600;

      const runStep = () => {
        if (i >= STAGES.length) {
          setRunning(false);
          return;
        }
        const stage = STAGES[i];
        setStatus(stage.id, "running");

        const finish = () => {
          setStatus(stage.id, "done");
          if (PLATFORM_MAP[stage.id]) {
            setActivePlatforms((prev) => [...new Set([...prev, ...PLATFORM_MAP[stage.id]])]);
          }
          i += 1;
          if (mode === "semi" && stage.id === "generate") {
            setRunning(false);
            return;
          }
          if (mode === "manual") {
            setRunning(false);
            return;
          }
          timers.current.push(setTimeout(runStep, 350));
        };

        timers.current.push(setTimeout(finish, stepDuration));
      };
      runStep();
    },
    [mode]
  );

  const handleRun = () => {
    if (running) return;
    const nextIndex = STAGES.findIndex((s) => statuses[s.id] !== "done");
    if (nextIndex === -1) {
      reset();
      timers.current.push(setTimeout(() => runFrom(0), 50));
      return;
    }
    setRunning(true);
    runFrom(nextIndex);
  };

  const handleAdvance = () => {
    const nextIndex = STAGES.findIndex((s) => statuses[s.id] === "running");
    if (nextIndex === -1) return;
    setStatus(STAGES[nextIndex].id, "done");
    if (PLATFORM_MAP[STAGES[nextIndex].id]) {
      setActivePlatforms((prev) => [...new Set([...prev, ...PLATFORM_MAP[STAGES[nextIndex].id]])]);
    }
    const after = nextIndex + 1;
    if (after >= STAGES.length) {
      setRunning(false);
      return;
    }
    setStatus(STAGES[after].id, "running");
  };

  const currentStage = STAGES.find((s) => statuses[s.id] === "running");
  const doneCount = Object.values(statuses).filter((s) => s === "done").length;
  const progress = Math.round((doneCount / STAGES.length) * 100);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
      {/* Ambient glow background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-48 left-1/4 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/15 blur-[140px]" />
        <div className="absolute top-1/3 -right-32 h-[26rem] w-[26rem] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
        {/* Header */}
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-300/80">fembux · pipeline</span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
            Flusso d'<span className="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">Automazione</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/50 leading-relaxed">
            Generazione AI → filtraggio qualità → posting trasversale → Patreon. Tutto automatico, dalla scelta del personaggio alla pubblicazione del set.
          </p>

          {/* Status row */}
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 backdrop-blur-xl">
              <Activity className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs text-white/70">
                {running ? "In esecuzione" : doneCount === STAGES.length ? "Completato" : "In attesa"}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${running ? "bg-fuchsia-400 animate-pulse" : doneCount === STAGES.length ? "bg-emerald-400" : "bg-white/30"}`} />
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 backdrop-blur-xl">
              <div className="h-1.5 w-24 sm:w-40 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-400 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-white/60 tabular-nums">{progress}%</span>
            </div>
          </div>
        </header>

        {/* Control bar (full width, open) */}
        <div className="mb-8 sm:mb-10">
          <StartModeControl
            mode={mode}
            onModeChange={setMode}
            running={running}
            onRun={handleRun}
            onReset={reset}
            currentStage={currentStage?.title}
          />
        </div>

        {/* Main flow timeline (full width, spacious) */}
        <section className="mb-8 sm:mb-10 rounded-[2rem] border border-white/10 bg-white/[0.02] p-5 sm:p-7 lg:p-9 backdrop-blur-2xl shadow-[0_8px_50px_-20px_rgba(0,0,0,0.6)]">
          <div className="mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/50">Tappe del flusso</span>
          </div>
          <div>
            {STAGES.map((stage, i) => (
              <FlowStepCard
                key={stage.id}
                stage={stage}
                index={i}
                isLast={i === STAGES.length - 1}
                status={statuses[stage.id]}
                mode={mode}
                onAdvance={handleAdvance}
                canAdvance={running}
              />
            ))}
          </div>
        </section>

        {/* Bottom grid: monitoring + platforms */}
        <section className="grid gap-5 sm:gap-6 md:grid-cols-2">
          <MonitoringPanel />
          <PlatformPanel activeIds={activePlatforms} />
        </section>

        <footer className="mt-10 sm:mt-14 border-t border-white/[0.06] pt-6 text-center">
          <p className="text-[11px] text-white/30">
            Interfaccia privata · flusso di automazione fembux · RunPod 4090 · A1111 · Stellar Bara · Grok
          </p>
        </footer>
      </div>
    </div>
  );
}