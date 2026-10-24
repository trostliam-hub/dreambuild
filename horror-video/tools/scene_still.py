# Szenen-Test ohne Ton: rendert einzelne Frames aus einer Mini-Timeline und legt ein Kontaktblatt an.
# Usage: python3 -I scene_still.py <spec.json> <outdir>
#   spec.json: {"beats": [{"scene": "newspaper", "dur": 5, "p": {...}, "zoom": [1, 1.05], ...}, ...],
#               "times": [0.5, 2.0, ...]   (globale Sekunden; ohne Angabe: 3 Frames pro Beat)}
# Ergebnis: <outdir>/fNNNNN.png (1080x1920) und <outdir>/sheet.jpg (verkleinert, mit Zeitangaben)
import os, sys, json, subprocess
from PIL import Image, ImageDraw
W = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); V = f"{W}/video"
spec = json.load(open(sys.argv[1])); out = os.path.abspath(sys.argv[2]); os.makedirs(out, exist_ok=True)
t = 0.0; beats = []
for b in spec["beats"]:
    d = b.pop("dur", 4.0); b.setdefault("p", {}); b.setdefault("clock", "11:59 PM"); b["start"], b["end"] = round(t, 3), round(t + d, 3); t += d; beats.append(b)
tl = {"series": spec.get("series", "PART 1"), "place": spec.get("place", "WICHITA, KS"), "duration": round(t, 3), "ui": spec.get("ui", {}),
      "captionY": 1250, "beats": beats, "words": [], "chunks": [], "flashes": [], "glitches": [], "shakes": [], "noEndFade": True}
json.dump(tl, open(f"{out}/tl.json", "w"), indent=1)
times = spec.get("times") or [round(b["start"] + (b["end"] - b["start"]) * k, 2) for b in beats for k in (0.15, 0.5, 0.92)]
frames = [max(0, min(int(round(x * 30)), int(t * 30) - 1)) for x in times]
r = subprocess.run(["node", f"{V}/render.cjs", f"{out}/tl.json", "stills", out, ",".join(map(str, frames))], capture_output=True, text=True)
if r.returncode or "PAGEERROR" in r.stderr or "CONSOLE" in r.stderr: print(r.stdout[-2000:], r.stderr[-3000:])
ims = [Image.open(f"{out}/f{f:05d}.png").convert("RGB").resize((270, 480)) for f in frames]
cols = min(6, len(ims)); rows = -(-len(ims) // cols)
sheet = Image.new("RGB", (cols * 270, rows * 500), (20, 20, 20)); d = ImageDraw.Draw(sheet)
for i, (im, x) in enumerate(zip(ims, times)):
    sheet.paste(im, ((i % cols) * 270, (i // cols) * 500)); d.text(((i % cols) * 270 + 6, (i // cols) * 500 + 482), f"t={x:.2f}s {beats[[k for k, b in enumerate(beats) if b['start'] <= x][-1]]['scene']}", fill=(255, 220, 0))
sheet.save(f"{out}/sheet.jpg", quality=88)
print(f"{len(frames)} frames -> {out}/sheet.jpg")
