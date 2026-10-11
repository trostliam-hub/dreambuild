"""Nahaufnahme: python nah.py <blend> <ziel.png> <kx,ky,kz> <zx,zy,zz> <brennweite> [samples] [breite] [hoehe] [bild]"""
import sys, bpy
from mathutils import Vector
blend, ziel = sys.argv[1], sys.argv[2]
k = Vector([float(x) for x in sys.argv[3].split(",")]); z = Vector([float(x) for x in sys.argv[4].split(",")])
f = float(sys.argv[5]); samples = int(sys.argv[6]) if len(sys.argv) > 6 else 24
b = int(sys.argv[7]) if len(sys.argv) > 7 else 800; h = int(sys.argv[8]) if len(sys.argv) > 8 else 600
bild = int(sys.argv[9]) if len(sys.argv) > 9 else 1
bpy.ops.wm.open_mainfile(filepath=blend)
sc = bpy.context.scene
cd = bpy.data.cameras.new("Nah"); cd.lens = f
ko = bpy.data.objects.new("Nah", cd); sc.collection.objects.link(ko)
ko.location = k; ko.rotation_euler = (z - k).to_track_quat("-Z", "Y").to_euler()
sc.camera = ko; sc.frame_set(bild)
sc.cycles.samples = samples; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = b, h, 100
sc.render.film_transparent = False
sc.render.threads_mode = "FIXED"; sc.render.threads = 4
sc.render.filepath = ziel
bpy.ops.render.render(write_still=True)
