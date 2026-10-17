# Keystroke – Typing Practice Tool

A keyboard typing trainer that measures speed (WPM) and accuracy, then gives an analytical report with suggestions and an assigned next exercise.

## Run
Open `index.html` in any modern browser. No build step or server needed.
(Internet is only needed for the Google Fonts; the app falls back to system fonts offline.)

## Structure
- `index.html`   page layout
- `css/style.css` styling (light/dark themes via CSS variables)
- `js/app.js`    exercises, typing engine, report, suggestions, progress

## Features
- 8 exercises: home/top/bottom row, common words, sentences, numbers & symbols, code, weak-key drill
- Short / medium / long lengths
- Live WPM, accuracy, time, mistakes, progress bar, on-screen keyboard with next-key highlight
- Report: speed-over-time chart, consistency, weakest keys, key heatmap, suggestions
- Adaptive assignment: weak-key drill on low accuracy, next level on clean runs
- Progress saved in browser localStorage

## Customise
- Add exercises: edit the `L` array in `js/app.js` (`id`, `name`, `desc`, `n` = tokens per run, `pool` = words/sentences).
- Change colours: edit the variables at the top of `css/style.css`.

## Ideas for next steps
Timed mode, user accounts + backend storage, printable/PDF report, keyboard layouts (Dvorak, Colemak), multiplayer races.
