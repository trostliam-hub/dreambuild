# Scene reference: `scenes/tc_farm.js` — Hinterkaifeck farm, 1922

Six scenes for the Hinterkaifeck true-crime short: a lonely Bavarian *Einödhof* where the farmhouse and the barn sit under one long, snow-covered roof with the forest behind. The style is deep blue night or grey dawn, with warm lantern or candle light and red used only for danger cues (rings). People are always silhouettes without faces, and there is no gore.

**Conventions**
- All timed params are **local seconds** from beat start. A `"@word"` reference also works, because the build resolves it to a number.
- Params marked **`true | t`**: `true` means present from the start (smoke is already rising), a number `t` means it starts at `t`, and `false` or omitting it means off, unless a different default is listed.
- Coordinates (`x`, `y`, `h`) are **screen pixels** in the 1080×1920 frame. Key content stays inside x 140–940 and y 300–1380. Every scene paints the full −200…W+200 margin, so zoom up to ~1.15, shake and zoom below 1 all stay filled.
- Every scene renders fully with `p: {}`. Something always moves: snow, smoke, flicker, dust, steam or a pendulum.
- Static backgrounds are cached in offscreen canvases. The first frame of a new param combination takes 50–90 ms; after that a frame takes ~13–35 ms, measured as the scene's draw time in headless Chromium.

---

## 1) `farm_snow` — wide night shot of the farm

The farm is a long building whose snowy roof is bright against a black spruce forest. The gable end faces right, with the chimney on the house part (right) and the barn part with its big wooden door on the left. The scene also has a moon behind a bare tree, a fence on the right, a forest edge coming forward on the left, ground mist, falling snow, twinkling stars, drifting cloud wisps, sparkles on the snow and swaying grass in the foreground.

| param | type | default | meaning |
|---|---|---|---|
| `lit` | `number[]` or `[{i, on, off}]` or `false` | `[1]` | Which windows glow warm, with oil-lamp flicker and light spilled on the snow. Indices: **0–2** house ground floor and **3–5** house upper floor, both counted from the gable end inward; **6** stable window next to the house; **7** small stable window at the far barn end. `on` sets the fade-in time and `off` the time the light goes out (0.12 s). `[]` or `false` means every window is dark. |
| `smoke` | `true \| t \| false` | `true` | Chimney smoke. `true` means it is already rising; `t` means the first puff leaves the chimney at `t`. |
| `snow` | bool | `true` | Falling snow. |
| `footprints` | `false \| true \| {at, n, dt}` | off | Prints in the snow from the left forest edge to the house door, none going back. With `true` all prints are already there. Otherwise they appear one by one from `at`, one every `dt` (default `0.38`); `n` defaults to `9` (1–14). |
| `lantern` | `false \| true \| {x0, x1, t0, t1, y}` | off | A swinging lantern light moving along the front of the farm, lighting the wall and the snow. Defaults: `x0 300`, `x1 820`, `t0 0`, `t1 8`, `y 980`. It waits at `x0` before `t0` and at `x1` after `t1`. Set `x0 > x1` to walk right to left. |
| `moon` | bool | `true` | Moon with halo and passing cloud wisps. |
| `forest` | bool | `true` | Forest rows behind the farm and the forest edge on the left. With `false` the field is open and only hills remain. |
| `barnDoor` | `number 0..1 \| true \| [t0, t1, from, to]` | `0` | Gap of the barn door; black opening. `true` = 0.5. The array form animates the gap with an ease. |
| `dark` | 0..1 | `0.15` | Extra darkness over the whole scene. Lit windows and the lantern stay bright. |
| `figure` | `false \| true \| {x, y, at, until, h}` | off | Tiny dark silhouette at the forest edge, standing in faint mist with a moonlit rim. Defaults: `x 172`, `y` = forest edge, `at 0`, `h 82`. Fades in over 0.6 s and fades out 0.6 s after `until`. |
| `label` | `string \| {text, at, until, y}` | `""` | Calm typewriter-style place label with thin lines, at y 1330. Fades in from `at` (default 0.2). Long text shrinks to fit 760 px. |

