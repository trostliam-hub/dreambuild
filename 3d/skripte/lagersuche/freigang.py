"""Listet alle Freigangs-Pruefungen, die ihr Soll verfehlen, fuer lager_final4.json."""
import sys, json, traceback, linecache; sys.argv = ['x', '1', '0']
src_i = open('opt_i.py').read()
src = open('opt_s.py').read().split("if __name__")[0]
# opt_q laedt Teile von opt_i per exec; frei dort ebenfalls ersetzen
log = []
def frei(f, wert, soll, gew=400):
    if wert < soll:
        fr = traceback.extract_stack(limit=2)[0]
        log.append((fr.filename, fr.lineno, round(wert, 1), soll))
    return f + max(0, soll - wert) ** 2 * gew
code = compile(src, 'opt_q_quelle', 'exec')
g = {'__name__': 'x'}
exec(code, g)
# alle Funktionen sehen frei ueber ihre globals
g['frei'] = frei
g['GRENZ'][0] = (-15, 60); g['GRENZ'][1] = (290, 385)
v = json.load(open('lager_final4.json'))
print([round(x, 2) for x in g['ziel'](v, True)])
zeilen = src.splitlines()
pi_src = g.get('pruef_lage')
for fn, ln_, w, s in log:
    print(f"{fn}:{ln_}  Wert {w} < Soll {s}")
