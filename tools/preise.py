# -*- coding: utf-8 -*-
"""Live-Preise fuer Dreambuild.

Laeuft als GitHub Action (.github/workflows/preise.yml) alle sechs Stunden:
laedt die Produktfeeds der Partnershops, ordnet jede Zeile einem Teil aus dem
Katalog in index.html zu und schreibt

  preise.json       -- aktuelle Angebote je Teil und Shop (Preis, UVP, Versand,
                       Lager, Link, Bild)
  preisverlauf.json -- guenstigster Preis je Teil und Tag, 180 Tage

Die Feed-Adressen stehen im Repository-Secret PREIS_FEEDS, eine je Zeile:

  bike-components|https://productdata.awin.com/datafeed/download/apikey/.../fid/.../
  Bike24|https://...

Sie enthalten den persoenlichen API-Schluessel und duerfen deshalb nie in eine
Datei im Repo -- das Repo ist oeffentlich. Ohne Secret passiert nichts.

Nur Standardbibliothek, damit die Action ohne Installation laeuft.
"""
import csv, datetime, gzip, io, json, os, re, sys, urllib.request, zipfile

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
csv.field_size_limit(10 * 1024 * 1024)

# ── Katalog aus index.html lesen ─────────────────────────────────────────────
def katalog():
    s = open(os.path.join(WURZEL, "index.html"), encoding="utf-8").read()
    a = s.index("const K = {"); b = s.index("const SLOTS", a)
    k = s[a:b]
    teile = []
    # Bereich (rahmen, gabel ...) je Position merken
    bereiche = [(m.start(), m.group(1)) for m in re.finditer(r'\n([a-zA-Z]+):\[', k)]
    def bereich(pos):
        name = None
        for p, n in bereiche:
            if p <= pos: name = n
        return name
    # Form 1: Helfer-Aufrufe GB("id", "Name", "Marke", {... p:123}) und
    # IL("id", "Name", "Marke", "Welle", Gehaeuse, {g:.., p:..})
    for m in re.finditer(r'\b(?:GB|DP|ST|LK|VB|IL)\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",', k):
        ende = k.index("})", m.end())
        p = re.search(r'\bp:(\d+)', k[m.end():ende])
        teile.append({"id": m.group(1), "n": m.group(2), "m": m.group(3),
                      "p": int(p.group(1)) if p else 0, "b": bereich(m.start())})
    # Form 2: Objekte {id:"...", n:"...", m:"...", ... p:123}
    for m in re.finditer(r'\{id:"([^"]+)",\s*n:"([^"]+)",\s*m:"([^"]+)"', k):
        tiefe, i = 0, m.start()
        while True:
            c = k[i]
            if c == "{": tiefe += 1
            elif c == "}":
                tiefe -= 1
                if tiefe == 0: break
            i += 1
        # Ausfuehrungen (v:[...]) tragen eigene Aufpreise ("p:17" fuer einen
        # Adapter) -- die gehoeren nicht zum Grundpreis und fliegen vorher raus.
        obj = k[m.start():i]
        while "v:[" in obj:
            a = obj.index("v:["); t, j = 0, a + 2
            while j < len(obj):
                t += {"[": 1, "]": -1}.get(obj[j], 0)
                if t == 0: break
                j += 1
            obj = obj[:a] + obj[j + 1:]
        p = re.findall(r'\bp:(\d+)', obj)
        teile.append({"id": m.group(1), "n": m.group(2), "m": m.group(3),
                      "p": int(p[-1]) if p else 0, "b": bereich(m.start())})
    return teile

# Genau wie in der App: Zusatz hinter dem Mittelpunkt gehoert nicht zum Produktnamen
def such_name(n):
    n = n.split(" · ")[0].strip()
    n = re.sub(r'\s*\([^)]*\)\s*', " ", n)
    n = n.split(" / ")[0]                      # "Eagle 70 / S1000": der erste Name reicht
    return re.sub(r'\s+', " ", n).strip()

def normal(x):
    x = str(x).lower()
    x = re.sub(r'[×x]\s?(\d)', r' \1', x)
    x = re.sub(r'[^a-z0-9äöüß]+', " ", x)
    return re.sub(r'\s+', " ", x).strip()

