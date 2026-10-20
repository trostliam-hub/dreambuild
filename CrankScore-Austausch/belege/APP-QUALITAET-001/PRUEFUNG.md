# APP-QUALITAET-001: bestätigte Veröffentlichung

- Basis: `3240eef97a568ace90b06f65f5473e625212e454`.
- App-/Prüfcommit: `3e10f9536c990f2f18308387a0a397e35b55a381`.
- Automatischer Stempel: `b057b759d63a50d79172a050215594deff5080e0`.
- Öffentliche Version: **20261020-1622**, Offlinecache **dreambuild-20261020-1622**.
- [Erfolgreicher Gesamtworkflow](https://github.com/trostliam-hub/dreambuild/actions/runs/39437374439), [erfolgreiche Pages-Verteilung](https://github.com/trostliam-hub/dreambuild/actions/runs/39438622258).

Lokal vollständiges `npm test`: 397 Appprüfungen plus zwei Syntaxprüfungen, 253 Sekunden. GitHub: dieselben Gruppen vollständig bestanden, 404 Sekunden; Sprache ohne Funde in 11.139 Texten, Preisprüfung ohne Fehler, zusätzlicher KI-Server 8/8 mit simulierter Provider-API. Die neuen Gruppen 10/10, 10/10 und 8/8 sind Teil des dauerhaften Gates.

`online-dateiabgleich.json` bestätigt am 20.10.2026 um 14:24:13 UTC vollständige Gleichheit beider öffentlichen Dateien mit dem gestempelten Checkout nach Normalisierung der Zeilenenden. 17 neue Fälle wurden zusätzlich direkt online geprüft, nur mit isolierten synthetischen Daten. Der danach erzeugte Stempel änderte ausschließlich Versions- und Cachenamen. Der echte Offline-Neustart wurde lokal mit tatsächlich geschlossenem HTTP-Server geprüft. Keine echten KI-Anfragen.

Der getrennte Quelltextreview gilt für die ungestempelte App und den Worker, siehe `quelltext-review.json`. `quelltext-entlastung.json` weist ausschließlich entfernten unerreichbaren Zeichnungscode nach. Bilder im Ordner zeigen lokale Preis-/Bildausfallansichten und öffentliche Ansichten unter `online-bilder/`.

Der erste lokale Gesamtlauf scheiterte an einer überlagernden Route im externen Windows-Prüfadapter; App und Tests blieben unverändert. Der Fehlversuch wird neben dem erfolgreichen Bericht aufbewahrt. Nach Bereinigung des Adapters bestanden der gezielte 10er-Lauf und der gesamte Lauf.

Die zwei zusätzlich geprüften Preis-Workflow-Hunks sind in `preisworkflow-pruefung.json` dokumentiert. Ohne Shopfeeds sind öffentliche Livepreise weiterhin nicht eingerichtet. Die App zeigt Richtpreise; keine Angebote oder Schlüssel wurden erfunden. Kein neuer entfernter Preis-Workflowlauf wird behauptet. Einsteigerprüfung simuliert; echtes iPhone/Safari nicht getestet.
