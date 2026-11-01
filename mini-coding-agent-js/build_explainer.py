#!/usr/bin/env python3
"""Render explainer-harness-js.md into explainer-harness-js.html.

The Markdown is the source of truth. This script keeps the page shell (CSS,
sidebar, print styles, site customiser) and regenerates the header, contents
and chapter body from the Markdown, so the two files cannot drift apart.
"""
from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MD = ROOT / "explainer-harness-js.md"
TEMPLATE = ROOT / "explainer-template.html"
OUT = ROOT / "explainer-harness-js.html"

SECTION_IDS = [
    "what", "shape", "loop", "model", "messages", "tools", "edit",
    "sandbox", "policy", "ui", "hooks", "memory", "config", "bounds",
    "trace", "run", "limits",
]

CAPTION_RE = re.compile(r"^\*\*(.+?)\*\*\s*·\s*\*([^*]+)\*$")
H2_RE = re.compile(r"^##\s+(\d{2})\s+(.+)$")
H3_RE = re.compile(r"^###\s+(.+)$")
LIST_RE = re.compile(r"^[-*]\s+(.+)$")
STAT_RE = re.compile(r"^\*\*(.+?)\*\*\s*—\s*(.+)$")


def esc(text: str) -> str:
    return html.escape(text, quote=False)


def inline(text: str) -> str:
    """Small Markdown inline renderer: code, links, bold, italic."""
    codes: list[str] = []

    def code_span(match: re.Match[str]) -> str:
        codes.append(match.group(1))
        return f"\x00{len(codes) - 1}\x00"

    text = re.sub(r"`([^`]+)`", code_span, text)
    text = esc(text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text, flags=re.S)
    text = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", text)
    for index, value in enumerate(codes):
        text = text.replace(f"\x00{index}\x00", f"<code>{esc(value)}</code>")
    return text


def split_table_row(line: str) -> list[str]:
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|") and not line.endswith("\\|"):
        line = line[:-1]
    cells = re.split(r"(?<!\\)\|", line)
    return [cell.strip().replace("\\|", "|") for cell in cells]


