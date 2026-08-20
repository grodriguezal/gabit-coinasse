from __future__ import annotations

import html
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import Table
from docx.text.paragraph import Paragraph


ROOT = Path(__file__).resolve().parents[1]
DOCX = Path(sys.argv[1])


def clean(value: str) -> str:
    return " ".join(value.replace("\xa0", " ").split())


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def iter_blocks(document):
    for child in document.element.body.iterchildren():
        if isinstance(child, CT_P):
            yield "p", Paragraph(child, document)
        elif isinstance(child, CT_Tbl):
            yield "t", Table(child, document)


def paragraph_html(paragraph: Paragraph) -> str:
    rels = paragraph.part.rels
    bits: list[str] = []
    for child in paragraph._p.iterchildren():
        if child.tag == qn("w:r"):
            text = "".join(node.text or "" for node in child.iter(qn("w:t")))
            if text:
                bits.append(html.escape(text))
        elif child.tag == qn("w:hyperlink"):
            text = "".join(node.text or "" for node in child.iter(qn("w:t")))
            rid = child.get(qn("r:id"))
            url = rels[rid].target_ref if rid and rid in rels else ""
            if url:
                bits.append(f'<a href="{html.escape(url, quote=True)}" target="_blank" rel="noopener">{html.escape(text)}</a>')
            else:
                bits.append(html.escape(text))
    return "".join(bits) or html.escape(paragraph.text)


def table_lines(table: Table) -> list[str]:
    lines = []
    for row in table.rows:
        for cell in row.cells:
            for line in cell.text.splitlines():
                if clean(line):
                    lines.append(clean(line))
    return lines


def table_pairs(table: Table) -> dict[str, str]:
    pairs = {}
    for row in table.rows:
        if len(row.cells) >= 2:
            key = clean(row.cells[0].text)
            value = clean(" ".join(cell.text for cell in row.cells[1:]))
            if key:
                pairs[key] = value
    return pairs


doc = Document(DOCX)
blocks = list(iter_blocks(doc))

articles = []
for index, (kind, block) in enumerate(blocks):
    if kind != "p" or block.style.name != "Title" or not clean(block.text):
        continue
    previous = []
    for pkind, pblock in reversed(blocks[max(0, index - 8):index]):
        if pkind == "p" and clean(pblock.text):
            previous.append(clean(pblock.text))
    meta_line = next((x for x in previous if "FINAL DRAFT" in x), "ARTÍCULO · FINAL DRAFT v1.1")
    number = next((x for x in previous if re.fullmatch(r"\d{2}", x)), f"{len(articles)+1:02d}")

    end = len(blocks)
    for cursor in range(index + 1, len(blocks)):
        ckind, cblock = blocks[cursor]
        if ckind == "p" and (cblock.style.name == "Title" or clean(cblock.text) == "EXPLAINERS DE LANZAMIENTO"):
            end = cursor
            break
    segment = blocks[index + 1:end]
    subtitle = ""
    metadata = {}
    for skind, sblock in segment[:12]:
        if skind == "p" and not subtitle and clean(sblock.text):
            subtitle = clean(sblock.text)
        if skind == "t":
            candidate = table_pairs(sblock)
            if "SLUG" in candidate:
                metadata = candidate
                break
    fallback_slugs = {
        "ENTENDER ECONOMÍA NO DEBERÍA REQUERIR APRENDER OTRO IDIOMA": "sobre/manifiesto",
    }
    slug = metadata.get("SLUG", fallback_slugs.get(clean(block.text), "/" + slugify(block.text))).strip("/")
    tags = [x.strip() for x in meta_line.split("·") if x.strip() and "MIN" not in x and "FINAL" not in x]
    articles.append({
        "index": index,
        "end": end,
        "number": number,
        "title": clean(block.text),
        "subtitle": subtitle,
        "meta": meta_line.replace(" · FINAL DRAFT v1.1", ""),
        "tags": tags,
        "slug": slug,
        "metadata": metadata,
        "segment": segment,
    })


