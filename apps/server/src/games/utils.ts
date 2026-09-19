export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

export function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9äöüß ]/gi, '')
    .replace(/\s+/g, ' ');
}

export function isMatch(guess: string, answer: string, altAnswers: string[] = []): boolean {
  const g = normalize(guess);
  if (!g) return false;
  return [answer, ...altAnswers].some((a) => normalize(a) === g);
}

export function wordMask(word: string): string {
  return word
    .split('')
    .map((c) => (c === ' ' ? '  ' : c === '-' ? '-' : '_'))
    .join(' ');
}

export function rankPoints(rank: number, table: number[] = [300, 200, 150, 100]): number {
  return table[rank] ?? table[table.length - 1];
}
