import type { BlurtHostView } from '@splash/shared';
import TimerBar from '../../components/TimerBar';
import { rankLabel } from '../../lib/rank';

export default function BlurtHost({ view }: { view: BlurtHostView }) {
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">📝 Kategorie-Blitz</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      <div className="center-col" style={{ flex: 'none', gap: 4 }}>
        <span className="muted">Kategorie</span>
        <h2 className="pop-title">{view.category}</h2>
        <span className="code-display" style={{ fontSize: '2.6rem' }}>
          {view.letter}
        </span>
      </div>
      {view.phase === 'playing' && (
        <>
          <TimerBar timeLeftMs={view.timeLeftMs} totalMs={60000} />
          <div className="wrap" style={{ justifyContent: 'center' }}>
            {view.wordCounts?.map((w) => (
              <span key={w.playerId} className="badge">
                {w.name}: {w.count}
              </span>
            ))}
          </div>
        </>
      )}
      {view.phase === 'reveal' && (
        <div className="stack-sm">
          {view.reveal
            ?.slice()
            .sort((a, b) => b.total - a.total)
            .map((r, i) => (
              <div key={r.playerId} className={`scoreboard-row ${i === 0 ? 'top1' : ''}`}>
                <span className="rank">{rankLabel(i)}</span>
                <span style={{ flex: 1 }}>
                  {r.name}
                  <br />
                  <span className="muted">{r.words.map((w) => w.text).join(', ') || '–'}</span>
                </span>
                <span className="score">{r.total}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
