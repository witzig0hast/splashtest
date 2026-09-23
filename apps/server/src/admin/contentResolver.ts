import { getContentSpec } from './contentSpecs.js';
import { adminStore } from './store.js';
import { generateContentWithAI } from './aiClient.js';
import { shuffle } from '../games/utils.js';

/** Resolves the content pool a game session should draw from, given a genre choice.
 * Always returns something playable - AI failures and empty custom packs fall back
 * to the built-in classic content rather than leaving a game with nothing to play. */
export async function resolveContent(gameId: string, genre: string | undefined): Promise<unknown[]> {
  const spec = getContentSpec(gameId);
  if (!spec) return [];

  const effectiveGenre = genre || 'classic';

  if (effectiveGenre === 'ki') {
    const model = adminStore.getActiveModel();
    if (model) {
      try {
        const items = await generateContentWithAI(model, spec, spec.countNeeded * 2);
        return shuffle(items);
      } catch (err) {
        console.error(`KI-Generierung für "${gameId}" fehlgeschlagen, falle auf Klassisch zurück:`, err);
      }
    }
    return shuffle(spec.classicPool());
  }

  if (effectiveGenre === 'classic') return shuffle(spec.classicPool());
  if (effectiveGenre === 'jugendlich') return shuffle(spec.jugendlichPool());

  const packs = adminStore.packsFor(gameId, effectiveGenre);
  const items = packs.flatMap((p) => p.items).filter((it) => spec.validate(it));
  if (items.length === 0) return shuffle(spec.classicPool());
  return shuffle(items);
}

/** Genre choices to offer for a game: built-in classic/jugendlich, any custom pack
 * genres, and "ki" if an AI model is currently active. */
export function genresFor(gameId: string): { id: string; label: string }[] {
  const spec = getContentSpec(gameId);
  if (!spec) return [];
  const options = [
    { id: 'classic', label: '🎓 Klassisch' },
    { id: 'jugendlich', label: '😎 Jugendlich' },
    ...adminStore.genresFor(gameId).map((g) => ({ id: g.id, label: g.label || g.id })),
  ];
  if (adminStore.getActiveModel()) {
    options.push({ id: 'ki', label: '🤖 KI-generiert' });
  }
  return options;
}
