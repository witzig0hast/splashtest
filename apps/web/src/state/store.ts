import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import {
  ClientEvents,
  ServerEvents,
  type ErrorPayload,
  type GameStartedPayload,
  type GameStatePayload,
  type JoinedPayload,
  type Player,
  type PartyEndedPayload,
  type RoomSummary,
  type RoundEndedPayload,
  type RoundResults,
} from '@splash/shared';
import { getServerUrl } from '../lib/serverUrl';

const HOST_KEY = 'splash_host';
const PLAYER_KEY = 'splash_player';

interface HostSession {
  code: string;
  hostToken: string;
}
interface PlayerSession {
  code: string;
  playerToken: string;
  name: string;
  avatarEmoji: string;
  colorHex: string;
}

type Session = { type: 'host'; data: HostSession } | { type: 'player'; data: PlayerSession } | null;

interface StoreState {
  connected: boolean;
  isHost: boolean;
  room: RoomSummary | null;
  me: Player | null;
  code: string | null;
  gameId: string | null;
  gameName: string | null;
  hostView: unknown;
  playerView: unknown;
  roundResults: RoundResults | null;
  partyEnded: boolean;
  error: string | null;

  createRoom: () => Promise<string>;
  resumeHost: (code: string) => void;
  joinRoom: (code: string, name: string, avatarEmoji: string, colorHex: string) => Promise<void>;
  resumePlayerIfSaved: () => boolean;
  startGame: (gameId: string) => void;
  backToSelect: () => void;
  endParty: () => void;
  leaveRoom: () => void;
  kickPlayer: (playerId: string) => void;
  playerAction: (type: string, payload?: unknown) => void;
  hostAction: (type: string, payload?: unknown) => void;
  clearError: () => void;
  resetParty: () => void;
}

let socket: Socket | null = null;
let session: Session = null;

function getSocket(): Socket {
  if (socket) return socket;
  socket = io(getServerUrl(), { transports: ['websocket', 'polling'] });
  wireSocket(socket);
  return socket;
}

function wireSocket(s: Socket) {
  s.on('connect', () => {
    useStore.setState({ connected: true });
    if (session?.type === 'host') {
      s.emit(ClientEvents.RejoinHost, { code: session.data.code, hostToken: session.data.hostToken });
    } else if (session?.type === 'player') {
      s.emit(ClientEvents.RejoinRoom, { code: session.data.code, playerToken: session.data.playerToken });
    }
  });
  s.on('disconnect', () => useStore.setState({ connected: false }));
  s.on(ServerEvents.RoomUpdate, (room: RoomSummary) => {
    useStore.setState((state) => ({
      room,
      code: room.code,
      me: state.me ? room.players.find((p) => p.id === state.me!.id) ?? state.me : state.me,
    }));
  });
  s.on(ServerEvents.Joined, (payload: JoinedPayload) => {
    useStore.setState({ room: payload.room, code: payload.room.code, me: payload.player });
  });
  s.on(ServerEvents.Error, (payload: ErrorPayload) => {
    useStore.setState({ error: payload.message });
  });
  s.on(ServerEvents.Kicked, () => {
    session = null;
    localStorage.removeItem(PLAYER_KEY);
    useStore.setState({ error: 'Du wurdest aus dem Raum entfernt.', room: null, me: null });
  });
  s.on(ServerEvents.GameStarted, (payload: GameStartedPayload) => {
    useStore.setState({ gameId: payload.gameId, gameName: payload.gameName, roundResults: null, hostView: null, playerView: null });
  });
  s.on(ServerEvents.HostState, (payload: GameStatePayload) => {
    useStore.setState({ hostView: payload.view, gameId: payload.gameId });
  });
  s.on(ServerEvents.PlayerState, (payload: GameStatePayload) => {
    useStore.setState({ playerView: payload.view, gameId: payload.gameId });
  });
  s.on(ServerEvents.RoundEnded, (payload: RoundEndedPayload) => {
    useStore.setState({ roundResults: payload.results, room: payload.room, gameId: null, hostView: null, playerView: null });
  });
  s.on(ServerEvents.PartyEnded, (payload: PartyEndedPayload) => {
    useStore.setState({ room: payload.room, partyEnded: true, gameId: null, hostView: null, playerView: null, roundResults: null });
  });
}

