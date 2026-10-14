# Instrucciones para Claude Code · motor de presentaciones

Este repositorio es un motor de diapositivas HTML/CSS/JS. Cuando el usuario pida una presentación:

1. Crea `decks/<nombre>/index.html` copiando el `<head>` y los `<script>` de `index.html` (ajusta las rutas con `../../`). Elige estilo con `<html data-style="…">`: `rice`, `noche`, `suizo`, `aurora`, `cromo`, `arcilla`, `nube`, `termica`, `celula` o `matriz`. Limita y ordena los estilos del deck con `<script>window.MOTOR_PICK = [...]</script>` antes de `themes/meta.js`, y carga `fx/fondos.js` después de `fx/sistema.js`.
2. Escribe una `<section class="slide">` por diapositiva, con `id`, `data-section` y `data-title`. Reutiliza los efectos de `fx/` con `data-fx`; si hace falta uno nuevo, créalo en `fx/` con `Motor.fx(nombre, { render, play, stop })`.
3. Reglas de composición:
   - Lienzo 1920×1080; el cuerpo útil mide unos 1664×630 px bajo el título.
   - Título de una línea (unos 28 caracteres con el tamaño por defecto). Texto mínimo de 22 px.
   - Una idea por diapositiva: mejor tabla, gráfico, número grande o diagrama que viñetas.
   - Colores solo con tokens (`var(--accent)`, `api.tok('fg-2')`, `api.cats()`, `api.seq()`, `api.div()`), nunca literales.
   - Series categóricas en orden fijo `cat-1…cat-6`; magnitudes con `seq`; signo con `div`; estados con `ok`, `warn`, `err` y siempre con una palabra al lado.
   - El texto de los gráficos usa `fg`, `fg-2` o `fg-3`, no el color de la serie.
   - `render()` deja el estado final completo; `play()` solo anima. Respeta `api.reduced`.
   - Marca como «de ejemplo» o «sintéticos» los datos que no vengan del usuario.
4. Verifica: sirve la raíz del repositorio (`python -m http.server 8000`) y ejecuta `node tools/verificar.mjs <nombre> [estilo1,estilo2]`. Hace capturas de todas las diapositivas en dos estilos (por defecto `suizo` y `noche`) y en claro y oscuro, e imprime errores de consola y elementos que se salen del lienzo. Abre varias capturas y revísalas. Si Chromium ya está instalado, pásalo con `CHROMIUM_PATH=/ruta/a/chrome`.
5. Para entregar un solo archivo: `node tools/bundle.mjs decks/<nombre>/index.html` (queda en `output/<nombre>.html`).

Todo lo que generan las herramientas va a la carpeta de salida: `output/` por defecto, con las presentaciones empaquetadas en la raíz y las capturas en `capturas/<nombre>/`. Para usar otra carpeta, añade `--out=<carpeta>` a la orden o define `MOTOR_OUT=<carpeta>`; la opción manda sobre la variable y las rutas relativas parten de la raíz del repositorio. Si el usuario indica una carpeta de salida, úsala con `--out=`.

Para cambiar colores o fuentes de un estilo, edita `themes/source.json` y ejecuta `node tools/build-themes.mjs --report`; no edites `themes/tokens.css` a mano.
