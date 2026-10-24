# YOU ARE BTK – Teil 3 "The Voice on the Tape"
# Erzähltext wörtlich aus tc_scripts/A_part3.json (faktengeprüft). Fakten für Einblendungen: tc_scripts/research_A.json.
import sys, os
sys.path.insert(0, sys.argv[1] + "/en")
from tc_common import *

S = sys.argv[1]
CAP = {"captionY": 1500, "capBox": True}

def pop(text, at, y=560, size=80, dur=30, rot=0.001, x=540):  # rot 0 würde in babysit.js zu -0.08
    """Rote Einblendung im Bildschirmraum (beat.pops, babysit.js) – bleibt bis Beat-Ende stehen."""
    return {"text": text, "at": at, "x": x, "y": y, "size": size, "dur": dur, "rot": rot}

# Platzhalterzeilen für Briefe/Gedicht: Inhalt wird nie gezeigt (Sicherheitsregel: kein Gedichttext)
XL = ["xxxxx xxxx xxxxxxx", "xxxxxxxx xx xxxxx", "xxx xxxxxx xxxx", "xxxxx xxxxxxx"]

# classified_ad (tc_extra_a) ist fertig (Modus "pile": Umschlag versinkt unter Anzeigenformularen, nie gedruckt).
# Die newspaper-Variante bleibt nur als Notlösung – sie suggeriert fälschlich, das Gedicht sei als Anzeige erschienen.
HAS_CLASSIFIED = True

B = []
# 0: Telefonzelle im Regen – die Stimme auf Band, aber kein Name
B.append({"scene": "phone_booth", "clock": "DEC 1977", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [540, 900],
    "p": {"figure": False, "rain": True, "street": "CENTRAL", "at": 0.05},
    "pops": [pop("NO NAME", "@name+0.35", y=880, size=150, rot=-0.07)],
    "lines": [L("Police now have your voice on tape.", emph=["voice", "tape"]), L("But a voice is not a name.", emph=["name"])], "post": 0.85,
    "punch": ["@name+0.35"], "shakeAt": [{"at": "@name+0.35", "d": 0.35, "a": 14}],
    "sfx": [{"name": "police_radio", "at": 0.05, "gain": -13}, {"name": "rubber_stamp", "at": "@name+0.33", "gain": -4}]})
# 1: das Gedicht über Shirley Vian geht an die Zeitung (Inhalt bleibt verborgen)
B.append({"scene": "letter", "clock": "JAN 1978", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 850],
    "p": {"style": "typewriter", "paper": "old", "envelope": True, "title": "", "lines": [{"text": t} for t in XL],
          # Schwärzung läuft mit dem Tippen mit: Balken-„at“ liegt vor dem Zeilenbeginn (Zeilen ab 1,8 s), damit deckt der Balken
          # jedes getippte Zeichen im selben Frame ab – die Platzhalter „xxxx“ sind nie lesbar
          "redact": [{"line": i, "at": 0.0} for i in range(4)],
          "stamp": {"text": "MAILED|JAN 31 1978", "at": "@newspaper+0.55"}},
    "lines": [L("Weeks later, you mail a poem about Shirley Vian to the newspaper.", emph=["poem"])],
    "post": 0.6,
    "sfx": [{"name": "paper_rustle", "at": 0.1, "gain": -6}, {"name": "typewriter_burst", "at": 1.8, "gain": -12},
            {"name": "rubber_stamp", "at": "@newspaper+0.55", "gain": -5}]})
# 2: falsch zugestellt – bei den Kleinanzeigen, tagelang unbemerkt
if HAS_CLASSIFIED:
    B.append({"scene": "classified_ad", "clock": "FEB 1978", **CAP, "trans": "cut", "zoom": [1.0, 1.06],
        "p": {"mode": "pile", "at": 0.2, "counter": {"from": 1, "to": 9, "t0": 0.6, "t1": "@days", "label": "DAYS"},
              "text": "UNNOTICED", "textAt": "@unnoticed"},
        "lines": [L("It's misrouted to the classified ads, and sits unnoticed for days.", emph=["unnoticed"])], "post": 0.5,
        "sfx": [{"name": "paper_rustle", "at": 0.1, "gain": -6}, {"name": "low_piano_hit", "at": "@days+0.45", "gain": -8}]})
