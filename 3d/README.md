# 3D-Beispielrad (Propain Spindrift 5 AL, Größe L, Mullet)

Ein mit Blender gebautes 3D-Modell, das in der App als **vorgerendertes Bild** die
gezeichnete Radgrafik auf Startseite, Begrüßung und in der ersten Rundgang-Karte
ersetzt (`bilder/beispielrad-seite-640.webp` und `-1200.webp`). Die App lädt kein
3D-Modell; drehen oder zoomen bringt an diesen Stellen keinen konkreten Nutzen.
Das GLB liegt für später bereit.

Das Modell zeigt **ein Beispielrad**. Es steht nicht für den Rahmen, den jemand in
der App ausgewählt hat; deshalb steht unter dem Bild „Beispielrad: Propain
Spindrift 5 AL, Größe L, Mullet“.

## Dateien

| Datei | Inhalt | Größe |
|---|---|---|
| `modell/spindrift-5-al.blend` | bearbeitbare Szene (komprimiert): Sammlungen je Baugruppe, Studio, zwei Kameras, Animation | 1,5 MB |
| `modell/spindrift-5-al.glb` | optimiertes GLB (Draco, Stufe 10), ein Animations-Clip „Spindrift_Bewegung“ | 0,75 MB |
| `bilder/rad-seite.png`, `bilder/rad-dreiviertel.png` | Renderings mit transparentem Grund und weichem Bodenschatten (Cycles, 128 Samples, entrauscht) | 1,4 und 1,1 MB |
| `skripte/` | alles, was Modell, Renderings, GLB und Prüfung reproduzierbar erzeugt | |
| `skripte/lagersuche/` | die numerische Suche der Hinterbau-Drehpunkte (Belege, nicht nötig zum Bauen) | |
| `pruefung/` | Prüfseite für das GLB mit three.js (Chromium) | |

Ohne Draco wäre das GLB 4,7 MB groß. Das Modell hat rund 130 000 Dreiecke.

## Maße

Ebene der Seitenansicht: Tretlager im Ursprung, alles in mm (`skripte/geo.py`).

| Wert | Modell | Herkunft |
|---|---|---|
| Reach / Stack | 480 / 644 | Rahmenset-Tabelle (laut Suchergebnis; die Propain-Seite ist aus der Arbeitsumgebung gesperrt) |
| Steuerrohr | 110 | dto. |
| Lenkwinkel | 63,9° | dto. |
| Sitzwinkel effektiv | 78,7° | dto. |
| Sitzrohr / Oberrohr eff. | 460 / 612 | dto. |
| Kettenstrebe | 435 | dto. |
| Radstand | 1264 | dto. |
| Tretlager-Offset hinten / vorn | 14 / 27 | dto. |
| Tretlagerhöhe | 349 | Vital MTB (L, Mullet) |
| Federweg hinten / vorn | 180 / 180 | Propain |
| Dämpfer | 230 × 65 | Pinkbike |
| Laufräder | 29″ vorn, 27,5″ hinten, Reifen 2,5″ | Mullet-Ausstattung |

Gegencheck: Aus Reach, Stack, Steuerrohr, Lenkwinkel und Radstand ergibt sich
rechnerisch eine Gabel mit 597,7 mm Einbaulänge (Achse bis Steuerrohr unten) und
42,2 mm Versatz. Propain nennt laut Suchergebnis 596 mm und 44 mm.

**Widersprüche in den Quellen:** Ein späteres Suchergebnis nennt für dieselbe
Spalte Stack 647, Sitzwinkel effektiv 78,3° und Radstand 1278 (die Zuordnung zur
Größe ist dort unsicher). Die gezeichnete Radgrafik der App (`SPINDRIFT` in
`index.html`) rechnet mit Kettenstrebe 445, Sitzwinkel 78,4°, Tretlagerabsenkung
20 und Radstand 1278. Das sind unterschiedliche Stände bzw. Flip-Chip-Stellungen.
Ohne Zugang zur Propain-Tabelle ist nicht zu klären, welcher Stand aktuell ist;
die App-Daten sind deshalb unverändert.

## Hinterbau (PRO10) — Drehpunkte geschätzt

Es gab keinen Zugang zu offiziellen Produktbildern oder der Explosionszeichnung
(propain-bikes.com und das Propain-Hilfeportal sind in der Arbeitsumgebung
gesperrt). Die vier Hebel-Drehpunkte und die beiden Dämpferaugen stammen aus einer
numerischen Suche mit diesen Bedingungen:

- Dämpfer 230 × 65 schwimmend zwischen zwei kurzen Hebeln, steht vor dem Sitzrohr
  (fast parallel dazu); oberes Auge geht beim Einfedern nach unten, unteres nach
  oben — er wird von beiden Seiten zusammengedrückt.
- 65 mm Hub ergeben **178,7 mm** Federweg (Ziel 180), leicht progressiv
  (Übersetzung 2,96 am Anfang, 2,63 am Ende).
- Freigänge in Ruhe, bei 25/50/75 % und voll eingefedert: Dämpfer und Feder gegen
  Sitzrohr, Unterrohr, Oberrohr, Tretlager und Lageraufnahmen; Hebel gegen Rohre,
  Feder und Reifen; Reifen gegen Sitzrohr und Dämpfer; das Kettenstreben-Lager
  bleibt über den ganzen Federweg unter dem oberen Kettentrum.

