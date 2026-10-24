# NONE LEADING OUT – Teil 3 "Did Someone Stay?" (Hinterkaifeck 1922)
# Erzähltext wörtlich aus tc_scripts/B_part3.json (faktengeprüft). Du = der Hof Hinterkaifeck.
# Fakten für Einblendungen: tc_scripts/research_B.json – Plöckl (Taschenlampe) in der Nacht Sa 1.4.1922 ~23 Uhr, Aussage verloren,
# nur aus zweiter Hand (Bley 1930); So 2.4. Messe versäumt; Mo 3.4. Post vom Samstag unberührt; Di 4.4. Monteur Hofner ~4,5 h, ~15 Uhr
# bei Schlittenbauers (Gröbern); zwei Buben, dann Schlittenbauer mit Pöll und Sigl; ~17 Uhr vier Tote im Stadel; Schlittenbauer allein
# durch den Stall ins Haus, öffnet die Haustür von innen; Josef und die Magd im Haus.
# Tageszeit 4.4.: graues Tageslicht, keine Laternen -> engine_shed "day", investigators_old, Stall ohne Laterne.
# Nie Opfer, Blut oder Waffe zeigen; nie Gesichter.
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from tc_common import *

S = sys.argv[1]
CAP = {"captionY": 1500, "capBox": True}

def pop(text, at, y=560, size=80, dur=40, rot=0.0, x=540):
    """Rote Einblendung im Bildschirmraum (beat.pops) – bleibt bis Beat-Ende stehen."""
    return {"text": text, "at": at, "x": x, "y": y, "size": size, "dur": dur, "rot": rot}

# offene Haustür von innen (Hintergrund für die Schlusszeile)
DOOR_OPEN = {"keyAt": -9, "handleAt": -8, "open": -7}

B = []
# 0: Hook – Samstagnacht, die Lampe blendet dem Passanten ins Gesicht, dann geht die Gestalt zum Hof zurück
B.append({"scene": "torch_glare", "clock": "1 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [600, 960],
    "p": {"on": "@shines-0.08", "swing": "@turns-0.15", "pace": 2.9},
    "pops": [pop("YOU ARE HINTERKAIFECK", 0.05, y=410, size=72, rot=-0.025),
             pop("SATURDAY NIGHT · 1 APRIL 1922", "@saturday", y=500, size=46, rot=0.015),
             pop("REPORTEDLY", "@reportedly", y=1290, size=58, rot=-0.04, x=760)],
    "lines": [L("Saturday night, near your farm, a torch reportedly shines straight into a passing man's face.", emph=["torch", "face"], gap=0.5),
              L("Then the figure turns back toward your house.", emph=["house"])], "pre": 0.1, "post": 0.45,
    "punch": ["@shines"], "shakeAt": [{"at": "@shines", "d": 0.25, "a": 8}],
    "sfx": [{"name": "footsteps_snow", "at": 0.0, "gain": -10}, {"name": "light_click", "at": "@shines-0.1", "gain": -4},
            {"name": "sub_pulse", "at": "@shines-0.05", "gain": -8}, {"name": "hit_deep", "at": "@face+0.5", "gain": -7},
            {"name": "footsteps_snow", "at": "@turns+0.2", "gain": -13}]})
