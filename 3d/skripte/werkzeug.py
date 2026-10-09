"""Bausteine fuer das Spindrift-Modell (Blender 5.0, bpy).
Eingaben in Millimetern; Blender rechnet in Metern. Koordinaten: x nach vorn,
y nach links (Nicht-Antriebsseite), z nach oben. Die Antriebsseite liegt bei -y."""
import math
import bpy
import bmesh
from mathutils import Vector, Matrix

MM = 0.001


def v(x, y=0.0, z=0.0):
    return Vector((x * MM, y * MM, z * MM))


# ---------------------------------------------------------------- Sammlungen
def sammlung(name, eltern=None):
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    ziel = eltern or bpy.context.scene.collection
    if c.name not in [k.name for k in ziel.children]:
        ziel.children.link(c)
    return c


# ---------------------------------------------------------------- Materialien
MAT = {}


def material(name, farbe, metall=0.0, rauh=0.5, coat=0.0, coat_rauh=0.2, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*farbe, 1.0)
    b.inputs["Metallic"].default_value = metall
    b.inputs["Roughness"].default_value = rauh
    if "Coat Weight" in b.inputs:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = coat_rauh
    if "Specular IOR Level" in b.inputs:
        b.inputs["Specular IOR Level"].default_value = spec
    m.diffuse_color = (*farbe, 1.0)
    MAT[name] = m
    return m


def srgb(h):
    """Hex (sRGB) -> lineare Farbe fuer Blender."""
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def materialien(lack="#4f5d6a"):
    material("Lack_Rahmen", srgb(lack), 0.0, 0.42, coat=0.35, coat_rauh=0.28)
    material("Alu_schwarz_eloxiert", srgb("#1b1c1f"), 0.55, 0.5)
    material("Kunststoff_schwarz", srgb("#141416"), 0.0, 0.62, spec=0.4)
    material("Gummi", srgb("#1c1c1d"), 0.0, 0.86, spec=0.25)
    material("Gummi_Flanke", srgb("#232324"), 0.0, 0.8, spec=0.25)
    material("Stahl_blank", srgb("#a7abb1"), 1.0, 0.38)
    material("Stahl_dunkel", srgb("#4a4c51"), 1.0, 0.4)
    material("Standrohr", srgb("#2c2d31"), 0.85, 0.22)
    material("Kolbenstange", srgb("#d4d6d9"), 1.0, 0.12)
    material("Feder", srgb("#26272a"), 0.6, 0.38)
    material("Sattel", srgb("#18181a"), 0.0, 0.55, spec=0.35)
    material("Lager", srgb("#8e9197"), 1.0, 0.3)
    return MAT


# ---------------------------------------------------------------- Mesh-Werkzeuge
def fertig(name, bm, mat, col, glatt=True, winkel=38):
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    col.objects.link(ob)
    if mat is not None:
        me.materials.append(MAT[mat] if isinstance(mat, str) else mat)
    if glatt:
        me.shade_smooth()
        me.set_sharp_from_angle(angle=math.radians(winkel))
    return ob


def catmull(pts, schritte=10):
    """Glatte Kurve durch alle Punkte (Catmull-Rom, Endpunkte verdoppelt)."""
    if len(pts) < 3:
        return [pts[0].lerp(pts[-1], i / schritte) for i in range(schritte + 1)], \
               [i / schritte for i in range(schritte + 1)]
    p = [pts[0]] + list(pts) + [pts[-1]]
    out, par = [], []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for s in range(schritte):
            t = s / schritte
            t2, t3 = t * t, t * t * t
            q = 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
            out.append(q)
            par.append(i - 1 + t)
    out.append(p[-2])
    par.append(len(pts) - 1)
    return out, par


