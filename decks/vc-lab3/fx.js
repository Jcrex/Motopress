/* vc-lab3 · efectos propios */
(() => {
  /* l3-swap: fftshift intercambia los cuadrantes en diagonal. render() deja el estado final; play() mueve cada cuadrante desde su sitio original. */
  Motor.fx('l3-swap', {
    render(api) { (api._l3 || []).forEach((a) => a.cancel()); api._l3 = []; },
    play(api) {
      api._l3 = [];
      api.qa('.quad.swap > div').forEach((t) => {
        const w = t.offsetWidth + 8, h = t.offsetHeight + 8;
        const dx = +t.dataset.dx * w, dy = +t.dataset.dy * h;
        try { api._l3.push(t.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 1300, delay: 900, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'backwards' })); } catch (e) { /* estado final visible */ }
      });
      api.qa('[data-seq]').forEach((e) => {
        try { api._l3.push(e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 300 + 700 * +e.dataset.seq, fill: 'backwards' })); } catch (err) { /* idem */ }
      });
    },
    stop(api) { (api._l3 || []).forEach((a) => a.cancel()); api._l3 = []; },
  });
})();
