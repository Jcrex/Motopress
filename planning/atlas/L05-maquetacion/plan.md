# L05-maquetacion · Maquetación

Composiciones del cuerpo y piezas básicas de engine.css.

Deck: `atlas/completo/index.html`. Diapositivas con id `l05-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l05-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l05-cols` … sublote [Columnas (.cols)](cols.md): 5 diapositivas
3. `l05-stack-row`: .stack y .row
4. `l05-panel`: Panel (.panel)
5. `l05-lecturas`: .label, .value y .readout
6. `l05-leyenda`: Leyenda (.legend)
7. `l05-nota`: Nota (.note)
8. `l05-chip`: Ficha (.chip)
9. `l05-keycap`: Tecla (.keycap)
10. `l05-ventana`: Ventana (.win)
11. `l05-terminal`: Terminal (.term)
12. `l05-texto-utilidades`: Utilidades de texto
13. `l05-portada-divider`: Portada y separador
14. `l05-focus-border`: Borde de foco (.focus-border)
15. `l05-host-fx`: Contenedor de efecto (.fx)
16. `l05-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **20 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ac-ficha` de L00; marcado en `L00-infra/resumen.md`)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro

## Componentes

### `cols` · Columnas (.cols)

- **Diapositiva:** `l05-cols` (sublote, ver [cols.md](cols.md))
- **Propósito (texto de la ficha):** Repartir el cuerpo en cuerpo + lateral o en columnas iguales
- **Archivo fuente:** `engine/engine.css .cols`
- **Parámetros que muestra la ficha:** `variantes`: [".cols (lateral 500 px)", ".cols.wide-side", ".cols.even", ".cols.three"]
- **Demo:** una diapositiva por variante, ver [cols.md](cols.md)

### `stack-row` · .stack y .row

- **Diapositiva:** `l05-stack-row`
- **Propósito (texto de la ficha):** Apilar en vertical o alinear en fila con el espaciado del estilo
- **Archivo fuente:** `engine/engine.css .stack .row`
- **Parámetros que muestra la ficha:** `clases`: ["stack", "row"]
- **Demo:** Tres paneles en .stack y tres en .row lado a lado
- **Aceptación propia:** El espaciado sale del estilo

### `panel` · Panel (.panel)

- **Diapositiva:** `l05-panel`
- **Propósito (texto de la ficha):** Contenedor con el tratamiento de superficie de cada estilo
- **Archivo fuente:** `engine/engine.css .panel · themes/styles.css`
- **Demo:** Tres paneles .panel con distinto contenido
- **Aceptación propia:** Los paneles respetan el tratamiento del estilo (clip-path en noche, transparentes en suizo)

### `lecturas` · .label, .value y .readout

- **Diapositiva:** `l05-lecturas`
- **Propósito (texto de la ficha):** Mostrar una magnitud con su etiqueta y su valor en la tipografía de datos
- **Archivo fuente:** `engine/engine.css .label .value .readout`
- **En el Atlas original:** `#telemetria` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `clases`: ["label", "value", "readout"]
- **Demo:** Cuatro lecturas .readout con .label y .value de telemetría de ejemplo
- **Aceptación propia:** Los valores usan cifras tabulares

### `leyenda` · Leyenda (.legend)

- **Diapositiva:** `l05-leyenda`
- **Propósito (texto de la ficha):** Leyenda de series con muestra de color y texto en fg
- **Archivo fuente:** `engine/engine.css .legend`
- **Demo:** .legend con seis series cat-1…6 sobre un gráfico de líneas mínimo
- **Aceptación propia:** El texto de la leyenda va en fg, no en el color de la serie

### `nota` · Nota (.note)

- **Diapositiva:** `l05-nota`
- **Propósito (texto de la ficha):** Aclaración breve al pie de un gráfico o tabla
- **Archivo fuente:** `engine/engine.css .note`
- **Demo:** Gráfico con .note al pie que marca los datos como sintéticos
- **Aceptación propia:** La nota mide al menos 22 px

### `chip` · Ficha (.chip)

