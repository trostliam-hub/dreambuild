#!/usr/bin/env python3
"""Procedural horror SFX library (analog horror / creepypasta style).

Everything is synthesised from numpy oscillators, noise, modal resonators and
a synthetic convolution reverb - no samples. All randomness is seeded, so a
re-run produces identical files.

Output: 48 kHz / stereo / 24-bit PCM WAV in ../video/sfx (relative to this
script; override with env SFX_OUT), plus README.txt and an analysis table.

Usage:
    python3 sfx.py                  render everything, analyse, write README
    python3 sfx.py whoosh drip      render only these names (analysis covers all)
    python3 sfx.py --analyze        analyse existing files only
"""
import os
import sys
import time

import numpy as np
import soundfile as sf
from scipy import signal as sps

SR = 48000
TWO_PI = 2.0 * np.pi
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.environ.get("SFX_OUT") or os.path.normpath(os.path.join(HERE, "..", "video", "sfx"))


# --------------------------------------------------------------------------
# basic helpers
# --------------------------------------------------------------------------
def tvec(dur):
    return np.arange(int(round(dur * SR))) / SR


def undb(d):
    return 10.0 ** (np.asarray(d, float) / 20.0)


def todb(x):
    return 20.0 * np.log10(np.maximum(x, 1e-12))


def st(x):
    """mono -> (n, 2); stereo passes through."""
    x = np.asarray(x, float)
    return x if x.ndim == 2 else np.stack([x, x], 1)


def pk(x):
    p = float(np.max(np.abs(x)))
    return p if p > 0 else 1.0


def norm(x, peak=1.0):
    return x * (peak / pk(x))


def rmsnorm(x):
    r = float(np.sqrt(np.mean(np.square(x))))
    return x / (r if r > 0 else 1.0)


def phase(f):
    """Phase accumulator for a (time-varying) frequency array in Hz."""
    return TWO_PI * np.cumsum(f) / SR


def pan(x, p):
    """Constant-power pan of a mono signal; p in [-1, 1] (scalar or array). Centre = unity."""
    th = (np.clip(np.asarray(p, float), -1, 1) + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)], 1) * np.sqrt(2)


def ramp(t, t0, dur):
    """Raised-cosine step 0 -> 1 starting at t0 lasting dur."""
    u = np.clip((t - t0) / dur, 0, 1)
    return 0.5 - 0.5 * np.cos(np.pi * u)


def fades(x, fin=0.005, fout=0.005):
    x = np.array(x, float, copy=True)
    ni, no = int(fin * SR), int(fout * SR)
    if ni > 1:
        w = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, ni))
        x[:ni] *= w[:, None] if x.ndim == 2 else w
    if no > 1:
        w = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, no))
        x[-no:] *= w[:, None] if x.ndim == 2 else w
    return x


def place(buf, sig, t0, gain=1.0):
    i = int(round(t0 * SR))
    m = min(len(sig), len(buf) - i)
    if m > 0:
        buf[i:i + m] += gain * sig[:m]
    return buf


def place_wrap(buf, sig, t0, gain=1.0):
    """Add sig into buf circularly (for seamless loops: tails wrap to the start)."""
    i = int(round(t0 * SR)) % len(buf)
    idx = (i + np.arange(len(sig))) % len(buf)
    np.add.at(buf, idx, gain * sig)
    return buf


def smooth_noise(rng, n, rate):
    """Smooth random control signal in [-1, 1], ~`rate` new values per second."""
    k = int(np.ceil(n / SR * rate)) + 2
    pts = rng.uniform(-1, 1, k)
    pos = np.arange(n) / SR * rate
    i = np.floor(pos).astype(int)
    w = 0.5 - 0.5 * np.cos(np.pi * (pos - i))
    return pts[i] * (1 - w) + pts[i + 1] * w


def colored(rng, n, exponent):
    """Noise with power spectrum ~ 1/f^exponent (1 = pink, 2 = brown). Unit RMS."""
    X = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    X /= f ** (exponent / 2)
    y = np.fft.irfft(X, n)
    return y / np.std(y)


# --------------------------------------------------------------------------
# filters
# --------------------------------------------------------------------------
def _sos(kind, f, order):
    return sps.butter(order, f, btype=kind, fs=SR, output="sos")


def lp(x, f, order=2):
    return sps.sosfilt(_sos("lowpass", f, order), x, axis=0)


def hp(x, f, order=2):
    return sps.sosfilt(_sos("highpass", f, order), x, axis=0)


def bp(x, lo, hi, order=2):
    return sps.sosfilt(_sos("bandpass", [lo, hi], order), x, axis=0)


def _rbj(kind, f, q):
    w0 = TWO_PI * min(max(f, 5.0), 0.45 * SR) / SR
    c, s = np.cos(w0), np.sin(w0)
    al = s / (2 * q)
    if kind == "lp":
        b = ((1 - c) / 2, 1 - c, (1 - c) / 2)
    elif kind == "hp":
        b = ((1 + c) / 2, -(1 + c), (1 + c) / 2)
    elif kind == "bp":  # constant 0 dB peak gain
        b = (al, 0.0, -al)
    else:
        raise ValueError(kind)
    a0 = 1 + al
    return np.array([b[0] / a0, b[1] / a0, b[2] / a0, 1.0, -2 * c / a0, (1 - al) / a0])


def tvf(x, fc, kind="lp", q=0.707, stages=1, block=128):
    """Time-varying RBJ biquad (cascaded `stages` times), coefficients updated per block,
    filter state carried across blocks -> smooth sweeps."""
    x = np.asarray(x, float)
    X = x[:, None] if x.ndim == 1 else x
    n = len(X)
    fc = np.broadcast_to(np.asarray(fc, float), (n,))
    qa = np.broadcast_to(np.asarray(q, float), (n,))
    out = np.empty_like(X)
    for ch in range(X.shape[1]):
        zi = np.zeros((stages, 2))
        for i in range(0, n, block):
            j = min(i + block, n)
            m = (i + j) // 2
            sos = np.tile(_rbj(kind, fc[m], qa[m]), (stages, 1))
            out[i:j, ch], zi = sps.sosfilt(sos, X[i:j, ch], zi=zi)
    return out[:, 0] if x.ndim == 1 else out


def resbank(exc, freqs, taus, gains):
    """Parallel 2-pole modal resonators. Impulse response of each mode: r^n sin(w n)."""
    y = np.zeros(len(exc))
    for f, tau, g in zip(freqs, taus, gains):
        r = np.exp(-1.0 / (tau * SR))
        w = TWO_PI * f / SR
        y += g * sps.lfilter([0.0, r * np.sin(w)], [1.0, -2 * r * np.cos(w), r * r], exc)
    return y


def half_sine(width, n):
    """Contact pulse (half sine of `width` s) at the start of an n-sample buffer."""
    w = max(2, int(width * SR))
    e = np.zeros(n)
    e[:w] = np.sin(np.pi * np.arange(w) / w)
    return e


# --------------------------------------------------------------------------
# synthetic convolution reverb
# --------------------------------------------------------------------------
_IR_CACHE = {}


def make_ir(rt60, seed=0, predelay=0.01, er_span=0.035, n_er=14, er_level=0.5,
            lo_mult=1.25, hi_mult=0.5, damp=8000.0, buildup=0.012):
    key = (rt60, seed, predelay, er_span, n_er, er_level, lo_mult, hi_mult, damp, buildup)
    if key in _IR_CACHE:
        return _IR_CACHE[key]
    rng = np.random.default_rng(seed)
    L = int((predelay + rt60 * 1.15 + 0.03) * SR)
    t = np.arange(L) / SR
    ir = np.zeros((L, 2))
    for ch in range(2):
        nz = rng.standard_normal(L)
        lo, mid, hi = lp(nz, 350), bp(nz, 350, 3500), hp(nz, 3500)

        def e(rt):
            return np.exp(-6.91 * t / rt)

        tail = lo * e(rt60 * lo_mult) + mid * e(rt60) + hi * e(rt60 * hi_mult)
        tail = lp(tail, damp)
        tail *= 1 - np.exp(-t / buildup)
        d = int(predelay * SR)
        col = np.zeros(L)
        col[d:] = tail[:L - d]
        er = np.zeros(L)
        for _ in range(n_er):
            tt = predelay * 0.3 + rng.uniform(0, er_span)
            er[int(tt * SR)] += rng.choice([-1, 1]) * rng.uniform(0.4, 1.0) * np.exp(-tt / (er_span * 1.5))
        er = lp(er, 9000)
        col = col / np.sqrt(np.sum(col ** 2)) + er_level * er / np.sqrt(np.sum(er ** 2) + 1e-12)
        ir[:, ch] = col
    ir /= np.sqrt(np.sum(ir ** 2) / 2)
    nf = int(0.02 * SR)
    ir[-nf:] *= np.linspace(1, 0, nf)[:, None]
    _IR_CACHE[key] = ir
    return ir


def reverb(x, rt60, wet=0.3, dry=1.0, seed=7, n_out=None, **kw):
    ir = make_ir(rt60, seed, **kw)
    X = st(x)
    w = np.stack([sps.fftconvolve(X[:, c], ir[:, c]) for c in range(2)], 1)
    out = wet * w
    out[:len(X)] += dry * X
    if n_out is not None:
        out = out[:n_out] if len(out) >= n_out else np.pad(out, ((0, n_out - len(out)), (0, 0)))
    return out


def add(*sigs):
    """Sum signals of different lengths (zero-padded)."""
    n = max(len(z) for z in sigs)
    return sum(fit(np.asarray(z, float), n) for z in sigs)


def fit(x, n):
    """Crop / zero-pad along time axis to n samples."""
    if len(x) >= n:
        return x[:n]
    pad = [(0, n - len(x))] + [(0, 0)] * (x.ndim - 1)
    return np.pad(x, pad)


# --------------------------------------------------------------------------
# reusable sound elements
# --------------------------------------------------------------------------
def saw(ph, f, kmax=40, fmax=9000.0, tilt=1.0):
    """Band-limited (additive) saw; harmonics fade out softly below fmax."""
    y = np.zeros_like(ph)
    for k in range(1, kmax + 1):
        lim = np.clip((fmax - k * f) / (0.2 * fmax), 0, 1)
        if not np.any(lim > 0):
            break
        y += lim * np.sin(k * ph) / k ** tilt
    return y


