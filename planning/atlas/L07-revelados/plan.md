# L07-revelados · Revelados y animación

data-reveal y efectos de aparición, transformación y luz.

Deck: `atlas/completo/index.html`. Diapositivas con id `l07-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l07-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l07-data-reveal` … sublote [Revelados (data-reveal)](data-reveal.md): 10 diapositivas
3. `l07-trama`: trama (HalftoneReveal) · **quizás**
4. `l07-pixeles`: pixeles (PixelTransition) · **quizás**
5. `l07-q-ditherveil`: DitherVeil · **quizás**
6. `l07-q-pixelswap`: PixelSwap · **quizás**
7. `l07-q-glare`: GlareHover · **quizás**
8. `l07-q-gradualblur`: GradualBlur · **quizás**
9. `l07-q-scrollexpand`: ScrollExpand · **quizás**
10. `l07-q-laserflow`: LaserFlow · **quizás**
11. `l07-q-electriclogo`: ElectricLogo · **quizás**
12. `l07-q-strands`: Strands · **quizás**
13. `l07-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **22 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ac-ficha` de L00; marcado en `L00-infra/resumen.md`)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro
- En los «quizás»: etiqueta visible «experimental · quizás»; datos de ejemplo marcados como «sintéticos»

## Componentes

### `data-reveal` · Revelados (data-reveal)

