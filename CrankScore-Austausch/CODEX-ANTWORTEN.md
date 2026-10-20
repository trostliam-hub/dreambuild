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

## APP-KI-GUIDE-001 — Cloudflare-Version vorbereitet
- Autor: Codex · Datum: 17.10.2026 · Status: PRÜFBEREIT lokal; Freigabe für Uploadzugriff und Secret-Einrichtung bei Liam ausstehend.
- Bezug: Liam ist jetzt bei Cloudflare angemeldet. Im Konto selbst Workers Free / $0 / Current plan geprüft; keine kostenpflichtige Buchung vorgenommen.
- Repo/Branch unverändert: dreambuild, codex/erklaerbilder-schwarz; Basis fb24bc4. Nur eigener Bereich guide-api/cloudflare, .gitignore und Dokumentation verändert; PWA und Spielcode nicht geändert.
- Eigenständiger Worker mit SQLite Durable Object: festes gemeinsames Kontingent, dauerhafte atomare Reservierung vor API-Aufruf, höchstens 1.000/Monat und 100/Tag, 35 Sekunden Abstand, 5.000-Byte-Eingabe, 800 Ausgabetokens, keine Tools/automatischen Wiederholungen. Standardkontingent 0. Keine Fragen/IPs/Antworten in eigener Datenbank; Worker-Logs aus.
- Offizielle Cloudflare-Werkzeuge lokal installiert; Versionen und Lockfile im Worker-Unterordner. Testlauf mit Sandbox zunächst wegen localhost-EACCES blockiert; autorisiert außerhalb der Sandbox erfolgreich. Ein Testkonfigurationsfehler (fehlende Miniflare-Speicherinspektion) korrigiert.
- 7/7 Tests mit workerd/SQLite und simulierter OpenAI-API bestanden, inkl. 12 paralleler Anfragen, Neustart, Tages-/Monatswechsel, Fehlerzählung, Eingabegrenzen. Wrangler-Trockenlauf erfolgreich; git diff --check bestanden. Unveränderte PWA in diesem Schritt nicht erneut getestet.
- Veröffentlichung: NEIN. Keine Cloudflare-Ressource, kein echter API-Aufruf. Als Nächstes eingeschränkten Wrangler-Zugriff autorisieren, ausgeschalteten Worker bereitstellen, Liam den OpenAI-Key direkt als Secret eintragen lassen, echte Verbindung prüfen, Daten-/Wartehinweise im Frontend ergänzen und autorisiert veröffentlichen.

## APP-KI-GUIDE-001 — Umsetzung fertig, Veröffentlichung gestartet
- Autor: Codex · Datum: 17.10.2026 · Auftrag: Liam bestätigt vollständige Einbindung und Veröffentlichung ohne weitere Rückfragen; kurze einfache Antworten, Aufbauwissen und Links aus der App.
- Repo/Branch/Pfad wie zuvor, Basis e7f7c55 auf main-Basis 91fa192. Aufgabenbereich KI-Guide; keine Spielcodeänderung, kein paralleler Bearbeiter erkennbar. GitHub main unmittelbar vor Veröffentlichung unverändert.
- Worker bei Cloudflare Workers Free produktiv, Version 83a0fdfb-4a15-4644-acd7-a94b4bca50e8. OPENAI_API_KEY verschlüsselt als Secret; direkter Browsertransfer aus Liams offenem Erstellungsdialog, ohne Geheimnis in Ausgaben, Dateien oder Screenshots. Schlüssel bleibt auf 30 Tage befristet. Kein kostenpflichtiger Tarif, keine weitere Aufladung.
- Kostenbegrenzung: 1.000 Versuche/UTC-Monat, 100/Tag, 35 Sekunden Abstand für alle gemeinsam, feste gpt-6-luna-Konfiguration ohne Denken/Tools/Retry und mit 800 Ausgabetokens. Dauerhafte atomare Reservierung vor API-Aufruf; Fehler zählen. Keine garantierte Euro-Sperre bei Preisänderungen oder anderen Schlüsseln. Automatisches OpenAI-Nachladen bleibt aus.
- App: freiwilliger KI-Modus; ausgewählter Aufbau, fehlende Teile und App-Prüfhinweise als Kontext. Kurze Erklärungen, Modellpositionen/Werte nicht erfinden. Vorhandene Hersteller-/Produktlinks und interne Aktionen über höchstens drei geprüfte Ressourcen-IDs. Ausgewählte Modellvariante bei Produktlinks bevorzugt. Keine vom Modell erfundenen URLs. Keine automatische Übermittlung von Körper-/Lizenzdaten oder älteren Chatnachrichten. Deutsche und englische Datenschutzhinweise aktualisiert.
- Zwei echte API-Tests erfolgreich: HSC/LSC anhand der Einfedergeschwindigkeit erklärt; Spindrift-Aufbaufrage mit fehlenden Teilen und passenden App-Verweisen beantwortet. Kein allgemeiner Qualitätsbeweis für alle Antworten.
- Lokaler Gesamtaufruf npm test bestanden (154 s): Syntax 2, Kompatibilität 200/200, Setup 24/24, Wege 36/36, Sprache 0 Funde in 10.671 Texten, BEVEL 28/28, Preise 0 Fehler, Fotos 14/14, Guide-UI 16/16. Worker separat 8/8 mit echter workerd/SQLite-Laufzeit und simulierter API. Kein echtes iPhone/Safari geprüft.
- Vorherige Testprobleme behoben: externe lokale ESM-Paketauflösung; Fototest erfasst Zustand jetzt erst nach Playwrights scrollender Klickvorbereitung (trial), keine Datenprüfung entfernt; neue Produktlink-Prüfung berücksichtigt exakte Variante. Abschließender Source-Review getrennt von Änderungen und git diff --check erfolgreich. Neue UI-/Workerprüfungen im Veröffentlichungsworkflow enthalten.
- Noch offen für Abschluss: Push, automatischer Versionsstempel und öffentliche Prüfung. Details und Wartung in docs/KI-GUIDE.md.
- Nachtrag zur Testumgebung: Der Guide-UI-Testserver muss auch die echten lokalen JS-/Bilddateien ausliefern. Die lokale Routinghilfe hatte das zuvor verdeckt. Server korrigiert, externe Netzaufrufe außer der simulierten API gesperrt und 16/16 Guide-Prüfungen erneut über den echten lokalen HTTP-Server ohne Routinghilfe bestanden. Produktiver App-/Worker-Code unverändert.
- Live-Nachprüfung zur ersten veröffentlichten Version 20261017-0039 (bba73a5): HTML öffentlich identisch mit Checkout, Workflow 38976378767 erfolgreich, alle App- und 8 Worker-Tests grün. Echte KI-Antworten und Herstellerlinks im Browser bestätigt.
- Dabei eine zusätzliche Link-Suchlücke entdeckt und behoben: „RockShox-Setup-Link“ muss auch ohne das Wort „Fahrwerk“ Herstellerquellen erhalten. Setup, Abstimmung und erkannte Gabel-/Dämpfermodelle werden berücksichtigt. Eine ausdrücklich erfragte Marke hat Vorrang vor einer anderen verbauten Marke; gemischte Fahrwerke können Quellen beider Hersteller anbieten. Die KI hatte korrekt keine URL erfunden, bekam zuvor aber nur Katalog-Verweise. 16/16 UI-Prüfungen über echten lokalen HTTP-Server erneut grün, jetzt einschließlich Setup-Link und FOX-Frage bei verbauter RockShox-Gabel. Worker unverändert. Abschließende Veröffentlichung dieser Korrektur folgt.

