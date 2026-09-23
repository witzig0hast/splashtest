import { TRIVIA_QUESTIONS, TRIVIA_QUESTIONS_JUGENDLICH } from '../data/triviaQuestions.js';
import { SKETCH_WORDS, SKETCH_WORDS_JUGENDLICH } from '../data/sketchWords.js';
import { WYR_PROMPTS, WYR_PROMPTS_JUGENDLICH } from '../data/wyrPrompts.js';
import { MOST_LIKELY_PROMPTS, MOST_LIKELY_PROMPTS_JUGENDLICH } from '../data/mostLikelyPrompts.js';
import { QUIPLASH_PROMPTS, QUIPLASH_PROMPTS_JUGENDLICH } from '../data/quiplashPrompts.js';
import { IMPOSTOR_WORD_SETS, IMPOSTOR_WORD_SETS_JUGENDLICH } from '../data/impostorWords.js';
import { EMOJI_PROMPTS, EMOJI_PROMPTS_JUGENDLICH } from '../data/emojiPrompts.js';
import { BLURT_CATEGORIES, BLURT_CATEGORIES_JUGENDLICH } from '../data/blurtCategories.js';
import { TRUTH_PROMPTS, TRUTH_PROMPTS_JUGENDLICH, DARE_PROMPTS, DARE_PROMPTS_JUGENDLICH } from '../data/darePrompts.js';

