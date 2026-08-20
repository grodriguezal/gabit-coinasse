from pathlib import Path
from urllib.parse import urljoin
import re

from lxml import etree, html

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://grodriguezal.github.io/gabit-coinasse/"

ARTICLES = {
    "dinero/por-que-tu-dinero-compra-menos": dict(meta="DINERO · 10 MIN", back="DINERO", hub="dinero/", hero="assets/inflation-purchasing-power-collage.webp", alt="Collage de dos cestas de compra que muestra cómo la misma cantidad de dinero adquiere menos bienes.", threads=[("¿Qué coño es el dinero?","dinero/que-es-el-dinero/"),("¿Quién crea realmente el dinero?","dinero/quien-crea-realmente-el-dinero/"),("¿Qué son los tipos de interés?","dinero/que-son-los-tipos-de-interes/")]),
    "dinero/que-es-el-dinero": dict(meta="DINERO · 11 MIN", back="DINERO", hub="dinero/", hero="assets/money-goods-engraving.webp", alt="Grabado de una balanza que compara monedas con bienes cotidianos.", threads=[("¿Quién crea realmente el dinero?","dinero/quien-crea-realmente-el-dinero/"),("¿Por qué tu dinero compra cada vez menos?","dinero/por-que-tu-dinero-compra-menos/"),("¿Qué significa fiat?","explainers/fiat/")]),
    "dinero/que-son-los-tipos-de-interes": dict(meta="DINERO · MERCADOS · 10 MIN", back="DINERO", hub="dinero/", hero="assets/interest-time-price-collage.webp", alt="Collage que representa el precio de mover capacidad de compra del presente al futuro mediante un calendario y una promesa de pago.", threads=[("Comprar una casa: tipos, crédito y precios","economia/comprar-casa-tipos-credito-precios/"),("¿Qué demonios es un bono?","mercados/que-es-un-bono/"),("¿Por qué tu dinero compra cada vez menos?","dinero/por-que-tu-dinero-compra-menos/")]),
    "economia/comprar-casa-tipos-credito-precios": dict(meta="ECONOMÍA · DINERO · 10 MIN", back="ECONOMÍA", hub="economia/", hero="assets/housing-rates-same-house.webp", alt="La misma casa repetida junto a dos cargas hipotecarias distintas para mostrar el efecto de los tipos de interés.", threads=[("¿Quién crea realmente el dinero?","dinero/quien-crea-realmente-el-dinero/"),("¿Qué demonios es un bono?","mercados/que-es-un-bono/"),("¿Por qué tu dinero compra cada vez menos?","dinero/por-que-tu-dinero-compra-menos/")]),
    "mercados/que-es-un-bono": dict(meta="MERCADOS · 10 MIN", back="MERCADOS", hub="mercados/", hero="assets/bond-future-payments-collage.webp", alt="Certificado de bono intervenido con una línea temporal de cupones y devolución del principal.", threads=[("¿Cómo puede un país gastar dinero que no tiene?","poder/como-puede-un-pais-gastar-dinero-que-no-tiene/"),("¿Qué son los tipos de interés?","dinero/que-son-los-tipos-de-interes/"),("¿Qué significa liquidez?","explainers/liquidez/")]),
    "poder/como-puede-un-pais-gastar-dinero-que-no-tiene": dict(meta="PODER · 12 MIN", back="PODER", hub="poder/", hero="assets/deficit-collage.webp", alt="Collage de un edificio público, una imprenta y una fila de monedas que representa un déficit de diez.", caption="FALTAN 10 ↗", threads=[("¿Qué demonios es un bono?","mercados/que-es-un-bono/"),("¿Quién crea realmente el dinero?","dinero/quien-crea-realmente-el-dinero/"),("¿Qué son los tipos de interés?","dinero/que-son-los-tipos-de-interes/")]),
    "dinero/quien-crea-realmente-el-dinero": dict(meta="DINERO · PODER · 13 MIN", back="DINERO", hub="dinero/", hero="assets/bank-loan-deposit-ledger.webp", alt="Libro contable bancario con dos entradas simultáneas que representan un préstamo y un depósito.", threads=[("¿Por qué tu dinero compra cada vez menos?","dinero/por-que-tu-dinero-compra-menos/"),("¿Qué significa liquidez?","explainers/liquidez/"),("¿Qué son los tipos de interés?","dinero/que-son-los-tipos-de-interes/")]),
    "dinero/por-que-el-oro-nos-obsesiona": dict(meta="DINERO · 11 MIN", back="DINERO", hub="dinero/", hero="assets/gold-monetary-network-collage.webp", alt="Collage histórico de oro, balanza y documentos de comercio que contextualiza su uso monetario.", threads=[("¿Qué coño es el dinero?","dinero/que-es-el-dinero/"),("¿Qué carajo pasó en 1971?","historia/que-paso-en-1971/"),("¿Qué significa fiat?","explainers/fiat/")]),
    "historia/que-paso-en-1971": dict(meta="PODER · DINERO · 13 MIN", back="PODER", hub="poder/", hero="assets/nixon-1971.webp", alt="Collage de Richard Nixon, una televisión y documentos monetarios sobre el anuncio del 15 de agosto de 1971.", caption="15 AGO 1971", threads=[("¿Por qué el oro lleva milenios obsesionándonos?","dinero/por-que-el-oro-nos-obsesiona/"),("¿Qué significa fiat?","explainers/fiat/"),("¿Quién crea realmente el dinero?","dinero/quien-crea-realmente-el-dinero/")]),
    "dinero/por-que-21-millones-bitcoin": dict(meta="DINERO · 13 MIN", back="DINERO", hub="dinero/", hero="assets/bitcoin-network.webp", alt="Collage de bloques conectados, nodos y energía que representa la emisión verificable de bitcoin.", threads=[("¿Qué coño es el dinero?","dinero/que-es-el-dinero/"),("¿Qué significa fiat?","explainers/fiat/"),("¿Por qué el oro lleva milenios obsesionándonos?","dinero/por-que-el-oro-nos-obsesiona/")]),
}

