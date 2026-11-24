#!/usr/bin/env python3
"""Convert the Open Lakehouse Wiki's MediaWiki pages to MDX for the site.

One-time migration tool. It reads the wikitext pages of the
open-lakehouse/wiki repository (content/<Namespace>/<Title>.wiki) and
writes src/content/wiki/<kind>/<Title>.mdx. Delete it once the MediaWiki
install is shut down.

    python3 scripts/wiki-import/convert.py <wiki-checkout>/content src/content/wiki [--overwrite]

Existing .mdx files are left alone unless --overwrite is given, so it can be
run again to pick up pages added to the wiki repository after the first run
without undoing edits made here (the style guide and About page were
rewritten by hand for the new workflow).

Needs mwparserfromhell (pip install mwparserfromhell).

What maps to what:
  ''italic'' '''bold'''        -> *italic* **bold**
  [[Page|text]] [[page]]s      -> [text](/wiki/Page) [pages](/wiki/Page)
  [https://x text]             -> [text](https://x)
  <ref name=a>...</ref>        -> [^a] plus a footnote definition
  {{Cite web|...}}             -> Author. [Title](url). *Publisher*, date. Retrieved D.
  {{Infobox software|...}}     -> <Infobox type="software"> with <Field> rows
  {{Verified|date|against}}    -> <Verified date="...">against</Verified>
  {{Status|level|...}}         -> <Status level="..." since="...">rest</Status>
  {{Main|A|B}} {{See also|A}}  -> <Hatnote>Main articles: ...</Hatnote>
  {{Note|x}} {{Warning|x}}     -> <Note>x</Note> <Warning>x</Warning>
  {{Navbox open lakehouse}}    -> dropped; the wiki layout renders it
  [[Category:X]]               -> categories: in the frontmatter
  {| class="wikitable" ... |}  -> GFM table
  <syntaxhighlight lang=x>     -> fenced code block
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

import mwparserfromhell as mwp
from mwparserfromhell.nodes import (Comment, ExternalLink, Heading, HTMLEntity,
                                    Tag, Template, Text, Wikilink)

KINDS = {"Main": "articles", "Category": "categories", "Open_Lakehouse_Wiki": "project"}
SKIP_TITLES = {"Main_Page"}  # rebuilt as a React page
# Categories that only held MediaWiki templates, which do not exist on the site.
SKIP_CATEGORY_SUFFIX = "_templates"
BLOCK = ""  # marks start/end of a block placeholder


def wiki_url(target: str) -> str:
    """URL path for a wiki link target, the way MediaWiki writes it."""
    target = target.strip()
    frag = ""
    if "#" in target:
        target, frag = target.split("#", 1)
        frag = "#" + slug(frag)
    target = target.lstrip(":").strip()
    if not target:
        return frag
    if ":" in target:
        ns, rest = target.split(":", 1)
        ns, rest = ns.strip(), rest.strip()
        target = f"{ns}:{rest[:1].upper()}{rest[1:]}"
    else:
        target = target[:1].upper() + target[1:]
    return "/wiki/" + target.replace(" ", "_") + frag


def slug(text: str) -> str:
    """Heading id as rehype-slug (github-slugger) makes it."""
    text = text.replace("_", " ").strip().lower()
    text = re.sub(r"[^\w\- ]", "", text)
    return text.replace(" ", "-")


def esc_text(s: str) -> str:
    """Escape characters that mean something in MDX or Markdown."""
    s = s.replace("\\", "\\\\")
    for ch in "{}*[]`":
        s = s.replace(ch, "\\" + ch)
    s = s.replace("<", "&lt;").replace(">", "&gt;")
    return s


def esc_attr(s: str) -> str:
    return s.replace("&", "&amp;").replace('"', "&quot;")


def inline_code(s: str) -> str:
    s = html.unescape(s)
    fence = "`"
    while fence in s:
        fence += "`"
    pad = " " if s.startswith("`") or s.endswith("`") else ""
    return f"{fence}{pad}{s}{pad}{fence}"


class Page:
    def __init__(self, title: str):
        self.title = title
        self.categories: list[str] = []
        self.display_title: str | None = None
        self.refs: dict[str, str] = {}  # label -> definition (markdown)
        self.ref_order: list[str] = []
        self.anon = 0
        self.blocks: list[str] = []
        self.warnings: list[str] = []

    # ---- placeholders for multi-line output -------------------------------
    def block(self, text: str) -> str:
        self.blocks.append(text)
        return f"\n\n{BLOCK}{len(self.blocks) - 1}{BLOCK}\n\n"

    # ---- node walking -----------------------------------------------------
    def inline(self, code) -> str:
        """Convert wikicode that must stay on one line."""
        out = self.walk(code if hasattr(code, "nodes") else mwp.parse(str(code)))
        return re.sub(r"\s*\n\s*", " ", out).strip()

    def walk(self, code) -> str:
        nodes = list(code.nodes)
        out: list[str] = []
        i = 0
        while i < len(nodes):
            n = nodes[i]
            if isinstance(n, Wikilink):
                # Link trail: [[executor]]s -> "executors"
                trail = ""
                if i + 1 < len(nodes) and isinstance(nodes[i + 1], Text):
                    m = re.match(r"[a-z]+", str(nodes[i + 1].value))
                    if m:
                        trail = m.group(0)
                        nodes[i + 1] = Text(str(nodes[i + 1].value)[len(trail):])
                out.append(self.wikilink(n, trail))
            else:
                out.append(self.node(n))
            i += 1
        return "".join(out)

    def node(self, n) -> str:
        if isinstance(n, Text):
            return esc_text(str(n.value))
        if isinstance(n, Comment):
            return ""
        if isinstance(n, HTMLEntity):
            ch = n.normalize()
            return " " if ch in (" ",) else esc_text(ch) if ch not in (" ",) else "&nbsp;"
        if isinstance(n, ExternalLink):
            url = str(n.url).strip()
            if n.title is None or not str(n.title).strip():
                return f"[{esc_text(url)}]({url})"
            return f"[{self.inline(n.title)}]({url})"
        if isinstance(n, Heading):
            text = self.inline(n.title)
            return self.block("#" * n.level + " " + text)
        if isinstance(n, Template):
            return self.template(n)
        if isinstance(n, Tag):
            return self.tag(n)
        if isinstance(n, Wikilink):
            return self.wikilink(n, "")
        self.warnings.append(f"unhandled node {type(n).__name__}: {str(n)[:60]}")
        return esc_text(str(n))

    def wikilink(self, n: Wikilink, trail: str) -> str:
        target = str(n.title).strip()
        low = target.lower()
        if low.startswith("category:"):
            self.categories.append(target.split(":", 1)[1].strip().replace("_", " "))
            return ""
        if low.startswith(("file:", "image:")):
            self.warnings.append(f"file link dropped: {target}")
            return ""
        text = self.inline(n.text) if n.text is not None else esc_text(target.lstrip(":"))
        return f"[{text}{trail}]({wiki_url(target)})"

    # ---- tags ---------------------------------------------------------------
    def tag(self, n: Tag) -> str:
        name = str(n.tag).lower()
        if name == "b":
            return f"**{self.walk(n.contents)}**"
        if name == "i":
            return f"*{self.walk(n.contents)}*"
        if name == "code":
            return inline_code(strip_nowiki(str(n.contents)))
        if name == "nowiki":
            return esc_text(html.unescape(str(n.contents or "")))
        if name == "ref":
            return self.ref(n)
        if name == "references":
            return ""
        if name in ("syntaxhighlight", "source", "pre"):
            lang = str(n.get("lang").value).strip() if n.has("lang") else ""
            body = strip_nowiki(str(n.contents)).strip("\n")
            if name == "pre":
                body = html.unescape(body)
            if lang == "text":
                lang = ""
            return self.block(f"```{lang}\n{body}\n```")
        if name == "br":
            return "<br />"
        if name == "small":
            return f"<small>{self.walk(n.contents)}</small>"
        if name == "span" and n.has("id") and not str(n.contents or "").strip():
            return ""  # old anchor for renamed headings
        if name == "table":
            return self.block(self.table(n))
        if name in ("li", "dt", "dd"):
            # List markers: mwparserfromhell gives one Tag per marker char.
            return {"*": "\u0001UL", "#": "\u0001OL", ";": "\u0001DT", ":": "\u0001DD"}[n.wiki_markup]
        if name == "div":
            self.warnings.append(f"div unwrapped: {str(n)[:60]}")
            return self.walk(n.contents)
        self.warnings.append(f"tag passed through: <{name}>")
        return self.walk(n.contents) if n.contents else ""

    def ref(self, n: Tag) -> str:
        name = str(n.get("name").value).strip().strip('"') if n.has("name") else None
        if name is None:
            self.anon += 1
            name = f"n{self.anon}"
        label = re.sub(r"[^A-Za-z0-9_.-]+", "-", name).strip("-") or f"n{self.anon}"
        body = self.inline(n.contents) if n.contents and str(n.contents).strip() else ""
        if label not in self.refs:
            self.refs[label] = ""
            self.ref_order.append(label)
        if body:
            if self.refs[label] and self.refs[label] != body:
                self.warnings.append(f"ref {label} defined twice with different text")
            self.refs[label] = self.refs[label] or body
        return f"[^{label}]"

    def table(self, n: Tag) -> str:
        rows: list[list[tuple[bool, str]]] = []
        caption = None

        def cell(c: Tag) -> tuple[bool, str]:
            if c.has("colspan") or c.has("rowspan"):
                self.warnings.append("table span flattened")
            return (str(c.tag) == "th", self.inline(c.contents).replace("|", "\\|"))

        # Cells before the first |- are a row of their own (usually the header).
        loose: list[tuple[bool, str]] = []
        for child in n.contents.nodes:
            if isinstance(child, Tag) and str(child.tag) in ("td", "th"):
                loose.append(cell(child))
            elif isinstance(child, Tag) and str(child.tag) == "tr":
                if loose:
                    rows.append(loose)
                    loose = []
                cells = [cell(c) for c in child.contents.nodes if isinstance(c, Tag) and str(c.tag) in ("td", "th")]
                if cells:
                    rows.append(cells)
            elif isinstance(child, Tag) and str(child.tag) == "caption":
                caption = self.inline(child.contents)
        if loose:
            rows.append(loose)
        if not rows:
            return ""
        width = max(len(r) for r in rows)
        head = rows[0] if all(h for h, _ in rows[0]) else [(True, "")] * width
        body = rows[1:] if head is rows[0] else rows
        fmt = lambda r: "| " + " | ".join(t for _, t in r + [(False, "")] * (width - len(r))) + " |"
        lines = [fmt(head), "|" + " --- |" * width] + [fmt(r) for r in body]
        if caption:
            self.warnings.append("table caption dropped")
        return "\n".join(lines)

    # ---- templates ------------------------------------------------------------
    def params(self, t: Template) -> dict[str, mwp.wikicode.Wikicode]:
        return {str(p.name).strip(): p.value for p in t.params}

    def template(self, t: Template) -> str:
        name = str(t.name).strip()
        if name.upper().startswith("DISPLAYTITLE:"):
            self.display_title = name.split(":", 1)[1].strip()
            return ""
        key = name[:1].upper() + name[1:]
        p = self.params(t)
        s = lambda k: self.inline(p[k]) if k in p and str(p[k]).strip() else ""
        if key == "Cite web":
            parts = []
            if s("author"):
                parts.append(s("author") + ".")
            title = f"[{s('title')}]({str(p['url']).strip()})"
            if s("publisher"):
                title += f". *{s('publisher')}*"
            if s("date"):
                title += f", {s('date')}"
            parts.append(title + ".")
            if s("access-date"):
                parts.append(f"Retrieved {s('access-date')}.")
            return " ".join(parts)
        if key == "Navbox open lakehouse":
            return ""
        if key in ("Infobox software", "Infobox concept"):
            kind = key.split()[1]
            attrs = f' type="{kind}"'
            if s("name") and s("name") != self.title.replace("_", " "):
                attrs += f' name="{esc_attr(html.unescape(str(p["name"]).strip()))}"'
            rows = [f'  <Field name="{k}">{s(k)}</Field>' for k in p if k != "name" and s(k)]
            return self.block(f"<Infobox{attrs}>\n" + "\n".join(rows) + "\n</Infobox>")
        if key == "Verified":
            against = s("2")
            date = str(p["1"]).strip()
            return self.block(f'<Verified date="{date}">{against}</Verified>' if against else f'<Verified date="{date}" />')
        if key == "Status":
            level = str(p["1"]).strip().lower()
            attrs = f' level="{level}"'
            if s("since"):
                attrs += f' since="{esc_attr(html.unescape(str(p["since"]).strip()))}"'
            rest = []
            if s("removed"):
                rest.append(f"Removed in {s('removed')}.")
            if s("replacement"):
                rest.append(f"Use {s('replacement')} instead.")
            if s("note"):
                rest.append(s("note"))
            tail = " ".join(rest) + s("ref")
            return self.block(f"<Status{attrs}>{tail}</Status>" if tail.strip() else f"<Status{attrs} />")
        if key in ("Main", "See also"):
            pages = [str(p[k]).strip() for k in ("1", "2", "3", "4") if k in p and str(p[k]).strip()]
            links = ", ".join(f"[{esc_text(x)}]({wiki_url(x)})" for x in pages)
            label = "See also" if key == "See also" else ("Main articles" if len(pages) > 1 else "Main article")
            return self.block(f"<Hatnote>{label}: {links}</Hatnote>")
        if key in ("Note", "Warning"):
            return self.block(f"<{key}>\n\n{self.walk(p['1']).strip()}\n\n</{key}>")
        if key == "Tl":
            return inline_code("{{" + str(p["1"]).strip() + "}}")
        if key in ("PAGENAME",):
            return esc_text(self.title.replace("_", " "))
        self.warnings.append(f"template passed through as text: {{{{{name}}}}}")
        return esc_text(str(t))


def strip_nowiki(s: str) -> str:
    return re.sub(r"</?nowiki\s*/?>", "", s)


def lists(text: str) -> str:
    """Turn list-marker sentinels at line starts into Markdown lists."""
    out = []
    for line in text.split("\n"):
        m = re.match(r"^((?:\u0001(?:UL|OL|DT|DD))+)\s*(.*)$", line)
        if not m:
            out.append(line)
            continue
        marks = re.findall(r"UL|OL|DT|DD", m.group(1))
        body = m.group(2)
        depth = len(marks) - 1
        last = marks[-1]
        if last in ("DT",):
            out.append(f"**{body}**")
        elif last == "DD" and depth == 0:
            out.append(body)
        else:
            indent = "   " * depth if any(x == "OL" for x in marks[:-1]) else "  " * depth
            out.append(indent + ("1. " if last == "OL" else "- ") + body)
    return "\n".join(out)


def convert(path: Path, title: str) -> tuple[str, Page]:
    page = Page(title)
    code = mwp.parse(path.read_text())
    body = page.walk(code)
    # Magic words
    body = re.sub(r"__[A-Z]+__", "", body)
    body = lists(body)
    # Tidy whitespace, then put blocks back.
    body = re.sub(r"[ \t]+\n", "\n", body)
    body = re.sub(r"\n{3,}", "\n\n", body).strip()
    body = re.sub(BLOCK + r"(\d+)" + BLOCK, lambda m: page.blocks[int(m.group(1))], body)
    if "\u0001" in body:
        page.warnings.append("stray list marker")
    # Footnotes
    notes = []
    for label in page.ref_order:
        if not page.refs[label]:
            page.warnings.append(f"ref {label} used but never defined")
            continue
        notes.append(f"[^{label}]: {page.refs[label]}")
    if notes:
        body += "\n\n" + "\n".join(notes)
    fm: dict[str, object] = {"title": title.replace("_", " ")}
    if page.display_title:
        fm["displayTitle"] = page.display_title
    cats = list(dict.fromkeys(page.categories))
    if cats:
        fm["categories"] = cats
    head = "---\n" + "\n".join(f"{k}: {json.dumps(v, ensure_ascii=False)}" for k, v in fm.items()) + "\n---\n\n"
    return head + body + "\n", page


def trimmed(path: Path, marker: str) -> Path:
    import tempfile
    text = path.read_text().split(marker, 1)[0]
    text = text.replace("This page is generated from the articles' first sentences by <code>scripts/build-glossary.py</code>; edit the article, not this page.",
                        "The site builds this list from the first sentence of each concept article; edit the article, not this page.")
    tmp = Path(tempfile.mkdtemp()) / path.name
    tmp.write_text(text)
    return tmp


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    overwrite = "--overwrite" in sys.argv
    src, dst = Path(args[0]), Path(args[1])
    total_warn = 0
    for f in sorted(src.glob("*/*.wiki")):
        ns, title = f.parent.name, f.stem
        if ns not in KINDS or title in SKIP_TITLES:
            continue
        if ns == "Category" and title.endswith(SKIP_CATEGORY_SUFFIX):
            continue
        if ns == "Open_Lakehouse_Wiki" and title == "Glossary":
            # The site builds the term list from the articles; keep the intro.
            f = trimmed(f, "__NOTOC__")
        target = dst / KINDS[ns] / f"{title}.mdx"
        if target.exists() and not overwrite:
            continue
        out, page = convert(f, title)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(out)
        for w in page.warnings:
            print(f"{ns}/{title}: {w}")
            total_warn += 1
    print(f"done, {total_warn} warnings", file=sys.stderr)


if __name__ == "__main__":
    main()
