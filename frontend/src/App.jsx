import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RadarTimeline from './components/RadarTimeline';
import AlertFeed from './components/AlertFeed';
import AgentTraceModal from './components/AgentTraceModal';
import StoryTimeline from './components/StoryTimeline';
import InflectionMonitor from './components/InflectionMonitor';
import BattleCards from './components/BattleCards';
import RoutingQueue from './components/RoutingQueue';

import { 
  getSignals, 
  getThreads, 
  getInflections, 
  getBattleCards, 
  triggerIngestion 
} from './api/client';

import { LayoutDashboard, GitBranch, Zap, Building, Send } from 'lucide-react';


export default function App() {
  const [activeTab, setActiveTab] = useState('radar');
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Header */}
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

      {/* Main Tab Navigation Bar */}
      <nav className="bg-[#131B2E] border-b border-white/10 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'radar' 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Radar & Signals Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('threads')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'threads' 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Narrative Threads</span>
          </button>

          <button
            onClick={() => setActiveTab('inflections')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inflections' 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Inflection Monitor</span>
          </button>

          <button
            onClick={() => setActiveTab('routing')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'routing' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 border border-purple-400/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4 text-purple-400" />
            <span>Routing Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('battlecards')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'battlecards' 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Battle Cards</span>
          </button>

        </div>
      </nav>


      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            {activeTab === 'radar' && (
              <div className="space-y-6">
                <RadarTimeline 
                  signals={signals} 
                  selectedCompetitor={selectedCompetitor}
                  setSelectedCompetitor={setSelectedCompetitor}
                  onSelectSignal={(sig) => setSelectedSignal(sig)}
                />

                <AlertFeed 
                  signals={signals} 
                  onSelectSignal={(sig) => setSelectedSignal(sig)}
                />
              </div>
            )}

            {activeTab === 'threads' && (
              <StoryTimeline 
                threads={threads} 
                onSelectSignal={(sig) => setSelectedSignal(sig)}
              />
            )}

            {activeTab === 'inflections' && (
              <InflectionMonitor inflections={inflections} />
            )}

            {activeTab === 'routing' && (
              <RoutingQueue 
                signals={signals}
                onSelectSignal={(sig) => setSelectedSignal(sig)}
              />
            )}

            {activeTab === 'battlecards' && (
              <BattleCards cards={battleCards} />
            )}
          </>
        )}

      </main>


      {/* Agent Trace Modal */}
      {selectedSignal && (
        <AgentTraceModal 
          signal={selectedSignal} 
          onClose={() => setSelectedSignal(null)} 
        />
      )}

      {/* Footer */}
      <footer className="bg-[#151C2C] border-t border-[#232F48] py-4 text-center text-xs text-slate-400">
        MetaRadar &copy; 2026 — Novo Nordisk GBS Hackathon Problem Statement #3 Solution
      </footer>

    </div>
  );
}
