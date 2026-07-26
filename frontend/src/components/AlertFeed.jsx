import React from 'react';
import { ExternalLink, Brain, ArrowRight, Calendar, Building2, ShieldAlert, Sparkles } from 'lucide-react';

export default function AlertFeed({ signals, onSelectSignal }) {
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl flex flex-col h-full border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Brain className="w-4 h-4" />
            </div>
            <span>Competitive Intelligence Alert Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time scored signals with explainable multi-agent reasoning trace
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 font-semibold shadow-inner">
          {signals.length} Signals
        </span>
      </div>

      {/* Scrollable feed */}
      <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 max-h-[620px]">
        {signals.map((sig) => {
          const badgeClass =
            sig.threat_level === 'high'
              ? 'threat-badge-high'
              : sig.threat_level === 'medium'
              ? 'threat-badge-medium'
              : 'threat-badge-low';

          return (
            <div
              key={sig.id}
              onClick={() => onSelectSignal(sig)}
              className="group bg-[#0B0F19]/90 border border-white/10 hover:border-cyan-500/40 p-4.5 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-0.5 glass-card-hover"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 text-[11px] rounded-full uppercase tracking-wider ${badgeClass}`}>
                    {sig.threat_level} threat ({sig.relevance_score}/10)
                  </span>

                  {/* Exposure Badge */}
                  {sig.exposure_routing && (
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border ${
                      sig.exposure_routing.exposure_bucket === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      sig.exposure_routing.exposure_bucket === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      Exposure: {sig.exposure_routing.exposure_bucket}
                    </span>
                  )}

                  {/* Owner Desk Badge */}
                  {sig.exposure_routing?.routing_owner && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-300 bg-purple-500/20 rounded-full border border-purple-500/30">
                      {sig.exposure_routing.routing_owner}
                    </span>
                  )}

                  <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    <Building2 className="w-3 h-3" />
                    {sig.competitor}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 bg-[#131B2E] px-2 py-0.5 rounded border border-white/10">
                    {sig.source}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {sig.published_date}
                </span>
              </div>


              {/* Title & Summary */}
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-1.5 leading-snug line-clamp-2">
                {sig.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3.5 leading-relaxed font-normal">
                {sig.summary}
              </p>

              {/* Actionable Rationale & Agent Trace CTA */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300 truncate max-w-[70%]">
                  <span className="text-cyan-400 font-semibold shrink-0 text-[11px]">Recommended Action:</span>
                  <span className="truncate bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg text-cyan-200 text-[11px] font-medium shadow-sm">
                    {sig.recommended_action || "Monitor"}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform text-[11px]">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>View Agent Trace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

