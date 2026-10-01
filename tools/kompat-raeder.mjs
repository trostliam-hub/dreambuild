/* Echte Testraeder fuer tools/kompat-test.mjs -- komplette Aufbauten nach der
 * Serienausstattung (Modelljahr in Klammern), so nah, wie der Katalog es
 * erlaubt. Jedes Rad muss vollstaendig sein (kein "Aufbau unvollständig")
 * und darf keinen roten Befund haben: so wie es im Laden steht, faehrt es.
 *
 * ampel "gelb" heisst hier fast immer: ein Adapter ist noetig -- etwa ein
 * Post-Mount-Adapter, weil die Scheibe groesser ist als die Aufnahme der
 * Gabel (PM180 + 23 = 203). Das stimmt mit der Serie ueberein: dort ist der
 * Adapter verbaut. Welche gelben Befunde erwartet sind, steht in gelb.
 *
 * Kurzschreibweisen:
 *   G(id, federweg)            Gabel mit Federweg
 *   D(id, einbaumass, stufe)   Daempfer, Einbaumass wie "210x55M" (M = Standard-Auge, T = Trunnion)
 *   L(id, freilauf, extra)     Laufradsatz mit Freilauf (und z. B. {Vorderachse:"110x20"})
 *   B(id, scheiben)            Bremse mit Scheiben "vorn/hinten"
 *   S(id, durchmesser, hub)    Sattelstuetze
 *
 * Quellen der Serienausstattung: Hersteller-Seiten, Vital MTB, 99spokes,
 * Pinkbike, enduro-mtb.com, emtb-forums (Stand 2026-10-01).
 */
const G = (id, fw) => [id, {Federweg:fw}];
const D = (id, mass, stufe) => [id, stufe ? {"Einbaumaß":mass, "Ausführung":stufe} : {"Einbaumaß":mass}];
const L = (id, fl, x) => [id, {Freilauf:fl, ...(x || {})}];
const B = (id, sch) => [id, {Scheiben:sch}];
const S = (id, d, hub) => [id, hub ? {Durchmesser:d, Hub:hub} : {Durchmesser:d}];

/* Antriebe */
const XT = {schalthebel:"sh-xt", schaltwerk:"sw-xt", kassette:"ka-xt", kette:"ke-m8100", kurbel:"k-xt"};
const DEORE = {schalthebel:"sh-deore12", schaltwerk:"sw-deore12", kassette:"ka-deore12", kette:"ke-m6100", kurbel:"k-deore"};
const GX = {schalthebel:"sh-gx", schaltwerk:"sw-gx", kassette:"ka-gx", kette:"ke-gx", kurbel:"k-gx"};
const X01 = {schalthebel:"sh-x01", schaltwerk:"sw-x01", kassette:"ka-x01", kette:"ke-x01", kurbel:"k-x01"};
const NX = {schalthebel:"sh-nx", schaltwerk:"sw-nx", kassette:"ka-nx", kette:"ke-nx", kurbel:"k-nx"};
const X0T = {schalthebel:"sh-x0axs", schaltwerk:"sw-x0t", kassette:"ka-xs1295", kette:"ke-flattopx0", kurbel:"k-x0t"};
const GXT = {schalthebel:"sh-gxaxs", schaltwerk:"sw-gxt", kassette:"ka-xs1275", kette:"ke-flattop", kurbel:"k-gxt"};
const XXSL = {schalthebel:"sh-xxsl", schaltwerk:"sw-xxsl", kassette:"ka-xs1299", kette:"ke-flattopsl", kurbel:"k-xxsl"};
const DH7 = {schalthebel:"sh-x01dh", schaltwerk:"sw-x01dh", kassette:"ka-xg795", kette:"ke-pc1130", kurbel:"k-x01dh"};
const GXDH = {schalthebel:"sh-gxdh", schaltwerk:"sw-gxdh", kassette:"ka-pg720", kette:"ke-pc1130", kurbel:"k-x01dh"};
const SAINT = {schalthebel:"sh-saint", schaltwerk:"sw-saint", kassette:"ka-saint", kette:"ke-hg54", kurbel:"k-saintsb"};
const SS = {kassette:"ka-ss", kette:"ke-ss", kurbel:"k-dirt", innenlager:"il-rfbsa"};

/* Kontaktpunkte, die an keiner Norm haengen */
const REST = {sattel:"sa-ergon", pedale:"pe-oneupa", griffe:"gr-ge1"};
const C35 = {lenker:"l-race", vorbau:"v-race"};                 /* 35 mm */
const C318 = {lenker:"l-renthal", vorbau:"v-renthal"};          /* 31,8 mm, XC */
const CDH = {lenker:"l-race", vorbau:"v-dc"};                   /* Direct Mount an der Doppelbruecke */

