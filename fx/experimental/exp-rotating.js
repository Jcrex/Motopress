/* exp-rotating · port experimental de react-bits RotatingText (TextAnimations) · Atlas Completo, componente q-rotating
 * Origen: react-bits/src/content/TextAnimations/RotatingText/RotatingText.jsx y .css (commit 4dc7b5b). Rota textos dentro de una frase, letra a letra.
 * Uso: <p class="lead">Navegar con <span class="exp-rotating" data-textos="LiDAR|cámaras|lenguaje"></span></p>
 * Props del original → motor:
 *   texts → data-textos="A|B|C"
 *   effect (slide | flip | blur | scale | drop, slide) → data-efecto · direction (up | down) → data-direccion
 *   rotationInterval (2000 ms) → data-intervalo · staggerDuration (0 s) → data-escalon (s; por defecto 0.025)
 *   staggerFrom (first | last | center | random | n) → data-desde · splitBy (characters | words) → data-partir="letras|palabras"
 *   highlight + highlightColor → data-resalte: bloque en var(--accent) con texto var(--on-accent), que ajusta su ancho
 *   loop → siempre; auto → por defecto; con data-pasos, un texto por cada paso (→) de la diapositiva
 *   blur → incluido en el efecto «blur» (10 px)
 *   initial/animate/exit/transition (motion) → fotogramas WAAPI por efecto; los muelles usan la curva --ease del estilo
 * Descartado: pauseOnHover (onMouseEnter, onMouseLeave), animatePresenceMode (siempre «wait»), los métodos del ref y onNext.
 * Reglas: render deja un texto completo (el primero, o el del paso); sin movimiento reducido no hay cambios automáticos.
 * Receta: rb_tecnica motion. */