def metal_groan(rng, dur):
    """Distant bowed/stressed metal: inharmonic partials bending down, friction roughness."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    f0 = rng.uniform(75, 115)
    ratios = np.array([1.0, 2.29, 3.71, 5.13, 6.94, 8.62]) * (1 + rng.uniform(-0.03, 0.03, 6))
    amps = np.array([1.0, 0.75, 0.55, 0.4, 0.25, 0.18])
    bend = 1 + 0.09 * (1 - x) ** 1.5 - 0.04 * x
    wob = 1 + 0.01 * np.sin(TWO_PI * rng.uniform(0.3, 0.7) * t + rng.uniform(0, TWO_PI))
    y = np.zeros(n)
    for r, a in zip(ratios, amps):
        rough = 1 + 0.7 * smooth_noise(rng, n, rng.uniform(12, 35))
        y += a * np.sin(phase(f0 * r * bend * wob) + rng.uniform(0, TWO_PI)) * rough
    scrape = resbank(rng.standard_normal(n), f0 * ratios * float(bend.mean()), [0.08] * 6, amps)
    y = rmsnorm(y) + 0.5 * rmsnorm(scrape)
    env = np.sin(np.pi * np.clip(x, 0, 1) ** 0.75) ** 2
    return lp(hp(y * env, 60), 1500)


DOOR_F = np.array([92, 124, 158, 177, 231, 298, 386, 507, 668, 902, 1240, 1710], float)
DOOR_TAU = np.array([0.075, 0.065, 0.055, 0.05, 0.04, 0.032, 0.026, 0.02, 0.015, 0.011, 0.008, 0.006])
DOOR_G = np.array([0.9, 1.0, 0.8, 0.7, 0.6, 0.55, 0.5, 0.42, 0.35, 0.25, 0.18, 0.12])


def door_knock(rng, heavy=False):
    """One knock on a wooden apartment door: contact pulse -> door-panel modes + click."""
    dur = 1.0 if heavy else 0.6
    n = int(dur * SR)
    t = np.arange(n) / SR
    width = rng.uniform(0.0045, 0.006) if heavy else rng.uniform(0.0011, 0.0015)
    exc = half_sine(width, n)
    exc[:int(0.004 * SR)] += 0.06 * rng.standard_normal(int(0.004 * SR)) * np.exp(-t[:int(0.004 * SR)] / 0.001)
    f = DOOR_F * (1 + rng.uniform(-0.015, 0.015, len(DOOR_F)))
    tau = DOOR_TAU * (1.5 if heavy else 1.0)
    g = DOOR_G * (1 + rng.uniform(-0.2, 0.2, len(DOOR_G)))
    if heavy:
        g = g * np.where(f < 260, 1.8, 0.7)
    body = norm(resbank(exc, f, tau, g))
    nc = int((0.004 if heavy else 0.002) * SR)
    click = np.zeros(n)
    click[:nc] = rng.standard_normal(nc) * np.exp(-t[:nc] / (0.0012 if heavy else 0.0005))
    click = norm(bp(click, 500, 2500) if heavy else bp(click, 1200, 5500))
    y = body + (0.12 if heavy else 0.35) * click
    if heavy:
        # panel flex "boom" + door rattling in its frame right after the hit
        y += 0.45 * np.sin(TWO_PI * 66 * t) * np.exp(-t / 0.12) * (1 - np.exp(-t / 0.003))
        for _ in range(rng.integers(3, 6)):
            dt = rng.uniform(0.008, 0.05)
            e = np.zeros(n)
            e[int(dt * SR)] = 1.0
            rat = resbank(e, [1900 * rng.uniform(0.9, 1.1), 2850, 4100], [0.006, 0.005, 0.004], [1, 0.7, 0.5])
            y += rng.uniform(0.04, 0.09) * norm(rat)
    return fades(np.tanh(1.8 * norm(y)) / np.tanh(1.8), 0, 0.1)


def footstep(rng):
    """Hard-heeled shoe on a hard floor: heel strike + toe slap + scuff."""
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    fl_f = np.array([68, 105, 150, 210, 290, 410, 620]) * (1 + rng.uniform(-0.03, 0.03, 7))
    fl_tau = [0.035, 0.03, 0.025, 0.02, 0.016, 0.012, 0.008]
    fl_g = [0.7, 1.0, 0.9, 0.7, 0.55, 0.4, 0.3]

    def strike(width, click_amp):
        e = half_sine(width, n)
        body = norm(resbank(e, fl_f, fl_tau, fl_g))
        c = rng.standard_normal(n) * np.exp(-t / 0.0012)
        c = norm(bp(c, 1500, 7000))
        return body + click_amp * c

    heel = strike(rng.uniform(0.002, 0.003), 0.45)
    toe = strike(rng.uniform(0.0035, 0.0045), 0.25)
    scuff = bp(rng.standard_normal(n), 2000, 6000) * np.exp(-t / 0.025) * (1 - np.exp(-t / 0.004))
    y = heel.copy()
    place(y, 0.45 * toe, rng.uniform(0.07, 0.09))
    place(y, 0.12 * norm(scuff), 0.004)
    return fades(y, 0, 0.1)


METAL_F = np.array([1180, 1730, 2650, 3420, 4870, 6210], float)
METAL_TAU = np.array([0.06, 0.05, 0.035, 0.03, 0.02, 0.015])
METAL_G = np.array([0.8, 1.0, 0.7, 0.6, 0.4, 0.3])


def metal_click(rng, ring=1.0, dur=0.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = np.zeros(n)
    e[:int(0.0004 * SR)] = rng.standard_normal(int(0.0004 * SR))
    e[0] += 1.0
    f = METAL_F * (1 + rng.uniform(-0.04, 0.04, len(METAL_F)))
    y = norm(resbank(e, f, METAL_TAU * ring, METAL_G * (1 + rng.uniform(-0.3, 0.3, 6))))
    c = norm(hp(rng.standard_normal(n) * np.exp(-t / 0.0006), 2500))
    return fades(y + 0.4 * c, 0, 0.5 * dur)


def wood_thump(rng, dur=0.3):
    n = int(dur * SR)
    e = half_sine(rng.uniform(0.002, 0.003), n)
    return fades(norm(resbank(e, [105, 160, 240, 330, 470], [0.04, 0.035, 0.025, 0.02, 0.012],
                              [1, 0.9, 0.7, 0.5, 0.3])), 0, 0.1)


def crackles(rng, n, t0, dur, count, amp=1.0, lo=1500, hi=9000):
    e = np.zeros(n)
    for _ in range(count):
        i = int((t0 + rng.uniform(0, dur)) * SR)
        if 0 <= i < n:
            e[i] += rng.uniform(-1, 1) * amp
    return bp(e, lo, hi)


# --------------------------------------------------------------------------
# generators (each returns float mono (n,) or stereo (n, 2), un-normalised)
# --------------------------------------------------------------------------
def gen_drone_bed():
    rng = np.random.default_rng(1001)
    N, X = 100.0, 8.0          # loop length, loop crossfade length
    n = int((N + X) * SR)
    t = np.arange(n) / SR
    P = N                      # every LFO is periodic in N -> loop seam is consistent
    drone = np.zeros((n, 2))
    voices = [
        # f0 [Hz], beat [Hz], gain, amp-LFO period [s], LFO depth, LFO phase
        (41.20, 0.31, 1.00, P / 2, 0.30, 0.0),     # E1 root, 0.31 Hz beating
        (61.74, 0.47, 0.60, P / 3, 0.40, 1.3),     # B1 fifth
        (82.41, -0.62, 0.45, P / 4, 0.45, 2.1),    # E2
        (87.31, 0.83, 0.20, P / 2, 1.00, 3.9),     # F2: minor 2nd rub, swells in/out
        (98.00, 0.91, 0.22, P / 3, 1.00, 0.7),     # G2: minor colour
        (116.54, 0.55, 0.12, P / 5, 1.00, 4.4),    # Bb2: tritone, very quiet
    ]
    for f0, beat, g, per, depth, ph0 in voices:
        dr = 1 + 0.002 * np.sin(TWO_PI * t / (P / rng.integers(2, 6)) + rng.uniform(0, TWO_PI))
        amp = g * (1 - depth * (0.5 + 0.5 * np.sin(TWO_PI * t / per + ph0)))
        for side, f in ((-0.6, f0), (0.6, f0 + beat)):
            p = phase(f * dr) + rng.uniform(0, TWO_PI)
            s = sum(np.sin(k * p) / k ** 1.2 for k in range(1, 9))
            drone += pan(s * amp, side)
    cut = 190 + 170 * (0.5 + 0.5 * np.sin(TWO_PI * t / (P / 3) - 1.0)) * \
        (0.6 + 0.4 * (0.5 + 0.5 * np.sin(TWO_PI * t / (P / 2) + 0.5)))
    drone = tvf(drone, cut, "lp", q=0.9, stages=2, block=512)
    d_rms = float(np.sqrt(np.mean(drone ** 2)))

    rum = np.stack([colored(rng, n, 2), colored(rng, n, 2)], 1)
    rum = rmsnorm(lp(hp(rum, 25), 90)) * d_rms * undb(-11)

    air = np.stack([colored(rng, n, 1), colored(rng, n, 1)], 1)
    air = tvf(air, 2500 * 2 ** np.sin(TWO_PI * t / (P / 2) + 2.0), "bp", q=0.6, block=512)
    air *= (0.6 + 0.4 * smooth_noise(rng, n, 0.08))[:, None]
    air = rmsnorm(air) * d_rms * undb(-28)

    wind = np.stack([colored(rng, n, 1), colored(rng, n, 1)], 1)
    wind = tvf(wind, 380 * 2 ** (0.5 * np.sin(TWO_PI * t / (P / 4) + 0.3)), "bp", q=2.0, block=512)
    wind *= (0.55 + 0.45 * smooth_noise(rng, n, 0.12))[:, None]
    wind = rmsnorm(wind) * d_rms * undb(-21)

    groans = np.zeros((n, 2))
    for k, (tg, dur, pn) in enumerate(((16.5, 4.5, -0.4), (38.0, 5.5, 0.5), (61.0, 4.0, -0.15), (83.5, 5.0, 0.35))):
        g = pan(metal_groan(rng, dur), pn)
        w = reverb(g, rt60=6.0, wet=1.0, dry=0.2, seed=200 + k, predelay=0.05, damp=2500, er_level=0.15)
        w = lp(w, 1400)
        act = float(np.sqrt(np.mean(w[:int(dur * SR)] ** 2)))
        place(groans, w / act * d_rms * undb(-2), tg)       # mid-range -> clearly audible over the low drone

    bed = drone + rum + air + wind + groans
    # loop crossfade: fold the X-second overrun back over the start (equal power)
    nN, nX = int(N * SR), int(X * SR)
    out = bed[:nN].copy()
    w = np.linspace(0, 1, nX)[:, None]
    out[:nX] = bed[:nX] * np.sin(0.5 * np.pi * w) + bed[nN:nN + nX] * np.cos(0.5 * np.pi * w)
    return out


def gen_riser(T, seed):
    rng = np.random.default_rng(seed)
    n = int(T * SR)
    t = np.arange(n) / SR
    x = t / T
    ratio = 2 ** (2.0 * x ** 1.7)                      # +2 octaves, accelerating
    base = [73.42, 77.78, 103.83, 110.0, 155.56, 164.81]  # D2 D#2 G#2 A2 D#3 E3: clusters + tritones
    tones = np.zeros((n, 2))
    for i, f0 in enumerate(base):
        f = f0 * (1 + rng.uniform(-0.004, 0.004)) * ratio * \
            (1 + 0.003 * np.sin(TWO_PI * rng.uniform(4, 7) * t + rng.uniform(0, TWO_PI)))
        s = saw(phase(f) + rng.uniform(0, TWO_PI), f, kmax=40, fmax=9000)
        tones += pan(s, -0.6 + 1.2 * i / (len(base) - 1))
    rate = 2.5 + 14 * x ** 2
    trem = 1 - (0.2 + 0.5 * x) * (0.5 + 0.5 * np.sin(phase(rate)))
    tones *= (trem * undb(-40 + 40 * x ** 1.3))[:, None]
    tones = tvf(tones, 500 * 16 ** (x ** 1.2), "lp", q=0.9, stages=2)
    tones = tones / pk(tones)

    nz = np.stack([rng.standard_normal(n), rng.standard_normal(n)], 1)
    nz = hp(tvf(nz, 300 * 40 ** (x ** 1.5), "lp", q=0.7, stages=2), 150)
    nz = nz / pk(nz) * undb(-50 + 50 * x ** 2.2)[:, None]

    sub = np.sin(phase(38 * 2 ** (x ** 1.5))) * undb(-30 + 30 * x ** 1.5)
    fsc = 1900 * 2 ** (x ** 2) * (1 + 0.01 * np.sin(TWO_PI * 6.3 * t))
    scr = np.sin(phase(fsc)) * undb(-70 + 52 * np.clip((x - 0.4) / 0.6, 0, 1) ** 1.5)

    hi = 0.9 * tones + 0.55 * nz + pan(0.12 * scr, 0.3)
    hi = reverb(hi, rt60=2.2, wet=0.35, dry=1.0, seed=seed + 1, n_out=n, predelay=0.02)
    out = hi + st(0.5 * sub)
    return np.tanh(1.3 * out / pk(out))


def gen_tension_riser_4s():
    return gen_riser(4.0, 2001)


def gen_tension_riser_8s():
    return gen_riser(8.0, 2002)


def gen_impact_boom():
    rng = np.random.default_rng(3001)
    n = int(4.0 * SR)
    t = np.arange(n) / SR
    f = 30 + 90 * np.exp(-t / 0.13)                     # 120 -> 30 Hz sub drop
    sub = np.sin(phase(f) - phase(f)[0]) * (1 - np.exp(-t / 0.0015)) * np.exp(-t / 1.0)
    harm = bp(np.tanh(3 * sub) / np.tanh(3) - sub, 70, 900)   # distortion products: audible on phones
    thud = norm(bp(rng.standard_normal(n), 40, 250)) * np.exp(-t / 0.09) * (1 - np.exp(-t / 0.002))
    crack = norm(bp(rng.standard_normal(n), 800, 7000)) * np.exp(-t / 0.010)
    tom = np.sin(phase(55 + 35 * np.exp(-t / 0.06))) * np.exp(-t / 0.18) * (1 - np.exp(-t / 0.001))
    dry = 1.0 * sub + 0.9 * norm(harm) * 0.5 + 0.45 * thud + 0.3 * crack + 0.4 * tom
    send = 0.45 * norm(harm) + 0.45 * thud + 0.35 * crack + 0.4 * tom + 0.1 * sub
    wet = reverb(send, rt60=3.4, wet=1.0, dry=0.0, seed=3002, n_out=n, predelay=0.02,
                 damp=4500, lo_mult=1.2, er_span=0.06)
    out = st(dry) + 0.5 * wet
    return np.tanh(1.2 * out / pk(out))


def gen_impact_hit_short():
    rng = np.random.default_rng(3101)
    n = int(2.0 * SR)
    t = np.arange(n) / SR
    sag = 1 - 0.035 * (1 - np.exp(-t / 0.5))
    voices = [(55.0, -0.3, 1.0), (55.0 * 2 ** (9 / 1200), 0.3, 1.0), (55.0 * 2 ** (-8 / 1200), 0.0, 0.8),
              (82.41 * 2 ** (4 / 1200), -0.5, 0.55), (110.0 * 2 ** (-6 / 1200), 0.5, 0.5), (116.54, 0.0, 0.2)]
    osc = np.zeros((n, 2))
    for f0, p, g in voices:
        f = f0 * sag
        osc += pan(g * saw(phase(f) + rng.uniform(0, TWO_PI), f, kmax=70, fmax=5000), p)
    osc = tvf(osc, 220 + 3000 * np.exp(-t / 0.18), "lp", q=1.4, stages=2)
    osc *= ((1 - np.exp(-t / 0.006)) * np.exp(-t / 0.65))[:, None]
    osc = np.tanh(2.2 * osc / pk(osc)) / np.tanh(2.2)
    sub = np.sin(phase(36 + 49 * np.exp(-t / 0.08))) * np.exp(-t / 0.45) * (1 - np.exp(-t / 0.002))
    crack = norm(lp(rng.standard_normal(n), 3500)) * np.exp(-t / 0.006)
    hi = 0.8 * osc + st(0.25 * crack)
    hi = reverb(hi, rt60=1.6, wet=0.3, dry=1.0, seed=3102, n_out=n, damp=5000)
    out = lp(hi, 6000) + st(0.9 * sub)
    return np.tanh(1.2 * out / pk(out))


def gen_whoosh():
    rng = np.random.default_rng(4001)
    n = int(0.8 * SR)
    t = np.arange(n) / SR
    tp = 0.40
    env = np.where(t < tp, np.exp(-((t - tp) / 0.17) ** 2), np.exp(-((t - tp) / 0.13) ** 2))
    nz = colored(rng, n, 0.6)
    fc = 350 + 3800 * env ** 1.3
    a = rmsnorm(tvf(nz, fc, "bp", q=1.6, stages=2))
    b = rmsnorm(tvf(colored(rng, n, 0.6), fc * 1.8, "lp", q=0.7))
    low = rmsnorm(lp(rng.standard_normal(n), 150))
    mono = (a + 0.6 * b) * env + 0.5 * low * env ** 2
    out = pan(mono, 0.75 * np.tanh((t - tp) / 0.15))
    return reverb(out, rt60=0.7, wet=0.18, dry=1.0, seed=4002, n_out=n)


def gen_whoosh_reverse():
    rng = np.random.default_rng(4101)
    T = 1.5
    n = int(T * SR)
    t = np.arange(n) / SR
    t0 = 0.004                                          # cymbal attack lands 4 ms before the end
    tc = np.maximum(t - t0, 0)
    on = (t >= t0).astype(float)
    sq = sum(np.sign(np.sin(TWO_PI * f * 2.1 * t + rng.uniform(0, TWO_PI)))
             for f in (205.3, 304.4, 369.6, 522.7, 540.0, 800.0))
    metal = rmsnorm(bp(sq, 4500, 10000)) + 0.6 * rmsnorm(bp(rng.standard_normal(n), 3000, 11000))
    cym_env = on * (np.exp(-tc / 0.45) + 0.8 * np.exp(-tc / 0.03)) * (1 - np.exp(-tc / 0.0008))
    body = rmsnorm(bp(rng.standard_normal(n), 250, 1800)) * on * np.exp(-tc / 0.4) * 1.0
    low = np.sin(phase(70 + 40 * np.exp(-tc / 0.3))) * on * np.exp(-tc / 0.5) * (1 - np.exp(-tc / 0.002)) * 0.6
    cym = metal * cym_env + body + low
    cym = reverb(cym, rt60=1.4, wet=0.6, dry=1.0, seed=4102, n_out=n, damp=9000, hi_mult=0.7)
    cym = lp(cym, 12000)
    return cym[::-1].copy()


def gen_knock_single():
    rng = np.random.default_rng(5001)
    out = np.zeros(int(0.9 * SR))
    place(out, door_knock(rng), 0.03)
    return reverb(out, rt60=0.5, wet=0.25, dry=1.0, seed=5002, n_out=len(out), predelay=0.006)


def gen_knock_triple():
    rng = np.random.default_rng(5101)
    out = np.zeros(int(1.6 * SR))
    for t0, g in ((0.03, 1.0), (0.46, 0.9), (0.85, 1.05)):     # gaps 0.43 s / 0.39 s
        place(out, door_knock(rng), t0 + rng.uniform(-0.004, 0.004), g)
    return reverb(out, rt60=0.5, wet=0.25, dry=1.0, seed=5002, n_out=len(out), predelay=0.006)


def gen_knock_heavy():
    rng = np.random.default_rng(5201)
    out = np.zeros(int(2.8 * SR))
    place(out, door_knock(rng, heavy=True), 0.05, 1.0)
    place(out, door_knock(rng, heavy=True), 1.30, 1.08)
    return reverb(out, rt60=0.9, wet=0.3, dry=1.0, seed=5202, n_out=len(out), predelay=0.008)


def vib_burst(rng, on_dur, total):
    n = int(total * SR)
    t = np.arange(n) / SR
    toff = np.maximum(t - on_dur, 0)
    on = t < on_dur
    f = np.where(on, 200 * (1 - 0.3 * np.exp(-t / 0.025)), 200 * np.exp(-toff / 0.05))
    f = np.maximum(f, 15)
    ph = phase(f)
    amp = np.where(on, 1 - np.exp(-t / 0.012), (1 - np.exp(-on_dur / 0.012)) * np.exp(-toff / 0.03))
    amp *= np.minimum((f / 200) ** 2, 1.0)            # motor force ~ speed^2
    buzz = np.sin(ph) + 0.4 * np.sin(2 * ph + 0.3) + 0.2 * np.sin(3 * ph + 1.1)
    thr = 0.55 + 0.15 * smooth_noise(rng, n, 30)       # irregular contact with the wood
    imp = np.maximum(np.sin(ph) - thr, 0) ** 2
    imp = np.abs(np.diff(imp, prepend=0.0))
    rattle = resbank(imp, [175, 240, 395, 610, 920, 1450, 2250, 3400],
                     [0.03, 0.025, 0.02, 0.015, 0.01, 0.008, 0.006, 0.004],
                     [0.8, 1.0, 0.9, 0.8, 0.7, 0.55, 0.4, 0.3])
    am = 1 + 0.25 * np.sin(TWO_PI * 9.5 * t) + 0.2 * smooth_noise(rng, n, 14)
    sig = (0.35 * norm(buzz) + norm(rattle)) * amp * am
    return fades(np.tanh(1.5 * sig), 0, 0.08)


def gen_phone_vibrate():
    rng = np.random.default_rng(6001)
    out = np.zeros(int(1.5 * SR))
    place(out, vib_burst(rng, 0.40, 0.55), 0.06)
    place(out, vib_burst(rng, 0.40, 0.55), 0.76, 0.97)
    return reverb(out, rt60=0.35, wet=0.12, dry=1.0, seed=6002, n_out=len(out), predelay=0.004)


def gen_phone_ping():
    out = np.zeros(int(0.6 * SR))
    for f, t0, g in ((880.0, 0.01, 0.85), (1318.51, 0.14, 1.0)):   # A5 -> E6
        t = tvec(0.6 - t0)
        env = (1 - np.exp(-t / 0.003)) * np.exp(-t / 0.11)
        y = (np.sin(TWO_PI * f * t) + 0.25 * np.sin(TWO_PI * 2 * f * t) * np.exp(-t / 0.05)
             + 0.08 * np.sin(TWO_PI * 2.76 * f * t) * np.exp(-t / 0.03)
             + 0.05 * np.sin(TWO_PI * 5.4 * f * t) * np.exp(-t / 0.015))
        place(out, y * env, t0, g)
    return reverb(out, rt60=0.45, wet=0.12, dry=1.0, seed=6102, n_out=len(out))


def heart_thump(rng, f_hi, f_lo, tau, gain_noise=0.25):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.025)
    env = ramp(t, 0, 0.006) * np.exp(-np.maximum(t - 0.006, 0) / tau)
    y = np.sin(phase(f) - phase(f)[0]) * env
    y += gain_noise * norm(lp(rng.standard_normal(n), 120)) * env * np.exp(-t / 0.03)
    y += 0.35 * np.sin(phase(2.6 * f) - phase(2.6 * f)[0]) * env * np.exp(-t / 0.04)   # chest-wall body ~110-160 Hz
    y = np.tanh(3.0 * y)                                  # harmonics -> audible on phones
    return fades(lp(y, 380, order=2), 0, 0.1)


def gen_heartbeat(dur, n_beats, gap, seed, bright=1.0):
    rng = np.random.default_rng(seed)
    buf = np.zeros(int(dur * SR))
    period = dur / n_beats
    for k in range(n_beats):
        t0 = 0.10 + k * period + rng.uniform(-0.006, 0.006)
        a = 1 + rng.uniform(-0.06, 0.06)
        place_wrap(buf, heart_thump(rng, 62 * bright, 42, 0.07), t0, a)
        place_wrap(buf, heart_thump(rng, 78 * bright, 50, 0.05), t0 + gap, 0.72 * a)
    return buf


def gen_heartbeat_loop():
    return gen_heartbeat(8.0, 9, 0.30, 7001)            # 67.5 bpm -> exactly 9 beats, loops cleanly


def gen_heartbeat_fast():
    return gen_heartbeat(6.0, 12, 0.22, 7101, bright=1.1)   # 120 bpm -> 12 beats


def static_texture(rng, dur):
    n = int(dur * SR)
    out = np.zeros(n)
    i = 0
    modes = ["noise", "crush", "tone", "drop", "stutter", "buzz"]
    while i < n:
        seg = min(int(rng.uniform(0.008, 0.06) * SR), n - i)
        mode = rng.choice(modes, p=[0.3, 0.3, 0.1, 0.1, 0.12, 0.08])
        base = rng.standard_normal(seg)
        if mode == "noise":
            lo = rng.uniform(100, 2000)
            y = bp(base, lo, min(lo * rng.uniform(2, 10), 15000)) * 2.0
        elif mode == "crush":
            hold = int(rng.choice([3, 4, 6, 8, 12, 16]))
            y = np.repeat(base[::hold], hold)[:seg]
            q = 2 ** int(rng.integers(1, 5))
            y = np.round(y * q / 3) / (q / 3)
        elif mode == "tone":
            ts = np.arange(seg) / SR
            y = 0.6 * np.sign(np.sin(TWO_PI * rng.uniform(400, 3000) * ts)) + 0.3 * base
        elif mode == "drop":
            y = 0.03 * base
        elif mode == "stutter":
            g = max(8, int(rng.uniform(0.003, 0.012) * SR))
            y = np.tile(base[:g], seg // g + 1)[:seg]
        else:
            ts = np.arange(seg) / SR
            y = 0.7 * ((ts * rng.uniform(80, 200)) % 1.0 * 2 - 1) + 0.2 * base
        out[i:i + seg] = y * rng.uniform(0.4, 1.0)
        i += seg
    out += 3.0 * crackles(rng, n, 0, dur, int(dur * 150), 1.0, 800, 12000)
    return lp(hp(out, 120), 11000)


def gen_static_burst():
    rng = np.random.default_rng(8001)
    x = static_texture(rng, 0.5)
    return fades(x, 0.002, 0.02)


def gen_static_long():
    rng = np.random.default_rng(8101)
    T = 2.5
    x = static_texture(rng, T)
    t = tvec(T)
    env = undb(-40 * np.clip((t - 0.3) / (T - 0.3), 0, 1) ** 1.2)
    gate = np.where(rng.uniform(0, 1, len(t) // 480 + 1) < 0.15 + 0.5 * np.linspace(0, 1, len(t) // 480 + 1),
                    0.15, 1.0)
    gate = lp(np.repeat(gate, 480)[:len(t)], 300)          # dropouts get denser as it fades
    return x * env * gate


def gen_footsteps_approach():
    rng = np.random.default_rng(9001)
    T = 5.5
    n = int(T * SR)
    dry = np.zeros((n, 2))
    send = np.zeros(n)
    steps = [(0.25, 11.0), (1.05, 8.5), (1.83, 6.4), (2.62, 4.6), (3.38, 3.1), (4.13, 2.0), (4.46, 1.9)]
    for k, (t0, d) in enumerate(steps):
        s = footstep(rng)
        if k == len(steps) - 1:
            s = s * 0.45                                   # second foot set down: stop
        s = lp(s, 16000 / (1 + d / 2.5))                   # air absorption with distance
        p = -0.35 + 0.4 * min(k, 5) / 5
        place(dry, pan(s / d, p), t0 + rng.uniform(-0.01, 0.01))
        place(send, s * 0.16 / d ** 0.3, t0)
    wet = reverb(send, rt60=1.3, wet=1.0, dry=0.0, seed=9002, n_out=n, predelay=0.015, er_span=0.05)
    return dry + wet


def gen_door_handle():
    rng = np.random.default_rng(10001)
    T = 2.2
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    # handle slowly pushed down: stick-slip friction pulses exciting squeaky metal modes
    c0, c1 = 0.12, 0.85
    exc = np.zeros(n)
    tt = c0
    while tt < c1:
        u = (tt - c0) / (c1 - c0)
        rate = 35 + 45 * np.sin(np.pi * u)
        exc[int(tt * SR)] += np.sin(np.pi * u) ** 0.5 * rng.uniform(0.3, 1.0)
        tt += 1 / rate * rng.uniform(0.7, 1.3)
    creak = norm(resbank(exc, [880, 1460, 2310, 3170], [0.012, 0.01, 0.008, 0.006], [1, 0.8, 0.6, 0.4]))
    slide = norm(bp(rng.standard_normal(n), 1500, 4500)) * np.sin(np.pi * np.clip((t - c0) / (c1 - c0), 0, 1))
    out += 0.45 * creak + 0.06 * slide
    # bottom stop (door is locked -> door shifts against the bolt)
    place(out, add(0.9 * metal_click(rng), 0.8 * wood_thump(rng)), 0.87)
    # rattling
    for t0, s in ((1.02, 0.8), (1.11, 0.6), (1.27, 0.9), (1.35, 0.55), (1.50, 0.7)):
        place(out, s * add(0.8 * metal_click(rng, ring=0.6), 0.5 * wood_thump(rng)), t0 + rng.uniform(-0.01, 0.01))
    # released: spring snaps the handle back up
    snap = metal_click(rng, ring=1.6, dur=0.5) * 1.1
    ts = tvec(0.5)
    snap += 0.15 * np.sin(TWO_PI * 420 * ts) * np.exp(-ts / 0.1) * (1 - np.exp(-ts / 0.001))
    place(out, snap + 0.4 * wood_thump(rng, 0.5), 1.78)
    return reverb(out, rt60=0.45, wet=0.18, dry=1.0, seed=10002, n_out=n)


def gen_light_click():
    rng = np.random.default_rng(11001)
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for t0, g in ((0.030, 0.35), (0.043, 1.0)):            # pre-snap + main rocker snap
        e = np.zeros(n)
        e[:int(0.0003 * SR)] = rng.standard_normal(int(0.0003 * SR))
        e[0] += 1.0
        plast = norm(resbank(e, np.array([1800, 2700, 3900, 5200, 7400]) * rng.uniform(0.97, 1.03),
                             [0.008, 0.006, 0.005, 0.004, 0.003], [0.7, 1.0, 0.8, 0.6, 0.4]))
        plate = norm(resbank(half_sine(0.0015, n), [180, 320], [0.012, 0.01], [1, 0.7]))
        c = norm(hp(rng.standard_normal(n) * np.exp(-t / 0.0004), 3000))
        place(out, g * (plast + 0.5 * plate + 0.5 * c), t0)
    return reverb(out, rt60=0.35, wet=0.12, dry=1.0, seed=11002, n_out=n)


def gen_lamp_buzz():
    rng = np.random.default_rng(12001)
    T = 3.0
    n = int(T * SR)
    t = np.arange(n) / SR
    special = {1: 0.25, 2: 1.0, 3: 0.3, 4: 0.55, 5: 0.18, 6: 0.4, 7: 0.12, 8: 0.28}
    hum = np.zeros(n)
    for k in range(1, 81):                                 # 50 Hz grid; 100 Hz magnetostriction dominates
        a = special.get(k, 0.9 / k ** 1.15 * (1.3 if k % 2 == 0 else 0.7))
        hum += a * np.sin(TWO_PI * 50 * k * t + rng.uniform(0, TWO_PI))
    hum = norm(hum)
    sizzle = norm(bp(rng.standard_normal(n), 2500, 7000) * np.abs(np.sin(TWO_PI * 50 * t)) ** 12)
    segs = [(0.10, 0.15, 0.6), (0.22, 0.25, 0.5), (0.37, 0.52, 0.75), (0.60, 0.635, 0.55),
            (0.71, 0.83, 0.8), (0.90, T + 1, 1.0)]
    state = np.zeros(n)
    for a, b, lvl in segs:
        state[int(a * SR):int(min(b, T) * SR)] = lvl
    state = np.convolve(state, np.hanning(int(0.004 * SR)) / np.sum(np.hanning(int(0.004 * SR))), "same")
    warm = np.where(t < 0.9, 1.0, 0.7 + 0.3 * (1 - np.exp(-(t - 0.9) / 0.8)))
    wob = 1 + 0.06 * smooth_noise(rng, n, 3)
    sig = (hum + 0.12 * sizzle) * state * warm * wob
    for a, b, lvl in segs:                                 # arc crackle at every strike
        sig += 0.5 * lvl * norm(crackles(rng, n, a, 0.03, int(rng.integers(6, 18)), 1.0, 2000, 9000))
    sig += 0.15 * norm(crackles(rng, n, 1.0, 1.9, 7, 1.0, 2000, 9000))
    relay = metal_click(rng, ring=0.3, dur=0.2) * 0.25
    place(sig, relay, 0.05)
    return reverb(sig, rt60=1.1, wet=0.25, dry=1.0, seed=12002, n_out=n, damp=6000)


def gen_drip():
    rng = np.random.default_rng(13001)
    T = 1.8
    n = int(T * SR)
    out = np.zeros(n)
    t = tvec(0.15)
    f = 950 + 1500 * (1 - np.exp(-t / 0.008))               # Minnaert bubble chirp up
    y = np.sin(phase(f) - phase(f)[0]) * (1 - np.exp(-t / 0.0004)) * np.exp(-t / 0.018)
    click = hp(rng.standard_normal(len(t)) * np.exp(-t / 0.0003), 3000)
    place(out, norm(y) + 0.15 * norm(click), 0.05)
    return reverb(out, rt60=1.3, wet=0.5, dry=1.0, seed=13002, n_out=n, predelay=0.004,
                  er_span=0.02, n_er=24, er_level=0.8, hi_mult=0.8, damp=11000)


def gen_camera_shutter():
    rng = np.random.default_rng(14001)
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)

    def click(fs, g):
        e = np.zeros(n)
        k = int(0.006 * SR)
        e[:k] = rng.standard_normal(k) * np.exp(-t[:k] / 0.0015)
        e[0] += 1.0
        met = norm(resbank(e, np.array(fs) * rng.uniform(0.98, 1.02), [0.012, 0.009, 0.007, 0.005],
                           [1, 0.8, 0.6, 0.4]))
        body = norm(resbank(e, [600, 1100], [0.008, 0.006], [1, 0.7]))
        burst = norm(bp(e, 2000, 8000))
        return g * (met + 0.4 * body + 0.5 * burst)

    place(out, click([2900, 4300, 6100, 7600], 0.8), 0.02)
    whir = norm(bp(rng.standard_normal(int(0.04 * SR)), 3000, 6000)) * np.hanning(int(0.04 * SR)) * 0.08
    place(out, whir, 0.035)
    place(out, click([3300, 4700, 5600, 8100], 1.0), 0.088)
    return reverb(out, rt60=0.3, wet=0.1, dry=1.0, seed=14002, n_out=n)


def gen_tinnitus_ring():
    rng = np.random.default_rng(15001)
    T = 4.0
    n = int(T * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.0004 * np.sin(TWO_PI * 0.35 * t)
    L = np.sin(phase(8000 * vib)) + 0.2 * np.sin(phase(8047 * vib))
    R = np.sin(phase(8000 * 1.0012 * vib) + 0.7) + 0.2 * np.sin(phase(8047 * 1.0008 * vib) + 1.9)
    air = rmsnorm(bp(rng.standard_normal((n, 2)), 7000, 9000)) * 0.04
    env = ramp(t, 0, 0.12) * undb(-48 * np.clip((t - 0.5) / (T - 0.5), 0, 1) ** 1.3)
    return (np.stack([L, R], 1) + air) * env[:, None]


def gen_breath_whisper():
    rng = np.random.default_rng(16001)
    T = 3.0
    n = int(T * SR)
    t = np.arange(n) / SR
    x = t / T
    src = rng.standard_normal(n)
    F1, F2, F3 = 680 - 220 * x, 1550 - 400 * x, 2650 - 150 * x  # "haaa" closing to "hhhh"
    v = (rmsnorm(tvf(src, F1, "bp", q=5)) + 0.7 * rmsnorm(tvf(src, F2, "bp", q=6))
         + 0.4 * rmsnorm(tvf(src, F3, "bp", q=7)))
    asp = 0.35 * rmsnorm(bp(src, 3500, 7500))
    low = 0.3 * rmsnorm(lp(rng.standard_normal(n), 220))   # breath hitting the mic: close
    env = ramp(t, 0.0, 0.35) * np.clip(1 - (t - 0.35) / 2.6, 0, 1) ** 1.6
    shaky = 1 + 0.18 * np.sin(TWO_PI * 6.2 * t + 0.8 * smooth_noise(rng, n, 2)) * x + \
        0.12 * smooth_noise(rng, n, 11)
    breath = (v + asp + low) * env * shaky
    # faint irregular vocal fry near the end -> unsettling
    e = np.zeros(n)
    tt = 1.6
    while tt < 2.7:
        e[int(tt * SR)] = rng.uniform(0.5, 1.0)
        tt += 1 / rng.uniform(38, 55)
    fry = resbank(e, [520, 1250, 2500], [0.004, 0.003, 0.002], [1, 0.6, 0.3])
    fry = norm(fry) * np.sin(np.pi * np.clip((t - 1.6) / 1.1, 0, 1)) ** 2
    y = breath / pk(breath) + 0.18 * fry
    return reverb(pan(y, -0.2), rt60=0.35, wet=0.07, dry=1.0, seed=16002, n_out=n)


def gen_sub_pulse():
    buf = np.zeros(int(2.0 * SR))
    t = tvec(1.3)
    f = 40 + 14 * np.exp(-t / 0.12)
    env = ramp(t, 0, 0.07) * np.exp(-np.maximum(t - 0.07, 0) / 0.22)
    y = np.sin(phase(f) - phase(f)[0]) * env
    y = 0.8 * y + 0.5 * lp(np.tanh(3 * y) - y, 300)        # 2nd/3rd harmonic layer for small speakers
    y = fades(y, 0, 0.3)
    place_wrap(buf, y, 0.04)
    place_wrap(buf, y, 1.04)
    return buf


# ==========================================================================
# ATMOSPHERE layers (English 3-part series: two "moms" - the one at the door who knows
# "Firefly", the one in the hallway whose reflection smiles on its own).
# Beds leave room for the narration: little energy and nothing rhythmic between 1 and 4 kHz.
# Loopable beds are built circularly (periodic noise / LFOs / oscillator phases, events wrapped
# around the end, circular reverb and filters), so the last sample runs straight into the first
# one when the file is tiled - no crossfade dip, no fade dip at the seam.
# ==========================================================================
def circ(fn, x, *ctrl, pre=3.0):
    """Run a causal filter fn(x, *ctrl) over a periodic signal: the filter state is warmed up on
    the signal's own tail, so the output is periodic too. Per-sample ctrl arrays are wrapped alike."""
    n = len(x)
    k = min(n, int(pre * SR))

    def wrap(a):
        a = np.asarray(a, float)
        return np.concatenate([a[-k:], a]) if a.ndim and len(a) == n else a

    return fn(wrap(x), *[wrap(c) for c in ctrl])[k:]


