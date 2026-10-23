# DON'T WAKE HER – Part 3 "Ten Minutes"
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from dwh_common import *

APP = "HALE CAMS • LIVE"
CHAT_MRS = {"name": "Mrs. Hale", "initials": "DH", "avatarColor": "#5a1316", "headerSub": "Active now", "headerDot": True}
CHAT_MR = {"name": "Mr. Hale", "initials": "MH", "avatarColor": "#2a2a40"}
MR_MSG = "Hallway cam caught you at eleven fifty. Then motion at eleven fifty-one. Too dark to see."
HALF = {"door": 0.6, "doorStyle": "closet"}
CRACK = {"door": 0.08, "doorStyle": "closet"}
MR_TXT = "Hallway cam caught you at 11:50. Then motion at 11:51. Too dark to see."  # so steht es in der Nachricht
def bed_mon(stamp, **k): return {"monitorOnStand": True, "monitorStamp": stamp, **k}

B = []
# 0: Gestalt steht aufgefaltet neben dem Schrank
B.append(monitor("12:00 AM", "11:50 PM", [L("Something tall unfolded from the nursery closet."), L("And it went looking for you.", emph=["you"])],
    figure={"kind": "shape", "pose": "shush", "x": 0.3, "y": 0.86, "h": 0.82, "eyes": -5, "turn": -5},
    p={**HALF, "feedZoom": [1.0, 1.15], "feedFocus": [0.35, 0.45]}, trans="cut", post=0.3,
    sfx=[{"name": "sub_pulse", "at": 0.0, "gain": -4}, {"name": "heartbeat_slow_muffled", "at": "@looking", "gain": 2, "dur": 1.6}]))
# 1: Zurückspulen – du winkst
B.append(monitor("12:00 AM", "11:49 PM", [L("Rewind."), L("Your hoodie."), L("Your wave."), L("That's you, waving at her app.", emph=["you", "app"])],
    figure={"kind": "you", "pose": "wave", "waveAt": "@wave", "waveDur": 1.4, "x": 0.7, "y": 0.86, "h": 0.42, "at": 0.7},
    p={**CRACK, "rewind": [0.0, 0.7], "gapEyes": [0.0, 99]}, trans="cut",
    sfx=[{"name": "whoosh_reverse", "at": 0.0, "gain": -6}, {"name": "static_burst", "at": 0.65, "gain": -12}]))
# 2: Standbild – Augen im Spalt, roter Ring
B.append(monitor("12:00 AM", "11:49 PM", [L("And in the closet gap,"), L("two red eyes were already watching.", emph=["already"])],
    figure={"kind": "you", "pose": "stand", "x": 0.7, "y": 0.86, "h": 0.42},
    p={**CRACK, "gapEyes": [0.0, 99], "gapRing": "@two", "gapEyesBright": "@two", "feedZoom": [1.0, 1.4], "feedFocus": [0.14, 0.4]}, trans="cut", post=0.5,
    sfx=[{"name": "impact_hit_short", "at": "@two", "gain": -7}]))
# 3: Kühlschrank-Zettel, Uhr-Ringe, durchgestrichen
B.append({"scene": "fridge_note", "clock": "12:00 AM", "zoom": [1.0, 1.08], "focus": [540, 760], "captionY": 1460, "capBox": True, "trans": "cut",
    "hudRing": 0.3,
    "pops": [{"text": "-10 MIN", "at": "@ten", "x": 700, "y": 1080, "size": 120, "dur": 3.0, "rot": -0.12}],
    "p": {"title": "Hi babysitter!", "lines": [
        {"text": "Wren down by eight ♥", "at": -5},
        {"text": "Old monitor. Clock's wrong. Just ignore it!", "at": -5, "row": 1, "strike": "@never"},
        {"text": "Cameras on my phone. Text anytime! – Dana", "at": -5, "row": 3}]},
    "lines": [L("The fridge note said:"), L("Clock's wrong.", voice="mrs_hale", emph=["wrong"]), L("It never was.", emph=["never"]),
              L("The picture runs ten minutes late.", emph=["ten", "late"])],
    "sfx": [{"name": "light_click", "at": 0.05, "gain": 0}, {"name": "low_piano_hit", "at": "@ten", "gain": -6}]})
# 4: Vergleich
B.append({"scene": "choice_split", "clock": "12:00 AM", "captionY": 1500, "capBox": True,
    "p": {"optA": "LIVE", "optB": "10 MIN LATE", "title": "Nobody lied", "kicker": "SAME CAMERA · TEN MINUTES APART", "a": "Her app|11:42", "b": "Your monitor|11:32", "iconA": "feed_empty", "iconB": "feed_shape"},
    "lines": [L("When Mrs. Hale checked her app, it was already hiding.", say="When Missus Hale checked her app, it was already hiding.", emph=["hiding"]),
              L("Nobody lied.", emph=["lied"])],
    "sfx": [{"name": "whoosh", "at": 0.0, "gain": -8}]})
