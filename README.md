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
Spanish) und Kurbelwelle (DUB, Hollowtech II, 30 mm, PowerSpline, ISIS),
Steuersatz gegen Steuerrohr und Gabelschaft (tapered, gerade 1 1/8″, Doppelbrücke).

**Optionale Lager.** In allen drei Modi — Traumrad, eigenes Rad, Gebrauchtrad —
stehen unter „Rahmen“ zwei Plätze, die man nur füllt, wenn man will:
*Steuersatz* (acht Modelle von FSA bis Chris King, je in fünf Einpressmaßen;
beim Einbauen wählt die App das Maß, das zu Rahmen und Gabel passt, und die
Prüfung meldet ein falsches Unterteil) und *Rahmenlager* (Lagersätze für den
Hinterbau, nur bei Fullys sichtbar). Leer zählen sie nirgends mit: nicht im
Zähler, nicht in „offen“, nicht in der Einkaufsliste. Der Traumrad-Assistent
lässt sie leer; wer vorher selbst welche eingebaut hat, behält sie — in der
Ausführung, die zum neuen Aufbau passt. Ein Rahmenlager-Satz ersetzt verbaute
Lager und macht das Rad deshalb nicht schwerer. Das Innenlager war schon immer
ein eigener Platz und bleibt es.

**Zwei getrennte Werte.** *Kompatibilität* misst, ob es mechanisch zusammenpasst.
*Einsatz* misst, ob alle Teile in dieselbe Richtung ziehen — ein Enduro-Rahmen
mit XC-Bremsen ist fehlerfrei und trotzdem falsch gebaut.

**Übersicht im Stil von Bevel.** Oben drei Ringe nebeneinander wie die
Kennzahlen in der Gesundheits-App Bevel: in der Mitte groß der *Score*
(Ampelfarbe: grün ab 85, gelb ab 60, sonst rot), links *Kompatibilität*,
rechts *Einsatz*. Diese beiden stehen seit 09.10.2026 kleiner und in Grau
daneben, damit der Score klar im Mittelpunkt steht. Tippen auf einen Ring
erklärt die Zahlen. Darunter
ein Satz zum Stand und zwei Kacheln: *Preis* (mit Budget als Tankanzeige —
wie viel frei ist oder dass es drüber liegt) und *Gewicht* (mit „x von y
Teilen“). Darüber (seit 03.10.2026, vorher darunter) die Karte **Nächster Schritt**: statt aller Listen
der eine Schritt, der das Rad jetzt am meisten weiterbringt — zuerst ein
harter Konflikt (am liebsten kostenlos: dasselbe Teil, andere Ausführung),
dann beim Traumrad über Budget der größte Sparzug bei gleichen Maßen, sonst
das beste echte Upgrade mit Punkten, Preis und Gewicht. Ein Knopf baut es
ein, ein zweiter fragt den Guide „Was fehlt zur 100?“. Gerechnet wird mit
denselben Vorschlägen wie im Reiter Upgrades; beim Gebrauchtrad und bei
leerem Aufbau fehlt die Karte.

Die Karte lässt sich ein- und ausklappen: Ein Tipp auf die Kopfzeile lässt
nur „Nächster Schritt“ und den Schritt in einer Zeile stehen. Der Zustand
bleibt gespeichert und gilt für alle Räder.

Vorschläge lassen sich **ablehnen** (seit 03.10.2026), im Nächsten Schritt
wie in Upgrades und Sparvorschlägen. Ablehnen heißt „ich behalte dieses
Teil“:
- Für den Slot kommt dann weder ein Upgrade noch ein billigerer Ersatz, mit
  „Rückgängig“ im Hinweis.
- Das gilt je Rad und nur solange dort dasselbe Teil sitzt. Wer die
  Laufräder später selbst tauscht, bekommt wieder Vorschläge.
- Konflikte werden weiter gemeldet.
- Im Reiter Upgrades stehen die abgelehnten Slots mit „wieder zeigen“. Das Design dazu: echtes Schwarz (hell: iOS-
Grau), Graphit-Karten ohne Rand mit großen Radien, Beschriftungen in normaler
Schreibung statt gesperrter Versalien, Knöpfe schlicht weiß auf schwarz
(hell umgekehrt). Seit 09.10.2026 (Liam: „erwachsener, ruhiger, hochwertiger“)
gibt es keine bunten Verläufe und kein Leuchten mehr: keine Farbwolken im
Einstieg und hinter den Ringen, eine einfarbige Überschrift, ein schlichter
Guide-Knopf wie die anderen runden Knöpfe. Farbe trägt nur noch ein Akzent
(Violett, als Fläche `--akzent-flaeche`, `--grad` ist dieselbe Farbe) und die
Statusfarben. Die Aufgabenkarte ist eine kompakte Liste ohne Balken und
Farbflächen; nur der aktuelle Schritt hat eine Erklärung. Grautexte haben mindestens
4,5:1 Kontrast, die Ringe mindestens 3:1. Die Seiten von Bevel selbst
(bevel.health) waren aus der Entwicklungsumgebung gesperrt — Vorlage war die
bekannte Bevel-App: Ringe oben, ein Coach-Tipp, ruhige Karten.

**Startseite.** Aufgebaut wie bevel.health (nach einer Bildschirmaufnahme der
Seite): hell, große Überschriften, schwarzer Knopf „Kostenlos starten“, das
gezeichnete Rad im Kopf, dann „Kennt die Teile von“
mit laufenden Markennamen und drei Zahlen (Teile, Marken, Prüfregeln — aus dem
Katalog gezählt), je Funktion eine große hellgraue Karte mit Handy-Vorschau
(Wertung, Prüfung, Upgrades, Deine Größe, Gebrauchtrad), ein
dunkler Abschnitt für den Guide mit seinem Symbol, „Und das ist nicht
alles“ zum Wischen, Free oder Pro, eine dunkelgrüne Karte zur Privatsphäre,
„Bereit, wenn du es bist“ und eine Fußzeile mit Impressum und Datenschutz.
Die Zahlen in den Vorschauen rechnet die App selbst (Wertung des Startrads, Fit
für 1,82 m, Luftdruck für 80 kg); erfundene Nutzerzahlen oder Bewertungen gibt
es bewusst nicht. Karten gleiten beim Scrollen ein (aus bei „Bewegung
reduzieren“). Sie kommt beim ersten Besuch im Browser vor dem Einstieg, in der
installierten App nicht; sonst unter ⋮ → Über CrankScore oder über die Adresse
mit `#start` — der Link für TikTok:
https://trostliam-hub.github.io/dreambuild/#start

**Ein Weg je Aufgabe** (Doppelungen-Prüfung 06.10.2026). Jede Aufgabe hat
genau einen Ort:

| Aufgabe | Der eine Weg |
|---|---|
| Rad oder Angebot anlegen, wechseln, umbenennen, löschen | Radverwaltung (Stift neben den Rädern) → „Rad anlegen“ / „Angebot anlegen“; die Leiste darunter wechselt nur |
| Körpermaße, Gewicht, Erfahrung | Einstellungen → Fahrerprofil (derselbe Editor wie im ersten Einstieg). Jede Angabe darf „nicht angegeben“ bleiben; ohne Körpergröße schätzt und empfiehlt die App nichts, ohne Gewicht nennt die Prüfung die Laufrad-Freigabe „nicht geprüft“. |
| Disziplin, Budget, Marken, Vorlieben eines Rads | Bauziel (Disziplin oben antippen) — der einzige dauerhafte Einstieg; einmalig auch am Ende der Ersteinrichtung und nach „Rad anlegen“. Beim Traumrad mit Assistent und Vorschlag. |
| Ausführungen an die Körpergröße anpassen | Aufbau („An meine Größe anpassen“, nur wenn es etwas anzupassen gibt); das Größen-Blatt zeigt nur an |
| Rahmen-Modelljahr | Aufbau, beim Rahmen. Ein abweichendes altes Setup-Jahr wird dort entschieden („übernehmen“ / „behalten“). |
| Teile wählen | Aufbau |
| Konflikte lösen | Prüfung (dort auch die kostenlose Umstellung und der Ersatz) |
| Besser oder günstiger | Upgrades (Upgrades und „Günstiger, gleiche Maße“) |
| Bestellen | Kaufen; am Desktop daneben nur die Summe |
| Fahrwerk | Setup in der Navigation (Handy: Reiter, Desktop: Kopf) |
| Guide | Sprechblase im Kopf (nicht zusätzlich im Menü) |
| Hilfe | Einstellungen → Hilfe: Begriffe, Über CrankScore, Rundgang (freiwillig) |

