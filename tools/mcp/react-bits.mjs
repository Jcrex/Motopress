// Consulta de react-bits para portar componentes al motor: búsqueda, fichas, fragmentos de código,
// recetas por técnica y esqueletos en fx/experimental/. Lee planning/atlas/atlas.db (tabla react_bits,
// rellenada por planning/atlas/react_bits.py) y el clon de react-bits (RB_PATH, por defecto ~/Proyectos/react-bits).
// Solo escribe en fx/experimental/ (rbPreparar), y nunca sobre un archivo existente sin forzar.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ROOT } from '../salida.mjs';

export const RB = path.resolve(process.env.RB_PATH || path.join(os.homedir(), 'Proyectos/react-bits'));
const DB = path.join(ROOT, 'planning/atlas/atlas.db');
const RECETAS = path.join(ROOT, '.claude/skills/portar-react-bits/recetas.md');
const EXP = path.join(ROOT, 'fx/experimental');

let db = null;
const base = () => {
  if (!db) {
    if (!fs.existsSync(DB)) throw new Error('No existe planning/atlas/atlas.db: ejecuta planning/atlas/construir_db.py y react_bits.py');
    db = new DatabaseSync(DB, { readOnly: true });
  }
  return db;
};
const J = (s, d = []) => { try { return s ? JSON.parse(s) : d; } catch { return d; } };
const clon = () => fs.existsSync(path.join(RB, 'src/content'));
const leerClon = (rel) => {
  if (!clon()) throw new Error(`No encuentro el clon de react-bits en ${RB} (define RB_PATH)`);
  const f = path.join(RB, rel);
  if (!f.startsWith(RB + path.sep) || !fs.existsSync(f)) throw new Error(`No existe ${rel} en el clon`);
  return fs.readFileSync(f, 'utf8');
};

function fila(nombre) {
  const r = base().prepare('SELECT * FROM react_bits WHERE lower(nombre) = lower(?)').get(nombre);
  if (!r) {
    const p = base().prepare("SELECT nombre FROM react_bits WHERE lower(nombre) LIKE lower(?) LIMIT 8").all(`%${nombre}%`).map((x) => x.nombre);
    throw new Error(`No hay ningún componente «${nombre}» en react-bits${p.length ? '. ¿Quizá: ' + p.join(', ') + '?' : ''}`);
  }
  return r;
}

// Componentes del motor ligados a un componente de react-bits.
function enMotor(nombre) {
  return base().prepare(`SELECT c.id, c.nombre, c.estado_motor, c.archivo_fuente, c.slide_id, c.lote_id, o.relacion
    FROM origen_react_bits o JOIN componentes c ON c.id = o.componente_id WHERE o.rb_nombre = ? ORDER BY c.estado_motor`).all(nombre);
}

// Nombre del archivo experimental de un componente del motor: q-glitch → exp-glitch; traza → traza.
export const nombreExp = (id) => (id.startsWith('q-') ? 'exp-' + id.slice(2) : id);
const experimental = (id) => { const f = path.join(EXP, nombreExp(id) + '.js'); return fs.existsSync(f) ? path.relative(ROOT, f) : null; };

