"""Radvisuals fuer crankscore.de aus dem App-Modell (3d/modell/spindrift-5-al.blend, APP-3D-001/BEVEL-002).
Aufruf: python web_render.py <blend> <ausgabe> <ansicht|alle> [samples] [breite]
Ansichten: held (Dreiviertel tief), seite (orthografisch, mit Bildpunkten fuer Beschriftungen als JSON),
bremse (Vorderradbremse nah, Nicht-Antriebsseite), antrieb (Kassette und Schaltwerk nah).
Transparenter Grund; held und seite mit weichem Bodenschatten (Schattenfaenger des Modells)."""
import sys, os, json, math, bpy, mathutils
from bpy_extras.object_utils import world_to_camera_view

blend, aus, wahl = sys.argv[-5], os.path.abspath(sys.argv[-4]), sys.argv[-3]
samples, breite = int(sys.argv[-2]), int(sys.argv[-1])
os.makedirs(aus, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=blend)
sc = bpy.context.scene
sc.frame_set(1)
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = samples
sc.cycles.use_denoising = True
sc.cycles.use_adaptive_sampling = True
sc.render.film_transparent = True
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
sc.render.threads_mode = "FIXED"; sc.render.threads = 4
O = bpy.data.objects
boden = O.get("Boden_Schattenfaenger")

def mitte(*namen):
    pts = []
    for n in namen:
        o = O[n]
        pts += [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
    return sum(pts, mathutils.Vector()) / len(pts)

def kamera(name, ort, ziel, linse=None, ortho=None, blende=None, fokus=None):
    cd = bpy.data.cameras.new(name)
    k = bpy.data.objects.new(name, cd); sc.collection.objects.link(k)
    k.location = ort
    rich = (mathutils.Vector(ziel) - mathutils.Vector(ort)).to_track_quat("-Z", "Y")
    k.rotation_euler = rich.to_euler()
    if ortho:
        cd.type = "ORTHO"; cd.ortho_scale = ortho
    else:
        cd.lens = linse
    cd.clip_start = 0.01; cd.clip_end = 50
    if blende:
        cd.dof.use_dof = True; cd.dof.aperture_fstop = blende
        cd.dof.focus_distance = (mathutils.Vector(fokus or ziel) - mathutils.Vector(ort)).length
    return k

def rendern(k, name, hv, schatten=True):
    sc.camera = k
    if boden: boden.hide_render = not schatten
    sc.render.resolution_x = breite
    sc.render.resolution_y = int(round(breite * hv))
    sc.render.filepath = os.path.join(aus, name + ".png")
    bpy.ops.render.render(write_still=True)
    print("gerendert", sc.render.filepath, flush=True)

ansichten = ["held", "seite", "heck", "front"] if wahl == "alle" else wahl.split(",")
rad = mitte("Rahmen_Hauptrahmen") if "Rahmen_Hauptrahmen" in O else mathutils.Vector((0.2, 0, 0.55))

if "held" in ansichten:
    ziel = (0.22, 0.0, 0.50)
    k = kamera("Web_Held", (2.35, -4.25, 0.62), ziel, linse=70)
    rendern(k, "rad-held", 0.62)

if "seite" in ansichten:
    k = O["Kamera_Seite"]
    rendern(k, "rad-seite", 0.56)
    # Bildpunkte fuer Beschriftungen (Anteile von links/oben), gerechnet mit derselben Kamera
    punkte = {}
    for schluessel, namen in {"hinterachse": ["Nabe_hinten_148"], "vorderachse": ["Nabe_vorn_110"],
                               "tretlager": ["Tretlagerachse"], "daempfer": ["Daempfer_Koerper"],
                               "stuetze": ["Stuetze_Klemme"], "bremse_hinten": ["Bremssattel_hinten"],
                               "bremse_vorn": ["Bremssattel_vorn"], "kassette": ["Kassette_10-52"],
                               "steuerrohr": ["Steuersatz_oben"], "kettenblatt": ["Kettenblatt_32"]}.items():
        if not namen: continue
        p = world_to_camera_view(sc, k, mitte(*namen))
        punkte[schluessel] = [round(p.x, 4), round(1 - p.y, 4)]
    json.dump(punkte, open(os.path.join(aus, "rad-seite-punkte.json"), "w"), indent=1)
    print("punkte", punkte)

if "bremse" in ansichten:
    sattel = mitte("Bremssattel_vorn"); nabe = mitte("Nabe_vorn_110")
    ziel = sattel.lerp(nabe, 0.35)
    ort = ziel + mathutils.Vector((0.30, 0.78, 0.16))
    k = kamera("Web_Bremse", ort, ziel, linse=85, blende=4.0, fokus=sattel)
    rendern(k, "rad-bremse", 0.75, schatten=False)

if "antrieb" in ansichten:
    kas = mitte("Kassette_10-52"); sw = mitte("Schaltwerk_Koerper")
    ziel = kas.lerp(sw, 0.4)
    ort = ziel + mathutils.Vector((-0.42, -0.80, 0.20))
    k = kamera("Web_Antrieb", ort, ziel, linse=85, blende=4.0, fokus=kas)
    rendern(k, "rad-antrieb", 0.75, schatten=False)

if "heck" in ansichten:
    k = kamera("Web_Heck", (-2.05, 3.95, 0.80), (0.25, 0.0, 0.50), linse=70)
    rendern(k, "rad-heck", 0.62)

if "front" in ansichten:
    krone = mitte("Gabel_Krone")
    ziel = krone.lerp(mitte("Nabe_vorn_110"), 0.45)
    k = kamera("Web_Front", ziel + mathutils.Vector((1.45, -1.55, 0.35)), ziel, linse=85, blende=5.6, fokus=krone)
    rendern(k, "rad-front", 0.8, schatten=True)
