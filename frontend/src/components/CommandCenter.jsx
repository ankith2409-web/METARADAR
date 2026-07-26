import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, ShieldAlert, ArrowUpRight, TrendingUp, Radio, 
  ExternalLink, ChevronRight, Zap, Clock, Tag, Cpu, AlertTriangle
} from 'lucide-react';

export default function CommandCenter({ 
  signals = [], 
  inflections = [], 
  battleCards = [],
  selectedCompetitor, 
  setSelectedCompetitor, 
  onSelectSignal 
}) {
  const recentSignals = signals.slice(0, 10);

  // Compute threat radar positions for competitors
  const competitorsList = [
    { name: 'Eli Lilly', code: 'LLY', target: 'GLP-1 / GIP (Tirzepatide / Retatrutide)', threat: 'CRITICAL', score: 92, angle: 35, dist: 78, sparkline: [40, 55, 65, 80, 95] },
    { name: 'Novo Nordisk', code: 'NVO', target: 'GLP-1 / CagriSema (Semaglutide)', threat: 'ELEVATED', score: 88, angle: 110, dist: 70, sparkline: [60, 70, 75, 82, 88] },
    { name: 'Amgen', code: 'AMGN', target: 'MariTide (AMG 133 - Antibody Peptide)', threat: 'ELEVATED', score: 76, angle: 210, dist: 55, sparkline: [30, 45, 50, 68, 76] },
    { name: 'Viking Therapeutics', code: 'VKTX', target: 'VK2735 (Dual GLP-1/GIP Agonist)', threat: 'WATCH', score: 64, angle: 290, dist: 45, sparkline: [25, 35, 40, 52, 64] },
    { name: 'Roche / Carmot', code: 'ROG', target: 'CT-996 (Oral GLP-1)', threat: 'WATCH', score: 58, angle: 160, dist: 38, sparkline: [15, 20, 35, 42, 58] },
    { name: 'Pfizer', code: 'PFE', target: 'Danuglipron (Small Molecule GLP-1)', threat: 'WATCH', score: 45, angle: 330, dist: 30, sparkline: [50, 48, 40, 42, 45] }
  ];

  const getThreatStyle = (threat) => {
    switch (threat) {
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

  const getThreatColor = (threat) => {
    switch (threat) {
      case 'CRITICAL':
      case 'HIGH':
        return '#EF4444';
      case 'ELEVATED':
      case 'MEDIUM':
        return '#F97316';
      default:
        return '#F59E0B';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Terminal Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="surface-1 rounded-lg p-3 border border-[#262830]">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>TOTAL SIGNALS</span>
            <Radio className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">{signals.length || 24}</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">↑ 14% vs last 7d window</div>
        </div>

        <div className="surface-1 rounded-lg p-3 border border-[#262830]">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>ACTIVE INFLECTIONS</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{inflections.length || 6}</div>
          <div className="text-[10px] text-amber-300 font-mono mt-0.5">2 Critical Z-score shifts</div>
        </div>

        <div className="surface-1 rounded-lg p-3 border border-[#262830]">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>COMPETITORS TRACKED</span>
            <Activity className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-300 mt-1">6 PHARMA GIANTS</div>
          <div className="text-[10px] text-gray-400 font-mono mt-0.5">GLP-1 / GIP / Amylin Space</div>
        </div>

        <div className="surface-1 rounded-lg p-3 border border-[#262830]">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>LEAD PREDICTIVE TIME</span>
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-300 mt-1">4.2 WEEKS</div>
          <div className="text-[10px] text-indigo-400 font-mono mt-0.5">Pre-announcement detection</div>
        </div>
      </div>

      {/* 2. Hero Zone: Real-Time Stream (60%) vs. Threat Radar (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 60% (col-span-7): Real-Time Signal Stream */}
        <div className="lg:col-span-7 surface-1 rounded-xl p-4 border border-[#262830] space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#262830] pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse-glow"></span>
              <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                LIVE COMPETITIVE SIGNAL FEED
              </h2>
            </div>
            <span className="text-[11px] font-mono text-gray-400 bg-[#1A1B1F] px-2 py-0.5 rounded border border-[#262830]">
              REAL-TIME SSE PIPELINE
            </span>
          </div>

          {/* Stream Item List with Motion */}
          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {recentSignals.map((sig, idx) => (
              <motion.div
                key={sig.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                onClick={() => onSelectSignal(sig)}
                className="terminal-card-hover surface-2 rounded-lg p-3 border border-[#262830] cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {sig.competitor || 'Eli Lilly'}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-[10px] font-mono text-gray-400 uppercase bg-[#212226] px-1.5 py-0.5 rounded">
                      {sig.channel || 'CLINICALTRIALS'}
                    </span>
                    {sig.nct_id && (
                      <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded">
                        {sig.nct_id}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${getThreatStyle(sig.threat_level)}`}>
                      {sig.threat_level || 'ELEVATED'}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {sig.timestamp ? sig.timestamp.substring(11, 19) : '10:42:00'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                  {sig.title || sig.summary || 'Significant Phase III clinical trial parameter shift observed in metabolic outcome study.'}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#262830]/50 text-[10px] font-mono text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span>RELEVANCE: <strong className="text-gray-200">{(sig.relevance_score * 100).toFixed(0)}%</strong></span>
                    <span>•</span>
                    <span>IMPACT: <strong className="text-blue-300">{sig.impact_score || 8.5}/10</strong></span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-400 group-hover:translate-x-0.5 transition-transform">
                    <span>AGENT REASONING TRACE</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right 40% (col-span-5): Threat Radar Polar Plot */}
        <div className="lg:col-span-5 surface-1 rounded-xl p-4 border border-[#262830] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#262830] pb-3">
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>COMPETITOR THREAT RADAR</span>
            </h2>
            <span className="text-[10px] font-mono text-gray-400">RECENCY × SEVERITY</span>
          </div>

          {/* SVG Polar Radar Display */}
          <div className="relative w-full aspect-square max-w-[310px] mx-auto my-2 flex items-center justify-center">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* Concentric Circles */}
              <circle cx="150" cy="150" r="130" fill="none" stroke="#262830" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="150" cy="150" r="95" fill="none" stroke="#262830" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="150" cy="150" r="60" fill="none" stroke="#262830" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="150" cy="150" r="25" fill="none" stroke="#262830" strokeWidth="1" />

              {/* Crosshair Lines */}
              <line x1="150" y1="20" x2="150" y2="280" stroke="#262830" strokeWidth="1" />
              <line x1="20" y1="150" x2="280" y2="150" stroke="#262830" strokeWidth="1" />

              {/* Rotating Sweep Animation Line */}
              <line 
                x1="150" y1="150" x2="250" y2="50" 
                stroke="url(#sweepGrad)" strokeWidth="2" 
                className="origin-[150px_150px] animate-spin" 
                style={{ animationDuration: '8s' }} 
              />
              <defs>
                <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Plot Competitor Nodes */}
              {competitorsList.map((comp) => {
                const rad = (comp.angle * Math.PI) / 180;
                const r = comp.dist * 1.3;
                const cx = 150 + r * Math.cos(rad);
                const cy = 150 + r * Math.sin(rad);
                const color = getThreatColor(comp.threat);

                return (
                  <g 
                    key={comp.code} 
                    className="cursor-pointer hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedCompetitor(comp.name)}
                  >
                    <circle cx={cx} cy={cy} r="14" fill="#131417" stroke={color} strokeWidth="2" />
                    <circle cx={cx} cy={cy} r="4" fill={color} className="animate-pulse" />
                    <text 
                      x={cx} y={cy + 24} 
                      fill="#F4F4F5" 
                      fontSize="9" 
                      fontFamily="JetBrains Mono" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      {comp.code} ({comp.score})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-[11px] font-mono text-gray-400 text-center bg-[#1A1B1F] p-2 rounded border border-[#262830]">
            Inner Orbit = High Severity Threat Vector • Click node to isolate competitor
          </div>
        </div>

      </div>

      {/* 3. Horizontal Watch Cards Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-gray-300 uppercase tracking-wider">
            COMPETITOR WATCH LIST & PIPELINE DELTAS
          </h3>
          <span className="text-[10px] font-mono text-gray-400">SELECT COMPETITOR TO FILTER ALL VIEWS</span>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {competitorsList.map((comp) => {
            const isSelected = selectedCompetitor === comp.name;
            return (
              <div
                key={comp.code}
                onClick={() => setSelectedCompetitor(isSelected ? 'ALL' : comp.name)}
                className={`terminal-card-hover min-w-[240px] surface-1 rounded-xl p-3.5 border cursor-pointer flex-shrink-0 transition-all ${
                  isSelected ? 'border-blue-500 bg-[#1A1B1F] shadow-lg shadow-blue-500/10' : 'border-[#262830]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-md bg-[#212226] border border-[#262830] flex items-center justify-center font-mono font-bold text-xs text-blue-400">
                      {comp.code}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{comp.name}</div>
                      <div className="text-[10px] font-mono text-gray-400">{comp.threat} THREAT</div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${getThreatStyle(comp.threat)}`}>
                    {comp.score} / 100
                  </span>
                </div>

                <div className="text-[11px] text-gray-300 font-sans line-clamp-1 mb-2">
                  {comp.target}
                </div>

                {/* Sentiment Trend Sparkline */}
                <div className="flex items-center justify-between pt-2 border-t border-[#262830]">
                  <span className="text-[10px] font-mono text-gray-400">MOMENTUM</span>
                  <svg viewBox="0 0 60 15" className="w-16 h-4">
                    <polyline
                      fill="none"
                      stroke={getThreatColor(comp.threat)}
                      strokeWidth="1.8"
                      points={comp.sparkline.map((v, i) => `${i * 14},${15 - (v / 100) * 12}`).join(' ')}
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
