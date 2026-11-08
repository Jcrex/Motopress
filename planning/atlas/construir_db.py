"""Construye planning/atlas/atlas.db: inventario de componentes del motor para el Atlas Completo.

Fuentes: el código del motor (catálogo escrito a mano más abajo), los atributos que usan los decks
(se extraen solos de index.html y decks/*/index.html) y los informes de react-bits copiados en
planning/atlas/react-bits/ (filas QUIZÁ y recomendadas sin implementar).

Uso: python3 planning/atlas/construir_db.py   (desde la raíz del repositorio; rehace la base entera)
"""
import glob, json, os, re, sqlite3
from collections import defaultdict

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DB = os.path.join(RAIZ, 'planning', 'atlas', 'atlas.db')
INF = 'planning/atlas/react-bits'

LOTES = [
    ('L01-nucleo', 'Núcleo', 'Lienzo, anatomía de la diapositiva, navegación, pasos, HUD, vista general, preferencias, ciclo de vida de efectos, eventos, impresión'),
    ('L02-api', 'API de efectos', 'Lo que recibe un efecto en api y las utilidades globales Motor.color, Motor.util y Motor.gl'),
    ('L03-estilos', 'Estilos y tokens', 'Las diez direcciones de arte, el sistema de tokens y las paletas de gráficos generadas'),
    ('L04-transiciones', 'Transiciones', 'Cambio de diapositiva con View Transitions y el gesto de cada estilo'),
    ('L05-maquetacion', 'Maquetación', 'Composiciones del cuerpo y piezas básicas de engine.css'),
    ('L06-texto', 'Texto y títulos', 'Entrada de títulos, tratamientos de título por estilo y piezas de texto animado'),
    ('L07-revelados', 'Revelados y animación', 'data-reveal y efectos de aparición, transformación y luz'),
    ('L08-fondos', 'Fondos', 'backdrop, data-painter y todos los pintores de portada'),
    ('L09-piezas', 'Piezas de interfaz', 'Piezas por clase de fx/piezas.js y componentes de interfaz candidatos'),
    ('L10-graficos', 'Demos del Atlas', 'Efectos de datos y diagramas del Atlas actual: sistema, ROS 2, ML, datos y Arch'),
    ('L11-decks', 'Efectos de decks', 'Efectos de fx/ creados para decks concretos: vc, rai, arq-opus y nav-semantica'),
    ('L12-herramientas', 'Herramientas', 'Herramientas de línea de órdenes de tools/'),
]

E, C, ST, SI, F, P = 'engine/engine.js', 'engine/engine.css', 'themes/styles.css', 'fx/sistema.js', 'fx/fondos.js', 'fx/piezas.js'

