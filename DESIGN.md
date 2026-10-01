---
name: Aroma Café Blanes
description: La web como la carta impresa del propio café, verde botella y oro sobre mármol.
colors:
  marmol: "#F5F4F0"
  marmol-2: "#ECEAE3"
  tinta: "#17231F"
  tinta-2: "#4A5752"
  verde: "#1F3B33"
  verde-2: "#284A40"
  verde-hondo: "#13251F"
  oro: "#C9AB72"
  marfil: "#F2EDE1"
typography:
  display:
    fontFamily: "Cormorant Garamond, Iowan Old Style, Palatino, Georgia, serif"
    fontSize: "clamp(2.7rem, 1.6rem + 3.6vw, 5rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.15rem, 1.55rem + 2.1vw, 3.35rem)"
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Jost, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    letterSpacing: "0.14em"
  wordmark:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 600
    letterSpacing: "0.17em"
rounded:
  base: "2px"
spacing:
  margen: "clamp(20px, 5vw, 56px)"
  seccion: "clamp(88px, 10vw, 152px)"
  ancho: "1240px"
components:
  button-claro:
    backgroundColor: "{colors.marfil}"
    textColor: "{colors.verde}"
    rounded: "{rounded.base}"
    padding: "0 26px"
    height: "50px"
  button-verde:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.marfil}"
    rounded: "{rounded.base}"
    padding: "0 26px"
    height: "50px"
  button-verde-hover:
    backgroundColor: "{colors.verde-2}"
---

# Design System: Aroma Café Blanes

## Overview

**Creative North Star: "La carta de la casa"**

La web se viste como el propio local y su carta impresa: rótulo y toldo verde
botella con letras doradas en romana clásica, mesas de mármol, sillas de
bistró y una barra dorada. La fotografía real del café lleva el peso visual;
la tipografía y el color se limitan a enmarcarla con sobriedad.

Densidad baja, mucho aire y una sola voz de color. El verde ocupa regiones
enteras (la carta, el pie) y el oro solo aparece en filetes, rombos y
detalles sobre verde. Movimiento escaso y lento, como pasar una página.

**Key Characteristics:**
- Fondo mármol, tinta verde casi negra, verde botella del toldo como color de marca.
- Romana clásica para titulares y rótulo; sans geométrica para texto e interfaz.
- Rombo dorado de la carta impresa como único ornamento.
- Fotos reales del local y de clientes, sin ilustraciones ni texturas inventadas.

## Colors

Paleta tomada del local: verde del toldo y de la carta, oro de las letras y la barra, mármol de las mesas.

### Primary
- **Verde toldo** (#1F3B33): fondo de la carta, botón principal sobre mármol, iconos.
- **Verde hondo** (#13251F): pie, menú móvil, base de la portada.
- **Verde realce** (#284A40): estado hover del botón verde.

### Secondary
- **Oro rótulo** (#C9AB72): filetes, rombos, indicador de pestaña, estrellas, títulos del pie. Solo sobre verde o como detalle gráfico, nunca como color de texto sobre mármol.

### Neutral
- **Mármol** (#F5F4F0): fondo de página.
- **Mármol veteado** (#ECEAE3): sección de opiniones y fondos de foto mientras carga.
- **Tinta** (#17231F): titulares y texto destacado.
- **Tinta suave** (#4A5752): texto corrido (6,7:1 sobre mármol).
- **Marfil** (#F2EDE1): texto sobre verde; al 74 % para texto secundario.

### Named Rules
**La regla de la voz única.** Un solo color de marca (verde) y un solo acento (oro). Nada de azules, terracotas ni degradados de color.

## Typography

**Display Font:** Cormorant Garamond (con Iowan Old Style, Palatino, Georgia)
**Body Font:** Jost (con Avenir Next, Segoe UI, system-ui)

**Character:** la romana de pesos medios recuerda las letras del rótulo; Jost, la sans de la carta impresa.

### Hierarchy
- **Display** (500, clamp(2.7rem → 5rem), 1.02): titular de portada, dos líneas.
- **Headline** (500, clamp(2.15rem → 3.35rem), 1.06): titulares de sección.
- **Title** (600, 1.5rem, 1.3): nombres de platos y momentos del día.
- **Body** (400, 1.0625rem, 1.65): texto corrido, máximo unos 34rem.
- **Label** (500, 0.8125rem, 0.14em, mayúsculas): solo botones, pestañas y pies de foto.

### Named Rules
**La regla del titular limpio.** Titulares en caja baja, sin cursivas, sin palabras resaltadas en color y sin antetítulos encima.

## Layout

Contenedor de 1240px con margen lateral fluido clamp(20px, 5vw, 56px) y rejilla de 12 columnas en escritorio. Secciones con padding vertical clamp(88px, 10vw, 152px). Cabeceras de sección centradas (rombo, titular, una frase). Por debajo de 1000px las rejillas pasan a una columna; por debajo de 1080px la navegación pasa a menú a pantalla completa. En móvil la foto de portada ocupa la parte superior con el rótulo entero y se funde con el verde donde va el texto.

## Elevation & Depth

Superficies planas; la profundidad la dan las fotos. Las fotografías llevan una sombra suave y tintada en verde, y un contorno de 1px al 8 % de negro.

### Shadow Vocabulary
- **Foto** (`box-shadow: 0 1px 2px rgb(19 37 31 / 0.06), 0 18px 40px -18px rgb(19 37 31 / 0.35)`): fotos de La casa, el recorrido del día, la galería y el mapa.

## Shapes

Esquinas casi rectas (2px) en botones, fotos y paneles. Filetes de 1px. El rombo (cuadrado girado 45°) marca listas, platos y el adorno de las cabeceras.

## Components

### Buttons
- **Shape:** casi recto (2px), alto 50px, etiqueta en mayúsculas espaciadas.
- **Primary:** marfil sobre verde o foto (`button-claro`); verde sobre mármol (`button-verde`).
- **Secondary:** contorno de 1px (marfil al 55 % sobre foto, tinta al 28 % sobre mármol).
- **Hover / Press:** cambio de fondo o borde en 220ms; escala 0.96 al pulsar.

### Navigation
Cabecera fija de 76px (64px en móvil), transparente sobre la portada y mármol translúcido después. Subrayado que crece al pasar el ratón; la sección activa se marca con un filete dorado de 2px.

### La carta (componente propio)
Panel verde con celosía dorada al 7 % (la pared del local), pestañas con indicador dorado deslizante y platos en dos columnas marcados con un rombo dorado. Sin precios hasta que el negocio los confirme.

### Del café a la copa (componente propio)
Escenario fijo con tres fotos que se relevan con una cortinilla vertical al avanzar el texto. En móvil cada momento lleva su propia foto.

## Do's and Don'ts

### Do:
- **Do** usar fotos reales del local o de clientes (Google e Instagram), optimizadas en WebP.
- **Do** reservar el oro (#C9AB72) para filetes, rombos e indicadores.
- **Do** mantener el registro de usted en los textos dirigidos al cliente.

### Don't:
- **Don't** usar cursivas ni palabras en color dentro de los titulares.
- **Don't** añadir antetítulos, números de sección, marquesinas o etiquetas monoespaciadas.
- **Don't** inventar platos, servicios ni precios que el café no haya confirmado.
