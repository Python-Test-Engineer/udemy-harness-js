---
name: md-explainer
description: Write long-form Markdown explainer lessons that teach a JavaScript codebase chapter by chapter. Use when asked to produce a .md explainer, a companion guide, a written walkthrough of src/*.js, or a Markdown source that renders to an HTML/PDF lesson. Produces numbered, build-compatible lessons with code captions, callouts, tables, stats and a colophon, plus a validator and a readability audit.
---

# MD Explainer

Turn a codebase into a written course in Markdown: numbered chapters, one idea per chapter, real source excerpts, and prose a viewer can follow without reading the code first.

This skill is the Markdown sibling of `js-explainer`. That skill builds animated HTML pages; this one builds the document that a renderer turns into a page, a PDF, or a plain readable file. Same teaching arc, different medium.

## Default paths

Unless the user gives different paths:

- **Sources:** the files the user names, normally `<repo>/src/*.js`, plus `README.md` and `test/` when the lesson needs them
- **Output, build profile:** `<repo>/explainer-<name>.md` (the main rendered page)
- **Output, companion or free profile:** `<repo>/explainers/<topic>.md`
- **Template:** `assets/explainer-template.md` in this skill directory
- **Design contract:** `references/design-contract.md`
- **Structural validator:** `scripts/validate_md.mjs`
- **Readability audit:** `scripts/audit_md.mjs`

Do not invent a new output directory. Follow the repository you are working in; in `mini-coding-agent-js` the established examples are:

| File | Profile | What it shows |
|---|---|---|
| `explainer-harness-js.md` | build | the full harness, 17 chapters, rendered to HTML and PDF |
| `explainers/summary.md` | companion | the whole journey in 17 short scenes (`## 00 · Title`) |
| `explainers/context_management.md` | free | a topic deep-dive with Parts and numbered sections |
| `explainers/reverse-engineering.md` | free | a build spec written as a prompt |

## Non-negotiables

1. **Read the actual source completely** before writing. Every identifier, argument, flag, default, limit and log line must come from the code, the tests or the README. Never invent behaviour.
2. **Write as a course, not as documentation.** Each chapter teaches one idea. A reader should be able to finish the lesson without opening the source, then open the source and recognise everything.
3. **Match the profile's structure exactly.** A build-profile page that skips the meta strip, or a companion page that switches to unnumbered chapters, will not render or will not read as part of the set.
4. **Use the contract's block vocabulary.** The renderer understands a small subset of Markdown. Anything outside it (images, nested lists, footnotes, inline HTML) leaks as plain text or is dropped.
5. **Do not overwrite an existing explainer** unless the user explicitly asked to regenerate or update it. Report it as skipped.
6. **Never edit a generated HTML or PDF.** The Markdown is the source of truth; rebuild the other formats.

## Profiles

Choose the profile from the job; all three share the same voice, traceability and chapter arc.

### `build` — rendered lesson (default)

Strictly compatible with `build_explainer.py`-style renderers.

- Front block: optional `*eyebrow*`, `# Title`, one lede paragraph, one meta strip of `` `path lines` `` items joined by ` · `.
- Chapters: `## 01 Title` — two digits, sequential, no gaps, no unnumbered H2.
- Every code fence has a caption line directly above it: `**label** · *lang*`.
- A top-level `---` followed by one paragraph is the colophon. There must be exactly one, at the end; a `---` anywhere else is swallowed by the renderer.
- Tables, blockquote callouts and lists render. Stats blocks (4+ consecutive `- **N** — label` items) render as a stat strip.

### `companion` — scene-by-scene guide

A shorter companion to the main lesson, readable on its own.

- Title and a bold one-line premise; no meta strip required.
- Scenes: `## 00 · Title` — two digits starting at 00, then sequential.
- Each scene is 150–400 words with one diagram, table or callout.
- No colophon requirement; `---` is available as a horizontal rule.
- Captions on code fences are still required.

### `free` — topic deep-dive

For a single subject that is too large for the chapter arc (context management, security, evaluation).

- Free heading structure, including `# Part I — ...`, `## 1. Title` and `### 4.2 Title`.
- Still: one idea per section, numbered or titled hierarchy, code fences with captions, no skipped heading levels.
- Use this profile only when the user asks for a topic document, not when they ask for "the explainer" of the app.

## Workflow

### 1. Inventory and read

List the sources. Read each file you will cite completely. Note the exports, the call graph, the guards, the limits, the error strings and the tests that prove them. If two files disagree, say so in the lesson rather than picking silently.

### 2. Plan the lesson

Before writing, produce a short outline:

- **Premise:** one sentence — what this code is and why it exists.
- **Chapters:** 6–12 for build and companion; a free doc may have more.
- **Beats:** 3–4 per chapter, each advancing one idea. In Markdown a beat is an `###` subhead or one to three paragraphs plus a visual block.
- **Real examples:** actual identifiers, excerpts, log lines, limits and data shapes.
- **Recap rules:** the 5–8 facts a reader should keep.

Default arc, adapted:

| Chapter | Purpose |
|---|---|
| 01 | The problem or idea the code exists for |
| 02 | The contract: exports, inputs, outputs, responsibilities |
| 03 | The main flow, drawn as a diagram |
| 04 | The important mechanism, algorithm or decision table |
| 05 | The data structures or state it keeps |
| 06 | Failure handling, guards and edge cases |
| 07 | A real excerpt explained line by line |
| 08 | An end-to-end example, trace or before/after |
| 09 | Recap: rules, commands, what to remember |

Merge chapters for a small module; split a dense one. Never pad.

### 3. Write the Markdown

Read `assets/explainer-template.md` and `references/design-contract.md` first. Copy the template and replace every placeholder.

- Use real excerpts, labelled `**src/tools.js** · *javascript*`.
- Prefer several short excerpts over one 200-line dump.
- Explain the excerpt in prose *after* it, not only before.
- Keep paragraphs under ~150 words; use `###` subheads to give the eye a rest.
- Use one callout per chapter at most, for the one line worth remembering.
- Keep the stats strip honest: every number traceable to the source or README.

### 4. Render

If the repository has a renderer (for example `build_explainer.py`), run it and check the generated page:

```bash
python build_explainer.py
```

The renderer strips the leading HTML comment, so build instructions belong there. If you add, remove or reorder chapters in a renderer that maps chapter numbers to fixed anchor ids, update that id list — otherwise the table of contents links to the wrong section.

For PDF, use the repository's Markdown-to-PDF script (in this workspace: `../skills/make-pdf-from-md/scripts/make_pdf.py`). Do not hand-edit the PDF.

### 5. Validate and audit

From this skill directory:

```bash
node scripts/validate_md.mjs --profile auto --root <repo> <file.md> [...]
node scripts/audit_md.mjs --root <repo> <file.md> [...]
```

The validator checks structure: header, chapter numbering, fence balance and language, captions, tables, callouts, stats, colophon, placeholders, stray HTML, duplicate headings. In the `free` profile a bare fence or an extra H1 is a warning rather than a failure; in `build` and `companion` they are errors. The audit checks readability and traceability: chapter and paragraph length, sentence length, code block size, broken links, `src/` paths that do not exist, and filler-word frequency.

If a generated page exists, also check it visually or with the renderer's own test. The Markdown validator cannot catch a renderer bug.

### 6. Report

Per file: output path, profile, chapter count, code-block count, whether created/updated/skipped, validator and audit result, and any caveat about the source.

## Rules that come from the renderer

These are not style preferences; each one silently breaks the page.

1. **`---` is the colophon marker, not a horizontal rule**, in the build profile. A rule mid-document is parsed as an empty colophon block. Use a blank line or a callout to separate chapters instead.
2. **A caption only attaches to a fence if it is the next non-blank line.** A paragraph between `**label** · *lang*` and the fence turns the caption into ordinary bold text.
3. **The fence language must match the caption language.** `**console** · *stdout*` goes with a ` ```stdout ` fence, not a ` ```text ` one.
4. **`##` headings must match `^##\s+(\d{2})\s+(.+)$`** in the build profile. `## 1. Title`, `## 01 · Title` and `## Summary` are unnumbered to the parser.
5. **A stats strip needs the whole list to qualify.** Four or more consecutive `- **N** — label` items at the same level render as stats; one non-matching item turns the group back into a normal list.
6. **Only the first bold phrase of a blockquote is the callout title.** `> **Honest limit:** rest` renders as a warning-styled callout; a quote without a bold lead renders as plain text in a box.
7. **Inline support is limited to** code spans, `**bold**`, `*italic*` and `[links](target)`. Images, nested lists, task lists, footnotes and raw HTML do not render.
8. **A pipe inside a table cell must be escaped** (`\|`), or it becomes a new column.

## Lessons learned

1. **A `##` heading inside a fenced block is not a heading.** The validator must track fences before counting chapters; a memory digest pasted into a `text` block looked like an unnumbered chapter.
2. **Moving a file silently breaks prose links.** After renaming or relocating an explainer, grep the Markdown for the old filename, not just the HTML. `scripts/audit_md.mjs --root` catches dead relative links and dead `src/` paths.
3. **Fixed anchor-id lists go stale.** A renderer that maps `01..17` to hard-coded ids will point the TOC at the wrong chapter after a reorder. Check the generated TOC, not only the source.
4. **A caption with the wrong language is worse than no caption.** The reader trusts the label; if the block is JavaScript and the label says `stdout`, the lesson teaches the wrong thing.
5. **Long chapters are not thorough, they are unread.** If a chapter passes ~1,100 words, split it. The audit flags it; do not argue with it.
6. **Do not round up the numbers.** Stats and limits are claims; take them from the code or the test output. A wrong number survives every lint and damages the lesson.

## Quality bar

An MD explainer is done only when:

- every claim and identifier can be traced to a source file, test or README line;
- the profile's header, numbering and caption rules are followed;
- each chapter teaches one idea and opens with a reason to care;
- the main flow is explained in prose, not only in code;
- at least one diagram or table carries the structure;
- the recap can be defended from the source alone;
- every fence is balanced, language-tagged and captioned;
- every relative link and `src/` path resolves;
- the structural validator and the audit pass;
- if a renderer exists, the generated page/PDF was rebuilt and checked.

## Related files

- `references/design-contract.md` — exact file shape, block vocabulary, renderer limits, voice and verification.
- `assets/explainer-template.md` — canonical build-profile skeleton to copy.
- `scripts/validate_md.mjs` — structural checks for build, companion and free profiles.
- `scripts/audit_md.mjs` — readability, link and traceability audit.
