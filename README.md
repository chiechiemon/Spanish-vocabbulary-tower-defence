# Palabras Defense

A Spanish vocabulary tower-defence game. Words walk toward your base; type the meaning before they arrive.

## Play
Open `index.html` in a browser (double-click it). No install or build step.

## Features
- All course vocab built in, filterable by unit
- Spanish → English/Dutch or English → Spanish
- Lives (3 / 5 / 10 / unlimited) and speed settings
- Nouns shown with el / la / los / las instead of (m) / (f)
- Forgiving answer matching: ignores accents and filler words, tolerates small typos
- Mark weak words yourself with a star (after a game or in Browse vocabulary), view them in "My weak words", and practice only them
- Pronunciation: 🔊 buttons in the vocabulary table and after games, optional auto-speak while playing, voice picker (uses your device's Spanish voices)
- Progress saved in your browser, with a progress screen showing a bar per unit
- Optional box to add your own words

## Files
- `index.html` page and styles
- `game.js` game logic
- `vocab.js` the vocabulary data

## Adding words permanently
Add lines to the `DATA` string in `vocab.js`, tab-separated: Spanish, meaning, unit, sentence.

## Note
The vocabulary comes from university course material. Keep the repo private if you are not sure you may share it.
