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
        color: '#fff',
        background: view.phase === 'go' ? 'var(--emerald)' : 'var(--violet)',
        boxShadow: view.phase === 'go' ? '0 20px 50px -12px rgba(36,201,138,0.55)' : '0 20px 50px -12px rgba(124,108,246,0.5)',
      }}
      disabled={view.hasTapped}
      onClick={() => playerAction('tap')}
    >
      {view.phase === 'go' ? 'JETZT TIPPEN! ⚡' : view.hasTapped ? 'Zu früh! ⛔' : 'Bereit … ⏳'}
    </button>
  );
}