def reverb_circ(x, rt60, wet=0.3, dry=1.0, seed=7, **kw):
    """reverb() for a periodic signal: the tail is folded back over the start."""
    ir = make_ir(rt60, seed, **kw)
    X = st(x)
    n = len(X)
    out = dry * X
    for c in range(2):
        w = sps.fftconvolve(X[:, c], ir[:, c])
        k = int(np.ceil(len(w) / n))
        out[:, c] += wet * np.pad(w, (0, k * n - len(w))).reshape(k, n).sum(0)
    return out


def loop_lfo(rng, n, cyc_max, cyc_min=1, tilt=1.0):
    """Smooth random control signal in [-1, 1], exactly periodic over n samples."""
    u = np.arange(n) / n
    y = np.zeros(n)
    for k in range(cyc_min, cyc_max + 1):
        y += rng.standard_normal() / k ** tilt * np.sin(TWO_PI * k * u + rng.uniform(0, TWO_PI))
    return y / np.max(np.abs(y))


def loop_phase(f, n):
    """Phase of a periodic frequency curve, scaled by a hair so it closes on whole cycles over n samples."""
    f = np.broadcast_to(np.asarray(f, float), (n,))
    cyc = float(np.sum(f)) / SR
    return phase(f * (max(1, round(cyc)) / cyc))


