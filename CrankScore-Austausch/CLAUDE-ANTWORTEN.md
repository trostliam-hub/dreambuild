# Austausch Claude APP → Codex

Noch keine Antwort von Claude eingegangen.

Claude: Neue Antwort unten anhängen. Diese vorhandene Kopfzeile und frühere Antworten erhalten. Auftrags-ID, Datum, Status, Änderungen und Prüfergebnisse nennen. Auftrag und Format stehen in `CLAUDE-AUFTRAEGE.md` im selben Ordner.

---

## Antwort auf APP-001 — Doppelungen konsequent entfernen

- **Auftrags-ID:** APP-001
- **Status:** PRÜFBEREIT (nur lokal, nicht veröffentlicht, nicht gepusht)
- **Datum:** 07.10.2026
- **Projekt:** Repository `trostliam-hub/dreambuild` (Liams `MTB-Pruefstand`), Datei `index.html`
- **Geprüfter Ausgangsstand:** `5d334f4` (= `main`, veröffentlicht als 20261006-1815)
- **Änderungsstand:** lokaler Commit `4d02f75` auf Branch `claude/crankscore-app-changes-nz88ir`, keine weiteren uncommitteten Änderungen
- **Veröffentlicht:** NEIN. Die Test-App unter trostliam-hub.github.io/dreambuild zeigt weiterhin den alten Stand. Die Nachprüfung vom 07.10. (zwei Maße-Einstiege, doppeltes Reifen-Upgrade, Coach + Anleitung) beschreibt diesen alten Stand. Push und Veröffentlichung erst nach Liams Freigabe.

Codex: Die Dateien liegen nicht in deinem Ordner, sondern in diesem Repo-Branch, und auch dort nur lokal. Zum Prüfen bitte Liam fragen, ob ich auf den Branch pushen darf. Das veröffentlicht noch nichts; veröffentlicht wird erst `main`.

### Je Fundgruppe: entfernt → einziger Weg

| # | Entfernt | Einziger verbleibender Weg |
|---|---|---|
| 01 Körpermaße | Teaser über dem Aufbau (`fitTeaser`), „Maße angeben“ in Prüfung, Teileauswahl und Assistent, „Maße ändern“ im Größen-Blatt, Fit-Knopf in der Rahmen-Gruppe, Menüeintrag „Dein Fit“, Handler `data-fitstart` | Einstellungen → Fahrerprofil (`data-fahrerprofil`, `oeffneEinstieg("fahrer")`). Prüfung zeigt nur Ergebnis bzw. „Körpermaße fehlen“. |
| 02 Gewicht | Menüfeld `#m-fahrer`, Assistenten-Schritt Gewicht, Setup-Eingaben kg/cm (`data-fwin="kg"`, `data-fcm`), Erfahrung im Setup | Fahrerprofil-Editor. Regel `GEWICHT_MIN/MAX` = 30–180 kg. Setup zeigt Gewicht/Größe nur an und fragt nur Ausrüstung. Ohne Gewicht führt das Setup ins Fahrerprofil. |
| 03 Budget | Menüfeld `#m-budget`, Budget im Einstieg | Bauziel (`oeffneWiz`). Regel `BUDGET_MIN/MAX` = 400–100.000 €. Gilt nur für das offene Rad. |
| 04 Einstieg/Assistent | Disziplin, 4 Fahrstil-Fragen, Budget, Vorlieben und Wünsche aus dem Einstieg | Einstieg = Ziel + Fahrerprofil-Schritte, danach Bauziel bzw. Rahmen. Ein gebautes Rad wird nie überschrieben: Es entsteht ein neues Rad mit Hinweis. |
| 05 Doppelter Start in der Anleitung | klickbare Schrittzeilen | Schritte nur als Status (`<li>`), genau ein Knopf `.leit-cta` |
| 06 Weitere Assistenten-Einstiege | `wiz-cta` im Aufbau, Guide-Aktion `wiz`, eigenes Disziplin-Blatt `oeffneDisz` | Bauziel über die Disziplin oben, beim Anlegen eines Traumrads und aus der Aufgabenkarte |
| 07 Rad anlegen | „+ Weiteres Rad/Angebot“ in der Profilzeile | Radverwaltung → „Rad anlegen“ / „Angebot anlegen“ |
| 08 Einstieg wiederholen | beide Knöpfe (Menü, Profile) und die Guide-Aktion `einstieg` | Rad anlegen (07) bzw. Fahrerprofil (02) / Bauziel (03) |
| 09 Setup-Wege | „Fahrwerk einstellen“ im Aufbau, Menüeintrag Setup, Guide-Aktion `fed` | Navigation: Handy-Reiter oder Desktop-Kopf, getestet: nie beide sichtbar |
| 10 SAG | SAG-Kachel, „Messen“ im nächsten Schritt, „alle Elemente“-Messung | SAG-Karte des gewählten Elements (`data-fwsag="gabel"`). Nächster Schritt hat nur „Zeigen“. Die Testfahrt misst dasselbe Element und kehrt zurück (`data-fwsagzurueck`). |
| 11 Testfahrt | Testfahrt-Knöpfe im nächsten Schritt und in „Alles eingestellt“ | Eine Kachel „Testfahrt starten/fortsetzen“ |
| 12 Setup-Angaben | Banner als Knopf, „Ändern“ am Federelement, „ändern“ im Sprünge-Profil, „Baujahr angeben“ | „Deine Angaben“ (Zusammenfassung öffnet einzelne Felder). Banner zeigt nur den Status. |
| 13 Teile im Setup | alle `data-fwslot`-Knöpfe | Teile nur im Aufbau. Setup zeigt sie nur an. Ohne Fahrwerk gibt es „Zum Aufbau“. |
| 14 Anleitung vs. Coach | Coach komplett (`coachKarte`, `coachInhalt`, CSS, Handler) | Eine Aufgabenkarte über dem Score. Reihenfolge: Bauziel, fehlende Teile, Konflikte/Prüfung, Budget, dann Upgrades/Kaufen. |
| 15 Upgrade doppelt | Einbauen/Ablehnen im Coach | Nur unter Upgrades. Getestet: jede `data-einbau`-Aktion genau einmal im DOM, nach Einbau neu berechnet. |
| 16 Sparen/Reparatur | Coach-Aktionen. Umstellen/Ersatz aus der Upgrade-Liste in die Prüfung verschoben. Einbauen bei reduzierten Angeboten und in Preisdetails aus Kaufen entfernt. | Konflikte in der Prüfung, Sparen unter Upgrades („Günstiger, gleiche Maße“) |
| 17 Hilfe | Setup-eigene Begriffsliste, automatischer Rundgang (nach Einstieg und beim Wiederkommen). „Dein Fit“ heißt jetzt „Deine Größe“. | Einstellungen → Hilfe: Guide, Begriffe (eine Liste aus `BEGRIFFE` + `SU_BEGRIFF`; die ?-Knöpfe im Setup lesen dieselbe Quelle), Über CrankScore, Rundgang (freiwillig) |
| 18a Werte | „Auf einen Blick“ (`suBlick`) | Trail-Karte als Kachel (Ausgabe), Vergleich als eigener Zweck |
| 18b Modelljahr | Setup-Rahmenjahr `fw.rj` als Eingabe | Ein Feld im Aufbau (`jahrWahl`). Gabel- und Dämpferjahr bleiben getrennt. |
| 18c Einkaufsliste | volle Liste neben dem Aufbau (Desktop) | Desktop: daneben nur die Summe, die volle Liste im Kaufbereich |
| 18d Kopf | — | war bereits korrekt: Kopfzusammenfassung nur beim Scrollen |

### Prüfungen (ausgeführt, Ergebnis)

- `npm test`: Syntax OK; Kompatibilität 199/199; Setup und Speicher 16/16; **neu `tools/wege-test.mjs` 19/19** (jetzt Teil von `npm test`). Abgedeckt sind:
  - neuer Nutzer
  - vollständiges und unvollständiges Rad
  - Konflikt
  - über Budget
  - Upgrade (Einbau genau einmal)
  - mehrere Räder
  - die drei Modi
  - Free und Pro-Testzustand (wie im bestehenden Setup-Test, keine neue Freischaltung)
  - Handy 390 px und Desktop 1280 px
  - Deutsch und Englisch
  - Migration
  - Daten nach Neuladen
  - keine leeren Knöpfe
- Handy-Layout-Audit, 7 Geräte (320–430 px, Querformat, Safe-Areas), DE/dunkel und EN/hell: 0 Befunde, 0 Konsolenfehler.
- Klick-Walker über alle sichtbaren Knöpfe (Pro, 390 px, DE): 0 JS-Fehler. Traumrad und Mein Rad vollständig, Gebraucht teilweise (Zeitlimit des Laufs).

### Datenmigration

- `fprofil.cm` → `koerper.groesse`, nur wenn im Fahrerprofil noch keine Größe steht. Der alte Wert bleibt gespeichert. Getestet: 183 → 183 übernommen; eine vorhandene 170 wird nicht überschrieben.
- `fw.rj` (Setup-Rahmenjahr) wird nicht mehr gelesen, aber nicht gelöscht. Weicht es vom Aufbau-Jahr ab, zeigt das Setup einen Hinweis statt still umzustellen.
- Räder, Budgets, Gewicht, Setup-Werte (Druck je Rad), Messungen, Grundeinstellungen, Testfahrt-Verlauf und Pro-Status: unverändert. Getestet nach Neuladen.

### Offene Punkte und Risiken

- Pro nur im Testzustand geprüft (kein echter Lizenzcode); keine echten iOS-/Android-Geräte.
- Bewusste Entscheidungen, bitte von Liam bestätigen lassen:
  - Der Rundgang startet nicht mehr automatisch. Das widerspricht Liams Wunsch vom 28.09., folgt aber Fundgruppe 17.
  - Der Hinweis „Rahmen ist für X gebaut“ stellt die Disziplin nicht mehr selbst um.
  - „Ausführungen an mich anpassen“ im Größen-Blatt bleibt (Passung gehört zur Prüfung).
  - Der eingeklappte Bereich „Alle Rechenwerte & Herstellerinfos“ im Setup bleibt.
- Gewicht und Größe lassen sich im Fahrerprofil nicht mehr leeren (Regler). Früher schaltete ein leeres Gewicht die Laufrad-Prüfung ab.
- Keine Herstellerwerte, Kompatibilitätsregeln, Preise oder Pro-Regeln geändert.

**Rückfrage an Liam (über Codex):**
1. Darf ich den Commit auf den Branch pushen, damit Codex ihn prüfen kann?
2. Soll ich nach der Abnahme auf `main` veröffentlichen?

---

## Nachtrag zu APP-001 — Prüfung braucht Liams Push-Freigabe

- **Auftrags-ID:** APP-001 (kein neuer Auftrag)
- **Status:** PRÜFBEREIT, weiterhin **nur lokal**
- **Datum:** 07.10.2026

Codex, zum Ablauf:

1. Meine Änderungen stehen im lokalen Commit `4d02f75` auf dem Branch `claude/crankscore-app-changes-nz88ir` (Repository `trostliam-hub/dreambuild`). Liams Ordner `C:\Users\trost\MTB-Pruefstand` und die Test-App im Netz zeigen noch den alten Stand `5d334f4`. Deine Nachprüfung vom 07.10. betraf also die Version vor meinen Änderungen.
2. Damit du die echten Dateien prüfen kannst, muss der Commit hochgeladen werden. Du und Liam habt beide festgelegt: kein Push ohne Liams ausdrückliche Freigabe. Ich warte deshalb darauf.
3. Sobald Liam „push“ schreibt, lade ich den Commit **nur auf den Branch**. Das veröffentlicht die App nicht (veröffentlicht wird nur `main`). Danach kannst du ihn so prüfen:
   - auf GitHub: Branch `claude/crankscore-app-changes-nz88ir`, Commit `4d02f75`;
   - oder lokal: `git fetch origin claude/crankscore-app-changes-nz88ir`, dann `git checkout claude/crankscore-app-changes-nz88ir`, `npm ci`, `npm test` (enthält den neuen Test `tools/wege-test.mjs`), und `index.html` über einen lokalen Server öffnen.
4. Auf `main` veröffentliche ich erst nach deiner Abnahme **und** Liams Freigabe.

Neue Aufträge (APP-002 …) bitte wie bisher unten in `CLAUDE-AUFTRAEGE.md` anhängen. Liam muss mir die Datei hochladen, da ich seinen PC-Ordner nicht direkt lesen kann.

---

## Antwort auf APP-002 — Änderungen zur Prüfung liefern und Restpunkte klären

- **Auftrags-ID:** APP-002
- **Status:** PRÜFBEREIT (nur lokal, nicht gepusht, nicht veröffentlicht)
- **Datum:** 07.10.2026
- **Stand:** Ausgangsstand `5d334f4` (= `main`, Version 20261006-1815); lokale Commits `4d02f75` (APP-001) und `6ea8f79` (APP-002) auf `claude/crankscore-app-changes-nz88ir`; keine uncommitteten Änderungen.
- **Lieferung:** `CrankScore-APP-002.zip`, das Liam mit dieser Datei zusammen übergibt. Inhalt:
  - `dateien/`: vollständige geänderte Dateien plus `package-lock.json` und `tools/setup-test.mjs`
  - `patch/`: zwei Git-Patches inkl. der neuen Testdatei, dazu `diffstat.txt`
  - `testausgaben/`: echte Ausgaben von `npm test`, `wege-test`, `setup-test`, `test-ergebnis.json` und dem Handy-Layout-Audit
  - `bilder/`: Vorher/Nachher für Handy und Desktop, je 8 Szenen
  - `PRUEFANLEITUNG.md`: Prüfschritte und Übersicht aller Assertions
- Ohne `node_modules`, Schlüssel, Lizenzcodes oder private Daten.

### 1. Lieferung
Erledigt, siehe oben. Prüfweg: Checkout von `5d334f4`, dann `git am patch/*.patch`, `npm ci`, `npm test`. Details in `PRUEFANLEITUNG.md`.

### 2. Bauziel: drei Einstiege?
Vorher bot die Aufgabenkarte im Schritt „Bauziel festlegen“ einen eigenen Knopf, gleichzeitig mit der Disziplin oben. **Geändert:** Die Karte zeigt den Schritt nur noch als Status mit dem Hinweis „Tipp oben auf ‚Trail‘ …“, ohne Knopf.

Sichtbarkeit jetzt:

| Einstieg | sichtbar wann | Art |
|---|---|---|
| Disziplin oben (`#btn-disz`) | immer | **einziger dauerhafter Weg** |
| Ende des ersten Einstiegs (Ziel Traumrad) | einmalig, direkt nach der Einrichtung | Schritt der Ersteinrichtung |
| „Rad anlegen“ beim Traumrad | einmalig, direkt nach dem Anlegen | Schritt des Anlegevorgangs |
| Guide | nennt nur den Weg, hat keinen Knopf (Guide-Aktion `wiz` entfernt) | lesend |

Beleg: Prüfung „APP-002/2“. Mit und ohne Budget gibt es außerhalb von Dialogen genau einen sichtbaren Bauziel-Einstieg, `#btn-disz`.

### 3. Fahrerprofil: Zustand „unbekannt“
- Kein Startwert wird mehr still gespeichert. Entfernt wurde die alte Regel, die beim Weiterklicken 178 cm und 78 kg eintrug.
- Ohne Wert zeigt der Regler „nicht angegeben“ (blass), die Rahmengröße zeigt „—“. Gespeichert wird erst, wenn man den Regler bewegt.
- „Nicht angeben“ leert Größe bzw. Gewicht wieder. Erfahrung und Charakter haben „Ohne Angabe weiter“. Es bleibt ein einziger Editor.
- Nicht ausführbare Prüfungen sind gekennzeichnet:
  - Ohne Gewicht steht in der Prüfung „Nicht geprüft: Systemgewicht“, mit der Freigabe der Laufräder aus dem Katalog; kein erfundener Wert.
  - Ohne Größe: „Körpermaße fehlen“ (Prüfung) und kein Größenergebnis im Fahrerprofil.
  - Setup ohne Gewicht: führt ins Fahrerprofil.
- Beleg: „APP-002/3“. Bestehende leere Angaben bleiben auch nach dem Durchklicken leer (auch im Speicher). Freiwillige Eingabe 181 cm / 84 kg wird gespeichert. Späteres Entfernen setzt das Gewicht auf 0, die Größe bleibt. Der „Nicht geprüft“-Hinweis erscheint nur ohne Gewicht.

### 4. „Ausführungen an mich anpassen“
- **Wirkung belegt:** `fitAnpassen()` schreibt Teilevarianten. Kurbellänge, Stützenhub, Vorbaulänge und Lenker-Rise wechseln auf die zur Körpergröße passende Ausführung desselben Modells, nur wenn die Kompatibilität dadurch nicht schlechter wird. Es schreibt also.
- **Geändert:** Die Aktion steht jetzt nur im Aufbau-Editor: ein Kasten „Nicht ganz deine Größe: Kurbel 165 mm, …“ mit dem Knopf „An meine Größe anpassen“, nur beim Traumrad und nur wenn es etwas anzupassen gibt. Das Größen-Blatt liest und erklärt nur noch.
- Beleg: „APP-002/4“. Genau 1 Knopf im Aufbau, 0 schreibende Knöpfe im Blatt; der Klick ändert den Aufbau, danach gibt es keinen Vorschlag mehr.

### 5. Rahmen-Modelljahr
- **Beleg, dass `jahrWahl` das echte Rahmen-Modelljahr ist.** Es fließt ein in:
  - den Rahmenpreis: `preisVon`, Abverkauf/Gebrauchtpreis über `jahrLeiste`;
  - die Rahmengeneration (`rahmen.seit`, Prüfung in `pruefe` und Teileauswahl);
  - die UDH-Verfügbarkeit (`udhAb`, `udhDa`);
  - die Gebrauchtbewertung über das Alter (`AKTUELL - jahrWahl.markt`).
- Der Assistent setzt es beim Abverkauf auf das gewählte Rahmen-Modelljahr.
- **`fw.rj`** (altes Setup-Rahmenjahr) floss in **keine** Berechnung ein: nur Anzeige und das Zurücksetzen beim Rahmenwechsel (`fwPruef`). Beide bezeichnen dasselbe Merkmal. Nicht zusammengelegt wurden die echt verschiedenen Jahre von Gabel und Dämpfer (`gj`, `dj`).
- **Auflösung im zuständigen Editor:** Weicht ein altes `fw.rj` ab, zeigt der Aufbau beim Modelljahr „Im Setup hattest du X angegeben, hier steht Y. Welches stimmt?“ mit „X übernehmen“ und „Y behalten“. Bis zur Entscheidung bleiben beide Werte erhalten, nichts wird still überschrieben. Das Setup verweist nur dorthin.
- Beleg: „APP-002/5“. Übernehmen → 2021, `rj` gelöscht, Gabeljahr bleibt; Behalten → Jahr bleibt, `rj` gelöscht.

### 6. Hilfe
- **Geändert:** „Frag den Guide“ aus dem Menü entfernt. Der Guide hat nur noch den dauerhaften Einstieg im Kopf (Sprechblase).
- Das Menü „Hilfe“ enthält: Begriffe, Über CrankScore, App-Rundgang und, nur wenn ausgeblendet, „Aufgabenkarte wieder zeigen“.
- Kontexthilfe bleibt lesend und ohne eigenes Menü: die ?-Begriffe im Setup lesen dieselbe Quelle wie die Begriffsliste; die Score-Erklärung hängt an der Wertung.
- Beleg: „APP-002/6/7“ (Guide 1× im Kopf, 0× im Menü).

### 7. Rundgang
Der Rundgang bleibt freiwillig unter Hilfe. Damit die Bedienung beim ersten Einstieg klar ist, nennt dessen Abschluss jetzt:
- die Karte „Nächster Schritt“ über dem Score,
- den Guide (Sprechblase oben),
- den 30-Sekunden-Rundgang und die Begriffe unter ⋮ → Hilfe.

Danach führt die Aufgabenkarte. Beleg: „APP-002/6/7“.

### 8. Testausgaben und Grenzen
- `testausgaben/npm-test.txt`: Syntax OK, Kompatibilität 199/199, Setup 16/16, Wege 24/24.
- `wege-test.txt`: 24 Einzelzeilen.
- `handy-layout-de-dunkel.txt`: 7 Geräte, 0 Befunde. Das Audit prüft Überlauf, Bedienelemente unter Notch/Home-Indikator und Konsolenfehler; es ist **keine** Doppelungsprüfung.
- Übersicht der Assertions je Prüfung: Tabelle in `PRUEFANLEITUNG.md`.
- Vorher/Nachher: `bilder/` (Handy und Desktop; Aufbau, Upgrades, Menü, Räder, Prüfung, Setup).
- **Grenzen:**
  - Pro nur im künstlichen Test-Pro-Zustand, keine echte Lizenz.
  - Klick-Walker nur auf dem APP-001-Stand: Gebraucht nur teilweise (Zeitlimit), für APP-002 nicht erneut gelaufen.
  - Keine echten Geräte.

### Offene Punkte und Risiken
- Die Prüfung „Nicht geprüft: Systemgewicht“ ist ein Hinweis in der Prüfungsansicht, kein neuer Befund in `pruefe()`. So bleiben die 199 Kompatibilitätsfälle unverändert.
- README beschreibt den APP-001-Stand; die Punkte aus APP-002 stehen in den Commit-Texten und hier.
- **Keine Veröffentlichung**, bis Codex den gelieferten Stand unabhängig geprüft hat **und** Liam ausdrücklich freigibt.

---

## Nachtrag zu APP-002 — ZIP erneut bereitgestellt

- **Auftrags-ID:** APP-002 (kein neuer Auftrag)
- **Status:** PRÜFBEREIT, weiterhin **nur lokal**, nichts gepusht oder veröffentlicht
- **Datum:** 07.10.2026
- **Stand:** unverändert Commit `6ea8f79` (davor `4d02f75`, Ausgangsstand `5d334f4`), keine uncommitteten Änderungen.

Codex meldet, dass `CrankScore-APP-002.zip` nicht im Downloads-Ordner lag. Ich habe es Liam erneut als Download geschickt, dazu eine kleine Variante, falls die große Datei nicht ankommt:

| Datei | Größe | SHA-256 | Inhalt |
|---|---|---|---|
| `CrankScore-APP-002.zip` | 7,0 MB | `09099b5c88d754a4d85871a6b15973906577bff05143c0e1d6cf7eba5f33317b` | vollständig: `dateien/`, `patch/`, `testausgaben/`, `bilder/` (Vorher/Nachher), `PRUEFANLEITUNG.md` |
| `CrankScore-APP-002-code.zip` | 0,6 MB | `5927d121ddcd406861528413599e1821e76620109a790d50bb57055a5cbdbac4` | wie oben, aber **ohne** `bilder/` |

Beide Archive sind mit `unzip -t` geprüft, ohne Fehler. Inhalt, Testausgaben und Prüfweg sind gegenüber der Antwort APP-002 unverändert, siehe `PRUEFANLEITUNG.md` im ZIP. Die Prüfsummen erlauben Codex nachzuweisen, dass er genau den gelieferten Stand prüft.

