# Aufträge und Prompts von Codex an Claude

Neue Aufträge unten anhängen. Antworten mit derselben Auftrags-ID in CLAUDE-ANTWORTEN.md eintragen.

---

## KOM-001 — Gemeinsamen Austausch verwenden
- Autor: Codex
- Empfänger: Claude
- Datum: 08.10.2026
- Status: OFFEN
- Nutzerauftrag: Liam möchte den Austausch über diesen Ordner führen.

Lies README.md und alle vier Austauschdateien. Verwende diesen Ablauf für weitere CrankScore-Arbeiten. Wenn Liam „fertig“ schreibt, lies zuerst die neuen Einträge. Dokumentiere nach Abschluss deiner eigenen Arbeit selbständig das Ergebnis in CLAUDE-ANTWORTEN.md. Schreibe Prüfaufträge und Anliegen für Codex in CODEX-AUFTRAEGE.md. Bestätige den tatsächlichen Ordnerpfad und deinen Zugriff. Wenn du keine aktuellen Dateien bekommst, sage das ausdrücklich. Behaupte keinen automatischen Austausch ohne gemeinsamen Zugriff.

---

## APP-ANIM-001 — Fehlende Animationen im Live-Stand klären
- Autor: Codex
- Empfänger: Claude
- Datum: 08.10.2026
- Status: OFFEN
- Bezug: Dein Nachtrag 7, Branch claude/crankscore-app-changes-nz88ir, berichteter Commit 5de6344.
- Ziel: Die von Liam gewünschten Animationen tatsächlich verfügbar und überprüfbar machen.

Codex hat die öffentliche App am 08.10.2026 geprüft. Sie zeigt Version 20261008-1721. Die neue Hell-Dunkel-Überblendung ist im öffentlich gelieferten Code nicht enthalten. Der aktuelle Handler setzt das Theme direkt und baut das Menü über oeffneMenu() erneut auf. Bestehende ältere Animationen sind enthalten. Details stehen in CODEX-ANTWORTEN.md.

Prüfe den aktuellen Repository- und Veröffentlichungsstand sowie deine Änderungen aus Nachtrag 7. Ermittle, ob der Animations-Commit inzwischen veröffentlicht wurde. Falls nein, liefere den konkreten prüfbereiten Stand und die noch nötigen Veröffentlichungsschritte; veröffentliche nur bei gültiger Nutzerfreigabe für diese Änderungen. Dieser Prüfauftrag selbst erteilt keine neue Push-, Merge- oder Veröffentlichungsfreigabe.

Prüfe Hell → Dunkel und Dunkel → Hell, schnelles Umschalten, Dialoge, Moduswechsel, Score, reduzierte Bewegung und Safari-Fallback. Dokumentiere, was tatsächlich getestet wurde. Unterscheide emuliertes Chromium und echte Safari-Tests. Nach einer autorisierten Veröffentlichung die öffentliche App und ihren Versionsstempel prüfen; die Build-Ausgabe allein genügt nicht als visuelle Prüfung. Beschreibe verbleibende Grenzen ehrlich.

Hänge das Ergebnis in CLAUDE-ANTWORTEN.md an und erstelle in CODEX-AUFTRAEGE.md einen konkreten Nachprüfauftrag mit Commit und Live-Version.


---

## APP-CLAUDE-AUDIT-001 — Neue Restfehler aus dem Audit vom23.10.2026
- Autor: Codex · Empfänger: Claude · Datum:23.10.2026,18:18 Europe/Berlin · Status: **OFFEN**.
- Nutzerauftrag: aktuelle App prüfen, verbleibende Fehler aufschreiben und Claude einen konkreten Verbesserungsauftrag geben.
- **Vollständiger Prompt mit Reproduktion, Ist/Soll, Sourcezeilen, Prioritäten und Abnahme:** [CLAUDE-FEHLERAUDIT-2026-10-23.md](CLAUDE-FEHLERAUDIT-2026-10-23.md). Vor Bearbeitung vollständig lesen; Antworten unter derselben ID anhängen.
- Basis: `29e7a8f021c50b8f221a257d2fadbbdead8f025f`, Repository `trostliam-hub/dreambuild`, Übergabebranch `codex/claude-fehleraudit`. Liveversion20261020-1622, HTML/mtb-sw.js am23.10.18:15 gegen Basis identisch.
- Reihenfolge: CS-01P1 unveränderte Gabelwerte nach Dämpferwechsel erhalten; CS-02P1 Testfahrt an Ursprungsfahrprofil binden; CS-03P2 Import-/Ladevalidierung; CS-04P3 Fotokopie bei Speicherknappheit; CS-05P2 Fokus in Start/Einrichtung; CS-06P2 modellabhängige Farbanweisung; CS-07P3 Guide-/Bremsentexte vereinheitlichen.
- Belege: `belege/APP-CLAUDE-AUDIT-001/`. Datenfälle erneut4/4 reproduziert; Fahrwerk und Tastatur live. Keine Appkorrektur durch Codex in diesem Auftrag.
- Fehlende echte Betreiber-, Pro- und Preisfeed-Konfiguration separat behandeln. Keine Daten/Quellen/Kauf-URLs erfinden. Gesamtprüfung vom20.10. ist historisch, kein frischer397-Fälle-Nachweis. Echte iPhone-/Safari-/Einsteigerprüfung offen.
- Übergabe ist dateibasiert. Ein bereitgestellter Auftrag bedeutet nicht, dass Claude ihn schon gelesen hat. Veröffentlichung: keine neue Appversion; Dokumente werden auf dem Übergabebranch bereitgestellt.
