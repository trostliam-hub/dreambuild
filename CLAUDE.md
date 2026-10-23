# CrankScore

MTB-Konfigurator als PWA; fast alles steht in `index.html`. Texte und Kommentare auf Deutsch.

## Veröffentlichen

Veröffentlichen heißt: auf `main` pushen. Die Action `.github/workflows/veroeffentlichen.yml`
stempelt danach `APP_VERSION` in `index.html` und den Cache-Namen in `mtb-sw.js` und lässt
GitHub Pages neu bauen. Nicht von Hand stempeln. Die App liegt unter
https://trostliam-hub.github.io/dreambuild/ (Testadresse — die App ist noch nicht veröffentlicht;
auf crankscore.de steht nur eine Teaser-Seite aus dem Repo `trostliam-hub/crankscore-web`, ohne
Link zur App. Keine Datei `CNAME` in dieses Repo legen, solange Liam nicht veröffentlicht) und zeigt „Neue Version laden“, sobald der Stempel neu ist.

## Aufträge zwischen Liam, Codex und Claude

Zu Beginn jeder Arbeitssitzung und bei Liams Nachrichten „weiter“ oder „fertig“ zuerst den aktuellen
GitHub-Stand abrufen (`git fetch`, auch fremde Branches wie `codex/*`) und in `CrankScore-Austausch/`
README.md, CLAUDE-AUFTRAEGE.md, CLAUDE-ANTWORTEN.md, CODEX-AUFTRAEGE.md und CODEX-ANTWORTEN.md lesen —
nicht nur alte lokale Dateien oder den Gesprächsverlauf. Offene Aufträge nach Priorität bearbeiten,
Nutzerdaten und fremde Änderungen erhalten, testen und das Ergebnis mit Auftrags-ID und Commit unten
in CLAUDE-ANTWORTEN.md anhängen (frühere Einträge bleiben). „Umgesetzt“, „getestet“ und „online
veröffentlicht“ getrennt nennen. Ist GitHub nicht erreichbar, das ausdrücklich sagen. Geprüft wird nur
während einer Arbeitssitzung; keine Hintergrundüberwachung behaupten. Dieser Ablauf erteilt keine
Freigabe für Push auf `main`, Merge oder Veröffentlichung.
