# Claude-Auftrag: bestätigte CrankScore-Fehler beheben

Auftrags-ID: **APP-CLAUDE-AUDIT-001**
Autor: Codex · Empfänger: Claude · Nutzer: Liam
Datum: 23.10.2026, Europe/Berlin · Status: **OFFEN**
Ziel: Die unten bestätigten Fehler nachvollziehen und gezielt beheben. Verständlichkeit und Erhalt vorhandener Rad-/Fahrwerkdaten stehen zuerst.

## Einstieg und aktueller Stand

Du arbeitest an **CrankScore**, Repository https://github.com/trostliam-hub/dreambuild, nicht am Unreal-Spiel MTBProject im möglicherweise voreingestellten Arbeitsverzeichnis.

- Auditbasis: `29e7a8f021c50b8f221a257d2fadbbdead8f025f` auf `main`.
- Audit-/Übergabebranch: `codex/claude-fehleraudit`.
- Lokaler App-Pfad bei Codex: `C:/Users/trost/.codex/visualizations/2026/10/13/01a135c6-c1f3-72a3-b061-bf6f15e8793c/crankscore`.
- Öffentlich geprüfte App: https://trostliam-hub.github.io/dreambuild/index.html · Version **20261020-1622**, Cache **dreambuild-20261020-1622**.
- HTML und `mtb-sw.js` wurden am 23.10.2026 um 18:15 Uhr vollständig mit der Auditbasis verglichen: HTTP200, nach Normalisierung der Zeilenenden identisch. `preise.json` ebenfalls identisch.
- Dieser Auftrag ergänzt die Qualitätsrunde vom 20.10.; alte bereits behobene Fehler nicht wieder als offen übernehmen. Zwischen deren Abschlusscommit `ba9f1764` und Auditbasis änderte sich nur `preise.json`.
- Übergabedokumente ändern keine Appfunktion. Der aktuelle Nutzerauftrag ist Prüfung plus Prompt für Claude; er meldet keine Fehlerbehebung oder neue App-Veröffentlichung.

Lies zuerst `CLAUDE.md`, `CrankScore-Austausch/README.md` und alle vier aktuellen Austauschdateien. Prüfe Pfad, Branch, Basis und fremde Änderungen. Nutze einen eigenen Branch/Checkout für Änderungen; fremde Arbeit erhalten. Beziehe dich bei deiner Antwort auf diese Auftrags-ID und die nachfolgenden Fehler-IDs.

## Bestätigte Fehler: zuerst CS-01 und CS-02

### CS-01 · P1 · Dämpferwechsel setzt die sichtbaren Werte der unveränderten Gabel zurück

**Nachstellen:** Synthetisches Rad Propain Spindrift mit ZEB Ultimate Charger3.2 RC2 und Super Deluxe Coil230×65 eintragen, passende Modelljahre wählen und Fahrwerkfragen abschließen. Gabel102psi, Zugstufe+2, SAG36mm und eine Notiz speichern. Im Aufbau ausschließlich den Dämpfer gegen Super Deluxe Ultimate230×65 Standard tauschen. Fahrwerk öffnen, „Fragen fortsetzen“, Dämpferjahr2027 wählen und abschließen.

**Ist:** Die unveränderte Gabel steht wieder auf der Empfehlung130psi; Feintuning, Gabelmessung und bisheriger Verlauf erscheinen leer. Die alten Daten sind noch unter dem vorherigen kombinierten Schlüssel gespeichert. Es handelt sich um eine falsche Datenzuordnung, nicht um bewiesene physische Löschung aller alten Daten.

**Ursache:** `index.html:13514` `suTeile`, `:13515` `suKey`, `:13516` `suDaten`: Schlüssel enthält Radprofil und beide Federelemente. Ein einseitiger Teilewechsel erzeugt ein komplett leeres Setup. Die Alt-Migration behandelt nur frühere Schlüssel ohne Radprofil.

**Soll / Abnahme:** Werte, Messungen, Grundeinstellungen und Erledigt-Zustände des unveränderten Elements in allen Fahrprofilen erhalten. Neue Daten nur für das gewechselte Element anlegen. Dämpferwechsel und spiegelbildlichen Gabelwechsel prüfen, jeweils nach Reload und mit475-lbs-Feder im unveränderten Coil-Dämpfer. Kein Übertragen fremder Messungen auf das neue Teil; keine Vermischung verschiedener Räder. Paarbezogene Notizen/Testfahrten nicht ungeprüft kopieren. Profilkopie und Löschen müssen weiter funktionieren.

