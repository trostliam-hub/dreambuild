# KI-Guide: vorbereitete Anbindung, noch nicht aktiviert

Stand 16.10.2026. Auftrag: echter KI-Guide für CrankScore und Kosten vor dem Launch erklären.
Basis: main `91fa192`. Die Unreal-Spielentwicklung ist davon getrennt.

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
