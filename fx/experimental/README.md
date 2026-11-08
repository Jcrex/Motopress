# fx/experimental

Componentes «quizás» portados de [react-bits](https://github.com/DavidHDev/react-bits) (commit `4dc7b5b`, 2026-10-31) para el Atlas Completo.

- Solo los carga `atlas/completo/index.html` (desde `src/_pie.html`); `tools/revisar.mjs` avisa si un deck los carga. Portados: `exp-glitch` (GlitchText) y `exp-rotating` (RotatingText).
- El nombre de cada archivo es el del componente en el motor. Los que vienen de un «QUIZÁ» del estudio llevan el prefijo `exp-` (`exp-glitch.js`). Los recomendados que no entraron en las fases 0–2 conservan su nombre (`traza.js`, `trama.js`…).
- Para empezar uno: `rb_preparar` (servidor MCP) escribe el esqueleto con la cabecera rellena; la guía está en la skill `portar-react-bits`.
- Cada archivo empieza con un comentario que indica:
  - su origen en react-bits (ruta del `.jsx`);
  - las props del original y en qué atributo `data-*` o token se han convertido;
  - lo que se ha descartado (ratón, hover).
- Las reglas son las del motor:
  - colores solo con tokens;
  - `render()` deja el estado final y `play()` solo anima;
  - se respeta `api.reduced`;
  - sin ratón.
- Plan y estado de cada uno: `planning/atlas/<lote>/plan.md` y `planning/atlas/atlas.db`.

Para pasar uno al motor estable: moverlo a `fx/piezas.js`, `fx/fondos.js` o su propio archivo de `fx/`, quitar el prefijo `exp-`, documentarlo en el README y cambiar `estado_motor` a `implementado` en `atlas.db`.
