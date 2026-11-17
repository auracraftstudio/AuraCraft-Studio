import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Camera, RefreshCw, Volume2, Zap, Heart, Star,
  MessageSquare, Sparkles, Square, Download, Smile,
  Wand2, Image, ChevronRight, Loader2, Play, User, Trash2,
  Meh, Frown, AlertCircle, Flame, Check
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { limitPollinationsPrompt } from './photoAvatarUtils';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabMode = 'photo' | 'prompt';
type ExpressionId = 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry';

const EXPRESSIONS: { id: ExpressionId; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'neutral',   icon: Meh,         label: 'Neutral'   },
  { id: 'happy',     icon: Smile,       label: 'Happy'     },
  { id: 'sad',       icon: Frown,       label: 'Sad'       },
  { id: 'surprised', icon: AlertCircle, label: 'Surprised' },
  { id: 'angry',     icon: Flame,       label: 'Angry'     },
];

const VOICES = [
  { id: 'my-MM-NilarNeural',    label: 'Nilar (နီလာ)',    lang: 'Myanmar Female', countryCode: 'MM' },
  { id: 'my-MM-ThihaNeural',    label: 'Thiha (သိဟ)',     lang: 'Myanmar Male',   countryCode: 'MM' },
  { id: 'ja-JP-NanamiNeural',   label: 'Nanami (ナナミ)',  lang: 'Japanese Female',countryCode: 'JP' },
  { id: 'ja-JP-KeitaNeural',    label: 'Keita (ケイタ)',   lang: 'Japanese Male',  countryCode: 'JP' },
  { id: 'en-US-JennyNeural',    label: 'Jenny',            lang: 'English Female', countryCode: 'US' },
  { id: 'en-US-GuyNeural',      label: 'Guy',              lang: 'English Male',   countryCode: 'US' },
  { id: 'zh-CN-XiaoxiaoNeural', label: 'Xiaoxiao (晓晓)', lang: 'Chinese Female', countryCode: 'CN' },
  { id: 'ko-KR-SunHiNeural',    label: 'SunHi (선희)',    lang: 'Korean Female',  countryCode: 'KR' },
];

const PROMPT_STYLES = [
  { id: 'anime',      label: 'Anime',           example: 'anime girl, big eyes, colorful hair, portrait' },
  { id: 'realistic',  label: 'Realistic',       example: 'realistic portrait, professional photo, studio lighting' },
  { id: 'myanmar',    label: 'Myanmar Cultural',example: 'myanmar woman in traditional longyi, thanakha, portrait' },
  { id: 'fantasy',    label: 'Fantasy Art',     example: 'fantasy elf character, glowing eyes, magical aura, portrait' },
  { id: 'cyberpunk',  label: 'Cyberpunk',       example: 'cyberpunk girl, neon lights, futuristic city, portrait' },
  { id: 'chibi',      label: 'Chibi Stylized',  example: 'chibi character, cute, big head, colorful, portrait' },
];

