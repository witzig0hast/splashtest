import type { Player } from '@splash/shared';

export default function PlayerList({
  players,
  onKick,
  meId,
}: {
  players: Player[];
  onKick?: (id: string) => void;
  meId?: string;
}) {
  if (players.length === 0) {
    return <p className="muted">Noch niemand hier … teile den Code!</p>;
  }
  return (
    <div className="stack-sm">
      {players.map((p) => (
        <div key={p.id} className={`player-row ${p.connected ? '' : 'dimmed'}`}>
          <span className="avatar avatar-sm" style={{ background: p.colorHex }}>
            {p.avatarEmoji}
          </span>
          <span className="name">
            {p.name}
            {p.id === meId ? ' (du)' : ''}
            {!p.connected ? ' · getrennt' : ''}
          </span>
          {p.score > 0 && <span className="score">{p.score}</span>}
          {onKick && p.id !== meId && (
            <button className="btn btn-ghost btn-sm" onClick={() => onKick(p.id)} aria-label="Entfernen">
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