# (id, nombre, lote, proposito, archivo, parametros, sublote, atlas_actual)
IMPL = [
    # ---------------------------------------------------------------- L01 núcleo
    ('lienzo', 'Lienzo 1920×1080 y escalado', 'L01-nucleo', 'Componer siempre sobre un lienzo fijo de 1920×1080 y escalarlo al tamaño de la ventana sin deformarlo', f'{E} fit() · {C} .viewport .stage', {'margenes': '120 arriba, 128 lados, 140 abajo', 'cuerpo_util': '1664×630'}, None, None),
    ('anatomia-slide', 'Anatomía de una diapositiva', 'L01-nucleo', 'Estructura común de cada diapositiva para que el motor la numere, la agrupe y la decore', f'{C} .slide .s-head .kicker .s-title .s-body', {'atributos': ['id', 'data-section', 'data-title', 'data-fx'], 'clases': ['s-head', 'kicker', 's-title', 's-body']}, None, None),
    ('navegacion-teclado', 'Navegación con teclado', 'L01-nucleo', 'Avanzar y retroceder por pasos y diapositivas con el teclado', f'{E} onKey() next() prev() go()', {'siguiente': ['→', 'Espacio', '↓', 'AvPág', 'Intro'], 'anterior': ['←', '↑', 'RePág', 'Retroceso'], 'extremos': ['Inicio', 'Fin']}, None, 'atajos'),
    ('navegacion-tactil', 'Navegación táctil', 'L01-nucleo', 'Pasar diapositivas deslizando el dedo en pantallas táctiles', f'{E} onTouch()', {'umbral_px': 50, 'relacion_horizontal': 1.3}, None, None),
    ('ancla-url', 'Ancla de la URL', 'L01-nucleo', 'Abrir una diapositiva concreta con #id y mantener la URL al día al navegar', f'{E} go() init()', {'ejemplo': '#lidar'}, None, None),
    ('pasos', 'Pasos (data-step)', 'L01-nucleo', 'Revelar elementos uno a uno dentro de una diapositiva antes de pasar a la siguiente', f'{E} stepped() · {C} [data-step]', {'atributo': 'data-step', 'clase_visible': 'on', 'api': ['api.step', 'api.steps']}, None, None),
    ('hud', 'HUD de controles', 'L01-nucleo', 'Controles flotantes con contador, selector de estilos y botones; se ocultan con H o por inactividad', f'{E} buildHud() updateHud() wake() · {C} .hud', {'tecla': 'H', 'piezas': ['hud-count', 'hud-styles', 'hud-sep']}, None, None),
    ('barra-progreso', 'Barra de progreso', 'L01-nucleo', 'Indicar cuánto queda de la presentación', f'{C} .progress', {}, None, None),
    ('vista-general', 'Vista general', 'L01-nucleo', 'Ver todas las diapositivas en miniatura y saltar a una con un clic', f'{E} toggleOverview() layoutOverview()', {'tecla': 'O', 'salir': 'Escape'}, None, None),
    ('pantalla-completa', 'Pantalla completa', 'L01-nucleo', 'Entrar y salir de pantalla completa', f'{E} fullscreen()', {'tecla': 'F'}, None, None),
    ('selector-estilo', 'Selector de estilo', 'L01-nucleo', 'Cambiar la dirección de arte en vivo sin recargar', f'{E} setStyle() cycleStyle()', {'teclas': ['S', '⇧S', '1…9', '0'], 'atributo': '<html data-style>'}, None, 'estilos'),
    ('modo-claro-oscuro', 'Modo claro y oscuro', 'L01-nucleo', 'Alternar claro y oscuro respetando la preferencia del sistema mientras no se elija otra', f'{E} setMode() toggleMode()', {'tecla': 'D', 'atributo': '<html data-theme>', 'por_defecto': 'prefers-color-scheme'}, None, None),
    ('preferencias', 'Memoria de preferencias', 'L01-nucleo', 'Recordar en el navegador el estilo y el modo elegidos', f'{E} store', {'claves': ['style', 'mode']}, None, None),
    ('motor-pick', 'Estilos del deck (MOTOR_PICK)', 'L01-nucleo', 'Limitar y ordenar los estilos disponibles en un deck', f'{E} STYLES · themes/meta.js', {'sintaxis': "window.MOTOR_PICK = ['rice', 'nube']", 'orden_carga': 'antes de themes/meta.js'}, None, None),
    ('decorado-slide', 'Decorado por diapositiva', 'L01-nucleo', 'Inyectar el decorado del estilo (folio, barra de sección, ruta de tópico) según data-section y la posición', f'{E} injectDeco() updateDeco() · {C} .deco', {'usa': ['data-section', 'índice', 'total']}, None, None),
    ('ciclo-fx', 'Ciclo de vida de un efecto', 'L01-nucleo', 'Registrar un efecto y separar el estado final (render) de la animación (play), con limpieza (stop) y aviso de pasos (step)', f'{E} Motor.fx() activate() deactivate() renderSlide()', {'metodos': ['render(api)', 'play(api)', 'stop(api)', 'step(api, n, {dir, el, total, animate})'], 'regla': 'render deja el estado final completo; play solo anima'}, None, None),
    ('eventos-motor', 'Eventos del motor', 'L01-nucleo', 'Avisar a cualquier script de la entrada, la salida y los pasos de una diapositiva', f'{E} emit()', {'eventos': ['motor:enter', 'motor:leave', 'motor:step'], 'detail': ['slide', 'index', 'api', 'animate', 'step', 'dir']}, None, None),
    ('movimiento-reducido', 'Movimiento reducido', 'L01-nucleo', 'Respetar prefers-reduced-motion: sin animaciones, con el estado final visible', f'{E} api.reduced · {C} @media (prefers-reduced-motion)', {'api': 'api.reduced'}, None, None),
    ('impresion-pdf', 'Impresión y PDF', 'L01-nucleo', 'Imprimir cada diapositiva en una página de 1920×1080 sin HUD ni barra', f'{C} @media print', {'pagina': '1920×1080'}, None, None),
    # ---------------------------------------------------------------- L02 API
    ('api-dom', 'api.q, api.qa y api.el', 'L02-api', 'Buscar elementos solo dentro de la diapositiva del efecto', f'{E} makeApi()', {'metodos': ['q(sel)', 'qa(sel)', 'el']}, None, None),
    ('api-tokens', 'api.tok y estado del estilo', 'L02-api', 'Leer tokens CSS del estilo activo y saber estilo, modo y metadatos', f'{E} makeApi()', {'metodos': ['tok(nombre, desde?)', 'dark', 'style', 'meta']}, None, None),
    ('api-series', 'api.cats, api.seq y api.div', 'L02-api', 'Obtener colores de series categóricas, rampas secuenciales y divergentes del estilo', f'{E} makeApi() ramp()', {'metodos': ['cats(n=6)', 'seq(t)', 'div(t)', 'ramp(prefijo, t)']}, None, 'paletas'),
    ('api-font', 'api.font', 'L02-api', 'Componer la fuente de canvas con la familia del estilo', f'{E} makeApi()', {'firma': "font('mono'|'text'|'display'|'serif', tamaño, peso=400)"}, None, None),
    ('api-tiempo', 'api.raf, api.after, api.tween, api.dur y api.ease', 'L02-api', 'Animar con bucles y temporizadores que el motor cancela solo al salir, con la duración y la curva del estilo', f'{E} makeApi() stopAll()', {'metodos': ['raf(fn(t, dt) → false para parar)', 'after(ms, fn)', 'tween(ms, fn(e, p), {delay, ease})', 'dur', 'ease(t)']}, None, None),
    ('api-canvas', 'api.canvas', 'L02-api', 'Crear un canvas 2D nítido a la densidad de píxeles y escala actuales', f'{E} makeApi()', {'devuelve': ['cv', 'ctx', 'w', 'h', 'ratio']}, None, None),
    ('api-rng-noise', 'api.rng y api.noise2', 'L02-api', 'Aleatoriedad determinista por semilla y ruido 2D suave para datos y fondos reproducibles', f'{E} rng() noise2()', {'metodos': ['rng(seed) → () ⇒ [0, 1)', 'r.normal() · r.range(a, b) · r.int(a, b) · r.pick(lista)', 'noise2(seed) → (x, y) ⇒ [−1, 1]']}, None, None),
    ('motor-color', 'Motor.color', 'L02-api', 'Color perceptual: OKLab/OKLCH, mezcla, contraste WCAG, simulación de daltonismo y distancia ΔE', f'{E} color', {'variantes': ['parse/hex', 'oklab/oklch/fromOklch', 'mix', 'contrast + wcag', 'cvd (mín. protan/deutan)', "dE(a, b, 'protan'|'deutan')", 'alpha'], 'nota': 'sim() es interna: la simulación de Machado (2009) solo se usa a través de dE y cvd'}, 'L02-api/motor-color', 'color-teoria'),
    ('motor-util', 'Motor.util', 'L02-api', 'Utilidades numéricas comunes: curvas bezier CSS, clamp y lerp', f'{E} util bezier()', {'metodos': ['bezier(str)', 'clamp(v, a, b)', 'lerp(a, b, t)']}, None, None),
    ('motor-gl', 'Motor.gl', 'L02-api', 'Capa WebGL2 con respaldo a WebGL1 para pintores y efectos con sombreadores', f'{F} glLayer() program()', {'metodos': ['layer(s, scale)', 'program(L, key, vs, fs)', 'uniforms', 'drawFull', 'scale', 'throttle', 'VS_FULL', 'VS_FULL2'], 'regla': '#version 300 es solo con WebGL2'}, None, None),
    # ---------------------------------------------------------------- L03 estilos
    *[(f'estilo-{i}', f'Estilo {n}', 'L03-estilos', d, f'themes/source.json · {ST}', p, None, 'estilos') for i, n, d, p in [
        ('rice', 'Rice', 'Escritorio Hyprland con Catppuccin: ventanas en mosaico y borde activo que gira', {'fuentes': 'Outfit + JetBrains Mono', 'fondo': 'ventanas en mosaico', 'transicion': 'cambio de espacio de trabajo', 'titulo': 'rise', 'revelado': 'tilt', 'extra': 'focus-border con rice-angle'}),
        ('noche', 'Noche', 'Interfaz de ficción con Tokyo Night: paneles recortados y neón', {'fuentes': 'Chakra Petch + IBM Plex Mono', 'fondo': 'horizonte de neón', 'transicion': 'fallo de señal', 'titulo': 'descifra', 'revelado': 'wipe-x', 'extra': 'paneles con clip-path'}),
        ('suizo', 'Suizo', 'Editorial de datos acromático con un solo rojo', {'fuentes': 'Instrument Sans + Instrument Serif', 'fondo': 'geometría de arcos', 'transicion': 'corte vertical', 'titulo': 'mask-lines', 'revelado': 'fade', 'extra': 'paneles transparentes'}),
        ('aurora', 'Aurora', 'Arte generativo con Rosé Pine', {'fuentes': 'Bricolage Grotesque + DM Mono', 'fondo': 'campo de flujo', 'transicion': 'fundido con desenfoque', 'titulo': 'blur', 'revelado': 'mist'}),
        ('cromo', 'Cromo', 'Metal líquido de estética Y3K', {'fuentes': 'Unbounded + Manrope + Martian Mono', 'fondo': 'metabolas por raymarching (WebGL)', 'transicion': 'telón que gotea', 'titulo': 'sin partir (cromo-sheen)', 'revelado': 'wipe'}),
        ('arcilla', 'Arcilla', 'Render 3D mate de plastilina', {'fuentes': 'Fraunces + Albert Sans + Red Hat Mono', 'fondo': 'brazo robótico (WebGL)', 'transicion': 'llegada blanda', 'titulo': 'pliega', 'revelado': 'tilt'}),
        ('nube', 'Nube', 'Gemelo digital con nube de puntos LiDAR', {'fuentes': 'Geist + Geist Mono', 'fondo': '40 000 puntos con mapa Turbo (WebGL)', 'transicion': 'barrido de escáner', 'titulo': 'rise', 'revelado': 'wipe'}),
        ('termica', 'Térmica', 'Cámara infrarroja ironbow o negro caliente', {'fuentes': 'Schibsted Grotesk + Spline Sans Mono', 'fondo': 'robot con isotermas', 'transicion': 'destello de calibración', 'titulo': 'sin partir (termica-heat)', 'revelado': 'develop'}),
        ('celula', 'Célula', 'Microscopía en fluorescencia o tinción H&E', {'fuentes': 'Newsreader + Public Sans + Sometype Mono', 'fondo': 'tejido', 'transicion': 'diafragma circular', 'titulo': 'enfoca', 'revelado': 'focus'}),
        ('matriz', 'Matriz', 'Matriz de LED monocroma con rojo', {'fuentes': 'Doto + Host Grotesk + Fragment Mono', 'fondo': 'globo de LED con anillo glifo', 'transicion': 'puntos que crecen', 'titulo': 'descifra', 'revelado': 'pixel', 'extra': 'glyph-pulse'}),
    ]],
    ('tokens-color', 'Tokens de color por rol', 'L03-estilos', 'Nombrar los colores por función (fondo, texto, acento, estados) para que todo cambie con el estilo', 'themes/tokens.css (generado) · themes/source.json', {'roles': ['bg', 'bg-2', 'bg-3', 'fg', 'fg-2', 'fg-3', 'accent', 'accent-2', 'accent-3', 'line', 'line-2', 'ok', 'warn', 'err', '*-ink'], 'regla': 'nunca literales'}, None, None),
    ('tokens-forma-movimiento', 'Tokens de forma, fuente y movimiento', 'L03-estilos', 'Radios, familias tipográficas, duración y curva propias de cada estilo', 'themes/tokens.css · themes/source.json', {'tokens': ['font-display', 'font-text', 'font-mono', 'font-serif', 'radius', 'dur', 'ease', 'is-dark']}, None, 'tipografia'),
    ('paletas-graficos', 'Paletas de gráficos', 'L03-estilos', 'Series categóricas con luminosidad igualada y separación para daltonismo, más rampas seq y div', 'tools/build-themes.mjs · themes/tokens.css', {'tokens': ['cat-1…cat-6', 'seq-1…seq-7', 'div-1…div-7'], 'criterio': 'ΔE OKLab ≥ 8 entre vecinas en protan y deutan'}, None, 'paletas'),
    ('meta-estilos', 'Metadatos de estilos', 'L03-estilos', 'Nombre, armonía, contrastes de Itten y fuentes de cada estilo para los efectos que los muestran', 'themes/meta.js (generado)', {'campos': ['id', 'name', 'harmony', 'itten', 'fonts']}, None, 'color-teoria'),
    # ---------------------------------------------------------------- L04 transiciones
    ('view-transitions', 'Mecanismo de transición', 'L04-transiciones', 'Animar el cambio de diapositiva con la View Transitions API y caer a un cambio directo si no está o se salta', f'{E} go() swap() · {ST} ::view-transition', {'respaldo': 'cambio instantáneo', 'direccion': 'adelante/atrás'}, None, None),
    *[(f'transicion-{i}', f'Transición {n}', 'L04-transiciones', d, f'{ST} {k}', {'keyframes': k}, None, None) for i, n, d, k in [
        ('rice', 'Rice', 'Cambio de espacio de trabajo de Hyprland: deslizamiento lateral según la dirección', 'vt-out-left vt-in-right vt-out-right vt-in-left'),
        ('noche', 'Noche', 'Fallo de señal', 'vt-glitch vt-fade-out'),
        ('suizo', 'Suizo', 'Corte vertical seco', 'vt-up-out vt-up-in'),
        ('aurora', 'Aurora', 'Fundido con desenfoque', 'vt-blur-out vt-blur-in'),
        ('cromo', 'Cromo', 'Telón de metal líquido que gotea', 'vt-melt'),
        ('arcilla', 'Arcilla', 'Llegada blanda que se aplasta y recupera', 'vt-clay-out vt-clay-in'),
        ('nube', 'Nube', 'Barrido de escáner de arriba abajo', 'vt-scan'),
        ('termica', 'Térmica', 'Destello de calibración (NUC)', 'vt-nuc'),
        ('celula', 'Célula', 'Diafragma de campo que se abre en círculo', 'vt-iris'),
        ('matriz', 'Matriz', 'Puntos de LED que crecen hasta tocarse', 'vt-leds'),
    ]],
    # ---------------------------------------------------------------- L05 maquetación
    ('cols', 'Columnas (.cols)', 'L05-maquetacion', 'Repartir el cuerpo en cuerpo + lateral o en columnas iguales', f'{C} .cols', {'variantes': ['.cols (lateral 500 px)', '.cols.wide-side', '.cols.even', '.cols.three']}, 'L05-maquetacion/cols', None),
    ('stack-row', '.stack y .row', 'L05-maquetacion', 'Apilar en vertical o alinear en fila con el espaciado del estilo', f'{C} .stack .row', {'clases': ['stack', 'row']}, None, None),
    ('panel', 'Panel (.panel)', 'L05-maquetacion', 'Contenedor con el tratamiento de superficie de cada estilo', f'{C} .panel · {ST}', {}, None, None),
    ('lecturas', '.label, .value y .readout', 'L05-maquetacion', 'Mostrar una magnitud con su etiqueta y su valor en la tipografía de datos', f'{C} .label .value .readout', {'clases': ['label', 'value', 'readout']}, None, 'telemetria'),
    ('leyenda', 'Leyenda (.legend)', 'L05-maquetacion', 'Leyenda de series con muestra de color y texto en fg', f'{C} .legend', {}, None, None),
    ('nota', 'Nota (.note)', 'L05-maquetacion', 'Aclaración breve al pie de un gráfico o tabla', f'{C} .note', {}, None, None),
    ('chip', 'Ficha (.chip)', 'L05-maquetacion', 'Etiqueta corta en línea para categorías o estados', f'{C} .chip', {}, None, None),
    ('keycap', 'Tecla (.keycap)', 'L05-maquetacion', 'Representar una tecla o atajo', f'{C} .keycap', {}, None, 'atajos'),
    ('ventana', 'Ventana (.win)', 'L05-maquetacion', 'Marco de ventana con barra para capturas, código o interfaces', f'{C} .win .win-bar .win-body', {'partes': ['win-bar', 'win-body']}, None, 'escritorio'),
    ('terminal', 'Terminal (.term)', 'L05-maquetacion', 'Bloque de terminal con la fuente mono del estilo', f'{C} .term', {}, None, 'fetch'),
    ('texto-utilidades', 'Utilidades de texto', 'L05-maquetacion', 'Matices de texto: entradilla, apagado, tenue, monoespaciado y cifras tabulares', f'{C} .lead .muted .faint .mono .num', {'clases': ['lead', 'muted', 'faint', 'mono', 'num', 'fill']}, None, None),
    ('portada-divider', 'Portada y separador', 'L05-maquetacion', 'Diapositiva a sangre para portada, separadores de sección y cierre', f'{C} .slide.is-plain.divider .fx-bg', {'clases': ['is-plain', 'divider', 'cover', 'fx-bg'], 'fx': 'backdrop'}, None, 'portada'),
    ('focus-border', 'Borde de foco (.focus-border)', 'L05-maquetacion', 'Borde activo de Hyprland: degradado cónico que gira alrededor del panel o ventana con foco (solo rice)', f'{ST} .focus-border .win.is-focus @keyframes rice-angle', {'clases': ['panel.focus-border', 'win.is-focus'], 'estilo': 'rice'}, None, None),
    ('host-fx', 'Contenedor de efecto (.fx)', 'L05-maquetacion', 'Zona donde un efecto dibuja, con data-role para que lo encuentre', f'{C} .fx', {'atributo': 'data-role'}, None, None),
    # ---------------------------------------------------------------- L06 texto
    ('data-title-fx', 'Entrada de título (data-title-fx)', 'L06-texto', 'Elegir cómo entra el título: el preset del estilo, uno fijo o ninguno', f'{SI} titlePreset() · Motor.titleFx Motor.titleStyle', {'valores': ['auto', 'none', 'rise', 'mask-lines', 'blur', 'pliega', 'enfoca', 'descifra'], 'ambito': 'sección o <html>', 'por_defecto': 'solo en backdrop'}, None, 'portada'),
    *[(f'titulo-{i}', f'Preset de título «{i}»', 'L06-texto', d, f'{SI} Motor.titleFx(\'{i}\')', {'estilos': s, 'split': sp}, None, None) for i, d, s, sp in [
        ('rise', 'Las letras suben y se aclaran con rebote', ['rice', 'nube'], 'words,chars'),
        ('mask-lines', 'Las líneas suben desde detrás de una máscara, sin opacidades intermedias', ['suizo'], 'lines + mask'),
        ('blur', 'Las palabras llegan desenfocadas, lentas y orgánicas', ['aurora'], 'words'),
        ('pliega', 'Las letras se levantan girando sobre su base', ['arcilla'], 'words,chars'),
        ('enfoca', 'La línea entera pasa de desenfocada a nítida', ['celula'], 'sin partir'),
        ('descifra', 'Cada letra muestra glifos al azar hasta fijarse', ['noche', 'matriz'], 'words,chars (Motor.scramble)'),
    ]],
    ('titulo-cromo-sheen', 'Título metálico de Cromo', 'L06-texto', 'Brillo que recorre el título recortado con background-clip:text', f'{ST} @keyframes cromo-sheen', {'estilo': 'cromo'}, None, None),
    ('titulo-termica-heat', 'Título térmico de Térmica', 'L06-texto', 'Gradiente de calor que sube por el título recortado', f'{ST} @keyframes termica-heat', {'estilo': 'termica'}, None, None),
    ('descifra', 'Texto que se descifra (.descifra)', 'L06-texto', 'Revelar un texto con glifos al entrar, para códigos o identificadores', f'{P} · {SI} Motor.scramble', {'clase': 'descifra', 'data-orden': ['start', 'center', 'random']}, None, None),
    ('cifra', 'Cifra (.cifra)', 'L06-texto', 'Número grande que cuenta o rueda por dígitos hasta su valor, con variación opcional', f'{P} · {C} .cifra .cifra-delta', {'data-value': 'número', 'data-mode': ['count', 'roll'], 'otros': ['data-dec', 'data-pre', 'data-suf', 'data-from'], 'delta': ['sube', 'baja']}, None, None),
    ('paleta', 'Paleta de split-flap (.paleta)', 'L06-texto', 'Casillas de aeropuerto que recorren palabras de estado', f'{P} · {C} .paleta', {'data-words': 'A|B|C', 'data-pasos': 'una palabra por paso'}, None, None),
    ('teclea', 'Terminal que teclea (.teclea)', 'L06-texto', 'Escribir los comandos letra a letra y soltar la salida', f'{P} · {C} .term.teclea', {'data-k': 'cmd'}, None, None),
    # ---------------------------------------------------------------- L07 revelados
    ('data-reveal', 'Revelados (data-reveal)', 'L07-revelados', 'Dar a cada paso el gesto de aparición del estilo o uno fijo', f'{SI} resolveReveals() Motor.revealStyle · {C} [data-rv]', {'valores': ['auto', 'fade', 'wipe', 'wipe-x', 'focus', 'develop', 'mist', 'pixel', 'tilt'], 'ambito': '[data-step] o <html>'}, 'L07-revelados/data-reveal', None),
    # ---------------------------------------------------------------- L08 fondos
    ('backdrop', 'Efecto backdrop', 'L08-fondos', 'Dibujar el fondo generativo de portadas y separadores con el pintor que toque', f'{SI} Motor.fx(\'backdrop\')', {'data-seed': 'número', 'host': '.fx-bg'}, None, 'portada'),
    ('data-painter', 'Elección de pintor (data-painter)', 'L08-fondos', 'Cambiar el fondo por diapositiva, por deck o solo para ciertos estilos', f'{SI} painterOf()', {'sintaxis': ['"nombre"', '"estilo:nombre …"', '"none"'], 'ambito': 'sección o <html>'}, None, None),
    ('motor-painters', 'Registro de pintores', 'L08-fondos', 'Interfaz para añadir un pintor de fondo nuevo', f'{SI} Motor.painters', {'firma': '{ init(s, api), frame(s, api, t, still) }'}, None, None),
    *[(f'pintor-{i}', f'Pintor {n}', 'L08-fondos', d, a, {'tecnica': t}, None, 'portada' if i == 'rice' else None) for i, n, d, a, t in [
        ('rice', 'rice', 'Halos que derivan y grafo de nodos con mensajes en portadas', f'{SI} painters.rice', 'canvas 2D'),
        ('noche', 'noche', 'Horizonte de neón con rejilla en perspectiva', f'{SI} painters.noche', 'canvas 2D'),
        ('suizo', 'suizo', 'Geometría de arcos editorial', f'{SI} painters.suizo', 'canvas 2D'),
        ('aurora', 'aurora', 'Campo de flujo de partículas', f'{SI} painters.aurora', 'canvas 2D'),
        ('cromo', 'cromo', 'Metabolas cromadas por raymarching', f'{F} P.cromo', 'WebGL con respaldo 2D'),
        ('arcilla', 'arcilla', 'Brazo robótico de plastilina con sombras suaves y oclusión', f'{F} P.arcilla', 'WebGL con respaldo 2D, 20 fps'),
        ('nube', 'nube', 'Unos 40 000 puntos de un escaneo simulado con mapa Turbo', f'{F} P.nube', 'WebGL con respaldo 2D'),
        ('termica', 'termica', 'Robot móvil en ironbow o negro caliente con isotermas', f'{F} P.termica', 'canvas 2D'),
        ('celula', 'celula', 'Tejido en fluorescencia (oscuro) o tinción H&E (claro)', f'{F} P.celula', 'canvas 2D'),
        ('matriz', 'matriz', 'Globo de LED con anillo de glifos', f'{F} P.matriz', 'canvas 2D'),
        ('grano', 'grano', 'Degradado con grano', f'{F} P.grano', 'WebGL'),
        ('hilos', 'hilos', 'Haz de líneas que se deshilacha', f'{F} P.hilos', 'canvas 2D'),
        ('radar', 'radar', 'Pantalla PPI con barrido y contactos', f'{F} P.radar', 'canvas 2D'),
        ('topo', 'topo', 'Terreno con curvas de nivel en perspectiva', f'{F} P.topo', 'canvas 2D, marching squares'),
        ('isolineas', 'isolineas', 'Curvas de nivel que fluyen en cat-1…3', f'{F} P.isolineas', 'GLSL 3.00 con respaldo 2D'),
        ('escaner', 'escaner', 'Sala de rejilla recorrida por un plano láser', f'{F} P.escaner', 'canvas 2D'),
        ('velo', 'velo', 'Banda de aurora en la parte superior', f'{F} P.velo', 'canvas 2D'),
        ('none', 'none', 'Sin fondo: diapositiva lisa', f'{SI} painters.none', '—'),
    ]],
    # ---------------------------------------------------------------- L09 piezas
    ('etapas', 'Etapas (.etapas)', 'L09-piezas', 'Proceso lineal en el que cada paso marca una fase como hecha y la siguiente en curso', f'{P} · {C} .etapas', {'variantes': ['horizontal', '.etapas.v (vertical)'], 'hijos': '<li data-step><b>…</b><small>…</small>'}, None, None),
    ('checklist', 'Lista de hitos (.checklist)', 'L09-piezas', 'Hitos con marca y palabra de estado', f'{P} · {C} .checklist', {'data-end': ['ok', 'warn', 'err'], 'palabras': ['pendiente', 'en curso', 'hecho', 'revisar', 'falló'], 'variante': '.checklist.tacha'}, None, None),
    ('agenda', 'Agenda (.agenda)', 'L09-piezas', 'Índice generado con las secciones del deck y la actual destacada', f'{P} · {C} .agenda', {'data-current': 'sección', 'data-skip': 'sección', 'variante': '.agenda.banda'}, None, None),
    ('reticula', 'Retícula (.reticula)', 'L09-piezas', 'Cuatro esquinas de mira que saltan al objetivo de cada paso', f'{P} · {C} .reticula', {'hijos': 'data-target="0|1|…" data-label'}, None, None),
    ('bento', 'Bento (.bento)', 'L09-piezas', 'Rejilla de resumen con celdas de distinto tamaño y foco por pasos', f'{P} · {C} .bento', {'celdas': ['w2', 'w3', 'h2'], 'pasos': 'data-step en celdas'}, None, None),
    ('mazo', 'Mazo (.mazo)', 'L09-piezas', 'Tarjetas apiladas: cada paso manda la delantera al fondo', f'{P} · {C} .mazo', {'variante': '.mazo.plana (sin 3D; siempre en suizo y matriz)'}, None, None),
    ('chispa', 'Chispa (.chispa)', 'L09-piezas', 'Una chispa que recorre el borde de un panel para señalarlo', f'{P} canvas.bordes', {'capa': 'un canvas 2D por diapositiva'}, None, None),
    ('rayo', 'Borde eléctrico (.rayo)', 'L09-piezas', 'Borde eléctrico para la alerta o el punto clave', f'{P} canvas.bordes', {'capa': 'un canvas 2D por diapositiva'}, None, None),
    ('deposito', 'Depósito (.deposito)', 'L09-piezas', 'Nivel vertical con lectura grande y palabra de estado', f'{P} · {C} .deposito', {'data-value': '0–100', 'data-label': 'texto', 'data-umbral': 'número', 'data-critico': 'número', 'estados': ['normal', 'bajo', 'crítico']}, None, None),
    # ---------------------------------------------------------------- L10 demos del Atlas
    *[(f'fx-{i}', f'Efecto {i}', 'L10-graficos', d, a, None, None, s) for i, d, a, s in [
        ('estilos', 'Rejilla con las diez direcciones de arte y sus muestras', f'{SI} Motor.fx(\'estilos\')', 'estilos'),
        ('teoria', 'Teoría del color: contrastes de Itten del estilo activo', f'{SI} Motor.fx(\'teoria\')', 'color-teoria'),
        ('rueda', 'Círculo OKLCH con la armonía del estilo', f'{SI} Motor.fx(\'rueda\')', 'color-rueda'),
        ('tipo', 'Muestra tipográfica de las familias del estilo', f'{SI} Motor.fx(\'tipo\')', 'tipografia'),
        ('paletas', 'Paletas para datos con simulación de daltonismo', f'{SI} Motor.fx(\'paletas\')', 'paletas'),
        ('refs', 'Referencias: Okabe–Ito, viridis y paletas de origen', f'{SI} Motor.fx(\'refs\')', 'referencias'),
        ('compare', 'Comparativa de estilos', f'{SI} Motor.fx(\'compare\')', 'comparativa'),
        ('rosgraph', 'Grafo de nodos y tópicos estilo rqt_graph con mensajes', 'fx/ros.js Motor.fx(\'rosgraph\')', 'ros-grafo'),
        ('lidar', 'Escaneo LiDAR 2D (LaserScan)', 'fx/ros.js Motor.fx(\'lidar\')', 'lidar'),
        ('astar', 'Mapa de ocupación con búsqueda A*', 'fx/ros.js Motor.fx(\'astar\')', 'ocupacion'),
        ('tftree', 'Árbol de transformadas TF', 'fx/ros.js Motor.fx(\'tftree\')', 'tf'),
        ('blueprint', 'Plano técnico de la base del robot', 'fx/ros.js Motor.fx(\'blueprint\')', 'plano-robot'),
        ('scope', 'Telemetría tipo osciloscopio', 'fx/ros.js Motor.fx(\'scope\')', 'telemetria'),
        ('training', 'Curvas de entrenamiento y validación', 'fx/ml.js Motor.fx(\'training\')', 'entrenamiento'),
        ('confusion', 'Matriz de confusión', 'fx/ml.js Motor.fx(\'confusion\')', 'confusion'),
        ('latent', 'Espacio latente con agrupaciones', 'fx/ml.js Motor.fx(\'latent\')', 'latente'),
        ('nnet', 'Arquitectura de una red neuronal', 'fx/ml.js Motor.fx(\'nnet\')', 'red'),
        ('clouds', 'Tres nubes de palabras (d3-cloud)', 'fx/datos.js Motor.fx(\'clouds\')', 'nubes'),
        ('ridge', 'Ridgeline de distribuciones', 'fx/datos.js Motor.fx(\'ridge\')', 'ridgeline'),
        ('calendar', 'Calendario de commits', 'fx/datos.js Motor.fx(\'calendar\')', 'calendario'),
        ('sankey', 'Sankey de un pipeline de datos (d3-sankey)', 'fx/datos.js Motor.fx(\'sankey\')', 'sankey'),
        ('kpis', 'Panel de indicadores con sparklines', 'fx/datos.js Motor.fx(\'kpis\')', 'kpis'),
        ('desktop', 'Escritorio Hyprland en mosaico dwindle', 'fx/arch.js Motor.fx(\'desktop\')', 'escritorio'),
        ('fetch', 'Ficha del sistema tipo fastfetch', 'fx/arch.js Motor.fx(\'fetch\')', 'fetch'),
    ]],
    # ---------------------------------------------------------------- L11 efectos de decks
    ('vc', 'Efecto vc (combinado)', 'L11-decks', 'Activar a la vez vc-conv, vc-plot, vc-heat y secuencia en una diapositiva', 'fx/vc.js Motor.fx(\'vc\')', {'requiere': 'cargar antes de fx/rai.js'}, None, None),
    ('vc-conv', 'Efecto vc-conv', 'L11-decks', 'Convolución o correlación paso a paso sobre una matriz pequeña, con la salida real', 'fx/vc.js convRender() convPlay()', {'data-img': 'matriz JSON', 'data-k': 'núcleo JSON', 'data-mode': ['conv', 'corr'], 'data-pad': ['zero', 'none']}, None, None),
    ('vc-plot', 'Efecto vc-plot', 'L11-decks', 'Curvas y = f(x) con ejes, leyenda, barras y puntos', 'fx/vc.js plotRender()', {'data-x': 'min,max', 'data-y': 'min,max', 'data-fns': '[{f, label}]', 'data-legend': ['tl', 'tr', 'bl', 'br', 'top'], 'otros': ['data-xl', 'data-yl', 'data-xdec', 'data-ydec', 'data-bars', 'data-pts']}, None, None),
    ('vc-heat', 'Efecto vc-heat', 'L11-decks', 'Matriz numérica coloreada con seq o div', 'fx/vc.js heatRender()', {'data-m': 'matriz JSON', 'data-signed': '1', 'data-dec': 'n', 'data-nums': '0 oculta números'}, None, None),
    ('vc-katex', 'Fórmulas KaTeX', 'L11-decks', 'Renderizar fórmulas $$…$$ y \\( … \\) al cargar', 'fx/vc.js katexAll()', {'delimitadores': ['$$…$$', '\\(…\\)']}, None, None),
    ('vc-codigo', 'Resaltado de Python', 'L11-decks', 'Colorear palabras clave, números, cadenas, comentarios y funciones en <pre class="code">', 'fx/vc.js', {'clase': 'pre.code'}, None, None),
    ('secuencia', 'Efecto secuencia', 'L11-decks', 'Revelar en orden los elementos marcados con data-seq y mover puntos por caminos SVG', 'fx/rai.js Motor.fx(\'secuencia\')', {'data-seq': 'n', 'data-a': ['fade', 'draw', 'grow', 'rise', 'pop'], 'data-travel': '#camino', 'data-rest': '0–1'}, 'L11-decks/secuencia', None),
    ('notas-orador', 'Notas del orador', 'L11-decks', 'Abrir con N una ventana con las notas <aside class="notes"> de la diapositiva activa', 'fx/rai.js', {'tecla': 'N', 'marcado': 'aside.notes'}, None, None),
    ('pausa-videos', 'Pausa de vídeos al salir', 'L11-decks', 'Pausar los vídeos de una diapositiva al abandonarla', 'fx/rai.js', {}, None, None),
    *[(f'fx-{i}', f'Efecto {i}', 'L11-decks', d, f'fx/arq-opus.js Motor.fx(\'{i}\')', None, None, None) for i, d in [
        ('op-pila', 'La orden baja por la pila de capas y a la derecha aparece lo que sale de cada una'),
        ('op-ritmo', 'Frecuencias de control en escala logarítmica; cada fila late a su ritmo'),
        ('op-donde', 'Qué corre a bordo y qué fuera; paquetes por Wi-Fi y watchdog'),
        ('op-slam', 'Raycasting de un LiDAR que construye el mapa y localización con incertidumbre'),
        ('op-grafo', 'Mapa métrico → grafo semántico → capa de personas, con la consulta de una orden'),
        ('op-costmap', 'Capas de coste que se suman y A* que se recalcula cuando se mueven personas'),
        ('op-parseo', 'Una frase que se convierte en JSON'),
        ('op-rai', 'Agente ReAct con sus herramientas; un pulso las recorre en orden'),
        ('op-cifras', 'Cifras que cuentan hasta su valor'),
        ('op-laya', 'Demos de choice, noul y score'),
        ('op-puerta', 'Barras de confianza, umbral τ y una puerta que se abre o pregunta'),
        ('op-e1', 'Diagrama de secuencia de una orden con un paquete que lo recorre'),
        ('op-montaje', 'Seis fases con barra de progreso'),
    ]],
    ('ns-hilo', 'Hilo conductor (.hilo)', 'L11-decks', 'Barra con las nueve etapas instrucción → locomoción que enciende las que cubre la diapositiva', 'fx/nav-semantica.js buildHilo()', {'data-on': '"6,7,8" o rangos "1-3"', 'data-label': 'texto alternativo', 'rombo': 'etapa 5 siempre'}, None, None),
    ('ns-video-auto', 'Vídeo automático (video[data-auto])', 'L11-decks', 'Reproducir un vídeo al entrar en la diapositiva y pausarlo al salir; clic alterna', 'fx/nav-semantica.js', {'atributo': 'data-auto', 'reducido': 'no arranca solo'}, None, None),
    *[(f'fx-{i}', f'Efecto {i}', 'L11-decks', d, f'fx/nav-semantica.js Motor.fx(\'{i}\')', p, None, None) for i, d, p in [
        ('ns-g1', 'Modelo 3D del Unitree G1 con three.js que gira despacio, con imagen de respaldo', {'requiere': 'THREE y STLLoader locales', 'respaldo': 'imagen estática'}),
        ('ns-ritmo', 'Frecuencias de control por capa', None),
        ('ns-donde', 'Qué corre a bordo y qué fuera', None),
        ('ns-rai', 'Agente RAI y sus herramientas', None),
        ('ns-e1', 'Diagrama de secuencia de la orden E1', None),
        ('ns-montaje', 'Fases de montaje con progreso', None),
    ]],
    # ---------------------------------------------------------------- L12 herramientas
    ('tool-build-themes', 'build-themes', 'L12-herramientas', 'Generar tokens.css y meta.js desde source.json y ajustar paletas y contrastes', 'tools/build-themes.mjs', {'opciones': ['--report']}, None, None),
    ('tool-bundle', 'bundle', 'L12-herramientas', 'Empaquetar un deck en un único HTML', 'tools/bundle.mjs', {'opciones': ['<deck>/index.html', '[destino]', '--fragment', '--out=']}, None, None),
    ('tool-verificar', 'verificar', 'L12-herramientas', 'Capturar todas las diapositivas en varios estilos y modos e informar de errores y desbordes', 'tools/verificar.mjs', {'opciones': ['<deck>', '[estilo1,estilo2]', '--out=', 'CHROMIUM_PATH', 'VERIF_REDUCED']}, None, None),
    ('tool-salida', 'Carpeta de salida', 'L12-herramientas', 'Decidir dónde escriben las herramientas: output/, --out o MOTOR_OUT', 'tools/salida.mjs', {'prioridad': '--out > MOTOR_OUT > output/'}, None, None),
]

