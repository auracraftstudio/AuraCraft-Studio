import React, { useState, useRef } from 'react';
import {
  Camera, Sparkles, Upload, Globe, User, Layers, Check,
  ChevronRight, RefreshCw, Star, ShieldCheck, Heart, Trash2, RotateCcw
} from 'lucide-react';
import { translations, type Language } from '../utils/i18n';

export interface StudioCharacter {
  id: string;
  name: string;
  role: string;
  category: 'photo' | 'anime' | 'realistic' | 'myanmar' | 'army' | 'streamer';
  avatarMode: 'photo' | '3d';
  url: string;
  badge: string;
  avatarThumb: string;
  defaultVoice: string;
  defaultEmotion: string;
  isCustom?: boolean;
  blobId?: string;
}

export const ALL_STUDIO_CHARACTERS: StudioCharacter[] = [
  // 1. Photo Characters (Ultra-Realistic Talking Photo)
  {
    id: 'photo_aoi_blue',
    name: 'Aoi (Blue Hair Kimono)',
    role: 'Anime Beauty & Cosplay',
    category: 'photo',
    avatarMode: 'photo',
    url: '/avatars/blue_hair_girl.jpg',
    avatarThumb: '/avatars/blue_hair_girl.jpg',
    badge: '🌸 Real Photo',
    defaultVoice: 'ja-JP-NanamiNeural',
    defaultEmotion: 'neutral',
  },
  {
    id: 'photo_elena_blonde',
    name: 'Elena (Blonde Cosplay)',
    role: 'Cosplay Idol & Model',
    category: 'photo',
    avatarMode: 'photo',
    url: '/avatars/blonde_cosplay_girl.jpg',
    avatarThumb: '/avatars/blonde_cosplay_girl.jpg',
    badge: '🌸 Real Photo',
    defaultVoice: 'ja-JP-NanamiNeural',
    defaultEmotion: 'happy',
  },
  {
    id: 'photo_daw_khin',
    name: 'Daw Khin Than (Diplomat)',
    role: 'Executive Diplomat',
    category: 'photo',
    avatarMode: 'photo',
    url: '/avatars/blue_hair_girl.jpg',
    avatarThumb: '/avatars/blue_hair_girl.jpg',
    badge: '👤 Real Human',
    defaultVoice: 'my-MM-NilarNeural',
    defaultEmotion: 'neutral',
  },
  {
    id: 'photo_ko_phyo',
    name: 'Ko Phyo (News Anchor)',
    role: 'Broadcast Anchor',
    category: 'photo',
    avatarMode: 'photo',
    url: '/avatars/blonde_cosplay_girl.jpg',
    avatarThumb: '/avatars/blonde_cosplay_girl.jpg',
    badge: '👤 Real Human',
    defaultVoice: 'my-MM-ThihaNeural',
    defaultEmotion: 'neutral',
  },

  // 2. 3D Anime Characters
  {
    id: '3d_sakura',
    name: 'Sakura Hoshino (3D Idol)',
    role: 'Magical Anime Idol',
    category: 'anime',
    avatarMode: '3d',
    url: '/models/avatar_female_a.vrm',
    avatarThumb: '/models/avatar_female_a.vrm',
    badge: '🌸 3D VRM',
    defaultVoice: 'ja-JP-NanamiNeural',
    defaultEmotion: 'happy',
  },
  {
    id: '3d_nanami',
    name: 'Nanami (3D Heroine)',
    role: 'Cyber Heroine',
    category: 'anime',
    avatarMode: '3d',
    url: '/models/avatar_female_a.vrm',
    avatarThumb: '/models/avatar_female_a.vrm',
    badge: '💙 3D VRM',
    defaultVoice: 'ja-JP-NanamiNeural',
    defaultEmotion: 'neutral',
  },
  {
    id: '3d_shinji',
    name: 'Shinji Kazama (3D Pilot)',
    role: 'Mecha Pilot',
    category: 'anime',
    avatarMode: '3d',
    url: '/models/avatar_female_c.vrm',
    avatarThumb: '/models/avatar_female_c.vrm',
    badge: '⚡ 3D Mecha',
    defaultVoice: 'ja-JP-KeitaNeural',
    defaultEmotion: 'neutral',
  },

  // 3. 3D Realistic Humans
  {
    id: '3d_daw_khin',
    name: 'Daw Khin Than (3D Diplomat)',
    role: 'Sovereign Diplomat',
    category: 'realistic',
    avatarMode: '3d',
    url: '/avatar_human.vrm',
    avatarThumb: '/avatar_human.vrm',
    badge: '👤 3D Human',
    defaultVoice: 'my-MM-NilarNeural',
    defaultEmotion: 'neutral',
  },
  {
    id: '3d_ko_phyo',
    name: 'Ko Phyo (3D Anchor)',
    role: 'Investigative Journalist',
    category: 'realistic',
    avatarMode: '3d',
    url: '/avatar_human.vrm',
    avatarThumb: '/avatar_human.vrm',
    badge: '👤 3D Human',
    defaultVoice: 'my-MM-ThihaNeural',
    defaultEmotion: 'neutral',
  },
  {
    id: '3d_dr_hlaing',
    name: 'Dr. Hlaing Min (3D Scientist)',
    role: 'AI Researcher',
    category: 'realistic',
    avatarMode: '3d',
    url: '/avatar_human.vrm',
    avatarThumb: '/avatar_human.vrm',
    badge: '👤 3D Human',
    defaultVoice: 'my-MM-ThihaNeural',
    defaultEmotion: 'neutral',
  },

  // 4. 3D Myanmar Traditional
  {
    id: '3d_nilar',
    name: 'Daw Nilar (3D Traditional)',
    role: 'Cultural Host',
    category: 'myanmar',
    avatarMode: '3d',
    url: '/models/avatar_female_a.vrm',
    avatarThumb: '/models/avatar_female_a.vrm',
    badge: '🇲🇲 Myanmar 3D',
    defaultVoice: 'my-MM-NilarNeural',
    defaultEmotion: 'neutral',
  },
  {
    id: '3d_min_thar',
    name: 'Min Thar Thant Zin (3D)',
    role: 'Royal Court Presenter',
    category: 'myanmar',
    avatarMode: '3d',
    url: '/avatar_human.vrm',
    avatarThumb: '/avatar_human.vrm',
    badge: '🇲🇲 Myanmar 3D',
    defaultVoice: 'my-MM-ThihaNeural',
    defaultEmotion: 'neutral',
  },

  // 5. 3D Army / Tactical
  {
    id: '3d_gen_min',
    name: 'General Min Zaw (3D Army)',
    role: 'Army Commander',
    category: 'army',
    avatarMode: '3d',
    url: '/avatar_human.vrm',
    avatarThumb: '/avatar_human.vrm',
    badge: '🎖️ Army Tactical',
    defaultVoice: 'en-US-GuyNeural',
    defaultEmotion: 'neutral',
  },

  // 6. 3D Streamer
  {
    id: '3d_jenny',
    name: 'Jenny Nova (3D VTuber)',
    role: 'Cyber Streamer',
    category: 'streamer',
    avatarMode: '3d',
    url: '/models/avatar_female_a.vrm',
    avatarThumb: '/models/avatar_female_a.vrm',
    badge: '🎙️ 3D Streamer',
    defaultVoice: 'en-US-JennyNeural',
    defaultEmotion: 'happy',
  },
];

