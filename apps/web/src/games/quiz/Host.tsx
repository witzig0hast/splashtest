import type { QuizHostView } from '@splash/shared';
import TimerBar from '../../components/TimerBar';

const OPTION_COLORS = ['#EF4444', '#3B82F6', '#FBBF24', '#22C55E'];

export default function QuizHost({ view }: { view: QuizHostView }) {
  const timeLeft = view.startedAt && view.timeLimitMs ? Math.max(0, view.timeLimitMs - (Date.now() - view.startedAt)) : 0;
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">🧠 Quiz-Blitz</span>
        <span className="badge">
          Frage {view.round}/{view.totalRounds}
        </span>
      </div>
      {view.phase === 'question' && <TimerBar timeLeftMs={timeLeft} totalMs={view.timeLimitMs ?? 1} />}
      <div className="host-question">{view.question}</div>
      <div className="answer-grid">
        {view.options?.map((opt, i) => {
          const isCorrect = view.phase === 'reveal' && i === view.correctIndex;
          const isWrong = view.phase === 'reveal' && i !== view.correctIndex;
          return (
            <div
              key={i}
              className={`answer-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
              style={{ background: OPTION_COLORS[i] }}
            >
              {opt}
              {view.phase === 'reveal' && view.optionCounts && (
                <span style={{ display: 'block', fontSize: '0.75rem', marginTop: 4 }}>{view.optionCounts[i]}×</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="muted" style={{ textAlign: 'center' }}>
        {view.answeredCount ?? 0}/{view.totalPlayers ?? 0} haben geantwortet
      </p>
    </div>
  );
}
