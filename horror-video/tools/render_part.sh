#!/bin/bash
# render_part.sh <builddir> <out.mp4>: rendert timeline.json in 3 Segmenten, muxt mix.wav, kleine Datei
set -e
S=${WORK:-$(cd "$(dirname "$0")/.." && pwd)}  # Arbeitsverzeichnis mit tools/ und video/
V=$S/video; B=$1; OUT=$2; O=$B/seg
mkdir -p $O; cp $B/timeline.json $O/tl.json; cp $B/mix.wav $O/mix.wav
N=$(python3 -c "import json; print(int(json.load(open('$O/tl.json'))['duration']*30))"); Q=$((N/3))
node $V/render.cjs $O/tl.json segment 0 $Q $O/s0.mp4 > $O/l0.txt 2>&1 &
node $V/render.cjs $O/tl.json segment $Q $((2*Q)) $O/s1.mp4 > $O/l1.txt 2>&1 &
node $V/render.cjs $O/tl.json segment $((2*Q)) $N $O/s2.mp4 > $O/l2.txt 2>&1 &
wait
grep -ih "error" $O/l*.txt | head -3 || true
cd $O && printf "file '%s'\n" s0.mp4 s1.mp4 s2.mp4 > list.txt && ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy video.mp4
ffmpeg -v error -y -i video.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 23 -maxrate 6M -bufsize 12M -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart $OUT
ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT; ls -la $OUT
mkdir -p $B/rev; ffmpeg -v error -y -i $OUT -vf "fps=1/2,scale=216:384,tile=10x4" -frames:v 1 $B/rev/sheet.jpg
