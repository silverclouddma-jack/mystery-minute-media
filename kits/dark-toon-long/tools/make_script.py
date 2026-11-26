"""Dark toon LONG-FORM kit: volume.json -> script.json (all narration lines + the index of every beat per case).
   python3 tools/make_script.py [project=.]
"""
import json, sys
from pathlib import Path

P = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
V = json.loads((P / 'volume.json').read_text())
N = len(V['cases'])
NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][N] if N <= 12 else str(N)
lines = []
def add(text, **kw): lines.append({'text': text, **kw}); return len(lines) - 1
beats = {'open': add(V.get('open', f'{NUM.capitalize()} cases. Only one percent solve them all. Can you?'), gap=0.4), 'cases': []}
for k, c in enumerate(V['cases']):
    b = {'title': add(f"Case {k + 1}. {c['title']}.", gap=0.3)}
    b['setup'] = [add(s) for s in c.get('setup', [])]
    b['suspects'] = [add(s['say'], gap=0.2) for s in c.get('suspects', [])] if c['format'] != 'code' else []
    if c['format'] == 'code': b['note'] = add(c['noteSay'], gap=0.3)
    b['clues'] = [add(x['say'], gap=0.2) for x in c.get('clues', [])]
    b['ask'] = add(c['ask'] + ' Pause the video and solve it.', gap=5.6)
    b['reveal'] = add(c['reveal'], gap=0.25)
    b['why'] = [add(w) for w in c.get('why', [])]
    b['score'] = add('If you got it, give yourself a point.', gap=0.5)
    beats['cases'].append(b)
    if k == min(2, N - 2):
        beats['plug'] = add('Want more? Fifty more cases are in the Mystery Minute Detective Casebook, and five free ones at Mystery Minute H Q dot com.', gap=0.5)
beats['close'] = [add(f'Comment your score out of {NUM}, subscribe, and examine the evidence.', gap=0.3),
                  add('Fifty more cases are waiting in the Mystery Minute Detective Casebook.', gap=0.3)]
S = {'title': V.get('title', 'Case Files'), 'voice': 'am_onyx', 'speed': 1.06, 'lead': 0.25, 'outro': 1.2, 'gap': 0.2, 'music': 'tension', 'beats': beats, 'lines': lines}
(P / 'script.json').write_text(json.dumps(S, indent=1))
print(f"script.json: {N} cases, {len(lines)} lines, {sum(len(l['text'].split()) for l in lines)} words")
