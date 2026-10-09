"""Anbauteile des Beispielrads: Laufraeder, Gabel, Daempfer, Antrieb, Bremsen, Cockpit, Sitz.
Alle Masse in mm (Herstellerangaben, wo bekannt, sonst uebliche Masse der Bauart)."""
import math
import bmesh
from mathutils import Vector, Matrix
from werkzeug import (ringplatte, MM, v, rohr, zyl, drehteil, platte, zahnrad, kreise_umriss, fertig, verbinden)


# ================================================================ Laufrad
def reifen(name, R, breite, mitte, col, knopf_h=5.5):
    """Reifen 2,5": Karkasse als Rotationskoerper, Stollen als einzelne Bloecke."""
    Rk = R - knopf_h                      # Karkasse ohne Stollen
    wulst = Rk - 58                       # ungefaehr der Felgenrand
    h = breite / 2
    prof = []
    # halbe Kontur (von der Wulst ueber die Schulter zur Mitte), dann gespiegelt
    halb = [(wulst + 2, h * 0.45), (wulst + 12, h * 0.78), (wulst + 26, h * 0.97), (wulst + 38, h * 1.0),
            (Rk - 12, h * 0.93), (Rk - 5, h * 0.74), (Rk - 1.5, h * 0.42), (Rk, 0.0)]
    prof = [(r, -y) for r, y in halb] + [(r, y) for r, y in reversed(halb[:-1])]
    t = drehteil(name + "_Karkasse", prof, mitte, "Gummi_Flanke", col, n=96)
    # Stollen
    bm = bmesh.new()
    n = int(2 * math.pi * R / 19)

    def block(w, y, r_unten, r_oben, l, b, kipp=0.0):
        """Block auf der Lauffläche: Winkel w (um y), axiale Lage y, Hoehe radial, Laenge l (Umfang), Breite b."""
        geo = bmesh.ops.create_cube(bm, size=1.0)
        vs = geo["verts"]
        hoehe = r_oben - r_unten
        bmesh.ops.scale(bm, verts=vs, vec=Vector((l * MM, b * MM, hoehe * MM)))
        # leicht konisch: obere Flaeche kleiner
        for q in vs:
            if q.co.z > 0:
                q.co.x *= 0.82
                q.co.y *= 0.86
        bmesh.ops.translate(bm, verts=vs, vec=Vector((0, 0, (r_unten + hoehe / 2) * MM)))
        if kipp:
            bmesh.ops.rotate(bm, verts=vs, cent=Vector((0, 0, r_unten * MM)), matrix=Matrix.Rotation(kipp, 3, "X"))
        bmesh.ops.translate(bm, verts=vs, vec=Vector((0, y * MM, 0)))
        bmesh.ops.rotate(bm, verts=vs, cent=Vector(), matrix=Matrix.Rotation(w, 3, "Y"))
    for i in range(n):
        w = 2 * math.pi * i / n
        if i % 2 == 0:
            block(w, 0, Rk - 1.5, R, 9.5, 15)
        else:
            block(w, -10.5, Rk - 2, R - 0.3, 8.5, 10, kipp=0.12)
            block(w, 10.5, Rk - 2, R - 0.3, 8.5, 10, kipp=-0.12)
        # Seitenstollen auf der Schulter, schraeg nach aussen
        ws = w + (math.pi / n)
        block(ws, -(h - 6), Rk - 16, Rk - 8.5 + knopf_h * 0.9, 10, 8, kipp=0.8)
        block(ws, (h - 6), Rk - 16, Rk - 8.5 + knopf_h * 0.9, 10, 8, kipp=-0.8)
    bmesh.ops.translate(bm, verts=bm.verts, vec=mitte)
    k = fertig(name + "_Stollen", bm, "Gummi", col, glatt=True, winkel=30)
    return verbinden(name, [t, k])


