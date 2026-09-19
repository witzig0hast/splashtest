import type { SketchHostView } from '@splash/shared';
import TimerBar from '../../components/TimerBar';
import SketchCanvas from '../../components/SketchCanvas';

export default function SketchHost({ view }: { view: SketchHostView }) {
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">🎨 Kritzel-Duell</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      <div className="row-between">
        <span className="muted">{view.drawerName} malt …</span>
        {view.phase === 'drawing' && <span className="code-display" style={{ fontSize: '1.6rem' }}>{view.wordMask}</span>}
        {view.phase === 'reveal' && <span className="code-display" style={{ fontSize: '1.6rem' }}>{view.word}</span>}
      </div>
      {(view.phase === 'drawing' || view.phase === 'choosing') && (
        <TimerBar timeLeftMs={view.timeLeftMs} totalMs={view.phase === 'choosing' ? 12000 : 75000} />
      )}
      <SketchCanvas strokes={view.strokes} />
      <div className="wrap" style={{ justifyContent: 'center' }}>
        {view.correctGuessers.map((name) => (
          <span key={name} className="badge">
            ✅ {name}
          </span>
        ))}
      </div>
    </div>
  );
}
