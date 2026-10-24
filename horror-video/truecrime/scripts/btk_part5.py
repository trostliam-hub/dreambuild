# YOU ARE BTK – Teil 5 (Finale) "Be Honest": Anzeige, Diskette, Name, Jeep, DNA, Festnahme, Urteil, Gedenken
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from tc_common import *

CAP = {"captionY": 1500, "capBox": True}
# Antwort-Anzeige der Polizei (Wortlaut auf dem Bildschirm genau "ok", gesprochen "okay")
AD = "Rex, it will be ok"
# Gedenken: Namen genau wie im Recherche-Dossier (Vor- und Nachname), darunter das Jahr
VICTIMS = [("Joseph Otero", "1974"), ("Julie Otero", "1974"), ("Josephine Otero", "1974"), ("Joseph Otero II", "1974"),
           ("Kathryn Bright", "1974"), ("Shirley Vian", "1977"), ("Nancy Fox", "1977"), ("Marine Hedge", "1985"),
           ("Vicki Wegerle", "1986"), ("Dolores Davis", "1991")]
NAMES = [{"name": n, "sub": y} for n, y in VICTIMS]
MEM_AT, MEM_GAP = 0.57, 1.635   # Otero-Satz: an die Wortzeiten angepasst (btk5_memfit.py)
MEM_PRE2, MEM_G2 = 0.25, 1.15   # übrige sechs Namen: Takt je Name (Clip-Start = Name erscheint)
ROLL_GAPS = [0.19, 0.17, 0.28, 0.26, 0.2]  # Pausen nach jedem Namen, so dass die Clip-Starts im Takt MEM_G2 liegen
ROLL_T0 = MEM_PRE2 + 0.04       # erster Name im Beat (Clip-Anfang + Vorlauf der Wortzeiten)

B, IX = [], {}
def add(key, beat): IX[key] = len(B); B.append(beat)

# 0: die Polizei antwortet per Kleinanzeige
add("ad", {"scene": "classified_ad", "clock": "JAN 2005", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 820], "pre": 0.15,
    "p": {"mode": "reveal", "text": AD, "at": "@rex-0.15"},
    "lines": [L("The police answer in the ad you asked for.", emph=["ad"]),
              L("Rex, it will be okay.", voice="quote")],
    "sfx": [{"name": "paper_rustle", "at": 0.05, "gain": -6}, {"name": "typewriter_burst", "at": "@rex-0.05", "gain": -12, "dur": 1.2}]})
# 1: es ist eine Lüge
add("lie", {"scene": "sfx_text", "clock": "JAN 2005", **CAP, "trans": "glitch", "pre": 0.1, "post": 0.35, "vignette": 0.9,
    "p": {"lines": ["IT'S", "A LIE."], "times": ["@its", "@lie"], "y": 1120, "size": 200,
          "bg": "classified_ad", "bgP": {"mode": "reveal", "text": AD, "at": -4, "ringAt": -2}},
    "lines": [L("You believe them, but it's a lie.", emph=["lie"])],
    "shakeAt": [{"at": "@lie", "d": 0.5, "a": 14}], "glitch": [{"at": "@lie+0.35", "d": 0.12}],
    "sfx": [{"name": "hit_deep", "at": "@lie+0.4", "gain": -6}]})
# 2: die Diskette, die Metadaten, "Dennis" (eine durchgehende Kamerafahrt; Sätze einzeln, damit die Felder exakt beim Wort tippen)
add("disk", {"scene": "computer_disk", "clock": "FEB 2005", **CAP, "trans": "cut", "zoom": [1.0, 1.02], "pre": 0.15, "post": 0.3,
    "p": {"floppyIn": "@purple-0.5", "open": "@deleted+0.3", "file": "DELETED FILE", "clock": "11:52 PM",  # neutraler Dateiname (Dossier: nur "gelöschte Word-Datei")
          "fields": [{"k": "Organization", "v": "Christ Lutheran Church", "at": "@christ", "red": True},
                     {"k": "Last modified by", "v": "Dennis", "at": "@dennis", "red": True}],
          "zoom": "@last-0.2"},
    "lines": [L("In February, your purple floppy disk reaches a television station.", emph=["purple"], gap=0.15),
              L("A deleted file's hidden data reads:", gap=0.05),
              L("Christ Lutheran Church.", emph=["christ", "lutheran", "church"], gap=0.15),
              L("Last modified by...", gap=0.25),
              L("Dennis.", emph=["dennis"])],
    "punch": ["@dennis+0.1"], "flash": [{"at": "@dennis+0.45", "d": 0.12, "c": "#ff2020", "a": 0.25}],
    "sfx": [{"name": "floppy_insert", "at": "@purple+0.71", "gain": -7}, {"name": "light_click", "at": "@deleted", "gain": -12},
            {"name": "typewriter_key", "at": "@christ", "gain": -14}, {"name": "stinger_reveal", "at": "@dennis+0.5", "gain": -8}]})
