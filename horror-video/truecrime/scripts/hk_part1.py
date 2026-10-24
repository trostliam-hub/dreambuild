# NONE LEADING OUT – Teil 1 "Footprints In, None Out" (Hinterkaifeck 1922)
# Erzähltext wörtlich aus tc_scripts/B_part1.json (faktengeprüft). Zeilen dürfen auf mehrere Beats verteilt werden, der Wortlaut bleibt.
# Fakten für Einblendungen: tc_scripts/research_B.json (Andreas Gruber 63, Cäzilia Gruber 72, Viktoria Gabriel 35, Cäzilia 7, Josef 2;
# alte Magd ging Spätsommer 1921, Spuk erst 1952 erwähnt; Zeitung Mitte März 1922; Spuren 30.03.1922; neue Magd Fr 31.03.1922).
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from tc_common import *

S = sys.argv[1]
CAP = {"captionY": 1500, "capBox": True}

def pop(text, at, y=560, size=80, dur=30, rot=0.0, x=540):
    """Rote Einblendung im Bildschirmraum (beat.pops, babysit.js) – bleibt bis Beat-Ende stehen."""
    return {"text": text, "at": at, "x": x, "y": y, "size": size, "dur": dur, "rot": rot}

FARM = {"lit": [1], "smoke": True}
TITLE = {"date": "MARCH 1922", "place": "HINTERKAIFECK, UPPER BAVARIA", "sub": "A lone farm, about 70 km north of Munich",
         "bg": "snow", "red": ["1922"], "y": 1060, "at": 0.05, "speed": 24}
B = []
# 0: Hook Teil 1 – der Hof im Schnee, A TRUE STORY knallt rein; Einsatz sofort (6 Tote, 1 Nacht, nie gefasst), Spur läuft zum Haus (Bezug zum Cold Open)
B.append({"scene": "farm_snow", "clock": "1922", **CAP, "noCaptions": True, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 900],
    "p": {**FARM, "footprints": {"at": "@this", "n": 9, "dt": 0.12}},
    "pops": [pop("A TRUE STORY.", "@this", y=520, size=150, rot=-0.03), pop("6 KILLED · 1 NIGHT · NEVER CAUGHT", "@true", y=645, size=64, rot=0.02)],
    "lines": [L("This is a true story.", emph=["true"])], "post": 0.12,
    "sfx": [{"name": "sub_pulse", "at": "@this", "gain": -8}]})
# 1: Hook Teil 2 – YOU ARE / HINTERKAIFECK. über dem gedimmten Hof
B.append({"scene": "sfx_text", "clock": "1922", **CAP, "trans": "cut", "zoom": [1.04, 1.12], "focus": [540, 880], "vignette": 0.9,
    "p": {"lines": ["YOU ARE", "HINTERKAIFECK."], "times": ["@you", "@hinterkaifeck"], "y": 500, "size": 132,
          "bg": "farm_snow", "bgP": FARM},
    "lines": [L("You are Hinterkaifeck, a lonely farm in Bavaria.", emph=["hinterkaifeck"])], "post": 0.2,
    "punch": ["@hinterkaifeck"], "shakeAt": [{"at": "@hinterkaifeck", "d": 0.3, "a": 8}],
    "sfx": [{"name": "sub_pulse", "at": "@you", "gain": -9}, {"name": "whoosh_dark", "at": "@hinterkaifeck-0.3", "gain": -10},
            {"name": "hit_deep", "at": "@bavaria+0.6", "gain": -7}]})
# 2: Titelkarte März 1922 – steht beim Schnitt schon komplett (inkl. Unterzeile), neu ist nur die rote 6, "in einer Nacht"
B.append({"scene": "title_card", "clock": "1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 900],
    "p": {**TITLE, "at": -3.0},
    "pops": [pop("6", "@six", y=600, size=400, rot=-0.04), pop("KILLED IN ONE NIGHT", "@killed", y=840, size=82, rot=0.02)],
    "lines": [L("In nineteen twenty-two, six people within your walls will be killed in one night.", emph=["six", "killed"])], "post": 0.3,
    "punch": ["@six"], "shakeAt": [{"at": "@six", "d": 0.3, "a": 10}], "flash": [{"at": "@killed", "d": 0.1, "c": "#ff2020", "a": 0.22}],
    "sfx": [{"name": "sub_pulse", "at": "@six", "gain": -6},
            {"name": "hit_deep", "at": "@night+0.45", "gain": -6}]})
