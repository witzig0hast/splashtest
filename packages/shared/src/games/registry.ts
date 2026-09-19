import type { GameMeta } from '../types.js';

export const GAME_REGISTRY: GameMeta[] = [
  {
    id: 'quiz',
    name: 'Quiz-Blitz',
    tagline: 'Schnell denken, Punkte kassieren',
    description:
      'Multiple-Choice-Fragen aus allen möglichen Kategorien. Je schneller die richtige Antwort, desto mehr Punkte.',
    emoji: '🧠',
    color: '#7C3AED',
    category: 'quiz',
    minPlayers: 1,
    maxPlayers: 16,
  },
  {
    id: 'sketch',
    name: 'Kritzel-Duell',
    tagline: 'Malen und erraten',
    description:
      'Ein:e Spieler:in malt ein geheimes Wort, alle anderen raten per Handy um die Wette.',
    emoji: '🎨',
    color: '#EC4899',
    category: 'kreativ',
    minPlayers: 3,
    maxPlayers: 12,
  },
  {
    id: 'wyr',
    name: 'Würdest du eher...',
    tagline: 'Die unmögliche Wahl',
    description: 'Zwei schräge Optionen, eine Entscheidung. Am Ende zeigt sich, wie die Gruppe tickt.',
    emoji: '🤔',
    color: '#F97316',
    category: 'voting',
    minPlayers: 2,
    maxPlayers: 20,
  },
  {
    id: 'mostlikely',
    name: 'Am ehesten...',
    tagline: 'Wer aus der Gruppe würde...',
    description: 'Eine Aussage, alle zeigen auf eine Person. Wer sammelt die meisten Stimmen?',
    emoji: '👉',
    color: '#14B8A6',
    category: 'voting',
    minPlayers: 3,
    maxPlayers: 20,
  },
  {
    id: 'quiplash',
    name: 'Wortgefecht',
    tagline: 'Schreib die witzigste Antwort',
    description:
      'Alle schreiben eine Antwort auf denselben Lückentext, danach wird anonym über die beste abgestimmt.',
    emoji: '✍️',
    color: '#FBBF24',
    category: 'party',
    minPlayers: 3,
    maxPlayers: 16,
  },
  {
    id: 'impostor',
    name: 'Impostor',
    tagline: 'Einer kennt das Wort nicht',
    description:
      'Alle außer dem Impostor kennen das geheime Wort. Reihum gibt es Hinweise, dann wird abgestimmt, wer lügt.',
    emoji: '🕵️',
    color: '#EF4444',
    category: 'deduktion',
    minPlayers: 4,
    maxPlayers: 16,
  },
  {
    id: 'reaction',
    name: 'Blitzreflex',
    tagline: 'Wer tippt am schnellsten?',
    description: 'Wenn das Signal kommt: so schnell wie möglich tippen. Zu früh zählt nicht!',
    emoji: '⚡',
    color: '#22C55E',
    category: 'schnelligkeit',
    minPlayers: 2,
    maxPlayers: 30,
  },
  {
    id: 'emoji',
    name: 'Emoji-Rätsel',
    tagline: 'Errate den Titel',
    description: 'Filme, Serien und Sprichwörter in Emojis versteckt – wer tippt zuerst die Lösung?',
    emoji: '🔤',
    color: '#8B5CF6',
    category: 'schnelligkeit',
    minPlayers: 2,
    maxPlayers: 30,
  },
  {
    id: 'blurt',
    name: 'Kategorie-Blitz',
    tagline: 'Wörter gegen die Uhr',
    description:
      'Eine Kategorie, ein Buchstabe, 60 Sekunden. Einzigartige Antworten bringen die meisten Punkte.',
    emoji: '📝',
    color: '#06B6D4',
    category: 'schnelligkeit',
    minPlayers: 2,
    maxPlayers: 20,
  },
  {
    id: 'dare',
    name: 'Wahrheit oder Pflicht',
    tagline: 'Der Partyklassiker',
    description:
      'Reihum wird eine Person ausgewählt: Wahrheit oder Pflicht? Die Gruppe bewertet die Ausführung.',
    emoji: '🔥',
    color: '#F43F5E',
    category: 'party',
    minPlayers: 3,
    maxPlayers: 20,
  },
];

export function getGameMeta(id: string): GameMeta | undefined {
  return GAME_REGISTRY.find((g) => g.id === id);
}
