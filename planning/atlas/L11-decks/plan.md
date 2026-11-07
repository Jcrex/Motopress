# L11-decks · Efectos de decks

Efectos de fx/ creados para decks concretos: vc, rai, arq-opus y nav-semantica.

Deck: `atlas/completo/index.html`. Diapositivas con id `l11-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l11-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l11-vc`: Efecto vc (combinado)
3. `l11-vc-conv`: Efecto vc-conv
4. `l11-vc-plot`: Efecto vc-plot
5. `l11-vc-heat`: Efecto vc-heat
6. `l11-vc-katex`: Fórmulas KaTeX
7. `l11-vc-codigo`: Resaltado de Python
8. `l11-secuencia` … sublote [Efecto secuencia](secuencia.md): 6 diapositivas
9. `l11-notas-orador`: Notas del orador
10. `l11-pausa-videos`: Pausa de vídeos al salir
11. `l11-fx-op-pila`: Efecto op-pila
12. `l11-fx-op-ritmo`: Efecto op-ritmo
13. `l11-fx-op-donde`: Efecto op-donde
14. `l11-fx-op-slam`: Efecto op-slam
15. `l11-fx-op-grafo`: Efecto op-grafo
16. `l11-fx-op-costmap`: Efecto op-costmap
17. `l11-fx-op-parseo`: Efecto op-parseo
18. `l11-fx-op-rai`: Efecto op-rai
19. `l11-fx-op-cifras`: Efecto op-cifras
20. `l11-fx-op-laya`: Efecto op-laya
21. `l11-fx-op-puerta`: Efecto op-puerta
22. `l11-fx-op-e1`: Efecto op-e1
23. `l11-fx-op-montaje`: Efecto op-montaje
24. `l11-ns-hilo`: Hilo conductor (.hilo)
25. `l11-ns-video-auto`: Vídeo automático (video[data-auto])
26. `l11-fx-ns-g1`: Efecto ns-g1
27. `l11-fx-ns-ritmo`: Efecto ns-ritmo
28. `l11-fx-ns-donde`: Efecto ns-donde
29. `l11-fx-ns-rai`: Efecto ns-rai
30. `l11-fx-ns-e1`: Efecto ns-e1
31. `l11-fx-ns-montaje`: Efecto ns-montaje
32. `l11-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **37 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ac-ficha` de L00; marcado en `L00-infra/resumen.md`)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro

## Componentes

### `vc` · Efecto vc (combinado)

- **Diapositiva:** `l11-vc`
- **Propósito (texto de la ficha):** Activar a la vez vc-conv, vc-plot, vc-heat y secuencia en una diapositiva
- **Archivo fuente:** `fx/vc.js Motor.fx('vc')`
- **Parámetros que muestra la ficha:** `requiere`: cargar antes de fx/rai.js
- **Uso observado en decks** (vc-base, vc-examen, vc-lab1, vc-lab2, vc-lab3, vc-lab4, vc-t1-realce, vc-t2-filtrado-espacial, vc-t3-frecuencia, vc-t4-bordes, vc-t5-contornos): atributos `data-a`, `data-bars`, `data-dec`, `data-fns`, `data-img`, `data-k`, `data-legend`, `data-m`, `data-mode`, `data-nums`, `data-pad`, `data-pts`, `data-seq`, `data-signed`, `data-step-ms`, `data-x`, `data-xl`, `data-y`, `data-yl`; roles `plot`
- **Demo:** Diapositiva con data-fx="vc" que contiene una vc-conv pequeña, una vc-plot y elementos data-seq
- **Aceptación propia:** Los tres conviven y secuencia revela en orden

### `vc-conv` · Efecto vc-conv

- **Diapositiva:** `l11-vc-conv`
- **Propósito (texto de la ficha):** Convolución o correlación paso a paso sobre una matriz pequeña, con la salida real
- **Archivo fuente:** `fx/vc.js convRender() convPlay()`
- **Parámetros que muestra la ficha:** `data-img`: matriz JSON; `data-k`: núcleo JSON; `data-mode`: ["conv", "corr"]; `data-pad`: ["zero", "none"]
- **Demo:** vc-conv 5×5 con núcleo 3×3 en modo conv y otra en corr
- **Aceptación propia:** La salida mostrada es la convolución correcta

### `vc-plot` · Efecto vc-plot

