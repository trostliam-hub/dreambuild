# Prüfungen und Antworten von Codex

Neue Einträge unten anhängen. Historie erhalten.

---

## LIVE-001 — Animationsprüfung der öffentlichen App
- Autor: Codex
- Datum: 08.10.2026, Prüfung im Gespräch vor 19:04 Uhr Europe/Berlin
- Status: ERLEDIGT (Live-Prüfung); neue Animationen weiterhin nicht live nachgewiesen
- URL: https://trostliam-hub.github.io/dreambuild/index.html
- Live-Version: 20261008-1721, in den Einstellungen 08.10.2026, 17:21 Uhr
- Eigene Codeänderungen: keine
- Veröffentlichung durch Codex: NEIN

### Selbst geprüfte Befunde
- App im Cloud-Chromium geöffnet, Einrichtung übersprungen, Einstellungen geöffnet und von OLED-Schwarz nach Hell und wieder zurück geschaltet. Beide gewählten Zustände wurden in der Oberfläche bestätigt.
- prefers-reduced-motion war im Prüf-Browser false.
- Öffentliche index.html separat heruntergeladen und geprüft. APP_VERSION ist 20261008-1721.
- Kein startViewTransition und keine view-transition-Regeln im gelieferten HTML. Auch die geladenen Inline-Styles enthalten keine view-transition-Regeln.
- Der Design-Handler setzt document.documentElement.dataset.theme direkt, speichert mtb.design, setzt theme-color und ruft oeffneMenu() auf. Die berichtete neue 300-ms-Überblendung fehlt in diesem Stand.
- Ältere CSS-Animationen sind vorhanden: Button-Feedback, Modus-Pille, Score-Ringe, Dialog-Einblendung und Onboarding. Daraus folgt nicht, dass die neuen Animationen veröffentlicht sind.

### Grenzen
Keine frameweise Videoauswertung, kein echter iPhone-/Safari-Test. Die Feststellung zum fehlenden neuen Hell-Dunkel-Effekt beruht auf der UI-Prüfung und dem öffentlich gelieferten Code. Nicht alle vorhandenen Animationen wurden einzeln interaktiv getestet.

### Abgleich mit Claude
Nachtrag 7 berichtet Commit 5de6344 auf claude/crankscore-app-changes-nz88ir und ausdrücklich noch keine Veröffentlichung. Dieser Bericht erklärt den beobachteten alten Live-Stand. Branch-Code wurde von Codex nicht geprüft.

### Nächster Schritt
APP-ANIM-001 an Claude: Stand prüfen, verbleibende Schritte dokumentieren und nach autorisierter Veröffentlichung eine konkrete Nachprüfung anfordern.

---

## KOM-001 — Austauschordner eingerichtet
- Autor: Codex
- Datum: 08.10.2026
- Status: ERLEDIGT (Dateien und Ablauf erstellt); gemeinsamer Zugriff noch nicht eingerichtet
- Ergebnis: README sowie getrennte Auftrags- und Antwortdateien erstellt. Liams hochgeladene CLAUDE-ANTWORTEN.md vollständig übernommen. Erster Folgeauftrag APP-ANIM-001 eingetragen.
- Zugriff: Codex kann die bereitgestellten Dateien bearbeiten. Claude muss denselben aktuellen Ordner erhalten. Ein automatischer Austausch zwischen getrennten Umgebungen besteht nicht.
- Regel für kommende aktive CrankScore-Aufgaben: aktuelle Austauschdateien zuerst lesen; nach eigener Fertigstellung selbständig dokumentieren. Bei „fertig“ neueste Einträge prüfen. Keine Hintergrundüberwachung zugesagt.


---

## APP-PETROL-001 — Gedämpftes Petrol, Veröffentlichung blockiert
- Autor: Codex · Empfänger: Liam
- Datum: 13.10.2026, 11:22 Uhr Europe/Berlin
- Status: BLOCKIERT (Upload); Code fertig, Tests bestanden.
- Nutzerfreigabe: Änderung und Veröffentlichung ausdrücklich freigegeben.
- Repository: trostliam-hub/dreambuild, Branch main.
- Basis: aktueller main-Stand 4a3310bb3ef30c7947f1e837ee37b186a2228ede.
- Lokaler Code-Commit: ff3742e. Nicht auf GitHub hochgeladen.
- Öffentliche App: https://trostliam-hub.github.io/dreambuild/index.html
- Selbst abgerufene Live-Version: 20261012-2214. Petrol-Palette öffentlich nicht vorhanden.
- Veröffentlichung: NEIN. Es wurde kein Veröffentlichungsworkflow ausgelöst.

### Umsetzung
- Hellmodus: Hauptakzent #176B67, weiche Akzentfläche #E3F0EC.
- Dunkelmodus: Akzenttexte und Gesamtring #8CC9C1, gefüllte Buttons #246C66 mit weißer Schrift.
- Kleine Score-Ringe: beide neutralgrau, hell #6E7976, dunkel #8B9794.
- Gesamtring ohne Leuchten; auch der Vorschau-Ring auf der Startseite hat keinen Schattenfilter mehr.
- Buttons, aktive Auswahlflächen, Links, SVG-Logo-Akzente, Fahrwerk-Markierungen und feste blaue Akzente der Startseite konsistent angepasst.
- Warme helle Flächen, Anthrazitflächen und Warn-/Fehlerfarben erhalten.
- Keine Änderungen an Rechenregeln, Speicherung, Profilstruktur oder Nutzerdaten. Keine manuelle Änderung von APP_VERSION oder Service-Worker-Cache.

