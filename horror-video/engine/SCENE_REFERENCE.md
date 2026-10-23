# story.json reference (horror short engine)

A story file drives `tools/build.py` (voice, timing, captions, audio mix) and `engine.js` (visuals).
Canvas is 1080×1920. Screen coordinates: x 0..1080, y 0..1920. Keep important things inside x 140..940 and y 260..1600
(TikTok UI covers the right rail and the bottom ~300 px). The HUD (series label, clock, place) sits top-left at y≈90–300.

## Top level

```json
{
 "lang": "en",                       // "en" or "de" — ASR language + caption chunk rules
 "series": "PART 1",                 // HUD label
 "place": "APT 4B",                  // HUD small line
 "ui": {"now": "now", "message": "iMessage", "date": "Friday, October 23", "typing": "Mom is typing", "sender": "Unknown",
        "kicker": "FROM: MOM", "pill": "FOLLOW FOR PART 2", "title": "WHO DO YOU TRUST?", "optA": "OPTION A", "optB": "OPTION B", "end": "PART 2"},
 "voices": { "narrator": {"engine": "kokoro", "sid": 17, "deep": 0.97, "style": "narrator", "speed": 0.92}, ... },
 "lead": 0.5, "tail": 2.1, "lineGap": 0.22, "beatGap": 0.1, "duckDb": 7, "capMaxPx": 860,
 "beds": [ {"name": "drone_bed", "from": 0, "to": 200, "gain": 2, "fade": 0.4},
           {"name": "heartbeat_loop", "fromBeat": 6, "toBeat": 7, "gain": -5, "fade": 0.6} ],
 "beats": [ ... ]
}
```

