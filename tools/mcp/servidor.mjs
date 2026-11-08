#!/usr/bin/env node
// Servidor MCP del motor de presentaciones (stdio). Capa fina sobre tools/: revisar, verificar, bundle,
// más edición por diapositivas (tools/mcp/deck.mjs) y tipos de diapositiva (tools/mcp/tipos.mjs).
// Registro en Claude Code: .mcp.json en la raíz (ya incluido). A mano: node tools/mcp/servidor.mjs
// Nada se escribe en stdout salvo el protocolo: los avisos van a stderr.
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ROOT, outDir } from '../salida.mjs';
import { revisar } from '../revisar.mjs';
import { servir } from '../servidor.mjs';
import { abrirNavegador, nuevaPagina, capturar, verificar, urlDeck } from '../verificar.mjs';
import { listarDecks, leerDiapositiva, escribirDiapositiva, borrarDiapositiva, moverDiapositiva, crearDeck, rutaDeck } from './deck.mjs';
import { Spec, renderSpec, TIPOS } from './tipos.mjs';
import { rbBuscar, rbFicha, rbCodigo, rbTecnica, recetas } from './react-bits.mjs';

const SKILL = path.join(ROOT, '.claude/skills/crear-presentacion');
const STYLES = JSON.parse(fs.readFileSync(path.join(ROOT, 'themes/source.json'), 'utf8')).styles.map((s) => s.id);
const Estilo = z.enum(STYLES);
const Deck = z.string().describe('Nombre del deck en decks/ (p. ej. «roscon-2026»)');

/* ---------- navegador y servidor perezosos, compartidos entre llamadas ---------- */
let web = null;
async function navegador() {
  if (web && web.browser.isConnected()) return web;
  const srv = await servir();
  web = { srv, browser: await abrirNavegador() };
  return web;
}
async function cerrar() { if (web) { await web.browser.close().catch(() => {}); await web.srv.close(); web = null; } }
process.on('SIGINT', () => cerrar().then(() => process.exit(0)));
process.on('SIGTERM', () => cerrar().then(() => process.exit(0)));

/* ---------- respuestas ---------- */
const texto = (s) => ({ content: [{ type: 'text', text: typeof s === 'string' ? s : JSON.stringify(s, null, 2) }] });
const fallo = (e) => ({ isError: true, content: [{ type: 'text', text: e && e.message ? e.message : String(e) }] });
const seguro = (fn) => async (args) => { try { return await fn(args); } catch (e) { return fallo(e); } };
const lineas = (hs) => hs.map((h) => `${h.nivel === 'error' ? 'ERROR' : 'aviso'} ${h.where ? h.where + ' · ' : ''}${h.msg}`).join('\n') || 'sin hallazgos';

const server = new McpServer({ name: 'motor-presentaciones', version: '1.0.0' }, {
  instructions: 'Crea y revisa presentaciones HTML del motor (decks/<nombre>/index.html). Flujo: guía (recurso motor://guia) → crear_deck → diapositiva_desde_spec por cada idea (o escribir_diapositiva con HTML del catálogo) → revisar → capturar para mirar las diapositivas → empaquetar. Una idea por diapositiva, títulos de ~28 caracteres, datos inventados marcados como «Datos de ejemplo».',
});

/* ---------- recursos ---------- */
server.registerResource('guia', 'motor://guia', { title: 'Guía para crear presentaciones', mimeType: 'text/markdown' },
  async (uri) => ({ contents: [{ uri: uri.href, text: fs.readFileSync(path.join(SKILL, 'SKILL.md'), 'utf8') }] }));
server.registerResource('catalogo', 'motor://catalogo', { title: 'Catálogo de piezas, gráficos y efectos', mimeType: 'text/markdown' },
  async (uri) => ({ contents: [{ uri: uri.href, text: fs.readFileSync(path.join(SKILL, 'catalogo.md'), 'utf8') }] }));

