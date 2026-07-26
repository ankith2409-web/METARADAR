import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Filter, ChevronRight, FileText, Search, Zap, X, ShieldAlert } from 'lucide-react';

export default function AlertFeed({ signals = [], onSelectSignal }) {
  const [selectedThreat, setSelectedThreat] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [filterText, setFilterText] = useState('');

  const filteredSignals = signals.filter((sig) => {
    if (selectedThreat !== 'ALL' && sig.threat_level?.toUpperCase() !== selectedThreat) return false;
    if (selectedChannel !== 'ALL' && sig.channel?.toUpperCase() !== selectedChannel) return false;
    if (filterText && !sig.title?.toLowerCase().includes(filterText.toLowerCase()) && !sig.competitor?.toLowerCase().includes(filterText.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getThreatBadge = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return 'threat-badge-critical';
      case 'ELEVATED':
      case 'MEDIUM':
        return 'threat-badge-elevated';
      default:
        return 'threat-badge-watch';
    }
  };

  return (
    <div className="surface-1 rounded-xl p-5 border border-[#262830] shadow-2xl space-y-4 font-sans">
      
      {/* 1. Header with Query Builder Chip Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262830] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              REAL-TIME SIGNAL FEED & QUERY BUILDER
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            High-density signal stream with automated multi-agent threat scores and citation evidence.
          </p>
        </div>

        {/* Filter Chip Query Builder Bar */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Threat Chips */}
          <div className="flex items-center space-x-1 bg-[#1A1B1F] p-1 rounded-lg border border-[#262830] text-xs font-mono">
            <span className="text-gray-400 px-1 text-[10px]">SEVERITY:</span>
            {['ALL', 'CRITICAL', 'ELEVATED', 'WATCH'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedThreat(t)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedThreat === t ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Channel Filter Chips */}
          <div className="flex items-center space-x-1 bg-[#1A1B1F] p-1 rounded-lg border border-[#262830] text-xs font-mono">
            <span className="text-gray-400 px-1 text-[10px]">CHANNEL:</span>
            {['ALL', 'CLINICALTRIALS', 'PUBMED', 'RSS'].map(c => (
              <button
                key={c}
                onClick={() => setSelectedChannel(c)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedChannel === c ? 'bg-teal-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {c === 'CLINICALTRIALS' ? 'TRIALS' : c}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 2. Dense Scannable Signal List */}
      <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
        {filteredSignals.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-gray-500 surface-2 rounded-lg border border-[#262830]">
            NO SIGNALS MATCHING CURRENT QUERY BUILDER FILTERS.
          </div>
        ) : (
          filteredSignals.map((sig, idx) => (
            <motion.div
              key={sig.id || idx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => onSelectSignal(sig)}
              className="terminal-card-hover surface-2 rounded-lg p-3.5 border border-[#262830] cursor-pointer group space-y-2"
            >
              {/* Row Top Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {/* Severity Badge */}
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${getThreatBadge(sig.threat_level)}`}>
                    {sig.threat_level || 'ELEVATED'}
                  </span>

                  {/* Competitor Chip */}
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {sig.competitor || 'Eli Lilly'}
                  </span>

                  {/* Source Channel Tag */}
                  <span className="text-[10px] font-mono text-gray-400 uppercase bg-[#131417] px-2 py-0.5 rounded border border-[#262830]">
                    {sig.channel || 'CLINICALTRIALS'}
                  </span>

                  {/* NCT ID Chip */}
                  {sig.nct_id && (
                    <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                      {sig.nct_id}
                    </span>
                  )}
                </div>

                {/* JetBrains Mono Timestamp */}
                <div className="text-[11px] font-mono text-gray-400">
                  {sig.published_date || sig.timestamp || '2026-07-26 10:42 UTC'}
                </div>
              </div>

              {/* Title & One-Line Summary */}
              <div>
                <h3 className="text-xs font-bold text-gray-100 group-hover:text-blue-300 transition-colors font-sans">
                  {sig.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed font-sans">
                  {sig.summary}
                </p>
              </div>

              {/* Row Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#262830] text-[10px] font-mono">
                <div className="flex items-center space-x-3 text-gray-400">
                  <span>RELEVANCE: <strong className="text-white">{(sig.relevance_score * 100 || 85).toFixed(0)}%</strong></span>
                  <span>•</span>
                  <span>DESK OWNER: <strong className="text-purple-300">{sig.exposure_routing?.routing_owner || 'GLP-1 DESK'}</strong></span>
                </div>

                <div className="flex items-center space-x-1 text-blue-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>INSPECT AGENT TRACE</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}
