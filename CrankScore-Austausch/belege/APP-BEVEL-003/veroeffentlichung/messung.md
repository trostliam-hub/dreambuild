# Einführung: Ursache des roten Veröffentlichen-Laufs 38141146259

Gemessen in Chromium (Playwright), 390 × 844, ohne Grafikkarte wie im CI.
Zeiten in Seitenzeit ab dem Escape in Szene 3; `szenen-zeitmessung.mjs <wurzel> <Drossel> <Läufe>`.

## Vorher (8f12ff0)
Zwei getrennte Zeitgeber: Einrichtung nach 180 ms, Szenen-Ebene weg nach 260 ms.
Dazwischen blendet der Aufbau durch (Kopfleisten mit Unschärfe-Filter); das
nächste Bild kam erst nach bis zu 300 ms.

| Drossel | Einrichtung da | Szenen weg | größte Bildlücke |
|---|---|---|---|
| 1× | 189–447 ms | 402–504 ms | 185–301 ms |
| 4× | 234–246 ms | 267–282 ms | 71–73 ms |

Der Test sah fest nach 500 ms nach. Lokal reichte das knapp, im CI nicht.
Die Bildlücke wächst nicht mit der CPU-Drossel. Also ist es Grafikarbeit,
kein JavaScript: `oeffneEinstieg` selbst braucht 11–15 ms.

## Nachher (091c653)
Die Einrichtung öffnet sofort und liegt deckend unter den ausblendenden Szenen;
es gibt nur noch einen Zeitgeber, fürs Entfernen der Ebene.

| Drossel | Einrichtung da | Szenen weg |
|---|---|---|
| 1× | 9–15 ms | 369–374 ms |
| 12× | 136–192 ms* | 400–462 ms |

\* Bei 12× meldet der MutationObserver verzögert; die Einrichtung entsteht im selben Tastendruck.

Der Test wartet jetzt auf den Zustand (höchstens 5 s), statt fest 500 ms zu schlafen. Zusätzlich prüft er:
- Die Seite bleibt gesperrt.
- Ohne Folgeschritt wird die Seite freigegeben.
- Tasten während des Ausblendens wirken nicht.

Dabei fiel ein Folgefehler auf: Der allgemeine Escape-Handler schloss die eben
geöffnete Einrichtung im selben Tastendruck. Seitdem gehört Escape während
der Szenen allein ihnen.

## Alle Wege (`szenen-ende-wege.mjs`)
Escape, Überspringen und „Los geht's“ wurden jeweils mit normaler und mit
reduzierter Bewegung durchgespielt. Jedes Mal:
- Die Einrichtung ist sofort da.
- Bei normaler Bewegung ist sie deckend (Deckkraft 1, ohne Einblenden).
- Die Szenen-Ebene lässt Klicks durch.
- Die Seite bleibt gesperrt.
- Der Fokus liegt in der Einrichtung.
- Es gibt keine JS-Fehler.

Bei reduzierter Bewegung bleibt das kurze Einblenden über die Deckkraft wie bisher (150 ms).

Unter voller CPU-Last (6 Lastprozesse auf 4 Kernen) besteht `tools/bevel-test.mjs` dreimal hintereinander mit 27 von 27 Prüfungen.
