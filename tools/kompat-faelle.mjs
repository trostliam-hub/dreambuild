/* Testfaelle fuer tools/kompat-test.mjs.
 *
 * teile: Slot -> Katalog-Id oder [Id, {Dimension: Wert}] fuer eine Ausfuehrung
 * rot / gelb / hinweis: Befund-Titel, die genau auf dieser Stufe kommen MUESSEN
 * nicht: Titel, die gar nicht kommen duerfen
 * ampel: Gesamturteil "gruen" | "gelb" | "rot" (ignoriere: gelbe Titel, die
 *        dafuer nicht zaehlen, etwa "Aufbau unvollständig" bei Teil-Aufbauten)
 * jahr: Modelljahr des Rahmens (wichtig fuer UDH ab Modelljahr X)
 *
 * Quellen der Normen: SRAM UDH- und Transmission-Kompatibilitaet, Shimano- und
 * SRAM-Freilaufnormen (HG, Micro Spline, XD), Achsnormen 135/142/148/150/157,
 * Innenlager BSA 68/73/83, PressFit 92/107, PF30, Wellen 24 mm (Hollowtech II),
 * DUB (28,99 mm), 30 mm, PowerSpline, ISIS. Rahmendaten recherchiert 2026-10-01
 * (Hersteller, Vital MTB, Pinkbike, Bikerumor).
 */
const UNV = "Aufbau unvollständig";
const UDH = "Transmission braucht ein UDH-Ausfallende";
const HA = "Hinterachse passt nicht", HA_KIT = "Hinterachse nur mit Umbaukit", VA = "Vorderachse passt nicht";
const FL = "Freilaufkörper passt nicht zur Kassette";
const IL_GEH = "Innenlager passt nicht ins Tretlagergehäuse", IL_WELLE = "Kurbelwelle passt nicht ins Innenlager";
const KL = "Kettenlinie stimmt nicht";