### Eigene Prüfungen
- npm test am endgültigen Code: ALLE TESTS BESTANDEN, 165 Sekunden.
  - Syntax: 2 Skripte.
  - Kompatibilität: 200/200.
  - Setup und Speicher: 16/16.
  - Bedienwege: 36/36.
  - Sprache: 0 Funde in 8.752 Texten.
  - BEVEL-Szenarien: 28/28.
  - Preis-Skript offline: 0 Fehler.
- Chromium/Playwright, 390 und 1280 px, Hell und Dunkel: Hauptansicht und Fahrwerk visuell geprüft und aufgenommen.
- Tatsächlich berechnete SVG-Striche entsprechen der Palette. Kein Glow, keine JS-Fehler, kein horizontaler Überstand in den vier Hauptansichten.
- Hell → Dunkel → Hell und Dunkel → Hell → Dunkel über die Einstellungsbuttons: geprüfte Profil-, Plan- und Fahrwerkdaten bleiben erhalten. Der Test initialisiert vor dem Vergleich das bestehende leere upNein-Feld; diese vorhandene Lazy-Initialisierung ist keine Datenänderung durch den Patch.
- Kontrast sichtbarer Texte in 9 Ansichten × 2 Themes × 2 Breiten: 0 Unterschreitungen in 1.056 Texten. Das historische Prüfszenario für Vergleich wurde auf die aktuelle Teilewahl angepasst, weil sein alter Selektor nicht mehr existiert.
- WCAG-Kontrast: weiße Buttontexte hell 6,30:1, dunkel 6,15:1. Akzenttexte auf geprüften Flächen mindestens 5,05:1; kleine Ringe mindestens 3,62:1.
- git diff --check ohne Befund.
- Öffentliche index.html selbst mit curl abgerufen: Version 20261012-2214, keine Petrol-Palette.
- Kein echter iPhone-/Safari-Test. Nur lokale Chromium-Sichtprüfung der neuen Palette; keine Live-Sichtprüfung eines neuen Stands möglich, da nicht veröffentlicht.

### Belege und Blockade
- belege/APP-PETROL-001/: Testberichte, Kontrastbericht, reproduzierbare Prüfscripte und Bildschirmaufnahmen.
- GitHub-Connector: create_blob verweigert mit HTTP 403, „Resource not accessible by integration“.
- GitHub CLI: gh auth status bestätigt Anmeldung als trostliam-hub; Repository-Metadaten melden push/admin-Rechte des Kontos. Trotzdem verweigert der authentifizierte git push origin HEAD:main HTTP 403: „Permission to trostliam-hub/dreambuild.git denied to trostliam-hub.“
- Die Kontorechte sind somit kein Nachweis für ausreichende Schreibberechtigung der verbundenen Zugangsdaten. Keine Zugangsdaten ausgelesen oder verändert.
- Nächster Schritt: GitHub-Verbindung/Zugang für dieses Repository mit Contents-Schreibrecht bereitstellen. Danach main erneut abgleichen, geprüften Patch pushen, bestehenden Workflow Veroeffentlichen beobachten, automatisch gestempelte Live-Version und öffentliche App erneut prüfen und diesen Bericht ergänzen.


### APP-PETROL-001 — Nachtrag: Ursache des fehlenden Schreibzugriffs
- Datum: 13.10.2026, 11:31 Uhr Europe/Berlin; Autor: Codex; Status: BLOCKIERT.
- Erneut mit aktueller Verbindung geprüft. main ist unverändert auf 4a3310b, lokaler Stand enthält die geprüfte Palette.
- Authentifizierter Benutzer: trostliam-hub (Connector und GitHub CLI).
- GitHub-App-Installation: ausschließlich Finnthefirst06, ID 160626373, App chatgpt-codex-connector, Repository-Auswahl all.
- Die App hat bereits contents:write und workflows:write. Es fehlt keine allgemein anzufordernde Schreibberechtigung; die Installation fehlt konkret auf dem Repository-Eigentümerkonto trostliam-hub.
- Erneuter authentifizierter Push: HTTP 403. Veröffentlichung weiterhin NEIN.
- Passender Installationsweg: https://github.com/apps/chatgpt-codex-connector — Install, Konto trostliam-hub, Repository dreambuild auswählen.
- Nach erfolgter Installation Zugriff und aktuellen main erneut prüfen, Veröffentlichung mit bestehender Nutzerfreigabe fortsetzen.


