import type { DarePlayerView } from '@splash/shared';
import { useStore } from '../../state/store';

export default function DarePlayer({ view }: { view: DarePlayerView }) {
  const playerAction = useStore((s) => s.playerAction);

  if (!view.isActive) {
    return (
      <div className="stack">
        <div className="center-col" style={{ flex: 'none' }}>
          <span className="muted">Dran ist</span>
          <h2>{view.currentPlayerName}</h2>
        </div>
        {view.prompt && (
          <div className="card">
            <span className="badge">{view.choice === 'truth' ? '💬 Wahrheit' : '🔥 Pflicht'}</span>
            <p style={{ marginTop: 12, fontWeight: 700 }}>{view.prompt}</p>
          </div>
        )}
        {view.phase === 'rating' && view.canRate && (
          <div className="grid-2">
            <button className="btn btn-secondary btn-block" onClick={() => playerAction('rate', { rating: 'down' })}>
              👎
            </button>
            <button className="btn btn-primary btn-block" onClick={() => playerAction('rate', { rating: 'up' })}>
              👍
            </button>
          </div>
        )}
        {view.yourRating && <p className="muted" style={{ textAlign: 'center' }}>Bewertung abgegeben ✅</p>}
        {view.phase !== 'rating' && !view.prompt && <p className="muted" style={{ textAlign: 'center' }}>Warte …</p>}
      </div>
    );
  }

  if (view.phase === 'choosing') {
    return (
      <div className="stack">
        <h2 style={{ textAlign: 'center' }}>Du bist dran!</h2>
        <div className="grid-2">
          <button className="btn btn-primary btn-block" onClick={() => playerAction('choose', { choice: 'truth' })}>
            💬 Wahrheit
          </button>
          <button className="btn btn-danger btn-block" onClick={() => playerAction('choose', { choice: 'dare' })}>
            🔥 Pflicht
          </button>
        </div>
      </div>
    );
  }

  if (view.phase === 'prompt') {
    return (
      <div className="stack">
        <div className="card">
          <span className="badge">{view.choice === 'truth' ? '💬 Wahrheit' : '🔥 Pflicht'}</span>
          <p style={{ marginTop: 12, fontSize: '1.15rem', fontWeight: 700 }}>{view.prompt}</p>
        </div>
        <button className="btn btn-accent btn-block" onClick={() => playerAction('done')}>
          Fertig ✅
        </button>
      </div>
    );
  }

  if (view.phase === 'rating') {
    return (
      <div className="center-col">
        <span className="big-emoji pulse">🎤</span>
        <p className="muted">Die anderen bewerten dich gerade …</p>
      </div>
    );
  }

  return (
    <div className="center-col">
      <span className="big-emoji">🎉</span>
      <h2>+{view.pointsAwarded ?? 0} Punkte</h2>
    </div>
  );
}
