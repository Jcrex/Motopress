"""Genera los subplanes del Atlas Completo a partir de atlas.db.

Escribe planning/atlas/<lote>/plan.md, un .md por sublote y 00-indice.md. Rellena componentes.slide_id
(id previsto de la diapositiva) y lotes.diapositivas_est. Las demos de los componentes implementados están
escritas a mano en DEMO; las de los «quizás» salen de la documentación de react-bits (tabla react_bits).

Uso: python3 planning/atlas/generar_planes.py   (después de construir_db.py y react_bits.py)
Sobrescribe los plan.md: el progreso vive en atlas.db (explicado, diapositivas) y se refleja al regenerar.
"""
import json, os, re, sqlite3

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PLAN = os.path.join(RAIZ, 'planning', 'atlas')
DB = os.path.join(PLAN, 'atlas.db')
DECK = 'atlas/completo/index.html'
RBR = '../../../../../react-bits'  # ~/Proyectos/react-bits visto desde planning/atlas/<lote>/
RBR_TXT = '~/Proyectos/react-bits'

# --------------------------------------------------------------------------------------------
# Demo de cada componente implementado: (qué se ve en la diapositiva, criterio de aceptación propio)
DEMO = {
    # L01
    'lienzo': ('Marco del lienzo a escala con cotas de 1920×1080, márgenes 120/128/140 y el rectángulo del cuerpo útil 1664×630 dibujados en SVG sobre la propia diapositiva', 'Las cotas coinciden con getBoundingClientRect del .s-body dividido por la escala'),
    'anatomia-slide': ('La propia diapositiva con cada parte señalada: kicker, s-title, s-body y los atributos id/data-section/data-title escritos junto a su caja', 'Cada etiqueta apunta a un elemento real de la diapositiva'),
    'navegacion-teclado': ('Teclado en .keycap con las teclas agrupadas por acción; un data-step por grupo que lo resalta', 'Las teclas listadas son exactamente las de onKey() en engine.js'),
    'navegacion-tactil': ('Esquema de un gesto de deslizamiento con el umbral de 50 px y la relación 1,3 dibujados; animación del dedo en play()', 'El estado final muestra el gesto completo sin animar'),
    'ancla-url': ('Barra de dirección simulada con #id y un enlace real a #l01-hud que salta a esa diapositiva', 'El enlace navega al hacer clic y la URL cambia'),
    'pasos': ('Tres bloques con data-step que aparecen con → y un contador api.step/api.steps en vivo', 'El contador vale 0/3, 1/3, 2/3 y 3/3 al pulsar →; en la vista general muestra 3/3'),
    'hud': ('Captura anotada del HUD con contador, selector y botones; nota de la tecla H', 'Las piezas anotadas existen en buildHud()'),
    'barra-progreso': ('Réplica ampliada de .progress con su valor en esta diapositiva y la fórmula índice/total', 'El valor mostrado coincide con el de la barra real'),
    'vista-general': ('Rejilla de miniaturas de ejemplo y las teclas O/Escape; botón que llama a la vista general real', 'El botón abre la vista general y Escape la cierra'),
    'pantalla-completa': ('Botón que alterna pantalla completa y la tecla F', 'El botón funciona y no lanza error si el navegador lo deniega'),
    'selector-estilo': ('Los diez estilos con su tecla 1…0 y un botón por estilo que llama a setStyle', 'Pulsar un botón cambia el estilo de todo el deck'),
    'modo-claro-oscuro': ('Dos medias diapositivas con data-theme fijo claro y oscuro una junto a otra, y la tecla D', 'Los dos lados usan tokens distintos del mismo estilo'),
    'preferencias': ('Lectura en vivo de localStorage con las claves style y mode del motor', 'La lectura cambia al pulsar S o D y se protege con try/catch'),
    'motor-pick': ('Bloque de código con window.MOTOR_PICK y la lista resultante de este deck', 'La lista coincide con el selector del HUD'),
    'decorado-slide': ('El decorado real de esta diapositiva en los diez estilos, como miniaturas estáticas con su nombre', 'Cada miniatura muestra el decorado de su estilo'),
    'ciclo-fx': ('Efecto de ejemplo atlas-ciclo que escribe en un registro cada llamada a render, play, step y stop con su hora', 'El registro muestra render al entrar, play si no hay movimiento reducido y step con cada →'),
    'eventos-motor': ('Registro en vivo de motor:enter, motor:step y motor:leave con su detail', 'Al pulsar → aparece motor:step con step y dir'),
    'movimiento-reducido': ('La misma animación en dos paneles: uno con play() y otro forzado a api.reduced, con la regla escrita', 'El panel reducido muestra el estado final sin moverse'),
    'impresion-pdf': ('Hoja A del PDF simulada a escala con lo que se oculta (HUD, barra) tachado; enlace a imprimir', 'window.print() abre el diálogo'),
    # L02
    'api-dom': ('Dos listas idénticas en dos diapositivas; api.qa solo resalta las de esta', 'El recuento de api.qa no incluye elementos de otras diapositivas'),
    'api-tokens': ('Tabla en vivo de api.tok para bg, fg, accent, ok, warn, err con su muestra, más api.style, api.dark y api.meta.name', 'Los valores cambian al cambiar de estilo y modo'),
    'api-series': ('Barras con api.cats(6), rampa con api.seq de 0 a 1 y rampa con api.div de 0 a 1', 'Seis series en orden cat-1…cat-6 y rampas continuas'),
    'api-font': ('Cuatro líneas en canvas con api.font para display, text, mono y serif', 'Cada línea usa la familia del estilo activo'),
    'api-tiempo': ('Tres pistas: raf (punto en bucle), after (marca a los 800 ms) y tween (barra con api.ease); duración api.dur escrita', 'Al salir de la diapositiva los bucles se paran (sin trabajo en segundo plano)'),
    'api-canvas': ('Canvas con líneas de 1 px y el ratio devuelto escrito', 'Las líneas se ven nítidas a la escala actual'),
    'api-rng-noise': ('Puntos de api.rng con semilla fija junto a un campo de api.noise2 en escala seq; selector de dos semillas', 'La misma semilla da el mismo dibujo al recargar'),
    'motor-gl': ('Sombreador mínimo GLSL 3.00 con Motor.gl.layer/program/drawFull y una etiqueta WebGL2/WebGL1/2D según lo obtenido', 'Sin WebGL muestra la etiqueta de respaldo, sin error'),
    'motor-util': ('Curva bezier(api.tok("ease")) dibujada y ejemplos de clamp y lerp con sus resultados', 'La curva es la del estilo activo'),
    # L03
    **{f'estilo-{s}': (f'La diapositiva fija data-style="{s}" en su vista previa: muestra de paneles, título, fondo y la ficha del estilo (fuentes, fondo, transición, preset de título y revelado)', f'La vista previa se ve en {s} aunque el deck esté en otro estilo') for s in ['rice', 'noche', 'suizo', 'aurora', 'cromo', 'arcilla', 'nube', 'termica', 'celula', 'matriz']},
    'tokens-color': ('Tabla de los tokens de rol con muestra, valor y contraste con bg (Motor.color.contrast + wcag) en el estilo activo', 'Todos los textos en fg, fg-2 y fg-3 indican su nivel WCAG'),
    'tokens-forma-movimiento': ('Fichas de radio, familias tipográficas y una bola que se mueve con --dur y --ease del estilo', 'Los valores escritos salen de api.tok'),
    'paletas-graficos': ('Series cat-1…6, seq y div del estilo con simulación protan y deutan debajo y ΔE entre vecinas', 'Ninguna pareja vecina queda por debajo de ΔE 8 en el informe'),
    'meta-estilos': ('Ficha de themes/meta.js del estilo activo: armonía, contrastes de Itten y fuentes', 'Se lee de window.MOTOR_STYLES'),
    # L04
    'view-transitions': ('Esquema de go() → swap() con View Transitions y respaldo, más un botón que salta a la diapositiva siguiente', 'Con View Transitions desactivadas el salto ocurre igual'),
    **{f'transicion-{s}': (f'Botón «ver transición» que pone data-style="{s}" y avanza a una diapositiva espejo y vuelve; fotogramas clave escritos', f'La transición se ve en {s} y el estilo previo se restaura al volver') for s in ['rice', 'noche', 'suizo', 'aurora', 'cromo', 'arcilla', 'nube', 'termica', 'celula', 'matriz']},
    # L05
    'stack-row': ('Tres paneles en .stack y tres en .row lado a lado', 'El espaciado sale del estilo'),
    'panel': ('Tres paneles .panel con distinto contenido', 'Los paneles respetan el tratamiento del estilo (clip-path en noche, transparentes en suizo)'),
    'lecturas': ('Cuatro lecturas .readout con .label y .value de telemetría de ejemplo', 'Los valores usan cifras tabulares'),
    'leyenda': ('.legend con seis series cat-1…6 sobre un gráfico de líneas mínimo', 'El texto de la leyenda va en fg, no en el color de la serie'),
    'nota': ('Gráfico con .note al pie que marca los datos como sintéticos', 'La nota mide al menos 22 px'),
    'chip': ('Fila de .chip con categorías y estados ok/warn/err con palabra', 'Cada estado lleva su palabra'),
    'keycap': ('Atajos del motor en .keycap', '—'),
    'ventana': ('.win con .win-bar y .win-body que contiene código', '—'),
    'terminal': ('.term con una sesión de ejemplo', 'Usa la fuente mono del estilo'),
    'texto-utilidades': ('Un párrafo por clase: .lead, .muted, .faint, .mono, .num y .fill', '—'),
    'portada-divider': ('Miniatura de una portada .is-plain.divider con su fx-bg, y el marcado al lado', 'La miniatura muestra el fondo del estilo'),
    'host-fx': ('Contenedor .fx con data-role marcado con su contorno y el código que lo busca', '—'),
    'focus-border': ('Panel y ventana con .focus-border y .win.is-focus, forzados a data-style="rice"', 'El borde gira en rice; en otros estilos se explica que no aplica'),
    # L06
    'data-title-fx': ('Título de muestra y botones para auto, none y cada preset; al pulsar se repite la entrada', 'Cada botón reproduce el preset elegido'),
    **{f'titulo-{p}': (f'La diapositiva usa data-title-fx="{p}"; un botón repite la entrada; ficha con los estilos que lo usan por defecto', 'El título entra con el preset al llegar a la diapositiva y queda en su estado final') for p in ['rise', 'mask-lines', 'blur', 'pliega', 'enfoca', 'descifra']},
    'titulo-cromo-sheen': ('Título grande forzado a data-style="cromo" con el brillo', 'El brillo recorre el texto; con movimiento reducido queda quieto'),
    'titulo-termica-heat': ('Título grande forzado a data-style="termica" con el gradiente', 'El gradiente sube; con movimiento reducido queda quieto'),
    'descifra': ('Tres líneas .descifra con data-orden start, center y random', 'Las tres terminan con el texto real'),
    'cifra': ('Dos .cifra (count y roll) con data-pre/data-suf/data-dec y una .cifra-delta sube y otra baja', 'Las cifras se ven completas en la vista general'),
    'paleta': ('.paleta con data-words y otra con data-pasos que cambia de palabra con →', 'La versión por pasos muestra la palabra del paso actual'),
    'teclea': ('.term.teclea con dos comandos y su salida', 'Sin animación se ven los comandos completos'),
    # L08
    'backdrop': ('Portada con data-fx="backdrop" y dos semillas en botones (data-seed) que redibujan el fondo', 'Cambiar la semilla cambia el dibujo de forma determinista'),
    'data-painter': ('Portada con data-painter="noche:escaner aurora:hilos" y el texto que explica qué pintor toca en el estilo activo', 'El texto coincide con el pintor dibujado en cada estilo'),
    'motor-painters': ('Pintor mínimo de ejemplo atlas-ejemplo registrado en la diapositiva (init + frame) dibujando un degradado con tokens', 'Aparece en Motor.painters y respeta api.reduced'),
    **{f'pintor-{p}': (f'Portada a sangre con data-fx="backdrop" y data-painter="{p}"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo', 'Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título') for p in ['rice', 'noche', 'suizo', 'aurora', 'cromo', 'arcilla', 'nube', 'termica', 'celula', 'matriz', 'grano', 'hilos', 'radar', 'topo', 'isolineas', 'escaner', 'velo', 'none']},
    # L09
    'etapas': ('.etapas horizontal de cinco fases y .etapas.v vertical de tres, con data-step', 'Cada → marca una fase como hecha y la siguiente en curso'),
    'checklist': ('.checklist con cuatro hitos (ok, warn, err) y .checklist.tacha', 'Cada estado lleva su palabra'),
    'agenda': ('.agenda del deck con la sección actual destacada y .agenda.banda', 'La sección destacada es L09'),
    'reticula': ('.reticula sobre una imagen sintética con tres objetivos data-target y data-label', 'Las esquinas saltan al objetivo de cada paso'),
    'bento': ('.bento con celdas w2, h2 y foco por pasos', 'Cada → enfoca una celda'),
    'mazo': ('.mazo de cuatro tarjetas y .mazo.plana', 'Cada → manda la delantera al fondo'),
    'chispa': ('Tres paneles; uno con .chispa', 'La chispa recorre el borde; con movimiento reducido no se mueve'),
    'rayo': ('Tres paneles; uno con .rayo', 'El borde se ve también en noche, que recorta con clip-path'),
    'deposito': ('Tres .deposito: normal, bajo y crítico', 'Cada estado lleva su palabra'),
    # L11
    'vc': ('Diapositiva con data-fx="vc" que contiene una vc-conv pequeña, una vc-plot y elementos data-seq', 'Los tres conviven y secuencia revela en orden'),
    'vc-conv': ('vc-conv 5×5 con núcleo 3×3 en modo conv y otra en corr', 'La salida mostrada es la convolución correcta'),
    'vc-plot': ('vc-plot con dos curvas γ, leyenda tr y puntos marcados', 'Ejes con decimales automáticos'),
    'vc-heat': ('vc-heat de un núcleo con signo (div) y otro sin signo (seq)', 'Los números van en fg'),
    'vc-katex': ('Fórmula de la convolución en bloque y otra en línea', 'Requiere KaTeX desde CDN con versión fija; sin red se ve el texto fuente'),
    'vc-codigo': ('pre.code con una función Python de ejemplo', 'Palabras clave, cadenas y comentarios coloreados con tokens'),
    'notas-orador': ('aside.notes de ejemplo y la tecla N', 'N abre la ventana con estas notas'),
    'pausa-videos': ('Vídeo corto sintético (canvas grabado o el de ns-g1) que se pausa al salir', 'Al volver el vídeo está en pausa'),
    'ns-hilo': ('Tres .hilo con data-on="1-3", "5" y "6,7,8"', 'La etapa 5 lleva rombo en los tres'),
    'ns-video-auto': ('video[data-auto] con un vídeo local de atlas/completo/media/', 'Arranca al entrar y se pausa al salir; con movimiento reducido no arranca'),
    'fx-ns-g1': ('Modelo del Unitree G1 con three.js y el STL copiados a atlas/completo/vendor/', 'Gira en play(); sin WebGL o con file:// muestra la imagen de respaldo'),
    # L12
    'tool-build-themes': ('Orden node tools/build-themes.mjs --report y un extracto real de su salida', 'La salida es una captura real, no inventada'),
    'tool-bundle': ('Órdenes de bundle con y sin destino y --fragment, y el tamaño real del Atlas Completo empaquetado', 'El tamaño se mide al cerrar el lote'),
    'tool-verificar': ('Orden de verificar con estilos y su salida real sobre este deck', 'La salida es la de la última pasada'),
    'tool-salida': ('Tabla de prioridad --out > MOTOR_OUT > output/ con un ejemplo de cada una', '—'),
}
for i in ['estilos', 'teoria', 'rueda', 'tipo', 'paletas', 'refs', 'compare', 'rosgraph', 'lidar', 'astar', 'tftree', 'blueprint', 'scope',
          'training', 'confusion', 'latent', 'nnet', 'clouds', 'ridge', 'calendar', 'sankey', 'kpis', 'desktop', 'fetch']:
    DEMO[f'fx-{i}'] = (f'El efecto {i} con el mismo marcado (data-role) que en el Atlas original, reducido al ancho de la demo para dejar sitio a la ficha', 'Mismo estado final que en el Atlas original en suizo y noche')
