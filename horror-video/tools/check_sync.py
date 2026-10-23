# Prüft Untertitel-Sync: transkribiert die Stimme in jedem Untertitel-Fenster und vergleicht mit dem angezeigten Text
import sys, json, re, numpy as np, soundfile as sf, sherpa_onnx
from scipy.signal import resample_poly
WD, M, lang = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else "en")
tl = json.load(open(f"{WD}/timeline.json")); v, sr = sf.read(f"{WD}/voice_only.wav", dtype="float32")
r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/small-encoder.int8.onnx", decoder=f"{M}/small-decoder.int8.onnx", tokens=f"{M}/small-tokens.txt", language=lang, task="transcribe", num_threads=4)
norm = lambda s: re.sub(r"[^a-z0-9äöüß ]", " ", s.lower()).split()
bad = 0
for k, ch in enumerate(tl["chunks"]):
    ws = [tl["words"][i] for i in ch["words"]]; ref = " ".join(w["text"] for w in ws)
    a, b = int(max(0, ws[0]["start"] - .05) * sr), int((ws[-1]["end"] + .08) * sr)
    x = resample_poly(v[a:b], 1, 3).astype(np.float32); x = np.concatenate([np.zeros(3200, np.float32), x, np.zeros(6400, np.float32)])
    st = r.create_stream(); st.accept_waveform(16000, x); r.decode_stream(st); hyp = st.result.text.strip()
    import difflib
    sim = difflib.SequenceMatcher(None, "".join(norm(ref)), "".join(norm(hyp))).ratio()
    if sim < .5: bad += 1; print(f"#{k:02d} {ws[0]['start']:6.2f}s sim {sim:.2f} SHOW: {ref:32s} | HEARD: {hyp}")
print(f"{bad} von {len(tl['chunks'])} Chunks auffällig")
