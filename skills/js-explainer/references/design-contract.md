# Explainer design contract

This is the visual and behavioural contract for every `*-explainer.html` page. Use `assets/explainer-template.html` as the working reference; this document explains which parts must survive adaptation.

## 1. Page shell

- Two-column app shell on wide screens: a sticky contents sidebar and a content pane.
- At 1440px and wider the TOC stays in the left rail and the player/content starts to its right. This is a hard requirement: the page must not look like a TOC with the lesson underneath it at normal desktop widths.
- At `max-width: 1360px`, collapse to one column with the scene list as horizontal chips.
- At `max-width: 1020px`, tighten padding and stack all two-column scene layouts.
- Background, surfaces, borders, and text come from the template's CSS custom properties:
  - paper `#f0eee6`, surface `#fbfaf7`, ivory `#fffdfa`
  - ink `#1f1e1d`, prose `#33302c`, muted `#55524c`, stone `#8c877c`
  - terra `#d97757`, terra-dark `#c9633f`, amber `#b9862f`
  - code background `#23211e`, code bar `#2b2823`, code text `#f2ece1`, accent `#f0b49a`
- Dark mode keeps the same token names with darker surfaces and lighter ink. A fixed `Aa` button toggles light/dark and stores the choice.
- Headings use the serif stack; body uses the system sans stack; code uses the mono stack.

## 2. Scale

The page is designed to look like the original 150% zoom at normal 100% browser zoom. Do not shrink these values:

```css
:root {
  --root-size: 31.5px;
  --sidebar: 14.5rem;
  --measure: 76rem;
  --stage-h: clamp(860px, 48vh, 980px);
}
html { font-size: var(--root-size, 31.5px); }
.stage { height: var(--stage-h); min-height: 860px; }
.scene { gap: .45rem; }
.pane { padding: 1.55rem 1.8rem 4rem; }
```

The default scene title is:

```css
.stage-title {
  font: 500 clamp(1.42rem, 2.7vw, 2.05rem)/1.09 var(--serif);
  letter-spacing: -.02em;
}
```

The scene header is a flex row with a numbered chip, a small kicker, and the title. It is `flex: 0 0 auto`. Do not position it absolutely.

## 3. Scene structure

Every scene is a section:

```html
<section class="scene" data-scene="0" id="scene-0">
  <div class="scene-head">
    <span class="chip">01</span>
    <div>
      <p class="scene-kicker">One idea</p>
      <h2 class="stage-title">A title that explains the scene.</h2>
    </div>
  </div>
  <!-- scene body -->
</section>
```

- Only one scene is `.active` at a time.
- The scene body follows the header in normal flow.
- `.shell` must contain `<aside class="sidebar">` and `<main class="pane">` as siblings. At desktop widths, main's left edge must be at or after the sidebar's right edge. If main is below the sidebar, the HTML structure is wrong; do not paper over it with CSS.
- Elements that should appear per beat carry `data-at="0"`, `data-at="1"`, etc. CSS hides them until the player adds `.on`.
- The player sets `data-beat` on the active scene for debugging; use `data-at` for visibility.
- Keep content readable as a slide: one dominant idea per scene, short labels, real code.

## 4. Layout collision rules

These are mandatory:

1. The scene is a flex column with `overflow: auto`. It must never rely on negative margins to pull content upward.
2. Tall content blocks use `justify-content: flex-start`. Do not vertically center content that can exceed its container.
3. Card grids and code panels must fit inside the stage. If they do not:
   - reduce the number of items per row;
   - reduce internal gaps;
   - split a dense scene into two scenes;
   - increase the stage height only as a last resort, keeping the clamp pattern.
4. The scene header must remain above the body with a visible gap at 1440px and 1920px widths.
5. Do not use `position: absolute` for cards, labels, or code panels inside the scene body.
6. The mobile breakpoint must stack grids and allow the stage to grow naturally; no horizontal scrollbar.
7. At 1440px, 3- and 4-column card grids must collapse to two columns. The sidebar consumes too much width for four full-size cards.
8. Do not fix a few pixels of clipping by shrinking the type. Measure with transitions disabled, then either reduce wrapped-card height or raise the calibrated stage height. The current stage is `860px` because the hooks contract scene needs it at 1440px.

