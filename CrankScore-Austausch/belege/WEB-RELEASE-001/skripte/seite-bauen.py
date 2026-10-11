"""Einmaliger Aufbau der neuen index.html aus index-vorlage.html (Bildbausteine, Logo, Kopf-Skript, Punkte).
Aufruf: python bauen.py <repo> <punkte.json> <logo.txt>"""
import json, os, re, sys
from PIL import Image

repo, punkte_datei, logo_datei = sys.argv[1:4]
hier = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(hier, "index-vorlage.html"), encoding="utf-8").read()

# Kopf-Skript: dasselbe wie bisher, nur mit den Seitenfarben der App
alt = open(os.path.join(repo, "impressum.html"), encoding="utf-8").read()
kopf = re.search(r"<script>/\* Vor dem ersten Bild[\s\S]*?</script>", alt).group(0)
kopf = kopf.replace('"#07060d":"#f4f4f8"', '"#16181b":"#f2f0ec"')
assert '"#16181b":"#f2f0ec"' in kopf
s = s.replace("{{KOPFSKRIPT}}", kopf)

# Logo der App (Kettenblatt mit Kurbel), Pfade aus dem Symbol #cs-logo
logo = open(logo_datei, encoding="utf-8").read()
pfade = "".join(re.findall(r"<path[^>]*></path>", logo)).replace("></path>", "/>")
assert pfade.count("<path") == 2
s = s.replace("{{LOGOPFADE}}", pfade)
s = s.replace("{{MARKE}}", '<a class="marke" href="./" aria-label="x" data-t-aria="marke.aria"><svg class="logo" aria-hidden="true" focusable="false"><use href="#cs-logo"/></svg><span class="schrift">CRANK<b>SCORE</b></span></a>')

def groesse(pfad):
    with Image.open(os.path.join(repo, pfad)) as im:
        return im.size

def rad(name, alt, sizes, eager):
    w, h = groesse(f"img/rad/{name}.webp")
    lade = 'loading="eager" fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<picture><source type="image/avif" srcset="img/rad/{name}-klein.avif 900w, img/rad/{name}-mittel.avif 1200w, img/rad/{name}.avif {w}w" sizes="{sizes}">'
            f'<img class="rad" src="img/rad/{name}.webp" srcset="img/rad/{name}-klein.webp 900w, img/rad/{name}-mittel.webp 1200w, img/rad/{name}.webp {w}w" sizes="{sizes}" '
            f'width="{w}" height="{h}" alt="x" data-t-alt="{alt}" decoding="async" {lade}></picture>')

def app_bild(name, alt, sizes, klein, gross):
    teile = []
    for design in ("hell", "dunkel"):
        w, h = groesse(f"img/app/en/{design}/{name}.webp")
        b = f"img/app/en/{design}/{name}"
        teile.append(f'<picture class="nur-{design}"><source type="image/avif" srcset="{b}-klein.avif {klein}w, {b}.avif {gross}w" sizes="{sizes}">'
                     f'<img data-bild src="{b}.webp" srcset="{b}-klein.webp {klein}w, {b}.webp {gross}w" sizes="{sizes}" width="{w}" height="{h}" '
                     f'alt="x" data-t-alt="{alt}" decoding="async" loading="lazy"></picture>')
    return "".join(teile)

def handy(name, alt, sizes, eager):
    return ('<div class="handy"><div class="glas"><span class="insel" aria-hidden="true"></span><div class="leiste" aria-hidden="true"></div>'
            + app_bild(name, alt, sizes, 480, 720) + "</div></div>")

def ersetze(m):
    art, rest = m.group(1), m.group(2).strip()
    eager = rest.endswith("|eager")
    rest = rest.replace("|eager", "")
    name, alt, sizes = rest.split(" ", 2)
    if art == "RAD": return rad(name, alt, sizes, eager)
    if art == "HANDY": return handy(name, alt, sizes, eager)
    if art == "DESKTOP": return app_bild("desktop", name, alt + " " + sizes if sizes else alt, 960, 1600)
s = re.sub(r"\{\{(RAD|HANDY) ([^}]+)\}\}", ersetze, s)
d = re.search(r"\{\{DESKTOP ([^ ]+) ([^}]+)\}\}", s)
s = s.replace(d.group(0), app_bild("desktop", d.group(1), d.group(2), 960, 1600))

# Punkte am Seitenbild (Anteile im zugeschnittenen Bild), Reihenfolge wie die Legende
p = json.load(open(punkte_datei))
# Sitzrohr: Punkt am Rohr (zwischen Tretlager und Sattelklemme), nicht am Sattel; Bremse hinten etwas vom Achspunkt weg
t, k = p["tretlager"], p["stuetze"]
p["stuetze"] = [t[0] + (k[0] - t[0]) * 0.6, t[1] + (k[1] - t[1]) * 0.6]
p["bremse_hinten"] = [p["bremse_hinten"][0] + 0.014, p["bremse_hinten"][1] - 0.03]
reihe = ["hinterachse", "bremse_hinten", "daempfer", "tretlager", "stuetze", "steuerrohr", "vorderachse"]
s = s.replace("{{PUNKTE}}", "\n            ".join(
    f'<span class="punkt" style="left:{p[k][0]*100:.1f}%;top:{p[k][1]*100:.1f}%" aria-hidden="true">{i}</span>' for i, k in enumerate(reihe, 1)))

assert "{{" not in s, re.findall(r"\{\{[^}]*\}\}", s)
open(os.path.join(repo, "index.html"), "w", encoding="utf-8").write(s)
print("index.html geschrieben", len(s), "Zeichen")
