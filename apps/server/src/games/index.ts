import type { GameContext, GameFactory } from './engine.js';
import { QuizGame } from './quiz.js';
import { SketchGame } from './sketch.js';
import { WyrGame } from './wyr.js';
import { MostLikelyGame } from './mostLikely.js';
import { QuiplashGame } from './quiplash.js';
import { ImpostorGame } from './impostor.js';
import { ReactionGame } from './reaction.js';
import { EmojiGame } from './emoji.js';
import { BlurtGame } from './blurt.js';
import { DareGame } from './dare.js';
import type { TriviaQuestion } from '../data/triviaQuestions.js';
import type { WyrPrompt } from '../data/wyrPrompts.js';
import type { ImpostorWordSet } from '../data/impostorWords.js';
import type { EmojiPrompt } from '../data/emojiPrompts.js';

export const GAME_FACTORIES: Record<string, GameFactory> = {
  quiz: (ctx: GameContext, pool: unknown[]) => new QuizGame(ctx, pool as TriviaQuestion[]),
  sketch: (ctx: GameContext, pool: unknown[]) => new SketchGame(ctx, pool as string[]),
  wyr: (ctx: GameContext, pool: unknown[]) => new WyrGame(ctx, pool as WyrPrompt[]),
  mostlikely: (ctx: GameContext, pool: unknown[]) => new MostLikelyGame(ctx, pool as string[]),
  quiplash: (ctx: GameContext, pool: unknown[]) => new QuiplashGame(ctx, pool as string[]),
  impostor: (ctx: GameContext, pool: unknown[]) => new ImpostorGame(ctx, pool as ImpostorWordSet[]),
  reaction: (ctx: GameContext) => new ReactionGame(ctx),
  emoji: (ctx: GameContext, pool: unknown[]) => new EmojiGame(ctx, pool as EmojiPrompt[]),
  blurt: (ctx: GameContext, pool: unknown[]) => new BlurtGame(ctx, pool as string[]),
  dare: (ctx: GameContext, pool: unknown[]) => new DareGame(ctx, pool as { kind: 'truth' | 'dare'; text: string }[]),
};

export * from './engine.js';
