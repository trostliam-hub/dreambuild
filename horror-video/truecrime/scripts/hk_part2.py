# NONE LEADING OUT – Teil 2 „The New Maid“ (Brief: en/HK_BRIEF.md, Skript: tc_scripts/B_part2.json)
# Erzähltext wörtlich aus B_part2.json (faktengeprüft); nur die Aussprache wird über say= korrigiert.
# Fakten für Einblendungen (research_B.json): 31.03.1922 Freitag; Briefträger Josef Mayer, Aussage vom 10.01.1952;
# Andreas Gruber 63; Magd Maria Baumgartner tritt am 31.03.1922 an, ihre Schwester bringt sie und geht wieder;
# Sa 1.04.1922 Cäzilia (7) fehlt in der Schule; mittags klopfen zwei Kaffeehändler (Schirovsky); nachts Rauch am Backofen (Plöckl, nur aus zweiter Hand).
# Optische Beats sind feiner geteilt als im Skript (Text unverändert): 0→0+1, 2→3+4, 3→5, 4→6, 5→7+8, 6→9, 7→10+11, 8→12, 9→13+14, 10→15.
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from tc_common import *

S = sys.argv[1]
CAP = {"captionY": 1500, "capBox": True}
BAUM = "Bowm-gart-ner"
CAEZ = "Tseh-tsee-lee-ah"

def pop(text, at, y=560, size=80, dur=30, rot=0.0, x=540):
    """Rote Einblendung (beat.pops) – bleibt bis Beat-Ende stehen."""
    return {"text": text, "at": at, "x": x, "y": y, "size": size, "dur": dur, "rot": rot}

EVENING = {"lit": [1, 4, 6], "dark": 0.0}              # Hof am letzten Abend: drei warme Fenster, Kaminrauch
B = []
# 0: Hook – YOU ARE HINTERKAIFECK über dem Hof am Abend
B.append({"scene": "sfx_text", "clock": "31 MAR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 900], "vignette": 0.85,
    "p": {"lines": ["YOU ARE", "HINTERKAIFECK"], "times": ["@you", "@hinterkaifeck"], "y": 540, "size": 122,
          "bg": "farm_snow", "bgP": {**EVENING}},
    "lines": [L("You are Hinterkaifeck, and this is your family's last evening.", emph=["last"])], "post": 0.35,
    "punch": ["@hinterkaifeck", "@last"],
    "sfx": [{"name": "whoosh_dark", "at": 0.0, "gain": -10}, {"name": "sub_pulse", "at": "@hinterkaifeck", "gain": -9}]})
# 1: das Datum tippt sich auf Schwarz mit Schnee
B.append({"scene": "title_card", "clock": "31 MAR 1922", "noCaptions": True, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 820],
    "p": {"date": "31 MARCH 1922", "place": "FRIDAY · HINTERKAIFECK, BAVARIA", "bg": "snow", "red": ["1922"], "at": "@it", "y": 820},
    "lines": [L("It is Friday, March thirty-first, nineteen twenty-two.")], "post": 0.2,
    "sfx": [{"name": "typewriter_burst", "at": "@it", "gain": -9}]})
# 2: der Briefträger übergibt die Zeitung – nach seiner eigenen, späteren Aussage (1952)
B.append({"scene": "investigators_old", "clock": "31 MAR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [700, 1000],
    # Kamera weit außerhalb des Bildes: übrig bleiben der Mann mit dem Papier (Briefträger) und der Mann ihm gegenüber (Andreas)
    "p": {"figures": 3, "camera": {"x": -2400}, "label": {"text": "ACCOUNT GIVEN IN 1952", "at": "@account"}},
    "pops": [pop("ANDREAS, 63", "@andreas", y=530, size=56, rot=-0.03, x=815)],
    "lines": [L("By his own later account, the postman sees Andreas alive one last time.", emph=["alive"])], "post": 0.45,
    "flash": [{"at": "@alive", "d": 0.16, "c": "#ffffff", "a": 0.22}],
    "sfx": [{"name": "footsteps_snow", "at": 0.0, "gain": -13}, {"name": "paper_rustle", "at": "@postman", "gain": -7}]})