# 1: die verlorene Aussage – Kopf getippt, Inhalt geschwärzt, Stempel ORIGINAL STATEMENT LOST, Vermerk zweite Hand
FILLER = ["xxxxxxx xxxx xxxxxx xx xxx", "xxxxx xxxx xxxxxxx xx xxx", "xxxx xxxxxxx xxxxx xxxx"]
B.append({"scene": "letter", "clock": "1 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.07], "focus": [540, 900],
    "p": {"style": "typewriter", "paper": "old", "title": "WITNESS STATEMENT", "tilt": -0.018, "y": 880,
          "lines": [{"text": "WITNESS:  MICHAEL PLÖCKL", "at": 0.0, "dur": 0.45, "size": 40},
                    {"text": "SIGHTING: 1 APRIL 1922, NIGHT", "at": 0.3, "dur": 0.45, "size": 40},
                    {"text": FILLER[0], "at": 0.6, "dur": 0.35, "size": 40},
                    {"text": FILLER[1], "at": 0.8, "dur": 0.35, "size": 40},
                    {"text": FILLER[2], "at": 1.0, "dur": 0.3, "size": 40},
                    {"text": "KNOWN ONLY SECONDHAND", "at": "@survives", "dur": 0.6, "size": 40}],
          "redact": [{"line": i, "from": 0, "at": -9} for i in (2, 3, 4)],
          "stamp": {"text": "ORIGINAL STATEMENT|LOST", "at": "@lost+0.3", "x": 0, "y": 375, "rot": -0.08, "w": 680}},
    "lines": [L("His original statement is lost.", emph=["lost"], gap=0.4), L("The story survives only secondhand.", emph=["secondhand"])], "post": 0.45,
    "punch": ["@lost+0.3"], "shakeAt": [{"at": "@lost+0.3", "d": 0.3, "a": 10}],
    "sfx": [{"name": "typewriter_burst", "at": 0.0, "gain": -10}, {"name": "rubber_stamp", "at": "@lost+0.3", "gain": -3},
            {"name": "typewriter_burst", "at": "@survives", "gain": -12}]})
# 2: Sonntag – Kirche im Schnee, Glocke, die Familie fehlt
B.append({"scene": "church_ext", "clock": "2 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [520, 900],
    "p": {"snow": True, "label": "SUNDAY MASS", "sub": "2 APRIL 1922", "lamp": False, "lit": True},
    # ABSENT in den Himmel links vom Lampenmast (der Mast wird auch mit lamp False gezeichnet; vorher ragte der Arm aus dem Wort)
    "pops": [pop("ABSENT", "@misses", y=380, size=92, rot=-0.05, x=600)],
    "lines": [L("On Sunday, your family misses Mass.", emph=["misses"])], "pre": 0.15, "post": 0.5,
    "sfx": [{"name": "church_bell_distant", "at": 0.0, "gain": -5}, {"name": "low_piano_hit", "at": "@mass+0.4", "gain": -10}]})
# 3: Montag – der Hof dunkel, kein Rauch; der Briefträger an der Tür, die Post vom Samstag liegt unberührt
B.append({"scene": "farm_snow", "clock": "3 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.07], "focus": [600, 1000],
    "p": {"lit": [], "smoke": False, "dark": 0.3, "moon": False,
          "label": {"text": "MONDAY, 3 APRIL · MAIL UNTOUCHED", "at": "@monday"}, "figure": {"x": 700, "at": 0.1, "until": "@untouched+0.5"}},
    "lines": [L("On Monday, the postman finds Saturday's mail untouched.", emph=["untouched"])], "post": 0.5,
    "sfx": [{"name": "footsteps_snow", "at": 0.0, "gain": -11}, {"name": "paper_rustle", "at": "@mail", "gain": -6}]})
# 4: Küche – Ofen raucht, Brot auf dem Tisch; gefüttert? gegessen?
B.append({"scene": "kitchen_old", "clock": "APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.07], "focus": [560, 1000],
    "p": {"smoke": True, "keyHook": False, "window": "snow"},
    "pops": [pop("FED?", "@fed", y=560, size=110, rot=-0.05, x=320), pop("EATEN?", "@eaten", y=1170, size=110, rot=0.04, x=770)],
    "lines": [L("Some witnesses spoke of animals that seemed fed, and food that seemed eaten.", emph=["fed", "eaten"])], "post": 0.35,
    "glitch": [{"at": "@eaten+0.55", "d": 0.12}],
    "sfx": [{"name": "wood_creak_heavy", "at": 0.1, "gain": -10}, {"name": "typewriter_key", "at": "@fed", "gain": -9},
            {"name": "typewriter_key", "at": "@eaten", "gain": -9}]})