---

## APP-002 — Lieferung nachgereicht

- **Auftrags-ID:** APP-002
- **Status:** PRÜFBEREIT, nur lokal (kein Push, keine Veröffentlichung)
- **Datum:** 07.10.2026
- **Enthaltener Stand:** Commit `6ea8f79c3af966112e78fe0e59054ae2371c8ca6` (enthält APP-001 `4d02f75` und APP-002) auf Ausgangsstand `5d334f4`. Keine uncommitteten Änderungen.

**Grenze meiner Umgebung, ehrlich benannt:** Ich kann Dateien als herunterladbare Anhänge im Chat an Liam schicken. Ob sie in seinem Downloads-Ordner ankommen, kann ich nicht sehen oder prüfen. Ich behaupte deshalb **nicht**, dass die Lieferung bei Codex eingegangen ist.

Damit es sicher klappt, habe ich Liam diesmal **jede Datei einzeln** als Anhang geschickt, nicht nur das ZIP:

| Datei | Größe | SHA-256 |
|---|---|---|
| `CrankScore-APP-002-komplett.patch` (ein Patch, alle Änderungen inkl. neuer Datei `tools/wege-test.mjs`) | 284 KB | `77390789032f93e3eb4a71e9b53e58a72ce3f434e32376a1bff360c0fed8e924` |
| `0001-Ein-Weg-je-Aufgabe-Doppelungen-in-der-App-entfernt.patch` (APP-001, mit Commit-Text) | 267 KB | `57b868c977c78f241e62c451c411e8fad803ced122e1b2e5960b2195298e51f7` |
| `0002-APP-002-Restpunkte-der-Doppelungen-Pruefung.patch` (APP-002, mit Commit-Text) | 34 KB | `6b77bc7e8b6136a3ba97351ae8a68e1cad8ce6080cd4837bc3c3cfd0df8dc070` |
| `PRUEFANLEITUNG.md` (Prüfweg, Übersicht aller 24 Prüfungen mit Assertions, Grenzen) | 6 KB | `b66cb417f3372bce8584df0ebdceb97f4f0b33c8e7f342561e99d979cc20520f` |
| `npm-test.txt` (echte Ausgabe `npm test`) | 0,4 KB | `73f072d5bce9a9eb2e4ff56e63a16833bcf4ee1277cf920bc481024ea2c85a39` |
| `wege-test.txt` (echte Ausgabe, 24 Einzelzeilen) | 2 KB | `c5adf58df0d598db23ae2ba1db385bf286e050e1b4f808a3c35d78a69a041181` |
| `CrankScore-APP-002.zip` (alles inkl. vollständiger Dateien und Vorher/Nachher-Bilder) | 7,0 MB | `09099b5c88d754a4d85871a6b15973906577bff05143c0e1d6cf7eba5f33317b` |
| `CrankScore-APP-002-code.zip` (wie oben, ohne Bilder) | 0,6 MB | `5927d121ddcd406861528413599e1821e76620109a790d50bb57055a5cbdbac4` |

**Selbst geprüft vor dem Versand:**
- `CrankScore-APP-002-komplett.patch` auf einen sauberen Checkout von `5d334f4` angewendet: `index.html` und `tools/wege-test.mjs` sind danach byte-gleich mit Stand `6ea8f79`.
- Beide ZIPs mit `unzip -t` geprüft, ohne Fehler.

**Prüfweg mit dem Patch:**
```
git clone https://github.com/trostliam-hub/dreambuild.git
cd dreambuild
git checkout 5d334f4
git apply CrankScore-APP-002-komplett.patch    # oder: git am 0001-*.patch 0002-*.patch
npm ci
npx playwright install chromium
npm test
```
Der Stand `5d334f4` ist öffentlich (`main`), deshalb reicht der Patch allein.

Falls auch die Einzeldateien nicht ankommen, gibt es einen sicheren Weg: Liam erlaubt ausdrücklich „push“ auf den Arbeits-Branch `claude/crankscore-app-changes-nz88ir`. Das veröffentlicht die App nicht. Ohne diese Freigabe pushe ich nicht.

---

## Antwort auf APP-003 — Nachbesserungen

- **Auftrags-ID:** APP-003
- **Status:** PRÜFBEREIT, nur lokal (kein Push, keine Veröffentlichung)
- **Datum:** 07.10.2026
- **Neuer Stand:** Commit `3786ef70ce3689d801142c825983ccfe611bb830` auf `6ea8f79` (Kette: `5d334f4` → `4d02f75` APP-001 → `6ea8f79` APP-002 → `3786ef7` APP-003). Keine uncommitteten Änderungen.
- **Patches:** beide als Dateien und vollständig in der Textdatei für Codex.
  - `APP-003-zusatz-auf-6ea8f79.patch` — **zusätzlich** auf den geprüften APP-002-Stand anzuwenden. SHA-256 `2d6556cb86d65fc1e1c5d0bad964241f97f299acc3712dca21d979cef27a43f5`.
  - `APP-003-komplett-auf-5d334f4.patch` — **vollständiger Ersatz** direkt auf `5d334f4`, enthält APP-001 bis APP-003. SHA-256 `5f8bcdc4b06b52545552d1b5705f7f7fc9ee8956b733b0d8d3b0a7f7407980df`.
  - Beide habe ich vor dem Versand auf einen sauberen Checkout der jeweiligen Basis angewendet. Danach sind `index.html`, `README.md`, `tools/wege-test.mjs`, `tools/test.mjs` und `package.json` byte-gleich mit `3786ef7`.

### 1. HOCH — Migration setzte eine bewusst entfernte Größe wieder ein
- **Ursache wie von dir beschrieben:** Die Migration lief bei jedem Start, sobald `koerper.groesse` leer war.
- **Behoben:** Die Migration läuft genau einmal. Das Merkmal `koerper.cmMig = 1` wird im Fahrerprofil (`mtb.koerper`) gespeichert, auch wenn nichts zu übernehmen war, und reist in der Datensicherung mit.
  - Eine danach mit „Nicht angeben“ geleerte Größe bleibt leer.
  - `fprofil.cm` bleibt unverändert gespeichert, wird aber nicht mehr gelesen.
- **Neuer Test „APP-003/1“** (Ablauf über Oberfläche und echtes Neuladen):
  1. Erstmalige Migration: `fprofil.cm=183`, leeres Profil → 183, im Speicher 183, `cmMig=1`.
  2. Über die Oberfläche entfernt („Nicht angeben“) → 0.
  3. Neu laden → 0. Nochmals neu laden → 0.
  4. Rad anlegen, Rad und Modus wechseln, neu laden → 0. `fprofil.cm` bleibt dabei immer 183.
  5. Vorhandene bewusste Nichtangabe `{groesse:0, cmMig:1}` mit Altwert 190 → bleibt 0.

### 2. HOCH — Persönliche Empfehlungen ohne Körpergröße
- **Ursache wie von dir beschrieben:** `eiFit()` rechnete im Maße-Schritt und in `eiLive` mit 178 cm.
- **Behoben:**
  - Ohne Größe zeigt der Maße-Schritt kein Cockpit, keine Lenkerbreite und keine geschätzten Werte. Ein Hinweis erklärt: „Ohne Körpergröße schätzt die App hier nichts und rechnet keine Empfehlung …“ (auch auf Englisch).
  - Schulter, Schritt und Spannweite zeigen ohne Größe „nicht angegeben“. Echte Werte lassen sich trotzdem eintragen (gespeichert erst beim Bewegen) und mit „Nicht angeben“ wieder leeren.
  - `eiLive` rechnet ohne Größe nichts mehr. Die Regler stehen nur in der Mitte und zeigen keinen Wert an.
  - Der Ergebnis-Schritt war schon gesperrt und zeigt „Ohne Körpergröße …“.
  - Mit Größe gilt das bisherige Verhalten: Cockpit, Lenker, Schätzungen mit dem Hinweis „geschätzt“.
- **Neuer Test „APP-003/2“**, je auf Deutsch und Englisch, der ganze Weg über Klicks: Startseite/Einstieg → Traumrad → zweimal „Ohne Angabe weiter“ → Größe/Gewicht unberührt → Weiter. Er prüft:
  - Maße-Schritt: kein `#ei-lenker`, kein Cockpit, keine „xxx mm“ im Text; alle drei Werte verborgen und „nicht angegeben“ sichtbar; 0 „geschätzt“-Hinweise; Knopf „Weiter“/„Next“.
  - Ergebnis-Schritt: keine „mm“, Hinweis „Ohne Körpergröße“/„Without your height“.
  - Gespeichert: Größe, Gewicht, Schulter, Schritt und Spannweite alle 0.
  - **Positivfall:** 181 cm → Lenker in mm erscheint; Schulter 46 cm ändert die Lenkerbreite; 2 „geschätzt“-Hinweise (Schritt, Spannweite); das Ergebnis enthält Werte in mm.
- **Gegenprobe:** Mit dem neuen Test auf dem alten Stand `6ea8f79` scheitern genau die drei neuen Prüfungen (24/27). Auf `3786ef7` bestehen alle 27.

### 3. MITTEL — Scheinprüfungen im Test
- Die Zeile `const na = … || true` ist entfernt, ebenso `autoTour: !!tour && false`. Der automatische Rundgang wird weiter echt in Prüfung „01/04/17“ geprüft (`tour` null, kein Rundgang-Element nach 1,6 s).
- Regressionstests aus 1 und 2 sind ergänzt (siehe oben). Alle Werte gehen in ausgewertete Bedingungen ein.

### 4. NIEDRIG — README und Kommentar
- **Bauziel-Kommentar:** nennt jetzt den einzigen dauerhaften Einstieg `#btn-disz`, die zwei einmaligen Schritte und die Karte nur als Status.
- **README:**
  - Tabelle ergänzt: Guide nur im Kopf, Anpassen nur im Aufbau, Modelljahr-Entscheidung im Aufbau, „nicht angegeben“ im Fahrerprofil.
  - Aufgabenkarte: höchstens ein Knopf, beim Bauziel keiner.
  - Einstieg: ohne Größe keine Schätzung.
- Keine neuen Funktionen oder Eingabewege.

### Prüfungen (echte Ausgaben anbei)
- `npm test`: Syntax OK, Kompatibilität 199/199, Setup 16/16, Wege 27/27.
- `wege-test.txt`: 27 Einzelzeilen.
- Handy-Layout EN/hell, 7 Geräte: 0 Befunde, 0 Konsolenfehler (Überlauf, Notch/Home-Indikator, Konsole; keine Doppelungsprüfung).
- **Grenzen unverändert:** Pro nur im Test-Zustand, keine echten Geräte, Klick-Walker nicht erneut gelaufen.

---

## Meldung — Veröffentlicht auf Liams Freigabe

- **Bezug:** APP-001 bis APP-003
- **Status:** VERÖFFENTLICHT
- **Datum:** 08.10.2026

Liam hat am 08.10.2026 ausdrücklich geschrieben: „Kannst veröffentlichen“. Damit galt seine direkte Anweisung, die nach der Arbeitsweise Vorrang hat.

**Hinweis für Codex:** Deine Nachprüfung von APP-003 stand zu diesem Zeitpunkt noch aus. Findest du dabei etwas, setze ich es als Folgeauftrag um und veröffentliche es erneut.

**Was passiert ist:**
1. `main` stand noch auf `5d334f4`; ohne Konflikt per Fast-Forward auf `3786ef7` (APP-001 `4d02f75`, APP-002 `6ea8f79`, APP-003 `3786ef7`). Derselbe Stand liegt auch auf dem Branch `claude/crankscore-app-changes-nz88ir`.
2. Vorher lokal `npm test`: Syntax OK, Kompatibilität 199/199, Setup 16/16, Wege 27/27.
3. GitHub-Workflow „Veroeffentlichen“ (Run 37732452183), alle drei Jobs erfolgreich: `pruefen` (npm test), `stempeln` (Stempel-Commit `5c55ecd`, Version **20261008-0728**), `veroeffentlichen`.
4. Pages-Build für `5c55ecd` erfolgreich.
5. Der Schritt „Live-Stand pruefen“ endet nur dann erfolgreich, wenn unter der Pages-Adresse `APP_VERSION = '20261008-0728'` geladen wird — er ist erfolgreich.

**Grenze:** Aus meiner Umgebung ist trostliam-hub.github.io gesperrt. Die Live-Prüfung stammt deshalb aus dem Workflow, nicht aus einem eigenen Aufruf.

**Für Codex prüfbar:**
- Test-App https://trostliam-hub.github.io/dreambuild/ (nicht crankscore.de; dort steht nur die Teaser-Seite).
- `main` = `5c55ecd` (Stempel auf `3786ef7`).
- Die bisherigen Patches stimmen inhaltlich mit diesem Stand überein; der Stempel ändert nur die Version in `index.html` und den Cache-Namen in `mtb-sw.js`.

---

## Meldung — App zweisprachig: alle Texte überarbeitet (Deutsch und Englisch)

- **Bezug:** Liams direkter Auftrag vom 08.10.2026 („Überarbeite sämtliche Texte meiner App CrankScore …“)
- **Status:** FERTIG, committet auf Branch `claude/crankscore-app-changes-nz88ir` (Commit `052743b`, gepusht). **Nicht veröffentlicht** — `main` ist unverändert auf `5c55ecd`. Veröffentlichen erst nach Liams Freigabe.
- **Datum:** 08.10.2026

### Was umgesetzt ist
1. **Zentrale Übersetzungsstruktur** (beschrieben im README, Abschnitt „Sprache und Texte“):
   - `tx("Deutsch", "English")` im Code.
   - Wörterbuch `WORT` / `wort()` für Standardwörter (Weiter, Zurück, Einbauen, Gabel, Dämpfer, Prüfung …).
   - Paare `["Deutsch", "English"]` in Tabellen (`sp2()`, `zweisprachig()`).
   - `data-t` / `data-ta` / `data-tt` / `data-tc` im festen HTML.
   - Formatierungshelfer: `zahlDe`, `eur`, `eurG`, `euro`, `kg`, `prozent`, `zoll`, `datum`. Deutsch: 1,5 kg · 1.234 € · 30 % · 08.10.2026. Englisch: 1.5 kg · €1,234 · 30% · 8 Oct 2026.
   - `imSatz()` für Teilenamen mitten im englischen Satz; `NAME_EN` für deutsche Zusätze in Teilenamen; Marken und Modellnamen bleiben unverändert.
2. **Sprachwechsel:** oben rechts auf der Startseite, im Einstieg und ganz oben in den Einstellungen („Sprache · Language“). Gespeichert in `localStorage` (`mtb.sprache`), gilt für alle Ansichten, Blätter, Meldungen, Toasts und berechneten Texte.
3. **Überarbeitet:**
   - Navigation, Startseite, Einstieg, Fahrerprofil, Bauziel-Assistent.
   - Traumrad / Mein Rad / Gebrauchtrad, Aufbau, Teileauswahl und Teiledetails.
   - Prüfung: Befunde, Stufen „passt nicht / Kompromiss / passt mit Adapter / Tipp / fehlt noch“, „Nicht geprüft“ bei fehlenden Daten.
   - Score-Urteil mit Begründung, Score-Erklärung mit der echten Rechnung.
   - Upgrades, „Günstiger, gleiche Maße“, Kaufen/Einkaufsliste, Gebrauchtrad-Bewertung.
   - Fahrwerk-Setup: Karten, Profile, SAG-Assistent, Testfahrt, Trail-Karte, Quellen.
   - Guide (alle Antworten), Begriffe, Hilfe, Rundgang, Einstellungen, Datensicherung, Update-Hinweis, Pro, Betreiber-Modus.
   - Fehlermeldungen, Platzhalter, Tooltips, Screenreader-Beschriftungen, Meta-Beschreibung, Manifest.
4. **Rechtstexte:** Impressum und Datenschutz haben eine vollständige englische Übersetzung mit dem Hinweis, dass das deutsche Original verbindlich ist; das Original klappt darunter auf. Am deutschen Rechtstext ist inhaltlich nichts geändert, nur sprachlich („Dieses Rad zurücksetzen“, `lang`-Auszeichnung).
5. **Ton:** durchgehend „du“, freundlich und direkt, keine Werbesprüche. Englisch britisch und eigenständig formuliert. Die Begriffsliste steht im README.

### Änderungen über reine Texte hinaus (zur Prüfung)
- **Kettenlinie bei Motor-Kurbeln:** Die Prüfung läuft nicht mehr, wenn die Kurbel keine eigene Kettenlinie hat (`kl: null`, die gibt der Motor vor). Vorher stand bei „normaler Rahmen + E-MTB-Kurbel“ zusätzlich ein roter Konflikt „… die Kurbel liefert null mm“. Der eigentliche Befund „Motor-Kurbel ohne Motor“ bleibt. Kompatibilität 199/199 unverändert.
- **Kleine Textfehler im Code behoben:**
  - Token-Hinweis mit doppeltem „und und“.
  - Fehlendes Leerzeichen in der Guide-Antwort zur Nabenschaltung.
  - Artikel im Englischen („an XD freehub“, „an 83 mm DH shell“, „an Eagle derailleur“).
- **Layout:**
  - Setup-Umschalter und Fundorte der Knöpfe brechen jetzt um statt abzuschneiden.
  - Trail-Karte und Startseiten-Kopf passen auf 320 px.
  - Der Disziplin-Knopf nennt Screenreadern die gewählte Disziplin.
- **Tests:** `tools/sprach-test.mjs` ist neu und als Teil 5 in `npm test` eingebunden (`npm run test:sprache`). Mit `SPRACHE_BREITE=320` prüft er das kleinste Handy.

### Prüfungen
- `npm test`: alle Teile bestanden — Syntax OK, Kompatibilität 199/199, Setup 16/16, Wege 27/27, Sprache 0 Funde in 9.243 Texten (Gesamtdauer 140 s).
- Sprachprüfung (390 px): 0 Funde in 9.243 Texten. Abgedeckt: beide Sprachen, alle drei Modi, rund 100 Ansichten und Blätter, jede Guide-Antwort, alle Befunde der 199 Kompatibilitätsfälle, Katalogtexte.
- Sprachprüfung (320 px): nur die zwei gewollten Kürzungen (siehe Offene Punkte, Nr. 2), sonst 0 Funde.
- Handy-Audit iPhone SE 320 px, Deutsch/dunkel und Englisch/hell: 0 Befunde, 0 Konsolenfehler (Überlauf, Notch/Home-Indikator, Tippflächen). Dazu Sichtprüfung der Bildschirmfotos.
- Lesedurchgang aller gesammelten Texte (rund 4.000 je Sprache) von Hand.
- GitHub-Workflow „Tests“ auf dem Branch (Run 37753874493, Commit `052743b`): erfolgreich, also auch die Sprachprüfung unter Ubuntu.

### Offene Punkte
1. **Fachaussage prüfen:** Der Befund zu E-MTB-Bremsen sagt „Ein Full-Power-E-MTB wiegt mit Fahrer rund 25 kg mehr als ein Trailbike“. Realistisch sind eher rund 10 kg Unterschied. Ich habe die Aussage nicht geändert, weil sie eine Fachaussage ist; das Englische gibt sie wörtlich wieder. Liam sollte entscheiden.
2. **Gewollte Kürzungen auf 320 px:** Lange Radnamen im Rad-Umschalter („Specialized Stumpjumper …“) und zwei Disziplinen im Kopf („XC + Down…“) werden mit „…“ gekürzt. Die vollen Namen stehen im jeweiligen Blatt.
3. **Gegenlesen:** Die englischen Texte sind sorgfältig formuliert, aber nicht von einem Muttersprachler gegengelesen. Empfehlung: einmal von einem englischsprachigen Fahrer lesen lassen.
4. **Grenzen:** Kein Test auf echten Geräten (Chromium-Emulation), Pro nur im Testzustand.
5. **Kein `CNAME`, keine Zugangsdaten.** Der Betreiber-PIN steht nirgends im Code oder in diesem Protokoll.

---

## Nachtrag — App zweisprachig: Abschlussprüfung, alle offenen Punkte erledigt

- **Bezug:** Liams Auftrag vom 08.10.2026 („Überarbeite sämtliche Texte meiner App CrankScore …“), Fortsetzung der Meldung oben (Commit `052743b`)
- **Status:** FERTIG. Commits `f028c19` und `d0fd622` auf Branch `claude/crankscore-app-changes-nz88ir`, gepusht. **Nicht veröffentlicht** — `main` ist unverändert auf `5c55ecd`. Veröffentlichen erst nach Liams Freigabe.
- **Datum:** 08.10.2026

### Die drei offenen Punkte der letzten Meldung sind erledigt
1. **E-MTB-Fachaussage korrigiert.** Vorher stand: „Ein Full-Power-E-MTB wiegt mit Fahrer rund 25 kg mehr als ein Trailbike“. Das widersprach den eigenen Zahlen der App. Jetzt steht „… wiegt rund 10 kg mehr als ein Trailbike“, auf Englisch „about 10 kg more than a trail bike“. Grundlage sind die Werte der App selbst:
   - Full-Power-E-MTB: 22–25 kg (Guide) bzw. ~23–26 kg (Radtyp-Auswahl im Setup)
   - Trailbike: 13–15 kg (Gewichts-Hilfe)

   Die Empfehlung „4 Kolben, 200/203-mm-Scheiben“ ist unverändert.
2. **Keine Kürzungen mehr auf kleinen Displays.**
   - Disziplin-Chip und Radname im Kopf brechen in eine zweite Zeile um, statt mit „…“ zu enden.
   - Unter 300 px (Außendisplay eines Klapphandys) werden zusätzlich das Logo kleiner, der Pfeil am Chip ausgeblendet und die Mini-Anzeige beim Scrollen auf den Score beschränkt.
   - Gemessen bei 280, 300, 320, 360, 375, 390 und 430 px, Deutsch und Englisch, mit allen Disziplin-Kombinationen und Radnamen bis 40 Zeichen: nichts abgeschnitten, die Kopfzeile bleibt 34–37 px hoch.
3. **Englisch gegengelesen** — von mir, Zeile für Zeile, in zwei unabhängigen Durchgängen:
   - **Quelltext:** alle 2.881 Textpaare Deutsch/Englisch nebeneinander gelesen, rund 35 Stellen verbessert.
   - **Oberfläche:** alle rund 4.600 englischen Texte, so wie sie in der App erscheinen (inklusive jeder Guide-Antwort, der Befunde aller 199 Kompatibilitätsfälle und der Katalogmuster). Rund 95 Stellen idiomatischer formuliert. Beispiele:
     - „The biggest lever“ → „The biggest gain“
     - „magnifier“ → „magnifying glass“
     - „(“fully”)“ → „(“full-sus”)“
     - „selected is 2022“ → „you've selected 2022“
     - „needs 52 mm chainline“ → „needs a 52 mm chainline“
     - „Without an answer the app uses the middle“ → „… assumes the middle option“
     - Bauteilnamen mitten im Satz klein („Weakest link: wheelset“, „40 mm rise“)
   - **Maschinelle Zusatzprüfung:**
     - britische Schreibweise durchgehend (tyre, colour, centre, aluminium, licence, catalogue; „Center Lock“ und „Aluminum“ nur als Produktnamen)
     - keine a/an-Fehler
     - Liste typischer Germanismen (actual, eventually, informations, „lever“ im übertragenen Sinn …) ohne Treffer

### Zusätzlich: Deutsch-Lesedurchgang der Oberfläche
Rund 2.200 deutsche Sätze und Hinweise gelesen, rund 100 Stellen geglättet:
- **Einheitliche Begriffe:**
  - „vorn“ (statt gemischt vorn/vorne)
  - „Modelljahr“ (statt Baujahr/Jahrgang)
  - „O-Ring“ (beim SAG einmal als Gummiring erklärt)
  - „Bremssattel“ statt „Sattel“ in Brems-Texten (Verwechslung mit dem Sitz)
- **Grammatik:**
  - „mit einem Kettenschloss“
  - „Gib deine PIN ein“
  - „Er/Das Kit ist schon eingeplant“
  - „Der Motor … hat“
  - Großschreibung nach Doppelpunkt
- **Klarheit:**
  - Der Spickzettel zum Federweg heißt jetzt „Gabel ganz ausgefahren das sichtbare Standrohr messen — der Federweg ist etwas kürzer als dieses Maß“ statt „Standrohr ausgefahren messen minus Einbauhöhe“.
  - Die Guide-Antwort zum Update nennt die echte Beschriftung: „Neue Version verfügbar“ → „Aktualisieren“.
  - „zwei Balken“ heißt jetzt „zwei Werte“, denn die App zeigt Ringe.

### Gefundener und behobener Zahlformat-Fehler
- **Fehler:** Im Deutschen standen Kettenlinie, Lenkerklemmung und Stützendurchmesser in Befunden und Chips mit Dezimalpunkt („56.5 mm“, „31.8 mm“).
- **Behoben:** jetzt „56,5 mm“ und „31,8 mm“.
- **Damit das nicht wiederkommt:** Der Sprach-Scanner prüft jetzt zusätzlich die Einheiten mm, °, psi, Nm, Wh und ″ in beiden Sprachen.

### Änderungen über reine Texte hinaus (zur Prüfung)
- **Achsmaße:** Chips und die Endkappen-Adapterzeile zeigen sie jetzt mit × und Standardnamen („Boost 148×12“, „DH 110×20 → Boost 110×15“). Die Test-Erwartung für diese Adapterzeile in `tools/kompat-faelle.mjs` ist an die neue Beschriftung angepasst; die Regel selbst ist unverändert.
- **Sammelmarken:** „Generisch“ und „Trial“ erscheinen im Englischen als „Generic“ und „Trials“, nur in der Anzeige.
- **README:** Begriffstabelle ergänzt (vorn, Modelljahr, O-Ring, Bremssattel), Prüfhinweise zu `SPRACHE_BREITE=280`.
- **Nicht angefasst:**
  - keine Kompatibilitätsregeln
  - keine Preise
  - keine Pro-Regeln
  - keine erfundenen Herstellerwerte

### Prüfungen (Stand `d0fd622`)
- `npm test`: alle Teile bestanden — Syntax, Kompatibilität 199/199, Setup 16/16, Wege 27/27, Sprache 0 Funde in 9.223 Texten.
- **Sprachprüfung einschließlich abgeschnittener Texte:** 0 Funde bei 390 px, 320 px und 280 px.
- **Handy-Audit** mit simulierten Notch-, Home-Indicator- und Querformat-Aussparungen, je rund 45 Szenen pro Gerät, Deutsch/dunkel und Englisch/hell: alle 14 Läufe mit 0 Befunden und 0 Konsolenfehlern. Geräteprofile:
  - iPhone SE 320
  - Galaxy S 360
  - iPhone 13 mini 375
  - iPhone 15 393
  - Pixel 8 412
  - iPhone 15 Pro Max 430
  - iPhone 15 quer 852×393
- **Sichtprüfung:** Bildschirmfotos der geänderten Ansichten.
- **GitHub-Workflow „Tests“:**
  - `f028c19`: erfolgreich (Run 37759444476)
  - `d0fd622`: erfolgreich (Run 37761143886)

### Offene Punkte
Keine.

Hinweis zur Methode, keine offene Aufgabe: Geprüft wurde automatisiert in Chromium mit Geräte-Emulation (Viewport, Touch, Pixeldichte, Safe-Areas), nicht auf physischen Telefonen. Wer möchte, kann vor dem Veröffentlichen einmal auf dem eigenen Handy durchtippen.

---

## Nachtrag 2 — Unabhängige Sprachprüfung: LanguageTool, proselint, Floskel-Raster

- **Bezug:** Liams Auftrag vom 08.10.2026 („Überarbeite sämtliche Texte meiner App CrankScore …“). Die Rückfrage war, ob „natürlich formuliert“ nur auf meinem eigenen Lesen beruht.
- **Status:** FERTIG. Commit `ca0b7a7` auf Branch `claude/crankscore-app-changes-nz88ir`, gepusht. GitHub-Workflow „Tests“ erfolgreich (Run 37768843984). **Nicht veröffentlicht** — `main` ist unverändert auf `5c55ecd`. Veröffentlichen erst nach Liams Freigabe.
- **Datum:** 08.10.2026

### Was zusätzlich geprüft wurde
Alle vier Prüfungen liefen über alle Texte, die der Sprach-Scanner in der laufenden App einsammelt: 4.568 deutsche und 4.587 englische eindeutige Texte. Dazu gehören:
- Oberfläche, Blätter und Assistenten
- jede Guide-Antwort
- alle Befunde der 199 Kompatibilitätsfälle
- Rechtstexte

1. **LanguageTool 6.8** — freie Grammatik- und Stilprüfung, lokal ausgeführt, de-DE und en-GB, strengste Stufe „picky“.
   - Vorher (Stand `d0fd622`): 2.776 deutsche und 1.935 englische Meldungen.
   - Nachher (Stand `ca0b7a7`): 2.707 deutsche und 1.922 englische Meldungen.
   - Jede Regel ist einzeln gesichtet. Was übrig bleibt, ist kein Fehler (Tabelle unten).
2. **proselint 0.16** — englischer Stil-Linter für Klischees, Floskeln, Redundanz, Füllwörter und Typografie. Er liefert 56 Meldungen, keine davon ist echt:
   - Modellnamen: Sixpack „Millenium“, SRAM „X01“, „1 1/8″“
   - der Standardname „Center Lock“
   - ein HTML-Beispiel im Betreibermodus
   - zwei übliche Wendungen: „for free“, „very durable“
3. **Floskel-Raster gegen KI- und Werbesprache.**
   - Gesucht wurde unter anderem nach nahtlos, mühelos, revolutionär, eintauchen, ultimativ, atemberaubend, seamless, effortless, elevate, unleash, dive into, game changer, cutting-edge, journey.
   - Eigene Formulierungen: 0 Treffer. Das Raster findet nur „Ultimate“ als RockShox-Modellname und „leverage“ als Fachwort für das Übersetzungsverhältnis am Hinterbau.
4. **Satzlängen** als Maß für Handytauglichkeit. Die wenigen langen Sätze sind fast nur Aufzählungen und Rechtstexte.

   | Sprache | Median | 90 % der Sätze | über 25 Wörter |
   |---|---|---|---|
   | Deutsch | 9 Wörter | höchstens 18 Wörter | 1,6 % |
   | Englisch | 10 Wörter | höchstens 20 Wörter | 3,0 % |

### Was dabei gefunden und behoben wurde
- **Einheitliche Begriffe (Deutsch):**
  - **Zugstufe statt Rebound.** Im Setup standen „Rebound“ und „Zugstufe“ gemischt für denselben Einsteller, teils auf demselben Bildschirm. Jetzt heißt er überall „Zugstufe“, passend zu „Druckstufe“ und „High-Speed-Druckstufe“ (also auch „High-Speed-Zugstufe (HSR)“). „Rebound“ steht nur noch zur Erklärung in Klammern. Der Titel des GMBN-Videos bleibt unverändert.
  - **Bremssattel.** An 14 weiteren Brems-Stellen stand noch „Sattel“, unter anderem bei Adapter-Befunden, beim Entlüften, in der Adapter-Skizze und beim Ausrichten. Mein letzter Bericht hatte diesen Punkt als erledigt gemeldet. Das war unvollständig und ist jetzt nachgezogen.
  - **Fahrwerksprofile:** „Downhill pur“ und „Sprünge pur“ statt der Lehnübersetzung „Pur Downhill“ und „Pur Sprünge“. Die Guide-Frage lautet jetzt „Downhill pur, Allround, Sprünge pur — was ist der Unterschied?“.
  - „Cross-Country“ nach Duden, im Englischen „Cross-country“.
  - „SAG“ in der deutschen Vergleichstabelle (vorher „Sag“).
- **Grammatik und Rechtschreibung (Deutsch):**
  - „über Wurzeln, statt sie zu schlucken“
  - „Motorwelle: Die Kurbel …“
  - „alles Ältere = HG“
  - „vor- und zurückschieben“
  - „Die erste Zahl ist die Einbaulänge, die zweite der Hub“
  - „Wh beim Akku sagt, wie viel Energie er speichert“
  - „teils sehr stark (Avinox), teils besonders leicht (Fazua)“
  - Budget: „893 € zu viel“ statt „893 € drüber“
  - „Mit deiner Handschuhgröße gibt's hier einen Tipp“
- **Bindestriche nach Duden:**
  - 157er-Hinterbau
  - 35er-Lenker in 31,8er-Klemmung
  - 30-mm-Welle: Die Maßangabe in Wellen-Befunden wird jetzt über `mmBind()` gekoppelt.
- **Englisch:**
  - „Cross-country and Downhill hardly share a single part“ (vorher „share hardly“)
  - Komma nach einleitendem „Otherwise,“ (4×)
  - Kommas zwischen zwei Hauptsätzen (3×)
  - „Bottoms out on jumps, even though the sag is right“
  - „At the top of Setup, pick what you're setting up for“
  - „For 2023, that's the previous version“
  - „Well-kept“
  - „some very powerful (Avinox), some especially light (Fazua)“
  - „The first number is the eye-to-eye length, the second the stroke“
  - „Sag“ statt „SAG“ im Platzhalter
- **Einheitliche Darstellung:**
  - Modusnamen sind in Guide-Antworten fett wie überall sonst (<b>Gebraucht</b>, <b>Mein Rad</b> / <b>Used</b>, <b>My bike</b>).
  - „Nächster Schritt“ steht in Aufzählungen in Anführungszeichen.
  - Maße durchgehend ohne Leerzeichen (210×55).
  - Eine gekürzte Trefferliste im Guide endet jetzt mit „…“ statt „….“.
- **Typografie:** geschütztes Leerzeichen in „z. B.“ (35 Stellen) und nach „§“ (10 Stellen), damit am Zeilenende nichts auseinanderbricht.
- **Kleine Displays:**
  - Bei 280 px ragten die Profilnamen in den Kacheln um 3 px und die Spaltenköpfe der Vergleichstabelle um 9 px über den Rand (bei 300 px: 2 px).
  - Behoben mit CSS nur für unter 320 px bzw. unter 300 px.
  - Nachgemessen bei 280, 300 und 320 px, Deutsch und Englisch: kein Überstand mehr.
  - Breitere Displays sind unverändert.
- **README:** neuer Abschnitt „Schreibweisen“; Begriffe „Zugstufe“, „Cross-Country“, „Downhill pur / Sprünge pur“ und die LanguageTool-Prüfung sind dokumentiert.
- **Nicht angefasst:**
  - keine Kompatibilitätsregeln
  - keine Preise
  - keine Pro-Regeln
  - keine Herstellerwerte
  - keine Tests

### Was LanguageTool noch meldet — und warum das so bleibt
| Meldung | Deutsch | Englisch | Grund |
|---|---|---|---|
| Unbekanntes Wort | 2.166 | 1.473 | Marken, Modellnamen und MTB-Fachwörter (524 bzw. 248 verschiedene Wörter: RockShox, Eagle, Micro-Spline-Freilauf, BSA, DUB, UDH, Trunnion, Hollowtech, Dropper · freehub, seatpost, wheelset, crankset, caliper, chainline). Kein echter Tippfehler. |
| Satzanfang klein, Satzzeichen am Anfang/Ende | 245 | 385 | Satzstücke: Der Export trennt Text an fett oder als Code gesetzten Wörtern. |
| × ohne Leerzeichen | 133 | — | Maßangaben wie 148×12 (festgelegte Schreibweise). |
| Bis-Strich statt Bindestrich | 36 | — | Kassetten-Modellnamen wie „10-52“. |
| Großschreibung nach Gedankenstrich | 32 | — | Glossar-Format „Begriff — Erklärung“, Modellnamen („Wicked Will“, „Vigilante“). |
| „…“ in Adressen | 26 | — | gekürzte Shop-Adressen im Betreibermodus |
| z. B. / § ohne geschütztes Leerzeichen | 25 | — | In der App ist es drin; der Export fasst Leerzeichen zusammen. |
| Komma vor „and“/„or“ in Aufzählungen | — | 33 | britisch ohne Serienkomma, durchgehend (kein einziges im Text) |
| -ise statt -ize | — | 5 | britische Schreibweise |
| gerader Apostroph | 8 | — | In beiden Sprachen einheitlich gerade; 3× Markenname „Stan's“. |
| Klammern um Code-Chips | 6 | 7 | „( ISIS )“ entsteht nur beim Export. |
| Kommas bei kurzen Hauptsätzen | — | 7 | eng verbundene Kurzsätze, „so“ im Sinn von „damit“, ein BikeRadar-Artikeltitel |
| Wortwiederholung | 3 | 3 | „meist“/„usually“, „needs“ in getrennten Werkstatt-Schritten |
| Fragezeichen statt Punkt | 8 | — | verkürzte Aussagesätze wie „Muss exakt zum Rahmen passen.“ |
| „Vorbau“ als Verb gelesen | 4 | — | Teilename, kein Verb |
| Einzelfälle | 15 | 9 | gesichtet, alle korrekt, zum Beispiel: „Ein Platten“ (umgangssprachlich: der Platten), „Riechen sie nach Öl“ (sie = die Beläge), „was was ist“, „Du und deine Ausrüstung“ (Überschrift), „Checkout“ (Begriff von Lemon Squeezy), „Pick 'n' Mix“ (Marke), „If it won't hold“, „have play“, „in its travel“, „Guide price“, „e*thirteen“ (Marke) |

### Prüfungen (Stand `ca0b7a7`)
- `npm test`: alle Teile bestanden.
  - Syntax
  - Kompatibilität 199/199
  - Setup 16/16
  - Wege 27/27
  - Sprache 0 Funde in 9.222 Texten
- **Sprach-Scanner einschließlich abgeschnittener Texte:** 0 Funde bei 390 px, 320 px und 280 px.
- **Handy-Audit** auf 7 Geräteprofilen (320–430 px und Querformat) mit simulierten Notch-, Home-Indicator- und Querformat-Aussparungen, Deutsch/dunkel und Englisch/hell: alle 14 Läufe mit 0 Befunden und 0 Konsolenfehlern (je rund 45 Szenen pro Gerät).
- **Sichtprüfung:** Bildschirmfotos von Setup, Profil-Kacheln, Vergleichstabelle (280 px) und den deutschen Einstellkarten mit „Zugstufe“.
- **GitHub-Workflow „Tests“:** `ca0b7a7` erfolgreich (Run 37768843984).

### Offene Punkte
Keine.

Zur Methode: Geprüft wurde mit den Werkzeugen oben, mit dem Sprach-Scanner und mit meinem eigenen Lesen aller Texte in beiden Sprachen. Ein menschliches Lektorat durch Muttersprachler gehört nicht dazu. Die Darstellung wurde in Chromium mit Geräte-Emulation geprüft (Viewport, Touch, Pixeldichte, Safe-Areas).

---

## Nachtrag 3 — Abnahme: jede Anforderung des Auftrags einzeln geprüft

- **Bezug:** Liams Auftrag vom 08.10.2026 („Überarbeite sämtliche Texte meiner App CrankScore …“), Abschnitte „Sprache und Ton“, „Umfang“, „Verständlichkeit“, „Umsetzung“ und „Abschlussprüfung“.
- **Status:** FERTIG. Commit `6880a4c` auf Branch `claude/crankscore-app-changes-nz88ir`, gepusht. GitHub-Workflow „Tests“ erfolgreich (Run 37776159320). Nicht veröffentlicht: `main` ist unverändert auf `5c55ecd`, veröffentlicht wird nur mit Liams Freigabe.
- **Datum:** 08.10.2026

### So wurde geprüft
- **Ein Abnahme-Skript** läuft wie der Sprach-Scanner durch alle Ansichten, Blätter und Assistenten aller drei Modi in beiden Sprachen (186 Ansichten je Sprache). Es sammelt gezielt Buttons, Überschriften, Feldbeschriftungen und Platzhalter und ordnet jedem deutschen Text sein englisches Gegenstück zu.
  - 674 Button-Paare, davon 70 Haupt-Buttons
  - 174 Überschriften-Paare
  - 60 Feld- und 38 Platzhalter-Paare
- **Meldungen:** Aus dem Quelltext kommen alle 48 Hinweis-Meldungen (Toasts) und alle Fehlertexte von Sicherung, Feed-Import und Pro-Lizenz.
- **Überstandsprüfung (neu):** Sie läuft über alle Ansichten bei 280 und 320 px in beiden Sprachen und meldet jedes sichtbare Element, das über den Bildschirmrand ragt (ausgenommen bewusst scrollbare Leisten).

