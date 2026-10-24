# NONE LEADING OUT – Teil 5 (Finale) "What the Floor Kept": Abriss, Tatwerkzeug im Boden, Beleidigungsprozess,
# erfolglose Ermittlungen, verschwundene Schädel, Festnahme 1952, Gutachten 2007, Spuren ins Leere, Gedenken an die sechs.
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from tc_common import *

CAP = {"captionY": 1500, "capBox": True}
FIELD = "_" * 16  # leeres Namensfeld, über das der Schwärzungsbalken gleitet (kein Name im Bild)

# Gedenken: Namen genau wie im Recherche-Dossier; Alter direkt in der Namenszeile (am Handy lesbar),
# nur sechs Zeilen – Ort und Nacht stehen im Titel (Maria Baumgartners Alter 44/45 ist unsicher, daher keins)
VICTIMS = [("Andreas Gruber, 63", ""), ("Cäzilia Gruber, 72", ""), ("Viktoria Gabriel, 35", ""),
           ("Cäzilia Gabriel, 7", ""), ("Josef, 2", ""), ("Maria Baumgartner", "the new maid")]
NAMES = [{"name": n, "sub": s} for n, s in VICTIMS]
MEM_AT, MEM_GAP = 1.08, 1.56  # gleichmäßiger Takt, an die Wortzeiten angepasst (nach dem ersten Build nachgemessen)

# Aussprache (Supertonic, Whisper-geprüft, siehe hk5_nametest*.py)
SAY_SIGL = "Later, Yahkob Zeegle, who helped find the family, calls Schlittenbauer the murderer."
SAY_MEM1 = "Remember them: Andreas and Tsetseelia Gruber, and their daughter, Viktoria Gabriel."
SAY_MEM2 = "Her children, Tsetseelia and Yosef, and Maria Bowmgartner, who had arrived that very day."

B, IX = [], {}
def add(key, beat): IX[key] = len(B); B.append(beat)

# 0: Februar 1923 – der Hof wird abgerissen, ein Arbeiter erstarrt über einer Lücke im Boden
add("demo", {"scene": "demolition", "clock": "FEB 1923", **CAP, "trans": "cut", "zoom": [1.0, 1.1], "focus": [880, 700], "pre": 0.15, "post": 0.2,  # Fokus rechts: Label wächst nicht in die rechte Leiste
    "p": {"stage0": 0.22, "stage1": 0.5, "t0": 0, "t1": 4.6, "workers": 3, "freeze": "@hidden", "snow": True,
          "label": {"s": "YOU ARE HINTERKAIFECK", "at": 0.2}},
    "lines": [L("Workers tearing you down find something hidden in your floor.", emph=["hidden", "floor"])],
    "punch": ["@hidden"], "flash": [{"at": "@hidden", "d": 0.12, "c": "#ffffff", "a": 0.16}],
    "sfx": [{"name": "wood_creak_heavy", "at": 0.0, "gain": -7}, {"name": "wood_creak_heavy", "at": "@down", "gain": -10},
            {"name": "heartbeat_single", "at": "@floor+0.45", "gain": -5}]})
# 1: unter den Dielen, im falschen Boden – das Werkzeug wird nie gezeigt, nur das Brett gibt nach und Staub quillt aus den Fugen
add("weapon", {"scene": "attic", "clock": "FEB 1923", **CAP, "trans": "cut", "zoom": [1.0, 1.12], "focus": [700, 1040], "pre": 0.1, "post": 0.15,
    "p": {"lantern": {"x": 700, "y": 760, "at": 0, "swing": True}, "creak": ["@conclude", "@weapon"], "dark": 0.5, "hatch": False},
    "pops": [{"text": "HIDDEN IN A FALSE FLOOR", "at": 0.25, "x": 540, "y": 1330, "size": 66, "dur": 3.9, "rot": -0.02}],
    "lines": [L("Investigators conclude it is the weapon: the family's own mattock.", say="Investigators conclude it is the weapon: the family's own Mattuk.", emph=["weapon", "mattock"])],
    "flash": [{"at": "@weapon", "d": 0.1, "c": "#ffffff", "a": 0.14}],
    "sfx": [{"name": "lantern_squeak", "at": 0.05, "gain": -9}, {"name": "wood_creak_heavy", "at": "@conclude-0.05", "gain": -5},
            {"name": "wood_creak_heavy", "at": "@weapon", "gain": -8}]})
