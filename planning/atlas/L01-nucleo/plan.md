# L01-nucleo · Núcleo

Lienzo, anatomía de la diapositiva, navegación, pasos, HUD, vista general, preferencias, ciclo de vida de efectos, eventos, impresión.

Deck: `atlas/completo/index.html`. Diapositivas con id `l01-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l01-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l01-lienzo`: Lienzo 1920×1080 y escalado ✓
3. `l01-anatomia-slide`: Anatomía de una diapositiva ✓
4. `l01-navegacion-teclado`: Navegación con teclado ✓
5. `l01-navegacion-tactil`: Navegación táctil ✓
6. `l01-ancla-url`: Ancla de la URL ✓
7. `l01-pasos`: Pasos (data-step) ✓
8. `l01-hud`: HUD de controles ✓
9. `l01-barra-progreso`: Barra de progreso ✓
10. `l01-vista-general`: Vista general ✓
11. `l01-pantalla-completa`: Pantalla completa ✓
12. `l01-selector-estilo`: Selector de estilo ✓
13. `l01-modo-claro-oscuro`: Modo claro y oscuro ✓
14. `l01-preferencias`: Memoria de preferencias ✓
15. `l01-motor-pick`: Estilos del deck (MOTOR_PICK) ✓
16. `l01-decorado-slide`: Decorado por diapositiva ✓
17. `l01-ciclo-fx`: Ciclo de vida de un efecto ✓
18. `l01-eventos-motor`: Eventos del motor ✓
19. `l01-movimiento-reducido`: Movimiento reducido ✓
20. `l01-impresion-pdf`: Impresión y PDF ✓
21. `l01-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **21 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ac-ficha` de L00; marcado en `L00-infra/resumen.md`)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro

## Componentes

### `lienzo` · Lienzo 1920×1080 y escalado

- **Diapositiva:** `l01-lienzo`
- **Propósito (texto de la ficha):** Componer siempre sobre un lienzo fijo de 1920×1080 y escalarlo al tamaño de la ventana sin deformarlo
- **Archivo fuente:** `engine/engine.js fit() · engine/engine.css .viewport .stage`
- **Parámetros que muestra la ficha:** `margenes`: 120 arriba, 128 lados, 140 abajo; `cuerpo_util`: 1664×630
- **Demo:** Marco del lienzo a escala con cotas de 1920×1080, márgenes 120/128/140 y el rectángulo del cuerpo útil 1664×630 dibujados en SVG sobre la propia diapositiva
- **Aceptación propia:** Las cotas coinciden con getBoundingClientRect del .s-body dividido por la escala

### `anatomia-slide` · Anatomía de una diapositiva

- **Diapositiva:** `l01-anatomia-slide`
- **Propósito (texto de la ficha):** Estructura común de cada diapositiva para que el motor la numere, la agrupe y la decore
- **Archivo fuente:** `engine/engine.css .slide .s-head .kicker .s-title .s-body`
- **Parámetros que muestra la ficha:** `atributos`: ["id", "data-section", "data-title", "data-fx"]; `clases`: ["s-head", "kicker", "s-title", "s-body"]
- **Demo:** La propia diapositiva con cada parte señalada: kicker, s-title, s-body y los atributos id/data-section/data-title escritos junto a su caja
- **Aceptación propia:** Cada etiqueta apunta a un elemento real de la diapositiva

### `navegacion-teclado` · Navegación con teclado

