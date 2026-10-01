# CrankScore – Teile-Datenbank und Kompatibilitätsprüfung

Stand 01.10.2026. Die Datenbank lebt als Objekt `K` in `index.html` (die App ist
eine Datei und läuft offline). `docs/katalog.json` ist ein Export davon –
neu erzeugen mit `node tools/katalog-export.mjs`.

## Aufbau

```
K = { rahmen:[…], gabel:[…], daempfer:[…], laufraeder:[…], reifen:[…],
      schalthebel:[…], schaltwerk:[…], kassette:[…], kette:[…], kurbel:[…],
      innenlager:[…], bremsen:[…], lenker:[…], vorbau:[…], stuetze:[…],
      sattel:[…], pedale:[…], griffe:[…], steuersatz:[…], rahmenlager:[…] }
```

Jedes Teil hat `id`, `n` (Name), `m` (Marke), `g` (Gramm), `p` (Richtpreis €)
und `e` (Eignung 0–5 je Disziplin: xc, trail, enduro, dh, dirt, slope, trial).
Dazu kommen die **Normfelder**, mit denen die Prüfung rechnet (unten).

**Ausführungen** (`v`): Ein Modell steht einmal im Katalog; was es davon zu
kaufen gibt (Federweg, Einbaumaß, Freilauf, Scheiben, Durchmesser, Hub,
Klemmung, Welle, Einpressmaß …), hängt als Dimension daran. Jede Option
überschreibt Normfelder (`setzt`) und trägt nur den Preis-/Gewichtsabstand.
Gespeichert wird ein Teil als `basisId|option~option`, z. B.
`w-hope|110x15~148x12~xd`.

Gibt der Katalog für ein Feld nichts her, wird **nicht geraten**: Fehlt etwa
die native Bremsaufnahme eines Rahmens, prüft die App dort nur die maximale
Scheibe.

## Normfelder je Slot

### Rahmen
| Feld | Bedeutung | Werte |
|---|---|---|
| `lrV`, `lrH` | Laufradgröße vorn/hinten (Mullet = verschieden) | `29`, `27.5`, `26`, `24`, `20`, `19` |
| `maxGabel` | Freigegebener Gabel-Federweg (0 = Starrgabel) | mm |
| `schaft` | Steuerrohr-Art | `tapered`, `gerade` (1 1/8″), `dc` (Doppelbrücke) |
| `steuerrohr` | Steuerrohr nach SHIS, nur wo belegt | `ZS44/ZS56`, `IS41/IS52`, `IS42/IS52`, `ZS44/IS52`, `ZS56/ZS56`, `ZS44/EC56`, `ZS49/ZS56`, `EC34/EC34` |
| `ha` | Hinterachse (Einbaubreite × Achse) | `148x12` (Boost), `157x12` (Super Boost/DH), `150x12` (DH), `142x12`, `135x10`, `135x12`, `116x10` (Trial) |
| `haAdapter` | Hersteller-Umbaukit auf ein anderes Achsmaß | `{"150x12": [Name DE, EN]}` |
| `bb` | Tretlagergehäuse (`null` beim E-MTB) | `BSA68`, `BSA73`, `BSA83`, `PF92`, `PF107`, `PF30`, `BB30`, `T47`, `Spanish` |
| `udh` / `udhAb` | SRAM UDH (Transmission) / erst ab Modelljahr | `true` / Jahr |
| `daempfer` | Einbaumaß `{el, hub, typ}` | `typ`: `Standard`, `Trunnion`, `IsoStrut` |
| `stuetze`, `einsteck` | Sattelrohr-Ø, maximale Einstecktiefe | mm |
| `maxReifen` | Reifenfreiheit hinten | mm Reifenbreite |
| `maxScheibeHR` | Größte freigegebene Scheibe hinten | mm |
| `pmHR`, `hrAufnahme` | Native Aufnahme hinten, nur wo belegt | mm; `PM` (Standard), `FM`, `IS` |
| `klSoll` | Abweichende Soll-Kettenlinie (Sonderfälle) | mm |
| `seit` | Diese Generation gibt es seit | Jahr |
| `motor`, `motorSys`, `motorWelle`, `akku`, `ebike` | E-MTB | z. B. `Bosch CX`, `ISIS`, `800`, `full`/`light` |
| `ohne` | Slots, die am Rahmen entfallen | z. B. `["daempfer"]`, `["innenlager"]` |

### Gabel
`travel` (+ Ausführung Federweg), `schaft`, `va` (`110x15`, `110x20`, `100x15`, `100x20`),
`lr` (freigegebene Laufradgrößen), `maxReifen`, `maxScheibeVR`, `pmV` (native
Post-Mount-Aufnahme, nur wo belegt), `offset`.

### Dämpfer
`el`, `hub`, `typ` (+ Ausführung Einbaumaß, z. B. `230x65M` = 230 × 65 mm
Standard-Auge, `205x60T` = Trunnion).

