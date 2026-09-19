import type { QuizHostView, QuizPlayerView } from '@splash/shared';
import type { GameContext, GameModule, PlayerActionPayload, PointsAward } from './engine.js';
import { TRIVIA_QUESTIONS, type TriviaQuestion } from '../data/triviaQuestions.js';
import { pickN } from './utils.js';

const TOTAL_ROUNDS = 8;
const TIME_LIMIT_MS = 15000;
const REVEAL_MS = 3500;

interface Answer {
  index: number;
  atMs: number;
}

export class QuizGame implements GameModule {
  private ctx: GameContext;
  private questions: TriviaQuestion[];
  private roundIndex = 0;
  private phase: 'question' | 'reveal' = 'question';
  private answers = new Map<string, Answer>();
  private startedAt = 0;
  private totalPoints = new Map<string, number>();
  private lastRoundPoints = new Map<string, number>();

  constructor(ctx: GameContext) {
    this.ctx = ctx;
    this.questions = pickN(TRIVIA_QUESTIONS, TOTAL_ROUNDS);
    this.startRound();
  }

  private get q() {
    return this.questions[this.roundIndex];
  }

  private startRound() {
    this.phase = 'question';
    this.answers.clear();
    this.lastRoundPoints.clear();
    this.startedAt = Date.now();
    this.ctx.push(this);
    this.ctx.setTimer('quiz-question', TIME_LIMIT_MS, () => this.reveal());
  }

  private reveal() {
    this.phase = 'reveal';
    const q = this.q;
    for (const [playerId, ans] of this.answers) {
      if (ans.index === q.correctIndex) {
        const speedBonus = Math.round(500 * (1 - ans.atMs / TIME_LIMIT_MS));
        const pts = 500 + Math.max(0, speedBonus);
        this.lastRoundPoints.set(playerId, pts);
        this.totalPoints.set(playerId, (this.totalPoints.get(playerId) ?? 0) + pts);
      }
    }
    this.ctx.push(this);
    this.ctx.setTimer('quiz-reveal', REVEAL_MS, () => {
      this.roundIndex++;
      if (this.roundIndex >= this.questions.length) {
        this.finish();
      } else {
        this.startRound();
      }
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
    if (action.type !== 'answer' || this.phase !== 'question') return;
    if (this.answers.has(playerId)) return;
    const payload = action.payload as { index: number } | undefined;
    if (!payload || typeof payload.index !== 'number') return;
    if (payload.index < 0 || payload.index >= this.q.options.length) return;
    this.answers.set(playerId, { index: payload.index, atMs: Date.now() - this.startedAt });
    const connected = this.ctx.connectedPlayers();
    if (connected.every((p) => this.answers.has(p.id))) {
      this.ctx.clearTimer('quiz-question');
      this.reveal();
    } else {
      this.ctx.push(this);
    }
  }

  getHostView(): QuizHostView {
    const q = this.q;
    const connected = this.ctx.connectedPlayers();
    if (this.phase === 'question') {
      return {
        phase: 'question',
        round: this.roundIndex + 1,
        totalRounds: this.questions.length,
        question: q.question,
        options: q.options,
        timeLimitMs: TIME_LIMIT_MS,
        startedAt: this.startedAt,
        answeredCount: this.answers.size,
        totalPlayers: connected.length,
      };
    }
    const optionCounts = [0, 0, 0, 0];
    for (const a of this.answers.values()) optionCounts[a.index]++;
    return {
      phase: 'reveal',
      round: this.roundIndex + 1,
      totalRounds: this.questions.length,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      optionCounts,
      answeredCount: this.answers.size,
      totalPlayers: connected.length,
    };
  }

  getPlayerView(playerId: string): QuizPlayerView {
    const q = this.q;
    if (this.phase === 'question') {
      return {
        phase: 'question',
        round: this.roundIndex + 1,
        totalRounds: this.questions.length,
        question: q.question,
        options: q.options,
        timeLimitMs: TIME_LIMIT_MS,
        startedAt: this.startedAt,
        hasAnswered: this.answers.has(playerId),
        yourAnswer: this.answers.get(playerId)?.index,
      };
    }
    return {
      phase: 'reveal',
      round: this.roundIndex + 1,
      totalRounds: this.questions.length,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      yourAnswer: this.answers.get(playerId)?.index,
      pointsAwarded: this.lastRoundPoints.get(playerId) ?? 0,
    };
  }

  destroy(): void {}
}
