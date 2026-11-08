"""Añade a planning/atlas/atlas.db la documentación de react-bits y su relación con los componentes del motor.

Lee (sin ejecutar nada) un clon de https://github.com/DavidHDev/react-bits:
  src/content/<Cat>/<Nombre>/<Nombre>.jsx|.css   código del componente
  src/demo/<Cat>/<Nombre>Demo.jsx                 tabla de props (propData): nombre, tipo, valor por defecto, descripción
  src/demo/<Cat>/presets/<Nombre>.js              presets de la demo, si los hay
  src/constants/code/<Cat>/<nombre>Code.js        ejemplo de uso
  public/r/<Nombre>-JS-CSS.json                   descripción del registro y variantes disponibles
  planning/atlas/react-bits/*.md                  veredicto, motivo, técnica, valor, coste y estilos de los informes
Tablas nuevas:
  react_bits(nombre, categoria, ruta_jsx, ruta_css, ruta_demo, ruta_presets, ruta_codigo, dependencias, props, uso, lineas_jsx,
             descripcion, veredicto, motivo, tecnica, valor, coste, estilos, tecnicas, shaders, uniforms, eventos, variantes)
    tecnicas, uniforms, eventos y variantes son JSON; shaders es el número de shaders GLSL del .jsx
  origen_react_bits(componente_id, rb_nombre, relacion)   relacion: base | inspiracion | fusion
  meta(clave, valor)                                       commit del clon y ruta
Uso: python3 planning/atlas/react_bits.py [ruta-al-clon]   (por defecto ~/Proyectos/react-bits)
Ejecutar después de construir_db.py, que rehace la base.
"""
import glob, json, os, re, sqlite3, subprocess, sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DB = os.path.join(RAIZ, 'planning', 'atlas', 'atlas.db')
RB = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Proyectos/react-bits'))

# Componentes del motor que ya portan o se inspiran en uno de react-bits (según los informes y la memoria del proyecto).
IMPLEMENTADOS = {
    'cifra': [('CountUp', 'base'), ('Counter', 'base')],
    'etapas': [('Stepper', 'base')],
    'mazo': [('CardSwap', 'base'), ('Stack', 'inspiracion')],
    'bento': [('MagicBento', 'base'), ('SpotlightCard', 'inspiracion'), ('ChromaGrid', 'inspiracion')],
    'agenda': [('LineSidebar', 'base'), ('FlowingMenu', 'inspiracion')],
    'checklist': [('StatusMark', 'base'), ('SpringCheck', 'inspiracion')],
    'reticula': [('TargetCursor', 'base'), ('Crosshair', 'inspiracion')],
    'chispa': [('StarBorder', 'base')],
    'rayo': [('ElectricBorder', 'base')],
    'deposito': [('SloshGauge', 'base')],
    'descifra': [('DecryptedText', 'base'), ('Shuffle', 'inspiracion'), ('ScrambledText', 'inspiracion')],
    'titulo-descifra': [('DecryptedText', 'base')],
    'paleta': [('SplitFlapText', 'base')],
    'teclea': [('TextType', 'base')],
    'data-reveal': [('AnimatedContent', 'base'), ('FadeContent', 'base')],
    'data-title-fx': [('SplitText', 'base')],
    'titulo-rise': [('SplitText', 'base')],
    'titulo-mask-lines': [('SplitText', 'base')],
    'titulo-blur': [('BlurText', 'base')],
    'titulo-pliega': [('SplitText', 'base'), ('FoldText', 'inspiracion')],
    'titulo-cromo-sheen': [('ShinyText', 'inspiracion')],
    'titulo-termica-heat': [('GradientText', 'inspiracion')],
    'pintor-grano': [('Grainient', 'base')],
    'pintor-hilos': [('Threads', 'base')],
    'pintor-radar': [('Radar', 'base')],
    'pintor-topo': [('Topography', 'base')],
    'pintor-isolineas': [('FluxLines', 'base')],
    'pintor-escaner': [('GridScan', 'base')],
    'pintor-velo': [('Aurora', 'base')],
    'focus-border': [('BorderGlow', 'inspiracion')],
}

