import React, { useState, useEffect } from 'react';
import { 
  Layers, Plus, Download, Search, Check, Trash2, 
  Sparkles, ArrowRight, Volume2, User, Globe, Shield, 
  Briefcase, Zap, Film, Tv, Brain, FolderTree, Cpu, Sliders
} from 'lucide-react';
import { CharacterArchetype } from '../components/CharacterCasting';

interface CharactersPageProps {
  onCastToStage: (character: CharacterArchetype) => void;
  onNavigateToStage: () => void;
}

export const CharactersPage: React.FC<CharactersPageProps> = ({
  onCastToStage,
  onNavigateToStage,
}) => {
  const [characters, setCharacters] = useState<CharacterArchetype[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedUsage, setSelectedUsage] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [bulkExported, setBulkExported] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // New character form state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newStyle, setNewStyle] = useState<'anime' | 'realistic' | 'myanmar' | 'army' | 'streamer' | 'corporate' | 'custom'>('realistic');
  const [newUsage, setNewUsage] = useState<'narrativ_manga' | 'obs_stream' | 'cognix_research' | 'doka_enterprise' | 'general'>('narrativ_manga');
  const [newAvatarType, setNewAvatarType] = useState<'vrm_3d' | 'image_2d'>('vrm_3d');
  const [newVoice, setNewVoice] = useState('my-MM-NilarNeural');
  const [newPersonality, setNewPersonality] = useState('');
  const [newLoraTag, setNewLoraTag] = useState('');
  const [newFaceRefUrl, setNewFaceRefUrl] = useState('');

  // Default presets with pure text badges (no emojis)
  const DEFAULT_PRESETS: CharacterArchetype[] = [
    {
      id: 'char_anime_shinji',
      name: 'Shinji Kazama (シンジ)',
      role: 'Anime Protagonist & Mecha Pilot',
      style: 'anime',
      usage_target: 'narrativ_manga',
      avatar_type: 'vrm_3d',
      voice_id: 'ja-JP-KeitaNeural',
      default_emotion: 'neutral',
      badge: 'Anime Hero',
      color: '#38bdf8',
      personality: 'Determined, heroic young mecha pilot piloting the Quantum Frame in deep space reconnaissance.',
      lora_tag: '<lora:shinji_kazama:0.85> shinji_pilot, mecha uniform',
      face_reference_url: '/assets/avatars/shinji_face_ref.png',
    },
    {
      id: 'char_anime_sakura',
      name: 'Sakura Hoshino (サクラ)',
      role: 'Anime Heroine & Magical Idol',
      style: 'anime',
      usage_target: 'narrativ_manga',
      avatar_type: 'vrm_3d',
      voice_id: 'ja-JP-NanamiNeural',
      default_emotion: 'happy',
      badge: 'Anime Idol',
      color: '#ec4899',
      personality: 'Cheerful, radiant magical girl spreading hope and acoustic energy across orbital colonies.',
      lora_tag: '<lora:sakura_hoshino:0.85> sakura_idol, pink twintails',
      face_reference_url: '/assets/avatars/sakura_face_ref.png',
    },
    {
      id: 'char_realistic_daw_khin',
      name: 'Daw Khin Than (ဒေါ်ခင်သန်း)',
      role: 'Sovereign Diplomat & Enterprise Leader',
      style: 'realistic',
      usage_target: 'doka_enterprise',
      avatar_type: 'vrm_3d',
      voice_id: 'my-MM-NilarNeural',
      default_emotion: 'neutral',
      badge: 'Diplomat Leader',
      color: '#06b6d4',
      personality: 'Distinguished executive diplomat and strategic enterprise leader presiding over bilateral initiatives.',
    },
    {
      id: 'char_realistic_dr_hlaing',
      name: 'Dr. Hlaing Min (ဒေါက်တာလှိုင်မင်း)',
      role: 'Chief AI & Quantum Researcher',
      style: 'realistic',
      usage_target: 'cognix_research',
      avatar_type: 'vrm_3d',
      voice_id: 'my-MM-ThihaNeural',
      default_emotion: 'neutral',
      badge: 'Quantum Scientist',
      color: '#8b5cf6',
      personality: 'Visionary research scientist and AI academic lecturer exploring neural symbolic reasoning.',
    },
    {
      id: 'char_realistic_ko_phyo',
      name: 'Ko Phyo (ကိုဖြိုး - သတင်းထောက်)',
      role: 'Senior Investigative News Anchor',
      style: 'realistic',
      usage_target: 'obs_stream',
      avatar_type: 'vrm_3d',
      voice_id: 'my-MM-ThihaNeural',
      default_emotion: 'neutral',
      badge: 'News Anchor',
      color: '#3b82f6',
      personality: 'Calm, authoritative broadcast journalist delivering prime-time geopolitical briefings.',
    },
    {
      id: 'char_myanmar_nilar',
      name: 'Daw Nilar (ဒေါ်နီလာ - သနပ်ခါး)',
      role: 'Traditional Thanakha Cultural Host',
      style: 'myanmar',
      usage_target: 'obs_stream',
      avatar_type: 'vrm_3d',
      voice_id: 'my-MM-NilarNeural',
      default_emotion: 'happy',
      badge: 'Cultural Host',
      color: '#f59e0b',
      personality: 'Gracious cultural ambassador wearing traditional ceremonial attire and sharing heritage narratives.',
    },
    {
      id: 'char_myanmar_min_thar',
      name: 'Min Thar Thant Zin (မင်းသားသန့်စင်)',
      role: 'Classical Royal Performing Artist',
      style: 'myanmar',
      usage_target: 'narrativ_manga',
      avatar_type: 'vrm_3d',
      voice_id: 'my-MM-ThihaNeural',
      default_emotion: 'neutral',
      badge: 'Royal Artist',
      color: '#d97706',
      personality: 'Eloquent classical royal court artist and narrative dramatic actor performing dynastic epics.',
    },
    {
      id: 'char_army_general_min',
      name: 'General Min Zaw (ဗိုလ်ချုပ်မင်းဇော်)',
      role: 'Tactical Commander & Strategist',
      style: 'army',
      usage_target: 'narrativ_manga',
      avatar_type: 'vrm_3d',
      voice_id: 'my-MM-ThihaNeural',
      default_emotion: 'neutral',
      badge: 'Tactical Commander',
      color: '#84cc16',
      personality: 'Disciplined military defense strategist and orbital fleet commander coordinating planetary shields.',
    },
    {
      id: 'char_army_sergeant_kyaw',
      name: 'Sergeant Kyaw Thu (တပ်ကြပ်ကြီးကျော်သူ)',
      role: 'Special Operations Specialist',
      style: 'army',
      usage_target: 'narrativ_manga',
      avatar_type: 'vrm_3d',
      voice_id: 'my-MM-ThihaNeural',
      default_emotion: 'angry',
      badge: 'Spec-Ops Leader',
      color: '#eab308',
      personality: 'Frontline tactical operator with specialized combat intelligence and high-threat infiltration skills.',
    },
    {
      id: 'char_corp_alex',
      name: 'Alex Vance (Executive Host)',
      role: 'Global Tech & Finance Moderator',
      style: 'corporate',
      usage_target: 'doka_enterprise',
      avatar_type: 'vrm_3d',
      voice_id: 'en-US-GuyNeural',
      default_emotion: 'neutral',
      badge: 'Tech Moderator',
      color: '#6366f1',
      personality: 'Sharp, polished corporate moderator and global ecosystem summit master of ceremonies.',
    },
    {
      id: 'char_streamer_jenny',
      name: 'Jenny Nova',
      role: 'Cyberpunk Streamer & VTuber',
      style: 'streamer',
      usage_target: 'obs_stream',
      avatar_type: 'vrm_3d',
      voice_id: 'en-US-JennyNeural',
      default_emotion: 'surprised',
      badge: 'Cyber VTuber',
      color: '#a855f7',
      personality: 'High-energy gaming and technology VTuber content creator broadcasting to multi-channel platforms.',
    },
    {
      id: 'char_streamer_maya',
      name: 'Maya Cyber (မာယာ)',
      role: 'Neural Net & AI Specialist',
      style: 'streamer',
      usage_target: 'cognix_research',
      avatar_type: 'vrm_3d',
      voice_id: 'my-MM-NilarNeural',
      default_emotion: 'happy',
      badge: 'Neural Specialist',
      color: '#10b981',
      personality: 'Futuristic AI researcher and digital streamer bridging human curiosity and synthetic intelligence.',
    },
  ];

  // Load characters with custom from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auracraft_custom_chars');
      if (stored) {
        const custom = JSON.parse(stored);
        setCharacters([...DEFAULT_PRESETS, ...custom]);
      } else {
        setCharacters(DEFAULT_PRESETS);
      }
    } catch {
      setCharacters(DEFAULT_PRESETS);
    }
  }, []);

  const handleCreateCustomCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const badgeLabel = newStyle === 'realistic' ? 'Realistic Human' : newStyle === 'anime' ? 'Anime 3D' : 'Custom Persona';
    const newChar: CharacterArchetype = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || 'Custom Persona',
      style: newStyle,
      usage_target: newUsage,
      avatar_type: newAvatarType,
      voice_id: newVoice,
      default_emotion: 'neutral',
      badge: badgeLabel,
      color: newStyle === 'realistic' ? '#06b6d4' : '#a855f7',
      personality: newPersonality.trim() || `${newName} - Custom configured character persona`,
      lora_tag: newLoraTag.trim() || undefined,
      face_reference_url: newFaceRefUrl.trim() || undefined,
    };

    const stored = localStorage.getItem('auracraft_custom_chars');
    const existingCustom = stored ? JSON.parse(stored) : [];
    const updatedCustom = [newChar, ...existingCustom];
    localStorage.setItem('auracraft_custom_chars', JSON.stringify(updatedCustom));

    setCharacters([...DEFAULT_PRESETS, ...updatedCustom]);
    setShowAddModal(false);
    setNewName('');
    setNewRole('');
    setNewPersonality('');
    setNewLoraTag('');
    setNewFaceRefUrl('');
  };

  const handleDeleteCharacter = (id: string) => {
    const stored = localStorage.getItem('auracraft_custom_chars');
    if (stored) {
      const existingCustom = JSON.parse(stored);
      const updated = existingCustom.filter((c: CharacterArchetype) => c.id !== id);
      localStorage.setItem('auracraft_custom_chars', JSON.stringify(updated));
      setCharacters([...DEFAULT_PRESETS, ...updated]);
    }
  };

  const handleBulkExport = () => {
    try {
      const blob = new Blob([JSON.stringify(characters, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_auracraft_archetypes_pack.json';
      a.click();
      URL.revokeObjectURL(url);
      setBulkExported(true);
      setTimeout(() => setBulkExported(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreviewVoice = (voiceId: string) => {
    setPlayingVoiceId(voiceId);
    const sampleText = voiceId.startsWith('my') 
      ? 'မင်္ဂလာပါ! ကျွန်တော်ကတော့ AuraCraft ရဲ့ AI အသံဖြစ်ပါတယ်ခင်ဗျာ။' 
      : voiceId.startsWith('ja') 
      ? 'こんにちは！オーラクラフトスタジオへようこそ！' 
      : 'Hello! Welcome to AuraCraft Studio Neural Engine.';

    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.onend = () => setPlayingVoiceId(null);
    utterance.onerror = () => setPlayingVoiceId(null);
    window.speechSynthesis.speak(utterance);
  };

  const filteredCharacters = characters.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.personality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStyle = selectedStyle === 'all' || c.style === selectedStyle;
    const matchesUsage = selectedUsage === 'all' || c.usage_target === selectedUsage;
    return matchesSearch && matchesStyle && matchesUsage;
  });

  const count3D = characters.filter(c => c.avatar_type === 'vrm_3d').length;
  const count2D = characters.filter(c => c.avatar_type === 'image_2d').length;
  const countCustom = characters.filter(c => c.id.startsWith('custom_')).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050A14] text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A2540] pb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-600/15 border border-purple-500/30 rounded-2xl text-purple-400 shadow-sm shadow-purple-500/10">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Character Casting & Archetypes
              </h1>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                {characters.length} Active Presets
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manage, cast, and orchestrate 3D VRM Humanoids & 2D Personas for Manga, OBS Streaming, Cognix AI, and Doka DMS.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Persona
          </button>

          <button
            onClick={handleBulkExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A0F1E] hover:bg-[#10182E] border border-[#1A2540] hover:border-purple-500/40 text-slate-300 hover:text-white font-medium text-xs transition-all shadow-sm"
          >
            {bulkExported ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-purple-400" />}
            Export Pack (.json)
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#0A0F1E] border border-[#1A2540] rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Archetypes</div>
            <div className="text-lg font-bold text-white mt-0.5">{characters.length}</div>
          </div>
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#0A0F1E] border border-[#1A2540] rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">3D VRM Models</div>
            <div className="text-lg font-bold text-cyan-400 mt-0.5">{count3D}</div>
          </div>
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#0A0F1E] border border-[#1A2540] rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">2D Photo Avatars</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{count2D}</div>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <User className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#0A0F1E] border border-[#1A2540] rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Custom Personas</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{countCustom}</div>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0A0F1E] border border-[#1A2540] p-4 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search characters by name, role, or background bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050A14] border border-[#1A2540] focus:border-purple-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Style Category Filter */}
          <div className="flex items-center gap-1 bg-[#050A14] border border-[#1A2540] rounded-xl p-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Style:</span>
            {[
              { id: 'all', label: 'All', icon: Sliders },
              { id: 'realistic', label: 'Realistic', icon: User },
              { id: 'anime', label: 'Anime', icon: Sparkles },
              { id: 'myanmar', label: 'Myanmar', icon: Globe },
              { id: 'army', label: 'Military', icon: Shield },
              { id: 'corporate', label: 'Corporate', icon: Briefcase },
              { id: 'streamer', label: 'Streamer', icon: Zap },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = selectedStyle === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStyle(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0A0F1E]'
                  }`}
                >
                  <TabIcon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Usage Target Filter */}
          <div className="flex items-center gap-1 bg-[#050A14] border border-[#1A2540] rounded-xl p-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Target:</span>
            {[
              { id: 'all', label: 'All', icon: Layers },
              { id: 'narrativ_manga', label: 'Manga', icon: Film },
              { id: 'obs_stream', label: 'OBS', icon: Tv },
              { id: 'cognix_research', label: 'Cognix', icon: Brain },
              { id: 'doka_enterprise', label: 'Doka', icon: FolderTree },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = selectedUsage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedUsage(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0A0F1E]'
                  }`}
                >
                  <TabIcon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Character Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCharacters.map((char) => (
          <div
            key={char.id}
            className="group relative bg-[#0A0F1E] hover:bg-[#0E1528] border border-[#1A2540] hover:border-purple-500/50 rounded-2xl p-4.5 transition-all duration-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Header: Name, Role & Status Badge */}
              <div className="flex items-start justify-between gap-2.5 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full ring-2 ring-white/10 flex-shrink-0"
                    style={{ backgroundColor: char.color }}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors truncate">
                      {char.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{char.role}</p>
                  </div>
                </div>

                <span
                  className="text-[10px] px-2 py-0.5 rounded-md font-semibold border flex-shrink-0"
                  style={{
                    color: char.color,
                    borderColor: `${char.color}40`,
                    backgroundColor: `${char.color}15`,
                  }}
                >
                  {char.badge}
                </span>
              </div>

              {/* Personality Description */}
              <p className="text-xs text-slate-300/80 leading-relaxed bg-[#050A14] p-3 rounded-xl border border-[#1A2540] mb-3.5 min-h-[56px] line-clamp-2">
                "{char.personality}"
              </p>

              {/* LoRA DNA Badge if configured */}
              {char.lora_tag && (
                <div className="mb-2 bg-purple-950/20 border border-purple-500/30 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[10px]">
                  <span className="text-purple-300 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    LoRA DNA
                  </span>
                  <span className="font-mono text-purple-200/90 truncate max-w-[140px]" title={char.lora_tag}>
                    {char.lora_tag}
                  </span>
                </div>
              )}

              {/* Meta Tags */}
              <div className="grid grid-cols-2 gap-2 text-[10px] mb-3.5">
                <div className="bg-[#050A14] px-2.5 py-1.5 rounded-lg border border-[#1A2540] flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Target</span>
                  <span className="font-semibold text-cyan-400">
                    {char.usage_target === 'narrativ_manga' ? 'Manga Studio' : 
                     char.usage_target === 'obs_stream' ? 'OBS Live' : 
                     char.usage_target === 'cognix_research' ? 'Cognix Nexus' : 'Doka DMS'}
                  </span>
                </div>

                <div className="bg-[#050A14] px-2.5 py-1.5 rounded-lg border border-[#1A2540] flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Format</span>
                  <span className="font-semibold text-emerald-400">
                    {char.avatar_type === 'vrm_3d' ? '3D VRM' : '2D Portrait'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#1A2540] flex items-center justify-between gap-2">
              <button
                onClick={() => handlePreviewVoice(char.voice_id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#050A14] hover:bg-[#121B30] border border-[#1A2540] hover:border-purple-500/30 rounded-lg text-[11px] text-slate-300 transition-colors"
                title="Preview voice sample"
              >
                <Volume2 className={`w-3.5 h-3.5 ${playingVoiceId === char.voice_id ? 'text-purple-400 animate-pulse' : 'text-slate-400'}`} />
                <span>{playingVoiceId === char.voice_id ? 'Speaking...' : 'Voice Sample'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                {char.id.startsWith('custom_') && (
                  <button
                    onClick={() => handleDeleteCharacter(char.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
                    title="Delete custom character"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    onCastToStage(char);
                    onNavigateToStage();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  <span>Cast Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Character Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0F1E] border border-[#1A2540] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2540] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-purple-500/15 rounded-lg text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Create New Character Persona</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 text-sm rounded-lg hover:bg-[#121B30]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomCharacter} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Persona Name (ဇာတ်ကောင်အမည်)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Captain Thant (ဗိုလ်မှူးသန့်)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#050A14] border border-[#1A2540] rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/70"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Role & Title (အခန်းကဏ္ဍ)</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Orbital Explorer & Tactician"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#050A14] border border-[#1A2540] rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Style Category</label>
                  <select
                    value={newStyle}
                    onChange={(e) => setNewStyle(e.target.value as any)}
                    className="w-full bg-[#050A14] border border-[#1A2540] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500/70"
                  >
                    <option value="realistic">Realistic Human</option>
                    <option value="anime">Anime 3D</option>
                    <option value="myanmar">Myanmar Traditional</option>
                    <option value="army">Military / Tactical</option>
                    <option value="corporate">Corporate / News</option>
                    <option value="streamer">VTuber / Streamer</option>
                    <option value="custom">Custom Persona</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Usage Destination</label>
                  <select
                    value={newUsage}
                    onChange={(e) => setNewUsage(e.target.value as any)}
                    className="w-full bg-[#050A14] border border-[#1A2540] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500/70"
                  >
                    <option value="narrativ_manga">Narrativ Forge Manga</option>
                    <option value="obs_stream">OBS Live Streaming</option>
                    <option value="cognix_research">Cognix Nexus AI</option>
                    <option value="doka_enterprise">Doka Enterprise DMS</option>
                    <option value="general">General Ecosystem</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Avatar Format</label>
                  <select
                    value={newAvatarType}
                    onChange={(e) => setNewAvatarType(e.target.value as any)}
                    className="w-full bg-[#050A14] border border-[#1A2540] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500/70"
                  >
                    <option value="vrm_3d">3D VRM Humanoid</option>
                    <option value="image_2d">2D Portrait Photo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Neural Voice</label>
                  <select
                    value={newVoice}
                    onChange={(e) => setNewVoice(e.target.value)}
                    className="w-full bg-[#050A14] border border-[#1A2540] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500/70"
                  >
                    <option value="my-MM-NilarNeural">Burmese Female (Nilar)</option>
                    <option value="my-MM-ThihaNeural">Burmese Male (Thiha)</option>
                    <option value="en-US-JennyNeural">English US Female (Jenny)</option>
                    <option value="en-US-GuyNeural">English US Male (Guy)</option>
                    <option value="ja-JP-NanamiNeural">Japanese Female (Nanami)</option>
                    <option value="ja-JP-KeitaNeural">Japanese Male (Keita)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Personality / Story Bio</label>
                <textarea
                  rows={3}
                  placeholder="Describe character personality, backstory, and behavioral traits..."
                  value={newPersonality}
                  onChange={(e) => setNewPersonality(e.target.value)}
                  className="w-full bg-[#050A14] border border-[#1A2540] rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/70"
                />
              </div>

              {/* Visual DNA & LoRA Fields */}
              <div className="p-3 bg-[#050A14] border border-[#1A2540] rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Visual DNA & LoRA Consistency (Narrativ Forge Sync)</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">LoRA Trigger Tag / Model Binding</label>
                  <input
                    type="text"
                    placeholder="e.g. <lora:hero_aung:0.85> aung_character, military jacket"
                    value={newLoraTag}
                    onChange={(e) => setNewLoraTag(e.target.value)}
                    className="w-full bg-[#0A0F1E] border border-[#1A2540] rounded-lg px-3 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/70"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Auto-injected into Narrativ Forge prompt generators to maintain exact character facial fidelity.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Face Reference Snapshot URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /models/faces/hero_face.png or https://..."
                    value={newFaceRefUrl}
                    onChange={(e) => setNewFaceRefUrl(e.target.value)}
                    className="w-full bg-[#0A0F1E] border border-[#1A2540] rounded-lg px-3 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/70"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Reference portrait used for IP-Adapter and FaceID conditioning across episodes.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-[#1A2540]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#050A14] hover:bg-[#121B30] text-slate-300 text-xs font-medium border border-[#1A2540]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30"
                >
                  Save Persona to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
