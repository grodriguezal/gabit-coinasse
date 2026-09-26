from pathlib import Path
import xml.etree.ElementTree as ET
P='dinero/tokenizacion-activos-agentes-liquidez/'
T='¿Y SI $200 BILLONES DE PATRIMONIO PUDIERAN MOVERSE COMO DINERO?'
M='RABBIT HOLE · DINERO · MERCADOS · ECONOMÍA · 10 MIN · NUEVO'
D='Tokenización y agentes de IA pueden hacer que una montaña de patrimonio sea más programable y movilizable. Eso promete eficiencia. También apalancamiento y riesgos nuevos.'
def add(f,marker,html):
 p=Path(f)
 if not p.exists(): return
 s=p.read_text(encoding='utf-8')
 if P not in s and marker in s: p.write_text(s.replace(marker,marker+html,1),encoding='utf-8')
def inbound(f,marker,html):
 p=Path(f)
 if not p.exists(): return
 s=p.read_text(encoding='utf-8')
 if 'tokenizacion-activos-agentes-liquidez' not in s and marker in s: p.write_text(s.replace(marker,html+marker,1),encoding='utf-8')
def main():
 add('index.html','<div class="rabbit-list">',f'<a href="{P}">{T}<small>{M}</small></a>')
 add('articulos/index.html','<div class="hub-grid" data-hub-grid>',f'<a href="../{P}"><span>{M}</span><h2>{T}</h2><p>{D}</p><b>→</b></a>')
 add('dinero/index.html','<div class="hub-grid" data-hub-grid>',f'<a href="../{P}"><span>{M}</span><h2>{T}</h2><p>{D}</p><b>→</b></a>')
 inbound('dinero/colateral-maquina-credito-sistema-financiero/index.html','</div></div></article>','<p>El siguiente salto puede ser que ese colateral se vuelva programable: <a href="../tokenizacion-activos-agentes-liquidez/">qué ocurre si tokenización y agentes de IA pueden movilizar activos casi a velocidad de software</a>.</p>')
 inbound('dinero/oro-tokenizado-vs-bitcoin/index.html','</div></div></article>','<p>La pregunta se vuelve mucho mayor cuando no hablamos solo de oro: <a href="../tokenizacion-activos-agentes-liquidez/">¿qué pasa si una parte del patrimonio de los hogares se vuelve programable?</a></p>')
 inbound('dinero/liquidez-global-dinero-activos-precios/index.html','</div></div></article>','<p>Hay otra vía por la que puede cambiar la liquidez sin ser simplemente “imprimir”: <a href="../tokenizacion-activos-agentes-liquidez/">hacer que activos existentes sean más fáciles de movilizar y usar como colateral</a>.</p>')
 sm=Path('sitemap.xml')
 if sm.exists():
  ns='http://www.sitemaps.org/schemas/sitemap/0.9'; ET.register_namespace('',ns); tree=ET.parse(sm); root=tree.getroot(); u='https://gabitcoinasse.com/'+P
  if not any(n.find(f'{{{ns}}}loc') is not None and n.find(f'{{{ns}}}loc').text==u for n in root.findall(f'{{{ns}}}url')):
   n=ET.SubElement(root,f'{{{ns}}}url'); ET.SubElement(n,f'{{{ns}}}loc').text=u; ET.SubElement(n,f'{{{ns}}}lastmod').text='2026-09-26'; tree.write(sm,encoding='utf-8',xml_declaration=True)
if __name__=='__main__': main()
