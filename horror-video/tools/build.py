# Baut aus story.json: Sprachclips, Wort-Timings, timeline.json und den Audio-Mix.
# Usage: python3 -I build.py <story.json> <workdir>
import sys, os, json, re, subprocess, hashlib
import numpy as np, soundfile as sf

TOOLS = os.path.dirname(os.path.abspath(__file__))
SCRATCH = os.path.dirname(TOOLS)
MODELS = os.path.join(SCRATCH, "models")
SR = 48000

story = json.load(open(sys.argv[1]))
WD = sys.argv[2]
os.makedirs(f"{WD}/vo", exist_ok=True)
SFX = story.get("sfxDir", os.path.join(SCRATCH, "video", "sfx"))

def run(*a): subprocess.run(list(a), check=True)

import sherpa_onnx
from math import gcd
from scipy.signal import resample_poly
from pedalboard import Pedalboard, HighpassFilter, LowShelfFilter, PeakFilter, HighShelfFilter, Compressor, Reverb, Limiter, Gain

_TTS, _ASR = {}, None
LANG = story.get("lang", "de")
def get_tts(model):
    if model == "kokoro" and model not in _TTS:
        K = f"{MODELS}/kokoro-multi-lang-v1_0"
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=f"{K}/model.onnx", voices=f"{K}/voices.bin", tokens=f"{K}/tokens.txt", data_dir=f"{K}/espeak-ng-data",
            lexicon=f"{K}/lexicon-us-en.txt", dict_dir=f"{K}/dict"), num_threads=4))
        _TTS[model] = sherpa_onnx.OfflineTts(cfg)
    if model not in _TTS:
        d, mf = {"high": ("vits-piper-de_DE-thorsten-high", "de_DE-thorsten-high.onnx"),
                 "emo": ("vits-piper-de_DE-thorsten_emotional-medium", "de_DE-thorsten_emotional-medium.onnx")}[model]
        d = f"{MODELS}/{d}"
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=f"{d}/{mf}", tokens=f"{d}/tokens.txt", data_dir=f"{d}/espeak-ng-data", length_scale=1.0, noise_scale=0.6, noise_scale_w=0.7), num_threads=4))
        _TTS[model] = sherpa_onnx.OfflineTts(cfg)
    return _TTS[model]
def get_asr():
    global _ASR
    if _ASR is None:
        M = f"{MODELS}/sherpa-onnx-whisper-small"
        _ASR = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/small-encoder.int8.onnx", decoder=f"{M}/small-decoder.int8.onnx",
            tokens=f"{M}/small-tokens.txt", language=LANG, task="transcribe", num_threads=4)
    return _ASR

SPK = {"neutral": ("emo", 4), "whisper": ("emo", 7), "high": ("high", 0)}
VOICES = {"narrator": ("neutral", 0.92, "narrator"), "whisper": ("whisper", 0.95, "dry"), "entity": ("whisper", 0.95, "entity")}
# Stimmen aus story.json: {"name": {"engine": "kokoro", "sid": 17, "deep": 0.96, "style": "narrator", "speed": 0.9}}
VCFG = story.get("voices", {})
def voice_cfg(voice):
    if voice in VCFG:
        v = VCFG[voice]; return v["engine"], v["sid"], v.get("deep", 1.0), v.get("style", "narrator"), v.get("speed")
    spk, deep, style = VOICES[voice]; model, sid = SPK[spk]; return model, sid, deep, style, None

