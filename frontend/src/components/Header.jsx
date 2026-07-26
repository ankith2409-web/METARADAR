import React, { useState, useEffect, useRef } from 'react';
import { Activity, RefreshCw, Search, Command, Key, CheckCircle2, AlertCircle, X, Sparkles, Cpu, ShieldCheck, Lock, FileCheck } from 'lucide-react';
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
    notification_title: 'Deterministic Engine Active',
    notification_message: 'Running on local zero-dependency engine.',
    security_audit: {
      security_status: "ENTERPRISE_HARDENED",
      owasp_headers_active: true,
      rate_limiter_active: true,
      rate_limit_max: "120 requests/min",
      input_sanitization: "Active (XSS/SQLi Guarded)",
      key_masking: "Active (Secrets Never Exported)",
      strict_dollar_guardrail: "Active"
    }
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch status on load
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await getSystemStatus();
      setAiStatus(res);
    } catch (err) {
      console.warn("Failed to fetch system status", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
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
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowKeyModal(false);
        setKeyInput('');
        fetchStatus();
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.detail || "Security Error: Key format validation failed.";
      setErrorMessage(msg);
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <header className="bg-[#0F172A]/90 border-b border-white/10 sticky top-0 z-30 px-6 py-3.5 backdrop-blur-md shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-9 w-9 rounded-xl bg-cyan-400 opacity-20"></span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
                MetaRadar <span className="text-cyan-400 font-mono text-sm font-semibold">v2.0</span>
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 tracking-wide">
                Novo Nordisk Hackathon
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              AI-Powered Competitive Intelligence & Market Evolution Radar for Metabolic Disease
            </p>
          </div>
        </div>

        {/* Global Controls & Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Enterprise Cybersecurity Shield Badge */}
          <button
            onClick={() => setShowSecurityModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
            title="Click to view Enterprise Security Audit & Policy Enforcement"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Security: Enterprise Hardened</span>
          </button>

          {/* AI Status Indicator Badge */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all shadow-md active:scale-95 ${
              aiStatus.is_live_ai 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25 shadow-emerald-500/10'
                : 'bg-blue-500/15 text-blue-300 border-blue-500/40 hover:bg-blue-500/25 shadow-blue-500/10'
            }`}
            title={aiStatus.notification_message}
          >
            <div className="relative flex items-center justify-center">
              <span className={`animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full ${
                aiStatus.is_live_ai ? 'bg-emerald-400' : 'bg-blue-400'
              } opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                aiStatus.is_live_ai ? 'bg-emerald-400' : 'bg-blue-400'
              }`}></span>
            </div>

            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>{aiStatus.is_live_ai ? 'Live AI API Active' : 'Deterministic Engine Active'}</span>
            <Key className="w-3 h-3 text-slate-400 ml-0.5 hover:text-white" />
          </button>

          {/* Universal Search Bar with Ctrl+K shortcut */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search drugs, competitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#131B2E] border border-white/10 rounded-xl pl-9 pr-14 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all w-48 md:w-56 shadow-inner"
            />
            <div className="absolute right-2.5 flex items-center space-x-0.5 bg-[#0B0F19] px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-slate-400 font-mono pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>

          {/* Mode Toggle (Replay vs Live) */}
          <div className="flex items-center bg-[#131B2E] border border-white/10 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setReplayMode(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                replayMode 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Replay Mode
            </button>
            <button
              onClick={() => setReplayMode(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                !replayMode 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live API
            </button>
          </div>

          {/* Manual Ingestion Trigger */}
          <button
            onClick={onTriggerIngestion}
            disabled={isIngesting}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border border-cyan-500/40 rounded-xl text-xs font-semibold text-cyan-300 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-cyan-500/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
            <span>{isIngesting ? 'Ingesting...' : 'Poll Sources'}</span>
          </button>
        </div>

      </div>

      {/* Cybersecurity Audit Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl bg-[#0F172A] relative animate-in fade-in zoom-in duration-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Enterprise Cybersecurity Controls & Audit</h3>
                  <span className="text-xs text-slate-400 font-mono">Zero-Trust Architecture Standard</span>
                </div>
              </div>
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#131B2E] border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" /> OWASP Security Headers:
                </span>
                <span className="text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">HSTS + CSP + No-Sniff</span>
              </div>

              <div className="p-3 bg-[#131B2E] border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Sliding Rate Limiter:
                </span>
                <span className="text-cyan-300 font-bold bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">120 Req/Min Anti-DDoS</span>
              </div>

              <div className="p-3 bg-[#131B2E] border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-400" /> Input Sanitization:
                </span>
                <span className="text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">XSS / SQLi Neutralized</span>
              </div>

              <div className="p-3 bg-[#131B2E] border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" /> Secret Key Protection:
                </span>
                <span className="text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">Masked In-Memory</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#0B0F19] border border-white/10 rounded-xl text-slate-300 text-xs leading-relaxed font-sans">
              <strong>CISO Assurance Note:</strong> All API requests pass through strict validation, parameterized query layers, and encrypted transports. Secret API keys are sanitized before memory logging.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSecurityModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Key Settings Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl bg-[#0F172A] relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Engine & API Key Configuration</h3>
                  <span className="text-xs text-slate-400 font-mono">Real-time Model Provider Status</span>
                </div>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Notification Box */}
            <div className={`p-4 rounded-xl border text-xs mb-5 font-mono ${
              aiStatus.is_live_ai
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <div className="flex items-center gap-2">
                  {aiStatus.is_live_ai ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
                  <span>{aiStatus.notification_title}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Key: {aiStatus.masked_key}</span>
              </div>
              <p className="text-slate-300 font-sans leading-relaxed">
                {aiStatus.notification_message}
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                  Enter OpenAI / Anthropic API Key:
                </label>
                <input
                  type="password"
                  placeholder="sk-proj-... or sk-ant-..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full bg-[#131B2E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 block mt-1 leading-normal">
                  Validated against security pattern matcher. Leaving blank retains local deterministic engine.
                </span>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold font-mono">
                  {errorMessage}
                </div>
              )}

              {saveSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>API Key Validated & Live AI Activated!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingKey || !keyInput.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  {savingKey ? 'Validating...' : 'Validate & Activate Live AI'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </header>
  );
}
