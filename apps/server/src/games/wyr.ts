import type { WyrHostView, WyrPlayerView } from '@splash/shared';
import type { GameContext, GameModule, PlayerActionPayload, PointsAward } from './engine.js';
import { WYR_PROMPTS, type WyrPrompt } from '../data/wyrPrompts.js';
import { pickN } from './utils.js';

const TOTAL_ROUNDS = 6;
const VOTE_MS = 12000;
const REVEAL_MS = 4500;

export class WyrGame implements GameModule {
  private ctx: GameContext;
  private prompts: WyrPrompt[];
  private roundIndex = 0;
  private phase: 'voting' | 'reveal' = 'voting';
  private votes = new Map<string, 'A' | 'B'>();
  private totalPoints = new Map<string, number>();

  constructor(ctx: GameContext) {
    this.ctx = ctx;
    this.prompts = pickN(WYR_PROMPTS, TOTAL_ROUNDS);
    this.startRound();
  }

  private get prompt() {
    return this.prompts[this.roundIndex];
  }

  private startRound() {
    this.phase = 'voting';
    this.votes.clear();
    this.ctx.push(this);
    this.ctx.setTimer('wyr-vote', VOTE_MS, () => this.reveal());
  }

  private reveal() {
    this.phase = 'reveal';
    const counts = { A: 0, B: 0 };
    for (const v of this.votes.values()) counts[v]++;
    const majority: 'A' | 'B' | null = counts.A === counts.B ? null : counts.A > counts.B ? 'A' : 'B';
    for (const [playerId, vote] of this.votes) {
      const pts = majority === null ? 100 : vote === majority ? 150 : 60;
      this.totalPoints.set(playerId, (this.totalPoints.get(playerId) ?? 0) + pts);
    }
    this.ctx.push(this);
    this.ctx.setTimer('wyr-reveal', REVEAL_MS, () => {
      this.roundIndex++;
      if (this.roundIndex >= this.prompts.length) this.finish();
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
    if (action.type !== 'vote' || this.phase !== 'voting' || this.votes.has(playerId)) return;
    const payload = action.payload as { choice: 'A' | 'B' } | undefined;
    if (payload?.choice !== 'A' && payload?.choice !== 'B') return;
    this.votes.set(playerId, payload.choice);
    const connected = this.ctx.connectedPlayers();
    if (connected.every((p) => this.votes.has(p.id))) {
      this.ctx.clearTimer('wyr-vote');
      this.reveal();
    } else {
      this.ctx.push(this);
    }
  }

  private counts() {
    const c = { A: 0, B: 0 };
    for (const v of this.votes.values()) c[v]++;
    return c;
  }

  getHostView(): WyrHostView {
    const connected = this.ctx.connectedPlayers();
    const base = {
      round: this.roundIndex + 1,
      totalRounds: this.prompts.length,
      optionA: this.prompt.a,
      optionB: this.prompt.b,
      answeredCount: this.votes.size,
      totalPlayers: connected.length,
    };
    if (this.phase === 'voting') return { ...base, phase: 'voting' };
    const c = this.counts();
    return { ...base, phase: 'reveal', votesA: c.A, votesB: c.B };
  }

  getPlayerView(playerId: string): WyrPlayerView {
    const base = { optionA: this.prompt.a, optionB: this.prompt.b };
    if (this.phase === 'voting') {
      return { ...base, phase: 'voting', yourVote: this.votes.get(playerId) };
    }
    const c = this.counts();
    return { ...base, phase: 'reveal', yourVote: this.votes.get(playerId), votesA: c.A, votesB: c.B };
  }

  destroy(): void {}
}