SPECIAL_THREADS = {
    "empieza-aqui": [("¿Por qué tu dinero compra cada vez menos?","dinero/por-que-tu-dinero-compra-menos/"),("¿Qué coño es el dinero?","dinero/que-es-el-dinero/"),("¿Qué son los tipos de interés?","dinero/que-son-los-tipos-de-interes/")],
    "sobre/manifiesto": [("Empieza aquí","empieza-aqui/"),("¿Qué coño es el dinero?","dinero/que-es-el-dinero/"),("¿Cómo puede un país gastar dinero que no tiene?","poder/como-puede-un-pais-gastar-dinero-que-no-tiene/")],
}

DESCRIPTIONS = {
    "": "Dinero, economía, mercados y poder explicados sin jerga. Entiende cómo funcionan las reglas del juego económico.",
    "articulos": "Artículos para entender dinero, economía, mercados y poder a partir de preguntas concretas y mecanismos claros.",
    "explainers": "Conceptos de dinero, economía y mercados explicados sin jerga en menos de dos minutos.",
    "dinero": "Artículos para entender qué es el dinero, quién lo crea y por qué cambia su poder de compra.",
    "economia": "Economía explicada desde el crédito, la vivienda, la producción y sus efectos en la vida cotidiana.",
    "mercados": "Mercados explicados desde las promesas, el riesgo, el tiempo y la formación de precios.",
    "poder": "Gobiernos, deuda, bancos centrales y poder económico explicados mediante mecanismos concretos.",
    "empieza-aqui": "Una ruta para empezar por inflación, dinero y tipos y entender cómo se conectan crédito, deuda, mercados y poder.",
    "sobre/manifiesto": "Por qué explicar economía exige preguntas claras, mecanismos comprensibles, fuentes y honestidad sobre la incertidumbre.",
}

FORBIDDEN_REPLACEMENTS = {
    "DIAGRAMA DE SERVILLETA": "MECANISMO",
    "ANOTACIÓN:": "",
    "TÉRMINO AL FINAL:": "",
    "ESCENA 1:": "",
    "ESCENA 2:": "",
    "La versión web debe conservar estas fuentes o equivalentes primarias si alguna URL cambia.": "Fuentes primarias utilizadas para comprobar los datos, definiciones y mecanismos de esta pieza.",
    "Base de verificación recomendada. ": "",
}