**Beleg:** `belege/APP-CLAUDE-AUDIT-001/fahrwerk-befunde.json`, Abschnitt `P1_Daempferwechsel`; `daempferwechsel-verliert-gabelwerte-390.png`.

### CS-02 · P1 · Eine unterbrochene Testfahrt setzt nach Profilwechsel das falsche Fahrprofil zurück

**Nachstellen:** Im Fahrprofil Downhill Gabelzugstufe+1 speichern. Auf Allround wechseln; Testfahrt → „Etwas stimmt nicht“ → Gabel → „Kickt“ → „Ist eingestellt – testen“ (Teständerung+2). Dialog schließen. Unter Profile auf Downhill wechseln, „Testfahrt fortsetzen“, dann „Abbrechen und zurückstellen“.

**Ist:** Downhill verliert sein vorheriges+1. Allround behält die Teständerung+2. Der fortgesetzte Dialog heißt plötzlich „Testfahrt-Assistent · Downhill“ und verwendet andere absolute Klickzahlen.

**Ursache:** `testHtml` `index.html:14586`, `oeffneTest` `:14640`; Start in `:18704` speichert kein Ursprungsfahrprofil in `dd.tr`. Ergebnis/Abbruch `:18709` bis `:18720` nutzt `suP(dd)`, also das inzwischen aktive `fedModus`. Profilwechsel `:19147` bis `:19153` bindet den Test nicht um oder ab.

**Soll / Abnahme:** Test, Anzeige, Übernehmen, Verwerfen und Protokoll bleiben eindeutig an Rad, Teilekombination und ursprüngliches Fahrprofil gebunden. Abbruch stellt ausschließlich die Ursprungswerte wieder her. Prüfe alle drei Fahrprofile, Reload, Rad-/Teilewechsel und den separaten Profi-Test `d.test`; Letzterer ist hier eine gezielte zusätzliche Prüffläche, kein schon bestätigter zweiter Fehler. Alte gespeicherte Tests ohne Profil-ID sicher behandeln.

**Beleg:** `fahrwerk-befunde.json`, Abschnitt `P1_TestfahrtProfilwechsel`; `testfahrt-falsches-profil-390.png`. Der Screenshot illustriert den Zustand; Vorher/Nachher-Werte stehen im JSON.

### CS-03 · P2 · Import und Laden prüfen gültiges JSON nicht ausreichend auf seinen Inhalt

Drei unabhängig reproduzierte Fälle einer zusammenhängenden Validierungslücke:

1. In einer sonst gültigen synthetischen App-Sicherung `daten["mtb.profile"]` so ändern, dass `liste.real=[null]`. `sicherungPruefen` akzeptiert sie, Vorschau zeigt „?“, `sicherungAnwenden` meldet Erfolg. Nach Reload fehlen Name/Wunschliste des vorherigen Profils; erst jetzt greift der Ladeschutz. Die Nutzeraktion „Ersetzen“ wurde im Test bewusst ausgeführt; der Fehler ist die vorherige Annahme unbrauchbarer Daten.
2. `daten["mtb.setup"]='{"bad-key":{"prof":{}}}'` wird akzeptiert. Nach Import und Reload wirft der nächste Sicherungsexport synchron `Cannot read properties of undefined (reading 'length')` in `suLeer/suSichern`.
3. Im gespeicherten Radprofil `sel:"trail"` statt des Arrays `["trail"]` setzen. Nach Reload:0Aufbaugruppen, JS-Fehler `(p.sel || []).filter is not a function`, `ladeProfilSchutz=false`.

**Fundstellen:** `index.html:6294` `sicherungPruefen`, `:6338` `sicherungAnwenden`; `:6192` `laden`, Profilübernahme `:6218` ff.; `:6134` `profilName`; `:13505` `suLeer`, `:13508` `suSichern`.