def rohr(name, pts, breite, hoehe, mat, col, n=24, seite=Vector((0, 1, 0)), schritte=10, kappen=True, glatt=True):
    """Rohr entlang pts (Vektoren in m). breite/hoehe in mm je Kontrollpunkt:
    breite quer zur Ebene (Richtung 'seite'), hoehe in der Ebene. Ellipsenquerschnitt."""
    pfad, par = catmull(pts, schritte)
    if not isinstance(breite, (list, tuple)):
        breite = [breite] * len(pts)
    if not isinstance(hoehe, (list, tuple)):
        hoehe = [hoehe] * len(pts)

    def wert(liste, t):
        i = min(int(t), len(liste) - 2)
        f = t - i
        return liste[i] * (1 - f) + liste[i + 1] * f

    bm = bmesh.new()
    ringe = []
    for k, p in enumerate(pfad):
        if k == 0:
            tng = (pfad[1] - pfad[0]).normalized()
        elif k == len(pfad) - 1:
            tng = (pfad[-1] - pfad[-2]).normalized()
        else:
            tng = (pfad[k + 1] - pfad[k - 1]).normalized()
        s = (seite - tng * seite.dot(tng))
        if s.length < 1e-6:
            s = Vector((0, 0, 1)) - tng * tng.z
        s.normalize()
        nrm = tng.cross(s).normalized()
        a, b = wert(breite, par[k]) * 0.5 * MM, wert(hoehe, par[k]) * 0.5 * MM
        ring = []
        for j in range(n):
            w = 2 * math.pi * j / n
            ring.append(bm.verts.new(p + s * (math.cos(w) * a) + nrm * (math.sin(w) * b)))
        ringe.append(ring)
    for r0, r1 in zip(ringe, ringe[1:]):
        for j in range(n):
            bm.faces.new((r0[j], r0[(j + 1) % n], r1[(j + 1) % n], r1[j]))
    if kappen:
        for ring, umk in ((ringe[0], True), (ringe[-1], False)):
            m = sum((x.co for x in ring), Vector()) / n
            c = bm.verts.new(m)
            for j in range(n):
                f = (ring[j], ring[(j + 1) % n], c) if umk else (ring[(j + 1) % n], ring[j], c)
                bm.faces.new(f)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return fertig(name, bm, mat, col, glatt)


def ausrichten(bm, a, b):
    """Teil, das entlang z von 0 bis Laenge gebaut ist, von a nach b drehen/schieben."""
    d = b - a
    q = Vector((0, 0, 1)).rotation_difference(d.normalized())
    bmesh.ops.rotate(bm, verts=bm.verts, cent=Vector(), matrix=q.to_matrix())
    bmesh.ops.translate(bm, verts=bm.verts, vec=a)


def zyl(name, a, b, r, mat, col, n=32, r2=None, glatt=True, bm_rueck=False):
    """Zylinder/Kegel von a nach b (m), Radien in mm."""
    bm = bmesh.new()
    L = (b - a).length
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=n,
                          radius1=r * MM, radius2=(r2 if r2 is not None else r) * MM, depth=L)
    bmesh.ops.translate(bm, verts=bm.verts, vec=Vector((0, 0, L / 2)))
    ausrichten(bm, a, b)
    if bm_rueck:
        return bm
    return fertig(name, bm, mat, col, glatt, winkel=50)


def drehteil(name, profil, mitte, mat, col, n=64, achse="Y", glatt=True, winkel=40):
    """Rotationskoerper. profil: Liste (radius_mm, axial_mm), offen (Kontur), um die y-Achse durch mitte."""
    bm = bmesh.new()
    vs = [bm.verts.new(Vector((r * MM, a * MM, 0))) for r, a in profil]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    erg = bmesh.ops.spin(bm, geom=vs + es, cent=Vector(), axis=Vector((0, 1, 0)), dvec=Vector(),
                         angle=2 * math.pi, steps=n, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if achse == "Z":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=Vector(), matrix=Matrix.Rotation(math.pi / 2, 3, "X"))
    bmesh.ops.translate(bm, verts=bm.verts, vec=mitte)
    return fertig(name, bm, mat, col, glatt, winkel)


