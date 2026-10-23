# Einzelnen Satz mit der aktuellen Serien-Besetzung sprechen lassen und prüfen (für QA / Aussprache-Tests).
# Usage: python3 -I tools/line_test.py <voice> "<text>" [speed] [out.wav]
#   voice: narrator | you | mrs_hale | mr_hale | shape   (Konfiguration aus en/dwh_common.py)
# Ausgabe: Whisper-Transkript + Dauer; die WAV (48 kHz, mit derselben Effektkette wie build.py) liegt unter out.wav.
import os, sys, json, importlib.util, numpy as np, soundfile as sf, sherpa_onnx
from math import gcd
from scipy.signal import resample_poly
from pedalboard import Pedalboard, HighpassFilter, LowShelfFilter, PeakFilter, HighShelfFilter, Compressor, Reverb, Limiter, Gain
W = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SR = 48000
spec = importlib.util.spec_from_file_location("dwh_common", f"{W}/en/dwh_common.py"); dc = importlib.util.module_from_spec(spec); spec.loader.exec_module(dc)
NAMES = ("af_alloy af_aoede af_bella af_heart af_jessica af_kore af_nicole af_nova af_river af_sarah af_sky "
         "am_adam am_echo am_eric am_fenrir am_liam am_michael am_onyx am_puck am_santa "
         "bf_alice bf_emma bf_isabella bf_lily bm_daniel bm_fable bm_george bm_lewis").split()

def model_and_sids():
    src = f"{W}/models/kokoro-multi-lang-v1_0"; blends = {json.dumps(v["sid"], sort_keys=True): v["sid"] for v in dc.VOICES.values() if isinstance(v["sid"], dict)}
    dst = f"{W}/models/kokoro-mix-qa"; os.makedirs(dst, exist_ok=True)
    for f in os.listdir(src):
        if f != "voices.bin" and not os.path.exists(f"{dst}/{f}"): os.symlink(f"{src}/{f}", f"{dst}/{f}")
    V = np.fromfile(f"{src}/voices.bin", dtype=np.float32).reshape(-1, 510, 256).copy(); mix = {}
    for k, (key, m) in enumerate(sorted(blends.items())):
        slot = len(V) - 1 - k; V[slot] = sum(w * V[NAMES.index(n)] for n, w in m.items()) / sum(m.values()); mix[key] = slot
    V.tofile(f"{dst}/voices.bin")
    sid = lambda s: mix[json.dumps(s, sort_keys=True)] if isinstance(s, dict) else (NAMES.index(s) if isinstance(s, str) else s)
    return dst, sid

def fx(a, sr, deep, style):  # wie build.py voice_fx
    src = int(round(sr * deep)); g = gcd(SR, src); y = resample_poly(a, SR // g, src // g).astype(np.float32)
    if style == "clean":
        f = [HighpassFilter(60), LowShelfFilter(cutoff_frequency_hz=150, gain_db=1.5), Compressor(threshold_db=-18, ratio=2.0, attack_ms=10, release_ms=150), Gain(7), Limiter(threshold_db=-3.0, release_ms=80), Gain(-1.5)]
    else:
        f = [HighpassFilter(70), LowShelfFilter(cutoff_frequency_hz=140, gain_db=3.5), PeakFilter(320, -2.5, 1.0), PeakFilter(2800, 2.5, 0.9), HighShelfFilter(9000, -2.0),
             Compressor(threshold_db=-20, ratio=3.2, attack_ms=6, release_ms=120), Gain(4)]
        f += [HighShelfFilter(6500, -2.0), Reverb(room_size=0.4, damping=0.6, wet_level=0.13, dry_level=0.92, width=0.0)] if style == "entity" else [Reverb(room_size=0.22, damping=0.7, wet_level=0.09, dry_level=0.95, width=0.0)]
        f += [Limiter(threshold_db=-3.0, release_ms=80), Gain(-1.5)]
    y = Pedalboard(f)(y, SR); return (y[0] if y.ndim > 1 else y).astype(np.float32)

if __name__ == "__main__":
    voice, text = sys.argv[1], sys.argv[2]; v = dc.VOICES[voice]
    speed = float(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] else v.get("speed", 1.0)
    out = sys.argv[4] if len(sys.argv) > 4 else f"{W}/qa/line_test.wav"; os.makedirs(os.path.dirname(out), exist_ok=True)
    K, sid = model_and_sids()
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
        model=f"{K}/model.onnx", voices=f"{K}/voices.bin", tokens=f"{K}/tokens.txt", data_dir=f"{K}/espeak-ng-data", lexicon=f"{K}/lexicon-us-en.txt", dict_dir=f"{K}/dict"), num_threads=2)))
    g = tts.generate(text, sid=sid(v["sid"]), speed=speed); y = fx(np.array(g.samples, dtype=np.float32), g.sample_rate, v.get("deep", 1.0), v.get("style", "clean"))
    sf.write(out, y, SR, subtype="PCM_24")
    M = f"{W}/models/sherpa-onnx-whisper-small"
    asr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/small-encoder.int8.onnx", decoder=f"{M}/small-decoder.int8.onnx", tokens=f"{M}/small-tokens.txt", language="en", task="transcribe", num_threads=2)
    x = resample_poly(y, 1, 3).astype(np.float32); x = np.concatenate([np.zeros(4000, np.float32), x, np.zeros(8000, np.float32)])
    st = asr.create_stream(); st.accept_waveform(16000, x); asr.decode_stream(st)
    print(json.dumps({"voice": voice, "text": text, "speed": speed, "dur": round(len(y) / SR, 2), "asr": st.result.text.strip(), "wav": out}))