# 3: die neue Magd – Dienstkarte (Silhouette, kein Gesicht), Stempel ERSTER TAG
B.append({"scene": "id_badge", "clock": "31 MAR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.07], "focus": [540, 860],
    "p": {"kind": "card", "org": "HINTERKAIFECK FARM · 1922", "title": "MAID", "name": "MARIA BAUMGARTNER", "idno": " ", "glasses": False,
          "at": 0.05, "stamp": {"text": "FIRST DAY", "at": "@baumgartner+0.55", "x": 40, "y": 160, "w": 330, "rot": -0.09}},
    "lines": [L("That afternoon, a new maid arrives. Her name is Maria Baumgartner.", emph=["baumgartner"],
                say=f"That afternoon, a new maid arrives. Her name is Maria {BAUM}.")], "post": 0.75,
    "shakeAt": [{"at": "@baumgartner+0.6", "d": 0.25, "a": 9}],
    "sfx": [{"name": "whoosh_dark", "at": 0.0, "gain": -11}, {"name": "rubber_stamp", "at": "@baumgartner+0.55", "gain": -5}]})
# 4: die Schwester geht wieder – grauer Nachmittag (investigators_old ohne Figuren), noch kein Mond
B.append({"scene": "investigators_old", "clock": "31 MAR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06],
    "p": {"figures": 0, "camera": False, "barnDoor": 0, "label": {"text": "HER SISTER LEAVES", "at": "@and"}},
    "lines": [L("Her sister brings her, stays a short while, and then leaves.", emph=["leaves"])], "post": 0.45,
    "sfx": [{"name": "footsteps_snow", "at": "@leaves", "gain": -12}]})
# 5: näher an den Hof, noch Tag – „may“ bleibt als Fragezeichen im Bild; die Nacht kommt erst in Beat 6
B.append({"scene": "investigators_old", "clock": "31 MAR 1922", **CAP, "trans": "cut", "zoom": [1.06, 1.14], "focus": [640, 700],
    "p": {"figures": 0, "camera": False, "barnDoor": 0, "label": {"text": "THE LAST OUTSIDER?", "at": "@last"}},
    "lines": [L("That sister may be the last outsider to see the family alive.", emph=["last"])], "post": 0.5,
    "sfx": [{"name": "wood_creak_heavy", "at": "@alive+0.3", "gain": -14}]})
# 6: die Nacht – die Fenster gehen nacheinander aus, der Kamin raucht nicht mehr, langsame Fahrt auf den Hof
B.append({"scene": "farm_snow", "clock": "31 MAR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.12], "focus": [560, 960], "vignette": 0.9,
    "p": {"lit": [{"i": 1, "off": "@night"}, {"i": 6, "off": "@farm"}, {"i": 4, "off": "@happens"}], "dark": 0.35, "smoke": False},
    "lines": [L("Then night falls over the farm, and nobody outside sees what happens.", emph=["nobody"])], "post": 0.6,
    "sfx": [{"name": "wood_creak_heavy", "at": "@happens", "gain": -12}, {"name": "heartbeat_single", "at": "@happens+0.55", "gain": -6}]})
# 7: im Stadel – keine Menschen, nur Laterne, Tor, Tiere; die rote 6
B.append({"scene": "barn", "clock": "31 MAR 1922", "clockRed": True, **CAP, "trans": "glitch", "zoom": [1.0, 1.08], "focus": [540, 900], "vignette": 0.95,
    "p": {"doorGap": 0.3, "lantern": {"x": 300, "y": 650, "at": 0.0}, "dark": 0.8},
    "pops": [pop("6", "@six", y=760, size=330, rot=-0.03)],
    "lines": [L("Sometime that night, police believe, all six people under your roof are killed.", emph=["six"])], "post": 0.65,
    "punch": ["@six"], "flash": [{"at": "@six", "d": 0.12, "c": "#ff2020", "a": 0.25}],
    "sfx": [{"name": "lantern_squeak", "at": 0.15, "gain": -11}, {"name": "sub_pulse", "at": "@six", "gain": -9},
            {"name": "hit_deep", "at": "@killed+0.5", "gain": -6}]})
