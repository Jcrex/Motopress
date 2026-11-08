/* Efectos del deck «RAI en el Unitree G1».
   - secuencia: revela en orden los elementos marcados con data-seq="n" (mismo n, a la vez).
       data-a="fade" (por defecto) · "draw" (trazo de líneas y caminos SVG) · "grow" (barras, de izquierda a derecha)
       · "rise" (barras, de abajo arriba) · "pop" (escala).
       data-travel="#id-de-camino" en un <circle>: un punto recorre ese camino en bucle.
     render() deja la diapositiva completa; play() solo anima y no deja estilos al terminar.
   - las notas del orador (tecla N) están ahora en fx/sistema.js.
   - vídeos: al salir de una diapositiva se pausan los suyos. */
(() => {
  const STEP = 620, DUR = 560;

  function pathOf(api, sel) { const p = api.q(sel); return p && p.getTotalLength ? p : null; }
  function restDots(api) {
    api.qa('[data-travel]').forEach((c) => {
      const p = pathOf(api, c.dataset.travel); if (!p) return;
      const at = p.getPointAtLength(p.getTotalLength() * (+(c.dataset.rest || 0)));
      c.setAttribute('cx', at.x); c.setAttribute('cy', at.y);
    });
  }

  // En SVG el origen de transform es la esquina del viewBox: grow/rise/pop crecerían desde ahí.
  // Si el autor no ha fijado otro, se usa la caja del propio elemento.
  const originFix = (e, kind) => {
    if (!(e instanceof SVGElement) || e.style.transformOrigin || getComputedStyle(e).transformBox !== 'view-box') return;
    e.style.transformBox = 'fill-box';
    e.style.transformOrigin = kind === 'grow' ? 'left center' : kind === 'rise' ? 'center bottom' : 'center';
  };
  Motor.fxOrigin = originFix;
  Motor.fx('secuencia', {
    render(api) { (api.anims || []).forEach((a) => a.cancel()); api.anims = []; restDots(api); },
    play(api) {
      api.anims = [];
      const step = +(api.el.dataset.stepMs || STEP);
      api.qa('[data-seq]').forEach((e) => {
        const n = +e.dataset.seq, kind = e.dataset.a || 'fade';
        const opt = { duration: DUR, delay: 200 + n * step, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' };
        let frames;
        if (kind === 'draw' && e.getTotalLength) {
          const L = e.getTotalLength();
          frames = [{ strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }];
        } else if (kind === 'grow') frames = [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }];
        else if (kind === 'rise') frames = [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }];
        else if (kind === 'pop') frames = [{ opacity: 0, transform: 'scale(.82)' }, { opacity: 1, transform: 'scale(1)' }];
        else frames = [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }];
        if (kind === 'grow' || kind === 'rise' || kind === 'pop') originFix(e, kind);
        try { api.anims.push(e.animate(frames, opt)); } catch (err) { /* sin WAAPI: queda el estado final */ }
      });
      const dots = api.qa('[data-travel]');
      if (!dots.length) return;
      const first = Math.max(0, ...api.qa('[data-seq]').map((e) => +e.dataset.seq));
      const t0 = 200 + first * step + DUR;
      dots.forEach((c) => {
        const p = pathOf(api, c.dataset.travel); if (!p) return;
        const L = p.getTotalLength(), period = +(c.dataset.period || 4200);
        api.raf((t) => {
          const u = t < t0 ? +(c.dataset.rest || 0) : (((t - t0) / period) % 1);
          const at = p.getPointAtLength(L * u); c.setAttribute('cx', at.x); c.setAttribute('cy', at.y);
        });
      });
    },
    stop(api) { (api.anims || []).forEach((a) => a.cancel()); api.anims = []; restDots(api); },
  });

  /* ---------------- vídeos: pausa al salir de la diapositiva ---------------- */
  let last = -1;
  setInterval(() => {
    if (!window.Motor || Motor.index === last) return;
    last = Motor.index;
    Motor.slides.forEach((s, i) => { if (i !== last) s.querySelectorAll('video').forEach((v) => { if (!v.paused) v.pause(); }); });
  }, 250);

})();
