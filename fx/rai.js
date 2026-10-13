/* Efectos del deck «RAI en el Unitree G1».
   - secuencia: revela en orden los elementos marcados con data-seq="n" (mismo n, a la vez).
       data-a="fade" (por defecto) · "draw" (trazo de líneas y caminos SVG) · "grow" (barras, de izquierda a derecha)
       · "rise" (barras, de abajo arriba) · "pop" (escala).
       data-travel="#id-de-camino" en un <circle>: un punto recorre ese camino en bucle.
     render() deja la diapositiva completa; play() solo anima y no deja estilos al terminar.
   - notas del orador: tecla N abre una ventana con las notas (<aside class="notes">) de la diapositiva activa.
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
    paintNotes();
  }, 250);

  /* ---------------- notas del orador (tecla N) ---------------- */
  let win = null;
  function paintNotes() {
    if (!win || win.closed) return;
    const i = Motor.index, s = Motor.slides[i], nx = Motor.slides[i + 1];
    const notes = s.querySelector('aside.notes');
    const d = win.document;
    d.getElementById('n-title').textContent = `${String(i + 1).padStart(2, '0')}/${Motor.slides.length} · ${s.dataset.title || ''}`;
    d.getElementById('n-body').innerHTML = notes ? notes.innerHTML : '<p class="f">Sin notas.</p>';
    d.getElementById('n-next').textContent = nx ? 'Siguiente: ' + (nx.dataset.title || '') : 'Última diapositiva';
  }
  function openNotes() {
    if (win && !win.closed) { win.focus(); return; }
    win = window.open('', 'rai-notas', 'width=760,height=640');
    if (!win) return;
    win.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Notas del orador</title>
<style>body{margin:0;padding:24px 28px;font:20px/1.5 system-ui,sans-serif;background:#16181d;color:#e8e8ea}
h1{margin:0 0 4px;font-size:22px}#n-next,#n-clock{color:#9aa0aa;font-size:16px;margin:0 0 14px}
#n-body p{margin:0 0 12px}.f{color:#9aa0aa}code{font-size:.92em}</style></head>
<body><h1 id="n-title"></h1><p id="n-clock"></p><div id="n-body"></div><p id="n-next"></p>
<script>const t0=Date.now();setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);document.getElementById('n-clock').textContent='Tiempo: '+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')+' · ← → en la ventana principal';},1000);<\/script></body></html>`);
    win.document.close();
    paintNotes();
  }
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select')) return;
    if (e.key === 'n' || e.key === 'N') openNotes();
  });
})();