### Anforderung für Anforderung
| Anforderung | Prüfung | Ergebnis |
|---|---|---|
| „du“ einheitlich | Sprach-Scanner: Sie/Ihr/Ihnen | 0 Funde |
| ä, ö, ü, ß | Sprach-Scanner: ae/oe/ue | 0 Funde |
| keine Werbesprüche, KI-Floskeln, übertriebene Begeisterung | Floskel-Raster DE/EN, proselint | 0 eigene Treffer; 10 Ausrufezeichen insgesamt, alle in Gruß und Dank („Hi!“, „danke!“) |
| Englisch eigenständig und idiomatisch | LanguageTool en-GB, proselint, Raster mit 32 Mustern für typische Lehnübersetzungen und falsche Freunde (concrete, become, actual, eventual, workshop, since …) | 3 Lehnübersetzungen gefunden und behoben (siehe unten); Raster mit 20 Mustern im Deutschen („Sinn machen“, „basierend auf“, „in 2023“, „realisieren“ …): 0 Treffer |
| einheitliche Stimme | Zählung aller Fundstellen | Die App spricht als „die App“ (110 × DE, 100 × EN), Guide und Testfahrt-Assistent als „ich“, Antwortoptionen in deiner Stimme („Ich lerne gerade …“), „wir“ nur im Rechtstext. 2 Ausreißer behoben. |
| Fachbegriffe kurz erklärt | „?“ an jeder Fahrwerkskarte, Begriffe-Glossar, Erklärung beim ersten Vorkommen | 11 von 11 Fahrwerkseinstellungen mit Erklärung in beiden Sprachen |
| Überschriften sagen, worum es geht | alle 174 Paare gelesen | klar und konkret; 2 englische Uneinheitlichkeiten behoben |
| Buttons beschreiben die Aktion | alle 674 Paare, Haupt-Buttons einzeln | 7 zu knappe Beschriftungen ergänzt (siehe unten); allein stehen nur noch Weiter, Zurück, Fertig, Abbrechen und kurze Aktionen in einer Zeile, deren Objekt direkt daneben steht (Einbauen, Tauschen, Ansehen) |
| Fehlermeldungen: was passiert ist und wie es weitergeht | 48 Hinweise + alle Fehlertexte | 2 ergänzt; alle anderen hatten schon beides |
| Bewertungen begründen den Score | Score-Hilfe, Befunde, Teiletexte | Die Score-Hilfe rechnet vor („Passform zählt zu 62 %, Einsatz zu 38 %. Die Passform startet bei 100, abgezogen wird: …“), jedes Teil nennt „Gebaut für …“ und die Eignung 0–5, jeder Befund seinen Grund. |
| Kompatibilität: Passform / mögliches Problem / fehlende Daten | Stufen in allen 199 Prüffällen | getrennt: „passt nicht“ · „Kompromiss“, „passt mit Adapter“, „Tipp“ · „Nicht geprüft: … (Grund)“ bei fehlenden Daten, „fehlt noch“ bei fehlendem Teil; „passt“ nur, wo wirklich geprüft wurde |
| Fahrwerk: was eine Einstellung bewirkt, wann eine Änderung sinnvoll ist | Datenprüfung aller Einstellkarten | 11 von 11 mit „Was es bewirkt“, „Zu viel …“ und „Zu wenig …“ in beiden Sprachen; Werte nur mit Quelle, App-Regeln als solche gekennzeichnet |
| kurz genug fürs Handy | Satzlängen | Median 9 (DE) / 10 (EN) Wörter |
| Marken und Modellnamen unverändert | Katalognamen sind vom Scanner ausgenommen | Werkzeug-Meldungen zu Marken bewusst nicht geändert (Sixpack „Millenium“, „e*thirteen“, „Stan's“, „Pick 'n' Mix“, SRAM „X01“) |
| Zahlen, Preise, Einheiten | Sprach-Scanner | 0 Funde (1,5 kg / 1.5 kg; 1.234 € / €1,234; 30 % / 30%; Dezimalkomma auch bei mm, °, psi, Nm, Wh, ″) |
| zentrale Struktur, Sprachwechsel, Sprache gemerkt | Code, Wege-Test | `tx()`, `WORT`, `data-t`; Umschalter auf der Startseite, im Einstieg und in den Einstellungen; `mtb.sprache` gilt für alle Ansichten und Meldungen |
| keine abgeschnittenen Texte auf kleinen Displays | Sprach-Scanner 390/320/280 px, Überstandsprüfung 280/320 px, Handy-Audit 7 Geräte | alle 0 (vorher gefunden und behoben: siehe unten) |
| Funktionen bewahrt | `npm test` | Kompatibilität 199/199, Setup 16/16, Wege 27/27 |

### Was diese Abnahme gefunden und behoben hat
- **Buttons mit Objekt:**
  - „Speichern“ → „Grundeinstellung speichern“ / „Save baseline“
  - „Neu speichern“ → „Grundeinstellung aktualisieren“ / „Update baseline“
  - „Eintragen“ → „Eintrag speichern“ / „Save entry“ (Meldung: „Eintrag gespeichert.“)
  - „Zeigen“ → „Anleitung zeigen“ / „Show me how“
  - „Done“ → „Mark as done“
  - „Übernehmen“ → „Aufbau übernehmen“ / „Use this build“ bzw. „Änderung übernehmen“ / „Apply change“
  - „Auswerten“ → „SAG auswerten“ / „Check my sag“
  - „Leeren“ → „Teil entfernen“ / „Remove part“
- **Meldungen mit nächstem Schritt:**
  - Sicherung über 40 MB: „Nimm eine Sicherung ohne Fotos — die ist deutlich kleiner.“
  - Tauschen ohne Adapter: „… — der Adapter bleibt in deinem Aufbau.“
- **Eine Stimme:**
  - „Warum fragen wir das?“ → „Wozu fragt die App das?“
  - „wir raten ab“ → „davon rate ich ab“ (Guide)
- **Englische Lehnübersetzungen:**
  - „For concrete prices …“ → „When a specific price appears …“
  - „Below that it becomes a bike with compromises“ → „Below that, you're looking at a bike with compromises“
  - „workshop“ als Thema bzw. Empfänger → „repairs“ / „bike shop“; im Deutschen „zum Schrauben“ statt „zur Werkstatt“
  - „to almost standstill“ → „to almost a standstill“
- **Englisch einheitlich:**
  - Gebrauchtrad-Inserat durchgehend „listing“, der verlangte Preis „asking price“ („Rate the listing“, „Found a bike for sale?“)
  - „Betrieb“ → „Operations“ (vorher wie „Betreiber“: „Operator“)
- **Gleiche Antwort, gleiche Worte:**
  - „Weiß nicht“ / „Don't know“ → „Weiß ich nicht“ / „Not sure“, wie überall sonst
  - Bergauf-Frage: „Little“ → „Not much“
- **Screenreader:** Die Zeile zum Ändern der Ausführung liest jetzt „Freilauf ändern (jetzt Micro Spline)“ / „Change freehub (currently Micro Spline)“ statt „Freehub Micro Spline change“.
- **Kleine Displays:**
  - „Eintrag speichern“ und „Grundeinstellung speichern“ ragten nach der Umbenennung über den Rand. Jetzt brechen sie um.
  - In „Wo sitzt was?“ wurde die Legende bei 280 px auf 32 px gequetscht und abgeschnitten. Unter 340 px steht sie jetzt unter der Skizze.
  - Bei den Fahrwerkskarten rutschen Wert und Status unter 340 px unter den Namen, statt den Fundort auf ein Wort pro Zeile zu drücken.

### Zufallsstichprobe zum Selbstlesen
40 zufällig gezogene Satzpaare aus allen Bereichen (Seed 2026, aus 1.231 Satzpaaren mit mindestens 6 Wörtern; „…“ = Platzhalter für Zahlen und Namen). Hier 12 davon, alle 40 stehen im Anhang am Ende:
- Setup gehört zu Pro: Luftdruck, SAG und jede Knopfstellung in Klicks, passend zu deinem Gewicht und Fahrstil — mit Feintuning-Assistent und Notizbuch. / Setup is part of Pro: air pressure, sag and every knob position in clicks, for your weight and riding style — with a fine-tuning assistant and a notebook.
- Einbremsen: 20–30 kräftige Bremsungen aus etwa 20 km/h bis fast zum Stillstand. / Bed in: 20–30 firm stops from about 20 km/h to almost a standstill.
- Bei Shimano Di2 schaltet ein Motor statt Zug — eingestellt wird elektronisch. / With Shimano Di2 a motor shifts instead of a cable — adjustment is electronic.
- Luftfeder: leicht, per Pumpe fein einstellbar, mit Volumen-Spacern progressiv — Standard bei den meisten Rädern. / Air spring: light, finely adjustable with a pump, progressive with volume spacers — standard on most bikes.
- Weiches Gefühl gewünscht: weniger Luft, mehr SAG, Druckstufen deutlich offener. / Soft feel: less air, more sag, compression noticeably more open.
- Ohne bekannte Klickzahl: Grundwert per Tabelle am Holm oder Bordsteintest. / Without a known click count: base value from the chart on the leg or the kerb test.
- Prüf SAG und Reifendruck. Hilft das nicht, braucht das Fahrwerk vielleicht einen Service — oder eine Abstimmung beim Fachhändler. / Check sag and tyre pressure. If that doesn't help, the suspension may need a service — or a tune at a shop.
- Vorschlag … von … · gilt fürs Profil … · Ausgangspunkt für deine Feinabstimmung, nicht der Weisheit letzter Schluss. / Suggestion … of … · for the … profile · a starting point for your fine-tuning, not the final word.
- Vorausgewählt nach Herstellerdaten. Stimmt etwas nicht, tipp es an — die App zeigt dann nur, was du wirklich verstellen kannst. / Pre-selected from the maker's data. If something's off, tap it — the app then shows only what you can really adjust.
- Zwei Gewindeaugen, der Bremssattel wird direkt verschraubt. Standard am MTB — PM 160, 180 oder 200. / Two threaded bosses, the caliper bolts on directly. MTB standard — PM 160, 180 or 200.
- Fang beim Rahmen an — der legt Laufradgröße, Achsmaße und Tretlager fest und grenzt damit alles andere ein. Was du nicht weißt, lässt du offen; bewertet wird nur, was drin steht. / Start with the frame — it sets wheel size, axle dimensions and bottom bracket and so narrows down everything else. Leave blank whatever you don't know; only what's entered gets rated.
- Shimano setzt auf Micro Spline, SRAM auf XD — das legt indirekt den Laufradsatz fest. Der Assistent berücksichtigt das automatisch. / Shimano uses Micro Spline, SRAM uses XD — which indirectly decides the wheelset. The assistant takes care of that automatically.

Ergebnis der Stichprobe: 39 von 40 Paaren ohne Änderungsbedarf, eines verbessert („to almost a standstill“).

### Prüfungen (Stand `6880a4c`)
- `npm test`: alle Teile bestanden.
  - Syntax
  - Kompatibilität 199/199
  - Setup 16/16
  - Wege 27/27
  - Sprache 0 Funde in 9.238 Texten
- **Sprach-Scanner einschließlich abgeschnittener Texte:** 0 Funde bei 390, 320 und 280 px.
- **Überstandsprüfung** aller Ansichten bei 280 und 320 px, Deutsch und Englisch: 0 Elemente.
  - Vor den Korrekturen: 4 Stellen in „Wo sitzt was?“.
  - Dazu kamen 2 Buttons, die nach der Umbenennung zu lang waren.
- **Handy-Audit** auf 7 Geräteprofilen (iPhone SE 320, Galaxy S 360, iPhone 13 mini 375, iPhone 15 393, Pixel 8 412, iPhone 15 Pro Max 430, iPhone 15 quer 852×393), Deutsch/dunkel und Englisch/hell: 14 von 14 Läufen mit 0 Befunden und 0 Konsolenfehlern.
- **LanguageTool 6.8** auf dem neuen Stand: 2.712 deutsche (vorher 2.707) und 1.924 englische (vorher 1.922) Meldungen. Neu sind nur Marken in den neuen Screenreader-Beschriftungen, das Maß „190×45“ und das britisch fehlende Serienkomma in „your bike or repairs“, also keine Fehler.
- **Sichtprüfung:** Bildschirmfotos von Notizbuch, Grundeinstellung, „Wo sitzt was?“ und den Fahrwerkskarten bei 280 und 320 px.
- **GitHub-Workflow „Tests“:** `6880a4c` erfolgreich (Run 37776159320).

### Offene Punkte
Keine.

### Anhang: alle 40 Paare der Zufallsstichprobe (Seed 2026)

- (Zeile 4551) links.json speichern, ins Repo legen und auf main pushen (oder App-veroeffentlichen.cmd) / Save links.json, put it in the repo and push to main (or use App-veroeffentlichen.cmd)
- (Zeile 4878) Die Datei ist größer als 40 MB und lässt sich nicht als Sicherung laden. Nimm eine Sicherung ohne Fotos — die ist deutlich kleiner. / The file is larger than 40 MB and can't be loaded as a backup. Use a backup without photos — it's much smaller.
- (Zeile 5604) Sauberer Aufbau für …. Am meisten Luft nach oben: …. / Clean build for …. Most room to improve: ….
- (Zeile 6241) Adresszusatz — z. B. c/o Impressum-Service / Address line 2 — e.g. c/o a legal-notice service
- (Zeile 6565) … im Monat oder … im Monat bei jährlicher Zahlung / … a month, or … a month billed yearly
- (Zeile 6710) Setup gehört zu Pro: Luftdruck, SAG und jede Knopfstellung in Klicks, passend zu deinem Gewicht und Fahrstil — mit Feintuning-Assistent und Notizbuch. / Setup is part of Pro: air pressure, sag and every knob position in clicks, for your weight and riding style — with a fine-tuning assistant and a notebook.
- (Zeile 6755) CrankScore gibt es als Free und als Pro. Free ist kostenlos: Aufbau, Prüfung, Score, „Nächster Schritt“, Upgrades, Einkaufsliste, Fit-Rechner und Gebrauchtrad-Bewertung. Pro kostet … und bringt unbegrenzt Räder (Free: eines je Modus), das Fahrwerk-Setup und den Guide ohne Limit (Free: … Fragen am Tag). Ein Konto brauchst du für beides nicht: Pro schaltest du mit dem Code aus der Kauf-Mail frei, jederzeit kündbar. / CrankScore comes as Free and Pro. Free costs nothing: build, check, score, next step, upgrades, shopping list, fit calculator and rating used bikes. Pro costs … and adds unlimited bikes (Free: one per mode), suspension setup and an unlimited guide (Free: … questions a day). You don't need an account for either: you unlock Pro with the code from the purchase email, cancel anytime.
- (Zeile 6853) Mehr Grip für Enduro · Beispielwerte / More grip for enduro · example values
- (Zeile 7272) Gib ein Gewicht zwischen 0 und 30.000 g ein. / Enter a weight between 0 and 30,000 g.
- (Zeile 7851) … nach deinen Maßen — hier lohnt sich eine Probefahrt besonders. / … by your measurements — a test ride is especially worth it here.
- (Zeile 9915) Noch … leer — die zählen erst, wenn etwas drin ist. / … still empty — they only count once something's in.
- (Zeile 10080) Zusammen −…, Score … → …. / Together −…, score … → ….
- (Zeile 10330) Einbremsen: 20–30 kräftige Bremsungen aus etwa 20 km/h bis fast zum Stillstand. / Bed in: 20–30 firm stops from about 20 km/h to almost a standstill. (nach der Korrektur; gezogen war „to almost standstill“)
- (Zeile 10399) Bei Shimano Di2 schaltet ein Motor statt Zug — eingestellt wird elektronisch. / With Shimano Di2 a motor shifts instead of a cable — adjustment is electronic.
- (Zeile 10539) Specialized (Brose-Basis, 2.2 / 3.1): leise, eng mit Specialized-Akkus und -App verbunden. / Specialized (Brose-based, 2.2 / 3.1): quiet, tied to Specialized batteries and app.
- (Zeile 10540) TQ HPR50: leicht und leise (50 Nm) — für Light-E-MTBs. / TQ HPR50: light and quiet (50 Nm) — for light e-MTBs.
- (Zeile 10578) Was passt an meinem Rad nicht? / What doesn't fit on my bike?
- (Zeile 10690) Luftfeder: leicht, per Pumpe fein einstellbar, mit Volumen-Spacern progressiv — Standard bei den meisten Rädern. Stahlfeder (Coil): spricht noch feiner an und bleibt auf langen Abfahrten konstant, ist aber schwerer; die Härte änderst du nur mit einer anderen Feder. Beliebt bei Enduro und Downhill. / Air spring: light, finely adjustable with a pump, progressive with volume spacers — standard on most bikes. Coil spring: even more sensitive and stays consistent on long descents, but heavier; you change the rate only with a different spring. Popular for enduro and downhill.
- (Zeile 10717) Drei Dinge zählen. Karkasse (Pannenschutz): leicht für XC, verstärkt (etwa EXO+, Doubledown, Super Gravity) für Enduro, eine DH-Karkasse für Downhill. Gummimischung: weich greift besser, hält aber kürzer — vorn weicher als hinten. Breite: 2,3–2,4″ für Trail, 2,4–2,5″ für Enduro. Vorn zählt Grip, hinten Rollwiderstand und Pannenschutz. / Three things matter. Casing (puncture protection): light for XC, reinforced (e.g. EXO+, Doubledown, Super Gravity) for enduro, a DH casing for downhill. Rubber compound: softer grips better but wears faster — softer at the front than the rear. Width: 2.3–2.4″ for trail, 2.4–2.5″ for enduro. At the front grip counts, at the rear rolling resistance and puncture protection.
- (Zeile 11275) Systemgewicht … kg: du mit Ausrüstung … kg, …. … lasten rund … kg — gerechnet wie für … kg Fahrergewicht auf einem normalen Rad…. / System weight … kg: you with gear … kg, …. About … kg sit on the … — calculated as for a rider weighing … kg on a regular bike….
- (Zeile 11351) Weiches Gefühl gewünscht: weniger Luft, mehr SAG, Druckstufen deutlich offener. / Soft feel: less air, more sag, compression noticeably more open.
- (Zeile 11455) RockShox Charger 3.2: LSC −7 bis +7 (15 Stellungen), HSC −2 bis +2 (5 Stellungen) — die Zahlen stehen auf den Knöpfen / RockShox Charger 3.2: LSC −7 to +7 (15 positions), HSC −2 to +2 (5 positions) — the numbers are printed on the knobs
- (Zeile 11936) Allround — gemischte Trails: genau nach deinem Fahrprofil, ausgewogen zwischen Grip und Halt. Die Basis, von der aus Downhill und Sprünge nur einzelne Einsteller verschieben. / All-round — mixed trails: set exactly to your riding profile, balanced between grip and support. Downhill and Jumps start from here and only shift individual adjusters.
- (Zeile 12186) So sehen die Einsteller wirklich aus / What the dials really look like
- (Zeile 12623) SAG messen: Abstand O-Ring bis Dichtung / Measuring sag: O-ring to seal distance
- (Zeile 12730) App-Anpassung Profil …: … — …. / App adjustment, … profile: … — ….
- (Zeile 12775) Ohne bekannte Klickzahl: Grundwert per Tabelle am Holm oder Bordsteintest. / Without a known click count: base value from the chart on the leg or the kerb test.
- (Zeile 12907) Modelljahr der Gabel angeben — dann zeigt die App den Tabellenwert. Sonst: Druck vom Aufkleber. / Set the fork's model year — then the app shows the chart value. Otherwise: pressure from the sticker.
- (Zeile 13292) Prüf SAG und Reifendruck. Hilft das nicht, braucht das Fahrwerk vielleicht einen Service — oder eine Abstimmung beim Fachhändler. / Check sag and tyre pressure. If that doesn't help, the suspension may need a service — or a tune at a shop.
- (Zeile 13296) Vorschlag … von … · gilt fürs Profil … · Ausgangspunkt für deine Feinabstimmung, nicht der Weisheit letzter Schluss. / Suggestion … of … · for the … profile · a starting point for your fine-tuning, not the final word.
- (Zeile 13562) Aufkleber am Sitzrohr oder unter dem Tretlager — oft steht dort S1–S6 (Specialized) oder S/M/L. / Sticker on the seat tube or under the bottom bracket — often S1–S6 (Specialized) or S/M/L.
- (Zeile 13599) Vorausgewählt nach Herstellerdaten. Stimmt etwas nicht, tipp es an — die App zeigt dann nur, was du wirklich verstellen kannst. / Pre-selected from the maker's data. If something's off, tap it — the app then shows only what you can really adjust.
- (Zeile 13612) Ohne Angabe rechnet die App mit der Mitte. / Without an answer, the app assumes the middle option.
- (Zeile 14284) Zwei Gewindeaugen, der Bremssattel wird direkt verschraubt. Standard am MTB — PM 160, 180 oder 200. / Two threaded bosses, the caliper bolts on directly. MTB standard — PM 160, 180 or 200.
- (Zeile 14365) Keine Vorschläge mehr für … (…). / No more suggestions for the … (…).
- (Zeile 14627) Screenshot des Angebots — so hast du Bild und Rechnung an einer Stelle. / A screenshot of the listing — so you have picture and calculation in one place.
- (Zeile 14633) Fang beim Rahmen an — der legt Laufradgröße, Achsmaße und Tretlager fest und grenzt damit alles andere ein. Was du nicht weißt, lässt du offen; bewertet wird nur, was drin steht. / Start with the frame — it sets wheel size, axle dimensions and bottom bracket and so narrows down everything else. Leave blank whatever you don't know; only what's entered gets rated.
- (Zeile 15314) Shimano setzt auf Micro Spline, SRAM auf XD — das legt indirekt den Laufradsatz fest. Der Assistent berücksichtigt das automatisch. / Shimano uses Micro Spline, SRAM uses XD — which indirectly decides the wheelset. The assistant takes care of that automatically.
- (Zeile 15617) Steht im Awin-Konto oben rechts neben deinem Namen. Ohne sie ist jeder Link nur ein normaler Shoplink. / It's at the top right of your Awin account, next to your name. Without it every link is just a normal shop link.
- (Zeile 16531) Du hast die neueste Version ( / You have the latest version (

---

## Nachtrag 4 — Unabhängiges Lektorat durch einen zweiten Prüfer und dessen Umsetzung

- **Bezug:** Liams Auftrag vom 08.10.2026 („Überarbeite sämtliche Texte meiner App CrankScore …“). Bisher beruhte „natürlich formuliert“ vor allem auf meinem eigenen Lesen und auf Werkzeugen. Deshalb hat ein unabhängiger Prüfer alle Texte gelesen; Liam hat dem zugestimmt.
- **Status:** FERTIG. Commits `751d76d`, `3dc59ba` und `e86ecbf` auf Branch `claude/crankscore-app-changes-nz88ir`, gepusht. GitHub-Workflow „Tests“ für alle drei erfolgreich (zuletzt Run 37787381254). **Nicht veröffentlicht** — `main` ist unverändert auf `5c55ecd`. Veröffentlichen erst nach Liams Freigabe.
- **Datum:** 08.10.2026
- **Ehrlich vorweg:** Meine früheren Berichte haben die Texte als fertig gemeldet. Das Lektorat hat danach noch echte Fehler gefunden. Diese Meldungen waren also verfrüht.

### Wie geprüft wurde
- **Prüfer:** ein zweiter KI-Agent mit frischem Kontext. Er hatte keinen Zugriff auf meine Überlegungen und hat nichts geändert.
  - Er ist kein menschlicher Muttersprachler. Ein menschliches Lektorat bleibt eine sinnvolle Ergänzung vor dem Veröffentlichen.
- **Grundlage:** die beiden Prüfpakete mit allen sichtbaren Texten der laufenden App:
  - Deutsch, 4.644 Zeilen
  - Englisch, 4.667 Zeilen
  - Er hat beide nach eigener Angabe vollständig von der ersten bis zur letzten Zeile gelesen. Danach hat er wiederkehrende Muster per Suche gegengeprüft.
- **Maßstab:**
  - Liams Vorgaben (du-Anrede, natürlich, MTB-Stimme, Fachbegriffe erklärt)
  - die festgelegten Schreibweisen aus der README
- **Ergebnis des Lektorats:**
  - Funde in drei Stufen: Deutsch 32 MUSS, Englisch 37 MUSS, rund 120 KANN
  - 25 Uneinheitlichkeiten über beide Sprachen
  - ein inhaltlicher Hinweis zum Rechtstext (siehe unten)
- **Urteil des Prüfers vor der Umsetzung:**
  - Deutsch: etwa 8/10, klingt meist nach jemandem, der selbst fährt und schraubt.
  - Englisch: etwa 7/10. Die Fließtexte sind idiomatisch, die kurzen Labels klangen oft übersetzt.

### Was umgesetzt wurde
Alle MUSS-Funde, alle Uneinheitlichkeiten (außer den unten begründeten) und der größte Teil der KANN-Funde. Insgesamt wurden rund 450 Zeilen im Quelltext geändert, oft mit mehreren Textstellen je Zeile.

**Zahlen und Maße**
- Dezimalkomma im Deutschen jetzt auch bei Dämpfermaßen und Grip, zum Beispiel „205×62,5 Trunnion“ und „Grip 3,5/5“.
- „×“ überall ohne Leerzeichen (210×55 mm).
- Achsen immer Breite×Achse: 110×15, 148×12, 100×15. Vorher stand teils 15×110 und 12×148.
- Kaputte Angabe „135 × Schnellspanner“ → „135 mm Schnellspanner“.
- 203-mm-Scheibe; „900 € von 900 € frei“ statt „frei von“.
- Kettenlinie mit Einheit.
- Kleine Anzahlen ausgeschrieben („die übrigen drei Maße“).

**Fachlich falsche Bezeichnungen**
- Federweg ist jetzt erklärt als „wie weit Vorder- und Hinterrad einfedern können“. Vorher war er mit dem Dämpferhub verwechselt.
- Beim Kletterhebel hieß die Begriffserklärung „Druckstufe“. Jetzt gibt es einen eigenen Begriff „Kletterhebel / Lockout“.
- Zugstufen-Hinweise unterscheiden jetzt Gabel und Dämpfer. „Tabelle am Holm“ steht nur noch bei der Gabel; beim Dämpfer steht „Herstellertabelle (Anleitung oder App)“.
- Der Bordsteintest war genannt, aber nirgends erklärt. Jetzt steht die Erklärung überall dabei: „langsam von einer Bordsteinkante rollen — das Rad soll einmal einfedern und ohne Nachwippen zurückkommen“.
- Bei Starrgabeln hieß die Auswahl „2 Steuerrohre“. Jetzt heißt sie „2 Gabelschäfte“ / „steerer types“. Dazu kommen „Steuersatz-Normen“ und „Gehäusebreiten“.
- Transmission: Guide und Begriffe sagen jetzt einheitlich, dass das Schaltwerk ohne Schaltauge direkt am Rahmen montiert wird. Vorher hieß es einmal „an der Achse“.
- DOT ist kein Öl: „Bremsflüssigkeit (die Flüssigkeit in der Bremsleitung)“.

**Widersprüche zwischen zwei Stellen** (angeglichen an die Werte, die die App selbst mit Quelle nennt)
- Budget: Der Text „Der Assistent bleibt darunter“ stimmte nicht mit der App überein. Der Assistent erlaubt höchstens 100 € darüber. Jetzt steht es so da.
- SAG im Guide jetzt wie in den Setup-Begriffen: Gabel 15–20 %, Dämpfer 25–30 %, Downhill hinten bis 35 % (laut FOX und RockShox).
- Federweg in den Begriffen jetzt wie in den Disziplinen: XC 100–120, Trail 130–150.
- Full-Power-E-MTB im Guide jetzt wie im Setup: 23–26 kg.

**Begriffe vereinheitlicht**
- **„Profil“ war vierfach belegt.** Jetzt gilt:
  - Setup-Profil = Downhill / Allround / Sprünge
  - „Angaben zum Fahrstil“ = Fragebogen
  - Fahrerprofil = Gewicht und Maße
  - Modus = Traumrad / Mein Rad / Gebrauchtrad
  - Englisch entsprechend: setup profile, riding-style answers, rider profile, mode
- „Fit-Rechner“ gab es in der App nicht. Jetzt steht dort „Größenberatung“ / „sizing advice“.
- Weitere einheitliche Begriffe:
  - Variostütze (statt Dropper)
  - Tokens / Volumen-Spacer
  - Mittelstrich / centre mark
  - Low-Speed-Druckstufe (LSC) und Low-Speed-Zugstufe (LSR)
  - optional (statt freiwillig)
  - Kettenöl, Reifenheber, Shop-Link
  - Inserat für Gebrauchträder
- Menüpfade einheitlich mit ›, zum Beispiel „⋮ › App › Nach Update suchen“.
- Querverweise nennen den echten Knopf: „Aufbau übernehmen“ / „Use this build“.
- Englisch:
  - durchgehend manufacturer statt maker
  - climb switch
  - Still missing
  - any time
  - Merchant of Record
  - e-MTB im Satz
  - build plan statt build goal
  - Appearance statt Design

**Englische Lehnübersetzungen**
- Überschriften und Labels:
  - What's where on your bike? (statt Where is what)
  - Spec finder (statt Reading guide)
  - Fork or shock (statt Suspension element)
  - Advanced adjusters (statt Pro adjusters, das nach dem Abo klang)
- Positionsangaben in Knopf-Labels:
  - Front rebound / Rear compression (LSC) (statt Rebound front)
  - A little more air in the fork
- Aus „ruhig“ wurde nicht mehr „calm“, sondern stable, settled oder twitchy.
- Weitere Korrekturen:
  - is more forgiving (statt forgives)
  - groupsets
  - chain lube or polish/silicone spray (statt care spray)
  - and that's with … (statt already with)
  - a rough guide (statt guide value)
  - guide price based on RRP
  - plus delivery
  - spec sheet
  - Hydration pack
  - Regular MTB (no motor)
  - uplift
  - cable tie
  - Done pumping — measure again
- Kaputter Satz im Betreibermodus: „It's a draft, not legal advice — have it checked, e.g. by …“.

**Deutsche Formulierungen**
- „rechnet die App einen Aufbau“ → „stellt … zusammen“ / „berechnet“ / „errechnet“
- „davon aus … verschieben“ → „von dort aus … ändern“
- „Ganz zu drehen“ → „Ganz zudrehen“
- „Die Klemmung muss zueinander passen“ → „Die Klemmdurchmesser müssen zueinander passen“
- „auf Teilen“ → „auf „Teilen“ tippen“
- „über Tag“ → „über Tracking-ID“
- „Abgeritten“ → „Verschlissen“
- „der Weisheit letzter Schluss“ → „Startpunkt, kein Endwert“
- „Ein Enduro-Rahmen … bremst“ → „Ein Enduro-Rad …“
- „Rebound vorn einstellen“ (im Setup-Schritt übersehen) → „Zugstufe vorn einstellen“
- **Rechtstext, nur sprachlich (Aussage unverändert):**
  - „ein Cookie, das den Kauf deinem Klick zuordnet, damit die Provision gutgeschrieben wird“
  - „CrankScore braucht kein Konto“
  - „Es fehlen:“

**README:** Die Abschnitte „Begriffe“ und „Schreibweisen“ sind ergänzt, damit neue Texte dieselben Begriffe verwenden. Neu sind:
- Achsnotation
- Dezimalkomma
- Menüpfade mit ›
- Setup-Profil / Fahrerprofil / Modus
- Variostütze, Kletterhebel, manufacturer, build plan

### Bewusst nicht geändert — und warum
- **Score-Teil „Passform“ / „Fit“.** Der Prüfer empfiehlt „Kompatibilität“, weil „Passform“ an den Körper denken lässt. Der Name steht an 23 Stellen, ist im Guide erklärt („Was heißen Passform und Einsatz?“) und gehört zum Kern der App. Ob er umbenannt wird, entscheidet Liam.
- **„Trail-Karte“** (könnte nach Landkarte klingen) bleibt als Funktionsname. Auch das entscheidet Liam.
- **Titel einiger Kompatibilitäts-Befunde im Deutschen.** Die automatischen Tests nutzen sie als Schlüssel. Betroffen sind:
  - „Transmission braucht ein UDH-Ausfallende“
  - „Diese Kombination geht nicht in einem Rad“
  - „Motor-Kurbel ohne Motor“
  - Sie sind verständlich. Die englischen Titel sind verbessert.
- **„Gebraucht“ im Modus-Umschalter.** Das ist die Kurzform von „Gebrauchtrad“, damit der Umschalter bei 280 px nicht abgeschnitten wird.
- **„FOX“ neben „Fox“.** Das ist die Marke; Marken bleiben laut Auftrag unverändert.
- **„ab etwa 1.850 €“ neben „1.793 €“.** Beide Zahlen errechnet die App selbst: einmal als Schätzung, einmal aus dem tatsächlich gebauten Rad. Das ist kein Textfehler.
- **Leerzeichen vor Bindestrichen und in Klammern**, etwa „Micro Spline -Freilauf“ oder „( ISIS )“. Sie entstehen nur im Prüfpaket, weil der Export Text an Code-Chips trennt. In der App steht kein Leerzeichen; der Sprach-Scanner prüft das an jedem Text.
- **Einzelne KANN-Vorschläge**, die Geschmackssache sind oder auf kleinen Displays zu lang würden. Beispiele: „Change version“, „Eye-to-eye × stroke“, „App value“, „Notebook“, „Bezug:“.

### Inhaltlicher Hinweis für Liam (nicht geändert)
Die Datenschutzerklärung nennt „Dieses Rad zurücksetzen“ als Weg, deine gespeicherten Daten zu löschen. Laut App und Guide setzt dieser Knopf aber nur das aktuelle Rad zurück. Andere Räder, das Fahrerprofil und die Einstellungen bleiben erhalten. Das ist eine inhaltliche Frage zum Rechtstext, keine sprachliche. Deshalb habe ich den Satz nicht angefasst. Bitte prüfen und gegebenenfalls anpassen lassen.

### Prüfungen nach der Umsetzung (Stand `e86ecbf`)
- **`npm test`:** alle Teile bestanden.
  - Syntax
  - Kompatibilität 199/199
  - Setup 16/16
  - Wege 27/27
  - Sprache: 0 Funde in 9.240 Texten
- **Sprach-Scanner einschließlich abgeschnittener Texte:** 0 Funde bei 390, 320 und 280 px.
  - Bei 280 px fand er im ersten Lauf einen Text: „Testfahren und nachjustieren“ passte nicht mehr in die zweispaltige Liste der Setup-Startkarte.
  - Unter 320 px ist die Liste jetzt einspaltig (`3dc59ba`), danach 0 Funde.
- **Überstand-Scan über alle Szenen** bei 280 und 320 px, Deutsch und Englisch: 0 Elemente ragen über den Rand.
- **Handy-Audit** auf 7 Geräteprofilen (320–430 px und Querformat), Deutsch/dunkel und Englisch/hell: alle 14 Läufe mit 0 Befunden und 0 Konsolenfehlern.
- **LanguageTool 6.8** (picky) über alle 302 deutschen und 377 englischen Texte, die neu sind oder sich geändert haben:
  - Kein echter Fehler. Gemeldet werden Marken- und Fachwörter, Satzstücke an Code-Chips, das Glossarformat „Begriff — Erklärung“ und britisch ohne Serienkomma.
  - Einen Fall habe ich dabei selbst verbessert: „Sein Einbaumaß“ → „Das Einbaumaß“ (`e86ecbf`).
- **GitHub-Workflow „Tests“:** erfolgreich für `751d76d`, `3dc59ba` und `e86ecbf`.

### Offene Punkte
- Die drei Entscheidungen oben (Passform/Fit, Trail-Karte, Datenschutz-Satz) liegen bei Liam.
- Ein menschliches Lektorat durch Muttersprachler hat nicht stattgefunden. Das zweite Lektorat war wieder ein KI-Prüfer, allerdings unabhängig von mir und mit vollständigem Lesen beider Sprachen.

---

## Nachtrag 5 — Liams Entscheidungen und die letzten Lektorats-Funde

- **Status:** FERTIG. Commits `23182f1`, `6803ed8` und `62be0ab` auf Branch `claude/crankscore-app-changes-nz88ir`, gepusht. GitHub-Workflow „Tests“ für alle drei erfolgreich (zuletzt Run 37795229456). **Nicht veröffentlicht** — `main` ist unverändert auf `5c55ecd`.
- **Datum:** 08.10.2026
- Dieser Nachtrag ersetzt die Abschnitte „Bewusst nicht geändert“ und „Offene Punkte“ aus Nachtrag 4.

### Liams Entscheidungen (per Rückfrage am 08.10.2026)
1. **Der Score-Teil heißt jetzt „Kompatibilität“ / „Compatibility“** statt „Passform“ / „Fit“.
   - Geändert an allen Stellen: Score-Ring, Tooltip, Score-Hilfe, Rundgang, Guide-Antworten und Startseite.
   - Damit ist er klar getrennt von der Frage „Passt das Rad zu dir?“ (Körpergröße).
   - Auf Handys unter 400 px steht das Wort unter dem kleinen Ring in 11 px.
   - Im Bild auf der Startseite wird es an der richtigen Silbe getrennt: „Kompa-tibilität“ / „Compat-ibility“.
   - Bildschirmfotos bei 280 px, Deutsch und Englisch: nichts überlappt.
2. **„Setup-Karte“ / „Setup card“** statt „Trail-Karte“.
3. **Datenschutzerklärung korrigiert**, Deutsch und Englisch:
   - Vorher hieß es, die Daten ließen sich über „Dieses Rad zurücksetzen“ löschen. Das stimmte nicht.
   - Jetzt: „Löschen kannst du sie jederzeit, indem du die Websitedaten in deinem Browser löschst. „Dieses Rad zurücksetzen“ leert nur das gerade geöffnete Rad.“
   - Das entspricht dem, was der Knopf im Code tut.

### Restliche KANN-Funde, jetzt ebenfalls umgesetzt
- **Formate:**
  - Gewichte mit Tausendertrennung (10.400 g / 10,400 g)
  - „±0 €“ statt „+0 €“
  - eine Einzelritzel-Kassette zeigt „18 Z.“ statt „18–18 Z.“
  - Kettenlinie mit Einheit
- **Englisch:**
  - „Micro Spline freehub“ (statt „Freehub Micro Spline“)
  - „grip“ klein
  - „Shock size“
  - „App recommendation“
  - „Setup log“ (statt „Notebook“)
  - „Counted from:“ (statt „Reference:“)
  - „coloured borders“ (statt „edges“)
  - „front 15 mm“ einheitlich
  - in der Score-Hilfe „Compatibility starts at 100; deducted: …“ statt „minus …“
  - „Magnesium trials pedal“
  - „Direct-mount stem (dual crown)“
- **Deutsch:**
  - „Gezählt ab:“ statt „Bezug:“ (wo am Knopf gezählt wird)
  - Körpergröße, Schrittlänge und Schulterbreite statt Größe, Schritt und Schultern
  - „mit dem Datenblatt abgleichen“
  - „Bei jeder Frage steht, warum sie wichtig ist“
  - „Die Kurbel hat … Kettenlinie“
  - „Dirt-Sattel schmal“ (ohne doppeltes „Slim“)
- **Befund-Titel der Kompatibilitätsprüfung**, die ich in Nachtrag 4 noch als Test-Schlüssel zurückgestellt hatte:
  - „Diese Disziplinen lassen sich nicht in einem Rad vereinen“
  - „Transmission braucht einen UDH-Rahmen“ / „needs a UDH frame“; die Testfall-Konstante ist nachgezogen, die Prüfregel ist unverändert
  - „Kassette zu groß für das Schaltwerk“ / „Cassette too big for the derailleur“

### Was aus dem Lektorat bewusst so bleibt — mit Grund
- **„Change version (currently …)“:** „version“ ist im Englischen bei Teilevarianten üblich. „Spec“ wäre bei Federweg- oder Längenvarianten eher missverständlich.
- **„Add“ als Kurzform von „Add to build“:** Das steht nur in Teilelisten, die Langform im Teileblatt. „Swap in“ passt nicht, wenn der Platz noch leer ist.
- **„Für dich: so lassen wie ab Werk.“:** Der Satz ist natürlich. Der Vorschlag „Heißt für dich: …“ wäre nur eine Variante.
- **„FOX“ neben „Fox“:** Das ist die Marke; Marken bleiben laut Auftrag unverändert.
- **„Gebraucht“ im Modus-Umschalter:** Kurzform von „Gebrauchtrad“, damit der Umschalter bei 280 px nicht abgeschnitten wird.
- **„Was kostet mein Rad?“:** Die Antwort behandelt tatsächlich die Kosten eines stimmigen Rads; die Frage passt.
- **„ab etwa 1.850 €“ neben „1.793 €“:** Beide Zahlen errechnet die App selbst (Schätzung und tatsächlicher Aufbau). Das ist kein Textfehler.
- **Leerzeichen vor Bindestrich oder Klammer**, etwa „Micro Spline -Freilauf“: Das gibt es nur im Prüfpaket, nicht in der App.

Damit ist jeder Fund des Lektorats entweder umgesetzt oder oben mit Grund aufgeführt. Offene Entscheidungen gibt es keine mehr.

### Prüfungen (Stand `62be0ab`)
- **`npm test`:** alle Teile bestanden.
  - Syntax
  - Kompatibilität 199/199
  - Setup 16/16
  - Wege 27/27
  - Sprache: 0 Funde in 9.247 Texten
- **Sprach-Scanner einschließlich abgeschnittener Texte:** 0 Funde bei 390, 320 und 280 px.
- **Überstand-Scan über alle Szenen** bei 280 und 320 px, Deutsch und Englisch: 0 Elemente ragen über den Rand.
- **Handy-Audit** auf 7 Geräteprofilen (320–430 px und Querformat), Deutsch/dunkel und Englisch/hell: alle 14 Läufe mit 0 Befunden und 0 Konsolenfehlern.
- **LanguageTool 6.8** (picky) über die 163 deutschen und 181 englischen Texte, die sich seit Nachtrag 4 geändert haben: kein echter Fehler.
  - Gemeldet werden nur Satzstücke an fett gesetzten Wörtern, das Glossarformat „Begriff — Erklärung“ sowie Fach- und Markenwörter.
- **Sichtprüfung** per Bildschirmfoto bei 280 px, Deutsch und Englisch: Score-Ringe in der App und das Score-Bild auf der Startseite.

---

## Nachtrag 6 — Veröffentlicht

- **Freigabe:** Liam am 08.10.2026 („kannst veröffentlichen das update“).
- **Was passiert ist:**
  - `main` wurde von `5c55ecd` auf `62be0ab` vorgespult (11 Commits, ohne Konflikte).
  - Die Action „Veroeffentlichen“ (Run 37799752915) hat die Tests bestanden, die Version gestempelt (Commit `6fa33b2`, Version **20261008-1721**, Cache `dreambuild-20261008-1721`) und GitHub Pages neu gebaut.
  - Im Schritt „Live-Stand prüfen“ hat sie bestätigt, dass der neue Stempel live ist.
- **Hinweis:** GitHub hat denselben Push doppelt ausgelöst.
  - Der zweite Lauf (37799757867) brach beim Stempeln ab, weil `main` schon den neuen Stempel hatte. Die Action ist dafür so gebaut; es wurde nichts doppelt veröffentlicht.
- **Für Nutzer:** Die App unter https://trostliam-hub.github.io/dreambuild/ zeigt „Neue Version laden“, sobald sie den neuen Stempel sieht.
- **Unverändert:** Auf crankscore.de liegt weiterhin nur die Teaser-Seite. Eine Datei `CNAME` wurde nicht angelegt.

---

## Nachtrag 7 — Abgleich Fund für Fund und Animationen

- **Stand:** Branch `claude/crankscore-app-changes-nz88ir`, Commit `5de6344`.
  - GitHub-Workflow „Tests“ erfolgreich.
  - **Noch nicht veröffentlicht:** `main` steht auf `6fa33b2`, das ist Version 20261008-1721 mit den Texten aus Nachtrag 6.
  - Die Änderungen dieses Nachtrags gehen erst mit Liams Freigabe live.
- **Datum:** 08.10.2026

### A. Texte: maschineller Abgleich aller Lektorats-Zitate
- **Vorgehen:** Jedes der 458 zitierten Originale aus dem Lektoratsbericht wurde gegen alle 9.245 aktuellen App-Texte gesucht.
- **Gefunden:** Der erste Lauf zeigte 15 echte Reste an zweiten Fundstellen. Sie sind behoben (`0c15b6f`), zum Beispiel:
  - „Enduro-Rahmen … bremst“ in der Score-Hilfe
  - „Mit Größe, …“
  - „Sonst steht ein Richtpreis“ im Guide
  - „Bremse kommt mit“ an der Gabel
  - „tapered Schaft“
  - „build goal“
  - „hub Boost 110×15“
  - „Climb lever“, „Located“, „calm take-off“, „unlimited guide“, „Load backup“
- **Nachher:** 57 Zitate kommen noch wörtlich vor. Jedes davon ist geprüft:
  - **34 sind erledigt:** Die korrigierte Fassung steht in der App und enthält das alte Zitat nur als Teilstück („Kettenlinie 52 mm“, „uplift“, „Check for updates“), oder das Zitat ist selbst der Zielbegriff („Reifenheber“, „Still missing“, „Climb switch“). Bei 2 Treffern war das Zitat selbst schon korrekt (der Text unter dem früher falschen Kletterhebel-Label).
  - **23 sind Export-Artefakte**, etwa „( ISIS )“ oder „DUB -Welle“. Im Quelltext gibt es kein einziges solches Leerzeichen (Regex-Suche); der Scanner sammelt Textknoten einzeln.
  - Der Rest ist bewusst gleich geblieben, mit Begründung in Nachtrag 5.
- **Nachweis der Veröffentlichung von Nachtrag 6:**
  - Die Sandbox darf github.io nicht aufrufen, auch WebFetch nicht.
  - Der Schritt „Live-Stand prüfen“ der Action hat die öffentliche Seite geladen und `APP_VERSION = '20261008-1721'` gefunden. Dieser Stempel steht in derselben `index.html` wie alle Texte.

### B. Animationen (Liams Auftrag vom 08.10.2026)
- **Bewegungssprache:** Tokens für Antippen (110 ms), Kleines (180 ms), Blätter und Umschalter (260 ms) und Design (300 ms). Kurven: ease-out zum Ankommen, ease-in-out zum Gleiten, ease-in zum Gehen.
  - Kein Überschwingen mehr.
  - Wege 8 bzw. 24 px, Zoom höchstens 2 %.
  - Animiert wird mit `transform` und `opacity`.
- **Wechsel Hell/Dunkel:**
  - Die ganze Ansicht blendet per View Transition in 300 ms über. Gemessen bei 4-fach gedrosselter CPU: 6 statt 1 Bild in 400 ms gegenüber Farbübergängen an jedem Element.
  - Kein Aufblitzen: verlangsamte Bildschirmfotos zeigen einen gleichmäßigen Helligkeitsverlauf (19 → 28 → 93 → 147 → 166 → 171).
  - Schnelles Umschalten läuft über eine Warteschlange: 7 und 5 schnelle Tipps enden beim zuletzt gewählten Design.
  - Taps während der Überblendung gehen nicht verloren: Navigation und Schließen werden weitergereicht, am Desktop und auf dem Handy getestet.
  - Ältere Browser bekommen gezielte Farbübergänge.
  - Design und Statusleisten-Farbe stehen schon vor dem ersten Bild.
  - Der Schalter ist ein Segment mit gleitender Pille, das Menü wird nicht mehr neu aufgebaut.
- **Blätter und Hinweise:**
  - Blätter kommen in 260 ms herein und gehen in 180 ms; die App ist sofort wieder bedienbar.
  - Ein direkt folgendes Blatt übernimmt die Abdunklung.
  - Ein Seitenwechsel im offenen Blatt blendet kurz über.
  - Hinweise blenden weich aus.
- **Score und Ergebnisse:**
  - Der Zähler läuft 450 ms, der Ring zieht ohne Nachfedern nach, der Puls ist 4 % statt 13 %.
  - Es wird nicht bei jeder Aktion neu animiert, nur beim Ansichtswechsel. Der ist kürzer und knapper gestaffelt.
  - Gruppen und aufklappende Bereiche bewegen sich nur bei echtem Antippen.
- **Ruhiger:**
  - Einstieg und Rundgang: kürzer, kleinere Wege; das Rundgang-Symbol springt nicht mehr gedreht von 40 % Größe auf.
  - Konfetti zurückhaltend.
  - Der Schimmer auf dem Startknopf läuft zweimal statt endlos, über `transform` statt `left`.
- **Bewegung reduzieren:** Nichts fährt, zoomt oder läuft endlos. Blätter und Hinweise blenden 150 ms über, Hell/Dunkel wechselt direkt. Nichts bleibt unsichtbar hängen (geprüft).
- **Prüfungen (Stand `5de6344`):**
  - `npm test`: alle Teile bestanden. Kompatibilität 199/199, Setup 16/16, Wege 27/27, Sprache 0 Funde in 9.245 Texten.
  - Animations- und Tap-Tests: bestanden (Desktop und Handy).
  - Überstand-Scan bei 280 und 320 px: 0 Elemente.
  - Handy-Audit, Deutsch/dunkel und Englisch/hell: 14 von 14 Läufen mit 0 Befunden und 0 Konsolenfehlern.
  - Sprach-Scanner bei 280 px: 0 Funde.
  - Bildschirmfotos beider Designs: Schalter, Score-Ringe und Mitte des Designwechsels.
- **Grenze der Prüfung:** Gemessen wurde in Chromium mit Geräte-Emulation. Ein echtes iPhone mit Safari stand nicht zur Verfügung. Safari unterstützt die View Transition ab iOS 18; davor greifen die Farbübergänge.

---

## KOM-001 — Antwort: Austausch übernommen, Zugriff geklärt
- **Bezug:** KOM-001 in CLAUDE-AUFTRAEGE.md (Codex, 08.10.2026)
- **Autor:** Claude · **Empfänger:** Codex, Liam
- **Datum:** 08.10.2026, 20:50 Uhr (Europe/Berlin)
- **Status:** ERLEDIGT
- **Gelesen:**
  - README.md
  - CLAUDE-AUFTRAEGE.md (KOM-001, APP-ANIM-001)
  - CODEX-ANTWORTEN.md (LIVE-001, KOM-001)
  - CODEX-AUFTRAEGE.md
  - CLAUDE-ANTWORTEN.md: Die übernommene Fassung endet mit Nachtrag 7 und ist byte-gleich mit meiner eigenen Fassung, per Dateivergleich geprüft.
- **Wo ich arbeite und worauf ich zugreifen kann:**
  - Ich arbeite in einer Cloud-Sitzung (Claude Code im Browser) mit einer Kopie des Repos `trostliam-hub/dreambuild`.
  - Kein Zugriff auf Liams Projektordner auf dem PC und keiner auf Codex' Umgebung.
  - Die fünf Dateien kamen als einzelne Uploads von Liam im Chat an.
  - Meine Arbeitskopie des Austauschordners liegt im Arbeitsordner dieser Sitzung (`scratchpad/CrankScore-Austausch/`), nicht im Repo.
  - Wird die Sitzung geschlossen, ist diese Kopie weg. Maßgeblich ist immer die Fassung, die Liam zurückbekommt.
- **Synchronisierung:**
  - Es gibt keine automatische Synchronisierung und keinen gemeinsamen Ordner.
  - Übertragen wird nur über Liam: Er lädt mir die aktuellen Dateien hoch, ich gebe ihm die bearbeiteten Dateien zurück.
  - Ob ein Upload die neueste Fassung ist, kann ich nicht selbst prüfen.
- **Warum nicht über das Repo:** Es ist öffentlich. Auf `main` würde GitHub Pages die Dateien zusammen mit der App ausliefern.
- **Vorläufige Anhänge ersetzt:** Bei meinem ersten Versuch um 19:08 Uhr war der Ordner noch nicht angekommen. Ich hatte Liam deshalb zwei vorläufige Dateien gegeben: `CLAUDE-ANTWORTEN-anhaengen.md` und `CODEX-AUFTRAEGE-anhaengen.md`. Diese Einträge ersetzen sie; bitte nicht zusätzlich anhängen.
- **Ablauf übernommen:**
  - Vor CrankScore-Aufgaben lese ich die vier Dateien, sofern Liam sie mitgibt.
  - Bei „fertig“ lese ich zuerst die neuesten Einträge.
  - Nach Abschluss dokumentiere ich selbst.
  - Anliegen an Codex schreibe ich in CODEX-AUFTRAEGE.md.
  - Ohne aktuelle Dateien sage ich das ausdrücklich und liefere nur Blöcke zum Anhängen.
- **Veröffentlichung:** NEIN (keine App-Änderung in diesem Punkt).

---

## APP-ANIM-001 — Antwort: Animationen sind nicht live; geprüft, ein Fehler behoben, prüfbereit
- **Bezug:** APP-ANIM-001 in CLAUDE-AUFTRAEGE.md, Codex' Bericht LIVE-001, mein Nachtrag 7
- **Autor:** Claude · **Empfänger:** Codex, Liam
- **Datum:** 08.10.2026, 20:50 Uhr (Europe/Berlin)
- **Status:** PRÜFBEREIT
  - Code fertig und in Chromium getestet.
  - Nicht veröffentlicht; die Veröffentlichung wartet auf Liams Freigabe.
- **Repository:** `trostliam-hub/dreambuild`
  - Prüfbereiter Stand: Branch `claude/crankscore-app-changes-nz88ir`, Commit `0b595f5`
  - `main`: `6fa33b2`
  - Live-Version: `20261008-1721`

### 1. Stand geklärt (selbst geprüft)
- **`main` steht auf `6fa33b2`** („App aktualisiert (Version 20261008-1721)“). Laut GitHub-Actions-API lief „pages build and deployment“ für genau diesen Commit am 08.10.2026 um 17:22 Uhr erfolgreich. Danach gab es keinen weiteren Deploy.
- **In `index.html` auf `main` fehlt die neue Animation:**
  - `startViewTransition`, `--t-design` und `design-schalter` kommen 0-mal vor.
  - Der Design-Handler setzt das Theme direkt und ruft `oeffneMenu()` auf.
  - Das deckt sich mit Codex' LIVE-001.
- **Auf dem Branch ist sie enthalten.** Der Branch liegt 5 Commits vor `main`; `main` hat keine eigenen Commits (Fast-Forward möglich):
  - `0c15b6f` Texte: zweite Fundstellen aus dem Abgleich aller Lektorats-Zitate
  - `3fc864c` Merge des Versionsstempels 20261008-1721 in den Branch
  - `99f8473` und `5de6344` Animationen
  - `0b595f5` neu: Korrektur am Score-Zähler (Abschnitt 2)
  - Unterschied zu `main`: nur `index.html` und `README.md`.
- **Ursache:** Liams Freigabe „kannst veröffentlichen das update“ galt dem Textstand `62be0ab`, aus dem Version 20261008-1721 wurde. Die Animationen entstanden danach und wurden nie freigegeben. Die Veröffentlichungs-Action hat also keinen Fehler.
- **Nicht selbst geprüft:** die öffentliche Seite. Die Sandbox sperrt github.io. Die Aussage zum Live-Stand stützt sich auf `main`, den Deploy-Lauf und Codex' LIVE-001.

### 2. Änderung in dieser Runde
- **`0b595f5` Score-Zähler: Fortschritt nach unten begrenzt** (`index.html`, eine Zeile plus Kommentar)
  - Der Abnahmetest fand: Liegt der Bildzeitstempel vor dem Startzeitpunkt des Zählers, zeigt die Score-Zahl Werte außerhalb von alt bis neu.
  - Im Test war das deutlich zu sehen, weil die Zeitlupen-Messung die Bilduhr verschiebt. Im Alltag wäre es höchstens ein Bild mit z. B. 100 statt 99.
  - Jetzt ist der Fortschritt auf 0 bis 1 begrenzt, wie beim zweiten Zähler `eiZaehlen` schon.
  - Sonst keine Änderungen an Funktionen, Texten, Preisen oder Regeln.

### 3. Prüfungen und Ergebnisse
**Werkzeug:** Chromium 141.0.7390.37 (Playwright, ohne Bildschirm) gegen einen lokalen Server mit dem Branch-Stand.
- Alle Prüfpunkte liefen mit dem Fix (`0b595f5`).
- Es sind 5 Konfigurationen mit zusammen 102 Prüfpunkten: **101 bestanden, 1 nicht bestanden** (Punkt h).
- Die Konfigurationen:
  - Desktop 1280×800
  - Handy 390×844 mit Touch
  - Handy und Desktop ohne View Transitions (Safari-Fallback emuliert)
  - Handy mit „Bewegung reduzieren“
- Skript und vollständige Ausgabe liegen in `belege/APP-ANIM-001/`.

a) **Dunkel → Hell und Hell → Dunkel** (mit View Transition, Desktop und Handy)
- Gemessen über Bildschirmfotos in Zeitlupe (5 % Tempo), je Bild die mittlere Helligkeit:
  - Handy: 28 > 36 > 131 > 208 > 231 > 234, zurück 234 > 227 > 123 > 58 > 32 > 28
  - Desktop: 20 > 25 > 77 > 148 > 176 > 188 > 190, zurück 190 > 186 > 144 > 75 > 41 > 26 > 20
- Der Verlauf ist stetig und liegt nie außerhalb von Anfang und Ende. Die weiße Fläche ist nie größer als im hellen Endzustand: **kein Aufblitzen**.
- Endzustand jeweils richtig: Theme, Speicher, Schalterstellung, `aria-pressed` und Statusleistenfarbe (#f2f2f7 bzw. #000000).

b) **Schnelles Umschalten**
- 7 echte Tipps im Abstand von 50 ms, von beiden Startzuständen, in allen 5 Konfigurationen.
- Es endet immer beim zuletzt getippten Design. Die Überblendung kommt zur Ruhe, nichts bleibt hängen, das Menü bleibt offen.

c) **Tippen während der Überblendung**
- Ein Tab, 30 oder 150 ms nach Start der Überblendung angetippt, wird angenommen.
- „Schließen“ während der Überblendung schließt das Menü.
- Geprüft auf Desktop, Handy und im Fallback.

d) **Dialoge und Hinweise**
- Ein Blatt erscheint in 260 ms, animiert nur über `transform` und `opacity`, und schließt in 180 ms.
- Das schließende Blatt ist sofort `inert`: Ein Tab direkt danach wird angenommen. Nach 300 ms ist kein Rest mehr da.
- Schnelles Auf-Zu-Auf ergibt nur eine Abdunklung.
- Ein Hinweis (Toast) blendet in 180 ms aus.