# ---------------------------------------------------------------- quizás de react-bits
# lote de destino, id y nota de fusión con algo existente (si la hay)
QUIZAS = {
    # texto
    'StrokeText': ('L06-texto', 'traza', 'recomendado sin implementar'), 'TechText': ('L06-texto', 'muestrario', 'recomendado sin implementar'),
    'Shuffle': ('L06-texto', 'q-shuffle', 'fusionar en descifra'), 'ScrambledText': ('L06-texto', 'q-scrambled', 'fusionar en descifra'),
    'FoldText': ('L06-texto', 'q-fold', 'ya cubierto por el preset pliega'), 'TrueFocus': ('L06-texto', 'q-truefocus', None),
    'GlitchText': ('L06-texto', 'q-glitch', 'referencia parcial: glitch de op-cifras en fx/arq-opus.js:663'), 'DepthText': ('L06-texto', 'q-depth', 'solo para .div-num'),
    'ParticleText': ('L06-texto', 'q-particle', None), 'MaskedHeading': ('L06-texto', 'q-masked', None),
    'CircularText': ('L06-texto', 'q-circular', None), 'TextPressure': ('L06-texto', 'q-pressure', None),
    'RotatingText': ('L06-texto', 'q-rotating', None), 'MetallicPaint': ('L06-texto', 'q-metallic', 'título de portada de cromo'),
    # revelados y animación
    'HalftoneReveal': ('L07-revelados', 'trama', 'recomendado sin implementar'), 'PixelTransition': ('L07-revelados', 'pixeles', 'recomendado sin implementar'),
    'DitherVeil': ('L07-revelados', 'q-ditherveil', 'modo dither de trama'), 'PixelSwap': ('L07-revelados', 'q-pixelswap', 'fusionar en pixeles'),
    'GlareHover': ('L07-revelados', 'q-glare', None), 'GradualBlur': ('L07-revelados', 'q-gradualblur', 'clase .borde-difuso'),
    'ScrollExpand': ('L07-revelados', 'q-scrollexpand', 'en un paso, la foto se amplía a sangre'), 'LaserFlow': ('L07-revelados', 'q-laserflow', None),
    'ElectricLogo': ('L07-revelados', 'q-electriclogo', None), 'Strands': ('L07-revelados', 'q-strands', 'solo decks de voz o asistentes'),
    # fondos
    'FloatingLines': ('L08-fondos', 'q-floatinglines', 'recomendado sin implementar'), 'GradientASCII': ('L08-fondos', 'q-gradientascii', 'recomendado sin implementar'),
    'FaultyTerminal': ('L08-fondos', 'q-faultyterminal', 'recomendado sin implementar'), 'ElasticMesh': ('L08-fondos', 'q-elasticmesh', 'solo portada de arcilla'),
    'AcidSquares': ('L08-fondos', 'q-acidsquares', None), 'Beams': ('L08-fondos', 'q-beams', None), 'CRTWarp': ('L08-fondos', 'q-crtwarp', None),
    'DarkVeil': ('L08-fondos', 'q-darkveil', None), 'Dither': ('L08-fondos', 'q-dither', None), 'Ferrofluid': ('L08-fondos', 'q-ferrofluid', None),
    'Galaxy': ('L08-fondos', 'q-galaxy', None), 'GhostFibers': ('L08-fondos', 'q-ghostfibers', None), 'GradientWaves': ('L08-fondos', 'q-gradientwaves', None),
    'GridMotion': ('L08-fondos', 'q-gridmotion', None), 'Iridescence': ('L08-fondos', 'q-iridescence', None), 'Scanner': ('L08-fondos', 'q-scanner', 'pintor alternativo de noche'),
    'PatternWaves': ('L08-fondos', 'q-patternwaves', None), 'PixelBlast': ('L08-fondos', 'q-pixelblast', 'se solapa con PatternWaves'),
    'RippleGrid': ('L08-fondos', 'q-ripplegrid', None), 'SoftAurora': ('L08-fondos', 'q-softaurora', None), 'Waves': ('L08-fondos', 'q-waves', 'duplica a hilos'),
    'LineWaves': ('L08-fondos', 'q-linewaves', 'familia de hilos'), 'LightRays': ('L08-fondos', 'q-lightrays', 'capa de foco sobre portada'),
    'MoltenMetal': ('L08-fondos', 'q-moltenmetal', 'alternativa de termica'), 'SlicedWaves': ('L08-fondos', 'q-slicedwaves', None),
    # piezas de interfaz
    'CallChip': ('L09-piezas', 'tarea', 'recomendado sin implementar'), 'LatticeLoader': ('L09-piezas', 'rejilla', 'recomendado sin implementar'),
    'MagnetLines': ('L09-piezas', 'campo', 'recomendado sin implementar (fx campo, sin ratón)'), 'Crosshair': ('L09-piezas', 'q-crosshair', 'lectura de coordenadas en reticula'),
    'LogoLoop': ('L09-piezas', 'q-logoloop', 'diapositiva de stack'), 'OrbitImages': ('L09-piezas', 'q-orbit', 'diagrama de ecosistema'),
    'AccordionGallery': ('L09-piezas', 'q-accordion', 'acordeón por pasos'), 'BorderGlow': ('L09-piezas', 'q-borderglow', 'generalizar focus-border de rice'),
    'BounceCards': ('L09-piezas', 'q-bouncecards', 'abanico de capturas'), 'DriftWall': ('L09-piezas', 'q-driftwall', 'muro de portada o separador'),
    'FlowingMenu': ('L09-piezas', 'q-flowingmenu', 'variante de agenda'), 'PixelCard': ('L09-piezas', 'q-pixelcard', 'revelado de panel por píxeles'),
    'Stack': ('L09-piezas', 'q-stack', 'modo pile de mazo'), 'StaggeredMenu': ('L09-piezas', 'q-staggered', 'entrada de separador'),
    'TiltedCard': ('L09-piezas', 'q-tilted', 'tarjeta que gira por paso'), 'CometDial': ('L09-piezas', 'q-cometdial', 'gauge de KPI'),
    'ThoughtLine': ('L09-piezas', 'q-thoughtline', 'charlas de LLM o agentes'), 'RefineFrame': ('L09-piezas', 'q-refineframe', 'charlas de difusión'),
    'SpringCheck': ('L09-piezas', 'q-springcheck', 'checklist ya lo cubre'),
}