## APP-KI-GUIDE-001 — Online und abschließend geprüft
- Autor: Codex · Datum: 17.10.2026 · Status: ERLEDIGT. Veröffentlichung: JA.
- Öffentliche App: https://trostliam-hub.github.io/dreambuild/index.html . Live-Version **20261017-0049**, Cache dreambuild-20261017-0049. Code-Prüfcommit c9be24e; automatischer Stempelcommit 23d77552a1359f61ca70c9ac08db2efea3bb9ed5. Branch/Pfad wie oben. Kein manueller Versionsstempel.
- Abschließender Workflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/38977561890 . Alle App-Prüfgruppen bestanden (213 s): 200 Kompatibilitätsfälle, 24 Setup-, 36 Wege-, 28 BEVEL-, 14 Foto- und 16 Guide-Prüfungen, Syntax 2 Skripte, Sprache 0 Funde in 10.671 Texten, Preise 0 Fehler. Zusätzlich Worker 8/8, kein Fehler.
- Öffentliche HTML-Datei nach Verteilung mit dem gestempelten Checkout verglichen: nach Zeilenenden-Normalisierung vollständig identisch. Öffentlicher Service-Worker-Cache ebenfalls auf 20261017-0049. Die Korrektur für Setup-Links ist damit enthalten.
- Sechs echte API-Aufrufe insgesamt in diesem Arbeitsgang, einschließlich Aufbau, HSC/LSC, App-Navigation und Herstellerlinks. Browser-Nachtest der zuvor fehlenden Setup-Frage erfolgreich: kurze Erklärung und korrekter hinterlegter SRAM/RockShox-PDF-Link. Vorheriger Fehler und Behebung oben dokumentiert. Kein allgemeiner Anspruch, jede KI-Antwort sei richtig.
- UI auf Deutsch und Englisch bei 390/320 px automatisiert geprüft; öffentliche App zusätzlich im Codex-Browser bedient, Aktualisierung über die App-Einstellung geprüft, echte Antworten sichtbar. Lokaler Bildbeleg: ../ki-guide-online.png. Kein echtes iPhone/Safari getestet.
- API-Key bleibt nur im verschlüsselten Cloudflare-Secret; 30-Tage-Befristung ist eine spätere Wartungsaufgabe, keine dauerhafte Funktionsgarantie. Kostenbremse 1.000/Monat, 100/Tag, 35 Sekunden gemeinsam aktiv. Kein automatisches Aufladen, keine kostenpflichtige Cloudflare-Buchung. Bestehende Nutzeraufbauten und Bilder erhalten.
- Keine offenen Implementierungs- oder Veröffentlichungsschritte. Bei abgelaufenem Schlüssel, verbrauchtem Guthaben oder erreichtem Kontingent bleibt der lokale Guide verfügbar. Wartung und Datenfluss stehen in docs/KI-GUIDE.md.

## APP-ADAPTER-AUTO-002 — Bremsadapter beim Teilewechsel automatisch aktualisieren
- Autor: Codex · Datum: 17.10.2026 · Status: PRÜFBEREIT, Veröffentlichung folgt nach bestandenem Gesamttest.
- Auftrag von Liam: Beim Wechsel von Bremse oder Bremsscheiben die nötigen Adapter automatisch mitwechseln und sagen, welche gebraucht werden. Veröffentlichung ist in dieser Sitzung bereits autorisiert.
- Repository: trostliam-hub/dreambuild; Branch codex/erklaerbilder-schwarz; Pfad C:/Users/trost/.codex/visualizations/2026/10/13/01a135c6-c1f3-72a3-b061-bf6f15e8793c/crankscore. Basiscommit ec6fb49379a8f4c57f899543828636f41a415f36, vor Änderung mit origin/main abgeglichen, sauberer Arbeitsbaum. Kein Eingriff ins Unreal-Spiel.
- Befund: Adapter wurden bereits aus dem aktuellen Aufbau berechnet. Bei einem Austausch kamen zwei getrennte Meldungen für Hinzufügen/Entfernen; bei anderem Artikel für dieselbe Scheibengröße fehlte der Wechsel, weil der Vergleichsschlüssel nur Position und Maße enthielt.
- Umsetzung: Artikel wird beim Vergleich berücksichtigt, deshalb stimmen Wechselmeldung, Zubehörkosten und Verlauf auch beim Wechsel der Bremsenmarke. Austausch am selben Montageort heißt jetzt ausdrücklich „Adapter vorn/hinten automatisch gewechselt: alter Artikel → neuer Artikel“. Neue und entfallene Adapter bleiben getrennt erkennbar.
- Im Bremsenblatt direkt unter der Scheibenauswahl steht eine dauerhafte Übersicht für vorne und hinten mit Größe, benötigtem Adapter und Montageort. Native Größe: kein Adapter nötig. Unbekannte Aufnahme: Bedarf offen. Nicht freigegebene/zu kleine Scheiben werden nicht durch einen erfundenen Adapter passend gemacht. Neue Übersicht auf Deutsch und Englisch, bestehendes schwarzes/helles Design. Meldung nach Scheibenwahl bleibt 8 Sekunden sichtbar.
- Automatik weiterhin aus dem aktuellen Aufbau abgeleitet, keine zweite gespeicherte Adapterliste. Gabel-/Rahmenwechsel, Speichern/Neuladen, Preis/Gewicht/Einkauf und Rückgängig verwenden dieselben Daten. Hersteller-/Maßkatalog und Score-Regeln bleiben unverändert.
- Neue Regressionen mit echten Auswahlklicks: 203/203 → 220/203 → 180/180, nur betroffene Seite gewechselt, beide Adapter entfernt, kein Doppel, Reload, Traumrad-Einkauf, DE/EN bei 390/320 px; Markenwechsel Shimano → Magura bei gleichen Maßen einschließlich Kosten/Verlauf/Rückgängig; Gabel-/Rahmenwechsel; unbekannte Aufnahme, Maximalgröße, native Größe, zu kleine Scheibe und Felgenbremse.
- Geprüft: BEVEL 32/32 über echten lokalen HTTP-Server; anschließend vollständiges npm test bestanden (146 s): Syntax 2, Kompatibilität 200/200, Setup 24/24, Wege 36/36, Sprache 0 Funde in 10.671 Texten, BEVEL 32/32, Preise 0 Fehler, Fotos 14/14, Guide-UI 16/16. Anfangs falscher Testaufruf einkaufHtml ohne Bewertungsargument korrigiert; App-Funktion nicht betroffen. Source-Review getrennt von Änderungen, git diff --check sauber.
- Sichtprüfung Chromium: OLED DE 390 px, hell DE 320 px, OLED EN 320 px, kein Überstand. Bildbelege außerhalb des Repos: ../bremsadapter-oled-de.png, ../bremsadapter-hell-de.png, ../bremsadapter-oled-en.png. Kein echtes iPhone/Safari geprüft.
- Veröffentlichung: noch ausstehend; nach Push den automatischen Stempel, Workflow und öffentliche App prüfen. Kein manueller Versionsstempel.

