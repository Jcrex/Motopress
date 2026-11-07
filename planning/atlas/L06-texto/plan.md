# L06-texto · Texto y títulos

Entrada de títulos, tratamientos de título por estilo y piezas de texto animado.

Deck: `atlas/completo/index.html`. Diapositivas con id `l06-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l06-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l06-data-title-fx`: Entrada de título (data-title-fx)
3. `l06-titulo-rise`: Preset de título «rise»
4. `l06-titulo-mask-lines`: Preset de título «mask-lines»
5. `l06-titulo-blur`: Preset de título «blur»
6. `l06-titulo-pliega`: Preset de título «pliega»
7. `l06-titulo-enfoca`: Preset de título «enfoca»
8. `l06-titulo-descifra`: Preset de título «descifra»
9. `l06-titulo-cromo-sheen`: Título metálico de Cromo
10. `l06-titulo-termica-heat`: Título térmico de Térmica
11. `l06-descifra`: Texto que se descifra (.descifra)
12. `l06-cifra`: Cifra (.cifra)
13. `l06-paleta`: Paleta de split-flap (.paleta)
14. `l06-teclea`: Terminal que teclea (.teclea)
15. `l06-traza`: traza (StrokeText) · **quizás**
16. `l06-muestrario`: muestrario (TechText) · **quizás**
17. `l06-q-shuffle`: Shuffle · **quizás**
18. `l06-q-scrambled`: ScrambledText · **quizás**
19. `l06-q-fold`: FoldText · **quizás**
20. `l06-q-truefocus`: TrueFocus · **quizás**
21. `l06-q-glitch`: GlitchText · **quizás**
22. `l06-q-depth`: DepthText · **quizás**
23. `l06-q-particle`: ParticleText · **quizás**
24. `l06-q-masked`: MaskedHeading · **quizás**
25. `l06-q-circular`: CircularText · **quizás**
26. `l06-q-pressure`: TextPressure · **quizás**
27. `l06-q-rotating`: RotatingText · **quizás**
28. `l06-q-metallic`: MetallicPaint · **quizás**
29. `l06-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **29 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ac-ficha` de L00; marcado en `L00-infra/resumen.md`)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro
- En los «quizás»: etiqueta visible «experimental · quizás»; datos de ejemplo marcados como «sintéticos»

## Componentes

### `data-title-fx` · Entrada de título (data-title-fx)

