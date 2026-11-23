import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, PieChart, KeyRound, AlertCircle, CheckCircle2, 
  XCircle, AlertTriangle, ShieldCheck, RefreshCw, Cpu, Activity,
  Server, Zap, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';

interface ApiKeyItem {
  name: string;
  service: string;
  maskedValue: string;
  status: 'active' | 'missing' | 'standby';
  lastUsed: string;
}

const API_KEYS: ApiKeyItem[] = [
  {
    name: 'AZURE_SPEECH_KEY',
    service: 'Azure Cognitive Services (Neural TTS)',
    maskedValue: 'az-speech-••••••••7b2a',
    status: 'active',
    lastUsed: 'Just now'
  },
  {
    name: 'AZURE_SPEECH_REGION',
    service: 'Azure Datacenter Region (eastus)',
    maskedValue: 'eastus',
    status: 'active',
    lastUsed: '2 mins ago'
  },
  {
    name: 'GEMINI_API_KEY',
    service: 'Google AI Studio (LLM Script & Persona Chat)',
    maskedValue: 'AIzaSy••••••••8819',
    status: 'active',
    lastUsed: '14 mins ago'
  },
  {
    name: 'OPENAI_API_KEY',
    service: 'OpenAI Fallback & Whisper Transcriber',
    maskedValue: 'sk-proj-••••••••9941',
    status: 'standby',
    lastUsed: '3 days ago'
  },
  {
    name: 'SENTRY_DSN',
    service: 'Sentry Performance & Error Telemetry',
    maskedValue: 'https://••••@o450.ingest.sentry.io/411',
    status: 'active',
    lastUsed: '1 min ago'
  }
];

interface ErrorLog {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  source: string;
  timestamp: string;
  count: number;
  stackTrace: string;
}

const ERROR_LOGS: ErrorLog[] = [];

// 7-day request trend data
const DAILY_REQUESTS = [
  { day: 'Mon', calls: 142 },
  { day: 'Tue', calls: 210 },
  { day: 'Wed', calls: 185 },
  { day: 'Thu', calls: 320 },
  { day: 'Fri', calls: 290 },
  { day: 'Sat', calls: 415 },
  { day: 'Sun', calls: 380 },
];

// Voice usage breakdown
const VOICE_BREAKDOWN = [
  { name: 'Nanami (JP)', calls: 640, percentage: 42, color: '#a855f7' },
  { name: 'Keita (JP)', calls: 420, percentage: 28, color: '#c084fc' },
  { name: 'Aria (EN)', calls: 275, percentage: 18, color: '#7c3aed' },
  { name: 'Jenny (EN)', calls: 185, percentage: 12, color: '#9333ea' },
];