# 5: sie folgt dir hinaus
B.append(monitor("12:01 AM", "11:51 PM", [L("On the monitor, it ducks low and glides out the door after you.", emph=["after"])],
    figure={"kind": "shape", "pose": "hunch", "x": 0.3, "y": 0.86, "h": 0.8, "eyes": -5, "turn": -5, "move": ["@ducks", "@after+0.4", 0.95], "until": "@after+0.5"},
    p={**HALF, "entrySwing": ["@glides", "@glides+0.6", 0.08, 0.6]},
    trans="cut", post=0.4,
    sfx=[{"name": "tension_riser_4s", "at": 0.0, "gain": -15}]))
# 6: Mr. Hales Nachricht
B.append({"scene": "phone_chat", "clock": "12:01 AM", "captionY": 1490, "capBox": True, "zoom": [1.0, 1.06], "focus": [540, 900], "trans": "cut",
    "p": {**CHAT_MR, "messages": [{"kind": "stamp", "text": "11:53 PM", "at": -1},
        {"side": "in", "text": MR_TXT, "at": -1, "red": True},
        {"side": "in", "kind": "photo", "photo": {"kind": "hall_dark", "stamp": "11:51 PM", "ring": True}, "at": -1}]},
    "lines": [L("Eleven fifty-one."), L("Mr. Hale's hallway cam.", say="Mister Hale's hallway cam."), L("Too dark to see.", voice="mr_hale", emph=["dark"])]})
# 7
B.append({"scene": "phone_lock", "clock": "12:01 AM", "zoom": [1.0, 1.12], "focus": [540, 760], "trans": "cut",
    "p": {"time": "12:01", "date": "Saturday, October 24", "notifs": [{"sender": "Mr. Hale", "text": "Getting Dana.", "at": -1},
                                                                     {"sender": "Mrs. Hale", "text": "sent a photo", "at": "@your"}], "buzz": ["@your"]},
    "lines": [L("Your phone buzzes."), L("Mrs. Hale is finally watching.", say="Missus Hale is finally watching.", emph=["watching"])],
    "sfx": [{"name": "phone_vibrate", "at": "@your", "gain": -2}, {"name": "camera_shutter", "at": "@finally", "gain": -2}]})
# 8: Live-Screenshot: die Gestalt hinter dir
B.append({"scene": "cctv_grid", "clock": "12:01 AM", "zoom": [1.0, 1.03], "focus": [540, 960], "captionY": 1515, "capBox": True,
    "p": {"stamp": "12:01 AM", "title": APP, "live": True, "clean": True, "focus": {"feed": 3, "at": "@there", "dur": 0.7},
          "feeds": [{"room": "nursery", "label": "NURSERY", **HALF}, {"room": "corridor", "label": "HALL"}, {"room": "stairs", "label": "STAIRS"},
                    {"room": "guest", "label": "GUEST RM", "alert": "@over",
                     "figures": [{"kind": "shape", "pose": "shush", "fromPose": "hunch", "poseAt": "@finger", "poseDur": 0.9, "x": 0.5, "y": 0.86, "h": 0.86, "eyes": "@over", "flip": True, "at": -1},
                                 {"kind": "you", "pose": "sit", "x": 0.3, "y": 0.78, "h": 0.38}]}]},
    "lines": [L("There you are, on the bed."), L("And over your shoulder, the thing from the nursery.", emph=["shoulder"]), L("Finger to its face.", emph=["Finger"])],
    "post": 0.3, "sfx": [{"name": "stinger_violin_screech", "at": "@over", "gain": -9}], "glitch": [{"at": "@over", "d": 0.12}]})
# 9
B.append({"scene": "phone_chat", "clock": "12:01 AM", "captionY": 1490, "capBox": True, "zoom": [1.0, 1.1], "focus": [540, 1000], "trans": "cut",
    "p": {**CHAT_MRS, "messages": [{"side": "in", "text": "Cute! Last dance!", "at": -1},
        {"side": "in", "kind": "photo", "photo": {"kind": "grid4", "stamp": "12:01 AM", "shapeGuest": True}, "at": -1},
        {"side": "in", "text": "Don't move.", "at": "@dont-0.1", "typing": 0.1, "red": True}]},
    "lines": [L("She types:"), L("Don't move.", voice="mrs_hale", speed=0.85, emph=["move"])], "post": 0.4,
    "sfx": [{"name": "phone_ping", "at": "@dont-0.1", "gain": -2}]})
# 10
B.append({"scene": "bedroom", "clock": "12:01 AM", "zoom": [1.05, 1.18], "focus": [420, 820], "trans": "cut",
    "p": {"pose": "sitting", "hood": True, "roomCam": True, **bed_mon("11:51 PM", monitorDoor=0.6), "tremble": True,
          "shapeBehind": {"at": -1, "alpha": 1.0, "x": 430, "y": 1300, "h": 1000, "eyes": "@something", "pose": "hunch"}},
    "lines": [L("You don't move."), L("Something breathes against your ear.", emph=["ear"])],
    "sfx": [{"name": "breath_whisper", "at": "@breathes", "gain": -4}]})