DIAGRAMS = {
    "dinero/por-que-tu-dinero-compra-menos": [("MÁS DINERO NO ES MÁS CERVEZA", ["100 monedas → 100 cervezas", "120 monedas → 100 cervezas", "Más capacidad nominal; la producción no cambió."])],
    "dinero/que-es-el-dinero": [("LAS TRES CAPAS", ["TÚ · efectivo o depósito", "BANCO COMERCIAL · reservas", "BANCO CENTRAL · efectivo y reservas", "Todos se expresan en euros; no son la misma clase de pasivo."])],
    "dinero/que-son-los-tipos-de-interes": [("CÓMO VIAJA UN TIPO OFICIAL", ["Banco central", "→ mercado monetario y financiación bancaria", "→ préstamos, depósitos y bonos", "→ consumo e inversión", "→ demanda y precios"])],
    "economia/comprar-casa-tipos-credito-precios": [("LA MISMA DEUDA, DOS CUOTAS", ["€250.000 · 30 años", "2% fijo ≈ €924/mes", "5% fijo ≈ €1.342/mes", "Amortización francesa, sin comisiones ni seguros. Ejemplo didáctico."])],
    "mercados/que-es-un-bono": [("UN BONO EN UNA LÍNEA DE TIEMPO", ["HOY · −€100", "AÑO 1 · +€5 cupón", "AÑO 2 · +€5 cupón", "AÑO 3 · +€105 cupón + principal", "Vencimiento"])],
    "poder/como-puede-un-pais-gastar-dinero-que-no-tiene": [("DÉFICIT ≠ DEUDA", ["AÑO 1 · déficit 10", "AÑO 2 · déficit 5", "Los flujos alimentan el stock de deuda.", "El stock también cambia con amortizaciones y otros ajustes."]),("ENCONTRAR LOS DIEZ", ["GOBIERNO · +10 financiación", "INVERSOR · −10 efectivo +10 bono", "El bono cambia la composición de los balances; no crea riqueza real por sí solo."])],
    "dinero/quien-crea-realmente-el-dinero": [("EL MOMENTO DE CREACIÓN", ["ANTES · balance sin el préstamo", "DESPUÉS · +€200.000 préstamo (activo)", "DESPUÉS · +€200.000 depósito (pasivo)", "El dinero y la deuda nacen juntos."]),("DEL DEPÓSITO A LA LIQUIDACIÓN", ["Banco A", "→ reservas de banco central", "→ Banco B", "→ depósito del vendedor"])],
    "dinero/por-que-el-oro-nos-obsesiona": [("EL CONCURSO MONETARIO", ["TRIGO · débil en durabilidad", "GANADO · débil en divisibilidad", "HIERRO · medio en portabilidad", "ORO · fuerte como paquete de propiedades", "Leyenda: FUERTE · MEDIO · DÉBIL"])],
    "historia/que-paso-en-1971": [("BRETTON WOODS EN TRES FLECHAS", ["Monedas → dólar", "Dólar → oro oficial a $35/oz", "EE. UU. → confianza y compromiso", "El dólar era la pieza de conexión del sistema."])],
    "dinero/por-que-21-millones-bitcoin": [("LA ESCALERA DE EMISIÓN", ["50", "→ 25", "→ 12,5", "→ 6,25", "→ 3,125", "Cada 210.000 bloques; tiende a cero."]),("UNA REGLA VERIFICABLE", ["Minero propone", "→ nodo valida", "→ válido puede aceptarse", "→ inválido se rechaza"])],
}

BACKLINKS = {
    "dinero/que-es-el-dinero": [("dinero fiat", "explainers/fiat/")],
    "dinero/que-son-los-tipos-de-interes": [("Liquidez", "explainers/liquidez/")],
    "economia/comprar-casa-tipos-credito-precios": [("tipo", "dinero/que-son-los-tipos-de-interes/"), ("préstamo", "dinero/quien-crea-realmente-el-dinero/")],
    "mercados/que-es-un-bono": [("Riesgo de liquidez", "explainers/liquidez/")],
    "poder/como-puede-un-pais-gastar-dinero-que-no-tiene": [("bonos", "mercados/que-es-un-bono/")],
    "dinero/quien-crea-realmente-el-dinero": [("fuentes de liquidez", "explainers/liquidez/")],
    "dinero/por-que-el-oro-nos-obsesiona": [("Bretton Woods", "historia/que-paso-en-1971/")],
    "historia/que-paso-en-1971": [("monedas fiat", "explainers/fiat/")],
    "dinero/por-que-21-millones-bitcoin": [("buen dinero", "dinero/que-es-el-dinero/")],
}


def parse(path: Path):
    return html.document_fromstring(path.read_text(encoding="utf-8"))


def rel_prefix(path: Path):
    return "../" * (len(path.relative_to(ROOT).parts) - 1)


def set_meta(doc, name, content):
    nodes = doc.xpath(f'//meta[@name="{name}"]')
    node = nodes[0] if nodes else etree.SubElement(doc.xpath("//head")[0], "meta", name=name)
    node.set("content", content)


def set_canonical(doc, route):
    nodes = doc.xpath('//link[@rel="canonical"]')
    node = nodes[0] if nodes else etree.SubElement(doc.xpath("//head")[0], "link", rel="canonical")
    node.set("href", urljoin(BASE, route + ("/" if route else "")))


def frag(markup):
    return html.fragments_fromstring(markup)


def replace_children(node, markup):
    node.text = None
    for child in list(node): node.remove(child)
    for child in frag(markup):
        if isinstance(child, str):
            node.text = (node.text or "") + child
        else: node.append(child)


