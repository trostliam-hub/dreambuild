# Document & card scenes (scenes/tc_docs.js)

Six true-crime scenes: `title_card`, `letter`, `newspaper`, `years_flip`, `memorial`, `id_badge`.
All times are **local seconds from beat start** (numbers; `"@word"` references are resolved by build.py as usual).
Every param is optional. `p: {}` renders a complete, good-looking default.
Key content stays inside x 140..940 / y 300..1380. Backgrounds fill -200..W+200, so zoom up to ~1.12 and shakes are safe.
Captions sit below the art (default `captionY` works; use `captionY: 1500, capBox: true` if you want them lower).
Static layers (paper, newspaper page, cards, halftone photos) are cached, so a frame costs about 1–8 ms after a one-off cache build on the first frame of a beat.

---

## title_card
A big typewriter date with a blinking red cursor. The place line types after it (letter-spaced), then a thin red underline draws in, then an optional subline fades in. The background moves subtly.

| param | type | default | meaning |
|---|---|---|---|
| `date` | string | `"JANUARY 15, 1974"` | big typed line (Special Elite ~88 px, auto-shrinks to 800 px width) |
| `place` | string | `"WICHITA, KANSAS"` | second line, Space Mono 40, letter-spaced (spacing and size shrink for long text) |
| `sub` | string | `""` | optional subline (Montserrat 34, wraps, max 3 lines), fades in after the underline |
| `at` | number | `0.2` | when typing starts (only the blinking cursor before that) |
| `speed` | number | `22` | chars/s for the date (the place types 1.2× faster). **If omitted**, typing speeds up automatically so everything finishes inside the beat |
| `red` | string[] | `["1974"]` | words in date/place drawn red + glow (matching ignores case/punctuation; words ≥3 chars also match by prefix) |
| `bg` | `"black"`\|`"map"`\|`"snow"`\|`"paper"` | `"black"` | black = dust + faint red breathing light; map = dark street map slowly panning + pulsing red pin (lower right); snow = night blue with 3 layers of falling snow; paper = dim aged paper (text turns into dark ink) |
| `size` | number | `88` | max font size of the date |
| `y` | number | `800` | baseline of the date; the other lines follow below |

Timeline (speed 22, defaults): date 0.2–0.95 s, place ≈1.25–1.8 s, underline ≈1.95–2.65 s, sub ≈2.3 s.

```json
{"scene": "title_card", "p": {"date": "JANUARY 15, 1974", "place": "WICHITA, KANSAS", "bg": "map", "sub": "A family of four"}}
{"scene": "title_card", "p": {"date": "MARCH 31, 1922", "place": "HINTERKAIFECK, BAVARIA", "bg": "snow", "red": ["1922"], "at": 0.4}}
```

---

## letter
A paper sheet on a dark desk under a breathing lamp, slightly rotated, with a soft shadow and floating dust. Text writes on character by character (typewriter: Special Elite with per-key jitter and ink variation; hand: Caveat with a smooth stroke-like reveal). Lines auto-wrap at 720 px. Font size auto-fits (up to ~12 lines fit; short letters are scaled up).

