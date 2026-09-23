import type { DrawStroke, SketchHostView, SketchPlayerView } from '@splash/shared';
import type { GameContext, GameModule, PlayerActionPayload, PointsAward } from './engine.js';
import { SKETCH_WORDS } from '../data/sketchWords.js';
import { isMatch, pickN, shuffle, wordMask } from './utils.js';

const FALLBACK_POOL = SKETCH_WORDS;
const MAX_ROUNDS = 6;
const CHOOSE_MS = 12000;
const DRAW_MS = 75000;
const REVEAL_MS = 6000;
const MAX_STROKES = 500;

interface GuessEntry {
  name: string;
  text: string;
  correct: boolean;
}

export class SketchGame implements GameModule {
  private ctx: GameContext;
  private drawerOrder: string[];
  private roundIndex = 0;
  private phase: 'choosing' | 'drawing' | 'reveal' = 'choosing';
  private wordChoices: string[] = [];
  private usedWords = new Set<string>();
  private chosenWord: string | null = null;
  private strokes: DrawStroke[] = [];
  private correctGuessers = new Map<string, number>(); // playerId -> ms
  private guessFeed: GuessEntry[] = [];
  private phaseStartedAt = 0;
  private totalPoints = new Map<string, number>();
  private wordPool: string[];

  constructor(ctx: GameContext, pool: string[]) {
    this.ctx = ctx;
    this.wordPool = pool.length >= 3 ? pool : FALLBACK_POOL;
    const ids = ctx.connectedPlayers().map((p) => p.id);
    this.drawerOrder = shuffle(ids).slice(0, Math.min(MAX_ROUNDS, ids.length));
    this.startRound();
  }

  private get drawerId(): string {
    return this.drawerOrder[this.roundIndex];
  }

  private drawerName(): string {
    return this.ctx.players.find((p) => p.id === this.drawerId)?.name ?? '???';
  }

  private startRound() {
    if (this.roundIndex >= this.drawerOrder.length) {
      this.finish();
      return;
    }
    this.phase = 'choosing';
    const pool = this.wordPool.filter((w) => !this.usedWords.has(w));
    this.wordChoices = pickN(pool.length >= 3 ? pool : this.wordPool, 3);
    this.chosenWord = null;
    this.strokes = [];
    this.correctGuessers.clear();
    this.guessFeed = [];
    this.phaseStartedAt = Date.now();
    this.ctx.push(this);
    this.ctx.setTimer('sketch-choose', CHOOSE_MS, () => {
      if (!this.chosenWord) this.chooseWord(0);
    });
  }

  private chooseWord(index: number) {
    this.chosenWord = this.wordChoices[index] ?? this.wordChoices[0];
    this.usedWords.add(this.chosenWord);
    this.phase = 'drawing';
    this.phaseStartedAt = Date.now();
    this.ctx.push(this);
    this.ctx.setTimer('sketch-draw', DRAW_MS, () => this.reveal());
  }

