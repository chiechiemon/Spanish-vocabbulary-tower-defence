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
- Words you miss come back more often
- Optional box to add your own words

## Files
- `index.html` page and styles
- `game.js` game logic
- `vocab.js` the vocabulary data

## Adding words permanently
Add lines to the `DATA` string in `vocab.js`, tab-separated: Spanish, meaning, unit, sentence.

## Note
The vocabulary comes from university course material. Keep the repo private if you are not sure you may share it.
