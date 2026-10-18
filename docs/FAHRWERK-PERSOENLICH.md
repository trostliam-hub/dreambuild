# Persönliches Fahrwerk, einfach erklärt

Stand: 18.10.2026 · APP-FAHRWERK-EINFACH-001

Vor persönlichen Zahlen prüft der Fahrwerk-Tab den Aufbau: Ohne Rahmen, benötigte Gabel oder benötigten Dämpfer führt ein Knopf direkt zur fehlenden Teileauswahl, noch vor Pro-Vorschau und Fragen. Danach folgen fünf Fragen beim Hardtail, sechs beim Fully: Modell/Baujahr von Gabel und ggf. Dämpfer, Gewicht/Ausrüstung, Gelände, Tempo/Sprünge und Fahrgefühl. Gewicht bleibt im gemeinsamen Fahrerprofil. Unbekannte Antworten sind erlaubt; technisch falsche Zahlen sperren Weiter. Keine Eingabe für Ziel-SAG oder Maximaldruck.

Die Hauptansicht zeigt den nächsten konkreten Schritt und drei Karten pro Teil: Luftdruck/Stahlfeder, Einsinken messen (SAG), Ausfedern einstellen. Weitere Einsteller, Erklärungen, Profile, Quellen, Baselines und Notizen sind aufklappbar. Testfahrt und erneute gemeinsame Einrichtung bleiben erhalten. Für früher gemeldete Defekte ist ein separater Zustandsdialog erreichbar; die Warnung wird nicht still entfernt.

## Herstellerdaten

`fwModellVorgaben` ordnet belegte Grenzen nach Modell und ausdrücklich angegebenem Komponentenjahr zu. Alte manuelle `fw.vorgaben` überschreiben diese Daten nicht. Bei unbekannter Grenze gibt es keinen berechneten Pumpwert und keine Druckänderung; die App verweist auf Modelljahr/Anleitung. Bereits gespeicherte Daten bleiben erhalten. Quellen stehen an Druckkarte und Erklärung.

| Modell/Jahr | Daten |
| --- | --- |
| FOX 32/34, 2025 | SAG 15–20 %. 32 Step-Cast/Rhythm 140 psi, Taper-Cast 150; 34 FLOAT/Step-Cast/Rhythm 120. SL wird nicht gleichgesetzt. |
| FOX 36/38, 2025 | SAG 15–20 %. 36: 120 psi; 38 FLOAT: 140, Rhythm: 120. |
| RS Pike/Lyrik/ZEB, 2023–2026 | Druckreihen nach Jahr/Federweg. Pike 120 MY23/24: 194 psi, sonst 163; Lyrik 140–160: 163; ZEB 150–190: 148. |
| RS Lyrik/ZEB LinearXL, 2027 | 300 psi. Getrennte Druckreihen je Modell und Federweg. |
| FOX Float/Float X/X2, 2025 | Float/Float X: 350 psi, SAG 25–30 %; X2: 300 psi, SAG 30 %. Float SL ohne sichere EVOL-Zuordnung unbekannt. |
| FOX DHX/DHX2, 2025 | SAG 30 %, kein Luftdruck. Vorspannung nach Modellanleitung. |
| RS Super Deluxe D1 Luft, 2027 | 400 psi, SAG-Ausgangspunkt 30 %. |
| RS Vivid Luft, 2024 | Konservative Grenze 300 psi, weil Hub/Tokens das Maximum von 360 auf 300 absenken können; ausdrücklich gekennzeichnet. |

FOX Step-Cast/Rhythm haben eigene Druckreihen. RS verwendet nur geschlossene Gewichtsspalten 120–220 lb mit Mittelpunkten 130/150/170/190/210. Zwischenwerte werden als App-Interpolation bezeichnet, außerhalb wird nicht weitergerechnet. Systemlast, Fahrstil und unbekannte SAG-Ziele bleiben App-Schätzungen. Ein allgemeiner RS-Gabel-Richtwert wird nicht als modellspezifische Herstellervorgabe ausgegeben. Ziele bleiben innerhalb bestätigter Herstellerbereiche; Profiltexte zeigen das tatsächlich verbleibende Delta.