else:
    B.append({"scene": "newspaper", "clock": "FEB 1978", **CAP, "trans": "cut", "zoom": [1.0, 1.05],
        "p": {"style": "1970s", "masthead": "The Daily Classifieds", "date": "FEBRUARY 1978", "headline": "PERSONALS · NOTICES · FOR SALE", "sub": "", "photo": "none", "hl": [],
              "classified": {"text": "xxxxx xxxx xxxxxxx xxx xxxxxxxx", "at": "@classified", "label": "CLASSIFIED ADS", "y": 900}},
        "pops": [pop("UNNOTICED", "@unnoticed", y=1290, size=110, rot=-0.05)],
        "lines": [L("It's misrouted to the classified ads, and sits unnoticed for days.", emph=["unnoticed"])], "post": 0.5,
        "sfx": [{"name": "paper_rustle", "at": 0.1, "gain": -6}, {"name": "low_piano_hit", "at": "@days+0.45", "gain": -8}]})
# 3: neuer Umschlag an den Fernsehsender
B.append({"scene": "letter", "clock": "FEB 1978", **CAP, "trans": "cut", "zoom": [1.0, 1.05], "focus": [540, 820],
    "p": {"style": "typewriter", "paper": "white", "tilt": 0.015,
          "lines": [{"text": "TO:", "at": 0.25, "dur": 0.3}, {"text": "KAKE-TV", "at": "@television-0.35", "dur": 0.45, "size": 120}, {"text": "WICHITA, KANSAS", "at": "@television+0.25", "dur": 0.6}],
          "stamp": {"text": "RECEIVED|FEB 1978", "at": "@instead+0.5"}},
    "punch": ["@television"],
    "lines": [L("Ignored, you write to a television station instead.", emph=["television"])], "post": 0.6,
    "sfx": [{"name": "typewriter_key", "at": 0.25, "gain": -5}, {"name": "typewriter_burst", "at": "@television-0.35", "gain": -10},
            {"name": "rubber_stamp", "at": "@instead+0.5", "gain": -5}]})
# 4: der Brief – nur NATIONAL ATTENTION wird lesbar
B.append({"scene": "letter", "clock": "FEB 1978", **CAP, "trans": "cut", "zoom": [1.0, 1.12], "focus": [540, 330], "vignette": 0.95,
    "p": {"style": "typewriter", "paper": "white",
          "lines": [{"text": XL[0], "at": 0.1, "dur": 0.5}, {"text": XL[1], "at": 0.5, "dur": 0.5}, {"text": XL[2], "at": 0.9, "dur": 0.6},
                    {"text": XL[3], "at": 1.4, "dur": 0.5}, {"text": "NATIONAL ATTENTION", "at": "@national", "dur": 0.7, "red": True}, {"text": XL[1], "at": "@attention+0.4", "dur": 0.5}],
          # Balken-„at“ ≥ 0,4 s vor Zeilenbeginn: Schwärzung folgt dem Tippen, Platzhalter nie lesbar
          "redact": [{"line": 0, "at": -0.5}, {"line": 1, "at": -0.5}, {"line": 2, "at": -0.5}, {"line": 3, "at": -0.5}, {"line": 5, "at": "@attention"}],
          "hl": ["NATIONAL", "ATTENTION"], "focusLine": 4, "focusAt": "@national"},
    "lines": [L("You ask how many you have to kill before you get some national attention.", emph=["kill", "national", "attention"])], "post": 0.7,
    "sfx": [{"name": "typewriter_burst", "at": 0.1, "gain": -11}, {"name": "typewriter_burst", "at": "@national", "gain": -12},
            {"name": "stinger_reveal", "at": "@attention+0.55", "gain": -9}]})
