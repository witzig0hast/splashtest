import type { ImpostorHostView } from '@splash/shared';

export default function ImpostorHost({ view }: { view: ImpostorHostView }) {
  return (
    <div className="host-stage">
      <div className="row-between">
        <span className="badge">🕵️ Impostor</span>
        <span className="badge">
          {view.round}/{view.totalRounds}
        </span>
      </div>
      <div className="center-col" style={{ flex: 'none' }}>
        <span className="muted">Kategorie</span>
        <h2 className="pop-title">{view.category}</h2>
      </div>
      {view.phase === 'clue' && (
        <div className="stack-sm">
          {view.clueOrder.map((c) => (
            <div key={c.playerId} className={`player-row ${c.playerId === view.currentClueTurnPlayerId ? 'pulse' : ''}`}>
              <span className="name">{c.name}</span>
              <span>{c.clue ?? (c.playerId === view.currentClueTurnPlayerId ? '💭 ...' : '')}</span>
            </div>
          ))}
        </div>
      )}
      {view.phase === 'voting' && (
        <div className="stack-sm">
          <p className="muted" style={{ textAlign: 'center' }}>
            Wer ist der Impostor? Alle stimmen ab …
          </p>
          {view.clueOrder.map((c) => (
            <div key={c.playerId} className="player-row">
              <span className="name">{c.name}</span>
              <span className="muted">{c.clue}</span>
              <span className="badge">{view.votingTally?.[c.playerId] ?? 0}</span>
            </div>
          ))}
        </div>
      )}
      {view.phase === 'reveal' && (
        <div className="center-col" style={{ flex: 'none', gap: 10 }}>
          <span className="big-emoji">🕵️</span>
          <h2 className="pop-title">Das Wort war: {view.word}</h2>
          <p className="tagline">
            Impostor: {view.clueOrder.filter((c) => view.revealedImpostorIds?.includes(c.playerId)).map((c) => c.name).join(', ')}
          </p>
          {view.impostorGuess && (
            <p className="muted">
              Impostor-Tipp: „{view.impostorGuess.text}“ – {view.impostorGuess.correct ? 'richtig geraten! 😱' : 'daneben!'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
