# CrankScore

MTB-Konfigurator als PWA; fast alles steht in `index.html`. Texte und Kommentare auf Deutsch.

## Veröffentlichen

Veröffentlichen heißt: auf `main` pushen. Die Action `.github/workflows/veroeffentlichen.yml`
stempelt danach `APP_VERSION` in `index.html` und den Cache-Namen in `mtb-sw.js` und lässt
GitHub Pages neu bauen. Nicht von Hand stempeln. Die App liegt unter
https://trostliam-hub.github.io/dreambuild/ (Testadresse — die App ist noch nicht veröffentlicht;
auf crankscore.de steht nur eine Teaser-Seite aus dem Repo `trostliam-hub/crankscore-web`, ohne
Link zur App. Keine Datei `CNAME` in dieses Repo legen, solange Liam nicht veröffentlicht) und zeigt „Neue Version laden“, sobald der Stempel neu ist.
