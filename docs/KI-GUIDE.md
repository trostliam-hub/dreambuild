# KI-Guide: vorbereitete Anbindung, noch nicht aktiviert

Stand 17.10.2026. Auftrag: echter KI-Guide für CrankScore und Kosten vor dem Launch erklären.
Basis: main `91fa192`. Die Unreal-Spielentwicklung ist davon getrennt.

## Einrichtung mit Liam

- Freigegeben: maximal 5 Euro pro Monat insgesamt für KI und Server.
- OpenAI-Konto eingerichtet. Im Dashboard 5 USD Guthaben gesehen und
  automatisches Nachladen auf OFF gestellt und danach geprüft. Das ist noch
  keine garantierte monatliche Euro-Kostensperre.
- Liam hat den vorbereiteten Schlüssel selbst erstellt und gespeichert.
  Name: CrankScore Guide; Responses Write, eingeschränkt, 30 Tage Gültigkeit.
  Schlüsselwert wurde weder ausgelesen noch im Repository gespeichert.
- Hostingwahl: Cloudflare Workers Free mit SQLite Durable Object für ein
  dauerhaftes gemeinsames Kontingent. Offizielle Free-Verfügbarkeit und Preise
  am 16.10.2026 geprüft. Anmeldung im Cloudflare-Dashboard für Liam geöffnet.
- Cloudflare-Anmeldung erfolgreich; „Free / $0 / Current plan“ am 17.10.2026
  im Konto selbst geprüft. Worker-Anpassung in `guide-api/cloudflare/` vorbereitet
  und lokal getestet. Noch keine Cloudflare-Ressource angelegt.
- Als Nächstes: Uploadzugriff freigeben, Worker samt Kontingent bereitstellen,
  Schlüssel von Liam direkt als Server-Secret eintragen lassen, echten API-Test
  durchführen, Datenhinweise ergänzen und dann App-Anbindung veröffentlichen.
- Keine kostenpflichtige Cloudflare-Buchung und keine erneute Aufladung
  automatisch vornehmen. Bei Secret-Einrichtung neuen Wert nicht im Chat,
  Browser-Snapshot, Screenshot, Protokoll oder Quelltext ausgeben.

Hostingquelle: https://developers.cloudflare.com/workers/platform/pricing/

## Cloudflare-Version (für den geplanten Betrieb)

`guide-api/cloudflare/worker.mjs` ist die eigenständige Worker-Version. Installation
und Befehle im Unterordner: `npm ci`, `npm test`, `npm run check` (Trockenlauf),
`npm run deploy`. Paketversionen und Lockfile sind festgeschrieben. Keine Änderung
an den npm-Abhängigkeiten der eigentlichen PWA.

- Workers Free, ein SQLite Durable Object `GuideQuota`, fester gemeinsamer Name
  `global-budget-v1`. Namen, Namespace und gespeicherte Zähler bei Updates erhalten.
- `GUIDE_MONTHLY_REQUESTS` startet bei **0**. Maximal 1.000 Versuche/UTC-Monat im
  Code erlaubt, außerdem 100/UTC-Tag und ein Versuch alle 35 Sekunden gemeinsam.
  Vorgesehen ist zunächst 1.000/Monat nach erfolgreichem Verbindungstest.
- Die Reservierung wird vor dem OpenAI-Aufruf atomar auf dauerhaftem Speicher
  bestätigt. Fehlgeschlagene und unvollständige Aufrufe zählen mit. Kein Retry.
- Anfragen maximal 5.000 UTF-8-Bytes, 200 Zeichen Frage, 24 Teilenamen à 100 Zeichen.
  Festes Modell gpt-6-luna, maximal 800 Ausgabetokens, keine Tools. Diese Grenzen
  schaffen bei den dokumentierten Preisen deutlichen Abstand zum 5-Euro-Budget,
  sind aber keine vom Anbieter garantierte Euro-Kostensperre.
- Nur Monats-/Tageszähler und Drosselzeit werden in unserer Datenbank gespeichert.
  Keine IP-Adressen, Fragen, Antworten oder Profile dort; Worker-Logs deaktiviert.
  Cloudflare verarbeitet dennoch technisch notwendige Verbindungsdaten.
- `OPENAI_API_KEY` ausschließlich als Cloudflare Secret. CORS bleibt ausdrücklich
  keine Anmeldung: Ein direkter Client kann das gemeinsame Kontingent ausschöpfen,
  aber die serverseitige Obergrenze damit nicht erhöhen.
- Ohne Secret oder mit Kontingent 0/ungültig antwortet die KI-Route mit 503.
  `GET /` zeigt nur Dienstname und Konfigurationsbereitschaft, prüft nicht OpenAI.
- Drosselantworten tragen `Retry-After`. Vor Frontend-Aktivierung dort eine passende
  Warte-Meldung ergänzen und den Datenschutzhinweis um Cloudflare/OpenAI erweitern.

Prüfungen: 7/7 Tests in echter lokaler workerd/SQLite-Laufzeit mit vollständig
simulierter OpenAI-API, einschließlich 12 paralleler Anfragen, Neustart,
Tages-/Monatswechsel, ungültigem Zustand, Eingabegrenzen und Providerfehlern.
Wrangler-Trockenlauf erfolgreich. Keine echten OpenAI-Aufrufe bisher.

