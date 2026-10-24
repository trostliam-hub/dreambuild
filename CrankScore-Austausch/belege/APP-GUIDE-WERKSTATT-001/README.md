# Nachweise: APP-GUIDE-WERKSTATT-001

Basis c956962, Funktionscode737ea6b, Anzeige-/UI-Prüfstand1965187, Veröffentlichungs-Prüfstandfa4b75a. Datum24.10.2026. Alle Browserprofile synthetisch und isoliert; kein echtes Nutzerprofil geöffnet.

- gesamttest-lokal.json/.txt:19Gruppen bestanden,294s. Der Lauf startete noch mit nicht committierten Änderungen und nennt deshalb Basisc956962. Einziger späterer App-Unterschied: Modellanzeigepräfix1965187, separat mitGuide-UI28/28 geprüft. GitHub prüft den endgültigen Veröffentlichungscommit zusätzlich vollständig.
- quellreview.json: unabhängige Quellprüfung ohne offene Blocker; Hashes des Anzeige-/Funktionsstands1965187.
- worker-tests.txt und worker-dryrun.txt:10/10 echte lokale Worker-/SQLite-Prüfungen mit simulierter API und Upload-Trockenlauf.
- worker-bindungscheck.json: nach tatsächlicher Bereitstellung gleiche Durable-Object-Namespace, Monatslimit1000, Secret-Bindung vorhanden. Keine Geheimniswerte ausgelesen oder gespeichert.
- worker-live.json: echte produktive Soforthilfe ohne Provideraufruf und genau eine kostenpflichtige Modellstichprobe im bestehenden Kontingent. Knacken nach Regen wird ausdrücklich als unsicher eingeordnet. Eine Stichprobe beweist keine allgemeine Modellfehlerfreiheit.
- sichtpruefung.json und drei PNGs: acht lokale390/320px-Ansichten, keine JS-Fehler oder Überstände, Rad-/Fahrwerkdaten erhalten.
- live-sichtpruefung.json und live-PNGs: dieselben acht Fälle direkt an der öffentlichen App, mit tatsächlich vorhandener synthetischer Wunschliste als Erhaltungsprobe. Früherer Probeaufbau ohne Wunschliste sah asynchron nur die Initialisierung wuensche:undefined→[]; kein Wunschverlust. Die Fixture wurde deshalb mit einem realen Testwunsch eingerichtet; keine Datenfelder aus dem Vergleich ausgeschlossen.
- preisarchiv-assettest.json: altes Tag ohne neue Datei bleibt gültig; neue Veröffentlichung erhält guide-safety.js zusätzlich zu Icons. Die produktive Offline-Cacheliste enthält die Datei ebenfalls.

EchteSafari-/iPhone-Prüfung und reale fachfremde Personen nicht vorhanden. Die endgültigen CI-/Liveversionsnachweise und der Abschluss stehen im neuesten Eintrag APP-GUIDE-WERKSTATT-001 in CODEX-ANTWORTEN.md.
