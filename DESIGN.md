---
name: Aroma Café Blanes
description: Carta náutica de la Badia de Blanes dibujada para el café, en colores de café.
colors:
  espresso: "#2A1B14"
  espresso-2: "#5B4639"
  latte: "#E2CDAA"
  latte-2: "#D6BC92"
  crema: "#F1E6D2"
  crema-2: "#E9DAC0"
  porcelana: "#FBF7F0"
  caramelo: "#A8723F"
  verde: "#1F4D3A"
  verde-2: "#163828"
typography:
  display:
    fontFamily: "Libre Caslon Text, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(2.4rem, 6vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 0.98
  wordmark:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "clamp(2.4rem, 5.6vw, 4.6rem)"
    fontWeight: 700
    letterSpacing: "0.04em"
  title:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "Jost, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    letterSpacing: "0.16em"
rounded:
  base: "0"
spacing:
  margen: "clamp(1rem, 4vw, 3rem)"
  seccion: "clamp(3rem, 8vw, 6.5rem)"
  ancho: "1180px"
components:
  llamar:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.porcelana}"
    padding: "0.85rem 1.4rem"
  llamar-hover:
    backgroundColor: "{colors.verde-2}"
  llamar-oscuro:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.porcelana}"
---

# Design System: Aroma Café Blanes

## Overview

**Creative North Star: "Dibujada para el café, no para navegar"**

La portada es una carta náutica real de la Badia de Blanes: costa, calles,
Sa Palomera y el puerto salen de OpenStreetMap, y Aroma Café está marcado en
el Passeig de Dintre como un faro verde que luce mientras el local está
abierto. El resto de la página sigue la lógica de una carta: tabla de
servicio con hoy marcado, la carta del local como lista impresa, vistas del
local con letra de referencia y un marco ajedrezado de carta en la portada y
el pie.

Formal y elegante, con colores de café; el verde del toldo es el único acento
y siempre marca lo accionable o el estado (llamar, hoy, el faro).

**Key Characteristics:**
- Mapa real como portada, no una foto.
- Paleta de café: espresso, latte, crema, porcelana y caramelo.
- Romana clásica (Libre Caslon) para rótulos y titulares; Jost para leer.
- Esquinas rectas, filetes de 1px y 2px, marco ajedrezado.

## Colors

### Primary
- **Verde toldo** (#1F4D3A): botones de llamar, fila de hoy, faro de la carta, Passeig de Dintre en el mapa. Hover #163828.

### Secondary
- **Caramelo** (#A8723F): rosa de los vientos, línea de sonda. Solo decorativo, nunca texto pequeño.

### Neutral
- **Espresso** (#2A1B14): tinta, filetes, costa, marco.
- **Espresso suave** (#5B4639): texto secundario.
- **Latte** (#E2CDAA): tierra del mapa, barra superior, sección de la carta, pie.
- **Crema** (#F1E6D2) y **crema oscura** (#E9DAC0): bajos del mapa, La casa, Dónde.
- **Porcelana** (#FBF7F0): agua del mapa y papel de las secciones claras.

### Named Rules
**La regla de la luz verde.** El verde solo aparece donde hay acción o estado: llamar, hoy, el faro.

## Typography

**Display Font:** Libre Caslon Text (con Iowan Old Style, Palatino, Georgia)
**Body Font:** Jost (con Segoe UI, system-ui)

**Character:** rotulación de carta náutica clásica con una sans geométrica para el texto corrido y las etiquetas.

### Hierarchy
- **Wordmark** (700, clamp(2.4rem → 4.6rem), mayúsculas, 0.04em): AROMA CAFÉ en el bloque de título.
- **Display** (400, clamp(2.4rem → 4.4rem), 0.98): titulares de sección, en redonda.
- **Title** (400, 1.25rem, 1.3): nombres de platos, días de la tabla.
- **Body** (400, 1.0625rem, 1.6): texto corrido.
- **Label** (600, 0.8125rem, 0.16em, mayúsculas): encabezados de tabla, datos, notas.

### Named Rules
**La regla de la cursiva de carta.** La cursiva solo se usa como en una carta náutica: nombres de agua, pies y subtítulos de curso; nunca en titulares.

## Layout

Portada sobre fondo latte con el marco de carta a todo el ancho (hasta 1600px); en escritorio el bloque de título se apoya arriba a la izquierda y el panel de reservas abajo a la izquierda, sobre el mapa. En móvil se apilan título, mapa (con encuadre propio centrado en el café) y panel, y aparece una barra fija de llamada. Secciones de 1180px de ancho máximo; carta en dos columnas, vistas en tres.

## Elevation & Depth

Plano, como un impreso. La profundidad está en el propio mapa (tierra, bajos y agua) y en una leve desalineación de la plancha de tierra que entra en registro al cargar.

## Shapes

Rectángulos rectos, filetes de 1px, doble línea en tablas, filete discontinuo entre platos, marco ajedrezado de tramos de 44px (32px en móvil).

## Components

### Llamar
Bloque verde con el texto «Llamar para reservar» y el número en romana; versión espresso en la carta del local; versión barra fija en móvil.

### Tabla de servicio
Día, abre y cierra en hora de Blanes; la fila de hoy en verde con la etiqueta «Hoy».

### Vistas
Fotos reales con marco de 1px y letra de referencia (Vista A, B, C…), como las vistas de costa de una carta.

## Do's and Don'ts

### Do:
- **Do** regenerar la carta con `tools/osm-descargar.mjs` y `tools/carta.mjs`, nunca dibujarla a mano.
- **Do** citar «© colaboradores de OpenStreetMap» junto al mapa y en el pie.

### Don't:
- **Don't** poner titulares en cursiva ni palabras resaltadas en color.
- **Don't** inventar sondas, fechas de fundación ni precios.
- **Don't** usar el verde como decoración.
