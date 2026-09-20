import type { MostLikelyPlayerView } from '@splash/shared';
import { useStore } from '../../state/store';
import PromptCard from '../../components/PromptCard';

export default function MostLikelyPlayer({ view }: { view: MostLikelyPlayerView }) {
  const playerAction = useStore((s) => s.playerAction);
  const me = useStore((s) => s.me);

  return (
    <div className="stack">
      <PromptCard icon="👉" iconTint="rgba(20,199,187,0.16)" eyebrow="Am ehesten" title={view.prompt} />
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
              style={{
                justifyContent: 'flex-start',
                ...(view.yourVote === c.playerId ? { background: '#fff', color: 'var(--ink)' } : {}),
              }}
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
