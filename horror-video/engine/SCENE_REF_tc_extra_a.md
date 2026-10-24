# Extra scenes A (scenes/tc_extra_a.js)

Five true-crime scenes for "YOU ARE BTK": `library_stacks`, `parking_lot` (4 modes), `classified_ad` (3 modes), `interview_room`, `profile_silhouette`.

- All times are **local seconds from beat start** (numbers). Every param is optional: `p: {}` renders a complete, good-looking default.
- Timed params accept a number, `{at: n}`, `true` (= default time) or `false` (= off), unless noted.
- **Short beats:** where a scene has a default *sequence* (library, classified pile/glow/reveal), the default times are compressed automatically when the beat is shorter than the sequence. Times you set yourself are never changed.
- Key content stays inside x 140..940 / y 300..1380. Backgrounds fill -200..W+200, so zoom up to 1.12 and shakes are safe. On-screen dates/labels sit at y ≈ 1265–1345, so captions work best at `captionY: 1500, capBox: true`.
- Silhouettes only, no faces, no real logos/mastheads. Years (19xx/20xx) in typed dates turn red automatically.
- Static layers are cached (1–3 full layers per scene). Measured in the shared test box: about 15–30 ms per frame in sequence; the first frame of a beat builds the caches (60–400 ms, once).

---

## library_stacks
Tall library shelves at night in strong perspective (rows of unreadable spines with library call-number stickers, a moonlit window at the end of the aisle). A flashlight spot sweeps along the spines inside a soft volumetric cone with dust; the lit area shows the real colours. One thick book sticks out of the shelf; from `target.at` the edge of a folded letter between its pages glows red. Then a typed date and a small location label.

| param | type | default | meaning |
|---|---|---|---|
| `label` | string \| `{s, at}` \| `""`/`false` | `"WICHITA PUBLIC LIBRARY"` at 0.3 | small letter-spaced label (Space Mono), types fast, red underline + blinking red dot |
| `labelY` | number | `1345` | baseline of the label |
| `text` | string \| `{s, at}` \| `false` | `{s: "OCTOBER 1974", at: 4.0}` | big typewriter line (Special Elite ~86 px, years red, red cursor). A plain string uses the default time |
| `textY` | number | `1265` | baseline of the big line |
| `torch` | object \| `false` | see below | flashlight. `false` = no light (dark shelves, the red letter still glows) |
| `torch.x0, torch.y0` | number | `150`, target y − 150 | start of the spot (screen px) |
| `torch.x1, torch.y1` | number | target book x, target y − 10 | end of the spot |
| `torch.t0, torch.t1` | number | `0.2`, `3.0` | sweep time (eased, slight arc + hand jitter) |
| `torch.r` | number | `250` | spot radius (shrinks with depth) |
| `torch.on` | number | – | if set, the torch flickers on at this time (dark before) |
| `torch.sx, torch.sy` | number | `930`, `2150` | where the beam comes from (bottom right, off-screen) |
| `target` | object \| `false` | `{shelf: 3, x: 560, at: 3.3}` | the protruding book. `false` = no special book |
| `target.shelf` | 1..7 | `3` | shelf row (3 ≈ eye level / screen centre, 2 higher, 5 lower) |
| `target.x` | number | `560` | screen x of the book (80..860) |
| `target.at` | number \| `false` | `3.3` | when the letter edge starts to glow red (with a short flash and red bloom) |
| `dust` | bool | `true` | dust motes in the beam + faint ambient motes |

Default timeline: label 0.3 s, sweep 0.2–3.0 s, red letter 3.3 s, date types 4.0–4.8 s (all scaled down in beats under ~5.4 s).

```json
{"scene": "library_stacks", "p": {}}
{"scene": "library_stacks", "p": {"target": {"shelf": 2, "x": 420, "at": 1.0}, "torch": {"x0": 800, "y0": 1200, "t0": 0, "t1": 0.8}, "text": {"s": "NOVEMBER 1974", "at": 1.6}, "label": ""}}
```

---

## parking_lot
Big-box store parking lot at night under sodium lights (no logos; plain orange band on the store front, lit entrance, rows of parked cars, light poles with halos, drifting haze). Four modes.

Common params:

| param | type | default | meaning |
|---|---|---|---|
| `mode` | `"truck"`\|`"trash"`\|`"cctv"`\|`"driveway"` | `"truck"` | see below |
| `stamp` | string \| `{s, at}` \| `""`/`false` | `"JAN 2005"` in truck + trash, none in driveway, unused in cctv | typed date (Special Elite, year red) |
| `stampAt` | number | `0.3` | start time when `stamp` is a string |
| `stampY` | number | `1320` | baseline of the date |

### mode "truck"
Elevated view of a pickup truck with an open bed (3D, perspective), a trash can by the tailgate, a lamp cone behind the truck, and a pole security camera top right with a blinking red REC LED.