// ─── Canvas Talking-Face Renderer ─────────────────────────────────────────────
function renderTalkingFace(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  mouthOpen: number,   // 0–1
  blinkAmt: number,    // 0–1
  tilt: number,        // degrees
  expression: ExpressionId
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate((tilt * Math.PI) / 180);

  const splitY = H * 0.63;
  const stretch = mouthOpen * H * 0.06;

  // Upper portion
  ctx.drawImage(img, 0, 0, W, splitY, -W / 2, -H / 2, W, splitY);

  // Lower portion
  ctx.drawImage(img, 0, splitY, W, H - splitY, -W / 2, -H / 2 + splitY + stretch * 0.5, W, H - splitY + stretch);

  if (mouthOpen > 0.05) {
    const gapY = -H / 2 + splitY;
    const gapH = stretch * 0.5;
    ctx.drawImage(img, 0, splitY - 4, W, 4, -W / 2, gapY, W, gapH);

    const mouthX = -W * 0.12;
    const mouthW = W * 0.24;
    const cavityY = gapY + gapH * 0.1;
    const cavityH = Math.max(gapH * 0.8, 2);
    const mouthGrad = ctx.createRadialGradient(0, cavityY + cavityH / 2, 0, 0, cavityY + cavityH / 2, mouthW * 0.5);
    mouthGrad.addColorStop(0, `rgba(5,2,10,${0.65 + mouthOpen * 0.3})`);
    mouthGrad.addColorStop(0.6, `rgba(10,4,18,${0.5 + mouthOpen * 0.2})`);
    mouthGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.ellipse(0, cavityY + cavityH / 2, mouthW * 0.5, cavityH, 0, 0, Math.PI * 2);
    ctx.fillStyle = mouthGrad;
    ctx.fill();

    if (mouthOpen > 0.25) {
      ctx.beginPath();
      ctx.ellipse(0, cavityY + cavityH * 0.3, mouthW * 0.3, cavityH * 0.3, 0, 0, Math.PI);
      ctx.fillStyle = `rgba(240,235,228,${(mouthOpen - 0.25) * 0.9})`;
      ctx.fill();
    }
  }

  ctx.restore();

  // Blink overlay
  if (blinkAmt > 0.05) {
    const eyeY = H * 0.37;
    const eyeSpacing = W * 0.145;
    const eyeRW = W * 0.09;
    const eyeRH = H * 0.028 * blinkAmt;
    ctx.save();
    for (const ex of [-eyeSpacing, eyeSpacing]) {
      ctx.beginPath();
      ctx.ellipse(W / 2 + ex, eyeY, eyeRW, eyeRH, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(10,5,15,${0.85 * blinkAmt})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // Expression tint
  const tints: Record<ExpressionId, string> = {
    neutral:   'transparent',
    happy:     'rgba(250,220,100,0.07)',
    sad:       'rgba(80,140,220,0.09)',
    surprised: 'rgba(240,160,40,0.07)',
    angry:     'rgba(220,50,50,0.09)',
  };
  if (tints[expression] !== 'transparent') {
    ctx.fillStyle = tints[expression];
    ctx.fillRect(0, 0, W, H);
  }

  // Speaking glow
  if (mouthOpen > 0.08) {
    const glowAlpha = mouthOpen * 0.35;
    const gradient = ctx.createRadialGradient(W / 2, H * 0.75, 0, W / 2, H * 0.75, W * 0.45);
    gradient.addColorStop(0, `rgba(168,85,247,${glowAlpha * 0.5})`);
    gradient.addColorStop(0.5, `rgba(168,85,247,${glowAlpha * 0.2})`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const PhotoAvatarPage: React.FC = () => {
  const [tab, setTab] = useState<TabMode>('photo');

  // Photo Mode State
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [generatedPhotoUrl, setGeneratedPhotoUrl] = useState<string | null>(null);
  const uploadedPhotoUrl = useObjectUrl(photoBlob);
  const photoUrl = generatedPhotoUrl || uploadedPhotoUrl;
  const [photoName, setPhotoName]     = useState('');
  const [isDragging, setIsDragging]   = useState(false);
  const [expression, setExpression]   = useState<ExpressionId>('neutral');
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl]       = useState<string | null>(null);
  const [statusMsg, setStatusMsg]     = useState('');
  const [selectedVoice, setSelectedVoice] = useState('my-MM-NilarNeural');
  const [rate, setRate]               = useState(1.0);
  const [pitch, setPitch]             = useState(1.0);
  const [text, setText]               = useState('မင်္ဂလာပါ! ကျွန်မနာမည်က AuraCraft AI Photo Avatar ပါ။ ကြိုဆိုပါတယ်!');

  // Prompt Mode State
  const [promptText, setPromptText]       = useState('');
  const [promptStyle, setPromptStyle]     = useState('anime');
  const [promptNegative, setPromptNegative] = useState('blur, watermark, low quality, deformed');
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [promptSpeaking, setPromptSpeaking]   = useState(false);
  const [promptText2, setPromptText2]     = useState('');

  // Refs
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imgRef       = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const animRef      = useRef<number>(0);
  const nextBlinkRef = useRef(3.0);
  const nextTiltRef  = useRef(5.0);

  // Animation Loop
  useEffect(() => {
    if (!photoUrl || !canvasRef.current) return;

    let lastTime = performance.now();
    let mouth = 0, blink = 0, tilt = 0, targetTilt = 0;
    let blinkTimer = 0, tiltTimer = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (analyserRef.current) {
        const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(buf);
        const avg = buf.slice(0, 24).reduce((a, b) => a + b, 0) / 24;
        mouth += (Math.min(avg / 85, 1) - mouth) * Math.min(dt * 18, 1);
      } else {
        mouth = Math.max(mouth - dt * 8, 0);
      }

      blinkTimer += dt;
      if (blinkTimer >= nextBlinkRef.current) {
        blinkTimer = 0;
        nextBlinkRef.current = 2 + Math.random() * 4.5;
      }
      const bp = blinkTimer / 0.14;
      blink = bp < 1 ? Math.sin(bp * Math.PI) : 0;

      tiltTimer += dt;
      if (tiltTimer >= nextTiltRef.current) {
        tiltTimer = 0;
        nextTiltRef.current = 4 + Math.random() * 7;
        targetTilt = (Math.random() - 0.5) * 2.5;
      }
      tilt += (targetTilt - tilt) * dt * 1.2;

      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (canvas && img) {
        renderTalkingFace(canvas, img, mouth, blink, tilt, expression);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [photoUrl, expression]);

  const loadPhoto = useCallback((file: File) => {
    setGeneratedPhotoUrl(null);
    setPhotoBlob(file);
    setPhotoName(file.name);
    setStatusMsg('Image loaded successfully');
  }, []);

  useEffect(() => {
    if (!uploadedPhotoUrl) return;
    const img = new window.Image();
    img.onload = () => { imgRef.current = img; };
    img.src = uploadedPhotoUrl;
    return () => { img.onload = null; };
  }, [uploadedPhotoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadPhoto(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) loadPhoto(f);
  };

  const playSpeech = async (url: string, onEnd: () => void) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const actx = audioCtxRef.current;
    if (actx.state === 'suspended') await actx.resume();

    const analyser = actx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;
    analyser.connect(actx.destination);

    const audio = new Audio(url);
    audioRef.current = audio;
    const src = actx.createMediaElementSource(audio);
    src.connect(analyser);
    audio.play();
    audio.onended = () => { analyserRef.current = null; onEnd(); };
  };

  const handleGenerate = async (speakUrl?: string | null, forPhoto = true) => {
    const speakText = forPhoto ? text : promptText2;
    if (!speakText.trim()) { setStatusMsg('Please enter dialogue text'); return; }

    if (forPhoto) setIsGenerating(true); else setPromptSpeaking(true);
    setStatusMsg('Synthesizing speech via Edge-TTS...');

    try {
      const res = await fetch(API_ENDPOINTS.tts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: speakText,
          voice: selectedVoice,
          rate: `+${Math.round((rate - 1) * 100)}%`,
          pitch: `+${Math.round((pitch - 1) * 50)}Hz`,
        }),
      });
      if (!res.ok) throw new Error('TTS error');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      if (forPhoto) {
        setIsSpeaking(true);
        await playSpeech(url, () => { setIsSpeaking(false); setIsGenerating(false); setStatusMsg('Playback complete'); });
      } else {
        setPromptSpeaking(true);
        await playSpeech(url, () => { setPromptSpeaking(false); setStatusMsg('Playback complete'); });
      }
    } catch {
      setStatusMsg('Browser Web Speech synthesis active...');
      const utt = new SpeechSynthesisUtterance(speakText);
      utt.rate = rate; utt.pitch = pitch;
      if (forPhoto) setIsSpeaking(true); else setPromptSpeaking(true);
      let interval: ReturnType<typeof setInterval> | null = null;

      if (forPhoto && canvasRef.current) {
        interval = setInterval(() => {
          if (canvasRef.current && imgRef.current) {
            renderTalkingFace(canvasRef.current, imgRef.current, 0.3 + Math.random() * 0.5, 0, 0, expression);
          }
        }, 110);
      }

      utt.onend = () => {
        if (interval) clearInterval(interval);
        if (forPhoto) { setIsSpeaking(false); setIsGenerating(false); }
        else setPromptSpeaking(false);
        setStatusMsg('Complete');
      };
      speechSynthesis.speak(utt);
    }
  };

  const handleStop = () => {
    audioRef.current?.pause();
    speechSynthesis.cancel();
    analyserRef.current = null;
    setIsSpeaking(false);
    setPromptSpeaking(false);
    setIsGenerating(false);
    setStatusMsg('Playback stopped');
  };

  const handlePromptGenerate = async () => {
    const style = PROMPT_STYLES.find(s => s.id === promptStyle);
    const fullPrompt = limitPollinationsPrompt(`${promptText}, ${style?.example ?? ''}, high quality, detailed face, portrait`);
    if (!promptText.trim()) { setStatusMsg('Please enter prompt text'); return; }

    setIsPromptLoading(true);
    setGeneratedImgUrl(null);
    setStatusMsg('AI avatar generating...');

    const encoded = encodeURIComponent(fullPrompt);
    const neg = encodeURIComponent(promptNegative);
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=680&negative=${neg}&seed=${seed}&nologo=true&enhance=true`;

    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imgRef.current = img;
        setGeneratedImgUrl(url);
        setIsPromptLoading(false);
        setStatusMsg('Avatar generated. Click Generate & Speak.');
        setGeneratedPhotoUrl(url);
      };
      img.onerror = () => {
        setIsPromptLoading(false);
        setStatusMsg('Generation failed, please retry');
      };
      img.src = url;
    } catch {
      setIsPromptLoading(false);
      setStatusMsg('Error encountered');
    }
  };

  // Shared Controls Panel
  const ControlsPanel = ({ forPhoto = true }: { forPhoto?: boolean }) => (
    <aside className="w-80 border-l border-[#1A2540] bg-[#0A0F1E] flex flex-col p-4 gap-4 overflow-y-auto flex-shrink-0">
      {/* Expression (photo mode only) */}
      {forPhoto && (
        <div className="bg-[#050A14] rounded-xl border border-[#1A2540] p-3.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-purple-400" />
            Facial Expression (မျက်နှာဟန်)
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {EXPRESSIONS.map(e => {
              const IconComp = e.icon;
              const isSelected = expression === e.id;
              return (
                <button 
                  key={e.id} 
                  onClick={() => setExpression(e.id)}
                  title={e.label}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-purple-600/25 border border-purple-500/70 text-purple-300'
                      : 'bg-[#0A0F1E] border border-[#1A2540] text-slate-400 hover:border-purple-500/40'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span className="text-[9px] font-medium">{e.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Voice */}
      <div className="bg-[#050A14] rounded-xl border border-[#1A2540] p-3.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-purple-400" />
          Neural Voice (Zero-Cost TTS)
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {VOICES.map(v => (
            <button 
              key={v.id} 
              onClick={() => setSelectedVoice(v.id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] transition-all text-left ${
                selectedVoice === v.id
                  ? 'bg-purple-600/20 border border-purple-500/70 text-purple-300'
                  : 'bg-[#0A0F1E] border border-[#1A2540] text-slate-400 hover:border-purple-500/30'
              }`}
            >
              <span className="w-6 h-6 rounded-md bg-[#050A14] border border-[#1A2540] flex items-center justify-center font-bold text-[9px] text-slate-300">
                {v.countryCode}
              </span>
              <div className="min-w-0">
                <div className="font-semibold leading-none truncate text-slate-200">{v.label}</div>
                <div className="text-[9px] text-slate-500 mt-0.5 truncate">{v.lang}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rate / Pitch */}
      <div className="bg-[#050A14] rounded-xl border border-[#1A2540] p-3.5 space-y-3">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Acoustic Voice Tuning
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-medium">
            <span>Speaking Rate</span>
            <span className="text-purple-300 font-mono font-semibold">{rate.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min={0.5} 
            max={2.0} 
            step={0.1} 
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full h-1.5 accent-purple-500 cursor-pointer" 
          />
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-medium">
            <span>Pitch Scale</span>
            <span className="text-cyan-400 font-mono font-semibold">{pitch.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min={0.5} 
            max={2.0} 
            step={0.1} 
            value={pitch}
            onChange={e => setPitch(Number(e.target.value))}
            className="w-full h-1.5 accent-cyan-500 cursor-pointer" 
          />
        </div>
      </div>

      {/* Script */}
      <div className="bg-[#050A14] rounded-xl border border-[#1A2540] p-3.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          Dialogue Script (ပြောဆိုစာ)
        </div>
        <textarea
          value={forPhoto ? text : promptText2}
          onChange={e => forPhoto ? setText(e.target.value) : setPromptText2(e.target.value)}
          rows={4}
          placeholder="Type dialogue for the avatar to speak..."
          className="w-full bg-[#0A0F1E] border border-[#1A2540] focus:border-purple-500/70 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none transition-colors leading-relaxed"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={() => {
            if (isSpeaking || promptSpeaking) handleStop();
            else handleGenerate(null, forPhoto);
          }}
          disabled={isGenerating || isPromptLoading || (!photoUrl && forPhoto) || (!generatedImgUrl && !forPhoto && tab === 'prompt')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 ${
            isSpeaking || promptSpeaking
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : isGenerating
              ? 'bg-purple-900/40 text-purple-300 cursor-not-allowed border border-purple-500/30'
              : !photoUrl && forPhoto
              ? 'bg-[#121B30] text-slate-600 cursor-not-allowed border border-[#1A2540]'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
          }`}
        >
          {isSpeaking || promptSpeaking ? (
            <>
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Speaking</span>
            </>
          ) : isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate & Speak</span>
            </>
          )}
        </button>

        {audioUrl && (
          <button 
            onClick={() => { const a = document.createElement('a'); a.href = audioUrl; a.download = `auracraft_${Date.now()}.mp3`; a.click(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#050A14] border border-[#1A2540] text-slate-300 hover:text-white hover:border-purple-500/50 text-xs transition-all font-medium"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Download Speech (.mp3)</span>
          </button>
        )}
      </div>

      {/* Feature Capability Highlights */}
      <div className="bg-[#050A14] rounded-xl border border-[#1A2540] p-3 text-xs text-slate-400 space-y-1.5">
        <div className="font-semibold text-purple-300 flex items-center gap-1.5 text-[11px]">
          <Heart className="w-3.5 h-3.5 text-purple-400" />
          Engine Capabilities
        </div>
        <ul className="space-y-1 text-[10px]">
          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Real-time jaw warp lip-sync</li>
          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Web Audio FFT frequency sync</li>
          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Procedural blinking & natural tilt drift</li>
          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Multilingual neural speech synthesis</li>
        </ul>
      </div>
    </aside>
  );

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#050A14]">
      {/* Sub-tab navigation */}
      <div className="flex-shrink-0 h-12 bg-[#0A0F1E] border-b border-[#1A2540] flex items-center px-4 gap-2">
        <button
          onClick={() => setTab('photo')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === 'photo'
              ? 'bg-purple-600/20 border border-purple-500/60 text-purple-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Upload Photo Avatar</span>
        </button>

        <button
          onClick={() => setTab('prompt')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === 'prompt'
              ? 'bg-purple-600/20 border border-purple-500/60 text-purple-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>AI Generative Avatar</span>
        </button>

        {statusMsg && (
          <div className="ml-auto text-[11px] text-slate-300 bg-[#050A14] border border-[#1A2540] px-3 py-1 rounded-lg">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Tab: Photo */}
      {tab === 'photo' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Stage */}
          <div className="flex-1 flex items-center justify-center bg-[#050A14] relative p-4">
            {photoUrl ? (
              <div className="flex flex-col items-center gap-3">
                {isSpeaking && (
                  <div className="absolute rounded-2xl animate-ping border-2 border-purple-400/25 w-[320px] h-[420px] pointer-events-none" />
                )}

                <div 
                  className={`relative rounded-2xl overflow-hidden border-2 shadow-2xl transition-all ${
                    isSpeaking
                      ? 'border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.35)]'
                      : 'border-[#1A2540]'
                  }`} 
                  style={{ width: 300, height: 400 }}
                >
                  <canvas ref={canvasRef} width={300} height={400} className="block w-full h-full" />

                  {isSpeaking && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-purple-600/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      SPEAKING
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-2.5 bg-[#0A0F1E]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-slate-300 border border-[#1A2540] flex items-center gap-1.5">
                    <span className="capitalize text-purple-300 font-semibold">{expression}</span>
                    <span className="text-slate-500">•</span>
                    <span>Jaw-Warp Lip-Sync</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A0F1E] border border-[#1A2540] text-slate-300 hover:text-white hover:border-purple-500/50 text-xs transition-all font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Change Photo</span>
                  </button>

                  <button 
                    onClick={() => {
                      setPhotoBlob(null);
                      setGeneratedPhotoUrl(null);
                      setStatusMsg('Photo cleared');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 text-xs transition-all font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Upload Zone */
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-4 cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  isDragging
                    ? 'border-purple-500 bg-purple-900/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                    : 'border-[#1A2540] bg-[#0A0F1E] hover:border-purple-500/50 hover:bg-[#0E1528]'
                }`}
                style={{ width: 320, height: 420 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/15 flex items-center justify-center border border-purple-500/30 text-purple-400">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-bold text-slate-100">Upload Portrait Photo</div>
                  <div className="text-xs text-slate-400">Drag & drop your face photo here</div>
                  <div className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP (Clear Face Frontal)</div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-[#1A2540]">
                  <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-purple-400" /> Frontal</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-cyan-400" /> High-Res</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-emerald-400" /> Portrait</span>
                </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <ControlsPanel forPhoto={true} />
        </div>
      )}

      {/* Tab: Prompt */}
      {tab === 'prompt' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Stage */}
          <div className="flex-1 flex items-center justify-center bg-[#050A14] relative p-4">
            {generatedImgUrl ? (
              <div className="flex flex-col items-center gap-3">
                {promptSpeaking && (
                  <div className="absolute rounded-2xl animate-ping border-2 border-purple-400/25 w-[320px] h-[420px] pointer-events-none" />
                )}
                <div 
                  className={`relative rounded-2xl overflow-hidden border-2 shadow-2xl transition-all ${
                    promptSpeaking
                      ? 'border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.35)]'
                      : 'border-[#1A2540]'
                  }`} 
                  style={{ width: 300, height: 400 }}
                >
                  <img 
                    src={generatedImgUrl} 
                    alt="AI Avatar"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center top' }} 
                  />

                  <canvas
                    ref={promptSpeaking ? canvasRef : undefined}
                    className={`absolute inset-0 w-full h-full ${promptSpeaking ? 'block' : 'hidden'}`}
                    width={300} 
                    height={400}
                  />

                  {promptSpeaking && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-purple-600/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      SPEAKING
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-2.5 bg-[#0A0F1E]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-slate-300 border border-[#1A2540] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI Generated • {PROMPT_STYLES.find(s => s.id === promptStyle)?.label}</span>
                  </div>
                </div>

                <button
                  onClick={() => { setGeneratedImgUrl(null); setIsPromptLoading(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A0F1E] border border-[#1A2540] text-slate-300 hover:text-white hover:border-purple-500/50 text-xs transition-all font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Avatar</span>
                </button>
              </div>
            ) : (
              /* Prompt Input Area */
              <div className="flex flex-col gap-4 w-full max-w-md bg-[#0A0F1E] border border-[#1A2540] p-6 rounded-2xl shadow-sm">
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center border border-purple-500/30 mx-auto text-purple-400">
                    <Wand2 className="w-7 h-7" />
                  </div>
                  <div className="text-base font-bold text-white">Generative AI Avatar Studio</div>
                  <div className="text-xs text-slate-400">Describe your character persona and generate a talking face</div>
                </div>

                {/* Style selector */}
                <div>
                  <div className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">Style Archetype</div>
                  <div className="grid grid-cols-3 gap-2">
                    {PROMPT_STYLES.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => setPromptStyle(s.id)}
                        className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                          promptStyle === s.id
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-[#050A14] border border-[#1A2540] text-slate-400 hover:border-purple-500/40'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt text */}
                <div>
                  <div className="text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Prompt Description</div>
                  <textarea
                    value={promptText}
                    maxLength={1000}
                    onChange={e => setPromptText(limitPollinationsPrompt(e.target.value))}
                    rows={3}
                    placeholder={`e.g. ${PROMPT_STYLES.find(s => s.id === promptStyle)?.example}`}
                    className="w-full bg-[#050A14] border border-[#1A2540] focus:border-purple-500/70 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none transition-colors"
                  />
                </div>

                {/* Negative prompt */}
                <div>
                  <div className="text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Negative Constraints</div>
                  <input
                    value={promptNegative}
                    onChange={e => setPromptNegative(e.target.value)}
                    className="w-full bg-[#050A14] border border-[#1A2540] focus:border-purple-500/70 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={handlePromptGenerate}
                  disabled={isPromptLoading || !promptText.trim()}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 ${
                    isPromptLoading
                      ? 'bg-purple-900/40 text-purple-300 cursor-not-allowed border border-purple-500/30'
                      : !promptText.trim()
                      ? 'bg-[#121B30] text-slate-600 cursor-not-allowed border border-[#1A2540]'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                  }`}
                >
                  {isPromptLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Avatar...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Persona Avatar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <ControlsPanel forPhoto={false} />
        </div>
      )}
    </div>
  );
};
