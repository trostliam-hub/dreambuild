# DON'T WAKE HER – Part 4 "Right Above You"
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from dwh_common import *

APP = "HALE CAMS • LIVE"
CHAT_MRS = {"name": "Mrs. Hale", "initials": "DH", "avatarColor": "#5a1316", "headerSub": "Active now", "headerDot": True}
CHAT_MR = {"name": "Mr. Hale", "initials": "MH", "avatarColor": "#2a2a40"}
HALF = {"door": 0.6, "doorStyle": "closet"}
def bed_mon(stamp, **k): return {"monitorOnStand": True, "monitorStamp": stamp, "monitorDoor": 0.6, **k}
def app(stamp, feed, figs, alert=None, at=-1, extra=None):
    """Elternkamera-App, ein Feed auf Vollbild."""
    fs = [{"room": "nursery", "label": "NURSERY", **HALF}, {"room": "corridor", "label": "HALL"}, {"room": "stairs", "label": "STAIRS"}, {"room": "guest", "label": "GUEST RM"}]
    fs[feed] = {**fs[feed], "figures": figs, **({"alert": alert} if alert is not None else {}), **(extra or {})}
    return {"stamp": stamp, "title": APP, "live": True, "clean": True, "feeds": fs, "focus": {"feed": feed, "at": at, "dur": 0.6}}
SHAPE = {"kind": "shape", "x": 0.42, "y": 0.86, "h": 0.8}
TILT = {"pan": [0, 0, 0, 430], "zoom": [1.0, 1.0], "captionY": 1500, "capBox": True}

B = []
# 0: Rückblick – es ist wieder oben
B.append({"scene": "bedroom", "clock": "12:03 AM", "place": "HALE HOUSE · GUEST RM", "zoom": [1.0, 1.06], "focus": [540, 900], "trans": "cut",
    "p": {"pose": "sitting", "lookPhone": True, "hood": True, "roomCam": True, **bed_mon("11:53 PM")},
    "lines": [L("The thing that whispered in your ear just climbed the stairs to Wren.", emph=["whispered", "Wren"])],
    "sfx": [{"name": "footsteps_approach", "at": 0.2, "gain": -18, "dur": 3.0}, {"name": "heartbeat_slow_muffled", "at": "@climbed", "gain": 0, "dur": 2.0}]})
# 1: Decke knarrt über dem Kinderbett
B.append({"scene": "bedroom", "clock": "12:03 AM", "place": "HALE HOUSE · GUEST RM", **TILT, "trans": "cut",
    "p": {"pose": "sitting", "listen": True, "hood": True, "roomCam": True, **bed_mon("11:53 PM"), "ceilingCrib": -1, "ceilingLabel": "WREN'S ROOM", "creakLines": "@creaks"},
    "lines": [L("Above you, the floor creaks."), L("Right over her crib.", emph=["crib"]), L("Wren stays silent.", emph=["silent"])],
    "sfx": [{"name": "door_creak", "at": "@creaks", "gain": -6, "dur": 1.0}, {"name": "door_creak", "at": "@right", "gain": -9, "dur": 0.8}]})
# 2: Monitor hilft nicht
B.append(monitor("12:03 AM", "11:53 PM", [L("Your monitor is no help."), L("Still showing eleven fifty-three.", emph=["fifty-three"])],
    p={**HALF, "entry": 0.3, "stampRing": "@eleven"}, trans="cut", post=0.3))
# 3: Mrs. Hale schaut live
B.append({"scene": "phone_chat", "clock": "12:03 AM", "captionY": 1490, "capBox": True, "zoom": [1.0, 1.05], "focus": [540, 900], "trans": "cut",
    "p": {**CHAT_MRS, "messages": [{"kind": "stamp", "text": "12:03 AM", "at": 0},
        {"side": "in", "kind": "photo", "photo": {"kind": "feed", "room": "nursery", "label": "NURSERY", "stamp": "12:03 AM", "figures": [{**SHAPE, "pose": "bend"}]}, "at": "@watching"},
        {"side": "in", "text": "It's leaning over her crib.", "at": "@its-0.1", "typing": "@texts", "red": True}]},
    "lines": [L("But Mrs. Hale is watching live.", say="But Missus Hale is watching live.", emph=["live"]), L("She texts you:"),
              L("It's leaning over her crib.", voice="mrs_hale", emph=["crib"])],
    "sfx": [{"name": "phone_ping", "at": "@watching", "gain": -6}, {"name": "phone_ping", "at": "@its-0.1", "gain": -4}]})
# 4: Mr. Hale fährt
B.append({"scene": "phone_chat", "clock": "12:04 AM", "captionY": 1490, "capBox": True, "zoom": [1.0, 1.05], "focus": [540, 900], "trans": "cut",
    "p": {**CHAT_MR, "messages": [{"kind": "stamp", "text": "12:04 AM", "at": 0},
        {"side": "in", "text": "Ten minutes away. Do not go up there.", "at": "@ten-0.1", "typing": 0.1, "red": True}]},
    "lines": [L("Mr. Hale writes:", say="Mister Hale writes:"), L("Ten minutes away. Do not go up there.", voice="mr_hale", emph=["Ten", "not"])],
    "sfx": [{"name": "phone_ping", "at": "@ten-0.1", "gain": -4}]})
