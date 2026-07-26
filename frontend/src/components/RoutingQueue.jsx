import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Clock, 
  ShieldAlert, 
  Building2, 
  Layers, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles,
  Info,
  DollarSign,
  Filter,
  UserCheck
} from 'lucide-react';

export default function RoutingQueue({ signals, onSelectSignal }) {
  const [selectedOwner, setSelectedOwner] = useState('ALL');

  const owners = [
    { id: 'ALL', label: 'All Internal Desks' },
    { id: 'Market Access', label: 'Market Access' },
    { id: 'Commercial Strategy', label: 'Commercial Strategy' },
    { id: 'BD&L (Business Development & Licensing)', label: 'BD&L' },
    { id: 'Medical Affairs', label: 'Medical Affairs' }
  ];

  // Filter signals by owner
  const filteredSignals = useMemo(() => {
    if (selectedOwner === 'ALL') return signals;
    return signals.filter(s => {
      const owner = s.exposure_routing?.routing_owner || 'Medical Affairs';
      return owner.toLowerCase().includes(selectedOwner.toLowerCase().split(' ')[0]);
    });
  }, [signals, selectedOwner]);

  const getOwnerBadgeStyle = (owner = '') => {
    if (owner.includes('Market Access')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
    if (owner.includes('Commercial Strategy')) {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
    if (owner.includes('BD&L')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  const getExposureBadgeStyle = (bucket = 'Low') => {
    if (bucket === 'High') {
      return 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm shadow-red-500/20';
    }
    if (bucket === 'Medium') {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    }
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 bg-gradient-to-r from-[#0F172A] via-[#131B2E] to-[#0B0F19] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20">
              <Send className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Operational Exposure & Decision Routing Queue
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Replaces raw relevance scores with <strong>Franchise Overlap</strong>, transparent <strong>Exposure Calculations</strong>, and <strong>Automated Internal Desk Routing</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            {filteredSignals.length} Actionable Work Items
          </span>
        </div>
      </div>

      {/* Owner Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1 font-mono">
          <Filter className="w-3.5 h-3.5 text-cyan-400" /> Owning Desk:
        </span>
        {owners.map(o => (
          <button
            key={o.id}
            onClick={() => setSelectedOwner(o.id)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 font-mono ${
              selectedOwner === o.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40 scale-105'
                : 'bg-[#131B2E] text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Routed Signal Items Queue */}
      <div className="space-y-4">
        {filteredSignals.map(sig => {
          const exp = sig.exposure_routing || {};
          const ownerBadge = getOwnerBadgeStyle(exp.routing_owner);
          const exposureBadge = getExposureBadgeStyle(exp.exposure_bucket);

          return (
            <div 
              key={sig.id}
              className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 bg-[#0F172A]/80 hover:border-cyan-500/30 transition-all space-y-4"
            >
              
              {/* Top Row: Owner Desk, Overlap, Exposure Bucket, Date */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5 flex-wrap">
                  
                  {/* Owning Desk Badge */}
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold font-mono border flex items-center gap-1.5 shadow-md ${ownerBadge}`}>
                    <UserCheck className="w-3.5 h-3.5" />
                    Desk Owner: {exp.routing_owner || 'Medical Affairs'}
                  </span>

                  {/* Exposure Bucket */}
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider border ${exposureBadge}`}>
                    Exposure: {exp.exposure_bucket || 'Low'}
                  </span>

                  {/* Franchise Overlap Tag */}
                  <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-mono">
                    Overlap: <strong>{exp.franchise_overlap || 'Obesity'}</strong>
                  </span>
                </div>

                <span className="text-xs font-mono text-slate-400">{sig.published_date}</span>
              </div>

              {/* Middle Row: Title & Summary */}
              <div>
                <h3 className="text-base font-bold text-white mb-1.5 leading-snug hover:text-cyan-300 cursor-pointer transition-colors" onClick={() => onSelectSignal(sig)}>
                  {sig.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal">
                  {sig.summary}
                </p>
              </div>

              {/* Bottom Row: Deadline Note & Reasoning Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                
                {/* Deadline Cue Box */}
                <div className="bg-[#131B2E] border border-amber-500/30 p-3 rounded-xl text-xs flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block tracking-wider mb-0.5">
                      Action Deadline & Operational Cue
                    </span>
                    <p className="text-slate-200 font-medium">
                      {exp.routing_deadline_note || 'Monitor signal for standard medical updates.'}
                    </p>
                  </div>
                </div>

                {/* Exposure Calculation & Citation Box */}
                <div className="bg-[#131B2E] border border-cyan-500/30 p-3 rounded-xl text-xs flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-cyan-300 block tracking-wider">
                      Exposure Methodology Note
                    </span>
                    <p className="text-slate-300 text-[11px] font-mono leading-tight">
                      {exp.exposure_methodology_note || 'Qualitative weights evaluation'}
                    </p>
                    
                    {/* Sourced Range or Qualitative Disclaimer */}
                    <div className="text-[11px] text-cyan-200/90 font-mono pt-1">
                      {exp.exposure_range_illustrative}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => onSelectSignal(sig)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                >
                  <span>Inspect Full Agent Trace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
