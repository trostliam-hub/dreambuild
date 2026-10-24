# Scene reference — `scenes/tc_places.js` (exteriors at night)

Four night-time exterior scenes for the true-crime shorts: `house_ext`, `church_ext`, `phone_booth`, `police_lights`.
All are dark, desaturated blue/grey with warm windows and red accents. People are always faceless silhouettes.

General rules:

- **Times** (`at`, `on`, `off`, `open`, `police`, `tape`, `receiver`, `arrest`, `move[0..1]`, …) are **local seconds** from the
  start of the beat. In `story.json` you can also use `"@word"` / `"@word+0.3"`, as with every other scene. `true` counts as `0`.
- **Positions**: `x` is a fraction of the width (0 = left edge, 1 = right edge). `y` and `h` are fractions of the height (1920 px).
- Every scene works with `p = {}` and looks right at any `lt`. Something always moves: drifting clouds, lamp flicker, rain/snow,
  strobes, tree sway, and the light breathing.
- Key content sits inside x 140–940 and y 300–1380. The lower third (y ≥ 1450) is mostly wet street or parking lot, so captions
  at the default `captionY` or ~1550 with `capBox: true` read well. Everything is drawn out to −200…W+200, so zoom up to 1.12
  plus shake still fills the frame.
- Performance: about 25–40 ms per frame on the render box. Static layers are cached and light is drawn at quarter resolution.
  Debug: `p._perf: true` logs the scene's draw time with `console.error`.

---

## 1) `house_ext` — family house at night, street lamp, lawn, sidewalk

A 1970s Kansas house seen from across the street. Sky with drifting clouds and a moon, a bare tree, a utility pole with a
flickering cobra-head street lamp (cold light cone, long shadows), lawn, sidewalk, curb and a wet street.

