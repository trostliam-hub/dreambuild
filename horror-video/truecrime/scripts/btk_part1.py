# YOU ARE BTK – Teil 1 "The Family Man"
# Erzähltext wörtlich aus tc_scripts/A_part1.json (faktengeprüft); Ausnahme laut Brief: Beat "murderer" mit "officially".
# Fakten für Einblendungen: tc_scripts/research_A.json (Otero 15.01.1974: Joseph 38, Julie 34, Josephine 11, Joseph II 9;
# Kathryn Bright 21, 04.04.1974; Kevin überlebt; Brief Okt. 1974 mit "B.T.K."). Der echte Name erscheint nie (Schwärzungsbalken).
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from tc_common import *

S = sys.argv[1]
CAP = {"captionY": 1500, "capBox": True}
OTERO = "Oh-tair-oh"
BLACK = "█" * 6 + " " + "█" * 5   # geschwärzter Name

def pop(text, at, y=560, size=80, dur=30, rot=0.0, x=540):
    """Rote Einblendung im Bildschirmraum (beat.pops, babysit.js) – bleibt bis Beat-Ende stehen."""
    return {"text": text, "at": at, "x": x, "y": y, "size": size, "dur": dur, "rot": rot}

# Brief von Okt. 1974: Inhalt wird nie gezeigt – Platzhalter unter Schwärzungsbalken, nur OTERO und B.T.K. bleiben sichtbar
LT = ["xxxxxxx xxxx xxxxxx xx xxx xxxx xxxxx", "xxxxx xxxx xxxxxxx xx xxxx xxx", "OTERO", "xxxx xxxxxxx xxxxx xxxxxxx xx", "xxxxxx xx xxx xxxx"]
def btk_letter(times, sig_at):
    """Brief-Parameter; times = Startzeit je Zeile (Schwärzung liegt sofort über jedem getippten Zeichen)."""
    durs = [0.55, 0.5, 0.45, 0.5, 0.4]
    lines = [{"text": t, "at": a, "dur": d, **({"red": True, "size": 96} if t == "OTERO" else {})} for t, a, d in zip(LT, times, durs)]
    red = [{"line": i, "from": 0, "at": -9} for i, t in enumerate(LT) if t != "OTERO"]
    return {"style": "typewriter", "paper": "white", "tilt": -0.025, "y": 900, "lines": lines, "redact": red, "hl": ["OTERO"],
            "signature": {"text": "B.T.K.", "at": sig_at, "style": "type", "red": True}}

TITLE = {"date": "A TRUE STORY.", "place": "WICHITA, KANSAS", "red": [], "at": 0.0, "bg": "black", "y": 560}
B = []
# 0: Hook Teil 1 – "A TRUE STORY" tippt sich auf Schwarz
B.append({"scene": "title_card", "clock": "1974", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 800],
    "p": TITLE,
    "lines": [L("This is a true story.", emph=["true"], gap=0.05)], "post": 0.0,
    "sfx": [{"name": "typewriter_burst", "at": 0.0, "gain": -7}]})
# 1: Hook Teil 2 – YOU ARE / THE KILLER knallt rot rein (keine Untertitel: das Bild zeigt die Worte groß)
B.append({"scene": "sfx_text", "clock": "1974", **CAP, "noCaptions": True, "trans": "glitch", "zoom": [1.0, 1.08], "focus": [540, 880], "vignette": 0.95,
    "p": {"lines": ["YOU ARE", "THE KILLER."], "times": ["@you", "@killer"], "y": 880, "size": 170, "bg": "title_card", "bgP": {**TITLE, "at": -5, "speed": 200}},
    "lines": [L("And in it, you are the killer.", emph=["killer"])], "post": 0.55,
    "punch": ["@killer"], "shakeAt": [{"at": "@killer", "d": 0.4, "a": 14}], "glitch": [{"at": "@killer", "d": 0.1}],
    "flash": [{"at": "@killer", "d": 0.12, "c": "#ff2020", "a": 0.35}],
    "sfx": [{"name": "sub_pulse", "at": "@you", "gain": -8}, {"name": "hit_deep", "at": "@killer+0.42", "gain": -4}]})
