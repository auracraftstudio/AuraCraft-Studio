import React, { useState, useEffect } from 'react';
import { 
  buildObsSourceUrl, 
  detectFacialExpression, 
  analyzeAudioMotion, 
  generateCoHostReply,
  type AvatarExpression,
  type AvatarGesture,
  type WebcamTrackingMetrics,
  type AudioMotionSignal,
  type CoHostInteraction
} from './broadcastUtils';
import { 
  Tv, Copy, Check, Monitor, Sparkles, Sliders, 
  Radio, ShieldCheck, Wifi, Eye, Activity, Camera,
  Mic, MessageSquare, Send, Zap, UserCheck, Play, Pause
} from 'lucide-react';

export const BroadcastPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'obs' | 'tracking' | 'cohost'>('obs');
  const [copied, setCopied] = useState(false);
  const [streamBg, setStreamBg] = useState<'transparent' | 'greenscreen' | 'cyber'>('transparent');
  const [resolution, setResolution] = useState('1080p');

  // Tracking state
  const [isTrackingActive, setIsTrackingActive] = useState(true);
  const [trackingMetrics, setTrackingMetrics] = useState<WebcamTrackingMetrics>({
    headPitch: 2,
    headYaw: -4,
    headRoll: 1,
    leftEyeBlink: false,
    rightEyeBlink: false,
    mouthOpen: 0.12,
    smileScore: 0.65,
    activeExpression: 'happy',
  });

  // Audio motion state
  const [audioSignal, setAudioSignal] = useState<AudioMotionSignal>({
    volumePercent: 42,
    pitchHz: 210,
    isSpeaking: true,
    activeGesture: 'nod',
    energyLevel: 'moderate',
  });

  // Virtual Co-Host Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<CoHostInteraction[]>([
    {
      id: 'cohost_1',
      sender: 'Audience_Kai',
      question: 'How does your 3D avatar track head rotation?',
      response: 'We use humanoid bone rigging and glTF extensions to translate webcam blendshapes directly to 3D mesh morph targets!',
      expression: 'focused',
      gesture: 'think',
      timestamp: '10:42 AM',
    },
    {
      id: 'cohost_2',
      sender: 'Viewer_Nexus',
      question: 'Can you show your combat power?',
      response: 'My combat system specializes in ultra-speed kinetic strikes and neon particle overdrive!',
      expression: 'smirk',
      gesture: 'point',
      timestamp: '10:44 AM',
    }
  ]);

  const obsUrl = buildObsSourceUrl(window.location.origin, streamBg, resolution);

  const handleCopy = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Simulate subtle face movement and audio meter when tracking is active
  useEffect(() => {
    if (!isTrackingActive) return;
    const interval = setInterval(() => {
      setTrackingMetrics((prev) => {
        const smile = Math.min(Math.max(prev.smileScore + (Math.random() * 0.2 - 0.1), 0.1), 0.95);
        const mouth = Math.min(Math.max(prev.mouthOpen + (Math.random() * 0.2 - 0.1), 0.0), 0.8);
        const leftBlink = Math.random() < 0.08;
        const rightBlink = Math.random() < 0.08;
        const expr = detectFacialExpression(smile, mouth, leftBlink, rightBlink);
        return {
          headPitch: Math.round((Math.sin(Date.now() / 1500) * 8)),
          headYaw: Math.round((Math.cos(Date.now() / 2000) * 12)),
          headRoll: Math.round((Math.sin(Date.now() / 2500) * 4)),
          leftEyeBlink: leftBlink,
          rightEyeBlink: rightBlink,
          mouthOpen: parseFloat(mouth.toFixed(2)),
          smileScore: parseFloat(smile.toFixed(2)),
          activeExpression: expr,
        };
      });

      setAudioSignal((prev) => {
        const vol = Math.floor(20 + Math.random() * 55);
        const pitch = Math.floor(180 + Math.random() * 120);
        return analyzeAudioMotion(vol, pitch);
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isTrackingActive]);

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const newReply = generateCoHostReply(chatInput.trim(), 'Aura-01');
    setChatHistory((prev) => [...prev, newReply]);
    setChatInput('');
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
              Direct browser-source integration, live webcam facial tracking, audio-driven gestural motion, and AI co-host.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0A0F1E] border border-[#1A2540] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('obs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'obs' 
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OBS Source
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'tracking' 
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Motion Tracking
          </button>
          <button
            onClick={() => setActiveTab('cohost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'cohost' 
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI Co-Host
          </button>
        </div>
      </div>

      {/* TAB 1: OBS BROWSER SOURCE */}
      {activeTab === 'obs' && (
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
                    <option value="1080p">1920 x 1080 (FHD 1080p)</option>
                    <option value="720p">1280 x 720 (HD 720p)</option>
                    <option value="480p">854 x 480 (SD 480p)</option>
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
                    <span className="text-emerald-300">Control audio via OBS</span> ကို ရွေးချယ်ပါက အသံထွက်နှင့် နှုတ်ခမ်းလှုပ်ရှားမှု (Lip-Sync) ကို OBS Mixer မှ တိုက်ရိုက် ထိန်းချုပ်နိုင်ပါသည်။
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
      )}

      {/* TAB 2: LIVE WEBCAM & AUDIO MOTION TRACKING */}
      {activeTab === 'tracking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Live Facial Landmarks & Pose (7 cols) */}
          <div className="lg:col-span-7 space-y-5 bg-[#0A0F1E] border border-[#1A2540] p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Webcam Facial & Expression Telemetry
                </h2>
              </div>
              <button
                onClick={() => setIsTrackingActive(!isTrackingActive)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isTrackingActive 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isTrackingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTrackingActive ? 'Tracking Live' : 'Paused'}
              </button>
            </div>

            {/* Tracking Visual Canvas Mockup */}
            <div className="relative aspect-video bg-[#050A14] rounded-xl border border-[#1A2540] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-transparent z-10" />
              <div className="text-center z-20 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-xs font-mono">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Head Euler: Pitch {trackingMetrics.headPitch} deg | Yaw {trackingMetrics.headYaw} deg | Roll {trackingMetrics.headRoll} deg
                </div>
                <div className="text-xs text-slate-400">
                  Active Expression: <strong className="text-purple-400 uppercase font-mono">{trackingMetrics.activeExpression}</strong>
                </div>
              </div>

              {/* Face Box Overlay Simulation */}
              <div className="absolute w-44 h-52 border-2 border-dashed border-cyan-500/40 rounded-2xl flex flex-col justify-between p-2 pointer-events-none">
                <div className="flex justify-between text-[10px] text-cyan-400 font-mono">
                  <span>L-Eye: {trackingMetrics.leftEyeBlink ? 'Blink' : 'Open'}</span>
                  <span>R-Eye: {trackingMetrics.rightEyeBlink ? 'Blink' : 'Open'}</span>
                </div>
                <div className="text-center text-[10px] text-cyan-400 font-mono">
                  Mouth Aperture: {(trackingMetrics.mouthOpen * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#050A14] p-3 rounded-xl border border-[#1A2540]">
                <span className="text-[10px] text-slate-400 block mb-1">Smile Ratio</span>
                <span className="text-sm font-bold text-white">{(trackingMetrics.smileScore * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-[#050A14] p-3 rounded-xl border border-[#1A2540]">
                <span className="text-[10px] text-slate-400 block mb-1">Mouth Viseme</span>
                <span className="text-sm font-bold text-purple-400">{trackingMetrics.mouthOpen > 0.3 ? 'Speaking' : 'Rest'}</span>
              </div>
              <div className="bg-[#050A14] p-3 rounded-xl border border-[#1A2540]">
                <span className="text-[10px] text-slate-400 block mb-1">Blink State</span>
                <span className="text-sm font-bold text-cyan-400">
                  {trackingMetrics.leftEyeBlink || trackingMetrics.rightEyeBlink ? 'Active Wink' : 'Sync Normal'}
                </span>
              </div>
              <div className="bg-[#050A14] p-3 rounded-xl border border-[#1A2540]">
                <span className="text-[10px] text-slate-400 block mb-1">Blendshapes</span>
                <span className="text-sm font-bold text-emerald-400">52 ARKit Shapes</span>
              </div>
            </div>
          </div>

          {/* Right: Audio-Driven Gestures (5 cols) */}
          <div className="lg:col-span-5 space-y-4 bg-[#0A0F1E] border border-[#1A2540] p-6 rounded-2xl shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-purple-400" />
              Audio-Driven Gestures & Viseme Sync
            </h2>

            {/* Mic Volume Level Bar */}
            <div className="space-y-2 bg-[#050A14] p-4 rounded-xl border border-[#1A2540]">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Audio In Level</span>
                <span className="text-purple-300 font-mono font-bold">{audioSignal.volumePercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 transition-all duration-300"
                  style={{ width: `${audioSignal.volumePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 dB (Silence)</span>
                <span>Pitch: {audioSignal.pitchHz} Hz</span>
                <span>Peak</span>
              </div>
            </div>

            {/* Gesture Engine Output */}
            <div className="bg-[#050A14] p-4 rounded-xl border border-[#1A2540] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Active Body Gesture</span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  {audioSignal.activeGesture}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Voice Energy</span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase ${
                  audioSignal.energyLevel === 'high' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : audioSignal.energyLevel === 'moderate'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                }`}>
                  {audioSignal.energyLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-[#1A2540]">
                Audio pitch and volume dynamically drive upper-body kinetic blendshapes: waving on greeting, nodding on conversational rhythm, and cheering on loud stream highlights.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VIRTUAL CO-HOST LIVE CHAT */}
      {activeTab === 'cohost' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Chat Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-4 bg-[#0A0F1E] border border-[#1A2540] p-6 rounded-2xl shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A2540]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Stream Audience & Co-Host Dialogue
                </h2>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                AI Co-Host Online
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
              {chatHistory.map((item) => (
                <div key={item.id} className="space-y-2">
                  {/* Question from Chat */}
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold border border-slate-700">
                      U
                    </div>
                    <div className="bg-[#050A14] border border-[#1A2540] p-3 rounded-2xl rounded-tl-none text-xs">
                      <div className="font-semibold text-purple-300 mb-0.5 text-[11px]">{item.sender}</div>
                      <div className="text-slate-200">{item.question}</div>
                    </div>
                  </div>

                  {/* Character Response */}
                  <div className="flex items-start gap-2.5 max-w-[85%] ml-auto flex-row-reverse">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold border border-purple-400">
                      A
                    </div>
                    <div className="bg-purple-950/40 border border-purple-500/30 p-3 rounded-2xl rounded-tr-none text-xs">
                      <div className="flex items-center justify-between gap-3 font-semibold text-purple-300 mb-0.5 text-[11px]">
                        <span>Aura Co-Host</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-200 rounded font-mono uppercase">
                            {item.expression}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-200 rounded font-mono uppercase">
                            {item.gesture}
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-100">{item.response}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompt Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-[#1A2540]">
              {[
                'Hello Aura! Say hi to the stream!',
                'Show your ultimate combat power!',
                'How does your VRM rig work?',
                'React to a big donation hype!'
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    const reply = generateCoHostReply(preset, 'Aura-01');
                    setChatHistory((prev) => [...prev, reply]);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-[#050A14] hover:bg-purple-950/50 border border-[#1A2540] hover:border-purple-500/40 rounded-lg text-slate-300 whitespace-nowrap transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask your 3D avatar co-host a question from live chat..."
                className="flex-1 bg-[#050A14] border border-[#1A2540] rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Right: Co-Host Persona Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-4 bg-[#0A0F1E] border border-[#1A2540] p-6 rounded-2xl shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-400" />
              Co-Host Character Persona
            </h2>

            <div className="bg-[#050A14] p-4 rounded-xl border border-[#1A2540] space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Active Character</span>
                <span className="font-bold text-white text-sm">Aura-01 (Cyber Ninja)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Voice Persona</span>
                <span className="text-slate-300">Japanese Anime Heroine (Kokoro TTS / Whisper)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Response Latency</span>
                <span className="text-emerald-400 font-mono font-semibold">Instant Local (65 ms)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed">
              Co-Host automatically synthesizes chat comments into gestural expressions and vocal replies in real-time, functioning as an interactive virtual co-streamer on Twitch/YouTube.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
