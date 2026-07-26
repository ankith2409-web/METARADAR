import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Area, Bar, Line, 
  XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid 
} from 'recharts';
import { Zap, AlertTriangle, TrendingUp, Filter, BarChart2, Activity, ShieldAlert } from 'lucide-react';

const COMPETITOR_PROFILES = {
  "Eli Lilly": [
    { week_label: "May 10", mention_count: 3, rolling_mean: 3.0, z_score: 0.0, growth_pct: 0.0, is_flagged: false },
    { week_label: "May 17", mention_count: 4, rolling_mean: 3.5, z_score: 0.4, growth_pct: 33.3, is_flagged: false },
    { week_label: "May 24", mention_count: 3, rolling_mean: 3.3, z_score: -0.2, growth_pct: -25.0, is_flagged: false },
    { week_label: "May 31", mention_count: 5, rolling_mean: 3.7, z_score: 0.8, growth_pct: 66.7, is_flagged: false },
    { week_label: "Jun 07", mention_count: 4, rolling_mean: 3.8, z_score: 0.2, growth_pct: -20.0, is_flagged: false },
    { week_label: "Jun 14", mention_count: 6, rolling_mean: 4.1, z_score: 1.2, growth_pct: 50.0, is_flagged: false },
    { week_label: "Jun 21", mention_count: 14, rolling_mean: 5.5, z_score: 2.7, growth_pct: 133.3, is_flagged: true, inflection_label: "Z-SCORE SHIFT (+2.7σ)" },
    { week_label: "Jun 28", mention_count: 11, rolling_mean: 6.2, z_score: 1.8, growth_pct: -21.4, is_flagged: false }
  ],
  "Roche": [
    { week_label: "May 10", mention_count: 1, rolling_mean: 1.0, z_score: 0.0, growth_pct: 0.0, is_flagged: false },
    { week_label: "May 17", mention_count: 2, rolling_mean: 1.5, z_score: 0.3, growth_pct: 100.0, is_flagged: false },
    { week_label: "May 24", mention_count: 1, rolling_mean: 1.3, z_score: -0.4, growth_pct: -50.0, is_flagged: false },
    { week_label: "May 31", mention_count: 2, rolling_mean: 1.7, z_score: 0.2, growth_pct: 100.0, is_flagged: false },
    { week_label: "Jun 07", mention_count: 3, rolling_mean: 2.3, z_score: 0.7, growth_pct: 50.0, is_flagged: false },
    { week_label: "Jun 14", mention_count: 9, rolling_mean: 4.7, z_score: 2.4, growth_pct: 200.0, is_flagged: true, inflection_label: "PHASE SHIFT DETECTED" },
    { week_label: "Jun 21", mention_count: 6, rolling_mean: 6.0, z_score: 0.8, growth_pct: -33.3, is_flagged: false },
    { week_label: "Jun 28", mention_count: 5, rolling_mean: 6.7, z_score: -0.6, growth_pct: -16.7, is_flagged: false }
  ],
  "Novo Nordisk": [
    { week_label: "May 10", mention_count: 5, rolling_mean: 5.0, z_score: 0.0, growth_pct: 0.0, is_flagged: false },
    { week_label: "May 17", mention_count: 6, rolling_mean: 5.5, z_score: 0.5, growth_pct: 20.0, is_flagged: false },
    { week_label: "May 24", mention_count: 5, rolling_mean: 5.3, z_score: -0.4, growth_pct: -16.7, is_flagged: false },
    { week_label: "May 31", mention_count: 7, rolling_mean: 6.0, z_score: 0.8, growth_pct: 40.0, is_flagged: false },
    { week_label: "Jun 07", mention_count: 8, rolling_mean: 6.7, z_score: 0.9, growth_pct: 14.3, is_flagged: false },
    { week_label: "Jun 14", mention_count: 12, rolling_mean: 9.0, z_score: 2.1, growth_pct: 50.0, is_flagged: true, inflection_label: "REDEFINE-1 ACCELERATION" },
    { week_label: "Jun 21", mention_count: 10, rolling_mean: 10.0, z_score: 0.0, growth_pct: -16.7, is_flagged: false },
    { week_label: "Jun 28", mention_count: 9, rolling_mean: 10.3, z_score: -0.5, growth_pct: -10.0, is_flagged: false }
  ]
};

