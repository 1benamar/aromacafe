---
name: Aroma Café Blanes
description: La web como la etiqueta de una lata de café antigua, en el verde del toldo con mostaza, rojo y azul de cartel.
colors:
  verde: "#1C6040"
  verde-hondo: "#134630"
  mostaza: "#F0B830"
  rojo: "#BF3922"
  rojo-hondo: "#9C2C18"
  azul: "#1D3F7A"
  crema: "#F9F0DA"
  papel: "#FFF8E8"
  tinta: "#0F281E"
typography:
  display:
    fontFamily: "Abril Fatface, Rockwell Extra Bold, Georgia, serif"
    fontSize: "clamp(2.4rem, 5.4vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 1.02
  headline:
    fontFamily: "Abril Fatface, Georgia, serif"
    fontSize: "clamp(1.9rem, 2.6vw, 2.6rem)"
    fontWeight: 400
    lineHeight: 1
  label:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    letterSpacing: "0.1em"
  body:
    fontFamily: "Jost, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  base: "2px"
spacing:
  margen: "clamp(1.25rem, 4vw, 3rem)"
  seccion: "clamp(3.5rem, 7vw, 6rem)"
  ancho: "90rem"
components:
  boton:
    backgroundColor: "{colors.mostaza}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    padding: "1rem 1.35rem"
  boton-hover:
    backgroundColor: "{colors.crema}"
  boton-azul:
    backgroundColor: "{colors.azul}"
    textColor: "{colors.crema}"
  boton-azul-hover:
    backgroundColor: "{colors.rojo}"
---

# Design System: Aroma Café Blanes

## Overview

**Creative North Star: "La lata de Aroma"**

La página es la etiqueta de una lata de café antigua hecha para Aroma Café:
marco de doble filete mostaza, rótulo en arco, un emblema serigrafiado de la
fachada real y una tira recortable con el estado y el botón de llamar. El
estilo lo eligió el usuario a partir de una referencia de la galería de
impeccable (Trattoria da Nonna Lucia); se aplica con los colores y los datos
reales del café.

La información útil es la portada: horario de la semana con hoy marcado,
estado abierto o cerrado, teléfono grande y dirección. Cada sección es un
campo de color plano unido a la siguiente por una costura festoneada.

**Key Characteristics:**
- Campos de color plano: verde, rojo, azul y crema, cosidos con festones.
- Rótulo y titulares en Abril Fatface; etiquetas en Antonio condensada.
- Fotos reales enmarcadas como cromos y copias de papel, ligeramente giradas.
- Emblema hecho con la foto de la fachada reducida a cinco tintas planas.

## Colors

Paleta de cartel: el verde del toldo manda, el resto son tintas de imprenta.

### Primary
- **Verde toldo** (#1C6040): campo de la etiqueta y de La casa.
- **Mostaza rótulo** (#F0B830): filetes dobles, nombres de panel, botones, tira recortable, día de hoy.

### Secondary
- **Rojo tinta** (#BF3922): campos del recorrido del día y del cierre, encabezados de la carta, sellos.
- **Azul cobalto** (#1D3F7A): franja superior, campo de la carta, pie y texto de la hoja de carta.

### Neutral
- **Crema** (#F9F0DA): texto sobre campos de color y hoja de la carta.
- **Papel** (#FFF8E8): marcos de cromos y copias de fotos.
- **Tinta** (#0F281E): texto sobre mostaza y papel.

### Named Rules
**La regla del contraste de imprenta.** Mostaza solo en texto grande sobre verde (4,1:1) y en cualquier tamaño sobre azul o como fondo de texto tinta; el texto pequeño sobre verde y rojo va en crema.

## Typography

**Display Font:** Abril Fatface (con Rockwell Extra Bold, Georgia)
**Label Font:** Antonio (con Arial Narrow)
**Body Font:** Jost (con Segoe UI, system-ui)

**Character:** gruesa de lata antigua para el rótulo, condensada de etiqueta para todo lo que es dato, y una sans limpia para leer.

### Hierarchy
- **Display** (400, clamp(2.4rem → 4.4rem), 1.02): titulares de sección.
- **Headline** (400, clamp(1.9rem → 2.6rem)): nombres de panel (Horario, Reservas).
- **Label** (700, 1.15rem, 0.1em, mayúsculas): botones, rótulos, platos, días, teléfono (hasta 6.2rem).
- **Body** (400, 1.0625rem, 1.55): texto corrido y descripciones.

## Layout

Primera pantalla en tres paneles (horario, frente, reservas) dentro de un marco de 90rem; a 1100px el frente pasa arriba y a 820px los paneles se apilan y la tira recortable queda fija abajo. Secciones de 84rem con márgenes clamp(1.25rem, 4vw, 3rem). La carta va en tres columnas sobre una hoja crema, que pasan a dos y a una.

## Elevation & Depth

Plano, como un impreso. La única profundidad la tienen los cromos y las copias de fotos, con sombra de papel (`0 16px 30px -14px` tintada del campo).

## Shapes

Rectángulos rectos, filetes dobles de 6px, óvalo con doble aro mostaza para el emblema, cinta con colas recortadas, medalla circular con texto en anillo, festones de 22px entre secciones y dientes de 12px en la tira recortable.

## Components

### Botones
- **Mostaza:** fondo mostaza, texto tinta, Antonio 700 en mayúsculas; al pasar, crema. Escala 0.96 al pulsar.
- **Azul:** en la tira recortable; al pasar, rojo.

### Tira recortable
Banda mostaza con borde dentado, estado de apertura en vivo, línea de corte discontinua y botón de llamar. Se despega de izquierda a derecha al cargar.

### Sellos
Etiquetas rojas giradas -4° («Popular», «De la casa») que se estampan con un golpe corto al entrar en pantalla. Solo para datos reales (platos más pedidos según Google, las bravas de la casa).

## Do's and Don'ts

### Do:
- **Do** mantener campos de color plano y filetes dobles mostaza.
- **Do** usar solo fotos reales del café; para ilustraciones, pasar una foto real a tintas planas con `tools/cartel.mjs`.

### Don't:
- **Don't** inventar fechas de fundación, precios ni platos para rellenar sellos o medallas.
- **Don't** poner texto pequeño en mostaza sobre verde ni sobre rojo.