# 3: NEVER / CAUGHT. – Glitch-Schnitt
B.append({"scene": "sfx_text", "clock": "1922", "noCaptions": True, "trans": "glitch", "zoom": [1.0, 1.08], "focus": [540, 800], "vignette": 0.95,
    "p": {"lines": ["NEVER", "CAUGHT."], "times": ["@never", "@caught"], "y": 560, "size": 230,
          "bg": "title_card", "bgP": {**TITLE, "at": -5, "y": 1250}},
    "lines": [L("Whoever does it will never be caught.", emph=["never"])], "pre": 0.1, "post": 0.75,
    "punch": ["@never", "@caught"], "shakeAt": [{"at": "@caught", "d": 0.35, "a": 12}], "glitch": [{"at": "@caught", "d": 0.1}],
    "flash": [{"at": "@caught", "d": 0.12, "c": "#ff2020", "a": 0.3}],
    "sfx": [{"name": "tv_static_burst", "at": 0.0, "gain": -13}, {"name": "sub_pulse", "at": "@never", "gain": -8},
            {"name": "hit_deep", "at": "@caught+0.5", "gain": -5}]})
# 4: die Familie – warme Küche, Namen erscheinen
B.append({"scene": "kitchen_old", "clock": "1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [620, 1000],
    "p": {"keyHook": {"keys": 2}, "window": "snow"},
    "pops": [pop("ANDREAS GRUBER, 63", "@andreas", y=470, size=70, rot=-0.02), pop("HIS WIFE CÄZILIA, 72", "@wife", y=560, size=62, rot=0.02),
             pop("VIKTORIA GABRIEL, 35", "@widowed", y=650, size=62, rot=-0.02), pop("CÄZILIA, 7  ·  JOSEF, 2", "@children", y=740, size=62, rot=0.02)],
    "lines": [L("You are home to Andreas Gruber, his wife, their widowed daughter, and her two children.", emph=["andreas"])], "post": 0.55,
    "sfx": [{"name": "typewriter_key", "at": "@andreas", "gain": -9}, {"name": "typewriter_key", "at": "@wife", "gain": -9},
            {"name": "typewriter_key", "at": "@widowed", "gain": -9}, {"name": "typewriter_key", "at": "@children", "gain": -9}]})
# 5: die alte Magd – 1921 geht sie; Zähler springt auf 1952, als sie zum ersten Mal von einem Spuk spricht
B.append({"scene": "years_flip", "clock": "1921", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 800],
    "p": {"from": 1921, "to": 1952, "t0": "@decades", "t1": "@said+0.1", "label": "", "ticks": True, "y": 700},
    "pops": [pop("THE LAST MAID LEAVES", "@maid", y=1060, size=88, dur=1.6, rot=-0.02), pop("SHE BLAMES A HAUNTING", "@haunting", y=1060, size=88, rot=0.02)],
    "lines": [L("Your last maid left months ago.", gap=0.35), L("Decades later, she said a haunting had driven her away.", emph=["haunting"])], "post": 0.5,
    "sfx": [{"name": "whoosh_dark", "at": 0.0, "gain": -11}, {"name": "clock_tick_bed", "at": "@decades", "gain": -9, "dur": 1.6},
            {"name": "low_piano_hit", "at": "@away+0.4", "gain": -8}]})
# 6: die Münchner Zeitung – niemand hier hat sie abonniert
B.append({"scene": "newspaper", "clock": "MAR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 900],
    "p": {"style": "1922", "lang": "de", "masthead": "Münchner Tagespost", "date": "März 1922", "headline": " ", "photo": "none", "hl": [], "at": 0.0},
    "pops": [pop("NOBODY HERE", "@nobody", x=350, y=555, size=76, rot=-0.04), pop("SUBSCRIBES", "@subscribes", x=749, y=539, size=76, rot=-0.04)],  # eine Zeile im leeren Band unter dem Kopf
    "lines": [L("That March, a Munich newspaper turns up, though nobody nearby subscribes to it.", emph=["nobody"])], "post": 0.55,
    "sfx": [{"name": "whoosh", "at": 0.0, "gain": -9}, {"name": "paper_rustle", "at": 0.7, "gain": -6},
            {"name": "rubber_stamp", "at": "@nobody", "gain": -6}, {"name": "rubber_stamp", "at": "@subscribes", "gain": -5}]})
