// Tipos de diapositiva: un esquema (zod) y su HTML. El MCP los usa en diapositiva_desde_spec,
// para que un modelo elija el tipo y rellene datos en vez de escribir HTML.
// Texto: se escapa todo salvo <b>, <strong>, <i>, <em>, <code> y <br>.
import { z } from 'zod';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const t = (s) => esc(s).replace(/&lt;(\/?)(b|strong|i|em|code)&gt;/g, '<$1$2>').replace(/&lt;br\s*\/?&gt;/g, '<br>');
const attr = (k, v) => (v == null || v === '' || v === false ? '' : v === true ? ` ${k}` : ` ${k}="${esc(v)}"`);

const ID = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'minúsculas, números y guiones').describe('id único de la diapositiva');
const base = {
  id: ID,
  seccion: z.string().min(1).describe('Sección (agrupa diapositivas y alimenta la agenda)'),
  titulo: z.string().min(1).max(40).describe('Título de una línea: ~28 caracteres como máximo (24 en portadas)'),
  kicker: z.string().optional().describe('Antetítulo corto en minúsculas: «bloque · contexto»'),
  notas: z.string().optional().describe('Notas del orador (tecla N); admite varios párrafos separados por línea en blanco'),
};
const STEP = z.boolean().optional().describe('Revela los elementos uno a uno con →');
const Num = z.number();
const Grafico = z.object({
  tipo: z.enum(['barras', 'columnas', 'lineas', 'dispersion']).default('barras'),
  datos: z.array(z.tuple([z.string(), Num])).optional().describe('Una serie: [[etiqueta, valor], …]'),
  etiquetas: z.array(z.string()).optional(),
  x: z.array(Num).optional().describe('lineas: eje x numérico en lugar de etiquetas'),
  series: z.array(z.object({ nombre: z.string(), valores: z.array(Num.nullable()).optional(), puntos: z.array(z.tuple([Num, Num])).optional() })).optional(),
  unidad: z.string().optional().describe('Sufijo: " ms", " %"'), dec: z.number().int().min(0).max(4).optional(),
  ejeX: z.string().optional(), ejeY: z.string().optional(),
  resalta: z.array(z.string()).optional(), orden: z.enum(['desc', 'asc']).optional(),
  apilar: z.boolean().optional(), cero: z.boolean().optional(), valores: z.boolean().optional(),
}).refine((g) => (g.datos && g.datos.length) || (g.series && g.series.length), { message: 'El gráfico necesita "datos" o "series" con algún valor' });

