# Leises, loopbares Babyphone-Rauschen (30 s): bandbegrenztes Rauschen, langsame Schwankung, seltenes Knistern
import numpy as np, soundfile as sf, sys
from scipy.signal import butter, sosfilt
SR = 48000; n = 30 * SR; rng = np.random.default_rng(11)
x = rng.standard_normal(n + SR)
x = sosfilt(butter(4, [700, 5500], btype="band", fs=SR, output="sos"), x)
t = np.arange(n + SR) / SR
x *= 0.75 + 0.25 * np.sin(2 * np.pi * t / 7.5) * np.sin(2 * np.pi * t / 3.0)
for k in rng.integers(0, n, 40):  # Knistern
    L = int(rng.integers(30, 300)); x[k:k + L] += rng.standard_normal(L) * rng.uniform(2, 5) * np.hanning(L)
f = SR  # Loop-Crossfade
y = x[:n].copy(); y[:f] = y[:f] * np.linspace(0, 1, f) + x[n:n + f] * np.linspace(1, 0, f)
y = y / np.abs(y).max() * 10 ** (-26 / 20)
sf.write(sys.argv[1], np.stack([y, y * .98], 1).astype(np.float32), SR, subtype="PCM_24"); print("ok")
