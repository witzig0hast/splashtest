import type { Player, RoomSummary, RoundResults } from './types.js';

/** Events sent from a client (host or player) to the server. */
export const ClientEvents = {
  CreateRoom: 'room:create',
  JoinRoom: 'room:join',
  RejoinRoom: 'room:rejoin',
  RejoinHost: 'room:rejoin-host',
  LeaveRoom: 'room:leave',
  KickPlayer: 'room:kick',
  StartGame: 'room:start-game',
  BackToSelect: 'room:back-to-select',
  EndParty: 'room:end-party',
  PlayerAction: 'game:player-action',
  HostAction: 'game:host-action',
} as const;

/** Events sent from the server to clients. */
export const ServerEvents = {
  RoomUpdate: 'room:update',
  Joined: 'room:joined',
  Error: 'room:error',
  Kicked: 'room:kicked',
  GameStarted: 'game:started',
  HostState: 'game:host-state',
  PlayerState: 'game:player-state',
  RoundEnded: 'game:round-ended',
  PartyEnded: 'party:ended',
} as const;

export interface CreateRoomAck {
  ok: true;
  code: string;
}

export interface JoinRoomPayload {
  code: string;
  name: string;
  avatarEmoji: string;
  colorHex: string;
}

export interface JoinedPayload {
  room: RoomSummary;
  player: Player;
  playerToken: string;
}

export interface RejoinPayload {
  code: string;
  playerToken: string;
}

export interface RejoinHostPayload {
  code: string;
  hostToken: string;
}

export interface ErrorPayload {
  message: string;
}

export interface StartGamePayload {
  gameId: string;
}

export interface PlayerActionPayload {
  type: string;
  payload?: unknown;
}

export interface HostActionPayload {
  type: string;
  payload?: unknown;
}

export interface GameStartedPayload {
  gameId: string;
  gameName: string;
}

export interface GameStatePayload {
  gameId: string;
  view: unknown;
}

export interface RoundEndedPayload {
  results: RoundResults;
  room: RoomSummary;
}

export interface PartyEndedPayload {
  room: RoomSummary;
}