### APP-ADAPTER-AUTO-002 — Veröffentlichung bestätigt
- Status: ERLEDIGT · Veröffentlichung: JA. Code-/Prüfcommit f379643034ef9f1113e905ad8931f352f1940295; automatischer Stempelcommit 603bdef. Live-Version **20261017-1141**, Service-Worker-Cache dreambuild-20261017-1141.
- Workflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/39021796172 . GitHub-Gesamttest 227 s, alle oben genannten App-Prüfgruppen bestanden, dazu Worker 8/8 mit simulierter API (kein echter KI-Verbrauch).
- Öffentliche App https://trostliam-hub.github.io/dreambuild/index.html nach Verteilung abgerufen: HTML nach Normalisierung der Zeilenenden vollständig identisch mit gestempeltem Checkout; Cache-Stempel ebenfalls geprüft.
- Öffentliche App zusätzlich in frischem Chromium-Testprofil bedient: echte Scheibenauswahl 220/203 mm, hinten Shimano SM-MA-F203P/PM und vorne SM-MA-F220P/PM automatisch vorhanden, Übersicht ohne Überstand. Keine Nutzeraufbauten verändert. Bildbeleg ../bremsadapter-live-oled-de.png. Die UI-Prüfung erfolgte am veröffentlichten Code; anschließend änderte die Action nur Versionsstempel und Cache.
- Keine offenen Implementierungs- oder Veröffentlichungsschritte. Echtes iPhone/Safari bleibt ungeprüft. Falls die installierte App noch den alten Stand zeigt: Einstellungen → Neue Version laden.

## APP-AUSWAHL-OPTIONAL-001 — Selbst suchen, Verbesserungsberatung als optionale Kachel
- Autor: Codex · Datum: 17.10.2026 · Status: PRÜFBEREIT; vollständiger lokaler Test bestanden, Veröffentlichung folgt.
- Nutzerauftrag: Ein Tipp auf z. B. Bremsen soll die freie Suche öffnen. „Was soll sich verbessern?“ soll eine freiwillige Kachel sein; die Ziel-/Marken-/Budgetfragen erst nach deren Betätigung.
- Repository/Pfad: trostliam-hub/dreambuild, C:/Users/trost/.codex/visualizations/2026/10/13/01a135c6-c1f3-72a3-b061-bf6f15e8793c/crankscore; Branch codex/erklaerbilder-schwarz. Basis f8454a471617839d9d519d0bdcd74ac0fd8b9b03, zu Beginn sauber und mit origin/main abgeglichen. Keine Änderungen am Unreal-Projekt.
- Umsetzung: Normale Teilezeile, Kategorieknöpfe unter dem Rad und „Andere Teile“ öffnen zuerst den Katalog mit Suchfeld oben. Darunter eine als optional beschriftete Verbesserungskachel. Das verbaute Teil mit Ausführung und Adaptern bleibt unter „Dein Teil · Details & Adapter“ aufklappbar; bei Änderungen im geöffneten Abschnitt bleibt er offen. Suchfeld auch bei kleinen Kategorien vorhanden.
- Beratung weiterhin mit Ziel/Marke/Budget; zusätzlicher Rückweg „Selbst suchen“ oben, Suchtext und Marken-/Passendfilter bleiben erhalten. Tastaturzugang mit Enter und passender Fokus. Explizites „Lösung finden“ darf weiter direkt den Konflikt-Finder starten. Ein normaler Klick auf ein konfliktbehaftetes Teil erzwingt ihn nicht. Guide-Erklärung und Einstiegstext angepasst; DE/EN, Hell/OLED.
- Regressionen: echte Teileklicks, sofortige Suche und direkter Einbau ohne Fragebogen, optionale Kachel per Tastatur, Rückkehr mit MT7-Suche/Magura-Filter, Datenerhalt und Rückgängig in Mein Rad/Traumrad/Angebot bei 390/320/1280 px; alle Teilekategorien und leere Plätze; bestehende Bremsadaptertests durch Aufklappen von „Dein Teil“ weiterhin wirksam.
- Fehler im ersten Testdurchgang gefunden: Kategorie-Schnellknöpfe öffneten noch den Finder direkt; ebenfalls auf Suche umgestellt. Älterer Konflikttest hatte über einen zu breiten Selektor „Lösung finden“ statt der tatsächlichen Teilezeile geklickt; Selektor auf .slot eingegrenzt. Der getrennte Test für den direkten Lösungsweg bleibt bestehen.
- Vollständiges npm test bestanden (156 s): Syntax 2, Kompatibilität 200/200, Setup 24/24, Wege 36/36, Sprache 0 Funde in 11.283 Texten, BEVEL 34/34, Preise 0 Fehler, Fotos 14/14, Guide-UI 16/16. Source-Review getrennt von Änderungen; git diff --check sauber.
- Sichtprüfung in Chromium: OLED DE 390 px, hell DE 320 px, OLED EN 1280 px; keine horizontalen Überstände. Suche → optionale Beratung → zurück mit erhaltenem Suchtext zusätzlich geprüft. Bildbelege außerhalb Repo: ../auswahl-detail-oled-de.png, ../auswahl-hell-de.png, ../auswahl-oled-en.png. Animationen für die Bildschirmaufnahme beendet, damit kein Zwischenzustand gezeigt wird. Kein echtes iPhone/Safari getestet.
- Veröffentlichung: Push auf main im bestehenden autorisierten Umfang, danach automatischen Stempel, GitHub-Prüfungen und öffentliche App bestätigen. Keine manuellen Versionsstempel.

