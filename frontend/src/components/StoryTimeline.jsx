import React from 'react';
import { GitBranch, Building2, Calendar, FileText, ChevronRight, Sparkles } from 'lucide-react';

export default function StoryTimeline({ threads, onSelectSignal }) {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 shadow-2xl flex items-center justify-between border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <span>Narrative Threading — Emerging Story Clusters</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesizes weak, scattered signals into unified strategic stories using vector embeddings & cosine clustering.
          </p>
        </div>
        <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 font-semibold shadow-inner">
          Rolling 30-Day Windows
        </span>
      </div>

      {/* Grid of Story Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {threads.map((t) => (
          <div 
            key={t.id}
            className="glass-panel rounded-2xl p-6 shadow-2xl transition-all flex flex-col justify-between glass-card-hover border border-white/10 hover:border-purple-500/40"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 shadow-sm">
                  <Building2 className="w-3.5 h-3.5" />
                  {t.competitor}
                </span>

                <span className="text-xs text-slate-300 font-mono bg-[#0B0F19] px-2.5 py-0.5 rounded-full border border-white/10">
                  {t.signal_count} Connected Signals
                </span>
              </div>

              {/* Thread Title */}
              <h3 className="text-base font-bold text-white mb-2.5 leading-snug tracking-tight">
                {t.title}
              </h3>

              {/* AI Narrative Synthesis */}
              <div className="bg-[#0B0F19]/90 border border-white/10 rounded-xl p-4 mb-4 shadow-inner">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>AI-Synthesized Narrative</span>
                </span>

                <p className="text-xs text-slate-200 leading-relaxed font-sans font-normal italic">
                  "{t.narrative_summary}"
                </p>
              </div>
            </div>

            {/* Sub-signals timeline list */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2 font-mono">
                Clustered Underlying Signals:
              </span>
              <div className="space-y-2">
                {t.signals.map((sig) => (
                  <div
                    key={sig.id}
                    onClick={() => onSelectSignal(sig)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19]/60 hover:bg-[#0B0F19] border border-white/10 transition-all cursor-pointer text-xs group"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors block truncate">
                        {sig.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {sig.source} • {sig.published_date}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

