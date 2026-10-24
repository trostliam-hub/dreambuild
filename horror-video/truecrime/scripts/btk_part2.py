# YOU ARE BTK – Teil 2 „Your Own Crime“ (Brief in en/BTK_BRIEF.md, Skript tc_scripts/A_part2.json)
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from tc_common import *

CAP = {"captionY": 1500, "capBox": True}
X = "xxxx xxxxx xx xxxx xxx xxxxx xx xxx xxxxxxx xxxx"          # Fülltext unter Schwärzungsbalken (nie lesbar)
def red_lines(n, at=-9):
    """n geschwärzte Brief-Zeilen (von Beginn an sichtbar)."""
    return [{"text": X[: 30 + (i * 7) % 18], "at": at, "dur": 0.1} for i in range(n)]
def redact_all(idx, at=-8):
    return [{"line": i, "from": 0, "at": at} for i in idx]
NAMEBAR = "████████ █████"                                         # geschwärzter Name (bis Teil 5)

B = []
# 0: Der B.T.K.-Brief aus Teil 1 – wer wird ihn lesen?
B.append({"scene": "letter", "clock": "OCT 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.07], "focus": [540, 900],
    "p": {"style": "typewriter", "paper": "old", "hl": ["B.T.K."], "y": 885,
          "lines": red_lines(4) + [{"text": "B.T.K.", "at": "@name", "dur": 0.45, "red": True, "size": 120}],
          "redact": redact_all(range(4))},
    "pops": [{"text": "WHO WILL READ IT?", "at": "@read", "x": 540, "y": 1290, "size": 96, "dur": 9, "rot": -0.04}],
    "lines": [L("You have a name now.", emph=["name"]), L("You just need someone to read it.", emph=["read"])], "post": 0.45,
    "sfx": [{"name": "paper_rustle", "at": 0.05, "gain": -8},
            {"name": "typewriter_key", "at": "@name", "gain": -6}, {"name": "typewriter_key", "at": "@name+0.15", "gain": -7},
            {"name": "typewriter_key", "at": "@name+0.3", "gain": -6},
            {"name": "whoosh_dark", "at": "@read-0.35", "gain": -10}]})
# 1: Anruf bei der Zeitung – sie sollen in der Bibliothek suchen
B.append({"scene": "city_map", "clock": "OCT 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 900],
    "p": {"title": "WICHITA", "sub": "A CALL TO THE PAPER", "coords": "37.69° N · 97.34° W",
          "pins": [{"x": 0.3, "y": 0.36, "at": "@eagle", "label": "THE NEWSPAPER", "red": False},
                   {"x": 0.52, "y": 0.66, "at": "@where", "label": "PUBLIC LIBRARY", "red": True}],
          "lines": [{"from": 0, "to": 1, "at": "@where+0.25"}],
          "ring": {"x": 0.52, "y": 0.66, "r0": 0.5, "r1": 0.13, "t0": "@exactly", "t1": "@look+0.6"}},
    "lines": [L("You phone the Wichita Eagle and tell them exactly where to look.", emph=["exactly"])], "post": 0.4,
    "sfx": [{"name": "phone_pickup", "at": 0.0, "gain": -6}, {"name": "phone_rotary_dial", "at": 0.35, "gain": -11}]})
# 2: der Brief im Ingenieur-Lehrbuch
B.append({"scene": "library_stacks", "clock": "OCT 1974", "place": "WICHITA PUBLIC LIBRARY", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [540, 900],
    "p": {"target": {"shelf": 3, "x": 560, "at": "@inside"}, "torch": {"t0": 0.15, "t1": "@tucked+0.1"},
          "text": {"s": "OCTOBER 1974", "at": 0.25}, "label": {"s": "ENGINEERING TEXTBOOK", "at": "@engineering"}},
    "lines": [L("Your letter is tucked inside an engineering textbook at the Wichita Public Library.", emph=["engineering"])], "post": 0.35,
    "sfx": [{"name": "footsteps_approach", "at": 0.0, "gain": -16, "dur": 1.6}, {"name": "paper_rustle", "at": "@tucked", "gain": -6}]})
