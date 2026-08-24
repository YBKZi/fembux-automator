import React, { useState, useRef, useCallback } from "react";
import {
  TrendingUp, Power, Cpu, Sparkles, Download, Eye, Share2, Crown,
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
    detail: ["Lettura Google Trends", "Selezione personaggio trending", "Bozza concetto visivo"],
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
    detail: ["Avvio webui Automatic1111", "Caricamento checkpoint Stellar Bara", "Configurazione sampler"],
  },
  {
    id: "generate",
    title: "Generazione Set",
    subtitle: "Prompt di Grok → immagini, con filtraggio automatico delle foto non abbastanza belle.",
    icon: Sparkles,
    agent: "Stable Diffusion",
    detail: ["Prompt dinamici da Grok", "Generazione batch", "Filtraggio qualità (scarto < soglia)"],
  },
  {
    id: "shutdown",
    title: "Chiusura Pod + Download",
    subtitle: "Il pod viene spento e le foto scaricate in locale, divise per giorno e ciclo di generazione.",
    icon: Download,
    agent: "RunPod",
    detail: ["Spegnimento pod", "Download organizzato /gg/ciclo/", "Libero storage cloud"],
  },
  {
    id: "monitor",
    title: "Monitoraggio Concorrenti",
    subtitle: "Continuo e ad alta ottimizzazione: prezzi, orari, descrizioni, personaggi, hashtag, foto, angolazioni, stili, frequenza.",
    icon: Eye,
    agent: "Grok",
    detail: ["Scrape profili concorrenti", "Aggiornamento metriche", "Suggerimenti ottimizzazione"],
  },
  {
    id: "crosspost",
    title: "Posting Trasversale",
    subtitle: "Pubblicazione coordinata su X, Reddit e RedGifs con descrizioni e hashtag adattati per piattaforma.",
    icon: Share2,
    agent: "Pipeline",
    detail: ["Pubblicazione X + descrizione", "Cross-post Reddit", "Upload RedGifs"],
  },
  {
    id: "patreon",
    title: "Pubblicazione Patreon",
    subtitle: "Il set completo viene pubblicato automaticamente su Patreon.",
    icon: Crown,
    agent: "Patreon",
    detail: ["Upload set completo", "Impostazione tier/prezzo", "Pubblicazione post"],
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
            // checkpoint pause in semi-auto after generation
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
    // resume from first non-done stage
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
    // manual mode: advance to next stage
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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] uppercase tracking-[0.25em] text-fuchsia-300/70">fembux · pipeline</span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Flusso d'Automazione
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/50 leading-relaxed">
            Generazione AI → filtraggio qualità → posting trasversale → Patreon. Tutto automatico, dalla scelta del personaggio alla pubblicazione del set.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${running ? "bg-fuchsia-400 animate-pulse" : doneCount === STAGES.length ? "bg-emerald-400" : "bg-white/30"}`} />
              <span className="text-xs text-white/60">
                {running ? "In esecuzione" : doneCount === STAGES.length ? "Completato" : "In attesa"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-40 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-400 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-white/50 tabular-nums">{progress}%</span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left column */}
          <aside className="space-y-6">
            <StartModeControl
              mode={mode}
              onModeChange={setMode}
              running={running}
              onRun={handleRun}
              onReset={reset}
              currentStage={currentStage?.title}
            />
            <PlatformPanel activeIds={activePlatforms} />
          </aside>

          {/* Main flow */}
          <main className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-7 backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">Tappe del flusso</span>
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
            </div>
            <MonitoringPanel />
          </main>
        </div>

        <footer className="mt-12 border-t border-white/[0.06] pt-6 text-center">
          <p className="text-[11px] text-white/30">
            Interfaccia privata · flusso di automazione fembux · RunPod 4090 · A1111 · Stellar Bara · Grok
          </p>
        </footer>
      </div>
    </div>
  );
}