# Qualitätsrunde der gesamten CrankScore-App

Auftrag vom 18.10.2026: die App ohne Rückfragen verständlicher, moderner und zuverlässiger machen und veröffentlichen. Basis: `3240eef97a568ace90b06f65f5473e625212e454`, Arbeitsbranch `codex/qualitaetsrunde`. Das fremde Unreal-Projekt im Standard-Arbeitsverzeichnis wurde nicht verändert.

## Bedienung und verständliche Angaben

- Wunschliste und Einkauf unterscheiden Zubehörkosten vom Preis einer neuen Bremse. Beispiel: vorhandene Shimano XT mit 180/180-mm-Scheiben, Wunsch 220/203 mm. Die 41 € sind bekannte Adapterkosten. Fehlende Scheibenpreise und unbekannter Versand bleiben sichtbar offen; die vorhandene Bremse wird nicht erneut zum Kauf verlinkt. Freie Einträge ohne Katalogpreis ergeben keinen erfundenen 0-€-Gesamtpreis.
- Ausgewählte Maße und Scheibengrößen stehen direkt beim Eintrag. Der Einkauf nutzt auf schmalen Geräten die ganze Breite, Preise bleiben zusammen.
- Ein vollständig eingetragener Aufbau wird nicht mehr als vollständig geprüft bezeichnet, wenn Körpermaße, Gewicht oder andere Angaben fehlen. Auch der lokale Guide nennt offene Prüfungen.
- Die Ablesehilfe ist beim ersten eigenen Rad und im Profil erreichbar. Die Radwahl nennt den vorhandenen Weg „Räder verwalten“.
- Ungewählte Teile beschreiben Adapter als Folge einer späteren Übernahme. Das Ansehen eines Vorschlags verändert den Aufbau nicht. Wartungsberatung enthält keine pauschale Unbedenklichkeitszusage zu Mineralöl.

## Bilder und Zugang

- Bestehende echte Produkt- und Herstellerbilder bleiben erhalten. Keine neuen erfundenen Bilder oder Ersatzzeichnungen.
- Bei einem fehlgeschlagenen Nahfoto verschwinden auch dessen Markierungen. Beschreibung, Originalbild und Quelle bleiben erreichbar.
- Offene Dialoge haben einen zugänglichen Namen. Tab und Umschalt-Tab bleiben darin; Escape führt zum Auslöser zurück. Foto- und Einführungsdialoge behalten ihre eigene Fokusführung.
- Zwölf bereits unerreichbare alte Zeichenkörper hinter sofortigen Rückgaben wurden entfernt. Die aktiven Rückgaben bleiben identisch. Das spart 82.887 Bytes unkomprimierten UTF-8-Quelltext; daraus folgt kein gemessener Geschwindigkeitsprozentsatz. Einzelbelege stehen unter `CrankScore-Austausch/belege/APP-QUALITAET-001/quelltext-entlastung.json`.

## Datenerhalt und Zuverlässigkeit

- Jeder optionale Speichereintrag wird getrennt gelesen. Beschädigte Produktlinks oder Ansichtsangaben brechen das Laden der Radprofile nicht mehr ab. Ein Hinweis benennt die betroffenen Daten.
- Teilweise lesbare Profile werden angezeigt; ihre ursprünglichen gespeicherten Daten bleiben vor einem Überschreiben geschützt. Wiederherstellung erfolgt über eine passende Datensicherung. Auch gesperrtes Lesen wird nicht als fehlender Datensatz behandelt.
- Alte Fotos werden erst nach bestätigtem Speichern der neuen Fotokopien und zugehörigen Profil-IDs entfernt. Bei Speicherfehlern bleiben die Originaldaten erhalten; nach Freigabe von Speicher und Neustart wird erneut migriert.
- Das Update wartet auf die installierte Offline-Version. Bei Fehlern bleiben bisherige App und Cache erhalten. Die Worker-Aktivierung bereinigt nur alte CrankScore-/Dreambuild-Caches derselben Herkunft.
- Das Gratislimit gilt gemeinsam vor lokalem Guide und KI-Anfrage. Ein Tageszähler im Arbeitsspeicher hält die Grenze bei gesperrtem Speichern innerhalb derselben Sitzung ein. Der Server begrenzt die Nutzung weiterhin unabhängig davon.
- Beim Entfernen einer Pro-Aktivierung bleiben Code und Instanz erhalten, bis der Lizenzserver die Deaktivierung bestätigt. Offline wird kein freier Geräteplatz behauptet.

