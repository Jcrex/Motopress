/* Efectos de prueba de la fase 0: pintor WebGL2 y aviso de paso. */
(() => {
  // Pintor GLSL 3.00 (solo WebGL2): degradado que ondula entre accent y accent-2. Respaldo 2D: degradado lineal.
  const FS = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uT; uniform vec3 uA, uB; out vec4 o;
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  float k = .5 + .5*sin(uv.x*6. + uT*.6 + sin(uv.y*4. - uT*.4)*1.5);
  float a = smoothstep(.35, 1., uv.x)*.55;
  o = vec4(mix(uA, uB, k)*a, a);
}`;
  Motor.painters['prueba-gl2'] = {
    init(s) { s.last = 0; },
    frame(s, api, t, still) {
      const G = Motor.gl;
      if (G.throttle(s, t, still)) return;
      const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
      const L = G.layer(s, G.scale(s, 0.6, 1));
      const pg = L && G.program(L, 'prueba-gl2', G.VS_FULL, FS);
      s.host.dataset.gl = pg ? (L.gl2 ? 'webgl2' : 'webgl') : '2d';
      if (pg) { G.drawFull(L, pg, { uRes: [L.W, L.H], uT: t, uA: Motor.color.parse(api.tok('accent')), uB: Motor.color.parse(api.tok('accent-2')) }); return; }
      const g = ctx.createLinearGradient(w * 0.35, 0, w, 0);
      g.addColorStop(0, Motor.color.alpha(api.tok('accent'), 0)); g.addColorStop(1, Motor.color.alpha(api.tok('accent-2'), 0.5));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    },
  };

  // Contador de pasos: render() pinta el estado de api.step; step() lo actualiza al avanzar o retroceder.
  const paint = (api, n) => {
    api.q('[data-role="n"]').textContent = `${n} / ${api.steps}`;
    api.qa('[data-role="bar"] i').forEach((b, i) => b.classList.toggle('hit', i < n));
  };
  Motor.fx('pasos-prueba', {
    render(api) {
      api.q('[data-role="bar"]').innerHTML = Array.from({ length: api.steps }, () => '<i></i>').join('');
      paint(api, api.step);
    },
    step(api, n) { paint(api, n); },
  });
})();
