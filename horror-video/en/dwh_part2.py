# DON'T WAKE HER – Part 2 "Wave"
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from dwh_common import *

CRACK = {"door": 0.08, "doorStyle": "closet"}
APP = "HALE CAMS • LIVE"
CHAT_MRS = {"name": "Mrs. Hale", "initials": "DH", "avatarColor": "#5a1316", "headerSub": "Active now", "headerDot": True}
CHAT_MR = {"name": "Mr. Hale", "initials": "MH", "avatarColor": "#2a2a40"}
def app_nursery(stamp, figs, extra=None):
    f0 = {"room": "nursery", "label": "NURSERY", **CRACK, "figures": figs, **(extra or {})}
    return {"stamp": stamp, "title": APP, "live": True, "clean": True,
            "feeds": [f0, {"room": "corridor", "label": "HALL"}, {"room": "stairs", "label": "STAIRS"}, {"room": "guest", "label": "GUEST RM"}],
            "focus": {"feed": 0, "at": -1, "dur": 0.1}}
CREAKS = [0.35, 1.25, 2.15]
def bed_mon(stamp, **k): return {"monitorOnStand": True, "monitorStamp": stamp, "monitorCrack": True, **k}

B = []
# 0
B.append(monitor("11:46 PM", "11:36 PM", [L("It hid in the nursery closet, and only your monitor saw it.", emph=["closet", "only"])],
    p={**CRACK, "gapEyes": [0.0, 99], "gapEyesBright": 0.2, "feedZoom": [1.0, 1.35], "feedFocus": [0.13, 0.45]}, trans="cut", post=0.4,
    sfx=[{"name": "sub_pulse", "at": 0.0, "gain": -4}]))
# 1
B.append({"scene": "hallway", "clock": "11:47 PM", "zoom": [1.0, 1.08], "captionY": 1060, "capBox": True,
    "p": {"noLamp": True, "youBack": True},
    "pops": [{"text": "CREAK", "at": t, "x": 450 + i * 90, "y": 760 - i * 40, "size": 48, "dur": 0.7} for i, t in enumerate(CREAKS)],
    "lines": [L("Eleven forty-seven."), L("Upstairs, the hallway is pitch black.", emph=["black"])],
    "sfx": [{"name": "door_creak", "at": t, "gain": -12, "dur": 0.55} for t in CREAKS]})
# 2: ihre App, du betrittst das Kinderzimmer
B.append({"scene": "cctv_grid", "clock": "11:48 PM", "zoom": [1.0, 1.04], "focus": [540, 960], "captionY": 1515, "capBox": True,
    "p": app_nursery("11:48 PM", [{"kind": "you", "pose": "stand", "x": 0.95, "y": 0.86, "h": 0.42, "at": 0.6, "move": [0.6, 2.0, 0.7]}],
                     {"entrySwing": [0.15, 1.0, 0.0, 0.6], "gapEyes": [0, 99]}),
    "lines": [L("You push the nursery door open."), L("Wren, asleep."), L("Nobody else.", emph=["Nobody"])],
    "sfx": [{"name": "door_creak", "at": 0.15, "gain": -6}]})
# 3
B.append({"scene": "cctv_grid", "clock": "11:48 PM", "zoom": [1.0, 1.06], "focus": [200, 900], "captionY": 1530, "capBox": True, "trans": "cut",
    "p": app_nursery("11:48 PM", [{"kind": "you", "pose": "stand", "x": 0.7, "y": 0.86, "h": 0.42}], {"entry": 0.6, "gapEyes": [0, 99]}),
    "lines": [L("The closet is open a crack.", emph=["crack"])], "post": 0.4,
    "sfx": [{"name": "heartbeat_slow_muffled", "at": 0.0, "gain": 2, "dur": 2.5}]})
# 4-5: Chat mit Mrs. Hale
B.append({"scene": "phone_chat", "clock": "11:48 PM", "captionY": 1490, "capBox": True, "zoom": [1.0, 1.05], "focus": [540, 900], "trans": "cut",
    "p": {**CHAT_MRS, "messages": [{"kind": "stamp", "text": "11:48 PM", "at": 0},
        {"side": "out", "text": "I'm in the nursery. The closet is open.", "at": "@im"},
        {"side": "in", "text": "It never shuts right. There you are! Wave.", "at": "@it-0.1", "typing": "@im+1.6"}]},
    "lines": [L("You text her:"), L("I'm in the nursery. The closet is open.", voice="you", emph=["closet"]),
              L("It never shuts right. There you are! Wave.", voice="mrs_hale", emph=["Wave"])],
    "sfx": [{"name": "phone_ping", "at": "@it-0.1", "gain": -4}]})
