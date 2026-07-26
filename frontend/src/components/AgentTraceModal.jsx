import React from 'react';
import { X, Search, BarChart3, Target, CheckCircle2, AlertCircle, ArrowDown, Bot, Sparkles } from 'lucide-react';

export default function AgentTraceModal({ signal, onClose }) {
  if (!signal) return null;

  const trace = signal.trace;
  const scout = trace?.scout_output || { is_relevant: true, reason: signal.scout_reason || "Relevance verified." };
  const analyst = trace?.analyst_output || {
    relevance_score: signal.relevance_score,
    threat_level: signal.threat_level,
    competitors: [signal.competitor],
    therapeutic_area: signal.therapeutic_area,
    rationale: signal.rationale
  };
  const strategist = trace?.strategist_output || {
    recommended_action: signal.recommended_action || "Monitor",
    justification: signal.action_justification || "Standard monitoring protocol."
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm">
                <Bot className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">Multi-Agent Reasoning Trace</h2>
              {trace?.is_fallback && (
                <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  Rule-based Fallback Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Scout → Analyst → Strategist step-by-step reasoning log for signal #{signal.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Signal Title & Meta Banner */}
        <div className="px-6 py-4 bg-[#0B0F19]/90 border-b border-white/10">
          <h3 className="text-sm font-bold text-slate-100 mb-1.5 leading-snug">{signal.title}</h3>
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap font-mono">
            <span>Competitor: <strong className="text-cyan-400 font-semibold">{signal.competitor}</strong></span>
            <span>•</span>
            <span>Source: <strong className="text-slate-200">{signal.source}</strong></span>
            <span>•</span>
            <span>Published: <strong className="text-slate-200">{signal.published_date}</strong></span>
          </div>
        </div>

        {/* Multi-Agent Reasoning Chain Steps */}
        <div className="p-6 space-y-6">
          
          {/* STEP 1: Scout Agent */}
          <div className="relative pl-8 border-l-2 border-cyan-500/40">
            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-500/30">
              1
            </div>
            
            <div className="bg-[#0B0F19]/90 border border-white/10 rounded-xl p-4.5 shadow-lg">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Step 1: Scout Agent (Binary Relevance Filter)</h4>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  scout.is_relevant ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {scout.is_relevant ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {scout.is_relevant ? 'PASSED RELEVANCE' : 'REJECTED'}
                </span>
              </div>
              <p className="text-xs text-slate-300 bg-[#131B2E] p-3 rounded-lg border border-white/10 leading-relaxed font-mono">
                {scout.reason}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-5 h-5 text-cyan-500/50 animate-bounce" />
          </div>

          {/* STEP 2: Analyst Agent */}
          <div className="relative pl-8 border-l-2 border-indigo-500/40">
            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/30">
              2
            </div>

            <div className="bg-[#0B0F19]/90 border border-white/10 rounded-xl p-4.5 shadow-lg">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">Step 2: Analyst Agent (Scoring & Threat Classification)</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-200 bg-[#131B2E] px-2.5 py-0.5 rounded-full border border-white/10">
                    Score: {analyst.relevance_score}/10
                  </span>
                  <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    analyst.threat_level === 'high' ? 'threat-badge-high' :
                    analyst.threat_level === 'medium' ? 'threat-badge-medium' : 'threat-badge-low'
                  }`}>
                    {analyst.threat_level} Threat
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex gap-2 font-mono">
                  <span className="text-slate-400 shrink-0 font-medium">Therapeutic Sub-Area:</span>
                  <span className="text-cyan-300 font-semibold">{analyst.therapeutic_area}</span>
                </div>
                <div className="bg-[#131B2E] p-3 rounded-lg border border-white/10 leading-relaxed font-mono">
                  <span className="text-slate-400 font-sans block mb-1 font-semibold">Technical Rationale:</span>
                  {analyst.rationale}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-5 h-5 text-purple-500/50 animate-bounce" />
          </div>

          {/* STEP 3: Strategist Agent */}
          <div className="relative pl-8 border-l-2 border-purple-500/40">
            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/30">
              3
            </div>

            <div className="bg-[#0B0F19]/90 border border-white/10 rounded-xl p-4.5 shadow-lg">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Step 3: Strategist Agent (Action Recommendation)</h4>
                </div>
                <span className="text-xs font-bold text-purple-200 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 shadow-sm">
                  {strategist.recommended_action}
                </span>
              </div>

              <div className="bg-[#131B2E] p-3 rounded-lg border border-white/10 text-xs text-slate-300 leading-relaxed font-mono">
                <span className="text-slate-400 font-sans block mb-1 font-semibold">Strategic Justification:</span>
                {strategist.justification}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-5 h-5 text-emerald-500/50 animate-bounce" />
          </div>

          {/* STEP 4: Exposure & Routing Engine */}
          <div className="relative pl-8 border-l-2 border-emerald-500/40">
            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-500/30">
              4
            </div>

            <div className="bg-[#0B0F19]/90 border border-emerald-500/30 rounded-xl p-4.5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Step 4: Exposure & Operational Decision Routing Engine</h4>
                </div>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                  {signal.exposure_routing?.routing_owner || 'Medical Affairs'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#131B2E] p-3 rounded-lg border border-white/10 font-mono space-y-1">
                  <span className="text-slate-400 block font-sans font-semibold mb-1">Franchise & Exposure:</span>
                  <p className="text-slate-200">Overlap: <strong className="text-cyan-300">{signal.exposure_routing?.franchise_overlap || 'Obesity'}</strong></p>
                  <p className="text-slate-200">Exposure Bucket: <strong className="text-amber-400">{signal.exposure_routing?.exposure_bucket || 'Low'}</strong></p>
                  <p className="text-slate-300 text-[11px] pt-1">{signal.exposure_routing?.exposure_range_illustrative}</p>
                  {signal.exposure_routing?.exposure_source_citation && (
                    <p className="text-[10px] text-cyan-400 pt-0.5">{signal.exposure_routing.exposure_source_citation}</p>
                  )}
                </div>

                <div className="bg-[#131B2E] p-3 rounded-lg border border-white/10 font-mono space-y-1">
                  <span className="text-slate-400 block font-sans font-semibold mb-1">Routing & Deadline Cue:</span>
                  <p className="text-slate-200">Desk Owner: <strong className="text-purple-300">{signal.exposure_routing?.routing_owner}</strong></p>
                  <p className="text-amber-300 text-[11px] pt-1 leading-snug">{signal.exposure_routing?.routing_deadline_note}</p>
                </div>
              </div>

              <div className="bg-[#131B2E] p-3 rounded-lg border border-white/10 text-xs font-mono text-slate-300">
                <span className="text-slate-400 block font-sans font-semibold mb-0.5">Scoring Methodology Note:</span>
                {signal.exposure_routing?.exposure_methodology_note}
              </div>
            </div>
          </div>


        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0B0F19]/90 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            Close Reasoning Trace
          </button>
        </div>

      </div>
    </div>
  );
}