Primärquellen: FOX [32/34](https://tech.ridefox.com/bike/owners-manuals/2978/fork--2025-32mm--or-34mm-(including-step-cast-and-taper-cast)), [36/38](https://tech.ridefox.com/bike/owners-manuals/2979/fork--2025-36mm-or-38mm), [Float](https://tech.ridefox.com/bike/owners-manuals/2982/shock--2025-float), [Float X](https://tech.ridefox.com/bike/owners-manuals/2983/shock--2025-float-), [X2](https://tech.ridefox.com/bike/owners-manuals/2984/shock--2025-float-x2), [DHX/DHX2](https://tech.ridefox.com/bike/owners-manuals/2981/shock--2025-all-coil-shocks-(dhx2-and-dhx-models)). RS Gabeldaten [2023](https://www.sram.com/globalassets/document-hierarchy/service-manuals/rockshox/front-suspension/2023-front-suspension-oil-air-coil-token-specifications-english.pdf), [2024](https://www.sram.com/globalassets/document-hierarchy/service-manuals/rockshox/front-suspension/2024-front-suspension-specifications.pdf), [2025](https://www.sram.com/globalassets/document-hierarchy/service-manuals/rockshox/front-suspension/2025-front-suspension-specifications.pdf), [2026](https://www.sram.com/globalassets/document-hierarchy/service-manuals/rockshox/front-suspension/2026-front-suspension-specifications.pdf), [2027](https://www.sram.com/globalassets/document-hierarchy/service-manuals/rockshox/front-suspension/2027-front-suspension-specifications.pdf), [Super Deluxe D1](https://support.rockshox.com/hc/en-us/articles/48154037771163-What-is-the-maximum-air-pressure-of-the-Super-Deluxe-D1), [Vivid Hub/Tokens](https://support.rockshox.com/hc/en-us/articles/17939965514523-What-kind-of-Bottomless-Tokens-does-Vivid-use-and-how-many-tokens-can-Vivid-hold), [Dämpferdruck und Rahmen](https://support.rockshox.com/hc/en-us/articles/4412440335643-How-much-air-should-I-have-in-my-RockShox-rear-shock-for-my-rider-weight).

## Vorhandene Stahlfeder behalten

Die eingegebene Feder ist der Hauptwert, z. B. 475 lbs; ein berechneter Richtwert von 500 lbs steht darunter. Bestätigter Hinterrad-Federweg: Spindrift CF [180 mm](https://www.propain-bikes.com/us/product/ready-to-roll/spindrift-cf-29-performance/), Stumpjumper Alloy [130 mm](https://www.specialized.com/ca/en/stumpjumper-alloy/p/175253). Fehlen Federweg/Hub, wird keine Vergleichsfeder erfunden. Ältere Radangaben bleiben erhalten.

SAG-Näherung: ungerundete berechnete Federrate × Ziel-SAG ÷ tatsächliche Federrate. Vorspannung, Reibung und Hinterbauverlauf begrenzen diese Schätzung; anschließend wird gemessen. LSR-Korrektur: `sign(Ist/Soll−1) × min(2, round(abs(Ist/Soll−1)×10))` Klicks. Weichere Feder: weniger Dämpfung, härtere: mehr. Dies ist ausdrücklich eine begrenzte App-Heuristik, keine universelle Herstellertabelle. HSR und Druckstufe bleiben ohne verifiziertes Mapping unverändert. Eine stark unpassende Feder lässt sich nicht allein durch Dämpfung ausgleichen; sie wird trotzdem nicht automatisch ausgetauscht.

Messungen speichern ihren Bezug zu Gewicht, Rad, Teil und tatsächlicher Feder. Bei Änderungen zählen alte Messungen nicht mehr als aktuell; Notizen, Baselines und Feintuning bleiben erhalten. Coil-Dämpfer werden über den Befestigungsabstand ohne/mit Fahrer gemessen, die Differenz ist das Einsinken. Keine Pumpen-, Luftkammer- oder O-Ring-Anweisung im Coil-Dämpfer-Assistenten. Gabel und Dämpfer erhalten getrennte Messpositionen.

## Fotos und Prüfungen

Gezeichnete Teile-, Rad-, Körper/Cockpit-, Adapter- und Intro-Grafiken werden nicht mehr gerendert. UI-Icons und Datenskalen bleiben. Der Aufbau zeigt nur ein tatsächlich hochgeladenes Radfoto. Fahrwerkbilder verwenden das gewählte Produkt und die belegte Ausführung; abweichende Kartusche oder erkennbares Bildjahr führen zu einer ehrlichen Bildlücke. Keine andere Modellfamilie, Referenz-Nahaufnahme oder erfundene Marker als Ersatz. Fotos und Quellenansichten haben schwarzen Hintergrund.

Fragen, Wiederaufnahme, fehlende Teile, Herstellergrenzen, Feder475/500, Messungsbezug, Datenerhalt, Zustandsdialog, Fotos und responsive DE/EN-Ansichten werden automatisch geprüft. Zusätzlich getrennte Quellen-, Bild- und simulierte Einsteigerreviews sowie Chromium-Sichtprüfung bei 320/390/1280 px, OLED/Hell. Dies sind keine Tests mit echten fachfremden Personen und kein iPhone/Safari-Nachweis. Startwerte werden durch Messung und Testfahrt verfeinert; kein Versprechen eines garantiert perfekten Setups.