def render_table(lines: list[str]) -> str:
    rows = [split_table_row(line) for line in lines]
    if len(rows) >= 2 and all(re.fullmatch(r":?-{3,}:?", cell) for cell in rows[1]):
        head, body = rows[0], rows[2:]
    else:
        head, body = rows[0], rows[1:]
    out = ['<div class="table-wrap"><table class=""><thead><tr>']
    out.extend(f"<th>{inline(cell)}</th>" for cell in head)
    out.append("</tr></thead><tbody>")
    for row in body:
        out.append("<tr>" + "".join(f"<td>{inline(cell)}</td>" for cell in row) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


def render_code(caption: str | None, lang: str, code: str) -> str:
    plain = (lang or "").lower() == "text"
    kind = "ascii" if plain else "code"
    body = esc(code.rstrip("\n"))
    if plain:
        head = f"<figcaption><span>{inline(caption or '')}</span></figcaption>" if caption else ""
    else:
        head = (
            f'<figcaption><span>{inline(caption or "")}</span>'
            f'<span class="lang">{esc(lang)}</span></figcaption>'
        )
    return f'<figure class="{kind}">{head}<pre>{body}</pre></figure>'


def render_callout(text: str) -> str:
    match = re.match(r"^\*\*(.+?)\*\*\s*(.*)$", text, flags=re.S)
    if not match:
        return f'<div class="callout ">{inline(text)}</div>'
    title, rest = match.group(1), match.group(2)
    warn = "honest limit" in title.lower()
    cls = "callout warn" if warn else "callout "
    return f'<div class="{cls}"><strong>{inline(title)}</strong> {inline(rest)}</div>'


def render_list(items: list[str]) -> str:
    stats = []
    for item in items:
        match = STAT_RE.match(item.strip())
        if not match:
            break
        stats.append((match.group(1), match.group(2)))
    else:
        if len(stats) >= 4:
            cells = "".join(
                f"<div><b>{inline(number)}</b><span>{inline(label)}</span></div>"
                for number, label in stats
            )
            return f'<div class="stats">{cells}</div>'
    return "<ul>" + "".join(f"<li>{inline(item)}</li>" for item in items) + "</ul>"


def parse_markdown(text: str):
    lines = text.splitlines()
    # Drop the leading rebuild comment.
    cleaned: list[str] = []
    in_comment = False
    for line in lines:
        if in_comment:
            if "-->" in line:
                in_comment = False
            continue
        if line.lstrip().startswith("<!--"):
            if "-->" not in line:
                in_comment = True
            continue
        cleaned.append(line)
    lines = cleaned

    eyebrow = ""
    title = ""
    lede = ""
    meta: list[str] = []
    index = 0

    # Header: italic eyebrow, h1, lede paragraph, metadata line.
    while index < len(lines) and not lines[index].strip():
        index += 1
    if index < len(lines) and lines[index].strip().startswith("*") and lines[index].strip().endswith("*"):
        eyebrow = lines[index].strip()[1:-1]
        index += 1
    while index < len(lines) and not lines[index].strip():
        index += 1
    if index < len(lines) and lines[index].startswith("# "):
        title = lines[index][2:].strip()
        index += 1
    while index < len(lines) and not lines[index].strip():
        index += 1
    lede_lines = []
    while index < len(lines) and lines[index].strip() and not lines[index].startswith("`"):
        lede_lines.append(lines[index].strip())
        index += 1
    lede = " ".join(lede_lines)
    while index < len(lines) and not lines[index].strip():
        index += 1
    if index < len(lines) and lines[index].strip().startswith("`"):
        meta = [part.strip().strip("`") for part in lines[index].strip().split(" · ")]
        index += 1

    sections: list[dict] = []
    current: dict | None = None

    def ensure_section() -> dict:
        nonlocal current
        if current is None:
            current = {"number": "", "title": "", "id": "top", "blocks": []}
            sections.append(current)
        return current

    while index < len(lines):
        raw = lines[index]
        stripped = raw.strip()

        if not stripped:
            index += 1
            continue

        if stripped == "---":
            # Everything after the rule is the colophon.
            index += 1
            while index < len(lines) and not lines[index].strip():
                index += 1
            colophon_lines = []
            while index < len(lines) and lines[index].strip():
                colophon_lines.append(lines[index].strip())
                index += 1
            ensure_section()["blocks"].append(("colophon", " ".join(colophon_lines)))
            continue

        h2 = H2_RE.match(stripped)
        if h2:
            number, heading = h2.group(1), h2.group(2)
            section_id = (
                SECTION_IDS[int(number) - 1]
                if int(number) - 1 < len(SECTION_IDS)
                else re.sub(r"\W+", "-", heading.lower()).strip("-")
            )
            current = {"number": number, "title": heading, "id": section_id, "blocks": []}
            sections.append(current)
            index += 1
            continue

        h3 = H3_RE.match(stripped)
        if h3:
            ensure_section()["blocks"].append(("h3", h3.group(1)))
            index += 1
            continue

        if stripped.startswith("```"):
            lang = stripped[3:].strip()
            code_lines = []
            index += 1
            while index < len(lines) and not lines[index].strip().startswith("```"):
                code_lines.append(lines[index])
                index += 1
            if index < len(lines):
                index += 1
            ensure_section()["blocks"].append(("code", None, lang, "\n".join(code_lines)))
            continue

        caption = CAPTION_RE.match(stripped)
        if caption:
            look = index + 1
            while look < len(lines) and not lines[look].strip():
                look += 1
            if look < len(lines) and lines[look].strip().startswith("```"):
                lang = lines[look].strip()[3:].strip()
                code_lines = []
                look += 1
                while look < len(lines) and not lines[look].strip().startswith("```"):
                    code_lines.append(lines[look])
                    look += 1
                if look < len(lines):
                    look += 1
                ensure_section()["blocks"].append(
                    ("code", caption.group(1), lang, "\n".join(code_lines))
                )
                index = look
                continue

        if stripped.startswith("|"):
            table_lines = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                table_lines.append(lines[index].strip())
                index += 1
            ensure_section()["blocks"].append(("table", table_lines))
            continue

        if stripped.startswith(">"):
            quote_lines = []
            while index < len(lines) and lines[index].strip().startswith(">"):
                quote_lines.append(re.sub(r"^>\s?", "", lines[index].strip()))
                index += 1
            ensure_section()["blocks"].append(("callout", " ".join(quote_lines)))
            continue

        list_match = LIST_RE.match(stripped)
        if list_match:
            items = []
            while index < len(lines) and LIST_RE.match(lines[index].strip()):
                items.append(LIST_RE.match(lines[index].strip()).group(1))
                index += 1
            ensure_section()["blocks"].append(("list", items))
            continue

        # Ordinary paragraph: gather until a blank line or a block opener.
        para_lines = []
        while index < len(lines):
            line = lines[index]
            s = line.strip()
            if not s:
                break
            if (
                s == "---"
                or s.startswith("```")
                or s.startswith("|")
                or s.startswith(">")
                or H2_RE.match(s)
                or H3_RE.match(s)
                or LIST_RE.match(s)
                or CAPTION_RE.match(s)
            ):
                break
            para_lines.append(s)
            index += 1
        ensure_section()["blocks"].append(("p", " ".join(para_lines)))

    return {
        "eyebrow": eyebrow,
        "title": title,
        "lede": lede,
        "meta": meta,
        "sections": sections,
    }


def render_document(parsed: dict) -> tuple[str, str, str, str]:
    eyebrow = inline(parsed["eyebrow"])
    title = inline(parsed["title"])
    lede = inline(parsed["lede"])
    meta = "".join(f"<span>{inline(item)}</span>" for item in parsed["meta"])
    header = f'''<header class="page-heading">
        <p class="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p class="lede">{lede}</p>
        <p class="meta">
          {meta}
        </p>
      </header>'''

    toc = []
    content = []
    colophon = ""
    for section in parsed["sections"]:
        blocks = section["blocks"]
        if section["id"] != "top" or section["number"]:
            toc.append(
                f'<a href="#{section["id"]}"><span class="n">{section["number"]}</span>'
                f'<span>{inline(section["title"])}</span></a>'
            )
            content.append(f'<section id="{section["id"]}">')
            content.append(
                f'<h2><span class="num">{section["number"]}</span>'
                f'<span>{inline(section["title"])}</span></h2>'
            )
        for block in blocks:
            kind = block[0]
            if kind == "h3":
                content.append(f'<h3>{inline(block[1])}</h3>')
            elif kind == "p":
                content.append(f"<p>{inline(block[1])}</p>")
            elif kind == "code":
                content.append(render_code(block[1], block[2], block[3]))
            elif kind == "table":
                content.append(render_table(block[1]))
            elif kind == "callout":
                content.append(render_callout(block[1]))
            elif kind == "list":
                content.append(render_list(block[1]))
            elif kind == "colophon":
                colophon = f'<p class="colophon">{inline(block[1])}</p>'
        if section["id"] != "top" or section["number"]:
            content.append("</section>")

    return header, "\n".join(toc), "\n".join(content), colophon


def main() -> None:
    parsed = parse_markdown(MD.read_text(encoding="utf-8"))
    header, toc, content, colophon = render_document(parsed)
    template = TEMPLATE.read_text(encoding="utf-8")
    output = (
        template.replace("{{HEADER}}", header)
        .replace("{{TOC}}", toc)
        .replace("{{CONTENT}}", content)
        .replace("{{COLOPHON}}", colophon)
    )
    OUT.write_text(output, encoding="utf-8")
    print(f"wrote {OUT} ({len(output):,} bytes, {len(parsed['sections'])} sections)")


if __name__ == "__main__":
    main()