### APP-AUSWAHL-OPTIONAL-001 — Online bestätigt
- Status: ERLEDIGT · Veröffentlichung: JA. Code-/Prüfcommit 2b1a314dfa824b7015b497333e4e867dea59bafc, automatischer Stempelcommit d2a8b8d09ff4cd5b8363c2f4ee01bd791c588bb5. Öffentliche Version **20261017-1203**, Service-Worker-Cache dreambuild-20261017-1203.
- Workflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/39023200161 . Alle App-Prüfgruppen bestanden (193 s): 200 Kompatibilität, 24 Setup, 36 Wege, 34 BEVEL, 14 Fotos, 16 Guide-UI, Syntax 2, Sprache 0 Funde in 11.283 Texten, Preise 0 Fehler; dazu Worker 8/8 mit simulierter API.
- https://trostliam-hub.github.io/dreambuild/index.html nach Verteilung geprüft: HTML nach Normalisierung der Zeilenenden vollständig identisch mit gestempeltem Checkout, öffentlicher Cache-Stempel ebenfalls korrekt.
- Online-Bedienung im separaten Chromium-Testprofil: Bremsen anklicken → Suche sichtbar ohne Fragebogen, MT7 suchen → optionale Beratung öffnen → „Selbst suchen“ → Suchtext erhalten. 390 px OLED, kein Überstand. Bildbeleg ../auswahl-detail-live-oled-de.png. Keine Nutzerdaten geändert. Der Browsernachweis zeigt den veröffentlichten Code; danach änderte die Action ausschließlich Versionsstempel und Cache.
- Keine offenen Implementierungs-/Veröffentlichungsschritte. Echtes iPhone/Safari nicht geprüft. Bereits installierte App bei Bedarf über Einstellungen → Neue Version laden aktualisieren.

## APP-FAHRWERK-PERSOENLICH-001 — Fahrwerkfragen und Einrichtung erneut
- Autor: Codex an Liam · 17.10.2026 · Status: PRÜFBEREIT. Auftrag: möglichst persönliche Fahrwerk-Einstellungen mit Fragen erst beim ersten Fahrwerk-Tab-Besuch; komplettes Onboarding im Profil erneut starten und neue Funktionen zeigen. Veröffentlichung bereits vom Nutzer autorisiert.
- Repository: trostliam-hub/dreambuild, Branch codex/erklaerbilder-schwarz, Pfad C:\Users\trost\.codex\visualizations\2026\10\13\01a135c6-c1f3-72a3-b061-bf6f15e8793c\crankscore. Basis e81ddbc4aa10f12e42636c530fbd78b729fc436a, origin/main vor Veröffentlichung identisch. Unreal-Spiel unverändert.
- Fahrwerk: automatischer einmaliger Einstieg je Rad und Fragenversion, gespeicherte Zwischenstände und Fortsetzen-Kachel. Gewicht/Ausrüstung, Rad und Federelemente, Einsteller, Gelände, Tempo, Sprünge, Gefühl, Bergaufanteil, Profil, Hersteller-SAG/Maximaldruck, bestehende Werte, Probleme, Zustand und Werkzeug. Nur passende Fragen für vorhandene Komponenten; Rückweg zum gemeinsamen Fahrerprofil-Editor. Fahrstil jetzt je Rad, frühere Fahrerangaben werden vorbelegt. Unbekannt-Option und Feldprüfung, keine stillen Fahrstilantworten.
- Hersteller-SAG-Ziel gilt in allen Fahrprofilen und beeinflusst die Coil-Federberechnung; Maximaldruck kann bekannte Grenzen nur absenken und gilt auch für gespeicherte Werte. Neue SAG-Messungen verlieren bei veränderter Grundlage ihre Gültigkeit, ohne Messung oder Feintuning zu löschen. Bei gemeldetem Defekt zuerst Zustandsprüfung. Alte abgeschlossene Setups bekommen neue Abschnitte und bisher fehlende Fahrstilantworten nachgereicht.
- Profil: „Einrichtung komplett neu durchgehen“ startet sechs aktualisierte Szenen, alle Fahrerfragen und die Wahl des weiteren Wegs. „Mit meinem Rad weitermachen“ erhält Aufbau, Profile, Wunschliste und Setup. Neue Szenen zeigen Teilesuche, optionale Beratung, automatische Bremsadapter, Fahrwerk, Guide, Fotos, Wunschliste und Einkauf.
- Fachliche Abgrenzung und Quellen in docs/FAHRWERK-PERSOENLICH.md. Herstellerinformationen und App-Schätzungen bleiben getrennt. Kein Versprechen eines perfekt berechenbaren Setups; SAG und Testfahrt bleiben für die Feinabstimmung erforderlich. Keine neue KI-Anbindung, kein Schlüssel und keine zusätzlichen Dienste/Kosten.
- Vollständiges npm test bestanden (171 s): Syntax 2 Skripte, Kompatibilität 200/200, Setup 24/24, neue Fahrwerkfragen 11/11, Wege 36/36, Sprache 0 Funde in 11.440 Texten, BEVEL 34/34, Preise 0 Fehler, Fotos 14/14, Guide-UI 16/16. Neue Tests im Veröffentlichungsworkflow eingebunden. Bestehende Einstiegserwartungen auf sechs Szenen und den neuen Fahrwerk-Einstieg aktualisiert; Datenerhalt mit bestehenden Setup-Werten und gespeicherten Ablehnungen geprüft.
- Getrennter Quelltext-Review und git diff --check sauber. Visuell geprüft: Chromium, 320/390/1280 px, Deutsch/Englisch, OLED/Hell, alle Fragen und Einführungsszenen ohne Überstand. Beispiele außerhalb Repo: ../fahrwerk-fragen-320-de.png, ../einrichtung-neu-390-de.png, ../einfuehrung-fahrwerk-320-de.png. Echtes iPhone/Safari nicht getestet.
- Veröffentlichung: ausstehend. Jetzt Push auf main; anschließend automatischen Stempel, GitHub-Prüfungen und öffentliche Version bestätigen. Kein manueller Versions-/Cache-Stempel.