# 5: die Akten widersprechen sich – zwei Versionen nebeneinander
B.append({"scene": "choice_split", "clock": "APR 1922", **CAP, "trans": "glitch", "zoom": [1.0, 1.04], "focus": [540, 900],
    "p": {"title": "THE FILES DISAGREE", "kicker": "WITNESS ACCOUNTS", "optA": "SOME SAY", "optB": "OTHERS SAY",
          "a": "SEEMED FED|SEEMED EATEN", "b": "NOTHING|SEEN", "iconA": "note", "iconB": "eye"},
    "lines": [L("Others saw nothing, and the files contradict each other.", emph=["nothing", "contradict"])], "post": 0.5,
    "sfx": [{"name": "tv_static_burst", "at": 0.0, "gain": -12}, {"name": "paper_rustle", "at": "@files", "gain": -6},
            {"name": "low_piano_hit", "at": "@other+0.45", "gain": -9}]})
# 6: Dienstag – der Monteur im Motorhaus, graues Tageslicht, die Uhr springt 4,5 Stunden vor
B.append({"scene": "engine_shed", "clock": "4 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [600, 900],
    "p": {"light": "day", "door": 0.25, "mechanic": {"at": "@mechanic"},
          "clock": {"t0": "@stays", "t1": "@alone", "hours": 4.5, "from": 10},
          "text": {"s": "TUESDAY, 4 APRIL", "at": "@tuesday", "y": 1340}},
    "lines": [L("On Tuesday, April fourth, a mechanic comes to repair your engine.", emph=["mechanic"]),
              L("He stays four and a half hours, works alone, and sees no one.", emph=["alone", "no"])], "post": 0.35,
    "punch": ["@no"],
    "sfx": [{"name": "door_handle", "at": "@mechanic-0.2", "gain": -11}, {"name": "clock_tick_bed", "at": "@stays", "gain": -7, "dur": 2.6},
            {"name": "whoosh_dark", "at": "@hours", "gain": -11}, {"name": "keys_jingle", "at": "@works", "gain": -12}]})
# 7: der Motor läuft, der Hund bellt, die Kühe brüllen – Kamera gleitet zur Wand, hinter der der Stadel liegt
B.append({"scene": "engine_shed", "clock": "4 APR 1922", **CAP, "trans": "cut", "zoom": [1.04, 1.15], "focus": [880, 760], "pan": [0, 0, -110, 10], "vignette": 0.92,
    "p": {"light": "day", "door": 0.25, "mechanic": {"at": 0}, "run": 0.0, "clock": {"from": 14.5}},
    "pops": [pop("BARKING", "@barks", y=520, size=64, rot=-0.06, x=790), pop("BELLOWING", "@bellow", y=640, size=64, rot=0.04, x=760)],
    "lines": [L("The dog barks, the cows bellow, and he never notices what lies steps away.", emph=["never", "steps"])], "post": 0.7,
    "flash": [{"at": "@away+0.55", "d": 0.5, "c": "#ff2020", "a": 0.16}],
    "sfx": [{"name": "sub_pulse", "at": "@barks", "gain": -10}, {"name": "sub_pulse", "at": "@bellow", "gain": -10},
            {"name": "heartbeat_single", "at": "@away+0.55", "gain": -4}]})
# 8: ~15 Uhr beim Nachbarn in Gröbern – Hof im grauen Licht OHNE Figuren (coatMan = Ermittler-Silhouette, wie Teil 2 Beat 4),
#    kein Hofname als Akten-Überschrift. Label kurz, damit es in die Bildbreite passt (66px Elite).
B.append({"scene": "investigators_old", "clock": "4 APR 1922", "place": "GRÖBERN, BAVARIA", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 1000],
    "p": {"figures": 0, "camera": False, "notebook": False, "barnDoor": 0.0, "label": {"text": "AT THE NEIGHBORS'", "at": 0.15}},
    "lines": [L("Around three, he asks the neighboring Schlittenbauers to tell the family the engine is fixed.", emph=["three", "fixed"])], "pre": 0.1, "post": 0.4,
    "sfx": [{"name": "door_knock_wood", "at": 0.0, "gain": -11}, {"name": "typewriter_burst", "at": 0.15, "gain": -13}]})