- **Diapositiva:** `l11-vc-plot`
- **Propósito (texto de la ficha):** Curvas y = f(x) con ejes, leyenda, barras y puntos
- **Archivo fuente:** `fx/vc.js plotRender()`
- **Parámetros que muestra la ficha:** `data-x`: min,max; `data-y`: min,max; `data-fns`: [{f, label}]; `data-legend`: ["tl", "tr", "bl", "br", "top"]; `otros`: ["data-xl", "data-yl", "data-xdec", "data-ydec", "data-bars", "data-pts"]
- **Demo:** vc-plot con dos curvas γ, leyenda tr y puntos marcados
- **Aceptación propia:** Ejes con decimales automáticos

### `vc-heat` · Efecto vc-heat

- **Diapositiva:** `l11-vc-heat`
- **Propósito (texto de la ficha):** Matriz numérica coloreada con seq o div
- **Archivo fuente:** `fx/vc.js heatRender()`
- **Parámetros que muestra la ficha:** `data-m`: matriz JSON; `data-signed`: 1; `data-dec`: n; `data-nums`: 0 oculta números
- **Demo:** vc-heat de un núcleo con signo (div) y otro sin signo (seq)
- **Aceptación propia:** Los números van en fg

### `vc-katex` · Fórmulas KaTeX

- **Diapositiva:** `l11-vc-katex`
- **Propósito (texto de la ficha):** Renderizar fórmulas $$…$$ y \( … \) al cargar
- **Archivo fuente:** `fx/vc.js katexAll()`
- **Parámetros que muestra la ficha:** `delimitadores`: ["$$…$$", "\\(…\\)"]
- **Demo:** Fórmula de la convolución en bloque y otra en línea
- **Aceptación propia:** Requiere KaTeX desde CDN con versión fija; sin red se ve el texto fuente

### `vc-codigo` · Resaltado de Python

- **Diapositiva:** `l11-vc-codigo`
- **Propósito (texto de la ficha):** Colorear palabras clave, números, cadenas, comentarios y funciones en <pre class="code">
- **Archivo fuente:** `fx/vc.js`
- **Parámetros que muestra la ficha:** `clase`: pre.code
- **Demo:** pre.code con una función Python de ejemplo
- **Aceptación propia:** Palabras clave, cadenas y comentarios coloreados con tokens

### `secuencia` · Efecto secuencia

- **Diapositiva:** `l11-secuencia` (sublote, ver [secuencia.md](secuencia.md))
- **Propósito (texto de la ficha):** Revelar en orden los elementos marcados con data-seq y mover puntos por caminos SVG
- **Archivo fuente:** `fx/rai.js Motor.fx('secuencia')`
- **Parámetros que muestra la ficha:** `data-seq`: n; `data-a`: ["fade", "draw", "grow", "rise", "pop"]; `data-travel`: #camino; `data-rest`: 0–1
- **Uso observado en decks** (arquitectura-g1-haiku, arquitectura-g1-opus, estado-arte-nav-semantica, rai-g1): atributos `data-a`, `data-dec`, `data-from`, `data-label`, `data-on`, `data-period`, `data-pre`, `data-rest`, `data-reveal`, `data-seq`, `data-step-ms`, `data-suf`, `data-travel`, `data-value`; roles —
- **Demo:** una diapositiva por variante, ver [secuencia.md](secuencia.md)

### `notas-orador` · Notas del orador

- **Diapositiva:** `l11-notas-orador`
- **Propósito (texto de la ficha):** Abrir con N una ventana con las notas <aside class="notes"> de la diapositiva activa
- **Archivo fuente:** `fx/rai.js`
- **Parámetros que muestra la ficha:** `tecla`: N; `marcado`: aside.notes
- **Demo:** aside.notes de ejemplo y la tecla N
- **Aceptación propia:** N abre la ventana con estas notas

### `pausa-videos` · Pausa de vídeos al salir

- **Diapositiva:** `l11-pausa-videos`
- **Propósito (texto de la ficha):** Pausar los vídeos de una diapositiva al abandonarla
- **Archivo fuente:** `fx/rai.js`
- **Demo:** Vídeo corto sintético (canvas grabado o el de ns-g1) que se pausa al salir
- **Aceptación propia:** Al volver el vídeo está en pausa

### `fx-op-pila` · Efecto op-pila

