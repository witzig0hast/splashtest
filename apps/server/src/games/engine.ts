import type { Server } from 'socket.io';
import { ServerEvents, type RoundResultEntry } from '@splash/shared';
import { toRoomSummary, type Room, type ServerPlayer } from '../roomManager.js';

export interface PlayerActionPayload {
  type: string;
  payload?: unknown;
}
export interface HostActionPayload {
  type: string;
  payload?: unknown;
}

export interface GameModule {
  getHostView(): unknown;
  getPlayerView(playerId: string): unknown;
  onPlayerAction(playerId: string, action: PlayerActionPayload): void;
  onHostAction?(action: HostActionPayload): void;
  onPlayerDisconnect?(playerId: string): void;
  onPlayerReconnect?(playerId: string): void;
  destroy(): void;
}

export interface PointsAward {
  playerId: string;
  pointsAwarded: number;
  detail?: string;
}

/** `pool` is the pre-resolved content for this session (already picked by
 * genre/AI/custom-pack - see admin/contentResolver.ts), empty for games
 * that don't need content (e.g. reaction). */
export type GameFactory = (ctx: GameContext, pool: unknown[]) => GameModule;

export class GameContext {
  constructor(
    private io: Server,
    private room: Room,
    public gameId: string,
    public gameName: string,
  ) {}

  get players(): ServerPlayer[] {
    return [...this.room.players.values()];
  }

  connectedPlayers(): ServerPlayer[] {
    return this.players.filter((p) => p.connected);
  }

  sendHost(view: unknown) {
    if (this.room.hostSocketId) {
      this.io.to(this.room.hostSocketId).emit(ServerEvents.HostState, { gameId: this.gameId, view });
    }
  }

  sendPlayer(playerId: string, view: unknown) {
    const p = this.room.players.get(playerId);
    if (p?.socketId) {
      this.io.to(p.socketId).emit(ServerEvents.PlayerState, { gameId: this.gameId, view });
    }
  }

  /** Push the module's current host + all-player views out over the wire. */
  push(module: GameModule) {
    this.sendHost(module.getHostView());
    for (const p of this.players) {
      this.sendPlayer(p.id, module.getPlayerView(p.id));
    }
  }

  setTimer(key: string, ms: number, fn: () => void) {
    this.clearTimer(key);
    const t = setTimeout(() => {
      this.room.timers.delete(key);
      fn();
    }, ms);
    this.room.timers.set(key, t);
  }

  clearTimer(key: string) {
    const t = this.room.timers.get(key);
    if (t) {
      clearTimeout(t);
      this.room.timers.delete(key);
    }
  }

  clearAllTimers() {
    for (const t of this.room.timers.values()) clearTimeout(t);
    this.room.timers.clear();
  }

  broadcastRoom() {
    this.room.touch();
    this.io.to(this.room.code).emit(ServerEvents.RoomUpdate, toRoomSummary(this.room));
  }

  /** Finalize the currently running mini-game, award points and return the room to game-select. */
  finishGame(awards: PointsAward[]) {
    this.clearAllTimers();
    for (const a of awards) {
      const p = this.room.players.get(a.playerId);
      if (p) p.score += a.pointsAwarded;
    }
    const entries: RoundResultEntry[] = awards.map((a) => {
      const p = this.room.players.get(a.playerId);
      return {
        playerId: a.playerId,
        name: p?.name ?? '???',
        pointsAwarded: a.pointsAwarded,
        scoreTotal: p?.score ?? a.pointsAwarded,
        detail: a.detail,
      };
    });
    this.room.playedGameIds.push(this.gameId);
    this.room.phase = 'round-results';
    this.room.currentModule?.destroy();
    this.room.currentModule = null;
    this.room.currentGameId = null;
    this.room.touch();
    this.io.to(this.room.code).emit(ServerEvents.RoundEnded, {
      results: { gameId: this.gameId, gameName: this.gameName, entries },
      room: toRoomSummary(this.room),
    });
  }
}