export const FAELLE = [
  /* ── SRAM UDH / Transmission ── */
  {name:"UDH: Trek Fuel EX + X0 Transmission passt", teile:{rahmen:"f-fuelex", schaltwerk:"sw-x0t"}, nicht:[UDH]},
  {name:"UDH: Radon Swoop (kein UDH) + X0 Transmission ist rot", teile:{rahmen:"f-sentinel", schaltwerk:"sw-x0t"}, rot:[UDH]},
  {name:"UDH: Shimano XT am Rahmen ohne UDH ist kein UDH-Fall", teile:{rahmen:"f-sentinel", schaltwerk:"sw-xt"}, nicht:[UDH]},
  {name:"UDH: Propain Tyee 2022 (UDH erst ab 2023) + Transmission ist rot", jahr:2022, teile:{rahmen:"f-tyee", schaltwerk:"sw-gxt"}, rot:[UDH]},
  {name:"UDH: Propain Tyee 2023 + Transmission passt", jahr:2023, teile:{rahmen:"f-tyee", schaltwerk:"sw-gxt"}, nicht:[UDH]},
  {name:"UDH: Trek Session (UDH laut Trek) + Transmission passt", sel:["dh"], teile:{rahmen:"f-session", schaltwerk:"sw-x0t"}, nicht:[UDH]},
  {name:"UDH: Santa Cruz V10 8 (kein UDH) + Transmission ist rot", sel:["dh"], teile:{rahmen:"f-v10", schaltwerk:"sw-x0t"}, rot:[UDH]},
  {name:"UDH: Commencal Meta SX 2022 + Transmission ist rot", jahr:2022, sel:["enduro"], teile:{rahmen:"f-metasx", schaltwerk:"sw-x0t"}, rot:[UDH]},
  {name:"UDH: Commencal Meta SX V5 2023 + Transmission passt", jahr:2023, sel:["enduro"], teile:{rahmen:"f-metasx", schaltwerk:"sw-x0t"}, nicht:[UDH]},
  {name:"UDH: Specialized Enduro 2024 + Transmission ist rot", jahr:2024, sel:["enduro"], teile:{rahmen:"f-enduro", schaltwerk:"sw-x0t"}, rot:[UDH]},
  {name:"UDH: Specialized Enduro 2025 + Transmission passt", jahr:2025, sel:["enduro"], teile:{rahmen:"f-enduro", schaltwerk:"sw-x0t"}, nicht:[UDH]},
  {name:"UDH: Transition Sentinel 2023 (Carbon ohne UDH) ist rot", jahr:2023, teile:{rahmen:"f-sentinel2", schaltwerk:"sw-e70"}, rot:[UDH]},
  {name:"UDH: Transition Sentinel V3 2024 passt", jahr:2024, teile:{rahmen:"f-sentinel2", schaltwerk:"sw-e70"}, nicht:[UDH]},
  {name:"UDH: Canyon Sender CFR 2025 (neue Generation, UDH) passt", jahr:2025, sel:["dh"], teile:{rahmen:"f-sender", schaltwerk:"sw-x0t"}, nicht:[UDH]},
  {name:"Transmission + Eagle-Kassette (kein T-Type) ist rot", teile:{schaltwerk:"sw-x0t", kassette:"ka-gx"}, rot:["Transmission braucht eine T-Type-Kassette"]},
  {name:"T-Type-Kassette + GX Eagle (ohne Transmission) ist rot", teile:{schaltwerk:"sw-gx", kassette:"ka-xs1295"}, rot:["T-Type-Kassette nur mit Transmission"]},
  {name:"Transmission + normale 12-fach-Kette ist rot", teile:{schaltwerk:"sw-x0t", kette:"ke-gx"}, rot:["Transmission braucht die Flattop-Kette"]},
  {name:"Transmission + Flattop-Kette passt", teile:{schaltwerk:"sw-x0t", kette:"ke-flattopx0"}, nicht:["Transmission braucht die Flattop-Kette", "Kette passt nicht zum Schaltwerk"]},

  /* ── Hinterachse: 135 / 142 / 148 Boost / 150 / 157 Super Boost ── */
  {name:"Achse: 148 Boost Rahmen + 148 Laufrad passt", teile:{rahmen:"f-fuelex", laufraeder:"w-dtm1900"}, nicht:[HA, HA_KIT]},
  {name:"Achse: 148 Boost Rahmen + 157 Super Boost Laufrad ist rot", teile:{rahmen:"f-fuelex", laufraeder:"w-dtsb1700"}, rot:[HA]},
  {name:"Achse: 157 Pivot Trail 429 + 157 Laufrad passt", teile:{rahmen:"f-trail429", laufraeder:"w-dtsb1700"}, nicht:[HA]},
  {name:"Achse: 157 Pivot Trail 429 + 148 Laufrad ist rot", teile:{rahmen:"f-trail429", laufraeder:"w-dtm1900"}, rot:[HA]},
  {name:"Achse: Supreme DH V5 (157) + Hope 150 ist gelb (Commencal-Umbaukit)", sel:["dh"], teile:{rahmen:"f-supreme", laufraeder:["w-hopemx", {Nabenbreite:"150x12"}]}, gelb:[HA_KIT], nicht:[HA]},
  {name:"Achse: Supreme DH V5 (157) + Hope 157 passt", sel:["dh"], teile:{rahmen:"f-supreme", laufraeder:["w-hopemx", {Nabenbreite:"157x12"}]}, nicht:[HA, HA_KIT]},
  {name:"Achse: Supreme DH V5 (157) + Hope 148 ist rot (kein Kit)", sel:["dh"], teile:{rahmen:"f-supreme", laufraeder:["w-hopemx", {Nabenbreite:"148x12"}]}, rot:[HA]},
  {name:"Achse: Canyon Sender 2025 (148) + 157-DH-Laufrad ist rot", jahr:2025, sel:["dh"], teile:{rahmen:"f-sender", laufraeder:"w-dtfr29"}, rot:[HA]},
  {name:"Achse: Dirt 135x10 + 142x12 Laufrad ist rot", sel:["dirt"], teile:{rahmen:"f-absolut", laufraeder:"w-dirt26"}, rot:[HA]},
  {name:"Achse: Dirt 135x10 + 135x10 Laufrad passt", sel:["dirt"], teile:{rahmen:"f-absolut", laufraeder:"w-dirt26qr"}, nicht:[HA]},
  {name:"Vorderachse: Fox 38 (15 mm) + DH-Laufrad 20 mm ist rot", teile:{gabel:"g-fox38", laufraeder:"w-dtfr29"}, rot:[VA]},
  {name:"Vorderachse: Fox 40 (20 mm) + DH-Laufrad 20 mm passt", sel:["dh"], teile:{gabel:"g-fox40", laufraeder:"w-dtfr29"}, nicht:[VA]},

  /* ── Freilauf: HG / Micro Spline / XD ── */
  {name:"Freilauf: Micro Spline Laufrad + Shimano XT 12-fach passt", teile:{laufraeder:"w-dtxm1700", kassette:"ka-xt"}, nicht:[FL]},
  {name:"Freilauf: XD Laufrad + Shimano Micro Spline Kassette ist rot", teile:{laufraeder:"w-dtex", kassette:"ka-xt"}, rot:[FL]},
  {name:"Freilauf: XD Laufrad + SRAM GX Eagle passt", teile:{laufraeder:"w-dtex", kassette:"ka-gx"}, nicht:[FL]},
  {name:"Freilauf: HG Laufrad + SRAM GX Eagle (XD) ist rot", teile:{laufraeder:"w-dtm1900", kassette:"ka-gx"}, rot:[FL]},
  {name:"Freilauf: gleiches Laufrad mit XD-Freilauf + GX Eagle passt", teile:{laufraeder:["w-dtm1900", {Freilauf:"XD"}], kassette:"ka-gx"}, nicht:[FL]},
  {name:"Freilauf: HG Laufrad + SRAM NX Eagle (HG) passt", teile:{laufraeder:"w-newmen", kassette:"ka-nx"}, nicht:[FL]},
  {name:"Freilauf: Micro Spline Laufrad + SRAM NX Eagle (HG) ist rot", teile:{laufraeder:"w-dtxm1700", kassette:"ka-nx"}, rot:[FL]},
  {name:"Freilauf: HG Laufrad + Eagle 70 Transmission (HG) passt", teile:{laufraeder:"w-newmen", kassette:"ka-xs1270"}, nicht:[FL]},
  {name:"Freilauf: Shimano XT Laufrad (nur Micro Spline) + XD Kassette ist rot", teile:{laufraeder:"w-xtwheel", kassette:"ka-gx"}, rot:[FL]},
  {name:"Freilauf: Trial-Laufrad + XD Kassette ist rot", sel:["trial"], teile:{laufraeder:"w-trial26", kassette:"ka-gx"}, rot:[FL]},

  /* ── Innenlager & Kurbelwelle ── */
  {name:"Innenlager: BSA73 + XT Hollowtech II + BB-MT800 passt", teile:{rahmen:"f-fuelex", kurbel:"k-xt", innenlager:"il-mt800"}, nicht:[IL_GEH, IL_WELLE]},
  {name:"Innenlager: 30-mm-Kurbel in 24-mm-Shimano-Lager ist rot", teile:{rahmen:"f-fuelex", kurbel:"k-race", innenlager:"il-mt800"}, rot:[IL_WELLE]},
  {name:"Innenlager: DUB-Pressfit-Lager im BSA-Gehäuse ist rot", teile:{rahmen:"f-fuelex", kurbel:"k-gx", innenlager:"il-dubpf92"}, rot:[IL_GEH]},
  {name:"Innenlager: PF92 + XT + BB-MT800-PA passt", teile:{rahmen:"f-anthem", kurbel:"k-xt", innenlager:"il-mt800pa"}, nicht:[IL_GEH, IL_WELLE]},
  {name:"Innenlager: PF92-Rahmen + DUB-BSA-Lager ist rot", teile:{rahmen:"f-anthem", kurbel:"k-gx", innenlager:"il-dubbsa"}, rot:[IL_GEH]},
  {name:"Innenlager: DUB Wide (55) + normales DUB PF92 ist gelb", teile:{rahmen:"f-anthem", kurbel:"k-x0t", innenlager:"il-dubpf92"}, gelb:["DUB-Wide-Kurbel braucht das Wide-Lager"]},
  {name:"Innenlager: DUB Wide (55) + DUB PF92 Wide passt", teile:{rahmen:"f-anthem", kurbel:"k-x0t", innenlager:"il-dubpf92w"}, nicht:["DUB-Wide-Kurbel braucht das Wide-Lager", IL_GEH, IL_WELLE]},
  {name:"Innenlager: normale DUB-Kurbel + Wide-Lager ist gelb", teile:{rahmen:"f-anthem", kurbel:"k-gx", innenlager:"il-dubpf92w"}, gelb:["Wide-Lager zu einer normalen DUB-Kurbel"]},
  {name:"Innenlager: DUB Wide im BSA-Gehäuse braucht Spacer-Kit (Hinweis)", teile:{rahmen:"f-fuelex", kurbel:"k-x0t", innenlager:"il-dubbsa"}, hinweis:["Wide-Spacer fürs DUB-Lager"]},
  {name:"Innenlager: BSA83 (Session) + DUB BSA 83 passt", sel:["dh"], teile:{rahmen:"f-session", kurbel:"k-x01dh", innenlager:["il-dubbsa", {"Gehäuse":"BSA 83 (DH)"}]}, nicht:[IL_GEH, IL_WELLE]},
  {name:"Innenlager: BSA83 (Session) + DUB BSA 68/73 ist rot", sel:["dh"], teile:{rahmen:"f-session", kurbel:"k-x01dh", innenlager:["il-dubbsa", {"Gehäuse":"BSA 68/73"}]}, rot:[IL_GEH]},
  {name:"Innenlager: Spanish + ISIS Trial-Lager Spanish passt", sel:["trial"], teile:{rahmen:"f-echo", kurbel:"k-trialmod", innenlager:"il-trialsp"}, nicht:[IL_GEH, IL_WELLE]},
  {name:"Innenlager: Spanish-Rahmen + ISIS BSA-Lager ist rot", sel:["trial"], teile:{rahmen:"f-echo", kurbel:"k-trialmod", innenlager:"il-trialbsa"}, rot:[IL_GEH]},
  {name:"Innenlager: PowerSpline-Kurbel + DUB-Lager ist rot", teile:{rahmen:"f-fuelex", kurbel:"k-sx", innenlager:"il-dubbsa"}, rot:[IL_WELLE]},
  {name:"Innenlager: ohne Lager im Aufbau kommt der Bestell-Hinweis", teile:{rahmen:"f-fuelex", kurbel:"k-gx"}, hinweis:["Passendes Innenlager mitbestellen"]},

  /* ── Kettenlinie: 52 Boost / 55 Transmission / 56,5 Super Boost ── */
  {name:"Kettenlinie: 157 + Super-Boost-Kurbel (56,5) passt", teile:{rahmen:"f-trail429", kurbel:"k-nextSB"}, nicht:[KL]},
  {name:"Kettenlinie: 157 + Boost-Kurbel (52) ist rot", teile:{rahmen:"f-trail429", kurbel:"k-xt"}, rot:[KL]},
  {name:"Kettenlinie: 148 + Super-Boost-Kurbel (56,5) ist rot", teile:{rahmen:"f-fuelex", kurbel:"k-nextSB"}, rot:[KL]},
  {name:"Kettenlinie: 148 Transmission + DUB Wide (55) passt", teile:{rahmen:"f-fuelex", kurbel:"k-x0t", schaltwerk:"sw-x0t"}, nicht:[KL]},
  {name:"Kettenlinie: 148 Transmission + 52er Kurbel ist gelb", teile:{rahmen:"f-fuelex", kurbel:"k-gx", schaltwerk:"sw-x0t"}, gelb:[KL]},

  /* ── Gesamtrad ── */
  {name:"Gesamtrad: Startrad der App ist grün", startrad:true, ampel:"gruen"}
];