# 3: die Kirche
add("church", {"scene": "church_ext", "clock": "FEB 2005", **CAP, "trans": "cut", "zoom": [1.0, 1.07], "focus": [600, 1000], "pre": 0.2, "post": 0.12,
    "p": {"lit": True},
    "lines": [L("The church website names its council president,", emph=["president"])],
    "sfx": [{"name": "church_bell_distant", "at": 0.05, "gain": -10}]})
# 4: der Name (ab hier steht der echte Name im Bild)
add("name", {"scene": "id_badge", "clock": "FEB 2005", "clockRed": True, **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 860], "pre": 0.4, "post": 0.55,
    "p": {"kind": "nameplate", "red": True, "org": "CHRIST LUTHERAN CHURCH", "title": "COUNCIL PRESIDENT", "name": "DENNIS RADER", "at": 0.0,
          "stamp": {"text": "IDENTIFIED", "at": "@away+0.3", "x": 0, "y": -190, "rot": -0.07, "w": 440}},
    "lines": [L("Dennis Rader.", emph=["dennis", "rader"], gap=0.1), L("Your own disk gives you away.", emph=["disk"])],
    "flash": [{"at": 0.75, "d": 0.12, "c": "#ffffff", "a": 0.3}], "punch": ["@away+0.3"],
    "sfx": [{"name": "hit_deep", "at": 0.02, "gain": -5}, {"name": "rubber_stamp", "at": "@away+0.3", "gain": -5}]})
# 5: der Jeep auf der Ladenkamera ...
add("cctv", {"scene": "parking_lot", "clock": "FEB 2005", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [700, 700], "pre": 0.1, "post": 0.15,
    "p": {"mode": "cctv", "ring": "@caught+0.1", "ts": "JAN 2005  REC 00:00:07"},  # Laufzeit statt erfundener Uhrzeit
    "lines": [L("Back at the store, a camera caught a black Jeep Cherokee.", emph=["jeep", "cherokee"])],
    "sfx": [{"name": "static_burst", "at": 0.0, "gain": -16}]})
# 6: ... und vor deinem Haus
add("drive", {"scene": "parking_lot", "clock": "FEB 2005", "place": "PARK CITY, KANSAS", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "pre": 0.1, "post": 0.2,
    "p": {"mode": "driveway", "ring": "@one"},
    "lines": [L("One is parked outside your house.", emph=["house"])],
    "sfx": [{"name": "heartbeat_single", "at": "@house+0.4", "gain": -6}]})
# 7: DNA
add("dna", {"scene": "evidence_board", "clock": "FEB 2005", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "pre": 0.1, "post": 0.3,
    "p": {"title": "FINAL PROOF", "at": 0.0,
          "cards": [{"text": "MEDICAL SAMPLE", "x": 0.22, "y": 0.18, "at": "@medical", "rot": -0.05},
                    {"text": "CRIME SCENE DNA", "x": 0.78, "y": 0.36, "at": "@knowledge", "rot": 0.04},
                    {"kind": "note", "text": "FAMILY MATCH", "x": 0.5, "y": 0.78, "at": "@the-0.4", "red": True, "rot": -0.03}],
          "strings": [{"from": 0, "to": 1, "at": "@knowledge"}, {"from": 1, "to": 2, "at": "@points"}, {"from": 0, "to": 2, "at": "@points+0.15"}],
          "circle": {"i": 2, "at": "@you+0.1"}},
    "lines": [L("For final proof, police obtain your daughter's medical sample without her knowledge.", emph=["medical"]),
              L("The DNA points back to you.", emph=["you"])],
    "sfx": [{"name": "paper_rustle", "at": "@medical", "gain": -6}, {"name": "paper_rustle", "at": "@knowledge", "gain": -6},
            {"name": "rubber_stamp", "at": "@the-0.4", "gain": -5}, {"name": "heartbeat_single", "at": "@you+0.45", "gain": -5}]})
# 8: Festnahme
add("arrest", {"scene": "police_lights", "clock": "FEB 2005", "clockRed": True, "place": "PARK CITY, KANSAS", **CAP, "trans": "glitch", "zoom": [1.0, 1.07], "pre": 0.15, "post": 0.35,
    # Verkehrskontrolle auf der Straße (mittags), keine Razzia am Haus: kein Haus, keine Taschenlampen
    "p": {"text": {"s": "FEB 25, 2005", "at": "@february"}, "arrest": "@pull", "cars": 3, "officers": 3, "house": False, "flashlights": False},
    "lines": [L("On February twenty-fifth, two thousand five, police pull you over near your home.", emph=["pull"])],
    "shakeAt": [{"at": "@pull+0.4", "d": 0.4, "a": 10}],
    "sfx": [{"name": "siren_wail", "at": 0.0, "gain": -9}, {"name": "typewriter_burst", "at": "@february", "gain": -12, "dur": 1.0},
            {"name": "car_door", "at": "@over", "gain": -8}, {"name": "police_radio", "at": "@home", "gain": -10}]})
