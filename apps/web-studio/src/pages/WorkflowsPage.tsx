import React, { useState } from 'react';
import { 
  Play, RotateCcw, CheckCircle2, SkipForward, AlertTriangle, 
  UserCircle2, Mic, SmilePlus, Sliders, MonitorPlay, Video, Download,
  Workflow, ArrowRight, ShieldCheck, Sparkles, Terminal, Activity
} from 'lucide-react';

interface PipelineNode {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  status: 'idle' | 'running' | 'completed' | 'bypassed' | 'error';
  latencyMs: number;
  summary: string;
}

const INITIAL_NODES: PipelineNode[] = [
  {
    id: 'char_loader',
    number: 1,
    title: 'Character Loader',
    subtitle: 'VRM / Live2D Model Init',
    icon: UserCircle2,
    enabled: true,
    status: 'idle',
    latencyMs: 140,
    summary: 'Loads 3D meshes, blend shapes, and bone rigs'
  },
  {
    id: 'voice_synthesis',
    number: 2,
    title: 'Voice Synthesis',
    subtitle: 'Azure Neural TTS Stream',
    icon: Mic,
    enabled: true,
    status: 'idle',
    latencyMs: 220,
    summary: 'Neural speech synthesis with phoneme timing'
  },
  {
    id: 'emotion_mapper',
    number: 3,
    title: 'Emotion Mapper',
    subtitle: 'Viseme & Morph Presets',
    icon: SmilePlus,
    enabled: true,
    status: 'idle',
    latencyMs: 85,
    summary: 'Maps emotional state to blend shape weightings'
  },
  {
    id: 'audio_mix',
    number: 4,
    title: 'Audio Master & Mix',
    subtitle: 'DSP Pitch, Reverb & EQ',
    icon: Sliders,
    enabled: true,
    status: 'idle',
    latencyMs: 65,
    summary: 'Harmonic equalization and spatial audio bus'
  },
  {
    id: 'obs_broadcast',
    number: 5,
    title: 'OBS Virtual Cam',
    subtitle: 'Ultra-low Latency Video Out',
    icon: MonitorPlay,
    enabled: false,
    status: 'idle',
    latencyMs: 40,
    summary: 'Streams viewport frames to OBS Virtual Camera'
  },
  {
    id: 'video_render',
    number: 6,
    title: 'Video Compositor',
    subtitle: 'Frame-by-Frame MP4 Muxer',
    icon: Video,
    enabled: true,
    status: 'idle',
    latencyMs: 310,
    summary: 'WebM/MP4 hardware-accelerated video rendering'
  },
  {
    id: 'export_hub',
    number: 7,
    title: 'Export & Archive',
    subtitle: 'Cloud Sync & Local Save',
    icon: Download,
    enabled: true,
    status: 'idle',
    latencyMs: 95,
    summary: 'Encodes output package with metadata manifest'
  }
];

interface LogEntry {
  id: string;
  time: string;
  type: 'info' | 'success' | 'bypass' | 'warn';
  message: string;
  nodeTitle?: string;
}

