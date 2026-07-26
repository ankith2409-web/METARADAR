import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CommandCenter from './components/CommandCenter';
import BattleCards from './components/BattleCards';
import KnowledgeGraph from './components/KnowledgeGraph';
import AlertFeed from './components/AlertFeed';
import InflectionMonitor from './components/InflectionMonitor';
import AgentTraceModal from './components/AgentTraceModal';

import { 
  getSignals, 
  getThreads, 
  getInflections, 
  getBattleCards, 
  triggerIngestion 
} from './api/client';

import { LayoutDashboard, Building, GitBranch, Radio, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [signals, setSignals] = useState([]);
  const [threads, setThreads] = useState([]);
  const [inflections, setInflections] = useState([]);
  const [battleCards, setBattleCards] = useState([]);

  const [selectedSignal, setSelectedSignal] = useState(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [replayMode, setReplayMode] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    fetchData();
  }, [selectedCompetitor, searchQuery, replayMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCompetitor !== 'ALL') params.competitor = selectedCompetitor;
      if (searchQuery) params.search = searchQuery;

      const [sigData, thData, infData, bcData] = await Promise.all([
        getSignals(params),
        getThreads(),
        getInflections(),
        getBattleCards()
      ]);

      const fetchedSignals = sigData.signals || [];
      setSignals(fetchedSignals);
      setThreads(thData || []);
      setInflections(infData || []);
      setBattleCards(bcData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerIngestion = async () => {
    try {
      setIsIngesting(true);
      await triggerIngestion(replayMode);
      await fetchData();
    } catch (err) {
      console.error('Ingestion failed:', err);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F4F4F5] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Bloomberg Terminal Header Chrome */}
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCompetitor={selectedCompetitor}
        setSelectedCompetitor={setSelectedCompetitor}
        onTriggerIngestion={handleTriggerIngestion}
        isIngesting={isIngesting}
        replayMode={replayMode}
        setReplayMode={setReplayMode}
      />

      {/* 2. Main Navigation Bar */}
      <nav className="bg-[#131417] border-b border-[#262830] px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('command')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'command' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. COMMAND CENTER</span>
          </button>

          <button
            onClick={() => setActiveTab('battlecards')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'battlecards' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>2. BATTLE CARDS</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'graph' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <GitBranch className="w-4 h-4 text-teal-400" />
            <span>3. KNOWLEDGE GRAPH</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'feed' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-purple-400" />
            <span>4. LIVE ALERTS FEED</span>
          </button>

          <button
            onClick={() => setActiveTab('inflections')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'inflections' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>5. INFLECTION ANALYTICS</span>
          </button>

        </div>
      </nav>

      {/* 3. Core View Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <div className="text-xs font-mono text-gray-400">INITIALIZING METARADAR TERMINAL ENGINE...</div>
          </div>
        ) : (
          <>
            {activeTab === 'command' && (
              <CommandCenter 
                signals={signals}
                inflections={inflections}
                battleCards={battleCards}
                selectedCompetitor={selectedCompetitor}
                setSelectedCompetitor={setSelectedCompetitor}
                onSelectSignal={(sig) => setSelectedSignal(sig)}
              />
            )}

            {activeTab === 'battlecards' && (
              <BattleCards cards={battleCards} />
            )}

            {activeTab === 'graph' && (
              <KnowledgeGraph signals={signals} />
            )}

            {activeTab === 'feed' && (
              <AlertFeed 
                signals={signals}
                onSelectSignal={(sig) => setSelectedSignal(sig)}
              />
            )}

            {activeTab === 'inflections' && (
              <InflectionMonitor inflections={inflections} />
            )}
          </>
        )}
      </main>

      {/* Agent Trace Inspection Modal */}
      {selectedSignal && (
        <AgentTraceModal 
          signal={selectedSignal} 
          onClose={() => setSelectedSignal(null)} 
        />
      )}

      {/* Terminal Footer */}
      <footer className="bg-[#131417] border-t border-[#262830] py-3 px-6 text-center text-xs font-mono text-gray-400 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div>MetaRadar Enterprise Terminal v2.4</div>
        <div className="text-gray-400">Novo Nordisk GBS Hackathon Solution</div>
        <div>Security Audit: Hardened</div>
      </footer>

    </div>
  );
}