## 5. Template replacement pitfalls

These failures are silent and expensive:

- **Duplicated end tags.** If a block replacement preserves the original `</header>` or `</div>` and the replacement also includes it, the shell can lose its second grid child. `<main>` then lands below the sidebar. Validate the DOM, not only the visual scene.
- **Stale template strings.** A page can still contain `Lifecycle hooks`, `HOOK_EVENTS`, `PreToolUse` or the old player label after the scenes are replaced. Grep the output for those before shipping.
- **Wrong scene indexes.** The nav `href`, `data-scene`, `id`, the scene array, and the generated timeline must all agree. Use a builder or a single source of truth.
- **A clock that rounds wrong.** Compute minutes from rounded total seconds, not from `Math.floor(ms/60000)` plus a rounded remainder. `119500ms` must display as `02:00`, not `01:00`.

## 6. Player behaviour

Preserve all of this from the template:

- Autoplay starts on load unless `prefers-reduced-motion: reduce` is set.
- Play/pause button toggles playback.
- Previous/next buttons move by scene. Previous restarts the current scene after 1.2s.
- Restart button returns to scene 01 and resumes.
- Speed selector: `0.75×`, `1×`, `1.25×`, `1.5×`.
- Timeline segments are clickable and show per-scene progress.
- Overall progress bar at the top of the page.
- Keyboard: `Space` play/pause, `←` / `→` previous/next, `R` restart.
- Deep links: `?scene=N&beat=N&paused` and `#scene-N` open at a scene. The `beat` is 1-based; the player seeks to the start of that beat.
- Captions update as beats advance and use an `aria-live="polite"` region.
- The scene list in the sidebar highlights the active scene and marks completed scenes.
- A finished lesson leaves the play button in replay state.

## 7. Scene data

Each scene in the JS array has:

```js
{
  title: 'Short title',
  kicker: 'Scene label',
  duration: 12500,
  beats: [
    { at: 0, text: 'First narration line.' },
    { at: 3900, text: 'Second narration line.' },
    { at: 8200, text: 'Third narration line.' }
  ]
}
```

- `duration` is milliseconds. Use 10–17 seconds per scene.
- `beats[].at` is milliseconds from the start of the scene.
- Keep 3–4 beats per scene.
- Captions should read like narration, not like bullet points.
- The timeline and clock are computed from the scene data.

## 8. Visual vocabulary

Reuse the template's existing components where possible:

- `panel` / `code-panel`: dark code blocks with a caption bar
- `console`: dark terminal output
- `node`, `step-node`, `small-box`, `node-arrow`: flow diagrams
- `event-card`, `verdict-card`, `end-card`: event/decision cards
- `handler`, `chain`: ordered lists with status states
- `wiring-card`: three-up implementation examples
- `recap-stat`, `rule`, `final-quote`: recap scene
- `callout-mini`, `big-statement`: one-line takeaways
- `return-card`, `flow-line`: compact contract/decision rows

Keep the template's rounded corners, thin borders, uppercase micro-labels, and terra accents.

## 9. Accessibility

- Every control has an `aria-label` and visible focus treatment.
- Decorative icons are marked `aria-hidden` or are text-only.
- The caption region is announced politely, not assertively.
- Colour is never the only signal: use labels/icons in addition to accent colours.
- The page remains usable with reduced motion; transitions are disabled and autoplay does not start.

## 10. Content integrity

- Quote real identifiers and real source lines.
- If paraphrasing code, label it clearly as pseudocode.
- Never imply a function, flag, tool, or return shape that is not in the source file.
- Prefer one accurate excerpt over several invented ones.
- The recap must be defensible from the file alone.

## 11. Verification

Run both scripts from the skill directory:

```bash
node scripts/validate_explainers.mjs <source-dir> <output-dir>
node scripts/audit-layout.mjs <output-dir>
```

The layout audit disables transitions before measuring, then checks 500px, 1440px and 1920px. It checks the shell structure, that main is to the right of the sidebar at desktop widths, header/lede overlap, horizontal overflow, and per-scene title/content and stage clipping.
