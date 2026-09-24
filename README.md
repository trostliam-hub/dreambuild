# Dreambuild

MTB-Konfigurator für den DACH-Raum. Baut Dreambuilds, prüft sie gegen Normmaße
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

**Zwei getrennte Werte.** *Technik* misst, ob es mechanisch zusammenpasst.
*Charakter* misst, ob alle Teile in dieselbe Richtung ziehen — ein Enduro-Rahmen
mit XC-Bremsen ist fehlerfrei und trotzdem falsch gebaut.

**Sieben Disziplinen,** einzeln oder gemischt: Cross Country, Trail, Enduro,
Downhill, Dirtjump, Slopestyle, Trial. Mischungen werden auf Machbarkeit
geprüft — XC plus Downhill ergibt kein Rad, sondern zwei.

**Profile.** Traumrad, Mein Rad und Angebot sind getrennt, und jeder Modus hat
beliebig viele Profile: eigene Teile, Disziplinen, Budget, Markenwünsche,
Modelljahr, Foto und (Angebot) Zustand und Preis. Nur das Fahrergewicht gilt
für alle. Umschalten über die Leiste unter dem Modus-Umschalter.

**Dreambuild-Assistent.** Sechs Schritte (Disziplin, Budget, Fahrergewicht,
Markenwünsche, Priorität) und der Generator baut einen vollständigen,
konfliktfreien Aufbau innerhalb des Budgets.

**Live-Preise wie beim Preisvergleich.** Je Teil die Angebote der Partnershops
mit Preis, UVP, Versand und Lieferbarkeit, „Sale −X %“ gegenüber der UVP laut
Shop, „30-Tage-Tief“ aus dem eigenen Preisverlauf, eine Verlaufskurve über
90 Tage und der Reiter *Deals*: alles, was gerade reduziert ist und in den
eigenen Aufbau passt. Der Aufbau rechnet mit dem günstigsten lieferbaren
Angebot; ohne Angebot mit dem Richtpreis aus dem Katalog.

## Technik

Eine einzelne HTML-Datei, kein Framework, kein Server, keine Abhängigkeiten
außer den Google-Schriften. Der Aufbau liegt im `localStorage` des Geräts und
verlässt es nicht. Als PWA installierbar und offline lauffähig.

    index.html                    die gesamte App
    manifest.webmanifest          Installationsdaten
    mtb-sw.js                     Service Worker, Offline-Betrieb
    icon-*.png                    App-Symbole
    tools/preise.py               liest die Produktfeeds, schreibt die Preise
    .github/workflows/preise.yml  startet preise.py alle sechs Stunden
    preise.json                   Angebote je Teil (von der Action geschrieben)
    preisverlauf.json             günstigster Preis je Teil und Tag
    links.json                    eigene Affiliate-Links je Teil und Netzwerk-IDs

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

## Eigene Affiliate-Links

Jedes Teil kann Links bekommen, die direkt auf die Produktseite führen statt
zur Shopsuche. In der App: Einstellungen → Affiliate-Links → *Link-Verwaltung
an*, dann bei einem Teil *Ansehen* und den Link einfügen — einen Awin-Link,
einen Amazon-Link oder die nackte Produktseite; die macht die App mit
Publisher- und Advertiser-ID selbst zum Awin-Link. Der Shop wird am Link
erkannt.

Für alle sichtbar: *links.json speichern* (landet in Downloads) und
`App-veroeffentlichen.cmd` doppelklicken. Das Skript nimmt die neueste
`dreambuild-links.json` aus Downloads, prüft sie und veröffentlicht sie als
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