# 11
B.append({"scene": "sfx_text", "clock": "12:01 AM", "captionY": 1460, "capBox": True, "trans": "cut", "vignette": 0.95,
    "p": {"lines": ["SHHH."], "times": ["@shhh"], "xs": [700], "y": 900, "size": 260, "bg": "bedroom",
          "bgP": {"pose": "sitting", "hood": True, "tremble": True, "roomCam": True, **bed_mon("11:51 PM", monitorDoor=0.6),
                  "shapeBehind": {"at": -1, "alpha": 1.0, "x": 430, "y": 1300, "h": 1000, "eyes": -1, "pose": "hunch"}}},
    "lines": [L("Shhh. You'll wake her.", voice="shape", emph=["wake"])], "post": 0.5})
# 12: es geht hinaus und die Treppe hoch
B.append({"scene": "hallway", "clock": "12:02 AM", "zoom": [1.0, 1.05], "trans": "cut", "captionY": 1060, "capBox": True,
    "p": {"noLamp": True, "youBack": True, "figure": {"kind": "shape", "pose": "walk", "h0": 1250, "h1": 300, "y0": 1950, "y1": 1025, "at": -1}, "approach": [0.2, 3.6]},
    "pops": [{"text": "step…", "at": "@slow", "x": 700, "y": 900, "size": 44, "dur": 1.0}, {"text": "step…", "at": "@slow+1.2", "x": 380, "y": 860, "size": 40, "dur": 1.0}],
    "lines": [L("It steps past you, out the door."), L("Slow footsteps, up the stairs.", emph=["up"])],
    "sfx": [{"name": "footsteps_approach", "at": 0.3, "gain": -8, "dur": 3.5}]})
# 13: Decke knarrt
B.append({"scene": "bedroom", "clock": "12:02 AM", "pan": [0, 0, 0, 430], "zoom": [1.0, 1.0], "trans": "cut", "captionY": 1500, "capBox": True,
    "p": {"pose": "sitting", "listen": True, "hood": True, "roomCam": True, **bed_mon("11:52 PM", monitorDoor=0.6), "ceilingCrib": 0.1, "ceilingLabel": "WREN'S ROOM"},
    "pops": [{"text": "CREAK", "at": "@creaks", "x": 540, "y": 640, "size": 70, "dur": 1.2}],
    "lines": [L("Above you, in Wren's room, the floor creaks.", emph=["creaks"])], "post": 0.4,
    "sfx": [{"name": "door_creak", "at": "@creaks", "gain": -4, "dur": 1.4}]})
# 14: ruhiges Kinderzimmer – noch zehn Minuten
B.append(monitor("12:02 AM", "11:52 PM", [L("Your monitor still shows a quiet nursery."), L("For ten more minutes.", emph=["ten"])],
    p={**HALF, "feedZoom": [1.0, 1.12], "feedFocus": [0.45, 0.55], "stampRing": "@ten"}, trans="cut", post=0.7,
    sfx=[{"name": "heartbeat_slow_muffled", "at": "@for", "gain": 2, "dur": 2.0}]))
# 15
B.append({"scene": "rule_card", "clock": "12:03 AM", "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"label": "REWATCH PART 1", "text": "-10 MIN", "hl": ["-10"], "sub": "CLOCK 11:40  /  MONITOR 11:30"},
    "lines": [L("When did you catch the ten minutes?", emph=["ten"]), L("Tell me in the comments.")],
    "sfx": [{"name": "impact_boom", "at": 0.0, "gain": -7}]})
# 16
B.append({"scene": "end_card", "clock": "12:03 AM", "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"title": "DON'T WAKE HER", "kicker": "PART 3", "time": "12:03 AM", "pill": "FOLLOW FOR PART 4", "sub": "WHEN DID YOU CATCH IT?|TELL ME IN THE COMMENTS"},
    "lines": [L("Follow for part four.", emph=["four"]), L("Shhh.", voice="shape")], "post": 1.0,
    "endShape": {"at": 0.3, "eyes": 0.3, "turn": 0.6, "finger": "@shhh-0.3"},
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -8}, {"name": "breath_whisper", "at": "@shhh-0.4", "gain": -8}]})

story = base(3, "FOLLOW FOR PART 4")
story["tail"] = 1.6
story["beats"] = B
story["coldOpen"] = {"beat": 8, "words": "And over your shoulder, the thing", "label": "LATER"}  # Teaser vorneweg, harter Schnitt
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "house_ambience", "from": 0, "to": 200, "gain": 10, "fade": 0.5},
    {"name": "dark_pad_tension", "fromBeat": 0, "toBeat": 5, "gain": -3, "fade": 1.0},
    {"name": "whisper_texture", "fromBeat": 8, "toBeat": 12, "gain": -4, "fade": 0.8},
    {"name": "heartbeat_fast", "fromBeat": 8, "toBeat": 11, "gain": -8, "fade": 0.6},
    {"name": "music_box_slow_detuned", "fromBeat": 13, "toBeat": 16, "gain": 2, "fade": 1.0}]
save(story, sys.argv[1] + "/en/dwh_part3.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words")
