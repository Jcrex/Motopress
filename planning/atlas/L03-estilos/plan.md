# L03-estilos · Estilos y tokens

Las diez direcciones de arte, el sistema de tokens y las paletas de gráficos generadas.

Deck: `atlas/completo/index.html`. Diapositivas con id `l03-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l03-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l03-estilo-rice`: Estilo Rice
3. `l03-estilo-noche`: Estilo Noche
4. `l03-estilo-suizo`: Estilo Suizo
5. `l03-estilo-aurora`: Estilo Aurora
6. `l03-estilo-cromo`: Estilo Cromo
7. `l03-estilo-arcilla`: Estilo Arcilla
8. `l03-estilo-nube`: Estilo Nube
9. `l03-estilo-termica`: Estilo Térmica
10. `l03-estilo-celula`: Estilo Célula
11. `l03-estilo-matriz`: Estilo Matriz
12. `l03-tokens-color`: Tokens de color por rol
13. `l03-tokens-forma-movimiento`: Tokens de forma, fuente y movimiento
14. `l03-paletas-graficos`: Paletas de gráficos
15. `l03-meta-estilos`: Metadatos de estilos
16. `l03-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **16 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ficha` de L00)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro

## Componentes

### `estilo-rice` · Estilo Rice

- **Diapositiva:** `l03-estilo-rice`
- **Propósito (texto de la ficha):** Escritorio Hyprland con Catppuccin: ventanas en mosaico y borde activo que gira
- **Archivo fuente:** `themes/source.json · themes/styles.css`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `fuentes`: Outfit + JetBrains Mono; `fondo`: ventanas en mosaico; `transicion`: cambio de espacio de trabajo; `titulo`: rise; `revelado`: tilt; `extra`: focus-border con rice-angle
- **Demo:** La diapositiva fija data-style="rice" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)
- **Aceptación propia:** La vista previa se ve en rice aunque el deck esté en otro estilo

### `estilo-noche` · Estilo Noche

- **Diapositiva:** `l03-estilo-noche`
- **Propósito (texto de la ficha):** Interfaz de ficción con Tokyo Night: paneles recortados y neón
- **Archivo fuente:** `themes/source.json · themes/styles.css`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `fuentes`: Chakra Petch + IBM Plex Mono; `fondo`: horizonte de neón; `transicion`: fallo de señal; `titulo`: descifra; `revelado`: wipe-x; `extra`: paneles con clip-path
- **Demo:** La diapositiva fija data-style="noche" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)
- **Aceptación propia:** La vista previa se ve en noche aunque el deck esté en otro estilo

### `estilo-suizo` · Estilo Suizo

- **Diapositiva:** `l03-estilo-suizo`
- **Propósito (texto de la ficha):** Editorial de datos acromático con un solo rojo
- **Archivo fuente:** `themes/source.json · themes/styles.css`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `fuentes`: Instrument Sans + Instrument Serif; `fondo`: geometría de arcos; `transicion`: corte vertical; `titulo`: mask-lines; `revelado`: fade; `extra`: paneles transparentes
- **Demo:** La diapositiva fija data-style="suizo" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)
- **Aceptación propia:** La vista previa se ve en suizo aunque el deck esté en otro estilo

### `estilo-aurora` · Estilo Aurora

- **Diapositiva:** `l03-estilo-aurora`
- **Propósito (texto de la ficha):** Arte generativo con Rosé Pine
- **Archivo fuente:** `themes/source.json · themes/styles.css`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `fuentes`: Bricolage Grotesque + DM Mono; `fondo`: campo de flujo; `transicion`: fundido con desenfoque; `titulo`: blur; `revelado`: mist
- **Demo:** La diapositiva fija data-style="aurora" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)
- **Aceptación propia:** La vista previa se ve en aurora aunque el deck esté en otro estilo

### `estilo-cromo` · Estilo Cromo

- **Diapositiva:** `l03-estilo-cromo`
- **Propósito (texto de la ficha):** Metal líquido de estética Y3K
- **Archivo fuente:** `themes/source.json · themes/styles.css`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `fuentes`: Unbounded + Manrope + Martian Mono; `fondo`: metabolas por raymarching (WebGL); `transicion`: telón que gotea; `titulo`: sin partir (cromo-sheen); `revelado`: wipe
- **Demo:** La diapositiva fija data-style="cromo" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)
- **Aceptación propia:** La vista previa se ve en cromo aunque el deck esté en otro estilo

### `estilo-arcilla` · Estilo Arcilla

- **Diapositiva:** `l03-estilo-arcilla`
- **Propósito (texto de la ficha):** Render 3D mate de plastilina
- **Archivo fuente:** `themes/source.json · themes/styles.css`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `fuentes`: Fraunces + Albert Sans + Red Hat Mono; `fondo`: brazo robótico (WebGL); `transicion`: llegada blanda; `titulo`: pliega; `revelado`: tilt
- **Demo:** La diapositiva fija data-style="arcilla" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)
- **Aceptación propia:** La vista previa se ve en arcilla aunque el deck esté en otro estilo

### `estilo-nube` · Estilo Nube