### APP-PETROL-001 — Abschluss: veröffentlicht und öffentlich geprüft
- Autor: Codex · Empfänger: Liam · Datum: 13.10.2026, 11:44 Uhr Europe/Berlin.
- Status: ERLEDIGT. Code fertig, Tests bestanden, tatsächlich live.
- GitHub-App nun auch auf trostliam-hub installiert; authentifizierter Push erfolgreich.
- Basis unverändert 4a3310b; veröffentlichter Prüfstand d5c969cb9ac460bcbecadc159dd41fc18d1461e1, Palette-Code ff3742e.
- Automatisch gestempelter App-Commit: cb8585a54fcb8c10b7b92170953cb6b388bd19d9.
- Live-Version: **20261013-1138**. Keine manuelle Stempeländerung.
- Veröffentlichung: **JA**, über den bestehenden Workflow Veroeffentlichen. Lauf erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/38377352380.
- Tests des Workflows: alle bestanden, 154 s; Syntax 2 Skripte, Kompatibilität 200/200, Setup/Speicher 16/16, Bedienwege 36/36, Sprache 0 Funde in 8.752 Texten, BEVEL 28/28, Preis-Skript 0 Fehler.
- Workflow bestätigt „Live: Version 20261013-1138“. Öffentliche index.html zusätzlich selbst abgerufen: identisch mit dem automatisch gestempelten Commit. Gegenüber dem geprüften Stand ändert sich im App-Code ausschließlich APP_VERSION.
- Öffentliche App: https://trostliam-hub.github.io/dreambuild/index.html.
- Eigene Live-Browserprüfung in Chromium/Playwright: 390 und 1280 px, Hell und Dunkel. Alle vier Fälle zeigen Version 20261013-1138 und die korrekten Farbvariablen/Score-Striche; Gesamtring ohne Filter, kein horizontaler Überstand und keine JS-Fehler. Profil-, Plan- und Fahrwerkdaten vor/nach tatsächlichen Themewechseln identisch.
- Live-Kontrastprüfung: 0 Unterschreitungen in 1.056 sichtbaren Texten. Die zuvor dokumentierten WCAG-Kontraste sind weiterhin erfüllt.
- Hauptansicht und Fahrwerk der öffentlichen App aufgenommen; Hauptansichten visuell betrachtet. Warmes Hell und Anthrazit erhalten, Akzente Petrol, kleine Ringe Grau. Warn-/Fehlerfarben und Funktionen unverändert.
- Belege: belege/APP-PETROL-001/live-palette.json, live-kontrast.txt, live-*.png und veroeffentlichung.txt. Prüfscripte unterstützen nun auch die öffentliche URL über den vorhandenen Proxy; Palette wird ausdrücklich gegen Sollwerte geprüft.
- Grenzen: Chromium-Prüfung, kein echter iPhone-/Safari-Test. Artefakt-Download wurde vom Azure-Endpunkt verweigert; vollständiges GitHub-Workflow-Log mit allen Testergebnissen erfolgreich gesichert.
- Bestehende Pages-Quelle ist legacy (Deploy from branch). Der vorhandene Workflow warnt, dass dies kein allgemeines Test-Tor vor jedem Pages-Build ist; die Quelle wurde im Rahmen dieses Farbauftrags nicht geändert. Diese Änderung war bereits vor dem Push lokal vollständig getestet, danach ebenfalls im Veröffentlichungsworkflow.
- Frühere BLOCKIERT-Einträge dokumentieren den damaligen Stand; diese Abschlussprüfung löst die Blockade auf. Keine offenen Schritte für diesen Auftrag.


---

## APP-SW-001 — Nutzerkorrektur: Schwarz/Weiß statt Petrol
- Autor: Codex · Empfänger: Liam
- Datum: 13.10.2026, 13:36 Uhr (Europe/Berlin).
- Status: PRÜFBEREIT, Veröffentlichung im fortgeführten Nutzerauftrag freigegeben.
- Basis: aktueller `main` `48772969096d8f378def8c28e59331fe21c9db14`, Version `20261013-1138`. Isolierter Checkout; frühere lokale Commits nicht erneut übertragen.
- Änderung: Petrol vollständig aus den Markenakzenten entfernt. Hell schwarze Akzenttexte/Gesamtring/Buttons `#14171B`, weiße Schrift auf gefüllten Aktionen; dunkel weiße Akzenttexte/Gesamtring/Buttons `#FFFFFF`, dunkle Schrift `#14171B`. Weiche Flächen neutralgrau. Links, aktive Auswahlen, Guide, Logo, Fahrwerk-Markierungen und Startseiten-Akzente konsistent angepasst. Kleiner Score neutralgrau, warme Hellflächen und Anthrazit erhalten. Keine Änderung der Statusfarben, kein Leuchten.
- Kontrast auf gefüllten Buttons, Nummern und SVG-Adapterbeschriftungen an das neue Farbsystem angepasst.
- Keine Daten- oder Funktionsänderung. Alle eingebetteten Skripte gegenüber Basis identisch bis auf Startseiten-Ringfarbe und Farbkommentar.
- `npm test`: alle bestanden, 144 s — Syntax 2 Skripte, Kompatibilität 200/200, Setup/Speicher 16/16, Wege 36/36, Sprache 0 Funde in 8.752 Texten, BEVEL 28/28, Preis-Skript 0 Fehler.
- Chromium: Hell/Dunkel, 390/1280 px, Hauptansicht und Fahrwerk; Palette korrekt, kein Überlauf, keine JS-Fehler, Daten vor/nach tatsächlichen Themewechseln identisch. Screenshots visuell geprüft.
- Kontrastprüfung: 0 Unterschreitungen in 1.056 sichtbaren Texten (9 Ansichten × 2 Themes × 2 Breiten); zusätzliche Palette-/Ring-/Button-Kontraste bestanden.
- Belege: `belege/APP-SW-001/`. Grenzen: kein echter Safari-/iPhone-Test.
- Veröffentlichung: zunächst NEIN. Jetzt geprüften Stand auf `main` übertragen, bestehende Action automatisch stempeln lassen und Live-Fassung kontrollieren. Nachtrag folgt.


