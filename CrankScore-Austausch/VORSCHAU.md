# Vorschau: Neues Design und kürzere Wege für die ganze App (APP-REDESIGN-001)

Claude legt diese Seite nach jeder Aufgabe neu in den Austauschordner. Die Bilder liegen daneben in `belege/`, damit die Seite auch im entpackten ZIP funktioniert.

- **Stand:** 09.10.2026, 23:55 Uhr, Branch `claude/crankscore-app-changes-nz88ir`, Code-Stand `a518b9e`.
- **Veröffentlicht:** seit 10.10.2026, 00:14 Uhr als Version 20261010-0013 (Liams Freigabe; Commit `b594a24` auf `main`). Die Vorher-Bilder zeigen die vorige Live-Version 20261009-2208.
- **Online ansehen:** https://github.com/trostliam-hub/dreambuild/blob/claude/crankscore-app-changes-nz88ir/CrankScore-Austausch/VORSCHAU.md
- **Bericht:** `CLAUDE-ANTWORTEN.md` (APP-REDESIGN-001), mit Klickwegen, Prüfergebnissen und Launch-Blockern.
- **Designsystem:** `belege/APP-REDESIGN-001/DESIGNSYSTEM.md`.
- **Prüfauftrag an Codex:** `CODEX-AUFTRAEGE.md` (APP-REDESIGN-001-N1).

## Worum es geht
- **Ein eigenes Gesicht aus der Welt des Rads:**
  - Zahlen und Maße wie auf einem Datenblatt.
  - Stahlblau als einziger Akzent.
  - Beschriftungen in normaler Schreibung statt Versalien.
  - Linien statt Kacheln.
  - Rahmen-Symbol statt Funkelstern.
- **Gesamtring:** das echte Logo oben, die Zahl darunter, kleiner und ruhiger als in APP-DESIGN-002.
- **Kürzere Wege zum Wichtigen:**
  - Die Aufgabenkarte zeigt nur den nächsten Schritt.
  - Die Teilewahl zeigt die Liste zuerst.
  - Das Fahrwerk zeigt die Werte früher.
  - Am Desktop steht der Score oben.
- **Behoben:**
  - Zahlen in der Score-Hilfe brachen in eigene Zeilen.
  - Im Vergleich standen alle Maße in einer Spalte.
  - Der Tastaturfokus ging nach dem Schließen verloren.

## Score-Karte

![Score-Karte am Handy](belege/APP-REDESIGN-001/00-score-karte-handy.jpg)

![Score-Spalte am Desktop](belege/APP-REDESIGN-001/00-score-karte-desktop.jpg)

## Hauptansicht, Teilewahl, Fahrwerk

![Handy hell](belege/APP-REDESIGN-001/01-handy-hell-hauptansicht-teilewahl-fahrwerk.jpg)

![Handy dunkel](belege/APP-REDESIGN-001/02-handy-dunkel-hauptansicht-teilewahl-fahrwerk.jpg)

![Desktop hell](belege/APP-REDESIGN-001/03-desktop-hell-hauptansicht-teilewahl.jpg)

![Desktop dunkel](belege/APP-REDESIGN-001/04-desktop-dunkel-pruefung-fahrwerk.jpg)

## Die ganze App

![Einstieg, Radwahl, Prüfung, Upgrades](belege/APP-REDESIGN-001/05-handy-hell-app-1.jpg)

![Gebraucht, Einkauf, Guide, Einstellungen](belege/APP-REDESIGN-001/06-handy-hell-app-2.jpg)

![Assistent, Vergleich, Score-Hilfe, Pro](belege/APP-REDESIGN-001/07-handy-hell-blaetter.jpg)

![Leeres Rad, Mein Rad, Startseite](belege/APP-REDESIGN-001/08-handy-dunkel-leer-meinrad-startseite.jpg)

## Englisch

![Handy hell, Englisch](belege/APP-REDESIGN-001/09-handy-hell-englisch.jpg)

![Desktop dunkel, Englisch](belege/APP-REDESIGN-001/10-desktop-dunkel-englisch.jpg)

## Kurz geprüft
Alle Prüfungen am Endstand `a518b9e`, in Chromium.

| Prüfung | Ergebnis |
|---|---|
| Tests | alle bestanden |
| Überstand bei 280 und 320 px | 0 |
| Kontrast | 0 Unterschreitungen in 1.792 Texten |
| Animationen | 100 von 102, wie live |
| Randfälle und Tastatur | 84 von 84 |
| Klickwege | kein Weg länger, jede Aktion mit höchstens 2 Tipps |

Nicht geprüft: echtes iPhone und Safari, Screenreader.

---

## Vorschau APP-DESIGN-003: Logo raus aus dem Score, Stahlblau heller

