import type { MostLikelyPlayerView } from '@splash/shared';
import { useStore } from '../../state/store';

export default function MostLikelyPlayer({ view }: { view: MostLikelyPlayerView }) {
  const playerAction = useStore((s) => s.playerAction);
  const me = useStore((s) => s.me);

  return (
    <div className="stack">
      <h3 style={{ textAlign: 'center' }}>{view.prompt}</h3>
      {view.phase === 'reveal' && view.winner && (
        <p className="tagline" style={{ textAlign: 'center' }}>
          🏆 {view.winner.name} mit {view.winner.votes} Stimmen!
        </p>
      )}
      <div className="stack-sm">
        {view.candidates
          .filter((c) => c.playerId !== me?.id)
          .map((c) => (
            <button
              key={c.playerId}
              className="btn btn-secondary btn-block"
              style={{ justifyContent: 'flex-start' }}
              disabled={!!view.yourVote || view.phase === 'reveal'}
              onClick={() => playerAction('vote', { candidateId: c.playerId })}
            >
              <span className="avatar avatar-sm">{c.avatarEmoji}</span>
              {c.name}
              {view.yourVote === c.playerId && ' ✅'}
            </button>
          ))}
      </div>
    </div>
  );
}
