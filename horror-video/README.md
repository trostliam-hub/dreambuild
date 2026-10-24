# Horror-Shorts

Vertikale Horror-Videos (1080×1920, 30 fps) im Stil deutscher Creepypasta-TikToks:
rot-schwarzer 2D-Look, Strichfiguren, Handy-Nachrichten, Wort-für-Wort-Untertitel, Cliffhanger mit Kommentar-Frage.
Alles wird lokal erzeugt: Bild per Canvas-Engine, Stimme per Open-Source-TTS, Soundeffekte synthetisch (keine Samples).

| Ordner | Inhalt |
|---|---|
| `de/` | **Sternschnuppe – Nacht 1** (Deutsch, 90 s): Video, Cover, Posting-Text, Drehbuch (`story.json`) |
| `en/` | **DON'T WAKE HER** (Englisch, 5 Parts, je 73–82 s, Part 5 = Finale): Babysitting-Horror, das Babyphone läuft zehn Minuten nach. Jeder Part beginnt mit einem 2–3 s Cold Open (spannendster Moment des Parts, harter Schnitt). Videos, Cover, Posting-Texte, Regie-Skripte (`dwh_part*.py` → `dwh_part*.json`), Autoren-Fassungen (`dwh_script_writers.json`, `dwh_parts4_5_writers.json`) |
| `truecrime/` | Zwei englische True-Crime-Serien mit je 5 Parts (63–78 s): **YOU ARE BTK** (`btk/`, Du-Perspektive: der Zuschauer ist der Täter, Ende mit den Namen der Opfer) und **NONE LEADING OUT** (`hk/`, Hinterkaifeck 1922, die ganze Geschichte von vorne bis hinten). `scripts/` = Regie-Skripte (`btk_part*.py`, `hk_part*.py` → `.json`, gemeinsame Basis `tc_common.py`, Aussprache-Hinweise), `research/` = Recherche-Dossiers und finale Skripte, `posting.txt` / `posts.json` = Captions, Hashtags, angepinnte Kommentare |
| `engine/` | `engine.html` + `engine.js` (Szenen, Kamera, Untertitel, HUD; Beat-Flag `noHud`), `render.cjs` (Headless-Chromium → ffmpeg), Schriften (SIL OFL / Apache), `SCENE_REFERENCE.md` (alle Szenen und Parameter); True-Crime-Szenen `scenes/tc_*.js` mit je einer `SCENE_REF_tc_*.md` (Akten, Zeitungen, Hof im Schnee, Dachboden, Gerichtssaal, Pinnwand, TV-Nachrichten, Diskette u. a.) |
| `tools/` | `build.py` (Stimme mit Take-Auswahl per Spracherkennung, Wort-Timing, Untertitel-Chunks, Cold Open, Mix, −14 LUFS), `sfx.py` + `sfx_finale.py` + `creak.py` + `sfx_truecrime.py` (Soundeffekte), `check_beats.py` / `check_sync.py` / `asr_check.py` (Verständlichkeit, Untertitel-Sync), `render_part.sh`, `render_queue.sh` / `render_dyn.sh` (streng nacheinander rendern, Länge prüfen, bis zu 3 Versuche), `scene_still.py` / `tl_sheet.py` / `chk.sh` (Kontrollbilder) |

## Neu bauen

Arbeitsverzeichnis anlegen:

```
work/
  models/   vits-piper-de_DE-thorsten_emotional-medium, kokoro-multi-lang-v1_0, sherpa-onnx-whisper-small
            (GitHub-Releases k2-fsa/sherpa-onnx: tts-models/… und asr-models/…)
  tools/    = tools/
  video/    = engine/ (+ sfx/ aus tools/sfx.py)
```

```
pip install numpy scipy soundfile pedalboard sherpa-onnx pillow
python3 tools/sfx.py && python3 tools/sfx_finale.py && python3 tools/creak.py video/sfx/door_creak.wav
python3 tools/build.py video/story.json build            # Stimme, Timing, Mix -> build/
node video/render.cjs build/timeline.json segment 0 2701 video.mp4
ffmpeg -i video.mp4 -i build/mix.wav -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out.mp4
```

Englische Parts: `python3 en/dwh_part1.py <work>` erzeugt `en/dwh_part1.json`, dann wie oben bauen; `tools/render_part.sh <builddir> <out.mp4>` rendert in 3 parallelen Segmenten (Dauer inkl. Cold Open aus `timeline.json`).

Stimmen: Thorsten-Voice (Piper/VITS, CC0) für Deutsch; Kokoro-82M (Apache-2.0) für Englisch – Erzähler Mischung `am_liam` 60 % + `am_onyx` 40 % (Tempo 1.08), du `af_nova`, Mrs. Hale `af_heart`, Mr. Hale Mischung `am_fenrir` + `am_eric`, die Gestalt `af_nicole` (verlangsamt, tiefer, mit Hall); „Shhh.“ wird als echtes Zischen synthetisiert (`hush=True`), weil Kokoro es buchstabiert. Stimmen per Natürlichkeits-Score ausgewählt: `tools/voice_bench.py` + `tools/voice_score.py` (UTMOS, Tonhöhe, Tempo), Einzelsätze testen mit `tools/line_test.py`. Englische Erzählung wird absatzweise am Stück gesprochen („fluent“-Modus), Wort-Timing über Sprechpausen.

True Crime: Stimme Supertonic 3 (sherpa-onnx, Modell `models/supertonic3`) – Erzähler Sprecher 8 (10 Schritte, Tempo 1.05), Zitate Sprecher 6 bzw. 0; klingt flüssiger als Kokoro (UTMOS 4.50 statt 4.38). Namen werden über `say=` lautschriftlich gesprochen (`scripts/PRONUNCIATION.md`). `cerIgnoreNumbers` lässt die Spracherkennungs-Prüfung Zahlwörter ignorieren. Bauen: `python3 truecrime/scripts/hk_part1.py <work>` → `hk_part1.json`, dann `tools/build.py` und `tools/render_queue.sh hk:1` (Pfade in den Shell-Skripten an das Arbeitsverzeichnis anpassen).
Beim Hochladen auf TikTok „KI-generierter Inhalt“ aktivieren.
