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

**Für Einsteiger.** Beim ersten Öffnen fragt die App, was man vorhat (neues Rad,
eigenes Rad, Gebrauchtrad). Oben im Aufbau führt eine Leitkarte Schritt für
Schritt: je Modus drei bis vier Schritte, abgehakt, was erledigt ist, ein Knopf
für den nächsten. Jedes Bauteil hat einen Satz „Was ist das?“, unter ⋮ → Hilfe
stehen Einführung, Begriffe (Boost, Freilauf, Kettenlinie …) und die Erklärung
der Wertung. Ausführungen (Einbaumaß, Federweg …) sind eingeklappt, bis man sie
ändern will. Der Reiter *Kaufen* hat eine Einkaufsliste mit Shop-Knöpfen, als
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
Stahlfeder = Last hinten × Übersetzung / (Hub × Sag). Zu jeder Einstellung ein gezeichnetes Schema des
Einstellrädchens (Zeiger, ein Strich je Klick), Link zur offiziellen
Hersteller-Anleitung und optional das eigene Top-Cap-Foto mit markierten Knöpfen.

**Live-Preise wie beim Preisvergleich.** Je Teil die Angebote der Partnershops
mit Preis, UVP, Versand und Lieferbarkeit, „Sale −X %“ gegenüber der UVP laut
Shop, „30-Tage-Tief“ aus dem eigenen Preisverlauf, eine Verlaufskurve über
90 Tage und der Reiter *Kaufen* (Einkaufsliste und Deals): alles, was gerade reduziert ist und in den
eigenen Aufbau passt. Der Aufbau rechnet mit dem günstigsten lieferbaren
Angebot; ohne Angebot mit dem Richtpreis aus dem Katalog.

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
