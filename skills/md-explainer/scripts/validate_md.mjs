#!/usr/bin/env node
/**
 * Structural validator for Markdown explainers.
 *
 * Usage:
 *   node scripts/validate_md.mjs [--profile build|companion|free|auto]
 *                                [--min-chapters N] [--root DIR] <file.md ...>
 *
 * Profiles:
 *   build      rendered lesson: `## 01 Title`, meta strip, captions, colophon
 *   companion  scene guide:     `## 00 · Title`, captions
 *   free       topic deep-dive: free but consistent heading hierarchy
 *   auto       detect from the H2 headings (default)
 *
 * This is a structural smoke test. It cannot judge teaching quality or
 * whether the renderer produced the right anchors; the checklist in SKILL.md
 * still applies.
 */

import fs from 'node:fs';
import path from 'node:path';

const CAPTION_RE = /^\*\*(.+?)\*\*\s*·\s*\*([^*]+)\*$/;
const CHAPTER_BUILD = /^(\d{2})\s+(?!·)(.+)$/;
const CHAPTER_COMPANION = /^(\d{2})\s*·\s*(.+)$/;
const PLACEHOLDER_RE = /\bTODO\b|\bTBD\b|\bFIXME\b|Lorem ipsum|⟨|\{\{|\}\}/i;
const HTML_TAG_RE =
  /<\/?(?:a|abbr|article|aside|audio|b|blockquote|br|button|code|dd|details|div|dl|dt|em|figcaption|figure|footer|form|h[1-6]|header|hr|i|iframe|img|input|kbd|label|li|main|nav|ol|option|p|path|pre|script|section|select|small|source|span|strong|style|sub|summary|sup|svg|table|tbody|td|textarea|th|thead|tr|u|ul|video)\b[^>]*>/i;
const STAT_RE = /^-\s+\*\*[^*]+\*\*\s+—\s+\S/;

const PROFILE_MIN_CHAPTERS = { build: 6, companion: 6, free: 4 };
const PROFILE_START = { build: 1, companion: 0 };

function usage(code = 2) {
  console.error(
    'Usage: node scripts/validate_md.mjs [--profile build|companion|free|auto] ' +
      '[--min-chapters N] [--root DIR] <file.md|dir> [...]'
  );
  process.exit(code);
}

const files = [];
let profile = 'auto';
let minChapters = null;
let root = null;

const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--help' || arg === '-h') usage(0);
  else if (arg === '--profile') profile = argv[++i];
  else if (arg === '--min-chapters') minChapters = Number(argv[++i]);
  else if (arg === '--root') root = path.resolve(argv[++i]);
  else if (arg.startsWith('--')) {
    console.error(`Unknown option: ${arg}`);
    usage();
  } else files.push(arg);
}

if (!['auto', 'build', 'companion', 'free'].includes(profile)) {
  console.error(`Unknown profile: ${profile}`);
  usage();
}
if (minChapters !== null && (!Number.isInteger(minChapters) || minChapters < 1)) {
  console.error('--min-chapters must be a positive integer');
  usage();
}
if (files.length === 0) usage();

const targets = [];
for (const entry of files) {
  const resolved = path.resolve(entry);
  if (!fs.existsSync(resolved)) {
    console.error(`Not found: ${entry}`);
    process.exit(1);
  }
  _collect(resolved, targets);
}

function _collect(resolved, out) {
  if (fs.statSync(resolved).isDirectory()) {
    const found = fs
      .readdirSync(resolved, { withFileTypes: true })
      .filter((item) => item.isFile() && item.name.endsWith('.md'))
      .map((item) => path.join(resolved, item.name))
      .sort();
    found.forEach((file) => _collect(file, out));
  } else {
    out.push(resolved);
  }
}

