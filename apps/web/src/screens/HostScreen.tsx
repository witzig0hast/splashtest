import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getGameMeta } from '@splash/shared';
import { useStore } from '../state/store';
import { useRouter } from '../lib/router';
import { getServerUrl } from '../lib/serverUrl';
import PlayerList from '../components/PlayerList';
import GameSelectGrid from '../components/GameSelectGrid';
import GenrePicker from '../components/GenrePicker';
import RoundResultsView from '../components/RoundResultsView';
import PartyOverView from '../components/PartyOverView';
import GameHostView from '../games/GameHostView';

interface GenreOption {
  id: string;
  label: string;
}

export default function HostScreen() {
  const { path, navigate } = useRouter();
  const { room, code, gameId, hostView, gameName, roundResults, error, startGame, backToSelect, endParty, kickPlayer, resetParty, clearError } =
    useStore();

  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const [genres, setGenres] = useState<GenreOption[] | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const parts = path.split('/').filter(Boolean);
    const urlCode = parts[1]?.toUpperCase();
    if (urlCode) {
      useStore.getState().resumeHost(urlCode);
    } else {
      useStore
        .getState()
        .createRoom()
        .then((c) => navigate(`/host/${c}`));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (room?.phase === 'in-game' || error) {
      setStarting(false);
      setPendingGameId(null);
      setGenres(null);
    }
  }, [room?.phase, error]);

  if (!room || !code) {
    return (
      <div className="container center-col">
        <span className="big-emoji pulse">💦</span>
        <p className="muted">Party wird vorbereitet …</p>
      </div>
    );
  }

  const connectedCount = room.players.filter((p) => p.connected).length;
  const joinUrl = `${getServerUrl()}/play/${code}`;

  const handleEndParty = () => {
    if (window.confirm('Party wirklich beenden? Der Endstand wird gezeigt.')) endParty();
  };

  const handleSelectGame = async (id: string) => {
    setPendingGameId(id);
    setGenres(null);
    try {
      const res = await fetch(`${getServerUrl()}/api/games/${id}/genres`);
      const data: { genres: GenreOption[] } = await res.json();
      if (!data.genres || data.genres.length === 0) {
        setPendingGameId(null);
        startGame(id);
      } else {
        setGenres(data.genres);
      }
    } catch {
      setPendingGameId(null);
      startGame(id);
    }
  };

  const confirmGenre = (genreId: string) => {
    if (!pendingGameId) return;
    setStarting(true);
    startGame(pendingGameId, genreId);
  };

  return (
    <div className="container container-wide">
      <div className="top-bar">
        <span className="badge">💦 Splash Party</span>
        {room.phase !== 'party-over' && (
          <button className="btn btn-ghost btn-sm" onClick={handleEndParty}>
            Party beenden
          </button>
        )}
      </div>

      {(room.phase === 'lobby' || room.phase === 'game-select') && (
        <div className="stack">
          <div className="card" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <div className="qr-frame">
              <QRCodeSVG value={joinUrl} size={140} />
            </div>
            <div className="stack-sm" style={{ alignItems: 'center' }}>
              <span className="muted">Beitreten unter</span>
              <span className="code-display">{code}</span>
              <span className="muted">{joinUrl}</span>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Mitspieler:innen ({connectedCount})</h3>
            <PlayerList players={room.players} onKick={kickPlayer} />
          </div>

          <div className="stack">
            <h2 className="pop-title" style={{ textAlign: 'center' }}>
              Spiel wählen
            </h2>
            {error && (
              <div className="error-banner" onClick={clearError} style={{ cursor: 'pointer' }}>
                {error} (antippen zum Schließen)
              </div>
            )}
            {starting && pendingGameId ? (
              <div className="card center-col" style={{ flex: 'none', gap: 10, padding: 32 }}>
                <span className="big-emoji pulse">{getGameMeta(pendingGameId)?.emoji ?? '🎮'}</span>
                <p className="muted">{getGameMeta(pendingGameId)?.name} wird vorbereitet …</p>
              </div>
            ) : pendingGameId ? (
              <GenrePicker
                gameName={getGameMeta(pendingGameId)?.name ?? ''}
                genres={genres}
                loading={!genres}
                onSelect={confirmGenre}
                onCancel={() => {
                  setPendingGameId(null);
                  setGenres(null);
                }}
              />
            ) : (
              <GameSelectGrid connectedCount={connectedCount} playedGameIds={room.playedGameIds} onSelect={handleSelectGame} />
            )}
          </div>
        </div>
      )}

      {room.phase === 'in-game' && gameId && (
        <GameHostView gameId={gameId} gameName={gameName} view={hostView} players={room.players} />
      )}

      {room.phase === 'round-results' && roundResults && (
        <div className="stack">
          <RoundResultsView results={roundResults} />
          <div className="grid-2">
            <button className="btn btn-secondary btn-block" onClick={handleEndParty}>
              🏁 Party beenden
            </button>
            <button className="btn btn-primary btn-block" onClick={backToSelect}>
              🎮 Nächstes Spiel
            </button>
          </div>
        </div>
      )}

      {room.phase === 'party-over' && (
        <div className="stack">
          <PartyOverView players={room.players} />
          <button
            className="btn btn-accent btn-block"
            onClick={() => {
              resetParty();
              navigate('/');
            }}
          >
            🔄 Neue Party starten
          </button>
        </div>
      )}
    </div>
  );
}
