# NONE LEADING OUT – Teil 4 "The Locked Door" (Hinterkaifeck 1922)
# Erzähltext wörtlich aus tc_scripts/B_part4.json (faktengeprüft). Fakten für Einblendungen: tc_scripts/research_B.json
# (Fund 4.4.1922; Münchner Kripo unter Georg Reingruber am 5.4. früh; Beerdigung Waidhofen 8.4.1922; Abriss 1923;
#  Schlittenbauer: Vaterschaft für Josef 1919 anerkannt, Heirat mit Viktoria vom Vater verweigert, NIE angeklagt).
# Neutralität: Schlittenbauer erscheint nur als "SUSPECT · NEVER CHARGED", nie als Täter; keine Leichen, kein Blut, keine Gesichter.
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from tc_common import *

S = sys.argv[1]
CAP = {"captionY": 1500, "capBox": True}

def pop(text, at, y=560, size=72, dur=30, rot=-0.03, x=540):
    """Rote Einblendung im Bildschirmraum (beat.pops) – bleibt bis Beat-Ende stehen."""
    return {"text": text, "at": at, "x": x, "y": y, "size": size, "dur": dur, "rot": rot}

# Pinnwand: dieselben Karten über drei Beats (früher gelandete Karten mit negativer Zeit = schon da)
TITLE_B = "SUSPECT · NEVER CHARGED"
# Fäden laufen von Nadel zu Nadel über alles: Nachbarkarte mittig, Viktoria/Josef seitlich auf Nadelhöhe (flache Fäden,
# Name bleibt lesbar), Vater ohne Faden unter Viktoria.
# Josef-Karte aus der rechten TikTok-Leiste geholt (x 0.97 -> 0.88); damit sie den Namen nicht verdeckt, sitzt die
# Nachbarkarte etwas weiter links (0.46 -> 0.37).
C_NB = {"text": "L. SCHLITTENBAUER\nNEIGHBOR\nFOUND THE FAMILY", "x": 0.37, "y": 0.47, "rot": -0.02, "s": 1.1}
C_VI = {"text": "WANTED TO MARRY\nVIKTORIA", "x": 0.03, "y": 0.25, "rot": 0.05, "s": 0.9}
C_FA = {"text": "HER FATHER\nREFUSED", "x": 0.09, "y": 0.77, "rot": -0.05, "s": 0.9}
C_JO = {"text": "JOSEF\nACKNOWLEDGED AS\nHIS SON, 1919", "x": 0.88, "y": 0.36, "rot": -0.04, "s": 0.9}
def card(c, at): return {**c, "at": at}

# Küche ohne Brot/Teller (ruhiger), Kerze als einziges Licht
KIT = {"bread": False, "plate": False}
# Abriss 1923: Zwischenstand, an dem 8a endet und 8b weitermacht
DEMO_ST = 0.4

B = []
# 0a: der Hof am Abend des Fundes – Häuser dunkel, eine Laterne zur Tür, YOU ARE HINTERKAIFECK
B.append({"scene": "farm_snow", "clock": "4 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [560, 900],
    "p": {"lit": [], "smoke": False, "barnDoor": 0.35, "dark": 0.25,
          "lantern": {"x0": 250, "x1": 640, "t0": 0.0, "t1": 2.4}, "label": {"text": "YOU ARE HINTERKAIFECK", "at": 0.1}},
    "lines": [L("Inside, they find the last two:", emph=["last"])], "pre": 0.15, "post": 0.25, "minDur": 2.7,
    "sfx": [{"name": "footsteps_snow", "at": 0.0, "gain": -9}, {"name": "lantern_squeak", "at": 0.5, "gain": -10},
            {"name": "typewriter_burst", "at": 0.1, "gain": -15}]})