export const useStore = create<StoreState>((setState, getState) => ({
  connected: false,
  isHost: false,
  room: null,
  me: null,
  code: null,
  gameId: null,
  gameName: null,
  hostView: null,
  playerView: null,
  roundResults: null,
  partyEnded: false,
  error: null,

  createRoom: () =>
    new Promise((resolve) => {
      const s = getSocket();
      const doCreate = () => {
        s.emit(ClientEvents.CreateRoom, {}, (res: { ok: boolean; code: string; hostToken: string }) => {
          session = { type: 'host', data: { code: res.code, hostToken: res.hostToken } };
          sessionStorage.setItem(HOST_KEY, JSON.stringify(session.data));
          setState({ isHost: true, code: res.code });
          resolve(res.code);
        });
      };
      if (s.connected) doCreate();
      else s.once('connect', doCreate);
    }),

  resumeHost: (code: string) => {
    const saved = sessionStorage.getItem(HOST_KEY);
    setState({ isHost: true, code });
    if (saved) {
      const data: HostSession = JSON.parse(saved);
      if (data.code === code) {
        session = { type: 'host', data };
        const s = getSocket();
        const doRejoin = () => s.emit(ClientEvents.RejoinHost, data);
        if (s.connected) doRejoin();
        else s.once('connect', doRejoin);
        return;
      }
    }
    getState()
      .createRoom()
      .catch(() => undefined);
  },

  joinRoom: (code: string, name: string, avatarEmoji: string, colorHex: string) =>
    new Promise((resolve, reject) => {
      const s = getSocket();
      const doJoin = () => {
        s.emit(
          ClientEvents.JoinRoom,
          { code: code.toUpperCase(), name, avatarEmoji, colorHex },
          (res: JoinedPayload | undefined) => {
            if (!res) {
              reject(new Error('Beitritt fehlgeschlagen.'));
              return;
            }
            const data: PlayerSession = { code: res.room.code, playerToken: res.playerToken, name, avatarEmoji, colorHex };
            session = { type: 'player', data };
            localStorage.setItem(PLAYER_KEY, JSON.stringify(data));
            setState({ isHost: false, room: res.room, me: res.player, code: res.room.code });
            resolve();
          },
        );
      };
      if (s.connected) doJoin();
      else s.once('connect', doJoin);
    }),

  resumePlayerIfSaved: () => {
    const saved = localStorage.getItem(PLAYER_KEY);
    if (!saved) return false;
    const data: PlayerSession = JSON.parse(saved);
    session = { type: 'player', data };
    setState({ isHost: false, code: data.code });
    const s = getSocket();
    const doRejoin = () => s.emit(ClientEvents.RejoinRoom, { code: data.code, playerToken: data.playerToken });
    if (s.connected) doRejoin();
    else s.once('connect', doRejoin);
    return true;
  },

  startGame: (gameId: string) => getSocket().emit(ClientEvents.StartGame, { gameId }),
  backToSelect: () => getSocket().emit(ClientEvents.BackToSelect),
  endParty: () => getSocket().emit(ClientEvents.EndParty),
  leaveRoom: () => {
    getSocket().emit(ClientEvents.LeaveRoom);
    session = null;
    localStorage.removeItem(PLAYER_KEY);
    sessionStorage.removeItem(HOST_KEY);
    setState({ room: null, me: null, code: null, gameId: null, hostView: null, playerView: null, roundResults: null, partyEnded: false });
  },
  kickPlayer: (playerId: string) => getSocket().emit(ClientEvents.KickPlayer, { playerId }),
  playerAction: (type: string, payload?: unknown) => getSocket().emit(ClientEvents.PlayerAction, { type, payload }),
  hostAction: (type: string, payload?: unknown) => getSocket().emit(ClientEvents.HostAction, { type, payload }),
  clearError: () => setState({ error: null }),
  resetParty: () => {
    sessionStorage.removeItem(HOST_KEY);
    localStorage.removeItem(PLAYER_KEY);
    session = null;
    setState({ room: null, me: null, code: null, gameId: null, hostView: null, playerView: null, roundResults: null, partyEnded: false });
  },
}));
