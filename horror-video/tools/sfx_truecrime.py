#!/usr/bin/env python3
"""Procedurale SFX für die True-Crime-/Horror-Reihe (1970er-Fälle: Schreibmaschine, Akten, Gericht, Zelle,
Polizeifunk, Telefon, Schnee, Farm bei Nacht ...). Alles synthetisch (numpy/scipy, Moden-Resonatoren,
gefiltertes Rauschen, synthetischer Faltungshall aus sfx.py) - keine Samples, alle Zufälle geseedet.

Format wie tools/sfx.py: 48 kHz / Stereo / 24-bit PCM WAV nach video/sfx (oder env SFX_OUT).

Pegel (damit die üblichen Gains wie bei den alten Dateien funktionieren - Hits -3..-8, Foley -2..-8,
Betten -4..+2): One-Shots werden auf eine Ziel-Lautheit gebracht (max. Momentary-LUFS, 400 ms), die sich an
der vergleichbaren vorhandenen Datei orientiert (impact_boom -7.6, stinger_violin_screech -12.3,
knock_triple -16.0, radio_static_voice -15.8, camera_shutter -26.5 ...); Loops auf eine integrierte Lautheit
wie drone_bed (-35 LUFS-I) / dark_pad_tension (-31.6). Danach wird der True Peak (4x oversampled) auf
höchstens -1.2 dBTP begrenzt.

Loops (8-12 s) werden periodisch gebaut wie die ATMOS-Schichten in sfx.py: zirkulär gefilterte Rauschquellen,
umlaufend platzierte Ereignisse (place_wrap), zirkulärer Hall (reverb_circ), phasengeschlossene Oszillatoren
(loop_phase) und LFOs mit ganzen Zyklen pro Loop. Danach wird auf einen Loop-Startpunkt rotiert
(loop_start: ruhigste Stelle ohne Ereignis-Anfang/-Ende, Sample nahe null). Es gibt deshalb keine
Randblenden und keinen Crossfade-Einbruch: np.tile in build.py setzt die Datei nahtlos aneinander.

Aufruf:  python3 -I tools/sfx_truecrime.py            alles rendern
         python3 -I tools/sfx_truecrime.py gavel ...  nur diese Namen
"""
import os
import sys
import time

import numpy as np
import soundfile as sf
from scipy import signal as sps

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import (SR, OUT_DIR, TWO_PI, undb, todb, st, pk, norm, rmsnorm, phase, pan, ramp, fades,  # noqa: E402
                 place, place_wrap, smooth_noise, colored, lp, hp, bp, tvf, resbank, half_sine, reverb, saw,
                 metal_click, crackles, circ, reverb_circ, loop_lfo, loop_phase, lfq, peq, true_peak, finalize,
                 momentary_lufs_max, _K1, _K2, bowed, heart_thump, DOOR_F, DOOR_TAU, DOOR_G,
                 WH_VOWELS, wood_creak)
from sfx_finale import glottal, formants  # noqa: E402

TP_CEIL = -1.2          # dBTP-Obergrenze für jede Datei


# --------------------------------------------------------------------------
# kleine Helfer
# --------------------------------------------------------------------------
def imp(n, amp=1.0):
    e = np.zeros(n)
    e[0] = amp
    return e


def burst(rng, n, tau, lo=None, hi=None, att=0.0):
    """Abklingendes Rauschen (Anregung / Knack), optional gefiltert."""
    t = np.arange(n) / SR
    y = rng.standard_normal(n) * np.exp(-t / tau)
    if att:
        y = y * (1 - np.exp(-t / att))
    if lo and hi:
        y = bp(y, lo, hi)
    elif lo:
        y = hp(y, lo)
    elif hi:
        y = lp(y, hi)
    return y


def modal(rng, exc, f, tau, g, spread=0.0, gspread=0.0):
    """resbank() mit zufälliger Streuung von Frequenz und Gewicht (jedes Objekt klingt etwas anders)."""
    f = np.asarray(f, float)
    if spread:
        f = f * (1 + rng.uniform(-spread, spread, len(f)))
    g = np.asarray(g, float)
    if gspread:
        g = g * (1 + rng.uniform(-gspread, gspread, len(g)))
    return resbank(exc, f, np.broadcast_to(np.asarray(tau, float), f.shape), g)


def sine_drop(t, f_lo, f_hi, tau_f):
    """Sinus mit exponentiell fallender Frequenz, Phase 0 am Start."""
    f = f_lo + (f_hi - f_lo) * np.exp(-t / tau_f)
    p = phase(f)
    return np.sin(p - p[0])


def poisson_hits(rng, rate, amp=1.0, alpha=2.2, cap=4.0):
    """Impulsfolge mit zeitvariabler Rate (pro s) und schwer verteilten Amplituden (Knistern, Fasern).
    Die Pareto-Spitzen werden bei `cap` gekappt - sonst stehen einzelne Knackse 20 dB über dem Rest
    und klingen wie digitale Klicks."""
    rate = np.asarray(rate, float)
    n = len(rate)
    hit = rng.random(n) < np.clip(rate / SR, 0, 0.5)
    a = np.minimum(rng.pareto(alpha, n) + 0.2, cap)
    return np.where(hit, a, 0.0) * rng.choice([-1.0, 1.0], n) * amp


def wrap_dist(t, t0, T):
    """Zeitabstand zu t0 auf dem Kreis der Länge T (für periodische Hüllkurven in Loops)."""
    return (t - t0 + T / 2) % T - T / 2


def st_rms_max(x, win=0.4):
    """Höchster RMS über win-Sekunden-Fenster (für Ereignis-zu-Raumton-Verhältnisse)."""
    p = np.mean(st(x) ** 2, axis=1)
    w = int(win * SR)
    c = np.concatenate([[0.0], np.cumsum(p)])
    return float(np.sqrt(np.max((c[w:] - c[:-w]) / w)))


def lufs_integrated(x):
    """BS.1770 integrierte Lautheit (Gates -70 LUFS absolut / -10 LU relativ), 48 kHz."""
    y = sps.lfilter(*_K2, sps.lfilter(*_K1, st(x), axis=0), axis=0)
    p = np.sum(y ** 2, axis=1)
    w, h = int(0.4 * SR), int(0.1 * SR)
    if len(p) < w:
        p = np.pad(p, (0, w - len(p)))
    c = np.concatenate([[0.0], np.cumsum(p)])
    s = np.arange(0, len(p) - w + 1, h)
    ms = (c[s + w] - c[s]) / w
    ms = ms[-0.691 + 10 * np.log10(np.maximum(ms, 1e-12)) > -70]
    if not len(ms):
        return -99.0
    rel = -0.691 + 10 * np.log10(np.mean(ms)) - 10
    ms = ms[-0.691 + 10 * np.log10(np.maximum(ms, 1e-12)) > rel]
    return -0.691 + 10 * np.log10(np.mean(ms))


# --------------------------------------------------------------------------
# Schreibmaschine
# --------------------------------------------------------------------------
TW_F = np.array([330, 560, 910, 1270, 1820, 2480, 3350, 4450, 5900], float)       # Blechrahmen / Typenkorb
TW_TAU = np.array([0.022, 0.018, 0.014, 0.011, 0.009, 0.007, 0.005, 0.004, 0.003])
TW_G = np.array([0.45, 0.75, 1.0, 0.9, 0.8, 0.6, 0.45, 0.35, 0.22])


def tw_key(rng, vel=1.0, space=False):
    """Mechanische Schreibmaschine, ein Anschlag: Finger auf der Taste -> Typenhebel fliegt ~20 ms und
    schlägt durch Farbband und Blatt auf die Gummiwalze (scharfes Klacken durch den Blechrahmen) ->
    Schaltklinke rückt den Wagen um ein Zeichen weiter -> Hebel fällt in den Filz zurück."""
    n = int(0.3 * SR)
    out = np.zeros(n)
    tick = modal(rng, burst(rng, n, 0.00015), [2100, 3300, 5100], [0.004, 0.003, 0.002], [1, .7, .4], 0.05)
    place(out, 0.10 * norm(tick), 0.0)
    if space:   # Leertaste: breiter Balken, dumpf, kein Typenhebel - nur die Schaltung
        thud = modal(rng, half_sine(0.0025, n), [170, 300, 520, 860], [0.025, 0.02, 0.014, 0.01],
                     [1, .8, .5, .3], 0.03)
        place(out, 0.5 * vel * norm(thud), 0.004)
        place(out, 0.4 * vel * metal_click(rng, ring=0.3, dur=0.06), 0.012)
        return fades(out, 0, 0.05)
    d = rng.uniform(0.016, 0.024)
    e = half_sine(rng.uniform(0.00025, 0.0004), n)
    body = norm(modal(rng, e, TW_F, TW_TAU, TW_G, 0.03, 0.25))
    crack = norm(burst(rng, n, 0.0005, lo=2500))
    platen = norm(modal(rng, half_sine(0.0012, n), [135, 225, 380], [0.014, 0.01, 0.007], [1, .6, .35]))
    place(out, vel * (body + 0.55 * crack + 0.28 * platen), d)
    place(out, 0.25 * vel * metal_click(rng, ring=0.25, dur=0.06), d + rng.uniform(0.010, 0.016))
    back = norm(modal(rng, half_sine(0.0015, n), [420, 780, 1300], [0.01, 0.008, 0.006], [1, .7, .4]))
    place(out, 0.07 * vel * back, d + rng.uniform(0.06, 0.09))
    return fades(out, 0, 0.05)


