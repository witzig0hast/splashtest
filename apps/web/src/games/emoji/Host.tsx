import type { EmojiHostView } from '@splash/shared';
import TimerBar from '../../components/TimerBar';
import { rankLabel } from '../../lib/rank';

export default function EmojiHost({ view }: { view: EmojiHostView }) {
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">🔤 Emoji-Rätsel</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      {view.phase === 'guessing' && <TimerBar timeLeftMs={view.timeLeftMs} totalMs={30000} />}
      <div className="center-col" style={{ flex: 1 }}>
        <div style={{ fontSize: '5rem' }}>{view.emojis}</div>
        {view.phase === 'reveal' && <h2 className="pop-title">{view.answer}</h2>}
      </div>
      <div className="stack-sm">
        {view.solvedOrder.map((s, i) => (
          <div key={i} className="player-row">
            <span className="rank">{rankLabel(i)}</span>
            <span className="name">{s.name}</span>
            <span className="muted">{(s.ms / 1000).toFixed(1)}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}
