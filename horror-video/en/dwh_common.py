# Gemeinsame Einstellungen für die englische Serie "DON'T WAKE HER"
import json

VOICES = {
    "narrator": {"engine": "kokoro", "sid": 17, "deep": 1.0, "style": "natural", "speed": 0.92},   # am_onyx, tief, ruhig
    "you":      {"engine": "kokoro", "sid": 10, "deep": 1.0, "style": "natural", "speed": 0.95},   # af_sky, jung, leise
    "mrs_hale": {"engine": "kokoro", "sid": 3,  "deep": 1.0, "style": "natural", "speed": 1.0},    # af_heart, warm
    "mr_hale":  {"engine": "kokoro", "sid": 16, "deep": 1.0, "style": "natural", "speed": 0.95},   # am_michael, ruhig, müde
    "shape":    {"engine": "kokoro", "sid": 6,  "deep": 0.78, "style": "entity", "speed": 0.75},   # af_nicole, tief verlangsamt
}

def base(part, pill, sub=None):
    return {
        "lang": "en", "fluent": True, "series": f"PART {part}", "place": "HALE HOUSE",
        "lead": 0.15, "tail": 1.3, "lineGap": 0.2, "beatGap": 0.1, "duckDb": 7, "capMaxPx": 860, "noEndFade": True,
        "voices": VOICES,
        "ui": {"now": "now", "message": "iMessage", "date": "Friday, October 23", "typing": "Mrs. Hale is typing", "sender": "Unknown",
               "kicker": "PART %d" % (part + 1), "pill": pill, "title": "WOULD YOU GO UP?", "optA": "OPTION ONE", "optB": "OPTION TWO", "end": "DON'T WAKE HER"},
    }

def L(text, **k):
    d = {"text": text}; d.update(k); return d

def monitor(clock, stamp, lines, figure=None, figures=None, **extra):
    p = {"room": "nursery", "label": "CAM - NURSERY", "stamp": stamp, "device": "baby", "muted": True, "door": 0.35}
    p.update(extra.pop("p", {}))
    if figure: p["figure"] = figure
    if figures: p["figures"] = figures
    b = {"scene": "monitor_screen", "clock": clock, "p": p, "lines": lines, "captionY": 1590, "capBox": True}
    b.update(extra); return b

def hiss(beats, story):
    """Babyphone-Rauschen unter allen Monitor-Beats."""
    for i, b in enumerate(beats):
        if b["scene"] == "monitor_screen" and b["p"].get("device", "baby") == "baby":
            story["beds"].append({"name": "monitor_hiss", "fromBeat": i, "toBeat": i, "gain": 6, "fade": 0.25})

def save(story, path):
    json.dump(story, open(path, "w"), ensure_ascii=False, indent=1)
