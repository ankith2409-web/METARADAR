import React from 'react';
import { Award, Clock, CheckCircle2, AlertTriangle, FileText, ExternalLink, Sparkles } from 'lucide-react';

export default function RetroactiveValidation({ report }) {
  // Fail closed guardrail: do not render unverified claim if report or source citations missing
  if (!report || !report.source_citations || report.source_citations.length === 0) return null;

  const sourceCitations = report.source_citations;

  return (
    <div className="space-y-6">
      
      {/* Hero Proof Banner */}
      <div className="glass-panel border border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden bg-gradient-to-r from-cyan-950/30 via-[#131B2E] to-blue-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20">
                <Award className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-cyan-300">
                Early Warning Track Record
              </span>
            </div>
            
            <h2 className="text-xl font-black text-white mb-2 tracking-tight">
              {report.title}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-normal mb-3">
              {report.summary}
            </p>

            {/* Sourced Evidence Citation Links */}
            <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap pt-2 border-t border-white/10 font-mono">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-semibold text-slate-300">Verified Sources:</span>
              {sourceCitations.map((c, i) => (
                <a 
                  key={i} 
                  href={c.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-[#131B2E] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all flex items-center gap-1 text-[11px]"
                >
                  <span>{c.label}</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Lead Time KPI Box */}
          <div className="bg-[#0B0F19]/90 border border-emerald-500/40 p-5 rounded-2xl text-center shrink-0 min-w-[220px] shadow-2xl">
            <span className="text-xs font-semibold text-slate-400 block mb-1.5 font-mono">
              Early Warning Lead Time
            </span>
            <div className="text-4xl font-black text-emerald-400 flex items-center justify-center gap-1.5 tracking-tight">
              <Clock className="w-8 h-8 text-emerald-400" />
              <span>{report.lead_time_days}</span>
              <span className="text-lg text-emerald-300 font-normal">Days</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1.5 font-mono">
              Flagged May 22 vs Public Date Jun 15
            </span>
          </div>
        </div>
      </div>


      {/* Methodology & Timeline */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-white/10">
        <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Pre-Announcement Signal Sequence & Lead Time Verification</span>
        </h3>

        <div className="relative pl-6 space-y-6 border-l-2 border-cyan-500/30">
          {report.historical_timeline?.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className={`absolute -left-[31px] top-2 w-4 h-4 rounded-full border-2 bg-[#0B0F19] shadow-sm ${
                item.threat_level === 'high' ? 'border-red-500 bg-red-500 shadow-red-500/50' : 'border-cyan-500 bg-cyan-500'
              }`} />

              <div className="bg-[#0B0F19]/90 border border-white/10 p-4.5 rounded-xl shadow-lg glass-card-hover">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-mono text-cyan-300 font-bold">{item.date}</span>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    item.threat_level === 'high' ? 'threat-badge-high' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                  }`}>
                    {item.signal_type}
                  </span>
                </div>
                
                <h4 className="text-sm font-bold text-slate-100 mb-1 leading-snug">{item.title}</h4>
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-2.5 mt-2 font-mono">
                  <span>Source: {item.source}</span>
                  <span className="font-semibold text-slate-200">Threat Score: {item.score}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
