#!/bin/bash
# render_queue.sh <series:part> [...]: rendert streng nacheinander und prüft jede Datei (Dauer = Timeline-Dauer);
# bei Absturz (z. B. "Target crashed") bis zu 3 Versuche. series = btk | hk
S=/tmp/claude-0/-home-user-dreambuild/2683a2bf-1f2f-55f0-8359-cd20e125af40/scratchpad
for item in "$@"; do
  SER=${item%%:*}; P=${item##*:}; NAME=$([ "$SER" = btk ] && echo you_are_btk || echo none_leading_out)
  B=$S/en/${SER}_p$P; OUT=$S/deliver/$SER/${NAME}_part$P.mp4; mkdir -p $S/deliver/$SER
  WANT=$(python3 -I -c "import json; print(json.load(open('$B/timeline.json'))['duration'])")
  for try in 1 2 3; do
    echo "== $SER part $P (Versuch $try) $(date +%H:%M:%S), Soll ${WANT}s"
    bash $S/tools/render_part.sh $B $OUT.tmp.mp4 > $B/render_try$try.log 2>&1
    GOT=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT.tmp.mp4 2>/dev/null)
    if python3 -I -c "import sys; sys.exit(0 if abs(float('${GOT:-0}') - float('$WANT')) < 0.25 else 1)"; then
      mv $OUT.tmp.mp4 $OUT; echo "   ok ${GOT}s -> $OUT"; break
    fi
    echo "   FEHLER: Ist ${GOT:-?}s"; grep -ih "crash\|error" $B/seg/l*.txt | head -2
  done
done
echo "== fertig $(date +%H:%M:%S)"