const ADAPT_V = "Bremsscheibe vorn nur mit Adapter", ADAPT_H = "Bremsscheibe hinten nur mit Adapter";

export const RAEDER = [
  /* ── XC ── */
  {name:"XC: Specialized Epic 8 Comp (2024)", sel:["xc"], ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-epic8", gabel:G("g-sidult", 120), daempfer:D("d-sidluxe", "190x45M"), laufraeder:L("w-rovalcontrol", "XD"),
     reifenVR:"t-groundcontrol", reifenHR:"t-groundcontrol", ...GX, innenlager:"il-dubbsa", bremsen:B("b-level", "180/160"),
     stuetze:S("s-tranzx", "30.9", 125), ...C318, ...REST}},
  {name:"XC: Scott Spark RC Team (2023)", sel:["xc"], ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-sparkrc", gabel:"g-fox34sc", daempfer:D("d-floatsl", "165x45T"), laufraeder:"w-dtxmc1200",
     reifenVR:"t-rekon", reifenHR:"t-rekon", ...XT, innenlager:"il-mt800pa", bremsen:B("b-xt2", "180/160"),
     stuetze:S("s-transfersl", "31.6", 100), ...C318, ...REST}},
  {name:"XC: Canyon Lux Trail CF 8 (2024)", jahr:2024, sel:["xc"], ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-luxtrail", gabel:"g-fox34sc", daempfer:D("d-dps", "210x55M"), laufraeder:L("w-dtxm1700", "XD"),
     reifenVR:"t-rekon24", reifenHR:"t-rekon24", ...GX, innenlager:"il-dubpf92", bremsen:B("b-xt2", "180/160"),
     stuetze:S("s-transfersl", "30.9", 100), ...C318, ...REST}},
  {name:"XC: Orbea Oiz M-Pro (2023) · Flat Mount hinten", jahr:2023, sel:["xc"], ampel:"gelb", gelb:[ADAPT_V, "Flat-Mount-Aufnahme hinten"],
   teile:{rahmen:"f-oiz", gabel:"g-fox34sc", daempfer:D("d-floatsl", "190x45M"), laufraeder:"w-dtxmc1200",
     reifenVR:"t-racingray", reifenHR:"t-racingralph", ...XT, innenlager:"il-mt800pa", bremsen:B("b-xt2", "180/160"),
     stuetze:S("s-transfersl", "31.6", 100), ...C318, ...REST}},
  {name:"XC: Trek Supercaliber SLR 9.8 Gen 2 (2024)", sel:["xc"], ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-supercal", gabel:G("g-sid", 110), daempfer:"d-isostrut", laufraeder:L("w-bontline", "XD"),
     reifenVR:"t-aspen", reifenHR:"t-aspen", ...XXSL, innenlager:"il-dubpf92w", bremsen:B("b-xt2", "180/160"),
     stuetze:S("s-p6", "31.6"), ...C318, ...REST}},
  {name:"XC: Specialized Chisel Comp (2022) · Hardtail", sel:["xc"], ampel:"gruen",
   teile:{rahmen:"f-chisel", gabel:G("g-judy", 100), laufraeder:L("w-newmenphase", "Micro Spline"),
     reifenVR:"t-groundcontrol", reifenHR:"t-groundcontrol", ...DEORE, innenlager:"il-bb52", bremsen:B("b-deore2", "160/160"),
     stuetze:S("s-tranzx", "30.9", 125), lenker:"l-ergon", vorbau:"v-syncros", ...REST}},

  /* ── Trail ── */
  {name:"Trail: Trek Fuel EX 9.8 XT Gen 6 (2023)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-fuelex", gabel:G("g-fox36", 150), daempfer:D("d-floatx", "185x55T"), laufraeder:"w-bontline",
     reifenVR:"t-dissector", reifenHR:"t-rekon24", ...XT, innenlager:"il-mt800", bremsen:B("b-xt", "203/180"),
     stuetze:S("s-oneup", "34.9", 180), ...C35, ...REST}},
  {name:"Trail: Specialized Stumpjumper 15 Comp (2025)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-stumpy15", gabel:G("g-fox36", 160), daempfer:D("d-floatx", "210x55M"), laufraeder:L("w-roval", "XD"),
     reifenVR:"t-butcher", reifenHR:"t-eliminator", ...GXT, innenlager:"il-dubbsa", bremsen:B("b-mavenbronze", "200/200"),
     stuetze:S("s-oneup", "34.9", 180), ...C35, ...REST}},
  {name:"Trail: Santa Cruz Hightower 3 C S (2023)", ampel:"gelb", gelb:[ADAPT_V, ADAPT_H],
   teile:{rahmen:"f-hightower", gabel:G("g-fox36", 150), daempfer:D("d-floatx", "210x55M"), laufraeder:L("w-reserve", "XD"),
     reifenVR:"t-dhf25", reifenHR:"t-dhr2", ...GX, innenlager:"il-dubbsa", bremsen:B("b-code", "200/200"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Trail: YT Izzo Core 3 (2022)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-izzo", gabel:G("g-fox34perf", 130), daempfer:D("d-dps", "210x55M", "Performance"), laufraeder:"w-dtxm1700",
     reifenVR:"t-forekaster", reifenHR:"t-forekaster", ...XT, innenlager:"il-mt800", bremsen:B("b-xt", "203/180"),
     stuetze:S("s-oneup", "31.6", 150), ...C35, ...REST}},
  {name:"Trail: Santa Cruz Tallboy 5 C R (2023)", ampel:"gruen",
   teile:{rahmen:"f-tallboy", gabel:G("g-fox34perf", 130), daempfer:D("d-dps", "210x50M"), laufraeder:L("w-newmenphase", "HG"),
     reifenVR:"t-dhf23", reifenHR:"t-dissector", ...NX, innenlager:"il-dubbsa", bremsen:B("b-g2", "180/180"),
     stuetze:S("s-aeffect", "31.6", 150), ...C35, ...REST}},
  {name:"Trail: Santa Cruz 5010 5 C S · Mullet (2023)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-5010", gabel:G("g-pike", 140), daempfer:D("d-deluxe", "210x50M"), laufraeder:L("w-mulletex", "XD"),
     reifenVR:"t-dhf25", reifenHR:"t-dhr2", ...GX, innenlager:"il-dubbsa", bremsen:B("b-code", "200/180"),
     stuetze:S("s-reverb", "31.6", 150), ...C35, ...REST}},
  {name:"Trail: Canyon Spectral CF 8 (2021)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-spectral", gabel:G("g-fox36", 160), daempfer:D("d-floatx", "230x60M"), laufraeder:"w-dtxm1700",
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...XT, innenlager:"il-mt800", bremsen:B("b-xt", "203/180"),
     stuetze:S("s-oneup", "30.9", 150), ...C35, ...REST}},
  {name:"Trail: Giant Trance X Advanced Pro 29 (2022)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-trancex", gabel:G("g-fox36", 150), daempfer:D("d-floatx", "185x55T"), laufraeder:L("w-dtex", "XD"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...GX, innenlager:"il-dubpf92", bremsen:B("b-code", "200/180"),
     stuetze:S("s-oneup", "30.9", 180), ...C35, ...REST}},
  {name:"Trail: Rocky Mountain Instinct C70 (2023)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-instinct", gabel:G("g-fox36", 150), daempfer:D("d-floatx", "210x52.5M"), laufraeder:"w-dtxm1700",
     reifenVR:"t-dhf25", reifenHR:"t-dhr2", ...XT, innenlager:"il-mt800pa", bremsen:B("b-xt", "203/180"),
     stuetze:S("s-oneup", "30.9", 180), ...C35, ...REST}},
  {name:"Trail: Pivot Trail 429 Pro · Super Boost 157 (2023)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-trail429", gabel:G("g-fox34", 130), daempfer:D("d-dps", "165x45T"), laufraeder:"w-dtsb1700",
     reifenVR:"t-dissector", reifenHR:"t-rekon24", schalthebel:"sh-xt", schaltwerk:"sw-xt", kassette:"ka-xt", kette:"ke-m8100",
     kurbel:"k-nextSB", innenlager:"il-rfbb92", bremsen:B("b-xt", "203/180"),
     stuetze:S("s-fox", "31.6", 150), ...C35, ...REST}},
  {name:"Trail: Evil Following LS · Super Boost 157 (2023)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-following", gabel:G("g-pike", 130), daempfer:D("d-dps", "165x45T"), laufraeder:L("w-hopesb", "XD"),
     reifenVR:"t-dhf25", reifenHR:"t-dhr2", schalthebel:"sh-gx", schaltwerk:"sw-gx", kassette:"ka-gx", kette:"ke-gx",
     kurbel:"k-hopesb", innenlager:"il-hope30", bremsen:B("b-code", "200/180"),
     stuetze:S("s-oneup", "30.9", 150), ...C35, ...REST}},
  {name:"Trail: Norco Optic C2 (2023)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-optic", gabel:G("g-fox36", 140), daempfer:D("d-floatx", "190x45M"), laufraeder:"w-dtxm1700",
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...XT, innenlager:"il-mt800pa", bremsen:B("b-xt", "203/180"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Trail: Transition Spur X0 AXS · Transmission (2025)", jahr:2025, sel:["xc", "trail"], ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-spur", gabel:G("g-sidult", 120), daempfer:D("d-sidluxe", "190x45M"), laufraeder:L("w-dtxmc1200", "XD"),
     reifenVR:"t-rekon24", reifenHR:"t-rekon24", ...X0T, innenlager:"il-dubbsa", bremsen:B("b-levelult", "180/160"),
     stuetze:S("s-oneup", "31.6", 150), ...C35, ...REST}},
  {name:"Trail: Orbea Occam LT M10 (2024)", jahr:2024, ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-occam", gabel:G("g-fox36", 150), daempfer:D("d-floatx", "210x55M"), laufraeder:"w-dtxm1700",
     reifenVR:"t-dhf25", reifenHR:"t-dhr2", ...XT, innenlager:"il-mt800", bremsen:B("b-xt", "203/180"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Trail: Yeti SB120 T2 · Transmission (2023)", jahr:2023, ampel:"gruen",
   teile:{rahmen:"f-sb120", gabel:G("g-fox34", 130), daempfer:D("d-dps", "190x45M"), laufraeder:L("w-dtxm1700", "XD"),
     reifenVR:"t-dissector", reifenHR:"t-rekon24", ...X0T, innenlager:"il-dubbsa", bremsen:B("b-g2", "180/180"),
     stuetze:S("s-oneup", "31.6", 150), ...C35, ...REST}},
  {name:"Trail: Propain Hugene Performance (2022)", ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-hugene", gabel:G("g-fox36", 150), daempfer:D("d-dps", "210x50M"), laufraeder:L("w-newmen", "XD"),
     reifenVR:"t-dhf25", reifenHR:"t-dhr2", ...GX, innenlager:"il-dubbsa", bremsen:B("b-code", "200/180"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},

  /* ── Enduro ── */
  {name:"Enduro: Specialized Enduro Expert (2025)", jahr:2025, sel:["enduro"], ampel:"gelb", gelb:[ADAPT_H],
   teile:{rahmen:"f-enduro", gabel:G("g-zeb", 170), daempfer:D("d-x2", "205x60T"), laufraeder:L("w-rovaltrav", "XD"),
     reifenVR:"t-butcher", reifenHR:"t-eliminator", ...GXT, innenlager:"il-dubbsa", bremsen:B("b-codesilver", "200/200"),
     stuetze:S("s-oneup", "34.9", 180), ...C35, ...REST}},
  {name:"Enduro: Santa Cruz Megatower 2 C GX AXS (2024)", sel:["enduro"], ampel:"gruen",
   teile:{rahmen:"f-megatower", gabel:G("g-zeb", 170), daempfer:D("d-sd", "230x62.5M"), laufraeder:L("w-reservehd", "XD"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...GXT, innenlager:"il-dubbsa", bremsen:B("b-code", "200/200"),
     stuetze:S("s-reverb", "31.6", 170), ...C35, ...REST}},
  {name:"Enduro: Commencal Meta SX V5 Race · Mullet (2023)", jahr:2023, sel:["enduro"], ampel:"gruen",
   teile:{rahmen:"f-metasx", gabel:G("g-fox38", 170), daempfer:D("d-x2", "230x62.5M"), laufraeder:L("w-mulletex", "XD"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...GX, innenlager:"il-dubpf92", bremsen:B("b-codeult", "200/200"),
     stuetze:S("s-oneup", "34.9", 180), ...C35, ...REST}},
  {name:"Enduro: YT Capra Core 4 · Mullet (2022)", sel:["enduro"], ampel:"gelb", gelb:[ADAPT_H],
   teile:{rahmen:"f-capra", gabel:G("g-fox38", 170), daempfer:D("d-x2", "230x65M"), laufraeder:"w-cbmullet",
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...X01, innenlager:"il-dubbsa", bremsen:B("b-codeult", "200/200"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Enduro: Canyon Strive CFR Underdog (2022)", sel:["enduro"], ampel:"gruen",
   teile:{rahmen:"f-strive", gabel:G("g-fox38", 170), daempfer:D("d-x2", "230x65M"), laufraeder:"w-dtxm1700",
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...XT, innenlager:"il-mt800", bremsen:B("b-xt", "203/203"),
     stuetze:S("s-oneup", "30.9", 180), ...C35, ...REST}},
  {name:"Enduro: Trek Slash 9.8 GX AXS Gen 6 (2024)", sel:["enduro"], ampel:"gruen",
   teile:{rahmen:"f-slash", gabel:G("g-fox38", 170), daempfer:D("d-x2", "230x65M"), laufraeder:L("w-dtex1501", "XD"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...GXT, innenlager:"il-dubbsa", bremsen:B("b-codesilver", "200/200"),
     stuetze:S("s-oneup", "34.9", 180), ...C35, ...REST}},
  {name:"Enduro: Propain Tyee CF (2023)", jahr:2023, sel:["enduro"], ampel:"gruen",
   teile:{rahmen:"f-tyee", gabel:G("g-zeb", 170), daempfer:D("d-sd", "210x55M"), laufraeder:"w-dtxm1700",
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...XT, innenlager:"il-mt800", bremsen:B("b-code", "200/180"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Enduro: Specialized Status 160 · Mullet (2022)", sel:["enduro"], ampel:"gruen",
   teile:{rahmen:"f-status", gabel:G("g-rhythm", 160), daempfer:D("d-floatx", "230x60M", "Performance"), laufraeder:L("w-mulletnew", "Micro Spline"),
     reifenVR:"t-butcher", reifenHR:"t-eliminator", ...DEORE, innenlager:"il-bb52", bremsen:B("b-deore", "180/180"),
     stuetze:S("s-oneup", "34.9", 150), ...C35, ...REST}},
  {name:"Enduro: Transition Sentinel V3 X0 AXS (2024)", jahr:2024, sel:["enduro"], ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-sentinel2", gabel:G("g-fox36", 160), daempfer:D("d-floatx", "205x62.5T"), laufraeder:L("w-dtex", "XD"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...X0T, innenlager:"il-dubbsa", bremsen:B("b-mavenbronze", "200/180"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Enduro: Nukeproof Giga 297 Carbon (2023)", jahr:2023, sel:["enduro"], ampel:"gruen",
   teile:{rahmen:"f-giga", gabel:G("g-fox38", 180), daempfer:D("d-x2", "205x60T"), laufraeder:L("w-horizon", "Micro Spline"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...XT, innenlager:"il-mt800", bremsen:B("b-xt", "203/203"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Enduro: Orbea Rallon M-LTD (2023)", sel:["enduro"], ampel:"gruen",
   teile:{rahmen:"f-rallon", gabel:G("g-fox38", 170), daempfer:D("d-x2", "230x60M"), laufraeder:L("w-dtex1501", "Micro Spline"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...XT, innenlager:"il-mt800", bremsen:B("b-xt", "203/203"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Enduro: Mondraker Foxy Carbon RR (2023)", sel:["enduro"], ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-foxy", gabel:G("g-fox36", 160), daempfer:D("d-floatx", "205x65T"), laufraeder:L("w-dtex", "XD"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...GXT, innenlager:"il-dubbsa", bremsen:B("b-code", "200/180"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Enduro: Ibis HD6 · Mullet (2024)", jahr:2024, sel:["enduro"], ampel:"gelb", gelb:[ADAPT_H],
   teile:{rahmen:"f-hd6", gabel:G("g-zeb", 180), daempfer:D("d-sdcoil", "230x65M"), laufraeder:L("w-mulletex", "XD"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...X0T, innenlager:"il-dubbsa", bremsen:B("b-code", "200/200"),
     stuetze:S("s-oneup", "34.9", 180), ...C35, ...REST}},
  {name:"Enduro: Pivot Firebird Pro X0 · Super Boost 157 (2024)", sel:["enduro"], ampel:"gruen",
   teile:{rahmen:"f-firebird", gabel:G("g-fox38", 170), daempfer:D("d-x2", "205x65T"), laufraeder:L("w-dtsb1700", "XD"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...X0T, innenlager:"il-dubpf92w", bremsen:B("b-xt", "203/203"),
     stuetze:S("s-fox", "34.9", 175), ...C35, ...REST}},
  {name:"Enduro: Cube Stereo ONE55 C:62 TM (2023)", sel:["enduro"], ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-one55", gabel:G("g-fox36", 160), daempfer:D("d-floatx", "205x60T"), laufraeder:L("w-newmenphase", "XD"),
     reifenVR:"t-magicmary", reifenHR:"t-bigbetty", ...GXT, innenlager:"il-dubbsa", bremsen:B("b-mt7", "203/180"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Enduro: Canyon Torque CF 8 (2023)", sel:["enduro"], ampel:"gruen",
   teile:{rahmen:"f-torque", gabel:G("g-fox38", 170), daempfer:D("d-x2", "250x70M"), laufraeder:L("w-dtex", "Micro Spline"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...XT, innenlager:"il-mt800", bremsen:B("b-xt", "203/203"),
     stuetze:S("s-oneup", "30.9", 180), ...C35, ...REST}},

  /* ── Downhill ── */
  {name:"DH: Santa Cruz V10 8 CC X01 (2024)", sel:["dh"], ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-v10", gabel:"g-fox40", daempfer:D("d-dhx2", "250x75M"), laufraeder:"w-e13lg1",
     reifenVR:"t-assegaidh", reifenHR:"t-dhr2dh", ...DH7, innenlager:["il-dubbsa", {"Gehäuse":"BSA 83 (DH)"}], bremsen:B("b-codesilver", "220/200"),
     stuetze:S("s-starr", "31.6"), ...CDH, ...REST}},
  {name:"DH: Trek Session 9.9 X01 (2023)", sel:["dh"], ampel:"gruen",
   teile:{rahmen:"f-session", gabel:G("g-boxxer", 200), daempfer:D("d-sdcoil", "250x72.5M"), laufraeder:L("w-dtfr29", "XD"),
     reifenVR:"t-assegaidh", reifenHR:"t-dhr2dh", ...DH7, innenlager:["il-dubbsa", {"Gehäuse":"BSA 83 (DH)"}], bremsen:B("b-codeult", "200/200"),
     stuetze:S("s-starr", "31.6"), ...CDH, ...REST}},
  {name:"DH: Commencal Supreme DH V5 Race · Saint · Mullet (2023)", sel:["dh"], ampel:"gruen",
   teile:{rahmen:"f-supreme", gabel:"g-fox40", daempfer:D("d-dhx2", "250x75M"), laufraeder:"w-spankSB",
     reifenVR:"t-dhf", reifenHR:"t-dhr2dh", ...SAINT, innenlager:"il-bb71c", bremsen:B("b-saint", "203/203"),
     stuetze:S("s-starr", "31.6"), ...CDH, ...REST}},
  {name:"DH: Canyon Sender CFR · 148/BSA83 (2025)", jahr:2025, sel:["dh"], ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-sender", gabel:"g-fox40", daempfer:D("d-x2", "250x75M"), laufraeder:L("w-hope", "XD", {Vorderachse:"110x20"}),
     reifenVR:"t-assegaidh", reifenHR:"t-dhr2dh", ...DH7, innenlager:["il-dubbsa", {"Gehäuse":"BSA 83 (DH)"}], bremsen:B("b-codeult", "220/200"),
     stuetze:S("s-starr", "30.9"), ...CDH, ...REST}},
  {name:"DH: YT Tues Core 4 · 148/BSA83 (2024)", sel:["dh"], ampel:"gruen",
   teile:{rahmen:"f-tues", gabel:G("g-boxxer", 200), daempfer:D("d-sdcoil", "250x75M"), laufraeder:L("w-hope", "XD", {Vorderachse:"110x20"}),
     reifenVR:"t-assegaidh", reifenHR:"t-dhr2dh", ...DH7, innenlager:["il-dubbsa", {"Gehäuse":"BSA 83 (DH)"}], bremsen:B("b-codeult", "200/200"),
     stuetze:S("s-starr", "31.6"), ...CDH, ...REST}},
  {name:"DH: Propain Rage CF 29 · Saint (2022)", sel:["dh"], ampel:"gruen",
   teile:{rahmen:"f-rage", gabel:"g-fox40", daempfer:D("d-dhx2", "225x75T"), laufraeder:"w-dtfr29",
     reifenVR:"t-dhf", reifenHR:"t-dhr2dh", ...SAINT, innenlager:["il-bb80", {"Gehäuse":"BSA 83 (DH)"}], bremsen:B("b-saint", "203/203"),
     stuetze:S("s-starr", "31.6"), ...CDH, ...REST}},
  {name:"DH: Cube Two15 Race 27.5 (2022)", sel:["dh"], ampel:"gruen",
   teile:{rahmen:"f-two15", gabel:"g-bomber58", daempfer:D("d-bomber210", "250x75M"), laufraeder:"w-dtfr275",
     reifenVR:"t-assegaidh", reifenHR:"t-dhr2dh", ...GXDH, innenlager:["il-dubbsa", {"Gehäuse":"BSA 83 (DH)"}], bremsen:B("b-mt5", "203/203"),
     stuetze:S("s-starr", "31.6"), ...CDH, ...REST}},
  {name:"DH: Specialized Demo Race · Mullet (2023)", sel:["dh"], ampel:"gelb", gelb:[ADAPT_H],
   teile:{rahmen:"f-demo", gabel:G("g-boxxer", 200), daempfer:D("d-sdcoil", "225x75T"), laufraeder:L("w-hopemx", "XD", {Vorderachse:"110x20"}),
     reifenVR:"t-assegaidh", reifenHR:"t-dhr2dh", ...DH7, innenlager:["il-dubbsa", {"Gehäuse":"BSA 83 (DH)"}], bremsen:B("b-codeult", "200/200"),
     stuetze:S("s-starr", "30.9"), ...CDH, ...REST}},

  /* ── Dirt / Slopestyle ── */
  {name:"Dirt: NS Bikes Movement 3 · Singlespeed (2022)", sel:["dirt"], ampel:"gruen",
   teile:{rahmen:"f-movement", gabel:"g-pikedj", laufraeder:"w-dirt26qr", reifenVR:"t-dth", reifenHR:"t-dth", ...SS,
     bremsen:B("b-deore2", "160/160"), stuetze:S("s-dirt", "30.9"), lenker:"l-dirt", vorbau:"v-dirt", sattel:"sa-dirt", pedale:"pe-chester", griffe:"gr-ge1"}},
  {name:"Dirt: Dartmoor Two6Player · Singlespeed (2022)", sel:["dirt"], ampel:"gruen",
   teile:{rahmen:"f-two6", gabel:"g-pikedj", laufraeder:"w-dirt26qr", reifenVR:"t-dth", reifenHR:"t-dth", ...SS,
     bremsen:B("b-deore2", "160/160"), stuetze:S("s-dirt", "30.9"), lenker:"l-dirt", vorbau:"v-dirt", sattel:"sa-dirt", pedale:"pe-chester", griffe:"gr-ge1"}},
  {name:"Slope: NS Bikes Soda Slope (2021)", sel:["slope"], ampel:"gruen",
   teile:{rahmen:"f-soda", gabel:"g-pikedj", daempfer:D("d-dps", "190x50M"), laufraeder:"w-dirt26qr", reifenVR:"t-dth", reifenHR:"t-dth", ...SS,
     bremsen:B("b-deore2", "160/160"), stuetze:S("s-dirt", "30.9"), lenker:"l-dirt", vorbau:"v-dirt", sattel:"sa-dirt", pedale:"pe-chester", griffe:"gr-ge1"}},

  /* ── Trial ── */
  {name:"Trial: Echo Mark VI Mod 20″ · Felgenbremse (2021)", sel:["trial"], ampel:"gruen",
   teile:{rahmen:"f-echo", gabel:["g-trial20", {Steuerrohr:"tapered"}], laufraeder:"w-trialmod", reifenVR:"t-creepy", reifenHR:"t-eagle19",
     kassette:"ka-trial", kette:"ke-ss", kurbel:"k-trialmod", innenlager:"il-trialsp", bremsen:"b-hs33",
     lenker:"l-trial", vorbau:"v-trial", pedale:"pe-trial", griffe:"gr-trial"}},
  {name:"Trial: Inspired Fourplay 24″ · 135×12 (2021)", sel:["trial"], ampel:"gruen",
   teile:{rahmen:"f-fourplay", gabel:"g-trial24", laufraeder:["w-trial24", {Nabenbreite:"135x12"}], reifenVR:"t-holyroller", reifenHR:"t-holyroller",
     kassette:"ka-trial", kette:"ke-ss", kurbel:"k-trial", innenlager:"il-trialbsa", bremsen:"b-hs33",
     stuetze:S("s-spmenace", "27.2"), sattel:"sa-spmenace", lenker:"l-trial", vorbau:"v-trial", pedale:"pe-trial", griffe:"gr-trial"}},

  /* ── Hardtail Trail ── */
  {name:"Hardtail: Commencal Meta HT AM Ride · IS-Aufnahme hinten (2022)", ampel:"gelb", gelb:["IS-Aufnahme hinten"],
   teile:{rahmen:"f-metaht", gabel:G("g-z2", 150), laufraeder:L("w-newmenphase", "Micro Spline"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...DEORE, innenlager:"il-bb52", bremsen:B("b-deore", "180/180"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Hardtail: Nukeproof Scout 290 Race (2024)", jahr:2024, ampel:"gruen",
   teile:{rahmen:"f-scout", gabel:G("g-pike", 140), laufraeder:L("w-horizon", "Micro Spline"),
     reifenVR:"t-dhf25", reifenHR:"t-dhr2", ...DEORE, innenlager:"il-bb52", bremsen:B("b-mt420", "180/180"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"Hardtail: Santa Cruz Chameleon 8 (2022)", ampel:"gruen",
   teile:{rahmen:"f-chameleon", gabel:G("g-pike", 130), laufraeder:L("w-newmenphase", "HG"),
     reifenVR:"t-dhf23", reifenHR:"t-dissector", ...NX, innenlager:"il-dubbsa", bremsen:B("b-g2", "180/180"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},

  /* ── E-MTB: Full Power ── */
  {name:"E-MTB: Trek Rail+ 9.8 GX AXS T-Type · Bosch CX Gen 5 (2025)", jahr:2025, sel:["enduro"], fahrer:80, ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-rail", gabel:G("g-fox36", 160), daempfer:D("d-floatx", "205x65T"), laufraeder:L("w-dthx", "XD"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...GXT, kurbel:"k-ex0t", bremsen:B("b-codesilver", "220/200"),
     stuetze:S("s-oneup", "34.9", 180), ...C35, ...REST}},
  {name:"E-MTB: Specialized Turbo Levo 4 Expert · Specialized 3.1 (2025)", jahr:2025, fahrer:80, ampel:"gruen",
   teile:{rahmen:"f-levo4", gabel:G("g-fox38", 160), daempfer:D("d-floatx", "210x55M"), laufraeder:L("w-dthx", "XD"),
     reifenVR:"t-butcher", reifenHR:"t-eliminator", ...GXT, kurbel:"k-epraxis", bremsen:B("b-codesilver", "220/200"),
     stuetze:S("s-oneup", "34.9", 180), ...C35, ...REST}},
  {name:"E-MTB: Orbea Wild M-Team · Bosch CX (2023)", sel:["enduro"], fahrer:80, ampel:"gruen",
   teile:{rahmen:"f-wild", gabel:G("g-fox38", 170), daempfer:D("d-x2", "205x65T"), laufraeder:"w-dthx29",
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...XT, kurbel:"k-eaeffect", bremsen:B("b-xtr4", "203/203"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},
  {name:"E-MTB: Cube Stereo Hybrid 160 HPC ActionTeam 27.5 · Bosch CX (2023)", sel:["enduro"], fahrer:80, ampel:"gruen",
   teile:{rahmen:"f-stereohy", gabel:G("g-fox38", 170), daempfer:D("d-floatx", "205x65T"), laufraeder:L("w-dtex27", "Micro Spline"),
     reifenVR:"t-magicmary", reifenHR:"t-bigbetty", ...XT, kurbel:"k-eaeffect", bremsen:B("b-mt7", "203/203"),
     stuetze:S("s-oneup", "31.6", 150), ...C35, ...REST}},
  {name:"E-MTB: YT Decoy MX Core 4 · Shimano EP8 (2023)", sel:["enduro"], fahrer:80, ampel:"gruen",
   teile:{rahmen:"f-decoy", gabel:G("g-fox38", 170), daempfer:D("d-x2", "230x65M"), laufraeder:L("w-cbmullet", "Micro Spline"),
     reifenVR:"t-assegai", reifenHR:"t-dhr2", ...XT, kurbel:"k-eshimano", bremsen:B("b-xt", "203/203"),
     stuetze:S("s-oneup", "31.6", 180), ...C35, ...REST}},

  /* ── E-MTB: Light ── */
  {name:"Light-E: Trek Fuel EXe 9.8 XT · TQ HPR50 (2023)", fahrer:80, ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-fuelexe", gabel:G("g-fox36", 150), daempfer:D("d-floatx", "205x60T"), laufraeder:"w-bontline",
     reifenVR:"t-dissector", reifenHR:"t-rekon24", ...XT, kurbel:"k-ehelix", bremsen:B("b-xt", "203/180"),
     stuetze:S("s-oneup", "34.9", 150), ...C35, ...REST}},
  {name:"Light-E: Orbea Rise M10 · Shimano EP801-RS (2023)", fahrer:80, ampel:"gelb", gelb:[ADAPT_V],
   teile:{rahmen:"f-rise", gabel:G("g-fox36", 150), daempfer:D("d-floatx", "210x55M"), laufraeder:"w-dtxm1700",
     reifenVR:"t-dissector", reifenHR:"t-rekon24", ...XT, kurbel:"k-eshimano", bremsen:B("b-xt", "203/180"),
     stuetze:S("s-oneup", "31.6", 150), ...C35, ...REST}}
];
