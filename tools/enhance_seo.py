"""Idempotent SEO enrichment. Standard library only; preserves existing layout markup."""
from pathlib import Path
from html import escape, unescape
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
import json
import re
import struct
import xml.etree.ElementTree as ET

BASE = 'https://gabitcoinasse.com'
NAMES = {'dinero': 'Dinero', 'economia': 'Economía', 'mercados': 'Mercados', 'poder': 'Poder', 'explainers': 'Explainers', 'articulos': 'Todos los artículos'}
MONTHS = dict(zip('ENERO FEBRERO MARZO ABRIL MAYO JUNIO JULIO AGOSTO SEPTIEMBRE OCTUBRE NOVIEMBRE DICIEMBRE'.split(), range(1, 13)))

class Tags(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.tags = []; self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

def plain(text):
    return unescape(re.sub('<[^>]+>', '', text)).strip()

def page_url(path):
    return BASE + '/' + (path.parent.as_posix().strip('./') + '/' if path.parent != Path('.') else '')

def dimensions(path):
    if not path.is_file(): return None
    data = path.read_bytes()
    if data[:8] == b'\x89PNG\r\n\x1a\n': return struct.unpack('>II', data[16:24])
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        pos = 12
        while pos + 8 < len(data):
            kind, size = data[pos:pos+4], int.from_bytes(data[pos+4:pos+8], 'little')
            b = data[pos+8:pos+8+size]
            if kind == b'VP8X': return 1 + int.from_bytes(b[4:7], 'little'), 1 + int.from_bytes(b[7:10], 'little')
            if kind == b'VP8 ' and b[3:6] == b'\x9d\x01\x2a': return int.from_bytes(b[6:8], 'little') & 16383, int.from_bytes(b[8:10], 'little') & 16383
            if kind == b'VP8L' and b[0] == 47:
                bits = int.from_bytes(b[1:5], 'little'); return (bits & 16383) + 1, ((bits >> 14) & 16383) + 1
            pos += 8 + size + size % 2
    return None

def enrich(path, overrides):
    text = path.read_text()
    text = re.sub(r'\n?<!-- SEO:START -->.*?<!-- SEO:END -->\n?', '', text, flags=re.S)
    tags = Tags(text).tags
    if any(t == 'meta' and a.get('name') == 'robots' and 'noindex' in a.get('content', '') for t, a in tags): return None
    url = page_url(path)
    config = overrides.get(str(path), {})
    if 'title' in config:
        text = re.sub(r'<title>.*?</title>', '<title>' + escape(config['title']) + '</title>', text, flags=re.S)
    if 'description' in config:
        text = re.sub(r'<meta\s+name=["\']description["\'][^>]*>', '<meta name="description" content="' + escape(config['description'], quote=True) + '">', text)
    title = plain(re.search(r'<title>(.*?)</title>', text, re.S)[1])
    h1 = re.search(r'<h1\b[^>]*>(.*?)</h1>', text, re.S)
    headline = plain(h1[1]) if h1 else title
    tags = Tags(text).tags
    description = next(a['content'] for t, a in tags if t == 'meta' and a.get('name') == 'description')
    is_article = 'article-page' in next((a.get('class', '') for t, a in tags if t == 'body'), '') and path.parts[0] not in ('sobre', 'empieza-aqui')
    image_count = 0
    lead_image = None
    def optimize_image(match):
        nonlocal image_count, lead_image
        original = match[0]; attrs = Tags(original).tags[0][1]
        src = urljoin(url, attrs.get('src', ''))
        if urlparse(src).netloc != 'gabitcoinasse.com': return original
        size = dimensions(Path(urlparse(src).path.lstrip('/')))
        additions = {}
        if size:
            additions.update(width=str(size[0]), height=str(size[1]))
        if image_count == 0:
            lead_image = {'url': src, 'alt': attrs.get('alt', ''), 'size': size}
            additions.update(fetchpriority='high', loading='eager')
        else: additions['loading'] = 'lazy'
        additions['decoding'] = 'async'; image_count += 1
        for key, value in additions.items():
            if key not in attrs: original = original[:-1] + f' {key}="{value}">'
        return original
    text = re.sub(r'<img\b[^>]*>', optimize_image, text)
    website = {'@type': 'WebSite', '@id': BASE + '/#website', 'url': BASE + '/', 'name': 'Gabit Coinasse', 'inLanguage': 'es'}
    page_type = 'AboutPage' if path.parts[0] == 'sobre' else 'CollectionPage' if len(path.parts) <= 2 and path.parts[0] in NAMES else 'WebPage'
    page = {'@type': page_type, '@id': url + '#webpage', 'url': url, 'name': title, 'description': description, 'inLanguage': 'es', 'isPartOf': {'@id': website['@id']}}
    graph = [website, page]
    if is_article:
        article = {'@type': 'Article', '@id': url + '#article', 'headline': headline, 'description': description, 'url': url, 'mainEntityOfPage': {'@id': page['@id']}, 'inLanguage': 'es', 'author': {'@type': 'Person', 'name': 'Gabit Coinasse'}, 'publisher': {'@type': 'Organization', 'name': 'Gabit Coinasse', 'url': BASE + '/'}}
        if lead_image: article['image'] = [lead_image['url']]
        byline = re.search(r'<div class="article-byline">(.*?)</div>', text, re.S)
        date = re.search(r'(\d{1,2})\s+(?:DE\s+)?(' + '|'.join(MONTHS) + r')\s+(?:DE\s+)?(20\d{2})', plain(byline[1]).upper()) if byline else None
        if date: article['datePublished'] = f'{date[3]}-{MONTHS[date[2]]:02}-{int(date[1]):02}'
        graph.append(article)
    if path.parts[0] == 'explainers' and len(path.parts) == 3:
        graph.append({'@type': 'DefinedTerm', '@id': url + '#term', 'name': headline, 'description': description, 'url': url, 'inDefinedTermSet': BASE + '/explainers/'})
    if url != BASE + '/':
        crumbs = [{'@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': BASE + '/'}]
        if len(path.parts) == 3 and path.parts[0] in NAMES:
            crumbs.append({'@type': 'ListItem', 'position': 2, 'name': NAMES[path.parts[0]], 'item': BASE + '/' + path.parts[0] + '/'})
        crumbs.append({'@type': 'ListItem', 'position': len(crumbs) + 1, 'name': headline, 'item': url})
        graph.append({'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': crumbs})
        page['breadcrumb'] = {'@id': url + '#breadcrumb'}
    meta = [('property', 'og:type', 'article' if is_article else 'website'), ('property', 'og:locale', 'es_ES'), ('property', 'og:site_name', 'Gabit Coinasse'), ('property', 'og:title', title), ('property', 'og:description', description), ('property', 'og:url', url), ('name', 'twitter:card', 'summary_large_image' if lead_image else 'summary'), ('name', 'twitter:title', title), ('name', 'twitter:description', description)]
    if lead_image:
        meta += [('property', 'og:image', lead_image['url']), ('property', 'og:image:alt', lead_image['alt']), ('name', 'twitter:image', lead_image['url']), ('name', 'twitter:image:alt', lead_image['alt'])]
        if lead_image['size']:
            meta += [('property', 'og:image:width', str(lead_image['size'][0])), ('property', 'og:image:height', str(lead_image['size'][1]))]
    existing_meta = {a.get('name', a.get('property')) for t, a in tags if t == 'meta'}
    extra = ['<!-- SEO:START -->']
    if 'robots' not in existing_meta: extra.append('<meta name="robots" content="index,follow,max-image-preview:large">')
    for kind, name, value in meta:
        if name not in existing_meta: extra.append(f'<meta {kind}="{name}" content="{escape(value, quote=True)}">')
    extra.append('<script type="application/ld+json">' + json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c') + '</script>')
    extra.append('<!-- SEO:END -->')
    text = text.replace('</head>', '\n' + '\n'.join(extra) + '\n</head>')
    if text != path.read_text(): path.write_text(text)
    return url

def main():
    overrides = json.loads(Path('tools/seo-metadata.json').read_text())
    urls = [url for p in sorted(Path('.').rglob('index.html')) if '.git' not in p.parts and (url := enrich(p, overrides))]
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'; ET.register_namespace('', ns)
    # Rebuild from actual canonical, indexable pages; lastmod is added by prepare_seo.
    root = ET.Element('{' + ns + '}urlset')
    for url in sorted(urls):
        node = ET.SubElement(root, '{' + ns + '}url'); ET.SubElement(node, '{' + ns + '}loc').text = url
    ET.indent(root, space='  ')
    ET.ElementTree(root).write('sitemap.xml', encoding='utf-8', xml_declaration=True)
    print(f'SEO enriched: {len(urls)} indexable pages')

if __name__ == '__main__': main()
