# Aussprache-Test einzelner Gedenk-Namen mit der echten build.py-Stimme (narrator, speed 0.97)
import sys
S = sys.argv[1]
src = open(f"{S}/tools/build.py").read(); src = src[:src.index("# ---------- Layout ----------")]
sys.argv = ["x", f"{S}/en/btk_part5.json", f"{S}/en/btk5_nt"]
g = {"__file__": f"{S}/tools/build.py", "__name__": "exp"}; exec(src, g)
for text, say in [("Vicki Wegerle.", "Vicki Wegg-er-lee."), ("Vicki Wegerle.", "Vicki Weg-er-lee."), ("Joseph Otero,", "Joseph Oh-tair-oh,"),
                  ("Shirley Vian.", "Shirley Vee-an.")]:
    p = g["tts_clip"](text, "narrator", 0.97, say)
    print("RESULT", text, "|", say, "|", g["TAKES_LOG"][-1])