# 3: „Monster“ – doch jede Entscheidung ist deine
B.append({"scene": "letter", "clock": "OCT 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.1], "focus": [540, 820],
    "p": {"style": "typewriter", "paper": "old", "hl": ["MONSTER"], "y": 885, "focusLine": 2, "focusAt": "@monster",
          "lines": red_lines(2) + [{"text": "xxxxx monster xxxxx", "at": -9, "dur": 0.1, "size": 64}] + red_lines(2),
          "redact": redact_all([0, 1, 3, 4]) + [{"line": 2, "from": 0, "to": 5, "at": -8}, {"line": 2, "from": 14, "at": -8}],
          "stamp": {"text": "YOUR CHOICE", "at": "@yours+0.1", "x": 0, "y": 230, "rot": -0.09, "w": 600}},
    "lines": [L("In it, you claim a monster entered your brain.", emph=["monster"], gap=0.3), L("Yet every choice is yours.", emph=["choice", "yours"])], "post": 0.85,
    "shakeAt": [{"at": "@yours+0.13", "d": 0.25, "a": 10}],
    # Herzschlag in die Pause nach „brain.“ (nicht mehr auf „entered“).
    # Stempel-Sound auf den sichtbaren Aufprall (Stempel at + 0.13 s), also hinter „yours.“ – bei +0.1 lag er 4 dB über dem Wort
    "sfx": [{"name": "heartbeat_single", "at": "@brain+0.3", "gain": -6}, {"name": "rubber_stamp", "at": "@yours+0.2", "gain": -3}]})
# 4: Die Polizei bittet um Schweigen – die Zeitung hält still
B.append({"scene": "newspaper", "clock": "OCT 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.02], "focus": [540, 900],
    "p": {"style": "1970s", "masthead": "THE DAILY EDITION", "date": "OCTOBER 1974", "headline": " ", "photo": "none", "hl": []},
    # Pops liegen 60 px tiefer als angegeben (HUD-Versatz) – hier genau in der leeren Schlagzeilen-Zeile
    # Stempel in die Pause nach „agrees.“ (nicht auf das Wort)
    "pops": [{"text": "WITHHELD", "at": "@agrees+0.4", "x": 540, "y": 526, "size": 104, "dur": 9, "rot": -0.02},
             {"text": "AT POLICE REQUEST", "at": "@agrees+0.7", "x": 540, "y": 594, "size": 38, "dur": 9, "rot": -0.02}],
    "lines": [L("Police ask the paper to keep it quiet, and the paper agrees.", emph=["quiet"], gap=0.45),
              L("The story you wanted doesn't run.", emph=["doesnt"])], "post": 0.3,
    "shakeAt": [{"at": "@agrees+0.4", "d": 0.3, "a": 14}],
    "sfx": [{"name": "whoosh", "at": 0.0, "gain": -9}, {"name": "rubber_stamp", "at": "@agrees+0.4", "gain": -3}]})
# 5: Alarmanlagen-Monteur, Nov 1974 – Jul 1988
B.append({"scene": "id_badge", "clock": "NOV 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.1], "focus": [540, 850],
    "p": {"kind": "card", "org": "HOME SECURITY ALARM SERVICE", "title": "SECURITY ALARM INSTALLER", "name": NAMEBAR, "idno": " ",
          # Daten-Stempel früher (nach „alarms,“), damit er während „a job you keep for almost fourteen years“ steht
          "at": 0.15, "stamp": {"text": "NOV 1974 – JUL 1988", "at": "@alarms+0.4", "x": 150, "y": 150, "rot": -0.1, "w": 470}},
    "lines": [L("That November, you start installing home security alarms, a job you keep for almost fourteen years.", emph=["alarms"])], "post": 0.5,
    "shakeAt": [{"at": "@alarms+0.43", "d": 0.25, "a": 10}],
    "sfx": [{"name": "whoosh_dark", "at": 0.1, "gain": -9}, {"name": "keys_jingle", "at": 0.6, "gain": -10},
            {"name": "rubber_stamp", "at": "@alarms+0.4", "gain": -7}]})
# 6: Doppelleben – Familien vertrauen dir
B.append({"scene": "double_life", "clock": "NOV 1974", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 900],
    # "office" statt "uniform": die Uniform wirkt wie Polizei (Mythos „er war Polizist“)
    "p": {"left": "office", "right": "house", "split": 0.25, "labels": {"l": "ALARM INSTALLER", "r": "THE KILLER", "at": 0.8}, "swap": "@like"},
    "lines": [L("Families trust you to keep people like you out.", emph=["trust", "you"])], "post": 0.85,
    # sub_pulse leiser: sein 2. Puls (+1.0 s) lag mit 4.8 dB Abstand unter „people“
    # Rauschen und Whoosh je 5 dB leiser: lagen auf „people like you out“ fast so laut wie die Stimme
    "sfx": [{"name": "sub_pulse", "at": 0.25, "gain": -12}, {"name": "tv_static_burst", "at": "@like", "gain": -19},
            {"name": "whoosh_dark", "at": "@like-0.1", "gain": -18}]})
