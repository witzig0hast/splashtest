import type { QuiplashHostView, QuiplashPlayerView } from '@splash/shared';
import type { GameContext, GameModule, PlayerActionPayload, PointsAward } from './engine.js';
import { QUIPLASH_PROMPTS } from '../data/quiplashPrompts.js';
import { pickN, shuffle } from './utils.js';

const TOTAL_ROUNDS = 5;
const WRITE_MS = 25000;
const VOTE_MS = 18000;
const REVEAL_MS = 6000;

export class QuiplashGame implements GameModule {
  private ctx: GameContext;
  private prompts: string[];
  private roundIndex = 0;
  private phase: 'writing' | 'voting' | 'reveal' = 'writing';
  private answers = new Map<string, string>(); // playerId -> text
  private answerOrder: string[] = [];
  private votes = new Map<string, string>(); // voterId -> answerOwnerId
  private totalPoints = new Map<string, number>();

  constructor(ctx: GameContext) {
    this.ctx = ctx;
    this.prompts = pickN(QUIPLASH_PROMPTS, TOTAL_ROUNDS);
    this.startRound();
  }

  private startRound() {
    this.phase = 'writing';
    this.answers.clear();
    this.answerOrder = [];
    this.votes.clear();
    this.ctx.push(this);
    this.ctx.setTimer('ql-write', WRITE_MS, () => this.startVoting());
  }

  private startVoting() {
    this.phase = 'voting';
    this.answerOrder = shuffle([...this.answers.keys()]);
    this.ctx.push(this);
    if (this.answerOrder.length < 2) {
      this.reveal();
      return;
    }
    this.ctx.setTimer('ql-vote', VOTE_MS, () => this.reveal());
  }

  private reveal() {
    this.phase = 'reveal';
    const voteCounts = new Map<string, number>();
    for (const ownerId of this.votes.values()) {
      voteCounts.set(ownerId, (voteCounts.get(ownerId) ?? 0) + 1);
    }
    for (const [ownerId, count] of voteCounts) {
      this.totalPoints.set(ownerId, (this.totalPoints.get(ownerId) ?? 0) + count * 120);
    }
    this.ctx.push(this);
    this.ctx.setTimer('ql-reveal', REVEAL_MS, () => {
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
    if (action.type === 'submit' && this.phase === 'writing' && !this.answers.has(playerId)) {
      const payload = action.payload as { text: string } | undefined;
      const text = (payload?.text ?? '').trim().slice(0, 80);
      if (!text) return;
      this.answers.set(playerId, text);
      const connected = this.ctx.connectedPlayers();
      if (connected.every((p) => this.answers.has(p.id))) {
        this.ctx.clearTimer('ql-write');
        this.startVoting();
      } else {
        this.ctx.push(this);
      }
      return;
    }
    if (action.type === 'vote' && this.phase === 'voting' && !this.votes.has(playerId)) {
      const payload = action.payload as { answerId: string } | undefined;
      const ownerId = payload?.answerId;
      if (!ownerId || ownerId === playerId || !this.answers.has(ownerId)) return;
      this.votes.set(playerId, ownerId);
      const eligibleVoters = this.ctx.connectedPlayers();
      if (eligibleVoters.every((p) => this.votes.has(p.id))) {
        this.ctx.clearTimer('ql-vote');
        this.reveal();
      } else {
        this.ctx.push(this);
      }
    }
  }

  private nameOf(id: string): string {
    return this.ctx.players.find((p) => p.id === id)?.name ?? '???';
  }

  getHostView(): QuiplashHostView {
    const connected = this.ctx.connectedPlayers();
    const base = { round: this.roundIndex + 1, totalRounds: this.prompts.length, prompt: this.prompts[this.roundIndex] };
    if (this.phase === 'writing') {
      return { ...base, phase: 'writing', submittedCount: this.answers.size, totalPlayers: connected.length };
    }
    if (this.phase === 'voting') {
      return {
        ...base,
        phase: 'voting',
        answers: this.answerOrder.map((id) => ({ id, text: this.answers.get(id) ?? '' })),
        votedCount: this.votes.size,
        totalPlayers: connected.length,
      };
    }
    const voteCounts = new Map<string, number>();
    for (const ownerId of this.votes.values()) voteCounts.set(ownerId, (voteCounts.get(ownerId) ?? 0) + 1);
    const reveal = this.answerOrder
      .map((id) => ({ id, text: this.answers.get(id) ?? '', authorName: this.nameOf(id), votes: voteCounts.get(id) ?? 0 }))
      .sort((a, b) => b.votes - a.votes);
    return { ...base, phase: 'reveal', reveal };
  }

  getPlayerView(playerId: string): QuiplashPlayerView {
    const prompt = this.prompts[this.roundIndex];
    if (this.phase === 'writing') {
      return { phase: 'writing', prompt, hasSubmitted: this.answers.has(playerId) };
    }
    if (this.phase === 'voting') {
      const choices = this.answerOrder
        .filter((id) => id !== playerId)
        .map((id) => ({ id, text: this.answers.get(id) ?? '' }));
      if (choices.length === 0) {
        return { phase: 'waiting', prompt };
      }
      return { phase: 'voting', prompt, votingChoices: choices, hasVoted: this.votes.has(playerId) };
    }
    const voteCounts = new Map<string, number>();
    for (const ownerId of this.votes.values()) voteCounts.set(ownerId, (voteCounts.get(ownerId) ?? 0) + 1);
    const reveal = this.answerOrder
      .map((id) => ({
        id,
        text: this.answers.get(id) ?? '',
        authorName: this.nameOf(id),
        votes: voteCounts.get(id) ?? 0,
        isYours: id === playerId,
      }))
      .sort((a, b) => b.votes - a.votes);
    return { phase: 'reveal', prompt, reveal, pointsAwarded: (voteCounts.get(playerId) ?? 0) * 120 };
  }

  destroy(): void {}
}
