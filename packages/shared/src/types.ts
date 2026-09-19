export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  avatarEmoji: string;
  colorHex: string;
  score: number;
  connected: boolean;
}

export type RoomPhase =
  | 'lobby'
  | 'game-select'
  | 'in-game'
  | 'round-results'
  | 'party-over';

export interface RoomSummary {
  code: string;
  phase: RoomPhase;
  players: Player[];
  currentGameId: string | null;
  playedGameIds: string[];
}

export interface RoundResultEntry {
  playerId: PlayerId;
  name: string;
  pointsAwarded: number;
  scoreTotal: number;
  detail?: string;
}

export interface RoundResults {
  gameId: string;
  gameName: string;
  entries: RoundResultEntry[];
}

export type GameCategory =
  | 'quiz'
  | 'kreativ'
  | 'voting'
  | 'deduktion'
  | 'schnelligkeit'
  | 'party';

export interface GameMeta {
  id: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  color: string;
  category: GameCategory;
  minPlayers: number;
  maxPlayers: number;
}
