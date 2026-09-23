import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nanoid } from 'nanoid';
import type { AiModelConfig, ContentPack } from '@splash/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'admin-store.json');

export interface StoredAiModel {
  id: string;
  label: string;
  endpointUrl: string;
  model: string;
  /** Full secret - never leaves the server. */
  apiKey: string;
  active: boolean;
  createdAt: number;
}

interface StoreShape {
  models: StoredAiModel[];
  packs: ContentPack[];
}

function loadStore(): StoreShape {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { models: parsed.models ?? [], packs: parsed.packs ?? [] };
  } catch {
    return { models: [], packs: [] };
  }
}

let store: StoreShape = loadStore();

function persist() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function maskKey(key: string): string {
  if (key.length <= 6) return '••••';
  return `${key.slice(0, 3)}…${key.slice(-4)}`;
}

export function toPublicModel(m: StoredAiModel): AiModelConfig {
  return {
    id: m.id,
    label: m.label,
    endpointUrl: m.endpointUrl,
    model: m.model,
    apiKeyMasked: maskKey(m.apiKey),
    active: m.active,
    createdAt: m.createdAt,
  };
}

export const adminStore = {
  listModels(): StoredAiModel[] {
    return [...store.models];
  },
  getActiveModel(): StoredAiModel | undefined {
    return store.models.find((m) => m.active);
  },
  addModel(data: { label: string; endpointUrl: string; model: string; apiKey: string }): StoredAiModel {
    const entry: StoredAiModel = {
      id: nanoid(10),
      label: data.label,
      endpointUrl: data.endpointUrl,
      model: data.model,
      apiKey: data.apiKey,
      active: store.models.length === 0,
      createdAt: Date.now(),
    };
    store.models.push(entry);
    persist();
    return entry;
  },
  activateModel(id: string): boolean {
    const found = store.models.some((m) => m.id === id);
    if (!found) return false;
    store.models = store.models.map((m) => ({ ...m, active: m.id === id }));
    persist();
    return true;
  },
  deleteModel(id: string): boolean {
    const before = store.models.length;
    store.models = store.models.filter((m) => m.id !== id);
    if (store.models.length === before) return false;
    persist();
    return true;
  },

  listPacks(): ContentPack[] {
    return [...store.packs];
  },
  packsFor(gameId: string, genre: string): ContentPack[] {
    return store.packs.filter((p) => p.gameId === gameId && p.genre === genre);
  },
  genresFor(gameId: string): { id: string; label: string }[] {
    const seen = new Map<string, string>();
    for (const p of store.packs) {
      if (p.gameId === gameId && !seen.has(p.genre)) seen.set(p.genre, p.label);
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }));
  },
  addPack(data: { gameId: string; genre: string; label: string; items: unknown[] }): ContentPack {
    const entry: ContentPack = { id: nanoid(10), createdAt: Date.now(), ...data };
    store.packs.push(entry);
    persist();
    return entry;
  },
  deletePack(id: string): boolean {
    const before = store.packs.length;
    store.packs = store.packs.filter((p) => p.id !== id);
    if (store.packs.length === before) return false;
    persist();
    return true;
  },
};