/* ------------------------------------------------------------------ buscar */
export function rbBuscar({ texto = '', categoria, veredicto, tecnica, estado, limite = 40 } = {}) {
  const w = [], a = [];
  if (texto) { w.push('(lower(r.nombre) LIKE ? OR lower(r.descripcion) LIKE ? OR lower(r.tecnica) LIKE ? OR lower(r.motivo) LIKE ?)'); const t = `%${texto.toLowerCase()}%`; a.push(t, t, t, t); }
  if (categoria) { w.push('lower(r.categoria) = lower(?)'); a.push(categoria); }
  if (veredicto) { w.push('r.veredicto = ?'); a.push(veredicto); }
  if (tecnica) { w.push('r.tecnicas LIKE ?'); a.push(`%"${tecnica}"%`); }
  const sub = (est) => `EXISTS (SELECT 1 FROM origen_react_bits o JOIN componentes c ON c.id = o.componente_id WHERE o.rb_nombre = r.nombre AND c.estado_motor = '${est}')`;
  if (estado === 'portado') w.push(sub('implementado'));
  if (estado === 'quizas') w.push(`${sub('quizas')} AND NOT ${sub('implementado')}`);
  if (estado === 'libre') w.push('NOT EXISTS (SELECT 1 FROM origen_react_bits o WHERE o.rb_nombre = r.nombre)');
  const rows = base().prepare(`SELECT r.nombre, r.categoria, r.veredicto, r.coste, r.descripcion, r.motivo FROM react_bits r ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY r.categoria, r.nombre`).all(...a);
  const out = rows.slice(0, limite).map((r) => {
    const m = enMotor(r.nombre).map((c) => `${c.id}${c.estado_motor === 'quizas' ? ' (quizás' + (experimental(c.id) ? ', en fx/experimental' : '') + ')' : ''}`);
    return `${r.nombre} · ${r.categoria} · ${r.veredicto || '¿?'}${r.coste ? ' · coste ' + r.coste : ''}${m.length ? ' · motor: ' + m.join(', ') : ''}\n  ${r.descripcion}${r.motivo ? ' — ' + r.motivo : ''}`;
  });
  const nuevos = J(base().prepare("SELECT valor FROM meta WHERE clave = 'react_bits_nuevos'").get()?.valor);
  return `${rows.length} componentes${rows.length > limite ? ` (se muestran ${limite})` : ''}${nuevos.length ? `\nNuevos en react-bits sin veredicto: ${nuevos.join(', ')}` : ''}\n\n${out.join('\n')}`;
}

/* ------------------------------------------------------------------ ficha */
export function rbFicha(nombre) {
  const r = fila(nombre), props = J(r.props), tec = J(r.tecnicas), uni = J(r.uniforms), ev = J(r.eventos), m = enMotor(r.nombre);
  const commit = base().prepare("SELECT valor FROM meta WHERE clave = 'react_bits_commit'").get()?.valor || '';
  const L = [
    `# ${r.nombre} (${r.categoria})`, r.descripcion, '',
    `Veredicto del estudio: ${r.veredicto || 'sin veredicto'}${r.motivo ? ' — ' + r.motivo : ''}${r.coste ? ' · coste ' + r.coste : ''}${r.valor ? ' · valor ' + r.valor : ''}`,
    r.tecnica ? `Técnica (informe): ${r.tecnica}` : '', r.estilos ? `Estilos (encajan / chocan): ${r.estilos}` : '',
    `Técnicas detectadas: ${tec.join(', ') || '—'}`,
    `Código: ${r.ruta_jsx} (${r.lineas_jsx} líneas)${r.ruta_css ? ' · ' + r.ruta_css : ''}${r.ruta_presets ? ' · presets: ' + r.ruta_presets : ''} · commit ${commit.slice(0, 7)}`,
    `Dependencias: ${J(r.dependencias).join(', ') || 'ninguna'}`,
    r.shaders ? `Shaders: ${r.shaders} · uniforms: ${uni.join(', ')}` : '',
    ev.length ? `Eventos (interacción que habrá que sustituir o descartar): ${ev.join(', ')}` : '',
    '', '## Props', '| prop | tipo | por defecto | descripción |', '|---|---|---|---|',
    ...props.map((p) => `| ${p.name} | ${p.type} | ${p.default} | ${p.description} |`),
    '', '## En el motor',
    ...(m.length ? m.map((c) => `- ${c.id} (${c.estado_motor}, ${c.relacion}) · ${c.archivo_fuente || '—'}${c.slide_id ? ' · diapositiva del Atlas: #' + c.slide_id : ''}${experimental(c.id) ? ' · port: ' + experimental(c.id) : ''}`) : ['- nada todavía']),
  ];
  if (r.uso) L.push('', '## Uso en React', '```jsx', r.uso.trim(), '```');
  return L.filter((x) => x !== '').join('\n').replace(/\n## /g, '\n\n## ');
}

/* ------------------------------------------------------------------ código */
const numerar = (txt, desde = 1) => txt.split('\n').map((l, i) => `${String(desde + i).padStart(4)}  ${l}`).join('\n');
const lineaDe = (src, i) => src.slice(0, i).split('\n').length;
// Bloque balanceado que empieza en src[i] (el carácter de apertura).
function bloque(src, i) {
  const open = src[i], close = { '(': ')', '{': '}', '[': ']' }[open];
  let d = 0, q = null;
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (src.startsWith('//', k)) { k = src.indexOf('\n', k); if (k < 0) return src.length; continue; }
    if (src.startsWith('/*', k)) { k = src.indexOf('*/', k) + 1; continue; }
    if (c === open) d++; else if (c === close && --d === 0) return k + 1;
  }
  return src.length;
}
const trozo = (src, a, b, titulo) => `// ${titulo} · líneas ${lineaDe(src, a)}–${lineaDe(src, b)}\n${numerar(src.slice(a, b), lineaDe(src, a))}`;

