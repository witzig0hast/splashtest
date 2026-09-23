import { Router } from 'express';
import type { CreateAiModelPayload, CreateContentPackPayload, GameContentSpecInfo } from '@splash/shared';
import { checkPassword, issueToken, requireAdmin } from './auth.js';
import { adminStore, toPublicModel } from './store.js';
import { CONTENT_SPECS } from './contentSpecs.js';

export const adminRouter = Router();

adminRouter.post('/login', (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!checkPassword(password)) {
    res.status(401).json({ error: 'Falsches Passwort.' });
    return;
  }
  res.json({ token: issueToken() });
});

adminRouter.use(requireAdmin);

adminRouter.get('/games', (_req, res) => {
  const list: GameContentSpecInfo[] = Object.values(CONTENT_SPECS).map((s) => ({
    gameId: s.gameId,
    gameName: s.gameName,
    itemSchemaHint: s.itemSchemaHint,
    exampleItem: s.exampleItem,
    countNeeded: s.countNeeded,
  }));
  res.json(list);
});

adminRouter.get('/models', (_req, res) => {
  res.json(adminStore.listModels().map(toPublicModel));
});

adminRouter.post('/models', (req, res) => {
  const body = req.body as Partial<CreateAiModelPayload>;
  if (!body.label || !body.endpointUrl || !body.model || !body.apiKey) {
    res.status(400).json({ error: 'label, endpointUrl, model und apiKey sind erforderlich.' });
    return;
  }
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(body.endpointUrl);
  } catch {
    res.status(400).json({ error: 'endpointUrl ist keine gültige URL.' });
    return;
  }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    res.status(400).json({ error: 'endpointUrl muss http oder https sein.' });
    return;
  }
  const created = adminStore.addModel({
    label: body.label,
    endpointUrl: body.endpointUrl,
    model: body.model,
    apiKey: body.apiKey,
  });
  res.status(201).json(toPublicModel(created));
});

adminRouter.post('/models/:id/activate', (req, res) => {
  const ok = adminStore.activateModel(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Modell nicht gefunden.' });
    return;
  }
  res.json({ ok: true });
});

adminRouter.delete('/models/:id', (req, res) => {
  const ok = adminStore.deleteModel(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Modell nicht gefunden.' });
    return;
  }
  res.json({ ok: true });
});

adminRouter.get('/packs', (_req, res) => {
  res.json(adminStore.listPacks());
});

adminRouter.post('/packs', (req, res) => {
  const body = req.body as Partial<CreateContentPackPayload>;
  if (!body.gameId || !body.genre || !body.label || !Array.isArray(body.items)) {
    res.status(400).json({ error: 'gameId, genre, label und items (Array) sind erforderlich.' });
    return;
  }
  const spec = CONTENT_SPECS[body.gameId];
  if (!spec) {
    res.status(400).json({ error: `Unbekanntes Spiel "${body.gameId}".` });
    return;
  }
  if (body.items.length === 0) {
    res.status(400).json({ error: 'items darf nicht leer sein.' });
    return;
  }
  const invalidIndexes = body.items.map((it, i) => (spec.validate(it) ? -1 : i)).filter((i) => i >= 0);
  if (invalidIndexes.length > 0) {
    res.status(400).json({
      error: `${invalidIndexes.length} Eintrag/Einträge entsprechen nicht dem Format ${spec.itemSchemaHint}.`,
      invalidIndexes,
    });
    return;
  }
  if (body.genre === 'classic' || body.genre === 'jugendlich' || body.genre === 'ki') {
    res.status(400).json({ error: `"${body.genre}" ist ein reservierter Genre-Name. Bitte einen eigenen Namen wählen.` });
    return;
  }
  const created = adminStore.addPack({ gameId: body.gameId, genre: body.genre, label: body.label, items: body.items });
  res.status(201).json(created);
});

adminRouter.delete('/packs/:id', (req, res) => {
  const ok = adminStore.deletePack(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Paket nicht gefunden.' });
    return;
  }
  res.json({ ok: true });
});