export const Spec = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('portada'), ...base, lead: z.string().optional(), fondo: z.string().optional().describe('data-painter: grano, hilos, radar, topo, isolineas, escaner, velo…'), semilla: z.number().int().optional() }),
  z.object({ tipo: z.literal('separador'), ...base, lead: z.string().optional(), fondo: z.string().optional(), semilla: z.number().int().optional() }),
  z.object({ tipo: z.literal('cierre'), ...base, lead: z.string().optional(), fondo: z.string().optional() }),
  z.object({ tipo: z.literal('cifra'), ...base, valor: Num, prefijo: z.string().optional(), sufijo: z.string().optional(), decimales: z.number().int().optional(), etiqueta: z.string().optional(), delta: z.object({ texto: z.string(), sentido: z.enum(['sube', 'baja']) }).optional(), texto: z.string().optional().describe('Explicación lateral'), nota: z.string().optional() }),
  z.object({ tipo: z.literal('cifras'), ...base, items: z.array(z.object({ valor: Num, prefijo: z.string().optional(), sufijo: z.string().optional(), decimales: z.number().int().optional(), etiqueta: z.string() })).min(2).max(4), nota: z.string().optional(), pasos: STEP }),
  z.object({ tipo: z.literal('tarjetas'), ...base, items: z.array(z.object({ titulo: z.string(), texto: z.string(), etiqueta: z.string().optional() })).min(2).max(4), nota: z.string().optional(), pasos: STEP }),
  z.object({ tipo: z.literal('problema'), ...base, problema: z.object({ titulo: z.string(), texto: z.string() }), solucion: z.object({ titulo: z.string(), texto: z.string() }), claves: z.array(z.string()).max(5).optional().describe('Chips con ideas clave'), pasos: STEP }),
  z.object({ tipo: z.literal('proceso'), ...base, pasos_proceso: z.array(z.object({ titulo: z.string(), detalle: z.string().optional() })).min(2).max(6), vertical: z.boolean().optional(), texto: z.string().optional(), pasos: STEP }),
  z.object({ tipo: z.literal('comparacion'), ...base, columnas: z.array(z.object({ titulo: z.string(), etiqueta: z.string().optional(), puntos: z.array(z.string()).max(5) })).min(2).max(3), destacar: z.number().int().optional().describe('Índice (0…) de la columna destacada'), pasos: STEP }),
  z.object({ tipo: z.literal('grafico'), ...base, grafico: Grafico, texto: z.string().optional().describe('Lectura del gráfico, en el lateral'), nota: z.string().optional().describe('Fuente o «Datos de ejemplo»') }),
  z.object({ tipo: z.literal('tabla'), ...base, columnas: z.array(z.string()).min(2), filas: z.array(z.array(z.union([z.string(), Num]))).min(1).max(8), resaltar: z.array(z.number().int()).optional().describe('Índices de filas destacadas'), nota: z.string().optional() }),
  z.object({ tipo: z.literal('imagen'), ...base, src: z.string().describe('Ruta relativa al deck (assets/…) o URL'), alt: z.string(), pie: z.string().optional(), texto: z.string().optional() }),
  z.object({ tipo: z.literal('terminal'), ...base, lineas: z.array(z.object({ cmd: z.boolean().optional(), texto: z.string() })).min(1).max(14), ventana: z.string().optional().describe('Título de la ventana'), texto: z.string().optional() }),
  z.object({ tipo: z.literal('cita'), ...base, texto: z.string(), autor: z.string().optional() }),
  z.object({ tipo: z.literal('checklist'), ...base, items: z.array(z.object({ texto: z.string(), estado: z.enum(['hecho', 'revisar', 'fallo', 'en curso', 'pendiente']).default('hecho') })).min(2).max(6), texto: z.string().optional(), pasos: STEP }),
  z.object({ tipo: z.literal('libre'), ...base, cuerpo: z.string().describe('HTML del interior de <div class="s-body …">'), cuerpoClase: z.string().optional().describe('Clases extra de .s-body: cols, cols even, stack…'), fx: z.string().optional() }),
]);

const head = (s) => `  <header class="s-head">\n${s.kicker ? `    <p class="kicker">${t(s.kicker)}</p>\n` : ''}    <h2 class="s-title">${t(s.titulo)}</h2>\n  </header>`;
const notas = (s) => (s.notas ? `\n  <aside class="notes">${s.notas.split(/\n\s*\n/).map((p) => `<p>${t(p.trim())}</p>`).join('')}</aside>` : '');
const open = (s, extra = {}) => `<section class="slide${extra.clase ? ' ' + extra.clase : ''}" id="${s.id}"${attr('data-fx', extra.fx)}${attr('data-painter', extra.painter)}${attr('data-seed', extra.seed)} data-section="${esc(s.seccion)}" data-title="${esc(s.titulo)}">`;
const slide = (s, body, bodyClass = '', extra = {}) => `${open(s, extra)}\n${head(s)}\n  <div class="s-body${bodyClass ? ' ' + bodyClass : ''}">\n${body}\n  </div>${notas(s)}\n</section>`;
const step = (on) => (on ? ' data-step data-reveal="auto"' : '');
const nota = (n) => (n ? `\n    <p class="note">${t(n)}</p>` : '');
const lado = (txt, inner) => (txt ? `    <div class="stack" style="min-width:0">\n${inner}\n    </div>\n    <aside class="stack tp-lado">\n      <p class="tp-texto">${t(txt)}</p>\n    </aside>` : inner);
const cifraTag = (c) => `<span class="cifra" data-value="${c.valor}"${attr('data-pre', c.prefijo)}${attr('data-suf', c.sufijo)}${c.decimales != null ? ` data-dec="${c.decimales}"` : ''}></span>`;

