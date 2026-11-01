# MD explainer design contract

This is the file-shape and prose contract for every `*.md` explainer. It is written against the `build_explainer.py` renderer used by `mini-coding-agent-js`, because that renderer defines the strictest subset. Companion and free documents relax the header and numbering rules, not the writing rules.

## 1. Profiles at a glance

| Rule | `build` | `companion` | `free` |
|---|---|---|---|
| Eyebrow (`*...*`) | optional | optional | optional |
| H1 title | required, one | required, one | required, one |
| Lede paragraph | required | required | required |
| Meta strip | required, 3+ items | optional | optional |
| Chapter format | `## 01 Title` | `## 00 · Title` | any consistent hierarchy |
| Numbering | `01`..`NN`, no gaps | `00`..`NN`, no gaps | none required |
| Captions on fences | required | required | required (warned, not fatal) |
| Colophon after `---` | required | optional | optional |
| Minimum chapters | 6 | 6 | 4 |

## 2. Header block

```markdown
<!-- Source of truth for <name>. Render with: python build_explainer.py
     Do not edit the generated HTML or PDF. -->

*Explainer · the loop, the tools, the sandbox, the hooks*

# How a coding agent actually works

One paragraph that says what the program is, why it exists, and what the reader will be able to explain afterwards. Plain prose, no code on the first line.

`src/agent.js 215` · `src/prompt.js 81` · `src/tools.js 432`
```

- The leading HTML comment is stripped by the renderer. Put rebuild instructions there.
- The eyebrow is rendered above the title only if the line is **entirely** italic (`*text*`).
- The lede is every non-blank line between the H1 and the first line starting with a backtick, joined into one paragraph. Do not put a second paragraph there; it becomes part of the lede.
- The meta strip is a single line of backticked items joined by ` · `. The renderer splits on ` · ` and strips the backticks. Standard form: `path lines`.
- The meta strip is the last header element. Anything else is chapter content.

## 3. Chapters

Build profile:

```markdown
## 01 What an agent actually is

Chapter body.

### One beat

More body.
```

- The H2 separator is `##`, the number is exactly two digits, then a space, then the title.
- The renderer maps chapter numbers to a fixed id list (`what`, `shape`, `loop`, ...). If you add, remove or reorder chapters, update that list in the renderer, or accept slug fallbacks for the overflow.
- Unnumbered H2s inside the body are legal Markdown but become untitled sections in the TOC. Avoid them in build and companion profiles.
- H3 subheads become plain `<h3>` and do not enter the TOC. Use them for beats.
- Never skip a level: no H3 before the first H2, no H4 without an H3.

Companion profile uses `## 00 · Title`, starting at `00`. The separator is the middle dot with spaces.

Free profile may use `# Part I — ...`, `## 1. Title`, `### 4.2 Title`. Keep the hierarchy consistent and sequential within a part. A free document may carry more than one H1 (a build-style prompt often does); the validator warns and recommends H2 rather than failing the file.

## 4. Block vocabulary

These are the only blocks the build renderer understands. Anything else degrades.

### Paragraph

One or more non-blank lines, joined with spaces. Hard-wrapped prose is fine. A line that starts with `-`, `*`, `>`, `|`, `#` or a fence opens a different block, so do not start a prose line with those characters.

### Code fence with caption

```markdown
**what this excerpt is** · *javascript*

```javascript
const reply = await chatFn({ messages, tools });
```
```

- The caption is `**label** · *lang*`, on the line immediately above the fence. Blank lines between them are tolerated by the renderer, but keep them adjacent.
- The fence language should equal the caption language. Canonical pairs: `javascript`, `json`, `text` (diagrams and pseudocode), `stdout`, `console`, `bash`, `markdown`.
- `text` fences render as diagram blocks without a language badge; every other language shows the badge.
- A fence without a caption still renders, but it is a defect in a lesson: the reader cannot tell stdout from source.
- Keep excerpts short enough to read on one screen. If an excerpt exceeds ~40 lines, trim it and say what was trimmed in the prose.

### Table

```markdown
| Where | Control | What it does |
| --- | --- | --- |
| Before the run | Memory digest | At most 12 entries |
```

- Pipe tables only. The delimiter row is optional for the renderer but keep it for other Markdown tools.
- Escape literal pipes as `\|`.
- Use a table for a set of parallel facts (files, flags, limits, failure modes), not for narrative.
- One table per chapter is usually enough; a recap chapter often ends with one.

