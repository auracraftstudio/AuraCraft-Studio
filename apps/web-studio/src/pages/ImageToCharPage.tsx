import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, Sparkles, Download, RefreshCw, ChevronRight, Loader2,
  Camera, Wand2, ArrowRight, Image as ImageIcon, Zap, Star, Heart, User,
  Palette, Layers, Globe, PenTool, Check, Volume2, Square
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

// ─── Style Presets ────────────────────────────────────────────────────────────
const CHARACTER_STYLES = [
  {
    id: 'anime',
    label: 'Anime Style',
    desc: 'Cel-shaded anime aesthetic',
    icon: Sparkles,
    color: '#38bdf8',
    params: { quantizeLevels: 7, edgeThreshold: 25, saturation: 1.7, brightness: 1.05, hueShift: 0, edgeWeight: 0.85, smooth: 2 }
  },
  {
    id: 'chibi',
    label: 'Chibi Stylized',
    desc: 'Vibrant cute chibi proportions',
    icon: Star,
    color: '#f472b6',
    params: { quantizeLevels: 5, edgeThreshold: 20, saturation: 1.9, brightness: 1.12, hueShift: 10, edgeWeight: 0.7, smooth: 3 }
  },
  {
    id: 'cartoon',
    label: 'Vector Cartoon',
    desc: 'Bold graphic line art',
    icon: Palette,
    color: '#fb923c',
    params: { quantizeLevels: 9, edgeThreshold: 30, saturation: 1.4, brightness: 1.0, hueShift: 0, edgeWeight: 1.0, smooth: 1 }
  },
  {
    id: 'fantasy',
    label: 'Fantasy Art',
    desc: 'Mystic oil painting shades',
    icon: Layers,
    color: '#a78bfa',
    params: { quantizeLevels: 12, edgeThreshold: 20, saturation: 1.5, brightness: 0.95, hueShift: -15, edgeWeight: 0.6, smooth: 2 }
  },
  {
    id: 'myanmar',
    label: 'Myanmar Cultural',
    desc: 'Traditional gold & warm hues',
    icon: Globe,
    color: '#f59e0b',
    params: { quantizeLevels: 8, edgeThreshold: 25, saturation: 1.3, brightness: 1.08, hueShift: 20, edgeWeight: 0.75, smooth: 2 }
  },
  {
    id: 'sketch',
    label: 'Pencil Sketch',
    desc: 'Hand-drawn graphite shading',
    icon: PenTool,
    color: '#94a3b8',
    params: { quantizeLevels: 3, edgeThreshold: 15, saturation: 0.1, brightness: 1.2, hueShift: 0, edgeWeight: 1.2, smooth: 1 }
  },
];

// ─── Canvas Processing Utilities ──────────────────────────────────────────────
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  h /= 360;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function sobelEdges(src: Uint8ClampedArray, w: number, h: number): Float32Array {
  const edges = new Float32Array(w * h);
  const Kx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const Ky = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          const gray = (src[idx] * 0.299 + src[idx + 1] * 0.587 + src[idx + 2] * 0.114);
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += gray * Kx[ki];
          gy += gray * Ky[ki];
        }
      }
      edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return edges;
}

