import { useState } from 'react';
import type { EmojiPlayerView } from '@splash/shared';
import { useStore } from '../../state/store';
import TimerBar from '../../components/TimerBar';

export default function EmojiPlayer({ view }: { view: EmojiPlayerView }) {
  const playerAction = useStore((s) => s.playerAction);
  const [guess, setGuess] = useState('');

  if (view.phase === 'reveal') {
    return (
      <div className="center-col">
        <div style={{ fontSize: '4rem' }}>{view.emojis}</div>
        <h2 className="pop-title">{view.answer}</h2>
        {view.hasSolved && <p className="tagline">Platz {view.yourRank} 🎉</p>}
      </div>
    );
  }

  return (
    <div className="stack">
      <TimerBar timeLeftMs={view.timeLeftMs} totalMs={30000} />
      <div className="center-col" style={{ flex: 'none' }}>
        <div style={{ fontSize: '4rem' }}>{view.emojis}</div>
      </div>
      {view.hasSolved ? (
        <p className="tagline" style={{ textAlign: 'center' }}>✅ Gelöst! Platz {view.yourRank}</p>
      ) : (
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
          <input className="input" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Deine Lösung" autoFocus />
          <button className="btn btn-primary" type="submit" disabled={!guess.trim()}>
            ✓
          </button>
        </form>
      )}
    </div>
  );
}
