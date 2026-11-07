/* Atlas Completo · L01 núcleo. Efectos de demostración (prefijo ac-) y acciones de los botones.
   render() deja el estado final; play() solo anima; colores solo con tokens. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const S = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs || {}) { if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(el);
    return el;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const k = (api) => api.el.getBoundingClientRect().width / 1920 || 1; // escala real de la diapositiva
  const leer = (clave) => { try { return localStorage.getItem(clave); } catch (e) { return undefined; } };

  /* ---------- botones con data-ac-accion (en cualquier diapositiva del Atlas Completo) ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ac-accion]'); if (!b) return;
    const [acc, arg] = b.dataset.acAccion.split(':');
    if (acc === 'go') Motor.go(arg);
    else if (acc === 'overview') Motor.toggleOverview(true);
    else if (acc === 'mode') Motor.toggleMode();
    else if (acc === 'style') Motor.setStyle(arg);
    else if (acc === 'print') window.print();
    else if (acc === 'fullscreen') document.querySelector('.hud [data-act="fullscreen"]')?.click();
    b.blur();
  });

  /* ---------- lienzo: cotas del lienzo y del cuerpo medido en esta diapositiva ---------- */
  Motor.fx('ac-lienzo', {
    render(api) {
      const host = api.q('[data-role="lienzo"]'); host.innerHTML = '';
      const sv = S('svg', { viewBox: '-60 -40 2040 1170', preserveAspectRatio: 'xMidYMid meet', width: '100%', height: '100%' }, host);
      const f = (size, w = 400) => `font:${w} ${size}px ${api.tok('font-mono')}`;
      const fg = api.tok('fg'), fg2 = api.tok('fg-2'), line = api.tok('line-2'), acc = api.tok('accent');
      S('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: 'none', stroke: fg, 'stroke-width': 4 }, sv);
      // márgenes
      const m = { t: 120, l: 128, r: 128, b: 140 };
      S('rect', { x: m.l, y: m.t, width: 1920 - m.l - m.r, height: 1080 - m.t - m.b, fill: 'none', stroke: line, 'stroke-width': 3, 'stroke-dasharray': '14 10' }, sv);
      // cuerpo medido
      const slide = api.el.getBoundingClientRect(), body = api.q('.s-body').getBoundingClientRect(), s = k(api);
      const bx = (body.left - slide.left) / s, by = (body.top - slide.top) / s, bw = body.width / s, bh = body.height / s;
      S('rect', { x: bx, y: by, width: bw, height: bh, fill: api.color.alpha(acc, 0.14), stroke: acc, 'stroke-width': 4 }, sv);
      S('text', { x: bx + 24, y: by + 70, fill: fg, style: f(56, 600), text: `s-body · ${Math.round(bw)} × ${Math.round(bh)}` }, sv);
      S('text', { x: 960, y: -8, 'text-anchor': 'middle', fill: fg2, style: f(40), text: '1920' }, sv);
      S('text', { x: -16, y: 540, 'text-anchor': 'middle', fill: fg2, style: f(40), transform: 'rotate(-90 -16 540)', text: '1080' }, sv);
      S('text', { x: m.l + 12, y: m.t - 24, fill: fg2, style: f(36), text: '120' }, sv);
      S('text', { x: 12, y: m.t + 60, fill: fg2, style: f(36), text: '128' }, sv);
      S('text', { x: m.l + 12, y: 1080 - 30, fill: fg2, style: f(36), text: '140' }, sv);
      api.q('[data-role="medida"]').innerHTML =
        `escala actual <b>${s.toFixed(3)}</b> · cuerpo de esta diapositiva <b>${Math.round(bw)} × ${Math.round(bh)}</b> px de lienzo (medido con getBoundingClientRect ÷ escala)`;
    },
  });

  /* ---------- anatomía: atributos reales de esta diapositiva ---------- */
  Motor.fx('ac-anatomia', {
    render(api) {
      const d = api.el.dataset;
      api.q('[data-role="atributos"]').innerHTML =
        `<i>&lt;section</i> class="slide"\n  id="${esc(api.el.id)}"\n  data-section="${esc(d.section)}"\n  data-title="${esc(d.title)}"\n  data-fx="${esc(d.fx)}"<i>&gt;</i>`;
    },
  });

  /* ---------- gesto táctil ---------- */
  Motor.fx('ac-tactil', {
    render(api) {
      const host = api.q('[data-role="gesto"]'); host.innerHTML = '';
      const sv = S('svg', { viewBox: '0 0 1000 560', width: '100%', height: '100%' }, host);
      const fg = api.tok('fg'), fg2 = api.tok('fg-2'), acc = api.tok('accent'), line = api.tok('line-2');
      const font = (s, w = 400) => `font:${w} ${s}px ${api.tok('font-text')}`;
      S('rect', { x: 250, y: 30, width: 500, height: 420, rx: 36, fill: 'none', stroke: line, 'stroke-width': 4 }, sv);
      // zona de umbral: 50 px en horizontal
      S('rect', { x: 450, y: 60, width: 100, height: 360, fill: api.color.alpha(api.tok('warn'), 0.16) }, sv);
      S('text', { x: 500, y: 100, 'text-anchor': 'middle', fill: fg, style: font(26, 600), text: '< 50 px: nada' }, sv);
      S('line', { x1: 700, y1: 240, x2: 330, y2: 240, stroke: acc, 'stroke-width': 6, 'stroke-linecap': 'round' }, sv);
      S('path', { d: 'M350 222 L320 240 L350 258', fill: 'none', stroke: acc, 'stroke-width': 6 }, sv);
      api.state = { dedo: S('circle', { cx: 700, cy: 240, r: 30, fill: api.color.alpha(acc, 0.35), stroke: acc, 'stroke-width': 4 }, sv) };
      S('text', { x: 500, y: 500, 'text-anchor': 'middle', fill: fg, style: font(30, 600), text: 'izquierda → siguiente · derecha → anterior' }, sv);
      S('text', { x: 500, y: 545, 'text-anchor': 'middle', fill: fg2, style: font(26), text: 'cuenta si |dx| > 50 y |dx| > 1,3 · |dy|' }, sv);
    },
    play(api) {
      const d = api.state.dedo;
      api.raf((t) => { const p = (t / 1800) % 1; d.setAttribute('cx', 700 - 370 * api.ease(Math.min(1, p * 1.4))); d.setAttribute('opacity', p > 0.85 ? (1 - p) / 0.15 : 1); });
    },
  });

  /* ---------- ancla: URL actual ---------- */
  const pintaUrl = (api) => { const u = api.q('[data-role="url"]'); if (u) u.innerHTML = `${esc(location.origin + location.pathname)}<b>${esc(location.hash || '#' + api.el.id)}</b>`; };
  Motor.fx('ac-ancla', { render: pintaUrl, play: pintaUrl });

  /* ---------- pasos: contador en vivo ---------- */
  const contador = (api) => { api.q('[data-role="contador"]').textContent = `${api.step} / ${api.steps}`; };
  Motor.fx('ac-pasos', { render: contador, step: contador });

  /* ---------- HUD: copia anotada del real ---------- */
  Motor.fx('ac-hud', {
    render(api) {
      const host = api.q('[data-role="hud"]'); host.innerHTML = '';
      const real = document.querySelector('.hud'); if (!real) return;
      const c = real.cloneNode(true);
      c.classList.remove('is-idle'); c.classList.add('ac-hud-copia'); c.setAttribute('inert', ''); c.setAttribute('aria-hidden', 'true');
      host.appendChild(c);
      const grupos = [c.querySelector('[data-act="prev"]'), c.querySelector('.hud-count'), c.querySelector('[data-act="next"]'), c.querySelector('.hud-styles'),
        c.querySelector('[data-act="mode"]'), c.querySelector('[data-act="overview"]'), c.querySelector('[data-act="fullscreen"]')];
      grupos.forEach((g, i) => {
        if (!g) return;
        const n = document.createElement('span'); n.className = 'ac-num'; n.textContent = i + 1;
        g.classList.add('ac-con-num'); g.appendChild(n);
      });
    },
  });

  /* ---------- progreso: valor de esta diapositiva ---------- */
  Motor.fx('ac-progreso', {
    render(api) {
      const i = Motor.slides.indexOf(api.el), n = Motor.slides.length, p = n > 1 ? i / (n - 1) : 1;
      api.q('[data-role="relleno"]').style.width = (p * 100).toFixed(2) + '%';
      api.q('[data-role="formula"]').innerHTML = `--p = índice / (total − 1) = ${i} / ${n - 1} = <b>${p.toFixed(3)}</b>`;
    },
  });

  /* ---------- selector de estilo ---------- */
  Motor.fx('ac-estilos', {
    render(api) {
      api.q('[data-role="estilos"]').innerHTML = Motor.styles.map((s, i) =>
        `<button type="button" class="ac-btn" data-ac-accion="style:${s.id}" aria-pressed="${s.id === api.style}"><span class="keycap">${Motor.keyOf(i)}</span>${esc(s.name)}</button>`).join('');
    },
  });

  /* ---------- claro y oscuro: dos mitades con el estilo activo y modo fijo ---------- */
  Motor.fx('ac-modo', {
    render(api) {
      api.qa('.ac-mitad').forEach((m) => { m.dataset.style = api.style; });
      const t = document.documentElement.dataset.theme;
      api.q('[data-role="estado"]').innerHTML = `&lt;html data-theme&gt; = <b>${t ? '"' + t + '"' : 'sin fijar'}</b> · sistema: ${matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'} · efectivo: <b>${api.dark ? 'oscuro' : 'claro'}</b>`;
    },
  });

  /* ---------- preferencias guardadas ---------- */
  Motor.fx('ac-preferencias', {
    render(api) {
      const v = (x) => x === undefined ? 'sin almacenamiento' : x === null ? 'sin guardar' : `"${esc(x)}"`;
      api.q('[data-role="tabla"]').innerHTML =
        `<dt>motor:style</dt><dd>${v(leer('motor:style'))}</dd><dt>motor:mode</dt><dd>${v(leer('motor:mode'))}</dd>` +
        `<dt>estilo activo</dt><dd>${esc(api.style)}</dd><dt>modo efectivo</dt><dd>${api.dark ? 'oscuro' : 'claro'}</dd>`;
    },
  });

  /* ---------- MOTOR_PICK de este deck ---------- */
  Motor.fx('ac-pick', {
    render(api) {
      const pick = window.MOTOR_PICK || [];
      api.q('[data-role="codigo"]').innerHTML = `<i>&lt;!-- antes de themes/meta.js --&gt;</i>\n&lt;script&gt;window.MOTOR_PICK = [\n  ${pick.map((p) => `'${esc(p)}'`).join(', ')}\n];&lt;/script&gt;`;
      const igual = pick.join() === Motor.styles.map((s) => s.id).join();
      api.q('[data-role="resultado"]').innerHTML = `Motor.styles (lo que ofrece el HUD): ${Motor.styles.map((s) => esc(s.name)).join(' · ')} — <b>${igual ? 'coincide' : 'no coincide'}</b> con MOTOR_PICK`;
    },
  });

  /* ---------- decorado de esta diapositiva en los diez estilos ---------- */
  Motor.fx('ac-decorado', {
    render(api) {
      const host = api.q('[data-role="minis"]'); host.innerHTML = '';
      const deco = api.q(':scope > .deco'), head = api.q('.s-head');
      Motor.styles.forEach((s) => {
        const m = document.createElement('figure'); m.className = 'ac-mini';
        const l = document.createElement('div'); l.className = 'ac-mini-lienzo slide is-active';
        l.dataset.style = s.id; l.dataset.theme = api.dark ? 'dark' : 'light'; l.setAttribute('inert', ''); l.setAttribute('aria-hidden', 'true');
        if (deco) l.appendChild(deco.cloneNode(true));
        if (head) l.appendChild(head.cloneNode(true));
        const cap = document.createElement('figcaption'); cap.textContent = s.name;
        m.append(cap, l); host.appendChild(m);
      });
    },
  });

  /* ---------- ciclo de vida: registro que sobrevive a las visitas ---------- */
  const reg = [];
  const apunta = (api, txt) => {
    const d = new Date();
    reg.push(`${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}  ${txt}`);
    while (reg.length > 9) reg.shift();
    const ol = api.q('[data-role="registro"]'); if (ol) ol.innerHTML = reg.map((r) => `<li>${esc(r)}</li>`).join('');
  };
  Motor.fx('ac-ciclo', {
    render(api) { apunta(api, `render(api) · api.step = ${api.step}`); },
    play(api) { apunta(api, 'play(api)'); },
    step(api, n, info) { apunta(api, `step(api, ${n}, { dir: '${info.dir}' })`); },
    stop(api) { apunta(api, 'stop(api)'); },
  });

  /* ---------- eventos del motor ---------- */
  const evs = [];
  let evHost = null;
  const pintaEv = () => { if (evHost) evHost.innerHTML = evs.map((r) => `<li>${esc(r)}</li>`).join(''); };
  ['enter', 'step', 'leave'].forEach((t) => document.addEventListener('motor:' + t, (e) => {
    const d = e.detail || {};
    const extra = t === 'enter' ? `animate: ${d.animate}` : t === 'step' ? `step: ${d.step}, dir: '${d.dir}'` : '';
    evs.push(`motor:${t.padEnd(5)}  ${d.slide ? d.slide.id : '?'}${extra ? '  { ' + extra + ' }' : ''}`);
    while (evs.length > 9) evs.shift();
    pintaEv();
  }));
  Motor.fx('ac-eventos', { render(api) { evHost = api.q('[data-role="registro"]'); pintaEv(); } });

  /* ---------- movimiento reducido: la misma animación con y sin play ---------- */
  const barra = (api, host) => {
    host.innerHTML = '';
    const sv = S('svg', { viewBox: '0 0 1000 80', width: '100%', height: '100%', preserveAspectRatio: 'none' }, host);
    S('rect', { x: 0, y: 30, width: 1000, height: 20, rx: 10, fill: api.tok('bg-3') }, sv);
    return S('circle', { cx: 960, cy: 40, r: 30, fill: api.tok('accent') }, sv); // estado final: a la derecha
  };
  Motor.fx('ac-reducido', {
    render(api) {
      api.state = { a: barra(api, api.q('[data-role="a"]')) };
      barra(api, api.q('[data-role="b"]'));
      api.q('[data-role="estado"]').innerHTML = `api.reduced en este navegador = <b>${api.reduced}</b>${api.reduced ? ' (no se mueve ninguna de las dos)' : ''}`;
    },
    play(api) {
      const c = api.state.a;
      api.raf((t) => { const p = (t / 2400) % 1; c.setAttribute('cx', 40 + 920 * api.ease(p < 0.7 ? p / 0.7 : 1)); });
    },
  });
})();
