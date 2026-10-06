/* Ein Weg je Aufgabe (Doppelungen-Pruefung 06.10.2026).
 *
 * Laedt index.html in Chromium und prueft fuer die 18 Fundgruppen, dass die
 * entfernten Einstiege weg sind und der eine verbleibende Weg funktioniert:
 * neuer Nutzer, vollstaendiges und unvollstaendiges Rad, Konflikt, ueber
 * Budget, Upgrade, mehrere Raeder, alle drei Modi, Free und Pro (Testzustand
 * wie in setup-test.mjs), Handy und Desktop, Deutsch und Englisch, dazu
 * Migration und Erhalt gespeicherter Daten nach dem Neuladen.
 *
 * Aufruf:   node tools/wege-test.mjs      (oder: npm run test:wege)
 * Ergebnis: letzte Zeile "WEGE: x von n Pruefungen bestanden", Exit-Code 1
 *           bei einem Fehler, einem JS-Fehler oder fehlenden Pruefungen.
 */
import { createRequire } from 'module';
import { execSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let pw;
try{ pw = require('playwright'); }
catch(e){ pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYP = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.woff2':'font/woff2', '.webmanifest':'application/manifest+json'};
const server = http.createServer((q, a) => {
  const p = path.join(wurzel, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if(!p.startsWith(wurzel) || !fs.existsSync(p) || fs.statSync(p).isDirectory()){ a.writeHead(404); a.end(); return; }
  a.writeHead(200, {'Content-Type':TYP[path.extname(p)] || 'application/octet-stream'}); fs.createReadStream(p).pipe(a);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/index.html`;

const browser = await pw.chromium.launch();
const ctx = await browser.newContext({viewport:{width:390, height:844}});
await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
const seite = await ctx.newPage();
const jsFehler = [];
seite.on('pageerror', e => jsFehler.push(e.message));
seite.on('console', m => { if(m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) jsFehler.push(m.text()); });
const bereit = () => seite.waitForFunction(() => typeof zeichne === 'function' && typeof oeffneWiz === 'function' && !!document.querySelector('#aufbau .grp'));
/* Bekannter Nutzer: Einstieg und Rundgang schon gesehen */
const neu = async (spr) => {
  await seite.goto(URL0);
  await seite.evaluate(s => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.sprache', s || 'de'); }, spr);
  await seite.reload(); await bereit();
};
const ev = (f, a) => seite.evaluate(f, a);
const warte = ms => new Promise(r => setTimeout(r, ms));
const PRO = () => { pro = {key:'x', inst:'i', status:'aktiv', geprueft:Date.now()}; };
/* Sichtbare Knoepfe mit einem Attribut zaehlen (pro Bildschirmzustand) */
const sichtbar = (sel) => ev(q => [...document.querySelectorAll(q)].filter(e => e.offsetParent !== null || e.getClientRects().length).length, sel);

const PRUEFUNGEN = [
  ['01/04/17 Neuer Nutzer: Einstieg nur Ziel und Fahrer, danach Bauziel, kein automatischer Rundgang', async () => {
    await seite.goto(URL0); await ev(() => { localStorage.clear(); localStorage.setItem('mtb.sprache', 'de'); }); await seite.reload();
    /* Erster Start: Startseite, "Starten" fuehrt in den Einstieg */
    await seite.waitForFunction(() => !!document.querySelector('[data-lsstart]') || !!document.querySelector('.ei'));
    await ev(() => { const b = document.querySelector('[data-lsstart]'); if(b) b.click(); });
    await seite.waitForFunction(() => !!document.querySelector('.ei'));
    const r1 = await ev(() => ({schritte:eiSchritte(), modal:!!$('modal').querySelector('.ei')}));
    await ev(() => { ei.ziel = 'traum'; eiFertig(); });
    await warte(1600);
    const r2 = await ev(() => ({wiz:wizOffen(), schritt:wizStep, tour:!!tour, tourEl:!!document.querySelector('.tour, .tk')}));
    return {ok:JSON.stringify(r1.schritte) === JSON.stringify(['hallo', 'ziel', 'erfahrung', 'charakter', 'koerper', 'masse', 'fit', 'fertig']) && r1.modal
      && r2.wiz && r2.schritt === 0 && !r2.tour && !r2.tourEl, info:{r1, r2}}; }],
  ['01/02 Fahrerprofil: ein Editor unter Einstellungen, keine zweite Gewichts- oder Masseingabe', async () => {
    await neu();
    await ev(() => oeffneMenu());
    const m = await ev(() => ({fp:$('modal').querySelectorAll('[data-fahrerprofil]').length, mf:!!$('m-fahrer'), mb:!!$('m-budget'),
      start:$('modal').querySelectorAll('[data-hilfe="start"]').length, fit:$('modal').querySelectorAll('[data-fit]').length, fed:$('modal').querySelectorAll('[data-fed]').length}));
    await ev(() => $('modal').querySelector('[data-fahrerprofil]').click());
    const e = await ev(() => ({schritte:eiSchritte(), skip:$('modal').querySelector('.ei-skip').textContent}));
    const g = await ev(() => { eiSetze('fahrer', 500); const hoch = plan.fahrer; eiSetze('fahrer', 5); const tief = plan.fahrer; eiSetze('fahrer', 82); return {hoch, tief, jetzt:plan.fahrer, b:EI_BEREICH.fahrer}; });
    await ev(() => eiSkip());
    /* Keine Masse-Eingaben ausserhalb des Fahrerprofils */
    const rest = await ev(() => { view = 'befunde'; zeichne(); return {fitstart:document.querySelectorAll('[data-fitstart]').length, teaser:document.querySelectorAll('.fit-teaser').length}; });
    return {ok:m.fp === 1 && !m.mf && !m.mb && !m.start && !m.fit && !m.fed && JSON.stringify(e.schritte) === JSON.stringify(['erfahrung', 'charakter', 'koerper', 'masse', 'fit'])
      && g.hoch === 180 && g.tief === 30 && g.jetzt === 82 && !rest.fitstart && !rest.teaser, info:{m, e, g, rest}}; }],
  ['03 Budget nur im Bauziel, eine Regel, je Rad', async () => {
    await neu();
    const r = await ev(() => {
      oeffneWiz(1); const inp = $('w-budget'); const min = inp.min;
      inp.value = '200'; inp.dispatchEvent(new Event('input', {bubbles:true})); const zuKlein = plan.budget, fehler = !!inp.getAttribute('aria-invalid') || !!document.querySelector('.feld-hinweis, [id^="fh-"]');
      inp.value = '5000'; inp.dispatchEvent(new Event('input', {bubbles:true})); const gut = plan.budget;
      schliesse(); const a = aktivId[modus]; profilNeu(); const neuB = plan.budget; profilWechseln(a); const alt = plan.budget;
      return {min, zuKlein, fehler, gut, neuB, alt};
    });
    return {ok:r.min === '400' && r.zuKlein === 0 && r.gut === 5000 && r.neuB === 0 && r.alt === 5000, info:r}; }],
  ['05/14/15/16 Eine Aufgabenkarte: Schritte nur Status, genau ein Knopf, kein Einbau/Ablehnen darin', async () => {
    await neu();
    const r = await ev(() => { const k = $('coach-platz'); return {karten:k.querySelectorAll('.leit').length, schrittKnoepfe:k.querySelectorAll('.leit-s button, button.leit-s').length,
      knoepfe:k.querySelectorAll('.leit button:not(.leit-weg)').length, einbau:k.querySelectorAll('[data-einbau],[data-upnein]').length, coach:!!$('coach'), aufbauLeit:$('aufbau').querySelectorAll('.leit, .wiz-cta, [data-wiz]').length}; });
    return {ok:r.karten === 1 && !r.schrittKnoepfe && r.knoepfe === 1 && !r.einbau && !r.coach && !r.aufbauLeit, info:r}; }],
  ['15 Upgrade: jede Einbau-Aktion genau einmal, nach Einbau neu berechnet', async () => {
    await neu();
    await ev(() => { modus === 'traum' || wechsle('traum'); view = 'upgrades'; zeichne(); vorschlaegeZeichnen(); });
    const vor = await ev(() => { const w = [...document.querySelectorAll('[data-einbau]')].map(b => b.dataset.einbau); return {n:w.length, eindeutig:new Set(w).size === w.length, erst:($('upgrades').querySelector('[data-einbau]') || {}).dataset}; });
    if(!vor.erst) return {ok:false, info:{vor, grund:'kein Upgrade im Startaufbau'}};
    const nach = await ev(e => { const [slot, id] = e.einbau.split('|'); $('upgrades').querySelector(`[data-einbau="${e.einbau}"]`).click(); vorschlaegeZeichnen();
      const w = [...document.querySelectorAll('[data-einbau]')].map(b => b.dataset.einbau);
      return {eingebaut:build[slot] === id || basisVon(build[slot]) === basisVon(id), nochDa:w.indexOf(e.einbau) >= 0, eindeutig:new Set(w).size === w.length}; }, vor.erst);
    return {ok:vor.n > 0 && vor.eindeutig && nach.eingebaut && !nach.nochDa && nach.eindeutig, info:{vor, nach}}; }],
  ['16 Konflikt: Loesungen nur in der Pruefung, nicht unter Upgrades', async () => {
    await neu();
    const r = await ev(() => {
      wechsle('real');
      const rahmen = katalog(quelleOf(slotOf('rahmen'))).find(t => t.daempfer); build.rahmen = rahmen.id;
      const d = katalog(quelleOf(slotOf('daempfer'))).find(t => { build.daempfer = t.id; return pruefe(build).some(b => b.level === 'fehler' && (b.slots || []).indexOf('daempfer') >= 0); });
      sichern(); view = 'befunde'; zeichne(); vorschlaegeZeichnen();
      const upTxt = $('upgrades').textContent;
      const upKopf = [...$('upgrades').querySelectorAll('.up-kopf')].map(e => e.textContent).join(' | ');
      return {konflikt:!!d, loesungen:!!$('loesungen'), upKopf, upLoesung:/Lösung|Ersatz|umstellen/.test(upKopf),
        findKnoepfe:$('findings').querySelectorAll('[data-slot]').length, karteEinbau:$('coach-platz').querySelectorAll('[data-einbau]').length};
    });
    return {ok:r.konflikt && r.loesungen && !r.upLoesung && r.findKnoepfe > 0 && !r.karteEinbau, info:r}; }],
  ['14 Ueber Budget: Aufgabenkarte nennt den Status, Sparen nur unter Upgrades', async () => {
    await neu();
    const r = await ev(() => { plan.budget = 1000; sichern(); zeichne(); const k = $('coach-platz').textContent;
      return {budgetSchritt:/Im Budget bleiben/.test(k), tausch:$('coach-platz').querySelectorAll('[data-einbau]').length}; });
    return {ok:r.budgetSchritt && !r.tausch, info:r}; }],
  ['07 Raeder: Anlegen nur in der Verwaltung, Traumrad weiter ins Bauziel, eigenes Rad zum Rahmen', async () => {
    await neu();
    await ev(PRO => { eval('(' + PRO + ')()'); zeichne(); }, PRO.toString());
    const zeile = await ev(() => ({plus:document.querySelectorAll('#profile .pchip.neu, #profile [data-profneu]').length, verwalten:document.querySelectorAll('#profile [data-profile]').length}));
    await ev(() => oeffneProfile());
    const blatt = await ev(() => ({neu:$('modal').querySelectorAll('[data-profneu]').length, text:$('modal').querySelector('[data-profneu]').textContent.trim(), start:$('modal').querySelectorAll('[data-hilfe="start"]').length}));
    const vorher = await ev(() => profile.traum.length);
    await ev(() => $('modal').querySelector('[data-profneu]').click()); await warte(500);
    const traum = await ev(() => ({n:profile.traum.length, wiz:wizOffen()}));
    await ev(() => { schliesse(); wechsle('real'); zeichne(); oeffneProfile(); $('modal').querySelector('[data-profneu]').click(); }); await warte(500);
    const real = await ev(() => ({n:profile.real.length, slot:offenerSlot}));
    return {ok:!zeile.plus && zeile.verwalten === 1 && blatt.neu === 1 && /Rad anlegen/.test(blatt.text) && !blatt.start && traum.n === vorher + 1 && traum.wiz && real.n === 2 && real.slot === 'rahmen', info:{zeile, blatt, traum, real}}; }],
  ['06/08 Bauziel je Modus: Traumrad mit Budget und Assistent, eigenes Rad und Angebot nur Disziplin und Budget', async () => {
    await neu();
    const r = await ev(() => { const out = {};
      for(const m of ['traum', 'real', 'markt']){ if(modus !== m) wechsle(m); zeichne(); $('btn-disz').click();
        out[m] = {wiz:wizOffen(), bahn:!!$('modal').querySelector('.steps'), budget:!!$('w-budget'), dis:$('modal').querySelectorAll('[data-d]').length,
          weiter:!!$('modal').querySelector('[data-wiz="1"]'), fertig:$('modal').querySelectorAll('[data-zu]').length, karte:$('coach-platz').querySelectorAll('.leit').length}; schliesse(); }
      return out; });
    const ok = r.traum.wiz && r.traum.bahn && r.traum.weiter && r.traum.dis > 3 && ['real', 'markt'].every(m => r[m].wiz && !r[m].bahn && r[m].budget && !r[m].weiter && r[m].dis > 3)
      && ['traum', 'real', 'markt'].every(m => r[m].karte === 1);
    return {ok, info:r}; }],
  ['04 Bauziel-Assistent: fuenf Schritte, Uebernehmen nur auf das offene Rad', async () => {
    await neu();
    const r = await ev(async () => { plan.budget = 3500; sichern(); const n = profile.traum.length, id = aktivId.traum;
      oeffneWiz(4); await new Promise(res => setTimeout(res, 2500));
      const ergebnis = !!$('modal').querySelector('[data-wizfertig]'), schritt = ($('modal').querySelector('.sheet-h h3') || {}).textContent || '';
      $('modal').querySelector('[data-wizfertig]').click();
      return {ergebnis, schritt, gleichesRad:aktivId.traum === id && profile.traum.length === n}; });
    return {ok:r.ergebnis && /5 von 5/.test(r.schritt) && r.gleichesRad, info:r}; }],
  ['09 Setup nur ueber die Navigation: kein Knopf im Aufbau, im Menue oder im Guide', async () => {
    await neu();
    const r = await ev(() => { zeichne(); const auf = document.querySelectorAll('#aufbau [data-fed], .fed-auf').length; oeffneMenu(); const menu = $('modal').querySelectorAll('[data-fed]').length; schliesse();
      return {auf, menu, guide:gAktInfo('fed'), wiz:gAktInfo('wiz'), fit:gAktInfo('fit'), einstieg:gAktInfo('einstieg'), disz:gAktInfo('disz')}; });
    const handy = {tab:await sichtbar('.tabs [data-view="setup"]'), kopf:await sichtbar('#btn-setup')};
    await seite.setViewportSize({width:1280, height:900}); await warte(200);
    const desk = {tab:await sichtbar('.tabs [data-view="setup"]'), kopf:await sichtbar('#btn-setup')};
    await seite.setViewportSize({width:390, height:844});
    return {ok:!r.auf && !r.menu && !r.guide && !r.wiz && !r.fit && !r.einstieg && !r.disz && handy.tab + handy.kopf === 1 && desk.tab + desk.kopf === 1, info:{r, handy, desk}}; }],
  ['10-13 Setup (Pro-Testzustand): ein SAG-Start je Element, eine Testfahrt, ein Angaben-Editor, keine Teilewahl', async () => {
    await neu();
    const r = await ev(PRO => { eval('(' + PRO + ')()'); plan.fahrer = 80; sichern();
      const g = katalog(quelleOf(slotOf('gabel'))).find(t => t.travel > 0); if(g) build.gabel = build.gabel || g.id; sichern();
      view = 'setup'; zeichne(); const s = $('setup');
      const z = q => s.querySelectorAll(q).length;
      const out = {fwslot:z('[data-fwslot]'), sagAlle:z('[data-fwsag="alle"]'), test:z('[data-fwtest]'), blick:z('.su-blick'), trail:z('[data-fxtrail]'), fwob:z('[data-fwob]'), banner:z('button.fw-banner'), begriffe:z('.fw-begriffe')};
      /* SAG-Karte der Gabel oeffnen: genau ein Startknopf, Messung nur fuer die Gabel */
      suKarteZeigen('gabel', 'gabel:sag'); out.sagStart = s.querySelectorAll('[data-fwsag]').length; out.sagWert = (s.querySelector('[data-fwsag]') || {}).dataset;
      s.querySelector('[data-fwsag]').click(); sagW.i = 4; zeigeSheet(sagWizardHtml()); out.messFelder = $('modal').querySelectorAll('[data-fxsagin]').length;
      out.nurGabel = [...$('modal').querySelectorAll('[data-fxsagin]')].every(e => e.dataset.fxsagin === 'gabel'); schliesse();
      return out; }, PRO.toString());
    return {ok:!r.fwslot && !r.sagAlle && r.test === 1 && !r.blick && r.trail === 1 && r.fwob === 1 && !r.banner && !r.begriffe && r.sagStart === 1 && r.sagWert && r.sagWert.fwsag === 'gabel' && r.nurGabel && r.messFelder >= 1, info:r}; }],
  ['10 Testfahrt fragt nach SAG, misst dasselbe Element und kehrt zur Testfahrt zurueck', async () => {
    const r = await ev(() => { const f = federRechnen(); trW = {st:'vorschlag', el:'gabel', sym:'hart', antw:{}, ki:0}; zeigeSheet(testHtml());
      const k = $('modal').querySelector('[data-fwsag="test"]'); if(!k) return {knopf:false};
      k.click(); const slot = sagW.slot, zur = sagW.zurueck; sagW.i = 5; zeigeSheet(sagWizardHtml());
      const zurueckK = !!$('modal').querySelector('[data-fwsagzurueck]'); $('modal').querySelector('[data-fwsagzurueck]').click();
      return {knopf:true, slot, zur, zurueckK, wiederTest:!!$('modal').querySelector('.fw-trwz')}; });
    await ev(() => schliesse());
    return {ok:r.knopf && r.slot === 'gabel' && r.zur && r.zurueckK && r.wiederTest, info:r}; }],
  ['12/02 Setup ohne Gewicht fuehrt ins Fahrerprofil, fragt kein Gewicht und keine Groesse selbst', async () => {
    const r = await ev(PRO => { eval('(' + PRO + ')()'); plan.fahrer = 0; sichern(); view = 'setup'; zeichne();
      const s = $('setup'), hero = s.querySelectorAll('[data-fahrerprofil]').length, start = s.querySelectorAll('[data-fwob="start"]').length;
      plan.fahrer = 80; sichern(); obW = {i:obSchritte().indexOf('gewicht'), einzeln:true, vonEnde:false, tipp:null}; zeigeSheet(obHtml());
      const m = $('modal'), kg = m.querySelectorAll('[data-fwin="kg"]').length, cm = m.querySelectorAll('[data-fcm]').length, profil = /Fahrerprofil/.test(m.textContent);
      obW.i = obSchritte().indexOf('rad'); zeigeSheet(obHtml()); const rj = m.querySelectorAll('[data-fwwk^="rj|"]').length, rad = $('modal').querySelectorAll('[data-fwslot]').length;
      obW.i = obSchritte().indexOf('fahrer'); zeigeSheet(obHtml()); const erf = $('modal').querySelectorAll('[data-fwwk^="erf|"]').length;
      schliesse(); return {hero, start, kg, cm, profil, rj, rad, erf}; }, PRO.toString());
    return {ok:r.hero === 1 && !r.start && !r.kg && !r.cm && r.profil && !r.rj && !r.rad && !r.erf, info:r}; }],
  ['18b/02 Migration: Groesse aus dem Setup ins Fahrerprofil, nichts geloescht', async () => {
    await seite.goto(URL0);
    await ev(() => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.fprofil', JSON.stringify({cm:183, tempo:'zuegig'})); });
    await seite.reload(); await bereit();
    const r = await ev(() => ({groesse:koerper.groesse, cm:fprofil.cm, tempo:fprofil.tempo, gespeichert:JSON.parse(localStorage.getItem('mtb.koerper')).groesse}));
    /* Vorhandene Groesse im Fahrerprofil wird nicht ueberschrieben */
    await ev(() => { localStorage.setItem('mtb.koerper', JSON.stringify({groesse:170})); localStorage.setItem('mtb.fprofil', JSON.stringify({cm:190})); });
    await seite.reload(); await bereit();
    const r2 = await ev(() => ({groesse:koerper.groesse, cm:fprofil.cm}));
    return {ok:r.groesse === 183 && r.cm === 183 && r.tempo === 'zuegig' && r.gespeichert === 183 && r2.groesse === 170 && r2.cm === 190, info:{r, r2}}; }],
  ['Daten bleiben nach Neuladen: Raeder, Budget, Gewicht, Setup-Werte, Pro-Status', async () => {
    await neu();
    await ev(PRO => { eval('(' + PRO + ')()'); plan.fahrer = 77; plan.budget = 4200; profilNeu(); plan.budget = 2600; sichern();
      const f = federRechnen(); if(f.gabel){ suP(suDaten(f)).psi.gabel = 88; suSichern(); } }, PRO.toString());
    const vor = await ev(() => ({n:profile.traum.length, budgets:profile.traum.map(p => (p.id === aktivId.traum ? plan : p.plan).budget), fahrer:plan.fahrer, psi:(() => { const f = federRechnen(); return f.gabel ? suP(suDaten(f)).psi.gabel : null; })()}));
    await seite.reload(); await bereit();
    const nach = await ev(() => ({n:profile.traum.length, budgets:profile.traum.map(p => (p.id === aktivId.traum ? plan : p.plan).budget), fahrer:plan.fahrer, psi:(() => { const f = federRechnen(); return f.gabel ? suP(suDaten(f)).psi.gabel : null; })()}));
    return {ok:JSON.stringify(vor) === JSON.stringify(nach) && nach.n === 2 && nach.fahrer === 77, info:{vor, nach}}; }],
  ['18c Desktop: Einkaufsliste nur im Kaufbereich, daneben nur die Summe', async () => {
    await neu();
    await seite.setViewportSize({width:1280, height:900}); await warte(200);
    const r = await ev(() => { view = 'aufbau'; zeichne(); const neben = $('einkauf').querySelectorAll('.ek').length, knopf = $('einkauf').querySelectorAll('[data-view="deals"]').length;
      $('einkauf').querySelector('[data-view="deals"]').click(); const voll = $('einkauf').querySelectorAll('.ek').length;
      const dealsEinbau = $('deals').querySelectorAll('[data-einbau]').length; view = 'aufbau'; zeichne(); return {neben, knopf, voll, dealsEinbau}; });
    await seite.setViewportSize({width:390, height:844});
    return {ok:!r.neben && r.knopf === 1 && r.voll > 3 && !r.dealsEinbau, info:r}; }],
  ['17 Hilfe: eine Begriffsliste mit Fahrwerk, Englisch ohne deutsche Reste in den neuen Texten', async () => {
    await neu('en');
    const r = await ev(() => { oeffneBegriffe(); const b = $('modal').textContent; schliesse(); oeffneMenu(); const m = $('modal').textContent; schliesse(); zeichne();
      const k = $('coach-platz').textContent, auf = $('setup').textContent;
      return {sag:/Sag/.test(b) && /Rebound/.test(b), boost:/Boost/.test(b), rider:/Rider profile/.test(m), terms:/Terms explained/.test(m), deutsch:/Fahrerprofil|Begriffe erklärt|Bauziel|Nächster Schritt/.test(m + k),
        karte:/Next step|Set the build goal|Review and adjust/.test($('coach-platz').innerHTML)}; });
    return {ok:r.sag && r.boost && r.rider && r.terms && !r.deutsch && r.karte, info:r}; }],
  ['Alle Modi, Handy und Desktop: zeichnen ohne leere Knoepfe', async () => {
    await neu();
    const out = {};
    for(const [w, h] of [[390, 844], [1280, 900]]){
      await seite.setViewportSize({width:w, height:h}); await warte(150);
      out[w] = await ev(() => { const r = {}; for(const m of ['traum', 'real', 'markt']){ if(modus !== m) wechsle(m);
        for(const v of ['aufbau', 'befunde', 'upgrades', 'deals']){ view = v; zeichne(); vorschlaegeZeichnen(); }
        r[m] = [...document.querySelectorAll('button')].filter(b => (b.offsetParent !== null) && !b.textContent.trim() && !b.getAttribute('aria-label') && !b.title).length; }
        view = 'aufbau'; zeichne(); return r; });
    }
    await seite.setViewportSize({width:390, height:844});
    const ok = Object.values(out).every(r => Object.values(r).every(n => n === 0));
    return {ok, info:out}; }]
];
if(process.env.CRANKSCORE_TEST_FEHLER === '1') PRUEFUNGEN.push(['Absichtlicher Fehlschlag (CRANKSCORE_TEST_FEHLER=1)', async () => ({ok:false, info:'Gate-Probe'})]);

let bestanden = 0, gelaufen = 0;
for(const [name, fn] of PRUEFUNGEN){
  let e;
  try{ e = await fn(); }catch(err){ e = {ok:false, info:'Ausnahme: ' + err.message}; }
  gelaufen++;
  if(e.ok){ bestanden++; console.log('  ok   ' + name); }
  else console.log('  FEHL ' + name + '\n         ' + JSON.stringify(e.info).slice(0, 900));
}
if(jsFehler.length) console.log('JS-Fehler in der Seite:\n  ' + [...new Set(jsFehler)].join('\n  '));
const ok = bestanden === PRUEFUNGEN.length && gelaufen === PRUEFUNGEN.length && !jsFehler.length;
console.log(`\nWEGE: ${bestanden} von ${PRUEFUNGEN.length} Prüfungen bestanden${jsFehler.length ? `, ${jsFehler.length} JS-Fehler` : ''}.`);
await browser.close(); server.close();
process.exit(ok ? 0 : 1);