# 1) 0b: die beiden Namen – leise, weiß, keine Treffer, kein Rot
B.append({"scene": "memorial", "clock": "4 APR 1922", **CAP, "noHud": True, "trans": "cut", "zoom": [1.0, 1.04], "focus": [540, 700],
    "p": {"title": "INSIDE THE HOUSE", "names": [{"name": "JOSEF", "sub": "2 YEARS OLD"}, {"name": "MARIA", "sub": "THE NEW MAID"}],
          "at": "@josef-0.2", "gap": 0.62},
    "lines": [L("two-year-old Josef, and Maria, the new maid.", emph=["Josef", "Maria"])], "post": 0.7})
# 2) 1a: Küche – das Schlüsselbrett; beim Wort "missing" verschwinden die Schlüssel, roter Ring
B.append({"scene": "kitchen_old", "clock": "4 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.1], "focus": [470, 640],
    "p": {**KIT, "keyHook": {"keys": 1, "empty": "@missing"}, "dark": 0.6},
    "pops": [pop("THE MISSING KEY?", "@missing+0.3", y=880, size=72)],
    "lines": [L("How that door was opened is still disputed.", emph=["disputed"]), L("Some point to your missing key.", emph=["missing"])], "post": 0.3,
    "punch": ["@disputed"],
    "flash": [{"at": "@missing", "d": 0.1, "c": "#ff2020", "a": 0.18}],
    "sfx": [{"name": "keys_jingle", "at": "@missing-0.1", "gain": -6}]})
# 3) 1b: zwei Versionen nebeneinander – neutral, keine Wertung. Kein Name auf dem Bildschirm (sonst liest sich der Name als
#    Antwort auf die Frage); "pre" 0.7, damit beide Etiketten stehen, bevor der Name gesprochen wird. Kein "?" hinter seiner Aussage.
B.append({"scene": "choice_split", "clock": "4 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.04], "focus": [540, 900],
    "p": {"title": "TWO ACCOUNTS", "kicker": "HOW THE DOOR WAS OPENED", "a": "THE MISSING|KEY?", "b": "KEY ALREADY IN|THE LOCK, INSIDE",
          "optA": "SOME ACCOUNTS", "optB": "HIS STATEMENT", "iconA": "door", "iconB": "door"},
    "lines": [L("Schlittenbauer said a key was already in the lock, on the inside.", emph=["lock", "inside"])], "pre": 0.7, "post": 0.45,
    "sfx": [{"name": "whoosh_dark", "at": 0.0, "gain": -14}, {"name": "keys_lock", "at": "@lock+0.3", "gain": -8}]})
# 4) 2a: Spuren im Schnee, jetzt hin UND zurück – Schaulustige zertrampeln den Tatort
B.append({"scene": "footprints", "clock": "4 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 1000],
    "p": {"t0": 0.0, "t1": "@trample+0.4", "n": 14, "back": True},
    "pops": [pop("SCENE UNPROTECTED", "@trample", y=600, size=74, rot=-0.03)],
    "lines": [L("Before the detectives arrive, onlookers trample through you,", emph=["trample"])], "post": 0.15,
    "sfx": [{"name": "footsteps_snow", "at": 0.0, "gain": -6}, {"name": "footsteps_snow", "at": 1.3, "gain": -8}, {"name": "footsteps_snow", "at": 2.4, "gain": -10}]})
# 5) 2b: in der Küche raucht der Ofen – nur "reportedly"
B.append({"scene": "kitchen_old", "clock": "4 APR 1922", **CAP, "trans": "cut", "zoom": [1.02, 1.08], "focus": [300, 900],
    "p": {**KIT, "keyHook": False, "smoke": True, "dark": 0.5},
    "pops": [pop("REPORTEDLY", "@reportedly", y=1250, size=70, rot=0.03)],
    "lines": [L("and reportedly cook in your kitchen.", emph=["cook"])], "post": 0.55, "minDur": 2.7,
    "sfx": [{"name": "wood_creak_heavy", "at": 0.1, "gain": -10}, {"name": "footsteps_approach", "at": 0.2, "gain": -16, "dur": 2.0}]})
