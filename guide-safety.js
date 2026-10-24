/* Gemeinsame, feste Soforthilfe für App und KI-Server. Keine Diagnose, kein API-Aufruf. */
(function(root){
  "use strict";
  const normal = value => String(value || "").toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
  const cases = {
    unknown:{
      slot:"bremsen",
      de:"Wenn etwas aus der Bremse herausgefallen ist: vorerst nicht weiterfahren. Ich kann ohne genauere Beschreibung nicht sicher sagen, welches Teil es ist. Zieh den Hebel nicht weiter und setze nichts auf Verdacht wieder ein. Beschreibe das lose Teil und die Stelle, aus der es kam. Ist Flüssigkeit ausgetreten, und welches Bremsmodell hast du? Bei einem offenen oder undichten System muss die Werkstatt prüfen.",
      en:"If something has fallen out of a brake, do not ride for now. Without a clearer description I cannot safely identify the part. Do not pull the lever again or put anything back on a guess. Describe the loose part and where it came from. Has fluid leaked, and what brake model is it? An open or leaking system needs workshop inspection."
    },
    piston:{
      slot:"bremsen",
      de:"Wenn ein Bremskolben ganz herausgefallen oder beschädigt ist: nicht weiterfahren und den Bremshebel nicht weiterziehen. Der Kolben drückt die Beläge an die Scheibe; die Bremse kann jetzt undicht sein. Nicht einfach wieder einsetzen, pumpen oder Flüssigkeit nachfüllen. Lass die Bremse in einer Fachwerkstatt prüfen. Ist der Kolben ganz draußen oder steht er nur weiter heraus, und welches genaue Bremsmodell hast du?",
      en:"If a brake piston has fallen out completely or is damaged, do not ride or pull the brake lever again. The piston pushes the pads against the rotor; the brake may now leak. Do not simply put it back, pump the lever or top up fluid. Have a bike workshop inspect it. Is the piston completely out or only sticking out further, and what exact brake model is it?"
    },
    advanced:{
      slot:"bremsen",
      de:"Zieh den Bremshebel ohne Rad oder passenden Abstandshalter nicht weiter. Wenn die Kolben nur vorgerückt sind, ist das etwas anderes als ein ganz herausgefallener Kolben. Bitte keinen Schraubendreher dazwischenzwängen und nicht auf Verdacht zurückdrücken. Bei Ölspuren oder herausgefallenem Kolben nicht fahren; Werkstatt. Sind die Beläge noch drin, sitzt der Kolben noch im Sattel und welches Bremsmodell hast du?",
      en:"Do not pull the brake lever again without the wheel or the correct spacer. Pistons that have only moved forward differ from a piston that has fallen out. Do not force a screwdriver between them or push them back on a guess. If fluid leaked or a piston fell out, do not ride; use a bike workshop. Are the pads still fitted, is the piston still in the caliper, and what brake model is it?"
    },
    leak:{
      slot:"bremsen",
      de:"Bei Flüssigkeitsverlust an der Bremse: nicht weiterfahren. Zieh den Hebel nicht weiter und prüfe nur von außen, wo es nass ist. Eine undichte Leitung, Dichtung oder ein anderes beschädigtes Teil ist möglich; aus der Ferne ist das keine sichere Diagnose. Nicht nachfüllen, Schrauben stärker anziehen oder nur entlüften, um das Leck zu überdecken. Lass die Bremse prüfen. Wo ist es nass, und welches genaue Modell hast du?",
      en:"If a brake is leaking fluid, do not ride. Do not keep pulling the lever; only look from outside to see where it is wet. A hose, seal or another damaged part could be responsible; I cannot diagnose it remotely. Do not top it up, tighten bolts harder or just bleed it to hide the leak. Have it inspected. Where is it wet, and what exact model is it?"
    },
    loss:{
      slot:"bremsen",
      de:"Wenn die Bremse nicht zuverlässig bremst oder der Hebel bis zum Lenker geht: nicht weiterfahren. Luft ist nur eine mögliche Ursache; auch ein Leck oder ein Defekt kommt infrage. Schau im Stand von außen nach sichtbaren Schäden oder Ölspuren, ohne etwas zu öffnen. Lass die Bremse in einer Fachwerkstatt prüfen. Trat es plötzlich, nach Arbeiten oder nach einer heißen Abfahrt auf, und welches Modell ist es?",
      en:"If the brake does not stop reliably or the lever reaches the handlebar, do not ride. Air is only one possible cause; a leak or fault is also possible. While stationary, look for visible damage or fluid without opening anything. Have a bike workshop inspect it. Did it start suddenly, after work on the bike or after a hot descent, and what model is it?"
    },
    contamination:{
      slot:"bremsen",
      de:"Mit Öl oder Fett auf Bremsbelägen darfst du dich nicht auf die Bremswirkung verlassen: nicht weiterfahren. Verunreinigte Beläge müssen ersetzt werden; Ausbrennen oder Abschleifen macht sie nicht verlässlich sicher. Eine verschmutzte Scheibe wird nach Herstelleranleitung gereinigt. Erst klären, ob die Bremse selbst undicht ist. Was kam auf Beläge oder Scheibe, und welches Bremsmodell hast du?",
      en:"Do not rely on braking with oil or grease on the pads: do not ride. Contaminated pads need replacement; burning or sanding them does not reliably make them safe. Clean a contaminated rotor according to its manufacturer's instructions. First check whether the brake itself is leaking. What got onto the pads or rotor, and what brake model is it?"
    },
    fluid:{
      slot:"bremsen",
      de:"Wenn falsche oder unbekannte Flüssigkeit in die Bremse gefüllt wurde: nicht weiterfahren und nichts nachfüllen. Die nötige Flüssigkeit hängt vom genauen Modell ab; die Marke allein reicht nicht. Falsche Flüssigkeit kann Dichtungen beschädigen. Einfaches Spülen ist keine sichere Universallösung. Lass eine Fachwerkstatt das weitere Vorgehen prüfen. Welche Bremse und welche genaue Flüssigkeit sind es, und wurde sie schon eingefüllt?",
      en:"If the wrong or an unknown fluid went into the brake, do not ride or add more. The required fluid depends on the exact model; the brand alone is not enough. The wrong fluid can damage seals. Flushing is not a universally safe fix. Have a bike workshop check what is needed. What brake and exact fluid are involved, and has it already been added?"
    },
    structure:{
      slot:"rahmen",
      de:"Bei einem möglichen Riss oder Bruch an Rahmen, Gabel, Lenker oder Bremsscheibe: nicht weiterfahren und nicht durch Belastung testen. Ob nur der Lack oder das Bauteil beschädigt ist, lässt sich aus der Beschreibung nicht sicher entscheiden. Nicht kleben, richten oder weiter festziehen. Lass das Teil fachlich prüfen. Wo genau ist der Schaden, an welchem Modell und nach welchem Ereignis?",
      en:"If the frame, fork, handlebar or brake rotor may be cracked or broken, do not ride or load-test it. A description cannot reliably distinguish paint damage from structural damage. Do not glue it, straighten it or tighten it further. Have the part professionally inspected. Where is the damage, what model is it, and what happened beforehand?"
    },
    loose:{
      slot:"laufraeder",
      de:"Wenn Laufrad, Achse, Lenker oder Vorbau locker sind: nicht weiterfahren. Halte das Rad im Stand und beschreibe nur, wo sich etwas bewegt; keine Probefahrt zum Testen. Welche Befestigung betroffen ist und das richtige Drehmoment hängen vom Modell ab. Nicht mit einem geratenen Wert festziehen. Wenn du die vorgeschriebene Montage nicht sicher kennst, lass sie prüfen. Welches Teil bewegt sich genau?",
      en:"If a wheel, axle, handlebar or stem is loose, do not ride. Keep the bike stationary and describe where something moves; do not take a test ride. The correct fastening and torque depend on the model. Do not tighten it to a guessed value. If you are unsure of the specified assembly, have it checked. Which part moves exactly?"
    },
    pressure:{
      slot:"daempfer",
      de:"Öffne Gabel, Dämpfer oder Ausgleichsbehälter nicht auf Verdacht: darin kann noch hoher Druck sein. Eine drucklose Luftfeder beweist nicht, dass alle Kammern drucklos sind. Nichts aufschrauben, anbohren oder erhitzen. Für Arbeiten an inneren Druckkammern braucht es die passende Serviceanleitung und Fachkenntnis; im Zweifel Werkstatt. Welches Modell und welches Bauteil meinst du?",
      en:"Do not open a fork, shock or reservoir on a guess: it may still contain high pressure. An empty air spring does not prove that all chambers are depressurised. Do not unscrew, drill or heat it. Internal pressure-chamber work needs the correct service manual and expertise; if unsure, use a workshop. Which model and part do you mean?"
    },
    battery:{
      slot:"rahmen",
      de:"Bei einem aufgeblähten, rauchenden oder ungewöhnlich heißen E-Bike-Akku: nicht weiterfahren, nicht laden und nicht öffnen. Halte Abstand; berühre oder bewege einen heißen oder rauchenden Akku nicht. Bei Rauch oder Feuer bring dich und andere in Sicherheit und rufe den örtlichen Notruf. Bei sichtbarer Beschädigung ohne akute Gefahr wende dich an den Hersteller oder Fachbetrieb.",
      en:"If an e-bike battery is swollen, smoking or unusually hot, do not ride, charge or open it. Keep your distance; do not touch or move a hot or smoking battery. If there is smoke or fire, move yourself and others to safety and call local emergency services. For visible damage without immediate danger, contact the manufacturer or a specialist."
    }
  };
  function classify(text, previous){
    const n = " " + normal(text) + " ";
    if(/^(anderes thema|andere frage|neues thema|new topic|different question|unrelated question)\b/.test(normal(text))) previous = null;
    const brake = /brems|brake|caliper|kolben|piston/.test(n);
    if(/akku|batter/.test(n) && /aufgeblaeht|schwell|smok|rauch|brenn|fire|swollen|sehr heiss|extremely hot/.test(n)) return "battery";
    if(/kolben|piston/.test(n) && /rausgefallen|herausgefallen|raus gefallen|heraus gefallen|faellt (?:raus|rus|heraus)|fiel (?:raus|heraus)|ganz (?:draussen|raus|heraus)|abgebroch|abgesplitter|fell out|fallen out|popped out|fully out|cracked piston/.test(n)) return "piston";
    if(brake && /rausgefallen|herausgefallen|raus gefallen|fell out|fallen out/.test(n)) return "unknown";
    if(brake && /(?:falsch|wrong|verwechsel|mixed|unbekannt).{0,45}(?:oel|oil|fluid|dot|fluessig)|(?:oel|oil|fluid|dot|fluessig).{0,45}(?:falsch|wrong|verwechsel|mixed)|dot.{0,30}mineral|mineral.{0,30}dot/.test(n) && /eingefuellt|gefuellt|gemischt|mixed|added|poured|verwechselt|falsch|wrong/.test(n)) return "fluid";
    if(brake && /undicht|leak|verliert (?:oel|fluessigkeit)|oel (?:laeuft|tritt|kommt)|fluessigkeit (?:laeuft|tritt|kommt)|tropft|ausgelaufen/.test(n)) return "leak";
    if(/(?:oel|oil|fett|grease|wd ?40|spray).{0,35}(?:belag|belaeg|pad|scheibe|rotor)|(?:belag|belaeg|pad|scheibe|rotor).{0,35}(?:veroelt|oelig|oel|oil|grease|fett|wd ?40)/.test(n)) return "contamination";
    if(brake && /bremst (?:gar )?nicht|brake.{0,10}(?:fail|not working)|no (?:brakes|braking|bite point)|kein(?:en)? druckpunkt|kein(?:en)? bremsdruck|druckpunkt (?:weg|fehlt)|hebel.{0,28}(?:bis zum lenker|an den lenker)|lever.{0,25}(?:to the bar|handlebar)/.test(n)) return "loss";
    if(/(?:rahmen|frame|gabel|fork|lenker|handlebar|bremsscheibe|rotor).{0,50}(?:riss|gerissen|gebrochen|crack|broken)|(?:riss|crack|bruch).{0,40}(?:rahmen|frame|gabel|fork|lenker|handlebar|bremsscheibe|rotor)/.test(n)) return "structure";
    if(/(?:laufrad|vorderrad|hinterrad|wheel|achse|axle|lenker|handlebar|vorbau|stem).{0,35}(?:locker|lose|loose|wackelt)|(?:locker|loose).{0,25}(?:wheel|axle|stem|lenker)/.test(n)) return "loose";
    if(/daempfer|gabel|shock|fork|ausgleichsbehaelter|reservoir/.test(n) && /aufschraub|oeffnen|aufmachen|anbohr|unscrew|drill|open/.test(n) && /druck|druckkammer|pressure|reservoir|ausgleichsbehaelter|kartusche|damper|stickstoff|nitrogen/.test(n)) return "pressure";
    if((brake || /hebel|lever|belaeg|pads/.test(n)) && /ohne (?:das )?(?:rad|laufrad)|without (?:the )?wheel|belaege (?:zusammen|zu eng)|pads (?:stuck|together)/.test(n) && /gezog|gedrueck|hebel|lever|kolben|piston|pads|belaeg/.test(n)) return "advanced";
    // Nur eine gezielte Anschlussfrage übernimmt den aktuellen Schaden. Kein Verlauf wird übertragen.
    const brakeCase = /^(?:piston|advanced|leak|loss|unknown|fluid|contamination)$/.test(previous || "");
    const modelReply = /^(?:(?:es ist|ich habe|nur hinten|nur vorne|it is|i have) (?:eine? |a |an )?)?(?:shimano|sram|magura|hope|trp|tektro|hayes|formula|xt|slx|deore|m[0-9]{4})(?: [a-z0-9 -]{1,65})?$/.test(normal(text));
    if(brakeCase && modelReply) return previous;
    if(/^(?:piston|advanced|unknown)$/.test(previous || "") && /nur.{0,20}(?:weiter|vorgerueckt)|only.{0,20}sticking out/.test(n)) return "advanced";
    if(cases[previous] && /^(?:piston|advanced|leak|loss|unknown|fluid|contamination)$/.test(previous)
      && /entlueft|bleed|kolben|piston|bremsbelaeg|bremsbelag|brake pad|bremssattel|caliper|pumpen|pump|nachfuellen|top up|zurueck|zurueckdruecken|einsetzen|setze.{0,20}ein|insert|put it back|schraubendreher|screwdriver/.test(n)) return previous;
    if(cases[previous] && /^(?:ja|nein|weiss ich nicht|keine ahnung|yes|no|not sure|i don t know|kein oel|keine fluessigkeit)\b/.test(normal(text))) return previous;
    if(cases[previous] && /(?:weiter|wieder|noch|nur|trotzdem).{0,15}fahren|kann ich.{0,35}(?:fahren|einsetzen|druecken|pumpen)|can i.{0,35}(?:ride|push|insert|pump)|put it back|zurueckdruecken|wieder einsetzen|ganz draussen|fully out/.test(n)) return previous;
    return null;
  }
  function answer(text, language, previous){
    const kind = classify(text, previous);
    if(!kind) return null;
    const item = cases[kind];
    return {kind, slot:item.slot, answer:language === "en" ? item.en : item.de};
  }
  root.CrankGuideSafety = Object.freeze({answer, classify});
})(globalThis);
