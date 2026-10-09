"""Hauptrahmen, Hinterbau und PRO10-Hebel des Beispielrads.
Punkte der Seitenebene (x, z) in mm, Tretlager im Ursprung; y quer (+ = links)."""
import math
from mathutils import Vector, Matrix
from werkzeug import MM, rohr, zyl, platte, kreise_umriss, verbinden


def P(p, y=0.0, z0=0.0):
    """Seitenebene -> 3D (m). z0: Hoehe des Tretlagers ueber dem Boden in mm."""
    return Vector((p[0] * MM, y * MM, (p[1] + z0) * MM))


def platte_z(z0, *a, **k):
    """Platte wie werkzeug.platte, aber auf Tretlagerhoehe z0 (mm) angehoben."""
    ob = platte(*a, **k)
    ob.data.transform(Matrix.Translation(Vector((0, 0, z0 * MM))))
    return ob


def naht(name, mitte, richtung, r, col, mat="Lack_Rahmen", r_naht=1.6):
    """Dezente Schweissnaht: Ring um ein Rohr (Mittelpunkt, Rohrrichtung, Rohrradius in mm)."""
    d = richtung.normalized()
    a = d.cross(Vector((0, 1, 0)))
    if a.length < 1e-4:
        a = d.cross(Vector((1, 0, 0)))
    a.normalize()
    b = d.cross(a).normalized()
    pts = []
    for i in range(41):
        w = 2 * math.pi * i / 40
        pts.append(mitte + (a * math.cos(w) + b * math.sin(w)) * ((r + 0.4) * MM))
    return rohr(name, pts, 2 * r_naht, 2 * r_naht, mat, col, n=8, seite=d, schritte=2, kappen=False)