# 6) 3a: 5. April früh – die Münchner Kripo, Magnesiumblitz, Name tippt sich ein
B.append({"scene": "investigators_old", "clock": "5 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 1000],
    "p": {"camera": {"flash": ["@munich+0.38"]}, "label": {"text": "GEORG REINGRUBER", "at": "@georg"}},
    "lines": [L("Early next morning, detectives arrive from Munich, led by Georg Reingruber.", emph=["Munich"],
                say="Early next morning, detectives arrive from Munich, led by Gay-ork Rine-groober.")], "post": 0.4,
    "sfx": [{"name": "footsteps_snow", "at": 0.0, "gain": -8}, {"name": "camera_flash_old", "at": "@munich+0.32", "gain": -5},
            {"name": "typewriter_burst", "at": "@georg", "gain": -12}]})
# 7) 3b: Aktennotiz – Geld noch im Haus, Raub weitgehend ausgeschlossen
B.append({"scene": "letter", "clock": "5 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 900],
    "p": {"style": "typewriter", "paper": "old", "title": "THE MONEY", "tilt": -0.02, "y": 905,
          "lines": [{"text": "LARGE SUMS OF MONEY:", "at": "@large", "dur": 0.8, "size": 54},
                    {"text": "STILL IN THE HOUSE.", "at": "@still", "dur": 0.7, "size": 54},
                    {"text": "ROBBERY:", "at": "@robbery", "dur": 0.35, "size": 54},
                    {"text": "LARGELY RULED OUT.", "at": "@largely", "dur": 0.8, "size": 54}],
          "stamp": {"text": "MONEY|LEFT BEHIND", "at": "@out+0.45", "x": 0, "y": 250, "rot": -0.08, "w": 600}},
    "lines": [L("Large sums of money are still in the house, so robbery is largely ruled out.", emph=["money", "robbery"])], "post": 0.65,
    "punch": ["@out+0.45"], "shakeAt": [{"at": "@out+0.45", "d": 0.3, "a": 10}],
    "sfx": [{"name": "typewriter_burst", "at": "@large", "gain": -10}, {"name": "typewriter_burst", "at": "@robbery", "gain": -11},
            {"name": "rubber_stamp", "at": "@out+0.45", "gain": -4}]})
# 8) 4a: die Pinnwand – Titel SUSPECT · NEVER CHARGED von Anfang an, dann die Nachbarkarte
B.append({"scene": "evidence_board", "clock": "1922", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [540, 880],
    "p": {"title": TITLE_B, "at": 0.05, "torch": False, "cards": [card(C_NB, "@neighbor")], "strings": []},
    "lines": [L("Then police look hard at the neighbor who found them.", emph=["neighbor"])], "post": 0.3,
    "sfx": [{"name": "paper_rustle", "at": 0.05, "gain": -9}, {"name": "paper_rustle", "at": "@neighbor", "gain": -6}]})
# 9) 4b: Motivkarten – Viktoria, der Vater, Josef; Fäden zur Nachbarkarte
B.append({"scene": "evidence_board", "clock": "1922", **CAP, "trans": "cut", "zoom": [1.05, 1.0], "focus": [540, 900],
    "p": {"title": TITLE_B, "at": -5, "torch": False,
          "cards": [card(C_NB, -5), card(C_VI, "@marry"), card(C_FA, "@refused"), card(C_JO, "@acknowledged")],
          "strings": [{"from": 0, "to": 1, "at": "@viktoria"}, {"from": 0, "to": 3, "at": "@acknowledged+0.45"}]},
    "lines": [L("He had wanted to marry the widowed daughter, Viktoria, and her father refused.", emph=["marry", "refused"]),
              L("And he had acknowledged little Josef as his own son.", emph=["son"])], "post": 0.4,
    "sfx": [{"name": "paper_rustle", "at": "@marry", "gain": -7}, {"name": "paper_rustle", "at": "@refused", "gain": -7},
            {"name": "paper_rustle", "at": "@acknowledged", "gain": -7}]})