### APP-FAHRWERK-PERSOENLICH-001 — Online bestätigt
- Status: ERLEDIGT · Veröffentlichung: JA. Code-/Prüfcommit eb2f12968a2e2ca9ac79e259c7379206e80e7aa4; automatischer Stempelcommit adb07c544528ad375109465c5b012e9082b25c51. Öffentliche Version **20261017-2209**, Cache **dreambuild-20261017-2209**.
- Veröffentlichungsworkflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/39065119917 . Sämtliche App-Prüfgruppen bestanden (273 s; Zahlen wie oben), zusätzlich Worker 8/8 mit simulierter API. Pages-Build und Deployment für den Stempel ebenfalls erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/39065530100 .
- Öffentliche App https://trostliam-hub.github.io/dreambuild/index.html nach der Verteilung erneut abgerufen: HTML nach Normalisierung der Zeilenenden vollständig identisch mit dem gestempelten Checkout; öffentlicher Service-Worker-Cache stimmt ebenfalls überein.
- Alle elf neuen Szenarien zusätzlich gegen die öffentliche App erfolgreich ausgeführt, mit isolierten Browserdaten: erster Tab-Aufruf, Fahrerprofil-Rückweg, Fortsetzen nach Neuladen, vollständiger Fragenweg, Validierung, Coil-/Luft-Berechnung, Druckgrenzen, Messungsbezug, alte Setups, Radwechsel, Defekthinweis, vollständige Einführung und Datenerhalt, responsive DE/EN-Ansichten. Screenshots außerhalb Repo unter ../fahrwerk-live/. Der nachfolgende automatische Stempel änderte nur Version und Cache, keinen Funktionscode.
- Keine offenen Implementierungs- oder Veröffentlichungsschritte. Kein echtes iPhone/Safari geprüft. Bereits installierte App über Profil/Einstellungen → Neue Version laden bzw. Nach Update suchen aktualisieren. Räder und gespeicherte Feinabstimmung werden erhalten.

### APP-FAHRWERK-EINFACH-001 — Modellwerte, vorhandene Feder und verständlicher Einstieg
- Autor: Codex · Datum: 18.10.2026 · Status: PRÜFBEREIT; abschließende Gesamtprüfung bestanden, Veröffentlichung folgt.
- Auftrag: SAG-Ziele und Druckgrenzen automatisch aus dem Modell übernehmen, tatsächliche Stahlfeder behalten und berücksichtigen, keine selbst gezeichneten oder fremden Modellbilder, ohne eingetragenes Rad direkt zum Aufbau; Einsteigerverständlichkeit hat Vorrang. Nutzer hat Veröffentlichung mehrfach ausdrücklich freigegeben.
- Pfad: C:/Users/trost/.codex/visualizations/2026/10/13/01a135c6-c1f3-72a3-b061-bf6f15e8793c/crankscore · Branch codex/erklaerbilder-schwarz · Basis 1b9d14a452b9c1c0b814e67fcd8554fd09e9ca77. Fremdes Unreal-Spiel im Thread-CWD nicht geändert. Zwei Testbearbeiter in getrennten Worktrees, anschließend Testdateien übernommen; Quellen- und Bildreview separat read-only.
- Einrichtung: zuerst fehlenden Rahmen/Gabel/Dämpfer im Aufbau ergänzen. Danach fünf bzw. sechs persönliche Fragen. Keine eigenen SAG-/Maximaldruck-Vorgaben mehr; alte solche Angaben überschreiben keine belegten Modellwerte. Unbekannte Modellgrenze: keine errechnete Pumpanweisung, Modelljahr/Anleitung prüfen. Passende Jahr-/Federweg-Druckreihen und Herstellerbereiche, Quellen direkt erreichbar.
- Tatsächliche Feder, z. B. 475 lbs, ist Hauptwert und bleibt gespeichert; berechnete 500 lbs sind ein separater Richtwert. SAG-Schätzung und begrenzte LSR-Korrektur berücksichtigen die Feder, ausdrücklich App-Heuristik mit Messung/Testfahrt. Feintuning, Baselines und Notizen bleiben erhalten. Coil-Dämpfer-Assistent misst die Differenz der Befestigungsabstände ohne/mit Fahrer; keine Pumpen-/Luftkammer-Anleitung. Alter Defekthinweis hat einen erreichbaren Zustandsdialog.
- Hauptansicht: nächste konkrete Aktion, Gabel/Dämpfer klar auswählbar, drei Hauptkarten; weitere Einsteller und lange Erklärungen optional. Dunkle Auswahl sichtbar markiert, Feder-Messsatz zusammenhängend. Echte Herstellerfotos des gewählten Produkts, Kartuschen-/erkennbare Jahrabweichung und fehlende Ausführung führen zu Bildlücke. Kein Referenzfoto oder gezeichnetes Ersatzbild. Schwarze Fotos und Bildansicht; eigenes Radfoto bleibt möglich.
- Fachliche Zuordnungen und Grenzen in docs/FAHRWERK-PERSOENLICH.md. Drei unabhängige Agentenreviews (Hersteller, Bilder, simulierter Einsteiger) und Chromium-Sichtprüfung: 20 Ansichten, 320/390/1280 px, DE/EN, OLED/Hell, keine Überstände oder JS-Fehler. Belege unter CrankScore-Austausch/belege/APP-FAHRWERK-EINFACH-001. Keine echten fachfremden Testpersonen rekrutiert, kein echtes iPhone/Safari geprüft. Kein Versprechen eines perfekt berechenbaren Setups.
- Vollständiges abschließendes npm test bestanden (201 s): Syntax 2 Skripte, Kompatibilität 200/200, Setup 25/25, Fahrwerkfragen 18/18, Wege 36/36, Sprache 0 Funde in 11.082 Texten, BEVEL 34/34, Preise 0 Fehler, Fotos 14/14, Guide-UI 16/16. Foto-Fall nutzt das echte gewählte Modell statt alter Referenzmarker: erst ins Sichtfeld scrollen, dann das verzögert geladene Foto öffnen. Testbericht im Belegordner. Keine zusätzlichen Dienste, API-Kosten oder Zugangsdaten.