title_to_slug = {slugify(a["title"]): a["slug"] for a in articles}
aliases = [
    ("comprar-una-casa", articles[3]["slug"]), ("vivienda", articles[3]["slug"]),
    ("que-cono-es-el-dinero", articles[1]["slug"]), ("que-es-el-dinero", articles[1]["slug"]),
    ("tu-dinero-compra", articles[0]["slug"]), ("inflacion", articles[0]["slug"]),
    ("pedir-100", articles[2]["slug"]), ("tipos", articles[2]["slug"]),
    ("bono", articles[4]["slug"]), ("pais-gastar", articles[5]["slug"]), ("deficit", articles[5]["slug"]),
    ("quien-crea", articles[6]["slug"]), ("oro", articles[7]["slug"]), ("1971", articles[8]["slug"]),
    ("21-millones", articles[9]["slug"]), ("empieza", articles[10]["slug"]), ("manifiesto", articles[11]["slug"]),
]


def resolve_thread(label: str, root_prefix: str) -> tuple[str, bool]:
    key = slugify(label)
    for alias, target in aliases:
        if alias in key:
            return root_prefix + target + "/", True
    return "", False


hero_assets = [
    "assets/library/collages/poder-dinero-master-01.png",
    "assets/money-goods-engraving.webp",
    "assets/library/templates/collage-frame.svg",
    "assets/library/collages/poder-dinero-master-01.png",
    "assets/money-goods-engraving.webp",
    "assets/deficit-collage.webp",
    "assets/library/collages/poder-dinero-master-01.png",
    "assets/money-goods-engraving.webp",
    "assets/nixon-1971.webp",
    "assets/bitcoin-network.webp",
    "assets/library/templates/collage-frame.svg",
    "assets/library/collages/poder-dinero-master-01.png",
]


def nav(root_prefix: str) -> str:
    return f'''<header class="site-header article-header"><a class="wordmark" href="{root_prefix}index.html">GABIT COINASSE</a><nav aria-label="Navegación principal"><a href="{root_prefix}dinero/">Dinero</a><a href="{root_prefix}economia/">Economía</a><a href="{root_prefix}mercados/">Mercados</a><a href="{root_prefix}poder/">Poder</a><a href="{root_prefix}empieza-aqui/">Empieza aquí</a></nav><button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-menu">MENÚ</button></header>'''


def footer(root_prefix: str) -> str:
    return f'''<footer class="site-footer"><a class="wordmark" href="{root_prefix}index.html">GABIT COINASSE</a><p>Entiende el dinero. Entiende el mundo.</p><div><a href="{root_prefix}dinero/">Dinero</a><a href="{root_prefix}economia/">Economía</a><a href="{root_prefix}mercados/">Mercados</a><a href="{root_prefix}poder/">Poder</a><a href="{root_prefix}explainers/">Explainers</a></div><small>Explicamos. No asesoramos. Nada de esto es asesoramiento financiero.</small></footer><nav id="mobile-menu" class="mobile-menu" hidden aria-label="Navegación móvil"><a href="{root_prefix}dinero/">Dinero</a><a href="{root_prefix}economia/">Economía</a><a href="{root_prefix}mercados/">Mercados</a><a href="{root_prefix}poder/">Poder</a><a href="{root_prefix}empieza-aqui/">Empieza aquí</a></nav><script src="{root_prefix}script.js"></script>'''


