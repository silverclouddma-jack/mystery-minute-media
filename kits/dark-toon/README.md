# Mystery Minute · dark toon kit

The reusable template for the daily **dark toon** Shorts (3:00 PM spot the liar, 6:00 PM one item and four suspects).
Built on the faceless-shorts `tall-tale` style. Look and rules: project doc `claude/mm-style-test.md`.

## Make a Short
1. Copy this folder to a fresh working folder.
2. Write `case.json` (schema below). That is the only file a new case needs.
3. `bash tools/build.sh --frames`, then LOOK at `review/keyframes.jpg` (hook, examine, each statement, each clue,
   countdown, reveal, OUT stamps, close). Fix `case.json` (shorter text) and repeat.
4. `bash tools/build.sh` renders `renders/final.mp4` (about 6-10 min without a GPU, two processes in parallel),
   with the 5-second Reader Verdict end card appended. Look at a frame every 3 s of the final file before posting.

## case.json
```json
{
  "slug": "who-stole-the-gold-pocket-watch",
  "format": "suspects",            // "suspects" (one item, four suspects) or "liar" (spot the liar: statements shown at the countdown)
  "title": "The Clockmaker's Window",
  "hook": "Four suspects. One stolen pocket watch. Who took it?",   // first spoken line = the challenge
  "item": "GOLD POCKET WATCH",     // the item card on frame 1 (liar cases: what went missing / broke)
  "setup": ["One sentence of setup."],
  "set": { "wall": "#2B2731", "motif": "#35303D", "floor": "#4A3A30", "sky": "storm" },   // sky: storm | night
  "suspects": [                    // 3 or 4 people, in lineup order (left to right)
    { "name": "ROSA", "role": "Clockmaker",
      "say": "Rosa, the clockmaker: I was winding clocks in the back room.",   // spoken
      "slip": "\"I was winding clocks in the back room.\"",                    // on the paper slip
      "look": { "body": "#8A5A7A", "hat": "bun", "hatCol": "#3A2A22", "pattern": "apron", "extra": ["glasses"] } }
  ],
  "clues": [ { "label": "WINDOW CASE", "text": "Opened at 8:30 PM", "say": "The window case was opened at eight thirty." } ],
  "ask": "So who took the watch? Comment your answer.",   // spoken; the 5 s silent countdown follows
  "question": ["WHO TOOK THE", "POCKET WATCH?"],          // red, 1-2 short lines
  "answer": 2,                     // index into suspects
  "stamp": "THIEF",                // red stamp over the answer (LIAR for spot-the-liar)
  "reveal": "It was June.",
  "why": ["One line on why each other person is out."],
  "out": ["WINDING CLOCKS", "LEFT AT 8:00", "", "IN AT 9:00"]   // small note under each OUT stamp ("" for the answer)
}
```
Toon looks (`look`): body colour, `pattern` plain|check|stripes|overalls|vest|apron, `hat` none|cap|bowler|boater|beanie|
visor|tophat|bun|flower|bow|mailcap|fedora (fedora is the host's: don't give it to suspects), `neck` none|bowtie|tie|
scarf|collar, `extra` mustache|glasses|freckles|blush|pencil|monocle. Give every suspect a different body colour and hat.
Keep the whole script to about 110-130 words (about 45 s); keep slips under ~60 characters and clue texts under ~50.

## Rules kept by the kit
Red only for the question, the ring and the answer stamp (plus the host's hat). Statements on paper slips, clues on dark
chips with brass tabs, OUT stamps in cream. Lineup and item card on screen from frame 1. Captions FreeMono cream at
y 1330, hidden during the countdown. Voice am_onyx x1.06, music "tension". Close: host + casebook cover +
"50 CASES · MYSTERYMINUTEHQ.COM", spoken "Fifty more cases are waiting in the Mystery Minute Detective Casebook."