### Laufradsatz
`lrV`, `lrH`, `va`, `ha` (+ Nabenbreite), `freilauf` (`HG`, `Micro Spline`, `XD`,
`Trial (Ritzel fest)`), `iw` (Maulweite), `maxSys` (Systemgewicht kg), `naben`
(`Center Lock`, `6-Loch`).

### Antrieb
- Schalthebel/Schaltwerk: `gaenge`, `iface` (`Shimano`, `Eagle`, `T-Type`,
  `Shimano LinkGlide`, `X-Actuation` …); Schaltwerk zusätzlich `maxRitzel`,
  `maxKB`, `udhPflicht`.
- Kassette: `gaenge`, `spanne`, `freilauf`, `tType`, `linkglide`.
- Kette: `gaenge`, `fuer` (weitere Gangzahlen), `iface` (`T-Type` = Flattop).
- Kurbel: `iface` (Welle: `Hollowtech II` 24 mm, `DUB`, `30 mm`, `ISIS`,
  `PowerSpline`, `E-MTB`), `kl` (Kettenlinie), `kb`, `geh` (83 = DH-Gehäuse),
  `motorWelle`/`motor` (E-MTB-Kurbel).
- Innenlager: `welle`, `gehaeuse` (Liste), `breit` (DUB Wide / CL55).

### Bremsen
`kolben`, `sV`/`sH` (+ Ausführung Scheiben), `mount` (`Center Lock`, `6-Loch`,
`Felge`).

### Cockpit, Sitz, Steuersatz
Lenker/Vorbau `klemm` (31.8 / 35), Vorbau `dm` (Direct Mount), Stütze `d`,
`hub`, `einbau`; Steuersatz `std` (SHIS), `rohr`, `unten` (`1.5` / `1.125`).

## Ampel

| Stufe | Bedeutung | Abzug am Score |
|---|---|---|
| **rot** – `fehler` | Inkompatibel, mit Begründung | 26 |
| **gelb** – `warnung` | Kompromiss | 9 |
| **gelb** – `warnung` + `adapter` | Passt mit Adapter/Umbau, Pille „mit Adapter“ | 4 |
| Tipp – `hinweis` | Grün, nur Hinweis | 2 |

## Regeln (Auszug der wichtigsten Normen)

**Adapter-Rechnung Bremse:** Post Mount ist für genau eine Scheibe gebaut.
Größer geht mit Adapter um die Differenz – `PM180 + 23 = 203`, `PM160 + 20 = 180`,
`PM200 + 3 = 203` (zwei 1,5-mm-Shims), `PM203 + 17 = 220`. Kleiner als nativ
ist rot (der Sattel säße über dem Scheibenrand). Flat Mount und IS brauchen
für Post-Mount-Sättel immer einen Adapter (gelb).

**SRAM UDH / Transmission:** Transmission-Schaltwerk nur an Rahmen mit UDH
(ab Modelljahr, wo es erst später kam), T-Type-Kassette nur mit Transmission,
Flattop-Kette Pflicht, Kettenlinie 55 mm.

**Achsen:** 148 ≠ 157 ≠ 150 ≠ 142/135 – rot; Hersteller-Umbaukit → gelb.
Vorderachse: Boost 110 ≠ Non-Boost 100 – rot; 15 ↔ 20 mm bei gleicher Breite
per Endkappen → gelb, wenn es die Nabe in der anderen Achse gibt.

**Freilauf:** HG, Micro Spline und XD sind nicht tauschbar (rot); wo der
Laufradsatz den passenden Freilauf als Ausführung hat, nennt der Befund das.

**Innenlager:** Gehäuse (BSA, PF92, PF107, PF30, BB30, T47, Spanish) und Welle
(24 mm, DUB, 30 mm, ISIS, PowerSpline) müssen beide stimmen; DUB Wide (55 mm)
braucht im Pressfit-Rahmen das Wide-Lager; 83-mm-DH-Kurbeln nur im 83er
Gehäuse und umgekehrt.

**Steuerrohr:** konische Gabel nie im geraden Rohr (rot); gerade Gabel im
konischen Rohr mit Reduzier-Unterteil (gelb); Steuersatz muss die SHIS-Norm
des Rahmens treffen – IS41 ≠ IS42.

**E-MTB:** Kurbel sitzt auf der Motorwelle (kein Innenlager): normale Kurbel
am E-MTB rot, E-Kurbel ohne Motor rot, andere Wellenart rot (Shimano EP ≠
ISIS), gleiche ISIS-Welle für einen anderen Motor gelb (anderer Versatz).
Full-Power mit 2-Kolben-Bremse gelb.