**Soll / Abnahme:** Vor jedem ersetzenden Schreibzugriff alle relevanten Strukturen prüfen und verständlich ablehnen oder dokumentiert migrieren. Ungültiger Import darf keinen bestehenden `mtb.*`-Eintrag verändern. Ein Start mit beschädigten Daten darf die Oberfläche nicht abbrechen oder unlesbare Originale still überschreiben. Export darf nicht an einem einzelnen defekten Setup abstürzen. Gültige heutige und bekannte alte Sicherungen müssen weiterhin einschließlich Fotos, Wünsche,475lbs und Notizen funktionieren. Tests mit Vorher/Nachher-Vergleich aller gespeicherten Daten, nicht nur Rückgabewerten.

**Belege:** `daten-befunde.json`, erste, zweite und vierte Probe. `daten-repro.cjs` enthält die genauen synthetischen Änderungen. Das sind strukturell beschädigte Testdateien, kein Nachweis, dass normale aktuelle App-Exporte solche Dateien erzeugen.

### CS-04 · P3 · Radkopie verliert bei vollem Speicher ihr Foto ohne Meldung

**Nachstellen:** Synthetisches Pro-Testprofil lokal anlegen, ein Rad mit gespeichertem Foto kopieren. Browser-localStorage vorher bis nahe an seine tatsächliche Kapazität füllen, sodass die kleinen Profildaten noch passen, die Fotokopie aber nicht. Der Nachweis verwendet echte Chromium-Speicherknappheit, keinen geworfenen Mockfehler.

**Ist:** Neues Profil wird gespeichert und geöffnet, sein Foto fehlt, kein Toast. Originalfoto bleibt erhalten. Nachweis:344599Zeichen Foto, insgesamt ungefähr5,16Mio gespeicherte Zeichen; diese Zahlen sind keine universelle Browsergrenze.

**Ursache:** `index.html:6104` `profilNeu`, insbesondere leerer `catch` bei Fotokopie `:6108`.

**Soll / Abnahme:** Vollständigen Erfolg erst melden/anzeigen, wenn die Kopie gespeichert ist. Bei Platzmangel verständlich reagieren und einen sicheren Zustand halten: Original unverändert; entweder vollständige Kopie oder ausdrücklich erkennbare Teilkopie mit Wiederholungsmöglichkeit. Keine unsichtbar verwaisten Foto-/Setupeinträge nach Abbruch. Nach Reload prüfen. Keine echte Pro-Lizenz/Kaufanfrage für diesen Test nötig.

**Beleg:** `daten-befunde.json`, `profile-copy-real-quota-photo`; `daten-repro.cjs`.

### CS-05 · P2 · Startseite und Einrichtung lassen den Tastaturfokus in verdeckte Navigation

**Nachstellen:** Frisches isoliertes Browserprofil. Auf der Startseite fokussiert bereits der erste Tab `#mini` dahinter. Dann Starten → Einführung überspringen. Ab der fokussierten Überschrift „Mit welchem Rad fängst du an?“ siebenmal Tab, dann Enter.

**Ist:** Fokus läuft über drei Radoptionen, BODY, `#mini`, Guide und Profilknopf. Enter öffnet „App & Profil“ und verdrängt die Ersteinrichtung, obwohl noch kein Radtyp gewählt wurde. Auch im separaten Fahrerprofil reproduziert.

**Ursache:** `index.html:8482` `oeffneStartseite`, `:10246` `eiZeigen`; `:17633` `blattDialogAktiv` berücksichtigt nur `.scrim > .sheet`. Die bestehenden Tastaturhandler `:17651`, `:17659` greifen für `.ls`/`.ei` nicht. Normale Sheet-Dialoge wurden bereits repariert; diese Reparatur erhalten.

**Soll / Abnahme:** Im aktiven modalen Bereich sinnvoller Anfangsfokus und zyklisches Tab/Shift+Tab; Hintergrund kann keine Aktionen auslösen. Fokus bei regulärem Verlassen sinnvoll zurückgeben. Einrichtung, Fahrerprofil, reguläres Sheet und Fotoansicht gemeinsam prüfen. Keine neue globale Tastatursperre.

**Belege:** `ui-ergebnis.json`, `fokus-beweis.json`, `fokus-repro.cjs`; Screenshots `390-onboarding-tab7-hintergrund.png`, `390-onboarding-enter-profil-statt-einrichtung.png`.

### CS-06 · P2 · Richtige ZEB-Nahaufnahme, aber falsche Farbe in der Positionsanweisung

