import React from "react";
import { Sparkles, Loader2, Hash, User } from "lucide-react";

export default function GrokBriefPanel({ brief, loading }) {
  return (
    <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/[0.05] p-4 backdrop-blur-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
        <span className="text-xs font-medium text-white/80">Brief Grok</span>
        {loading && <Loader2 className="w-3 h-3 text-fuchsia-300 animate-spin ml-auto" />}
      </div>
      {loading && !brief ? (
        <p className="text-xs text-white/40">Generazione prompt e hashtag di tendenza…</p>
      ) : brief ? (
        <div className="space-y-3">
          {brief.character && (
            <div className="flex items-center gap-1.5 text-xs">
              <User className="w-3 h-3 text-white/40 shrink-0" />
              <span className="text-white/90 font-medium">{brief.character}</span>
              {brief.vibe && <span className="text-white/40">· {brief.vibe}</span>}
            </div>
          )}
          {brief.prompts?.length > 0 && (
            <ul className="space-y-1.5">
              {brief.prompts.map((p, i) => (
                <li key={i} className="text-[11px] text-white/55 leading-snug line-clamp-3">
                  <span className="text-fuchsia-300/60 mr-1 tabular-nums">0{i + 1}</span>
                  {p}
                </li>
              ))}
            </ul>
          )}
          {brief.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {brief.hashtags.map((h, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60"
                >
                  <Hash className="w-2.5 h-2.5" />
                  {h.replace(/^#/, "")}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}