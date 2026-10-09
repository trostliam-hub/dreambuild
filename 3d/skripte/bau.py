"""Baut das Beispielrad (Propain Spindrift 5 AL, Groesse L, Mix/Mullet) in Blender 5.0 und speichert die .blend.
Aufruf: python bau.py <ziel.blend>   (mit dem bpy-Modul) oder blender -b -P bau.py -- <ziel.blend>
Alles reproduzierbar aus geo.py (Masse, Kinematik), werkzeug.py, teile.py, rahmen.py."""
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector, Matrix
import geo
import werkzeug as W
import teile as T
import rahmen as R
from werkzeug import MM, v

Z0 = geo.TRETLAGER_HOEHE                       # Tretlager ueber dem Boden


def P(p, y=0.0):
    return R.P(p, y, Z0)


DEKOR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "unterrohr-dekor.png")


def baue(lack="#e7e8e5", gabel="#b11c2a", dekor=DEKOR):
    """lack: Rahmenfarbe (zu dekor.LACK passend halten), gabel: Farbe der Tauchrohre, dekor: Schriftzug-Textur
    fuer das Unterrohr (dekor.py erzeugt sie; fehlt sie, bleibt das Unterrohr einfarbig)."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    W.materialien(lack, gabel)
    if dekor and os.path.exists(dekor):
        W.dekor_material("Lack_Rahmen_Dekor", dekor)
    haupt = W.sammlung("Spindrift_5_AL_L_Mix")
    C = {k: W.sammlung(k, haupt) for k in ("Rahmen", "Hinterbau", "Hebel", "Daempfer", "Gabel", "Laufrad_vorn", "Laufrad_hinten",
                                            "Antrieb", "Bremsen", "Cockpit", "Sitz", "Leitungen", "Steuerung")}
    S = C["Steuerung"]
    # ---------------- Steuer-Empties (Bewegung): alles haengt am Wurzel-Empty im Tretlager
    wurzel = W.leer("Rad_Wurzel", P((0, 0)), S)
    e_hinterbau = W.leer("Hinterbau_Pose", P(geo.U_HINTEN), S, wurzel)
    e_hebel_o = W.leer("Hebel_oben_Drehpunkt", P(geo.U_RAHMEN), S, wurzel)
    e_hebel_u = W.leer("Hebel_unten_Drehpunkt", P(geo.L_RAHMEN), S, wurzel)
    e_gabel = W.leer("Gabel_Federweg", P(geo.FA), S, wurzel)
    e_rad_v = W.leer("Vorderrad_Drehung", P(geo.FA), S, e_gabel)
    e_rad_h = W.leer("Hinterrad_Drehung", P(geo.RA), S, e_hinterbau)
    for e in (e_hinterbau, e_hebel_o, e_hebel_u, e_gabel, e_rad_v, e_rad_h):
        e.location = e.location - wurzel.location if e.parent == wurzel else e.location
    bpy.context.view_layer.update()
    # Lokale Positionen relativ zu Eltern setzen
    def setze(e, welt):
        e.matrix_world = Matrix.Translation(welt)
    setze(wurzel, P((0, 0)))
    bpy.context.view_layer.update()
    setze(e_hinterbau, P(geo.U_HINTEN)); setze(e_hebel_o, P(geo.U_RAHMEN)); setze(e_hebel_u, P(geo.L_RAHMEN))
    setze(e_gabel, P(geo.FA)); bpy.context.view_layer.update()
    setze(e_rad_v, P(geo.FA)); setze(e_rad_h, P(geo.RA)); bpy.context.view_layer.update()

    def an(ob, e):
        W.eltern_setzen(ob, e)
        return ob

    # ---------------- Rahmen
    rahmen, rinfo = R.hauptrahmen(geo, C["Rahmen"], Z0)
    an(rahmen, wurzel)
    for name, p, y in (("Lager_oben_Rahmen", geo.U_RAHMEN, 32), ("Lager_unten_Rahmen", geo.L_RAHMEN, 28)):
        an(R.lager(name, p, y, C["Hebel"], Z0), wurzel)
    # ---------------- Hinterbau und Hebel
    hb = R.hinterbau(geo, C["Hinterbau"], Z0, geo.R_HINTEN)
    an(hb, e_hinterbau)
    an(R.lager("Lager_Sitzstrebe", geo.U_HINTEN, 52, C["Hebel"], Z0), e_hinterbau)     # durchgehend: verbindet beide Sitzstreben
    an(R.lager("Lager_Kettenstrebe", geo.L_HINTEN, 46, C["Hebel"], Z0, y_innen=22), e_hinterbau)
    an(R.hebel_oben(geo, C["Hebel"], Z0), e_hebel_o)
    an(R.hebel_unten(geo, C["Hebel"], Z0), e_hebel_u)
    # ---------------- Daempfer zwischen den Augen (Lage und Richtung je Pose)
    et, eb = P(geo.D_OBEN), P(geo.D_UNTEN)
    achse = (et - eb).normalized()
    rot = Vector((0, 0, 1)).rotation_difference(achse).to_matrix().to_4x4()
    e_d_u = W.leer("Daempfer_unten", eb, S, wurzel); e_d_u.matrix_world = Matrix.Translation(eb) @ rot
    e_d_o = W.leer("Daempfer_oben", et, S, wurzel); e_d_o.matrix_world = Matrix.Translation(et) @ rot
    bpy.context.view_layer.update()
    el = geo.DAEMPFER_STATISCH
    to, tu, feder = T.daempfer(C["Daempfer"], C["Daempfer"], C["Daempfer"], et, eb, el=el)
    # Teile wurden um den Ursprung entlang z gebaut: in die Empties einhaengen
    for ob in to:
        ob.data.transform(Matrix.Translation(Vector((0, 0, -el * MM))))
        ob.parent = e_d_o
    for ob in tu:
        ob.parent = e_d_u
    for nme, p, yi, e in (("Daempfer_Buchse_oben", geo.D_OBEN, 26, e_hebel_o), ("Daempfer_Buchse_unten", geo.D_UNTEN, 22, e_hebel_u)):
        for s in (-1, 1):
            an(W.zyl(nme, P(p, s * 11), P(p, s * yi), 7.5, "Stahl_dunkel", C["Daempfer"], n=20), e)
        an(W.zyl(nme + "_Bolzen", P(p, -yi - 2), P(p, yi + 2), 4.0, "Stahl_dunkel", C["Daempfer"], n=12), e)
    e_federfuss = W.leer("Daempfer_Federfuss", Vector(), S, e_d_u)
    e_federfuss.location = Vector((0, 0, 32.5 * MM))     # Federanfang (teile.daempfer)
    feder.data.transform(Matrix.Translation(Vector((0, 0, -32.5 * MM))))
    feder.parent = e_federfuss
    # ---------------- Gabel: Krone und Standrohre fest, Tauchrohre federn mit dem Vorderrad
    d = Vector((geo.DIR_LENK[0], 0, geo.DIR_LENK[1]))
    q = Vector((-geo.DIR_LENK[1], 0, geo.DIR_LENK[0]))
    fest, beweg = T.gabel((C["Gabel"], C["Gabel"]), P(geo.HT_U), d, q, geo.GABEL_ACHSE_LAENGS, geo.GABEL_VERSATZ, P(geo.FA))
    for ob in fest:
        an(ob, wurzel)
    for ob in beweg:
        an(ob, e_gabel)
    # ---------------- Laufraeder
    fa, ra = P(geo.FA), P(geo.RA)
    vorn = [T.reifen("Reifen_vorn_29x2.5", geo.R_VORN, 63, fa, C["Laufrad_vorn"]),
            T.felge("Felge_vorn_29", 311, fa, C["Laufrad_vorn"]),
            T.nabe("Nabe_vorn_110", fa, C["Laufrad_vorn"], 110, 37),
            T.speichen("Speichen_vorn", fa, 37, 24, 300, C["Laufrad_vorn"]),
            T.bremsscheibe("Bremsscheibe_vorn_220", 110, fa, 46, C["Laufrad_vorn"])]
    for ob in vorn:
        an(ob, e_rad_v)
    hinten = [T.reifen("Reifen_hinten_27.5x2.5", geo.R_HINTEN, 63, ra, C["Laufrad_hinten"]),
              T.felge("Felge_hinten_27.5", 292, ra, C["Laufrad_hinten"]),
              T.nabe("Nabe_hinten_148", ra, C["Laufrad_hinten"], 148, (21, 33), freilauf=True),
              T.speichen("Speichen_hinten", ra, (21, 31), 24, 280, C["Laufrad_hinten"]),
              T.bremsscheibe("Bremsscheibe_hinten_203", 101.5, ra, 58.6, C["Laufrad_hinten"])]
    kas, kradien = T.kassette("Kassette_10-52", ra, C["Antrieb"], y_klein=-66.5)
    hinten.append(kas)
    for ob in hinten:
        an(ob, e_rad_h)
    # ---------------- Antrieb
    antrieb = []
    kurbel_w = math.radians(-35)
    for s, w in ((-1, kurbel_w), (1, kurbel_w + math.pi)):
        pe = (165 * math.cos(w), 165 * math.sin(w))
        um = W.kreise_umriss([(0, 0, 19), (pe[0] * 0.55, pe[1] * 0.55, 14), (pe[0], pe[1], 12)], n=28)
        y0, y1 = (-80, -67) if s < 0 else (67, 80)
        ob = W.platte(f"Kurbel_{'R' if s < 0 else 'L'}_165", [(x, z) for x, z in um], y0, y1, "Alu_schwarz_eloxiert", C["Antrieb"], fase=2.5)
        ob.data.transform(Matrix.Translation(Vector((0, 0, Z0 * MM))))
        antrieb.append(ob)
        antrieb.append(W.zyl(f"Pedalgewinde_{'R' if s < 0 else 'L'}", P(pe, s * 80), P(pe, s * 83), 8, "Stahl_dunkel", C["Antrieb"], n=16))
        # Flat-Pedal: Achse, Koerper 100 x 100 x 16 mm (waagerecht), Pins oben und unten
        sei = 'R' if s < 0 else 'L'
        antrieb.append(W.zyl(f"Pedal_Achse_{sei}", P(pe, s * 83), P(pe, s * 92), 7, "Stahl_dunkel", C["Antrieb"], n=16))
        mitte_p = P(pe, s * 142)
        ebene = (mitte_p, Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)))
        um_p = W.kreise_umriss([(-40, -40, 10), (40, -40, 10), (40, 40, 10), (-40, 40, 10)], n=32)
        antrieb.append(W.platte(f"Pedal_{sei}", um_p, -8, 8, "Lager", C["Antrieb"], fase=2.0, ebene=ebene))
        antrieb.append(W.zyl(f"Pedal_Lagerhuelse_{sei}", P(pe, s * 92), P(pe, s * 192), 9.5, "Stahl_dunkel", C["Antrieb"], n=20))
        for px_ in (-42, -14, 14, 42):
            for py_ in (-44, 44):
                for pz_ in (-1, 1):
                    fuss = mitte_p + Vector((px_ * MM, py_ * MM, pz_ * 8 * MM))
                    antrieb.append(W.zyl(f"Pedal_Pin_{sei}", fuss, fuss + Vector((0, 0, pz_ * 4 * MM)), 1.6, "Stahl_dunkel", C["Antrieb"], n=8))
    antrieb.append(W.zyl("Tretlagerachse", P((0, 0), -80), P((0, 0), 80), 14.5, "Alu_schwarz_eloxiert", C["Antrieb"], n=32))
    for s in (-1, 1):
        antrieb.append(W.zyl("Tretlagerschale", P((0, 0), s * 36.5), P((0, 0), s * 44), 22.5, "Kunststoff_schwarz", C["Antrieb"], n=32))
    blatt, r_blatt = W.zahnrad("Kettenblatt_32", 32, 12.7, 3.0, -52, (0, 0), "Alu_schwarz_eloxiert", C["Antrieb"])
    blatt.data.transform(Matrix.Translation(Vector((0, 0, Z0 * MM))))
    antrieb.append(blatt)
    antrieb.append(W.platte("Kettenblatt_Aufnahme", W.kreise_umriss([(0, 0, 44)], n=40), -56, -50, "Alu_schwarz_eloxiert", C["Antrieb"], fase=1.0))
    antrieb[-1].data.transform(Matrix.Translation(Vector((0, 0, Z0 * MM))))
    # Kettenfuehrung: Rolle oben hinten, Bashguard unten
    w_ob = math.radians(68)          # oben vorn: frei vom Kettenstreben-Lager hinter dem Tretlager
    gp = ((r_blatt + 14) * math.cos(w_ob), (r_blatt + 14) * math.sin(w_ob))
    for y0, y1 in ((-61, -58), (-46, -43)):
        ob = W.platte("Kettenfuehrung_oben", W.kreise_umriss([(gp[0], gp[1], 13), (gp[0] * 0.55, gp[1] * 0.55, 9)], n=24), y0, y1,
                      "Kunststoff_schwarz", C["Antrieb"], fase=0.8)
        ob.data.transform(Matrix.Translation(Vector((0, 0, Z0 * MM))))
        antrieb.append(ob)
    bash = []
    for k in range(25):
        w = math.radians(205 + k * 5.6)
        bash.append(((r_blatt + 8) * math.cos(w), (r_blatt + 8) * math.sin(w)))
    for k in range(24, -1, -1):
        w = math.radians(205 + k * 5.6)
        bash.append(((r_blatt + 17) * math.cos(w), (r_blatt + 17) * math.sin(w)))
    ob = W.platte("Bashguard", bash, -60, -55, "Kunststoff_schwarz", C["Antrieb"], fase=0.8)
    ob.data.transform(Matrix.Translation(Vector((0, 0, Z0 * MM))))
    antrieb.append(ob)
    for ob in antrieb:
        an(ob, wurzel)
    # Schaltwerk und Kette (Ritzel 21)
    r21, y21 = kradien[21]
    up = (geo.RA[0] + 6, geo.RA[1] - r21 - 40)
    lp = (up[0] + 80 * math.sin(math.radians(24)), up[1] - 80 * math.cos(math.radians(24)))
    rp = 12.7 / (2 * math.sin(math.pi / 12))
    sw = []
    for nme, c in (("Schaltrolle_oben", up), ("Schaltrolle_unten", lp)):
        ob, _ = W.zahnrad(nme, 12, 12.7, 6, y21, c, "Kunststoff_schwarz", C["Antrieb"])
        ob.data.transform(Matrix.Translation(Vector((0, 0, Z0 * MM))))
        sw.append(ob)
    kaefig = W.kreise_umriss([(up[0], up[1], rp + 9), (lp[0], lp[1], rp + 11)], n=28)
    kaefig_i = W.kreise_umriss([(up[0], up[1], 10), (lp[0], lp[1], rp + 11)], n=28)   # innen oben kurz: frei von den grossen Ritzeln
    for y0, y1, nme, um in ((y21 - 9, y21 - 6.5, "Kaefig_aussen", kaefig), (y21 + 6.5, y21 + 8.5, "Kaefig_innen", kaefig_i)):
        ob = W.platte("Schaltwerk_" + nme, um, y0, y1, "Alu_schwarz_eloxiert" if "aussen" in nme else "Kunststoff_schwarz", C["Antrieb"], fase=0.8)
        ob.data.transform(Matrix.Translation(Vector((0, 0, Z0 * MM))))
        sw.append(ob)
    koerper = W.kreise_umriss([(geo.RA[0] - 4, geo.RA[1] - 18, 13), (geo.RA[0] - 22, geo.RA[1] - 48, 17), (up[0] - 2, up[1] + 14, 15)], n=28)
    ob = W.platte("Schaltwerk_Koerper", koerper, -98, -84, "Alu_schwarz_eloxiert", C["Antrieb"], fase=3.0)
    ob.data.transform(Matrix.Translation(Vector((0, 0, Z0 * MM))))
    sw.append(ob)
    sw.append(W.zyl("Schaltwerk_Achse", P(up, -92), P(up, y21), 6, "Stahl_dunkel", C["Antrieb"], n=16))
    for ob in sw:
        an(ob, e_hinterbau)
    kreise = [(0.0, 0.0, r_blatt, 1), (geo.RA[0], geo.RA[1], r21, 1), (up[0], up[1], rp, -1), (lp[0], lp[1], rp, 1)]
    # Kette mit Skelett: Glieder am Kettenblatt folgen dem Rahmen, an Kassette/Schaltwerk dem Hinterbau; jedes
    # freie Trum hat einen eigenen Knochen vom Kettenblatt zum Ritzel bzw. zur Schaltrolle, der beim Einfedern
    # dorthin gedreht und gestreckt wird (so bleibt das Trum gerade und die Kette geschlossen)
    pfad = T.riemen_pfad(kreise)
    stuecke = sorted(((math.dist(pfad[i], pfad[i + 1]), pfad[i], pfad[i + 1]) for i in range(len(pfad) - 1)), reverse=True)[:2]
    trume = []
    for _, t0_, t1_ in stuecke:
        a_, b_ = (t0_, t1_) if math.hypot(*t0_) < math.hypot(*t1_) else (t1_, t0_)      # a_ am Kettenblatt
        trume.append((a_, b_))
    trume.sort(key=lambda tr: -(tr[0][1] + tr[1][1]))                                   # oberes Trum zuerst
    def zuordnung(x, z):
        if math.hypot(x, z) < r_blatt + 7:
            return 0
        for k, (a_, b_) in enumerate(trume):
            d = (b_[0] - a_[0], b_[1] - a_[1]); L2 = d[0] ** 2 + d[1] ** 2
            t = ((x - a_[0]) * d[0] + (z - a_[1]) * d[1]) / L2
            tc = max(0.0, min(1.0, t))
            if math.dist((x, z), (a_[0] + d[0] * tc, a_[1] + d[1] * tc)) < 8 and 0.0 <= t <= 1.0:
                return 2 + k
        return 1
    skel_d = bpy.data.armatures.new("Kette_Skelett")
    skel = bpy.data.objects.new("Kette_Skelett", skel_d)
    S.objects.link(skel)
    bpy.context.view_layer.objects.active = skel
    skel.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    knochen = [("Kette_Rahmen", P((0.0, 0.0)), P((0.0, 0.0)) + Vector((0, 0.05, 0))),
               ("Kette_Hinterbau", P(geo.U_HINTEN), P(geo.U_HINTEN) + Vector((0, 0.05, 0))),
               ("Kette_Trum_oben", P(trume[0][0], -52), P(trume[0][1], -52)),
               ("Kette_Trum_unten", P(trume[1][0], -52), P(trume[1][1], -52))]
    for nme, kopf, ende in knochen:
        eb_ = skel_d.edit_bones.new(nme)
        eb_.head, eb_.tail = kopf, ende
        eb_.roll = 0.0
    bpy.ops.object.mode_set(mode="OBJECT")
    skel.select_set(False)
    an(skel, wurzel)
    kt, _ = T.kette("Kette", kreise, -52, y21, Z0, C["Antrieb"], gruppen=[k[0] for k in knochen], zuordnung=zuordnung)
    an(kt, skel)
    mod = kt.modifiers.new("Skelett", "ARMATURE")
    mod.object = skel
    bpy.context.view_layer.update()
    hb_ruhe = e_hinterbau.matrix_world.copy()
    skel_ruhe = skel.matrix_world.copy()
    # ---------------- Bremssaettel (vierkolben)
    def sattel_bremse(name, achse_p, r_scheibe, winkel, y, col):
        c = (achse_p[0] + (r_scheibe - 9) * math.cos(winkel), achse_p[1] + (r_scheibe - 9) * math.sin(winkel))
        t = (-math.sin(winkel), math.cos(winkel))
        um = W.kreise_umriss([(c[0] + t[0] * 26, c[1] + t[1] * 26, 15), (c[0] - t[0] * 26, c[1] - t[1] * 26, 15),
                              (c[0] + math.cos(winkel) * 6, c[1] + math.sin(winkel) * 6, 18)], n=24)
        ob = W.platte(name, um, y - 15, y + 15, "Alu_schwarz_eloxiert", col, fase=4.0)
        ob.data.transform(Matrix.Translation(Vector((0, 0, Z0 * MM))))
        return ob
    sv = sattel_bremse("Bremssattel_vorn", geo.FA, 110, math.radians(205), 46, C["Bremsen"])
    an(sv, e_gabel)
    sh = sattel_bremse("Bremssattel_hinten", geo.RA, 101.5, math.radians(48), 58.6, C["Bremsen"])
    an(sh, e_hinterbau)
    # ---------------- Cockpit
    hto = P(geo.HT_O)
    oben = -d
    teile_c = []
    teile_c.append(W.zyl("Steuersatz_oben", hto, hto + oben * (8 * MM), 28.5, "Kunststoff_schwarz", C["Cockpit"], n=40, r2=24))
    teile_c.append(W.zyl("Spacer", hto + oben * (8 * MM), hto + oben * (18 * MM), 18.5, "Alu_schwarz_eloxiert", C["Cockpit"], n=32))
    v0 = hto + oben * (18 * MM)
    vm = v0 + oben * (20 * MM)
    teile_c.append(W.zyl("Vorbau_Klemmung", v0, v0 + oben * (40 * MM), 21, "Alu_schwarz_eloxiert", C["Cockpit"], n=36))
    teile_c.append(W.zyl("Gabelschaft_Kappe", v0 + oben * (40 * MM), v0 + oben * (44 * MM), 17, "Alu_schwarz_eloxiert", C["Cockpit"], n=32))
    lm = vm + q * (50 * MM)
    teile_c.append(W.rohr("Vorbau_Koerper", [vm, vm.lerp(lm, 0.5), lm], [44, 40, 40], [32, 30, 32], "Alu_schwarz_eloxiert", C["Cockpit"], n=24))
    teile_c.append(W.zyl("Vorbau_Lenkerklemme", lm + Vector((0, -27 * MM, 0)), lm + Vector((0, 27 * MM, 0)), 22.5, "Alu_schwarz_eloxiert", C["Cockpit"], n=32))
    lenk, lpts = T.lenker(C["Cockpit"], lm, d, q)
    teile_c.append(lenk)
    for s, ende in ((-1, lpts[0]), (1, lpts[-1])):
        innen = lpts[1] if s < 0 else lpts[-2]
        r_ = (ende - innen).normalized()
        g0 = ende - r_ * (135 * MM)
        teile_c.append(W.zyl(f"Griff_{'R' if s < 0 else 'L'}", g0, ende + r_ * (2 * MM), 16.5, "Gummi", C["Cockpit"], n=28))
        teile_c.append(W.zyl(f"Griffring_{'R' if s < 0 else 'L'}", g0 - r_ * (6 * MM), g0, 17.5, "Alu_schwarz_eloxiert", C["Cockpit"], n=28))
        # Bremshebel: Geberzylinder + Hebel nach vorn unten
        k0 = g0 - r_ * (22 * MM)
        teile_c.append(W.zyl(f"Bremshebel_Schelle_{'R' if s < 0 else 'L'}", k0 - r_ * (7 * MM), k0 + r_ * (7 * MM), 16, "Alu_schwarz_eloxiert", C["Cockpit"], n=24))
        gz = k0 + q * (30 * MM) + oben * (8 * MM)
        teile_c.append(W.zyl(f"Geberzylinder_{'R' if s < 0 else 'L'}", k0 + q * (8 * MM), gz, 11, "Alu_schwarz_eloxiert", C["Cockpit"], n=24))
        blatt_pts = [gz, gz + r_ * (40 * MM) + q * (14 * MM) - oben * (6 * MM), gz + r_ * (95 * MM) + q * (8 * MM) - oben * (18 * MM)]
        teile_c.append(W.rohr(f"Bremshebel_{'R' if s < 0 else 'L'}", blatt_pts, [8, 7, 7], [16, 14, 13], "Alu_schwarz_eloxiert", C["Cockpit"], n=16, seite=oben))
    for ob in teile_c:
        an(ob, wurzel)
    # ---------------- Sattelstuetze (Dropper 34,9) und Sattel
    sd = Vector((geo.SITZ_DIR[0], 0, geo.SITZ_DIR[1]))
    t_sattel = 770.0
    sr = P(geo.SR_O)
    stz = []
    stz.append(W.zyl("Stuetze_Aussenrohr", sr - sd * (60 * MM), sr + sd * (64 * MM), 17.45, "Alu_schwarz_eloxiert", C["Sitz"], n=40))
    stz.append(W.zyl("Stuetze_Dichtkopf", sr + sd * (64 * MM), sr + sd * (74 * MM), 18.5, "Kunststoff_schwarz", C["Sitz"], n=40))
    kopf = P(geo.st(t_sattel - 62))
    stz.append(W.zyl("Stuetze_Innenrohr", sr + sd * (74 * MM), kopf, 15.5, "Standrohr", C["Sitz"], n=40))
    stz.append(W.zyl("Stuetze_Kopf", kopf, kopf + sd * (22 * MM), 17.5, "Alu_schwarz_eloxiert", C["Sitz"], n=32))
    klemme = kopf + sd * (30 * MM)
    stz.append(W.zyl("Stuetze_Klemme", klemme + Vector((0, -18 * MM, 0)), klemme + Vector((0, 18 * MM, 0)), 10, "Alu_schwarz_eloxiert", C["Sitz"], n=20))
    vorn_h = Vector((1, 0, 0))
    hinten_s = klemme + vorn_h * (-135 * MM) + Vector((0, 0, 20 * MM))
    spitze = klemme + vorn_h * (140 * MM) + Vector((0, 0, 12 * MM))
    stz.append(T.sattel(C["Sitz"], spitze, hinten_s, Vector((0, 0, 1))))
    for s in (-1, 1):
        stz.append(W.rohr("Sattelstrebe", [hinten_s + Vector((25 * MM, s * 30 * MM, 4 * MM)), klemme + Vector((0, s * 22 * MM, 4 * MM)),
                                           spitze + Vector((-40 * MM, s * 8 * MM, -2 * MM))], 7, 7, "Stahl_dunkel", C["Sitz"], n=12))
    for ob in stz:
        an(ob, wurzel)
    # ---------------- Leitungen (Bremsleitungen, Schaltzug) als sichtbare Bogen
    lt = []
    hto_m = P(geo.HT_O).lerp(P(geo.HT_U), 0.42)
    # Schaltzug rechts, Bremsleitung hinten links, Sattelstuetzen-Zug von der Fernbedienung links innen
    for s, nme, li, bogen, dy in ((-1, "Schaltzug", 2, 110, 0), (1, "Bremsleitung_hinten", -3, 110, 0), (1, "Stuetzenzug", -4, 85, -9)):
        start = lpts[li] + q * (25 * MM)
        ende = hto_m + Vector((0, (s * 30 + dy) * MM, 0)) + d * (14 * MM if nme == "Stuetzenzug" else 0)
        mitte = start.lerp(ende, 0.5) + q * (bogen * MM) - oben * (20 * MM)
        lt.append(W.rohr(nme, [start, mitte, ende], 5, 5, "Kunststoff_schwarz", C["Leitungen"], n=10, seite=oben))
    for ob in lt:
        an(ob, wurzel)
    # Schaltzug am Hinterbau: aus der Kettenstrebe zum Schaltwerk
    a = P((geo.RA[0] + 70, geo.RA[1] + 18), -72)
    e = P((geo.RA[0] - 18, geo.RA[1] - 40), -92)
    zug = W.rohr("Schaltzug_hinten", [a, a.lerp(e, 0.5) + Vector((-30 * MM, -8 * MM, -10 * MM)), e], 5, 5, "Kunststoff_schwarz", C["Leitungen"], n=10)
    an(zug, e_hinterbau)
    bpy.context.view_layer.update()
    return dict(skelett=skel, hb_ruhe=hb_ruhe, skelett_ruhe=skel_ruhe, wurzel=wurzel, hinterbau=e_hinterbau, hebel_o=e_hebel_o, hebel_u=e_hebel_u, gabel=e_gabel, rad_v=e_rad_v, rad_h=e_rad_h,
                d_oben=e_d_o, d_unten=e_d_u, federfuss=e_federfuss, rot=rot)


# ================================================================ Pose
def pose(E, hub_hinten=0.0, hub_vorn=0.0, boden=True, rollen_mm=0.0):
    """Setzt alle Steuer-Empties fuer Daempferhub (mm) und Gabelhub (mm). boden: Rahmen so drehen/heben,
    dass beide Raeder auf dem Boden bleiben. rollen_mm: Rad um diese Strecke vorgerollt (Raeder drehen passend)."""
    phi = geo.phi_fuer_hub(hub_hinten) if hub_hinten > 0 else 0.0
    r = geo.loese(phi)
    W_ = E["wurzel"]
    # Hinterbau (starr): Drehung theta um U_HINTEN, Ursprung wandert nach C
    E["hinterbau"].matrix_world = W_.matrix_world @ (Matrix.Translation(P(r['C']) - P((0, 0))) @ Matrix.Rotation(-r['theta'], 4, "Y")
                                                     @ Matrix.Translation(-(P(geo.U_HINTEN) - P(geo.U_HINTEN))))
    E["hebel_o"].matrix_world = W_.matrix_world @ Matrix.Translation(P(geo.U_RAHMEN) - P((0, 0))) @ Matrix.Rotation(-r['phi'], 4, "Y")
    E["hebel_u"].matrix_world = W_.matrix_world @ Matrix.Translation(P(geo.L_RAHMEN) - P((0, 0))) @ Matrix.Rotation(-r['psi'], 4, "Y")
    # Daempfer
    et, eb = P(r['et']), P(r['eb'])
    rot = Vector((0, 0, 1)).rotation_difference((et - eb).normalized()).to_matrix().to_4x4()
    E["d_unten"].matrix_world = W_.matrix_world @ Matrix.Translation(eb - P((0, 0))) @ rot
    E["d_oben"].matrix_world = W_.matrix_world @ Matrix.Translation(et - P((0, 0))) @ rot
    L = (et - eb).length / MM
    # Feder reicht von 32,5 mm (unten) bis 64,5 mm unter dem oberen Auge: Laenge L - 97
    E["federfuss"].scale = (1, 1, (L - 97) / (geo.DAEMPFER_STATISCH - 97))
    # Gabel: Tauchrohre und Vorderrad entlang der Lenkachse
    d = Vector((geo.DIR_LENK[0], 0, geo.DIR_LENK[1]))
    E["gabel"].matrix_world = W_.matrix_world @ Matrix.Translation(P(geo.FA) - P((0, 0)) - d * (hub_vorn * MM))
    # Raeder drehen beim Rollen (Abrollen ohne Schlupf): Winkel = Weg / Radius
    # Abstand Nabe -> Eltern-Ursprung bleibt erhalten (Hinterrad haengt am Hinterbau-Empty in U_HINTEN)
    E["rad_v"].matrix_local = Matrix.Rotation(rollen_mm / geo.R_VORN, 4, "Y")
    E["rad_h"].matrix_local = Matrix.Translation(P(geo.RA) - P(geo.U_HINTEN)) @ Matrix.Rotation(rollen_mm / geo.R_HINTEN, 4, "Y")
    if boden:
        # Rahmenlage so, dass beide Reifen den Boden beruehren und das Hinterrad an seinem Ort bleibt
        af = (geo.FA[0] - geo.DIR_LENK[0] * hub_vorn, geo.FA[1] - geo.DIR_LENK[1] * hub_vorn)
        ar = r['achse']
        dx, dz = af[0] - ar[0], af[1] - ar[1]
        soll = (geo.R_VORN - geo.R_HINTEN)
        alpha = math.asin(max(-1, min(1, soll / math.hypot(dx, dz)))) - math.atan2(dz, dx)
        ca, sa = math.cos(alpha), math.sin(alpha)
        welt_ar = (ar[0] * ca - ar[1] * sa, ar[0] * sa + ar[1] * ca)
        tx, tz = geo.RA[0] - welt_ar[0] + rollen_mm, geo.RA[1] - welt_ar[1]
        E["wurzel"].matrix_world = Matrix.Translation(Vector((tx * MM, 0, (tz + Z0) * MM))) @ Matrix.Rotation(-alpha, 4, "Y")
    bpy.context.view_layer.update()
    # Ketten-Knochen "Hinterbau" deckt sich mit dem Hinterbau-Empty (Ruhelage: beide in U_HINTEN, ohne Drehung)
    sk = E["skelett"]
    pb = sk.pose.bones["Kette_Hinterbau"]
    pb.matrix = sk.matrix_world.inverted() @ E["hinterbau"].matrix_world
    # Trum-Knochen: Kopf bleibt am Kettenblatt, Ende folgt dem Hinterbau (Ritzel bzw. Schaltrolle)
    zu_hb = E["hinterbau"].matrix_world @ E["hb_ruhe"].inverted()
    inv = sk.matrix_world.inverted()
    for nme in ("Kette_Trum_oben", "Kette_Trum_unten"):
        bo = sk.data.bones[nme]
        kopf = bo.head_local
        ende_welt_ruhe = E["skelett_ruhe"] @ bo.tail_local
        ende = inv @ (zu_hb @ ende_welt_ruhe)
        r0, r1 = (bo.tail_local - kopf), (ende - kopf)
        dreh = r0.normalized().rotation_difference(r1.normalized()).to_matrix()
        m = (dreh @ bo.matrix_local.to_3x3()).to_4x4()
        m.translation = kopf
        sk.pose.bones[nme].matrix = m @ Matrix.Diagonal((1.0, r1.length / r0.length, 1.0, 1.0))
    bpy.context.view_layer.update()


def keyframes(E, frame):
    # Alle Steuer-Empties teilen eine Aktion (je Objekt ein Slot): im GLB wird daraus genau ein Clip
    akt = bpy.data.actions.get("Spindrift_Bewegung") or bpy.data.actions.new("Spindrift_Bewegung")
    for k in ("wurzel", "hinterbau", "hebel_o", "hebel_u", "gabel", "rad_v", "rad_h", "d_oben", "d_unten", "federfuss"):
        ob = E[k]
        ad = ob.animation_data or ob.animation_data_create()
        if ad.action is None:
            ad.action = akt
        ob.keyframe_insert("location", frame=frame)
        ob.keyframe_insert("rotation_euler", frame=frame)
        ob.keyframe_insert("scale", frame=frame)
    sk = E["skelett"]
    ad = sk.animation_data or sk.animation_data_create()
    if ad.action is None:
        ad.action = akt
    for nme in ("Kette_Hinterbau", "Kette_Trum_oben", "Kette_Trum_unten"):
        pb = sk.pose.bones[nme]
        pb.rotation_mode = "QUATERNION"
        pb.keyframe_insert("location", frame=frame)
        pb.keyframe_insert("rotation_quaternion", frame=frame)
        pb.keyframe_insert("scale", frame=frame)


def animation(E, fps=30):
    """Federn (Bild 1-46): kurz 40 % einfedern und zurueck. Rollen (Bild 61-121): 0,5 m vorrollen, Raeder drehen."""
    sc = bpy.context.scene
    sc.render.fps = fps
    for f in range(1, 47):
        t = (f - 1) / 45
        k = math.sin(math.pi * min(1, t * 1.25)) ** 2 if t < 0.8 else 0.0
        pose(E, hub_hinten=geo.DAEMPFER_HUB * 0.4 * k, hub_vorn=geo.FEDERWEG_VORN * 0.4 * k)
        keyframes(E, f)
    for f in range(61, 122):
        t = (f - 61) / 60
        s = t * t * (3 - 2 * t)
        pose(E, rollen_mm=500 * s)
        keyframes(E, f)
    sc.frame_start, sc.frame_end = 1, 121
    pose(E)


# ================================================================ Studio
def studio(hintergrund=(0.94, 0.94, 0.96)):
    sc = bpy.context.scene
    col = W.sammlung("Studio")
    # Schattenfaenger als Boden
    bpy.ops.mesh.primitive_plane_add(size=12, location=(0.2, 0, 0))
    boden = bpy.context.active_object
    boden.name = "Boden_Schattenfaenger"
    for c in boden.users_collection:
        c.objects.unlink(boden)
    col.objects.link(boden)
    boden.is_shadow_catcher = True
    # Welt: neutral, wenig Umgebungslicht
    w = bpy.data.worlds.new("Studio")
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (*hintergrund, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.15
    # Lichter: grosse Softbox oben vorn, Aufhellung, zwei Streiflichter von hinten fuer klare Kanten
    def flaeche(name, ort, ziel, energie, groesse, form="RECTANGLE", gy=None, schatten=True):
        l = bpy.data.lights.new(name, "AREA")
        l.use_shadow = schatten
        l.energy = energie
        l.shape = form
        l.size = groesse
        l.size_y = gy or groesse
        ob = bpy.data.objects.new(name, l)
        ob.location = ort
        ob.rotation_euler = (Vector(ziel) - Vector(ort)).to_track_quat("-Z", "Y").to_euler()
        col.objects.link(ob)
        return ob
    flaeche("Softbox_oben", (0.35, -1.6, 2.6), (0.2, 0, 0.55), 320, 2.4, gy=1.6)
    flaeche("Aufheller", (0.4, -3.0, 0.6), (0.2, 0, 0.6), 70, 2.0, gy=1.2)
    # Streiflichter nur fuer Kanten: ohne eigenen Schatten (sonst unruhige Bodenschatten)
    flaeche("Streiflicht_hinten_links", (-1.8, 1.4, 1.4), (0.0, 0, 0.6), 160, 0.6, gy=2.4, schatten=False)
    flaeche("Streiflicht_hinten_rechts", (2.2, 1.2, 1.5), (0.3, 0, 0.6), 140, 0.6, gy=2.4, schatten=False)
    flaeche("Kante_unten", (0.2, -1.4, 0.15), (0.2, 0, 0.4), 25, 3.0, gy=0.3, schatten=False)
    # Kameras
    cs = bpy.data.cameras.new("Seite")
    cs.type = "ORTHO"
    cs.ortho_scale = 2.15
    ks = bpy.data.objects.new("Kamera_Seite", cs)
    ks.location = (0.2, -6.0, 0.62)
    ks.rotation_euler = (math.radians(90), 0, 0)
    col.objects.link(ks)
    cd = bpy.data.cameras.new("Dreiviertel")
    cd.lens = 85
    kd = bpy.data.objects.new("Kamera_Dreiviertel", cd)
    ziel = Vector((0.18, 0.0, 0.58))
    ort = Vector((2.55, -5.6, 1.35))
    kd.location = ort
    kd.rotation_euler = (ziel - ort).to_track_quat("-Z", "Y").to_euler()
    col.objects.link(kd)
    sc.camera = ks
    # Render
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 128
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.view_settings.exposure = -1.0
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    return dict(seite=ks, dreiviertel=kd)


if __name__ == "__main__":
    ziel = sys.argv[-1] if sys.argv[-1].endswith(".blend") else os.path.abspath("spindrift-5-al.blend")
    E = baue()
    kam = studio()
    if os.environ.get("ANIMATION", "1") == "1":
        animation(E)
    bpy.context.scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=ziel, compress=True)
    print("gespeichert", ziel)
