import type { DareHostView } from '@splash/shared';

export default function DareHost({ view }: { view: DareHostView }) {
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">🔥 Wahrheit oder Pflicht</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      <div className="center-col" style={{ flex: 1 }}>
        <span className="muted">Dran ist</span>
        <h1>{view.currentPlayerName}</h1>
        {view.phase === 'choosing' && <p className="tagline">wählt gerade Wahrheit oder Pflicht …</p>}
        {view.choice && (
          <div className="card" style={{ marginTop: 12, maxWidth: 420 }}>
            <span className="badge">{view.choice === 'truth' ? '💬 Wahrheit' : '🔥 Pflicht'}</span>
            <p style={{ marginTop: 12, fontSize: '1.2rem', fontWeight: 700 }}>{view.prompt}</p>
          </div>
        )}
        {view.phase === 'rating' && view.ratingCounts && (
          <p className="muted" style={{ marginTop: 12 }}>
            👍 {view.ratingCounts.up} · 👎 {view.ratingCounts.down}
          </p>
        )}
      </div>
    </div>
  );
}
