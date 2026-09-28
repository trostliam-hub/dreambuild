# CrankScore

MTB-Konfigurator für den DACH-Raum. Baut Traumräder, prüft sie gegen Normmaße
und Herstellerfreigaben, bewertet die Abstimmung und schlägt Upgrades vor.

## Was die App macht

**Kompatibilitäts-Engine.** Über zwanzig Regeln auf echten Standards:
Gabelschaft und Federwegfreigabe, Dämpfer-Einbaumaß (Trunnion/Metric),
Achsstandards (Boost 148, Super Boost 157, 142, 135 QR, 116 Mod),
Freilaufkörper (HG / Micro Spline / XD / Trial), Kettenlinie abhängig von
Hinterbau und Schaltungsgeneration, UDH-Pflicht bei SRAM Transmission,
Reifenbreite gegen Rahmen- und Gabelfreiheit sowie Felgenmaulweite,
Bremsscheibengröße gegen Freigabe, Center Lock gegen 6-Loch, Felgenbremse
gegen Bremssockel und Bremsflanke, Lenkerklemmung 31,8 gegen 35,
Stützendurchmesser und Einstecktiefe, Systemgewicht gegen Laufrad-Freigabe,
Innenlager gegen Tretlagergehäuse (BSA 68/73/83, PressFit 92/107, PF30,
Spanish) und Kurbelwelle (DUB, Hollowtech II, 30 mm, PowerSpline, ISIS).

**Zwei getrennte Werte.** *Passform* misst, ob es mechanisch zusammenpasst.
*Einsatz* misst, ob alle Teile in dieselbe Richtung ziehen — ein Enduro-Rahmen
mit XC-Bremsen ist fehlerfrei und trotzdem falsch gebaut.

**Einstieg.** Beim ersten Öffnen ein Rundgang über den ganzen Bildschirm — auch
einmal für alle, die die App schon vorher hatten (ein schon gebautes oder
eingetragenes Rad bleibt dabei unangetastet, das Ergebnis landet in einem
neuen Profil). Gleich oben die Sprachwahl Deutsch / English, dazu ein
gezeichnetes Rad, gestaffelt einfliegende Karten und Konfetti am Ende: Was hast
du vor (neues Rad, eigenes Rad, Gebrauchtrad)? Wie lange fährst du schon? Wo
fährst du am liebsten (die sieben Disziplinen in Alltagssprache)? Vier
Fahrstil-Fragen (Tempo bergab, Sprünge, Fahrwerksgefühl, Anteil bergauf), der
gewünschte Charakter des Rads (verspielt, ausgewogen, laufruhig), Größe und
Gewicht, Schulterbreite, Schrittlänge, Spannweite und Handschuhgröße — beim
Traumrad dazu Budget, Vorlieben (Laufradgröße, Hardtail oder Fully, Flat- oder
Klickpedal — nur die Optionen, für die es einen zur Disziplin passenden Rahmen
gibt), Wunschmarken und Schwerpunkt. Jede Antwort wirkt: Die
Fahrstil-Fragen füllen den Federungsrechner, die Erfahrung schaltet die
Leitkarte, Budget, Vorlieben und Marken gehen in den Assistenten (eine
Rahmen-Vorliebe, die das Budget sprengen würde, lässt er fallen und sagt es), und am Ende baut der
Assistent das Rad gleich in den eigenen Maßen. Überspringen geht jederzeit,
wiederholen unter ⋮ → Hilfe → Einführung & Fragen oder unter Profile →
Einführung wiederholen.

