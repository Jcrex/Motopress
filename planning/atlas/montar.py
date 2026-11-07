"""Monta atlas/completo/index.html a partir de los fragmentos de atlas/completo/src/ y de atlas.db.

  src/_cabecera.html            <head>, apertura de <main> y <div class="stage">
  src/l00.html … src/l12.html   diapositivas de cada lote (en orden de nombre)
  src/_pie.html                 cierre y <script>

Marcadores que se expanden en los fragmentos:
  <!-- ficha:ID -->             aside.ac-info con nombre, propósito, parámetros y fuente del componente ID
  <!-- ficha:ID ancha -->       lo mismo (la variante ancha la da la clase del contenedor)
  <!-- titulo:LNN -->           diapositiva de título del lote con la lista de sus demos
  <!-- kicker:ID -->            kicker «lNN · lote» y, si el componente es «quizás», la etiqueta experimental

No edites atlas/completo/index.html a mano: edita src/ y ejecuta  python3 planning/atlas/montar.py
"""
import glob, html, json, os, re, sqlite3

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(RAIZ, 'atlas', 'completo', 'src')
OUT = os.path.join(RAIZ, 'atlas', 'completo', 'index.html')
DB = os.path.join(RAIZ, 'planning', 'atlas', 'atlas.db')
MAX_PARAMS = 7
OCULTOS = {'uso_observado', 'veredicto_informe', 'estilos', 'coste', 'valor'}

db = sqlite3.connect(DB)
db.row_factory = sqlite3.Row
e = lambda t: html.escape(str(t), quote=False)


def valor(v):
    if isinstance(v, list):
        v = ' · '.join(str(x) for x in v)
    elif isinstance(v, dict):
        v = ' · '.join(f'{k} {x}' for k, x in v.items())
    v = str(v)
    return v if len(v) <= 70 else v[:67].rstrip() + '…'


def componente(cid):
    c = db.execute('SELECT * FROM componentes WHERE id=?', (cid,)).fetchone()
    if not c:
        raise SystemExit(f'componente desconocido en un marcador: {cid}')
    return c


def ficha(cid):
    c = componente(cid)
    par = {k: v for k, v in json.loads(c['parametros'] or '{}').items() if k not in OCULTOS}
    filas = list(par.items())[:MAX_PARAMS]
    dl = ''.join(f'<dt>{e(k)}</dt><dd>{e(valor(v))}</dd>' for k, v in filas)
    rb = [r[0] for r in db.execute("SELECT rb_nombre FROM origen_react_bits WHERE componente_id=? ORDER BY relacion, rb_nombre", (cid,))]
    fuente = c['archivo_fuente'].replace(' (aún no portado al motor)', '')
    origen = f'<span>react-bits: {e(", ".join(rb))}</span>' if rb else ''
    return (f'<aside class="ac-info panel" data-componente="{e(cid)}">'
            f'<p class="ac-nombre"><b>{e(c["nombre"])}</b><code>{e(cid)}</code></p>'
            f'<p class="ac-proposito">{e(c["proposito"])}</p>'
            + (f'<dl class="ac-params">{dl}</dl>' if dl else '')
            + f'<p class="ac-fuente"><code>{e(fuente)}</code>{origen}</p></aside>')


def kicker(cid):
    c = componente(cid)
    lote = db.execute('SELECT * FROM lotes WHERE id=?', (c['lote_id'],)).fetchone()
    exp = ' <span class="ac-exp">Experimental · quizás</span>' if c['estado_motor'] == 'quizas' else ''
    return f'<p class="kicker">{lote["id"][:3].lower()} · {e(lote["nombre"].lower())}{exp}</p>'


def titulo(lid):
    lote = db.execute('SELECT * FROM lotes WHERE id LIKE ?', (lid + '-%',)).fetchone()
    if not lote:
        raise SystemExit(f'lote desconocido: {lid}')
    comps = db.execute('SELECT id, nombre, estado_motor, slide_id FROM componentes WHERE lote_id=? ORDER BY rowid', (lote['id'],)).fetchall()
    num = lote['id'][1:3]
    lis = ''.join(f'<li><span>{e(c["nombre"])}{" <b class=\"ac-q\">quizás</b>" if c["estado_motor"] == "quizas" else ""}</span><code>{e(c["slide_id"])}</code></li>' for c in comps)
    return (f'<section class="slide" id="l{num}-titulo" data-section="{e(lote["nombre"])}" data-title="{e(lote["nombre"])}">\n'
            f'  <header class="s-head"><p class="kicker">lote {num} · {len(comps)} componentes</p><h2 class="s-title">{e(lote["nombre"])}</h2></header>\n'
            f'  <div class="s-body ac-lote"><div><p class="ac-lote-num">{num}</p><p class="ac-lote-desc">{e(lote["descripcion"])}.</p></div>'
            f'<ol class="ac-lote-demos{" largo" if len(comps) > 16 else ""}">{lis}</ol></div>\n</section>')


def main():
    partes = [open(os.path.join(SRC, '_cabecera.html'), encoding='utf-8').read()]
    for f in sorted(glob.glob(os.path.join(SRC, 'l[0-9][0-9].html'))):
        partes.append(open(f, encoding='utf-8').read())
    partes.append(open(os.path.join(SRC, '_pie.html'), encoding='utf-8').read())
    out = '\n'.join(partes)
    out = re.sub(r'<!-- ficha:([a-z0-9-]+)(?: ancha)? -->', lambda m: ficha(m.group(1)), out)
    out = re.sub(r'<!-- kicker:([a-z0-9-]+) -->', lambda m: kicker(m.group(1)), out)
    out = re.sub(r'<!-- titulo:(L\d\d) -->', lambda m: titulo(m.group(1)), out)
    ids = re.findall(r'<section[^>]*\bid="([^"]+)"', out)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        raise SystemExit(f'ids repetidos: {dup}')
    aviso = '<!-- GENERADO por planning/atlas/montar.py a partir de atlas/completo/src/. No editar a mano. -->\n'
    open(OUT, 'w', encoding='utf-8').write(out.replace('<!doctype html>\n', '<!doctype html>\n' + aviso, 1))
    print(f'{os.path.relpath(OUT, RAIZ)} · {len(ids)} diapositivas')


if __name__ == '__main__':
    main()