# 2: der Ausweis – Name geschwärzt, Stempel AIR FORCE VETERAN
B.append({"scene": "id_badge", "clock": "1974", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [540, 850],
    "p": {"kind": "card", "org": "WICHITA, KANSAS · 1974", "name": BLACK, "title": "COLLEGE STUDENT", "idno": " ",
          "at": 0.0, "stamp": {"text": "AIR FORCE|VETERAN", "at": "@air", "x": 195, "y": 118}},
    "pops": [pop("AGE 28", "@twentyeight", y=470, size=96, rot=-0.04), pop("MARRIED", "@married", y=1250, size=84, rot=0.03, x=330),
             pop("STUDENT", "@college", y=1250, size=84, rot=-0.03, x=760)],
    # Pause nach "married," – sonst klingt es wie "married an Air Force veteran"; pre: der Whoosh läuft vor der Stimme
    "lines": [L("You are twenty-eight, married,", emph=["twenty-eight"], gap=0.22), L("an Air Force veteran, and a college student.")],
    "pre": 0.25, "post": 0.35,
    "sfx": [{"name": "whoosh_dark", "at": 0.0, "gain": -10}, {"name": "rubber_stamp", "at": "@air", "gain": -10}]})
# 3: Doppelleben – Familie links, du im Dunkeln rechts; am Ende frisst die dunkle Hälfte die warme
B.append({"scene": "double_life", "clock": "LATER", **CAP, "trans": "cut", "zoom": [1.0, 1.04],
    "p": {"left": "family", "right": "shadow", "split": "@later", "swap": "@president+0.45",
          "labels": {"l": "FATHER OF TWO. CHURCH COUNCIL PRESIDENT.", "r": "THE KILLER", "at": "@father"}},
    "lines": [L("Later, you'll be a father of two and a church council president.", emph=["father", "president"])], "post": 1.0,
    "glitch": [{"at": "@president+0.45", "d": 0.14}],
    "sfx": [{"name": "whoosh_dark", "at": "@later", "gain": -9}, {"name": "tv_static_burst", "at": "@president+0.45", "gain": -12},
            {"name": "sub_pulse", "at": "@president+0.5", "gain": -6}]})
# 4: 31 Jahre – Zähler 1974 → 2005 (keine Opferzahl auf dem Bild)
B.append({"scene": "years_flip", "clock": "1974", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 820],
    "p": {"from": 1974, "to": 2005, "t0": "@kill", "t1": "@years+0.15", "label": "HIDDEN FOR 31 YEARS"},
    "lines": [L("You will kill ten people, and hide it for thirty-one years.", emph=["ten", "thirty-one"])], "post": 0.6,
    "sfx": [{"name": "clock_tick_bed", "at": "@kill", "gain": -9, "dur": 2.6}, {"name": "hit_deep", "at": "@years+0.4", "gain": -6}]})
# 5: 15. Januar 1974 – Haus der Oteros, eine Gestalt geht an der Seite nach hinten
OT = {"style": "ranch", "tree": True, "lamp": True}
B.append({"scene": "house_ext", "clock": "JAN 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.02], "focus": [560, 1000],
    "p": {**OT, "dolly": [0, 6, 1.1], "windows": [{"i": 2, "dim": 0.75}],
          "figure": {"at": 0.15, "x": 0.95, "y": 0.6, "h": 0.105, "move": [0.15, "@wichita+0.2", 0.06], "until": "@wichita+0.1", "fade": 0.5}},
    "pops": [pop("JANUARY 15, 1974", "@january", y=470, size=92, rot=-0.03)],
    "lines": [L("On January fifteenth, nineteen seventy-four, you walk into a family's home in Wichita.", emph=["walk"])], "post": 0.5,
    "sfx": [{"name": "typewriter_key", "at": "@january", "gain": -6}, {"name": "footsteps_approach", "at": "@you", "gain": -15, "dur": 2.6}]})