def felge(name, wulst_r, mitte, col):
    p = [(wulst_r + 6, -17.5), (wulst_r - 15, -17.5), (wulst_r - 20, -12), (wulst_r - 22, 0), (wulst_r - 20, 12),
         (wulst_r - 15, 17.5), (wulst_r + 6, 17.5), (wulst_r + 6, 14.5), (wulst_r, 13.5), (wulst_r - 2, 0),
         (wulst_r, -13.5), (wulst_r + 6, -14.5), (wulst_r + 6, -17.5)]
    return drehteil(name, p, mitte, "Alu_schwarz_eloxiert", col, n=96, winkel=35)


def nabe(name, mitte, col, breite, flansch, freilauf=False):
    """Nabe: Achse, Koerper, zwei Flansche; hinten mit Freilaufkoerper auf der Antriebsseite (-y).
    flansch: Abstand der Flansche von der Mitte, Zahl (beide gleich) oder (rechts, links)."""
    b = breite / 2
    fr, fl = flansch if isinstance(flansch, tuple) else (flansch, flansch)
    if freilauf:
        p = [(7, -b), (17.5, -b), (17.5, -fr - 4), (23, -fr - 3), (29, -fr - 2), (29, -fr + 1),
             (18, -fr + 2), (16, 0), (18, fl - 2), (29, fl - 1), (29, fl + 2), (20, fl + 4),
             (17, b - 8), (21, b - 6), (21, b), (7, b)]
    else:
        p = [(7, -b), (14, -b), (16, -fr - 4), (29, -fr - 2), (29, -fr + 1), (18, -fr + 2), (16, 0),
             (18, fl - 2), (29, fl - 1), (29, fl + 2), (16, fl + 4), (21, b - 6), (21, b), (7, b)]
    return drehteil(name, p, mitte, "Alu_schwarz_eloxiert", col, n=48, winkel=30)


def speichen(name, mitte, flansch, r_loch, r_felge, col, kreuz=3):
    """32 Speichen, dreifach gekreuzt. Halb je Flansch, abwechselnd ziehend und schiebend."""
    bm = bmesh.new()
    n_seite = 16
    fr, fl = flansch if isinstance(flansch, tuple) else (flansch, flansch)
    for seite, y in ((-1, -fr), (1, fl)):
        for i in range(n_seite):
            wh = 2 * math.pi * i / n_seite + (math.pi / n_seite if seite > 0 else 0)
            richtung = 1 if i % 2 == 0 else -1
            wr = wh + richtung * kreuz * 2 * math.pi / n_seite
            a = mitte + Vector((math.cos(wh) * r_loch * MM, y * MM, math.sin(wh) * r_loch * MM))
            e = mitte + Vector((math.cos(wr) * r_felge * MM, seite * 2 * MM, math.sin(wr) * r_felge * MM))
            s = zyl("tmp", a, e, 1.0, None, None, n=6, bm_rueck=True)
            me_tmp = __import__("bpy").data.meshes.new("tmp")
            s.to_mesh(me_tmp)
            s.free()
            bm.from_mesh(me_tmp)
            __import__("bpy").data.meshes.remove(me_tmp)
            # Nippel
    return fertig(name, bm, "Stahl_dunkel", col, glatt=True, winkel=60)