## Prüfung und Veröffentlichung

Es gab getrennte Implementierungs-Worktrees und anschließend einen unabhängigen Quelltext-Review. Die Einsteigerprüfung war simuliert; es wurden keine echten fachfremden Personen befragt. Bild-/Bedienansichten wurden bei 320, 390 und 1280 px, Deutsch/Englisch und OLED/Hell geprüft. Es wurden ausschließlich isolierte synthetische Browserdaten verwendet, ohne echte KI-Anfragen oder fremde Nutzerdaten.

Neue dauerhafte Prüfgruppen: Bedienung 10, Zuverlässigkeit 10 (einschließlich echtem lokalen Service Worker und Offline-Neuladen), verständliche Preise/Hilfe 8. Alle laufen über `npm test` im Veröffentlichungsworkflow. Der KI-Server hat zusätzlich acht bestehende Prüfungen mit simulierter Provider-API.

Der endgültige Testbericht, geprüfte Revision, automatische Versionsstempelung und der Abgleich der öffentlichen Dateien werden im zugehörigen Belegordner dokumentiert. Kein manueller Versionsstempel. Keine neuen kostenpflichtigen Dienste oder Schlüssel. Ein echtes iPhone/Safari wurde nicht getestet; absolute Fehlerfreiheit und ein physikalisch perfekt berechnetes Fahrwerk werden nicht behauptet.

Abschließender lokaler Gesamtlauf am 20.10.2026: vollständig bestanden in 253 Sekunden. 397 Appprüfungen, zwei eingebettete Skripte syntaktisch geprüft, keine Sprachfunde in 11.139 Texten und keine Preisprüfungsfehler. Die App- und Workerdateien entsprechen weiter den unabhängig begutachteten Hashes. Der erste Gesamtlauf hatte ausschließlich eine Überlagerung zweier Routen im externen Windows-Prüfadapter; die unveränderten App-/Testdateien bestehen mit dem bereinigten Adapter vollständig. Fehlversuch und erfolgreicher Bericht sind getrennt aufbewahrt.

## Zusätzlich geprüfter Preisablauf

Die älteren Preis-Workflows scheiterten bereits vor dieser Runde: Ohne Shopfeeds konnte eine geänderte Produktseitenprüfung nur `preise.json` schreiben. Das zwingende Vormerken der nicht vorhandenen `preisverlauf.json` brach den Lauf ab. Der Workflow merkt jetzt nur vorhandene Preisdateien vor. Sein Veröffentlichungsarchiv nimmt außerdem dieselben benötigten Bilder, Produktskripte, Vendor-Dateien und das konkrete Rahmenmodell wie der Haupt-Release mit.

Alter Fehler mit Exit 128 reproduziert; drei korrigierte Stagingfälle (nur Preise, beide Dateien, keine Datei) erfolgreich geprüft. Keine unbeteiligten Dateien vorgemerkt. Bashsyntax und bestehende Python-Preisprüfung sind sauber. Das echte Archiv des Appcommits enthält 53/53 Pflichtassets des Service Workers, beide Produktskripte, zehn Vendor-Dateien und eine gültige GLB-Datei. Ein getrennter Review bestätigte den Archivumfang. Keine Secrets, Rechte oder Zeitpläne geändert. Details im Beleg `preisworkflow-pruefung.json`.

Shopfeeds sind weiterhin nicht hinterlegt. Öffentlich waren beide Preisdateien bei dieser Prüfung noch nicht vorhanden; die App zeigt dafür Richtpreise und einen Hinweis auf fehlende Livepreise. Es wurden keine Angebote erfunden oder externe Feed-Anfragen ausgelöst. Die Workflowkorrektur ist lokal geprüft; ein neuer entfernter Preis-Workflowlauf wird hier nicht behauptet.