def render_table(table: Table, root_prefix: str) -> str:
    lines = table_lines(table)
    if not lines:
        return ""
    label, content = lines[0], lines[1:]
    text = " ".join(content)
    if label == "QUÉDATE CON ESTO":
        return f'<aside class="takeaway"><p class="block-label">QUÉDATE CON ESTO</p><h3>{html.escape(text)}</h3></aside>'
    if label == "PEQUEÑO DETALLE":
        return f'<aside class="small-detail"><div><span>↘</span><p class="block-label">PEQUEÑO DETALLE</p></div><p>{html.escape(text)}</p></aside>'
    if label == "ESPERA, ME HE PERDIDO":
        return f'<details class="lost-block" open><summary><span>ESPERA, ME HE PERDIDO</span><b>−</b></summary><div><p>{html.escape(text)}</p></div></details>'
    if label.startswith("DIAGRAMA DE SERVILLETA"):
        title = label.split("—", 1)[-1].strip() if "—" in label else "DIAGRAMA DE SERVILLETA"
        cards = "".join(f'<span>{html.escape(line)}</span>' for line in content)
        return f'<section class="content-diagram"><p class="diagram-label">DIAGRAMA DE SERVILLETA</p><h3>{html.escape(title)}</h3><div class="diagram-parts">{cards}</div></section>'
    if label == "TIRA DEL HILO":
        items = [clean(x) for x in text.split("→") if clean(x)]
        cards = []
        for item in items:
            href, live = resolve_thread(item, root_prefix)
            state = "" if live else ' class="coming-soon" aria-disabled="true"'
            href_attr = f' href="{href}"' if live else ""
            cards.append(f'<a{href_attr}{state}><span>{html.escape(item)}</span><b>→</b></a>')
        return f'<aside class="article-thread"><p class="block-label">TIRA DEL HILO</p><div>{"".join(cards)}</div></aside>'
    return ""


def render_article_body(article, root_prefix: str) -> str:
    output = []
    skipped_subtitle = False
    body_started = False
    in_sources = False
    list_open = False
    for kind, block in article["segment"]:
        if kind == "t":
            pairs = table_pairs(block)
            if "SLUG" in pairs or not table_lines(block):
                continue
            if list_open:
                output.append("</ul>")
                list_open = False
            output.append(render_table(block, root_prefix))
            continue
        text = clean(block.text)
        if not text:
            continue
        if "FINAL DRAFT" in text or re.fullmatch(r"\d{2}", text):
            continue
        if not skipped_subtitle:
            skipped_subtitle = True
            continue
        style = block.style.name
        if style == "Heading 2":
            if list_open:
                output.append("</ul>")
                list_open = False
            if text.startswith("FUENTES PRIMARIAS"):
                in_sources = True
                output.append('<section class="article-sources"><p class="block-label">AUDITABLE, SIEMPRE</p><h2>FUENTES PRIMARIAS</h2>')
            else:
                output.append(f'<h2>{html.escape(text)}</h2>')
        elif style == "Heading 3":
            if list_open:
                output.append("</ul>")
                list_open = False
            output.append(f'<h3 class="body-subhead">{html.escape(text)}</h3>')
        elif style.startswith("List"):
            if not list_open:
                output.append('<ul class="article-list sources-list"' + ('' if in_sources else '') + '>')
                list_open = True
            output.append(f'<li>{paragraph_html(block)}</li>')
        elif text.startswith("↗"):
            if list_open:
                output.append("</ul>")
                list_open = False
            output.append(f'<p class="scribble-note">{html.escape(text)}</p>')
        elif text == "EXPLICAMOS. NO ASESORAMOS.":
            if list_open:
                output.append("</ul>")
                list_open = False
            output.append('<p class="article-disclaimer">EXPLICAMOS. NO ASESORAMOS.</p>')
            if in_sources:
                output.append("</section>")
                in_sources = False
        else:
            if list_open:
                output.append("</ul>")
                list_open = False
            css = "article-lede" if not body_started else ""
            body_started = True
            output.append(f'<p class="{css}">{paragraph_html(block)}</p>')
    if list_open:
        output.append("</ul>")
    if in_sources:
        output.append("</section>")
    return "".join(output)


