import type { BlurtHostView, BlurtPlayerView } from '@splash/shared';
import type { GameContext, GameModule, PlayerActionPayload, PointsAward } from './engine.js';
import { BLURT_CATEGORIES, BLURT_LETTERS } from '../data/blurtCategories.js';
import { normalize, pickOne } from './utils.js';

const TOTAL_ROUNDS = 4;
const TIME_LIMIT_MS = 60000;
const REVEAL_MS = 7000;
const MAX_WORDS_PER_PLAYER = 25;

export class BlurtGame implements GameModule {
  private ctx: GameContext;
  private roundIndex = 0;
  private phase: 'playing' | 'reveal' = 'playing';
  private category = '';
  private letter = '';
  private startedAt = 0;
  private words = new Map<string, string[]>(); // playerId -> words (original casing)
  private totalPoints = new Map<string, number>();
  private lastRoundPoints = new Map<string, number>();

  constructor(ctx: GameContext) {
    this.ctx = ctx;
    this.startRound();
  }

  private startRound() {
    this.phase = 'playing';
    this.category = pickOne(BLURT_CATEGORIES);
    this.letter = pickOne(BLURT_LETTERS);
    this.startedAt = Date.now();
    this.words.clear();
    this.ctx.push(this);
    this.ctx.setTimer('blurt-timeout', TIME_LIMIT_MS, () => this.reveal());
  }

  private reveal() {
    this.phase = 'reveal';
    const wordOwners = new Map<string, string[]>(); // normalized word -> playerIds
    for (const [playerId, list] of this.words) {
      for (const w of list) {
        const n = normalize(w);
        if (!wordOwners.has(n)) wordOwners.set(n, []);
        wordOwners.get(n)!.push(playerId);
      }
    }
    this.lastRoundPoints.clear();
    for (const [playerId, list] of this.words) {
      let total = 0;
      for (const w of list) {
        const owners = wordOwners.get(normalize(w)) ?? [];
        const pts = owners.length <= 1 ? 100 : owners.length === 2 ? 40 : 20;
        total += pts;
      }
      this.lastRoundPoints.set(playerId, total);
      this.totalPoints.set(playerId, (this.totalPoints.get(playerId) ?? 0) + total);
    }
    this.ctx.push(this);
    this.ctx.setTimer('blurt-reveal', REVEAL_MS, () => {
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
    if (this.phase !== 'playing') return;
    if (action.type === 'add-word') {
      const payload = action.payload as { text: string } | undefined;
      const text = (payload?.text ?? '').trim();
      if (!text || text.length < 2) return;
      if (!normalize(text).startsWith(this.letter.toLowerCase())) return;
      const list = this.words.get(playerId) ?? [];
      if (list.length >= MAX_WORDS_PER_PLAYER) return;
      if (list.some((w) => normalize(w) === normalize(text))) return;
      list.push(text.slice(0, 24));
      this.words.set(playerId, list);
      this.ctx.push(this);
      return;
    }
    if (action.type === 'remove-word') {
      const payload = action.payload as { text: string } | undefined;
      const list = this.words.get(playerId);
      if (!list || !payload?.text) return;
      this.words.set(
        playerId,
        list.filter((w) => normalize(w) !== normalize(payload.text)),
      );
      this.ctx.push(this);
    }
  }

  private timeLeft(): number {
    return Math.max(0, TIME_LIMIT_MS - (Date.now() - this.startedAt));
  }

  getHostView(): BlurtHostView {
    const base = { round: this.roundIndex + 1, totalRounds: TOTAL_ROUNDS, category: this.category, letter: this.letter };
    if (this.phase === 'playing') {
      const wordCounts = this.ctx.players.map((p) => ({ playerId: p.id, name: p.name, count: this.words.get(p.id)?.length ?? 0 }));
      return { ...base, phase: 'playing', timeLeftMs: this.timeLeft(), wordCounts };
    }
    const wordOwners = new Map<string, string[]>();
    for (const [playerId, list] of this.words) {
      for (const w of list) {
        const n = normalize(w);
        if (!wordOwners.has(n)) wordOwners.set(n, []);
        wordOwners.get(n)!.push(playerId);
      }
    }
    const reveal = this.ctx.players.map((p) => {
      const list = this.words.get(p.id) ?? [];
      const words = list.map((w) => {
        const owners = wordOwners.get(normalize(w)) ?? [];
        return { text: w, uniquePoints: owners.length <= 1 ? 100 : owners.length === 2 ? 40 : 20 };
      });
      return { playerId: p.id, name: p.name, words, total: words.reduce((s, w) => s + w.uniquePoints, 0) };
    });
    return { ...base, phase: 'reveal', timeLeftMs: 0, reveal };
  }

  getPlayerView(playerId: string): BlurtPlayerView {
    const base = { category: this.category, letter: this.letter, yourWords: this.words.get(playerId) ?? [] };
    if (this.phase === 'playing') return { ...base, phase: 'playing', timeLeftMs: this.timeLeft() };
    return { ...base, phase: 'reveal', timeLeftMs: 0, pointsAwarded: this.lastRoundPoints.get(playerId) ?? 0 };
  }

  destroy(): void {}
}