def hauptrahmen(g, col, z0):
    """g: Geometrie-Modul mit HT_O, HT_U, DIR_LENK, SITZ_DIR, SR_O und Lagerpunkten."""
    teile = []
    d = Vector((g.DIR_LENK[0], 0, g.DIR_LENK[1]))     # Lenkachse nach unten
    sd = Vector((g.SITZ_DIR[0], 0, g.SITZ_DIR[1]))    # Sitzrohr nach oben
    hto, htu = P(g.HT_O, 0, z0), P(g.HT_U, 0, z0)
    # Steuerrohr (konisch, 56/62 mm aussen)
    teile.append(zyl("Steuerrohr", hto - d * (4 * MM), htu + d * (3 * MM), 28.5, "Lack_Rahmen", col, n=48, r2=31.5))
    # Oberrohr: hydrogeformt, oval, leicht nach unten gewoelbt
    t_u = g.U_RAHMEN[0] * g.SITZ_DIR[0] + g.U_RAHMEN[1] * g.SITZ_DIR[1]
    t_ob = min(g.SITZROHR - 40, max(t_u + 70, 330))
    tt0 = hto + d * (30 * MM)
    tt2 = P(g.st(t_ob), 0, z0)
    tt1 = tt0.lerp(tt2, 0.5) + Vector((0, 0, -9 * MM))
    teile.append(rohr("Oberrohr", [tt0 + (tt0 - tt2).normalized() * (10 * MM), tt1, tt2], [46, 40, 34], [40, 36, 34], "Lack_Rahmen", col, n=28))
    # Unterrohr: gross und oval, unten breiter und flacher
    dt0 = htu - d * (28 * MM)
    dt2 = P((40, 28), 0, z0)
    dt1 = dt0.lerp(dt2, 0.55) + (dt0 - dt2).normalized().cross(Vector((0, 1, 0))) * (-6 * MM)
    teile.append(rohr("Unterrohr", [dt0 + (dt0 - dt2).normalized() * (12 * MM), dt1, dt2], [60, 62, 66], [58, 55, 48], "Lack_Rahmen", col, n=32))
    # Sitzrohr 34,9 (aussen 39) mit Klemme
    st0 = P(g.st(8), 0, z0)
    st1 = P(g.st(g.SITZROHR), 0, z0)
    teile.append(zyl("Sitzrohr", st0, st1, 19.5, "Lack_Rahmen", col, n=40))
    teile.append(zyl("Sattelklemme", st1 - sd * (16 * MM), st1 + sd * (2 * MM), 21.5, "Alu_schwarz_eloxiert", col, n=40))
    # Tretlagergehaeuse BSA 73
    bb = P((0, 0), 0, z0)
    teile.append(zyl("Tretlagergehaeuse", bb + Vector((0, -36.5 * MM, 0)), bb + Vector((0, 36.5 * MM, 0)), 22.5, "Lack_Rahmen", col, n=40))
    # Aufnahme oberer Hebel: Querrohr am Sitzrohr + Knotenblech
    ur = P(g.U_RAHMEN, 0, z0)
    teile.append(zyl("Lageraufnahme_oben", ur + Vector((0, -25.5 * MM, 0)), ur + Vector((0, 25.5 * MM, 0)), 12.5, "Lack_Rahmen", col, n=32))
    t_naechst = g.U_RAHMEN[0] * g.SITZ_DIR[0] + g.U_RAHMEN[1] * g.SITZ_DIR[1]
    sp = g.st(t_naechst)
    teile.append(platte_z(z0, "Knotenblech_oben", kreise_umriss([(g.U_RAHMEN[0], g.U_RAHMEN[1], 13), (sp[0], sp[1], 16),
                                                           (g.st(t_naechst + 34)[0], g.st(t_naechst + 34)[1], 14)]), -14, 14, "Lack_Rahmen", col, fase=1.5))
    # Aufnahme unterer Hebel: Lagerauge auf einem Steg, der vom Unterrohr aufsteigt (dort ist der Weg frei vom Daempfer)
    lr = P(g.L_RAHMEN, 0, z0)
    teile.append(zyl("Lageraufnahme_unten", lr + Vector((0, -21.5 * MM, 0)), lr + Vector((0, 21.5 * MM, 0)), 11.5, "Lack_Rahmen", col, n=32))
    a_, e_ = (40.0, 28.0), (g.HT_U[0] - 28 * g.DIR_LENK[0], g.HT_U[1] - 28 * g.DIR_LENK[1])
    d_ = (e_[0] - a_[0], e_[1] - a_[1]); t_ = ((g.L_RAHMEN[0] - a_[0]) * d_[0] + (g.L_RAHMEN[1] - a_[1]) * d_[1]) / (d_[0] ** 2 + d_[1] ** 2)
    fuss = (a_[0] + d_[0] * t_, a_[1] + d_[1] * t_)
    teile.append(platte_z(z0, "Steg_Hebel_unten", kreise_umriss([(g.L_RAHMEN[0], g.L_RAHMEN[1], 11.5), (fuss[0] - 10, fuss[1] + 8, 16), (fuss[0] + 12, fuss[1] - 6, 16)]),
                          -15, 15, "Lack_Rahmen", col, fase=1.5))
    # Schweissnaehte
    teile.append(naht("Naht_Ober_Steuer", tt0 + (tt2 - tt0).normalized() * (29 * MM), tt2 - tt0, 22, col))
    teile.append(naht("Naht_Unter_Steuer", dt0 + (dt2 - dt0).normalized() * (33 * MM), dt2 - dt0, 30, col))
    teile.append(naht("Naht_Ober_Sitz", tt2 - (tt2 - tt0).normalized() * (21 * MM), tt2 - tt0, 18, col))
    teile.append(naht("Naht_Sitz_Tretlager", P(g.st(26), 0, z0), sd, 19.5, col))
    teile.append(naht("Naht_Unter_Tretlager", dt2 + (dt0 - dt2).normalized() * (34 * MM), dt0 - dt2, 29, col))
    # Zugeinlaesse am Steuerrohr (beide Seiten)
    for s in (-1, 1):
        m = hto.lerp(htu, 0.42)
        teile.append(zyl(f"Zugeinlass_{'R' if s < 0 else 'L'}", m + Vector((0, s * 27 * MM, 0)), m + Vector((0, s * 31.5 * MM, 0)),
                         6.5, "Kunststoff_schwarz", col, n=20))
    rahmen = verbinden("Rahmen_Hauptrahmen", teile)
    return rahmen, dict(tt=(tt0, tt1, tt2), dt=(dt0, dt1, dt2))


