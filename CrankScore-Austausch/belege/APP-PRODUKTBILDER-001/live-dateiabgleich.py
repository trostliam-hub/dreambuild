import concurrent.futures, hashlib, json, re, subprocess, threading
from pathlib import Path
from urllib.parse import quote
import requests

root=Path('/workspace/crankscore-app-images')
out=Path('/workspace/app-image-fix-audit/live'); out.mkdir(exist_ok=True)
js="const fs=require('fs'),vm=require('vm'),c={};vm.createContext(c);vm.runInContext(fs.readFileSync('bilder/produkte/katalog.js','utf8')+';this.p=PRODUKTBILDER',c);process.stdout.write(JSON.stringify([...new Set(Object.values(c.p).map(p=>p.datei))]));"
files=json.loads(subprocess.check_output(['node','-e',js],cwd=root))
files+=['index.html','mtb-sw.js','bilder/produkte/katalog.js','bilder/produkte/ansicht.js']
base='https://trostliam-hub.github.io/dreambuild/'
tls=threading.local()
def normalize(name,data):
    if name=='index.html': return re.sub(rb"const APP_VERSION = '[^']*'",b"const APP_VERSION = 'WORKFLOW'",data)
    if name=='mtb-sw.js': return re.sub(rb"var CACHE = '[^']*'",b"var CACHE = 'WORKFLOW'",data)
    return data
def fetch(name):
    if not hasattr(tls,'session'): tls.session=requests.Session()
    r=tls.session.get(base+quote(name,safe='/')+'?fotoabschluss=1607624',timeout=45)
    expected=(root/name).read_bytes()
    return {'file':name,'status':r.status_code,'bytes':len(r.content),
      'match':r.status_code==200 and normalize(name,expected)==normalize(name,r.content),
      'sha256':hashlib.sha256(r.content).hexdigest()}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    rows=list(pool.map(fetch,files))
report={'files':len(rows),'photos':len(files)-4,'bytes':sum(r['bytes'] for r in rows),'ok':all(r['match'] for r in rows),'mismatches':[r for r in rows if not r['match']],'rows':rows}
(out/'integrity.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='rows'},indent=2))
raise SystemExit(0 if report['ok'] else 1)
