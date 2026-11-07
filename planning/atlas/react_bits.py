"""Añade a planning/atlas/atlas.db la documentación de react-bits y su relación con los componentes del motor.

Lee (sin ejecutar nada) un clon de https://github.com/DavidHDev/react-bits:
  src/content/<Cat>/<Nombre>/<Nombre>.jsx|.css   código del componente
  src/demo/<Cat>/<Nombre>Demo.jsx                 tabla de props (propData): nombre, tipo, valor por defecto, descripción
  src/demo/<Cat>/presets/<Nombre>.js              presets de la demo, si los hay
  src/constants/code/<Cat>/<nombre>Code.js        ejemplo de uso
Tablas nuevas:
  react_bits(nombre, categoria, ruta_jsx, ruta_css, ruta_demo, ruta_presets, ruta_codigo, dependencias, props, uso, lineas_jsx)
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


def main():
    if not os.path.isdir(os.path.join(RB, 'src', 'content')):
        raise SystemExit(f'no encuentro el clon de react-bits en {RB}')
    commit = subprocess.run(['git', '-C', RB, 'log', '-1', '--format=%H %cs'], capture_output=True, text=True).stdout.strip()
    db = sqlite3.connect(DB)
    db.executescript('''
    DROP TABLE IF EXISTS react_bits; DROP TABLE IF EXISTS origen_react_bits; DROP TABLE IF EXISTS meta;
    CREATE TABLE meta (clave TEXT PRIMARY KEY, valor TEXT);
    CREATE TABLE react_bits (
      nombre TEXT PRIMARY KEY, categoria TEXT NOT NULL, ruta_jsx TEXT, ruta_css TEXT, ruta_demo TEXT, ruta_presets TEXT,
      ruta_codigo TEXT, dependencias TEXT, props TEXT, uso TEXT, lineas_jsx INTEGER);
    CREATE TABLE origen_react_bits (
      componente_id TEXT NOT NULL REFERENCES componentes(id), rb_nombre TEXT NOT NULL REFERENCES react_bits(nombre),
      relacion TEXT CHECK (relacion IN ('base','inspiracion','fusion')), PRIMARY KEY (componente_id, rb_nombre));''')
    db.execute('INSERT INTO meta VALUES (?,?)', ('react_bits_commit', commit))
    db.execute('INSERT INTO meta VALUES (?,?)', ('react_bits_ruta', os.path.relpath(RB, RAIZ)))
    rel = lambda p: os.path.relpath(p, RB) if p else None
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
        db.execute('INSERT INTO react_bits VALUES (?,?,?,?,?,?,?,?,?,?,?)', (
            nom, cat, rel(jsx), rel(css), rel(demo), rel(pre), rel(code), json.dumps(deps), json.dumps(props_de(demo), ensure_ascii=False),
            uso, src.count('\n') + 1 if src else 0))
    rb = {r[0] for r in db.execute('SELECT nombre FROM react_bits')}
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
        db.execute('UPDATE componentes SET archivo_fuente=? WHERE id=?', (f'react-bits/{jsx} (aún no portado al motor)', cid))
    db.commit()
    print('commit', commit)
    print('componentes de react-bits', len(rb), '· sin props documentadas', db.execute("SELECT COUNT(*) FROM react_bits WHERE props='[]'").fetchone()[0])
    print('enlaces', db.execute('SELECT relacion, COUNT(*) FROM origen_react_bits GROUP BY relacion').fetchall())
    print('quizás sin carpeta en react-bits:', faltan or 'ninguno')


if __name__ == '__main__':
    main()
