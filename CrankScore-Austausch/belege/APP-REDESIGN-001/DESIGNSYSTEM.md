# CrankScore: Designsystem „Datenblatt“

Stand: APP-REDESIGN-001, 09.10.2026, Branch `claude/crankscore-app-changes-nz88ir`. Der Code steht in `index.html` im Stilblock „APP-REDESIGN-001“ am Ende des `<head>`. Die Farb-Tokens stehen weiter oben in `:root`.

## Woher der Charakter kommt
Der Charakter kommt aus der Welt des Fahrrads, nicht aus einer App-Vorlage:

- **Datenblatt und Geometrietabelle.** Zahlen sind schmal und gleich breit, Einheiten klein, Maße stehen als eckige Schildchen.
- **Eloxiertes Anbauteil.** Stahlblau ist der einzige Akzent. Es sitzt gezielt, wie ein blauer Vorbau an einem grauen Rahmen.
- **Rahmen-Decal.** Der Schriftzug CRANKSCORE in Versalien ist die einzige Stelle mit gesperrten Großbuchstaben.
- **Werkstatt.** Graphit, Schwarz und klare helle Flächen. Ruhig, aber nicht klinisch.
- **Das echte Rad.** Das gerenderte Beispielrad und das CrankScore-Logo (Kettenblatt mit Kurbel) statt Spielzeuggrafik und Funkelsternen.

## Farben

| Token | Hell | Dunkel | Wofür |
|---|---|---|---|
| `--ground` | `#eef1f4` | `#000000` | Seitenfläche |
| `--surface` | `#ffffff` | `#141518` | Karten und Blätter |
| `--sunk` | `#e3e8ed` | `#2a2d32` | vertiefte Flächen (Umschalter) |
| `--ink` / `--ink-2` / `--ink-3` | `#0f1318` / `#3d444d` / `#5f6772` | `#f3f5f7` / `#b4b9c0` / `#878d95` | Schrift in drei Stufen |
| `--line` | `#d9dfe5` | `#2d3035` | Haarlinien |
| `--anod` | `#2563a8` | `#8ec2f7` | Stahlblau für Schrift, Auswahl und Links |
| `--akzent-flaeche` | `#2563a8` | `#2f6db0` | Stahlblau als Fläche für Hauptknöpfe (weiße Schrift) |
| `--ring-gesamt` | `#3a80cc` | `#6fb2f5` | großer Gesamtring, mit leichtem Schein |
| `--ring-pass` | `#6a7f96` | `#7a8ea5` | Ring Kompatibilität (Schiefer) |
| `--ring-eins` | `#858a91` | `#6f747b` | Ring Einsatz (Grau) |
| `--gut` / `--warn` / `--bad` | `#0f7653` / `#a8520a` / `#c42a52` | `#3ddc84` / `#ff9f43` / `#ff5c72` | nur für Status: passt, Kompromiss, passt nicht |

**Regeln**
- Orange steht nur für Warnungen. Rot steht nur für „passt nicht“.
- Grün steht nur für „passt“ und für Sparhinweise.
- Es gibt keine Verläufe. `--grad` ist absichtlich eine einfarbige Fläche.
- Gemessen wird jede sichtbare Schrift gegen ihren tatsächlichen Hintergrund. Die Grenze ist WCAG AA: 4,5:1, große Schrift 3:1.

## Schrift
- **Überschriften, Zahlen, Maße, Preise:** Barlow Semi Condensed 600/700, auf dem eigenen Server. Zahlen haben Ziffern gleicher Breite (`tabular-nums`).
- **Fließtext und Beschriftungen:** die Systemschrift, also SF Pro auf Apple-Geräten, sonst Inter oder Segoe UI.
- **Stufen:** 12 · 12,5 · 13,5 · 15 · 17 · 20/21 · 24 · 30 px. Die Zahl im Gesamtring hat 46–58 px, je nach Breite.
- **Beschriftungen in normaler Schreibung.** Vorher waren 62 Beschriftungen gesperrte Versalien, zum Beispiel PREIS, GESAMTSCORE und DEIN NÄCHSTER SCHRITT. Jetzt sind sie 12,5 px groß, Gewicht 650, in `--ink-3`.
- **Zustandsschilder** (Passt, Kompromiss, Verbaut) mit großem Anfangsbuchstaben statt in Versalien.

## Form, Fläche und Linie

| Element | Radius |
|---|---|
| Karte, Blatt | 20 px (`--r-karte`) |
| Feld, Kachel, Teilekarte | 14 px (`--r`) |
| kleine Flächen | 10 px (`--r-s`) |
| Datenschild, Zustandsschild | 6 px (`--r-tag`) |
| Knopf | Pille |

