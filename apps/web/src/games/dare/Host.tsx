import type { DareHostView } from '@splash/shared';
import PromptCard from '../../components/PromptCard';

export default function DareHost({ view }: { view: DareHostView }) {
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">🔥 Wahrheit oder Pflicht</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      <div className="center-col" style={{ flex: 1 }}>
        <span className="muted">Dran ist</span>
        <h1 className="pop-title">{view.currentPlayerName}</h1>
        {view.phase === 'choosing' && <p className="tagline">wählt gerade Wahrheit oder Pflicht …</p>}
        {view.choice && (
          <div style={{ width: '100%', maxWidth: 420, marginTop: 12 }}>
            <PromptCard
              icon={view.choice === 'truth' ? '💬' : '🔥'}
              eyebrow={view.choice === 'truth' ? 'Wahrheit' : 'Pflicht'}
              title={view.prompt ?? ''}
            />
          </div>
        )}
        {view.phase === 'rating' && view.ratingCounts && (
          <p className="muted" style={{ marginTop: 12 }}>
            👍 {view.ratingCounts.up} · 👎 {view.ratingCounts.down}
          </p>
        )}
      </div>
    </div>
  );
}