def standardize_shell(doc, path):
    prefix = rel_prefix(path)
    if not doc.xpath('//link[contains(@href,"v1.css")]'):
        etree.SubElement(doc.xpath("//head")[0], "link", rel="stylesheet", href=prefix + "v1.css")
    body = doc.xpath("//body")[0]
    if not doc.xpath('//*[@class="skip-link"]'):
        body.insert(0, html.fromstring('<a class="skip-link" href="#main-content">SALTAR AL CONTENIDO</a>'))
    main = doc.xpath("//main")
    if main: main[0].set("id", "main-content")
    footer = doc.xpath('//footer[contains(concat(" ",normalize-space(@class)," ")," site-footer ")]')
    if footer:
        replace_children(footer[0], f'<a class="wordmark" href="{prefix}index.html">GABIT COINASSE</a><p>Entiende el dinero. Entiende el mundo.</p><div><a href="{prefix}dinero/">Dinero</a><a href="{prefix}economia/">Economía</a><a href="{prefix}mercados/">Mercados</a><a href="{prefix}poder/">Poder</a><a href="{prefix}explainers/">Explainers</a><a href="{prefix}empieza-aqui/">Empieza aquí</a><a href="{prefix}sobre/manifiesto/">Manifiesto</a></div><small>Explicamos. No asesoramos. Nada de esto es asesoramiento financiero.</small>')


def thread_markup(items, prefix):
    cards = "".join(f'<a href="{prefix}{route}"><span>{label}</span><b>→</b></a>' for label, route in items)
    return f'<p class="block-label">TIRA DEL HILO</p><div>{cards}</div>'


def clean_public_copy(doc):
    for el in doc.xpath("//*[text()]"):
        if el.text:
            for old, new in FORBIDDEN_REPLACEMENTS.items(): el.text = el.text.replace(old, new)
        if el.tail:
            for old, new in FORBIDDEN_REPLACEMENTS.items(): el.tail = el.tail.replace(old, new)
    for label in doc.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," diagram-label ")]'):
        parent = label.getparent(); parent.remove(label)


def link_first(doc, phrase, href):
    for node in doc.xpath('//div[contains(@class,"article-body")]//p | //div[contains(@class,"article-body")]//li'):
        if node.xpath('.//a'): continue
        text = ''.join(node.itertext())
        pos = text.lower().find(phrase.lower())
        if pos < 0: continue
        for child in list(node): node.remove(child)
        node.text = text[:pos]
        anchor = etree.SubElement(node, 'a', href=href)
        anchor.text = text[pos:pos+len(phrase)]
        anchor.tail = text[pos+len(phrase):]
        return


def upgrade_article(route, data):
    path = ROOT / route / "index.html"; doc = parse(path); prefix = rel_prefix(path)
    for rail in doc.xpath('//aside[contains(@class,"article-rail")]'): rail.getparent().remove(rail)
    byline = doc.xpath('//div[contains(@class,"article-byline")]')
    if byline: replace_children(byline[0], '<span>GABIT COINASSE</span><span>AGOSTO 2026</span>')
    eyebrow = doc.xpath('//header[contains(@class,"article-hero")]//p[contains(@class,"eyebrow")]')
    if eyebrow: eyebrow[0].text = data["meta"]
    back = doc.xpath('//a[contains(@class,"back-link")]')
    if back:
        back[0].text = f'← {data["back"]}'; back[0].set("href", prefix + data["hub"])
    image = doc.xpath('//figure[contains(@class,"article-lead-art")]//img')
    if image:
        image[0].set("src", prefix + data["hero"]); image[0].set("alt", data["alt"])
    captions = doc.xpath('//figure[contains(@class,"article-lead-art")]//figcaption')
    for cap in captions:
        if data.get("caption"): cap.text = data["caption"]
        else: cap.getparent().remove(cap)
    threads = doc.xpath('//aside[contains(@class,"article-thread")]')
    if threads: replace_children(threads[0], thread_markup(data["threads"], prefix))
    for section, (title, parts) in zip(doc.xpath('//section[contains(@class,"content-diagram")]'), DIAGRAMS.get(route, [])):
        replace_children(section, '<h3>'+title+'</h3><div class="diagram-parts">'+''.join('<span>'+part+'</span>' for part in parts)+'</div>')
    clean_public_copy(doc)
    for phrase, target in BACKLINKS.get(route, []): link_first(doc, phrase, prefix + target)
    if route == "historia/que-paso-en-1971":
        body = doc.xpath('//div[contains(@class,"article-body")]')[0]
        candidates = body.xpath('.//p[contains(.,"casi inevitable") or contains(.,"dinero digital")]')
        for p in candidates:
            p.text = 'Entender 1971 no demuestra que un dinero concreto sea “mejor”. Sí deja una pregunta más útil: ¿qué sostiene un sistema monetario cuando ya no existe una convertibilidad fija en oro, y qué restricciones siguen operando aunque el metal salga de la ecuación?'
    standardize_shell(doc, path); write(path, doc)


