# 3D-Beispielrad (Propain Spindrift 5 AL, Größe L, Mullet)

Ein mit Blender gebautes 3D-Modell. In der App steht es auf zwei Arten:

- als **vorgerendertes Bild** (`bilder/beispielrad-seite-640.webp` und `-1200.webp`)
  im Radbild des Aufbaus, **nur wenn der gewählte Rahmen der Propain Spindrift ist**
  (BEVEL-002; vorher stand es als Beispielrad auch über fremden Rädern);
- als **3D-Ansicht auf Tippen** („In 3D ansehen“): three.js aus `vendor/three-0.169.0/`
  und das GLB laden erst dann, aus diesem Repo, nie beim Start. Ohne WebGL oder bei
  einem Ladefehler bleibt das Bild stehen. Seit Abschnitt 10 beleuchtet der
  Betrachter das Rad zusätzlich mit einem Licht von oben und legt einen weichen
  Bodenschatten darunter (VSM-Schatten, Schattenmaterial am Boden); ausgeblendete
  Baugruppen werfen keinen Schatten.

Nachgebaut ist nur der **Rahmen**. Gabel, Dämpfer, Laufräder, Antrieb, Bremsen,
Cockpit und Sitz sind allgemeine Bauformen in echten Maßen — das steht in der App
unter der Ansicht, und im GLB trägt jedes dieser Teile `generisch: true`.

**Module (BEVEL-002):** `skripte/module.py` ordnet jedes Objekt einer
Teile-Kategorie der App zu (`rahmen`, `gabel`, `daempfer`, `laufraeder`,
`reifenVR`, `reifenHR`, `bremsen`, `kurbel`, `kassette`, `kette`, `schaltwerk`,
`innenlager`, `pedale`, `lenker`, `vorbau`, `griffe`, `steuersatz`, `stuetze`,
`sattel`). Die Zuordnung steht als Objekt-Eigenschaft in der .blend
(`crankscore_slot`, `generisch`) und als glTF-`extras` an 146 Knoten im GLB. Der
Betrachter hebt damit eine Baugruppe hervor, ohne Namen zu raten.

**Aussehen:** nach Liams Vergleichsfoto eines Propain (09.10.2026) — weißer Rahmen,
rote Tauchrohre, schwarze Anbauteile, rahmenfarbener oberer Hebel, silberne
Flat-Pedale. Auf dem Unterrohr steht statt des Herstellernamens groß
**CRANKSCORE** in der App-Schrift Inter, wie das App-Logo zweifarbig („CRANK“
dunkel, „SCORE“ grau); unten am Tretlager ein dunkler Unterrohrschutz. Andere
Markenlogos (Gabel, Laufräder, Reifen) sind nicht nachgebildet.

**Grenze:** Die Herstellerseiten (propain-bikes.com) sind aus der Arbeitsumgebung
gesperrt. Wie nah das Modell am echten Rad ist, ließ sich deshalb nicht mit
offiziellen Bildern abgleichen; die Maße stammen aus den unten genannten Quellen.

## Dateien

| Datei | Inhalt | Größe |
|---|---|---|
| `modell/spindrift-5-al.blend` | bearbeitbare Szene (komprimiert, Schriftzug-Textur eingepackt): Sammlungen je Baugruppe, Studio, zwei Kameras, Animation | 1,8 MB |
| `modell/spindrift-5-al.glb` | optimiertes GLB (Draco, Stufe 10) mit Schriftzug-Textur, Modul-Angaben als extras, ein Animations-Clip „Spindrift_Bewegung“ — lädt die App auf Tippen | 0,93 MB |
| `bilder/rad-seite.png`, `bilder/rad-dreiviertel.png` | Renderings mit transparentem Grund und weichem Bodenschatten (Cycles, 128 Samples, entrauscht; Fotostudio aus `aussehen.py`) | 1,4 und 1,1 MB |
| `skripte/` | alles, was Modell, Renderings, GLB und Prüfung reproduzierbar erzeugt | |
| `skripte/unterrohr-dekor.png` | Schriftzug-Textur des Unterrohrs (aus `dekor.py`) | 0,1 MB |
| `skripte/lagersuche/` | die numerische Suche der Hinterbau-Drehpunkte (Belege, nicht nötig zum Bauen) | |
| `pruefung/` | Prüfseite für das GLB mit three.js (Chromium) | |

Ohne Draco wäre das GLB 5,2 MB groß. Das Modell hat rund 159 000 Dreiecke in 149 Objekten
(vor Abschnitt 10: 133 000 in 138; dazugekommen sind vor allem Sattel, Nippel, Ventile und die vordere Leitung).

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

**Details (BEVEL-002, Abschnitt 10):** Speichennippel (32 je Rad, blank), ein
Tubeless-Ventil je Felge (Presta, mit Mutter und Kappe, mittig zwischen zwei
Speichenenden), Bremsscheiben aus eigenem Stahl, Kette mit blanken Laschen und
dunklen Rollen, Schaltwerk mit B-Gelenk, zwei Parallelogramm-Laschen mit Bolzen,
P-Gelenk und einem Käfig mit Taille (statt eines einzelnen Blocks), Sattel mit
Volumen (Polster mit runder Kante auf einer Schale, Oberkante rund 45 mm über den
Streben wie bei üblichen MTB-Sätteln; vorher ein flaches Brett), Anschluss oben am
vorderen Bremssattel und die **vordere Bremsleitung**, die vorher fehlte: vom
Sattel hinter dem linken Tauchrohr hoch, außen herum zum Clip an der Gabelbrücke,
in einem Bogen vor dem Steuerrohr zum rechten Hebel. Alles sind allgemeine
Bauformen; Herstellerwerte wurden nicht neu angenommen.

