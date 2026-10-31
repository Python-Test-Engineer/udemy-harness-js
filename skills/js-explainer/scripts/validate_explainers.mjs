#!/usr/bin/env node
/**
 * Structural validator for generated JS explainers.
 *
 * Usage:
 *   node scripts/validate_explainers.mjs <source-dir> <output-dir>
 *
 * It checks that every .js file in <source-dir> has a matching
 * <basename>-explainer.html in <output-dir>, and that each page contains the
 * required player, scene, caption, timeline, deep-link, and scale markers.
 *
 * This is a structural smoke test. It cannot judge the teaching quality or
 * detect every layout collision; the visual checklist in SKILL.md still applies.
 */

import fs from 'node:fs';
import path from 'node:path';

const [sourceArg, outputArg] = process.argv.slice(2);

if (!sourceArg || !outputArg) {
  console.error('Usage: node scripts/validate_explainers.mjs <source-dir> <output-dir>');
  process.exit(2);
}

const sourceDir = path.resolve(sourceArg);
const outputDir = path.resolve(outputArg);

if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  console.error(`Source directory not found: ${sourceDir}`);
  process.exit(2);
}

if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
  console.error(`Output directory not found: ${outputDir}`);
  process.exit(2);
}

const sources = fs
  .readdirSync(sourceDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
  .map((entry) => entry.name)
  .sort();

if (sources.length === 0) {
  console.error(`No .js files found in ${sourceDir}`);
  process.exit(1);
}

const countScenes = (html) => [...html.matchAll(/<section\b[^>]*class="[^"]*\bscene\b[^"]*"/g)].length;

const REQUIRED = [
  ['HTML5 doctype', (html) => /<!DOCTYPE html>/i.test(html)],
  ['at least 6 scenes', (html) => countScenes(html) >= 6],
  ['scene 0 marker', (html) => /data-scene="0"/.test(html)],
  ['caption region', (html) => /id="captionText"/.test(html)],
  ['caption is announced', (html) => /id="captionText"[^>]*aria-live|aria-live[^>]*id="captionText"/.test(html)],
  ['timeline control', (html) => /id="timeline"/.test(html)],
  ['play control', (html) => /id="playBtn"/.test(html)],
  ['previous/next controls', (html) => /id="prevBtn"/.test(html) && /id="nextBtn"/.test(html)],
  ['speed control', (html) => /id="speed"/.test(html)],
  ['scene beat system', (html) => /data-at=/.test(html) && /classList\.toggle\('on'/.test(html)],
  ['scaled root font', (html) => /--root-size:\s*31\.5px/.test(html)],
  ['scaled stage height', (html) => /--stage-h:\s*clamp\(\s*860px/.test(html)],
  ['one-column breakpoint', (html) => /@media\s*\(max-width:\s*1360px\)/.test(html)],
  ['compact breakpoint', (html) => /@media\s*\(max-width:\s*1020px\)/.test(html)],
  ['deep-link support', (html) => /URLSearchParams/.test(html) && /scene-/.test(html)],
  ['theme toggle', (html) => /id="themebtn"/.test(html) && /data-theme/.test(html)],
  ['reduced-motion handling', (html) => /prefers-reduced-motion/.test(html)],
  ['no external script src', (html) => !/<script\b[^>]*\bsrc\s*=/i.test(html)],
  ['no external stylesheet', (html) => !/<link\b[^>]*\brel\s*=\s*["']stylesheet["']/i.test(html)]
];

let failures = 0;

for (const file of sources) {
  const expected = path.join(outputDir, `${path.basename(file, '.js')}-explainer.html`);

  if (!fs.existsSync(expected)) {
    console.error(`MISSING  ${path.basename(expected)}  (source: ${file})`);
    failures += 1;
    continue;
  }

  const html = fs.readFileSync(expected, 'utf8');
  const failed = [];

  for (const [label, check] of REQUIRED) {
    let ok = false;
    try {
      ok = Boolean(check(html));
    } catch {
      ok = false;
    }
    if (!ok) failed.push(label);
  }

  if (failed.length > 0) {
    console.error(`FAIL     ${path.basename(expected)}`);
    for (const label of failed) console.error(`         - ${label}`);
    failures += 1;
  } else {
    console.log(`OK       ${path.basename(expected)}  (${countScenes(html)} scenes)`);
  }
}

console.log('');
console.log(`${sources.length} source file(s), ${failures} failure(s).`);

if (sources.length > 0 && failures === 0) {
  console.log('Structural checks passed. Now run the visual checklist in SKILL.md.');
}

process.exit(failures === 0 ? 0 : 1);
