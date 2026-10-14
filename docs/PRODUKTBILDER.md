# Produktbilder in der App

Stand: 14.10.2026. Auftrag: echte Produktbilder in der App, schwarze
Bildflächen und vergrößerbare Ansichten. Die versehentlich ergänzte Galerie
der separaten Website wurde zurückgenommen; deren vorheriges Design bleibt.

## Darstellung

Die Teileauswahl, der Aufbau, die Fahrwerk-Angaben, Detailseiten, Finder,
Vergleiche, Wunschliste und Einkauf verwenden dieselbe Bildzuordnung.
Ein eigener Fotobutton öffnet eine schwarze Großansicht, ohne ein Teil
einzubauen oder den vorhandenen Auswahl-Dialog zu ersetzen. Vergrößern,
Einpassen, Schließen und Escape erhalten den Listen-, Filter- und Fokusstand.
Bildquelle und Hinweise zur gezeigten Modellansicht bleiben erreichbar.
Die Bildflächen sind sowohl im OLED- als auch im Hellmodus schwarz.

`bilder/produkte/katalog.js` dokumentiert für jedes zugeordnete Modell die
Produktseite, Originalaufnahme, Marke, Kategorie und lokale Datei. Bevorzugt
sind echte Herstellerbilder; bei Lücken gibt es eindeutig passende
Fachshop-Aufnahmen mit benannter Quelle. Rahmen, die als vollständiges Rad
abgebildet sind, werden als solche Modellreferenz gekennzeichnet.
Die Ausstattung kann je Modelljahr abweichen. Generische Teile ohne bestimmtes
Modell und selbst angelegte Teile bekommen kein fremdes Ersatzfoto.
Die Fotos sind keine KI-Bilder oder selbst erstellte Produktzeichnungen.

Der geprüfte Bestand enthält 688 Zuordnungen zu 679 Dateien und deckt
675 der 766 Katalogmodelle ab, einschließlich aller 90 Rahmen und 78 Reifen.
Nicht belegbare Modell-Lücken bleiben ohne erfundenes Ersatzfoto. Mehrere
Ausführungen eines Modells können ausdrücklich dieselbe Modellreferenz
verwenden; entsprechend dokumentierte Ausstattungshinweise stehen am Foto.

`bilder/produkte/ansicht.js` stellt transparente Dateien auf Schwarz dar.
Bei gleichmäßigen hellen Studiohintergründen entfernt die App ausschließlich
für die Anzeige deren Randflächen und große geschlossene Zwischenräume
(z. B. zwischen Gabelholmen, Rahmenrohren und Speichen). Die Originaldateien
bleiben erhalten; Produktfarben werden nicht invertiert. Die Verarbeitung
findet auf dem Gerät statt und benötigt keinen externen Bilddienst.
Nicht passende, dunkle oder farbige Fotohintergründe bleiben unverändert.

## Daten und Offlinebetrieb

Aufbau, Scores, Kompatibilität, Adapter, Preise, Pro-Regeln und gespeicherte
Fahrwerkwerte wurden für diese Fotoänderung nicht verändert. Der Foto-Dialog
hat eine eigene Ebene. Eigene Teile behalten ihre bestehenden Daten und
werden nicht mit Bildern ihrer Maßvorlage verwechselt.

Die Ansicht-Datei wird beim Installieren der App mitgespeichert. Produktfotos
werden weiterhin beim Abruf vom bestehenden Service Worker zwischengespeichert;
bereits geladene Bilder stehen anschließend offline bereit. Ein noch nicht
geladenes Foto kann offline fehlen, ohne die Teileauswahl zu beeinträchtigen.
Die Quellenlinks werden nur bei bewusster Auswahl geöffnet.

## Prüfung und Veröffentlichung

`npm test` prüft die vorhandenen Kompatibilitäts-, Setup-, Speicher-, Wege-,
Sprach-, Finder-, Adapter- und Preisszenarien sowie vierzehn zusätzliche
Foto-Benutzerwege in `tools/foto-test.mjs`. Die gesamte Bildbibliothek wird
im Browser dekodiert und gegen Katalog-IDs, Dateipfade und Quellen geprüft.
Bitmaps werden nach der Prüfung ausdrücklich freigegeben, damit diese
Prüfung auch mit einer größeren Bibliothek wenig Speicher belegt.

Die bestehende GitHub-Action `Veroeffentlichen` prüft vor der Veröffentlichung
und setzt App-Version und Cache automatisch. Es gibt keinen handgesetzten
Versionsstempel. Abschlussbericht, tatsächlicher Bildbestand, Live-Version
und Browserbelege stehen im CrankScore-Austausch.
