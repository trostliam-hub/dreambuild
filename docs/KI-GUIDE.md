# KI-Guide in CrankScore

Stand 17.10.2026. Basis main `91fa192`. Auftrag: kurze, einfache Erklärungen zu Aufbau, Teilen, Fahrwerk und App, mit passenden vorhandenen Links. Veröffentlichung und maximal 5 Euro pro Monat insgesamt für KI und Server sind von Liam freigegeben. Die Unreal-Spielentwicklung ist davon getrennt; dort wurde nichts verändert.

## Bedienung und Antworten

Im vorhandenen Guide „KI verwenden · online“ einschalten und eine Frage stellen. Der Schalter ist anfangs aus. Der lokale Guide bleibt ohne KI verfügbar. Antworten sind als KI gekennzeichnet, meist 3–5 kurze Sätze, höchstens 110 Wörter laut Anweisung. Es werden keine Teile oder Einstellungen automatisch verändert. Für Rückfragen werden höchstens die letzten zwei erfolgreich beantworteten KI-Fragen und gekürzten KI-Antworten dieser Sitzung mitgesendet (maximal vier Nachrichten, je höchstens500Zeichen). Ausschalten der KI oder Wechsel des Rads leert diesen Kontext. Der allgemeine lokale Chatverlauf wird nicht als Quelle übernommen.

Die App übermittelt die Frage, höchstens 24 ausgewählte Teilenamen, Einsatz, Score, fehlende Teile, höchstens vier Konflikthinweise, passende kurze App-Wissenstexte und bis zu acht Linktitel mit Beschreibungen. Keine automatische Übertragung von Körperdaten, Fotos oder Lizenzdaten. Nur der oben beschriebene begrenzte KI-Kontext wird zusätzlich übermittelt. Persönliche Angaben in der Frage selbst werden selbstverständlich mitgesendet; der Datenhinweis weist darauf hin. Datenschutzerklärung auf Deutsch und Englisch ergänzt.

Echte Produkt-, Hersteller- und App-Verweise stammen aus dem vorhandenen Katalog und den vorhandenen Quellen. Die KI wählt höchstens drei IDs; die App löst diese in die ursprünglichen Links oder Bedienknöpfe auf. URLs werden weder ans Modell gesendet noch aus Modelltext zu Links gemacht. Unbekannte IDs werden verworfen, Text wird HTML-maskiert. Produktverweise tragen einen Anzeigenhinweis. Ohne geeignete Produktseite kann der Guide auf den passenden Katalog verweisen. Links werden durch die KI nicht gelesen; es gibt keine Websuche. Herstellervorgaben, aktuelle Preise und genaue Modell-/Baujahr-Einstellerpositionen darf sie nicht erfinden.

## Betrieb und Kostenbegrenzung

Produktiver Server: `https://crankscore-guide.trostliam.workers.dev/guide`. Die öffentliche Adresse steht in `KI_GUIDE_URL` in index.html. Der Schlüssel steht ausschließlich als verschlüsseltes `OPENAI_API_KEY`-Secret bei Cloudflare. Der von Liam erstellte Schlüssel wurde aus dem noch offenen OpenAI-Schlüsseldialog direkt im Browser an das Secret-Feld übertragen, ohne Ausgabe in Chat, Dateien, Screenshots oder Protokolle. Anschließend wurde der Schlüsseldialog geschlossen. Der Schlüssel wurde mit 30 Tagen Gültigkeit erstellt und muss vor Ablauf erneuert und als Secret ersetzt werden; sonst fällt die KI aus, der lokale Guide bleibt.

Cloudflare Workers Free / $0 / Current plan am 17.10.2026 im Konto geprüft. Keine kostenpflichtige Buchung. OpenAI-Guthaben zuvor 5 USD; automatisches Nachladen ausgeschaltet und geprüft. Es wurde kein weiteres Guthaben gekauft. Weitere Aufladungen, kostenpflichtige Tarife oder eine Erhöhung des Budgets brauchen einen neuen Auftrag.

Der Worker unter `guide-api/cloudflare/` begrenzt die API serverseitig:

