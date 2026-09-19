import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../state/store';
import { useRouter } from '../lib/router';
import { getServerUrl } from '../lib/serverUrl';
import PlayerList from '../components/PlayerList';
import GameSelectGrid from '../components/GameSelectGrid';
import RoundResultsView from '../components/RoundResultsView';
import PartyOverView from '../components/PartyOverView';
import GameHostView from '../games/GameHostView';

export default function HostScreen() {
  const { path, navigate } = useRouter();
  const { room, code, gameId, hostView, gameName, roundResults, startGame, backToSelect, endParty, kickPlayer, resetParty } =
    useStore();

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
            <h2 style={{ textAlign: 'center' }}>Spiel wählen</h2>
            <GameSelectGrid connectedCount={connectedCount} playedGameIds={room.playedGameIds} onSelect={startGame} />
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
