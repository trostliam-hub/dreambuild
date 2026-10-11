# Vorschau: CrankScore nachgebessert (APP-BEVEL-003)

Liams Nachbesserungsauftrag vom 11.10.2026 nach der Live-Prüfung: sichtbar neuer Aufbau, Teilewechsel als kurze Führung, keine widersprüchlichen Bewertungen, Produktseiten und Gesamtkosten, konkrete Adapter, Wunschliste mit Stufen, ein Einstieg.

- **Stand:** 11.10.2026, 15:35 Uhr, `main` = Stempel-Commit `e3f9997` (Code `091c653`).
- **Veröffentlicht:** JA, Version **20261011-1532** unter https://trostliam-hub.github.io/dreambuild/ (Testadresse).
  - Freigabe: Liam, „Kannste veröffentlichen“.
  - Lauf „Veroeffentlichen“ 38143394062: Prüfen, Stempeln, Pages und Live-Stand prüfen, alles grün.
  - Der erste Lauf 38141146259 war rot. Ursache und Behebung stehen im Nachtrag in `CLAUDE-ANTWORTEN.md`. Die Einführung geht seitdem ohne Durchblitzen direkt in die Einrichtung über.
  - Die Vorher-Bilder unten zeigen die frühere Live-Version 20261011-1156.
- **Bericht:** `CLAUDE-ANTWORTEN.md` (APP-BEVEL-003): je Abschnitt Anforderung, Umsetzung, Prüfung und Ergebnis, getrennt nach erledigt, teilweise und blockiert.

## Was sich ändert
- **Aufbau:**
  - Ruhiger Kopf mit deinem Rad und dem Profil.
  - Großes Radbild, kompakter Score ohne Säule.
  - Prüfung direkt darunter; fehlende Angaben stehen schon zugeklappt da.
  - Dann „Was möchtest du an deinem Rad verbessern?“ und die Teile.
  - Keine Modus- und Sprungleiste mehr, keine doppelten Angaben.
- **Teilewechsel:**
  - Drei kurze Fragen (Ziel, Marke, Budget), nichts vorbelegt, oben jederzeit korrigierbar.
  - Etwa drei Kacheln mit Zustand, Grund, Gesamtpreis, Vergleichen, Merken und Zum Produkt.
  - Im Vergleich steht das ganze Paket, mit „Zurück zu Ergebnissen“.
- **Ehrliche Bewertung:**
  - Kolbenzahl nur als Bauart, keine „Trail 4/5“-Noten.
  - Kein Bremsgewichtsvergleich bei ungleichem Lieferumfang.
  - Kompromisse erst auf Wunsch; „Behalten sinnvoll“, wenn kein Wechsel belegbar besser ist.
- **Adapter konkret:**
  - Artikel je Schritt, z. B. Shimano SM-MA-F203P/PM oder Magura QM44, vorn bzw. hinten, mit Grund.
  - Vorhandene Adapter: „nicht neu kaufen“.
  - Freigaben nur, wo belegt. Die im Audit angebotene 220/203 ist jetzt „Noch zu prüfen“, mit Rückfrage.
- **Angebote:**
  - Keine Shop-Suchlinks mehr.
  - Bremssatz auch aus Vorder- und Hinterradbremse, Versand in den Kosten.
  - Geprüfte Produktseiten ohne Preisbehauptung.
  - Echte Angebote brauchen weiter das Secret `PREIS_FEEDS`.
- **Wunschliste:**
  - Stufen Gemerkt → Im Aufbau testen → Kaufen → Montiert.
  - Ein Test wird nie als verbaut gespeichert.
  - Die Einkaufsliste bei „Mein Rad“ enthält nur Wünsche mit Zubehör.
- **Einstieg:** drei Szenen mit einer gezeichneten Bremse und animiertem Adapter, dann direkt die Wahl des Rads. Kein zweites Willkommen, kein zweites Überspringen.

![Aufbau 390 px](belege/APP-BEVEL-003/tafeln/T1-aufbau-390-dunkel-hell.jpg)

![Desktop](belege/APP-BEVEL-003/tafeln/T2-aufbau-desktop.jpg)

![Englisch](belege/APP-BEVEL-003/tafeln/T3-englisch-390.jpg)

![Teilewechsel](belege/APP-BEVEL-003/tafeln/T4-teilewechsel.jpg)

![Vergleich und Einkauf](belege/APP-BEVEL-003/tafeln/T5-vergleich-einkauf.jpg)

![Prüfung und Einkauf](belege/APP-BEVEL-003/tafeln/T6-pruefung-einkauf.jpg)

![Neu im Teilewechsel](belege/APP-BEVEL-003/tafeln/T7-neu-teilewechsel.jpg)

![Animationen gemessen](belege/APP-BEVEL-003/tafeln/T8-animationen.jpg)

![Einstieg](belege/APP-BEVEL-003/tafeln/T9-einstieg.jpg)

![Szene mit Adapter](belege/APP-BEVEL-003/tafeln/T10-szene-adapter.jpg)

---

# Vorschau: CrankScore überarbeitet (APP-BEVEL-002)

Liams Auftrag `CLAUDE-APP-BEVEL-002` vom 10.10.2026: Aufbau als Arbeitsfläche, Prüfung unter dem Rad, Teile finden ohne Rückschritte, Adapter als Paket, geprüfte Produktlinks, Wunschliste, Vergleich, 3D und eine kurze Einführung.