# 2: "Es war die ganze Zeit in dir" – große Worte über der Ruine ...
add("inside", {"scene": "sfx_text", "clock": "FEB 1923", "clockRed": True, **CAP, "trans": "glitch", "pre": 0.3, "post": 0.04,
    "p": {"lines": ["IT WAS HERE", "ALL ALONG"], "times": ["@it", "@whole"], "y": 760, "size": 170,
          "bg": "demolition", "bgP": {"stage": 0.8, "workers": 2, "tiles": False, "snow": True}},
    "lines": [L("It was inside you the whole time,", emph=["inside"])],
    "punch": ["@whole"], "shakeAt": [{"at": "@it", "d": 0.4, "a": 12}],
    "sfx": [{"name": "hit_deep", "at": 0.02, "gain": -10}]})
# 3: ... "und jetzt bist du fort": die letzte Wand fällt, Staub, dann nur noch Schnee auf leerem Feld
add("gone", {"scene": "demolition", "clock": "FEB 1923", **CAP, "trans": "cut", "zoom": [1.0, 1.04], "focus": [600, 900], "pre": 0.05, "post": 1.6,
    "p": {"stage": 0.86, "workers": 3, "tiles": False, "empty": "@gone"},
    "lines": [L("and now you are gone.", emph=["gone"])],
    "shakeAt": [{"at": "@gone+0.8", "d": 0.5, "a": 10}],
    "sfx": [{"name": "wood_creak_heavy", "at": "@now", "gain": -5}, {"name": "whoosh_dark", "at": "@gone+0.35", "gain": -8},
            {"name": "hit_deep", "at": "@gone+0.8", "gain": -4}]})
# 4: Beleidigungsprozess (kein Jahr im Bild; nur das Urteil, keine Anschuldigung in großer Schrift).
# Angeklagt war Sigl: die Figur steht erst bei "sues" auf, nicht unter dem Untertitel "the murderer"
add("slander", {"scene": "courtroom", "clock": "1920s", "place": "BAVARIA", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "pre": 0.1, "post": 0.6,
    "p": {"defendant": {"stand": "@sues"}, "gavel": ["@wins+0.4"], "text": [{"s": "SLANDER", "at": "@sues"}],
          "sentence": {"text": "SCHLITTENBAUER WINS", "at": "@for", "sub": "SIGL FINED 40 MARKS", "count": False}},
    "punch": ["@sigl"],
    # Final-QC: eigene TTS-Gruppe + echte Pause nach "murderer." (sonst hört man "the murderer, Schlittenbauer");
    # ‘…’ markiert im Untertitel das Zitat (Name nie im selben Chunk wie MURDERER, kein emph in diesem Satz)
    "lines": [L("Later, Jakob Sigl, who helped find the family, calls Schlittenbauer ‘the murderer’.", say=SAY_SIGL, gap=0.28),
              L("Schlittenbauer sues him for slander, and wins.", emph=["slander", "wins"])],
    "sfx": [{"name": "paper_rustle", "at": 0.1, "gain": -9}, {"name": "gavel", "at": "@wins+0.35", "gain": -5}]})
