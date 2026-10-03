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
const HA = "Hinterachse passt nicht", HA_KIT = "Hinterachse nur mit Umbaukit", VA = "Vorderachse passt nicht", VA_EK = "Vorderachse nur mit anderen Endkappen";
const FL = "Freilaufkörper passt nicht zur Kassette";
const IL_GEH = "Innenlager passt nicht ins Tretlagergehäuse", IL_WELLE = "Kurbelwelle passt nicht ins Innenlager";
const KL = "Kettenlinie stimmt nicht";
const E_KURBEL = "E-MTB braucht eine Motor-Kurbel", E_OHNE = "Motor-Kurbel ohne Motor", E_WELLE = "Kurbel passt nicht auf die Motorwelle", E_MOTOR = "Kurbel für einen anderen Motor gebaut";
const G = (id, fw) => [id, {Federweg:fw}], B2 = (id, sch) => [id, {Scheiben:sch}];
const SS_ROHR = "Steuersatz passt nicht ins Steuerrohr", SS_GABEL = "Steuersatz-Unterteil passt nicht zur Gabel", SS_PRUEF = "Einpressmaß am Rahmen prüfen";
const GEH = "Kurbelwelle passt nicht zur Gehäusebreite", KLEMM = "Lenkerklemmung passt nicht zum Vorbau";
const BR_VA = "Bremsscheibe vorn nur mit Adapter", BR_HA = "Bremsscheibe hinten nur mit Adapter";
const BR_VK = "Bremsscheibe vorn zu klein für die Aufnahme", BR_HK = "Bremsscheibe hinten zu klein für die Aufnahme";
const BR_VG = "Bremsscheibe vorn zu groß für die Gabel", BR_HG = "Bremsscheibe hinten zu groß";

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
  {name:"Vorderachse: Fox 38 (15 mm) + DT FR 1950 in 20 mm ist gelb (Endkappen)", teile:{gabel:"g-fox38", laufraeder:["w-dtfr29", {Vorderachse:"110x20"}]}, gelb:[VA_EK], nicht:[VA]},
  {name:"Vorderachse: Fox 38 (15 mm) + e*thirteen LG1 (nur 20 mm) ist rot", teile:{gabel:"g-fox38", laufraeder:"w-e13lg1"}, rot:[VA]},
  {name:"Vorderachse: Non-Boost-Gabel 15×100 + Boost-Laufrad 15×110 ist rot", patch:{gabel:["g-pike", {va:"100x15"}]}, teile:{gabel:"g-pike", laufraeder:["w-hope", {Vorderachse:"110x15"}]}, rot:[VA], nicht:[VA_EK]},
  {name:"Vorderachse: Non-Boost-Gabel 15×100 + Hope Pro 5 in 15×100 passt", patch:{gabel:["g-pike", {va:"100x15"}]}, teile:{gabel:"g-pike", laufraeder:["w-hope", {Vorderachse:"100x15"}]}, nicht:[VA, VA_EK]},
  {name:"Achse: Non-Boost-Rahmen 142×12 + Hope Pro 5 in 142 passt", patch:{rahmen:["f-fuelex", {ha:"142x12"}]}, teile:{rahmen:"f-fuelex", laufraeder:["w-hope", {Nabenbreite:"142x12"}]}, nicht:[HA, HA_KIT]},
  {name:"Achse: Non-Boost-Rahmen 142×12 + Boost-Laufrad 148 ist rot", patch:{rahmen:["f-fuelex", {ha:"142x12"}]}, teile:{rahmen:"f-fuelex", laufraeder:["w-hope", {Nabenbreite:"148x12"}]}, rot:[HA]},
  {name:"Kettenlinie: 142 (Soll 49) + Boost-Kurbel 52 ist gelb", patch:{rahmen:["f-fuelex", {ha:"142x12"}]}, teile:{rahmen:"f-fuelex", kurbel:"k-xt"}, gelb:[KL]},
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

  /* ── Bremsaufnahme: Post Mount nativ, Adapter = Differenz (PM180 + 23 = 203) ── */
  {name:"Bremse: Pike (PM180) + Fuel EX (PM180) mit 180/180 passt ohne Adapter", teile:{rahmen:"f-fuelex", gabel:"g-pike", bremsen:["b-xt", {Scheiben:"180/180"}]},
   nicht:[BR_VA, BR_HA, BR_VK, BR_HK, BR_VG, BR_HG]},
  {name:"Bremse: Pike (PM180) + 203er Scheibe vorn ist gelb (+23-mm-Adapter)", teile:{gabel:"g-pike", bremsen:["b-xt", {Scheiben:"203/180"}]}, gelb:[BR_VA]},
  {name:"Bremse: ZEB (PM200) + 180er Scheibe vorn ist rot (zu klein)", teile:{gabel:"g-zeb", bremsen:["b-xt", {Scheiben:"180/180"}]}, rot:[BR_VK]},
  {name:"Bremse: ZEB (PM200) + SRAM 200 vorn passt direkt", teile:{gabel:"g-zeb", bremsen:["b-code", {Scheiben:"200/180"}]}, nicht:[BR_VA, BR_VK, BR_VG]},
  {name:"Bremse: ZEB (PM200) + Shimano 203 vorn ist gelb (Shims +3)", teile:{gabel:"g-zeb", bremsen:["b-xt", {Scheiben:"203/180"}]}, gelb:[BR_VA]},
  {name:"Bremse: ZEB (PM200) + 220 vorn ist gelb (+20-mm-Adapter)", teile:{gabel:"g-zeb", bremsen:["b-code", {Scheiben:"220/200"}]}, gelb:[BR_VA]},
  {name:"Bremse: Fox 40 (PM203) + SRAM 200 vorn ist rot (zu klein)", sel:["dh"], teile:{gabel:"g-fox40", bremsen:["b-code", {Scheiben:"200/200"}]}, rot:[BR_VK]},
  {name:"Bremse: SID SL (PM160, max 200) + 180 vorn ist gelb", sel:["xc"], teile:{gabel:"g-sid", bremsen:["b-xt", {Scheiben:"180/160"}]}, gelb:[BR_VA]},
  {name:"Bremse: SID SL + 220er Scheibe vorn ist rot (über Freigabe)", sel:["xc"], teile:{gabel:"g-sid", bremsen:["b-code", {Scheiben:"220/200"}]}, rot:[BR_VG]},
  {name:"Bremse: Trek Slash (PM200 hinten) + 200 hinten passt", sel:["enduro"], teile:{rahmen:"f-slash", bremsen:["b-code", {Scheiben:"200/200"}]}, nicht:[BR_HA, BR_HK, BR_HG]},
  {name:"Bremse: Trek Slash (PM200) + 180 hinten ist rot (zu klein)", sel:["enduro"], teile:{rahmen:"f-slash", bremsen:["b-xt", {Scheiben:"203/180"}]}, rot:[BR_HK]},
  {name:"Bremse: Fuel EX (PM180, max 203) + 203 hinten ist gelb", teile:{rahmen:"f-fuelex", bremsen:["b-xt", {Scheiben:"203/203"}]}, gelb:[BR_HA]},
  {name:"Bremse: Fuel EX (max 203) + 220/203 ist hinten erlaubt", teile:{rahmen:"f-fuelex", bremsen:["b-xt", {Scheiben:"220/203"}]}, nicht:[BR_HG]},
  {name:"Bremse: Top Fuel (max 180) + 200 hinten ist rot", sel:["xc"], teile:{rahmen:"f-topfuel", bremsen:["b-code", {Scheiben:"200/200"}]}, rot:[BR_HG]},
  {name:"Bremse: Orbea Oiz (Flat Mount 160) braucht FM-auf-PM-Adapter", sel:["xc"], teile:{rahmen:"f-oiz", bremsen:["b-xt", {Scheiben:"180/160"}]}, gelb:["Flat-Mount-Aufnahme hinten"]},
  {name:"Bremse: Nomad 6 (PM200, max 223) + 220 hinten ist gelb", sel:["enduro"], teile:{rahmen:"f-nomad", bremsen:["b-code", {Scheiben:"220/220"}]}, gelb:[BR_HA], nicht:[BR_HG]},

  /* ── Steuersatz nach SHIS: ZS44/ZS56, IS41/IS52, IS42/IS52, ZS56/ZS56 ── */
  {name:"Steuersatz: Megatower (IS41/IS52) + IS41/IS52 passt", teile:{rahmen:"f-megatower", gabel:"g-zeb", steuersatz:["ss-cc40", {"Einpressmaß":"IS41 / IS52"}]}, nicht:[SS_ROHR, SS_GABEL, SS_PRUEF]},
  {name:"Steuersatz: Megatower (IS41/IS52) + ZS44/ZS56 ist rot", teile:{rahmen:"f-megatower", steuersatz:["ss-cc40", {"Einpressmaß":"ZS44 / ZS56"}]}, rot:[SS_ROHR]},
  {name:"Steuersatz: Megatower (IS41) + IS42/IS52 ist rot (0,8 mm Unterschied)", teile:{rahmen:"f-megatower", steuersatz:["ss-cc40", {"Einpressmaß":"IS42 / IS52"}]}, rot:[SS_ROHR]},
  {name:"Steuersatz: Stumpjumper 15 (IS42/IS52) + IS42/IS52 passt", teile:{rahmen:"f-stumpy15", gabel:"g-pike", steuersatz:["ss-wolftooth", {"Einpressmaß":"IS42 / IS52"}]}, nicht:[SS_ROHR, SS_GABEL]},
  {name:"Steuersatz: Meta SX V5 (ZS56/ZS56) + ZS56/ZS56 tapered passt", sel:["enduro"], teile:{rahmen:"f-metasx", gabel:"g-zeb", steuersatz:["ss-acros", {"Einpressmaß":"ZS56 / ZS56"}]}, nicht:[SS_ROHR, SS_GABEL]},
  {name:"Steuersatz: Supreme DH (ZS56/ZS56) + Fox 40 mit 1 1/8″-Unterteil passt", sel:["dh"], teile:{rahmen:"f-supreme", gabel:"g-fox40", steuersatz:["ss-acros", {"Einpressmaß":"ZS56 / ZS56 · 1 1/8″ unten"}]}, nicht:[SS_ROHR, SS_GABEL]},
  {name:"Steuersatz: Supreme DH + Fox 40 mit 1,5″-Unterteil ist rot", sel:["dh"], teile:{rahmen:"f-supreme", gabel:"g-fox40", steuersatz:["ss-acros", {"Einpressmaß":"ZS56 / ZS56"}]}, rot:[SS_GABEL]},
  {name:"Steuersatz: Rahmen ohne belegte Norm gibt den Prüf-Hinweis", teile:{rahmen:"f-torque", steuersatz:"ss-hope"}, hinweis:[SS_PRUEF]},
  {name:"Gabelschaft: konische Gabel im geraden Steuerrohr (Inspired Fourplay) ist rot", sel:["trial"], teile:{rahmen:"f-fourplay", gabel:"g-pike"}, rot:["Gabelschaft passt nicht ins Steuerrohr"]},

  /* ── Tretlagerbreite 68/73 gegen 83 (DH) ── */
  {name:"Gehäusebreite: Trek Session (BSA83) + SRAM X01 DH DUB 83 passt", sel:["dh"], teile:{rahmen:"f-session", kurbel:"k-x01dh", innenlager:["il-dubbsa", {"Gehäuse":"BSA 83 (DH)"}]}, nicht:[GEH, IL_GEH, IL_WELLE]},
  {name:"Gehäusebreite: Trek Session (BSA83) + GX DUB (68/73) ist rot", sel:["dh"], teile:{rahmen:"f-session", kurbel:"k-gx"}, rot:[GEH]},
  {name:"Gehäusebreite: Fuel EX (BSA73) + X01 DH DUB 83 ist rot", teile:{rahmen:"f-fuelex", kurbel:"k-x01dh"}, rot:[GEH]},
  {name:"Gehäusebreite: Session + Race Face Atlas mit 83er Welle passt", sel:["dh"], teile:{rahmen:"f-session", kurbel:["k-atlas", {Welle:"83"}]}, nicht:[GEH, KL]},
  {name:"Gehäusebreite: Session + Race Face Atlas mit 68/73er Welle ist rot", sel:["dh"], teile:{rahmen:"f-session", kurbel:["k-atlas", {Welle:"68/73"}]}, rot:[GEH]},
  {name:"Gehäusebreite: Supreme DH (PF107) + Saint FC-M825 (83 mm) passt", sel:["dh"], teile:{rahmen:"f-supreme", kurbel:"k-saintsb"}, nicht:[GEH, KL]},
  {name:"Kettenlinie: Saint FC-M820 (50,4 mm) am Boost-Hinterbau ist gelb", teile:{rahmen:"f-fuelex", kurbel:"k-saint"}, gelb:[KL]},

  /* ── Adapter als Teil (Liam 2026-10-03): automatisch gewaehlt, mit Rechnung,
     Preis und Platz im Aufbau -- wo = das Teil, an das er geschraubt wird ── */
  {name:"Adapter: Pike (PM180) + 203 vorn → PM +23 an der Gabel", teile:{gabel:"g-pike", bremsen:["b-xt", {Scheiben:"203/180"}]},
   adapter:[{n:"Post-Mount-Adapter +23 mm", rechnung:"PM 180 + 23 mm = 203 mm", wo:"gabel", p:17, g:42}], tausch:{"brems-v":"Scheiben 180/180"}},
  {name:"Adapter: ZEB (PM200) + 220 vorn → PM +20", teile:{gabel:"g-zeb", bremsen:["b-code", {Scheiben:"220/200"}]},
   adapter:[{n:"Post-Mount-Adapter +20 mm", rechnung:"PM 200 + 20 mm = 220 mm", wo:"gabel"}]},
  {name:"Adapter: ZEB (PM200) + 203 vorn → Distanzscheiben +3", teile:{gabel:"g-zeb", bremsen:["b-xt", {Scheiben:"203/180"}]},
   adapter:[{n:"PM-Distanzscheiben +3 mm", rechnung:"PM 200 + 3 mm = 203 mm", p:8, g:6}]},
  {name:"Tausch: ZEB (PM200) + Shimano 203 → Bremse mit 200er-Scheibe (Shimano hat keine 200)", sel:["enduro"], teile:{rahmen:"f-spectral", gabel:["g-zeb", {Federweg:"160"}], bremsen:["b-xt", {Scheiben:"203/180"}]},
   adapter:[{n:"PM-Distanzscheiben +3 mm"}]},
  {name:"Adapter: ZEB (PM200) + 200 vorn braucht keinen", teile:{gabel:"g-zeb", bremsen:["b-code", {Scheiben:"200/200"}]}, keinAdapter:true},
  {name:"Adapter: Fuel EX (PM180) + 203 hinten → PM +23 am Rahmen", teile:{rahmen:"f-fuelex", bremsen:["b-xt", {Scheiben:"203/203"}]},
   adapter:[{n:"Post-Mount-Adapter +23 mm", wo:"rahmen", pos:"hinten"}]},
  {name:"Adapter: Oiz (FM160) → FM-auf-PM für 160", sel:["xc"], teile:{rahmen:"f-oiz", bremsen:["b-xt", {Scheiben:"180/160"}]},
   adapter:[{n:"Flat-Mount-auf-PM-Adapter 160 mm", rechnung:"FM 160 → PM 160", wo:"rahmen"}], tausch:{"brems-h":null}},
  {name:"Adapter: IS-Gabel (per patch) + 180 vorn → IS-auf-PM +20", patch:{gabel:["g-pike", {pmV:160, vrAufnahme:"IS"}]}, teile:{gabel:"g-pike", bremsen:["b-xt", {Scheiben:"180/180"}]},
   adapter:[{n:"IS-auf-PM-Adapter 180 mm", rechnung:"IS 160 + 20 mm = 180 mm", wo:"gabel"}]},
  {name:"Adapter: Fox 38 (15 mm) + Vorderrad 20 mm → Endkappen am Laufrad", teile:{gabel:"g-fox38", laufraeder:["w-dtfr29", {Vorderachse:"110x20"}]},
   adapter:[{n:"Endkappen 20 → 15 mm", kurz:"110x20 → 110x15", wo:"laufraeder", p:30}], tausch:{"achse-v":"VR 15 mm"}},
  {name:"Adapter: gerade Gabel im konischen Rahmen → Reduzier-Unterteil", sel:["trial"], teile:{rahmen:"f-echo", gabel:["g-trial20", {Steuerrohr:"gerade"}]},
   adapter:[{n:"Reduzier-Unterteil ZS56/30", wo:"gabel"}], tausch:{"steuer":"tapered"}},
  {name:"Adapter: BB30 + Shimano 24 mm → Konverter-Innenlager", patch:{rahmen:["f-fuelex", {bb:"BB30"}]}, teile:{rahmen:"f-fuelex", kurbel:"k-xt"},
   gelb:["Innenlager nur mit Konverter"], adapter:[{n:"Konverter-Innenlager BB30 (73 mm) → Hollowtech II", wo:"kurbel", p:75}]},
  {name:"Adapter: BB30 + 30-mm-Kurbel braucht keinen Konverter", patch:{rahmen:["f-fuelex", {bb:"BB30"}]}, teile:{rahmen:"f-fuelex", kurbel:"k-atlas"},
   nicht:["Innenlager nur mit Konverter"], keinAdapter:true},
  {name:"Adapter: Supreme DH (157) + 150er Hinterrad → Commencal-Umbaukit", sel:["dh"], teile:{rahmen:"f-supreme", laufraeder:["w-hopemx", {Nabenbreite:"150x12"}]},
   adapter:[{rechnung:"Ausfallende 157 mm − Nabe 150 mm = 7 mm Ausgleich", wo:"rahmen", p:45}]},
  {name:"Adapter: Startrad hat keinen Adapter", startrad:true, keinAdapter:true},

  /* ── T47 und BB30 (kein Katalograhmen: Norm per patch gesetzt) ── */
  {name:"T47: Rahmen mit T47 + Hope T47 30 mm + Race Face Atlas passt", patch:{rahmen:["f-fuelex", {bb:"T47"}]}, teile:{rahmen:"f-fuelex", kurbel:"k-atlas", innenlager:"il-hopet47"}, nicht:[IL_GEH, IL_WELLE, GEH]},
  {name:"T47: Rahmen mit T47 + DUB-BSA-Lager ist rot", patch:{rahmen:["f-fuelex", {bb:"T47"}]}, teile:{rahmen:"f-fuelex", kurbel:"k-gx", innenlager:"il-dubbsa"}, rot:[IL_GEH]},
  {name:"T47: Rahmen mit T47 + Wolf Tooth T47 DUB + GX passt", patch:{rahmen:["f-fuelex", {bb:"T47"}]}, teile:{rahmen:"f-fuelex", kurbel:"k-gx", innenlager:"il-wtt47dub"}, nicht:[IL_GEH, IL_WELLE]},
  {name:"BB30: Rahmen mit BB30 + PF30-Lager ist rot", patch:{rahmen:["f-fuelex", {bb:"BB30"}]}, teile:{rahmen:"f-fuelex", kurbel:"k-atlas", innenlager:"il-hopepf30"}, rot:[IL_GEH]},
  {name:"BB30: Rahmen mit BB30 + BB30-Lagersatz + 30-mm-Kurbel passt", patch:{rahmen:["f-fuelex", {bb:"BB30"}]}, teile:{rahmen:"f-fuelex", kurbel:"k-atlas", innenlager:"il-ebbb30"}, nicht:[IL_GEH, IL_WELLE]},

  /* ── Lenker/Vorbau-Klemmung 31,8 / 35 ── */
  {name:"Klemmung: 35er Lenker + 35er Vorbau passt", teile:{lenker:["l-spike", {Klemmung:"35"}], vorbau:"v-race"}, nicht:[KLEMM]},
  {name:"Klemmung: 31,8er Lenker + 35er Vorbau ist rot", teile:{lenker:["l-spike", {Klemmung:"31.8"}], vorbau:"v-race"}, rot:[KLEMM]},

  /* ── Gabelschaft und Steuerrohr ── */
  {name:"Schaft: gerade Trial-Gabel im konischen Rahmen ist gelb (Reduzier-Unterteil)", sel:["trial"], teile:{rahmen:"f-echo", gabel:["g-trial20", {Steuerrohr:"gerade"}]},
   gelb:["Gerader Gabelschaft nur mit Reduzier-Unterteil"], nicht:["Gabelschaft passt nicht ins Steuerrohr"]},
  {name:"Schaft: konische Trial-Gabel im konischen Rahmen passt", sel:["trial"], teile:{rahmen:"f-echo", gabel:["g-trial20", {Steuerrohr:"tapered"}]},
   nicht:["Gerader Gabelschaft nur mit Reduzier-Unterteil", "Gabelschaft passt nicht ins Steuerrohr"]},
  {name:"Schaft: Doppelbrückengabel im Enduro-Rahmen ist rot", sel:["enduro"], teile:{rahmen:"f-slash", gabel:"g-boxxer"}, rot:["Gabelschaft passt nicht ins Steuerrohr"]},
  {name:"Schaft: Einfachbrückengabel im DH-Rahmen ist gelb", sel:["dh"], teile:{rahmen:"f-session", gabel:G("g-zeb", 190)}, gelb:["Einfachbrückengabel im DH-Rahmen"]},

  /* ── E-MTB: Kurbel auf der Motorwelle ── */
  {name:"E-MTB: Rail+ (Bosch) + SRAM X0 E-MTB Bosch-Kurbel passt, kein Innenlager nötig", teile:{rahmen:"f-rail", kurbel:"k-ex0t"},
   nicht:[E_KURBEL, E_OHNE, E_WELLE, E_MOTOR, "Passendes Innenlager mitbestellen", KL, GEH]},
  {name:"E-MTB: Rail+ (Bosch) + normale GX-DUB-Kurbel ist rot", teile:{rahmen:"f-rail", kurbel:"k-gx"}, rot:[E_KURBEL]},
  {name:"E-MTB: normale Fuel EX + E-MTB-Kurbel ist rot", teile:{rahmen:"f-fuelex", kurbel:"k-ex0t"}, rot:[E_OHNE]},
  {name:"E-MTB: Decoy (Shimano EP) + Bosch-ISIS-Kurbel ist rot", teile:{rahmen:"f-decoy", kurbel:"k-ex0t"}, rot:[E_WELLE]},
  {name:"E-MTB: Levo 4 (Specialized, ISIS) + Bosch-Kurbel ist gelb (anderer Versatz)", teile:{rahmen:"f-levo4", kurbel:"k-eaeffect"}, gelb:[E_MOTOR]},
  {name:"E-MTB: Levo 4 + Praxis Type 3 passt", teile:{rahmen:"f-levo4", kurbel:"k-epraxis"}, nicht:[E_KURBEL, E_WELLE, E_MOTOR]},
  {name:"E-MTB: Fuel EXe (TQ) + e*thirteen Helix e*spec passt", teile:{rahmen:"f-fuelexe", kurbel:"k-ehelix"}, nicht:[E_KURBEL, E_WELLE, E_MOTOR]},
  {name:"E-MTB: Orbea Rise (kein UDH) + Transmission ist rot", teile:{rahmen:"f-rise", schaltwerk:"sw-x0t"}, rot:[UDH]},
  {name:"E-MTB: Trek Rail+ (UDH) + Transmission passt", jahr:2025, teile:{rahmen:"f-rail", schaltwerk:"sw-x0t"}, nicht:[UDH]},
  {name:"E-MTB: Innenlager-Slot entfällt am E-MTB", teile:{rahmen:"f-wild", kurbel:"k-eaeffect", innenlager:"il-dubbsa"}, nicht:[IL_GEH]},
  {name:"E-MTB: Full-Power mit 2-Kolben-Bremse ist gelb", teile:{rahmen:"f-rail", bremsen:B2("b-level", "200/180")}, gelb:["Zwei Kolben am E-MTB"]},
  {name:"E-MTB: Full-Power mit 180er Scheibe vorn gibt den Hinweis", teile:{rahmen:"f-rail", bremsen:B2("b-xt", "180/180")}, hinweis:["Kleine Scheibe vorn am E-MTB"]},
  {name:"E-MTB: Light-E (Fuel EXe) mit 2 Kolben ist kein E-Bremsen-Fall", teile:{rahmen:"f-fuelexe", bremsen:B2("b-xt2", "180/160")}, nicht:["Zwei Kolben am E-MTB"]},
  {name:"E-MTB: Mullet-Rahmen (Rail+) + 29/29-Laufradsatz ist rot", teile:{rahmen:"f-rail", laufraeder:"w-dthx29"}, rot:["Laufradgrößen passen nicht zum Rahmen"]},

  /* ── Gesamtrad ── */
  {name:"Gesamtrad: Startrad der App ist grün", startrad:true, ampel:"gruen"}
];