def voice_fx(a, sr, deep, style):
    """Tiefer (Abspielrate * deep), EQ, Kompression, Raum, Limiter -> 48 kHz."""
    src = int(round(sr * deep)); g = gcd(SR, src); y = resample_poly(a, SR // g, src // g).astype(np.float32)
    fx = [HighpassFilter(70), LowShelfFilter(cutoff_frequency_hz=140, gain_db=3.5), PeakFilter(320, -2.5, 1.0),
          PeakFilter(2800, 2.5, 0.9), HighShelfFilter(9000, -2.0), Compressor(threshold_db=-20, ratio=3.2, attack_ms=6, release_ms=120), Gain(4)]
    if style == "entity": fx += [HighShelfFilter(6500, -2.0), Reverb(room_size=0.4, damping=0.6, wet_level=0.13, dry_level=0.92, width=0.0)]
    elif style == "dry": fx += [Reverb(room_size=0.15, damping=0.7, wet_level=0.05, dry_level=0.97, width=0.0)]
    else: fx += [Reverb(room_size=0.22, damping=0.7, wet_level=0.09, dry_level=0.95, width=0.0)]
    fx += [Limiter(threshold_db=-3.0, release_ms=80), Gain(-1.5)]
    y = Pedalboard(fx)(y, SR); return (y[0] if y.ndim > 1 else y).astype(np.float32)

NUMW = {"1": "eins", "2": "zwei", "3": "drei", "12": "zwölf", "33": "dreiunddreißig"}
EN_NUM = {w: str(i) for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split())}
EN_NUM.update({"thirty": "30", "forty": "40", "fifty": "50"})
def nrm(s):
    if LANG == "en":
        s = s.lower().replace("a.m.", "am").replace("p.m.", "pm")
        w = re.sub(r"[^a-z0-9 ]", " ", s.replace("-", " ")).split(); out = []
        for i, x in enumerate(w):  # "thirty three" -> 33
            if x in EN_NUM: x = EN_NUM[x]
            if out and x.isdigit() and len(x) == 1 and out[-1].isdigit() and out[-1].endswith("0") and len(out[-1]) == 2: out[-1] = str(int(out[-1]) + int(x)); continue
            out.append(x)
        return "".join(out)
    s = s.lower().replace("c", "k")
    w = [NUMW.get(x, x) for x in re.sub(r"[^a-zäöüß0-9 ]", " ", s).split()]
    return "".join(w)
def cer(ref, hyp):
    r, h = nrm(ref), nrm(hyp)
    d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (r[i - 1] != h[j - 1]))
    return d[len(h)] / max(1, len(r))
def asr(y):
    x = resample_poly(y, 1, 3).astype(np.float32)
    x = np.concatenate([np.zeros(4000, np.float32), x, np.zeros(8000, np.float32)])
    st = get_asr().create_stream(); st.accept_waveform(16000, x); get_asr().decode_stream(st); return st.result.text.strip()

