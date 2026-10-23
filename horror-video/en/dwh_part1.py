# DON'T WAKE HER – Part 1 "The Screenshot" (finale Fassung)
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from dwh_common import *

SHAPE = {"kind": "shape", "pose": "bend", "x": 0.42, "y": 0.86, "h": 0.8}
CLOSED = {"door": 0.0, "doorStyle": "closet"}
CRACK = {"door": 0.08, "doorStyle": "closet"}
APP = "HALE CAMS • LIVE"
def you_sit(): return [{"kind": "you", "pose": "sit", "x": 0.3, "y": 0.78, "h": 0.38}]
CHAT = {"name": "Mrs. Hale", "initials": "DH", "avatarColor": "#5a1316", "headerSub": "Active now", "headerDot": True}
M1 = [{"kind": "stamp", "text": "11:41 PM", "at": 0}]

B = []
# 0
B.append(monitor("11:40 PM", "11:30 PM", [L("Something is standing over the crib.", emph=["crib"])],
    figure=SHAPE, p=dict(CLOSED), zoom=[1.0, 1.08], focus=[540, 760], trans="cut", post=0.5,
    sfx=[{"name": "sub_pulse", "at": "@crib", "gain": -4}, {"name": "low_piano_hit", "at": "@crib+0.6", "gain": -8}]))
# 1
BED_MON = {"monitorOnStand": True, "monitorStamp": "11:30 PM", "monitorShape": True}
B.append({"scene": "bedroom", "clock": "11:40 PM", "place": "HALE HOUSE · GUEST RM", "zoom": [1.0, 1.05], "focus": [540, 900],
    "p": {"pose": "sitting", "lookPhone": True, "hood": True, "roomCam": True, **BED_MON},
    "lines": [L("Eleven forty."), L("You're babysitting, alone downstairs.", emph=["alone"])], "sfx": []})
# 2
B.append({"scene": "bedroom", "clock": "11:40 PM", "place": "HALE HOUSE · GUEST RM", "pan": [0, 0, 0, 430], "zoom": [1.0, 1.0], "trans": "cut", "captionY": 1500, "capBox": True,
    "p": {"pose": "sitting", "lookPhone": True, "hood": True, "roomCam": True, **BED_MON, "ceilingCrib": "@wren", "ceilingLabel": "UPSTAIRS: BABY WREN"},
    "lines": [L("Wren sleeps right above you.", emph=["above"]), L("The Hales are at a wedding.")],
    "sfx": [{"name": "door_creak", "at": "@hales", "gain": -16, "dur": 1.0}]})
# 3
B.append(monitor("11:41 PM", "11:31 PM", [L("On the baby monitor, it doesn't move.", emph=["move"])],
    figure=SHAPE, p={**CLOSED, "feedZoom": [1.0, 1.3], "feedFocus": [0.42, 0.55]}, trans="cut", pre=0.2))
# 4
B.append(monitor("11:41 PM", "11:31 PM", [L("Bent low over Wren."), L("The sound is muted.", emph=["muted"])],
    figure=SHAPE, p={**CLOSED, "feedZoom": [1.3, 1.5], "feedFocus": [0.42, 0.55], "mutedPulse": "@muted"}, trans="cut", post=0.4,
    sfx=[{"name": "heartbeat_slow_muffled", "at": "@muted", "gain": 2, "dur": 2.0}]))
# 5
B.append({"scene": "fridge_note", "clock": "11:41 PM", "zoom": [1.0, 1.1], "focus": [540, 760], "captionY": 1460, "capBox": True, "trans": "cut",
    "p": {"title": "Hi babysitter!", "lines": [
        {"text": "Wren down by eight ♥", "at": 0.0, "dur": 0.5},
        {"text": "Old monitor. Clock's wrong. Just ignore it!", "at": "@old", "dur": 1.8, "row": 1, "glowAt": "@old"},
        {"text": "Cameras on my phone. Text anytime! – Dana", "at": 0.25, "dur": 0.6, "row": 3}]},
    "lines": [L("Mrs. Hale's note said:", say="Missus Hale's note said:"), L("Old monitor. Clock's wrong. Just ignore it!", voice="mrs_hale", emph=["wrong"])],
    "sfx": [{"name": "light_click", "at": 0.05, "gain": 0}]})
