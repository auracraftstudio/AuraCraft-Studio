// AuraCraft Studio — Shared API configuration
// Uses VITE_API_URL env var when deployed; falls back to live Render production or localhost for development

const rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || '';
const sanitizedBase = rawBase.replace('auracraft-backend.onrender.com', 'auracraft-backend-dt1u.onrender.com');

export const API_BASE_URL =
  (sanitizedBase && sanitizedBase !== 'http://localhost:8010')
    ? sanitizedBase
    : (import.meta.env.PROD ? 'https://auracraft-backend-dt1u.onrender.com' : (sanitizedBase || 'http://localhost:8010'));

export const API_ENDPOINTS = {
  tts:         `${API_BASE_URL}/api/tts/synthesize`,
  voices:      `${API_BASE_URL}/api/tts/voices`,
  health:      `${API_BASE_URL}/health`,
  characters:  `${API_BASE_URL}/api/characters`,
  renderPlan:  `${API_BASE_URL}/api/avatar-video/render-plan`,
  archetypes:  `${API_BASE_URL}/api/characters/archetypes`,
  telegram:    `${API_BASE_URL}/api/telegram/webhook`,
} as const;
