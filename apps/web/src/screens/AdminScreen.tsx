import { useEffect, useState } from 'react';
import type { AiModelConfig, ContentPack, GameContentSpecInfo } from '@splash/shared';
import { useRouter } from '../lib/router';
import { adminApi, adminLogin, clearAdminToken, getAdminToken } from '../lib/adminApi';

export default function AdminScreen() {
  const { navigate } = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) {
      setCheckedAuth(true);
      return;
    }
    adminApi
      .listModels()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
      .finally(() => setCheckedAuth(true));
  }, []);

  if (!checkedAuth) {
    return (
      <div className="container center-col">
        <span className="big-emoji pulse">🔐</span>
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} onBack={() => navigate('/')} />;
  }

  return <AdminDashboard onLogout={() => { clearAdminToken(); setAuthed(false); }} />;
}

function AdminLogin({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container center-col">
      <form className="card stack" style={{ width: '100%', maxWidth: 360 }} onSubmit={submit}>
        <h2 className="pop-title" style={{ textAlign: 'center' }}>
          🔐 Admin-Bereich
        </h2>
        {error && <div className="error-banner">{error}</div>}
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin-Passwort"
          autoFocus
        />
        <button className="btn btn-primary btn-block" type="submit" disabled={loading || !password}>
          {loading ? 'Prüfe …' : 'Anmelden'}
        </button>
        <button type="button" className="link-btn" onClick={onBack}>
          Zurück
        </button>
      </form>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<'models' | 'packs'>('models');
  return (
    <div className="container container-wide">
      <div className="top-bar">
        <span className="badge">🔐 Admin</span>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>
          Abmelden
        </button>
      </div>
      <div className="pill-toggle" style={{ maxWidth: 420, marginBottom: 18 }}>
        <button className={tab === 'models' ? 'active' : ''} onClick={() => setTab('models')}>
          🤖 KI-Modelle
        </button>
        <button className={tab === 'packs' ? 'active' : ''} onClick={() => setTab('packs')}>
          📝 Fragen-Pakete
        </button>
      </div>
      {tab === 'models' ? <ModelsPanel /> : <PacksPanel />}
    </div>
  );
}

function ModelsPanel() {
  const [models, setModels] = useState<AiModelConfig[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', endpointUrl: '', model: '', apiKey: '' });
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.listModels().then(setModels).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await adminApi.addModel(form);
      setForm({ label: '', endpointUrl: '', model: '', apiKey: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack">
      <p className="tagline" style={{ maxWidth: 640 }}>
        Trage hier einen beliebigen OpenAI-kompatiblen Chat-Completions-Endpunkt ein (z.B. OpenAI, ein Proxy für Claude,
        OpenRouter, Ollama …). Das <strong>aktive</strong> Modell wird verwendet, wenn beim Spielstart „🤖 KI-generiert"
        gewählt wird. Es kann immer nur ein Modell gleichzeitig aktiv sein.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Konfigurierte Modelle</h3>
        {models === null && <p className="muted">Lädt …</p>}
        {models?.length === 0 && <p className="muted">Noch kein Modell hinterlegt.</p>}
        <div className="stack-sm">
          {models?.map((m) => (
            <div key={m.id} className="player-row" style={{ flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="name">
                  {m.label} {m.active && <span className="badge">aktiv</span>}
                </div>
                <div className="muted" style={{ fontSize: '0.78rem' }}>
                  {m.model} · {m.endpointUrl} · Key {m.apiKeyMasked}
                </div>
              </div>
              <div className="row">
                {!m.active && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => adminApi.activateModel(m.id).then(load)}
                  >
                    Aktivieren
                  </button>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (confirm(`"${m.label}" wirklich löschen?`)) adminApi.deleteModel(m.id).then(load);
                  }}
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form className="card stack" onSubmit={submit}>
        <h3>Neues Modell hinzufügen</h3>
        <div className="stack-sm">
          <label className="muted">Bezeichnung</label>
          <input
            className="input"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="z.B. GPT-4o mini"
            required
          />
        </div>
        <div className="stack-sm">
          <label className="muted">Endpoint-URL (Chat Completions)</label>
          <input
            className="input"
            value={form.endpointUrl}
            onChange={(e) => setForm({ ...form, endpointUrl: e.target.value })}
            placeholder="https://api.openai.com/v1/chat/completions"
            required
          />
        </div>
        <div className="stack-sm">
          <label className="muted">Modellname</label>
          <input
            className="input"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            placeholder="z.B. gpt-4o-mini"
            required
          />
        </div>
        <div className="stack-sm">
          <label className="muted">API-Key</label>
          <input
            className="input"
            type="password"
            value={form.apiKey}
            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            placeholder="sk-…"
            required
          />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
          {saving ? 'Speichere …' : 'Modell speichern'}
        </button>
      </form>
    </div>
  );
}

function PacksPanel() {
  const [games, setGames] = useState<GameContentSpecInfo[] | null>(null);
  const [packs, setPacks] = useState<ContentPack[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameId, setGameId] = useState('');
  const [genre, setGenre] = useState('');
  const [label, setLabel] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminApi.listGames().then((g) => {
      setGames(g);
      if (!gameId && g[0]) setGameId(g[0].gameId);
    });
    adminApi.listPacks().then(setPacks).catch((e) => setError(e.message));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const selectedGame = games?.find((g) => g.gameId === gameId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let items: unknown[];
    try {
      items = JSON.parse(itemsText);
      if (!Array.isArray(items)) throw new Error('Muss ein JSON-Array sein.');
    } catch {
      setError('Kein gültiges JSON-Array. Beispiel siehe Hinweis unten.');
      return;
    }
    setSaving(true);
    try {
      await adminApi.addPack({ gameId, genre, label, items });
      setLabel('');
      setItemsText('');
      setGenre('');
      adminApi.listPacks().then(setPacks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack">
      <p className="tagline" style={{ maxWidth: 640 }}>
        Eigene Fragen/Prompts für ein Spiel unter einem eigenen Genre-Namen hinzufügen (nicht „classic"/„jugendlich" -
        die sind fest eingebaut). Der Genre-Name erscheint dann als zusätzliche Auswahl beim Spielstart.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Vorhandene Pakete</h3>
        {packs?.length === 0 && <p className="muted">Noch kein eigenes Paket angelegt.</p>}
        <div className="stack-sm">
          {packs?.map((p) => (
            <div key={p.id} className="player-row">
              <div style={{ flex: 1 }}>
                <div className="name">{p.label}</div>
                <div className="muted" style={{ fontSize: '0.78rem' }}>
                  {p.gameId} · Genre „{p.genre}" · {p.items.length} Einträge
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (confirm(`"${p.label}" wirklich löschen?`)) adminApi.deletePack(p.id).then(() => adminApi.listPacks().then(setPacks));
                }}
              >
                Löschen
              </button>
            </div>
          ))}
        </div>
      </div>

      <form className="card stack" onSubmit={submit}>
        <h3>Neues Paket hinzufügen</h3>
        <div className="stack-sm">
          <label className="muted">Spiel</label>
          <select className="input" value={gameId} onChange={(e) => setGameId(e.target.value)}>
            {games?.map((g) => (
              <option key={g.gameId} value={g.gameId}>
                {g.gameName}
              </option>
            ))}
          </select>
        </div>
        <div className="stack-sm">
          <label className="muted">Genre-Name (frei wählbar, z.B. "Fußball", "Anime")</label>
          <input className="input" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Eigener Genre-Name" required />
        </div>
        <div className="stack-sm">
          <label className="muted">Paket-Bezeichnung</label>
          <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="z.B. Fußball-Fragen" required />
        </div>
        <div className="stack-sm">
          <label className="muted">Einträge als JSON-Array</label>
          {selectedGame && (
            <p className="muted" style={{ fontSize: '0.78rem' }}>
              Format je Eintrag: <code>{selectedGame.itemSchemaHint}</code>
              <br />
              Beispiel: <code>{JSON.stringify(selectedGame.exampleItem)}</code> · empfohlen ≥ {selectedGame.countNeeded} Einträge
            </p>
          )}
          <textarea
            className="input"
            style={{ minHeight: 160, fontFamily: 'monospace', fontSize: '0.85rem' }}
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            placeholder={selectedGame ? JSON.stringify([selectedGame.exampleItem, selectedGame.exampleItem], null, 2) : '[]'}
            required
          />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
          {saving ? 'Speichere …' : 'Paket speichern'}
        </button>
      </form>
    </div>
  );
}
