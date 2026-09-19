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

export const GAME_FACTORIES: Record<string, GameFactory> = {
  quiz: (ctx: GameContext) => new QuizGame(ctx),
  sketch: (ctx: GameContext) => new SketchGame(ctx),
  wyr: (ctx: GameContext) => new WyrGame(ctx),
  mostlikely: (ctx: GameContext) => new MostLikelyGame(ctx),
  quiplash: (ctx: GameContext) => new QuiplashGame(ctx),
  impostor: (ctx: GameContext) => new ImpostorGame(ctx),
  reaction: (ctx: GameContext) => new ReactionGame(ctx),
  emoji: (ctx: GameContext) => new EmojiGame(ctx),
  blurt: (ctx: GameContext) => new BlurtGame(ctx),
  dare: (ctx: GameContext) => new DareGame(ctx),
};

export * from './engine.js';
