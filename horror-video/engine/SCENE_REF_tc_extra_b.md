# Hinterkaifeck extra scenes B (scenes/tc_extra_b.js)

Four scenes for "NONE LEADING OUT" (Hinterkaifeck, 1922): `torch_glare`, `engine_shed`, `school_desk`, `demolition`.
They match the look of `tc_farm.js`: snowy farm, blue night and lantern light, grey winter daylight, silhouettes only (no faces, no bodies, no weapons), and red used only for the rings and glows.

- All times are **local seconds from beat start** (numbers; `"@word"` references are resolved by build.py as usual). `true` for a time param means "from the start" (0).
- Every param is optional. `p: {}` gives a complete, moving scene.
- Key content stays inside x 140..940 / y 300..1380. Backgrounds fill −200..W+200, so zoom 0.92–1.25 and shakes are safe.
- Captions sit below the art (lower ~25 % of the frame is calm floor or snow). Use `captionY: 1500, capBox: true` for the lowest placement.
- Static art is cached per variant. The first frame of a beat builds the caches (about 60–120 ms); after that a frame costs roughly 20–35 ms in the render container, the same range as `barn` and `kitchen_old` measured in the same runs.

---

## torch_glare
Night, a narrow snowy road (cart ruts, snowbanks, fence with a gate gap, wayside cross, bare tree) beside the long farmhouse and barn. A walker in hat and long coat is seen from behind on the road. A hand-held torch snaps on **straight into the camera**: brief flicker and white flash, a blooming lens flare (core, anamorphic streak, star rays, ghost discs) and lit snowflakes. A black figure is silhouetted behind the light, and the walker throws a long shadow toward the camera, stops and shields his eyes. Then the beam **swings away** as a visible cone through the snow, and the light **bobs off toward the farmhouse**. Its spot sweeps over the snow and the house wall until the light dies.

| param | type | default | meaning |
|---|---|---|---|
| `on` | number \| `true` \| `false` | `1.0` | when the torch snaps on. `false` = no torch: the walker keeps walking, nobody there |
| `hold` | number | `1.0` | seconds the light stares into the camera before swinging (only used when `swing` is not given) |
| `swing` | number \| `false` | `on + hold` | when the beam swings away (0.95 s turn); the bearer starts walking `swing + 0.55`. `false` = keeps glaring forever |
| `pace` | number | `2.7` | walking speed (m/s) of the torch bearer toward the house door |
| `walker` | bool | `true` | walker silhouette in the foreground (head ≈ y 910, feet ≈ y 1395). `false` = the camera *is* the walker |
| `walkerZ` | number | `3.7` | walker distance in metres (smaller = bigger silhouette) |
| `farm` | bool | `true` | farmhouse and barn under one snowy roof, mid-distance right (x ≈ 570–1080, y ≈ 640–910) |
| `snow` | bool | `true` | falling snow; flakes light up in the glare and inside the beam |

Timeline (defaults): walker walks 0–1.1 s · snap 1.0 s (flicker 0.09 s, flash about 0.3 s) · walker raises his arm 1.2–1.6 s · swing 2.0–2.95 s · light walks off from 2.55 s · arm lowers 2.7–3.8 s · walker takes a few hesitant steps 4.5–7.5 s. The light fades when it reaches the house or 9–10 s after the swing. The torch sits at about (690, 940); the flare is strongest while it points at the camera.

```json
{"scene": "torch_glare", "p": {}}
{"scene": "torch_glare", "p": {"walker": false, "on": 0.4, "hold": 0.6, "pace": 3.2}, "zoom": [1.05, 1.12]}
```

---

## engine_shed
The small wooden motor shed beside the barn. A board wall carries a planked door with a Z-brace and an inside hasp with staple and padlock, a dusty window, a shelf of cans, a coil of rope and a round wall clock. A 1920s horizontal stationary engine stands on a concrete bed: cylinder with water hopper, valve gear and brass oiler, crank visible through a big spoked flywheel. A leather drive belt runs from the pulley through a slot in the side wall. A wooden tool tote and an oil can sit on the floor. A mechanic's silhouette (flat cap) bends over the cylinder head behind the engine, working a wrench. The room is drawn about 8 % closer around (580, 760); texts and the inset are not scaled.

