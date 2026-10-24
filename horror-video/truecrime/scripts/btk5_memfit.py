# Zeigt Wortzeiten pro Beat und passt die Gedenk-Namen an die gesprochenen Namen an
# Usage: python3 -I btk5_memfit.py <builddir> <beat Otero-Satz> <beat übrige Namen>
import json, sys, re
tl = json.load(open(sys.argv[1] + "/timeline.json"))
beats = tl["beats"]
for bi, b in enumerate(beats):
    ws = [w for w in tl["words"] if w["beat"] == bi]
    print(f"b{bi:02d} {b['scene']:15s} {b['start']:6.2f}-{b['end']:6.2f} ({b['end']-b['start']:.2f}s)  " + " ".join(f"{w['text']}@{w['start']-b['start']:.2f}" for w in ws))
def fit(ts):
    n = len(ts); xs = list(range(n)); mx = sum(xs) / n; my = sum(ts) / n
    gap = sum((x - mx) * (y - my) for x, y in zip(xs, ts)) / sum((x - mx) ** 2 for x in xs); at = my - gap * mx
    return at, gap, [round(y - (at + gap * x), 2) for x, y in zip(xs, ts)]
b1, b2 = int(sys.argv[2]), int(sys.argv[3])
def first(bi, keys):
    b = beats[bi]; ws = [w for w in tl["words"] if w["beat"] == bi]; out, k = [], 0
    for w in ws:
        if k < len(keys) and re.sub(r"[^a-z]", "", w["text"].lower()) == keys[k]: out.append(w["start"] - b["start"]); k += 1
    return out
t1 = first(b1, ["joseph", "julie", "josephine", "joseph"]); a, g, r = fit(t1)
print("Otero names", [round(t, 2) for t in t1], f"fit at={a:.2f} gap={g:.3f} res={r}; 5th name would appear at {a + 4 * g:.2f}, beat length {beats[b1]['end'] - beats[b1]['start']:.2f}")
ws2 = [w for w in tl["words"] if w["beat"] == b2]; lines = {}
for w in ws2: lines.setdefault(w["line"], w["start"] - beats[b2]["start"])
t2 = list(lines.values()); print("roll clip starts", [round(t, 2) for t in t2], "diffs", [round(y - x, 2) for x, y in zip(t2, t2[1:])])
ends = {}
for w in ws2: ends[w["line"]] = w["end"] - beats[b2]["start"]
print("roll clip ends", [round(v, 2) for v in ends.values()])
print("duration", tl["duration"], "main", tl.get("durationMain"), "coldOpen", tl.get("coldOpen"))
