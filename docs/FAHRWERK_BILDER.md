# Fahrwerk: Bilder der Einsteller

Stand: 13.10.2026. Basis: `531de695d8fe425a75dd50557b104cc2b0ccc4e5`.
Branch: `codex/fahrwerk-bilder`.

„Wo sitzt was?“, die Einstellkarten und der Einsteller-Schritt unter „Deine Angaben“
zeigen passende Herstellerbilder. Antippen öffnet die vollständige Aufnahme.
Die Beschriftung und Quellenlinks sind auf Deutsch und Englisch vorhanden.
Alle Bilddateien liegen lokal und werden vom Service Worker vorab gespeichert;
beim Anzeigen erfolgt keine Anfrage an FOX oder SRAM.

## Zuordnung und Grenzen

- FOX GRIP X2, GRIP SL sowie GRIP X ohne Firm-Hebel (nur bei angegebenem Baujahr ab 2026).
- RockShox Lyrik, Pike und ZEB mit ausdrücklich gewähltem Charger 3/3.1 RC2;
  keine Übertragung auf Charger 3.2, BoXXer oder andere Kartuschen.
- RockShox Super Deluxe Ultimate RC2T (Referenz 2023), Luft und Coil.
  Select und Select+ bekommen dieses Bild nicht.
- FOX FLOAT X, FLOAT X2, DHX und DHX2: Ansichten der Einsteller aus den
  2025er Anleitungen; zusätzliche Einsteller nur entsprechend der gewählten Ausstattung.

Die Referenzversion steht jeweils am Bild. Herstelleransichten enthalten teilweise
farbig hervorgehobene Bauteile und sind keine eigenen Fotos von CrankScore.
Bei anderen Versionen bleibt das vorhandene Schema. Es wird kein Ersatzmodell
als das eigene Bauteil ausgegeben. Die Bilder verändern keine Berechnung.
Das FLOAT-X-Zugstufenbild mit zusätzlicher Drucktabelle wurde bewusst nicht aufgenommen,
um keine konkurrierenden Einstellwerte in die Hilfe einzuführen.

## Herkunft

Originaldateien der Hersteller, am 13.10.2026 abgerufen; nicht KI-generiert oder
nachgezeichnet. Rechte an den Aufnahmen/Herstelleransichten liegen bei FOX bzw.
SRAM/RockShox. Diese Herkunftsliste erklärt die Dateien nicht für gemeinfrei und
stellt keine eigenständige Nutzungslizenz dar. Quellen sind auch direkt in der App verlinkt.

| Lokale Datei unter `bilder/fahrwerk/` | Original |
| --- | --- |
| `fox-dhx-hebel.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1146-L781/inline/DHX-2-Pos.jpg) |
| `fox-dhx-lsc.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1146-L781/inline/DHX-LSC.jpg) |
| `fox-dhx-zug.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1146-L781/inline/DHX-rebound.jpg) |
| `fox-dhx2-druck.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1080-8XBE/inline/dhx2-comp.jpg) |
| `fox-dhx2-hsr.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1080-8XBE/inline/dhx2-hsr.jpg) |
| `fox-dhx2-zug.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1080-8XBE/inline/dhx2-lsr.jpg) |
| `fox-floatx-hebel.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1147-Z52T/inline/float-x-2-pos.jpg) |
| `fox-floatx-lsc.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1147-Z52T/inline/float-x-lsc.jpg) |
| `fox-gripsl-top.jpg` | [Herstellerdatei](https://ridefox.com/cdn/shop/files/GRIPSL_7.jpg?v=1773081812&width=680) |
| `fox-gripx-top.jpg` | [Herstellerdatei](https://ridefox.com/cdn/shop/files/GRIPXdamperblock.jpg?v=1775660532&width=680) |
| `fox-gripx2-top.jpg` | [Herstellerdatei](https://ridefox.com/cdn/shop/files/GRIPX2_7.jpg?v=1773081803&width=680) |
| `fox-x2-druck.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1078-LGTC/inline/FX2-comp.jpg) |
| `fox-x2-hsr.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1078-LGTC/inline/FX2-HSR.jpg) |
| `fox-x2-zug.jpg` | [Herstellerdatei](https://tech.ridefox.com/img/help/page1078-LGTC/inline/FX2-LSR.jpg) |
| `rs-charger3-druck.jpg` | [Herstellerdatei](https://www.sram.com/globalassets/publicsites/cms-story-pages/white-pages-setup-charger-3/inline-images/whitepages_setupcharger3_1816x1210_hsc-lsc.jpg?w=800&quality=85&format=jpg) |
| `rs-charger3-luft-zug.jpg` | [Herstellerdatei](https://www.sram.com/globalassets/publicsites/cms-story-pages/white-pages-setup-charger-3/full-bleed-images/whitepages_setupcharger3_7578_7528_7562_3upfull.jpg?w=1200&quality=85&format=jpg) |
| `rs-rc2t-druck.jpg` | [Herstellerdatei](https://www.sram.com/globalassets/publicsites/cms-story-pages/white-pages-rc2t/full-bleed-images/whitepages_rc2t_2up_hsclsc_2880x960.jpg?w=1200&quality=85&format=jpg) |

## Prüfung

- Gesamtsuite `npm test`: Syntax, Kompatibilität 200/200, Setup 16/16,
  Wege 36/36, Sprache DE/EN 0 Funde in 8.770 Texten, BEVEL 28/28,
  Preisskript 0 Fehler. Danach zusätzliche Zuordnungs-/Dateiprüfungen und
  gezielte Nachprüfung am endgültigen Stand: Setup 19/19.
- Browserprüfung auf 320, 390 und 1280 px: keine horizontale Überbreite,
  beide Bilder in der Pike-Charger-3.1-Ansicht geladen; Handyansicht visuell geprüft.
- Alle 17 lokalen Bilder im Browser dekodiert und in der Offline-Assetliste nachgewiesen.
- `git diff --check` ohne Befund.

Lokale Testumgebung: Node 24.20.0, vorhandenes Playwright 1.56.1,
installiertes Google Chrome statt des lokal fehlenden Playwright-Chromiums.
Ein ausschließlich temporäres Node-Preload setzt den Browserpfad und ersetzt
`python3` durch das vorhandene Python 3.12. Keine Testwerkzeuge oder
Browser installiert, keine Umgehung von Assertions. CI nutzt unverändert
seine eigene Chromium-Installation. Live-Veröffentlichung erfolgt erst
nach Übernahme des Pull Requests und erfolgreicher Veröffentlichungs-Action.