| param | type | default | meaning |
|---|---|---|---|
| `light` | `"night"` \| `"day"` | `"night"` | night = swinging, flickering storm lantern beside the door, warm pool, dust motes, blue snow outside. day = grey daylight through board gaps and the window (light shafts with dust), lantern unlit |
| `dark` | number | `0.78` night / `0.5` day | darkness outside the light pools |
| `engine` | `true` \| `"bare"` \| `"cloth"` \| `false` | `true` (bare) | `"cloth"` = cylinder and hopper under a dusty draped tarp (flywheel, pulley and belt stay bare); `false` = no engine |
| `run` | number \| `true` | – | engine starts at t: the flywheel spins up over 2.5 s, belt stitching and the lacing clip travel, slight vibration, more dust |
| `toolbox` | bool | `true` | tool tote with wrench, hammer and chisel, and an oil can |
| `mechanic` | `true` \| `false` \| `{at, until}` | `true` (present from 0) | `at` fades him in (0.5 s), `until` fades him out. Ratchet and head motion, warm rim light. Redrawn after the lighting so he stays a black silhouette |
| `lock` | `false` \| `{}` \| `{forced: t \| true}` | `{}` (intact padlock) | `forced: t` = at t the staple tears out of the jamb (splinters fall), the hasp drops and swings out on the door with the padlock still locked through the staple; `true` = already hanging. While intact, the door opens at most a crack. **If `door` is set and `lock` is omitted, the lock is shown already forced** |
| `door` | number 0..1 \| `[t0, t1, from, to]` | `0` | door gap. The door swings inward (hinge left); the yard, the barn's board wall, the snow and falling flakes show outside; light spills in |
| `clock` | `false` \| `{t0, t1, hours, from}` | static at 9:00 | `from` = start time in hours (default `9`); with `t0` the hands spin forward `hours` (default `4.5`) between `t0` and `t1` (default `t0 + 3`), eased, with motion blur. Meanwhile the mechanic works in time-lapse (faster, flicking between two poses) and day-light shafts drift |
| `text` | string \| `{s, at, y, style}` | – | `s` default `"NOTHING TAKEN"`, `at` default `1`, `y` (baseline) default `1352`. `style: "type"` (default) = typewriter (Special Elite 84, blinking cursor) followed by a red underline; `"stamp"` = red rubber stamp (Anton) slams on with worn ink |
| `keyHook` | `{at, missing, hooks, until, y}` | – | inset card (old photo) slides in from the right at `at` (default `1.2`) over a dimmed scene: a key board on a limewashed wall with `hooks` (default `4`, 2–6) old bit keys. Hook `missing` (0-based from the left, default `1`) is empty, with a lighter key-shaped ghost, and gets a red ring 0.7 s after `at`. `until` slides it out; `y` = card centre (default `545`) |

Positions (scene coords before the 8 % scale): door x 70–310 / y 480–1150, padlock ≈ (300, 800), lantern ≈ (330, 560), clock (884, 430), flywheel centre (835, 1000) r 178, mechanic's head ≈ (455, 760).

```json
{"scene": "engine_shed", "p": {"lock": {"forced": 0.8}, "door": [1.2, 2.4, 0, 0.5], "clock": {"t0": 0.2, "t1": 2.4}, "text": {"s": "NOTHING TAKEN", "at": 2.8}}}
{"scene": "engine_shed", "p": {"light": "day", "mechanic": {"until": 1.5}, "keyHook": {"at": 1.8, "missing": 1}}}
{"scene": "engine_shed", "p": {"engine": "cloth", "mechanic": false, "text": {"s": "NOTHING TAKEN", "at": 0.6, "style": "stamp"}}}
```

---

## school_desk
A 1920s village classroom seen from the back, down the centre aisle. It has a limewashed room with wood panelling, tall windows on the left (grey sky, snowy roofs and a church tower), a crucifix, a wall map, an iron stove, a coat rack and two pendant lamps. The blackboard has erased chalk ghosts, and the teacher stands at the board in back view (suit, pointer). Rows of old bench-desks have curved side cheeks, backrests and inkwells. The children are seen from behind only: braids, bobs or short hair, rim-lit from the windows, breathing, some writing. One seat is empty, with a slate, slate pencil and a sponge on a string, and a pale light shaft falls on it.

