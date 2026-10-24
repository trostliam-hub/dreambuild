# Whisper-Transkript für Bench-Clips: python3 -I asr_check.py <dir> <id> [<id> ...]
import os, sys, json, numpy as np, soundfile as sf, sherpa_onnx
from math import gcd
from scipy.signal import resample_poly
W = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); M = f"{W}/models/sherpa-onnx-whisper-small"
asr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/small-encoder.int8.onnx", decoder=f"{M}/small-decoder.int8.onnx", tokens=f"{M}/small-tokens.txt", language="en", task="transcribe", num_threads=4)
d = sys.argv[1]; lines = json.load(open(f"{d}/lines.json"))
for cid in sys.argv[2:]:
    for i, ref in enumerate(lines):
        y, sr = sf.read(f"{d}/{cid}__{i}.wav", dtype="float32")
        if y.ndim > 1: y = y.mean(1)
        g = gcd(16000, sr); x = resample_poly(y, 16000 // g, sr // g).astype(np.float32)
        x = np.concatenate([np.zeros(4000, np.float32), x, np.zeros(8000, np.float32)])
        st = asr.create_stream(); st.accept_waveform(16000, x); asr.decode_stream(st)
        print(f"{cid} {i}: {st.result.text.strip()}")