### APP-SW-001 — Abschluss: Schwarz/Weiß veröffentlicht und live geprüft
- Autor: Codex · Empfänger: Liam · Datum: 13.10.2026, 13:42 Uhr (Europe/Berlin).
- Status: ERLEDIGT. Veröffentlichung: JA.
- Farb-Commit: `5151fc06762069209dbf8287a667f0f3ad439ea5`; automatisch gestempelter Commit `ba23340`. Live-Version **`20261013-1340`**. Kein manueller Stempel.
- Bestehender Workflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/38391451714. Alle Tests erneut bestanden (142 s); Workflow bestätigt Live-Version.
- Öffentliche App: https://trostliam-hub.github.io/dreambuild/. Die öffentlich abgerufene index.html ist byteweise identisch mit dem automatisch gestempelten Commit.
- Eigene Live-Chromium-Prüfung: Hell/Dunkel × 390/1280 px, Hauptansicht und Fahrwerk. Schwarz/Weiß bestätigt; keine Petrol-Akzente mehr, Gesamtring ohne Filter, keine JS-Fehler, kein horizontaler Überstand. Nutzerdaten vor/nach tatsächlichem Designwechsel identisch. Screenshots beider Modi visuell geprüft.
- Eigene Live-Kontrastprüfung: 0 Unterschreitungen in 1.056 sichtbaren Texten. Sämtliche Palette-/Button-/Ring-Kontraste bestanden.
- Belege: `belege/APP-SW-001/live-palette.json`, `live-kontrast.txt`, `live-*.png`, `veroeffentlichung.txt`.
- Funktionen, Speicherlogik, Warn-/Fehlerfarben, warme helle und Anthrazitflächen erhalten. Grenzen: Chromium, kein echter Safari-/iPhone-Test. Keine offenen Schritte.


---

## APP-OLED-001 — Reines OLED-Schwarz als Hintergrund
- Autor: Codex · Empfänger: Liam · Datum: 13.10.2026, 13:46 Uhr (Europe/Berlin).
- Status: PRÜFBEREIT, Veröffentlichung im fortgeführten Nutzerauftrag freigegeben.
- Basis: aktueller `main` `529f232`, Live-Version `20261013-1340`.
- Änderung: Dunkler Seitenhintergrund `#000000`; transparente Kopf-/Navigationsflächen schwarz. Browser-Statusleistenfarbe sowohl beim ersten Start als auch beim Themewechsel `#000000`. PWA-Manifest background_color und theme_color ebenfalls `#000000`. Karten bleiben zur Gliederung in Anthrazit, Schwarz-Weiß-Akzente und Hellmodus erhalten.
- Funktionen und Speicherlogik unverändert. Kein manuelles Stempeln.
- `npm test`: alle bestanden — Syntax, Kompatibilität 200/200, Setup/Speicher 16/16, Wege 36/36, Sprache 0 Funde in 8.752 Texten, BEVEL 28/28, Preis-Skript 0 Fehler.
- Chromium/Playwright: Hell/Dunkel, 390/1280 px. Berechnete Hintergründe von html und body tatsächlich rgb(0,0,0) dunkel, Hell weiterhin rgb(242,240,236); theme-color jeweils korrekt, auch nach echtem Hin-/Zurückschalten. Daten erhalten, keine JS-Fehler, kein Überlauf. Dunkle Ansicht visuell geprüft.
- Kontrast: 0 Unterschreitungen in 1.056 sichtbaren Texten, Palette-/Ring-/Button-Kontraste ebenfalls bestanden. PWA-Manifest als JSON geprüft.
- Belege: `belege/APP-OLED-001/`. Grenzen: Chromium, kein echtes Safari/iPhone.
- Veröffentlichung: noch NEIN. Jetzt geprüften Stand auf main übertragen und bestehenden Workflow abwarten; Live-Nachtrag folgt.


### APP-OLED-001 — Abschluss: OLED-Schwarz live
- Autor: Codex · Empfänger: Liam · Datum: 13.10.2026, 13:52 Uhr (Europe/Berlin).
- Status: ERLEDIGT. Veröffentlichung: JA, über bestehenden Workflow.
- Farb-Commit `b2de7dedbf396d8169599099cf58dc3ebf19c05c`, automatisch gestempelter Commit `e1a7662`. Live-Version **`20261013-1350`**. Kein manueller Stempel.
- Workflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/38392586267; alle Tests bestanden.
- Öffentliche App https://trostliam-hub.github.io/dreambuild/ selbst abgerufen, byteweise identisch mit gestempeltem Checkout. Öffentliches PWA-Manifest selbst geprüft: background_color und theme_color beide `#000000`.
- Eigene Live-Chromium-Prüfung: Hell/Dunkel × 390/1280 px. html und body tatsächlich schwarz (rgb(0,0,0)) im Dunkelmodus, Statusleistenfarbe #000000 auch nach Hin-/Zurückschalten, warmer Hellmodus erhalten. Keine JS-Fehler, kein Überlauf, Profil-/Plan-/Fahrwerkdaten erhalten. Dunkler Screenshot visuell geprüft.
- Live-Kontrastprüfung: 0 Unterschreitungen in 1.056 sichtbaren Texten.
- Belege: `belege/APP-OLED-001/live-palette.json`, `live-kontrast.txt`, `live-*.png`, `veroeffentlichung.txt`. Grenzen: Chromium, kein echtes Safari/iPhone. Keine offenen Schritte.


---