- **Diapositiva:** `l05-chip`
- **Propósito (texto de la ficha):** Etiqueta corta en línea para categorías o estados
- **Archivo fuente:** `engine/engine.css .chip`
- **Demo:** Fila de .chip con categorías y estados ok/warn/err con palabra
- **Aceptación propia:** Cada estado lleva su palabra

### `keycap` · Tecla (.keycap)

- **Diapositiva:** `l05-keycap`
- **Propósito (texto de la ficha):** Representar una tecla o atajo
- **Archivo fuente:** `engine/engine.css .keycap`
- **En el Atlas original:** `#atajos` (reutilizar su marcado como punto de partida)
- **Demo:** Atajos del motor en .keycap
- **Aceptación propia:** —

### `ventana` · Ventana (.win)

- **Diapositiva:** `l05-ventana`
- **Propósito (texto de la ficha):** Marco de ventana con barra para capturas, código o interfaces
- **Archivo fuente:** `engine/engine.css .win .win-bar .win-body`
- **En el Atlas original:** `#escritorio` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `partes`: ["win-bar", "win-body"]
- **Demo:** .win con .win-bar y .win-body que contiene código
- **Aceptación propia:** —

### `terminal` · Terminal (.term)

- **Diapositiva:** `l05-terminal`
- **Propósito (texto de la ficha):** Bloque de terminal con la fuente mono del estilo
- **Archivo fuente:** `engine/engine.css .term`
- **En el Atlas original:** `#fetch` (reutilizar su marcado como punto de partida)
- **Demo:** .term con una sesión de ejemplo
- **Aceptación propia:** Usa la fuente mono del estilo

### `texto-utilidades` · Utilidades de texto

- **Diapositiva:** `l05-texto-utilidades`
- **Propósito (texto de la ficha):** Matices de texto: entradilla, apagado, tenue, monoespaciado y cifras tabulares
- **Archivo fuente:** `engine/engine.css .lead .muted .faint .mono .num`
- **Parámetros que muestra la ficha:** `clases`: ["lead", "muted", "faint", "mono", "num", "fill"]
- **Demo:** Un párrafo por clase: .lead, .muted, .faint, .mono, .num y .fill
- **Aceptación propia:** —

### `portada-divider` · Portada y separador

- **Diapositiva:** `l05-portada-divider`
- **Propósito (texto de la ficha):** Diapositiva a sangre para portada, separadores de sección y cierre
- **Archivo fuente:** `engine/engine.css .slide.is-plain.divider .fx-bg`
- **En el Atlas original:** `#portada` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `clases`: ["is-plain", "divider", "cover", "fx-bg"]; `fx`: backdrop
- **Demo:** Miniatura de una portada .is-plain.divider con su fx-bg, y el marcado al lado
- **Aceptación propia:** La miniatura muestra el fondo del estilo

### `focus-border` · Borde de foco (.focus-border)

- **Diapositiva:** `l05-focus-border`
- **Propósito (texto de la ficha):** Borde activo de Hyprland: degradado cónico que gira alrededor del panel o ventana con foco (solo rice)
- **Archivo fuente:** `themes/styles.css .focus-border .win.is-focus @keyframes rice-angle`
- **Parámetros que muestra la ficha:** `clases`: ["panel.focus-border", "win.is-focus"]; `estilo`: rice
- **Origen en react-bits:** [BorderGlow](../../../../../react-bits/src/content/Components/BorderGlow/BorderGlow.jsx) (inspiracion). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Panel y ventana con .focus-border y .win.is-focus, forzados a data-style="rice"
- **Aceptación propia:** El borde gira en rice; en otros estilos se explica que no aplica

### `host-fx` · Contenedor de efecto (.fx)

- **Diapositiva:** `l05-host-fx`
- **Propósito (texto de la ficha):** Zona donde un efecto dibuja, con data-role para que lo encuentre
- **Archivo fuente:** `engine/engine.css .fx`
- **Parámetros que muestra la ficha:** `atributo`: data-role
- **Demo:** Contenedor .fx con data-role marcado con su contorno y el código que lo busca
- **Aceptación propia:** —