MANIFESTO = '''<p class="article-lede">El dinero se mete en casi todo. Tu casa. Tu sueldo. Tus ahorros. Tu jubilación. Tus impuestos. El trabajo que aceptas. El crédito que puedes conseguir. Lo que puede gastar un gobierno. Lo que cuesta financiar una empresa. El precio de esperar.</p><p>Y, sin embargo, demasiadas veces se explica como si primero tuvieras que aprobar un examen de vocabulario.</p><p>No me interesa eso.</p><p>Vengo a hacer preguntas claras sobre dinero, economía, mercados y poder. Y a seguirlas hasta que el mecanismo se entienda.</p>
<h2>VENGO A HACER LAS PREGUNTAS QUE PARECEN DEMASIADO BÁSICAS</h2><p>Me interesan las preguntas que mucha gente piensa y casi nadie quiere hacer en voz alta.</p><p>¿Por qué suben los precios? ¿De dónde sale el dinero de un préstamo? ¿A quién le debe dinero un país? ¿Por qué alguien compra una promesa de pago? ¿Qué significa exactamente que “falta liquidez”? ¿Quién puede cambiar las reglas y quién acaba soportando el coste?</p><p>Una pregunta aparentemente ingenua tiene una virtud brutal: obliga a quitar la decoración.</p><p>Si no puedo explicar qué está ocurriendo sin esconderme detrás de una palabra técnica, todavía no lo he explicado bien.</p>
<h2>PRIMERO LA INTUICIÓN. DESPUÉS EL NOMBRE.</h2><p>No quiero que necesites saber economía para empezar a entender economía.</p><p>Si un déficit puede empezar con un país que ingresa 100 y gasta 110, voy a empezar por esos diez que faltan. Si un bono puede empezar con “te presto 100 hoy y prometes devolverme más mañana”, voy a empezar por esa promesa. Si un balance bancario se entiende mejor con dos columnas, voy a dibujar dos columnas.</p><p>Después pondré el nombre técnico.</p><p>El vocabulario sirve cuando comprime una idea que ya entiendes. Antes de eso, solo puede convertirse en una puerta cerrada.</p>
<h2>SIMPLIFICAR NO ME DA PERMISO PARA MENTIR</h2><p>Quiero hacer sencillo lo que pueda hacerse sencillo. No quiero hacer falso lo que es complicado.</p><p>Una buena analogía ayuda a entrar. También tiene un punto donde deja de funcionar. Cuando llegue a ese punto, te lo voy a decir.</p><p>Si una explicación depende de que la producción no cambie, lo diré. Si una relación funciona “en promedio” pero no para cada persona, lo diré. Si dos mecanismos distintos pueden producir un resultado parecido, no fingiré que existe una única causa porque quede mejor en un titular.</p><p>Simple no significa superficial. Significa que cada capa llega cuando ya puedes sostenerla.</p>
<h2>HECHOS, INTERPRETACIÓN Y OPINIÓN NO SON LO MISMO</h2><p>Quiero separar tres cosas que en la conversación económica se mezclan constantemente.</p><p>Un dato verificable es un hecho. Lo que ese dato significa puede admitir más de una interpretación razonable. Y lo que yo pienso sobre una política, una institución o una decisión es una opinión.</p><p>No voy a disfrazar una opinión de ley económica. Si existe un debate serio, quiero que puedas entender las principales posiciones antes de saber cuál me convence más. Y si una cifra puede comprobarse, debe poder comprobarse.</p><p>Tener una voz no exige fingir que la incertidumbre desapareció.</p>
<h2>QUIERO MIRAR LOS INCENTIVOS Y EL PODER</h2><p>La economía no ocurre en una pizarra limpia. Ocurre dentro de instituciones, leyes, balances, contratos y decisiones humanas.</p><p>Por eso quiero preguntar quién puede decidir, quién asume el riesgo, quién cobra, quién paga, qué incentivo cambia y qué restricción desaparece o aparece.</p><p>Eso no significa convertir cada mecanismo en una conspiración. Muchas veces nadie “controla” el resultado completo. Pero el poder existe, los incentivos importan y las reglas distribuyen capacidad de acción.</p><p>Entender un sistema también significa entender quién puede moverlo y quién tiene que adaptarse.</p>
<h2>SI ALGO ES INCIERTO, TE LO VOY A DECIR</h2><p>La economía trabaja con personas, expectativas y sistemas que cambian mientras intentamos entenderlos.</p><p>Hay relaciones robustas. Hay datos malos. Hay causalidades difíciles de separar. Hay escuelas que interpretan el mismo fenómeno de maneras distintas. Hay pronósticos que se rompen.</p><p>No quiero convertir una estimación en una certeza ni una correlación en una causa.</p><p>Si no lo sé, te lo voy a decir. Si la evidencia es ambigua, también. Si una explicación mejora, la corregiré.</p><p>La confianza no sale de parecer infalible. Sale de saber exactamente qué parte del argumento se sostiene y cuál sigue abierta.</p>
<h2>QUIERO HABLAR COMO UNA PERSONA NORMAL</h2><p>No quiero escribir como un paper, un banco, una presentación de consultoría ni un folleto que intenta venderte algo.</p><p>Quiero escribir como una persona inteligente explicándole algo importante a otra persona inteligente.</p><p>A veces eso incluye un “coño”. A veces no. Una palabrota puede darle ritmo a una frase; no puede rescatar un argumento flojo.</p><p>La jerga solo entra cuando aporta precisión. El humor solo entra cuando ayuda a entender o a recordar. Y una frase complicada no recibe premio por sonar complicada.</p>
<h2>PARA QUÉ HAGO TODO ESTO</h2><p>Mi objetivo no es que memorices definiciones ni que salgas repitiendo una conclusión prefabricada.</p><p>Quiero que puedas leer una noticia sobre tipos, deuda, inflación, bancos, mercados, tecnología o política económica y hacer una pregunta mejor que antes.</p><p>Quiero que entiendas el mecanismo suficiente para detectar cuándo una explicación se salta un paso, mezcla conceptos o vende certeza donde solo hay una interpretación.</p><p>Y quiero que cada respuesta abra otra pregunta útil.</p><aside class="takeaway takeaway-final"><p class="block-label">LA IDEA</p><h3>No vengo a decirte qué pensar. Vengo a darte mejores herramientas para entender qué demonios está pasando.</h3><p class="signature">Entiende el dinero. Entiende el mundo.</p></aside>'''

