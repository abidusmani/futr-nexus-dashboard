// Centralized API URL helper
// Use Vite env vars when available. Fall back to unprefixed env vars to preserve current .env usage.
const devUrl = (import.meta as any).env?.VITE_BACKEND_URL ?? (import.meta as any).env?.BACKEND_URL;
const prodUrl = (import.meta as any).env?.VITE_API_URL ?? (import.meta as any).env?.API_URL;

export const BACKEND_BASE: string = (import.meta as any).env?.MODE === 'development'
  ? (devUrl ?? 'http://localhost:3000')
  : (prodUrl ?? '');

// API_BASE_URL ensures the returned value contains the '/api' segment.
export const API_BASE_URL: string = BACKEND_BASE.endsWith('/api')
  ? BACKEND_BASE
  : (BACKEND_BASE ? `${BACKEND_BASE.replace(/\/$/, '')}/api` : '');

export function withApi(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) return p; // fallback to just path if API_BASE_URL missing
  return `${API_BASE_URL.replace(/\/$/, '')}${p}`;
}

export default {
  BACKEND_BASE,
  API_BASE_URL,
  withApi,
};
