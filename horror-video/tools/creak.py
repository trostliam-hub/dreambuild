# Knarrende Tür: Stick-Slip-Impulse durch Holzresonanzen
import numpy as np, soundfile as sf, sys
from pedalboard import Pedalboard, Reverb, HighpassFilter, LowpassFilter, Compressor
SR = 48000; rng = np.random.default_rng(7); dur = 1.9; n = int(dur * SR)
t = np.arange(n) / SR
rate = 22 + 55 * np.sin(np.clip(t / dur, 0, 1) * np.pi) ** 1.5 + 8 * np.sin(t * 7)  # Impulsrate
phase = np.cumsum(rate / SR); imp = np.zeros(n, np.float32)
idx = np.where(np.diff(np.floor(phase)) > 0)[0]
imp[idx] = (0.6 + 0.4 * rng.random(len(idx))) * np.sin(np.clip(t[idx] / dur, 0, 1) * np.pi) ** .6
out = np.zeros(n)
for f, d, g in [(310, .018, 1.0), (720, .012, .8), (1180, .008, .6), (1950, .005, .35), (2600, .004, .2)]:
    k = np.arange(int(.06 * SR)) / SR; ir = np.exp(-k / d) * np.sin(2 * np.pi * f * (1 + .02 * rng.standard_normal()) * k)
    out += g * np.convolve(imp, ir)[:n]
out += .02 * rng.standard_normal(n) * np.sin(np.clip(t / dur, 0, 1) * np.pi)
out = out / np.abs(out).max() * .7
x = Pedalboard([HighpassFilter(150), LowpassFilter(6000), Compressor(-18, 3), Reverb(room_size=.45, wet_level=.25, dry_level=.8)])(out.astype(np.float32)[None], SR)[0]
f = int(.02 * SR); x[:f] *= np.linspace(0, 1, f); x[-int(.2*SR):] *= np.linspace(1, 0, int(.2*SR))
x = x / np.abs(x).max() * 10 ** (-3 / 20)
sf.write(sys.argv[1], np.stack([x, x * .97], 1), SR, subtype="PCM_24")
print("ok", len(x) / SR)