for idx, article in enumerate(articles):
    target = ROOT / article["slug"]
    target.mkdir(parents=True, exist_ok=True)
    depth = len(Path(article["slug"]).parts)
    root_prefix = "../" * depth
    image = root_prefix + hero_assets[idx]
    body = render_article_body(article, root_prefix)
    canonical = f'https://grodriguezal.github.io/gabit-coinasse/{article["slug"]}/'
    page = f'''<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{html.escape(article['subtitle'], quote=True)}"><link rel="canonical" href="{canonical}"><title>{html.escape(article['title'])} — Gabit Coinasse</title><link rel="stylesheet" href="{root_prefix}styles.css"><link rel="stylesheet" href="{root_prefix}article.css"><link rel="stylesheet" href="{root_prefix}content.css"></head><body class="article-page">{nav(root_prefix)}<main><article><header class="article-hero"><div class="article-hero-copy"><a class="back-link" href="{root_prefix}index.html">← VOLVER</a><p class="eyebrow">{html.escape(article['meta'])}</p><h1>{html.escape(article['title'])}</h1><p class="article-deck">{html.escape(article['subtitle'])}</p><div class="article-byline"><span>GABIT COINASSE</span><span>V0 · AGOSTO 2026</span></div></div><figure class="article-lead-art"><img src="{image}" alt="Recurso editorial para {html.escape(article['title'], quote=True)}"><figcaption>{html.escape(article['number'])} ↗</figcaption></figure></header><div class="article-layout"><aside class="article-rail"><span>{article['number']}</span><div class="rail-line"><i></i></div><span>V0</span></aside><div class="article-body">{body}</div></div></article></main>{footer(root_prefix)}</body></html>'''
    (target / "index.html").write_text(page, encoding="utf-8")


# Explainers
explainers = []
active = False
current = None
for kind, block in blocks:
    if kind == "p" and clean(block.text) == "EXPLAINERS DE LANZAMIENTO":
        active = True
        continue
    if not active:
        continue
    if kind == "p" and clean(block.text) == "RABBIT HOLES — COLA DE FASE 2":
        break
    if kind == "p" and block.style.name == "Heading 2" and re.match(r"\d{2}\s+", clean(block.text)):
        number, name = re.match(r"(\d{2})\s+(.+)", clean(block.text)).groups()
        current = {"number": number, "name": name, "question": "", "plain": "", "example": "", "detail": "", "deep": ""}
        explainers.append(current)
    elif current and kind == "p":
        text = clean(block.text)
        if not text:
            continue
        if block.style.name == "Normal" and not current["question"]:
            current["question"] = text
        elif text.startswith("EJEMPLO"):
            current["example"] = text
        elif text.startswith("PROFUNDIZA"):
            current["deep"] = text
    elif current and kind == "t":
        lines = table_lines(block)
        if lines and lines[0] == "SIN JERGA":
            current["plain"] = " ".join(lines[1:])
        elif lines and lines[0] == "PEQUEÑO DETALLE":
            current["detail"] = " ".join(lines[1:])

explainer_targets = [articles[0]["slug"], articles[4]["slug"], articles[2]["slug"], articles[5]["slug"], "", "", articles[7]["slug"], articles[1]["slug"]]
for i, item in enumerate(explainers):
    slug = slugify(item["name"])
    target = ROOT / "explainers" / slug
    target.mkdir(parents=True, exist_ok=True)
    deep = f'<a class="button button-dark" href="../../{explainer_targets[i]}/">PROFUNDIZAR →</a>' if explainer_targets[i] else '<span class="phase-label">AMPLIACIÓN EN FASE 2</span>'
    page = f'''<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{html.escape(item['plain'], quote=True)}"><title>{html.escape(item['name'].title())} explicado — Gabit Coinasse</title><link rel="stylesheet" href="../../styles.css"><link rel="stylesheet" href="../../content.css"></head><body>{nav('../../')}<main class="explainer-page"><a class="back-link" href="../">← EXPLAINERS</a><p class="eyebrow">EXPLAINER · 2 MIN</p><span class="explainer-number">{item['number']}</span><h1>{html.escape(item['name'])}</h1><p class="explainer-question">{html.escape(item['question'])}</p><section class="plain-block"><p class="block-label">SIN JERGA</p><h2>{html.escape(item['plain'])}</h2></section><section class="example-block"><p class="block-label">EJEMPLO</p><p>{html.escape(item['example'].replace('EJEMPLO — ', ''))}</p></section><aside class="small-detail"><div><span>↘</span><p class="block-label">PEQUEÑO DETALLE</p></div><p>{html.escape(item['detail'])}</p></aside>{deep}</main>{footer('../../')}</body></html>'''
    (target / "index.html").write_text(page, encoding="utf-8")


