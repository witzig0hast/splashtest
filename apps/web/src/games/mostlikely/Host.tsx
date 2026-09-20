import type { MostLikelyHostView } from '@splash/shared';
import PromptCard from '../../components/PromptCard';

export default function MostLikelyHost({ view }: { view: MostLikelyHostView }) {
  const tally = view.votesByCandidate ?? {};
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">👉 Am ehesten...</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      <PromptCard icon="👉" eyebrow="Am ehesten" title={view.prompt} />
      <div className="wrap" style={{ justifyContent: 'center' }}>
        {view.candidates.map((c) => (
          <div key={c.playerId} className="card card-tight stack-sm" style={{ alignItems: 'center', minWidth: 90 }}>
            <span className="avatar">{c.avatarEmoji}</span>
            <span style={{ fontWeight: 700 }}>{c.name}</span>
            {view.phase === 'reveal' && <span className="badge">{tally[c.playerId] ?? 0} 🗳️</span>}
          </div>
        ))}
      </div>
      {view.phase === 'voting' ? (
        <p className="muted" style={{ textAlign: 'center' }}>
          {view.answeredCount}/{view.totalPlayers} haben abgestimmt
        </p>
      ) : (
        view.winner && (
          <p className="tagline" style={{ textAlign: 'center' }}>
            🏆 {view.winner.name} mit {view.winner.votes} Stimmen!
          </p>
        )
      )}
    </div>
  );
}
