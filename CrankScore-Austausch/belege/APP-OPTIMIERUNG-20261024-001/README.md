# App-Prüfung und Optimierung vom 24.10.2026

Auftrag: bestätigte Fehler in CrankScore beheben, Bedienung und Offlinebetrieb verbessern, prüfen und veröffentlichen. Kein Umbau des Unreal-Spiels.

- Basis: `c10ede11f19fb6c504454fc9c2cc182c87d2ef1c`, vorherige Onlineversion `20261024-1817`.
- Erster Prüfcommit: `42eb5fc6fd697f2e24d950284a129d79dbb48bff`, Branch `codex/app-fehler-optimierung`.
- Abschließende Vergleichskorrektur: `d0d4ce656e6fc036b7da4afcb7ad03c3735f4db5` auf Basis des ersten automatischen Stempels `9a2022bb119ddd011ad011d305cde75ce671716c`.
- Quelltext und Prüfungen wurden in getrennten Durchgängen gelesen. Drei unabhängige Teilprüfungen; Root schrieb die Appdateien. Kein offener konkreter Reviewblocker am Prüfcommit.

## Behobene Fehler

1. Eigene Teile werden bei Speicherfehlern nicht mehr scheinbar erfolgreich eingebaut. Ein fehlgeschlagenes Anlegen oder Löschen setzt zusammengehörige Speicheränderungen zurück und prüft, ob die Wiederherstellung gelungen ist.
2. Fehlgeschlagenes Löschen eines Rads erhält dessen Foto und Fahrwerkdaten. Auch ein neueres, bisher nur im RAM vorhandenes Foto bleibt bei abgebrochener Operation erhalten. Vor erfolgreichem Neu-Anlegen/Kopieren wird das Foto des bisherigen Rads im selben Vorgang gesichert.
3. Wird ein eigenes Teil gelöscht, bleiben zugehörige Wünsche als freie Einträge mit Namen erhalten. Der Einkauf stürzt dadurch nicht mehr ab; betroffene Teiletests werden aufgelöst. Fehler beim Speichern stellen den alten Stand wieder her.
4. Sicherungsdateien prüfen Profil-/Wunschkennungen, Slots, Links und die Struktur eigener Teile. Ungültige Daten oder doppelte Radkennungen werden vor dem Import abgelehnt. Lokal beschädigte Profile werden geschützt; deren ursprüngliche Rohdaten bleiben für eine Rettung gespeichert. Attribute und Links werden außerdem beim Anzeigen abgesichert.
5. Eine Sicherung meldet fehlende aktuelle Änderungen auch dann, wenn nur das Fahrwerk nicht gespeichert werden konnte. Sie behauptet in diesem Fall keinen vollständigen Erfolg.
6. Beim Zurückwechseln eines Dämpfers bleiben die neuesten Einstellungen der unveränderten Gabel erhalten, spiegelbildlich auch beim Gabelwechsel. Das gilt für alle Fahrprofile, absichtliches Leeren, Basis-/Variantenkennungen und Neuladen. Fremde Räder bleiben getrennt. Unbestätigte Testwerte werden nicht als feste Werte übernommen; alte Paar-Notizen und Werte des anderen Teils bleiben beim Paar.
7. Eine tatsächlich gefahrene Stahlfeder von beispielsweise 475 lbs/in wird auch in Trail-Karte, lokalem Guide und den drei Profilspalten des Fahrwerkvergleichs angezeigt. Im Einzelvergleich bleiben Empfehlung und eigener Wert getrennt und mit Einheit sichtbar.
8. Die SAG-Hilfe schlägt beim unteren erlaubten Druck keinen nicht übernehmbaren Wert von 8 psi mehr vor. Die zentrale Druckübernahme weist unzulässige Werte ab.
9. Die Laufradprüfung berücksichtigt gewogenes Rad und eingetragene Ausrüstung. Der geprüfte Fall 95 kg Fahrer + 25 kg Rad + 10 kg Ausrüstung ergibt 130 kg und löst die vorhandene 120-kg-Grenze aus. Keine neue Herstellerfreigabe erfunden.
10. Der Fahrwerkvergleich lässt sich wieder öffnen. Seine Funktion hatte denselben globalen Namen wie der Teilevergleich. Beide Wege sind jetzt getrennt und funktional geprüft.
11. „Ziel oder Budget ändern“ hat einen eigenen Speicherdialog. Budget/Ziel bleiben nach Neuladen erhalten; andere Wunschfelder und der Einkaufsstatus bleiben erhalten. Abbrechen, ungültige Eingaben, Radwechsel und Speicherfehler sind geprüft.
12. Ein langer Radname überdeckt am Desktop nach dem Scrollen keine Navigation mehr. Die mobile Seite erlaubt außerdem wieder Browserzoom.
13. Der versionierte Offlinecache liefert vorhandene lokale Bilder und Schriften ohne erneuten Hintergrundabruf. Programmdateien werden weiter aktualisiert; Preise bleiben netzbevorzugt. `no-store` und Worker-Versionsproben werden nicht im Laufzeitcache abgelegt. Cache-Schreibvorgänge halten den Worker bis zum Abschluss aktiv.
14. Offline funktioniert auch der Einstieg über `index.html?…` bzw. den App-Stamm mit URL-Zusatz. Nur diese Einstiegsnavigation wird auf ihren kanonischen Cacheeintrag bezogen; fehlende fremde Pfade werden nicht als Appseite ausgegeben. Installationsschutz und fremde Caches bleiben erhalten.

