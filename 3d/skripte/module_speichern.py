"""Schreibt die Teile-Kategorien (module.py) als Objekt-Eigenschaften in die .blend:
python module_speichern.py ../modell/spindrift-5-al.blend"""
import sys, os, bpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from module import markieren
datei = os.path.abspath(sys.argv[1])
bpy.ops.wm.open_mainfile(filepath=datei)
zahl, ohne = markieren(list(bpy.data.collections["Spindrift_5_AL_L_Mix"].all_objects))
bpy.ops.wm.save_mainfile(filepath=datei, compress=True)
print("gespeichert", zahl, "ohne:", ohne, os.path.getsize(datei))