| param | type | default | meaning |
|---|---|---|---|
| `rows` | 1..4 | `3` | rows of desks (row 0 = nearest the camera, larger rows further toward the board) |
| `empty` | `{row, col}` \| `false` | `{row: 1, col: 1}` | the empty seat. `col` 0–3 from the window side; the aisle lies between col 1 and 2. Default = middle row, left of the aisle (≈ x 330, y 900–1000) |
| `ring` | number \| `true` | – | red ring around the empty desk; the two neighbours slowly turn their heads toward it (0.6–2.2 s after) |
| `text` | string \| `{s, at, y, red}` | – | typed lines split at `·` or `\|`, stacked at `y` (default `395`, 68 px apart) over a soft dark band. `s` default `"SATURDAY, 1 APRIL · CÄZILIA, 7 · ABSENT"`, `at` default `0.6`. With two or more parts the last line is red, glowing and larger (`red: false` keeps it white); a single-part text stays white |
| `window` | bool | `true` | grey morning light: shafts from the left, dust and snow outside. `false` = no windows, dim room, warm lamp glow |
| `teacher` | bool | `true` | teacher silhouette at the board's right; while `chalk` is being written he steps to the board and his hand follows the chalk |
| `chalk` | string | `""` | words on the blackboard (Caveat, chalk white), written left to right. `\|` = line break, otherwise auto-wrap and fit |
| `chalkAt` | number | `0.5` | when writing starts |
| `chalkSpeed` | number | `8` | characters per second |

```json
{"scene": "school_desk", "p": {"ring": 0.8, "text": {"s": "SATURDAY, 1 APRIL · CÄZILIA, 7 · ABSENT", "at": 1.2}, "chalk": "Samstag, 1. April 1922", "chalkAt": 0.2}}
{"scene": "school_desk", "p": {"rows": 4, "empty": {"row": 2, "col": 2}, "ring": true, "window": false, "teacher": false}}
```

---

## demolition
February 1923, grey overcast winter light: the long farmhouse (plastered dwelling with shutters at the near gable) and barn (boards, big door) under one roof, in true 3D perspective. Workmen strip it while crows circle over a forest line and a fence stands in the snow. Every part has its own removal point, so the house comes apart continuously: snowy roof tiles, battens, rafters, ridge, purlins and posts, barn boards, gable boards, attic joists and the crumbling masonry. Rubble heaps, a stack of salvaged beams, stacked tiles and loose boards grow in the trampled snow.

| param | type | default | meaning |
|---|---|---|---|
| `stage` | 0..1 | `0.5` | how far it is torn down (static). 0 = intact roof · 0.2 = tiles stripped around the workers, wall breach · **0.5 = roof stripped to bare rafters** · 0.7 = roof frame mostly gone, barn open · 0.85 = walls crumbling · 1 = rubble, low wall stubs and the near gable fragment (~3 m) |
| `stage0`, `stage1` | 0..1 | `stage0` = `stage` (or 0), `stage1` = 1 | giving either one switches on the animation: linearly from `stage0` to `stage1` … |
| `t0`, `t1` | number | `0`, `t0 + 6` | … between these times. Parts that vanish during the animation **fall** (gravity, slight spin, land and fade); masonry tops crumble with dust |
| `workers` | 0..3 | `3` | 1 = attic-floor man (crowbar, visible through a breach in the upper wall); 2 = + rope puller on the ground; 3 = + man with crowbar on the ridge. Each moves to the rubble once his perch is gone (cross-faded) |
| `tiles` | bool | `true` | now and then a tile slides down the roof, drops off the eave and puffs on the ground (from about 2.2 s, while tiles remain) |
| `freeze` | number \| `true` | – | the attic-floor workman stops dead in mid-motion over a gap in the floor; a faint red glow rises from the gap (soft column, red motes, slow pulse; fades in over 1.4 s). Needs `workers ≥ 1` |
| `snow` | bool | `false` | falling, wind-driven snow (the ground is snowy anyway) |
| `label` | string \| `{s, at, y}` | – | typed label (Special Elite 54) at `y` (default `1330`) on a soft dark band. `s` default `"FEBRUARY 1923 · DEMOLITION"`, `at` default `0.4` |
| `empty` | number \| `true` | – | at t the last wall tips over (0.8 s) and a dust and snow cloud rolls over the ruin. House, workers and site fade out by about t+2.4 s, leaving an empty snowfield with drifting ground snow and light snowfall (the old fence remains) |

Screen guide (zoom 1): house x ≈ 10–1070, ridge y ≈ 500–650, ground at the near corner y ≈ 1080. The freeze worker stands at about (580, 640–710); push in with `"focus": [580, 700], "zoom": [1.05, 1.25]`.

```json
{"scene": "demolition", "p": {"stage": 0.45, "freeze": 1.2, "label": {"s": "FEBRUARY 1923 · DEMOLITION", "at": 0.3}}, "focus": [580, 700], "zoom": [1, 1.15]}
{"scene": "demolition", "p": {"stage0": 0.1, "stage1": 1, "t0": 0, "t1": 5, "empty": 5.6, "snow": true}}
```
