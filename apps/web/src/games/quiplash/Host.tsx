import type { QuiplashHostView } from '@splash/shared';

export default function QuiplashHost({ view }: { view: QuiplashHostView }) {
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">✍️ Wortgefecht</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      <div className="host-question">{view.prompt}</div>
      {view.phase === 'writing' && (
        <p className="muted" style={{ textAlign: 'center' }}>
          ✍️ {view.submittedCount}/{view.totalPlayers} schreiben gerade …
        </p>
      )}
      {view.phase === 'voting' && (
        <div className="stack-sm">
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
              <span className="rank">{i + 1}</span>
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
