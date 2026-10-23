# Zusätzliche Geräusche für das Finale (Part 4/5): Babyweinen durch die Decke und aus dem Babyphone,
# ankommendes Auto, Schlüssel im Schloss, Schläge gegen die Decke. Alles synthetisch, keine Samples.
import os, sys
import numpy as np
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import (SR, OUT_DIR, tvec, norm, fades, lp, hp, bp, tvf, reverb, st, pan, metal_click, wood_thump,
                 smooth_noise, colored, place)

TWO_PI = 2 * np.pi


def glottal(f0):
    """Stimmquelle: Pulsfolge mit weicher Flanke (Rosenberg-ähnlich) aus einer f0-Kurve."""
    ph = np.cumsum(f0 / SR) % 1.0
    open_q = 0.6
    g = np.where(ph < open_q, 0.5 * (1 - np.cos(np.pi * ph / open_q)), np.cos(np.pi * (ph - open_q) / (2 * (1 - open_q))))
    return np.diff(g, prepend=g[0])


def formants(x, fs, bws, gains):
    y = np.zeros_like(x)
    for f, bw, g in zip(fs, bws, gains):
        y += g * bp(x, max(60, f - bw / 2), f + bw / 2, order=2)
    return y


def cry_burst(rng, dur):
    """Ein „Wääh“: f0 steigt, zittert, fällt; Vokal von ä nach a; Atemgeräusch am Anfang."""
    t = tvec(dur); n = len(t); u = t / dur
    f0 = 420 + 140 * np.sin(np.pi * np.minimum(u * 1.3, 1)) - 90 * np.maximum(u - .7, 0) / .3
    f0 = f0 * (1 + 0.03 * np.sin(TWO_PI * 7 * t) + 0.015 * smooth_noise(rng, n, 30))
    src = norm(glottal(f0)) + 0.03 * rng.standard_normal(n)
    v = formants(src, [1100, 2000, 3600], [300, 400, 700], [1.0, 0.7, 0.35])
    env = np.minimum(1, t / 0.06) * np.minimum(1, (dur - t) / 0.12) * (0.8 + 0.2 * np.sin(np.pi * u))
    return norm(v * env)


def baby_cry(rng, total, gaps=(0.25, 0.5)):
    out = np.zeros(int(total * SR)); t = 0.15
    while t < total - 0.6:
        d = rng.uniform(0.7, 1.3)
        b = cry_burst(rng, d); place(out, b, t)
        t += d
        g = rng.uniform(*gaps)  # Einatmen (Schluchzer)
        inh = norm(hp(rng.standard_normal(int(g * SR)), 1500)) * 0.12 * np.hanning(int(g * SR))
        place(out, inh, t); t += g
    return out


def gen_baby_cry_ceiling():
    """durch die Decke: dumpf, mit Raumhall, mittig."""
    rng = np.random.default_rng(31)
    x = baby_cry(rng, 8.0)
    x = lp(x, 1400, order=4)
    x = reverb(x, 0.9, wet=0.35, dry=1.0)
    return st(norm(fades(x, 0.05, 0.3), 0.6))


def gen_baby_cry_monitor():
    """aus dem alten Babyphone-Lautsprecher: Bandpass, Rauschen, leicht verzerrt."""
    rng = np.random.default_rng(32)
    x = baby_cry(rng, 8.0)
    x = bp(x, 450, 3200, order=3)
    x = np.tanh(2.2 * norm(x)) * 0.7
    x = x + 0.05 * norm(hp(rng.standard_normal(len(x)), 2000))
    return st(norm(fades(x, 0.05, 0.3), 0.5))


def gen_car_arrive():
    """Motor rollt heran, Kies, Motor aus, Autotür."""
    rng = np.random.default_rng(41)
    T = 4.2; t = tvec(T); n = len(t)
    rpm = 32 + 10 * np.exp(-((t - 1.6) / 1.1) ** 2)
    ph = np.cumsum(rpm / SR)
    eng = np.sin(TWO_PI * ph) + 0.5 * np.sin(TWO_PI * 2 * ph) + 0.3 * np.sin(TWO_PI * 3.01 * ph)
    eng = lp(eng + 0.3 * colored(rng, n, 1.0), 300)
    amp = np.clip(t / 1.6, 0, 1) * np.where(t > 2.9, np.exp(-(t - 2.9) / 0.15), 1.0)
    gravel = norm(bp(colored(rng, n, 0.3), 1500, 6000)) * (0.25 + 0.75 * np.abs(smooth_noise(rng, n, 25))) * np.clip(t / 1.4, 0, 1) * np.where(t > 2.6, np.exp(-(t - 2.6) / 0.2), 1.0)
    x = norm(eng) * amp * 0.8 + gravel * 0.18
    door = wood_thump(rng, 0.35); place(x, norm(door) * 0.7, 3.55)
    x = reverb(lp(x, 2500), 0.6, wet=0.25)
    return st(norm(fades(x, 0.4, 0.2), 0.7))


def gen_keys_lock():
    """Schlüsselbund klimpert, Schlüssel dreht, Riegel springt."""
    rng = np.random.default_rng(51)
    x = np.zeros(int(1.6 * SR))
    for k in range(7):
        place(x, metal_click(rng, ring=0.5, dur=0.25) * rng.uniform(0.2, 0.5), 0.05 + k * 0.06 + rng.uniform(0, 0.03))
    for k, t0 in enumerate([0.75, 0.95, 1.12]):
        place(x, metal_click(rng, ring=0.3, dur=0.2) * (0.6 if k < 2 else 1.0), t0)
    place(x, norm(wood_thump(rng, 0.2)) * 0.5, 1.13)
    return st(norm(reverb(x, 0.4, wet=0.2), 0.8))


def gen_ceiling_slam():
    """Faust gegen die Decke: dumpfer Schlag + Rieseln."""
    rng = np.random.default_rng(61)
    x = np.zeros(int(1.0 * SR))
    place(x, norm(wood_thump(rng, 0.4)), 0.0)
    place(x, norm(lp(rng.standard_normal(int(0.08 * SR)), 500)) * np.hanning(int(0.08 * SR)) * 0.8, 0.0)
    rattle = norm(bp(rng.standard_normal(int(0.6 * SR)), 2000, 7000)) * np.exp(-np.arange(int(0.6 * SR)) / SR / 0.15) * 0.15
    place(x, rattle, 0.05)
    return st(norm(reverb(x, 0.5, wet=0.3), 0.95))


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else OUT_DIR
    for name, fn in [("baby_cry_ceiling", gen_baby_cry_ceiling), ("baby_cry_monitor", gen_baby_cry_monitor),
                     ("car_arrive", gen_car_arrive), ("keys_lock", gen_keys_lock), ("ceiling_slam", gen_ceiling_slam)]:
        x = fn(); sf.write(os.path.join(out, name + ".wav"), x, SR, subtype="PCM_24"); print(name, round(len(x) / SR, 2), "s")
