/* exp-lightrays · port experimental de react-bits LightRays (Backgrounds) · Atlas Completo, componente q-lightrays
 * Origen: react-bits/src/content/Backgrounds/LightRays/LightRays.jsx (commit 4dc7b5b). Volumetric light rays from any edge, with source glow and haze. The cursor steers the beam and casts a shadow.
 * Props del original → motor:
 *   raysOrigin (RaysOrigin, top-center) → data-rays-origin
 *   raysColor (string, #ffffff) → token: api.tok(…) / api.cats()
 *   raysSpeed (number, 1) → data-rays-speed
 *   lightSpread (number, 0.5) → data-light-spread
 *   rayLength (number, 3) → data-ray-length
 *   rayDensity (number, 1) → data-ray-density
 *   tilt (number, 0) → data-tilt
 *   raySharpness (number, 0.35) → data-ray-sharpness
 *   glow (number, 0.6) → data-glow
 *   haze (number, 0.25) → data-haze
 *   atmosphere (number, 1) → data-atmosphere
 *   intensity (number, 1) → data-intensity
 *   pulsating (boolean, false) → data-pulsating
 *   fadeDistance (number, 1) → data-fade-distance
 *   saturation (number, 1) → data-saturation
 *   followMouse (boolean, true) → interacción: un paso (data-step) o se descarta
 *   mouseInfluence (number, 0.1) → interacción: un paso (data-step) o se descarta
 *   cursorShadow (boolean, true) → interacción: un paso (data-step) o se descarta
 *   clickPulse (boolean, true) → interacción: un paso (data-step) o se descarta
 *   noiseAmount (number, 0) → data-noise-amount
 *   distortion (number, 0) → data-distortion
 *   intro (boolean, true) → data-intro
 *   lightMode (boolean, false) → data-light-mode
 *   opacity (number, 1) → data-opacity
 *   maxDevicePixelRatio (number, 2) → data-max-device-pixel-ratio
 *   className (string, —) → data-class-name
 *   style (CSSProperties, -) → data-style
 * Descartado: interacción (onPointerDown, onPointerMove, onPointerUp, pointercancel, pointerdown, pointerleave, pointermove, pointerup, visibilitychange, webglcontextlost, webglcontextrestored).
 * Reglas: colores solo con tokens; render() deja el estado final y play() solo anima; con api.reduced no hay movimiento.
 * Receta: rb_tecnica (webgl, raf, raton). */
/* Port: raysOrigin, lightSpread, rayLength, rayDensity, tilt, raySharpness, glow, haze, atmosphere, intensity,
 *   noiseAmount y distortion se leen de data-* en la diapositiva (data-rays-origin="top-right", data-glow="0.8"…);
 *   raysColor → token de data-rays-token (por defecto accent; admite «noche:accent accent-2», por estilo), mezclado con fg en oscuro; lightMode → automático en modo claro; intro → 1,8 s al entrar.
 *   followMouse/mouseInfluence → el haz oscila despacio solo (como el oleaje); cursorShadow y clickPulse descartados.
 *   Añadido: uKeep atenúa la columna izquierda del título; data-rays-x desplaza el origen en horizontal. */
