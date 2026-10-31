import {
  panel, consoleBlock, callout, statement, card, grid, stepNode, arrow, box, flow,
  kvList, pills, checklist, stats, rules, twoCol,
} from '../helpers.mjs';

const sceneBody = (content) => `<div class="scene-body">${content}</div>`;

const memory = {
  file: 'memory.js',
  name: 'Long-term memory',
  lessonLabel: 'Lesson 08',
  sideSub: 'a markdown file, two access paths, and honest bounds.',
  footerFacts: 'one file · two paths · four tags',
  h1: 'The only thing that survives the process',
  lede: 'Messages die with the run. memory.md does not. It is a plain markdown file beside the code, read at the start of the next run and searchable on demand. No database, no cache, no index.',
  meta: ['9 scenes', '1 markdown file', '2 access paths', '4 tags'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'Survival', duration: 12500,
      title: 'Everything else dies <em>with the process</em>.',
      body: sceneBody(twoCol(
        panel('src/memory.js', `// messages = working memory inside one run
// memory.md = the only thing that survives
export const MEMORY_FILE = 'src/memory.md';
export const MEMORY_TAGS = ['fact', 'pref', 'fix', 'gotcha'];`, { at: 0 }),
        grid([
          card({ at: 1, icon: '🧵', title: 'Within a run', body: 'messages carry the conversation.' }),
          card({ at: 1, icon: '📄', title: 'Across runs', body: 'memory.md carries lessons.' }),
          card({ at: 1, icon: '👀', title: 'For humans', body: 'open it, diff it, delete a wrong line.' }),
        ], { cols: 1 }),
      ) + statement('A memory module with a cache is a memory module that lies. memory.md <em>is</em> the store.', { at: 2 })),
      beats: [
        { at: 0, text: 'Everything inside a run lives in messages. When the process exits, it is gone.' },
        { at: 4300, text: 'memory.md is the one artifact that survives, and it is deliberately human-readable.' },
        { at: 9400, text: 'There is no database and no cache. Every method reads the file, so hand edits cannot drift.' },
      ],
    },
    {
      kicker: 'The format', navTitle: 'One bullet', duration: 12500,
      title: 'One bullet.<br><em>One memory.</em>',
      body: sceneBody(consoleBlock('src/memory.md', `# memory

Long-term notes this agent keeps between runs. One bullet per memory:

- [fact] The demo script lives in workspace/demo/hello.js. _(2026-10-28)_
- [gotcha] The sandbox refuses writes outside workspace/. _(2026-10-28)_
- [pref] The user wants short final answers. _(2026-10-29)_`, { at: 0 }) + kvList([
        ['tag', 'fact · pref · fix · gotcha. Anything else becomes fact.'],
        ['text', 'one self-contained sentence.'],
        ['date', 'when it was learned. Optional for hand-added lines.'],
      ], { at: 1 })),
      beats: [
        { at: 0, text: 'The file is a heading, a sentence of explanation, and bullets.' },
        { at: 4500, text: 'Each bullet carries a tag, a self-contained text, and a date.' },
        { at: 9000, text: 'That is the least clever format that still parses, and a human can edit it by hand.' },
      ],
    },
    {
      kicker: 'Parsing', navTitle: 'parseMemory', duration: 13500,
      title: 'Anything that is not a bullet is <em>ignored</em>.',
      body: sceneBody(panel('src/memory.js', `const m = line.match(/^\\s*[-*]\\s*\\[([a-z]+)\\]\\s*(.+?)\\s*(?:_\\((\\d{4}-\\d{2}-\\d{2})\\)_)\\s*$/i);
if (!m) continue;

const text = normalise(m[2]);
if (!text) continue;
entries.push({ tag: m[1].toLowerCase(), text, date: m[3] ?? 'undated' });`, { at: 0 }) + callout('Prose, headings and comments are safe in this file. Only a bullet with a tag becomes a memory.', { at: 1 })),
      beats: [
        { at: 0, text: 'parseMemory scans line by line and keeps only the bullet shape.' },
        { at: 4600, text: 'Whitespace is collapsed, so two copies of the same sentence become one memory.' },
        { at: 9600, text: 'The date is optional. A hand-added line without one still parses as undated.' },
      ],
    },
    {
      kicker: 'Two access paths', navTitle: 'Eager and lazy', duration: 14500,
      title: 'Eager digest.<br><em>Lazy recall.</em>',
      body: sceneBody(grid([
        card({ at: 0, icon: '⚡', title: 'Eager: digest()', tag: 'system prompt', body: 'The newest few entries, capped by count and characters, appended before step 1.', accent: '#b9862f' }),
        card({ at: 1, icon: '🔎', title: 'Lazy: recall', tag: 'on demand', body: 'Search the whole file when a run needs the older detail that did not fit.', accent: '#2f9eaa' }),
      ], { cols: 2 }) + callout('The digest gives the agent a sense of continuity. Recall keeps the rest reachable without paying for it on every request.', { at: 2 })),
      beats: [
        { at: 0, text: 'The first access path is eager: a small digest goes into the system prompt.' },
        { at: 5000, text: 'The second is lazy: the recall tool searches the whole file when it is needed.' },
        { at: 10800, text: 'One path makes the agent feel like it remembers. The other keeps the context window bounded.' },
      ],
    },
    {
      kicker: 'Writing', navTitle: 'remember', duration: 14500,
      title: 'Remember, but <em>stay bounded</em>.',
      body: sceneBody(panel('src/memory.js', `const entry = {
  tag: MEMORY_TAGS.includes(tag) ? tag : 'fact',
  text: text.slice(0, this.options.maxEntryChars),
  date: today(this.now()),
};

const existing = entries.findIndex((e) => e.text.toLowerCase() === key);
if (existing !== -1) {
  entries[existing] = { ...entries[existing], date: entry.date, tag: entry.tag };
  // ...refresh, do not duplicate...
}

entries.push(entry);
const dropped = Math.max(0, entries.length - this.options.maxEntries);
if (dropped) entries.splice(0, dropped);`, { at: 0 }) + grid([
        card({ at: 1, icon: '🔁', title: 'Dedupe', body: 'Same text refreshes the date instead of appending.' }),
        card({ at: 1, icon: '📏', title: 'Cap each entry', body: '300 chars by default.' }),
        card({ at: 1, icon: '✂️', title: 'Drop oldest', body: 'keep the newest maxEntries.' }),
      ], { cols: 3 })),
      beats: [
        { at: 0, text: 'remember normalises the text, picks a tag, and caps the entry length.' },
        { at: 5000, text: 'A duplicate refreshes the date instead of adding the same sentence twice.' },
        { at: 10800, text: 'The file keeps only the newest entries. Unbounded memory becomes a context leak.' },
      ],
    },
    {
      kicker: 'The digest', navTitle: 'digest', duration: 15000,
      title: 'Bounded twice.<br><em>Honest about the tail.</em>',
      body: sceneBody(panel('src/memory.js', `const newest = all.slice(-Math.max(1, entries)).reverse();
const lines = [];
let used = 0;
for (const entry of newest) {
  const line = formatEntry(entry);
  if (used + line.length + 1 > chars) break;
  lines.push(line);
  used += line.length + 1;
}

const hidden = all.length - lines.length;
const tail = hidden > 0
  ? '\\n(' + hidden + ' older memories not shown - search with recall)'
  : '';`, { at: 0 }) + consoleBlock('what the prompt gets', `## What you remember from earlier runs
- [fact] npm test needs Node 20. _(2026-10-20)_
- [gotcha] .env must never be edited. _(2026-10-22)_
(7 older memories not shown - search src/memory.md with the recall tool)`, { at: 1 })),
      beats: [
        { at: 0, text: 'The digest takes the newest entries first, then stops at the character budget.' },
        { at: 4900, text: 'It counts what it left out and says so in the block.' },
        { at: 10800, text: 'The model knows recall exists instead of assuming the older memories are gone.' },
      ],
    },
    {
      kicker: 'Searching', navTitle: 'search and forget', duration: 13500,
      title: 'Newest first.<br><em>Every word must match.</em>',
      body: sceneBody(panel('src/memory.js', `search(query, { limit = 20 } = {}) {
  const words = normalise(query).toLowerCase().split(' ').filter(Boolean);
  const all = this.entries().reverse();
  const hits = words.length
    ? all.filter((e) => words.every((w) => e.text.toLowerCase().includes(w) || e.tag === w))
    : all;
  return hits.slice(0, Math.max(1, Number(limit) || 20));
}

forget(match) {
  const kept = entries.filter((e) => !e.text.toLowerCase().includes(needle));
  // ...save only if something was removed...
}`, { at: 0 }) + callout('“node version” is narrower than “node”. Search is intentionally simple and explainable.', { at: 1 })),
      beats: [
        { at: 0, text: 'Search reverses the file so the newest memories come first.' },
        { at: 4600, text: 'Every word in the query must appear in the text or match the tag.' },
        { at: 9700, text: 'Forget removes every entry containing a phrase. Both paths rewrite the same plain file.' },
      ],
    },
    {
      kicker: 'The honest limit', navTitle: 'Not a database', duration: 12500,
      title: 'No cache.<br><em>No hidden state.</em>',
      body: sceneBody(checklist([
        { icon: '📄', title: 'The file is the store', text: 'every method reads it fresh.' },
        { icon: '✍️', title: 'Hand edits count', text: 'the next call sees them immediately.' },
        { icon: '🧾', title: 'Diffable', text: 'a memory change is a normal markdown diff.' },
        { icon: '🚫', title: 'Not a database', text: 'no index, no query language, no background sync.' },
      ], { at: 0 }) + statement('The smallest format that survives a process is often a file you can read.', { at: 1 })),
      beats: [
        { at: 0, text: 'There is no cache and no index. The file is the truth.' },
        { at: 4400, text: 'If you edit or delete a line by hand, the next call sees it.' },
        { at: 9100, text: 'That is a feature: memory you can diff and review like any other file.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 11000,
      title: 'A small file with <em>two jobs</em>.',
      body: sceneBody(
        stats([['1', 'markdown file'], ['2', 'access paths'], ['4', 'tags']], { at: 0 })
        + rules([
          ['The file is the store.', 'No cache, no index, no drift.'],
          ['Digest eagerly.', 'A bounded slice before step 1.'],
          ['Recall lazily.', 'Search the whole file on demand.'],
          ['Bound the writes.', 'Dedupe, cap, drop the oldest.'],
        ], { at: 1 })
        + statement('Memory is not a database feature. It is a file the harness reads and the agent can add to.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'One markdown file, two access paths, four tags.' },
        { at: 4200, text: 'Read it fresh, digest a bounded slice, recall the rest, and bound every write.' },
        { at: 8300, text: 'That is how the agent remembers without losing control of the context window.' },
      ],
    },
  ],
};

const sandbox = {
  file: 'sandbox.js',
  name: 'The sandbox',
  lessonLabel: 'Lesson 09',
  sideSub: 'reads are open; save, edit and delete are fenced.',
  footerFacts: '3 actions · 1 gate · honest limits',
  h1: 'Reads are open. Writes are fenced.',
  lede: 'workspace.js answers whether a path stays inside the root. sandbox.js answers a narrower, louder question: may the agent change this file at all? Every mutation goes through one gate, and every refusal is a visible line.',
  meta: ['9 scenes', '3 mutating actions', '1 check gate', '0 silent writes'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'The fence', duration: 12500,
      title: 'Curiosity is allowed.<br><em>Mutation is not.</em>',
      body: sceneBody(twoCol(
        panel('src/sandbox.js', `export const ACTIONS = Object.freeze({
  SAVE: 'save',
  EDIT: 'edit',
  DELETE: 'delete',
});

// Every one of them goes through check().
// A refusal prints one loud FORBIDDEN line.`, { at: 0 }),
        grid([
          card({ at: 1, icon: '👀', title: 'Reads', body: 'Anywhere. A read that leaves the sandbox is a bad idea, not an incident.', accent: '#2f9eaa' }),
          card({ at: 1, icon: '✍️', title: 'Writes', body: 'Only inside the workspace. This is the incident boundary.', accent: '#c9633f' }),
        ], { cols: 1 }),
      ) + statement('The fence is around mutations, not curiosity. That is the whole design.', { at: 2 })),
      beats: [
        { at: 0, text: 'workspace.js resolves paths. sandbox.js decides which actions are allowed to mutate.' },
        { at: 4300, text: 'Reads can go anywhere, because an agent that cannot read docs or logs is useless.' },
        { at: 9300, text: 'Writes, edits and deletes are confined. That is where damage outlives the run.' },
      ],
    },
    {
      kicker: 'The contract', navTitle: 'Three actions', duration: 12000,
      title: 'Three actions.<br><em>One answer.</em>',
      body: sceneBody(grid([
        card({ at: 0, icon: '💾', title: 'save', tag: 'SAVE', body: 'Create or overwrite a file inside the root.' }),
        card({ at: 0, icon: '✏️', title: 'edit', tag: 'EDIT', body: 'Replace a snippet in an existing file.' }),
        card({ at: 0, icon: '🗑️', title: 'delete', tag: 'DELETE', body: 'Remove a file or an empty folder.' }),
      ], { cols: 3 }) + callout('The root itself is not a file. Deleting it would take the sandbox with it, so that is refused too.', { at: 1 })),
      beats: [
        { at: 0, text: 'The sandbox governs exactly three actions: save, edit and delete.' },
        { at: 4400, text: 'Reads are handled by workspace.js. These three are the mutations.' },
        { at: 9000, text: 'One gate answers all three, so “was this allowed?” has exactly one place to look.' },
      ],
    },
    {
      kicker: 'The gate', navTitle: 'check', duration: 14000,
      title: 'One gate.<br><em>Every write.</em>',
      body: sceneBody(panel('src/sandbox.js', `check(action, requested) {
  if (!ALLOWED.has(action)) {
    throw new TypeError('unknown sandbox action "' + action + '"');
  }

  let target;
  try {
    target = this.workspace.resolve(requested);
  } catch (err) {
    if (err instanceof PathError) this.forbid(action, requested, err.message);
    throw err;
  }

  if (action === ACTIONS.DELETE && target.rel === '.') {
    this.forbid(action, requested, 'the sandbox root itself cannot be deleted');
  }

  return target;
}`, { at: 0 }) + callout('The path policy lives in workspace.js. This module never re-implements it; it only decides which actions are sandboxed.', { at: 1 })),
      beats: [
        { at: 0, text: 'check is the single gate. It rejects unknown actions first.' },
        { at: 4500, text: 'Then it asks workspace.resolve to enforce containment.' },
        { at: 10000, text: 'A PathError becomes a loud refusal. Every successful write gets an absolute path and a relative label.' },
      ],
    },
    {
      kicker: 'Refusals', navTitle: 'ForbiddenError', duration: 13500,
      title: 'A refusal is a <em>line</em>, not a stack trace.',
      body: sceneBody(panel('src/sandbox.js', `forbid(action, requested, reason) {
  this.refusals += 1;
  this.log(ui.forbidden(action, requested, reason));
  throw new ForbiddenError(action, requested, reason);
}`, { at: 0 }) + consoleBlock('the console', `  ⛔ FORBIDDEN SAVE ../escape.txt - path escapes the workspace: ../escape.txt`, { at: 1 }) + callout('The error message has the same shape as the console line, so the model and the human read the same sentence.', { at: 2 })),
      beats: [
        { at: 0, text: 'A refusal prints one bold red line and throws a ForbiddenError.' },
        { at: 4600, text: 'The error carries the action, the requested path and the reason.' },
        { at: 9800, text: 'The model receives it as a tool result, not as a crash, and can try another path.' },
      ],
    },
    {
      kicker: 'Shell writes', navTitle: 'Best effort', duration: 14000,
      title: 'A command is not a way <em>round the fence</em>.',
      body: sceneBody(checklist([
        { icon: '>', title: 'Redirections', text: 'the destination after > or >>.' },
        { icon: '📋', title: 'Copy and move', text: 'the last positional destination.' },
        { icon: '🗑️', title: 'Delete commands', text: 'every positional operand.' },
        { icon: '🌐', title: 'Downloaders', text: 'the output flag for curl and wget.' },
        { icon: '🪟', title: 'PowerShell', text: 'Out-File, Set-Content, New-Item and friends.' },
      ], { at: 0 }) + callout('This reads the command line, not the code inside a script. It is best effort, and the module says so.', { at: 1 })),
      beats: [
        { at: 0, text: 'run_command is a real shell. Its obvious write targets are read from the command line.' },
        { at: 4500, text: 'Redirections, copy destinations, delete operands, downloader output flags and PowerShell cmdlets are checked.' },
        { at: 10000, text: 'This is not a shell sandbox. A script can still write anywhere; a container is the answer to that.' },
      ],
    },
    {
      kicker: 'Tokenizing', navTitle: 'tokenizeCommand', duration: 14000,
      title: 'Split the line <em>honestly</em>.',
      body: sceneBody(panel('src/sandbox.js', `for (let i = 0; i < text.length; i += 1) {
  const ch = text[i];
  if (quote) {
    if (ch === quote) quote = null;
    else current += ch;
    continue;
  }
  if (ch === '"' || ch === "'") { quote = ch; continue; }
  if (/\\s/.test(ch)) { flush(); continue; }
  if (ch === '>' || ch === '<' || ch === '|' || ch === '&' || ch === ';') {
    flush();
    // ...emit one or two-character operator...
  }
  current += ch;
}`, { at: 0 }) + callout('Quotes are removed so a path with spaces stays one word. Operators become their own tokens.', { at: 1 })),
      beats: [
        { at: 0, text: 'The tokenizer respects quotes and separates shell operators.' },
        { at: 4700, text: 'A quoted path with spaces remains one token, which is what the write check needs.' },
        { at: 10000, text: 'It is not a full shell parser. It is a small, honest attempt at the obvious cases.' },
      ],
    },
    {
      kicker: 'Write targets', navTitle: 'scanSegment', duration: 14500,
      title: 'Who writes, and <em>where</em>.',
      body: sceneBody(panel('src/sandbox.js', `if (ALL_POSITIONAL.has(verb)) {
  for (const target of positional) targets.push({ verb, target });
  return;
}
if (DEST_LAST.has(verb)) {
  if (positional.length >= 2) targets.push({ verb, target: positional[positional.length - 1] });
  return;
}
if (verb === 'robocopy') {
  if (positional.length >= 2) targets.push({ verb, target: positional[1] });
  return;
}`, { at: 0 }) + grid([
        card({ at: 1, icon: '📋', title: 'DEST_LAST', body: 'copy, cp, move, mv, xcopy, scp, rsync.' }),
        card({ at: 1, icon: '🗑️', title: 'ALL_POSITIONAL', body: 'del, rm, rmdir, mkdir, touch, tee.' }),
        card({ at: 1, icon: '🌐', title: 'OUTPUT_FLAG', body: 'curl -o, wget -O.' }),
      ], { cols: 3 })),
      beats: [
        { at: 0, text: 'The command name decides how to find its write targets.' },
        { at: 5000, text: 'For copy-like commands it is the last positional. For delete-like commands it is every positional.' },
        { at: 10800, text: 'Downloaders and PowerShell cmdlets get their own rules. The result is one list of paths to check.' },
      ],
    },
    {
      kicker: 'The limit', navTitle: 'Not a container', duration: 13000,
      title: 'Honest about what it <em>cannot</em> stop.',
      body: sceneBody(checklist([
        { icon: '✅', title: 'Catches', text: 'the obvious write targets named on the command line.' },
        { icon: '🚫', title: 'Does not catch', text: 'node -e, a downloaded script, or a program that writes internally.' },
        { icon: '📦', title: 'Real answer', text: 'a container or OS-level sandbox.' },
      ], { at: 0 }) + statement('A guard that pretends to be complete is worse than a guard that names its limits.', { at: 1 })),
      beats: [
        { at: 0, text: 'The shell check is best effort, not a sandbox for the shell.' },
        { at: 4500, text: 'A script can still call fs.copyFileSync or download another program.' },
        { at: 9300, text: 'The module says so plainly. A container is the answer when the threat model needs one.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 11000,
      title: 'One gate. <em>Loud refusals.</em>',
      body: sceneBody(
        stats([['3', 'mutating actions'], ['1', 'check gate'], ['0', 'silent writes']], { at: 0 })
        + rules([
          ['Reads are open.', 'Curiosity is not the incident.'],
          ['Writes are fenced.', 'Save, edit and delete go through check().'],
          ['Refuse loudly.', 'A FORBIDDEN line reaches the model and the human.'],
          ['Name the limits.', 'The shell check is best effort, not a container.'],
        ], { at: 1 })
        + statement('A sandbox is not a folder. It is one gate that every mutation must pass.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'Three mutating actions, one gate, no silent writes.' },
        { at: 4200, text: 'Reads stay open, writes go through check, and refusals are loud and explainable.' },
        { at: 8300, text: 'That is the difference between a workspace and a sandbox.' },
      ],
    },
  ],
};

const tools = {
  file: 'tools.js',
  name: 'The tools',
  lessonLabel: 'Lesson 10',
  sideSub: 'eight handlers, one dispatcher, and a command policy.',
  footerFacts: '8 tools · 1 dispatcher · 8 deny patterns',
  h1: 'Eight tools and one dispatcher',
  lede: 'Tools are how the model acts on the world. tools.js defines the schemas the model sees, validates what comes back, dispatches to a handler, and returns a string for the model to read. Every error is an observation, never a crash.',
  meta: ['9 scenes', '8 tools', '8 hard-deny patterns', '6000-char output cap'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'Eight tools', duration: 12500,
      title: 'The model has <em>eight ways to act</em>.',
      body: sceneBody(grid([
        card({ at: 0, icon: '📁', title: 'list_files', body: 'Walk a folder tree.' }),
        card({ at: 0, icon: '📖', title: 'read_file', body: 'Read with line numbers.' }),
        card({ at: 0, icon: '➕', title: 'create_file', body: 'Create a new file.' }),
        card({ at: 0, icon: '💾', title: 'write_file', body: 'Create or overwrite.' }),
        card({ at: 0, icon: '✏️', title: 'edit_file', body: 'Replace one exact snippet.' }),
        card({ at: 0, icon: '▶️', title: 'run_command', body: 'Run a real shell command.' }),
        card({ at: 1, icon: '🧠', title: 'remember', body: 'Save a durable note.' }),
        card({ at: 1, icon: '🔎', title: 'recall', body: 'Search earlier memories.' }),
      ], { cols: 4 }) + callout('Six tools change the workspace. Two change what the next process knows about it.', { at: 2 })),
      beats: [
        { at: 0, text: 'The model sees eight tools. Six act on files and commands; two act on memory.' },
        { at: 4500, text: 'The last two are special: remember and recall are the only effects that outlive the run.' },
        { at: 9600, text: 'Everything the model can do is described here, in the schemas it receives.' },
      ],
    },
    {
      kicker: 'Schemas', navTitle: 'Prompt text', duration: 13500,
      title: 'Tool descriptions are <em>prompt text</em>.',
      body: sceneBody(panel('src/tools.js', `export const TOOL_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'edit_file',
      description: 'Replace one exact snippet in an existing file. old_string must appear exactly once unless replace_all is true.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relative to the workspace root' },
          old_string: { type: 'string', description: 'Exact text to replace, including indentation' },
          new_string: { type: 'string', description: 'Replacement text' },
          replace_all: { type: 'boolean', description: 'Replace every occurrence. Default false' },
        },
        required: ['path', 'old_string', 'new_string'],
        additionalProperties: false,
      },
    },
  },
];`, { at: 0 }) + callout('The model chooses tools from these words. A vague description is a bad tool, no matter how good the handler is.', { at: 1 })),
      beats: [
        { at: 0, text: 'The schemas are not just validation. They are the model&#39;s instruction manual.' },
        { at: 4700, text: 'Each description says when to use the tool and what an argument means.' },
        { at: 10000, text: 'That is why the descriptions are carefully written. They are prompt text.' },
      ],
    },
    {
      kicker: 'Validation', navTitle: 'Before dispatch', duration: 13500,
      title: 'Parse arguments before you <em>trust them</em>.',
      body: sceneBody(panel('src/tools.js', `function validate(name, raw) {
  const spec = PARAMS[name];
  let args;
  try {
    args = typeof raw === 'string' ? (raw.trim() ? JSON.parse(raw) : {}) : (raw ?? {});
  } catch (err) {
    return { error: 'ERROR: could not parse arguments for ' + name + ': ' + err.message };
  }
  if (args === null || typeof args !== 'object' || Array.isArray(args)) {
    return { error: 'ERROR: arguments for ' + name + ' must be a JSON object' };
  }
  for (const [key, type] of Object.entries(spec)) {
    // ...check the declared type...
  }
  return { args };
}`, { at: 0 }) + checklist([
        { icon: '🧾', title: 'JSON first', text: 'a provider may send arguments as a string.' },
        { icon: '📦', title: 'Object only', text: 'arrays and null are rejected.' },
        { icon: '🔤', title: 'Type check', text: 'every declared parameter is checked.' },
      ], { at: 1 })),
      beats: [
        { at: 0, text: 'A raw tool call may contain a JSON string, an object, or nonsense.' },
        { at: 4500, text: 'validate parses the string, requires an object, and checks the declared types.' },
        { at: 9700, text: 'Bad arguments become an ERROR string. The handler is never called with them.' },
      ],
    },
    {
      kicker: 'Handlers', navTitle: 'The handlers', duration: 14000,
      title: 'Handlers return <em>strings</em>.',
      body: sceneBody(panel('src/tools.js', `const HANDLERS = {
  list_files(ws, args) { /* ... */ },
  read_file(ws, args) { /* ... */ },
  create_file(ws, args, ctx) { /* sandbox.check(SAVE) */ },
  write_file(ws, args, ctx) { /* sandbox.check(SAVE) */ },
  edit_file(ws, args, ctx) { /* sandbox.check(EDIT) */ },
  async run_command(ws, args, ctx) { /* policy + shell */ },
  remember(ws, args, ctx) { /* ctx.memory */ },
  recall(ws, args, ctx) { /* ctx.memory */ },
};`, { at: 0 }) + callout('The return value is exactly what the model reads back. There is no separate result object to interpret.', { at: 1 })),
      beats: [
        { at: 0, text: 'Each handler receives the workspace, validated arguments, and the run context.' },
        { at: 4400, text: 'Read tools use the workspace. Write tools use the sandbox. Memory tools use the memory store.' },
        { at: 9400, text: 'Every handler returns a string. That string goes straight into a tool message.' },
      ],
    },
    {
      kicker: 'Command policy', navTitle: 'run_command', duration: 15000,
      title: 'Commands have their <em>own guards</em>.',
      body: sceneBody(panel('src/tools.js', `const HARD_DENY = [
  { re: /\\brm\\s+(-[a-z]*\\s+)?-[a-z]*r[a-z]*f?\\s+/, why: 'recursive delete of a root path' },
  { re: /\\bdel\\s+\\/[a-z]*[sq]/i, why: 'recursive/quiet Windows delete' },
  { re: /\\b(format|diskpart)\\b/i, why: 'disk formatting' },
  { re: /git\\s+push\\s+(--force|-f)\\b/i, why: 'force push' },
  { re: /\\b(curl|wget)\\b[^|]*\\|\\s*(ba)?sh/i, why: 'piping the internet into a shell' },
  { re: />\\s*\\/dev\\/sd/i, why: 'raw disk write' },
];`, { at: 0 }) + grid([
        card({ at: 1, icon: '⛔', title: 'Hard deny', body: 'refused before the policy or the prompt.' }),
        card({ at: 1, icon: '🙋', title: 'Ask', body: 'the y/N confirm callback decides.' }),
        card({ at: 2, icon: '🔒', title: 'Safe env', body: 'a short allow-list, never process.env.' }),
        card({ at: 2, icon: '✂️', title: 'Bounds', body: '6,000-char output cap and a 30s timeout.' }),
      ], { cols: 2 })),
      beats: [
        { at: 0, text: 'run_command is not a normal tool. It starts with a hard-deny list.' },
        { at: 4900, text: 'Recursive deletes, disk formatting, force pushes and piping the internet into a shell are refused outright.' },
        { at: 10700, text: 'Then policy decides: allow, ask, or deny. The child process gets a short env allow-list, not your key.' },
      ],
    },
    {
      kicker: 'Write tools', navTitle: 'Through the sandbox', duration: 13000,
      title: 'Every mutation takes the <em>same gate</em>.',
      body: sceneBody(panel('src/tools.js', `create_file(ws, args, ctx) {
  const sandbox = sandboxFor(ctx);
  const target = sandbox.check(ACTIONS.SAVE, args.path);
  if (fs.existsSync(target.abs)) {
    return 'ERROR: ' + target.rel + ' already exists - use edit_file or write_file';
  }
  const { bytes } = sandbox.write(target, args.content);
  return 'created ' + target.rel + ' (' + bytes + ' bytes)';
}`, { at: 0 }) + callout('create_file, write_file and edit_file all call sandbox.check before touching disk. There is no second path.', { at: 1 }) + statement('A tool is a capability. The sandbox is the permission check in front of it.', { at: 2 })),
      beats: [
        { at: 0, text: 'create_file asks the sandbox for a SAVE target before it checks whether the file exists.' },
        { at: 4700, text: 'The same gate covers write_file and edit_file. There is no bypass.' },
        { at: 9800, text: 'A refusal comes back as a FORBIDDEN string, and the model can choose another path.' },
      ],
    },
    {
      kicker: 'Dispatch', navTitle: 'runTool', duration: 14000,
      title: 'The dispatcher never <em>throws</em>.',
      body: sceneBody(panel('src/tools.js', `export async function runTool(name, rawArgs, ctx) {
  if (!HANDLERS[name]) {
    return 'ERROR: unknown tool "' + name + '". Available: ' + Object.keys(HANDLERS).join(', ');
  }
  const { args, error } = validate(name, rawArgs);
  if (error) return error;

  try {
    return await HANDLERS[name](ctx.workspace, args, ctx);
  } catch (err) {
    if (err instanceof ForbiddenError) return 'FORBIDDEN: ' + err.message;
    if (err instanceof PathError) return 'ERROR: ' + err.message;
    return 'ERROR: ' + (err.code ?? 'failed') + ': ' + err.message;
  }
}`, { at: 0 }) + callout('Every failure becomes an observation. The loop can always append a tool message and try another step.', { at: 1 })),
      beats: [
        { at: 0, text: 'runTool is the dispatcher. Unknown tools get an error string listing what exists.' },
        { at: 4700, text: 'Validation errors return immediately. Handler errors are caught and turned into observations.' },
        { at: 10000, text: 'The loop never has to catch a tool exception to keep its own invariants.' },
      ],
    },
    {
      kicker: 'The bounds', navTitle: 'Limits', duration: 12500,
      title: 'Every capability has a <em>bound</em>.',
      body: sceneBody(kvList([
        ['maxOutput', '6,000 characters per command result.'],
        ['timeoutMs', '30,000 ms per command.'],
        ['denyPatterns', '8 hard-deny command patterns.'],
        ['envKeys', '13 environment keys passed to the child.'],
        ['memory caps', 'maxEntries, maxEntryChars, promptChars.'],
      ], { at: 0 }) + callout('Unbounded tools are unbounded risk. The limits are part of the tool design, not an afterthought.', { at: 1 })),
      beats: [
        { at: 0, text: 'Output, time, command patterns, environment and memory all have explicit bounds.' },
        { at: 4400, text: 'The same bounded-autonomy argument applies to tools as to the step budget.' },
        { at: 8800, text: 'A capability without a bound is not a design. It is a future incident.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 11500,
      title: 'Eight capabilities. <em>One dispatcher.</em>',
      body: sceneBody(
        stats([['8', 'tools'], ['1', 'dispatcher'], ['8', 'deny patterns']], { at: 0 })
        + rules([
          ['Schemas are prompt text.', 'Write them for the model, not only for validation.'],
          ['Validate first.', 'Never call a handler with untrusted arguments.'],
          ['Mutations use the sandbox.', 'One gate, no bypass.'],
          ['Errors are observations.', 'runTool returns strings, never throws.'],
        ], { at: 1 })
        + statement('Tools are the model&#39;s hands. The dispatcher is what keeps those hands accountable.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'Eight tools, one dispatcher, eight hard-deny patterns.' },
        { at: 4200, text: 'Schemas guide the model, validation protects handlers, and the sandbox guards mutations.' },
        { at: 8400, text: 'Every error becomes a string the model can learn from.' },
      ],
    },
  ],
};

const ui = {
  file: 'ui.js',
  name: 'The console',
  lessonLabel: 'Lesson 11',
  sideSub: 'every colour, every line type, and the palette in one place.',
  footerFacts: '1 palette · 0 stdout writes',
  h1: 'Colour lives in one file',
  lede: 'The rest of the program describes what happened; ui.js decides how it looks. Every helper returns a string and nothing here writes to stdout, so the loop can still be tested with an injected logger.',
  meta: ['8 scenes', 'one palette', 'zero stdout writes', 'NO_COLOR aware'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'One palette', duration: 12500,
      title: 'One palette.<br><em>Every console line.</em>',
      body: sceneBody(twoCol(
        panel('src/ui.js', `import chalk from 'chalk';

export const ui = {
  title: (text) => chalk.bold.cyan(text),
  step: (step, max) => chalk.blue('── step ' + step + '/' + max + ' ──'),
  tool: (name, args) => chalk.white('tool →') + ' ' + chalk.yellow(name) + ' ' + chalk.white(args),
  result: (text) => { /* ... */ },
  error: (text) => chalk.red(text),
};`, { at: 0 }),
        grid([
          card({ at: 1, icon: '🎨', title: 'Colour here', body: 'No other file imports chalk.' }),
          card({ at: 1, icon: '🧾', title: 'Strings only', body: 'Every helper returns text.' }),
          card({ at: 1, icon: '🧪', title: 'Testable', body: 'No stdout writes inside the loop.' }),
        ], { cols: 1 }),
      ) + statement('The loop narrates itself through these functions. It never knows a colour name.', { at: 2 })),
      beats: [
        { at: 0, text: 'ui.js is the only file that imports chalk.' },
        { at: 4300, text: 'Every helper returns a string, so the loop can log through any injected function.' },
        { at: 9400, text: 'The whole palette can change here without touching agent.js.' },
      ],
    },
    {
      kicker: 'The contract', navTitle: 'Strings only', duration: 13000,
      title: 'Return text.<br><em>Never write it.</em>',
      body: sceneBody(panel('src/ui.js', `// Every helper returns a STRING and nothing here writes to stdout,
// which is why runTask can still take an injected log in the tests.
export const ui = {
  step: (step, max, width = 40) => chalk.blue('── step ' + step + '/' + max + ' ' + '─'.repeat(width)),
  think: (text) => chalk.cyan('think:') + ' ' + text,
  tool: (name, args) => chalk.white('tool →') + ' ' + chalk.yellow(name) + ' ' + chalk.white(args),
  error: (text) => chalk.red(text),
};`, { at: 0 }) + callout('A function that returns a string can be tested, captured, piped or suppressed without changing the loop.', { at: 1 })),
      beats: [
        { at: 0, text: 'The contract is simple: every helper returns a string and nothing here prints.' },
        { at: 4500, text: 'That is why runTask can accept a custom log function and the tests can capture every line.' },
        { at: 9600, text: 'Styling and I/O stay separate. The loop owns the narration, this file owns the paint.' },
      ],
    },
    {
      kicker: 'The line types', navTitle: 'Visual language', duration: 14000,
      title: 'The agent has a <em>visual language</em>.',
      body: sceneBody(consoleBlock('one step', `── step 1/12 ────────────────────────────
think: Looking first: what is in the workspace.
tool → list_files {"path":"."}
result ← . 2 file(s)
  🛠️  [HOOK:PreToolUse] before every tool call - list_files {"path":"."}
  ⛔ FORBIDDEN SAVE ../escape.txt - path escapes the workspace`, { at: 0 }) + grid([
        card({ at: 1, icon: '🧠', title: 'think', body: 'The model&#39;s narration.' }),
        card({ at: 1, icon: '🛠️', title: 'tool', body: 'The name and raw arguments.' }),
        card({ at: 1, icon: '📦', title: 'result', body: 'The first line of the observation.' }),
        card({ at: 2, icon: '⛔', title: 'FORBIDDEN', body: 'A refusal that must be impossible to miss.' }),
      ], { cols: 4 })),
      beats: [
        { at: 0, text: 'The console has a small vocabulary: step, think, tool, result, hook and refusal.' },
        { at: 4900, text: 'Each line type has one colour and one job. The room can follow the run by shape alone.' },
        { at: 10300, text: 'A refusal is bold red capitals, because it has to be findable from the back of a room.' },
      ],
    },
    {
      kicker: 'Results', navTitle: 'result()', duration: 14500,
      title: 'A result explains <em>itself</em>.',
      body: sceneBody(panel('src/ui.js', `result: (text) => {
  const line = firstLine(text);

  if (!isFailure(line)) {
    const out = firstStdout(text);
    const detail = out ? '\\n↳ stdout: ' + out : '';
    return chalk.green('result ←') + ' ' + chalk.white(line) + detail;
  }

  const code = failedExitCode(line);
  const detail = code === null ? '' : '\\n↳ exit ' + code + ': ' + explainExit(code);
  return chalk.red('result ← ' + line) + detail;
}`, { at: 0 }) + consoleBlock('success and failure', `result ← exit code 0
         ↳ stdout: Hello from a tiny agent
result ← exit code 1
         ↳ exit 1: general failure - the command ran and then reported an error...`, { at: 1 })),
      beats: [
        { at: 0, text: 'A successful command shows its first stdout line, so exit code 0 is not a claim you have to trust.' },
        { at: 4800, text: 'A failure shows the meaning of the exit code, not just the number.' },
        { at: 10400, text: 'The result line is the model&#39;s observation and the human&#39;s explanation in one place.' },
      ],
    },
    {
      kicker: 'Refusals', navTitle: 'forbidden()', duration: 12500,
      title: 'Make the refusal <em>impossible to miss</em>.',
      body: sceneBody(panel('src/ui.js', `forbidden: (action, requested, reason = '') => {
  const head = chalk.bold.red('FORBIDDEN') + ' ' + chalk.bold.white(String(action).toUpperCase());
  const why = reason ? ' ' + chalk.dim('- ' + reason) : '';
  return '  ⛔ ' + head + ' ' + chalk.red(String(requested)) + why;
}`, { at: 0 }) + consoleBlock('the line', `  ⛔ FORBIDDEN SAVE ../escape.txt - path escapes the workspace: ../escape.txt`, { at: 1 }) + callout('Same stream as the hook trace. On stage the refusal is part of the narration, not an exception that scrolled past.', { at: 2 })),
      beats: [
        { at: 0, text: 'forbidden is deliberately loud: bold red capitals, an icon, the action, the path and the reason.' },
        { at: 4500, text: 'It goes to the same console stream as every other line.' },
        { at: 9200, text: 'A refusal should be greppable in a log and visible from the back of a room.' },
      ],
    },
    {
      kicker: 'The hook palette', navTitle: 'Hook lines', duration: 14500,
      title: 'Hooks get their own <em>colour vocabulary</em>.',
      body: sceneBody(panel('src/ui.js', `hookTitle: (label) => chalk.bold.cyan('── ' + label + ' ──'),
hookLine: (icon, name, colour = 'cyan', when = '', live = '') => {
  const paint = chalk[colour] ?? chalk.cyan;
  return '  ' + icon + '  ' + paint.bold(name.padEnd(16)) + ' ' + chalk.white(when) + live;
},
hookField: (label, value, colour = 'cyan') => {
  const paint = chalk[colour] ?? chalk.cyan;
  return '      ' + chalk.dim(label.padEnd(9)) + ' ' + paint(value);
},
hookTrace: (icon, name, colour = 'cyan', explanation = '', detail = '') => {
  const paint = chalk[colour] ?? chalk.cyan;
  return '  ' + icon + '  ' + paint.bold('[HOOK:' + name + ']') + ' ' + chalk.white(explanation) + ' ' + chalk.dim('- ' + detail);
}`, { at: 0 }) + consoleBlock('a hook firing', `  🛠️  [HOOK:PreToolUse] before every tool call - run_command {"command":"ls"}`, { at: 1 })),
      beats: [
        { at: 0, text: 'The hook catalogue and the live trace are also styled here.' },
        { at: 5200, text: 'A colour name is passed as data, so hooks.js can stay a plain event table.' },
        { at: 10800, text: 'An unknown colour falls back rather than throwing, which keeps the palette testable.' },
      ],
    },
    {
      kicker: 'Colour level', navTitle: 'TTY and NO_COLOR', duration: 13000,
      title: 'The environment decides <em>how much colour</em>.',
      body: sceneBody(checklist([
        { icon: '🖥️', title: 'TTY', text: 'chalk enables colour when output is a terminal.' },
        { icon: '🚫', title: 'NO_COLOR', text: 'disables colour for accessible, plain logs.' },
        { icon: '💪', title: 'FORCE_COLOR', text: 'forces colour when you need it.' },
        { icon: '📄', title: 'Piping', text: 'a log file gets clean text automatically.' },
      ], { at: 0 }) + statement('The program does not decide whether colour is appropriate. The environment does.', { at: 1 })),
      beats: [
        { at: 0, text: 'chalk handles TTY detection and the NO_COLOR / FORCE_COLOR conventions.' },
        { at: 4400, text: 'ui.js inherits that instead of reimplementing it.' },
        { at: 9000, text: 'Piping a run into a log file gives clean text for free.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 10500,
      title: 'One file owns the <em>paint</em>.',
      body: sceneBody(
        stats([['1', 'palette'], ['0', 'stdout writes'], ['3', 'colour env rules']], { at: 0 })
        + rules([
          ['Return strings.', 'Never write from a formatter.'],
          ['One visual language.', 'Step, think, tool, result, hook, refusal.'],
          ['Explain failures.', 'Exit codes get meanings.'],
          ['Let the environment decide.', 'TTY, NO_COLOR and FORCE_COLOR are honoured.'],
        ], { at: 1 })
        + statement('Moving every colour into one file is what lets the loop stay about the loop.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'One palette, no stdout writes, and the environment decides colour level.' },
        { at: 4200, text: 'Return strings, keep one visual language, explain failures, and let the terminal decide.' },
        { at: 8300, text: 'That is why ui.js is small and why the rest of the code is readable.' },
      ],
    },
  ],
};

const workspace = {
  file: 'workspace.js',
  name: 'The workspace',
  lessonLabel: 'Lesson 12',
  sideSub: 'the path policy: resolve writes, allow reads, resist symlinks.',
  footerFacts: '2 resolve paths · 1 containment rule',
  h1: 'The path policy lives here',
  lede: 'Every file path is resolved before the filesystem is touched. Write paths must stay inside the workspace. Read paths may leave it. The difference is the whole security story of this module.',
  meta: ['8 scenes', '2 resolve paths', '1 containment rule', 'symlink-aware'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'The policy', duration: 12500,
      title: 'Resolve the path.<br><em>Then touch the disk.</em>',
      body: sceneBody(twoCol(
        panel('src/workspace.js', `export class Workspace {
  constructor(root) {
    const abs = path.resolve(root);
    fs.mkdirSync(abs, { recursive: true });
    this.root = fs.realpathSync(abs);
  }

  resolve(requested) { /* writes: must stay inside */ }
  resolveRead(requested) { /* reads: may leave */ }
}`, { at: 0 }),
        grid([
          card({ at: 1, icon: '✍️', title: 'resolve()', body: 'Writes. Containment required.', accent: '#c9633f' }),
          card({ at: 1, icon: '📖', title: 'resolveRead()', body: 'Reads. Open by design.', accent: '#2f9eaa' }),
        ], { cols: 1 }),
      ) + statement('The fence is around mutations, not curiosity. workspace.js is the path policy behind that sentence.', { at: 2 })),
      beats: [
        { at: 0, text: 'Every path is resolved by this class before the filesystem is touched.' },
        { at: 4300, text: 'There are two entry points: one for writes, one for reads.' },
        { at: 9300, text: 'The constructor also resolves the real root, so the rest of the program shares one canonical location.' },
      ],
    },
    {
      kicker: 'Two paths', navTitle: 'Write vs read', duration: 13500,
      title: 'Write inside.<br><em>Read anywhere.</em>',
      body: sceneBody(checklist([
        { icon: '✍️', title: 'resolve()', text: 'expands variables, rejects escapes, and realpaths the target.' },
        { icon: '📖', title: 'resolveRead()', text: 'allows absolute paths and returns a relative label that may start with ..' },
        { icon: '🧭', title: 'Shared rule', text: 'relative paths start at the workspace root.' },
      ], { at: 0 }) + panel('src/workspace.js', `resolveRead(requested) {
  const raw = requested.trim();
  const expanded = expandVars(raw);
  const abs = path.isAbsolute(expanded)
    ? path.resolve(expanded)
    : path.resolve(this.root, expanded);
  const real = realResolve(abs);
  const rel = path.relative(this.root, real) || '.';
  return { abs: real, rel: rel.split(path.sep).join('/') };
}`, { at: 1 })),
      beats: [
        { at: 0, text: 'Writes must stay inside the workspace. Reads are deliberately open.' },
        { at: 4800, text: 'Both paths expand environment variables and resolve relative paths against the root.' },
        { at: 10000, text: 'Reads return a relative label that may start with .., which is how the console can show an outside path.' },
      ],
    },
    {
      kicker: 'Write checks', navTitle: 'Containment', duration: 15000,
      title: 'The obvious escapes are <em>named</em>.',
      body: sceneBody(checklist([
        { icon: '💽', title: 'Drive paths', text: 'C:\\... is outside the workspace.' },
        { icon: '🖧', title: 'UNC paths', text: '\\\\server\\share is outside.' },
        { icon: '📁', title: 'Absolute paths', text: 'refused for writes.' },
        { icon: '🏠', title: 'Home/system prefixes', text: '~, $HOME, %USERPROFILE%, Desktop, Windows...' },
        { icon: '🔗', title: 'Symlinks', text: 'realpath resolves the deepest existing ancestor.' },
      ], { at: 0 }) + panel('src/workspace.js', `if (/^[A-Za-z]:/.test(raw)) throw new PathError('absolute or drive-relative path is outside the workspace');
if (/^(\\\\\\\\|\\/\\/)/.test(raw)) throw new PathError('UNC path is outside the workspace');
if (path.isAbsolute(expanded)) throw new PathError('absolute path is outside the workspace');

const first = raw.split(/[\\\\/]/)[0].toLowerCase().replace(/:$/, '');
if (/^[~$%]/.test(first) && first !== raw) throw new PathError('home/environment path is outside the workspace');
if (HOME_AND_SYSTEM.has(first)) throw new PathError('"' + first + '" looks like a home/system folder');`, { at: 1 })),
      beats: [
        { at: 0, text: 'A write path is checked for drive letters, UNC paths and absolute paths first.' },
        { at: 5300, text: 'Then home and system-looking first segments are refused, because Windows may quietly resolve them inside the workspace.' },
        { at: 11200, text: 'Only then does the path get joined to the root and realpath-checked.' },
      ],
    },
    {
      kicker: 'Expansion', navTitle: 'expandVars', duration: 12500,
      title: 'Expand variables <em>before</em> trusting a path.',
      body: sceneBody(panel('src/workspace.js', `function expandVars(p) {
  let out = p;
  if (out.startsWith('~')) out = path.join(os.homedir(), out.slice(1));
  out = out.replace(/%([^%]+)%/g, (m, name) => process.env[name] ?? m);
  out = out.replace(/\\$\\{?([A-Za-z_][A-Za-z0-9_]*)\\}?/g, (m, name) => process.env[name] ?? m);
  return out;
}`, { at: 0 }) + callout('The expansion is what makes ~/notes.txt a home path, not a workspace file called ~. The write check sees the real target.', { at: 1 })),
      beats: [
        { at: 0, text: 'expandVars turns ~, %NAME% and $NAME into the paths the operating system would use.' },
        { at: 4500, text: 'That matters because a literal ~ may look harmless until the OS resolves it.' },
        { at: 9200, text: 'Expansion happens before containment, so the check sees the real target.' },
      ],
    },
    {
      kicker: 'Symlinks', navTitle: 'realResolve', duration: 14500,
      title: 'A symlink must not <em>smuggle</em> a write out.',
      body: sceneBody(panel('src/workspace.js', `function realResolve(abs) {
  let cur = abs;
  const rest = [];
  while (!fs.existsSync(cur)) {
    const parent = path.dirname(cur);
    if (parent === cur) return abs;
    rest.unshift(path.basename(cur));
    cur = parent;
  }
  return path.join(fs.realpathSync(cur), ...rest);
}`, { at: 0 }) + callout('A path that does not exist yet cannot be realpathed as a whole. This resolves the deepest existing ancestor, then appends the remainder.', { at: 1 }) + consoleBlock('the idea', `workspace/link -> C:\\Users\\me\\
workspace/link/notes.txt  ->  C:\\Users\\me\\notes.txt  ->  outside`, { at: 2 })),
      beats: [
        { at: 0, text: 'Checking strings is not enough. A symlink or junction can point outside the root.' },
        { at: 5000, text: 'realResolve finds the deepest part of the path that already exists and realpaths that.' },
        { at: 10900, text: 'The remainder is appended, so a not-yet-created file under a symlinked folder is still judged by its real location.' },
      ],
    },
    {
      kicker: 'Containment', navTitle: 'isInside', duration: 12000,
      title: 'One containment rule.<br><em>No prefix tricks.</em>',
      body: sceneBody(panel('src/workspace.js', `function isInside(root, target) {
  const rel = path.relative(root, target);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}`, { at: 0 }) + callout('A string prefix check would accept workspace-evil for a workspace root. path.relative does not.', { at: 1 }) + statement('Containment is a relationship between resolved paths, not a substring match.', { at: 2 })),
      beats: [
        { at: 0, text: 'isInside uses path.relative, not startsWith.' },
        { at: 4400, text: 'The relative path must not begin with .. and must not be absolute.' },
        { at: 9200, text: 'That one rule avoids the classic workspace-evil prefix bug.' },
      ],
    },
    {
      kicker: 'Reads', navTitle: 'Open by design', duration: 12500,
      title: 'A read outside is a <em>bad idea</em>, not an incident.',
      body: sceneBody(checklist([
        { icon: '📚', title: 'Docs and logs', text: 'an agent that cannot read them is useless.' },
        { icon: '🌍', title: 'Absolute paths', text: 'reads may leave the workspace.' },
        { icon: '🧾', title: 'Bounded damage', text: 'a read can only put text into the context window.' },
        { icon: '🔒', title: 'Writes stay fenced', text: 'the mutation boundary is unchanged.' },
      ], { at: 0 }) + statement('The sandbox is around changes, not curiosity.', { at: 1 })),
      beats: [
        { at: 0, text: 'Reads are not fenced. The agent may need the docs, a library or a log outside its folder.' },
        { at: 4400, text: 'The damage a read can do is bounded by what enters the context window.' },
        { at: 9000, text: 'Writes remain the line. That asymmetry is the design.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 11000,
      title: 'A small class with a <em>large job</em>.',
      body: sceneBody(
        stats([['2', 'resolve paths'], ['1', 'containment rule'], ['0', 'raw path writes']], { at: 0 })
        + rules([
          ['Resolve first.', 'No filesystem call before the path policy.'],
          ['Writes stay inside.', 'Drive, UNC, absolute and home paths are refused.'],
          ['Realpath deeply.', 'Symlinks do not get to smuggle a write.'],
          ['Reads stay open.', 'The fence is around mutation.'],
        ], { at: 1 })
        + statement('A workspace is not a folder. It is a folder plus a policy for every path that touches it.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'Two resolve paths, one containment rule, no raw path writes.' },
        { at: 4200, text: 'Resolve first, keep writes inside, realpath the ancestors, and leave reads open.' },
        { at: 8300, text: 'That is the path policy behind the sandbox.' },
      ],
    },
  ],
};

export default [memory, sandbox, tools, ui, workspace];