Liams Korrektur zu APP-DESIGN-002. Claude legt diese Seite nach jeder Aufgabe neu in den Austauschordner; die Bilder liegen daneben in `belege/`.

- **Stand:** 09.10.2026, 22:05 Uhr, Branch `claude/crankscore-app-changes-nz88ir`, Code-Stand `8ff3702`.
- **Veröffentlicht:** seit 09.10.2026, 22:08 Uhr als Version 20261009-2208 (Commit `6673605` auf `main`). Die Vorher-Bilder zeigen die vorige Live-Version 20261009-2131.
- **Bericht:** `CLAUDE-ANTWORTEN.md` (APP-DESIGN-003). Die Vorschau zu APP-DESIGN-002 steht weiter unten.

### Score-Karte vorher und nachher

![Score-Karte am Handy](belege/APP-DESIGN-003/score-handy.jpg)

![Seitenspalte Desktop](belege/APP-DESIGN-003/score-desktop.jpg)

### Smartphone und Desktop

![Handy hell](belege/APP-DESIGN-003/vorher-nachher-handy-hell.jpg)

![Handy dunkel](belege/APP-DESIGN-003/vorher-nachher-handy-dunkel.jpg)

![Desktop hell](belege/APP-DESIGN-003/vorher-nachher-desktop-hell.jpg)

![Desktop dunkel](belege/APP-DESIGN-003/vorher-nachher-desktop-dunkel.jpg)

![Startseite und Guide](belege/APP-DESIGN-003/startseite-guide.jpg)

---

## Vorschau APP-DESIGN-002: Stahlblau und Score-Ringe mit Logo

Fertiger Stand zum Ansehen. Claude legt diese Seite nach jeder Aufgabe neu in den
Austauschordner. Die Bilder liegen daneben in `belege/`, damit die Seite auch im
entpackten ZIP funktioniert.

- **Stand:** 09.10.2026, 20:02 Uhr, Branch `claude/crankscore-app-changes-nz88ir`, Code-Stand `77b9c3d`.
- **Veröffentlicht:** seit 09.10.2026, 21:31 Uhr als Version 20261009-2131 (Liams Freigabe; Commit `2c77350` auf `main`). Die Vorher-Bilder zeigen die vorige Live-Version 20261009-1648.
- **Online ansehen:** https://github.com/trostliam-hub/dreambuild/blob/claude/crankscore-app-changes-nz88ir/CrankScore-Austausch/VORSCHAU.md
- **Bericht:** `CLAUDE-ANTWORTEN.md` (APP-DESIGN-002). **Prüfauftrag an Codex:** `CODEX-AUFTRAEGE.md` (APP-DESIGN-002-N1).
- **Frühere Vorschauen:** APP-UX-001 und APP-3D-001 stehen in `CLAUDE-ANTWORTEN.md`; ihre Bilder liegen weiter in `belege/APP-UX-001/` und `belege/APP-3D-001/`.

## Score-Karte

- Der Gesamtscore ist der große Ring in Stahlblau, mit dem CrankScore-Logo und der Zahl darin.
- Darunter stehen Kompatibilität (Schieferblau) und Einsatz (Grau).
- Probleme erscheinen als Hinweis in Worten mit Zeichen; ein Tipp führt zur Stelle.

![Score-Karte am Handy](belege/APP-DESIGN-002/score-handy.jpg)

![Seitenspalte Desktop](belege/APP-DESIGN-002/score-desktop.jpg)

## Smartphone vorher und nachher

![Handy hell](belege/APP-DESIGN-002/vorher-nachher-handy-hell.jpg)

![Handy dunkel](belege/APP-DESIGN-002/vorher-nachher-handy-dunkel.jpg)

## Desktop vorher und nachher

![Desktop hell](belege/APP-DESIGN-002/vorher-nachher-desktop-hell.jpg)

![Desktop dunkel](belege/APP-DESIGN-002/vorher-nachher-desktop-dunkel.jpg)

## Startseite, Guide, Auswahl

![Startseite und Guide](belege/APP-DESIGN-002/startseite-guide.jpg)

![Auswahl und Blätter](belege/APP-DESIGN-002/auswahl-und-blaetter.jpg)

## Farben auf einen Blick

| | Hell | Dunkel |
|---|---|---|
| Stahlblau (Schrift, Ring) | `#2f5a80` / Ring `#33608a` | `#8fb3d6` / Ring `#7fa8d1` |
| Stahlblau (Knopf) | `#2f5a80` | `#36608a` |
| Kompatibilität (Schieferblau) | `#6a7f96` | `#7a8ea5` |
| Einsatz (Grau) | `#858a91` | `#6f747b` |
| Warnung (Orange) | `#a8520a` | `#ff9f43` |
| Grund / Karte | `#eef1f4` / `#ffffff` | `#000000` / `#141518` |
