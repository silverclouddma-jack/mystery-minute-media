"""Long-form thumbnail 1280x720 from the dark toon lineup (the breakout riddle-compilation look: one case's question
on a bar over a numbered lineup). Uses case.json for the people. Run from the kit folder after voice/words exist:
   python3 tools/thumb.py "WHO IS " "LYING?" "8 DETECTIVE RIDDLES · ONLY 1% SOLVE ALL" out.jpg
(question part 1 in cream, part 2 in red, bottom pill text, output path)"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
q1, q2, pill, out = sys.argv[1:5]
env = dict(os.environ, SOFTWARE_GL='1', QS='&res=1&aa=4&shadow=2048&clean=1')
subprocess.run(['node', 'tools/capture.mjs', 'frames', 'review/thumb', '0.05'], check=True, env=env, stdout=subprocess.DEVNULL)
im = Image.open('review/thumb/t0.05.jpg').convert('RGB')
y0 = 305; c = im.crop((0, y0, 1080, y0 + 608)).resize((1280, 720), Image.LANCZOS)
d = ImageDraw.Draw(c, 'RGBA'); IB = 'fonts/Inter-Black.otf'; FB = 'fonts/FreeMonoBold.ttf'
d.rectangle((0, 0, 1280, 150), fill=(10, 12, 17, 235)); d.rectangle((0, 146, 1280, 152), fill=(228, 50, 43, 255))
size = 104
while True:
    f = ImageFont.truetype(IB, size); w1 = d.textlength(q1, font=f); w2 = d.textlength(q2, font=f)
    if w1 + w2 < 1200 or size < 60: break
    size -= 4
x = (1280 - w1 - w2) / 2; y = 75 - size * 0.55
d.text((x + 4, y + 6), q1 + q2, font=f, fill=(0, 0, 0, 160)); d.text((x, y), q1, font=f, fill=(234, 227, 210)); d.text((x + w1, y), q2, font=f, fill=(228, 50, 43))
f2 = ImageFont.truetype(FB, 46); tw = d.textlength(pill, font=f2)
while tw > 1180: f2 = ImageFont.truetype(FB, f2.size - 2); tw = d.textlength(pill, font=f2)
d.rounded_rectangle(((1280 - tw) / 2 - 24, 630, (1280 + tw) / 2 + 24, 700), 16, fill=(10, 12, 17, 225), outline=(201, 161, 59), width=3)
d.text(((1280 - tw) / 2, 665 - f2.size * 0.55), pill, font=f2, fill=(241, 217, 166))
c.save(out, quality=92); print(out, '(LOOK AT IT)')