**Einstieg.** Beim ersten Öffnen ein Rundgang über den ganzen Bildschirm.
Gleich oben die Sprachwahl Deutsch / English, dazu ein gezeichnetes Rad,
gestaffelt einfliegende Karten und Konfetti am Ende: Was hast du vor (neues
Rad, eigenes Rad, Gebrauchtrad)? Danach die Schritte des Fahrerprofils
(jede Angabe darf leer bleiben, ohne Körpergröße zeigt die App keine
geschätzten Maße und keine Empfehlung):
Erfahrung, gewünschter Charakter des Rads (verspielt, ausgewogen, laufruhig),
Größe und Gewicht, Schulterbreite, Schrittlänge, Spannweite und
Handschuhgröße, dann die eigene Größe. Beim Traumrad geht es danach im
Bauziel weiter (Disziplin, Budget, Vorlieben, Wunschmarken, Schwerpunkt —
nur die Vorlieben, für die es einen zur Disziplin passenden Rahmen gibt), beim
eigenen Rad und beim Angebot mit dem Rahmen. Ein schon gebautes oder
eingetragenes Rad bleibt unangetastet: dann kommt ein neues Rad dazu, und die
App sagt es. Den Fahrstil fürs Fahrwerk fragt das Setup selbst.
Überspringen geht jederzeit; einen zweiten Fragenkatalog zum Wiederholen gibt
es nicht — Fahrer ändert man im Fahrerprofil, Räder im Bauziel.

**Deine Größe.** Aus Körpergröße, Schrittlänge, Schulterbreite und Spannweite (was
fehlt, wird aus der Größe geschätzt und so markiert): Rahmengröße (gemittelte
Größentabelle, Specialized S1–S6, zwischen zwei Größen entscheidet der
gewünschte Charakter), Ziel-Reach, Lenkerbreite (halb Schultern, halb
Spannweite, je Disziplin verschoben), Vorbau, Kurbel (nach Schrittlänge,
Enduro und Downhill eine Stufe kürzer), Hub der Variostütze
((Schrittlänge − 58) × 7,5, wie die Tabellen von OneUp und PNW), Sattelhöhe,
Laufradgröße, Rise und Griffdicke. Beim Eingeben zeigt eine Figur die
Rahmengröße live: Proportionen nach Körpermaß-Tabellen (Schulter bei 82 %,
Schritt bei 47 %, Knie bei 28 % der Größe), Gesicht mit Augen, Brauen, Nase
und Mund, Frisur, Ohren, langärmliges Trikot, Hände mit Daumen, Baggy-Shorts,
Knie, hohe Socken und Flat-Schuhe; die Statur folgt dem Gewicht. Eine
Cockpit-Ansicht zeigt Schultern und Lenker in echter Breite, mit Armen im
Ärmel und Handschuhen, deren Zeigefinger am Bremshebel liegt.
Im Fit sitzt ein Fahrer in deiner Größe auf dem Rad, Beine und Arme aus Sattel,
Pedal und Griff gerechnet: Arm im Ärmel als ein Umriss, Faust um den Griff,
Baggy-Shorts über Knieschonern mit harter Kappe, hohe Socken, Flat-Schuhe mit
Profilsohle. Alle Figuren sind plastisch gezeichnet — jedes Teil hat einen
Verlauf quer zur Achse (Licht von oben vorn), dazu Falten, Nähte und Schatten,
wo sich Teile berühren. Beide Fahrer tragen einen Fullface-Helm nach dem Fox Rampage Pro Carbon (ohne
Logo), matt im Carbon-Ton und clean gehalten: Proportionen vom Produktfoto,
runder Hinterkopf, langer flacher Schirm aus der Schale heraus, große
Gesichtsöffnung, langer Kinnbügel mit gerader Front, eckige Lüftungen mit
Gitter an Stirn, Kinn und Hinterkopf, feine Panelkanten. Klare Linien: gerade
Kanten mit gerundeten Ecken, Lüftungen als Rechtecke parallel zur Kante. Dazu eine MX-Goggle
mit Rahmen, getönter Linse, Stiften, Nasenschutz und Band.
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
Seit 09.10.2026 ist die Zeichnung sachlich gehalten: Rahmen in Metallgrau,
Anbauteile in Graphit, Feder und Standrohre metallisch, Trikot dunkelgrau.
Das Rad blendet einmal ein und steht dann still; es gibt keine drehenden
Räder, kein Wippen und keine Bewegungslinien mehr. Die Farben kommen aus den
Variablen `--rs-…` und passen sich dem hellen und dunklen Design an.
Im Aufbau steht an Rahmen, Lenker, Vorbau, Kurbel und Stütze, was zu dir passt
(„auf 780 mm kürzen“, „Größe L bestellen“); die Prüfung hat eine eigene Rubrik
*Passt das Rad zu dir?*, die nur zeigt, was nicht passt, und nicht in die
Wertung zählt. Der Assistent stellt
Kurbellänge, Hub, Vorbaulänge und Rise auf den Fahrer ein — nur innerhalb des
Modells und nur, wenn die Prüfung dadurch nicht schlechter wird. Einkaufsliste
und kopierter Text nennen Rahmengröße, Lenkerkürzung und Sattelhöhe für die
Werkstatt. Die Maße gelten wie das Fahrergewicht für alle Profile.

**Für Einsteiger.** Der **Rundgang** startet nur auf Wunsch (Einstellungen →
Hilfe → App-Rundgang): ein Scheinwerfer wandert über die echten
Bedienelemente (Wertung, Modi, Teile, Prüfung, Upgrades, Kaufen, Setup,
Bauziel, Menü), daneben eine Karte mit einem Satz, Fortschrittspunkten,
Zurück und Überspringen; am Ende Konfetti. Auf breiten Bildschirmen zeigt er
auf die Spalten statt auf die Reiter, Pfeiltasten blättern, Esc beendet.
Wer im Fahrerprofil „Ganz neu dabei“ wählt, bekommt an jeder Teilekachel einen
Satz, was das Teil tut. Über dem Score steht **eine Aufgabenkarte** „Nächster
Schritt“: je Modus die Schritte als Status (Bauziel, fehlende Teile,
Konflikte und Prüfung, beim Traumrad Budget, zuletzt Upgrades oder Kaufen) und
höchstens ein Knopf für den aktuellen Schritt — beim Bauziel keiner, dort
steht nur der Hinweis auf die Disziplin oben. Übernehmen oder Ablehnen gibt es
dort nicht — das geht nur in der Prüfung bzw. unter Upgrades. Die Karte lässt
sich ausblenden und unter Hilfe wieder zeigen. Die Erklärung der Wertung steht
direkt an der Wertung. Ausführungen (Einbaumaß, Federweg …) sind eingeklappt,
bis man sie ändern will; die Teilekachel nennt dann nur das Modell, damit
nichts doppelt steht. Der Reiter *Kaufen* hat eine Einkaufsliste mit
Shop-Knöpfen, als Text kopierbar für die Werkstatt.

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

**Guide.** Der runde Knopf oben rechts (und ⋮ → Hilfe) öffnet einen Chat, in
dem man Fragen zur App und zum Rad stellen kann. Bewusst ohne KI-Server: Eine
echte KI bräuchte einen API-Schlüssel (nicht ins öffentliche Repo), kostete je
Frage und schickte die Fragen an einen Anbieter in den USA. Stattdessen eine
eingebaute Wissensbasis mit 100 Themen auf Deutsch und Englisch — App-Bedienung,
MTB-Grundlagen (Geometrie, Federung, Antrieb, Bremsen, Reifen, Wartung,
Gebrauchtkauf) und jedes Bauteil. Die Frage wird in Stichworte zerlegt und mit
Wortstamm, Wortteilen und Tippfehler-Toleranz gegen die Stichworte jeder
Antwort gewertet; Disziplin- und Markennamen zählen schwächer, weil sie oft nur
Beiwort sind. Antworten zur App lesen den aktuellen Aufbau (Wertung, Konflikte,
Budget, Gewicht, Fit, Federung, Gebrauchtangebot). Nennt man ein Teil („Passt
eine Fox 38?“), sucht der Guide es im Katalog und prüft mit der passenden
Ausführung, ob neue Konflikte entstehen. Unter jeder Antwort Knöpfe, die direkt
an die richtige Stelle führen (Setup, Fit, Prüfung, Teileliste mit
Suche …). Alles bleibt auf dem Gerät und läuft offline.

Vor der Stichwortsuche erkennt der Guide **Absichten** — Fragen zum eigenen
Rad, die rechnen müssen. Dafür gibt es Begriffsgruppen mit vielen Wortformen
(Wertung, steigern, abhalten, warum, ändern, besitzen, empfehlen, sparen,
Gewicht …); die Absicht ergibt sich aus ihrer Kombination, Bauteile und
Disziplinen werden auch gebeugt erkannt („Laufrädern“, „Bikepark“ → Downhill),
und ob „mein“ direkt vor dem Bauteil steht („meine Gabel“ gegen „eine gute
Gabel für mein Rad“). So antwortet er mit echten Zahlen:
- *Was fehlt zur 100?* — woher die fehlenden Punkte kommen (jeder Befund und
  jedes Teil unter 5/5 mit seinem Anteil) und welche Tausche sie zurückholen:
  Schritt für Schritt gerechnet, damit Wechselwirkungen zählen; das eigene Teil
  in anderer Ausführung zuerst, ein neuer Rahmen nur, wenn er klar mehr bringt.
  Ist der Rahmen für eine andere Disziplin gebaut, sagt er das zuerst.
