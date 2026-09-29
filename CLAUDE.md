# CrankScore

MTB-Konfigurator als PWA; fast alles steht in `index.html`. Texte und Kommentare auf Deutsch.

## Veröffentlichen

Veröffentlichen heißt: auf `main` pushen. Die Action `.github/workflows/veroeffentlichen.yml`
stempelt danach `APP_VERSION` in `index.html` und den Cache-Namen in `mtb-sw.js` und lässt
GitHub Pages neu bauen. Nicht von Hand stempeln. Die App liegt unter
https://crankscore.de (seit 2026-09-29; die alte Adresse trostliam-hub.github.io/dreambuild
leitet dorthin weiter, die Datei `CNAME` darf nicht weg) und zeigt „Neue Version laden“, sobald der Stempel neu ist.
