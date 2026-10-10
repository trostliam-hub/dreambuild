# -*- coding: utf-8 -*-
"""Offline-Test fuer tools/preise.py (BEVEL-002): ein kleiner Feed als Datei,
kein Netz. Prueft Zuordnung, Umfang bei Bremsen (Set, vorn, hinten), Versand,
https-Pflicht und den Preisfilter. Aufruf: python3 tools/preise-test.py"""
import os, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import preise

FEED = """product_name;search_price;rrp_price;delivery_cost;aw_deep_link;merchant_image_url;in_stock;merchant_category
Shimano XT BR-M8120 Scheibenbremse Set vorne und hinten;329,00;399,00;0;https://shop.example/xt-set;https://shop.example/xt.jpg;1;Bremsen
Shimano XT BR-M8120 Scheibenbremse Vorderrad;169,00;199,00;3,95;https://shop.example/xt-vr;;1;Bremsen
Shimano XT BR-M8120 Scheibenbremse Hinterrad;175,00;;;https://shop.example/xt-hr;;0;Bremsen
Shimano XT BR-M8120 Bremse Aufkleber;9,00;;;https://shop.example/sticker;;1;Zubehoer
RockShox Pike Ultimate Federgabel 29 140 mm;899,00;1049,00;0;http://shop.example/unsicher;;1;Gabeln
"""
fehler = []
def ok(name, bed, info=""):
    print(("  ok   " if bed else "  FEHL ") + name + ("" if bed else "  " + str(info)))
    if not bed: fehler.append(name)

ok("Umfang: Set", preise.umfang("Shimano XT Bremse Set vorne und hinten") == "set")
ok("Umfang: vorn", preise.umfang("Shimano XT Bremse Vorderrad") == "vorn")
ok("Umfang: hinten", preise.umfang("Magura MT5 rear brake") == "hinten")
ok("Umfang: offen", preise.umfang("Shimano XT M8120 Scheibenbremse") is None)

teile = preise.katalog()
zl = preise.ziele(teile)
nach_marke = {}
for z in zl: nach_marke.setdefault(z["w"][0], []).append(z)
with tempfile.TemporaryDirectory() as d:
    pfad = os.path.join(d, "feed.csv")
    open(pfad, "w", encoding="utf-8").write(FEED)
    beste, zeilen = preise.lies_feed("Testshop", pfad, zl, nach_marke)
ok("Feed gelesen", zeilen == 5, zeilen)
xt = beste.get("b-xt", [])
ume = sorted((a.get("z") or "-") for a in xt)
ok("Bremse: Set, vorn und hinten getrennt", ume == ["hinten", "set", "vorn"], ume)
set_ = [a for a in xt if a.get("z") == "set"]
ok("Set: Preis, UVP, Versand 0, Link, Bild", bool(set_) and set_[0]["p"] == 329 and set_[0]["u"] == 399 and set_[0]["v"] == 0 and set_[0]["l"].startswith("https://") and set_[0]["b"], set_)
hr = [a for a in xt if a.get("z") == "hinten"]
ok("Hinterrad: nicht lieferbar, Versand unbekannt", bool(hr) and hr[0]["a"] == 0 and hr[0]["v"] is None, hr)
ok("Aufkleber nicht als Bremse", all("Aufkleber" not in a["n"] for a in xt))
pike = beste.get("g-pike", [])
ok("http-Link wird verworfen", bool(pike) and pike[0]["l"] == "", pike)
print("\nPREISE: %d Fehler" % len(fehler))
sys.exit(1 if fehler else 0)
