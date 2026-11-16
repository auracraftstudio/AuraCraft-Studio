import React from 'react';
import { Video, Monitor, Cast, Eye } from 'lucide-react';

interface OBSStreamOverlayProps {
  bgMode: 'cyber' | 'greenscreen' | 'transparent';
  onSelectBgMode: (mode: 'cyber' | 'greenscreen' | 'transparent') => void;
  isOBSMode: boolean;
  onToggleOBSMode: () => void;
}

export const OBSStreamOverlay: React.FC<OBSStreamOverlayProps> = ({
  bgMode,
  onSelectBgMode,
  isOBSMode,
  onToggleOBSMode,
}) => {
  return (
    <div className="bg-[#0A0F1E] border border-[#1a2540] rounded-xl p-3">
      <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-purple-400" />
          OBS Studio & Broadcast Mode
        </span>
        <button
          onClick={onToggleOBSMode}
          className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
            isOBSMode
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold animate-pulse'
              : 'bg-[#050A14] border-[#1a2540] text-slate-400 hover:text-slate-200'
          }`}
        >
          {isOBSMode ? '🔴 LIVE OVERLAY ON' : 'OBS Overlay Off'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <button
          onClick={() => onSelectBgMode('cyber')}
          className={`p-1.5 rounded-lg border text-center text-[10px] transition-all font-medium ${
            bgMode === 'cyber'
              ? 'bg-purple-500/15 border-purple-500 text-purple-300'
              : 'bg-[#050A14] border-[#1a2540] text-slate-400 hover:text-slate-200'
          }`}
        >
          Cyber Dark
        </button>
        <button
          onClick={() => onSelectBgMode('greenscreen')}
          className={`p-1.5 rounded-lg border text-center text-[10px] transition-all font-medium ${
            bgMode === 'greenscreen'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
              : 'bg-[#050A14] border-[#1a2540] text-slate-400 hover:text-slate-200'
          }`}
        >
          Green Screen
        </button>
        <button
          onClick={() => onSelectBgMode('transparent')}
          className={`p-1.5 rounded-lg border text-center text-[10px] transition-all font-medium ${
            bgMode === 'transparent'
              ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
              : 'bg-[#050A14] border-[#1a2540] text-slate-400 hover:text-slate-200'
          }`}
        >
          Transparent
        </button>
      </div>

      <p className="text-[10px] text-slate-400 leading-relaxed">
        <span className="text-purple-300 font-semibold">OBS Tip:</span> Add Browser Source with URL{' '}
        <code className="text-purple-300 bg-[#050A14] border border-[#1a2540] px-1 py-0.5 rounded text-[9px]">http://localhost:5180/?obs=true</code>
      </p>
    </div>
  );
};
