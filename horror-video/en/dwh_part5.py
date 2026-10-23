# DON'T WAKE HER – Part 5 "Wake Her" (Finale)
import sys
sys.path.insert(0, sys.argv[1] + "/en")
from dwh_common import *

APP = "HALE CAMS • LIVE"
CHAT_MRS = {"name": "Mrs. Hale", "initials": "DH", "avatarColor": "#5a1316", "headerSub": "Active now", "headerDot": True}
HALF = {"door": 0.6, "doorStyle": "closet"}
SHUT = {"door": 0.0, "doorStyle": "closet"}
def bed_mon(stamp, **k): return {"monitorOnStand": True, "monitorStamp": stamp, "monitorDoor": 0.6, **k}
def app(stamp, feed, figs, alert=None, at=-1, extra=None):
    fs = [{"room": "nursery", "label": "NURSERY", **HALF}, {"room": "corridor", "label": "HALL"}, {"room": "stairs", "label": "STAIRS"}, {"room": "guest", "label": "GUEST RM"}]
    fs[feed] = {**fs[feed], "figures": figs, **({"alert": alert} if alert is not None else {}), **(extra or {})}
    return {"stamp": stamp, "title": APP, "live": True, "clean": True, "feeds": fs, "focus": {"feed": feed, "at": at, "dur": 0.6}}
SHAPE = {"kind": "shape", "x": 0.42, "y": 0.86, "h": 0.8}
YOU_WAVE = {"kind": "you", "pose": "wave", "waveAt": 0.3, "waveDur": 1.4, "x": 0.7, "y": 0.86, "h": 0.42}

B = []
# 0: Rückblick – letzter Moment aus Part 4
B.append({"scene": "cctv_grid", "clock": "12:05 AM", "zoom": [1.0, 1.12], "focus": [560, 700], "captionY": 1515, "capBox": True, "trans": "cut",
    "p": app("12:05 AM", 0, [{**SHAPE, "pose": "down", "eyes": -5, "eyesDownAt": -5, "sightAt": -5}], alert=-1, extra={"door": 0.6}),
    "lines": [L("It's leaning over Wren."), L("It just told you not to wake her.", emph=["wake"])],
    "sfx": [{"name": "sub_pulse", "at": 0.0, "gain": -4}]})
# 1
B.append({"scene": "face_closeup", "clock": "12:05 AM", "zoom": [1.0, 1.08], "capBox": True, "trans": "cut",
    "p": {"mood": "shock", "lightBelow": "red", "lookUp": 1, "lookUpAt": 0.2},
    "lines": [L("So you do the one thing every babysitter is told never to do.", emph=["never"])],
    "sfx": [{"name": "heartbeat_fast", "at": 0.0, "gain": -8, "dur": 3.0}]})
# 2: Faust gegen die Decke, dreimal
B.append({"scene": "bedroom", "clock": "12:05 AM", "place": "HALE HOUSE · GUEST RM", "pan": [0, 380, 0, 380], "zoom": [1.0, 1.04], "focus": [540, 700], "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"pose": "standing", "onBed": True, "figX": 690, "hood": True, "roomCam": True, **bed_mon("11:55 PM"), "ceilingCrib": -1, "ceilingLabel": "WREN'S ROOM",
          "punch": ["@slam", "@three", "@times"]},
    "lines": [L("You slam the ceiling.", emph=["slam"]), L("Three times.", emph=["Three"])], "post": 0.3,
    "shakeAt": [{"at": "@slam", "d": 0.35, "a": 34}, {"at": "@three", "d": 0.35, "a": 34}, {"at": "@times", "d": 0.35, "a": 34}],
    "flash": [{"at": "@slam", "d": 0.08, "a": 0.35}, {"at": "@three", "d": 0.08, "a": 0.35}, {"at": "@times", "d": 0.08, "a": 0.35}],
    "sfx": [{"name": "ceiling_slam", "at": "@slam", "gain": 0}, {"name": "ceiling_slam", "at": "@three", "gain": 0}, {"name": "ceiling_slam", "at": "@times", "gain": 0}]})
# 3: Stille, dann schreit Wren
B.append({"scene": "bedroom", "clock": "12:05 AM", "place": "HALE HOUSE · GUEST RM", "pan": [0, 430, 0, 430], "zoom": [1.0, 1.0], "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"pose": "standing", "onBed": True, "figX": 690, "hood": True, "roomCam": True, **bed_mon("11:55 PM"), "ceilingCrib": -1, "ceilingLabel": "WREN'S ROOM", "cribRing": "@screams"},
    "lines": [L("One second of silence.", emph=["silence"], gap=1.1), L("Then Wren screams.", emph=["screams"])], "post": 0.8,
    "sfx": [{"name": "baby_cry_ceiling", "at": "@screams", "gain": -4, "dur": 3.0}]})