- *Welche Gabel soll ich nehmen?* — jedes passende Teil einmal am eigenen Rad
  durchgerechnet, die besten drei plus ein Preis-Leistungs-Tipp.
- *Wie viel wiegt meine Gabel? Warum passt mein Dämpfer nicht?* — das
  eingebaute Teil mit Preis, Gewicht, Eignung und Befunden.
- *Taugt mein Rad für Enduro? Wofür ist mein Rad gut?* — die Einsatz-Wertung
  je Disziplin und die Teile, die dafür am wenigsten gemacht sind.
- *Wo kann ich Geld sparen? Wie wird mein Rad leichter?* — die größten Hebel
  mit Betrag bzw. Gramm (nichts über 8 € je Gramm), dazu die Teileliste.
- Folgefragen: „und die Bremsen?“, „und für Downhill?“.

Geprüft mit drei Fragenreihen (206 Fragen, Deutsch und Englisch, mit
Umgangssprache und Tippfehlern); die dritte war vor dem Feinschliff unbekannt
und kam auf 42 von 48 — danach 47 von 48.

**Federungsrechner.** Im Reiter *Setup* (siehe unten): aus
Fahrergewicht (+4 kg Ausrüstung) und einem Fahrprofil aus fünf Fragen
(Gelände, Tempo bergab, Sprünge, gewünschtes Gefühl, Anteil bergauf) je Gabel und Dämpfer ein Luftdruck in psi/bar mit Sag-Ziel, bei
Stahlfeder die Federhärte, dazu Druck- und Zugstufe — in drei Modi: *Pur
Downhill*, *Allround* und *Pur Sprünge*. Grundlage sind die
Herstellertabellen (Fox Owner's Manuals 2025 für 32/34/36/38/40,
RockShox-Tabellen für Pike, Lyrik, ZEB, SID, Domain, BoXXer, Recon, Reba,
LinearXL ab Modelljahr 2027). Einen Druck gibt es nur, wenn die Tabelle zur
Gabel *und* zu ihrem bestätigten Baujahr passt (Fox ab 2021, RockShox ab 2023,
LinearXL ab 2027; ohne Baujahr kein Wert) und das Gewicht innerhalb der Tabelle
liegt (keine Verlängerung über die Tabellenenden). Sonst nennt die App keinen
Wert, sondern den Weg dorthin: Aufkleber an der Gabel, Trailhead bzw. FOX-App,
dann per SAG einstellen. Hat man im Onboarding den aktuellen Druck eingetragen,
startet sie dort. Ein Maximaldruck steht nur da, wo er für das Modell belegt
ist; jeder gespeicherte Druck wird gegen 10 psi bis Maximum (ohne bekanntes
Maximum 400 psi) geprüft. Fahrstil- und Profilanpassungen sind als
„App-Anpassung“ gekennzeichnet, nicht als Herstellerwert. Druckstufen ab der Grundeinstellung des
Herstellers (GRIP X2 5/10, GRIP X 10/10 von zu, sonst Mitte) und so, wie es auf
dem Knopf steht: RockShox Charger 3.2 hat Zahlen (LSC −7 bis +7 = 15
Stellungen, HSC −2 bis +2 = 5 Stellungen) — die App sagt „auf +2 stellen“;
Charger 3 und 3.1 sowie der RC2T-Dämpfer haben Striche von − bis + und werden
ab der Mitte gezählt; Fox ab ganz zu, Cane Creek ab ganz offen. Fox GRIP,
GRIP SL und FIT4 haben einen Hebel mit drei Stufen (bergab offen). Lyrik und
ZEB ab 2027 haben dazu den Durchschlagschutz ABO (5 Stufen). Dämpfer: Luft-Startwert
nur bei FOX = Gewicht mit Ausrüstung in lb (Faustregel aus dem Owner's Guide);
RockShox und andere nennen bewusst keinen Pauschalwert, dort kommt kein Wert,
sondern Trailhead/Anleitung und SAG. Stahlfeder hinten nur mit bekanntem
Hinterbau-Federweg (Rahmendaten oder Onboarding), nie aus der Gabelfreigabe
geschätzt; Tokens als Stückzahl nur mit bekannter Werksbestückung und Maximum;
Stahlfeder = Last hinten × Übersetzung / (Hub × Sag). Die Dämpfer-Druckstufe
richtet sich nach Modell *und* Ausführung: RockShox RC2T (Super Deluxe und
Vivid Ultimate) mit HSC und LSC in je 5 Stellungen, die Stahlfeder-Versionen
dazu mit dem Durchschlagschutz HBO (5 Stufen; bei Luft fest), Fox Float X2
und DHX2 Factory mit HSC 8 / LSC 16 / HSR 8 / LSR 16 Klicks (Performance Elite
nur LSC und LSR), Float X mit LSC 11, Float DPS mit Open-Mode-Adjust,
Cane Creek DB IL (gezählt ab offen, HSC in Umdrehungen), Kitsuma mit Climb
Switch in drei Stufen, Öhlins TTX; Select+ und Performance zeigen nur den
Kletterhebel, Select (R) keine Druckstufe.
Drei Profile, oben im Setup umschaltbar, jedes mit eigenen gespeicherten
Werten (Recherche 2026-10-05: RockShox Welcome Guides, Fox Owner's Manuals,
BikeRadar, GMBN) — ohne Pauschalregel wie „für Sprünge alles härter“:
*Downhill* (Grip, Kontrolle, berechenbar auf steil, schnell, ruppig) — 2 %
mehr Sag (RockShox DH: 30–35 % hinten), 4 % weniger Luft, HSC offener für Grip
auf Wurzeln und Steinen, Zugstufe einen Klick schneller gegen Packing, hinten
LSC einen Klick offener für Traktion; die LSC der Gabel bleibt, sonst taucht
sie auf Steilstücken beim Bremsen ab; wer schnell oder ruppig fährt, bekommt
einen Spacer mehr als Reserve. *Allround* — genau das Fahrprofil, die Basis.
*Sprünge* (Halt am Absprung, kontrollierte Landung) nach Sprunggröße und
Erfahrung: klein — LSC +1, 1 % weniger Sag, Einsteiger Zugstufe einen Klick
langsamer; groß — LSC +2, HSC +1, ein Spacer mehr statt viel mehr Luft
(Progression), 3 % mehr Luft, 2 % weniger Sag, Zugstufe langsamer. Jedes
Profil sagt, was es kostet (Downhill: weniger Pop, wippt mehr; Sprünge:
weniger Grip und Komfort im Ruppigen). Kurze Federwege haben weniger Reserve,
lange (Doppelbrücke) brauchen beim Springen weniger Luft.
Je Knopf wird Allround auf ganze Klicks gerundet, jeder Modus kommt als
eigene ganze Klicks dazu, dann werden alle drei gemeinsam in den
Einstellbereich geschoben — so steht Allround nie am Anschlag, und Downhill
ist in jedem Profil weicher, Sprünge fester (geprüft an 27.864 Kombinationen
aus Gabel, Dämpfer, Gewicht und Profil). Verstellt ein Modus einen Knopf,
landet er nie genau auf der Grundeinstellung, sonst wirkt er „neutral“. Stahlfedern bleiben in allen Modi
gleich, dort wechselt nur die Dämpfung. Die Zugstufe steht vorne und hinten
in echten Klicks ab ganz zu (Schildkröte), wo die Klickzahl bekannt ist:
Charger 3.x 18, RockShox Super Deluxe und Deluxe Luft 15, Stahlfeder und Vivid
20, Fox GRIP X 16, Float X 16, Öhlins TTX22m.2 7; mit getrennter High- und
Low-Speed-Zugstufe (HSR/LSR) Fox GRIP X2, GRIP2, Float X2, DHX2 und Cane Creek
Kitsuma. Bei FOX folgt der Startwert dem Gewicht wie die Fox-Tabellen (rund 2
Klicks je 10 kg, bei 80 kg die Mitte); ohne Herstellertabelle gilt die Mitte
des Bereichs (GMBN) — eine Tabelle auf der Gabel oder Trailhead hat Vorrang. Ohne
bekannte Klickzahl zählt die Zugstufe ab dem eigenen Grundwert (Bordsteintest).
Jede Antwort verschiebt Low- und High-Speed um feste Stufen (eine Stufe =
12 % des Einstellbereichs, ab drei Stufen zählt jede weitere halb, ganz zu
wird bei Knöpfen mit vielen Klicks nie empfohlen): Flowtrails und zügiges
Tempo machen die LSC fester, ruppiges Gelände die HSC offener, Sprünge und
Bikepark die HSC fester, das gewünschte Gefühl beides. Die Grundeinstellung
des Herstellers gilt also für einen ruhigen Tourenfahrer.
Unter Setup › *Alle berechneten Werte und Herstellerangaben* zeigt jede Karte eine Vergleichstabelle aller drei Profile (Luft, Sag, jeder
verstellbare Knopf, Zugstufe; Tippen auf einen Spaltenkopf wechselt das Profil)
und darunter zu jedem Knopf des gewählten Profils eine Kachel mit Strich-Skala
(ein Strich je Klick oder Stufe, langer Strich = Grundeinstellung). Dazu der
Link zur offiziellen Hersteller-Anleitung und optional das eigene Top-Cap-Foto
mit markierten Knöpfen.

**Setup — eigener Reiter fürs Fahrwerk (Pro).** Fünfter Reiter unten (am
Desktop der Knopf *Setup* oben rechts), für Einsteiger und Profis in einer
Ansicht; Gabel und Dämpfer klar getrennt (Umschalter *Gabel · vorne* /
*Dämpfer · hinten*). Ziel: Einsteiger wissen, was sie einstellen, wie und
warum; Profis prüfen, verstellen und vergleichen schnell. Alle Werte sind
Ausgangspunkte und stehen so in der App.
- *Deine Angaben* — der eine Editor für die Setup-Daten (ohne Gewicht führt
  das Setup erst ins Fahrerprofil; Gewicht, Größe und Erfahrung kommen von
  dort und werden hier nur angezeigt): was mitfedert (Helm, Tasche, Rucksack,
  Protektoren oder gewogen); Rad (Rahmen und Modelljahr aus dem Aufbau,
  Rahmengröße, Analog / Light-E / Full-E, Radgewicht); Gabel und Dämpfer
  (Teile aus dem Aufbau, nur angezeigt) mit eigenem Modelljahr und bei
  Stahlfeder der Federhärte; welche Einsteller es wirklich gibt
  (vorausgewählt nach Herstellerdaten, abwählbar — weg aus den Karten;
  angehakt ohne Daten: ab der Mitte); Gelände, Tempo, Sprünge,
  Gefühl, Anteil bergauf; Profil; was gerade eingestellt ist (Druck, SAG,
  Klicks — mit dem Bezugspunkt des Herstellers); Probleme und Wünsche. Jede
  Frage hat „Warum fragen wir das?“, „Weiß ich nicht“ (mit Hinweis, wo man
  es findet) und bei Rad, Gabel, Dämpfer, Einstellern und Ist-Werten eine
  Illustration mit nummerierten Markern. Es kommt nur, was zählt (Hardtail:
  keine Dämpferfragen, kein „bergauf“). Am Ende eine Übersicht, jede Zeile
  änderbar. Gespeichert am Rad (`build.fw`); neue Gabel, neuer Dämpfer oder
  neuer Rahmen setzen nur deren Angaben zurück.
- *Profile* Downhill / Allround / Sprünge als Karten mit Fokus; „Was ändert
  sich?“ zeigt je Federelement jede Abweichung von Allround mit Grund und den
  Preis dafür. Jedes Profil speichert eigenen Druck, eigene Klicks und eine
  eigene Grundeinstellung (★).
- *Dein nächster Schritt* — Luft vorn/hinten, SAG, Zugstufe, Druckstufe,
  Testfahrt; *Zeigen* öffnet die passende Karte, *Erledigt* hakt ab.
  Fehlen Angaben, sagt ein Hinweis oben nur, wie viele — bearbeitet wird
  ausschließlich unter *Deine Angaben*.
- *Aktionen:* Testfahrt (starten oder fortsetzen), Setup-Karte, Vergleichen,
  Deine Angaben. SAG wird in der SAG-Karte des gewählten Federelements
  gestartet; *Dein nächster Schritt* führt mit *Zeigen* dorthin.
- *Einstellkarten* in der Reihenfolge des Einstellens (Luft oder Feder, SAG,
  Zugstufe, Druckstufe, Hebel; aufklappbar die Profi-Einsteller HSC, HSR,
  Durchschlagschutz, Tokens) — nur Einsteller, die das Fahrwerk hat. Jede
  Karte: Wert und Herkunft (Tabelle, Startwert, Empfehlung, dein Wert),
  −/+ bzw. eigener Druck mit Maximaldruck, *So stellst du es ein* (Ort,
  Bezugspunkt und Drehrichtung je Hersteller: Fox ab ganz zu, Charger 3 ab
  der Mitte, Cane Creek ab ganz offen; ↻ zu = langsamer/straffer, ↺ auf =
  schneller/weicher) mit Illustration, *Was es bewirkt* mit Begriff zum
  Antippen, *Warum dieser Wert* (Tabelle, Fahrstil, Profil, eigenes
  Feintuning) mit Quellen-Links, *Zu viel / zu wenig*.
- *Geführte SAG-Messung* für das gewählte Federelement in sechs Schritten (vorbereiten, Startdruck,
  O-Ring, aufsitzen, messen, Ergebnis) mit Barometer; Rat in psi höchstens
  20 % pro Schritt, „Auf … psi gepumpt“ merkt den Druck und bittet ums
  Nachmessen. Fragt die Testfahrt nach dem SAG, misst sie dasselbe Element
  und führt danach zurück in die Testfahrt.
- *Testfahrt-Assistent:* „Fühlt sich gut an“ speichert die Grundeinstellung;
  sonst Rückfragen (wo, wie: hart, schlägt durch, taucht ab, kickt, wenig
  Grip, unruhig, wippt, nutzt den Federweg nicht; je nach Gefühl SAG
  gemessen?, wird es bei Schlagfolgen härter?, hart oder nervös?) und dann
  genau *eine* Änderung mit Grund und erwarteter Wirkung, innerhalb des
  Knopfbereichs und unter dem Maximaldruck. *Besser* bleibt, *gleich* und
  *schlechter* stellen zurück und schlagen das Nächste vor. Bekannte
  Probleme aus dem Onboarding sind direkt wählbar. Profis testen einen Knopf
  systematisch (3 → 2 → 1 Klick).
- *Vergleichen:* drei Profile nebeneinander oder Empfehlung, dein Wert,
  Grundeinstellung und „Vorher“ (aus dem Onboarding); Abweichungen markiert.
- *Speicher:* Setup-Daten je Radprofil (Profil-ID + Gabel + Dämpfer);
  Kopieren nimmt sie mit, Löschen entfernt sie. SAG-Messung und Haken gelten
  je Fahrprofil und nur für den Druck, bei dem gemessen wurde. Ist der
  Speicher voll, sagt die App es; Fotos werden nicht mehr still verworfen.
  Ein harter Konflikt an Gabel oder Dämpfer sperrt die Einstellwerte.
- *Grundeinstellung* je Profil speichern, zurück zur Grundeinstellung, auf
  Empfehlung zurücksetzen. *Notizbuch* mit 👍 😐 👎; jede Änderung, Messung
  und Testfahrt landet darin (je Kombination aus Gabel und Dämpfer,
  `mtb.setup`, alte Stände werden übernommen).
- *Gut zu wissen:* Begriffe (SAG, Zugstufe, Druckstufe, LSC, HSC, LSR/HSR,
  Token, Progression, Packing, Durchschlagen, psi/bar, Hub, Klicks zählen) und
  die Quellen: FOX Owner's Manuals, Tuning Guides und Quick-Start-Videos,
  RockShox Welcome Guides, Charger-3-Setup, Trailhead und Videos, Cane Creek,
  GMBN, Pinkbike, BikeRadar. Darunter aufklappbar alle Rechenwerte.

**Setup-Karte:** alle Werte beider Federelemente (mit eigenem Feintuning) auf
einer Bildschirmseite ohne Scrollen — zum Screenshotten für unterwegs; auf
dem iPhone SE hochkant, im Querformat und am Desktop vorne und hinten
nebeneinander.

**Live-Preise wie beim Preisvergleich.** Je Teil die Angebote der Partnershops
mit Preis, UVP, Versand und Lieferbarkeit, „Sale −X %“ gegenüber der UVP laut
Shop, „30-Tage-Tief“ aus dem eigenen Preisverlauf, eine Verlaufskurve über
90 Tage und der Reiter *Kaufen* (Einkaufsliste und Deals): alles, was gerade reduziert ist und in den
eigenen Aufbau passt. Der Aufbau rechnet mit dem günstigsten lieferbaren
Angebot; ohne Angebot mit dem Richtpreis aus dem Katalog.

**Zwei Sprachen.** Die ganze App gibt es auf Deutsch und Englisch: Beim ersten
Start entscheidet die Sprache des Geräts, umstellen geht oben rechts auf der
Startseite, im Einstieg und ganz oben in den Einstellungen („Sprache · Language“).
Preise, Zahlen und Daten folgen der Sprache (4.906 € / €4,906). Impressum und
Datenschutzerklärung bleiben verbindlich deutsch; auf Englisch steht eine
vollständige Übersetzung davor, das deutsche Original klappt darunter auf.
Mehr unter *Sprache und Texte*.

## Technik

Eine einzelne HTML-Datei, kein Framework, kein Server, keine Verbindung zu
Dritten — auch die Schriften liegen im Repo. Der Aufbau liegt im `localStorage` des Geräts und
verlässt es nicht. Als PWA installierbar und offline lauffähig.

    index.html                    die gesamte App
    manifest.webmanifest          Installationsdaten
    mtb-sw.js                     Service Worker, Offline-Betrieb
    icon-*.png                    App-Symbole
    tools/preise.py               liest die Produktfeeds, schreibt die Preise
    tools/kompat-test.mjs         prüft das Regelwerk gegen feste Testfälle
    tools/kompat-faelle.mjs       die Testfälle (Rahmen, Achsen, Freiläufe, Lager …)
    tools/kompat-raeder.mjs       61 echte Testräder als Komplettaufbau
    tools/katalog-export.mjs      schreibt den Katalog als docs/katalog.json
    docs/datenbank.md             Aufbau der Datenbank, Normfelder, alle Befunde
    .github/workflows/preise.yml  startet preise.py alle sechs Stunden
    preise.json                   Angebote je Teil (von der Action geschrieben)
    preisverlauf.json             günstigster Preis je Teil und Tag
    links.json                    Affiliate-Links, Netzwerk-IDs, Impressum-Angaben
    fonts/                        Schriften (lokal, SIL Open Font License)

Lokal: `index.html` per Doppelklick öffnen. Offline-Cache und
Homescreen-Installation brauchen `https://`.

Wie die Texte in beiden Sprachen organisiert sind: *Sprache und Texte*.

## Sprache und Texte

Jeder sichtbare Text steht in beiden Sprachen direkt im Code, eine
Übersetzungsdatei gibt es nicht. Die gewählte Sprache liegt in `localStorage`
unter `mtb.sprache` und gilt für alle Ansichten, Meldungen und berechneten
Texte; `setzeSprache()` wechselt sie und zeichnet alles neu.

**Wo was steht**

- `tx("Deutsch", "English")` — der Normalfall.
- `wort("weiter")` — das Wörterbuch `WORT` oben im Skript, für Wörter, die
  überall gleich heißen müssen (Weiter, Zurück, Einbauen, Gabel, Dämpfer,
  Prüfung …). Ein neues Standardwort gehört dorthin, nicht in ein weiteres `tx()`.
- Tabellen und Daten: Paar `["Deutsch", "English"]`, gelesen mit `sp2()` oder
  über Getter aus `zweisprachig()`.
- Festes HTML: `data-t="Deutsch|English"` für den Text, `data-ta` für
  aria-label, `data-tt` für title, `data-tc` für content (Meta-Beschreibung);
  gesetzt von `festeTexte()`.
- Zahlen, Preise, Einheiten und Daten nur über die Helfer `zahlDe`, `eur`,
  `eurG`, `euro`, `kg`, `prozent`, `zoll`, `datum`: Deutsch 1,5 kg · 1.234 € ·
  30 % · 08.10.2026, Englisch 1.5 kg · €1,234 · 30% · 8 Oct 2026.
- Schlüssel der Logik (Disziplinen, Maßnamen wie „Federweg“, Themen,
  Knopfnamen im Federungsrechner) bleiben deutsch; übersetzt wird nur, was
  angezeigt wird (`dimName()`, `stdName()`). Teilenamen mitten im englischen
  Satz schreibt `imSatz()` klein („Still missing: frame, fork …“).
- Marken und Modellnamen bleiben, wie der Hersteller sie schreibt — auch
  Ausstattungslinien wie Performance Elite oder Ultimate.
- Text in der anderen Sprache (deutscher Videotitel im englischen Text,
  „Impressum“ in der englischen Fassung) bekommt ein `lang`-Attribut.
- Impressum und Datenschutzerklärung: `impressumHtmlEn()` und
  `datenschutzHtmlEn()` übersetzen vollständig, verbindlich ist das deutsche
  Original. Wer den deutschen Text ändert, ändert den englischen mit.

**Ton**

- Deutsch durchgehend mit „du“, mit ä, ö, ü und ß. Englisch britisch (tyre,
  centre, aluminium, catalogue) und eigenständig formuliert, nicht Wort für
  Wort übersetzt.
- Freundlich, direkt, kompetent — wie jemand aus der MTB-Szene, der gut
  erklären kann. Keine Werbesprüche, keine Floskeln, keine übertriebene
  Begeisterung.
- Fachbegriffe dort kurz erklären, wo sie gebraucht werden; die lange Fassung
  steht unter *Begriffe erklärt*.
- Knöpfe nennen die Aktion mit Objekt („Grundeinstellung speichern“ / „Save baseline“,
  „Aufbau übernehmen“ / „Use this build“); nur Weiter, Zurück, Fertig und Abbrechen
  stehen allein. Eine Fehlermeldung sagt, was passiert ist und wie es weitergeht.
- Stimme: Die App spricht von sich als „die App“, Guide und Testfahrt-Assistent als
  „ich“, „wir“ steht nur im Rechtstext (der Betreiber).
- Prüfung: „passt nicht“ (Konflikt), „Kompromiss“, „passt mit Adapter“,
  „Tipp“ und „fehlt noch“ (Teil fehlt, darum noch nicht geprüft). Kann die App
  etwas mangels Angaben nicht prüfen, sagt sie „Nicht geprüft“ und warum —
  „passt“ steht nur da, wo wirklich geprüft wurde.
- Fahrwerk: zu jeder Einstellung, was sie bewirkt und wann eine Änderung
  sinnvoll ist. Werte nur mit Quelle — Herstellertabelle, oder ausdrücklich
  als Erfahrungsregel gekennzeichnet.

**Begriffe**

| Deutsch | Englisch |
|---|---|
| Rad (nicht „Bike“) | bike |
| Teil | part |
| Aufbau | build |
| Traumrad · Mein Rad · Gebrauchtrad | Dream bike · My bike · Used bike |
| Kompatibilität · Einsatz · Score | Compatibility · Discipline · Score |
| Prüfung | Check |
| Einbauen | Add to build (kurz: Add) |
| Einkaufsliste | Shopping list |
| Gabel · Dämpfer | fork · shock |
| Federweg (wie weit Vorder- und Hinterrad einfedern) · Hub (Dämpfer / Variostütze) | travel · stroke / drop |
| Variostütze (nicht „Dropper“) | dropper post |
| Token / Volumen-Spacer | token / volume spacer |
| Kletterhebel / Lockout | climb switch / lockout |
| Low-Speed-Druckstufe (LSC) · Low-Speed-Zugstufe (LSR) | low-speed compression · low-speed rebound |
| Mittelstrich (auf dem Knopf) | centre mark |
| SAG (Negativfederweg) | sag |
| Zugstufe · Druckstufe (auch High-Speed-Zugstufe; „Rebound“ nur als Erklärung in Klammern) | rebound · compression |
| Grundeinstellung | baseline (base setting) |
| Laufradsatz · Reifen · Freilauf | wheelset · tyre · freehub |
| Schaltwerk · Kassette · Kettenblatt | derailleur · cassette · chainring |
| Einbaumaß | eye-to-eye × stroke |
| vorn · hinten (nicht „vorne“) | front · rear |
| Modelljahr (nicht „Baujahr“, „Jahrgang“) | model year |
| O-Ring (beim SAG einmal als Gummiring erklärt) | O-ring |
| Bremssattel (bei Bremsen nie nur „Sattel“) | caliper |
| Cross-Country · Downhill pur · Sprünge pur | Cross-country · Pure downhill · Pure jumps |
| Setup-Profil (Downhill / Allround / Sprünge) · Angaben zum Fahrstil · Fahrerprofil (Gewicht, Maße) · Modus (Traumrad / Mein Rad / Gebrauchtrad) | setup profile · riding-style answers · rider profile · mode |
| Bauziel | build plan |
| Größenberatung („Deine Größe“) | sizing advice („Your sizing“) |
| Hersteller | manufacturer (nicht „maker“) |
| optional (nicht „freiwillig“) · Noch offen | optional · Still missing |
| Angebot bzw. Inserat (Gebrauchtrad) · verlangter Preis | listing · asking price |
| Werkstatt (Schrauben, Reparatur) | repairs; der Laden: bike shop |

**Schreibweisen**

- Achsen immer Breite×Achse (`110×15`, `148×12`, `100×15`), nie umgekehrt.
- Dezimalzahlen im Deutschen mit Komma, auch in Maßen (`205×62,5`, „Grip 3,5/5“);
  ausgenommen ist, was so auf dem Teil steht (Federhärte „450 × 2.80“).
- Menüpfade mit ›: „⋮ › App › Nach Update suchen“, „Einstellungen › Fahrerprofil“.
- Maße ohne Leerzeichen um das ×: `148×12`, `210×55`, `29×2.40`. Als Teil eines
  Wortes mit Bindestrichen: 30-mm-Welle, 157er-Hinterbau (`mmBind()` macht aus
  „30 mm“ im Text „30-mm“).
- „z. B.“ und „§ 5“ mit geschütztem Leerzeichen (U+00A0), damit am Zeilenende
  nichts auseinanderbricht.
- Apostroph in beiden Sprachen gerade (`geht's`, `you're`), Anführungszeichen
  typografisch („…“ / “…”). Englisch ohne Komma vor dem letzten „and“/„or“
  einer Aufzählung (britisch), aber mit Komma nach „Otherwise,“ am Satzanfang.
- Namen von Modi und Knöpfen in Antworten fett (`<b>Gebraucht</b>`), in
  Aufzählungen in Anführungszeichen („Nächster Schritt“).

**Prüfen**

    npm run test:sprache

`tools/sprach-test.mjs` öffnet die App in beiden Sprachen auf 390 px Breite
(`SPRACHE_BREITE=320` für das kleinste gängige Handy, `280` für das Außendisplay
eines Klapphandys),
geht alle Ansichten, Blätter, Assistenten, den Rundgang, jede Guide-Antwort
und alle Befunde aus den Kompatibilitätsfällen durch und meldet: Wörter der
anderen Sprache, Umlaute im Englischen, „Sie“-Anrede, ae/oe/ue statt Umlaut,
falsche Zahl-, Euro- und Prozentformate (auch Dezimalpunkt im Deutschen bei mm,
°, psi, Nm, Wh, ″), Reste wie `undefined` oder `${`,
Leerzeichen vor Satzzeichen und abgeschnittene Texte. Marken- und Modellnamen
aus dem Katalog sind ausgenommen. `--bericht datei.json` schreibt alle Funde
und alle gesammelten Texte zum Durchlesen heraus.

Diese gesammelten Texte sind zusätzlich mit LanguageTool 6.8 geprüft (de-DE und
en-GB, strengste Stufe „picky“, Oktober 2026). Was dort noch angemerkt wird,
sind Marken- und Modellnamen, MTB-Fachwörter, Satzstücke zwischen fett
gesetzten Wörtern und die Schreibweisen oben.

## Veroeffentlichen

Veroeffentlichen heisst: auf `main` pushen. Die Action
`.github/workflows/veroeffentlichen.yml` macht dann der Reihe nach:

1. **pruefen** — `npm test` (siehe *Tests*). Schlaegt etwas fehl, wird nicht
   gestempelt und nicht veroeffentlicht; der Testbericht haengt am Lauf.
2. **stempeln** — `APP_VERSION` in `index.html` und der Cache-Name in
   `mtb-sw.js` bekommen einen neuen Stempel. Veroeffentlicht wird nur die
   gepruefte Revision: Kamen seit dem Test weitere App-Aenderungen auf `main`,
   bricht der Lauf ab, und der neuere Push prueft sich selbst.
3. **veroeffentlichen** — mit Pages-Quelle *GitHub Actions* laedt der Lauf
   genau diese Revision hoch (nur, was die App braucht) und merkt sie im Tag
   `veroeffentlicht`; die Live-Preise liefern dann diesen Stand mit neuen
   Preisen aus. Danach wartet der Lauf, bis der neue Stempel live ist, und
   meldet einen Fehler, wenn nicht.

**Wichtig:** Steht unter *Settings → Pages → Source* noch „Deploy from a
branch“, baut GitHub Pages jeden Push auf `main` selbst — auch einen, dessen
Tests scheitern (dann fehlt nur der Stempel). Ein echtes Test-Tor ist es erst
mit Quelle *GitHub Actions*; bis dahin steht in jedem Lauf eine Warnung.

`App-veroeffentlichen.cmd` braucht es nur noch, um vom PC aus `links.json` aus
den Downloads zu uebernehmen; es pusht auf `main`, und dieselbe Action prueft
und veroeffentlicht.

Auf dem iPhone in **Safari** oeffnen, dann Teilen -> Zum Home-Bildschirm.

## Tests

Einmal einrichten (Node 18 oder neuer):

    npm ci
    npx playwright install chromium

Dann jederzeit:

    npm test

prueft die Syntax von `index.html`, alle Kompatibilitaetsfaelle aus
`tools/kompat-faelle.mjs` und `tools/kompat-raeder.mjs` (jeder muss gelaufen
und bestanden sein) und die Setup- und Speicherpruefungen aus
`tools/setup-test.mjs` (Speicherung je Rad, SAG je Fahrprofil, Speicherfehler,
Datensicherung, keine erfundenen Fahrwerkswerte ueber alle Gabeln und
Daempfer) sowie „Ein Weg je Aufgabe" aus `tools/wege-test.mjs` (keine
doppelten Einstiege, Fahrerprofil, Bauziel, Aufgabenkarte, Setup, Migration,
Handy/Desktop, Deutsch/Englisch) und die Sprachprüfung aus `tools/sprach-test.mjs`
(alle Ansichten auf Deutsch und Englisch, siehe *Sprache und Texte*). Ergebnis mit
Revision, Zahlen und Fehlern in `test-ergebnis.json`.
Einzeln: `npm run test:kompat`, `npm run test:setup`, `npm run test:wege`,
`npm run test:sprache`. Playwright ist in
`package.json`/`package-lock.json` auf eine feste Version gesetzt. Jeder Push
ausserhalb von `main` laeuft durch `.github/workflows/tests.yml`.

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