- **Diapositiva:** `l11-fx-op-pila`
- **Propósito (texto de la ficha):** La orden baja por la pila de capas y a la derecha aparece lo que sale de cada una
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-pila')`
- **Uso observado en decks** (arquitectura-g1-opus): atributos `data-out`, `data-seq`; roles `now`, `pre`
- **Demo:** El efecto op-pila con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-ritmo` · Efecto op-ritmo

- **Diapositiva:** `l11-fx-op-ritmo`
- **Propósito (texto de la ficha):** Frecuencias de control en escala logarítmica; cada fila late a su ritmo
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-ritmo')`
- **Uso observado en decks** (arquitectura-g1-opus): atributos —; roles `ritmo`
- **Demo:** El efecto op-ritmo con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-donde` · Efecto op-donde

- **Diapositiva:** `l11-fx-op-donde`
- **Propósito (texto de la ficha):** Qué corre a bordo y qué fuera; paquetes por Wi-Fi y watchdog
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-donde')`
- **Uso observado en decks** (arquitectura-g1-opus): atributos —; roles `donde`
- **Demo:** El efecto op-donde con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-slam` · Efecto op-slam

- **Diapositiva:** `l11-fx-op-slam`
- **Propósito (texto de la ficha):** Raycasting de un LiDAR que construye el mapa y localización con incertidumbre
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-slam')`
- **Uso observado en decks** (arquitectura-g1-opus): atributos —; roles `map`, `p1`, `p2`, `phase`
- **Demo:** El efecto op-slam con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-grafo` · Efecto op-grafo

- **Diapositiva:** `l11-fx-op-grafo`
- **Propósito (texto de la ficha):** Mapa métrico → grafo semántico → capa de personas, con la consulta de una orden
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-grafo')`
- **Uso observado en decks** (arquitectura-g1-opus, estado-arte-nav-semantica): atributos —; roles `grafo`
- **Demo:** El efecto op-grafo con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-costmap` · Efecto op-costmap

- **Diapositiva:** `l11-fx-op-costmap`
- **Propósito (texto de la ficha):** Capas de coste que se suman y A* que se recalcula cuando se mueven personas
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-costmap')`
- **Uso observado en decks** (arquitectura-g1-opus, estado-arte-nav-semantica): atributos —; roles `cm`
- **Demo:** El efecto op-costmap con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-parseo` · Efecto op-parseo

- **Diapositiva:** `l11-fx-op-parseo`
- **Propósito (texto de la ficha):** Una frase que se convierte en JSON
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-parseo')`
- **Uso observado en decks** (arquitectura-g1-opus): atributos `data-k`; roles `flow`, `json`, `pk`
- **Demo:** El efecto op-parseo con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-rai` · Efecto op-rai

- **Diapositiva:** `l11-fx-op-rai`
- **Propósito (texto de la ficha):** Agente ReAct con sus herramientas; un pulso las recorre en orden
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-rai')`
- **Uso observado en decks** (arquitectura-g1-opus): atributos —; roles `rai`
- **Demo:** El efecto op-rai con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-cifras` · Efecto op-cifras

- **Diapositiva:** `l11-fx-op-cifras`
- **Propósito (texto de la ficha):** Cifras que cuentan hasta su valor
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-cifras')`
- **Uso observado en decks** (arquitectura-g1-opus): atributos `data-count`, `data-seq`; roles `glitch`
- **Demo:** El efecto op-cifras con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-laya` · Efecto op-laya

- **Diapositiva:** `l11-fx-op-laya`
- **Propósito (texto de la ficha):** Demos de choice, noul y score
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-laya')`
- **Uso observado en decks** (arquitectura-g1-opus, estado-arte-nav-semantica): atributos `data-seq`; roles `d-choice`, `d-noul`, `d-score`
- **Demo:** El efecto op-laya con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-puerta` · Efecto op-puerta

- **Diapositiva:** `l11-fx-op-puerta`
- **Propósito (texto de la ficha):** Barras de confianza, umbral τ y una puerta que se abre o pregunta
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-puerta')`
- **Uso observado en decks** (arquitectura-g1-opus): atributos —; roles `g1`, `g2`
- **Demo:** El efecto op-puerta con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-e1` · Efecto op-e1

- **Diapositiva:** `l11-fx-op-e1`
- **Propósito (texto de la ficha):** Diagrama de secuencia de una orden con un paquete que lo recorre
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-e1')`
- **Uso observado en decks** (arquitectura-g1-opus): atributos —; roles `e1`
- **Demo:** El efecto op-e1 con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-op-montaje` · Efecto op-montaje

- **Diapositiva:** `l11-fx-op-montaje`
- **Propósito (texto de la ficha):** Seis fases con barra de progreso
- **Archivo fuente:** `fx/arq-opus.js Motor.fx('op-montaje')`
- **Uso observado en decks** (arquitectura-g1-opus): atributos `data-seq`; roles `track`
- **Demo:** El efecto op-montaje con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `ns-hilo` · Hilo conductor (.hilo)

- **Diapositiva:** `l11-ns-hilo`
- **Propósito (texto de la ficha):** Barra con las nueve etapas instrucción → locomoción que enciende las que cubre la diapositiva
- **Archivo fuente:** `fx/nav-semantica.js buildHilo()`
- **Parámetros que muestra la ficha:** `data-on`: "6,7,8" o rangos "1-3"; `data-label`: texto alternativo; `rombo`: etapa 5 siempre
- **Demo:** Tres .hilo con data-on="1-3", "5" y "6,7,8"
- **Aceptación propia:** La etapa 5 lleva rombo en los tres

### `ns-video-auto` · Vídeo automático (video[data-auto])

- **Diapositiva:** `l11-ns-video-auto`
- **Propósito (texto de la ficha):** Reproducir un vídeo al entrar en la diapositiva y pausarlo al salir; clic alterna
- **Archivo fuente:** `fx/nav-semantica.js`
- **Parámetros que muestra la ficha:** `atributo`: data-auto; `reducido`: no arranca solo
- **Demo:** video[data-auto] con un vídeo local de atlas/completo/media/
- **Aceptación propia:** Arranca al entrar y se pausa al salir; con movimiento reducido no arranca

### `fx-ns-g1` · Efecto ns-g1

- **Diapositiva:** `l11-fx-ns-g1`
- **Propósito (texto de la ficha):** Modelo 3D del Unitree G1 con three.js que gira despacio, con imagen de respaldo
- **Archivo fuente:** `fx/nav-semantica.js Motor.fx('ns-g1')`
- **Parámetros que muestra la ficha:** `requiere`: THREE y STLLoader locales; `respaldo`: imagen estática
- **Uso observado en decks** (estado-arte-nav-semantica): atributos `data-src`, `data-title-fx`; roles `g1`
- **Demo:** Modelo del Unitree G1 con three.js y el STL copiados a atlas/completo/vendor/
- **Aceptación propia:** Gira en play(); sin WebGL o con file:// muestra la imagen de respaldo

### `fx-ns-ritmo` · Efecto ns-ritmo

- **Diapositiva:** `l11-fx-ns-ritmo`
- **Propósito (texto de la ficha):** Frecuencias de control por capa
- **Archivo fuente:** `fx/nav-semantica.js Motor.fx('ns-ritmo')`
- **Uso observado en decks** (estado-arte-nav-semantica): atributos —; roles `ritmo`
- **Demo:** El efecto ns-ritmo con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-ns-donde` · Efecto ns-donde

