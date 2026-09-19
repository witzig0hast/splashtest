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
        background:
          view.phase === 'go'
            ? 'linear-gradient(150deg, var(--emerald), #0f9d6a)'
            : 'linear-gradient(150deg, var(--violet), var(--violet-strong))',
        boxShadow: view.phase === 'go' ? '0 20px 60px -12px rgba(52,211,153,0.55)' : '0 20px 60px -12px rgba(139,92,246,0.45)',
      }}
      disabled={view.hasTapped}
      onClick={() => playerAction('tap')}
    >
      {view.phase === 'go' ? 'JETZT TIPPEN! ⚡' : view.hasTapped ? 'Zu früh! ⛔' : 'Bereit … ⏳'}
    </button>
  );
}
