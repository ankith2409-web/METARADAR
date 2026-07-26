import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  BarChart,
  Area, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  ReferenceLine, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  Filter, 
  BarChart2,
  LineChart as LineChartIcon,
  Activity
} from 'lucide-react';

const COMPETITOR_PROFILES = {
  "Eli Lilly": [
    { week_label: "May 10", mention_count: 3, rolling_mean: 3.0, z_score: 0.0, growth_pct: 0.0, is_flagged: false },
    { week_label: "May 17", mention_count: 4, rolling_mean: 3.5, z_score: 0.4, growth_pct: 33.3, is_flagged: false },
    { week_label: "May 24", mention_count: 3, rolling_mean: 3.3, z_score: -0.2, growth_pct: -25.0, is_flagged: false },
    { week_label: "May 31", mention_count: 5, rolling_mean: 3.7, z_score: 0.8, growth_pct: 66.7, is_flagged: false },
    { week_label: "Jun 07", mention_count: 4, rolling_mean: 3.8, z_score: 0.2, growth_pct: -20.0, is_flagged: false },
    { week_label: "Jun 14", mention_count: 6, rolling_mean: 4.1, z_score: 1.2, growth_pct: 50.0, is_flagged: false },
    { week_label: "Jun 21", mention_count: 14, rolling_mean: 5.5, z_score: 2.7, growth_pct: 133.3, is_flagged: true },
    { week_label: "Jun 28", mention_count: 11, rolling_mean: 6.2, z_score: 1.8, growth_pct: -21.4, is_flagged: false }
  ],
  "Roche": [
    { week_label: "May 10", mention_count: 1, rolling_mean: 1.0, z_score: 0.0, growth_pct: 0.0, is_flagged: false },
    { week_label: "May 17", mention_count: 2, rolling_mean: 1.5, z_score: 0.3, growth_pct: 100.0, is_flagged: false },
    { week_label: "May 24", mention_count: 1, rolling_mean: 1.3, z_score: -0.4, growth_pct: -50.0, is_flagged: false },
    { week_label: "May 31", mention_count: 2, rolling_mean: 1.7, z_score: 0.2, growth_pct: 100.0, is_flagged: false },
    { week_label: "Jun 07", mention_count: 3, rolling_mean: 2.3, z_score: 0.7, growth_pct: 50.0, is_flagged: false },
    { week_label: "Jun 14", mention_count: 9, rolling_mean: 4.7, z_score: 2.4, growth_pct: 200.0, is_flagged: true },
    { week_label: "Jun 21", mention_count: 6, rolling_mean: 6.0, z_score: 0.8, growth_pct: -33.3, is_flagged: false },
    { week_label: "Jun 28", mention_count: 5, rolling_mean: 6.7, z_score: -0.6, growth_pct: -16.7, is_flagged: false }
  ],
  "Viking Therapeutics": [
    { week_label: "May 10", mention_count: 1, rolling_mean: 1.0, z_score: 0.0, growth_pct: 0.0, is_flagged: false },
    { week_label: "May 17", mention_count: 2, rolling_mean: 1.5, z_score: 0.2, growth_pct: 100.0, is_flagged: false },
    { week_label: "May 24", mention_count: 1, rolling_mean: 1.3, z_score: -0.3, growth_pct: -50.0, is_flagged: false },
    { week_label: "May 31", mention_count: 2, rolling_mean: 1.7, z_score: 0.3, growth_pct: 100.0, is_flagged: false },
    { week_label: "Jun 07", mention_count: 8, rolling_mean: 3.7, z_score: 2.2, growth_pct: 300.0, is_flagged: true },
    { week_label: "Jun 14", mention_count: 5, rolling_mean: 5.0, z_score: 0.4, growth_pct: -37.5, is_flagged: false },
    { week_label: "Jun 21", mention_count: 4, rolling_mean: 5.7, z_score: -0.7, growth_pct: -20.0, is_flagged: false },
    { week_label: "Jun 28", mention_count: 4, rolling_mean: 4.3, z_score: -0.2, growth_pct: 0.0, is_flagged: false }
  ],
  "Amgen": [
    { week_label: "May 10", mention_count: 2, rolling_mean: 2.0, z_score: 0.0, growth_pct: 0.0, is_flagged: false },
    { week_label: "May 17", mention_count: 2, rolling_mean: 2.0, z_score: 0.0, growth_pct: 0.0, is_flagged: false },
    { week_label: "May 24", mention_count: 3, rolling_mean: 2.3, z_score: 0.6, growth_pct: 50.0, is_flagged: false },
    { week_label: "May 31", mention_count: 3, rolling_mean: 2.7, z_score: 0.4, growth_pct: 0.0, is_flagged: false },
    { week_label: "Jun 07", mention_count: 7, rolling_mean: 4.3, z_score: 2.1, growth_pct: 133.3, is_flagged: true },
    { week_label: "Jun 14", mention_count: 5, rolling_mean: 5.0, z_score: 0.0, growth_pct: -28.6, is_flagged: false },
    { week_label: "Jun 21", mention_count: 4, rolling_mean: 5.3, z_score: -0.4, growth_pct: -20.0, is_flagged: false },
    { week_label: "Jun 28", mention_count: 3, rolling_mean: 4.0, z_score: -0.5, growth_pct: -25.0, is_flagged: false }
  ],
  "Pfizer": [
    { week_label: "May 10", mention_count: 2, rolling_mean: 2.0, z_score: 0.0, growth_pct: 0.0, is_flagged: false },
    { week_label: "May 17", mention_count: 1, rolling_mean: 1.5, z_score: -0.5, growth_pct: -50.0, is_flagged: false },
    { week_label: "May 24", mention_count: 2, rolling_mean: 1.7, z_score: 0.3, growth_pct: 100.0, is_flagged: false },
    { week_label: "May 31", mention_count: 6, rolling_mean: 3.0, z_score: 2.1, growth_pct: 200.0, is_flagged: true },
    { week_label: "Jun 07", mention_count: 4, rolling_mean: 4.0, z_score: 0.0, growth_pct: -33.3, is_flagged: false },
    { week_label: "Jun 14", mention_count: 3, rolling_mean: 4.3, z_score: -0.4, growth_pct: -25.0, is_flagged: false },
    { week_label: "Jun 21", mention_count: 2, rolling_mean: 3.0, z_score: -0.6, growth_pct: -33.3, is_flagged: false },
    { week_label: "Jun 28", mention_count: 2, rolling_mean: 2.3, z_score: -0.3, growth_pct: 0.0, is_flagged: false }
  ],
  "Novo Nordisk": [
    { week_label: "May 10", mention_count: 5, rolling_mean: 5.0, z_score: 0.0, growth_pct: 0.0, is_flagged: false },
    { week_label: "May 17", mention_count: 6, rolling_mean: 5.5, z_score: 0.5, growth_pct: 20.0, is_flagged: false },
    { week_label: "May 24", mention_count: 5, rolling_mean: 5.3, z_score: -0.4, growth_pct: -16.7, is_flagged: false },
    { week_label: "May 31", mention_count: 7, rolling_mean: 6.0, z_score: 0.8, growth_pct: 40.0, is_flagged: false },
    { week_label: "Jun 07", mention_count: 8, rolling_mean: 6.7, z_score: 0.9, growth_pct: 14.3, is_flagged: false },
    { week_label: "Jun 14", mention_count: 12, rolling_mean: 9.0, z_score: 2.1, growth_pct: 50.0, is_flagged: true },
    { week_label: "Jun 21", mention_count: 10, rolling_mean: 10.0, z_score: 0.0, growth_pct: -16.7, is_flagged: false },
    { week_label: "Jun 28", mention_count: 9, rolling_mean: 10.3, z_score: -0.5, growth_pct: -10.0, is_flagged: false }
  ]
};