STR = r"""(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`)"""


def s(m):
    return next((g for g in m.groups() if g is not None), '') if m else ''


def props_de(demo):
    """Filas de propData: [{name, type, default, description}]."""
    if not demo:
        return []
    txt = open(demo, encoding='utf-8').read()
    i = txt.find('propData')
    if i < 0:
        return []
    j = txt.find('[', i)
    depth, k = 0, j
    for k in range(j, len(txt)):
        depth += txt[k] == '['
        depth -= txt[k] == ']'
        if depth == 0:
            break
    bloque = txt[j:k + 1]
    out = []
    for obj in re.split(r'\{\s*(?=name\s*:)', bloque)[1:]:
        fila = {}
        for campo in ('name', 'type', 'default', 'description'):
            m = re.search(campo + r'\s*:\s*' + STR, obj, re.S)
            fila[campo] = re.sub(r'\s+', ' ', s(m)).strip()
        if fila['name']:
            out.append(fila)
    return out


# Técnicas que se detectan en el .jsx (búsqueda por patrones: orientativa)
TECNICAS = {
    'webgl': r"getContext\(\s*['\"]webgl2?", 'glsl': r"gl_FragColor|out\s+vec4|precision\s+(?:high|medium)p", 'ogl': r"from\s+['\"]ogl",
    'three': r"from\s+['\"]three", 'webgpu': r"from\s+['\"]vgpu|navigator\.gpu", 'canvas2d': r"getContext\(\s*['\"]2d", 'svg': r"<svg\b",
    'filtro-svg': r"<fe[A-Z]", 'motion': r"from\s+['\"]motion", 'gsap': r"from\s+['\"]gsap", 'splittext': r"SplitText",
    'scrolltrigger': r"ScrollTrigger", 'matter': r"matter-js", 'raf': r"requestAnimationFrame", 'resize': r"ResizeObserver",
    'visibilidad': r"IntersectionObserver|useInView|whileInView", 'raton': r"mousemove|pointermove|onMouseMove|onPointerMove",
    'hover': r"onMouseEnter|onMouseLeave|onHoverStart|whileHover", 'clic': r"onClick|onPointerDown|onMouseDown|whileTap",
    'arrastre': r"drag|onPointerUp", 'scroll': r"\bscroll|onWheel|['\"]wheel['\"]", 'teclado': r"keydown|onKeyDown", 'sonido': r"AudioContext|new Audio\(",
    'css-animacion': r"@keyframes|animation\s*:",
}
VEREDICTO = {'IMPLEMENTAR': 'implementar', 'QUIZÁ': 'quizas', 'QUIZA': 'quizas', 'DESCARTAR': 'descartar'}


def ficha_tecnica(src, css):
    """tecnicas, número de shaders, uniforms y eventos del código."""
    todo = src + '\n' + (css or '')
    tec = [k for k, r in TECNICAS.items() if re.search(r, todo)]
    plantillas = re.findall(r'`((?:[^`\\]|\\.)*)`', src, re.S)
    shaders = [t for t in plantillas if re.search(r'void\s+main\s*\(', t)]
    uniforms = sorted({u for t in shaders for u in re.findall(r'uniform\s+\w+\s+(\w+)', t)})
    eventos = sorted(set(re.findall(r"addEventListener\(\s*['\"](\w+)", src)) | set(re.findall(r'\b(on(?:Mouse|Pointer|Click|Wheel|Key|Touch|Hover|Drag)\w*)\s*=', src)))
    return tec, len(shaders), uniforms, eventos