### APP-FAHRWERK-EINFACH-001 — Online bestätigt
- Status: ERLEDIGT · Veröffentlichung: JA. Code-/Prüfcommit 6105c3cc1e1502327e37a991af5f5df64399e10e; automatischer Stempelcommit 9c6d1e109e04f19615c47a1fcca276bc87cd9e16. Öffentliche Version **20261018-2007**, Cache **dreambuild-20261018-2007**. Kein manueller Stempel.
- GitHub-Veröffentlichung erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/39152309742 . Sämtliche App-Prüfgruppen bestanden (273 s, Zahlen wie oben), zusätzlich Worker 8/8 mit simulierter API. Pages für den Stempel: https://github.com/trostliam-hub/dreambuild/actions/runs/39152748340 .
- Alle 18 neuen Fahrwerkszenarien zusätzlich direkt gegen https://trostliam-hub.github.io/dreambuild/index.html bestanden, ausschließlich isolierte Testdaten. Der danach abgerufene Stempel änderte nur APP_VERSION und den Service-Worker-Cache, keinen Funktionscode.
- Öffentliche HTML- und Service-Worker-Datei am 18.10.2026 um 18:09:48 UTC vollständig gegen den gestempelten Checkout abgeglichen: jeweils HTTP 200, nach Zeilenenden-Normalisierung identisch; Version und Cache stimmen überein. Belege: online-dateiabgleich.json, fahrwerk-online-test.txt, ci-pruefung.json im Belegordner.
- Bereits installierte App über Profil/Einstellungen → Neue Version laden bzw. Nach Update suchen aktualisieren. Radprofile, tatsächliche Feder, Baselines, Notizen und Feintuning bleiben erhalten. Echte fachfremde Personen und echtes iPhone/Safari stehen als externe Prüfungen aus; die Einsteigerreviews waren simuliert. Keine offenen Implementierungs- oder Veröffentlichungsschritte für diesen Auftrag.

## APP-EINFUEHRUNG-FAHRWERK-002 — Einführung und Orientierung am echten Teil
- Autor: Codex · 18.10.2026 · Status: PRÜFBEREIT, Veröffentlichung vom Nutzer bereits autorisiert. Auftrag: Einführung spannender gestalten und wichtigste Funktionen zeigen; Fahrwerk wieder einfach und direkt verständlich mit richtig großen Bildern und eindeutigen Einstellerpositionen.
- Repository: trostliam-hub/dreambuild · Pfad C:/Users/trost/.codex/visualizations/2026/10/13/01a135c6-c1f3-72a3-b061-bf6f15e8793c/crankscore · Branch codex/erklaerbilder-schwarz · Basis b9b487ec0a7badeb5750ec17132da1f3f6c670c3. origin/main vor Veröffentlichung identisch. Unreal-Spiel unverändert. Zwei Bearbeiter mit eigenen Worktrees, Einsteiger- und Quelltextreview getrennt und read-only.
- Einführung: sechs dunkle Szenen mit echten Katalogfotos und Herstellerquellen. Aufbau, Teileprüfung, optionale Beratung, persönliche Fahrwerkwerte, freiwilliger Guide und Wunschliste/Einkauf. Interaktive Adapter-Demo PM180:180→203mm mit +23mm-Adapter; ausdrücklich Beispiel, ohne Aufbau-/Setupänderung und ohne KI-Anfrage. Große Titel, ruhige Einblendung, direkte Szenennavigation, Tastatur/Fokus, überspringbar; reduzierte Bewegung berücksichtigt. 320×568 bis Desktop geprüft.
- Fahrwerk: Gabel/Dämpfer vor dem Fortschritt auswählen; nächster Schritt und Abschluss gelten für das gewählte Teil. Erste Luft-/Federkarte einmal je Rad/Teil offen, bewusstes Schließen bleibt erhalten. Bild vor Wert und kurzer Anweisung, volle Breite statt alter 92px-Spalte, 230/260px Höhe mit Originalproportionen und Großansicht. LSC/HSC direkt als aufklappbare Zeilen mit einfachen Alltagserklärungen; Details/Quellen bleiben optional. Coil-SAG nennt auch in der Karte Befestigungsabstände statt O-Ring.
- Bilder: nur passende Herstellerdetails nach Modell, Ausführung und Jahr. RS Lyrik/ZEB Charger3.2/LinearXL MY27, SD Luft D1 Ultimate MY27, SD Coil B1 Ultimate MY23–26; FOX DHX/DHX2/FLOAT X/X2 MY25 aus den offiziellen Herstelleranleitungen. FOX-Dateien sind technische Herstellerabbildungen. HSC/LSC getrennte Ziele, B1-Coil auch getrennte Ansichten; Federaufdruck, Zugstufe, Hebel und beide SAG-Augen markiert. Keine Super-Deluxe-Bilder für Vivid Coil. Ohne passende Details eigenes belegtes Modellfoto; bei unpassender Generation ehrliche Bildlücke. Keine selbst gezeichneten Ersatzteile.
- Datenerhalt: 475-lbs-Feder, Messung, Baselines, Notizen, Feintuning, Wunschliste, Aufbau und Fahrerprofil bleiben bei Einführung, Teilwechsel in der Ansicht, Bildzoom und Reload erhalten. Modellwerte und Berechnungen unverändert. Keine neuen Dienste, Schlüssel oder zusätzlichen KI-Anfragen.
- Neue Regressionen: Einführung10/10, Fotozuordnung/Markierungen9/9, Orientierung/Datenerhalt7/7. Alle in npm test und damit im Veröffentlichungsworkflow eingebunden. Alte reine Modellfotoassertions ausdrücklich auf die Gesamtübersicht beschränkt; neue Detailtests prüfen reale Punkte, Jahre, Ausführungen und fremde Modellfamilien separat. Der Bedienwegtest zählt den gemeinsamen Angaben-Editor, während eine offene Druckkarte zusätzlich zum fehlenden Modelljahr führen darf.
- Sichtprüfung: 18 Einführungsszenen bei320/390/1280px, zusätzlich zehn echte Fahrwerkkarten bei320/390px und Coil-SAG auch bei1280px. HSC-/LSC-/Feder-/Ventil-Ziele mit Originalen verglichen. Keine Überstände, keine JS-Fehler; schwarze Fotozonen auch im Hellmodus. Ausgewählte Belege: CrankScore-Austausch/belege/APP-EINFUEHRUNG-FAHRWERK-002. Einsteigerreview simuliert; keine echten fachfremden Personen und kein echtes iPhone/Safari getestet. Kein Versprechen eines perfekt berechenbaren Setups.
- Veröffentlichung: nach Abschluss der Prüfungen Push auf main, automatischen Stempel und öffentliche HTML/SW bestätigen. Kein manueller Versionsstempel.
- Lokale Prüfung abgeschlossen: Syntax2; Kompatibilität200/200; Setup25/25; Fahrwerkfragen18/18; Wege36/36 im gezielten Wiederlauf; Sprache0Funde in11.134Texten; BEVEL34/34; Preise0Fehler; Fotos14/14; Guide16/16; Einführung10/10; Fahrwerkfotos9/9; Orientierung7/7. Der letzte Gesamtlauf hatte ausschließlich eine veraltete Editor-Selektorerwartung (start statt ende); diese Testkorrektur wurde danach mit der vollständigen Wegegruppe36/36 geprüft. Alle App-Funktionen unverändert seit diesem Gesamtlauf. Abschließendes npm test läuft zusätzlich unverändert in GitHub vor dem automatischen Stempel. git diff --check sauber.
- Erster GitHub-Lauf39159607062: sämtliche bestehenden Gruppen bestanden; die drei neuen Gruppen hatten Unterschiede im Testaufbau. Zwei Fotoassertions erwarteten Deutsch bei englischer Server-Browserlocale; die App-Sprache wird nun vor dem Laden fest gesetzt. Drei Datenerhaltassertions erfassten das nachträgliche Anlegen von profile.real[0].nein={} durch upNein() als Änderung. Mit en-US/UTC reproduziert: ausschließlich fehlend→leere Ablehnungsliste, kein Verlust von Rad/Feder/Setup/Wünschen. Fixtures erhalten jetzt bereits eine echte Ablehnung gabel:g-zeb, deren Erhalt mitgeprüft wird. Snapshots vergleichen alle JSON-Daten semantisch und melden genaue Blattpfade; keine Datenfelder werden ausgeschlossen. Der Testbericht hält bei Fehlern64k statt4k Ausgabe für vollständige Diagnosen vor. App-Funktionscode dabei unverändert. Erneuter GitHub-Lauf folgt.
- Zusätzlich direkt online: Einführung10/10, Orientierung7/7 und Fahrwerkfragen18/18 erfolgreich, ausschließlich isolierte Daten. Logs im Belegordner. Die spätere automatische Stempelung verändert nur Version und Cache.
- Nach Testfixture-Korrektur alle26neuen Fälle unter ausdrücklich en-US/UTC bestanden (10+9+7), keine JS-Fehler, kein Ausschluss von Datenfeldern. Ursache und kurzer Blattpfad-Diff separat reproduziert. Syntax und Whitespace sauber. Erneuter Push umfasst ausschließlich Tests, Diagnosen und Nachweise; App-Code bleibt7f27ddf.

