# Skripte zu WEB-RELEASE-001

Alle Skripte liefen lokal mit Node 22 und Playwright (Chromium), Python 3 mit `bpy` 5.0.1 und Pillow 12.

- Website lokal: `python3 -m http.server 8766` im Ordner von `crankscore-web` (Branch `claude/website-release`).
- App lokal: `python3 -m http.server 8780` im Ordner von `dreambuild` (`main`, Version 20261011-1532).
- Release-Zustand: eine Kopie der Website mit gesetzter `WERTE.appAdresse` (Platzhalter `https://app.beispiel.invalid/`) auf Port 8771.

| Datei | Zweck |
|---|---|
| `app-aufnahmen.js` | echte App-Aufnahmen aller Szenen, DE/EN, hell/dunkel (390 px, Desktop 1440 px) |
| `spindrift-aufbau.js` | stellt in der App einen konfliktfreien Enduro-Aufbau mit Propain-Spindrift-Rahmen zusammen, nur über `pruefe()` und den Katalog der App |
| `app-erkunden.js` | App-Zustand lesen (Text einer Ansicht), z. B. für das Bremsen-Beispiel |
| `app-offline.js` | Offline-Aussage der App: Service Worker, Neuladen ohne Netz |
| `web_render.py` | Blender-Renderings (Dreiviertel, Seite mit Bildpunkten, Heck) aus `3d/modell/spindrift-5-al.blend` |
| `seite-bauen.py`, `index-vorlage.html` | einmaliger Aufbau der neuen `index.html` (Bildbausteine, Logo, Punkte) |
| `sprachtest.js`, `reste.js` | Sprachwechsel, Speicherung, Bots, ohne JavaScript; Sprachreste in Text, alt, aria, Meta |
| `bedienung-release.js` | Menü, Tastatur, Fokus, Fragen, Teilen, Bilder je Design, reduzierte Bewegung, Anker, Release-Schalter |
| `neu-sicht.js`, `og.js` | Ganzseiten-Aufnahmen; Vorschaubild für geteilte Links |

Die Web-Fassungen der Bilder erzeugt `werkzeuge/bilder.py` im Repo `crankscore-web`.