export interface ContentSpec {
  gameId: string;
  gameName: string;
  itemSchemaHint: string;
  exampleItem: unknown;
  countNeeded: number;
  validate: (item: unknown) => boolean;
  classicPool: () => unknown[];
  jugendlichPool: () => unknown[];
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function dareItems(truths: string[], dares: string[]): { kind: 'truth' | 'dare'; text: string }[] {
  return [...truths.map((text) => ({ kind: 'truth' as const, text })), ...dares.map((text) => ({ kind: 'dare' as const, text }))];
}

export const CONTENT_SPECS: Record<string, ContentSpec> = {
  quiz: {
    gameId: 'quiz',
    gameName: 'Quiz-Blitz',
    itemSchemaHint: '{ "question": string, "options": [string, string, string, string], "correctIndex": 0-3 }',
    exampleItem: { question: 'Welche Farbe hat der Himmel?', options: ['Grün', 'Blau', 'Rot', 'Gelb'], correctIndex: 1 },
    countNeeded: 8,
    validate: (it) =>
      isObj(it) &&
      typeof it.question === 'string' &&
      Array.isArray(it.options) &&
      it.options.length === 4 &&
      it.options.every((o) => typeof o === 'string') &&
      typeof it.correctIndex === 'number' &&
      it.correctIndex >= 0 &&
      it.correctIndex <= 3,
    classicPool: () => TRIVIA_QUESTIONS,
    jugendlichPool: () => TRIVIA_QUESTIONS_JUGENDLICH,
  },
  sketch: {
    gameId: 'sketch',
    gameName: 'Kritzel-Duell',
    itemSchemaHint: 'string (ein einzelnes, gut zeichenbares Wort)',
    exampleItem: 'Roboter',
    countNeeded: 6,
    validate: (it) => typeof it === 'string' && it.trim().length > 0 && it.trim().length <= 24,
    classicPool: () => SKETCH_WORDS,
    jugendlichPool: () => SKETCH_WORDS_JUGENDLICH,
  },
  wyr: {
    gameId: 'wyr',
    gameName: 'Würdest du eher...',
    itemSchemaHint: '{ "a": string, "b": string } (zwei Optionen ohne "Würdest du eher")',
    exampleItem: { a: 'nur noch Pizza essen', b: 'nur noch Pasta essen' },
    countNeeded: 6,
    validate: (it) => isObj(it) && typeof it.a === 'string' && typeof it.b === 'string',
    classicPool: () => WYR_PROMPTS,
    jugendlichPool: () => WYR_PROMPTS_JUGENDLICH,
  },
  mostlikely: {
    gameId: 'mostlikely',
    gameName: 'Am ehesten...',
    itemSchemaHint: 'string, vollständiger Satz beginnend mit "Wer würde am ehesten..."',
    exampleItem: 'Wer würde am ehesten einen Marathon laufen?',
    countNeeded: 6,
    validate: (it) => typeof it === 'string' && it.trim().length > 0,
    classicPool: () => MOST_LIKELY_PROMPTS,
    jugendlichPool: () => MOST_LIKELY_PROMPTS_JUGENDLICH,
  },
  quiplash: {
    gameId: 'quiplash',
    gameName: 'Wortgefecht',
    itemSchemaHint: 'string, ein Satz mit einer Lücke markiert durch "___"',
    exampleItem: 'Der schlechteste Name für ein Haustier: ___',
    countNeeded: 5,
    validate: (it) => typeof it === 'string' && it.trim().length > 0,
    classicPool: () => QUIPLASH_PROMPTS,
    jugendlichPool: () => QUIPLASH_PROMPTS_JUGENDLICH,
  },
  impostor: {
    gameId: 'impostor',
    gameName: 'Impostor',
    itemSchemaHint: '{ "category": string, "word": string }',
    exampleItem: { category: 'Gaming', word: 'Minecraft' },
    countNeeded: 3,
    validate: (it) => isObj(it) && typeof it.category === 'string' && typeof it.word === 'string',
    classicPool: () => IMPOSTOR_WORD_SETS,
    jugendlichPool: () => IMPOSTOR_WORD_SETS_JUGENDLICH,
  },
  emoji: {
    gameId: 'emoji',
    gameName: 'Emoji-Rätsel',
    itemSchemaHint: '{ "emojis": string, "answer": string, "altAnswers"?: string[] }',
    exampleItem: { emojis: '🔥', answer: 'Lit', altAnswers: ['Krass'] },
    countNeeded: 6,
    validate: (it) => isObj(it) && typeof it.emojis === 'string' && typeof it.answer === 'string',
    classicPool: () => EMOJI_PROMPTS,
    jugendlichPool: () => EMOJI_PROMPTS_JUGENDLICH,
  },
  blurt: {
    gameId: 'blurt',
    gameName: 'Kategorie-Blitz',
    itemSchemaHint: 'string (eine Kategorie, zu der man Wörter mit einem Buchstaben finden kann)',
    exampleItem: 'Videospiele',
    countNeeded: 4,
    validate: (it) => typeof it === 'string' && it.trim().length > 0,
    classicPool: () => BLURT_CATEGORIES,
    jugendlichPool: () => BLURT_CATEGORIES_JUGENDLICH,
  },
  dare: {
    gameId: 'dare',
    gameName: 'Wahrheit oder Pflicht',
    itemSchemaHint: '{ "kind": "truth" | "dare", "text": string }',
    exampleItem: { kind: 'truth', text: 'Was ist dein peinlichster Suchverlauf-Eintrag?' },
    countNeeded: 10,
    validate: (it) => isObj(it) && (it.kind === 'truth' || it.kind === 'dare') && typeof it.text === 'string',
    classicPool: () => dareItems(TRUTH_PROMPTS, DARE_PROMPTS),
    jugendlichPool: () => dareItems(TRUTH_PROMPTS_JUGENDLICH, DARE_PROMPTS_JUGENDLICH),
  },
};

export function getContentSpec(gameId: string): ContentSpec | undefined {
  return CONTENT_SPECS[gameId];
}

export function splitDareItems(items: unknown[]): { truths: string[]; dares: string[] } {
  const truths: string[] = [];
  const dares: string[] = [];
  for (const it of items) {
    if (isObj(it) && typeof it.text === 'string') {
      if (it.kind === 'truth') truths.push(it.text);
      else if (it.kind === 'dare') dares.push(it.text);
    }
  }
  return { truths, dares };
}
