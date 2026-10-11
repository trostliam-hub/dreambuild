# Bevel-Analyse und Übertragung auf CrankScore (APP-BEVEL-003, §1)

Stand 11.10.2026 · Autor: Claude

## Was ich mir ansehen konnte und was nicht

- **Offizielle Screenshots:** nicht erreichbar.
  - Aus der Arbeitsumgebung sind `bevel.health`, `apps.apple.com` und weitere Seiten gesperrt: DNS-Sperre sowohl für den Seitenabruf als auch für `curl`.
  - Hell- und Dunkel-Screenshots der Bevel-App habe ich deshalb **nicht selbst gesehen**.
- **Erreichbar waren nur Suchergebnisse** (Titel, Adressen, Textauszüge):
  - App-Store-Eintrag „Bevel: All-In-One Health App“ (apps.apple.com/us/app/-/id6456176249)
  - UI-Analyse von ScreensDesign (screensdesign.com/showcase/bevel-health-performance)
  - Testbericht bei Yahoo Tech (tech.yahoo.com/wearables/articles/bevel-sort-makes-apple-watch-230000160.html)
  - Testbericht bei autonomous.ai (autonomous.ai/ourblog/bevel-app-review)
  - Bevels Feedback-Seite (feedback.bevel.health)
- **Belegte Aussagen daraus:**
  - Der Startbildschirm zeigt Strain, Recovery und Sleep auf einen Blick.
  - Darunter liegen anpassbare Karten (Energy Bank, Stress & Energy, Health Monitor).
  - Es gibt ein helles und ein dunkles Erscheinungsbild.
  - Zusatzwissen steckt in „Learn more“-Overlays statt in der Hauptfläche.
  - Die Einführung zeigt früh, *wie* die App hilft, statt nur abzufragen.
  - Nutzer beschreiben die Gestaltung als „clean“ und „minimal“, mit runden Ecken.
- **Aus eigener Kenntnis der App,** nicht an aktuellen Screenshots geprüft:
  - drei runde Kennzahlen nebeneinander, große Zahl mit kleiner grauer Beschriftung;
  - Karten mit großem Radius auf ruhigem Grund;
  - Farbe nur für die Kennzahlen selbst;
  - Tippen öffnet die Detailseite mit Verlauf.

## Gestaltungsprinzipien, die ich übertrage

| Prinzip | Bei Bevel (laut Quellen) | In CrankScore umgesetzt als |
|---|---|---|
| **Blickführung** | Oben die wenigen Kennzahlen, darunter Karten | Kopf → großes Radbild → kompakte Score-Zeile → Prüfung → „Was möchtest du verbessern?“ → Teile. Keine Anleitungskarte über dem Rad, keine Score-Säule neben jedem Bereich |
| **Kennzahlen** | Große Zahl, kleine Beschriftung, ein Ring je Kennzahl | Großer Gesamtring (Logo über der Zahl) und zwei kleine Ringe für Kompatibilität und Einsatz, daneben ein Satz zur Deutung. Fehlende Daten stehen direkt darunter, nicht erst in der Hilfe |
| **Typografie** | Deutliche Größenstufen, Zahlen als Hauptsache | Feste Skala: 13 px Hilfstext, 14 px Zusatz, **16 px Fließtext**, 20 px Kartentitel, 24–28 px Abschnittstitel, 48 px Score. Ziffern in Barlow Semi Condensed, Text in Inter |
| **Oberflächen** | Karten auf ruhigem Grund, hell und dunkel eigenständig | Hell: warme Neutralfläche `#f2f0ec`, Karten `#fbfaf7`. Dunkel: abgestuftes Anthrazit `#16181b` / `#1e2125` / `#262a2f`. Keine Leuchtschatten |
| **Abstände** | Großzügig, eine Karte, ein Gedanke | Skala 4 / 8 / 12 / 16 / 24 / 32 px; 24 px zwischen Karten, 16 px innen; Touch-Ziele mindestens 44 px |
| **Informationsdichte** | Zusammenfassung zuerst, Details auf Tippen („Learn more“) | Teilezeilen nur mit Bauteil, Name und Preis. Doppelte Angaben fallen weg, Gruppenbeschreibungen kommen ins „Was ist das?“. Die Rechtstexte unten sind verkürzt |
| **Interaktion** | Tippen öffnet Details; Einführung zeigt den Nutzen | Kurze Auswahl in drei Fragen (Ziel, Marke, Budget), Ergebnisse als drei Kacheln, Vergleich mit „Zurück zu Ergebnissen“. Die Einführung zeigt eine Bremse mit fehlendem Adapter und animiert die Lösung |
| **Farbe gezielt** | Farbe für Kennzahlen, sonst neutral | Stahlblau bleibt Hauptakzent (Score, Hauptaktion). Grün, Gelb und Rot nur als kleiner Statuspunkt mit Wort, keine Badge-Wolken |

## Was bewusst *nicht* übernommen wird

- **Keine Nachbildung:** weder Bevels Logo, Schrift oder Farben noch einzelne Bildschirme. CrankScore bleibt eine eigenständige MTB-App mit Stahlblau, Kettenblatt-Logo und technischen Ziffern.
- **Keine lange Einführung:** Bevel fragt laut ScreensDesign in 34 Schritten ab. CrankScore bleibt bei drei überspringbaren Szenen und geht danach direkt zum Rad.
- **Keine Bezahlschranke** im Ablauf.