# 6: die Familie – ruhige weiße Gedenkliste (keine roten Pops), ohne HUD; Takt so, dass Josephine und Joseph II auf ihre Worte kommen
B.append({"scene": "memorial", "clock": "JAN 1974", **CAP, "noHud": True, "trans": "fade", "zoom": [1.0, 1.03], "focus": [540, 860],
    "p": {"title": "", "names": [{"name": "Joseph Otero", "sub": "AGE 38"}, {"name": "Julie Otero", "sub": "AGE 34"},
                                 {"name": "Josephine Otero", "sub": "AGE 11"}, {"name": "Joseph Otero II", "sub": "AGE 9"}], "at": 0.05, "gap": 1.5},
    "lines": [L("Joseph and Julie Otero are home with their two youngest, Josephine, eleven, and Joseph, nine.",
                say=f"Joseph and Julie {OTERO} are home with their two youngest, Josephine, eleven, and Joseph, nine.")], "post": 0.45})
# 7: vier Lichter gehen aus
B.append({"scene": "house_ext", "clock": "JAN 1974", "clockRed": True, **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [560, 980], "vignette": 0.9,
    "p": {**OT, "windows": [{"i": 0, "off": "@people"}, {"i": 1, "off": "@inside"}, {"i": 2, "off": "@walk"}], "porchOff": "@again+0.35"},
    "lines": [L("Four people inside never walk out again.", emph=["never"])], "post": 1.1,
    "sfx": [{"name": "light_click", "at": "@people", "gain": -9}, {"name": "light_click", "at": "@inside", "gain": -9},
            {"name": "light_click", "at": "@walk", "gain": -9}, {"name": "light_click", "at": "@again+0.35", "gain": -7}]})
# 8: nachmittags – die Ältesten kommen von der Schule. Keine Gestalt am Haus (las sich wie der zurückkehrende Täter),
#    sondern eine Zeitkarte auf Schwarz; Schritte + Türklinke erzählen die Heimkehr der Kinder
B.append({"scene": "title_card", "clock": "JAN 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 820],
    "p": {"date": "THAT AFTERNOON.", "place": "THE OTERO HOME", "red": [], "bg": "black", "at": 0.0},
    "lines": [L("That afternoon, their three oldest come home from school and find their parents.", emph=["find"])], "post": 0.25,
    "sfx": [{"name": "typewriter_burst", "at": 0.0, "gain": -12, "dur": 1.1}, {"name": "footsteps_approach", "at": 0.6, "gain": -15, "dur": 2.6},
            {"name": "door_handle", "fromEnd": 0.35, "gain": -9}]})
# 9: "officially a murderer" – kalter Aktenstempel, kein Jubel
B.append({"scene": "letter", "clock": "JAN 1974", "clockRed": True, **CAP, "trans": "glitch", "zoom": [1.0, 1.3], "focus": [540, 1080], "vignette": 0.95,
    "p": {"style": "typewriter", "paper": "old", "title": "CASE FILE · HOMICIDE", "tilt": -0.015, "y": 960,
          "lines": [{"text": "DATE:     JANUARY 15, 1974", "at": 0.0, "dur": 0.3, "size": 38}, {"text": "PLACE:    WICHITA, KANSAS", "at": 0.15, "dur": 0.3, "size": 38},
                    {"text": "VICTIMS:  OTERO FAMILY", "at": 0.3, "dur": 0.35, "size": 38}, {"text": "SUSPECT:  UNKNOWN", "at": "@nobody", "dur": 0.55, "size": 38}],
          "hl": ["UNKNOWN"], "stamp": {"text": "MURDERER", "at": "@murderer+0.42", "x": 0, "y": 120, "rot": -0.09, "w": 760}},
    "lines": [L("Now you are officially a murderer.", emph=["murderer"], gap=0.55), L("And nobody in Wichita knows your face.", emph=["nobody"])], "post": 0.6,
    "punch": ["@murderer+0.42"], "shakeAt": [{"at": "@murderer+0.42", "d": 0.35, "a": 12}],
    "sfx": [{"name": "typewriter_burst", "at": 0.0, "gain": -11}, {"name": "rubber_stamp", "at": "@murderer+0.42", "gain": -3},
            {"name": "hit_deep", "at": "@murderer+0.44", "gain": -7}, {"name": "typewriter_burst", "at": "@nobody", "gain": -13}]})
