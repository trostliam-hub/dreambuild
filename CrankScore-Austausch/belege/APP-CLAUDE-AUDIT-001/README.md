# Belege zu APP-CLAUDE-AUDIT-001

Audit vom 23.10.2026, Basis29e7a8f021c50b8f221a257d2fadbbdead8f025f. Vollständiger Auftrag: [Claude-Fehleraudit](../../CLAUDE-FEHLERAUDIT-2026-10-23.md).

- `fahrwerk-befunde.json`: live reproduzierte CS-01/02/06 mit Vorher/Nachher-Daten und Klickfolgen. Der ursprüngliche JSON-Basiswertba9f176 ist der zu Prüfungsbeginn vorhandene Checkout; Appcode blieb bis29e7a8f unverändert (nurpreise.json kam hinzu).
- `daten-befunde.json`: CS-03/04 im lokalen identischen Appcode, alle vier Szenarien durch Root erneut reproduziert. `daten-repro.cjs` ist der originale Prüfhelfer; seine Pfade müssen nach dem Umlegen in diesen Belegordner angepasst werden.
- `ui-ergebnis.json`, `fokus-beweis.json`, `fokus-repro.cjs`: CS-05 und getrennt ausgewiesene Nichtbefunde/Produktideen.
- `root-audit.json`: frischer öffentlicher HTML/SW/Preisabgleich, Konfigurationsflags und lokaler Guide-Text in der Live-App. `preisverlauf.json` ist optional.
- PNGs: ausgewählte Bildschirmzustände. Die numerischen Rücksetz-/Speicherergebnisse werden durch JSON dokumentiert; ein Screenshot allein beweist keine Speicherintegrität.

Die Helfer sind Auditmaterial, keine bereits integrierten Regressionstests. Sie verwenden vorhandenes Playwright/Chrome, isolierte Browserkontexte und ausschließlich synthetische Rad-/Profil-/Fotodaten. Die lokale Pro-Testvariable ist keine echte Lizenz; keine Kauf- oder Aktivierungsanfrage wurde gesendet. Absolute Artefaktpfade in Rohdaten sind damalige Aufnahmeorte, die entsprechenden Dateien liegen nun auch hier.

Keine echten Nutzerprofile geöffnet oder verändert. Keine Appkorrektur oder neue App-Veröffentlichung in diesem Audit. Echte Safari-/iPhone-Prüfung und reale fachfremde Testpersonen stehen aus. Schwarze Bildbereiche vor Ladeabschluss wurden nicht als neue Bildfehler gezählt.