def lfq(f, T):
    """Quantise an LFO frequency to whole cycles per loop length T."""
    return max(1, round(f * T)) / T


def peq(x, f, gain_db, q=1.0):
    """RBJ peaking EQ."""
    A = 10 ** (gain_db / 40)
    w0 = TWO_PI * f / SR
    al, c = np.sin(w0) / (2 * q), np.cos(w0)
    b = np.array([1 + al * A, -2 * c, 1 - al * A])
    a = np.array([1 + al / A, -2 * c, 1 - al / A])
    return sps.lfilter(b / a[0], a / a[0], x, axis=0)


def quiet_point(x, lo, hi):
    """Sample index in [lo, hi) (negative = before the end; circular): among the calmest quarter of
    the window (2 s local power - keeps the start away from events), the one where both channels
    stay closest to zero over +-0.5 ms -> loop start that also begins cleanly from silence."""
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    a = maximum_filter1d(np.max(np.abs(x), axis=1), 2 * int(0.0005 * SR) + 1, mode="wrap")
    r = uniform_filter1d(np.sum(x ** 2, axis=1), int(2.0 * SR), mode="wrap")
    idx = np.arange(lo, hi) % len(x)
    calm = idx[r[idx] <= np.percentile(r[idx], 25)]
    return int(calm[np.argmin(a[calm])])


