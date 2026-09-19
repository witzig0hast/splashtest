import type { ReactionHostView } from '@splash/shared';

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
          background: view.phase === 'go' ? 'linear-gradient(150deg,#22c55e,#15803d)' : 'rgba(0,0,0,0.2)',
          borderRadius: 24,
        }}
      >
        {view.phase === 'waiting' && <h1 className="pulse">Bereit …</h1>}
        {view.phase === 'go' && <h1 style={{ fontSize: '4rem' }}>JETZT! ⚡</h1>}
        {view.phase === 'results' && (
          <div className="stack-sm" style={{ width: '100%', maxWidth: 360 }}>
            {view.rankings?.map((r, i) => (
              <div key={r.playerId} className={`scoreboard-row ${i === 0 && !r.falseStart ? 'top1' : ''}`}>
                <span className="rank">{r.falseStart ? '⛔' : i + 1}</span>
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
