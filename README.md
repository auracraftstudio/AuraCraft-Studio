# AuraCraft Studio

**A browser-based 3D avatar, voice, and video creation studio.**

AuraCraft Studio brings real-time 3D avatar experiences, multilingual voice narration, and creator-focused production tools into one web application.

<p align="center">
  <a href="https://auracraft-studio.vercel.app"><strong>Live Application</strong></a>
  ·
  <a href="https://github.com/auracraftstudio/AuraCraft-Studio/issues">Report an Issue</a>
</p>

## Project at a glance

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, TypeScript |
| 3D rendering | Three.js, `@pixiv/three-vrm` |
| Backend API | FastAPI, Uvicorn |
| Voice synthesis | Edge-TTS |
| Database | Neon PostgreSQL |
| API gateway | Cloudflare Workers |
| Hosting | Vercel, Render, Cloudflare |
| CI | GitHub Actions |

## Features

- **3D Avatar Stage** — browser-based 3D character rendering with VRM support and avatar controls.
- **Character Library** — character records and persona metadata served by the backend.
- **Voice & Narration** — multilingual voice catalog and server-side text-to-speech synthesis.
- **Video Studio** — storyboard editing, render-plan manifests, and browser-based narrated capture. Export formats depend on browser MediaRecorder support.
- **OBS Broadcast UI** — browser-based broadcast and overlay interface.
- **Telegram Integration** — optional webhook integration routed through a Cloudflare Worker with server-side validation and allowlist checks.

## Architecture

```text
Web Browser
    |
    v
React + Vite + Three.js (Vercel)
    |
    v
Cloudflare Worker Gateway
    |
    v
FastAPI Backend (Render)
    |
    v
Neon PostgreSQL
```

## Repository structure

The production application code is organized under `apps/web-platform`:

- `apps/web-platform/frontend` — React / Vite frontend.
- `apps/web-platform/backend` — FastAPI backend.
- `apps/web-platform/backend/cloudflare_worker` — Cloudflare Worker gateway and Telegram webhook.

## Run locally

### Frontend

```bash
cd apps/web-platform/frontend
npm ci
npm run dev
```

### Backend

```bash
cd apps/web-platform/backend
python -m venv .venv
# Activate the virtual environment, then:
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8010
```

### Cloudflare Worker

```bash
cd apps/web-platform/backend/cloudflare_worker
npm ci
npm test
npm run lint
npx wrangler deploy --dry-run
```

Configure required environment variables and provider secrets in the relevant dashboards. **Never commit API tokens, database credentials, Telegram bot tokens, webhook secrets, or private user identifiers.**

## CI

GitHub Actions is configured to check the frontend, backend, and Worker. See the workflow files in `.github/workflows` for the exact jobs and commands.

## Deployment

- **Frontend:** [auracraft-studio.vercel.app](https://auracraft-studio.vercel.app)
- **Backend:** Render (see `render.yaml`)
- **Gateway:** Cloudflare Workers (see Worker configuration)

Free-tier availability, usage quotas, cold starts, and provider policies may apply; uninterrupted uptime and zero cost are not guaranteed.

## Project status

This is the primary application repository for AuraCraft Studio. Features and deployment readiness should be verified against the current source code and CI results before being described as production-ready.

## License

MIT
