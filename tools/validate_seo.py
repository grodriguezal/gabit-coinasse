"""Publication gate: canonical URLs, crawlable links, metadata, schema and sitemap."""
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
from collections import Counter
from datetime import date
import json
import re
import xml.etree.ElementTree as ET
from enhance_seo import BASE, Tags, page_url, plain

def validate():
    errors = []; indexable = {}; titles = []; descriptions = []; incoming = Counter()
    for path in sorted(Path('.').rglob('*.html')):
        if '.git' in path.parts: continue
        text = path.read_text(); tags = Tags(text).tags
        url = page_url(path) if path.name == 'index.html' else BASE + '/' + str(path)
        noindex = any(t == 'meta' and a.get('name') == 'robots' and 'noindex' in a.get('content', '') for t, a in tags)
        for tag, attrs in tags:
            value = attrs.get('href') if tag in ('a', 'link') else attrs.get('src') if tag in ('img', 'script') else None
            if not value: continue
            target = urlparse(urljoin(url, value))
            if target.netloc != 'gabitcoinasse.com': continue
            file = Path(unquote(target.path.lstrip('/')))
            if target.path.endswith('/'): file = file / 'index.html'
            if not file.is_file(): errors.append(f'{path}: missing resource {value}')
            if tag == 'a' and not noindex and target.path != urlparse(url).path: incoming[BASE + target.path] += 1
        if noindex: continue
        indexable[url] = path
        canonical = [a.get('href') for t, a in tags if t == 'link' and a.get('rel') == 'canonical']
        if canonical != [url]: errors.append(f'{path}: canonical mismatch {canonical}')
        if sum(t == 'h1' for t, a in tags) != 1: errors.append(f'{path}: expected one H1')
        title = re.findall(r'<title>(.*?)</title>', text, re.S)
        if len(title) != 1 or not plain(title[0]): errors.append(f'{path}: missing/duplicate title')
        else: titles.append(plain(title[0]))
        desc = [a.get('content') for t, a in tags if t == 'meta' and a.get('name') == 'description']
        if len(desc) != 1 or not desc[0]: errors.append(f'{path}: missing/duplicate description')
        else: descriptions.append(desc[0])
        schemas = re.findall(r'<script\b[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', text, re.S)
        if len(schemas) != 1: errors.append(f'{path}: expected one schema graph')
        for schema in schemas:
            try:
                graph = json.loads(schema)['@graph']
                for node in graph:
                    if node['@type'] == 'Article':
                        h1 = plain(re.search(r'<h1\b[^>]*>(.*?)</h1>', text, re.S)[1])
                        if node['headline'] != h1: errors.append(f'{path}: schema headline differs from visible H1')
                        if node['mainEntityOfPage']['@id'] != url + '#webpage': errors.append(f'{path}: schema canonical mismatch')
                        if 'datePublished' in node: date.fromisoformat(node['datePublished'])
                    if node['@type'] == 'BreadcrumbList':
                        items = node['itemListElement']
                        if [x['position'] for x in items] != list(range(1, len(items)+1)): errors.append(f'{path}: invalid breadcrumb positions')
            except (ValueError, KeyError, TypeError) as exc: errors.append(f'{path}: invalid schema {exc}')
        for t, a in tags:
            if t == 'img':
                if 'alt' not in a: errors.append(f'{path}: image has no alt attribute')
                if a.get('src', '').endswith(('.webp', '.png')) and (not a.get('width') or not a.get('height')): errors.append(f'{path}: missing image dimensions')
                if a.get('fetchpriority') == 'high' and a.get('loading') == 'lazy': errors.append(f'{path}: priority image lazy loaded')
        if '' in text or '' in text: errors.append(f'{path}: citation artifact')
    for label, values in [('title', titles), ('description', descriptions)]:
        errors += [f'Duplicate {label}: {value}' for value, count in Counter(values).items() if count > 1]
    sitemap = ET.parse('sitemap.xml')
    urls = [n.text for n in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    if len(urls) != len(set(urls)): errors.append('Duplicate sitemap URLs')
    if set(urls) != set(indexable): errors.append(f'Sitemap mismatch: {set(urls) ^ set(indexable)}')
    for url in indexable:
        if url != BASE + '/' and not incoming[url]: errors.append(f'No crawlable incoming links: {url}')
    if errors: raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(indexable)} indexable pages, unique metadata, valid schema, internal resources, incoming links and sitemap')

if __name__ == '__main__': validate()