# 10: April 1974 – Kathryn Bright
BR = {"style": "suburb", "tree": True, "lamp": True}
B.append({"scene": "house_ext", "clock": "APR 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [560, 980],
    "p": {**BR, "windows": [{"i": 3, "off": "@later"}], "porch": True},
    "pops": [pop("APRIL 4, 1974", "@april", y=410, size=84, rot=-0.03, x=500), pop("KATHRYN BRIGHT, 21", "@kathryn", y=505, size=70, rot=0, x=490)],
    "lines": [L("In April, you attack Kathryn Bright, twenty-one.", emph=["kathryn"]), L("She dies hours later.", emph=["dies"])], "post": 0.6,
    "sfx": [{"name": "typewriter_key", "at": "@april", "gain": -6}, {"name": "heartbeat_single", "at": "@later+0.8", "gain": -5}]})
# 11: Kevin entkommt – Quelle des Cold Opens. Er steht ab "escapes" in der hellen Tür und rennt auf "Someone" los,
#     damit die Flucht im Cold Open (ab "Someone") zu sehen ist; KEVIN BRIGHT steht schon im ersten Cold-Open-Bild
B.append({"scene": "house_ext", "clock": "APR 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [560, 980],
    "p": {**BR, "windows": [], "porch": True, "door": {"open": "@escapes-0.45", "dur": 0.4, "light": "warm"},
          "figure": {"at": "@escapes-0.1", "x": 0.56, "y": 0.62, "h": 0.112, "move": ["@someone-0.25", "@you+0.35", 1.25], "fade": 0.1,
                     "coat": "none"}},   # junger Mann ohne Mantel – nicht die Täter-Silhouette aus Beat 5
    "pops": [pop("KEVIN BRIGHT", "@someone-0.1", y=450, size=88, rot=-0.03), pop("SURVIVED", "@survived", y=570, size=120, rot=0.02)],
    "lines": [L("Her brother Kevin is badly hurt, but he escapes alive.", emph=["escapes", "alive"], gap=0.4), L("Someone has survived you.", emph=["survived"])],
    "post": 0.7, "punch": ["@survived"], "flash": [{"at": "@survived", "d": 0.1, "c": "#ffffff", "a": 0.25}],
    "sfx": [{"name": "door_handle", "at": "@escapes-0.5", "gain": -7}, {"name": "footsteps_approach", "at": "@someone-0.25", "gain": -10, "dur": 1.6},
            {"name": "stinger_reveal", "at": "@you+0.35", "gain": -8}]})
# 12: Herbst 1974 – drei Männer in Haft reden; du schreibst
B.append({"scene": "evidence_board", "clock": "OCT 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 900],
    "p": {"title": "THE OTERO CASE", "at": 0.0,
          "cards": [{"text": "OTERO\nJAN 15, 1974", "x": 0.38, "y": 0.0, "at": 0.15, "rot": -0.03},
                    {"text": "BRIGHT\nAPR 4, 1974", "x": 0.87, "y": 0.04, "at": 0.4, "rot": 0.09, "s": 0.8},   # allein, frei von der rechten TikTok-Leiste
                    {"kind": "photo", "img": "person", "text": "IN CUSTODY", "x": 0.1, "y": 0.5, "at": "@three", "rot": -0.05},
                    {"kind": "photo", "img": "person", "text": "IN CUSTODY", "x": 0.5, "y": 0.52, "at": "@men", "rot": 0.03},
                    {"kind": "photo", "img": "person", "text": "IN CUSTODY", "x": 0.9, "y": 0.5, "at": "@custody", "rot": -0.02},
                    {"kind": "note", "text": "THEY KNOW\nNOTHING", "x": 0.5, "y": 0.97, "at": "@nothing", "red": True, "rot": -0.04}],
          "strings": [{"from": 2, "to": 0, "at": "@talk"}, {"from": 3, "to": 0, "at": "@about"}, {"from": 4, "to": 0, "at": "@oteros"}],
          "circle": {"i": 5, "at": "@nothing+0.45"}},
    "lines": [L("That fall, three men in police custody talk about the Oteros.", say=f"That fall, three men in police custody talk about the {OTERO}s."),
              L("So you write a letter saying they know nothing.", emph=["letter", "nothing"])], "post": 0.5,
    "sfx": [{"name": "paper_rustle", "at": "@three", "gain": -8}, {"name": "paper_rustle", "at": "@custody", "gain": -8},
            {"name": "typewriter_burst", "at": "@write", "gain": -11}, {"name": "low_piano_hit", "at": "@nothing+0.45", "gain": -9}]})
