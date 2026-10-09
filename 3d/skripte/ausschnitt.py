"""Nahaufnahme Mitte (Daempfer, Hebel, Tretlager): python ausschnitt.py <blend> <ziel.png> <samples> [bild]"""
import sys, os, bpy
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=sys.argv[1])
sc = bpy.context.scene
sc.frame_set(int(sys.argv[4]) if len(sys.argv) > 4 else 1)
cd = bpy.data.cameras.new("Nah"); cd.lens = 70
k = bpy.data.objects.new("Kamera_Nah", cd); sc.collection.objects.link(k)
ziel = Vector((-0.06, 0.0, 0.52)); ort = Vector((0.55, -1.35, 0.72))
k.location = ort; k.rotation_euler = (ziel - ort).to_track_quat("-Z", "Y").to_euler()
sc.camera = k
sc.cycles.samples = int(sys.argv[3]); sc.render.resolution_x = 1000; sc.render.resolution_y = 800
sc.render.film_transparent = False
sc.render.filepath = os.path.abspath(sys.argv[2])
bpy.ops.render.render(write_still=True)