# 8: die Akte – Stunde unbekannt, ein Täter oder mehrere unbekannt
B.append({"scene": "letter", "clock": "31 MAR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.03], "focus": [540, 900],
    "p": {"style": "typewriter", "paper": "old", "title": "CASE FILE · 1922", "tilt": -0.015, "y": 925, "hl": ["UNKNOWN"],
          "lines": [{"text": "VICTIMS:  6", "at": 0.0, "dur": 0.3, "size": 62},
                    {"text": "HOUR:     UNKNOWN", "at": "@hour", "dur": 0.45, "size": 62},
                    {"text": "KILLERS:  ONE? MORE?", "at": "@killer", "dur": 0.5, "size": 62},
                    {"text": "UNKNOWN", "at": "@more+0.2", "dur": 0.35, "size": 62, "indent": 215}]},
    "lines": [L("Nobody knows the hour, or whether it was one killer or more.", emph=["hour", "killer"])], "post": 0.6,
    "sfx": [{"name": "typewriter_key", "at": 0.0, "gain": -8}, {"name": "typewriter_burst", "at": "@hour", "gain": -12},
            {"name": "typewriter_burst", "at": "@killer", "gain": -12}, {"name": "type_bell", "at": "@more+0.55", "gain": -10}]})
# 9: Samstagmorgen – ein leerer Platz in der Dorfschule
B.append({"scene": "school_desk", "clock": "1 APR 1922", "place": "THE VILLAGE SCHOOL", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [500, 1000],
    "p": {"text": {"s": "SATURDAY · CÄZILIA, 7 · ABSENT", "at": "@saturday", "y": 650}, "ring": "@missing"},
    "lines": [L("Saturday morning, seven-year-old Cäzilia is missing from school.", emph=["missing"],
                say=f"Saturday morning, seven-year-old {CAEZ} is missing from school.")], "post": 0.7,
    "sfx": [{"name": "church_bell_distant", "at": 0.0, "gain": -13}, {"name": "heartbeat_single", "at": "@missing+0.1", "gain": -6}]})
# 10: mittags – zwei Kaffeehändler klopfen, niemand öffnet
B.append({"scene": "investigators_old", "clock": "1 APR 1922", **CAP, "trans": "cut", "zoom": [1.1, 1.18], "focus": [500, 950],
    "p": {"figures": 2, "camera": False, "notebook": False, "barnDoor": 0},
    "pops": [pop("KNOCK", "@knock+0.05", y=735, size=56, dur=0.75, rot=-0.06, x=740),
             pop("KNOCK", "@knock+0.86", y=705, size=56, dur=0.75, rot=0.05, x=815),
             pop("KNOCK", "@knock+1.7", y=745, size=56, dur=0.75, rot=-0.03, x=770)],
    "lines": [L("Around midday, two coffee salesmen knock at your windows and call out.", emph=["knock"])], "post": 0.4,
    "sfx": [{"name": "door_knock_wood", "at": "@knock", "gain": -6}]})
# 11: sie gehen um den Hof herum – das Haus bleibt stumm
B.append({"scene": "investigators_old", "clock": "1 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [600, 700],
    "p": {"figures": 0, "camera": False, "label": {"text": "NO ANSWER", "at": "@nobody"}},
    "lines": [L("They walk around the yard, and nobody answers.", emph=["nobody"])], "post": 0.6,
    "sfx": [{"name": "footsteps_snow", "at": "@walk", "gain": -10}]})
# 12: oben auf dem Dachboden – jemand hört vielleicht zu (Quelle des Cold Opens)
B.append({"scene": "attic", "clock": "1 APR 1922", **CAP, "trans": "cut", "zoom": [1.02, 1.12], "focus": [700, 900], "vignette": 0.95,
    "p": {"lantern": {"x": 330, "y": 560, "swing": False, "at": 0.0}, "dark": 0.75,
          "shadow": {"at": -1.6, "x": 800, "y": 1040, "h": 430, "shift": -25},
          "creak": ["@knock+0.5", "@knock+1.31"]},
    "pops": [pop("SPECULATION", 0.15, y=1340, size=50, rot=0.0)],
    "lines": [L("But someone may still be inside, listening to every knock.", emph=["listening"])], "post": 1.3,
    "sfx": [{"name": "door_knock_wood", "at": "@knock+0.45", "gain": -12, "dur": 1.3}]})
