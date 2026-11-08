/* Atlas Completo · L04 transiciones. Las transiciones dependen de :root[data-style]: para enseñar la de un estilo,
   <html> pasa a ese estilo (sin guardarlo) mientras dura la animación y después se restaura con Motor.setStyle. */
(() => {
  const root = document.documentElement;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const nombre = (id) => ((window.MOTOR_STYLES || []).find((s) => s.id === id) || { name: id }).name;

  /* ---------- reglas reales de styles.css, leídas con CSSOM ---------- */
  function reglas() {
    const out = [];
    const recorre = (lista) => { for (const r of lista) { out.push(r); if (r.cssRules) recorre(r.cssRules); } };
    for (const sh of document.styleSheets) { try { recorre(sh.cssRules); } catch (e) { /* hoja de otro origen */ } }
    return out;
  }
  function cssDe(estilo) {
    const rs = reglas(), sel = `[data-style="${estilo}"]`;
    const vt = rs.filter((r) => r.selectorText && r.selectorText.includes(sel) && r.selectorText.includes('::view-transition'));
    // animationName no se resuelve si la forma corta lleva var(): se buscan los @keyframes existentes en el texto de la regla
    const todos = rs.filter((r) => r.type === CSSRule.KEYFRAMES_RULE);
    const kf = todos.filter((k) => vt.some((r) => new RegExp(`(^|[\\s:,])${k.name}([\\s;,]|$)`).test(r.cssText)));
    const nombres = new Set(kf.map((k) => k.name));
    return { reglas: vt, keyframes: kf, nombres: [...nombres] };
  }
  const bonito = (txt) => txt.replace(/:root\[data-style="[a-z]+"\]/g, ':root[…]').replace(/\s*\{\s*/g, ' { ').replace(/;\s*/g, '; ').replace(/\s*\}\s*/g, ' }\n').replace(/\n\s*\n/g, '\n');

  /* ---------- reproducir la transición de un estilo ---------- */
  let ocupado = false;
  function ver(estilo, dir, slide) {
    if (ocupado) return;
    ocupado = true;
    const previo = root.dataset.style, pantalla = slide.querySelector('[data-role="pantalla"]'), estado = slide.querySelector('[data-role="estado"]');
    const swap = () => {
      if (!pantalla) return;
      const b = pantalla.classList.toggle('b');
      pantalla.innerHTML = `<span>${b ? 'B' : 'A'}</span>`;
    };
    const fin = () => {
      ocupado = false;
      if (estilo !== previo) Motor.setStyle(previo);
    };
    const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.dataset.style = estilo; root.dataset.dir = dir;
    if (!document.startViewTransition || reducido) {
      swap(); if (estado) estado.textContent = reducido ? 'movimiento reducido: cambio directo' : 'sin View Transitions: cambio directo';
      setTimeout(fin, 600); return;
    }
    if (estado) estado.textContent = `<html data-style="${estilo}" data-dir="${dir}">`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try {
        const vt = document.startViewTransition(swap);
        vt.finished.catch(() => {}).finally(() => setTimeout(fin, 250));
      } catch (e) { swap(); fin(); }
    }));
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-vt]'); if (!b) return;
    const slide = b.closest('.slide');
    ver(b.dataset.vtEstilo || slide.dataset.estilo || root.dataset.style, b.dataset.vt, slide);
    b.blur();
  });

  /* ---------- mecanismo ---------- */
  Motor.fx('ac-vt', {
    render(api) {
      const r = matchMedia('(prefers-reduced-motion: reduce)').matches;
      api.q('[data-role="estado"]').innerHTML = `startViewTransition: <b>${'startViewTransition' in document ? 'disponible' : 'no disponible'}</b> · &lt;html class="has-vt"&gt;: <b>${root.classList.contains('has-vt')}</b> · movimiento reducido: <b>${r}</b> · estilo activo: <b>${esc(api.style)}</b>`;
    },
  });

  /* ---------- una transición ---------- */
  Motor.fx('ac-transicion', {
    render(api) {
      const id = api.el.dataset.estilo, c = cssDe(id);
      const pantalla = api.q('[data-role="pantalla"]'); pantalla.classList.remove('b'); pantalla.innerHTML = '<span>A</span>';
      api.q('[data-role="css"]').textContent = c.reglas.length
        ? bonito(c.reglas.map((r) => r.cssText).join('\n')) + bonito(c.keyframes.map((k) => k.cssText).join('\n'))
        : 'No se encontraron reglas ::view-transition para este estilo.';
      api.q('[data-role="estado"]').textContent = '';
    },
  });

  /* ---------- resumen ---------- */
  Motor.fx('ac-resumen-vt', {
    render(api) {
      api.q('[data-role="tabla"]').innerHTML = (window.MOTOR_STYLES || []).map((m) => {
        const c = cssDe(m.id);
        return `<button type="button" class="ac-btn" data-vt="next" data-vt-estilo="${m.id}"><b>${esc(m.name)}</b><code>${esc(c.nombres.join(' · ') || '—')}</code></button>`;
      }).join('');
    },
  });
})();
