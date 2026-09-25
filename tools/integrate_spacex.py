from pathlib import Path
import xml.etree.ElementTree as ET
P='mercados/spacex-ipo-valuacion-starlink-starship/'; T='SPACEX VALE CASI $2 BILLONES. ¿QUÉ ESTÁS COMPRANDO REALMENTE?'; M='RABBIT HOLE · MERCADOS · ECONOMÍA · PODER · 10 MIN · NUEVO'; D='Starlink ya es una máquina de dinero. Starship sigue siendo una apuesta. La IA consume capital a una escala brutal. A casi $2 billones, el precio exige que varias cosas extraordinarias salgan bien a la vez.'
def add(f,m,h):
 p=Path(f)
 if not p.exists(): return
 s=p.read_text(encoding='utf-8')
 if P not in s and m in s: p.write_text(s.replace(m,m+h,1),encoding='utf-8')
def main():
 add('index.html','<div class="rabbit-list">',f'<a href="{P}">{T}<small>{M}</small></a>')
 add('articulos/index.html','<div class="hub-grid" data-hub-grid>',f'<a href="../{P}"><span>{M}</span><h2>{T}</h2><p>{D}</p><b>→</b></a>')
 add('mercados/index.html','<div class="hub-grid" data-hub-grid>',f'<a href="../{P}"><span>{M}</span><h2>{T}</h2><p>{D}</p><b>→</b></a>')
 sm=Path('sitemap.xml'); ns='http://www.sitemaps.org/schemas/sitemap/0.9'; ET.register_namespace('',ns); tree=ET.parse(sm); root=tree.getroot(); u='https://gabitcoinasse.com/'+P
 if not any(n.find(f'{{{ns}}}loc') is not None and n.find(f'{{{ns}}}loc').text==u for n in root.findall(f'{{{ns}}}url')):
  n=ET.SubElement(root,f'{{{ns}}}url'); ET.SubElement(n,f'{{{ns}}}loc').text=u; ET.SubElement(n,f'{{{ns}}}lastmod').text='2026-09-25'; tree.write(sm,encoding='utf-8',xml_declaration=True)
if __name__=='__main__': main()
