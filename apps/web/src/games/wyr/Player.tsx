import type { WyrPlayerView } from '@splash/shared';
import { useStore } from '../../state/store';

export default function WyrPlayer({ view }: { view: WyrPlayerView }) {
  const playerAction = useStore((s) => s.playerAction);
  return (
    <div className="stack">
      <h3 style={{ textAlign: 'center' }}>Würdest du eher...</h3>
      <button
        className="btn btn-block"
        style={{
          background: 'linear-gradient(135deg, var(--violet), var(--violet-strong))',
          boxShadow: '0 10px 30px -6px rgba(139,92,246,0.55)',
          color: 'white',
          minHeight: 100,
          whiteSpace: 'normal',
        }}
        disabled={!!view.yourVote}
        onClick={() => playerAction('vote', { choice: 'A' })}
      >
        {view.optionA}
        {view.yourVote === 'A' && ' ✅'}
      </button>
      <div style={{ textAlign: 'center' }} className="muted">
        oder
      </div>
      <button
        className="btn btn-block"
        style={{
          background: 'linear-gradient(135deg, var(--coral), var(--amber-strong))',
          boxShadow: '0 10px 30px -6px rgba(251,146,60,0.5)',
          color: 'white',
          minHeight: 100,
          whiteSpace: 'normal',
        }}
        disabled={!!view.yourVote}
        onClick={() => playerAction('vote', { choice: 'B' })}
      >
        {view.optionB}
        {view.yourVote === 'B' && ' ✅'}
      </button>
      {view.phase === 'reveal' && (
        <p className="muted" style={{ textAlign: 'center' }}>
          {view.votesA} vs {view.votesB} Stimmen
        </p>
      )}
    </div>
  );
}
