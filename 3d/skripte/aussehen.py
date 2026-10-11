"""Aussehen des Beispielrads (BEVEL-002, Abschnitt 10): Feinheiten der Materialien fuer die Renderings.
Alles hier wirkt nur in Cycles (Knoten fuer Normalen und Mikrostruktur); das GLB bekommt weiterhin die
Grundwerte aus werkzeug.materialien (Farbe, Metall, Rauheit, Klarlack), weil glTF prozedurale Knoten
nicht kennt. Aufruf am Ende von bau.baue()."""
import bpy
from werkzeug import MAT, MM, material, srgb


def _knoten(m):
    nt = m.node_tree
    return nt, nt.nodes["Principled BSDF"]


def _rauschen(nt, massstab, detail=4.0, rauh=0.55):
    """Feines Rauschen in Objektkoordinaten (massstab in 1/m: 400 heisst Strukturen um 2,5 mm)."""
    tk = nt.nodes.new("ShaderNodeTexCoord")
    ns = nt.nodes.new("ShaderNodeTexNoise")
    ns.inputs["Scale"].default_value = massstab
    ns.inputs["Detail"].default_value = detail
    ns.inputs["Roughness"].default_value = rauh
    nt.links.new(tk.outputs["Object"], ns.inputs["Vector"])
    return ns


def veredeln(kante_mm=0.6):
    """Kanten, Oberflaechen und Klarlack verfeinern. kante_mm: Radius, mit dem harte Kanten im Rendering
    gerundet wirken (Bevel-Knoten) -- so fangen gefraeste und gegossene Teile Licht an den Kanten wie echte."""
    # 1. Kantenglanz fuer harte Teile (gefraest, gegossen, gestanzt)
    for name in ("Alu_schwarz_eloxiert", "Kunststoff_schwarz", "Stahl_blank", "Stahl_dunkel", "Lager", "Kette_Stahl",
                 "Bremsscheibe", "Gabel_Lack"):
        m = MAT.get(name)
        if not m:
            continue
        nt, b = _knoten(m)
        bev = nt.nodes.new("ShaderNodeBevel")
        bev.samples = 6
        bev.inputs["Radius"].default_value = kante_mm * MM
        nt.links.new(bev.outputs["Normal"], b.inputs["Normal"])
    # 2. Gummi: Reifen und Griffe sind nie spiegelglatt -- feine Koernung, leichter Glanz an den Kanten
    for name, staerke in (("Gummi", 0.18), ("Gummi_Flanke", 0.12)):
        m = MAT[name]
        nt, b = _knoten(m)
        ns = _rauschen(nt, 900.0, detail=6.0)
        bev = nt.nodes.new("ShaderNodeBevel")
        bev.samples = 6
        bev.inputs["Radius"].default_value = 0.8 * MM
        bu = nt.nodes.new("ShaderNodeBump")
        bu.inputs["Strength"].default_value = staerke
        bu.inputs["Distance"].default_value = 0.2 * MM
        nt.links.new(ns.outputs["Fac"], bu.inputs["Height"])
        nt.links.new(bev.outputs["Normal"], bu.inputs["Normal"])
        nt.links.new(bu.outputs["Normal"], b.inputs["Normal"])
        # Rauheit bleibt ein fester Wert: haengt dort ein Knoten, schreibt der glTF-Export 1,0
    # 3. Lack: Klarlack mit sehr leichter Orangenhaut (nur die Klarlack-Schicht, der Grund bleibt glatt)
    for name in ("Lack_Rahmen", "Lack_Rahmen_Dekor", "Gabel_Lack"):
        m = MAT.get(name)
        if not m:
            continue
        nt, b = _knoten(m)
        if "Coat Normal" not in b.inputs:
            continue
        ns = _rauschen(nt, 380.0, detail=3.0)
        bu = nt.nodes.new("ShaderNodeBump")
        bu.inputs["Strength"].default_value = 0.035
        bu.inputs["Distance"].default_value = 0.05 * MM
        nt.links.new(ns.outputs["Fac"], bu.inputs["Height"])
        nt.links.new(bu.outputs["Normal"], b.inputs["Coat Normal"])
    # 4. Bremsscheiben und Kassette: gedrehte Oberflaeche -- Glanzlichter laufen im Kreis (Anisotropie um die Achse)
    for name in ("Bremsscheibe",):
        m = MAT.get(name)
        if not m:
            continue
        nt, b = _knoten(m)
        if "Anisotropic" not in b.inputs:
            continue
        b.inputs["Anisotropic"].default_value = 0.65
        tg = nt.nodes.new("ShaderNodeTangent")
        tg.direction_type = "RADIAL"
        tg.axis = "Y"
        nt.links.new(tg.outputs["Tangent"], b.inputs["Tangent"])


