"""Geometrie und PRO10-Kinematik des Beispielrads (Propain Spindrift 5 AL, Groesse L, Mix/Mullet).
Ebene der Seitenansicht: x nach vorn, z nach oben, Tretlager im Ursprung, alles in mm.
Quellen der Tabellenwerte: Propain-Rahmenset-Tabelle (laut Suchergebnis, Seite selbst aus der Sandbox gesperrt),
Vital MTB (Tretlagerhoehe), Pinkbike (Daempfer 230x65), Loam Wolf/MBR (PRO10-Aufbau).
Lagerpunkte der Hebel sind GESCHAETZT (keine Zeichnung zugaenglich) und so gelegt, dass 65 mm Daempferhub
180 mm Federweg ergeben."""
import math
D2R = math.pi / 180
# ---- Tabellenwerte Groesse L, Mix (29" vorn, 27,5" hinten), 180-mm-Gabel ----
REACH, STACK, STEUERROHR = 480.0, 644.0, 110.0
LENKWINKEL, SITZWINKEL_EFF = 63.9, 78.7
OBERROHR_EFF, SITZROHR, KETTENSTREBE, RADSTAND = 612.0, 460.0, 435.0, 1264.0
TRETLAGER_HOEHE = 349.0          # Vital MTB, L Mullet
DROP_HINTEN, DROP_VORN = 14.0, 27.0   # Tretlager-Offset R14 / F27
FEDERWEG_HINTEN, FEDERWEG_VORN = 180.0, 180.0
DAEMPFER_EL, DAEMPFER_HUB = 230.0, 65.0
# Reifenradien aus Tretlagerhoehe + Offset (29x2,5 vorn, 27,5x2,5 hinten)
R_VORN = TRETLAGER_HOEHE + DROP_VORN      # 376
R_HINTEN = TRETLAGER_HOEHE + DROP_HINTEN  # 363
# ---- Punkte ----
BB = (0.0, 0.0)
RA = (-math.sqrt(KETTENSTREBE**2 - DROP_HINTEN**2), DROP_HINTEN)
FA = (RADSTAND + RA[0], DROP_VORN)
DIR_LENK = (math.cos(LENKWINKEL * D2R), -math.sin(LENKWINKEL * D2R))   # entlang Gabel nach unten
HT_O = (REACH, STACK)
HT_U = (REACH + STEUERROHR * DIR_LENK[0], STACK + STEUERROHR * DIR_LENK[1])
SITZ_DIR = ((REACH - OBERROHR_EFF) / math.hypot(REACH - OBERROHR_EFF, STACK), STACK / math.hypot(REACH - OBERROHR_EFF, STACK))
SR_O = (SITZ_DIR[0] * SITZROHR, SITZ_DIR[1] * SITZROHR)
def add(a, b): return (a[0] + b[0], a[1] + b[1])
def sub(a, b): return (a[0] - b[0], a[1] - b[1])
def mul(a, s): return (a[0] * s, a[1] * s)
def ln(a): return math.hypot(a[0], a[1])
def rot(p, c, w):
    s, k = math.sin(w), math.cos(w); d = sub(p, c)
    return (c[0] + d[0] * k - d[1] * s, c[1] + d[0] * s + d[1] * k)
