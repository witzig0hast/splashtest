import type { WyrHostView } from '@splash/shared';

export default function WyrHost({ view }: { view: WyrHostView }) {
  const total = (view.votesA ?? 0) + (view.votesB ?? 0);
  const pctA = total > 0 ? Math.round(((view.votesA ?? 0) / total) * 100) : 50;
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">🤔 Würdest du eher...</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      <div className="grid-2" style={{ flex: 1 }}>
        <div className="card" style={{ background: 'linear-gradient(150deg,#7C3AED,#5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ textAlign: 'center' }}>{view.optionA}</h2>
        </div>
        <div className="card" style={{ background: 'linear-gradient(150deg,#F97316,#c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ textAlign: 'center' }}>{view.optionB}</h2>
        </div>
      </div>
      {view.phase === 'reveal' ? (
        <div className="stack-sm">
          <div className="timer-bar">
            <div className="timer-bar-fill" style={{ width: `${pctA}%` }} />
          </div>
          <div className="row-between">
            <span>{view.votesA ?? 0} Stimmen ({pctA}%)</span>
            <span>{view.votesB ?? 0} Stimmen ({100 - pctA}%)</span>
          </div>
        </div>
      ) : (
        <p className="muted" style={{ textAlign: 'center' }}>
          {view.answeredCount}/{view.totalPlayers} haben gewählt
        </p>
      )}
    </div>
  );
}
