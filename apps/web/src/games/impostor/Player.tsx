import { useState } from 'react';
import type { ImpostorPlayerView } from '@splash/shared';
import { useStore } from '../../state/store';

export default function ImpostorPlayer({ view }: { view: ImpostorPlayerView }) {
  const playerAction = useStore((s) => s.playerAction);
  const [clue, setClue] = useState('');
  const [guess, setGuess] = useState('');
  const [guessSubmitted, setGuessSubmitted] = useState(false);

  return (
    <div className="stack">
      <div className="card card-tight" style={{ textAlign: 'center', background: view.isImpostor ? 'rgba(239,68,68,0.25)' : undefined }}>
        <p className="muted">Kategorie: {view.category}</p>
        {view.isImpostor ? (
          <h2>🕵️ Du bist der Impostor!</h2>
        ) : (
          <h2>Das Wort: {view.word}</h2>
        )}
      </div>

      {view.phase === 'clue' && (
        <div className="stack-sm">
          {view.clues.map((c, i) => (
            <div key={i} className="player-row">
              <span className="name">{c.name}</span>
              <span>{c.clue}</span>
            </div>
          ))}
          {view.isYourTurnToClue ? (
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                if (clue.trim()) playerAction('submit-clue', { clue: clue.trim() });
              }}
            >
              <input className="input" value={clue} maxLength={30} onChange={(e) => setClue(e.target.value)} placeholder="Dein Hinweis (1 Wort)" autoFocus />
              <button className="btn btn-primary" type="submit" disabled={!clue.trim()}>
                ✓
              </button>
            </form>
          ) : (
            <p className="muted" style={{ textAlign: 'center' }}>Warte, bis du dran bist …</p>
          )}
        </div>
      )}

      {view.phase === 'voting' && (
        <div className="stack-sm">
          <p className="muted" style={{ textAlign: 'center' }}>Wer ist der Impostor?</p>
          {view.candidates?.map((c) => (
            <button
              key={c.playerId}
              className="btn btn-secondary btn-block"
              disabled={!!view.yourVote}
              onClick={() => playerAction('vote', { suspectId: c.playerId })}
            >
              {c.name}
              {view.yourVote === c.playerId && ' ✅'}
            </button>
          ))}
        </div>
      )}

      {view.phase === 'reveal' && (
        <div className="stack">
          <p className="tagline" style={{ textAlign: 'center' }}>
            {view.result?.wasCaught ? '🎯 Impostor erwischt!' : '😈 Impostor kam durch!'}
          </p>
          {view.result && <p className="muted" style={{ textAlign: 'center' }}>+{view.result.pointsAwarded} Punkte</p>}
          {view.isImpostor && view.result?.wasCaught && !guessSubmitted && (
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                if (guess.trim()) {
                  playerAction('guess-word', { guess: guess.trim() });
                  setGuessSubmitted(true);
                }
              }}
            >
              <input className="input" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Errate das Wort für Bonuspunkte!" />
              <button className="btn btn-accent" type="submit" disabled={!guess.trim()}>
                ✓
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
