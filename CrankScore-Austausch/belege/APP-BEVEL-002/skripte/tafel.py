"""Tafel T10 (Abschnitt 10): vorher/nachher der Renderings und Details.
python tafel.py <alt-seite.png> <neu-seite.png> <alt-drei.png> <neu-drei.png> <detail1.png,...> <ziel.jpg>"""
import sys
from PIL import Image, ImageDraw, ImageFont

alt_s, neu_s, alt_d, neu_d, details, ziel = sys.argv[1:7]
v_alt, v_neu = (sys.argv[7], sys.argv[8]) if len(sys.argv) > 8 else (None, None)
F = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
kopf, klein = ImageFont.truetype(FB, 30), ImageFont.truetype(F, 22)
HELL, DUNKEL, TINTE = (242, 240, 236), (22, 24, 27), (32, 34, 38)
B = 900


def auf(pfad, grund, b=B):
    im = Image.open(pfad).convert("RGBA")
    im = im.resize((b, round(im.height * b / im.width)), Image.LANCZOS)
    g = Image.new("RGBA", im.size, grund + (255,))
    g.alpha_composite(im)
    return g.convert("RGB")


reihen = [("Seitenansicht (Bild im Aufbau), heller Grund", auf(alt_s, HELL), auf(neu_s, HELL)),
          ("Dreiviertelansicht, dunkler Grund", auf(alt_d, DUNKEL), auf(neu_d, DUNKEL))]
if v_alt:
    reihen.append(("3D-Betrachter in der App (Desktop, hell): Licht von oben und Bodenschatten", auf(v_alt, HELL), auf(v_neu, HELL)))
det = [Image.open(p).convert("RGB") for p in details.split(",")]
dh = 300
det = [d.resize((round(d.width * dh / d.height), dh), Image.LANCZOS) for d in det]
rand, titel_h = 30, 60
breite = rand * 3 + B * 2
hoehe = rand + titel_h + sum(r[1].height + titel_h for r in reihen) + titel_h + dh + rand * 2
tafel = Image.new("RGB", (breite, hoehe), (255, 255, 255))
z = ImageDraw.Draw(tafel)
z.text((rand, rand), "T10 · 3D-Rad realistischer (BEVEL-002, Abschnitt 10) — links vorher (5727baf), rechts nachher", font=kopf, fill=TINTE)
y = rand + titel_h
for titel, a, n in reihen:
    z.text((rand, y), titel + ":  vorher  |  nachher", font=klein, fill=TINTE)
    y += 34
    tafel.paste(a, (rand, y))
    tafel.paste(n, (rand * 2 + B, y))
    y += a.height + titel_h - 34
z.text((rand, y), "Neu im Detail: Schaltwerk mit Gelenken und Käfig-Taille, Sattel mit Volumen, vordere Bremsleitung, Ventil und Nippel", font=klein, fill=TINTE)
y += 34
x = rand
for d in det:
    if x + d.width > breite - rand:
        d = d.crop((0, 0, breite - rand - x, dh))
    tafel.paste(d, (x, y))
    x += d.width + 12
    if x >= breite - rand:
        break
tafel.save(ziel, quality=86)
print(ziel, tafel.size)
