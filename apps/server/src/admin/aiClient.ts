import type { StoredAiModel } from './store.js';
import type { ContentSpec } from './contentSpecs.js';

const REQUEST_TIMEOUT_MS = 20000;

function extractJsonArray(text: string): unknown[] {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('[');
  const end = candidate.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Antwort enthielt kein JSON-Array.');
  }
  const parsed = JSON.parse(candidate.slice(start, end + 1));
  if (!Array.isArray(parsed)) throw new Error('Antwort war kein Array.');
  return parsed;
}

export async function generateContentWithAI(model: StoredAiModel, spec: ContentSpec, count: number): Promise<unknown[]> {
  const systemPrompt =
    'Du erzeugst Inhalte für ein deutschsprachiges Handy-Partyspiel für Jugendliche. ' +
    'Schreibe locker, zeitgemäß und alltagsnah (Social Media, Gaming, Internetkultur) - aber jugendfrei, ohne beleidigende, diskriminierende, sexuelle oder gefährliche Inhalte. ' +
    'Antworte AUSSCHLIESSLICH mit einem validen JSON-Array, ohne Erklärtext, ohne Markdown-Codeblock.';

  const userPrompt =
    `Erzeuge genau ${count} Einträge für das Spiel "${spec.gameName}".\n` +
    `Jeder Eintrag muss exakt diesem Format entsprechen: ${spec.itemSchemaHint}\n` +
    `Beispiel für einen einzelnen Eintrag: ${JSON.stringify(spec.exampleItem)}\n` +
    `Gib nur das JSON-Array der ${count} Einträge zurück, sonst nichts.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(model.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${model.apiKey}`,
      },
      body: JSON.stringify({
        model: model.model,
        temperature: 0.9,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`KI-Anfrage fehlgeschlagen (${res.status}): ${body.slice(0, 200)}`);
    }
    const data: unknown = await res.json();
    const content = extractMessageContent(data);
    const items = extractJsonArray(content);
    const valid = items.filter((it) => spec.validate(it));
    if (valid.length < Math.min(3, count)) {
      throw new Error(`Nur ${valid.length} gültige Einträge von der KI erhalten.`);
    }
    return valid;
  } finally {
    clearTimeout(timeout);
  }
}

function extractMessageContent(data: unknown): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'choices' in data &&
    Array.isArray((data as { choices: unknown }).choices)
  ) {
    const choice = (data as { choices: unknown[] }).choices[0];
    if (
      typeof choice === 'object' &&
      choice !== null &&
      'message' in choice &&
      typeof (choice as { message: unknown }).message === 'object'
    ) {
      const message = (choice as { message: { content?: unknown } }).message;
      if (typeof message.content === 'string') return message.content;
    }
  }
  throw new Error('Unerwartetes Antwortformat vom KI-Endpunkt (erwarte OpenAI-kompatibles Chat-Completions-Format).');
}
