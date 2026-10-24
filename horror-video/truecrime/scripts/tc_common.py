# Gemeinsame Einstellungen für die True-Crime-Serien (Serie A: BTK, Serie B: Hinterkaifeck)
import json

# Supertonic 3 (Stimmen-Test vb2/vb3): Stimme 8 = natürlichste Männerstimme (UTMOS 4.50 gegen 4.38 der alten Kokoro-Mischung),
# echte Atempausen zwischen Satzteilen -> flüssiger. Stimme 6 = tiefer, ruhiger (Zitate), Stimme 0 = Frau.
VOICES = {
    "narrator": {"engine": "supertonic", "sid": 8, "steps": 10, "deep": 1.0, "style": "clean", "speed": 1.05},
    "quote":    {"engine": "supertonic", "sid": 6, "steps": 16, "deep": 1.0, "style": "clean", "speed": 1.0},
    "quote_f":  {"engine": "supertonic", "sid": 0, "steps": 16, "deep": 1.0, "style": "clean", "speed": 1.0},
}

def base(series, part, place, pill, kicker):
    return {
        "lang": "en", "fluent": True, "series": f"{series} · PART {part}", "place": place,
        "cerIgnoreNumbers": True,
        "lead": 0.15, "tail": 1.3, "lineGap": 0.14, "beatGap": 0.06, "duckDb": 8, "capMaxPx": 860, "noEndFade": True,
        "voices": VOICES,
        "ui": {"kicker": kicker, "pill": pill, "end": series},
    }

def L(text, **k):
    d = {"text": text}; d.update(k); return d

def save(story, path):
    json.dump(story, open(path, "w"), ensure_ascii=False, indent=1)