# 5: bis 1930 über hundert Ermittlungsverfahren ohne Erfolg
add("inquiries", {"scene": "years_flip", "clock": "1930", "place": "BAVARIA", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 820], "pre": 0.1, "post": 0.2,
    "p": {"from": 1922, "to": 1930, "t0": 0.2, "t1": "@failed-0.3", "label": "100+ POLICE INQUIRIES", "sub": "ALL WITHOUT RESULT"},
    "lines": [L("By nineteen thirty,", gap=0.1), L("over a hundred police inquiries have failed.", emph=["failed"])],
    "sfx": [{"name": "typewriter_key", "at": 0.25, "gain": -12}, {"name": "rubber_stamp", "at": "@failed+0.45", "gain": -6}]})
# 6: Schlittenbauer stirbt 1941 – nichts bewiesen
add("died", {"scene": "evidence_board", "clock": "1941", "place": "BAVARIA", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 880], "pre": 0.1, "post": 0.15,
    "p": {"title": "SCHLITTENBAUER",
          "cards": [{"text": "SUSPECT\nNEVER CHARGED", "x": 0.5, "y": 0.1, "at": 0.15, "rot": -0.03},
                    {"kind": "note", "text": "DIED 1941", "x": 0.24, "y": 0.52, "at": "@dies", "rot": 0.05},
                    {"text": "NOTHING PROVEN", "x": 0.66, "y": 0.8, "at": "@nothing", "rot": -0.04}],
          "strings": [],
          "circle": {"i": 2, "at": "@proven"}},
    "lines": [L("Schlittenbauer dies in nineteen forty-one, and nothing is ever proven against him.", emph=["nothing", "proven"])],
    "sfx": [{"name": "paper_rustle", "at": "@dies", "gain": -6}, {"name": "paper_rustle", "at": "@nothing", "gain": -6}]})
# 7: die Schädel verschwinden (vielleicht im Krieg verbrannt) – nur Worte, Feuerschein
add("skulls", {"scene": "title_card", "clock": "WARTIME", "place": "BAVARIA", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [540, 840], "pre": 0.1, "post": 0.3,
    "p": {"date": "MISSING", "place": "THE SKULLS", "sub": "Perhaps burned in a wartime air raid", "bg": "black", "red": ["MISSING"],
          "at": "@missing-0.15", "size": 150, "y": 820},
    "lines": [L("The skulls, kept for examination, go missing, perhaps burned in a wartime air raid.", emph=["missing"])],
    "flash": [{"at": "@raid+0.2", "d": 0.45, "c": "#ff7a2a", "a": 0.16}, {"at": "@raid+0.75", "d": 0.3, "c": "#ff6a1a", "a": 0.1}],
    "sfx": [{"name": "typewriter_burst", "at": "@missing-0.15", "gain": -11, "dur": 0.9}, {"name": "hit_deep", "at": "@raid+0.45", "gain": -13}]})
# 8: Anschuldigung auf dem Sterbebett (ohne Jahr, ohne Namen), Festnahme 1952, Freilassung
add("arrest", {"scene": "letter", "clock": "1952", "place": "BAVARIA", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 860], "pre": 0.1, "post": 0.3,
    "p": {"style": "typewriter", "paper": "old", "title": "DEATHBED ACCUSATION", "y": 905,
          "lines": [{"text": "Undated: a dying woman had accused her own brothers.", "at": 0.25},
                    {"text": "Names: " + FIELD, "at": "@brothers", "dur": 0.5},
                    {"text": "1952: one brother arrested.", "at": "@nineteen"}],
          "redact": [{"line": 1, "from": 7, "at": "@brothers+0.55"}],
          "stamp": {"text": "RELEASED|NO EVIDENCE", "at": "@released+0.3", "x": 120}},
    "lines": [L("A dying woman had accused her own brothers.", emph=["brothers"]),
              L("In nineteen fifty-two, one is arrested, then released for lack of evidence.", emph=["released"])],
    "sfx": [{"name": "typewriter_burst", "at": 0.25, "gain": -11, "dur": 1.4}, {"name": "typewriter_burst", "at": "@nineteen", "gain": -12, "dur": 1.0},
            {"name": "cell_door_slam", "at": "@arrested+0.35", "gain": -12}, {"name": "rubber_stamp", "at": "@released+0.3", "gain": -5}]})