| param | type | default | meaning |
|---|---|---|---|
| `box` | `{at}` \| `false` | `{at: 0.4}` (if `owner` is not given) | a silhouette in a cap walks in from the left carrying a cereal box (no brand: red band + bowl), reaches over the side wall, sets it into the bed and walks away. Timeline from `at`: walk in 0–2.5 s, place 2.5–3.45 s, leave 3.45–5.8 s; the box gets a soft red outline from +3.6 s. `false` = empty truck, no person |
| `owner` | `{at}` | – | the truck owner walks in from the right, lifts the box out, looks at it, steps left and **tosses it into the trash can**, then walks to the cab. From `at`: walk 0–2.6, lift 2.6–3.7, step 3.7–4.3, toss 4.3–5.0, walk to cab 5.2–7.6 s. If `box` is not given, the box is already lying in the bed (with red outline) |
| `cam` | bool | `true` | pole camera with blinking red REC LED (top right) |
| `truckColor` | `[r,g,b]` | `[58,54,50]` | body colour of the truck |

### mode "trash"
Close-up from above into a ribbed trash can with a black liner and trash; a cereal box sticks out. Two flashlight beams from the sides search the can, then converge; two arms in dark sleeves with pale latex gloves come down, grip the box and lift it out.

| param | type | default | meaning |
|---|---|---|---|
| `trash` | number \| `{at}` \| `false` | `0.9` | hands descend `at`…+1.0, grip +0.95…+1.3, lift +1.3…+2.7 (box ends at y≈560, slight sway), red outline on the box from +2.6. `false` = only the flashlights searching |

### mode "cctv"
Grainy monochrome security-camera frame (soft low resolution, scanlines, noise, rolling bar, dark vignette): high view over rows of parked cars. A dark boxy SUV (early compact-SUV silhouette with roof rails) pulls out of its space and drives along the lane towards the lower left. The timestamp ticks with the beat.

| param | type | default | meaning |
|---|---|---|---|
| `ts` | string | `"01/2005 14:32:07"` | timestamp bottom left; a trailing `HH:MM:SS` counts up by whole seconds |
| `camLabel` | string | `"CAM 03"` | top right, with blinking red REC dot |
| `drive` | `{t0, t1}` | `{t0: 0.3, t1: 10}` | eased drive along the path (pull-out → lane → exits left at the very end). With the default the SUV is mid-frame around 4–6 s |
| `ring` | number \| `{at}` \| `false` | `2.0` | red hand-drawn marker ring around the SUV (follows it) |
| `label` | string | `"BLACK JEEP CHEROKEE"` | small dark plate with red border + leader line, types in 0.55 s after the ring (`""` hides). Placed above/below the ring inside the safe area |

### mode "driveway"
The same boxy SUV, side-on at ~40°, parked in the driveway of a small one-storey house at night (garage on the left with front gable, siding, dark windows, a dim porch light, a faint TV flicker in a window, bare tree, snow patches, sodium street light from the right, passing headlights sweep the house).

| param | type | default | meaning |
|---|---|---|---|
| `ring` | number \| `{at}` \| `false` | `1.5` | red marker ring around the SUV |
| `label` | string | `"BLACK JEEP CHEROKEE"` | plate after the ring (`""` hides) |
| `sweep` | bool | `true` | headlights of a passing car sweep across the house every 9 s |

```json
{"scene": "parking_lot", "p": {"mode": "truck"}}
{"scene": "parking_lot", "p": {"mode": "truck", "owner": {"at": 0.2}, "stamp": ""}}
{"scene": "parking_lot", "p": {"mode": "trash", "trash": 0.6, "stamp": {"s": "JAN 2005", "at": 2.5}}}
{"scene": "parking_lot", "p": {"mode": "cctv", "ring": 1.6, "ts": "01/2005 14:32:07"}}
{"scene": "parking_lot", "p": {"mode": "driveway", "ring": 0.8, "stamp": "FEB 2005"}}
```

---

## classified_ad
Generic newspaper classifieds (no masthead): black header strip, six columns of tiny ad boxes with out-of-focus text, category heads (PERSONALS, WANTED …). Three modes.

| param | type | default | meaning |
|---|---|---|---|
| `mode` | `"glow"`\|`"pile"`\|`"reveal"` | `"glow"` | see below |
| `title` | string | `"CLASSIFIEDS"` | header strip text (glow + reveal) |

### mode "glow"
The whole page on a dark desk under a lamp; one small ad box (under PERSONALS, centre of the page) starts to glow red and the light gathers on it. Still unreadable.

| param | type | default | meaning |
|---|---|---|---|
| `at` | number \| `false` | `1.2` | the box starts to glow (0.8 s fade, then pulses) |
| `y` | number | `945` | page centre y (header stays below the HUD) |
| `tilt` | number | `-0.018` | page rotation (rad) |

### mode "reveal"
Close-up on that ad box (same page, ~4.7× zoom, neighbouring ads stay blurred). The blur in the box fades, the ad text types in a typewriter font, then a red marker circle closes around it.

