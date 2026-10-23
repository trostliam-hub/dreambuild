# Bewertet Stimmproben: UTMOS (vorhergesagte Natürlichkeit 1-5), Tonhöhe (Median/Spanne in Halbtönen),
# Sprechtempo (Wörter pro Minute ohne Rand-Stille), Pausenanteil. Läuft im venv mit torch.
# Usage: voice_score.py <wavdir> <out.json> [utmos_src_dir]
import os, sys, json, glob, numpy as np, soundfile as sf, torch, librosa
sys.path.insert(0, sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "utmos_src"))
from speechmos.utmos22.strong.model import UTMOS22Strong
URL = "https://github.com/tarepan/SpeechMOS/releases/download/v1.0.0/utmos22_strong_step7459_v1.pt"

def load_model():
    m = UTMOS22Strong(); m.load_state_dict(torch.hub.load_state_dict_from_url(URL, map_location="cpu", progress=False)); m.eval(); return m

def metrics(y, sr, text):
    yt, idx = librosa.effects.trim(y, top_db=38); dur = len(yt) / sr
    f0, vf, _ = librosa.pyin(yt, fmin=55, fmax=400, sr=sr, frame_length=1024)
    f = f0[vf & ~np.isnan(f0)]
    st = 12 * np.log2(f / np.median(f)) if len(f) else np.array([0.0])
    iv = librosa.effects.split(yt, top_db=38); speech = sum(b - a for a, b in iv) / sr
    words = len(text.split())
    return {"f0_med": float(np.median(f)) if len(f) else 0.0, "f0_range_st": float(np.percentile(st, 95) - np.percentile(st, 5)),
            "f0_std_st": float(np.std(st)), "wpm": 60 * words / dur, "wpm_speech": 60 * words / max(speech, .1), "pause_frac": 1 - speech / dur, "dur": dur}

if __name__ == "__main__":
    wd, out = sys.argv[1], sys.argv[2]
    torch.set_num_threads(4); M = load_model(); LINES = json.load(open(f"{wd}/lines.json"))
    res = {}
    for p in sorted(glob.glob(f"{wd}/*__*.wav")):
        cid, i = os.path.basename(p)[:-4].rsplit("__", 1); i = int(i)
        y, sr = sf.read(p, dtype="float32")
        if y.ndim > 1: y = y.mean(1)
        with torch.no_grad(): mos = float(M(torch.from_numpy(y)[None], sr)[0])
        r = metrics(y, sr, LINES[i]); r["utmos"] = mos
        res.setdefault(cid, {})[i] = r
    summ = {}
    for cid, d in res.items():
        keys = d[next(iter(d))].keys()
        summ[cid] = {k: round(float(np.mean([d[i][k] for i in d])), 3) for k in keys}
        summ[cid]["utmos_min"] = round(min(d[i]["utmos"] for i in d), 3)
    json.dump({"per_line": res, "summary": summ}, open(out, "w"), indent=1)
    for cid, s in sorted(summ.items(), key=lambda kv: -kv[1]["utmos"]):
        print(f"{cid:16s} UTMOS {s['utmos']:.2f} (min {s['utmos_min']:.2f})  F0 {s['f0_med']:5.0f} Hz  range {s['f0_range_st']:4.1f} st  {s['wpm']:5.0f} wpm  pauses {s['pause_frac']:.2f}")