# 6-8: Chat
B.append({"scene": "phone_chat", "clock": "11:41 PM", "captionY": 1490, "capBox": True, "zoom": [1.0, 1.04], "focus": [540, 900], "trans": "cut",
    "p": {**CHAT, "messages": M1 + [
        {"side": "out", "text": "Is anyone else in the house?", "at": "@is"},
        {"side": "in", "text": "Just you and Wren. Why?", "at": "@just-0.1", "typing": "@is+1.0"},
        {"side": "out", "text": "Someone is in the nursery.", "at": "@someone"}]},
    "lines": [L("You can't ignore this."), L("So you text her."), L("Is anyone else in the house?", voice="you"),
              L("Just you and Wren. Why?", voice="mrs_hale"), L("Someone is in the nursery.", voice="you", emph=["nursery"])],
    "sfx": [{"name": "phone_ping", "at": "@just-0.1", "gain": -4}]})
# 9
B.append({"scene": "phone_chat", "clock": "11:42 PM", "captionY": 1490, "capBox": True, "zoom": [1.04, 1.08], "focus": [540, 900], "trans": "cut",
    "p": {**CHAT, "messages": M1 + [
        {"side": "out", "text": "Is anyone else in the house?", "at": -1}, {"side": "in", "text": "Just you and Wren. Why?", "at": -1},
        {"side": "out", "text": "Someone is in the nursery.", "at": -1},
        {"side": "in", "text": "Nursery cam's live. Nobody's there.", "at": "@nursery-0.1", "typing": 0.2, "red": True}]},
    "lines": [L("She checks her camera app.", say="She checks her camera app"), L("Nursery cam's live. Nobody's there.", voice="mrs_hale", emph=["Nobody's"])],
    "sfx": [{"name": "phone_ping", "at": "@nursery-0.1", "gain": -3}]})
# 10-11: ihre App
FEEDS = lambda guest_alert=None: [
    {"room": "nursery", "label": "NURSERY", **CRACK},
    {"room": "corridor", "label": "HALL"},
    {"room": "stairs", "label": "STAIRS"},
    {"room": "guest", "label": "GUEST RM", "figures": you_sit(), **({"alert": guest_alert} if guest_alert else {})}]
B.append({"scene": "cctv_grid", "clock": "11:42 PM", "zoom": [1.0, 1.04], "focus": [540, 960], "captionY": 1515, "capBox": True,
    "p": {"stamp": "11:42 PM", "title": APP, "live": True, "clean": True, "feeds": FEEDS(), "focus": {"feed": 0, "at": "@wren", "dur": 0.6}},
    "lines": [L("She sends a screenshot."), L("Just Wren, asleep.", emph=["asleep"])],
    "sfx": [{"name": "camera_shutter", "at": 0.05, "gain": 0}]})
B.append({"scene": "cctv_grid", "clock": "11:42 PM", "zoom": [1.0, 1.04], "focus": [540, 960], "trans": "cut", "captionY": 1515, "capBox": True,
    "p": {"stamp": "11:42 PM", "title": APP, "live": True, "clean": True, "feeds": FEEDS(), "focus": {"feed": 3, "at": 0.1, "dur": 0.6}},
    "lines": [L("Even your room."), L("Just you.", emph=["you"])], "post": 0.3})
# 12-14: Kopf hebt sich, Augen, Finger
B.append(monitor("11:44 PM", "11:34 PM", [L("But your monitor still shows it.", emph=["still"]), L("Its head lifts."), L("Slowly.")],
    figure={**SHAPE, "pose": "lift", "fromPose": "bend", "poseAt": "@lifts", "poseDur": 2.2, "turn": "@lifts"}, p={**CLOSED, "feedZoom": [1.0, 1.2], "feedFocus": [0.45, 0.4]}, trans="cut",
    sfx=[{"name": "tension_riser_4s", "at": "@lifts-0.5", "gain": -14}]))
B.append(monitor("11:44 PM", "11:34 PM", [L("Toward the camera."), L("Two red eyes.", emph=["eyes"])],
    figure={**SHAPE, "pose": "lift", "turn": -5, "eyes": "@two"}, p={**CLOSED, "feedZoom": [1.4, 1.75], "feedFocus": [0.6, 0.2]}, trans="cut", post=0.5,
    sfx=[{"name": "stinger_violin_screech", "at": "@two", "gain": -10}], glitch=[{"at": "@two", "d": 0.1}]))