export function UsagePage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const [errorFilter, setErrorFilter] = useState<'all' | 'error' | 'warning'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = (name: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(name);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredErrors = ERROR_LOGS.filter(e => {
    if (errorFilter === 'all') return true;
    return e.type === errorFilter;
  });

  // Calculate SVG line chart points
  const maxCalls = Math.max(...DAILY_REQUESTS.map(d => d.calls));
  const svgWidth = 560;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 25;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  const points = DAILY_REQUESTS.map((d, i) => {
    const x = paddingX + (i / (DAILY_REQUESTS.length - 1)) * graphWidth;
    const y = svgHeight - paddingY - (d.calls / maxCalls) * graphHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050A14] text-slate-100 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-[#1a2540] bg-[#0A0F1E]/95 px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100">API Usage, Keys & Error Telemetry</h1>
            <p className="text-[11px] text-slate-400">
              Live monitoring of Azure Neural TTS, Gemini AI, and client-side error states
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a2540] bg-[#0f1628] hover:bg-[#152038] text-slate-300 hover:text-white text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* ── SECTION 1: TOP 3 KPI CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0A0F1E] border border-[#1a2540] rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Weekly Invocations</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-100 tracking-tight">1,942 <span className="text-xs font-normal text-slate-400">calls</span></div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last week</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          <div className="bg-[#0A0F1E] border border-[#1a2540] rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Character Quota Used</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-100 tracking-tight">362,500 <span className="text-xs font-normal text-slate-400">/ 500k</span></div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-300">
              <span>72.5% consumed • 137,500 remaining</span>
            </div>
            <div className="w-full bg-[#152038] h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-full rounded-full" style={{ width: '72.5%' }} />
            </div>
          </div>

          <div className="bg-[#0A0F1E] border border-[#1a2540] rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>System Error Rate</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-100 tracking-tight">0.14% <span className="text-xs font-normal text-emerald-400">Healthy</span></div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>All 5 services responding within SLA</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>

        {/* ── SECTION 2: API KEYS STATUS PANEL ── */}
        <div className="bg-[#0A0F1E] border border-[#1a2540] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a2540] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <KeyRound className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">API Credentials & Provider Status</h2>
                <p className="text-[11px] text-slate-400">Key secrets are masked for security</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
              {API_KEYS.filter(k => k.status === 'active').length} of {API_KEYS.length} Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070b16] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1a2540]">
                <tr>
                  <th className="py-3 px-5 font-semibold">Variable Name</th>
                  <th className="py-3 px-5 font-semibold">Service</th>
                  <th className="py-3 px-5 font-semibold">Masked Secret</th>
                  <th className="py-3 px-5 font-semibold">Health Status</th>
                  <th className="py-3 px-5 font-semibold">Last Invocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2540]/60">
                {API_KEYS.map((k) => (
                  <tr key={k.name} className="hover:bg-[#0f1628]/60 transition-colors">
                    <td className="py-3 px-5 font-mono font-semibold text-slate-200">
                      {k.name}
                    </td>
                    <td className="py-3 px-5 text-slate-400">
                      {k.service}
                    </td>
                    <td className="py-3 px-5 font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>{k.maskedValue}</span>
                        <button
                          onClick={() => handleCopy(k.name, k.maskedValue)}
                          className="text-slate-500 hover:text-slate-300 p-1"
                          title="Copy masked identifier"
                        >
                          {copiedKey === k.name ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      {k.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Active
                        </span>
                      )}
                      {k.status === 'standby' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          Standby
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-slate-500 font-mono text-[11px]">
                      {k.lastUsed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 3: 3 INTERACTIVE CHARTS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: 7-Day Trend Line Chart */}
          <div className="lg:col-span-2 bg-[#0A0F1E] border border-[#1a2540] rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Daily Synthesis Volume (7-Day Curve)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Total: 1,942 reqs</span>
            </div>

            {/* SVG Line Chart */}
            <div className="w-full flex-1 flex items-center justify-center py-2">
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                className="w-full h-44 overflow-visible"
              >
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingY + ratio * graphHeight;
                  return (
                    <line 
                      key={idx}
                      x1={paddingX} 
                      y1={y} 
                      x2={svgWidth - paddingX} 
                      y2={y} 
                      stroke="#1a2540" 
                      strokeDasharray="4 4" 
                      strokeWidth="1" 
                    />
                  );
                })}

                {/* Gradient area */}
                <path d={areaD} fill="url(#purpleGradient)" />

                {/* Stroke line */}
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="url(#strokeGradient)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Data point dots & labels */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="4" 
                      fill="#050A14" 
                      stroke="#a855f7" 
                      strokeWidth="2.5" 
                    />
                    <text 
                      x={p.x} 
                      y={svgHeight - 6} 
                      textAnchor="middle" 
                      fill="#64748b" 
                      fontSize="10" 
                      fontFamily="monospace"
                    >
                      {p.day}
                    </text>
                    <text 
                      x={p.x} 
                      y={p.y - 8} 
                      textAnchor="middle" 
                      fill="#d8b4fe" 
                      fontSize="9" 
                      fontWeight="bold" 
                      fontFamily="monospace"
                    >
                      {p.calls}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Chart 2: Voice Persona Breakdown Bar Chart */}
          <div className="bg-[#0A0F1E] border border-[#1a2540] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Voice Persona Share
                </h3>
              </div>

              <div className="space-y-3.5">
                {VOICE_BREAKDOWN.map((v) => (
                  <div key={v.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{v.name}</span>
                      <span className="font-mono text-purple-300 text-[11px]">{v.calls} ({v.percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#152038] h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${v.percentage}%`, backgroundColor: v.color }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1a2540] mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span>Primary Engine: Azure TTS</span>
              <span className="text-emerald-400 font-medium">99.8% Synthesized</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: ERROR TRACKER (SENTRY-STYLE) ── */}
        <div className="bg-[#0A0F1E] border border-[#1a2540] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a2540] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">Live Client & API Error Tracker</h2>
                <p className="text-[11px] text-slate-400">Captured via Sentry client boundary</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#050A14] border border-[#1a2540] p-1 rounded-lg text-xs">
              {(['all', 'error', 'warning'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setErrorFilter(tab)}
                  className={`px-2.5 py-0.5 rounded text-[11px] capitalize font-medium transition-colors ${
                    errorFilter === tab 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#1a2540]/60">
            {filteredErrors.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">All Systems Nominal</span>
                <span className="text-xs text-slate-400">0 unhandled exceptions or error events in the last 24 hours.</span>
              </div>
            ) : (
              filteredErrors.map((err) => {
              const isExpanded = expandedErrorId === err.id;
              return (
                <div key={err.id} className="p-4 hover:bg-[#0f1628]/40 transition-colors">
                  <div 
                    className="flex items-start justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedErrorId(isExpanded ? null : err.id)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {err.type === 'error' ? (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-100 truncate">
                          {err.title}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-purple-300">{err.source}</span>
                          <span>•</span>
                          <span>{err.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-semibold">
                        {err.count}x events
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expandable Stack Trace */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#1a2540]/60">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Stack Trace Preview
                      </div>
                      <pre className="bg-[#050A14] border border-[#1a2540] rounded-lg p-3 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {err.stackTrace}
                      </pre>
                    </div>
                  )}
                </div>
              );
            }))}
          </div>
        </div>
      </div>
    </div>
  );
}
