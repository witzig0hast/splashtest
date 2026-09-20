function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

/** Mixes `hex` toward `target` by `amount` (0 = pure hex, 1 = pure target). */
function mix(hex: string, target: [number, number, number], amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const mr = Math.round(r * (1 - amount) + target[0] * amount);
  const mg = Math.round(g * (1 - amount) + target[1] * amount);
  const mb = Math.round(b * (1 - amount) + target[2] * amount);
  return `rgb(${mr}, ${mg}, ${mb})`;
}

const NEAR_BLACK: [number, number, number] = [0, 0, 0];
const DEEP_INK: [number, number, number] = [19, 10, 44];

/** The two gradient stops every colored card/tile is built from: a
 * slightly-darkened, saturated top and a deep-ink bottom - always dark
 * enough for white text, whatever the source hue (even bright yellow). */
export function cardGradientStops(hex: string): { a: string; b: string } {
  return { a: mix(hex, NEAR_BLACK, 0.06), b: mix(hex, DEEP_INK, 0.58) };
}