Unter ⋮ → App & Profil in der Kachel „Betreiber-PIN“ den PIN eintragen (oder die App mit `#betreiber` öffnen). Dann stehen unter ⋮
die Prüfliste bis zur Veröffentlichung, die Impressum-Angaben, Affiliate-Links,
Netzwerk-IDs und Feeds. Normale Nutzer sehen davon nichts.

## Free und Pro

CrankScore gibt es als **Free** (kostenlos) und **Pro**: 6,99 € im Monat oder
3,99 € im Monat bei jährlicher Zahlung (47,88 € im Jahr — 36 € bzw. 43 %
gespart gegenüber monatlich), jederzeit kündbar. Die Pro-Seite zeigt beide
Tarife nebeneinander, jährlich hervorgehoben, die Ersparnis rechnet die App aus
den Preisen (`PRO_MONAT`, `PRO_JAHR_MONAT`). Im **Betreiber-Modus** (`#betreiber`, beim
ersten Mal je Gerät mit PIN — im Code steht nur ein gesalzener PBKDF2-Hash;
„Gerät abmelden“ verlangt ihn wieder) ist Pro immer an — der Betreiber testet alles, ohne zu zahlen; Betreiber-Modus
aus zeigt die App wie für Free-Nutzer. Pro bringt:

- **Unbegrenzt Räder.** Free: ein Rad je Modus (Traumrad, Mein Rad, Gebraucht).
  Wer vorher schon mehrere hatte, behält sie; nur neue kommen nicht dazu.
  Der erste Einstieg legt auch in Free ein neues Rad an, wenn schon eins
  gebaut ist, damit es nie überschrieben wird.
