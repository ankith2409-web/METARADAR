import React, { useState, useEffect, useRef } from 'react';
import { Activity, Search, ShieldCheck, Key, RefreshCw, Zap, Radio, Database, Cpu } from 'lucide-react';
import { getSystemStatus, updateApiKey } from '../api/client';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  isIngesting, 
  onTriggerIngestion,
  replayMode,
  setReplayMode 
}) {
  const searchInputRef = useRef(null);
  const [aiStatus, setAiStatus] = useState({
    has_api_key: false,
    is_live_ai: false,
    provider: 'None',
    masked_key: 'Unconfigured',
    security_audit: { security_status: "ENTERPRISE_HARDENED" }
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeUtc, setTimeUtc] = useState('');

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(() => {
      const d = new Date();
      setTimeUtc(d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await getSystemStatus();
      setAiStatus(res);
    } catch (err) {
      console.warn("Failed to fetch status", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setSavingKey(true);
    setErrorMessage('');
    try {
      await updateApiKey(keyInput.trim());
      setShowKeyModal(false);
      setKeyInput('');
      fetchStatus();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Key validation failed.");
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <header className="bg-[#0A0B0D] border-b border-[#262830] sticky top-0 z-30 font-sans">
      
      {/* 1. Top Slim Status Bar (Bloomberg Terminal Style) */}
      <div className="bg-[#131417] border-b border-[#262830]/80 px-6 py-1.5 text-[11px] font-mono text-gray-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow"></span>
            <span>SYSTEM LIVE</span>
          </div>
          <span className="text-gray-600">|</span>
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>METABOLIC PIPELINE RADAR</span>
          </div>
          <span className="text-gray-600">|</span>
          <div className="text-gray-300">
            LAST INGEST: <span className="text-blue-400 font-bold">{timeUtc || 'SYNCING...'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>ACTIVE MONITORS:</span>
            <span className="text-teal-400 font-bold">14 DRUGS</span>
            <span className="text-gray-600">•</span>
            <span className="text-teal-400 font-bold">48 NCT TRIALS</span>
          </div>
          <span className="text-gray-600">|</span>
          <div className="flex items-center space-x-1 text-amber-400 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>SIGNALS TODAY: 1,482</span>
          </div>
        </div>
      </div>

      {/* 2. Main Terminal Header Chrome */}
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-bold text-white tracking-tight font-sans">MetaRadar</h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
                ENTERPRISE TERMINAL
              </span>
            </div>
            <p className="text-xs text-gray-400 font-sans">
              Autonomous Competitive Intelligence for Metabolic & GLP-1 Therapeutics
            </p>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center space-x-3">
          
          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Search targets, compounds, NCT IDs... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#131417] text-gray-100 text-xs font-mono rounded-md pl-9 pr-8 py-2 w-64 md:w-72 border border-[#262830] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* AI Security & API Key Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border text-xs font-mono transition-all ${
              aiStatus.has_api_key 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{aiStatus.has_api_key ? 'LLM: ACTIVE' : 'ENGINE: LOCAL'}</span>
          </button>

          {/* Trigger Ingestion Stream */}
          <button
            onClick={onTriggerIngestion}
            disabled={isIngesting}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-md shadow-blue-600/20 border border-blue-400/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
            <span>{isIngesting ? 'INGESTING...' : 'RUN INGESTION'}</span>
          </button>

        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131417] border border-[#262830] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#262830] pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Key className="w-4 h-4 text-blue-400" />
                <span>CONFIGURE GEMINI / LLM KEY</span>
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-gray-300">
              Provide a Google Gemini API Key to enable dynamic LLM multi-agent reasoning, strategic battle card generation, and threat synthesis.
            </p>
            <form onSubmit={handleSaveKey} className="space-y-3">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full bg-[#1A1B1F] border border-[#262830] rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              {errorMessage && <p className="text-xs text-red-400 font-mono">{errorMessage}</p>}
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowKeyModal(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={savingKey} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md">
                  {savingKey ? 'Validating...' : 'Save & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
}