### Callout

```markdown
> **The loop is the agent.** Remove it and you have a chatbot.
```

- A blockquote becomes a callout box. The first bold phrase becomes the title.
- If the title contains "honest limit", the renderer adds the warning style.
- Quote without a bold lead still renders, but as an untitled box.
- Use one per chapter for the sentence worth remembering. More than one dilutes it.

### List and stats

```markdown
- **2938** — lines in src/
- **215** — of them the loop
- **8** — tools
- **9** — lifecycle hooks
```

- Four or more consecutive `- **number** — label` items at the same level render as a stat strip.
- If one item does not match, the whole group falls back to a normal bullet list. Keep stat lists pure.
- Ordinary bullets use `-` or `*`. Nested lists are not rendered as nested lists; do not rely on them for meaning.

### Colophon

```markdown
---

Built from the source in `mini-coding-js/` — every excerpt is real code. Tests: `npm test`. Demo: `npm run demo`.
```

- A line containing exactly `---` opens the colophon in the build profile. Everything after it is joined into one paragraph.
- Put it once, at the end. A `---` used as a horizontal rule elsewhere is parsed as an empty colophon and disappears.
- The colophon carries provenance, test/demo commands and the next thing to read.

## 5. Renderer limitations

The renderer's inline support is: code spans, `**bold**`, `*italic*` and `[links](target)`. Everything else is literal text.

Do not use:

- images (`![alt](src)`) — no renderer support and no remote assets are allowed anyway;
- footnotes, definition lists, task lists, strikethrough;
- raw HTML in prose (comments are fine; tags are not);
- reference-style links;
- setext headings (`Title\n=====`);
- nested lists as structure;
- `---` as a divider in build-profile pages.

Use instead: a table, a `text` diagram, a bold lead-in, or another sentence.

## 6. Voice and teaching

- Write to a smart reader who has not opened the source. Define a term the first time it appears.
- One idea per chapter; the chapter title should state the idea, not the filename.
- Open each chapter with the problem or the question, not with a definition.
- Explain the excerpt in prose after it. Code without narration is documentation.
- Prefer concrete numbers, identifiers and log lines over adjectives.
- Keep paragraphs under ~150 words and sentences under ~35 words on average. Split rather than qualify.
- Present tense, active voice. "The loop sends the tool result", not "the tool result is sent".
- No marketing superlatives, no "simply"/"just"/"obviously". If something is easy, show why.
- Do not claim a guarantee the code does not make. If the sandbox is best-effort, say so.

## 7. Content integrity

- Every identifier, flag, default, limit and error message must exist in the source, test or README.
- If you paraphrase code, label the block `pseudocode` / `*text*`, never `*javascript*`.
- Prefer one accurate excerpt over three approximate ones.
- If the code is deliberately weak (no token counting, no rollback), say so; the honesty is part of the lesson.
- If two sources disagree, show both and explain the difference.
- The recap must be defensible from the cited files alone.

## 8. Linking and the build pipeline

- The Markdown is the source of truth. Never hand-edit the generated HTML or PDF.
- Rebuild after every content change and check that the TOC, chapter ids and total scene count still match.
- Relative links resolve against the Markdown file's directory. After moving or renaming an explainer, grep every `.md` for the old path.
- Inline code paths such as `src/agent.js` are claims about the tree. Keep them correct; the audit checks them.
- Deep links in a rendered page (`?scene=N`, `#chapter-id`) depend on renderer ids. Do not rename chapters without checking them.

## 9. Verification

Run from this skill directory:

```bash
node scripts/validate_md.mjs --profile auto --root <repo> <file.md> [...]
node scripts/audit_md.mjs --root <repo> <file.md> [...]
```

The validator checks the structural contract: header, numbering, fences, captions, tables, callouts, stats, colophon, placeholders, stray HTML and duplicate headings.

The audit checks the reading experience: chapter and paragraph length, sentence length, oversized code blocks, back-to-back fences, broken relative links, missing `src/` paths and filler words. It is advisory except for broken links and missing source paths, which are content-integrity failures.

If a renderer exists, also rebuild and inspect the output:

```bash
python build_explainer.py
```

Check the generated TOC, the chapter anchors, the stat strip and the colophon. The validator cannot see what the renderer did.
