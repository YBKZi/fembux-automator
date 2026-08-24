import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Power, Cpu, Twitter, MessageCircle, Film, Crown, Save, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ServiceCard from "@/components/settings/ServiceCard";

const SECTIONS = [
  {
    id: "runpod", title: "RunPod", icon: Power, description: "GPU on-demand",
    fields: [
      { key: "runpod_api_key", label: "API Key" },
      { key: "runpod_pod_id", label: "Pod ID" },
      { key: "a1111_base_url", label: "A1111 URL (proxy pubblico)", placeholder: "https://xxx-7860.proxy.runpod.net" }
    ]
  },
  {
    id: "a1111", title: "A1111 · Stable Diffusion", icon: Cpu, description: "Parametri generazione",
    fields: [
      { key: "a1111_checkpoint", label: "Checkpoint", placeholder: "stellarBaraXL_v10" },
      { key: "a1111_negative_prompt", label: "Negative prompt" },
      { key: "a1111_steps", label: "Steps", type: "number" },
      { key: "a1111_cfg", label: "CFG", type: "number" },
      { key: "a1111_batch_size", label: "Batch / prompt", type: "number" }
    ]
  },
  {
    id: "x", title: "X (Twitter)", icon: Twitter, description: "OAuth 1.0a user context",
    fields: [
      { key: "x_consumer_key", label: "Consumer Key" },
      { key: "x_consumer_secret", label: "Consumer Secret" },
      { key: "x_access_token", label: "Access Token" },
      { key: "x_access_token_secret", label: "Access Token Secret" }
    ]
  },
  {
    id: "reddit", title: "Reddit", icon: MessageCircle, description: "OAuth2 password grant",
    fields: [
      { key: "reddit_client_id", label: "Client ID" },
      { key: "reddit_client_secret", label: "Client Secret" },
      { key: "reddit_username", label: "Username" },
      { key: "reddit_password", label: "Password", type: "password" },
      { key: "reddit_subreddit", label: "Subreddit" }
    ]
  },
  { id: "redgifs", title: "RedGifs", icon: Film, description: "Token API", fields: [{ key: "redgifs_token", label: "API Token" }] },
  { id: "patreon", title: "Patreon", icon: Crown, description: "Creator API", fields: [{ key: "patreon_access_token", label: "Access Token" }, { key: "patreon_campaign_id", label: "Campaign ID" }] }
];

export default function Settings() {
  const [cfgId, setCfgId] = useState(null);
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const list = await base44.entities.IntegrationSetting.filter({ created_by_id: me.id });
        let c = list[0];
        if (!c) c = await base44.entities.IntegrationSetting.create({});
        setCfgId(c.id);
        setValues(c);
      } catch {}
    })();
  }, []);

  const onChange = useCallback((k, v) => setValues((p) => ({ ...p, [k]: v })), []);

  const save = async () => {
    if (!cfgId) return;
    setSaving(true);
    try {
      const patch = {};
      SECTIONS.forEach((s) => s.fields.forEach((f) => (patch[f.key] = values[f.key])));
      await base44.entities.IntegrationSetting.update(cfgId, patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-48 left-1/4 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[130px]" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-violet-600/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
        <header className="mb-5 flex items-center gap-3">
          <Link to="/" className="rounded-lg border border-white/10 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/70">fembux</span>
            <h1 className="font-display text-2xl font-semibold tracking-tight leading-tight">Impostazioni</h1>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="ml-auto flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-sm font-medium shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Salvato" : saving ? "…" : "Salva"}
          </button>
        </header>

        <p className="mb-4 text-[11px] text-white/45 leading-relaxed">
          Inserisci le credenziali dei servizi. Il flusso d'automazione le usa per chiamare davvero RunPod, A1111 e le piattaforme di posting. I dati sono salvati sul tuo account.
        </p>

        <div className="grid gap-3">
          {SECTIONS.map((s) => (
            <ServiceCard
              key={s.id}
              title={s.title}
              description={s.description}
              icon={s.icon}
              fields={s.fields}
              values={values}
              onChange={onChange}
              status={s.fields.some((f) => values[f.key]) ? "ok" : "todo"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}