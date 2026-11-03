---
name: make-html-from-md
description: Convert a long-form Markdown file into a styled HTML reading guide matching the mini-coding-js explainer design system. Use when the user wants to turn .md documentation into a sidebar-navigated, printable web page with the project's warm-neutral typography and code styling.
---

# make-html-from-md

Transform a long-form Markdown file into a single-file HTML reading guide.

The output mimics `sandbox-guide.html` and `reverse-engineering.html` in the
mini-coding-js explainer series: sticky sidebar table of contents, scroll-sync
active state, reading-progress bar, warm-neutral palette (`--paper`, `--terra`,
`--ink`), dark code blocks, styled tables, callouts, and print-friendly layout.

## What the script does

- Reads a `.md` file from the explainers directory (or any path you provide)
- Parses headings, paragraphs, lists, tables, code blocks, blockquotes, and inline
  formatting into semantic HTML
- Generates a numbered sidebar TOC from level-1 (`#`) headings
- Wraps everything in a self-contained HTML file with no external dependencies
- Adds active-section highlighting and a top progress bar via a small inline script

## When to use this

- An explainer Markdown has no HTML companion yet
- A README or spec needs to become a browsable, printable single page
- You want the same visual system as the other explainers without rebuilding the
  template by hand

## How to run

```bash
node .build/md-to-html.mjs <input.md> [output.html]
```

Omitting the output argument writes to the same directory as the input, with
`.html` extension.

The script lives at:

```
mini-coding-agent-js/explainers/.build/md-to-html.mjs
```

That file is the reference implementation. When a new Markdown explainer needs an
HTML page, call the script or copy and adapt it.

## Markdown support

| Element | HTML output |
|---|---|
| `# Heading` | `<section id="sNN">` + `<h2>` with numbered prefix |
| `## Heading` | `<h3>` |
| `### Heading` | `<h4>` |
| `` `code` `` | `<code>` with warm-grey background |
| `\`\`\`lang\n…\n\`\`\`` | `<figure class="code"><figcaption>…</figcaption><pre>…</pre></figure>` |
| `> quote` | `<div class="callout">` |
| `\| table \|` | `<div class="table-wrap"><table>…</table></div>` |
| `- item` / `1. item` | `<ul>` / `<ol>` with custom bullets |
| `**bold**` / `*italic*` | `<strong>` / `<em>` |
| `---` | `<hr>` |

## Tuning the generated page

If you need a different title, eyebrow, lede, or meta tags, edit the `buildPage`
call inside the script before running it. The current defaults are tailored for
`reverse-engineering.md`, but the `buildPage` function accepts:

- `title` — `<title>` text
- `eyebrow` — small uppercased label above the `<h1>`
- `h1` — page heading
- `lede` — subtitle paragraph
- `meta` — array of metadata chips
- `tocTitle` / `sideSub` / `sideFoot` — sidebar text

## Verification

After running the script, open the generated `.html` in a browser and check:

1. Sidebar TOC links scroll to the correct sections
2. Active section is highlighted as you scroll
3. Code blocks are readable (dark background, Monospace font)
4. Tables scroll horizontally on narrow viewports
5. Print stylesheet hides the sidebar and progress bar