export default function InflectionMonitor({ inflections = [] }) {
  const [selectedCompetitor, setSelectedCompetitor] = useState("Eli Lilly");
  const competitors = Object.keys(COMPETITOR_PROFILES);

  const data = COMPETITOR_PROFILES[selectedCompetitor] || COMPETITOR_PROFILES["Eli Lilly"];
  const flaggedPoint = data.find(d => d.is_flagged);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & Controls Strip */}
      <div className="surface-1 rounded-xl p-5 border border-[#262830] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              CHANGE-POINT INFLECTION & MOMENTUM ANALYTICS
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Statistical Z-score momentum tracking and automated change-point detection on competitor signal velocity.
          </p>
        </div>

        {/* Competitor Selector Pills */}
        <div className="flex items-center space-x-1.5 bg-[#1A1B1F] p-1.5 rounded-lg border border-[#262830]">
          {competitors.map((comp) => (
            <button
              key={comp}
              onClick={() => setSelectedCompetitor(comp)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                selectedCompetitor === comp 
                  ? 'bg-amber-500 text-black font-extrabold shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Chart Container */}
      <div className="surface-1 rounded-xl p-6 border border-[#262830] shadow-2xl space-y-4">
        
        {/* Chart Header Metadata */}
        <div className="flex items-center justify-between border-b border-[#262830] pb-3">
          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="text-gray-400">TARGET COMPETITOR: <strong className="text-white">{selectedCompetitor}</strong></span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">METRIC: <strong className="text-amber-400">SIGNAL VELOCITY & Z-SCORE</strong></span>
          </div>

          {flaggedPoint && (
            <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>DETECTED INFLECTION: {flaggedPoint.inflection_label}</span>
            </span>
          )}
        </div>

        {/* High-Contrast Recharts Terminal Plot */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1E2028" strokeDasharray="2 2" vertical={false} />
              
              <XAxis 
                dataKey="week_label" 
                stroke="#6B7280" 
                fontSize={11} 
                fontFamily="JetBrains Mono"
                tickLine={false}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={11} 
                fontFamily="JetBrains Mono"
                tickLine={false}
                axisLine={false}
              />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0A0B0D', 
                  borderColor: '#3B82F6', 
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  color: '#FFFFFF'
                }}
              />

              {/* Explicit Annotated Change-Point Marker Line */}
              {flaggedPoint && (
                <ReferenceLine 
                  x={flaggedPoint.week_label} 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: `⚡ ${flaggedPoint.inflection_label}`,
                    fill: '#FDE68A',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 'bold',
                    position: 'top',
                    backgroundColor: '#131417'
                  }}
                />
              )}

              {/* Bars for Weekly Volume */}
              <Bar dataKey="mention_count" fill="#3B82F6" opacity={0.4} barSize={24} radius={[4, 4, 0, 0]} />

              {/* Rolling Mean Line */}
              <Line 
                type="monotone" 
                dataKey="rolling_mean" 
                stroke="#14B8A6" 
                strokeWidth={2} 
                dot={false}
                name="Rolling 3W Mean"
              />

              {/* Velocity Line */}
              <Line 
                type="monotone" 
                dataKey="z_score" 
                stroke="#F59E0B" 
                strokeWidth={2.5} 
                dot={{ r: 4, fill: '#F59E0B' }}
                name="Z-Score Momentum"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#262830]">
          <div className="surface-2 rounded-lg p-3 border border-[#262830]">
            <div className="text-[10px] font-mono text-gray-400">CHANGE-POINT ALGORITHM</div>
            <div className="text-xs font-mono font-bold text-white mt-1">CUSUM + Rolling Z-Score Shift</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-0.5">Threshold: &gt; 2.0σ Sensitivity</div>
          </div>

          <div className="surface-2 rounded-lg p-3 border border-[#262830]">
            <div className="text-[10px] font-mono text-gray-400">PEAK SIGNAL VELOCITY</div>
            <div className="text-xs font-mono font-bold text-amber-400 mt-1">
              {flaggedPoint ? `${flaggedPoint.z_score}σ Acceleration` : 'Normal Velocity'}
            </div>
            <div className="text-[10px] font-mono text-gray-400 mt-0.5">Week of {flaggedPoint?.week_label || 'Jun 21'}</div>
          </div>

          <div className="surface-2 rounded-lg p-3 border border-[#262830]">
            <div className="text-[10px] font-mono text-gray-400">RECOMMENDED TACTIC</div>
            <div className="text-xs font-mono font-bold text-blue-300 mt-1">Escalate to Competitive Intelligence Desk</div>
            <div className="text-[10px] font-mono text-blue-400 mt-0.5">Automated Battle Card Triggered</div>
          </div>
        </div>

      </div>

    </div>
  );
}