export function shadersDe(src) {
  const out = [];
  for (const m of src.matchAll(/`((?:[^`\\]|\\.)*)`/gs)) {
    if (!/void\s+main\s*\(/.test(m[1])) continue;
    const antes = src.slice(Math.max(0, m.index - 160), m.index), nom = (antes.match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:\/\*[^*]*\*\/\s*)?$/) || antes.match(/(\w+)\s*[:=]\s*$/) || [])[1] || 'shader';
    const tipo = /gl_FragColor|out\s+vec4|gl_FragData/.test(m[1]) ? 'fragmento' : /gl_Position/.test(m[1]) ? 'vértices' : 'shader';
    out.push({ nombre: nom, tipo, codigo: m[1], inicio: m.index + 1, fin: m.index + 1 + m[1].length, version: /#version\s+300\s+es/.test(m[1]) ? 'GLSL 3.00 (WebGL2)' : 'GLSL 1.00' });
  }
  return out;
}

export function rbCodigo({ nombre, parte = 'resumen', desde, hasta }) {
  const r = fila(nombre), src = leerClon(r.ruta_jsx);
  if (desde || hasta) {
    const ls = src.split('\n'), a = Math.max(1, desde || 1), b = Math.min(ls.length, hasta || a + 199, a + 399);
    return `// ${r.ruta_jsx} · líneas ${a}–${b} de ${ls.length}\n${numerar(ls.slice(a - 1, b).join('\n'), a)}`;
  }
  if (parte === 'resumen') {
    // Mapa del archivo: declaraciones de primer nivel y hooks, para pedir después solo lo necesario.
    const marcas = [];
    src.split('\n').forEach((l, i) => { if (/^(export |const |function |let |class )|^\s{0,4}(useEffect|useLayoutEffect|useCallback|useMemo|useRef|useState)\(|requestAnimationFrame|addEventListener|getContext/.test(l)) marcas.push(`${String(i + 1).padStart(4)}  ${l.trim().slice(0, 110)}`); });
    return `// ${r.ruta_jsx} (${r.lineas_jsx} líneas). Partes: shaders, props, bucle, eventos, css, uso, presets; o desde/hasta.\n${marcas.join('\n')}`;
  }
  if (parte === 'shaders') {
    const sh = shadersDe(src);
    if (!sh.length) return `${r.nombre} no tiene shaders GLSL.`;
    return sh.map((s) => `// ${s.nombre} · ${s.tipo} · ${s.version} · líneas ${lineaDe(src, s.inicio)}–${lineaDe(src, s.fin)}\n${s.codigo.trim()}`).join('\n\n');
  }
  if (parte === 'props') {
    const m = src.match(new RegExp(`(?:function\\s+${r.nombre}\\s*|const\\s+${r.nombre}\\s*=\\s*(?:React\\.)?(?:forwardRef\\()?\\s*(?:function\\s*\\w*\\s*)?)\\(\\s*\\{`)) || src.match(/export default function \w+\s*\(\s*\{/);
    if (!m) {
      // forwardRef((props, ref) => { const { … } = props; … })
      for (const c of src.matchAll(/(?:const|let)\s*\{/g)) {
        const i = c.index + c[0].length - 1, b = bloque(src, i);
        if (/^\s*=\s*props\b/.test(src.slice(b, b + 20))) return trozo(src, c.index, b + src.slice(b).indexOf('props') + 5, 'props con sus valores por defecto');
      }
      return 'No encuentro la desestructuración de props; usa rb_ficha (tabla de props de la demo).';
    }
    const i = m.index + m[0].lastIndexOf('{');
    return trozo(src, m.index, bloque(src, i), 'props con sus valores por defecto');
  }
  if (parte === 'bucle') {
    const out = [];
    for (const m of src.matchAll(/use(?:Layout)?Effect\(/g)) {
      const b = bloque(src, m.index + m[0].length - 1);
      if (/requestAnimationFrame|setInterval|gsap\.|animate\(|\.to\(|ticker/.test(src.slice(m.index, b))) out.push(trozo(src, m.index, b, 'efecto con animación'));
    }
    if (!out.length) { const i = src.search(/requestAnimationFrame|setInterval/); if (i >= 0) { const a = src.lastIndexOf('\n', Math.max(0, i - 600)); out.push(trozo(src, a + 1, Math.min(src.length, i + 1200), 'alrededor del bucle')); } }
    return out.join('\n\n') || 'No hay bucle de animación (se anima con CSS o con motion).';
  }
  if (parte === 'eventos') {
    const ls = src.split('\n'), hits = [];
    ls.forEach((l, i) => { if (/addEventListener|removeEventListener|on(?:Mouse|Pointer|Click|Wheel|Key|Touch|Hover|Drag)\w*\s*=|while(?:Hover|Tap|InView)|ScrollTrigger|IntersectionObserver/.test(l)) hits.push(i); });
    if (!hits.length) return 'No usa eventos de interacción.';
    const rangos = []; for (const i of hits) { const a = Math.max(0, i - 2), b = Math.min(ls.length - 1, i + 2); if (rangos.length && a <= rangos.at(-1)[1] + 1) rangos.at(-1)[1] = b; else rangos.push([a, b]); }
    return rangos.map(([a, b]) => numerar(ls.slice(a, b + 1).join('\n'), a + 1)).join('\n   …\n');
  }
  if (parte === 'css') return r.ruta_css ? `// ${r.ruta_css}\n${leerClon(r.ruta_css)}` : 'No tiene archivo CSS (estilos en línea o Tailwind).';
  if (parte === 'uso') return r.uso || 'Sin ejemplo de uso.';
  if (parte === 'presets') return r.ruta_presets ? `// ${r.ruta_presets}\n${leerClon(r.ruta_presets)}` : 'No tiene presets.';
  if (parte === 'todo') return rbCodigo({ nombre, desde: 1, hasta: 400 });
  throw new Error(`Parte desconocida: ${parte}`);
}

/* ------------------------------------------------------------------ técnicas */
export function recetas() { return fs.existsSync(RECETAS) ? fs.readFileSync(RECETAS, 'utf8') : ''; }
export function rbTecnica(tecnica) {
  const md = recetas();
  if (!md) throw new Error('Falta .claude/skills/portar-react-bits/recetas.md');
  const secciones = md.split(/\n(?=## )/);
  const sec = secciones.find((s) => new RegExp(`^## .*\\b${tecnica}\\b`, 'i').test(s));
  const lista = secciones.filter((s) => s.startsWith('## ')).map((s) => s.split('\n')[0].slice(3));
  if (!sec) return `No hay receta para «${tecnica}». Recetas: ${lista.join(' · ')}`;
  // Dos ejemplos ya portados que usan esa técnica: original y port, para compararlos.
  const ej = base().prepare(`SELECT r.nombre, r.ruta_jsx, c.id, c.archivo_fuente FROM react_bits r JOIN origen_react_bits o ON o.rb_nombre = r.nombre
    JOIN componentes c ON c.id = o.componente_id WHERE c.estado_motor = 'implementado' AND o.relacion = 'base' AND r.tecnicas LIKE ? LIMIT 3`).all(`%"${tecnica.toLowerCase()}"%`);
  return `${sec.trim()}${ej.length ? '\n\nEjemplos ya portados (original → motor):\n' + ej.map((e) => `- ${e.nombre} (${e.ruta_jsx}) → ${e.id}: ${e.archivo_fuente || '—'}`).join('\n') : ''}`;
}

/* ------------------------------------------------------------------ esqueleto */
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const DESTINOS = ['pintor', 'pieza', 'efecto', 'titulo'];

export function rbPreparar({ nombre, destino, id, forzar = false }) {
  if (!DESTINOS.includes(destino)) throw new Error(`Destino no válido: ${destino} (${DESTINOS.join(', ')})`);
  const r = fila(nombre), commit = (base().prepare("SELECT valor FROM meta WHERE clave = 'react_bits_commit'").get()?.valor || '').slice(0, 7);
  const comp = id || enMotor(r.nombre).find((c) => c.estado_motor === 'quizas')?.id || 'q-' + kebab(r.nombre);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(comp)) throw new Error(`id no válido: ${comp}`);
  const nom = nombreExp(comp), file = path.join(EXP, nom + '.js');
  if (fs.existsSync(file) && !forzar) throw new Error(`Ya existe ${path.relative(ROOT, file)} (usa forzar para sobrescribirlo)`);
  const props = J(r.props), ev = J(r.eventos), src = clon() ? leerClon(r.ruta_jsx) : '';
  const color = (p) => /colou?r|tint|hue|background|bg\b|gradient/i.test(p.name);
  const sinComillas = (v) => String(v ?? '').replace(/^\s*(['"`])(.*)\1\s*$/, '$2');
  const interaccion = (p) => /mouse|hover|cursor|pointer|click|drag|scroll|wheel|touch/i.test(p.name + ' ' + p.type);
  const destinoProp = (p) => (p.name === 'children' ? 'contenido del elemento' : color(p) ? 'token: api.tok(…) / api.cats()'
    : interaccion(p) ? 'interacción: un paso (data-step) o se descarta' : `data-${kebab(p.name)}`);
  const map = props.map((p) => ` *   ${p.name} (${p.type}, ${sinComillas(p.default) || '—'}) → ${destinoProp(p)}`);
  const head = `/* ${nom} · port experimental de react-bits ${r.nombre} (${r.categoria}) · Atlas Completo, componente ${comp}
 * Origen: react-bits/${r.ruta_jsx} (commit ${commit}). ${r.descripcion}
 * Props del original → motor:
${map.join('\n') || ' *   (sin props documentadas)'}
 * Descartado: ${ev.length ? 'interacción (' + ev.join(', ') + ')' : 'nada'}${J(r.dependencias).length ? '; dependencias ' + J(r.dependencias).join(', ') : ''}.
 * Reglas: colores solo con tokens; render() deja el estado final y play() solo anima; con api.reduced no hay movimiento.
 * Receta: rb_tecnica (${[...new Set(J(r.tecnicas).map((t) => ({ glsl: 'webgl', splittext: 'gsap', scrolltrigger: 'gsap', 'filtro-svg': 'svg', visibilidad: 'raf', resize: 'raf', hover: 'raton', clic: 'raton', arrastre: 'raton', scroll: 'raton', teclado: 'raton' })[t] || t)
    .filter((t) => ['webgl', 'ogl', 'three', 'canvas2d', 'motion', 'gsap', 'svg', 'css-animacion', 'raf', 'raton', 'matter', 'webgpu'].includes(t)))].join(', ') || '—'}). */`;
  const data = (p) => `+(el.dataset.${kebab(p.name).replace(/-([a-z])/g, (_, c) => c.toUpperCase())} ?? ${/^-?[\d.]+$/.test(p.default) ? p.default : JSON.stringify(p.default)})`;
  const lecturas = props.filter((p) => !color(p) && /number/i.test(p.type)).slice(0, 8).map((p) => `      ${p.name}: ${data(p)},`).join('\n');
  let cuerpo;
  if (destino === 'pintor') {
    const sh = src ? shadersDe(src) : [], fs1 = sh.find((s) => s.tipo === 'fragmento');
    const gl2 = fs1 && /#version\s+300\s+es/.test(fs1.codigo);
    cuerpo = `(() => {
  // Shader de fragmento del original (${fs1 ? fs1.nombre + ', ' + fs1.version : 'no encontrado: escríbelo'}). Revisa sus uniforms:
  // los de color pasan a tokens; los de ratón, a la semilla o al tiempo.
  const FS = \`${fs1 ? fs1.codigo.trim().replace(/`/g, '\\`').replace(/\$\{/g, '\\${') : 'precision highp float;\\nuniform vec2 uRes; uniform float uT;\\nvoid main(){ gl_FragColor = vec4(0.); }'}\`;
  Motor.painters['${nom}'] = {
    init(s) { s.last = 0; },
    frame(s, api, t, still) {
      const G = Motor.gl;
      if (G.throttle(s, t, still)) return;
      const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
      const L = G.layer(s, G.scale(s, 0.6, 1));${gl2 ? '  // GLSL 3.00: solo WebGL2; sin él se usa el respaldo 2D' : ''}
      const pg = L && G.program(L, '${nom}', G.VS_FULL, FS);
      if (pg) {
        G.drawFull(L, pg, {
          uRes: [L.W, L.H], uT: t, // TODO: el resto de uniforms (${fs1 ? [...new Set([...fs1.codigo.matchAll(/uniform\s+\w+\s+(\w+)/g)].map((m) => m[1]))].join(', ') : '—'})
          // colores: Motor.color.parse(api.tok('accent')), api.cats(3).map(Motor.color.parse)…
        });
        return;
      }
      // Respaldo 2D obligatorio (sin WebGL o en capturas)
      ctx.fillStyle = Motor.color.alpha(api.tok('accent'), 0.25); ctx.fillRect(0, 0, w, h);
    },
  };
})();`;
  } else if (destino === 'efecto') {
    cuerpo = `(() => {
  Motor.fx('${nom}', {
    render(api) {
      // Estado FINAL completo, leyendo los parámetros del marcado y los colores de los tokens.
      const el = api.el, host = api.q('[data-role="${nom}"]') || el;
      const o = {
${lecturas}
      };
      // TODO: dibujar
    },
    play(api) {
      if (api.reduced) return;
      // TODO: animar hacia lo que render() dejó (api.raf, api.tween, WAAPI o gsap)
    },
    stop(api) {},
  });
})();`;
  } else if (destino === 'titulo') {
    cuerpo = `(() => {
  // Preset de entrada de título: data-title-fx="${nom}". Devuelve { revert() } para dejar el título como estaba.
  Motor.titleFx('${nom}', (title, { api, ease }) => {
    const texto = title.textContent;
    // TODO: partir en letras o palabras y animar con WAAPI (respeta api.reduced: el motor no llama al preset con movimiento reducido)
    return { revert() { title.textContent = texto; } };
  });
})();`;
  } else {
    cuerpo = `(() => {
  // Pieza por clase: <div class="${nom}" …>. Se pinta completa al cargar y se anima con los eventos del motor.
  const SEL = '.${nom}';
  function render(el) {
    const o = {
${lecturas.replace(/^ {6}/gm, '      ')}
    };
    // TODO: estado final
  }
  function play(el, api) {
    // TODO: animación (solo si api.reduced es falso)
  }
  const hidden = (el) => { const s = el.closest('[data-step]'); return s && !s.classList.contains('on'); };
  document.addEventListener('motor:enter', (e) => {
    const { slide, api, animate } = e.detail;
    slide.querySelectorAll(SEL).forEach((el) => { render(el); if (animate && !hidden(el)) play(el, api); });
  });
  document.addEventListener('motor:step', (e) => {
    const { el, api, dir, animate } = e.detail;
    if (dir === 'next' && animate && el) [...(el.matches(SEL) ? [el] : []), ...el.querySelectorAll(SEL)].forEach((p) => play(p, api));
  });
  const boot = () => document.querySelectorAll(SEL).forEach(render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();`;
  }
  fs.mkdirSync(EXP, { recursive: true });
  const code = `${head}\n${cuerpo}\n`;
  if (code.includes('</script')) throw new Error('El código contiene </script> y rompería el empaquetado');
  fs.writeFileSync(file, code);
  const uso = { pintor: `<section class="slide is-plain cover" data-fx="backdrop" data-painter="${nom}">…<div class="fx-bg"></div>…`, efecto: `<section class="slide" data-fx="${nom}">… <div class="fx" data-role="${nom}"></div>`, titulo: `<section class="slide" data-title-fx="${nom}">`, pieza: `<div class="${nom}" ${props.filter((p) => !color(p) && !interaccion(p) && p.name !== 'children' && sinComillas(p.default)).slice(0, 3).map((p) => `data-${kebab(p.name)}="${sinComillas(p.default)}"`).join(' ')}>…</div>` }[destino];
  return { archivo: path.relative(ROOT, file), componente: comp, uso, siguiente: 'Completa los TODO con rb_codigo (shaders, bucle, props) y la receta de rb_tecnica; cárgalo en atlas/completo; revisa con capturar en los estilos que encajan.' };
}

/* ------------------------------------------------------------------ experimentales */
// Ports de fx/experimental/ con su primera línea de cabecera, para el catálogo.
export function experimentales() {
  if (!fs.existsSync(EXP)) return [];
  return fs.readdirSync(EXP).filter((f) => f.endsWith('.js')).sort().map((f) => {
    const first = fs.readFileSync(path.join(EXP, f), 'utf8').split('\n')[0].replace(/^\/\*\s*/, '').replace(/\*\/\s*$/, '');
    return { archivo: 'fx/experimental/' + f, resumen: first };
  });
}