**Dein Fit.** Aus Körpergröße, Schrittlänge, Schulterbreite und Spannweite (was
fehlt, wird aus der Größe geschätzt und so markiert): Rahmengröße (gemittelte
Größentabelle, Specialized S1–S6, zwischen zwei Größen entscheidet der
gewünschte Charakter), Ziel-Reach, Lenkerbreite (halb Schultern, halb
Spannweite, je Disziplin verschoben), Vorbau, Kurbel (nach Schrittlänge,
Enduro und Downhill eine Stufe kürzer), Hub der Variostütze
((Schrittlänge − 58) × 7,5, wie die Tabellen von OneUp und PNW), Sattelhöhe,
Laufradgröße, Rise und Griffdicke. Beim Eingeben zeigt eine Figur (Gesicht,
Frisur, Trikot, Shorts, Socken, Schuhe; Statur nach dem Gewicht) die
Rahmengröße live, eine Cockpit-Ansicht Schultern und Lenker in echter Breite.
Im Fit sitzt ein Fahrer in deiner Größe auf dem Rad, Beine und Arme aus Sattel,
Pedal und Griff gerechnet (Trikot mit Licht und Schatten, Handschuhe,
Knieschoner, Flat-Schuhe). Beide Fahrer tragen einen Fullface-Helm nach Art des
Fox Rampage (ohne Logo): eckiger, markanter Kinnbügel mit Facetten und
Bruchkanten, scharfer Spitze, Mundgitter und
Seitenschlitzen, eckiger fester Schirm mit Schrauben, Lüftungsschlitze, dunkler
Unterrand; dazu eine MX-Goggle mit Rahmen, getönter Linse, Stiften,
Rahmenlüftung, Nasenschutz, Seitenaufhängung und breitem Silikonband.
Das Rad ist nach der Geometrie des Propain Spindrift 5 AL gezeichnet (S–XL,
im Fit folgt die Größe deinem Reach, auf der Begrüßung steht das lange XL): Lenkwinkel 63,9°, Sitzwinkel 78,4°, Kettenstrebe
445 mm, Tretlagerabsenkung 20 mm, Mullet 29/27,5″, 180 mm Federweg. Das
Steuerrohr ist aus Stack und Gabel-Einbauhöhe zurückgerechnet, damit stimmt
auch der Radstand (L: 1280 statt 1278 mm). Dazu PRO10-Hinterbau mit zwei
Hebeln und senkrechtem Stahlfederdämpfer 230×65, Gabel in den Maßen einer
38er (Achse bis Krone ~588 mm, gut 200 mm freies Standrohr, 340 mm Tauchrohr,
Brücke vorn über dem Reifen, Krone mit Klemmschrauben), Reifen mit Stollen,
32 Speichen, Bremsscheiben, 12-fach-Antrieb mit Schaltwerk und Kettenführung,
Vario-Stütze. Dirt und Trial bekommen ein 26″-Hardtail.
Im Aufbau steht an Rahmen, Lenker, Vorbau, Kurbel und Stütze, was zu dir passt
(„auf 780 mm kürzen“, „Größe L bestellen“); die Prüfung hat eine eigene Rubrik
*Passt das Rad zu dir?*, die nur zeigt, was nicht passt, und nicht in die
Wertung zählt. Der Assistent stellt
Kurbellänge, Hub, Vorbaulänge und Rise auf den Fahrer ein — nur innerhalb des
Modells und nur, wenn die Prüfung dadurch nicht schlechter wird. Einkaufsliste
und kopierter Text nennen Rahmengröße, Lenkerkürzung und Sattelhöhe für die
Werkstatt. Die Maße gelten wie das Fahrergewicht für alle Profile.

**Für Einsteiger.** Oben im Aufbau führt eine Leitkarte Schritt für
Schritt: je Modus drei bis vier Schritte, abgehakt, was erledigt ist, ein Knopf
für den nächsten. Jedes Bauteil hat einen Satz „Was ist das?“, unter ⋮ → Hilfe
stehen Fit, Begriffe (Boost, Freilauf, Kettenlinie …) und der Federungsrechner;
die Einführung liegt unter Profile, die Erklärung der Wertung direkt an der
Wertung. Ausführungen (Einbaumaß, Federweg …) sind eingeklappt, bis man sie
ändern will; die Teilekachel nennt dann nur das Modell, damit nichts doppelt
steht. Der Reiter *Kaufen* hat eine Einkaufsliste mit Shop-Knöpfen, als
Text kopierbar für die Werkstatt.

**Sieben Disziplinen,** einzeln oder gemischt: Cross Country, Trail, Enduro,
Downhill, Dirtjump, Slopestyle, Trial. Mischungen werden auf Machbarkeit
geprüft — XC plus Downhill ergibt kein Rad, sondern zwei.

**Profile.** Traumrad, Mein Rad und Angebot sind getrennt, und jeder Modus hat
beliebig viele Profile: eigene Teile, Disziplinen, Budget, Markenwünsche,
Modelljahr, Foto und (Angebot) Zustand und Preis. Nur das Fahrergewicht gilt
für alle. Umschalten über die Leiste unter dem Modus-Umschalter.

