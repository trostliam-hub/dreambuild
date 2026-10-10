"""Module des Beispielrads (BEVEL-002): welches Objekt zu welcher Teile-Kategorie
der App gehoert. Der GLB-Export schreibt das als glTF-"extras" an jeden Knoten:
  crankscore_slot -- Schluessel wie in der App (rahmen, gabel, bremsen ...)
  generisch       -- true: allgemeine Bauform in echten Massen, kein bestimmtes
                     Produkt (alles ausser dem Rahmen)
So kann der 3D-Betrachter eine Baugruppe hervorheben, ohne Namen zu raten."""
import re

# Reihenfolge zaehlt: der erste passende Anfang gewinnt
REGELN = [
    (r"^(Rahmen|Hinterbau|Hebel|Lager_)", "rahmen"),
    (r"^Daempfer", "daempfer"),
    (r"^Gabel_(?!schaft)", "gabel"),
    (r"^Reifen_vorn", "reifenVR"),
    (r"^Reifen_hinten", "reifenHR"),
    (r"^(Felge|Nabe|Speichen)", "laufraeder"),
    (r"^(Bremsscheibe|Bremssattel|Bremshebel|Geberzylinder|Bremsleitung)", "bremsen"),
    (r"^Kassette", "kassette"),
    (r"^Kette(?!nblatt|nfuehrung)", "kette"),
    (r"^(Schaltwerk|Schaltrolle|Schaltzug)", "schaltwerk"),
    (r"^Tretlager", "innenlager"),
    (r"^(Kurbel|Kettenblatt|Kettenfuehrung|Bashguard)", "kurbel"),
    (r"^Pedal", "pedale"),
    (r"^Griff", "griffe"),
    (r"^Lenker", "lenker"),
    (r"^(Vorbau|Spacer|Gabelschaft)", "vorbau"),
    (r"^Steuersatz", "steuersatz"),
    (r"^Sattel", "sattel"),
    (r"^Stuetze", "stuetze"),
]

def slot_von(name):
    for muster, slot in REGELN:
        if re.match(muster, name):
            return slot
    return None

def markieren(objekte):
    """Setzt die Eigenschaften an allen Objekten; gibt {slot: anzahl} und die Liste ohne Zuordnung zurueck."""
    zahl, ohne = {}, []
    for ob in objekte:
        s = slot_von(ob.name)
        if not s:
            if ob.type == "MESH": ohne.append(ob.name)
            continue
        ob["crankscore_slot"] = s
        ob["generisch"] = s != "rahmen"
        zahl[s] = zahl.get(s, 0) + 1
    return zahl, ohne
