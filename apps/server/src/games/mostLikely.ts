import type { MostLikelyCandidate, MostLikelyHostView, MostLikelyPlayerView } from '@splash/shared';
import type { GameContext, GameModule, PlayerActionPayload, PointsAward } from './engine.js';
import { MOST_LIKELY_PROMPTS } from '../data/mostLikelyPrompts.js';
import { pickN } from './utils.js';

const FALLBACK_POOL = MOST_LIKELY_PROMPTS;
const TOTAL_ROUNDS = 6;
const VOTE_MS = 15000;
const REVEAL_MS = 5000;

export class MostLikelyGame implements GameModule {
  private ctx: GameContext;
  private prompts: string[];
  private roundIndex = 0;
  private phase: 'voting' | 'reveal' = 'voting';
  private votes = new Map<string, string>(); // voterId -> candidateId
  private totalPoints = new Map<string, number>();

  constructor(ctx: GameContext, pool: string[]) {
    this.ctx = ctx;
    this.prompts = pickN(pool.length > 0 ? pool : FALLBACK_POOL, TOTAL_ROUNDS);
    this.startRound();
  }

  private candidates(): MostLikelyCandidate[] {
    return this.ctx.connectedPlayers().map((p) => ({ playerId: p.id, name: p.name, avatarEmoji: p.avatarEmoji }));
  }

  private startRound() {
    this.phase = 'voting';
    this.votes.clear();
    this.ctx.push(this);
    this.ctx.setTimer('ml-vote', VOTE_MS, () => this.reveal());
  }

  private tally(): Record<string, number> {
    const tally: Record<string, number> = {};
    for (const cand of this.votes.values()) tally[cand] = (tally[cand] ?? 0) + 1;
    return tally;
  }

  private reveal() {
    this.phase = 'reveal';
    const tally = this.tally();
    let winnerId: string | null = null;
    let winnerVotes = -1;
    for (const [cand, votes] of Object.entries(tally)) {
      if (votes > winnerVotes) {
        winnerVotes = votes;
        winnerId = cand;
      }
    }
    for (const voterId of this.votes.keys()) {
      this.totalPoints.set(voterId, (this.totalPoints.get(voterId) ?? 0) + 30);
    }
    if (winnerId) {
      this.totalPoints.set(winnerId, (this.totalPoints.get(winnerId) ?? 0) + 150);
    }
    this.ctx.push(this);
    this.ctx.setTimer('ml-reveal', REVEAL_MS, () => {
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
    const payload = action.payload as { candidateId: string } | undefined;
    if (!payload?.candidateId || payload.candidateId === playerId) return;
    if (!this.ctx.players.some((p) => p.id === payload.candidateId)) return;
    this.votes.set(playerId, payload.candidateId);
    const connected = this.ctx.connectedPlayers();
    if (connected.every((p) => this.votes.has(p.id))) {
      this.ctx.clearTimer('ml-vote');
      this.reveal();
    } else {
      this.ctx.push(this);
    }
  }

  getHostView(): MostLikelyHostView {
    const connected = this.ctx.connectedPlayers();
    const base = {
      round: this.roundIndex + 1,
      totalRounds: this.prompts.length,
      prompt: this.prompts[this.roundIndex],
      candidates: this.candidates(),
      answeredCount: this.votes.size,
      totalPlayers: connected.length,
    };
    if (this.phase === 'voting') return { ...base, phase: 'voting' };
    const tally = this.tally();
    let winnerId: string | null = null;
    let winnerVotes = -1;
    for (const [cand, votes] of Object.entries(tally)) {
      if (votes > winnerVotes) {
        winnerVotes = votes;
        winnerId = cand;
      }
    }
    const winnerName = this.ctx.players.find((p) => p.id === winnerId)?.name;
    return {
      ...base,
      phase: 'reveal',
      votesByCandidate: tally,
      winner: winnerName ? { name: winnerName, votes: winnerVotes } : undefined,
    };
  }

  getPlayerView(playerId: string): MostLikelyPlayerView {
    const base = { prompt: this.prompts[this.roundIndex], candidates: this.candidates() };
    if (this.phase === 'voting') {
      return { ...base, phase: 'voting', yourVote: this.votes.get(playerId) };
    }
    const tally = this.tally();
    let winnerId: string | null = null;
    let winnerVotes = -1;
    for (const [cand, votes] of Object.entries(tally)) {
      if (votes > winnerVotes) {
        winnerVotes = votes;
        winnerId = cand;
      }
    }
    const winnerName = this.ctx.players.find((p) => p.id === winnerId)?.name;
    return {
      ...base,
      phase: 'reveal',
      yourVote: this.votes.get(playerId),
      winner: winnerName ? { name: winnerName, votes: winnerVotes } : undefined,
    };
  }

  destroy(): void {}
}
