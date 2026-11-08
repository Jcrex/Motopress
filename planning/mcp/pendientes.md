# Pendientes del MCP y las skills

Fecha: 2026-11-08. Recoge lo que falta o conviene mejorar en el servidor MCP (`tools/mcp/`), las herramientas de `tools/` y las skills (`crear-presentacion`, `portar-react-bits`). Sale de los estudios ([estudio.md](estudio.md), [react-bits.md](react-bits.md)), de los `TODO` del código y de lo que hubo que resolver a mano al actualizar el deck `roscon-2026` con piezas de react-bits.

**Fuera de este documento:** el trabajo del Atlas Completo (lotes L05–L09, diapositivas de los ports, estados en `atlas.db`). Sigue en `planning/atlas/RETOMAR.md`.

## Resumen

| # | Pendiente | Prioridad | Coste |
|---|---|---|---|
| 1 | Activar el servidor `motor` en el proyecto sin aprobación manual | alta | 5 min |
| 2 | Tipos de `diapositiva_desde_spec` para las piezas de react-bits | alta | 1 día |
| 3 | Ajustes del motor vistos en `roscon-2026` (altura de bento y mazo, retícula sobre imagen, cifra lateral) | alta | medio día |
| 4 | `rb_promover`: pasar un port experimental a estable | alta | medio día |
| 5 | Pruebas automáticas del MCP y de `tools/` | alta | 1 día |
| 6 | Origen react-bits en el `catalogo` | media | 2 h |
| 7 | Recursos `motor://estilos` y `motor://deck/<nombre>` | media | 2 h |
| 8 | Prompts MCP `portar-componente` y `mejorar-deck` | media | 2 h |
| 9 | `capturar` con fotogramas de la animación | media | medio día |
| 10 | `verificar`: capturas antiguas mezcladas y resumen final | media | 1 h |
| 11 | Leer y escribir `deck.css` desde el MCP, con revisión | media | 2 h |
| 12 | `rb_preparar`: uniforms completos, LogoLoop y destino `reveal` | media | medio día |
| 13 | `revisar`: comprobaciones de las piezas por pasos | media | 2 h |
| 14 | Probar `diapositiva_desde_spec` con un modelo pequeño o local | media | medio día |
| 15 | Probar las skills con agentes (con y sin skill) | media | medio día |
| 16 | Skill `crear-presentacion`: tabla react-bits → pieza y flujo «mejorar un deck» | alta | 1 h |
| 17 | Documentar cómo se invocan skills, MCP y prompts | alta | 30 min |
| 18 | Contexto: agrupar herramientas si siguen creciendo | baja | — |

## Servidor MCP

### 1. Activar el servidor en el proyecto

`.mcp.json` declara `motor`, pero Claude Code pide aprobarlo y hoy `enabledMcpjsonServers` está vacío: en la sesión del 2026-11-08 las herramientas no estaban cargadas y hubo que llamar a los módulos con `node -e`. Propuesta: `.claude/settings.json` (versionado) con `"enabledMcpjsonServers": ["motor"]`, o documentar `/mcp` → activar. Las herramientas se cargan al empezar la sesión.

### 2. Tipos de diapositiva para las piezas de react-bits

Los 16 tipos de `tools/mcp/tipos.mjs` solo generan bloques `tp-`, `cifra`, `etapas`, `checklist` y `grafico`. Para `roscon-2026` hubo que escribir a mano bento, mazo, retícula, bordes vivos, presets de título y cifras laterales. Propuesta:

- Campos comunes: `efecto_titulo` (`descifra`, `blur`, `pliega`, `rise`, `mask-lines`, `enfoca`) en portada, separador y cierre; `borde: chispa | rayo` en `problema` (por lado) y en `tarjetas` (por tarjeta).
- `tarjetas` con `foco: true` → `bento` con foco por paso (MagicBento).
- Tipos nuevos:
  - `foco`: imagen y objetivos en porcentaje con etiqueta; genera la `reticula` y los pasos (TargetCursor).
  - `mazo`: tarjetas que se recorren por pasos (CardSwap).
  - `paleta`: palabras que cambian (SplitFlapText).
  - `deposito`: nivel con umbrales (SloshGauge).
- `imagen` con `cifras` en la columna lateral (lo que en `roscon-2026` es `.rc-dato`).

### 4. `rb_promover`

Pasar un port de `fx/experimental/` a estable son hoy pasos manuales (listados en la skill `portar-react-bits`), y mientras tanto `revisar` avisa si un deck lo carga: por eso `exp-rotating` no se usó en `roscon-2026`. Lo que haría `rb_promover({ nombre })`:

1. Mueve el archivo a `fx/` y le quita el prefijo `exp-` (clases y selectores).
2. Añade la entrada en `catalogo.md` y en `README.md`, y lo carga en la plantilla si es una pieza.
3. Devuelve la orden SQL para `atlas.db` sin ejecutarla: el estado del Atlas es de su propio flujo.

### 6. Origen react-bits en el catálogo

`catalogo` no dice de qué componente viene cada pieza. Si alguien pide «un CardSwap», hoy hay que pasar por `rb_buscar` para llegar a `mazo`. Propuesta: una columna «react-bits» en `catalogo.md` y en la salida de la herramienta, sacada de `atlas.db` (`react_bits.motor`). La tabla de la sesión del 2026-11-08 sirve de base:

| react-bits | motor |
|---|---|
| Counter, CountUp | `cifra` |
| Stepper | `etapas` |
| StatusMark | `checklist` |
| MagicBento | `bento` |
| CardSwap | `mazo` |
| TargetCursor | `reticula` |
| StarBorder | `chispa` |
| ElectricBorder | `rayo` |
| DecryptedText | `descifra`, `data-title-fx="descifra"` |
| TextType | `teclea` |
| SplitFlapText | `paleta` |
| SloshGauge | `deposito` |
| BlurText, SplitText | presets de `data-title-fx` |
| AnimatedContent, FadeContent | `data-reveal` |
| Aurora, Grainient, Threads, Radar, Topography, GridScan, FluxLines | pintores `velo`, `grano`, `hilos`, `radar`, `topo`, `escaner`, `isolineas` |

### 7. Recursos que faltan

El estudio proponía `motor://estilos` y `motor://deck/<nombre>`, y no se hicieron. Hoy solo existen `motor://guia`, `motor://catalogo` y `motor://react-bits/recetas`.

- `motor://estilos`: el carácter de cada estilo (desde `themes/source.json`) y qué piezas o pintores le van mejor.
- `motor://deck/<nombre>`: el índice. Ahorra una llamada a `indice` en clientes que precargan recursos.

### 8. Prompts

Solo existe `nueva-presentacion`. Faltan:

- `portar-componente`: el flujo de la skill `portar-react-bits`, para clientes sin skills (Claude Desktop, otros agentes).
- `mejorar-deck`: lo hecho a mano en `roscon-2026`.
  1. `indice`.
  2. `rb_buscar estado=portado`.
  3. Elegir una pieza por diapositiva según su forma (cifra, proceso, imagen, tarjetas).
  4. `escribir_diapositiva`, luego `revisar` y `capturar`.

### 9. Ver las animaciones

`capturar` y `verificar` usan movimiento reducido, así que solo muestran el estado final. Una animación rota o a medias no se ve. En la prueba de `exp-rotating`, una captura hecha durante la transición pareció un fallo. Propuesta: opción `fotogramas: [200, 600, 1200]` (ms) que, con la animación activa, devuelva una tira de imágenes pequeñas en una sola respuesta.

### 10. `verificar`

- Con `--solo`, las capturas nuevas se mezclan con las de pasadas anteriores en `output/capturas/<deck>/`. Opciones: vaciar la carpeta de ese deck al empezar una pasada completa, o escribir una subcarpeta por pasada.
- Cuando no hay hallazgos solo imprime la carpeta. Debería cerrar con «N capturas, sin errores ni desbordes», como ya hace la herramienta MCP.

### 11. `deck.css` desde el MCP

No hay herramienta para leer o escribir `deck.css`, y en `roscon-2026` se editó a mano. Además, `revisar` no lo comprueba. Propuesta:

- `leer_css` y `escribir_css`.
- Que `revisar` mire en `deck.css` los colores literales y los tamaños de texto por debajo de 22 px.

### 12. `rb_preparar`

- En el destino `pintor`, el esqueleto solo envía `uRes` y `uT`; el resto de uniforms queda listado en un `TODO`. Podría generar la llamada completa a `drawFull` con valores por defecto sacados de las props (colores → `api.tok`, ratón → trayectoria lenta, como dice la receta).
- `rb_codigo props` no encuentra las props de LogoLoop (217 de 218 sí); remite a la ficha.
- No hay destino `reveal`: la lista de `data-reveal` es fija en `fx/sistema.js`. Primero habría que hacerla ampliable (`Motor.reveals[nombre] = (el, api) => …`) y después añadir el esqueleto.

### 13. Comprobaciones de `revisar` para piezas por pasos

Errores que hoy solo se ven en las capturas:

- `reticula` con N objetivos y menos de N − 1 `data-step` en la diapositiva: la retícula no llega a los últimos.
- `mazo` cuyas tarjetas no tienen `data-step` (salvo la primera).
- `paleta data-pasos` o `bento` con foco sin ningún `data-step`.
- `.reticula` sobre un `<img>` con `object-fit: contain`: los objetivos no coinciden con la imagen (ver punto 3).

### 14. Probar `diapositiva_desde_spec` con un modelo pequeño

Es el criterio pendiente de la fase 4 del estudio. Prueba: el prompt `nueva-presentacion` con Haiku o con un modelo local.

- Medir: errores de `revisar`, diapositivas que hay que rehacer y llamadas por diapositiva.
- Comparar con un modelo grande escribiendo HTML.

### 18. Contexto

Son 18 herramientas, 5 de ellas `rb_*`. Si se suman las propuestas de este documento, conviene:

- reunir las `rb_*` en dos herramientas (consulta y preparación) con un parámetro `accion`;
- o separarlas en un segundo servidor (`motor-react-bits`) que solo se active para portar.

## Motor (lo que pidió el deck `roscon-2026`)

### 3. Ajustes de piezas

- **`bento` y `mazo` ocupan todo el alto del cuerpo:** con tres tarjetas de texto corto quedan medio vacías. En el deck se resolvió con `.rc-bento` (filas `auto`, `height: auto`, centrado) y `.rc-mazo` (`height: 320px`). Propuesta:
  - variante `bento auto` en `engine.css`;
  - altura del `mazo` según la tarjeta más alta, o `--mazo-h`;
  - anotarlo en el catálogo.
- **`reticula` sobre una imagen:** `.tp-img img` usa `object-fit: contain`, así que los objetivos en porcentaje no caen sobre la imagen. Además, hay que escribir a mano un `<span data-step hidden>` por cada objetivo menos el primero. Se resolvió con un contenedor con `aspect-ratio` (`.rc-foto`). Propuesta:
  - clase `foto-foco` en el motor, con el `aspect-ratio` leído de la imagen al cargar;
  - pasos generados por `piezas.js` a partir de los `data-target`.
- **Cifra en la columna lateral:** `.rc-dato` (cifra a 96 px y nota debajo) se repitió en dos diapositivas. Propuesta: `tp-dato` en `engine.css`, junto a los demás `tp-`.

## Pruebas

### 5. Pruebas automáticas

No hay pruebas de `tools/` ni de `tools/mcp/`. Hoy todo se comprueba a mano o con capturas. Propuesta con `node --test` y `npm test` en `package.json`:

- Cada uno de los 16 tipos de spec, en un deck temporal, pasa `revisar` sin errores.
- `escribir_diapositiva`, `borrar_diapositiva` y `mover_diapositiva` en un deck temporal: el orden queda bien y una escritura con errores no se guarda.
- `rb_codigo shaders` extrae al menos un shader en 5 fondos conocidos (FloatingLines, Galaxy, LightRays, SoftAurora, Iridescence).
- `rb_preparar` en los cuatro destinos da un JavaScript que carga sin errores en Chromium.
- `revisar` encuentra los errores sembrados en un deck de prueba: color literal, `id` duplicado, efecto inexistente.
- Si hay Chromium: `capturar` de `motor-pruebas` sin errores de consola. Si no lo hay, la prueba se salta.

## Skills

### 15. Probar las skills con agentes

Ni `crear-presentacion` ni `portar-react-bits` se han probado con el método de `superpowers:writing-skills`: el mismo encargo a un agente sin la skill y con ella, anotando dónde se equivoca. Encargos propuestos:

- crear un deck de 6 diapositivas con un gráfico de datos dados;
- «pon un CardSwap en esta diapositiva»;
- portar un «quizás» de coste S.

### 16. `crear-presentacion`

- Añadir la tabla react-bits → pieza (punto 6) para que «quiero el efecto X de react-bits» lleve primero a lo que ya es estable, antes de pensar en portar.
- Añadir el flujo «mejorar un deck existente» (punto 8).
- Avisar de que `bento` y `mazo` llenan el alto (punto 3) mientras no se cambie el motor.

### 17. Cómo se invocan

Que quede escrito en `README.md` y `CLAUDE.md`:

- Skills: `/crear-presentacion` y `/portar-react-bits`. También se activan solas al pedir una presentación o un efecto «como el X de react-bits».
- Prompt MCP: `/mcp__motor__nueva-presentacion`.
- Herramientas MCP: se nombran en el texto del prompt («usa `capturar`…»). Necesitan el servidor activo (punto 1) y una sesión nueva.
