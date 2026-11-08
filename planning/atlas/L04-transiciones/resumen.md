# L04 · Resumen

Cerrado el 2026-11-08. Son 11 de 11 componentes explicados en 13 diapositivas: título, mecanismo, diez transiciones y un resumen con un botón por estilo.

## Archivos

- `atlas/completo/src/l04.html`.
- `atlas/completo/lotes/l04.js`: efectos `ac-vt`, `ac-transicion` y `ac-resumen-vt`, y botones `data-vt="next|prev"` con `data-vt-estilo` opcional.
- `atlas/completo/lotes/l04.css`.

## Cómo se enseña cada transición

- **El botón.** Las reglas son `:root[data-style="X"]::view-transition-old/new(root)`, así que solo se ven si `<html>` está en ese estilo. El botón pone `<html data-style="X" data-dir="next|prev">` sin guardarlo, espera dos fotogramas y llama a `document.startViewTransition` cambiando la pantalla de la demo de A a B. Al terminar restaura el estilo previo con `Motor.setStyle`, que vuelve a dibujar la diapositiva, y la pantalla regresa a A.
- **El código de la ficha.** Se lee del CSS cargado con CSSOM (reglas `::view-transition` del estilo y sus `@keyframes`), así que no hay copia a mano que pueda quedar desfasada.

## Verificación

- `verificar.mjs` en suizo y noche, claro y oscuro: sin desbordes.
- `recorrer.mjs` desde `l04-titulo` en suizo y noche, y con movimiento reducido en rice: sin errores.
- Comprobación de las diez transiciones, todas correctas:
  - `startViewTransition` se llama una vez, con `<html>` en el estilo de la diapositiva;
  - a mitad de animación la pantalla ya muestra B;
  - al terminar, el estilo y el guardado de `localStorage` siguen siendo los del usuario.
- Capturas a mitad de transición en rice, cromo, célula y matriz: se ven el deslizamiento, el telón que gotea, el diafragma y los LED.

## Hallazgos

- **`animationName` sale vacío con `var()`.** Si la regla usa la forma corta `animation: vt-glitch var(--dur) steps(6) both`, el navegador no resuelve `style.animationName` porque la forma corta contiene `var()`. La demo busca los nombres de `@keyframes` en el texto de la regla.
- **Cromo, célula y matriz** no animan la diapositiva saliente (`animation: none`): la nueva se dibuja encima.
- **Rice** es el único estilo con una transición distinta hacia atrás (`data-dir="prev"`: `vt-out-right` y `vt-in-left`).
