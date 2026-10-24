# Aussprache-Test für Namen mit Supertonic (Stimme 8): python3 -I name_test.py <outdir>
import os, sys, json, numpy as np, soundfile as sf, sherpa_onnx
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from voice_bench2 import supertonic, st_generate
from math import gcd
from scipy.signal import resample_poly
W = os.path.dirname(HERE); M = f"{W}/models/sherpa-onnx-whisper-small"
LINES = ["Dennis Rader.", "Dennis Ray-der.", "The Otero family.", "The Oh-tair-oh family.", "Wichita, Kansas.", "Park City, Kansas.",
         "Hinterkaifeck.", "Hinter-kai-feck.", "Hinter-kye-feck.", "The farm near Gröbern and Waidhofen.", "Lorenz Schlittenbauer.", "Lorenz Shlitten-bower.",
         "Andreas Gruber.", "Cäzilia Gruber.", "Tseh-tsee-lee-ah Gruber.", "Viktoria Gabriel.", "Maria Baumgartner.", "Josef.", "Kathryn Bright.", "Shirley Vian.",
         "Nancy Fox.", "Marine Hedge.", "Vicki Wegerle.", "Dolores Davis.", "Lieutenant Ken Landwehr.", "KSAS Fox twenty-four.", "K-S-A-S, Fox twenty-four.", "Christ Lutheran Church."]
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
T = supertonic()
asr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/small-encoder.int8.onnx", decoder=f"{M}/small-decoder.int8.onnx", tokens=f"{M}/small-tokens.txt", language="en", task="transcribe", num_threads=4)
for i, line in enumerate(LINES):
    y, sr = st_generate(T, line, 8, 1.05, 10); sf.write(f"{out}/n{i:02d}.wav", y, sr)
    g = gcd(16000, sr); x = resample_poly(y, 16000 // g, sr // g).astype(np.float32); x = np.concatenate([np.zeros(4000, np.float32), x, np.zeros(8000, np.float32)])
    st = asr.create_stream(); st.accept_waveform(16000, x); asr.decode_stream(st)
    print(f"{i:02d} {line!r:45s} -> {st.result.text.strip()}  ({len(y)/sr:.2f}s)")
