// View + action contracts for every mini-game. The server produces the
// Host/Player views; the web client casts `unknown` game state to these
// shapes based on the active `gameId`.

/* ---------- Quiz-Blitz (trivia) ---------- */
export interface QuizHostView {
  phase: 'question' | 'reveal' | 'leaderboard';
  round: number;
  totalRounds: number;
  question?: string;
  options?: string[];
  timeLimitMs?: number;
  startedAt?: number;
  answeredCount?: number;
  totalPlayers?: number;
  correctIndex?: number;
  optionCounts?: number[];
  leaderboard?: { playerId: string; name: string; score: number }[];
}
export interface QuizPlayerView {
  phase: 'question' | 'reveal' | 'waiting';
  round: number;
  totalRounds: number;
  question?: string;
  options?: string[];
  timeLimitMs?: number;
  startedAt?: number;
  hasAnswered?: boolean;
  yourAnswer?: number;
  correctIndex?: number;
  pointsAwarded?: number;
}
export type QuizPlayerAction = { type: 'answer'; payload: { index: number } };

/* ---------- Kritzel-Duell (sketch & guess) ---------- */
export interface DrawPoint {
  x: number;
  y: number;
}
export interface DrawStroke {
  color: string;
  size: number;
  points: DrawPoint[];
}
export interface SketchHostView {
  phase: 'choosing' | 'drawing' | 'reveal';
  round: number;
  totalRounds: number;
  drawerName: string;
  wordMask?: string;
  strokes: DrawStroke[];
  timeLeftMs: number;
  correctGuessers: string[];
  word?: string;
}
export interface SketchPlayerView {
  phase: 'choosing' | 'drawing' | 'reveal';
  isDrawer: boolean;
  wordChoices?: string[];
  wordMask?: string;
  word?: string;
  strokes: DrawStroke[];
  hasGuessedCorrectly?: boolean;
  timeLeftMs: number;
  guesses: { name: string; text: string; correct: boolean }[];
}
export type SketchPlayerAction =
  | { type: 'choose-word'; payload: { index: number } }
  | { type: 'stroke'; payload: DrawStroke }
  | { type: 'clear' }
  | { type: 'guess'; payload: { text: string } };

/* ---------- Würdest-du-eher (would you rather) ---------- */
export interface WyrHostView {
  phase: 'voting' | 'reveal';
  round: number;
  totalRounds: number;
  optionA: string;
  optionB: string;
  votesA?: number;
  votesB?: number;
  answeredCount: number;
  totalPlayers: number;
}
export interface WyrPlayerView {
  phase: 'voting' | 'reveal';
  optionA: string;
  optionB: string;
  yourVote?: 'A' | 'B';
  votesA?: number;
  votesB?: number;
}
export type WyrPlayerAction = { type: 'vote'; payload: { choice: 'A' | 'B' } };

/* ---------- Am ehesten... (most likely to) ---------- */
export interface MostLikelyCandidate {
  playerId: string;
  name: string;
  avatarEmoji: string;
}
export interface MostLikelyHostView {
  phase: 'voting' | 'reveal';
  round: number;
  totalRounds: number;
  prompt: string;
  candidates: MostLikelyCandidate[];
  votesByCandidate?: Record<string, number>;
  answeredCount: number;
  totalPlayers: number;
  winner?: { name: string; votes: number };
}
export interface MostLikelyPlayerView {
  phase: 'voting' | 'reveal';
  prompt: string;
  candidates: MostLikelyCandidate[];
  yourVote?: string;
  winner?: { name: string; votes: number };
}
export type MostLikelyPlayerAction = { type: 'vote'; payload: { candidateId: string } };

/* ---------- Wortgefecht (prompt + anonymous vote) ---------- */
export interface QuiplashHostView {
  phase: 'writing' | 'voting' | 'reveal';
  round: number;
  totalRounds: number;
  prompt: string;
  submittedCount?: number;
  totalPlayers?: number;
  votedCount?: number;
  answers?: { id: string; text: string }[];
  reveal?: { id: string; text: string; authorName: string; votes: number }[];
}
export interface QuiplashPlayerView {
  phase: 'writing' | 'voting' | 'reveal' | 'waiting';
  prompt: string;
  hasSubmitted?: boolean;
  votingChoices?: { id: string; text: string }[];
  hasVoted?: boolean;
  reveal?: { id: string; text: string; authorName: string; votes: number; isYours: boolean }[];
  pointsAwarded?: number;
}
export type QuiplashPlayerAction =
  | { type: 'submit'; payload: { text: string } }
  | { type: 'vote'; payload: { answerId: string } };

