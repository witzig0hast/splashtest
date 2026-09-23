import { customAlphabet, nanoid } from 'nanoid';
import type { Player, RoomPhase, RoomSummary } from '@splash/shared';
import type { GameModule } from './games/engine.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0, I/1
const nanoCode = customAlphabet(CODE_ALPHABET, 4);

export interface ServerPlayer {
  id: string;
  token: string;
  socketId: string | null;
  name: string;
  avatarEmoji: string;
  colorHex: string;
  score: number;
  connected: boolean;
}

export class Room {
  code: string;
  hostSocketId: string | null = null;
  hostToken: string;
  phase: RoomPhase = 'lobby';
  players = new Map<string, ServerPlayer>();
  currentGameId: string | null = null;
  currentModule: GameModule | null = null;
  playedGameIds: string[] = [];
  timers = new Map<string, NodeJS.Timeout>();
  /** True while a StartGame request is resolving content (possibly an async
   * AI call) - guards against double-starts during that window. */
  starting = false;
  createdAt = Date.now();
  lastActivityAt = Date.now();

  constructor(code: string) {
    this.code = code;
    this.hostToken = nanoid(24);
  }

  touch() {
    this.lastActivityAt = Date.now();
  }

  clearAllTimers() {
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
  }

  isEmpty(): boolean {
    const anyoneConnected = [...this.players.values()].some((p) => p.connected);
    return !anyoneConnected && !this.hostSocketId;
  }
}

export function toPublicPlayer(p: ServerPlayer): Player {
  return {
    id: p.id,
    name: p.name,
    avatarEmoji: p.avatarEmoji,
    colorHex: p.colorHex,
    score: p.score,
    connected: p.connected,
  };
}

export function toRoomSummary(room: Room): RoomSummary {
  return {
    code: room.code,
    phase: room.phase,
    players: [...room.players.values()]
      .sort((a, b) => b.score - a.score)
      .map(toPublicPlayer),
    currentGameId: room.currentGameId,
    playedGameIds: [...room.playedGameIds],
  };
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  createRoom(): Room {
    let code = nanoCode();
    while (this.rooms.has(code)) code = nanoCode();
    const room = new Room(code);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  deleteRoom(code: string) {
    const room = this.rooms.get(code);
    if (room) {
      room.clearAllTimers();
      room.currentModule?.destroy();
    }
    this.rooms.delete(code);
  }

  sweepStale(maxIdleMs: number) {
    const now = Date.now();
    for (const [code, room] of this.rooms) {
      if (room.isEmpty() && now - room.lastActivityAt > maxIdleMs) {
        this.deleteRoom(code);
      }
    }
  }

  get size() {
    return this.rooms.size;
  }
}
