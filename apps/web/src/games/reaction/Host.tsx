import type { ReactionHostView } from '@splash/shared';
import { rankLabel } from '../../lib/rank';

export default function ReactionHost({ view }: { view: ReactionHostView }) {
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">⚡ Blitzreflex</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      <div
        className="center-col"
        style={{
          flex: 1,
          background:
            view.phase === 'go'
              ? 'linear-gradient(150deg, var(--emerald), #0f9d6a)'
              : 'linear-gradient(150deg, rgba(139,92,246,0.18), rgba(0,0,0,0.2))',
          borderRadius: 24,
          boxShadow: view.phase === 'go' ? '0 20px 60px -12px rgba(52,211,153,0.55)' : 'none',
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {view.phase === 'waiting' && <h1 className="pulse">Bereit …</h1>}
        {view.phase === 'go' && <h1 style={{ fontSize: '4rem' }}>JETZT! ⚡</h1>}
        {view.phase === 'results' && (
          <div className="stack-sm" style={{ width: '100%', maxWidth: 360 }}>
            {view.rankings?.map((r, i) => (
              <div key={r.playerId} className={`scoreboard-row ${i === 0 && !r.falseStart ? 'top1' : ''}`}>
                <span className="rank">{r.falseStart ? '⛔' : rankLabel(i)}</span>
                <span style={{ flex: 1 }}>{r.name}</span>
                <span>{r.falseStart ? 'zu früh!' : r.ms !== null ? `${r.ms} ms` : '–'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {view.phase !== 'results' && (
        <p className="muted" style={{ textAlign: 'center' }}>
          {view.tappedCount}/{view.totalPlayers} bereit
        </p>
      )}
    </div>
  );
}