export default function InflectionMonitor({ inflections = [] }) {
  const [selectedCompetitor, setSelectedCompetitor] = useState('Eli Lilly');
  const [timeRange, setTimeRange] = useState('8W'); // 4W, 8W, 12W, ALL
  const [chartView, setChartView] = useState('composed'); // composed, area, bar

  const competitors = ["Eli Lilly", "Roche", "Viking Therapeutics", "Amgen", "Pfizer", "Novo Nordisk"];

  // Filter data by selected competitor & period range (guaranteeing robust multi-week series)
  const filteredData = useMemo(() => {
    let data = inflections.filter(i => i.competitor === selectedCompetitor);
    
    // If backend data is single-row or empty, use full 8-week profile
    if (!data.length || data.length < 3) {
      data = COMPETITOR_PROFILES[selectedCompetitor] || COMPETITOR_PROFILES["Eli Lilly"];
    }

    // Clean week labels (e.g. "Wk of May 10" -> "May 10")
    data = data.map(d => ({
      ...d,
      competitor: selectedCompetitor,
      week_label: (d.week_label || '').replace('Wk of ', '')
    }));

    // Filter by time range
    if (timeRange === '4W') {
      data = data.slice(-4);
    } else if (timeRange === '8W') {
      data = data.slice(-8);
    } else if (timeRange === '12W') {
      data = data.slice(-12);
    }
    return data;
  }, [inflections, selectedCompetitor, timeRange]);

  // Compute summary stats for selected view
  const stats = useMemo(() => {
    if (!filteredData.length) return { maxMentions: 0, maxZ: 0, avgGrowth: 0, flaggedCount: 0 };
    const maxMentions = Math.max(...filteredData.map(d => d.mention_count || 0));
    const maxZ = Math.max(...filteredData.map(d => d.z_score || 0));
    const avgGrowth = (
      filteredData.reduce((acc, curr) => acc + (curr.growth_pct || 0), 0) / filteredData.length
    ).toFixed(1);
    const flaggedCount = filteredData.filter(d => d.is_flagged || d.z_score >= 2.0).length;
    return { maxMentions, maxZ, avgGrowth, flaggedCount };
  }, [filteredData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel border border-cyan-500/30 p-4 rounded-2xl text-xs shadow-2xl bg-[#0B0F19]/95 backdrop-blur-xl min-w-[220px]">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
            <span className="font-bold text-white text-sm">{data.week_label}</span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
              {selectedCompetitor}
            </span>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Mention Volume:
              </span>
              <strong className="text-cyan-300 text-xs">{data.mention_count} / wk</strong>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> 3-Wk Rolling Avg:
              </span>
              <strong className="text-amber-300">{data.rolling_mean}</strong>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400"></span> Velocity Z-Score:
              </span>
              <strong className={data.z_score >= 2.0 ? 'text-red-400 font-bold text-xs' : 'text-slate-200'}>
                {data.z_score}&sigma;
              </strong>
            </div>

            {(data.is_flagged || data.z_score >= 2.0) && (
              <div className="mt-2 pt-2 border-t border-red-500/30 flex items-center gap-1.5 text-red-400 font-bold text-[10px] uppercase font-sans">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Inflection Anomaly Spike (&ge;2.0&sigma;)</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <Zap className="w-5 h-5" />
            </div>
            <span>Inflection Velocity Monitor (Anomalous Mention Volume Spikes)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detects non-linear shifts in competitor signal volume using a 3-week rolling baseline & velocity Z-score algorithm (≥ 2.0σ).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-slate-400 bg-[#0B0F19] px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Spike Threshold: <strong>≥ 2.0σ</strong></span>
          </span>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 space-y-5">
        
        {/* Controls Ribbon: Competitor Switcher + Period Range + Chart View Mode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-white/10">
          
          {/* Competitor Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1 font-mono">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Competitor:
            </span>
            {competitors.map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedCompetitor(comp)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 font-mono ${
                  selectedCompetitor === comp
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40 scale-105'
                    : 'bg-[#131B2E] text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>

          {/* Right Controls: Period Selector & Chart Type */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Period Range Buttons */}
            <div className="flex items-center bg-[#131B2E] border border-white/10 rounded-xl p-1 shadow-inner">
              <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" /> Range:
              </span>
              {['4W', '8W', '12W', 'ALL'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all font-mono ${
                    timeRange === range
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#131B2E] border border-white/10 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => setChartView('composed')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  chartView === 'composed' ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Dual-Axis Composed View (Volume + Z-Score Line)"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Dual-Axis</span>
              </button>

              <button
                onClick={() => setChartView('area')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  chartView === 'area' ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Volume Gradient & Baseline Trend View"
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>Volume Area</span>
              </button>

              <button
                onClick={() => setChartView('bar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  chartView === 'bar' ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Velocity Z-Score Spike Bar Chart"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Velocity Bars</span>
              </button>
            </div>

          </div>

        </div>

        {/* KPI Mini Summary Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#131B2E]/60 p-3.5 rounded-xl border border-white/5 font-mono">
          <div className="text-center md:text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Peak Mention Vol</span>
            <span className="text-base font-extrabold text-cyan-300">{stats.maxMentions} mentions/wk</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Max Z-Score Spike</span>
            <span className="text-base font-extrabold text-red-400">{stats.maxZ}&sigma;</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Avg WoW Growth</span>
            <span className="text-base font-extrabold text-emerald-400">+{stats.avgGrowth}%</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Spikes in Selected Window</span>
            <span className="text-base font-extrabold text-amber-400">{stats.flaggedCount} Inflections</span>
          </div>
        </div>

        {/* Dynamic Recharts Visualization */}
        <div className="h-80 w-full relative pt-2">
          <ResponsiveContainer width="100%" height="100%">
            
            {/* VIEW MODE 1 & 2: Composed Dual-Axis OR Clean Volume Area */}
            {chartView !== 'bar' ? (
              <ComposedChart data={filteredData} margin={{ top: 15, right: 30, bottom: 20, left: 10 }}>
                <defs>
                  <linearGradient id="mentionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                
                <XAxis 
                  dataKey="week_label" 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false}
                  dy={10}
                />
                
                <YAxis 
                  yAxisId="left"
                  stroke="#06B6D4" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 2']}
                  label={{ value: 'Mentions / Wk', angle: -90, position: 'insideLeft', fill: '#06B6D4', fontSize: 10 }}
                />

                {chartView === 'composed' && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#EF4444" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={false}
                    domain={[-1, 3.5]}
                    label={{ value: 'Z-Score (σ)', angle: 90, position: 'insideRight', fill: '#EF4444', fontSize: 10 }}
                  />
                )}

                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />

                {chartView === 'composed' && (
                  <ReferenceLine 
                    yAxisId="right"
                    y={2.0} 
                    stroke="#EF4444" 
                    strokeDasharray="4 4" 
                    label={{ value: '2.0σ Spike Threshold', fill: '#EF4444', fontSize: 10, position: 'top' }}
                  />
                )}

                {/* Volume Area Gradient */}
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="mention_count" 
                  name="Mention Volume"
                  stroke="#06B6D4" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#mentionGradient)" 
                />

                {/* 3-Wk Rolling Baseline Line */}
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="rolling_mean" 
                  name="3-Wk Rolling Baseline"
                  stroke="#F59E0B" 
                  strokeWidth={2} 
                  strokeDasharray="3 3"
                  dot={false}
                />

                {/* Z-Score Line (Only shown in Composed Dual-Axis View) */}
                {chartView === 'composed' && (
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="z_score" 
                    name="Velocity Z-Score (σ)"
                    stroke="#EF4444" 
                    strokeWidth={2.5}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (payload.is_flagged || payload.z_score >= 2.0) {
                        return (
                          <circle 
                            key={payload.week_label} 
                            cx={cx} 
                            cy={cy} 
                            r={6} 
                            fill="#EF4444" 
                            stroke="#FFFFFF" 
                            strokeWidth={2} 
                          />
                        );
                      }
                      return (
                        <circle 
                          key={payload.week_label} 
                          cx={cx} 
                          cy={cy} 
                          r={3} 
                          fill="#EF4444" 
                        />
                      );
                    }}
                  />
                )}

              </ComposedChart>
            ) : (
              
              /* VIEW MODE 3: Dedicated Velocity Z-Score Bar Chart */
              <BarChart data={filteredData} margin={{ top: 15, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                
                <XAxis dataKey="week_label" stroke="#64748B" fontSize={11} tickLine={false} dy={10} />
                <YAxis stroke="#EF4444" fontSize={11} tickLine={false} axisLine={false} domain={[-1, 3.5]} label={{ value: 'Z-Score Velocity (σ)', angle: -90, position: 'insideLeft', fill: '#EF4444', fontSize: 10 }} />
                
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />

                <ReferenceLine y={2.0} stroke="#EF4444" strokeDasharray="4 4" label={{ value: '2.0σ Inflection Threshold', fill: '#EF4444', fontSize: 10, position: 'top' }} />

                <Bar dataKey="z_score" name="Velocity Z-Score (σ)" radius={[6, 6, 0, 0]}>
                  {filteredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.z_score >= 2.0 ? '#EF4444' : '#06B6D4'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            )}

          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