def hinterbau(g, col, z0, rh):
    """Einteiliger Hinterbau: Ketten- und Sitzstreben, Ausfallenden, Steckachse, Bremsaufnahme.
    rh: Reifenradius hinten (fuer die Strebenbruecke)."""
    teile = []
    ra = g.RA
    for s in (-1, 1):
        sei = 'R' if s < 0 else 'L'
        # Kettenstrebe: von der Achse (y +-72) zum unteren Hebel (y +-35), innerhalb der Kettenschlaufe
        # beginnt am Ausfallende ausserhalb von Kassette/Bremsscheibe, bleibt bis 125 mm vor der Achse aussen,
        # ist in der Mitte flach und abgesenkt (die Kette laeuft beim Einfedern darueber) und fuehrt vorn
        # aussen am Reifen vorbei, erst vor dem Reifen nach innen zum Lager
        a = P((ra[0] + 28, ra[1] + 2), s * 78, z0)
        d_ = (g.L_HINTEN[0] - ra[0], g.L_HINTEN[1] - ra[1]); l_ = math.hypot(*d_)
        b = P((ra[0] + d_[0] * 125 / l_, ra[1] + d_[1] * 125 / l_), s * 75, z0)
        m = P((ra[0] + d_[0] * 0.55, ra[1] + d_[1] * 0.55 - 3), s * 62, z0)
        xr = ra[0] + rh                                     # Vorderkante des Reifens
        def auf_linie(x, dz):
            t_ = (x - ra[0]) / d_[0]
            return (x, ra[1] + d_[1] * t_ + dz)
        n_ = P(auf_linie(xr - 22, -1), s * 48, z0)
        o_ = P(auf_linie(xr + 7, 0), s * 43, z0)
        e = P(g.L_HINTEN, s * 36, z0)          # aussen an den Laschen des unteren Hebels (|y| 22-28)
        teile.append(rohr(f"Kettenstrebe_{sei}", [a, b, m, n_, o_, e], [16, 18, 18, 14, 12, 12], [22, 22, 22, 24, 26, 28], "Lack_Rahmen", col, n=24))
        # Sitzstrebe: von der Achse zum oberen Hebel (y +-33)
        a2 = P((ra[0] + 10, ra[1] + 28), s * 78, z0)
        d2 = (g.U_HINTEN[0] - ra[0], g.U_HINTEN[1] - ra[1]); l2 = math.hypot(*d2)
        b2 = P((ra[0] + d2[0] * 125 / l2 + 4, ra[1] + d2[1] * 125 / l2), s * 74, z0)
        m2 = P(((ra[0] + g.U_HINTEN[0]) / 2 + 6, (ra[1] + g.U_HINTEN[1]) / 2 + 8), s * 58, z0)
        e2 = P(g.U_HINTEN, s * 44, z0)         # aussen an den Laschen des oberen Hebels, ausserhalb der Reifenbreite
        teile.append(rohr(f"Sitzstrebe_{sei}", [a2, b2, m2, e2], [14, 15, 16, 14], [18, 21, 24, 26], "Lack_Rahmen", col, n=22))
        # Ausfallende
        teile.append(platte_z(z0, f"Ausfallende_{sei}", kreise_umriss([(ra[0], ra[1], 17), (ra[0] + 26, ra[1] + 4, 12), (ra[0] + 8, ra[1] + 26, 11)]),
                            s * 74 if s > 0 else -84, s * 84 if s > 0 else -74, "Lack_Rahmen", col, fase=1.5))
    # Strebenbruecke der Sitzstreben nur, wenn zwischen Sitzstreben-Lager und Reifen Platz ist (sonst verbindet die
    # durchgehende Achse am Sitzstreben-Lager beide Seiten)
    u = g.U_HINTEN
    for k in [i / 100 for i in range(8, 60, 2)]:
        p = (u[0] + (ra[0] - u[0]) * k, u[1] + (ra[1] - u[1]) * k)
        if math.hypot(p[0] - ra[0], p[1] - ra[1]) < rh + 22:
            break
        if math.hypot(p[0] - u[0], p[1] - u[1]) >= 30:
            teile.append(rohr("Strebenbruecke", [P(p, -46, z0), P((p[0] - 4, p[1] + 6), 0, z0), P(p, 46, z0)], 14, 18, "Lack_Rahmen", col, n=20,
                              seite=Vector((1, 0, 0))))
            break
    # Kettenstreben-Querverbindung hinter dem Tretlager
    lh = g.L_HINTEN
    # Lage: 34 mm vom Lager, frei von Reifen (voll eingefedert bewegt sie sich mit), Tretlager und Sitzrohr
    pk = None
    for wk in range(180, 280, 4):
        q = (lh[0] + 34 * math.cos(math.radians(wk)), lh[1] + 34 * math.sin(math.radians(wk)))
        st_ab = abs(q[0] * g.SITZ_DIR[1] - q[1] * g.SITZ_DIR[0])
        if math.hypot(q[0] - ra[0], q[1] - ra[1]) >= rh + 18 and math.hypot(*q) >= 37 and st_ab >= 34:
            pk = q
            break
    pk = pk or (lh[0] - 34, lh[1] - 3)
    teile.append(rohr("Kettenstrebenbruecke", [P(pk, -38, z0), P((pk[0] - 4, pk[1]), 0, z0), P(pk, 38, z0)], 18, 22, "Lack_Rahmen", col, n=20,
                      seite=Vector((1, 0, 0))))
    # Kettenstrebenschutz (Antriebsseite): liegt oben auf der Strebe, endet vor dem Reifen-Engpass
    d_ = (g.L_HINTEN[0] - ra[0], g.L_HINTEN[1] - ra[1]); l_ = math.hypot(*d_)
    def entlang(mm, dz):
        return (ra[0] + d_[0] * mm / l_, ra[1] + d_[1] * mm / l_ + dz)
    a = P(entlang(70, 12), -76, z0)
    m_ = P(entlang(0.55 * l_, 9), -62, z0)
    e = P(entlang(l_ - (g.L_HINTEN[0] - (ra[0] + rh - 30)) * l_ / d_[0], 10), -51, z0)
    teile.append(rohr("Kettenstrebenschutz", [a, m_, e], 14, 10, "Gummi", col, n=16))
    # Bremsaufnahme hinten (links, Post Mount)
    teile.append(platte_z(z0, "Bremsaufnahme_hinten", kreise_umriss([(ra[0] + 28, ra[1] + 54, 9), (ra[0] + 68, ra[1] + 30, 9), (ra[0] + 20, ra[1] + 20, 12)]),
                        64, 74, "Lack_Rahmen", col, fase=1.0))
    # Steckachse 12x148 mit Hebel links
    teile.append(zyl("Steckachse_hinten", P(ra, -86, z0), P(ra, 86, z0), 8, "Alu_schwarz_eloxiert", col, n=24))
    teile.append(platte_z(z0, "Achshebel_hinten", kreise_umriss([(ra[0], ra[1], 9), (ra[0] - 44, ra[1] + 12, 6)], n=18), 86, 92, "Alu_schwarz_eloxiert", col, fase=1.0))
    # Schaltauge (UDH) rechts
    teile.append(platte_z(z0, "Schaltauge", kreise_umriss([(ra[0], ra[1], 12), (ra[0] - 6, ra[1] - 26, 9)], n=20), -90, -84, "Alu_schwarz_eloxiert", col, fase=0.8))
    return verbinden("Hinterbau", teile)