```json
{"scene":"farm_snow","p":{"lit":[1,4],"label":"HINTERKAIFECK · 1922"},"zoom":[1,1.08]}
{"scene":"farm_snow","p":{"lit":[{"i":1,"off":3.2}],"footprints":{"at":0.6,"n":9},"figure":{"at":0.3,"until":2.8},"lantern":{"x0":820,"x1":320,"t0":3,"t1":8},"barnDoor":[4,5.5,0,0.5],"dark":0.3}}
```

---

## 2) `footprints` — low close-up over the snow

The camera sits low over the snowfield, looking at the distant farm under a dark sky. A fence leads toward the farm and dry stalks poke out of the snow. Boot prints in perspective lead **away from the camera** toward the farm door, as if someone unseen is walking there. Each print presses in with a powder puff: a small cloud plus spray from the rim. The prints are moonlit hollows with a shaded far wall, a bright front lip and hobnail marks on the near prints. Snow falls in two layers, with large soft flakes up close.

| param | type | default | meaning |
|---|---|---|---|
| `t0` | number | `0.3` | When the nearest print presses in. |
| `t1` | number | `3.0` | When the last (farthest) print presses in. The prints in between are evenly spaced in time. |
| `n` | number | `8` | Number of prints (1–14). |
| `back` | bool | `false` | `true` adds a returning trail beside the outgoing one, slightly drifted over. The ring is then hidden. |
| `ring` | `true \| t` | off | A red glowing ring with a soft red glow around the **empty snow beside the trail, where the return prints should be**. It pops in with a slight overshoot and then pulses. |
| `lantern` | bool | `true` | Warm swaying lantern by the farm door, one lit window and a warm glow on the snow at the horizon. Only shown when `farm` is on. |
| `farm` | bool | `true` | The farm silhouette on the horizon. |
| `snow` | bool | `true` | Falling snow. |

The nearest print sits at y≈1250 and the bottom is a dark snow bank, so captions at 1500 read well.

```json
{"scene":"footprints","p":{"t0":0.3,"t1":3,"ring":3.6}}
{"scene":"footprints","p":{"t0":0,"t1":1.2,"n":10,"back":true,"lantern":false}}
```

---

## 3) `attic` — the attic above the house (lantern, dust, footsteps)

Rafter pairs, collar beams, purlins and the ridge recede toward a small moonlit gable window at the back. Moonlight leaks through gaps in the tiles, and there are floorboards, a knee wall, piles of hay, dust motes in the lantern light and a dusty moonbeam from the window. A trapdoor sits in the floor at the lower left.

| param | type | default | meaning |
|---|---|---|---|
| `lantern` | `{x, y, at, swing} \| false` | `{x:420, y:610, at:0, swing:true}` | Storm lantern on a rope; `x`/`y` is its rest position. `at` is when it lights up, with a 0.5 s flare and flicker; before that it is dark. `swing:false` gives only a slight drift. `false` means no lantern, so only moonlight and the hatch light remain. |
| `footsteps` | `false \| true \| {t0, t1, n, dir}` | off | Dusty boot prints appearing one by one across the boards, each with sole, separate heel and a dust halo. Defaults: `t0 0.3`, `t1 4`, `n 10` (1–20). `dir:"in"` (default) runs from the dark back toward the camera, ending at the hatch. `"out"` walks away. |
| `creak` | `number \| number[]` | `[]` | At each time a floorboard near the lantern pool dips for 0.5 s with dark seams, dust puffs out of the joints and dust trickles down from the collar beam above for ~3 s. |
| `shadow` | `false \| true \| {at, x, y, h, shift, until}` | off | A darker, blurred human-sized shape (shoulders and head, no face) at the **edge of the lantern light**. It fades in over 1.6 s from `at`, then slowly shifts by `shift` px (default `-45`, toward the light) with a slight lean. Defaults: `x 800`, `y 1040` (feet), `h 430`. With `until` it fades out over 1 s. |
| `hatch` | `t \| true \| false` | closed | Floor trapdoor. `t` means it swings open over 1.3 s from `t`: warm light from below, a ladder visible in the hole, a soft rising light shaft with dust, and the lid stands up as a dark board with glowing edges. `true` means it is open from the start. Omitted, the lid stays closed; `false` leaves only the floor seams. |
| `hay` | bool | `true` | Hay piles and straw on the floor. |
| `dark` | 0..1 | `0.8` | Darkness outside the light sources. |

