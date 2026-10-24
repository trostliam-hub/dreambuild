# Scenes: justice & double life (`scenes/tc_justice.js`)

Three scenes for true-crime parts: a courtroom verdict, a prison cell, and a split screen showing a double life.
All times are **local seconds** from the start of the beat (numbers, or `"@word"` references that build.py resolves).
Every param is optional. `p: {}` renders a complete, moving scene.
Key content stays inside x 140..940 and y 300..1390. The bottom area (y > 1400) is dark foreground (gallery, floor,
table front), so captions work at `captionY: 1500` with `capBox: true`. All people are filled silhouettes and never show a face.

Ambient motion that runs in every scene: breathing figures, drifting dust in the light beams, light that changes slowly
(flicker, clouds, swaying lamps, blinds), and turning heads.

---

## courtroom

A cold blue courtroom seen from the back of the public gallery: fluorescent ceiling panels, tall windows with light beams,
and dark wood panelling. There are no flags or emblems.

| param | type | default | meaning |
|---|---|---|---|
| `bench` | bool | `true` | Judge's bench with a seated, robed judge in silhouette, a high-backed chair, and a plain round plaque (no emblem). `false` shows only a panelled back wall. |
| `gallery` | bool | `true` | The bar railing plus 2 rows of spectators seen from behind in the foreground. A few heads turn slowly into profile. After the first `gavel` or `text` hit, most heads turn towards their neighbours. |
| `lawyers` | bool | `true` | 2 attorneys seated on office chairs (from behind), one at the defence table and one at the prosecution table. |
| `defendant` | object \| `false` | `{}` | The defendant, seen from behind and slightly from the side. `false` removes him. |
| `defendant.x` | number | `360` | Screen x of the defendant. |
| `defendant.h` | number | `560` | Height in px. |
| `defendant.stand` | bool \| number | `true` | `true`: standing from the start. `false`: seated in a chair. A number is the time he rises from the chair (0.9 s). |
| `defendant.at` | number | `-1` | `-1` means he is visible at frame 0. A value ≥ 0 fades him in over 0.6 s from that time. |
| `defendant.jumpsuit` | bool | `false` | Dark orange overall with an orange rim light. |
| `defendant.turn` | number | `0.55` | Head turn from -1 to 1 (0 = back of the head, ±1 = profile). His head bows slightly once a `sentence` appears. |
| `gavel` | number \| number[] | none | Strike times. The judge lifts the gavel 0.55 s before each strike. On the hit: screen shake, a white flash (0.26 s), and a shock ring on the sound block. |
| `text` | array of `{s, at, size, y, col}` or strings | none | Huge Anton words that slam in, scaling from 2.5× to 1× in 0.16 s, with a red flash, bloom and shake. |
| `text[].s` | string | | The word or words (shown in upper case). |
| `text[].at` | number | `0.4 + i·0.6` | When the word starts slamming in. The impact lands 0.16 s later. |
| `text[].size` | number | `250` | Font size in px. Text is shrunk automatically to fit 820 px. |
| `text[].y` | number | `790 + i·size·1.02` | Vertical centre. |
| `text[].col` | `"red"` \| `"white"` | `"red"` | Glow colour. |
| `sentence` | object | none | Sentence card: the scene darkens, a red rule draws, the lines wipe in with a red cursor, then the sub-line appears. |
| `sentence.text` | string | `""` | Main line in Anton (100 px). It wraps automatically to at most 3 lines and shrinks if needed. |
| `sentence.at` | number | `1` | Start time. |
| `sentence.sub` | string | none | Red monospace line under the main line. The first number in it counts up from 0, e.g. "175 YEARS MINIMUM". |
| `sentence.count` | bool | `true` | `false` turns off the count-up. |
| `sentence.size` | number | `100` | Font size of the main line. |
| `sentence.y` | number | `1010` with `text`, otherwise centred | Top of the card. |

```json
{"scene": "courtroom", "zoom": [1, 1.12], "captionY": 1500, "capBox": true,
 "p": {"defendant": {"stand": 0.6, "jumpsuit": true}, "gavel": ["@guilty-0.1"],
       "text": [{"s": "GUILTY", "at": "@guilty"}],
       "sentence": {"text": "10 CONSECUTIVE LIFE SENTENCES", "at": 3.4, "sub": "175 YEARS MINIMUM"}}}
```
```json
{"scene": "courtroom", "p": {"text": [{"s": "GUILTY", "at": 0.3, "size": 220}, {"s": "ON ALL", "at": 0.9, "size": 160, "col": "white"}, {"s": "10 COUNTS", "at": 1.5, "size": 160}]}}
```

---

## cell

A bleak concrete prison cell seen through the bars of the door. It has cinder-block walls, a steel bunk, a steel
toilet and sink unit, and tally marks on the wall. A cold light beam falls from a barred window onto the floor.

