# Web de Aroma Café Blanes

Web estática de una sola página (HTML, CSS y JavaScript sin dependencias).

## Ver la web en local

    node tools/dev-server.mjs 8880

y abrir http://localhost:8880

## Cambiar fotos

Los originales están en `assets/photos/source/` (no se publican). La lista de
encuadres y tamaños está en `tools/imagenes.mjs`; para regenerar las WebP:

    cd tools && npm install && node imagenes.mjs

## La carta de la portada

El mapa se dibuja con datos reales de OpenStreetMap (© colaboradores de
OpenStreetMap). Para volver a descargarlos y regenerar la carta dentro de
index.html:

    node tools/osm-descargar.mjs
    node tools/carta.mjs

## Cuando haya dominio

    node tools/poner-dominio.mjs https://eldominio.com

Rellena la URL canónica, la imagen para compartir en WhatsApp y redes,
el sitemap y el robots.txt.

## Publicar en Hostinger (vía GitHub)

    node tools/publicar.mjs "mensaje"

Copia solo lo que se sirve a la rama `web` del repositorio y la envía a
GitHub. En Hostinger: hPanel > Avanzado > Git, conectar el repositorio con la
rama `web` y activar el despliegue automático.

## Pendiente del negocio

- Carta actual con precios (la web va sin precios).
- Dominio.
- Archivo original del logotipo (la marca está compuesta con la tipografía
  del rótulo).
- Datos del titular para el aviso legal.
- Si cierra por temporada en invierno, poner las fechas en `CIERRE_TEMPORADA`
  al principio de `main.js` para que el aviso de abierto o cerrado sea correcto.
