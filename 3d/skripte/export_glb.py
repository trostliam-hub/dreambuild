"""GLB-Export des Beispielrads: python export_glb.py <blend> <ziel.glb> [draco 0|1]
Exportiert nur die Sammlung des Rads (ohne Studio-Licht, Kameras und Schattenfaenger), mit Animation
(Bild 1-46 Federn, 61-121 Rollen) als ein Clip "Spindrift_Bewegung"."""
import sys, os, bpy
blend, ziel = sys.argv[1], os.path.abspath(sys.argv[2])
draco = (sys.argv[3] == "1") if len(sys.argv) > 3 else True
bpy.ops.wm.open_mainfile(filepath=blend)
haupt = bpy.data.collections["Spindrift_5_AL_L_Mix"]
for ob in bpy.context.view_layer.objects:
    ob.select_set(False)
def alle(c):
    for o in c.objects:
        yield o
    for k in c.children:
        yield from alle(k)
n = 0
for ob in alle(haupt):
    if ob.hide_render:
        continue
    ob.select_set(True); n += 1
bpy.context.scene.frame_set(1)
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True, export_yup=True, export_apply=False,
                          export_animations=True, export_animation_mode="ACTIONS", export_frame_range=True,
                          export_optimize_animation_size=True, export_materials="EXPORT",
                          export_draco_mesh_compression_enable=draco, export_draco_mesh_compression_level=10,
                          export_draco_position_quantization=14, export_draco_normal_quantization=10)
print("exportiert", n, "Objekte ->", ziel, os.path.getsize(ziel), "Bytes")
