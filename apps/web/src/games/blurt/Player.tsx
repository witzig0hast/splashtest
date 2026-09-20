import { useState } from 'react';
import type { BlurtPlayerView } from '@splash/shared';
import { useStore } from '../../state/store';
import TimerBar from '../../components/TimerBar';

export default function BlurtPlayer({ view }: { view: BlurtPlayerView }) {
  const playerAction = useStore((s) => s.playerAction);
  const [word, setWord] = useState('');

  if (view.phase === 'reveal') {
    return (
      <div className="center-col">
        <h2 className="pop-title">+{view.pointsAwarded ?? 0} Punkte</h2>
        <div className="wrap" style={{ justifyContent: 'center' }}>
          {view.yourWords.map((w) => (
            <span key={w} className="badge">
              {w}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="center-col" style={{ flex: 'none', gap: 2 }}>
        <span className="muted">{view.category}</span>
        <span className="code-display" style={{ fontSize: '2.4rem' }}>
          {view.letter}
        </span>
      </div>
      <TimerBar timeLeftMs={view.timeLeftMs} totalMs={60000} />
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          if (word.trim()) {
            playerAction('add-word', { text: word.trim() });
            setWord('');
          }
        }}
      >
        <input className="input" value={word} onChange={(e) => setWord(e.target.value)} placeholder={`Wort mit "${view.letter}"`} autoFocus />
        <button className="btn btn-primary" type="submit" disabled={!word.trim()}>
          +
        </button>
      </form>
      <div className="wrap">
        {view.yourWords.map((w) => (
          <span key={w} className="badge" style={{ cursor: 'pointer' }} onClick={() => playerAction('remove-word', { text: w })}>
            {w} ✕
          </span>
        ))}
      </div>
    </div>
  );
}