- **Setup (Fahrwerk).** In Free zeigt der Reiter nur, was drin ist, und den Weg zu Pro; der Guide
  nennt keine Drücke, sondern erklärt nur Sag, Zug- und Druckstufe.
- **Guide ohne Limit.** Free: 10 Fragen am Tag, der Zähler steht oben im Guide.

Alles andere bleibt kostenlos. Ein Konto gibt es weiterhin nicht: Verkauft wird
über **Lemon Squeezy**, das als Händler (Merchant of Record) Bezahlung,
Rechnung, Mehrwertsteuer und Abo abwickelt. Nach dem Kauf kommt ein Lizenzcode per Mail, den
man unter ⋮ → CrankScore Pro eingibt. Die App prüft ihn selbst über die
License API von Lemon Squeezy (`activate`, `validate`, `deactivate`; kein
geheimer Schlüssel nötig): beim Freischalten, danach höchstens einmal am Tag.
Ist das Abo abgelaufen, ist Pro aus; ohne Netz bleibt Pro 14 Tage ab der
letzten erfolgreichen Prüfung an. Ein Code von einem fremden Store wird
abgelehnt. „Auf diesem Gerät entfernen“ gibt die Aktivierung frei, damit man
den Code woanders nutzen kann. Ohne Server lässt sich Pro durch Ändern des
Browser-Speichers vortäuschen — ohne Server ist das hingenommen; `#betreiber` allein reicht seit dem PIN nicht mehr.