# 9: 2007 – fünfzehn Kommissarsanwärter öffnen die Akte erneut
add("review", {"scene": "evidence_board", "clock": "2007", "place": "FÜRSTENFELDBRUCK, BAVARIA", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "pre": 0.1, "post": 0.25,
    "p": {"title": "COLD CASE REVIEW · 2007", "torch": False,
          "cards": [{"text": "15 TRAINEE\nDETECTIVES", "x": 0.26, "y": 0.15, "at": "@fifteen", "rot": -0.04, "s": 1.2},
                    {"text": "FINAL REPORT", "x": 0.76, "y": 0.22, "at": "@file", "rot": 0.04},
                    {"kind": "note", "text": "THE CRIME CAN NO LONGER BE PROVEN", "x": 0.5, "y": 0.76, "at": "@verdict", "rot": -0.02, "s": 1.25}],
          "strings": []},  # Fäden liefen quer über "15 TRAINEE DETECTIVES" und "FINAL REPORT"
    "lines": [L("In two thousand seven, fifteen trainee detectives reopen the file."),
              L("Their verdict: the killer can almost certainly never be identified.", emph=["never"])],
    "sfx": [{"name": "paper_rustle", "at": "@fifteen", "gain": -6}, {"name": "paper_rustle", "at": "@file", "gain": -7},
            {"name": "typewriter_burst", "at": "@verdict", "gain": -12, "dur": 1.0}]})
# 10: Sie einigen sich auf einen Namen – und veröffentlichen ihn nie (Quelle des Cold Opens)
add("name", {"scene": "letter", "clock": "2007", "clockRed": True, "place": "FÜRSTENFELDBRUCK, BAVARIA", **CAP, "trans": "glitch",
    "zoom": [1.0, 1.06], "focus": [540, 820], "pre": 0.15, "post": 1.2,
    "p": {"style": "typewriter", "paper": "white", "title": "FINAL REPORT · 2007", "y": 905,
          "lines": [{"text": "Most likely perpetrator:", "at": "@agree"},
                    {"text": FIELD, "at": "@who", "dur": 0.6, "size": 62},
                    {"text": "Out of respect for descendants.", "at": "@never", "dur": 0.8, "size": 40}],
          "redact": [{"line": 1, "from": 0, "at": "@deliberately"}],
          "stamp": {"text": "NEVER|PUBLISHED", "at": "@public+0.3", "x": 120}},
    "lines": [L("They agree on who most likely did it."),
              L("They deliberately never say the name in public.", emph=["never"])],
    "punch": ["@public+0.35"],
    "sfx": [{"name": "typewriter_burst", "at": "@agree", "gain": -11, "dur": 1.2}, {"name": "rubber_stamp", "at": "@public+0.3", "gain": -4},
            {"name": "typewriter_burst", "at": "@never", "gain": -16, "dur": 0.8}, {"name": "typewriter_burst", "at": "@public+0.6", "gain": -16, "dur": 0.8}]})
# 11: Spuren hinein, keine hinaus – auf dem leeren Feld, wo der Hof stand
add("prints", {"scene": "footprints", "clock": "MARCH 1922", "place": "BAVARIA", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [540, 1000], "pre": 0.15, "post": 0.45,
    "p": {"farm": False, "t0": 0.15, "t1": "@none-0.1", "n": 8, "ring": "@out"},
    "lines": [L("Footprints led in, none led out.", emph=["none", "out"], gap=0.18, takes=[6, 10]), L("Nobody knows whose they were.")],
    "sfx": [{"name": "footsteps_snow", "at": 0.1, "gain": -8, "dur": 1.5}, {"name": "heartbeat_single", "at": "@out+0.25", "gain": -6}]})
