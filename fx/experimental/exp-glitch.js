/* exp-glitch · port experimental de react-bits GlitchText (TextAnimations) · Atlas Completo, componente q-glitch
 * Origen: react-bits/src/content/TextAnimations/GlitchText/GlitchText.jsx y .css (commit 4dc7b5b). Glitch por franjas, RGB, barrido o ruido de glifos.
 * Uso: <p class="exp-glitch" data-mode="slices">SEÑAL PERDIDA</p> (el tamaño y la fuente los pone el contenedor o su propio estilo).
 * Props del original → motor:
 *   children → contenido del elemento (texto plano)
 *   mode (slices | rgb | scan | noise, slices) → data-mode
 *   trigger (always | hover | click, always) → data-trigger="siempre" (por defecto) o "paso": una ráfaga cuando su data-step se revela con →
 *   speed (0.5) → data-speed · intensity (0.5) → data-intensity · burstDuration (0.6 s) → data-rafaga
 *   flicker (false) → data-parpadeo · offset (10) → data-offset (px) · skew (0) → data-skew (grados)
 *   enableShadows (true) → data-sombras="no" las quita
 *   shadowColors (['#ff0000', '#00ffff']) → tokens var(--x) y var(--z) (los colores de los ejes del estilo)
 *   color → hereda (currentColor); fontSize, fontWeight, className → CSS del contenedor
 * Descartado: hover y clic (pointerenter, pointerleave, click) → la ráfaga «paso»; Math.random → api.rng (repetible).
 * Reglas: render deja el texto limpio (estado final); el glitch solo corre mientras la diapositiva está activa y sin movimiento reducido.
 * Receta: rb_tecnica css-animacion, raf. */