def informes():
    """Filas de las tablas de los informes, por nombre de componente."""
    out = {}
    for f in sorted(glob.glob(os.path.join(RAIZ, INF, '*.md'))):
        hdr = None
        for line in open(f, encoding='utf-8'):
            if not line.startswith('|'):
                hdr = None; continue
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if hdr is None:
                hdr = [c.lower() for c in cells]; continue
            if set(cells[0]) <= set('-: '):
                continue
            row = dict(zip(hdr, cells))
            name = re.sub(r'\*', '', row.get('componente') or cells[0]).strip()
            que = next((row[k] for k in hdr if k.startswith('qué hace')), row.get('técnica', ''))
            est = next((row[k] for k in hdr if k.startswith('estilos')), '')
            out[name] = dict(informe=f'{INF}/{os.path.basename(f)}', que=que, estilos=est, coste=row.get('coste', ''),
                             valor=row.get('valor', ''), veredicto=re.sub(r'\*', '', row.get('veredicto', cells[-1])))
    return out


def uso_en_decks():
    """Atributos data-* y data-role que usan las diapositivas de cada data-fx en los decks y el Atlas."""
    uso = defaultdict(lambda: {'atributos': set(), 'roles': set(), 'decks': set()})
    skip = {'data-fx', 'data-section', 'data-title', 'data-step', 'data-role'}
    for f in [os.path.join(RAIZ, 'index.html')] + glob.glob(os.path.join(RAIZ, 'decks', '*', 'index.html')):
        deck = 'atlas' if os.path.dirname(f) == RAIZ else os.path.basename(os.path.dirname(f))
        html = open(f, encoding='utf-8').read()
        for m in re.finditer(r'<section\b([^>]*)>(.*?)</section>', html, re.S):
            fx = re.search(r'data-fx="([^"]+)"', m.group(1))
            if not fx:
                continue
            u = uso[fx.group(1)]
            u['decks'].add(deck)
            body = m.group(1) + m.group(2)
            u['atributos'].update(a for a in re.findall(r'\b(data-[a-z0-9-]+)=', body) if a not in skip)
            u['roles'].update(re.findall(r'data-role="([^"]+)"', body))
    return uso


