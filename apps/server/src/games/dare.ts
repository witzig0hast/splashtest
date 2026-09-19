import type { DareHostView, DarePlayerView } from '@splash/shared';
import type { GameContext, GameModule, PlayerActionPayload, PointsAward } from './engine.js';
import { DARE_PROMPTS, TRUTH_PROMPTS } from '../data/darePrompts.js';
import { pickOne, shuffle } from './utils.js';

const MAX_TURNS = 10;
const CHOOSE_MS = 15000;
const PERFORM_MS = 45000;
const RATE_MS = 10000;
const REVEAL_MS = 4000;

export class DareGame implements GameModule {
  private ctx: GameContext;
  private turnOrder: string[];
  private turnIndex = 0;
  private phase: 'choosing' | 'prompt' | 'rating' | 'reveal' = 'choosing';
  private choice: 'truth' | 'dare' | null = null;
  private prompt = '';
  private ratings = new Map<string, 'up' | 'down'>();
  private usedPrompts = new Set<string>();
  private totalPoints = new Map<string, number>();

  constructor(ctx: GameContext) {
    this.ctx = ctx;
    const ids = ctx.connectedPlayers().map((p) => p.id);
    this.turnOrder = shuffle(ids).slice(0, Math.min(MAX_TURNS, ids.length));
    this.startTurn();
  }

  private get currentPlayerId(): string {
    return this.turnOrder[this.turnIndex];
  }

  private currentName(): string {
    return this.ctx.players.find((p) => p.id === this.currentPlayerId)?.name ?? '???';
  }

  private startTurn() {
    if (this.turnIndex >= this.turnOrder.length) {
      this.finish();
      return;
    }
    this.phase = 'choosing';
    this.choice = null;
    this.prompt = '';
    this.ratings.clear();
    this.ctx.push(this);
    this.ctx.setTimer('dare-choose', CHOOSE_MS, () => this.applyChoice('truth'));
  }

  private applyChoice(choice: 'truth' | 'dare') {
    this.choice = choice;
    const pool = (choice === 'truth' ? TRUTH_PROMPTS : DARE_PROMPTS).filter((p) => !this.usedPrompts.has(p));
    this.prompt = pickOne(pool.length > 0 ? pool : choice === 'truth' ? TRUTH_PROMPTS : DARE_PROMPTS);
    this.usedPrompts.add(this.prompt);
    this.phase = 'prompt';
    this.ctx.push(this);
    this.ctx.setTimer('dare-perform', PERFORM_MS, () => this.startRating());
  }

  private startRating() {
    this.phase = 'rating';
    this.ctx.push(this);
    this.ctx.setTimer('dare-rate', RATE_MS, () => this.reveal());
  }

  private reveal() {
    this.phase = 'reveal';
    let up = 0;
    let down = 0;
    for (const r of this.ratings.values()) (r === 'up' ? up++ : down++);
    const ratio = up + down > 0 ? up / (up + down) : 1;
    const pts = 100 + Math.round(ratio * 100);
    this.totalPoints.set(this.currentPlayerId, (this.totalPoints.get(this.currentPlayerId) ?? 0) + pts);
    this.ctx.push(this);
    this.ctx.setTimer('dare-reveal', REVEAL_MS, () => {
      this.turnIndex++;
      this.startTurn();
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
    if (action.type === 'choose' && this.phase === 'choosing' && playerId === this.currentPlayerId) {
      const payload = action.payload as { choice: 'truth' | 'dare' } | undefined;
      if (payload?.choice !== 'truth' && payload?.choice !== 'dare') return;
      this.ctx.clearTimer('dare-choose');
      this.applyChoice(payload.choice);
      return;
    }
    if (action.type === 'done' && this.phase === 'prompt' && playerId === this.currentPlayerId) {
      this.ctx.clearTimer('dare-perform');
      this.startRating();
      return;
    }
    if (action.type === 'rate' && this.phase === 'rating' && playerId !== this.currentPlayerId && !this.ratings.has(playerId)) {
      const payload = action.payload as { rating: 'up' | 'down' } | undefined;
      if (payload?.rating !== 'up' && payload?.rating !== 'down') return;
      this.ratings.set(playerId, payload.rating);
      const others = this.ctx.connectedPlayers().filter((p) => p.id !== this.currentPlayerId);
      if (others.every((p) => this.ratings.has(p.id))) {
        this.ctx.clearTimer('dare-rate');
        this.reveal();
      } else {
        this.ctx.push(this);
      }
    }
  }

  getHostView(): DareHostView {
    const base = { round: this.turnIndex + 1, totalRounds: this.turnOrder.length, currentPlayerName: this.currentName() };
    if (this.phase === 'choosing') return { ...base, phase: 'choosing' };
    if (this.phase === 'prompt') return { ...base, phase: 'prompt', choice: this.choice ?? undefined, prompt: this.prompt };
    let up = 0;
    let down = 0;
    for (const r of this.ratings.values()) (r === 'up' ? up++ : down++);
    if (this.phase === 'rating') {
      return { ...base, phase: 'rating', choice: this.choice ?? undefined, prompt: this.prompt, ratingCounts: { up, down } };
    }
    return { ...base, phase: 'reveal', choice: this.choice ?? undefined, prompt: this.prompt, ratingCounts: { up, down } };
  }

  getPlayerView(playerId: string): DarePlayerView {
    const isActive = playerId === this.currentPlayerId;
    const base = { isActive, currentPlayerName: this.currentName() };
    if (this.phase === 'choosing') return { ...base, phase: 'choosing' };
    if (this.phase === 'prompt') {
      return { ...base, phase: 'prompt', choice: this.choice ?? undefined, prompt: this.prompt };
    }
    if (this.phase === 'rating') {
      return {
        ...base,
        phase: 'rating',
        choice: this.choice ?? undefined,
        prompt: this.prompt,
        canRate: !isActive && !this.ratings.has(playerId),
        yourRating: this.ratings.get(playerId),
      };
    }
    return {
      ...base,
      phase: 'reveal',
      choice: this.choice ?? undefined,
      prompt: this.prompt,
      pointsAwarded: isActive ? this.totalPoints.get(playerId) ?? 0 : undefined,
    };
  }

  destroy(): void {}
}