/* ---------- herramientas ---------- */
server.registerTool('catalogo', {
  title: 'Catálogo del motor',
  description: 'Devuelve lo que se puede usar: tipos de diapositiva para diapositiva_desde_spec, estilos, efectos registrados y el catálogo de piezas y gráficos con su marcado.',
  inputSchema: { parte: z.enum(['todo', 'tipos', 'piezas']).default('todo').describe('tipos: solo los tipos de diapositiva; piezas: solo el catálogo HTML') },
  annotations: { readOnlyHint: true },
}, seguro(async ({ parte }) => {
  const code = fs.readdirSync(path.join(ROOT, 'fx')).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(ROOT, 'fx', f), 'utf8')).join('\n');
  const fx = [...new Set([...code.matchAll(/Motor\.fx\(\s*'([^']+)'/g)].map((m) => m[1]))];
  const tipos = `Tipos de diapositiva (diapositiva_desde_spec): ${TIPOS.join(', ')}.\nCampos comunes: id, seccion, titulo, kicker, notas. Detalle de cada tipo en el esquema de la herramienta.\nEstilos: ${STYLES.join(', ')}.\nEfectos data-fx registrados: ${fx.join(', ')}.`;
  if (parte === 'tipos') return texto(tipos);
  const cat = fs.readFileSync(path.join(SKILL, 'catalogo.md'), 'utf8');
  return texto(parte === 'piezas' ? cat : `${tipos}\n\n${cat}`);
}));

server.registerTool('listar_decks', {
  title: 'Listar decks', description: 'Lista los decks de decks/.', inputSchema: {}, annotations: { readOnlyHint: true },
}, seguro(async () => texto(listarDecks().join('\n'))));

server.registerTool('crear_deck', {
  title: 'Crear deck',
  description: 'Crea decks/<nombre>/index.html vacío desde la plantilla (motor, piezas, gráficos y notas ya cargados) y deck.css. Después añade diapositivas con diapositiva_desde_spec.',
  inputSchema: {
    nombre: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).describe('Carpeta del deck: minúsculas y guiones'),
    titulo: z.string().describe('Título del documento (<title>)'),
    estilo: Estilo.default('suizo').describe('Estilo por defecto'),
    estilos: z.array(Estilo).optional().describe('Estilos que se pueden elegir con la tecla S, en orden'),
    extras: z.array(z.string()).optional().describe('Opcional: katex, vc (fórmulas y fx/vc.js), d3-sankey, d3-cloud o rutas fx/<efecto>.js'),
  },
}, seguro(async ({ nombre, titulo, estilo, estilos, extras }) => texto(crearDeck({ nombre, titulo, estilo, estilos, extras: extras || [] }))));

server.registerTool('indice', {
  title: 'Índice del deck', description: 'Diapositivas del deck en orden (id, sección, título, efecto, pasos) y número de errores y avisos.',
  inputSchema: { deck: Deck }, annotations: { readOnlyHint: true },
}, seguro(async ({ deck }) => { const r = revisar(deck); return texto({ deck: r.deck, errores: r.errores, avisos: r.avisos, diapositivas: r.indice }); }));

server.registerTool('leer_diapositiva', {
  title: 'Leer diapositiva', description: 'Devuelve el HTML de una <section class="slide"> por su id.',
  inputSchema: { deck: Deck, id: z.string() }, annotations: { readOnlyHint: true },
}, seguro(async ({ deck, id }) => texto(leerDiapositiva(deck, id))));

const Despues = z.string().optional().describe('id tras el que colocarla; sin él, una nueva va antes del cierre y una existente se sustituye en su sitio');
const informe = (r) => texto(`${r.guardado === false ? 'NO GUARDADA' : 'Diapositiva #' + r.id + ' ' + r.accion}${r.motivo ? ': ' + r.motivo : ''}\n${lineas(r.hallazgos)}`);

server.registerTool('diapositiva_desde_spec', {
  title: 'Diapositiva desde especificación',
  description: `Crea o sustituye una diapositiva a partir de datos estructurados, sin escribir HTML. Tipos: ${TIPOS.join(', ')}. Revisa el resultado y no guarda si añade errores. Con solo_html devuelve el HTML sin guardarlo.`,
  inputSchema: { deck: Deck, spec: Spec, despues_de: Despues, solo_html: z.boolean().optional() },
}, seguro(async ({ deck, spec, despues_de, solo_html }) => {
  const { html } = renderSpec(spec);
  if (solo_html) return texto(html);
  return informe(escribirDiapositiva(deck, html, { despuesDe: despues_de }));
}));

server.registerTool('escribir_diapositiva', {
  title: 'Escribir diapositiva (HTML)',
  description: 'Crea o sustituye una diapositiva con HTML propio: exactamente una <section class="slide" id="…" data-section="…" data-title="…">. Para lo que los tipos no cubren (piezas, SVG con secuencia, vc-plot). Revisa y no guarda si añade errores salvo con forzar.',
  inputSchema: { deck: Deck, html: z.string(), despues_de: Despues, forzar: z.boolean().optional() },
}, seguro(async ({ deck, html, despues_de, forzar }) => informe(escribirDiapositiva(deck, html, { despuesDe: despues_de, forzar }))));

server.registerTool('borrar_diapositiva', {
  title: 'Borrar diapositiva', description: 'Quita una diapositiva del deck.', inputSchema: { deck: Deck, id: z.string() }, annotations: { destructiveHint: true },
}, seguro(async ({ deck, id }) => informe(borrarDiapositiva(deck, id))));