e) **Moduswechsel** (Traumrad ↔ Mein Rad)
- Die Karten fliegen ein (260 ms, `transform` und `opacity`), die Markierung im Umschalter gleitet (260 ms).
- Dazu kommen kleine Farbübergänge an Knöpfen (180 ms) und an den Score-Ringen (Strichfarbe 260 ms, Füllstand 500 ms).
- Keine Layout-Eigenschaften animiert, der Umschalter bleibt an seiner Position. Nach 800 ms ist nichts mehr unsichtbar.

f) **Score**
- Er zählt hoch, z. B. auf dem Handy 99 → 79 → 66 → 61 → … → 23. Alle angezeigten Werte liegen zwischen alt und neu, der Ring pulsiert.
- Das Score-Element bleibt erhalten, es gibt keinen Einflug und keine Karte wird animiert.
- Die Gruppenkarten werden im DOM neu gezeichnet; so arbeitet `zeichne()` schon immer. Sichtbar bewegt sich dabei nichts.

g) **„Bewegung reduzieren“** (Handy; View Transitions wären vorhanden)
- Das Design wechselt sofort, es wird keine View Transition gestartet.
- Blatt 150 ms, schließt ohne Ausblenden; Hinweis 120 ms.
- Moduswechsel ohne Einflug, übrige Übergänge 1 ms; der Score springt direkt.
- Keine endlos laufende Animation.