# 9: Verhör
add("interview", {"scene": "interview_room", "clock": "FEB 2005", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 900], "pre": 0.15, "post": 0.35,
    "p": {"word": {"s": "CONFESSION", "at": "@confess"}, "object": {"at": "@lied-0.3"}},
    "lines": [L("Under questioning, you confess.", emph=["confess"]),
              L("And you ask Lieutenant Ken Landwehr why he lied to you.", emph=["lied"])],
    "sfx": [{"name": "typewriter_burst", "at": "@confess", "gain": -13, "dur": 1.0}, {"name": "light_click", "at": "@lied", "gain": -12}]})
# 10: Landwehrs Antwort (Quelle des Cold Opens)
add("quote", {"scene": "rule_card", "clock": "FEB 2005", "noCaptions": True, "trans": "cut", "zoom": [1.0, 1.03], "focus": [540, 820], "pre": 0.35, "post": 0.45,
    "p": {"label": "LT. KEN LANDWEHR", "text": "BECAUSE I WAS TRYING TO CATCH YOU.", "hl": ["CATCH", "YOU"]},
    "lines": [L("Because I was trying to catch you.", voice="quote")],
    "punch": ["@catch"],
    # Schlag genau auf den Anfang des Cold Opens (lead 0.08 vor "Because"): dort ist die Karte schon voll eingeblendet
    "sfx": [{"name": "hit_deep", "at": "@because-0.08", "gain": -8}, {"name": "heartbeat_single", "at": "@you+0.5", "gain": -6}]})
# 11: Urteil
# Uhr nur "2005": Schuldbekenntnis 27. Juni, Urteil 18. Aug. 2005
add("court", {"scene": "courtroom", "clock": "2005", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "pre": 0.1, "post": 0.25,
    "p": {"defendant": {"stand": True}, "gavel": ["@and-0.25"],
          "text": [{"s": "GUILTY", "at": "@guilty-0.05"}],
          "sentence": {"text": "10 CONSECUTIVE LIFE SENTENCES", "at": "@consecutive-0.2", "sub": "NO PAROLE FOR 175 YEARS"}},
    "lines": [L("You plead guilty to ten murders, and get ten consecutive life sentences.", emph=["guilty"]),
              L("No parole for at least one hundred seventy-five years.", emph=["parole"])],
    "sfx": [{"name": "gavel", "at": "@and-0.3", "gain": -5}]})
# 12–14: Gedenken – nur Weiß, langsam, kein Rot, keine Schläge, keine Untertitel (die das aktive Wort rot färben würden).
# Alle Gedenk-Beats bekommen dieselbe Namensliste (gleiches Layout). Die Beat-Länge von 12 und "at" von 13 sind so gerechnet,
# dass jeder Name über die Schnitte hinweg genau weiterläuft – die Schnitte sind unsichtbar, die Kamera fährt durch.
add("mem1", {"scene": "memorial", "clock": "AUG 2005", "noCaptions": True, "noHud": True, "trans": "fade", "zoom": [1.0, 1.02], "focus": [540, 900], "pre": 0.5, "post": 0.1,
    "minDur": round(MEM_AT + 3 * MEM_GAP + MEM_G2 - ROLL_T0, 3),
    "p": {"title": "", "names": NAMES, "at": MEM_AT, "gap": MEM_GAP},
    "lines": [L("Joseph Otero, Julie Otero, and their children Josephine and Joseph.", say="Joseph Oh-tair-oh, Julie Oh-tair-oh, and their children Josephine and Joseph.", speed=0.97)]})
ROLL = [("Kathryn Bright.", None), ("Shirley Vian.", "Shirley Vee-an."), ("Nancy Fox.", None), ("Marine Hedge.", None),
        ("Vicki Wegerle.", "Vicki Wegg-er-lee."), ("Dolores Davis.", None)]
add("mem2", {"scene": "memorial", "clock": "AUG 2005", "noCaptions": True, "noHud": True, "trans": "cut", "zoom": [1.02, 1.035], "focus": [540, 900], "pre": MEM_PRE2, "post": 0.3,
    "p": {"title": "", "names": NAMES, "at": round(ROLL_T0 - 4 * MEM_G2, 3), "gap": MEM_G2},
    "lines": [L(t, speed=0.97, **({"say": s} if s else {}), **({"gap": ROLL_GAPS[i]} if i < len(ROLL) - 1 else {})) for i, (t, s) in enumerate(ROLL)]})