## APP-FULLBLACK-001 — Vollständig schwarze Flächen, leuchtendes Weiß
- Autor: Codex · Empfänger: Liam · Datum: 13.10.2026, 14:00 Uhr (Europe/Berlin).
- Status: PRÜFBEREIT; fortgesetzter Designauftrag, bestehende Veröffentlichungserlaubnis.
- Basis: aktueller main `8b799ec`, Version `20261013-1350`.
- Nutzerwunsch: Full Black, vollständig OLED-schwarz, helles/leuchtendes Weiß und wenige Akzente. Optionale Nachfrage zur Akzentfarbe ohne Antwort; angekündigte Annahme Weiß/Silber verwendet.
- Umsetzung: ground, surface, surface-2 und sunk durchgehend #000000 dunkel. Primärtext #FFFFFF, Sekundärtexte #E6E6E6/#B8B8B8. Neutrale Silberringe #A3A3A3, feine Linien zur Gliederung. Dezent statischer weißer Schein ausschließlich an Gesamtring und Logo. Navigation und neutrale Buttons/Controls auf Schwarz, Hauptbuttons Weiß mit dunkler Schrift.
- Auch die bisher stets helle Startansicht folgt jetzt dem App-Theme: schwarze Flächen, weißer Ring und Schrift, monochrome Aktionen. Vorhandene Marken-/Erfolgsbeschriftungen auf der Startseite für ausreichenden Kontrast korrigiert.
- Hellmodus und semantische Warn-/Fehler-/Erfolgsfarben erhalten. Funktionen und Nutzerdaten unverändert; einziger funktionaler Skript-Diff ist Startseiten-Ringfarbe als CSS-Variable statt fester Hellfarbe. Kein manueller Stempel.
- `npm test`: alle bestanden, 148 s — Syntax 2 Skripte, Kompatibilität 200/200, Setup/Speicher 16/16, Wege 36/36, Sprache 0 Funde in 8.752 Texten, BEVEL 28/28, Preis-Skript 0 Fehler.
- Chromium/Playwright: Hell/Dunkel × 390/1280 px, Hauptansicht/Fahrwerk/Startansicht, schwarze Flächen und weißer Schein tatsächlich gerendert. Daten nach Themewechsel unverändert, keine JS-Fehler/Überläufe. App und Startansicht visuell geprüft.
- Kontraste: 0 Unterschreitungen in 1.056 App-Texten plus 882 Texten der scrollenden Startansicht.
- Belege: `belege/APP-FULLBLACK-001/`. Grenzen: kein echtes Safari/iPhone.
- Veröffentlichung: noch NEIN zum Zeitpunkt dieses Eintrags. Jetzt Push, bestehende Action prüfen und automatische Live-Version nachweisen; Abschlussnachtrag folgt.


### APP-FULLBLACK-001 — Abschluss: Full Black mit weißem Leuchten live
- Autor: Codex · Empfänger: Liam · Datum: 13.10.2026, 14:06 Uhr (Europe/Berlin).
- Status: ERLEDIGT. Veröffentlichung: JA.
- Design-Commit `b23ad011ab2e05ed912bcb4fe593306cebe232f2`, automatisch gestempelter Commit `f5221c1`. Live-Version **`20261013-1403`**. Kein manueller Versionsstempel.
- Bestehender Workflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/38394165503; alle Tests bestanden.
- Öffentliche index.html https://trostliam-hub.github.io/dreambuild/index.html selbst abgerufen, identisch mit dem automatisch gestempelten Checkout.
- Eigene Live-Chromium-Prüfung: Hell/Dunkel × 390/1280 px, Hauptansicht/Fahrwerk/Startansicht. Grund-, Karten- und Innenflächen tatsächlich #000000 dunkel; helles Weiß, silberne Akzente und statischer weißer Schein an Ring/Logo bestätigt. Startansicht ebenfalls schwarz. Keine JS-Fehler oder Überläufe, Daten nach Designwechsel erhalten. Live-Screenshot visuell geprüft.
- Live-Kontrast: 0 Unterschreitungen in 1.056 App-Texten und 882 Startseiten-Texten.
- Belege: `belege/APP-FULLBLACK-001/live-palette.json`, `live-kontrast.txt`, `live-start-kontrast.txt`, `live-*.png`, `veroeffentlichung.txt`. Grenzen: Chromium, kein echtes Safari/iPhone. Keine offenen Schritte.


---

## APP-ADAPTER-203-001 — Automatischer 203-mm-Adapter mit Montagehinweis
- Autor: Codex · Empfänger: Liam · Datum: 13.10.2026, 14:15 Uhr (Europe/Berlin).
- Status: PRÜFBEREIT. Nach dem veröffentlichten Design-Update durchgeführt; Veröffentlichung im fortgeführten Auftrag freigegeben.
- Basis: aktueller main `13a28d0`, Full-Black-Live-Version `20261013-1403`.
- Vorhandene automatische Adapterberechnung überprüft und erhalten. Sie berücksichtigt für PM180/203 den passenden Adapter (etwa Shimano SM-MA-F203P/PM), inklusive Preis und Gewicht.
- Änderung: Einbaumeldung, dauerhafte Zeile unter der Bremse und Prüfung zeigen jetzt einen ausdrücklichen Montagehinweis mit Scheibengröße, Position und Montageort: „Für die 203-mm-Scheibe vorn gehört der Adapter zwischen Gabel und Bremssattel.“ Englisch gleichwertig. Distanzscheiben erhalten passende Bezeichnung. Keine Behauptung, die App habe am echten Rad bereits montiert.
- Bedarfsregel erhalten: native PM203 mit 203-mm-Scheibe bekommt keinen zusätzlichen Frontadapter und keinen irreführenden Montagehinweis. Bei Rückwechsel auf 180 mm entfällt der Adapter weiterhin. Keine Änderung an Preis-, Gewicht-, Score- oder Kompatibilitätsregeln, Speicherformat oder Full-Black-Design.
- Vorhandenen BEVEL-Regressionstest erweitert: Montagehinweis bei Einbau/unter Bremse/in Prüfung/Englisch, automatisch berücksichtigter Artikel mit Preis/Gewicht, kein unnötiger Adapter bei nativer PM203-Aufnahme; vorhandene Wegfall-/Warnfarbenprüfungen erhalten.
- `npm test`: alle bestanden — Syntax 2 Skripte, Kompatibilität 200/200, Setup/Speicher 16/16, Wege 36/36, Sprache 0 Funde in 8.752 Texten, BEVEL 28/28, Preis-Skript 0 Fehler.
- Zusätzliche Chromium-Prüfung: 12/12 Fälle (Hell/Dunkel × DE/EN × 320/390/1280 px). Einbaumeldung und Hinweis korrekt, nach Neuladen erhalten, automatischer Adapter genau einmal mit Preis/Gewicht, kein Textüberlauf oder JS-Fehler. Dunkler Screenshot visuell geprüft.
- Belege: `belege/APP-ADAPTER-203-001/`. Grenzen: kein echtes Safari/iPhone.
- Veröffentlichung: noch NEIN zum Zeitpunkt des Eintrags. Jetzt geprüften Stand auf main übertragen, bestehende Action automatisch stempeln lassen und öffentliche App nachprüfen. Abschlussnachtrag folgt.