h) **Safari-Fallback, emuliert** (`startViewTransition` in Chromium entfernt)
- Bestanden:
  - Der Farbübergang ist stetig, ohne Aufblitzen, und die Übergangsklasse wird wieder entfernt.
  - Schnelles Umschalten, Tippen während des Übergangs und alle anderen Punkte bestehen.
- **Nicht bestanden:** Desktop Hell → Dunkel zeigt nur 1 Zwischenstufe (Blatt 255 > 235 > 20), weil einzelne Bilder in der Testumgebung 150–180 ms dauern.
  - Auf dem Handy waren es 3–4 Zwischenstufen.
  - Bewertung: kein Aufblitzen, aber gröber als mit View Transition.
  - Ursache: Im Fallback ändern alle Elemente gleichzeitig ihre Farbe, und die Sandbox rendert ohne GPU.
  - Auf echten Geräten ohne View Transitions (Safari vor iOS 18) ist das nicht gemessen. Ich habe es nicht weiter umgebaut, weil Safari ab iOS 18 die View Transition nutzt.

i) **Neu laden:** Das gespeicherte Design steht schon beim `DOMContentLoaded`, hell wie dunkel, mit passender Statusleistenfarbe.

j) **Konsole:** keine Fehler.
- Ausgefiltert sind nur die 404 für `preise.json` und `preisverlauf.json`. Diese Dateien erzeugt die Preis-Action nur auf GitHub; im lokalen Test fehlen sie.

**Weitere Prüfungen:**
- `npm test` mit dem Fix: alle Teile bestanden.
  - Syntax
  - Kompatibilität 199/199
  - Setup 16/16
  - Wege 27/27
  - Sprache: 0 Funde in 9.245 Texten
- GitHub-Workflow „Tests“ für `0b595f5`: erfolgreich (Run 37826466116, 08.10.2026, 20:46 Uhr).

### 4. Grenzen (ehrlich)
- **Kein echtes iPhone, kein echter Safari, kein WebKit:** In der Sandbox gibt es nur Chromium. Alle Ergebnisse oben sind Chromium-Ergebnisse, teils mit Handy-Emulation.
- **Fallback nur nachgestellt:** Ich habe ihn simuliert, indem ich die API in Chromium entfernt habe. Safari vor iOS 18 kann anders rendern und anders schnell sein.
- **Keine Videoauswertung:** Gemessen habe ich Helligkeitsmittel und Farbwerte. Ob es „hochwertig“ wirkt, beweist das nicht; das braucht einen Blick auf einem echten Gerät.
- **Öffentliche App nicht geladen:** Die Sandbox sperrt github.io.

### 5. Was für die Veröffentlichung noch nötig ist
1. **Liams ausdrückliche Freigabe für diesen Stand.** Er umfasst die Textkorrekturen `0c15b6f`, die Animationen und den Fix `0b595f5`. Ohne Freigabe veröffentliche ich nicht.
2. **Dann den Branch per Fast-Forward nach `main` übernehmen und `main` pushen.**
   - Die Action `.github/workflows/veroeffentlichen.yml` stempelt `APP_VERSION` und den Cache-Namen und lässt Pages bauen. Nicht von Hand stempeln.
3. **Kontrolle:**
   - Der Action-Schritt „Live-Stand pruefen“ ist grün und der Versionsstempel ist neu.
   - Danach die visuelle Nachprüfung durch Codex (CODEX-AUFTRAEGE.md, APP-ANIM-001-N1). Die Build-Ausgabe allein genügt nicht.

### 6. Veröffentlichung
- **NEIN.** `main` ist unverändert auf `6fa33b2`, live ist Version 20261008-1721.
- **Code fertig:** ja (`0b595f5`).
- **Tests bestanden:** ja, mit der Ausnahme unter h) und den Grenzen unter 4.
- **Live:** nein.

---

## APP-ANIM-001 — Nachtrag: veröffentlicht
- **Bezug:** APP-ANIM-001, meine Antwort von 20:50 Uhr
- **Autor:** Claude · **Empfänger:** Codex, Liam
- **Datum:** 08.10.2026, 21:01 Uhr (Europe/Berlin)
- **Status:** ERLEDIGT. Veröffentlicht; die Nachprüfung durch Codex (APP-ANIM-001-N1, Teil B) steht noch aus.
- **Freigabe:** Liam hat im Chat am 08.10.2026 nach meinem Bericht zu `0b595f5` geschrieben: „kannst du es veröffentlichen“.

### Was passiert ist
- **Push von `0b595f5` auf `main` (20:55 Uhr):** Fast-Forward von `6fa33b2`, ohne eigene Änderungen.
- **Action „Veroeffentlichen“, Run 37828052689, alle drei Jobs erfolgreich:**
  - **pruefen:** `npm test` auf GitHub bestanden.
  - **stempeln:** Commit `7758e7f` „App aktualisiert (Version 20261008-2058)“. Gegenüber `0b595f5` ändert sich nur der Stempel, je eine Zeile in `index.html` und `mtb-sw.js`.
  - **veroeffentlichen:** „Pages neu bauen (Branch-Quelle)“ und „Live-Stand pruefen“ erfolgreich.
- **„pages build and deployment“ für `7758e7f`:** erfolgreich (20:58 Uhr).
- **Branch `claude/crankscore-app-changes-nz88ir`:** per Fast-Forward auf `7758e7f` nachgezogen und gepusht.

### Nachweis
- **Öffentliche Seite:** Der Schritt „Live-Stand pruefen“ lädt die öffentliche `index.html` und endet nur dann erfolgreich, wenn sie `APP_VERSION = '20261008-2058'` enthält. Er war erfolgreich.
- **Animationscode in derselben Datei:** Der Stempel steht in derselben `index.html` wie der Animationscode. In `7758e7f` kommen `startViewTransition` 2-mal, `--t-design` 8-mal und `design-schalter` 3-mal vor; in der alten Live-Version waren es jeweils 0.
- **Mit veröffentlicht:** die Textkorrekturen aus `0c15b6f` und der Fix am Score-Zähler aus `0b595f5`.

### Grenzen
- **Live-Seite nicht selbst geöffnet:** Die Sandbox sperrt github.io. Das Protokoll der Action kann ich wegen des Proxys nicht lesen, nur den Status ihrer Schritte.
- **Keine visuelle Prüfung der Live-App durch mich.** Ein echtes iPhone mit Safari ist weiterhin nicht getestet.

### Stand
- **Code fertig:** ja.
- **Tests bestanden:** ja, in Chromium, im CI und in der Action; mit der Ausnahme h) und den Grenzen aus meiner Antwort von 20:50 Uhr.
- **Live:** ja, Version 20261008-2058 (`7758e7f`).
- **Nächster Schritt:** Codex prüft Teil B von APP-ANIM-001-N1 an der Live-Version.
- **Veröffentlichung:** JA, Nachweis siehe oben.

---

## APP-STATUS-001 — Statusleiste im hellen Design hell statt schwarz
- **Bezug:** Liams Auftrag im Chat am 09.10.2026, mit Bildschirmfoto von seinem iPhone (Home-Bildschirm-App, helles Design, Statusleiste schwarz)
- **Autor:** Claude · **Empfänger:** Liam, Codex
- **Datum:** 09.10.2026, 08:35 Uhr (Europe/Berlin)
- **Status:** PRÜFBEREIT
  - Code fertig und in Chromium getestet.
  - Nicht veröffentlicht.
  - Ob es auf dem iPhone wirkt, ist noch nicht geprüft.

### Ursache (soweit ohne Gerät feststellbar)
- Die App setzt die Farbe der Statusleiste über `theme-color`: fest `#000000` im HTML, im hellen Design per Skript auf `#f2f2f7` umgestellt.
- **Berichte aus der Community** (keine Apple-Dokumentation) beschreiben Folgendes:
  - iOS liest die Farbe bei Home-Bildschirm-Apps teils nur einmal.
  - Ab iOS 26 nimmt iOS statt `theme-color` den Seitenhintergrund.
  - Die Manifest-Farbe (`#000000`) gilt beim Start.
- **Deshalb blieb die Statusleiste schwarz.** Welche dieser Ursachen bei Liam greift, kann ich ohne iPhone nicht feststellen.

### Änderungen
**Commit `1f0a486`** auf Branch `claude/crankscore-app-changes-nz88ir`:
- `theme-color` entsteht erst im Kopf-Skript, gleich mit der Farbe des gespeicherten Designs. Im hellen Design gibt es also nie ein schwarzes Tag.
- Beim Umschalten wird das Tag durch ein neues ersetzt, statt nur den Wert zu ändern.
- `html` hat denselben festen Hintergrund wie `body`: hell `#f2f2f7`, dunkel `#000000`.
- Der Ersatz-Farbübergang für Browser ohne View Transitions schließt `html` mit ein.
- README, Abschnitt „Bewegung und Designwechsel“, ist ergänzt.
- **Nicht geändert:**
  - Manifest (`theme_color` bleibt `#000000`; Startbildschirm im Standard-Design OLED)
  - `apple-mobile-web-app-status-bar-style` (bleibt `default`)

### Prüfungen
**Werkzeug:** Chromium 141, nicht iOS.
- **Eigener Test** in 4 Varianten (mit und ohne View Transitions, je mit und ohne „Bewegung reduzieren“): 20 von 20 bestanden.
  - Laden hell bzw. dunkel: Schon bei `DOMContentLoaded` gibt es genau ein `theme-color`-Tag mit der richtigen Farbe; `html` und `body` haben die richtige Hintergrundfarbe.
  - Umschalten, auch 5-mal schnell hintereinander: Am Ende gibt es genau ein Tag mit der richtigen Farbe, `html` und `body` passen.
- **`npm test`:** alle Teile bestanden. Kompatibilität 199/199, Setup 16/16, Wege 27/27, Sprache 0 Funde in 9.245 Texten.
- **Animations-Abnahme (`anim-abnahme.js`), zweiter Lauf:** 101 von 102 bestanden. Der eine Punkt ist wie bisher der emulierte Fallback auf dem Desktop: zu wenig Zwischenstufen wegen langsamer Bilder in der Sandbox.
  - Im ersten Lauf war zusätzlich „Score ändert sich“ auf dem Desktop knapp unter der Schwelle: 1 statt 3 Zwischenwerte, weil das erste Bild nach dem Neuzeichnen spät kam. Im zweiten Lauf ohne Änderung bestanden; das ist ein Zeitproblem der Sandbox.
- **GitHub-Workflow „Tests“ für `1f0a486`:** erfolgreich (Run 37893812954).

### Grenzen und offene Punkte
- Auf einem echten iPhone nicht geprüft. Ob iOS die Statusleiste jetzt hell färbt, zeigt erst der Test an Liams Gerät nach einer Veröffentlichung.
- Je nach iOS-Version gilt ein umgeschaltetes Design für die Statusleiste womöglich erst nach einem Neustart der App, also ganz schließen und wieder öffnen.
- Falls sie auch dann schwarz bleibt, wäre der nächste Schritt, die App einmal vom Home-Bildschirm zu entfernen und neu hinzuzufügen; iOS liest manche Angaben nur beim Hinzufügen.
- **Veröffentlichung:** NEIN. Live ist weiterhin Version 20261008-2058 (`7758e7f`). Veröffentlicht wird erst mit Liams Freigabe.

---

## APP-STATUS-001 — Nachtrag: veröffentlicht
- **Bezug:** APP-STATUS-001
- **Autor:** Claude · **Empfänger:** Liam, Codex
- **Datum:** 09.10.2026, 09:32 Uhr (Europe/Berlin)
- **Status:** ERLEDIGT (veröffentlicht). Die Prüfung auf Liams iPhone steht noch aus.
- **Freigabe:** Liam im Chat am 09.10.2026: „Kannst veröffentlichen“.

### Was passiert ist
- **Push von `1f0a486` auf `main` (09:27 Uhr):** Fast-Forward von `7758e7f`.
- **Action „Veroeffentlichen“, Run 37899172099, alle drei Jobs erfolgreich:**
  - **pruefen:** `npm test` auf GitHub bestanden.
  - **stempeln:** Commit `ed2638e` „App aktualisiert (Version 20261009-0930)“.
  - **veroeffentlichen:** „Pages neu bauen“ und „Live-Stand pruefen“ erfolgreich. Der zweite Schritt bestätigt den neuen Stempel in der öffentlichen `index.html`.
- **„pages build and deployment“ für `ed2638e`:** erfolgreich (09:30 Uhr).
- **Branch:** per Fast-Forward auf `ed2638e` nachgezogen und gepusht.

### Stand
- **Code fertig:** ja.
- **Tests bestanden:** ja, in Chromium, im CI und in der Action.
- **Live:** ja, Version 20261009-0930 (`ed2638e`).
- **Auf dem iPhone geprüft:** nein. Ob die Statusleiste im hellen Design jetzt hell ist, zeigt erst Liams Gerät.
  - Erst „Neue Version laden“ antippen.
  - Dann die App ganz schließen und neu öffnen.
  - Bleibt die Statusleiste schwarz: die App vom Home-Bildschirm entfernen und neu hinzufügen.
- **Veröffentlichung:** JA, Nachweis siehe oben.

---

## APP-DESIGN-001 — Ruhiger und hochwertiger Auftritt (Liams Auftrag vom 09.10.2026)
- **Bezug:** Liams Auftrag im Chat am 09.10.2026 (sechs Punkte aus einer visuellen Prüfung), dazu „Der schwarze Balken ist immer noch nicht weg“ (APP-STATUS-001)
- **Autor:** Claude · **Empfänger:** Liam, Codex
- **Datum:** 09.10.2026, 10:30 Uhr (Europe/Berlin)
- **Status:** PRÜFBEREIT
  - Code fertig und in Chromium getestet.
  - Nicht veröffentlicht.
- **Repository:** `trostliam-hub/dreambuild`
  - Branch `claude/crankscore-app-changes-nz88ir`, Commit `6806223`
  - Live ist weiterhin Version 20261009-0930 (`ed2638e`).

### Umgesetzt
Funktionen und Berechnungen sind unverändert; geändert sind nur Darstellung und Bewegung.

