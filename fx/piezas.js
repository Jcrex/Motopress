/* Piezas: componentes por clase que se combinan en cualquier diapositiva (con o sin data-fx).
   Se pintan en su estado final al cargar (capturas, vista general, PDF) y se animan con los
   eventos del motor (motor:enter, motor:step, motor:leave). El aspecto vive en engine.css.

   - cifra:    <span class="cifra" data-value="97.3" data-dec="1" data-suf=" %"></span>
               data-pre, data-from (0), data-mode="count|roll|auto" (auto: según el estilo).
               Dentro de un [data-step], se anima al revelarse.
   - agenda:   <ol class="agenda"></ol> (o class="agenda banda"): índice con los data-section;
               destaca la sección de la diapositiva (o data-current). data-skip="Inicio,Cierre".
   - reticula: <div class="reticula"> … <div data-target="1" data-label="/cmd_vel · 20 Hz">…</div></div>
               Cuatro esquinas sobre el objetivo cuyo data-target es el mayor ≤ paso actual.
   - etapas y checklist: solo CSS (engine.css). */
(() => {
  const root = document.documentElement;
  const style = () => root.dataset.style;
  const tok = (el, n) => getComputedStyle(el).getPropertyValue('--' + n).trim();
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ cifra */
  const ROLL = new Set(['noche', 'nube', 'termica', 'matriz', 'arcilla']);
  let grouping = 'always';
  try { new Intl.NumberFormat('es-ES', { useGrouping: 'always' }); } catch (e) { grouping = true; }
  function cifraOpts(el) {
    const raw = el.dataset.value || '0', dec = el.dataset.dec != null ? +el.dataset.dec : (raw.split('.')[1] || '').length;
    const f = new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: grouping });
    const mode = el.dataset.mode && el.dataset.mode !== 'auto' ? el.dataset.mode : ROLL.has(style()) ? 'roll' : 'count';
    return { to: parseFloat(raw), from: parseFloat(el.dataset.from || '0'), fmt: (v) => f.format(v), mode };
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  // strips: tiras 0–9 para la animación «roll»; el estado final deja un solo dígito por columna
  function cifraRender(el, strips = false) {
    const o = cifraOpts(el), txt = o.fmt(o.to), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', pre + txt + suf);
    const body = o.mode === 'roll'
      ? [...txt].map((c) => (!/\d/.test(c) ? `<span>${esc(c)}</span>` : strips ? `<span class="dg"><span style="--d:${10 + +c}">${'0123456789'.repeat(2).split('').map((d) => `<i>${d}</i>`).join('')}</span></span>` : `<span class="dg"><span><i>${c}</i></span></span>`)).join('')
      : `<span class="v">${esc(txt)}</span>`;
    el.innerHTML = (pre ? `<span class="pre">${esc(pre.trim())}</span>` : '') + body + (suf ? `<span class="u">${esc(suf.trim())}</span>` : '');
    el.dataset.mode0 = o.mode;
  }
  function cifraPlay(el, api) {
    cifraStop(el);
    const o = cifraOpts(el), dur = Math.max(900, api.dur * 1.8), ease = tok(el, 'ease') || 'ease-out';
    if (o.mode === 'count') {
      const v = el.querySelector('.v');
      v.textContent = o.fmt(o.from);
      api.tween(dur, (p) => { v.textContent = o.fmt(o.from + (o.to - o.from) * p); });
      return;
    }
    cifraRender(el, true);
    const strips = [...el.querySelectorAll('.dg > span')], n = strips.length;
    try {
      el._anims = strips.map((s, j) => s.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-(+s.style.getPropertyValue('--d')) * 1.1}em)` }], { duration: dur, delay: (n - 1 - j) * 70, easing: ease, fill: 'backwards' }));
      Promise.all(el._anims.map((a) => a.finished)).then(() => { el._anims = []; cifraRender(el); }, () => {});
    } catch (e) { cifraRender(el); /* sin WAAPI: estado final */ }
  }
  function cifraStop(el) { (el._anims || []).forEach((a) => a.cancel()); el._anims = []; cifraRender(el); }
  const hidden = (el) => { const s = el.closest('[data-step]'); return s && !s.classList.contains('on'); };

  /* ------------------------------------------------------------------ agenda */
  function sectionsOf(el) {
    const skip = (el.dataset.skip || '').split(',').map((s) => s.trim()).filter(Boolean), out = [];
    (Motor.slides || []).forEach((s) => { const sec = s.dataset.section; if (sec && !out.includes(sec) && !skip.includes(sec)) out.push(sec); });
    return out;
  }
  function agendaRender(el, cur) {
    const secs = sectionsOf(el);
    if (cur === undefined) cur = el.dataset.current || (el.closest('.slide') || {}).dataset?.section;
    el.innerHTML = secs.map((s, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${esc(s)}</li>`).join('') + '<div class="bar" aria-hidden="true"></div>';
    agendaFocus(el, secs.indexOf(cur));
  }
  function agendaFocus(el, ci) {
    const items = [...el.querySelectorAll(':scope > li')], bar = el.querySelector(':scope > .bar');
    items.forEach((li, i) => {
      li.classList.toggle('is-current', i === ci);
      const d = ci < 0 ? 0 : Math.abs(i - ci);
      li.style.setProperty('--k', (1 - Math.exp(-(d * d) / 2)).toFixed(3));
    });
    if (bar) {
      const li = items[ci];
      bar.style.display = li ? '' : 'none';
      if (li) { bar.style.top = li.offsetTop + 'px'; bar.style.height = li.offsetHeight + 'px'; }
    }
  }
  let lastSection = null;
  function agendaPlay(el, api) {
    const secs = sectionsOf(el), cur = el.dataset.current || api.el.dataset.section, from = secs.indexOf(lastSection), to = secs.indexOf(cur);
    agendaRender(el, cur);
    if (from < 0 || from === to) return;
    const bar = el.querySelector(':scope > .bar'), items = [...el.querySelectorAll(':scope > li')];
    if (!bar || !items[to] || !items[from]) return;
    const ease = tok(el, 'ease') || 'ease-out', dur = api.dur;
    try {
      bar.animate([{ top: items[from].offsetTop + 'px', height: items[from].offsetHeight + 'px' }, { top: items[to].offsetTop + 'px', height: items[to].offsetHeight + 'px' }], { duration: dur, easing: ease });
      items.forEach((li, i) => {
        const k0 = 1 - Math.exp(-((i - from) ** 2) / 2), k1 = +li.style.getPropertyValue('--k');
        li.animate([{ transform: `translateX(${k0 * 36}px)`, opacity: 1 - k0 * 0.55 }, { transform: `translateX(${k1 * 36}px)`, opacity: 1 - k1 * 0.55 }], { duration: dur, easing: ease });
      });
    } catch (e) { /* sin WAAPI */ }
  }

  /* ------------------------------------------------------------------ retícula */
  function reticulaPlace(host, n, animate) {
    const targets = [...host.querySelectorAll('[data-target]')];
    if (!targets.length) return;
    let rt = host.querySelector(':scope > .rt');
    if (!rt) { rt = document.createElement('div'); rt.className = 'rt'; rt.setAttribute('aria-hidden', 'true'); rt.innerHTML = '<i></i><i></i><i></i><i></i><b></b>'; host.appendChild(rt); }
    const k = (t) => +t.dataset.target || 0;
    const fit = targets.filter((t) => k(t) <= n);
    const tgt = fit.length ? fit.reduce((a, b) => (k(b) >= k(a) ? b : a)) : targets.reduce((a, b) => (k(b) < k(a) ? b : a));
    const H = host.getBoundingClientRect(), T = tgt.getBoundingClientRect(), z = H.width / (host.offsetWidth || 1) || 1;
    const x = (T.left - H.left) / z, y = (T.top - H.top) / z, w = T.width / z, h = T.height / z;
    const label = tgt.dataset.label || '';
    rt.querySelector('b').textContent = label; rt.querySelector('b').style.display = label ? '' : 'none';
    rt.classList.toggle('arriba', y + h + 70 > host.offsetHeight);
    const prev = rt._box;
    rt.style.transform = `translate(${x}px, ${y}px)`; rt.style.width = w + 'px'; rt.style.height = h + 'px';
    rt._box = { x, y, w, h };
    if (animate && prev && !reduced()) {
      try {
        rt.animate([{ transform: `translate(${prev.x}px, ${prev.y}px)`, width: prev.w + 'px', height: prev.h + 'px' }, { transform: `translate(${x}px, ${y}px)`, width: w + 'px', height: h + 'px' }], { duration: parseFloat(tok(host, 'dur')) || 600, easing: tok(host, 'ease') || 'ease-out' });
        rt.querySelectorAll('i').forEach((c) => c.animate([{ transform: 'rotate(-90deg) scale(.6)' }, { transform: 'none' }], { duration: (parseFloat(tok(host, 'dur')) || 600) * 0.8, easing: tok(host, 'ease') || 'ease-out' }));
      } catch (e) { /* sin WAAPI */ }
    }
  }

  /* ------------------------------------------------------------------ ciclo */
  const FINAL = 1e9;
  function renderSlide(slide) {
    slide._piezas = true;
    slide.querySelectorAll('.cifra').forEach(cifraRender);
    slide.querySelectorAll('.agenda').forEach((el) => agendaRender(el));
    slide.querySelectorAll('.reticula').forEach((el) => reticulaPlace(el, FINAL, false));
  }
  document.addEventListener('motor:enter', (e) => {
    const { slide, api, animate } = e.detail;
    renderSlide(slide);
    const go = () => {
      if (!slide.classList.contains('is-active')) return;
      slide.querySelectorAll('.reticula').forEach((el) => reticulaPlace(el, api.step, false));
      if (!animate) return;
      slide.querySelectorAll('.cifra').forEach((el) => { if (!hidden(el)) cifraPlay(el, api); });
      slide.querySelectorAll('.agenda').forEach((el) => agendaPlay(el, api));
    };
    if (!document.fonts || document.fonts.status === 'loaded') go(); else document.fonts.ready.then(go);
  });
  document.addEventListener('motor:step', (e) => {
    const { slide, api, step, dir, el, animate } = e.detail;
    slide.querySelectorAll('.reticula').forEach((h) => reticulaPlace(h, step, animate));
    if (dir === 'next' && animate) [...(el.matches('.cifra') ? [el] : el.querySelectorAll('.cifra'))].forEach((c) => cifraPlay(c, api));
  });
  document.addEventListener('motor:leave', (e) => {
    const { slide } = e.detail;
    lastSection = slide.dataset.section || null;
    slide.querySelectorAll('.cifra').forEach(cifraStop);
    slide.querySelectorAll('.reticula').forEach((el) => reticulaPlace(el, FINAL, false));
  });
  const boot = () => (Motor.slides || []).forEach((s) => { if (!s._piezas) renderSlide(s); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  if (document.fonts) document.fonts.ready.then(() => (Motor.slides || []).forEach((s) => { if (!s.classList.contains('is-active')) s.querySelectorAll('.reticula').forEach((el) => reticulaPlace(el, FINAL, false)); }));
  Motor.piezas = { cifraRender, agendaRender, reticulaPlace, render: renderSlide };
})();