def bell(rng, f0, dur, partials, beat=(0.5, 0.9)):
    """Glocke: Moden (Verhältnis, Amplitude, tau s), jede als leicht aufgespaltene Dublette (Schwebung).
    beat = Gewicht der zweiten Dublettenhälfte: groß bei Kirchenglocken (Wummern), klein bei Klingeln."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for r, a, tau in partials:
        f = f0 * r
        if f > 0.45 * SR:
            continue
        split = rng.uniform(0.3, 1.5) * np.sqrt(f / 1000)
        for s, w in ((-0.5, 1.0), (0.5, rng.uniform(*beat))):
            y += a * w * np.sin(TWO_PI * (f + s * split) * t + rng.uniform(0, TWO_PI)) * np.exp(-t / tau)
    return y * (1 - np.exp(-t / 0.0004))


TYPE_BELL = ((1.0, 1.0, 0.6), (2.42, 0.38, 0.25), (2.95, 0.22, 0.2), (4.16, 0.12, 0.1), (5.6, 0.06, 0.06))


def type_bell_ding(rng, dur=1.4, f0=2180.0):
    """Randglocke der Schreibmaschine: kleine Schalenglocke, vom Hämmerchen angeschlagen."""
    n = int(dur * SR)
    y = norm(bell(rng, f0 * rng.uniform(0.99, 1.01), dur, TYPE_BELL, beat=(0.08, 0.2)))
    hammer = norm(modal(rng, burst(rng, n, 0.0002), [3900, 6100], [0.003, 0.002], [1, .6]))
    return fades(y + 0.18 * hammer, 0, 0.1)


def carriage_return(rng, travel=0.32):
    """Wagenrücklauf: Zeilenschalthebel (2 Rastklicks), Wagen saust zurück (Klinke ratscht immer schneller
    über die Zahnstange - das "Zzzip", Reibung und Rumpeln der Laufschiene), harter Anschlag am Randsteller."""
    T = travel + 0.45
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for t0, g in ((0.0, 0.5), (0.03, 0.4)):
        place(out, g * metal_click(rng, ring=0.6, dur=0.12), t0)
        place(out, 0.2 * g * norm(modal(rng, half_sine(0.001, n), [260, 450, 700], [0.015, 0.01, 0.008],
                                        [1, .7, .5])), t0)
    t1 = 0.035
    u = np.clip((t - t1) / travel, 0, 1)
    speed = (1 - np.exp(-u / 0.12)) * ((t >= t1) & (t < t1 + travel))
    e = np.zeros(n)
    tt = t1
    while tt < t1 + travel:
        sp = 1 - np.exp(-(tt - t1) / travel / 0.12)
        e[int(tt * SR)] += (0.5 + 0.5 * sp) * rng.uniform(0.6, 1.0)
        tt += 1.0 / (45 + 230 * sp) * rng.uniform(0.9, 1.1)
    zipper = norm(modal(rng, e, [2350, 3500, 4750, 6200], [0.003, 0.0025, 0.002, 0.0015], [1, .8, .6, .4], 0.02))
    fric = norm(bp(rng.standard_normal(n), 700, 3200)) * speed * (0.7 + 0.3 * smooth_noise(rng, n, 60))
    rum = norm(lp(rng.standard_normal(n), 320)) * speed
    out += 0.55 * zipper + 0.12 * fric + 0.22 * rum
    ts = t1 + travel
    stop = norm(modal(rng, half_sine(0.0022, n), [150, 240, 390, 610, 940, 1450],
                      [0.05, 0.04, 0.03, 0.022, 0.016, 0.01], [0.8, 1, .9, .7, .5, .3]))
    place(out, stop, ts)
    place(out, 0.6 * metal_click(rng, ring=1.2, dur=0.3), ts + 0.002)
    return fades(out, 0, 0.1)


def gen_typewriter_burst():
    rng = np.random.default_rng(31001)
    T = 2.0
    n = int(T * SR)
    out = np.zeros((n, 2))
    tt, keys = 0.03, []
    while tt < 0.98:                                   # Wörter aus 2-6 Zeichen, Leertaste, mal kurzes Zögern
        for _ in range(int(rng.integers(2, 7))):
            if tt > 1.03:
                break
            keys.append((tt, False))
            tt += float(np.clip(rng.lognormal(np.log(0.088), 0.3), 0.05, 0.19))
        keys.append((tt, True))
        tt += float(np.clip(rng.lognormal(np.log(0.105), 0.3), 0.065, 0.22))
        if rng.uniform() < 0.25:
            tt += rng.uniform(0.05, 0.12)
    keys = [(k, s) for k, s in keys if k < 1.06]
    keys += [(1.14, False), (1.245, False), (1.335, False)]
    for k, (t0, space) in enumerate(keys):
        place(out, pan(tw_key(rng, rng.uniform(0.72, 1.0), space), rng.uniform(-0.1, 0.1)), t0)
    place(out, pan(type_bell_ding(rng, 0.9), 0.25), 1.14 + 0.034, 0.16)      # Randglocke beim drittletzten Zeichen
    cr = carriage_return(rng, 0.30)
    m = len(cr)
    place(out, pan(cr, np.linspace(0.35, -0.3, m)), 1.46, 0.8)              # Wagen läuft von rechts nach links
    return reverb(out, rt60=0.45, wet=0.14, dry=1.0, seed=31002, n_out=n, predelay=0.005, damp=7000)


def gen_typewriter_key():
    rng = np.random.default_rng(31101)
    n = int(0.45 * SR)
    out = np.zeros(n)
    place(out, tw_key(rng, 1.0), 0.02)
    return reverb(out, rt60=0.45, wet=0.14, dry=1.0, seed=31002, n_out=n, predelay=0.005, damp=7000)


def gen_type_bell():
    rng = np.random.default_rng(31201)
    n = int(1.5 * SR)
    out = np.zeros(n)
    place(out, type_bell_ding(rng, 1.45), 0.02)
    return reverb(out, rt60=0.5, wet=0.15, dry=1.0, seed=31002, n_out=n, predelay=0.005, damp=8000)


# --------------------------------------------------------------------------
# Papier, Kuvert, Stempel
# --------------------------------------------------------------------------
def crinkle(rng, rate, env, bands=((1800, 7500, 1.0), (900, 2600, 0.55), (4500, 11000, 0.45))):
    """Papierknistern: Poisson-Knackse (Rate pro s) mit schwer verteilten Amplituden durch kurze Bandpässe."""
    a = poisson_hits(rng, rate, env)
    return sum(g * bp(a, lo, hi, order=2) for lo, hi, g in bands)


def gen_paper_rustle():
    rng = np.random.default_rng(32001)
    T = 0.8
    n = int(T * SR)
    t = np.arange(n) / SR
    env = (0.9 * np.exp(-((t - 0.2) / 0.09) ** 2) + 0.65 * np.exp(-((t - 0.5) / 0.11) ** 2)
           + 0.15 * np.exp(-((t - 0.68) / 0.05) ** 2)) * ramp(t, 0.01, 0.03)
    chans = []
    for _ in range(2):
        cr = crinkle(rng, 2400 * env, env ** 0.5)
        fric = bp(rng.standard_normal(n), 1500, 9000) * env ** 1.3 * (0.6 + 0.4 * smooth_noise(rng, n, 35))
        flap = lp(rng.standard_normal(n), 380) * env ** 2
        chans.append(norm(cr) + 0.35 * norm(fric) + 0.25 * norm(flap))
    out = np.stack([chans[0] + 0.5 * chans[1], chans[1] + 0.5 * chans[0]], 1)
    return reverb(out, rt60=0.35, wet=0.1, dry=1.0, seed=32002, n_out=n, damp=8000)


def gen_envelope_tear():
    rng = np.random.default_rng(33001)
    T = 0.7
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    place(out, 0.6 * norm(burst(rng, n, 0.0012, 900, 6000)), 0.03)        # Daumen sticht ins Kuvert
    place(out, 0.25 * norm(crinkle(rng, np.full(int(0.04 * SR), 600.0), 1.0)), 0.035)
    t0, t1 = 0.09, 0.50                                                    # Reißen: Faserbrüche, ruckweise
    u = np.clip((t - t0) / (t1 - t0), 0, 1)
    rate = (350 + 2250 * u ** 0.7) * ((t >= t0) & (t < t1))
    jerk = 0.45 + 0.55 * np.clip(0.5 + 0.8 * smooth_noise(rng, n, 22), 0, 1)
    env = ramp(t, t0, 0.04) * (1 - ramp(t, t1 - 0.03, 0.03)) * (0.7 + 0.3 * u) * jerk
    a = poisson_hits(rng, rate, env, alpha=2.0)
    fib = (bp(a, 1500, 8000) + 0.7 * bp(a, 600, 2000)
           + 0.4 * resbank(a, [1250, 2100, 3300], [0.0015, 0.0012, 0.001], [1, .8, .6]))
    rasp = bp(rng.standard_normal(n), 900, 5000) * env ** 1.5
    body = lp(a, 900)                                                      # dickes Kuvertpapier: etwas Körper
    out += norm(fib) + 0.25 * norm(rasp) + 0.2 * norm(body)
    place(out, 0.7 * norm(burst(rng, n, 0.002, 800, 7000)), t1)           # letzter Riss
    k = int(0.06 * SR)
    place(out, 0.35 * norm(lp(rng.standard_normal(k), 500) * np.hanning(k)), t1 + 0.01)   # Lasche flattert
    return reverb(pan(out, 0.12), rt60=0.35, wet=0.12, dry=1.0, seed=33002, n_out=n, damp=8000)


def gen_rubber_stamp():
    rng = np.random.default_rng(34001)
    T = 0.8
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    desk = modal(rng, half_sine(0.0035, n), [82, 128, 186, 262, 370, 520, 740],
                 [0.07, 0.055, 0.045, 0.035, 0.025, 0.018, 0.012], [0.8, 1, .9, .75, .55, .4, .25], 0.03, 0.2)
    thump = np.sin(TWO_PI * 68 * t) * np.exp(-t / 0.045) * (1 - np.exp(-t / 0.002))
    handle = modal(rng, half_sine(0.001, n), [880, 1420, 2250], [0.008, 0.006, 0.004], [1, .7, .4])
    thud = lp(norm(desk) + 0.5 * thump + 0.15 * norm(handle), 2600)        # Gummi dämpft die Höhen
    slap = burst(rng, n, 0.0035, 900, 6000, att=0.0003)                     # Blatt wird flach gepresst
    place(out, thud, 0.03)
    place(out, 0.45 * norm(slap), 0.031)
    place(out, 0.09 * norm(burst(rng, n, 0.002, 1500, 4500)), 0.36)         # Gummi löst sich ("tck")
    k = int(0.04 * SR)
    place(out, 0.05 * norm(lp(rng.standard_normal(k) * np.hanning(k), 600)), 0.365)
    return reverb(out, rt60=0.5, wet=0.2, dry=1.0, seed=34002, n_out=n, predelay=0.006, damp=6000)


# --------------------------------------------------------------------------
# Gericht, Zelle
# --------------------------------------------------------------------------
def gavel_knock(rng):
    """Hartholz-Hammer auf Schallblock: heller Holz-"Tock" (Blockmoden 0.6-4 kHz) + Richtertisch."""
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    e = half_sine(rng.uniform(0.0004, 0.0006), n)
    block = modal(rng, e, [640, 1010, 1480, 2150, 2950, 4100], [0.022, 0.018, 0.014, 0.01, 0.007, 0.005],
                  [0.9, 1.0, 0.75, 0.55, 0.4, 0.25], 0.02, 0.15)
    bench = modal(rng, half_sine(0.0012, n), [118, 172, 245, 340, 470], [0.05, 0.045, 0.035, 0.025, 0.018],
                  [0.8, 1.0, 0.8, 0.55, 0.35], 0.02, 0.15)
    head = modal(rng, e, [1750, 2600, 3900], [0.006, 0.005, 0.004], [1, .6, .4])
    click = burst(rng, n, 0.0004, lo=2000)
    y = norm(block) + 0.7 * norm(bench) + 0.25 * norm(head) + 0.3 * norm(click)
    y += 0.25 * np.sin(TWO_PI * 95 * t) * np.exp(-t / 0.05) * (1 - np.exp(-t / 0.002))
    return fades(np.tanh(2.0 * norm(y)) / np.tanh(2.0), 0, 0.15)


def gen_gavel():
    rng = np.random.default_rng(35001)
    T = 2.8
    n = int(T * SR)
    out = np.zeros(n)
    place(out, gavel_knock(rng), 0.05, 0.95)
    place(out, gavel_knock(rng), 0.47, 1.0)
    return reverb(out, rt60=1.8, wet=0.4, dry=1.0, seed=35002, n_out=n, predelay=0.02, er_span=0.06,
                  n_er=18, damp=6000)


def gen_cell_door_slam():
    rng = np.random.default_rng(36001)
    T = 6.0
    n = int(T * SR)
    t = np.arange(n) / SR
    th = 0.12                                       # Anschlag bei 0.12 s
    out = np.zeros(n)
    pre = (t < th) * ramp(t, 0.0, 0.1)              # Rollen der Schiebetür kurz vor dem Anschlag
    out += 0.10 * norm(lp(rng.standard_normal(n), 380)) * pre
    out += 0.03 * norm(bp(rng.standard_normal(n), 1500, 4000)) * pre * (0.5 + 0.5 * np.abs(smooth_noise(rng, n, 40)))
    m = n - int(th * SR)
    ts = t[:m]
    e = half_sine(0.003, m) + 0.3 * burst(rng, m, 0.002)
    frame = modal(rng, e, [46, 69, 95, 131, 178], [0.3, 0.24, 0.18, 0.14, 0.1], [1, .9, .8, .6, .4], 0.02)
    bars = np.zeros(m)
    beam = np.array([1, 2.756, 5.404, 8.933, 13.344, 18.64])   # frei-freie Biegemoden eines Stabs
    for _ in range(6):     # Grundmode strahlt bei fest eingespannten Stäben kaum ab -> leise, kürzer
        f1 = rng.uniform(150, 260)
        r = beam * (1 + rng.uniform(-.01, .01, 6))
        tau = np.array([1.0, 1.6, 1.1, 0.75, 0.5, 0.3]) * rng.uniform(0.7, 1.1)
        g = np.array([0.12, 1.0, 0.85, 0.6, 0.4, 0.22])
        ok = f1 * r < 15000
        bars += rng.uniform(0.6, 1.0) * modal(rng, e, f1 * r[ok], tau[ok], g[ok])
    fm = np.exp(rng.uniform(np.log(300), np.log(4500), 28))       # Türblech: dichte inharmonische Moden
    plate = modal(rng, e, fm, rng.uniform(0.15, 0.9, 28) * (600 / fm) ** 0.3, rng.uniform(0.3, 1.0, 28))
    sub = sine_drop(ts, 36, 66, 0.07) * np.exp(-ts / 0.35) * (1 - np.exp(-ts / 0.002))
    hit = norm(frame) + 0.55 * norm(bars) + 0.5 * norm(plate) + 0.6 * sub
    place(out, hit, th)
    place(out, 0.6 * metal_click(rng, ring=1.6, dur=0.6), th + 0.012)      # Riegel schnappt
    place(out, 0.35 * metal_click(rng, ring=1.0, dur=0.4), th + 0.06)
    tk = th + 0.09
    for _ in range(4):                                                       # Gitter klappert nach
        place(out, rng.uniform(.08, .18) * metal_click(rng, ring=.6, dur=.25), tk)
        tk += rng.uniform(.03, .06)
    dry = np.tanh(2.4 * out / pk(out))
    wet = reverb(dry, rt60=4.5, wet=1.0, dry=0.0, seed=36002, n_out=n, predelay=0.035, er_span=0.08, n_er=20,
                 damp=5000, lo_mult=1.1, hi_mult=0.6)
    echo = np.zeros((n, 2))                                                  # Flatterecho im Betonflur
    for k, (d, g) in enumerate(((0.085, 0.22), (0.17, 0.13), (0.255, 0.08))):
        place(echo, pan(lp(dry, 3000 - 600 * k), 0.4 * (-1) ** k), th * 0 + d, g)
    return st(dry) + 0.55 * wet + echo


# --------------------------------------------------------------------------
# Kamera, Floppy, Röhrenfernseher
# --------------------------------------------------------------------------
def gen_camera_flash_old():
    rng = np.random.default_rng(37001)
    T = 1.4
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    place(out, 0.25 * metal_click(rng, ring=0.3, dur=0.08), 0.02)        # Auslöser am Pulverhalter
    t0 = 0.06
    m = n - int(t0 * SR)
    ts = t[:m]
    env = (1 - np.exp(-ts / 0.004)) * np.exp(-ts / 0.11)
    whoosh = tvf(rng.standard_normal(m), 350 + 4200 * np.exp(-ts / 0.06), "lp", q=0.8, stages=2) * env
    body = bp(rng.standard_normal(m), 150, 900) * (1 - np.exp(-ts / 0.006)) * np.exp(-ts / 0.16)
    thump = sine_drop(ts, 42, 80, 0.04) * (1 - np.exp(-ts / 0.002)) * np.exp(-ts / 0.09)
    pop = burst(rng, m, 0.0015, 600, 8000)
    place(out, norm(whoosh) + 0.6 * norm(body) + 0.8 * thump + 0.4 * norm(pop), t0)   # "Fwump"
    cr = np.zeros(n)                                                          # glühende Partikel knistern
    for _ in range(140):
        dt = rng.exponential(0.16)
        i = int((t0 + 0.01 + dt) * SR)
        if i < n - 1:
            cr[i] += rng.uniform(-1, 1) * np.exp(-dt / 0.3)
    cr = bp(cr, 1500, 9000) + 0.5 * resbank(cr, [2300, 3900, 5600], [0.002, .0015, .001], [1, .7, .5])
    sizzle = hp(rng.standard_normal(n), 3500) * ramp(t, t0, 0.01) * np.exp(-np.maximum(t - t0, 0) / 0.25)
    out += 0.35 * norm(cr) + 0.06 * norm(sizzle)
    return reverb(out, rt60=0.9, wet=0.25, dry=1.0, seed=37002, n_out=n, predelay=0.008, damp=6000)


def gen_camera_shutter_old():
    rng = np.random.default_rng(38001)
    T = 1.0
    n = int(T * SR)
    out = np.zeros(n)

    def thunk(g):
        y = modal(rng, half_sine(0.0012, n), [380, 720, 1150, 1900, 2800], [0.02, 0.015, 0.012, 0.008, 0.006],
                  [1, .9, .7, .5, .35], 0.03, 0.2)
        return g * (norm(y) + 0.35 * norm(burst(rng, n, 0.0005, lo=2500)))

    t0 = 0.03
    place(out, thunk(1.0), t0)                                    # Spiegel klappt hoch
    place(out, 0.55 * metal_click(rng, ring=0.35, dur=0.06), t0 + 0.006)    # 1. Verschlussvorhang
    place(out, 0.5 * metal_click(rng, ring=0.35, dur=0.06), t0 + 0.039)     # 2. Vorhang (1/30 s)
    place(out, thunk(0.7), t0 + 0.058)                            # Spiegel zurück
    a0, a1 = 0.34, 0.64                                           # Filmtransporthebel: Ratsche + Reibung
    tt = a0
    while tt < a1:
        u = (tt - a0) / (a1 - a0)
        place(out, (0.16 + 0.08 * np.sin(np.pi * u)) * metal_click(rng, ring=0.2, dur=0.03), tt)
        tt += 1 / rng.uniform(32, 42)
    t = np.arange(n) / SR
    fr = bp(rng.standard_normal(n), 900, 4000) * np.clip(np.sin(np.pi * (t - a0) / (a1 - a0)), 0, None) \
        * ((t > a0) & (t < a1))
    out += 0.05 * norm(fr)
    place(out, 0.45 * metal_click(rng, ring=0.5, dur=0.1) + 0.3 * thunk(0.4)[:int(0.1 * SR)], a1)   # Anschlag
    place(out, 0.25 * metal_click(rng, ring=0.3, dur=0.06), a1 + 0.075)     # Hebel federt zurück
    return reverb(out, rt60=0.35, wet=0.12, dry=1.0, seed=38002, n_out=n, damp=8000)


def gen_floppy_insert():
    rng = np.random.default_rng(39001)
    T = 1.5
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    s0, s1 = 0.02, 0.27                                           # Diskette gleitet in den Schacht
    on = (t >= s0) & (t < s1)
    env = np.sin(np.pi * np.clip((t - s0) / (s1 - s0), 0, 1)) ** 0.5 * on * (0.75 + 0.25 * smooth_noise(rng, n, 45))
    fr = rng.standard_normal(n) * env
    out += 0.16 * norm(bp(fr, 900, 5500)) + 0.08 * norm(resbank(fr, [1150, 1900, 3100], [0.006, 0.005, 0.004], [1, .8, .5]))
    k = int(0.05 * SR)
    place(out, 0.06 * norm(bp(rng.standard_normal(k), 3000, 9000) * np.hanning(k)), 0.16)   # Metallschieber
    click = norm(modal(rng, burst(rng, n, 0.0002), [1500, 2400, 3700, 5200], [0.005, 0.004, 0.003, 0.002],
                       [1, .8, .6, .4], 0.03))
    chunk = norm(modal(rng, half_sine(0.0018, n), [210, 360, 590, 900], [0.02, 0.016, 0.012, 0.008], [1, .8, .6, .4]))
    place(out, 0.8 * click + 0.6 * chunk, 0.285)                 # rastet ein, fällt auf die Spindel
    place(out, 0.4 * norm(modal(rng, burst(rng, n, 0.0002), [1900, 3100, 4400], [0.004, 0.003, 0.002],
                                [1, .7, .4], 0.05)), 0.315)      # Auswurfknopf springt heraus
    m0, m1 = 0.45, 1.45                                           # Spindelmotor (300 U/min) läuft
    wenv = ramp(t, m0, 0.12) * (1 - ramp(t, m1 - 0.1, 0.1))
    rot = 5.0 * ramp(t, m0, 0.15)
    rub = bp(rng.standard_normal(n), 400, 3500) * (0.75 + 0.25 * np.sin(phase(rot)))   # Scheibe am Vlies
    fm = 60 + 90 * ramp(t, m0, 0.2)
    hum = sum(np.sin(k * phase(fm)) / k for k in range(1, 7))
    out += (0.035 * norm(rub) + 0.02 * norm(hum)) * wenv
    place(out, 0.3 * chunk[:int(0.1 * SR)], 0.97)                # Kopfandruck-Magnet ("tschk")

    def step(pol):
        e = imp(int(0.04 * SR), pol)
        y = norm(modal(rng, e, [780, 1350, 2100, 3300], [0.004, 0.0035, 0.003, 0.002], [1, .8, .6, .4], 0.03))
        return y + 0.6 * norm(modal(rng, e, [260, 420], [0.006, 0.005], [1, .7]))

    for ts, cnt, per, g in ((0.55, 22, 0.0055, 0.28), (0.80, 8, 0.006, 0.24), (1.02, 26, 0.004, 0.26),
                            (1.26, 3, 0.05, 0.22)):              # Schrittmotor sucht Spur 0, fährt zur Spur
        for k in range(cnt):
            place(out, g * step(1.0 if k % 2 == 0 else -1.0), ts + k * per * rng.uniform(0.97, 1.03))
    return reverb(pan(out, 0.05), rt60=0.4, wet=0.12, dry=1.0, seed=39002, n_out=n, damp=7000)


def gen_crt_on():
    rng = np.random.default_rng(40001)
    T = 2.2
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    sw = norm(modal(rng, half_sine(0.0012, n), [520, 900, 1450, 2300], [0.012, 0.009, 0.007, 0.005],
                    [1, .8, .6, .4])) + 0.6 * fit_len(metal_click(rng, ring=0.5, dur=0.1), n)
    place(out, 0.5 * sw, 0.02)                                   # Netzschalter
    td = 0.07                                                     # Entmagnetisierung: 60-Hz-Stoß durch die Spule
    m = n - int(td * SR)
    ts = t[:m]
    genv = (1 - np.exp(-ts / 0.004)) * np.exp(-ts / 0.28)
    ph = TWO_PI * 60 * ts
    coil = np.sign(np.sin(ph)) * np.abs(np.sin(ph)) ** 0.35
    mag = np.abs(np.sin(ph)) ** 0.6
    drive = (0.6 * coil + 0.8 * (mag - np.mean(mag))) * genv
    mask = modal(rng, drive, [190, 310, 470, 690, 1020, 1530], [0.12, 0.1, 0.08, 0.06, 0.05, 0.035],
                 [1, .9, .8, .6, .45, .3], 0.03)                 # Lochmaske / Gehäuse schwingen mit ("bwoummm")
    thump = sine_drop(ts, 45, 75, 0.03) * (1 - np.exp(-ts / 0.002)) * np.exp(-ts / 0.08)
    place(out, lp(0.6 * norm(drive) + 0.7 * norm(mask) + 0.5 * thump, 5000), td)
    cr = crackles(rng, n, 0.12, 0.7, 90, 1.0, 1500, 9000) * np.exp(-np.maximum(t - 0.12, 0) / 0.35)
    out += 0.12 * norm(cr)                                        # Hochspannung baut sich auf
    for ts_, g in ((0.22, 0.25), (0.47, 0.18)):
        place(out, g * norm(burst(rng, int(0.02 * SR), 0.001, 1000, 8000)), ts_)
    out += 0.05 * norm(bp(rng.standard_normal(n), 2500, 9000)) * np.exp(-((t - 0.35) / 0.15) ** 2)
    w0, w1 = 0.15, 0.95                                           # Zeilentrafo schwingt an: Pfeifen steigt
    uw = np.clip((t - w0) / (w1 - w0), 0, 1)
    fw = 1900 * (7870 / 1900) ** (uw ** 0.8)
    wenv = ramp(t, w0, 0.25) * (1 - 0.8 * ramp(t, w1, 0.6))     # sinkt nach dem Einschwingen ab
    pw = phase(fw * (1 + 0.002 * smooth_noise(rng, n, 8)))
    out += 0.10 * (np.sin(pw) + 0.15 * np.sin(2 * pw)) * wenv
    out += 0.03 * np.sin(TWO_PI * 15734.26 * t) * ramp(t, 0.7, 0.3)                   # 15.7 kHz Zeilenfrequenz
    hum = (0.5 * np.sin(TWO_PI * 60 * t) + np.sin(TWO_PI * 120 * t) + 0.3 * np.sin(TWO_PI * 180 * t)
           + 0.2 * np.sin(TWO_PI * 240 * t))
    out += 0.05 * hum / pk(hum) * ramp(t, 0.5, 0.8)               # Röhre warm: leises Brummen
    return reverb(out, rt60=0.5, wet=0.12, dry=1.0, seed=40002, n_out=n, damp=7000)


def fit_len(x, n):
    y = np.zeros(n)
    m = min(n, len(x))
    y[:m] = x[:m]
    return y


def gen_tv_static_burst():
    rng = np.random.default_rng(41001)
    T = 0.6
    n = int(T * SR)
    t = np.arange(n) / SR
    a, b = rng.standard_normal(n), rng.standard_normal(n)
    snow = [peq(lp(hp(x, 250), 9500), 5000, 3.0, 0.7) for x in (a + 0.25 * b, b + 0.25 * a)]   # FM-Rauschen
    ph = TWO_PI * 59.94 * t                                       # Bildwechsel-Buzz
    sync = bp((0.5 + 0.5 * np.cos(ph)) ** 60, 150, 3000)
    flut = 1 + 0.2 * smooth_noise(rng, n, 25)
    cr = crackles(rng, n, 0.0, T, 60, 1.0, 1000, 10000)
    out = np.stack([rmsnorm(s) * flut + 0.3 * rmsnorm(sync) + 1.5 * cr / (np.std(cr) + 1e-9) * 0.1 for s in snow], 1)
    out[:, 1] *= 0.97
    return out * ramp(t, 0.0, 0.004)[:, None]


# --------------------------------------------------------------------------
# Telefon, Münzfernsprecher, Auto, Funk, Sirene
# --------------------------------------------------------------------------
def dial_wind(rng, dur):
    """Finger zieht die Wählscheibe zum Fingeranschlag: Klinke ratscht langsam, Reibung, Anschlag."""
    n = int((dur + 0.15) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    tt = 0.0
    while tt < dur:
        place(out, (0.10 + 0.05 * tt / dur) * metal_click(rng, ring=0.2, dur=0.03), tt)
        tt += 1 / rng.uniform(28, 38)
    out += 0.04 * norm(bp(rng.standard_normal(n), 600, 2600)) * (t < dur) * ramp(t, 0, 0.02)
    place(out, 0.4 * norm(modal(rng, half_sine(0.0012, n), [600, 1100, 1900], [0.008, 0.006, 0.004], [1, .7, .4])), dur)
    return out


RINGER = ((1.0, 1.0, 0.25), (2.6, 0.4, 0.1))


def dial_return(rng, pulses, pp=0.1):
    """Rücklauf mit Fliehkraftregler (10 Impulse/s): gleichmäßiges Schnarren, Nummernschalter-Kontakte
    (je ein Klick + leises Mitklingeln der Weckerglocken), Ruheanschlag."""
    dur = (pulses + 1.4) * pp
    n = int((dur + 0.2) * SR)
    t = np.arange(n) / SR
    on = (t < dur) * ramp(t, 0, 0.01)
    pg = phase(172 * (1 + 0.03 * smooth_noise(rng, n, 25)))      # Zahneingriff, nicht ganz gleichmäßig
    gear = sum(np.sin(k * pg + rng.uniform(0, TWO_PI)) / k for k in range(1, 9))
    gov = bp(rng.standard_normal(n), 500, 2800) * (0.6 + 0.4 * np.sin(pg) ** 2)
    out = (0.04 * norm(lp(gear, 2000)) + 0.09 * norm(gov)) * on * (1 + 0.1 * smooth_noise(rng, n, 20))
    for k in range(pulses):
        tk = 0.07 + k * pp
        place(out, 0.35 * metal_click(rng, ring=0.4, dur=0.06), tk)
        place(out, 0.18 * norm(modal(rng, half_sine(0.001, n), [300, 520], [0.008, 0.006], [1, .6]))[:int(0.05 * SR)], tk)
        place(out, 0.03 * norm(bell(rng, 1350, 0.3, RINGER)), tk + 0.002)
    stop = norm(modal(rng, half_sine(0.0015, n), [380, 650, 1050, 1700, 2600], [0.014, 0.011, 0.009, 0.007, 0.005],
                      [1, .9, .7, .5, .3]))
    place(out, 0.55 * stop + 0.3 * fit_len(metal_click(rng, ring=0.3, dur=0.06), n), dur)
    return out, dur


def gen_phone_rotary_dial():
    rng = np.random.default_rng(42001)
    T = 2.5
    n = int(T * SR)
    out = np.zeros(n)
    tt = 0.05
    for i, d in enumerate((2, 1, 3, 1)):
        wd = (0.07 + 0.022 * (d + 1)) * rng.uniform(0.92, 1.08)
        place(out, dial_wind(rng, wd), tt)
        tt += wd + rng.uniform(0.025, 0.04)                   # Finger lässt los
        r, rd = dial_return(rng, d)
        place(out, r, tt)
        tt += rd + (rng.uniform(0.09, 0.12) if i < 3 else 0)
    assert tt < T - 0.12, tt
    return reverb(pan(out, -0.05), rt60=0.4, wet=0.12, dry=1.0, seed=42002, n_out=n, damp=7000)


def gen_phone_pickup():
    rng = np.random.default_rng(43001)
    T = 0.7
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    out += 0.03 * norm(bp(rng.standard_normal(n), 500, 3000)) * np.exp(-((t - 0.06) / 0.05) ** 2)   # Hand am Hörer
    clack = modal(rng, half_sine(0.0012, n), [420, 690, 1100, 1750, 2600], [0.012, 0.01, 0.008, 0.006, 0.004],
                  [1, .9, .7, .5, .3], 0.03)
    place(out, 0.8 * norm(clack) + 0.2 * norm(burst(rng, n, 0.0004, lo=2500)), 0.02)   # Hörer verlässt die Gabel
    place(out, 0.55 * metal_click(rng, ring=0.5, dur=0.12), 0.036)                     # Gabelumschalter springt hoch
    place(out, 0.35 * metal_click(rng, ring=0.4, dur=0.1), 0.061)
    k = int(0.15 * SR)
    place(out, 0.06 * np.sin(TWO_PI * 910 * t[:k]) * np.exp(-t[:k] / 0.04), 0.036)     # Kontaktfeder
    place(out, 0.05 * norm(bell(rng, 1350, 0.45, RINGER)), 0.05)                         # Wecker klingt leise mit
    return reverb(out, rt60=0.4, wet=0.12, dry=1.0, seed=43002, n_out=n, damp=7000)


COIN_F = [4300, 6900, 9200, 11800]
PAY_BELL = ((1.0, 1.0, 0.45), (2.32, 0.45, 0.25), (2.76, 0.3, 0.2), (4.1, 0.15, 0.11), (5.3, 0.08, 0.07))


def coin_clink(rng, vel=1.0, box=False):
    n = int(0.2 * SR)
    e = imp(n) + 0.5 * burst(rng, n, 0.0002)
    coin = modal(rng, e, COIN_F, [0.03, 0.022, 0.016, 0.012], [1, .8, .6, .4], 0.03, 0.2)
    chute = modal(rng, e, [950, 1550, 2350, 3450] if not box else [380, 620, 980],
                  [0.02, 0.016, 0.012, 0.009] if not box else [0.015, 0.012, 0.009], [1, .9, .7, .5][:3 if box else 4], 0.05)
    y = 0.6 * norm(coin) + norm(chute)
    return fades(vel * (lp(y, 4000) if box else y), 0, 0.05)


def gen_payphone_coin():
    rng = np.random.default_rng(44001)
    T = 1.4
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    k = int(0.05 * SR)                                            # Münze kratzt in den Schlitz
    scr = bp(rng.standard_normal(k), 2500, 8000) * np.hanning(k) * (0.6 + 0.4 * np.sign(np.sin(TWO_PI * 90 * t[:k])))
    place(out, 0.25 * norm(scr), 0.02)
    for t0, v in ((0.075, 0.8), (0.145, 0.55), (0.2, 0.4)):    # rollt durch den Kanal
        place(out, coin_clink(rng, v), t0)
    place(out, 0.5 * norm(bell(rng, 1480, 1.0, PAY_BELL, beat=(0.1, 0.25))), 0.29)   # Zählwerk: Zehner = "ding-ding"
    place(out, 0.45 * norm(bell(rng, 1480, 1.0, PAY_BELL, beat=(0.1, 0.25))), 0.415)
    place(out, 0.6 * norm(modal(rng, half_sine(0.0015, n), [300, 520, 800], [0.03, 0.02, 0.012], [1, .7, .4])), 0.66)
    for k in range(5):                                            # fällt in die Kasse zu anderen Münzen
        place(out, coin_clink(rng, rng.uniform(0.15, 0.35), box=True), 0.665 + k * rng.uniform(0.02, 0.04))
    return reverb(out, rt60=0.35, wet=0.2, dry=1.0, seed=44002, n_out=n, predelay=0.003, er_span=0.01, damp=8000)


def gen_car_door():
    rng = np.random.default_rng(45001)
    T = 1.3
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    t0 = 0.04
    panel = modal(rng, half_sine(0.005, n), [58, 86, 124, 178, 255, 360, 520],
                  [0.1, 0.085, 0.07, 0.055, 0.04, 0.03, 0.02], [0.9, 1.0, 0.9, 0.7, 0.5, 0.35, 0.2], .03, .2)
    seal = lp(rng.standard_normal(n), 300) * (1 - np.exp(-t / 0.003)) * np.exp(-t / 0.025)    # Luft aus der Kabine
    small = modal(rng, half_sine(0.0015, n), [1100, 1700], [0.01, 0.008], [1, .6])
    body = lp(norm(panel) + 0.5 * norm(seal) + 0.15 * norm(small), 3000)
    place(out, np.tanh(2.2 * body) / np.tanh(2.2), t0)                       # schweres Blech: satt, gesättigt
    place(out, 0.18 * metal_click(rng, ring=0.7, dur=0.2), t0 + 0.004)       # Schloss: zwei Rasten
    place(out, 0.14 * metal_click(rng, ring=0.7, dur=0.2), t0 + 0.012)
    place(out, 0.06 * norm(burst(rng, int(0.03 * SR), 0.004, 2000, 6000)), t0 + 0.01)   # Scheibe klirrt im Rahmen
    return reverb(out, rt60=0.9, wet=0.15, dry=1.0, seed=45002, n_out=n, predelay=0.012, er_span=0.08, damp=5000)


def garble(rng, dur, f0c=125.0, rate=5.5):
    """Unverständliche Funkstimme: Glottis-Pulse mit Sprechmelodie durch gleitende Zufallsformanten,
    Silbenhüllkurve, Zisch-Onsets; danach in 30-90-ms-Körner zerhackt (rückwärts / wiederholt / weg)."""
    nv = int(dur * SR)
    tv = np.arange(nv) / SR
    f0 = f0c * 2 ** ((0.3 * np.sin(TWO_PI * 1.1 * tv + rng.uniform(0, TWO_PI)) + 0.2 * smooth_noise(rng, nv, 5)) / 2)
    src = norm(glottal(f0)) + 0.08 * rng.standard_normal(nv)
    nsyl = max(2, int(dur * rate))
    tgt = WH_VOWELS[rng.integers(len(WH_VOWELS), size=nsyl + 1)]
    pos = tv / tv[-1] * nsyl
    i = np.minimum(pos.astype(int), nsyl - 1)
    w = 0.5 - 0.5 * np.cos(np.pi * np.clip((pos - i) * 1.6 - 0.3, 0, 1))
    v = np.zeros(nv)
    for j, (q, g) in enumerate(((5.0, 1.0), (8.0, 0.6), (10.0, 0.35))):
        v += g * rmsnorm(tvf(src, tgt[i, j] * (1 - w) + tgt[i + 1, j] * w, "bp", q=q, block=64))
    syl = np.abs(np.sin(np.pi * pos)) ** 0.5 * (0.55 + 0.45 * (smooth_noise(rng, nv, 4) > -0.5))
    v *= syl
    for s in range(nsyl):
        if rng.uniform() < 0.35:
            m = int(rng.uniform(0.02, 0.045) * SR)
            place(v, 0.6 * rmsnorm(bp(rng.standard_normal(m), 2000, 5000)) * np.hanning(m), s / rate)
    g_out = np.zeros(nv)
    k = 0
    while k < nv:
        L = int(rng.uniform(0.03, 0.09) * SR)
        seg = v[k:k + L].copy()
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
    return g_out / pk(g_out)


def radio_chain(x, rng, hold=6, levels=20, drive=3.0):
    """Schlechter Funk: Sprachband, Sample&Hold, grobe Quantisierung, Übersteuerung, schwankender Empfang."""
    y = bp(x, 380, 2900, order=3)
    n = len(y)
    y = np.repeat(y[::hold], hold)[:n]
    y = np.round(y / pk(y) * levels) / levels
    y = np.tanh(drive * y)
    y *= 1 - 0.45 * (smooth_noise(rng, n, 6) > 0.4)
    return lp(y, 3200, order=3)


def gen_police_radio():
    rng = np.random.default_rng(46001)
    T = 1.5
    n = int(T * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    place(out, 0.5 * norm(bp(imp(int(0.03 * SR)), 200, 2000)), 0.02)       # Sprechtaste ("kerchunk")
    sq = bp(rng.standard_normal(n), 300, 5000)
    open_ = ramp(t, 0.02, 0.004) * (1 - ramp(t, 0.075, 0.02))              # Rauschsperre öffnet
    tail = ramp(t, 1.22, 0.005) * (1 - ramp(t, 1.34, 0.015))               # Rauschfahne beim Loslassen
    bed = (ramp(t, 0.02, 0.004) * (1 - ramp(t, 1.22, 0.01))) * (0.5 + 0.5 * smooth_noise(rng, n, 9) ** 2)
    out += sq / np.std(sq) * (0.32 * open_ + 0.38 * tail + 0.05 * bed)
    v0, v1 = 0.09, 1.2
    vb = np.zeros(n)
    vb[int(v0 * SR):int(v0 * SR) + int((v1 - v0) * SR)] = garble(rng, v1 - v0, 128)
    vb = radio_chain(vb, rng)
    out += 0.9 * vb * ramp(t, v0, 0.01) * (1 - ramp(t, v1 - 0.02, 0.02))
    out += 0.03 * np.sin(phase(1630 + 40 * smooth_noise(rng, n, 0.7))) * (t > 0.02) * (t < 1.22)   # Pfeifen
    crk = crackles(rng, n, 0.02, 1.3, 120, 1.0, 900, 8000)
    out += 0.35 * crk / pk(crk)
    place(out, 0.45 * norm(bp(imp(int(0.03 * SR)), 300, 4000)), 1.355)     # Sperre schließt: Klick
    return lp(hp(out, 200), 3800, order=4)                                   # alles kommt aus dem Funklautsprecher


def gen_siren_wail():
    rng = np.random.default_rng(47001)
    T = 6.0
    n = int(T * SR)
    t = np.arange(n) / SR
    per = 2.9                                                     # ein Auf-und-Ab ~2.9 s
    p = t / per + 0.08
    q = p + 0.28 * np.sin(TWO_PI * p) / TWO_PI                    # langsamer Anstieg, schnelleres Fallen
    w = 0.5 - 0.5 * np.cos(TWO_PI * q)
    f = (640 + 720 * w) * (1 + 0.004 * smooth_noise(rng, n, 0.5))
    ph = phase(f)
    y = np.zeros(n)
    for k in range(1, 14):                                        # elektronischer Wail: eckig, ungerade betont
        lim = np.clip((7000 - k * f) / 1400, 0, 1)
        y += lim * np.sin(k * ph) / k ** (1.1 if k % 2 else 1.6) * (1.0 if k % 2 else 0.35)
    y = lp(hp(y, 380), 2400, order=2)                             # Entfernung: Luft nimmt die Höhen
    y *= (1 + 0.25 * smooth_noise(rng, n, 0.9)) * ramp(t, 0.0, 0.9)
    dry = pan(y, -0.25 + 0.1 * smooth_noise(rng, n, 0.3))
    wet = reverb(y, rt60=2.8, wet=1.0, dry=0.0, seed=47002, n_out=n, predelay=0.05, er_span=0.2, n_er=18,
                 er_level=0.7, damp=3500)
    out = 0.35 * dry + wet
    for d, g, p_ in ((0.21, 0.35, 0.5), (0.37, 0.22, -0.6)):     # Echos von Häuserfronten
        place(out, pan(lp(y, 1800), p_), d, g)
    return out


# --------------------------------------------------------------------------
# Schritte, Holz, Metall, Schlüssel, Tür, Glocke
# --------------------------------------------------------------------------
def snow_step(rng, vel=1.0, squeak=False):
    """Schritt in trockenem Schnee: Ferse presst (dichtes Knirschen brechender Kristalle + dumpfes Setzen),
    Abrollen zur Spitze (zweites, schwächeres Knirschen); bei Kälte ein leises Quietschen."""
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    heel = np.exp(-((t - 0.05) / 0.035) ** 2) * ramp(t, 0.0, 0.015)
    toe = 0.6 * np.exp(-((t - 0.17) / 0.05) ** 2)
    env = heel + toe
    a = poisson_hits(rng, 2200 * env, env ** 0.7, alpha=2.4)
    crunch = (bp(a, 1800, 7000) + 0.8 * bp(a, 600, 2200)
              + 0.5 * resbank(a, np.array([1100, 1900, 3100, 4600]) * rng.uniform(0.9, 1.1, 4),
                              [0.002, 0.0018, 0.0015, 0.001], [1, .8, .6, .4]))
    pack = lp(rng.standard_normal(n), 250) * (heel + 0.4 * toe)
    boot = modal(rng, half_sine(0.008, n), [70, 110, 160], [0.03, 0.025, 0.02], [1, .7, .4])
    y = norm(crunch) + 0.35 * norm(pack) + 0.3 * norm(boot)
    if squeak:
        e = np.zeros(n)
        tt = 0.07
        while tt < 0.15:
            e[int(tt * SR)] = rng.uniform(0.5, 1.0) * np.sin(np.pi * (tt - 0.07) / 0.08)
            tt += 1 / (560 * rng.uniform(0.93, 1.07))
        y += 0.25 * norm(bp(resbank(e, [1150, 1700, 2600], [0.004, 0.003, 0.002], [1, .7, .4]), 800, 3200))
    return fades(vel * y, 0, 0.1)


def gen_footsteps_snow():
    rng = np.random.default_rng(48001)
    T = 3.0
    n = int(T * SR)
    out = np.zeros((n, 2))
    for k in range(6):
        t0 = 0.04 + k * 0.49 + rng.uniform(-0.015, 0.015)
        s = snow_step(rng, rng.uniform(0.85, 1.0), squeak=k in (1, 4))
        place(out, pan(s, 0.15 if k % 2 else -0.15), t0)
    return reverb(out, rt60=0.6, wet=0.05, dry=1.0, seed=48002, n_out=n, damp=5000)


TIMBER_F = np.array([62, 97, 141, 205, 296, 420, 590, 830, 1150], float)
TIMBER_TAU = [0.09, 0.08, 0.065, 0.05, 0.04, 0.03, 0.022, 0.016, 0.011]
TIMBER_G = [0.6, 0.9, 1.0, 0.9, 0.75, 0.6, 0.45, 0.3, 0.2]


def timber_groan(rng, dur, f_lo=28.0, f_span=80.0, scale=1.0):
    """Schwerer alter Balken unter Last: Stick-Slip-Pulse, deren Rate von ~30 Hz (einzeln hörbare Knackser)
    auf ~110 Hz (tonales Stöhnen) steigt und wieder fällt, mit Jitter, in Schüben von 6-10 Hz gegatet
    (das Knarren), durch tiefe Balken-/Bohlenmoden + kurze helle Fasermoden (Biss)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = t / dur
    f0 = (f_lo + f_span * np.sin(np.pi * u) ** 1.2) * (1 + 0.08 * smooth_noise(rng, n, 4))
    gate = 0.15 + 0.85 * np.clip(0.5 + 1.1 * smooth_noise(rng, n, rng.uniform(6, 10)), 0, 1)
    env = np.sin(np.pi * np.clip(u, 0, 1)) ** 0.5
    e = np.zeros(n)
    tt = 0.01
    while tt < dur * 0.98:
        i = int(tt * SR)
        e[i] += env[i] * gate[i] * rng.uniform(0.4, 1.0)
        tt += 1 / f0[i] * rng.uniform(0.85, 1.15)
    body = modal(rng, e, TIMBER_F * scale, TIMBER_TAU, TIMBER_G, 0.03, 0.2)
    fibre = modal(rng, e, [1450, 2100, 2900], [0.006, 0.005, 0.004], [1, .7, .5], 0.05)
    grit = bp(rng.standard_normal(n), 300, 1500) * env * gate
    return fades(lp(norm(body) + 0.22 * norm(fibre) + 0.05 * norm(grit), 4000), 0.01, 0.06)


