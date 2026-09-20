import { useState } from 'react';
import type { SketchPlayerView } from '@splash/shared';
import { useStore } from '../../state/store';
import SketchCanvas from '../../components/SketchCanvas';
import TimerBar from '../../components/TimerBar';

const COLORS = ['#111827', '#EF4444', '#3B82F6', '#22C55E', '#FBBF24', '#EC4899', '#ffffff'];

export default function SketchPlayer({ view }: { view: SketchPlayerView }) {
  const playerAction = useStore((s) => s.playerAction);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(6);
  const [guess, setGuess] = useState('');

  if (view.phase === 'choosing') {
    if (view.isDrawer) {
      return (
        <div className="stack">
          <h2 className="pop-title" style={{ textAlign: 'center' }}>
            Wähle ein Wort
          </h2>
          {view.wordChoices?.map((w) => (
            <button key={w} className="btn btn-primary btn-block" onClick={() => playerAction('choose-word', { index: view.wordChoices!.indexOf(w) })}>
              {w}
            </button>
          ))}
        </div>
      );
    }
    return (
      <div className="center-col">
        <span className="big-emoji pulse">🎨</span>
        <p className="muted">Jemand wählt gerade ein Wort zum Malen …</p>
      </div>
    );
  }

  if (view.isDrawer) {
    return (
      <div className="stack">
        {view.phase === 'drawing' && <TimerBar timeLeftMs={view.timeLeftMs} totalMs={75000} />}
        <SketchCanvas strokes={view.strokes} interactive={view.phase === 'drawing'} color={color} size={size} onStroke={(s) => playerAction('stroke', s)} />
        {view.phase === 'drawing' && (
          <>
            <div className="wrap">
              {COLORS.map((c) => (
                <button key={c} className={`color-swatch ${color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
            <div className="row">
              <input type="range" min={2} max={20} value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ flex: 1 }} />
              <button className="btn btn-secondary btn-sm" onClick={() => playerAction('clear')}>
                🗑️ Löschen
              </button>
            </div>
          </>
        )}
        {view.phase === 'reveal' && (
          <h2 className="pop-title" style={{ textAlign: 'center' }}>
            Das Wort war: {view.word}
          </h2>
        )}
        <div className="wrap" style={{ justifyContent: 'center' }}>
          {view.guesses.filter((g) => g.correct).map((g, i) => (
            <span key={i} className="badge">
              ✅ {g.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="row-between">
        <span className="code-display" style={{ fontSize: '1.6rem' }}>
          {view.phase === 'reveal' ? view.word : view.wordMask}
        </span>
        {view.phase === 'drawing' && <TimerBar timeLeftMs={view.timeLeftMs} totalMs={75000} />}
      </div>
      <SketchCanvas strokes={view.strokes} />
      {view.phase === 'drawing' && !view.hasGuessedCorrectly && (
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            if (guess.trim()) {
              playerAction('guess', { text: guess.trim() });
              setGuess('');
            }
          }}
        >
          <input className="input" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Deine Vermutung" />
          <button className="btn btn-primary" type="submit" disabled={!guess.trim()}>
            ✓
          </button>
        </form>
      )}
      {view.hasGuessedCorrectly && <p className="tagline" style={{ textAlign: 'center' }}>✅ Erraten! Warte auf die Runde …</p>}
      <div className="stack-sm">
        {view.guesses.slice(-6).map((g, i) => (
          <div key={i} className={`badge ${g.correct ? '' : ''}`}>
            {g.correct ? g.text : `${g.name}: ${g.text}`}
          </div>
        ))}
      </div>
    </div>
  );
}