# 12: Gedenken – nur Weiß, langsam, kein Rot, keine Schläge, keine Untertitel (die das aktive Wort rot färben würden),
# kein HUD; danach eine echte Pause vor der Endkarte
add("memorial", {"scene": "memorial", "clock": "31 MAR 1922", "place": "HINTERKAIFECK, BAVARIA", "noHud": True, "noCaptions": True, "trans": "fade",
    "zoom": [1.0, 1.03], "focus": [540, 860], "pan": [0, 40, 0, 40], "pre": 0.3, "post": 1.8,
    "p": {"title": "NIGHT OF 31 MARCH 1922", "names": NAMES, "at": MEM_AT, "gap": MEM_GAP},
    "lines": [L("Remember them: Andreas and Cäzilia Gruber, and their daughter, Viktoria Gabriel.", say=SAY_MEM1, speed=0.98, gap=0.3),
              L("Her children, Cäzilia and Josef, and Maria Baumgartner, who had arrived that very day.", say=SAY_MEM2, speed=0.98)],
    "sfx": [{"name": "church_bell_distant", "at": 0.1, "gain": -14}]})
# 13: Endkarte
add("end", {"scene": "end_card", "clock": "TODAY", "place": "BAVARIA", **CAP, "trans": "fade", "zoom": [1.0, 1.0], "pre": 0.25, "post": 0.1,
    "p": {"title": "NONE LEADING OUT", "kicker": "THE END", "pill": "FOLLOW FOR THE NEXT STORY", "sub": "SIX NAMES|REMEMBER THEM"},  # kürzer: Pille bleibt bei x<=903
    "lines": [L("Follow for the next true story.")]})

story = base("NONE LEADING OUT", 5, "HINTERKAIFECK, BAVARIA", "FOLLOW FOR THE NEXT TRUE STORY", "THE END")
story["beats"] = B
story["tail"] = 0.7
story["coldOpen"] = {"beat": IX["name"], "words": "They deliberately never say the name in public", "label": "LATER", "lead": 0.3, "hold": 0.4}
story["beds"] = [
    {"name": "drone_bed", "fromBeat": 0, "toBeat": IX["prints"], "gain": 0, "fade": 0.4},
    {"name": "drone_bed", "fromBeat": IX["memorial"], "toBeat": IX["end"], "gain": -5, "fade": 1.2},
    {"name": "wind_snow_bed", "fromBeat": IX["demo"], "toBeat": IX["demo"], "gain": -1, "fade": 0.4},
    {"name": "wind_snow_bed", "fromBeat": IX["inside"], "toBeat": IX["gone"], "gain": 0, "fade": 0.4},
    {"name": "farm_night_bed", "fromBeat": IX["weapon"], "toBeat": IX["weapon"], "gain": -2, "fade": 0.3},
    {"name": "dark_pad_tension", "fromBeat": IX["demo"], "toBeat": IX["gone"], "gain": -5, "fade": 0.8},
    {"name": "heartbeat_slow_muffled", "fromBeat": IX["weapon"], "toBeat": IX["inside"], "gain": -9, "fade": 0.6},
    {"name": "courtroom_room_tone", "fromBeat": IX["slander"], "toBeat": IX["slander"], "gain": -1, "fade": 0.5},
    {"name": "clock_tick_bed", "fromBeat": IX["inquiries"], "toBeat": IX["review"], "gain": -9, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": IX["review"], "toBeat": IX["name"], "gain": -6, "fade": 0.8},
    {"name": "wind_snow_bed", "fromBeat": IX["prints"], "toBeat": IX["prints"], "gain": -1, "fade": 0.6},
    {"name": "wind_snow_bed", "fromBeat": IX["memorial"], "toBeat": IX["memorial"], "gain": -9, "fade": 1.2}]
save(story, sys.argv[1] + "/en/hk_part5.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words", IX)