(() => {
  const SEL = '.exp-rotating';
  const CSS = `
.exp-rotating { display: inline-flex; flex-wrap: nowrap; white-space: pre; position: relative; vertical-align: bottom; overflow: hidden; padding-bottom: .08em; }
.exp-rotating .exp-r-el { display: inline-block; will-change: transform, opacity; }
.exp-rotating[data-efecto="flip"] .exp-r-el { transform-origin: 50% 50% -0.45em; backface-visibility: hidden; }
.exp-rotating[data-resalte] { box-sizing: content-box; justify-content: center; padding: .1em .28em; border-radius: .16em; background: var(--accent); color: var(--on-accent); }
.exp-rotating .exp-r-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  // Fotogramas de entrada y salida de cada efecto (equivalentes a initial/animate/exit del original).
  const FX = {
    slide: (up) => ({ in: [{ transform: `translateY(${up ? 100 : -100}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], out: [{ transform: 'none', opacity: 1 }, { transform: `translateY(${up ? -120 : 120}%)`, opacity: 0 }] }),
    flip: (up) => ({ in: [{ transform: `perspective(480px) rotateX(${up ? -90 : 90}deg)`, opacity: 0 }, { transform: 'perspective(480px) rotateX(0)', opacity: 1 }], out: [{ transform: 'perspective(480px) rotateX(0)', opacity: 1 }, { transform: `perspective(480px) rotateX(${up ? 90 : -90}deg)`, opacity: 0 }], easeIn: 'cubic-bezier(.34,1.4,.64,1)', easeOut: 'cubic-bezier(.5,0,.75,0)' }),
    blur: (up) => ({ in: [{ transform: `translateY(${up ? 45 : -45}%)`, opacity: 0, filter: 'blur(10px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], out: [{ transform: 'none', opacity: 1, filter: 'blur(0)' }, { transform: `translateY(${up ? -45 : 45}%)`, opacity: 0, filter: 'blur(10px)' }], easeIn: 'cubic-bezier(.22,1,.36,1)' }),
    scale: (up) => ({ in: [{ transform: `scale(${up ? 0.35 : 1.7})`, opacity: 0 }, { transform: 'none', opacity: 1 }], out: [{ transform: 'none', opacity: 1 }, { transform: `scale(${up ? 1.7 : 0.35})`, opacity: 0 }] }),
    drop: () => ({ in: [{ transform: 'translateY(-110%)', opacity: 0 }, { transform: 'none', opacity: 1 }], out: [{ transform: 'none', opacity: 1 }, { transform: 'translateY(110%)', opacity: 0 }], easeOut: 'cubic-bezier(.55,0,1,.45)' }),
  };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const textos = (el) => (el.dataset.textos || el.textContent).split('|').map((s) => s.trim()).filter(Boolean);
  const piezas = (el, txt) => (el.dataset.partir === 'palabras' ? txt.split(/(\s+)/) : [...txt]);

  function pinta(el, i) {
    const t = textos(el), txt = t[i % t.length] || '';
    el.dataset.indice = String(i % t.length);
    el.innerHTML = `<span class="exp-r-sr">${esc(txt)}</span>` + piezas(el, txt).map((p) => `<span class="exp-r-el" aria-hidden="true">${p === ' ' || /^\s+$/.test(p) ? '&nbsp;' : esc(p)}</span>`).join('');
  }
  // Índice que toca: con data-pasos, el número de pasos revelados de la diapositiva.
  const indicePaso = (el, step) => Math.max(0, Math.min(textos(el).length - 1, step));
  function render(el, step = 0) { pinta(el, el.dataset.pasos != null ? indicePaso(el, step) : 0); }

  // Cambia al texto i con salida y entrada letra a letra (como animatePresence «wait»).
  function cambia(el, i, api) {
    const efecto = FX[el.dataset.efecto] ? el.dataset.efecto : 'slide', f = FX[efecto](el.dataset.direccion !== 'down');
    const dur = (api && api.dur) || 600, ease = getComputedStyle(el).getPropertyValue('--ease').trim() || 'ease-out';
    const escalon = (el.dataset.escalon != null ? +el.dataset.escalon : 0.025) * 1000, desde = el.dataset.desde || 'first';
    const orden = (n, R) => { const r = Array.from({ length: n }, (_, k) => k); if (desde === 'random') r.sort(() => R() - 0.5); return r; };
    const retraso = (k, n, rnd) => (desde === 'last' ? n - 1 - k : desde === 'center' ? Math.abs(Math.floor(n / 2) - k) : desde === 'random' ? rnd[k] : /^\d+$/.test(desde) ? Math.abs(+desde - k) : k) * escalon;
    const R = api ? api.rng(i + 3) : Math.random, w0 = el.getBoundingClientRect().width;
    const viejas = [...el.querySelectorAll('.exp-r-el')], rv = orden(viejas.length, R);
    const salidas = viejas.map((s, k) => s.animate(f.out, { duration: dur * 0.55, delay: retraso(k, viejas.length, rv), easing: f.easeOut || 'ease-in', fill: 'forwards' }));
    Promise.all(salidas.map((a) => a.finished)).then(() => {
      if (!el.isConnected) return;
      pinta(el, i);
      const nuevas = [...el.querySelectorAll('.exp-r-el')], rn = orden(nuevas.length, R);
      nuevas.forEach((s, k) => s.animate(f.in, { duration: dur, delay: retraso(k, nuevas.length, rn), easing: f.easeIn || ease, fill: 'backwards' }));
      if (el.dataset.resalte != null) { const w1 = el.getBoundingClientRect().width; el.animate([{ width: w0 + 'px' }, { width: w1 + 'px' }], { duration: dur * 0.8, easing: ease }); }
    }, () => {});
  }

  document.addEventListener('motor:enter', (e) => {
    const { slide, api, animate } = e.detail;
    slide.querySelectorAll(SEL).forEach((el) => {
      render(el, api.step);
      if (!animate || el.dataset.pasos != null || textos(el).length < 2) return;
      const ms = +(el.dataset.intervalo || 2000);
      const ciclo = () => api.after(ms, () => { cambia(el, (+el.dataset.indice + 1) % textos(el).length, api); ciclo(); });
      ciclo();
    });
  });
  document.addEventListener('motor:step', (e) => {
    const { slide, api, step, animate } = e.detail;
    slide.querySelectorAll(SEL + '[data-pasos]').forEach((el) => {
      const i = indicePaso(el, step);
      if (i === +el.dataset.indice) return;
      if (animate) cambia(el, i, api); else pinta(el, i);
    });
  });
  const boot = () => document.querySelectorAll(SEL).forEach((el) => render(el, 1e9));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