# 13: Samstagnacht – ein Mann geht vorbei und sieht Rauch (nur aus zweiter Hand überliefert)
B.append({"scene": "farm_snow", "clock": "1 APR 1922", **CAP, "trans": "cut", "zoom": [1.04, 1.18], "focus": [720, 820], "vignette": 0.9,
    "p": {"lit": [], "smoke": True, "dark": 0.3, "figure": {"x": 790, "y": 1255, "h": 140, "at": "@man-0.2"},
          "label": {"text": "BAKE-OVEN SMOKE", "at": "@reportedly"}},
    "pops": [pop("REPORTED SECONDHAND", "@reportedly+0.3", y=1240, size=50, rot=0.0, x=500)],
    "lines": [L("That night, a man walking past reportedly sees smoke at your bake oven.", emph=["smoke"])], "post": 0.4,
    "punch": ["@smoke"],
    "sfx": [{"name": "footsteps_snow", "at": "@walking", "gain": -11}]})
# 14: Cliffhanger – WHO LIT THE FIRE? (unten über dem Schneefeld, damit Hof und Rauch sichtbar bleiben)
B.append({"scene": "sfx_text", "clock": "1 APR 1922", "clockRed": True, **CAP, "trans": "glitch", "zoom": [1.0, 1.08], "focus": [540, 800], "vignette": 0.95,
    "p": {"lines": ["WHO LIT", "THE FIRE?"], "times": ["@who", "@fire"], "y": 1110, "size": 180,
          "bg": "farm_snow", "bgP": {"lit": [], "smoke": True, "dark": 0.3}},
    "lines": [L("If all six are dead, who lit the fire?", emph=["fire"])], "post": 0.9,
    "punch": ["@who", "@fire"], "shakeAt": [{"at": "@fire+0.45", "d": 0.35, "a": 12}], "glitch": [{"at": "@fire+0.45", "d": 0.1}],
    "sfx": [{"name": "sub_pulse", "at": "@who", "gain": -9}, {"name": "stinger_reveal", "at": "@fire+0.45", "gain": -7}]})
# 15: Endkarte
B.append({"scene": "end_card", "clock": "1 APR 1922", **CAP, "noCaptions": False, "trans": "cut",
    "p": {"title": "NONE LEADING OUT", "kicker": "PART 2 OF 5", "pill": "FOLLOW FOR PART 3", "sub": "WHO LIT THE FIRE?|TELL ME IN THE COMMENTS"},
    "lines": [L("Follow for part three.", emph=["three"])], "post": 0.9,
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -9}]})

story = base("NONE LEADING OUT", 2, "HINTERKAIFECK, BAVARIA", "FOLLOW FOR PART 3", "PART 3")
story["beats"] = B
CO = 12  # Dachboden-Beat
assert B[CO]["scene"] == "attic"
story["coldOpen"] = {"beat": CO, "words": "But someone may still be inside, listening to every knock", "label": "LATER"}
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "wind_snow_bed", "fromBeat": 0, "toBeat": 6, "gain": -1, "fade": 0.6},
    {"name": "clock_tick_bed", "fromBeat": 1, "toBeat": 1, "gain": -6, "fade": 0.3},
    {"name": "dark_pad_tension", "fromBeat": 6, "toBeat": 14, "gain": -4, "fade": 1.0},
    {"name": "farm_night_bed", "fromBeat": 7, "toBeat": 8, "gain": -2, "fade": 0.5},
    {"name": "heartbeat_slow_muffled", "fromBeat": 7, "toBeat": 7, "gain": -7, "fade": 0.5},
    {"name": "wind_snow_bed", "fromBeat": 10, "toBeat": 11, "gain": -4, "fade": 0.6},
    {"name": "farm_night_bed", "fromBeat": CO, "toBeat": CO, "gain": -2, "fade": 0.5},
    {"name": "heartbeat_slow_muffled", "fromBeat": CO, "toBeat": CO, "gain": -5, "fade": 0.5},
    {"name": "wind_snow_bed", "fromBeat": 13, "toBeat": 14, "gain": -1, "fade": 0.6}]
save(story, S + "/en/hk_part2.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words")