def informes():
    """{nombre: {veredicto, motivo, tecnica, valor, coste, estilos, que_hace}} leyendo cada tabla por el nombre de sus columnas."""
    out = {}
    for f in sorted(glob.glob(os.path.join(RAIZ, 'planning', 'atlas', 'react-bits', '*.md'))):
        cab = None
        for linea in open(f, encoding='utf-8'):
            if not linea.startswith('|'):
                cab = None; continue
            celdas = [c.strip() for c in linea.strip().strip('|').split('|')]
            if cab is None:
                cab = [c.lower() for c in celdas]; continue
            if set(''.join(celdas)) <= set('-: '):
                continue
            col = lambda *claves: next((celdas[i] for i, h in enumerate(cab) if i < len(celdas) and any(k in h for k in claves)), '')
            nombre = re.sub(r'[`*]', '', col('componente')).strip()
            ver = col('veredicto').replace('*', '').strip()
            if not nombre or not ver:
                continue
            base = re.match(r'([A-ZÁ]+)', ver)
            m = re.search(r'\((.*)\)\s*$', ver)
            out[nombre] = {
                'veredicto': VEREDICTO.get(base.group(1) if base else '', None), 'motivo': m.group(1) if m else '',
                'tecnica': col('técnica', 'tecnica'), 'valor': col('valor'), 'coste': col('coste'), 'estilos': col('estilos'),
                'que_hace': col('qué hace', 'que hace'),
            }
    return out


