/* Motor de presentaciones · núcleo
   - Escala un lienzo de 1920×1080 al visor.
   - Navegación: teclado, gestos, HUD, ancla #id-de-diapositiva.
   - Estilos (data-style) y modo claro/oscuro (data-theme) en <html>.
   - Ciclo de vida de efectos: Motor.fx(nombre, { render(api), play(api), stop(api), step(api, n, info) }).
     render() deja la diapositiva completa y en reposo (con api.step pasos visibles); play() anima;
     step() se llama al mostrar u ocultar un [data-step] de la diapositiva activa.
   - Eventos en la diapositiva (burbujean hasta document): motor:enter, motor:leave y motor:step. */
(() => {
  'use strict';
  const W = 1920, H = 1080;
  const root = document.documentElement;
  // Un deck puede limitar y ordenar los estilos con window.MOTOR_PICK = ['rice', 'noche', …].
  const ALL_STYLES = window.MOTOR_STYLES || [];
  const PICKED = Array.isArray(window.MOTOR_PICK) ? window.MOTOR_PICK.map((id) => ALL_STYLES.find((s) => s.id === id)).filter(Boolean) : ALL_STYLES;
  // Sin ningún estilo válido en MOTOR_PICK se usan todos (y se avisa), en vez de quedar sin estilo.
  if (!PICKED.length) console.warn('[motor] MOTOR_PICK no incluye ningún estilo válido; se usan todos:', window.MOTOR_PICK);
  const STYLES = PICKED.length ? PICKED : ALL_STYLES;
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
  // Número escrito a mano o en JSON. Acepta «4.1», «4,1», «1.234,5», «1,234.5», «1.234.567», «1 234»,
  // «−3» (signo tipográfico) y «1.5e-7». Un solo punto o una sola coma son decimales («1.000» = 1);
  // varios separadores iguales son de miles y deben ir de tres en tres. Devuelve { v, dec }:
  // v es NaN si no es un número; dec son los decimales escritos («97,30» → 2).
  function parseNum(t) {
    if (typeof t === 'number') return { v: t, dec: decimalsOf(t) };
    if (t == null || typeof t !== 'string') return { v: NaN, dec: 0 };
    let s = t.trim().replace(/[\s   ]/g, '').replace(/^[−‒–]/, '-');
    const m = /^([+-]?)([\d.,]+)(e[+-]?\d+)?$/i.exec(s);
    if (!m || !/\d/.test(m[2])) return { v: NaN, dec: 0 };
    let [, sign, body, exp = ''] = m;
    const dots = body.split('.').length - 1, commas = body.split(',').length - 1;
    const groups = (x, sep) => new RegExp(`^\\d{1,3}(\\${sep}\\d{3})+$`).test(x);
    let int = body, frac = '';
    if (dots && commas) {
      const d = body.lastIndexOf('.') > body.lastIndexOf(',') ? '.' : ',', th = d === '.' ? ',' : '.';
      int = body.slice(0, body.lastIndexOf(d)); frac = body.slice(body.lastIndexOf(d) + 1);
      if (frac.includes(th) || !(groups(int, th) || /^\d+$/.test(int))) return { v: NaN, dec: 0 };
      int = int.split(th).join('');
    } else if (dots > 1 || commas > 1) {
      const th = dots > 1 ? '.' : ',';
      if (!groups(body, th)) return { v: NaN, dec: 0 };
      int = body.split(th).join('');
    } else if (dots || commas) {
      [int, frac] = body.split(dots ? '.' : ',');
    }
    if (!/^\d*$/.test(int) || !/^\d*$/.test(frac) || (int + frac) === '') return { v: NaN, dec: 0 };
    const v = Number(`${sign}${int || '0'}.${frac || '0'}${exp}`);
    return { v, dec: exp ? decimalsOf(v, 20) : frac.length };
  }
  // Decimales con los que se escribe v sin perder información, hasta max («0.1 + 0.2» → 1, no 17).
  function decimalsOf(v, max = 6) {
    if (!Number.isFinite(v) || Number.isInteger(v)) return 0;
    const a = Math.abs(v);
    for (let d = 1; d < max; d++) { const k = a * 10 ** d; if (Math.abs(k - Math.round(k)) <= 1e-9 * Math.max(1, k)) return d; }
    return max;
  }
  // Escala con marcas redondas (1, 2, 2,5, 5 × 10^k) que cubre [lo, hi]. Nunca entra en bucle:
  // si el rango es más estrecho que la precisión de los valores (0,3 y 0,30000000000000004;
  // 1e16 repetido) se ensancha hasta incluir el 0, y como mucho genera 60 marcas.
  function nice(lo, hi, count = 5) {
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) { lo = 0; hi = 1; }
    if (lo > hi) [lo, hi] = [hi, lo];
    const big = Math.max(Math.abs(lo), Math.abs(hi));
    if (hi - lo <= big * 1e-9) { lo = Math.min(0, lo); hi = Math.max(0, hi); if (lo === hi) hi = 1; }
    const raw = (hi - lo) / count, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
    const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
    if (!Number.isFinite(step) || step <= 0) return { lo, hi, ticks: [lo, hi], step: hi - lo || 1 };
    const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, ticks = [];
    for (let i = 0; i <= 60; i++) { const v = a + i * step; if (v > b + step / 2) break; ticks.push(Number(v.toPrecision(12))); }
    return { lo: a, hi: b, ticks, step };
  }
  const util = { bezier, rng, noise2, parseNum, num: (t) => parseNum(t).v, decimalsOf, nice, clamp: (v, a, b) => Math.max(a, Math.min(b, v)), lerp: (a, b, t) => a + (b - a) * t };

  /* ------------------------------------------------------------------ estado */
  let viewport, stage, slides = [], idx = 0, overview = false, scale = 1, hud, progress, idleTimer = 0, refreshQueued = false;
  let pendingSwap = null, hudOff = false, refreshing = false; // refreshing: motor:enter/leave de un cambio de estilo o modo
  let booted = false, lastHash = '', activeVT = null; // booted: ya hubo una navegación (una tecla durante la carga de fuentes cuenta)
  const sections = [];

  const effectiveDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : sysDark.matches);
  const currentStyle = () => STYLES.find((s) => s.id === root.dataset.style) || STYLES[0];

  /* ------------------------------------------------------------------ API de efectos */
  function makeApi(slide) {
    let cache = null, rafs = new Set(), timers = new Set(), rafGen = 0;
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
      // pasos [data-step] visibles y totales; en la vista general cuentan todos como visibles
      get steps() { return slide.querySelectorAll('[data-step]').length; },
      get step() { return overview ? api.steps : slide.querySelectorAll('[data-step].on').length; },
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
        const gen = rafGen;
        const loop = (now) => {
          if (gen !== rafGen) { rafs.delete(id); return; } // stopAll() ya lo paró
          if (t0 === null) { t0 = now; last = now; }
          const keep = fn(now - t0, now - last); last = now;
          if (keep === false) { rafs.delete(id); return; }
          if (gen !== rafGen) { rafs.delete(id); return; }
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
      stopAll() { rafGen++; rafs.forEach(cancelAnimationFrame); rafs.clear(); timers.forEach(clearTimeout); timers.clear(); },
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
  const emit = (slide, type, detail) => slide.dispatchEvent(new CustomEvent('motor:' + type, { bubbles: true, detail: { slide, index: slides.indexOf(slide), ...detail } }));
  function activate(slide) {
    updateDeco(slide);
    const def = fxOf(slide), api = apiOf(slide);
    api.stopAll();
    const animate = !reduced.matches && !overview;
    if (def) {
      if (!slide._rendered || slide._dirty) renderSlide(slide);
      if (animate && def.play) { try { def.play(api); } catch (e) { console.error('[motor] play', slide.id, e); } }
    }
    if (!overview) emit(slide, 'enter', { api, animate, refresh: refreshing });
  }
  function deactivate(slide) {
    if (!slide._api) return;
    slide._api.stopAll();
    const def = fxOf(slide);
    if (def && def.stop) { try { def.stop(slide._api); } catch (e) { console.error('[motor] stop', slide.id, e); } }
    if (def && def.play) slide._dirty = true; // al volver, se reconstruye y se vuelve a reproducir
    emit(slide, 'leave', { api: slide._api, refresh: refreshing });
  }
  // Aviso de paso: el efecto de la diapositiva (si define step) y el evento motor:step.
  function stepped(el, dir) {
    const slide = slides[idx], api = apiOf(slide), def = fxOf(slide);
    const info = { dir, el, total: api.steps, animate: !reduced.matches };
    const n = api.step;
    if (def && def.step) { try { def.step(api, n, info); } catch (e) { console.error('[motor] step', slide.id, e); } }
    emit(slide, 'step', { api, step: n, ...info });
  }

  function refreshAll() {
    if (refreshQueued) return; refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false; flushSwap();
      slides.forEach((s) => { if (s._api) s._api._flush(); if (s._rendered) s._dirty = true; });
      if (overview) slides.forEach((s) => { if (fxOf(s)) renderSlide(s); });
      else { const s = slides[idx]; refreshing = true; try { deactivate(s); activate(s); } finally { refreshing = false; } }
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
    const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); // «a < b» en un título no rompe el decorado
    deco.innerHTML =
      '<div class="deco-grid"></div>' +
      `<div class="deco-bar"><span class="ws">${sections.map((s, k) => `<b class="${k === si ? 'on' : ''}">${k + 1}</b>`).join('')}</span><span class="title">${esc(slide.dataset.title || '')}</span><span class="sys"><span class="clock">--:--</span><span>${n}/${t}</span></span></div>` +
      '<div class="deco-corners"><i></i><i></i><i></i><i></i></div>' +
      `<div class="deco-folio"><span class="n">${n}</span><span class="sec">${esc(sec)}</span></div>` +
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
  // Con View Transitions el cambio real (swap) llega más tarde. Si entra otra orden antes,
  // se aplica ya el cambio pendiente para que idx y la diapositiva activa estén al día.
  function flushSwap() { if (pendingSwap) { const f = pendingSwap; pendingSwap = null; f(); } }
  function go(i, instant = false) {
    flushSwap();
    if (!slides.length) return;
    if (!Number.isFinite(i)) { console.warn('[motor] go(): índice no válido', i); return; }
    booted = true;
    i = Math.max(0, Math.min(slides.length - 1, Math.trunc(i)));
    const prev = slides[idx], next = slides[i];
    if (prev === next && next.classList.contains('is-active') && !instant) return;
    root.dataset.dir = i >= idx ? 'next' : 'prev';
    const swap = () => {
      slides.forEach((s) => { if (s !== next && s.classList.contains('is-active')) { s.classList.remove('is-active'); s.setAttribute('aria-hidden', 'true'); deactivate(s); } });
      next.classList.add('is-active'); next.removeAttribute('aria-hidden');
      if (i < idx) {
        const pend = next.querySelectorAll('[data-step]:not(.on)');
        if (pend.length) { pend.forEach((s) => s.classList.add('on')); next._dirty = true; } // render() con todos los pasos
      }
      idx = i;
      activate(next);
      updateHud();
      if (overview) next.scrollIntoView({ block: 'nearest' });
    };
    if (!instant && !overview && document.startViewTransition && !reduced.matches) {
      pendingSwap = swap;
      try {
        const vt = (activeVT = document.startViewTransition(flushSwap));
        vt.ready.catch(() => {});
        vt.finished.catch(() => {}).finally(() => { if (activeVT === vt) activeVT = null; });
      } catch (e) { flushSwap(); } // al encadenar teclas, la anterior se salta
    } else swap();
    // El id va codificado: «a%20b» y «a b» dan anclas distintas.
    if (next.id) { lastHash = '#' + encodeURIComponent(next.id); try { history.replaceState(null, '', lastHash); } catch (e) { /* sin historial */ } }
  }
  // Ancla → índice: primero el id decodificado; si no, el texto tal cual (enlaces antiguos sin codificar).
  function indexOfHash(hash) {
    const raw = hash.replace(/^#/, '');
    let h = raw;
    try { h = decodeURIComponent(raw); } catch (e) { /* ancla mal codificada (#50%): se usa tal cual */ }
    const i = slides.findIndex((s) => s.id === h);
    return i >= 0 ? i : slides.findIndex((s) => s.id === raw);
  }
  function next() {
    flushSwap();
    if (!slides.length) return;
    const pending = slides[idx].querySelector('[data-step]:not(.on)');
    if (pending && !overview) { pending.classList.add('on'); stepped(pending, 'next'); return; }
    go(idx + 1);
  }
  function prev() {
    flushSwap();
    if (!slides.length) return;
    const shown = [...slides[idx].querySelectorAll('[data-step].on')];
    if (shown.length && !overview) { const el = shown[shown.length - 1]; el.classList.remove('on'); stepped(el, 'prev'); return; }
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

  // Abrir la vista general dibuja (render) las diapositivas con efecto pendientes, en tamaño real, por lotes
  // de ~40 ms: el hilo no se bloquea aunque haya muchas. Se muestra cuando están todas.
  let ovJob = 0, ovEntered = false;
  function toggleOverview(on = !overview) {
    if (on === overview || !slides.length) return;
    flushSwap();
    // api.step cambia (en la vista general cuentan todos los pasos): hay que volver a dibujar
    slides.forEach((s) => { if (s._rendered && s.querySelector('[data-step]')) s._dirty = true; });
    overview = on;
    const job = ++ovJob, cur = slides[idx];
    if (on) {
      // La activa se para (stop, motor:leave) y se dibuja en su estado final, no a mitad de animación.
      deactivate(cur); cur._dirty = true;
      const todo = slides.filter((s) => fxOf(s) && (!s._rendered || s._dirty));
      let k = 0;
      const batch = () => {
        if (job !== ovJob) return; // se cerró antes de terminar
        const t0 = performance.now();
        while (k < todo.length && performance.now() - t0 < 40) { const s = todo[k++]; if (!s._rendered || s._dirty) { s._api && s._api.stopAll(); renderSlide(s); } }
        if (k < todo.length) { setTimeout(batch, 0); return; }
        emit(cur, 'enter', { api: apiOf(cur), animate: false }); ovEntered = true;
        viewport.classList.add('is-overview');
        stage.style.transform = ''; layoutOverview();
        requestAnimationFrame(() => slides[idx].scrollIntoView({ block: 'center' }));
        updateHud();
      };
      batch();
      return;
    }
    viewport.classList.remove('is-overview');
    fit();
    if (ovEntered) emit(cur, 'leave', { api: apiOf(cur), refresh: false }); // cada enter con su leave
    ovEntered = false;
    activate(cur);
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
    hud.addEventListener('pointerenter', () => { if (hudOff) return; clearTimeout(idleTimer); hud.classList.remove('is-idle'); });
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
  function setHudOff(off) {
    hudOff = off; hud.classList.toggle('is-off', off);
    if (off && hud.contains(document.activeElement)) document.activeElement.blur();
  }
  function wake() {
    if (!hud || hudOff) return; // oculto con H: no reaparece hasta pulsar H otra vez
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
    else if (k === 'h' || k === 'H') { setHudOff(!hudOff); if (hudOff) return; }
    else if (k === 'Tab') { wake(); return; } // el foco va a un HUD visible
    else if (/^[0-9]$/.test(k) && STYLES[(+k + 9) % 10]) setStyle(STYLES[(+k + 9) % 10].id); // 1…9 y 0 para el décimo
    else return;
    wake();
  }
  function onTouch() {
    let x0 = null, y0 = null;
    // En la ventana y no en .viewport: durante una View Transition los toques llegan a <html>.
    addEventListener('touchstart', (e) => { if (overview) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchend', (e) => {
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
    const lost = stage.querySelectorAll('.slide').length - slides.length;
    if (lost > 0) console.error(`[motor] ${lost} diapositiva(s) no son hijas directas de .stage y no se mostrarán (¿una etiqueta sin cerrar? node tools/revisar.mjs)`);
    if (!slides.length) { console.warn('[motor] el deck no tiene ninguna <section class="slide"> dentro de .stage'); return; }
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
    // Estilo inicial: el guardado, el del <html> o MOTOR_DEFAULT_STYLE, siempre que esté en MOTOR_PICK.
    const want = [store.get('style'), root.dataset.style, window.MOTOR_DEFAULT_STYLE].find((id) => id && STYLES.some((s) => s.id === id));
    root.dataset.style = want || (STYLES[0] && STYLES[0].id);
    const md = store.get('mode');
    if (md === 'light' || md === 'dark') root.dataset.theme = md;
    buildHud();
    fit();
    addEventListener('resize', fit);
    addEventListener('keydown', onKey);
    // Durante una View Transition, Chromium dirige los clics a <html> y el HUD los pierde: el clic salta la
    // transición y se reenvía al botón que hay debajo.
    addEventListener('pointerdown', (e) => {
      if (!activeVT || e.target !== root) return;
      const { clientX: x, clientY: y } = e;
      try { activeVT.skipTransition(); } catch (err) { /* ya terminada */ }
      requestAnimationFrame(() => { const b = document.elementFromPoint(x, y)?.closest?.('.hud button'); if (b) b.click(); });
    }, true);
    addEventListener('pointermove', wake, { passive: true });
    onTouch();
    sysDark.addEventListener('change', refreshAll);
    reduced.addEventListener('change', refreshAll);
    new MutationObserver(refreshAll).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    const start = Math.max(0, indexOfHash(location.hash));
    // Un ancla cambiada a mano (o un enlace interno #id) navega; la que escribe el propio motor no.
    addEventListener('hashchange', () => { if (location.hash === lastHash) return; const i = indexOfHash(location.hash); if (i >= 0) go(i); });
    idx = start;
    wake();
    // La primera diapositiva se activa con las fuentes ya cargadas (máximo 1 s de espera),
    // para no repetir su entrada al llegar las fuentes. Si tardan más, se redibuja entonces.
    const fonts = document.fonts && document.fonts.ready && document.fonts.status !== 'loaded' ? document.fonts.ready : null;
    if (!fonts) go(start, true);
    else {
      let started = false;
      const begin = () => { if (!started) { started = true; if (!booted) go(start, true); } };
      setTimeout(begin, 1000);
      fonts.then(() => { if (started) refreshAll(); else begin(); });
    }
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