START = '''<p class="article-lede">La economía tiene un problema de marketing bastante serio. Te presentan palabras como “agregado monetario”, “curva de rendimientos” y “dominancia fiscal” antes de explicarte por qué debería importarte una mierda.</p><p>Aquí lo hacemos al revés.</p><p>Empiezas por algo que ya te afecta. Tu compra. Tu hipoteca. Tu sueldo. La deuda de tu gobierno. Después seguimos el mecanismo hasta que aparecen las palabras técnicas.</p><aside class="takeaway"><p class="block-label">QUÉDATE CON ESTO</p><h3>No necesitas aprender economía en orden. Necesitas una buena primera pregunta y saber qué abrir después.</h3></aside>
<h2>NIVEL 1 — ¿POR QUÉ MI VIDA CUESTA TANTO?</h2><div class="route-links"><a href="../dinero/por-que-tu-dinero-compra-menos/">Inflación <b>→</b></a><a href="../economia/comprar-casa-tipos-credito-precios/">Vivienda <b>→</b></a></div>
<h2>NIVEL 2 — ¿CÓMO FUNCIONA ESTA MIERDA?</h2><div class="route-links"><a href="../dinero/que-es-el-dinero/">Dinero <b>→</b></a><a href="../dinero/que-son-los-tipos-de-interes/">Tipos <b>→</b></a><a href="../mercados/que-es-un-bono/">Bonos <b>→</b></a></div>
<h2>NIVEL 3 — ESPERA UN MOMENTO…</h2><div class="route-links"><a href="../poder/como-puede-un-pais-gastar-dinero-que-no-tiene/">Déficit <b>→</b></a><a href="../dinero/quien-crea-realmente-el-dinero/">Creación monetaria <b>→</b></a></div>
<h2>NIVEL 4 — ¿SIEMPRE FUNCIONÓ ASÍ?</h2><div class="route-links"><a href="../dinero/por-que-el-oro-nos-obsesiona/">Oro <b>→</b></a><a href="../historia/que-paso-en-1971/">1971 <b>→</b></a></div>
<h2>NIVEL 5 — COMPARA REGLAS, NO TRIBUS</h2><p>Vuelve a las propiedades del dinero: durabilidad, divisibilidad, verificabilidad, escasez, portabilidad y efectos de red. Sirven para comparar sistemas sin imponer un activo como respuesta.</p>
<section class="connection-map"><p class="block-label">MAPA DE CONEXIONES</p><h3>DESDE AQUÍ, EL MAPA SE ABRE</h3><div><a href="../explainers/fiat/">Bancos centrales y fiat</a><a href="../explainers/liquidez/">Liquidez y mercados</a><a href="../poder/">Deuda y poder</a><a href="../historia/que-paso-en-1971/">Historia monetaria</a><a href="../dinero/por-que-el-oro-nos-obsesiona/">Oro</a><a href="../dinero/por-que-21-millones-bitcoin/">Bitcoin</a><span>Tecnología · EN CAMINO</span><span>Nuevas preguntas · EN CAMINO</span></div></section><p>A partir de aquí no hay una graduación final. El mapa se ramifica por lo que quieras entender. Son ramas, no niveles.</p><details class="lost-block" open><summary><span>ESPERA, ME HE PERDIDO</span><b>−</b></summary><div><p>Si solo quieres empezar hoy: lee inflación, dinero y tipos. Con esas tres piezas ya podrás entender muchas noticias económicas bastante mejor que ayer.</p></div></details>'''