# 4: live – es zuckt zurück
B.append({"scene": "cctv_grid", "clock": "12:05 AM", "zoom": [1.0, 1.04], "focus": [540, 900], "captionY": 1515, "capBox": True, "trans": "cut",
    "p": app("12:05 AM", 0, [{**SHAPE, "pose": "stand", "fromPose": "down", "poseAt": 0.15, "poseDur": 0.35, "eyes": -5, "move": ["@flinches", "@flinches+0.9", 0.26]}],
             alert=-1, extra={"door": 0.6, "cry": 0.0}),
    "lines": [L("On Mrs. Hale's feed, it flinches from the crib.", say="On Missus Hale's feed, it flinches from the crib.", emph=["flinches"]), L("From the noise.", emph=["noise"])],
    "sfx": [{"name": "baby_cry_ceiling", "at": 0.0, "gain": -10, "dur": 4.0}, {"name": "whoosh", "at": "@flinches", "gain": -8}]})
# 5: in den Schrank – die Tür schließt ganz
B.append({"scene": "cctv_grid", "clock": "12:06 AM", "zoom": [1.0, 1.04], "focus": [400, 900], "captionY": 1515, "capBox": True, "trans": "cut",
    "p": app("12:06 AM", 0, [{**SHAPE, "pose": "hunch", "fromPose": "stand", "flip": True, "poseAt": "@folds", "poseDur": 0.5, "x": 0.26, "eyes": -5,
                              "move": ["@folds", "@folds+1.2", 0.1], "shrink": ["@folds+0.2", "@folds+1.2", 0.45], "fadeOut": ["@folds+1.0", "@folds+1.3"], "until": "@folds+1.4"}],
             extra={"doorStyle": "closet", "doorKeys": [[0, 0.6], ["@folds+1.2", 0.6], ["@clicks", 0.0]], "cry": 0.0, "seamRing": "@clicks"}),
    "lines": [L("It folds into the closet."), L("The door that never shuts right clicks shut.", emph=["clicks", "shut"])], "post": 0.4,
    "sfx": [{"name": "baby_cry_ceiling", "at": 0.0, "gain": -12, "dur": 4.5}, {"name": "door_creak", "at": "@folds+0.3", "gain": -10, "dur": 1.0},
            {"name": "light_click", "at": "@clicks", "gain": 2}]})
# 6: Mrs. Hale
B.append({"scene": "phone_chat", "clock": "12:06 AM", "captionY": 1490, "capBox": True, "zoom": [1.0, 1.05], "focus": [540, 900], "trans": "cut",
    "p": {**CHAT_MRS, "messages": [{"kind": "stamp", "text": "12:05 AM", "at": -1}, {"side": "in", "text": "Wake her up.", "at": -1, "red": True},
        {"side": "in", "text": "Don't let her fall asleep.", "at": "@dont-0.1", "typing": 0.1, "red": True}]},
    "lines": [L("Mrs. Hale types:", say="Missus Hale types:"), L("Don't let her fall asleep.", voice="mrs_hale", emph=["asleep"])],
    "sfx": [{"name": "phone_ping", "at": "@dont-0.1", "gain": -4}, {"name": "baby_cry_ceiling", "at": 0.0, "gain": -16, "dur": 3.0}]})
# 7: oben, mit eigenen Augen
B.append({"scene": "nursery_pov", "clock": "12:07 AM", "zoom": [1.0, 1.06], "focus": [300, 900], "captionY": 1500, "capBox": True, "trans": "cut", "place": "HALE HOUSE · NURSERY",
    "p": {"dark": 0.86, "lightsOn": "@lights", "cry": 0.0, "notes": "@sing", "closetGap0": 0, "mobileSpin": 0.8, "nightlight": 0.6,
          "cryGap": ["@closet", "@closet+0.5"], "seamRing": "@closet", "seamRingDur": 1.0},
    "lines": [L("You run upstairs."), L("Lights on.", emph=["Lights"]), L("You sing, loud and badly, eyes on the closet.", emph=["closet"]), L("She cries."), L("Good.", emph=["Good"])],
    "sfx": [{"name": "footsteps_approach", "at": 0.0, "gain": -6, "dur": 1.6}, {"name": "light_click", "at": "@lights", "gain": 2},
            {"name": "baby_cry_ceiling", "at": 0.2, "gain": -6, "dur": "@closet-0.4"}, {"name": "door_creak", "at": "@closet", "gain": -8, "dur": 0.6},
            {"name": "baby_cry_ceiling", "at": "@closet+0.5", "gain": -4, "dur": 4.0}]})
