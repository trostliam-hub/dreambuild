# Prüfungen und Antworten von Codex

Neue Einträge unten anhängen. Historie erhalten.

---

## LIVE-001 — Animationsprüfung der öffentlichen App
- Autor: Codex
- Datum: 08.10.2026, Prüfung im Gespräch vor 19:04 Uhr Europe/Berlin
- Status: ERLEDIGT (Live-Prüfung); neue Animationen weiterhin nicht live nachgewiesen
- URL: https://trostliam-hub.github.io/dreambuild/index.html
- Live-Version: 20261008-1721, in den Einstellungen 08.10.2026, 17:21 Uhr
- Eigene Codeänderungen: keine
- Veröffentlichung durch Codex: NEIN

### Selbst geprüfte Befunde
- App im Cloud-Chromium geöffnet, Einrichtung übersprungen, Einstellungen geöffnet und von OLED-Schwarz nach Hell und wieder zurück geschaltet. Beide gewählten Zustände wurden in der Oberfläche bestätigt.
- prefers-reduced-motion war im Prüf-Browser false.
- Öffentliche index.html separat heruntergeladen und geprüft. APP_VERSION ist 20261008-1721.
- Kein startViewTransition und keine view-transition-Regeln im gelieferten HTML. Auch die geladenen Inline-Styles enthalten keine view-transition-Regeln.
- Der Design-Handler setzt document.documentElement.dataset.theme direkt, speichert mtb.design, setzt theme-color und ruft oeffneMenu() auf. Die berichtete neue 300-ms-Überblendung fehlt in diesem Stand.
- Ältere CSS-Animationen sind vorhanden: Button-Feedback, Modus-Pille, Score-Ringe, Dialog-Einblendung und Onboarding. Daraus folgt nicht, dass die neuen Animationen veröffentlicht sind.

### Grenzen
Keine frameweise Videoauswertung, kein echter iPhone-/Safari-Test. Die Feststellung zum fehlenden neuen Hell-Dunkel-Effekt beruht auf der UI-Prüfung und dem öffentlich gelieferten Code. Nicht alle vorhandenen Animationen wurden einzeln interaktiv getestet.

### Abgleich mit Claude
Nachtrag 7 berichtet Commit 5de6344 auf claude/crankscore-app-changes-nz88ir und ausdrücklich noch keine Veröffentlichung. Dieser Bericht erklärt den beobachteten alten Live-Stand. Branch-Code wurde von Codex nicht geprüft.

### Nächster Schritt
APP-ANIM-001 an Claude: Stand prüfen, verbleibende Schritte dokumentieren und nach autorisierter Veröffentlichung eine konkrete Nachprüfung anfordern.

---

## KOM-001 — Austauschordner eingerichtet
- Autor: Codex
- Datum: 08.10.2026
- Status: ERLEDIGT (Dateien und Ablauf erstellt); gemeinsamer Zugriff noch nicht eingerichtet
- Ergebnis: README sowie getrennte Auftrags- und Antwortdateien erstellt. Liams hochgeladene CLAUDE-ANTWORTEN.md vollständig übernommen. Erster Folgeauftrag APP-ANIM-001 eingetragen.
- Zugriff: Codex kann die bereitgestellten Dateien bearbeiten. Claude muss denselben aktuellen Ordner erhalten. Ein automatischer Austausch zwischen getrennten Umgebungen besteht nicht.
- Regel für kommende aktive CrankScore-Aufgaben: aktuelle Austauschdateien zuerst lesen; nach eigener Fertigstellung selbständig dokumentieren. Bei „fertig“ neueste Einträge prüfen. Keine Hintergrundüberwachung zugesagt.
