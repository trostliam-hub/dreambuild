# App photo review — 14 October 2026

Read-only review of `/workspace/crankscore-app-images` with fresh, isolated Chromium browser profiles. No app files, catalog mappings, user data, Git branches or publication settings were edited. Harnesses and evidence are confined to this review folder.

## Verified behavior

- `matrix.json`: **256/256** checks, covering 320, 390, 768 and 1280 px, OLED/light themes and German/English.
- `entrypoints.json`: **392/392** checks, covering 390 and 1280 px in both themes and languages. Main build photos, all three screenshot fork models, detail photos, matching-part finder, comparison, wishlist, planned purchases, full shopping list, and suspension onboarding for frame/fork/shock all open the independent photo viewer.
- Escape and the close button restore the prior app view, selected build, search, list scroll and focus. Photo viewing does not change localStorage. An underlying parts sheet stays open and locked; viewing from the main build independently releases its own scroll lock.
- `touch.json`: an actual one-finger mobile swipe (Chromium touch events) on a zoomed photo at 320 px moves horizontal scroll from 0 to 288 px while the underlying parts list stays at the same scroll position. This covers the case where the photo overflows horizontally but does not overflow vertically.
- Keyboard Tab and Shift+Tab wrap through close, zoom and source controls. Zoom enlarges the image and permits horizontal/vertical scrolling; fitting resets scroll.
- Selecting a fork, saving it, moving it to purchases, the 203 mm brake adapter calculation and visible adapter notice still work. No nested photo buttons and no page script errors occurred.
- `offline.json`: the actual service worker was installed, the three fork images were visited online, and the app was then reloaded offline. All three images still open, decode and appear on black. LocalStorage is identical before/after; no script errors.
- `renderer.json` and actual screenshots verify real source photos on black: Selva V, a white Commencal Meta HT, a silver Meta TR, Rocky Mountain Instinct, DT Swiss EX1700, Shimano XT wheel, Shimano XTR caliper and Cane Creek eeWings. Product text, colored finish, metallic highlights and spokes remain visible.

## Defects found and corrected during review

1. The Selva V's enclosed studio background between the fork legs remained white. The renderer now clears large enclosed background regions in all product categories; `new-selvav-fixed.png` verifies the correction.
2. In the detail sheet the large photo figure shrank to a 2 px border because of the flex column. Its 260 px photo was clipped and following specs intercepted clicks. `.fw-foto { flex-shrink:0 }` resolves it; actual list → View → photo → close → back-to-list paths pass. Original proof: `detail-overlap-defect.png`.
3. Fork/shock and frame cards in suspension onboarding had icons despite available photos. Both now expose real clickable photos with their original icon fallback retained.
4. Photos of products touching a corner were left on white. Corner consensus now clears KMC chains, Trickstuff brakes and Pirelli tyres, preserving the actual product. The affected images were visually rechecked after this change, with unchanged gold/black/metallic product details.

## Final background review

After verified replacement packshots and the final renderer correction, all **24 previously problematic or high-risk sample photos** pass visual review on black (`renderer-final.json`, `rendered-*.png`). This includes all three requested forks, white and metallic frames, the Rise complete-bike reference with cleared wheel interiors, Bontrager Line Elite, Newmen, Industry Nine, e*thirteen, Renthal, KMC, Trickstuff and Pirelli.

Bontrager's studio wall/floor and enclosed wheel background are gone. The e*thirteen and Industry Nine spoke halos seen during the temporary strict-tolerance change are resolved. White frame paint and grip rubber remain visible; metallic components retain highlights, logos and colored finishes. This is a sample-based visual review, not a claim that every pixel of all 679 source files was manually inspected.

The frozen behavior matrices were rerun: **256/256 + 392/392 = 648/648** checks. The offline and real mobile touch swipe checks were also rerun after the final renderer update, with all three forks available offline, unchanged localStorage, a working horizontal swipe and no script errors.

`rapid.json` also verifies the independent viewer's close-event protection: 20 immediate open/close cycles in each theme followed by another open do not clear the newly opened image or lose its scroll lock when old native close events arrive. Closing releases its own lock. The status-bar theme color is black while viewing, then restores to `#f2f0ec` in light mode or `#000000` in dark mode.

No material release blocker remains within the tested review scope. The parent agent owns the required repository test gate, publication workflow and live checks; this reviewer did not publish anything.
