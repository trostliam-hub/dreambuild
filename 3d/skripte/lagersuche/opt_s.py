"""PRO10-Lagerpunkte: Daempfer zuerst in den freien Raum vor dem Sitzrohr legen, dann Hebel suchen.
Kinematik wird schrittweise verfolgt (kein Springen zwischen den zwei Loesungen des Viergelenks).
Aufruf: python3 opt_j.py <seed> <laeufe>"""
import math, random, json, sys
import geo
from geo import add, sub, mul, ln, rot, st, RA
exec(open('opt_i.py').read().split("def punkte(v):")[0].split("exec(open('suche.py')")[0])
exec("def seg_ab" + open('opt_i.py').read().split("def seg_ab")[1].split("def punkte(v):")[0])
exec("def tt_achse" + open('opt_i.py').read().split("def tt_achse")[1].split("def ziel(")[0])
def frei(f, wert, soll, gew=400):
    return f + max(0, soll - wert) ** 2 * gew
def punkte(v):
    ex, ez, w, re_, ae, lu, au, lrx, lrz, ll, al = v
    ET = (ex, ez); EB = (ex - 230 * math.cos(math.radians(w)), ez - 230 * math.sin(math.radians(w)))
    UR = add(ET, (re_ * math.cos(math.radians(ae)), re_ * math.sin(math.radians(ae))))
    UH = add(UR, (lu * math.cos(math.radians(au)), lu * math.sin(math.radians(au))))
    LR = (lrx, lrz)
    LH = add(LR, (ll * math.cos(math.radians(al)), ll * math.sin(math.radians(al))))
    return (UR, UH, LR, LH, ET, EB)
GRENZ = [(0, 60), (290, 370), (84, 108), (30, 110), (120, 240), (45, 140), (60, 240), (-90, 90), (-20, 200), (25, 130), (-180, 180)]
def schritt(P, phi, D_alt):
    UR, UH, LR, LH, ET, EB = P
    C = rot(UH, UR, phi)
    r1, r2 = ln(sub(LH, LR)), ln(sub(LH, UH))
    d = ln(sub(C, LR))
    if d < 1e-6: return None
    a = (r1 * r1 - r2 * r2 + d * d) / (2 * d); h2 = r1 * r1 - a * a
    if h2 < 0: return None
    h = math.sqrt(h2); e = mul(sub(C, LR), 1 / d); m = add(LR, mul(e, a))
    k1, k2 = add(m, mul((-e[1], e[0]), h)), add(m, mul((e[1], -e[0]), h))
    D = k1 if ln(sub(k1, D_alt)) < ln(sub(k2, D_alt)) else k2
    if ln(sub(D, D_alt)) > 6: return None              # Sprung = Totpunkt ueberschritten
    psi = math.atan2(D[1] - LR[1], D[0] - LR[0]) - math.atan2(LH[1] - LR[1], LH[0] - LR[0])
    psi = (psi + math.pi) % (2 * math.pi) - math.pi
    w0 = math.atan2(LH[1] - UH[1], LH[0] - UH[0]); w1 = math.atan2(D[1] - C[1], D[0] - C[0])
    ax = add(C, rot(sub(RA, UH), (0, 0), w1 - w0))
    et = rot(ET, UR, phi); eb = rot(EB, LR, psi)
    return dict(phi=phi, psi=psi, ax=ax, L=ln(sub(et, eb)), th=w1 - w0, C=C, D=D, et=et, eb=eb, h=h)
def spur(P, hub=65.0):
    """Verfolgt den Mechanismus von phi=0 in kleinen Schritten bis zum vollen Hub. Liefert Liste der Lagen oder None."""
    L0 = ln(sub(P[4], P[5])); D = P[3]; lagen = []; phi = 0.0
    while True:
        q = schritt(P, phi, D)
        if q is None: return None
        lagen.append(q); D = q['D']
        if L0 - q['L'] >= hub: return lagen
        if len(lagen) > 1 and q['L'] >= lagen[-2]['L'] + 1e-9: return None   # Daempfer wird nicht mehr kuerzer
        phi -= 0.004
        if phi < -1.3: return None
