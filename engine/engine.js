/* Motor de presentaciones · núcleo
   - Escala un lienzo de 1920×1080 al visor.
   - Navegación: teclado, gestos, HUD, ancla #id-de-diapositiva.
   - Estilos (data-style) y modo claro/oscuro (data-theme) en <html>.
   - Ciclo de vida de efectos: Motor.fx(nombre, { render(api), play(api), stop(api) }).
     render() deja la diapositiva completa y en reposo; play() anima. */
(() => {
  'use strict';
  const W = 1920, H = 1080;
  const root = document.documentElement;
  // Un deck puede limitar y ordenar los estilos con window.MOTOR_PICK = ['rice', 'noche', …].
  const ALL_STYLES = window.MOTOR_STYLES || [];
  const STYLES = Array.isArray(window.MOTOR_PICK) ? window.MOTOR_PICK.map((id) => ALL_STYLES.find((s) => s.id === id)).filter(Boolean) : ALL_STYLES;
  const FX = Object.create(null);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sysDark = matchMedia('(prefers-color-scheme: dark)');
  const store = {
    get(k) { try { return localStorage.getItem('motor:' + k); } catch (e) { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem('motor:' + k) : localStorage.setItem('motor:' + k, v); } catch (e) { /* almacenamiento no disponible */ } },
  };

  /* ------------------------------------------------------------------ color */
  const color = (() => {
    const s2l = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const l2s = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
    function parse(str) {
      str = String(str).trim();
      if (str[0] === '#') {
        if (str.length === 4) str = '#' + [...str.slice(1)].map((c) => c + c).join('');
        return [1, 3, 5].map((i) => parseInt(str.slice(i, i + 2), 16) / 255);
      }
      const m = str.match(/rgba?\(([^)]+)\)/);
      if (m) return m[1].split(/[ ,/]+/).slice(0, 3).map((v) => parseFloat(v) / 255);
      return [0, 0, 0];
    }
    const hex = (rgb) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('');
    const lin = (c) => parse(c).map(s2l);
    function labLin([r, g, b]) {
      const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
      const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
      const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
      return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
    }
    function linLab([L, a, b]) {
      const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
      return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
    }
    const oklab = (c) => labLin(lin(c));
    const oklch = (c) => { const [L, a, b] = oklab(c); return [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360]; };
    function fromOklch(L, C, Hh) {
      for (let c = C; c >= 0; c -= 0.004) {
        const rgb = linLab([L, c * Math.cos((Hh * Math.PI) / 180), c * Math.sin((Hh * Math.PI) / 180)]);
        if (rgb.every((v) => v >= -1e-4 && v <= 1.0001)) return hex(rgb.map((v) => l2s(Math.max(0, Math.min(1, v)))));
      }
      return hex(linLab([L, 0, 0]).map((v) => l2s(Math.max(0, Math.min(1, v)))));
    }
    function mix(a, b, t) {
      const A = oklab(a), B = oklab(b);
      return hex(linLab(A.map((v, i) => v + (B[i] - v) * t)).map((v) => l2s(Math.max(0, Math.min(1, v)))));
    }
    const lum = (c) => { const [r, g, b] = lin(c); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const MAT = {
      protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
      deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
    };
    const sim = (c, k) => { const [r, g, b] = lin(c), M = MAT[k], q = (v) => Math.max(0, Math.min(1, v)); return [q(M[0][0] * r + M[0][1] * g + M[0][2] * b), q(M[1][0] * r + M[1][1] * g + M[1][2] * b), q(M[2][0] * r + M[2][1] * g + M[2][2] * b)]; };
    const dE = (a, b, k) => { const A = labLin(k ? sim(a, k) : lin(a)), B = labLin(k ? sim(b, k) : lin(b)); return 100 * Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
    const cvd = (a, b) => Math.min(dE(a, b, 'protan'), dE(a, b, 'deutan'));
    const alpha = (c, a) => { const [r, g, b] = parse(c); return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`; };
    const wcag = (r) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA grande' : 'insuficiente');
    return { parse, hex, oklab, oklch, fromOklch, mix, contrast, dE, cvd, alpha, wcag };
  })();

  /* ------------------------------------------------------------------ utilidades */
  function bezier(str) {
    const m = String(str).match(/cubic-bezier\(([^)]+)\)/);
    if (!m) return (t) => 1 - (1 - t) ** 3;
    const [x1, y1, x2, y2] = m[1].split(',').map(parseFloat);
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t, dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) { const e = X(t) - x, d = dX(t); if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break; t -= e / d; }
      return Y(Math.max(0, Math.min(1, t)));
    };
  }
  function rng(seed = 1) {
    let a = seed >>> 0;
    const r = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    r.normal = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    r.range = (a2, b2) => a2 + (b2 - a2) * r();
    r.int = (a2, b2) => Math.floor(a2 + (b2 - a2 + 1) * r());
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    return r;
  }
  // Ruido de valor 2D suave (para campos de flujo y paisajes)
  function noise2(seed = 7) {
    const R = rng(seed), P = new Uint8Array(512), G = new Float32Array(256);
    for (let i = 0; i < 256; i++) { P[i] = i; G[i] = R() * 2 - 1; }
    for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [P[i], P[j]] = [P[j], P[i]]; }
    for (let i = 0; i < 256; i++) P[i + 256] = P[i];
    const f = (t) => t * t * (3 - 2 * t);
    return (x, y) => {
      const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255, xf = x - Math.floor(x), yf = y - Math.floor(y);
      const v00 = G[P[P[xi] + yi]], v10 = G[P[P[xi + 1] + yi]], v01 = G[P[P[xi] + yi + 1]], v11 = G[P[P[xi + 1] + yi + 1]];
      const u = f(xf), v = f(yf);
      return (v00 * (1 - u) + v10 * u) * (1 - v) + (v01 * (1 - u) + v11 * u) * v;
    };
  }
  const util = { bezier, rng, noise2, clamp: (v, a, b) => Math.max(a, Math.min(b, v)), lerp: (a, b, t) => a + (b - a) * t };

  /* ------------------------------------------------------------------ estado */
  let viewport, stage, slides = [], idx = 0, overview = false, scale = 1, hud, progress, idleTimer = 0, refreshQueued = false;
  const sections = [];

  const effectiveDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : sysDark.matches);
  const currentStyle = () => STYLES.find((s) => s.id === root.dataset.style) || STYLES[0];

  /* ------------------------------------------------------------------ API de efectos */
  function makeApi(slide) {
    let cache = null, rafs = new Set(), timers = new Set();
    const api = {
      el: slide,
      q: (s) => slide.querySelector(s),
      qa: (s) => [...slide.querySelectorAll(s)],
      tok(n, from) {
        if (from) return getComputedStyle(from).getPropertyValue('--' + n).trim();
        if (!cache) cache = getComputedStyle(slide);
        return cache.getPropertyValue('--' + n).trim();
      },
      _flush() { cache = null; },
      get dark() { return api.tok('is-dark') === '1'; },
      get style() { return root.dataset.style; },
      get meta() { return currentStyle(); },
      get reduced() { return reduced.matches; },
      get dur() { return parseFloat(api.tok('dur')) || 600; },
      ease(t) { return bezier(api.tok('ease'))(t); },
      cats(n = 6) { return Array.from({ length: n }, (_, i) => api.tok('cat-' + (i + 1))); },
      ramp(prefix, t) {
        const steps = Array.from({ length: 7 }, (_, i) => api.tok(prefix + '-' + (i + 1)));
        const x = util.clamp(t, 0, 1) * 6, i = Math.min(5, Math.floor(x));
        return color.mix(steps[i], steps[i + 1], x - i);
      },
      seq(t) { return api.ramp('seq', t); },
      div(t) { return api.ramp('div', t); },
      font(role, size, weight = 400) { return `${weight} ${size}px ${api.tok('font-' + role)}`; },
      rng, noise2, color, util,
      raf(fn) {
        let t0 = null, last = 0, id = 0;
        const loop = (now) => {
          if (t0 === null) { t0 = now; last = now; }
          const keep = fn(now - t0, now - last); last = now;
          if (keep === false) { rafs.delete(id); return; }
          rafs.delete(id); id = requestAnimationFrame(loop); rafs.add(id);
        };
        id = requestAnimationFrame(loop); rafs.add(id);
      },
      after(ms, fn) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
      tween(ms, fn, { delay = 0, ease } = {}) {
        const e = ease || ((t) => api.ease(t));
        return new Promise((res) => {
          api.after(delay, () => api.raf((t) => { const p = Math.min(1, t / ms); fn(e(p), p); if (p >= 1) { res(); return false; } }));
        });
      },
      stopAll() { rafs.forEach(cancelAnimationFrame); rafs.clear(); timers.forEach(clearTimeout); timers.clear(); },
      canvas(host) {
        let cv = host.querySelector(':scope > canvas:not(.gl)');
        if (!cv) { cv = document.createElement('canvas'); host.appendChild(cv); }
        const w = host.clientWidth || 1, h = host.clientHeight || 1;
        const ratio = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * scale * 1.05));
        cv.width = Math.round(w * ratio); cv.height = Math.round(h * ratio);
        const ctx = cv.getContext('2d');
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        return { cv, ctx, w, h, ratio };
      },
    };
    return api;
  }

  function fxOf(slide) { const n = slide.dataset.fx; return n && FX[n] ? FX[n] : null; }
  function apiOf(slide) { return slide._api || (slide._api = makeApi(slide)); }

  function renderSlide(slide) {
    const def = fxOf(slide); if (!def) return;
    const api = apiOf(slide); api._flush();
    try { def.render && def.render(api); } catch (e) { console.error('[motor] render', slide.id, e); }
    slide._rendered = true; slide._dirty = false;
  }
  function activate(slide) {
    updateDeco(slide);
    const def = fxOf(slide); if (!def) return;
    const api = apiOf(slide);
    api.stopAll();
    if (!slide._rendered || slide._dirty) renderSlide(slide);
    if (!reduced.matches && !overview && def.play) { try { def.play(api); } catch (e) { console.error('[motor] play', slide.id, e); } }
  }
  function deactivate(slide) {
    if (!slide._api) return;
    slide._api.stopAll();
    const def = fxOf(slide);
    if (def && def.stop) def.stop(slide._api);
    if (def && def.play) slide._dirty = true; // al volver, se reconstruye y se vuelve a reproducir
  }

  function refreshAll() {
    if (refreshQueued) return; refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      slides.forEach((s) => { if (s._api) s._api._flush(); if (s._rendered) s._dirty = true; });
      if (overview) slides.forEach((s) => { if (fxOf(s)) renderSlide(s); });
      else { const s = slides[idx]; deactivate(s); activate(s); }
      updateHud();
    });
  }

  /* ------------------------------------------------------------------ decorado */
  function injectDeco(slide, i, total) {
    const deco = document.createElement('div');
    deco.className = 'deco'; deco.setAttribute('aria-hidden', 'true');
    const n = String(i + 1).padStart(2, '0'), t = String(total).padStart(2, '0');
    const sec = slide.dataset.section || '';
    const si = sections.indexOf(sec);
    deco.innerHTML =
      '<div class="deco-grid"></div>' +
      `<div class="deco-bar"><span class="ws">${sections.map((s, k) => `<b class="${k === si ? 'on' : ''}">${k + 1}</b>`).join('')}</span><span class="title">${slide.dataset.title || ''}</span><span class="sys"><span class="clock">--:--</span><span>${n}/${t}</span></span></div>` +
      '<div class="deco-corners"><i></i><i></i><i></i><i></i></div>' +
      `<div class="deco-folio"><span class="n">${n}</span><span class="sec">${sec}</span></div>` +
      '<div class="deco-scan"></div><div class="deco-grain"></div>';
    slide.prepend(deco);
  }
  function updateDeco(slide) {
    const c = slide.querySelector('.deco .clock');
    if (c) { const d = new Date(); c.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  }

  /* ------------------------------------------------------------------ escala */
  function fit() {
    if (overview) return layoutOverview();
    const vw = viewport.clientWidth, vh = viewport.clientHeight, g = 16;
    const s = Math.max(0.05, Math.min((vw - 2 * g) / W, (vh - 2 * g) / H));
    const prev = scale; scale = s;
    stage.style.transform = `translate(${(vw - W * s) / 2}px, ${(vh - H * s) / 2}px) scale(${s})`;
    root.style.setProperty('--stage-scale', s);
    if (Math.abs(prev - s) / s > 0.25 && slides.length) refreshAll();
  }
  function layoutOverview() {
    const vw = viewport.clientWidth - 32;
    const cols = Math.max(1, Math.min(5, Math.floor(vw / 340)));
    const w = Math.floor((vw - (cols - 1) * 20) / cols);
    stage.style.setProperty('--ov-cols', cols);
    stage.style.setProperty('--ov-w', w + 'px');
    stage.style.setProperty('--ov-z', (w / W).toFixed(4));
  }

  /* ------------------------------------------------------------------ navegación */
  function go(i, instant = false) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const prev = slides[idx], next = slides[i];
    if (prev === next && next.classList.contains('is-active') && !instant) return;
    root.dataset.dir = i >= idx ? 'next' : 'prev';
    const swap = () => {
      if (prev && prev !== next) { prev.classList.remove('is-active'); prev.setAttribute('aria-hidden', 'true'); deactivate(prev); }
      next.classList.add('is-active'); next.removeAttribute('aria-hidden');
      if (i < idx) next.querySelectorAll('[data-step]').forEach((s) => s.classList.add('on'));
      idx = i;
      activate(next);
      updateHud();
    };
    if (!instant && !overview && document.startViewTransition && !reduced.matches) {
      try { document.startViewTransition(swap); } catch (e) { swap(); }
    } else swap();
    try { history.replaceState(null, '', '#' + next.id); } catch (e) { /* sin historial */ }
  }
  function next() {
    const pending = slides[idx].querySelector('[data-step]:not(.on)');
    if (pending && !overview) { pending.classList.add('on'); return; }
    go(idx + 1);
  }
  function prev() {
    const shown = [...slides[idx].querySelectorAll('[data-step].on')];
    if (shown.length && !overview) { shown[shown.length - 1].classList.remove('on'); return; }
    go(idx - 1);
  }

  function setStyle(id) {
    if (!STYLES.some((s) => s.id === id)) return;
    root.dataset.style = id; store.set('style', id);
    const done = () => refreshAll();
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(done, 60));
    refreshAll();
  }
  function cycleStyle(d) { const i = STYLES.findIndex((s) => s.id === root.dataset.style); setStyle(STYLES[(i + d + STYLES.length) % STYLES.length].id); }
  function setMode(mode) { if (mode) root.dataset.theme = mode; else delete root.dataset.theme; store.set('mode', mode); refreshAll(); }
  function toggleMode() { setMode(effectiveDark() ? 'light' : 'dark'); }

  function toggleOverview(on = !overview) {
    if (on === overview) return;
    if (on) {
      // Renderiza en tamaño real lo que aún no tiene contenido, antes de reducir.
      slides.forEach((s) => { if (fxOf(s) && (!s._rendered || s._dirty)) { s._api && s._api.stopAll(); renderSlide(s); } });
      slides[idx]._api && slides[idx]._api.stopAll();
    }
    overview = on;
    viewport.classList.toggle('is-overview', on);
    if (on) { stage.style.transform = ''; layoutOverview(); requestAnimationFrame(() => slides[idx].scrollIntoView({ block: 'center' })); }
    else { fit(); activate(slides[idx]); }
    updateHud();
  }
  function fullscreen() {
    try {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
    } catch (e) { /* no disponible */ }
  }

  /* ------------------------------------------------------------------ HUD */
  const ICON = {
    prev: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  };
  const keyOf = (i) => (i === 9 ? '0' : String(i + 1));
  function buildHud() {
    hud = document.createElement('nav');
    hud.className = 'hud'; hud.setAttribute('aria-label', 'Controles de la presentación');
    hud.innerHTML =
      `<button type="button" data-act="prev" aria-label="Diapositiva anterior">${ICON.prev}</button>` +
      '<span class="hud-count" aria-live="polite"></span>' +
      `<button type="button" data-act="next" aria-label="Diapositiva siguiente">${ICON.next}</button>` +
      '<span class="hud-sep"></span>' +
      `<div class="hud-styles" role="group" aria-label="Estilo">${STYLES.map((s, i) => `<button type="button" data-style-id="${s.id}" title="${s.full} (${keyOf(i)})" aria-label="${s.name}"><span class="k">${keyOf(i)}</span><span class="nm">${s.name}</span></button>`).join('')}</div>` +
      '<span class="hud-sep"></span>' +
      '<button type="button" data-act="mode"></button>' +
      `<button type="button" data-act="overview" aria-label="Vista general (O)">${ICON.grid}</button>` +
      `<button type="button" data-act="fullscreen" aria-label="Pantalla completa (F)">${ICON.full}</button>`;
    hud.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.styleId) return setStyle(b.dataset.styleId);
      ({ prev, next, mode: toggleMode, overview: () => toggleOverview(), fullscreen })[b.dataset.act]?.();
    });
    hud.addEventListener('pointerenter', () => { clearTimeout(idleTimer); hud.classList.remove('is-idle'); });
    progress = document.createElement('div'); progress.className = 'progress';
    document.body.append(progress, hud);
  }
  function updateHud() {
    if (!hud) return;
    hud.querySelector('.hud-count').innerHTML = `<b>${String(idx + 1).padStart(2, '0')}</b>/${String(slides.length).padStart(2, '0')}`;
    hud.querySelectorAll('[data-style-id]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.styleId === root.dataset.style)));
    const dark = effectiveDark();
    const m = hud.querySelector('[data-act="mode"]');
    m.innerHTML = `${dark ? ICON.sun : ICON.moon}<span class="hud-label">${dark ? 'Claro' : 'Oscuro'}</span>`;
    m.setAttribute('aria-label', dark ? 'Cambiar a modo claro (D)' : 'Cambiar a modo oscuro (D)');
    hud.querySelector('[data-act="overview"]').setAttribute('aria-pressed', String(overview));
    progress.style.setProperty('--p', slides.length > 1 ? idx / (slides.length - 1) : 1);
  }
  function wake() {
    if (!hud) return;
    hud.classList.remove('is-idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { if (!hud.matches(':hover') && !hud.contains(document.activeElement)) hud.classList.add('is-idle'); }, 2800);
  }

  /* ------------------------------------------------------------------ entrada */
  function onKey(e) {
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (['ArrowRight', 'PageDown', ' ', 'ArrowDown'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace', 'ArrowUp'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Enter' && !e.target.closest('button, a')) { next(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (k === 'o' || k === 'O') toggleOverview();
    else if (k === 'Escape' && overview) toggleOverview(false);
    else if (k === 's') cycleStyle(1);
    else if (k === 'S') cycleStyle(-1);
    else if (k === 'd' || k === 'D') toggleMode();
    else if (k === 'f' || k === 'F') fullscreen();
    else if (k === 'h' || k === 'H') hud.classList.toggle('is-idle');
    else if (/^[0-9]$/.test(k) && STYLES[(+k + 9) % 10]) setStyle(STYLES[(+k + 9) % 10].id); // 1…9 y 0 para el décimo
    else return;
    wake();
  }
  function onTouch() {
    let x0 = null, y0 = null;
    viewport.addEventListener('touchstart', (e) => { if (overview) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) (dx < 0 ? next : prev)();
      wake();
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ arranque */
  function init() {
    viewport = document.querySelector('.viewport');
    stage = viewport.querySelector('.stage');
    slides = [...stage.querySelectorAll(':scope > .slide')];
    slides.forEach((s) => { const sec = s.dataset.section; if (sec && !sections.includes(sec)) sections.push(sec); });
    slides.forEach((s, i) => {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'diapositiva');
      s.setAttribute('aria-label', `${i + 1} de ${slides.length}: ${s.dataset.title || ''}`);
      s.setAttribute('aria-hidden', 'true');
      s.dataset.n = String(i + 1).padStart(2, '0');
      s.querySelectorAll('.kicker').forEach((k) => (k.dataset.n = s.dataset.n));
      injectDeco(s, i, slides.length);
      s.addEventListener('click', () => { if (overview) { toggleOverview(false); go(i, true); } });
    });
    if (document.startViewTransition) root.classList.add('has-vt');
    const st = store.get('style');
    root.dataset.style = STYLES.some((s) => s.id === st) ? st : (root.dataset.style || window.MOTOR_DEFAULT_STYLE || (STYLES[0] && STYLES[0].id));
    const md = store.get('mode');
    if (md === 'light' || md === 'dark') root.dataset.theme = md;
    buildHud();
    fit();
    addEventListener('resize', fit);
    addEventListener('keydown', onKey);
    addEventListener('pointermove', wake, { passive: true });
    onTouch();
    sysDark.addEventListener('change', refreshAll);
    reduced.addEventListener('change', refreshAll);
    new MutationObserver(refreshAll).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    const h = decodeURIComponent(location.hash.slice(1));
    const start = Math.max(0, slides.findIndex((s) => s.id === h));
    idx = start;
    go(start, true);
    wake();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => refreshAll());
    setInterval(() => updateDeco(slides[idx]), 30000);
  }

  const Motor = (window.Motor = window.Motor || {});
  Object.assign(Motor, {
    fx(name, def) { FX[name] = def; },
    color, util, styles: STYLES, keyOf,
    go: (i) => go(typeof i === 'string' ? slides.findIndex((s) => s.id === i) : i),
    next, prev, setStyle, setMode, toggleMode, toggleOverview,
    effectiveDark, currentStyle,
  });
  Object.defineProperties(Motor, {
    index: { get: () => idx, configurable: true },
    slides: { get: () => slides, configurable: true },
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