**Traumrad-Assistent.** Sechs Schritte (Disziplin, Budget, Fahrergewicht,
Markenwünsche, Priorität) und der Generator baut einen vollständigen,
konfliktfreien Aufbau innerhalb des Budgets — höchstens 100 € darüber. Reicht
es nicht, nimmt er zuerst ein älteres Rahmen-Modelljahr (Vorjahr im
Abverkauf, bis drei Jahre älter zum Gebrauchtpreis), dann einfachere
Kleinteile. Rahmen, Gabel und Dämpfer bleiben immer echte Teile der
Disziplin; geht es trotzdem nicht, sagt die App, was die Disziplin mindestens
kostet. Markenwünsche sind verbindlich: gibt es von der Marke ein Teil, das
sauber passt, kommt nur sie in Frage (SRAM-Wunsch bei Downhill = SRAM GX DH
oder X01 DH 7-fach). Wo die Marke nichts Passendes hat, etwa keine
Dirt-Kurbel, steht das im Ergebnis.

**Upgrades, die wirklich welche sind.** Drei Sorten: *kostenlos umstellen*
(dasselbe Teil in der passenden Ausführung, etwa Federweg 160 → 140 mm),
*Ersatz* (das Teil passt nicht — Ersatz in derselben Preisklasse) und *echte
Upgrades* (mindestens so hochwertig UND besser bewertet). Leere Plätze sind kein
Upgrade; am eigenen Rad ist ein neuer Rahmen keins, und „Günstiger, gleiche
Maße“ gibt es nur beim Planen. Beim eigenen Rad und beim Angebot folgt die
Disziplin dem eingetragenen Rahmen.

**Federungsrechner.** In der Gruppe Fahrwerk (und unter ⋮ → Hilfe): aus
Fahrergewicht (+4 kg Ausrüstung) und einem Fahrprofil aus fünf Fragen
(Gelände, Tempo bergab, Sprünge, gewünschtes Gefühl, Anteil bergauf) je Gabel und Dämpfer ein Luftdruck in psi/bar mit Sag-Ziel, bei
Stahlfeder die Federhärte, dazu zwei Druckstufen-Einstellungen: *Abfahrt*
(ruppig, schnell) und *Sprünge* (Absprung und Landung). Grundlage sind die
Herstellertabellen (Fox Owner's Manuals 2025 für 32/34/36/38/40,
RockShox-Tabellen für Pike, Lyrik, ZEB, SID, Domain, BoXXer, Recon, Reba,
LinearXL ab Modelljahr 2027); Gabeln ohne eigene Tabelle bekommen den Wert
ihrer Klasse und sagen das. Druckstufen als Klicks ab der Grundeinstellung des
Herstellers (GRIP X2 5/10, GRIP X 10/10 von zu, sonst Mitte). Dämpfer: Luft
rund Körpergewicht in lb, skaliert mit der geschätzten Hinterbau-Übersetzung;
Stahlfeder = Last hinten × Übersetzung / (Hub × Sag). Die Dämpfer-Druckstufe
richtet sich nach Modell *und* Ausführung: RockShox RC2T (Super Deluxe und
Vivid Ultimate) mit HSC und LSC in je 5 Stellungen, Fox Float X2 und DHX2
mit HSC 8 / LSC 16 Klicks, Float X mit LSC 11, Float DPS mit Open-Mode-Adjust,
Cane Creek DB IL (gezählt ab offen, HSC in Umdrehungen), Öhlins TTX; Select+
und Performance zeigen nur den Kletterhebel, Select (R) keine Druckstufe.
Zwei Einsätze mit gegensätzlichen Zielen (nach den Tuning-Guides von Fox und
RockShox sowie ENDURO, BikeRadar, MBR): *Abfahrt, ruppig und schnell* — HSC
offener für Grip auf Kanten, Zugstufe schneller gegen Wegsacken bei
Schlagfolgen; *Sprünge & Bikepark* — LSC fester gegen Einsacken im Absprung,
HSC fester für Landungen, Zugstufe langsamer gegen Aushebeln am Kicker, dazu
+5 % Luft oder ein Volumen-Spacer. Die Zugstufe steht in Klicks ab dem eigenen
Grundwert (Tabelle am Holm oder Bordsteintest).
Jede Antwort verschiebt Low- und High-Speed um feste Stufen (eine Stufe =
12 % des Einstellbereichs, ab drei Stufen zählt jede weitere halb, ganz zu
wird bei Knöpfen mit vielen Klicks nie empfohlen): Flowtrails und zügiges
Tempo machen die LSC fester, ruppiges Gelände die HSC offener, Sprünge und
Bikepark die HSC fester, das gewünschte Gefühl beides. Die Grundeinstellung
des Herstellers gilt also für einen ruhigen Tourenfahrer.
Zu jedem Knopf eine Kachel mit Strich-Skala (ein Strich je Klick oder Stufe,
langer Strich = Grundeinstellung); die Stellung der anderen Ansicht
(Abfahrt/Sprünge) steht als gestrichelter Ring auf derselben Skala. Die
Übersichtstabelle Abfahrt/Sprünge erscheint nur bei Teilen ohne solche
Kacheln (etwa nur Kletterhebel), sonst stünde jede Zahl doppelt da. Dazu der
Link zur offiziellen Hersteller-Anleitung und optional das eigene Top-Cap-Foto
mit markierten Knöpfen.