## Nachweise

Der vollständige lokale Lauf startete auf dem sauberen Prüfcommit und bestand alle **23 Gruppen**: **560 Appfälle**, 2 eingebettete Skripte, Sprache **0 Funde in 11.173 Texten**, Preise **0 Fehler**, 494 Sekunden. Zusätzlich bestanden alle **10 Servertests** mit simulierter API.

Die 79 neuen Regressionen sind über `tools/test.mjs` dauerhaft eingebunden:

- `tools/daten-regression-test.mjs`: 39/39, darunter echte Dateiimporte/Downloads, gezielt gesperrte Speicherfächer, fehlgeschlagene Rückschreibung und neun Foto-Grenzfälle.
- `tools/fahrwerk-regression-test.mjs`: 11/11 für Teile-Rückwechsel und Anzeigen/physische Grenzwerte.
- `tools/ui-offline-regression-test.mjs`: 29/29, darunter echte Klickwege und echter Service Worker. Die früheren zehn Zuverlässigkeitsprüfungen bleiben zusätzlich erhalten.

Die Agentenberichte entstanden vor dem Commit auf einem eingefrorenen HTML-Snapshot. Dessen SHA256 `5e17eb24e768de55f6f4a9935428996ed9706a79587816edabf77b7396d7475b` stimmt mit dem ersten Prüfcommit überein; die damalige Git-Basisangabe allein bezeichnet nicht den geprüften geänderten Dateistand. Der vollständige lokale Bericht nennt unmittelbar diesen festgeschriebenen Prüfcommit.

Die erste GitHub-Gesamtprüfung auf `42eb5fc` bestand ebenfalls alle 23 Gruppen und 10 Servertests (522 Sekunden für die App). Die erste öffentliche Version `20261024-1903` wurde am 24.10.2026 um 17:05:19 UTC nach Zeilenendennormalisierung vollständig mit dem gestempelten Checkout verglichen; drei Dateien HTTP200/identisch. Die öffentliche Funktionsprobe bestand 10/10. Diese Ergebnisse sind ausdrücklich Zwischenstände.

Bei der anschließenden tatsächlichen Sichtprüfung des Vergleichs-Screenshots fiel eine weitere falsche Federanzeige auf: 625-lbs-Empfehlung statt eingebauter 475-lbs-Feder. Der alte Screenshot `vorher-vergleich-625.png` hält den Fehler fest. Die erste Probe prüfte dort nur Öffnen und Spaltenzahl; deshalb war sie trotz dieses Anzeigefehlers grün. Der abschließende Commit priorisiert nun die eigene Feder auch im Vergleich. Der F02-Regressionsfall verlangt alle drei eigenen Profilwerte sowie getrennte Empfehlung/Eigenwert im Einzelvergleich. Der öffentliche Prüfhelper enthält dieselbe zusätzliche inhaltliche Kontrolle. Gezielt lokal 11/11 bestanden, unabhängiger Quellreview ohne Befund. Für die Ergänzung wird die gesamte bestehende GitHub-Prüfung erneut ausgeführt; kein Test ausgelassen oder abgeschwächt.

