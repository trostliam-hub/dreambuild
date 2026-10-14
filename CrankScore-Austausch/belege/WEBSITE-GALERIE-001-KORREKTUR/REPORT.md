# Website gallery correction — 14 October 2026

The user clarified that the requested feature images and image viewer belong in the app. The added website gallery has therefore been reverted without altering the earlier Bevel-inspired OLED design or product information.

- Repository: `trostliam-hub/crankscore-web`
- Restored content: `45101342c9d2c05b76ff08c56d7fc775ff0d47ea`
- Reverted commit: `2cba004c0301ebbbead876e8d725f2e43913ba5a`
- Published rollback: `7446a82b8df62430526299baa8b61307ad282f80`
- Existing Pages workflow: https://github.com/trostliam-hub/crankscore-web/actions/runs/38563803119 — successful
- Public website: https://crankscore.de/
- Restored automatic asset cache identifier: `e578a3e2`

## Verification

`node werkzeuge/texte.mjs --pruefen` passed: 210 entries, all 210 used in HTML. The complete source tree matches the desired pre-gallery commit. The domain and legal content remain identical. No manual version or cache stamp was applied.

The responsive browser audit passed all 72 cases: German and English, light and dark designs, 320/390/768/1024/1440/1920 px, landing page and both legal pages. It found no overflow, missing images, translation mismatch, JavaScript/resource error, reduced-motion violation or computed contrast failure.

Eight mobile-menu cases passed, including keyboard opening, Tab focus, Escape, outside click, section jumps and FAQ opening. Theme and language changes, stored preferences, cross-tab synchronisation, share fallback, anchors, FAQ and no-JavaScript rendering were checked.

The public browser audit passed all eight cases: German/English, light/dark, 390/1440 px, images, layout, switching, menu, FAQ and legal-page preference persistence. Dark mode has a true `rgb(0, 0, 0)` body background.

The live integrity audit compared 44 deployed files with the desired commit, including HTML/CSS/JavaScript and all 36 retained app screenshots. All were byte-identical. The removed gallery scripts, styles and additional screenshots return HTTP 404. Details are in `live/integrity.json`.

Evidence: `report.json`, `summary.txt`, `mobile-menu.json`, `behavior.json`, `source-check.json`, `workflow.json`, `live/report.json` and `live/integrity.json`.

No app repository files or exchange folder files were changed by this website subtask.