### APP-EINFUEHRUNG-FAHRWERK-002 — Online bestätigt
- Status: ERLEDIGT · Veröffentlichung: JA. App-Codecommit7f27ddf16e6e43aa7d599f99baef8319c3ae7ef6; abschließender Prüfcommitfd13bc8b1d7b4212b8963b8339d450afb924ff66; automatischer Stempelcommitbc172188653f1958a0f200636358cb50e57fa714. Öffentliche Version **20261018-2154**, Cache **dreambuild-20261018-2154**.
- Veröffentlichungsworkflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/39160394790 . Vollständiges npm test bestanden (321s):369Appfälle,2Syntaxprüfungen, Sprache0Funde in11.134Texten, Preisprüfung0Fehler; zusätzlich Worker8/8 mit simulierter API. Neue Gruppen10/10,9/9,7/7. Pages für den Stempel erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/39160898425 .
- Öffentliche HTML- und Service-Worker-Datei am18.10.2026 um19:56:19UTC vollständig mit dem gestempelten Checkout abgeglichen: HTTP200, jeweils nach Zeilenenden-Normalisierung identisch, Version und Cache stimmen überein. Nachweis online-dateiabgleich.json und ci-pruefung.json im Belegordner. Der automatische Stempel änderte ausschließlich APP_VERSION und Cache.
- Direkt online35/35Fälle bestanden (Einführung10, Orientierung7, Fahrwerkfragen18), einschließlich gespeicherter475-lbs-Feder und Ablehnungen. Keine echten Nutzerdaten geöffnet oder geändert. Aktualisieren über Profil/App → Nach Update suchen → Neue Version laden; Einführung über Profil → Einführung ansehen. Keine offenen Implementierungs-/Veröffentlichungsschritte für diesen Teilauftrag.
- Neuer Folgeauftrag des Nutzers vom18.10.2026: gesamte App ohne Rückfragen systematisch modern, verständlich und zuverlässig verbessern. Dafür eigener aktiver Goal und drei unabhängige read-only Audits; diese Qualitätsrunde ist noch aktiv.