cards = "".join(f'<a href="{slugify(e["name"])}/"><span>{e["number"]}</span><h2>{html.escape(e["name"])}</h2><p>{html.escape(e["question"])}</p><b>→</b></a>' for e in explainers)
(ROOT / "explainers").mkdir(exist_ok=True)
(ROOT / "explainers" / "index.html").write_text(f'''<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Explainers — Gabit Coinasse</title><link rel="stylesheet" href="../styles.css"><link rel="stylesheet" href="../content.css"></head><body>{nav('../')}<main class="hub-page"><header><p class="eyebrow">DICCIONARIO PARA PERSONAS NORMALES</p><h1>EXPLÍCAME ESTA MIERDA.</h1><p>Respuestas permanentes para resolver “¿qué significa esto?” en menos de dos minutos.</p></header><div class="hub-grid explainer-hub">{cards}</div></main>{footer('../')}</body></html>''', encoding="utf-8")


# Territory hubs and complete article index
hub_copy = {
    "dinero": ("DINERO", "Qué es. Quién lo crea. Por qué pierde valor."),
    "economia": ("ECONOMÍA", "Cómo el crédito, la producción y las decisiones terminan entrando en tu vida."),
    "mercados": ("MERCADOS", "Dónde las promesas, el riesgo y el tiempo adquieren precio."),
    "poder": ("PODER", "Gobiernos, bancos centrales y quién termina pagando."),
    "historia": ("HISTORIA", "El sistema actual no apareció por accidente. Tampoco apareció de una vez."),
}
for hub, (title, intro) in hub_copy.items():
    matching = [a for a in articles[:10] if hub.upper() in a["tags"]]
    cards = "".join(f'<a href="../{a["slug"]}/"><span>{html.escape(a["meta"])}</span><h2>{html.escape(a["title"])}</h2><p>{html.escape(a["subtitle"])}</p><b>→</b></a>' for a in matching)
    target = ROOT / hub
    target.mkdir(exist_ok=True)
    (target / "index.html").write_text(f'''<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} — Gabit Coinasse</title><link rel="stylesheet" href="../styles.css"><link rel="stylesheet" href="../content.css"></head><body>{nav('../')}<main class="hub-page"><header><p class="eyebrow">TERRITORIO</p><h1>{title}</h1><p>{html.escape(intro)}</p></header><div class="hub-grid">{cards}</div></main>{footer('../')}</body></html>''', encoding="utf-8")

all_cards = "".join(f'<a href="../{a["slug"]}/"><span>{a["number"]} · {html.escape(a["meta"])}</span><h2>{html.escape(a["title"])}</h2><p>{html.escape(a["subtitle"])}</p><b>→</b></a>' for a in articles)
(ROOT / "articulos").mkdir(exist_ok=True)
(ROOT / "articulos" / "index.html").write_text(f'''<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Todos los artículos — Gabit Coinasse</title><link rel="stylesheet" href="../styles.css"><link rel="stylesheet" href="../content.css"></head><body>{nav('../')}<main class="hub-page"><header><p class="eyebrow">V0 · CONTENIDO FUNDACIONAL</p><h1>TODO EMPIEZA CON UNA PREGUNTA.</h1><p>Doce piezas para entender el dinero, el crédito, el poder y las reglas del sistema.</p></header><div class="hub-grid">{all_cards}</div></main>{footer('../')}</body></html>''', encoding="utf-8")

subprocess.run([sys.executable, str(ROOT / "tools" / "upgrade_v1.py")], check=True)
print(f"Generated and upgraded {len(articles)} articles, {len(explainers)} explainers and {len(hub_copy)+2} indexes to V1")
