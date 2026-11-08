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
   - descifra: cualquier texto con class="descifra" se revela con glifos (data-orden="start|center|random").
   - paleta:   <div class="paleta" data-words="NAV2 LISTO|SLAM ACTIVO" data-pad="12"></div>: split-flap;
               recorre las palabras al entrar, o una por paso con data-pasos.
   - teclea:   <div class="term teclea"><div data-k="cmd">$ colcon build</div><div>salida…</div></div>
   - deposito: <div class="deposito" data-value="72" data-label="batería" data-umbral="30" data-critico="15"></div>
   - mazo:     <div class="mazo"><article class="panel">…</article><article class="panel" data-step>…</article>…</div>
   - chispa y rayo: clase en cualquier panel; una capa de canvas por diapositiva dibuja el borde.
   - etapas, checklist y bento: solo CSS (engine.css). */
(() => {
  const root = document.documentElement;
  const style = () => root.dataset.style;
  const tok = (el, n) => getComputedStyle(el).getPropertyValue('--' + n).trim();
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ cifra */
  const ROLL = new Set(['noche', 'nube', 'termica', 'matriz', 'arcilla']);
  let grouping = 'always';
  try { new Intl.NumberFormat('es-ES', { useGrouping: 'always' }); } catch (e) { grouping = true; }
  // Número escrito a mano: acepta «4.1», «4,1» y «1.234,5». Devuelve NaN si no es un número.
  const parseNum = (t) => {
    if (t == null) return NaN;
    let s = String(t).trim().replace(/\s/g, '');
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    return s === '' ? NaN : Number(s);
  };
  const decOk = (d) => Number.isInteger(d) && d >= 0 && d <= 20;
  function cifraOpts(el) {
    const raw = el.dataset.value || '0', norm = String(parseNum(raw) || 0), own = parseNum(el.dataset.dec);
    const dec = decOk(own) ? own : Math.min(20, (/[.,](\d+)$/.exec(raw.trim()) || [, ''])[1].length || (norm.split('.')[1] || '').length);
    if (!Number.isFinite(parseNum(raw))) console.warn('[motor] cifra con data-value no numérico:', raw);
    // idioma del deck (<html lang>); sin él, español
    const lang = (el.closest('[lang]') || {}).lang || 'es-ES';
    let f;
    try { f = new Intl.NumberFormat(lang, { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: grouping }); }
    catch (e) { f = new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: grouping }); }
    const mode = el.dataset.mode && el.dataset.mode !== 'auto' ? el.dataset.mode : ROLL.has(style()) ? 'roll' : 'count';
    return { to: parseNum(raw) || 0, from: parseNum(el.dataset.from || '0') || 0, fmt: (v) => f.format(v), mode };
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

  /* ------------------------------------------------------------------ chispa y rayo
     Una capa de canvas por diapositiva dibuja el borde de todos los .chispa y .rayo. */
  function rrSampler(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    const sw = w - 2 * r, sh = h - 2 * r, arc = (Math.PI * r) / 2, L = 2 * sw + 2 * sh + 4 * arc;
    const segs = [['l', x + r, y, 1, 0, sw], ['a', x + w - r, y + r, -Math.PI / 2, arc], ['l', x + w, y + r, 0, 1, sh], ['a', x + w - r, y + h - r, 0, arc],
      ['l', x + w - r, y + h, -1, 0, sw], ['a', x + r, y + h - r, Math.PI / 2, arc], ['l', x, y + h - r, 0, -1, sh], ['a', x + r, y + r, Math.PI, arc]];
    return {
      L,
      at(u) {
        let d = (((u % 1) + 1) % 1) * L;
        for (let i = 0; i < 8; i++) {
          const g = segs[i], len = g[0] === 'l' ? g[5] : g[4];
          if (d <= len || i === 7) {
            if (g[0] === 'l') return { x: g[1] + g[3] * d, y: g[2] + g[4] * d, nx: g[4], ny: -g[3] };
            const a = g[3] + (r ? d / r : 0);
            return { x: g[1] + Math.cos(a) * r, y: g[2] + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) };
          }
          d -= len;
        }
      },
    };
  }
  function bordesLayer(slide) {
    const items = [...slide.querySelectorAll('.chispa, .rayo')];
    if (!items.length) return null;
    let cv = slide.querySelector(':scope > canvas.bordes');
    if (!cv) { cv = document.createElement('canvas'); cv.className = 'bordes'; cv.setAttribute('aria-hidden', 'true'); slide.appendChild(cv); }
    const S = slide.getBoundingClientRect(), k = S.width / 1920 || 1, ratio = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * k));
    if (cv.width !== Math.round(1920 * ratio)) { cv.width = Math.round(1920 * ratio); cv.height = Math.round(1080 * ratio); }
    const ctx = cv.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const shapes = items.map((el) => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return { el, rayo: el.classList.contains('rayo'), smp: rrSampler((r.left - S.left) / k, (r.top - S.top) / k, r.width / k, r.height / k, parseFloat(cs.borderTopLeftRadius) || 0) };
    });
    return (slide._bordes = { cv, ctx, shapes, n: Motor.util.noise2(7) });
  }
  function drawBordes(slide, t, reveal = 1) {
    const B = slide._bordes; if (!B) return;
    const { ctx, shapes, n } = B, C = Motor.color, dark = Motor.effectiveDark();
    const acc = tok(slide, 'accent'), acc2 = tok(slide, 'accent-2') || acc, fg = tok(slide, 'fg');
    ctx.clearRect(0, 0, 1920, 1080);
    shapes.forEach((sh, si) => {
      const { smp } = sh;
      if (!sh.rayo) {
        // chispa: cabeza en accent con estela hacia accent-2
        const lap = Math.max(2.4, (parseFloat(tok(slide, 'dur')) || 600) * 0.006), head = t ? t / lap + si * 0.37 : 0.3 + si * 0.37, M = 48, tail = 0.22;
        ctx.lineCap = 'round';
        for (let i = M; i > 0; i--) {
          const a = smp.at(head - (tail * i) / M), b = smp.at(head - (tail * (i - 1)) / M), f = 1 - i / M;
          ctx.strokeStyle = C.alpha(C.mix(acc2, acc, f), 0.15 + 0.85 * f); ctx.lineWidth = 1 + 2.5 * f;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        const p = smp.at(head);
        ctx.save(); ctx.shadowColor = acc; ctx.shadowBlur = 18; ctx.fillStyle = dark ? C.mix(acc, fg, 0.5) : acc;
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        return;
      }
      // rayo: el contorno desplazado por ruido, en tres pasadas (halo, cuerpo y núcleo)
      const N = Math.max(80, Math.min(420, Math.round(smp.L / 6))), seed = si * 13.7, fl = 0.82 + 0.18 * (0.5 + 0.5 * n(t * 6, seed));
      const pts = [];
      for (let i = 0; i <= Math.round(N * reveal); i++) {
        const u = i / N, p = smp.at(u), d = smp.L * u;
        const off = n(d * 0.012 + seed, t * 1.6) * 9 + n(d * 0.05 - seed, t * 4.2) * 3.5;
        pts.push([p.x + p.nx * off, p.y + p.ny * off]);
      }
      if (pts.length < 2) return;
      const core = dark ? C.mix(acc, fg, 0.55) : acc;
      [[12, 0.13, acc2], [5, 0.3, acc], [1.8, 0.95, core]].forEach(([lw, a, c]) => {
        ctx.strokeStyle = C.alpha(c, a * fl); ctx.lineWidth = lw; ctx.lineJoin = 'round';
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      });
    });
  }
  function bordesPlay(slide, api) {
    if (!slide._bordes) return;
    let last = -1;
    api.raf((ms) => {
      if (ms - last < 33) return; last = ms;
      drawBordes(slide, 4 + ms / 1000, Math.min(1, ms / 700));
    });
  }

  /* ------------------------------------------------------------------ descifra */
  function descifraOut(el) { if (el._scr) { try { el._scr.revert(); } catch (e) { /* ya revertido */ } el._scr = null; } }
  function descifraPlay(el, api) {
    descifraOut(el);
    if (!window.SplitText || !Motor.scramble) return;
    el._scr = Motor.scramble(el, api, { order: el.dataset.orden || 'start', span: el.dataset.ms ? +el.dataset.ms : undefined });
  }

  /* ------------------------------------------------------------------ paleta (split-flap) */
  const FLAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·-';
  function paletaWords(el) {
    const w = (el.dataset.words || el.textContent || '').split('|').map((x) => x.trim().toUpperCase());
    const pad = +el.dataset.pad || Math.max(...w.map((x) => x.length));
    return w.map((x) => x.padEnd(pad, ' ').slice(0, pad));
  }
  function paletaIndex(el, step) {
    const W = paletaWords(el);
    return el.hasAttribute('data-pasos') ? Math.min(W.length - 1, step) : W.length - 1;
  }
  function paletaRender(el, idx) {
    const W = paletaWords(el), w = W[idx === undefined ? W.length - 1 : idx];
    if (!el.dataset.words) el.dataset.words = W.join('|');
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', w.trim());
    el.innerHTML = [...w].map((c) => `<i>${c === ' ' ? '&nbsp;' : esc(c)}</i>`).join('');
    el._idx = idx === undefined ? W.length - 1 : idx;
  }
  // from: palabra de partida (para saber qué casillas cambian); sin keep, cancela la transición anterior
  function paletaTo(el, api, idx, delay = 0, from = el._idx, keep = false) {
    const W = paletaWords(el), to = W[idx], prev = W[from] || '', cells = [...el.children], R = api.rng(idx * 17 + 3);
    if (!keep) { (el._timers || []).forEach(clearTimeout); el._timers = []; [...to].forEach((c, i) => { if (cells[i] && prev[i] === c) cells[i].textContent = c === ' ' ? ' ' : c; }); }
    el.setAttribute('aria-label', to.trim()); el._idx = idx;
    cells.forEach((cell, i) => {
      const fin = to[i] === ' ' ? ' ' : to[i];
      if (prev[i] === to[i]) return;
      const flips = 3 + Math.floor(R() * 5), t0 = delay + i * 45;
      for (let f = 0; f <= flips; f++) {
        (el._timers || (el._timers = [])).push(api.after(t0 + f * 70, () => {
          cell.textContent = f === flips ? fin : FLAP[Math.floor(R() * FLAP.length)];
          try { cell.animate([{ transform: 'rotateX(0)' }, { transform: 'rotateX(-75deg)' }, { transform: 'rotateX(0)' }], { duration: 70 }); } catch (e) { /* sin WAAPI */ }
        }));
      }
    });
  }
  function paletaPlay(el, api) {
    if (el.hasAttribute('data-pasos')) return;
    const W = paletaWords(el);
    if (W.length < 2) return;
    paletaRender(el, 0);
    el._timers = [];
    for (let k = 1; k < W.length; k++) paletaTo(el, api, k, 500 + (k - 1) * 1500, k - 1, true);
  }

  /* ------------------------------------------------------------------ teclea */
  function tecleaLines(el) {
    const L = [...el.children];
    L.forEach((l) => { if (l._txt === undefined) l._txt = l.textContent; });
    return L;
  }
  function tecleaRender(el) { tecleaLines(el).forEach((l) => { l.textContent = l._txt; l.style.visibility = ''; }); }
  function tecleaPlay(el, api) {
    const L = tecleaLines(el), R = api.rng(L.length * 7 + 1);
    L.forEach((l) => { l.textContent = l._txt; l.style.visibility = 'hidden'; });
    let at = 300;
    L.forEach((l, i) => {
      if (l.dataset.k !== 'cmd') { api.after(at, () => { l.style.visibility = ''; }); at += 120; return; }
      const txt = l._txt, t0 = at;
      api.after(t0, () => { l.style.visibility = ''; l.textContent = ''; const c = document.createElement('b'); c.className = 'caret'; c.textContent = '▍'; l.appendChild(c); l._caret = c; });
      let t = t0 + 150;
      for (let j = 1; j <= txt.length; j++) {
        t += 22 + R() * 30;
        api.after(t, () => { l.firstChild && l.firstChild.nodeType === 3 ? (l.firstChild.textContent = txt.slice(0, j)) : l.insertBefore(document.createTextNode(txt.slice(0, j)), l._caret); });
      }
      const last = !L.slice(i + 1).some((x) => x.dataset.k === 'cmd');
      api.after(t + 260, () => { if (!last && l._caret) { l._caret.remove(); l._caret = null; } });
      at = t + 320;
    });
  }

  /* ------------------------------------------------------------------ depósito */
  function depositoRender(el) {
    const n = parseNum(el.dataset.value || '0'), sinDato = !Number.isFinite(n);
    const v = sinDato ? 0 : Math.max(0, Math.min(100, n)), um = parseNum(el.dataset.umbral), cr = parseNum(el.dataset.critico);
    const state = sinDato ? 'sin-dato' : v <= cr ? 'critico' : v <= um ? 'bajo' : '';
    ['bajo', 'critico', 'sin-dato'].forEach((c) => el.classList.toggle(c, state === c));
    const word = { 'sin-dato': 'sin dato', critico: 'crítico', bajo: 'bajo' }[state] || 'normal';
    const dec = decOk(parseNum(el.dataset.dec)) ? parseNum(el.dataset.dec) : Math.min(2, ((/[.,](\d+)$/.exec(String(el.dataset.value || '').trim()) || [, ''])[1]).length);
    el.innerHTML = `<div class="vaso" aria-hidden="true"><div class="liq" style="--v:${v}"></div><i style="bottom:25%"></i><i style="bottom:50%"></i><i style="bottom:75%"></i></div>` +
      `<div class="lectura">${sinDato ? '<span class="cifra-nd">—</span>' : `<span class="cifra" data-value="${v}" data-suf=" %" data-mode="count" data-dec="${dec}"></span>`}${el.dataset.label ? `<p class="label">${esc(el.dataset.label)}</p>` : ''}<p class="estado"><b>●</b> ${word}</p></div>`;
    el.querySelectorAll('.cifra').forEach((c) => cifraRender(c));
  }
  function depositoPlay(el, api) {
    const liq = el.querySelector('.liq'); if (!liq) return;
    const v = Math.max(0, Math.min(100, parseNum(el.dataset.value || '0') || 0)), w = 2 * Math.PI / 1.1, z = 0.32;
    api.raf((ms) => {
      const t = ms / 1000, env = Math.exp(-z * w * t), lvl = v * (1 - env * Math.cos(w * t)), amp = 14 * env;
      liq.style.setProperty('--v', Math.max(0, lvl).toFixed(2));
      const pts = Array.from({ length: 9 }, (_, i) => { const x = i / 8; return `${x * 100}% ${(amp * (1 + Math.sin(x * 5 + t * 7) * 0.6 + (x - 0.5) * 1.2 * Math.cos(t * 4))).toFixed(1)}px`; });
      liq.style.clipPath = `polygon(${pts.join(',')}, 100% 100%, 0 100%)`;
      if (t > 4) { liq.style.setProperty('--v', v); liq.style.clipPath = ''; return false; }
    });
  }

  /* ------------------------------------------------------------------ bento y mazo */
  function bentoPlay(el) {
    [...el.children].forEach((c, i) => { try { c.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: getComputedStyle(c).opacity, transform: 'none' }], { duration: 500, delay: 80 * i, easing: tok(el, 'ease') || 'ease-out', fill: 'backwards' }); } catch (e) { /* sin WAAPI */ } });
  }
  function mazoRender(el) {
    const C = [...el.children], N = C.length, k = C.filter((c) => c.classList.contains('on')).length % Math.max(1, N);
    el.style.setProperty('--n', N);
    C.forEach((c, i) => { const p = (i - k + N) % N; c.style.setProperty('--p', p); c.classList.toggle('is-front', p === 0); });
  }
  function mazoStep(el, dir, api) {
    const C = [...el.children], N = C.length, k = C.filter((c) => c.classList.contains('on')).length % Math.max(1, N);
    const out = C[(k - 1 + N) % N];
    if (dir !== 'next' || !out) { mazoRender(el); return; }
    out.style.transition = 'none';
    const from = getComputedStyle(out).transform;
    mazoRender(el);
    const to = getComputedStyle(out).transform;
    try {
      const a = out.animate([{ transform: from, zIndex: 40 }, { transform: `${from === 'none' ? '' : from} translateY(70%) rotate(-3deg)`, zIndex: 40, offset: 0.45 }, { transform: to, zIndex: 0, offset: 0.46 }, { transform: to, zIndex: 0 }], { duration: api.dur * 1.6, easing: tok(el, 'ease') || 'ease-out' });
      a.finished.then(() => { out.style.transition = ''; }, () => { out.style.transition = ''; });
    } catch (e) { out.style.transition = ''; }
  }

  /* ------------------------------------------------------------------ ciclo */
  const FINAL = 1e9;
  // Un fallo en una pieza no deja sin dibujar las demás de la diapositiva.
  const safe = (fn) => (el) => { try { fn(el); } catch (e) { console.error('[motor] pieza', el, e); } };
  function renderSlide(slide) {
    slide._piezas = true;
    slide.querySelectorAll('.deposito').forEach(safe(depositoRender));
    slide.querySelectorAll('.cifra').forEach(safe((el) => cifraRender(el)));
    slide.querySelectorAll('.agenda').forEach(safe((el) => agendaRender(el)));
    slide.querySelectorAll('.reticula').forEach(safe((el) => reticulaPlace(el, FINAL, false)));
    slide.querySelectorAll('.descifra').forEach(safe(descifraOut));
    slide.querySelectorAll('.paleta').forEach(safe((el) => paletaRender(el, paletaIndex(el, FINAL))));
    slide.querySelectorAll('.teclea').forEach(safe(tecleaRender));
    slide.querySelectorAll('.mazo').forEach(safe(mazoRender));
    try { if (bordesLayer(slide)) drawBordes(slide, 0); } catch (e) { console.error('[motor] bordes', e); }
  }
  // Piezas que se animan al entrar o, si están dentro de un paso, al revelarse
  const PLAY = [['.cifra', cifraPlay], ['.descifra', descifraPlay], ['.paleta', paletaPlay], ['.teclea', tecleaPlay], ['.deposito', depositoPlay]];
  const playIn = (root, api, onlyRevealed) => PLAY.forEach(([sel, fn]) => {
    const list = [...(root.matches && root.matches(sel) ? [root] : []), ...root.querySelectorAll(sel)];
    list.forEach((el) => { if (onlyRevealed || !hidden(el)) { try { fn(el, api); } catch (e) { console.error('[motor] pieza', el, e); } } });
  });
  document.addEventListener('motor:enter', (e) => {
    const { slide, api, animate } = e.detail;
    renderSlide(slide);
    const go = () => {
      if (!slide.classList.contains('is-active')) return;
      slide.querySelectorAll('.reticula').forEach((el) => reticulaPlace(el, api.step, false));
      slide.querySelectorAll('.paleta').forEach((el) => paletaRender(el, paletaIndex(el, api.step)));
      slide.querySelectorAll('.mazo').forEach(mazoRender);
      if (bordesLayer(slide)) drawBordes(slide, 0);
      if (!animate) return;
      playIn(slide, api, false);
      slide.querySelectorAll('.agenda').forEach((el) => agendaPlay(el, api));
      slide.querySelectorAll('.bento').forEach(bentoPlay);
      bordesPlay(slide, api);
    };
    if (!document.fonts || document.fonts.status === 'loaded') go(); else document.fonts.ready.then(go);
  });
  document.addEventListener('motor:step', (e) => {
    const { slide, api, step, dir, el, animate } = e.detail;
    slide.querySelectorAll('.reticula').forEach((h) => reticulaPlace(h, step, animate));
    slide.querySelectorAll('.mazo').forEach((p) => (animate && p.contains(el) ? mazoStep(p, dir, api) : mazoRender(p)));
    slide.querySelectorAll('.paleta[data-pasos]').forEach((p) => { const i = paletaIndex(p, step); if (i === p._idx) return; if (animate) paletaTo(p, api, i); else paletaRender(p, i); });
    if (dir === 'next' && animate) playIn(el, api, true);
  });
  document.addEventListener('motor:leave', (e) => {
    const { slide } = e.detail;
    lastSection = slide.dataset.section || null;
    renderSlide(slide);
    slide.querySelectorAll('.cifra').forEach(cifraStop);
    slide.querySelectorAll('.deposito .liq').forEach((l) => { l.style.clipPath = ''; });
  });
  const boot = () => (Motor.slides || []).forEach((s) => { if (!s._piezas) renderSlide(s); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  if (document.fonts) document.fonts.ready.then(() => (Motor.slides || []).forEach((s) => { if (!s.classList.contains('is-active')) renderSlide(s); }));
  Motor.piezas = { cifraRender, agendaRender, reticulaPlace, render: renderSlide };
})();
