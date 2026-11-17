import React, { useState } from 'react';
import { buildObsSourceUrl } from './broadcastUtils';
import { 
  Tv, Copy, Check, Monitor, Sparkles, Layers, Sliders, 
  Radio, ShieldCheck, Wifi, Eye, Activity
} from 'lucide-react';

export const BroadcastPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [streamBg, setStreamBg] = useState<'transparent' | 'greenscreen' | 'cyber'>('transparent');
  const [resolution, setResolution] = useState('1080p');

  const obsUrl = buildObsSourceUrl(window.location.origin, streamBg, resolution);

  const handleCopy = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050A14] text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#1A2540] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-500/15 border border-purple-500/30 rounded-2xl text-purple-400 shadow-sm shadow-purple-500/10">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                OBS Studio & Broadcast Command
              </h1>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                60 FPS Live Overlay
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct browser-source integration for OBS Studio, Streamlabs, and vMix with real-time audio viseme lip-sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#0A0F1E] border border-[#1A2540] px-3.5 py-2 rounded-xl">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>Local Engine: <strong className="text-white">Active (Port 5173)</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: OBS URL & Modes (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-[#0A0F1E] border border-[#1A2540] p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-4 h-4 text-purple-400" />
              Browser Source Configuration
            </h2>
            <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-medium">
              Ultra Low-Latency
            </span>
          </div>

          {/* Browser Source URL box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Browser Source URL (OBS ထဲသို့ ထည့်သွင်းရမည့် Link)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={obsUrl}
                className="flex-1 bg-[#050A14] border border-[#1A2540] rounded-xl px-3.5 py-2.5 text-xs text-purple-300 font-mono select-all focus:outline-none focus:border-purple-500/70"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-600/25 transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Background Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Streaming Alpha & Canvas Background
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: 'transparent',
                  name: 'Alpha Transparent',
                  desc: '100% transparent channel for gameplay, video podcast, and desktop overlay.',
                  activeStyle: 'border-purple-500 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/40',
                },
                {
                  id: 'greenscreen',
                  name: 'Chroma Green',
                  desc: 'Solid #00FF00 green for OBS native Chroma Key hardware filter.',
                  activeStyle: 'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40',
                },
                {
                  id: 'cyber',
                  name: 'Obsidian Stage',
                  desc: 'Deep cyberpunk stage with pedestal floor and directional studio rim lights.',
                  activeStyle: 'border-cyan-500 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/40',
                },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setStreamBg(m.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    streamBg === m.id
                      ? m.activeStyle
                      : 'bg-[#050A14] border-[#1A2540] hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold mb-1 text-slate-200">{m.name}</div>
                  <div className="text-[11px] leading-relaxed opacity-80">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution & Specs */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Output Canvas Engine Parameters
            </label>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-[#050A14] p-3 rounded-xl border border-[#1A2540]">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Resolution</span>
                <select
                  aria-label="OBS resolution"
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value)}
                  className="w-full bg-[#0A0F1E] border border-[#1A2540] rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-purple-500/70"
                >
                  <option value="1080p">1920 × 1080 (FHD 1080p)</option>
                  <option value="720p">1280 × 720 (HD 720p)</option>
                  <option value="480p">854 × 480 (SD 480p)</option>
                </select>
              </div>
              <div className="bg-[#050A14] p-3 rounded-xl border border-[#1A2540]">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Target Framerate</span>
                <span className="font-bold text-emerald-400 text-xs">60 FPS WebGL 2.0</span>
              </div>
              <div className="bg-[#050A14] p-3 rounded-xl border border-[#1A2540]">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Lip-Sync Latency</span>
                <span className="font-bold text-cyan-400 text-xs">&lt; 12 ms (Local Host)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Step-by-step Setup Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[#0A0F1E] border border-[#1A2540] p-6 rounded-2xl shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            OBS Studio Integration Guide
          </h2>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-purple-500/30">
                1
              </span>
              <div>
                <strong className="text-white block mb-0.5">OBS Studio ကို ဖွင့်ပါ</strong>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sources အကွက်တွင် <span className="text-purple-300 font-mono">+ (Add Source)</span> ကို နှိပ်ပြီး <span className="text-purple-300 font-semibold">Browser</span> Source ကို ရွေးချယ်ပါ။
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-purple-500/30">
                2
              </span>
              <div>
                <strong className="text-white block mb-0.5">URL ကို ထည့်သွင်းပါ</strong>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ဘယ်ဘက်ရှိ <span className="text-purple-300 font-mono">Copy Link</span> ခလုတ်ကို နှိပ်၍ Browser Source URL တွင် Paste လုပ်ပါ။ Width: 1920, Height: 1080 ဟု ထည့်ပါ။
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-purple-500/30">
                3
              </span>
              <div>
                <strong className="text-white block mb-0.5">Control Audio via OBS</strong>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-emerald-300">"Control audio via OBS"</span> ကို ရွေးချယ်ပါက အသံထွက်နှင့် နှုတ်ခမ်းလှုပ်ရှားမှု (Lip-Sync) ကို OBS Mixer မှ တိုက်ရိုက် ထိန်းချုပ်နိုင်ပါသည်။
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-purple-500/30">
                4
              </span>
              <div>
                <strong className="text-white block mb-0.5">Live Broadcast စတင်ပါ</strong>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  စကားပြောလိုက်သည်နှင့် 3D Persona ၏ မျက်တောင်ခတ်ခြင်း၊ ဦးခေါင်းလှုပ်ရှားမှုနှင့် သဘာဝကျသော Lip-Sync ကို Live Stream တွင် တွေ့မြင်ရပါမည်။
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
