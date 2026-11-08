# Estudio: react-bits en el MCP y en las skills

Fecha: 2026-11-08. Estado: implementado el 2026-11-08 (fases 1 a 5). Resultado de la prueba en [react-bits-prueba.md](react-bits-prueba.md). Clon estudiado: `~/Proyectos/react-bits`, commit `4dc7b5b` (2026-10-31). Pendientes y mejoras: [pendientes.md](pendientes.md).

## Conclusión

Sí se puede, y casi todo el material ya existe: `planning/atlas/atlas.db` tiene los 218 componentes de react-bits con rutas, props, presets, uso y dependencias, y enlaza 97 de ellos con lo que el motor ya tiene. Los informes de `planning/atlas/react-bits/` añaden el veredicto y su motivo. Lo que falta es poner ese conocimiento al alcance del agente en el momento de portar:

1. **Datos:** importar a `atlas.db` el veredicto, el motivo, el coste y la técnica de los informes, y una ficha técnica calculada del código (shaders, uniforms, eventos, bucles).
2. **MCP:** cinco herramientas de solo lectura (`rb_buscar`, `rb_ficha`, `rb_codigo`, `rb_tecnica` y `rb_preparar`). Las cuatro primeras leen la base y el clon; la última escribe un esqueleto en `fx/experimental/`.
3. **Skill nueva, `portar-react-bits`:** cómo se traduce cada técnica de React al motor (la parte de las «implementaciones avanzadas»), con el contrato de `fx/experimental/README.md` y la lista de comprobación.

No conviene usar el MCP de shadcn que recomienda react-bits: busca y descarga código React para instalarlo en un proyecto React, y el motor es JavaScript sin React. El clon local ya tiene lo mismo (incluido `public/r/*.json`, el registro con las cuatro variantes) sin depender de la red.

## Lo que ya hay

| Pieza | Contenido | Dónde |
|---|---|---|
| Tabla `react_bits` | 218 componentes: rutas del `.jsx`, `.css`, demo, presets (68) y ejemplo de uso; dependencias; props (de la tabla `propData` de cada demo); líneas | `atlas.db`, la rellena `planning/atlas/react_bits.py` |
| Tabla `origen_react_bits` | 109 enlaces motor ↔ react-bits (97 «base», 12 «inspiración»), que cubren 97 componentes distintos | `atlas.db` |
| Componentes «quizás» | 68 sin portar, repartidos en L06 texto (14), L07 revelados (10), L08 fondos (25) y L09 piezas (19) | `atlas.db`, `planning/atlas/LNN-*/plan.md` |
| Informes | Tabla por componente con técnica, valor, estilos que encajan o chocan, coste y veredicto con motivo | `planning/atlas/react-bits/*.md` (idénticos a la copia de la memoria) |
| Contrato de los portados | Comentario de cabecera (origen, props → `data-*`/tokens, lo descartado) y reglas del motor | `fx/experimental/README.md` |
| Registro de react-bits | `public/r/<Nombre>-{JS,TS}-{CSS,TW}.json`: 1275 archivos con el código completo de cada variante | clon |
| `llms.txt` | Índice de 94 KB pensado para agentes | `public/llms.txt` del clon |

Comprobado en esta sesión:

- Node 26 lee `atlas.db` con `node:sqlite` sin instalar nada, así que el MCP puede usar la base directamente.
- Los seis informes usan seis cabeceras distintas (`Qué hace` y `Técnica` juntas o separadas, una columna `#` en animaciones…). Con un lector genérico solo casan 32 de 218 filas; con un lector que busque las columnas por su nombre se importan todas. Los veredictos llevan el motivo entre paréntesis («DESCARTAR (Grainient lo cubre)»): conviene guardarlo aparte.

## Por qué hace falta ayuda para las «implementaciones avanzadas»

Un componente de react-bits mezcla en un solo `.jsx` de 200 a 900 líneas el ciclo de vida de React, el shader, el bucle de animación, los eventos de ratón y la conversión de props. Leerlo entero cuesta contexto y no dice qué se conserva. Recuento de técnicas en los 218 `.jsx` (búsqueda por patrones, aproximada):

