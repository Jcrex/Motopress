# L04-transiciones · Transiciones

Cambio de diapositiva con View Transitions y el gesto de cada estilo.

Deck: `atlas/completo/index.html`. Diapositivas con id `l04-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l04-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l04-view-transitions`: Mecanismo de transición ✓
3. `l04-transicion-rice`: Transición Rice ✓
4. `l04-transicion-noche`: Transición Noche ✓
5. `l04-transicion-suizo`: Transición Suizo ✓
6. `l04-transicion-aurora`: Transición Aurora ✓
7. `l04-transicion-cromo`: Transición Cromo ✓
8. `l04-transicion-arcilla`: Transición Arcilla ✓
9. `l04-transicion-nube`: Transición Nube ✓
10. `l04-transicion-termica`: Transición Térmica ✓
11. `l04-transicion-celula`: Transición Célula ✓
12. `l04-transicion-matriz`: Transición Matriz ✓
13. `l04-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **13 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ac-ficha` de L00; marcado en `L00-infra/resumen.md`)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro

## Componentes

### `view-transitions` · Mecanismo de transición

- **Diapositiva:** `l04-view-transitions`
- **Propósito (texto de la ficha):** Animar el cambio de diapositiva con la View Transitions API y caer a un cambio directo si no está o se salta
- **Archivo fuente:** `engine/engine.js go() swap() · themes/styles.css ::view-transition`
- **Parámetros que muestra la ficha:** `respaldo`: cambio instantáneo; `direccion`: adelante/atrás
- **Demo:** Esquema de go() → swap() con View Transitions y respaldo, más un botón que salta a la diapositiva siguiente
- **Aceptación propia:** Con View Transitions desactivadas el salto ocurre igual

### `transicion-rice` · Transición Rice

- **Diapositiva:** `l04-transicion-rice`
- **Propósito (texto de la ficha):** Cambio de espacio de trabajo de Hyprland: deslizamiento lateral según la dirección
- **Archivo fuente:** `themes/styles.css vt-out-left vt-in-right vt-out-right vt-in-left`
- **Parámetros que muestra la ficha:** `keyframes`: vt-out-left vt-in-right vt-out-right vt-in-left
- **Demo:** Botón «ver transición» que pone data-style="rice" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos
- **Aceptación propia:** La transición se ve en rice y el estilo previo se restaura al volver

### `transicion-noche` · Transición Noche

- **Diapositiva:** `l04-transicion-noche`
- **Propósito (texto de la ficha):** Fallo de señal
- **Archivo fuente:** `themes/styles.css vt-glitch vt-fade-out`
- **Parámetros que muestra la ficha:** `keyframes`: vt-glitch vt-fade-out
- **Demo:** Botón «ver transición» que pone data-style="noche" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos
- **Aceptación propia:** La transición se ve en noche y el estilo previo se restaura al volver

### `transicion-suizo` · Transición Suizo

- **Diapositiva:** `l04-transicion-suizo`
- **Propósito (texto de la ficha):** Corte vertical seco
- **Archivo fuente:** `themes/styles.css vt-up-out vt-up-in`
- **Parámetros que muestra la ficha:** `keyframes`: vt-up-out vt-up-in
- **Demo:** Botón «ver transición» que pone data-style="suizo" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos
- **Aceptación propia:** La transición se ve en suizo y el estilo previo se restaura al volver

### `transicion-aurora` · Transición Aurora

- **Diapositiva:** `l04-transicion-aurora`
- **Propósito (texto de la ficha):** Fundido con desenfoque
- **Archivo fuente:** `themes/styles.css vt-blur-out vt-blur-in`
- **Parámetros que muestra la ficha:** `keyframes`: vt-blur-out vt-blur-in
- **Demo:** Botón «ver transición» que pone data-style="aurora" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos
- **Aceptación propia:** La transición se ve en aurora y el estilo previo se restaura al volver

### `transicion-cromo` · Transición Cromo

- **Diapositiva:** `l04-transicion-cromo`
- **Propósito (texto de la ficha):** Telón de metal líquido que gotea
- **Archivo fuente:** `themes/styles.css vt-melt`
- **Parámetros que muestra la ficha:** `keyframes`: vt-melt
- **Demo:** Botón «ver transición» que pone data-style="cromo" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos
- **Aceptación propia:** La transición se ve en cromo y el estilo previo se restaura al volver

### `transicion-arcilla` · Transición Arcilla

- **Diapositiva:** `l04-transicion-arcilla`
- **Propósito (texto de la ficha):** Llegada blanda que se aplasta y recupera
- **Archivo fuente:** `themes/styles.css vt-clay-out vt-clay-in`
- **Parámetros que muestra la ficha:** `keyframes`: vt-clay-out vt-clay-in
- **Demo:** Botón «ver transición» que pone data-style="arcilla" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos
- **Aceptación propia:** La transición se ve en arcilla y el estilo previo se restaura al volver

### `transicion-nube` · Transición Nube

- **Diapositiva:** `l04-transicion-nube`
- **Propósito (texto de la ficha):** Barrido de escáner de arriba abajo
- **Archivo fuente:** `themes/styles.css vt-scan`
- **Parámetros que muestra la ficha:** `keyframes`: vt-scan
- **Demo:** Botón «ver transición» que pone data-style="nube" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos
- **Aceptación propia:** La transición se ve en nube y el estilo previo se restaura al volver

### `transicion-termica` · Transición Térmica

- **Diapositiva:** `l04-transicion-termica`
- **Propósito (texto de la ficha):** Destello de calibración (NUC)
- **Archivo fuente:** `themes/styles.css vt-nuc`
- **Parámetros que muestra la ficha:** `keyframes`: vt-nuc
- **Demo:** Botón «ver transición» que pone data-style="termica" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos
- **Aceptación propia:** La transición se ve en termica y el estilo previo se restaura al volver

### `transicion-celula` · Transición Célula

- **Diapositiva:** `l04-transicion-celula`
- **Propósito (texto de la ficha):** Diafragma de campo que se abre en círculo
- **Archivo fuente:** `themes/styles.css vt-iris`
- **Parámetros que muestra la ficha:** `keyframes`: vt-iris
- **Demo:** Botón «ver transición» que pone data-style="celula" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos
- **Aceptación propia:** La transición se ve en celula y el estilo previo se restaura al volver

### `transicion-matriz` · Transición Matriz

- **Diapositiva:** `l04-transicion-matriz`
- **Propósito (texto de la ficha):** Puntos de LED que crecen hasta tocarse
- **Archivo fuente:** `themes/styles.css vt-leds`
- **Parámetros que muestra la ficha:** `keyframes`: vt-leds
- **Demo:** Botón «ver transición» que pone data-style="matriz" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos
- **Aceptación propia:** La transición se ve en matriz y el estilo previo se restaura al volver