| param | type | default | meaning |
|---|---|---|---|
| `text` | string | `"Rex, it will be ok"` | typed exactly as given (wraps to max 3 lines, font auto-fits) |
| `at` | number \| `false` | `0.6` | unblur + typing start (`false` = stays blurred and glowing) |
| `speed` | number | `15` | chars per second |
| `ringAt` | number \| `false` | end of typing + 0.45 | red marker circle draws around the box (0.6 s) |
| `y` | number | `820` | screen y of the box centre |

### mode "pile"
Top-down desk: a stack of blurred classified-ad order forms. An envelope (address blurred, red edge) drops onto the stack, then with every tick of a small day counter another form slides in on top until only a red-glowing corner of the envelope is visible. Then a big red word.

| param | type | default | meaning |
|---|---|---|---|
| `counter` | object | `{from: 1, to: 9, t0: 1.0, t1: 5.0, label: "DAYS"}` | counter top centre (red framed box + label; label drops its final S at 1 → "1 DAY"). Each step lands one form (max 14). `from > to` counts down |
| `at` | number | `min(0.3, t0 − 0.6)` | envelope drop (0.5 s) |
| `text` | string | `"UNNOTICED"` | big red glowing Anton word, punches in (`""` hides) |
| `textAt` | number \| `false` | `t1 + 0.5` | when the word appears |
| `textY` | number | `1290` | word centre y |

```json
{"scene": "classified_ad", "p": {"mode": "pile"}}
{"scene": "classified_ad", "p": {"mode": "glow", "at": 0.8}}
{"scene": "classified_ad", "p": {"mode": "reveal", "text": "Rex, it will be ok", "at": 0.4, "ringAt": 2.2}}
```

---

## interview_room
Bare police interview room, frontal: cinder-block back wall, concrete floor, a one-way mirror (dark glass, slow sheen, faint lamp reflection), a wall camera top right with blinking red LED, a metal table in the middle. One hanging lamp sways very slightly; its cold cone and dust light the table. Two faceless seated silhouettes face each other across the table in profile (rim-lit, breathing).

| param | type | default | meaning |
|---|---|---|---|
| `lamp` | bool | `true` | hanging lamp, light cone, dust (off = darker room) |
| `table` | bool | `true` | metal table with legs + cuff ring |
| `mirror` | bool | `true` | one-way mirror on the back wall |
| `figures` | 0 \| 1 \| 2 | `2` | 1 = only the left figure (the chair opposite stays empty), 0 = empty room without chairs |
| `cam` | bool | `true` | wall camera with red LED |
| `word` | string \| `{s, at, speed}` \| `false` | `{s: "CONFESSION", at: 1.0, speed: 12}` | big white typed word between the two heads (auto-fits 520 px) |
| `wordY` | number | `905` | baseline of the word |
| `object` | `{kind: "floppy", at}` \| `true` | none | a purple 3.5-inch floppy (label + metal shutter) is set down: with 2 figures the right figure's hand pushes it across the table (`at`…+0.7) and pulls back (+1.0…+1.6); otherwise it drops onto the table. `true` = at 1.5 |

```json
{"scene": "interview_room", "p": {}}
{"scene": "interview_room", "p": {"word": false, "object": {"kind": "floppy", "at": 0.6}}}
```

---

## profile_silhouette
A man's head and shoulders in profile in total darkness (generic smooth outline, no features), breathing slowly. Light only as a rim on the contour plus a faint wrap of light on the face area. Optional thin glasses frame, a thin red line of light where the eyes would be, a blurred newspaper held in the foreground.

| param | type | default | meaning |
|---|---|---|---|
| `glow` | `"newsprint"`\|`"lamp"`\|`"none"` | `"newsprint"` | newsprint = cold light from the paper below/front (rim on chin, nose, front); lamp = warm light from the front at eye level; none = faint cold back rim only (`false` = none) |
| `eyeLine` | number \| `false` | `1.4` | thin red glowing line at eye height grows outwards (0.45 s), then pulses |
| `paper` | bool | `true` | out-of-focus newspaper in the foreground (bottom right) with three fingertips over its top edge |
| `glasses` | bool | `false` | glasses frame outline (front of lens + temple arm) catching the light |
| `glitch` | number \| number[] | none | 0.5 s glitch at each time: red/blue edge fringes + displaced horizontal slices, eye line flares |
| `side` | `"right"`\|`"left"` | `"right"` | direction the profile faces (left = mirrored) |

```json
{"scene": "profile_silhouette", "p": {"glasses": true}}
{"scene": "profile_silhouette", "p": {"glow": "lamp", "side": "left", "paper": false, "glasses": true, "eyeLine": 0.8, "glitch": 2.2}}
```

---

### Testing
Specs and contact sheets: `stills/tc_extra_a/spec_*.json` → `run_*/sheet.jpg` (showcase: `run_9`). `p._perf: true` logs the scene's render time per frame to the console (shows up as `CONSOLE PERF …` in `scene_still.py`).
