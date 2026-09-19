const MEDALS = ['🥇', '🥈', '🥉'];

export function rankLabel(index: number): string {
  return MEDALS[index] ?? String(index + 1);
}