### APP-ADAPTER-203-001 — Abschluss: Montagehinweis live
- Autor: Codex · Empfänger: Liam · Datum: 13.10.2026, 14:21 Uhr (Europe/Berlin).
- Status: ERLEDIGT. Veröffentlichung: JA, nach dem Design-Update.
- Code-Commit `94627297d14c228df0eb80ae1309ccc8e1d062b0`, automatisch gestempelter Commit `8b0526e`. Live-Version **`20261013-1418`**. Kein manueller Versionsstempel.
- Bestehender Workflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/38395938238. Alle Tests bestanden, 158 s. Korrektur zum vorigen Eintrag: Sprachprüfung tatsächlich 0 Funde in **8.754** Texten (auch lokal), nicht 8.752.
- Öffentliche App https://trostliam-hub.github.io/dreambuild/index.html selbst abgerufen: identisch mit automatisch gestempeltem Checkout.
- Eigene Live-Chromium-Prüfung: 12/12 Fälle (Hell/Dunkel × DE/EN × 320/390/1280 px). Passender Frontadapter für 203 mm genau einmal automatisch berücksichtigt; Artikel, Preis und Gewicht vorhanden. Einbaumeldung und dauerhafter Montagehinweis korrekt, nach Neuladen erhalten. Kein Überlauf oder JS-Fehler. Dunkle Live-Ansicht visuell geprüft, Full-Black-Design erhalten.
- Testskript für Live-Prüfung gegen verspätete PWA-Neuladungen/DOM-Neuzeichnung stabilisiert; keine Änderung am App-Code nötig.
- Belege: `belege/APP-ADAPTER-203-001/live-pruefung.json`, `live-pruefung.txt`, `live-*.png`, `veroeffentlichung.txt`. Grenzen: Chromium, kein echtes Safari/iPhone. Keine offenen Schritte.


---

## WEBSITE-GALERIE-001 — Korrektur: Galerie gehört in die App
- Autor: Codex · Empfänger: Liam · Datum: 14.10.2026, 15:54 Uhr (Europe/Berlin).
- Status: ERLEDIGT. Veröffentlichung: JA, öffentliche Website selbst geprüft.
- Bezug: Liam präzisiert, dass Bilder und anklickbare Großansicht für die App gedacht waren. Die zusätzliche Website-Galerie wurde vollständig zurückgenommen; das vorher gewünschte Bevel/OLED-Design und aktualisierte Produktinfos bleiben erhalten.
- Repo `trostliam-hub/crankscore-web`, Rücknahme auf main `7446a82b8df62430526299baa8b61307ad282f80`; Inhalt wieder identisch mit `45101342c9d2c05b76ff08c56d7fc775ff0d47ea`.
- Bestehender Workflow erfolgreich: https://github.com/trostliam-hub/crankscore-web/actions/runs/38563803119 . Live https://crankscore.de/ , wieder automatische Cache-Kennung `e578a3e2`.
- Prüfung: 72 responsive Fälle, 8 Mobilmenüfälle und 8 öffentliche Fälle bestanden; 44 öffentliche Dateien bytegleich zum gewünschten Stand. Die 38 zusätzlich entfernten Galerie-Dateien liefern 404. Keine App-Daten verändert.
- Belege: `belege/WEBSITE-GALERIE-001-KORREKTUR/`.

## APP-PRODUKTBILDER-001 — Echte Bilder und schwarze Großansicht in der App veröffentlicht
- Autor: Codex · Empfänger: Liam · Datum: 14.10.2026, 15:54 Uhr (Europe/Berlin).
- Status: ERLEDIGT für App-Umsetzung, Prüfung und Veröffentlichung; verbleibende Modell-Fotolücken unten ausdrücklich dokumentiert.
- Auftrag: Bilder in der App statt der Website, gerade in der abgebildeten Gabelauswahl, auf schwarzem Hintergrund und per Klick groß ansehen. Veröffentlichung im fortgeführten Nutzerauftrag ausdrücklich freigegeben.
- Repo `trostliam-hub/dreambuild`; vom aktuellen main `54ba72d4a2aa6c1569cb2db192b91abcf542d116`, isolierte Arbeit auf `codex/app-product-images`. Code-Commit `16076244c67b4469f5d40ff3eb0ade705df4433a`, automatisch gestempelter main-Commit `487235ca042b81264b173fae8d2f5f84ea701fd3`.
- Live-Version **`20261014-1539`**, öffentliche App https://trostliam-hub.github.io/dreambuild/ . Bestehender Workflow mit allen drei Jobs erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/38572989584 . Kein Versionsstempel von Hand; der Workflow prüft, stempelt und veröffentlicht.
- Umsetzung: einheitliche, anklickbare echte Produktfotos in Teileauswahl, Aufbau, Detail, Finder, Vergleich, Wunschliste, Einkauf und Fahrwerk-Angaben. Formula Selva V, SR Suntour Durolux38 und RockShox Domain aus dem Screenshot sind bebildert. Separate schwarze Großansicht mit Quelle, Modellhinweis, Zoom/Einpassen, Schließen/Escape, Tastatur und Touch-Scroll. Fotoöffnung baut kein Teil ein und ersetzt nicht die vorhandene Teileliste; Liste, Filter, Fokus und Scrollposition bleiben erhalten.
- Schwarz in OLED und Hellmodus, einschließlich Foto-Statusleiste. Transparente Originale stehen direkt auf Schwarz. Helle Hersteller-Studiohintergründe werden nur für die Anzeige auf dem Gerät freigestellt, einschließlich Zwischenräumen in Gabel, Rahmen und Laufrädern. Originaldateien und echte Produktfarben bleiben erhalten; keine generierten Bilder. Szenenfotos wurden durch passende echte Packshots derselben Modellfamilie ersetzt. Vollrad-, Einzelteil-, Finish- und Ausführungsreferenzen sind mit sichtbaren Hinweisen gekennzeichnet, auf DE/EN.
- Bildbestand: **688 Zuordnungen / 679 Bilddateien / 675 von 766 Katalogmodellen**, einschließlich aller **90 Rahmen und 78 Reifen**, 79/86 Gabeln und 48/49 Bremsen. Alle Dateien im Browser dekodiert, IDs/Pfade/Dateitypen/HTTPS-Quellen geprüft. Herstellerquellen bevorzugt; exakte Fachshopquellen offen benannt.
- **Verbleibende Fotolücken: 91 Modelle.** Dazu gehören generische Trial-/Originalteile ohne eindeutigen Hersteller sowie nicht ausreichend belegte einzelne Markenmodelle. Sie erhalten kein erfundenes oder falsches Ersatzfoto. Die Umsetzung deckt damit alle Teilekategorien ab, behauptet aber ausdrücklich nicht, dass jedes der 766 Modelle ein Foto besitzt. Der detaillierte Kategorienstand steht in `belege/APP-PRODUKTBILDER-001/BILDBESTAND.json`.
- Behobene Bild-/Bedienfehler: weiße geschlossene Hintergrundflächen; randberührende Produkte auf Weiß; Studioverläufe; auf 2 px geschrumpfte, nicht anklickbare Detailfotos; fehlende Fotos in Fahrwerk-Angabenkarten; Touch-Pan-Sperre bei nur horizontalem Zoom; asynchrones altes close-Event beim sofortigen Wiederöffnen. Weiße Lackierung/Gummiteile, Metall, Markenbeschriftungen und farbige Oberflächen nach Korrekturen visuell geprüft.
- Funktionen/Daten: keine Änderung an Katalogmaßen, Kompatibilitäts-/Score-Regeln, Adapterrechnung, Preisen, Pro-Regeln, Speicherformat oder gespeicherten Fahrer-/Rad-/Fahrwerkdaten. Eigene Teile bekommen keine Bilder ihrer Maßvorlagen. Bestehende getrennte Arbeitsstände und vorhandene Austauschdaten erhalten.
- Tests: `npm test` vollständig bestanden — Syntax 2 Skripte, Kompatibilität 200/200, Setup/Speicher 24/24, Wege 36/36, Sprache 0 Funde in 10.644 Texten, BEVEL/Finder/Adapter 28/28, Preise 0 Fehler, Foto-Benutzerwege 14/14. Nach letzter Renderer-Anpassung die Foto-Prüfungen und Browserprüfungen erneut grün; GitHub prüfte den endgültigen Code-Commit vor Veröffentlichung vollständig erfolgreich.
- Browserreview: **648/648** Prüfungen auf 320/390/768/1280 px, Hell/OLED, DE/EN; zusätzlich 24 kritische Fotos visuell geprüft, echtes emuliertes Touch-Wischen, 20 schnelle Öffnen/Schließen-Zyklen je Theme und Offline-Neustart mit allen drei Screenshot-Gabeln. LocalStorage in den Foto-Wegen unverändert. Kontrast der neuen Großansicht: weiß auf Schwarz 21:1, Controls auf #111 etwa18,88:1, Nebenhinweise #BBB auf Schwarz etwa10,94:1, Control-Rand #666 auf Schwarz etwa3,66:1. Statusfarben erhalten.
- Eigene öffentliche Kontrolle: **136/136** Prüfungen in 8 Fällen (390/1280 px × OLED/Hell × DE/EN), einschließlich aller drei Gabelbilder, Zoom/Einpassen nach Layoutsettling, Quelle, Daten-/Listenrückkehr, echter Detailfoto-Klick und automatischer 203-mm-Adapter. Alle 8 Fälle liefern Version `20261014-1539`; keine JS-Fehler. Öffentliche Handyansicht auch visuell angesehen.
- Öffentlicher Dateiabgleich: **683/683 Dateien**, darunter sämtliche **679 Produktbilddateien**, vollständig identisch mit dem geprüften lokalen veröffentlichten Stand. HTML/Service Worker nur hinsichtlich des automatisch gesetzten Versionsstempels normalisiert; keine Bild- oder Codeabweichungen. Datenumfang etwa108MB, Bilder werden bedarfsweise geladen, nicht vollständig beim App-Start.
- Offline: bereits angezeigte Produktbilder werden vom bestehenden Service Worker gespeichert; alle drei Beispielgabeln nach Offline-Neustart angezeigt. Noch nie geladene Bilder können ohne Netz fehlen, ohne Teileauswahl oder Daten zu beeinträchtigen.
- Technische Dokumentation im App-Repo: `docs/PRODUKTBILDER.md`, aktualisierte `docs/FAHRWERK_BILDER.md`, Herkunft in `bilder/produkte/katalog.js`. Belege hier in `belege/APP-PRODUKTBILDER-001/`; ausführliche Skripte/Aufnahmen unter `/workspace/app-image-fix-audit/`.
- Grenzen: Chromium/Playwright mit emulierten Geräten; kein echtes iPhone/Safari getestet. Sichtprüfung der Produktdetails anhand kritischer Stichproben, nicht manuelle Prüfung jedes Pixels aller 679 Bilder. Bestehende technische Katalog-Nebenbefunde (Selva V als Coil, Magura MT4/MT8-Pro-Kolbenzahl) wurden dokumentiert, nicht im Fototask in die Rechenregeln übernommen.