def huelle(punkte):
    """Konvexe Huelle (2D), gegen den Uhrzeigersinn."""
    p = sorted(set(punkte))
    if len(p) < 3:
        return p

    def kreuz(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    unten, oben = [], []
    for q in p:
        while len(unten) >= 2 and kreuz(unten[-2], unten[-1], q) <= 0:
            unten.pop()
        unten.append(q)
    for q in reversed(p):
        while len(oben) >= 2 and kreuz(oben[-2], oben[-1], q) <= 0:
            oben.pop()
        oben.append(q)
    return unten[:-1] + oben[:-1]


def kreise_umriss(kreise, n=28):
    """Umriss um Kreise ((x, z, r) mm) als konvexe Huelle."""
    pts = []
    for x, z, r in kreise:
        for i in range(n):
            w = 2 * math.pi * i / n
            pts.append((round(x + r * math.cos(w), 3), round(z + r * math.sin(w), 3)))
    return huelle(pts)


def platte(name, umriss, y0, y1, mat, col, fase=1.2, ebene=None, glatt=True):
    """Ebene Platte in der Seitenebene (x, z in mm), Dicke von y0 bis y1 (mm).
    ebene: optional (ursprung, ex, ez, ey) als Vektoren fuer andere Ebenen (in m bzw. Einheitsvektoren)."""
    bm = bmesh.new()
    if ebene is None:
        o, ex, ez, ey = Vector(), Vector((1, 0, 0)), Vector((0, 0, 1)), Vector((0, 1, 0))
    else:
        o, ex, ez, ey = ebene
    unten = [bm.verts.new(o + ex * (x * MM) + ez * (z * MM) + ey * (y0 * MM)) for x, z in umriss]
    oben = [bm.verts.new(o + ex * (x * MM) + ez * (z * MM) + ey * (y1 * MM)) for x, z in umriss]
    k = len(umriss)
    bm.faces.new(unten[::-1])
    bm.faces.new(oben)
    for i in range(k):
        bm.faces.new((unten[i], unten[(i + 1) % k], oben[(i + 1) % k], oben[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if fase:
        kanten = [e for e in bm.edges if len(e.link_faces) == 2 and
                  abs(e.link_faces[0].normal.dot(e.link_faces[1].normal)) < 0.5]
        bmesh.ops.bevel(bm, geom=kanten, offset=fase * MM, segments=2, affect="EDGES", profile=0.5)
    return fertig(name, bm, mat, col, glatt, winkel=35)


def zahnrad(name, zaehne, teilung, dicke, y, mitte, mat, col, innen=None, fase=0.4):
    """Kettenblatt/Ritzel: Zahnprofil in der Seitenebene, Teilkreis aus Zaehnezahl."""
    r = teilung / (2 * math.sin(math.pi / zaehne))
    pts = []
    for i in range(zaehne):
        w = 2 * math.pi * i / zaehne
        for dw, dr in ((-0.32, -3.6), (-0.16, 1.2), (0.0, 2.6), (0.16, 1.2), (0.32, -3.6)):
            ww = w + dw * 2 * math.pi / zaehne
            pts.append((mitte[0] + (r + dr) * math.cos(ww), mitte[1] + (r + dr) * math.sin(ww)))
    if innen:
        ob = ringplatte(name, pts, mitte, innen, y - dicke / 2, y + dicke / 2, mat, col, fase=fase)
    else:
        ob = platte(name, pts, y - dicke / 2, y + dicke / 2, mat, col, fase=fase, glatt=False)
    return ob, r


def ringplatte(name, umriss, mitte, r_innen, y0, y1, mat, col, fase=0.4):
    """Platte mit rundem Loch (Ritzel auf dem Freilauf): Innenkreis mit gleich vielen Punkten wie der Umriss,
    Ober- und Unterseite als Vierecke zwischen den beiden Ringen."""
    bm = bmesh.new()
    inn = []
    for x, z in umriss:
        w_ = math.atan2(z - mitte[1], x - mitte[0])
        inn.append((mitte[0] + r_innen * math.cos(w_), mitte[1] + r_innen * math.sin(w_)))
    k = len(umriss)
    def ring(pts, y):
        return [bm.verts.new(Vector((x * MM, y * MM, z * MM))) for x, z in pts]
    ao, au, io, iu = ring(umriss, y1), ring(umriss, y0), ring(inn, y1), ring(inn, y0)
    for i in range(k):
        j = (i + 1) % k
        bm.faces.new((io[i], io[j], ao[j], ao[i]))
        bm.faces.new((au[i], au[j], iu[j], iu[i]))
        bm.faces.new((ao[i], ao[j], au[j], au[i]))
        bm.faces.new((iu[i], iu[j], io[j], io[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if fase:
        kanten = [e for e in bm.edges if len(e.link_faces) == 2 and
                  abs(e.link_faces[0].normal.dot(e.link_faces[1].normal)) < 0.5]
        bmesh.ops.bevel(bm, geom=kanten, offset=fase * MM, segments=1, affect="EDGES", profile=0.5)
    return fertig(name, bm, mat, col, False, winkel=35)


def objekt_bm(bm, name, mat, col, glatt=True, winkel=40):
    return fertig(name, bm, mat, col, glatt, winkel)


def verbinden(name, teile, col=None):
    """Mehrere Objekte zu einem verbinden (gleiche Bauteilgruppe)."""
    if not teile:
        return None
    ctx = bpy.context
    for o in ctx.view_layer.objects:
        o.select_set(False)
    for t in teile:
        t.select_set(True)
    ctx.view_layer.objects.active = teile[0]
    with ctx.temp_override(active_object=teile[0], selected_editable_objects=teile, selected_objects=teile):
        bpy.ops.object.join()
    teile[0].name = name
    teile[0].data.name = name
    return teile[0]


def leer(name, ort, col, eltern=None):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = 0.03
    e.location = ort
    col.objects.link(e)
    if eltern:
        e.parent = eltern
    return e


def eltern_setzen(kind, eltern):
    bpy.context.view_layer.update()      # matrix_world erst nach dem Aktualisieren gueltig (location gerade gesetzt)
    mw = kind.matrix_world.copy()
    kind.parent = eltern
    kind.matrix_parent_inverse = eltern.matrix_world.inverted()
    kind.matrix_world = mw