function convertToCharacter(
  srcCanvas: HTMLCanvasElement,
  dstCanvas: HTMLCanvasElement,
  styleId: string
) {
  const style = CHARACTER_STYLES.find(s => s.id === styleId)!;
  const p = style.params;
  const W = srcCanvas.width;
  const H = srcCanvas.height;

  const srcCtx = srcCanvas.getContext('2d')!;
  const dstCtx = dstCanvas.getContext('2d')!;
  dstCanvas.width = W;
  dstCanvas.height = H;

  const srcData = srcCtx.getImageData(0, 0, W, H);
  const src = srcData.data;

  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = W;
  blurCanvas.height = H;
  const blurCtx = blurCanvas.getContext('2d')!;
  blurCtx.filter = `blur(${p.smooth}px)`;
  blurCtx.drawImage(srcCanvas, 0, 0);
  const smoothedData = blurCtx.getImageData(0, 0, W, H);
  const smoothed = smoothedData.data;

  const quantized = new Uint8ClampedArray(smoothed.length);
  const factor = 255 / (p.quantizeLevels - 1);

  for (let i = 0; i < smoothed.length; i += 4) {
    let r = smoothed[i], g = smoothed[i + 1], b = smoothed[i + 2];

    r = Math.round(r / factor) * factor;
    g = Math.round(g / factor) * factor;
    b = Math.round(b / factor) * factor;

    let [h, s, l] = rgbToHsl(r, g, b);
    h = (h + p.hueShift + 360) % 360;
    s = Math.min(s * p.saturation, 1);
    l = Math.min(l * p.brightness, 1);
    if (styleId === 'sketch') l = 1 - (1 - l) * 0.4;
    [r, g, b] = hslToRgb(h, s, l);

    quantized[i] = r;
    quantized[i + 1] = g;
    quantized[i + 2] = b;
    quantized[i + 3] = smoothed[i + 3];
  }

  const edges = sobelEdges(src, W, H);
  const out = dstCtx.createImageData(W, H);
  const dst = out.data;

  for (let i = 0; i < quantized.length; i += 4) {
    const pixelIdx = i / 4;
    const edgeVal = edges[pixelIdx];

    if (edgeVal > p.edgeThreshold) {
      const edgeDarkness = Math.min((edgeVal - p.edgeThreshold) / 80, 1) * p.edgeWeight;
      if (styleId === 'sketch') {
        const gray = Math.round((1 - edgeDarkness) * 220);
        dst[i] = gray; dst[i + 1] = gray; dst[i + 2] = gray;
      } else {
        dst[i]     = Math.round(quantized[i] * (1 - edgeDarkness * 0.85));
        dst[i + 1] = Math.round(quantized[i + 1] * (1 - edgeDarkness * 0.85));
        dst[i + 2] = Math.round(quantized[i + 2] * (1 - edgeDarkness * 0.85));
      }
    } else {
      dst[i]     = quantized[i];
      dst[i + 1] = quantized[i + 1];
      dst[i + 2] = quantized[i + 2];
    }
    dst[i + 3] = quantized[i + 3];
  }

  dstCtx.putImageData(out, 0, 0);
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface ImageToCharPageProps {
  onCastTo3DStage?: (modelUrl: string, modelName: string, actorName?: string, voice?: string) => void;
  onSetExactPhotoAsStageAvatar?: (url: string, name: string) => void;
}

export const ImageToCharPage: React.FC<ImageToCharPageProps> = ({
  onCastTo3DStage,
  onSetExactPhotoAsStageAvatar,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('anime');
  const [originalUrl, setOriginalUrl]     = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl]   = useState<string | null>(null);
  const [isConverting, setIsConverting]   = useState(false);
  const [isDragging, setIsDragging]       = useState(false);
  const [showBefore, setShowBefore]       = useState(false);

  // Audio / TTS preview
  const [ttsText, setTtsText]             = useState('မင်္ဂလာပါ! ကျွန်တော်က Anime Character အဖြစ် ပြောင်းလဲလိုက်ပါပြီ။');
  const [ttsVoice, setTtsVoice]           = useState('my-MM-NilarNeural');
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [isGenTTS, setIsGenTTS]           = useState(false);
  const [audioUrl, setAudioUrl]           = useState<string | null>(null);

  // Canvas refs
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const srcCanvasRef  = useRef<HTMLCanvasElement>(null);
  const dstCanvasRef  = useRef<HTMLCanvasElement>(null);
  const imgRef        = useRef<HTMLImageElement | null>(null);
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const analyserRef   = useRef<AnalyserNode | null>(null);
  const audioCtxRef   = useRef<AudioContext | null>(null);

  const loadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setConvertedUrl(null);
    const img = new Image();
    img.onload = () => { imgRef.current = img; };
    img.src = url;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) loadFile(f);
  };

  const handleConvert = useCallback(async () => {
    if (!originalUrl) return;
    setIsConverting(true);

    try {
      if (!imgRef.current && originalUrl) {
        const img = new window.Image();
        await new Promise((res, rej) => {
          img.onload = () => { imgRef.current = img; res(null); };
          img.onerror = rej;
          img.src = originalUrl;
        });
      }

      if (!imgRef.current) return;
      await new Promise(r => setTimeout(r, 60));

      const img = imgRef.current;
      const targetW = 400;
      const targetH = Math.round(img.height * (targetW / img.width));

      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = targetW;
      srcCanvas.height = targetH;
      const srcCtx = srcCanvas.getContext('2d')!;
      srcCtx.drawImage(img, 0, 0, targetW, targetH);

      const dstCanvas = document.createElement('canvas');
      dstCanvas.width = targetW;
      dstCanvas.height = targetH;

      convertToCharacter(srcCanvas, dstCanvas, selectedStyle);

      const dataUrl = dstCanvas.toDataURL('image/png');
      setConvertedUrl(dataUrl);

      if (dstCanvasRef.current) {
        dstCanvasRef.current.width = targetW;
        dstCanvasRef.current.height = targetH;
        const ctx = dstCanvasRef.current.getContext('2d');
        ctx?.drawImage(dstCanvas, 0, 0);
      }
    } catch (err) {
      console.error('Conversion failed:', err);
    } finally {
      setIsConverting(false);
    }
  }, [selectedStyle, originalUrl]);

  useEffect(() => {
    if (!convertedUrl || !dstCanvasRef.current) return;
    const canvas = dstCanvasRef.current;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
    };
    img.src = convertedUrl;
  }, [convertedUrl]);

  const handleDownload = () => {
    if (!convertedUrl) return;
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = `auracraft_character_${selectedStyle}_${Date.now()}.png`;
    a.click();
  };

  const handleSpeak = async () => {
    if (!ttsText.trim() || !convertedUrl) return;
    setIsGenTTS(true);
    try {
      const res = await fetch(API_ENDPOINTS.tts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsText, voice: ttsVoice, rate: '+0%', pitch: '+0Hz' }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const actx = audioCtxRef.current;
      if (actx.state === 'suspended') await actx.resume();
      const analyser = actx.createAnalyser(); analyser.fftSize = 64;
      analyserRef.current = analyser; analyser.connect(actx.destination);
      const audio = new Audio(url); audioRef.current = audio;
      const src = actx.createMediaElementSource(audio); src.connect(analyser);
      setIsSpeaking(true); audio.play();
      audio.onended = () => { setIsSpeaking(false); analyserRef.current = null; setIsGenTTS(false); };
    } catch {
      const utt = new SpeechSynthesisUtterance(ttsText);
      setIsSpeaking(true);
      utt.onend = () => { setIsSpeaking(false); setIsGenTTS(false); };
      speechSynthesis.speak(utt);
    }
  };

  const handleStopSpeak = () => {
    audioRef.current?.pause(); speechSynthesis.cancel();
    analyserRef.current = null; setIsSpeaking(false); setIsGenTTS(false);
  };

  const curStyle = CHARACTER_STYLES.find(s => s.id === selectedStyle)!;
  const StyleIcon = curStyle.icon;

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#050A14]">
      {/* LEFT: Preview Stage */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-[#050A14] p-6 relative">
        {/* Header */}
        <div className="absolute top-4 left-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background: `${curStyle.color}25`, border: `1px solid ${curStyle.color}50` }}>
            <Wand2 className="w-4 h-4" style={{ color: curStyle.color }} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">Image to Stylized Persona Transformer</div>
            <div className="text-[10px] text-slate-400">Convert portrait photos into stylized anime and digital characters</div>
          </div>
        </div>

        {originalUrl ? (
          <div className="flex flex-col items-center gap-4 mt-6">
            {/* Before / After comparison */}
            <div className="flex items-center gap-4">
              {/* Original */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Source Portrait</div>
                <div 
                  className={`rounded-2xl overflow-hidden border shadow-lg transition-all ${showBefore ? 'border-purple-400' : 'border-[#1A2540]'}`}
                  style={{ width: 200, height: 260 }}
                >
                  <img src={originalUrl} alt="original" className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-2">
                {isConverting ? (
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                ) : (
                  <ArrowRight className="w-6 h-6 text-slate-500" />
                )}
                <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <StyleIcon className="w-3 h-3" />
                  <span>{curStyle.label}</span>
                </div>
              </div>

              {/* Converted */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: curStyle.color }}>Stylized Result</div>
                <div 
                  className={`relative rounded-2xl overflow-hidden border shadow-lg transition-all ${
                    isSpeaking
                      ? 'shadow-[0_0_30px_rgba(168,85,247,0.4)] border-purple-500'
                      : convertedUrl ? 'border-purple-500/60' : 'border-[#1A2540] border-dashed'
                  }`} 
                  style={{ width: 200, height: 260, background: '#0A0F1E' }}
                >
                  <canvas
                    ref={dstCanvasRef}
                    className={`w-full h-full object-cover ${convertedUrl ? 'block' : 'hidden'}`}
                  />

                  {convertedUrl && isSpeaking && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-purple-600/90 px-2 py-0.5 rounded-full text-white text-[10px] font-bold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>SPEAKING</span>
                    </div>
                  )}

                  {!convertedUrl && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <Sparkles className="w-7 h-7 text-slate-600" />
                      <div className="text-[11px] text-slate-500">Ready to Convert</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <canvas ref={srcCanvasRef} className="hidden" />

            {/* Actions for original image */}
            <div className="flex flex-col items-center gap-2">
              {onSetExactPhotoAsStageAvatar && (
                <button
                  onClick={() => {
                    onSetExactPhotoAsStageAvatar(originalUrl, 'Uploaded Character Portrait');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>Use Exact Photo on Studio Stage</span>
                </button>
              )}

              {!convertedUrl && (
                <button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 ${
                    isConverting
                      ? 'bg-purple-900/40 text-purple-300 cursor-not-allowed border border-purple-500/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                  }`}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Converting Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Transform to {curStyle.label}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Post-convert actions */}
            {convertedUrl && (
              <div className="flex flex-col items-center gap-3">
                {onCastTo3DStage && (
                  <button
                    onClick={() => {
                      onCastTo3DStage(
                        selectedStyle === 'anime' || selectedStyle === 'chibi'
                          ? '/models/avatar_female_a.vrm'
                          : '/models/avatar_female_c.vrm',
                        selectedStyle === 'anime' ? 'Sakura (Anime 3D Idol)' : 'Nanami (Anime 3D Heroine)',
                        'Anime 3D Character',
                        'ja-JP-NanamiNeural'
                      );
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>Cast Persona to 3D Stage</span>
                  </button>
                )}

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A0F1E] border border-[#1A2540] text-slate-300 hover:text-white hover:border-purple-500/50 text-xs transition-all font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download PNG</span>
                  </button>

                  <button 
                    onClick={() => { setConvertedUrl(null); handleConvert(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A0F1E] border border-[#1A2540] text-slate-300 hover:text-white hover:border-purple-500/50 text-xs transition-all font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-process</span>
                  </button>

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A0F1E] border border-[#1A2540] text-slate-300 hover:text-white hover:border-purple-500/50 text-xs transition-all font-medium"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>New Photo</span>
                  </button>
                </div>
              </div>
            )}
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
                ? 'border-purple-500 bg-purple-900/10'
                : 'border-[#1A2540] bg-[#0A0F1E] hover:border-purple-500/50 hover:bg-[#0E1528]'
            }`}
            style={{ width: 440, height: 380 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-500/15 flex items-center justify-center border border-purple-500/30 text-purple-400">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <div className="text-base font-bold text-white">Upload Portrait for Transformation</div>
              <div className="text-xs text-slate-400">Drag & drop or click to upload your face photo</div>
              <div className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP (Instant Client-Side Processing)</div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-[#1A2540]">
              {CHARACTER_STYLES.slice(0, 4).map(s => {
                const IconC = s.icon;
                return (
                  <span key={s.id} className="flex items-center gap-1">
                    <IconC className="w-3 h-3 text-purple-400" />
                    <span>{s.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* RIGHT: Controls */}
      <aside className="w-80 border-l border-[#1A2540] bg-[#0A0F1E] flex flex-col p-4 gap-4 overflow-y-auto flex-shrink-0">
        {/* Style Selector */}
        <div className="bg-[#050A14] rounded-xl border border-[#1A2540] p-3.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Style Filter Preset
          </div>
          <div className="space-y-1.5">
            {CHARACTER_STYLES.map(style => {
              const IconC = style.icon;
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => { setSelectedStyle(style.id); setConvertedUrl(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/15'
                      : 'border-[#1A2540] bg-[#0A0F1E] hover:border-purple-500/40'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-[#050A14] border border-[#1A2540] text-purple-300">
                    <IconC className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-100 truncate">{style.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{style.desc}</div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Speak Section */}
        {convertedUrl && (
          <div className="bg-[#050A14] rounded-xl border border-[#1A2540] p-3.5 space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Voice Preview
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'my-MM-NilarNeural', label: 'Nilar', code: 'MM' },
                { id: 'my-MM-ThihaNeural', label: 'Thiha', code: 'MM' },
                { id: 'ja-JP-NanamiNeural', label: 'Nanami', code: 'JP' },
                { id: 'en-US-JennyNeural', label: 'Jenny', code: 'US' },
              ].map(v => (
                <button 
                  key={v.id} 
                  onClick={() => setTtsVoice(v.id)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] transition-all border flex items-center gap-1.5 ${
                    ttsVoice === v.id
                      ? 'bg-purple-600/25 border-purple-500/70 text-purple-300'
                      : 'bg-[#0A0F1E] border-[#1A2540] text-slate-400 hover:border-purple-500/30'
                  }`}
                >
                  <span className="w-4 h-4 rounded bg-[#050A14] flex items-center justify-center font-bold text-[8px] text-slate-400">
                    {v.code}
                  </span>
                  <span className="truncate">{v.label}</span>
                </button>
              ))}
            </div>

            <textarea 
              value={ttsText} 
              onChange={e => setTtsText(e.target.value)} 
              rows={3}
              placeholder="Type script for character..."
              className="w-full bg-[#0A0F1E] border border-[#1A2540] focus:border-purple-500/70 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none transition-colors leading-relaxed"
            />

            <button
              onClick={isSpeaking ? handleStopSpeak : handleSpeak}
              disabled={isGenTTS && !isSpeaking}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Speaking</span>
                </>
              ) : isGenTTS ? (
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
          </div>
        )}

        {/* Feature Highlights */}
        <div className="bg-[#050A14] rounded-xl border border-[#1A2540] p-3.5 text-xs text-slate-400 space-y-1.5">
          <div className="font-semibold text-purple-300 flex items-center gap-1.5 text-[11px]">
            <Heart className="w-3.5 h-3.5 text-purple-400" />
            Transformer Specifications
          </div>
          <ul className="space-y-1 text-[10px]">
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Hardware accelerated Canvas 2D</li>
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Sobel gradient convolution filter</li>
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Adaptive color palette quantization</li>
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Export directly to 3D Stage</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};
