#!/usr/bin/env node
/**
 * Readability and traceability audit for Markdown explainers.
 *
 * Usage:
 *   node scripts/audit_md.mjs [--root DIR] [--max-chapter-words N]
 *                             [--max-paragraph-words N] <file.md|dir> [...]
 *
 * Errors (non-zero exit) are content-integrity failures: broken relative
 * links and `src/` or `test/` paths that do not exist under --root.
 * Everything else is an advisory warning about the reading experience.
 *
 * The audit does not replace the structural validator in validate_md.mjs.
 */

import fs from 'node:fs';
import path from 'node:path';

const CAPTION_RE = /^\*\*(.+?)\*\*\s*·\s*\*([^*]+)\*$/;
const FILLER_RE = /\b(just|simply|obviously|of course|trivially|clearly)\b/gi;
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const SOURCE_RE = /^(?:\.\/)?((?:src|test)\/[\w./-]+\.(?:js|mjs|cjs|md|json))$/;
const WORDS_PER_MINUTE = 230;

function usage(code = 2) {
  console.error(
    'Usage: node scripts/audit_md.mjs [--root DIR] [--max-chapter-words N] ' +
      '[--max-paragraph-words N] <file.md|dir> [...]'
  );
  process.exit(code);
}

const inputs = [];
const files = [];
let root = null;
let maxChapterWords = 1100;
let maxParagraphWords = 220;

const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--help' || arg === '-h') usage(0);
  else if (arg === '--root') root = path.resolve(argv[++i]);
  else if (arg === '--max-chapter-words') maxChapterWords = Number(argv[++i]);
  else if (arg === '--max-paragraph-words') maxParagraphWords = Number(argv[++i]);
  else if (arg.startsWith('--')) {
    console.error(`Unknown option: ${arg}`);
    usage();
  } else inputs.push(arg);
}

if (inputs.length === 0) usage();
if (!Number.isFinite(maxChapterWords) || !Number.isFinite(maxParagraphWords)) {
  console.error('Word limits must be numbers');
  usage();
}

function collect(resolved) {
  if (fs.statSync(resolved).isDirectory()) {
    fs.readdirSync(resolved, { withFileTypes: true })
      .filter((item) => item.isFile() && item.name.endsWith('.md'))
      .map((item) => path.join(resolved, item.name))
      .sort()
      .forEach(collect);
  } else {
    files.push(resolved);
  }
}

for (const entry of inputs) {
  const resolved = path.resolve(entry);
  if (!fs.existsSync(resolved)) {
    console.error(`Not found: ${entry}`);
    process.exit(1);
  }
  collect(resolved);
}

function parse(text) {
  const rawLines = text.split(/\r?\n/);
  const lines = [];
  let inComment = false;
  for (const raw of rawLines) {
    if (inComment) {
      if (raw.includes('-->')) inComment = false;
      lines.push('');
      continue;
    }
    if (/^\s*<!--/.test(raw)) {
      if (!raw.includes('-->')) inComment = true;
      lines.push('');
      continue;
    }
    lines.push(raw);
  }

  const prose = [];
  const fences = [];
  const headings = [];
  let fence = null;

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const s = raw.trim();

    if (fence) {
      if (s.startsWith('```')) {
        fence.end = i + 1;
        fence = null;
      } else {
        fence.body.push(raw);
      }
      continue;
    }

    if (s.startsWith('```')) {
      const lang = s.slice(3).trim();
      let caption = null;
      for (let j = i - 1; j >= 0; j -= 1) {
        if (!lines[j].trim()) continue;
        const m = lines[j].trim().match(CAPTION_RE);
        if (m) caption = { label: m[1].trim(), lang: m[2].trim() };
        break;
      }
      fence = { lang, start: i + 1, end: 0, caption, body: [] };
      fences.push(fence);
      continue;
    }

    if (!s) continue;

    const heading = raw.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      headings.push({ level: heading[1].length, text: heading[2].trim(), line: i + 1 });
      continue;
    }

    prose.push({ line: i + 1, text: raw });
  }

  return { lines, prose, fences, headings };
}