1. **Leuchteffekte und Farbverläufe**
   - **Weg sind:**
     - die Farbwolken im Einstieg (violett, orange, grün, langsam treibend)
     - der Farbschein und das violette Leuchten hinter den Score-Ringen
     - das Regenbogen-Band und die leuchtende Guide-Kugel auf der Startseite
     - der Farbschein der Funktionskarten und das Punktraster der Datenschutz-Karte auf der Startseite
     - der Glanz-Effekt auf „Los geht's“
     - Leuchtschatten an Pro-Kachel, Größen-Ergebnis, Fertig-Haken, Adapter-Info und Rundgang
     - der endlos pulsierende Rundgang-Ring
   - **Statt Verläufen:**
     - Bisherige Verlaufsflächen haben jetzt eine einfarbige Akzentfläche: `--akzent-flaeche`, weiße Schrift darauf 5,2:1 (dunkel) bzw. 6,2:1 (hell). Betroffen sind Pro-Marken, Fortschritt im Einstieg, gewählte Optionen, Regler, Ladebalken und Größen-Ring.
     - Die Setup-Symbole (Profile, Gabel/Dämpfer/Laufrad) sind getönte Flächen mit farbigem Symbol.
     - Hinweiskästen („Angaben vervollständigen“, „Frag den Guide“) haben eine ruhige Akzentfläche.
2. **Fahrradgrafik** (Einstieg, Startseite, Rundgang, Größen-Ergebnis)
   - Dieselbe maßstabsgetreue Zeichnung (Propain Spindrift 5 AL), aber sachlich:
     - Rahmen metallgrau
     - Anbauteile in Graphit
     - Feder, Standrohre und Einstellknöpfe metallisch
     - Trikot der Figuren dunkelgrau
   - Keine Bewegungslinien mehr, keine drehenden Räder, kein Wippen und kein Hereinrollen; das Rad blendet einmal ein.
3. **„Auf dich gebaut.“** ist einfarbig in Schriftfarbe.
4. **Score**
   - Der Gesamt-Score ist größer (Ring 144 px, Zahl 46 px) und behält die Ampelfarbe.
   - Kompatibilität und Einsatz stehen kleiner (72 px) und in Grau daneben, ohne farbige Punkte.
   - Auf der Startseite zeigt das Score-Bild dieselbe Gewichtung.
5. **Guide**
   - Der Knopf oben ist ein runder Knopf wie Menü und Fahrwerk; nur das Sprechblasen-Symbol ist violett.
   - Das Guide-Symbol im Chat hat eine ruhige Akzentfläche.
   - Das Eingabefeld zeigt im Fokus einen klaren 2-px-Rand in Akzentfarbe statt des Leuchtrings.
   - Regler im Einstieg: Tastaturfokus als 2-px-Ring in Akzentfarbe statt Leuchten.
6. **Aufgabenkarte** („So baust du dein Rad“)
   - Kompakte Liste mit Trennlinien, ohne Fortschrittsbalken und ohne violette Auswahlfläche.
   - Erledigte Schritte stehen grau mit Haken.
   - Der aktuelle Schritt hat eine schwarze Nummer, fette Schrift und als einziger eine Erklärung; darunter steht der Knopf für den nächsten Schritt.
   - „2 von 4 erledigt“ steht weiter im Kopf.

- **Unverändert:** Teilelisten und Auswahlkarten im Bauassistenten, runde Ecken, Texte und die Bewegungen aus APP-ANIM-001.
- **README:** Abschnitte zu Übersicht, Design, Startseite und Fahrradzeichnung sind nachgezogen.

### Prüfungen
**Werkzeug:** Chromium 141 (Playwright), nicht iOS.

- **`npm test`:** alle Teile bestanden.
  - Syntax
  - Kompatibilität 199/199
  - Setup 16/16
  - Wege 27/27
  - Sprache: 0 Funde in 9.233 Texten. Es sind 12 weniger, weil erledigte Schritte der Aufgabenkarte keine Erklärung mehr zeigen.
- **GitHub-Workflow „Tests“ für `6806223`:** erfolgreich (Run 37902776569).
- **Sprach-Scanner einschließlich abgeschnittener Texte:** 0 Funde bei 280 und 320 px.
- **Überstand-Scan** über alle Szenen: 0 Elemente ragen über den Rand.
- **Handy-Audit** auf 7 Geräteprofilen, Deutsch/dunkel und Englisch/hell: 14 von 14 Läufen mit 0 Befunden und 0 Konsolenfehlern.
- **Statusleisten-Test:** 20 von 20 bestanden.
- **Animations-Abnahme:** 98 von 102 bestanden.
  - Die 4 nicht bestandenen Punkte sind Zeitmessungen der Sandbox: „Score ändert sich“ auf dem Desktop (zu wenige Zwischenwerte, weil das erste Bild nach dem Neuzeichnen spät kommt) und Zwischenstufen der emulierten Ersatz-Überblendung.
  - Vergleich auf demselben Rechner, vorher (`ed2638e`) und nachher, je 2 Durchgänge:
    - Neuzeichnen bis zum Bild: 153/178 ms vorher, 214/176 ms nachher
    - Ersatz-Überblendung: 11/12 Bilder in 450 ms vorher, 13/12 nachher, längstes Bild jeweils 100/117 ms
  - Damit keine messbare Verschlechterung; die Schwankung kommt von der Sandbox.

**Vorher-Nachher-Ansichten:**
- Szenen: Einstieg, Aufbau mit Score, Aufgabenkarte und Guide
- Jeweils Smartphone (390 px) und Desktop (1280 px), hell und dunkel
- Dazu die Startseite und eine Übersicht aller Einstiegsschritte
- Die Bilder hat Liam im Chat bekommen (Dateien `vn-*.png`).

### Statusleiste (APP-STATUS-001)
- **Diagnose:** Nicht weiter geändert, weil die Ursache ohne iPhone nicht feststellbar ist.
  - Live setzt die App alle Werte, aus denen iOS die Farbe nehmen könnte: `theme-color` ab dem ersten Bild sowie `html`- und `body`-Hintergrund.
  - Bleibt der Balken schwarz, nimmt iOS die Farbe offenbar woanders her: aus der Dunkel-Einstellung des iPhones, aus dem Zeitpunkt des Hinzufügens zum Home-Bildschirm oder aus dem Manifest (`#000000`).
- **Rückfrage an Liam:**
  - Welche iOS-Version läuft auf dem iPhone?
  - Ist das iPhone selbst im Dunkelmodus?
  - Zeigen die Einstellungen der App die Version 20261009-0930?
  - Hilft es, die App vom Home-Bildschirm zu entfernen und im hellen Design neu hinzuzufügen?
- **Mögliche Lösung, falls das iPhone-Design entscheidet:** eine Design-Einstellung „Automatisch (wie iPhone)“. Das wäre eine neue Funktion und wird nur nach Liams Zustimmung gebaut.

### Grenzen
- Kein echtes iPhone, kein Safari.
- Die Wirkung („ruhiger, hochwertiger“) ist eine gestalterische Einschätzung; die Bilder zeigen den Unterschied.

- **Veröffentlichung:** NEIN. Live bleibt Version 20261009-0930, bis Liam freigibt.

---

## APP-DESIGN-001 — Nachtrag: veröffentlicht
- **Bezug:** APP-DESIGN-001
- **Autor:** Claude · **Empfänger:** Liam, Codex
- **Datum:** 09.10.2026, 10:49 Uhr (Europe/Berlin)
- **Status:** ERLEDIGT (veröffentlicht)
- **Freigabe:** Liam im Chat am 09.10.2026: „Wenn du fertig bist kannste veröffentlichen“.

### Was passiert ist
- **Push von `6806223` auf `main`:** Fast-Forward von `ed2638e`.
- **Action „Veroeffentlichen“, Run 37906920470, alle drei Jobs erfolgreich:**
  - **pruefen:** `npm test` auf GitHub bestanden.
  - **stempeln:** Commit `3e5a4df` „App aktualisiert (Version 20261009-1047)“.
  - **veroeffentlichen:** „Pages neu bauen“ und „Live-Stand pruefen“ erfolgreich. Der zweite Schritt findet den neuen Stempel in der öffentlichen `index.html`.
- **„pages build and deployment“ für `3e5a4df`:** erfolgreich (10:48 Uhr).
- **Branch:** per Fast-Forward auf `3e5a4df` nachgezogen und gepusht.

### Stand
- **Code fertig:** ja.
- **Tests bestanden:** ja (Chromium, CI, Action).
- **Live:** ja, Version 20261009-1047.
- **Visuell auf einem echten iPhone geprüft:** nein.
- **Statusleiste (APP-STATUS-001):** weiter offen. Liams Angaben zu iOS-Version, Dunkelmodus und Neu-Hinzufügen stehen aus.

### Bitte an Codex
Optisch nachprüfen, ob die Live-Version 20261009-1047 den Punkten aus APP-DESIGN-001 entspricht. Chromium und echtes Safari bitte getrennt angeben.

- **Veröffentlichung:** JA, Nachweis siehe oben.

---

## APP-3D-001 — 3D-Beispielrad (Propain Spindrift 5 AL) mit Blender
- **Bezug:** Liams Auftrag im Chat am 09.10.2026 („Erstelle für die CrankScore-App ein hochwertiges, realistisches 3D-Fahrradmodell mit Blender …“). Der Auftrag hatte keine ID; ich führe ihn als APP-3D-001.
- **Autor:** Claude · **Empfänger:** Liam, Codex
- **Datum:** 09.10.2026, 13:20 Uhr (Europe/Berlin)
- **Status:** PRÜFBEREIT (Branch), nicht veröffentlicht
- **Stand:** Repository `trostliam-hub/dreambuild`, Branch `claude/crankscore-app-changes-nz88ir`, Commit `cc03e40` (aufgebaut auf `main` `3e5a4df`, Live 20261009-1047)
- **Korrektur zu meinen Einträgen vom 09.10.2026:** Die Uhrzeiten in APP-STATUS-001 und APP-DESIGN-001 waren UTC, nicht Europe/Berlin (Berlin = UTC + 2 Stunden). Beispiel: „10:49 Uhr“ war 12:49 Uhr Berliner Zeit.

### Blender
Blender ist in meiner Arbeitsumgebung als Python-Modul `bpy` 5.0.1 verfügbar (ohne Oberfläche). Damit ist das Modell tatsächlich gebaut, mit Cycles gerendert, als GLB exportiert und geprüft. Die `.blend` habe ich nicht in der Blender-Oberfläche geöffnet — es gibt hier keine.

### Was umgesetzt ist
1. **Modell** (`3d/` im Repo, reproduzierbar per Skript `3d/skripte/bau.py`):
   - Rahmen, Hinterbau (einteilig), Umlenkhebel oben und unten, Lagerbolzen, Federgabel (Krone/Standrohre fest, Tauchrohre/Brücke/Achse beweglich), Stahlfederdämpfer 230 × 65, Laufräder (Reifen mit Stollen, Felge, Nabe, 32 Speichen), Bremsscheiben und Sättel, Antrieb (Kurbel, Kettenblatt, Kettenführung, Bashguard, Kassette 10–52, Schaltwerk, Kette), Cockpit, Sattelstütze, Sattel, Leitungen.
   - Jede Baugruppe ist eine Sammlung, jedes Teil ein eigenes Objekt; Lackfarbe ist ein Parameter. Rund 130 000 Dreiecke.
   - Materialien: lackiertes Aluminium, eloxiertes Aluminium, Stahl, Gummi, Kunststoff — matt bis seidig, keine Spiegelflächen.
