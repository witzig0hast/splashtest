import type { ReactionPlayerView } from '@splash/shared';
import { useStore } from '../../state/store';

export default function ReactionPlayer({ view }: { view: ReactionPlayerView }) {
  const playerAction = useStore((s) => s.playerAction);

  if (view.phase === 'results') {
    const r = view.yourResult;
    return (
      <div className="center-col">
        <span className="big-emoji">{r?.falseStart ? '⛔' : '🏁'}</span>
        <h2>{r?.falseStart ? 'Zu früh getippt!' : r?.ms !== null && r?.ms !== undefined ? `${r.ms} ms` : 'Nicht getippt'}</h2>
        {r?.rank && <p className="tagline">Platz {r.rank}</p>}
      </div>
    );
  }

  return (
    <button
      className="btn btn-block"
      style={{
        minHeight: '55vh',
        fontSize: '2rem',
        background: view.phase === 'go' ? 'linear-gradient(150deg,#22c55e,#15803d)' : 'linear-gradient(150deg,#6d28d9,#4c1d95)',
      }}
      disabled={view.hasTapped}
      onClick={() => playerAction('tap')}
    >
      {view.phase === 'go' ? 'JETZT TIPPEN! ⚡' : view.hasTapped ? 'Zu früh! ⛔' : 'Bereit … ⏳'}
    </button>
  );
}
