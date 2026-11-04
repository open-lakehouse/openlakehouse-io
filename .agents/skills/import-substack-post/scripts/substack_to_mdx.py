#!/usr/bin/env python3
"""Draft an MDX blog post from a public Substack article.

Fetches the article, converts the free body to MDX for src/content/posts, and
downloads the cover and inline images next to it at full resolution. The
frontmatter carries the republication fields (originalUrl, originalPublisher)
and the body is wrapped in the site's visible attribution notes.

The output is a draft: it compiles, but figures, unlabeled code blocks, and
TODO placeholders still need a manual pass (see ../SKILL.md).

Usage:
  substack_to_mdx.py <substack-url> <post-dir> [--author <slug>] [--html <file>]

  post-dir  src/content/posts/<category>/<slug>; created if missing.
  --author  author slug in src/content/authors; defaults to the slugified
            Substack author name.
  --html    read a saved copy of the page instead of fetching it.

Standard library only. Network access is needed for the page and the images.
"""
import argparse
import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from html.parser import HTMLParser

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130 Safari/537.36"
)
VOID = {"br", "img", "input", "source", "hr", "path", "polyline", "line", "circle", "rect"}
SKIP_TAGS = {"button", "svg", "form", "input", "picture", "source", "script", "style"}
# Substack renders a code block's language as a bare paragraph before the <pre>.
CODE_LANGS = {
    "bash", "c", "cpp", "css", "go", "html", "http", "java", "javascript", "js",
    "json", "kotlin", "python", "rust", "scala", "shell", "sql", "text", "toml",
    "typescript", "ts", "xml", "yaml",
}
SKIP_CLASSES = ("subscription-widget", "subscribe-widget", "button-wrapper", "captioned-button-wrap", "share-dialog")
BR = "\x00BR\x00"


class Node:
    def __init__(self, tag, attrs, parent=None):
        self.tag = tag
        self.attrs = dict(attrs)
        self.children = []
        self.parent = parent

    @property
    def classes(self):
        return self.attrs.get("class") or ""


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root", [])
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.cur)
        self.cur.children.append(node)
        if tag not in VOID:
            self.cur = node

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        node = self.cur
        while node is not None and node.tag != tag:
            node = node.parent
        if node is not None and node.parent is not None:
            self.cur = node.parent

    def handle_data(self, data):
        self.cur.children.append(data)


def parse(fragment):
    builder = TreeBuilder()
    builder.feed(fragment)
    return builder.root


def text_of(node):
    if isinstance(node, str):
        return node
    return "".join(text_of(c) for c in node.children)


def find_all(node, pred):
    if isinstance(node, str):
        return []
    found = [node] if pred(node) else []
    for child in node.children:
        found.extend(find_all(child, pred))
    return found


def next_tag(node):
    siblings = node.parent.children if node.parent else []
    for sib in siblings[siblings.index(node) + 1:]:
        if isinstance(sib, Node):
            return sib.tag
        if sib.strip():
            return None
    return None


def escape_text(s):
    s = s.replace("\\", "\\\\").replace("<", "&lt;").replace("{", "\\{").replace("}", "\\}")
    return re.sub(r"(?<!\w)\*|\*(?!\w)", r"\\*", s)


def code_span(s):
    return f"`` {s} ``" if "`" in s else f"`{s}`"


def wrap(inner, left, right):
    """Wrap inner in markers, keeping edge whitespace outside so Markdown parses it."""
    core = inner.strip()
    if not core:
        return inner
    lead = inner[: len(inner) - len(inner.lstrip())]
    trail = inner[len(inner.rstrip()):]
    return f"{lead}{left}{core}{right}{trail}"


def original_image_url(url):
    """Substack serves images through a resizing proxy; recover the S3 original."""
    m = re.search(r"(https?%3A%2F%2Fsubstack-post-media\.s3\.amazonaws\.com%2F[^,?\"\s]+)", url)
    return urllib.parse.unquote(m.group(1)) if m else url


