"""Kollisionspruefung: baut das Rad (bau.py), stellt mehrere Federwege ein und meldet sich schneidende Flaechen
zwischen Bauteilen verschiedener Baugruppen (BVH-Ueberlappung). Gewollte Verbindungen stehen in ERLAUBT.
Aufruf: python kollision.py"""
import sys, os, math, fnmatch
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import bau, geo
# Gewollte Beruehrungen/Durchsteckungen (Bolzen durch Laschen, Achsen durch Naben, Lager in Aufnahmen, ...)
ERLAUBT = [
    ("Lager_*", "*"), ("Daempfer_Buchse_*", "*"),
    ("Rahmen_Hauptrahmen", "Stuetze_Aussenrohr"), ("Rahmen_Hauptrahmen", "Steuersatz_oben"), ("Rahmen_Hauptrahmen", "Gabel_Krone"),
    ("Rahmen_Hauptrahmen", "Tretlager*"), ("Rahmen_Hauptrahmen", "Zugeinlass*"), ("Rahmen_Hauptrahmen", "Schaltzug"),
    ("Rahmen_Hauptrahmen", "Bremsleitung_hinten"), ("Rahmen_Hauptrahmen", "Stuetzenzug"),
    ("Hinterbau", "Nabe_hinten_148"), ("Hinterbau", "Schaltwerk_*"), ("Hinterbau", "Schaltzug_hinten"), ("Hinterbau", "Bremssattel_hinten"),
    ("Nabe_*", "*"), ("Kassette_10-52", "Kette"), ("Kettenblatt_32", "Kette"), ("Schaltrolle_*", "Kette"), ("Schaltwerk_*", "Schaltrolle_*"),
    ("Schaltwerk_*", "Schaltwerk_*"), ("Schaltwerk_*", "Kette"),
    ("Tretlagerachse", "*"), ("Kurbel_*", "Pedalgewinde_*"), ("Kettenblatt_*", "Kettenblatt_Aufnahme"), ("Kettenblatt_Aufnahme", "Tretlager*"),
    ("Kettenfuehrung_oben*", "Kette"),
    ("Gabel_*", "Gabel_*"), ("Gabel_Steckachse", "*"), ("Gabel_Bremsaufnahme", "Bremssattel_vorn"),
    ("Bremssattel_*", "Bremsscheibe_*"),
    ("Reifen_*", "Felge_*"), ("Felge_*", "Speichen_*"),
    ("Steuersatz_oben", "Spacer"), ("Spacer", "Vorbau_*"), ("Vorbau_*", "Vorbau_*"), ("Vorbau_*", "Gabelschaft_Kappe"), ("Vorbau_*", "Lenker"),
    ("Lenker", "Griff*"), ("Lenker", "Bremshebel_*"), ("Lenker", "Geberzylinder_*"), ("Bremshebel_*", "*"), ("Geberzylinder_*", "*"), ("Griff*", "Griff*"),
    ("Lenker", "Schaltzug"), ("Lenker", "Bremsleitung_hinten"), ("Lenker", "Stuetzenzug"), ("Schaltzug", "*"), ("Stuetzenzug", "*"), ("Bremsleitung_hinten", "*"),
    ("Stuetze_*", "Stuetze_*"), ("Stuetze_*", "Sattel*"), ("Sattel*", "Sattel*"),
    ("Daempfer_*", "Daempfer_*"), ("Schaltwerk_Koerper", "Schaltzug_hinten"),
]
def erlaubt(a, b):
    for x, y in ERLAUBT:
        if (fnmatch.fnmatch(a, x) and fnmatch.fnmatch(b, y)) or (fnmatch.fnmatch(b, x) and fnmatch.fnmatch(a, y)):
            return True
    return False
E = bau.baue()
obs = [o for o in bpy.data.objects if o.type == "MESH" and not o.hide_render]
def baeume():
    dg = bpy.context.evaluated_depsgraph_get()
    t = {}
    for o in obs:
        e = o.evaluated_get(dg); me = e.to_mesh()
        mw = o.matrix_world
        vs = [mw @ v.co for v in me.vertices]
        ps = [tuple(p.vertices) for p in me.polygons]
        t[o.name] = (BVHTree.FromPolygons(vs, ps), (Vector([min(v[i] for v in vs) for i in range(3)]), Vector([max(v[i] for v in vs) for i in range(3)])), vs, ps)
        e.to_mesh_clear()
    return t
ergebnis = {}
for name, hh, hv in (("Ruhe", 0, 0), ("Hub 50 %", 32.5, 90), ("Hub 100 %", 65, 180)):
    bau.pose(E, hub_hinten=hh, hub_vorn=hv, boden=False)
    T = baeume()
    namen = sorted(T)
    treffer = []
    for i, a in enumerate(namen):
        for b in namen[i + 1:]:
            if erlaubt(a, b): continue
            (ta, (amin, amax), _, _), (tb, (bmin, bmax), _, _) = T[a], T[b]
            if any(amax[k] < bmin[k] or bmax[k] < amin[k] for k in range(3)): continue
            ov = ta.overlap(tb)
            if ov:
                obA = bpy.data.objects[a]
                treffer.append((a, b, len(ov), ov[len(ov) // 2]))
    print(f"== {name}: {len(treffer)} unerwartete Schnitte")
    for a, b, n, (ia, ib) in treffer:
        def mitte(nm, i):
            vs, ps = T[nm][2], T[nm][3]
            c = sum((vs[j] for j in ps[i]), Vector()) / len(ps[i])
            return f"x {c.x * 1000:.0f} y {c.y * 1000:.0f} z {c.z * 1000 - bau.Z0:.0f}"
        print(f"   {a} x {b}: {n} Dreieckspaare, z. B. {mitte(a, ia)} | {mitte(b, ib)} (mm, z ab Tretlager)")