| param | type | default | meaning |
|---|---|---|---|
| `style` | `"typewriter"`\|`"hand"` | `"typewriter"` | writing style |
| `paper` | `"white"`\|`"yellow"`\|`"old"` | `"white"` | white with tri-fold creases; yellow legal pad (blue rules aligned to the text rows, red margin); old = aged/stained |
| `title` | string | `""` | heading at the top of the sheet (typewriter: underlined) |
| `titleAt` | number | – | if set, the title types in from this time; otherwise it is visible from the start |
| `lines` | (string \| object)[] | 4 generic lines | lines/paragraphs, see below |
| `lines[].text` | string | `""` | the text (wraps automatically) |
| `lines[].at` | number | after the previous line + 0.25 s (first: 0.3, or 1.8 with envelope) | when writing starts |
| `lines[].dur` | number | length ÷ speed | write-on duration. **If no times are given**, speed is raised automatically so all lines finish inside the beat |
| `lines[].red` | bool | `false` | whole line in red ink |
| `lines[].size` | number | auto (44 typewriter / 72 hand, ×fit) | font px for this line (disables the auto scale-up) |
| `lines[].indent` | number | `0` | left indent in px |
| `speed` | number | auto (26 / 17 chars/s) | force a fixed writing speed for lines without `dur` |
| `gap` | number | `0.22` (yellow: 0) | extra space between lines, in font-size units |
| `hl` | string[] | `[]` | words that glow red once they are fully written |
| `signature` | string \| `{text, at, style:"hand"|"scrawl"|"type", red}` | – | signature bottom right with a pen-stroke reveal + swash; `at` default = end of the last line + 0.2 |
| `envelope` | bool | `false` | starts inside an open envelope: the flap opens (0–0.55 s), the letter slides out (0.45–1.6 s), the envelope drops away (1.2–1.8 s) |
| `tilt` | number | `-0.02` | sheet rotation (rad) |
| `stamp` | `{text, at, x, y, rot, w, col, alpha}` | – | a rubber stamp slams on (scale 1.7→1 in 0.13 s, the paper jolts and dust flies). `text` uses `"|"` for line breaks (default `"RECEIVED OCT 22 1974"`), `at` default = end of the lines + 0.3, x/y in sheet coords (default lower right 160/340), `rot` -0.14, `w` max width 460 |
| `redact` | `{line, from, to, at}[]` | – | a black marker bar draws over chars `from..to` (to exclusive, default end) of line index `line` at `at` (default = that line's end + 0.3). It only covers characters already written |
| `focusLine` | number | – | index of the line to keep; all other lines dim to 28 % |
| `focusAt` | number | `0` | when the dimming starts (0.5 s ease) |
| `y` | number | `845` | sheet centre (the sheet is 820×1060 → y ≈ 315..1375) |

```json
{"scene": "letter", "p": {"style": "typewriter", "paper": "old", "title": "THE BTK STRANGLER", "hl": ["BTK"],
  "lines": [{"text": "I write this letter to you for the sake of the tax payer as well as your time.", "at": 0.3},
            {"text": "The code words for me will be... BTK.", "at": 2.4, "red": true},
            {"text": "It will happen again.", "at": 3.8}],
  "redact": [{"line": 0, "from": 28, "to": 41, "at": 4.4}], "stamp": {"text": "RECEIVED|OCT 22 1974", "at": 5.2}}}
{"scene": "letter", "p": {"style": "hand", "paper": "yellow", "title": "Dear Mom,", "envelope": true,
  "lines": ["I am sorry I could not call you.", "He is watching the house every night."], "hl": ["WATCHING"],
  "signature": {"text": "Anna"}, "focusLine": 1, "focusAt": 5}}
```

---

## newspaper
A front page on a dark desk. It spins in from black (2 turns plus a scale-up over 0.75 s, with motion ghosts, a landing flash and a bounce), then slowly pushes in with lamp light and dust. The page is rendered once into a cache: masthead, date bar, headline, deck, halftone press photo, columns of tiny filler text, and an optional classified-ads column.

| param | type | default | meaning |
|---|---|---|---|
| `style` | `"modern"`\|`"1970s"`\|`"1922"` | `"modern"` | modern: grey newsprint, Playfair masthead + headline; 1970s: yellowish, blackletter masthead, Oswald caps headline; 1922: yellowed/stained, Fraktur masthead, Old Standard text |
| `masthead` | string | modern/1970s `"THE WICHITA EAGLE"` / `"The Wichita Eagle"`, 1922 `"Münchner Neueste Nachrichten"` | paper name (auto-fit) |
| `date` | string | per style (`"FRIDAY, JANUARY 30, 2004"`, `"WEDNESDAY, JANUARY 16, 1974"`, `"Donnerstag, 6. April 1922"`) | date bar, left |
| `headline` | string | per style (e.g. `"BTK KILLER RESURFACES"`) | auto-sized to ≤3 lines (118→40 px) |
| `sub` | string | per-style default only when `headline` is also omitted, else `""` | deck under the headline (≤2 lines) |
| `photo` | `"house"`\|`"silhouette"`\|`"floppy"`\|`"farm"`\|`"none"` | modern/1970s `"house"`, 1922 `"farm"` | halftone photo: house = suburban house + police car + tape; silhouette = generic head-and-shoulders against a line-up height chart; floppy = 3.5″ disk; farm = remote farmstead in snow; none = text columns only |
| `hl` | string[] | `["BTK"]` | headline words printed red, with a softly pulsing red glow |
| `spin` | bool | `true` | spin-in from black; `false` = the page is there from frame 0 |
| `at` | number | `0` | spin start (before that: dark desk only) |
| `tilt` | number | `-0.025` | final page rotation |
| `y` | number | `905` | page centre (page 900×1240 at scale 0.9) |
| `classified` | `{text, at, label, y}` | – | adds a classified-ads column (right) with the ad boxed under PERSONALS/PERSÖNLICHES. At `at` (default 2.2) the page dims, a red frame marks the ad, a zoom box grows from the ad to the centre (box centre y = `y`, default 980) showing the ad large, then a red marker circle draws around the text (0.75–1.35 s after `at`). `label` default `"CLASSIFIEDS"` / `"ANZEIGEN"`. Long text wraps (≤5 rows) and the circle sizes to it |
| `lang` | `"en"`\|`"de"` | `"de"` for 1922, else `"en"` | edition/price/volume labels, captions, filler words, ad headings |

```json
{"scene": "newspaper", "p": {"style": "modern", "headline": "BTK SENDS NEW MESSAGE", "sub": "Ad in Sunday paper may be reply to killer",
  "photo": "floppy", "classified": {"text": "REX, IT WILL BE OK", "at": 2.0}}, "zoom": [1, 1.06]}
{"scene": "newspaper", "p": {"style": "1922", "headline": "Sechsfacher Mord auf einem Einödhof", "hl": ["Mord"], "at": 0.3}}
```

---

## years_flip
A mechanical split-flap counter (4+ digits in a dark metal housing with screws and an LED strip). It counts `from`→`to` with ease-in-out (slow, fast, slow). Each digit flips with a falling top flap, a shadow on the revealed half and a widening bottom flap. On landing the digits turn red and glow, a red flash pulses, the housing punches, and the label gets a red underline. A scale scrolls under a red pointer.

| param | type | default | meaning |
|---|---|---|---|
| `from` | int | `1979` | start value (counting down works too) |
| `to` | int | `2004` | end value |
| `t0` | number | `0.4` | counting starts |
| `t1` | number | `3.4` | counting ends; landing effects at `t1 + 0.22` |
| `label` | string | `"YEARS OF SILENCE"` | Anton ~92 px below (auto-fit); `""` hides it |
| `sub` | string | `""` | grey Montserrat line under the label (≤2 lines) |
| `ticks` | bool | `true` | year ruler with labels every 5 years under a red pointer, scrolling with the value |
| `y` | number | `760` | counter centre |

```json
{"scene": "years_flip", "p": {"from": 1979, "to": 2004, "label": "YEARS OF SILENCE", "sub": "Then the letters started again"}}
{"scene": "years_flip", "p": {"from": 1922, "to": 2024, "t0": 0.3, "t1": 3.0, "label": "A CENTURY LATER", "ticks": false}}
```

---

## memorial
White names fade and slide in one by one on near-black (tracking tightens, brief warm halo). A grey sub line (age/date) follows each name. A warm candle-like glow breathes at the bottom with slowly rising embers. Everything holds at the end.

| param | type | default | meaning |
|---|---|---|---|
| `title` | string | `"REMEMBER THEIR NAMES"` | spaced Montserrat heading at y≈445 with side rules and a red dash; `""` hides it |
| `names` | (string \| `{name, sub}`)[] | 4 placeholders (Jane Doe, John Doe, …) | up to 12; more than 8 → two columns (column-major order) |
| `at` | number | `0.3` | first name appears |
| `gap` | number | `0.45` | seconds between names |

Font size is automatic: up to 80 px in one column, 58 px in two. The common size follows the median name width, and very long names shrink on their own.

```json
{"scene": "memorial", "p": {"names": [{"name": "Joseph Otero", "sub": "38"}, {"name": "Julie Otero", "sub": "34"},
  {"name": "Josephine Otero", "sub": "11"}, {"name": "Joseph Otero II", "sub": "9"}], "gap": 0.5}}
{"scene": "memorial", "p": {"title": "IN MEMORIAM", "names": ["Name A", "Name B", "Name C"], "at": 0.6, "gap": 0.7}}
```

---

## id_badge
A laminated ID on dark fabric (`nameplate`: on the desk). It slides in from below with back-ease and rotation. A highlight sweeps across the laminate every 3.6 s, the lamp light breathes, and dust floats. The photo is a generic silhouette (head and shoulders, optional glasses frames), never a face.

| param | type | default | meaning |
|---|---|---|---|
| `kind` | `"badge"`\|`"card"`\|`"nameplate"` | `"badge"` | badge = vertical 540×820 on a lanyard + clip; card = horizontal 800×500 ID; nameplate = engraved metal plate on a dark base |
| `org` | string | `"CITY OF PARK CITY"` | header band text (wraps to 2 lines) |
| `title` | string | `"COMPLIANCE OFFICER"` | job title (badge: white on a colour band, wraps to 2 lines) |
| `name` | string | `"DENNIS RADER"` | big name (wraps to 2 lines on the badge) |
| `idno` | string | `"ID 0447-1991"` | ID number under the barcode |
| `photo` | `"silhouette"`\|`"none"` | `"silhouette"` | `none` = a faint emblem in the photo slot (badge) / text moves left (card) |
| `glasses` | bool | `true` | glasses frames + glint on the silhouette |
| `at` | number | `0.2` | slide-in start (0.8 s); before that, empty fabric |
| `stamp` | `{text, at, x, y, rot, w}` | – | rubber stamp slams onto the card with a jolt; `text` default `"CHURCH COUNCIL PRESIDENT"` (`"|"` = line break), `at` default `at + 1.6` |
| `flip` | number | – | time at which the card flips (0.75 s, lifts slightly) to its back |
| `back` | `{lines: string[]}` | `["PROPERTY OF <ORG>", "IF FOUND, PLEASE RETURN", "NOT TRANSFERABLE"]` | back side text (≤9 lines, wrapped) + magnetic strip + handwritten signature (initial + last name) + barcode |
| `red` | bool | `false` | red header band/title, glowing red laminate edge, red-tinted lanyard + faint red room light |
| `tilt` | number | `-0.035` (nameplate 0) | final rotation |
| `y` | number | badge 880, card 850, nameplate 860 | centre |

```json
{"scene": "id_badge", "p": {"kind": "card", "stamp": {"text": "CHURCH COUNCIL|PRESIDENT", "at": 1.6}, "flip": 3.6,
  "back": {"lines": ["CHRIST LUTHERAN CHURCH", "MEMBER SINCE 1970"]}}}
{"scene": "id_badge", "p": {"kind": "badge", "red": true, "org": "CITY OF PARK CITY", "title": "COMPLIANCE OFFICER", "name": "DENNIS RADER", "at": 0.3}}
```