- **Diapositiva:** `l07-data-reveal` (sublote, ver [data-reveal.md](data-reveal.md))
- **Propósito (texto de la ficha):** Dar a cada paso el gesto de aparición del estilo o uno fijo
- **Archivo fuente:** `fx/sistema.js resolveReveals() Motor.revealStyle · engine/engine.css [data-rv]`
- **Parámetros que muestra la ficha:** `valores`: ["auto", "fade", "wipe", "wipe-x", "focus", "develop", "mist", "pixel", "tilt"]; `ambito`: [data-step] o <html>
- **Origen en react-bits:** [AnimatedContent](../../../../../react-bits/src/content/Animations/AnimatedContent/AnimatedContent.jsx) (base), [FadeContent](../../../../../react-bits/src/content/Animations/FadeContent/FadeContent.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** una diapositiva por variante, ver [data-reveal.md](data-reveal.md)

### `trama` · trama (HalftoneReveal) · quizás

- **Diapositiva:** `l07-trama`
- **Propósito (texto de la ficha):** Foto en trama de semitonos (puntos, mono o duotono) que pasa a la foto real bajo el cursor
- **Archivo fuente:** `react-bits/src/content/Animations/HalftoneReveal/HalftoneReveal.jsx (aún no portado al motor)`
- **Nota:** recomendado sin implementar
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/HalftoneReveal/HalftoneReveal.jsx](../../../../../react-bits/src/content/Animations/HalftoneReveal/HalftoneReveal.jsx) (825 líneas), CSS [HalftoneReveal.css](../../../../../react-bits/src/content/Animations/HalftoneReveal/HalftoneReveal.css), props en [HalftoneRevealDemo.jsx](../../../../../react-bits/src/demo/Animations/HalftoneRevealDemo.jsx), uso en [halftoneRevealCode.js](../../../../../react-bits/src/constants/code/Animations/halftoneRevealCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** IMPLEMENTAR (como `trama`) · coste M · valor 2 · estilos: suizo, arcilla, celula (H&E impreso) / noche
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/trama.js` (+ `fx/experimental/trama.css` si hace falta) como pieza por clase con el nombre `trama`. Antes, buscar `trama` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l07-trama`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (24):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `src` | string | 'https://images.unsplash.com/...' | Image to print. Transparent or plain backgrounds are left unprinted. Must be served with CORS headers. | `data-src` |
  | `fit` | 'contain' \| 'cover' | 'cover' | Show the whole image, or crop it to fill the container. | `data-fit` |
  | `mode` | 'mono' \| 'duotone' \| 'color' | 'mono' | One ink, two inks at different screen angles, or full color: CMYK on light paper and RGB light on dark paper. | `data-mode` |
  | `shape` | 'dot' \| 'ellipse' \| 'square' \| 'diamond' \| 'line' \| 'cross' | 'dot' | Shape of the halftone marks. | `data-shape` |
  | `cellSize` | number | 6 | Spacing of the halftone screen, in px. | `data-cell-size` |
  | `angle` | number | 45 | Rotation of the screen, in degrees. | `data-angle` |
  | `dotScale` | number | 1 | Scales every mark. Below 1 keeps them apart, above 1 lets them merge sooner. | `data-dot-scale` |
  | `inkColor` | string | '#120f17' | Color of the printed marks. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `accentColor` | string | '#ff4f2a' | Second ink used in duotone mode. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `paperColor` | string | '#ffffff' | Background the image is printed on. Match it to your page. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `contrast` | number | 1.1 | Tonal contrast applied before printing. | `data-contrast` |
  | `brightness` | number | 0 | Shifts the image lighter or darker before printing. | `data-brightness` |
  | `invert` | boolean | false | Prints a negative of the image. | `data-invert` |
  | `roughness` | number | 0 | Gives the marks ragged, ink-spread edges, from 0 to 1. | `data-roughness` |
  | `misregistration` | number | 0 | Offsets the ink layers like a slightly misaligned press, from 0 to 1. | `data-misregistration` |
  | `revealRadius` | number | 160 | Radius of the area around the cursor where the dots swell into the real photo, in px. | `data-reveal-radius` |
  | `softness` | number | 0.6 | Width of the band where the dots grow into the photo. 0 is a hard edge. | `data-softness` |
  | `linger` | number | 1.2 | Seconds the revealed trail takes to shrink back into print. 0 turns the trail off. | `data-linger` |
  | `reverse` | boolean | false | Start as the photo and print wherever the cursor goes. | `data-reverse` |
  | `wander` | boolean | false | Lets the reveal drift around on its own while the pointer is away. | `data-wander` |
  | `clickBurst` | boolean | true | Clicking sends a ring of color rippling out through the print. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Grows the dots in from the center on load. | `data-intro` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `pixeles` · pixeles (PixelTransition) · quizás

- **Diapositiva:** `l07-pixeles`
- **Propósito (texto de la ficha):** Una tarjeta se cubre de píxeles, cambia el contenido y se aclara (patrones al azar, Bayer, onda, barrido)
- **Archivo fuente:** `react-bits/src/content/Animations/PixelTransition/PixelTransition.jsx (aún no portado al motor)`
- **Nota:** recomendado sin implementar
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/PixelTransition/PixelTransition.jsx](../../../../../react-bits/src/content/Animations/PixelTransition/PixelTransition.jsx) (398 líneas), CSS [PixelTransition.css](../../../../../react-bits/src/content/Animations/PixelTransition/PixelTransition.css), props en [PixelTransitionDemo.jsx](../../../../../react-bits/src/demo/Animations/PixelTransitionDemo.jsx), uso en [pixelTransitionCode.js](../../../../../react-bits/src/constants/code/Animations/pixelTransitionCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** IMPLEMENTAR (cambio antes/después por paso) · coste S–M · valor 2 · estilos: matriz, noche, termica / aurora, arcilla
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/pixeles.js` (+ `fx/experimental/pixeles.css` si hace falta) como pieza por clase con el nombre `pixeles`. Antes, buscar `pixeles` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l07-pixeles`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (19):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `firstContent` | ReactNode | - | Content shown by default. | `data-first-content` |
  | `secondContent` | ReactNode | - | Content revealed by the transition. | `data-second-content` |
  | `gridSize` | number | 10 | Number of pixels across the card. Rows follow so every pixel stays square. | `data-grid-size` |
  | `pixelColor` | string | '#ffffff' | Color of the pixels. Any CSS color works. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `mosaic` | number | 0 | Gives each pixel a slightly different tone of the pixel color, from 0 to 1. | `data-mosaic` |
  | `animationStepDuration` | number | 0.4 | Seconds the pixels take to cover the card, and again to clear it. | `data-animation-step-duration` |
  | `pattern` | 'random' \| 'dither' \| 'ripple' \| 'wipe' | 'random' | Order the pixels appear in. Ripple spreads from the pointer and wipe sweeps in from the edge it crossed. | `data-pattern` |
  | `randomness` | number | 0.3 | Breaks up the ripple and wipe fronts, from 0 to 1. | `data-randomness` |
  | `pixelAnimation` | 'pop' \| 'grow' \| 'fade' | 'pop' | How each pixel appears and disappears. | `data-pixel-animation` |
  | `pixelShape` | 'square' \| 'rounded' \| 'circle' | 'square' | Shape of the pixels while the transition runs. They merge into a solid cover at the midpoint. | `data-pixel-shape` |
  | `gap` | number | 0 | Space between pixels in pixels. | `data-gap` |
  | `fps` | number | 0 | Caps how often the pixels redraw for a choppy retro feel. 0 redraws every frame. | `data-fps` |
  | `trigger` | 'hover' \| 'click' | 'hover' | What starts the transition. | `data-trigger` |
  | `active` | boolean | - | Controls the state from outside. Pair it with onActiveChange. | `data-active` |
  | `once` | boolean | false | Keeps the second content once it has been revealed. | no aplica (React) |
  | `onActiveChange` | (active: boolean) => void | - | Called when hover, focus or a click asks for the other content. | no aplica (React) |
  | `aspectRatio` | string | '100%' | Height of the card. Percentages work like padding-top ('125%'), anything else is a CSS ratio ('4 / 5'). | `data-aspect-ratio` |
  | `className` | string | '' | Extra class names for the card. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the card. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-ditherveil` · DitherVeil · quizás

- **Diapositiva:** `l07-q-ditherveil`
- **Propósito (texto de la ficha):** Foto en 1 bit (Floyd/Bayer) que el cursor «quema» hasta el color; deambula sola
- **Archivo fuente:** `react-bits/src/content/Animations/DitherVeil/DitherVeil.jsx (aún no portado al motor)`
- **Nota:** modo dither de trama
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/DitherVeil/DitherVeil.jsx](../../../../../react-bits/src/content/Animations/DitherVeil/DitherVeil.jsx) (809 líneas), CSS [DitherVeil.css](../../../../../react-bits/src/content/Animations/DitherVeil/DitherVeil.css), props en [DitherVeilDemo.jsx](../../../../../react-bits/src/demo/Animations/DitherVeilDemo.jsx), uso en [ditherVeilCode.js](../../../../../react-bits/src/constants/code/Animations/ditherVeilCode.js).
- **Dependencias del original:** `ogl`
- **Informe:** QUIZÁ (como modo `dither` de `trama`) · coste M · valor 2 · estilos: matriz, noche / aurora, arcilla
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-ditherveil.js` (+ `fx/experimental/exp-ditherveil.css` si hace falta) como pieza por clase con el nombre `exp-ditherveil`. Antes, buscar `exp-ditherveil` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l07-q-ditherveil`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (20):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `src` | string | 'https://images.unsplash.com/...' | Image to veil. Must be served with CORS headers. | `data-src` |
  | `fit` | 'contain' \| 'cover' | 'contain' | Show the whole image on the ink, or crop it to fill the container. | `data-fit` |
  | `pattern` | 'bayer' \| 'noise' \| 'atkinson' \| 'floyd' \| 'lines' | 'floyd' | How the image is broken into dots: an ordered Bayer grid, blue noise stipple, Atkinson or Floyd-Steinberg error diffusion, or diagonal engraving lines. | `data-pattern` |
  | `palette` | 'duotone' \| 'rgb' | 'duotone' | Duotone maps brightness between the ink and paper colours. RGB dithers each channel for a retro colour look. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `pixelSize` | number | 2 | Size of each dither cell, in px. | `data-pixel-size` |
  | `levels` | number | 2 | Tones per channel. 2 is pure 1-bit, higher values add in-between shades. | `data-levels` |
  | `inkColor` | string | '#120f17' | Colour of the darkest tone. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `paperColor` | string | '#f4f1ea' | Colour of the lightest tone. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `contrast` | number | 1.15 | Tonal contrast applied before dithering. | `data-contrast` |
  | `brightness` | number | 0 | Shifts the image lighter or darker before dithering. | `data-brightness` |
  | `revealRadius` | number | 200 | Radius of the full-colour window around the cursor, in px. | `data-reveal-radius` |
  | `softness` | number | 0.6 | How much of the reveal edge dissolves through the dither. 0 is a hard cut. | `data-softness` |
  | `linger` | number | 1 | Seconds the revealed trail takes to knit back into dither. 0 turns the trail off. | `data-linger` |
  | `rimColor` | string | '#a78bfa' | Colour of the cells along the dissolving edge. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `rim` | number | 0 | Thickness of the coloured rim on the dissolving edge. 0 hides it. | `data-rim` |
  | `reverse` | boolean | false | Start in full colour and dither wherever the cursor goes. | `data-reverse` |
  | `wander` | boolean | false | Let the reveal drift around on its own while the pointer is away. | `data-wander` |
  | `clickBurst` | boolean | true | Clicking sends a ring of colour rippling out across the image. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `className` | string | '' | Extra classes on the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles on the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-pixelswap` · PixelSwap · quizás

- **Diapositiva:** `l07-q-pixelswap`
- **Propósito (texto de la ficha):** El contenido nuevo entra píxel a píxel en una ola con muelle
- **Archivo fuente:** `react-bits/src/content/Animations/PixelSwap/PixelSwap.jsx (aún no portado al motor)`
- **Nota:** fusionar en pixeles
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/PixelSwap/PixelSwap.jsx](../../../../../react-bits/src/content/Animations/PixelSwap/PixelSwap.jsx) (436 líneas), CSS [PixelSwap.css](../../../../../react-bits/src/content/Animations/PixelSwap/PixelSwap.css), props en [PixelSwapDemo.jsx](../../../../../react-bits/src/demo/Animations/PixelSwapDemo.jsx), uso en [pixelSwapCode.js](../../../../../react-bits/src/constants/code/Animations/pixelSwapCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (fusionar en `pixeles`) · coste M · valor 1 · estilos: matriz, noche
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-pixelswap.js` (+ `fx/experimental/exp-pixelswap.css` si hace falta) como pieza por clase con el nombre `exp-pixelswap`. Antes, buscar `exp-pixelswap` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l07-q-pixelswap`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `firstContent` | ReactNode | - | Content shown at rest. | `data-first-content` |
  | `secondContent` | ReactNode | - | Content that builds in pixel by pixel. | `data-second-content` |
  | `pattern` | 'pointer' \| 'random' \| 'center' \| 'edges' \| 'left-to-right' \| 'right-to-left' \| 'top-to-bottom' \| 'bottom-to-top' \| 'diagonal' \| 'spiral' | 'pointer' | Order the pixels arrive in. Pointer starts the wave where the cursor enters, leaves or clicks. | `data-pattern` |
  | `pixelSize` | number | 48 | Edge length of each pixel in px. Grows automatically when the grid would pass 600 pixels. | `data-pixel-size` |
  | `gap` | number | 0 | Space between pixels in px while they grow. | `data-gap` |
  | `pixelRadius` | number | 0 | Corner rounding of the pixels while they grow, as a percentage. 50 starts them as dots. | `data-pixel-radius` |
  | `pixelScale` | number | 0 | Size each pixel pops in at, from 0 to grow out of nothing to 0.9 for a hard pop. | `data-pixel-scale` |
  | `pixelSpin` | number | 0 | Degrees each pixel turns as it grows in. | `data-pixel-spin` |
  | `duration` | number | 400 | Time in ms the wave takes to cross the content. | `data-duration` |
  | `pixelDuration` | number | 350 | Time in ms a single pixel takes to grow. | `data-pixel-duration` |
  | `randomness` | number | 0.2 | Noise mixed into the pattern, from 0 for a clean wave to 1 for a scatter. | `data-randomness` |
  | `bounce` | number | 0.3 | How far each pixel overshoots before it settles, from 0 to 1. | `data-bounce` |
  | `trigger` | 'hover' \| 'click' \| 'none' | 'hover' | What starts the swap. With none, drive it with active. | `data-trigger` |
  | `intro` | boolean | true | Builds the first content in from pixels on mount. | `data-intro` |
  | `initialActive` | boolean | false | Starts on the second content. | `data-initial-active` |
  | `active` | boolean | - | Controls which content shows. Pair it with onActiveChange. | `data-active` |
  | `onActiveChange` | (active: boolean) => void | - | Called when the trigger asks to swap. | no aplica (React) |
  | `onComplete` | (active: boolean) => void | - | Called when a swap finishes. | no aplica (React) |
  | `aspectRatio` | string | '16 / 10' | Aspect ratio of the root. | `data-aspect-ratio` |
  | `className` | string | '' | Extra class names for the root. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the root. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-glare` · GlareHover · quizás

- **Diapositiva:** `l07-q-glare`
- **Propósito (texto de la ficha):** Destello que cruza un elemento; tiene `mode="loop"` con intervalo
- **Archivo fuente:** `react-bits/src/content/Animations/GlareHover/GlareHover.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/GlareHover/GlareHover.jsx](../../../../../react-bits/src/content/Animations/GlareHover/GlareHover.jsx) (291 líneas), CSS [GlareHover.css](../../../../../react-bits/src/content/Animations/GlareHover/GlareHover.css), props en [GlareHoverDemo.jsx](../../../../../react-bits/src/demo/Animations/GlareHoverDemo.jsx), uso en [glareHoverCode.js](../../../../../react-bits/src/constants/code/Animations/glareHoverCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste S · valor 1 · estilos: rice, arcilla / cromo ya tiene `cromo-sheen`
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-glare.js` (+ `fx/experimental/exp-glare.css` si hace falta) como pieza por clase con el nombre `exp-glare`. Antes, buscar `exp-glare` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l07-q-glare`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `children` | ReactNode | - | The content the glare passes over. | no aplica (React) |
  | `mode` | 'hover' \| 'follow' \| 'loop' \| 'click' | 'hover' | Sweep on hover, follow the cursor, shine on a timer, or sweep on click. | `data-mode` |
  | `variant` | 'streak' \| 'twin' \| 'sheen' | 'streak' | Shape of the glare: one bright streak, a double streak like glass, or a soft wide sheen. | `data-variant` |
  | `glareColor` | string | '#ffffff' | Color of the glare. Any CSS color. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `glareOpacity` | number | 0.5 | Brightness of the glare, from 0 to 1. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `glareSize` | number | 30 | Width of the glare as a percentage of the element's diagonal. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `softness` | number | 0.6 | How soft the core of the glare is, from 0 to 1. | `data-softness` |
  | `glareAngle` | number | -45 | Direction the glare travels, in degrees. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `blendMode` | string | 'screen' | How the glare mixes with the content: screen, normal, overlay or soft-light. | `data-blend-mode` |
  | `rimGlint` | boolean | true | Lets the edge catch the light where the glare crosses it. | `data-rim-glint` |
  | `transitionDuration` | number | 650 | How long one sweep takes, in milliseconds. | `data-transition-duration` |
  | `interval` | number | 3 | Seconds between shines in loop mode. | `data-interval` |
  | `playOnce` | boolean | false | In hover mode, sweeps only on the way in instead of again on the way out. | `data-play-once` |
  | `intro` | boolean | false | Sweeps once when the element first scrolls into view. | `data-intro` |
  | `width` | string | 'auto' | Width of the element. | `data-width` |
  | `height` | string | 'auto' | Height of the element. | `data-height` |
  | `background` | string | 'transparent' | Background of the element. | `data-background` |
  | `borderRadius` | string | '10px' | Corner radius of the element. | `data-border-radius` |
  | `borderColor` | string | 'transparent' | Border color of the element. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `className` | string | '' | Extra class names for the element. | no aplica (React) |
  | `style` | CSSProperties | {} | Inline styles for the element. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-gradualblur` · GradualBlur · quizás

- **Diapositiva:** `l07-q-gradualblur`
- **Propósito (texto de la ficha):** Desenfoque progresivo en un borde (capas de `backdrop-filter`)
- **Archivo fuente:** `react-bits/src/content/Animations/GradualBlur/GradualBlur.jsx (aún no portado al motor)`
- **Nota:** clase .borde-difuso
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/GradualBlur/GradualBlur.jsx](../../../../../react-bits/src/content/Animations/GradualBlur/GradualBlur.jsx) (246 líneas), CSS [GradualBlur.css](../../../../../react-bits/src/content/Animations/GradualBlur/GradualBlur.css), props en [GradualBlurDemo.jsx](../../../../../react-bits/src/demo/Animations/GradualBlurDemo.jsx), uso en [gradualblurCode.js](../../../../../react-bits/src/constants/code/Animations/gradualblurCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (clase `.borde-difuso` para listas o código que se cortan) · coste S · valor 1 · estilos: aurora, rice, nube / suizo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-gradualblur.js` (+ `fx/experimental/exp-gradualblur.css` si hace falta) como pieza por clase con el nombre `exp-gradualblur`. Antes, buscar `exp-gradualblur` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l07-q-gradualblur`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (19):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `position` | 'top' \| 'bottom' \| 'left' \| 'right' | 'bottom' | Edge the blur grows toward. | `data-position` |
  | `target` | 'parent' \| 'page' | 'parent' | Sit inside the nearest positioned parent, or stay fixed to the edge of the viewport. | `data-target` |
  | `height` | string \| number | '6rem' | How far the blur reaches in from the edge. For left and right this is its width. Numbers are px. | `data-height` |
  | `width` | string \| number | - | For top and bottom, a narrower centered band. For left and right, overrides height. | `data-width` |
  | `strength` | number | 2 | How blurry the very edge gets. Each step adds about 12px of blur. | `data-strength` |
  | `layers` | number | 8 | Blur layers stacked across the ramp. More layers give a smoother falloff, fewer show visible steps. | `data-layers` |
  | `curve` | 'linear' \| 'bezier' \| 'ease-in' \| 'ease-out' \| 'ease-in-out' | 'linear' | How the blur builds across the ramp. bezier is a smooth S-curve. | `data-curve` |
  | `exponential` | boolean | true | Doubles the blur toward the edge so it starts gently. Turn off for an even ramp. | `data-exponential` |
  | `opacity` | number | 1 | Opacity of the blur layers. Lower values let the sharp content show through. | `data-opacity` |
  | `saturation` | number | 1 | Color boost of the blurred content, building toward the edge, for a glassy look. | `data-saturation` |
  | `tint` | string | 'transparent' | Color the content fades into at the edge, such as your page background. Use rgba for a lighter wash. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `autoHide` | boolean | false | Fades the blur out when the scroll container reaches this edge, so it only shows while there is more to scroll. | `data-auto-hide` |
  | `container` | string \| HTMLElement \| RefObject | - | Scroll container watched by autoHide. Defaults to a scrollable sibling or the parent, or the page when target is page. | `data-container` |
  | `hoverIntensity` | number | 1 | Multiplies the blur while the cursor is over it. 0 clears it on hover, 2 doubles it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `duration` | number \| string | 0.3 | Length of the hover and autoHide transitions, in seconds or as a CSS time. | `data-duration` |
  | `easing` | string | 'ease-out' | CSS easing of those transitions. | `data-easing` |
  | `zIndex` | number | 1000 | Stacking order of the overlay. | `data-z-index` |
  | `className` | string | '' | Extra class names for the overlay. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the overlay. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-scrollexpand` · ScrollExpand · quizás

- **Diapositiva:** `l07-q-scrollexpand`
- **Propósito (texto de la ficha):** Marco redondeado que crece hasta sangre con el scroll
- **Archivo fuente:** `react-bits/src/content/Animations/ScrollExpand/ScrollExpand.jsx (aún no portado al motor)`
- **Nota:** en un paso, la foto se amplía a sangre
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/ScrollExpand/ScrollExpand.jsx](../../../../../react-bits/src/content/Animations/ScrollExpand/ScrollExpand.jsx) (241 líneas), CSS [ScrollExpand.css](../../../../../react-bits/src/content/Animations/ScrollExpand/ScrollExpand.css), props en [ScrollExpandDemo.jsx](../../../../../react-bits/src/demo/Animations/ScrollExpandDemo.jsx), uso en [scrollExpandCode.js](../../../../../react-bits/src/constants/code/Animations/scrollExpandCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (en un paso: la foto se amplía a sangre) · coste S · valor 2 · estilos: todos (cada uno con su easing)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-scrollexpand.js` (+ `fx/experimental/exp-scrollexpand.css` si hace falta) como pieza por clase con el nombre `exp-scrollexpand`. Antes, buscar `exp-scrollexpand` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l07-q-scrollexpand`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (20):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `src` | string | '' | Image or video URL shown inside the frame. | `data-src` |
  | `mediaType` | "image" \| "video" | "image" | Whether the source is an image or a looping muted video. | `data-media-type` |
  | `poster` | string | '' | Poster frame used while a video loads. | `data-poster` |
  | `alt` | string | '' | Alt text for the image. | `data-alt` |
  | `title` | string | '' | Headline held over the frame that lifts away as the media takes over. | `data-title` |
  | `scrollHint` | string | '' | Small cue shown under the resting frame that fades away as soon as the scroll begins. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `startWidth` | number | 42 | Frame width before expanding, as a percentage of the stage. | `data-start-width` |
  | `startHeight` | number | 58 | Frame height before expanding, as a percentage of the stage. | `data-start-height` |
  | `startRadius` | number | 24 | Corner radius of the resting frame, in px. | `data-start-radius` |
  | `endRadius` | number | 0 | Corner radius once fully expanded, in px. | `data-end-radius` |
  | `mediaZoom` | number | 1.35 | How far the media is zoomed in at rest. It eases back to 1 as the frame opens up. | `data-media-zoom` |
  | `scrollDistance` | number | 1.2 | Scroll length of the expansion, in multiples of the stage height. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `holdDistance` | number | 0.35 | Extra scroll the frame stays pinned at full bleed before releasing. | `data-hold-distance` |
  | `smoothing` | number | 0.1 | Follow time in seconds. 0 locks the frame exactly to the scrollbar. | `data-smoothing` |
  | `overlayScrim` | number | 0.45 | Strength of the gradient scrim that fades in to keep overlay content readable. | `data-overlay-scrim` |
  | `useWindowScroll` | boolean | false | Drive the expansion from the page scroll instead of the component’s own scroller. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `enabled` | boolean | true | Enable or disable the expansion. | `data-enabled` |
  | `children` | React.ReactNode | — | Content that fades in over the media once it reaches full bleed. | no aplica (React) |
  | `className` | string | '' | Additional class names for the container. | no aplica (React) |
  | `style` | object | — | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-laserflow` · LaserFlow · quizás

- **Diapositiva:** `l07-q-laserflow`
- **Propósito (texto de la ficha):** Haz de luz que cae sobre un elemento y se derrama por sus esquinas, con niebla y polvo
- **Archivo fuente:** `react-bits/src/content/Animations/LaserFlow/LaserFlow.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/LaserFlow/LaserFlow.jsx](../../../../../react-bits/src/content/Animations/LaserFlow/LaserFlow.jsx) (869 líneas), CSS [LaserFlow.css](../../../../../react-bits/src/content/Animations/LaserFlow/LaserFlow.css), props en [LaserFlowDemo.jsx](../../../../../react-bits/src/demo/Animations/LaserFlowDemo.jsx), presets en [LaserFlow.js](../../../../../react-bits/src/demo/Animations/presets/LaserFlow.js), uso en [laserFlowCode.js](../../../../../react-bits/src/constants/code/Animations/laserFlowCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste M · valor 2 · estilos: noche, aurora, rice / suizo, arcilla, celula
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-laserflow.js` (+ `fx/experimental/exp-laserflow.css` si hace falta) como pieza por clase con el nombre `exp-laserflow`. Antes, buscar `exp-laserflow` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l07-q-laserflow`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (25):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `surfaceRef` | RefObject<HTMLElement> | - | Element the beam lands on. The light spreads along its top edge and spills over its corners. | `data-surface-ref` |
  | `beamPosition` | number | 0.6 | Horizontal position of the beam, from 0 at the left edge to 1 at the right edge. | `data-beam-position` |
  | `surfaceLevel` | number | 1 | Where the beam lands when no surfaceRef is given, from 0 at the top to 1 at the bottom. | `data-surface-level` |
  | `color` | string | '#3847ff' | Color of the light. Every other tone is derived from it. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `intensity` | number | 1.8 | Overall brightness of the light. | `data-intensity` |
  | `beamWidth` | number | 1.5 | Thickness of the beam and its glow. | `data-beam-width` |
  | `flare` | number | 1.5 | Size of the splash where the beam meets the surface. | `data-flare` |
  | `spread` | number | 1.5 | How far the light travels along the surface. | `data-spread` |
  | `spill` | number | 1 | How much light pours over the corners of the surface. | `data-spill` |
  | `fog` | number | 0.2 | Amount of smoke lit up by the beam. 0 turns it off. | `data-fog` |
  | `dust` | number | 1.6 | Amount of glittering dust flowing with the light. | `data-dust` |
  | `streaks` | number | 1.5 | Brightness of the fine lines flowing along the splash. | `data-streaks` |
  | `dots` | number | 1 | Strength of the fine dot texture in the glow. | `data-dots` |
  | `pulse` | number | 1.5 | How much the splash breathes over time. | `data-pulse` |
  | `speed` | number | 1.5 | Animation speed. 0 holds the light still. | `data-speed` |
  | `seed` | number | 3 | Changes the shape of the smoke. | `data-seed` |
  | `mouseInteraction` | boolean | true | Brightens the light, smoke and dust softly around the cursor. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `revealImage` | string | - | Image revealed through the light around the cursor, such as a screenshot of your UI. | `data-reveal-image` |
  | `revealRadius` | number | 220 | Radius of the reveal around the cursor, in pixels. | `data-reveal-radius` |
  | `revealOpacity` | number | 0.6 | Strength of the revealed image. 0 hides it. | `data-reveal-opacity` |
  | `intro` | boolean | true | Drops the beam in and lets the light run along the surface on mount. | `data-intro` |
  | `theme` | 'dark' \| 'light' | 'dark' | Use light for light page backgrounds. | `data-theme` |
  | `paused` | boolean | false | Freezes the animation. | `data-paused` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-electriclogo` · ElectricLogo · quizás

- **Diapositiva:** `l07-q-electriclogo`
- **Propósito (texto de la ficha):** Rayos que recorren el contorno de un logo SVG
- **Archivo fuente:** `react-bits/src/content/Animations/ElectricLogo/ElectricLogo.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/ElectricLogo/ElectricLogo.jsx](../../../../../react-bits/src/content/Animations/ElectricLogo/ElectricLogo.jsx) (1009 líneas), CSS [ElectricLogo.css](../../../../../react-bits/src/content/Animations/ElectricLogo/ElectricLogo.css), props en [ElectricLogoDemo.jsx](../../../../../react-bits/src/demo/Animations/ElectricLogoDemo.jsx), uso en [electricLogoCode.js](../../../../../react-bits/src/constants/code/Animations/electricLogoCode.js).
- **Dependencias del original:** `ogl`
- **Informe:** QUIZÁ · coste L · valor 1 · estilos: noche / suizo, arcilla
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-electriclogo.js` (+ `fx/experimental/exp-electriclogo.css` si hace falta) como pieza por clase con el nombre `exp-electriclogo`. Antes, buscar `exp-electriclogo` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l07-q-electriclogo`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `src` | string | lightning bolt | Any image URL. SVGs and transparent PNGs are traced by their alpha, opaque images by keying out their backdrop colour. | `data-src` |
  | `color` | string | '#ecc7ff' | Colour of the hot core of every strand. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `glowColor` | string | '#ad6dff' | Colour of the glow around the strands, the bloom and the interior fill. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `scale` | number | 0.7 | Size of the logo as a fraction of the container. The glow and arcs extend beyond it. | `data-scale` |
  | `intensity` | number | 1 | Overall brightness of the effect. | `data-intensity` |
  | `glow` | number | 1 | Strength of the halo around strands and the soft bloom around the shape. | `data-glow` |
  | `thickness` | number | 1.5 | Width of the main strand, in px. Satellite strands are thinner, and every strand swells and thins as it flows. | `data-thickness` |
  | `strands` | number | 4 | Number of filaments tracing the outline, from 1 to 6. Extra strands come and go along the edge. | `data-strands` |
  | `bend` | number | 0.6 | How far the strands sway and ripple away from the outline. The main strand stays closest. | `data-bend` |
  | `crackle` | number | 1.5 | Size of the fine crinkle along every strand and arc. | `data-crackle` |
  | `arcs` | number | 1 | How often short arcs leap off the edge and land further along it. 0 turns them off. | `data-arcs` |
  | `flicker` | number | 0.6 | How much the whole effect pulses and each strand shimmers in brightness. | `data-flicker` |
  | `fill` | number | 0 | Translucent glow inside the shape, brightest near its edges. | `data-fill` |
  | `speed` | number | 2.5 | Animation speed. 0 freezes the current frame. | `data-speed` |
  | `interactive` | boolean | true | Turn on pointer interactions. Hovering charges the lightning around the cursor, and a click sends a ripple through it with a burst of arcs. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `cursorIntensity` | number | 0.75 | How strongly the lightning charges up around the cursor. 0 turns the hover charge off. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `cursorRadius` | number | 100 | Radius of the charged area around the cursor, in px. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `theme` | 'dark' \| 'light' | 'dark' | The background the logo sits on. Dark renders the lightning as emitted light. Light renders crisp electric ink with a white-hot core and a lighter fill. | `data-theme` |
  | `onRender` | (canvas: HTMLCanvasElement) => void | undefined | Called immediately after each rendered frame. Copy the canvas synchronously to capture the current frame for effects such as live reflections. | no aplica (React) |
  | `className` | string | '' | Extra classes on the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles on the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-strands` · Strands · quizás

- **Diapositiva:** `l07-q-strands`
- **Propósito (texto de la ficha):** Esfera de cristal con hebras espectrales, tipo Siri; reacciona a un nivel de «voz» simulado
- **Archivo fuente:** `react-bits/src/content/Animations/Strands/Strands.jsx (aún no portado al motor)`
- **Nota:** solo decks de voz o asistentes
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/Strands/Strands.jsx](../../../../../react-bits/src/content/Animations/Strands/Strands.jsx) (677 líneas), CSS [Strands.css](../../../../../react-bits/src/content/Animations/Strands/Strands.css), props en [StrandsDemo.jsx](../../../../../react-bits/src/demo/Animations/StrandsDemo.jsx), uso en [strandsCode.js](../../../../../react-bits/src/constants/code/Animations/strandsCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (solo decks sobre voz o asistentes) · coste M · valor 1 · estilos: aurora, noche / suizo, arcilla
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-strands.js` (+ `fx/experimental/exp-strands.css` si hace falta) como pieza por clase con el nombre `exp-strands`. Antes, buscar `exp-strands` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l07-q-strands`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (29):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `colors` | string[] | Siri palette | Colors of the strands, in order: the red top edge of the bulge, orange, amber, the warm white core, cyan, blue and deep blue. Fewer colors are spread across these roles. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `count` | number | 3 | How many strands show inside the bulge of light, from 1 to 3. | `data-count` |
  | `speed` | number | 1 | How fast the light turns. 0 holds it still. | `data-speed` |
  | `amplitude` | number | 1 | How tall the arch rises and how deeply the ribbon curves. | `data-amplitude` |
  | `waviness` | number | 1 | How tightly the ribbon twists along its length. | `data-waviness` |
  | `energy` | number | 0.65 | How lively the light is on its own, from 0 to 1. 0 rests as a calm white line, 1 keeps the ribbons fully open. | `data-energy` |
  | `thickness` | number | 1 | How thick the edges of the light are, and the white core where the ribbon turns edge-on. | `data-thickness` |
  | `spread` | number | 1 | How wide the ribbon opens, fanning its colors out. | `data-spread` |
  | `glow` | number | 1 | Strength of the soft glow around the light. | `data-glow` |
  | `taper` | number | 1 | How quickly the light fades toward the sides of the orb. | `data-taper` |
  | `intensity` | number | 1 | Overall brightness of the light. | `data-intensity` |
  | `saturation` | number | 1 | Color saturation of the light. 0 is greyscale. | `data-saturation` |
  | `hueShift` | number | 0 | Rotates the colors of the light around the color wheel, from 0 to 1. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `scale` | number | 1 | Width of the light. | `data-scale` |
  | `glass` | boolean | true | Shows the glass orb. Turn it off for the light on its own. | `data-glass` |
  | `glassSize` | number | 1 | Size of the glass orb. | `data-glass-size` |
  | `refraction` | number | 1 | How strongly the edge of the glass bends the light, wrapping the colors around its rim. | `data-refraction` |
  | `rim` | number | 1 | Brightness of the glass rim and the light it catches. | `data-rim` |
  | `dispersion` | number | 1 | Amount of rainbow color separation along the edge of the glass. | `data-dispersion` |
  | `listening` | boolean | false | Animates the orb as if it were hearing someone speak. | `data-listening` |
  | `level` | number | undefined | Drives the orb from your own audio level, from 0 to 1, for example a microphone volume. Overrides listening. | `data-level` |
  | `interactive` | boolean | true | The light tilts toward the cursor and stirs as it gets close. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `clickPulse` | boolean | true | Clicking sends a burst of motion through the light. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | The orb fades in and the light unfolds from the center when it first appears. | `data-intro` |
  | `lightMode` | boolean | false | For light pages. The orb turns into frosted white glass and the strands use deeper colors with a warm core. | `data-light-mode` |
  | `opacity` | number | 1 | Overall opacity. | `data-opacity` |
  | `maxDevicePixelRatio` | number | 2 | Highest pixel ratio the canvas renders at. | `data-max-device-pixel-ratio` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa
