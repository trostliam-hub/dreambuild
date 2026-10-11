"""Vorher-Nachher-Tafeln APP-ADAPTER-001. python tafeln.py <vorher> <nachher> <ziel>"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
V, N, Z = sys.argv[1:4]
os.makedirs(Z, exist_ok=True)
F = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"; FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
kopf, klein = ImageFont.truetype(FB, 30), ImageFont.truetype(F, 22)
def lade(p, breite, hoehe_max, unten=False):
    im = Image.open(p).convert("RGB")
    s = breite / im.width
    im = im.resize((breite, round(im.height * s)), Image.LANCZOS)
    if unten and im.height > hoehe_max: return im.crop((0, im.height - hoehe_max, breite, im.height))
    return im.crop((0, 0, breite, min(im.height, hoehe_max)))
def tafel(datei, titel, zeilen, breite=430, hoehe_max=1500):
    """zeilen: [(Beschriftung, Dateiname-Ende, nur-unten)] -- je Zeile vorher | nachher"""
    rand, th = 30, 64
    paare = [(u, lade(os.path.join(V, "v-" + n), breite, hoehe_max, unten), lade(os.path.join(N, "n-" + n), breite, hoehe_max, unten)) for u, n, unten in zeilen]
    w = rand * 3 + 2 * breite
    h = rand + th + sum(40 + max(a.height, b.height) + rand for _, a, b in paare) + rand
    t = Image.new("RGB", (w, h), (255, 255, 255)); d = ImageDraw.Draw(t)
    d.text((rand, rand), titel, font=kopf, fill=(30, 32, 36))
    y = rand + th
    for u, a, b in paare:
        d.text((rand, y), u + " · vorher", font=klein, fill=(110, 110, 110))
        d.text((rand * 2 + breite, y), u + " · nachher", font=klein, fill=(30, 90, 160))
        y += 40; t.paste(a, (rand, y)); t.paste(b, (rand * 2 + breite, y)); y += max(a.height, b.height) + rand
    t.save(os.path.join(Z, datei), quality=84); print(datei, t.size)
for mod, name in (("real", "Mein Rad"), ("traum", "Traumrad")):
    tafel(f"T1-{mod}-390-hell.jpg", f"T1 · {name} · 390 px hell · XT 203 an Pike",
          [("Meldung nach dem Einbau", f"{mod}-hell-de-390-meldung.png", True), ("Gabel", f"{mod}-hell-de-390-gabel.png", False),
           ("Bremse", f"{mod}-hell-de-390-bremsen.png", False), ("Prüfung", f"{mod}-hell-de-390-pruefung.png", False)], 430, 900)
tafel("T2-real-390-dunkel.jpg", "T2 · Mein Rad · 390 px dunkel",
      [("Gabel", "real-dunkel-de-390-gabel.png", False), ("Bremse", "real-dunkel-de-390-bremsen.png", False), ("Prüfung", "real-dunkel-de-390-pruefung.png", False)], 430, 1300)
tafel("T3-englisch-390.jpg", "T3 · Englisch · 390 px",
      [("Meldung", "real-hell-en-390-meldung.png", True), ("Bremse", "real-hell-en-390-bremsen.png", False), ("Prüfung", "real-hell-en-390-pruefung.png", False)], 430, 1300)
tafel("T4-desktop-1280.jpg", "T4 · Desktop 1280 px hell",
      [("Bremse", "real-hell-de-1280-bremsen.png", False), ("Prüfung", "real-hell-de-1280-pruefung.png", False)], 640, 1300)
