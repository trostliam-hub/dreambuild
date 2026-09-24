# -*- coding: utf-8 -*-
"""App-Symbol CrankScore: Kettenblatt mit Kurbelarm als Zeiger auf einem Wertungsring.
Gezeichnet in 4-facher Groesse und herunterskaliert -- saubere Kanten."""
import math, os, sys
from PIL import Image, ImageDraw, ImageFilter

Z = 4                      # Ueberabtastung
N = 512
S = N * Z
C = S / 2

FARBE_A = (10, 133, 147)   # --anod
FARBE_B = (11, 95, 138)    # --anod-3
LIME = (198, 244, 50)
WEISS = (255, 255, 255, 255)

def verlauf(n):
    """Diagonaler Verlauf oben links -> unten rechts, leicht aufgehellt oben."""
    im = Image.new("RGB", (n, n))
    px = im.load()
    for y in range(n):
        for x in range(n):
            t = (x + y) / (2 * (n - 1))
            r = FARBE_A[0] + (FARBE_B[0] - FARBE_A[0]) * t
            g = FARBE_A[1] + (FARBE_B[1] - FARBE_A[1]) * t
            b = FARBE_A[2] + (FARBE_B[2] - FARBE_A[2]) * t
            px[x, y] = (int(r), int(g), int(b))
    return im

def pol(r, grad):
    a = math.radians(grad)
    return (C + r * math.cos(a), C + r * math.sin(a))

def ring_bogen(d, r, breite, von, bis, farbe):
    box = [C - r, C - r, C + r, C + r]
    d.arc(box, von, bis, fill=farbe, width=int(breite))
    # runde Enden
    for w in (von, bis):
        x, y = pol(r - breite / 2, w)
        d.ellipse([x - breite / 2, y - breite / 2, x + breite / 2, y + breite / 2], fill=farbe)

def kreis(d, x, y, r, farbe):
    d.ellipse([x - r, y - r, x + r, y + r], fill=farbe)

def motiv(skala=1.0):
    """Weisse Grafik + Bogen auf transparentem Grund, Groesse S."""
    ebene = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(ebene)
    k = Z * skala
    # Wertungsring: offen nach unten, 270 Grad, 82 % gefuellt
    R = 176 * k; B = 42 * k
    START, SPANNE, WERT = 135, 270, 0.78
    ENDE = START + SPANNE * WERT
    ring_bogen(d, R + B / 2, B, START, START + SPANNE, (255, 255, 255, 52))
    ring_bogen(d, R + B / 2, B, START, ENDE, LIME + (255,))
    # Kettenblatt: Zaehne + Ring
    ZAEHNE = 22
    r_fuss, r_kopf = 90 * k, 110 * k
    for i in range(ZAEHNE):
        m = 360 / ZAEHNE * i + 90
        w_fuss, w_kopf = 360 / ZAEHNE * 0.60, 360 / ZAEHNE * 0.30
        d.polygon([pol(r_fuss - 2 * k, m - w_fuss / 2), pol(r_kopf, m - w_kopf / 2),
                   pol(r_kopf, m + w_kopf / 2), pol(r_fuss - 2 * k, m + w_fuss / 2)], fill=WEISS)
    kreis(d, C, C, r_fuss, WEISS)
    kreis(d, C, C, 60 * k, (0, 0, 0, 0))                 # Loch im Kettenblatt
    # vier Stege zum Lochkreis (Spider)
    for m in (45, 135, 225, 315):
        a, b = pol(0, m), pol(78 * k, m)
        d.line([a, b], fill=WEISS, width=int(24 * k))
        x, y = pol(62 * k, m); kreis(d, x, y, 15 * k, WEISS)
    # Kurbelarm als Zeiger auf das Ende des Bogens
    L = 134 * k
    b0, b1 = 33 * k, 22 * k
    ux, uy = math.cos(math.radians(ENDE)), math.sin(math.radians(ENDE))
    nx, ny = -uy, ux
    tipx, tipy = C + ux * L, C + uy * L
    d.polygon([(C + nx * b0, C + ny * b0), (tipx + nx * b1, tipy + ny * b1),
               (tipx - nx * b1, tipy - ny * b1), (C - nx * b0, C - ny * b0)], fill=WEISS)
    kreis(d, tipx, tipy, b1, WEISS)
    kreis(d, C, C, 44 * k, WEISS)                        # Achse
    kreis(d, tipx, tipy, 9 * k, (0, 0, 0, 0))            # Pedalgewinde
    kreis(d, C, C, 15 * k, (0, 0, 0, 0))                 # Achsschraube
    return ebene

def bild(n, rund, skala=1.0):
    grund = verlauf(N).convert("RGBA")
    # weicher Lichtschein oben links
    licht = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    ImageDraw.Draw(licht).ellipse([-N * 0.35, -N * 0.45, N * 0.75, N * 0.55], fill=(255, 255, 255, 34))
    grund = Image.alpha_composite(grund, licht.filter(ImageFilter.GaussianBlur(N * 0.12)))
    m = motiv(skala).resize((N, N), Image.LANCZOS)
    # der Ring ist unten offen und wirkt sonst kopflastig: optisch mittig setzen
    dy = round(14 * skala)
    m = m.transform((N, N), Image.AFFINE, (1, 0, 0, 0, 1, -dy), resample=Image.BICUBIC)
    # zarter Schatten unter der Grafik
    schatten = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    schatten.putalpha(m.split()[3].point(lambda a: int(a * 0.28)))
    schatten = schatten.filter(ImageFilter.GaussianBlur(6)).transform((N, N), Image.AFFINE, (1, 0, 0, 0, 1, -5))
    out = Image.alpha_composite(Image.alpha_composite(grund, schatten), m)
    if rund:
        maske = Image.new("L", (N * Z, N * Z), 0)
        ImageDraw.Draw(maske).rounded_rectangle([0, 0, N * Z - 1, N * Z - 1], radius=int(N * Z * 0.225), fill=255)
        out.putalpha(maske.resize((N, N), Image.LANCZOS))
    return out.resize((n, n), Image.LANCZOS) if n != N else out

ziel = sys.argv[1] if len(sys.argv) > 1 else "."
bild(512, True).save(os.path.join(ziel, "icon-512.png"), optimize=True)
bild(192, True).save(os.path.join(ziel, "icon-192.png"), optimize=True)
bild(180, False).convert("RGB").save(os.path.join(ziel, "icon-180.png"), optimize=True)       # iOS rundet selbst
bild(512, False, skala=0.9).convert("RGB").save(os.path.join(ziel, "icon-mask.png"), optimize=True)  # Android: sichere Zone
print("fertig")
