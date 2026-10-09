"""Schriftzug-Textur fuer das Unterrohr: python dekor.py <ziel.png>
Braucht Pillow und fontTools (mit brotli). Die App-Schrift Inter (fonts/inter-400-800-latin.woff2) wird als
TTF in den Gewichten 800 ("CRANK") und 700 ("SCORE") erzeugt -- wie das Logo der App: Crank dunkel, Score grau.
Vorbild fuer Groesse und Lage: Liams Foto eines Propain (Schriftzug ueber gut die halbe Laenge des Unterrohrs).

Abwicklung (siehe werkzeug.rohr mit uv=True): u laeuft vom Steuerrohr (0) zum Tretlager (1), v einmal um das
Rohr; v = 0 zeigt nach links (+y, Nicht-Antriebsseite), v = 0,25 nach unten vorn (Unterseite), v = 0,5 nach
rechts (Antriebsseite), v = 0,75 nach oben. Bild-Zeile 0 entspricht v = 1.
Antriebsseite: liest vom Tretlager zum Steuerrohr (also gespiegelt in u). Nicht-Antriebsseite: liest wie auf
dem Foto vom Steuerrohr nach unten (in v gespiegelt). Unten am Tretlager-Ende ein dunkler Unterrohrschutz."""
import sys, os, io, math
from PIL import Image, ImageDraw, ImageFont, ImageOps
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import geo

HIER = os.path.dirname(os.path.abspath(__file__))
WOFF2 = os.path.join(HIER, "..", "..", "fonts", "inter-400-800-latin.woff2")
LACK = (231, 232, 229)          # muss zur Lackfarbe in bau.baue passen (#e7e8e5)
DUNKEL = (43, 45, 49)           # "CRANK"
GRAU = (118, 119, 124)          # "SCORE" (etwas dunkler als #8e8e93 im Logo: auf weissem Lack sonst zu blass)
SCHUTZ = (52, 54, 58)           # Unterrohrschutz


def schrift(gewicht):
    f = TTFont(WOFF2)
    inst = instancer.instantiateVariableFont(f, {"wght": gewicht})
    puf = io.BytesIO()
    inst.flavor = None
    inst.save(puf)
    puf.seek(0)
    return puf


def masse():
    """Laenge des Unterrohrs (mm) und Umfangsweg je v an der Seite (2*pi*halbe Hoehe), wie in rahmen.hauptrahmen."""
    d = geo.DIR_LENK
    dt0 = (geo.HT_U[0] - 28 * d[0], geo.HT_U[1] - 28 * d[1])
    dt2 = (40.0, 28.0)
    L = math.hypot(dt0[0] - dt2[0], dt0[1] - dt2[1]) + 12      # Verlaengerung am Steuerrohr
    return L, 2 * math.pi * 27.5


def baue_bild(ziel, W=2048, H=512):
    L, umfang = masse()
    px_u, px_v = W / L, H / umfang                  # Pixel je mm entlang bzw. um das Rohr
    img = Image.new("RGB", (W, H), LACK)
    d = ImageDraw.Draw(img)
    # Unterrohrschutz: Unterseite (v 0,25 +- 0,11), die letzten 200 mm vor dem Tretlager-Ende
    u0 = int(W * (1 - 215 / L)); u1 = W - int(W * 18 / L)
    y_a, y_b = int(H * (1 - 0.36)), int(H * (1 - 0.14))
    d.rounded_rectangle((u0, y_a, u1, y_b), radius=int(H * 0.05), fill=SCHUTZ)
    # Schriftzug
    hoehe_mm = 41.0                                   # Versalhoehe: fast die ganze Seite des Unterrohrs, wie auf dem Foto
    f8, f7 = schrift(800), schrift(700)
    probe = ImageFont.truetype(f8, 200)
    vh = probe.getbbox("H")[3] - probe.getbbox("H")[1]
    groesse = int(200 * hoehe_mm * px_v / vh)
    f8.seek(0); f7.seek(0)
    F8, F7 = ImageFont.truetype(f8, groesse), ImageFont.truetype(f7, groesse)
    teile = [("CRANK", F8, DUNKEL), ("SCORE", F7, GRAU)]
    breiten = [F.getbbox(t)[2] - F.getbbox(t)[0] for t, F, _ in teile]
    luecke = int(groesse * 0.02)
    b_ges = sum(breiten) + luecke
    oben = F8.getbbox("H")[1]
    hoehe_px = int(hoehe_mm * px_v) + 4
    # Text in einem eigenen Streifen setzen (Pixel quadratisch in mm umgerechnet: Breite mit px_u/px_v skalieren)
    streifen = Image.new("RGBA", (b_ges + 8, hoehe_px), (0, 0, 0, 0))
    ds = ImageDraw.Draw(streifen)
    x = 4
    for (t, F, farbe), b in zip(teile, breiten):
        ds.text((x - F.getbbox(t)[0], 2 - oben), t, font=F, fill=farbe + (255,))
        x += b + luecke
    streifen = streifen.resize((max(1, int(streifen.width * px_u / px_v)), streifen.height), Image.LANCZOS)
    mitte_u = int(W * 0.44)                           # etwas zum Steuerrohr hin, wie auf dem Foto
    # Antriebsseite (v = 0,5): in u gespiegelt
    r = ImageOps.mirror(streifen)
    img.paste(r, (mitte_u - r.width // 2, int(H * 0.5) - r.height // 2), r)
    # Nicht-Antriebsseite (v = 0 bzw. 1, an der Naht): in v gespiegelt, oben und unten je zur Haelfte
    l = ImageOps.flip(streifen)
    for y0 in (-l.height // 2, H - l.height // 2):
        img.paste(l, (mitte_u - l.width // 2, y0), l)
    img.save(ziel)
    print("Dekor", ziel, img.size, "Schriftzug %.0f mm lang, %.0f mm hoch" % (b_ges / px_v, hoehe_mm))


if __name__ == "__main__":
    baue_bild(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HIER, "unterrohr-dekor.png"))
