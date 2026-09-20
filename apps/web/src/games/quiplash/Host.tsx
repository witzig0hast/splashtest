import type { QuiplashHostView } from '@splash/shared';
import PromptCard from '../../components/PromptCard';
import { rankLabel } from '../../lib/rank';

export default function QuiplashHost({ view }: { view: QuiplashHostView }) {
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">✍️ Wortgefecht</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      {view.phase === 'writing' && (
        <>
          <PromptCard icon="✍️" iconTint="rgba(255,178,3,0.16)" eyebrow="Fülle die Lücke" title={view.prompt} />
          <p className="muted" style={{ textAlign: 'center' }}>
            ✍️ {view.submittedCount}/{view.totalPlayers} schreiben gerade …
          </p>
        </>
      )}
      {view.phase === 'voting' && (
        <div className="stack-sm">
          <div className="host-question">{view.prompt}</div>
          <p className="muted" style={{ textAlign: 'center' }}>
            🗳️ {view.votedCount}/{view.totalPlayers} haben abgestimmt
          </p>
          {view.answers?.map((a) => (
            <div key={a.id} className="card card-tight">
              {a.text}
            </div>
          ))}
        </div>
      )}
      {view.phase === 'reveal' && (
        <div className="stack-sm">
          {view.reveal?.map((r, i) => (
            <div key={r.id} className={`scoreboard-row ${i === 0 ? 'top1' : ''}`}>
              <span className="rank">{rankLabel(i)}</span>
              <span style={{ flex: 1 }}>
                “{r.text}”
                <br />
                <span className="muted">– {r.authorName}</span>
              </span>
              <span className="score">{r.votes} 🗳️</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
