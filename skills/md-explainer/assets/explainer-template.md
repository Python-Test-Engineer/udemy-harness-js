<!-- Markdown explainer template (build profile).
     The Markdown is the source of truth.

     Render:  python build_explainer.py            (or the repo's renderer)
     PDF:     python ../skills/make-pdf-from-md/scripts/make_pdf.py <name>.md

     Replace every <...> placeholder, keep the block shapes, delete these comments.
     Do not edit the generated HTML or PDF by hand. -->

*Explainer · <the one line that says what this teaches>*

# <A title that states the idea, not the filename>

<One paragraph. What the code is, why it exists, and what the reader will be able to explain by the end. Plain prose. No code on the first line.>

`src/<file>.js <lines>` · `src/<file>.js <lines>` · `src/<file>.js <lines>`

## 01 <The problem this code exists for>

<The situation before the code. What breaks, what the audience assumes, and the one question this chapter answers. Two or three short paragraphs.>

### <One beat>

<Explain the first idea. Define the term the reader needs.>

- **<number>** — <the fact it grounds>
- **<number>** — <the fact it grounds>
- **<number>** — <the fact it grounds>
- **<number>** — <the fact it grounds>

### <The shape of it>

<The mechanism in prose. One idea per paragraph.>

**<what this excerpt is>** · *javascript*

```javascript
// a real, trimmed excerpt from the source
// (keep it short enough to read on one screen)
```

<What the excerpt does, line by line, and why it is written that way.>

> **<The sentence worth remembering.>** <Why it matters in one clause.>

## 02 <The contract: inputs, outputs, responsibilities>

<What the module promises, what it refuses, and who calls it.>

| Piece | What it owns |
| --- | --- |
| <name> | <responsibility> |
| <name> | <responsibility> |
| <name> | <responsibility> |

<One paragraph tying the table together. If a row would need a paragraph, it belongs in its own chapter.>

## 03 <The main flow, drawn once>

<Walk the pipeline before showing the diagram. Name the steps in order.>

**<diagram label>** · *text*

```text
<the flow, with real function and file names>
```

<Read the diagram aloud: where it starts, where it can branch, where it ends.>

## 04 <The mechanism that is easy to get wrong>

<The algorithm, decision table or rule set. Keep the failure mode visible.>

| Input | Decision | Why |
| --- | --- | --- |
| <case> | <result> | <reason> |
| <case> | <result> | <reason> |

## 05 <The state it keeps>

<What survives a call, a run or a process, and where it lives. Use a small excerpt or a table, not a tour of every variable.>

## 06 <What it refuses: guards and failure modes>

<The checks, caps and refusals. Say what is enforced, what is best-effort, and what is not protected at all.>

> **Honest limit:** <the thing this design does not do, stated plainly.>

## 07 <The excerpt, line by line>

<Introduce the excerpt. Then show it, then explain it. This is the chapter a reader will re-read.>

**src/<file>.js** · *javascript*

```javascript
<the excerpt>
```

<Explain the lines that carry the idea, not every line. Name the identifiers.>

## 08 <An end-to-end example>

<One realistic run, trace or before/after. Use a real command and real output.>

**<what produced this output>** · *stdout*

```stdout
<real terminal output>
```

<Translate the output into the four or five events a reader should recognise next time.>

## 09 Recap

- <rule>
- <rule>
- <rule>
- <rule>
- <rule>

| <topic> | <where it lives> |
| --- | --- |
| <thing> | `<file>` |
| <thing> | `<file>` |

<One closing paragraph: what the whole design adds up to, and what it costs.>

---

Built from the source in `<repo>/` — every excerpt is real code, with logging lines trimmed and long lines rewrapped. Tests: `<test command>`. Demo: `<demo command>`. Read next: `<file or explainer>`.