# ---- music box ------------------------------------------------------------
NOTE_ST = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name):
    """'G#4' -> Hz (A4 = 440)."""
    return 440.0 * 2 ** ((NOTE_ST[name[:-1]] - 9) / 12 + int(name[-1]) - 4)


# Original lullaby written for this series (not based on an existing tune): A minor, 3/4,
# 16 bars at 60 bpm = 48 s. Per bar: melody "note beats ..." + one low comb note on the downbeat.
LULLABY = [
    ("E5 1 D5 1 C5 1", "A3"), ("B4 2 A4 1", "E3"), ("C5 1 B4 1 A4 1", "F3"), ("G#4 3", "E3"),
    ("E5 1 D5 1 C5 1", "A3"), ("F5 2 E5 1", "D3"), ("D5 1 C5 1 B4 1", "E3"), ("A4 3", "A3"),
    ("A5 2 G5 1", "F3"), ("F5 1 E5 1 D5 1", "D3"), ("E5 2 C5 1", "A3"), ("B4 3", "E3"),
    ("E5 1 D5 1 C5 1", "A3"), ("F5 1 D5 1 B4 1", "D3"), ("C5 1 B4 1 G#4 1", "E3"), ("A4 3", "A3"),
]
# "broken" pins: (bar, beat) -> (late s, flat cents, dead tooth?)
LULLABY_BROKEN = {(2, 1): (0.09, 0, False), (5, 0): (0.06, -22, False), (9, 2): (0.14, 0, False),
                  (11, 0): (0.0, -32, False), (13, 1): (0.05, 0, True), (14, 2): (0.11, -20, False)}


def lullaby_events():
    """[(beat, note, is_bass, (bar, beat-in-bar))] for one pass of the lullaby (48 beats)."""
    ev = []
    for bar, (mel, bass) in enumerate(LULLABY):
        ev.append((3.0 * bar, bass, True, (bar, -1)))
        tok = mel.split()
        b = 0.0
        for name, d in zip(tok[::2], tok[1::2]):
            ev.append((3.0 * bar + b, name, False, (bar, int(b))))
            b += float(d)
    return ev


TINE_MODES = ((1.0, 1.0, 1.0), (2.0, 0.04, 0.45), (6.267, 0.30, 0.10), (17.55, 0.09, 0.03))  # ratio, amp, tau x


