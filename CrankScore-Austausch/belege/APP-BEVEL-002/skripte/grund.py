"""Transparente Probe auf hellen und dunklen App-Grund legen: python grund.py <png> <ziel.png>"""
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGBA")
w, h = im.size
out = Image.new("RGB", (w, h * 2))
for i, farbe in enumerate(((242, 240, 236), (22, 24, 27))):
    g = Image.new("RGBA", (w, h), farbe + (255,)); g.alpha_composite(im); out.paste(g.convert("RGB"), (0, i * h))
out.save(sys.argv[2])
