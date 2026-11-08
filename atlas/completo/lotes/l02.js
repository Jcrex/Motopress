/* Atlas Completo · L02 API de efectos. render() deja el estado final; play() solo anima; solo tokens. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const S = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs || {}) { if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(el);
    return el;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const num = (x, d = 2) => x.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
  const svgIn = (host, w, h) => { host.innerHTML = ''; return S('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', height: '100%' }, host); };
  const txt = (api, size, w = 400, role = 'mono') => `font:${w} ${size}px ${api.tok('font-' + role)}`;

  /* ---------- api.q / api.qa ---------- */
  Motor.fx('ac-dom', {
    render(api) {
      const aqui = api.qa('.panel').length, todo = document.querySelectorAll('.panel').length;
      api.qa('.ac-diana').forEach((p) => p.classList.add('ac-hallado'));
      api.q('[data-role="codigo"]').innerHTML =
        `api.qa('.panel').length                 <b>${aqui}</b>  <i>// solo esta diapositiva</i>\n` +
        `document.querySelectorAll('.panel')     <b>${todo}</b>  <i>// todo el deck</i>\n` +
        `api.q('.s-title').textContent           <b>'${esc(api.q('.s-title').textContent)}'</b>\n` +
        `api.el.id                               <b>'${esc(api.el.id)}'</b>`;
    },
  });

  /* ---------- api.tok ---------- */
  const TOKS = ['bg', 'bg-2', 'bg-3', 'fg', 'fg-2', 'fg-3', 'accent', 'line-2', 'ok', 'warn', 'err'];
  Motor.fx('ac-tokens', {
    render(api) {
      api.q('[data-role="tokens"]').innerHTML = TOKS.map((t) => {
        const v = api.tok(t);
        return `<span class="ac-sw" style="background:var(--${t})"></span><code>api.tok('${t}')</code><code class="v">${esc(v)}</code>`;
      }).join('');
      api.q('[data-role="estado"]').innerHTML = `api.style = <b>'${esc(api.style)}'</b> · api.dark = <b>${api.dark}</b> · api.meta.name = <b>'${esc(api.meta.name)}'</b> · api.dur = <b>${api.dur}</b>`;
    },
  });

  /* ---------- cats, seq, div ---------- */
  Motor.fx('ac-series', {
    render(api) {
      const sv = svgIn(api.q('[data-role="series"]'), 1000, 600);
      const fg2 = api.tok('fg-2'), fg = api.tok('fg');
      S('text', { x: 0, y: 34, fill: fg2, style: txt(api, 26), text: 'api.cats(6): series categóricas, orden fijo' }, sv);
      api.cats(6).forEach((c, i) => {
        const h = [150, 120, 170, 90, 135, 105][i];
        S('rect', { x: i * 165, y: 230 - h, width: 140, height: h, fill: c, rx: 4 }, sv);
        S('text', { x: i * 165 + 70, y: 262, 'text-anchor': 'middle', fill: fg, style: txt(api, 22), text: `cat-${i + 1}` }, sv);
      });
      const rampa = (y, fn, nombre, izq, der) => {
        S('text', { x: 0, y, fill: fg2, style: txt(api, 26), text: nombre }, sv);
        for (let i = 0; i < 100; i++) S('rect', { x: i * 10, y: y + 16, width: 10.5, height: 70, fill: fn(i / 99) }, sv);
        S('text', { x: 0, y: y + 116, fill: fg2, style: txt(api, 22), text: izq }, sv);
        S('text', { x: 1000, y: y + 116, 'text-anchor': 'end', fill: fg2, style: txt(api, 22), text: der }, sv);
      };
      rampa(320, (t) => api.seq(t), 'api.seq(t): magnitud', 't = 0', 't = 1');
      rampa(470, (t) => api.div(t), 'api.div(t): signo, 0,5 es el centro', '− (t = 0)', '+ (t = 1)');
    },
  });

  /* ---------- api.font ---------- */
  Motor.fx('ac-font', {
    render(api) {
      const host = api.q('[data-role="lienzo"]');
      const { ctx, w } = api.canvas(host);
      ctx.clearRect(0, 0, w, host.clientHeight);
      [['display', 64, 700], ['text', 44, 400], ['mono', 38, 500], ['serif', 44, 400]].forEach(([r, s, p], i) => {
        const y = 110 + i * 125;
        ctx.font = api.font('mono', 22); ctx.fillStyle = api.tok('fg-3');
        ctx.fillText(`api.font('${r}', ${s}, ${p})`, 0, y - s - 4);
        ctx.font = api.font(r, s, p); ctx.fillStyle = api.tok('fg');
        ctx.fillText(r === 'mono' ? 'ros2 topic echo /scan' : 'Robótica, datos y diseño', 0, y + 8);
      });
    },
  });

  /* ---------- raf, after, tween ---------- */
  Motor.fx('ac-tiempo', {
    render(api) {
      const sv = svgIn(api.q('[data-role="pistas"]'), 1000, 420);
      const fg = api.tok('fg'), fg2 = api.tok('fg-2'), acc = api.tok('accent'), base = api.tok('bg-3');
      const pista = (y, nombre, nota) => {
        S('text', { x: 0, y, fill: fg, style: txt(api, 26, 600), text: nombre }, sv);
        S('text', { x: 1000, y, 'text-anchor': 'end', fill: fg2, style: txt(api, 22), text: nota }, sv);
        S('rect', { x: 0, y: y + 20, width: 1000, height: 14, rx: 7, fill: base }, sv);
      };
      pista(40, 'api.raf(fn)', 'bucle; devuelve false para parar');
      pista(170, 'api.after(800, fn)', 'una vez, a los 800 ms');
      pista(300, `api.tween(${api.dur}, fn)`, 'de 0 a 1 con api.ease');
      const st = (api.state = {});
      st.raf = S('circle', { cx: 980, cy: 67, r: 18, fill: acc }, sv);
      st.after = S('rect', { x: 0, y: 190, width: 1000, height: 14, rx: 7, fill: acc }, sv);
      st.tween = S('rect', { x: 0, y: 320, width: 1000, height: 14, rx: 7, fill: acc }, sv);
      api.q('[data-role="estado"]').innerHTML = `api.dur = <b>${api.dur} ms</b> · api.tok('ease') = <b>${esc(api.tok('ease'))}</b>`;
    },
    play(api) {
      const st = api.state;
      api.raf((t) => { st.raf.setAttribute('cx', 20 + 960 * ((t / 1500) % 1)); });
      const ciclo = () => {
        st.after.setAttribute('width', 0); st.tween.setAttribute('width', 0);
        api.after(800, () => st.after.setAttribute('width', 1000));
        api.tween(api.dur * 2, (e) => st.tween.setAttribute('width', 1000 * e)).then(() => api.after(1400, ciclo));
      };
      ciclo();
    },
  });

  /* ---------- api.canvas ---------- */
  Motor.fx('ac-canvas', {
    render(api) {
      const host = api.q('[data-role="lienzo"]');
      const { ctx, w, h, ratio, cv } = api.canvas(host);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = api.tok('fg'); ctx.lineWidth = 1;
      for (let i = 0; i < 40; i++) { const x = Math.round(20 + i * (w - 40) / 39) + 0.5; ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, h * 0.45); ctx.stroke(); }
      ctx.strokeStyle = api.tok('accent'); ctx.lineWidth = 2;
      ctx.beginPath(); for (let x = 0; x <= w; x += 2) { const y = h * 0.72 + Math.sin(x / 30) * h * 0.12; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      api.q('[data-role="estado"]').innerHTML = `w × h = <b>${w} × ${h}</b> px de lienzo · ratio = <b>${num(ratio, 2)}</b> · canvas real <b>${cv.width} × ${cv.height}</b>`;
    },
  });

  /* ---------- rng y noise2 con semilla elegible ---------- */
  const azar = (api) => {
    const seed = +(api.el.dataset.semilla || 7);
    const R = api.rng(seed), N = api.noise2(seed);
    const hp = api.q('[data-role="puntos"]'), hr = api.q('[data-role="ruido"]');
    const p = api.canvas(hp), r = api.canvas(hr);
    p.ctx.clearRect(0, 0, p.w, p.h);
    const cats = api.cats(3);
    for (let i = 0; i < 220; i++) { p.ctx.fillStyle = cats[R.int(0, 2)]; p.ctx.beginPath(); p.ctx.arc(R() * p.w, R() * p.h, 4 + R() * 6, 0, Math.PI * 2); p.ctx.fill(); }
    const cs = 10;
    for (let y = 0; y < r.h; y += cs) for (let x = 0; x < r.w; x += cs) { r.ctx.fillStyle = api.seq(0.5 + 0.5 * N(x / 90, y / 90)); r.ctx.fillRect(x, y, cs, cs); }
    api.q('[data-role="estado"]').innerHTML = `rng(${seed}): primeros valores ${((g) => [g(), g(), g()].map((x) => num(x, 3)).join(' '))(api.rng(seed))}…`;
    api.qa('[data-semilla]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.semilla === String(seed))));
  };
  Motor.fx('ac-azar', { render: azar });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-semilla]'); if (!b) return;
    const slide = b.closest('.slide'); slide.dataset.semilla = b.dataset.semilla;
    if (slide._api) azar(slide._api);
    b.blur();
  });

  /* ---------- Motor.color: siete variantes ---------- */
  const C = Motor.color;
  const fila = (cols) => `<div class="ac-fila">${cols}</div>`;
  const VAR = {
    'parse-hex'(api) {
      return ['accent', 'ok', 'fg-2'].map((t) => {
        const v = api.tok(t), rgb = C.parse(v);
        return fila(`<span class="ac-sw g" style="background:${v}"></span><code>parse(api.tok('${t}'))</code><code class="v">[${rgb.map((x) => num(x, 3)).join(', ')}]</code><code>hex(…) = ${C.hex(rgb)}</code>`);
      }).join('');
    },
    oklch(api) {
      const a = api.tok('accent'), [L, Ch, h] = C.oklch(a);
      const tonos = [0, 60, 120, 180, 240, 300].map((hh) => C.fromOklch(L, Ch, (h + hh) % 360));
      return fila(`<span class="ac-sw g" style="background:${a}"></span><code>oklch(accent)</code><code class="v">L ${num(L, 3)} · C ${num(Ch, 3)} · h ${num(h, 1)}°</code>`) +
        `<p class="label">fromOklch(L, C, h + 0…300°): mismo brillo percibido, seis tonos</p>` +
        `<div class="ac-tira">${tonos.map((c) => `<span style="background:${c}"><code>${c}</code></span>`).join('')}</div>` +
        `<p class="label">fromOklch(0,3 … 0,9, C, h): misma tonalidad, siete luminosidades</p>` +
        `<div class="ac-tira">${[0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((l) => `<span style="background:${C.fromOklch(l, Ch, h)}"></span>`).join('')}</div>`;
    },
    mix(api) {
      const a = api.tok('bg'), b = api.tok('accent');
      const pasos = Array.from({ length: 7 }, (_, i) => C.mix(a, b, i / 6));
      return `<p class="label">mix(bg, accent, t) con t = 0, ⅙ … 1</p><div class="ac-tira alta">${pasos.map((c, i) => `<span style="background:${c}"><code>${num(i / 6, 2)}</code></span>`).join('')}</div>` +
        `<p class="label">mix(cat-1, cat-2, t)</p><div class="ac-tira">${Array.from({ length: 7 }, (_, i) => `<span style="background:${C.mix(api.tok('cat-1'), api.tok('cat-2'), i / 6)}"></span>`).join('')}</div>`;
    },
    contraste(api) {
      const bg = api.tok('bg');
      return ['fg', 'fg-2', 'fg-3', 'accent', 'line-2'].map((t) => {
        const r = C.contrast(api.tok(t), bg);
        return fila(`<span class="ac-texto" style="color:var(--${t})">Aa</span><code>contrast(${t}, bg)</code><code class="v">${num(r, 2)} : 1</code><b class="ac-nivel">${C.wcag(r)}</b>`);
      }).join('');
    },
    daltonismo(api) {
      const cs = api.cats(6);
      let h = '<div class="ac-matriz"><span></span>' + cs.map((c, i) => `<span class="ac-cab" style="--c:${c}">${i + 1}</span>`).join('');
      cs.forEach((a, i) => {
        h += `<span class="ac-cab" style="--c:${a}">${i + 1}</span>`;
        cs.forEach((b, j) => {
          if (i === j) { h += '<span class="ac-vacia"></span>'; return; }
          const d = C.cvd(a, b), vec = Math.abs(i - j) === 1, mal = d < 8;
          h += `<span class="ac-celda${mal ? ' mal' : ''}${vec ? ' vecina' : ''}" style="background:${api.seq(Math.min(1, d / 40))};color:${C.contrast(api.tok('fg'), api.seq(Math.min(1, d / 40))) > 3 ? 'var(--fg)' : 'var(--bg)'}">${num(d, 0)}${mal ? ' ✗' : ''}</span>`;
        });
      });
      const vecinas = cs.slice(0, 5).map((c, i) => C.cvd(c, cs[i + 1]));
      return h + `</div><p class="ac-estado mono">cvd(cat-i, cat-j) · ✗ por debajo de 8 · el umbral solo se exige entre vecinas (recuadradas): por eso el orden de las series importa · mínimo entre vecinas: <b>${num(Math.min(...vecinas), 1)}</b> (${Math.min(...vecinas) >= 8 ? 'cumple' : 'no cumple'})</p>`;
    },
    'delta-e'(api) {
      const cs = api.cats(6), max = 60;
      return '<div class="ac-barras">' + cs.slice(0, 5).map((c, i) => {
        const d = [C.dE(c, cs[i + 1]), C.dE(c, cs[i + 1], 'protan'), C.dE(c, cs[i + 1], 'deutan')];
        return `<div class="ac-par"><span class="ac-sw" style="background:${c}"></span><span class="ac-sw" style="background:${cs[i + 1]}"></span>` +
          d.map((x, k) => `<span class="ac-bar k${k}"><i style="width:${Math.min(100, (x / max) * 100)}%"></i><code>${['normal', 'protan', 'deutan'][k]} ${num(x, 1)}</code></span>`).join('') + '</div>';
      }).join('') + '</div><p class="ac-estado mono">línea vertical: umbral ΔE 8</p>';
    },
    alpha(api) {
      const a = api.tok('accent');
      return `<div class="ac-cuadros">${[0.25, 0.5, 0.75, 1].map((x) => `<span style="background:${C.alpha(a, x)}"><code>alpha(accent, ${num(x, 2)})</code><code>${C.alpha(a, x)}</code></span>`).join('')}</div>`;
    },
  };
  Motor.fx('ac-color', { render(api) { api.q('[data-role="demo"]').innerHTML = VAR[api.el.dataset.variante](api); } });

  /* ---------- Motor.util ---------- */
  Motor.fx('ac-util', {
    render(api) {
      const sv = svgIn(api.q('[data-role="curva"]'), 1000, 420);
      const e = Motor.util.bezier(api.tok('ease')), fg2 = api.tok('fg-2'), line = api.tok('line-2');
      const X = (t) => 80 + t * 860, Y = (v) => 380 - v * 320;
      S('rect', { x: X(0), y: Y(1), width: 860, height: 320, fill: 'none', stroke: line, 'stroke-width': 2 }, sv);
      S('line', { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), stroke: line, 'stroke-width': 2, 'stroke-dasharray': '8 8' }, sv);
      let d = ''; for (let i = 0; i <= 100; i++) d += (i ? 'L' : 'M') + X(i / 100) + ' ' + Y(e(i / 100));
      S('path', { d, fill: 'none', stroke: api.tok('accent'), 'stroke-width': 5 }, sv);
      S('text', { x: X(0), y: 30, fill: fg2, style: txt(api, 24), text: `bezier('${api.tok('ease')}')` }, sv);
      S('text', { x: X(1), y: Y(0) + 34, 'text-anchor': 'end', fill: fg2, style: txt(api, 22), text: 'tiempo →' }, sv);
      api.q('[data-role="ejemplos"]').innerHTML = `clamp(1,4, 0, 1) = <b>${Motor.util.clamp(1.4, 0, 1)}</b>   lerp(10, 20, 0,25) = <b>${Motor.util.lerp(10, 20, 0.25)}</b>   bezier(…)(0,5) = <b>${num(e(0.5), 3)}</b>`;
    },
  });

  /* ---------- Motor.gl: sombreador GLSL 3.00 con tokens ---------- */
  const FS = `#version 300 es
precision mediump float;
uniform vec2 res; uniform float t; uniform vec3 a; uniform vec3 b; uniform vec3 c;
out vec4 o;
void main(){
  vec2 p = gl_FragCoord.xy / res;
  float w = 0.5 + 0.5 * sin(p.x * 9.0 + t * 0.8 + sin(p.y * 6.0 - t * 0.5) * 1.6);
  vec3 col = mix(mix(a, b, p.y), c, w * 0.6);
  o = vec4(col, 1.0);
}`;
  const lin3 = (hex) => Motor.color.parse(hex);
  const dibujaGl = (api, t) => {
    const st = api.state;
    if (!st.L) return false;
    Motor.gl.drawFull(st.L, st.pg, { res: [st.L.W, st.L.H], t, a: lin3(api.tok('bg-2')), b: lin3(api.tok('cat-1')), c: lin3(api.tok('cat-2')) });
    return true;
  };
  Motor.fx('ac-gl', {
    render(api) {
      const host = api.q('[data-role="gl"]');
      const s = (api.state = { host, w: host.clientWidth, h: host.clientHeight, ratio: 1 });
      s.L = Motor.gl.layer(s, 1);
      s.pg = s.L && Motor.gl.program(s.L, 'ac-demo', Motor.gl.VS_FULL2, FS);
      let modo;
      if (!s.L) modo = 'sin WebGL: respaldo 2D';
      else if (!s.pg) modo = `${s.L.gl2 ? 'WebGL2' : 'WebGL1'} sin GLSL 3.00: respaldo 2D`;
      else modo = s.L.gl2 ? 'WebGL2 · GLSL 3.00' : 'WebGL1';
      if (!s.pg) {
        if (s.L) s.L.cv.style.display = 'none';
        const { ctx, w, h } = api.canvas(host); const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, api.tok('cat-1')); g.addColorStop(1, api.tok('cat-2')); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        s.L = null;
      } else dibujaGl(api, 2);
      api.q('[data-role="estado"]').innerHTML = `contexto obtenido: <b>${modo}</b> · uniformes a, b, c = bg-2, cat-1, cat-2`;
    },
    play(api) { if (api.state.L) api.raf((t) => { dibujaGl(api, 2 + t / 1000); }); },
  });
})();
