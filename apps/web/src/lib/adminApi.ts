import type { AiModelConfig, ContentPack, GameContentSpecInfo } from '@splash/shared';
import { getServerUrl } from './serverUrl';

const TOKEN_KEY = 'splash_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`${getServerUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401) clearAdminToken();
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(body.error || `Fehler (${res.status})`, res.status);
  }
  return res.json();
}

export async function adminLogin(password: string): Promise<string> {
  const res = await fetch(`${getServerUrl()}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(body.error || 'Login fehlgeschlagen.', res.status);
  }
  const data = await res.json();
  setAdminToken(data.token);
  return data.token;
}

export const adminApi = {
  listGames: () => adminFetch<GameContentSpecInfo[]>('/api/admin/games'),
  listModels: () => adminFetch<AiModelConfig[]>('/api/admin/models'),
  addModel: (data: { label: string; endpointUrl: string; model: string; apiKey: string }) =>
    adminFetch<AiModelConfig>('/api/admin/models', { method: 'POST', body: JSON.stringify(data) }),
  activateModel: (id: string) => adminFetch<{ ok: true }>(`/api/admin/models/${id}/activate`, { method: 'POST' }),
  deleteModel: (id: string) => adminFetch<{ ok: true }>(`/api/admin/models/${id}`, { method: 'DELETE' }),
  listPacks: () => adminFetch<ContentPack[]>('/api/admin/packs'),
  addPack: (data: { gameId: string; genre: string; label: string; items: unknown[] }) =>
    adminFetch<ContentPack>('/api/admin/packs', { method: 'POST', body: JSON.stringify(data) }),
  deletePack: (id: string) => adminFetch<{ ok: true }>(`/api/admin/packs/${id}`, { method: 'DELETE' }),
};
