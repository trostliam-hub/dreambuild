# Scene reference: screens & boards (`scenes/tc_screens.js`)

Four scenes for the true-crime shorts: `tv_news`, `computer_disk`, `evidence_board`, `city_map`.
All timed params are **local seconds** (from beat start). Every param is optional, and `p = {}` renders a complete demo.
Key content stays inside x 140..940, y 300..1380. All scenes fill -200..W+200, so engine zoom up to 1.12 and shake are safe.
Below y≈1400 there is only dark scenery (TV stand, viewer silhouette, desk, cork, map), so captions at y≈1500 work. Use `capBox: true`.

Static layers are cached (room, TV body, cork, map, card bitmaps, CRT overlays). The first frame of a scene costs 0.1–0.2 s to build them.
After that, typical frames take 25–45 ms in the headless renderer, about the same as `cctv_grid`.

---

## tv_news
A CRT TV with a news broadcast. It stands in a dark living room, and the room brightness flickers with the screen. With `room: false` you get a close-up where the screen fills the frame width.
- 1970s: wood-cabinet console, rounded screen, VHF/UHF dials, warm picture, faint antenna ghost, "SPECIAL BULLETIN" box, character-generator headline.
- 2000s: silver CRT on a rack with a VCR blinking 12:00, cool picture, skyline studio, red BREAKING NEWS lower third, LIVE bug, ticker.
- Always moving: the anchor bobs while talking, the ticker scrolls, a hum bar rolls, the screen flickers, grain, light streaks (2000s).

| param | type | default | meaning |
|---|---|---|---|
| `era` | `"1970s"` \| `"2000s"` | `"1970s"` | TV and graphics style. Any value other than `"2000s"` gives the 1970s look |
| `room` | bool | `true` | `true` = TV in a dark living room (screen at y≈500–1075). `false` = close-up, screen 960×720 at y 520–1240 |
| `station` | string | `"KAKE"` | Call letters used in the station bug, ticker tab and studio backdrop |
| `headline` | string | `"BTK LETTER"` | Uppercased and auto-fitted. 2000s ≈ 63 px Anton, 1970s ≈ 52 px Montserrat 800. `""` hides the bar |
| `sub` | string | `""` | Second line under the headline (≈24 px) |
| `ticker` | string | generic police/task-force text | Scrolling crawl at the bottom of the screen. `""` hides it |
| `breaking` | bool | `true` | 2000s: red pulsing "BREAKING NEWS" tab (plus a red spill on the floor). 1970s: "SPECIAL BULLETIN" box |
| `anchor` | bool | `true` | Faceless silhouette anchor at a desk. `false` + an image = the image fills the screen. `false` + `"none"` = "KAKE NEWS" station slide |
| `image` | `"letter"` \| `"house"` \| `"silhouette"` \| `"floppy"` \| `"farm"` \| `"none"` | `"letter"` | Over-the-shoulder inset picture next to the anchor: typed letter with a red circle, night house with a red window, line-up silhouette with a red "?", purple floppy disk, barn and silo at dusk |
| `insetLabel` | string | `""` | Caption strip on the inset picture |
| `static` | number \| number[] | – | Signal burst(s) starting at these times, 0.75 s each: snow, vertical roll, tearing, room light flashes |
| `at` | number | `0` | When the graphics come in: headline bar (2000s wipes, 1970s flickers on), inset pops in at +0.15 s, ticker at +0.35 s |
| `live` | bool | `true` | 2000s only: red LIVE bug with a blinking dot |
| `time` | string | `""` | 2000s only: clock shown next to LIVE, e.g. `"10:04 PM"` |
| `viewer` | bool | `true` | Room only: silhouette of a viewer in an armchair in the foreground (y 1360+), rim-lit by the TV |

```json
{"scene":"tv_news","dur":5,"p":{"era":"1970s","headline":"BTK LETTER","sub":"Killer writes to KAKE-TV","image":"letter","static":3.6},"zoom":[1,1.06],"capBox":true}
{"scene":"tv_news","dur":4,"p":{"era":"2000s","room":false,"headline":"BTK KILLER RESURFACES","sub":"New letter sent to Wichita TV station","image":"house","insetLabel":"WICHITA, KS","time":"10:04 PM","at":0.4},"zoom":[1,1.1]}
```

---

