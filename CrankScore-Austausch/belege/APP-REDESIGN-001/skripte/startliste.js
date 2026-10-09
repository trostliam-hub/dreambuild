/* Liest die eingebaute Pruefliste bis zur Veroeffentlichung aus (nur Anzeige, nichts wird gespeichert) */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port] = process.argv;
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.sprache', 'de'); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); });
  await p.reload(); await p.waitForFunction(() => typeof marktCheckHtml === 'function' && !!document.querySelector('#aufbau .grp')); await p.waitForTimeout(800);
  const z = await p.evaluate(() => { const d = document.createElement('div'); d.innerHTML = marktCheckHtml(); return [...d.querySelectorAll('.check-z')].map(e => e.innerText.replace(/\s+/g, ' ').trim()); });
  z.forEach(x => console.log(x)); await b.close(); })();
