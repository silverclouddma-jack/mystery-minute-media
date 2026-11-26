"""Dark toon kit: case.json -> script.json (narration lines + the index of every beat in "beats").
   python3 tools/make_script.py [project=.]
The shot list (src/shots.js) reads "beats", so a new case only needs a new case.json.
"""
import json, sys
from pathlib import Path

P = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
C = json.loads((P / 'case.json').read_text())
lines, beats = [], {}
def add(key, text, **kw):
    lines.append({'text': text, **kw}); i = len(lines) - 1
    if key.endswith('[]'): beats.setdefault(key[:-2], []).append(i)
    else: beats[key] = i
add('hook', C['hook'], gap=0.35)
for s in C['setup']: add('setup[]', s)
add('examine', 'Examine the evidence.', gap=0.3)
for s in C['suspects']: add('suspects[]', s['say'], gap=0.25)
for c in C['clues']: add('clues[]', c['say'], gap=0.25)
add('question', C['ask'], gap=3.4)
add('reveal', C['reveal'], gap=0.3)
for w in C['why']: add('why[]', w)
add('close', 'Fifty more cases are waiting in the Mystery Minute Detective Casebook.', gap=0.3)
S = {'title': C['title'], 'voice': 'am_onyx', 'speed': 1.06, 'lead': 0.25, 'outro': 1.0, 'gap': 0.2, 'music': 'tension',
     'beats': beats, 'lines': lines}
(P / 'script.json').write_text(json.dumps(S, indent=1))
print(f"script.json: {len(lines)} lines, {sum(len(l['text'].split()) for l in lines)} words")