**Nachstellen:** ZEB Ultimate, Modelljahr2027, Charger3.2 RC2/LinearXL → Zugstufe öffnen.

**Ist:** Kopf und Anleitung nennen „rotes Rädchen unten am rechten Holm“. Das passende Nahfoto und sein Bildtext zeigen korrekt den **schwarzen gerändelten Knopf**. Gerade Anfänger suchen dadurch nach dem falschen Merkmal.

**Fundstellen:** `index.html:12598`, `:13964` gegenüber dem modellspezifischen Bildtext `:13857`.

**Soll / Abnahme:** Position, Bezeichnung, Kurztext, Anleitung und Fotoalttext modell-/jahrspezifisch konsistent. Nicht global jede rote Zugstufenbeschreibung durch schwarz ersetzen. ZEB2027 und wenigstens eine ältere tatsächlich rote Ausführung prüfen; DE und EN. Foto und Markierung dieses Falls waren korrekt, kein erfundenes Ersatzbild erstellen.

**Beleg:** `fahrwerk-befunde.json`, `P2_Orientierung`; `zeb2027-zugstufe-farbwiderspruch-390.png`.

### CS-07 · P3 · Kurze Hilfetexte widersprechen aktueller Bremsenoberfläche und Vergleich

- Guide → „Wie groß dürfen die Bremsscheiben sein?“ (`GUIDE`-ID `scheiben`, `index.html:11797`/`:11798`) behauptet noch gelb „passt mit Adapter“. Der Nachbareintrag `w-adapter` und die aktuelle Oberfläche `:17325` erklären hingegen korrekt den automatisch eingeplanten Adapter „Automatisch dabei“. Den Guide an den tatsächlichen Ablauf anpassen; Rechenbeispiel und automatisches Wechseln erhalten.
- Kategorieerklärung Bremsen `:5407`/`:5431`: „Mehr Kolben ... bremsen kräftiger“ als pauschale Regel. Der Vergleich erklärt in `:16771` bereits, dass dies von Übersetzung, Belag und Hebel abhängt. Anfängertexte in DE/EN einheitlich und kurz formulieren. Bei weitergehenden Fachänderungen offizielle Herstellerquellen prüfen; nicht nur einen neuen pauschalen Satz einsetzen.

**Abnahme:** Ein Einsteiger erhält in Kategorie, Vergleich und Guide dieselbe Erklärung und findet den tatsächlich vorhandenen Adapterhinweis. Keine Änderung an Kompatibilitätsrechnung, Score oder Kosten nötig.

**Beleg:** `root-audit.json`; `guide-adapter-veraltet-390.png`. Die Bremsenkategorie wurde zusätzlich im laufenden Appzustand ausgelesen; der Vergleich quellenbezogen geprüft.

## Fehlende Konfiguration: separat behandeln, nichts erfinden

Diese Punkte sind öffentlich beobachtete Lücken, keine durch neue Algorithmen lösbaren Fehler:

- `impressumFehlt()` meldet fehlende Felder `name, strasse, ort, email`; sichtbares Impressum enthält Platzhalter. Echte Betreiberangaben müssen von Liam kommen. Keine Identität, Anschrift oder Rechtsprüfung erfinden.
- Monatlicher/jährlicher Pro-Checkout sowie Store-/Produkt-ID fehlen in der öffentlichen Konfiguration. Der tatsächliche Bezahl-/Aktivierungsweg ist daher nicht vollständig prüfbar. Keine erfundenen Kauf-URLs einsetzen; bestehende ehrliche Nichtverfügbarkeit erhalten.
- `preise.json` ist erreichbar:0echte Preisangebote,2geprüfte XT-Produktseiten. `preisverlauf.json`404 ist hier optional und kein bewiesener Funktionsfehler. Preisworkflows laufen nach dem früheren Fix wieder grün. Richtpreise weiterhin eindeutig von Liveangeboten trennen; ohne Feeds keine Livepreise behaupten.
- Die verlinkten XT-Vorder-/Hinterbremsseiten enthalten laut geprüften Shopangaben jeweils auch Hebel und Leitung. Nicht aufgrund des englischen Titels „caliper“ fälschlich einen neuen Lieferumfangsfehler melden.

## Arbeitsweise und Abnahmepaket

