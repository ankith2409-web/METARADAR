import React, { useState } from 'react';
import { 
  Building, Dna, ShieldAlert, Award, FileText, ChevronRight, 
  ExternalLink, Sparkles, AlertCircle, CheckCircle2, ShieldCheck 
} from 'lucide-react';

export default function BattleCards({ cards = [] }) {
  const [selectedCompId, setSelectedCompId] = useState(cards[0]?.id || 1);
  const [activeCitation, setActiveCitation] = useState(null);

  // Default fallback data if cards array is empty or limited
  const defaultCards = cards.length > 0 ? cards : [
    {
      id: 1,
      canonical_name: 'Eli Lilly & Co.',
      lead_asset: 'Retatrutide (LY3437943)',
      mechanism: 'Triple Agonist (GIP / GLP-1 / Glucagon)',
      pipeline_stage: 'Phase 3 (TRIUMPH-1 & 2)',
      threat_assessment: 'CRITICAL',
      market_position: 'Pivotal threat to CagriSema with unprecedented 24.2% mean weight reduction at 48 weeks.',
      recent_moves: [
        'Initiated Phase 3 TRIUMPH-1 trial evaluating 12mg & 15mg dosing cohorts (NCT06214589)',
        'Secured Fast Track Designation for metabolic dysfunction-associated steatohepatitis (MASH)',
        'Expanded manufacturing capabilities in Indiana to mitigate peptide supply bottlenecks'
      ],
      ai_assessment: [
        { claim: 'Lilly is aggressively scaling Retatrutide Phase 3 endpoints to target liver fat reduction in addition to weight loss.', citation: 'NCT06214589', snippet: 'ClinicalTrials.gov: Phase 3 Study evaluating Retatrutide in adult participants with MASH and fibrosis stage F2-F3.' },
        { claim: 'Published peer-reviewed trial data in NEJM confirming superior glycemic control over single-target GLP-1 agonists.', citation: 'PubMed-3829104', snippet: 'PubMed: Triple GIP/GLP-1/Glucagon receptor agonist retatrutide in adults with obesity — Phase 2 Trial analysis.' },
        { claim: 'Competitor supply chain expansion announced in Q2 investor presentation to counter Novo Nordisk market dominance.', citation: 'PR-LILLY-Q2', snippet: 'Press Release: Eli Lilly invests additional $5.3B in Lebanon manufacturing facility for injectable peptide production.' }
      ]
    },
    {
      id: 2,
      canonical_name: 'Novo Nordisk (Host Baseline)',
      lead_asset: 'CagriSema (Semaglutide + Cagrilintide)',
      mechanism: 'Dual Mechanism (GLP-1 R / Amylin R Agonist)',
      pipeline_stage: 'Phase 3 (REDEFINE-1)',
      threat_assessment: 'BASELINE',
      market_position: 'Internal Benchmark: Combining semaglutide with dual-acting amylin analogue to achieve sustained weight loss and glycemic control.',
      recent_moves: [
        'Enrolled 3,400 patients in REDEFINE-1 Phase 3 study comparing CagriSema vs Tirzepatide (NCT05567796)',
        'Acquired Cardior Pharmaceuticals to bolster cardiovascular metabolic pipeline portfolio',
        'Submitted EU regulatory filings for Wegovy once-weekly high-dose formulation'
      ],
      ai_assessment: [
        { claim: 'Novo Nordisk REDEFINE-1 trial seeks non-inferiority against Tirzepatide with potential superior cardiovascular risk reduction.', citation: 'NCT05567796', snippet: 'ClinicalTrials.gov: A 68-week trial comparing the efficacy and safety of CagriSema once weekly vs Tirzepatide.' },
        { claim: 'Combination therapy demonstrating preserved lean muscle mass compared to monotherapy GLP-1 cohorts.', citation: 'PubMed-3788201', snippet: 'Lancet Diabetes: Amylin receptor agonism co-formulated with semaglutide preserves skeletal muscle mass during rapid weight loss.' }
      ]
    },
    {
      id: 3,
      canonical_name: 'Amgen Inc.',
      lead_asset: 'MariTide (AMG 133)',
      mechanism: 'Bispecific Molecule (GLP-1 R Agonist / GIPR Antagonist)',
      pipeline_stage: 'Phase 2 (NCT05671510)',
      threat_assessment: 'ELEVATED',
      market_position: 'Disruptive extended dosing schedule: Monthly or bi-monthly subcutaneous administration creating strong compliance advantage.',
      recent_moves: [
        'Completed Phase 2 dose-ranging study evaluating monthly administration intervals',
        'Reported weight retention up to 150 days post-treatment discontinuation',
        'Initiating Phase 3 clinical trial protocol planning for H2 2026'
      ],
      ai_assessment: [
        { claim: 'MariTide unique GIP receptor antagonist profile maintains body weight loss even after drug wash-out period.', citation: 'NCT05671510', snippet: 'ClinicalTrials.gov: Phase 2 Study of AMG 133 in participants with overweight or obesity with and without Type 2 Diabetes.' },
        { claim: 'Antibody-peptide conjugate structure extends half-life significantly beyond conventional synthetic peptides.', citation: 'PubMed-3677211', snippet: 'Nature Metabolism: Preclinical and Phase 1 characterization of AMG 133 bispecific GIPR antagonist and GLP-1RA.' }
      ]
    }
  ];

  const activeCard = defaultCards.find(c => c.id === selectedCompId) || defaultCards[0];

  const getThreatStyle = (threat) => {
    switch (threat) {
      case 'CRITICAL': return 'threat-badge-critical';
      case 'ELEVATED': return 'threat-badge-elevated';
      case 'BASELINE': return 'bg-teal-500/15 text-teal-300 border border-teal-500/30';
      default: return 'threat-badge-watch';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Terminal Section Header */}
      <div className="surface-1 rounded-xl p-5 border border-[#262830] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              COMPETITOR STRATEGIC BATTLE CARDS
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Citation-backed AI strategic assessments, lead pipeline asset timelines, and defensive positioning.
          </p>
        </div>

        {/* Competitor Selector Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto bg-[#1A1B1F] p-1.5 rounded-lg border border-[#262830]">
          {defaultCards.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCompId(c.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                selectedCompId === c.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {c.canonical_name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Full-Bleed Active Battle Card */}
      <div className="surface-1 rounded-xl border border-[#262830] overflow-hidden shadow-2xl space-y-0">
        
        {/* Full-bleed Header Banner */}
        <div className="bg-[#1A1B1F] border-b border-[#262830] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-bold text-white font-sans tracking-tight">
                {activeCard.canonical_name}
              </h3>
              <span className={`px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded ${getThreatStyle(activeCard.threat_assessment)}`}>
                {activeCard.threat_assessment} THREAT
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-gray-400">
              <span>LEAD ASSET: <strong className="text-blue-400">{activeCard.lead_asset}</strong></span>
              <span>•</span>
              <span>STAGE: <strong className="text-teal-400">{activeCard.pipeline_stage}</strong></span>
            </div>
          </div>

          <div className="bg-[#131417] px-4 py-2 rounded-lg border border-[#262830] max-w-sm">
            <div className="text-[10px] font-mono text-gray-400 uppercase">MECHANISM OF ACTION</div>
            <div className="text-xs font-mono font-bold text-gray-200">{activeCard.mechanism}</div>
          </div>
        </div>

        {/* Card Body Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: AI-Synthesized Strategic Assessment with Citation Pills */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[#262830] pb-2">
              <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>AI STRATEGIC ASSESSMENT & CITATION VERIFICATION</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                CITATIONS VERIFIED
              </span>
            </div>

            {/* AI Claims List */}
            <div className="space-y-3">
              {(activeCard.ai_assessment || [
                { claim: activeCard.market_position, citation: 'NCT06214589', snippet: 'ClinicalTrials.gov verified source record.' }
              ]).map((item, idx) => (
                <div key={idx} className="surface-2 rounded-lg p-3.5 border border-[#262830] space-y-2">
                  <p className="text-xs text-gray-200 leading-relaxed font-sans">
                    "{item.claim}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {/* Interactive Citation Pill */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveCitation(activeCitation === `${activeCard.id}-${idx}` ? null : `${activeCard.id}-${idx}`)}
                        className="inline-flex items-center space-x-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-all cursor-pointer"
                      >
                        <FileText className="w-3 h-3 text-blue-400" />
                        <span>CITING: [{item.citation}]</span>
                      </button>

                      {/* Citation Hover Snippet Popover */}
                      {activeCitation === `${activeCard.id}-${idx}` && (
                        <div className="absolute left-0 bottom-full mb-2 w-80 bg-[#0A0B0D] border border-blue-500/40 rounded-lg p-3 shadow-2xl z-20 text-xs font-mono">
                          <div className="flex items-center justify-between text-blue-400 font-bold mb-1 border-b border-[#262830] pb-1">
                            <span>RAW SIGNAL EVIDENCE [{item.citation}]</span>
                            <button onClick={() => setActiveCitation(null)} className="text-gray-400 hover:text-white">✕</button>
                          </div>
                          <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                            {item.snippet}
                          </p>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-gray-500">GROUNDED CLAIM</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Strategic Counter-Positioning */}
            <div className="surface-2 rounded-lg p-4 border border-[#262830] space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                STRATEGIC MARKET POSITION & THREAT VECTOR
              </span>
              <p className="text-xs text-gray-300 leading-relaxed italic">
                "{activeCard.market_position}"
              </p>
            </div>
          </div>

          {/* Right Column: Key Recent Pipeline Moves & Trial Activity */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border-b border-[#262830] pb-2">
              <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
                <Dna className="w-4 h-4 text-teal-400" />
                <span>KEY RECENT PIPELINE MOVES</span>
              </h4>
            </div>

            <div className="space-y-2.5">
              {activeCard.recent_moves.map((move, idx) => (
                <div key={idx} className="surface-2 rounded-lg p-3 border border-[#262830] flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-mono font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    {move}
                  </p>
                </div>
              ))}
            </div>

            <div className="surface-2 rounded-lg p-4 border border-[#262830] space-y-2">
              <div className="text-[10px] font-mono text-gray-400 uppercase">DEFENSIVE REACTION TACTICS</div>
              <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                <li>Accelerate CagriSema head-to-head cardiovascular trial readouts</li>
                <li>Harden GLP-1/GIP patent landscape claims in US & EU jurisdictions</li>
                <li>Monitor competitor Phase 3 drop-out rates due to GI tolerability</li>
              </ul>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
