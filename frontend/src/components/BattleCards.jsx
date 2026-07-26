import React from 'react';
import { ShieldAlert, Building, Dna, Rocket, Sparkles, Award } from 'lucide-react';

export default function BattleCards({ cards }) {
  const novoCard = cards.find(c => c.competitor === "Novo Nordisk");
  const competitorCards = cards.filter(c => c.competitor !== "Novo Nordisk");

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl flex items-center justify-between border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Building className="w-5 h-5" />
            </div>
            <span>Competitor Intelligence Battle Cards</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Executive battle card summaries highlighting lead assets, threat levels, key moves, and strategic positions
          </p>
        </div>
      </div>

      {/* Host Franchise Baseline Section (Novo Nordisk) */}
      {novoCard && (
        <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/30 via-[#131B2E] to-blue-950/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-cyan-300">
              Host Franchise Baseline (Internal Benchmark)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-black text-white mb-1">{novoCard.canonical_name}</h3>
              <div className="bg-[#0B0F19]/90 border border-cyan-500/30 p-3.5 rounded-xl text-xs space-y-2 font-mono">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Dna className="w-4 h-4 text-cyan-400" />
                  <span>{novoCard.lead_asset}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{novoCard.mechanism}</p>
                <span className="inline-block px-2.5 py-0.5 bg-cyan-500/20 text-cyan-200 text-[10px] font-bold rounded-lg border border-cyan-500/30">
                  Stage: {novoCard.pipeline_stage}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-200 block mb-2 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-amber-400" /> Key Portfolio Expansion:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {novoCard.recent_moves.map((move, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{move}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-200 block mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Core Strategic Position:
              </span>
              <p className="text-xs text-slate-300 italic bg-[#0B0F19]/80 p-3 rounded-xl border border-white/10 leading-relaxed">
                "{novoCard.market_position}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Competitor Grid */}
      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400" />
          <span>Active Competitor Battle Cards ({competitorCards.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitorCards.map((c) => (
            <div 
              key={c.id}
              className={`glass-panel rounded-2xl p-6 shadow-2xl flex flex-col justify-between transition-all glass-card-hover border ${
                c.threat_assessment === 'CRITICAL' ? 'border-red-500/50 bg-red-950/10' : 'border-white/10'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-bold text-white tracking-tight">{c.canonical_name}</span>
                  <span className={`px-3 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                    c.threat_assessment === 'CRITICAL' ? 'threat-badge-high' :
                    c.threat_assessment === 'HIGH' ? 'threat-badge-medium' :
                    'bg-slate-700/50 text-slate-300 border border-white/10'
                  }`}>
                    {c.threat_assessment} Threat
                  </span>
                </div>

                {/* Lead Asset & Mechanism */}
                <div className="bg-[#0B0F19]/90 border border-white/10 p-3.5 rounded-xl mb-4 space-y-2 text-xs shadow-inner">
                  <div className="flex items-center gap-2 text-slate-100 font-bold">
                    <Dna className="w-4 h-4 text-cyan-400" />
                    <span>{c.lead_asset}</span>
                  </div>
                  <p className="text-slate-400 font-mono text-[11px] leading-relaxed">{c.mechanism}</p>
                  <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-300 text-[10px] font-bold rounded-lg border border-cyan-500/30">
                    Stage: {c.pipeline_stage}
                  </span>
                </div>

                {/* Recent Moves */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-200 block mb-2 flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-amber-400" />
                    Recent Strategic Moves:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {c.recent_moves.map((move, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{move}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Threats */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-200 block mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    Key Threats / Advantages:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {c.key_threats.map((threat, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{threat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Market Position Summary */}
              <div className="border-t border-white/10 pt-3.5 text-xs text-slate-300 italic bg-[#0B0F19]/60 p-3 rounded-xl border border-white/5 font-normal">
                "{c.market_position}"
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