## computer_disk
The twist moment. A beige 2005-era desktop PC with a CRT monitor (no brand logos). The beat is one continuous in-scene camera move:
1. Drive close-up. A purple 3.5" floppy hovers face-on with its label readable, then tilts back in true perspective and slides into the drive. Click, the eject button pops, the drive LED flickers.
2. The camera pulls up to the monitor. A "Removable Disk (A:)" window opens (hourglass while reading). The cursor right-clicks the file and picks **Properties**.
3. A classic, generic "Properties" dialog opens on the **Summary** tab. Each value types in with a caret. `red` fields turn into white-on-red boxes with a glow, get a hand-drawn red marker box, and fire a red vignette pulse.
4. `zoom`: the camera pushes into the highlighted fields, so the values end up ≈55 px tall inside x 140..940, and the red vignette breathes.
Always moving: scanlines and glass glare, a rolling refresh band, slight flicker, the caret blinks, the cursor jitters, a slow camera drift.

| param | type | default | meaning |
|---|---|---|---|
| `floppyIn` | number \| `null` | `0.3` | When the floppy starts moving (tilt 0–1.0 s, insert 1.0–1.5 s, click at +1.5 s). Before that it hovers face-on. `null` = no floppy: the scene starts on the monitor with the disk window already open |
| `label` | string | `""` | Handwritten text on the disk label (Permanent Marker, wraps into up to 3 lines) |
| `open` | number \| `null` | `floppyIn + 3.35` (or `1.2` without a floppy) | When the Properties dialog opens. The cursor starts its move 1.0 s earlier, the context menu shows at −0.55 s and "Properties" highlights at −0.28 s. `null` = never opens |
| `fields` | `[{k, v, at, red}]` | `[{k:"Organization", v:"Christ Lutheran Church", red:true}, {k:"Last saved by", v:"Dennis", red:true}]` | Dialog rows. `k` = label, `v` = value. `at` = when typing starts, default `open + 0.6 + i·0.95`. Typing runs at 18 chars/s, clamped to 0.3–1.4 s. Up to 3 rows: label above a big value box (≈36 px before the zoom). 4 or more rows: label column + value column |
| `zoom` | number \| `null` | last field finished + 0.4 s | From this time the camera pushes into the `red` rows (all rows if none are red) over 1.5 s. `null` = no push |
| `title` | string | `"<file> Properties"` | Dialog title bar |
| `file` | string | `"Test A.rtf"` | File name in the disk window and the dialog header |
| `clock` | string | `"11:52 PM"` | Taskbar clock |
| `size` | string | `"1.2 KB"` | Status-bar text in the disk window |

The default `p = {}` timeline fits an 8 s beat: insert 0.3–1.8 → camera up 2.0–3.2 → window 2.4 → cursor 2.65 → dialog 3.65 → values 4.25 / 5.2 → push-in 5.9–7.4.

```json
{"scene":"computer_disk","dur":8,"p":{"label":"Test A"},"zoom":[1,1.04],"capBox":true}
{"scene":"computer_disk","dur":6,"p":{"floppyIn":null,"open":0.8,"file":"Test A.rtf","fields":[{"k":"Title","v":"Test A","at":1.4},{"k":"Author","v":"","at":1.6},{"k":"Organization","v":"Christ Lutheran Church","at":2.0,"red":true},{"k":"Last saved by","v":"Dennis","at":3.0,"red":true}],"zoom":3.8},"zoom":[1,1.04]}
```

---

## evidence_board
A cork board in the dark. Blurred old clippings sit at the edges for depth, the title is a paper strip with tape, and cards **slap** on: they drop from 1.45× scale with a tilt, the shadow tightens, the board shakes and dust puffs out, then a red pushpin goes in. Red yarn draws between pins and wobbles, a red marker circle is drawn around a key card, and a flashlight beam wanders and follows each new event. Dust motes always drift.

| param | type | default | meaning |
|---|---|---|---|
| `title` | string | `"BTK"` with the demo set, `""` when you pass `cards` | Marker title on a taped paper strip, centred at y≈410 |
| `at` | number | `0` | When the title slaps on |
| `cards` | `[{text, x, y, at, rot, kind, red, s, img}]` | 5-card demo set | `x`, `y` (0..1) = card centre, mapped to x 215..865, y 556..1278. `at` = slap time, default `0.3 + i·0.5`. `rot` (rad), default random ±0.07. `text` auto-wraps and shrinks; `\n` forces a break |
| ↳ `kind` | `"card"` \| `"photo"` \| `"note"` | `"card"` | `card`: typed index card, 330×206. `photo`: polaroid, 236×286, with a caption. `note`: torn paper with marker handwriting, 250×226 |
| ↳ `red` | bool | `false` | Red text, red border glow and a bright glowing pin |
| ↳ `s` | number | `1` | Size multiplier |
| ↳ `img` | `"person"` \| `"house"` \| `"farm"` \| `"letter"` \| `"floppy"` | `"person"` | Photos only. `person` = faceless head-and-shoulders silhouette |
| `strings` | `[{from, to, at}]` | demo: all to card 2 | Red yarn between two card indices. Draws in over 0.7 s, starting no earlier than both cards have landed |
| `circle` | `{i, at}` | demo: `{i:2, at:4.4}` | Red marker circle (1.13 turns, hand-drawn wobble) around card `i`, drawn over 0.65 s |
| `torch` | bool | `true` | Flashlight beam (dark outside). `false` = dim overhead light, the whole board visible |

