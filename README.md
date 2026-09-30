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

**Zwei getrennte Werte.** *Passform* misst, ob es mechanisch zusammenpasst.
*Einsatz* misst, ob alle Teile in dieselbe Richtung ziehen — ein Enduro-Rahmen
mit XC-Bremsen ist fehlerfrei und trotzdem falsch gebaut.

**Übersicht im Stil von Bevel.** Oben drei Ringe nebeneinander wie die
Kennzahlen in der Gesundheits-App Bevel: in der Mitte groß der *Score*
(Ampelfarbe: grün ab 85, gelb ab 60, sonst rot), links *Passform* (violett),
rechts *Einsatz* (orange). Tippen auf einen Ring erklärt die Zahlen. Darunter
ein Satz zum Stand und zwei Kacheln: *Preis* (mit Budget als Tankanzeige —
wie viel frei ist oder dass es drüber liegt) und *Gewicht* (mit „x von y
Teilen“). Direkt darunter die Karte **Nächster Schritt**: statt aller Listen
der eine Schritt, der das Rad jetzt am meisten weiterbringt — zuerst ein
harter Konflikt (am liebsten kostenlos: dasselbe Teil, andere Ausführung),
dann beim Traumrad über Budget der größte Sparzug bei gleichen Maßen, sonst
das beste echte Upgrade mit Punkten, Preis und Gewicht. Ein Knopf baut es
ein, ein zweiter fragt den Guide „Was fehlt zur 100?“. Gerechnet wird mit
denselben Vorschlägen wie im Reiter Upgrades; beim Gebrauchtrad und bei
leerem Aufbau fehlt die Karte. Das Design dazu: echtes Schwarz (hell: iOS-
Grau), Graphit-Karten ohne Rand mit großen Radien, Beschriftungen in normaler
Schreibung statt gesperrter Versalien, Knöpfe schlicht weiß auf schwarz
(hell umgekehrt), der bunte Verlauf Orange → Pink → Violett nur noch am
Guide, am Assistenten und an „Nächster Schritt“. Grautexte haben mindestens
4,5:1 Kontrast, die Ringe mindestens 3:1. Die Seiten von Bevel selbst
(bevel.health) waren aus der Entwicklungsumgebung gesperrt — Vorlage war die
bekannte Bevel-App: Ringe oben, ein Coach-Tipp, ruhige Karten.

**Startseite.** Aufgebaut wie bevel.health (nach einer Bildschirmaufnahme der
Seite): hell, große Überschriften, schwarzer Knopf „Kostenlos starten“, ein
weiches Farbband mit dem gezeichneten Rad im Kopf, dann „Kennt die Teile von“
mit laufenden Markennamen und drei Zahlen (Teile, Marken, Prüfregeln — aus dem
Katalog gezählt), je Funktion eine große hellgraue Karte mit Handy-Vorschau und
Farbschein (Wertung, Prüfung, Nächster Schritt, Dein Fit, Gebrauchtrad), ein
dunkler Abschnitt für den Guide mit leuchtender Kugel, „Und das ist nicht
alles“ zum Wischen, Free oder Pro, eine dunkelgrüne Karte zur Privatsphäre,
„Bereit, wenn du es bist“ und eine Fußzeile mit Impressum und Datenschutz.
Die Zahlen in den Vorschauen rechnet die App selbst (Wertung des Startrads, Fit
für 1,82 m, Luftdruck für 80 kg); erfundene Nutzerzahlen oder Bewertungen gibt
es bewusst nicht. Karten gleiten beim Scrollen ein (aus bei „Bewegung
reduzieren“). Sie kommt beim ersten Besuch im Browser vor dem Einstieg, in der
installierten App nicht; sonst unter ⋮ → Über CrankScore oder über die Adresse
mit `#start` — der Link für TikTok:
https://trostliam-hub.github.io/dreambuild/#start

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
Im Aufbau steht an Rahmen, Lenker, Vorbau, Kurbel und Stütze, was zu dir passt
(„auf 780 mm kürzen“, „Größe L bestellen“); die Prüfung hat eine eigene Rubrik
*Passt das Rad zu dir?*, die nur zeigt, was nicht passt, und nicht in die
Wertung zählt. Der Assistent stellt
Kurbellänge, Hub, Vorbaulänge und Rise auf den Fahrer ein — nur innerhalb des
Modells und nur, wenn die Prüfung dadurch nicht schlechter wird. Einkaufsliste
und kopierter Text nennen Rahmengröße, Lenkerkürzung und Sattelhöhe für die
Werkstatt. Die Maße gelten wie das Fahrergewicht für alle Profile.

