import type { EmojiHostView, EmojiPlayerView } from '@splash/shared';
import type { GameContext, GameModule, PlayerActionPayload, PointsAward } from './engine.js';
import { EMOJI_PROMPTS, type EmojiPrompt } from '../data/emojiPrompts.js';
import { isMatch, pickN } from './utils.js';

const TOTAL_ROUNDS = 6;
const TIME_LIMIT_MS = 30000;
const REVEAL_MS = 4500;
const POINTS_TABLE = [300, 200, 150, 100];

export class EmojiGame implements GameModule {
  private ctx: GameContext;
  private prompts: EmojiPrompt[];
  private roundIndex = 0;
  private phase: 'guessing' | 'reveal' = 'guessing';
  private startedAt = 0;
  private solvedOrder: { playerId: string; name: string; ms: number }[] = [];
  private totalPoints = new Map<string, number>();

  constructor(ctx: GameContext) {
    this.ctx = ctx;
    this.prompts = pickN(EMOJI_PROMPTS, TOTAL_ROUNDS);
    this.startRound();
  }

  private get prompt() {
    return this.prompts[this.roundIndex];
  }

  private startRound() {
    this.phase = 'guessing';
    this.startedAt = Date.now();
    this.solvedOrder = [];
    this.ctx.push(this);
    this.ctx.setTimer('emoji-timeout', TIME_LIMIT_MS, () => this.reveal());
  }

  private reveal() {
    this.phase = 'reveal';
    this.solvedOrder.forEach((entry, rank) => {
      const pts = POINTS_TABLE[rank] ?? POINTS_TABLE[POINTS_TABLE.length - 1];
      this.totalPoints.set(entry.playerId, (this.totalPoints.get(entry.playerId) ?? 0) + pts);
    });
    this.ctx.push(this);
    this.ctx.setTimer('emoji-reveal', REVEAL_MS, () => {
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
    if (action.type !== 'guess' || this.phase !== 'guessing') return;
    if (this.solvedOrder.some((e) => e.playerId === playerId)) return;
    const payload = action.payload as { text: string } | undefined;
    const text = payload?.text ?? '';
    if (!isMatch(text, this.prompt.answer, this.prompt.altAnswers)) return;
    const name = this.ctx.players.find((p) => p.id === playerId)?.name ?? '???';
    this.solvedOrder.push({ playerId, name, ms: Date.now() - this.startedAt });
    const connected = this.ctx.connectedPlayers();
    if (connected.every((p) => this.solvedOrder.some((e) => e.playerId === p.id))) {
      this.ctx.clearTimer('emoji-timeout');
      this.reveal();
    } else {
      this.ctx.push(this);
    }
  }

  private timeLeft(): number {
    return Math.max(0, TIME_LIMIT_MS - (Date.now() - this.startedAt));
  }

  getHostView(): EmojiHostView {
    const base = {
      round: this.roundIndex + 1,
      totalRounds: this.prompts.length,
      emojis: this.prompt.emojis,
      solvedOrder: this.solvedOrder.map((e) => ({ name: e.name, ms: e.ms })),
    };
    if (this.phase === 'guessing') return { ...base, phase: 'guessing', timeLeftMs: this.timeLeft() };
    return { ...base, phase: 'reveal', timeLeftMs: 0, answer: this.prompt.answer };
  }

  getPlayerView(playerId: string): EmojiPlayerView {
    const mySolve = this.solvedOrder.findIndex((e) => e.playerId === playerId);
    if (this.phase === 'guessing') {
      return {
        phase: 'guessing',
        emojis: this.prompt.emojis,
        timeLeftMs: this.timeLeft(),
        hasSolved: mySolve >= 0,
        yourRank: mySolve >= 0 ? mySolve + 1 : undefined,
      };
    }
    return {
      phase: 'reveal',
      emojis: this.prompt.emojis,
      timeLeftMs: 0,
      hasSolved: mySolve >= 0,
      yourRank: mySolve >= 0 ? mySolve + 1 : undefined,
      answer: this.prompt.answer,
    };
  }

  destroy(): void {}
}