```json
{"scene":"attic","p":{"footsteps":{"t0":0.5,"t1":3.5},"creak":[2.0],"shadow":{"at":3.5},"hatch":5.5}}
{"scene":"attic","p":{"lantern":{"x":700,"y":520,"at":1.2,"swing":false},"creak":[0.4,2.2],"dark":0.9}}
```

---

## 4) `barn` — inside the barn at night

One-point perspective toward the double barn door at the back. There are a plank ceiling, tie beams and wall posts, a pitchfork against the back wall, hay hanging from the loft, a floor of trodden earth with straw, a stall partition and a feeding trough. Through the door you see a moonlit snowfield, the forest and falling snow, and moonlight falls through the gap onto the floor in a long pale shaft with snow drifting in.

| param | type | default | meaning |
|---|---|---|---|
| `doorGap` | 0..1 | `0.22` | How far the door leaves have swung outward. `0` is closed and `1` fully open. The shaft and moonlight grow with it. |
| `swing` | `true \| t` | off | The door swings from `doorGap` to `swingTo` starting at `t`, with a small settle wobble at the end. |
| `swingTo` | 0..1 | `0.9` | Target gap for `swing`. |
| `swingDur` | number | `1.6` | Swing duration in seconds. |
| `lantern` | `{x, y, at} \| false` | `{x:300, y:650, at:0}` | Lantern hanging from the tie beam, swaying slightly. `at` is when it lights up, with a flare and flicker; before that only moonlight. `false` means no lantern. |
| `animals` | bool | `true` | Two Fleckvieh cows in profile, left and right, with nodding heads, swishing tails and flicking ears. Their breath steams in the cold, lit by the lantern. |
| `hay` | bool | `true` | Hay piles and hay hanging from the loft. |
| `figure` | `false \| true \| {x, at, until, h}` | off | Dark silhouette standing in the doorway: brimmed hat, long coat, arms slightly apart, faceless, rimmed by the snow light. When the door is open it also throws a long shadow down the moonlit floor toward the camera. Defaults: `x 540`, `at 0`, `h 300`. Fades over 0.5 s. |
| `dark` | 0..1 | `0.75` | Darkness outside the lantern and the moonlight. |

The moonlit floor shaft is pale at y 1100–1600, so use `capBox: true`.

```json
{"scene":"barn","p":{"doorGap":0.15,"swing":2,"figure":{"at":3.4},"lantern":{"at":0.6}},"capBox":true}
{"scene":"barn","p":{"doorGap":1,"animals":false,"figure":{"x":600,"at":0,"until":2.5,"h":380},"dark":0.9},"capBox":true}
```

---

## 5) `kitchen_old` — farmhouse kitchen, 1922

On the left stands a green tiled stove (Kachelofen) with a glowing fire door and an iron stove pipe. A deep-set small window shows night snow outside, with frost in the corners and the barn's silhouette. There are a shelf with jugs and plates, a pendulum wall clock (always swinging), a corner bench, and a heavy wooden table holding bread on a board with a knife, a plate with a spoon and a candle. The candle light flickers across the whole room.

