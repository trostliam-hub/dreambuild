#!/bin/bash
# chk.sh <builddir> <t1,t2,...> <outprefix>  – Standbilder als Kontaktbogen (Hilfslinien: TikTok-UI unten / rechts)
S=${WORK:-$(cd "$(dirname "$0")/.." && pwd)}  # Arbeitsverzeichnis mit tools/ und video/
D=$1; mkdir -p $D/chk; rm -f $D/chk/*.png
FR=$(python3 -c "print(','.join(str(int(float(t)*30)) for t in '$2'.split(',')))")
cd $S/video && timeout 900 node render.cjs $D/timeline.json stills $D/chk $FR >/dev/null 2>&1
cd $D/chk && python3 -c "
from PIL import Image, ImageDraw; import glob
fs=sorted(glob.glob('f*.png')); ims=[Image.open(f).resize((360,640)) for f in fs]
for i in range(0,len(ims),8):
  s=Image.new('RGB',(360*4,640*2))
  for j,im in enumerate(ims[i:i+8]):
    d=ImageDraw.Draw(im); d.line([(0,540),(360,540)],fill=(0,255,0)); d.line([(313,0),(313,640)],fill=(0,255,0)); s.paste(im,((j%4)*360,(j//4)*640))
  s.save('$3'+str(i//8)+'.jpg',quality=85)"