# 9: neutrales Schreibmaschinen-Protokoll statt Fußspuren – kein roter Name, keine Spuren (keine Täter-Spur-Lesart).
#    Begleiter laut research_B.json: Michael Pöll und Jakob Sigl.
B.append({"scene": "letter", "clock": "4 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 880],
    "p": {"style": "typewriter", "paper": "old", "title": "4 APRIL 1922 · AFTERNOON", "tilt": 0.015, "y": 905,
          "lines": [{"text": "TWO BOYS SENT OVER", "at": "@sends", "size": 40},
                    {"text": "THEY FIND NO ONE", "at": "@find", "size": 40},
                    {"text": "THEN THE NEIGHBOR GOES HIMSELF", "at": "@then-0.05", "dur": 0.55, "size": 40},
                    {"text": "WITH MICHAEL PÖLL", "at": "@himself+0.05", "dur": 0.45, "size": 40},
                    {"text": "AND JAKOB SIGL", "at": "@men-0.2", "dur": 0.4, "size": 40}]},
    "lines": [L("Lorenz Schlittenbauer sends two boys, who find no one, then goes himself with two men.", emph=["boys", "men"])], "post": 0.7,
    "sfx": [{"name": "typewriter_burst", "at": "@sends", "gain": -14}, {"name": "typewriter_burst", "at": "@then-0.05", "gain": -16},
            {"name": "footsteps_snow", "at": "@himself", "gain": -9}]})
# 10: ~17 Uhr – das Stadeltor schwingt auf (ohne Gestalt in der Tür); harter Weißblitz. Die Kamera bleibt an der Schwelle.
B.append({"scene": "barn", "clock": "4 APR 1922", "clockRed": True, **CAP, "trans": "glitch", "zoom": [1.0, 1.08], "focus": [540, 900], "vignette": 0.92,
    "p": {"doorGap": 0.0, "swing": "@barn-0.1", "swingTo": 0.95, "swingDur": 1.4, "lantern": False, "animals": False, "dark": 0.8},
    "pops": [pop("ABOUT 5 PM", "@late", y=420, size=60, rot=-0.03)],
    "lines": [L("Late that afternoon, in your barn, they find four of the family dead.", emph=["four", "dead"])], "post": 0.9,
    "flash": [{"at": "@dead+0.35", "d": 0.22, "c": "#ffffff", "a": 0.9}],
    "shakeAt": [{"at": "@dead+0.35", "d": 0.35, "a": 10}],
    "sfx": [{"name": "door_creak", "at": "@barn-0.1", "gain": -6}, {"name": "camera_flash_old", "at": "@dead+0.3", "gain": -9},
            {"name": "hit_deep", "at": "@dead+0.38", "gain": -4}]})
# 11: der Stall mit den Kühen – ohne Gestalt (keine Silhouette, die mit dem Namen verknüpft wird)
B.append({"scene": "barn", "clock": "4 APR 1922", **CAP, "trans": "cut", "zoom": [1.0, 1.1], "focus": [560, 880],
    "p": {"doorGap": 1.0, "lantern": False, "animals": True, "dark": 0.72, "figure": False},
    "lines": [L("Then Schlittenbauer goes alone through the stable, into the house.", emph=["alone"])], "post": 0.45,
    "sfx": [{"name": "footsteps_approach", "at": "@goes", "gain": -12, "dur": 2.0}, {"name": "wood_creak_heavy", "at": "@house", "gain": -7}]})
