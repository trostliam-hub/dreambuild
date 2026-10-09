"""Endgueltige Renderings: python render_final.py <blend> <ausgabe-ordner> [samples] [breite]
Seitenansicht (orthografisch) und Dreiviertelansicht, transparenter Grund mit Schattenfaenger."""
import sys, os, bpy
blend, aus = sys.argv[1], os.path.abspath(sys.argv[2])
samples = int(sys.argv[3]) if len(sys.argv) > 3 else 256
breite = int(sys.argv[4]) if len(sys.argv) > 4 else 2000
os.makedirs(aus, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=blend)
sc = bpy.context.scene
sc.frame_set(1)
sc.cycles.samples = samples
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_percentage = 100
sc.render.threads_mode = "FIXED"; sc.render.threads = 4
for kam, name, hv in (("Kamera_Seite", "seite", 0.56), ("Kamera_Dreiviertel", "dreiviertel", 0.66)):
    sc.camera = bpy.data.objects[kam]
    sc.render.resolution_x = breite
    sc.render.resolution_y = int(breite * hv)
    sc.render.filepath = os.path.join(aus, f"roh-{name}.png")
    bpy.ops.render.render(write_still=True)
    print("gerendert", sc.render.filepath)