/* ---------- Impostor (secret word / spy) ---------- */
export interface ImpostorHostView {
  phase: 'clue' | 'voting' | 'reveal';
  round: number;
  totalRounds: number;
  category: string;
  clueOrder: { playerId: string; name: string; clue?: string }[];
  currentClueTurnPlayerId?: string;
  votingTally?: Record<string, number>;
  revealedImpostorIds?: string[];
  word?: string;
  impostorGuess?: { text: string; correct: boolean };
}
export interface ImpostorPlayerView {
  phase: 'clue' | 'voting' | 'reveal';
  isImpostor: boolean;
  category: string;
  word?: string;
  isYourTurnToClue?: boolean;
  clues: { name: string; clue: string }[];
  candidates?: { playerId: string; name: string }[];
  yourVote?: string;
  result?: { wasCaught: boolean; pointsAwarded: number };
}
export type ImpostorPlayerAction =
  | { type: 'submit-clue'; payload: { clue: string } }
  | { type: 'vote'; payload: { suspectId: string } }
  | { type: 'guess-word'; payload: { guess: string } };

/* ---------- Blitzreflex (reaction tap) ---------- */
export interface ReactionHostView {
  phase: 'waiting' | 'go' | 'results';
  round: number;
  totalRounds: number;
  tappedCount: number;
  totalPlayers: number;
  rankings?: { playerId: string; name: string; ms: number | null; falseStart: boolean }[];
}
export interface ReactionPlayerView {
  phase: 'waiting' | 'go' | 'done' | 'results';
  hasTapped?: boolean;
  falseStart?: boolean;
  yourResult?: { ms: number | null; falseStart: boolean; rank?: number };
}
export type ReactionPlayerAction = { type: 'tap' };

/* ---------- Emoji-Raetsel (emoji charades) ---------- */
export interface EmojiHostView {
  phase: 'guessing' | 'reveal';
  round: number;
  totalRounds: number;
  emojis: string;
  timeLeftMs: number;
  solvedOrder: { name: string; ms: number }[];
  answer?: string;
}
export interface EmojiPlayerView {
  phase: 'guessing' | 'reveal';
  emojis: string;
  timeLeftMs: number;
  hasSolved?: boolean;
  yourRank?: number;
  answer?: string;
}
export type EmojiPlayerAction = { type: 'guess'; payload: { text: string } };

/* ---------- Kategorie-Blitz (category blurt) ---------- */
export interface BlurtHostView {
  phase: 'playing' | 'reveal';
  round: number;
  totalRounds: number;
  category: string;
  letter: string;
  timeLeftMs: number;
  wordCounts?: { playerId: string; name: string; count: number }[];
  reveal?: {
    playerId: string;
    name: string;
    words: { text: string; uniquePoints: number }[];
    total: number;
  }[];
}
export interface BlurtPlayerView {
  phase: 'playing' | 'reveal';
  category: string;
  letter: string;
  timeLeftMs: number;
  yourWords: string[];
  pointsAwarded?: number;
}
export type BlurtPlayerAction =
  | { type: 'add-word'; payload: { text: string } }
  | { type: 'remove-word'; payload: { text: string } };

/* ---------- Wahrheit oder Pflicht ---------- */
export interface DareHostView {
  phase: 'choosing' | 'prompt' | 'rating' | 'reveal';
  round: number;
  totalRounds: number;
  currentPlayerName: string;
  choice?: 'truth' | 'dare';
  prompt?: string;
  ratingCounts?: { up: number; down: number };
}
export interface DarePlayerView {
  phase: 'choosing' | 'prompt' | 'rating' | 'reveal';
  isActive: boolean;
  currentPlayerName: string;
  choice?: 'truth' | 'dare';
  prompt?: string;
  canRate?: boolean;
  yourRating?: 'up' | 'down';
  pointsAwarded?: number;
}
export type DarePlayerAction =
  | { type: 'choose'; payload: { choice: 'truth' | 'dare' } }
  | { type: 'done' }
  | { type: 'rate'; payload: { rating: 'up' | 'down' } };
