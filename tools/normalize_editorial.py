from __future__ import annotations

import html
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STYLE_VERSION = "20260927-rabbit-unified"

# The site uses arrows as typographic marks, never as emoji. iOS/Safari can
# render several Unicode diagonal/boxed arrows as coloured emoji unless their
# presentation is tightly controlled, so we normalise them to plain text
# arrows at deploy time.
ARROW_REPLACEMENTS = {
    "↗️": "→",
    "↗︎": "→",
    "↗": "→",
    "↘️": "→",
    "↘︎": "→",
    "↘": "→",
    "➡️": "→",
    "➡": "→",
    "⬅️": "←",
    "⬅": "←",
    "⬆️": "↑",
    "⬆": "↑",
    "⬇️": "↓",
    "⬇": "↓",
    "⤴️": "↑",
    "⤴": "↑",
    "⤵️": "↓",
    "⤵": "↓",
    "↪️": "→",
    "↪": "→",
    "↩️": "←",
    "↩": "←",
}

MONTHS = {
    "ENERO": 1,
    "FEBRERO": 2,
    "MARZO": 3,
    "ABRIL": 4,
    "MAYO": 5,
    "JUNIO": 6,
    "JULIO": 7,
    "AGOSTO": 8,
    "SEPTIEMBRE": 9,
    "OCTUBRE": 10,
    "NOVIEMBRE": 11,
    "DICIEMBRE": 12,
}


def normalise_arrows(text: str) -> tuple[str, int]:
    count = 0
    for source, target in ARROW_REPLACEMENTS.items():
        hits = text.count(source)
        if hits:
            text = text.replace(source, target)
            count += hits
    text, extra = re.subn(r"([←→↑↓])\ufe0f", r"\1", text)
    return text, count + extra


def bust_shared_css(text: str) -> str:
    return re.sub(
        r'(?P<q>["\'])(?P<path>(?:\.\./)*v1\.css)(?:\?[^"\']*)?(?P=q)',
        lambda match: f'{match.group("q")}{match.group("path")}?v={STYLE_VERSION}{match.group("q")}',
        text,
    )


def plain_text(fragment: str) -> str:
    fragment = re.sub(r"<[^>]+>", "", fragment)
    return html.unescape(fragment).strip()


def article_date(source: str) -> date:
    match = re.search(
        r"<div class=\"article-byline\">.*?<span>(\d{1,2})\s+([A-ZÁÉÍÓÚÑ]+)\s+(\d{4})</span>.*?</div>",
        source,
        flags=re.I | re.S,
    )
    if not match:
        return date.min
    day, month_name, year = match.groups()
    month = MONTHS.get(month_name.upper(), 0)
    if not month:
        return date.min
    try:
        return date(int(year), month, int(day))
    except ValueError:
        return date.min


def clean_rabbit_meta(meta: str) -> str:
    parts = [part.strip() for part in plain_text(meta).split("·") if part.strip()]
    parts = [part for part in parts if part.upper() != "NUEVO"]
    if not parts or parts[0].upper() != "RABBIT HOLE":
        parts.insert(0, "RABBIT HOLE")
    return " · ".join(parts)


def rabbit_articles() -> list[dict[str, str | date]]:
    items: list[dict[str, str | date]] = []
    for path in ROOT.rglob("index.html"):
        if path == ROOT / "index.html":
            continue
        source = path.read_text(encoding="utf-8")
        meta_match = re.search(r'<p class="eyebrow">(.*?)</p>', source, flags=re.I | re.S)
        if not meta_match or "RABBIT HOLE" not in plain_text(meta_match.group(1)).upper():
            continue
        title_match = re.search(r"<h1[^>]*>(.*?)</h1>", source, flags=re.I | re.S)
        if not title_match:
            continue
        route = path.parent.relative_to(ROOT).as_posix() + "/"
        items.append(
            {
                "route": route,
                "title": plain_text(title_match.group(1)).upper(),
                "meta": clean_rabbit_meta(meta_match.group(1)),
                "date": article_date(source),
            }
        )
    items.sort(key=lambda item: (item["date"], item["route"]), reverse=True)
    return items


def rebuild_home_rabbit_hole() -> int:
    path = ROOT / "index.html"
    if not path.exists():
        return 0
    source = path.read_text(encoding="utf-8")
    items = rabbit_articles()[:6]
    if not items:
        return 0
    cards = "".join(
        f'<a href="{html.escape(str(item["route"]), quote=True)}">'
        f'<span class="rabbit-title">{html.escape(str(item["title"]))}</span>'
        f'<small>{html.escape(str(item["meta"]))}</small></a>'
        for item in items
    )
    replacement = f'<div class="rabbit-list">{cards}</div>'
    updated, count = re.subn(
        r'<div class="rabbit-list">.*?</div>',
        replacement,
        source,
        count=1,
        flags=re.I | re.S,
    )
    if count:
        path.write_text(updated, encoding="utf-8")
    return count


def main() -> None:
    arrow_changes = 0
    files_changed = 0
    for path in ROOT.rglob("*.html"):
        if ".git" in path.parts:
            continue
        source = path.read_text(encoding="utf-8")
        updated, count = normalise_arrows(source)
        updated = bust_shared_css(updated)
        if updated != source:
            path.write_text(updated, encoding="utf-8")
            files_changed += 1
            arrow_changes += count

    rabbit_changed = rebuild_home_rabbit_hole()

    index_path = ROOT / "index.html"
    if index_path.exists():
        source = index_path.read_text(encoding="utf-8")
        updated, count = normalise_arrows(source)
        updated = bust_shared_css(updated)
        if updated != source:
            index_path.write_text(updated, encoding="utf-8")
            arrow_changes += count

    print(
        f"Editorial normalisation: {arrow_changes} arrow marks normalised across "
        f"{files_changed} HTML files; Rabbit Hole home block rebuilt={bool(rabbit_changed)}."
    )


if __name__ == "__main__":
    main()
