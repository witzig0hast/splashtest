import { useState } from 'react';
import type { QuiplashPlayerView } from '@splash/shared';
import { useStore } from '../../state/store';
import PromptCard from '../../components/PromptCard';
import { rankLabel } from '../../lib/rank';

export default function QuiplashPlayer({ view }: { view: QuiplashPlayerView }) {
  const playerAction = useStore((s) => s.playerAction);
  const [text, setText] = useState('');

  if (view.phase === 'writing') {
    if (view.hasSubmitted) {
      return (
        <div className="center-col">
          <span className="big-emoji">✍️</span>
          <p className="muted">Antwort gesendet, warte auf die anderen …</p>
        </div>
      );
    }
    return (
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) playerAction('submit', { text: text.trim() });
        }}
      >
        <PromptCard icon="✍️" iconTint="rgba(255,178,3,0.16)" eyebrow="Fülle die Lücke" title={view.prompt} />
        <input className="input" value={text} maxLength={80} onChange={(e) => setText(e.target.value)} placeholder="Deine Antwort..." autoFocus />
        <button className="btn btn-primary btn-block" type="submit" disabled={!text.trim()}>
          Absenden
        </button>
      </form>
    );
  }

  if (view.phase === 'voting') {
    return (
      <div className="stack">
        <h3 style={{ textAlign: 'center' }}>Was ist am witzigsten?</h3>
        {view.votingChoices?.map((c) => (
          <button
            key={c.id}
            className="btn btn-secondary btn-block"
            style={{ whiteSpace: 'normal', minHeight: 60 }}
            disabled={view.hasVoted}
            onClick={() => playerAction('vote', { answerId: c.id })}
          >
            {c.text}
          </button>
        ))}
        {view.hasVoted && <p className="muted" style={{ textAlign: 'center' }}>Danke! Warte auf die anderen …</p>}
      </div>
    );
  }

  if (view.phase === 'waiting') {
    return (
      <div className="center-col">
        <span className="big-emoji">⏳</span>
        <p className="muted">Warte auf die Auswertung …</p>
      </div>
    );
  }

  return (
    <div className="stack">
      {view.pointsAwarded ? <p className="tagline" style={{ textAlign: 'center' }}>+{view.pointsAwarded} Punkte!</p> : null}
      {view.reveal?.map((r, i) => (
        <div key={r.id} className={`scoreboard-row ${r.isYours ? 'top1' : ''}`}>
          <span className="rank">{rankLabel(i)}</span>
          <span style={{ flex: 1 }}>
            “{r.text}”
            <br />
            <span className="muted">– {r.isYours ? 'du' : r.authorName}</span>
          </span>
          <span className="score">{r.votes} 🗳️</span>
        </div>
      ))}
    </div>
  );
}
