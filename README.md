# Gabit Coinasse

Economía para gente que tiene cosas mejores que hacer.

Primera versión funcional de la homepage de Gabit Coinasse, construida como sitio estático responsive y preparada para GitHub Pages.

## Dirección editorial

- Dinero, economía, mercados y poder como puertas principales.
- Bitcoin aparece cuando es editorialmente relevante, no como categoría dominante de entrada.
- Sistema visual basado en papel hueso, tinta negra, amarillo Gabit, collage y anotaciones.

## Desarrollo local

Abre `index.html` directamente o sirve la carpeta con cualquier servidor estático.

## SEO y publicación

El HTML fuente conserva los H1 editoriales y el diseño. La publicación ejecuta:

```sh
python3 tools/enhance_seo.py
python3 tools/prepare_seo.py
python3 tools/validate_seo.py
```

`tools/seo-metadata.json` contiene los títulos de búsqueda y descripciones revisados por URL. Actualizarlo cuando cambie la intención de un artículo. `enhance_seo.py` aplica esos metadatos y genera Open Graph, tarjetas sociales, JSON-LD, dimensiones de imágenes y un sitemap de páginas indexables. Es idempotente y no requiere paquetes externos. Las fechas de publicación se extraen únicamente de fechas completas visibles; no se inventan días para fechas que solo indican mes y año. Los `lastmod` se obtienen del historial Git mediante el proceso existente.

La validación impide publicar metadatos duplicados, canonicals incoherentes, recursos internos inexistentes, páginas huérfanas, JSON-LD inválido o un sitemap que difiera de las páginas indexables. No sustituye Search Console, Rich Results Test ni pruebas de navegador. Antes de publicar un artículo, enlazarlo desde su categoría y desde el archivo general. Conservar las fuentes primarias y añadir enlaces contextuales cuando ayuden al lector.

Los archivos generados por estos comandos son el resultado de publicación. Para editar la fuente, trabajar desde un checkout limpio y no regenerar contenido con los antiguos scripts de lanzamiento.