class Converter:
    def __init__(self):
        self.figures = []
        self.todos = []
        self.lang = None
        self.seen_text = False

    def inline(self, node):
        if isinstance(node, str):
            return escape_text(node)
        tag = node.tag
        if tag in SKIP_TAGS:
            return ""
        if tag == "br":
            return BR
        if tag == "code":
            return code_span(text_of(node))
        inner = "".join(self.inline(c) for c in node.children)
        if tag in ("strong", "b"):
            return wrap(inner, "**", "**")
        if tag in ("em", "i"):
            return wrap(inner, "_", "_")
        if tag in ("s", "del"):
            return wrap(inner, "~~", "~~")
        if tag == "a":
            if "footnote-anchor" in node.classes:
                return f"[^{text_of(node).strip()}]"
            return wrap(inner, "[", f"]({node.attrs.get('href', '')})")
        return inner

    def todo(self, kind, detail=""):
        self.todos.append(f"{kind}: {detail}".strip(": "))
        return f"{{/* TODO(import): {kind}{' — ' + detail if detail else ''} */}}\n\n"

    def paragraph(self, node):
        s = "".join(self.inline(c) for c in node.children).strip()
        s = re.sub(rf"(\s*{BR}\s*){{2,}}", "\n\n", s)
        s = re.sub(rf"\s*{BR}\s*", "\\\\\n", s)
        return s

    def figure(self, node):
        img = next(iter(find_all(node, lambda n: n.tag == "img")), None)
        link = next(iter(find_all(node, lambda n: n.tag == "a" and "image-link" in n.classes)), None)
        src = (link.attrs.get("href") if link else None) or (img.attrs.get("src") if img else None)
        if not src:
            return self.todo("figure without an image")
        caption_node = next(iter(find_all(node, lambda n: n.tag == "figcaption")), None)
        caption = self.paragraph(caption_node) if caption_node else ""
        self.figures.append({
            "url": original_image_url(src),
            "alt": html.unescape((img.attrs.get("alt") if img else "") or ""),
            "caption": caption,
            "before_text": not self.seen_text,
        })
        return f"\x00FIGURE{len(self.figures) - 1}\x00\n\n"

    def block(self, node, out):
        if isinstance(node, str):
            if node.strip():
                self.seen_text = True
                out.append(escape_text(node.strip()) + "\n\n")
            return
        tag = node.tag
        if tag in SKIP_TAGS or any(c in node.classes for c in SKIP_CLASSES):
            return
        if tag == "figure":
            out.append(self.figure(node))
            return
        if "youtube-wrap" in node.classes:
            attrs = json.loads(html.unescape(node.attrs.get("data-attrs") or "{}") or "{}")
            video = attrs.get("videoId")
            out.append(f'<YouTubeEmbed videoId="{video}" />\n\n' if video else self.todo("YouTube embed without a videoId"))
            return
        if "footnote" in node.classes.split() and tag == "div":
            number = text_of(next(iter(find_all(node, lambda n: "footnote-number" in n.classes)), "")).strip()
            content = next(iter(find_all(node, lambda n: "footnote-content" in n.classes)), None)
            body = " ".join(self.paragraph(p) for p in find_all(content, lambda n: n.tag == "p")) if content else ""
            out.append(f"[^{number}]: {body}\n\n")
            return
        if any(k in node.classes for k in ("embedded-post", "tweet", "instagram", "spotify", "apple-podcast", "digest-post-embed")):
            out.append(self.todo("embed", node.classes))
            return
        if tag == "p":
            label = text_of(node).strip().lower()
            if label in CODE_LANGS and next_tag(node) == "pre":
                self.lang = label
                return
            s = self.paragraph(node)
            if s:
                self.seen_text = True
                out.append(s + "\n\n")
            return
        if re.fullmatch(r"h[1-6]", tag):
            self.seen_text = True
            level = max(2, int(tag[1]))
            out.append("#" * level + " " + self.paragraph(node).replace("\\\n", " ") + "\n\n")
            return
        if tag == "pre":
            self.seen_text = True
            code = text_of(node).rstrip("\n")
            fence = "````" if "```" in code else "```"
            out.append(f"{fence}{self.lang or ''}\n{code}\n{fence}\n\n")
            self.lang = None
            return
        if tag == "blockquote":
            sub = []
            for child in node.children:
                self.block(child, sub)
            body = "".join(sub).strip()
            out.append("\n".join(f"> {line}" if line else ">" for line in body.split("\n")) + "\n\n")
            return
        if tag in ("ul", "ol"):
            n = 1
            for child in node.children:
                if isinstance(child, Node) and child.tag == "li":
                    sub = []
                    for grandchild in child.children:
                        self.block(grandchild, sub)
                    lines = "".join(sub).strip().split("\n")
                    marker = f"{n}." if tag == "ol" else "-"
                    pad = " " * (len(marker) + 1)
                    out.append(f"{marker} {lines[0]}\n" + "".join(f"{pad}{l}\n" if l else "\n" for l in lines[1:]))
                    n += 1
            out.append("\n")
            return
        if tag == "hr":
            out.append("---\n\n")
            return
        for child in node.children:
            self.block(child, out)