**Live-Preise wie beim Preisvergleich.** Je Teil die Angebote der Partnershops
mit Preis, UVP, Versand und Lieferbarkeit, „Sale −X %“ gegenüber der UVP laut
Shop, „30-Tage-Tief“ aus dem eigenen Preisverlauf, eine Verlaufskurve über
90 Tage und der Reiter *Kaufen* (Einkaufsliste und Deals): alles, was gerade reduziert ist und in den
eigenen Aufbau passt. Der Aufbau rechnet mit dem günstigsten lieferbaren
Angebot; ohne Angebot mit dem Richtpreis aus dem Katalog.

**Zwei Sprachen.** Die ganze App gibt es auf Deutsch und Englisch: Beim ersten
Start entscheidet die Sprache des Geräts, umstellen geht im Einstieg und unter
⋮ → Sprache. Preise und Zahlen folgen der Sprache (4.906 € / €4,906). Impressum
und Datenschutzerklärung bleiben verbindlich deutsch, auf Englisch steht eine
Kurzfassung davor; der Betreiber-Modus ist nur deutsch.

## Technik

Eine einzelne HTML-Datei, kein Framework, kein Server, keine Verbindung zu
Dritten — auch die Schriften liegen im Repo. Der Aufbau liegt im `localStorage` des Geräts und
verlässt es nicht. Als PWA installierbar und offline lauffähig.

    index.html                    die gesamte App
    manifest.webmanifest          Installationsdaten
    mtb-sw.js                     Service Worker, Offline-Betrieb
    icon-*.png                    App-Symbole
    tools/preise.py               liest die Produktfeeds, schreibt die Preise
    .github/workflows/preise.yml  startet preise.py alle sechs Stunden
    preise.json                   Angebote je Teil (von der Action geschrieben)
    preisverlauf.json             günstigster Preis je Teil und Tag
    links.json                    Affiliate-Links, Netzwerk-IDs, Impressum-Angaben
    fonts/                        Schriften (lokal, SIL Open Font License)

Lokal: `index.html` per Doppelklick öffnen. Offline-Cache und
Homescreen-Installation brauchen `https://`.

Texte im Code stehen als `tx("Deutsch", "English")`, in Tabellen als Paar
`["Deutsch", "English"]` (gelesen über Getter, `zweisprachig()`), festes HTML
trägt `data-t="Deutsch|English"` (dazu `data-ta` für aria-label, `data-tt` für
title). Schlüssel für die Logik (Disziplinen, Maßnamen wie „Federweg“,
Themen, Knopfnamen im Federungsrechner) bleiben deutsch; übersetzt wird nur,
was angezeigt wird. Die Sprache liegt in `localStorage` unter `mtb.sprache`.

## Veroeffentlichen

Doppelklick auf `App-veroeffentlichen.cmd`. Das Skript installiert bei Bedarf die
GitHub CLI, meldet einmalig an, legt das Repo an, laedt hoch, schaltet Pages ein
und oeffnet die fertige Adresse:

    https://<dein-name>.github.io/dreambuild/

