#!/usr/bin/env node
/** Headless layout audit for generated explainers. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const explainersDir = path.resolve(here, '..');
const tmpDir = path.join(here, 'tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const chrome = chromeCandidates.find((p) => fs.existsSync(p));
if (!chrome) {
  console.error('Chrome or Edge not found; skipping visual audit.');
  process.exit(0);
}

const files = fs.readdirSync(explainersDir)
  .filter((f) => f.endsWith('-explainer.html'))
  .sort();

const inject = (html) => {
  const script = `<script>window.addEventListener('load',function(){setTimeout(function(){
var out=[];var stage=document.getElementById('stage');
document.querySelectorAll('.scene, .scene *').forEach(function(el){el.style.transition='none';el.style.animation='none';});
document.querySelectorAll('.scene').forEach(function(s,i){
  document.querySelectorAll('.scene').forEach(function(x){x.classList.remove('active');});
  s.classList.add('active');
  s.style.visibility='visible';s.style.opacity='1';s.style.transform='none';s.style.display='flex';
  s.querySelectorAll('[data-at]').forEach(function(n){n.classList.add('on');n.style.transform='none';});
  var sr=stage.getBoundingClientRect();
  var head=s.querySelector('.scene-head').getBoundingClientRect();
  var kids=Array.from(s.children).filter(function(c){return !c.classList.contains('scene-head');});
  var issues=[];
  kids.forEach(function(c){var r=c.getBoundingClientRect();if(r.height<=0)return;
    var name=c.className||c.tagName;
    if(r.top<head.bottom-1)issues.push(name+':overlap-title');
    if(r.bottom>sr.bottom+3)issues.push(name+':clip-bottom');
    if(r.right>sr.right+3)issues.push(name+':clip-right');
  });
  if(issues.length)out.push({scene:i+1,issues:issues});
});
var h1=document.querySelector('h1').getBoundingClientRect();
var lede=document.querySelector('.page-heading .lede').getBoundingClientRect();
if(h1.bottom>lede.top+1)out.push({header:'title-overlaps-lede'});
if(document.documentElement.scrollWidth>document.documentElement.clientWidth+1)out.push({page:'horizontal-overflow',scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth});
document.title='AUDIT '+JSON.stringify({vw:document.documentElement.clientWidth,issues:out});
},1200);});</script>`;
  return html.replace('</body>', script + '\n</body>');
};

let failed = 0;
for (const file of files) {
  const source = path.join(explainersDir, file);
  const html = fs.readFileSync(source, 'utf8');
  const temp = path.join(tmpDir, file);
  fs.writeFileSync(temp, inject(html));
  const url = pathToFileURL(temp).href;

  for (const width of [500, 1440, 1920]) {
    let dom = '';
    try {
      dom = execFileSync(chrome, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars',
        `--window-size=${width},1400`, '--virtual-time-budget=2200',
        '--dump-dom', url,
      ], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch (err) {
      console.error(`ERROR ${file} @ ${width}px: ${err.message}`);
      failed += 1;
      continue;
    }
    const match = dom.match(/<title>AUDIT (.*?)<\/title>/s);
    if (!match) {
      console.error(`ERROR ${file} @ ${width}px: audit did not run`);
      failed += 1;
      continue;
    }
    let result;
    try {
      result = JSON.parse(match[1]);
    } catch {
      console.error(`ERROR ${file} @ ${width}px: bad audit JSON`);
      failed += 1;
      continue;
    }
    if (result.issues.length) {
      failed += 1;
      console.error(`FAIL ${file} @ ${width}px`);
      for (const item of result.issues) console.error('  ' + JSON.stringify(item));
    } else {
      console.log(`OK   ${file} @ ${width}px`);
    }
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`\n${failed === 0 ? 'All layout audits passed.' : `${failed} layout check(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);
