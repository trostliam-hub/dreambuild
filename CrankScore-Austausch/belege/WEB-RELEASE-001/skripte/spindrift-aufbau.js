/* Im App-Kontext: stimmigen Enduro-Aufbau mit Propain-Spindrift-Rahmen zusammenstellen (nur ueber die
   App-eigene Pruefung pruefe() und den Katalog K) */
window.spindriftAufbau = function(){
  sel = ['enduro']; plan.budget = 7000; Object.assign(build, generiere()); build.rahmen = 'f-spindrift';
  const zahl = b => { const r = pruefe(b); return [r.filter(x => x.level === 'fehler').length, r.filter(x => x.level === 'warnung' || x.level === 'warn').length]; };
  for(let runde = 0; runde < 4; runde++){
    const offen = pruefe(build).filter(x => x.level === 'fehler' && x.fixSlot);
    if(!offen.length) break;
    for(const f of offen){
      const k = f.fixSlot; let best = null, bz = zahl(build), be = -1;
      for(const t of (K[k] || [])){
        const b2 = {...build, [k]: t.id}, z = zahl(b2), e = (t.eignung && t.eignung.enduro) || 0;
        if(z[0] < bz[0] || (z[0] === bz[0] && z[1] < bz[1]) || (z[0] === bz[0] && z[1] === bz[1] && best && e > be)){ best = t.id; bz = z; be = e; }
      }
      if(best) build[k] = best;
    }
  }
  /* Gabel: Federweg zur Rahmenfreigabe, ohne neue Fehler; dann Budget mit Luft */
  { const n = b => pruefe(b).filter(x => x.level !== 'ok').length; let best = build.gabel, bn = n(build), be = -1;
    for(const t of (K.gabel || [])){ const b2 = {...build, gabel: t.id};
      if(pruefe(b2).some(x => x.level === 'fehler')) continue;
      const z = n(b2), e = (t.eignung && t.eignung.enduro) || 0;
      if(z < bn || (z === bn && e > be && t.p <= 1300)){ best = t.id; bn = z; be = e; } }
    build.gabel = best; }
  plan.budget = 8000;
  sichern(); zeichne(); return JSON.stringify(pruefe(build).map(x => x.level + ': ' + x.titel));
};
