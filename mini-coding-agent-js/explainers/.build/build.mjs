#!/usr/bin/env node
/**
 * Build every lesson from the canonical hooks-explainer shell.
 *
 * The shell (CSS + player + accessibility + deep links) comes from
 * ../hooks-explainer.html. Each lesson supplies only metadata, scene headings,
 * scene body HTML, narration beats, and the source excerpt shown in the page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const explainersDir = path.resolve(here, '..');
const srcDir = path.resolve(explainersDir, '..', 'src');
const templatePath = path.join(explainersDir, 'hooks-explainer.html');
const template = fs.readFileSync(templatePath, 'utf8');

const lessonModules = [
  './lessons/part1.mjs',
  './lessons/part2.mjs',
  './lessons/part3.mjs',
];

const lessons = [];
for (const modulePath of lessonModules) {
  const mod = await import(modulePath);
  lessons.push(...mod.default);
}

const EXTRA_CSS = `
/* generic lesson components (added by the explainer builder) */
.scene-body{display:flex;flex-direction:column;gap:.62rem;flex:1;min-height:0;padding-top:.18rem}
.info-grid{display:grid;gap:.58rem;min-height:0}
.info-grid.cols-1{grid-template-columns:1fr}
.info-grid.cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.info-grid.cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.info-grid.cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
.info-card{
  --accent:var(--terra);min-width:0;padding:.62rem .7rem;border:.0625rem solid var(--line);
  border-top:.18rem solid var(--accent);border-radius:.65rem;background:var(--ivory);
  display:flex;flex-direction:column;gap:.28rem;
}
.info-head{display:flex;align-items:center;gap:.36rem;flex-wrap:wrap}
.info-ico{display:grid;place-items:center;width:1.35rem;height:1.35rem;border-radius:.4rem;background:var(--tint);font-size:.78rem;flex:0 0 auto}
.info-head strong{color:var(--ink);font:600 .74rem/1.25 var(--sans)}
.info-tag{margin-left:auto;padding:.06rem .32rem;border-radius:1rem;background:var(--tint);color:var(--terra-dark);font:700 .5rem/1.5 var(--sans);letter-spacing:.08em;text-transform:uppercase}
.info-card p{margin:0;color:var(--muted);font-size:.65rem;line-height:1.46}
.info-card code{display:inline-block;align-self:flex-start;font-size:.57rem;padding:.06em .24em;background:var(--tint);color:#7c3f2b}
.flow-strip{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;padding:.55rem .62rem;border:.0625rem solid var(--line);border-radius:.68rem;background:var(--ivory)}
.flow-strip .node,.flow-strip .small-box,.flow-strip .step-node{flex:0 0 auto}
.kv-list{display:flex;flex-direction:column;gap:.26rem}
.kv-row{display:grid;grid-template-columns:minmax(7.5rem,.35fr) 1fr;gap:.55rem;align-items:baseline;padding:.4rem .52rem;border:.0625rem solid var(--line);border-radius:.45rem;background:var(--ivory);font-size:.66rem;line-height:1.4}
.kv-row span{color:var(--stone);font:600 .55rem/1.35 var(--sans);letter-spacing:.09em;text-transform:uppercase}
.kv-row strong{color:var(--ink);font-weight:500;font-size:.68rem}
.pill-row{display:flex;flex-wrap:wrap;gap:.3rem}
.pill{padding:.18rem .42rem;border:1px solid var(--line);border-radius:1rem;background:var(--ivory);color:var(--muted);font:.58rem/1.4 var(--mono)}
.check-list{display:flex;flex-direction:column;gap:.34rem}
.check-item{display:flex;gap:.5rem;align-items:flex-start;padding:.4rem .5rem;border:.0625rem solid var(--line);border-radius:.48rem;background:var(--ivory);font-size:.66rem;line-height:1.45;color:var(--muted)}
.check-ico{color:var(--terra);font:700 .7rem/1.35 var(--mono);flex:0 0 auto}
.check-item strong{color:var(--ink)}
.console pre{font-size:.62rem;line-height:1.55}
@media (max-width:1600px){
  .info-grid.cols-3,.info-grid.cols-4{grid-template-columns:1fr 1fr}
}
@media (max-width:1020px){
  .info-grid.cols-2,.info-grid.cols-3,.info-grid.cols-4{grid-template-columns:1fr 1fr}
}
@media (max-width:680px){
  .info-grid.cols-2,.info-grid.cols-3,.info-grid.cols-4{grid-template-columns:1fr}
}
`;

const pad = (n) => String(n).padStart(2, '0');
const format = (ms) => {
  const seconds = Math.round(ms / 1000);
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
};
const totalOf = (scenes) => scenes.reduce((sum, s) => sum + s.duration, 0);
const lineCount = (file) => {
  const full = path.join(srcDir, file);
  if (!fs.existsSync(full)) return 0;
  return fs.readFileSync(full, 'utf8').split(/\r?\n/).length;
};

function replaceOnce(html, needle, replacement) {
  if (!html.includes(needle)) throw new Error(`template marker not found: ${needle}`);
  return html.replace(needle, replacement);
}

function replaceBetween(html, startMarker, endMarker, replacement) {
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error(`template marker not found: ${startMarker}`);
  const end = html.indexOf(endMarker, start + startMarker.length);
  if (end === -1) throw new Error(`template end marker not found: ${endMarker}`);
  return html.slice(0, start) + replacement + html.slice(end);
}

function sceneHtml(scene, index) {
  return `
          <!-- ${pad(index + 1)} -->
          <section class="scene${index === 0 ? ' active' : ''}" data-scene="${index}" id="scene-${index}">
            <div class="scene-head">
              <span class="chip">${pad(index + 1)}</span>
              <div>
                <p class="scene-kicker">${scene.kicker}</p>
                <h2 class="stage-title">${scene.title}</h2>
              </div>
            </div>
${scene.body}
          </section>`;
}

function buildLesson(lesson) {
  const scenes = lesson.scenes;
  const total = totalOf(scenes);
  const meta = scenes.map((scene) => ({
    title: scene.navTitle ?? scene.kicker,
    kicker: scene.kicker,
    duration: scene.duration,
    beats: scene.beats,
  }));
  const scenesHtml = scenes.map(sceneHtml).join('\n');
  const nav = scenes.map((scene, i) =>
    `      <a href="#scene-${i}" data-scene="${i}"><span class="n">${pad(i + 1)}</span><span>${scene.navTitle ?? scene.kicker}</span></a>`
  ).join('\n');
  const metaHtml = (lesson.meta ?? []).map((item) => `          <span>${item}</span>`).join('\n');
  const lines = lineCount(lesson.file);
  const pageTitle = `${lesson.name} explainer`;
  const footer = `    <div class="side-foot">
      Source: <code>mini-coding-js/src/${lesson.file}</code><br>
      ${lines} lines &middot; ${lesson.footerFacts ?? 'animated explainer'}<br>
      <span class="key">space</span> play &middot; <span class="key">←</span><span class="key">→</span> scenes<br>
      Companion: <a href="explainer-harness-js.html">explainer-harness-js.html</a>`;

  let out = template;

  out = replaceOnce(out, '<title>mini-coding-js &middot; lifecycle hooks, animated</title>',
    `<title>mini-coding-js &middot; ${pageTitle}</title>`);

  out = replaceOnce(out, '    <a class="side-kicker" href="#top">mini-coding-js &middot; Lesson 11</a>',
    `    <a class="side-kicker" href="#top">mini-coding-js &middot; ${lesson.lessonLabel ?? 'File explainer'}</a>`);
  out = replaceOnce(out, '    <p class="side-title">Lifecycle hooks</p>',
    `    <p class="side-title">${lesson.name}</p>`);
  out = replaceOnce(out, '    <p class="side-sub">An animated walk through <code>src/hooks.js</code>: nine moments, one contract, four decisions.</p>',
    `    <p class="side-sub">An animated walk through <code>src/${lesson.file}</code>: ${lesson.sideSub}</p>`);

  out = replaceBetween(out, '    <nav class="toc" id="toc">', '    </nav>',
    `    <nav class="toc" id="toc">\n${nav}\n`);

  out = replaceBetween(out, '    <div class="side-foot">', '    </div>', footer);

  out = replaceBetween(out, '      <header class="page-heading">', '      </header>',
    `      <header class="page-heading">
        <p class="eyebrow">Animated explainer &middot; src/${lesson.file}</p>
        <h1>${lesson.h1}</h1>
        <p class="lede">${lesson.lede}</p>
        <p class="meta">
${metaHtml}
        </p>`);

  out = replaceOnce(out, '          <div class="player-lesson"><span class="rec-dot"></span>Lesson 11 &middot; Lifecycle hooks</div>',
    `          <div class="player-lesson"><span class="rec-dot"></span>${lesson.lessonLabel ?? 'File explainer'} &middot; ${lesson.name}</div>`);
  out = replaceOnce(out, '            <span id="sceneCounter">01 / 10</span>',
    `            <span id="sceneCounter">01 / ${pad(scenes.length)}</span>`);
  out = replaceOnce(out, '            <span id="clock">00:00 / 02:22</span>',
    `            <span id="clock">00:00 / ${format(total)}</span>`);

  const stageStart = out.indexOf('<div class="stage" id="stage">');
  const captionStart = out.indexOf('<div class="caption-bar">', stageStart);
  if (stageStart === -1 || captionStart === -1) throw new Error('template stage markers not found');
  out = out.slice(0, stageStart)
    + `<div class="stage" id="stage">\n\n${scenesHtml}\n\n        </div>\n\n        `
    + out.slice(captionStart);

  out = replaceOnce(out, '          <div class="caption-index" id="captionIndex">01</div>',
    `          <div class="caption-index" id="captionIndex">01</div>`);
  out = replaceOnce(out, '            <p class="caption-kicker" id="captionKicker">Why hooks exist</p>',
    `            <p class="caption-kicker" id="captionKicker">${scenes[0].kicker}</p>`);
  out = replaceOnce(out,
    '            <p class="caption-text" id="captionText" aria-live="polite">Every coding agent is a loop: ask the model, run the tools it asks for, feed the results back, repeat.</p>',
    `            <p class="caption-text" id="captionText" aria-live="polite">${scenes[0].beats[0].text}</p>`);

  const scenesStart = out.indexOf('  var SCENES = [');
  const totalStart = out.indexOf('  var TOTAL =', scenesStart);
  if (scenesStart === -1 || totalStart === -1) throw new Error('template SCENES markers not found');
  out = out.slice(0, scenesStart)
    + `  var SCENES = ${JSON.stringify(meta, null, 4)};\n\n`
    + out.slice(totalStart);

  out = out.replace('</style>', `${EXTRA_CSS}\n</style>`);

  return { html: out, total, scenes: scenes.length };
}

let built = 0;
for (const lesson of lessons) {
  const { html, total, scenes } = buildLesson(lesson);
  const output = path.join(explainersDir, `${lesson.file.replace(/\.js$/, '')}-explainer.html`);
  fs.writeFileSync(output, html, 'utf8');
  built += 1;
  console.log(`built ${path.basename(output)}  (${scenes} scenes, ${format(total)})`);
}
console.log(`\n${built} explainer(s) written to ${explainersDir}`);