for i in ['op-pila', 'op-ritmo', 'op-donde', 'op-slam', 'op-grafo', 'op-costmap', 'op-parseo', 'op-rai', 'op-cifras', 'op-laya', 'op-puerta', 'op-e1', 'op-montaje',
          'ns-ritmo', 'ns-donde', 'ns-rai', 'ns-e1', 'ns-montaje']:
    DEMO[f'fx-{i}'] = (f'El efecto {i} con el marcado mínimo que espera (copiado de su deck y con datos sintéticos)', 'Sin errores de consola y con render() completo antes de play()')

# Variantes de los sublotes: (id de variante, qué se ve)
SUBLOTES = {
    'motor-color': [('parse-hex', 'parse() y hex() con tres colores del estilo y su ida y vuelta'), ('oklch', 'oklab/oklch/fromOklch: el acento descompuesto en L, C y h con barras'),
                    ('mix', 'mix() de bg a accent en siete pasos'), ('contraste', 'contrast() y wcag() de fg, fg-2 y fg-3 sobre bg'),
                    ('daltonismo', 'cvd() entre todas las parejas de cat-1…6 como matriz, con el umbral ΔE 8 marcado'), ('delta-e', "dE(a, b), dE(a, b, 'protan') y dE(a, b, 'deutan') de las cinco parejas vecinas en barras"), ('alpha', 'alpha() del acento al 25, 50 y 75 %')],
    'cols': [('cols', '.cols: cuerpo + lateral de 500 px'), ('wide-side', '.cols.wide-side'), ('even', '.cols.even'), ('three', '.cols.three')],
    'data-reveal': [(v, f'Tres bloques con data-step y data-reveal="{v}"' + (' (gesto del estilo activo, escrito en la ficha)' if v == 'auto' else '')) for v in ['auto', 'fade', 'wipe', 'wipe-x', 'focus', 'develop', 'mist', 'pixel', 'tilt']],
    'secuencia': [(v, f'Elementos con data-seq y data-a="{v}"' + {'draw': ' (líneas y caminos SVG)', 'grow': ' (barras de izquierda a derecha)', 'rise': ' (barras de abajo arriba)', 'pop': ' (escala)', 'fade': ' y un punto data-travel que recorre un camino'}[v]) for v in ['fade', 'draw', 'grow', 'rise', 'pop']],
}

