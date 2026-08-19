# Gabit Coinasse — Biblioteca visual v1.0

Biblioteca operativa de activos reutilizables. El Brand Book define las reglas; esta carpeta contiene las piezas listas para producción.

## Estructura

- `assets/library/textures/`: fondos repetibles de papel y semitono.
- `assets/library/highlights/`: marcas amarillas para enfatizar palabras o datos.
- `assets/library/arrows/`: flechas editoriales, siempre negras.
- `assets/library/icons/`: iconografía funcional de línea gruesa.
- `assets/library/engravings/`: grabados históricos monocromáticos.
- `assets/library/collages/`: composiciones maestras para recortar o adaptar.
- `assets/library/templates/`: estructuras base para nuevas composiciones.

## Reglas rápidas

1. El hueso `#F4F0E7` es el soporte; el blanco puro no es fondo de marca.
2. El amarillo `#FFD400` señala, interrumpe o jerarquiza. Nunca decora sin propósito.
3. Un collage puede mezclar grabado, papel rasgado, negro sólido y una sola intervención amarilla.
4. Las flechas y garabatos funcionan como voz de Gabit: máximo dos intervenciones por viewport.
5. Los iconos no sustituyen imágenes editoriales; organizan información y navegación.
6. Los grabados conservan grano y contraste. No aplicar degradados, neón, brillos ni 3D.
7. Bitcoin se representa como red, protocolo, energía, escasez o infraestructura; nunca como moneda dorada flotante.

## Uso técnico

Los SVG se pueden incrustar con `<img>` o como `background-image`. Conservan sus colores de marca y pueden escalarse sin pérdida. Los WebP son la opción preferida en web; los PNG maestros se conservan para edición y recorte.

## Convención de nombres

`categoria-concepto-variante.ext`, siempre en minúsculas y con guiones. Ejemplo: `arrow-loop.svg` o `deficit-master.webp`.

## Prompt maestro para nuevos collages

> Collage editorial de Gabit Coinasse sobre [TEMA], papel hueso con fibras, grabado histórico negro, fotocopia áspera, bordes rasgados, bloques geométricos negros y una única intervención amarilla #FFD400. Composición asimétrica, inteligente e irreverente, con espacio negativo y grupos recortables. Sin texto, sin logos, sin degradados, sin neón, sin 3D, sin estética crypto ni fotografía financiera de stock.