## APP-KI-GUIDE-001 — KI-Anbindung vorbereitet, Aktivierung offen
- Autor: Codex · Datum: 16.10.2026 · Bezug: Liam möchte einen KI-Guide und die Launch-Kosten wissen.
- Status: PRÜFBEREIT als Entwurf; echter API-Betrieb und Launch bleiben offen.
- Repository: `trostliam-hub/dreambuild`, Checkout `C:\Users\trost\.codex\visualizations\2026\10\13\01a135c6-c1f3-72a3-b061-bf6f15e8793c\crankscore`, Branch `codex/erklaerbilder-schwarz`, Basis `91fa192`. Aktuelles main vor Änderungen ohne Konflikte übernommen; fremde Produktbildänderungen erhalten. Kein Spielcode geändert.
- Freiwilliger KI-Modus im vorhandenen Guide, ausgewählte Teilenamen als Kontext, Datenhinweis, maskierte KI-Antworten, Fehler-/Kontingentmeldung. Lokaler Guide bleibt verfügbar. `KI_GUIDE_URL` ist leer, also kein öffentlicher KI-Schalter und keine API-Ausgaben.
- Separater Node-Serverentwurf mit serverseitigem Schlüssel, fester Responses-Adresse, gpt-6-luna, Antwortlimit, ohne automatische Wiederholungen oder Zusatzwerkzeuge. Dauerhaftes gemeinsames Monatskontingent (Standard 0), Prozesssperre und Drossel. Kein garantiertes Euro-Budget; einzelne Fragen ohne Chatgedächtnis. Hosting-/Proxygrenzen in `docs/KI-GUIDE.md` beschrieben.
- Neue Prüfungen: 5/5 Backendtests mit simulierter API, 10/10 Browserprüfungen DE/EN bei 390/320 px. Keine echten KI-Aufrufe und keine Aussage zur realen Antwortqualität. Syntaxprüfungen und `git diff --check` bestanden.
- Bestehende Gruppen: Syntax 2 Skripte, Kompatibilität 200/200, Setup 24/24, Wege 36/36, Sprache 0 Funde in 10.644 Texten, BEVEL 28/28, Preise 0 Fehler. Der Gesamtaufruf `npm test` endete zunächst mit Fehler, weil der Fototest sein ESM-Playwright-Paket lokal nicht fand. Vorhandenes Paket anschließend ohne Installation über einen externen Testloader aufgelöst. Fototest separat zuletzt 14/14; dazwischen einmal 12/14 bei Zustands-/Scrollvergleich, Gegenprobe auf unveränderter Basis 14/14. Gesamtaufruf danach nicht wiederholt.
- Kosten erläutert: offizieller Standardpreis, Beispiel 1.000 Fragen à 2.000 Input-/500 abgerechnete Outputtokens ≈ 0,45 USD reine API-Nutzung; Hosting/Steuern zusätzlich möglich. Kein kostenpflichtiger Dienst beauftragt. Kostenlimit asynchron bei Liam abgefragt, bisher keine Antwort; Schlüssel nie im Chat anfordern.
- Veröffentlichung: NEIN. Offen: API-Konto/Server, gewähltes Monatslimit, tatsächliche Modellverfügbarkeit und Antwortqualität, endgültige Datenschutzangaben und Betriebskonfiguration. Entwurf lokal gesichert; frühere allgemeine Veröffentlichungsfreigabe ersetzt keine Freigabe kostenpflichtiger Dienste.

## APP-KI-GUIDE-001 — Nachtrag: Budget und Konto eingerichtet
- Autor: Codex · Datum: 16.10.2026 · Status: IN ARBEIT, Cloudflare-Anmeldung bei Liam offen.
- Liam hat maximal 5 Euro pro Monat insgesamt für KI und Server festgelegt. OpenAI-Dashboard zeigte nach seiner Einrichtung 5 USD Guthaben. Automatisches Nachladen war eingeschaltet (10 USD Monatslimit) und wurde ausgeschaltet; Anzeige „Auto-reload is OFF“ geprüft. Keine weitere Aufladung ausgeführt.
- Schlüsselformular vorbereitet: CrankScore Guide, Default project, Restricted / Responses Write, 30 Tage. Liam hat den Schlüssel anschließend selbst erzeugt und gespeichert. Der geheime Wert wurde nicht gelesen. Screenshots zeigen nur Guthabenstatus bzw. Formular vor Erstellung.
- Kostenfreie Hostingoption geprüft: Workers Free, SQLite Durable Objects verfügbar. Cloudflare-Anmeldung separat geöffnet, OpenAI-Schlüsselseite nicht erneut ausgelesen.
- Repository und Branch wie zuvor, Basis `3a67a11`; Änderungen dieses Nachtrags nur Dokumentation, `git diff --check`. Noch keine Worker-Portierung, keine Cloudflare-Ressource, kein echter API-Aufruf und keine Veröffentlichung. Weiteres Vorgehen in `docs/KI-GUIDE.md`.