# 6: du winkst (ihre App)
B.append({"scene": "cctv_grid", "clock": "11:49 PM", "zoom": [1.0, 1.06], "focus": [540, 960], "trans": "cut",
    "p": app_nursery("11:49 PM", [{"kind": "you", "pose": "wave", "waveAt": "@wave", "waveDur": 1.4, "x": 0.7, "y": 0.86, "h": 0.42}],
                     {"gapEyes": [0, 99]}), "captionY": 1515, "capBox": True,
    "lines": [L("You wave at the camera."), L("Twice."), L("You feel silly.", emph=["silly"])]})
# 7
B.append({"scene": "phone_chat", "clock": "11:49 PM", "captionY": 1490, "capBox": True, "zoom": [1.0, 1.04], "focus": [540, 900], "trans": "cut",
    "p": {**CHAT_MRS, "awayAt": "@she+0.4", "messages": [{"kind": "stamp", "text": "11:48 PM", "at": -1},
        {"side": "out", "text": "I'm in the nursery. The closet is open.", "at": -1},
        {"side": "in", "text": "It never shuts right. There you are! Wave.", "at": -1},
        {"side": "in", "text": "Cute! Last dance!", "at": "@cute-0.1"}]},
    "lines": [L("Cute! Last dance!", voice="mrs_hale", speed=0.97, takes=(1, 1)), L("She puts her phone away.", emph=["away"])],
    "sfx": [{"name": "phone_ping", "at": "@cute-0.1", "gain": -4}]})
# 8: du kommst zurück (Gegenschuss)
B.append({"scene": "hallway", "clock": "11:50 PM", "zoom": [1.0, 1.04], "trans": "cut", "captionY": 1500, "capBox": True,
    "p": {"noLamp": True, "youWalk": {"approach": [0.0, 2.6], "h0": 280, "h1": 1050, "y1": 2150}},
    "lines": [L("You don't open the closet."), L("You can't.", emph=["can't"])],
    "sfx": [{"name": "footsteps_approach", "at": 0.0, "gain": -10, "dur": 2.6}]})
# 9
B.append({"scene": "bedroom", "clock": "11:50 PM", "zoom": [1.0, 1.05], "trans": "cut",
    "p": {"pose": "sitting", "lookPhone": True, "hood": True, "roomCam": True, **bed_mon("11:40 PM")}, "place": "HALE HOUSE · GUEST RM",
    "lines": [L("Back downstairs, the monitor still shows an empty nursery.", emph=["empty"])]})
# 10
B.append({"scene": "phone_lock", "clock": "11:53 PM", "zoom": [1.0, 1.15], "focus": [540, 700], "trans": "cut",
    "p": {"time": "11:53", "notifs": [{"sender": "Mr. Hale", "text": "Hallway cam caught you at 11:50. Then motion at…", "at": "@mr"}], "buzz": ["@mr"]},
    "lines": [L("Eleven fifty-three."), L("Mr. Hale texts.", say="Mister Hale texts.")],
    "sfx": [{"name": "phone_vibrate", "at": "@mr", "gain": -2}]})
# 11-12: Chat mit Mr. Hale
MR_MSG = "Hallway cam caught you at eleven fifty. Then motion at eleven fifty-one. Too dark to see."
MR_TXT = "Hallway cam caught you at 11:50. Then motion at 11:51. Too dark to see."  # so steht es in der Nachricht
B.append({"scene": "phone_chat", "clock": "11:53 PM", "captionY": 1490, "capBox": True, "zoom": [1.0, 1.04], "focus": [540, 900], "trans": "cut",
    "p": {**CHAT_MR, "messages": [{"kind": "stamp", "text": "11:53 PM", "at": 0},
        {"side": "in", "text": MR_TXT, "at": 0.05},
        {"side": "in", "kind": "photo", "photo": {"kind": "hall_dark", "stamp": "11:51 PM"}, "at": "@too"}]},
    "lines": [L(MR_MSG, voice="mr_hale", emph=["fifty-one", "dark"])]})
B.append({"scene": "phone_chat", "clock": "11:53 PM", "captionY": 1490, "capBox": True, "zoom": [1.0, 1.05], "focus": [540, 900], "trans": "cut",
    "p": {**CHAT_MR, "messages": [{"side": "in", "text": MR_TXT, "at": -1},
        {"side": "in", "kind": "photo", "photo": {"kind": "hall_dark", "stamp": "11:51 PM"}, "at": -1},
        {"side": "out", "text": "That wasn't me.", "at": "@that"},
        {"side": "in", "text": "Getting Dana.", "at": "@getting-0.1", "typing": "@that+0.9", "red": True}]},
    "lines": [L("You type:"), L("That wasn't me.", voice="you"), L("He answers:"), L("Getting Dana.", voice="mr_hale", emph=["Dana"])],
    "post": 0.3, "sfx": [{"name": "phone_ping", "at": "@getting-0.1", "gain": -4}]})
