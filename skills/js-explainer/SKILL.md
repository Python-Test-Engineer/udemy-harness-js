---
name: js-explainer
description: Generate animated, course-style HTML explainer lessons for JavaScript source files. Use when asked to turn src/*.js into <name>-explainer.html pages, explain a JS module visually, or replicate the style of hooks-explainer.html. Produces self-contained autoplay lessons with scenes, captions, controls, deep links, dark mode, and responsive layout.
---

# JS Explainer

Turn each JavaScript source file into a self-contained, animated explainer lesson in the established course-player style.

## Default paths

Unless the user gives different paths:

- **Sources:** `<repo>/src/*.js` — non-recursive, JavaScript files only
- **Output:** `<repo>/explainers/<basename>-explainer.html`
- **Visual reference:** `assets/explainer-template.html` in this skill directory
- **Design contract:** `references/design-contract.md`
- **Structural validator:** `scripts/validate_explainers.mjs`

Example: `src/agent.js` → `explainers/agent-explainer.html`.

Do **not** create explainers for `.md` files, tests, configs, or non-JS files. If the user asks for "every JS file", process every `*.js` in the source directory.

## Non-negotiables

1. **Read the actual source file completely** before writing its explainer. Never invent exports, functions, arguments, behaviour, or failure modes.
2. **Reuse the template's CSS and player JavaScript.** Read `assets/explainer-template.html` and adapt its structure. Do not rewrite the player from memory or replace its design system with a different one.
3. **Keep every page self-contained.** No CDNs, external fonts, images, scripts, or network calls.
4. **Write as a course, not documentation.** Each scene teaches one idea, with narration that advances beat by beat. A viewer should be able to watch without reading the source first.
5. **Do not overwrite an existing explainer unless the user explicitly asked to regenerate or update it.** Otherwise report it as skipped.

## Workflow

### 1. Inventory

List the source directory. If generating many pages, work one source file at a time to keep context focused: read that file, generate its page, validate it, then move to the next.

### 2. Plan the lesson

Before writing HTML, write a short outline:

- **Premise:** one sentence — what this file is and why it exists.
- **Scenes:** normally 8–10, never fewer than 6. For a tiny file, merge related beats rather than padding.
- **Beats per scene:** 3–4 narration steps, each revealing one idea in the visuals.
- **Real examples:** choose actual identifiers, code excerpts, log lines, or data shapes from the source.

Use this default arc, adapted to the file:

| Scene | Purpose |
|---|---|
| 01 | The problem or idea the file exists for |
| 02 | The contract: exports, inputs, outputs, responsibilities |
| 03 | The main flow or pipeline, drawn as a diagram |
| 04 | The important mechanism / algorithm / decision table |
| 05 | The data structures or state it keeps |
| 06 | Failure handling, guard rails, or edge cases |
| 07 | A real code excerpt, explained line by line |
| 08 | An end-to-end example, trace, or before/after |
| 09 | Recap: key rules, commands, and what to remember |

For a small module, 6–7 scenes is fine. Keep the same visual language and player.

### 3. Generate the explainer

Read `assets/explainer-template.html` and `references/design-contract.md` first, then copy the template and replace all content.

Requirements:

- Same palette, typography, sidebar, stage, caption bar, timeline, controls, dark mode, and keyboard behaviour as the template.
- `10 scenes` badge and clock can change to the real scene count and duration.
- Every scene has a numbered chip, kicker, title, beat-driven visuals, and captions.
- Use real source excerpts in code panels. Label them with the source path, e.g. `src/tools.js`.
- Keep the lesson's language plain and concrete. Explain what a viewer is seeing.
- Keep the deep-link support: `?scene=N&beat=N&paused`.
- Respect `prefers-reduced-motion`; do not autoplay when the user requests reduced motion.
- Preserve accessibility: button labels, caption `aria-live`, focus-visible styles.

### 4. Replace every template-specific string

The template is a working player, not reusable lesson content. When adapting it, replace:

- `<title>` and the page `<h1>`
- the sidebar kicker, title, subtitle, and footer
- the entire `#toc` scene list and every `href="#scene-N"` / `data-scene="N"` index
- every `<section class="scene">` body and every scene title/kicker/chip
- the `SCENES` JavaScript array (titles, kickers, durations, beats, captions)
- the page metadata strip (`10 scenes`, watch time, counts)
- every code panel, console excerpt, diagram label, and callout
- any `hooks`, `HOOK_EVENTS`, `PreToolUse`, `SessionStart`, or other hooks-specific identifiers left over from the template

The shell, CSS, player controls, timeline builder, deep-link handling, theme toggle, and keyboard wiring should survive unchanged apart from scene data.

If you replace template blocks with a marker-based builder, do not include the end marker in the replacement when the helper already preserves it. A duplicated `</header>` or `</div>` can silently move `<main>` below the sidebar. Check the generated DOM: `.shell` must contain `<aside class="sidebar">` and `<main class="pane">` as siblings.

### 5. Prevent layout collisions

This is a hard requirement, learned from the hooks explainer:

- The scene is a flex column. Never absolutely position scene content over the scene header.
- Tall content in a fixed-height stage must be top-aligned (`justify-content: flex-start`), not vertically centered.
- Card grids must not be allowed to push the last card outside the stage.
- At 1440px the TOC must stay in the left rail and the player/content must start to its right. Do not raise the one-column breakpoint above 1440px.
- Keep the template's scaled defaults:
  - root font size `31.5px`
  - sidebar `14.5rem`
  - desktop pane padding `1.55rem 1.8rem 4rem`
  - stage height `clamp(860px, 48vh, 980px)`, min-height `860px`
  - scene gap `.45rem`
  - one-column breakpoint `max-width: 1360px`
  - compact breakpoint `max-width: 1020px`
- At 1440px, reduce 3- and 4-column card grids to two columns. The sidebar already consumes width; four full-size cards will be unreadable.
- If content still does not fit, reduce internal spacing or reorganise the scene. Do not shrink the type below the template's scale.

### 6. Validate

Run the structural validator from this skill directory:

```bash
node scripts/validate_explainers.mjs <source-dir> <output-dir>
```

It checks that every `.js` source has a matching explainer and that each page has the required player, scene, caption, timeline, deep-link, and scale markers.

Then run the headless layout audit from this skill directory:

```bash
node scripts/audit-layout.mjs <output-dir>
```

It checks 500px, 1440px and 1920px: the shell structure, main-to-the-right-of-sidebar at desktop widths, header overlap, horizontal overflow, and per-scene title/content and stage clipping. It requires Chrome or Edge.

Also validate the generated markup and inline scripts:

- Parse the HTML (for example with Python's `html.parser`) and confirm there are no mismatched or unclosed tags.
- Extract every inline `<script>` and run `node --check` on it.

Then do a visual check:

- Open at 1440px and 1920px wide. Confirm the TOC is on the left and the player is on the right.
- Confirm no scene title overlaps its first content block and no card is clipped.
- Open at a narrow width (about 390px). Confirm there is no horizontal overflow.
- Step through every scene with the timeline and `?scene=N&beat=99&paused`.
- Confirm play/pause, previous/next, restart, speed, keyboard shortcuts, and theme toggle work.
- Confirm captions change when the beat changes.

If Chrome or Edge is available, headless screenshots are a fast check:

```bash
chrome --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1440,1200 --virtual-time-budget=1200 \
  --screenshot=out.png "file:///absolute/path/to/file-explainer.html?scene=3&beat=99&paused"
```

### 7. Report

List, per source file:

- output path
- scene count
- whether it was created, updated, or skipped
- validation result
- any source-specific caveat

## Lessons learned

These are the failures that actually happened while building the hooks and module explainers:

1. **Scaling to 150% must not collapse the desktop shell.** The type scale is 1.5×, but the layout breakpoint must remain below 1440px (`1360px`). Otherwise the TOC becomes a top strip and the content appears below it at normal desktop widths.
2. **A duplicate end tag is a layout bug, not a cosmetic one.** Replacing a `<header>...</header>` block with a string that also contains `</header>` produced `<main>` below the sidebar. Validate sibling structure, not just the scene content.
3. **Never vertically center tall scene content.** It overflows upward into the title. Use `justify-content: flex-start` for lifecycle diagrams, card grids and anything that can grow.
4. **Audit with transitions disabled.** Measuring a scene while it is still sliding in reports false clipping. Disable transitions/animations before taking rects. Once measured accurately, the hooks contract scene needed a taller stage (`860px`, not `800px`) because its three top cards wrap at 1440px. Increase the calibrated stage height when wrapped cards genuinely need it; do not shrink the type.
5. **The sidebar eats card width at 1440px.** Three- and four-column grids need to become two columns at that width, or the cards become narrow and tall.
6. **Do not trust a clean screenshot at one width.** Audit 500px, 1440px and 1920px. The same page can be correct in one layout and broken in another.

## Quality bar

An explainer is done only when:

- every claim and identifier can be traced to the source file;
- the page opens and plays without a network connection;
- the first scene makes the file's purpose clear within ten seconds;
- the viewer can follow the main flow without reading code;
- the code excerpt scene matches the real source;
- the recap states the few rules worth remembering;
- no scene title overlaps its content at desktop widths;
- there is no horizontal overflow on mobile;
- the structural validator passes;
- the layout audit passes at 500px, 1440px and 1920px;
- the generated HTML has balanced tags and every inline script passes `node --check`.

## Related files

- `references/design-contract.md` — exact tokens, layout rules, and player behaviour to preserve.
- `assets/explainer-template.html` — canonical visual/player template, copied from `explainers/hooks-explainer.html`.
- `scripts/validate_explainers.mjs` — checks expected outputs and required markers.
- `scripts/audit-layout.mjs` — headless Chrome/Edge layout audit at 500px, 1440px and 1920px.
