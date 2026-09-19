import type { Player } from '@splash/shared';
import Confetti from './Confetti';

export default function PartyOverView({ players, meId }: { players: Player[]; meId?: string }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const champion = sorted[0];
  return (
    <div className="stack">
      <Confetti />
      <div className="center-col" style={{ flex: 'none', gap: 8 }}>
        <span className="big-emoji pulse">🏆</span>
        <h1>Party vorbei!</h1>
        {champion && (
          <p className="tagline">
            <strong style={{ color: 'var(--accent)' }}>{champion.name}</strong> gewinnt mit {champion.score} Punkten!
          </p>
        )}
      </div>
      <div className="stack-sm">
        {sorted.map((p, i) => (
          <div key={p.id} className={`scoreboard-row ${i === 0 ? 'top1' : ''}`}>
            <span className="rank">{i === 0 ? '👑' : i + 1}</span>
            <span className="avatar avatar-sm" style={{ background: p.colorHex }}>
              {p.avatarEmoji}
            </span>
            <span className="name" style={{ fontWeight: 800, flex: 1 }}>
              {p.name}
              {p.id === meId ? ' (du)' : ''}
            </span>
            <span className="score">{p.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