**Einrichten (einmalig):**

1. Bei Lemon Squeezy einen Store anlegen und ein Produkt „CrankScore Pro“ als
   Abo mit zwei Varianten erstellen — monatlich 6,99 €, jährlich 47,88 € —,
   *License keys* einschalten
   (Aktivierungslimit etwa 3 Geräte, Laufzeit an das Abo gebunden).
2. App mit `#betreiber` öffnen, unter ⋮ → Pro-Verkauf die beiden Kauf-Links
   (Checkout-URL monatlich und jährlich), die Store-ID und die Produkt-ID eintragen.
3. „links.json speichern“ und veröffentlichen. Bis dahin zeigt die Pro-Seite
   „Pro kommt bald“ und nimmt keinen Code an.

Die Datenschutzerklärung nennt Lemon Squeezy und die Lizenzprüfung (Abschnitt 7).
Gebühren bei Lemon Squeezy laut Preisliste: 5 % plus 50 US-Cent je Zahlung. Bei
6,99 € im Monat bleiben nach Gebühren und Mehrwertsteuer grob 5,10 €; beim
Jahresabo fällt die feste Gebühr nur einmal an — von 47,88 € bleiben grob 37 €.

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

## Guide als Werkstatt-Experte

Der eingebaute Guide (Sprechblase oben rechts) beantwortet neben App- und
Aufbaufragen auch Werkstattfragen — einfach erklärt, Fachwörter sofort
übersetzt, Arbeiten als nummerierte Schritte, bei Bremsen immer mit
Sicherheitshinweis: Bremse schleift / quietscht, entlüften, Beläge wechseln,
Felgen- und Rücktrittbremse, Schaltung einstellen, Schaltung springt, Kette
wechseln, messen und ölen, Inspektion, Platten, Nabenschaltung, Marken-
Vergleiche (Bremsen, Schaltungen, E-Bike-Motoren), Mineralöl oder DOT.
Die Antwort richtet sich nach dem Rad im Aufbau (welche Bremse, welche
Flüssigkeit, Shimano/SRAM Eagle/Transmission/Di2, welche Kette); nennt die
Frage eine Marke („Wie entlüfte ich eine Magura?“), gilt die. Fehlt das Teil,
fragt der Guide danach. Alles läuft offline in der App, ohne KI-Dienst.