| param | type | default | meaning |
|---|---|---|---|
| `style` | `"ranch"` \| `"suburb"` \| `"twostory"` | `"ranch"` | `ranch`: long one-storey brick/siding house with an attached garage. `suburb`: 1.5-storey Cape Cod with two dormers. `twostory`: two-storey house with a front gable and a porch. |
| `label` | string | `""` | House number on a plate beside the door, lit by the porch light (e.g. `"803"`). Empty = no plate. |
| `windows` | array of `{i, on, off, red, tv, pass, dim}` | ranch `[2, 0]`, suburb `[3, 1]`, twostory `[2, 4]` lit warm | If set, **only** the listed windows are lit. `i`: window index (see below). `on`: time the light switches on (short flicker); `null`/missing = lit from the start. `off`: time it goes dark (snaps off in 0.07 s). `red: true`: red glow instead of warm. `tv: true`: flickering blue TV light. `pass: t`: a dark silhouette passes behind the curtain at t (1.7 s). `dim`: brightness 0..1 (default 1). `windows: []` = all windows dark. |
| `figure` | object or `true` | none | A dark silhouette on the lawn or sidewalk (long coat, no face), with a cold rim from the lamp and a red/blue rim while `police` is on. It casts a long shadow from the street lamp, plus one toward the camera from the porch light. Fields below. |
| `figure.x` | 0..1 | `.5` | Horizontal position of the feet. |
| `figure.y` | 0..1 | `.665` | Feet height (≈1277 px, on the lawn near the sidewalk; `.69` = on the sidewalk). |
| `figure.h` | 0..1 | `.125` | Body height as a fraction of 1920 (≈240 px). |
| `figure.at` / `figure.until` | t | `0` / none | Fades in at `at` and out after `until` (`fade`, default .35 s). |
| `figure.pose` | `"stand"` \| `"walk"` | `"stand"` | `walk` without `move` drifts slowly at `speed` (default .03 width/s) with a walk cycle. |
| `figure.move` | `[t0, t1, toX]` | none | Walks from `x` to `toX` between t0 and t1 (eased; the legs animate, it faces the direction of travel). |
| `figure.flip` | bool | `false` | Faces left (when it isn't moving). |
| `figure.hat` | `"brim"` \| `"cap"` \| `"hood"` | none | Optional fedora, cap or hood. |
| `figure.coat` | `"long"` \| `"short"` \| `"none"` | `"long"` | Coat length. |
| `figure.arms` | `"down"` \| `"pockets"` \| `"reach"` \| `"phone"` \| `"behind"` | `"down"` (`"swing"` while walking) | Arm pose. |
| `car` | object or `true` | none | A dark 1970s sedan on the street in front of the house (wheels at y≈1425). |
| `car.at` | t | none = parked from the start | Drives in from the side and brakes to a stop (red brake lights) over `dur` (default 2.6 s). |
| `car.x` | 0..1 | `.62` | Where it stops (centre of the car). |
| `car.from` | `"right"` \| `"left"` | `"right"` | Side it enters from (it faces the direction of travel). |
| `car.headlights` | bool | `true` | Headlight beams along the street. |
| `car.leave` | t | none | Drives away from t. |
| `door` | `{open, dur, light, ajar}` or number | closed | `open: t`: the front door swings open over `dur` (1.4 s). `light`: `"dark"` (black void, default), `"warm"` or `"red"` light from inside. `ajar: 0..1`: opened that far from the start. A number = `open`. |
| `porch` | bool | `true` | Small warm porch light by the door (it also lights the house-number plate). |
| `porchOff` | t | none | The porch light goes out at t. |
| `snow` | bool | `false` | Snow on the roof, lawn, bushes, branches, mailbox and lamp, plus falling snow. |
| `rain` | bool | `false` | Rain streaks (brighter inside the lamp cone), splashes and stronger street reflections; no moon. |
| `tree` | bool | `true` | Large bare tree on the left (sways slightly). |
| `lamp` | bool | `true` | Utility pole, wires and street lamp with a cone and flicker. `false` = no lamp light at all (very dark). |
| `police` | t | none | From t, red/blue strobes (from a cruiser off-screen in front) wash the house, the dark windows and the street. |
| `tape` | t | none | From t, two strips of yellow "POLICE LINE · DO NOT CROSS" tape stretch across the foreground (y≈1200–1320) and flutter. |
| `dolly` | `[t0, t1, scale]` | none | Slow push-in toward the door/window area (ranch 560/1010, suburb 560/990, twostory 540/940) on top of the beat zoom. |
| `neighbors` | bool | `true` | Dim neighbour houses at the frame edges (best seen with `suburb`/`twostory`). |
| `dark` | 0..1 | `0` | Extra darkness over the scene; lamps, windows and strobes stay bright. |

**Window indices** (left → right, top → bottom):

- `ranch`: `0` left bedroom, `1` middle bedroom, `2` large picture window (living room, left of the door).
- `suburb`: `0` left dormer, `1` right dormer (upstairs), `2` ground floor left, `3` ground floor middle, `4` ground floor right of the door.
- `twostory`: `0` small attic window in the gable, `1`/`2`/`3` upstairs left/middle/right, `4` downstairs left, `5` downstairs right.

Examples:

```json
{"scene": "house_ext", "dur": 6, "zoom": [1, 1.06],
 "p": {"label": "803", "windows": [{"i": 2, "off": 3.0}, {"i": 0, "tv": true}, {"i": 1, "on": 4.2, "red": true}],
       "figure": {"x": 0.18, "move": [0.3, 5.5, 0.62], "pose": "walk"}, "door": {"open": 4.5}, "dolly": [0, 6, 1.12]}}
```
```json
{"scene": "house_ext", "dur": 5, "p": {"label": "803", "car": {"at": 0.2, "x": 0.6}, "police": 1.8, "tape": 2.6, "rain": true}}
```
```json
{"scene": "house_ext", "p": {"style": "twostory", "snow": true, "label": "1214", "figure": {"x": 0.5, "y": 0.68, "h": 0.14},
                             "windows": [{"i": 0, "red": true}, {"i": 2}, {"i": 4, "pass": 1.0}]}}
```

---

## 2) `church_ext` — small brick church, sign, parking lot

A brick church with a steeple and cross on the left, a gable front with a rose window, a pointed-arch door and lancet windows,
and a flat-roofed parish hall on the right. A monument sign stands in front (white letters on a dark panel, lit from below),
over a parking lot with painted stalls and a tall lot lamp on the right.

| param | type | default | meaning |
|---|---|---|---|
| `label` | string | `"CHRIST LUTHERAN CHURCH"` | Sign text. It is upper-cased, split into two lines if long, and sized to fit (≈56 px Oswald). |
| `sub` | string | `""` | Small second line on the sign under a thin red rule (e.g. `"SUNDAY SERVICE 10:45"`). |
| `lit` | bool | `true` | One warm stained-glass lancet window (right of the door) glows and spills light onto the lawn. |
| `cross` | bool | `true` | Cross on the steeple with a faint pulsing red halo. |
| `lamp` | bool | `true` | Parking-lot lamp with a cold cone and flicker. |
| `snow` | bool | `false` | Snow on the roofs, spire, ground, sign, bushes and trees, plus falling snow. |
| `rain` | bool | `false` | Rain streaks and splashes. |
| `figure` | object | none | Same fields as in `house_ext` (`x`, `y`, `h`, `at`, `until`, `fade`, `pose`, `move`, `flip`, `hat`, `coat`, `arms`). Defaults: `x .74, y .74, h .16`, standing in the lamp light on the lot. |
| `car` | object or `true` | none | Same fields as in `house_ext` (`at`, `x`, `from`, `dur`, `leave`, `headlights`). Defaults: `x .66`, enters from the right; wheels at y≈1500, in front of the sign's base. |
| `dark` | 0..1 | `0` | Extra darkness. |

Examples:

```json
{"scene": "church_ext", "dur": 5, "p": {"snow": true, "figure": {"x": 0.9, "move": [0.5, 4.5, 0.7]}, "car": {"at": 0.3}, "sub": "SUNDAY SERVICE 10:45"}}
```
```json
{"scene": "church_ext", "p": {"lit": false, "dark": 0.3, "figure": {"x": 0.72, "hat": "brim"}}}
```

---

## 3) `phone_booth` — 1970s glass phone booth on a rainy corner

An aluminium-and-glass booth (x 330–750, y 406–1350) with a glowing "PHONE" light box, a flickering fluorescent tube inside,
a payphone with a hanging handset and armoured cord, and a phone-book shelf. Rain runs down the glass. The silhouette stands
inside, backlit. Around it: a dark street corner with a brick storefront, a red traffic light (the red accent, reflected in
the street), a wet sidewalk, a mirrored reflection of the booth in the pavement with ripples, heavy rain and splashes.

| param | type | default | meaning |
|---|---|---|---|
| `figure` | object \| `false` | `{}` (present) | Silhouette in a long coat inside the booth, in profile facing the phone. `false` = empty booth. |
| `figure.at` | t | `0` | Appears at t, hidden by a burst of flicker from the tube. |
| `figure.hold` | bool | `false` | Already holding the receiver to its ear (the handset shows a thin rim; the cord runs up to the head). |
| `figure.hat` | `"brim"` \| `"cap"` \| `"hood"` | none | `"brim"` gives a noir fedora look. |
| `figure.x` / `figure.h` | 0..1 | `.43` / `.32` | Position and height (the defaults fit the booth). |
| `figure.arms` | string | `"down"` | Arm pose when not on the phone (see `house_ext`). |
| `receiver` | t | none | From t the figure reaches for the handset (0.5 s), then lifts it to its head (0.7 s) and nods slightly while listening. |
| `at` | t | none = light on | The booth light (tube and light box) is off until t, then sputters on over 0.7 s. |
| `flicker` | bool | `true` | Irregular fluorescent stutter. `false` = steady light. |
| `rain` | bool | `true` | Rain, splashes on the sidewalk, street and booth roof. The ground stays wet either way. |
| `street` | string | `""` | Green street sign on a pole to the right of the booth (e.g. `"W 13TH ST"`). Empty = no sign. |
| `sign` | string | `"PHONE"` | Text on the light box. |

Examples:

```json
{"scene": "phone_booth", "dur": 5, "zoom": [1.02, 1.1], "p": {"at": 0.4, "figure": {"at": 1.2}, "receiver": 2.2, "street": "W 13TH ST"}}
```
```json
{"scene": "phone_booth", "p": {"figure": {"hold": true, "hat": "brim"}, "street": "OLIVER ST"}}
```

---

## 4) `police_lights` — arrest at night, squad cars, red/blue light bars

A wet street at night in front of a two-storey house. A squad car stands side-on in the foreground (light-grey doors with
"POLICE", headlights on, a red/blue light bar), with more cruisers behind it on the left and right. Strobe light washes the
house, the street (long wet reflections) and the air (rotating beams). Officer silhouettes in peaked caps aim flashlight
beams. In the centre, the arrested man stands with his back to the camera against the lit driver's door, hands cuffed behind
his back (a small glint of metal), and an officer holds his shoulder and elbow.

| param | type | default | meaning |
|---|---|---|---|
| `arrest` | t \| `false` | already arrested | Before t the suspect stands with his hands raised. Over 0.75 s from t he is pushed against the car, leans in, and his arms go behind his back (cuffs appear), with a small struggle afterwards. Missing = cuffed from the start. `false` = no suspect (the holding officer aims a flashlight instead). |
| `cars` | 0..3 | `2` | 1 = main car only, 2 = plus a car back left, 3 = plus a car back right. Each light bar flashes out of phase. |
| `officers` | 0..4 | `3` | 1st holds the suspect, 2nd (right) and 3rd (left) aim flashlights at him, 4th (back right, small) shines a light at the house. |
| `flashlights` | bool | `true` | Flashlight beams and lamp glints. `false` = officers with their arms down. |
| `house` | bool | `true` | House in the background with one warm upstairs window and a porch light. `false` = trees only. |
| `street` | bool | `true` | Kerb, lane markings and the long red/blue reflections on the wet asphalt. |
| `rain` | bool | `false` | Rain streaks and splashes tinted by the strobes. |
| `text` | `{s, at, cps, y, size}` or string | none | Typewriter date line (Special Elite font) at the top of the frame with a red cursor, a dark backing band and a red underline once typed. `at` start (default .4), `cps` characters per second (16), `y` baseline (430, just below the HUD), `size` px (54). |

Examples:

```json
{"scene": "police_lights", "dur": 5, "zoom": [1, 1.06], "p": {"arrest": 1.2, "rain": true, "cars": 3, "officers": 4, "text": {"s": "FEBRUARY 25, 2005", "at": 2.4}}}
```
```json
{"scene": "police_lights", "p": {"text": "FEBRUARY 25, 2005"}}
```
