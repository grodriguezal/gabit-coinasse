from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET

BASE_URL = "https://gabitcoinasse.com"
SITEMAP = Path("sitemap.xml")
CHATGPT_ARTIFACT_PATTERN = re.compile(r"[A-Za-z_]+.*?", re.DOTALL)

TONE_RULES = [
    (r"\bni\s+puta\s+idea\b", "ni idea"), (r"\bqué\s+coño\s+es\b", "qué es realmente"),
    (r"\ba\s+quién\s+coño\b", "a quién"), (r"\bquién\s+coño\b", "quién"),
    (r"\bpor\s+qué\s+coño\b", "por qué"), (r"\bqué\s+coño\b", "qué"),
    (r"\bcómo\s+coño\b", "cómo"), (r"\bdónde\s+coño\b", "dónde"),
    (r"\bpor\s+qué\s+carajo\b", "por qué"), (r"\besta\s+mierda\b", "esto"),
    (r"\beste\s+mierda\b", "esto"), (r"\bla\s+mierda\b", "esto"),
    (r"\bcoño\b", ""), (r"\bmierda\b", ""), (r"\bputa\b", ""), (r"\bjoder\b", ""), (r"\bcarajo\b", ""),
]

NEW_POST_PATH = "poder/estado-bienestar-deuda-democracia-futuro/"
NEW_POST_TITLE = "EL ESTADO TE PROMETE EL PRESENTE. ¿QUIÉN PAGA EL FUTURO?"
NEW_POST_MINUTES = 10
NEW_POST_META = f"RABBIT HOLE · PODER · ECONOMÍA · DINERO · {NEW_POST_MINUTES} MIN · NUEVO"
NEW_POST_DECK = "Pensiones, sanidad, impuestos y deuda: el problema no es querer servicios públicos, sino separar políticamente la promesa de su precio."


def html_files():
    for path in Path(".").rglob("*.html"):
        if ".git" not in path.parts: yield path


def match_case(replacement, matched):
    if matched.isupper(): return replacement.upper()
    if matched[:1].isupper(): return replacement[:1].upper() + replacement[1:]
    return replacement


def clean_editorial_tone():
    for path in html_files():
        original = path.read_text(encoding="utf-8"); updated = original
        for pattern, replacement in TONE_RULES:
            updated = re.sub(pattern, lambda m, r=replacement: match_case(r, m.group(0)), updated, flags=re.IGNORECASE)
        updated = re.sub(r" {2,}", " ", updated); updated = re.sub(r"\s+([?.!,;:])", r"\1", updated)
        if updated != original: path.write_text(updated, encoding="utf-8")


def integrate_latest_post():
    label_pattern = re.compile(r"RABBIT HOLE · PODER · ECONOMÍA · DINERO · \d+ MIN(?: · NUEVO)?")
    for path in [Path(NEW_POST_PATH) / "index.html", Path("index.html"), Path("articulos/index.html"), Path("poder/index.html")]:
        if path.exists():
            text = path.read_text(encoding="utf-8")
            if NEW_POST_TITLE in text or path == Path(NEW_POST_PATH) / "index.html":
                text = label_pattern.sub(lambda m: NEW_POST_META if "NUEVO" in m.group(0) else f"RABBIT HOLE · PODER · ECONOMÍA · DINERO · {NEW_POST_MINUTES} MIN", text)
                path.write_text(text, encoding="utf-8")

    home = Path("index.html")
    if home.exists():
        text = home.read_text(encoding="utf-8")
        if NEW_POST_PATH not in text:
            card = f'<a href="{NEW_POST_PATH}">{NEW_POST_TITLE}<small>{NEW_POST_META}</small></a>'
            marker = '<div class="rabbit-list">'
            if marker in text: text = text.replace(marker, marker + card, 1)
        home.write_text(text, encoding="utf-8")

    archive = Path("articulos/index.html")
    if archive.exists():
        text = archive.read_text(encoding="utf-8"); archive_href = "../" + NEW_POST_PATH
        if archive_href not in text:
            card = f'<a href="{archive_href}"><span>{NEW_POST_META}</span><h2>{NEW_POST_TITLE}</h2><p>{NEW_POST_DECK}</p><b>→</b></a>'
            marker = '<div class="hub-grid" data-hub-grid>'
            if marker in text: text = text.replace(marker, marker + card, 1)
        archive.write_text(text, encoding="utf-8")


def clean_index_links():
    pattern = re.compile(r'href=(["\'])((?:\.\./)*)index\.html\1')
    for path in html_files():
        original = path.read_text(encoding="utf-8")
        updated = pattern.sub(lambda m: f'href={m.group(1)}{m.group(2) if m.group(2) else "/"}{m.group(1)}', original)
        if updated != original: path.write_text(updated, encoding="utf-8")


def clean_chatgpt_artifacts():
    for path in html_files():
        original = path.read_text(encoding="utf-8"); updated = CHATGPT_ARTIFACT_PATTERN.sub("", original)
        if updated != original: path.write_text(updated, encoding="utf-8")
    residual = [str(p) for p in html_files() if "" in p.read_text(encoding="utf-8") or "" in p.read_text(encoding="utf-8")]
    if residual: raise RuntimeError("Residual ChatGPT citation markers found in: " + ", ".join(residual))


def last_modified(path):
    result = subprocess.run(["git", "log", "-1", "--format=%cs", "--", str(path)], check=False, capture_output=True, text=True)
    return result.stdout.strip() or None


def update_sitemap_lastmod():
    if not SITEMAP.exists(): return
    ns = "http://www.sitemaps.org/schemas/sitemap/0.9"; ET.register_namespace("", ns)
    tree = ET.parse(SITEMAP); root = tree.getroot()
    for node in root.findall(f"{{{ns}}}url"):
        loc = node.find(f"{{{ns}}}loc")
        if loc is None or not loc.text or not loc.text.startswith(BASE_URL): continue
        rel = loc.text[len(BASE_URL):].strip("/"); html = Path("index.html") if not rel else Path(rel) / "index.html"
        if not html.exists(): continue
        modified = last_modified(html)
        if not modified: continue
        lm = node.find(f"{{{ns}}}lastmod")
        if lm is None: lm = ET.SubElement(node, f"{{{ns}}}lastmod")
        lm.text = modified
    tree.write(SITEMAP, encoding="utf-8", xml_declaration=True)


if __name__ == "__main__":
    clean_chatgpt_artifacts(); clean_editorial_tone(); integrate_latest_post(); clean_index_links(); update_sitemap_lastmod()
