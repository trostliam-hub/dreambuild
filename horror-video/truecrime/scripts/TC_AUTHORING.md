# Authoring a true-crime part (Serie A "BTK" / Serie B "Hinterkaifeck")

Project root S = /tmp/claude-0/-home-user-dreambuild/2683a2bf-1f2f-55f0-8359-cd20e125af40/scratchpad

## Files and commands
- Part script: `S/en/<series>_part<N>.py` (series = `btk` or `hk`). It imports `S/en/tc_common.py` (voices, `base()`, `L()`, `save()`)
  and writes `S/en/<series>_part<N>.json`. Model the structure on `S/en/dwh_part4.py` (an older series: same engine, different scenes).
- Build (voice + timing + mix): `cd S && python3 -I en/<series>_part<N>.py $PWD && python3 -I tools/build.py en/<series>_part<N>.json en/<series>_p<N>`
  → `en/<series>_p<N>/timeline.json`, `mix.wav`. The log prints each TTS group with its Whisper transcript and CER (check for mispronunciations).
- Stills from the real timeline: `cd S && node video/render.cjs en/<series>_p<N>/timeline.json stills en/<series>_p<N>/st 30,150,300,...` (frame = seconds × 30;
  with a cold open the first `coldOpen.dur + coldOpen.gap` seconds are the teaser). Look at them with the Read tool.
- Full render (≈4–6 min): `bash S/tools/render_part.sh S/en/<series>_p<N> S/deliver/<name>.mp4` → also writes `en/<series>_p<N>/rev/sheet.jpg` (1 frame / 2 s).
- Use the Write/Edit tools to create files; use Bash only to run python/node/bash commands (a permission checker may block shell redirections).

## Story (top level, from `base(series, part, place, pill, kicker)`)
`series` = HUD label ("YOU ARE BTK · PART 1"), `place` = HUD small line, `ui.pill` = end-card pill, `ui.kicker`, `ui.end` = end-card title default.
Voices: `narrator` (Supertonic voice 8, natural male), `quote` (deeper calm male, documented quotes/ads/letters read aloud), `quote_f` (female).
Timing defaults: lineGap 0.14 s, beatGap 0.06 s, fluent: consecutive lines of the same voice in a beat are spoken in ONE TTS call (natural flow).
`story["beds"] = [{"name": "drone_bed", "from": 0, "to": 200, "gain": 1, "fade": 0.4}, {"name": "...", "fromBeat": 3, "toBeat": 6, "gain": -4, "fade": 0.6}]`
`story["coldOpen"] = {"beat": i, "words": "verbatim contiguous words spoken in beat i", "label": "LATER"}` (3–8 words, a complete phrase, second half of the part;
 the build cuts that moment from the mix and puts it in front with a red frame + static gap; it fails loudly if the words are not found).

## Beat keys
`scene` (name), `p` (scene params), `lines` [L("text", voice=..., emph=["word"], say="pronunciation spelling", gap=s (pause after; splits the group), speed=, gain=)],
`clock` (HUD big text, e.g. "JAN 1974", "1977", "FEB 2005"), `clockRed` (climax), `place` (HUD small line override),
`zoom` [s0, s1] (≤1.12 unless the focus keeps the HUD clear), `focus` [x, y], `pan` [x0, y0, x1, y1], `punch` [t…] (quick zoom punches),
`trans` "cut" | "glitch" | "fade" (into this beat), `pre` / `post` (s of silence before/after the lines), `minDur`,
`captionY` (default 1250; use 1500 with `capBox: true` for most scenes so captions sit below the art), `capBox`, `noCaptions`,
`sfx` [{name, at, gain, dur}] (`fromEnd` instead of at), `flash` [{at, d, c, a}], `glitch` [{at, d}], `shakeAt` [{at, d, a}], `vignette` (0..1), `redPulse`, `flashback` + `flashLabel`.
Any time value in `p`, `sfx[].at`, `punch`, `flash`, `glitch`, `shakeAt` may be a number (s from beat start) or `"@word"`, `"@word+0.4"`, `"@word-0.2"`
= the start of that spoken word in THIS beat (lowercase, punctuation stripped, apostrophes removed: "you're" → "@youre", first occurrence). The word must exist in the beat.
Sync events to words (e.g. a newspaper headline slams in at "@headline", a stamp at "@received"). Never put a loud hit on top of an important word — use `@word+0.4` or a pause.

## Scenes
- New true-crime scenes: read `S/video/SCENE_REF_tc_docs.md`, `SCENE_REF_tc_places.md`, `SCENE_REF_tc_screens.md`, `SCENE_REF_tc_farm.md`, `SCENE_REF_tc_justice.md`
  (title_card, letter, newspaper, years_flip, memorial, id_badge, house_ext, church_ext, phone_booth, police_lights, tv_news, computer_disk, evidence_board,
  city_map, farm_snow, footprints, attic, barn, kitchen_old, investigators_old, courtroom, cell, double_life).
- Generic scenes from `S/video/SCENE_REFERENCE.md`: sfx_text (huge glowing words, `bg` = any scene name drawn dimmed behind with `bgP`), rule_card, face_closeup,
  choice_split (A vs B question), end_card (`title`, `kicker`, `pill`, `sub` "LINE 1|LINE 2"), photo_reveal, street_lamp, door_inside, hallway, black.
- SFX names: see `S/video/SCENE_REFERENCE.md` (incl. the true-crime section with typewriter, gavel, siren, rain/wind beds, etc.). Hits -3..-8 dB, foley -2..-8, beds -4..+2.

## Quality bar
- 60–75 s total incl. cold open. Every beat 2.5–7 s. Something visibly changes every 2–4 s (an event synced to a word, a camera punch, a cut).
- Captions must never cover the key visual: check stills at the words where text appears on screen; use captionY/capBox or noCaptions when the art shows the exact words.
- Text in the art must match the narration and the facts exactly (dates, names, spelling).
- End-card beat last: `{"scene": "end_card", "p": {"title": "...", "kicker": "PART N", "pill": "FOLLOW FOR PART N+1", "sub": "QUESTION?|TELL ME IN THE COMMENTS"}, "noCaptions": False, ...}` with the end line.