def st(t): return mul(SITZ_DIR, t)
# Gabel: Einbauhoehe und Versatz ergeben sich aus Steuerrohr unten und Vorderachse
_d = sub(FA, HT_U)
GABEL_ACHSE_LAENGS = _d[0] * DIR_LENK[0] + _d[1] * DIR_LENK[1]
GABEL_VERSATZ = _d[0] * (-DIR_LENK[1]) + _d[1] * DIR_LENK[0]
# ---- PRO10-Lagerpunkte (GESCHAETZT) ----
# Keine Propain-Zeichnung zugaenglich (propain-bikes.com aus der Sandbox gesperrt). Die Punkte stammen aus einer
# numerischen Suche (opt_s.py + verfeinern2.py) mit diesen Bedingungen:
#  - Daempfer 230 x 65 schwimmend zwischen zwei kurzen Hebeln, steht vor dem Sitzrohr (fast parallel dazu);
#    oberes Auge geht beim Einfedern nach unten, unteres nach oben (von beiden Seiten gedrueckt),
#  - 65 mm Hub ergeben 180 mm Federweg (erreicht: 179,5 mm), leicht progressiv (Uebersetzung 2,96 -> 2,63),
#  - Freigaenge in Ruhe, bei 25/50/75 % und voll eingefedert: Daempfer/Feder gegen Sitzrohr, Unterrohr, Oberrohr,
#    Tretlager und Lageraufnahmen; Hebel gegen Rohre, Feder und Reifen; Reifen gegen Sitzrohr und Daempfer;
#    Kettenstreben-Lager bleibt ueber den ganzen Federweg unter dem oberen Kettentrum.
# ABWEICHUNG: Propain beschreibt die PRO10-Hebel als gegenlaeufig. Mit dieser Rahmengeometrie fand die Suche keine
# gegenlaeufige Loesung mit 180 mm, die alle Freigaenge einhaelt; hier drehen beide Hebel gleichsinnig.
U_RAHMEN = (-73.02, 315.04)   # oberer Hebel am Sitzrohr
U_HINTEN = (-211.37, 336.49)  # oberer Hebel -> Sitzstreben (Flip-Chip)
L_RAHMEN = (21.63, 108.12)    # unterer Hebel am Rahmen (Steg auf dem Unterrohr, vor dem Sitzrohr)
L_HINTEN = (-30.85, 22.41)    # unterer Hebel -> Kettenstreben (hinter dem Tretlager, unter der Kette)
D_OBEN = (-0.59, 374.35)      # Daempferauge oben (am oberen Hebel)
D_UNTEN = (18.51, 145.15)     # Daempferauge unten (am unteren Hebel)
def _lage(phi, D_alt):
    """Eine Lage des Viergelenks; von den zwei Schnittpunkten gilt der, der D_alt am naechsten liegt."""
    C = rot(U_HINTEN, U_RAHMEN, phi)
    r1, r2 = ln(sub(L_HINTEN, L_RAHMEN)), ln(sub(L_HINTEN, U_HINTEN))
    d = ln(sub(C, L_RAHMEN)); a = (r1 * r1 - r2 * r2 + d * d) / (2 * d); h = math.sqrt(max(0, r1 * r1 - a * a))
    e = mul(sub(C, L_RAHMEN), 1 / d); m = add(L_RAHMEN, mul(e, a))
    k1, k2 = add(m, mul((-e[1], e[0]), h)), add(m, mul((e[1], -e[0]), h))
    D = k1 if ln(sub(k1, D_alt)) < ln(sub(k2, D_alt)) else k2
    psi = math.atan2(D[1] - L_RAHMEN[1], D[0] - L_RAHMEN[0]) - math.atan2(L_HINTEN[1] - L_RAHMEN[1], L_HINTEN[0] - L_RAHMEN[0])
    psi = (psi + math.pi) % (2 * math.pi) - math.pi
    w0 = math.atan2(L_HINTEN[1] - U_HINTEN[1], L_HINTEN[0] - U_HINTEN[0]); w1 = math.atan2(D[1] - C[1], D[0] - C[0])
    th = w1 - w0
    ax = add(C, rot(sub(RA, U_HINTEN), (0, 0), th))
    et = rot(D_OBEN, U_RAHMEN, phi); eb = rot(D_UNTEN, L_RAHMEN, psi)
    return dict(C=C, D=D, phi=phi, psi=psi, theta=th, achse=ax, et=et, eb=eb, daempfer=ln(sub(et, eb)))
def loese(phi):
    """phi: Drehung des oberen Hebels (Bogenmass, negativ = Uhrzeigersinn, Rad federt ein).
    Schrittweise von der Ruhelage aus verfolgt, damit das Viergelenk nie in die zweite Loesung springt."""
    n = max(1, int(abs(phi) / 0.004) + 1)
    D = L_HINTEN
    for k in range(1, n + 1):
        r = _lage(phi * k / n, D)
        D = r['D']
    return r if phi else _lage(0.0, L_HINTEN)
DAEMPFER_STATISCH = ln(sub(D_OBEN, D_UNTEN))
def phi_fuer_hub(hub):
    """Drehwinkel des oberen Hebels, bei dem der Daempfer um hub mm eingefedert ist (Bisektion)."""
    lo, hi = 0.0, -1.0
    for _ in range(50):
        m = (lo + hi) / 2
        if DAEMPFER_STATISCH - loese(m)['daempfer'] >= hub: hi = m
        else: lo = m
    return hi
if __name__ == '__main__':
    print('Hinterachse', [round(v, 1) for v in RA], 'Vorderachse', [round(v, 1) for v in FA])
    print('Steuerrohr oben/unten', HT_O, [round(v, 1) for v in HT_U], 'Sitzrohr oben', [round(v, 1) for v in SR_O])
    print('Gabel: Achse->Steuerrohr unten %.1f mm, Versatz %.1f mm' % (GABEL_ACHSE_LAENGS, GABEL_VERSATZ))
    print('Daempfer statisch %.1f mm' % DAEMPFER_STATISCH)
    for hub in (0, 16, 32.5, 49, 65):
        r = loese(phi_fuer_hub(hub)) if hub else loese(0)
        print('Hub %4.1f mm: Rad %+6.1f mm hoch, %+5.1f mm vor; oberer Hebel %+5.1f Grad, unterer %+5.1f Grad, Hinterbau %+5.1f Grad' % (
            hub, r['achse'][1] - RA[1], r['achse'][0] - RA[0], math.degrees(r['phi']), math.degrees(r['psi']), math.degrees(r['theta'])))
