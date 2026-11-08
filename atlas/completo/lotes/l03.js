/* Atlas Completo · L03 estilos y tokens. Las vistas previas son zonas con data-style y data-theme propios:
   los tokens y styles.css se aplican por atributo, no solo en <html>. */
(() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const num = (x, d = 2) => x.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
  const meta = (id) => (window.MOTOR_STYLES || []).find((s) => s.id === id);
  const modo = (api) => (api.dark ? 'dark' : 'light');

  // Vista previa de un estilo: una .slide anidada (inerte) con el decorado de la diapositiva y la plantilla.
  function vista(api, id, titulo) {
    const m = meta(id), l = document.createElement('div');
    l.className = 'slide is-active ac-prev-lienzo';
    l.dataset.style = id; l.dataset.theme = modo(api);
    l.setAttribute('inert', ''); l.setAttribute('aria-hidden', 'true');
    const deco = api.q(':scope > .deco'); if (deco) l.appendChild(deco.cloneNode(true));
    l.appendChild(document.getElementById('ac-plantilla-estilo').content.cloneNode(true));
    l.querySelector('.kicker').textContent = (m ? m.full : id).toLowerCase();
    l.querySelector('.s-title').textContent = titulo || (m ? m.name : id);
    return l;
  }

  Motor.fx('ac-estilo', {
    render(api) {
      const id = api.el.dataset.estilo, m = meta(id), host = api.q('[data-role="prev"]');
      host.innerHTML = ''; host.appendChild(vista(api, id, 'Título de muestra'));
      api.q('[data-role="ambiente"]').innerHTML = m
        ? `<b>${esc(m.mood)}</b> ${esc(m.harmony)}<br><span>Fuentes: ${esc(Object.values(m.fontNames).filter((v, i, a) => a.indexOf(v) === i).join(' + '))} · movimiento ${esc(m.motion.dur)}: ${esc(m.motion.easeNote)}</span>`
        : 'Estilo no incluido en MOTOR_PICK.';
    },
  });

  /* ---------- tokens de rol con su nombre en la paleta de origen y su contraste ---------- */
  const ROLES = ['bg', 'bg-2', 'bg-3', 'fg', 'fg-2', 'fg-3', 'line', 'line-2', 'accent', 'accent-2', 'accent-3', 'on-accent', 'ok', 'warn', 'err', 'accent-ink'];
  const TEXTO = new Set(['fg', 'fg-2', 'fg-3', 'accent-ink', 'ok', 'warn', 'err']);
  Motor.fx('ac-roles', {
    render(api) {
      const m = meta(api.style), md = m && m.modes[modo(api)], bg = api.tok('bg');
      api.q('[data-role="roles"]').innerHTML = ROLES.map((r) => {
        const v = api.tok(r), nombre = md && md.names[r] ? md.names[r] : '';
        const c = TEXTO.has(r) ? Motor.color.contrast(v, bg) : null;
        return `<span class="ac-sw" style="background:var(--${r})"></span><code>--${r}</code><code class="v">${esc(v)}</code><span class="n">${esc(nombre)}</span>` +
          `<span class="c">${c ? `${num(c, 1)} ${Motor.color.wcag(c)}` : ''}</span>`;
      }).join('');
      api.q('[data-role="nota"]').innerHTML = `${esc(m ? m.full : api.style)}, modo ${api.dark ? 'oscuro' : 'claro'}. La tercera columna es el nombre del color en la paleta de origen; la cuarta, el contraste sobre <code>--bg</code> de los tokens que se usan como texto.`;
    },
  });

  /* ---------- forma, fuentes y movimiento ---------- */
  Motor.fx('ac-forma', {
    render(api) {
      const m = meta(api.style) || { fontNames: {}, motion: {} };
      api.q('[data-role="fuentes"]').innerHTML = ['display', 'text', 'mono', 'serif'].map((r) =>
        `<p style="font-family:var(--font-${r})"><code>--font-${r}</code><span>${esc(m.fontNames[r] || getComputedStyle(api.el).getPropertyValue('--font-' + r).split(',')[0].replace(/'/g, ''))}</span></p>`).join('');
      api.q('[data-role="mov"]').innerHTML = `--dur <b>${esc(api.tok('dur'))}</b> · --ease <b>${esc(api.tok('ease'))}</b><br>${esc(m.motion.easeNote || '')}`;
      const b = api.q('[data-role="bola"]'); b.style.transition = 'none'; b.style.left = 'calc(100% - 56px)';
    },
    play(api) {
      const b = api.q('[data-role="bola"]');
      const ida = (der) => {
        b.style.transition = `left ${api.tok('dur')} ${api.tok('ease')}`;
        b.style.left = der ? 'calc(100% - 56px)' : '0px';
        api.after(api.dur + 900, () => ida(!der));
      };
      b.style.transition = 'none'; b.style.left = '0px';
      api.after(400, () => ida(true));
    },
    stop(api) { const b = api.q('[data-role="bola"]'); b.style.transition = 'none'; b.style.left = 'calc(100% - 56px)'; },
  });

  /* ---------- paletas: series de la paleta de origen frente a las ajustadas por build-themes ---------- */
  Motor.fx('ac-paletas-src', {
    render(api) {
      const m = meta(api.style), md = m && m.modes[modo(api)];
      if (!md) return;
      const C = Motor.color;
      const fila = (cs, titulo) => {
        const L = cs.map((c) => C.oklch(c)[0]), cv = cs.slice(0, -1).map((c, i) => C.cvd(c, cs[i + 1]));
        const rango = Math.max(...L) - Math.min(...L);
        return `<p class="label">${titulo}</p><div class="ac-serie">${cs.map((c, i) => `<span style="background:${c}"><code>L ${num(L[i], 2)}</code></span>`).join('')}</div>` +
          `<p class="ac-estado mono">luminosidad: rango <b>${num(rango, 3)}</b> · ΔE daltonismo mínimo entre vecinas: <b>${num(Math.min(...cv), 1)}</b> ${Math.min(...cv) >= 8 ? '(≥ 8, cumple)' : '(< 8)'}</p>`;
      };
      api.q('[data-role="antes"]').innerHTML =
        fila(md.sourceCats, `paleta de origen (${esc(m.full)}): sourceCats`) +
        fila(md.cats, 'tras build-themes: --cat-1 … --cat-6') +
        `<p class="note">build-themes iguala la luminosidad OKLCH (rango casi nulo) y reordena las series para que las vecinas se separen al menos ΔE 8 con protanopía y deuteranopía.</p>`;
    },
  });

  /* ---------- metadatos del estilo activo ---------- */
  Motor.fx('ac-meta', {
    render(api) {
      const m = meta(api.style); if (!m) return;
      const filas = [['id', m.id], ['name · full', `${m.name} · ${m.full}`], ['mood', m.mood], ['harmony', m.harmony], ['itten', m.itten.join(' · ')],
        ['refs', m.refs.join(' · ')], ['fontNames', Object.entries(m.fontNames).map(([k, v]) => `${k} ${v}`).join(' · ')], ['motion', `${m.motion.dur} · ${m.motion.ease}`],
        ['modes', `light, dark: names, roles, raw, cats, sourceCats`]];
      api.q('[data-role="meta"]').innerHTML = `<dt class="t">window.MOTOR_STYLES[${(window.MOTOR_STYLES || []).indexOf(m)}]</dt>` +
        filas.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
    },
  });

  /* ---------- resumen: los diez estilos a la vez ---------- */
  Motor.fx('ac-resumen-estilos', {
    render(api) {
      const host = api.q('[data-role="diez"]'); host.innerHTML = '';
      (window.MOTOR_STYLES || []).forEach((m) => {
        const f = document.createElement('figure'); f.className = 'ac-mini-estilo';
        f.appendChild(vista(api, m.id, m.name));
        const cap = document.createElement('figcaption'); cap.innerHTML = `<b>${esc(m.name)}</b> ${esc(m.full.split('·')[1] || '')}`;
        f.appendChild(cap); host.appendChild(f);
      });
    },
  });
})();