# 10) 5: Licht an – zwei große weiße Karten legen sich über die Fäden: NEVER TIED / NEVER CHARGED
B.append({"scene": "evidence_board", "clock": "1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 900],
    "p": {"title": TITLE_B, "at": -5, "torch": False,
          "cards": [card(C_NB, -5), card(C_VI, -5), card(C_FA, -5), card(C_JO, -5),
                    {"text": "NEVER TIED TO THE KILLINGS", "x": 0.52, "y": 0.76, "at": "@tie", "rot": -0.03, "s": 1.15},
                    {"text": "NEVER CHARGED", "x": 0.56, "y": 1.05, "at": "@charged-0.2", "rot": 0.04, "s": 1.15}],
          "strings": []},  # Licht an: keine Fäden mehr – nichts verbindet ihn mit der Tat
    "lines": [L("But police can never tie him to the killings, and he is never charged.", emph=["never", "charged"])], "post": 0.8,
    "sfx": [{"name": "paper_rustle", "at": "@tie", "gain": -5}, {"name": "paper_rustle", "at": "@charged-0.2", "gain": -5}]})
# 11) 6: Waidhofen, 8. April 1922 – Beerdigung, ganz ruhig
B.append({"scene": "church_ext", "clock": "8 APR 1922", "place": "WAIDHOFEN, BAVARIA", **CAP, "trans": "fade", "zoom": [1.0, 1.06], "focus": [540, 900],
    "p": {"label": "WAIDHOFEN", "sub": "8 APRIL 1922", "snow": True, "lit": True, "lamp": False, "cross": False, "dark": 0.2},
    "lines": [L("After the autopsy, the skulls are kept for examination.", emph=["skulls"]), L("The six are buried without them.", emph=["without"])], "post": 0.7,
    "sfx": [{"name": "church_bell_distant", "at": 0.0, "gain": -10}, {"name": "church_bell_distant", "at": "@them+0.45", "gain": -12}]})
# 12) 7a: Kerze im Dunkeln – CLAIRVOYANTS
CANDLE = {**KIT, "stove": False, "keyHook": False, "window": "dark", "dark": 0.85}
B.append({"scene": "sfx_text", "clock": "1922", **CAP, "trans": "glitch", "zoom": [1.0, 1.06], "focus": [540, 800], "vignette": 0.95,
    "p": {"lines": ["CLAIRVOYANTS"], "times": ["@clairvoyants"], "y": 640, "size": 130, "bg": "kitchen_old", "bgP": {**CANDLE, "candle": True}},
    "lines": [L("Investigators even show the skulls to clairvoyants.", emph=["clairvoyants"])], "post": 0.35,
    "glitch": [{"at": "@clairvoyants", "d": 0.08}],
    "sfx": [{"name": "sub_pulse", "at": "@clairvoyants+0.65", "gain": -9}, {"name": "breath_whisper", "at": 0.2, "gain": -18}]})
# 13) 7b: die Kerze ist aus – NOTHING USEFUL
B.append({"scene": "sfx_text", "clock": "1922", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 800], "vignette": 0.95,
    "p": {"lines": ["NOTHING", "USEFUL."], "times": ["@nothing", "@useful"], "y": 620, "size": 170, "bg": "kitchen_old", "bgP": {**CANDLE, "candle": False}},
    "lines": [L("Nothing useful ever comes of it.", emph=["nothing"])], "pre": 0.15, "post": 0.6, "minDur": 2.6,
    "sfx": [{"name": "breath_whisper", "at": 0.0, "gain": -11}, {"name": "hit_deep", "at": "@it+0.42", "gain": -8}]})
# 14) 8a: 1923 – der Hof wird abgerissen
B.append({"scene": "demolition", "clock": "1923", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [560, 900],
    "p": {"stage0": 0.12, "stage1": DEMO_ST, "t0": 0.0, "t1": "@down+0.5", "label": {"s": "1923", "at": 0.25}},
    "lines": [L("Less than a year later, they tear you down.", emph=["tear"])], "post": 0.55,
    "shakeAt": [{"at": "@down+0.45", "d": 0.35, "a": 10}],
    "sfx": [{"name": "wood_creak_heavy", "at": 0.15, "gain": -5}, {"name": "wood_creak_heavy", "at": "@tear", "gain": -6},
            {"name": "hit_deep", "at": "@down+0.45", "gain": -6}]})
