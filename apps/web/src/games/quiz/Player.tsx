import type { QuizPlayerView } from '@splash/shared';
import TimerBar from '../../components/TimerBar';
import { useStore } from '../../state/store';
import { OPTION_STYLES } from './options';

export default function QuizPlayer({ view }: { view: QuizPlayerView }) {
  const playerAction = useStore((s) => s.playerAction);
  const timeLeft = view.startedAt && view.timeLimitMs ? Math.max(0, view.timeLimitMs - (Date.now() - view.startedAt)) : 0;

  if (view.phase === 'reveal') {
    const correct = view.yourAnswer === view.correctIndex;
    return (
      <div className="center-col">
        <span className="big-emoji">{view.yourAnswer === undefined ? '⏱️' : correct ? '✅' : '❌'}</span>
        <h2>{view.yourAnswer === undefined ? 'Keine Antwort' : correct ? 'Richtig!' : 'Leider falsch'}</h2>
        {view.pointsAwarded ? <p className="tagline">+{view.pointsAwarded} Punkte</p> : null}
      </div>
    );
  }

  return (
    <div className="stack">
      <TimerBar timeLeftMs={timeLeft} totalMs={view.timeLimitMs ?? 1} />
      <h3 style={{ textAlign: 'center' }}>{view.question}</h3>
      <div className="answer-grid">
        {view.options?.map((opt, i) => (
          <button
            key={i}
            className={`answer-btn ${view.hasAnswered && view.yourAnswer !== i ? 'dim' : ''}`}
            style={{ background: OPTION_STYLES[i].gradient }}
            disabled={view.hasAnswered}
            onClick={() => playerAction('answer', { index: i })}
          >
            <span className="answer-shape">{OPTION_STYLES[i].shape}</span>
            {opt}
          </button>
        ))}
      </div>
      {view.hasAnswered && <p className="muted" style={{ textAlign: 'center' }}>Antwort gesendet, warte auf die anderen …</p>}
    </div>
  );
}