## Kompatibilitäts-Prüfung

`node tools/kompat-test.mjs` lädt die App in Chromium (Playwright) und spielt
feste Aufbauten durch: welcher Befund rot, gelb oder nur Hinweis sein muss —
und welcher nicht kommen darf. Kippt eine Änderung an Katalog oder Regeln ein
bekanntes Ergebnis, schlägt der Test an (Rückgabewert 1).

- `tools/kompat-faelle.mjs`: 138 Regelfälle je Norm — SRAM UDH / Transmission
  je Rahmen und Baujahr, T-Type, Achsen 135/142/148/150/157 inkl. Umbaukit,
  Vorderachse Boost/Non-Boost und 15/20 (Endkappen), Freiläufe HG / Micro Spline / XD, Innenlager BSA 68/73/83,
  PF92, PF107, PF30, BB30, T47, Spanish, DUB / DUB Wide, 24 / 30 mm, ISIS,
  PowerSpline, 83-mm-DH-Kurbeln, Kettenlinie 52 / 55 / 56,5, Bremsaufnahmen
  (PM nativ + Adapter-Rechnung, Flat Mount, IS), Steuersatz nach SHIS
  (ZS44/ZS56, IS41/IS52, IS42/IS52, ZS56/ZS56 …), gerader Schaft im konischen
  Rohr, Lenkerklemmung, E-MTB-Motorwelle.
- `tools/kompat-raeder.mjs`: 61 echte Räder als Komplettaufbau nach
  Serienausstattung, von XC bis Downhill, Dirt, Slope, Trial, Hardtail und
  E-MTB (Bosch, Shimano EP, Specialized, TQ). Jedes muss vollständig sein, darf
  nichts Rotes haben und gelb nur dort, wo die Serie einen Adapter verbaut.

Neue Fälle kommen in die beiden Dateien; Teile mit Ausführung als
`["w-hopemx", {Nabenbreite:"150x12"}]`. Aufbau der Datenbank, alle Normfelder
und alle Befunde: [docs/datenbank.md](docs/datenbank.md). Den Katalog als JSON
schreibt `node tools/katalog-export.mjs` nach `docs/katalog.json`.

Ampel: rot = passt nicht (mit Begründung), gelb = Kompromiss oder „mit
Adapter“ (etwa Post-Mount-Adapter: PM180 + 23 mm = 203 mm), Tipp = grün.

Datenkorrekturen (01.10.2026): Trek Session hat UDH; Commencal Meta SX erst ab
2023 mit UDH; Specialized Enduro erst ab 2025; Transition Sentinel (Carbon)
erst ab 2024; Commencal Supreme DH V5 hat 157 mm hinten (150 nur mit
Umbaukit); Canyon Sender CFR ab 2025 mit 148 mm und UDH; Shimano Saint
FC-M820 hat 50,4 mm Kettenlinie, die 83-mm-Version FC-M825 57,9 mm; Saint-
Schaltwerk RD-M820 bis 36 Zähne (FR-Modus); SID-Familie bis 200-mm-Scheibe,
Fox 40 (2025) bis 230; Megatower 2, Meta SX/TR V5 bis 223, Enduro bis 220,
Top Fuel bis 180, Oiz Flat Mount 160.

Neu im Katalog: 7 E-MTBs (Trek Rail+, Specialized Turbo Levo 4, Orbea Wild,
Cube Stereo Hybrid 160, YT Decoy MX, Trek Fuel EXe, Orbea Rise), 10 Rahmen
(Santa Cruz 5010 und Tallboy, YT Izzo, Pivot Firebird, Propain Hugene und
Rage, Cube Stereo ONE55 und Two15, Specialized Status 160, Commencal Meta HT
AM), 5 E-MTB-Kurbeln, 2 E-MTB-Laufradsätze, Innenlager für T47 und BB30.

## Adapter-System

Seit 03.10.2026 ist jeder Adapter ein echtes Teil im Aufbau, keine Fußnote mehr.

- **Automatisch gewählt:** Erkennt die Prüfung einen Fall, den ein Adapter löst,
  hängt sie den passenden Adapter an. Er kommt mit Name, Richtpreis, Gewicht,
  Rechnung und Begründung. Der Adapter ist Pflicht: Er zählt in Preis, Gewicht,
  Einkaufsliste und kopierte Liste. Weg ist er nur, wenn du die Teile änderst.
- **Wo er steht:** Als Zeile unter dem Teil, an das er geschraubt wird:
  - Bremsadapter an Gabel oder Rahmen
  - Endkappen am Laufrad
  - Reduzier-Unterteil an der Gabel
  - Konverter-Lager an der Kurbel
  - Achs-Umbaukit am Rahmen

  Nur dieses Teil wird gelb. Das Urteil oben lautet „Kompatibel mit Adapter“.
- **Fälle:**

  | Fall | Adapter | Richtpreis |
  |---|---|---|
  | Post Mount kleiner als Scheibe | PM +Differenz (z. B. PM 180 + 23 mm = 203 mm) | 17–24 € |
  | PM 200 auf 203 | Distanzscheiben +3 mm | 8 € |
  | Flat Mount | FM-auf-PM-Adapter | 25 € |
  | IS2000 | IS-auf-PM-Adapter | 15 € |
  | Vorderachse 15 ↔ 20 mm, gleiche Breite | Endkappen | 30 € |
  | Hinterbau mit Hersteller-Umbaukit (Commencal 157 → 150) | Umbaukit | 45 € |
  | Gerade Gabel im konischen Rohr | Reduzier-Unterteil …/30 | 32 € |
  | BB30/PF30 mit 24-mm- oder DUB-Welle | Konverter-Innenlager | 75 € |

- **Tauschen statt Adapter:** Unter jeder Adapterzeile steht ein Knopf, der
  das passende Teil direkt einsetzt — mit Preisunterschied, sofort umgestellt
  und mit „Rückgängig“ im Hinweis. Gesucht wird so:
  1. dasselbe Teil in anderer Ausführung (z. B. „Ohne Adapter: Scheiben
     180/180“, Vorderrad in 15 mm, Gabel tapered)
  2. sonst das beste Teil aus dem Katalog: kein neuer Konflikt, der Adapter
     fällt weg, gleiche Marke bevorzugt, dann bester Score, dann kleinster
     Preisunterschied (z. B. SRAM mit 200er-Scheiben an einer PM-200-Gabel
     statt Shimano 203)

  Gibt es kein solches Teil (Flat Mount: jeder Sattel im Katalog braucht dort
  einen Adapter), fehlt der Knopf.
- **(i) daneben:** Öffnet ein Glas-Fenster mit Rechnung, einer Skizze nach den
  echten Maßen und dem Grund in Klartext. Bei Bremsen steht dort auch, um wie
  viel der Sattel nach außen rückt (halbe Differenz = Radius). Darunter steht
  derselbe Tauschen-Knopf, unten führt ein Link in den passenden CrankScore
  Guide. Schließen mit X, Tipp
  daneben oder Escape. Am Handy ist das Fenster unten angedockt und scrollt in
  sich.
- **CrankScore Guide „Adapter verstehen“:** Reiter Bremse, Achse, Innenlager
  und Steuersatz. Er beginnt mit dem, was in deinem Aufbau steckt, und zeigt:
  - die Formel
  - Skizzen der drei Bremsaufnahmen (PM, FM, IS2000)
  - Tabellen, was mit Adapter geht und was nie
  - SHIS erklärt

  Der Chat-Guide verweist bei Fragen wie „Welcher Bremsadapter passt?“ dorthin.
