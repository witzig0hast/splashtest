# 💦 Splash Party

Ein kostenloses Party-Game im Stil von *Splash* / Jackbox: **ein Gerät hostet**
den großen Bildschirm (Laptop, Fernseher per Cast/HDMI oder einfach ein
zweites Handy), **alle anderen spielen mit dem eigenen Handy mit** – per
Browser über das Internet *oder* offline im selben WLAN, und optional als
installierbare Android-App (APK).

10 Spielmodi, unbegrenzte Runden, komplett kostenlos, kein Login nötig.

## Spielmodi

| Modus | Beschreibung |
|---|---|
| 🧠 Quiz-Blitz | Multiple-Choice-Quiz, Punkte nach Schnelligkeit |
| 🎨 Kritzel-Duell | Malen & Erraten (wie Pictionary) |
| 🤔 Würdest du eher... | Zwei Optionen, alle stimmen ab |
| 👉 Am ehesten... | Die Gruppe zeigt auf eine Person |
| ✍️ Wortgefecht | Lückentext ausfüllen, witzigste Antwort gewinnt (Quiplash-Style) |
| 🕵️ Impostor | Ein:e Spieler:in kennt das geheime Wort nicht – wer fliegt auf? |
| ⚡ Blitzreflex | Reaktionstest: wer tippt am schnellsten? |
| 🔤 Emoji-Rätsel | Filme/Serien aus Emojis erraten |
| 📝 Kategorie-Blitz | Wörter zu Kategorie + Buchstabe gegen die Uhr |
| 🔥 Wahrheit oder Pflicht | Der Partyklassiker, mit Publikumsbewertung |

