"""Suche der PRO10-Lagerpunkte mit harten Freigaengigkeits-Pruefungen gegen Rahmenrohre, Tretlager und Reifen.
Aufruf: python3 opt_i.py <seed> <laeufe>"""
import math, random, json, sys
import geo
from geo import add, sub, mul, ln, rot, st, RA
exec(open('suche.py').read().split('best = []')[0].split('random.seed(7)')[1])
NRM = (geo.SITZ_DIR[1], -geo.SITZ_DIR[0])
def seg_ab(p, a, b):
    d = sub(b, a); t = max(0, min(1, ((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1]) / (d[0] ** 2 + d[1] ** 2)))
    return ln(sub(p, add(a, mul(d, t))))
def seg_seg(a, b, c, d):
    return min(seg_ab(a, c, d), seg_ab(b, c, d), seg_ab(c, a, b), seg_ab(d, a, b))
# Rahmenrohre in der Seitenebene (Achse, halbe Hoehe in der Ebene)
ST = (st(8), st(geo.SITZROHR), 19.5)
DT = ((40.0, 28.0), (geo.HT_U[0] - 28 * geo.DIR_LENK[0], geo.HT_U[1] - 28 * geo.DIR_LENK[1]), 27.0)
TT0 = (geo.HT_O[0] + 30 * geo.DIR_LENK[0], geo.HT_O[1] + 30 * geo.DIR_LENK[1])
BB_R = 22.5
# Daempfer-Huelle: (s von, s bis, Radius) ab unterem Auge
HUELLE = [(0, 26, 12), (22, 28, 27), (28, 170, 28.5), (170, 178, 25), (178, 220, 23), (220, 230, 11)]
def huell_punkte(eb, et):
    u = sub(et, eb); L = ln(u); u = mul(u, 1 / L)
    pts = []
    for a, b, r in HUELLE:
        for k in range(4):
            s = a + (b - a) * k / 3
            s = s * L / 230
            pts.append((add(eb, mul(u, s)), r))
    return pts
def punkte(v):
    tu, nu, lu, au, lx, lz, ll, al, re_, ae, rb, ab = v
    UR = add(st(tu), mul(NRM, nu)); UH = add(UR, (-lu * math.cos(math.radians(au)), lu * math.sin(math.radians(au))))
    LR = (lx, lz); LH = add(LR, (ll * math.cos(math.radians(al)), ll * math.sin(math.radians(al))))
    ET = add(UR, (re_ * math.cos(math.radians(ae)), re_ * math.sin(math.radians(ae))))
    EB = add(LR, (rb * math.cos(math.radians(ab)), rb * math.sin(math.radians(ab))))
    return (UR, UH, LR, LH, ET, EB)
GRENZ = [(250, 400), (-10, 30), (45, 130), (-50, 60), (-90, 90), (-30, 160), (25, 120), (-180, 180), (8, 80), (-90, 90), (8, 130), (-180, 180)]
def frei(f, wert, soll, gew=400):
    return f + max(0, soll - wert) ** 2 * gew
def tt_achse(UR):
    t_u = UR[0] * geo.SITZ_DIR[0] + UR[1] * geo.SITZ_DIR[1]
    t_ob = min(geo.SITZROHR - 40, max(t_u + 70, 330))
    return (TT0, st(t_ob))
def pruef_lage(f, P, eb, et, ur, uh_link_pts, lr_tri):
    """Freigaenge einer Pose (Rahmen fest; Daempfer- und Hebelpunkte in dieser Pose)."""
    tt = tt_achse(P[0])
    for p, r in huell_punkte(eb, et):
        f = frei(f, seg_ab(p, ST[0], ST[1]) - ST[2] - r, 3)
        f = frei(f, seg_ab(p, DT[0], DT[1]) - DT[2] - r, 3)
        f = frei(f, ln(p) - BB_R - r, 3)
        f = frei(f, seg_ab(p, tt[0], tt[1]) - 18 - r, 3)
    # oberer Hebel (Laschen |y| 26-32): frei von der Feder (Radius 28,5 > 26) zwischen 28 und 170 mm ueber dem unteren Auge
    u = sub(et, eb); L = ln(u); u = mul(u, 1 / L)
    fa, fb = add(eb, mul(u, 28 * L / 230)), add(eb, mul(u, 170 * L / 230))
    for a, b in uh_link_pts:
        f = frei(f, seg_seg(a, b, fa, fb) - 28.5 - 14, 2)
    # oberer Hebel: frei vom Oberrohr und Unterrohr
    for a, b in uh_link_pts:
        f = frei(f, seg_seg(a, b, tt[0], tt[1]) - 18 - 14, 2)
        f = frei(f, seg_seg(a, b, DT[0], DT[1]) - DT[2] - 14, 2)
    # unterer Hebel (Dreieck LR-LH-EB, Laschen |y| 30-36, ausserhalb aller Daempferradien): frei von Tretlagergehaeuse und Unterrohr
    for a, b in lr_tri:
        f = frei(f, seg_ab((0, 0), a, b) - BB_R - 13, 2)
        f = frei(f, seg_seg(a, b, DT[0], DT[1]) - DT[2] - 13, 2)
    return f