def tine(rng, f, vel=1.0, dead=False, tau_mult=1.0, dur=4.0):
    """Music-box comb tooth: clamped-bar modes (1, 6.27, 17.5 x f) whose overtones die fast, a
    second tooth a few cents off (slow shimmer), the pin's mechanical click and a faint box knock."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    tau = 0.55 * (523.0 / f) ** 0.6 * tau_mult
    y = np.zeros(n)
    if dead:   # broken tooth: dull, choked thud at the pitch
        y += 0.25 * np.sin(TWO_PI * f * t) * np.exp(-t / 0.035)
    else:
        for r, a, ts in TINE_MODES:
            fr = f * r * (1 + rng.uniform(-0.004, 0.004)) if r > 2 else f * r
            if fr < 15000:
                y += a * np.sin(TWO_PI * fr * t) * np.exp(-t / (tau * ts))
        y += 0.18 * np.sin(TWO_PI * f * 2 ** (rng.uniform(2, 5) / 1200) * t) * np.exp(-t / (tau * 0.8))
    y *= 1 - np.exp(-t / 0.0005)
    k = int(0.0015 * SR)
    e = np.zeros(n)
    e[:k] = rng.standard_normal(k) * np.exp(-t[:k] / 0.0003)
    click = resbank(e, [2600 * rng.uniform(0.9, 1.1), 4100, 5900], [0.004, 0.003, 0.002], [1, 0.7, 0.4])
    knock = resbank(half_sine(0.0012, n), [190, 310, 470], [0.02, 0.015, 0.01], [1, 0.6, 0.3])
    y = y + (0.16 if dead else 0.07) * norm(click) + 0.05 * norm(knock)
    return fades(vel * y, 0, 0.4)


def music_box_layer(rng, events, n, wrap, ratio=1.0, tau_mult=1.0, vmul=None):
    """Render (t0 s, note, is_bass, (bar, beat)) events to a stereo buffer (comb spread over the stereo field)."""
    buf = np.zeros((n, 2))
    detune = {}
    for j, (t0, name, bass, pos) in enumerate(events):
        detune.setdefault(name, rng.uniform(-14, 10))      # the box is out of tune - consistently per tooth
        late, flat, dead = LULLABY_BROKEN.get(pos, (0.0, 0.0, False))
        f = hz(name) * ratio * 2 ** ((detune[name] + flat) / 1200)
        vel = (0.28 if bass else 0.85) * rng.uniform(0.88, 1.08) * (1.0 if vmul is None else vmul[j])
        sig = pan(tine(rng, f, vel, dead, tau_mult), float(np.clip(0.3 * np.log2(hz(name) / 440), -0.35, 0.35)))
        tt = t0 + late + rng.uniform(-0.008, 0.008)
        (place_wrap if wrap else place)(buf, sig, tt)
    return buf


def gen_music_box_lullaby():
    rng = np.random.default_rng(17001)
    T = 48.0                                               # 16 bars of 3/4 at 60 bpm
    n = int(T * SR)
    lead = 0.35
    ev = [(lead + b, name, bass, pos) for b, name, bass, pos in lullaby_events()]
    dry = music_box_layer(rng, ev, n, wrap=True)
    # wow (slow pitch wobble of the tired spring) + flutter as a periodic modulated delay
    tt = np.arange(n) / SR
    d = (0.0029 * np.sin(TWO_PI * lfq(0.31, T) * tt + 0.4) + 0.0026 * loop_lfo(rng, n, 12, 3)
         + 0.000025 * np.sin(TWO_PI * lfq(5.3, T) * tt))
    pos = np.arange(n) - d * SR
    dry = np.stack([np.interp(pos, np.arange(n), dry[:, c], period=n) for c in range(2)], 1)
    wet = reverb_circ(dry, rt60=3.6, wet=0.85, dry=0.6, seed=17002, predelay=0.03, damp=2800,
                      hi_mult=0.35, lo_mult=1.1, er_level=0.25)
    return circ(lambda z: peq(lp(z, 3000, order=2), 2600, -2.0, 0.8), wet)


def gen_music_box_slow_detuned():
    rng = np.random.default_rng(17101)
    T = 30.0
    n = int(T * SR)
    lead = 0.4
    # the spring: 70 % tempo (42 bpm), then it runs out - beats/s sag to zero between 18 and 27 s
    tg = np.arange(0, T, 0.001)
    r = 0.7 * np.where(tg < 18.0, 1.0, np.clip(1 - (tg - 18.0) / 9.0, 0, 1) ** 1.3)
    B = np.cumsum(r) * 0.001 + 1e-9 * tg
    ev = [(lead + float(np.interp(b, B, tg)), name, bass, pos)
          for b, name, bass, pos in lullaby_events() if b < B[-1] - 0.02]
    ev = [e for e in ev if not (e[2] and e[0] > 22.0)]     # too weak to pluck the stiff low teeth
    vm = [0.55 + 0.45 * float(np.interp(t0 - lead, tg, r)) / 0.7 for t0, *_ in ev]   # plucks weaken with the spring
    vm = [v * (0.6 if bass else 1.0) if t0 > 20 else v for v, (t0, _, bass, _) in zip(vm, ev)]
    dry = music_box_layer(rng, ev, n, wrap=False, ratio=0.7, tau_mult=1.15, vmul=vm)   # ~6 semitones down
    # last pin barely catches its tooth as the cylinder stops
    place(dry, pan(tine(rng, hz("E5") * 0.7, 0.7, dead=True), 0.1), ev[-1][0] + 2.6)
    # governor ratchet slowing to a stop under the last notes (very faint)
    tick_t, rate = ev[-1][0] - 5.0, 11.0
    while rate > 1.6:
        k = metal_click(rng, ring=0.4, dur=0.08)
        place(dry, pan(lp(k, 2500) * 0.035 * min(1.0, rate / 6), -0.2), tick_t)
        tick_t += 1 / rate
        rate *= 0.93
    # pitch sag + bigger wow as a varispeed read of the dry render
    t = np.arange(n) / SR
    p = 1 - 0.16 * ramp(t, 18.5, 8.0) ** 1.4
    d = 0.006 * np.sin(TWO_PI * 0.23 * t + 1.1) + 0.003 * smooth_noise(rng, n, 0.4) + \
        0.00004 * np.sin(TWO_PI * 4.7 * t)
    pos = (np.cumsum(p) - p[0]) - d * SR
    dry = np.stack([np.interp(pos, np.arange(n), dry[:, c], left=0.0, right=0.0) for c in range(2)], 1)
    wet = reverb(dry, rt60=5.5, wet=1.0, dry=0.45, seed=17102, n_out=n, predelay=0.05, damp=2200,
                 hi_mult=0.3, lo_mult=1.15, er_level=0.2)
    return peq(lp(wet, 2600, order=2), 2600, -2.0, 0.8)


# ---- house ambience ---------------------------------------------------------
def wood_creak(rng, dur):
    """House settling: slow stick-slip grain through floorboard / frame modes, distant."""
    n = int(dur * SR)
    x = np.arange(n) / n
    e = np.zeros(n)
    tt = rng.uniform(0.0, 0.02)
    r0, r1 = rng.uniform(12, 22), rng.uniform(28, 55)
    while tt < dur * 0.95:
        u = tt / dur
        e[int(tt * SR)] += np.sin(np.pi * u) ** 0.7 * rng.uniform(0.4, 1.0)
        tt += 1 / (r0 + (r1 - r0) * np.sin(np.pi * u)) * rng.uniform(0.75, 1.25)
    s = rng.uniform(0.8, 1.25)
    body = resbank(e, np.array([145, 232, 371, 548, 790, 1130]) * s,
                   [0.035, 0.028, 0.02, 0.014, 0.01, 0.007], [0.7, 1.0, 0.9, 0.7, 0.45, 0.25])
    grit = bp(rng.standard_normal(n), 400, 1600) * np.sin(np.pi * x) * 0.04
    return fades(lp(norm(body) + grit, 1500), 0.005, 0.05)


def pipe_tick(rng):
    """Heating pipe in the wall ticking as it expands: small metal ring + wall thunk, muffled."""
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    e = np.zeros(n)
    k = int(0.0006 * SR)
    e[:k] = rng.standard_normal(k) * np.exp(-t[:k] / 0.0002)
    e[0] += 1.0
    ring = resbank(e, np.array([820, 1370, 2240, 3050]) * rng.uniform(0.9, 1.1),
                   [0.03, 0.022, 0.015, 0.01], [1, 0.8, 0.5, 0.3])
    thunk = resbank(half_sine(0.002, n), [120, 210], [0.02, 0.015], [1, 0.6])
    return fades(lp(norm(ring) + 0.6 * norm(thunk), 2000, order=2), 0, 0.05)


def gen_house_ambience():
    rng = np.random.default_rng(18001)
    T = 90.0
    n = int(T * SR)
    t = np.arange(n) / SR
    # room tone: building rumble + soft air (kept below ~1 kHz) + a whisper of HF hiss; slow drift
    rum = circ(lambda z: lp(hp(z, 22), 160), np.stack([colored(rng, n, 2), colored(rng, n, 2)], 1))
    air = circ(lambda z: lp(z, 900), np.stack([colored(rng, n, 1), colored(rng, n, 1)], 1))
    hiss = circ(lambda z: lp(hp(z, 5000), 12000), rng.standard_normal((n, 2)))
    drift = (1 + 0.22 * loop_lfo(rng, n, 18, 2))[:, None]
    bed = 0.050 * rmsnorm(rum) * drift + 0.040 * rmsnorm(air) * drift[::-1] + 0.005 * rmsnorm(hiss)
    # distant fridge: 50 Hz + 100 Hz magnetostriction (+ a slowly beating 99.9 Hz), few harmonics
    wob = 1 + 0.12 * loop_lfo(rng, n, 9, 2)
    hum = sum(a * np.sin(loop_phase(f, n) + rng.uniform(0, TWO_PI))
              for f, a in ((50.0, 0.55), (100.0, 1.0), (99.9, 0.35), (150.0, 0.22), (200.0, 0.14), (300.0, 0.05)))
    hum = circ(lambda z: lp(z, 420), hum * wob)
    bed += pan(0.030 * rmsnorm(hum), -0.35)
    # sparse events: wood creaks / pipe ticks, irregular, >= 6.5 s apart (also across the loop seam)
    times = [rng.uniform(2.5, 6.0)]
    while True:
        nxt = times[-1] + rng.uniform(6.5, 13.0)
        if nxt > times[0] + T - 6.5:
            break
        times.append(nxt)
    ev = np.zeros((n, 2))
    for t0 in times:
        p = rng.uniform(-0.8, 0.8)
        if rng.uniform() < 0.6:
            s = wood_creak(rng, rng.uniform(0.25, 0.9)) * rng.uniform(0.55, 1.0)
        else:
            s = np.zeros(int(2.0 * SR))
            tk, a = 0.0, rng.uniform(0.45, 0.8)
            for _ in range(rng.integers(1, 4)):
                place(s, pipe_tick(rng), tk, a)
                tk += rng.uniform(0.2, 0.8)
                a *= rng.uniform(0.5, 0.85)
        place_wrap(ev, pan(s, p), t0)
    ev = reverb_circ(ev, rt60=0.9, wet=0.55, dry=1.0, seed=18002, predelay=0.012, damp=4000)
    return bed + undb(-5) * ev


# ---- whisper texture ---------------------------------------------------------
WH_VOWELS = np.array([(310, 2020, 2960), (430, 1800, 2600), (600, 1700, 2500), (760, 1250, 2500),
                      (690, 1000, 2500), (500, 900, 2400), (380, 950, 2300), (560, 1400, 2300)], float)


def whisper_syllable(rng, scale):
    """One unvoiced pseudo-syllable: optional fricative/plosive onset, formant-filtered breath noise
    gliding between two random vowel targets, optional sibilant coda. No language, no words."""
    cons = rng.choice(["s", "sh", "f", "t", "k", "h", "-"], p=[0.18, 0.12, 0.1, 0.12, 0.1, 0.25, 0.13])
    cd = {"s": 0.09, "sh": 0.08, "f": 0.07, "t": 0.025, "k": 0.03}.get(cons, 0.0) * rng.uniform(0.8, 1.3)
    vd = rng.uniform(0.10, 0.26)
    coda = rng.uniform() < 0.15
    dur = cd + vd + (0.08 if coda else 0.0) + 0.03
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    nc = int(cd * SR)
    if nc:
        lo, hi, g = {"s": (4800, 9500, 0.5), "sh": (2800, 6000, 0.22), "f": (1500, 7000, 0.12),
                     "t": (3500, 7500, 0.4), "k": (1800, 3500, 0.25)}[cons]
        c = bp(rng.standard_normal(nc), lo, hi) * np.hanning(nc)
        y[:nc] += g * c / (np.std(c) + 1e-9)
    v0, v1 = WH_VOWELS[rng.integers(len(WH_VOWELS))], WH_VOWELS[rng.integers(len(WH_VOWELS))]
    i0, nv = max(0, nc - int(0.015 * SR)), int((vd + 0.03) * SR)
    nv = min(nv, n - i0)
    u = np.arange(nv) / nv
    glide = np.clip((u - 0.25) / 0.6, 0, 1) if rng.uniform() < 0.5 else np.zeros(nv)
    src = rng.standard_normal(nv)
    vow = np.zeros(nv)
    for i, (q, g) in enumerate(((4.0, 1.0), (7.0, 0.40), (9.0, 0.18))):    # weak F2/F3: mumbly
        vow += g * rmsnorm(tvf(src, (v0[i] + (v1[i] - v0[i]) * glide) * scale, "bp", q=q, block=64))
    att = 0.06 if cons == "h" else 0.025
    env = ramp(u * nv / SR, 0, att) * (1 - ramp(u * nv / SR, nv / SR - 0.08, 0.08))
    y[i0:i0 + nv] += 0.8 * vow * env
    if coda:
        m = int(0.08 * SR)
        c = bp(rng.standard_normal(m), 4800, 9000) * np.hanning(m)
        y[n - m:] += 0.35 * c / (np.std(c) + 1e-9)
    y = fades(y, 0.004, 0.01)
    return y[::-1].copy() if rng.uniform() < 0.15 else y     # some syllables run backwards


def whisper_voice(rng, n, scale, rate):
    """One whisperer: phrases of pseudo-syllables with pauses, wrapped around the loop."""
    buf = np.zeros(n)
    t0 = rng.uniform(0, 2.0)
    end = t0 + n / SR - 0.4
    tt = t0
    while True:
        plen = rng.uniform(0.8, 2.3)
        if tt + plen > end:
            break
        a0 = rng.uniform(0.7, 1.0)
        ts = tt
        while ts < tt + plen:
            s = whisper_syllable(rng, scale)
            x = (ts - tt) / plen
            place_wrap(buf, s, ts, a0 * (0.75 + 0.25 * np.sin(np.pi * min(x * 1.4, 1))) * rng.uniform(0.6, 1.0))
            ts += len(s) / SR * rng.uniform(0.8, 1.0) / rate + rng.uniform(0.02, 0.09)
        tt = ts + rng.uniform(0.7, 2.8)
    return buf


def deess(x, f_split=4500.0, thr=0.35, ratio=4.0):
    """Split-band de-esser: compress only the band above f_split, relative to its own RMS."""
    hi = hp(x, f_split, order=2)
    lo = x - hi
    e = np.sqrt(lp(np.sum(st(hi) ** 2, axis=1) / 2, 60, order=1).clip(0))
    ref = thr * np.sqrt(np.mean(e ** 2)) * 3
    g = np.minimum(1.0, (ref / np.maximum(e, 1e-9)) ** (1 - 1 / ratio))
    return lo + hi * (g[:, None] if x.ndim == 2 else g)


def gen_whisper_texture():
    rng = np.random.default_rng(19001)
    T = 20.0
    n = int(T * SR)
    t = np.arange(n) / SR
    # formant scale, pan centre, pan sweep, distance 0..1, syllable rate
    voices = [(1.00, -0.55, 0.20, 0.25, 1.00), (0.86, 0.60, 0.20, 0.50, 0.90), (1.12, -0.10, 0.45, 0.70, 0.80),
              (0.78, 0.25, 0.30, 0.85, 0.75), (1.05, 0.90, 0.08, 0.45, 0.85), (0.94, -0.90, 0.08, 0.60, 0.85)]
    dry = np.zeros((n, 2))
    send = np.zeros((n, 2))
    for k, (sc, pc, sw, dist, rate) in enumerate(voices):
        v = whisper_voice(rng, n, sc, rate)
        v = circ(lambda z: lp(z, 9000 - 6000 * dist, order=2), v, pre=1.0)
        pth = np.clip(pc + sw * np.sin(TWO_PI * (1 + k % 2) * t / T + rng.uniform(0, TWO_PI)), -1, 1)
        s = pan(v, pth) * (1 - 0.45 * dist)
        dry += s * (1 - 0.6 * dist)
        send += s * (0.25 + 0.75 * dist)
        if k == 0:   # the "reflection": same whisper, mirrored side, a little late and darker
            dl = (0.032 + 0.008 * np.sin(TWO_PI * t / T)) * SR
            r = np.interp(np.arange(n) - dl, np.arange(n), v, period=n)
            r = circ(lambda z: lp(z, 2500, order=2), r, pre=1.0)
            send += pan(r, -pth) * 0.55
    wet = reverb_circ(send, rt60=1.7, wet=0.7, dry=0.0, seed=19002, predelay=0.02, damp=6000, er_level=0.4)
    mix = (dry + wet) * (1 + 0.15 * loop_lfo(rng, n, 4, 1))[:, None]
    mix = circ(lambda z: deess(z), mix, pre=1.0)
    return circ(lambda z: lp(peq(peq(z, 2600, -6.0, 0.6), 400, 2.5, 0.8), 8500), mix, pre=1.0)


# ---- tension pad ---------------------------------------------------------------
def gen_dark_pad_tension():
    rng = np.random.default_rng(20001)
    T = 60.0
    n = int(T * SR)
    t = np.arange(n) / SR

    def lfo(cyc, ph):           # 0..1, periodic in T
        return 0.5 - 0.5 * np.cos(TWO_PI * cyc * t / T + ph)

    swell = 0.3 + 0.7 * (0.6 * lfo(2, 0.0) + 0.4 * lfo(3, 1.7)) ** 1.3       # breathing in and out
    voices = [  # f0, gain, amp cycles/loop, phase, depth, stereo beat Hz, harmonic tilt, drift cents
        (65.41, 1.00, 1, 0.0, 0.30, 0.17, 1.3, 0),      # C2 root
        (92.50, 0.60, 2, 2.2, 0.85, 0.23, 1.4, 0),      # F#2 tritone
        (98.00, 0.42, 3, 4.9, 1.00, 0.31, 1.5, 0),      # G2: minor 2nd against F#2
        (130.81, 0.34, 2, 4.0, 0.90, 0.19, 1.5, 0),     # C3
        (138.59, 0.30, 3, 1.1, 1.00, 0.27, 1.6, 14),    # C#3: minor 2nd rub, sour drift
        (32.70, 0.40, 1, 3.0, 0.40, 0.00, 2.5, 0),      # C1 weight
    ]
    pad = np.zeros((n, 2))
    for f0, g, cyc, ph, depth, beat, tilt, drift in voices:
        amp = g * (1 - depth * lfo(cyc, ph)) * swell
        dr = 2 ** (drift * np.sin(TWO_PI * t / T + ph) / 1200)
        for side in (-1, 1):
            p = loop_phase((f0 + side * beat / 2) * dr, n) + rng.uniform(0, TWO_PI)
            s = sum(np.sin(k * p) / k ** tilt for k in range(1, 15))
            pad += pan(s * amp, 0.55 * side)
    fc = 160 + 620 * swell ** 1.6
    pad = circ(lambda z, f: tvf(z, f, "lp", q=0.85, stages=2, block=512), pad, fc)
    p_rms = float(np.sqrt(np.mean(pad ** 2)))
    # bow / air noise inside the cluster
    bow = circ(lambda z: bp(z, 60, 420), np.stack([colored(rng, n, 1), colored(rng, n, 1)], 1))
    bow = rmsnorm(bow) * p_rms * undb(-22) * swell[:, None]
    # faint glassy harmonic: F#5 / G5 (minor 2nd up high) taking turns, slight vibrato, inharmonic partial
    glass = np.zeros((n, 2))
    for f0, cyc, ph, pn in ((739.99, 1, 0.6, -0.4), (783.99, 2, 3.4, 0.45)):
        v = 1 + 0.0012 * np.sin(TWO_PI * 3 * t / T + ph)
        g = lfo(cyc, ph) ** 3
        s = np.sin(loop_phase(f0 * v, n)) + 0.12 * np.sin(loop_phase(f0 * 2.71 * v, n) + 1.0)
        glass += pan(s * g, pn)
    glass = rmsnorm(glass) * p_rms * undb(-24)
    out = pad + bow + glass
    return reverb_circ(out, rt60=4.0, wet=0.35, dry=1.0, seed=20002, predelay=0.03, damp=3500, er_level=0.2)


# ---- one-shots and short loops ---------------------------------------------------
def gen_heartbeat_slow_muffled():
    rng = np.random.default_rng(21001)
    T, beats = 10.0, 9                                      # 54 bpm, exactly 9 beats -> seamless loop
    n = int(T * SR)
    buf = np.zeros(n)
    per = T / beats
    for k in range(beats):
        t0 = 0.25 + k * per + rng.uniform(-0.008, 0.008)
        a = 1 + rng.uniform(-0.05, 0.05)
        place_wrap(buf, heart_thump(rng, 50, 34, 0.09, 0.15), t0, a)
        place_wrap(buf, heart_thump(rng, 60, 40, 0.06, 0.15), t0 + 0.34, 0.6 * a)
    buf = circ(lambda z: lp(lp(z, 150), 220), buf, pre=2.0)          # through the body / a pillow
    hush = circ(lambda z: lp(z, 120), colored(rng, n, 2), pre=2.0)  # faint inner rush
    return buf + 0.03 * pk(buf) * hush / pk(hush)


def bowed(rng, f0, dur, vib_rate, vib_cents, slide_cents):
    """Bowed string voice: band-limited saw with bow bite (sharp start), vibrato, upward screech
    slide, slip noise synchronous with the string period."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    jit = 0.3 * smooth_noise(rng, n, 9)
    vib = 2 ** (vib_cents * (np.sin(TWO_PI * vib_rate * t + rng.uniform(0, TWO_PI)) + jit) * ramp(t, 0.03, 0.12) / 1200)
    bite = 2 ** (30 * np.exp(-t / 0.025) / 1200)
    slide = 2 ** (slide_cents * ramp(t, 0.18, 0.7) / 1200)
    f = f0 * vib * bite * slide
    ph = phase(f) + rng.uniform(0, TWO_PI)
    y = saw(ph, f, kmax=80, fmax=13000)
    slip = hp(rng.standard_normal(n), 2500) * (0.5 + 0.5 * np.cos(ph)) ** 6
    return y / pk(y) + 0.35 * slip / pk(slip)


