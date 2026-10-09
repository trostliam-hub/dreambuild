import sys, json, random; sys.argv = ['x', '1', '0']
exec(open('opt_s.py').read().split("if __name__")[0])
GRENZ[0] = (-15, 60); GRENZ[1] = (290, 385)
f0, v = json.load(open('lager_s104.json'))[0]
def z2(v):
    r = ziel(v, True)
    if not isinstance(r, tuple): return r
    return r[0] + (r[1] - 180) ** 2 * 200
random.seed(int(sys.argv[1]) if len(sys.argv) > 1 else 7)
f = z2(v); sch = [(b - a) * 0.02 for a, b in GRENZ]
for it in range(8000):
    k = random.randrange(len(v)); w = list(v); w[k] += random.gauss(0, sch[k])
    f2 = z2(w)
    if f2 < f: v, f = w, f2
    if it % 2000 == 1999: sch = [s * 0.5 for s in sch]
print(round(f, 1), [round(x, 2) for x in ziel(v, True)])
print(json.dumps([[round(c, 2) for c in p] for p in punkte(v)]))
json.dump(v, open('lager_final4.json', 'w'))