## APP-QUALITAET-001 — Verständlichkeit, Datenerhalt und Offlinebetrieb
- Autor: Codex · 18.10.2026 · Auftrag: gesamte CrankScore-App autonom verbessern und veröffentlichen, ohne Rückfragen. Basis3240eef97a568ace90b06f65f5473e625212e454, Branch codex/qualitaetsrunde; tatsächlicher App-Pfad unverändert. Fremdes Unreal-Spiel nicht geändert. Drei unabhängige Audits und drei getrennte Implementierungs-/Test-Worktrees; Integration nur im App-Checkout.
- Bilder und Bedienung: echte Fotos bleiben; bei 404-Nahfoto verschwinden dessen Zeiger, Beschreibung/Original/Quelle bleiben erreichbar. Zugängliche Dialognamen, Tastaturfokus im offenen Blatt und Rückkehr zum Auslöser. Einkauf auf schmalen Geräten mit voller Textbreite und zusammenhängenden Beträgen. 24 integrierte Wunschlisten-/Einkaufsansichten bei320/390/1280px, DE/EN, OLED/Hell ohne Überstände oder JS-Fehler geprüft.
- Verständlichkeit: Zubehörkosten von vollständigem Teilepreis getrennt, Scheibenvarianten direkt sichtbar, fehlende Preise/Versand offen. Vorhandene XT180/180→220/203: ab41€ bekannte Zubehörkosten, Scheiben zusätzlich, kein Kauflink zur erneut angebotenen vorhandenen Bremse. Freie Einträge ohne Preis erzeugen keinen scheinbaren0€-Gesamtpreis. Offene Körper-/Gewichts-/Maßprüfungen statt falschem Alles-passt-Abschluss, auch im lokalen Guide. Ablesehilfe beim ersten Rad und im Profil; Radverwaltung verständlich benannt; Kandidatenzubehör erst nach Übernahme angekündigt; keine pauschale Mineralöl-Unbedenklichkeitszusage.
- Zuverlässigkeit: optional beschädigte Speicherschlüssel getrennt behandeln, Profile trotzdem laden. Beschädigte/unlesbare Profile vor Überschreiben schützen. Alte Fotos erst nach bestätigtem Speichern der Kopien und zugehörigen Profil-IDs entfernen; bei Speicherfehlern Altquelle behalten und Neustart erlauben. Updates warten auf bereite Offline-Version, Fehler erhalten bisherigen Cache; nur eigene alte Cachepräfixe bereinigen. Guide-Gratisgrenze vor lokaler und KI-Frage, zusätzlicher Sitzungszähler bei gesperrtem Speicher. Pro-Entfernung löscht Code/Instanz erst nach bestätigter Deaktivierung.
- Entlastung: zwölf unerreichbare alte Zeichenkörper nach sofortiger Rückgabe entfernt, aktive Rückgaben unverändert;82.887Bytes unkomprimierten UTF-8-Quelltext gespart. Keine erfundenen Bilder, keine Preis-/Kompatibilitäts-/Fahrwerkberechnungen verändert. Keine neuen Dienste, Zugangsdaten oder Kosten.
- Gezielte Prüfungen: Bedienung10/10 und QualitätUX8/8 auf integriertem Hauptcheckout; Zuverlässigkeit10/10 unter Playwright1.56.1 im Review-Worktree, einschließlich echtem lokalem Service Worker und physisch geschlossenem HTTP-Server. Die identische endgültige Testdatei ist integriert und läuft im vollständigen npm test. KI-Server8/8 mit simulierter API. Die drei neuen Gruppen sind in npm test registriert. Unabhängiger Quelltext-Review abgeschlossen, keine neuen P1/P2-Funde, geprüfte App-Hashes im Belegordner. Fachfremde Einsteigerreviews simuliert; echtes iPhone/Safari nicht verfügbar. Details: docs/QUALITAETSRUNDE-2026-10-18.md; ausgewählte Bildbelege: CrankScore-Austausch/belege/APP-QUALITAET-001.
- Testhärtung: Cacheabfragen werden ausdrücklich als aufgelöste boolesche Werte gepollt; ein asynchrones Playwright-Prädikat hatte die Prüfung zuvor zu früh fortgesetzt. Für echten Verbindungsabbruch wird der lokale HTTP-Server nach bestätigter Installation vollständig geschlossen, da ältere Playwright-Versionen den Worker-Netzpfad beim Offline-Schalter nicht zuverlässig unterbrechen. Strenge Cache-/Profilassertions bleiben erhalten, auch nach Reload. Keine Appkorrektur wegen dieser Testablaufabweichungen erforderlich.
- Fortsetzung am20.10.2026: der Gesamtlauf vom18.10. endete mit nur einer fehlgeschlagenen Testablaufprüfung9/10, alle anderen Gruppen grün. Ursache unabhängig bestätigt: ein externer Windows-Prüfadapter installierte eine Page-Route, die die erwartete simulierte Update-Abbruchantwort der Context-Route überlagerte. Adapter außerhalb des Repos vereinfacht; keine App-/Testdatei geändert. Identische Zuverlässigkeitsdatei8E0EC28935C97C1B1322B5773568769E5D3651F6A063E8C02E10D6860B844ACB auf dem Hauptcheckout erneut10/10 bestanden, einschließlich physisch geschlossenem Server. Alter Fehlversuch als eigener Beleg aufbewahrt; erneuter Gesamtlauf folgt vor Push. App-Hashes stimmen weiterhin mit dem unabhängigen Review überein.
- Abschließendes npm test am20.10. vollständig bestanden (253s):397Appprüfungen plus2Syntaxprüfungen, Sprache0Funde in11.139Texten und Preise0Fehler. Einschließlich der28neuen Prüfungen10/10+10/10+8/8. Bericht und Konsolenlog im Belegordner, App-/Workerhashes weiterhin identisch mit dem unabhängigen Review. Keine offenen Implementierungsschritte dieser Qualitätsrunde; Veröffentlichung jetzt autorisiert über main, danach CI/automatischen Stempel und öffentliche Dateien bestätigen.

### APP-QUALITAET-001 — Online bestätigt
- Status: ERLEDIGT · Veröffentlichung: JA. App-/Prüfcommit3e10f9536c990f2f18308387a0a397e35b55a381; automatischer Stempelcommitb057b759d63a50d79172a050215594deff5080e0. Öffentliche Version **20261020-1622**, Cache **dreambuild-20261020-1622**. Der Stempel änderte ausschließlich APP_VERSION und CACHE.
- GitHub-Gesamtworkflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/39437374439 . Sämtliche397Appfälle plus2Syntaxprüfungen bestanden (404s), Sprache0Funde in11.139Texten, Preise0Fehler; zusätzlicher KI-Server8/8 mit simulierter Provider-API. Prüfen/Stempeln/Veröffentlichen alle erfolgreich. Pages für den Stempel ebenfalls erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/39438622258 .
- Öffentliche HTML-/SW-Datei am20.10.2026 um14:24:13UTC vollständig mit dem gestempelten Checkout abgeglichen: HTTP200, nach Zeilenenden-Normalisierung jeweils identisch, Version/Cache korrekt. Direkt online17/17neue Fälle bestanden (UX8, Zuverlässigkeit9; der echte Offlinefall ist zusätzlich lokal mit geschlossenem Server geprüft). Synthetische isolierte Daten, keine echten Nutzerprofile oder kostenpflichtigen KI-Anfragen. Der automatische Stempel nach diesen Onlinefällen änderte nur Version/Cache.
- Zusätzlicher vorbestehender Fehler in Live-Preise geklärt: ohne PREIS_FEEDS konnte preisverlauf.json fehlen; zwingendes git add brach mit Exit128 ab. Zwei unabhängig geprüfte Workflow-Hunks behandeln nur vorhandene Preisdateien und bewahren Bilder/Vendor/konkretes Rahmenmodell im Preis-Archiv. Alter Fehler reproduziert; drei Stagingfälle, Bashsyntax, Python-Preistest0Fehler, echtes Archiv53/53Pflichtassets+Produktskripte+10Vendor+gültigeGLB bestanden. Quellen/Belege und Prüfhunkhash in preisworkflow-pruefung.json; keine Secrets/Rechte/Zeitpläne geändert. Diese Workflowkorrektur wird mit den Abschlussbelegen separat veröffentlicht; App-Code bleibt unverändert.
- Einschränkung: Shopfeeds sind nicht hinterlegt; Livepreise bleiben unkonfiguriert, App zeigt Richtpreise und entsprechenden Hinweis. Ein neuer entfernter Preis-Workflowlauf wird nicht behauptet. Einsteigerreviews simuliert, echtes iPhone/Safari nicht geprüft. Keine offenen App-Implementierungs- oder Veröffentlichungsschritte der Qualitätsrunde. Aktualisieren über Profil/App → Nach Update suchen → Neue Version laden.