(() => {
  const ORIGINS = {
    'top-left': { anchor: [0, -0.2], dir: [0, 1] }, 'top-center': { anchor: [0.5, -0.2], dir: [0, 1] },
    'top-right': { anchor: [1, -0.2], dir: [0, 1] }, left: { anchor: [-0.2, 0.5], dir: [1, 0] },
    right: { anchor: [1.2, 0.5], dir: [-1, 0] }, 'bottom-left': { anchor: [0, 1.2], dir: [0, -1] },
    'bottom-center': { anchor: [0.5, 1.2], dir: [0, -1] }, 'bottom-right': { anchor: [1, 1.2], dir: [0, -1] },
  };
  const num = (d, k, def, lo = -Infinity, hi = Infinity) => { const v = parseFloat(d[k]); return Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : def)); };
  function settings(el) {
    const d = el.dataset;
    const o = ORIGINS[d.raysOrigin] || ORIGINS['top-center'];
    return {
      anchor: [o.anchor[0] + num(d, 'raysX', 0, -1, 1), o.anchor[1]], dir: o.dir,
      speed: num(d, 'raysSpeed', 1, 0), spread: num(d, 'lightSpread', 0.5, 0.001), length: num(d, 'rayLength', 3, 0.01),
      density: num(d, 'rayDensity', 1, 0.1, 6), tilt: num(d, 'tilt', 0, -90, 90) * Math.PI / 180,
      sharpness: num(d, 'raySharpness', 0.35, 0, 1), glow: num(d, 'glow', 0.6, 0), haze: num(d, 'haze', 0.25, 0, 1),
      atmosphere: num(d, 'atmosphere', 1, 0, 1), intensity: num(d, 'intensity', 1, 0), fade: num(d, 'fadeDistance', 1, 0.01),
      saturation: num(d, 'saturation', 1, 0), noise: num(d, 'noiseAmount', 0, 0, 1), distortion: num(d, 'distortion', 0),
      keep: num(d, 'raysKeep', 0.35, 0, 1), intro: d.intro !== 'false',
    };
  }
  // Shader de fragmento del original (FRAGMENT, GLSL 3.00 (WebGL2)). Revisa sus uniforms:
  // los de color pasan a tokens; los de ratón, a la semilla o al tiempo.
  const FS = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uScale;
uniform float uTime;
uniform vec2 uSource;
uniform vec2 uAim;
uniform float uReach;
uniform vec3 uColor;
uniform float uSpread;
uniform float uLength;
uniform float uFade;
uniform float uSaturation;
uniform float uPulsating;
uniform float uNoise;
uniform float uDistortion;
uniform float uDensity;
uniform float uSharpness;
uniform float uGlow;
uniform float uHaze;
uniform float uAtmosphere;
uniform float uIntensity;
uniform vec4 uShadow;
uniform vec2 uIntro;
uniform float uLight;
uniform float uOpacity;
uniform float uKeep;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);
}

