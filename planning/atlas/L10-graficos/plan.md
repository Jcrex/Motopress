# L10-graficos · Demos del Atlas

Efectos de datos y diagramas del Atlas actual: sistema, ROS 2, ML, datos y Arch.

Deck: `atlas/completo/index.html`. Diapositivas con id `l10-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l10-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l10-fx-estilos`: Efecto estilos
3. `l10-fx-teoria`: Efecto teoria
4. `l10-fx-rueda`: Efecto rueda
5. `l10-fx-tipo`: Efecto tipo
6. `l10-fx-paletas`: Efecto paletas
7. `l10-fx-refs`: Efecto refs
8. `l10-fx-compare`: Efecto compare
9. `l10-fx-rosgraph`: Efecto rosgraph
10. `l10-fx-lidar`: Efecto lidar
11. `l10-fx-astar`: Efecto astar
12. `l10-fx-tftree`: Efecto tftree
13. `l10-fx-blueprint`: Efecto blueprint
14. `l10-fx-scope`: Efecto scope
15. `l10-fx-training`: Efecto training
16. `l10-fx-confusion`: Efecto confusion
17. `l10-fx-latent`: Efecto latent
18. `l10-fx-nnet`: Efecto nnet
19. `l10-fx-clouds`: Efecto clouds
20. `l10-fx-ridge`: Efecto ridge
21. `l10-fx-calendar`: Efecto calendar
22. `l10-fx-sankey`: Efecto sankey
23. `l10-fx-kpis`: Efecto kpis
24. `l10-fx-desktop`: Efecto desktop
25. `l10-fx-fetch`: Efecto fetch
26. `l10-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **26 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ficha` de L00)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro

## Componentes

### `fx-estilos` · Efecto estilos

