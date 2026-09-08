from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET

BASE_URL = "https://gabitcoinasse.com"
SITEMAP = Path("sitemap.xml")


def clean_index_links() -> None:
    pattern = re.compile(r'href=(["\'])((?:\.\./)*)index\.html\1')

    for path in Path(".").rglob("*.html"):
        if ".git" in path.parts:
            continue

        original = path.read_text(encoding="utf-8")

        def repl(match: re.Match) -> str:
            quote = match.group(1)
            prefix = match.group(2)
            target = prefix if prefix else "/"
            return f"href={quote}{target}{quote}"

        updated = pattern.sub(repl, original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")


def last_modified(path: Path) -> str | None:
    result = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", str(path)],
        check=False,
        capture_output=True,
        text=True,
    )
    value = result.stdout.strip()
    return value or None


def update_sitemap_lastmod() -> None:
    namespace = "http://www.sitemaps.org/schemas/sitemap/0.9"
    ET.register_namespace("", namespace)
    tree = ET.parse(SITEMAP)
    root = tree.getroot()

    for url_node in root.findall(f"{{{namespace}}}url"):
        loc_node = url_node.find(f"{{{namespace}}}loc")
        if loc_node is None or not loc_node.text:
            continue

        url = loc_node.text.strip()
        if not url.startswith(BASE_URL):
            continue

        relative = url[len(BASE_URL):].strip("/")
        html_path = Path("index.html") if not relative else Path(relative) / "index.html"
        if not html_path.exists():
            continue

        modified = last_modified(html_path)
        if not modified:
            continue

        lastmod_node = url_node.find(f"{{{namespace}}}lastmod")
        if lastmod_node is None:
            lastmod_node = ET.SubElement(url_node, f"{{{namespace}}}lastmod")
        lastmod_node.text = modified

    tree.write(SITEMAP, encoding="utf-8", xml_declaration=True)


if __name__ == "__main__":
    clean_index_links()
    update_sitemap_lastmod()