# 7: Dachboden – Schritte, Dielen knarzen; Andreas sucht mit Licht und findet niemanden
B.append({"scene": "attic", "clock": "MAR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.12], "focus": [540, 980],
    "p": {"footsteps": {"t0": "@night", "t1": "@attic+0.7", "n": 12, "dir": "in"}, "creak": ["@hears", "@footsteps+0.1", "@attic+0.1"],
          "hatch": "@searches-0.2", "lantern": {"x": 360, "y": 800, "at": "@light", "swing": True}, "dark": 0.35},
    "pops": [pop("NO ONE.", "@one+0.2", y=470, size=130, rot=-0.03)],
    "lines": [L("At night, the family hears footsteps in your attic.", emph=["footsteps"], gap=0.4), L("Andreas searches with a light and finds no one.", emph=["one"])],
    "post": 0.6,
    "sfx": [{"name": "wood_creak_heavy", "at": "@hears", "gain": -7}, {"name": "wood_creak_heavy", "at": "@footsteps+0.1", "gain": -5}, {"name": "wood_creak_heavy", "at": "@attic+0.1", "gain": -4},
            {"name": "door_creak", "at": "@searches-0.2", "gain": -9}, {"name": "lantern_squeak", "at": "@light", "gain": -6}]})
# 8: 30. März – Fußspuren im frischen Schnee, vom Wald zum Motorhäuschen
B.append({"scene": "footprints", "clock": "30 MAR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 1000],
    "p": {"t0": "@footprints", "t1": "@shed", "n": 9},
    "pops": [pop("IN", "@shed", x=330, y=1010, size=110, rot=-0.04)],
    "lines": [L("On March thirtieth, he finds footprints in fresh snow, from the forest to your shed.", emph=["footprints"])], "post": 0.3,
    "sfx": [{"name": "footsteps_snow", "at": "@footprints", "gain": -6}]})
# 9: keine führt weg – Quelle des Cold Opens, der unheimliche Höhepunkt
B.append({"scene": "footprints", "clock": "30 MAR 1922", "clockRed": True, **CAP, "trans": "glitch", "zoom": [1.02, 1.2], "focus": [740, 900], "vignette": 0.92,
    "p": {"t0": -4.0, "t1": -2.0, "n": 9, "ring": "@none-0.1"},
    "pops": [pop("IN", 0.0, x=330, y=1010, size=110, rot=-0.04), pop("OUT", "@none", x=765, y=735, size=110, rot=0.03)],
    "lines": [L("None of them lead away.", emph=["none"])], "pre": 0.3, "post": 1.0,
    "punch": ["@away"], "flash": [{"at": "@none-0.1", "d": 0.1, "c": "#ffffff", "a": 0.18}],
    "sfx": [{"name": "whoosh_dark", "at": 0.0, "gain": -8}, {"name": "heartbeat_single", "at": 0.08, "gain": -5},
            {"name": "stinger_reveal", "at": "@away+0.5", "gain": -7}]})
# 10: Motorhäuschen – Schloss aufgebrochen, nichts fehlt, ein Hausschlüssel ist weg
B.append({"scene": "engine_shed", "clock": "30 MAR 1922", **CAP, "trans": "cut", "zoom": [1.22, 1.0], "focus": [330, 820],
    "p": {"lock": {"forced": "@forced"}, "door": ["@forced+0.4", "@forced+1.8", 0, 0.3], "mechanic": False, "clock": False,
          "text": {"s": "NOTHING TAKEN", "at": "@nothing"}, "keyHook": {"at": "@house", "hooks": 4, "missing": 1}},
    "lines": [L("The shed's lock is forced, nothing is taken, and a house key is gone.", emph=["forced", "key"])], "post": 0.8,
    "sfx": [{"name": "door_handle", "at": "@forced", "gain": -6}, {"name": "door_creak", "at": "@forced+0.4", "gain": -9},
            {"name": "typewriter_burst", "at": "@nothing", "gain": -12}, {"name": "keys_jingle", "at": "@house", "gain": -5}]})
# 11: er sagt es den Nachbarn, will keine Hilfe, keine Polizei – zwei Männer im grauen Licht auf dem Hof (Andreas + ein Nachbar; drei in Reihe wirkten wie Polizei)
B.append({"scene": "investigators_old", "clock": "MAR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 1000],
    "p": {"figures": 2, "camera": False, "notebook": False, "barnDoor": 0},
    "pops": [pop("NO HELP.", "@refuses", y=405, size=115, rot=-0.03), pop("NO POLICE.", "@police", y=528, size=115, rot=0.02)],
    "lines": [L("He tells the neighbors but refuses help, and never goes to the police.", emph=["refuses", "police"])], "post": 0.35,
    "sfx": [{"name": "footsteps_snow", "at": 0.1, "gain": -11}]})