def hebel_oben(g, col, z0):
    """Oberer Hebel: zwei Arme je Seite (Sitzrohrlager -> Sitzstreben, Sitzrohrlager -> Daempferauge), Laschen |y| 26-32."""
    teile = []
    arme = [kreise_umriss([(g.U_RAHMEN[0], g.U_RAHMEN[1], 15), (g.U_HINTEN[0], g.U_HINTEN[1], 13)], n=32),
            kreise_umriss([(g.U_RAHMEN[0], g.U_RAHMEN[1], 15), (g.D_OBEN[0], g.D_OBEN[1], 13)], n=32)]
    for s in (-1, 1):
        for k, um in enumerate(arme):
            teile.append(platte_z(z0, f"Hebel_oben_Arm{k}_{'R' if s < 0 else 'L'}", um, 26 if s > 0 else -32, 32 if s > 0 else -26,
                                  "Alu_schwarz_eloxiert", col, fase=1.6))
    # Flip-Chip am Sitzstrebenlager
    for s in (-1, 1):
        teile.append(zyl("FlipChip", P(g.U_HINTEN, s * 32, z0), P(g.U_HINTEN, s * 34, z0), 10, "Stahl_dunkel", col, n=24))
    return verbinden("Hebel_oben", teile)


def hebel_unten(g, col, z0):
    teile = []
    kreise = [(g.L_RAHMEN[0], g.L_RAHMEN[1], 13), (g.L_HINTEN[0], g.L_HINTEN[1], 13), (g.D_UNTEN[0], g.D_UNTEN[1], 13)]
    um = kreise_umriss(kreise, n=32)
    for s in (-1, 1):
        teile.append(platte_z(z0, f"Hebel_unten_Platte_{'R' if s < 0 else 'L'}", um, 22 if s > 0 else -28, 28 if s > 0 else -22,
                            "Alu_schwarz_eloxiert", col, fase=1.5))
    return verbinden("Hebel_unten", teile)


def lager(name, p, y_aussen, col, z0, r=8.5, y_innen=None):
    """Lagerbolzen mit Kopf auf beiden Seiten. y_innen: zweiteilig (je ein Stummel von y_innen bis y_aussen),
    sonst eine durchgehende Achse."""
    if y_innen is None:
        teile = [zyl(name + "_Achse", P(p, -y_aussen, z0), P(p, y_aussen, z0), 5.5, "Stahl_dunkel", col, n=16)]
    else:
        teile = [zyl(name + "_Achse", P(p, s * y_innen, z0), P(p, s * y_aussen, z0), 5.5, "Stahl_dunkel", col, n=16) for s in (-1, 1)]
    for s in (-1, 1):
        teile.append(zyl(name + "_Kopf", P(p, s * y_aussen, z0), P(p, s * (y_aussen + 3.2), z0), r, "Lager", col, n=24))
        teile.append(zyl(name + "_Innensechskant", P(p, s * (y_aussen + 3.0), z0), P(p, s * (y_aussen + 3.4), z0), 3.0, "Kunststoff_schwarz", col, n=6))
    return verbinden(name, teile)