- `GUIDE_MONTHLY_REQUESTS=1000`, Code-Obergrenze 1.000 Versuche pro UTC-Monat.
- Zusätzlich 100 pro UTC-Tag und ein Versuch alle 35 Sekunden **für alle gemeinsam**.
- Ein SQLite Durable Object `GuideQuota`, fester Name `global-budget-v1`. Namespace, Name und Zähler bei Updates unbedingt erhalten; nicht zurücksetzen.
- Jeder Versuch wird vor dem API-Aufruf atomar und dauerhaft reserviert. Auch Fehler und unvollständige Antworten zählen. Kein automatischer Retry.
- Höchstens 10.000 UTF-8-Bytes pro Anfrage, 200 Zeichen Frage, 24 Teilenamen à 100 Zeichen, 2.000 Zeichen App-Kontext, acht kurze Quellenbeschreibungen und optional vier Gesprächsnachrichten à höchstens500Zeichen. Die Gesamtgrenze von10.000UTF-8-Bytes bleibt.
- Festes Modell `gpt-6-luna`, `reasoning.effort=none`, höchstens 800 Ausgabetokens, strukturiertes JSON mit Antwort und Link-IDs. Keine kostenpflichtigen Zusatztools.
- Ohne Schlüssel oder mit Kontingent 0/ungültig bleibt die API gesperrt. Ungültiger gespeicherter Kontingentzustand sperrt ebenfalls. `GET /` zeigt nur die Konfigurationsbereitschaft und ist kein echter OpenAI-Verbindungstest.
- CORS lässt nur `https://trostliam-hub.github.io` im Browser zu, ersetzt aber keine Anmeldung. Direkte Clients können das gemeinsame Kontingent verbrauchen, die serverseitige Grenze dadurch jedoch nicht erhöhen.

Offizieller Standardpreis am 16.10.2026: 0,10 USD pro Million Eingabetokens und 0,50 USD pro Million Ausgabetokens für gpt-6-luna bei kurzem Kontext. Beispielsweise 1.000 Fragen à 2.000 Eingabe- und 500 Ausgabetokens kosten ungefähr 0,45 USD reine API-Nutzung. Die aktuelle Eingabe enthält zusätzlich Aufbau und Quellenbeschreibungen; die tatsächlichen Tokens variieren. Die gesetzten Grenzen lassen bei diesen Preisen deutlichen Abstand zu 5 Euro. Sie sind **keine garantierte Euro-Kostensperre**: Preisänderungen, Steuern, Wechselkurs oder Nutzung anderer Schlüssel sind nicht dadurch begrenzt. Pro schaltet die KI-Grenzen nicht aus.

## Daten und Wartung

Eigene dauerhafte Speicherung: nur Monats-/Tageszähler und Drosselzeit, keine Fragen, Antworten, IP-Adressen oder Profile. Worker-Logs und Traces sind deaktiviert. Cloudflare verarbeitet technisch notwendige Verbindungsdaten. `store:false` deaktiviert abrufbaren Antwortzustand bei OpenAI, verspricht aber keine vollständige Löschung: Anbieterprotokolle zur Missbrauchserkennung können nach dessen Datenrichtlinie grundsätzlich bis zu 30 Tage erhalten bleiben, mit Ausnahmen.

Installation und Betrieb im Unterordner: `npm ci`, `npm test`, `npm run check` (Upload-Trockenlauf), `npm run deploy`. Versionen und Lockfile sind festgeschrieben. OAuth-Konfiguration und lokale Testhilfen liegen außerhalb des Repositorys. Worker-Secret bei Updates erhalten. Zum Abschalten `GUIDE_MONTHLY_REQUESTS=0` setzen und Worker erneut bereitstellen; die App bietet weiter den lokalen Guide.

`guide-api/guide.mjs` ist nur der ältere Node-Entwurf und wird nicht produktiv betrieben. Nicht parallel starten: Der Node-Entwurf und Cloudflare teilen ihre Kontingente nicht. Produktionsbetrieb ausschließlich über den Worker.

## Nachweise

