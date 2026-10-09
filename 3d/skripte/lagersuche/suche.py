import math, random, json
import geo
from geo import add, sub, mul, ln, rot, st, RA
random.seed(7)
def loese(P, phi):
    UR, UH, LR, LH, ET, EB = P
    C = rot(UH, UR, phi)
    r1, r2 = ln(sub(LH, LR)), ln(sub(LH, UH))
    d = ln(sub(C, LR)); 
    if d < 1e-6: return None
    a = (r1 * r1 - r2 * r2 + d * d) / (2 * d); h2 = r1 * r1 - a * a
    if h2 < 0: return None
    h = math.sqrt(h2); e = mul(sub(C, LR), 1 / d); m = add(LR, mul(e, a))
    k1, k2 = add(m, mul((-e[1], e[0]), h)), add(m, mul((e[1], -e[0]), h))
    D = k1 if ln(sub(k1, LH)) < ln(sub(k2, LH)) else k2
    psi = math.atan2(D[1] - LR[1], D[0] - LR[0]) - math.atan2(LH[1] - LR[1], LH[0] - LR[0])
    psi = (psi + math.pi) % (2 * math.pi) - math.pi
    w0 = math.atan2(LH[1] - UH[1], LH[0] - UH[0]); w1 = math.atan2(D[1] - C[1], D[0] - C[0])
    ax = add(C, rot(sub(RA, UH), (0, 0), w1 - w0))
    et = rot(ET, UR, phi); eb = rot(EB, LR, psi)
    return dict(psi=psi, ax=ax, L=ln(sub(et, eb)), th=w1 - w0, C=C, D=D, et=et, eb=eb)
def bewerte(P):
    L0 = ln(sub(P[4], P[5]))
    r = loese(P, -0.01)
    if not r or r['psi'] <= 0: return None          # gegenlaeufig: unterer Hebel dreht andersherum
    if L0 - r['L'] <= 0: return None                  # Daempfer muss kuerzer werden
    lo, hi = -0.01, -0.01
    while True:
        r = loese(P, hi)
        if not r: return None
        if L0 - r['L'] >= geo.DAEMPFER_HUB: break
        lo = hi; hi *= 1.5
        if hi < -1.2: return None
    for _ in range(30):
        mid = (lo + hi) / 2; r = loese(P, mid)
        if not r: return None
        if L0 - r['L'] >= geo.DAEMPFER_HUB: hi = mid
        else: lo = mid
    r = loese(P, hi); fw = r['ax'][1] - RA[1]; dx = r['ax'][0] - RA[0]
    # Achspfad in der Mitte
    rm = loese(P, hi * 0.35)
    if not rm: return None
    return fw, dx, hi, rm['ax'][0] - RA[0], r
best = []
def abstand(p): return p[0] * geo.SITZ_DIR[1] - p[1] * geo.SITZ_DIR[0]
for i in range(2500000):
    tu = random.uniform(280, 370); nu = random.uniform(0, 14)
    UR = add(st(tu), mul((geo.SITZ_DIR[1], -geo.SITZ_DIR[0]), nu))
    lu = random.uniform(55, 110); au = math.radians(random.uniform(-40, 40))
    UH = add(UR, (-lu * math.cos(au), lu * math.sin(au)))
    LR = (random.uniform(-60, 40), random.uniform(-5, 110))
    ll = random.uniform(35, 95); al = math.radians(random.uniform(0, 360))
    LH = add(LR, (ll * math.cos(al), ll * math.sin(al)))
    if LH[0] > 5 or LH[1] < -20 or LH[1] > 150: continue
    re_ = random.uniform(12, 55); ae = math.radians(random.uniform(-70, 50))
    ET = add(UR, (re_ * math.cos(ae), re_ * math.sin(ae)))
    rb = random.uniform(12, 55); ab = math.radians(random.uniform(-90, 120))
    EB = add(LR, (rb * math.cos(ab), rb * math.sin(ab)))
    L0 = ln(sub(ET, EB))
    if abs(L0 - geo.DAEMPFER_EL) > 2: continue
    w = math.degrees(math.atan2(ET[1] - EB[1], ET[0] - EB[0]))
    if not (82 < w < 100): continue
    if abstand(ET) < 24 or abstand(EB) < 24: continue
    P = (UR, UH, LR, LH, ET, EB)
    r = loese(P, -0.01)
    if not r or r['psi'] <= 0: continue
    if r['et'][1] >= ET[1] or r['eb'][1] <= EB[1]: continue      # oben runter, unten hoch
    b = bewerte(P)
    if not b: continue
    fw, dx, phiE, dxm, r = b
    score = abs(fw - 180) * 2 + abs(dx + 4) * 0.3 + abs(dxm + 8) * 0.2 + abs(math.degrees(phiE)) * 0.03
    best.append((score, P, fw, dx, dxm, math.degrees(phiE), math.degrees(r['psi'])))
best.sort(key=lambda x: x[0])
print('Kandidaten', len(best))
for b in best[:5]:
    s, P, fw, dx, dxm, ph, ps = b
    print(round(s, 1), 'FW %.1f dx_ende %.1f dx_mitte %.1f oberer Hebel %.1f Grad, unterer %.1f Grad' % (fw, dx, dxm, ph, ps))
    print('   ', json.dumps([[round(v, 1) for v in p] for p in P]))
json.dump([[list(p) for p in best[0][1]]], open('lager.json', 'w'))