server.registerTool('mover_diapositiva', {
  title: 'Mover diapositiva', description: 'Coloca una diapositiva justo después de otra.', inputSchema: { deck: Deck, id: z.string(), despues_de: z.string() },
}, seguro(async ({ deck, id, despues_de }) => informe(moverDiapositiva(deck, id, despues_de))));

server.registerTool('revisar', {
  title: 'Revisar deck', description: 'Revisión estática, sin navegador: atributos, scripts, efectos, colores literales, tamaños, títulos largos y JSON de los gráficos.',
  inputSchema: { deck: Deck }, annotations: { readOnlyHint: true },
}, seguro(async ({ deck }) => { const r = revisar(deck); return texto(`${r.deck}: ${r.diapositivas} diapositivas, ${r.errores} errores, ${r.avisos} avisos\n${lineas(r.hallazgos)}`); }));

server.registerTool('capturar', {
  title: 'Capturar diapositiva',
  description: 'Devuelve la imagen de una diapositiva (960×540) en un estilo, modo y paso, con los elementos que se salen del lienzo y los errores de consola. Úsala para mirar cada diapositiva que crees.',
  inputSchema: {
    deck: Deck, id: z.string(), estilo: Estilo.optional().describe('Por defecto, el del deck'), modo: z.enum(['light', 'dark']).default('light'),
    paso: z.string().default('ultimo').describe('primero, ultimo o un número de pasos revelados'),
  },
  annotations: { readOnlyHint: true },
}, seguro(async ({ deck, id, estilo, modo, paso }) => {
  rutaDeck(deck);
  const { srv, browser } = await navegador();
  const p = await nuevaPagina(browser, { estilo, modo, escala: 0.5, reduced: true });
  try {
    const r = await capturar(p, srv.url + urlDeck(deck).ruta, id, { paso, reduced: true, formato: 'jpeg', espera: 1400 });
    const info = [`#${id} · ${estilo || 'estilo del deck'} · ${modo} · pasos ${r.pasos.mostrados}/${r.pasos.total}`,
      r.desbordes.length ? `Se salen del lienzo: ${r.desbordes.join(', ')}` : 'Nada se sale del lienzo.', ...r.errores].join('\n');
    return { content: [{ type: 'image', data: r.png.toString('base64'), mimeType: 'image/jpeg' }, { type: 'text', text: info }] };
  } finally { await p.close(); }
}));

server.registerTool('verificar', {
  title: 'Verificar deck',
  description: 'Recorre todas las diapositivas en varios estilos y en claro y oscuro; guarda las capturas en output/capturas/<deck>/ y devuelve los problemas, con la imagen de hasta 4 diapositivas afectadas.',
  inputSchema: { deck: Deck, estilos: z.array(Estilo).default(['suizo', 'noche']), paso: z.string().default('ultimo') },
  annotations: { readOnlyHint: true },
}, seguro(async ({ deck, estilos, paso }) => {
  rutaDeck(deck);
  const { srv, browser } = await navegador();
  const r = await verificar({ deck, estilos, paso, reduced: true, browser, url: srv.url });
  const content = [{ type: 'text', text: `${r.capturas.length} capturas en ${path.relative(ROOT, r.dir)}\n${r.hallazgos.map((h) => `[${h.estilo}/${h.modo}] ${h.id}: ${h.msg}`).join('\n') || 'Sin errores ni desbordes.'}` }];
  const malos = [...new Set(r.hallazgos.filter((h) => h.tipo === 'desborde').map((h) => h.id))].slice(0, 4);
  for (const id of malos) {
    const p = await nuevaPagina(browser, { estilo: estilos[0], modo: 'light', escala: 0.5, reduced: true });
    try { const c = await capturar(p, srv.url + urlDeck(deck).ruta, id, { paso, reduced: true, formato: 'jpeg' }); content.push({ type: 'image', data: c.png.toString('base64'), mimeType: 'image/jpeg' }); } finally { await p.close(); }
  }
  return { content };
}));

const run = promisify(execFile);
server.registerTool('empaquetar', {
  title: 'Empaquetar deck', description: 'Genera un único HTML con el motor en línea (para enviar o abrir con doble clic).',
  inputSchema: { deck: Deck, carpeta: z.string().optional().describe('Carpeta de salida; por defecto output/') },
}, seguro(async ({ deck, carpeta }) => {
  const f = rutaDeck(deck);
  const { stdout } = await run(process.execPath, [path.join(ROOT, 'tools/bundle.mjs'), f, `--out=${carpeta || outDir()}`], { cwd: ROOT });
  return texto(stdout.trim());
}));

