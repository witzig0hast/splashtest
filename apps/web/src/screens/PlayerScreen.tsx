import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { useRouter } from '../lib/router';
import { AVATAR_OPTIONS, COLOR_OPTIONS, randomAvatar, randomColor } from '../lib/identity';
import PlayerList from '../components/PlayerList';
import RoundResultsView from '../components/RoundResultsView';
import PartyOverView from '../components/PartyOverView';
import GamePlayerView from '../games/GamePlayerView';

export default function PlayerScreen() {
  const { path, navigate } = useRouter();
  const { room, me, gameId, playerView, roundResults, error, joinRoom, leaveRoom, clearError } = useStore();
  const [tryingResume, setTryingResume] = useState(true);
  const [codeInput, setCodeInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [avatar, setAvatar] = useState(randomAvatar());
  const [color, setColor] = useState(randomColor());
  const [joining, setJoining] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const parts = path.split('/').filter(Boolean);
    const urlCode = parts[1]?.toUpperCase();
    if (urlCode) setCodeInput(urlCode);
    const resumed = useStore.getState().resumePlayerIfSaved();
    if (!resumed) setTryingResume(false);
    else setTimeout(() => setTryingResume(false), 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (tryingResume && !room) {
    return (
      <div className="container center-col">
        <span className="big-emoji pulse">💦</span>
        <p className="muted">Verbinde …</p>
      </div>
    );
  }

  if (!room || !me) {
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);
      if (!codeInput.trim()) return setLocalError('Bitte Code eingeben.');
      if (!nameInput.trim()) return setLocalError('Bitte Namen eingeben.');
      setJoining(true);
      try {
        await joinRoom(codeInput, nameInput, avatar, color);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Beitritt fehlgeschlagen.');
      } finally {
        setJoining(false);
      }
    };

    return (
      <div className="container">
        <div className="center-col" style={{ flex: 'none', marginBottom: 12 }}>
          <div className="brand" style={{ fontSize: '2rem' }}>
            <span className="brand-emoji" style={{ fontSize: '2rem' }}>
              💦
            </span>
            <span>Mitspielen</span>
          </div>
        </div>
        <form className="stack" onSubmit={submit}>
          {(localError || error) && <div className="error-banner">{localError || error}</div>}
          <div className="stack-sm">
            <label className="muted">Raumcode</label>
            <input
              className="input"
              style={{ textTransform: 'uppercase', letterSpacing: 4, textAlign: 'center' }}
              value={codeInput}
              maxLength={4}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="ABCD"
            />
          </div>
          <div className="stack-sm">
            <label className="muted">Dein Name</label>
            <input
              className="input"
              value={nameInput}
              maxLength={20}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="z.B. Alex"
            />
          </div>
          <div className="stack-sm">
            <div className="row-between">
              <span className="avatar avatar-lg" style={{ background: color }}>
                {avatar}
              </span>
              <div className="stack-sm" style={{ flex: 1 }}>
                <label className="muted">Avatar</label>
                <div className="emoji-picker">
                  {AVATAR_OPTIONS.slice(0, 12).map((em) => (
                    <button
                      type="button"
                      key={em}
                      className={avatar === em ? 'selected' : ''}
                      onClick={() => setAvatar(em)}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <label className="muted">Farbe</label>
            <div className="color-picker">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color-swatch ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={joining}>
            {joining ? 'Beitreten …' : '🚀 Beitreten'}
          </button>
          <button type="button" className="link-btn" onClick={() => navigate('/')}>
            Zurück
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="top-bar">
        <span className="row">
          <span className="avatar avatar-sm" style={{ background: me.colorHex }}>
            {me.avatarEmoji}
          </span>
          <strong>{me.name}</strong>
        </span>
        <span className="score badge">{me.score} Pkt</span>
      </div>

      {error && (
        <div className="error-banner" onClick={clearError} style={{ cursor: 'pointer' }}>
          {error} (antippen zum Schließen)
        </div>
      )}

      {(room.phase === 'lobby' || room.phase === 'game-select') && (
        <div className="stack">
          <div className="center-col" style={{ flex: 'none', gap: 6 }}>
            <span className="big-emoji floaty">🎉</span>
            <h2>Du bist drin!</h2>
            <p className="muted">Warte, bis der Host ein Spiel startet …</p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Alle Mitspieler:innen</h3>
            <PlayerList players={room.players} meId={me.id} />
          </div>
          <button className="btn btn-ghost" onClick={() => { leaveRoom(); navigate('/'); }}>
            Raum verlassen
          </button>
        </div>
      )}

      {room.phase === 'in-game' && gameId && <GamePlayerView gameId={gameId} view={playerView} />}

      {room.phase === 'round-results' && roundResults && <RoundResultsView results={roundResults} meId={me.id} />}

      {room.phase === 'party-over' && (
        <div className="stack">
          <PartyOverView players={room.players} meId={me.id} />
          <button
            className="btn btn-secondary btn-block"
            onClick={() => {
              leaveRoom();
              navigate('/');
            }}
          >
            Zur Startseite
          </button>
        </div>
      )}
    </div>
  );
}
