"""Renderings fuer App und Pruefung aufbereiten (Pillow):
python nachbearbeitung.py <seite_rgba.png> <dreiviertel_rgba.png> <ausgabe-ordner>
- schneidet transparent auf das Rad (mit Schatten) zu,
- legt Pruefbilder auf hellem (#f2f2f7, #ffffff) und dunklem (#000000, #1c1c1e) Grund an,
- schreibt WebP (mit Alphakanal) fuer die App in 1200 und 640 px Breite und ein winziges Vorschaubild (data-URI)."""
import sys, os, base64, io
from PIL import Image, ImageFilter
seite, drei, aus = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(aus, exist_ok=True)
def zuschneiden(im, rand=0.02, unten=0.035):
    """Auf das Rad zuschneiden: Rahmen aus den deckenden Pixeln (Alpha > 200), unten etwas Platz fuer den
    weichen Bodenschatten. Der Schattenfaenger erzeugt ueber die ganze Bodenflaeche leichte Transparenz;
    ausserhalb des Ausschnitts faellt sie weg, innerhalb wird sehr schwacher Schatten (< 3 %) weich ausgeblendet."""
    a = im.split()[3]
    l, o, r, u = a.point(lambda v: 255 if v > 200 else 0).getbbox()
    m = int((r - l) * rand)
    k = im.crop((max(0, l - m), max(0, o - m), min(im.width, r + m), min(im.height, u + int((r - l) * unten))))
    ka = k.split()[3].point(lambda v: round(max(0, v - 8) * 255 / 247))     # weicher Uebergang statt Stufe
    k.putalpha(ka)
    return k
def auf_grund(im, farbe):
    g = Image.new("RGBA", im.size, farbe + (255,))
    g.alpha_composite(im)
    return g.convert("RGB")
groessen = {}
for name, pfad in (("seite", seite), ("dreiviertel", drei)):
    im = zuschneiden(Image.open(pfad).convert("RGBA"))
    im.save(os.path.join(aus, f"rad-{name}.png"))
    for gname, farbe in (("hell", (242, 242, 247)), ("weiss", (255, 255, 255)), ("schwarz", (0, 0, 0)), ("dunkel", (28, 28, 30))):
        auf_grund(im, farbe).save(os.path.join(aus, f"pruef-{name}-{gname}.png"))
    for b in (1200, 640):
        k = im.resize((b, round(im.height * b / im.width)), Image.LANCZOS)
        p = os.path.join(aus, f"rad-{name}-{b}.webp")
        k.save(p, "WEBP", quality=82, method=6, alpha_quality=90)
        groessen[os.path.basename(p)] = (os.path.getsize(p), k.size)
    # Vorschau: 32 px breit, weichgezeichnet, als data-URI
    v = im.resize((32, round(im.height * 32 / im.width)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    puf = io.BytesIO(); v.save(puf, "WEBP", quality=40, alpha_quality=50)
    uri = "data:image/webp;base64," + base64.b64encode(puf.getvalue()).decode()
    open(os.path.join(aus, f"rad-{name}-vorschau.txt"), "w").write(uri)
    groessen[f"rad-{name}-vorschau (data-URI)"] = (len(uri), v.size)
    groessen[f"rad-{name} Seitenverhaeltnis"] = (0, im.size)
for k, (n, s) in groessen.items():
    print(f"{k}: {n} Bytes, {s[0]}x{s[1]}")