COMUNES = [
    'Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ac-ficha` de L00; marcado en `L00-infra/resumen.md`)',
    '`render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento',
    'Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`',
    'Sin errores de consola al entrar, al pulsar → y al salir',
    'Revisada en las capturas de suizo y noche, claro y oscuro',
]
COMUNES_Q = ['Etiqueta visible «Experimental · quizás»', 'Datos de ejemplo marcados como «sintéticos»']

RATON = re.compile(r'mouse|hover|cursor|click|drag|pointer|touch|scroll|interactive|interaction|parallax|repulsion|magnet|tilt(?:Amount|Max)|glare', re.I)
COLOR = re.compile(r'colou?r|hue|palette|gradient|tint|tone', re.I)
NOAPLI = {'className', 'style', 'children', 'as', 'ref', 'onComplete', 'onAnimationComplete', 'onClick', 'key'}


def kebab(n):
    return re.sub(r'(?<!^)(?=[A-Z])', '-', n).lower()


def mapeo(p):
    n = p['name']
    if n in NOAPLI or n.startswith('on'):
        return 'no aplica (React)'
    if RATON.search(n):
        return 'se descarta: el motor no usa ratón (sustituir por pasos o bucle)'
    if COLOR.search(n):
        return 'fijo con tokens (`api.cats()`, `api.tok()`)'
    return f'`data-{kebab(n)}`'


