import type { Server, Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import {
  ClientEvents,
  ServerEvents,
  getGameMeta,
  type ErrorPayload,
  type HostActionPayload,
  type JoinRoomPayload,
  type JoinedPayload,
  type PlayerActionPayload,
  type RejoinHostPayload,
  type RejoinPayload,
  type StartGamePayload,
} from '@splash/shared';
import { RoomManager, toPublicPlayer, toRoomSummary, type ServerPlayer } from './roomManager.js';
import { GameContext, GAME_FACTORIES } from './games/index.js';
import { resolveContent } from './admin/contentResolver.js';

interface SocketData {
  code?: string;
  playerId?: string;
  isHost?: boolean;
}

const MAX_NAME_LENGTH = 20;

export function registerSocketHandlers(io: Server, rooms: RoomManager) {
  io.on('connection', (socket: Socket<any, any, any, SocketData>) => {
    socket.on(ClientEvents.CreateRoom, (_payload: unknown, ack?: (res: any) => void) => {
      const room = rooms.createRoom();
      room.hostSocketId = socket.id;
      socket.data.code = room.code;
      socket.data.isHost = true;
      socket.join(room.code);
      ack?.({ ok: true, code: room.code, hostToken: room.hostToken });
      broadcastRoom(io, room);
    });

    socket.on(ClientEvents.RejoinRoom, (payload: RejoinPayload, ack?: (res: any) => void) => {
      const room = rooms.getRoom(payload.code);
      if (!room) return emitError(socket, 'Raum nicht gefunden.');
      const player = [...room.players.values()].find((p) => p.token === payload.playerToken);
      if (!player) return emitError(socket, 'Spieler nicht gefunden.');
      player.socketId = socket.id;
      player.connected = true;
      socket.data.code = room.code;
      socket.data.playerId = player.id;
      socket.join(room.code);
      room.touch();
      const joined: JoinedPayload = { room: toRoomSummary(room), player: toPublicPlayer(player), playerToken: player.token };
      ack?.(joined);
      socket.emit(ServerEvents.Joined, joined);
      if (room.currentModule) {
        room.currentModule.onPlayerReconnect?.(player.id);
        const ctx = new GameContext(io, room, room.currentGameId ?? '', getGameMeta(room.currentGameId ?? '')?.name ?? '');
        ctx.sendPlayer(player.id, room.currentModule.getPlayerView(player.id));
      }
      broadcastRoom(io, room);
    });

    socket.on(ClientEvents.RejoinHost, (payload: RejoinHostPayload, ack?: (res: any) => void) => {
      const room = rooms.getRoom(payload.code);
      if (!room || room.hostToken !== payload.hostToken) return emitError(socket, 'Raum nicht gefunden.');
      room.hostSocketId = socket.id;
      socket.data.code = room.code;
      socket.data.isHost = true;
      socket.join(room.code);
      room.touch();
      ack?.({ ok: true, code: room.code, room: toRoomSummary(room) });
      if (room.currentModule) {
        const ctx = new GameContext(io, room, room.currentGameId ?? '', getGameMeta(room.currentGameId ?? '')?.name ?? '');
        ctx.sendHost(room.currentModule.getHostView());
      }
      broadcastRoom(io, room);
    });

    socket.on(ClientEvents.JoinRoom, (payload: JoinRoomPayload, ack?: (res: any) => void) => {
      const room = rooms.getRoom(payload.code ?? '');
      if (!room) return emitError(socket, 'Dieser Raumcode existiert nicht.');
      if (room.phase === 'in-game') return emitError(socket, 'Es läuft gerade ein Spiel. Bitte kurz warten.');
      const name = (payload.name ?? '').trim().slice(0, MAX_NAME_LENGTH);
      if (!name) return emitError(socket, 'Bitte gib einen Namen ein.');
      if ([...room.players.values()].some((p) => p.name.toLowerCase() === name.toLowerCase() && p.connected)) {
        return emitError(socket, 'Dieser Name ist schon vergeben.');
      }
      const player: ServerPlayer = {
        id: nanoid(8),
        token: nanoid(24),
        socketId: socket.id,
        name,
        avatarEmoji: payload.avatarEmoji || '😀',
        colorHex: payload.colorHex || '#7C3AED',
        score: 0,
        connected: true,
      };
      room.players.set(player.id, player);
      socket.data.code = room.code;
      socket.data.playerId = player.id;
      socket.join(room.code);
      room.touch();
      const joined: JoinedPayload = { room: toRoomSummary(room), player: toPublicPlayer(player), playerToken: player.token };
      ack?.(joined);
      socket.emit(ServerEvents.Joined, joined);
      broadcastRoom(io, room);
    });

    socket.on(ClientEvents.LeaveRoom, () => {
      leaveRoom(io, rooms, socket);
    });

    socket.on(ClientEvents.KickPlayer, (payload: { playerId: string }) => {
      const room = getRoomForSocket(rooms, socket);
      if (!room || !socket.data.isHost) return;
      const player = room.players.get(payload.playerId);
      if (!player) return;
      room.players.delete(payload.playerId);
      if (player.socketId) {
        io.to(player.socketId).emit(ServerEvents.Kicked);
        io.sockets.sockets.get(player.socketId)?.leave(room.code);
      }
      broadcastRoom(io, room);
    });

    socket.on(ClientEvents.StartGame, async (payload: StartGamePayload) => {
      const room = getRoomForSocket(rooms, socket);
      if (!room || !socket.data.isHost) return;
      if (room.phase === 'in-game' || room.starting) return;
      const meta = getGameMeta(payload.gameId);
      const factory = GAME_FACTORIES[payload.gameId];
      if (!meta || !factory) return emitError(socket, 'Unbekanntes Spiel.');
      const connectedCount = [...room.players.values()].filter((p) => p.connected).length;
      if (connectedCount < meta.minPlayers) {
        return emitError(socket, `${meta.name} braucht mindestens ${meta.minPlayers} Spieler:innen.`);
      }

      room.starting = true;
      let pool: unknown[] = [];
      try {
        pool = await resolveContent(payload.gameId, payload.genre);
      } catch (err) {
        console.error('content resolution failed', err);
      }

      // The room may have moved on while we were awaiting content (party
      // ended, host started something else) - don't clobber that state.
      const stillStartable = room.phase === 'lobby' || room.phase === 'game-select' || room.phase === 'round-results';
      if (rooms.getRoom(room.code) !== room || !stillStartable) {
        room.starting = false;
        return;
      }
      room.starting = false;
      room.phase = 'in-game';
      room.currentGameId = payload.gameId;
      room.touch();
      const ctx = new GameContext(io, room, payload.gameId, meta.name);
      io.to(room.code).emit(ServerEvents.GameStarted, { gameId: payload.gameId, gameName: meta.name });
      const module = factory(ctx, pool);
      room.currentModule = module;
      broadcastRoom(io, room);
    });

    socket.on(ClientEvents.BackToSelect, () => {
      const room = getRoomForSocket(rooms, socket);
      if (!room || !socket.data.isHost) return;
      if (room.phase === 'in-game') return;
      room.phase = 'game-select';
      room.touch();
      broadcastRoom(io, room);
    });

    socket.on(ClientEvents.EndParty, () => {
      const room = getRoomForSocket(rooms, socket);
      if (!room || !socket.data.isHost) return;
      room.clearAllTimers();
      room.currentModule?.destroy();
      room.currentModule = null;
      room.currentGameId = null;
      room.phase = 'party-over';
      room.touch();
      io.to(room.code).emit(ServerEvents.PartyEnded, { room: toRoomSummary(room) });
    });

    socket.on(ClientEvents.PlayerAction, (payload: PlayerActionPayload) => {
      const room = getRoomForSocket(rooms, socket);
      const playerId = socket.data.playerId;
      if (!room || !playerId || !room.currentModule) return;
      room.touch();
      try {
        room.currentModule.onPlayerAction(playerId, payload);
      } catch (err) {
        console.error('player action error', err);
      }
    });

    socket.on(ClientEvents.HostAction, (payload: HostActionPayload) => {
      const room = getRoomForSocket(rooms, socket);
      if (!room || !socket.data.isHost || !room.currentModule) return;
      room.touch();
      try {
        room.currentModule.onHostAction?.(payload);
      } catch (err) {
        console.error('host action error', err);
      }
    });

    socket.on('disconnect', () => {
      const room = getRoomForSocket(rooms, socket);
      if (!room) return;
      if (socket.data.isHost && room.hostSocketId === socket.id) {
        room.hostSocketId = null;
        broadcastRoom(io, room);
        return;
      }
      const playerId = socket.data.playerId;
      if (playerId) {
        const player = room.players.get(playerId);
        if (player && player.socketId === socket.id) {
          player.connected = false;
          player.socketId = null;
          room.currentModule?.onPlayerDisconnect?.(playerId);
          broadcastRoom(io, room);
        }
      }
    });
  });
}

function emitError(socket: Socket, message: string) {
  const payload: ErrorPayload = { message };
  socket.emit(ServerEvents.Error, payload);
}

function getRoomForSocket(rooms: RoomManager, socket: Socket<any, any, any, SocketData>) {
  const code = socket.data.code;
  if (!code) return undefined;
  return rooms.getRoom(code);
}

function leaveRoom(io: Server, rooms: RoomManager, socket: Socket<any, any, any, SocketData>) {
  const room = getRoomForSocket(rooms, socket);
  if (!room) return;
  const playerId = socket.data.playerId;
  if (playerId) {
    room.players.delete(playerId);
    socket.leave(room.code);
    broadcastRoom(io, room);
  }
  socket.data.code = undefined;
  socket.data.playerId = undefined;
}

function broadcastRoom(io: Server, room: ReturnType<RoomManager['getRoom']>) {
  if (!room) return;
  io.to(room.code).emit(ServerEvents.RoomUpdate, toRoomSummary(room));
}
