import type { ReactionHostView, ReactionPlayerView } from '@splash/shared';
import type { GameContext, GameModule, PlayerActionPayload, PointsAward } from './engine.js';

const TOTAL_ROUNDS = 4;
const RESULTS_MS = 4500;
const RESPONSE_WINDOW_MS = 6000;
const POINTS_TABLE = [300, 220, 170, 130, 100];
const FALLBACK_POINTS = 60;

interface TapResult {
  ms: number | null;
  falseStart: boolean;
}

export class ReactionGame implements GameModule {
  private ctx: GameContext;
  private roundIndex = 0;
  private phase: 'waiting' | 'go' | 'results' = 'waiting';
  private goAt = 0;
  private results = new Map<string, TapResult>();
  private totalPoints = new Map<string, number>();

  constructor(ctx: GameContext) {
    this.ctx = ctx;
    this.startRound();
  }

  private startRound() {
    this.phase = 'waiting';
    this.results.clear();
    this.ctx.push(this);
    const delay = 2000 + Math.random() * 4000;
    this.ctx.setTimer('reaction-go', delay, () => {
      this.phase = 'go';
      this.goAt = Date.now();
      this.ctx.push(this);
      this.ctx.setTimer('reaction-timeout', RESPONSE_WINDOW_MS, () => this.finishRound());
    });
  }

  private finishRound() {
    this.phase = 'results';
    const ranked = [...this.results.entries()]
      .filter(([, r]) => !r.falseStart && r.ms !== null)
      .sort((a, b) => (a[1].ms ?? 0) - (b[1].ms ?? 0));
    ranked.forEach(([playerId], rank) => {
      const pts = POINTS_TABLE[rank] ?? FALLBACK_POINTS;
      this.totalPoints.set(playerId, (this.totalPoints.get(playerId) ?? 0) + pts);
    });
    this.ctx.push(this);
    this.ctx.setTimer('reaction-results', RESULTS_MS, () => {
      this.roundIndex++;
      if (this.roundIndex >= TOTAL_ROUNDS) this.finish();
      else this.startRound();
    });
  }

  private finish() {
    const awards: PointsAward[] = this.ctx.players.map((p) => ({
      playerId: p.id,
      pointsAwarded: this.totalPoints.get(p.id) ?? 0,
    }));
    this.ctx.finishGame(awards);
  }

  onPlayerAction(playerId: string, action: PlayerActionPayload): void {
    if (action.type !== 'tap' || this.results.has(playerId)) return;
    if (this.phase === 'waiting') {
      this.results.set(playerId, { ms: null, falseStart: true });
      this.ctx.push(this);
      return;
    }
    if (this.phase === 'go') {
      this.results.set(playerId, { ms: Date.now() - this.goAt, falseStart: false });
      const connected = this.ctx.connectedPlayers();
      if (connected.every((p) => this.results.has(p.id))) {
        this.ctx.clearTimer('reaction-timeout');
        this.finishRound();
      } else {
        this.ctx.push(this);
      }
    }
  }

  getHostView(): ReactionHostView {
    const connected = this.ctx.connectedPlayers();
    const base = { round: this.roundIndex + 1, totalRounds: TOTAL_ROUNDS, tappedCount: this.results.size, totalPlayers: connected.length };
    if (this.phase !== 'results') return { ...base, phase: this.phase };
    const rankings = [...this.results.entries()]
      .sort((a, b) => {
        if (a[1].falseStart) return 1;
        if (b[1].falseStart) return -1;
        return (a[1].ms ?? 0) - (b[1].ms ?? 0);
      })
      .map(([playerId, r]) => ({
        playerId,
        name: this.ctx.players.find((p) => p.id === playerId)?.name ?? '???',
        ms: r.ms,
        falseStart: r.falseStart,
      }));
    return { ...base, phase: 'results', rankings };
  }

  getPlayerView(playerId: string): ReactionPlayerView {
    const mine = this.results.get(playerId);
    if (this.phase !== 'results') {
      return { phase: this.phase, hasTapped: !!mine, falseStart: mine?.falseStart };
    }
    const ranked = [...this.results.entries()]
      .filter(([, r]) => !r.falseStart && r.ms !== null)
      .sort((a, b) => (a[1].ms ?? 0) - (b[1].ms ?? 0));
    const rank = ranked.findIndex(([id]) => id === playerId);
    return {
      phase: 'results',
      yourResult: mine
        ? { ms: mine.ms, falseStart: mine.falseStart, rank: rank >= 0 ? rank + 1 : undefined }
        : { ms: null, falseStart: false },
    };
  }

  destroy(): void {}
}