- **Diapositiva:** `l03-estilo-nube`
- **Propósito (texto de la ficha):** Gemelo digital con nube de puntos LiDAR
- **Archivo fuente:** `themes/source.json · themes/styles.css`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `fuentes`: Geist + Geist Mono; `fondo`: 40 000 puntos con mapa Turbo (WebGL); `transicion`: barrido de escáner; `titulo`: rise; `revelado`: wipe
- **Demo:** La diapositiva fija data-style="nube" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)
- **Aceptación propia:** La vista previa se ve en nube aunque el deck esté en otro estilo

### `estilo-termica` · Estilo Térmica

- **Diapositiva:** `l03-estilo-termica`
- **Propósito (texto de la ficha):** Cámara infrarroja ironbow o negro caliente
- **Archivo fuente:** `themes/source.json · themes/styles.css`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `fuentes`: Schibsted Grotesk + Spline Sans Mono; `fondo`: robot con isotermas; `transicion`: destello de calibración; `titulo`: sin partir (termica-heat); `revelado`: develop
- **Demo:** La diapositiva fija data-style="termica" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)
- **Aceptación propia:** La vista previa se ve en termica aunque el deck esté en otro estilo

### `estilo-celula` · Estilo Célula

- **Diapositiva:** `l03-estilo-celula`
- **Propósito (texto de la ficha):** Microscopía en fluorescencia o tinción H&E
- **Archivo fuente:** `themes/source.json · themes/styles.css`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `fuentes`: Newsreader + Public Sans + Sometype Mono; `fondo`: tejido; `transicion`: diafragma circular; `titulo`: enfoca; `revelado`: focus
- **Demo:** La diapositiva fija data-style="celula" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)
- **Aceptación propia:** La vista previa se ve en celula aunque el deck esté en otro estilo

### `estilo-matriz` · Estilo Matriz

- **Diapositiva:** `l03-estilo-matriz`
- **Propósito (texto de la ficha):** Matriz de LED monocroma con rojo
- **Archivo fuente:** `themes/source.json · themes/styles.css`
- **En el Atlas original:** `#estilos` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `fuentes`: Doto + Host Grotesk + Fragment Mono; `fondo`: globo de LED con anillo glifo; `transicion`: puntos que crecen; `titulo`: descifra; `revelado`: pixel; `extra`: glyph-pulse
- **Demo:** La diapositiva fija data-style="matriz" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)
- **Aceptación propia:** La vista previa se ve en matriz aunque el deck esté en otro estilo

### `tokens-color` · Tokens de color por rol

- **Diapositiva:** `l03-tokens-color`
- **Propósito (texto de la ficha):** Nombrar los colores por función (fondo, texto, acento, estados) para que todo cambie con el estilo
- **Archivo fuente:** `themes/tokens.css (generado) · themes/source.json`
- **Parámetros que muestra la ficha:** `roles`: ["bg", "bg-2", "bg-3", "fg", "fg-2", "fg-3", "accent", "accent-2", "accent-3", "line", "line-2", "ok", "warn", "err", "*-ink"]; `regla`: nunca literales
- **Demo:** Tabla de los tokens de rol con muestra, valor y contraste con bg (Motor.color.contrast + wcag) en el estilo activo
- **Aceptación propia:** Todos los textos en fg, fg-2 y fg-3 indican su nivel WCAG

### `tokens-forma-movimiento` · Tokens de forma, fuente y movimiento

- **Diapositiva:** `l03-tokens-forma-movimiento`
- **Propósito (texto de la ficha):** Radios, familias tipográficas, duración y curva propias de cada estilo
- **Archivo fuente:** `themes/tokens.css · themes/source.json`
- **En el Atlas original:** `#tipografia` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `tokens`: ["font-display", "font-text", "font-mono", "font-serif", "radius", "dur", "ease", "is-dark"]
- **Demo:** Fichas de radio, familias tipográficas y una bola que se mueve con --dur y --ease del estilo
- **Aceptación propia:** Los valores escritos salen de api.tok

### `paletas-graficos` · Paletas de gráficos

- **Diapositiva:** `l03-paletas-graficos`
- **Propósito (texto de la ficha):** Series categóricas con luminosidad igualada y separación para daltonismo, más rampas seq y div
- **Archivo fuente:** `tools/build-themes.mjs · themes/tokens.css`
- **En el Atlas original:** `#paletas` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `tokens`: ["cat-1…cat-6", "seq-1…seq-7", "div-1…div-7"]; `criterio`: ΔE OKLab ≥ 8 entre vecinas en protan y deutan
- **Demo:** Series cat-1…6, seq y div del estilo con simulación protan y deutan debajo y ΔE entre vecinas
- **Aceptación propia:** Ninguna pareja vecina queda por debajo de ΔE 8 en el informe

### `meta-estilos` · Metadatos de estilos

- **Diapositiva:** `l03-meta-estilos`
- **Propósito (texto de la ficha):** Nombre, armonía, contrastes de Itten y fuentes de cada estilo para los efectos que los muestran
- **Archivo fuente:** `themes/meta.js (generado)`
- **En el Atlas original:** `#color-teoria` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `campos`: ["id", "name", "harmony", "itten", "fonts"]
- **Demo:** Ficha de themes/meta.js del estilo activo: armonía, contrastes de Itten y fuentes
- **Aceptación propia:** Se lee de window.MOTOR_STYLES
