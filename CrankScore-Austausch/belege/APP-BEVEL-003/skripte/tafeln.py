"""Vorher-Nachher-Tafeln BEVEL-003. python tafeln.py <vorher> <nachher> <ziel>"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
V, N, Z = sys.argv[1:4]
os.makedirs(Z, exist_ok=True)
F = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"; FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
kopf, klein = ImageFont.truetype(FB, 30), ImageFont.truetype(F, 22)
def lade(p, breite, hoehe_max):
    im = Image.open(p).convert("RGB")
    s = breite / im.width
    im = im.resize((breite, round(im.height * s)), Image.LANCZOS)
    return im.crop((0, 0, breite, min(im.height, hoehe_max)))
def tafel(datei, titel, paare, breite=560, hoehe_max=2200):
    spalten = []
    for unter, v, n in paare:
        a = lade(os.path.join(V, v), breite, hoehe_max) if v else None
        b = lade(os.path.join(N, n), breite, hoehe_max)
        spalten.append((unter, a, b))
    rand, th = 30, 64
    w = rand + len(spalten) * (2 * breite + rand * 2) 
    h = rand + th + 40 + max(max((a.height if a else 0), b.height) for _, a, b in spalten) + rand
    t = Image.new("RGB", (w, h), (255, 255, 255)); d = ImageDraw.Draw(t)
    d.text((rand, rand), titel + "   (vorher: live 20261011-1156 · nachher: Branch)", font=kopf, fill=(30, 32, 36))
    x = rand
    for unter, a, b in spalten:
        d.text((x, rand + th), unter + " · vorher", font=klein, fill=(110, 110, 110))
        d.text((x + breite + rand, rand + th), unter + " · nachher", font=klein, fill=(30, 90, 160))
        y = rand + th + 40
        if a: t.paste(a, (x, y))
        else: d.text((x, y), "(gab es vorher nicht)", font=klein, fill=(150, 150, 150))
        t.paste(b, (x + breite + rand, y))
        x += 2 * breite + rand * 2
    t.save(os.path.join(Z, datei), quality=84); print(datei, t.size)
tafel("T1-aufbau-390-dunkel-hell.jpg", "T1 · Aufbau 390 px — dunkel und hell", [("Dunkel", "v-aufbau-390-dunkel.png", "n-aufbau-390-dunkel.png"), ("Hell", "v-aufbau-390-hell.png", "n-aufbau-390-hell.png")], 420, 2600)
tafel("T2-aufbau-desktop.jpg", "T2 · Aufbau Desktop 1280 px — hell und dunkel", [("Hell", "v-aufbau-desktop-hell.png", "n-aufbau-desktop-hell.png"), ("Dunkel", "v-aufbau-desktop-dunkel.png", "n-aufbau-desktop-dunkel.png")], 640, 1500)
tafel("T3-englisch-390.jpg", "T3 · Englisch 390 px", [("EN", "v-aufbau-390-en.png", "n-aufbau-390-en.png")], 480, 2600)
tafel("T4-teilewechsel.jpg", "T4 · Teilewechsel Bremse (XT M8120)", [("Start", "v-finder-bremse.png", "n-finder-bremse.png"), ("Mehr Bremskraft", "v-finder-kraft-marke.png", "n-finder-kraft-marke.png"), ("Leichter", "v-finder-leicht-250.png", "n-finder-leicht-250.png")], 390, 1700)
tafel("T5-vergleich-einkauf.jpg", "T5 · Vergleich Cura 2 und Einkauf XT (keine Suchlinks)", [("Vergleich Cura 2", "v-vergleich-cura2.png", "n-vergleich-cura2.png"), ("Einkauf XT", "v-einkauf-xt.png", "n-einkauf-xt.png")], 420, 1700)
tafel("T6-pruefung-einkauf.jpg", "T6 · Prüfung zugeklappt und Einkaufsliste", [("Prüfung zu", "v-pruefung-zu.png", "n-pruefung-zu.png"), ("Einkauf", "v-einkauf.png", "n-einkauf.png")], 420, 1700)

tafel("T7-neu-teilewechsel.jpg", "T7 · Neu: Marke + Budget mit null Treffern, Ergebnisse, Vergleich mit Rückweg, Wunschliste", [("Marke Trickstuff + 300 €", None, "x-null.png"), ("Günstiger ersetzen", None, "x-sparen.png"), ("Vergleich", None, "x-vergleich.png"), ("Wunschliste", None, "x-wunsch.png")], 390, 1700)