def upgrade_special(route, body_markup, meta, deck, description):
    path=ROOT/route/"index.html"; doc=parse(path); prefix=rel_prefix(path)
    for rail in doc.xpath('//aside[contains(@class,"article-rail")]'): rail.getparent().remove(rail)
    hero=doc.xpath('//header[contains(@class,"article-hero")]')[0]; hero.set("class", "article-hero article-hero--text")
    for fig in hero.xpath('.//figure'): fig.getparent().remove(fig)
    back=hero.xpath('.//a[contains(@class,"back-link")]')[0]; back.text="← INICIO"; back.set("href",prefix+"index.html")
    hero.xpath('.//p[contains(@class,"eyebrow")]')[0].text=meta
    hero.xpath('.//p[contains(@class,"article-deck")]')[0].text=deck
    byline=hero.xpath('.//div[contains(@class,"article-byline")]')[0]; replace_children(byline,'<span>AGOSTO 2026</span>')
    body=doc.xpath('//div[contains(@class,"article-body")]')[0]
    replace_children(body, body_markup + f'<aside class="article-thread">{thread_markup(SPECIAL_THREADS[route],prefix)}</aside>')
    set_meta(doc,"description",description); set_canonical(doc,route); standardize_shell(doc,path); write(path,doc)


def upgrade_home():
    path=ROOT/"index.html"; doc=parse(path)
    set_meta(doc,"description",DESCRIPTIONS[""]); set_canonical(doc,"")
    wordmark=doc.xpath('//header[contains(@class,"site-header")]/a[contains(@class,"wordmark")]')[0]; wordmark.set('href','index.html')
    lead=doc.xpath('//p[contains(@class,"hero-lead")]')[0]
    replace_children(lead,'<strong>Un país recauda 100. Gasta 110.</strong><br>Hay 10 que tienen que salir de algún sitio. Vamos a encontrarlos.')
    doc.get_element_by_id("paths-title").text="¿QUÉ QUIERES ENTENDER?"
    cards=doc.xpath('//div[contains(@class,"path-grid")]/a')
    cards[2].xpath('.//p')[0].text='Empieza por déficit, deuda y bonos.'
    cards[3].set('href','mercados/que-es-un-bono/'); cards[3].xpath('.//p')[0].text='Empieza por bonos: promesas, riesgo, tiempo y precio.'
    doc.get_element_by_id("latest-title").text="BUENAS PUERTAS DE ENTRADA"
    feature=doc.xpath('//article[contains(@class,"feature-card")]')[0]
    feature.xpath('.//img')[0].set('src','assets/gold-monetary-network-collage.webp'); feature.xpath('.//img')[0].set('alt',ARTICLES['dinero/por-que-el-oro-nos-obsesiona']['alt'])
    feature.xpath('.//p[contains(@class,"meta")]')[0].text='DINERO · 11 MIN'
    for p in doc.xpath('//p[contains(@class,"meta")][contains(.,"BITCOIN")]'): p.text='DINERO · 13 MIN'
    manifest=doc.xpath('//section[contains(@class,"manifesto-break")]//p')[0]; replace_children(manifest,'No necesitas saber economía.<br>Solo necesitas hacer buenas preguntas.<br>Aquí empezamos por ellas.')
    for small in doc.xpath('//section[contains(@class,"rabbit")]//small'): small.text='EN CAMINO'
    for note in doc.xpath('//p[contains(@class,"rabbit-note")]'): note.getparent().remove(note)
    start=doc.xpath('//section[contains(@class,"start-here")]//div[contains(@class,"start-copy")]//p')[0]
    start.text='Hay una ruta para empezar por inflación, dinero y tipos y acabar con un mapa: bancos, deuda, mercados, poder, historia monetaria y las preguntas que quieras abrir después.'
    standardize_shell(doc,path); write(path,doc)