# 5: Fernsehen: Polizeichef – Serienmörder auf freiem Fuß; Kamera fährt zurück zum Zuschauer im Sessel
B.append({"scene": "tv_news", "clock": "FEB 1978", **CAP, "trans": "cut", "zoom": [1.12, 1.0], "focus": [540, 790],
    "p": {"era": "1970s", "room": True, "station": "TV 10", "headline": "POLICE: SERIAL KILLER AT LARGE", "sub": "POLICE CHIEF ADDRESSES WICHITA",
          "image": "silhouette", "insetLabel": "UNIDENTIFIED", "ticker": "WICHITA  ·  SERIAL KILLER AT LARGE  ·  POLICE NEWS CONFERENCE  ·", "at": "@serial-0.3", "viewer": True},
    "lines": [L("Now the police chief tells Wichita a serial killer is loose.", emph=["serial", "killer"]), L("You have your audience.", emph=["audience"])],
    "post": 0.6, "punch": ["@audience"],
    "sfx": [{"name": "crt_on", "at": 0.0, "gain": -6}, {"name": "hit_deep", "at": "@audience+0.55", "gain": -7}]})
# 6: Anna Williams – du wartest, sie kommt spät, du gehst; sie überlebt
B.append({"scene": "house_ext", "clock": "APR 1979", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [560, 1000],
    "p": {"style": "suburb", "windows": [], "porch": False,  # kein Auto: sie kommt erst spät (nicht „jemand kommt an“)
          "figure": {"x": 0.98, "at": "@returns-0.25", "move": ["@returns-0.25", "@returns+1.3", 0.56], "h": 0.115, "y": 0.665}},  # Anna kommt erst nach „you leave“
    # Würde: Opfernamen nie als roter Pop – ruhig grau in der HUD-Zeile; sie wurde nie angegriffen -> „SPARED“, nicht „SURVIVED“
    "place": "ANNA WILLIAMS, 63",
    "pops": [pop("SHE WAS SPARED", "@returns+0.35", y=585, size=74, x=480)],
    "lines": [L("In nineteen seventy-nine, you wait inside the home of Anna Williams.", emph=["wait"]),
              L("She stays out late, and you leave before she returns.", emph=["leave", "returns"])], "post": 0.9,
    "sfx": [{"name": "keys_jingle", "at": "@returns+0.9", "gain": -9}]})
# 7: dein Anruf läuft in Radio und Fernsehen – niemand erkennt die Stimme
B.append({"scene": "tv_news", "clock": "1979", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 880],
    "p": {"era": "1970s", "room": False, "station": "TV 10", "headline": "DO YOU KNOW THIS VOICE?", "sub": "POLICE RELEASE RECORDING OF CALLER",
          "image": "silhouette", "insetLabel": "CALLER", "ticker": "IF YOU RECOGNIZE THIS VOICE CALL POLICE  ·  WICHITA  ·", "at": 0.2,
          "static": ["@nobody-0.35"]},
    "pops": [pop("NO MATCH", "@voice+0.48", y=1300, size=130, rot=-0.06)],
    "lines": [L("That same year, police play your phone call on radio and television.", emph=["radio", "television"], gap=0.22),
              L("Nobody recognizes your voice.", emph=["nobody"])], "post": 0.85,
    "shakeAt": [{"at": "@voice+0.48", "d": 0.3, "a": 12}],
    "sfx": [{"name": "radio_static_voice", "at": 0.15, "gain": -12}, {"name": "tv_static_burst", "at": "@nobody-0.35", "gain": -10},
            {"name": "rubber_stamp", "at": "@voice+0.46", "gain": -4}]})