- Worker: 8/8 Tests in echter lokaler workerd/SQLite-Laufzeit mit simulierter API, einschließlich 12 paralleler Anfragen, Neustart, Tages-/Monatswechsel, beschädigtem Zustand, Eingabegrenzen, Fehlerzählung und unzulässigen Link-IDs.
- Zwei echte API-Tests am 17.10.2026 erfolgreich: HSC/LSC richtig anhand der Einfedergeschwindigkeit erklärt; Aufbaufrage mit ausgewähltem Spindrift-Rahmen, fehlenden Teilen und passenden Link-IDs kurz beantwortet. Diese Tests beweisen die Anbindung und Stichprobenqualität, keine allgemeine Fehlerfreiheit der KI.
- Produktive Worker-Version: `83a0fdfb-4a15-4644-acd7-a94b4bca50e8`.
- UI-Tests decken freiwillige Aktivierung, DE/EN auf 390/320 px, HTML-Maskierung, Quellenfilter, Katalog-/Produktlinks, Datenauswahl, Navigation ohne Aufbauänderung, Drossel-/Kontingentmeldung und Rückkehr zum lokalen Guide ab.
- `npm test` umfasst jetzt auch den Guide-UI-Test. Der Veröffentlichungsworkflow prüft zusätzlich den Worker mit simulierter API, ohne Schlüssel oder API-Ausgaben.
- Den abschließenden Prüfcommit, Workflow und Live-Versionsstempel dokumentiert `CrankScore-Austausch/CODEX-ANTWORTEN.md` nach der Veröffentlichung.

## Quellen

- https://developers.openai.com/api/docs/models/gpt-6-luna
- https://developers.openai.com/api/docs/pricing
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/your-data
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/durable-objects/get-started/
- https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/

## Veröffentlichung

Online-Version **20261017-0049**, automatisch gestempelt als `23d77552a1359f61ca70c9ac08db2efea3bb9ed5`; geprüfter App-Code `c9be24e`. Workflow erfolgreich: https://github.com/trostliam-hub/dreambuild/actions/runs/38977561890 . Öffentliche HTML-Datei identisch mit dem gestempelten Checkout, PWA-Cache passend. Alle App-Prüfgruppen und 8/8 Workerprüfungen bestanden. Sechs echte API-Aufrufe einschließlich Browser-Nachtest der Setup-Link-Erkennung durchgeführt. Ein ausdrücklich erfragter Hersteller hat bei der Quellenwahl Vorrang vor anderen verbauten Marken. Ausführlicher Abschluss und Testgrenzen in CODEX-ANTWORTEN.md.


## Sichere Schadenshilfe und Unsicherheit — 24.10.2026

Nutzerauftrag: Auch seltene und ungewöhnliche Probleme kurz und verständlich erklären, Vermutungen ausdrücklich als solche benennen und schädliche Reparaturversuche vermeiden. Basis dieser Erweiterung: main c956962d7bc554fcc6a16c72c633d08e349bff9a, Branch codex/guide-werkstatthilfe. Die inzwischen von Claude reparierten Auditfälle CS-01 bis CS-07 bleiben erhalten.