# 13: der Brief – alles geschwärzt außer OTERO; am Ende tippt sich B.T.K.
B.append({"scene": "letter", "clock": "OCT 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [540, 950],
    "p": btk_letter([0.05, 0.45, "@murders", "@yours+0.25", "@end"], "@name"),
    "lines": [L("You claim the murders as yours.", emph=["murders"]), L("And at the end, you give yourself a name.", emph=["name"])], "post": 0.55,
    "sfx": [{"name": "typewriter_burst", "at": 0.05, "gain": -10}, {"name": "typewriter_burst", "at": "@murders", "gain": -10},
            {"name": "typewriter_burst", "at": "@end", "gain": -12}]})
# 14: B. T. K. – drei Buchstaben auf reinem Schwarz ("die Seite wird schwarz"), je ein Anschlag und ein roter Blitz;
#     kein Brief dahinter, damit die Initialen nie über "OTERO" stehen
B.append({"scene": "sfx_text", "clock": "OCT 1974", "noCaptions": True, "trans": "glitch", "zoom": [1.0, 1.1], "focus": [540, 900], "vignette": 0.95,
    "p": {"lines": ["B.", "T.", "K."], "times": ["@b", "@t", "@k"], "xs": [330, 540, 750], "y": 640, "size": 230},
    "lines": [L("B.", say="Bee.", gap=0.32), L("T.", say="Tee.", gap=0.32), L("K.", say="Kay.")], "pre": 0.15, "post": 0.9,
    "punch": ["@b", "@t", "@k"], "shakeAt": [{"at": "@k", "d": 0.35, "a": 12}],
    "flash": [{"at": "@b", "d": 0.1, "c": "#ff2020", "a": 0.3}, {"at": "@t", "d": 0.1, "c": "#ff2020", "a": 0.3}, {"at": "@k", "d": 0.12, "c": "#ff2020", "a": 0.28}],
    "sfx": [{"name": "typewriter_key", "at": "@b", "gain": -3}, {"name": "typewriter_key", "at": "@t", "gain": -3},
            {"name": "typewriter_key", "at": "@k", "gain": -2}, {"name": "hit_deep", "at": "@k+0.45", "gain": -5}]})
# 15: Endkarte
B.append({"scene": "end_card", "clock": "OCT 1974", **CAP, "noCaptions": False, "trans": "cut",
    "p": {"title": "YOU ARE BTK", "kicker": "PART 1 OF 5", "pill": "FOLLOW FOR PART 2", "sub": "WOULD ANYONE SUSPECT YOU?|TELL ME IN THE COMMENTS"},
    "lines": [L("Follow for part two.", emph=["two"])], "post": 0.9,
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -9}]})

story = base("YOU ARE BTK", 1, "WICHITA, KANSAS", "FOLLOW FOR PART 2", "PART 2")
story["beats"] = B
story["lead"] = 0.05   # Stimme setzt nach dem Cold Open sofort ein
# Cold Open: ab "Someone" (Kevin rennt gerade aus der hellen Tür), Stinger klingt noch an
story["coldOpen"] = {"beat": 11, "words": "Someone has survived you.", "label": "LATER", "lead": 0.05, "hold": 0.75}
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "dark_pad_tension", "fromBeat": 1, "toBeat": 4, "gain": -4, "fade": 0.8},
    {"name": "night_suburb_bed", "fromBeat": 5, "toBeat": 7, "gain": 0, "fade": 0.6},   # endet vor "That afternoon" (Grillen = Nacht)
    {"name": "heartbeat_slow_muffled", "fromBeat": 7, "toBeat": 9, "gain": -6, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": 9, "toBeat": 11, "gain": -3, "fade": 0.8},
    {"name": "night_suburb_bed", "fromBeat": 10, "toBeat": 11, "gain": -1, "fade": 0.6},
    {"name": "clock_tick_bed", "fromBeat": 12, "toBeat": 13, "gain": -5, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": 12, "toBeat": 15, "gain": -3, "fade": 1.0}]
save(story, S + "/en/btk_part1.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words")