```json
{"scene":"evidence_board","dur":6,"p":{},"zoom":[1,1.08],"capBox":true}
{"scene":"evidence_board","dur":6,"p":{"title":"THE BTK FILE","cards":[{"text":"OTERO HOME\n1974","x":0.15,"y":0.05,"at":0.3},{"kind":"photo","img":"house","text":"EDGEMOOR","x":0.8,"y":0.1,"at":0.7},{"kind":"note","text":"WHO IS BTK?","x":0.5,"y":0.45,"at":1.1,"red":true},{"text":"PURPLE FLOPPY DISK","x":0.2,"y":0.9,"at":1.5},{"text":"CHRIST LUTHERAN CHURCH","x":0.8,"y":0.88,"at":1.9,"red":true}],"strings":[{"from":0,"to":2,"at":2.3},{"from":1,"to":2,"at":2.5},{"from":3,"to":4,"at":2.8},{"from":4,"to":2,"at":3.0}],"circle":{"i":4,"at":3.5}},"zoom":[1,1.06]}
```

---

## city_map
A dark, stylized city map. It has a procedural street grid with irregular blocks, arterial roads, a ring highway, two crossing highways, a rail line, parks, a curvy suburb, downtown footprints, a river with a tributary, small SMono street labels, a compass and a scale bar.
The title has a red underline. Pins **drop with a bounce** (shadow grows, squash on impact), send a landing shock ring, then keep pulsing. Labels type in. Dashed red lines march between pins, and a red ring tightens around a search area while the outside darkens. A faint scan band sweeps down and the map drifts slightly.

| param | type | default | meaning |
|---|---|---|---|
| `title` | string | `"WICHITA"` | Big Bebas title, baseline y≈476. `""` hides it |
| `sub` | string | `"KANSAS"` (only when the title is WICHITA) | Red SMono line under the title |
| `coords` | string | `"37.69° N · 97.34° W"` (only when the title is WICHITA) | Small grey coordinates line |
| `pins` | `[{x, y, at, label, red}]` | 3 demo pins (1974/1977/1985) | `x`, `y` 0..1 mapped to x 140..940, y 612..1350. `at` = drop time, default `0.4 + i·0.5`. `red` default `true` (`false` = white pin, no idle pulse). `label` = typed SMono tag, flips to the left near the right edge |
| `lines` | `[{from, to, at}]` | `[]` | Dashed red marching line between two pin indices. Starts no earlier than both pins have landed and draws over 0.6 s |
| `ring` | `{x, y, r0, r1, t0, t1, label}` | – | Red ring centred at (x, y), 0..1 map coords. Shrinks from radius `r0` to `r1` between `t0` and `t1` (fades in 0.3 s before `t0`). Radii ≤ 2 are a fraction of the 800 px map width, larger values are px. Defaults: r0 .55, r1 .14, t0 0, t1 t0+3. `label` = red pill above the ring |
| `river` | bool | `true` | River with tributary |
| `grid` | bool | `true` | Fine street grid. `false` = only main roads and highways |

```json
{"scene":"city_map","dur":5,"p":{"pins":[{"x":0.3,"y":0.25,"at":0.4,"label":"1974"},{"x":0.65,"y":0.45,"at":1.0,"label":"1977"},{"x":0.42,"y":0.72,"at":1.6,"label":"1985"}],"lines":[{"from":0,"to":1,"at":2.2},{"from":1,"to":2,"at":2.6}]},"zoom":[1,1.06],"capBox":true}
{"scene":"city_map","dur":6,"p":{"pins":[{"x":0.25,"y":0.2,"at":0.3,"label":"1974"},{"x":0.7,"y":0.35,"at":0.7,"label":"1977"},{"x":0.45,"y":0.55,"at":1.1,"label":"1985"},{"x":0.8,"y":0.8,"at":1.5,"label":"1986","red":false}],"ring":{"x":0.48,"y":0.52,"r0":0.6,"r1":0.16,"t0":2.5,"t1":5.0,"label":"Park City"}},"zoom":[1,1.1]}
```
