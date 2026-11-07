# L01 · Resumen

Cerrado el 2026-11-08. Son 19 de 19 componentes explicados en 21 diapositivas (`l01-titulo`, una por componente y `l01-resumen`).

## Archivos

- `atlas/completo/src/l01.html`: diapositivas. Las fichas y el título salen de `atlas.db` al montar.
- `atlas/completo/lotes/l01.js`: efectos de demostración `ac-lienzo`, `ac-anatomia`, `ac-tactil`, `ac-ancla`, `ac-pasos`, `ac-hud`, `ac-progreso`, `ac-estilos`, `ac-modo`, `ac-preferencias`, `ac-pick`, `ac-decorado`, `ac-ciclo`, `ac-eventos` y `ac-reducido`. También los botones `data-ac-accion` (`go:`, `style:`, `overview`, `mode`, `fullscreen`, `print`), que valen para todo el deck.
- `atlas/completo/lotes/l01.css`.
- `planning/atlas/montar.py` (nuevo): monta `atlas/completo/index.html` a partir de `src/` y expande los marcadores `<!-- ficha:id -->`, `<!-- kicker:id -->` y `<!-- titulo:LNN -->`. `index.html` ya no se edita a mano.

## Verificación

- `verificar.mjs` en suizo y noche, claro y oscuro: sin errores ni desbordes.
- `recorrer.mjs` en suizo y noche (claro y oscuro) y con movimiento reducido en suizo y cromo: sin errores.
- 17 comprobaciones interactivas con Playwright, todas correctas:
  - el contador de pasos va de 0/3 a 3/3;
  - `Motor.go` salta a `l01-hud`;
  - `setStyle` marca el botón;
  - las preferencias reflejan S y D;
  - las mitades de claro y oscuro tienen fondos distintos;
  - la vista general se abre y se cierra con Esc;
  - el registro del ciclo muestra `render`, `play`, `step` y `stop`;
  - `motor:step` llega con `step` y `dir`;
  - el progreso coincide con la barra real (9/21);
  - `MOTOR_PICK` coincide con el HUD.

## Hallazgos sobre el motor

- **El ancla solo se lee al cargar.** El motor no escucha `hashchange`, así que un enlace `<a href="#id">` dentro del deck no navega. La diapositiva lo explica y usa `Motor.go('id')`.
- **El render se repite al entrar.** Cuando cargan las fuentes, `document.fonts.ready` llama a `refreshAll()` y el efecto activo vuelve a hacer `render` y `play`. Es visible en el registro de `l01-ciclo-fx` y es lo esperado.
- **Clonar el HUD exige quitarle `view-transition-name`**, porque si no el navegador avisa de un nombre duplicado. Lo detectó `recorrer.mjs`; `verificar.mjs` no lo veía, porque no cambia de diapositiva.
- **Los tokens se aplican por `[data-style]` y `[data-style][data-theme]` en cualquier elemento**, no solo en `<html>`. Por eso una zona puede mostrar otro estilo o modo. Lo usan `l01-modo-claro-oscuro` y `l01-decorado-slide`, y servirá en L03 y L04.

## Pendiente o mejorable

- Las miniaturas de `l01-decorado-slide` son pequeñas (unos 250 px) y el decorado de algunos estilos apenas se distingue. L03 mostrará cada estilo a mayor tamaño.
