#!/bin/bash
# Mystery Minute dark toon LONG-FORM: volume.json -> renders/final.mp4 (16:9, 1920x1080).
#   bash tools/build.sh --frames   voice + timing + one review frame per shot (review/keys.jpg), no video
#   bash tools/build.sh --render   cues + mix + the two-process render + final.mp4 (run in the background; 30-45 min for 8 cases)
# Needs: the faceless-shorts skill (voice.py / words.py), node 22, ffmpeg, chrome. No GPU needed.
set -eu
cd "$(dirname "$0")/.."
SK="${FACELESS_SKILL:-$(ls -d /root/.claude/skills/*/*/faceless-shorts /root/.claude/skills/faceless-shorts ~/.claude/skills/*/*/faceless-shorts 2>/dev/null | head -1)}"
[ -d "$SK" ] || { echo "faceless-shorts skill not found: set FACELESS_SKILL"; exit 2; }
export SOFTWARE_GL=1 QS='&res=0.6&aa=0&shadow=1024' FPS=24
mkdir -p review renders/par
if [ "${1:-}" = "--frames" ]; then
  python3 tools/make_script.py
  "$SK/scripts/py" "$SK/scripts/voice.py" . | tail -1
  "$SK/scripts/py" "$SK/scripts/words.py" . | tail -1
  node tools/capture.mjs check | tail -1
  node tools/capture.mjs check 2>&1 | grep -E "^(open|c[0-9]|plug|close)" | awk '{print $1, $2, $4}' | python3 -c "
import sys
ts=[]
for l in sys.stdin:
    n,a,b=l.split(); a=float(a); b=float(b)
    if n.endswith('ask'): ts.append(round(a+(b-a)*0.75,2))
    elif n.endswith('reveal'): ts.append(round(b-0.6,2))
    else: ts.append(round(min(a+1.4,(a+b)/2+0.6),2))
print(','.join(map(str,ts)))" > review/times.txt
  rm -rf review/k; node tools/capture.mjs frames review/k "$(cat review/times.txt)" >/dev/null
  python3 -c "
from PIL import Image; import glob
fs=sorted(glob.glob('review/k/*.jpg'),key=lambda f: float(f.split('/t')[-1][:-4])); ims=[Image.open(f).resize((480,270)) for f in fs]; c=4; r=(len(ims)+c-1)//c
W=Image.new('RGB',(480*c,270*r)); [W.paste(im,((i%c)*480,(i//c)*270)) for i,im in enumerate(ims)]; W.save('review/keys.jpg'); print('review/keys.jpg: LOOK AT IT', len(fs), 'frames')"
  python3 -c "import json;print('duration', json.load(open('data/lines.json'))['duration'], 's')"
  exit 0
fi
if [ "${1:-}" = "--render" ]; then
  node tools/capture.mjs cues >/dev/null; "$SK/scripts/py" tools/mix.py . | tail -1
  D=$(python3 -c "import json;print(json.load(open('data/lines.json'))['duration'])"); H=$(python3 -c "print(round($D/2,3))")
  rm -f renders/par/*
  node tools/capture.mjs video renders/par/q0.mp4 0 "$H" > renders/par/log0.txt 2>&1 &
  node tools/capture.mjs video renders/par/q1.mp4 "$H" "$D" > renders/par/log1.txt 2>&1 &
  wait
  (cd renders/par && printf "file 'q0.mp4'\nfile 'q1.mp4'\n" > list.txt && ffmpeg -y -v error -f concat -safe 0 -i list.txt -c copy v.mp4)
  ffmpeg -y -v error -i renders/par/v.mp4 -i data/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 21 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart renders/final.mp4
  echo "renders/final.mp4"; python3 - <<'PY'
import json; S=json.load(open('script.json')); L=json.load(open('data/lines.json'))['lines']; V=json.load(open('volume.json'))
def ts(t): t=int(t); return f"{t//60}:{t%60:02d}"
print('CHAPTERS:'); print('0:00 Intro')
for k,(b,c) in enumerate(zip(S['beats']['cases'],V['cases'])): print(f"{ts(L[b['title']]['start'])} Case {k+1}: {c['title']}")
PY
  exit 0
fi
echo "usage: build.sh --frames | --render"