# 13: SHHH
B.append({"scene": "sfx_text", "clock": "11:54 PM", "captionY": 1460, "capBox": True, "trans": "cut", "vignette": 0.95,
    "p": {"lines": ["SHHH."], "times": ["@shhh"], "xs": [700], "y": 900, "size": 260, "bg": "bedroom",
          "bgP": {"pose": "sitting", "hood": True, "tremble": True, "roomCam": True, **bed_mon("11:44 PM")}},
    "lines": [L("Right beside your ear, someone whispers:"), L("Shhh.", voice="shape", emph=["Shhh"], hush=True, gain=-4.5)], "post": 0.4,
    "sfx": [{"name": "breath_whisper", "at": "@shhh-0.2", "gain": -8}]})
# 14
B.append({"scene": "bedroom", "clock": "11:54 PM", "zoom": [1.0, 1.1], "focus": [400, 900], "trans": "cut",
    "p": {"pose": "sitting", "hood": True, "roomCam": True, **bed_mon("11:44 PM"), "tremble": True, "shapeBehind": {"at": 0.2, "alpha": 0.12, "x": 470, "h": 1150, "fade": 1.0}},
    "lines": [L("You freeze and shut your eyes."), L("It's the monitor."), L("It has to be.", emph=["has"])], "post": 0.4,
    "sfx": [{"name": "tinnitus_ring", "at": 0.2, "gain": -13}]})
# 15: Mitternacht, Schrank öffnet sich
B.append(monitor("12:00 AM", "11:50 PM", [L("Midnight."), L("You open your eyes."), L("On the monitor, the closet slides open.", emph=["slides"]), L("It unfolds.", emph=["unfolds"])],
    figure={"kind": "shape", "pose": "stand", "fromPose": "hunch", "poseAt": "@unfolds", "poseDur": 1.3, "x": 0.12, "y": 0.86, "h": 0.8, "at": "@slides+0.5", "fade": 0.6,
            "eyes": "@unfolds+0.3", "move": ["@unfolds", "@unfolds+1.3", 0.24]},
    p={"doorStyle": "closet", "doorKeys": [[0, 0.08], ["@slides", 0.08], ["@slides+1.0", 0.6]], "entrySwing": [0.0, 1.4, 0.25, 0.05]}, trans="cut", post=0.6,
    sfx=[{"name": "heartbeat_slow_muffled", "at": "@open", "gain": 2, "dur": 2.0}, {"name": "tension_riser_4s", "at": "@slides", "gain": -14}]))
# 16
B.append(monitor("12:00 AM", "11:50 PM", [L("And walks out of view.", emph=["view"])],
    figure={"kind": "shape", "pose": "walk", "x": 0.24, "y": 0.86, "h": 0.8, "eyes": -5, "move": [0.2, "@view+0.3", 1.15]},
    p={"doorStyle": "closet", "door": 0.6, "entry": 0.05, "feedZoom": [1.0, 1.08]}, trans="cut", post=0.5,
    sfx=[{"name": "footsteps_approach", "at": 0.2, "gain": -14, "dur": 1.8}, {"name": "impact_hit_short", "at": "@view+0.6", "gain": -6}]))
# 17
B.append({"scene": "end_card", "clock": "12:00 AM", "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"title": "DON'T WAKE HER", "kicker": "PART 2", "time": "12:00 AM", "pill": "FOLLOW FOR PART 3", "sub": "WHERE DID IT GO?|TELL ME IN THE COMMENTS"},
    "lines": [L("Where did it go?", emph=["go"]), L("Tell me in the comments."), L("Follow for part three.", emph=["three"])],
    "post": 0.8, "endShape": {"at": "@three+0.5", "eyes": "@three+0.5", "finger": "@three+0.9"},
    "sfx": [{"name": "impact_boom", "at": 0.0, "gain": -6}, {"name": "breath_whisper", "at": "@three+0.6", "gain": -12}],
    "flash": [{"at": 0.0, "d": 0.12, "c": "#ff2020", "a": 0.3}]})

story = base(2, "FOLLOW FOR PART 3")
story["beats"] = B
story["coldOpen"] = {"beat": 12, "at": 1.087, "dur": 3.03, "label": "LATER"}  # Teaser vorneweg, harter Schnitt
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "house_ambience", "from": 0, "to": 200, "gain": 10, "fade": 0.5},
    {"name": "dark_pad_tension", "fromBeat": 0, "toBeat": 3, "gain": -3, "fade": 1.0},
    {"name": "music_box_lullaby", "fromBeat": 4, "toBeat": 8, "gain": -3, "fade": 1.2},
    {"name": "whisper_texture", "fromBeat": 12, "toBeat": 13, "gain": -4, "fade": 0.6},
    {"name": "dark_pad_tension", "fromBeat": 13, "toBeat": 16, "gain": -2, "fade": 1.0}]
save(story, sys.argv[1] + "/en/dwh_part2.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words")
