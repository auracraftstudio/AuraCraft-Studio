# 🔮 AuraCraft Studio
> **Real-Time 3D Virtual Persona, Edge-TTS Neural Voice & Autonomous Live Streamer Engine**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_WebGL-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![VRM](https://img.shields.io/badge/VRM-3D_Avatars-00A499?style=flat-square)](https://vrm.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers_Proxy-F38020?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.0-Conversational_Persona-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Telegram](https://img.shields.io/badge/Telegram_Bot-Topic_#215-26A5E4?style=flat-square&logo=telegram)](https://t.me/)

---

## 🌟 Overview

**AuraCraft Studio** is a 100% free, zero-cost real-time 3D VRM virtual persona, neural voice synthesis, and autonomous live-streaming suite.

It powers interactive virtual avatars that listen, think, talk, and express emotions in real-time inside web browsers, OBS Studio browser sources, or autonomous live-stream broadcasts (YouTube Live, Twitch, TikTok).

---

## 🚀 Key Features

* **🎭 3D VRM Avatar Engine**: Full 3D humanoid avatar rendering via Three.js and `@pixiv/three-vrm` with eye tracking, breathing, and natural blinking.
* **👄 Real-Time Lip Sync**: Viseme-accurate phonetic mouth shape morphing synchronized with audio playback.
* **🎙️ Neural Edge-TTS Voice**: Zero-cost, high-fidelity conversational voice synthesis supporting 50+ languages with emotional modulation.
* **🧠 Gemini 2.0 Conversational Core**: Low-latency persona intelligence with customizable character traits, memory, and chat context.
* **🎥 OBS Studio Ready**: Transparent background browser source overlays for seamless live streaming.
* **🤖 Telegram Companion Bot**: Full control over persona moods, speech tests, and live notifications via `@AuraCraftNexusBot` in Topic `#215`.

---

## 🏗️ System Architecture

```
       Chat / Audience Input / Telegram Bot (Topic #215)
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                   Conversational Brain                        │
│   • Gemini 2.0 Flash Agent • Persona Prompt Guardrails        │
│   • Emotion & Gesture Intent Detection                        │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│               Audio & Lip-Sync Synthesizer                    │
│   • Edge-TTS Neural Audio Generation                          │
│   • Phonetic Viseme Analysis & Timing Generator               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│               3D WebGL / VRM Rendering Canvas                │
│   • Three.js Scene • Three-VRM Blendshapes & Skeletal Rig    │
│   • Dynamic Lighting, Idle Animation & OBS Transparent Alpha  │
└───────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Run Studio Web App
pnpm dev

# 3. Add to OBS Studio
# Add 'Browser Source' -> Set URL to http://localhost:3000/stage -> Enable transparent background
```

---

## 📜 License

MIT Licensed Open Virtual Studio. All Rights Reserved.