# 8: Haustür – Scheinwerfer, Schlüssel
B.append({"scene": "front_door", "clock": "12:14 AM", "zoom": [1.0, 1.05], "focus": [540, 900], "captionY": 1500, "capBox": True, "trans": "fade", "place": "HALE HOUSE · FRONT DOOR",
    "p": {"headlights": "@headlights-0.3", "hlDur": 2.2, "keyAt": "@keys+0.4"},
    "lines": [L("Twelve fourteen.", say="Twelve fourteen,"), L("Headlights.", say="headlights,", emph=["Headlights"]), L("Keys in the lock.", say="keys in the lock.", emph=["lock"])],
    "sfx": [{"name": "car_arrive", "at": 0.0, "gain": -6}, {"name": "keys_lock", "at": "@keys", "gain": -4}]})
# 9: Die Hales kommen herein
B.append({"scene": "front_door", "clock": "12:14 AM", "zoom": [1.0, 1.04], "focus": [540, 900], "captionY": 1500, "capBox": True, "trans": "cut", "place": "HALE HOUSE · FRONT DOOR",
    "p": {"open": 0.0, "openDur": 0.5, "parents": {"at": 0.2}, "porch": 0.5, "you": {"x": 820, "pose": "stand"}},
    "lines": [L("The Hales run in."), L("Wren is safe.", emph=["safe"])],
    "sfx": [{"name": "door_creak", "at": 0.0, "gain": -6, "dur": 0.8}, {"name": "footsteps_approach", "at": 0.4, "gain": -6, "dur": 2.5}]})
# 9b: niemand öffnet den Schrank
B.append({"scene": "nursery_pov", "clock": "12:14 AM", "zoom": [1.0, 1.08], "focus": [180, 900], "captionY": 1500, "capBox": True, "trans": "cut", "place": "HALE HOUSE · NURSERY",
    "p": {"dark": 0.15, "cry": 0.0, "closetGap0": 0, "mobileSpin": 0.5, "nightlight": 0.6, "seamRing": "@closet", "seamFaint": True},
    "lines": [L("Nobody opens the closet.", emph=["closet"])], "post": 0.6,
    "sfx": [{"name": "baby_cry_ceiling", "at": 0.0, "gain": -14, "dur": 2.5}, {"name": "sub_pulse", "at": "@closet", "gain": -8}]})
# 10: Rückblick auf dem Monitor – Wren hat sich nie bewegt
NIGHT = [
    {"at": 0.0, "stamp": "11:35 PM", "door": 0.0, "ring": True, "figures": [{**SHAPE, "pose": "shush", "eyes": -5}]},
    {"at": "@never-0.2", "stamp": "11:49 PM", "door": 0.08, "ring": True, "figures": [{**YOU_WAVE, "waveAt": -1, "waveDur": 9}]},
    {"at": "@once-0.3", "stamp": "11:50 PM", "door": 0.6, "ring": True, "figures": [{**SHAPE, "x": 0.16, "pose": "stand", "eyes": -5}]}]
B.append(monitor("12:15 AM", "11:35 PM", [L("Mrs. Hale whispers:", say="Missus Hale whispers:"), L("She's never woken up at night.", voice="mrs_hale", emph=["never"]), L("Not once.", voice="mrs_hale", emph=["once"])],
    p={"doorStyle": "closet", "flashFrames": NIGHT, "rewind": [0.0, 0.5]}, trans="cut", post=0.5,
    sfx=[{"name": "whoosh_reverse", "at": 0.0, "gain": -8}, {"name": "light_click", "at": "@never-0.2", "gain": -8}, {"name": "light_click", "at": "@once-0.3", "gain": -8}]))
# 11: Auflösung
B.append({"scene": "rule_card", "clock": "12:15 AM", "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"label": "WHAT IT IS", "text": "IT ONLY TAKES WHAT NEVER WAKES.", "hl": ["NEVER", "WAKES"], "sub": "TONIGHT, SHE WOKE."},
    "lines": [L("Not a good sleeper, a hushed one.", emph=["hushed"]), L("It only takes what never wakes.", emph=["never", "wakes"]), L("Tonight, she woke.", emph=["woke"])],
    "sfx": [{"name": "impact_boom", "at": 0.0, "gain": -7}, {"name": "low_piano_hit", "at": "@woke", "gain": -6}]})