- **Diapositiva:** `l11-fx-ns-donde`
- **Propósito (texto de la ficha):** Qué corre a bordo y qué fuera
- **Archivo fuente:** `fx/nav-semantica.js Motor.fx('ns-donde')`
- **Uso observado en decks** (estado-arte-nav-semantica): atributos —; roles `donde`
- **Demo:** El efecto ns-donde con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-ns-rai` · Efecto ns-rai

- **Diapositiva:** `l11-fx-ns-rai`
- **Propósito (texto de la ficha):** Agente RAI y sus herramientas
- **Archivo fuente:** `fx/nav-semantica.js Motor.fx('ns-rai')`
- **Uso observado en decks** (estado-arte-nav-semantica): atributos —; roles `rai`
- **Demo:** El efecto ns-rai con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-ns-e1` · Efecto ns-e1

- **Diapositiva:** `l11-fx-ns-e1`
- **Propósito (texto de la ficha):** Diagrama de secuencia de la orden E1
- **Archivo fuente:** `fx/nav-semantica.js Motor.fx('ns-e1')`
- **Uso observado en decks** (estado-arte-nav-semantica): atributos —; roles `e1`
- **Demo:** El efecto ns-e1 con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()

### `fx-ns-montaje` · Efecto ns-montaje

- **Diapositiva:** `l11-fx-ns-montaje`
- **Propósito (texto de la ficha):** Fases de montaje con progreso
- **Archivo fuente:** `fx/nav-semantica.js Motor.fx('ns-montaje')`
- **Uso observado en decks** (estado-arte-nav-semantica): atributos `data-seq`; roles `track`
- **Demo:** El efecto ns-montaje con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)
- **Aceptación propia:** Sin errores de consola y con render() completo antes de play()
