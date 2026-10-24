# Kontaktblatt aus einer fertig gebauten Timeline (ohne Video-Render): Frames je Beat + Cold Open.
# Usage: python3 -I tl_sheet.py <builddir> [k1,k2,...]   (k = Anteile der Beat-Dauer, Standard 0.25,0.75)
# Ergebnis: <builddir>/st/fNNNNN.png und <builddir>/st/sheet.jpg (mit Beat-Nummer, Szene und Zeit)
import os, sys, json, subprocess
from PIL import Image, ImageDraw
W = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); V = f"{W}/video"
bd = os.path.abspath(sys.argv[1]); ks = [float(x) for x in (sys.argv[2].split(",") if len(sys.argv) > 2 else ["0.25", "0.75"])]
tl = json.load(open(f"{bd}/timeline.json")); co = tl.get("coldOpen"); off = (co["dur"] + co["gap"]) if co else 0.0
shots = []  # (frame, label)
if co: shots.append((int(round(co["dur"] * .5 * 30)), "COLD OPEN"))
for i, b in enumerate(tl["beats"]):
    for k in ks:
        t = off + b["start"] + (b["end"] - b["start"]) * k; shots.append((int(round(t * 30)), f"b{i} {b['scene']} {t:.1f}s"))
out = f"{bd}/st"; os.makedirs(out, exist_ok=True)
r = subprocess.run(["node", f"{V}/render.cjs", f"{bd}/timeline.json", "stills", out, ",".join(str(f) for f, _ in shots)], capture_output=True, text=True)
if r.returncode or "PAGEERROR" in r.stderr or "CONSOLE" in r.stderr: print(r.stdout[-2000:], r.stderr[-3000:])
cols = 6; rows = -(-len(shots) // cols); sheet = Image.new("RGB", (cols * 270, rows * 500), (20, 20, 20)); d = ImageDraw.Draw(sheet)
for n, (f, lab) in enumerate(shots):
    im = Image.open(f"{out}/f{f:05d}.png").convert("RGB").resize((270, 480)); x, y = (n % cols) * 270, (n // cols) * 500
    sheet.paste(im, (x, y)); d.text((x + 6, y + 482), lab, fill=(255, 220, 0))
sheet.save(f"{out}/sheet.jpg", quality=88); print(f"{len(shots)} frames -> {out}/sheet.jpg (duration {tl['duration']:.2f}s)")