- **Diapositiva:** `l01-navegacion-teclado`
- **Propósito (texto de la ficha):** Avanzar y retroceder por pasos y diapositivas con el teclado
- **Archivo fuente:** `engine/engine.js onKey() next() prev() go()`
- **En el Atlas original:** `#atajos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `siguiente`: ["→", "Espacio", "↓", "AvPág", "Intro"]; `anterior`: ["←", "↑", "RePág", "Retroceso"]; `extremos`: ["Inicio", "Fin"]
- **Demo:** Teclado en .keycap con las teclas agrupadas por acción; un data-step por grupo que lo resalta
- **Aceptación propia:** Las teclas listadas son exactamente las de onKey() en engine.js

### `navegacion-tactil` · Navegación táctil

- **Diapositiva:** `l01-navegacion-tactil`
- **Propósito (texto de la ficha):** Pasar diapositivas deslizando el dedo en pantallas táctiles
- **Archivo fuente:** `engine/engine.js onTouch()`
- **Parámetros que muestra la ficha:** `umbral_px`: 50; `relacion_horizontal`: 1.3
- **Demo:** Esquema de un gesto de deslizamiento con el umbral de 50 px y la relación 1,3 dibujados; animación del dedo en play()
- **Aceptación propia:** El estado final muestra el gesto completo sin animar

### `ancla-url` · Ancla de la URL

- **Diapositiva:** `l01-ancla-url`
- **Propósito (texto de la ficha):** Abrir una diapositiva concreta con #id y mantener la URL al día al navegar
- **Archivo fuente:** `engine/engine.js go() init()`
- **Parámetros que muestra la ficha:** `ejemplo`: #lidar
- **Demo:** Barra de dirección simulada con #id y un enlace real a #l01-hud que salta a esa diapositiva
- **Aceptación propia:** El enlace navega al hacer clic y la URL cambia

### `pasos` · Pasos (data-step)

- **Diapositiva:** `l01-pasos`
- **Propósito (texto de la ficha):** Revelar elementos uno a uno dentro de una diapositiva antes de pasar a la siguiente
- **Archivo fuente:** `engine/engine.js stepped() · engine/engine.css [data-step]`
- **Parámetros que muestra la ficha:** `atributo`: data-step; `clase_visible`: on; `api`: ["api.step", "api.steps"]
- **Demo:** Tres bloques con data-step que aparecen con → y un contador api.step/api.steps en vivo
- **Aceptación propia:** El contador vale 0/3, 1/3, 2/3 y 3/3 al pulsar →; en la vista general muestra 3/3

### `hud` · HUD de controles

- **Diapositiva:** `l01-hud`
- **Propósito (texto de la ficha):** Controles flotantes con contador, selector de estilos y botones; se ocultan con H o por inactividad
- **Archivo fuente:** `engine/engine.js buildHud() updateHud() wake() · engine/engine.css .hud`
- **Parámetros que muestra la ficha:** `tecla`: H; `piezas`: ["hud-count", "hud-styles", "hud-sep"]
- **Demo:** Captura anotada del HUD con contador, selector y botones; nota de la tecla H
- **Aceptación propia:** Las piezas anotadas existen en buildHud()

### `barra-progreso` · Barra de progreso

- **Diapositiva:** `l01-barra-progreso`
- **Propósito (texto de la ficha):** Indicar cuánto queda de la presentación
- **Archivo fuente:** `engine/engine.css .progress`
- **Demo:** Réplica ampliada de .progress con su valor en esta diapositiva y la fórmula índice/total
- **Aceptación propia:** El valor mostrado coincide con el de la barra real

### `vista-general` · Vista general

- **Diapositiva:** `l01-vista-general`
- **Propósito (texto de la ficha):** Ver todas las diapositivas en miniatura y saltar a una con un clic
- **Archivo fuente:** `engine/engine.js toggleOverview() layoutOverview()`
- **Parámetros que muestra la ficha:** `tecla`: O; `salir`: Escape
- **Demo:** Rejilla de miniaturas de ejemplo y las teclas O/Escape; botón que llama a la vista general real
- **Aceptación propia:** El botón abre la vista general y Escape la cierra

### `pantalla-completa` · Pantalla completa

- **Diapositiva:** `l01-pantalla-completa`
- **Propósito (texto de la ficha):** Entrar y salir de pantalla completa
- **Archivo fuente:** `engine/engine.js fullscreen()`
- **Parámetros que muestra la ficha:** `tecla`: F
- **Demo:** Botón que alterna pantalla completa y la tecla F
- **Aceptación propia:** El botón funciona y no lanza error si el navegador lo deniega

### `selector-estilo` · Selector de estilo

- **Diapositiva:** `l01-selector-estilo`
- **Propósito (texto de la ficha):** Cambiar la dirección de arte en vivo sin recargar
- **Archivo fuente:** `engine/engine.js setStyle() cycleStyle()`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `teclas`: ["S", "⇧S", "1…9", "0"]; `atributo`: <html data-style>
- **Demo:** Los diez estilos con su tecla 1…0 y un botón por estilo que llama a setStyle
- **Aceptación propia:** Pulsar un botón cambia el estilo de todo el deck

### `modo-claro-oscuro` · Modo claro y oscuro

- **Diapositiva:** `l01-modo-claro-oscuro`
- **Propósito (texto de la ficha):** Alternar claro y oscuro respetando la preferencia del sistema mientras no se elija otra
- **Archivo fuente:** `engine/engine.js setMode() toggleMode()`
- **Parámetros que muestra la ficha:** `tecla`: D; `atributo`: <html data-theme>; `por_defecto`: prefers-color-scheme
- **Demo:** Dos medias diapositivas con data-theme fijo claro y oscuro una junto a otra, y la tecla D
- **Aceptación propia:** Los dos lados usan tokens distintos del mismo estilo

### `preferencias` · Memoria de preferencias

- **Diapositiva:** `l01-preferencias`
- **Propósito (texto de la ficha):** Recordar en el navegador el estilo y el modo elegidos
- **Archivo fuente:** `engine/engine.js store`
- **Parámetros que muestra la ficha:** `claves`: ["style", "mode"]
- **Demo:** Lectura en vivo de localStorage con las claves style y mode del motor
- **Aceptación propia:** La lectura cambia al pulsar S o D y se protege con try/catch

### `motor-pick` · Estilos del deck (MOTOR_PICK)

- **Diapositiva:** `l01-motor-pick`
- **Propósito (texto de la ficha):** Limitar y ordenar los estilos disponibles en un deck
- **Archivo fuente:** `engine/engine.js STYLES · themes/meta.js`
- **Parámetros que muestra la ficha:** `sintaxis`: window.MOTOR_PICK = ['rice', 'nube']; `orden_carga`: antes de themes/meta.js
- **Demo:** Bloque de código con window.MOTOR_PICK y la lista resultante de este deck
- **Aceptación propia:** La lista coincide con el selector del HUD

### `decorado-slide` · Decorado por diapositiva

- **Diapositiva:** `l01-decorado-slide`
- **Propósito (texto de la ficha):** Inyectar el decorado del estilo (folio, barra de sección, ruta de tópico) según data-section y la posición
- **Archivo fuente:** `engine/engine.js injectDeco() updateDeco() · engine/engine.css .deco`
- **Parámetros que muestra la ficha:** `usa`: ["data-section", "índice", "total"]
- **Demo:** El decorado real de esta diapositiva en los diez estilos, como miniaturas estáticas con su nombre
- **Aceptación propia:** Cada miniatura muestra el decorado de su estilo

### `ciclo-fx` · Ciclo de vida de un efecto

- **Diapositiva:** `l01-ciclo-fx`
- **Propósito (texto de la ficha):** Registrar un efecto y separar el estado final (render) de la animación (play), con limpieza (stop) y aviso de pasos (step)
- **Archivo fuente:** `engine/engine.js Motor.fx() activate() deactivate() renderSlide()`
- **Parámetros que muestra la ficha:** `metodos`: ["render(api)", "play(api)", "stop(api)", "step(api, n, {dir, el, total, animate})"]; `regla`: render deja el estado final completo; play solo anima
- **Demo:** Efecto de ejemplo atlas-ciclo que escribe en un registro cada llamada a render, play, step y stop con su hora
- **Aceptación propia:** El registro muestra render al entrar, play si no hay movimiento reducido y step con cada →

### `eventos-motor` · Eventos del motor

- **Diapositiva:** `l01-eventos-motor`
- **Propósito (texto de la ficha):** Avisar a cualquier script de la entrada, la salida y los pasos de una diapositiva
- **Archivo fuente:** `engine/engine.js emit()`
- **Parámetros que muestra la ficha:** `eventos`: ["motor:enter", "motor:leave", "motor:step"]; `detail`: ["slide", "index", "api", "animate", "step", "dir"]
- **Demo:** Registro en vivo de motor:enter, motor:step y motor:leave con su detail
- **Aceptación propia:** Al pulsar → aparece motor:step con step y dir

### `movimiento-reducido` · Movimiento reducido

- **Diapositiva:** `l01-movimiento-reducido`
- **Propósito (texto de la ficha):** Respetar prefers-reduced-motion: sin animaciones, con el estado final visible
- **Archivo fuente:** `engine/engine.js api.reduced · engine/engine.css @media (prefers-reduced-motion)`
- **Parámetros que muestra la ficha:** `api`: api.reduced
- **Demo:** La misma animación en dos paneles: uno con play() y otro forzado a api.reduced, con la regla escrita
- **Aceptación propia:** El panel reducido muestra el estado final sin moverse

### `impresion-pdf` · Impresión y PDF

- **Diapositiva:** `l01-impresion-pdf`
- **Propósito (texto de la ficha):** Imprimir cada diapositiva en una página de 1920×1080 sin HUD ni barra
- **Archivo fuente:** `engine/engine.css @media print`
- **Parámetros que muestra la ficha:** `pagina`: 1920×1080
- **Demo:** Hoja A del PDF simulada a escala con lo que se oculta (HUD, barra) tachado; enlace a imprimir
- **Aceptación propia:** window.print() abre el diálogo