B.append(monitor("11:45 PM", "11:35 PM", [L("One long finger rises to where a mouth should be.", emph=["finger"])],
    figure={**SHAPE, "pose": "shush", "fromPose": "lift", "poseAt": "@finger", "poseDur": 1.2, "turn": -5, "eyes": -5},
    p={**CLOSED, "feedZoom": [1.0, 1.1], "feedFocus": [0.45, 0.45]}, trans="cut", post=0.6,
    sfx=[{"name": "tinnitus_ring", "at": "@finger", "gain": -12}]))
# 15: in den Schrank
B.append(monitor("11:46 PM", "11:36 PM", [L("It folds itself into the closet."), L("The door stays open a crack.", emph=["crack"])],
    figure={**SHAPE, "pose": "hunch", "fromPose": "shush", "flip": True, "poseAt": "@folds", "poseDur": 0.6, "eyes": -5, "turn": -5, "move": ["@folds", "@folds+1.5", 0.12],
            "shrink": ["@folds+0.3", "@folds+1.5", 0.45], "fadeOut": ["@folds+1.25", "@folds+1.6"], "until": "@folds+1.7"},
    p={"doorStyle": "closet", "doorKeys": [[0, 0], ["@folds", 0], ["@folds+0.7", 0.55], ["@folds+1.8", 0.55], ["@crack", 0.08]], "gapEyes": ["@crack", "@crack+1.0"]},
    trans="cut",
    sfx=[{"name": "impact_hit_short", "at": "@crack+0.9", "gain": -9}]))
# 16: A/B-Flackern
B.append(monitor("11:46 PM", "11:36 PM", [L("Now your monitor matches her screenshot."), L("Exactly.", emph=["Exactly"]), L("But nothing ever left that room.", emph=["nothing"])],
    p={**CRACK, "flickerClean": [0.05, 1.6], "feedZoom": [1.0, 1.45], "feedFocus": [0.13, 0.45]}, trans="cut", post=0.4,
    sfx=[{"name": "whoosh", "at": 0.05, "gain": -12}, {"name": "whoosh", "at": 0.85, "gain": -12}, {"name": "heartbeat_slow_muffled", "at": "@nothing", "gain": 0, "dur": 2.0}]))
# 17
B.append({"scene": "phone_lock", "clock": "11:46 PM", "zoom": [1.0, 1.18], "focus": [540, 700], "trans": "cut",
    "p": {"time": "11:46", "notifs": [{"sender": "Mrs. Hale", "text": "Go peek if it helps! I'll watch on the app.", "at": 0.05}], "buzz": [0.05]},
    "lines": [L("Go peek if it helps! I'll watch on the app.", voice="mrs_hale", emph=["peek"])],
    "pre": 0.5, "sfx": [{"name": "phone_vibrate", "at": 0.05, "gain": -2}]})
# 18-19
B.append({"scene": "choice_split", "clock": "11:46 PM", "captionY": 1500, "capBox": True,
    "p": {"title": "Would you go up?", "kicker": "WREN IS STILL UP THERE", "a": "Go|up", "b": "Stay|down", "iconA": "stairs", "iconB": "bed"},
    "lines": [L("Would you go upstairs?", emph=["upstairs"]), L("Tell me in the comments.")],
    "sfx": [{"name": "impact_boom", "at": 0.0, "gain": -7}]})
B.append({"scene": "end_card", "clock": "11:46 PM", "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"title": "DON'T WAKE HER", "kicker": "PART 1", "time": "11:46 PM", "pill": "FOLLOW FOR PART 2", "sub": "GO UP OR STAY DOWN?|TELL ME IN THE COMMENTS"},
    "lines": [L("Follow for part two.", emph=["two"])], "post": 0.6, "endEyes": "@two+0.9",
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -8}, {"name": "breath_whisper", "at": "@two+0.9", "gain": -12}]})

story = base(1, "FOLLOW FOR PART 2")
story["beats"] = B
story["coldOpen"] = {"beat": 11, "words": "Toward the camera. Two red eyes.", "label": "LATER"}  # Teaser vorneweg, harter Schnitt
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "house_ambience", "from": 0, "to": 200, "gain": 10, "fade": 0.5},
    {"name": "music_box_lullaby", "fromBeat": 1, "toBeat": 5, "gain": -1, "fade": 1.2},
    {"name": "dark_pad_tension", "fromBeat": 12, "toBeat": 16, "gain": -2, "fade": 1.0},
    {"name": "whisper_texture", "fromBeat": 13, "toBeat": 15, "gain": -5, "fade": 0.8}]
save(story, sys.argv[1] + "/en/dwh_part1.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words")