interface StudioLeftPanelProps {
  stageMode: 'photo' | '3d';
  currentActorName: string;
  lang?: Language;
  customCharacters?: StudioCharacter[];
  deletedCharacterIds?: string[];
  onSelectStageMode: (mode: 'photo' | '3d') => void;
  onSelectCharacter: (char: StudioCharacter) => void;
  onUploadCustomPhoto: (file: File) => void;
  onUploadCustomVRM: (file: File) => void;
  onImportRPMUrl: (url: string) => void;
  onDeleteCharacter?: (charId: string) => void;
  onResetAllPresets?: () => void;
}

export const StudioLeftPanel: React.FC<StudioLeftPanelProps> = ({
  stageMode,
  currentActorName,
  lang = 'en',
  customCharacters = [],
  deletedCharacterIds = [],
  onSelectStageMode,
  onSelectCharacter,
  onUploadCustomPhoto,
  onUploadCustomVRM,
  onImportRPMUrl,
  onDeleteCharacter,
  onResetAllPresets,
}) => {
  const isMyanmar = lang === 'my';
  const t = translations[lang] || translations.en;
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const vrmInputRef = useRef<HTMLInputElement>(null);

  const CATEGORIES = [
    { id: 'all', label: isMyanmar ? 'အားလုံး' : 'All' },
    { id: 'photo', label: isMyanmar ? '📸 ဓာတ်ပုံ' : '📸 Photo' },
    { id: 'anime', label: isMyanmar ? '🌸 အန်နီမေး' : '🌸 Anime' },
    { id: 'realistic', label: isMyanmar ? '👤 လူရုပ်' : '👤 Real 3D' },
    { id: 'myanmar', label: isMyanmar ? '🇲🇲 မြန်မာ' : '🇲🇲 Myanmar' },
    { id: 'army', label: isMyanmar ? '🎖️ တပ်' : '🎖️ Army' },
  ];

  // Combine custom characters and preset characters minus deleted ones
  const activePresets = ALL_STUDIO_CHARACTERS.filter(c => !deletedCharacterIds.includes(c.id));
  const combinedList = [...customCharacters, ...activePresets];

  const filteredCharacters = combinedList.filter(c => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'photo') return c.avatarMode === 'photo';
    return c.category === activeCategory;
  });

  return (
    <aside className="w-full lg:w-64 xl:w-72 h-auto lg:h-full border-b lg:border-b-0 lg:border-r border-[#1a2540] bg-[#0A0F1E] flex flex-col shadow-2xl z-30 flex-shrink-0 select-none">
      {/* Hidden File Inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUploadCustomPhoto(file);
        }}
      />
      <input
        ref={vrmInputRef}
        type="file"
        accept=".vrm,.glb"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUploadCustomVRM(file);
        }}
      />

      {/* 1. STAGE MODE TOGGLE SWITCHER (Photo vs 3D) */}
      <div className="p-3 border-b border-[#1a2540] flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {isMyanmar ? 'စင်မြင့် အင်ဂျင်ရွေးချယ်ရန်' : 'Avatar Engine Mode'}
        </span>

        <div className="grid grid-cols-2 gap-1.5 bg-[#050A14] p-1 rounded-xl border border-[#1a2540]">
          <button
            onClick={() => onSelectStageMode('photo')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              stageMode === 'photo'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo Avatar</span>
          </button>

          <button
            onClick={() => onSelectStageMode('3d')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              stageMode === '3d'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D VRM</span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY PILLS */}
      <div className="px-3 pt-3 pb-2 border-b border-[#1a2540] flex items-center gap-1 overflow-x-auto text-[11px] no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#0f1628] text-slate-400 hover:text-slate-200 hover:bg-[#152038] border border-[#1a2540]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. CHARACTER CARDS LIST */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5">
        {/* Roster Header with Count & Reset link */}
        <div className="flex items-center justify-between px-1 pb-1 border-b border-[#1a2540]/60 mb-1">
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-400" />
            <span>{isMyanmar ? `စတေ့ချ် Avatar (${filteredCharacters.length})` : `Stage Avatars (${filteredCharacters.length})`}</span>
          </span>

          {onResetAllPresets && deletedCharacterIds && deletedCharacterIds.length > 0 && (
            <button
              onClick={onResetAllPresets}
              className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
              title={isMyanmar ? 'ဖျက်ထားသော မူလဇာတ်ကောင်များ ပြန်ထားမည်' : 'Restore All Preset Characters'}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{isMyanmar ? 'မူလပြန်ထား' : 'Reset'}</span>
            </button>
          )}
        </div>

        {filteredCharacters.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center gap-2">
            <User className="w-6 h-6 text-slate-600" />
            <span>{isMyanmar ? 'ဇာတ်ကောင် မရှိပါ' : 'No characters found'}</span>
            {onResetAllPresets && (
              <button
                onClick={onResetAllPresets}
                className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 mt-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isMyanmar ? 'မူလဇာတ်ကောင်များ ပြန်ထားပါ' : 'Restore default presets'}</span>
              </button>
            )}
          </div>
        )}

        {filteredCharacters.map(char => {
          const isSelected = currentActorName.toLowerCase().includes(char.name.split(' ')[0].toLowerCase());
          return (
            <div
              key={char.id}
              onClick={() => onSelectCharacter(char)}
              className={`w-full p-2 rounded-xl text-left border transition-all flex items-center gap-2.5 group cursor-pointer ${
                isSelected
                  ? 'bg-purple-500/15 border-purple-500 shadow-md shadow-purple-900/20 text-purple-200'
                  : 'bg-[#0f1628]/60 hover:bg-[#152038] border-[#1a2540] hover:border-purple-500/30'
              }`}
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#1a2540] bg-slate-900 flex-shrink-0 relative">
                {char.avatarMode === 'photo' ? (
                  <img src={char.avatarThumb} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-950/40">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-purple-500/20 ring-1 ring-purple-400 rounded-lg" />
                )}
              </div>

              {/* Character Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 truncate group-hover:text-purple-300 transition-colors flex items-center gap-1">
                    {char.name}
                    {char.isCustom && (
                      <span className="text-[8px] bg-purple-900/80 text-purple-300 border border-purple-700/50 px-1 rounded uppercase">
                        {t.customTag || 'Custom'}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-400 truncate">{char.role}</span>
                </div>
              </div>

              {/* Badge & Delete Button */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                  char.avatarMode === 'photo'
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    : 'bg-[#152038] text-slate-300 border-[#1a2540]'
                }`}>
                  {char.avatarMode === 'photo' ? 'Photo' : '3D'}
                </span>

                {/* Delete / Trash Button */}
                {onDeleteCharacter && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(isMyanmar ? `"${char.name}" ကို ဖျက်မှာ သေချာပါသလား?` : `Are you sure you want to delete "${char.name}"?`)) {
                        onDeleteCharacter(char.id);
                      }
                    }}
                    className={`p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 border border-transparent hover:border-rose-800/50 transition-all ${
                      char.isCustom ? 'opacity-100 text-rose-400/80' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title={isMyanmar ? `"${char.name}" ကို ဖျက်မည်` : `Delete "${char.name}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. ASSET & AVATAR IMPORTERS (Upload photo / RPM 3D / VRM) */}
      <div className="p-3 border-t border-[#1a2540] bg-[#070b16] flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {isMyanmar ? 'ကိုယ်ပိုင်သွင်းယူရန်' : 'Asset Importers'}
        </span>

        {/* Upload Custom Photo Button */}
        <button
          onClick={() => photoInputRef.current?.click()}
          className="w-full bg-[#0A0F1E] hover:bg-[#12192d] border border-[#1a2540] hover:border-purple-500/40 text-slate-200 p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-purple-400" />
            <span>{isMyanmar ? 'ဓာတ်ပုံ အသစ်တင်ရန်' : 'Upload Any Photo'}</span>
          </div>
          <Upload className="w-3 h-3 text-purple-400" />
        </button>

        {/* Ready Player Me 3D Importer */}
        <button
          onClick={() => {
            const url = prompt(
              isMyanmar
                ? 'Ready Player Me 3D Avatar (.glb သို့မဟုတ် .vrm) URL ထည့်ပါ:'
                : 'Enter Ready Player Me 3D Avatar URL (.glb or .vrm):',
              'https://models.readyplayer.me/64d38c7f3b89b8001cb7419e.glb'
            );
            if (url && url.trim()) {
              onImportRPMUrl(url.trim());
            }
          }}
          className="w-full bg-[#0A0F1E] hover:bg-[#12192d] border border-[#1a2540] hover:border-purple-500/40 text-slate-200 p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>Ready Player Me 3D</span>
          </div>
          <Sparkles className="w-3 h-3 text-purple-400" />
        </button>

        {/* Upload Custom 3D VRM Model */}
        <button
          onClick={() => vrmInputRef.current?.click()}
          className="w-full bg-[#0A0F1E] hover:bg-[#12192d] border border-[#1a2540] hover:border-purple-500/40 text-slate-200 p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>{isMyanmar ? '3D Model (.VRM) တင်ရန်' : 'Upload Custom 3D (.vrm)'}</span>
          </div>
          <ChevronRight className="w-3 h-3 text-purple-400" />
        </button>
      </div>
    </aside>
  );
};
