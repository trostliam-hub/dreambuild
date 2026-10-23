# Horror-Shorts

Vertikale Horror-Videos (1080×1920, 30 fps) im Stil deutscher Creepypasta-TikToks:
rot-schwarzer 2D-Look, Strichfiguren, Handy-Nachrichten, Wort-für-Wort-Untertitel, Cliffhanger mit Kommentar-Frage.
Alles wird lokal erzeugt: Bild per Canvas-Engine, Stimme per Open-Source-TTS, Soundeffekte synthetisch (keine Samples).

| Ordner | Inhalt |
|---|---|
| `de/` | **Sternschnuppe – Nacht 1** (Deutsch, 90 s): Video, Cover, Posting-Text, Drehbuch (`story.json`) |
| `engine/` | `engine.html` + `engine.js` (Szenen, Kamera, Untertitel, HUD), `render.cjs` (Headless-Chromium → ffmpeg), Schriften (SIL OFL / Apache), `SCENE_REFERENCE.md` (alle Szenen und Parameter) |
| `tools/` | `build.py` (Stimme mit Take-Auswahl per Spracherkennung, Wort-Timing, Untertitel-Chunks, Mix, −14 LUFS), `sfx.py` + `creak.py` (Soundeffekte), `check_beats.py` (Verständlichkeits-Prüfung) |

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
python3 tools/sfx.py && python3 tools/creak.py video/sfx/door_creak.wav
python3 tools/build.py video/story.json build            # Stimme, Timing, Mix -> build/
node video/render.cjs build/timeline.json segment 0 2701 video.mp4
ffmpeg -i video.mp4 -i build/mix.wav -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out.mp4
```

Stimmen: Thorsten-Voice (Piper/VITS, CC0) für Deutsch, Kokoro-82M (Apache-2.0) für Englisch.
Beim Hochladen auf TikTok „KI-generierter Inhalt“ aktivieren.