1. Zuerst jeden Fehler auf deinem aktuellen Commit nachvollziehen. Wenn schon behoben, Commit und Gegenprobe nennen. Dann kleine gezielte Korrekturen, Datenerhalt vor Designkosmetik. Kein Gesamtumbau der Ein-Datei-App für diese Reparaturen nötig.
2. Nachweise dieses Audits stehen relativ zu dieser Datei unter `belege/APP-CLAUDE-AUDIT-001/`. Sie enthalten ausschließlich Testdaten. Reprohelfer liegen außerhalb der produktiven Tests und müssen für deinen Pfad/Chrome angepasst werden; nach der Behebung aussagekräftige Regressionen in die bestehende Testsuite integrieren.
3. Prüfe CS-01/02 auch nach Reload und nach Wechseln zwischen Rädern/Fahrprofilen. Nicht nur Anzeigen vergleichen: gespeicherte Daten, Messbezug, Historie und Rücknahme prüfen. Strukturvalidierung sowohl beim Import als auch beim normalen Start testen.
4. Bestehende Eigenschaften erhalten:475-lbs-Feder bleibt Hauptwert statt500-lbs-Richtwert; konkrete Modellgrenzen statt vom Nutzer abgefragtem Maximaldruck; ohne Rad zum Aufbau; echte passende Modellbilder mit eindeutigen Markierungen und schwarzem Hintergrund; keine selbst gezeichneten/fremden Ersatzteile. Geprüfte Coil-Fotos für Feder, SAG, Zugstufe, LSC und HSC luden korrekt.
5. Handyansichten320/390px, Desktop, Deutsch/Englisch, Hell/OLED, Tastatur und reduzierte Bewegung prüfen. Keine bezahlten KI-, Lizenz- oder Kaufaktionen für Tests. Keine API-Schlüssel ablegen, kein neues Kostenmodell oder neue Dienste.
6. Gezielte Regressionen und danach `npm test` sowie `npm run test:guide` ausführen. Historische Referenz vom20.10.:397Appfälle,2Syntaxprüfungen, Sprache0Funde und Preisprüfung0Fehler; Worker8/8 mit simulierter Provider-API. Diese Zahlen sind **keine am23.10. erneut bestandene Gesamtprüfung**. Neue Regressionen erhöhen die Zahl. Fehlende Voraussetzungen präzise melden.
7. Quelltextreview getrennt vom Implementieren. `git diff --check`, Datenmigration und Rückwärtskompatibilität prüfen. Für physisches iPhone/Safari und echte fachfremde Personen gibt es hier noch keinen Nachweis; emuliertes Chromium nicht als echte Nutzerstudie ausgeben. Die bewusste bestehende Zoomsperre ist eine separate Produktentscheidung, kein in diesem Auftrag freigegebener Umbau.
8. Antworte in `CLAUDE-ANTWORTEN.md` mit derselben Auftrags-ID: je CS-ID reproduziert/behandelt/offen, Basis-/Prüfcommit, Dateien, tatsächlich ausgeführte Tests, Datenmigration und verbleibende Grenzen. Ergänze in `CODEX-AUFTRAEGE.md` einen konkreten Nachprüfauftrag. Code fertig, Tests bestanden und live veröffentlicht getrennt berichten. Versionsstempel nicht von Hand ändern; eine spätere autorisierte Veröffentlichung benötigt zusätzlich CI- und Live-Nachweis.

## Umfang und Grenzen des Audits

Drei unabhängige Prüfperspektiven (Fahrwerk/Einsteiger, Daten, Bilder/Bedienung) plus Zusammenführung und Gegenprüfung durch Codex. Neue Datenfälle wurden im identischen lokalen Quellstand getestet; die Fahrwerk- und Tastaturfälle direkt live. Datenproben durch Codex erneut4/4 reproduziert. Nur isolierte synthetische Profile, keine echten Nutzerprofile, keine API-/Lizenz-/Kaufaufrufe. Die Bildprüfung verwarf schwarze Zonen vor Ladeabschluss als vermeintliche Fehler. Echte Fotos nach Ladeabschluss sichtbar und in den geprüften Fällen richtig markiert.

Das ist eine priorisierte Liste belegter Restfehler und offener Konfiguration, kein Beweis, dass alle übrigen Appzustände fehlerfrei sind.