# 7: 17. März 1977 – Shirley Vian
B.append({"scene": "title_card", "clock": "MAR 1977", **CAP, "trans": "glitch", "zoom": [1.0, 1.06], "focus": [540, 820],
    # Opfername ruhig in Grau (Ortszeile der Titelkarte), kein roter Pop; gleiche Form wie Nancy Fox in B9
    "p": {"date": "MARCH 17, 1977", "place": "SHIRLEY VIAN", "red": ["1977"], "bg": "map", "at": 0.15, "speed": 7, "size": 96},
    "lines": [L("On March seventeenth, nineteen seventy-seven, you take the life of Shirley Vian.", emph=["life"])], "post": 0.55,
    "sfx": [{"name": "typewriter_burst", "at": 0.1, "gain": -11}, {"name": "low_piano_hit", "at": "@vian+0.5", "gain": -10}]})
# 8: Ihre Kinder überleben
B.append({"scene": "house_ext", "clock": "MAR 1977", **CAP, "trans": "cut", "zoom": [1.0, 1.04], "focus": [540, 1000],
    "p": {"style": "ranch", "windows": [{"i": 0, "dim": 0.75}], "porch": False, "dolly": [0, 4, 1.06]},
    "pops": [{"text": "HER CHILDREN SURVIVED", "at": "@survive", "x": 540, "y": 1330, "size": 82, "dur": 9, "rot": -0.03}],
    "lines": [L("Her young children are in the house, and they survive.", emph=["survive"])], "post": 0.6})
# 9: Dezember 1977 – Nancy Fox, 25
# Titelkarte wie B7: Opfername ruhig in Grau (Ortszeile), kein roter Pop
B.append({"scene": "title_card", "clock": "DEC 1977", **CAP, "trans": "cut", "zoom": [1.0, 1.04], "focus": [540, 820],
    "p": {"date": "DECEMBER 8, 1977", "place": "NANCY FOX, 25", "red": ["1977"], "bg": "black", "at": 0.2, "speed": 16, "size": 80},   # Datum bleibt innerhalb x 930
    "lines": [L("That December, you kill Nancy Fox, twenty-five, in her home.", emph=["home"])], "post": 0.55,   # +0.3 als "pre" in B10
    # hit_deep 5 dB leiser: sein Nachhall lag unter „And this time“ (B10) lauter als Herzschlag-Bett und sub_pulse
    "sfx": [{"name": "hit_deep", "at": "@home+0.4", "gain": -14}]})
# 10: Diesmal wartest du nicht
B.append({"scene": "profile_silhouette", "clock": "DEC 1977", "clockRed": True, **CAP, "trans": "glitch", "zoom": [1.0, 1.1], "focus": [600, 760],
    "p": {"glow": "none", "paper": False, "glasses": True, "eyeLine": "@dont", "glitch": ["@find"]},
    # Herzschlag bei 0.05 fällt so in die Stille vor „And“
    "lines": [L("And this time, you don't wait for anyone to find her.", emph=["dont", "wait"])], "pre": 0.3, "post": 0.5,
    # sub_pulse 4 dB leiser (Herzschlag-Bett ebenso, siehe beds), damit „And this time“ frei liegt
    "sfx": [{"name": "heartbeat_single", "at": 0.05, "gain": -5}, {"name": "sub_pulse", "at": "@dont", "gain": -13},
            {"name": "tv_static_burst", "at": "@find", "gain": -16}]})
# 11: Telefonzelle in der Innenstadt
B.append({"scene": "phone_booth", "clock": "DEC 1977", "place": "DOWNTOWN WICHITA", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [540, 860],
    "p": {"figure": {"at": "@booth", "hat": "brim"}, "receiver": "@call"},
    "lines": [L("You go to a phone booth downtown, and you call the police yourself.", emph=["police", "yourself"])], "post": 0.2,
    "sfx": [{"name": "car_door", "at": 0.05, "gain": -12}, {"name": "phone_pickup", "at": "@call+0.45", "gain": -6},
            {"name": "phone_rotary_dial", "at": "@police", "gain": -12}]})
# 12: Adresse und Name
B.append({"scene": "phone_booth", "clock": "DEC 1977", "place": "DOWNTOWN WICHITA", **CAP, "trans": "cut", "zoom": [1.12, 1.26], "focus": [470, 780],
    "p": {"figure": {"hold": True, "hat": "brim"}},
    "pops": [{"text": "POLICE DISPATCH", "at": "@dispatcher", "x": 540, "y": 1250, "size": 92, "dur": 9, "rot": -0.02},
             {"text": "DECEMBER 1977", "at": "@dispatcher+0.3", "x": 540, "y": 1345, "size": 58, "dur": 9, "rot": -0.02}],
    "lines": [L("You give the dispatcher an address and a name.", emph=["address", "name"])], "post": 0.2,
    "sfx": [{"name": "police_radio", "at": 0.0, "gain": -14}]})