def esc(t):
    return str(t).replace('|', '\\|').replace('\n', ' ')


def main():
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    for col, tabla in (('slide_id', 'componentes'), ('diapositivas_est', 'lotes')):
        if col not in [r[1] for r in db.execute(f'PRAGMA table_info({tabla})')]:
            db.execute(f'ALTER TABLE {tabla} ADD COLUMN {col} {"TEXT" if col == "slide_id" else "INTEGER"}')
    commit = db.execute("SELECT valor FROM meta WHERE clave='react_bits_commit'").fetchone()[0][:7]
    lotes = db.execute('SELECT * FROM lotes ORDER BY orden').fetchall()
    faltan = []
    resumen = []
    for L in lotes:
        num = L['id'][1:3]
        comps = db.execute('SELECT * FROM componentes WHERE lote_id=? ORDER BY rowid', (L['id'],)).fetchall()
        if not comps:
            continue
        d = os.path.join(PLAN, L['id']); os.makedirs(d, exist_ok=True)
        o = [f'# {L["id"]} · {L["nombre"]}\n', f'{L["descripcion"]}.\n',
             f'Deck: `{DECK}`. Diapositivas con id `l{num}-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).\n',
             '## Diapositivas del lote\n',
             f'1. `l{num}-titulo`: título del lote con la lista de sus demos y el id de cada una.']
        n_slides = 1
        filas = []
        for c in comps:
            sid = f'l{num}-{c["id"]}'
            db.execute('UPDATE componentes SET slide_id=? WHERE id=?', (sid, c['id']))
            if c['sublote_id']:
                k = len(SUBLOTES[c['id']]) + 1
                filas.append(f'{len(filas) + 2}. `{sid}` … sublote [{c["nombre"]}]({c["id"]}.md): {k} diapositivas')
            else:
                k = 1
                filas.append(f'{len(filas) + 2}. `{sid}`: {c["nombre"]}' + (' · **quizás**' if c['estado_motor'] == 'quizas' else '') + (' ✓' if c['explicado'] else ''))
            n_slides += k
        o += filas
        o.append(f'{len(filas) + 2}. `l{num}-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).\n')
        n_slides += 1
        db.execute('UPDATE lotes SET diapositivas_est=? WHERE id=?', (n_slides, L['id']))
        o.append(f'Total estimado: **{n_slides} diapositivas**.\n')
        o.append('## Criterios comunes de aceptación\n')
        o += [f'- {x}' for x in COMUNES]
        if any(c['estado_motor'] == 'quizas' for c in comps):
            o.append('- En los «quizás»: ' + '; '.join(COMUNES_Q).lower())
        o.append('')
        o.append('## Componentes\n')
        for c in comps:
            sid = f'l{num}-{c["id"]}'
            par = json.loads(c['parametros'] or '{}')
            par.pop('uso_observado', None) if c['estado_motor'] == 'quizas' else None
            uso = par.pop('uso_observado', None)
            o.append(f'### `{c["id"]}` · {c["nombre"]}' + (' · quizás' if c['estado_motor'] == 'quizas' else '') + '\n')
            o.append(f'- **Diapositiva:** `{sid}`' + (f' (sublote, ver [{c["id"]}.md]({c["id"]}.md))' if c['sublote_id'] else ''))
            o.append(f'- **Propósito (texto de la ficha):** {c["proposito"]}')
            o.append(f'- **Archivo fuente:** `{c["archivo_fuente"]}`')
            if c['atlas_actual']:
                o.append(f'- **En el Atlas original:** `#{c["atlas_actual"]}` (reutilizar su marcado como punto de partida)')
            if c['nota']:
                o.append(f'- **Nota:** {c["nota"]}')
            origenes = db.execute('SELECT o.rb_nombre, o.relacion, r.* FROM origen_react_bits o JOIN react_bits r ON r.nombre=o.rb_nombre WHERE o.componente_id=?', (c['id'],)).fetchall()
            if c['estado_motor'] == 'implementado':
                if par:
                    o.append('- **Parámetros que muestra la ficha:** ' + '; '.join(f'`{k}`: {esc(v if isinstance(v, str) else json.dumps(v, ensure_ascii=False))}' for k, v in par.items()))
                if uso and uso['atributos'] + uso['roles']:
                    o.append(f'- **Uso observado en decks** ({", ".join(uso["decks"])}): atributos {", ".join("`" + a + "`" for a in uso["atributos"]) or "—"}; roles {", ".join("`" + a + "`" for a in uso["roles"]) or "—"}')
                if origenes:
                    o.append('- **Origen en react-bits:** ' + ', '.join(f'[{r["rb_nombre"]}]({RBR}/{r["ruta_jsx"]}) ({r["relacion"]})' for r in origenes)
                             + '. La ficha cita el origen y la diferencia principal con el original.')
                demo = DEMO.get(c['id'])
                if not demo and not c['sublote_id']:
                    faltan.append(c['id'])
                if demo:
                    o.append(f'- **Demo:** {demo[0]}')
                    o.append(f'- **Aceptación propia:** {demo[1]}')
                if c['sublote_id']:
                    o.append(f'- **Demo:** una diapositiva por variante, ver [{c["id"]}.md]({c["id"]}.md)')
            else:
                r = origenes[0] if origenes else None
                tipo = 'pintor de `data-painter` (`Motor.painters`)' if c['lote_id'] == 'L08-fondos' else 'pieza por clase'
                nombre_motor = c['id'] if not c['id'].startswith('q-') else 'exp-' + c['id'][2:]
                o.append(f'- **Documentación de react-bits** (commit `{commit}`): componente [{r["ruta_jsx"]}]({RBR}/{r["ruta_jsx"]}) ({r["lineas_jsx"]} líneas)'
                         + (f', CSS [{os.path.basename(r["ruta_css"])}]({RBR}/{r["ruta_css"]})' if r['ruta_css'] else '')
                         + f', props en [{os.path.basename(r["ruta_demo"])}]({RBR}/{r["ruta_demo"]})'
                         + (f', presets en [{os.path.basename(r["ruta_presets"])}]({RBR}/{r["ruta_presets"]})' if r['ruta_presets'] else '')
                         + f', uso en [{os.path.basename(r["ruta_codigo"])}]({RBR}/{r["ruta_codigo"]}).')
                o.append(f'- **Dependencias del original:** {", ".join("`" + x + "`" for x in json.loads(r["dependencias"])) or "ninguna (React y CSS o WebGL crudo)"}')
                o.append(f'- **Informe:** {par.get("veredicto_informe", "")} · coste {par.get("coste", "?")} · valor {par.get("valor", "?")} · estilos: {esc(par.get("estilos", ""))}')
                o.append(f'- **Tareas:**')
                o.append(f'  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.')
                o.append(f'  2. Portarlo a `fx/experimental/{nombre_motor}.js` (+ `fx/experimental/{nombre_motor}.css` si hace falta) como {tipo} con el nombre `{nombre_motor}`. Antes, buscar `{nombre_motor}` en `decks/*/` y `fx/` para evitar choques.')
                o.append('  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.')
                o.append(f'  4. Diapositiva `{sid}`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.')
                props = json.loads(r['props'])
                o.append(f'- **Props del original y su traducción propuesta** ({len(props)}):\n')
                o.append('  | Prop | Tipo | Por defecto | Qué hace | En el motor |')
                o.append('  |---|---|---|---|---|')
                for p in props:
                    o.append(f'  | `{esc(p["name"])}` | {esc(p["type"])} | {esc(p["default"])} | {esc(p["description"])} | {mapeo(p)} |')
                o.append('')
                o.append(f'- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa')
            o.append('')
        open(os.path.join(d, 'plan.md'), 'w').write('\n'.join(o))
        # sublotes
        for c in comps:
            if not c['sublote_id']:
                continue
            sid = f'l{num}-{c["id"]}'
            s = [f'# Sublote `{c["id"]}` · {c["nombre"]}\n', f'Parte de [{L["id"]}](plan.md). {c["proposito"]}. Fuente: `{c["archivo_fuente"]}`.\n',
                 '## Diapositivas\n', f'1. `{sid}`: título del sublote con la lista de variantes.']
            for i, (v, demo) in enumerate(SUBLOTES[c['id']], 2):
                s.append(f'{i}. `{sid}-{v}`: {demo}. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.')
            s.append('\n## Aceptación\n')
            s += [f'- {x}' for x in COMUNES]
            s.append('- Cada variante se distingue de las demás a simple vista en las capturas')
            open(os.path.join(d, c['id'] + '.md'), 'w').write('\n'.join(s) + '\n')
        resumen.append(L['id'])
    if faltan:
        raise SystemExit(f'componentes implementados sin demo en DEMO: {faltan}')
    db.commit()
    indice(db)
    print('lotes escritos:', len(resumen))


