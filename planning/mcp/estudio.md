# Estudio: servidor MCP para crear presentaciones con el motor

Fecha: 2026-11-08. Estado: propuesta, sin implementar.

## Conclusión

Un MCP merece la pena, pero no como primer paso ni como sustituto de la skill. Su valor está en tres cosas que la skill y las órdenes de terminal no dan bien:

1. **Ver el resultado sin pasos manuales.** Una herramienta `capturar` devuelve la imagen de una diapositiva (en un estilo, modo y paso concretos) directamente al modelo, con un navegador y un servidor que siguen abiertos entre llamadas. Hoy hay que levantar `http.server`, ejecutar `verificar.mjs` (que captura todo el deck, unos 1,2 s por diapositiva y combinación), buscar los PNG y abrirlos uno a uno.
2. **Editar por diapositivas, no por archivos.** Los decks reales tienen de 24 a 52 diapositivas y hasta 1000 líneas. Leer y escribir una diapositiva por su `id`, con revisión automática después de cada escritura, evita leer el archivo entero y romper la estructura.
3. **Entradas con esquema.** Crear un deck o una diapositiva a partir de datos validados (estilo, tipo de diapositiva, datos de un gráfico) en vez de HTML libre.

Lo demás (reglas de composición, catálogo, cuándo usar cada pieza) es conocimiento, y eso ya está en la skill `crear-presentacion`. El MCP debe ser una capa fina sobre las herramientas de `tools/`, no una segunda implementación.

## Situación actual

| Necesidad del agente | Hoy | Problema |
|---|---|---|
| Saber qué piezas y efectos hay | README, AGENTS.md, skill | Se desincroniza al añadir efectos; los efectos más usados (`secuencia`, `vc-plot`) no estaban documentados |
| Crear el esqueleto | copiar `plantilla.html` | bien resuelto con la skill |
| Detectar errores de estructura | `tools/revisar.mjs` (nuevo) | bien resuelto; falta exponerlo como función |
| Ver cómo queda | `verificar.mjs` + abrir PNG | lento, captura todo, solo el primer paso, depende de un servidor aparte |
| Gráficos con datos del usuario | escribir un efecto cada vez | no hay un efecto genérico de gráficos; los de `fx/datos.js` y `fx/ml.js` traen datos fijos |
| Editar un deck largo | Read/Edit sobre el HTML | caro en contexto y frágil |

## Diseño propuesto

Servidor local por stdio en Node (el repositorio ya usa Node y Playwright), en `tools/mcp/servidor.mjs`, con `@modelcontextprotocol/sdk` y `zod`. Se registra para el proyecto en `.mcp.json`:

```json
{ "mcpServers": { "motor": { "command": "node", "args": ["tools/mcp/servidor.mjs"] } } }
```

Al arrancar sirve la raíz del repositorio con un servidor HTTP propio (puerto libre) y abre Chromium bajo demanda, reutilizándolo entre llamadas. `CHROMIUM_PATH` y `MOTOR_OUT` se leen del entorno igual que ahora.

### Herramientas

| Herramienta | Entrada | Salida | Reutiliza |
|---|---|---|---|
| `catalogo` | `tipo?` (piezas, efectos, estilos, pintores) | lista con marcado de ejemplo | se genera leyendo `fx/*.js` y `themes/source.json`, como hace `revisar.mjs` |
| `crear_deck` | `nombre`, `titulo`, `estilo`, `estilos[]`, `extras[]` (d3-sankey, katex, vc…) | ruta creada | `plantilla.html` de la skill |
| `listar_diapositivas` | `deck` | `id`, título, sección, efecto, nº de pasos | parser de `revisar.mjs` |
| `leer_diapositiva` | `deck`, `id` | HTML de esa `<section>` | — |
| `escribir_diapositiva` | `deck`, `id`, `html`, `despues_de?` | hallazgos de la revisión de esa diapositiva | `revisar.mjs` |
| `borrar_diapositiva` / `mover_diapositiva` | `deck`, `id`, `despues_de` | orden nuevo | — |
| `revisar` | `deck` | JSON de `revisar.mjs --json` | `revisar.mjs` |
| `capturar` | `deck`, `id`, `estilo?`, `modo?`, `paso?` (`primero`, `ultimo`, n) | imagen PNG + desbordes y errores de consola | lógica de `verificar.mjs` |
| `verificar` | `deck`, `estilos[]` | resumen; imágenes solo de las diapositivas con problemas | `verificar.mjs` |
| `empaquetar` | `deck`, `out?` | ruta del HTML único | `bundle.mjs` |