/* ---------- react-bits: consulta para portar componentes (tools/mcp/react-bits.mjs) ---------- */
server.registerTool('rb_buscar', {
  title: 'Buscar en react-bits',
  description: 'Busca componentes de react-bits (218) con su veredicto para el motor (implementar, quizas, descartar), coste y equivalente ya portado. Úsala antes de portar algo o cuando pidan un efecto «como el X de react-bits».',
  inputSchema: {
    texto: z.string().optional().describe('En nombre, descripción, técnica o motivo'),
    categoria: z.enum(['Animations', 'Backgrounds', 'Components', 'Micro', 'TextAnimations']).optional(),
    veredicto: z.enum(['implementar', 'quizas', 'descartar']).optional(),
    tecnica: z.string().optional().describe('webgl, glsl, ogl, three, canvas2d, svg, motion, gsap, splittext, raton, scroll…'),
    estado: z.enum(['portado', 'quizas', 'libre']).optional().describe('portado: ya en el motor; quizas: pendiente en el Atlas; libre: sin relación'),
    limite: z.number().int().min(1).max(218).default(40),
  },
  annotations: { readOnlyHint: true },
}, seguro(async (a) => texto(rbBuscar(a))));

server.registerTool('rb_ficha', {
  title: 'Ficha de un componente de react-bits',
  description: 'Props (tipo, valor por defecto, descripción), técnicas, shaders y uniforms, eventos, veredicto y motivo, estilos que encajan y qué hay ya en el motor (componente, archivo, diapositiva del Atlas).',
  inputSchema: { nombre: z.string().describe('Nombre en react-bits, p. ej. GlitchText') },
  annotations: { readOnlyHint: true },
}, seguro(async ({ nombre }) => texto(rbFicha(nombre))));

server.registerTool('rb_codigo', {
  title: 'Código de un componente de react-bits',
  description: 'Devuelve solo la parte pedida del .jsx original, con números de línea: resumen (mapa del archivo), shaders, props, bucle (efectos con animación), eventos, css, uso o presets; o un rango desde/hasta (máx. 400 líneas).',
  inputSchema: {
    nombre: z.string(), parte: z.enum(['resumen', 'shaders', 'props', 'bucle', 'eventos', 'css', 'uso', 'presets', 'todo']).default('resumen'),
    desde: z.number().int().min(1).optional(), hasta: z.number().int().min(1).optional(),
  },
  annotations: { readOnlyHint: true },
}, seguro(async (a) => texto(rbCodigo(a))));

server.registerTool('rb_tecnica', {
  title: 'Receta para traducir una técnica de react-bits',
  description: 'Cómo se traduce al motor una técnica de react-bits (webgl, glsl, ogl, three, canvas2d, motion, gsap, svg, css-animacion, raton, raf, matter, webgpu) y ejemplos ya portados para comparar original y port.',
  inputSchema: { tecnica: z.string() },
  annotations: { readOnlyHint: true },
}, seguro(async ({ tecnica }) => texto(rbTecnica(tecnica))));
server.registerResource('recetas-react-bits', 'motor://react-bits/recetas', { title: 'Recetas para portar react-bits', mimeType: 'text/markdown' },
  async (uri) => ({ contents: [{ uri: uri.href, text: recetas() }] }));

/* ---------- prompt ---------- */
server.registerPrompt('nueva-presentacion', {
  title: 'Nueva presentación',
  description: 'Guía para crear un deck completo sobre un tema.',
  argsSchema: { tema: z.string(), nombre: z.string().optional(), estilo: z.string().optional() },
}, ({ tema, nombre, estilo }) => ({
  messages: [{ role: 'user', content: { type: 'text', text: `Crea una presentación con el motor sobre: ${tema}.
1. Lee el recurso motor://guia y llama a catalogo con parte="tipos".
2. Escribe un guion: una idea por diapositiva y, para cada una, el tipo (portada, problema, cifra, grafico, proceso, tarjetas, tabla, comparacion, cita, cierre…).
3. crear_deck${nombre ? ` con nombre «${nombre}»` : ''}${estilo ? ` y estilo ${estilo}` : ''}.
4. diapositiva_desde_spec para cada diapositiva, en orden. Títulos de ~28 caracteres; datos que no vengan del usuario, marcados como «Datos de ejemplo».
5. revisar y corregir; capturar las diapositivas en claro y en oscuro y arreglar lo que se vea mal.
6. empaquetar al final.` } }],
}));

await server.connect(new StdioServerTransport());
console.error('[motor-mcp] listo');