Materialien: lackiertes Aluminium (`Lack_Rahmen`, Farbe als Parameter
`baue(lack="#e7e8e5")`), lackierte Tauchrohre (`Gabel_Lack`, `baue(gabel="#b11c2a")`),
schwarz eloxiertes Aluminium, Kunststoff, Gummi, blanker und dunkler Stahl, Standrohr,
Kolbenstange, Feder, Sattel, Lager — matt bis seidig, keine Spiegelflächen. Bauteile
und Farben lassen sich einzeln tauschen.

**Aussehen im Rendering (`skripte/aussehen.py`, Abschnitt 10):** harte Teile
(gefräst, gegossen, gestanzt) bekommen einen Bevel-Knoten, damit ihre Kanten Licht
fangen wie echte gerundete Kanten; Reifen und Griffe eine feine Körnung; der
Klarlack von Rahmen und Gabel eine sehr leichte Orangenhaut; die Bremsscheiben
eine gedrehte Oberfläche (Anisotropie um die Achse). Das Studio ist ein Verlauf
(Boden dunkel, Horizont, Decke hell), den Lack und Metall spiegeln, dazu eine
große Softbox oben, ein schmaler Lichtstreifen auf der Kameraseite für lange
Glanzlinien auf den Rohren, eine schwache Aufhellung und zwei Streiflichter von
hinten. Diese Knoten wirken nur in Cycles. Das GLB bekommt die Grundwerte
(Farbe, Metall, Rauheit, Klarlack); `export_glb.py` nimmt die Anisotropie vor dem
Export heraus, weil das Modell an den Scheiben keine UV-Koordinaten hat.

Schriftzug: Das Unterrohr hat eine UV-Abwicklung (`werkzeug.rohr(..., uv=True)`), das
Material `Lack_Rahmen_Dekor` legt `unterrohr-dekor.png` darüber. Auf der
Antriebsseite liest der Schriftzug vom Tretlager zum Steuerrohr, auf der anderen
Seite wie auf dem Foto vom Steuerrohr nach unten. Versalhöhe 41 mm, Länge 40 cm.
Wer die Lackfarbe ändert, setzt `LACK` in `dekor.py` gleich und erzeugt die Textur neu.

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
geschlossen und läuft über der Kettenstrebe. Die vordere Bremsleitung hat ein
eigenes Skelett mit zwei Knochen: der untere Teil folgt den Tauchrohren, der obere
bleibt am Lenker, dazwischen wird gemischt — die Leitung reißt beim Einfedern nicht
ab. In der App läuft keine Animation.

## Geprüft

- **Kollisionen** (`skripte/kollision.py`): Schnitte zwischen Bauteilen
  verschiedener Baugruppen in Ruhe, bei 50 % und 100 % Federweg — **0 unerwartete**.
  Gewollte Berührungen (Bolzen in Hebeln, Achsen in Naben, Hebel am Lenker,
  Leitungen in Zugeinlässen) stehen in einer Liste; die Liste wurde einzeln
  durchgesehen.
- **GLB** in Chromium (headless, WebGL über SwiftShader) mit three.js 0.169 und
  DRACOLoader: lädt in 0,4–0,6 s, 157 Meshes, eine Textur, ein Clip, keine Konsolenfehler; Ruhe,
  eingefedert und gerollt sichtbar.
- **Abschnitt 10:** Kollisionen nach den neuen Details wieder **0 unerwartete** bei 0/50/100 %
  (die vordere Leitung wird mit ihrem Skelett ein- und ausgefedert geprüft); gewollt und
  in die Liste aufgenommen sind nur Leitung im Sattel-Anschluss, Leitung im Clip,
  Anschluss im Sattel und Schaltzug im B-Gelenk. Im App-Betrachter (SwiftShader,
  390 px): lädt in 2,1 s, 176 Meshes, alle mit Teile-Kategorie, keine Konsolenfehler.
- **Renderings** auf hellem (#f2f2f7, Weiß) und dunklem Grund (Schwarz, #1c1c1e).

Nicht geprüft: echte Geräte (kein iPhone/Android in der Arbeitsumgebung) und
andere Browser als Chromium.

## Neu erzeugen

Blender 5.0 (getestet mit dem Python-Modul `bpy` 5.0.1), Pillow und fontTools (mit brotli):

```
cd 3d/skripte
python dekor.py unterrohr-dekor.png                    # Schriftzug-Textur (nur nach Änderungen nötig)
python bau.py ../modell/spindrift-5-al.blend          # oder: blender -b -P bau.py -- ../modell/spindrift-5-al.blend
python kollision.py                                    # Kollisionsprüfung (0/50/100 %)
# (bau.py holt Materialfeinheiten und Studio-Licht aus aussehen.py)
python render_final.py ../modell/spindrift-5-al.blend /tmp/roh 128 2000
python nachbearbeitung.py /tmp/roh/roh-seite.png /tmp/roh/roh-dreiviertel.png /tmp/bilder
python module_speichern.py ../modell/spindrift-5-al.blend   # Teile-Kategorien in die .blend
python export_glb.py ../modell/spindrift-5-al.blend ../modell/spindrift-5-al.glb 1
```

`nachbearbeitung.py` schneidet zu, legt Prüfbilder auf hellem und dunklem Grund an
und schreibt die WebP-Dateien (640 und 1200 px) samt Vorschaubild (data-URI) für
`index.html`. Drehpunktsuche: `cd skripte/lagersuche && PYTHONPATH=.. python3 opt_s.py 104 24`.