function words(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function stripInlineCode(text) {
  return text.replace(/`[^`]*`/g, ' ');
}

function resolveTarget(target, fileDir) {
  const clean = target.split('#')[0].split('?')[0].trim();
  if (!clean) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(clean) || clean.startsWith('//')) return true;
  if (path.isAbsolute(clean)) return fs.existsSync(clean);

  const bases = [fileDir];
  if (root) {
    bases.push(root, path.join(root, 'src'), path.join(root, 'explainers'), path.join(root, 'test'));
  }
  return bases.some((base) => fs.existsSync(path.join(base, clean)));
}

function resolveSource(source) {
  if (!root) return true;
  const clean = source.split(':')[0];
  return fs.existsSync(path.join(root, clean));
}

let failures = 0;

for (const file of files) {
  const rel = path.relative(process.cwd(), file) || path.basename(file);
  const fileDir = path.dirname(file);
  const parsed = parse(fs.readFileSync(file, 'utf8'));
  const errors = [];
  const warnings = [];

  const proseWords = parsed.prose.reduce((total, item) => total + words(stripInlineCode(item.text)), 0);
  const codeWords = parsed.fences.reduce((total, item) => total + item.body.length, 0);

  // Chapters: build and companion both start their H2 with a number.
  const chapters = parsed.headings.filter((heading) => heading.level === 2);
  const ranges = chapters.map((heading, index) => ({
    heading,
    start: heading.line,
    end: index + 1 < chapters.length ? chapters[index + 1].line : Number.POSITIVE_INFINITY
  }));

  // ---- chapter size -----------------------------------------------------
  for (const range of ranges) {
    const chapterProse = parsed.prose.filter(
      (item) => item.line > range.start && item.line < range.end
    );
    const chapterCode = parsed.fences.filter(
      (item) => item.start > range.start && item.start < range.end
    );
    const count =
      chapterProse.reduce((total, item) => total + words(stripInlineCode(item.text)), 0) +
      chapterCode.reduce((total, item) => total + item.body.join(' ').split(/\s+/).filter(Boolean).length, 0);
    const title = range.heading.text;
    if (count > maxChapterWords) {
      warnings.push(
        `line ${range.start}: chapter "${title}" is ${count} words — split it (limit ${maxChapterWords})`
      );
    } else if (count < 120) {
      warnings.push(`line ${range.start}: chapter "${title}" is only ${count} words — merge or expand it`);
    }
  }

  // ---- paragraphs and sentences -----------------------------------------
  let paragraph = [];
  const flush = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.map((item) => item.text.trim()).join(' ');
    const count = words(text);
    const line = paragraph[0].line;
    if (count > maxParagraphWords) {
      warnings.push(`line ${line}: paragraph is ${count} words — break it up (limit ${maxParagraphWords})`);
    }
    for (const sentence of text.split(/(?<=[.!?])\s+/)) {
      const length = words(sentence);
      if (length > 60) {
        warnings.push(`line ${line}: sentence is ${length} words — split it`);
      }
    }
    paragraph = [];
  };

  for (const item of parsed.prose) {
    const s = item.text.trim();
    if (!s) {
      flush();
      continue;
    }
    const blockStart =
      s.startsWith('|') ||
      s.startsWith('>') ||
      s.startsWith('-') ||
      s.startsWith('*') ||
      s.startsWith('#') ||
      s.startsWith('`') ||
      s.startsWith('---');
    if (blockStart) {
      flush();
      continue;
    }
    paragraph.push(item);
  }
  flush();

  // ---- code blocks ------------------------------------------------------
  let previous = null;
  const uncaptioned = [];
  for (const fence of parsed.fences) {
    if (!fence.end) {
      errors.push(`line ${fence.start}: unclosed code fence`);
    }
    if (!fence.caption) {
      uncaptioned.push(fence.start);
    }
    if (fence.body.length > 70) {
      warnings.push(`line ${fence.start}: code block is ${fence.body.length} lines — trim the excerpt`);
    }
    const longLines = fence.body.filter((line) => line.length > 110).length;
    if (longLines > 0) {
      warnings.push(`line ${fence.start}: ${longLines} code line(s) longer than 110 characters — rewrap`);
    }
    if (previous && fence.start - previous.end <= 2) {
      warnings.push(`line ${fence.start}: two code blocks back to back — add narration between them`);
    }
    previous = fence;
  }
  if (uncaptioned.length > 0) {
    const first = uncaptioned.slice(0, 3).join(', ');
    const more = uncaptioned.length > 3 ? ', ...' : '';
    warnings.push(
      `${uncaptioned.length} code fence(s) have no caption (first at line ${first}${more})`
    );
  }

  // ---- links, source paths, filler -------------------------------------
  for (const item of parsed.prose) {
    for (const match of item.text.matchAll(LINK_RE)) {
      if (!resolveTarget(match[2], fileDir)) {
        errors.push(`line ${item.line}: broken link target "${match[2]}"`);
      }
    }
    for (const match of item.text.matchAll(/`([^`]+)`/g)) {
      const token = match[1].trim();
      const sourceMatch = token.match(SOURCE_RE);
      if (sourceMatch && !resolveSource(sourceMatch[1])) {
        errors.push(`line ${item.line}: referenced path "${sourceMatch[1]}" does not exist`);
      }
    }
  }

  const plain = parsed.prose.map((item) => stripInlineCode(item.text)).join(' ');
  const filler = {};
  for (const match of plain.matchAll(FILLER_RE)) {
    const key = match[1].toLowerCase();
    filler[key] = (filler[key] || 0) + 1;
  }

  const minutes = Math.max(1, Math.round(proseWords / WORDS_PER_MINUTE));
  if (errors.length === 0) {
    console.log(
      `OK       ${rel}  (${chapters.length} chapters, ${proseWords.toLocaleString('en-US')} prose words, ` +
        `${parsed.fences.length} code blocks / ${codeWords} lines, ~${minutes} min)`
    );
  } else {
    console.log(`FAIL     ${rel}`);
    failures += 1;
  }
  for (const error of errors) console.log(`         error: ${error}`);
  for (const warning of warnings) console.log(`         warn:  ${warning}`);
  const fillerNote = Object.entries(filler)
    .filter(([, count]) => count > 1)
    .map(([word, count]) => `"${word}" ×${count}`)
    .join(', ');
  if (fillerNote) console.log(`         note:  filler words — ${fillerNote}`);
}

console.log('');
console.log(`${files.length} file(s), ${failures} failure(s).`);
if (!root) {
  console.log('Run with --root <repo> to check that src/ and test/ paths resolve.');
}

process.exit(failures === 0 ? 0 : 1);
