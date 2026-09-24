from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET

BASE_URL = "https://gabitcoinasse.com"
SITEMAP = Path("sitemap.xml")
CHATGPT_ARTIFACT_PATTERN = re.compile(r"[A-Za-z_]+.*?", re.DOTALL)

# Gabit puede ser irreverente sin convertir la grosería en una muletilla.
# "demonios" se conserva deliberadamente; coño/mierda/puta/joder/carajo no.
TONE_RULES = [
    (r"\bni\s+puta\s+idea\b", "ni idea"),
    (r"\bqué\s+coño\s+es\b", "qué es realmente"),
    (r"\ba\s+quién\s+coño\b", "a quién"),
    (r"\bquién\s+coño\b", "quién"),
    (r"\bpor\s+qué\s+coño\b", "por qué"),
    (r"\bqué\s+coño\b", "qué"),
    (r"\bcómo\s+coño\b", "cómo"),
    (r"\bdónde\s+coño\b", "dónde"),
    (r"\besta\s+mierda\b", "esto"),
    (r"\beste\s+mierda\b", "esto"),
    (r"\bla\s+mierda\b", "esto"),
    (r"\bcoño\b", ""),
    (r"\bmierda\b", ""),
    (r"\bputa\b", ""),
    (r"\bjoder\b", ""),
    (r"\bcarajo\b", ""),
]


def html_files():
    for path in Path(".").rglob("*.html"):
        if ".git" not in path.parts:
            yield path


def match_case(replacement: str, matched: str) -> str:
    if matched.isupper():
        return replacement.upper()
    if matched[:1].isupper():
        return replacement[:1].upper() + replacement[1:]
    return replacement


def clean_editorial_tone() -> None:
    changed = []
    for path in html_files():
        original = path.read_text(encoding="utf-8")
        updated = original
        for pattern, replacement in TONE_RULES:
            updated = re.sub(
                pattern,
                lambda m, r=replacement: match_case(r, m.group(0)),
                updated,
                flags=re.IGNORECASE,
            )
        updated = re.sub(r" {2,}", " ", updated)
        updated = re.sub(r"\s+([?.!,;:])", r"\1", updated)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed.append(str(path))
    if changed:
        print(f"Editorial tone normalized in {len(changed)} HTML files")


def clean_index_links() -> None:
    pattern = re.compile(r'href=(["\'])((?:\.\./)*)index\.html\1')
    for path in html_files():
        original = path.read_text(encoding="utf-8")
        def repl(match):
            quote, prefix = match.group(1), match.group(2)
            target = prefix if prefix else "/"
            return f"href={quote}{target}{quote}"
        updated = pattern.sub(repl, original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")


def clean_chatgpt_artifacts() -> None:
    cleaned = []
    for path in html_files():
        original = path.read_text(encoding="utf-8")
        updated, replacements = CHATGPT_ARTIFACT_PATTERN.subn("", original)
        if replacements:
            path.write_text(updated, encoding="utf-8")
            cleaned.append((path, replacements))
    residual = []
    for path in html_files():
        text = path.read_text(encoding="utf-8")
        if "" in text or "" in text:
            residual.append(str(path))
    if residual:
        raise RuntimeError("Residual ChatGPT citation markers found in: " + ", ".join(residual))


def last_modified(path: Path):
    result = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", str(path)],
        check=False, capture_output=True, text=True,
    )
    return result.stdout.strip() or None


def update_sitemap_lastmod() -> None:
    if not SITEMAP.exists():
        return
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
    clean_chatgpt_artifacts()
    clean_editorial_tone()
    clean_index_links()
    update_sitemap_lastmod()