def indice(db):
    lotes = db.execute('''SELECT l.*, COUNT(c.id) n, SUM(c.explicado) hechos, SUM(c.estado_motor='quizas') q
                          FROM lotes l LEFT JOIN componentes c ON c.lote_id=l.id GROUP BY l.id ORDER BY l.orden''').fetchall()
    tot = sum(l['n'] for l in lotes); est = sum(l['diapositivas_est'] or 0 for l in lotes)
    hechos = sum(l['hechos'] or 0 for l in lotes)
    estado = lambda l: 'completado' if l['n'] and l['hechos'] == l['n'] else 'en curso' if l['hechos'] else 'pendiente'
    o = ['# Atlas Completo · plan maestro\n',
         'Presentación de referencia con una diapositiva por componente del motor, incluidos los «quizás». '
         f'Deck: `{DECK}`. El Atlas original pasa a `atlas/original/` sin cambios de contenido.\n',
         f'**Progreso:** {hechos} de {tot} componentes explicados · unas {est + 1} diapositivas previstas (más la portada).\n',
         'Este índice se regenera con `python3 planning/atlas/generar_planes.py` a partir de `atlas.db`, que es donde se marca el progreso (`explicado = 1`).\n',
         '## Lotes\n', '| # | Lote | Estado | Componentes | Quizás | Diapositivas | Subplan |', '|---:|---|---|---:|---:|---:|---|',
         '| 0 | L00 · Infraestructura | ' + INFRA_ESTADO + ' | — | — | 1 (portada) | [L00-infra/plan.md](L00-infra/plan.md) |']
    for l in lotes:
        o.append(f'| {l["orden"]} | {l["id"]} · {l["nombre"]} | {estado(l)} | {l["hechos"] or 0}/{l["n"]} | {l["q"] or 0} | {l["diapositivas_est"]} | [{l["id"]}/plan.md]({l["id"]}/plan.md) |')
    o += ['', '## Flujo por componente\n',
          '1. Implementar la diapositiva en `atlas/completo/src/lNN.html` (con sus efectos en `atlas/completo/lotes/lNN.js` y `.css`; en los «quizás», portar antes el componente de react-bits a `fx/experimental/`) y montar el deck con `python3 planning/atlas/montar.py`. Las fichas y los títulos de lote salen de `atlas.db` con los marcadores `<!-- ficha:id -->`, `<!-- kicker:id -->` y `<!-- titulo:LNN -->`.',
          '2. Servir la raíz (`python3 -m http.server 8000`) y ejecutar `node tools/verificar.mjs atlas/completo` y `node planning/atlas/recorrer.mjs`; comprobar los criterios interactivos con un script de Playwright.',
          '3. Revisar las capturas de esa diapositiva en suizo y noche, claro y oscuro.',
          "4. `UPDATE componentes SET explicado=1, diapositivas='<ids>' WHERE id='<id>'` en `atlas.db`.",
          '5. Regenerar planes e índice con `generar_planes.py`.',
          '', '## Al cerrar cada lote\n',
          '1. Escribir `planning/atlas/<lote>/resumen.md` (qué se cubrió, decisiones, problemas) y rellenar `doc_resumen` de sus componentes.',
          '2. Commit con el lote y su plan.', '3. Parar e informar del progreso antes del siguiente lote.',
          '', '## Terminado cuando\n',
          '- `SELECT * FROM componentes WHERE explicado = 0` devuelve 0 filas.', '- Todos los lotes figuran como completados en esta tabla.',
          '- `recorrer.mjs` navega de la primera a la última diapositiva, paso a paso, sin errores de consola.',
          '', '## Fuentes\n', '- Cómo retomar el trabajo: [RETOMAR.md](RETOMAR.md).', '- Inventario: [inventario.md](inventario.md).',
          f'- react-bits: clon en `{RBR_TXT}` (fuera del repositorio), commit en la tabla `meta` de `atlas.db`. Props, uso y dependencias en la tabla `react_bits`; relación con el motor en `origen_react_bits`.',
          '- Informes del estudio: [react-bits/](react-bits/).', '']
    open(os.path.join(PLAN, '00-indice.md'), 'w').write('\n'.join(o))


INFRA_ESTADO = 'completado'

if __name__ == '__main__':
    main()
