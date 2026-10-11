// Sprachreste: sichtbarer Text + alt/aria/title in DE und EN auf allen Seiten
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const EN = /\b(the|and|with|your|you|which|this|that|from|for|bike|parts|check)\b/i;
const DE = /\b(und|der|die|das|nicht|mit|für|ist|dein|deine|deinem|kein|keine|wird|auch|oder|bei|zum|zur|Teile|Rad|Räder|Prüfung)\b|[äöüß]/;
const ERLAUBT = /CrankScore|Propain|Specialized|Stumpjumper|RockShox|Shimano|Magura|Marzocchi|SRAM|Lemon Squeezy|Deutsch|English|Pro|Free|Öhlins/g;
(async () => { const b = await chromium.launch(); let n = 0;
  for (const seite of ['', 'impressum.html', 'datenschutz.html', '404.html'])
  for (const sp of ['de', 'en']) {
    const c = await b.newContext(); await c.addInitScript(sp => { try { if (!sessionStorage.__sp) { localStorage.setItem('cs.sprache', sp); sessionStorage.__sp = 1; } } catch (e) {} }, sp);
    const p = await c.newPage(); await p.goto('http://127.0.0.1:8766/' + (seite === '404.html' ? 'gibt-es-nicht' : seite).replace('gibt-es-nicht', '404.html'));
    await p.waitForFunction(sp => document.documentElement.lang === sp && !document.documentElement.classList.contains('sprache-lade'), sp);
    const teile = await p.evaluate(() => {
      const r = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) { const t = w.currentNode.textContent.trim(); const e = w.currentNode.parentElement;
        if (t && e && !e.closest('script,style,svg,[hidden],.nur-dunkel') && !e.closest('[lang]:not(html)')) r.push(t); }
      document.querySelectorAll('[alt],[aria-label],[title]').forEach(e => { if (e.closest('[lang]:not(html)')) return; ['alt', 'aria-label', 'title'].forEach(a => { const v = e.getAttribute(a); if (v) r.push('@' + a + ': ' + v); }); });
      r.push('@title: ' + document.title); document.querySelectorAll('meta[content]').forEach(m => { if (/description|og:title|og:description|og:image:alt/.test(m.getAttribute('name') || m.getAttribute('property') || '')) r.push('@meta: ' + m.content); });
      return r;
    });
    const re = sp === 'de' ? EN : DE;
    const funde = teile.filter(t => re.test(t.replace(ERLAUBT, '')) && !/^(DE|EN|9:41)$/.test(t));
    if (funde.length) { n += funde.length; console.log(`${seite || 'index.html'} ${sp}:`, JSON.stringify(funde.slice(0, 8))); }
    await c.close();
  }
  console.log(n ? n + ' Funde' : 'keine Sprachreste'); await b.close(); })();