def zusatzmaterialien():
    """Materialien, die es vor Abschnitt 10 nicht gab (im GLB als normale PBR-Materialien)."""
    material("Kette_Stahl", srgb("#9a9da2"), 1.0, 0.34)          # Aussenlaschen blank
    material("Bremsscheibe", srgb("#b4b7bc"), 1.0, 0.3)          # rostfreier Stahl, gedreht
    material("Sattel_Schale", srgb("#232427"), 0.0, 0.5, spec=0.45)
    material("Ventil", srgb("#8e9197"), 1.0, 0.32)
    return MAT


# ================================================================ Studio-Licht (Abschnitt 10)
def studio_licht(col, staerke_welt=0.45):
    """Fotostudio: Welt als Verlauf (Boden dunkel, Horizont mittel, Decke hell) -- Lack, Klarlack und Metall
    spiegeln so einen Horizont statt einer gleichmaessigen Flaeche; dazu eine grosse Softbox oben, ein
    schmaler Lichtstreifen auf der Kameraseite fuer lange Glanzlinien auf den Rohren, eine schwache Aufhellung
    und zwei Streiflichter von hinten fuer die Kanten. Der Boden bleibt Schattenfaenger (transparente Bilder)."""
    from mathutils import Vector
    sc = bpy.context.scene
    w = bpy.data.worlds.new("Studio")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    tk = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -1.0
    mr.inputs["From Max"].default_value = 1.0
    rampe = nt.nodes.new("ShaderNodeValToRGB")
    nt.links.new(tk.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], rampe.inputs["Fac"])
    nt.links.new(rampe.outputs["Color"], bg.inputs["Color"])
    el = rampe.color_ramp.elements
    el[0].position, el[0].color = 0.0, (0.015, 0.015, 0.016, 1)       # Boden
    el[1].position, el[1].color = 1.0, (0.95, 0.95, 0.96, 1)          # Decke
    for pos, g in ((0.47, 0.05), (0.5, 0.16), (0.56, 0.42), (0.75, 0.7)):
        e = el.new(pos)
        e.color = (g, g, g * 1.01, 1)
    bg.inputs["Strength"].default_value = staerke_welt

    def flaeche(name, ort, ziel, energie, groesse, gy=None, schatten=True, glanz=True):
        l = bpy.data.lights.new(name, "AREA")
        l.use_shadow = schatten
        l.energy = energie
        l.shape = "RECTANGLE"
        l.size = groesse
        l.size_y = gy or groesse
        ob = bpy.data.objects.new(name, l)
        ob.location = ort
        ob.rotation_euler = (Vector(ziel) - Vector(ort)).to_track_quat("-Z", "Y").to_euler()
        ob.visible_glossy = glanz
        col.objects.link(ob)
        return ob
    flaeche("Softbox_oben", (0.3, -1.2, 2.7), (0.2, 0, 0.55), 300, 2.6, gy=1.4)
    flaeche("Lichtstreifen_Kamera", (1.6, -2.6, 1.0), (0.25, 0, 0.6), 110, 0.35, gy=2.6)
    flaeche("Aufheller", (0.0, -3.2, 0.5), (0.2, 0, 0.6), 40, 2.4, gy=1.2, glanz=False)
    flaeche("Streiflicht_hinten_links", (-1.8, 1.4, 1.4), (0.0, 0, 0.6), 170, 0.5, gy=2.4, schatten=False)
    flaeche("Streiflicht_hinten_rechts", (2.2, 1.2, 1.5), (0.3, 0, 0.6), 150, 0.5, gy=2.4, schatten=False)
    flaeche("Kante_unten", (0.2, -1.4, 0.15), (0.2, 0, 0.4), 20, 3.0, gy=0.3, schatten=False)


def fuer_gltf():
    """Vor dem GLB-Export: Anisotropie (gedrehte Bremsscheiben) nur im Rendering -- das Modell hat dort keine
    UV-Koordinaten, aus denen three.js die Schliffrichtung ableiten koennte."""
    n = 0
    for m in bpy.data.materials:
        if not m.use_nodes:
            continue
        for b in m.node_tree.nodes:
            if b.type == "BSDF_PRINCIPLED" and "Anisotropic" in b.inputs and b.inputs["Anisotropic"].default_value > 0:
                b.inputs["Anisotropic"].default_value = 0.0
                for l in list(b.inputs["Tangent"].links):
                    m.node_tree.links.remove(l)
                n += 1
    return n
