import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Search, Filter, X, ExternalLink, Dna, Activity, ShieldAlert, FileText } from 'lucide-react';

export default function KnowledgeGraph({ signals = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('ALL');

  // Pre-configured graph node network for metabolic intelligence
  const initialNodes = [
    { id: 'n1', label: 'Eli Lilly', type: 'COMPETITOR', color: '#3B82F6', details: 'Global leader in Tirzepatide & Retatrutide clinical portfolio.' },
    { id: 'n2', label: 'Novo Nordisk', type: 'COMPETITOR', color: '#3B82F6', details: 'Host baseline franchise (Semaglutide, CagriSema).' },
    { id: 'n3', label: 'Amgen', type: 'COMPETITOR', color: '#3B82F6', details: 'Developing AMG 133 bispecific MariTide asset.' },
    
    { id: 'n4', label: 'NCT06214589', type: 'TRIAL', color: '#A855F7', details: 'Phase 3 Retatrutide trial evaluating obesity and MASH fibrosis.' },
    { id: 'n5', label: 'NCT05567796', type: 'TRIAL', color: '#A855F7', details: 'REDEFINE-1 trial comparing CagriSema against Tirzepatide.' },
    { id: 'n6', label: 'NCT05671510', type: 'TRIAL', color: '#A855F7', details: 'Phase 2 Study of AMG 133 in overweight/obese participants.' },

    { id: 'n7', label: 'GLP-1 R Agonist', type: 'TARGET', color: '#14B8A6', details: 'Incretin hormone receptor promoting insulin secretion & satiety.' },
    { id: 'n8', label: 'GIP Receptor', type: 'TARGET', color: '#14B8A6', details: 'Glucose-dependent insulinotropic polypeptide receptor target.' },
    { id: 'n9', label: 'Amylin Receptor', type: 'TARGET', color: '#14B8A6', details: 'Pancreatic hormone target slowing gastric emptying.' },

    { id: 'n10', label: 'Obesity & Body Weight', type: 'INDICATION', color: '#F59E0B', details: 'Primary therapeutic area with $100B+ market size by 2030.' },
    { id: 'n11', label: 'Type 2 Diabetes', type: 'INDICATION', color: '#F59E0B', details: 'Glycemic control and HbA1c reduction therapeutic indication.' },
    { id: 'n12', label: 'MASH / Steatohepatitis', type: 'INDICATION', color: '#F59E0B', details: 'Metabolic dysfunction-associated liver disease indication.' }
  ];

  const initialEdges = [
    { from: 'n1', to: 'n4', label: 'sponsors', x1: 160, y1: 120, x2: 320, y2: 100 },
    { from: 'n1', to: 'n7', label: 'targets', x1: 160, y1: 120, x2: 480, y2: 140 },
    { from: 'n1', to: 'n8', label: 'targets', x1: 160, y1: 120, x2: 480, y2: 240 },
    { from: 'n2', to: 'n5', label: 'sponsors', x1: 160, y1: 260, x2: 320, y2: 220 },
    { from: 'n2', to: 'n7', label: 'targets', x1: 160, y1: 260, x2: 480, y2: 140 },
    { from: 'n2', to: 'n9', label: 'targets', x1: 160, y1: 260, x2: 480, y2: 320 },
    { from: 'n3', to: 'n6', label: 'sponsors', x1: 160, y1: 400, x2: 320, y2: 360 },
    { from: 'n4', to: 'n10', label: 'treats', x1: 320, y1: 100, x2: 640, y2: 120 },
    { from: 'n4', to: 'n12', label: 'treats', x1: 320, y1: 100, x2: 640, y2: 360 },
    { from: 'n5', to: 'n10', label: 'treats', x1: 320, y1: 220, x2: 640, y2: 120 },
    { from: 'n5', to: 'n11', label: 'treats', x1: 320, y1: 220, x2: 640, y2: 240 },
    { from: 'n6', to: 'n10', label: 'treats', x1: 320, y1: 360, x2: 640, y2: 120 }
  ];

  // Node positions on SVG canvas
  const nodePositions = {
    n1: { x: 140, y: 120 },
    n2: { x: 140, y: 240 },
    n3: { x: 140, y: 360 },
    n4: { x: 340, y: 100 },
    n5: { x: 340, y: 220 },
    n6: { x: 340, y: 360 },
    n7: { x: 520, y: 120 },
    n8: { x: 520, y: 240 },
    n9: { x: 520, y: 360 },
    n10: { x: 700, y: 120 },
    n11: { x: 700, y: 240 },
    n12: { x: 700, y: 360 }
  };

  const filteredNodes = initialNodes.filter(n => {
    if (activeType !== 'ALL' && n.type !== activeType) return false;
    if (searchQuery && !n.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Controls & Legend Bar */}
      <div className="surface-1 rounded-xl p-4 border border-[#262830] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <GitBranch className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              KNOWLEDGE GRAPH & ENTITY RELATIONSHIP TERMINAL
            </h2>
            <p className="text-xs text-gray-400">
              Interactive relationship network connecting competitors, clinical trials, targets, and indications.
            </p>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search graph entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1A1B1F] text-xs font-mono rounded-md pl-8 pr-3 py-1.5 border border-[#262830] text-white focus:outline-none focus:border-blue-500 w-44"
            />
          </div>

          <div className="flex items-center space-x-1 bg-[#1A1B1F] p-1 rounded-md border border-[#262830] text-xs font-mono">
            {['ALL', 'COMPETITOR', 'TRIAL', 'TARGET', 'INDICATION'].map(t => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-2 py-1 rounded transition-colors ${
                  activeType === t ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas & Slide-over Details Panel Container */}
      <div className="relative surface-1 rounded-xl border border-[#262830] overflow-hidden min-h-[520px] flex">
        
        {/* SVG Interactive Canvas */}
        <div className="flex-1 p-6 relative bg-[#0A0B0D] flex items-center justify-center">
          
          {/* Canvas Background Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#262830_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

          <svg viewBox="0 0 840 480" className="w-full h-full max-w-[900px] max-h-[500px]">
            {/* Edge Connections */}
            {initialEdges.map((e, idx) => {
              const p1 = nodePositions[e.from];
              const p2 = nodePositions[e.to];
              if (!p1 || !p2) return null;

              const isConnected = selectedNode && (selectedNode.id === e.from || selectedNode.id === e.to);

              return (
                <g key={idx} className="group">
                  <line
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke={isConnected ? '#3B82F6' : '#262830'}
                    strokeWidth={isConnected ? 2.5 : 1.2}
                    strokeDasharray={isConnected ? 'none' : '4 4'}
                    className="transition-all"
                  />
                  {/* Hover Edge Label */}
                  <text
                    x={(p1.x + p2.x) / 2}
                    y={(p1.y + p2.y) / 2 - 6}
                    fill="#9CA3AF"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1"
                  >
                    {e.label}
                  </text>
                </g>
              );
            })}

            {/* Entity Nodes */}
            {filteredNodes.map((n) => {
              const pos = nodePositions[n.id];
              if (!pos) return null;
              const isSelected = selectedNode?.id === n.id;

              return (
                <g
                  key={n.id}
                  onClick={() => setSelectedNode(n)}
                  className="cursor-pointer group"
                >
                  {/* Outer Glow Halo if Selected */}
                  {isSelected && (
                    <circle
                      cx={pos.x} cy={pos.y} r="22"
                      fill="none" stroke={n.color} strokeWidth="2"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={pos.x} cy={pos.y} r="16"
                    fill="#131417" stroke={n.color} strokeWidth={isSelected ? 3 : 2}
                    className="transition-transform group-hover:scale-110"
                  />

                  {/* Inner Node Core */}
                  <circle cx={pos.x} cy={pos.y} r="5" fill={n.color} />

                  {/* Node Label */}
                  <text
                    x={pos.x} y={pos.y + 28}
                    fill={isSelected ? '#FFFFFF' : '#E5E7EB'}
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Graph Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-[#131417]/90 border border-[#262830] backdrop-blur-md rounded-lg p-2.5 text-[10px] font-mono text-gray-300 flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
              <span>COMPETITOR</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]"></span>
              <span>TRIAL / STUDY</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]"></span>
              <span>TARGET / MOA</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
              <span>INDICATION</span>
            </div>
          </div>

        </div>

        {/* Slide-over Details Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 bg-[#131417] border-l border-[#262830] p-5 shadow-2xl flex flex-col justify-between z-10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#262830] pb-3">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border" style={{ borderColor: selectedNode.color, color: selectedNode.color, backgroundColor: `${selectedNode.color}15` }}>
                    {selectedNode.type}
                  </span>
                  <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white font-mono">{selectedNode.label}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{selectedNode.details}</p>
                </div>

                <div className="surface-2 rounded-lg p-3 border border-[#262830] space-y-2">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">CONNECTED KNOWLEDGE TRACES</div>
                  <ul className="text-xs font-mono text-gray-300 space-y-1">
                    <li className="flex items-center justify-between">
                      <span>Related Signals:</span>
                      <strong className="text-blue-400">12 Signals</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Entity Centrality:</span>
                      <strong className="text-teal-400">High (8.4/10)</strong>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="w-full py-2 bg-[#1A1B1F] hover:bg-[#212226] border border-[#262830] text-xs font-mono text-gray-300 rounded-md transition-colors"
              >
                Close Slide-over
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