# 13: Du meldest dein eigenes Verbrechen (Quelle des Cold Opens)
# Cover: TikTok nimmt Frame 0 (= Cold-Open-Start) als Titelbild. Daher harter Schnitt statt Glitch, die vier Zeilen
# knallen in der 0.35-s-Pause vor „You“ herein (fertig bei 0.35 s) und der Cold Open beginnt erst kurz vor „You“.
B.append({"scene": "sfx_text", "clock": "DEC 1977", "clockRed": True, "place": "DOWNTOWN WICHITA", "noCaptions": True, "trans": "cut",
    "zoom": [1.0, 1.08], "focus": [540, 800], "vignette": 0.9,
    "p": {"lines": ["YOU ARE", "REPORTING", "YOUR OWN", "CRIME."], "times": [0.0, 0.05, 0.1, 0.15], "y": 560, "size": 175,
          "bg": "phone_booth", "bgP": {"figure": {"hold": True, "hat": "brim"}}},
    "lines": [L("You are reporting your own crime.", emph=["own", "crime"])], "pre": 0.35, "post": 0.7,
    "punch": ["@crime"], "shakeAt": [{"at": "@crime", "d": 0.4, "a": 12}],
    "sfx": [{"name": "sub_pulse", "at": "@reporting", "gain": -8}, {"name": "hit_deep", "at": "@crime+0.45", "gain": -6}]})
# 14: Jedes Wort wird aufgezeichnet
# Fokus höher (590 statt 770), damit das PHONE-Schild nicht unter den HUD rutscht
B.append({"scene": "phone_booth", "clock": "DEC 1977", "place": "DOWNTOWN WICHITA", **CAP, "trans": "cut", "zoom": [1.42, 1.58], "focus": [490, 590],
    "p": {"figure": {"hold": True, "hat": "brim"}},
    "pops": [{"text": "● REC", "at": "@recorded", "x": 740, "y": 470, "size": 76, "dur": 0.5, "rot": 0},
             {"text": "● REC", "at": "@recorded+0.75", "x": 740, "y": 470, "size": 76, "dur": 0.5, "rot": 0},
             {"text": "● REC", "at": "@recorded+1.5", "x": 740, "y": 470, "size": 76, "dur": 9, "rot": 0}],
    "lines": [L("And every word is being recorded.", emph=["recorded"])], "post": 0.9,
    "flash": [{"at": "@recorded", "d": 0.18, "c": "#ff2020", "a": 0.35}],
    "sfx": [{"name": "police_radio", "at": "@recorded+0.5", "gain": -9}, {"name": "riser_short", "fromEnd": 2.0, "gain": -12}]})
# 15: Endkarte
B.append({"scene": "end_card", "clock": "DEC 1977", **CAP, "noCaptions": False, "trans": "cut", "zoom": [1.0, 1.0],
    "p": {"title": "YOU ARE BTK", "kicker": "PART 2 OF 5", "pill": "FOLLOW FOR PART 3", "sub": "SHOULD THE PAPER HAVE KEPT QUIET?|TELL ME IN THE COMMENTS"},
    "lines": [L("Follow for part three.", emph=["three"])], "post": 0.9,
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -9}]})

story = base("YOU ARE BTK", 2, "WICHITA, KANSAS", "FOLLOW FOR PART 3", "PART 3")
story["beats"] = B
story["coldOpen"] = {"beat": 13, "words": "You are reporting your own crime.", "label": "LATER", "lead": 0.03}
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "newsroom_bed", "fromBeat": 1, "toBeat": 4, "gain": -5, "fade": 0.6},
    {"name": "clock_tick_bed", "fromBeat": 5, "toBeat": 6, "gain": -8, "fade": 0.5},
    {"name": "night_suburb_bed", "fromBeat": 7, "toBeat": 10, "gain": -2, "fade": 0.8},
    {"name": "dark_pad_tension", "fromBeat": 7, "toBeat": 14, "gain": -4, "fade": 1.0},
    {"name": "heartbeat_slow_muffled", "fromBeat": 10, "toBeat": 13, "gain": -13, "fade": 0.6},
    {"name": "rain_bed", "fromBeat": 11, "toBeat": 14, "gain": -2, "fade": 0.6}]
save(story, sys.argv[1] + "/en/btk_part2.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words")