# 5: Live – es beugt sich tiefer, Finger am Gesicht
B.append({"scene": "cctv_grid", "clock": "12:04 AM", "zoom": [1.0, 1.04], "focus": [540, 960], "captionY": 1515, "capBox": True, "trans": "cut",
    "p": app("12:04 AM", 0, [{**SHAPE, "pose": "bendShush", "fromPose": "bend", "poseAt": "@finger", "poseDur": 0.9, "eyes": -5}], alert="@feed", at="@feed", extra={"door": 0.6}),
    "lines": [L("On Mrs. Hale's feed, it bends lower.", say="On Missus Hale's feed, it bends lower.", emph=["lower"]), L("A finger to its face."), L("Hushing her.", emph=["Hushing"])],
    "sfx": [{"name": "sub_pulse", "at": "@feed", "gain": -6}]})
# 6: das Muster – jedes Summen, ein Shhh
B.append({"scene": "phone_lock", "clock": "12:04 AM", "zoom": [1.0, 1.08], "focus": [540, 760], "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"time": "12:04", "notifs": [{"sender": "Mr. Hale · 11:53", "text": "Hallway cam caught you at 11:50. Then motion at…", "at": 0.1},
                                      {"sender": "Mrs. Hale · 12:01", "text": "sent a photo", "at": "@every"}], "buzz": [0.1, "@every"]},
    "pops": [{"text": "SHHH.  11:54", "at": 0.9, "x": 540, "y": 1180, "size": 80, "dur": 1.3, "rot": -0.04},
             {"text": "SHHH. YOU'LL WAKE HER.", "at": "@hushed", "x": 540, "y": 1300, "size": 64, "dur": 1.6, "rot": 0.03}],
    "lines": [L("Then you see the pattern.", emph=["pattern"]), L("Every buzz, it hushed you.", emph=["buzz", "hushed"])], "pre": 0.2, "post": 0.4,
    "sfx": [{"name": "phone_vibrate", "at": 0.1, "gain": -4}, {"name": "breath_whisper", "at": 0.9, "gain": -14},
            {"name": "phone_vibrate", "at": "@every", "gain": -4}, {"name": "breath_whisper", "at": "@hushed", "gain": -14}]})
# 7
B.append({"scene": "face_closeup", "clock": "12:04 AM", "zoom": [1.0, 1.08], "capBox": True, "trans": "cut",
    "p": {"mood": "shock", "lightBelow": "red", "lookUp": 1, "lookUpAt": 0.3},
    "lines": [L("It never told you to leave."), L("It told you to be quiet.", emph=["quiet"])], "post": 0.3,
    "sfx": [{"name": "heartbeat_slow_muffled", "at": 0.0, "gain": 0, "dur": 2.5}]})
# 8
B.append({"scene": "rule_card", "clock": "12:04 AM", "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"label": "ITS RULE, NOT YOURS", "text": "DON'T WAKE HER.", "hl": ["WAKE"], "sub": "WHAT IF SHE WAKES?"},
    "lines": [L("It needs her asleep.", emph=["asleep"]), L("So what happens if she wakes up?", emph=["wakes"])],
    "sfx": [{"name": "impact_boom", "at": 0.0, "gain": -8}]})
# 9: rote Linie vom Kinderbett zu deinem Kopf
B.append({"scene": "bedroom", "clock": "12:05 AM", "place": "HALE HOUSE · GUEST RM", **TILT, "trans": "cut",
    "p": {"pose": "sitting", "listen": True, "hood": True, "roomCam": True, **bed_mon("11:55 PM"), "ceilingCrib": -1, "ceilingLabel": "WREN'S ROOM",
          "ceilingLine": "@right", "lineX": 255, "lineY": 950},
    "lines": [L("You don't have to go up there."), L("She's right above you.", emph=["above"])],
    "sfx": [{"name": "tension_riser_4s", "at": 0.3, "gain": -16}]})
# 10: du stehst auf dem Bett, Faust unter dem Kinderbett
B.append({"scene": "bedroom", "clock": "12:05 AM", "place": "HALE HOUSE · GUEST RM", "pan": [0, 380, 0, 380], "zoom": [1.0, 1.04], "focus": [540, 700], "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"pose": "standing", "onBed": True, "figX": 690, "hood": True, "roomCam": True, **bed_mon("11:55 PM"), "ceilingCrib": -1, "ceilingLabel": "WREN'S ROOM"},
    "lines": [L("You stand on the bed."), L("Your fist, right under her crib.", emph=["fist"])],
    "sfx": [{"name": "light_click", "at": 0.1, "gain": -6}]})