TAKES_LOG = []
def tts_clip(text, voice, speed, say=None, takes=None):
    """Mehrere Takes erzeugen, deutlichsten per Whisper wählen. Cache über Hash."""
    say = say or text
    key = hashlib.md5((f"{say}|{voice}|{speed}|v5" if voice not in VCFG else f"{say}|{json.dumps(VCFG[voice], sort_keys=True)}|{speed}|v6").encode()).hexdigest()[:12]
    out = f"{WD}/vo/{key}.wav"
    if os.path.exists(out) and os.path.exists(out + ".json"):
        TAKES_LOG.append(json.load(open(out + ".json"))); return out
    model, sid, deep, style, vspeed = voice_cfg(voice)
    if speed is None: speed = vspeed or 1.0
    lo, hi = (takes or ((3, 7) if model == "kokoro" else (4, 14)))
    cands = []
    for k in range(hi):
        sp = speed * (1 + (0.035 * ((k + 1) // 2) * (1 if k % 2 else -1) if model == "kokoro" else 0))  # Kokoro ist deterministisch: Takes über Tempo variieren
        g = get_tts(model).generate(say, sid=sid, speed=sp)
        y = voice_fx(np.array(g.samples, dtype=np.float32), g.sample_rate, deep, style)
        hyp = asr(y); e = min(cer(text, hyp), cer(say, hyp))
        cands.append((e, len(y) / SR, y, hyp))
        if k + 1 >= lo and min(c[0] for c in cands) == 0: break
    best_e = min(c[0] for c in cands)
    pool = [c for c in cands if c[0] <= best_e + 1e-9]
    med = float(np.median([c[1] for c in cands]))
    e, dur, y, hyp = min(pool, key=lambda c: abs(c[1] - med))
    sf.write(out, y, SR, subtype="PCM_24")
    info = {"text": text, "say": say, "voice": voice, "takes": len(cands), "cer": round(e, 3), "asr": hyp}
    json.dump(info, open(out + ".json", "w"), ensure_ascii=False); TAKES_LOG.append(info)
    print(f"  [{voice:8s}] {len(cands):2d} Takes, CER {e:.2f}: {text} -> {hyp}", flush=True)
    return out

def trim(a, thr_db=-42):
    thr = 10 ** (thr_db / 20); win = int(.01 * SR)
    env = np.sqrt(np.convolve(a ** 2, np.ones(win) / win, mode="same"))
    idx = np.where(env > thr)[0]
    if not len(idx): return a
    s = max(0, idx[0] - int(.03 * SR)); e = min(len(a), idx[-1] + int(.12 * SR))
    b = a[s:e].copy(); f = int(.01 * SR); b[:f] *= np.linspace(0, 1, f); b[-f:] *= np.linspace(1, 0, f)
    return b

def silences(a, thr_db=-38, min_len=.09):
    """Pausen innerhalb eines Clips (für Komma-Ausrichtung)."""
    win = int(.02 * SR); env = np.sqrt(np.convolve(a ** 2, np.ones(win) / win, mode="same"))
    quiet = env < 10 ** (thr_db / 20); out = []; i = 0; n = len(a)
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            if (j - i) / SR >= min_len and i > .15 * SR and j < n - .15 * SR: out.append(((i + j) / 2 / SR, (j - i) / SR))
            i = j
        else: i += 1
    return out

def syl_weight(w):
    w = w.lower(); v = len(re.findall(r"[aeiouyäöü]+", w)); return max(1, v) + len(w) * .12

def word_times(text, dur):
    """Wortzeiten über Silbengewichte; Satzzeichen bekommen kleine Pausen."""
    toks = text.split(); weights = []
    for t in toks:
        wgt = syl_weight(re.sub(r"[^\wäöüßÄÖÜ]", "", t) or "a")
        weights.append(wgt)
    pauses = [(.35 if re.search(r"[.!?…]$", t) else .22 if re.search(r"[,;:–-]$", t) else 0) for t in toks]
    total = sum(weights) + sum(pauses[:-1])
    lead = .04; usable = dur - lead - .1; x = lead; out = []
    for t, wgt, p in zip(toks, weights, pauses):
        d = usable * wgt / total; out.append([t, x, x + d]); x += d + usable * p / total
    return out

def refine(words, a, dur):
    """Phrasengrenzen (Kommas) auf echte Pausen im Clip schieben."""
    sil = silences(a)
    bidx = [i for i, w in enumerate(words[:-1]) if re.search(r"[,;:.!?–]$", w[0])]
    if not bidx or len(sil) < len(bidx): return words
    sil = sorted(sorted(sil, key=lambda s: -s[1])[:len(bidx)])
    # Segmentweise neu verteilen
    bounds = [0] + [s[0] for s in sil] + [dur]
    groups = []; start = 0
    for bi in bidx + [len(words) - 1]: groups.append(words[start:bi + 1]); start = bi + 1
    out = []
    for g, (s0, s1) in zip(groups, zip(bounds[:-1], bounds[1:])):
        txt = " ".join(w[0] for w in g); wt = word_times(txt, s1 - s0)
        out += [[w, s0 + a_, s0 + b_] for w, a_, b_ in wt]
    return out

# ---------- Layout ----------
t = story.get("lead", 0.35)
beats_out, words_out, chunks, cues = [], [], [], []
voice_track = []  # (start, path)
for bi, b in enumerate(story["beats"]):
    start = t; t += b.get("pre", 0.0)
    bw = []  # Wörter dieses Beats
    for li, ln in enumerate(b.get("lines", [])):
        vname = ln.get("voice", "narrator")
        clip = tts_clip(ln["text"], vname, ln.get("speed", story.get("speed", None if vname in VCFG else 1.0)), ln.get("say"), ln.get("takes"))
        a, sr = sf.read(clip, dtype="float32"); a = trim(a); dur = len(a) / SR
        p = f"{WD}/vo/b{bi:02d}_{li}.wav"; sf.write(p, a, SR, subtype="PCM_24")
        voice_track.append((t, p, ln.get("gain", 0.0)))
        wt = refine(word_times(ln["text"], dur), a, dur)
        emph = set(e.lower() for e in ln.get("emph", []) + b.get("emph", []))
        for w, ws, we in wt:
            clean = re.sub(r"[^\wäöüßÄÖÜ:']", "", w)
            words_out.append({"text": re.sub(r"[„“\"]", "", w), "start": round(t + ws, 3), "end": round(t + we, 3),
                              "emph": clean.lower() in emph, "beat": bi, "line": len(voice_track) - 1, "voice": ln.get("voice", "narrator")})
            bw.append(words_out[-1])
        t += dur + ln.get("gap", story.get("lineGap", 0.28))
    t += b.get("post", story.get("beatGap", 0.12))
    t = max(t, start + b.get("minDur", 1.4))
    ob = {k: v for k, v in b.items() if k not in ("lines", "sfx", "pre", "post", "minDur", "emph", "flash", "glitch")}
    ob["start"], ob["end"] = round(start, 3), round(t, 3)
    # "@wort+0.2" in Parametern -> lokale Zeit
    def wtime(ref):
        m = re.match(r"^@([^+\-]+)([+\-][\d.]+)?$", ref)
        if not m: return None
        key = m.group(1).lower(); off = float(m.group(2) or 0)
        for w in bw:
            if re.sub(r"[^\wäöüß]", "", w["text"].lower()) == key: return round(w["start"] - start + off, 3)
        raise SystemExit(f"Wort-Referenz {ref} nicht in Beat {bi} gefunden")
    def resolve(o):
        if isinstance(o, dict): return {k: resolve(v) for k, v in o.items()}
        if isinstance(o, list): return [resolve(v) for v in o]
        if isinstance(o, str) and o.startswith("@"): return wtime(o)
        return o
    ob = resolve(ob)
    for s in b.get("sfx", []):
        at = (ob["end"] - start - s["fromEnd"]) if "fromEnd" in s else resolve(s.get("at", 0)); cues.append({"name": s["name"], "t": start + at, "gain": s.get("gain", 0), "dur": s.get("dur")})
    for f in b.get("flash", []): story.setdefault("_flashes", []).append({"t": start + resolve(f.get("at", 0)), "d": f.get("d", .15), "c": f.get("c", "#fff"), "a": f.get("a", .85)})
    for g in b.get("glitch", []): story.setdefault("_glitches", []).append({"t": start + resolve(g.get("at", 0)), "d": g.get("d", .12), "a": g.get("a", 1)})
    beats_out.append(ob)
duration = round(t + story.get("tail", 1.2), 3)
beats_out[-1]["end"] = duration
beats_out[0]["start"] = 0.0

# ---------- Untertitel-Chunks ----------
maxw, maxc = story.get("chunkWords", 4), story.get("chunkChars", 21)
# Phrasen an Satzzeichen bzw. Zeilenwechsel, dann gleichmäßig auf Chunks verteilen
phrases, cur = [], []
for i, w in enumerate(words_out):
    if cur and words_out[cur[-1]]["line"] != w["line"]: phrases.append(cur); cur = []
    cur.append(i)
    if re.search(r"[.!?…,:;]$", w["text"]): phrases.append(cur); cur = []
if cur: phrases.append(cur)
from PIL import ImageFont
_CF = ImageFont.truetype(os.path.join(SCRATCH, "video", "fonts", "Montserrat.ttf"), 70)
try: _CF.set_variation_by_axes([900])
except Exception: pass
def cap_px(txt): t = txt.upper(); return _CF.getlength(t) + len(t) * 1.0
def fits(g): return len(g) <= maxw and cap_px(" ".join(words_out[i]["text"] for i in g)) <= story.get("capMaxPx", 790)
FUNC = set("der die das dem den des ein eine einen einem einer im in am an vom von vor zur zum zu nach mit hinter und aber oder auch ihr ihre unser unserem mein dein wem wer".split()) if LANG == "de" else \
       set("the a an of to in on at by for with from into and but or her his their my your our its is are was were who whom that this than".split())
from itertools import combinations
def best_split(ph):
    n = len(ph)
    for k in range(max(1, -(-n // maxw)), n + 1):
        best = None
        for cuts in combinations(range(1, n), k - 1):
            b = (0,) + cuts + (n,); groups = [ph[b[j]:b[j + 1]] for j in range(k)]
            if not all(fits(g) or len(g) == 1 for g in groups): continue
            pen = sum(3 for g in groups[:-1] if re.sub(r"[^\wäöüß]", "", words_out[g[-1]]["text"].lower()) in FUNC)
            sz = [len(g) for g in groups]; pen += max(sz) - min(sz)
            pen += sum(3 for g in groups if len(g) == 1 and n > 1)
            if best is None or pen < best[0]: best = (pen, groups)
        if best: return best[1]
    return [[i] for i in ph]
for ph in phrases:
    for g in best_split(ph): chunks.append({"words": g})
for k, ch in enumerate(chunks):
    ws = [words_out[i] for i in ch["words"]]
    ch["start"] = ws[0]["start"] - .04
    nxt = chunks[k + 1] if k + 1 < len(chunks) else None
    hold = ws[-1]["end"] + .35
    ch["end"] = min(hold, words_out[nxt["words"][0]]["start"] - .04) if nxt else hold
    if nxt and words_out[nxt["words"][0]]["start"] - ws[-1]["end"] < .5: ch["end"] = words_out[nxt["words"][0]]["start"] - .04

tl = {"series": story.get("series", "TEIL 1"), "place": story.get("place", "WHG 4B"), "duration": duration, "ui": story.get("ui", {}), "noEndFade": story.get("noEndFade", False),
      "captionY": story.get("captionY", 1250), "beats": beats_out, "words": words_out, "chunks": chunks,
      "flashes": story.get("_flashes", []), "glitches": story.get("_glitches", []), "shakes": story.get("shakes", [])}
json.dump(tl, open(f"{WD}/timeline.json", "w"), ensure_ascii=False, indent=1)

# ---------- Audio-Mix ----------
N = int(duration * SR) + SR
voice = np.zeros(N, np.float32)
for st, p, g in voice_track:
    a, _ = sf.read(p, dtype="float32"); s = int(st * SR); voice[s:s + len(a)] += a[:N - s] * 10 ** (g / 20)
def load(name):
    a, sr = sf.read(os.path.join(SFX, name if name.endswith(".wav") else name + ".wav"), dtype="float32")
    if a.ndim == 1: a = np.stack([a, a], 1)
    if sr != SR: raise SystemExit(f"{name}: sr {sr}")
    return a
fx = np.zeros((N, 2), np.float32)
for c in cues:
    a = load(c["name"]) * 10 ** (c["gain"] / 20)
    if c.get("dur"): n = int(c["dur"] * SR); a = a[:n].copy(); f = min(n, int(.3 * SR)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    s = int(c["t"] * SR); e = min(N, s + len(a)); fx[s:e] += a[:e - s]
bed = np.zeros((N, 2), np.float32)
for b in story.get("beds", []):  # {"name","fromBeat","toBeat"|"to","gain","fade"}
    fr = beats_out[b["fromBeat"]]["start"] if "fromBeat" in b else b.get("from", 0)
    to = beats_out[b["toBeat"]]["end"] if "toBeat" in b else b.get("to", duration)
    a = load(b["name"]); s = int(fr * SR); e = int(min(to, duration + 1) * SR)
    n = e - s; reps = int(np.ceil(n / len(a))); seg = np.tile(a, (reps, 1))[:n] * 10 ** (b.get("gain", -6) / 20)
    fd = int(b.get("fade", 1.0) * SR); fd = min(fd, n // 2); seg[:fd] *= np.linspace(0, 1, fd)[:, None]; seg[-fd:] *= np.linspace(1, 0, fd)[:, None]
    bed[s:e] += seg
# Ducking des Betts unter der Stimme
win = int(.05 * SR); env = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
env = np.convolve(env, np.ones(int(.3 * SR)) / int(.3 * SR), mode="same"); env = env / (env.max() + 1e-9)
duck = 10 ** (-story.get("duckDb", 7) * np.clip(env * 3, 0, 1) / 20)
mix = bed * duck[:, None] + fx + np.stack([voice, voice], 1) * 10 ** (story.get("voiceGain", 0) / 20)
mix = mix[:int(duration * SR)]
fo = int((.04 if story.get("noEndFade") else .6) * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
sf.write(f"{WD}/mix_pre.wav", mix, SR, subtype="PCM_24")
# Lautheit auf -14 LUFS (2-Pass loudnorm)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"{WD}/mix_pre.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
m = json.loads(r.stderr[r.stderr.rindex("{"):])
af = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
run("ffmpeg", "-v", "error", "-y", "-i", f"{WD}/mix_pre.wav", "-af", af, "-ar", "48000", "-c:a", "pcm_s24le", f"{WD}/mix.wav")
sf.write(f"{WD}/voice_only.wav", voice[:int(duration * SR)], SR, subtype="PCM_24")
print(f"Dauer {duration:.2f}s, {len(beats_out)} Beats, {len(words_out)} Wörter, {len(chunks)} Chunks, {len(cues)} SFX; Eingangs-LUFS {m['input_i']}")
