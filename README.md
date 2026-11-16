# AuraCraft Studio

A browser-based 3D avatar and voice studio built around VRM, Three.js, FastAPI, Edge-TTS, Neon Postgres, and a Cloudflare Worker gateway.

> The deployment is designed to use provider free tiers where available. Free-tier quotas, cold starts, browser capabilities, and provider policies apply; zero cost or uninterrupted uptime is not guaranteed.

## Current application stack

| Layer | Implementation | Production location |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript + Three.js / `@pixiv/three-vrm` | Vercel |
| Backend API | FastAPI + Uvicorn + Edge-TTS | Render |
| API gateway and Telegram webhook | Cloudflare Worker | Cloudflare Workers |
| Persistent state and uploaded assets | PostgreSQL JSONB / BYTEA tables | Neon |
| CI | Frontend, backend, Worker tests and dependency audits | GitHub Actions |

The production frontend lives in `apps/web-platform/frontend`. The backend lives in `apps/web-platform/backend`; the Worker lives in `apps/web-platform/backend/cloudflare_worker`.

## Implemented capabilities

- **3D avatar stage:** browser-side Three.js and VRM rendering with character presets and avatar controls.
- **Character library:** character records and persona metadata served by the FastAPI backend.
- **Voice catalog and narration:** multilingual Edge-TTS voice catalog and server-side speech synthesis.
- **Video Studio:** storyboard editing, local render-plan manifests, and browser-side narrated video capture. Export format depends on the browser's `MediaRecorder` support (MP4 where supported, otherwise WebM).
- **OBS broadcast UI:** browser-based broadcast/overlay interface.
- **Telegram integration:** a Cloudflare Worker validates the webhook secret and private chat/topic/user allowlist before forwarding updates to FastAPI. This feature requires the Worker secrets documented in `apps/web-platform/backend/cloudflare_worker/README.md`.

This repository does not currently use Next.js, Supabase, or a Gemini conversational backend. Neon is the configured PostgreSQL provider.

## Architecture

```text
Browser (Vercel / React + Three.js)
              |
              v
Cloudflare Worker API Gateway
  - checks allowed browser origins
  - injects server-side API_AUTH_TOKEN
  - validates Telegram webhook requests
              |
              v
FastAPI backend (Render)
  - character and voice APIs
  - Edge-TTS synthesis
  - render-plan manifests
              |
              v
Neon PostgreSQL
  - auracraft_state
  - auracraft_assets
```

Telegram Bot API calls from the backend are routed through the Worker. The Telegram bot token belongs in Cloudflare Worker secrets, never in a Vite environment variable or browser bundle.

## Local development

### Frontend

```bash
cd apps/web-platform/frontend
npm ci
npm run dev
```

The Vite development server uses `http://localhost:5180` by default. Set `VITE_API_URL` to a reachable backend or local API gateway when testing backend features.

### Backend

```bash
cd apps/web-platform/backend
python -m venv .venv
# Activate the virtual environment for your shell, then:
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8010
```

For persistent local testing, configure `DATABASE_URL` with a Neon or local PostgreSQL connection string. Without it, the backend uses its local JSON-file adapter.

### Cloudflare Worker

```bash
cd apps/web-platform/backend/cloudflare_worker
npm ci
npm test
npm run lint
npx wrangler deploy --dry-run
```

Do not deploy the Worker until its required secrets are configured. See the Worker README for the exact secret names and provider settings.

## CI checks

GitHub Actions runs:

- Backend: Ruff, Mypy, Pytest, and Python dependency audit.
- Frontend: ESLint, Vitest, production build, and npm dependency audit.
- Worker: syntax checks, Node tests, Wrangler dry-run, and npm dependency audit.

The production deploy job should run only after all three test jobs pass.

## Production configuration

Use the provider dashboards for secrets. Never commit real `DATABASE_URL`, `API_AUTH_TOKEN`, Telegram bot tokens, webhook secrets, private chat IDs, or user allowlists.

See:

- `render.yaml` for the Render backend blueprint.
- `apps/web-platform/backend/cloudflare_worker/wrangler.toml` for Worker configuration.
- `apps/web-platform/backend/cloudflare_worker/README.md` for the Worker secret setup and Vercel/Render integration.
- `.env.production.example` for variable names and public endpoint references only.

## License

MIT