| Técnica | Componentes | Qué pasa al portarla |
|---|---:|---|
| `requestAnimationFrame` | 179 | `api.raf()` en efectos o `frame(s, api, t, still)` en pintores; con movimiento reducido, un solo fotograma |
| Ratón (`pointermove`, `onMouseMove`…) | 176 | Casi siempre opcional (prop `mouseReact`). Se sustituye por la semilla, una trayectoria en el tiempo o un paso (`data-step`); si es la esencia, se descarta |
| `ResizeObserver` | 161 | Sobra: el lienzo mide siempre 1920×1080 |
| Clic o arrastre | 147 | Se convierte en pasos (→) o se descarta |
| `IntersectionObserver` / `useInView` | 134 | Se sustituye por `motor:enter` |
| Shader GLSL | 98 | Casi siempre se reutiliza tal cual; cambian los uniforms |
| Canvas 2D | 90 | `api.canvas()` o un pintor 2D |
| WebGL crudo (`getContext('webgl2')`) | 86 | `Motor.gl.layer`, `program`, `drawFull`, `uniforms` |
| `motion/react` | 28 | WAAPI o transiciones CSS con `data-step`; los muelles se aproximan con la curva `--ease` del estilo |
| GSAP | 18 | Disponible en el motor (CDN); `ScrollTrigger` (8) no tiene sentido sin scroll |
| `ogl` | 10 | Capa fina sobre WebGL: se reescribe con `Motor.gl` |
| `three` | 6 | Pesado; solo si el efecto lo merece (se cargaría por CDN) |
| Filtros SVG (`<feTurbulence>`…) | 7 | Se conservan; los colores pasan a tokens |
| `matter-js` | 2 | Se descarta o se precalcula la simulación con `api.rng` |

Por eso la herramienta clave no es «dame el código», sino «dame **esta parte** del código»: los shaders con sus uniforms, la tabla de props, el bucle o los eventos, cada uno con sus líneas.

## Diseño propuesto

### 1. Datos (`planning/atlas/react_bits.py`)

Ampliar el script, sin tocar `construir_db.py` (que pone `explicado` a 0):

- Columnas nuevas en `react_bits`, añadidas con `ALTER TABLE` si no existen:
  - del informe: `veredicto` (implementar, quizas, descartar), `motivo`, `tecnica`, `valor`, `coste`, `estilos`;
  - del código: `tecnicas` (JSON con lo detectado arriba), `shaders` (número), `uniforms` (lista), `eventos` (lista), `variantes` (las que existen en `public/r`).
- Lector de informes por nombre de columna; avisa de las filas que no casen con ningún componente.
- `meta.rb_commit` ya existe: al cambiar el commit, el script lista los componentes nuevos o quitados (react-bits añade componentes a menudo).

### 2. Herramientas MCP (`tools/mcp/react-bits.mjs`, registradas en el servidor actual)

La ruta del clon se lee de `RB_PATH` (por defecto `~/Proyectos/react-bits`). Si no existe, las herramientas que necesitan el código responden con un aviso y el resto sigue funcionando con la base.

| Herramienta | Entrada | Salida |
|---|---|---|
| `rb_buscar` | texto, `categoria`, `veredicto`, `tecnica`, `estado` (portado, quizás, libre) | lista corta: nombre, qué hace, veredicto, equivalente en el motor si lo hay |
| `rb_ficha` | `nombre` | props (tipo, valor por defecto, descripción), presets, dependencias, técnicas, shaders y uniforms, veredicto y motivo, estilos que encajan, equivalente en el motor y diapositiva del Atlas que lo explica |
| `rb_codigo` | `nombre`, `parte` (`shaders`, `props`, `bucle`, `eventos`, `css`, `uso`, `todo`), `desde`/`hasta` opcionales | el fragmento pedido con sus números de línea (los shaders se extraen de las plantillas de cadena) |
| `rb_tecnica` | `tecnica` (p. ej. `webgl`, `motion`, `ogl`) | la receta de traducción de esa técnica y dos ejemplos ya portados en el motor (para comparar original y port) |
| `rb_preparar` | `nombre`, `destino` (`pintor`, `pieza`, `efecto`, `titulo`, `revelado`) | escribe `fx/experimental/exp-<nombre>.js` con la cabecera del contrato rellena (origen, tabla props → `data-*`/tokens, lo descartado), los shaders extraídos y el esqueleto del destino; no toca `atlas.db` |

Recurso `motor://react-bits/recetas` con la misma tabla de traducción que la skill.

Con esto, portar un «quizás» de L08 sería: `rb_ficha FloatingLines` → `rb_codigo FloatingLines shaders` → `rb_tecnica webgl` → `rb_preparar FloatingLines pintor` → completar el esqueleto → `capturar` en los estilos que encajan.