Voices available in English stories (already configured names you may use in `lines[].voice`):
`narrator` (deep male), `you` (narrator voice, drier — for the protagonist's own spoken lines), `mom_door` (soft whispery female + reverb, the thing at the door),
`mom_hall` (sleepy female, dry — the mom in the hallway), `entity` (whispery, more reverb, for an unknown voice).

## Beat

```json
{
 "scene": "peephole",                // scene type (below)
 "clock": "03:14",                   // HUD clock (monotonic within a part)
 "clockRed": true,                   // red glowing clock for climax beats
 "zoom": [1.0, 1.1],                 // camera scale from beat start to end (eased)
 "focus": [540, 900],                // zoom anchor (screen coords). Keep zoom ≤ 1.2 unless focus keeps HUD area clear
 "punch": ["@eye+0.1"],              // quick zoom punches at these local times
 "trans": "glitch" | "cut" | "fade", // transition INTO this beat (default glitch)
 "pre": 0.3,                         // silence before the first line of the beat (s)
 "post": 0.6,                        // extra silence after the last line
 "minDur": 1.4,
 "captionY": 1250,                   // caption baseline (default 1250). Use ~720 over empty upper areas
 "capBox": true,                     // dark box behind captions — use when the caption sits over white/bright art
 "noCaptions": true,                 // hide captions (when the on-screen art already shows the exact words)
 "p": { ...scene params... },
 "lines": [ {"text": "Imagine your mom texts you.", "voice": "narrator", "emph": ["mom"], "say": "optional pronunciation spelling", "gap": 0.22, "speed": 0.9, "gain": 0} ],
 "sfx": [ {"name": "phone_vibrate", "at": 0.0, "gain": -2}, {"name": "impact_hit_short", "at": "@door+0.4", "gain": -6}, {"name": "whoosh_reverse", "fromEnd": 1.5} ],
 "flash": [ {"at": "@eye", "d": 0.18, "c": "#ff2020", "a": 0.6} ],
 "glitch": [ {"at": "@eye", "d": 0.15} ]
}
```

Time references: any time value inside `p`, `sfx[].at`, `punch`, `flash`, `glitch` may be a number (seconds from beat start)
or a string `"@word"` / `"@word+0.4"` / `"@word-0.2"` = start time of that spoken word in THIS beat (lowercase, punctuation stripped,
first occurrence; apostrophes are removed: "I'm" → "@im"). The word MUST exist in this beat's lines or the build fails.
Each line is one TTS clip; `voice` changes the speaker. Put character speech in its own line with the character voice.
Keep a beat's narration to 1–3 short lines (≈2–7 s).

## Scenes and params (`p`)

- **phone_lock** — lock screen. `time` "3:12", `date`, `notifs: [{sender, text, at}]`, `buzz: [t,...]` (phone shakes).
- **phone_chat** — messenger. `name`, `initials`, `avatarColor` "#5a1316", `messages: [{side: "in"|"out", text, at, typing (time typing dots start), red: true (glowing bubble), kind: "photo"|"voice", photo: {kind:"sleeping"|"back"|"room_empty"|"window_face", stamp:"03:12"}, play, len}]`.
  Phone occupies y≈320–1480; put captions at `captionY: 720, capBox: true`.
- **bedroom** — `pose` "lying"|"sitting"|"standing", `listen` (head turned), `breath` (red breathing arcs through the left wall), `phoneGlow`, `buzz: [t]`, `lookPhone` (sitting, holding glowing phone), `tremble`, `eyesOpen` (lying), `shadowInDoor: t` (dark silhouette with glowing eyes fades in behind the bed), `windowRed`, `cityLit`.
- **building_facade** — `lit: {col 0-5, row 0-10, on, off, figure: true, pose}`, `others` (a few faint red windows).
- **street_lamp** — `on` (time lamp flickers on), `figure: {at, eyes (time eyes light), h}`.
- **door_inside** — front door from inside. `feet` (two foot shadows in the light gap), `feetAt`, `light` (false = no red light), `knocks: [t,...]` (door shakes), `rattle: [start, dur]` (handle rattles then stays down), `handle: t` (single push), `chain`, `peepLight` (red glow in peephole), `whisper: {text, at, dur, y}` (pale whispered text written letter by letter on the door, y≈1080).
- **peephole** — fisheye view into the stairwell. `figure`: "none"|"mama" (MOM-AT-THE-DOOR: bun, dark coat, too-wide toothy grin, staring eyes)|"stand" (dark silhouette)|"close" (huge dark silhouette)|"eye" (giant eye)|"dark" (covered); `mama`: "coat"; `smile` 0..1; `eyes` (silhouette eyes glow); `eyeAt: t` (switch to the giant eye at time t); `figureAt: t` (figure fades in); `lamp: "flicker"`; `hands: t` (her empty open palms glow red from t); `typing: t`, `typingText` (screen-space "X is typing…" banner at y≈1390); `number` "4B".
- **hallway** — corridor looking toward the front of the apartment. `flicker` (ceiling light), `youBack` (back of your head in the foreground), `youTurn: t` (head turns), `lightBehind: t` (red light wedge spreads from behind you + your shadow — "a door opens behind you"), `sideDoor: t` (a right-hand door ahead opens with red light), `person: {kind: "gown"|"coat", at (-1 = visible immediately), h 640, y 1330, x 540, tilt, face: "wide"|"stare"|"yawn", smile}` (MOM-IN-THE-HALL is kind "gown": long hair, nightgown, blank face), `figure: {h0, h1, y1, eyes, at}` + `approach: [t0, t1]` (dark silhouette approaching from the end).
- **bathroom_mirror** — `front: "gown"` (person in the foreground, blank face), `frontX` 250, `reflMama: "gown"`, `reflX` 660 (reflection inside the mirror), `grinAt: t` (reflection's red smile grows from t), `reflection: "normal"|"grin"|"missing"|"late"` (stick-figure reflection when no reflMama), `behind: true, behindAt` (dark figure appears behind in the mirror), `fog`, `fogText: "LINE1\nLINE2"`, `fogTextAt`, `flicker`, `drip`, `noSink: true, noLamp: true` (a plain hallway mirror instead of a bathroom).
- **fridge_note** — handwritten note on the fridge. `title`, `titleSize`, `lines: [{text, at, dur (write-on duration), row (line slot), style: "other" (scratchy different handwriting, dark red), red: true, strike: t (crossed out at t), size}]`, `tilt`, `flicker`. Note occupies y≈390–1250 — use `captionY: 1460, capBox: true` or `noCaptions` when the note shows the exact narrated words. Long lines wrap automatically (each row slot is 88 px; a wrapped line uses 2 slots, so give the next line `row` +2).
- **rule_card** — `label` "RULE #3", `text`, `hl: ["WORD"]` (red words), `icon` "eye"|"door"|"mirror"|"phone"|"note"|"light"|"lips", `strike: t`, `sub`.
- **face_closeup** — your scared face. `mood` "shock", `dart: true` (eyes dart left/right with red light alternating). Use `capBox: true` (white face behind captions).
- **sfx_text** — huge glowing words. `lines: ["KNOCK.", ...]`, `times: [t,...]`, `xs: [x,...]`, `y` 520, `size` 200, `bg`: another scene name drawn dimmed behind (e.g. "door_inside"), `bgP`: its params.
- **photo_reveal** — `kind` "sleeping"|"back"|"room_empty"|"window_face", `stamp` "TODAY 03:12", `caption`, `rec` (REC dot).
- **choice_split** — `title`, `kicker`, `a` and `b` (use "|" to force a line break: "MOM|AT THE DOOR"), `subA`, `subB`, `iconA`/`iconB`: "mama_coat"|"mama_gown"|"door"|"mirror"|"phone"|"note"|"eye". Usually `noCaptions: true`.
- **end_card** — `title` "PART 2", `kicker` "FROM: MOM", `time` "03:33", `pill` "FOLLOW FOR PART 3", `sub` "A OR B?|TELL ME IN THE COMMENTS". Use `noCaptions: true`.

## Sound effects (`sfx[].name`, files in video/sfx)

Hits/transitions: impact_boom, impact_hit_short, stinger_violin_screech, low_piano_hit, whoosh, whoosh_reverse, tension_riser_4s, tension_riser_8s, static_burst, static_long, glitch via `glitch`.
Foley: knock_single, knock_triple, knock_heavy, door_handle, door_creak, footsteps_approach, light_click, lamp_buzz, drip, camera_shutter, phone_vibrate, phone_ping, radio_static_voice, breath_whisper.
Body/tension: heartbeat_loop, heartbeat_fast, heartbeat_slow_muffled, sub_pulse, tinnitus_ring.
Beds (use in top-level `beds`, loopable): drone_bed, house_ambience, dark_pad_tension, whisper_texture, music_box_lullaby, music_box_slow_detuned, heartbeat_loop, heartbeat_fast, heartbeat_slow_muffled.
Rule: never put a loud hit (boom/hit/screech/knock) on top of an important spoken word — place it in a pause (`@word+0.5`, or use `pre`/`gap` to make room). Typical gains: hits -3..-8, foley -2..-8, tinnitus -12..-14, beds -4..+2.

## Additional features (added for parts 2/3)

- **phone_chat**: `headerSub` (small line under the contact name, e.g. "No number"), `headerSubRed: true`;
  message `kind: "stamp"` = centered small divider text (e.g. `{"kind":"stamp","text":"Yesterday 3:11 AM","at":0,"red":true}`);
  outgoing voice message: `{"side":"out","kind":"voice","text":"0:09","at":..,"play":"@play","len":3}` (waveform fills red while playing).
- **fridge_note** lines: `wet: true` → red ink drips run down from that line after it is written.
- **bathroom_mirror**: `front: "you"` (YOU seen from behind in the foreground, white stick figure), `wave: t` (you wave from t),
  `reflection: "missing"` (no reflection in the mirror — use with front "you"), `ghostGrin: t` (a red-glowing toothy grin with no face floats in the mirror where your face should be),
  `reflX` sets where the grin/reflection sits (default 540; use ~660 when someone stands at the left).
- **hallway** person: `flinch: t` (she recoils away to the side and raises her hands), `flinchDx` (px, default 160).
- **Beat flag** `flashback: true` + `flashLabel: "NIGHT 1"` → red monochrome flashback look with a label (use to re-show a Part 1 moment).
- **end_card**: `title` can be any short text ("PART 3", "THE END?"), `sub` uses "|" for two lines.
- **bathroom_mirror** `grinX`, `grinY`: position of the floating `ghostGrin` (default: reflX / reflection head height ≈ 756). In Part 1 put the grin
  next to Mom's reflection (e.g. reflX 560 for her reflection, grinX 790, grinY 760) — that is where YOUR reflection should be (set-up for the Part 3 twist).
- **bathroom_mirror** `reflBack: true` → Mom's reflection shows the BACK of her head (hair, no face) — physically right when she stands
  between you and the mirror. `reflH` (size, default 760), `reflY` (feet y, default 1410), `reflFace` ("wide"|"stare"|"yawn").
  `front` + `reflMama` can be combined with `front: "you"` (you from behind + Mom reflected somewhere in the mirror).

## Camera-feed scenes (scenes/feeds.js)

- **monitor_screen** — one grainy camera feed (REC dot, running timestamp, label). `device`: "baby" (white baby-monitor handset) | "tablet" | "none" (full screen);
  `room`: "nursery" (crib, mobile, window) | "bedroom" (`sleeper: true` = someone asleep in the bed) | "living" | "corridor" | "stairs" | "entrance" | "parking" | "aisle";
  `label` "NURSERY CAM", `stamp` "03:12:00" (counts up with the beat), `figure` or `figures: [{kind: "shade"|"pale"|"child", x 0..1, y 0..1 (feet), h 0..1, at, fade, eyes (time eyes glow, shade only), face: "stare"|"wide", smile, pose, alpha}]`,
  `static: t` / `staticEnd` / `staticText` (signal loss), `feedZoom: [1, 1.6]` + `feedFocus: [x, y]` (zoom inside the feed), `red: true` (red tint), `rocking` (crib rocks), `signal` 0-5.
- **cctv_grid** — 2×2 security feeds. `feeds: [{room, label, figure|figures, dead: t, deadEnd, deadText, alert: t (red frame), stamp}] ×4`, `stamp`, `title` "SECURITY — LIVE",
  `focus: {feed: 0-3, at, dur}` (that feed grows to full screen).
- monitor_screen / cctv feeds (babysit.js): `door` 0..1 / `doorSwing [t0,t1,from,to]` = left element with black gap; `doorStyle: "closet"` = slatted closet door;
  `gapEyes: [t0,t1]` (dim red eyes in the gap), `doorHand: t`; `entry` 0..1 / `entrySwing [t0,t1,from,to]` = nursery entrance door at the right edge, `entryHand: t`, `hallLight`;
  `nightlight`, `clean: true` (no grain), `hud: false` (no REC/label/stamp), `muted`, `mutedPulse`, `stampRing: t`, `camDot`, `scale` (device size, default .8), `top`.
  Feed figure kinds: `"shape"` {pose: stand|bend|finger|hunch|walk, fromPose, poseAt, poseDur, turn (time head turns to camera), eyes (time), move [t0,t1,toX], until, flip, alpha},
  `"you"` {pose: stand|wave|sit, waveAt, waveDur, move [t0,t1,toX], flip, phone}.
- bedroom: `monitorOnStand`, `hood`, `shapeBehind: {at, alpha, x, y, h, pose, flip, eyes}`.
- Beat overlays: `pops: [{text, at, x, y, size, dur, rot}]` (small red words like "CREAK"), `hudRing: t` (red ring around the top-left clock),
  `card: {at, until, kind: "nursery_you"|"grid4", stamp, x, y, w, h, rot, caption}` (a photo card pops up).
- phone_chat photo kinds: `grid4` (parents' 4-camera screenshot), `nursery_you` (you by the crib); choice_split icons `feed_empty`, `feed_shape`.