Jeder weitere Doppelklick laedt nur die Aenderungen nach. Die Adresse bleibt gleich.

Auf dem iPhone in **Safari** oeffnen, dann Teilen -> Zum Home-Bildschirm.

## Aktualisierung

Die App erneuert sich selbst. Beim Start, bei jeder Rueckkehr und stuendlich
fragt sie nach einer neuen Fassung; findet sie eine, uebernimmt der Service
Worker sofort und die Seite laedt sich einmal neu. Nichts neu installieren,
nichts vom Home-Bildschirm loeschen, die Adresse bleibt gleich.

Jede Veroeffentlichung stempelt einen neuen Cache-Namen in `mtb-sw.js` -- sonst
saehe der Browser keine Aenderung am Worker und die App bliebe auf der alten
Fassung stehen.

**Ohne PC:** Die Action *Veroeffentlichen* (`.github/workflows/veroeffentlichen.yml`)
stempelt bei jedem Push auf `main` automatisch und laesst Pages neu bauen --
dasselbe wie das Skript. Was schon gestempelt ankommt (vom PC-Skript), bleibt
unberuehrt; die Live-Preise loesen sie nicht aus. Von Hand: auf GitHub unter
Actions -> Veroeffentlichen -> *Run workflow*, geht auch am Handy.

## Betreiber-Modus

App einmal mit `#betreiber` am Ende der Adresse öffnen. Dann stehen unter ⋮
die Prüfliste bis zur Veröffentlichung, die Impressum-Angaben, Affiliate-Links,
Netzwerk-IDs und Feeds. Normale Nutzer sehen davon nichts.

## Eigene Affiliate-Links

Jedes Teil kann Links bekommen, die direkt auf die Produktseite führen statt
zur Shopsuche. In der App: Einstellungen → Affiliate-Links → *Link-Verwaltung
an* (bzw. Betreiber-Modus), dann bei einem Teil *Ansehen* und den Link einfügen — einen Awin-Link,
einen Amazon-Link oder die nackte Produktseite; die macht die App mit
Publisher- und Advertiser-ID selbst zum Awin-Link. Der Shop wird am Link
erkannt.

Für alle sichtbar: *links.json speichern* (landet in Downloads) und
`App-veroeffentlichen.cmd` doppelklicken. Das Skript nimmt die neueste
`crankscore-links.json` aus Downloads, prüft sie und veröffentlicht sie als
`links.json`.

## Live-Preise einrichten

Die Preise kommen aus den Produktfeeds der Partnerprogramme (Awin). Einmal
einrichten, danach läuft es von selbst:

1. Im Awin-Publisher-Konto die Shops als Partner beantragen (bike-components,
   Bike24, Bike-Discount, Rose).
2. Unter *Toolbox → Create-a-Feed* je Shop einen Feed als CSV anlegen, mit den
   Spalten `product_name`, `search_price`, `rrp_price`, `delivery_cost`,
   `aw_deep_link`, `merchant_image_url`, `in_stock`, `merchant_category`.
   Die Download-Adresse kopieren.
3. Im Repo unter *Settings → Secrets and variables → Actions* ein Secret
   `PREIS_FEEDS` anlegen, eine Zeile je Shop: `Shopname|Download-Adresse`.
4. Unter *Actions → Live-Preise* einmal *Run workflow* drücken.

Die Download-Adressen enthalten den persönlichen API-Schlüssel. Sie gehören
nur ins Secret, nie in eine Datei — das Repo ist öffentlich.

## Grenzen

Live-Preise gibt es nur für Teile, die ein Partnershop im Feed führt, und nur
so aktuell wie der letzte Lauf (alle sechs Stunden). Maßgeblich ist der Preis
im Shop. Die Zuordnung Feedzeile → Katalogteil ist auf Genauigkeit gebaut:
lieber kein Preis als der Preis eines anderen Teils. Die Engine kennt
Normmaße, nicht jede Sonderlocke eines einzelnen Rahmenjahrgangs — vor dem Kauf
gegen das Datenblatt des eigenen Rahmens prüfen. Trial-Maße sind auf Mod 20/19″
und Stock 26″ vereinfacht.
