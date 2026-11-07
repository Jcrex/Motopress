# L12-herramientas · Herramientas

Herramientas de línea de órdenes de tools/.

Deck: `atlas/completo/index.html`. Diapositivas con id `l12-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l12-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l12-tool-build-themes`: build-themes
3. `l12-tool-bundle`: bundle
4. `l12-tool-verificar`: verificar
5. `l12-tool-salida`: Carpeta de salida
6. `l12-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **6 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ficha` de L00)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro

## Componentes

### `tool-build-themes` · build-themes

- **Diapositiva:** `l12-tool-build-themes`
- **Propósito (texto de la ficha):** Generar tokens.css y meta.js desde source.json y ajustar paletas y contrastes
- **Archivo fuente:** `tools/build-themes.mjs`
- **Parámetros que muestra la ficha:** `opciones`: ["--report"]
- **Demo:** Orden node tools/build-themes.mjs --report y un extracto real de su salida
- **Aceptación propia:** La salida es una captura real, no inventada

### `tool-bundle` · bundle

- **Diapositiva:** `l12-tool-bundle`
- **Propósito (texto de la ficha):** Empaquetar un deck en un único HTML
- **Archivo fuente:** `tools/bundle.mjs`
- **Parámetros que muestra la ficha:** `opciones`: ["<deck>/index.html", "[destino]", "--fragment", "--out="]
- **Demo:** Órdenes de bundle con y sin destino y --fragment, y el tamaño real del Atlas Completo empaquetado
- **Aceptación propia:** El tamaño se mide al cerrar el lote

### `tool-verificar` · verificar

- **Diapositiva:** `l12-tool-verificar`
- **Propósito (texto de la ficha):** Capturar todas las diapositivas en varios estilos y modos e informar de errores y desbordes
- **Archivo fuente:** `tools/verificar.mjs`
- **Parámetros que muestra la ficha:** `opciones`: ["<deck>", "[estilo1,estilo2]", "--out=", "CHROMIUM_PATH", "VERIF_REDUCED"]
- **Demo:** Orden de verificar con estilos y su salida real sobre este deck
- **Aceptación propia:** La salida es la de la última pasada

### `tool-salida` · Carpeta de salida

- **Diapositiva:** `l12-tool-salida`
- **Propósito (texto de la ficha):** Decidir dónde escriben las herramientas: output/, --out o MOTOR_OUT
- **Archivo fuente:** `tools/salida.mjs`
- **Parámetros que muestra la ficha:** `prioridad`: --out > MOTOR_OUT > output/
- **Demo:** Tabla de prioridad --out > MOTOR_OUT > output/ con un ejemplo de cada una
- **Aceptación propia:** —
