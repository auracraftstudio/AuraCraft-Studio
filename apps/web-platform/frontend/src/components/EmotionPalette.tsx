import React from 'react';
import { Smile, Frown, Flame, Meh, Sparkles } from 'lucide-react';

interface EmotionPaletteProps {
  currentEmotion: string;
  onSelectEmotion: (emotion: string) => void;
}

export const EmotionPalette: React.FC<EmotionPaletteProps> = ({
  currentEmotion,
  onSelectEmotion,
}) => {
  const emotions = [
    { id: 'neutral', label: 'Neutral', icon: Meh },
    { id: 'happy', label: 'Happy', icon: Smile },
    { id: 'surprised', label: 'Surprised', icon: Sparkles },
    { id: 'angry', label: 'Angry', icon: Flame },
    { id: 'sad', label: 'Sad', icon: Frown },
  ];

  return (
    <div className="bg-[#0A0F1E] border border-[#1a2540] rounded-xl p-3">
      <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        Facial Expression Palette
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {emotions.map((em) => {
          const Icon = em.icon;
          const isActive = currentEmotion === em.id;
          return (
            <button
              key={em.id}
              onClick={() => onSelectEmotion(em.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-xs font-medium ${
                isActive
                  ? 'bg-purple-500/15 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : 'bg-[#050A14] border-[#1a2540] hover:border-purple-500/30 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
              <span className="text-[10px]">{em.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