def bremsscheibe(name, r_aussen, mitte, y, col):
    """Scheibe: Reibring mit Bohrungen, sechs Arme zur Centerlock-Aufnahme."""
    import bpy
    spur = 17.0
    ring = platte(name + "_Ring", kreise_umriss([(0, 0, r_aussen)], n=120), y - 0.9, y + 0.9, "Stahl_blank", col, fase=0.3, glatt=False)
    # Innenausschnitt und Bohrungen per Boolean
    loch_teile = []
    innen = zyl(name + "_innen", Vector((0, (y - 5) * MM, 0)), Vector((0, (y + 5) * MM, 0)), r_aussen - spur, None, col, n=96)
    loch_teile.append(innen)
    for i in range(30):
        w = 2 * math.pi * i / 30
        for rr, dw in ((r_aussen - spur * 0.33, 0), (r_aussen - spur * 0.72, math.pi / 30)):
            c = Vector((math.cos(w + dw) * rr * MM, 0, math.sin(w + dw) * rr * MM))
            loch_teile.append(zyl(name + "_loch", c + Vector((0, (y - 5) * MM, 0)), c + Vector((0, (y + 5) * MM, 0)), 2.4, None, col, n=10))
    weg = verbinden(name + "_weg", loch_teile)
    mod = ring.modifiers.new("Bohrungen", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = weg
    mod.solver = "EXACT"
    with bpy.context.temp_override(object=ring, active_object=ring):
        bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(weg, do_unlink=True)
    # Spinne
    arme = []
    for i in range(6):
        w = 2 * math.pi * i / 6
        um = []
        for rr, dw in ((22, -0.32), (r_aussen - spur + 2, -0.07), (r_aussen - spur + 2, 0.09), (22, 0.34)):
            um.append((math.cos(w + dw) * rr, math.sin(w + dw) * rr))
        arme.append(platte(name + "_Arm", um, y - 1.1, y + 1.1, "Stahl_dunkel", col, fase=0.3, glatt=False))
    # Centerlock-Aufnahme als Ring (Loch fuer Nabe und Steckachse)
    arme.append(drehteil(name + "_Nabe", [(15, y - 2.5), (25, y - 2.5), (25, y + 2.5), (15, y + 2.5), (15, y - 2.5)], Vector(),
                         "Stahl_dunkel", col, n=36, glatt=False))
    s = verbinden(name + "_Spinne", arme)
    teil = verbinden(name, [ring, s])
    teil.location = mitte
    return teil


def kassette(name, mitte, col, y_klein=-64.5, abstand=3.85):
    zaehne = [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 52]
    teile, radien = [], {}
    for k, z in enumerate(zaehne):
        y = y_klein + k * abstand
        ob, r = zahnrad(f"{name}_{z}", z, 12.7, 1.9, y, (0, 0), "Stahl_blank" if z < 36 else "Stahl_dunkel", col, innen=18)
        radien[z] = (r, y)
        teile.append(ob)
    # Traeger hinter den grossen Ritzeln
    teile.append(ringplatte(name + "_Traeger", kreise_umriss([(0, 0, 70)], n=48), (0, 0), 18, y_klein + 11 * abstand - 2.75,
                            y_klein + 11 * abstand - 1.15, "Stahl_dunkel", col, fase=0.3))   # zwischen 42er und 52er
    k = verbinden(name, teile)
    k.location = mitte
    return k, radien


# ================================================================ Kette
def riemen_pfad(kreise):
    """Geschlossener Pfad um Kreise [(cx, cz, r, dreh)], dreh +1 = gegen Uhrzeigersinn umschlungen.
    Liefert Punkte (x, z) in mm."""
    def tangente(c1, c2):
        (x1, z1, r1, d1), (x2, z2, r2, d2) = c1, c2
        # Punkte auf den Kreisen, an denen die gemeinsame Tangente beruehrt
        dx, dz = x2 - x1, z2 - z1
        L = math.hypot(dx, dz)
        ra, rb = r1 * d1, r2 * d2           # vorzeichenbehaftete Radien
        # Tangente: Normale n mit n.(c2-c1) = ra - rb
        c = (ra - rb) / L
        c = max(-1, min(1, c))
        w = math.atan2(dz, dx)
        a = math.acos(c)
        for ww in (w + a, w - a):
            n = (math.cos(ww), math.sin(ww))
            p1 = (x1 + n[0] * ra, z1 + n[1] * ra)
            p2 = (x2 + n[0] * rb, z2 + n[1] * rb)
            # Laufrichtung p1->p2 muss zur Umschlingungsrichtung passen
            t = (p2[0] - p1[0], p2[1] - p1[1])
            kreuz = (p1[0] - x1) * t[1] - (p1[1] - z1) * t[0]
            if (kreuz > 0) == (d1 > 0):
                return p1, p2
        return p1, p2

    tang = [tangente(kreise[i], kreise[(i + 1) % len(kreise)]) for i in range(len(kreise))]
    pfad = []
    for i, (x, z, r, d) in enumerate(kreise):
        ein = tang[i - 1][1]
        aus = tang[i][0]
        w0 = math.atan2(ein[1] - z, ein[0] - x)
        w1 = math.atan2(aus[1] - z, aus[0] - x)
        if d > 0:
            while w1 < w0:
                w1 += 2 * math.pi
        else:
            while w1 > w0:
                w1 -= 2 * math.pi
        m = max(2, int(abs(w1 - w0) * r / 3))
        for k in range(m + 1):
            ww = w0 + (w1 - w0) * k / m
            pfad.append((x + r * math.cos(ww), z + r * math.sin(ww)))
    return pfad


def kette(name, kreise, y_von, y_bis, z0, col, gruppen=None, zuordnung=None):
    """Kette mit Teilung 12,7 mm entlang des Pfads. y laeuft vom Kettenblatt (y_von) zum Ritzel (y_bis).
    gruppen: Namen von Vertex-Gruppen (Knochen eines Skeletts), zuordnung(x, z) -> Index: jedes Glied haengt
    ganz an einem Knochen."""
    import bpy
    pfad = riemen_pfad(kreise)
    # Laengen
    seg = [math.hypot(pfad[i + 1][0] - pfad[i][0], pfad[i + 1][1] - pfad[i][1]) for i in range(len(pfad) - 1)]
    gesamt = sum(seg)
    n = max(10, round(gesamt / 12.7))
    teil = gesamt / n
    pkt = []
    s, i, acc = 0.0, 0, 0.0
    for k in range(n):
        ziel = k * teil
        while i < len(seg) - 1 and acc + seg[i] < ziel:
            acc += seg[i]
            i += 1
        f = (ziel - acc) / seg[i] if seg[i] else 0
        pkt.append((pfad[i][0] + (pfad[i + 1][0] - pfad[i][0]) * f, pfad[i][1] + (pfad[i + 1][1] - pfad[i][1]) * f))
    bm = bmesh.new()

    def y_bei(x):
        f = max(0.0, min(1.0, -x / 435.0))
        return y_von + (y_bis - y_von) * f
    dl = bm.verts.layers.deform.verify()
    for k in range(n):
        n0 = len(bm.verts)
        a, b = pkt[k], pkt[(k + 1) % n]
        y = y_bei((a[0] + b[0]) / 2)
        A = Vector((a[0] * MM, y * MM, (a[1] + z0) * MM))
        B = Vector((b[0] * MM, y * MM, (b[1] + z0) * MM))
        # Rolle
        r = zyl("tmp", A + Vector((0, -3.0 * MM, 0)), A + Vector((0, 3.0 * MM, 0)), 3.6, None, None, n=10, bm_rueck=True)
        me = bpy.data.meshes.new("tmp"); r.to_mesh(me); r.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
        # Laschen (aussen/innen abwechselnd)
        dy = 4.6 if k % 2 == 0 else 3.4
        for sy in (-1, 1):
            d = (B - A)
            mitte = (A + B) / 2 + Vector((0, sy * dy * MM, 0))
            geo = bmesh.ops.create_cube(bm, size=1.0)
            bmesh.ops.scale(bm, verts=geo["verts"], vec=Vector(((12.7 + 6.5) * MM, 1.0 * MM, 7.2 * MM)))
            w = math.atan2(d.z, d.x)
            bmesh.ops.rotate(bm, verts=geo["verts"], cent=Vector(), matrix=Matrix.Rotation(-w, 3, "Y"))
            bmesh.ops.translate(bm, verts=geo["verts"], vec=mitte)
        if gruppen:
            gi = zuordnung((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
            bm.verts.ensure_lookup_table()
            for vi in range(n0, len(bm.verts)):
                bm.verts[vi][dl][gi] = 1.0
    ob = fertig(name, bm, "Stahl_dunkel", col, glatt=True, winkel=40)
    for g in (gruppen or []):
        ob.vertex_groups.new(name=g)
    return ob, pfad


# ================================================================ Gabel
class Gabelmass:
    standrohr_r = 19.0        # 38-mm-Standrohre
    tauchrohr_r = 24.5
    abstand_y = 78.0          # halber Abstand der Rohre (Tauchrohr innen bei 53,5: Bremsscheibe bei 46 frei)
    federweg = 180.0
    offen = 196.0             # freies Standrohr unbelastet (Federweg + Rest)


def gabel(cols, ht_u, achse_dir, vor_dir, achslaenge, versatz, fa_mitte):
    """Gabel 180 mm, 29": Krone und Standrohre (fest am Steuerrohr), Tauchrohre mit Bruecke und Achse (federn).
    ht_u: unteres Steuerrohrende (m), achse_dir: Lenkachse nach unten, vor_dir: in der Ebene nach vorn."""
    G = Gabelmass
    a = achse_dir.normalized()
    q = vor_dir.normalized()
    yv = Vector((0, 1, 0))

    def P(lang, vor, y):
        return ht_u + a * (lang * MM) + q * (vor * MM) + yv * (y * MM)
    fest, beweglich = [], []
    col_f, col_b = cols
    # Steuerrohr der Gabel (oben sichtbar ueber dem Vorbau) und Krone
    # Krone von 2 bis 28 mm unter dem Steuerrohr: bei vollem Federweg bleiben gut 13 mm bis zum Reifen
    krone_o, krone_l = 2.0, 26.0
    umriss = kreise_umriss([(0, 0, 21), (versatz, -G.abstand_y, 27), (versatz, G.abstand_y, 27)], n=36)
    # Krone: Ebene senkrecht zur Lenkachse, Koordinaten (vor, y)
    ebene = (ht_u + a * (krone_o * MM), q, yv, a)
    fest.append(platte("Gabel_Krone", umriss, 0, krone_l, "Alu_schwarz_eloxiert", col_f, fase=3.0, ebene=ebene))
    for s in (-1, 1):
        fest.append(zyl(f"Gabel_Standrohr_{'R' if s < 0 else 'L'}", P(krone_o + 4, versatz, s * G.abstand_y),
                        P(krone_o + krone_l + G.offen + 70, versatz, s * G.abstand_y), G.standrohr_r, "Standrohr", col_f, n=40))
        # Deckel oben: Luftkappe links, Druckstufe rechts
        fest.append(zyl(f"Gabel_Kappe_{'R' if s < 0 else 'L'}", P(krone_o - 6, versatz, s * G.abstand_y), P(krone_o + 4, versatz, s * G.abstand_y),
                        14.5, "Alu_schwarz_eloxiert", col_f, n=32))
    # Tauchrohre ab der Dichtung
    dicht = krone_o + krone_l + G.offen
    for s in (-1, 1):
        seite = 'R' if s < 0 else 'L'
        beweglich.append(zyl(f"Gabel_Abstreifer_{seite}", P(dicht - 4, versatz, s * G.abstand_y), P(dicht + 9, versatz, s * G.abstand_y),
                             G.standrohr_r + 3.2, "Kunststoff_schwarz", col_b, n=40, r2=G.tauchrohr_r))
        beweglich.append(rohr(f"Gabel_Tauchrohr_{seite}", [P(dicht + 8, versatz, s * G.abstand_y), P(dicht + 150, versatz, s * G.abstand_y),
                                                           P(achslaenge - 14, versatz - 1, s * G.abstand_y), P(achslaenge + 16, versatz - 3, s * G.abstand_y)],
                              [2 * G.tauchrohr_r, 2 * G.tauchrohr_r - 1, 2 * G.tauchrohr_r - 6, 34],
                              [2 * G.tauchrohr_r, 2 * G.tauchrohr_r - 1, 2 * G.tauchrohr_r - 6, 40], "Gabel_Lack", col_b, n=36,
                              seite=Vector((0, 1, 0))))
    # Bruecke vor dem Reifen (Abstand zum Reifen > 15 mm)
    # Bruecke: vom oberen Ende der Tauchrohre nach vorn oben, in der Mitte vor und ueber dem Reifen (> 13 mm frei)
    # flach und breit oben an den Tauchrohren angesetzt, in der Mitte vor und ueber dem Reifen (> 9 mm frei)
    bruecke = [P(dicht + 12, versatz + 10, -G.abstand_y + 2), P(dicht - 8, versatz + 50, -50), P(dicht - 16, versatz + 76, 0),
               P(dicht - 8, versatz + 50, 50), P(dicht + 12, versatz + 10, G.abstand_y - 2)]
    beweglich.append(rohr("Gabel_Bruecke", bruecke, [44, 34, 28, 34, 44], [34, 28, 24, 28, 34], "Gabel_Lack", col_b,
                          n=24, seite=a))
    # Steckachse 15x110 mit Hebel auf der Nicht-Antriebsseite
    ya = G.abstand_y + G.tauchrohr_r + 1
    beweglich.append(zyl("Gabel_Steckachse", fa_mitte + Vector((0, -ya * MM, 0)), fa_mitte + Vector((0, ya * MM, 0)), 9, "Alu_schwarz_eloxiert", col_b, n=24))
    beweglich.append(platte("Gabel_Achshebel", kreise_umriss([(0, 0, 9), (-46, 10, 6)], n=18), ya, ya + 6, "Alu_schwarz_eloxiert", col_b,
                            fase=1.0, ebene=(fa_mitte, Vector((1, 0, 0)), Vector((0, 0, 1)), Vector((0, 1, 0)))))
    # Bremsaufnahme hinten am linken Tauchrohr
    ba = fa_mitte + Vector((0, 50 * MM, 0))
    beweglich.append(platte("Gabel_Bremsaufnahme", kreise_umriss([(-30, 30, 10), (-62, -6, 10), (-8, 8, 12)], n=16), 49, 58,
                            "Gabel_Lack", col_b, fase=1.0, ebene=(fa_mitte, Vector((1, 0, 0)), Vector((0, 0, 1)), Vector((0, 1, 0)))))
    return fest, beweglich


# ================================================================ Daempfer
def daempfer(col_oben, col_unten, col_feder, oben, unten, el=230.0):
    """Stahlfeder-Daempfer 230x65 (ohne Ausgleichsbehaelter, allgemeine Bauform). Oben: Koerper, unten: Kolbenstange und Federteller.
    Gebaut entlang z (0 = unteres Auge, el = oberes Auge) und dann ausgerichtet."""
    teile_o, teile_u = [], []

    def Z(z, x=0.0, y=0.0):
        return Vector((x * MM, y * MM, z * MM))
    # oberes Auge (quer, entlang y) und Kopf
    teile_o.append(zyl("Daempfer_Auge_oben", Z(el, 0, -11), Z(el, 0, 11), 11, "Alu_schwarz_eloxiert", col_oben, n=24))
    teile_o.append(zyl("Daempfer_Hals", Z(el - 6), Z(el - 18), 9.5, "Alu_schwarz_eloxiert", col_oben, n=24))
    teile_o.append(zyl("Daempfer_Kopf", Z(el - 16), Z(el - 50), 23, "Alu_schwarz_eloxiert", col_oben, n=40, r2=21))
    # Einsteller (Druckstufe) seitlich am Kopf
    teile_o.append(zyl("Daempfer_Einsteller", Z(el - 33, 0, -22), Z(el - 33, 0, -29), 9, "Stahl_dunkel", col_oben, n=20))
    teile_o.append(zyl("Daempfer_Koerper", Z(el - 48), Z(el - 140), 18.5, "Alu_schwarz_eloxiert", col_oben, n=40))
    teile_o.append(zyl("Daempfer_Vorspannring", Z(el - 52), Z(el - 60), 25, "Stahl_dunkel", col_oben, n=36))
    # Kolbenstange und unteres Auge (bewegen sich mit dem unteren Hebel)
    teile_u.append(zyl("Daempfer_Kolbenstange", Z(14), Z(el - 100), 7.5, "Kolbenstange", col_unten, n=24))
    teile_u.append(zyl("Daempfer_Anschlag", Z(26), Z(40), 14, "Kunststoff_schwarz", col_unten, n=24))
    teile_u.append(zyl("Daempfer_Auge_unten", Z(0, 0, -11), Z(0, 0, 11), 11, "Alu_schwarz_eloxiert", col_unten, n=24))
    teile_u.append(zyl("Daempfer_Fuss", Z(0), Z(26), 12, "Alu_schwarz_eloxiert", col_unten, n=24))
    teile_u.append(zyl("Daempfer_Federteller", Z(22), Z(28), 27, "Stahl_dunkel", col_unten, n=36))
    # Feder als Wendel zwischen Federteller (z 28) und Vorspannring (z el-60), mittlerer Radius 24, Draht 9 mm,
    # 6,5 Windungen: Blockmass 58,5 mm < kuerzeste Einbaulaenge bei vollem Hub (gut 70 mm)
    import bpy
    w, z0, z1 = 6.5, 28 + 4.5, el - 60 - 4.5
    pts = []
    for k in range(int(w * 24) + 1):
        t = k / (w * 24)
        ang = 2 * math.pi * w * t
        pts.append(Z(z0 + (z1 - z0) * t, 24 * math.cos(ang), 24 * math.sin(ang)))
    feder = rohr("Daempfer_Feder", pts, 9, 9, "Feder", col_feder, n=10, seite=Vector((0, 0, 1)), schritte=1)
    return teile_o, teile_u, feder


# ================================================================ Cockpit und Sitz
def lenker(col, mitte, achse, vor, breite=800, rise=30, back=8, up=5, klemme=35):
    """Lenker 800 mm, 30 mm Rise, 8 Grad Kroepfung nach hinten, 5 Grad nach oben."""
    yv = Vector((0, 1, 0))
    oben = -achse.normalized()          # Lenkachse nach oben
    hinten = -vor.normalized()
    pts = []
    halb = breite / 2
    for y in (-halb, -halb + 120, -150, -95, -50, 0, 50, 95, 150, halb - 120, halb):
        s = abs(y)
        rr = 0 if s <= 50 else min(1.0, (s - 50) / 90) * rise
        aus = max(0.0, s - 150)
        hh = aus * math.tan(math.radians(back))
        uu = aus * math.tan(math.radians(up))
        pts.append(mitte + yv * (y * MM) + oben * ((rr + uu) * MM) + hinten * (hh * MM))
    breiten = [22.2, 22.2, 22.2, 28, 35, 35, 35, 28, 22.2, 22.2, 22.2]
    l = rohr("Lenker", pts, breiten, breiten, "Alu_schwarz_eloxiert", col, n=28, seite=vor, schritte=8)
    return l, pts


def sattel(col, spitze, hinten_pkt, oben):
    """Sattel: Schale aus Querschnitten (Laenge ~270, hinten 140 breit), Polster, zwei Streben."""
    import bpy
    bm = bmesh.new()
    L = (spitze - hinten_pkt).length / MM
    ex = (spitze - hinten_pkt).normalized()
    ez = oben.normalized()
    ey = ez.cross(ex).normalized()
    stationen = 18
    n = 20
    ringe = []
    for i in range(stationen + 1):
        t = i / stationen
        x = t * L
        # Breite: hinten breit, zur Nase schmal
        b = 70 * (1 - t) ** 0.6 * (1 - 0.15 * t) + 18 * t
        if t < 0.08:
            b *= 0.85 + t * 1.8
        h = 22 + 10 * math.sin(math.pi * min(1, t * 1.3)) - 8 * t
        anstieg = 10 * (1 - t) ** 3     # Heck leicht hochgezogen
        ring = []
        for j in range(n):
            w = 2 * math.pi * j / n
            yy = b * math.cos(w)
            zz = (h * 0.55 * math.sin(w) if math.sin(w) > 0 else h * 0.2 * math.sin(w)) + anstieg
            ring.append(bm.verts.new(hinten_pkt + ex * (x * MM) + ey * (yy * MM) + ez * (zz * MM)))
        ringe.append(ring)
    for r0, r1 in zip(ringe, ringe[1:]):
        for j in range(n):
            bm.faces.new((r0[j], r0[(j + 1) % n], r1[(j + 1) % n], r1[j]))
    for ring, umk in ((ringe[0], True), (ringe[-1], False)):
        c = bm.verts.new(sum((q.co for q in ring), Vector()) / n)
        for j in range(n):
            bm.faces.new((ring[j], ring[(j + 1) % n], c) if umk else (ring[(j + 1) % n], ring[j], c))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    s = fertig("Sattel", bm, "Sattel", col)
    sub = s.modifiers.new("Glaetten", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2
    return s