float shape(float strength, float width) {
  float edge = max(mix(0.5, 0.08, uSharpness), width);
  return mix(strength, smoothstep(0.62 - edge, 0.62 + edge, strength), uSharpness);
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uScale;
  vec2 delta = coord - uSource;
  float distance = length(delta);
  vec2 dir = delta / max(distance, 1e-4);
  float cosAngle = dot(dir, uAim);
  float angle = cosAngle + uDistortion * sin(uTime * 2.0 + distance * 0.02) * 0.2;
  float slope = fwidth(angle);
  float depth = distance / uReach;

  float source = exp(-depth * depth * 9.0) * 0.9 + exp(-depth * 3.2) * 0.25;
  float glowLight = uGlow * source * smoothstep(-0.2, 0.6, cosAngle);
  float spread = pow(max(angle, 0.0), 1.0 / uSpread);
  float lengthFalloff = clamp(1.0 - distance / (uReach * uLength), 0.0, 1.0);
  float fadeFalloff = clamp(1.0 - distance / (uReach * uFade), 0.5, 1.0);
  float envelope = spread * lengthFalloff * fadeFalloff;
  float reveal = uIntensity * uIntro.y * (1.0 - smoothstep(uIntro.x - 0.35, uIntro.x, depth));
  if ((envelope * 1.6 + glowLight) * reveal < 0.0015) {
    fragColor = vec4(0.0);
    return;
  }

  float phaseA = angle * 36.2214 * uDensity + uTime * 1.5;
  float phaseB = -angle * 21.11349 * uDensity + uTime * 1.5;
  float phaseC = angle * 22.3991 * uDensity + uTime * 1.1;
  float phaseD = -angle * 18.0234 * uDensity + uTime * 1.1;
  float strengthA = clamp(0.75 + 0.15 * sin(phaseA) + 0.2 * cos(phaseB), 0.0, 1.0);
  float strengthB = clamp(0.75 + 0.15 * sin(phaseC) + 0.2 * cos(phaseD), 0.0, 1.0);
  float widthA = abs(0.15 * 36.2214 * cos(phaseA) + 0.2 * 21.11349 * sin(phaseB)) * uDensity * slope;
  float widthB = abs(0.15 * 22.3991 * cos(phaseC) + 0.2 * 18.0234 * sin(phaseD)) * uDensity * slope;
  float pulseA = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 4.5) : 1.0;
  float pulseB = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 3.3) : 1.0;
  float rayLight = envelope * (0.5 * shape(strengthA, widthA) * pulseA + 0.4 * shape(strengthB, widthB) * pulseB);

  if (uHaze > 0.0) {
    float around = atan(uAim.x * dir.y - uAim.y * dir.x, cosAngle);
    vec2 drift = vec2(around * 2.2 + uTime * 0.035, depth * 2.6 - uTime * 0.11);
    float fog = 0.65 * valueNoise(drift * vec2(3.0, 1.0)) + 0.35 * valueNoise(drift * vec2(7.0, 2.3) + 4.1);
    rayLight *= mix(1.0, 0.25 + 1.2 * fog, uHaze);
  }

  if (uShadow.z > 0.0) {
    vec2 toCursor = uShadow.xy - uSource;
    float cursorDistance = length(toCursor);
    float along = dot(delta, toCursor) / max(cursorDistance * cursorDistance, 1e-4);
    float side = abs(delta.x * toCursor.y - delta.y * toCursor.x) / max(cursorDistance, 1e-4);
    float trail = max(along - 1.0, 0.0);
    float width = uShadow.w * along + 0.22 * trail * cursorDistance;
    float behind = smoothstep(0.97, 1.25, along) * exp(-trail * 1.1);
    float shade = (1.0 - smoothstep(width * 0.3, width * 1.6, side)) * behind;
    rayLight *= 1.0 - uShadow.z * 0.62 * shade;
  }

  float light = (rayLight + glowLight) * reveal;
  // motor: la columna del título (izquierda) queda más tenue
  light *= mix(uKeep, 1.0, smoothstep(0.18, 0.55, coord.x / (uResolution.x / uScale)));

  if (uNoise > 0.0) {
    float n = fract(sin(dot(coord * 0.02 + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453123);
    light *= 1.0 - uNoise + uNoise * n;
  }

  float near = clamp(1.2 - distance / (uResolution.y / uScale), 0.0, 1.0);
  vec3 tint = mix(vec3(0.9), vec3(0.1, 0.3, 0.5) + near * vec3(0.8, 0.6, 0.5), uAtmosphere);
  float gray = dot(tint, vec3(0.299, 0.587, 0.114));
  vec3 hue = max(mix(vec3(gray), tint, uSaturation), 0.0) * uColor;

  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLight > 0.5) {
    vec3 color = hue * light;
    float energy = max(color.r, max(color.g, color.b));
    vec3 tone = clamp(1.0 - (1.0 - hue / max(max(hue.r, max(hue.g, hue.b)), 1e-4)) * 1.8, 0.0, 1.0);
    float warm = clamp((min(tone.r, tone.g) - tone.b) * 2.0, 0.0, 1.0);
    vec3 ink = tone * (mix(0.66, 0.94, warm) - 0.1 * smoothstep(0.4, 1.2, energy));
    float density = clamp(0.82 * (1.0 - exp(-1.5 * energy * energy)) * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(ink * density, density);
    return;
  }
  float level = light < 0.75 ? light : 0.75 + 0.25 * (1.0 - exp(-(light - 0.75) / 0.25));
  float top = max(hue.r, max(hue.g, hue.b));
  hue = mix(hue, vec3(top), smoothstep(0.8, 1.0, level) * 0.45);
  vec3 shown = clamp(hue * level, 0.0, 1.0) * level;
  fragColor = vec4(clamp(shown + grain, 0.0, level) * uOpacity, level * uOpacity);
}`;
  // data-rays-token="noche:accent accent-2": token por estilo, con uno por defecto
  function rayToken(el, style) {
    let def = 'accent';
    for (const part of (el.dataset.raysToken || '').trim().split(/\s+/).filter(Boolean)) {
      const [a, b] = part.split(':');
      if (b === undefined) def = a; else if (a === style) return b;
    }
    return def;
  }
  const smoother = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); };
  Motor.painters['exp-lightrays'] = {
    init(s, api) { s.last = 0; s.cfg = settings(api.el); s.t0 = null; },
    frame(s, api, t, still) {
      const G = Motor.gl, C = Motor.color, c = s.cfg;
      if (G.throttle(s, t, still, 30)) return;
      const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
      if (s.t0 === null) s.t0 = t;
      const open = still || api.reduced || !c.intro ? 1 : Math.min(1, (t - s.t0) / 1.8);
      const eased = 1 - Math.pow(1 - open, 3);
      const time = (still || api.reduced ? 2.5 : t) * c.speed;
      // el ratón se sustituye por un vaivén lento del haz, como la luz bajo el oleaje
      const sway = still || api.reduced ? 0 : 0.05 * Math.sin(t * 0.35) + 0.025 * Math.sin(t * 0.83 + 1.3);
      const ang = c.tilt + sway, co = Math.cos(ang), si = Math.sin(ang);
      const dir = [c.dir[0] * co - c.dir[1] * si, c.dir[0] * si + c.dir[1] * co];
      const src = [c.anchor[0] * w, c.anchor[1] * h];
      const light = !api.dark;
      const tk = api.tok(rayToken(api.el, api.style));
      const col = C.parse(light ? tk : C.mix(api.tok('fg'), tk, 0.45));
      const L = G.layer(s, G.scale(s, 0.6, 1));
      const pg = L && G.program(L, 'exp-lightrays', G.VS_FULL, FS);
      if (pg) {
        G.drawFull(L, pg, {
          uResolution: [L.W, L.H], uScale: L.W / w, uTime: time, uSource: src, uAim: dir, uReach: Math.max(w, h),
          uColor: col, uSpread: c.spread, uLength: c.length, uFade: c.fade, uSaturation: c.saturation, uPulsating: 0,
          uNoise: c.noise, uDistortion: c.distortion, uDensity: c.density, uSharpness: c.sharpness, uGlow: c.glow,
          uHaze: c.haze, uAtmosphere: light ? 0 : c.atmosphere, uIntensity: c.intensity, uShadow: [0, 0, 0, 16],
          uIntro: [eased * 2.6, smoother(open / 0.5)], uLight: light ? 1 : 0, uOpacity: 1, uKeep: c.keep,
        });
        return;
      }
      // Respaldo 2D: abanico de haces desde el origen
      const rng = api.rng(s.seed + 11), base = Math.atan2(dir[1], dir[0]), R = Math.hypot(w, h) * 1.1;
      ctx.save(); ctx.globalCompositeOperation = light ? 'multiply' : 'lighter';
      for (let i = 0; i < 9; i++) {
        const a = base + (rng() - 0.5) * 1.1 * c.spread, wd = 0.02 + rng() * 0.05;
        const g = ctx.createRadialGradient(src[0], src[1], 0, src[0], src[1], R * eased);
        g.addColorStop(0, C.alpha(tk, 0.35)); g.addColorStop(1, C.alpha(tk, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(src[0], src[1]);
        ctx.arc(src[0], src[1], R, a - wd, a + wd); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    },
  };
})();
