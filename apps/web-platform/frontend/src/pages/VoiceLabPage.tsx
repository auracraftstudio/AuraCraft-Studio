import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Play, Download, Mic, Radio, Sparkles, Sliders, 
  RefreshCw, Globe, ChevronRight, Activity, Square
} from 'lucide-react';
import { lipSync } from '../audio/lipSyncAnalyzer';
import { formatTtsRatePitch } from './voiceLabUtils';
import { API_ENDPOINTS } from '../config/api';

export const VoiceLabPage: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState('my-MM-NilarNeural');
  const [inputText, setInputText] = useState('မင်္ဂလာပါ! ကျွန်တော်တို့ AuraCraft Neural Voice Studio မှ ကြိုဆိုပါတယ်ခင်ဗျာ။ ဤစနစ်ဖြင့် သဘာဝကျသော အသံများကို တိုက်ရိုက် စမ်းသပ်နိုင်ပါသည်။');
  const [pitch, setPitch] = useState(0); // -30 to +30 Hz
  const [rate, setRate] = useState(1.0); // 0.5x to 1.8x
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => () => {
    lipSync.dispose();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  const VOICES = [
    {
      id: 'my-MM-NilarNeural',
      name: 'Nilar (ဒေါ်နီလာ)',
      countryCode: 'MM',
      countryName: 'Myanmar',
      gender: 'Female',
      badge: 'Natural Host',
      desc: 'Warm, elegant and articulate Burmese female narration with natural cadence.',
    },
    {
      id: 'my-MM-ThihaNeural',
      name: 'Thiha (ဦးသီဟ)',
      countryCode: 'MM',
      countryName: 'Myanmar',
      gender: 'Male',
      badge: 'Deep Anchor',
      desc: 'Authoritative, calm and resonant Burmese male voice for broadcasts and documentaries.',
    },
    {
      id: 'ja-JP-NanamiNeural',
      name: 'Nanami (七海)',
      countryCode: 'JP',
      countryName: 'Japan',
      gender: 'Female',
      badge: 'Anime Heroine',
      desc: 'Expressive and melodic Japanese anime heroine tone suited for idols and heroines.',
    },
    {
      id: 'ja-JP-KeitaNeural',
      name: 'Keita (ケイタ)',
      countryCode: 'JP',
      countryName: 'Japan',
      gender: 'Male',
      badge: 'Mecha Hero',
      desc: 'Brave, energetic young anime protagonist cadence for action and sci-fi roles.',
    },
    {
      id: 'en-US-JennyNeural',
      name: 'Jenny Nova',
      countryCode: 'US',
      countryName: 'United States',
      gender: 'Female',
      badge: 'Tech Streamer',
      desc: 'Vibrant, fast-paced and natural English creator voice for podcasts and streams.',
    },
    {
      id: 'zh-CN-XiaoxiaoNeural',
      name: 'Xiaoxiao',
      countryCode: 'CN',
      countryName: 'China',
      gender: 'Female',
      badge: 'Mandarin Narrator',
      desc: 'Clear, studio-quality Mandarin Chinese narration for multilingual presentations.',
    },
    {
      id: 'ko-KR-SunHiNeural',
      name: 'SunHi',
      countryCode: 'KR',
      countryName: 'South Korea',
      gender: 'Female',
      badge: 'Korean Streamer',
      desc: 'Bright and engaging Korean voice for live interactive streaming and character dialogue.',
    },
    {
      id: 'en-US-GuyNeural',
      name: 'Guy Tactical',
      countryCode: 'US',
      countryName: 'United States',
      gender: 'Male',
      badge: 'Tactical Briefing',
      desc: 'Steady, deep broadcast voice suited for tactical briefings and corporate summits.',
    },
    {
      id: 'en-US-AriaNeural',
      name: 'Aria',
      countryCode: 'US',
      countryName: 'United States',
      gender: 'Female',
      badge: 'Expressive Narrator',
      desc: 'Expressive US English voice with rich emotional range for long-form storytelling.',
    },
  ];

  const [voiceCatalog, setVoiceCatalog] = useState(VOICES);

  useEffect(() => {
    let cancelled = false;
    fetch(API_ENDPOINTS.voices)
      .then(async (response) => {
        if (!response.ok) throw new Error('Voice catalog unavailable');
        const records = await response.json();
        if (!Array.isArray(records) || cancelled) return;
        const catalog = records.map((record: { id: string; name: string; gender?: string; locale?: string; archetype?: string }) => {
          const known = VOICES.find((voice) => voice.id === record.id);
          if (known) return { ...known, gender: record.gender || known.gender };
          const locale = record.locale || record.id.split('-').slice(0, 2).join('-');
          const code = locale === 'zh-CN' ? 'CN' : locale === 'ko-KR' ? 'KR' : locale === 'ja-JP' ? 'JP' : locale === 'my-MM' ? 'MM' : 'US';
          return {
            id: record.id,
            name: record.name || record.id,
            countryCode: code,
            countryName: code === 'MM' ? 'Myanmar' : code === 'JP' ? 'Japan' : 'International',
            gender: record.gender || 'Voice',
            badge: record.archetype || 'Neural Voice',
            desc: record.name || record.id,
          };
        });
        setVoiceCatalog(catalog);
      })
      .catch(() => {
        // Fallback catalog active
      });
    return () => { cancelled = true; };
  }, []);

  const PRESET_SCRIPTS = [
    {
      label: 'Burmese Welcome',
      text: 'မင်္ဂလာပါ! AuraCraft Studio မှ ကြိုဆိုပါတယ်။ ကျွန်တော်တို့ရဲ့ AI စနစ်က 3D Persona တွေနဲ့ တိုက်ရိုက် စကားပြောနိုင်ပါတယ်။',
    },
    {
      label: 'News Broadcast',
      text: 'ဒီကနေ့ သတင်းထုတ်ပြန်ချက်အရ The Nexus Hub Ecosystem အစီအစဉ်များ အောင်မြင်စွာ လည်ပတ်နေပြီဖြစ်ကြောင်း ကြေညာအပ်ပါသည်။',
    },
    {
      label: 'Anime Dialogue',
      text: 'こんにちは！量子フレームの起動準備が完了しました。一緒に冒険へ出発しましょう！',
    },
    {
      label: 'Tech Streamer',
      text: 'Hey everyone! Welcome back to the live stream. Today we are testing real-time 3D VTuber avatars powered by Edge-TTS!',
    },
  ];

  const handleSynthesize = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const backendUrl = API_ENDPOINTS.tts;
      const ttsSettings = formatTtsRatePitch(rate, pitch);
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          voice: selectedVoice,
          ...ttsSettings,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = url;
        setAudioBlobUrl(url);

        const audio = new Audio(url);
        lipSync.init(audio);
        lipSync.resume();

        setIsPlaying(true);
        audio.onended = () => { lipSync.dispose(); setIsPlaying(false); };
        audio.onerror = () => { lipSync.dispose(); setIsPlaying(false); };
        await audio.play();
      } else {
        // Web Speech API fallback
        const utterance = new SpeechSynthesisUtterance(inputText);
        utterance.rate = rate;
        setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Backend call failed, using client fallback:', err);
      const utterance = new SpeechSynthesisUtterance(inputText);
      utterance.rate = rate;
      setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050A14] text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#1A2540] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-500/15 border border-purple-500/30 rounded-2xl text-purple-400 shadow-sm shadow-purple-500/10">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Neural Voice Lab
              </h1>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Multi-Locale Neural TTS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              High-fidelity multilingual neural voices with viseme synchronization for Burmese, Japanese, and English.
            </p>
          </div>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-500/40 px-3.5 py-1.5 rounded-xl text-purple-300 text-xs font-semibold animate-pulse shadow-md shadow-purple-900/30">
            <Radio className="w-4 h-4 text-purple-400" />
            <span>Audio Graph Streaming (Lip-Sync Active)</span>
          </div>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Voice Selection Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-purple-400" />
              Voice Catalog ({voiceCatalog.length})
            </h2>
            <span className="text-[11px] text-slate-500">Select persona</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {voiceCatalog.map((v) => {
              const isSelected = selectedVoice === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500/70 shadow-sm shadow-purple-500/10 ring-1 ring-purple-500/40'
                      : 'bg-[#0A0F1E] hover:bg-[#0E1528] border-[#1A2540]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-[#050A14] text-slate-400 border border-[#1A2540]'
                      }`}
                    >
                      {v.countryCode}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-100 flex items-center gap-2 truncate">
                        <span className="truncate">{v.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({v.gender})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{v.desc}</p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#050A14] text-purple-300 border border-purple-500/30 flex-shrink-0 ml-2">
                    {v.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Speech Input, Sliders & Audio Player (7 cols) */}
        <div className="lg:col-span-7 bg-[#0A0F1E] border border-[#1A2540] p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Quick Presets */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Quick Test Prompts
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_SCRIPTS.map((ps, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(ps.text)}
                    className="px-3 py-1.5 rounded-lg bg-[#050A14] hover:bg-[#121B30] border border-[#1A2540] hover:border-purple-500/30 text-[11px] text-slate-300 transition-colors font-medium"
                  >
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Script Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Input Text to Synthesize (အသံထွက်စေမည့် စာသား)
              </label>
              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste Burmese, English, or Japanese text here..."
                className="w-full bg-[#050A14] border border-[#1A2540] focus:border-purple-500/70 rounded-xl p-3.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none leading-relaxed font-sans transition-colors"
              />
            </div>

            {/* Voice Tuning Sliders */}
            <div className="grid grid-cols-2 gap-4 bg-[#050A14] p-4 rounded-xl border border-[#1A2540]">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-2">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    Speech Rate
                  </span>
                  <span className="text-purple-300 font-mono font-semibold">{rate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-2">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Pitch Variance
                  </span>
                  <span className="text-cyan-400 font-mono font-semibold">{pitch > 0 ? `+${pitch}` : pitch}Hz</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="2"
                  value={pitch}
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Audio Waveform State Indicator */}
            {isPlaying && (
              <div className="bg-[#050A14] p-3 rounded-xl border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-xs text-slate-300 font-medium">Synthesizer Output Active</span>
                </div>
                <div className="flex items-center gap-1">
                  {[40, 70, 30, 90, 50, 80, 60, 100, 45, 85].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-purple-500 rounded-full animate-pulse"
                      style={{ height: `${h * 0.25}px`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#1A2540] flex items-center justify-between gap-3">
            {audioBlobUrl ? (
              <a
                href={audioBlobUrl}
                download={`auracraft_${selectedVoice}_speech.mp3`}
                className="flex items-center gap-2 px-4 py-2 bg-[#050A14] hover:bg-[#121B30] border border-[#1A2540] hover:border-purple-500/40 rounded-xl text-xs text-slate-200 transition-colors font-medium shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                Download Audio (.mp3)
              </a>
            ) : (
              <div className="text-[11px] text-slate-500">Click Generate to synthesize speech</div>
            )}

            <button
              onClick={handleSynthesize}
              disabled={isLoading || !inputText.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>Generate & Speak</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