# 8: Urteil des Erzählers
B.append({"scene": "sfx_text", "clock": "1979", **CAP, "trans": "glitch", "vignette": 0.95,
    "p": {"lines": ["LUCK,", "NOT", "BRAINS."], "times": ["@luck", "@not", "@brains"], "y": 600, "size": 175,
          "bg": "tv_news", "bgP": {"era": "1970s", "room": False, "headline": "", "ticker": "", "anchor": False, "image": "silhouette", "station": "TV 10", "static": [0, 1.0, 2.0, 2.9]}},
    "lines": [L("It's luck that saves you, not brains.", emph=["luck", "brains"])], "post": 0.9,
    "glitch": [{"at": "@brains+0.45", "d": 0.14}],
    "sfx": [{"name": "tv_static_burst", "at": 0.0, "gain": -9}, {"name": "hit_deep", "at": "@brains+0.45", "gain": -6}]})
# 9: Marine Hedge – in deiner eigenen Straße
# Beide Pins auf derselben Straße, wenige Häuser auseinander (Hedge wohnte ein paar Türen weiter), kein Fluss dazwischen
B.append({"scene": "city_map", "clock": "1985", "clockRed": True, "place": "PARK CITY, KANSAS", **CAP, "trans": "cut", "zoom": [1.0, 1.08], "focus": [690, 1000],
    "p": {"title": "PARK CITY", "sub": "KANSAS", "coords": "", "river": False,
          # Würde: Opfer-Pin ruhig weiß/grau, der rote Pin ist „du“
          "pins": [{"x": 0.685, "y": 0.47, "at": "@you", "label": "YOU", "red": True},
                   {"x": 0.69, "y": 0.58, "at": "@hedge", "label": "MARINE HEDGE, 53", "red": False}],
          "lines": [{"from": 0, "to": 1, "at": "@who"}],
          "ring": {"x": 0.69, "y": 0.50, "r0": 0.7, "r1": 0.17, "t0": "@lives", "t1": "@street+0.6", "label": "SAME STREET"}},
    "lines": [L("In nineteen eighty-five, you kill Marine Hedge, who lives on your own street.", emph=["own", "street"])], "post": 0.8,
    # Herzschlag in die Pause vor „you kill“, nicht mehr über den Namen
    "sfx": [{"name": "heartbeat_single", "at": "@you-0.25", "gain": -9}, {"name": "low_piano_hit", "at": "@street+0.5", "gain": -6}]})
# 10: Vicki Wegerle – die Polizei verdächtigt ihren Mann (Quelle des Cold Opens)
B.append({"scene": "house_ext", "clock": "1986", "clockRed": True, **CAP, "trans": "glitch", "zoom": [1.0, 1.08], "focus": [560, 1050],
    "p": {"style": "ranch", "windows": [], "porch": True, "car": {"x": 0.74, "headlights": False}, "dark": 0.15,
          # die Silhouette ist hier der Ehemann: erst ab „husband“, nicht schon bei „you kill“ (Silhouette = „du“ in der Serie)
          "figure": {"x": 0.4, "y": 0.665, "h": 0.13, "arms": "down", "at": "@husband-0.2"}, "police": "@police-0.5"},
    # Würde: Name nicht als roter Pop, sondern ruhig grau in der HUD-Zeile
    "place": "VICKI WEGERLE, 28",
    "pops": [pop("WRONG MAN", "@police-0.17", y=900, size=96, rot=-0.05, x=432)],  # schon im ersten Bild (Cover)
    "lines": [L("The next year, you kill Vicki Wegerle, twenty-eight.", say="The next year, you kill Vicki Wegger-lee, twenty-eight.", emph=["twentyeight"]),
              L("Police suspect her husband, not you.", emph=["husband", "not"])], "post": 0.7,
    "sfx": [{"name": "siren_wail", "at": "@police-0.6", "gain": -12, "dur": 4.0}, {"name": "police_radio", "at": "@husband+0.1", "gain": -14},
            {"name": "stinger_reveal", "at": "@you+0.4", "gain": -9}]})
