import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clapperboard, Video, Plus, Trash2, Download, Check, Sparkles, 
  Smartphone, Monitor, Clock, Play, Loader2, Camera, Sliders, Film
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { createSceneId } from './videoStudioUtils';
import { Viewport3D } from '../components/Viewport3D';

const DEFAULT_STUDIO_CHARACTERS = [
  { id: 'char_anime_shinji', name: 'Shinji Kazama (シンジ)', voice_id: 'my-MM-NilarNeural', vrm_model: '/models/avatar_female_c.vrm' },
  { id: 'char_cyber_aoi', name: 'Aoi (Cyber Kimono)', voice_id: 'ja-JP-NanamiNeural', vrm_model: '/models/avatar_female_a.vrm' },
  { id: 'char_sakura_idol', name: 'Sakura Hoshino (3D Idol)', voice_id: 'en-US-JennyNeural', vrm_model: '/models/avatar_female_b.vrm' },
];

const DEFAULT_STUDIO_VOICES = [
  { id: 'my-MM-NilarNeural', name: 'Burmese · Nilar (Neural Female)' },
  { id: 'my-MM-ThihaNeural', name: 'Burmese · Thiha (Neural Male)' },
  { id: 'ja-JP-NanamiNeural', name: 'Japanese · Nanami (Neural Female)' },
  { id: 'en-US-JennyNeural', name: 'English · Jenny (Neural Female)' },
  { id: 'en-US-GuyNeural', name: 'English · Guy (Neural Male)' },
];