# 15) 8b: unter den Dielen – der Arbeiter erstarrt, rotes Glühen steigt aus der Lücke (Quelle des Cold Opens)
B.append({"scene": "demolition", "clock": "1923", "clockRed": True, **CAP, "trans": "glitch", "zoom": [1.6, 2.2], "focus": [592, 660], "vignette": 1.0,
    "p": {"stage": DEMO_ST, "freeze": "@under"},
    "lines": [L("And under your floorboards, something has been waiting.", emph=["floorboards", "waiting"])], "post": 0.9,
    "flash": [{"at": "@floorboards", "d": 0.35, "c": "#ff2020", "a": 0.14}, {"at": "@has", "d": 0.35, "c": "#ff2020", "a": 0.16},
              {"at": "@waiting+0.55", "d": 0.4, "c": "#ff2020", "a": 0.2}],
    "glitch": [{"at": "@waiting+0.75", "d": 0.12}],
    "sfx": [{"name": "heartbeat_slow_muffled", "at": 0.0, "gain": -6, "dur": 4.0}, {"name": "tension_riser_4s", "at": 0.1, "gain": -13},
            {"name": "stinger_reveal", "at": "@waiting+0.55", "gain": -8}]})
# 16) Endkarte
B.append({"scene": "end_card", "clock": "1923", **CAP, "noCaptions": False, "trans": "cut",
    "p": {"title": "NONE LEADING OUT", "kicker": "PART 4 OF 5", "pill": "FOLLOW FOR THE FINAL PART", "sub": "WHAT WAS UNDER THE FLOOR?|TELL ME IN THE COMMENTS"},
    "lines": [L("Follow for the final part.", emph=["final"])], "post": 0.9,
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -12}, {"name": "heartbeat_single", "at": "@part+0.6", "gain": -7}]})

story = base("NONE LEADING OUT", 4, "HINTERKAIFECK, BAVARIA", "FOLLOW FOR THE FINAL PART", "PART 5")
story["beats"] = B
story["coldOpen"] = {"beat": 15, "words": "And under your floorboards, something has been waiting", "label": "LATER"}
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "wind_snow_bed", "fromBeat": 0, "toBeat": 1, "gain": -1, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": 0, "toBeat": 3, "gain": -5, "fade": 0.8},
    {"name": "farm_night_bed", "fromBeat": 2, "toBeat": 3, "gain": -2, "fade": 0.5},
    {"name": "clock_tick_bed", "fromBeat": 2, "toBeat": 2, "gain": -9, "fade": 0.4},
    {"name": "wind_snow_bed", "fromBeat": 4, "toBeat": 4, "gain": 0, "fade": 0.4},
    {"name": "courtroom_room_tone", "fromBeat": 4, "toBeat": 5, "gain": -5, "fade": 0.5},
    {"name": "farm_night_bed", "fromBeat": 5, "toBeat": 5, "gain": -2, "fade": 0.4},
    {"name": "wind_snow_bed", "fromBeat": 6, "toBeat": 6, "gain": -2, "fade": 0.5},
    {"name": "clock_tick_bed", "fromBeat": 7, "toBeat": 10, "gain": -9, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": 8, "toBeat": 9, "gain": -5, "fade": 0.8},
    {"name": "wind_snow_bed", "fromBeat": 11, "toBeat": 11, "gain": -2, "fade": 0.8},
    {"name": "dark_pad_tension", "fromBeat": 12, "toBeat": 16, "gain": -3, "fade": 0.8},
    {"name": "whisper_texture", "fromBeat": 12, "toBeat": 13, "gain": -12, "fade": 0.6},
    {"name": "wind_snow_bed", "fromBeat": 14, "toBeat": 15, "gain": -1, "fade": 0.6},
    {"name": "heartbeat_slow_muffled", "fromBeat": 15, "toBeat": 15, "gain": -4, "fade": 0.4}]
save(story, S + "/en/hk_part4.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words")
