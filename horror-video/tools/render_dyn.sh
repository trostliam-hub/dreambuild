#!/bin/bash
# render_dyn.sh: wie render_queue.sh, aber liest die Aufträge laufend aus tools/queue.txt (eine Zeile "serie:teil").
# Vor jedem Auftrag wird die oberste Zeile entnommen, so lassen sich dringende Teile oben einfügen. Ende, wenn die Datei leer ist.
S=/tmp/claude-0/-home-user-dreambuild/2683a2bf-1f2f-55f0-8359-cd20e125af40/scratchpad
Q=$S/tools/queue.txt
while true; do
  item=$(grep -m1 -E '^[a-z]+:[0-9]+$' $Q 2>/dev/null)
  [ -z "$item" ] && break
  grep -v -x -F "$item" $Q > $Q.new; mv $Q.new $Q
  bash $S/tools/render_queue.sh $item | grep -v "== fertig"
done
echo "== fertig $(date +%H:%M:%S)"