# 11: Dolores Davis – der Zähler springt bis 1991
# Ort: Davis wohnte nahe Park City, nicht darin
B.append({"scene": "years_flip", "clock": "1991", "place": "SEDGWICK COUNTY, KANSAS", **CAP, "trans": "cut", "zoom": [1.0, 1.06], "focus": [540, 800],
    "p": {"from": 1986, "to": 1991, "t0": 0.15, "t1": "@ninetyone+0.15", "label": "DOLORES DAVIS, 62", "ticks": True},
    "lines": [L("In nineteen ninety-one, you take the life of Dolores Davis, sixty-two.", emph=["life"])], "post": 0.7,
    "sfx": [{"name": "low_piano_hit", "at": "@sixtytwo+0.6", "gain": -7}]})
# 12: Stille – 13 Jahre, und du kommst fast davon
B.append({"scene": "years_flip", "clock": "1991–2004", **CAP, "trans": "cut", "zoom": [1.04, 1.0], "focus": [540, 760], "vignette": 0.95,
    "p": {"from": 1991, "to": 2004, "t0": "@stops", "t1": "@almost-0.15", "label": "SILENCE", "sub": "NO KNOWN KILLINGS AFTER 1991", "ticks": True},
    "pops": [pop("ALMOST", "@almost", y=400, size=180, rot=-0.05)],
    "lines": [L("As far as anyone knows, the killing stops there.", emph=["stops"]), L("For thirteen years, you almost get away with it.", emph=["almost"])],
    "post": 1.0, "glitch": [{"at": "@almost+0.05", "d": 0.12}, {"at": "@it+0.5", "d": 0.16}], "flash": [{"at": "@almost", "d": 0.18, "c": "#ff2020", "a": 0.35}],
    "sfx": [{"name": "hit_deep", "at": "@it+0.5", "gain": -5}]})
# 13: Endkarte
B.append({"scene": "end_card", "clock": "1991–2004", **CAP, "trans": "cut", "zoom": [1.0, 1.0],
    "p": {"title": "YOU ARE BTK", "kicker": "PART 3 OF 5", "pill": "FOLLOW FOR PART 4", "sub": "WOULD YOU KNOW THE VOICE?|TELL ME IN THE COMMENTS"},
    "lines": [L("Follow for part four.", emph=["four"])], "post": 0.9,
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -9}]})

story = base("YOU ARE BTK", 3, "WICHITA, KANSAS", "FOLLOW FOR PART 4", "PART 4")
story["beats"] = B
# lead 0.03: Cold Open beginnt 30 ms vor „Police“ (Stimme setzt erst bei ≈ +0,04 s ein) -> Untertitel steht schon in Frame 0 (TikTok-Cover)
story["coldOpen"] = {"beat": 10, "words": "Police suspect her husband, not you.", "label": "LATER", "lead": 0.03}
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "rain_bed", "fromBeat": 0, "toBeat": 0, "gain": 0, "fade": 0.4},
    {"name": "newsroom_bed", "fromBeat": 1, "toBeat": 4, "gain": -3, "fade": 0.6},
    {"name": "crt_hum_bed", "fromBeat": 5, "toBeat": 5, "gain": -3, "fade": 0.4},
    {"name": "night_suburb_bed", "fromBeat": 6, "toBeat": 6, "gain": -1, "fade": 0.5},
    {"name": "crt_hum_bed", "fromBeat": 7, "toBeat": 8, "gain": -3, "fade": 0.4},
    {"name": "dark_pad_tension", "fromBeat": 9, "toBeat": 12, "gain": -3, "fade": 1.0},
    {"name": "night_suburb_bed", "fromBeat": 9, "toBeat": 10, "gain": -3, "fade": 0.5},
    {"name": "heartbeat_slow_muffled", "fromBeat": 10, "toBeat": 10, "gain": -6, "fade": 0.6},
    {"name": "clock_tick_bed", "fromBeat": 11, "toBeat": 12, "gain": -4, "fade": 0.6}]
save(story, S + "/en/btk_part3.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words, classified_ad:", HAS_CLASSIFIED)