- **Diapositiva:** `l06-data-title-fx`
- **Propósito (texto de la ficha):** Elegir cómo entra el título: el preset del estilo, uno fijo o ninguno
- **Archivo fuente:** `fx/sistema.js titlePreset() · Motor.titleFx Motor.titleStyle`
- **En el Atlas original:** `#portada` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `valores`: ["auto", "none", "rise", "mask-lines", "blur", "pliega", "enfoca", "descifra"]; `ambito`: sección o <html>; `por_defecto`: solo en backdrop
- **Origen en react-bits:** [SplitText](../../../../../react-bits/src/content/TextAnimations/SplitText/SplitText.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Título de muestra y botones para auto, none y cada preset; al pulsar se repite la entrada
- **Aceptación propia:** Cada botón reproduce el preset elegido

### `titulo-rise` · Preset de título «rise»

- **Diapositiva:** `l06-titulo-rise`
- **Propósito (texto de la ficha):** Las letras suben y se aclaran con rebote
- **Archivo fuente:** `fx/sistema.js Motor.titleFx('rise')`
- **Parámetros que muestra la ficha:** `estilos`: ["rice", "nube"]; `split`: words,chars
- **Origen en react-bits:** [SplitText](../../../../../react-bits/src/content/TextAnimations/SplitText/SplitText.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** La diapositiva usa data-title-fx="rise"; un botón repite la entrada; ficha con los estilos que lo usan por defecto
- **Aceptación propia:** El título entra con el preset al llegar a la diapositiva y queda en su estado final

### `titulo-mask-lines` · Preset de título «mask-lines»

- **Diapositiva:** `l06-titulo-mask-lines`
- **Propósito (texto de la ficha):** Las líneas suben desde detrás de una máscara, sin opacidades intermedias
- **Archivo fuente:** `fx/sistema.js Motor.titleFx('mask-lines')`
- **Parámetros que muestra la ficha:** `estilos`: ["suizo"]; `split`: lines + mask
- **Origen en react-bits:** [SplitText](../../../../../react-bits/src/content/TextAnimations/SplitText/SplitText.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** La diapositiva usa data-title-fx="mask-lines"; un botón repite la entrada; ficha con los estilos que lo usan por defecto
- **Aceptación propia:** El título entra con el preset al llegar a la diapositiva y queda en su estado final

### `titulo-blur` · Preset de título «blur»

- **Diapositiva:** `l06-titulo-blur`
- **Propósito (texto de la ficha):** Las palabras llegan desenfocadas, lentas y orgánicas
- **Archivo fuente:** `fx/sistema.js Motor.titleFx('blur')`
- **Parámetros que muestra la ficha:** `estilos`: ["aurora"]; `split`: words
- **Origen en react-bits:** [BlurText](../../../../../react-bits/src/content/TextAnimations/BlurText/BlurText.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** La diapositiva usa data-title-fx="blur"; un botón repite la entrada; ficha con los estilos que lo usan por defecto
- **Aceptación propia:** El título entra con el preset al llegar a la diapositiva y queda en su estado final

### `titulo-pliega` · Preset de título «pliega»

- **Diapositiva:** `l06-titulo-pliega`
- **Propósito (texto de la ficha):** Las letras se levantan girando sobre su base
- **Archivo fuente:** `fx/sistema.js Motor.titleFx('pliega')`
- **Parámetros que muestra la ficha:** `estilos`: ["arcilla"]; `split`: words,chars
- **Origen en react-bits:** [FoldText](../../../../../react-bits/src/content/TextAnimations/FoldText/FoldText.jsx) (inspiracion), [SplitText](../../../../../react-bits/src/content/TextAnimations/SplitText/SplitText.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** La diapositiva usa data-title-fx="pliega"; un botón repite la entrada; ficha con los estilos que lo usan por defecto
- **Aceptación propia:** El título entra con el preset al llegar a la diapositiva y queda en su estado final

### `titulo-enfoca` · Preset de título «enfoca»

- **Diapositiva:** `l06-titulo-enfoca`
- **Propósito (texto de la ficha):** La línea entera pasa de desenfocada a nítida
- **Archivo fuente:** `fx/sistema.js Motor.titleFx('enfoca')`
- **Parámetros que muestra la ficha:** `estilos`: ["celula"]; `split`: sin partir
- **Demo:** La diapositiva usa data-title-fx="enfoca"; un botón repite la entrada; ficha con los estilos que lo usan por defecto
- **Aceptación propia:** El título entra con el preset al llegar a la diapositiva y queda en su estado final

### `titulo-descifra` · Preset de título «descifra»

- **Diapositiva:** `l06-titulo-descifra`
- **Propósito (texto de la ficha):** Cada letra muestra glifos al azar hasta fijarse
- **Archivo fuente:** `fx/sistema.js Motor.titleFx('descifra')`
- **Parámetros que muestra la ficha:** `estilos`: ["noche", "matriz"]; `split`: words,chars (Motor.scramble)
- **Origen en react-bits:** [DecryptedText](../../../../../react-bits/src/content/TextAnimations/DecryptedText/DecryptedText.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** La diapositiva usa data-title-fx="descifra"; un botón repite la entrada; ficha con los estilos que lo usan por defecto
- **Aceptación propia:** El título entra con el preset al llegar a la diapositiva y queda en su estado final

### `titulo-cromo-sheen` · Título metálico de Cromo

- **Diapositiva:** `l06-titulo-cromo-sheen`
- **Propósito (texto de la ficha):** Brillo que recorre el título recortado con background-clip:text
- **Archivo fuente:** `themes/styles.css @keyframes cromo-sheen`
- **Parámetros que muestra la ficha:** `estilo`: cromo
- **Origen en react-bits:** [ShinyText](../../../../../react-bits/src/content/TextAnimations/ShinyText/ShinyText.jsx) (inspiracion). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Título grande forzado a data-style="cromo" con el brillo
- **Aceptación propia:** El brillo recorre el texto; con movimiento reducido queda quieto

### `titulo-termica-heat` · Título térmico de Térmica

- **Diapositiva:** `l06-titulo-termica-heat`
- **Propósito (texto de la ficha):** Gradiente de calor que sube por el título recortado
- **Archivo fuente:** `themes/styles.css @keyframes termica-heat`
- **Parámetros que muestra la ficha:** `estilo`: termica
- **Origen en react-bits:** [GradientText](../../../../../react-bits/src/content/TextAnimations/GradientText/GradientText.jsx) (inspiracion). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Título grande forzado a data-style="termica" con el gradiente
- **Aceptación propia:** El gradiente sube; con movimiento reducido queda quieto

### `descifra` · Texto que se descifra (.descifra)

- **Diapositiva:** `l06-descifra`
- **Propósito (texto de la ficha):** Revelar un texto con glifos al entrar, para códigos o identificadores
- **Archivo fuente:** `fx/piezas.js · fx/sistema.js Motor.scramble`
- **Parámetros que muestra la ficha:** `clase`: descifra; `data-orden`: ["start", "center", "random"]
- **Origen en react-bits:** [DecryptedText](../../../../../react-bits/src/content/TextAnimations/DecryptedText/DecryptedText.jsx) (base), [ScrambledText](../../../../../react-bits/src/content/TextAnimations/ScrambledText/ScrambledText.jsx) (inspiracion), [Shuffle](../../../../../react-bits/src/content/TextAnimations/Shuffle/Shuffle.jsx) (inspiracion). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Tres líneas .descifra con data-orden start, center y random
- **Aceptación propia:** Las tres terminan con el texto real

### `cifra` · Cifra (.cifra)

- **Diapositiva:** `l06-cifra`
- **Propósito (texto de la ficha):** Número grande que cuenta o rueda por dígitos hasta su valor, con variación opcional
- **Archivo fuente:** `fx/piezas.js · engine/engine.css .cifra .cifra-delta`
- **Parámetros que muestra la ficha:** `data-value`: número; `data-mode`: ["count", "roll"]; `otros`: ["data-dec", "data-pre", "data-suf", "data-from"]; `delta`: ["sube", "baja"]
- **Origen en react-bits:** [CountUp](../../../../../react-bits/src/content/TextAnimations/CountUp/CountUp.jsx) (base), [Counter](../../../../../react-bits/src/content/Components/Counter/Counter.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Dos .cifra (count y roll) con data-pre/data-suf/data-dec y una .cifra-delta sube y otra baja
- **Aceptación propia:** Las cifras se ven completas en la vista general

### `paleta` · Paleta de split-flap (.paleta)

- **Diapositiva:** `l06-paleta`
- **Propósito (texto de la ficha):** Casillas de aeropuerto que recorren palabras de estado
- **Archivo fuente:** `fx/piezas.js · engine/engine.css .paleta`
- **Parámetros que muestra la ficha:** `data-words`: A\|B\|C; `data-pasos`: una palabra por paso
- **Origen en react-bits:** [SplitFlapText](../../../../../react-bits/src/content/TextAnimations/SplitFlapText/SplitFlapText.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** .paleta con data-words y otra con data-pasos que cambia de palabra con →
- **Aceptación propia:** La versión por pasos muestra la palabra del paso actual

### `teclea` · Terminal que teclea (.teclea)

- **Diapositiva:** `l06-teclea`
- **Propósito (texto de la ficha):** Escribir los comandos letra a letra y soltar la salida
- **Archivo fuente:** `fx/piezas.js · engine/engine.css .term.teclea`
- **Parámetros que muestra la ficha:** `data-k`: cmd
- **Origen en react-bits:** [TextType](../../../../../react-bits/src/content/TextAnimations/TextType/TextType.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** .term.teclea con dos comandos y su salida
- **Aceptación propia:** Sin animación se ven los comandos completos

### `traza` · traza (StrokeText) · quizás

- **Diapositiva:** `l06-traza`
- **Propósito (texto de la ficha):** Dibuja el contorno del texto (SVG `<text>` + `stroke-dashoffset`) y luego rellena con barrido · GSAP
- **Archivo fuente:** `react-bits/src/content/TextAnimations/StrokeText/StrokeText.jsx (aún no portado al motor)`
- **Nota:** recomendado sin implementar
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/StrokeText/StrokeText.jsx](../../../../../react-bits/src/content/TextAnimations/StrokeText/StrokeText.jsx) (432 líneas), CSS [StrokeText.css](../../../../../react-bits/src/content/TextAnimations/StrokeText/StrokeText.css), props en [StrokeTextDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/StrokeTextDemo.jsx), uso en [strokeTextCode.js](../../../../../react-bits/src/constants/code/TextAnimations/strokeTextCode.js).
- **Dependencias del original:** `gsap`, `gsap/ScrollTrigger`
- **Informe:** IMPLEMENTAR · coste M · valor 2 · estilos: nube (líneas finas), noche (neón), celula (contorno); choca con matriz (Doto de puntos) y con cromo y termica
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/traza.js` (+ `fx/experimental/traza.css` si hace falta) como pieza por clase con el nombre `traza`. Antes, buscar `traza` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-traza`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (24):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `text` | string | "Draw Attention" | The heading copy rendered as measured SVG glyphs. | `data-text` |
  | `strokeColor` | string | "#A78BFA" | Color used for the drawing outline. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `fillColor` | string | "currentColor" | Color that floods into the glyphs after the outline draw. Follows the surrounding text color by default. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `strokeWidth` | number | 1.4 | Width of the SVG text outline. | `data-stroke-width` |
  | `drawDuration` | number | 1.6 | Seconds each character outline spends drawing on. | `data-draw-duration` |
  | `fillDelay` | number | 0.2 | Seconds to wait after the outline draw before the fill begins. | `data-fill-delay` |
  | `stagger` | number | 0.05 | Delay in seconds between each character animation. | `data-stagger` |
  | `ease` | string | "power2.out" | GSAP easing used for the outline draw. | `data-ease` |
  | `trigger` | "mount" \| "hover" \| "scroll" \| "loop" | "mount" | Chooses when the draw timeline starts. Loop draws on, then plays back out before drawing again. | `data-trigger` |
  | `fillMode` | "fade" \| "wipe" \| "none" | "wipe" | Controls whether fill appears with a fade, a directional wipe, or not at all. | `data-fill-mode` |
  | `wipeFrom` | "left" \| "right" \| "top" \| "bottom" | "left" | Side the wipe fill sweeps in from. Bottom fills the letters like liquid rising. | `data-wipe-from` |
  | `fontSize` | number | 128 | Largest font size in px. The wordmark scales down to fit narrower containers. | `data-font-size` |
  | `fontWeight` | number \| string | 800 | Weight of the rendered letterforms. | `data-font-weight` |
  | `fontFamily` | string | "inherit" | Font family of the letterforms. Inherits the surrounding font by default. | `data-font-family` |
  | `letterSpacing` | number | -4 | Tracking in px applied during measurement and rendering. | `data-letter-spacing` |
  | `reverse` | boolean | false | Draws the stagger from the final character back to the first. | `data-reverse` |
  | `strokeStyle` | "solid" \| "dashed" \| "dotted" | "solid" | Line style of the outline. Dashed and dotted outlines still draw on along each letter. | `data-stroke-style` |
  | `dashLength` | number | 10 | Length of each dash in px, or the distance between dots for a dotted outline. | `data-dash-length` |
  | `marching` | boolean | false | Keeps dashes or dots flowing around the letters once they are drawn. | `data-marching` |
  | `hoverRedraw` | boolean | false | Fades the outline out and draws it again whenever the pointer enters, after the first draw. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `shadow` | boolean | false | Adds a soft offset shadow under the filled letters that lifts into place as the fill lands. | `data-shadow` |
  | `shadowColor` | string | - | Color of the shadow. Uses the stroke color when left unset. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `className` | string | "" | Optional class applied to the root wrapper. | no aplica (React) |
  | `style` | CSSProperties | {} | Inline styles passed to the root wrapper. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `muestrario` · muestrario (TechText) · quizás

- **Diapositiva:** `l06-muestrario`
- **Propósito (texto de la ficha):** Muestrario tipográfico en canvas: glifos con contorno discontinuo, lupa que rellena, líneas de baseline, x-height, cap height, ascender y descender con etiquetas; intro `metrics`/`assemble`/`type` · canvas 2D
- **Archivo fuente:** `react-bits/src/content/TextAnimations/TechText/TechText.jsx (aún no portado al motor)`
- **Nota:** recomendado sin implementar
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/TechText/TechText.jsx](../../../../../react-bits/src/content/TextAnimations/TechText/TechText.jsx) (994 líneas), CSS [TechText.css](../../../../../react-bits/src/content/TextAnimations/TechText/TechText.css), props en [TechTextDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/TechTextDemo.jsx), uso en [techTextCode.js](../../../../../react-bits/src/constants/code/TextAnimations/techTextCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** IMPLEMENTAR (en el deck del sistema) · coste M · valor 2 · estilos: suizo, nube; ideal para la diapositiva `tipo` del deck del sistema
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/muestrario.js` (+ `fx/experimental/muestrario.css` si hace falta) como pieza por clase con el nombre `muestrario`. Antes, buscar `muestrario` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-muestrario`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (28):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `text` | string | 'React Bits' | The wordmark to render. | `data-text` |
  | `fontFamily` | string | '' | Any font family loaded on the page. Leave empty to inherit the font of the container. | `data-font-family` |
  | `fontWeight` | number | 600 | Weight of the wordmark. | `data-font-weight` |
  | `fontSize` | number | 150 | Largest font size in px. The wordmark shrinks to fit narrower containers. | `data-font-size` |
  | `letterSpacing` | number | -0.05 | Extra space between letters, in em. | `data-letter-spacing` |
  | `align` | 'left' \| 'center' \| 'right' | 'center' | Where the wordmark sits across the container. | `data-align` |
  | `color` | string | 'currentColor' | Colour of the letters and their outlines. Follows the surrounding text colour by default. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `accentColor` | string | 'currentColor' | Colour of the selection frame, connector, specks and labels. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `reveal` | 'area' \| 'letter' \| 'off' | 'letter' | Area fades the letters into outlines inside a circle around the pointer. Letter turns only the active letter into its outline. Off keeps every letter solid. | `data-reveal` |
  | `reach` | number | 200 | Radius around the pointer where the letters turn into vector outlines, in px. | `data-reach` |
  | `softness` | number | 0.7 | How gradually the fill hands over to the outlines. 0 is a hard edge. | `data-softness` |
  | `dashLength` | number | 4 | Length of each outline dash, in px. | `data-dash-length` |
  | `dashGap` | number | 2 | Space between outline dashes, in px. | `data-dash-gap` |
  | `lineStyle` | 'dashed' \| 'solid' | 'dashed' | How the outlines under the pointer are drawn. Only the outer silhouette is traced either way. | `data-line-style` |
  | `strokeWidth` | number | 1.5 | Thickness of the outline, in px. | `data-stroke-width` |
  | `specks` | number | 15 | Tiny squares that blink and respawn around the active letter, seeded per letter. 0 turns them off. | `data-specks` |
  | `selection` | boolean | true | Frame the letter under the pointer. The frame glides from letter to letter. | `data-selection` |
  | `labels` | boolean | true | Label the frame with the letter and its size, or with its offset while dragged. | `data-labels` |
  | `draggable` | boolean | true | Let letters be dragged off the baseline. They spring back home on release. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `bounce` | number | 0.4 | How much a released letter overshoots on its way home, from 0 (none) to 1 (very springy). | `data-bounce` |
  | `clickKick` | boolean | true | Clicking a letter kicks it upward on its spring and sends a ripple through its neighbours, each leaving its outline behind while it moves. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | 'none' \| 'type' \| 'assemble' \| 'metrics' | 'none' | Entrance played once the wordmark is in view. Type places each letter as an outline under the selection frame, assemble flies pixel specks into the letters, metrics rules the font lines first and fills the letters zone by zone between them. | `data-intro` |
  | `introDuration` | number | 2 | Length of the intro, in seconds. | `data-intro-duration` |
  | `guides` | boolean | false | Rule the baseline, x-height, cap height and descender across the wordmark while a letter is active. | `data-guides` |
  | `sweep` | boolean | true | Sweep the reveal across the wordmark on its own while the pointer is away. | `data-sweep` |
  | `speed` | number | 1 | Speed of the idle sweep. | `data-speed` |
  | `className` | string | '' | Extra classes on the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles on the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-shuffle` · Shuffle · quizás

- **Diapositiva:** `l06-q-shuffle`
- **Propósito (texto de la ficha):** Letras que barajan o deslizan su contenido (evenodd/center/sequence) · GSAP SplitText + ScrollTrigger
- **Archivo fuente:** `react-bits/src/content/TextAnimations/Shuffle/Shuffle.jsx (aún no portado al motor)`
- **Nota:** fusionar en descifra
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/Shuffle/Shuffle.jsx](../../../../../react-bits/src/content/TextAnimations/Shuffle/Shuffle.jsx) (624 líneas), CSS [Shuffle.css](../../../../../react-bits/src/content/TextAnimations/Shuffle/Shuffle.css), props en [ShuffleDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/ShuffleDemo.jsx), uso en [shuffleCode.js](../../../../../react-bits/src/constants/code/TextAnimations/shuffleCode.js).
- **Dependencias del original:** `@gsap/react`, `gsap`, `gsap/ScrollTrigger`, `gsap/SplitText`
- **Informe:** QUIZÁ (fusionar en `descifra`) · coste S · valor 2 · estilos: noche, matriz
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-shuffle.js` (+ `fx/experimental/exp-shuffle.css` si hace falta) como pieza por clase con el nombre `exp-shuffle`. Antes, buscar `exp-shuffle` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-shuffle`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (28):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `text` | string | "" | The text content to shuffle. | `data-text` |
  | `className` | string | "" | Optional CSS class for the wrapper element. | no aplica (React) |
  | `style` | object | {} | Inline styles applied to the wrapper element. | no aplica (React) |
  | `effect` | "slide" \| "flip" \| "blur" | "slide" | How each letter cycles: a reel that slides past, a card that flips in 3D through random glyphs, or glyphs that spin in place with motion blur and settle sharp. | `data-effect` |
  | `shuffleDirection` | "left" \| "right" \| "up" \| "down" | "right" | Direction letters travel. Flip turns around the matching axis. | `data-shuffle-direction` |
  | `duration` | number | 0.35 | Duration (s) of each letter’s shuffle. | `data-duration` |
  | `maxDelay` | number | 0 | Longest random delay (s) before a letter starts, when animationMode is "random". | `data-max-delay` |
  | `ease` | string \| Function | "power3.out" | GSAP ease for the motion and color shift. Back eases make letters overshoot as they land. | `data-ease` |
  | `threshold` | number | 0.1 | Portion of the element that must enter view before starting. | `data-threshold` |
  | `rootMargin` | string | "-100px" | ScrollTrigger start offset (px, %, etc.). | `data-root-margin` |
  | `tag` | "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "p" \| "span" | "p" | HTML tag to render for the text container. | `data-tag` |
  | `textAlign` | CSS text-align | "center" | Text alignment applied via inline style. | `data-text-align` |
  | `onShuffleComplete` | () => void | undefined | Called after a full run completes (and on each loop repeat). | no aplica (React) |
  | `shuffleTimes` | number | 1 | How many interim glyphs each letter passes through before it lands. | `data-shuffle-times` |
  | `animationMode` | "evenodd" \| "sequence" \| "center" \| "random" | "evenodd" | Order the letters start in: odd letters then even ones, left to right, outward from the middle, or after random delays. | `data-animation-mode` |
  | `loop` | boolean | false | Repeat the shuffle indefinitely. | `data-loop` |
  | `loopDelay` | number | 0 | Delay (s) between loop repeats. | `data-loop-delay` |
  | `stagger` | number | 0.03 | Delay (s) between letters starting, in every mode except "random". | `data-stagger` |
  | `scrambleCharset` | string | "" | Characters to use for interim scrambles; empty keeps original copies. | `data-scramble-charset` |
  | `motionBlur` | boolean | false | Smears the sliding reel along its direction while it moves fast, then lands sharp. Slide effect only. | `data-motion-blur` |
  | `color` | string | undefined | Text color. Follows the surrounding text color when unset. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `accentColor` | string | undefined | Color of the interim glyphs while letters are in flight. Settled letters keep the text color. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `colorFrom` | string | undefined | Color each letter starts in, fading to its final color as it lands. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `colorTo` | string | undefined | Color each letter fades to as it lands, and keeps afterwards. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `triggerOnce` | boolean | true | Auto-run only on first scroll into view. | `data-trigger-once` |
  | `respectReducedMotion` | boolean | true | Shows the text right away, without shuffling, if the user prefers reduced motion. | `data-respect-reduced-motion` |
  | `triggerOnHover` | boolean | true | Allow re-playing the animation on hover after it completes. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `hoverRadius` | number | 0 | With hover replay on, only letters within this distance (px) of the cursor reshuffle, closer ones longer and through more glyphs. 0 replays the whole text. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-scrambled` · ScrambledText · quizás

- **Diapositiva:** `l06-q-scrambled`
- **Propósito (texto de la ficha):** Revuelve las letras cerca del cursor; tiene intro de scramble · GSAP ScrambleTextPlugin
- **Archivo fuente:** `react-bits/src/content/TextAnimations/ScrambledText/ScrambledText.jsx (aún no portado al motor)`
- **Nota:** fusionar en descifra
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/ScrambledText/ScrambledText.jsx](../../../../../react-bits/src/content/TextAnimations/ScrambledText/ScrambledText.jsx) (376 líneas), CSS [ScrambledText.css](../../../../../react-bits/src/content/TextAnimations/ScrambledText/ScrambledText.css), props en [ScrambledTextDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/ScrambledTextDemo.jsx), uso en [scrambledTextCode.js](../../../../../react-bits/src/constants/code/TextAnimations/scrambledTextCode.js).
- **Dependencias del original:** `gsap`, `gsap/ScrambleTextPlugin`, `gsap/SplitText`
- **Informe:** QUIZÁ (solo la intro, dentro de `descifra`) · coste S · valor 1 · estilos: noche
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-scrambled.js` (+ `fx/experimental/exp-scrambled.css` si hace falta) como pieza por clase con el nombre `exp-scrambled`. Antes, buscar `exp-scrambled` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-scrambled`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (15):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `children` | ReactNode | - | The text to scramble. | no aplica (React) |
  | `effect` | 'scramble' \| 'lift' \| 'blur' \| 'magnify' | 'scramble' | What happens to letters near the pointer: they scramble, rise, blur, or swell like a lens. Each one eases in and out with a soft falloff. | `data-effect` |
  | `radius` | number | 100 | Distance from the pointer, in px, within which letters react. | `data-radius` |
  | `strength` | number | 1 | How far letters lift, how much they blur, or how much they magnify. | `data-strength` |
  | `trail` | number | 0.6 | How long lifted, blurred or magnified letters take to settle after the pointer moves on, in seconds. Scrambling uses duration instead. | `data-trail` |
  | `duration` | number | 1.2 | How long a letter right under the pointer keeps scrambling, in seconds. Also sets the pace of the intro and the click burst. | `data-duration` |
  | `speed` | number | 0.5 | How often a scrambling letter swaps to a new character. Higher values flicker faster. | `data-speed` |
  | `clickBurst` | boolean | true | Clicking sends a scramble wave outward from the click point, carrying the current effect with it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `scrambleChars` | string | '.:' | The characters shown while a letter is scrambled. | `data-scramble-chars` |
  | `scrambleColor` | string | '' | Color of letters while they are scrambled. Leave empty to keep the text color. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `color` | string | '' | Color of the text. Leave empty to follow the surrounding text color. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `fontFamily` | string | '' | Font of the text. Leave empty to keep the default monospace. | `data-font-family` |
  | `intro` | boolean | true | Decodes the whole text from scrambled characters the first time it scrolls into view. | `data-intro` |
  | `className` | string | '' | Extra class names for the wrapper. | no aplica (React) |
  | `style` | CSSProperties | {} | Inline styles for the wrapper. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-fold` · FoldText · quizás

- **Diapositiva:** `l06-q-fold`
- **Propósito (texto de la ficha):** Letras que se despliegan sobre una bisagra 3D (paper/blinds/flip) con sombreado de pliegue · GSAP
- **Archivo fuente:** `react-bits/src/content/TextAnimations/FoldText/FoldText.jsx (aún no portado al motor)`
- **Nota:** ya cubierto por el preset pliega
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/FoldText/FoldText.jsx](../../../../../react-bits/src/content/TextAnimations/FoldText/FoldText.jsx) (350 líneas), CSS [FoldText.css](../../../../../react-bits/src/content/TextAnimations/FoldText/FoldText.css), props en [FoldTextDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/FoldTextDemo.jsx), uso en [foldTextCode.js](../../../../../react-bits/src/constants/code/TextAnimations/foldTextCode.js).
- **Dependencias del original:** `gsap`, `gsap/ScrollTrigger`
- **Informe:** QUIZÁ (preset `pliega`) · coste S · valor 2 · estilos: arcilla, rice (choca con suizo y noche)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-fold.js` (+ `fx/experimental/exp-fold.css` si hace falta) como pieza por clase con el nombre `exp-fold`. Antes, buscar `exp-fold` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-fold`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `text` | string | "Design unfolds" | The text to split and fold into place. Line breaks are kept. | `data-text` |
  | `foldStyle` | "paper" \| "blinds" \| "flip" | "paper" | How each piece folds. Paper swings open from its hinge edge, blinds splits it into two slats that turn open one after the other, and flip turns it over like a card, lifting toward you mid-turn. | `data-fold-style` |
  | `splitBy` | "char" \| "word" \| "line" | "char" | Whether each character, word or line folds as its own panel. | `data-split-by` |
  | `hinge` | "top" \| "bottom" \| "left" \| "right" | "top" | The edge each panel folds around. For blinds and flip it picks the axis and the turning direction. | `data-hinge` |
  | `foldAngle` | number | 92 | How far the panels start folded away, in degrees. Past 90 they flip over from behind. Flip always turns a full half turn. | `data-fold-angle` |
  | `duration` | number | 0.65 | How long each panel takes to unfold, in seconds. | `data-duration` |
  | `stagger` | number | 0.045 | Delay between panels, in seconds. | `data-stagger` |
  | `staggerFrom` | "start" \| "center" \| "end" \| "edges" \| "random" | "start" | Where the cascade starts. | `data-stagger-from` |
  | `ease` | string | "power3.out" | GSAP ease used for the unfold. | `data-ease` |
  | `perspective` | number | 700 | Camera distance for the fold, in px. Lower values look deeper. | `data-perspective` |
  | `creaseShading` | number | 0.55 | How dark the crease shading gets while a panel is folded, from 0 to 1. | `data-crease-shading` |
  | `trigger` | "mount" \| "hover" \| "scroll" \| "loop" | "mount" | When the text unfolds. Loop holds the text, folds it back up and plays again. | `data-trigger` |
  | `loopDelay` | number | 1.4 | How long the unfolded text holds before folding back up, in seconds. Only applies when trigger is 'loop'. | `data-loop-delay` |
  | `hoverRefold` | boolean | false | Panels near the cursor fold partly away and ease back open once it passes. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `refoldRadius` | number | 140 | How far from the cursor panels react with hoverRefold, in px. The fold fades out toward the edge. | `data-refold-radius` |
  | `refoldAngle` | number | 45 | How far a panel right under the cursor folds away with hoverRefold, in degrees. | `data-refold-angle` |
  | `fontSize` | string \| number | 80 | Font size of the text. Numbers are in px. | `data-font-size` |
  | `fontWeight` | string \| number | 800 | Font weight of the text. | `data-font-weight` |
  | `color` | string | "currentColor" | Color of the text. Follows the surrounding text color by default. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `className` | string | "" | Extra class names for the root element. | no aplica (React) |
  | `style` | CSSProperties | {} | Inline styles for the root element. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-truefocus` · TrueFocus · quizás

- **Diapositiva:** `l06-q-truefocus`
- **Propósito (texto de la ficha):** Recorre las palabras con corchetes, caja o subrayado y desenfoca las demás · motion
- **Archivo fuente:** `react-bits/src/content/TextAnimations/TrueFocus/TrueFocus.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/TrueFocus/TrueFocus.jsx](../../../../../react-bits/src/content/TextAnimations/TrueFocus/TrueFocus.jsx) (203 líneas), CSS [TrueFocus.css](../../../../../react-bits/src/content/TextAnimations/TrueFocus/TrueFocus.css), props en [TrueFocusDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/TrueFocusDemo.jsx), uso en [trueFocusCode.js](../../../../../react-bits/src/constants/code/TextAnimations/trueFocusCode.js).
- **Dependencias del original:** `motion/react`
- **Informe:** QUIZÁ · coste S–M · valor 2 · estilos: noche (corchetes HUD), suizo (subrayado)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-truefocus.js` (+ `fx/experimental/exp-truefocus.css` si hace falta) como pieza por clase con el nombre `exp-truefocus`. Antes, buscar `exp-truefocus` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-truefocus`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (16):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `sentence` | string | 'True Focus' | The text to display with the focus animation. | `data-sentence` |
  | `separator` | string | ' ' | String used to split the sentence into words. | `data-separator` |
  | `focusStyle` | 'brackets' \| 'box' \| 'underline' \| 'highlight' | 'brackets' | How the focused word is marked: corner brackets, a full outline, a bar underneath, or a soft filled block behind the word. | `data-focus-style` |
  | `borderColor` | string | 'green' | Color of the brackets, box or underline. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `highlightColor` | string | undefined | Color of the block in the highlight style, drawn softly so the text stays readable. Uses the border color when not set. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `glowColor` | string | 'transparent' | Color of a soft glow around the brackets, box or underline. No glow by default. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `focusScale` | number | 1 | Scales up the focused word, for example 1.06. The frame grows with it. | `data-focus-scale` |
  | `blurAmount` | number | 5 | Blur on the words that are out of focus, in px. | `data-blur-amount` |
  | `unfocusedOpacity` | number | 1 | Opacity of the words that are out of focus, from 0 to 1. | `data-unfocused-opacity` |
  | `easing` | 'smooth' \| 'spring' | 'smooth' | How the frame moves between words: a smooth glide, or a spring that slightly overshoots and settles. | `data-easing` |
  | `order` | 'sequential' \| 'random' | 'sequential' | Moves the focus to the next word in reading order, or to a random other word. | `data-order` |
  | `manualMode` | boolean | false | Moves the focus to the hovered word instead of cycling on its own. | `data-manual-mode` |
  | `animationDuration` | number | 0.5 | How long the frame takes to move to the next word, in seconds. | `data-animation-duration` |
  | `pauseBetweenAnimations` | number | 1 | How long the focus rests on each word before moving on, in seconds. | `data-pause-between-animations` |
  | `cornerSize` | number | 16 | Length of each corner bracket, in px. | `data-corner-size` |
  | `borderWidth` | number | 3 | Thickness of the brackets, box or underline, in px. | `data-border-width` |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-glitch` · GlitchText · quizás

- **Diapositiva:** `l06-q-glitch`
- **Propósito (texto de la ficha):** Glitch por franjas, RGB, scan o ruido con máscaras CSS · CSS + rAF
- **Archivo fuente:** `react-bits/src/content/TextAnimations/GlitchText/GlitchText.jsx (aún no portado al motor)`
- **Nota:** referencia parcial: glitch de op-cifras en fx/arq-opus.js:663
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/GlitchText/GlitchText.jsx](../../../../../react-bits/src/content/TextAnimations/GlitchText/GlitchText.jsx) (370 líneas), CSS [GlitchText.css](../../../../../react-bits/src/content/TextAnimations/GlitchText/GlitchText.css), props en [GlitchTextDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/GlitchTextDemo.jsx), uso en [glitchTextCode.js](../../../../../react-bits/src/constants/code/TextAnimations/glitchTextCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste S · valor 1 · estilos: noche, matriz; duplica a medias el glitch manual de `op-cifras`
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-glitch.js` (+ `fx/experimental/exp-glitch.css` si hace falta) como pieza por clase con el nombre `exp-glitch`. Antes, buscar `exp-glitch` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-glitch`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (16):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `children` | string |  | The text content that will display the glitch effect. | no aplica (React) |
  | `mode` | "slices" \| "rgb" \| "scan" \| "noise" | "slices" | Style of glitch. Slices shifts bands of the text sideways, rgb splits it into jittering color channels, scan sweeps a displaced band down through it and noise briefly swaps letters for glyphs. | `data-mode` |
  | `trigger` | "always" \| "hover" \| "click" | "always" | When it glitches: all the time, while hovered, or in a short burst on each click. | `data-trigger` |
  | `speed` | number | 0.5 | Multiplier for the animation speed. Higher values slow down the glitch effect. | `data-speed` |
  | `intensity` | number | 0.5 | How often and how far it glitches, from 0 (calm) to 1 (constant, wide jolts). | `data-intensity` |
  | `burstDuration` | number | 0.6 | Length of the burst played on each click with the click trigger, in seconds. | `data-burst-duration` |
  | `flicker` | boolean | false | Adds quick, subtle dips in opacity while it glitches. | `data-flicker` |
  | `offset` | number | 10 | How far the glitched slices shift sideways, in px. The colored shadows grow with it. | `data-offset` |
  | `skew` | number | 0 | How far the text shears sideways during a jolt, in degrees. | `data-skew` |
  | `enableShadows` | boolean | true | Toggle the glitch colors. Without them every mode stays in the text color. | `data-enable-shadows` |
  | `shadowColors` | [string, string] | ['#ff0000', '#00ffff'] | The two glitch colors: the shadows on the shifted slices, the split channels and the swapped glyphs. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `color` | string | "currentColor" | Color of the text. Follows the surrounding text color by default. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `fontSize` | number \| string | "clamp(2rem, 10vw, 8rem)" | Font size of the text. Numbers are in px. | `data-font-size` |
  | `fontWeight` | number \| string | 900 | Font weight of the text. | `data-font-weight` |
  | `enableOnHover` | boolean | false | Same as trigger="hover": the glitch only runs while the text is hovered. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `className` | string |  | Additional custom classes to apply to the component. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-depth` · DepthText · quizás

- **Diapositiva:** `l06-q-depth`
- **Propósito (texto de la ficha):** Extrusión 3D con 34 copias apiladas en `translateZ`, órbita automática y seguimiento del puntero · CSS 3D
- **Archivo fuente:** `react-bits/src/content/TextAnimations/DepthText/DepthText.jsx (aún no portado al motor)`
- **Nota:** solo para .div-num
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/DepthText/DepthText.jsx](../../../../../react-bits/src/content/TextAnimations/DepthText/DepthText.jsx) (358 líneas), CSS [DepthText.css](../../../../../react-bits/src/content/TextAnimations/DepthText/DepthText.css), props en [DepthTextDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/DepthTextDemo.jsx), uso en [depthTextCode.js](../../../../../react-bits/src/constants/code/TextAnimations/depthTextCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (solo para `.div-num`) · coste M · valor 1 · estilos: arcilla (letra de plastilina extruida), cromo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-depth.js` (+ `fx/experimental/exp-depth.css` si hace falta) como pieza por clase con el nombre `exp-depth`. Antes, buscar `exp-depth` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-depth`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `text` | string | "Elevate" | The word or short phrase rendered as extruded type. | `data-text` |
  | `layers` | number | 34 | Number of stacked copies that form the extrusion. Clamped to protect the DOM. | `data-layers` |
  | `depth` | number | 2.4 | Spacing in pixels between each layer of the extrusion. | `data-depth` |
  | `faceColor` | string | "currentColor" | Color of the crisp front face. Follows the surrounding text color by default. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `depthColor` | string | "#7c3aed" | Tint the extrusion fades into toward the back. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `gradientDepth` | boolean | false | Paints the extrusion in the depth color right behind the face and fades it out to the background toward the back. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `tilt` | number | 7.5 | Resting angle and maximum pointer-driven rotation, in degrees. | `data-tilt` |
  | `pointerTracking` | boolean | true | Enables smoothed pointer parallax on fine pointer devices. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `smoothing` | number | 0.14 | Damping amount used to ease rotation toward the pointer target. | `data-smoothing` |
  | `perspective` | number | 900 | Perspective distance in pixels for the 3D stack. | `data-perspective` |
  | `autoOrbit` | boolean | true | Adds a subtle orbit when pointer tracking is unavailable or idle. | `data-auto-orbit` |
  | `orbitSpeed` | number | 0.35 | Speed of the fallback orbit in cycles per second. | `data-orbit-speed` |
  | `hoverPush` | number | 0 | How far hovering presses the text into the page, from 0 to 1. The extrusion compresses on a spring, pressing pushes a little deeper and releasing bounces back. 0 turns it off. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `float` | boolean | false | Lets the text bob and sway gently while it is not hovered. | `data-float` |
  | `fontSize` | string | "clamp(3rem, 12vw, 7rem)" | CSS font-size value for the display word. | `data-font-size` |
  | `fontWeight` | number \| string | 900 | Font weight used for every layer. | `data-font-weight` |
  | `shadow` | boolean | true | Casts a soft drop shadow behind the extrusion. | `data-shadow` |
  | `outline` | boolean | false | Draws the extrusion as stacked outlines instead of solid layers. | `data-outline` |
  | `intro` | boolean | true | Grows the extrusion out from the flat face on mount. | `data-intro` |
  | `className` | string | "" | Optional class name for the outer wrapper. | no aplica (React) |
  | `style` | CSSProperties | {} | Optional inline styles for the outer wrapper. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-particle` · ParticleText · quizás

- **Diapositiva:** `l06-q-particle`
- **Propósito (texto de la ficha):** Partículas que se reúnen formando el texto (gather/scan) con resaltado y empuje del puntero · canvas 2D
- **Archivo fuente:** `react-bits/src/content/TextAnimations/ParticleText/ParticleText.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/ParticleText/ParticleText.jsx](../../../../../react-bits/src/content/TextAnimations/ParticleText/ParticleText.jsx) (800 líneas), CSS [ParticleText.css](../../../../../react-bits/src/content/TextAnimations/ParticleText/ParticleText.css), props en [ParticleTextDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/ParticleTextDemo.jsx), uso en [particleTextCode.js](../../../../../react-bits/src/constants/code/TextAnimations/particleTextCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste M · valor 2 · estilos: **nube** (el título se forma como nube de puntos LiDAR coloreada con `seq`), matriz
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-particle.js` (+ `fx/experimental/exp-particle.css` si hace falta) como pieza por clase con el nombre `exp-particle`. Antes, buscar `exp-particle` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-particle`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (23):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `text` | string | "React Bits" | The words sampled into particle targets. | `data-text` |
  | `color` | string | "currentColor" | Particle color at rest. Follows the surrounding text color by default. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `highlightColor` | string | "#ff5a36" | Color particles take on while they fly in or get pushed around. Also colors the glow and the scan line. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `intro` | "gather" \| "rain" \| "spiral" \| "scan" | "gather" | How the text forms. Gather pulls scattered particles together, rain drops them in from above, spiral swirls them into place, and scan assembles the text behind a sweeping line. | `data-intro` |
  | `gatherDuration` | number | 1600 | Milliseconds for the intro to form the text. | `data-gather-duration` |
  | `stagger` | number | 420 | Maximum per-particle delay in milliseconds before it starts moving. | `data-stagger` |
  | `scatter` | number | 180 | How far particles begin from their final spots in the gather and spiral intros. | `data-scatter` |
  | `trigger` | "mount" \| "hover" \| "click" | "mount" | When the intro plays again after the first formation: never, on hover, or on click. | `data-trigger` |
  | `clickBurst` | boolean | true | Clicking blows the particles away from the click point, then they spring back into the text. Off while trigger is click. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `burstStrength` | number | 1 | How hard and how wide a click burst pushes. | `data-burst-strength` |
  | `pointerRepel` | number | 40 | Strength of the cursor pushback. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `repelRadius` | number | 120 | Cursor influence radius in pixels. | `data-repel-radius` |
  | `idleDrift` | number | 0.7 | Subtle resting motion after the text has formed. | `data-idle-drift` |
  | `shape` | "circle" \| "square" \| "line" | "circle" | How each particle is drawn. Line draws short strokes that stretch along their motion and settle into an even hatch. | `data-shape` |
  | `highlightMode` | "motion" \| "gradient" | "motion" | Motion lights up particles while they are away from their spot and cools them as they land. Gradient blends the highlight across the text from left to right. | `data-highlight-mode` |
  | `particleSize` | number | 2 | Rendered size of each particle in CSS pixels. | `data-particle-size` |
  | `density` | number | 4 | Pixel sampling step for the offscreen glyph canvas. Lower values create more particles. | `data-density` |
  | `glow` | boolean | true | Adds a soft bloom in the highlight color around highlighted particles. | `data-glow` |
  | `fontSize` | number \| string | "clamp(3rem, 12vw, 8rem)" | Canvas text size used for glyph sampling. | `data-font-size` |
  | `fontWeight` | number \| string | 800 | Font weight used for sampling. | `data-font-weight` |
  | `fontFamily` | string | "inherit" | Font family used for sampling. Inherit waits for the surrounding font before sampling. | `data-font-family` |
  | `className` | string | "" | Optional wrapper class name. | no aplica (React) |
  | `style` | React.CSSProperties | undefined | Optional inline styles for the wrapper. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-masked` · MaskedHeading · quizás

- **Diapositiva:** `l06-q-masked`
- **Propósito (texto de la ficha):** Imagen o vídeo dentro del texto (clipPath SVG) con revelado rise/wipe/blur y parallax · GSAP
- **Archivo fuente:** `react-bits/src/content/TextAnimations/MaskedHeading/MaskedHeading.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/MaskedHeading/MaskedHeading.jsx](../../../../../react-bits/src/content/TextAnimations/MaskedHeading/MaskedHeading.jsx) (617 líneas), CSS [MaskedHeading.css](../../../../../react-bits/src/content/TextAnimations/MaskedHeading/MaskedHeading.css), props en [MaskedHeadingDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/MaskedHeadingDemo.jsx), uso en [maskedHeadingCode.js](../../../../../react-bits/src/constants/code/TextAnimations/maskedHeadingCode.js).
- **Dependencias del original:** `gsap`
- **Informe:** QUIZÁ · coste M · valor 1 · estilos: portadas con foto; neutro
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-masked.js` (+ `fx/experimental/exp-masked.css` si hace falta) como pieza por clase con el nombre `exp-masked`. Antes, buscar `exp-masked` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-masked`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (29):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `text` | string | 'Designed in the details' | Heading copy. | `data-text` |
  | `tag` | string | 'h2' | Element the heading renders as, so it can carry the right semantics. | `data-tag` |
  | `mediaType` | "image" \| "video" | "image" | Whether the source showing through the letters is an image or a looping muted video. Videos stay paused for people who prefer reduced motion. | `data-media-type` |
  | `src` | string | '' | Image or video URL. | `data-src` |
  | `poster` | string | '' | Poster frame used while a video loads. | `data-poster` |
  | `reveal` | "rise" \| "scale" \| "blur" \| "wipe" \| "fade" \| "none" | "rise" | Entrance style: words rise into place, letters grow in one after another, the letters draw together while the heading pulls into focus, a wipe sweeps across, or the whole block fades up. | `data-reveal` |
  | `trigger` | "view" \| "mount" \| "hover" | "view" | When the entrance runs. | `data-trigger` |
  | `duration` | number | 1.1 | Entrance duration, in seconds. | `data-duration` |
  | `stagger` | number | 0.09 | Delay between words, in seconds, for the rise reveal. The scale reveal steps letter by letter at about a third of it. | `data-stagger` |
  | `spotlight` | boolean | false | Dims and desaturates the media except for a soft pool of light that eases after the pointer. Without a pointer, the light wanders slowly across the letters. | `data-spotlight` |
  | `spotlightRadius` | number | 160 | Radius of the spotlight, in px. | `data-spotlight-radius` |
  | `outline` | boolean | false | Draws a thin stroke around every letter. It is visible before the entrance, so the media fills the outlines as it arrives. | `data-outline` |
  | `outlineColor` | string | '' | Color of the outline. Leave empty to follow the surrounding text color. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `outlineWidth` | number | 1 | Thickness of the outline, in px. | `data-outline-width` |
  | `fillScale` | number | 1.25 | How far the media is zoomed past the heading. The overscan is what parallax travels into. | `data-fill-scale` |
  | `parallax` | number | 26 | How far the media slides under the letters as the pointer moves, in px. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `drift` | number | 18 | Amplitude of the slow idle motion, in px. 0 holds the media still. | `data-drift` |
  | `hoverZoom` | number | 0 | Extra zoom the media eases into while the pointer is over the heading. 0.1 is 10% closer. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `brightness` | number | 1 | Brightness of the media. | `data-brightness` |
  | `saturation` | number | 1 | Saturation of the media. | `data-saturation` |
  | `grayscale` | boolean | false | Render the media in black and white. | `data-grayscale` |
  | `tint` | string | '' | Colorizes the media in one color while keeping its light and shadow, like a duotone print. Leave empty for the original colors. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `align` | "left" \| "center" \| "right" | "center" | Text alignment. | `data-align` |
  | `weight` | number | 700 | Font weight. | `data-weight` |
  | `tracking` | number | -0.03 | Letter spacing, in em. | `data-tracking` |
  | `lineHeight` | number | 1.06 | Line height. | `data-line-height` |
  | `textScale` | number | 0.115 | Type size as a fraction of the container width, so the heading stays responsive. | `data-text-scale` |
  | `className` | string | '' | Additional class names. | no aplica (React) |
  | `style` | object | — | Inline styles for the heading. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-circular` · CircularText · quizás

- **Diapositiva:** `l06-q-circular`
- **Propósito (texto de la ficha):** Texto en círculo que gira (sello) · motion
- **Archivo fuente:** `react-bits/src/content/TextAnimations/CircularText/CircularText.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/CircularText/CircularText.jsx](../../../../../react-bits/src/content/TextAnimations/CircularText/CircularText.jsx) (288 líneas), CSS [CircularText.css](../../../../../react-bits/src/content/TextAnimations/CircularText/CircularText.css), props en [CircularTextDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/CircularTextDemo.jsx), uso en [circularTextCode.js](../../../../../react-bits/src/constants/code/TextAnimations/circularTextCode.js).
- **Dependencias del original:** `motion/react`
- **Informe:** QUIZÁ · coste S · valor 1 · estilos: rice, cromo (sello Y3K)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-circular.js` (+ `fx/experimental/exp-circular.css` si hace falta) como pieza por clase con el nombre `exp-circular`. Antes, buscar `exp-circular` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-circular`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (19):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `text` | string | '' | The text laid out around the ring. End it with a separator for a seamless loop. | `data-text` |
  | `spinDuration` | number | 20 | Seconds for one full turn. 0 keeps the ring still until it is dragged. | `data-spin-duration` |
  | `onHover` | 'slowDown' \| 'speedUp' \| 'pause' \| 'goBonkers' | 'speedUp' | What happens while the pointer is over the ring. It eases into the new speed and back out, and goBonkers also shrinks it a little. | no aplica (React) |
  | `direction` | 'clockwise' \| 'counterclockwise' | 'clockwise' | Which way the ring turns. | `data-direction` |
  | `draggable` | boolean | false | Lets people grab the ring and fling it. It coasts with inertia, then eases back to its cruise speed. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `hoverTilt` | number | 0 | How far the ring tilts in 3D toward the pointer, in degrees. 0 turns the tilt off. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `tilt` | number | 0 | Leans the ring back in perspective, in degrees, so it orbits around the center content like a planet ring. | `data-tilt` |
  | `size` | number | 200 | Diameter of the ring, in px. | `data-size` |
  | `fontSize` | number | 24 | Size of the letters, in px. | `data-font-size` |
  | `fontWeight` | number | 900 | Weight of the letters. | `data-font-weight` |
  | `letterSpacing` | number | 0 | Extra space between letters, in em. Applies when fill is off. | `data-letter-spacing` |
  | `color` | string | '' | Color of the letters and center content. Leave empty to follow the surrounding text color. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `startAngle` | number | 0 | Where the first letter sits, in degrees clockwise from the top. | `data-start-angle` |
  | `fill` | boolean | true | Spreads the letters evenly around the whole ring. Turn it off to keep natural letter spacing and leave a gap. | `data-fill` |
  | `repeat` | number | 1 | How many times the text repeats around the ring. With fill off, each copy gets its own gap. | `data-repeat` |
  | `ring` | boolean | false | Draws a thin circle just inside the letters. | `data-ring` |
  | `ringColor` | string | '' | Color of the inner circle. Leave empty to match the letters. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `children` | ReactNode | - | Content shown in the middle of the ring, such as an icon or a short label. It tilts with the ring. | no aplica (React) |
  | `className` | string | '' | Extra class names for the ring. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-pressure` · TextPressure · quizás

- **Diapositiva:** `l06-q-pressure`
- **Propósito (texto de la ficha):** Ejes variables (wdth/wght/ital) según el cursor; modos idle `wave`/`pulse` · rAF; necesita Roboto Flex
- **Archivo fuente:** `react-bits/src/content/TextAnimations/TextPressure/TextPressure.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/TextPressure/TextPressure.jsx](../../../../../react-bits/src/content/TextAnimations/TextPressure/TextPressure.jsx) (398 líneas), props en [TextPressureDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/TextPressureDemo.jsx), uso en [textPressureCode.js](../../../../../react-bits/src/constants/code/TextAnimations/textPressureCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (solo modo idle con fuentes ya cargadas) · coste M · valor 1 · estilos: matriz (Doto wght/ROND en ola), arcilla (Fraunces SOFT)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-pressure.js` (+ `fx/experimental/exp-pressure.css` si hace falta) como pieza por clase con el nombre `exp-pressure`. Antes, buscar `exp-pressure` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-pressure`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `text` | string | "Compressa" | Text content that will be displayed and animated. | `data-text` |
  | `fontFamily` | string | Roboto Flex | Name of the variable font family. | `data-font-family` |
  | `fontUrl` | string | URL to Roboto Flex on Google Fonts | Stylesheet URL that loads the variable font. The font needs width, weight and italic axes. | `data-font-url` |
  | `textColor` | string | 'currentColor' | Fill color of the text. Follows the surrounding text color by default. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `pressureColor` | string | '' | Letters blend toward this color as they swell under pressure. Leave empty to keep one color. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `strokeColor` | string | #FF0000 | Color of the outline when stroke is on. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `idle` | 'none' \| 'wave' \| 'pulse' | 'none' | What the letters do while the pointer is away. A wave rolls a swell across the word, a pulse makes it breathe in and out. | `data-idle` |
  | `idleSpeed` | number | 1 | Speed of the idle wave or pulse. 2 plays it twice as fast. | `data-idle-speed` |
  | `radius` | number | 0.5 | How far the cursor's pull reaches, as a fraction of the text width. Also sets the length of the idle wave. | `data-radius` |
  | `smoothing` | number | 0.5 | How softly the letters follow the cursor, from 0 for instant to 1 for a slow, floaty glide. | `data-smoothing` |
  | `clickRipple` | boolean | true | Clicking sends a wave of pressure rippling outward through the letters. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `flex` | boolean | true | Spreads the letters across the full width. | `data-flex` |
  | `scale` | boolean | false | Stretches the text vertically to fill the height of its container. | `data-scale` |
  | `alpha` | boolean | false | Fades letters out the further they are from the cursor. | `data-alpha` |
  | `stroke` | boolean | false | Draws an outline behind each letter. | `data-stroke` |
  | `width` | boolean | true | Varies the width axis of the font with pressure. | `data-width` |
  | `weight` | boolean | true | Varies the weight axis of the font with pressure. | `data-weight` |
  | `italic` | boolean | true | Varies the italic axis of the font with pressure. | `data-italic` |
  | `strokeWidth` | number | 3 | Width of the outline when stroke is on, in px. About half of it shows around the letters. | `data-stroke-width` |
  | `className` | string | "" | Additional class for styling the <h1> wrapper. | no aplica (React) |
  | `minFontSize` | number | 24 | Sets a minimum font-size to avoid overly tiny text on smaller screens. | `data-min-font-size` |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-rotating` · RotatingText · quizás

- **Diapositiva:** `l06-q-rotating`
- **Propósito (texto de la ficha):** Rota palabras dentro de una frase (slide/blur/flip) · motion
- **Archivo fuente:** `react-bits/src/content/TextAnimations/RotatingText/RotatingText.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/TextAnimations/RotatingText/RotatingText.jsx](../../../../../react-bits/src/content/TextAnimations/RotatingText/RotatingText.jsx) (339 líneas), CSS [RotatingText.css](../../../../../react-bits/src/content/TextAnimations/RotatingText/RotatingText.css), props en [RotatingTextDemo.jsx](../../../../../react-bits/src/demo/TextAnimations/RotatingTextDemo.jsx), uso en [rotatingTextCode.js](../../../../../react-bits/src/constants/code/TextAnimations/rotatingTextCode.js).
- **Dependencias del original:** `motion/react`
- **Informe:** QUIZÁ · coste S · valor 1 · estilos: rice, aurora
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-rotating.js` (+ `fx/experimental/exp-rotating.css` si hace falta) como pieza por clase con el nombre `exp-rotating`. Antes, buscar `exp-rotating` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-rotating`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (23):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `texts` | string[] | [] | The texts to rotate through. | `data-texts` |
  | `effect` | 'slide' \| 'flip' \| 'blur' \| 'scale' \| 'drop' | "slide" | How letters swap. Flip rolls them over like a drum, blur dissolves them, scale zooms through and drop lets them fall in with a small bounce. | `data-effect` |
  | `direction` | 'up' \| 'down' | "up" | Which way letters travel. Drop always falls from above. | `data-direction` |
  | `highlight` | boolean | false | Puts the rotating text on a colored block that smoothly resizes to fit each new text, with a text color picked for contrast. | `data-highlight` |
  | `highlightColor` | string | "#a855f7" | Color of the highlight block. Hex or rgb colors also set a readable text color automatically. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `rotationInterval` | number | 2000 | Time each text stays on screen, in milliseconds. | `data-rotation-interval` |
  | `blur` | number | 0 | Blurs letters as they come and go, in px. The blur effect uses 10 when this is 0. | `data-blur` |
  | `staggerDuration` | number | 0 | Delay between letters, in seconds. | `data-stagger-duration` |
  | `staggerFrom` | 'first' \| 'last' \| 'center' \| 'random' \| number | "first" | Which letter moves first. A number starts from that letter, random shuffles the order. | `data-stagger-from` |
  | `splitBy` | 'characters' \| 'words' \| 'lines' \| string | "characters" | How each text is split into moving pieces. Any other string is used as the separator. | `data-split-by` |
  | `loop` | boolean | true | Goes back to the first text after the last one. | `data-loop` |
  | `auto` | boolean | true | Rotates on its own. Turn off to drive it with the ref methods. | `data-auto` |
  | `pauseOnHover` | boolean | false | Holds the current text while the pointer is over it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `initial` | object | - | Overrides the state each letter enters from. Leave unset to use the effect. | `data-initial` |
  | `animate` | object | - | Overrides the state each letter settles into. | `data-animate` |
  | `exit` | object | - | Overrides the state each letter leaves to. | `data-exit` |
  | `transition` | object | - | Overrides the Motion transition used for every letter. Each effect brings its own by default. | `data-transition` |
  | `animatePresenceMode` | 'wait' \| 'sync' | "wait" | 'wait' lets the old text leave before the new one enters, 'sync' runs both at once. | `data-animate-presence-mode` |
  | `animatePresenceInitial` | boolean | false | Animates the first text in on mount. | `data-animate-presence-initial` |
  | `onNext` | (index: number) => void | undefined | Called with the new index whenever the text changes. | no aplica (React) |
  | `mainClassName` | string | '' | Extra class names for the outer element. | `data-main-class-name` |
  | `splitLevelClassName` | string | '' | Extra class names for each group of letters. Add overflow hidden here for a masked slide. | `data-split-level-class-name` |
  | `elementLevelClassName` | string | '' | Extra class names for each moving letter. | `data-element-level-class-name` |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-metallic` · MetallicPaint · quizás

- **Diapositiva:** `l06-q-metallic`
- **Propósito (texto de la ficha):** Cromo líquido sobre un texto o un logo (adaptado de Liquid Metal, de Paper)
- **Archivo fuente:** `react-bits/src/content/Animations/MetallicPaint/MetallicPaint.jsx (aún no portado al motor)`
- **Nota:** título de portada de cromo
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/MetallicPaint/MetallicPaint.jsx](../../../../../react-bits/src/content/Animations/MetallicPaint/MetallicPaint.jsx) (776 líneas), CSS [MetallicPaint.css](../../../../../react-bits/src/content/Animations/MetallicPaint/MetallicPaint.css), props en [MetallicPaintDemo.jsx](../../../../../react-bits/src/demo/Animations/MetallicPaintDemo.jsx), uso en [metallicPaintCode.js](../../../../../react-bits/src/constants/code/Animations/metallicPaintCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (título de portada de cromo; revisar la licencia de Paper) · coste L · valor 2 · estilos: solo cromo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-metallic.js` (+ `fx/experimental/exp-metallic.css` si hace falta) como pieza por clase con el nombre `exp-metallic`. Antes, buscar `exp-metallic` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l06-q-metallic`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (22):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `imageSrc` | string | undefined | URL of the logo or image to paint. SVGs work best. Transparent pixels are left empty. | `data-image-src` |
  | `text` | string | undefined | Text to paint instead of an image. Takes priority over imageSrc. | `data-text` |
  | `fontFamily` | string | 'system-ui, sans-serif' | Font used for text. | `data-font-family` |
  | `fontWeight` | number | 800 | Font weight used for text. | `data-font-weight` |
  | `color` | string | '#ffffff' | Tint of the metal. White keeps it chrome, warm tones turn it gold or copper. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `backgroundColor` | string | 'transparent' | Color behind the shape. By default the canvas is transparent. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `density` | number | 2 | How many reflection bands run across the shape. | `data-density` |
  | `softness` | number | 0.1 | Softness of the reflection edges, from 0 for crisp chrome to 1 for brushed metal. | `data-softness` |
  | `dispersion` | number | 0.3 | Rainbow fringes where the reflections bend, from 0 to 1. | `data-dispersion` |
  | `distortion` | number | 0.07 | How much the reflections ripple as they flow, from 0 to 1. | `data-distortion` |
  | `edgeBend` | number | 0.6 | How strongly the reflections bend around the edges of the shape, from 0 to 1. | `data-edge-bend` |
  | `angle` | number | 70 | Direction the reflections flow in, in degrees. | `data-angle` |
  | `speed` | number | 1 | Speed of the flow. 0 freezes it. | `data-speed` |
  | `scale` | number | 0.6 | Size of the shape inside the canvas. | `data-scale` |
  | `rotation` | number | 0 | Rotation of the shape, in degrees. | `data-rotation` |
  | `mouseTilt` | number | 0.5 | How much the reflections shift as the cursor moves, as if tilting the metal. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `lightMode` | boolean | false | Adds a soft dark rim and dims the brightest highlights so the shape reads on light pages. | `data-light-mode` |
  | `intro` | boolean | true | Pours the metal in from the outline on mount. | `data-intro` |
  | `paused` | boolean | false | Freezes the animation. | `data-paused` |
  | `dpr` | number | auto | Device pixel ratio cap. Renders at 2× or more for clean edges. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | undefined | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa
