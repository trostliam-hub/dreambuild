# Transkribiert jeden Beat im Zusammenhang aus voice_only.wav
import sys, json, re, subprocess, numpy as np, soundfile as sf, sherpa_onnx
WD, M = sys.argv[1], sys.argv[2]
tl = json.load(open(f"{WD}/timeline.json"))
r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/small-encoder.int8.onnx", decoder=f"{M}/small-decoder.int8.onnx", tokens=f"{M}/small-tokens.txt", language="de", task="transcribe", num_threads=4)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{WD}/voice_only.wav", "-ar", "16000", "-ac", "1", f"{WD}/v16.wav"], check=True)
a, sr = sf.read(f"{WD}/v16.wav", dtype="float32")
for i, b in enumerate(tl["beats"]):
    ws = [w["text"] for w in tl["words"] if w["beat"] == i]
    if not ws: continue
    seg = a[int(b["start"] * sr):int(b["end"] * sr)]
    s = r.create_stream(); s.accept_waveform(sr, np.concatenate([np.zeros(3200, np.float32), seg, np.zeros(8000, np.float32)])); r.decode_stream(s)
    print(f"{i:02d} REF: {' '.join(ws)}\n   ASR: {s.result.text.strip()}")
