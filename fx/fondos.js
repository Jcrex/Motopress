/* Fondos generativos de los estilos candidatos.
   Cromo, Arcilla y Nube dibujan con WebGL (con respaldo en 2D si no hay contexto);
   Térmica, Célula y Matriz usan canvas 2D. Se registran en Motor.painters y los usa el efecto «backdrop». */
(() => {
  const { color, util } = Motor;
  const TAU = Math.PI * 2;
  const P = Motor.painters;
  Object.assign(Motor.titleEase, { cromo: null, arcilla: 'back.out(2.2)', nube: 'power2.out', termica: null, celula: 'sine.out', matriz: 'steps(4)' });
  const rgb = (hex) => color.parse(hex);
  const lin = (hex) => color.parse(hex).map((c) => Math.pow(c, 2.2));
  const smooth = (a, b, x) => { const t = util.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  // limita a ~30 fps los fondos caros; los estados quietos (render) siempre se dibujan
  const throttle = (s, t, still, fps = 30) => { if (still) return false; if (s.last && t - s.last < 1 / fps && t >= s.last) return true; s.last = t; return false; };

  /* ------------------------------------------------------------------ WebGL */
  const VS_FULL = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  function glLayer(s, scale) {
    let cv = s.host.querySelector(':scope > canvas.gl');
    if (!cv) { cv = document.createElement('canvas'); cv.className = 'gl'; cv.setAttribute('aria-hidden', 'true'); s.host.insertBefore(cv, s.host.firstChild); }
    const W = Math.max(2, Math.round(s.w * scale)), H = Math.max(2, Math.round(s.h * scale));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    if (!('_gl' in cv)) {
      let gl = null;
      try { gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false }); } catch (e) { gl = null; }
      cv._gl = gl; cv._progs = {};
    }
    const gl = cv._gl;
    if (!gl || gl.isContextLost()) { cv.style.display = 'none'; return null; }
    cv.style.display = '';
    gl.viewport(0, 0, W, H);
    return { gl, cv, W, H };
  }
  function program(L, key, vs, fs) {
    const { gl, cv } = L;
    if (key in cv._progs) return cv._progs[key];
    const mk = (type, src) => {
      const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn('[motor] shader ' + key + ': ' + gl.getShaderInfoLog(o)); return null; }
      return o;
    };
    let out = null;
    const v = mk(gl.VERTEX_SHADER, vs), f = mk(gl.FRAGMENT_SHADER, fs);
    if (v && f) {
      const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
      if (gl.getProgramParameter(pr, gl.LINK_STATUS)) {
        const u = {};
        for (let i = 0, n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS); i < n; i++) { const a = gl.getActiveUniform(pr, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(pr, a.name); }
        out = { pr, u };
      } else console.warn('[motor] link ' + key + ': ' + gl.getProgramInfoLog(pr));
    }
    cv._progs[key] = out;
    return out;
  }
  function uniforms(gl, pg, vals) {
    for (const k in vals) {
      const loc = pg.u[k]; if (!loc) continue;
      const v = vals[k];
      if (typeof v === 'number') gl.uniform1f(loc, v);
      else if (v.length === 2) gl.uniform2fv(loc, v);
      else if (v.length === 3) gl.uniform3fv(loc, v);
      else if (v.length === 16 && k.startsWith('uM')) gl.uniformMatrix4fv(loc, false, v);
      else gl.uniform3fv(loc, v);
    }
  }
  function drawFull(L, pg, vals) {
    const { gl, cv } = L;
    if (!cv._quad) { cv._quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, cv._quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); }
    gl.useProgram(pg.pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, cv._quad);
    const loc = gl.getAttribLocation(pg.pr, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.BLEND);
    uniforms(gl, pg, vals);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  // resolución del lienzo WebGL: proporcional a la pantalla, con techo por coste del sombreador
  const glScale = (s, k, max = 1.5) => Math.min(max, Math.max(0.35, (s.ratio || 1) * k));

  /* ============================================================ CROMO */
  const FS_CROMO = `precision highp float;
uniform vec2 uRes; uniform float uT, uDark; uniform vec3 uAcc, uAcc2;
float smin(float a, float b, float k){ float h = clamp(.5 + .5*(b - a)/k, 0., 1.); return mix(b, a, h) - k*h*(1. - h); }
vec3 c0, c1, c2, c3, c4, c5;
void setup(float t){
  c0 = vec3(1.38 + .20*sin(t*.31), .04 + .18*cos(t*.27), 0.);
  c1 = vec3(1.95 + .16*sin(t*.43 + 1.), -.50 + .16*sin(t*.37), .25);
  c2 = vec3(1.02 + .16*cos(t*.39 + 2.), -.56 + .14*cos(t*.33 + 1.), -.15);
  c3 = vec3(1.92 + .16*cos(t*.29 + 4.), .56 + .16*sin(t*.41 + 2.), -.2);
  c4 = vec3(1.08 + .18*sin(t*.23 + 3.), .64 + .12*cos(t*.47), .15);
  c5 = vec3(2.30 + .08*sin(t*.5), .05 + .2*sin(t*.35 + .5), .3);
}
float lime(vec3 p){ return length(p - c4) - .23; }
float map(vec3 p){
  float d = length(p - c0) - .54;
  d = smin(d, length(p - c1) - .33, .32);
  d = smin(d, length(p - c2) - .27, .32);
  d = smin(d, length(p - c3) - .30, .32);
  d = smin(d, lime(p), .27);
  d = smin(d, length(p - c5) - .15, .25);
  return d;
}
vec3 nrm(vec3 p){ vec2 e = vec2(.0015, 0.); return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx))); }
float spot(vec3 r, vec3 d, float a, float b){ return smoothstep(a, b, dot(r, normalize(d))); }
vec3 env(vec3 r){
  float y = r.y;
  vec3 top = mix(vec3(.96, .97, .99), vec3(.24, .25, .28), uDark);
  vec3 hor = mix(vec3(.56, .58, .62), vec3(.05, .05, .06), uDark);
  vec3 flo = mix(vec3(.14, .15, .17), vec3(.012), uDark);
  vec3 c = y > 0. ? mix(hor, top, pow(y, .5)) : mix(hor, flo, pow(-y, .35));
  c += 2.3*spot(r, vec3(-.55, .65, .55), .86, .93);
  c += 1.5*spot(r, vec3(.2, .9, -.4), .80, .90);
  c += 1.3*smoothstep(.66, .76, r.x)*smoothstep(.55, .2, abs(y - .08));
  c += .8*smoothstep(.70, .80, -r.x)*smoothstep(.5, .15, abs(y - .3))*smoothstep(-.2, .3, r.z);
  c += 1.0*exp(-abs(y + .02)*38.);
  c += uAcc*1.6*spot(r, vec3(-.9, -.12, .35), .94, .975);
  c += uAcc2*.45*smoothstep(-.15, -.65, y);
  return c;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  setup(uT);
  vec3 ro = vec3(0., 0., 5.), rd = normalize(vec3(uv, -1.6));
  float t = 2.6, d = 1., md = 1e3; vec3 pm = ro; bool hit = false;
  for (int i = 0; i < 90; i++) {
    vec3 p = ro + rd*t; d = map(p);
    if (d < md) { md = d; pm = p; }
    if (d < .0012) { hit = true; break; }
    if (t > 8.) break;
    t += d;
  }
  float px = 3.125/uRes.y;
  float a = hit ? 1. : 1. - smoothstep(0., px*1.5, md);
  if (a <= 0.) { gl_FragColor = vec4(0.); return; }
  vec3 n = nrm(pm), v = -rd;
  float fr = pow(1. - max(dot(n, v), 0.), 4.);
  vec3 col = env(reflect(rd, n))*mix(vec3(.80, .84, .90), vec3(1.), fr);
  vec3 ir = .5 + .5*cos(6.2831*(vec3(0., .33, .67) + fr*1.3 + dot(n, vec3(.3, .5, .2)) + uT*.03));
  col = mix(col, col*ir*1.7, .22*fr + .06);
  float lm = 1. - smoothstep(0., .22, lime(pm));
  col = mix(col, col*uAcc*1.5 + uAcc*.06, lm);
  col = 1. - exp(-col*1.25);
  gl_FragColor = vec4(col*a, a);
}`;
  P.cromo = {
    init(s) { s.last = 0; },
    frame(s, api, t, still) {
      if (throttle(s, t, still)) return;
      const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
      const L = glLayer(s, glScale(s, 0.7, 1.0));
      const pg = L && program(L, 'cromo', VS_FULL, FS_CROMO);
      if (pg) { drawFull(L, pg, { uRes: [L.W, L.H], uT: t, uDark: api.dark ? 1 : 0, uAcc: rgb(api.tok('accent')), uAcc2: rgb(api.tok('accent-2')) }); return; }
      // respaldo 2D: esferas con degradado metálico
      [[0.77, 0.5, 190], [0.89, 0.67, 120], [0.69, 0.68, 96], [0.88, 0.3, 108], [0.7, 0.28, 80, true]].forEach(([x, y, r, lm]) => {
        const g = ctx.createRadialGradient(x * w - r * 0.35, y * h - r * 0.4, r * 0.1, x * w, y * h, r);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, lm ? api.tok('accent') : '#9aa1ab'); g.addColorStop(0.8, '#2a2e35'); g.addColorStop(1, api.dark ? '#d9dde3' : '#5b616b');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x * w, y * h, r, 0, TAU); ctx.fill();
      });
    },
  };

  /* ============================================================ ARCILLA */
  const FS_ARCILLA = `precision highp float;
uniform vec2 uRes; uniform float uT, uDark;
uniform vec3 uBg, uBody, uAcc, uAcc2, uAcc3, uZ;
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sdCyl(vec3 p, float r, float h){ vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.) + length(max(d, 0.)); }
float rcyl(vec3 p, float r, float h, float rr){ return sdCyl(p, r - rr, h - rr) - rr; }
float sdCap(vec3 p, vec3 a, vec3 b, float r){ vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba)/dot(ba, ba), 0., 1.); return length(pa - ba*h) - r; }
float sdRBox(vec3 p, vec3 b, float r){ vec3 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.) - r; }
float sdTorus(vec3 p, vec2 t){ vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
vec3 S, El, Wr, D2, N2; float A0;
void rig(float t){
  A0 = .55*sin(t*.35);
  float a1 = .62 + .16*sin(t*.5), a2 = 1.2 + .22*sin(t*.7 + 1.);
  S = vec3(0., .52, 0.);
  El = S + .92*vec3(sin(a1), cos(a1), 0.);
  D2 = vec3(sin(a1 + a2), cos(a1 + a2), 0.);
  Wr = El + .78*D2;
  N2 = vec3(cos(a1 + a2), -sin(a1 + a2), 0.);
}
vec2 opU(vec2 a, vec2 b){ return a.x < b.x ? a : b; }
vec2 objs(vec3 p){
  vec2 r = vec2(rcyl(p - vec3(0., .09, 0.), .46, .09, .05), 2.);
  vec3 q = p; q.xz = rot(A0)*q.xz;
  r = opU(r, vec2(rcyl(q - vec3(0., .30, 0.), .25, .14, .07), 2.));
  r = opU(r, vec2(length(q - S) - .17, 3.));
  r = opU(r, vec2(sdCap(q, S, El, .11), 2.));
  r = opU(r, vec2(length(q - El) - .14, 3.));
  r = opU(r, vec2(sdCap(q, El, Wr, .085), 2.));
  r = opU(r, vec2(length(q - Wr) - .1, 3.));
  r = opU(r, vec2(sdCap(q, Wr + N2*.07, Wr + N2*.07 + D2*.22, .035), 4.));
  r = opU(r, vec2(sdCap(q, Wr - N2*.07, Wr - N2*.07 + D2*.22, .035), 4.));
  vec3 b = p - vec3(1.1, .2, .5); b.xz = rot(.5)*b.xz;
  r = opU(r, vec2(sdRBox(b, vec3(.2), .07), 5.));
  r = opU(r, vec2(length(p - vec3(-1.6, .25, -.6)) - .25, 4.));
  r = opU(r, vec2(sdTorus(p - vec3(.2, .075, -1.4), vec2(.28, .075)), 6.));
  return r;
}
float shadow(vec3 ro, vec3 rd){
  float res = 1., t = .02;
  for (int i = 0; i < 28; i++) { float h = objs(ro + rd*t).x; res = min(res, 9.*h/t); t += clamp(h, .02, .25); if (res < .005 || t > 4.) break; }
  return clamp(res, 0., 1.);
}
float occ(vec3 p, vec3 n){
  float o = 0., s = 1.;
  for (int i = 0; i < 5; i++) { float h = .02 + .1*float(i); vec3 q = p + n*h; float d = min(objs(q).x, q.y); o += (h - d)*s; s *= .7; }
  return clamp(1. - 2.2*o, 0., 1.);
}
vec3 shadeObj(vec3 p, vec3 rd, float m, vec3 L){
  vec2 e = vec2(.001, 0.);
  vec3 n = normalize(vec3(objs(p + e.xyy).x - objs(p - e.xyy).x, objs(p + e.yxy).x - objs(p - e.yxy).x, objs(p + e.yyx).x - objs(p - e.yyx).x));
  vec3 alb = m < 2.5 ? uBody : m < 3.5 ? uAcc : m < 4.5 ? uAcc3 : m < 5.5 ? uAcc2 : uZ;
  float wrap = pow(clamp(dot(n, L)*.5 + .5, 0., 1.), 1.5);
  float sh = shadow(p + n*.003, L), oc = occ(p, n);
  float fr = pow(1. - max(dot(n, -rd), 0.), 3.);
  vec3 li = vec3(1., .96, .9)*1.2*wrap*mix(.35, 1., sh) + mix(uBg, vec3(.35, .3, .26), uDark)*.6*(.5 + .5*n.y)*oc + .1*fr;
  vec3 col = alb*li*mix(.55, 1., oc);
  return col + alb*mix(uBg, vec3(.2, .15, .1), uDark)*.12*clamp(.5 - .5*n.y, 0., 1.);
}
vec3 shadeFloor(vec3 ro, vec3 rd, float tf, vec3 L){
  if (tf > 1e4) return uBg;
  vec3 p = ro + rd*tf;
  float near = step(length(p.xz), 3.4);
  float sh = near > .5 ? shadow(p + vec3(0., .001, 0.), L) : 1.;
  float oc = near > .5 ? occ(p, vec3(0., 1., 0.)) : 1.;
  vec3 col = uBg*mix(.6, 1., sh)*mix(.72, 1., oc);
  col += uDark*vec3(1., .85, .7)*.035*exp(-dot(p.xz, p.xz)*.2)*sh;
  return mix(col, uBg, smoothstep(5., 10., tf));
}
void main(){
  vec2 uv = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  uv.x -= .44;
  rig(uT);
  float ang = .7 + .08*sin(uT*.12);
  vec3 ta = vec3(.3, .55, 0.), ro = ta + vec3(sin(ang)*4.3, 2.2, cos(ang)*4.3);
  vec3 cf = normalize(ta - ro), cr = normalize(cross(cf, vec3(0., 1., 0.))), cu = cross(cr, cf);
  vec3 rd = normalize(uv.x*cr + uv.y*cu + 2.0*cf);
  vec3 L = normalize(vec3(-.5, .85, .35));
  float tf = rd.y < 0. ? -ro.y/rd.y : 1e5;
  float t = .5, md = 1e3, tm = 0.; vec2 h = vec2(1., 0.); bool hit = false;
  float tmax = min(tf, 12.);
  for (int i = 0; i < 90; i++) {
    h = objs(ro + rd*t);
    if (h.x < md) { md = h.x; tm = t; }
    if (h.x < .001) { hit = true; break; }
    t += h.x; if (t > tmax) break;
  }
  vec3 col;
  if (hit) col = shadeObj(ro + rd*t, rd, h.y, L);
  else {
    col = shadeFloor(ro, rd, tf, L);
    float pw = 1.2*tm/(2.*uRes.y);
    if (md < pw) { vec3 q = ro + rd*tm; col = mix(col, shadeObj(q, rd, objs(q).y, L), 1. - smoothstep(0., pw, md)); }
  }
  gl_FragColor = vec4(pow(max(col, 0.), vec3(1./2.2)), 1.);
}`;
  P.arcilla = {
    init(s) { s.last = 0; },
    frame(s, api, t, still) {
      if (throttle(s, t, still, 20)) return;
      const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
      const L = glLayer(s, glScale(s, 0.5, 0.6));
      const pg = L && program(L, 'arcilla', VS_FULL, FS_ARCILLA);
      if (pg) {
        drawFull(L, pg, {
          uRes: [L.W, L.H], uT: t, uDark: api.dark ? 1 : 0, uBg: lin(api.tok('bg')),
          uBody: lin(api.dark ? color.mix(api.tok('fg'), api.tok('bg'), 0.25) : api.tok('bg-3')),
          uAcc: lin(api.tok('accent')), uAcc2: lin(api.tok('accent-2')), uAcc3: lin(api.tok('accent-3')), uZ: lin(api.tok('z')),
        });
        return;
      }
      // respaldo 2D: formas blandas con sombra
      const col = [api.tok('bg-3'), api.tok('accent'), api.tok('accent-2'), api.tok('accent-3')];
      [[0.78, 0.62, 150, 0], [0.86, 0.42, 70, 1], [0.66, 0.74, 60, 3], [0.93, 0.76, 64, 2]].forEach(([x, y, r, c]) => {
        ctx.fillStyle = color.alpha('#000000', api.dark ? 0.4 : 0.12); ctx.beginPath(); ctx.ellipse(x * w + 20, y * h + r * 0.95, r * 1.05, r * 0.25, 0, 0, TAU); ctx.fill();
        const g = ctx.createRadialGradient(x * w - r * 0.4, y * h - r * 0.4, r * 0.1, x * w, y * h, r);
        g.addColorStop(0, color.mix(col[c], '#ffffff', 0.35)); g.addColorStop(1, color.mix(col[c], '#000000', 0.25));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x * w, y * h, r, 0, TAU); ctx.fill();
      });
    },
  };

  /* ============================================================ NUBE */
  // Escaneo LiDAR simulado: 16 canales × 900 azimuts desde tres poses de una sala con objetos.
  let scanCache = null;
  function scanScene() {
    if (scanCache) return scanCache;
    const R = util.rng(7);
    const boxes = [[2.1, 1.7, 0.375, 0.6, 0.35, 0.375], [-4.3, -0.6, 0.9, 0.2, 1.0, 0.9], [1.3, -2.1, 0.3, 0.3, 0.3, 0.3], [1.95, -2.35, 0.25, 0.25, 0.25, 0.25], [1.6, -2.2, 0.85, 0.22, 0.22, 0.25], [2.9, -0.3, 0.2, 0.32, 0.24, 0.2], [-1.2, -2.6, 0.45, 0.8, 0.3, 0.45]];
    const cyls = [[-1.0, 1.9, 0.25, 0, 2.6], [2.9, -0.3, 0.09, 0.4, 0.55], [-2.6, 0.2, 0.18, 0, 1.72]];
    const room = [-5.2, 5.2, -3.8, 3.8, 2.7];
    const poses = [[0, 0.2, 0.45], [-2.4, 1.0, 0.45], [3.4, 1.4, 0.45]];
    const slab = (ox, oy, oz, dx, dy, dz, b) => {
      let t0 = -1e9, t1 = 1e9;
      const o = [ox, oy, oz], d = [dx, dy, dz];
      for (let k = 0; k < 3; k++) {
        const lo = b[k] - b[k + 3], hi = b[k] + b[k + 3];
        if (Math.abs(d[k]) < 1e-9) { if (o[k] < lo || o[k] > hi) return -1; continue; }
        let a = (lo - o[k]) / d[k], c = (hi - o[k]) / d[k]; if (a > c) [a, c] = [c, a];
        t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) return -1;
      }
      return t0;
    };
    const cyl = (ox, oy, oz, dx, dy, dz, c) => {
      const fx = ox - c[0], fy = oy - c[1], a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), k = fx * fx + fy * fy - c[2] * c[2];
      const disc = b * b - 4 * a * k; if (disc < 0 || a < 1e-9) return -1;
      const t = (-b - Math.sqrt(disc)) / (2 * a), z = oz + dz * t;
      return z >= c[3] && z <= c[4] ? t : -1;
    };
    const pts = [], info = [];
    poses.forEach(([ox, oy, oz], si) => {
      for (let ch = 0; ch < 16; ch++) {
        const el = ((-15 + ch * 2) * Math.PI) / 180;
        for (let k = 0; k < 900; k++) {
          const az = (k / 900) * TAU;
          const dx = Math.cos(el) * Math.cos(az), dy = Math.cos(el) * Math.sin(az), dz = Math.sin(el);
          let tb = 40;
          if (dz < 0) tb = Math.min(tb, -oz / dz);
          if (dx > 0) tb = Math.min(tb, (room[1] - ox) / dx); else if (dx < 0) tb = Math.min(tb, (room[0] - ox) / dx);
          if (dy > 0) tb = Math.min(tb, (room[3] - oy) / dy); else if (dy < 0) tb = Math.min(tb, (room[2] - oy) / dy);
          for (const b of boxes) { const t = slab(ox, oy, oz, dx, dy, dz, b); if (t > 0.05 && t < tb) tb = t; }
          for (const c of cyls) { const t = cyl(ox, oy, oz, dx, dy, dz, c); if (t > 0.05 && t < tb) tb = t; }
          const z = oz + dz * tb;
          if (z > room[4] || tb > 39) continue;
          const n = 0.014;
          pts.push(ox + dx * tb + (R() - 0.5) * n, oy + dy * tb + (R() - 0.5) * n, z + (R() - 0.5) * n);
          info.push(az, si);
        }
      }
    });
    scanCache = { pts: new Float32Array(pts), info: new Float32Array(info), poses, n: pts.length / 3 };
    return scanCache;
  }
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  function mat(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
  function nubeMatrix(w, h, t) {
    const yaw = -0.9 + t * 0.05, pitch = 0.62, dist = 17.5, ta = [0, 0, 0.5];
    const e = [ta[0] + dist * Math.cos(pitch) * Math.cos(yaw), ta[1] + dist * Math.cos(pitch) * Math.sin(yaw), ta[2] + dist * Math.sin(pitch)];
    const z = norm(sub(e, ta)), x = norm(cross([0, 0, 1], z)), y = cross(z, x);
    const V = [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
    const f = 1 / Math.tan((36 * Math.PI) / 360), n = 0.5, far = 60, asp = w / h;
    const Pm = [f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + n) / (n - far), -1, 0, 0, (2 * far * n) / (n - far), 0];
    const T = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.44, 0, 0, 1];
    const M = mat(T, mat(Pm, V)); M.cam = [Math.cos(yaw), Math.sin(yaw)]; return M;
  }
  function project(M, p, w, h) {
    const x = M[0] * p[0] + M[4] * p[1] + M[8] * p[2] + M[12], y = M[1] * p[0] + M[5] * p[1] + M[9] * p[2] + M[13], ww = M[3] * p[0] + M[7] * p[1] + M[11] * p[2] + M[15];
    return [(x / ww * 0.5 + 0.5) * w, (1 - (y / ww * 0.5 + 0.5)) * h, ww];
  }
  const VS_NUBE = `attribute vec3 aP; attribute vec2 aI;
uniform mat4 uM; uniform float uSize, uSweep, uDark, uZmax; uniform vec3 uRamp[10]; uniform vec2 uCam;
varying vec3 vC; varying float vA;
vec3 ramp(float x){
  x = clamp(x, 0., 1.)*9.; float i = floor(x), f = x - i; vec3 a = uRamp[0], b = uRamp[0];
  for (int k = 0; k < 10; k++) { if (float(k) == i) a = uRamp[k]; if (float(k) == min(i + 1., 9.)) b = uRamp[k]; }
  return mix(a, b, f);
}
void main(){
  vec4 c = uM*vec4(aP, 1.);
  gl_Position = c;
  gl_PointSize = clamp(uSize*15./c.w, 1., uSize*2.4);
  vec3 col = ramp(.08 + .9*aP.z/uZmax);
  float d = abs(mod(aI.x - uSweep + 3.14159, 6.28318) - 3.14159);
  float glow = exp(-d*d*60.)*step(aI.y, .5);
  col = mix(col*mix(.72, 1., uDark), mix(vec3(1.), col*.6, 1. - uDark), glow*.7);
  float fade = smoothstep(-.3, .25, c.x/c.w);
  float cut = aP.z > .14 && dot(aP.xy, uCam) > 2.2 ? .07 : 1.;
  vC = col; vA = (mix(.92, .8, uDark) + .2*glow)*fade*cut;
}`;
  const FS_NUBE = `precision mediump float; varying vec3 vC; varying float vA;
void main(){ vec2 q = gl_PointCoord - .5; if (dot(q, q) > .25) discard; float a = min(vA, 1.); gl_FragColor = vec4(vC*a, a); }`;
  P.nube = {
    init(s) { s.last = 0; s.scan = scanScene(); },
    frame(s, api, t, still) {
      if (throttle(s, t, still)) return;
      const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
      const sc = s.scan, M = nubeMatrix(w, h, t), sweep = (t * 1.3) % TAU;
      const ramp = (api.meta.modes[api.dark ? 'dark' : 'light'].raw || []).slice(0, 10).map(rgb);
      const L = glLayer(s, Math.min(2, s.ratio || 1));
      const pg = L && program(L, 'nube', VS_NUBE, FS_NUBE);
      if (pg && ramp.length === 10) {
        const { gl, cv } = L;
        if (!cv._nube) {
          const bp = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bp); gl.bufferData(gl.ARRAY_BUFFER, sc.pts, gl.STATIC_DRAW);
          const bi = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bi); gl.bufferData(gl.ARRAY_BUFFER, sc.info, gl.STATIC_DRAW);
          cv._nube = { bp, bi };
        }
        gl.useProgram(pg.pr);
        const aP = gl.getAttribLocation(pg.pr, 'aP'), aI = gl.getAttribLocation(pg.pr, 'aI');
        gl.bindBuffer(gl.ARRAY_BUFFER, cv._nube.bp); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cv._nube.bi); gl.enableVertexAttribArray(aI); gl.vertexAttribPointer(aI, 2, gl.FLOAT, false, 0, 0);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        uniforms(gl, pg, { uM: Array.from(M), uSize: 1.7 * (L.W / w), uSweep: sweep, uDark: api.dark ? 1 : 0, uZmax: 2.7, uRamp: ramp.flat(), uCam: M.cam });
        gl.drawArrays(gl.POINTS, 0, sc.n);
        gl.disableVertexAttribArray(aI);
      } else {
        // respaldo 2D: uno de cada dos puntos, color por altura
        const raw = api.meta.modes[api.dark ? 'dark' : 'light'].raw;
        for (let i = 0; i < sc.n; i += 2) {
          const p = [sc.pts[i * 3], sc.pts[i * 3 + 1], sc.pts[i * 3 + 2]], q = project(M, p, w, h);
          if (q[2] <= 0 || q[0] < w * 0.32 || (p[2] > 0.14 && p[0] * M.cam[0] + p[1] * M.cam[1] > 2.2)) continue;
          ctx.fillStyle = raw[Math.min(9, Math.max(0, Math.round((0.08 + 0.9 * p[2] / 2.7) * 9)))];
          ctx.fillRect(q[0], q[1], 1.6, 1.6);
        }
      }
      // trayectoria entre poses y marco base_link
      const acc = api.tok('accent'), fg2 = api.tok('fg-2');
      const pp = sc.poses.map((p) => project(M, [p[0], p[1], 0.02], w, h));
      ctx.setLineDash([7, 7]); ctx.strokeStyle = color.alpha(acc, 0.9); ctx.lineWidth = 2;
      ctx.beginPath(); pp.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke(); ctx.setLineDash([]);
      pp.forEach((q) => { ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, TAU); ctx.fill(); });
      const o = sc.poses[0], O = project(M, o, w, h);
      [[api.tok('x'), [0.8, 0, 0]], [api.tok('y'), [0, 0.8, 0]], [api.tok('z'), [0, 0, 0.8]]].forEach(([c, d]) => {
        const q = project(M, [o[0] + d[0], o[1] + d[1], o[2] + d[2]], w, h);
        ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(O[0], O[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      });
      ctx.font = api.font('mono', 16, 400); ctx.fillStyle = fg2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.textAlign = 'right'; ctx.fillText('base_link', O[0] - 18, O[1] + 8);
    },
  };

  /* ============================================================ TÉRMICA */
  const IRON = [[0.12, '#1c0a4a'], [0.26, '#53108a'], [0.4, '#9a1a8c'], [0.54, '#d9334f'], [0.66, '#f2682a'], [0.78, '#fbaa23'], [0.9, '#fde26a'], [1, '#fffbe6']];
  function thermalLut(api) {
    const bg = rgb(api.tok('bg')), fg = rgb(api.tok('fg')), acc = rgb(api.tok('accent'));
    const lut = new Uint8ClampedArray(256 * 3);
    const stops = [[0, api.tok('bg')], ...IRON].map(([p, c]) => [p, rgb(c)]);
    for (let i = 0; i < 256; i++) {
      const v = i / 255; let c;
      if (api.dark) {
        let k = 0; while (k < stops.length - 2 && v > stops[k + 1][0]) k++;
        const [p0, c0] = stops[k], [p1, c1] = stops[k + 1], f = util.clamp((v - p0) / (p1 - p0), 0, 1);
        c = [0, 1, 2].map((j) => c0[j] + (c1[j] - c0[j]) * f);
      } else {
        const g = Math.pow(smooth(0.06, 0.95, v), 0.85);
        c = [0, 1, 2].map((j) => bg[j] + (fg[j] - bg[j]) * g);
        const m = smooth(0.6, 0.68, v);
        c = c.map((x, j) => x + (acc[j] - x) * m);
      }
      lut[i * 3] = c[0] * 255; lut[i * 3 + 1] = c[1] * 255; lut[i * 3 + 2] = c[2] * 255;
    }
    return lut;
  }
  const segDist = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, t = util.clamp(((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy), 0, 1); return Math.hypot(px - ax - vx * t, py - ay - vy * t); };
  const rboxDist = (x, y, cx, cy, hw, hh, r) => { const qx = Math.abs(x - cx) - hw + r, qy = Math.abs(y - cy) - hh + r; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r; };
  const solid = (d, T, soft = 10) => T * (1 - smooth(-soft, soft, d));
  P.termica = {
    init(s, api) {
      s.last = 0; s.gw = 240; s.gh = 135;
      s.field = new Float32Array(s.gw * s.gh);
      s.off = document.createElement('canvas'); s.off.width = s.gw; s.off.height = s.gh;
      s.img = s.off.getContext('2d').createImageData(s.gw, s.gh);
      s.lut = thermalLut(api); s.n = api.noise2(s.seed + 3);
    },
    frame(s, api, t, still) {
      if (throttle(s, t, still)) return;
      const { ctx, w, h, gw, gh, field, n } = s, cw = w / gw, ch = h / gh;
      // robot móvil con brazo: chasis, batería, ruedas con motor, LiDAR y articulaciones
      const bx = 0.79 * w, by = h - 190;
      const S = [bx + 70, by - 92];
      const a1 = -0.5 + 0.12 * Math.sin(t * 0.5), a2 = a1 + 1.85 + 0.2 * Math.sin(t * 0.7 + 1);
      const El = [S[0] + 230 * Math.sin(a1), S[1] - 230 * Math.cos(a1)], Wr = [El[0] + 190 * Math.sin(a2), El[1] - 190 * Math.cos(a2)];
      const puls = (k, ph) => 0.94 + 0.06 * Math.sin(t * k + ph);
      let mx = 0, mi = 0;
      for (let j = 0; j < gh; j++) {
        const y = (j + 0.5) * ch;
        for (let i = 0; i < gw; i++) {
          const x = (i + 0.5) * cw;
          // ambiente: pared fría a la izquierda, suelo templado, radiador en la pared del fondo
          let v = 0.03 + 0.12 * smooth(0.45 * w, 1.0 * w, x) + 0.1 * smooth(h - 260, h, y) * smooth(0.5 * w, 0.75 * w, x) + 0.025 * n(x * 0.005, y * 0.005);
          if (x > 0.865 * w && x < 0.965 * w && y > 0.1 * h && y < 0.36 * h) v = Math.max(v, (0.26 + 0.1 * Math.cos(x * 0.33)) * (1 - smooth(0.33 * h, 0.36 * h, y)));
          v += 0.16 * Math.exp(-(((x - bx) / 300) ** 2) - (((y - h + 40) / 50) ** 2)); // reflejo en el suelo
          // chasis con gradiente interno hacia la batería
          const dc = rboxDist(x, y, bx, by, 240, 74, 30);
          if (dc < 14) v = Math.max(v, solid(dc, 0.34, 10) + 0.14 * Math.exp(-(((x - bx - 70) / 190) ** 2) - (((y - by) / 70) ** 2)) * (dc < 0 ? 1 : 0));
          // batería: núcleo caliente
          const db = rboxDist(x, y, bx + 70, by + 4, 92, 40, 14);
          v = Math.max(v, solid(db, 0.5, 14) + 0.28 * puls(0.6, 0) * Math.exp(-(((x - bx - 70) / 60) ** 2) - (((y - by - 4) / 30) ** 2)));
          // ruedas: llanta templada y motor en el buje
          for (const wx of [bx - 160, bx + 160]) { const dw = Math.hypot(x - wx, y - (by + 86)); v = Math.max(v, solid(dw - 50, 0.38, 7) + 0.5 * puls(1.3, wx) * Math.exp(-(dw * dw) / 420)); }
          // LiDAR girando
          const dl = rboxDist(x, y, bx - 170, by - 100, 36, 24, 12);
          v = Math.max(v, solid(dl, 0.52, 6) + 0.38 * puls(2, 1) * Math.exp(-(((x - bx + 170) / 24) ** 2) - (((y - by + 100) / 16) ** 2)));
          // brazo: eslabones templados con eje más caliente, articulaciones con núcleo casi blanco
          const s1 = segDist(x, y, S[0], S[1], El[0], El[1]), s2 = segDist(x, y, El[0], El[1], Wr[0], Wr[1]);
          v = Math.max(v, solid(s1 - 24, 0.36, 7) + 0.1 * Math.exp(-((s1 / 10) ** 2)), solid(s2 - 19, 0.34, 7) + 0.1 * Math.exp(-((s2 / 8) ** 2)));
          for (const [p, T, r, k] of [[S, 0.5, 36, 1.7], [El, 0.46, 30, 1.3], [Wr, 0.42, 24, 2.1]]) {
            const dj = Math.hypot(x - p[0], y - p[1]);
            v = Math.max(v, solid(dj - r, T, 8) + 0.42 * puls(k, r) * Math.exp(-((dj / (r * 0.55)) ** 2)));
            v += 0.08 * Math.exp(-((dj / (r * 2.2)) ** 2));
          }
          // aire caliente que sube de la batería
          if (y < by - 30) v += 0.12 * Math.exp(-(((x - bx - 70 - 8 * Math.sin(y * 0.02 + t)) / 40) ** 2)) * (1 - smooth(by - 30, by - 340, y)) * (0.5 + 0.5 * n(x * 0.012, y * 0.012 + t * 0.9));
          v = Math.min(1, v);
          const k = j * gw + i; field[k] = v;
          if (v > mx && x > w * 0.5) { mx = v; mi = k; }
        }
      }
      const d = s.img.data, lut = s.lut;
      for (let k = 0; k < field.length; k++) { const q = Math.round(field[k] * 255) * 3; d[k * 4] = lut[q]; d[k * 4 + 1] = lut[q + 1]; d[k * 4 + 2] = lut[q + 2]; d[k * 4 + 3] = 255; }
      s.off.getContext('2d').putImageData(s.img, 0, 0);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, w, h); ctx.drawImage(s.off, 0, 0, w, h);
      // medidor de punto en el máximo y caja de medida sobre la batería
      const ink = api.dark ? '#ffffff' : api.tok('fg'), pad = api.dark ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.8)';
      const tc = (v) => (18 + v * 56).toFixed(1).replace('.', ',') + ' °C';
      const X = ((mi % gw) + 0.5) * cw, Y = (Math.floor(mi / gw) + 0.5) * ch;
      ctx.strokeStyle = ink; ctx.lineWidth = 2;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(X + a * 9, Y + b * 9); ctx.lineTo(X + a * 30, Y + b * 30); ctx.stroke(); });
      ctx.font = api.font('mono', 20, 500); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      const lab = (txt, x, y) => { const tw = ctx.measureText(txt).width; ctx.fillStyle = pad; ctx.fillRect(x - 8, y - 15, tw + 16, 30); ctx.fillStyle = ink; ctx.fillText(txt, x, y); };
      lab(tc(mx), X + 38, Y - 34);
      const B = [bx + 70, by + 4];
      ctx.setLineDash([6, 6]); ctx.strokeRect(B[0] - 112, B[1] - 58, 224, 116); ctx.setLineDash([]);
      lab('Batería ' + tc(field[Math.floor(B[1] / ch) * gw + Math.floor(B[0] / cw)] || 0), B[0] - 104, B[1] + 84);
    },
  };

  /* ============================================================ CÉLULA */
  const tissueCache = new Map();
  function tissue(api, D, R) {
    const inks = [api.tok('accent'), api.tok('accent-2'), api.tok('accent-3'), api.tok('fg')];
    const key = [D, R, api.dark, ...inks].join('|');
    if (tissueCache.has(key)) return tissueCache.get(key);
    if (tissueCache.size > 4) tissueCache.clear();
    const c = document.createElement('canvas'); c.width = Math.ceil(D * R); c.height = Math.ceil(D * R);
    const g = c.getContext('2d'); g.setTransform(R, 0, 0, R, 0, 0);
    const rnd = util.rng(11), nz = api.noise2(5);
    const sp = 66, cells = [];
    for (let y = sp / 2; y < D; y += sp * 0.87) for (let x = ((Math.round(y / sp) % 2) * sp) / 2; x < D + sp; x += sp) {
      cells.push({ x: x + (rnd() - 0.5) * sp * 0.7, y: y + (rnd() - 0.5) * sp * 0.7, r: sp * (0.38 + rnd() * 0.26), a: rnd() * TAU, k: rnd() });
    }
    const blob = (cl, f) => { g.beginPath(); for (let i = 0; i <= 22; i++) { const a = (i / 22) * TAU, rr = cl.r * f * (1 + 0.13 * nz(Math.cos(a) * 1.3 + cl.x * 0.01, Math.sin(a) * 1.3 + cl.y * 0.01)); const px = cl.x + Math.cos(a) * rr, py = cl.y + Math.sin(a) * rr; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); };
    const [a1, a2, a3, fg] = inks;
    if (api.dark) {
      g.globalCompositeOperation = 'lighter';
      cells.forEach((cl) => {
        // actina y membrana (magenta)
        blob(cl, 1); g.strokeStyle = color.alpha(a2, 0.3); g.lineWidth = 2.2; g.shadowColor = a2; g.shadowBlur = 8; g.stroke(); g.shadowBlur = 0;
        // citoesqueleto (verde)
        g.strokeStyle = color.alpha(a1, 0.34); g.lineWidth = 1.3;
        for (let k = 0; k < 9; k++) {
          const a = cl.a + (k / 8) * TAU + rnd() * 0.4, r0 = cl.r * 0.32, r1 = cl.r * (0.8 + rnd() * 0.15);
          g.beginPath(); g.moveTo(cl.x + Math.cos(a) * r0, cl.y + Math.sin(a) * r0);
          g.quadraticCurveTo(cl.x + Math.cos(a + 0.5) * cl.r * 0.6, cl.y + Math.sin(a + 0.5) * cl.r * 0.6, cl.x + Math.cos(a + 0.2) * r1, cl.y + Math.sin(a + 0.2) * r1); g.stroke();
        }
        // núcleo (azul), a veces dividiéndose
        const nuc = (x, y, r) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, color.alpha(color.mix(a3, '#ffffff', 0.55), 0.95)); gr.addColorStop(0.55, color.alpha(a3, 0.75)); gr.addColorStop(1, color.alpha(a3, 0)); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * 0.82, cl.a, 0, TAU); g.fill(); };
        if (cl.k < 0.07) { nuc(cl.x - cl.r * 0.22, cl.y, cl.r * 0.3); nuc(cl.x + cl.r * 0.22, cl.y, cl.r * 0.3); } else nuc(cl.x, cl.y, cl.r * 0.4);
        for (let k = 0; k < 4; k++) { const a = rnd() * TAU, r = cl.r * (0.5 + rnd() * 0.35); g.fillStyle = color.alpha(a1, 0.8); g.beginPath(); g.arc(cl.x + Math.cos(a) * r, cl.y + Math.sin(a) * r, 1.6, 0, TAU); g.fill(); }
      });
    } else {
      g.fillStyle = color.alpha(a1, 0.1); g.fillRect(0, 0, D, D);
      g.globalCompositeOperation = 'multiply';
      const eos = color.mix(a1, '#ffffff', 0.5);
      cells.forEach((cl) => {
        if (cl.k > 0.93) return; // luz entre células
        blob(cl, 0.96); g.fillStyle = color.alpha(eos, 0.55); g.fill();
        g.strokeStyle = color.alpha(a1, 0.35); g.lineWidth = 1.4; g.stroke();
        const dab = cl.k < 0.12, nc = dab ? a3 : a2;
        g.fillStyle = color.alpha(nc, 0.82); g.beginPath(); g.ellipse(cl.x, cl.y, cl.r * 0.36, cl.r * 0.29, cl.a, 0, TAU); g.fill();
        g.fillStyle = color.alpha(fg, 0.45);
        for (let k = 0; k < 7; k++) { const a = rnd() * TAU, r = rnd() * cl.r * 0.26; g.beginPath(); g.arc(cl.x + Math.cos(a) * r, cl.y + Math.sin(a) * r, 1.4 + rnd() * 1.4, 0, TAU); g.fill(); }
      });
      // vaso con hematíes
      g.globalCompositeOperation = 'source-over';
      for (let k = 0; k < 26; k++) {
        const u = k / 26, x = D * 0.15 + u * D * 0.7, y = D * 0.72 + Math.sin(u * 5) * 40 + (rnd() - 0.5) * 30;
        const gr = g.createRadialGradient(x, y, 2, x, y, 11); gr.addColorStop(0, color.mix(a1, '#ffffff', 0.25)); gr.addColorStop(1, color.alpha(color.mix(a1, '#d63a4f', 0.6), 0.95));
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, 10, 0, TAU); g.fill();
      }
    }
    const out = { c, cells, D };
    tissueCache.set(key, out);
    return out;
  }
  P.celula = {
    init(s, api) {
      s.last = 0; s.r = Math.round(0.35 * s.h); s.D = Math.round(s.r * 2.9);
      s.t = tissue(api, s.D, Math.min(2, s.ratio || 1));
      const R = api.rng(s.seed + 9);
      s.flash = Array.from({ length: 14 }, () => [Math.floor(R() * s.t.cells.length), R() * TAU, 0.4 + R() * 0.5]);
      s.ves = Array.from({ length: 70 }, () => [Math.floor(R() * s.t.cells.length), R() * TAU, (R() - 0.5) * 1.4, 0.45 + R() * 0.4]);
    },
    frame(s, api, t, still) {
      if (throttle(s, t, still)) return;
      const { ctx, w, h, r, D } = s, cx = 0.775 * w, cy = 0.47 * h, tz = s.t;
      ctx.clearRect(0, 0, w, h);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
      ctx.fillStyle = api.dark ? api.tok('bg-2') : color.mix(api.tok('bg-3'), api.tok('accent'), 0.05); ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      ctx.translate(cx, cy); ctx.rotate(t * 0.012); const k = 1.02 + 0.012 * Math.sin(t * 0.3); ctx.scale(k, k); ctx.translate(-D / 2, -D / 2);
      ctx.drawImage(tz.c, 0, 0, D, D);
      if (api.dark) {
        ctx.globalCompositeOperation = 'lighter';
        s.flash.forEach(([i, ph, sp]) => { const cl = tz.cells[i], a = Math.pow(Math.max(0, Math.sin(t * sp + ph)), 10); if (a < 0.02) return; const g = ctx.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, cl.r); g.addColorStop(0, color.alpha(api.tok('accent'), 0.55 * a)); g.addColorStop(1, color.alpha(api.tok('accent'), 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cl.x, cl.y, cl.r, 0, TAU); ctx.fill(); });
      }
      ctx.fillStyle = api.dark ? color.alpha(api.tok('accent'), 0.9) : color.alpha(api.tok('accent-2'), 0.7);
      s.ves.forEach(([i, a0, sp, rr]) => { const cl = tz.cells[i], a = a0 + t * sp; ctx.beginPath(); ctx.arc(cl.x + Math.cos(a) * cl.r * rr, cl.y + Math.sin(a) * cl.r * rr, 2.2, 0, TAU); ctx.fill(); });
      ctx.restore();
      // borde suave del campo, anillo del ocular, puntero y barra de escala
      const bg = api.tok('bg'), g = ctx.createRadialGradient(cx, cy, r - 60, cx, cy, r + 1);
      g.addColorStop(0, color.alpha(bg, 0)); g.addColorStop(1, color.alpha(bg, 1));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r + 1, 0, TAU); ctx.fill();
      ctx.strokeStyle = color.alpha(api.tok('fg-3'), 0.5); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r + 16, 0, TAU); ctx.stroke();
      ctx.strokeStyle = color.alpha(api.tok('fg'), 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + r * 0.97, cy - r * 0.2); ctx.lineTo(cx + r * 0.42, cy - r * 0.06); ctx.stroke();
      const bx = cx + r * 0.18, by = cy + r * 0.78;
      ctx.fillStyle = api.dark ? '#ffffff' : api.tok('fg'); ctx.fillRect(bx, by, 110, 5);
      ctx.font = api.font('mono', 17, 400); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText('20 µm', bx + 55, by - 8);
    },
  };

  /* ============================================================ MATRIZ */
  function ledSprite(hex, glow, R) {
    const S = 18, c = document.createElement('canvas'); c.width = c.height = Math.ceil(S * R);
    const g = c.getContext('2d'); g.setTransform(R, 0, 0, R, 0, 0);
    if (glow) { const gr = g.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2); gr.addColorStop(0, color.alpha(hex, 0.35)); gr.addColorStop(1, color.alpha(hex, 0)); g.fillStyle = gr; g.fillRect(0, 0, S, S); }
    g.fillStyle = hex; g.beginPath(); g.arc(S / 2, S / 2, 5.2, 0, TAU); g.fill();
    return c;
  }
  P.matriz = {
    init(s, api) {
      s.last = 0; const R = Math.min(2, s.ratio || 1);
      s.on = ledSprite(api.tok('fg'), api.dark, R); s.red = ledSprite(api.tok('accent'), api.dark, R);
    },
    frame(s, api, t, still) {
      if (throttle(s, t, still)) return;
      const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
      const pitch = 15, x0 = Math.round(w * 0.5), x1 = w - 84, y0 = 84, y1 = h - 84;
      const cx = 0.75 * w, cy = 0.47 * h, Rs = 265, Rr = 352;
      const la = t * 0.4, L = norm([Math.cos(la) * 0.9, 0.45, Math.sin(la) * 0.9 + 0.45]);
      const spin = t * 0.3, seg = t * 0.7, moon = -t * 0.32 + 2.4;
      const mx = cx + Math.cos(moon) * Rr, my = cy + Math.sin(moon) * Rr;
      const base = api.dark ? 0.07 : 0.09;
      for (let y = y0; y <= y1; y += pitch) for (let x = x0; x <= x1; x += pitch) {
        let b = base, red = false;
        const dx = (x - cx) / Rs, dy = (y - cy) / Rs, rr = dx * dx + dy * dy;
        if (rr < 1) {
          const nz = Math.sqrt(1 - rr), nx = dx, ny = -dy;
          const lam = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
          const lon = Math.atan2(nx * Math.cos(spin) - nz * Math.sin(spin), nx * Math.sin(spin) + nz * Math.cos(spin)), lat = Math.asin(ny);
          const line = Math.abs(Math.sin(lon * 3)) < 0.13 || Math.abs(Math.sin(lat * 3.2)) < 0.12;
          const lit = 0.1 + 0.9 * Math.pow(lam, 0.8);
          b = Math.max(base, Math.round((line ? lit * 0.25 : lit) * 4) / 4);
        } else {
          const dd = Math.hypot(x - cx, y - cy);
          if (Math.abs(dd - Rr) < pitch * 0.55) {
            const a = Math.atan2(y - cy, x - cx), da = (a - seg) % TAU, u = da < 0 ? da + TAU : da;
            b = u < 1.3 ? 0.25 + Math.round((1 - u / 1.3) * 3) / 4 : Math.abs(u - Math.PI) < 0.3 ? 0.5 : 0.16;
          }
        }
        if (Math.hypot(x - mx, y - my) < 30) { b = 1; red = true; }
        const fade = smooth(x0, x0 + 160, x);
        ctx.globalAlpha = Math.min(1, b) * fade;
        if (ctx.globalAlpha > 0.01) ctx.drawImage(red ? s.red : s.on, x - 9, y - 9, 18, 18);
      }
      ctx.globalAlpha = 1;
    },
  };
})();