# 12: Rückblende 11:57 – es stand neben dir
B.append({"scene": "bedroom", "clock": "12:15 AM", "place": "HALE HOUSE · GUEST RM", "zoom": [1.05, 1.15], "focus": [420, 820], "trans": "cut", "captionY": 1500, "capBox": True,
    "rewindFx": {"at": 0.0, "dur": 0.6, "label": "◀◀ 11:57 PM"},
    "p": {"pose": "sitting", "headBowed": True, "hood": True, "roomCam": True, **bed_mon("11:47 PM", monitorDoor=0.08),
          "shapeBehind": {"at": 0.4, "alpha": 0.7, "x": 580, "y": 1380, "h": 1000, "pose": "bendShush", "fade": 1.0}},
    "lines": [L("Remember when you shut your eyes?"), L("It stood beside you.", emph=["beside"]), L("Waiting for you to sleep too.", emph=["sleep"])],
    "sfx": [{"name": "whoosh_reverse", "at": 0.0, "gain": -8}, {"name": "breath_whisper", "at": "@beside", "gain": -12}]})
# 13: zum ersten Mal: Ton an
B.append(monitor("12:16 AM", "12:06 AM", [L("Downstairs, packing up, you finally unmute the monitor.", emph=["unmute"])],
    p={**SHUT, "cry": 0.0, "unmuteAt": "@unmute+0.3", "mutedPulse": "@unmute-0.6"}, trans="cut",
    sfx=[{"name": "light_click", "at": "@unmute+0.3", "gain": -2}, {"name": "baby_cry_monitor", "at": "@unmute+0.4", "gain": -12, "dur": 3.0}]))
# 14: aus dem Schrank, zehn Minuten alt (Quelle des Cold Opens)
B.append(monitor("12:16 AM", "12:06 AM", [L("From inside the closet,", emph=["closet"]), L("ten minutes ago:", emph=["ten"])],
    p={**SHUT, "muted": False, "cry": 0.0, "feedZoom": [1.3, 1.8], "feedFocus": [0.12, 0.45], "seamRing": "@inside", "waveform": 0.1, "slatEye": "@ten+0.5"}, trans="cut", post=0.3,
    sfx=[{"name": "baby_cry_monitor", "at": 0.0, "gain": -16, "dur": 3.5}, {"name": "breath_whisper", "at": "@ten+0.6", "gain": -10}]))
# 15: der letzte Satz
B.append({"scene": "sfx_text", "clock": "12:16 AM", "captionY": 1500, "capBox": True, "trans": "cut", "vignette": 0.95,
    "p": {"lines": ["SHHH.", "YOUR TURN."], "times": ["@shhh", "@your"], "y": 700, "size": 200, "bg": "nursery_pov",
          "bgP": {"dark": 0.9, "closetGap0": 0, "slatEye": -1, "nightlight": 0.3}},
    "lines": [L("Shhh.", voice="shape", hush=True, gain=-4.5), L("Your turn.", voice="shape", emph=["turn"])], "post": 0.8,
    "sfx": [{"name": "static_burst", "at": "@shhh-0.2", "gain": -18}, {"name": "sub_pulse", "at": "@turn+0.3", "gain": -2}]})
# 16
B.append({"scene": "end_card", "clock": "12:16 AM", "captionY": 1500, "capBox": True, "trans": "cut",
    "p": {"title": "DON'T WAKE HER", "kicker": "PART 5 · FINALE", "time": "12:16 AM", "pill": "THE END", "sub": "HOW LONG COULD YOU STAY AWAKE?|TELL ME IN THE COMMENTS"},
    "lines": [L("How long could you stay awake?", emph=["awake"]), L("Tell me in the comments.")], "post": 1.0, "endEyes": "@comments+0.6",
    "sfx": [{"name": "impact_boom", "at": 0.0, "gain": -6}, {"name": "breath_whisper", "at": "@comments+0.6", "gain": -10}]})

story = base(5, "THE END")
story["tail"] = 1.6
story["beats"] = B
story["coldOpen"] = {"beat": 15, "words": "From inside the closet,", "label": "LATER"}  # Teaser vorneweg, harter Schnitt
story["beds"] = [
    {"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4},
    {"name": "house_ambience", "from": 0, "to": 200, "gain": 10, "fade": 0.5},
    {"name": "dark_pad_tension", "fromBeat": 0, "toBeat": 5, "gain": -3, "fade": 1.0},
    {"name": "music_box_lullaby", "fromBeat": 8, "toBeat": 11, "gain": -4, "fade": 1.2},
    {"name": "whisper_texture", "fromBeat": 12, "toBeat": 15, "gain": -5, "fade": 0.8}]
save(story, sys.argv[1] + "/en/dwh_part5.json")
print("ok", len(B), "beats,", sum(len(l["text"].split()) for b in B for l in b["lines"]), "words")
