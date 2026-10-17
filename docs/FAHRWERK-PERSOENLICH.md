# Persönliche Fahrwerkfragen und Einrichtung

Stand: 17.10.2026 · APP-FAHRWERK-PERSOENLICH-001

## Einstieg

Die Fahrwerkfragen starten beim ersten Öffnen des Fahrwerk-Tabs mit Pro und vorhandenem Federelement. Sie sind kein Teil der allgemeinen App-Einrichtung. Beim Wechsel auf ein noch nicht eingerichtetes Rad innerhalb des Tabs gilt derselbe Ablauf. Ohne Federelement wird zuerst die Teilewahl erklärt; ohne Pro bleibt die bestehende Vorschau erhalten.

Der Assistent fragt nach:

- Gewicht und Ausrüstung; der gemeinsame Fahrerprofil-Editor bleibt die einzige Stelle für Körpergewicht, Größe und Erfahrung. Von den Fahrwerkfragen aus geht es dorthin und anschließend zurück zur offenen Frage.
- Rad, Rahmen, Baujahr, Größe, Radtyp und optional gewogenem Radgewicht.
- Tatsächlicher Gabel bzw. Dämpfer, Modelljahr, Federart und gegebenenfalls eingebauter Federhärte und Hinterbau-Federweg. Modell und Ausführung stammen aus dem Aufbau.
- Vorhandenen Einstellern, Gelände, Tempo, Sprüngen, gewünschtem Fahrgefühl, gegebenenfalls Bergaufanteil und Fahrprofil.
- Optionalen SAG-Vorgaben aus der passenden Anleitung und dem Maximaldruck vom Aufkleber.
- Bisherigen Einstellungen und Problemen sowie Zustand und Messwerkzeug.

Ein Hardtail erhält keine Dämpferfragen; bei Stahlfederung entfällt die Luftdruckeingabe. Fahrstilfragen verlangen eine Auswahl oder ausdrücklich „Weiß ich nicht“. Unbekannt bleibt erkennbar, Zahlen außerhalb der Eingabebereiche werden nicht übernommen. Das bisherige Setup dient zum Vorher/Nachher-Vergleich; der Wunschtext bleibt eine Notiz und steuert keine automatische oder KI-basierte Verstellung.

## Berechnung und Messung

Die vorhandenen Tabellen und Fahrstilregeln werden weiter genutzt. Neu ist die Speicherung der Fahrstilantworten unter `build.fw.stil` pro Rad. Frühere Angaben aus `mtb.fprofil` dienen als Vorbelegung; ein bewusst gewähltes „Weiß ich nicht“ überschreibt sie nur für dieses Rad.

Ein eingetragenes Hersteller-SAG-Ziel bestimmt das Ziel in Prozent und Millimetern in allen drei Fahrprofilen. Bei Coil-Dämpfern geht es auch in die vorhandene Abschätzung der Federhärte ein. Dämpfer-SAG bezieht sich auf den Hub. Ein eingegebener Maximaldruck kann bekannte Herstellergrenzen nur absenken. Berechnete und gespeicherte Drücke werden zentral daran geprüft. Der Eingangswert 400 psi ist lediglich eine obere Plausibilitätsgrenze bei unbekanntem Modellmaximum und keine pauschale Druckfreigabe.

Neue SAG-Messungen speichern zusätzlich ihren Bezug zu Fahrergewicht mit Ausrüstung, Rad und Federelement. Bei veränderter Grundlage zählen sie nicht mehr als aktuelle Messung; die alten Werte bleiben erhalten. Gespeichertes Feintuning wird nicht automatisch überschrieben. Bei gemeldeten Undichtigkeiten, Spiel oder Klemmen führt die App zuerst zur Prüfung des Zustands.

Herstellerdaten und App-Schätzungen bleiben getrennt bezeichnet. Die Antworten liefern Startwerte, kein garantiert perfektes Setup. Anschließend bleiben die vorhandenen SAG-Messung und die Testfahrt mit jeweils einer Änderung maßgeblich.

Fachlicher Abgleich: [RockShox Setup und Tuning](https://www.sram.com/globalassets/document-hierarchy/tuning-manuals/suspension-setup-and-tuning-guide-english.pdf) und [RockShox Fine Tuning](https://www.sram.com/en/rockshox/learn/suspension-fine-tuning) nennen Fahrergewicht inklusive Ausrüstung, SAG vor Dämpfungsabstimmung und iterative Prüfung auf dem Trail. [FOX: SAG messen](https://tech.ridefox.com/fox_tech_center/owners_manuals/013/Content/Intro/Correct_air_pressure_sag.html) beschreibt die Messung in Fahrkleidung. Modellspezifische Vorgaben haben Vorrang; aus diesen allgemeinen Quellen wurden keine neuen modellübergreifenden Druck- oder Klicktabellen abgeleitet.

## Wiederaufnahme und vorhandene Daten

`build.fw.fragenVersion` kennzeichnet den gesehenen Fragenstand. Antworten und abgeschlossene Abschnitte werden laufend gespeichert. Schließen oder Neuladen führt zu einer Fortsetzen-Kachel statt erneutem Zwangsstart. Erst die Abschlussaktion markiert die Einrichtung als fertig.

Bereits abgeschlossene ältere Setups werden um die neuen Abschnitte Herstellervorgaben und Vorbereitung ergänzt. Fehlende Fahrstil-Antworten aus früher übersprungenen Fragen werden gezielt nachgeholt; vorhandene Werte, Baselines und Notizen bleiben erhalten. Ein Komponentenwechsel entfernt nur die Angaben des ersetzten Federelements und öffnet die betroffenen Abschnitte erneut. Ein Rahmenwechsel entfernt außerdem das alte hintere SAG-Ziel.

## Einrichtung erneut durchgehen

Unter **App & Profil → Fahrerprofil → Einrichtung komplett neu durchgehen** laufen die aktualisierten sechs Einführungsszenen und alle Fahrerfragen erneut. Danach erlaubt **Mit meinem Rad weitermachen** die Rückkehr ohne neues Rad und ohne Datenlöschung. Alternativ bleiben die bekannten Wege zum Anlegen eines anderen Rads erreichbar. Die Einführung zeigt direkte Teilesuche, optionale Beratung, automatische Bremsadapter, Fahrwerk, Guide, Fotos, Wunschliste und Einkauf. Sie ist auch allein unter Hilfe verfügbar.

## Prüfungen

`node tools/fahrwerk-fragen-test.mjs` prüft elf Szenarien einschließlich tatsächlicher Klickwege, Wiederaufnahme nach Neuladen, Eingabeprüfung, Coil-/Luft-Berechnung, Druckgrenzen, Messungsbezug, Migration, Radwechsel, Datenerhalt und DE/EN in OLED/Hell bei 320/390/1280 px. Die Gruppe läuft mit `npm test` und im Veröffentlichungsworkflow. Sprachtests enthalten alle neuen Fragen und Einführungsszenen. Browserprüfungen verwenden isolierte Testdaten; echtes iPhone/Safari ist damit nicht nachgewiesen.