# Zeilen, die zwar den Namen tragen, aber nicht das Teil sind
FREMD = ["decal", "sticker", "aufkleber", "service", "dichtung", "ersatz", "spare", "schraube", "bolt",
         "buchse", "bushing", "werkzeug", "abdeckung", "protector", "schutzfolie", "fender",
         "kappe", "gebraucht", "b ware", "gutschein"]
# Jede Teileart muss sich im Namen oder in der Shop-Kategorie zu erkennen geben --
# sonst bekaeme "SRAM GX Eagle" (Schaltwerk) den Preis des GX-Eagle-Schalthebels.
ART = {
    "rahmen":      ["rahmen", "frame", "chassis"],
    "gabel":       ["gabel", "fork"],
    "daempfer":    ["dämpfer", "daempfer", "shock", "federbein"],
    "laufraeder":  ["laufrad", "wheel"],
    "schalthebel": ["schalthebel", "trigger", "shifter", "pod", "controller", "schaltgriff"],
    "schaltwerk":  ["schaltwerk", "derailleur"],
    "kassette":    ["kassette", "cassette"],
    "kette":       ["kette", "chain"],
    "kurbel":      ["kurbel", "crank"],
    "bremsen":     ["bremse", "brake"],
    "vorbau":      ["vorbau", "stem"],
    "stuetze":     ["stütze", "stuetze", "seatpost", "dropper", "post"],
    "sattel":      ["sattel", "saddle"],
    "innenlager":  ["innenlager", "tretlager", "bottom bracket"],
    "pedale":      ["pedal"],
    "griffe":      ["griff", "grip"],
}

def ziele(teile):
    out = []
    for t in teile:
        if t["m"] in ("Generisch", "Trial", "Eigenes Teil"): continue
        name = such_name(t["n"])
        woerter = normal(name).split(" ")
        lang = [x for x in woerter if len(x) >= 3]
        if not lang: continue
        # Bandbreiten ("10-45") muessen passen -- sonst bekaeme die 10-45 den Preis der 10-51
        sp_re = r'(?<![\d.])(\d{1,2})\s*[-–]\s*(\d{2})(?!\d)'
        spannen = [" %s %s " % m for m in re.findall(sp_re, name)]
        # Versionsnummern ("Millenium 4.0", "Revive 3.0") muessen stimmen --
        # sonst bekaeme das Vorgaengermodell den Preis
        spannen += [" %s 0 " % v for v in re.findall(r'(?<![\w.,])(\d)\.0(?!\d)', name)]
        belegt = [(m.start(), m.end()) for m in re.finditer(sp_re, name)]
        # Kurze Kennungen ("xt", "ii") und kurze Zahlen ("Fox 36", "Stamp 7",
        # "Eagle 70") muessen als ganzes Wort stehen -- sonst bekaeme der Stamp 1
        # den Preis des Stamp 7. Dezimalzahlen ("2.5") zaehlen nicht, die
        # schreibt jeder Shop anders.
        kurz = [x for x in woerter if len(x) <= 2 and x.isalpha()]
        kurz += [m.group(1) for m in re.finditer(r'(?<![\w.,])(\d{1,2})(?![\w.,])', name)
                 if not any(a <= m.start() < b for a, b in belegt)]
        out.append({"id": t["id"], "w": lang, "k": kurz, "sp": spannen, "p": t["p"], "art": ART.get(t["b"]),
                    "rahmen": t["b"] == "rahmen", "erlaubt": [f for f in FREMD if f in normal(name)]})
    return out

# ── Feeds lesen ─────────────────────────────────────────────────────────────
SPALTEN = {
    "name":   ["product_name", "merchant_product_name", "productname", "name", "title"],
    "preis":  ["search_price", "display_price", "price", "store_price", "aw_price"],
    "uvp":    ["rrp_price", "rrp", "price_old", "old_price", "was_price", "base_price_amount"],
    "versand":["delivery_cost", "shipping_cost", "shipping"],
    "link":   ["aw_deep_link", "deep_link", "aw_product_link", "merchant_deep_link", "product_url"],
    "bild":   ["merchant_image_url", "aw_image_url", "image_url", "large_image"],
    "lager":  ["in_stock", "stock_status", "availability", "is_for_sale"],
    "kat":    ["merchant_category", "category_name", "product_type", "category", "merchant_product_category_path"],
}
def spalte(kopf, namen):
    for n in namen:
        if n in kopf: return kopf.index(n)
    return -1

