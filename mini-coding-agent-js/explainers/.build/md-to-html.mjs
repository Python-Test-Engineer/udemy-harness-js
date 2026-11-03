#!/usr/bin/env node
/**
 * Convert a long-form markdown file into a reading-guide HTML page
 * styled like sandbox-guide.html in the same directory.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function mdToHtml(md) {
  let html = '';
  const lines = md.split(/\r?\n/);
  let i = 0;
  let sectionOpen = false;
  let inCode = false;
  let codeLang = '';
  let codeCaption = '';
  let codeBuffer = [];
  let inTable = false;
  let tableBuffer = [];
  let inList = false;
  let listType = null; // 'ul' or 'ol'
  let listBuffer = [];
  let inBlockquote = false;
  let bqBuffer = [];

  function flushCode() {
    if (!inCode || codeBuffer.length === 0) return;
    const body = escapeHtml(codeBuffer.join('\n'));
    const cap = codeCaption ? `<figcaption><span>${codeCaption}</span><span class="lang">${codeLang || 'text'}</span></figcaption>` : '';
    html += `\n<figure class="code">${cap}<pre>${body}</pre></figure>\n`;
    codeBuffer = [];
    inCode = false;
    codeLang = '';
    codeCaption = '';
  }

  function flushTable() {
    if (!inTable || tableBuffer.length === 0) return;
    const rows = tableBuffer.map((row, idx) => {
      const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
      if (idx === 1) return ''; // separator row
      const tag = idx === 0 ? 'th' : 'td';
      return `<tr>${cells.map(c => `<${tag}>${inline(c)}</${tag}>`).join('')}</tr>`;
    }).filter(Boolean);
    html += `\n<div class="table-wrap"><table>\n${rows.join('\n')}\n</table></div>\n`;
    tableBuffer = [];
    inTable = false;
  }

  function flushList() {
    if (!inList || listBuffer.length === 0) return;
    const items = listBuffer.map(item => `<li>${inline(item)}</li>`).join('\n');
    html += `\n<${listType}>\n${items}\n</${listType}>\n`;
    listBuffer = [];
    inList = false;
    listType = null;
  }

  function flushBlockquote() {
    if (!inBlockquote || bqBuffer.length === 0) return;
    const content = bqBuffer.map(l => inline(l)).join('\n');
    html += `\n<div class="callout">${content}</div>\n`;
    bqBuffer = [];
    inBlockquote = false;
  }

  function closeSection() {
    flushCode();
    flushTable();
    flushList();
    flushBlockquote();
    if (sectionOpen) {
      html += '\n</section>\n';
      sectionOpen = false;
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function inline(str) {
    // Escape HTML first
    let s = escapeHtml(str);
    // Bold
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic (not inside code tags)
    s = s.replace(/(^|[^*])\*(?!\*)(.+?)\*([^*]|$)/g, '$1<em>$2</em>$3');
    // Code inline
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Links
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return s;
  }

  const headings = [];
  let h2Counter = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw; // keep original for code blocks

    // Code block
    if (line.startsWith('```')) {
      if (!inCode) {
        flushList();
        flushBlockquote();
        inCode = true;
        const rest = line.slice(3).trim();
        codeLang = rest;
        codeCaption = '';
      } else {
        flushCode();
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuffer.push(raw);
      i++;
      continue;
    }

    // Horizontal rule: close section only if the next non-empty line is a top-level heading
    if (/^---+\s*$/.test(line)) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      const nextIsH1 = j < lines.length && /^#\s+/.test(lines[j]);
      if (nextIsH1) closeSection();
      else flushList();
      html += '\n<hr>\n';
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      if (!inBlockquote) flushList();
      inBlockquote = true;
      bqBuffer.push(line.replace(/^>\s?/, ''));
      i++;
      continue;
    } else if (inBlockquote && line.trim() === '') {
      flushBlockquote();
      i++;
      continue;
    }

    // Table
    if (line.trim().startsWith('|')) {
      if (!inTable) {
        flushList();
        inTable = true;
      }
      tableBuffer.push(line.trim());
      i++;
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    const h1Match = line.match(/^#\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);
    const h4Match = line.match(/^####\s+(.+)$/);

    if (h1Match) {
      closeSection();
      h2Counter++;
      const text = inline(h1Match[1]);
      const id = 's' + String(h2Counter).padStart(2, '0');
      headings.push({ level: 2, text: h1Match[1], id });
      html += `\n<section id="${id}">\n<h2><span class="num">${String(h2Counter).padStart(2, '0')}</span><span>${text}</span></h2>\n`;
      sectionOpen = true;
      i++;
      continue;
    }
    if (h2Match) {
      flushList();
      flushBlockquote();
      const text = inline(h2Match[1]);
      html += `\n<h3>${text}</h3>\n`;
      i++;
      continue;
    }
    if (h3Match) {
      flushList();
      const text = inline(h3Match[1]);
      html += `\n<h4>${text}</h4>\n`;
      i++;
      continue;
    }
    if (h4Match) {
      flushList();
      html += `\n<h5>${inline(h4Match[1])}</h5>\n`;
      i++;
      continue;
    }

    // Lists
    const ulMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (ulMatch || olMatch) {
      const isUl = !!ulMatch;
      const content = ulMatch ? ulMatch[2] : olMatch[2];
      const newType = isUl ? 'ul' : 'ol';
      if (inList && listType !== newType) {
        flushList();
      }
      inList = true;
      listType = newType;
      listBuffer.push(content);
      i++;
      continue;
    } else if (inList && (line.trim() === '' || (!ulMatch && !olMatch && !line.startsWith(' ')))) {
      flushList();
    }

    // Empty line
    if (line.trim() === '') {
      flushBlockquote();
      i++;
      continue;
    }

    // Paragraph
    flushList();
    flushBlockquote();
    html += `\n<p>${inline(line)}</p>\n`;
    i++;
  }

  closeSection();
  return { html, headings };
}

function buildPage({ title, eyebrow, h1, lede, meta, tocTitle, sideSub, sideFoot, contentHtml, headings }) {
  const numPad = (n) => String(n).padStart(2, '0');

  const toc = headings.map((h, idx) =>
    `      <a href="#${h.id}"><span class="n">${numPad(idx + 1)}</span><span>${escapeXml(h.text)}</span></a>`
  ).join('\n');

  const metaTags = (meta || []).map(m => `          <span>${escapeXml(m)}</span>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeXml(title)}</title>
<style>
html{font-size:var(--root-size,24px)}

:root{
  --paper:#f0eee6; --surface:#fbfaf7; --ivory:#fffdfa; --ink:#1f1e1d;
  --prose:#33302c; --muted:#55524c; --stone:#8c877c;
  --line:#e0dbcf; --line-soft:#e9e4d8; --tint:#f6ede6;
  --terra:#d97757; --terra-dark:#c9633f; --amber:#b9862f;
  --code-bg:#23211e; --code-bar:#2b2823; --code-line:#3a3732;
  --code-ink:#f2ece1; --code-dim:#a9a294; --code-accent:#f0b49a;
  --sidebar:19.25rem; --measure:46rem;
  --sans:-apple-system,'Segoe UI',Inter,Helvetica,Arial,sans-serif;
  --serif:'Iowan Old Style',Palatino,'Palatino Linotype','Book Antiqua',Georgia,serif;
  --mono:'JetBrains Mono','Fira Code',ui-monospace,SFMono-Regular,Consolas,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0; background:var(--paper); color:var(--prose);
  font:1.03125rem/var(--lh-body,1.66) var(--sans);
  -webkit-font-smoothing:antialiased;
}
::selection{background:#f0d3c6; color:#2a2622}

/* ---------- shell ---------- */
.shell{display:grid; grid-template-columns:var(--sidebar) minmax(0,1fr); align-items:start}
.sidebar{
  position:sticky; top:0; height:100vh; overflow-y:auto; overscroll-behavior:contain;
  scrollbar-width:thin; scrollbar-color:#cec6b5 transparent;
  padding:1.625rem 1.125rem 2.125rem 1.375rem;
  border-right:0.0625rem solid var(--line);
  background:linear-gradient(180deg,#f4f1e9,#efece3 60%,#ece8de);
}
.side-kicker{
  display:block; margin:0 0 0.625rem; color:var(--terra-dark);
  font:600 0.65625rem/1.3 var(--sans); letter-spacing:.14em; text-transform:uppercase; text-decoration:none;
}
.side-title{
  margin:0; color:var(--ink); font:500 1.3125rem/1.2 var(--serif); letter-spacing:-.01em;
}
.side-sub{margin:0.375rem 0 0; color:var(--stone); font-size:0.7875rem; line-height:1.45}
.side-rule{height:0.0625rem; margin:1.125rem 0 0.875rem; background:var(--line)}
.side-label{
  margin:0 0 0.375rem; color:var(--stone);
  font:600 0.65625rem/1.3 var(--sans); letter-spacing:.13em; text-transform:uppercase;
}
.toc{display:flex; flex-direction:column; gap:0.0625rem}
.toc a{
  display:flex; gap:0.5625rem; align-items:baseline;
  padding:0.375rem 0.5625rem 0.375rem 0.625rem; border-left:0.125rem solid transparent; border-radius:0 0.4375rem 0.4375rem 0;
  color:var(--muted); font-size:0.8375rem; line-height:1.4; text-decoration:none;
  transition:background .14s,color .14s,border-color .14s;
}
.toc a .n{color:#a9a294; font:0.6875rem/1 var(--mono); flex:0 0 1.125rem}
.toc a:hover{background:#e8e3d6; color:var(--ink)}
.toc a.active{background:var(--tint); border-left-color:var(--terra); color:var(--ink); font-weight:600}
.toc a.active .n{color:var(--terra-dark)}
.side-foot{
  margin-top:1.25rem; padding-top:0.875rem; border-top:0.0625rem solid var(--line);
  color:var(--stone); font-size:0.7375rem; line-height:1.6;
}
.side-foot code{font-size:0.6875rem}

.progress{position:fixed; top:0; left:var(--sidebar); right:0; height:0.125rem; z-index:40; background:transparent}
.progress span{display:block; height:100%; width:0; background:var(--terra); transition:width .1s linear}

.sidebar::-webkit-scrollbar{width:0.4375rem}
.sidebar::-webkit-scrollbar-thumb{background:#d5ccbb; border-radius:0.5rem}
.sidebar::-webkit-scrollbar-track{background:transparent}

/* ---------- content pane ---------- */
.pane{padding:3.25rem 3.5rem 8.75rem; min-width:0}
.inner{max-width:var(--measure); margin:0 auto}

.page-heading{margin:0 0 2.125rem; padding-bottom:1.75rem; border-bottom:0.0625rem solid var(--line)}
.page-heading .eyebrow{
  margin:0 0 0.75rem; color:var(--terra-dark);
  font:600 0.6875rem/1.3 var(--sans); letter-spacing:.15em; text-transform:uppercase;
}
h1{
  margin:0; color:var(--ink); font:500 clamp(2.125rem,4vw,2.875rem)/1.1 var(--serif); letter-spacing:-.02em;
}
.page-heading .lede{margin:0.875rem 0 0; color:var(--muted); font-size:1.09375rem; max-width:38rem}
.meta{
  margin:1.25rem 0 0; display:flex; flex-wrap:wrap; gap:0.25rem 0.6875rem;
  color:var(--stone); font:0.7rem/1.6 var(--mono);
}
.meta span::before{content:"\\00b7"; margin-right:0.6875rem; color:#c3bcae}
.meta span:first-child::before{content:none; margin:0}

section{padding-top:0.375rem; margin:0 0 2.75rem}
section:first-of-type h2{margin-top:0}
h2{
  display:flex; gap:0.8125rem; align-items:baseline;
  margin:2.375rem 0 0.875rem; color:var(--ink);
  font:500 1.65625rem/1.22 var(--serif); letter-spacing:-.015em;
  scroll-margin-top:1.625rem;
}
h2 .num{
  flex:0 0 auto; color:var(--terra); padding-top:0.125rem;
  font:600 0.71875rem/1 var(--mono); letter-spacing:.06em;
}
h3{
  margin:1.875rem 0 0.625rem; color:var(--ink);
  font:600 0.96875rem/1.4 var(--sans); letter-spacing:.005em;
}
h4{
  margin:1.5rem 0 0.5rem; color:var(--ink);
  font:600 0.85rem/1.35 var(--sans); letter-spacing:.005em;
}
h5{
  margin:1.25rem 0 0.4rem; color:var(--ink);
  font:600 0.8rem/1.3 var(--sans); letter-spacing:.005em;
}
p{margin:0 0 0.875rem}
p + p{margin-top:-0.125rem}
strong{color:var(--ink); font-weight:600}
em{font-style:italic; color:var(--ink)}
a{color:var(--terra-dark); text-decoration-thickness:0.0625rem; text-underline-offset:0.125rem}

ul{margin:0 0 1rem; padding-left:0; list-style:none}
ol{margin:0 0 1rem; padding-left:0; list-style:none; counter-reset:item}
ol li{position:relative; margin:0 0 0.625rem; padding-left:1.5rem}
ol li::before{
  content:counter(item) "."; counter-increment:item; position:absolute; left:0.1875rem; top:0;
  color:var(--terra); font:600 0.7rem/1 var(--mono);
}
ul li{position:relative; margin:0 0 0.625rem; padding-left:1.25rem}
ul li::before{
  content:""; position:absolute; left:0.1875rem; top:.66em;
  width:0.375rem; height:0.375rem; border-radius:50%; background:#d8b6a6;
}
li strong{color:var(--ink)}

code{
  padding:.12em .38em; border-radius:0.3125rem; background:#e9e4d7; color:#7c3f2b;
  font:.855em/1.5 var(--mono); word-break:break-word;
}

/* ---------- callouts ---------- */
.callout{
  margin:1.25rem 0 1.375rem; padding:0.8125rem 1.0625rem 0.875rem;
  border-left:0.1875rem solid var(--terra); border-radius:0 0.5625rem 0.5625rem 0;
  background:var(--tint); color:#4b4741; font-size:0.925rem; line-height:1.62;
}
.callout strong{color:var(--ink)}
.callout.warn{border-left-color:var(--amber); background:#f7f0da; color:#4e4734}

/* ---------- code ---------- */
figure.code, figure.ascii{margin:1.125rem 0 1.375rem; border-radius:0.6875rem; overflow:hidden}
figure.code{margin-left:-1.375rem; margin-right:-1.375rem}
figure.code{background:var(--code-bg); border:0.0625rem solid #34312b; box-shadow:0 0.125rem 0.625rem rgba(31,30,29,.07)}
figure.code figcaption{
  display:flex; justify-content:space-between; gap:0.75rem; align-items:center;
  padding:0.5rem 0.875rem; background:var(--code-bar); border-bottom:0.0625rem solid var(--code-line);
  color:var(--code-accent); font:0.7125rem/1.4 var(--mono); letter-spacing:.02em;
}
figure.code figcaption .lang{color:#7d776b; font-size:0.6625rem; letter-spacing:.1em; text-transform:uppercase}
figure.code pre{
  margin:0; padding:0.9375rem 1.125rem 1.0625rem; overflow-x:auto;
  color:var(--code-ink); font:var(--fs-code,0.775rem)/1.66 var(--mono); tab-size:2;
  white-space:pre-wrap; overflow-wrap:break-word;
}
figure.ascii{
  border:0.0625rem dashed #d3ccbb; background:#f7f4ec;
}
figure.ascii figcaption{
  padding:0.4375rem 0.875rem 0; color:var(--stone);
  font:600 0.65rem/1.4 var(--sans); letter-spacing:.12em; text-transform:uppercase;
}
figure.ascii pre{
  margin:0; padding:0.6875rem 0.875rem 0.9375rem; overflow-x:auto;
  color:#4c483f; font:0.76875rem/1.55 var(--mono); white-space:pre;
}

/* ---------- tables ---------- */
.table-wrap{margin:1rem 0 1.375rem; overflow-x:auto; scrollbar-width:thin; scrollbar-color:#cec6b5 transparent}
.table-wrap::-webkit-scrollbar{height:0.4375rem}
.table-wrap::-webkit-scrollbar-thumb{background:#d5ccbb; border-radius:0.5rem}
table{width:100%; border-collapse:collapse; font-size:0.875rem; line-height:1.5}
thead th{
  padding:0 0.75rem 0.5rem 0; border-bottom:0.0625rem solid var(--line); text-align:left;
  color:var(--stone); font:600 0.6625rem/1.3 var(--sans); letter-spacing:.09em; text-transform:uppercase;
}
tbody td{padding:0.625rem 0.75rem 0.625rem 0; border-bottom:0.0625rem solid var(--line-soft); vertical-align:top; color:var(--muted)}
tbody tr:last-child td{border-bottom:none}
tbody td:first-child{color:var(--ink)}
tbody td code{font-size:0.75rem}
tbody td:first-child{white-space:nowrap}
.tag{
  display:inline-block; margin-left:0.375rem; padding:0.0625rem 0.375rem; border-radius:1.25rem;
  background:#f0dcd2; color:#9a4d31; font:600 0.6rem/1.5 var(--sans); letter-spacing:.08em; text-transform:uppercase;
}

.table-wrap.dense table{font-size:0.8125rem}
.table-wrap.dense tbody td, .table-wrap.dense td code{white-space:normal; overflow-wrap:anywhere}
.table-wrap.dense tbody td{padding-right:0.625rem}
.table-wrap.dense tbody td:first-child{min-width:8.5rem}

/* ---------- footer ---------- */
.colophon{
  margin-top:3.5rem; padding-top:1.125rem; border-top:0.0625rem solid var(--line);
  color:var(--stone); font-size:0.775rem; line-height:1.7;
}
.colophon code{font-size:0.7rem}

/* ---------- narrow ---------- */
@media (max-width: 940px){
  .shell{grid-template-columns:1fr}
  .sidebar{position:static; height:auto; border-right:none; border-bottom:0.0625rem solid var(--line); padding:1.375rem 1.25rem 1.125rem}
  .toc{flex-direction:row; flex-wrap:wrap; gap:0.25rem 0.375rem}
  .toc a{padding:0.3125rem 0.5625rem; border-left:none; border-radius:0.4375rem; background:#eae5d8; font-size:0.775rem}
  .toc a .n{flex:0 0 auto}
  .toc a.active{border-left:none}
  .side-foot{display:none}
  .progress{left:0}
  .pane{padding:1.875rem 1.25rem 5.625rem}
  h2{font-size:1.4375rem}
  .table-wrap{margin-left:0; margin-right:0}
  figure.code{margin-left:0; margin-right:0}
  thead th{white-space:nowrap}
  tbody td, tbody td code{white-space:normal; overflow-wrap:anywhere}
}

/* ---------- print ---------- */
@media print{
  :root{ --paper:#fff !important; --surface:#fff !important; --ivory:#fff !important; --ink:#1f1e1d !important; --prose:#33302c !important; --muted:#44423d !important; --stone:#6b675f !important; --line:#d8d3c8 !important; --line-soft:#e8e4da !important; --tint:#f8f2ec !important; --terra:#c9633f !important; --terra-dark:#a14e2f !important; --amber:#8a6420 !important; --code-bg:#f6f4ef !important; --code-bar:#efece3 !important; --code-line:#ddd8cc !important; --code-ink:#26241f !important; --code-dim:#6b675f !important; --code-accent:#8f3f27}

  .sidebar,.progress{display:none}
  .shell{display:block}
  .pane{padding:0}
  body{background:#fff; font-size:10.5pt}
  h2{break-after:avoid} figure,table,.callout{break-inside:avoid}
  figure.code{margin-left:0; margin-right:0}
  a{color:inherit; text-decoration:none}
}
</style>
</head>
<body>
<div class="progress"><span id="bar"></span></div>
<div class="shell">

  <aside class="sidebar">
    <a class="side-kicker" href="#top">mini-coding-js &middot; Build prompt</a>
    <p class="side-title">${escapeXml(tocTitle)}</p>
    <p class="side-sub">${escapeXml(sideSub)}</p>
    <div class="side-rule"></div>
    <p class="side-label">Contents</p>
    <nav class="toc" id="toc">
${toc}
    </nav>
    <div class="side-foot">
      ${sideFoot || ''}
    </div>
  </aside>

  <main class="pane" id="top">
    <div class="inner">
      <header class="page-heading">
        <p class="eyebrow">${escapeXml(eyebrow)}</p>
        <h1>${escapeXml(h1)}</h1>
        <p class="lede">${escapeXml(lede)}</p>
        <p class="meta">
${metaTags}
        </p>
      </header>

${contentHtml}

      <div class="colophon">
        Built from <code>reverse-engineering.md</code> &middot; ${headings.length} sections &middot; mini-coding-js explainer series
      </div>
    </div>
  </main>
</div>

<script>
(function(){
  var toc = document.getElementById('toc');
  var links = toc.querySelectorAll('a');
  var sections = [];
  links.forEach(function(a){
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) sections.push({link:a, el:el});
  });
  function onScroll(){
    var y = window.scrollY + 80;
    var active = null;
    for (var i = 0; i < sections.length; i++){
      if (y >= sections[i].el.offsetTop) active = sections[i];
    }
    sections.forEach(function(s){ s.link.classList.remove('active'); });
    if (active) active.link.classList.add('active');
    var bar = document.getElementById('bar');
    var doc = document.documentElement;
    var pct = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
    bar.style.width = Math.max(0, Math.min(1, pct || 0)) * 100 + '%';
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
</script>
</body>
</html>`;
}

function escapeXml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Main ───────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const mdPath = args[0]
  ? path.resolve(args[0])
  : path.resolve(__dirname, '..', 'reverse-engineering.md');
const outPath = args[1]
  ? path.resolve(args[1])
  : path.join(path.dirname(mdPath), path.basename(mdPath, '.md') + '.html');

const md = fs.readFileSync(mdPath, 'utf8');
const { html, headings } = mdToHtml(md);

const baseName = path.basename(mdPath, '.md');
const isReverse = baseName === 'reverse-engineering';

const titleFallback = isReverse
  ? 'mini-coding-js \u00b7 Reverse-engineering build prompt'
  : `mini-coding-js \u00b7 ${baseName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`;

const page = buildPage({
  title: titleFallback,
  eyebrow: isReverse ? 'Build prompt \u00b7 complete specification' : 'Reading guide',
  h1: isReverse ? 'Reverse-engineering mini-coding-js' : baseName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  lede: isReverse
    ? 'A from-scratch specification of the minimal coding-agent harness: one ReAct loop, eight tools, a write sandbox, nine lifecycle hooks, persistent memory, and an offline demo that proves the guards hold.'
    : 'Converted from Markdown.',
  meta: isReverse ? ['15 sections', '~1400 lines', '15 source files', '1 dependency'] : [`${headings.length} sections`, 'generated page'],
  tocTitle: isReverse ? 'Reverse-engineering' : baseName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  sideSub: isReverse
    ? 'The complete build specification: every file, every function, every contract, every test.'
    : 'Converted from Markdown to styled HTML.',
  sideFoot: isReverse
    ? 'Companion to the animated explainers<br>Every file in <code>src/</code> is specified here'
    : `Built from <code>${path.basename(mdPath)}</code><br>${headings.length} sections`,
  contentHtml: html,
  headings,
});

fs.writeFileSync(outPath, page, 'utf8');
console.log('Wrote ' + outPath + ' (' + headings.length + ' sections)');