- **Diapositiva:** `l10-fx-estilos`
- **Propósito (texto de la ficha):** Rejilla con las diez direcciones de arte y sus muestras
- **Archivo fuente:** `fx/sistema.js Motor.fx('estilos')`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `grid`
- **Demo:** El efecto estilos con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-teoria` · Efecto teoria

- **Diapositiva:** `l10-fx-teoria`
- **Propósito (texto de la ficha):** Teoría del color: contrastes de Itten del estilo activo
- **Archivo fuente:** `fx/sistema.js Motor.fx('teoria')`
- **En el Atlas original:** `#color-teoria` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `main`, `side`
- **Demo:** El efecto teoria con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-rueda` · Efecto rueda

- **Diapositiva:** `l10-fx-rueda`
- **Propósito (texto de la ficha):** Círculo OKLCH con la armonía del estilo
- **Archivo fuente:** `fx/sistema.js Motor.fx('rueda')`
- **En el Atlas original:** `#color-rueda` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `side`, `wheel`
- **Demo:** El efecto rueda con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-tipo` · Efecto tipo

- **Diapositiva:** `l10-fx-tipo`
- **Propósito (texto de la ficha):** Muestra tipográfica de las familias del estilo
- **Archivo fuente:** `fx/sistema.js Motor.fx('tipo')`
- **En el Atlas original:** `#tipografia` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `body`
- **Demo:** El efecto tipo con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-paletas` · Efecto paletas

- **Diapositiva:** `l10-fx-paletas`
- **Propósito (texto de la ficha):** Paletas para datos con simulación de daltonismo
- **Archivo fuente:** `fx/sistema.js Motor.fx('paletas')`
- **En el Atlas original:** `#paletas` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `body`
- **Demo:** El efecto paletas con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-refs` · Efecto refs

- **Diapositiva:** `l10-fx-refs`
- **Propósito (texto de la ficha):** Referencias: Okabe–Ito, viridis y paletas de origen
- **Archivo fuente:** `fx/sistema.js Motor.fx('refs')`
- **En el Atlas original:** `#referencias` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `grid`
- **Demo:** El efecto refs con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-compare` · Efecto compare

- **Diapositiva:** `l10-fx-compare`
- **Propósito (texto de la ficha):** Comparativa de estilos
- **Archivo fuente:** `fx/sistema.js Motor.fx('compare')`
- **En el Atlas original:** `#comparativa` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `grid`
- **Demo:** El efecto compare con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-rosgraph` · Efecto rosgraph

- **Diapositiva:** `l10-fx-rosgraph`
- **Propósito (texto de la ficha):** Grafo de nodos y tópicos estilo rqt_graph con mensajes
- **Archivo fuente:** `fx/ros.js Motor.fx('rosgraph')`
- **En el Atlas original:** `#ros-grafo` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `graph`
- **Demo:** El efecto rosgraph con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-lidar` · Efecto lidar

- **Diapositiva:** `l10-fx-lidar`
- **Propósito (texto de la ficha):** Escaneo LiDAR 2D (LaserScan)
- **Archivo fuente:** `fx/ros.js Motor.fx('lidar')`
- **En el Atlas original:** `#lidar` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `ramp`, `readout`, `scan`
- **Demo:** El efecto lidar con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-astar` · Efecto astar

- **Diapositiva:** `l10-fx-astar`
- **Propósito (texto de la ficha):** Mapa de ocupación con búsqueda A*
- **Archivo fuente:** `fx/ros.js Motor.fx('astar')`
- **En el Atlas original:** `#ocupacion` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `legend`, `map`, `stats`
- **Demo:** El efecto astar con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-tftree` · Efecto tftree

- **Diapositiva:** `l10-fx-tftree`
- **Propósito (texto de la ficha):** Árbol de transformadas TF
- **Archivo fuente:** `fx/ros.js Motor.fx('tftree')`
- **En el Atlas original:** `#tf` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `tree`
- **Demo:** El efecto tftree con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-blueprint` · Efecto blueprint

- **Diapositiva:** `l10-fx-blueprint`
- **Propósito (texto de la ficha):** Plano técnico de la base del robot
- **Archivo fuente:** `fx/ros.js Motor.fx('blueprint')`
- **En el Atlas original:** `#plano-robot` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `drawing`
- **Demo:** El efecto blueprint con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-scope` · Efecto scope

- **Diapositiva:** `l10-fx-scope`
- **Propósito (texto de la ficha):** Telemetría tipo osciloscopio
- **Archivo fuente:** `fx/ros.js Motor.fx('scope')`
- **En el Atlas original:** `#telemetria` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `scope`, `side`
- **Demo:** El efecto scope con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-training` · Efecto training

- **Diapositiva:** `l10-fx-training`
- **Propósito (texto de la ficha):** Curvas de entrenamiento y validación
- **Archivo fuente:** `fx/ml.js Motor.fx('training')`
- **En el Atlas original:** `#entrenamiento` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `body`
- **Demo:** El efecto training con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-confusion` · Efecto confusion

- **Diapositiva:** `l10-fx-confusion`
- **Propósito (texto de la ficha):** Matriz de confusión
- **Archivo fuente:** `fx/ml.js Motor.fx('confusion')`
- **En el Atlas original:** `#confusion` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `matrix`, `side`
- **Demo:** El efecto confusion con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-latent` · Efecto latent

- **Diapositiva:** `l10-fx-latent`
- **Propósito (texto de la ficha):** Espacio latente con agrupaciones
- **Archivo fuente:** `fx/ml.js Motor.fx('latent')`
- **En el Atlas original:** `#latente` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `legend`, `plot`
- **Demo:** El efecto latent con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-nnet` · Efecto nnet

- **Diapositiva:** `l10-fx-nnet`
- **Propósito (texto de la ficha):** Arquitectura de una red neuronal
- **Archivo fuente:** `fx/ml.js Motor.fx('nnet')`
- **En el Atlas original:** `#red` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `net`
- **Demo:** El efecto nnet con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-clouds` · Efecto clouds

- **Diapositiva:** `l10-fx-clouds`
- **Propósito (texto de la ficha):** Tres nubes de palabras (d3-cloud)
- **Archivo fuente:** `fx/datos.js Motor.fx('clouds')`
- **En el Atlas original:** `#nubes` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `bubbles`, `spiral`, `wall`
- **Demo:** El efecto clouds con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-ridge` · Efecto ridge

- **Diapositiva:** `l10-fx-ridge`
- **Propósito (texto de la ficha):** Ridgeline de distribuciones
- **Archivo fuente:** `fx/datos.js Motor.fx('ridge')`
- **En el Atlas original:** `#ridgeline` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `ridge`
- **Demo:** El efecto ridge con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-calendar` · Efecto calendar

- **Diapositiva:** `l10-fx-calendar`
- **Propósito (texto de la ficha):** Calendario de commits
- **Archivo fuente:** `fx/datos.js Motor.fx('calendar')`
- **En el Atlas original:** `#calendario` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `body`
- **Demo:** El efecto calendar con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-sankey` · Efecto sankey

- **Diapositiva:** `l10-fx-sankey`
- **Propósito (texto de la ficha):** Sankey de un pipeline de datos (d3-sankey)
- **Archivo fuente:** `fx/datos.js Motor.fx('sankey')`
- **En el Atlas original:** `#sankey` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `flow`
- **Demo:** El efecto sankey con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-kpis` · Efecto kpis

- **Diapositiva:** `l10-fx-kpis`
- **Propósito (texto de la ficha):** Panel de indicadores con sparklines
- **Archivo fuente:** `fx/datos.js Motor.fx('kpis')`
- **En el Atlas original:** `#kpis` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `body`
- **Demo:** El efecto kpis con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-desktop` · Efecto desktop

- **Diapositiva:** `l10-fx-desktop`
- **Propósito (texto de la ficha):** Escritorio Hyprland en mosaico dwindle
- **Archivo fuente:** `fx/arch.js Motor.fx('desktop')`
- **En el Atlas original:** `#escritorio` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `desk`
- **Demo:** El efecto desktop con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche

### `fx-fetch` · Efecto fetch

- **Diapositiva:** `l10-fx-fetch`
- **Propósito (texto de la ficha):** Ficha del sistema tipo fastfetch
- **Archivo fuente:** `fx/arch.js Motor.fx('fetch')`
- **En el Atlas original:** `#fetch` (reutilizar su marcado como punto de partida)
- **Uso observado en decks** (atlas): atributos —; roles `term`
- **Demo:** El efecto fetch con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha
- **Aceptación propia:** Mismo estado final que en el Atlas original en suizo y noche
