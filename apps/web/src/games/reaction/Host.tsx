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
        className={view.phase !== 'go' ? 'card' : undefined}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: view.phase === 'go' ? 'var(--emerald)' : undefined,
          borderRadius: 24,
          boxShadow: view.phase === 'go' ? '0 20px 50px -12px rgba(36,201,138,0.55)' : undefined,
          border: view.phase === 'go' ? 'none' : undefined,
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {view.phase === 'waiting' && (
          <h1 className="pulse" style={{ color: 'var(--ink)' }}>
            Bereit …
          </h1>
        )}
        {view.phase === 'go' && <h1 style={{ fontSize: '4rem', color: '#fff' }}>JETZT! ⚡</h1>}
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
