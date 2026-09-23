/** Public-safe view of an admin-configured AI model (API key never round-trips in full). */
export interface AiModelConfig {
  id: string;
  label: string;
  endpointUrl: string;
  model: string;
  apiKeyMasked: string;
  active: boolean;
  createdAt: number;
}

export interface CreateAiModelPayload {
  label: string;
  endpointUrl: string;
  model: string;
  apiKey: string;
}

export interface ContentPack {
  id: string;
  gameId: string;
  genre: string;
  label: string;
  items: unknown[];
  createdAt: number;
}

export interface CreateContentPackPayload {
  gameId: string;
  genre: string;
  label: string;
  items: unknown[];
}

export interface GenreOption {
  id: string;
  label: string;
}

export interface GameContentSpecInfo {
  gameId: string;
  gameName: string;
  itemSchemaHint: string;
  exampleItem: unknown;
  countNeeded: number;
}
