import { useState } from 'react';
import { useRouter } from '../lib/router';
import { getServerUrl, isCustomServerRelevant, setServerUrl } from '../lib/serverUrl';

export default function HomeScreen() {
  const { navigate } = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [serverInput, setServerInput] = useState(getServerUrl());

  return (
    <div className="container center-col">
      <div className="floaty" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <span className="sparkle" style={{ top: -14, left: -26 }}>
          ✨
        </span>
        <span className="sparkle" style={{ top: 6, right: -30, animationDelay: '0.6s' }}>
          ⭐
        </span>
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <span className="brand-emoji" style={{ fontSize: '2.9rem' }}>
            💦
          </span>
        </div>
        <div className="brand pop-title">
          <span>Splash Party</span>
        </div>
      </div>
      <p className="tagline">
        Das Party-Game für Handy &amp; Fernseher. Ein Gerät hostet, alle anderen spielen mit dem eigenen Handy mit –
        egal ob im selben Raum oder über das Internet.
      </p>

      <div className="wrap" style={{ justifyContent: 'center' }}>
        <span className="badge">🧠 10 Spielmodi</span>
        <span className="badge">♾️ Unbegrenzt Runden</span>
        <span className="badge">🆓 Komplett kostenlos</span>
      </div>

      <div className="stack" style={{ width: '100%', maxWidth: 320, marginTop: 8 }}>
        <button className="btn btn-primary btn-block" onClick={() => navigate('/host')}>
          🖥️ Party erstellen
        </button>
        <button className="btn btn-secondary btn-block" onClick={() => navigate('/play')}>
          📱 Mitspielen
        </button>
      </div>

      <div className="stack-sm" style={{ marginTop: 20, alignItems: 'center' }}>
        <button className="link-btn" onClick={() => setShowSettings((v) => !v)}>
          {isCustomServerRelevant() ? 'Server-Adresse einstellen' : 'Erweitert: Server-Adresse'}
        </button>
      </div>

      {showSettings && (
        <div className="card card-tight stack-sm" style={{ width: '100%', maxWidth: 320, marginTop: 10 }}>
          <span className="muted">
            Nur nötig, wenn ihr einen eigenen Server im lokalen WLAN nutzt (z.B. für Offline-Partys ohne Internet).
          </span>
          <input
            className="input"
            value={serverInput}
            onChange={(e) => setServerInput(e.target.value)}
            placeholder="https://dein-server.de"
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setServerUrl(serverInput);
              window.location.reload();
            }}
          >
            Speichern &amp; neu laden
          </button>
        </div>
      )}
    </div>
  );
}
