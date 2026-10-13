/* Efectos de Arch + Hyprland: escritorio en mosaico (dwindle) y ficha tipo fastfetch. */
(() => {
  const { color } = Motor;
  const TAU = Math.PI * 2;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const LOG = [
    ['$', 'ros2 launch atlas_bringup robot.launch.py'],
    ['INFO', '[launch]: Default logging verbosity is set to INFO'],
    ['INFO', '[robot_state_publisher-1]: process started with pid [2141]'],
    ['INFO', '[lidar_driver-2]: process started with pid [2143]'],
    ['INFO', '[slam_toolbox-3]: process started with pid [2145]'],
    ['INFO', '[lidar_driver]: publicando /scan a 10 Hz'],
    ['INFO', '[slam_toolbox]: mapa actualizado (0.05 m/celda)'],
    ['INFO', '[planner_server]: ruta calculada en 38 ms'],
    ['WARN', '[controller_server]: obstáculo a 0.6 m, se reduce la velocidad'],
    ['INFO', '[controller_server]: objetivo alcanzado'],
    ['INFO', '[yolo_detector]: 3 objetos en /detections'],
  ];
  const CODE = [
    ['k', 'import'], [' rclpy\n'],
    ['k', 'from'], [' rclpy.node '], ['k', 'import'], [' Node\n'],
    ['k', 'from'], [' nav_msgs.msg '], ['k', 'import'], [' OccupancyGrid, Path\n\n'],
    ['k', 'class'], [' '], ['f', 'Planner'], ['(Node):\n'],
    ['    '], ['k', 'def'], [' '], ['f', '__init__'], ['(self):\n'],
    ['        '], ['f', 'super'], ['().__init__('], ['s', "'planner'"], [')\n'],
    ['        self.'], ['f', 'create_subscription'], ['(\n'],
    ['            OccupancyGrid, '], ['s', "'/map'"], [', self.on_map, '], ['n', '1'], [')\n'],
    ['        self.pub = self.'], ['f', 'create_publisher'], ['(Path, '], ['s', "'/plan'"], [', '], ['n', '1'], [')'],
  ];
  function lineHtml([lvl, txt]) {
    if (lvl === '$') return `<span style="color:var(--accent-ink)">❯</span> ${esc(txt)}`;
    return `<span style="color:var(${lvl === 'WARN' ? '--warn' : '--ok'})">[${lvl}]</span> ${esc(txt)}`;
  }

  Motor.fx('desktop', {
    render(api) {
      const body = api.q('[data-role="desk"]');
      const sections = ['1', '2', '3', '4', '5', '6'];
      const codeHtml = CODE.map(([a, b]) => (b === undefined ? esc(a) : `<span style="color:var(${a === 'k' ? '--accent-ink' : a === 'f' ? '--accent-2-ink' : a === 's' ? '--accent-3-ink' : '--accent-3-ink'})">${esc(b)}</span>`)).join('');
      const nums = codeHtml.split('\n').map((l, i) => `<span style="color:var(--fg-3)">${String(i + 1).padStart(2, ' ')}</span>  ${l}`).join('\n');
      body.innerHTML = `
        <div class="hy">
          <div class="hy-bar">
            <div class="hy-ws">${sections.map((s) => `<b class="${s === '3' ? 'on' : ''}">${s}</b>`).join('')}</div>
            <div class="hy-title">kitty · ros2 launch</div>
            <div class="hy-sys"><span>cpu <b data-k="cpu">18 %</b></span><span>mem 6,1 G</span><span data-k="clock">--:--</span></div>
          </div>
          <div class="hy-tiles">
            <section class="win is-focus hy-a"><div class="win-bar"><span class="dot"></span>kitty · ~/ros2_ws</div><div class="win-body"><pre class="term" data-k="log">${LOG.map(lineHtml).join('\n')}</pre></div></section>
            <section class="win hy-b"><div class="win-bar"><span class="dot"></span>nvim · planner.py</div><div class="win-body"><pre class="term code">${nums}</pre></div></section>
            <section class="win hy-c"><div class="win-bar"><span class="dot"></span>btop</div><div class="win-body fx" data-k="btop"></div></section>
            <section class="win hy-d"><div class="win-bar"><span class="dot"></span>rviz2</div><div class="win-body fx" data-k="rviz"></div></section>
          </div>
        </div>`;
      const d = new Date(); api.q('[data-k="clock"]').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      api.B = { ...api.canvas(api.q('[data-k="btop"]')), hist: Array.from({ length: 60 }, (_, i) => 30 + 20 * Math.sin(i / 6)) };
      api.V = { ...api.canvas(api.q('[data-k="rviz"]')), pts: rvizCloud() };
      drawBtop(api, 0); drawRviz(api, 0);
    },
    play(api) {
      const log = api.q('[data-k="log"]'), wins = api.qa('.hy .win');
      let shown = 1; log.innerHTML = lineHtml(LOG[0]);
      let lastLine = 0, lastFocus = 0, fi = 0, lastB = 0;
      api.raf((t) => {
        if (t - lastLine > 520 && shown < LOG.length) { lastLine = t; shown++; log.innerHTML = LOG.slice(0, shown).map(lineHtml).join('\n'); }
        if (t - lastFocus > 3200) { lastFocus = t; fi = (fi + 1) % wins.length; wins.forEach((w, i) => w.classList.toggle('is-focus', i === fi)); const titles = ['kitty · ros2 launch', 'nvim · planner.py', 'btop', 'rviz2']; api.q('.hy-title').textContent = titles[fi]; }
        if (t - lastB > 120) { lastB = t; drawBtop(api, t); const c = api.q('[data-k="cpu"]'); if (c) c.textContent = Math.round(api.B.hist[api.B.hist.length - 1]) + ' %'; }
        drawRviz(api, t);
      });
    },
    stop(api) { api.qa('.hy .win').forEach((w, i) => w.classList.toggle('is-focus', i === 0)); },
  });
  function drawBtop(api, t) {
    const { ctx, w, h, hist } = api.B;
    if (t) { hist.shift(); hist.push(Math.max(4, Math.min(96, hist[hist.length - 1] + (Math.sin(t / 700) * 6 + (Math.random() - 0.5) * 14)))); }
    ctx.clearRect(0, 0, w, h);
    const cats = api.cats(6), gh = h * 0.55;
    ctx.font = api.font('mono', 17, 500); ctx.fillStyle = api.tok('fg-2'); ctx.fillText('cpu', 4, 16);
    ctx.beginPath(); ctx.moveTo(0, gh);
    hist.forEach((v, i) => ctx.lineTo((i / (hist.length - 1)) * w, gh - (v / 100) * (gh - 26)));
    ctx.lineTo(w, gh); ctx.closePath();
    const g = ctx.createLinearGradient(0, 26, 0, gh); g.addColorStop(0, api.seq(0.95)); g.addColorStop(1, color.alpha(api.seq(0.4), 0.15));
    ctx.fillStyle = g; ctx.fill();
    const n = 8, bw = (w - (n - 1) * 6) / n;
    for (let i = 0; i < n; i++) {
      const v = 0.2 + 0.75 * Math.abs(Math.sin(t / 900 + i * 1.7)) * (0.6 + 0.4 * Math.sin(i));
      const bh = (h - gh - 22) * v;
      ctx.fillStyle = api.tok('bg-3'); ctx.fillRect(i * (bw + 6), gh + 14, bw, h - gh - 22);
      ctx.fillStyle = cats[i % 6]; ctx.fillRect(i * (bw + 6), h - 8 - bh, bw, bh);
    }
  }
  function rvizCloud() {
    const R = Motor.util.rng(8), pts = [];
    for (let i = 0; i < 520; i++) { const a = R() * TAU, r = 1.6 + R() * 0.15 + (Math.abs(Math.sin(a * 2)) > 0.9 ? -0.6 : 0); pts.push([Math.cos(a) * r, Math.sin(a) * r, R() * 0.5]); }
    return pts;
  }
  function drawRviz(api, t) {
    const { ctx, w, h, pts } = api.V;
    ctx.clearRect(0, 0, w, h);
    const yaw = t / 3000, cx = w / 2, cy = h * 0.58, sc = Math.min(w, h) * 0.24;
    const P = ([x, y, z]) => { const xr = x * Math.cos(yaw) - y * Math.sin(yaw), yr = x * Math.sin(yaw) + y * Math.cos(yaw); return [cx + xr * sc, cy + yr * sc * 0.45 - z * sc * 0.8]; };
    ctx.strokeStyle = api.tok('line'); ctx.lineWidth = 1;
    for (let g = -2; g <= 2; g += 0.5) { let a = P([g, -2, 0]), b = P([g, 2, 0]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); a = P([-2, g, 0]); b = P([2, g, 0]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
    pts.forEach((p) => { const [x, y] = P(p); ctx.fillStyle = api.seq(0.35 + p[2] * 1.2); ctx.fillRect(x - 1.5, y - 1.5, 3, 3); });
    const o = P([0, 0, 0]);
    [['x', [0.7, 0, 0]], ['y', [0, 0.7, 0]], ['z', [0, 0, 0.7]]].forEach(([k, v]) => { const e = P(v); ctx.strokeStyle = api.tok(k); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...o); ctx.lineTo(...e); ctx.stroke(); });
  }

  /* =================================================================
     FICHA DEL SISTEMA (estilo fastfetch)
     ================================================================= */
  const ART = String.raw`
        .------------.
       /   _      _   \
      |   (o)    (o)   |
      |       /\       |
       \    '----'    /
     .--'------------'--.
    /|   [  ROS  2  ]   |\
   / |    __________    | \
  *  |   |__________|   |  *
     '----.--------.----'
         _|_      _|_
        (___)    (___)`.slice(1);
  Motor.fx('fetch', {
    render(api) {
      const meta = api.meta, M = meta.modes[api.dark ? 'dark' : 'light'];
      const info = [['SO', 'Arch Linux x86_64'], ['WM', 'Hyprland'], ['Config.', 'HyDE'], ['Tema', meta.full], ['Terminal', 'kitty'], ['Shell', 'zsh'], ['Editor', 'Neovim'], ['ROS 2', 'Jazzy Jalisco'], ['Python', '3.12'], ['Fuentes', `${meta.fontNames.display} · ${meta.fontNames.mono}`]];
      api.q('[data-role="term"]').innerHTML = `
        <section class="win is-focus"><div class="win-bar"><span class="dot"></span>kitty · ~</div>
          <div class="win-body">
            <pre class="term" data-k="cmd"><span style="color:var(--accent-ink)">❯</span> fastfetch</pre>
            <div class="ff">
              <pre class="art">${esc(ART)}</pre>
              <div>
                <pre class="info"><b>robot</b>@<b>atlas</b>
${'─'.repeat(22)}
${info.map(([k, v]) => `<b>${k.padEnd(9, ' ')}</b> ${esc(v)}`).join('\n')}</pre>
                <div class="blocks">${M.raw.slice(0, 12).map((c) => `<i style="background:${c}"></i>`).join('')}</div>
              </div>
            </div>
            <p class="note" style="position:absolute;right:28px;bottom:18px">Valores de ejemplo</p>
          </div>
        </section>`;
    },
    play(api) {
      if (!window.gsap) return;
      const lines = api.q('.info');
      gsap.fromTo(api.q('.art'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: api.dur / 1000, delay: 0.3 });
      gsap.fromTo(lines, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, delay: 0.5, ease: 'steps(12)' });
      gsap.fromTo(api.qa('.blocks i'), { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.3, stagger: 0.04, delay: 1.5 });
    },
  });
})();
