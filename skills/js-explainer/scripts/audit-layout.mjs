#!/usr/bin/env node
/**
 * Headless layout audit for generated explainers.
 *
 * Usage:
 *   node scripts/audit-layout.mjs [explainers-dir]
 *
 * Checks every *-explainer.html at 500px, 1440px and 1920px:
 *   - the shell has <aside> and <main> as siblings;
 *   - at 1440px and 1920px, main sits to the RIGHT of the sidebar, not below it;
 *   - the page header title does not overlap the lede;
 *   - no horizontal page overflow;
 *   - each scene's body does not overlap its title or clip outside the stage.
 *
 * Requires Chrome or Edge. This is the visual companion to
 * validate_explainers.mjs; run both before reporting a batch complete.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const targetDir = path.resolve(process.argv[2] ?? process.cwd());

if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
  console.error(`Explainer directory not found: ${targetDir}`);
  process.exit(2);
}

const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
];
const chrome = chromeCandidates.find((p) => fs.existsSync(p));
if (!chrome) {
  console.error('Chrome or Edge not found; cannot run the layout audit.');
  process.exit(2);
}

const files = fs.readdirSync(targetDir)
  .filter((file) => file.endsWith('-explainer.html'))
  .sort();

if (files.length === 0) {
  console.error(`No *-explainer.html files found in ${targetDir}`);
  process.exit(1);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'explainer-audit-'));

const inject = (html) => {
  const script = `<script>window.addEventListener('load',function(){setTimeout(function(){
var issues=[];
document.querySelectorAll('.scene, .scene *').forEach(function(el){el.style.transition='none';el.style.animation='none';});
var shell=document.querySelector('.shell');
var aside=document.querySelector('.sidebar');
var main=document.querySelector('main.pane');
if(!shell||!aside||!main){issues.push('shell-structure-missing');}
else{
  var kids=Array.from(shell.children);
  if(!kids.includes(aside)||!kids.includes(main))issues.push('shell-children-wrong');
  var ar=aside.getBoundingClientRect(),mr=main.getBoundingClientRect();
  if(document.documentElement.clientWidth>1360){
    if(mr.left<ar.right-1)issues.push('main-not-right-of-sidebar');
    if(mr.top>ar.top+2)issues.push('main-below-sidebar');
  }
}
var h1=document.querySelector('h1');
var lede=document.querySelector('.page-heading .lede');
if(h1&&lede){
  var hr=h1.getBoundingClientRect(),lr=lede.getBoundingClientRect();
  if(hr.bottom>lr.top+1)issues.push('title-overlaps-lede');
}
var stage=document.getElementById('stage');
if(stage){
  document.querySelectorAll('.scene').forEach(function(s,i){
    document.querySelectorAll('.scene').forEach(function(x){x.classList.remove('active');});
    s.classList.add('active');
    s.style.visibility='visible';s.style.opacity='1';s.style.transform='none';s.style.display='flex';
    s.querySelectorAll('[data-at]').forEach(function(n){n.classList.add('on');n.style.transform='none';});
    var sr=stage.getBoundingClientRect();
    var head=s.querySelector('.scene-head').getBoundingClientRect();
    var kids=Array.from(s.children).filter(function(c){return !c.classList.contains('scene-head');});
    kids.forEach(function(c){var r=c.getBoundingClientRect();if(r.height<=0)return;
      var name=(typeof c.className==='string'?c.className:c.tagName);
      if(r.top<head.bottom-1)issues.push('scene-'+(i+1)+'-overlaps-title');
      if(r.bottom>sr.bottom+3)issues.push('scene-'+(i+1)+'-clips-bottom');
      if(r.right>sr.right+3)issues.push('scene-'+(i+1)+'-clips-right');
    });
  });
}
if(document.documentElement.scrollWidth>document.documentElement.clientWidth+1)
  issues.push('horizontal-overflow');
document.title='AUDIT '+JSON.stringify({vw:document.documentElement.clientWidth,issues:Array.from(new Set(issues))});
},1200);});</script>`;
  return html.replace('</body>', script + '\n</body>');
};

let failed = 0;
for (const file of files) {
  const html = fs.readFileSync(path.join(targetDir, file), 'utf8');
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

    if (result.issues.length > 0) {
      failed += 1;
      console.error(`FAIL ${file} @ ${width}px`);
      for (const issue of result.issues) console.error(`  - ${issue}`);
    } else {
      console.log(`OK   ${file} @ ${width}px`);
    }
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`\n${failed === 0 ? 'All layout audits passed.' : `${failed} layout check(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);