# 12: seine Worte laut Akte
B.append({"scene": "letter", "clock": "MAR 1922", "noCaptions": True, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 700],
    "p": {"style": "typewriter", "paper": "old", "title": "AS REPORTED IN THE FILES", "tilt": -0.02, "y": 930,
          "lines": [{"text": "The burglar will be gone by now,", "at": "@burglar", "size": 64}, {"text": "he says,", "at": "@he", "size": 64},
                    {"text": "and his rifle is ready.", "at": "@and", "size": 64}], "hl": ["RIFLE"]},
    "lines": [L("The burglar will be gone by now, he says, and his rifle is ready.", emph=["rifle"])], "post": 0.55,
    "sfx": [{"name": "typewriter_burst", "at": "@burglar", "gain": -11}, {"name": "typewriter_burst", "at": "@and", "gain": -11}]})
# 13: Cliffhanger I – Freitag, 31. März: die neue Magd kommt; ein Licht geht aus
B.append({"scene": "farm_snow", "clock": "31 MAR 1922", "clockRed": True, **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [560, 930], "vignette": 0.88,
    "p": {"lit": [{"i": 1, "off": "@night+0.25"}, {"i": 4}], "smoke": True, "dark": 0.2, "footprints": True,
          "label": {"text": "FRIDAY, 31 MARCH 1922", "at": "@tomorrow"}},
    "lines": [L("Tomorrow, a new maid arrives. She will not survive her first night.", emph=["survive"])], "post": 0.4,
    "sfx": [{"name": "church_bell_distant", "at": 0.1, "gain": -11}, {"name": "light_click", "at": "@night+0.25", "gain": -8}]})
# 14: Cliffhanger II – näher an Haus und Spuren, das letzte Licht geht aus, harter Schnitt
B.append({"scene": "farm_snow", "clock": "31 MAR 1922", "clockRed": True, **CAP, "trans": "cut", "zoom": [1.16, 1.32], "focus": [500, 1010], "vignette": 0.92,
    "p": {"lit": [{"i": 4, "off": "@here+0.5"}], "smoke": True, "dark": 0.24, "footprints": True},
    "lines": [L("And whoever made those footprints may still be here.", emph=["here"])], "pre": 0.1, "post": 1.0,
    "sfx": [{"name": "sub_pulse", "at": "@whoever", "gain": -10}, {"name": "wood_creak_heavy", "at": "@footprints+0.3", "gain": -9},
            {"name": "light_click", "at": "@here+0.5", "gain": -7}, {"name": "heartbeat_single", "at": "@here+0.55", "gain": -4}]})
# 15: Endkarte
B.append({"scene": "end_card", "clock": "31 MAR 1922", **CAP, "noCaptions": False, "trans": "cut",
    "p": {"title": "NONE LEADING OUT", "kicker": "PART 1 OF 5", "pill": "FOLLOW FOR PART 2", "sub": "WOULD YOU HAVE STAYED?|TELL ME IN THE COMMENTS"},
    "lines": [L("Follow for part two.", emph=["two"])], "post": 0.9,
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -9}]})

story = base("NONE LEADING OUT", 1, "HINTERKAIFECK, BAVARIA", "FOLLOW FOR PART 2", "PART 2")
story["beats"] = B
story["coldOpen"] = {"beat": 9, "words": "None of them lead away", "label": "LATER", "lead": 0.15, "hold": 0.9}
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "wind_snow_bed", "fromBeat": 0, "toBeat": 1, "gain": 0, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": 2, "toBeat": 3, "gain": -4, "fade": 0.6},
    {"name": "clock_tick_bed", "fromBeat": 4, "toBeat": 4, "gain": -8, "fade": 0.5},
    {"name": "farm_night_bed", "fromBeat": 4, "toBeat": 5, "gain": -4, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": 6, "toBeat": 14, "gain": -5, "fade": 1.0},
    {"name": "farm_night_bed", "fromBeat": 7, "toBeat": 7, "gain": -2, "fade": 0.5},
    {"name": "wind_snow_bed", "fromBeat": 8, "toBeat": 9, "gain": 1, "fade": 0.6},
    {"name": "heartbeat_slow_muffled", "fromBeat": 9, "toBeat": 10, "gain": -6, "fade": 0.6},
    {"name": "farm_night_bed", "fromBeat": 10, "toBeat": 10, "gain": -3, "fade": 0.5},
    {"name": "wind_snow_bed", "fromBeat": 11, "toBeat": 14, "gain": -1, "fade": 0.6},
    {"name": "heartbeat_slow_muffled", "fromBeat": 13, "toBeat": 14, "gain": -5, "fade": 0.6}]
save(story, S + "/en/hk_part1.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words")
