# Mystery Minute · dark toon LONG-FORM kit (16:9)

The template for the "Case Files" compilations (4 a week) in the dark toon style. Same look as the dark toon Shorts
(`kits/dark-toon/`), laid out for 1920x1080, with any number of cases (8 is the plan). Built on faceless-shorts `tall-tale`.

## Make a volume
1. Copy this folder to a fresh working folder and write `volume.json` (schema below).
2. `bash tools/build.sh --frames`, then LOOK at `review/keys.jpg` (one frame per shot: open, each title card, each
   setup, statement, note, evidence chip, countdown, reveal, the plug, the close). Fix volume.json (shorter text) and repeat.
3. `bash tools/build.sh --render` (run it in the background and poll; about 30-45 min for 8 cases on 2 CPU cores).
   It writes `renders/final.mp4` and prints the chapter timestamps for the description.
4. Look at a frame every 10 s of the final file before posting.

## volume.json
```json
{
  "title": "Case Files Vol. 4",
  "featured": 0,                        // index of the featured case: shown in the cold open, leads the title + thumbnail
  "cases": [ CASE, CASE, ... ]          // 8 cases; hardest last; plug plays after case 3
}
```
A CASE is one of three formats:
- **"suspects"** (one item, four suspects) and **"liar"** (spot the liar): the same fields as the Shorts kit's case.json
  (title, item, setup[], suspects[] with name/role/say/slip/look, clues[] with label/text/say, ask, question, answer,
  stamp, reveal, why[], out[]). `question` is ONE short line here, e.g. ["WHO TOOK THE WATCH?"]. Liar cases show
  "TRUTH" stamps on the honest people, suspects cases show "OUT".
- **"code"** (crack the code): title, item, setup[], `note` (the coded text, shown big on paper, under ~20 characters),
  `noteSay` (how the narrator reads it), clues[] (the rule, the key facts), ask, question, `answerText` (the decoded
  answer, written in red under the note on the reveal), reveal, why[]. Optional `suspects` (3 people) + `answer` index
  if the decoded word picks a person: then the reveal shows the lineup with the ring.
The narration adds "Case N. <title>.", "Pause the video and solve it." after `ask`, a 5.6 s silent countdown,
"If you got it, give yourself a point.", the plug after case 3 and the close. Keep each case to ~110 words spoken.

## Thumbnail
Use the Shorts kit's `tools/thumb.py` (kits/dark-toon) with the featured case's people.
