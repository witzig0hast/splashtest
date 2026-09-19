import type { ImpostorHostView, ImpostorPlayerView } from '@splash/shared';
import type { GameContext, GameModule, PlayerActionPayload, PointsAward } from './engine.js';
import { IMPOSTOR_WORD_SETS, type ImpostorWordSet } from '../data/impostorWords.js';
import { isMatch, pickN, shuffle } from './utils.js';

const TOTAL_ROUNDS = 3;
const CLUE_TURN_MS = 20000;
const VOTE_MS = 20000;
const GUESS_WINDOW_MS = 12000;
const REVEAL_MS = 6000;

export class ImpostorGame implements GameModule {
  private ctx: GameContext;
  private wordSets: ImpostorWordSet[];
  private roundIndex = 0;
  private phase: 'clue' | 'voting' | 'reveal' = 'clue';
  private impostorIds = new Set<string>();
  private clueOrder: string[] = [];
  private clueIndex = 0;
  private clues = new Map<string, string>();
  private votes = new Map<string, string>();
  private impostorGuess: { text: string; correct: boolean } | null = null;
  private caught = false;
  private totalPoints = new Map<string, number>();

  constructor(ctx: GameContext) {
    this.ctx = ctx;
    this.wordSets = pickN(IMPOSTOR_WORD_SETS, TOTAL_ROUNDS);
    this.startRound();
  }

  private get wordSet() {
    return this.wordSets[this.roundIndex];
  }

  private startRound() {
    this.phase = 'clue';
    const ids = shuffle(this.ctx.connectedPlayers().map((p) => p.id));
    const impostorCount = ids.length >= 8 ? 2 : 1;
    this.impostorIds = new Set(ids.slice(0, impostorCount));
    this.clueOrder = shuffle(ids);
    this.clueIndex = 0;
    this.clues.clear();
    this.votes.clear();
    this.impostorGuess = null;
    this.caught = false;
    this.ctx.push(this);
    this.armClueTimer();
  }

  private armClueTimer() {
    this.ctx.setTimer('imp-clue', CLUE_TURN_MS, () => {
      const pid = this.clueOrder[this.clueIndex];
      if (pid && !this.clues.has(pid)) this.clues.set(pid, '🤷');
      this.advanceClue();
    });
  }

  private advanceClue() {
    this.clueIndex++;
    if (this.clueIndex >= this.clueOrder.length) {
      this.startVoting();
    } else {
      this.ctx.push(this);
      this.armClueTimer();
    }
  }

  private startVoting() {
    this.phase = 'voting';
    this.ctx.push(this);
    this.ctx.setTimer('imp-vote', VOTE_MS, () => this.reveal());
  }

  private tally(): Record<string, number> {
    const t: Record<string, number> = {};
    for (const suspect of this.votes.values()) t[suspect] = (t[suspect] ?? 0) + 1;
    return t;
  }

  private reveal() {
    this.phase = 'reveal';
    const tally = this.tally();
    let mostVoted: string | null = null;
    let mostVotes = -1;
    for (const [suspect, votes] of Object.entries(tally)) {
      if (votes > mostVotes) {
        mostVotes = votes;
        mostVoted = suspect;
      }
    }
    this.caught = !!mostVoted && this.impostorIds.has(mostVoted);
    this.ctx.push(this);
    if (this.caught && this.impostorIds.size === 1) {
      this.ctx.setTimer('imp-guess-window', GUESS_WINDOW_MS, () => this.finishRound());
    } else {
      this.ctx.setTimer('imp-reveal', REVEAL_MS, () => this.finishRound());
    }
  }

  private finishRound() {
    for (const p of this.ctx.connectedPlayers()) {
      const isImpostor = this.impostorIds.has(p.id);
      let pts = 0;
      if (isImpostor) {
        pts = this.caught ? (this.impostorGuess?.correct ? 250 : 0) : 250;
      } else {
        pts = this.caught ? 150 : 25;
      }
      this.totalPoints.set(p.id, (this.totalPoints.get(p.id) ?? 0) + pts);
    }
    this.roundIndex++;
    if (this.roundIndex >= this.wordSets.length) this.finish();
    else this.startRound();
  }

