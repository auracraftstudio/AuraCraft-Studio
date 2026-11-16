# AuraCraft Studio Cloudflare Edge Gateway

The deployed Worker is `auracraft-studio-edge` at:

`https://auracraft-studio-edge.auracraftstudio.workers.dev`

It is the trusted API gateway between the Vite frontend, the FastAPI backend on Render, and Telegram.

## Routes

- `GET /health`: Worker liveness only; it does not prove that the backend is ready.
- `GET /ready`: proxies the backend readiness check and requires `API_AUTH_TOKEN`.
- `GET /api/characters` and `GET /api/tts/voices`: public read-only catalog routes, proxied to FastAPI.
- Other `/api/*` routes: browser-origin checked and proxied with the server-side bearer token.
- `POST /telegram-api/{method}`: backend-only allowlisted Telegram Bot API proxy.
- `POST /webhook`: validates Telegram's webhook secret, chat, topic and user allowlist before forwarding an update to FastAPI.

## Configuration

In `wrangler.toml`, set:

- `BACKEND_API_URL` to the Render backend URL.
- `ALLOWED_ORIGINS` to the exact production frontend origin: `https://auracraft-studio.vercel.app`.

Do not put secrets or private Telegram identifiers in this file or in the repository.

Configure these Worker secrets from this directory:

```bash
npx wrangler secret put API_AUTH_TOKEN
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
npx wrangler secret put TELEGRAM_GROUP_CHAT_ID
npx wrangler secret put TELEGRAM_TOPIC_ID
npx wrangler secret put TELEGRAM_ALLOWED_USER_IDS
```

- `API_AUTH_TOKEN` must exactly match the Render backend's `API_AUTH_TOKEN`.
- `TELEGRAM_BOT_TOKEN` stays in Cloudflare; do not put it in Vite or the frontend.
- `TELEGRAM_WEBHOOK_SECRET` is used by this Worker to register and validate Telegram webhook requests.
- `TELEGRAM_GROUP_CHAT_ID`, `TELEGRAM_TOPIC_ID`, and `TELEGRAM_ALLOWED_USER_IDS` define the private access policy. Store them as secrets; never commit real values.

## Render and Vercel settings

Set these Render backend variables:

- `TELEGRAM_API_PROXY_URL=https://auracraft-studio-edge.auracraftstudio.workers.dev/telegram-api`
- `TELEGRAM_WEBHOOK_URL=https://auracraft-studio-edge.auracraftstudio.workers.dev/webhook`
- `API_AUTH_TOKEN` to the same value as the Worker secret.

After all Worker secrets are configured and the Worker is deployed, set the Vercel production `VITE_API_URL` to:

`https://auracraft-studio-edge.auracraftstudio.workers.dev`

Do not create a `VITE_API_AUTH_TOKEN` variable. The API token must never be included in the browser bundle.

## Deploy and verify

```bash
npm ci
npm test
npm run lint
npx wrangler deploy --dry-run
npx wrangler deploy
```

Verify `/health` for Worker liveness and `/ready` for end-to-end backend readiness. A healthy Worker `/health` response alone does not mean the API gateway is configured.

Register Telegram's webhook at the Worker `/webhook` route. Do not register the Render backend as a second webhook destination; the Worker forwards verified updates to FastAPI.

## Optional R2 storage

A commented R2 binding is included in `wrangler.toml`. Create the bucket and enable the binding only when the application actually uses it.