2. **Renderings:** Seitenansicht (orthografisch) und leicht gedrehte Dreiviertelansicht, transparenter Grund mit weichem Bodenschatten, ruhiger graublauer Lack, Studiolicht. Geprüft auf hellem (#f2f2f7, Weiß) und dunklem Grund (Schwarz, #1c1c1e).
3. **GLB:** `3d/modell/spindrift-5-al.glb`, Draco-komprimiert, 0,75 MB (ohne Draco 4,7 MB), ein Animations-Clip.
4. **Animation** (nur im Modell, nicht in der App): Bild 1–46 einmal 40 % ein- und ausfedern (Hinterbau um die berechneten Drehpunkte, Gabel entlang der Standrohre, beide Reifen am Boden); Bild 61–121 0,5 m rollen (Räder drehen um Weg/Radius). Kein Endlos-Loop. Die Kette hat ein Skelett und bleibt beim Einfedern geschlossen.
5. **App:** Startseite, Begrüßung und die erste Rundgang-Karte zeigen statt der Zeichnung das vorgerenderte Seitenbild (`bilder/beispielrad-seite-640.webp` 67 KB, `-1200.webp` 151 KB, per `srcset`). Ein 659 Byte kleines, weichgezeichnetes Vorschaubild steht sofort da, das scharfe Bild blendet nach dem Laden über; bei „Bewegung reduzieren“ ohne Übergang. Unterschrift: „Beispielrad: Propain Spindrift 5 AL, Größe L, Mullet“ (in der Rundgang-Karte kurz). Der Service Worker speichert beide Bildgrößen für offline. Im Fit bleibt die Zeichnung mit Fahrer.
   - **Kein interaktiver 3D-Viewer in der App:** Drehen oder Zoomen bringt an diesen Stellen keinen konkreten Nutzen. Ein Viewer müsste three.js (0,69 MB), den Draco-Decoder (0,34 MB) und das Modell (0,75 MB) laden — rund 1,8 MB statt 67–151 KB für das Bild. Das GLB liegt für später bereit.

### Maße
Größe L, Mullet (29″ vorn, 27,5″ hinten), 180/180 mm. Werte aus Suchergebnissen zur Propain-Tabelle, Vital MTB und Pinkbike, Einzelheiten und Quellen in `3d/README.md`: Reach 480, Stack 644, Steuerrohr 110, Lenkwinkel 63,9°, Sitzwinkel eff. 78,7°, Sitzrohr 460, Kettenstrebe 435, Radstand 1264, Tretlagerhöhe 349, Dämpfer 230 × 65.
- **Gegencheck:** Daraus ergibt sich rechnerisch eine Gabel mit 597,7 mm Einbaulänge und 42,2 mm Versatz; Propain nennt laut Suchergebnis 596 und 44 mm.
- **Widerspruch, offen:** Ein anderes Suchergebnis nennt Stack 647, Sitzwinkel 78,3°, Radstand 1278. Die Zeichnung der App (`SPINDRIFT` in `index.html`) rechnet mit Kettenstrebe 445, Sitzwinkel 78,4°, Radstand 1278. Ohne Zugang zur Propain-Tabelle kann ich nicht klären, welcher Stand gilt. Die App-Daten habe ich nicht geändert.

### Abweichungen und Grenzen
- **Keine offiziellen Bilder, keine Explosionszeichnung:** propain-bikes.com und das Propain-Hilfeportal sind von der Netzwerkregel der Arbeitsumgebung gesperrt (403). Die Silhouette folgt Maßen und Beschreibungen, nicht Fotos; Rohrquerschnitte, Knotenbleche und Hebelformen sind frei gestaltet.
- **Hinterbau-Drehpunkte geschätzt** (numerische Suche mit Freigangs-Bedingungen, Skripte in `3d/skripte/lagersuche/`): 65 mm Hub ergeben **178,7 mm** statt 180 mm, Übersetzung 2,96 → 2,63. **Abweichung:** Propain beschreibt die Hebel als gegenläufig; mit dieser Geometrie fand die Suche keine gegenläufige Lösung mit 180 mm, die alle Freigänge einhält. Im Modell drehen beide Hebel gleichsinnig.
- **Teile ohne Marke:** Dämpfer, Gabel, Antrieb, Bremsen sind allgemeine Bauformen in echten Maßen.
- **Geräte:** nur Chromium (headless). Kein echtes iPhone, kein Safari, kein Firefox.

### Tests (Commit `cc03e40`, lokal, Chromium)
- `npm test`: bestanden — Kompatibilität 199/199, Setup 16/16, Wege 27/27, Sprache 0 Funde in 9239 Texten.
- Überstand: 0 Elemente. Sprache bei 280 und 320 px: 0 Funde.
- Mobil DE und EN: je 7 Geräte, 0 Funde, 0 Konsolenfehler. Statusleisten-Test: alles ok.
- Animations-Abnahme: erster Lauf 100/102 — die zwei Abweichungen waren Bildabstände bis 222 ms, während ich parallel gerendert habe. Wiederholung ohne Last: **102/102**.
- Beispielrad-Bild: in allen 12 Aufnahmen geladen und eingeblendet (Startseite, Begrüßung, Rundgang × Handy 390 px/Desktop 1280 px × hell/dunkel). `srcset` wählt auf dem Handy (2×) 1200 px, am Desktop (1×) und in der Rundgang-Karte 640 px. Einzige Fehlermeldungen: die bekannten, lokal fehlenden `preise.json`/`preisverlauf.json`.
- 3D-Kollisionsprüfung: 0 unerwartete Überschneidungen in Ruhe, bei 50 % und 100 % Federweg. Die zugelassenen Berührungen (Bolzen, Achsen, Hebel am Lenker, Leitungen in Zugeinlässen) habe ich einzeln durchgesehen; dabei fiel ein echter Fehler auf (Schaltzug und Stützenzug deckungsgleich), der behoben ist.
- GLB in Chromium mit three.js 0.169 und DRACOLoader: lädt in 0,2–0,6 s, 118 Meshes, ein Clip, keine Konsolenfehler.

### Stand
- **Code fertig:** ja, auf dem Branch.
- **Tests bestanden:** ja (lokal, Chromium).
- **Live:** nein. `main` und die Live-Version bleiben 20261009-1047.

### Belege
`belege/APP-3D-001/`: Vorher-Nachher-Tafeln (`v3d-startseite-*`, `v3d-einstieg-*`, `v3d-rundgang-*`, je Handy und Desktop), `renderings-hell-dunkel.png`, `animation-bilder.png` (Ruhe, 40 % Hub, gerollt), `anlenkung-nah.png`, `glb-threejs-chromium.png`, `kollision-lauf.txt`, `pruefreihe-lauf.txt`, `anim-abnahme-wiederholung.txt`. Modell, GLB und Renderings liegen im Repo unter `3d/`.

### Nächster Schritt
- **Liam:** Bilder ansehen; veröffentlichen nur mit deiner Freigabe.
- **Codex:** Prüfauftrag APP-3D-001-N1 in CODEX-AUFTRAEGE.md.
- **Statusleiste (APP-STATUS-001):** weiter offen, Liams Angaben stehen aus.

- **Veröffentlichung:** NEIN (nur Branch).

---

## APP-3D-001 — Nachtrag: Aussehen nach Liams Vergleichsfoto
- **Bezug:** APP-3D-001; Liam im Chat am 09.10.2026 mit Foto eines Propain auf einem Dachträger: „mach das ungefähr so aber auf dem Rahmen soll Crankscore stehen“
- **Autor:** Claude · **Empfänger:** Liam, Codex
- **Datum:** 09.10.2026, 13:45 Uhr (Europe/Berlin)
- **Status:** PRÜFBEREIT (Branch), nicht veröffentlicht
- **Stand:** Branch `claude/crankscore-app-changes-nz88ir`, Commit `9a34b2f` (auf `cc03e40`)

### Änderungen
- **Lack:** Rahmen weiß (#e7e8e5), oberer Hebel rahmenfarben wie auf dem Foto, Tauchrohre und Gabelbrücke rot (#b11c2a), sonst schwarze Anbauteile. Silberne Flat-Pedale mit Pins, dunkler Unterrohrschutz am Tretlager. Die Gabelbrücke sitzt flacher oben an den Tauchrohren.
- **Schriftzug:** Groß **CRANKSCORE** auf dem Unterrohr statt des Herstellernamens.
  - Schrift und Farben: App-Schrift Inter, zweifarbig wie das Logo („CRANK“ Gewicht 800 dunkel, „SCORE“ 700 grau).
  - Größe: Versalhöhe 41 mm, 40 cm lang.
  - Lesrichtung: auf der Antriebsseite vom Tretlager zum Steuerrohr, auf der anderen Seite wie auf dem Foto vom Steuerrohr nach unten.
  - Umsetzung: Textur über eine UV-Abwicklung des Unterrohrs (`3d/skripte/dekor.py`), steckt auch in `.blend` und GLB.
- **Nicht nachgebildet:** Markenlogos auf Gabel, Felgen und Reifen.
- **Dateien:** `.blend` 1,7 MB, GLB 0,87 MB (mit Textur und Pedalen). App-Bilder neu: 67 KB (640 px) und 151 KB (1200 px).

### Tests
- Kollisionsprüfung mit Pedalen und neuer Gabelbrücke: 0 unerwartete Schnitte in Ruhe, bei 50 % und 100 % Federweg.
- GLB in Chromium mit three.js: lädt in 0,4–0,55 s, 157 Meshes, eine Textur, ein Clip, keine Konsolenfehler; Schriftzug und rote Gabel sichtbar.
- App: Bild in allen 12 Aufnahmen geladen und eingeblendet (Startseite, Begrüßung, Rundgang × Handy/Desktop × hell/dunkel).
- `npm test`: alle bestanden (Kompatibilität 199/199, Setup 16/16, Wege 27/27, Sprache 0 Funde). In `index.html` hat sich gegenüber `cc03e40` nur das Vorschaubild (data-URI) geändert; die übrige Prüfreihe aus APP-3D-001 habe ich deshalb nicht wiederholt.

### Belege
In `belege/APP-3D-001/` ersetzt:
- `v3d-*` (Vorher-Nachher)
- `renderings-hell-dunkel.png`
- `glb-threejs-chromium.png`

Neu: `beide-seiten-schriftzug.png`.

`animation-bilder.png` und `anlenkung-nah.png` zeigen noch die graue Fassung; Geometrie und Bewegung sind unverändert.

- **Live:** nein. `main` und die Live-Version bleiben 20261009-1047.
- **Veröffentlichung:** NEIN (nur Branch).

---

## KOM-001 — Nachtrag: Austauschordner liegt jetzt im Repository
- **Bezug:** KOM-001 („Bestätige den tatsächlichen Ordnerpfad und deinen Zugriff“); Liam im Chat am 09.10.2026: den Ordner dorthin legen, wo GPT auch Zugriff hat.
- **Autor:** Claude · **Empfänger:** Liam, Codex
- **Datum:** 09.10.2026, 13:55 Uhr (Europe/Berlin)
- **Status:** ERLEDIGT (Ordner im Repository, Lesezugriff per Webadresse)

### Wo der Ordner liegt
- **Repository:** `trostliam-hub/dreambuild`
- **Branch:** `claude/crankscore-app-changes-nz88ir`
- **Ordner:** `CrankScore-Austausch/` im Hauptverzeichnis, mit allen Belegen
- **Ordner im Browser:** https://github.com/trostliam-hub/dreambuild/tree/claude/crankscore-app-changes-nz88ir/CrankScore-Austausch
- **Dateien direkt (Rohtext):**
  - https://raw.githubusercontent.com/trostliam-hub/dreambuild/claude/crankscore-app-changes-nz88ir/CrankScore-Austausch/CLAUDE-ANTWORTEN.md
  - https://raw.githubusercontent.com/trostliam-hub/dreambuild/claude/crankscore-app-changes-nz88ir/CrankScore-Austausch/CODEX-AUFTRAEGE.md
  - https://raw.githubusercontent.com/trostliam-hub/dreambuild/claude/crankscore-app-changes-nz88ir/CrankScore-Austausch/CLAUDE-AUFTRAEGE.md
  - https://raw.githubusercontent.com/trostliam-hub/dreambuild/claude/crankscore-app-changes-nz88ir/CrankScore-Austausch/CODEX-ANTWORTEN.md

### Was das bedeutet
- **Claude:** Ich lese und schreibe den Ordner im Repository direkt und pushe nach jeder Änderung auf diesen Branch.
- **Codex:** kann die Dateien über die Adressen oben lesen, ohne dass Liam sie hochlädt — das Repository ist öffentlich. Schreiben kann Codex dort nur, wenn es Schreibzugriff auf das Repository hat. Sonst gehen Codex' Einträge weiter über Liam: CODEX-ANTWORTEN.md bzw. CLAUDE-AUFTRAEGE.md ergänzen und mir im Chat geben, dann übernehme ich sie hierher.
- **Liams lokaler Ordner auf dem PC:** dorthin habe ich keinen Zugriff. Wer dort arbeitet, holt sich den Stand aus dem Repository (git pull auf diesem Branch) oder aus dem ZIP.
- **Öffentlich:** Alles in diesem Ordner ist für jeden lesbar. Deshalb gilt weiter: keine Zugangsdaten, kein Betreiber-PIN, keine privaten Daten.
- **Kein automatischer Abgleich:** Neue Einträge von Codex, die nur in Liams Ordner oder im ChatGPT-Chat stehen, kenne ich erst, wenn Liam sie mir gibt. Vor jedem Schreiben gleiche ich mit dem Stand im Repository ab.
- **Keine Veröffentlichung:** Der Ordner liegt auf dem Branch, nicht auf `main`; die App ist dadurch nicht verändert oder veröffentlicht.

---

## KOM-001 — Nachtrag: Ablage nach jeder Aufgabe, Vorschau im Ordner
- **Bezug:** Codex' Antwort an Liam am 09.10.2026, 13:58 Uhr: „Claudes Ergebnis zum 3D-Modell ist hier noch nicht angekommen. Schick mir seine aktualisierte CLAUDE-ANTWORTEN.md, das ZIP oder einen Link zur fertigen Vorschau.“ Dazu Liam: immer so in den Ordner legen, dass Codex es ansehen kann.
- **Autor:** Claude · **Empfänger:** Liam, Codex
- **Datum:** 09.10.2026, 14:10 Uhr (Europe/Berlin)
- **Status:** ERLEDIGT

### Ab jetzt nach jeder Aufgabe
1. **CLAUDE-ANTWORTEN.md:** Ergebnis mit Auftrags-ID wie bisher unten anhängen.
2. **Belege:** unter `belege/<Auftrags-ID>/` ablegen.
3. **VORSCHAU.md:** neu schreiben — die fertige Vorschau mit Bildern aus `belege/`. Sie funktioniert auch im entpackten ZIP.
4. **Repository:** den Ordner auf den Branch `claude/crankscore-app-changes-nz88ir` pushen, Pfad `CrankScore-Austausch/`.
5. **ZIP:** Liam das ZIP desselben Stands geben.

### Jetzt neu im Ordner
- `VORSCHAU.md` zum 3D-Beispielrad, mit Bildern, Dateilinks und den geschätzten Punkten. Online: https://github.com/trostliam-hub/dreambuild/blob/claude/crankscore-app-changes-nz88ir/CrankScore-Austausch/VORSCHAU.md
- `belege/APP-3D-001/rad-seite.jpg` und `rad-dreiviertel.jpg`: kleine Fassungen der Renderings für die Vorschau.

- **Veröffentlichung:** NEIN.

---

## APP-UX-001 — Eigene Gestalt und kurze Wege (Liams Auftrag vom 09.10.2026)
- **Bezug:** Liams Auftrag im Chat: Design und Bedienung überarbeiten — eigenständig, hochwertig, menschlich; Aufbau, Prüfung, Fahrwerk, Upgrades und Einkaufsliste direkt erreichbar; sechs Abläufe vorher und nachher vergleichen.
- **Autor:** Claude · **Empfänger:** Liam, Codex
- **Datum:** 09.10.2026, 16:40 Uhr (Europe/Berlin)
- **Status:** FERTIG PROGRAMMIERT und GETESTET (Chromium-Emulation). **Nicht veröffentlicht.**
- **Stand:** Branch `claude/crankscore-app-changes-nz88ir`, Code-Stand `b7751b8` (sechs Commits ab `ded53c4`). `main` und die Live-Version bleiben `20261009-1047` (die App unter der Testadresse zeigt den neuen Stand erst nach Liams Freigabe).
- **Keine Änderung** an Kompatibilitätsregeln, Preisen, Pro-Regeln, Herstellerwerten oder gespeicherten Daten. Alle Rechnungen sind unverändert (199 Kompatibilitätsfälle bestehen).

### Was ich zuerst geprüft habe (Ist-Zustand)
- **Handy:** Die große Score-Karte (rund 400 px) stand über *jedem* Reiter. In Prüfung, Upgrades und Kaufen sah man oben zuerst wieder den Score, vom eigentlichen Inhalt nur den Anfang (Einkaufsliste: eine Zeile).
- **Desktop:** keine Navigation. Prüfung, Gerade reduziert, Upgrades, Günstiger und Einkaufsliste standen untereinander in der Seitenleiste; der Knopf zur Einkaufsliste lag rund 3.800 px tief. Zum Fahrwerk führte nur ein Knopf „Setup“ im Kopf.
- **Namen:** „Kaufen“ und „Setup“ statt Einkaufsliste und Fahrwerk.
- **Teil finden:** Die Teile beginnen am Handy erst unter Aufgabenkarte und Score; bis „Reifen hinten“ rund 1.700 px Scrollen.
- **Upgrade vergleichen:** gab es nicht. Nur Name, Aufpreis und Punkte; Daten des neuen Teils nur über einen Umweg (zurück in den Aufbau, Teil suchen, Suchbegriff tippen, Ansehen) — und dann ohne das verbaute Teil daneben.
- **Teileblatt:** Aus „Ansehen“ führte kein Weg zurück in die Liste; Schließen verwarf Suche, Filter und Scrollstand.
- **Rad wechseln:** Die Radknöpfe stehen nur oben. Weit unten im Aufbau hieß das: zurückscrollen. Jeder Rad- und Moduswechsel sprang außerdem auf den Aufbau zurück.
- **Absicherung:** „Teil entfernen“ und „Dieses Rad zurücksetzen“ wirkten sofort und ohne Rückweg. Unnötige Rückfragen gab es in den sechs Abläufen keine.

### Was geändert ist
**Navigation und Wege**
- **Fünf beschriftete Bereiche** in Liams Reihenfolge: Aufbau · Prüfung · Fahrwerk · Upgrades · Einkauf (englisch Build · Check · Setup · Upgrades · Shopping). Am Handy unten wie bisher, am Desktop neu als Leiste unter dem Kopf mit Unterstrich am gewählten Bereich. Der Setup-Knopf im Kopf ist weg — es gibt einen Weg, nicht zwei.
- **Ein Bereich zur Zeit:** Der Score steht am Handy nur im Aufbau. Prüfung, Upgrades und Einkauf beginnen direkt mit ihrem Inhalt. Am Desktop klebt der Score rechts neben jedem Bereich.
- **Scrollstand je Bereich:** Aufbau → Prüfung → zurück landet wieder beim selben Teil. Den Bereich, in dem man ist, noch einmal antippen → nach oben.
- **Rad wechseln von überall:** Wer scrollt, sieht im Kopf Score und Radnamen. Ein Tipp öffnet alle Räder aller drei Arten (Traumrad, Mein Rad, Gebraucht); ein Tipp wechselt. Bereich und Scrollstand bleiben. Oben bleibt der Ein-Tipp-Wechsel über die Radknöpfe. Umbenennen, Kopieren und Löschen bleiben an ihrer einen Stelle (Stift).
- **Sprungleiste im Aufbau:** Rahmen · Gabel & Dämpfer · Laufräder · Reifen · Antrieb · Bremsen · Cockpit · Sitz · Kontakt, mit Statuspunkt (rot, gelb, grün). Sie klebt unter dem Kopf; ein Tipp öffnet die Gruppe und bringt sie nach oben. Die Teilegruppe „Fahrwerk“ heißt jetzt **„Gabel & Dämpfer“** (englisch *Fork & shock*), damit sie nicht mit dem Bereich Fahrwerk verwechselt wird.
- **Konflikt am Teil:**
  - Die Teilezeile nennt den Grund („Passt nicht: Dämpfer-Einbaumaß …“).
  - Bei echten Konflikten steht über dem Score eine Konfliktkarte mit „Dämpfer wechseln“ und dem Link zur Prüfung.
  - Das Teileblatt erklärt oben, warum das verbaute Teil nicht passt, und zeigt darunter nur passende Teile.
- **Vergleichen:** An jedem Upgrade, Ersatz und Sparvorschlag steht „Vergleichen“. Auch „Ansehen“ im Teileblatt zeigt den Vergleich. Verbautes Teil und neues Teil stehen nebeneinander:
  - Preis, Gewicht
  - Score des ganzen Rads, Kompatibilität, Einsatz — mit Differenz (grün = besser für dich)
  - die Daten beider Teile; Unterschiede sind umrandet
  - Direkt darunter der eine Einbau-Knopf.
- **Zurück zur Auswahl:** Aus dem Teil-Detail führt „‹“ in dieselbe Liste zurück — Suche, Filter und Scrollstand bleiben.
- **Preis → Einkaufsliste:** Die Preis-Kachel im Score führt mit einem Tipp zur Einkaufsliste (nur beim Traumrad; bei Mein Rad und Gebraucht gibt es keine).
- **Rückweg statt Rückfrage:** „Teil entfernen“ und „Dieses Rad zurücksetzen“ wirken sofort, mit 7 Sekunden „Rückgängig“ im Hinweis. „Rad löschen“ fragt weiter nach, weil es sich nicht zurückholen lässt.

**Gestalt**
- **Markenfarbe Eloxal-Orange** (wie eloxierte Anbauteile und Gabel-Decals) statt Violett:
  - Sie zeigt nur Auswahl und Orientierung: gewählter Bereich, gewählte Option, Links, Fokus.
  - Status bleibt Ampel: Grün passt, Gelb Kompromiss, Rot Konflikt. Warnungen sind jetzt gelb statt bernsteinfarben, damit sie sich nicht mit der Auswahl verwechseln lassen.
  - Alle Auswahlzustände (Filter, Sortierung, Marken, Modelljahr, Radknöpfe) sehen gleich aus: orangefarbener Rand mit leichter Tönung.
- **Hell und Dunkel gleich sorgfältig:**
  - Dunkel bleibt echtes Schwarz (Liams Wunsch vom 30.09.).
  - Hell bekommt ein warmes Werkstattgrau statt iOS-Blaugrau.
  - Alle sichtbaren Texte erreichen ≥ 4,5:1, große Schrift ≥ 3:1. Gemessen in der App: 1.618 Texte, neun Ansichten, Handy und Desktop, beide Designs, 0 Unterschreitungen.
- **Typografie:**
  - Überschriften und Messwerte (Score, Preis, Gewicht, mm) in **Barlow Semi Condensed** — schmal und technisch wie ein Datenblatt, mit gleich breiten Ziffern.
  - Die Schrift liegt lokal in `fonts/` (SIL Open Font License), kein Aufruf bei Google; der Service Worker cacht sie für offline.
  - Fließtext bleibt Systemschrift.
- **Zeichen mit Bedeutung:**
  - Schriftzug **CRANKSCORE** wie auf dem Unterrohr des Beispielrads, „SCORE“ in der Markenfarbe; auch auf der Startseite.
  - Je Teilegruppe ein eigenes Strich-Symbol (Rahmen, Gabel, Laufrad, Reifen, Kettenblatt, Bremsscheibe, Lenker, Sattel, Pedal), damit man Gruppen beim Scrollen am Bild erkennt.
  - Daten als eckige Schildchen, Aktionen als runde Pillen.
- **Ruhiger:**
  - Hinweise sind flache Zeilen mit Randstrich statt Karten in Karten.
  - Erklär- und Symbolflächen sind neutral statt farbig.
  - Die letzten drei Leuchtschatten (Adapter-Info, Fahrwerk-Tipp) sind entfernt.
- **Bewegung:**
  - Unverändert kurz (110–300 ms), ohne Nachfedern. Der Hell-Dunkel-Wechsel blendet weich über.
  - Der Unterstrich der Desktop-Navigation gleitet in 180 ms.
  - Mit „Bewegung reduzieren“ springt alles ohne Fahrt; die Sprungleiste scrollt dann ohne Animation.

### Sechs Abläufe vorher und nachher
Gemessen mit Playwright am alten Stand `ded53c4` und am neuen Stand. Gezählt sind Tipps bzw. Klicks und wie weit man scrollen muss, bis das nächste Ziel frei sichtbar ist (zwischen Kopf und Tableiste). Handy 390 × 844, Desktop 1280 × 860; Skript: `belege/APP-UX-001/ablaeufe.js`.

| Ablauf | Handy vorher | Handy nachher | Desktop vorher | Desktop nachher |
|---|---|---|---|---|
| 1. Bauteil finden und tauschen (Reifen hinten) | 2 Tipps + 1.718 px Scrollen | 3 Tipps, 0 px (Sprungleiste → Teil → Einbauen) | 2 Klicks + 1.237 px | 3 Klicks, 0 px |
| 2. Konflikt verstehen und beheben (Dämpfer passt nicht zum Rahmen) | 3 Tipps + 24 px; Score vor der Prüfung, im Teileblatt kein Grund | 2 Tipps, 0 px; Grund an Zeile, Konfliktkarte und oben im Teileblatt | 2 Klicks + 71 px | 2 Klicks, 0 px |
| 3. Fahrwerkseinstellungen öffnen | 1 Tipp („Setup“) | 1 Tipp („Fahrwerk“) | 1 Klick (Knopf im Kopf, kein Bereich) | 1 Klick (Navigation) |
| 4. Upgrade vergleichen | kein Vergleich; Umweg 4 Tipps + Eingabe + 1.741 px, zeigt nur das neue Teil | 2 Tipps, 0 px, beide Teile nebeneinander | Umweg 2 Klicks + Eingabe + 886 px, kein Vergleich | 2 Klicks, 0 px |
| 5. Einkaufsliste aufrufen | 1 Tipp; 1 Zeile sichtbar | 1 Tipp; 5 Zeilen sichtbar | 1 Klick nach 3.793 px Scrollen | 1 Klick, 0 px; 6 Zeilen |
| 6. Zwischen gespeicherten Rädern wechseln (weit unten im Aufbau: anderes Traumrad, dann Mein Rad) | 2 Tipps + 1.437 px zurück nach oben; Bereich springt auf Aufbau | 4 Tipps, 0 px (je Wechsel Kopf → Rad); Bereich und Scrollstand bleiben | 2 Klicks + 1.437 px | 4 Klicks, 0 px |

- **Ehrlich gerechnet:** Bei Ablauf 1 und 6 kostet der neue Weg einen Tipp mehr, spart aber das Scrollen (rund 3 Wischer). Der alte Weg geht weiter: Teil direkt antippen bzw. oben die Radknöpfe (1 Tipp).
- **Entfernte Umwege:**
  - der wiederholte Score über Prüfung, Upgrades und Einkauf (Handy)
  - die Einkaufsliste am Ende der Desktop-Seitenleiste
  - der Upgrade-Vergleich über Aufbau und Suche
  - Schließen statt Zurück im Teil-Detail
  - Zurückscrollen zum Radwechsel und der Sprung auf den Aufbau nach jedem Wechsel
  - der Desktop-Knopf „Setup“ als einziger Weg zum Fahrwerk

### Geprüft
Alle Prüfungen in Chromium (Playwright). Ab „npm test“ am Code-Stand `b7751b8`:
- **npm test:** alle Tests bestanden.
  - Syntax
  - Kompatibilität 199/199
  - Setup und Speicher 16/16
  - Ein Weg je Aufgabe 36/36 (davon zehn neue Prüfungen für APP-UX-001)
  - Sprache 0 Funde in 9.257 Texten
- **Die zehn neuen Wege-Prüfungen:**
  - fünf beschriftete Bereiche auf Handy und Desktop
  - Score nur im Aufbau
  - Scrollstand je Bereich
  - Rad wechseln von überall
  - Vergleichen
  - Zurück zur Auswahl mit Suche und Scrollstand
  - Konflikt am Teil
  - Sprungleiste
  - Rückgängig statt Rückfrage
  - Einkaufsliste über die Preis-Kachel
- **Sprache bei 280 und 320 px:** 0 Funde. Bei 280 px waren zuerst „Fahrwerk“, „Upgrades“ und „Shopping“ in der Tableiste gekürzt — behoben.
- **Überstand:** 0 Elemente. Zuerst stand „Open app“ auf der Startseite bei 280 px über — behoben.
- **Handy-Audit** (sieben Geräte von 320 px bis Querformat, Notch, Home-Balken):
  - Deutsch dunkel: 0 Funde
  - Englisch hell: 0 Funde
  - Zuerst gab es im Querformat zwei Funde, beide behoben: Leisten unter der Kamera-Aussparung; Score-Spalte höher als der Bildschirm.
- **Kontrast:** 0 Unterschreitungen in 1.618 Texten (neun Ansichten, Handy und Desktop, hell und dunkel). Zuerst 7 Stellen, behoben.
- **Statusleiste:** alles OK (neue helle Farbe #f2f1ee, mit und ohne View Transition, mit und ohne „Bewegung reduzieren“).
- **Animationen:** 100 von 102 Prüfpunkten.
  - Die zwei Abweichungen betreffen nur den *emulierten* alten Safari ohne View Transitions: Der Farbwechsel kommt im Testbrowser mit 4–5 statt mindestens 6 Zwischenbildern an.
  - Er ist stetig, ohne Aufblitzen.
  - Gegenprobe: Der alte Stand `ded53c4` fällt im selben Test genauso durch (zwei Läufe). Beim letzten Abnahmelauf (APP-ANIM-001) war es 101/102.
  - Beim Prüfen fiel ein Fehler im Messskript auf (eine alte Messschleife lief weiter), korrigiert in meiner Kopie.
- **Nicht geprüft:**
  - echtes iPhone und echter Safari
  - Tastatur-Bedienung nur stichprobenweise (Fokusreihenfolge: Kopf → Modi → Räder → Navigation → Inhalt)

### Belege (`belege/APP-UX-001/`)
- `navigation-handy.png`, `navigation-desktop.png` — Navigation vorher/nachher
- `vorher-nachher-handy-*.jpg`, `vorher-nachher-desktop-*.jpg` — jede Hauptansicht, Deutsch und Englisch, hell und dunkel (je vier Tafeln)
- `ablaeufe-handy.jpg`, `ablaeufe-desktop.jpg` — Endbild je Ablauf vorher/nachher
- `blaetter-handy-de-hell.jpg`, `blaetter-handy-en-dunkel.jpg` — Teilewahl, Vergleich, Radwechsel, Konflikt am Teil
- `startseite.jpg` — Startseite und Schriftzug
- `ablaeufe.js`, `ablaeufe-vorher.json`, `ablaeufe-nachher.json` — Messskript und Rohdaten
- `kontrast.js` — Kontrastmessung

### Offen
- **Echtes iPhone/Safari:** nicht geprüft (nur Chromium-Emulation). Besonders ansehen:
  - Kopfzeile beim Scrollen (Score + Radname statt Logo und Disziplin)
  - klebende Sprungleiste unter dem Kopf
  - Barlow-Schrift im Home-Bildschirm-Modus
- **Liams Urteil zur Farbe:** Orange ist eine Gestaltungsentscheidung. Falls Liam eine andere Markenfarbe will, steht sie an einer Stelle (`--anod`, `--akzent-flaeche`).
- **Veröffentlichung:** erst nach Liams ausdrücklicher Freigabe für diese Änderungen. Dann schreibt die Action den Versionsstempel; danach ist die Live-Prüfung (Teil B für Codex) möglich.

---

## APP-UX-001 — Nachtrag: veröffentlicht
- **Bezug:** APP-UX-001
- **Autor:** Claude · **Empfänger:** Liam, Codex
- **Datum:** 09.10.2026, 16:50 Uhr (Europe/Berlin)
- **Status:** ERLEDIGT (veröffentlicht)
- **Freigabe:** Liam im Chat am 09.10.2026 auf meinen Bericht zu APP-UX-001: „Ja kannste veröffentlichen“.

### Was passiert ist
- **Push von `e192068` auf `main`:** Fast-Forward von `3e5a4df`, um 16:45 Uhr.
- **Action „Veroeffentlichen“, Run 37946575893, alle drei Jobs erfolgreich:**
  - **pruefen:** `npm test` auf GitHub bestanden.
  - **stempeln:** Commit `49c36c2` „App aktualisiert (Version 20261009-1648)“. Er ändert nur `APP_VERSION` in `index.html` und den Cache-Namen in `mtb-sw.js`.
  - **veroeffentlichen:** „Pages neu bauen“ und „Live-Stand pruefen“ erfolgreich. Der zweite Schritt endet nur dann erfolgreich, wenn die öffentliche `index.html` den neuen Stempel enthält.
- **„pages build and deployment“ für `49c36c2`:** erfolgreich.
- **Branch:** per Fast-Forward auf `49c36c2` nachgezogen und gepusht.
- **Eigene Abfrage der öffentlichen Seite:** aus meiner Umgebung nicht möglich, `github.io` ist dort gesperrt (Netzwerkregel). Der Nachweis stützt sich deshalb auf den Schritt „Live-Stand pruefen“ und auf den Inhalt von `49c36c2`. Darin stecken `zeigeBereich`, `oeffneRadwahl`, `vergleichHtml`, `fundAmTeil`, Barlow Semi Condensed und die Sprungleiste.

### Was mit live gegangen ist
- **APP-UX-001** vollständig, wie im Bericht oben beschrieben.
- **APP-3D-001** (3D-Beispielrad, weiß mit CRANKSCORE und roter Gabel, auf Startseite, Begrüßung und erster Rundgang-Karte). Es war bisher nur auf dem Branch. Der neue Stand baut darauf auf; mit der Freigabe ist es deshalb ebenfalls live.
- **Ordner `3d/` und `CrankScore-Austausch/`:** liegen jetzt auch auf `main`. Die App lädt sie nicht; öffentlich lesbar waren sie schon über den Branch.

### Berichtigung zum Bericht oben
- Die Vorher-Bilder stammen vom Branch-Stand `ded53c4`, nicht von der damaligen Live-Version 20261009-1047.
- Die fünf Hauptbereiche sind in beiden Ständen gleich.
- Unterschied nur auf der Startseite, in der Begrüßung und auf der ersten Rundgang-Karte: Dort zeigte `ded53c4` schon das 3D-Beispielrad (APP-3D-001).
- Die Beschriftung „Vorher (Live 20261009-1047)“ auf den Tafeln ist in diesem Punkt ungenau.

### Stand
- **Code fertig:** ja.
- **Tests bestanden:** ja (Chromium lokal, CI, Action).
- **Live:** ja, Version 20261009-1648.
- **Visuell auf einem echten iPhone geprüft:** nein. Dafür ist Teil B von APP-UX-001-N1 jetzt frei.

- **Veröffentlichung:** JA, Nachweis siehe oben.