- **Prüfung:** `tools/kompat-test.mjs` verlangt zu jedem Adapterfall ein
  vollständiges Adapter-Teil und prüft in 14 eigenen Fällen Name, Rechnung,
  Preis, Platz und den Tausch. Die Oberfläche ist am Handy mit 29 Prüfungen getestet
  (Erkennen, Zeile, (i), Schließen, Guide, Prüfung, Einkaufsliste, Tauschen, Rückgängig).

## Grafik-Prüfung

Ein Prüfskript öffnet jede Ansicht, jede Schublade, alle Assistenten- und
Einstiegsschritte, den Rundgang und die Startseite — in 320, 390, 430, 768 und
1280 px, dunkel und hell, Deutsch und Englisch — und meldet Elemente, die aus
dem Bild ragen, und abgeschnittene Texte. Dazu Screenshots zum Durchsehen.
Behoben am 30.09.2026: Knöpfe blieben nach dem Tippen gedimmt (Hover klebte auf
dem iPhone), die Disziplin in der Kopfzeile war auf schmalen Handys
abgeschnitten („T…“, „End…“), die Startseite zeigte Beispielzahlen der eigenen
Disziplin statt des Trail-Beispiels, hellgraue Knöpfe waren auf grauen Flächen
unsichtbar (Guide-Antworten, Rechtliches), der Shop-Link nahm in Upgrades und
Sparvorschlägen dem Namen die halbe Breite, „Übernehmen“ ragte im Assistenten
bei 320 px aus dem Bild, und nach jedem Öffnen einer Schublade stand ein
Fokus-Ring um den Schließen-Knopf (jetzt nur bei Tastatur-Bedienung).

## Bewegung und Designwechsel

Seit 08.10.2026 folgt jede Animation einer Bewegungssprache (Tokens in `:root`):

| Token | Wert | wofür |
|---|---|---|
| `--t-tipp` | 110 ms | Antippen (Knöpfe drücken leicht ein) |
| `--t-kurz` | 180 ms | Kleines, Ausblenden, Schließen |
| `--t-mittel` | 260 ms | Blätter, Umschalter, Einblenden, Aufklappen |
| `--t-design` | 300 ms | Wechsel Hell/Dunkel |
| `--e-aus` / `--e-weich` / `--e-ein` | ease-out / ease-in-out / ease-in | Ankommen / Gleiten / Gehen |
| `--hub`, `--hub-gross`, `--zoom` | 8 px, 24 px, 0,98 | Wege und Zoom beim Einblenden |

- Animiert wird mit `transform` und `opacity`, ohne Überschwingen (`--feder` ist
  nur noch ein Alias für `--e-aus`), ohne großen Zoom und ohne endlose Effekte.
- **Designwechsel:** `setzeDesign()` blendet die ganze Ansicht per View Transition
  in 300 ms über; das läuft auf der GPU (gemessen: bei 4-fach gedrosselter CPU 6
  statt 1 Bild in 400 ms gegenüber Farbübergängen an jedem Element).
  - Tippt man währenddessen erneut auf den Schalter, kommt der Wunsch in eine
    Warteschlange; nach dem laufenden Übergang folgt einer zum zuletzt gewählten Design.
  - Jeder andere Tipp während der Überblendung beendet sie sofort und wird an das
    Element unter dem Finger weitergereicht.
  - Ältere Browser ohne View Transition bekommen gezielte Farbübergänge
    (Klasse `design-wechsel`).
  - Design und Statusleisten-Farbe stehen schon vor dem ersten Bild (Skript im `<head>`).
  - Statusleiste auf dem iPhone:
    - Das Tag `theme-color` legt erst das Skript im `<head>` an, gleich mit der
      Farbe des gespeicherten Designs. Beim Umschalten wird es durch ein neues
      ersetzt. Hintergrund: iOS liest die Farbe bei Home-Bildschirm-Apps teils
      nur einmal.
    - `html` hat denselben festen Hintergrund wie `body`, weil iOS ab Version 26
      die Statusleiste nach dem Seitenhintergrund färbt.
    - Ungeprüft auf einem echten Gerät. Je nach iOS-Version übernimmt die
      Statusleiste ein umgeschaltetes Design womöglich erst nach einem Neustart
      der App.
- **Blätter:** 260 ms hoch und ein, 180 ms aus. `schliesse()` leert `#modal` sofort;
  ein inertes Abbild in `#modal-weg` blendet aus. Ein direkt folgendes Blatt
  übernimmt die Abdunklung (`ohne-ein`).
- Einflug beim Ansichtswechsel, Aufklappen von Gruppen und `details` laufen nur
  bei echter Bedienung, nie beim bloßen Neuzeichnen.
- **Bewegung reduzieren** (`prefers-reduced-motion`): nichts fährt, zoomt oder
  läuft endlos; Blätter und Hinweise blenden 150 ms über, Hell/Dunkel wechselt direkt.

## Handy: wie eine native App

Seit 02.10.2026 verhält sich die App auf iOS und Android wie eine native App:

- **Kein Zoom:**
  - Das viewport-Tag sperrt Pinch-Zoom (`user-scalable=no`, `maximum-scale=1`).
  - iOS Safari ignoriert das seit iOS 10, dort blockiert
    `gesturestart`/`gesturechange` die Zwei-Finger-Geste.
  - Auf Android übergehen Samsung Internet, Firefox („Zoom auf allen
    Websites“) und Chrome mit „Zoom erzwingen“ das Tag. Dort sperrt
    `touch-action: pan-x pan-y` auf jedem Element Pinch und Doppeltipp, und
    ein Skript fängt jede Zwei-Finger-Bewegung ab. Nicht `manipulation`: das
    erlaubt Pinch-Zoom ausdrücklich.
  - Getestet, indem der Test das viewport-Tag zur Laufzeit zoombar macht: Seite,
    Schublade, Guide und waagerechte Leisten bleiben bei Pinch und Doppeltipp
    auf Zoom 1. Jede der beiden Sperren hält auch allein (das Skript allein
    nicht auf waagerechten Leisten).
  - `overscroll-behavior-y: none` verhindert das Gummiband und
    Ziehen-zum-Neuladen.
- **Keine Textauswahl, kein Kopier-Menü:**
  - `user-select: none` und `-webkit-touch-callout: none` gelten für alles.
    Ausnahmen sind Eingabefelder und die Klasse `.waehlbar` (Impressum,
    Datenschutz, Kopierfeld).
  - Langes Drücken öffnet am Handy kein Kontextmenü (Bild sichern, Link teilen).
  - Klappt „Liste kopieren“ nicht automatisch, zeigt die App den Text in einem
    markierbaren Feld.
- **Volle Höhe und Safe Areas:**
  - `100dvh` folgt der Adressleiste, mit `100vh` als Rückfall.
  - Kopfzeile, Inhalt, Tableiste, Hinweise, Schubladen, Einrichtung und
    Rundgang halten Abstand zu Notch, Dynamic Island und Home-Balken.
  - Im Querformat halten sie auch Abstand zur seitlichen Aussparung.
  - Die Tableiste sitzt ganz über der Schutzzone des Home-Balkens.
- **Tippen:** Alle Bedienelemente sind mindestens gut 30 px hoch und geben beim
  Antippen sichtbar nach. Felder haben mindestens 16 px Schrift, sonst zoomt
  iOS beim Antippen.
- **Eingaben:**
  - Zahlenfelder nehmen nur Ziffern (mit Komma oder Punkt).
  - Bei negativen Werten, „1e5“, Sonderzeichen und Werten außerhalb plausibler
    Grenzen steht ein Hinweis unter dem Feld, und die App rechnet nicht damit.
  - Kommazahlen (Ausrüstung, Radgewicht) nutzen ein Textfeld mit
    Dezimal-Tastatur, weil manche Browser aus „8,5“ sonst 85 machen.

Geprüft mit Playwright auf iPhone SE, Galaxy S, iPhone 13 mini, iPhone 15,
Pixel 8, iPhone 15 Pro Max und iPhone 15 quer:
- echte Touch-Geräte mit simulierter Notch, Home-Balken und seitlicher
  Aussparung;
- 23 Ansichten je Gerät, Deutsch und Englisch, dunkel und hell;
- jedes Eingabefeld mit 17 kaputten Werten, alle Dropdowns, Touch-Gesten
  (Schieberegler, Wischen, Reiter).

Ergebnis: kein Überlauf, nichts unter Notch oder Home-Balken, keine zu kleinen
Tippflächen, keine Konsolenfehler.

## Grenzen

Live-Preise gibt es nur für Teile, die ein Partnershop im Feed führt, und nur
so aktuell wie der letzte Lauf (alle sechs Stunden). Maßgeblich ist der Preis
im Shop. Die Zuordnung Feedzeile → Katalogteil ist auf Genauigkeit gebaut:
lieber kein Preis als der Preis eines anderen Teils. Die Engine kennt
Normmaße, nicht jede Sonderlocke eines einzelnen Rahmenjahrgangs — vor dem Kauf
gegen das Datenblatt des eigenen Rahmens prüfen. Trial-Maße sind auf Mod 20/19″
und Stock 26″ vereinfacht.
