export interface EmojiPrompt {
  emojis: string;
  answer: string;
  altAnswers?: string[];
}

export const EMOJI_PROMPTS: EmojiPrompt[] = [
  { emojis: '🦁👑', answer: 'König der Löwen' },
  { emojis: '🧊👸', answer: 'Die Eiskönigin', altAnswers: ['Frozen'] },
  { emojis: '🕷️👨', answer: 'Spiderman', altAnswers: ['Spider-Man'] },
  { emojis: '🏠🎈', answer: 'Oben', altAnswers: ['Up'] },
  { emojis: '🦈🎬', answer: 'Der weiße Hai', altAnswers: ['Jaws'] },
  { emojis: '🧙‍♂️💍', answer: 'Der Herr der Ringe' },
  { emojis: '🐟🔍', answer: 'Findet Nemo' },
  { emojis: '🚢🧊💔', answer: 'Titanic' },
  { emojis: '🍫🏭', answer: 'Charlie und die Schokoladenfabrik' },
  { emojis: '👻🚫', answer: 'Ghostbusters' },
  { emojis: '🦖🏝️', answer: 'Jurassic Park' },
  { emojis: '🐝🎥', answer: 'Bee Movie' },
  { emojis: '🤠🚀', answer: 'Toy Story' },
  { emojis: '🐼🥋', answer: 'Kung Fu Panda' },
  { emojis: '👨‍🚀🌕', answer: 'Apollo 13' },
  { emojis: '🍎⌚', answer: 'Apple Watch' },
  { emojis: '🌧️🐱🐶', answer: 'Es regnet Katzen und Hunde' },
  { emojis: '⏰🍞', answer: 'Zeit ist Geld', altAnswers: ['Wettlauf gegen die Zeit'] },
  { emojis: '🐝📦', answer: 'Biene Maja' },
  { emojis: '🦸‍♂️💚😡', answer: 'Hulk' },
  { emojis: '🧛‍♂️🦇', answer: 'Dracula' },
  { emojis: '🍕🐢', answer: 'Teenage Mutant Ninja Turtles', altAnswers: ['Ninja Turtles'] },
  { emojis: '❄️⛄', answer: 'Schneemann', altAnswers: ['Frosty'] },
  { emojis: '🐭🏰', answer: 'Disneyland' },
  { emojis: '🎃👻🍬', answer: 'Halloween' },
];