  private finish() {
    const awards: PointsAward[] = this.ctx.players.map((p) => ({
      playerId: p.id,
      pointsAwarded: this.totalPoints.get(p.id) ?? 0,
    }));
    this.ctx.finishGame(awards);
  }

  onPlayerAction(playerId: string, action: PlayerActionPayload): void {
    if (action.type === 'submit-clue' && this.phase === 'clue') {
      if (this.clueOrder[this.clueIndex] !== playerId || this.clues.has(playerId)) return;
      const payload = action.payload as { clue: string } | undefined;
      const clue = (payload?.clue ?? '').trim().slice(0, 30);
      if (!clue) return;
      this.clues.set(playerId, clue);
      this.ctx.clearTimer('imp-clue');
      this.advanceClue();
      return;
    }
    if (action.type === 'vote' && this.phase === 'voting' && !this.votes.has(playerId)) {
      const payload = action.payload as { suspectId: string } | undefined;
      if (!payload?.suspectId || payload.suspectId === playerId) return;
      if (!this.ctx.players.some((p) => p.id === payload.suspectId)) return;
      this.votes.set(playerId, payload.suspectId);
      const connected = this.ctx.connectedPlayers();
      if (connected.every((p) => this.votes.has(p.id))) {
        this.ctx.clearTimer('imp-vote');
        this.reveal();
      } else {
        this.ctx.push(this);
      }
      return;
    }
    if (
      action.type === 'guess-word' &&
      this.phase === 'reveal' &&
      this.caught &&
      this.impostorIds.has(playerId) &&
      !this.impostorGuess
    ) {
      const payload = action.payload as { guess: string } | undefined;
      const guess = payload?.guess ?? '';
      this.impostorGuess = { text: guess, correct: isMatch(guess, this.wordSet.word) };
      this.ctx.clearTimer('imp-guess-window');
      this.ctx.push(this);
      this.ctx.setTimer('imp-reveal', REVEAL_MS, () => this.finishRound());
    }
  }

  private nameOf(id: string): string {
    return this.ctx.players.find((p) => p.id === id)?.name ?? '???';
  }

  getHostView(): ImpostorHostView {
    const clueOrder = this.clueOrder.map((id) => ({ playerId: id, name: this.nameOf(id), clue: this.clues.get(id) }));
    const base = {
      round: this.roundIndex + 1,
      totalRounds: this.wordSets.length,
      category: this.wordSet.category,
      clueOrder,
    };
    if (this.phase === 'clue') {
      return { ...base, phase: 'clue', currentClueTurnPlayerId: this.clueOrder[this.clueIndex] };
    }
    if (this.phase === 'voting') {
      return { ...base, phase: 'voting', votingTally: this.tally() };
    }
    return {
      ...base,
      phase: 'reveal',
      votingTally: this.tally(),
      revealedImpostorIds: [...this.impostorIds],
      word: this.wordSet.word,
      impostorGuess: this.impostorGuess ?? undefined,
    };
  }

  getPlayerView(playerId: string): ImpostorPlayerView {
    const isImpostor = this.impostorIds.has(playerId);
    const clues = this.clueOrder
      .filter((id) => this.clues.has(id))
      .map((id) => ({ name: this.nameOf(id), clue: this.clues.get(id) ?? '' }));
    const base = {
      isImpostor,
      category: this.wordSet.category,
      word: isImpostor ? undefined : this.wordSet.word,
      clues,
    };
    if (this.phase === 'clue') {
      return { ...base, phase: 'clue', isYourTurnToClue: this.clueOrder[this.clueIndex] === playerId };
    }
    if (this.phase === 'voting') {
      const candidates = this.ctx.players.filter((p) => p.id !== playerId).map((p) => ({ playerId: p.id, name: p.name }));
      return { ...base, phase: 'voting', candidates, yourVote: this.votes.get(playerId) };
    }
    const wasCaught = this.caught && isImpostor;
    const pointsAwarded = isImpostor
      ? this.caught
        ? this.impostorGuess?.correct
          ? 250
          : 0
        : 250
      : this.caught
        ? 150
        : 25;
    return {
      ...base,
      phase: 'reveal',
      word: this.wordSet.word,
      result: { wasCaught, pointsAwarded },
    };
  }

  destroy(): void {}
}