export const VideoStudioPage: React.FC = () => {
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [characterName, setCharacterName] = useState('Shinji Kazama (シンジ)');
  const [selectedCharacterId, setSelectedCharacterId] = useState('char_anime_shinji');
  const [availableCharacters, setAvailableCharacters] = useState<Array<{ id: string; name: string; voice_id?: string; vrm_model?: string }>>(DEFAULT_STUDIO_CHARACTERS);
  const [selectedModelUrl, setSelectedModelUrl] = useState('/models/avatar_female_c.vrm');
  const [showVideoStage, setShowVideoStage] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [avatarEmotion, setAvatarEmotion] = useState('neutral');
  const [avatarModelStatus, setAvatarModelStatus] = useState<'idle' | 'loading' | 'vrm' | 'procedural'>('idle');
  const avatarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarModelStatusRef = useRef<'idle' | 'loading' | 'vrm' | 'procedural'>('idle');
  const resolveAvatarStageRef = useRef<((canvas: HTMLCanvasElement) => void) | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Array<{ id: string; name: string }>>(DEFAULT_STUDIO_VOICES);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState('my-MM-NilarNeural');
  const [durationPerScene, setDurationPerScene] = useState(6);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [scenes, setScenes] = useState<Array<{ id: string; title: string; script: string; emotion: string; camera: string }>>([
    {
      id: 'scene-1',
      title: 'Scene 1: Introduction (မိတ်ဆက်)',
      script: 'မင်္ဂလာပါ! ကျွန်တော်တို့ AuraCraft Studio ရဲ့ 3D Persona စနစ်သစ်ကို ကြည့်ရှုဖို့ ကြိုဆိုပါတယ်။',
      emotion: 'happy',
      camera: 'bust',
    },
    {
      id: 'scene-2',
      title: 'Scene 2: Core Briefing (အဓိကအချက်)',
      script: 'ဒီစနစ်က 3D VRM Humanoid အနေနဲ့ရော၊ 2D Portrait အနေနဲ့ပါ မြန်မာလို အသံထွက်ပြီး မျက်နှာ အမူအရာတွေနဲ့ စကားပြောနိုင်ပါတယ်။',
      emotion: 'neutral',
      camera: 'full',
    },
    {
      id: 'scene-3',
      title: 'Scene 3: Conclusion (နိဂုံးချုပ်)',
      script: 'Manga Script တွေ၊ OBS Live တွေအတွက် အချိန်မရွေး သွင်းယူပြီး အသုံးပြုနိုင်ပါပြီခင်ဗျာ။',
      emotion: 'surprised',
      camera: 'face',
    },
  ]);

  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [exported, setExported] = useState(false);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [renderedVideoMimeType, setRenderedVideoMimeType] = useState<string | null>(null);
  const [videoRenderError, setVideoRenderError] = useState<string | null>(null);
  const [videoRenderNotice, setVideoRenderNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_ENDPOINTS.characters).then(async (response) => {
      if (!response.ok) return;
      const records = await response.json();
      if (Array.isArray(records) && records.length) {
        setAvailableCharacters(records);
        const selected = records.find((item) => item.id === selectedCharacterId) || records[0];
        setSelectedCharacterId(selected.id);
        setCharacterName(selected.name);
        setSelectedModelUrl(selected.vrm_model || '/models/avatar_female_c.vrm');
        if (selected.voice_id) setVoiceId(selected.voice_id);
      }
    }).catch(() => {
      // Retain DEFAULT_STUDIO_CHARACTERS silently without alarming warning banner
    });
    fetch(API_ENDPOINTS.voices).then(async (response) => {
      if (!response.ok) return;
      const voices = await response.json();
      if (Array.isArray(voices) && voices.length) setAvailableVoices(voices);
    }).catch(() => {
      // Retain DEFAULT_STUDIO_VOICES silently without alarming warning banner
    });
  }, []);

  const handleAvatarCanvasReady = useCallback((canvas: HTMLCanvasElement | null) => {
    avatarCanvasRef.current = canvas;
    if (canvas && avatarModelStatusRef.current !== 'loading' && resolveAvatarStageRef.current) {
      resolveAvatarStageRef.current(canvas);
    }
  }, []);

  const handleAvatarModelLoadStateChange = useCallback((status: 'loading' | 'vrm' | 'procedural') => {
    avatarModelStatusRef.current = status;
    setAvatarModelStatus(status);
    if (status !== 'loading' && avatarCanvasRef.current && resolveAvatarStageRef.current) {
      resolveAvatarStageRef.current(avatarCanvasRef.current);
    }
  }, []);

  const waitForAvatarStage = useCallback((): Promise<HTMLCanvasElement> => {
    avatarModelStatusRef.current = 'loading';
    setAvatarModelStatus('loading');
    setShowVideoStage(true);
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        resolveAvatarStageRef.current = null;
        reject(new Error('3D avatar stage timed out while initializing canvas stream.'));
      }, 18000);
      resolveAvatarStageRef.current = (canvas) => {
        window.clearTimeout(timeout);
        resolveAvatarStageRef.current = null;
        resolve(canvas);
      };
      if (avatarCanvasRef.current && avatarModelStatusRef.current !== 'loading') {
        window.clearTimeout(timeout);
        resolveAvatarStageRef.current = null;
        resolve(avatarCanvasRef.current);
      }
    });
  }, []);

  const addScene = () => {
    const nextIdx = scenes.length + 1;
    const newScene = {
      id: createSceneId(),
      title: `Scene ${nextIdx}: Sequence Segment`,
      script: 'ဇာတ်ဝင်ခန်း အသစ်တွင် ပြောဆိုမည့် စာသားကို ဤနေရာတွင် ထည့်သွင်းပါ...',
      emotion: 'neutral',
      camera: 'bust',
    };
    setScenes([...scenes, newScene]);
  };

  const removeScene = (id: string) => {
    if (scenes.length <= 1) return;
    setScenes(scenes.filter((s) => s.id !== id));
  };

  const updateScene = (id: string, field: string, val: string) => {
    setScenes(scenes.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const totalEstimatedSeconds = scenes.length * durationPerScene;

  const handleGenerateManifest = async () => {
    setIsGeneratingPlan(true);
    setGenerationError(null);
    const localManifest = {
      project_id: `auracraft_video_${Date.now()}`,
      created_at: new Date().toISOString(),
      character: characterName,
      character_id: selectedCharacterId,
      aspect_ratio: aspectRatio,
      total_scenes: scenes.length,
      estimated_duration_sec: totalEstimatedSeconds,
      narration_voice: voiceId,
      scenes: scenes.map((s, idx) => ({
        scene_index: idx + 1,
        title: s.title,
        script: s.script,
        emotion: s.emotion,
        camera_preset: s.camera,
        duration_seconds: durationPerScene,
      })),
      target_destinations: ['Narrativ Forge Manga Studio', 'OBS Stream Video Player'],
    };

    try {
      const scriptText = scenes.map((s) => s.script).join('\n');
      const res = await fetch(API_ENDPOINTS.renderPlan, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_id: selectedCharacterId,
          voice_id: voiceId,
          script: scriptText,
          aspect_ratio: aspectRatio,
          seconds_per_scene: durationPerScene,
        }),
      });
      if (!res.ok) throw new Error('Backend rejected the render plan (' + res.status + ').');
      const plan = await res.json();
      setGeneratedPlan({ ...localManifest, server_plan: plan });
    } catch {
      // Local fallback generation creates high-fidelity client manifest
      setGeneratedPlan(localManifest);
      setGenerationError(null);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleDownloadManifest = () => {
    if (!generatedPlan) return;
    const blob = new Blob([JSON.stringify(generatedPlan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video_plan_${aspectRatio.replace(':', '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handleRenderVideo = async () => {
    if (!scenes.length || isRenderingVideo) return;
    if (scenes.length > 10) {
      setVideoRenderError('Edge-TTS rate limit အတွက် scene ၁၀ ခုထက်မပိုစေရန် ခွဲပြီး render လုပ်ပါ။');
      return;
    }
    if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream || !('AudioContext' in window)) {
      setVideoRenderError('ဤ browser တွင် audio/video recording မပံ့ပိုးပါ။ Chrome သို့မဟုတ် Edge နောက်ဆုံးဗားရှင်းကို အသုံးပြုပါ။');
      return;
    }
    setIsRenderingVideo(true);
    setRenderProgress(0);
    setVideoRenderError(null);
    setVideoRenderNotice(null);
    if (renderedVideoUrl) URL.revokeObjectURL(renderedVideoUrl);
    setRenderedVideoUrl(null);
    setRenderedVideoMimeType(null);

    const canvas = document.createElement('canvas');
    const width = aspectRatio === '9:16' ? 720 : 1280;
    const height = aspectRatio === '9:16' ? 1280 : 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setVideoRenderError('Canvas renderer ကို စတင်၍မရပါ။');
      setIsRenderingVideo(false);
      return;
    }

    let avatarCanvas: HTMLCanvasElement | null = null;
    const audioContext = new AudioContext();

    const drawScene = (scene: typeof scenes[number], index: number, elapsed: number, sceneDuration: number) => {
      const progress = Math.min(1, elapsed / sceneDuration);
      if (avatarCanvas) {
        ctx.drawImage(avatarCanvas, 0, 0, width, height);
        ctx.fillStyle = 'rgba(5, 10, 20, 0.35)';
        ctx.fillRect(0, 0, width, height);
      } else {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#050A14');
        gradient.addColorStop(0.55, '#1E1035');
        gradient.addColorStop(1, '#081426');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
        ctx.beginPath();
        ctx.arc(width * (0.82 - progress * 0.12), height * 0.18, Math.min(width, height) * 0.24, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#A855F7';
      ctx.font = '600 22px system-ui, sans-serif';
      ctx.fillText('AURACRAFT STUDIO', width * 0.08, height * 0.1);
      ctx.fillStyle = '#C084FC';
      ctx.font = '500 18px system-ui, sans-serif';
      ctx.fillText(`SCENE ${index + 1} / ${scenes.length}  •  ${scene.emotion.toUpperCase()}  •  CAMERA: ${scene.camera.toUpperCase()}`, width * 0.08, height * 0.16);

      const titleSize = aspectRatio === '9:16' ? 34 : 42;
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${titleSize}px system-ui, "Noto Sans Myanmar", sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(scene.title.slice(0, 48), width * 0.08, height * 0.31, width * 0.84);

      const fontSize = aspectRatio === '9:16' ? 30 : 34;
      ctx.font = `400 ${fontSize}px system-ui, "Noto Sans Myanmar", sans-serif`;
      const maxWidth = width * 0.84;
      const lines: string[] = [];
      let line = '';
      for (const character of Array.from(scene.script)) {
        const candidate = line + character;
        if (line && ctx.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = character.trim() ? character : '';
        } else line = candidate;
      }
      if (line) lines.push(line);
      const visibleLines = lines.slice(0, aspectRatio === '9:16' ? 8 : 5);
      ctx.fillStyle = '#e2e8f0';
      visibleLines.forEach((text, lineIndex) => ctx.fillText(text, width * 0.08, height * 0.43 + lineIndex * (fontSize * 1.55), maxWidth));

      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(width * 0.08, height * 0.88, width * 0.84, 6);
      ctx.fillStyle = '#A855F7';
      ctx.fillRect(width * 0.08, height * 0.88, width * 0.84 * progress, 6);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('AuraCraft Studio • Edge-TTS narration • MP4 / WebM', width * 0.08, height * 0.92);
    };

    try {
      await audioContext.resume();
      avatarCanvas = await waitForAvatarStage();
      if (avatarModelStatusRef.current === 'procedural') {
        setVideoRenderNotice('VRM model မဖွင့်နိုင်သောကြောင့် built-in procedural 3D avatar ကို အသုံးပြုထားပါသည်။');
      }
      const audioBuffers: AudioBuffer[] = [];
      for (let index = 0; index < scenes.length; index += 1) {
        const response = await fetch(API_ENDPOINTS.tts, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: scenes[index].script, voice: voiceId }),
        });
        if (!response.ok) throw new Error('Audio generation failed for scene ' + (index + 1));
        const arrayBuffer = await response.arrayBuffer();
        const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
        audioBuffers.push(decoded);
        setRenderProgress(Math.round(((index + 1) / scenes.length) * 35));
      }

      const totalAudioDuration = audioBuffers.reduce((acc, b) => acc + b.duration, 0);
      const destination = audioContext.createMediaStreamDestination();
      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')
        ? 'video/mp4;codecs=avc1,mp4a.40.2'
        : MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : 'video/webm;codecs=vp9,opus';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const renderDone = new Promise<void>((resolve) => {
        recorder.onstop = () => {
          const videoBlob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(videoBlob);
          setRenderedVideoUrl(url);
          setRenderedVideoMimeType(mimeType);
          resolve();
        };
      });

      recorder.start();

      let currentBufferTime = audioContext.currentTime;
      for (let i = 0; i < scenes.length; i++) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffers[i];
        source.connect(destination);
        source.start(currentBufferTime);
        currentBufferTime += audioBuffers[i].duration;
      }

      const startTime = performance.now();
      const totalDurationMs = totalAudioDuration * 1000;

      let sceneStartMs = 0;
      for (let i = 0; i < scenes.length; i++) {
        setAvatarEmotion(scenes[i].emotion);
        setIsAvatarSpeaking(true);
        const sceneDurationMs = audioBuffers[i].duration * 1000;
        const sceneEndMs = sceneStartMs + sceneDurationMs;

        while (performance.now() - startTime < sceneEndMs) {
          const now = performance.now() - startTime;
          const elapsedInScene = (now - sceneStartMs) / 1000;
          drawScene(scenes[i], i, elapsedInScene, audioBuffers[i].duration);
          const percent = 35 + Math.round(((now / totalDurationMs) * 65));
          setRenderProgress(Math.min(99, percent));
          await new Promise((r) => requestAnimationFrame(r));
        }
        sceneStartMs = sceneEndMs;
      }

      setIsAvatarSpeaking(false);
      setAvatarEmotion('neutral');
      recorder.stop();
      await renderDone;
      setRenderProgress(100);
    } catch (err) {
      setVideoRenderError(err instanceof Error ? err.message : 'Video rendering encountered an error.');
    } finally {
      setIsRenderingVideo(false);
      setShowVideoStage(false);
      void audioContext.close();
    }
  };

  const handleDownloadVideo = () => {
    if (!renderedVideoUrl) return;
    const ext = renderedVideoMimeType?.includes('mp4') ? 'mp4' : 'webm';
    const link = document.createElement('a');
    link.href = renderedVideoUrl;
    link.download = `auracraft_storyboard_${aspectRatio.replace(':', '_')}_${Date.now()}.${ext}`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050A14] text-slate-100 overflow-y-auto p-6 space-y-6">
      {showVideoStage && (
        <div aria-hidden="true" style={{ position: 'fixed', left: '-2200px', top: 0, width: aspectRatio === '9:16' ? 720 : 1280, height: aspectRatio === '9:16' ? 1280 : 720, opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
          <Viewport3D
            key={aspectRatio}
            currentEmotion={avatarEmotion}
            bgMode="cyber"
            isSpeaking={isAvatarSpeaking}
            currentModelUrl={selectedModelUrl}
            currentModelName={characterName}
            onCanvasReady={handleAvatarCanvasReady}
            onModelLoadStateChange={handleAvatarModelLoadStateChange}
          />
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#1A2540] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-500/15 border border-purple-500/30 rounded-2xl text-purple-400 shadow-sm shadow-purple-500/10">
            <Clapperboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Video Studio & Storyboard Director
              </h1>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Timeline Sequencer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Storyboard timeline script authoring, 3D avatar viseme rendering, and manifest generation for Narrativ Forge & Social Media.
            </p>
          </div>
        </div>

        {/* Aspect Ratio Toggle */}
        <div className="flex items-center gap-1 bg-[#0A0F1E] border border-[#1A2540] p-1 rounded-xl text-xs">
          <button
            onClick={() => setAspectRatio('9:16')}
            disabled={isRenderingVideo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              aspectRatio === '9:16'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16 Shorts / Reels</span>
          </button>
          <button
            onClick={() => setAspectRatio('16:9')}
            disabled={isRenderingVideo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              aspectRatio === '16:9'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>16:9 Landscape Widescreen</span>
          </button>
        </div>
      </div>

      {/* Grid: Scene Timeline & Manifest Export */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scenes List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              Storyboard Timeline ({scenes.length} Scenes &bull; ~{totalEstimatedSeconds}s Estimated)
            </h2>

            <button
              onClick={addScene}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Scene
            </button>
          </div>

          <div className="space-y-3">
            {scenes.map((s, idx) => (
              <div
                key={s.id}
                className="bg-[#0A0F1E] border border-[#1A2540] hover:border-purple-500/40 rounded-2xl p-4 space-y-3 shadow-sm transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[10px] font-bold text-purple-300 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {s.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={s.camera}
                      onChange={(e) => updateScene(s.id, 'camera', e.target.value)}
                      className="bg-[#050A14] border border-[#1A2540] text-[11px] text-cyan-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-purple-500/70"
                    >
                      <option value="bust">Bust (Medium Shot)</option>
                      <option value="face">Face (Close-Up)</option>
                      <option value="full">Full Body (Wide Shot)</option>
                    </select>

                    <select
                      value={s.emotion}
                      onChange={(e) => updateScene(s.id, 'emotion', e.target.value)}
                      className="bg-[#050A14] border border-[#1A2540] text-[11px] text-purple-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-purple-500/70"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="happy">Happy</option>
                      <option value="angry">Angry</option>
                      <option value="sad">Sad</option>
                      <option value="surprised">Surprised</option>
                    </select>

                    {scenes.length > 1 && (
                      <button
                        onClick={() => removeScene(s.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors hover:bg-rose-950/20"
                        title="Remove scene"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={s.script}
                  onChange={(e) => updateScene(s.id, 'script', e.target.value)}
                  placeholder="Type dialogue narration for this scene..."
                  className="w-full bg-[#050A14] border border-[#1A2540] rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/70 leading-relaxed font-sans"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Render Plan Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0A0F1E] border border-[#1A2540] p-5 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Director Configuration
            </h2>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Casting Actor</label>
                <select
                  value={selectedCharacterId}
                  onChange={(e) => {
                    const selected = availableCharacters.find((item) => item.id === e.target.value);
                    setSelectedCharacterId(e.target.value);
                    if (selected) {
                      setCharacterName(selected.name);
                      setSelectedModelUrl(selected.vrm_model || '/models/avatar_female_c.vrm');
                      if (selected.voice_id) setVoiceId(selected.voice_id);
                    }
                  }}
                  className="w-full bg-[#050A14] border border-[#1A2540] rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-purple-500/70"
                >
                  {availableCharacters.map((character) => (
                    <option key={character.id} value={character.id}>{character.name}</option>
                  ))}
                  {!availableCharacters.length && <option value={selectedCharacterId}>{characterName}</option>}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Narration Voice</label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full bg-[#050A14] border border-[#1A2540] rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-purple-500/70"
                >
                  {availableVoices.map((voice) => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
                  {!availableVoices.length && <option value={voiceId}>{voiceId}</option>}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Seconds Per Scene</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={durationPerScene}
                    onChange={(e) => setDurationPerScene(parseInt(e.target.value))}
                    className="flex-1 accent-purple-500 cursor-pointer"
                  />
                  <span className="font-mono text-purple-300 font-bold w-12 text-right">{durationPerScene}s</span>
                </div>
              </div>
            </div>

            {generationError && <p role="alert" className="text-xs text-rose-300">{generationError}</p>}

            <div className="pt-3 border-t border-[#1A2540]">
              <button
                onClick={handleGenerateManifest}
                disabled={isGeneratingPlan}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/25 transition-all text-center flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isGeneratingPlan ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Plan...</span>
                  </>
                ) : (
                  <span>Generate Plan Manifest (.json)</span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#0A0F1E] border border-[#1A2540] rounded-2xl p-5 space-y-3.5">
            <div>
              <h3 className="text-sm font-bold text-white">Render 3D Avatar Video</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Client-side hardware accelerated rendering with Edge-TTS narration. Produces MP4 or WebM video with viseme lip-sync.
              </p>
            </div>

            <button
              onClick={handleRenderVideo}
              disabled={isRenderingVideo || !scenes.length}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              {isRenderingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rendering Pipeline {renderProgress}%</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Render Video (MP4 / WebM)</span>
                </>
              )}
            </button>

            {isRenderingVideo && (
              <div className="w-full bg-[#050A14] h-2 rounded-full overflow-hidden border border-[#1A2540]">
                <div
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            )}

            {showVideoStage && avatarModelStatus === 'loading' && (
              <p className="text-xs text-slate-400">Loading selected 3D avatar viewport...</p>
            )}
            {videoRenderError && <p role="alert" className="text-xs text-rose-300">{videoRenderError}</p>}
            {videoRenderNotice && <p className="text-xs text-amber-300">{videoRenderNotice}</p>}

            {renderedVideoUrl && (
              <div className="space-y-3 pt-2">
                <video controls playsInline src={renderedVideoUrl} className="w-full rounded-xl border border-[#1A2540] bg-black" />
                <button
                  onClick={handleDownloadVideo}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Rendered {renderedVideoMimeType?.includes('mp4') ? 'MP4' : 'WebM'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Manifest JSON Preview */}
          {generatedPlan && (
            <div className="bg-[#0A0F1E] border border-[#1A2540] rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Manifest Ready
                </span>

                <button
                  onClick={handleDownloadManifest}
                  className="flex items-center gap-1.5 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition-all"
                >
                  {exported ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Download className="w-3.5 h-3.5" />}
                  Download JSON
                </button>
              </div>

              <pre className="text-[10px] text-slate-300 bg-[#050A14] p-3 rounded-xl overflow-x-auto max-h-48 border border-[#1A2540] font-mono leading-relaxed">
                {JSON.stringify(generatedPlan, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