Más adelante, una herramienta de alto nivel: `diapositiva_desde_spec(deck, spec)`, que convierte un JSON de tipo conocido (`portada`, `cifra`, `comparacion`, `proceso`, `barras`, `lineas`, `tabla`, `imagen`, `codigo`) en HTML correcto. Es la vía para que un modelo pequeño haga decks buenos: elige tipo y rellena datos, sin escribir HTML.

### Recursos y prompts

- Recursos: `motor://catalogo`, `motor://estilos` (de `source.json`), `motor://deck/<nombre>` (índice de diapositivas).
- Prompt `nueva-presentacion`: guion → tipo de diapositiva → creación → revisión → capturas. Es el mismo flujo de la skill, para clientes sin skills (Claude Desktop, otros agentes).

### Límites de seguridad

Escritura solo dentro de `decks/` y `fx/`; nombres validados con `^[a-z0-9-]+$`; el servidor HTTP escucha solo en `127.0.0.1`; sin ejecución de órdenes arbitrarias.

## Trabajo previo que mejora tanto la skill como el MCP

Hacerlo antes del MCP, porque sin ello el MCP solo automatiza los mismos problemas:

1. **Efecto genérico de gráficos con datos en el HTML** (`fx/grafico.js`): barras, barras agrupadas, líneas, dispersión y tabla, con los datos en `<script type="application/json">` y colores por tokens. El ejemplo `barras` de `efecto-nuevo.md` es el punto de partida. Es la mayor carencia: hoy cada gráfico con datos reales es un efecto nuevo.
2. **Sacar `decks/vc-base/vc.css` de `decks/`**: `fx/vc.js` depende de esa hoja, que no se sube a git. Moverla a `fx/vc.css` (o separar lo genérico: `.eq`, `pre.code`, `.tip`, `.g2`, `.vstack`).
3. **Notas del orador en el motor**: ocultar `aside.notes` en `engine/engine.css` (nueve decks repiten la regla) y llevar la ventana de notas de `fx/rai.js` a `fx/sistema.js`.
4. **`revisar.mjs` y `verificar.mjs` como funciones exportables**, además de órdenes, para que el MCP las llame sin lanzar procesos.
5. **Captura de un paso concreto** en `verificar.mjs` (hoy solo el primero).

## Coste y riesgos

- **Mantenimiento doble:** se evita si el MCP solo envuelve funciones de `tools/` y el catálogo se genera del código.
- **Contexto:** cada herramienta MCP ocupa tokens en todas las sesiones donde esté activo. Con unas 10 herramientas es poco, pero conviene descripciones cortas y registrarlo solo en este proyecto.
- **Solo local:** un MCP por stdio sirve a Claude Code, Claude Desktop y otros agentes locales, no a claude.ai web. Para el uso del máster es suficiente.
- **Navegador:** depende de Playwright y Chromium; si no están, `capturar` debe fallar con un mensaje claro y el resto seguir funcionando.

## Plan por fases

| Fase | Contenido | Criterio para pasar a la siguiente |
|---|---|---|
| 0 · hecho | skill `crear-presentacion`, `tools/revisar.mjs` | — |
| 1 | trabajo previo 1–5 | un deck con 3 gráficos de datos reales sin escribir efectos |
| 2 | MCP mínimo: `revisar`, `capturar`, `listar/leer/escribir_diapositiva`, `catalogo` | crear el mismo deck de prueba con y sin MCP y comparar iteraciones, errores y tokens |
| 3 | `crear_deck`, `verificar`, `empaquetar`, prompt `nueva-presentacion` | uso normal en un deck real del máster |
| 4 | `diapositiva_desde_spec` con tipos de diapositiva | probarlo con un modelo pequeño o local |

Si en la fase 2 la comparación no muestra una mejora clara, basta con la skill y las herramientas de `tools/`.