def gen_wood_creak_heavy():
    rng = np.random.default_rng(49001)
    T = 1.5
    n = int(T * SR)
    out = np.zeros(n)
    place(out, timber_groan(rng, 1.32), 0.03)
    place(out, 0.25 * wood_creak(rng, 0.35), 0.85)               # kleines Nachknacken einer Bohle
    return reverb(pan(out, -0.1), rt60=1.3, wet=0.32, dry=1.0, seed=49002, n_out=n, predelay=0.012, damp=4000)


def squeak(rng, dur, f_path):
    """Metall-auf-Metall-Quietschen (Bügel im Drehpunkt): Stick-Slip-Folge mit 0.8-1.2 kHz, Jitter,
    stockend, durch helle Blechmoden + direkter Sägezahn-Anteil."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = t / dur
    f = np.interp(u, np.linspace(0, 1, len(f_path)), f_path)
    env = np.sin(np.pi * u) ** 0.7 * (0.55 + 0.45 * np.clip(0.5 + smooth_noise(rng, n, 14), 0, 1))
    e = np.zeros(n)
    tt = 0.002
    while tt < dur * 0.99:
        i = int(tt * SR)
        e[i] += env[i] * rng.uniform(0.7, 1.0)
        tt += 1 / f[i] * rng.uniform(0.97, 1.03)
    ring = modal(rng, e, [1900, 2850, 4100, 5600], [0.006, 0.005, 0.004, 0.003], [1, .8, .6, .4], 0.03)
    return fades(norm(ring) + 0.5 * norm(lp(e, 6000)), 0.005, 0.03)


def gen_lantern_squeak():
    rng = np.random.default_rng(50001)
    T = 1.2
    n = int(T * SR)
    out = np.zeros(n)
    place(out, squeak(rng, 0.36, [900, 1150, 1080, 1000]), 0.04)        # Bügel schwingt hin ...
    place(out, 0.75 * squeak(rng, 0.27, [1020, 960, 850]), 0.5)          # ... und zurück
    place(out, 0.3 * metal_click(rng, ring=0.9, dur=0.3), 0.86)          # legt sich an den Rahmen
    return reverb(pan(out, 0.15), rt60=0.6, wet=0.18, dry=1.0, seed=50002, n_out=n, damp=7000)


def key_clink(rng, freqs, vel):
    n = int(0.15 * SR)
    e = imp(n) + 0.4 * burst(rng, n, 0.00015)
    y = modal(rng, e, freqs, [0.025, 0.02, 0.015, 0.011, 0.008], [1, .8, .7, .5, .35], 0.01, 0.3)
    return fades(vel * norm(y), 0, 0.06)


def gen_keys_jingle():
    rng = np.random.default_rng(51001)
    T = 0.8
    n = int(T * SR)
    out = np.zeros((n, 2))
    keys = [np.array([2900, 4300, 5800, 7600, 9900]) * rng.uniform(0.85, 1.2) for _ in range(5)]
    keys.append(np.array([1900, 2950, 4100, 5300, 6900]))          # der Ring selbst
    for t0, t1, cnt, g in ((0.03, 0.34, 26, 1.0), (0.42, 0.58, 9, 0.6), (0.62, 0.7, 3, 0.35)):
        for _ in range(cnt):
            tt = rng.uniform(t0, t1)
            u = (tt - t0) / (t1 - t0)
            v = g * rng.uniform(0.3, 1.0) * (1 - 0.5 * u)
            place(out, pan(key_clink(rng, keys[rng.integers(len(keys))], v), rng.uniform(-0.4, 0.4)), tt)
    t = np.arange(n) / SR
    rub = bp(rng.standard_normal(n), 3000, 9000) * (np.exp(-((t - 0.18) / 0.12) ** 2) + 0.4 * np.exp(-((t - 0.5) / 0.06) ** 2))
    out += st(0.04 * norm(rub))
    return reverb(out, rt60=0.4, wet=0.15, dry=1.0, seed=51002, n_out=n, damp=9000)


def old_knock(rng):
    """Knöchel an einer alten, schweren Holztür (tiefer als knock_*, etwas länger, sitzt locker im Rahmen)."""
    n = int(0.8 * SR)
    exc = half_sine(rng.uniform(0.0016, 0.0022), n)
    f = DOOR_F * 0.8 * (1 + rng.uniform(-0.02, 0.02, len(DOOR_F)))
    g = DOOR_G * (1 + rng.uniform(-0.2, 0.2, len(DOOR_G))) * np.where(f < 200, 1.3, 1.0)
    body = norm(resbank(exc, f, DOOR_TAU * 1.35, g))
    click = norm(burst(rng, n, 0.0006, 900, 4500))
    rat = np.zeros(n)
    for _ in range(2):
        rat[int(rng.uniform(0.006, 0.03) * SR)] += rng.uniform(0.6, 1.0)
    rat = norm(resbank(rat, [1600, 2500, 3700], [0.006, 0.005, 0.004], [1, .7, .5]))
    y = body + 0.25 * click + 0.06 * rat
    return fades(np.tanh(1.6 * norm(y)) / np.tanh(1.6), 0, 0.15)


def gen_door_knock_wood():
    rng = np.random.default_rng(52001)
    T = 2.8
    n = int(T * SR)
    out = np.zeros(n)
    for t0, g in ((0.05, 1.0), (0.86, 0.94), (1.70, 1.05)):     # langsam, bedächtig (~0.83 s Abstand)
        place(out, old_knock(rng), t0 + rng.uniform(-0.01, 0.01), g)
    return reverb(out, rt60=0.85, wet=0.3, dry=1.0, seed=52002, n_out=n, predelay=0.008, er_span=0.04, damp=5000)


# Kirchenglocke: Hum, Prime, Terz (kl.), Quinte, Nominal, ... (Verhältnis zur Prime, Amplitude, tau s)
CHURCH = ((0.5, 0.55, 7.0), (1.0, 0.45, 5.0), (1.19, 0.55, 4.0), (1.5, 0.22, 2.6), (2.0, 1.0, 3.2),
          (2.51, 0.5, 1.9), (2.66, 0.3, 1.6), (3.01, 0.28, 1.3), (3.33, 0.18, 1.0), (4.0, 0.2, 0.8),
          (4.33, 0.1, 0.6), (5.0, 0.07, 0.45))


def gen_church_bell_distant():
    rng = np.random.default_rng(53001)
    T = 10.0
    n = int(T * SR)
    m = n - int(0.05 * SR)
    y = fit_len(norm(bell(rng, 196.0, m / SR, CHURCH)), m)         # Prime G3, Hum 98 Hz, Schlagton ~392 Hz
    strike = norm(burst(rng, m, 0.003, 600, 5000)) + 0.6 * norm(modal(rng, imp(m), [1650, 2300, 3100],
                                                                         [0.05, 0.04, 0.03], [1, .7, .5]))
    y = hp(lp(y + 0.25 * strike, 2400, order=2), 60)               # Entfernung
    dry = np.zeros(n)
    place(dry, y, 0.05)
    wet = reverb(dry, rt60=3.8, wet=1.0, dry=0.0, seed=53002, n_out=n, predelay=0.07, er_span=0.18, n_er=12,
                 er_level=0.6, damp=3000)
    return 0.55 * st(dry) + 0.8 * wet


# --------------------------------------------------------------------------
# Körper, Übergänge, Hits
# --------------------------------------------------------------------------
def gen_heartbeat_single():
    rng = np.random.default_rng(54001)
    n = int(1.2 * SR)
    out = np.zeros(n)
    place(out, heart_thump(rng, 54, 33, 0.09, 0.3), 0.03)
    k = int(0.6 * SR)
    tk = np.arange(k) / SR
    deep = sine_drop(tk, 36, 48, 0.05) * ramp(tk, 0, 0.008) * np.exp(-tk / 0.1)   # kein langes 808-Nachschwingen
    place(out, 0.35 * fades(deep, 0, 0.2), 0.03)
    return out


def gen_whoosh_dark():
    rng = np.random.default_rng(55001)
    T = 1.0
    n = int(T * SR)
    t = np.arange(n) / SR
    tp = 0.55
    env = np.where(t < tp, np.exp(-((t - tp) / 0.2) ** 2), np.exp(-((t - tp) / 0.15) ** 2))
    fc = 140 + 650 * env ** 1.5
    a = rmsnorm(tvf(colored(rng, n, 1.0), fc, "bp", q=1.3, stages=2))
    b = rmsnorm(tvf(colored(rng, n, 1.0), fc * 2.2, "lp", q=0.7))
    sub = np.sin(phase(45 + 20 * env)) * env ** 2
    mono = (a + 0.35 * b) * env + 0.6 * sub
    out = pan(mono, 0.6 * np.tanh((t - tp) / 0.2))
    return reverb(out, rt60=1.2, wet=0.25, dry=1.0, seed=55002, n_out=n, damp=3000)


def gen_hit_deep():
    rng = np.random.default_rng(56001)
    T = 4.5
    n = int(T * SR)
    t = np.arange(n) / SR
    sub = sine_drop(t, 31, 86, 0.18) * (1 - np.exp(-t / 0.002)) * np.exp(-t / 1.3)      # 86 -> 31 Hz
    harm = bp(np.tanh(4 * sub) / np.tanh(4) - sub, 60, 700)                              # Obertöne fürs Handy
    punch = sine_drop(t, 70, 130, 0.035) * (1 - np.exp(-t / 0.001)) * np.exp(-t / 0.12)
    thud = norm(bp(rng.standard_normal(n), 35, 220)) * np.exp(-t / 0.12) * (1 - np.exp(-t / 0.003))
    knock = norm(bp(rng.standard_normal(n), 180, 900)) * np.exp(-t / 0.02) * (1 - np.exp(-t / 0.0005))  # dunkler Transient
    skin = norm(modal(rng, half_sine(0.006, n), [62, 97, 134, 171], [0.4, 0.3, 0.2, 0.15], [1, .7, .5, .3]))
    dry = sub + 0.5 * norm(harm) + 0.5 * punch + 0.4 * thud + 0.25 * knock + 0.4 * skin
    send = 0.4 * norm(harm) + 0.5 * thud + 0.3 * knock + 0.4 * skin + 0.1 * sub
    wet = reverb(send, rt60=3.0, wet=1.0, dry=0.0, seed=56002, n_out=n, predelay=0.025, damp=2500,
                 lo_mult=1.3, er_span=0.07)
    out = st(dry) + 0.55 * wet
    return np.tanh(1.25 * out / pk(out))


def gen_riser_short():
    rng = np.random.default_rng(57001)
    T = 2.0
    n = int(T * SR)
    t = np.arange(n) / SR
    x = t / T
    nz = rng.standard_normal((n, 2))
    noise = tvf(nz, 300 * (7000 / 300) ** (x ** 1.4), "bp", q=1.2) * undb(-36 + 36 * x ** 2)[:, None]
    tones = np.zeros((n, 2))
    for i, f0 in enumerate((110.0, 116.54, 155.56, 164.81)):     # A2 A#2 D#3 E3: kleine Sekunden
        f = f0 * 2 ** (x ** 1.8) * (1 + 0.003 * np.sin(TWO_PI * rng.uniform(4, 7) * t))
        tones += pan(saw(phase(f) + rng.uniform(0, TWO_PI), f, kmax=40, fmax=8000), -0.6 + 0.4 * i)
    trem = 1 - (0.15 + 0.5 * x) * (0.5 + 0.5 * np.sin(phase(4 + 14 * x ** 2)))
    tones = tvf(tones * (trem * undb(-30 + 30 * x ** 1.3))[:, None], 400 * 15 ** (x ** 1.2), "lp", q=0.9, stages=2)
    ticks = np.zeros(n)                                           # beschleunigende Ticks (Uhr / Puls)
    cyc = np.cumsum(3 + 13 * x ** 1.5) / SR
    for i in np.nonzero(np.diff(np.floor(cyc)) > 0)[0]:
        place(ticks, undb(-24 + 20 * x[i]) * lp(metal_click(rng, ring=0.3, dur=0.05), 5000), t[i])
    sub = np.sin(phase(36 * 2 ** (x ** 1.5))) * undb(-30 + 30 * x ** 1.6)
    hi = 0.9 * tones / pk(tones) + 0.6 * noise / pk(noise) + st(0.5 * ticks / pk(ticks))
    hi = reverb(hi, rt60=1.6, wet=0.35, dry=1.0, seed=57002, n_out=n, predelay=0.015)
    out = hi + st(0.5 * sub)
    return np.tanh(1.3 * out / pk(out))


def gen_stinger_reveal():
    rng = np.random.default_rng(58001)
    T = 1.5
    n = int(T * SR)
    t = np.arange(n) / SR
    notes = [(146.83, 0.6), (155.56, 0.55), (220.0, 0.5), (415.30, 0.5), (440.0, 0.55), (622.25, 0.45),
             (1244.51, 0.22)]                                    # D3 D#3 A3 G#4 A4 D#5 D#6: kl. Sekunden + Tritonus
    out = np.zeros((n, 2))
    for i, (f0, g) in enumerate(notes):
        v = bowed(rng, f0 * 2 ** (rng.uniform(-8, 8) / 1200), T, rng.uniform(5.5, 7.0), rng.uniform(8, 20), 0)
        out += pan(g * v, -0.7 + 1.4 * ((i * 3) % len(notes)) / (len(notes) - 1))
    env = (1 - np.exp(-t / 0.003)) * (0.22 + 0.78 * np.exp(-t / 0.09)) * (1 - ramp(t, 0.42, 0.35))
    out *= env[:, None]
    out += st(0.45 * norm(bp(rng.standard_normal(n), 1500, 8000)) * np.exp(-t / 0.02) * (1 - np.exp(-t / 0.001)))
    out = peq(peq(peq(out, 280, 4.0, 1.2), 2400, 3.5, 1.0), 1300, -3.0, 1.5)
    out = lp(np.tanh(1.1 * out / pk(out)), 10000)
    return reverb(out, rt60=1.8, wet=0.4, dry=1.0, seed=58002, n_out=n, predelay=0.015, damp=6500)


# ==========================================================================
# Loop-Betten (periodisch gebaut, siehe Kopfkommentar)
# ==========================================================================
def pn2(rng, n, ex):
    """Stereo-Rauschen 1/f^ex, periodisch (FFT-basiert), beide Kanäle unabhängig."""
    return np.stack([colored(rng, n, ex), colored(rng, n, ex)], 1)


def gen_rain_bed():
    rng = np.random.default_rng(61001)
    T = 12.0
    n = int(T * SR)
    t = np.arange(n) / SR
    wash = rmsnorm(circ(lambda z: lp(hp(z, 300), 8500), pn2(rng, n, 0.6)))          # Regenfläche
    wash *= (1 + 0.10 * loop_lfo(rng, n, 5, 1))[:, None]
    ticks = np.zeros((n, 2))                                                         # Tropfen auf harten Flächen
    for c in range(2):
        e = poisson_hits(rng, np.full(n, 260.0), 1.0, alpha=2.5)
        e2 = poisson_hits(rng, np.full(n, 90.0), 1.0, alpha=2.5)
        ticks[:, c] = circ(lambda z: bp(z, 2000, 9000), e) + 0.5 * circ(lambda z: bp(z, 700, 2200), e2)
    plips = np.zeros((n, 2))                                                         # Tropfen in Pfützen (Minnaert)
    d = int(0.03 * SR)
    tt = np.arange(d) / SR
    for _ in range(int(18 * T)):
        f0 = rng.uniform(1200, 4200)
        y = sine_drop(tt, f0 * 1.6, f0, 0.006) * (1 - np.exp(-tt / 0.0003)) * np.exp(-tt / rng.uniform(0.003, 0.008))
        place_wrap(plips, pan(y, rng.uniform(-0.9, 0.9)), rng.uniform(0, T), 0.2 * min(rng.lognormal(0, 0.5), 2.2))
    drips = np.zeros((n, 2))                                                         # Regenrinne nebenan, unregelmäßig
    for f0, p_, g in ((1650.0, 0.55, 1.0), (2350.0, -0.45, 0.7)):
        tk = rng.uniform(0, 1.0)
        while tk < T:
            y = sine_drop(tt, f0 * 1.8, f0 * rng.uniform(0.97, 1.03), 0.007) * (1 - np.exp(-tt / 0.0003)) * np.exp(-tt / 0.012)
            place_wrap(drips, pan(y, p_), tk, g * rng.uniform(0.6, 1.0))
            tk += rng.uniform(0.55, 1.6)
    ev = reverb_circ(plips + 0.6 * drips, rt60=1.0, wet=0.3, dry=1.0, seed=61002, damp=7000)
    rum = rmsnorm(circ(lambda z: lp(hp(z, 25), 220), pn2(rng, n, 2.0)))          # Stadt: Verkehrsrumpeln
    city = rmsnorm(circ(lambda z: bp(z, 120, 700), pn2(rng, n, 1.0))) * (1 + 0.3 * loop_lfo(rng, n, 4, 1))[:, None]
    dt = wrap_dist(t, 6.5, T)                                                       # Auto auf nasser Straße, fern
    hiss = circ(lambda z: lp(bp(z, 500, 3500), 3000), rng.standard_normal(n))
    car = pan(rmsnorm(hiss) * np.exp(-(dt / 2.0) ** 2), np.clip(dt / 3.5, -0.7, 0.7))
    out = wash + 0.32 * ticks / np.std(ticks) + 0.22 * ev / np.std(ev) + 0.35 * rum + 0.18 * city + 0.22 * car
    return circ(lambda z: peq(z, 2500, -3.0, 0.7), out)


def wind_layer(rng, n, base=380.0, whistle=0.25, hiss=0.0):
    """Periodischer Wind: Heulen (resonanter Bandpass mit böenabhängiger Mitte), dunkles Rauschen darunter,
    Rumpeln der Böen, Pfeifen nur bei starken Böen, optional Schneegeriesel (sehr leise Höhen)."""
    gs = 0.5 + 0.5 * loop_lfo(rng, n, 7, 1)
    out = np.zeros((n, 2))
    for c in range(2):
        gc = np.roll(gs, int(rng.uniform(0.15, 0.5) * SR) * (1 if c else 0))   # rechte Seite folgt etwas später
        fc = base * 2 ** (1.1 * (gc - 0.5) + 0.15 * loop_lfo(rng, n, 40, 12))
        howl = circ(lambda z, f: tvf(z, f, "bp", q=3.5, stages=2, block=256), colored(rng, n, 1.0), fc)
        body = circ(lambda z, f: tvf(z, f, "lp", q=0.7, stages=2, block=256), colored(rng, n, 1.0), fc * 1.6)
        buf = circ(lambda z: lp(hp(z, 25), 130), colored(rng, n, 2.0))
        a = (rmsnorm(howl) * (0.25 + 0.75 * gc ** 1.5) + 0.45 * rmsnorm(body) * (0.35 + 0.65 * gc)
             + 0.45 * rmsnorm(buf) * (0.3 + 0.7 * gc ** 2))
        if whistle:
            fw = 2.1 * base * 2 ** (0.6 * (gc - 0.5))
            wh = circ(lambda z, f: tvf(z, f, "bp", q=12, block=256), colored(rng, n, 0.5), fw)
            a += whistle * rmsnorm(wh) * np.clip((gc - 0.55) / 0.45, 0, 1) ** 2
        if hiss:
            hs = circ(lambda z: lp(hp(z, 4500), 11000), rng.standard_normal(n))
            a += hiss * rmsnorm(hs) * (0.3 + 0.7 * np.roll(gc, int(0.4 * SR))) * \
                (0.8 + 0.2 * loop_lfo(rng, n, 160, 60))
        out[:, c] = a
    return out


def gen_wind_snow_bed():
    rng = np.random.default_rng(62001)
    n = int(12.0 * SR)
    return wind_layer(rng, n, base=420.0, whistle=0.3, hiss=0.04)


def cricket_chirp(rng, fc, pulses, prate, pdur):
    """Feldgrille, ein Zirpen: `pulses` Silben (prate/s) zu je pdur s, Träger ~4.5 kHz mit leichtem Abwärtsgleiten,
    schnelle Amplitudenmodulation (Zähne der Schrilleiste) -> rau."""
    m = int((pulses / prate + 0.03) * SR)
    y = np.zeros(m)
    L = int(pdur * SR)
    u = np.arange(L) / L
    tl = np.arange(L) / SR
    for k in range(pulses):
        s = int(k / prate * SR)
        f = fc * (1 - 0.015 * u)
        ph = TWO_PI * np.cumsum(f) / SR + rng.uniform(0, TWO_PI)
        am = 0.7 + 0.3 * np.sin(TWO_PI * rng.uniform(180, 260) * tl)
        y[s:s + L] += np.sin(np.pi * u) ** 2 * (np.sin(ph) + 0.08 * np.sin(2 * ph)) * am * rng.uniform(0.85, 1.0)
    return y


def gen_night_suburb_bed():
    rng = np.random.default_rng(63001)
    T = 12.0
    n = int(T * SR)
    t = np.arange(n) / SR
    cr = np.zeros((n, 2))
    # (Träger Hz, Silben, Silben/s, Silbendauer, Zirp-Periode s, Pegel, Pan, Tiefpass)
    for fc, pu, pr, pd, per, g, p_, lpf in ((4650, 4, 28, 0.016, 0.62, 1.0, -0.6, 7000),
                                             (4380, 3, 25, 0.018, 0.85, 0.7, 0.55, 6000),
                                             (5050, 5, 30, 0.014, 0.71, 0.45, 0.1, 5500),
                                             (4800, 4, 27, 0.016, 1.10, 0.35, -0.25, 5000)):
        N = max(1, round(T / per))
        ph0 = rng.uniform(0, T)
        ch = cricket_chirp(rng, fc, pu, pr, pd)
        for k in range(N):
            place_wrap(cr, pan(lp(ch, lpf), p_), ph0 + k * T / N + rng.uniform(-0.03, 0.03), g * rng.uniform(0.85, 1.0))
    cr = reverb_circ(cr, rt60=0.9, wet=0.35, dry=1.0, seed=63002, damp=7000)
    chorus = np.zeros((n, 2))                                     # sehr ferner Grillen-Chor (Trillern)
    for c in range(2):
        z = circ(lambda q: bp(q, 4400, 5100), rng.standard_normal(n))
        am = (0.5 + 0.5 * np.sin(TWO_PI * lfq(29.0 + 2 * c, T) * t)) ** 4 * (0.6 + 0.4 * loop_lfo(rng, n, 6, 1))
        chorus[:, c] = rmsnorm(z) * am
    rum = rmsnorm(circ(lambda z: lp(hp(z, 25), 250), pn2(rng, n, 2.0)))          # Highway fern
    roar = rmsnorm(circ(lambda z: bp(z, 150, 900), pn2(rng, n, 1.0))) * (1 + 0.3 * loop_lfo(rng, n, 3, 1))[:, None]
    dt = wrap_dist(t, 4.2, T)                                                       # ein Auto weit weg
    car = rmsnorm(circ(lambda z: bp(z, 200, 1200), rng.standard_normal(n)))
    car = pan(car * np.exp(-(dt / 1.8) ** 2), np.clip(-dt / 4, -0.6, 0.6))
    air = rmsnorm(circ(lambda z: lp(hp(z, 150), 2500), pn2(rng, n, 1.0)))
    out = (0.13 * cr / np.std(cr) + 0.03 * chorus + 0.2 * rum + 0.06 * roar + 0.08 * car + 0.04 * air)
    return out


def cough(rng, f0=125.0):
    """Hüsteln: zwei kurze Stöße (Glottis öffnet schlagartig, Turbulenz durch /ə/-Formanten, etwas Stimme)."""
    out = np.zeros(int(0.6 * SR))
    tt = 0.0
    for k in range(2):
        d = rng.uniform(0.12, 0.18) * (1 if k == 0 else 0.75)
        m = int(d * SR)
        ts = np.arange(m) / SR
        env = (1 - np.exp(-ts / 0.003)) * np.exp(-ts / (d * 0.35))
        vf = 2 ** rng.uniform(-0.1, 0.1)
        fs, bws = [520 * vf, 1250 * vf, 2450 * vf], [250, 350, 500]
        turb = formants(rng.standard_normal(m), fs, bws, [1, .6, .3])
        voiced = formants(norm(glottal(np.full(m, f0) * (1 - 0.15 * ts / d))), fs, bws, [1, .6, .3])
        place(out, (norm(turb) + 0.5 * norm(voiced) * ramp(ts, 0.015, 0.02)) * env * (1 if k == 0 else 0.6), tt)
        tt += d + rng.uniform(0.08, 0.14)
    return fades(out, 0.001, 0.05)


def murmur(rng, dur, voices=((112.0, -0.3), (168.0, 0.35), (131.0, 0.05)), rate=4.0):
    """Leises Gemurmel im Saal: halb gehauchte Pseudo-Silben (Zufallsformanten), stark tiefpassgefiltert
    -> keine Wörter, kein Summen."""
    n = int(dur * SR)
    tv = np.arange(n) / SR
    out = np.zeros((n, 2))
    for f0c, p_ in voices:
        f0 = f0c * 2 ** ((0.25 * smooth_noise(rng, n, 3) + 0.1 * smooth_noise(rng, n, 9)) / 2)
        src = norm(glottal(f0)) + 0.12 * rng.standard_normal(n)
        nsyl = max(2, int(dur * rate))
        tgt = WH_VOWELS[rng.integers(len(WH_VOWELS), size=nsyl + 1)]
        pos = tv / tv[-1] * nsyl
        i = np.minimum(pos.astype(int), nsyl - 1)
        w = 0.5 - 0.5 * np.cos(np.pi * np.clip((pos - i) * 1.6 - 0.3, 0, 1))
        v = sum(g * rmsnorm(tvf(src, tgt[i, j] * (1 - w) + tgt[i + 1, j] * w, "bp", q=q, block=64))
                for j, (q, g) in enumerate(((5.0, 1.0), (8.0, 0.5))))
        env = np.abs(np.sin(np.pi * pos)) ** 0.8 * (0.5 + 0.5 * (smooth_noise(rng, n, 3) > -0.3))
        env *= ramp(tv, rng.uniform(0.0, 0.3), 0.15) * (1 - ramp(tv, dur - rng.uniform(0.3, 0.6), 0.2))
        out += pan(lp(v * env, 750, order=2), p_)
    return out


def gen_courtroom_room_tone():
    rng = np.random.default_rng(64001)
    T = 12.0
    n = int(T * SR)
    drift = (1 + 0.08 * loop_lfo(rng, n, 5, 1))[:, None]
    rum = rmsnorm(circ(lambda z: lp(hp(z, 20), 170), pn2(rng, n, 2.0)))          # Lüftung / Gebäude
    air = rmsnorm(circ(lambda z: lp(hp(z, 90), 1400), pn2(rng, n, 1.0)))
    hum = sum(a * np.sin(loop_phase(f, n) + rng.uniform(0, TWO_PI)) for f, a in ((120.0, 1.0), (240.0, 0.4), (360.0, 0.15)))
    bed = (rum + 0.55 * air) * drift + st(0.06 * hum / np.std(hum))
    ev = np.zeros((n, 2))
    place_wrap(ev, pan(cough(rng, 122), -0.55), 2.6, 1.0)                           # Husten links hinten
    place_wrap(ev, murmur(rng, 2.2), 6.3, 0.2)                                       # drei Leute murmeln
    place_wrap(ev, pan(wood_creak(rng, 0.5), 0.6), 9.7, 0.35)                        # Bank knarzt
    ev = circ(lambda z: lp(z, 3500), ev)
    wet = reverb_circ(ev, rt60=2.4, wet=1.0, dry=0.25, seed=64002, predelay=0.03, er_span=0.07, damp=4000)
    r = float(np.sqrt(np.mean(bed ** 2)))
    return bed + wet * (r * undb(5.0) / st_rms_max(wet))


def typist(rng, n, spans, cps=6.0, cr_at=None):
    """Ferne Schreibkraft: Wörter in Schüben (spans = [(t0, t1)]), Leertasten, Denkpausen;
    optional Randglocke + Wagenrücklauf bei cr_at. Alles umlaufend platziert."""
    buf = np.zeros(n)
    T = n / SR
    for t0, t1 in spans:
        tt = t0
        while tt < t1:
            for _ in range(int(rng.integers(2, 8))):
                place_wrap(buf, tw_key(rng, rng.uniform(0.6, 1.0)), tt % T)
                tt += float(np.clip(rng.lognormal(np.log(1 / cps), 0.3), 0.06, 0.3))
            place_wrap(buf, tw_key(rng, 0.7, space=True), tt % T)
            tt += float(np.clip(rng.lognormal(np.log(1.2 / cps), 0.3), 0.08, 0.35))
            if rng.uniform() < 0.2:
                tt += rng.uniform(0.3, 0.9)
    if cr_at is not None:
        place_wrap(buf, 0.6 * type_bell_ding(rng, 1.0), (cr_at - 0.35) % T)
        place_wrap(buf, 0.8 * carriage_return(rng, 0.3), cr_at % T)
    return buf


def gen_newsroom_bed():
    rng = np.random.default_rng(65001)
    T = 12.0
    n = int(T * SR)
    rum = rmsnorm(circ(lambda z: lp(hp(z, 20), 150), pn2(rng, n, 2.0)))
    air = rmsnorm(circ(lambda z: lp(hp(z, 80), 1800), pn2(rng, n, 1.0)))
    hum = sum(a * np.sin(loop_phase(f, n) + rng.uniform(0, TWO_PI))
              for f, a in ((120.0, 1.0), (240.0, 0.45), (360.0, 0.25), (480.0, 0.12), (600.0, 0.06)))
    buzz = circ(lambda z: bp(z, 1500, 4000), np.abs(np.sin(loop_phase(60.0, n))) ** 30)   # Vorschaltgerät sirrt
    room = (rum + 0.5 * air) * (1 + 0.06 * loop_lfo(rng, n, 4, 1))[:, None] + \
        st(0.08 * hum / np.std(hum) + 0.012 * buzz / np.std(buzz))
    a = typist(rng, n, [(0.3, 5.0), (7.6, 10.8)], cps=6.5, cr_at=5.5)
    b = typist(rng, n, [(2.0, 4.2), (5.4, 9.2)], cps=5.0)
    tty = np.zeros(n)                                             # Fernschreiber ganz hinten
    for k in range(int(2.6 * 10)):
        tk = 9.0 + k * 0.1 + rng.uniform(-0.003, 0.003)
        place_wrap(tty, 0.6 * norm(modal(rng, half_sine(0.002, int(0.08 * SR)), [180, 320, 540, 900],
                                         [0.02, 0.015, 0.01, 0.007], [1, .8, .6, .4])) +
                   0.4 * fit_len(metal_click(rng, ring=0.3, dur=0.05), int(0.08 * SR)), tk % T)
    ev = np.stack([0.0 * a, 0.0 * a], 1)
    ev += pan(circ(lambda z: lp(z, 2200), a), -0.35)
    ev += pan(circ(lambda z: lp(z, 1400), b), 0.5) * 0.6
    ev += pan(circ(lambda z: lp(z, 1500), tty), 0.15) * 0.35
    wet = reverb_circ(ev, rt60=1.0, wet=0.7, dry=0.45, seed=65002, predelay=0.02, er_span=0.05, damp=4500)
    r = float(np.sqrt(np.mean(room ** 2)))
    return room + wet * (r * undb(1.0) / st_rms_max(wet))


def gen_farm_night_bed():
    rng = np.random.default_rng(66001)
    T = 12.0
    n = int(T * SR)
    t = np.arange(n) / SR
    wind = wind_layer(rng, n, base=300.0, whistle=0.12)
    wind = circ(lambda z: lp(z, 2200), wind)                     # gehört von drinnen (Scheune)
    ev = np.zeros((n, 2))
    place_wrap(ev, pan(timber_groan(rng, 0.95, f_lo=30, f_span=65), -0.45), 2.2, 1.0)    # Balken
    place_wrap(ev, pan(timber_groan(rng, 0.65, f_lo=40, f_span=55, scale=1.15), 0.5), 8.5, 0.7)
    place_wrap(ev, pan(wood_creak(rng, 0.4), 0.2), 4.9, 0.4)                               # kleine Bohle
    m = int(0.9 * SR)                                            # Tier verlagert das Gewicht im Stroh
    tm = np.arange(m) / SR
    senv = np.exp(-((tm - 0.3) / 0.15) ** 2) + 0.6 * np.exp(-((tm - 0.62) / 0.1) ** 2)
    straw = crinkle(rng, 900 * senv, senv ** 0.5, bands=((1000, 5000, 1.0), (500, 1500, 0.6)))
    sh = norm(straw) * 0.5
    for d in (0.22, 0.55):
        place(sh, norm(modal(rng, half_sine(0.006, m), [60, 95, 140, 210], [0.05, 0.04, 0.03, 0.02], [1, .8, .5, .3])), d)
    k = int(0.35 * SR)
    snuff = bp(rng.standard_normal(k), 300, 1500) * np.sin(np.pi * np.arange(k) / k) ** 2
    place(sh, 0.3 * norm(snuff), 0.5)
    place_wrap(ev, pan(lp(sh, 2500), 0.3), 5.8, 0.55)
    wet = reverb_circ(ev, rt60=1.1, wet=0.5, dry=0.8, seed=66002, predelay=0.012, damp=3500)
    r = float(np.sqrt(np.mean(wind ** 2)))
    return wind + wet * (r * undb(5.0) / st_rms_max(wet))


def clock_tick(rng, tock):
    """Pendeluhr: Anker trifft den Zahn des Hemmungsrads (heller Messing-Klick), hohles Holzgehäuse
    schwingt mit, kleiner Nachklick beim Abfallen. Tick und Tack klingen leicht verschieden."""
    n = int(0.3 * SR)
    s = 0.9 if tock else 1.0
    e = imp(n) + 0.5 * burst(rng, n, 0.0002)
    brass = modal(rng, e, np.array([2450, 3650, 5100, 6900]) * s, [0.014, 0.01, 0.007, 0.005], [1, .8, .55, .35], 0.02)
    case = modal(rng, half_sine(0.0009, n), np.array([230, 395, 640, 980, 1450]) * (0.94 if tock else 1.0),
                 [0.035, 0.03, 0.022, 0.015, 0.01], [0.9, 1, .8, .55, .35], 0.02)
    y = 0.55 * norm(brass) + norm(case)
    place(y, 0.25 * norm(modal(rng, imp(n), [3100, 4700], [0.004, 0.003], [1, .6])), rng.uniform(0.008, 0.012))
    return fades(y, 0, 0.1)


def gen_clock_tick_bed():
    rng = np.random.default_rng(67001)
    T = 10.0
    n = int(T * SR)
    ev = np.zeros((n, 2))
    for k in range(10):                                           # 1 Schlag/s, Tick-Tack im Wechsel
        tock = k % 2 == 1
        t0 = 0.3 + k + (0.008 if tock else 0.0) + rng.uniform(-0.002, 0.002)
        place_wrap(ev, pan(clock_tick(rng, tock) * (0.9 if tock else 1.0) * rng.uniform(0.96, 1.04), -0.15), t0)
    ev = reverb_circ(ev, rt60=0.7, wet=0.25, dry=1.0, seed=67002, predelay=0.006, damp=6000)
    room = rmsnorm(circ(lambda z: lp(hp(z, 40), 700), pn2(rng, n, 1.5)))
    return ev + room * pk(ev) * undb(-56)


def gen_crt_hum_bed():
    rng = np.random.default_rng(68001)
    T = 8.0
    n = int(T * SR)
    hum = sum(a * np.sin(loop_phase(f, n) + rng.uniform(0, TWO_PI))
              for f, a in ((60.0, 0.5), (120.0, 1.0), (180.0, 0.35), (240.0, 0.3), (300.0, 0.12), (360.0, 0.1),
                           (480.0, 0.06), (600.0, 0.04)))
    hum = hum * (1 + 0.08 * loop_lfo(rng, n, 6, 1))
    pulse = (0.5 + 0.5 * np.cos(loop_phase(59.94, n))) ** 40      # Bildwechsel-Buzz aus dem Lautsprecher
    buzz = circ(lambda z: bp(z, 200, 2500), pulse)
    fly = np.sin(loop_phase(15734.26 * (1 + 0.00005 * loop_lfo(rng, n, 5, 1)), n))   # Zeilentrafo
    hiss = circ(lambda z: lp(hp(z, 1500), 10000), rng.standard_normal((n, 2)))
    crk = np.zeros(n)
    for _ in range(14):                                           # seltenes Knistern der Hochspannung
        crk[rng.integers(0, n)] += rng.uniform(-1, 1)
    crk = circ(lambda z: bp(z, 1500, 8000), crk)
    mono = rmsnorm(hum) + 0.1 * rmsnorm(buzz) + 0.035 * fly / np.std(fly) + 0.15 * crk / pk(crk)
    out = pan(mono, -0.1) + 0.02 * rmsnorm(hiss)
    return reverb_circ(out, rt60=0.4, wet=0.15, dry=1.0, seed=68002, damp=6000)


# ==========================================================================
# Katalog: Name, Generator, Ziel-Lautheit (One-Shot: LUFS-M max / Loop: LUFS-I), Fade-in s, Fade-out s,
#          Hochpass Hz, Loop?, empfohlener Gain im story.json, Beschreibung
# ==========================================================================
SPECS = [
    ("typewriter_burst", gen_typewriter_burst, -17.0, 0.002, 0.08, 60, False, "-4..-8",
     "2 s manual typewriter: irregular key strikes + space bar, margin bell, carriage-return zip + stop clunk."),
    ("typewriter_key", gen_typewriter_key, -22.0, 0.002, 0.05, 60, False, "-2..-6",
     "One typewriter key strike (type bar slap + escapement click)."),
    ("type_bell", gen_type_bell, -20.0, 0.002, 0.1, 200, False, "-4..-8",
     "Typewriter margin bell 'ting' (~2.2 kHz small dome bell), 1.5 s ring."),
    ("paper_rustle", gen_paper_rustle, -21.0, 0.002, 0.05, 150, False, "-2..-6",
     "0.8 s sheets handled: crinkle + friction, two gestures."),
    ("envelope_tear", gen_envelope_tear, -19.0, 0.002, 0.05, 120, False, "-3..-6",
     "0.7 s envelope torn open: thumb nick, jerky fibre rip, final tear + flap."),
    ("rubber_stamp", gen_rubber_stamp, -17.0, 0.002, 0.08, 30, False, "-3..-6",
     "Rubber stamp on a desk: woody thud + paper slap, sticky lift-off at 0.36 s."),
    ("gavel", gen_gavel, -14.0, 0.002, 0.6, 35, False, "-3..-6",
     "Two hardwood gavel knocks (0.05 / 0.47 s) in a wood-panelled courtroom, 1.8 s reverb."),
    ("cell_door_slam", gen_cell_door_slam, -12.5, 0.002, 1.5, 20, False, "-3..-6",
     "Barred cell door slams at 0.12 s: steel impact, latch, bar ring + 4.5 s concrete-corridor tail, flutter echo."),
    ("camera_flash_old", gen_camera_flash_old, -15.0, 0.002, 0.3, 25, False, "-3..-8",
     "Magnesium flash powder: trigger click, 'fwump' at 0.06 s, crackling particles."),
    ("camera_shutter_old", gen_camera_shutter_old, -20.0, 0.002, 0.1, 80, False, "-2..-6",
     "Vintage SLR: mirror slap + cloth shutter (0.03 s), then film-advance lever ratchet (0.34-0.7 s)."),
    ("floppy_insert", gen_floppy_insert, -20.5, 0.002, 0.12, 50, False, "-2..-6",
     "3.5\" disk slides in, clicks home (0.29 s), drive spins up, head steps 'brrrt' (seek) until ~1.45 s."),
    ("crt_on", gen_crt_on, -18.0, 0.002, 0.2, 25, False, "-3..-6",
     "CRT TV switched on: switch, degauss 'bwoumm' thump (0.07 s), HV crackle, rising whine, 60 Hz hum."),
    ("tv_static_burst", gen_tv_static_burst, -17.0, 0.004, 0.05, 120, False, "-6..-10",
     "0.6 s analog TV snow (between channels): FM hiss + 59.94 Hz sync buzz, crackle."),
    ("phone_rotary_dial", gen_phone_rotary_dial, -20.0, 0.002, 0.08, 80, False, "-2..-6",
     "Rotary dial, four digits (2-1-3-1): wind-up ratchet, governor whirr, 10 pps pulse clicks, faint bell tinkle."),
    ("phone_pickup", gen_phone_pickup, -20.0, 0.002, 0.08, 60, False, "-2..-6",
     "Old desk-phone handset lifted: cradle clack, hook switch, faint ringer tinkle."),
    ("payphone_coin", gen_payphone_coin, -19.0, 0.002, 0.15, 100, False, "-3..-6",
     "Coin into a 70s payphone: slot scrape, rolls down the chute, totalizer 'ding-ding', drops into the box."),
    ("car_door", gen_car_door, -16.0, 0.002, 0.15, 25, False, "-3..-6",
     "Heavy 70s car door shut: solid panel thunk, latch double click, outdoor."),
    ("police_radio", gen_police_radio, -16.0, 0.002, 0.05, 0, False, "-4..-8",
     "1.5 s police radio: key-up, squelch open, garbled dispatch voice (no words), squelch tail + click."),
    ("siren_wail", gen_siren_wail, -20.0, 0.002, 1.2, 0, False, "-6..-10",
     "6 s distant electronic police wail (640-1360 Hz, 2 sweeps), city reflections, fades in/out."),
    ("footsteps_snow", gen_footsteps_snow, -19.5, 0.002, 0.12, 40, False, "-4..-8",
     "Six crunchy steps in dry snow (0.49 s apart), heel + toe crunch, two faint cold squeaks."),
    ("wood_creak_heavy", gen_wood_creak_heavy, -15.0, 0.005, 0.15, 30, False, "-3..-6",
     "1.5 s old timber beam under load: stick-slip 30->110->30 Hz (ticky creak into tonal groan and back), barn reverb."),
    ("lantern_squeak", gen_lantern_squeak, -20.0, 0.002, 0.1, 300, False, "-3..-6",
     "Kerosene-lantern bail handle: two metal pivot squeaks (swing and back) + settle clink."),
    ("keys_jingle", gen_keys_jingle, -20.0, 0.002, 0.08, 300, False, "-3..-6",
     "0.8 s key ring shaken: dense jingle, small shake, settle."),
    ("door_knock_wood", gen_door_knock_wood, -15.0, 0.002, 0.4, 30, False, "-2..-6",
     "Three slow knuckle knocks (0.83 s apart) on a heavy old wooden door, hallway reverb."),
    ("church_bell_distant", gen_church_bell_distant, -16.0, 0.002, 3.0, 40, False, "-4..-8",
     "One distant church-bell toll (G3 prime / 98 Hz hum, warbling partials), outdoor reverb, 10 s decay."),
    ("heartbeat_single", gen_heartbeat_single, -16.0, 0.002, 0.2, 18, False, "-3..-6",
     "One deep, muffled heart thump (54->33 Hz) with harmonics for phone speakers."),
    ("whoosh_dark", gen_whoosh_dark, -14.0, 0.005, 0.1, 20, False, "-4..-8",
     "1 s low resonant whoosh (140-790 Hz) + sub swell, peak at 0.55 s, pans L->R."),
    ("hit_deep", gen_hit_deep, -8.5, 0.001, 0.8, 16, False, "-3..-8",
     "Cinematic low boom: 86->31 Hz sub drop, dark punch (no bright crack), saturated harmonics, 3 s dark hall."),
    ("riser_short", gen_riser_short, -11.0, 0.02, 0.004, 25, False, "-3..-8",
     "2 s tension riser: minor-2nd saw cluster +1 oct, opening noise, accelerating ticks, sub; hard stop at 2.0 s."),
    ("stinger_reveal", gen_stinger_reveal, -12.0, 0.001, 0.3, 50, False, "-3..-8",
     "1.5 s sharp dissonant string stab (D3-D#6 cluster: minor 2nds + tritone), bow bite, 1.8 s reverb."),
    # ---- Loops ----
    ("rain_bed", gen_rain_bed, -33.0, 0, 0, 25, True, "-4..+1",
     "12 s loop: steady rain (wash, hard-surface ticks, puddle plips, gutter drips) + distant city rumble, "
     "one far car hissing past on the wet road (~6.5 s)."),
    ("wind_snow_bed", gen_wind_snow_bed, -34.0, 0, 0, 25, True, "-4..+2",
     "12 s loop: cold winter wind (gusting howl, low buffeting, whistle on strong gusts) + very soft snow hiss."),
    ("night_suburb_bed", gen_night_suburb_bed, -36.0, 0, 0, 25, True, "-3..+2",
     "12 s loop: quiet 70s suburb night: 4 field crickets far away + faint chorus, distant highway, one far car."),
    ("courtroom_room_tone", gen_courtroom_room_tone, -38.0, 0, 0, 20, True, "-2..+3",
     "12 s loop: big courtroom room tone (HVAC, faint 120 Hz hum) + one far cough, wordless murmur, a bench creak."),
    ("newsroom_bed", gen_newsroom_bed, -36.0, 0, 0, 20, True, "-3..+2",
     "12 s loop: 70s newsroom: office air + fluorescent hum, two far typewriters (bell + return), teletype."),
    ("farm_night_bed", gen_farm_night_bed, -36.0, 0, 0, 25, True, "-3..+2",
     "12 s loop: inside a barn at night: soft gusting wind, timber groans, an animal shifting in the straw (~6 s)."),
    ("clock_tick_bed", gen_clock_tick_bed, -34.0, 0, 0, 40, True, "-6..0",
     "10 s loop: old pendulum wall clock, tick-tock at 1/s (tick/tock alternate), living-room reverb."),
    ("crt_hum_bed", gen_crt_hum_bed, -36.0, 0, 0, 30, True, "-4..+2",
     "8 s loop: CRT TV hum (60 Hz grid, 120 Hz dominant), faint 59.94 Hz speaker buzz, 15.7 kHz whine, rare crackle."),
]


# --------------------------------------------------------------------------
# Fertigstellen
# --------------------------------------------------------------------------
def finish_shot(x, target, fin, fout, hp_hz):
    x = finalize(x, 0.0, fin, fout, hp_hz, False)
    x = x * undb(target - momentary_lufs_max(x))
    tp = todb(true_peak(x))
    if tp > TP_CEIL:
        x = x * undb(TP_CEIL - tp)
    return x


LOOP_BANDS = ((20, 150), (150, 500), (500, 1500), (1500, 4000), (4000, 12000))


def loop_start(x, win=0.15, flux_win=0.1, grid=0.005, flux_weight=1.5):
    """Loop-Startpunkt für einen periodischen Loop. Gesucht wird (auf einem 5-ms-Raster) die Stelle, an der
    (a) die Energie in +-150 ms am kleinsten ist - also nicht mitten in einem Knarren / Husten / Tick - und
    (b) sich das Spektrum (5 Bänder, je 100 ms links/rechts) am wenigsten ändert - also nicht direkt an
    einem Ereignis-Anfang oder -Ende. Dort wird das Sample genommen, an dem beide Kanäle in +-2 ms am
    nächsten an null sind. Alles zirkulär, weil die Datei periodisch ist."""
    n = len(x)
    mono = np.mean(x, axis=1)

    def circ_mean(p, w):     # Mittel von p über [i - w, i + w) bzw. Fenster links/rechts, zirkulär
        c = np.concatenate([[0.0], np.cumsum(np.concatenate([p[-w:], p, p[:w]]))])
        i = np.arange(n)
        return (c[i + 2 * w] - c[i]) / (2 * w), (c[i + w] - c[i]) / w, (c[i + 2 * w] - c[i + w]) / w

    local, _, _ = circ_mean(np.sum(x ** 2, axis=1), int(win * SR))
    flux = np.zeros(n)
    for lo, hi in LOOP_BANDS:
        e = circ(lambda z: bp(z, lo, hi), mono) ** 2
        _, left, right = circ_mean(e, int(flux_win * SR))
        flux += np.abs(np.log10((right + 1e-20) / (left + 1e-20)))
    cand = np.arange(0, n, int(grid * SR))
    score = np.log10(local[cand] + 1e-20) + flux_weight * flux[cand] / len(LOOP_BANDS)
    i0 = int(cand[np.argmin(score)])
    k = int(0.002 * SR)
    idx = (i0 + np.arange(-k, k + 1)) % n
    return int(idx[np.argmin(np.max(np.abs(x[idx]), axis=1))])


def finish_loop(x, target, hp_hz):
    """Loops: zirkulärer Hochpass, Rotation auf den Loop-Startpunkt (keine Randblenden), Lautheit auf
    target LUFS-I, True Peak mit der Umlaufnaht als Kontext gemessen."""
    x = st(x).astype(np.float64)
    if hp_hz:
        x = circ(lambda z: hp(z, hp_hz), x)
    x = np.roll(x, -loop_start(x), axis=0)
    x = x * undb(target - lufs_integrated(np.concatenate([x, x])))
    c = SR // 10
    tp = todb(true_peak(np.concatenate([x[-c:], x, x[:c]])))
    if tp > TP_CEIL:
        x = x * undb(TP_CEIL - tp)
    return x


def main(argv):
    os.makedirs(OUT_DIR, exist_ok=True)
    only = [a for a in argv if not a.startswith("--")]
    for name, fn, target, fin, fout, hp_hz, loop, _gain, _desc in SPECS:
        if only and name not in only:
            continue
        t0 = time.time()
        raw = fn()
        assert np.all(np.isfinite(raw)), name
        x = finish_loop(raw, target, hp_hz) if loop else finish_shot(raw, target, fin, fout, hp_hz)
        sf.write(os.path.join(OUT_DIR, name + ".wav"), x, SR, subtype="PCM_24")
        lu = lufs_integrated(np.concatenate([x, x])) if loop else momentary_lufs_max(x)
        print(f"{name:22s} {len(x) / SR:6.2f} s  TP {todb(true_peak(x)):6.1f} dBTP  RMS {todb(np.sqrt(np.mean(x ** 2))):6.1f}"
              f"  {'LUFS-I' if loop else 'LUFS-M'} {lu:6.1f} (Ziel {target:5.1f})  {time.time() - t0:5.1f}s", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:])