def gen_stinger_violin_screech():
    rng = np.random.default_rng(22001)
    T = 2.5
    n = int(T * SR)
    t = np.arange(n) / SR
    # E3 / A#3 (tritone), F4 / B4 (tritone), D#6 E6 A#6 B6 high screech cluster
    notes = [(164.81, 0.45, 0), (233.08, 0.40, 0), (349.23, 0.45, 20), (493.88, 0.50, 30),
             (1244.51, 0.9, 60), (1318.51, 1.0, 90), (1864.66, 0.75, 110), (1975.53, 0.7, 70)]
    out = np.zeros((n, 2))
    for i, (f0, g, sl) in enumerate(notes):
        v = bowed(rng, f0 * 2 ** (rng.uniform(-12, 12) / 1200), T, rng.uniform(5.8, 7.6), rng.uniform(25, 55), sl)
        out += pan(g * v, -0.8 + 1.6 * ((i * 5) % 8) / 7)
    env = (1 - np.exp(-t / 0.002)) * (0.13 + 0.87 * np.exp(-t / 0.07) + 0.09 * ramp(t, 0.15, 0.45)) \
        * (1 - ramp(t, 0.62, 0.3))
    out *= env[:, None]
    scratch = norm(bp(rng.standard_normal(n), 1800, 9000)) * np.exp(-t / 0.018) * (1 - np.exp(-t / 0.001))
    out += st(0.5 * scratch)
    # violin-ish body: low air mode, bridge hill, a nasal dip
    out = peq(peq(peq(out, 290, 4.0, 1.2), 2600, 5.0, 1.0), 1400, -4.0, 1.5)
    out = lp(np.tanh(1.0 * out / pk(out)), 11000)
    return reverb(out, rt60=2.0, wet=0.4, dry=1.0, seed=22002, n_out=n, predelay=0.015, damp=7000)


