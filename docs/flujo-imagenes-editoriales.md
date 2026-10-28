# Flujo de imágenes editoriales

1. Revisar Visual Brand Book y collages publicados. Elegir y aprobar una imagen final, sin sustitutos.
2. Conservar original a resolución completa; exportar WebP de calidad sin reescalar hacia abajo.
3. Subir imagen real a GitHub: si es necesario, base64 desde archivo local, archivo de transporte en Files, lectura por bloques, GitHub create_blob base64, create_tree, create_commit y update_ref.
4. Verificar existencia y contenido del blob binario en GitHub. No incrustar miniaturas en SVG.
5. Actualizar el articulo: img src, og:image, twitter:image, JSON-LD y tarjetas del archivo/home cuando correspondan.
6. Volver a leer y verificar todas las rutas en GitHub; comprobar web publica cuando las herramientas lo permitan.
7. La home mantiene protagonista editorial fijo y evita duplicar Lo ultimo. Modulo Analisis de Empresas muestra solo entradas de articulos publicados, no menus genericos.

Proceso técnico reusable; las decisiones visuales siguen el Visual Brand Book.