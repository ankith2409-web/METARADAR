import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { AlertTriangle, Filter, Radio, Sparkles, Calendar, Clock, Crosshair } from 'lucide-react';

export default function RadarTimeline({ signals = [], selectedCompetitor, setSelectedCompetitor, onSelectSignal }) {
  // Dynamically extract all unique competitor names from signals + default base competitors
  const competitors = useMemo(() => {
    const base = ["Eli Lilly", "Roche", "Amgen", "Viking Therapeutics", "Pfizer", "Novo Nordisk"];
    const set = new Set(signals.map(s => s.competitor).filter(Boolean));
    base.forEach(b => set.add(b));
    return Array.from(set);
  }, [signals]);

  const yTicks = useMemo(() => competitors.map((_, i) => i + 1), [competitors]);

  // Period / Date Range State
  const [timePeriod, setTimePeriod] = useState('ALL'); // '1M', '3M', '6M', 'ALL', 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getCompetitorY = (comp) => {
    const idx = competitors.indexOf(comp);
    return idx !== -1 ? idx + 1 : 1;
  };

  // Filter signals based on selected competitor and time period
  const filteredSignals = useMemo(() => {
    let result = [...signals];

    // Filter by competitor
    if (selectedCompetitor !== 'ALL') {
      result = result.filter(s => s.competitor === selectedCompetitor);
    }

    const now = new Date().getTime();

    // Filter by Time Period
    if (timePeriod === '1M') {
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
      result = result.filter(s => new Date(s.published_date).getTime() >= oneMonthAgo);
    } else if (timePeriod === '3M') {
      const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
      result = result.filter(s => new Date(s.published_date).getTime() >= threeMonthsAgo);
    } else if (timePeriod === '6M') {
      const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;
      result = result.filter(s => new Date(s.published_date).getTime() >= sixMonthsAgo);
    } else if (timePeriod === 'CUSTOM') {
      if (startDate) {
        const startTs = new Date(startDate).getTime();
        result = result.filter(s => new Date(s.published_date).getTime() >= startTs);
      }
      if (endDate) {
        const endTs = new Date(endDate).getTime() + 86400000;
        result = result.filter(s => new Date(s.published_date).getTime() <= endTs);
      }
    }

    return result;
  }, [signals, selectedCompetitor, timePeriod, startDate, endDate]);

  const chartData = useMemo(() => {
    return filteredSignals.map(s => {
      const dateObj = new Date(s.published_date || "2026-05-10");
      return {
        id: s.id,
        title: s.title,
        competitor: s.competitor,
        threat_level: s.threat_level,
        score: s.relevance_score,
        source: s.source,
        dateStr: s.published_date,
        xTimestamp: dateObj.getTime(),
        yIndex: getCompetitorY(s.competitor),
        rawSignal: s
      };
    });
  }, [filteredSignals, competitors]);

  const getThreatColor = (level) => {
    if (level === 'high') return '#EF4444';   // Crimson Red
    if (level === 'medium') return '#F59E0B'; // Amber Gold
    return '#10B981';                         // Emerald Green
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel border border-cyan-500/40 p-4 rounded-2xl shadow-2xl max-w-xs text-xs z-50 bg-[#0B0F19]/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
            <span className="font-bold text-cyan-300 text-sm">{data.competitor}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              data.threat_level === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              data.threat_level === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {data.threat_level} threat ({data.score}/10)
            </span>
          </div>
          <p className="text-slate-100 font-semibold mb-2 leading-relaxed line-clamp-2">{data.title}</p>
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono border-t border-white/10 pt-2">
            <span>{data.source}</span>
            <span>{data.dateStr}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 space-y-5 bg-[#0F172A]/80">
      
      {/* Header Title & Top Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-md">
              <Radio className="w-5 h-5" />
            </div>
            <span>Competitive Signal Radar & Temporal Distribution</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-source signal mapping over custom time windows by competitor threat severity
          </p>
        </div>

        {/* Dynamic Counter */}
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            Showing {chartData.length} signals in window
          </span>
        </div>
      </div>

      {/* Controls Bar: Competitors + Time Period Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/10">
        
        {/* Competitor Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
          </span>
          <button
            onClick={() => setSelectedCompetitor("ALL")}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all shrink-0 ${
              selectedCompetitor === "ALL" 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40' 
                : 'bg-[#131B2E] text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            All Competitors
          </button>
          {competitors.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCompetitor(c)}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all shrink-0 ${
                selectedCompetitor === c 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40' 
                  : 'bg-[#131B2E] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Time Period Selector Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#131B2E] border border-white/10 rounded-xl p-1 shadow-inner">
            <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" /> Period:
            </span>
            {[
              { id: '1M', label: '1 Month' },
              { id: '3M', label: '3 Months' },
              { id: '6M', label: '6 Months' },
              { id: 'ALL', label: 'All Time' },
              { id: 'CUSTOM', label: 'Custom Range' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setTimePeriod(p.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all font-mono ${
                  timePeriod === p.id 
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs if CUSTOM is active */}
          {timePeriod === 'CUSTOM' && (
            <div className="flex items-center gap-2 bg-[#131B2E] border border-cyan-500/30 rounded-xl px-3 py-1">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-slate-100 focus:outline-none font-mono"
              />
              <span className="text-xs text-slate-500">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-slate-100 focus:outline-none font-mono"
              />
            </div>
          )}
        </div>

      </div>

      {/* Main Scatter Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 30, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={true} vertical={false} />
            <XAxis 
              dataKey="xTimestamp" 
              type="number" 
              domain={['dataMin - 86400000', 'dataMax + 86400000']}
              tickFormatter={(ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              stroke="#64748B"
              fontSize={11}
              dy={10}
              label={{ value: 'Signal Publication Date (Timeline)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
            />

            <YAxis 
              dataKey="yIndex" 
              type="number" 
              domain={[0.5, competitors.length + 0.5]}
              ticks={yTicks}
              tickFormatter={(idx) => competitors[idx - 1] || ''}
              stroke="#64748B"
              fontSize={11}
              width={130}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis dataKey="score" range={[100, 360]} name="Relevance Score" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              data={chartData} 
              onClick={(elem) => onSelectSignal(elem.rawSignal)}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getThreatColor(entry.threat_level)}
                  stroke="#0B0F19"
                  strokeWidth={2.5}
                  className="hover:scale-125 transition-all duration-200 cursor-pointer"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Threat Level Legend & Interaction Guide */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Bubble size reflects AI relevance score (1-10). Click node for multi-agent reasoning trace.</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span>
            <span className="text-slate-300 font-bold">High Threat (8-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></span>
            <span className="text-slate-300 font-bold">Medium Threat (5-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
            <span className="text-slate-300 font-bold">Low Threat (1-4)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