def main():
    if os.path.exists(DB):
        os.remove(DB)
    db = sqlite3.connect(DB)
    db.executescript('''
    CREATE TABLE lotes (
      id TEXT PRIMARY KEY, nombre TEXT NOT NULL, descripcion TEXT, orden INTEGER NOT NULL, subplan_path TEXT);
    CREATE TABLE componentes (
      id TEXT PRIMARY KEY, nombre TEXT NOT NULL, lote_id TEXT NOT NULL REFERENCES lotes(id), sublote_id TEXT,
      estado_motor TEXT CHECK (estado_motor IN ('implementado','quizas')), proposito TEXT NOT NULL, parametros TEXT,
      archivo_fuente TEXT, explicado INTEGER DEFAULT 0, diapositivas TEXT, doc_resumen TEXT,
      -- columnas extra
      origen TEXT,          -- componente de react-bits del que viene, si lo hay
      nota TEXT,            -- fusión con algo existente, duplicado o restricción de uso
      atlas_actual TEXT     -- id de la diapositiva del Atlas actual que ya lo muestra
    );''')
    for i, (lid, nom, desc) in enumerate(LOTES, 1):
        db.execute('INSERT INTO lotes VALUES (?,?,?,?,?)', (lid, nom, desc, i, f'planning/atlas/{lid}/plan.md'))

    uso = uso_en_decks()
    for cid, nom, lote, prop, arch, par, sub, atlas in IMPL:
        par = dict(par or {})
        fx = cid[3:] if cid.startswith('fx-') else cid if cid in uso else None
        if fx and fx in uso:
            u = uso[fx]
            par['uso_observado'] = {'decks': sorted(u['decks']), 'atributos': sorted(u['atributos']), 'roles': sorted(u['roles'])}
        db.execute('INSERT INTO componentes (id,nombre,lote_id,sublote_id,estado_motor,proposito,parametros,archivo_fuente,atlas_actual) VALUES (?,?,?,?,?,?,?,?,?)',
                   (cid, nom, lote, sub, 'implementado', prop, json.dumps(par, ensure_ascii=False) if par else None, arch, atlas))

    inf = informes()
    falta = [n for n in QUIZAS if n not in inf]
    if falta:
        raise SystemExit(f'componentes sin fila en los informes: {falta}')
    for name, (lote, cid, nota) in QUIZAS.items():
        r = inf[name]
        par = {k: r[k] for k in ('estilos', 'coste', 'valor') if r[k]}
        par['veredicto_informe'] = r['veredicto']
        db.execute('INSERT INTO componentes (id,nombre,lote_id,estado_motor,proposito,parametros,archivo_fuente,origen,nota) VALUES (?,?,?,?,?,?,?,?,?)',
                   (cid, name if cid.startswith('q-') else f'{cid} ({name})', lote, 'quizas', r['que'] or name,
                    json.dumps(par, ensure_ascii=False), f"{r['informe']} (aún no existe en el código)", name, nota))
    db.commit()
    for lid, n, q in db.execute("SELECT lote_id, COUNT(*), SUM(estado_motor='quizas') FROM componentes GROUP BY lote_id ORDER BY lote_id"):
        print(lid, n, q)
    print('total', db.execute('SELECT COUNT(*) FROM componentes').fetchone()[0])


if __name__ == '__main__':
    main()