Neue Modi lassen sich einfach ergänzen, siehe [Architektur](#architektur--neuen-spielmodus-hinzufügen).

## Projektstruktur

```
apps/
  server/   Node.js + Express + Socket.IO – Räume, Spiellogik, Punktestand
  web/      React + Vite – Host-Bildschirm & Spieler-Controller (eine Codebasis)
  mobile/   Capacitor-Wrapper, der die Web-App als Android-APK verpackt
packages/
  shared/   Gemeinsame TypeScript-Typen & Spiele-Registry (Server ↔ Client)
```

Ein Raum lebt komplett im Server-Speicher (kein Datenbank-Setup nötig). Host
und Mitspieler:innen verbinden sich per WebSocket (Socket.IO); wer die Seite
neu lädt oder kurz die Verbindung verliert, kommt automatisch mit Name und
Punktestand zurück in den Raum.

## Voraussetzungen

- Node.js ≥ 20
- npm

## Lokal entwickeln

```bash
npm install

# Terminal 1: Spiele-Server (Port 8787)
npm run dev:server

# Terminal 2: Web-Client mit Hot-Reload (Port 5173, proxyt WebSockets zu 8787)
npm run dev:web
```

Dann `http://localhost:5173/host` für den Host-Bildschirm öffnen und
`http://localhost:5173/play` auf ein oder mehreren weiteren Geräten/Tabs für
die Mitspieler:innen.

## Produktion / Deployment

```bash
npm run build     # baut packages/shared, dann Server-Check, dann den Web-Client
npm start         # startet den Server auf $PORT (Standard 8787)
```

Der Server liefert im Produktionsmodus automatisch die gebaute Web-App aus
(`apps/web/dist`) – ein einziger Prozess reicht für Host-Bildschirm,
Mitspieler-Seiten und die Spiellogik. Einfach auf einem beliebigen Node-Host
(Render, Railway, Fly.io, eigener VPS, …) deployen und die öffentliche URL
teilen – dann funktioniert "übers Handy anrufen, Website aufrufen, mitspielen"
von überall auf der Welt.

### Offline-Party im lokalen WLAN (ohne Internet)

Der Server läuft genauso gut auf einem Laptop im selben WLAN wie die Gäste:

```bash
npm run build && npm start
```

Alle Handys verbinden sich dann statt mit einer öffentlichen Domain mit der
lokalen IP des Laptops, z. B. `http://192.168.1.23:8787`. Für die Android-App
lässt sich diese Adresse direkt in den Einstellungen (Startbildschirm →
„Server-Adresse einstellen“) eintragen.

## Android-APK bauen

Die App ist als [Capacitor](https://capacitorjs.com)-Projekt in `apps/mobile`
eingerichtet; die Android-Plattform liegt bereits fertig gescaffoldet unter
`apps/mobile/android`.

```bash
npm run build:web                 # aktuelle Web-App bauen
cd apps/mobile
npx cap sync android              # gebaute Web-App ins Android-Projekt kopieren
npx cap open android              # öffnet das Projekt in Android Studio
```

In Android Studio dann ganz normal **Run** (auf Gerät/Emulator) oder
**Build → Build Bundle(s)/APK(s) → Build APK(s)**. Alternativ ohne Android
Studio direkt per Gradle:

```bash
cd apps/mobile/android
./gradlew assembleDebug           # braucht Android SDK + Internetzugriff auf Googles Maven-Repo
```

Die fertige APK liegt danach unter
`apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

> Diese Entwicklungs-Sandbox hier konnte den Gradle-Build nicht zu Ende
> ausführen, weil ausgehende Verbindungen zu `dl.google.com` (Googles
> Maven-Repository, nötig für das Android-Gradle-Plugin) und der Android SDK
> selbst hier durch die Netzwerk-Policy der Umgebung blockiert sind. Auf
> einem normalen Rechner mit installiertem Android Studio bzw. in einer
> CI-Pipeline mit Android-SDK funktioniert `./gradlew assembleDebug` /
> `npx cap open android` ganz normal.

Die App bündelt die Web-App direkt in der APK (funktioniert also auch ohne
Internet als Shell) und spricht den Spiele-Server über eine separat
einstellbare Adresse an (Startbildschirm → „Server-Adresse einstellen“) – so
kann dieselbe APK sowohl mit dem öffentlich gehosteten Server als auch für
Offline-Partys im lokalen WLAN benutzt werden.

Ein eigenes App-Icon lässt sich mit
[`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets) aus
einem Quellbild generieren (`npx @capacitor/assets generate` im Ordner
`apps/mobile`).

## Architektur / neuen Spielmodus hinzufügen

1. **Metadaten**: Eintrag in `packages/shared/src/games/registry.ts`
   (`id`, Name, Emoji, Farbe, min/max Spielerzahl).
2. **Verträge**: Host-/Player-View-Typen und Aktionstypen in
   `packages/shared/src/games/contracts.ts`.
3. **Serverlogik**: neue Klasse in `apps/server/src/games/<id>.ts`, die das
   `GameModule`-Interface implementiert (`onPlayerAction`, `getHostView`,
   `getPlayerView`, …) und in `apps/server/src/games/index.ts` in
   `GAME_FACTORIES` registrieren.
4. **UI**: `apps/web/src/games/<id>/Host.tsx` und `Player.tsx`, dann in
   `GameHostView.tsx` / `GamePlayerView.tsx` einhängen.

Der Raum-/Lobby-Flow, Punktestand, Reconnect-Logik, QR-Code-Beitritt usw. sind
generisch und müssen dafür nicht angefasst werden.

## Bekannte Grenzen / mögliche nächste Schritte

- Punktestand & Räume leben nur im Server-RAM (kein Cluster-/Redis-Setup) –
  für eine Party-App völlig ausreichend, aber kein Multi-Instanz-Deployment.
- Kein eigenes App-Icon für die APK (Standard-Capacitor-Icon), siehe oben.
- Keine automatisierten Tests im Repo; der komplette Host→Join→Spiel→Ergebnis-
  Flow wurde manuell per Playwright/Chromium durchgespielt (Quiz + Blitzreflex,
  inkl. vorzeitigem Party-Ende während eines laufenden Spiels).