const R = {
  portada: (s) => `${open(s, { clase: 'is-plain cover', fx: 'backdrop', painter: s.fondo, seed: s.semilla ?? 3 })}\n  <div class="fx-bg"></div>\n  <div class="cover-body">\n${s.kicker ? `    <p class="kicker">${t(s.kicker)}</p>\n` : ''}    <h1 class="s-title xl">${t(s.titulo)}</h1>\n${s.lead ? `    <p class="lead">${t(s.lead)}</p>\n` : ''}  </div>${notas(s)}\n</section>`,
  separador: (s) => `${open(s, { clase: 'is-plain divider', fx: 'backdrop', painter: s.fondo, seed: s.semilla ?? 5 })}\n  <div class="fx-bg"></div>\n  <div class="divider-body">\n${s.kicker ? `    <p class="kicker">${t(s.kicker)}</p>\n` : ''}    <h2 class="s-title xl">${t(s.titulo)}</h2>\n${s.lead ? `    <p class="lead">${t(s.lead)}</p>\n` : ''}  </div>${notas(s)}\n</section>`,
  cierre: (s) => `${open(s, { clase: 'is-plain divider closing', fx: 'backdrop', painter: s.fondo, seed: 7 })}\n  <div class="fx-bg"></div>\n  <div class="divider-body">\n${s.kicker ? `    <p class="kicker">${t(s.kicker)}</p>\n` : ''}    <h2 class="s-title xl">${t(s.titulo)}</h2>\n${s.lead ? `    <p class="lead">${t(s.lead)}</p>\n` : ''}  </div>${notas(s)}\n</section>`,
  cifra: (s) => slide(s, `    <div class="stack" style="justify-content:center">\n${s.etiqueta ? `      <p class="label">${t(s.etiqueta)}</p>\n` : ''}      ${cifraTag(s)}\n${s.delta ? `      <span class="cifra-delta ${s.delta.sentido}"><b>${s.delta.sentido === 'sube' ? '▲ sube' : '▼ baja'}</b> ${t(s.delta.texto)}</span>\n` : ''}${s.nota ? `      <p class="note">${t(s.nota)}</p>\n` : ''}    </div>\n    <aside class="stack" style="justify-content:center">\n${s.texto ? `      <p class="tp-texto">${t(s.texto)}</p>\n` : ''}    </aside>`, 'cols'),
  cifras: (s) => slide(s, `    <div class="tp-cifras" style="--n:${s.items.length}">\n${s.items.map((c) => `      <div${step(s.pasos)}>\n        ${cifraTag(c)}\n        <p class="label">${t(c.etiqueta)}</p>\n      </div>`).join('\n')}\n    </div>${nota(s.nota)}`, 'stack'),
  tarjetas: (s) => slide(s, `    <div class="tp-rejilla" style="--n:${s.items.length}">\n${s.items.map((c) => `      <article class="panel"${step(s.pasos)}>\n${c.etiqueta ? `        <span class="chip">${t(c.etiqueta)}</span>\n` : ''}        <h3>${t(c.titulo)}</h3>\n        <p>${t(c.texto)}</p>\n      </article>`).join('\n')}\n    </div>${nota(s.nota)}`, 'stack'),
  problema: (s) => slide(s, `    <div class="tp-problema">\n      <article class="panel">\n        <p class="label">problema</p>\n        <h3>${t(s.problema.titulo)}</h3>\n        <p>${t(s.problema.texto)}</p>\n      </article>\n      <span class="flecha" aria-hidden="true"${step(s.pasos)}>→</span>\n      <article class="panel sol"${step(s.pasos)}>\n        <p class="label">solución</p>\n        <h3>${t(s.solucion.titulo)}</h3>\n        <p>${t(s.solucion.texto)}</p>\n      </article>\n    </div>${s.claves && s.claves.length ? `\n    <div class="tp-claves"${step(s.pasos)}>${s.claves.map((c) => `<span class="chip">${t(c)}</span>`).join('')}</div>` : ''}`, 'stack'),
  proceso: (s) => slide(s, lado(s.texto, `    <ol class="etapas neutra${s.vertical ? ' v' : ''}">\n${s.pasos_proceso.map((p) => `      <li${s.pasos ? ' data-step' : ''}><b>${t(p.titulo)}</b>${p.detalle ? `<small>${t(p.detalle)}</small>` : ''}</li>`).join('\n')}\n    </ol>`), s.texto ? 'cols' : 'stack'),
  comparacion: (s) => slide(s, `    <div class="tp-rejilla" style="--n:${s.columnas.length}">\n${s.columnas.map((c, i) => `      <article class="panel${s.destacar === i ? ' tp-dest' : ''}"${step(s.pasos && i > 0)}>\n${c.etiqueta ? `        <span class="chip">${t(c.etiqueta)}</span>\n` : ''}        <h3>${t(c.titulo)}</h3>\n        <ul class="tp-lista">${c.puntos.map((p) => `<li>${t(p)}</li>`).join('')}</ul>\n      </article>`).join('\n')}\n    </div>`, 'stack'),
  grafico: (s) => {
    const g = s.grafico, json = {};
    if (g.datos) json.datos = g.datos; if (g.etiquetas) json.etiquetas = g.etiquetas; if (g.x) json.x = g.x; if (g.series) json.series = g.series;
    const a = attr('data-tipo', g.tipo) + attr('data-unidad', g.unidad) + (g.dec != null ? ` data-dec="${g.dec}"` : '') + attr('data-eje-x', g.ejeX) + attr('data-eje-y', g.ejeY)
      + attr('data-resalta', g.resalta && g.resalta.join('|')) + attr('data-orden', g.orden) + attr('data-apilar', !!g.apilar) + attr('data-cero', !!g.cero) + (g.valores === false ? ' data-valores="no"' : '');
    const fig = `      <figure class="grafico"${a}>\n        <script type="application/json">${JSON.stringify(json).replace(/</g, '\\u003c')}</script>\n${s.nota ? `        <figcaption>${t(s.nota)}</figcaption>\n` : ''}      </figure>`;
    return slide(s, s.texto ? `    <div class="stack" style="min-width:0">\n${fig}\n    </div>\n    <aside class="stack tp-lado" style="justify-content:center">\n      <p class="tp-texto">${t(s.texto)}</p>\n    </aside>` : fig.replace(/^ {2}/gm, ''), s.texto ? 'cols' : 'stack');
  },
  tabla: (s) => {
    const isNum = (v) => typeof v === 'number' || /^[\d.,\s%+−-]+$/.test(String(v));
    const numCol = s.columnas.map((_, j) => s.filas.every((f) => j > 0 && isNum(f[j])));
    const fmt = (v) => (typeof v === 'number' ? v.toLocaleString('es-ES') : t(v));
    return slide(s, `    <table class="tp-tabla">\n      <thead><tr>${s.columnas.map((c, j) => `<th${numCol[j] ? ' class="num"' : ''}>${t(c)}</th>`).join('')}</tr></thead>\n      <tbody>\n${s.filas.map((f, i) => `        <tr${(s.resaltar || []).includes(i) ? ' class="on"' : ''}>${f.map((v, j) => `<td${numCol[j] ? ' class="num"' : ''}>${fmt(v)}</td>`).join('')}</tr>`).join('\n')}\n      </tbody>\n    </table>${nota(s.nota)}`, 'stack');
  },
  imagen: (s) => slide(s, lado(s.texto, `      <figure class="tp-img">\n        <img src="${esc(s.src)}" alt="${esc(s.alt)}">\n${s.pie ? `        <figcaption class="note">${t(s.pie)}</figcaption>\n` : ''}      </figure>`), s.texto ? 'cols' : 'stack'),
  terminal: (s) => slide(s, lado(s.texto, `      <div class="win">\n        <div class="win-bar"><span class="dot"></span>${t(s.ventana || 'terminal')}</div>\n        <div class="win-body">\n          <div class="term teclea">\n${s.lineas.map((l) => `            <div${l.cmd ? ' data-k="cmd"' : ''}>${esc(l.cmd && !/^\s*[$#❯]/.test(l.texto) ? '$ ' + l.texto : l.texto)}</div>`).join('\n')}\n          </div>\n        </div>\n      </div>`), s.texto ? 'cols' : 'stack'),
  cita: (s) => slide(s, `    <figure class="tp-cita">\n      <blockquote>${t(s.texto)}</blockquote>\n${s.autor ? `      <figcaption>${t(s.autor)}</figcaption>\n` : ''}    </figure>`, 'stack'),
  checklist: (s) => {
    const END = { hecho: '', revisar: 'warn', fallo: 'err' };
    return slide(s, lado(s.texto, `      <ul class="checklist">\n${s.items.map((i) => `        <li${i.estado === 'pendiente' ? ' class="tp-pend"' : i.estado === 'en curso' ? '' : s.pasos ? ' data-step' : ' class="on"'}${END[i.estado] ? ` data-end="${END[i.estado]}"` : ''}>${t(i.texto)}</li>`).join('\n')}\n      </ul>`), s.texto ? 'cols' : 'stack');
  },
  libre: (s) => slide(s, s.cuerpo.replace(/^/gm, '    '), s.cuerpoClase || '', { fx: s.fx }),
};

export function renderSpec(spec) {
  const s = Spec.parse(spec);
  return { spec: s, html: R[s.tipo](s) };
}
export const TIPOS = Object.keys(R);
