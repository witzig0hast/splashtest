import type { CSSProperties } from 'react';
import { GAME_REGISTRY } from '@splash/shared';
import { cardGradientStops } from '../lib/color';

export default function GameSelectGrid({
  connectedCount,
  playedGameIds,
  onSelect,
}: {
  connectedCount: number;
  playedGameIds: string[];
  onSelect: (gameId: string) => void;
}) {
  return (
    <div className="game-grid">
      {GAME_REGISTRY.map((g) => {
        const enough = connectedCount >= g.minPlayers;
        const playedBefore = playedGameIds.includes(g.id);
        const { a, b } = cardGradientStops(g.color);
        return (
          <button
            key={g.id}
            className="game-card"
            style={{ '--card-a': a, '--card-b': b } as CSSProperties}
            disabled={!enough}
            onClick={() => onSelect(g.id)}
          >
            <span className="icon-badge">{g.emoji}</span>
            <span className="name">{g.name}</span>
            <span className="tagline">{g.tagline}</span>
            <span className="players-need">
              {enough ? (playedBefore ? '🔁 nochmal spielen' : `${g.minPlayers}+ Spieler`) : `braucht ${g.minPlayers}+ Spieler`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