def ziel(v, info=False):
    for x, (a, b) in zip(v, GRENZ):
        if x < a or x > b: return 1e9
    P = punkte(v); UR, UH, LR, LH, ET, EB = P
    L0 = ln(sub(ET, EB)); w = math.degrees(math.atan2(ET[1] - EB[1], ET[0] - EB[0]))
    f = (L0 - 230) ** 2 * 200 + (w - 95) ** 2 * 1.0 + max(0, abs(w - 95) - 10) ** 2 * 50
    # Kettenstreben-Lager: Abstand zur Achse fuer die Strebenbruecke, frei vom Tretlager und Unterrohr
    f = frei(f, ln(sub(LH, RA)), 410)
    f = frei(f, ln(LH), BB_R + 17)
    f = frei(f, seg_ab(LH, DT[0], DT[1]) - DT[2] - 16, 2)
    def unter_kette(p, rand, ra=RA):
        zk = 68 + (ra[1] + 20 - 68) * (-p[0]) / (-ra[0]) if p[0] < 0 else 68
        return max(0, p[1] - (zk - rand))
    f += unter_kette(LH, 24) ** 2 * 60
    r = loese(P, -0.01)
    if not r: return 1e8
    if r['psi'] <= 0: f += 5e4 * (1 + abs(r['psi']) * 100)
    if r['et'][1] >= ET[1]: f += 2e4
    if r['eb'][1] <= EB[1]: f += 2e4
    b = bewerte(P)
    if not b: return f + 1e6
    fw, dx, phiE, dxm, rr = b
    f += (fw - 180) ** 2 * 20 + (dx + 8) ** 2 * 0.3 + (dxm + 10) ** 2 * 0.2
    # Freigaenge in Ruhe und voll eingefedert
    for q, ph in ((None, 0.0), (rr, phiE)):
        if q is None:
            ur, et, eb, D = UR, ET, EB, LH
        else:
            et, eb, D = q['et'], q['eb'], q['D']
        ue = rot(UH, UR, ph) if q is not None else UH
        f = pruef_lage(f, P, eb, et, UR, [(UR, ue), (UR, et)], [(LR, D), (LR, eb), (D, eb)])
    # Reifen voll eingefedert (R + Freigang 8): Sitzrohr, Hebel-Lager am Rahmen, Daempfer, Tretlager
    ax = rr['ax']; R = geo.R_HINTEN
    f = frei(f, seg_ab(ax, ST[0], ST[1]) - ST[2] - R, 8)
    f = frei(f, ln(sub(ax, UR)) - 14 - R, 8)
    f = frei(f, seg_ab(ax, UR, rr['et']) - 14 - R, 8)
    f = frei(f, ln(sub(ax, LR)) - 13 - R, 8)
    f = frei(f, ln(sub(ax, rr['eb'])) - 13 - R, 8)
    f = frei(f, ln(ax) - BB_R - R, 8)
    for p, rad in huell_punkte(rr['eb'], rr['et']):
        f = frei(f, ln(sub(ax, p)) - rad - R, 8)
    # Kennlinie
    def phi_hub(h):
        lo, hi = 0.0, phiE
        for _ in range(22):
            m = (lo + hi) / 2; q = loese(P, m)
            if q and L0 - q['L'] >= h: hi = m
            else: lo = m
        return loese(P, hi)
    a10, a55 = phi_hub(10), phi_hub(55)
    if not a10 or not a55: return f + 1e6
    ue0 = (a10['ax'][1] - RA[1]) / 10; ue1 = (fw - (a55['ax'][1] - RA[1])) / 10
    prog = (ue0 - ue1) / ue0
    f += max(0, 0.05 - prog) ** 2 * 3000 + (prog - 0.2) ** 2 * 300
    f += max(0, abs(math.degrees(phiE)) - 40) ** 2 * 20 + max(0, abs(math.degrees(rr['psi'])) - 40) ** 2 * 20
    if info: return f, fw, dx, dxm, math.degrees(phiE), math.degrees(rr['psi']), L0, w, prog, ue0, ue1
    return f
if __name__ == '__main__':
    SEED = int(sys.argv[1]); LAEUFE = int(sys.argv[2]); random.seed(SEED)
    besten = []
    for lauf in range(LAEUFE):
        for _ in range(200000):
            v = [random.uniform(a, b) for a, b in GRENZ]
            if ziel(v) < 1e6: break
        f = ziel(v); schritt = [(b - a) * 0.08 for a, b in GRENZ]
        for it in range(4000):
            k = random.randrange(len(v)); w2 = list(v); w2[k] += random.gauss(0, schritt[k])
            f2 = ziel(w2)
            if f2 < f: v, f = w2, f2
            if it % 1000 == 999: schritt = [s * 0.5 for s in schritt]
        besten.append((f, v))
    besten.sort(key=lambda x: x[0])
    for f, v in besten[:4]:
        print(round(f, 1), [round(x, 2) for x in ziel(v, True)[1:]])
        print('   ', json.dumps([[round(c, 1) for c in p] for p in punkte(v)]))
    json.dump([[f, v] for f, v in besten[:6]], open('lager_i%d.json' % SEED, 'w'))