- Der Modellauftrag trennt beobachtete Symptome von möglichen Ursachen, verbietet erfundene Servicewerte und fragt gezielt nach Modell, Ort oder Ereignis. Beispiel: Knacken beim Treten ist kein sicherer Beweis für eine lockere Verbindung. Ein App-Score ist keine Zustandsprüfung.
- Die gemeinsame Datei guide-safety.js liefert feste, kurze Soforthilfe vor der lokalen Stichwortsuche und vor einer KI-Anfrage. Fälle: herausgefallene/beschädigte oder vorgerückte Bremskolben, unbekanntes loses Bremsenteil, Ölverlust, fehlende Bremswirkung, verunreinigte Beläge, falsche Flüssigkeit, mögliche Risse, lockere Lenkung/Achsen, Druckkammern und beschädigte Akkus.
- Diese begrenzte Erkennung ist keine allgemeine Diagnose- oder Sicherheitsgarantie. Anders formulierte, mehrdeutige oder bisher unbekannte Fälle können nur vom Modell anhand der Regeln eingeordnet werden. Der Guide kann Fehler machen; eine Fachprüfung kann er nicht ersetzen.
- Ein herausgefallener Kolben wird ausdrücklich von einem nur vorgerückten Kolben unterschieden. Kein universelles Zurückdrücken, Wiedereinsetzen, Pumpen oder Nachfüllen als Schnellreparatur. Reparaturumfang ist modell- und schadensabhängig; nicht pauschal „neue Bremse“ behaupten.
- Kurze Modellantworten und Reparatur-/Weiterfahrfragen behalten den aktuellen lokalen Schadensfall. „Anderes Thema“ beendet ihn. Der Fall ist flüchtig, an das ausgewählte Rad gebunden und wird nicht dauerhaft gespeichert. Er verändert keine Teile oder Einstellwerte.
- Feste Soforthilfe bleibt ohne Rad, offline, ohne Pro, bei Tagesgrenze und ohne verfügbares KI-Kontingent erreichbar. Sie ruft keinen Provider auf und reserviert keine kostenpflichtigen KI-Versuche. Im Worker gilt dieselbe Regel auch für direkte API-Anfragen; gewöhnliche KI-Anfragen unterliegen unverändert allen Grenzen.
- Der KI-Gesprächskontext enthält nur die letzten zwei erfolgreich beantworteten KI-Fragen und gekürzten Antworten. Keine Übernahme des gesamten gVerlauf. Ausschalten und Radwechsel leeren ihn; ein beim Ausschalten noch laufender Aufruf kann ihn nicht wieder auffüllen. UI-Einwilligungshinweis und Datenschutz DE/EN wurden entsprechend geändert. Keine zusätzliche dauerhafte Speicherung im Worker.
- Bestehender Fehler berichtigt: DB8/DB6/DB4 werden nicht aufgrund der Marke SRAM fälschlich als DOT erklärt. Maßgeblich sind konkrete Katalogdaten und Modellfamilie. SRAM ohne Modell bleibt bei unbekannter Flüssigkeit. Shimano-Öltyp wird auf das genaue Modellhandbuch verwiesen. Eine universelle Entlüftungsanleitung und ein geratener Sattelschraubenwert wurden aus der lokalen Bremsenhilfe entfernt.
- guide-safety.js wird mit der App vorgeladen und offline gecacht. Sowohl normale Veröffentlichung als auch Preis-Archiv nehmen die Datei mit; alte Veröffentlichungstags ohne diese Datei bleiben im Preisworkflow gültig.
- Modell, 800-Ausgabetoken-Grenze, kein-Websuche-Regel, API-Schlüssel, Monats-/Tagesgrenzen, Drossel und Durable-Object-Name werden nicht geändert. Das bestehende Monatsbudget wird nicht erhöht. Gesprächskontext und ausführlichere feste Anweisungen erhöhen die Eingabetokens pro gewöhnlicher Anfrage etwas; keine garantierte Euro-Kostensperre behaupten.
- Tests: 24 feste Sprach-/Routingfälle, Guide-UI von16auf28Fälle (DE/EN390/320px), Worker von8auf10Fälle mit simulierter API. Zusätzlich separater Einsteiger-Quellreview mit Gegenproben natürlicher Modellantworten/Themenwechsel. Abschließende Gesamtprüfung und tatsächliche Veröffentlichung werden separat im Austauschordner dokumentiert; Stubtests beweisen keine allgemeine Modellqualität.

Offizielle Quellen für die bewusst konservative Soforthilfe:

- [Shimano Nutzerhinweise](https://si.shimano.com/en/dm/MADBR10/NOTICE_FOR_USE)
- [Shimano Modell-/Ölvorgaben](https://si.shimano.com/en/dm/LADBR02/TO_ENSURE_SAFETY)
- [SRAM Sicherheit für hydraulische Bremsen](https://www.sram.com/globalassets/document-hierarchy/safety-instructions/safety-instructions-for-disc-and-hydro-brakes.pdf)
- [SRAM Bremsen-Fehlersuche](https://www.sram.com/en/learn/disc-brake-troubleshooting)
- [MAGURA Servicehinweise](https://magura.com/service/service-instructions/)
- [OpenAI Promptgestaltung und Grenzen](https://developers.openai.com/api/docs/guides/prompt-engineering)
- [OpenAI Sicherheitsmaßnahmen](https://developers.openai.com/api/docs/guides/safety-best-practices)
