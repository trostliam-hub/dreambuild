import sys, sherpa_onnx, soundfile as sf, numpy as np
M=sys.argv[1]; wav=sys.argv[2]
r=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/small-encoder.int8.onnx",decoder=f"{M}/small-decoder.int8.onnx",tokens=f"{M}/small-tokens.txt",language="de",task="transcribe",num_threads=4)
a,sr=sf.read(wav,dtype="float32")
seg=int(sr*25)
for i in range(0,len(a),seg):
    s=r.create_stream(); s.accept_waveform(sr,a[i:i+seg]); r.decode_stream(s)
    print(f"[{i/sr:5.1f}s] {s.result.text}")
