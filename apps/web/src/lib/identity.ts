export const AVATAR_OPTIONS = [
  '😀', '😎', '🤪', '🥳', '🤖', '👻', '🐱', '🐶',
  '🦊', '🐼', '🦁', '🐸', '🦄', '🐙', '🦖', '👽',
  '🥷', '🧙', '🧛', '🤡', '👑', '🍕', '🍩', '⚡',
];

export const COLOR_OPTIONS = [
  '#7C3AED', '#EC4899', '#F97316', '#FBBF24',
  '#22C55E', '#14B8A6', '#3B82F6', '#EF4444',
  '#8B5CF6', '#F43F5E', '#06B6D4', '#84CC16',
];

export function randomAvatar(): string {
  return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
}

export function randomColor(): string {
  return COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
}