/** Blank out HTML comments, then walk the document once. */
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

  const h1 = [];
  const h2 = [];
  const h3 = [];
  const fences = [];
  const prose = [];
  const captionsUsed = new Set();
  let tables = 0;
  let quotes = 0;
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
      let captionLine = -1;
      for (let j = i - 1; j >= 0; j -= 1) {
        if (!lines[j].trim()) continue;
        const m = lines[j].trim().match(CAPTION_RE);
        if (m) {
          caption = { label: m[1].trim(), lang: m[2].trim() };
          captionLine = j + 1;
        }
        break;
      }
      if (caption) captionsUsed.add(captionLine);
      fence = { lang, start: i + 1, end: 0, caption, captionLine, body: [] };
      fences.push(fence);
      continue;
    }

    if (!s) continue;

    let m = raw.match(/^#\s+(.+)$/);
    if (m) {
      h1.push({ text: m[1].trim(), line: i + 1 });
      continue;
    }
    m = raw.match(/^##\s+(.+)$/);
    if (m) {
      h2.push({ text: m[1].trim(), line: i + 1 });
      continue;
    }
    m = raw.match(/^###\s+(.+)$/);
    if (m) {
      h3.push({ text: m[1].trim(), line: i + 1 });
      continue;
    }

    if (s.startsWith('>')) quotes += 1;
    if (s.startsWith('|') && !(lines[i - 1] || '').trim().startsWith('|')) tables += 1;

    prose.push({ line: i + 1, text: raw });
  }

  return {
    lines,
    h1,
    h2,
    h3,
    fences,
    prose,
    captionsUsed,
    tables,
    quotes,
    unclosedFence: fences.some((item) => !item.end)
  };
}

function detectProfile(parsed) {
  // Companion is checked first: "00 · Title" would also match the build
  // pattern ("00" plus a space) with a "· Title" chapter name.
  if (parsed.h2.some((heading) => CHAPTER_COMPANION.test(heading.text))) return 'companion';
  if (parsed.h2.some((heading) => CHAPTER_BUILD.test(heading.text))) return 'build';
  return 'free';
}

function stripInlineCode(text) {
  return text.replace(/`[^`]*`/g, ' ');
}

function longestStatRun(parsed) {
  let run = 0;
  let best = 0;
  for (const item of parsed.prose) {
    if (STAT_RE.test(item.text.trim())) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

const CAPTION_LANGS = new Map([
  ['js', 'javascript'],
  ['javascript', 'javascript'],
  ['sh', 'bash'],
  ['shell', 'bash'],
  ['console', 'console'],
  ['stdout', 'stdout'],
  ['terminal', 'stdout']
]);

function normalLang(value) {
  const lower = value.toLowerCase();
  return CAPTION_LANGS.get(lower) || lower;
}

let failures = 0;

for (const file of targets) {
  const rel = path.relative(process.cwd(), file) || path.basename(file);
  const text = fs.readFileSync(file, 'utf8');
  const parsed = parse(text);
  const active = profile === 'auto' ? detectProfile(parsed) : profile;
  const errors = [];
  const warnings = [];
  const chapterRe = active === 'build' ? CHAPTER_BUILD : active === 'companion' ? CHAPTER_COMPANION : null;
  const firstChapterLine = parsed.h2.length > 0 ? parsed.h2[0].line : Number.POSITIVE_INFINITY;

  // ---- header -----------------------------------------------------------
  if (parsed.h1.length !== 1) {
    const message = `expected exactly one H1 title, found ${parsed.h1.length}`;
    if (active === 'free' && parsed.h1.length > 1) warnings.push(`${message} — use H2 for the later sections`);
    else errors.push(message);
  }
  if (parsed.h1.length > 0 && parsed.h2.length > 0 && parsed.h2[0].line < parsed.h1[0].line) {
    errors.push('H2 appears before the H1 title');
  }

  const headerProse = parsed.prose.filter((item) => item.line < firstChapterLine);
  if (parsed.h1.length === 1) {
    const lede = headerProse.find((item) => {
      const s = item.text.trim();
      return (
        s.length >= 30 &&
        !s.startsWith('|') &&
        !s.startsWith('>') &&
        !s.startsWith('-') &&
        !s.startsWith('*') &&
        !s.startsWith('`')
      );
    });
    if (!lede) errors.push('missing lede paragraph under the H1 title');
  }

  if (active === 'build') {
    const meta = headerProse.find((item) =>
      /^`[^`]+`(?:\s*·\s*`[^`]+`){2,}$/.test(item.text.trim())
    );
    if (!meta) {
      errors.push('missing meta strip: one line of 3+ backticked items joined by " · "');
    }
  }

  // ---- chapters ---------------------------------------------------------
  const min = minChapters ?? PROFILE_MIN_CHAPTERS[active];
  if (parsed.h2.length < min) {
    errors.push(`expected at least ${min} chapters, found ${parsed.h2.length}`);
  }

  if (chapterRe) {
    const start = PROFILE_START[active];
    const chapters = [];
    for (const heading of parsed.h2) {
      const m = heading.text.match(chapterRe);
      if (!m) {
        const shape = active === 'build' ? '## NN Title' : '## NN · Title';
        const isFrontMatter =
          active === 'companion' &&
          !parsed.h2.some(
            (other) => other.line < heading.line && CHAPTER_COMPANION.test(other.text)
          );
        if (isFrontMatter) {
          warnings.push(`line ${heading.line}: unnumbered front-matter heading (${shape} for scenes)`);
        } else {
          errors.push(`line ${heading.line}: "${heading.text}" is not a numbered chapter (${shape})`);
        }
      } else {
        chapters.push({ number: Number(m[1]), title: m[2].trim(), line: heading.line });
      }
    }
    chapters.forEach((chapter, index) => {
      const expected = start + index;
      if (chapter.number !== expected) {
        errors.push(
          `line ${chapter.line}: chapter ${String(chapter.number).padStart(2, '0')} ` +
            `out of sequence (expected ${String(expected).padStart(2, '0')})`
        );
      }
    });
  }

  const seenHeadings = new Map();
  for (const heading of parsed.h2) {
    const key = heading.text.toLowerCase();
    if (seenHeadings.has(key)) {
      errors.push(`duplicate chapter title: "${heading.text}" (lines ${seenHeadings.get(key)} and ${heading.line})`);
    } else {
      seenHeadings.set(key, heading.line);
    }
  }

  if (parsed.h3.length > 0 && parsed.h2.length > 0 && parsed.h3[0].line < parsed.h2[0].line) {
    errors.push('H3 subhead appears before the first H2 chapter');
  }

  // ---- fences and captions ---------------------------------------------
  if (parsed.unclosedFence) errors.push('unclosed code fence');

  for (const fence of parsed.fences) {
    if (!fence.lang) {
      const message = `line ${fence.start}: code fence has no language tag`;
      if (active === 'free') warnings.push(message);
      else errors.push(message);
    }
    if (fence.body.length === 0) {
      warnings.push(`line ${fence.start}: empty code fence`);
    }
    if (active !== 'free' && !fence.caption) {
      errors.push(`line ${fence.start}: code fence has no caption ("**label** · *lang*" line above it)`);
    }
    if (fence.caption && fence.lang && normalLang(fence.caption.lang) !== normalLang(fence.lang)) {
      warnings.push(
        `line ${fence.start}: caption language "*${fence.caption.lang}*" does not match fence language "${fence.lang}"`
      );
    }
  }

  for (const item of parsed.prose) {
    if (!CAPTION_RE.test(item.text.trim())) continue;
    if (parsed.captionsUsed.has(item.line)) continue;
    const message = `line ${item.line}: caption is not attached to a code fence`;
    if (active === 'build') errors.push(message);
    else warnings.push(message);
  }

  // ---- visual vocabulary ------------------------------------------------
  if (parsed.tables === 0) {
    const message = 'no pipe table';
    if (active === 'free') warnings.push(message);
    else errors.push(message);
  }
  if (parsed.quotes === 0) {
    const message = 'no blockquote callout';
    if (active === 'free') warnings.push(message);
    else errors.push(message);
  }
  if (active === 'build' && longestStatRun(parsed) < 4) {
    warnings.push('no stats strip: 4+ consecutive "- **N** — label" items render as one');
  }

  // ---- colophon ---------------------------------------------------------
  if (active === 'build') {
    const rules = [];
    parsed.lines.forEach((line, index) => {
      if (line.trim() === '---') rules.push(index + 1);
    });
    if (rules.length === 0) {
      errors.push('missing colophon: "---" followed by one closing paragraph');
    } else {
      if (rules.length > 1) {
        warnings.push(`found ${rules.length} "---" lines; earlier ones are parsed as empty colophons and dropped`);
      }
      const lastRule = rules[rules.length - 1];
      const lastChapter = parsed.h2.length > 0 ? parsed.h2[parsed.h2.length - 1].line : 0;
      if (lastRule < lastChapter) {
        errors.push('colophon "---" appears before the last chapter');
      }
      const after = parsed.prose.filter((item) => item.line > lastRule);
      if (after.length === 0) {
        errors.push('colophon "---" is not followed by a closing paragraph');
      }
      const headingAfter = parsed.h2.concat(parsed.h3).some((heading) => heading.line > lastRule);
      if (headingAfter) errors.push('a heading appears after the colophon');
    }
  }

  // ---- placeholders and stray HTML -------------------------------------
  for (const item of parsed.prose) {
    const s = item.text.trim();
    if (PLACEHOLDER_RE.test(s)) {
      errors.push(`line ${item.line}: placeholder text left in the document`);
    }
    if (HTML_TAG_RE.test(stripInlineCode(s))) {
      errors.push(`line ${item.line}: raw HTML in prose (only comments are allowed)`);
    }
  }

  // ---- stats -----------------------------------------------------------
  const proseWords = parsed.prose
    .map((item) => stripInlineCode(item.text))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

  const chapterCount = chapterRe
    ? parsed.h2.filter((heading) => chapterRe.test(heading.text)).length
    : parsed.h2.length;

  const label = parsed.h1.length === 1 ? parsed.h1[0].text : path.basename(file);
  if (errors.length === 0) {
    console.log(
      `OK       ${rel}  (${active}, ${chapterCount} chapters, ${parsed.fences.length} code blocks, ${proseWords.toLocaleString('en-US')} words)`
    );
    console.log(`         ${label}`);
  } else {
    console.log(`FAIL     ${rel}  (${active})`);
    failures += 1;
  }
  for (const error of errors) console.log(`         error: ${error}`);
  for (const warning of warnings) console.log(`         warn:  ${warning}`);
}

console.log('');
console.log(`${targets.length} file(s), ${failures} failure(s).`);
if (failures === 0) {
  console.log('Structural checks passed. Now run scripts/audit_md.mjs and the renderer checklist in SKILL.md.');
}

process.exit(failures === 0 ? 0 : 1);