def bei_hub(lagen, L0, h):
    for i in range(1, len(lagen)):
        a, b = lagen[i - 1], lagen[i]
        if L0 - b['L'] >= h:
            t = (h - (L0 - a['L'])) / ((L0 - b['L']) - (L0 - a['L']))
            return (a['ax'][0] + (b['ax'][0] - a['ax'][0]) * t, a['ax'][1] + (b['ax'][1] - a['ax'][1]) * t), i
    return lagen[-1]['ax'], len(lagen) - 1
def ziel(v, info=False):
    for x, (a, b) in zip(v, GRENZ):
        if x < a or x > b: return 1e9
    P = punkte(v); UR, UH, LR, LH, ET, EB = P
    L0 = 230.0; f = 0.0
    f = frei(f, ln(sub(LH, RA)), 405)
    f += max(0, LH[0] + 5) ** 2 * 400          # Kettenstreben-Lager hinter dem Tretlager
    f = frei(f, ln(LH), BB_R + 17)
    f = frei(f, seg_ab(LH, DT[0], DT[1]) - DT[2] - 16, 2)
    f = frei(f, seg_ab(UH, ST[0], ST[1]) - ST[2] - 12, 0)       # Sitzstrebenlager hinter dem Sitzrohr
    if UH[0] > st((UH[1]) / geo.SITZ_DIR[1])[0]: f += 3e3
    def unter_kette(p, rand):
        zk = 68 + (RA[1] + 20 - 68) * (-p[0]) / (-RA[0]) if p[0] < 0 else 68
        return max(0, p[1] - (zk - rand))
    f += unter_kette(LH, 20) ** 2 * 200
    lagen = spur(P)
    if not lagen: return f + 1e6
    q1 = lagen[1]
    rr = lagen[-1]; fw = rr['ax'][1] - RA[1]; dx = rr['ax'][0] - RA[0]
    # gegenlaeufig: unterer Hebel dreht gegen den Uhrzeigersinn, Daempferaugen bewegen sich aufeinander zu
    f += max(0, q1['et'][1] - ET[1] + 0.02) ** 2 * 1e7 + max(0, EB[1] - q1['eb'][1] + 0.02) ** 2 * 1e7
    mitte, _ = bei_hub(lagen, L0, 0.35 * 65)
    f += (fw - 180) ** 2 * 20 + (dx + 8) ** 2 * 0.3 + (mitte[0] - RA[0] + 10) ** 2 * 0.2
    for q in (None, lagen[len(lagen) // 2], rr):
        if q is None: et, eb, D, ue = ET, EB, LH, UH
        else: et, eb, D, ue = q['et'], q['eb'], q['D'], rot(UH, UR, q['phi'])
        f = pruef_lage(f, P, eb, et, UR, [(UR, ue), (UR, et)], [(LR, D), (LR, eb), (D, eb)])
    def st_fuss(p):
        t = max(8, min(geo.SITZROHR, p[0] * geo.SITZ_DIR[0] + p[1] * geo.SITZ_DIR[1])); return st(t)
    def dt_fuss(p):
        a_, b_ = DT[0], DT[1]; d = sub(b_, a_); t = max(0, min(1, ((p[0] - a_[0]) * d[0] + (p[1] - a_[1]) * d[1]) / (d[0] ** 2 + d[1] ** 2)))
        return add(a_, mul(d, t))
    lr_ziel = min((st_fuss(LR), dt_fuss(LR), (0.0, 0.0)), key=lambda q: ln(sub(q, LR)))
    for et, eb in ((ET, EB), (rr['et'], rr['eb'])):
        for p, rad in huell_punkte(eb, et):
            f = frei(f, ln(sub(p, UR)) - 12.5 - rad, 2)
            f = frei(f, ln(sub(p, LR)) - 11.5 - rad, 2)
            f = frei(f, seg_ab(p, UR, st_fuss(UR)) - 14 - rad, 2)
            f = frei(f, seg_ab(p, LR, lr_ziel) - 14 - rad, 2)
    # Kettenstreben-Lager bleibt ueber den ganzen Federweg unter dem oberen Kettentrum (Kettenblatt oben -> 21er oben)
    R = geo.R_HINTEN
    for q in (None, lagen[len(lagen) // 4], lagen[len(lagen) // 2], lagen[3 * len(lagen) // 4], rr):
        if q is None: D, axq, ue, ebq = LH, RA, UH, EB
        else: D, axq, ue, ebq = q['D'], q['ax'], rot(UH, UR, q['phi']), q['eb']
        zt = 64.7 + (axq[1] + 42.6 - 64.7) * (D[0] / axq[0]) if D[0] < 0 else 64.7
        f = frei(f, zt - D[1], 15, 600)
        # Reifen gegen die Hebel (Laschen liegen innerhalb der Reifenbreite)
        f = frei(f, seg_ab(axq, UR, ue) - 13 - R, 4)
        f = frei(f, seg_ab(axq, LR, D) - 13 - R, 4)
        f = frei(f, seg_ab(axq, LR, ebq) - 13 - R, 4)
    f = frei(f, ln(sub(UH, RA)) - R, 22)      # Sitzstreben-Lager mit Abstand zum Reifen
    ax = rr['ax']
    f = frei(f, seg_ab(ax, ST[0], ST[1]) - ST[2] - R, 8)
    f = frei(f, ln(sub(ax, UR)) - 14 - R, 8)
    f = frei(f, seg_ab(ax, UR, rr['et']) - 14 - R, 8)
    f = frei(f, ln(sub(ax, LR)) - 13 - R, 8)
    f = frei(f, ln(sub(ax, rr['eb'])) - 13 - R, 8)
    f = frei(f, ln(ax) - BB_R - R, 8)
    for p, rad in huell_punkte(rr['eb'], rr['et']):
        f = frei(f, ln(sub(ax, p)) - rad - R, 8)
    a10, _ = bei_hub(lagen, L0, 10); a55, _ = bei_hub(lagen, L0, 55)
    ue0 = (a10[1] - RA[1]) / 10; ue1 = (fw - (a55[1] - RA[1])) / 10
    prog = (ue0 - ue1) / ue0
    f += max(0, 0.05 - prog) ** 2 * 3000 + (prog - 0.2) ** 2 * 300
    phiE, psiE = math.degrees(rr['phi']), math.degrees(rr['psi'])
    f += max(0, abs(phiE) - 52) ** 2 * 20 + max(0, abs(psiE) - 52) ** 2 * 20 + max(0, 290 - UH[1]) ** 2 * 0.5
    if info: return f, fw, dx, phiE, psiE, prog, ue0, ue1
    return f
if __name__ == '__main__':
    SEED = int(sys.argv[1]); LAEUFE = int(sys.argv[2]); random.seed(SEED)
    besten = []
    for lauf in range(LAEUFE):
        bf, bv = 1e18, None
        if lauf % 2 == 0:
            alt = [v for fn in ('lager_r91.json', 'lager_r92.json', 'lager_r93.json', 'lager_r94.json') for _, v in json.load(open(fn))]
            alt = [v for v in alt if punkte(v)[3][0] < 0]
            v0 = list(random.choice(alt)); bf, bv = ziel(v0), v0
        for _ in range(0 if lauf % 2 == 0 else 3000):
            v = [random.uniform(a, b) for a, b in GRENZ]
            fv = ziel(v)
            if fv < bf: bf, bv = fv, v
            if fv < 1e5: break
        v, f = bv, bf
        sch = [(b - a) * 0.08 for a, b in GRENZ]
        for it in range(3000):
            k = random.randrange(len(v)); w2 = list(v); w2[k] += random.gauss(0, sch[k])
            f2 = ziel(w2)
            if f2 < f: v, f = w2, f2
            if it % 750 == 749: sch = [s * 0.5 for s in sch]
        besten.append((f, v))
    besten.sort(key=lambda x: x[0])
    for f, v in besten[:4]:
        print(round(f, 1), [round(x, 2) for x in ziel(v, True)[1:]])
        print('   ', json.dumps([[round(c, 1) for c in p] for p in punkte(v)]))
    json.dump([[f, v] for f, v in besten[:6]], open('lager_s%d.json' % SEED, 'w'))