Kontrollierter Vorher-/Nachhervergleich mit echtem Worker: zehn Versionsproben erzeugten vorher zehn neue Cacheeinträge, danach keinen. Zwei erneute Ansichten des bereits gecachten Herstellerfotos verursachten vorher zwei zusätzliche Netzabrufe, danach keinen; der HTTPcache war dabei per CDP ausgeschaltet. Das ist ein gezielter Netzabrufvergleich, kein allgemeiner Geschwindigkeitswert für jedes Gerät.

Alle Browserdaten waren synthetisch und isoliert. Keine realen Nutzerprofile verändert, keine echten Modellaufrufe, kein neues Paket, kein neuer Dienst und keine Budgeterhöhung. Der produktive KI-Worker bleibt unverändert.

## Grenzen

Die Prüfungen belegen die beschriebenen Fälle und keine absolute Fehlerfreiheit. Handybreiten wurden in Chrome emuliert; echtes iPhone/Safari, reale Einsteiger und reales Fahrgefühl sind dadurch nicht geprüft. Ein nicht wieder beschreibbarer Gerätespeicher kann keine erfolgreiche Speicherung garantieren; die App benennt einen unvollständigen Rollback ausdrücklich.

## Endgültige Freigabe und öffentliche Gegenprobe

Status: **ERLEDIGT und veröffentlicht**. Endgültiger Prüfcommit `d0d4ce656e6fc036b7da4afcb7ad03c3735f4db5`, automatischer Stempel `4adeed5614e662100393133a38a95e54a92c82d9`. Öffentliche Version **20261024-1917**, Cache **dreambuild-20261024-1917**. Zwischen Prüfcommit und Stempel änderten sich ausschließlich `APP_VERSION` und `CACHE`; keine manuelle Stempelung.

- [Vollständige abschließende GitHub-Prüfung und Veröffentlichung](https://github.com/trostliam-hub/dreambuild/actions/runs/40114687900): erfolgreich, alle 23 Gruppen, 560 Appfälle, zwei Skripte, Sprache 0/11.173, Preise 0 Fehler, App-Lauf 533 Sekunden. Zusätzlich 10/10 Servertests. Details in `github-abschlusspruefung.json`.
- [Erfolgreicher Pages-Lauf des endgültigen Stempels](https://github.com/trostliam-hub/dreambuild/actions/runs/40115482848). Der vorherige doppelte Pages-Lauf 40115453159 wurde abgebrochen; der hier verlinkte Nachfolger war erfolgreich.
- Öffentliche `index.html`, `mtb-sw.js` und `guide-safety.js` am 24.10.2026 um **17:19:37 UTC** vollständig abgerufen: HTTP200 und nach Zeilenendennormalisierung identisch mit dem gestempelten Checkout. Siehe `online-abschluss-dateien.json`.
- Öffentliche Funktionsprobe auf genau **20261024-1917**: **10/10 bestanden**, 390px/Deutsch/OLED und 320px/Englisch/Hellmodus. Der Vergleich zeigt nun in allen drei Profilspalten die eingebaute 475-lbs-Feder; im Einzelvergleich bleibt die abweichende Empfehlung separat. Rückwechsel erhält 110 psi, Wunschbudget 400→750 bleibt nach Reload erhalten. Kein horizontaler Seitenüberstand, keine Browser-JS-Fehler, keine API-Aufrufe, synthetische Rad-/Wunsch-/Setupfelder erhalten. Bericht `online-abschluss-probe.json`, positive Screenshots daneben. Der deutsche Vergleich wurde nach der Korrektur auch tatsächlich visuell geprüft.

Reproduktion nach Installation der im Projekt bereits festgelegten Testabhängigkeiten: `npm test`. Die öffentlichen Nachweise lassen sich mit `node CrankScore-Austausch/belege/APP-OPTIMIERUNG-20261024-001/online-dateien-pruefen.mjs` und dem `live-pruefung.mjs` daneben wiederholen; für letzteren vorher `CRANKSCORE_EXPECT_VERSION=20261024-1917` setzen. Ausschließlich isolierte Testdaten, keine echten KI-Aufrufe.

Claude kann die festen Prüfcommits und die eingecheckten Regressionen direkt nachlesen. Bestehende Auftragsdateien bleiben erhalten. Keine offene Implementierung oder Veröffentlichung aus dieser Prüfrunde. Echte iPhone-/Safari- und Einsteigertests bleiben als oben benannte externe Prüfgrenze bestehen.
