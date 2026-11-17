import React, { useState, useEffect } from 'react';
import { clearAllLocalData } from '../db/database';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { 
  Settings, Server, CheckCircle2, AlertCircle, RefreshCw, 
  Database, Trash2, Cpu, Globe, Send, ShieldCheck, Loader2,
  Activity, Layers, HardDrive, Wifi
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [cleared, setCleared] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  const checkHealth = async () => {
    setApiStatus('checking');
    try {
      const res = await fetch(API_BASE_URL + '/ready', { method: 'GET' });
      if (res.ok) setApiStatus('online');
      else setApiStatus('offline');
    } catch {
      setApiStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramStatus('Verifying Telegram bot credentials...');
    try {
      const res = await fetch(API_BASE_URL + '/api/telegram/test');
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error('Telegram bot check failed');
      setTelegramStatus('Connected: @' + (data.username || 'unknown'));
    } catch {
      setTelegramStatus('Telegram bridge test unavailable (backend offline or unconfigured).');
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('Clear all custom characters and reset to default factory presets?')) {
      try {
        await clearAllLocalData();
        localStorage.clear();
        setCleared(true);
        window.location.reload();
      } catch {
        setCleared(false);
        setTelegramStatus('Could not clear local database. Close other tabs and retry.');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050A14] text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#1A2540] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-500/15 border border-purple-500/30 rounded-2xl text-purple-400 shadow-sm shadow-purple-500/10">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                System Diagnostics & Integrations
              </h1>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Ecosystem Hub
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Microservice connectivity, Telegram alerts pipeline, and local IndexedDB database maintenance.
            </p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A0F1E] hover:bg-[#121B30] border border-[#1A2540] hover:border-purple-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />
          <span>Refresh Services</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Connectivity Grid */}
        <div className="bg-[#0A0F1E] border border-[#1A2540] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              Microservice Network
            </h2>
            <span className="text-[10px] font-mono text-slate-500">Live Healthcheck</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Backend API */}
            <div className="bg-[#050A14] p-3.5 rounded-xl border border-[#1A2540] flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block text-xs">AuraCraft Backend API</strong>
                <span className="text-[10px] text-slate-500 font-mono break-all">{API_BASE_URL}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                apiStatus === 'online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                apiStatus === 'offline' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                'bg-slate-800/40 text-slate-300 border-slate-700'
              }`}>
                {apiStatus === 'online' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                <span>{apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Checking'}</span>
              </span>
            </div>

            {/* Narrativ Forge Bridge */}
            <div className="bg-[#050A14] p-3.5 rounded-xl border border-[#1A2540] flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block text-xs">Narrativ Forge Bridge</strong>
                <span className="text-[10px] text-slate-500 font-mono">Standalone Decoupled (JSON Pack Exchanger)</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                <CheckCircle2 className="w-3 h-3 text-purple-400" />
                <span>Decoupled Clean</span>
              </span>
            </div>

            {/* Edge-TTS Neural Service */}
            <div className="bg-[#050A14] p-3.5 rounded-xl border border-[#1A2540] flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block text-xs">Edge-TTS Multilingual Voice Engine</strong>
                <span className="text-[10px] text-slate-500 font-mono">Burmese &bull; Japanese &bull; English Neural</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Zero-Cost Ready</span>
              </span>
            </div>

            {/* Telegram Alerts Bridge */}
            <div className="bg-[#050A14] p-3.5 rounded-xl border border-[#1A2540] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-slate-200 block text-xs">The Nexus Hub Telegram Alerts</strong>
                  <span className="text-[10px] text-slate-500 font-mono">Real-time status bridge</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestTelegram}
                    disabled={isTestingTelegram}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-[10px] font-semibold transition-all active:scale-95"
                  >
                    {isTestingTelegram ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    <span>Test Bridge</span>
                  </button>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                    Topic 215
                  </span>
                </div>
              </div>
              {telegramStatus && (
                <div className="text-[11px] font-mono text-purple-300 bg-[#0A0F1E] px-3 py-1.5 rounded-lg border border-[#1A2540]">
                  {telegramStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Storage & Reset */}
        <div className="bg-[#0A0F1E] border border-[#1A2540] p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              Local Character Library Cache
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              Custom characters, personality prompts, and voice pairings created in AuraCraft Studio are stored securely in your browser's persistent Dexie IndexedDB storage.
            </p>

            <div className="bg-[#050A14] p-4 rounded-xl border border-[#1A2540] space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>3D Model & Blob Cache:</span>
                <span className="text-emerald-400 font-semibold">IndexedDB (Dexie)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Custom Preferences:</span>
                <span className="text-slate-200 font-semibold">Persistent LocalStorage</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Client Isolation:</span>
                <span className="text-purple-300 font-semibold">Sandboxed Origin</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1A2540] flex items-center justify-between">
            <span className="text-xs text-slate-500">Reset custom characters to factory presets</span>
            <button
              onClick={handleClearCache}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{cleared ? 'Cleared' : 'Reset Local Cache'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
