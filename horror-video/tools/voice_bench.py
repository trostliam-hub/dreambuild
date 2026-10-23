# Stimmen-Vergleich: erzeugt dieselben Erzähler-Sätze mit vielen Kokoro-Einstellungen (Stimme, Mischung, Tempo).
# Usage: voice_bench.py <outdir> <candidates.json>
#   candidates.json: [{"id": "onyx_092", "voice": "am_onyx" | {"am_fenrir": .6, "am_michael": .4}, "speed": 0.92}, ...]
# Gemischte Stimmen landen als zusätzliche Sprecher in einer Kopie von voices.bin (models/kokoro-mix).
import os, sys, json, numpy as np, soundfile as sf, sherpa_onnx
HERE = os.path.dirname(os.path.abspath(__file__)); W = os.path.dirname(HERE)
SRC = f"{W}/models/kokoro-multi-lang-v1_0"; MIX = f"{W}/models/kokoro-mix"
NAMES = ("af_alloy af_aoede af_bella af_heart af_jessica af_kore af_nicole af_nova af_river af_sarah af_sky "
         "am_adam am_echo am_eric am_fenrir am_liam am_michael am_onyx am_puck am_santa "
         "bf_alice bf_emma bf_isabella bf_lily bm_daniel bm_fable bm_george bm_lewis").split()
SID = {n: i for i, n in enumerate(NAMES)}
LINES = ["Something is standing over the crib.",
         "Eleven forty. You're babysitting, alone downstairs. Wren sleeps right above you. The Hales are at a wedding.",
         "It never told you to leave. It told you to be quiet.",
         "On her live feed, its head turns. Slowly. Down. Toward you.",
         "Remember when you shut your eyes? It stood beside you. Waiting for you to sleep too."]

def build_mix(blends):
    """voices.bin + gemischte Stimmen anhängen; gibt {key: sid} zurück."""
    V = np.fromfile(f"{SRC}/voices.bin", dtype=np.float32).reshape(-1, 510, 256).copy()
    sids = {}  # Sprecherzahl steht im Modell fest: Mischungen ersetzen die letzten (nicht-englischen) Plätze
    for k, (key, mix) in enumerate(blends.items()):
        slot = len(V) - 1 - k; assert slot >= len(NAMES)
        V[slot] = sum(w * V[SID[n]] for n, w in mix.items()) / sum(mix.values()); sids[key] = slot
    os.makedirs(MIX, exist_ok=True)
    for f in os.listdir(SRC):
        if f != "voices.bin" and not os.path.exists(f"{MIX}/{f}"): os.symlink(f"{SRC}/{f}", f"{MIX}/{f}")
    V.astype(np.float32).tofile(f"{MIX}/voices.bin")
    return sids

def tts(model_dir):
    K = model_dir
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
        model=f"{K}/model.onnx", voices=f"{K}/voices.bin", tokens=f"{K}/tokens.txt", data_dir=f"{K}/espeak-ng-data",
        lexicon=f"{K}/lexicon-us-en.txt", dict_dir=f"{K}/dict"), num_threads=4))  # wie build.py
    return sherpa_onnx.OfflineTts(cfg)

if __name__ == "__main__":
    out, cands = sys.argv[1], json.load(open(sys.argv[2]))
    if len(sys.argv) > 3: LINES = json.load(open(sys.argv[3]))  # eigene Sätze (z. B. für Nebenrollen)
    os.makedirs(out, exist_ok=True); json.dump(LINES, open(f"{out}/lines.json", "w"))
    blends = {json.dumps(c["voice"], sort_keys=True): c["voice"] for c in cands if isinstance(c["voice"], dict)}
    mix_sid = build_mix(blends) if blends else {}
    T = tts(MIX if blends else SRC)
    for c in cands:
        sid = mix_sid[json.dumps(c["voice"], sort_keys=True)] if isinstance(c["voice"], dict) else SID[c["voice"]]
        for i, line in enumerate(LINES):
            p = f"{out}/{c['id']}__{i}.wav"
            if os.path.exists(p): continue
            g = T.generate(line, sid=sid, speed=c["speed"])
            sf.write(p, np.array(g.samples, dtype=np.float32), g.sample_rate)
        print(c["id"], flush=True)