def zahl(x):
    if x is None: return None
    x = str(x).strip().replace("EUR", "").replace("€", "").strip()
    if not x: return None
    if "," in x and "." in x: x = x.replace(".", "").replace(",", ".")
    else: x = x.replace(",", ".")
    try:
        v = float(x)
        return v if v > 0 else None
    except ValueError:
        return None

def oeffnen(quelle):
    if re.match(r'https?://', quelle, re.I):
        req = urllib.request.Request(quelle, headers={"User-Agent": "Dreambuild-Preise/1.0"})
        roh = urllib.request.urlopen(req, timeout=300)
    else:
        roh = open(quelle, "rb")
    kopf = roh.read(4)
    rest = roh
    daten = io.BufferedReader(_Vorne(kopf, rest))
    if kopf[:2] == b"\x1f\x8b":
        return io.TextIOWrapper(gzip.GzipFile(fileobj=daten), encoding="utf-8", errors="replace", newline="")
    if kopf[:2] == b"PK":
        z = zipfile.ZipFile(io.BytesIO(daten.read()))
        erste = [n for n in z.namelist() if not n.endswith("/")][0]
        return io.TextIOWrapper(z.open(erste), encoding="utf-8", errors="replace", newline="")
    return io.TextIOWrapper(daten, encoding="utf-8", errors="replace", newline="")

class _Vorne(io.RawIOBase):
    """Gibt die schon gelesenen ersten Bytes zurueck, dann den Rest des Stroms."""
    def __init__(self, vorne, rest): self.vorne, self.rest = vorne, rest
    def readable(self): return True
    def readinto(self, b):
        if self.vorne:
            n = min(len(b), len(self.vorne)); b[:n] = self.vorne[:n]; self.vorne = self.vorne[n:]; return n
        d = self.rest.read(len(b))
        if not d: return 0
        b[:len(d)] = d; return len(d)

def lies_feed(shop, quelle, zl, nach_marke):
    text = oeffnen(quelle)
    erste = text.readline()
    tr = max([",", ";", "\t", "|"], key=lambda c: erste.count(c))
    kopf = [x.strip().strip('"').lower().lstrip("﻿") for x in next(csv.reader([erste], delimiter=tr))]
    i = {k: spalte(kopf, v) for k, v in SPALTEN.items()}
    if i["name"] < 0 or i["preis"] < 0:
        print("  %s: Spalten fuer Name/Preis fehlen, uebersprungen" % shop); return {}, 0
    beste, zeilen = {}, 0
    for f in csv.reader(text, delimiter=tr):
        zeilen += 1
        if len(f) <= max(i["name"], i["preis"]): continue
        nm = f[i["name"]].strip()
        if not nm: continue
        n = normal(nm)
        preis = zahl(f[i["preis"]])
        if not preis: continue
        kat = normal(f[i["kat"]]) if 0 <= i["kat"] < len(f) else ""
        wort = " " + n + " "
        passend = []
        for erst, gruppe in nach_marke.items():
            if erst not in n: continue
            for z in gruppe:
                if not all(w in n for w in z["w"]): continue
                if not all((" " + k + " ") in wort for k in z["k"]): continue
                if not all(sp in wort for sp in z["sp"]): continue
                if any(x in n for x in FREMD if x not in z["erlaubt"]): continue
                if z["art"] and not any(a in n or a in kat for a in z["art"]): continue
                passend.append(z)
        # Passt eine Zeile auf mehrere Teile, gilt das spezifischste: "ZEB Ultimate"
        # schlaegt "ZEB", wenn beide Namen in der Zeile stecken.
        mengen = [(z, set(z["w"]) | set(z["k"]) | set(z["sp"])) for z in passend]
        for z, m in mengen:
            if any(m < m2 for _, m2 in mengen): continue
            # Preis weit weg vom Richtpreis: Set, Zubehoer oder Komplettrad
            if z["p"] and not (0.3 * z["p"] <= preis <= 1.8 * z["p"]): continue
            # Je Teil mehrere Angebote halten: "Super Deluxe Ultimate" und
            # "Super Deluxe Select+" sind dasselbe Katalogteil in zwei
            # Ausfuehrungen -- welche Ausfuehrung ein Angebot meint, liest die
            # App aus dem Namen. Groessen (Zahlen ab 26, mm, Zoll) zaehlen
            # nicht als eigene Ausfuehrung, sonst stuende jede Laenge einzeln da.
            schl = " ".join(x for x in n.split() if not ((x.isdigit() and int(x) >= 26) or x in ("mm", "zoll")))
            gruppe = beste.setdefault(z["id"], {})
            alt = gruppe.get(schl)
            if alt and (len(alt["n"]), alt["p"]) <= (len(nm), preis): continue
            uvp = zahl(f[i["uvp"]]) if i["uvp"] >= 0 and i["uvp"] < len(f) else None
            vers = zahl(f[i["versand"]]) if i["versand"] >= 0 and i["versand"] < len(f) else None
            link = f[i["link"]].strip() if i["link"] >= 0 and i["link"] < len(f) else ""
            bild = f[i["bild"]].strip() if i["bild"] >= 0 and i["bild"] < len(f) else ""
            lager = f[i["lager"]].strip().lower() if i["lager"] >= 0 and i["lager"] < len(f) else ""
            gruppe[schl] = {
                "s": shop, "p": round(preis, 2),
                "u": round(uvp, 2) if uvp and uvp > preis else None,
                "v": round(vers, 2) if vers is not None else None,
                "l": link if link.lower().startswith("https://") else "",
                "b": bild if bild.lower().startswith("https://") else "",
                "n": nm[:140],
                "a": (0 if lager in ("0", "no", "false", "out of stock", "nicht lieferbar") else 1) if lager else None,
            }
    # je Teil hoechstens acht Ausfuehrungen, die guenstigsten zuerst
    return {tid: sorted(g.values(), key=lambda a: a["p"])[:8] for tid, g in beste.items()}, zeilen