def piano_note(rng, f0, dur, vel=1.0, B=0.00025, nstr=2):
    """Stiff-string piano tone: f_k = k f0 sqrt(1 + B k^2), hammer-position comb, unison strings a
    cent apart, two-stage decay (prompt + aftersound), attack pitch glide from tension modulation."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    glide = 1 + 0.003 * vel * np.exp(-t / 0.05)
    for s in range(nstr):
        det = 2 ** (rng.uniform(-1.5, 1.5) / 1200)
        for k in range(1, 70):
            fk = k * f0 * det * np.sqrt(1 + B * k * k)
            if fk > 7000:
                break
            a = abs(np.sin(np.pi * k / 7.3)) / k ** 0.75 * np.exp(-fk / (900 + 1600 * vel))
            tau = 3.2 / (1 + fk / 250)
            env = 0.65 * np.exp(-t / (0.35 * tau)) + 0.35 * np.exp(-t / (2.2 * tau))
            y += a * env * np.sin(phase(fk * glide) + rng.uniform(0, TWO_PI))
    return y * (1 - np.exp(-t / 0.0015))


def gen_low_piano_hit():
    rng = np.random.default_rng(23001)
    T = 4.0
    n = int(T * SR)
    t = np.arange(n) / SR
    # palm on the low keys: G#1 A1 A#1 + D#2 E2 (tritone above) + A0 under it
    keys = [(27.50, 0.7, -0.35, 1), (51.91, 0.8, -0.25, 2), (55.00, 1.0, -0.15, 2), (58.27, 0.85, -0.05, 2),
            (77.78, 0.6, 0.15, 3), (82.41, 0.55, 0.25, 3)]
    out = np.zeros((n, 2))
    for f0, g, p, ns in keys:
        out += pan(g * piano_note(rng, f0, T, vel=0.9, B=0.0002 + 0.00003 * f0 / 27.5, nstr=ns), p)
        # hammer + key-bed thump
    thump = norm(lp(rng.standard_normal(n), 300)) * np.exp(-t / 0.025) * (1 - np.exp(-t / 0.001))
    board = norm(resbank(half_sine(0.004, n), [92, 140, 215, 330], [0.06, 0.05, 0.04, 0.03], [1, 0.8, 0.6, 0.4]))
    out = out / pk(out) + st(0.25 * thump + 0.25 * board)
    out = lp(out, 3200, order=2)
    out = np.tanh(1.3 * out / pk(out))
    return reverb(out, rt60=3.2, wet=0.4, dry=1.0, seed=23002, n_out=n, predelay=0.02, damp=3500, lo_mult=1.3)


def gen_radio_static_voice():
    rng = np.random.default_rng(24001)
    T = 3.0
    n = int(T * SR)
    t = np.arange(n) / SR
    # garbled voice: glottal pulses (jittery, wandering pitch) through gliding random formants
    v0, v1 = 0.32, 2.30
    nv = int((v1 - v0) * SR)
    tv = np.arange(nv) / SR
    f0 = 135 * 2 ** ((0.25 * np.sin(TWO_PI * 0.9 * tv + 0.5) + 0.15 * smooth_noise(rng, nv, 6)) / 2)
    pulses = np.zeros(nv)
    tt = 0.0
    while tt < tv[-1]:
        pulses[int(tt * SR)] = rng.uniform(0.7, 1.0)
        tt += 1 / f0[int(tt * SR)] * rng.uniform(0.97, 1.03)
    src = lp(pulses, 3000) + 0.15 * rng.standard_normal(nv)
    nsyl = 11
    tgt = WH_VOWELS[rng.integers(len(WH_VOWELS), size=nsyl + 1)]
    pos = tv / tv[-1] * nsyl
    i = np.minimum(pos.astype(int), nsyl - 1)
    w = 0.5 - 0.5 * np.cos(np.pi * np.clip((pos - i) * 1.6 - 0.3, 0, 1))
    voice = np.zeros(nv)
    for j, (q, g) in enumerate(((5.0, 1.0), (8.0, 0.6), (10.0, 0.35))):
        fc = tgt[i, j] * (1 - w) + tgt[i + 1, j] * w
        voice += g * rmsnorm(tvf(src, fc, "bp", q=q, block=64))
    syl = np.abs(np.sin(np.pi * pos)) ** 0.6 * (0.6 + 0.4 * (smooth_noise(rng, nv, 5) > -0.4))
    voice *= syl
    # scramble into grains: reversed / repeated / dropped bits -> no words survive
    g_out = np.zeros(nv)
    k = 0
    while k < nv:
        L = int(rng.uniform(0.03, 0.09) * SR)
        seg = voice[k:k + L].copy()
        mode = rng.choice(["keep", "rev", "rep", "drop"], p=[0.45, 0.25, 0.2, 0.1])
        if mode == "rev":
            seg = seg[::-1]
        elif mode == "rep":
            q = max(1, len(seg) // 3)
            seg = np.tile(seg[:q], 3)[:len(seg)]
        elif mode == "drop":
            seg *= 0.05
        g_out[k:k + len(seg)] += fades(seg, 0.002, 0.002)
        k += L
    vb = np.zeros(n)
    vb[int(v0 * SR):int(v0 * SR) + nv] = g_out / pk(g_out)
    # through a bad radio: phone band, sample-and-hold to ~7 kHz, coarse quantisation, overdrive
    vb = bp(vb, 350, 3200, order=3)
    hold = 7
    vb = np.repeat(vb[::hold], hold)[:n]
    vb = np.round(vb / pk(vb) * 24) / 24
    vb = np.tanh(2.0 * vb)
    fadev = 1 - 0.6 * (smooth_noise(rng, n, 7) > 0.35)            # signal strength drops
    vb = lp(vb * fadev, 3400, order=3)
    # static: hiss + crackle all through, bursts at squelch open / close, faint heterodyne whistle
    hiss = bp(rng.standard_normal(n), 300, 6500) * (0.55 + 0.45 * smooth_noise(rng, n, 9))
    stat = np.zeros(n)
    place(stat, fades(static_texture(rng, 0.22), 0.002, 0.03), 0.0)
    place(stat, fades(static_texture(rng, 0.3), 0.01, 0.002), 2.42)
    whistle = np.sin(phase(1450 + 60 * smooth_noise(rng, n, 0.7))) * 0.04
    crk = crackles(rng, n, 0.0, 2.72, 240, 1.0, 900, 9000)
    body = 0.055 * hiss / np.std(hiss) + 0.9 * vb + whistle + 0.6 * crk / pk(crk)
    body *= ramp(t, 0.06, 0.08) * (1 - ramp(t, 2.42, 0.02))
    out = 0.8 * stat / pk(stat) + body
    click = np.zeros(n)
    click[int(2.72 * SR)] = 1.0
    click = bp(click, 300, 4000)
    out += 0.5 * click / pk(click)                                   # squelch closes
    return hp(out, 200)


# --------------------------------------------------------------------------
# catalogue: name, generator, target true-peak dBFS, fade in s, fade out s, HP Hz, loop?, description
# --------------------------------------------------------------------------
SPECS = [
    ("drone_bed", gen_drone_bed, -18.0, 0.008, 0.008, 18, True,
     "100 s dark bed: detuned E1/B1/E2 drones (41-82 Hz, slow beating) + dissonant swells, slow LP sweep, "
     "rumble, soft air/wind, distant metal groans at ~16/38/61/83 s. Loop-crossfaded; sits under VO."),
    ("tension_riser_4s", gen_tension_riser_4s, -2.0, 0.02, 0.004, 25, False,
     "4 s dissonant saw cluster rising 2 octaves + noise swell + accelerating tremolo + screech; hard stop."),
    ("tension_riser_8s", gen_tension_riser_8s, -2.0, 0.02, 0.004, 25, False,
     "8 s version of the riser; hard stop at the end so a hit can land on the cut."),
    ("impact_boom", gen_impact_boom, -1.0, 0.001, 0.4, 16, False,
     "Cinematic sub drop 120->30 Hz + noise crack + punch, saturated harmonics, 3.4 s hall tail."),
    ("impact_hit_short", gen_impact_hit_short, -1.0, 0.001, 0.3, 18, False,
     "Dark distorted 'braam' (detuned 55 Hz saw cluster, closing filter) + sub hit, ~2 s."),
    ("whoosh", gen_whoosh, -4.0, 0.005, 0.03, 30, False,
     "Fast resonant filtered-noise swoosh, pans L->R, peak at 0.40 s; scene transition."),
    ("whoosh_reverse", gen_whoosh_reverse, -3.0, 0.02, 0.003, 30, False,
     "Reverse cymbal / reverb suck-in swelling to a peak in the last few ms."),
    ("knock_single", gen_knock_single, -3.0, 0.002, 0.05, 30, False,
     "One knuckle knock on a wooden apartment door (90-180 Hz panel modes + click), short room."),
    ("knock_triple", gen_knock_triple, -3.0, 0.002, 0.05, 30, False,
     "Three knocks, human timing (gaps 0.43 / 0.39 s), short room."),
    ("knock_heavy", gen_knock_heavy, -1.5, 0.002, 0.08, 25, False,
     "Two slow heavy fist knocks (1.25 s apart) with panel boom and frame rattle."),
    ("phone_vibrate", gen_phone_vibrate, -11.0, 0.002, 0.05, 40, False,
     "Phone buzzing on a wooden nightstand: two 0.4 s bursts, ~200 Hz motor + rattle."),
    ("phone_ping", gen_phone_ping, -12.0, 0.002, 0.06, 80, False,
     "Soft two-note notification (A5 -> E6), bell-ish, generic (not an OS sound)."),
    ("heartbeat_loop", gen_heartbeat_loop, -4.0, 0.005, 0.005, 20, True,
     "Muffled lub-dub heartbeat, 67.5 bpm (9 beats in 8 s) - loops seamlessly."),
    ("heartbeat_fast", gen_heartbeat_fast, -3.0, 0.005, 0.005, 20, True,
     "Fast heartbeat, 120 bpm (12 beats in 6 s) - loops seamlessly."),
    ("static_burst", gen_static_burst, -7.0, 0.002, 0.02, 0, False,
     "0.5 s glitch: static, bitcrush, sample-rate reduction, stutters, tonal squeals, crackle."),
    ("static_long", gen_static_long, -8.0, 0.002, 0.05, 0, False,
     "2.5 s static that fades out with increasing dropouts."),
    ("footsteps_approach", gen_footsteps_approach, -5.0, 0.002, 0.3, 30, False,
     "Six slow hard-heeled steps approaching in a stairwell (louder, drier, brighter), stop at ~4.5 s."),
    ("door_handle", gen_door_handle, -6.0, 0.002, 0.08, 40, False,
     "Handle slowly pushed down (creak), hits stop, rattles against lock, springs back."),
    ("light_click", gen_light_click, -8.0, 0.002, 0.05, 60, False,
     "Rocker light switch click (double snap), small room."),
    ("lamp_buzz", gen_lamp_buzz, -16.0, 0.002, 0.08, 30, False,
     "Street lamp striking on: relay, flicker + arc crackles, then steady 50 Hz-grid hum (100 Hz + harmonics)."),
    ("drip", gen_drip, -8.0, 0.002, 0.1, 80, False,
     "Single water drop (rising bubble chirp) in a tiled bathroom, bright 1.3 s reverb."),
    ("camera_shutter", gen_camera_shutter, -8.0, 0.002, 0.05, 80, False,
     "Phone camera shutter 'ka-chick' (two mechanical clicks 68 ms apart)."),
    ("tinnitus_ring", gen_tinnitus_ring, -26.0, 0.005, 0.1, 1000, False,
     "Thin ~8 kHz ring with slight beating, quick swell then slow fade over 4 s (shock moments)."),
    ("breath_whisper", gen_breath_whisper, -10.0, 0.01, 0.05, 60, False,
     "Close, shaky formant-filtered exhale with faint vocal fry at the end; panned slightly left."),
    ("sub_pulse", gen_sub_pulse, -6.0, 0.005, 0.005, 16, True,
     "2 s sub throb (54->40 Hz, two pulses at 60 bpm) with harmonic layer; loops seamlessly."),
]

# ATMOSPHERE layers: name, generator, target true-peak dBFS, fade in s, fade out s, HP Hz,
# loop start search window (s, relative to the buffer start; None = not a loop), description.
# Loops get no edge fades: they are periodic by construction and start on a near-silent sample.
ATMOS_SPECS = [
    ("music_box_lullaby", gen_music_box_lullaby, -16.0, 0, 0, 90, (-0.3, 0.2),
     "48 s loop: detuned, slightly broken music box, original sad A-minor lullaby (3/4, 60 bpm, 16 bars), "
     "wow/flutter, late/flat pins + one dead tooth, dark 3.6 s reverb, high-cut."),
    ("music_box_slow_detuned", gen_music_box_slow_detuned, -16.0, 0.01, 2.0, 70, None,
     "30 s finale: same lullaby at 70 % speed, ~6 st down; spring runs out from ~18 s (tempo + pitch sag), "
     "last pin barely catches, 5.5 s dark reverb."),
    ("house_ambience", gen_house_ambience, -24.0, 0, 0, 18, (0.0, 90.0),
     "90 s loop: night apartment room tone - rumble, soft air, distant fridge hum (50/100 Hz), "
     "9 sparse wood creaks / pipe ticks at irregular times, 7.5-13 s apart, 4-13 LU over the room tone."),
    ("whisper_texture", gen_whisper_texture, -22.0, 0, 0, 120, (0.0, 20.0),
     "20 s loop: 6 unintelligible whisperers (formant noise pseudo-syllables, some reversed) around the "
     "stereo field + a mirrored late 'reflection' of one; de-essed, broad -6 dB dip around 2.6 kHz."),
    ("dark_pad_tension", gen_dark_pad_tension, -18.0, 0, 0, 22, (0.0, 60.0),
     "60 s loop: low C/C#/F#/G cluster (minor 2nds + tritone) swelling and receding twice a minute, "
     "filter opens with the swell, faint glassy F#5/G5 above."),
    ("heartbeat_slow_muffled", gen_heartbeat_slow_muffled, -10.0, 0, 0, 20, (-0.12, 0.1),
     "10 s loop: very muffled lub-dub at 54 bpm (exactly 9 beats), heard through the body."),
    ("stinger_violin_screech", gen_stinger_violin_screech, -2.0, 0.001, 0.4, 60, None,
     "2.5 s jump-scare stab: bowed-saw string cluster (tritones + minor 2nds, high D#6-B6 screech sliding up), "
     "bow scratch attack, 2 s reverb tail."),
    ("low_piano_hit", gen_low_piano_hit, -3.0, 0.001, 1.0, 22, None,
     "4 s dark low piano cluster (A0 + G#1-A#1 + D#2/E2), inharmonic stiff-string partials, long decay, hall."),
    ("radio_static_voice", gen_radio_static_voice, -8.0, 0.002, 0.15, 0, None,
     "3 s radio/phone burst: squelch-open static, garbled formant 'voice' (no words) through a bad phone band, "
     "fading signal, squelch-close click."),
]


# --------------------------------------------------------------------------
# finishing, writing, analysis
# --------------------------------------------------------------------------
def true_peak(x):
    up = sps.resample_poly(x, 4, 1, axis=0)
    return max(pk(x), pk(up))


def finalize(x, peak_db, fin, fout, hp_hz, loop):
    x = st(x).astype(np.float64)
    if hp_hz:
        if loop:  # filter circularly so the loop seam stays clean
            pre = min(len(x), 2 * SR)
            x = hp(np.concatenate([x[-pre:], x]), hp_hz)[pre:]
        else:
            x = hp(x, hp_hz)
    x = fades(x, fin, fout)
    return x * (undb(peak_db) / true_peak(x))


def finalize_atmos(x, peak_db, fin, fout, hp_hz, start):
    """finalize() for ATMOS_SPECS. Loops (start = search window): circular HP, rotate to a
    near-silent sample, no edge fades, true peak measured with the wrap-around as context."""
    x = st(x).astype(np.float64)
    if start is None:
        return finalize(x, peak_db, fin, fout, hp_hz, False)
    if hp_hz:
        x = circ(lambda z: hp(z, hp_hz), x)
    x = np.roll(x, -quiet_point(x, int(start[0] * SR), int(start[1] * SR)), axis=0)
    c = min(len(x), SR // 10)
    return x * (undb(peak_db) / true_peak(np.concatenate([x[-c:], x, x[:c]])))


_K1 = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_K2 = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])


def momentary_lufs_max(x):
    """BS.1770 K-weighted loudness, max over 400 ms windows (100 ms hop). 48 kHz only."""
    y = sps.lfilter(*_K2, sps.lfilter(*_K1, x, axis=0), axis=0)
    p = np.sum(y ** 2, axis=1)
    w, h = int(0.4 * SR), int(0.1 * SR)
    if len(p) < w:
        p = np.pad(p, (0, w - len(p)))
    c = np.concatenate([[0.0], np.cumsum(p)])
    starts = np.arange(0, len(p) - w + 1, h)
    ms = (c[starts + w] - c[starts]) / w
    return -0.691 + 10 * np.log10(max(float(np.max(ms)), 1e-12))


def analyze(path):
    info = sf.info(path)
    x, sr = sf.read(path, always_2d=True)
    mono = x.mean(1)
    mag = np.abs(np.fft.rfft(mono))
    f = np.fft.rfftfreq(len(mono), 1 / sr)
    return dict(
        dur=len(x) / sr, sr=sr, ch=info.channels, sub=info.subtype,
        peak=todb(pk(x)), tp=todb(true_peak(x)),
        rms=todb(np.sqrt(np.mean(x ** 2))),
        centroid=float(np.sum(f * mag) / np.sum(mag)),
        pcentroid=float(np.sum(f * mag ** 2) / np.sum(mag ** 2)),
        lufs=momentary_lufs_max(x),
        edge=todb(max(np.max(np.abs(x[:1])), np.max(np.abs(x[-1:])))),
    )


def main(argv):
    os.makedirs(OUT_DIR, exist_ok=True)
    only = [a for a in argv if not a.startswith("--")]
    if "--analyze" not in argv:
        for name, fn, peak_db, fin, fout, hp_hz, loop, _ in SPECS:
            if only and name not in only:
                continue
            t0 = time.time()
            x = finalize(fn(), peak_db, fin, fout, hp_hz, loop)
            sf.write(os.path.join(OUT_DIR, name + ".wav"), x, SR, subtype="PCM_24")
            print(f"rendered {name:20s} {time.time() - t0:6.1f}s", flush=True)
        for name, fn, peak_db, fin, fout, hp_hz, start, _ in ATMOS_SPECS:
            if only and name not in only:
                continue
            t0 = time.time()
            x = finalize_atmos(fn(), peak_db, fin, fout, hp_hz, start)
            sf.write(os.path.join(OUT_DIR, name + ".wav"), x, SR, subtype="PCM_24")
            print(f"rendered {name:20s} {time.time() - t0:6.1f}s", flush=True)

    rows, arows = [], []
    for specs, dst in ((SPECS, rows), (ATMOS_SPECS, arows)):
        for name, *_rest, desc in specs:
            p = os.path.join(OUT_DIR, name + ".wav")
            if os.path.exists(p):
                dst.append((name, desc, analyze(p)))

    hdr = (f"{'file':24s} {'dur s':>6s} {'peak dBFS':>9s} {'TP dBFS':>8s} {'RMS dBFS':>9s} {'centroid Hz':>11s} "
           f"{'pwr-cent Hz':>11s} {'LUFS-M max':>10s} {'edge dB':>8s}")
    print("\n" + hdr + "\n" + "-" * len(hdr))
    for name, _, a in rows + arows:
        assert a["sr"] == SR and a["ch"] == 2 and a["sub"] == "PCM_24", (name, a)
        print(f"{name + '.wav':24s} {a['dur']:6.2f} {a['peak']:9.1f} {a['tp']:8.1f} {a['rms']:9.1f} "
              f"{a['centroid']:11.0f} {a['pcentroid']:11.0f} {a['lufs']:10.1f} {a['edge']:8.0f}")

    lines = [
        "Procedural horror SFX library (analog horror / creepypasta)",
        "All files: 48 kHz, stereo, 24-bit PCM WAV. Synthesised by ../../tools/sfx.py (seeded, reproducible).",
        "Peak = sample peak. Levels are set on 4x-oversampled true peak (TP <= -1 dBFS for every file;",
        "TP is at most 0.3 dB above the listed sample peak).",
        "LUFS-M = max momentary loudness (400 ms) - useful for relative mix levels.",
        "",
        f"{'file':24s} {'dur s':>6s} {'peak dBFS':>9s} {'LUFS-M':>7s}  description",
        "-" * 110,
    ]
    for name, desc, a in rows:
        lines.append(f"{name + '.wav':24s} {a['dur']:6.2f} {a['peak']:9.1f} {a['lufs']:7.1f}  {desc}")
    lines += [
        "",
        "Notes:",
        "- Loopable: drone_bed, heartbeat_loop, heartbeat_fast, sub_pulse (ends join; 5-8 ms micro-fades at the edges).",
        "- Risers end with a 4 ms fade only (hard cut) - butt the hit directly against the end.",
        "- whoosh_reverse peaks ~4-6 ms before its end; align the end with the cut.",
        "- Sub-heavy files (impact_boom, heartbeat_*, sub_pulse, drone_bed) carry saturated harmonics so they",
        "  read on phone speakers, but most of their energy is still below 100 Hz.",
    ]
    if arows:
        lines += [
            "",
            "",
            "ATMOSPHERE layers (English 3-part series: the mom at the door / the mom in the hallway mirror)",
            "Same format (48 kHz / stereo / 24-bit, TP <= -1 dBFS). Beds are meant to sit under the narration:",
            "little energy and nothing rhythmic between 1 and 4 kHz. 'loop' = file tiles seamlessly end-to-start.",
            "",
            f"{'file':26s} {'dur s':>6s} {'peak dBFS':>9s} {'RMS dBFS':>8s} {'LUFS-M':>7s} {'loop':>4s}  description",
            "-" * 118,
        ]
        loops = {name for name, *_r, start, _d in ATMOS_SPECS if start is not None}
        for name, desc, a in arows:
            lines.append(f"{name + '.wav':26s} {a['dur']:6.2f} {a['peak']:9.1f} {a['rms']:8.1f} {a['lufs']:7.1f} "
                         f"{'yes' if name in loops else '-':>4s}  {desc}")
        lines += [
            "",
            "Notes (atmosphere layers):",
            "- Loops are built periodically (wrapped events, circular reverb/filters, phase-closed oscillators)",
            "  and start on a near-silent sample, so they have NO edge fades: np.tile / an editor loop joins",
            "  them without a dip. Fade them in/out in the mix (build.py beds already do).",
            "- The lullaby is an original melody (A minor, 3/4): E D C | B- A | C B A | G#-- | E D C | F- E |",
            "  D C B | A-- | A- G | F E D | E- C | B-- | E D C | F D B | C B G# | A--. The pin at bar 14 beat 2",
            "  is a dead tooth (click only); a few pins are late (60-140 ms) or flat (20-32 cents) on purpose.",
            "- music_box_slow_detuned is not a loop: the last real note lands at ~24 s, the dead pin ~3 s later,",
            "  then reverb; the final 2 s are faded.",
            "- whisper_texture contains no language - formant noise only; some syllables are reversed. By nature",
            "  it carries more 1-4 kHz than the other beds - keep it well under the voice (or let build.py duck it).",
            "- house_ambience events at ~8, 18, 26, 40, 49, 57, 66, 75, 87 s. It is the quietest bed in the set",
            "  (room tone ~ -50 LUFS-M) - raise it rather than compress it, or the creaks jump out.",
        ]
    with open(os.path.join(OUT_DIR, "README.txt"), "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print(f"\nREADME -> {os.path.join(OUT_DIR, 'README.txt')}")


if __name__ == "__main__":
    main(sys.argv[1:])