# 12: Quelle des Cold Opens – die Haustür von innen: Schlüssel dreht, Klinke, Tür geht auf ins graue Licht
B.append({"scene": "front_door", "clock": "4 APR 1922", **CAP, "trans": "glitch", "zoom": [1.0, 1.1], "focus": [560, 900], "vignette": 0.92,
    "p": {"keyAt": "@he-0.3", "keyDur": 0.5, "handleAt": "@opens", "open": "@your", "openDur": 1.3},
    "lines": [L("He opens your front door from the inside.", emph=["inside"])], "pre": 0.35, "post": 0.55,
    "punch": ["@inside+0.4"],
    "sfx": [{"name": "keys_lock", "at": "@he-0.3", "gain": -4}, {"name": "door_handle", "at": "@opens", "gain": -8},
            {"name": "door_creak", "at": "@your", "gain": -7}, {"name": "heartbeat_single", "at": "@inside+0.6", "gain": -3}]})
# 13: Cliffhanger – FOUR FOUND. / TWO STILL / INSIDE. über der offenen Tür
B.append({"scene": "sfx_text", "clock": "4 APR 1922", "clockRed": True, **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [540, 820], "vignette": 0.95,
    "p": {"lines": ["FOUR FOUND.", "TWO STILL", "INSIDE."], "times": [0.0, "@two", "@inside"], "y": 560, "size": 150,
          "bg": "front_door", "bgP": DOOR_OPEN},
    "lines": [L("Two of the six are still somewhere inside you.", emph=["two", "inside"])], "pre": 0.25, "post": 0.95,
    "punch": ["@two", "@inside"], "shakeAt": [{"at": "@you+0.4", "d": 0.35, "a": 12}],
    "flash": [{"at": "@inside", "d": 0.12, "c": "#ff2020", "a": 0.3}],
    "sfx": [{"name": "heartbeat_single", "at": 0.0, "gain": -4},
            {"name": "hit_deep", "at": "@you+0.4", "gain": -4}]})
# 14: Endkarte
B.append({"scene": "end_card", "clock": "4 APR 1922", **CAP, "noCaptions": False, "trans": "cut",
    "p": {"title": "NONE LEADING OUT", "kicker": "PART 3 OF 5", "pill": "FOLLOW FOR PART 4", "sub": "DID SOMEONE STAY ON THE FARM?|THE FILES STILL DISAGREE"},
    "lines": [L("Follow for part four.", emph=["four"])], "post": 0.9,
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -9}]})

story = base("NONE LEADING OUT", 3, "HINTERKAIFECK, BAVARIA", "FOLLOW FOR PART 4", "PART 4")
story["beats"] = B
# Cold Open aus dem Cliffhanger (zeigt auf niemanden); vorher "He opens your front door…" -> machte "he" zum Mann, der blieb
story["coldOpen"] = {"beat": 13, "words": "Two of the six are still somewhere inside you", "label": "LATER"}
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "wind_snow_bed", "fromBeat": 0, "toBeat": 3, "gain": 0, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": 0, "toBeat": 1, "gain": -5, "fade": 0.8},
    {"name": "farm_night_bed", "fromBeat": 4, "toBeat": 5, "gain": -2, "fade": 0.6},
    {"name": "clock_tick_bed", "fromBeat": 4, "toBeat": 4, "gain": -8, "fade": 0.4},
    {"name": "wind_snow_bed", "fromBeat": 8, "toBeat": 9, "gain": -2, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": 7, "toBeat": 14, "gain": -3, "fade": 1.0},
    {"name": "heartbeat_slow_muffled", "fromBeat": 10, "toBeat": 13, "gain": -6, "fade": 0.6},
    {"name": "farm_night_bed", "fromBeat": 10, "toBeat": 11, "gain": -1, "fade": 0.6}]
save(story, S + "/en/hk_part3.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B[:-1] for l in b["lines"]), "words (ohne Endzeile)")
