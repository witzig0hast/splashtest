import type { RoundResults } from '@splash/shared';
import { getGameMeta } from '@splash/shared';

export default function RoundResultsView({ results, meId }: { results: RoundResults; meId?: string }) {
  const meta = getGameMeta(results.gameId);
  const sorted = [...results.entries].sort((a, b) => b.scoreTotal - a.scoreTotal);
  return (
    <div className="stack">
      <div className="center-col" style={{ flex: 'none', gap: 6 }}>
        <span className="big-emoji">{meta?.emoji ?? '🎉'}</span>
        <h2>{results.gameName} vorbei!</h2>
        <p className="muted">Gesamtstand nach diesem Spiel</p>
      </div>
      <div className="stack-sm">
        {sorted.map((e, i) => (
          <div key={e.playerId} className={`scoreboard-row ${i === 0 ? 'top1' : ''}`}>
            <span className="rank">{i + 1}</span>
            <span className="name" style={{ fontWeight: 800, flex: 1 }}>
              {e.name}
              {e.playerId === meId ? ' (du)' : ''}
            </span>
            <span className="muted">+{e.pointsAwarded}</span>
            <span className="score">{e.scoreTotal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