def tidy(md):
    # Substack can't link a code span, so one logical link arrives as
    # [text](u) `code` [text](u). Rejoin them into a single link.
    split_link = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)(\s*(?:`[^`]+`\s*)?)\[([^\]]+)\]\(\2\)")
    while True:
        joined = split_link.sub(r"[\1\3\4](\2)", md)
        if joined == md:
            break
        md = joined
    # Bold or italic applied to punctuation alone (**.**) doesn't parse.
    md = re.sub(r"\*\*([.,;:!?]+)\*\*", r"\1", md)
    md = re.sub(r"(?<!\w)_([.,;:!?]+)_(?!\w)", r"\1", md)
    md = re.sub(r"[ \t]+$", "", md, flags=re.M)
    return re.sub(r"\n{3,}", "\n\n", md).strip() + "\n"


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    return data if binary else data.decode("utf-8")


def json_ld(page, kind):
    for m in re.finditer(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', page, re.S):
        try:
            data = json.loads(m.group(1))
        except json.JSONDecodeError:
            continue
        if data.get("@type") == kind:
            return data
    return {}


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def yaml_str(s):
    return json.dumps(s, ensure_ascii=False)


def find_repo_authors(start):
    path = os.path.abspath(start)
    while path != os.path.dirname(path):
        candidate = os.path.join(path, "src", "content", "authors")
        if os.path.isdir(candidate):
            return candidate
        path = os.path.dirname(path)
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("url")
    ap.add_argument("post_dir")
    ap.add_argument("--author")
    ap.add_argument("--html")
    args = ap.parse_args()

    url = args.url.split("?")[0].rstrip("/")
    page = open(args.html, encoding="utf-8").read() if args.html else fetch(url)

    article = json_ld(page, "NewsArticle")
    crumbs = json_ld(page, "BreadcrumbList").get("itemListElement") or []
    title = article.get("headline") or ""
    subtitle = article.get("description") or ""
    date = (article.get("datePublished") or "")[:10]
    author_name = ((article.get("author") or [{}])[0]).get("name", "")
    publisher = crumbs[0]["name"] if crumbs else (re.search(r'og:site_name" content="([^"]+)"', page) or [None, ""])[1]
    publisher_home = crumbs[0]["item"] if crumbs else urllib.parse.urlsplit(url)._replace(path="").geturl()
    cover = original_image_url(((article.get("image") or [{}])[0]).get("url", ""))

    m = re.search(r'<div class="available-content">(.*?)<div class="post-footer', page, re.S)
    if not m:
        sys.exit("Could not find the article body (div.available-content). Is the URL a Substack post?")
    if "paywall" in page[m.end(): m.end() + 5000]:
        print("WARNING: the post is paywalled; only the free section was imported.", file=sys.stderr)

    conv = Converter()
    out = []
    conv.block(parse(m.group(1)), out)
    body = tidy("".join(out))

    os.makedirs(args.post_dir, exist_ok=True)
    imports, written = [], []
    if not cover and conv.figures and conv.figures[0]["before_text"]:
        cover = conv.figures[0]["url"]
    for i, fig in enumerate(conv.figures):
        placeholder = f"\x00FIGURE{i}\x00"
        if fig["url"] == cover and fig["before_text"]:
            body = body.replace(placeholder + "\n\n", "").replace(placeholder, "")
            continue
        ext = os.path.splitext(urllib.parse.urlsplit(fig["url"]).path)[1].lower() or ".jpg"
        name = f"figure-{len(imports) + 1}{ext}"
        var = f"figure{len(imports) + 1}"
        with open(os.path.join(args.post_dir, name), "wb") as fh:
            fh.write(fetch(fig["url"], binary=True))
        written.append(name)
        imports.append(f'import {var} from "./{name}";')
        attrs = f"src={{{var}}} alt={yaml_str(fig['alt'] or f'TODO(import): describe {name}')}"
        if fig["caption"]:
            attrs += f" caption={yaml_str(fig['caption'])}"
        body = body.replace(placeholder, f"<Figure {attrs} />")
        if not fig["alt"]:
            conv.todos.append(f"alt text for {name}")
    if cover:
        ext = os.path.splitext(urllib.parse.urlsplit(cover).path)[1].lower() or ".jpg"
        name = f"thumbnail{'.jpg' if ext == '.jpeg' else ext}"
        with open(os.path.join(args.post_dir, name), "wb") as fh:
            fh.write(fetch(cover, binary=True))
        written.append(name)

    author = args.author or slugify(author_name)
    authors_dir = find_repo_authors(args.post_dir)
    if authors_dir and not os.path.exists(os.path.join(authors_dir, f"{author}.mdx")):
        conv.todos.append(f"author '{author}' has no src/content/authors/{author}.mdx; pass --author or add one")

    frontmatter = "\n".join([
        "---",
        f"title: {yaml_str(title)}",
        f"subtitle: {yaml_str(subtitle)}",
        f"date: {date}",
        f"authors: [{author}]",
        f"excerpt: {yaml_str(subtitle)}",
        "tags: []",
        "include: [blog]",
        "kind: post",
        f"originalUrl: {url}",
        f"originalPublisher: {publisher}",
        "---",
    ])
    head = f"*Originally published by {author_name} on [{publisher}]({url}).*"
    foot = (
        f"---\n\n*This post was originally published by {author_name} as\n"
        f"[“{title}”]({url})\non [{publisher}]({publisher_home}). "
        "Republished here with attribution to the original\nsource.*\n"
    )
    parts = [frontmatter, "\n".join(imports), head, body.rstrip(), foot]
    mdx = "\n\n".join(p for p in parts if p)
    with open(os.path.join(args.post_dir, "index.mdx"), "w", encoding="utf-8") as fh:
        fh.write(mdx)
    written.insert(0, "index.mdx")

    bare_fences = len(re.findall(r"^(?:> )?```$", body, re.M))
    labeled_fences = len(re.findall(r"^(?:> )?```\S+$", body, re.M))
    print(json.dumps({
        "post_dir": args.post_dir,
        "written": written,
        "title": title,
        "date_utc": date,
        "publisher": publisher,
        "author": author,
        "links": len(re.findall(r"\]\(https?://", body)),
        "figures_in_body": [w for w in written if w.startswith("figure-")],
        "unlabeled_code_blocks": (bare_fences - labeled_fences) // 2,
        "todos": conv.todos,
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