### 3. Skill `portar-react-bits` (`.claude/skills/portar-react-bits/`)

Se usa al portar un componente o cuando el usuario pide un efecto «como el X de react-bits». Contenido:

- **Decisión de destino:** fondo de portada → pintor (`Motor.painters`); componente por clase sin JavaScript propio de la diapositiva → pieza (`fx/piezas.js`); efecto con su marcado → `Motor.fx`; entrada de título → `Motor.titleFx`; aparición de un elemento → modo de `data-reveal`.
- **Si la interacción es obligatoria:** ¿se puede convertir en pasos (→) o en una trayectoria temporal? Si no, se descarta y se anota el motivo en la base.
- **Recetas por técnica** (la tabla de arriba, ampliada con trampas: `devicePixelRatio` → `glScale`; colores de props → `api.tok`/`api.cats`; `#version 300 es` exige WebGL2 y respaldo 2D; `uTime` pausado con movimiento reducido; nada de `Math.random` sin semilla).
- **Contrato y lista de comprobación:** la de `fx/experimental/README.md`, más «revisado en los estilos que el informe dice que encajan, claro y oscuro».
- **Registro:** actualizar `atlas.db` (`estado_motor`, `origen_react_bits`), `catalogo.md` de `crear-presentacion` y, si pasa a estable, el README.
- Ejemplos de referencia: `grano` (Grainient → pintor WebGL2), `cifra` (CountUp → pieza), `descifra` (DecryptedText → pieza y preset de título).

Y en `crear-presentacion`, una línea: si el usuario pide un efecto de react-bits, `rb_buscar` primero; si ya existe en el motor, úsalo; si es un «quizás», propón portarlo con `portar-react-bits`.

### 4. Catálogo del MCP

Cuando un «quizás» esté portado en `fx/experimental/`, `catalogo` lo lista aparte como «experimental · solo Atlas Completo» hasta que pase a estable. Así un deck no lo usa por error.

## Relación con el Atlas Completo

Los lotes L06 a L09 contienen los 68 «quizás». Las herramientas `rb_*` sirven sobre todo a ese trabajo: hoy cada lote empieza leyendo los `.jsx` enteros. El orden recomendado es hacer primero las fases 1 a 3 de este plan y probarlas en L06 (texto, donde los componentes son más cortos) antes de L08 (fondos, 25 «quizás» casi todos WebGL).

La base es compartida: el MCP solo lee `atlas.db`; las escrituras siguen siendo del flujo del Atlas (`UPDATE componentes …` al cerrar cada lote).

## Plan por fases

| Fase | Contenido | Coste | Criterio para seguir |
|---|---|---|---|
| 1 · hecho | `react_bits.py`: veredictos, motivos y ficha técnica calculada | medio día | los 218 componentes con veredicto y técnicas |
| 2 · hecho | `rb_buscar`, `rb_ficha` y `rb_codigo` en el MCP | 1 día | `rb_codigo … shaders` extrae bien los shaders de 5 fondos distintos |
| 3 · hecho | skill `portar-react-bits` y `rb_tecnica` con sus recetas | medio día | — |
| 4 · hecho | `rb_preparar` (esqueletos) | 1 día | portar 2 «quizás» de L06 con y sin las herramientas y comparar tiempo, contexto y errores |
| 5 · hecho | catálogo experimental y aviso de componentes nuevos en react-bits | medio día | — |

Total: unos 3,5 días. Las fases 1 y 2 dan la mayor parte del valor; si la comparación de la fase 4 no muestra mejora, basta con las fases 1 a 3.

## Riesgos

- **Recuento aproximado:** las cifras de técnicas salen de patrones de texto; «ratón» incluye la interacción opcional. El filtro bueno es el veredicto de los informes.
- **El clon envejece:** react-bits cambia a menudo. La fase 5 avisa de lo nuevo, pero el veredicto de cada componente nuevo lo decide una persona.
- **`construir_db.py`** rehace la base y borra el progreso: las columnas nuevas deben añadirse desde `react_bits.py`, nunca desde ahí.
- **Contexto:** `rb_codigo` debe devolver fragmentos, no archivos enteros (Grainient tiene 632 líneas).
- **Licencia:** no es un problema en este proyecto personal (ver la nota del estudio de 2026-10-16), pero cada port conserva en su cabecera el origen y el commit.