| param | type | default | meaning |
|---|---|---|---|
| `stove` | bool | `true` | Tiled stove with fire glow and pipe. |
| `smoke` | `true \| t` | off | Smoke leaks and curls from the pipe joint above the stove from `t`, as soft puffs plus thin wisps. `true` means it is already smoking. Requires `stove`. |
| `bread` | bool | `true` | Bread loaf on a board, with a knife. |
| `plate` | bool | `true` | Plate with a blue rim, and a spoon. |
| `newspaper` | `false \| true \| "Title" \| {at, title, sub}` | off | Folded newspaper lying on the table, right of the candle. It slides into place over 0.55 s at `at`; without `at` it is already there. The masthead is in **Fraktur**, default `"Münchner Neueste Nachrichten"`, broken into two lines when long. `sub` (or `date`) adds a small dateline. Column lines are abstract, with no invented content. |
| `keyHook` | `{keys, empty} \| false` | `{keys:2}` | Two big iron bit keys hanging on a key board, gently swaying (`keys` 0–3). `empty: t` makes the keys flicker out and vanish at `t`: faint pale key outlines stay on the wall and a **red glowing ring** pops up around the empty hooks. `empty: true` means they are gone from the start. `false` means no keys. |
| `candle` | bool | `true` | Candle on the table, the main light source. With `false` the room is lit only by the window and the stove glow. |
| `window` | `"snow" \| "dark"` | `"snow"` | `"snow"` shows falling snow outside; `"dark"` is a black night window. |
| `dark` | 0..1 | `0.6` | Darkness outside the candle light. |

```json
{"scene":"kitchen_old","p":{"newspaper":{"at":1},"keyHook":{"empty":4},"smoke":2}}
{"scene":"kitchen_old","p":{"newspaper":{"title":"Münchner Neueste Nachrichten","sub":"Dienstag, 4. April 1922"},"keyHook":{"keys":2,"empty":true},"window":"dark","dark":0.7}}
```

---

## 6) `investigators_old` — investigators at dawn (April 1922)

Grey, cold dawn light over the snow. The farm stands misty in the background with its barn door ajar, in front of a forest line, a fence and trampled tracks toward the farm. The 1920s investigators are profile silhouettes in fedoras and long coats; their coats flutter and their breath steams. There is drifting low mist, light snow and slow clouds.

| param | type | default | meaning |
|---|---|---|---|
| `figures` | 0..3 | `3` | Number of investigators. In order: the photographer behind the camera holding up a flash pan (when `camera` is on), the man with the notebook, and a third man facing them. |
| `camera` | `{x, flash} \| false` | `{x:330, flash:[]}` | Wooden plate camera on a tripod with bellows, lens and focusing cloth; `x` is the tripod position. `flash` is a number or a list of times. Each one fires a **magnesium flash**: 0.2 s of near-white over the whole scene, then a short afterglow, then a white smoke plume rising from the flash pan for ~4 s. |
| `farm` | bool | `true` | Farm silhouette in the background. |
| `snow` | bool | `true` | Light snowfall. |
| `label` | `string \| {text, at}` | off | Typewriter text, letter by letter with a blinking cursor, at y≈470. The object form defaults to `text:"APRIL 4, 1922"` and `at:0.3`. |
| `notebook` | bool | `true` | The middle man holds a pale notebook and writes; his hand moves. `false` lets his hands hang. |
| `barnDoor` | 0..1 | `0.2` | Gap of the farm's barn door in the background (dark opening). |

The snow is pale grey, so use `capBox: true`. Use `noCaptions` if the label shows the narrated date.

```json
{"scene":"investigators_old","p":{"camera":{"flash":[2.5,6.0]},"label":{"text":"APRIL 4, 1922","at":0.4}},"capBox":true}
{"scene":"investigators_old","p":{"figures":2,"camera":{"x":360,"flash":1.2},"notebook":false,"snow":false},"capBox":true}
```

---

### Notes for timeline authors
- Good transitions: `farm_snow` → `footprints` (same night, same farm, mirrored with the gable on the right) → `kitchen_old` / `attic` / `barn` → `investigators_old` (dawn).
- Red appears only on `footprints.ring` and `kitchen_old.keyHook.empty`. Keep it for the beats that state the clue.
- The camera `zoom` up to `[1, 1.12]` is fine in every scene. With a strong `focus` far off-centre, check that the HUD corner stays clear.