**Abweichung:** Propain beschreibt die PRO10-Hebel als gegenläufig. Mit dieser
Rahmengeometrie fand die Suche keine gegenläufige Lösung mit 180 mm, die alle
Freigänge einhält; im Modell drehen beide Hebel gleichsinnig (oben −47,7°, unten
−40,8° bei vollem Hub). Sobald die Explosionszeichnung zugänglich ist, sollten die
Punkte in `geo.py` durch gemessene ersetzt werden.

| Hub | Rad hoch | Rad vor | oberer Hebel | unterer Hebel | Hinterbau |
|---|---|---|---|---|---|
| 16 mm | 47,0 | −17,8 | −11,9° | −13,4° | −4,6° |
| 32,5 mm | 93,6 | −27,3 | −24,0° | −24,8° | −9,1° |
| 49 mm | 137,7 | −29,8 | −35,9° | −33,9° | −13,4° |
| 65 mm | 178,7 | −26,6 | −47,7° | −40,8° | −17,7° |

## Aufbau des Modells

Jede Baugruppe ist eine eigene Sammlung, jedes Teil ein eigenes Objekt:
Rahmen, Hinterbau, Hebel (mit Lagerbolzen als eigene Objekte), Dämpfer (Körper,
Kolbenstange, Feder getrennt), Gabel (Krone/Standrohre fest, Tauchrohre/Brücke/Achse
beweglich), Laufrad vorn und hinten (Reifen, Felge, Nabe, Speichen, Bremsscheibe),
Antrieb (Kurbeln, Kettenblatt, Kettenführung, Bashguard, Kassette 10–52, Schaltwerk,
Kette), Bremsen, Cockpit, Sitz (Stütze, Sattel), Leitungen. Die Bewegung hängt an
Steuer-Empties in der Sammlung „Steuerung“.

Materialien: lackiertes Aluminium (`Lack_Rahmen`, Farbe als Parameter
`baue(lack="#4f5d6a")`), schwarz eloxiertes Aluminium, Kunststoff, Gummi, blanker und
dunkler Stahl, Standrohr, Kolbenstange, Feder, Sattel, Lager — matt bis seidig,
keine Spiegelflächen. Bauteile und Farben lassen sich einzeln tauschen.

Teile ohne Marke: Dämpfer, Gabel, Antrieb und Bremsen sind allgemeine Bauformen in
echten Maßen (Stahlfederdämpfer 230 × 65, 38er-Gabel 180 mm, 12-fach 10–52,
Vierkolbenbremsen, Scheiben 220/203), keine Nachbildung bestimmter Produkte.

## Animation

30 Bilder/s, ein Clip (GLB: „Spindrift_Bewegung“, 4,03 s):

- **Bild 1–46 Federn:** einmal 40 % ein- und wieder ausfedern. Hinterbau dreht um die
  berechneten Drehpunkte, Hebel und Dämpfer folgen, die Gabel taucht entlang der
  Standrohre ein, beide Reifen bleiben am Boden.
- **Bild 61–121 Rollen:** 0,5 m vorrollen; jedes Rad dreht um seine Achse um
  Weg / Radius (vorn 76,2°, hinten 78,9°).

Kein Endlos-Loop. Die Kette hat ein kleines Skelett: Glieder am Kettenblatt folgen
dem Rahmen, an Kassette und Schaltwerk dem Hinterbau, jedes freie Trum hat einen
Knochen, der beim Einfedern gedreht und gestreckt wird — so bleibt die Kette
geschlossen und läuft über der Kettenstrebe. In der App läuft keine Animation.

## Geprüft

- **Kollisionen** (`skripte/kollision.py`): Schnitte zwischen Bauteilen
  verschiedener Baugruppen in Ruhe, bei 50 % und 100 % Federweg — **0 unerwartete**.
  Gewollte Berührungen (Bolzen in Hebeln, Achsen in Naben, Hebel am Lenker,
  Leitungen in Zugeinlässen) stehen in einer Liste; die Liste wurde einzeln
  durchgesehen.
- **GLB** in Chromium (headless, WebGL über SwiftShader) mit three.js 0.169 und
  DRACOLoader: lädt in 0,2–0,6 s, 118 Meshes, ein Clip, keine Konsolenfehler; Ruhe,
  eingefedert und gerollt sichtbar.
- **Renderings** auf hellem (#f2f2f7, Weiß) und dunklem Grund (Schwarz, #1c1c1e).

Nicht geprüft: echte Geräte (kein iPhone/Android in der Arbeitsumgebung) und
andere Browser als Chromium.

## Neu erzeugen

Blender 5.0 (getestet mit dem Python-Modul `bpy` 5.0.1) und Pillow:

```
cd 3d/skripte
python bau.py ../modell/spindrift-5-al.blend          # oder: blender -b -P bau.py -- ../modell/spindrift-5-al.blend
python kollision.py                                    # Kollisionsprüfung (0/50/100 %)
python render_final.py ../modell/spindrift-5-al.blend /tmp/roh 128 2000
python nachbearbeitung.py /tmp/roh/roh-seite.png /tmp/roh/roh-dreiviertel.png /tmp/bilder
python export_glb.py ../modell/spindrift-5-al.blend ../modell/spindrift-5-al.glb 1
```

`nachbearbeitung.py` schneidet zu, legt Prüfbilder auf hellem und dunklem Grund an
und schreibt die WebP-Dateien (640 und 1200 px) samt Vorschaubild (data-URI) für
`index.html`. Drehpunktsuche: `cd skripte/lagersuche && PYTHONPATH=.. python3 opt_s.py 104 24`.