def upgrade_indexes():
    for route in ["articulos","explainers","dinero","economia","mercados","poder","historia"]:
        path=ROOT/route/"index.html"; doc=parse(path)
        if route in DESCRIPTIONS: set_meta(doc,'description',DESCRIPTIONS[route]); set_canonical(doc,route)
        if route=='historia':
            set_meta(doc,'robots','noindex,follow'); doc.xpath('//p[contains(@class,"eyebrow")]')[0].text='TEMA'; doc.xpath('//h1')[0].text='HISTORIA MONETARIA'
        if route=='articulos':
            doc.xpath('//p[contains(@class,"eyebrow")]')[0].text='ARTÍCULOS'; doc.xpath('//header/p[last()]')[0].text='Diez artículos para entender dinero, economía, mercados y poder a partir de preguntas concretas.'
            grid=doc.xpath('//div[contains(@class,"hub-grid")]')[0]
            for card in list(grid)[10:]: grid.remove(card)
        if route=='explainers':
            for span in doc.xpath('//div[contains(@class,"explainer-hub")]/a/span'): span.text='EXPLAINER · 2 MIN'
        for span in doc.xpath('//div[contains(@class,"hub-grid")]/a/span'):
            span.text=re.sub(r'^\d{2}\s*·\s*','',span.text or '').replace('DINERO · HISTORIA · 11 MIN','DINERO · 11 MIN').replace('DINERO · BITCOIN · 13 MIN','DINERO · 13 MIN').replace('HISTORIA · PODER · 13 MIN','PODER · DINERO · 13 MIN')
        if route=='economia' and not doc.xpath('//div[contains(@class,"hub-grid")]/a'):
            grid=doc.xpath('//div[contains(@class,"hub-grid")]')[0]
            grid.append(html.fromstring('<a href="../economia/comprar-casa-tipos-credito-precios/"><span>ECONOMÍA · DINERO · 10 MIN</span><h2>COMPRAR UNA CASA: ¿POR QUÉ CARAJO MANDAN TANTO LOS TIPOS?</h2><p>La misma casa puede ser asequible el lunes e imposible el viernes sin moverse un ladrillo.</p><b>→</b></a>'))
        standardize_shell(doc,path); write(path,doc)


def upgrade_explainers():
    for path in sorted((ROOT/'explainers').glob('*/index.html')):
        route=str(path.parent.relative_to(ROOT)); doc=parse(path)
        set_canonical(doc,route)
        for n in doc.xpath('//*[contains(@class,"explainer-number")]'): n.getparent().remove(n)
        title=doc.xpath('//title')[0]
        if route.endswith('/inflacion'): title.text='Inflación explicada — Gabit Coinasse'
        elif route.endswith('/tipos'): title.text='Tipos de interés explicados — Gabit Coinasse'
        elif route.endswith('/pib'): title.text='PIB explicado — Gabit Coinasse'
        for el in doc.xpath('//*[text()]'):
            if el.text:
                el.text=el.text.replace('Prestás','Prestas').replace('cobrás','cobras').replace('recuperás','recuperas').replace('AMPLIACIÓN EN FASE 2','AMPLIACIÓN EN CAMINO').replace('FASE 2','EN CAMINO').replace('El trigo se pudre. El ganado puede enfermar. El oro puede guardarse durante siglos.','El trigo se pudre. El ganado muere. El oro, bien guardado, puede sobrevivir generaciones.')
        standardize_shell(doc,path); write(path,doc)


def write(path, doc):
    output='<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html',pretty_print=True)
    path.write_text(output,encoding='utf-8')


def main():
    upgrade_home()
    for route,data in ARTICLES.items(): upgrade_article(route,data)
    upgrade_special('empieza-aqui',START,'EMPIEZA AQUÍ · 7 MIN','Mejor. Esta guía está diseñada exactamente para eso.',DESCRIPTIONS['empieza-aqui'])
    upgrade_special('sobre/manifiesto',MANIFESTO,'MANIFIESTO · 5 MIN','Vengo a hacer preguntas claras sobre dinero, economía, mercados y poder. Y a seguirlas hasta que el mecanismo se entienda.',DESCRIPTIONS['sobre/manifiesto'])
    upgrade_indexes(); upgrade_explainers()
    path=ROOT/'visual-library/index.html'; doc=parse(path); set_meta(doc,'robots','noindex,nofollow'); write(path,doc)
    (ROOT/'articulo.html').write_text('''<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="https://grodriguezal.github.io/gabit-coinasse/poder/como-puede-un-pais-gastar-dinero-que-no-tiene/"><meta http-equiv="refresh" content="0; url=poder/como-puede-un-pais-gastar-dinero-que-no-tiene/"><title>Contenido trasladado — Gabit Coinasse</title></head><body><p>Este artículo se ha trasladado. <a href="poder/como-puede-un-pais-gastar-dinero-que-no-tiene/">Continuar leyendo</a>.</p></body></html>''',encoding='utf-8')
    print('V1 editorial upgrade applied')

if __name__=='__main__': main()
