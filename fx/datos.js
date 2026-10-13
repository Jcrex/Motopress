/* Efectos de análisis de datos: tres nubes de palabras, ridgeline, calendario de commits,
   sankey de un pipeline y panel de indicadores con sparklines. Datos sintéticos. */
(() => {
  const { color } = Motor;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const textOn = (api, bgc) => (color.contrast(api.tok('fg'), bgc) >= color.contrast(api.tok('bg'), bgc) ? api.tok('fg') : api.tok('bg'));

  /* =================================================================
     NUBES DE PALABRAS
     ================================================================= */
  const WORDS = [['ROS 2', 100], ['Python', 92], ['PyTorch', 80], ['C++', 78], ['Nav2', 70], ['SLAM', 66], ['OpenCV', 64], ['Linux', 62], ['Docker', 58], ['Hyprland', 55], ['YOLO', 52], ['pandas', 50], ['Gazebo', 48], ['LiDAR', 46], ['NumPy', 44], ['TensorRT', 40], ['SQL', 38], ['Arch', 37], ['MoveIt', 35], ['CUDA', 34], ['VLM', 33], ['LLM', 33], ['URDF', 30], ['tf2', 29], ['Kalman', 28], ['PID', 27], ['Git', 26], ['Jupyter', 25], ['ONNX', 24], ['scikit-learn', 22], ['Neovim', 21], ['Matplotlib', 20], ['rclpy', 19], ['Bash', 18], ['DDS', 17], ['RViz', 17], ['Waybar', 15], ['kitty', 14]];
  const ROT = { rice: [0, 0, 0, -90], noche: [0, 90], suizo: [0], aurora: [-24, -12, 0, 0, 12, 24], cromo: [0, 0, -12, 12], arcilla: [0, 0, 0, -90], nube: [0, 90], termica: [0, 0, -90], celula: [0], matriz: [0, 90] };
  function wordColor(api, rank, cats) { if (rank < 3) return cats[rank]; if (rank < 8) return api.tok('fg'); if (rank < 18) return api.tok('fg-2'); return api.tok('fg-3'); }
  Motor.fx('clouds', {
    render(api) {
      const d3 = window.d3, cats = api.cats(6);
      // 1 · espiral (d3-cloud)
      const sp = api.q('[data-role="spiral"]'); sp.querySelectorAll('svg').forEach((s) => s.remove());
      const W = sp.clientWidth, H = sp.clientHeight;
      const svg = d3.select(sp).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const fam = api.tok('font-display'), wt = api.tok('title-weight'), up = api.tok('title-case') === 'uppercase';
      const size = d3.scaleSqrt([14, 100], [20, 84]);
      const rots = ROT[api.style] || [0];
      if (d3.layout && d3.layout.cloud) {
        const R = api.rng(11);
        d3.layout.cloud().size([W, H]).words(WORDS.map(([t, v], i) => ({ text: up ? t.toUpperCase() : t, size: size(v), rank: i })))
          .padding(5).rotate(() => rots[Math.floor(R() * rots.length)]).font(fam).fontWeight(wt).fontSize((d) => d.size)
          .spiral(api.style === 'matriz' || api.style === 'nube' ? 'rectangular' : 'archimedean').random(R)
          .on('end', (words) => {
            svg.append('g').attr('transform', `translate(${W / 2},${H / 2})`).selectAll('text').data(words).join('text')
              .attr('class', 'cw').attr('text-anchor', 'middle').attr('transform', (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
              .style('font', (d) => `${wt} ${d.size}px ${fam}`).attr('fill', (d) => wordColor(api, d.rank, cats)).text((d) => d.text);
          }).start();
      }
      // 2 · muro tipográfico
      const wall = api.q('[data-role="wall"]');
      const ws = d3.scaleLinear([14, 100], [26, 70]);
      const fillWall = (k) => { wall.innerHTML = WORDS.map(([t, v], i) => `<span class="cw" style="font:${i < 6 ? 800 : i < 16 ? 600 : 400} ${Math.round(ws(v) * k)}px ${fam};color:${wordColor(api, i, cats)};letter-spacing:${i < 6 ? '-0.02em' : '0'};text-transform:var(--title-case)">${esc(t)}</span>`).join(''); };
      // Ajuste: reduce la escala hasta que el muro quepa en su caja
      let k = 1; fillWall(k);
      while (wall.scrollHeight > wall.clientHeight + 2 && k > 0.5) { k -= 0.04; fillWall(k); }
      // 3 · burbujas (empaquetado circular)
      const bb = api.q('[data-role="bubbles"]'); bb.querySelectorAll('svg').forEach((s) => s.remove());
      const BW = bb.clientWidth, BH = bb.clientHeight;
      const root = d3.pack().size([BW - 16, BH - 16]).padding(5)(d3.hierarchy({ children: WORDS.map(([t, v], i) => ({ t, v, i })) }).sum((d) => d.v || 0));
      const bs = d3.select(bb).append('svg').attr('viewBox', `0 0 ${BW} ${BH}`).append('g').attr('transform', 'translate(8,8)');
      const node = bs.selectAll('g').data(root.leaves()).join('g').attr('class', 'cw').attr('transform', (d) => `translate(${d.x},${d.y})`);
      node.append('circle').attr('r', (d) => d.r).attr('fill', (d) => (d.data.i < 6 ? color.alpha(cats[d.data.i], api.dark ? 0.85 : 0.9) : color.alpha(api.tok('fg-3'), 0.18))).attr('stroke', (d) => (d.data.i < 6 ? 'none' : api.tok('line-2'))).attr('stroke-width', 1.5);
      node.filter((d) => d.r > d.data.t.length * 5.2 + 6).append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
        .style('font', (d) => `${d.data.i < 6 ? 700 : 500} ${Math.min(32, Math.max(15, (d.r * 1.7) / d.data.t.length))}px ${api.tok('font-text')}`)
        .attr('fill', (d) => (d.data.i < 6 ? textOn(api, cats[d.data.i]) : api.tok('fg'))).text((d) => d.data.t);
    },
    play(api) {
      if (!window.gsap) return;
      api.after(80, () => gsap.fromTo(api.qa('.cw'), { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: api.dur / 1000, stagger: { each: 0.012, from: 'start' }, ease: 'back.out(1.4)' }));
    },
  });

  /* =================================================================
     RIDGELINE (homenaje al registro del púlsar CP 1919)
     ================================================================= */
  function ridgeData() {
    const R = Motor.util.rng(19), xs = Array.from({ length: 160 }, (_, i) => (i / 159) * 100);
    return Array.from({ length: 24 }, (_, hr) => {
      const busy = (hr >= 9 && hr <= 13) || (hr >= 16 && hr <= 19) ? 0.35 + R() * 0.25 : 0.05 + R() * 0.05;
      const m1 = 27 + R() * 3, s1 = 3.4 + R(), m2 = 55 + R() * 12, s2 = 7 + R() * 4;
      const ys = xs.map((x) => (1 - busy) * Math.exp(-((x - m1) ** 2) / (2 * s1 * s1)) + busy * 0.55 * Math.exp(-((x - m2) ** 2) / (2 * s2 * s2)) + 0.012 * Math.sin(x * 1.7 + hr) * Math.exp(-((x - m1) ** 2) / 200));
      return { hr, xs, ys, busy };
    });
  }
  Motor.fx('ridge', {
    render(api) {
      const host = api.q('[data-role="ridge"]'); host.querySelectorAll('svg').forEach((s) => s.remove());
      const W = 1000, H = 640, d3 = window.d3, data = ridgeData();
      const svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const m = { l: 86, r: 30, t: 70, b: 50 };
      const x = d3.scaleLinear([0, 100], [m.l, W - m.r]), step = (H - m.t - m.b) / 23.5, amp = step * 4.2;
      const worst = data.reduce((b, d) => (d.busy > b.busy ? d : b), data[0]);
      const gR = svg.append('g');
      data.forEach((d, i) => {
        const base = m.t + i * step;
        const ar = d3.area().x((_, k) => x(d.xs[k])).y0(base).y1((v) => base - v * amp).curve(d3.curveBasis);
        const ln = d3.line().x((_, k) => x(d.xs[k])).y((v) => base - v * amp).curve(d3.curveBasis);
        const g = gR.append('g').attr('class', 'rg');
        g.append('path').attr('d', ar(d.ys)).attr('fill', api.tok('bg'));
        g.append('path').attr('d', ln(d.ys)).attr('fill', 'none').attr('stroke', d === worst ? api.tok('accent') : api.tok('fg')).attr('stroke-width', d === worst ? 3 : 1.8).attr('stroke-linejoin', 'round');
        if (i % 3 === 0) g.append('text').attr('x', m.l - 14).attr('y', base).attr('text-anchor', 'end').attr('fill', api.tok('fg-2')).style('font', api.font('mono', 19, 500)).text(String(d.hr).padStart(2, '0') + ' h');
      });
      const ax = svg.append('g').style('font', api.font('mono', 19, 500)).attr('fill', api.tok('fg-2'));
      [0, 20, 40, 60, 80, 100].forEach((v) => ax.append('text').attr('x', x(v)).attr('y', H - 16).attr('text-anchor', 'middle').text(v + (v === 100 ? ' ms' : '')));
      const wb = m.t + worst.hr * step;
      svg.append('text').attr('x', x(64)).attr('y', wb - amp * 0.42 - 12).attr('fill', api.tok('accent-ink')).attr('stroke', api.tok('bg')).attr('stroke-width', 7).attr('paint-order', 'stroke').style('font', api.font('mono', 20, 600)).text(`${String(worst.hr).padStart(2, '0')} h · cola de ${Math.round(worst.busy * 100)} %`);
    },
    play(api) {
      if (!window.gsap) return;
      gsap.fromTo(api.qa('.rg'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: api.dur / 1000, stagger: 0.04, ease: 'power3.out' });
    },
  });

  /* =================================================================
     CALENDARIO DE COMMITS
     ================================================================= */
  const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const DIA = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
  function commits() {
    const R = Motor.util.rng(2026), end = new Date(); end.setHours(12, 0, 0, 0);
    const start = new Date(end); start.setDate(start.getDate() - 52 * 7 - ((end.getDay() + 6) % 7));
    const days = [], hours = Array.from({ length: 7 }, () => new Array(24).fill(0));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const wd = (d.getDay() + 6) % 7, mo = d.getMonth();
      let lam = wd < 5 ? 4.2 : 1.1; if (mo === 7) lam *= 0.18; if (mo === 2 || mo === 9) lam *= 1.5;
      if (R() < 0.12) lam = 0;
      let n = 0; const L = Math.exp(-lam); let p = 1; do { n++; p *= R(); } while (p > L); n -= 1;
      days.push({ date: new Date(d), wd, n });
      for (let k = 0; k < n; k++) { const hr = Math.min(23, Math.max(0, Math.round(wd < 5 ? 10.5 + R.normal() * 3.4 + (R() < 0.25 ? 9 : 0) : 17 + R.normal() * 3))); hours[wd][hr]++; }
    }
    return { days, hours };
  }
  Motor.fx('calendar', {
    render(api) {
      const d3 = window.d3, { days, hours } = commits();
      const body = api.q('[data-role="body"]');
      body.innerHTML = `<div class="fx" data-role="cal" style="height:270px"></div><div class="cal-bottom"><div class="fx" data-role="punch"></div><div class="stack" data-role="stats"></div></div>`;
      const host = api.q('[data-role="cal"]'), W = 1664, H = 270;
      const svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const L = 76, T = 40, cw = Math.floor((W - L) / 53), cs = cw - 5;
      const max = d3.max(days, (d) => d.n), lv = (n) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
      const fillL = (l) => (l === 0 ? api.tok('bg-3') : api.seq(0.2 + l * 0.2));
      const r = Math.min(cs / 2, parseFloat(api.tok('radius')) / 3 + 2);
      const start = days[0].date;
      days.forEach((d, i) => {
        const wk = Math.floor((i + ((start.getDay() + 6) % 7)) / 7);
        svg.append('rect').attr('class', 'cc').attr('data-w', wk).attr('x', L + wk * cw).attr('y', T + d.wd * cw).attr('width', cs).attr('height', cs).attr('rx', r).attr('fill', fillL(lv(d.n))).attr('stroke', lv(d.n) === 0 ? api.tok('line') : 'none')
          .append('title').text(`${d.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}: ${d.n} commits`);
        if (d.date.getDate() === 1 || i === 0) svg.append('text').attr('x', L + wk * cw).attr('y', T - 12).attr('fill', api.tok('fg-2')).style('font', api.font('mono', 19, 500)).text(MES[d.date.getMonth()]);
      });
      [0, 2, 4].forEach((k) => svg.append('text').attr('x', L - 12).attr('y', T + k * cw + cs / 2).attr('dy', '0.35em').attr('text-anchor', 'end').attr('fill', api.tok('fg-2')).style('font', api.font('mono', 19, 500)).text(DIA[k]));
      const lg = svg.append('g').attr('transform', `translate(${W - 330},${T + 7 * cw + 12})`).style('font', api.font('mono', 19, 500)).attr('fill', api.tok('fg-2'));
      lg.append('text').attr('x', 0).attr('y', 14).text('menos');
      [0, 1, 2, 3, 4].forEach((l) => lg.append('rect').attr('x', 70 + l * (cs + 5)).attr('y', 0).attr('width', cs).attr('height', cs).attr('rx', r).attr('fill', fillL(l)).attr('stroke', l === 0 ? api.tok('line') : 'none'));
      lg.append('text').attr('x', 70 + 5 * (cs + 5) + 6).attr('y', 14).text('más');
      // tarjeta perforada: día × hora
      const ph = api.q('[data-role="punch"]'), PW = ph.clientWidth || 1100, PH = ph.clientHeight || 300;
      const ps = d3.select(ph).append('svg').attr('viewBox', `0 0 ${PW} ${PH}`);
      const pl = 70, pt = 10, pcw = (PW - pl - 10) / 24, pch = (PH - pt - 34) / 7, hm = d3.max(hours.flat());
      hours.forEach((row, wd) => {
        ps.append('text').attr('x', pl - 12).attr('y', pt + wd * pch + pch / 2).attr('dy', '0.35em').attr('text-anchor', 'end').attr('fill', api.tok('fg-2')).style('font', api.font('mono', 18, 500)).text(DIA[wd]);
        row.forEach((n, hr) => { if (!n) return; ps.append('circle').attr('class', 'pc').attr('cx', pl + hr * pcw + pcw / 2).attr('cy', pt + wd * pch + pch / 2).attr('r', Math.max(2, Math.sqrt(n / hm) * Math.min(pcw, pch) * 0.46)).attr('fill', api.tok('accent')).attr('opacity', 0.85); });
      });
      [0, 6, 12, 18, 23].forEach((hr) => ps.append('text').attr('x', pl + hr * pcw + pcw / 2).attr('y', PH - 6).attr('text-anchor', 'middle').attr('fill', api.tok('fg-2')).style('font', api.font('mono', 18, 500)).text(hr + ' h'));
      // estadísticas calculadas
      const total = d3.sum(days, (d) => d.n), active = days.filter((d) => d.n).length;
      let best = 0, cur = 0; days.forEach((d) => { cur = d.n ? cur + 1 : 0; best = Math.max(best, cur); });
      const byWd = DIA.map((_, k) => d3.sum(days.filter((d) => d.wd === k), (d) => d.n)), topWd = DIA[byWd.indexOf(Math.max(...byWd))];
      api.q('[data-role="stats"]').innerHTML = [['commits en el año', total.toLocaleString('es-ES')], ['días con actividad', `${active} de ${days.length}`], ['racha más larga', best + ' días'], ['día más activo', topWd]].map(([a, b]) => `<div><p class="label">${a}</p><p class="value">${b}</p></div>`).join('') + '<p class="note">Datos sintéticos; agosto, casi en pausa.</p>';
    },
    play(api) {
      if (!window.gsap) return;
      gsap.fromTo(api.qa('.cc'), { opacity: 0 }, { opacity: 1, duration: 0.35, delay: (i, t) => +t.dataset.w * 0.025 });
      gsap.fromTo(api.qa('.pc'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, stagger: 0.004, delay: 0.8, ease: 'back.out(2)' });
    },
  });

  /* =================================================================
     SANKEY DEL PIPELINE DE DATOS
     ================================================================= */
  const FLOW = {
    nodes: ['rosbag de cámara', 'rosbag de LiDAR', 'CSV de sensores', 'logs del sistema', 'ingesta', 'descartado', 'limpieza', 'anotación', 'features tabulares', 'train', 'validación', 'test'],
    links: [[0, 4, 420], [1, 4, 180], [2, 4, 40], [3, 4, 20], [4, 5, 70], [4, 6, 590], [6, 7, 380], [6, 8, 210], [7, 9, 266], [7, 10, 57], [7, 11, 57], [8, 9, 147], [8, 10, 31.5], [8, 11, 31.5]],
  };
  Motor.fx('sankey', {
    render(api) {
      const host = api.q('[data-role="flow"]'); host.querySelectorAll('svg').forEach((s) => s.remove());
      const W = 1664, H = 630, d3 = window.d3;
      const svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      if (!d3.sankey) return;
      const cats = api.cats(6);
      const sk = d3.sankey().nodeWidth(16).nodePadding(30).nodeAlign(d3.sankeyJustify).extent([[10, 20], [W - 250, H - 20]]);
      const g = sk({ nodes: FLOW.nodes.map((name, i) => ({ name, i })), links: FLOW.links.map(([s, t, v]) => ({ source: s, target: t, value: v })) });
      const nodeCol = (n) => (n.i <= 3 ? cats[n.i] : n.i === 5 ? api.tok('err') : n.i === 7 ? cats[4] : n.i === 8 ? cats[5] : api.tok('fg-2'));
      const linkCol = (l) => (l.target.i === 5 ? api.tok('err') : l.source.i <= 3 ? cats[l.source.i] : l.target.i === 7 || l.source.i === 7 ? cats[4] : l.target.i === 8 || l.source.i === 8 ? cats[5] : api.tok('fg-3'));
      svg.append('g').selectAll('path').data(g.links).join('path').attr('class', 'lk')
        .attr('d', d3.sankeyLinkHorizontal()).attr('fill', 'none').attr('stroke', linkCol).attr('stroke-opacity', (l) => (l.target.i === 5 ? 0.4 : api.dark ? 0.45 : 0.4)).attr('stroke-width', (l) => Math.max(1, l.width))
        .append('title').text((l) => `${l.source.name} → ${l.target.name}: ${l.value} GB`);
      const nd = svg.append('g').selectAll('g').data(g.nodes).join('g');
      nd.append('rect').attr('x', (n) => n.x0).attr('y', (n) => n.y0).attr('width', (n) => n.x1 - n.x0).attr('height', (n) => Math.max(2, n.y1 - n.y0)).attr('rx', 3).attr('fill', nodeCol);
      const halo = (t) => t.attr('stroke', api.tok('bg')).attr('stroke-width', 6).attr('stroke-linejoin', 'round').attr('paint-order', 'stroke');
      halo(nd.append('text').attr('x', (n) => n.x1 + 12).attr('y', (n) => (n.y0 + n.y1) / 2 - 12).attr('fill', api.tok('fg')).style('font', api.font('text', 24, 600)).text((n) => n.name));
      halo(nd.append('text').attr('x', (n) => n.x1 + 12).attr('y', (n) => (n.y0 + n.y1) / 2 + 16).attr('fill', api.tok('fg-2')).style('font', api.font('mono', 20, 500)).text((n) => `${+n.value.toFixed(1)} GB`));
    },
    play(api) {
      if (!window.gsap) return;
      api.qa('.lk').forEach((p) => { const L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: api.dur / 600, delay: (p.__data__ ? p.__data__.source.depth : 0) * 0.25, ease: 'power2.inOut', onComplete: () => { p.style.strokeDasharray = ''; } }); });
    },
  });

  /* =================================================================
     PANEL DE INDICADORES (tabla con sparklines al estilo Tufte)
     ================================================================= */
  const KPI = [
    { n: 'Latencia de inferencia p95', u: 'ms', base: 41, amp: 4, noise: 2.2, dec: 0, warn: (v) => v > 48, good: 'estable' },
    { n: 'FPS del detector', u: 'fps', base: 28.4, amp: 1.2, noise: 0.8, dec: 1, warn: (v) => v < 25, good: 'estable' },
    { n: 'mAP@0.5 en validación', u: '', base: 0.86, amp: 0.008, noise: 0.004, trend: 0.0006, dec: 3, warn: (v) => v < 0.8, good: 'mejora' },
    { n: 'Uso de GPU', u: '%', base: 72, amp: 9, noise: 5, dec: 0, warn: (v) => v > 85, good: 'normal' },
    { n: 'Distancia recorrida al día', u: 'km', base: 3.6, amp: 0.7, noise: 0.5, dec: 1, warn: () => false, good: 'normal' },
    { n: 'Intervenciones manuales', u: '/día', base: 2.2, amp: 0.8, noise: 0.9, trend: -0.03, dec: 0, warn: (v) => v > 4, good: 'baja' },
  ];
  Motor.fx('kpis', {
    render(api) {
      const R = api.rng(30);
      const rows = KPI.map((k) => { const s = Array.from({ length: 30 }, (_, i) => Math.max(0, k.base + Math.sin(i / 3.2) * k.amp + R.normal() * k.noise + (k.trend || 0) * i)); return { k, s }; });
      rows[3].s[27] = 94; rows[3].s[28] = 91; rows[3].s[29] = 88;
      const fmt = (v, d) => v.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
      api.q('[data-role="body"]').innerHTML = `
        <table class="kpi-table">
          <thead><tr><th>Indicador</th><th class="r">Hoy</th><th>Últimos 30 días</th><th class="r">Mín · máx</th><th>Estado</th></tr></thead>
          <tbody>${rows.map(({ k, s }) => {
            const v = s[s.length - 1], warn = k.warn(v);
            return `<tr><td class="n">${esc(k.n)}</td><td class="v">${fmt(v, k.dec)}<small>${k.u}</small></td><td class="s" data-s="${s.map((x) => x.toFixed(4)).join(',')}"></td><td class="r">${fmt(Math.min(...s), k.dec)} · ${fmt(Math.max(...s), k.dec)}</td><td><span class="st" style="--c:var(${warn ? '--warn' : '--ok'})"><i></i>${warn ? 'vigilar' : k.good}</span></td></tr>`;
          }).join('')}</tbody>
        </table>
        <p class="note" style="margin-top:18px">Datos de ejemplo. Punto de color: valor de hoy; puntos huecos: mínimo y máximo del periodo.</p>`;
      const d3 = window.d3;
      api.qa('td.s').forEach((td) => {
        const s = td.dataset.s.split(',').map(Number), W = 420, H = 56;
        const x = d3.scaleLinear([0, s.length - 1], [6, W - 8]), y = d3.scaleLinear(d3.extent(s), [H - 6, 6]);
        const svg = d3.select(td).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
        svg.append('path').attr('d', d3.area().x((_, i) => x(i)).y0(H).y1((v) => y(v)).curve(d3.curveMonotoneX)(s)).attr('fill', color.alpha(api.tok('fg-3'), 0.12));
        svg.append('path').attr('class', 'sp').attr('d', d3.line().x((_, i) => x(i)).y((v) => y(v)).curve(d3.curveMonotoneX)(s)).attr('fill', 'none').attr('stroke', api.tok('fg-2')).attr('stroke-width', 2);
        const iMin = s.indexOf(Math.min(...s)), iMax = s.indexOf(Math.max(...s));
        [iMin, iMax].forEach((i) => svg.append('circle').attr('cx', x(i)).attr('cy', y(s[i])).attr('r', 4.5).attr('fill', api.tok('bg')).attr('stroke', api.tok('fg-2')).attr('stroke-width', 2));
        svg.append('circle').attr('cx', x(s.length - 1)).attr('cy', y(s[s.length - 1])).attr('r', 6).attr('fill', api.tok('accent'));
      });
    },
    play(api) {
      if (!window.gsap) return;
      api.qa('.sp').forEach((p, i) => { const L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: api.dur / 700, delay: i * 0.08, ease: 'power1.inOut' }); });
      gsap.fromTo(api.qa('.kpi-table tbody tr'), { opacity: 0.15 }, { opacity: 1, duration: 0.4, stagger: 0.07 });
    },
  });
})();