**Für Einsteiger.** Nach dem Einstieg kommt einmal ein **Rundgang**: ein
Scheinwerfer wandert über die echten Bedienelemente (Wertung, Modi, Teile,
Prüfung, Upgrades, Kaufen, Disziplin, Menü), daneben eine Karte mit einem Satz,
Fortschrittspunkten, Zurück und Überspringen; am Ende Konfetti. Auf breiten
Bildschirmen zeigt er auf die Spalten statt auf die Reiter, Pfeiltasten
blättern, Esc beendet. Unter ⋮ → *App & Profil* stehen ganz oben zwei große
Knöpfe: *Einstieg wiederholen* und *App-Rundgang*; darunter die Hilfe als
erklärte Zeilen (Fit, Federungsrechner, Begriffe, Anleitung ein/aus).
Wer im Einstieg „Ganz neu dabei“ wählt, bekommt an jeder Teilekachel einen Satz,
was das Teil tut. Oben im Aufbau führt eine Leitkarte Schritt für Schritt: je
Modus drei bis vier Schritte, abgehakt, was erledigt ist, ein Knopf für den
nächsten. Die Erklärung der Wertung steht direkt an der Wertung. Ausführungen
(Einbaumaß, Federweg …) sind eingeklappt, bis man sie ändern will; die
Teilekachel nennt dann nur das Modell, damit nichts doppelt steht. Der Reiter
*Kaufen* hat eine Einkaufsliste mit Shop-Knöpfen, als Text kopierbar für die
Werkstatt.

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
an die richtige Stelle führen (Federungsrechner, Fit, Prüfung, Teileliste mit
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

**Federungsrechner.** In der Gruppe Fahrwerk (und unter ⋮ → Hilfe): aus
Fahrergewicht (+4 kg Ausrüstung) und einem Fahrprofil aus fünf Fragen
(Gelände, Tempo bergab, Sprünge, gewünschtes Gefühl, Anteil bergauf) je Gabel und Dämpfer ein Luftdruck in psi/bar mit Sag-Ziel, bei
Stahlfeder die Federhärte, dazu Druck- und Zugstufe — in drei Modi: *Pur
Downhill*, *Allround* und *Pur Sprünge*. Grundlage sind die
Herstellertabellen (Fox Owner's Manuals 2025 für 32/34/36/38/40,
RockShox-Tabellen für Pike, Lyrik, ZEB, SID, Domain, BoXXer, Recon, Reba,
LinearXL ab Modelljahr 2027); Gabeln ohne eigene Tabelle bekommen den Wert
ihrer Klasse und sagen das. Druckstufen ab der Grundeinstellung des
Herstellers (GRIP X2 5/10, GRIP X 10/10 von zu, sonst Mitte) und so, wie es auf
dem Knopf steht: RockShox Charger 3.2 hat Zahlen (LSC −7 bis +7 = 15
Stellungen, HSC −2 bis +2 = 5 Stellungen) — die App sagt „auf +2 stellen“;
Charger 3 und 3.1 sowie der RC2T-Dämpfer haben Striche von − bis + und werden
ab der Mitte gezählt; Fox ab ganz zu, Cane Creek ab ganz offen. Fox GRIP,
GRIP SL und FIT4 haben einen Hebel mit drei Stufen (bergab offen). Lyrik und
ZEB ab 2027 haben dazu den Durchschlagschutz ABO (5 Stufen). Dämpfer: Luft
rund Körpergewicht in lb, skaliert mit der geschätzten Hinterbau-Übersetzung;
Stahlfeder = Last hinten × Übersetzung / (Hub × Sag). Die Dämpfer-Druckstufe
richtet sich nach Modell *und* Ausführung: RockShox RC2T (Super Deluxe und
Vivid Ultimate) mit HSC und LSC in je 5 Stellungen, die Stahlfeder-Versionen
dazu mit dem Durchschlagschutz HBO (5 Stufen; bei Luft fest), Fox Float X2
und DHX2 Factory mit HSC 8 / LSC 16 / HSR 8 / LSR 16 Klicks (Performance Elite
nur LSC und LSR), Float X mit LSC 11, Float DPS mit Open-Mode-Adjust,
Cane Creek DB IL (gezählt ab offen, HSC in Umdrehungen), Kitsuma mit Climb
Switch in drei Stufen, Öhlins TTX; Select+ und Performance zeigen nur den
Kletterhebel, Select (R) keine Druckstufe.
Drei Modi, oben im Rechner umschaltbar, jeder mit eigener Luft, eigenem Sag,
eigener Druck- und Zugstufe (nach den Tuning-Guides von Fox und RockShox sowie
ENDURO, BikeRadar, MBR): *Pur Downhill* — 6 % weniger Luft, 3 % mehr Sag, LSC
und HSC je drei Stufen offener, Zugstufe drei Klicks schneller, HBO/ABO eine
Stufe fester: weicher, spricht schneller an, sackt bei Schlagfolgen nicht weg,
fängt harte Schläge bei Tempo ab; *Allround* — genau das
Fahrprofil; *Pur Sprünge* — 5 % mehr Luft (oder ein Volumen-Spacer), 2 % weniger
Sag, LSC zwei Stufen fester gegen Einsacken im Absprung, HSC fester für
Landungen, Zugstufe langsamer gegen Aushebeln am Kicker. Kurze Federwege (bis
130 mm) haben weniger Reserve: bergab nicht ganz so weich, beim Springen mehr
Luft und HSC; lange (ab 180 mm, Doppelbrücke) brauchen beim Springen weniger
Luft. Je Knopf wird Allround auf ganze Klicks gerundet, jeder Modus kommt als
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
Kitsuma. Der Startwert folgt dem Gewicht wie die Fox-Tabellen (rund 2 Klicks
je 10 kg, bei 80 kg die Mitte); eine Tabelle auf der Gabel hat Vorrang. Ohne
bekannte Klickzahl zählt die Zugstufe ab dem eigenen Grundwert (Bordsteintest).
Jede Antwort verschiebt Low- und High-Speed um feste Stufen (eine Stufe =
12 % des Einstellbereichs, ab drei Stufen zählt jede weitere halb, ganz zu
wird bei Knöpfen mit vielen Klicks nie empfohlen): Flowtrails und zügiges
Tempo machen die LSC fester, ruppiges Gelände die HSC offener, Sprünge und
Bikepark die HSC fester, das gewünschte Gefühl beides. Die Grundeinstellung
des Herstellers gilt also für einen ruhigen Tourenfahrer.
Jede Karte zeigt eine Vergleichstabelle aller drei Modi (Luft, Sag, jeder
verstellbare Knopf, Zugstufe; Tippen auf einen Spaltenkopf wechselt den Modus)
und darunter zu jedem Knopf des gewählten Modus eine Kachel mit Strich-Skala
(ein Strich je Klick oder Stufe, langer Strich = Grundeinstellung). Dazu der
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

## Free und Pro

CrankScore gibt es als **Free** (kostenlos) und **Pro** (1,99 € im Monat,
jederzeit kündbar). Pro bringt:

- **Unbegrenzt Räder.** Free: ein Rad je Modus (Traumrad, Mein Rad, Gebraucht).
  Wer vorher schon mehrere hatte, behält sie; nur neue kommen nicht dazu.
  „Einstieg wiederholen“ legt auch in Free ein neues Profil an, damit ein
  gebautes Rad nie überschrieben wird.
- **Federungsrechner.** In Free öffnet der Knopf die Pro-Seite, und der Guide
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
Browser-Speichers vortäuschen — bei 1,99 € ist das hingenommen.

**Einrichten (einmalig):**

1. Bei Lemon Squeezy einen Store anlegen und ein Produkt „CrankScore Pro“ als
   Abo für 1,99 € im Monat erstellen, *License keys* einschalten
   (Aktivierungslimit etwa 3 Geräte, Laufzeit an das Abo gebunden).
2. App mit `#betreiber` öffnen, unter ⋮ → Pro-Verkauf den Kauf-Link
   (Checkout-URL), die Store-ID und die Produkt-ID eintragen.
3. „links.json speichern“ und veröffentlichen. Bis dahin zeigt die Pro-Seite
   „Pro kommt bald“ und nimmt keinen Code an.

Die Datenschutzerklärung nennt Lemon Squeezy und die Lizenzprüfung (Abschnitt 7).
Gebühren bei Lemon Squeezy laut Preisliste: 5 % plus 50 US-Cent je Zahlung. Bei
1,99 € im Monat bleiben je nachdem, ob die Mehrwertsteuer im Preis steckt, grob
1,10 bis 1,40 € — ein Jahresabo würde die feste Gebühr nur einmal fällig machen.

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