(() => {
  const SEL = '.exp-glitch';
  const MODES = ['slices', 'rgb', 'scan', 'noise'];
  const GLYPHS = '#%&@$?<>/\\=+*~^!';
  const STOPS = [[20, 50], [10, 60], [15, 55], [25, 35], [30, 40], [40, 20], [10, 60], [15, 55], [25, 35], [30, 40], [20, 50], [10, 60], [15, 55], [25, 35], [30, 40], [40, 20], [20, 50], [10, 60], [15, 55], [25, 35], [30, 40]];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const bandAt = (u) => { const x = clamp(u, 0, 1) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(x)), f = x - i; return [STOPS[i][0] + (STOPS[i + 1][0] - STOPS[i][0]) * f, STOPS[i][1] + (STOPS[i + 1][1] - STOPS[i][1]) * f]; };
  const pingPong = (t, p) => { const q = (t / p) % 2; return q < 1 ? 1 - q : q - 1; };
  const fitBand = (t, b) => { t = clamp(t, 0, 100); b = clamp(b, 0, 100); return t + b >= 100 ? [0, 100] : [t, b]; };
  const stepLength = (speed) => 70 * Math.sqrt(Math.max(0.05, speed) / 0.5);

  // Estilos del original con prefijo propio; las máscaras solo usan el canal alfa (var(--fg) es opaco).
  const CSS = `
.exp-glitch { --ga: linear-gradient(var(--fg) var(--g-a-top, 0%), transparent var(--g-a-top, 0%), transparent calc(100% - var(--g-a-bottom, 100%)), var(--fg) calc(100% - var(--g-a-bottom, 100%)));
  --gb: linear-gradient(var(--fg) var(--g-b-top, 0%), transparent var(--g-b-top, 0%), transparent calc(100% - var(--g-b-bottom, 100%)), var(--fg) calc(100% - var(--g-b-bottom, 100%)));
  position: relative; display: inline-block; white-space: nowrap; margin: 0; }
.exp-glitch__text { display: block; opacity: var(--g-alpha, 1); transform: skewX(var(--g-skew, 0deg)); transform-origin: 0 50%;
  -webkit-mask-image: var(--ga), var(--gb); mask-image: var(--ga), var(--gb); -webkit-mask-composite: source-in; mask-composite: intersect; }
.exp-glitch__slice { position: absolute; top: 0; left: 0; overflow: hidden; pointer-events: none; opacity: var(--g-alpha, 1); transform-origin: 0 50%; }
.exp-glitch__slice--a { text-shadow: var(--g-a-shadow, none); clip-path: inset(var(--g-a-top, 0%) 0 var(--g-a-bottom, 100%) 0);
  transform: translate3d(var(--g-a-x, 0px), var(--g-a-y, 0px), 0) skewX(var(--g-skew, 0deg)); }
.exp-glitch__slice--b { text-shadow: var(--g-b-shadow, none); clip-path: inset(var(--g-b-top, 0%) 0 var(--g-b-bottom, 100%) 0);
  transform: translate3d(var(--g-b-x, 0px), var(--g-b-y, 0px), 0) skewX(var(--g-skew, 0deg)); -webkit-mask-image: var(--ga); mask-image: var(--ga); }
.exp-glitch--rgb .exp-glitch__text { position: relative; z-index: 1; -webkit-mask-image: none; mask-image: none; }
.exp-glitch--rgb .exp-glitch__slice { clip-path: none; text-shadow: none; -webkit-mask-image: none; mask-image: none; opacity: calc(var(--g-alpha, 1) * var(--g-split, 0)); }
.exp-glitch--rgb .exp-glitch__slice--a { color: var(--x); }
.exp-glitch--rgb .exp-glitch__slice--b { color: var(--z); }
.exp-glitch--noise .exp-glitch__slice { display: none; }
.exp-glitch__char { position: relative; }
.exp-glitch__char[data-glyph] { visibility: hidden; }
.exp-glitch__char::after { content: attr(data-glyph); position: absolute; inset: 0 0 auto 0; visibility: visible; text-align: center; color: var(--g-glyph, currentColor); }
.exp-glitch__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }`;
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

  const opts = (el) => {
    const d = el.dataset, n = (k, v) => (d[k] != null && d[k] !== '' && !isNaN(+d[k]) ? +d[k] : v);
    return { mode: MODES.includes(d.mode) ? d.mode : 'slices', paso: d.trigger === 'paso', speed: n('speed', 0.5), intensity: n('intensity', 0.5), rafaga: n('rafaga', 0.6),
      parpadeo: d.parpadeo != null && d.parpadeo !== 'no', offset: n('offset', 10), skew: n('skew', 0), sombras: d.sombras !== 'no' };
  };

  // Estado final: el texto limpio, con las dos copias en reposo.
  function render(el) {
    if (!el._texto) el._texto = el.textContent.trim();
    const o = opts(el), txt = el._texto, esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    MODES.forEach((m) => el.classList.toggle('exp-glitch--' + m, m === o.mode));
    el.innerHTML = `<span class="exp-glitch__text" aria-hidden="true">${[...txt].map((c) => `<span class="exp-glitch__char">${esc(c)}</span>`).join('')}</span>`
      + `<span class="exp-glitch__sr">${esc(txt)}</span><span class="exp-glitch__slice exp-glitch__slice--b" aria-hidden="true">${esc(txt)}</span>`
      + `<span class="exp-glitch__slice exp-glitch__slice--a" aria-hidden="true">${esc(txt)}</span>`;
    el._cells = [...el.querySelectorAll('.exp-glitch__char')];
    rest(el);
  }
  function rest(el) {
    el._gen = (el._gen || 0) + 1; // corta el bucle que esté en marcha
    ['--g-a-top', '--g-b-top', '--g-a-x', '--g-a-y', '--g-b-x', '--g-b-y', '--g-a-shadow', '--g-b-shadow', '--g-skew', '--g-alpha', '--g-split', '--g-a-bottom', '--g-b-bottom'].forEach((k) => el.style.removeProperty(k));
    (el._cells || []).forEach((c) => c.removeAttribute('data-glyph'));
  }

  // Bucle del original con api.raf y api.rng; «hasta» limita la ráfaga del modo paso.
  function play(el, api, hasta = Infinity) {
    const gen = el._gen = (el._gen || 0) + 1; // un solo bucle por elemento: el anterior se detiene
    const o = opts(el), R = api.rng(7 + el._texto.length), w = (k, v) => el.style.setProperty(k, v);
    const swaps = new Map(), cells = el._cells || [];
    let clock = 0, last = 0, nextStep = 0, event = null, alpha = 1, jitter = [1, 1, 0, 0], t0 = null;
    const makeEvent = (now, ms) => { const s = () => (R() < 0.5 ? -1 : 1); return { until: now + ms * (1 + Math.floor(R() * 3)), aTop: R() * 80, aHeight: 5 + R() * 22, bTop: R() * 85, bHeight: 3 + R() * 14, ax: s() * (1.3 + R() * 1.5), bx: s() * (1.1 + R() * 1.2), ay: (R() - 0.5) * 0.5, by: (R() - 0.5) * 0.5, skew: s() * (0.4 + R() * 0.6), fresh: true }; };
    const swap = (i, now, ms) => { const c = cells[i]; if (!c || c.textContent === ' ') return; c.setAttribute('data-glyph', GLYPHS[Math.floor(R() * GLYPHS.length)]); c.style.setProperty('--g-glyph', o.sombras ? (i % 2 ? 'var(--z)' : 'var(--x)') : 'currentColor'); swaps.set(i, now + ms * (1 + Math.floor(R() * 3))); };
    const step = (now, power) => {
      const ms = stepLength(o.speed);
      if (event && now >= event.until) event = null;
      if (!event && R() < power * power * 0.35) event = makeEvent(now, ms);
      jitter = [0.6 + R() * 0.8, 0.6 + R() * 0.8, R() * 2 - 1, R() * 2 - 1];
      alpha = o.parpadeo && R() < 0.04 + 0.16 * power ? 0.45 + R() * 0.35 : 1;
      swaps.forEach((until, i) => { if (now >= until) { cells[i].removeAttribute('data-glyph'); swaps.delete(i); } });
      const chance = 0.01 + 0.16 * power * power;
      cells.forEach((_, i) => { if (R() < (swaps.has(i) ? 0.35 : chance)) swap(i, now, ms); });
      if (event && event.fresh) { const s = Math.floor(R() * cells.length), run = 2 + Math.floor(R() * 3); for (let k = 0; k < run; k++) swap((s + k) % cells.length, now, ms); }
      if (event) event.fresh = false;
      nextStep = now + ms * (0.7 + R() * 0.6);
    };
    api.raf((t) => {
      if (el._gen !== gen) return false;
      const now = t; if (t0 == null) t0 = now; // api.raf da milisegundos desde que empezó
      if (now - t0 > hasta) { rest(el); return false; }
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now; clock += dt;
      const burst = hasta < Infinity ? 1 - ((now - t0) / hasta) * 0.55 : 0;
      const power = Math.max(clamp(o.intensity, 0, 1), burst);
      if (now >= nextStep) step(now, power);
      const live = event && now < event.until ? event : null, scale = 0.4 + 1.2 * power, off = Math.max(0, o.offset), pace = Math.max(0.05, o.speed);
      let a = [0, 100], b = [0, 100], ax = 0, ay = 0, bx = 0, by = 0, split = 0;
      if (o.mode === 'slices') {
        a = bandAt(pingPong(clock, 3 * pace)); b = bandAt(pingPong(clock, 2 * pace)); ax = off * scale; bx = -off * scale;
        if (live) { a = [live.aTop, 100 - live.aTop - live.aHeight]; b = [live.bTop, 100 - live.bTop - live.bHeight]; ax = off * scale * live.ax; bx = off * scale * live.bx; ay = off * live.ay; by = off * live.by; }
      } else if (o.mode === 'rgb') {
        const spread = off * (0.22 + 0.45 * power); ax = spread * jitter[0]; bx = -spread * jitter[1]; ay = off * 0.06 * jitter[2]; by = off * 0.06 * jitter[3];
        if (live) { ax = off * scale * Math.abs(live.ax); bx = -off * scale * Math.abs(live.bx); ay = off * live.ay; by = off * live.by; }
        split = o.sombras ? 0.9 : 0.4;
      } else if (o.mode === 'scan') {
        const pass = 2.4 * pace, cycle = pass * (1 + (1 - power) * 1.2), local = clock % cycle, h = 9 + 9 * power;
        if (local < pass) { const dir = Math.floor(clock / cycle) % 2 ? -1 : 1, c = -h + (local / pass) * (100 + 2 * h), tr = c - h * 1.5, thin = h * 0.35; a = [c - h / 2, 100 - (c + h / 2)]; b = [tr - thin / 2, 100 - (tr + thin / 2)]; ax = off * scale * 1.5 * dir * (0.75 + 0.25 * Math.sin(clock * 23)); bx = -ax * 0.5; }
        if (live) { b = [live.bTop, 100 - live.bTop - live.bHeight]; bx = off * scale * live.bx * 1.4; }
      }
      a = fitBand(a[0], a[1]); b = fitBand(b[0], b[1]);
      const sh = o.sombras && o.mode !== 'rgb';
      w('--g-a-top', a[0].toFixed(2) + '%'); w('--g-a-bottom', a[1].toFixed(2) + '%'); w('--g-b-top', b[0].toFixed(2) + '%'); w('--g-b-bottom', b[1].toFixed(2) + '%');
      w('--g-a-x', ax.toFixed(2) + 'px'); w('--g-a-y', ay.toFixed(2) + 'px'); w('--g-b-x', bx.toFixed(2) + 'px'); w('--g-b-y', by.toFixed(2) + 'px');
      w('--g-a-shadow', sh ? `${(-ax / 2).toFixed(2)}px 0 var(--x)` : 'none'); w('--g-b-shadow', sh ? `${(-bx / 2).toFixed(2)}px 0 var(--z)` : 'none');
      w('--g-skew', (live ? o.skew * live.skew : 0).toFixed(2) + 'deg'); w('--g-alpha', alpha.toFixed(2)); w('--g-split', String(split));
    });
  }

  const hidden = (el) => { const s = el.closest('[data-step]'); return s && !s.classList.contains('on'); };
  document.addEventListener('motor:enter', (e) => {
    const { slide, api, animate } = e.detail;
    slide.querySelectorAll(SEL).forEach((el) => { render(el); if (animate && !opts(el).paso && !hidden(el)) play(el, api); });
  });
  document.addEventListener('motor:step', (e) => {
    const { el, api, dir, animate } = e.detail;
    if (!el) return;
    const list = [...(el.matches(SEL) ? [el] : []), ...el.querySelectorAll(SEL)];
    if (dir !== 'next') { list.forEach(rest); return; } // paso ocultado: se para
    if (!animate) return;
    list.forEach((g) => { const o = opts(g); play(g, api, o.paso ? o.rafaga * 1000 : Infinity); });
  });
  document.addEventListener('motor:leave', (e) => e.detail.slide.querySelectorAll(SEL).forEach(rest));
  const boot = () => document.querySelectorAll(SEL).forEach(render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
