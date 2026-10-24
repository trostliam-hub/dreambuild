# Stimmen-Vergleich 2: Kokoro (bisherige Erzählerstimme + Varianten) gegen Supertonic 3 (10 feste Stimmen).
# Usage: python3 -I voice_bench2.py <outdir> [kokoro|supertonic|all]
# Ausgabe: <outdir>/<id>__<i>.wav + lines.json (Format wie voice_bench.py, Auswertung mit voice_score.py)
import os, sys, json, time, numpy as np, soundfile as sf, sherpa_onnx
HERE = os.path.dirname(os.path.abspath(__file__)); W = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from voice_bench import build_mix, tts as kokoro_tts, MIX, SRC, SID
ST = f"{W}/models/supertonic3"
LINES = ["January fifteenth, nineteen seventy-four. Wichita, Kansas. You are twenty-eight years old, and nobody ever looks at you twice.",
         "You have a wife, a baby boy, and a job installing security alarms in other people's homes.",
         "That morning, you walk out of a small house on Edgemoor Road. Four people inside never walk out again.",
         "Now you're officially a murderer. And the strangest part is how normal you feel at dinner that night.",
         "Thirty-one years later, you ask the police one simple question. They give you an answer. It's a lie."]

def supertonic():
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(supertonic=sherpa_onnx.OfflineTtsSupertonicModelConfig(
        duration_predictor=f"{ST}/duration_predictor.int8.onnx", text_encoder=f"{ST}/text_encoder.int8.onnx",
        vector_estimator=f"{ST}/vector_estimator.int8.onnx", vocoder=f"{ST}/vocoder.int8.onnx", tts_json=f"{ST}/tts.json",
        unicode_indexer=f"{ST}/unicode_indexer.bin", voice_style=f"{ST}/voice.bin"), num_threads=4, provider="cpu"))
    return sherpa_onnx.OfflineTts(cfg)

def st_generate(T, text, sid, speed, steps):
    g = sherpa_onnx.GenerationConfig(); g.sid = sid; g.num_steps = steps; g.speed = speed; g.extra["lang"] = "en"
    a = T.generate(text, g); return np.array(a.samples, dtype=np.float32), a.sample_rate

if __name__ == "__main__":
    out = sys.argv[1]; which = sys.argv[2] if len(sys.argv) > 2 else "all"
    os.makedirs(out, exist_ok=True); json.dump(LINES, open(f"{out}/lines.json", "w"))
    if which in ("kokoro", "all"):
        cands = [{"id": "k_cur_liamonyx", "voice": {"am_liam": 0.6, "am_onyx": 0.4}, "speed": 1.08},
                 {"id": "k_michael", "voice": "am_michael", "speed": 1.05},
                 {"id": "k_onyxmich", "voice": {"am_onyx": 0.5, "am_michael": 0.5}, "speed": 1.05},
                 {"id": "k_george", "voice": "bm_george", "speed": 1.02},
                 {"id": "k_fenrir", "voice": "am_fenrir", "speed": 1.05},
                 {"id": "k_puck", "voice": "am_puck", "speed": 1.05}]
        blends = {json.dumps(c["voice"], sort_keys=True): c["voice"] for c in cands if isinstance(c["voice"], dict)}
        mix_sid = build_mix(blends); T = kokoro_tts(MIX)
        for c in cands:
            sid = mix_sid[json.dumps(c["voice"], sort_keys=True)] if isinstance(c["voice"], dict) else SID[c["voice"]]
            t0 = time.time()
            for i, line in enumerate(LINES):
                p = f"{out}/{c['id']}__{i}.wav"
                if os.path.exists(p): continue
                g = T.generate(line, sid=sid, speed=c["speed"]); sf.write(p, np.array(g.samples, dtype=np.float32), g.sample_rate)
            print(c["id"], f"{time.time() - t0:.1f}s", flush=True)
    if which in ("supertonic", "all"):
        T = supertonic()
        combos = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else [[sid, 1.0, 10] for sid in range(10)]  # [[sid, speed, steps], ...]
        for sid, speed, steps in combos:
            if True:
                cid = f"s_{sid}_{int(round(speed * 100))}_{steps}"; t0 = time.time()
                for i, line in enumerate(LINES):
                    p = f"{out}/{cid}__{i}.wav"
                    if os.path.exists(p): continue
                    y, sr = st_generate(T, line, sid, speed, steps); sf.write(p, y, sr)
                print(cid, f"{time.time() - t0:.1f}s", flush=True)