### Alle Befunde
rot: Diese Mischung gibt es nicht als ein Rad · Gabelschaft passt nicht ins
Steuerrohr · Dieser Rahmen ist für eine Starrgabel gebaut · Zu viel Federweg
für die Rahmenfreigabe · Gabel nicht für diese Laufradgröße · Dieser Rahmen hat
keine Dämpferaufnahme · Dämpfer-Einbaumaß passt nicht · Laufradgrößen passen
nicht zum Rahmen · Hinterachse passt nicht · Vorderachse passt nicht ·
Freilaufkörper passt nicht zur Kassette · Systemgewicht über der
Laufrad-Freigabe · Reifen … nicht lieferbar · Reifen … zu breit · Transmission
braucht ein UDH-Ausfallende · Schalthebel und Schaltwerk aus verschiedenen
Systemen · Gangzahlen passen nicht zusammen · Schaltwerk reicht nicht über die
Kassette · Kette passt nicht zum Schaltwerk · Transmission braucht eine
T-Type-Kassette · T-Type-Kassette nur mit Transmission · LinkGlide-Kassette
braucht ein LinkGlide-Schaltwerk (und umgekehrt) · Transmission braucht die
Flattop-Kette · Kettenlinie stimmt nicht (> 3 mm) · Kurbelwelle passt nicht zur
Gehäusebreite · E-MTB braucht eine Motor-Kurbel · Motor-Kurbel ohne Motor ·
Kurbel passt nicht auf die Motorwelle · Innenlager passt nicht ins
Tretlagergehäuse · Kurbelwelle passt nicht ins Innenlager · Steuersatz passt
nicht ins Steuerrohr · Steuersatz-Unterteil passt nicht zur Gabel · Rahmen hat
keine Bremssockel · Felgen ohne Bremsflanke · Bremsscheibe hinten zu groß ·
Bremsscheibe vorn zu groß für die Gabel · Bremsscheibe … zu klein für die
Aufnahme · Lenkerklemmung passt nicht zum Vorbau · Direct-Mount-Vorbau braucht
eine Doppelbrückengabel · Stützendurchmesser passt nicht · Stütze lässt sich
nicht weit genug versenken

gelb mit Adapter: Bremsscheibe … nur mit Adapter · Flat-Mount-Aufnahme … ·
IS-Aufnahme … · Gerader Gabelschaft nur mit Reduzier-Unterteil · Vorderachse
nur mit anderen Endkappen

gelb: Hinterachse nur mit Umbaukit · Weiter Spagat zwischen den Disziplinen ·
Modelljahr älter als diese Generation · Einfachbrückengabel im DH-Rahmen ·
Abweichender Hub · Laufradsatz nicht für diesen Einsatz freigegeben ·
Felgenmaulweite passt nicht zum Reifen · Vorderreifen greift schwächer als der
hintere · Schaltwerk und Kassette / Kette und Schaltwerk aus verschiedenen
Häusern · Kurbel und Kassette aus verschiedenen Welten · Kettenblatt größer als
vom Schaltwerk verdaut · Kettenlinie stimmt nicht (1,5–3 mm) · Kurbel für einen
anderen Motor gebaut · DUB-Wide-Kurbel braucht das Wide-Lager · Wide-Lager zu
einer normalen DUB-Kurbel · Kein Trial-Antrieb · Zwei Kolben am E-MTB · Zwei
Kolben für diesen Einsatz · Ahead-Vorbau an der Doppelbrücke · Starre Stütze ·
Dropper im Dirtpark · Aufbau unvollständig

Tipp: Federweg unter der Rahmenfreigabe · Reifen … an der Freigabe · Ritzel mit
Spacern ausrichten · Passendes Innenlager mitbestellen · Wide-Spacer fürs
DUB-Lager · Einpressmaß am Rahmen prüfen · Scheibenaufnahme abweichend · Kleine
Scheibe vorn am E-MTB · Ovalstreben am Sattel · Doppelbrücke mit langem Vorbau ·
Langer Vorbau für den Einsatzzweck · Sehr breiter Lenker für XC · Mehr Hub wäre
möglich

## Tests

`node tools/kompat-test.mjs` (Playwright/Chromium) spielt durch:

- `tools/kompat-faelle.mjs` – gezielte Regelfälle je Norm (UDH, Achsen,
  Freiläufe, Innenlager, Kettenlinie, Bremsaufnahmen, Steuersatz,
  Gehäusebreite, T47/BB30, E-MTB …).
- `tools/kompat-raeder.mjs` – 61 echte Räder als Komplettaufbau nach
  Serienausstattung: XC, Trail, Enduro, DH, Dirt, Slope, Trial, Hardtail,
  E-MTB (Full Power und Light). Jedes muss vollständig sein, darf nichts Rotes
  haben, und gelb nur dort, wo die Serie einen Adapter verbaut.

Schlägt ein Fall fehl, endet das Skript mit Rückgabewert 1.

## Woher die Daten kommen

Normen und Rahmendaten aus Hersteller-Support-Seiten (Santa Cruz, Trek,
Specialized, Commencal, Transition, Yeti, Ibis, Propain, Canyon/Acros, SRAM
UDH-/E-MTB-Liste, Shimano), Vital MTB, Pinkbike, enduro-mtb.com, Flow MTB,
Blister, emtb-forums. Geometrie, Einstecktiefe und Gewichte sind Richtwerte
für die Modellklasse (Größe L).
