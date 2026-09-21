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
          background: 'var(--violet)',
          boxShadow: '0 8px 20px -6px rgba(124,108,246,0.6)',
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
          background: 'var(--coral)',
          boxShadow: '0 8px 20px -6px rgba(255,138,91,0.6)',
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