# 11: Mrs. Hale: Weck sie auf
B.append({"scene": "phone_lock", "clock": "12:05 AM", "zoom": [1.0, 1.12], "focus": [540, 760], "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"time": "12:05", "notifs": [{"sender": "Mrs. Hale", "text": "Wake her up.", "at": "@buzzes"}], "buzz": ["@buzzes", "@buzzes+0.5"]},
    "lines": [L("Your phone buzzes.", emph=["buzzes"]), L("Too loud.", emph=["loud"]), L("Mrs. Hale sees you on the guest cam.", say="Missus Hale sees you on the guest cam."),
              L("Wake her up.", voice="mrs_hale", emph=["Wake"])],
    "sfx": [{"name": "phone_vibrate", "at": "@buzzes", "gain": 0}, {"name": "phone_vibrate", "at": "@buzzes+0.5", "gain": -4, "dur": 0.8}]})
# 12: live – sein Kopf dreht sich nach unten, zu dir (Quelle des Cold Opens)
B.append({"scene": "cctv_grid", "clock": "12:05 AM", "zoom": [1.0, 1.06], "focus": [540, 900], "captionY": 1515, "capBox": True, "trans": "cut",
    "p": app("12:05 AM", 0, [{**SHAPE, "pose": "down", "fromPose": "bendShush", "poseAt": "@turns", "poseDur": 2.6, "eyes": "@slowly", "eyesDownAt": "@down", "sightAt": "@toward", "ringAt": "@you"}], alert=-1, extra={"door": 0.6}),
    "lines": [L("On her live feed, its head turns."), L("Slowly."), L("Down."), L("Toward you.", emph=["you"])], "post": 0.4,
    "sfx": [{"name": "tension_riser_4s", "at": "@turns", "gain": -12}, {"name": "stinger_violin_screech", "at": "@you", "gain": -11}], "glitch": [{"at": "@you+0.1", "d": 0.1}]})
# 13: durch die Decke
B.append({"scene": "sfx_text", "clock": "12:05 AM", "captionY": 1500, "capBox": True, "trans": "cut", "vignette": 0.95,
    "p": {"lines": ["DON'T", "WAKE HER."], "times": ["@dont", "@wake"], "y": 700, "size": 200, "bg": "bedroom",
          "bgP": {"pose": "standing", "onBed": True, "figX": 690, "hood": True, "tremble": True, "roomCam": True, **bed_mon("11:55 PM"), "ceilingCrib": -1}},
    "lines": [L("Through the ceiling, a whisper:"), L("Don't wake her.", voice="shape", emph=["wake"])], "post": 0.5,
    "shakeAt": [{"at": "@dont", "d": 1.2, "a": 10}],
    "sfx": [{"name": "breath_whisper", "at": "@dont-0.3", "gain": -8}, {"name": "sub_pulse", "at": "@wake", "gain": -4}]})
# 14
B.append({"scene": "choice_split", "clock": "12:05 AM", "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"title": "Would you wake her?", "kicker": "IT SAYS DON'T. HER MOM SAYS DO.", "a": "Wake|her", "b": "Let her|sleep", "iconA": "fist", "iconB": "crib", "optA": "", "optB": ""},
    "lines": [L("Would you wake her?", emph=["wake"]), L("Tell me in the comments.")],
    "sfx": [{"name": "impact_boom", "at": 0.0, "gain": -7}]})
# 15
B.append({"scene": "end_card", "clock": "12:05 AM", "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"title": "DON'T WAKE HER", "kicker": "PART 4", "time": "12:05 AM", "pill": "FOLLOW FOR THE FINALE", "sub": "WAKE HER OR LET HER SLEEP?|TELL ME IN THE COMMENTS"},
    "lines": [L("Follow for the finale.", emph=["finale"])], "post": 0.9, "endEyes": "@finale+0.6",
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -8}, {"name": "breath_whisper", "at": "@finale+0.6", "gain": -12}]})

story = base(4, "FOLLOW FOR THE FINALE")
story["ui"]["kicker"] = "FINALE"
story["beats"] = B
story["coldOpen"] = {"beat": 12, "words": "Slowly. Down. Toward you.", "label": "LATER"}  # Teaser vorneweg, harter Schnitt
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "house_ambience", "from": 0, "to": 200, "gain": 10, "fade": 0.5},
    {"name": "dark_pad_tension", "fromBeat": 0, "toBeat": 4, "gain": -3, "fade": 1.0},
    {"name": "heartbeat_fast", "fromBeat": 5, "toBeat": 8, "gain": -10, "fade": 0.6},
    {"name": "whisper_texture", "fromBeat": 9, "toBeat": 13, "gain": -5, "fade": 0.8},
    {"name": "dark_pad_tension", "fromBeat": 12, "toBeat": 15, "gain": -2, "fade": 1.0}]
save(story, sys.argv[1] + "/en/dwh_part4.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words")
