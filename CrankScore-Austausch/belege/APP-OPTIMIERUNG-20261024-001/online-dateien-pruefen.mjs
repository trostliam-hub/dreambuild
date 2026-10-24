/* Oeffentliche Dateien mit dem gestempelten Checkout vergleichen. Nur GETs. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.env.CRANKSCORE_SOURCE_ROOT||path.join(here,'../../..'));
const report={at:new Date().toISOString(),files:[]};
for(const name of ['index.html','mtb-sw.js','guide-safety.js']){
  const r=await fetch('https://trostliam-hub.github.io/dreambuild/'+name,{cache:'no-store'});
  const text=(await r.text()).replace(/\r\n/g,'\n'),local=fs.readFileSync(path.join(root,name),'utf8').replace(/\r\n/g,'\n');
  report.files.push({name,status:r.status,match:text===local,sha256:crypto.createHash('sha256').update(text).digest('hex'),
    version:name==='index.html'?text.match(/const APP_VERSION = '([^']+)'/)?.[1]:undefined});
}
report.ok=report.files.every(x=>x.status===200&&x.match);
console.log(JSON.stringify(report));
if(report.ok)fs.writeFileSync(path.join(here,'online-abschluss-dateien.json'),JSON.stringify(report,null,2));
else process.exitCode=1;