# ── Hauptteil ───────────────────────────────────────────────────────────────
def main():
    feeds = [z.strip() for z in os.environ.get("PREIS_FEEDS", "").splitlines() if z.strip() and not z.strip().startswith("#")]
    if not feeds:
        print("PREIS_FEEDS ist leer -- keine Feeds hinterlegt, nichts zu tun.")
        return
    teile = katalog()
    zl = ziele(teile)
    nach_marke = {}
    for z in zl: nach_marke.setdefault(z["w"][0], []).append(z)
    print("Katalog: %d Teile, %d Suchgruppen" % (len(zl), len(nach_marke)))

    angebote, shops = {}, []
    for nr, zeile in enumerate(feeds, 1):
        shop, _, quelle = zeile.partition("|") if "|" in zeile else ("Shop %d" % nr, "", zeile)
        shop, quelle = shop.strip(), quelle.strip()
        try:
            beste, zeilen = lies_feed(shop, quelle, zl, nach_marke)
        except Exception as e:                      # ein kaputter Feed legt nicht alles lahm
            print("  %s: Fehler beim Lesen (%s)" % (shop, type(e).__name__)); continue
        shops.append({"name": shop, "zeilen": zeilen, "treffer": len(beste)})
        print("  %s: %d Zeilen, %d Teile gefunden" % (shop, zeilen, len(beste)))
        for tid, liste in beste.items(): angebote.setdefault(tid, []).extend(liste)
    for tid in angebote: angebote[tid].sort(key=lambda a: a["p"])

    jetzt = datetime.datetime.now(datetime.timezone.utc)
    json.dump({"stand": jetzt.strftime("%Y-%m-%dT%H:%M:%SZ"), "shops": shops, "teile": angebote},
              open(os.path.join(WURZEL, "preise.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

    # Verlauf: je Tag der guenstigste Preis, 180 Tage
    pfad = os.path.join(WURZEL, "preisverlauf.json")
    try: verlauf = json.load(open(pfad, encoding="utf-8"))
    except (OSError, ValueError): verlauf = {}
    tag = jetzt.strftime("%Y-%m-%d")
    for tid, liste in angebote.items():
        reihe = verlauf.setdefault(tid, [])
        tief = liste[0]["p"]
        if reihe and reihe[-1][0] == tag: reihe[-1][1] = min(reihe[-1][1], tief)
        else: reihe.append([tag, tief])
        del reihe[:-180]
    json.dump(verlauf, open(pfad, "w", encoding="utf-8"), separators=(",", ":"))
    print("Fertig: %d Teile mit Angeboten aus %d Shops" % (len(angebote), len(shops)))

if __name__ == "__main__":
    main()
