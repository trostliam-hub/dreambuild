"""Schnelle Probe-Renderings: python render.py <blend> <kamera seite|dreiviertel> <ziel.png> <samples> <breite> [bild] [transparent 0|1]"""
import sys, os, bpy
blend, kam, ziel, samples, breite = sys.argv[1], sys.argv[2], os.path.abspath(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
bild = int(sys.argv[6]) if len(sys.argv) > 6 else 1
transp = (sys.argv[7] == "1") if len(sys.argv) > 7 else False
bpy.ops.wm.open_mainfile(filepath=blend)
sc = bpy.context.scene
sc.camera = bpy.data.objects["Kamera_Seite" if kam == "seite" else "Kamera_Dreiviertel"]
sc.frame_set(bild)
sc.cycles.samples = samples
sc.render.resolution_x = breite
sc.render.resolution_y = int(breite * (0.56 if kam == "seite" else 0.66))
sc.render.resolution_percentage = 100
sc.render.film_transparent = transp
sc.cycles.use_denoising = True
sc.render.threads_mode = "FIXED"; sc.render.threads = 4
sc.render.filepath = ziel
bpy.ops.render.render(write_still=True)
print("gerendert", ziel)