- **Eine Kartenebene je Ansicht.** Innerhalb einer Karte gliedern Haarlinien und Abstand, keine weiteren Kästen. Beispiel: Die Score-Karte hat keine grauen Kacheln mehr, sondern zwei Spalten mit einer Linie dazwischen.
- **Hell:** Karten sind weiß mit einer 1-px-Linie, ohne weichen Grauschatten. **Dunkel:** Graphit auf Schwarz. Schatten haben nur schwebende Teile, also Blatt, Navigation und Aufklapper.
- **Abstände:** 4 · 8 · 12 · 16 · 24 · 32 px.

## Bewegung
- **Dauern:** 110 ms für Tippen, 180 ms kurz, 260 ms mittel, 300 ms für den Designwechsel.
- **Kurve:** `cubic-bezier(.2,.8,.2,1)` beim Ausblenden und Ankommen.
- **Bewegung nur als Antwort auf eine Handlung.** Der eine gestaltete Moment ist der Score, der bei einer Änderung zählt und im Ring nachläuft.
- **Bewegung reduzieren:** keine Ein- und Ausflüge, kurze Überblendungen und keine Endlosanimationen. Das ist geprüft (siehe Prüfung).

## Bausteine

| Baustein | Aufbau | Regel |
|---|---|---|
| **Score-Karte** | Großer Ring mit Logo oben und Zahl darunter. Darunter „Gesamtscore“, dann Kompatibilität und Einsatz als zwei kleine Ringe in Spalten, die Statushinweise, Preis und Gewicht als Datenzeile. | Ohne Teile: Logo gedämpft, Strich statt Zahl, „Noch kein Score“. |
| **Aufgabenkarte** | Kopf mit Art des Rads, Aufgabe und „x von y erledigt“. Darunter eine Bahn aus Segmenten. | Wer schon angefangen hat, sieht nur den aktuellen Schritt mit Knopf. „Alle Schritte“ klappt die Liste auf. Höchstens ein Knopf. |
| **Teilekarte im Blatt** | Name und Preis oben, Maße als Schildchen darunter, Shop, „Ansehen“ und „Einbauen“ in einer Zeile. | Die Aktion sitzt am Teil. Die volle Shopliste steht im Detail. |
| **Blattkopf** | Titel zuerst, der Zusammenhang klein darunter, zum Beispiel „Federgabel / Bauteil wählen“. | Im Assistenten ist die Frage des Schritts der Titel, darunter „Schritt 1 von 5 für …“. |
| **Aufklapper** | „Was ist das?“ und „650 € günstiger bei gleichen Maßen“ als `<details>` mit Pfeil. | Das Wichtige (die Teileliste) steht zuerst. Die Erklärung kommt auf Wunsch. |
| **Datenschild** | 6 px Radius, schmale Ziffern. | Im Vergleich ist das abweichende Maß umrandet. |
| **Knopf** | Pille, mindestens 44 px hoch, klein 40 px. | Hauptknopf in Stahlblau-Fläche, sonst Graphit-Fläche oder Linie. |
| **Radleiste** | Art des Rads (Traumrad, Mein Rad, Gebraucht) und das Rad selbst. Am Desktop in einer Zeile. | Lange Radnamen kürzen mit „…“ und bleiben einzeilig. |
| **Symbole** | 24er-Raster, Strich 1,9 px. | Kein Funkelstern. Traumrad ist ein Rahmen mit Maßlinie. Pro und „Über CrankScore“ zeigen das echte Logo. |

## Bedienregeln
1. **Jede Ansicht beantwortet drei Fragen:** Wo bin ich? Was ist wichtig? Was ist der nächste Schritt?
2. **Die Aktion sitzt am Ding:** am Teil, am Befund, am Upgrade. Es gibt keinen Umweg über Menüs.
3. **Wichtige Funktionen brauchen 1 Tipp, Details höchstens 2.** Gemessen ist das im Bericht unter „Klickwege“.
4. **Die App behält** Eingaben, das gewählte Rad und die Scrollposition je Bereich.
5. **Tastatur:** Jeder Knopf hat einen sichtbaren Fokusrahmen. Enter öffnet, Escape schließt, und der Fokus kehrt zum Auslöser zurück.
6. **Sprache:** normale Schreibung und aktive Verben. Eine Aktion heißt überall gleich, zum Beispiel „Einbauen“ und „Ansehen“.

## Bewusst nicht
- Keine Neon-Glows, keine Verläufe, keine Funkelsterne, keine Kartenstapel in Karten.
- Keine gesperrten Versalien über jedem Wert.
- Keine zweite Akzentfarbe. Der Charakter kommt aus Schrift, Datenblatt-Satz, Rad und Ring, nicht aus Farbe.