export function WorkflowsPage() {
  const [nodes, setNodes] = useState<PipelineNode[]>(INITIAL_NODES);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('char_loader');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: '12:00:00', type: 'info', message: 'AuraCraft Pipeline engine initialized. 7 nodes registered.' },
    { id: '2', time: '12:00:01', type: 'bypass', message: 'Node 5 (OBS Virtual Cam) is currently DISABLED — traffic will auto-bypass.' }
  ]);

  const toggleNode = (id: string) => {
    if (isRunning) return;
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const nextEnabled = !n.enabled;
        const now = new Date().toLocaleTimeString();
        setLogs(l => [
          {
            id: crypto.randomUUID(),
            time: now,
            type: nextEnabled ? 'success' : 'bypass',
            message: nextEnabled 
              ? `[${n.title}] ENABLED. Routing reconnected to primary bus.`
              : `[${n.title}] DISABLED. Pipeline will auto-bypass to next active stage.`,
            nodeTitle: n.title
          },
          ...l.slice(0, 40)
        ]);
        return { ...n, enabled: nextEnabled, status: 'idle' };
      }
      return n;
    }));
  };

  const handleReset = () => {
    if (isRunning) return;
    setNodes(INITIAL_NODES);
    setLogs(prev => [
      {
        id: crypto.randomUUID(),
        time: new Date().toLocaleTimeString(),
        type: 'info',
        message: 'Pipeline reset to default preset (Node 5 in bypass mode).'
      },
      ...prev.slice(0, 40)
    ]);
  };

  const runSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);

    // Reset statuses
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    setLogs(l => [
      {
        id: crypto.randomUUID(),
        time: new Date().toLocaleTimeString(),
        type: 'info',
        message: '▶ Execution started: processing batch persona session...'
      },
      ...l
    ]);

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const now = new Date().toLocaleTimeString();

      if (!node.enabled) {
        // Bypass step
        setNodes(prev => prev.map((n, idx) => idx === i ? { ...n, status: 'bypassed' } : n));
        setLogs(l => [
          {
            id: crypto.randomUUID(),
            time: now,
            type: 'bypass',
            message: `⏭️ [Node ${node.number}: ${node.title}] BYPASSED — Stage inactive, skipping directly.`,
            nodeTitle: node.title
          },
          ...l
        ]);
        await new Promise(r => setTimeout(r, 220));
        continue;
      }

      // Active processing step
      setNodes(prev => prev.map((n, idx) => idx === i ? { ...n, status: 'running' } : n));
      await new Promise(r => setTimeout(r, Math.max(260, node.latencyMs * 1.5)));

      setNodes(prev => prev.map((n, idx) => idx === i ? { ...n, status: 'completed' } : n));
      setLogs(l => [
        {
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString(),
          type: 'success',
          message: `✅ [Node ${node.number}: ${node.title}] Complete (${node.latencyMs}ms) — Data passed downstream.`,
          nodeTitle: node.title
        },
        ...l
      ]);
    }

    setLogs(l => [
      {
        id: crypto.randomUUID(),
        time: new Date().toLocaleTimeString(),
        type: 'info',
        message: '🏁 Pipeline execution finished. All enabled nodes returned 200 OK.'
      },
      ...l
    ]);
    setIsRunning(false);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const enabledCount = nodes.filter(n => n.enabled).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050A14] text-slate-100 overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-[#1a2540] bg-[#0A0F1E]/95 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-100">Live Persona Production Pipeline</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
                Static Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {enabledCount} of {nodes.length} stages active • Auto-bypass routing enabled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a2540] bg-[#0f1628] hover:bg-[#152038] text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={runSimulation}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-lg transition-all ${
              isRunning 
                ? 'bg-purple-800/60 text-purple-200 border border-purple-500/50 cursor-wait'
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-purple-900/30 hover:shadow-purple-700/40 border border-purple-400/40'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
            <span>{isRunning ? 'Processing Pipeline...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Main Pipeline Canvas & Inspector Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left: Scrollable Node Graph Canvas */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-[#050A14]">
          {/* Informational Guidance Banner */}
          <div className="mb-6 bg-[#0A0F1E] border border-purple-500/20 rounded-xl p-3.5 flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-300">
                <strong className="text-purple-300">Pre-built Zero-Code Pipeline:</strong> Nodes are pre-configured. Use the toggle switch on any stage to deactivate it — the pipeline will automatically route around disabled nodes.
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Active</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Bypassed</span>
            </div>
          </div>

          {/* Pipeline Horizontal Flow Container */}
          <div className="flex items-center justify-start gap-3 py-6 px-4 bg-[#0A0F1E]/60 border border-[#1a2540] rounded-2xl overflow-x-auto min-w-full">
            {nodes.map((node, index) => {
              const Icon = node.icon;
              const isSelected = selectedNodeId === node.id;
              const isLast = index === nodes.length - 1;

              return (
                <React.Fragment key={node.id}>
                  {/* Single Node Card */}
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`relative w-52 flex-shrink-0 rounded-xl border p-4 transition-all cursor-pointer select-none ${
                      isSelected 
                        ? 'bg-[#10172e] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.18)]' 
                        : 'bg-[#0A0F1E] border-[#1a2540] hover:border-purple-500/40 hover:bg-[#0d1428]'
                    } ${!node.enabled ? 'opacity-55 border-dashed border-slate-700 bg-[#070b16]' : ''}`}
                  >
                    {/* Header: Stage Number & Toggle */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        node.enabled 
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        Stage {node.number}
                      </span>

                      {/* Custom Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={node.enabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNode(node.id);
                        }}
                        className={`w-9 h-5 rounded-full transition-colors relative p-0.5 focus:outline-none ${
                          node.enabled ? 'bg-purple-600' : 'bg-slate-700'
                        }`}
                        title={node.enabled ? 'Disable stage' : 'Enable stage'}
                      >
                        <span 
                          className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                            node.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Icon & Title */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        node.status === 'running'
                          ? 'bg-purple-500 text-white animate-pulse'
                          : node.enabled
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-100 truncate">
                          {node.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {node.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill Footer */}
                    <div className="pt-2 border-t border-[#1a2540] flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        {node.status === 'running' && (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                            <span className="text-purple-300 font-semibold">Running...</span>
                          </>
                        )}
                        {node.status === 'completed' && (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Passed</span>
                          </>
                        )}
                        {node.status === 'bypassed' && (
                          <>
                            <SkipForward className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-400 font-medium">Bypassed</span>
                          </>
                        )}
                        {node.status === 'idle' && (
                          <>
                            <span className={`w-1.5 h-1.5 rounded-full ${node.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                            <span className="text-slate-400">{node.enabled ? 'Ready' : 'Off (Bypass)'}</span>
                          </>
                        )}
                      </div>
                      <span className="text-slate-500 font-mono text-[9px]">{node.latencyMs}ms</span>
                    </div>

                    {/* Bypass indicator badge if disabled */}
                    {!node.enabled && (
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold px-2 py-0.2 rounded-full whitespace-nowrap shadow-md">
                        Auto-Bypass Active
                      </div>
                    )}
                  </div>

                  {/* Connector Arrow or Bypass Arc */}
                  {!isLast && (
                    <div className="flex items-center justify-center px-1 text-slate-600">
                      <ArrowRight className={`w-4 h-4 ${node.enabled ? 'text-purple-400' : 'text-slate-600'}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Node Detail Inspector Panel */}
          <div className="mt-6 bg-[#0A0F1E] border border-[#1a2540] rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2540]">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  {React.createElement(selectedNode.icon, { className: 'w-4 h-4' })}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Stage {selectedNode.number}: {selectedNode.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedNode.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  Status:{' '}
                  <strong className={selectedNode.enabled ? 'text-purple-300' : 'text-slate-500'}>
                    {selectedNode.enabled ? 'Active In Bus' : 'Bypassed'}
                  </strong>
                </span>
                <button
                  onClick={() => toggleNode(selectedNode.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedNode.enabled 
                      ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                  }`}
                >
                  {selectedNode.enabled ? 'Deactivate (Bypass)' : 'Activate Stage'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="bg-[#050A14] border border-[#1a2540] rounded-lg p-3">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Purpose</span>
                <p className="text-slate-300 mt-1">{selectedNode.summary}</p>
              </div>
              <div className="bg-[#050A14] border border-[#1a2540] rounded-lg p-3">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Estimated Latency</span>
                <p className="text-purple-300 font-mono text-sm mt-1">{selectedNode.latencyMs} ms</p>
              </div>
              <div className="bg-[#050A14] border border-[#1a2540] rounded-lg p-3">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Bypass Routing</span>
                <p className="text-slate-300 mt-1">
                  {selectedNode.enabled ? 'Stage executes normally' : 'Direct jump to Stage ' + (selectedNode.number + 1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Execution Log Console (Collapsible/Fixed) */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[#1a2540] bg-[#070b16] flex flex-col h-64 lg:h-full flex-shrink-0">
          <div className="h-10 px-4 border-b border-[#1a2540] bg-[#0A0F1E] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>Pipeline Telemetry Log</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{logs.length} entries</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-2 select-text">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className={`p-2 rounded-lg border text-left transition-colors ${
                  log.type === 'success' 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : log.type === 'bypass'
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                      : log.type === 'warn'
                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                        : 'bg-[#0A0F1E] border-[#1a2540] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>{log.time}</span>
                  {log.nodeTitle && <span className="text-purple-400 font-semibold">{log.nodeTitle}</span>}
                </div>
                <div className="leading-snug">{log.message}</div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-[#1a2540] bg-[#0A0F1E]/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400" />
              Engine Status: Idle
            </span>
            <button
              onClick={() => setLogs([])}
              className="hover:text-slate-200 underline"
            >
              Clear Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