  private reveal() {
    this.phase = 'reveal';
    const word = this.chosenWord ?? '???';
    const guesserIds = [...this.correctGuessers.entries()].sort((a, b) => a[1] - b[1]);
    guesserIds.forEach(([playerId], rank) => {
      const pts = Math.max(100, 300 - rank * 60);
      this.totalPoints.set(playerId, (this.totalPoints.get(playerId) ?? 0) + pts);
    });
    if (guesserIds.length > 0) {
      const drawerPts = 80 * guesserIds.length;
      this.totalPoints.set(this.drawerId, (this.totalPoints.get(this.drawerId) ?? 0) + drawerPts);
    }
    this.ctx.push(this);
    this.ctx.setTimer('sketch-reveal', REVEAL_MS, () => {
      this.roundIndex++;
      this.startRound();
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
    if (this.phase === 'choosing' && action.type === 'choose-word' && playerId === this.drawerId) {
      const payload = action.payload as { index: number } | undefined;
      if (payload && typeof payload.index === 'number') {
        this.ctx.clearTimer('sketch-choose');
        this.chooseWord(payload.index);
      }
      return;
    }
    if (this.phase !== 'drawing') return;
    if (action.type === 'stroke' && playerId === this.drawerId) {
      const stroke = action.payload as DrawStroke | undefined;
      if (stroke && Array.isArray(stroke.points)) {
        this.strokes.push(stroke);
        if (this.strokes.length > MAX_STROKES) this.strokes.shift();
        this.ctx.push(this);
      }
      return;
    }
    if (action.type === 'clear' && playerId === this.drawerId) {
      this.strokes = [];
      this.ctx.push(this);
      return;
    }
    if (action.type === 'guess' && playerId !== this.drawerId && !this.correctGuessers.has(playerId)) {
      const payload = action.payload as { text: string } | undefined;
      const text = (payload?.text ?? '').slice(0, 60);
      if (!text.trim()) return;
      const name = this.ctx.players.find((p) => p.id === playerId)?.name ?? '???';
      const correct = isMatch(text, this.chosenWord ?? '');
      if (correct) {
        this.correctGuessers.set(playerId, Date.now() - this.phaseStartedAt);
        this.guessFeed.push({ name, text: `${name} hat's erraten! 🎉`, correct: true });
        const others = this.ctx.connectedPlayers().filter((p) => p.id !== this.drawerId);
        if (others.every((p) => this.correctGuessers.has(p.id))) {
          this.ctx.clearTimer('sketch-draw');
          this.reveal();
          return;
        }
      } else {
        this.guessFeed.push({ name, text, correct: false });
      }
      if (this.guessFeed.length > 30) this.guessFeed.shift();
      this.ctx.push(this);
    }
  }

  private timeLeft(durationMs: number): number {
    return Math.max(0, durationMs - (Date.now() - this.phaseStartedAt));
  }

  getHostView(): SketchHostView {
    const base = {
      round: this.roundIndex + 1,
      totalRounds: this.drawerOrder.length,
      drawerName: this.drawerName(),
      strokes: this.strokes,
      correctGuessers: [...this.correctGuessers.keys()].map(
        (id) => this.ctx.players.find((p) => p.id === id)?.name ?? '???',
      ),
    };
    if (this.phase === 'choosing') {
      return { ...base, phase: 'choosing', timeLeftMs: this.timeLeft(CHOOSE_MS) };
    }
    if (this.phase === 'drawing') {
      return {
        ...base,
        phase: 'drawing',
        wordMask: wordMask(this.chosenWord ?? ''),
        timeLeftMs: this.timeLeft(DRAW_MS),
      };
    }
    return { ...base, phase: 'reveal', word: this.chosenWord ?? '???', timeLeftMs: 0 };
  }

  getPlayerView(playerId: string): SketchPlayerView {
    const isDrawer = playerId === this.drawerId;
    if (this.phase === 'choosing') {
      return {
        phase: 'choosing',
        isDrawer,
        wordChoices: isDrawer ? this.wordChoices : undefined,
        strokes: [],
        timeLeftMs: this.timeLeft(CHOOSE_MS),
        guesses: [],
      };
    }
    if (this.phase === 'drawing') {
      return {
        phase: 'drawing',
        isDrawer,
        word: isDrawer ? this.chosenWord ?? undefined : undefined,
        wordMask: isDrawer ? undefined : wordMask(this.chosenWord ?? ''),
        strokes: this.strokes,
        hasGuessedCorrectly: this.correctGuessers.has(playerId),
        timeLeftMs: this.timeLeft(DRAW_MS),
        guesses: this.guessFeed.slice(-10),
      };
    }
    return {
      phase: 'reveal',
      isDrawer,
      word: this.chosenWord ?? '???',
      strokes: this.strokes,
      hasGuessedCorrectly: this.correctGuessers.has(playerId),
      timeLeftMs: 0,
      guesses: this.guessFeed.slice(-10),
    };
  }

  destroy(): void {}
}