- **Stand:** 11.10.2026, 02:15 Uhr, Branch `claude/crankscore-app-changes-nz88ir`, Code-Stand `85b99df` (Nachtrag Abschnitt 10: 3D-Rad realistischer).
- **Veröffentlicht:** ja, seit 11.10.2026, 11:56 Uhr als Version 20261011-1156 (Liams Freigabe; Stempel-Commit `b1e62fb` auf `main`). Die Vorher-Bilder zeigen die vorige Live-Version 20261010-0045.
- **Bericht:** `CLAUDE-ANTWORTEN.md` (APP-BEVEL-002), mit Abnahmekriterien, Testszenarien, Werkzeugen, Blockern und offenen Punkten.

## Was sich ändert
- **Vier Bereiche:** Aufbau, Wunschliste, Fahrwerk, Einkauf. Prüfung und Upgrades sind keine eigenen Reiter mehr.
- **Aufbau:** oben dein Rad (Foto, beim Spindrift das 3D-Modell, sonst die Seitenansicht deines Rahmens), darunter „Passendes Teil finden“, dann die Prüfung — zugeklappt eine Zeile, Konflikte bleiben mit „Lösung finden“ sichtbar.
- **Teile finden:** Ziel, Marke, Budget (Teil plus Zubehör). Drei Vorschläge mit Gesamtpreis, Vor- und Nachteilen. Nur was für das Ziel wirklich besser ist; sonst sagt die App: „Dein aktuelles Teil passt gut.“
- **Adapter:** werden automatisch eingeplant oder entfallen — mit Grund, Preis und Rückgängig. Fehlt eine Herstellerangabe, fragt die App nach statt zu raten.
- **Zum Produkt:** nur mit geprüftem Angebot. Ohne Preis-Feed (Secret `PREIS_FEEDS` fehlt) steht ehrlich „Derzeit kein geprüftes Angebot“.
- **Wunschliste je Rad,** Vergleich vorher/nachher, Verlauf mit Rückgängig.
- **Farben:** warme helle Flächen und weiches Anthrazit statt Kühlgrau und Schwarz.
- **3D-Rad (Nachtrag):**
  - Neue Details: Nippel, Ventile, die fehlende vordere Bremsleitung, ein echtes Schaltwerk, ein Sattel mit Volumen und eine blanke Kette.
  - Material und Licht wie im Fotostudio.
  - Im 3D-Betrachter steht das Rad jetzt auf einem weichen Bodenschatten.
  - Behoben: Am Hinterrad sah man durch einen dünnen Ring zwischen Felge und Reifen. Der Reifen saß 3,5 mm zu hoch.

![Prüfung](belege/APP-BEVEL-002/T1-pruefung.jpg)

![Teileblatt](belege/APP-BEVEL-002/T2-teileblatt.jpg)

![Upgrades](belege/APP-BEVEL-002/T3-upgrades.jpg)

![Aufbau](belege/APP-BEVEL-002/T4-aufbau.jpg)

![Hell und Englisch](belege/APP-BEVEL-002/T5-hell-en.jpg)

![Desktop](belege/APP-BEVEL-002/T6-desktop.jpg)

![Neu](belege/APP-BEVEL-002/T7-neu.jpg)

![Radbild](belege/APP-BEVEL-002/T8-radbild.jpg)

![Einführung und 3D](belege/APP-BEVEL-002/T9-szenen-3d.jpg)

![3D-Rad realistischer](belege/APP-BEVEL-002/T10-3d-realismus.jpg)

---

## Vorschau APP-DESIGN-004: Beispielrad raus aus dem Aufbau

Liams Wunsch vom 10.10.2026: „kannst du das rad weg machen was über dem foto gezeit wird weil nicht jedes rad so ist“.

- **Stand:** 10.10.2026, Branch `claude/crankscore-app-changes-nz88ir`, Code-Stand `557a4b5`.
- **Veröffentlicht:** seit 10.10.2026, 00:46 Uhr als Version 20261010-0045 (Liams Freigabe; Commit `cb3ce2e` auf `main`). Die Vorher-Bilder zeigen die vorige Live-Version 20261010-0013.
- **Bericht:** `CLAUDE-ANTWORTEN.md` (APP-DESIGN-004). Die Vorschau zu APP-REDESIGN-001 steht weiter unten.

## Was sich ändert
- **Teilekarte entfernt:** Die Karte mit dem gerenderten Beispielrad und den Status-Punkten ist aus dem Aufbau entfernt, in allen drei Arten von Rädern.
- **In Mein Rad und Gebraucht** folgt unter dem Score jetzt direkt das eigene Foto.
- **Den Stand je Teilegruppe zeigen weiter:**
  - die Sprungleiste mit ihren farbigen Punkten
  - die Statushinweise am Score
- **Unverändert:** Startseite, Einstieg und Rundgang behalten das Beispielrad. Dort ist es als Beispiel beschriftet und steht für kein bestimmtes Rad.

![Handy: Mein Rad und Traumrad](belege/APP-DESIGN-004/vorher-nachher-handy.jpg)

![Desktop: Mein Rad](belege/APP-DESIGN-004/vorher-nachher-desktop.jpg)

---

## Vorschau APP-REDESIGN-001: Neues Design und kürzere Wege für die ganze App

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