Cloudflare-Referenzen:
- https://developers.cloudflare.com/durable-objects/get-started/
- https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/

## Bisheriger Node-Entwurf und App-Anbindung

Der bisherige Guide bleibt lokal. `KI_GUIDE_URL` in index.html ist absichtlich leer.
Nach Konfiguration erscheint im Guide eine freiwillige KI-Auswahl mit Datenhinweis.
Jede Frage sendet nur ihren Text und maximal 24 ausgewählte Teilenamen, keine
Körperdaten, Lizenzdaten oder früheren Nachrichten. Die Antworten sind als KI
gekennzeichnet und HTML wird maskiert. Keine automatische Änderung am Rad.
Der KI-Modus beantwortet einzelne Fragen; er kennt den vorherigen Chat nicht.

`guide-api/guide.mjs` ist ein separat zu betreibender Node-Serverentwurf, kein
GitHub-Pages-Backend. Er nutzt ausschließlich OpenAI Responses, gpt-6-luna,
maximal 800 Ausgabetokens, keine kostenpflichtigen Zusatzwerkzeuge, kein Retry.
API-Schlüssel nur als Server-Geheimnis `OPENAI_API_KEY`; niemals im HTML, Chat,
Repository oder Frontend-Konfigurationsfeld hinterlegen.

## Vor Aktivierung erforderlich

- API-Konto, freigegebenes Kostenlimit und geeigneter Server mit HTTPS.
- Auf dem Server: `GUIDE_ORIGIN=https://trostliam-hub.github.io`,
  `GUIDE_MONTHLY_REQUESTS` als explizites Monatskontingent, `GUIDE_QUOTA_FILE`
  außerhalb des veröffentlichten Verzeichnisses auf dauerhaftem Datenträger.
  Standardkontingent ist 0. Start mit Node >=20: `node guide-api/guide.mjs`.
- Genau ein Prozess; exklusive Sperrdatei verhindert versehentlichen Doppelstart.
  Bei einem Absturz die Sperre erst entfernen, nachdem der alte Prozess nachweislich
  beendet wurde. Kontingentdatei erhalten und sichern; beschädigte Datei sperrt
  die API. Ein instanzübergreifender bzw. kurzlebiger Serverless-Datenträger ist
  für diese Implementierung ungeeignet.
- HTTPS-Reverse-Proxy mit begrenzter Requestgröße davor. Der Server bindet lokal.
  Hinter einem Proxy teilen sich derzeit alle Nutzer dessen Verbindungslimit
  (eine Anfrage pro Minute). Vor größerem Launch ist eine vertrauenswürdig
  konfigurierte Client-IP-/Anmeldelösung nötig. CORS ist keine Authentifizierung;
  direkte Clients können es nachahmen und das gemeinsame Kontingent verbrauchen.
- Datenhinweis/Datenschutzerklärung um tatsächlichen Betreiber, Anbieter,
  Verarbeitung und Speicherfristen ergänzen. `store:false` schaltet abrufbaren
  Antwortzustand ab; es verspricht keine vollständige Löschung beim Anbieter.
- Reale Modellverfügbarkeit, Antwortqualität, Timeout und Hosting mit eigenem
  Konto prüfen. Bisher ausschließlich simulierte Antworten, keine API-Ausgaben.
  Erst dann `KI_GUIDE_URL` auf die öffentliche HTTPS-Adresse mit `/guide` setzen.

## Kostenbeispiel

Offizielle Standardpreise am 16.10.2026, kurzer Kontext, gpt-6-luna:
0,10 US-Dollar je Million Eingabetokens und 0,50 US-Dollar je Million
Ausgabetokens. 1.000 Fragen mit **je 2.000 abgerechneten Eingabetokens und 500
abgerechneten Ausgabetokens** ergeben ungefähr **0,45 US-Dollar reine API-Kosten**;
10.000 entsprechende Fragen ungefähr 4,50 US-Dollar.
Längere Eingaben/Antworten und zusätzliche Denk-Tokens können mehr kosten.
Hosting, Steuern, Währungsumrechnung und andere Dienste kommen gegebenenfalls dazu.
Die tatsächliche Nutzung wird dem API-Kontoinhaber berechnet.

Die serverseitige Grenze zählt API-Versuche, einschließlich fehlgeschlagener
Aufrufe, vor dem Senden dauerhaft. Sie ist **kein garantiertes Euro-Budget**.
Preisänderungen und Hosting müssen bei der Budgetplanung berücksichtigt werden.
Das vorhandene lokale Pro-Versprechen „ohne Limit“ gilt nicht für die KI.
Bis zur Aktivierung entstehen durch diesen Code keine KI-API-Kosten.

Quellen:
- https://developers.openai.com/api/docs/pricing
- https://developers.openai.com/api/docs/guides/text
- https://developers.openai.com/api/docs/guides/production-best-practices

Prüfen: `npm run test:guide`, `npm run test:guide-ui`, anschließend `npm test`.
Eine echte KI-Verbindung und Veröffentlichung sind separat nachzuweisen.