def main():
    if not os.path.isdir(os.path.join(RB, 'src', 'content')):
        raise SystemExit(f'no encuentro el clon de react-bits en {RB}')
    commit = subprocess.run(['git', '-C', RB, 'log', '-1', '--format=%H %cs'], capture_output=True, text=True).stdout.strip()
    db = sqlite3.connect(DB)
    try:
        antes = {r[0] for r in db.execute('SELECT nombre FROM react_bits')}
        commit_antes = (db.execute("SELECT valor FROM meta WHERE clave='react_bits_commit'").fetchone() or [''])[0]
    except sqlite3.OperationalError:
        antes, commit_antes = set(), ''
    db.executescript('''
    DROP TABLE IF EXISTS react_bits; DROP TABLE IF EXISTS origen_react_bits; DROP TABLE IF EXISTS meta;
    CREATE TABLE meta (clave TEXT PRIMARY KEY, valor TEXT);
    CREATE TABLE react_bits (
      nombre TEXT PRIMARY KEY, categoria TEXT NOT NULL, ruta_jsx TEXT, ruta_css TEXT, ruta_demo TEXT, ruta_presets TEXT,
      ruta_codigo TEXT, dependencias TEXT, props TEXT, uso TEXT, lineas_jsx INTEGER,
      descripcion TEXT, veredicto TEXT CHECK (veredicto IN ('implementar','quizas','descartar')), motivo TEXT, tecnica TEXT,
      valor TEXT, coste TEXT, estilos TEXT, tecnicas TEXT, shaders INTEGER, uniforms TEXT, eventos TEXT, variantes TEXT);
    CREATE TABLE origen_react_bits (
      componente_id TEXT NOT NULL REFERENCES componentes(id), rb_nombre TEXT NOT NULL REFERENCES react_bits(nombre),
      relacion TEXT CHECK (relacion IN ('base','inspiracion','fusion')), PRIMARY KEY (componente_id, rb_nombre));''')
    db.execute('INSERT INTO meta VALUES (?,?)', ('react_bits_commit', commit))
    db.execute('INSERT INTO meta VALUES (?,?)', ('react_bits_ruta', os.path.relpath(RB, RAIZ)))
    rel = lambda p: os.path.relpath(p, RB) if p else None
    inf = informes()
    for d in sorted(glob.glob(os.path.join(RB, 'src', 'content', '*', '*'))):
        cat, nom = d.split(os.sep)[-2:]
        jsx = next(iter(glob.glob(os.path.join(d, nom + '.jsx')) or glob.glob(os.path.join(d, '*.jsx'))), None)
        css = next(iter(glob.glob(os.path.join(d, '*.css'))), None)
        demo = next(iter(glob.glob(os.path.join(RB, 'src', 'demo', cat, nom + 'Demo.jsx'))), None)
        pre = next(iter(glob.glob(os.path.join(RB, 'src', 'demo', cat, 'presets', nom + '.js'))), None)
        code = next((f for f in glob.glob(os.path.join(RB, 'src', 'constants', 'code', cat, '*Code.js')) if os.path.basename(f).lower() == nom.lower() + 'code.js'), None)
        src = open(jsx, encoding='utf-8').read() if jsx else ''
        deps = sorted({m for m in re.findall(r"""from\s+['"]([^'"./][^'"]*)['"]""", src) if m != 'react'})
        uso = ''
        if code:
            m = re.search(r'usage\s*:\s*`((?:[^`\\]|\\.)*)`', open(code, encoding='utf-8').read(), re.S)
            uso = m.group(1) if m else ''
        reg = os.path.join(RB, 'public', 'r', nom + '-JS-CSS.json')
        desc = json.load(open(reg, encoding='utf-8')).get('description', '') if os.path.exists(reg) else ''
        variantes = sorted(os.path.basename(f)[len(nom) + 1:-5] for f in glob.glob(os.path.join(RB, 'public', 'r', nom + '-*.json')))
        tec, nsh, unis, evs = ficha_tecnica(src, open(css, encoding='utf-8').read() if css else '')
        i = inf.get(nom, {})
        db.execute('INSERT INTO react_bits VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', (
            nom, cat, rel(jsx), rel(css), rel(demo), rel(pre), rel(code), json.dumps(deps), json.dumps(props_de(demo), ensure_ascii=False),
            uso, src.count('\n') + 1 if src else 0, desc or i.get('que_hace', ''), i.get('veredicto'), i.get('motivo'), i.get('tecnica'),
            i.get('valor'), i.get('coste'), i.get('estilos'), json.dumps(tec), nsh, json.dumps(unis), json.dumps(evs), json.dumps(variantes)))
    rb = {r[0] for r in db.execute('SELECT nombre FROM react_bits')}
    sin_informe = sorted(set(inf) - rb)
    nuevos, quitados = (sorted(rb - antes), sorted(antes - rb)) if antes else ([], [])
    db.execute('INSERT INTO meta VALUES (?,?)', ('react_bits_nuevos', json.dumps(nuevos)))
    db.execute('INSERT INTO meta VALUES (?,?)', ('react_bits_quitados', json.dumps(quitados)))
    if commit_antes and commit_antes != commit:
        db.execute('INSERT INTO meta VALUES (?,?)', ('react_bits_commit_anterior', commit_antes))
    faltan = []
    for cid, origen in db.execute("SELECT id, origen FROM componentes WHERE origen IS NOT NULL").fetchall():
        (rb_ok := origen in rb) or faltan.append(origen)
        if rb_ok:
            db.execute('INSERT INTO origen_react_bits VALUES (?,?,?)', (cid, origen, 'base'))
    for cid, lst in IMPLEMENTADOS.items():
        if not db.execute('SELECT 1 FROM componentes WHERE id=?', (cid,)).fetchone():
            raise SystemExit(f'componente desconocido: {cid}')
        for nom, relacion in lst:
            if nom not in rb:
                faltan.append(nom); continue
            db.execute('INSERT OR REPLACE INTO origen_react_bits VALUES (?,?,?)', (cid, nom, relacion))
    # ruta real del código de react-bits en los «quizás»
    for cid, nom, cat, jsx in db.execute('''SELECT c.id, r.nombre, r.categoria, r.ruta_jsx FROM componentes c
            JOIN react_bits r ON r.nombre = c.origen WHERE c.estado_motor = 'quizas' ''').fetchall():
        db.execute("UPDATE componentes SET archivo_fuente=? WHERE id=? AND (archivo_fuente IS NULL OR archivo_fuente NOT LIKE 'fx/%')",
                   (f'react-bits/{jsx} (aún no portado al motor)', cid))
    db.commit()
    print('commit', commit)
    print('componentes de react-bits', len(rb), '· sin props documentadas', db.execute("SELECT COUNT(*) FROM react_bits WHERE props='[]'").fetchone()[0])
    print('enlaces', db.execute('SELECT relacion, COUNT(*) FROM origen_react_bits GROUP BY relacion').fetchall())
    print('quizás sin carpeta en react-bits:', faltan or 'ninguno')
    print('veredictos', db.execute('SELECT veredicto, COUNT(*) FROM react_bits GROUP BY 1').fetchall())
    print('filas de informe sin componente:', sin_informe or 'ninguna')
    print('nuevos desde la última ejecución:', nuevos or 'ninguno', '· quitados:', quitados or 'ninguno')


if __name__ == '__main__':
    main()