# mem3: der Schlusssatz steht als ruhige graue Gedenk-Überschrift über den Namen (kein Rot, keine Untertitel).
# Mit Titel rutscht die Namensliste in der Szene um (545 - 380) / 2 = 82.5 px nach unten; "pan" schiebt die Kamera
# genau um zoom * 82.5 zurück (pan und zoom laufen mit derselben Kurve), damit die Namen am Schnitt stillstehen.
MEM3_Z = [1.035, 1.04]; MEM3_DY = 82.5
# "not his." bekommt ein eigenes ruhiges Bild (mem3b), sichtbar während es gesprochen wird. Der Satz bleibt EIN TTS-Clip
# (Ton unverändert): mem3 endet per negativem "post" in der Komma-Pause mitten im Clip, der Rest des Clips läuft unter mem3b.
# Clip vo/b14_0.wav = 1.585 s, Komma-Pause 0.92–0.98 s, "not" ab ≈1.0 s (Whisper auf den Teilstücken geprüft); lineGap 0.14.
# mem3b dauert genau so lange, dass die Endkarte wie vorher beginnt (Clip-Ende + 0.14 + 0.75).
MEM3_CLIP, MEM3_CUT, LGAP = 1.585, 0.96, 0.14
add("mem3", {"scene": "memorial", "clock": "AUG 2005", "noCaptions": True, "noHud": True, "trans": "cut", "zoom": MEM3_Z, "focus": [540, 900], "pre": 0.35,
    "post": round(MEM3_CUT - MEM3_CLIP - LGAP, 3), "minDur": 0.5,
    "pan": [0, round(-MEM3_DY * MEM3_Z[0], 3), 0, round(-MEM3_DY * MEM3_Z[1], 3)],
    "p": {"title": "REMEMBER THEIR NAMES", "names": NAMES, "at": -20, "gap": 0.0},
    "lines": [L("Remember their names, not his.", speed=0.97)]})
# mem3b: nur die Worte "Not his." in der ruhigen weißen Gedenk-Schrift (kein Rot, keine Untertitel, kein HUD), blendet kurz vor "not" ein
add("mem3b", {"scene": "memorial", "clock": "AUG 2005", "noCaptions": True, "noHud": True, "trans": "cut", "zoom": [1.0, 1.02], "focus": [540, 900], "pre": 0.0, "post": 0.0,
    "minDur": round(MEM3_CLIP - MEM3_CUT + LGAP + 0.75, 3),
    "p": {"title": "", "names": [{"name": "Not his."}], "at": -0.3, "gap": 0.0}, "lines": []})
# 15: Endkarte
add("end", {"scene": "end_card", "clock": "AUG 2005", **CAP, "noHud": True, "trans": "fade", "pre": 0.2, "post": 0.1,
    "p": {"title": "THE END", "kicker": "YOU ARE BTK", "pill": "FOLLOW FOR THE NEXT TRUE STORY", "sub": "REMEMBER THEIR NAMES|NOT HIS"},
    "lines": [L("Follow for the next true story.")]})

story = base("YOU ARE BTK", 5, "WICHITA, KANSAS", "FOLLOW FOR THE NEXT TRUE STORY", "THE END")
story["beats"] = B
# lead 0.08: Cold Open (= TikTok-Cover, Frame 0) beginnt erst, wenn die Zitatkarte schon voll lesbar ist (Einblendung 0–0.3 s)
story["coldOpen"] = {"beat": IX["quote"], "words": "Because I was trying to catch you.", "label": "LATER", "lead": 0.08}
story["beds"] = [
    {"name": "drone_bed", "fromBeat": 0, "toBeat": IX["court"], "gain": 1, "fade": 0.4},
    {"name": "drone_bed", "fromBeat": IX["mem1"], "toBeat": IX["end"], "gain": -4, "fade": 1.2},
    {"name": "newsroom_bed", "fromBeat": IX["ad"], "toBeat": IX["lie"], "gain": -4, "fade": 0.5},
    {"name": "crt_hum_bed", "fromBeat": IX["disk"], "toBeat": IX["disk"], "gain": -2, "fade": 0.4},
    {"name": "night_suburb_bed", "fromBeat": IX["church"], "toBeat": IX["arrest"], "gain": -2, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": IX["lie"], "toBeat": IX["quote"], "gain": -4, "fade": 1.0},
    {"name": "heartbeat_slow_muffled", "fromBeat": IX["arrest"], "toBeat": IX["quote"], "gain": -7, "fade": 0.8},
    {"name": "courtroom_room_tone", "fromBeat": IX["court"], "toBeat": IX["court"], "gain": -1, "fade": 0.6}]
save(story, sys.argv[1] + "/en/btk_part5.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words", IX)
