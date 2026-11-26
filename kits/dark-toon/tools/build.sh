#!/bin/bash
# Mystery Minute dark toon: case.json -> renders/final.mp4 (Short + 5 s Reader Verdict end card), in one go.
#   bash tools/build.sh [--frames]      --frames: stop after the review frames (no video)
# Needs: the faceless-shorts skill (for voice.py / words.py), node 22, ffmpeg, chrome. No GPU needed.
set -eu
cd "$(dirname "$0")/.."
SK="${FACELESS_SKILL:-$(ls -d /root/.claude/skills/*/*/faceless-shorts /root/.claude/skills/faceless-shorts ~/.claude/skills/*/*/faceless-shorts 2>/dev/null | head -1)}"
[ -d "$SK" ] || { echo "faceless-shorts skill not found: set FACELESS_SKILL"; exit 2; }
export SOFTWARE_GL=1 QS='&res=0.6&aa=0&shadow=1024' FPS=24
python3 tools/make_script.py
"$SK/scripts/py" "$SK/scripts/voice.py" . | tail -1
"$SK/scripts/py" "$SK/scripts/words.py" . | tail -1
node tools/capture.mjs check | tail -1
D=$(python3 -c "import json;print(json.load(open('data/lines.json'))['duration'])")
python3 - <<EOF
import json; S=json.load(open('script.json')); L=json.load(open('data/lines.json'))['lines']; B=S['beats']
ts=[0.3]+[L[i]['start']+0.6 for k in ('examine',) for i in [B[k]]]+[L[i]['end']-0.2 for i in B['suspects']]+[L[i]['end']-0.1 for i in B['clues']]
ts+=[L[B['question']]['end']+1.5, L[B['reveal']]['end'], L[B['why'][-1]]['end']-0.2, L[B['close']]['start']+1.0]
open('review/times.txt','w').write(','.join(f'{t:.2f}' for t in ts))
EOF
rm -rf review/k; node tools/capture.mjs frames review/k "$(cat review/times.txt)" >/dev/null
python3 - <<'EOF'
from PIL import Image; import glob
fs=sorted(glob.glob('review/k/*.jpg'),key=lambda f: float(f.split('/t')[-1][:-4])); ims=[Image.open(f).resize((270,480)) for f in fs]; c=6; r=(len(ims)+c-1)//c
W=Image.new('RGB',(270*c,480*r)); [W.paste(im,((i%c)*270,(i//c)*480)) for i,im in enumerate(ims)]; W.save('review/keyframes.jpg'); print('review/keyframes.jpg (LOOK AT IT)')
EOF
[ "${1:-}" = "--frames" ] && exit 0
node tools/capture.mjs cues >/dev/null; "$SK/scripts/py" tools/mix.py . | tail -1
H=$(python3 -c "print(round($D/2,3))"); mkdir -p renders/par; rm -f renders/par/*
node tools/capture.mjs video renders/par/q0.mp4 0 "$H" > renders/par/log0.txt 2>&1 &
node tools/capture.mjs video renders/par/q1.mp4 "$H" "$D" > renders/par/log1.txt 2>&1 &
wait
(cd renders/par && printf "file 'q0.mp4'\nfile 'q1.mp4'\n" > list.txt && ffmpeg -y -v error -f concat -safe 0 -i list.txt -c copy v.mp4)
ffmpeg -y -v error -i renders/par/v.mp4 -i data/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest renders/short.mp4
# Reader Verdict end card (Jack, Nov 25 2026: every Short ends with it)
if [ ! -f data/endcard.mp4 ]; then curl -sfLo data/endcard.mp4 https://raw.githubusercontent.com/silverclouddma-jack/mystery-minute-media/main/assets/reader-verdict-endcard.mp4 || rm -f data/endcard.mp4; fi
if [ -f data/endcard.mp4 ]; then
  ffmpeg -y -v error -i renders/short.mp4 -i data/endcard.mp4 -filter_complex "[0:v]fps=24,scale=1080:1920,setsar=1,format=yuv420p[a];[1:v]fps=24,scale=1080:1920,setsar=1,format=yuv420p[b];[a][b]concat=n=2:v=1:a=0[v];[0:a]apad=pad_dur=5.1[au]" -map "[v]" -map "[au]" -shortest -c:v libx264 -crf 18 -preset veryfast -c:a aac -b:a 160k -movflags +faststart renders/final.mp4
  echo "renders/final.mp4 (with end card)"
else cp renders/short.mp4 renders/final.mp4; echo "renders/final.mp4 (NO END CARD: download failed)"; fi