| param | type | default | meaning |
|---|---|---|---|
| `bars` | bool | `true` | The cell door bars in the foreground, with a lock box and red LED, the door frame, and bar shadows on the floor. |
| `figure` | object \| `false` | `{}` | The inmate. `false` shows an empty cell. |
| `figure.pose` | `"sit"` \| `"sitUp"` \| `"stand"` | `"sit"` | `sit`: hunched on the bunk with elbows on knees. `sitUp`: sitting upright. `stand`: seen from behind, standing in front of the window and backlit. |
| `figure.x` | number | `-0.15` (sit) / `-0.09` (stand) | Position in metres across the room. The defaults sit centred between two bars. |
| `figure.at` | number | `-1` | `-1` means visible at frame 0. A value ≥ 0 fades the figure in over 0.7 s. |
| `window` | bool | `true` | Barred window with a light beam and a striped floor patch. The patch drifts slowly and brightens and dims as clouds pass. `false` shows a caged ceiling lamp instead. |
| `lightDx` | number | `-0.16` | Sideways direction of the window light. Use this to move the floor patch. |
| `slam` | number | none | The door starts open (pushed to the right). It slides in over 0.42 s, speeding up, and slams at `t`: shake, a cold metallic flash, sparks, and the LED turns red. Without `slam` the door is closed. |
| `label` | `{text, at, y, sub}` \| string | none | Location plate typed letter by letter, with a red marker and a blinking cursor. Long names wrap to 2 lines. |
| `label.at` | number | `0.6` | Typing start (30 characters per second). |
| `label.y` | number | `1290` | Baseline of the first line. |
| `label.sub` | string | none | Small grey second line, e.g. "KANSAS". |
| `dark` | 0..1 | `0.7` | Darkness of the room. The light beam stays bright. |

```json
{"scene": "cell", "zoom": [1, 1.12], "p": {"figure": {"pose": "stand"}, "slam": 0.8, "label": {"text": "EL DORADO CORRECTIONAL FACILITY", "at": 1.6}, "dark": 0.7}}
```
```json
{"scene": "cell", "p": {"figure": {"pose": "sit"}, "label": {"text": "EL DORADO, KANSAS", "at": 0.5, "sub": "LIFE SENTENCE"}}}
```

---

## double_life

A split screen of the same man. On the left he is warm and ordinary; on the right he is cold, standing in shadow, with a
red rim light. He has no glowing eyes: he is a real person, not a monster. The red line runs down the middle at x 540.
The man stands at x 330 on the left and x 740 on the right.

| param | type | default | meaning |
|---|---|---|---|
| `left` | `"church"` \| `"dinner"` \| `"uniform"` \| `"family"` \| `"office"` | `"church"` | **church**: seated in the front pew holding an open hymnal, with the congregation behind him, backlit by arched windows. **dinner**: at a family dinner table under a pendant lamp, with his wife and child. **uniform**: city uniform with a peaked cap, badge and clipboard in a sunset suburban street (picket fence, city truck). **family**: family portrait with his wife and two children. **office**: writing at a desk with a lamp, blinds and a wall clock. |
| `right` | `"shadow"` \| `"house"` \| `"letter"` | `"shadow"` | **shadow**: standing still against a wall with slow venetian-blind stripes and a red glow behind him. **house**: seen from behind at night, looking at a ranch house with one red-lit window, under a moon, a bare tree and power lines. **letter**: in front of a huge typewritten letter with redaction bars and red pen marks, with an envelope next to it. |
| `at` | number | `0` | Base time. `split` and the labels default to times relative to it. |
| `split` | number | `at + 0.6` | The red line draws from top to bottom (0.75 s) and reveals the dark half under its glowing tip. Before that, the warm scene fills the whole frame. A negative value (e.g. `-1`) means the frame is already split at frame 0. |
| `labels` | `{l, r, at}` \| `false` | `{l: <left default>, r: "THE KILLER"}` | Labels at y ≈ 410. Text of 5 characters or fewer (e.g. "BTK") becomes a large, glowing red Anton word. Longer text becomes a small-caps plate: warm on the left, red-bordered on the right, up to 3 lines. |
| `labels.at` | number | `split + 0.7` | The left label pops in at this time and the right label 0.35 s later. |
| `swap` | number | none | The dark half breaks into glitch slices over the left half (about 0.42 s, with red and cyan streaks). The dark scene then fills the frame, the man slides to the centre (until about +1.2 s), and the right label moves to the top centre. The left label flickers out. |
| `letterText` | string[] | generic redacted letter | Lines for `right: "letter"`. `"#"` makes a row of black redaction bars. |
| `fadeIn` | bool | `false` | Fade in from black at `at` (0.4 s). |

Default left labels: church "CHURCH COUNCIL PRESIDENT", dinner "FAMILY MAN", uniform "CITY COMPLIANCE OFFICER",
family "HUSBAND. FATHER OF TWO.", office "RESPECTED EMPLOYEE".

```json
{"scene": "double_life", "zoom": [1, 1.12], "captionY": 1500, "capBox": true,
 "p": {"left": "church", "right": "shadow", "split": 0.5, "labels": {"l": "CHURCH COUNCIL PRESIDENT", "r": "BTK", "at": 1.2}, "swap": "@btk+0.3"}}
```
```json
{"scene": "double_life", "p": {"left": "uniform", "right": "letter", "split": -1, "labels": {"l": "CITY COMPLIANCE OFFICER", "r": "BTK"}}}
```

---

### Notes
- Performance: drawing a scene costs about 23–30 ms per frame at camera zoom, or 40–50 ms including the engine's overlays.
  The static parts are cached per parameter set: one cached layer per scene, plus small re-blits where a person sits
  behind a table, bench or desk. Glowing words and plates are cached as sprites. The swap glitch phase costs more
  (about 0.4 s).
- The scene shakes itself on `gavel`, `text` hits and `slam`. A beat-level `shakeAt` adds to that.
- The scenes draw from -200 to W+200 and stay filled at a zoom of 1.12 with shake. During and after `swap`, the dark layer
  reaches out to W+400.
