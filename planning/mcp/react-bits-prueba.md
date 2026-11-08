# Prueba de la fase 4: portar con las herramientas `rb_*`

Fecha: 2026-11-08. Componentes: `q-glitch` (GlitchText) y `q-rotating` (RotatingText), dos «quizás» de L06 de coste bajo y técnicas distintas (máscaras CSS con un bucle propio; `motion/react`).

## Qué se hizo

| Paso | GlitchText | RotatingText |
|---|---|---|
| Consulta | `rb_ficha`, `rb_codigo resumen`, `css`, dos rangos (constantes 6–72 y bucle 103–300) y el marcado (318–368) | `rb_ficha`, `resumen`, `css`, dos rangos (efectos 43–77 y reparto 150–217) |
| Esqueleto | `rb_preparar destino=pieza`: cabecera con las 18 props mapeadas | `rb_preparar destino=pieza` |
| Port | `fx/experimental/exp-glitch.js`: cuatro modos, ráfaga por paso (`data-trigger="paso"`), colores `--x`/`--z`, `api.rng` | `fx/experimental/exp-rotating.js`: cinco efectos con WAAPI, escalonado, resalte que ajusta el ancho, automático o por pasos (`data-pasos`) |
| Prueba | deck temporal creado con el MCP; `revisar` sin hallazgos; `capturar` en reposo; script de comportamiento | ídem |

Comportamiento comprobado: el glitch se mueve con la diapositiva activa, se detiene al salir y queda quieto con movimiento reducido; la ráfaga dura lo pedido y vuelve al reposo; la rotación automática cambia de texto cada intervalo; con `data-pasos`, → y ← cambian el texto en los dos sentidos. Sin errores de consola. Los dos ports se cargan en el Atlas Completo (`src/_pie.html`) y `atlas.db` apunta a ellos (`archivo_fuente`; el estado sigue en `quizas` hasta que L06 los explique).

## Contexto leído

| Componente | Sin herramientas (`.jsx` + `.css` + demo con la tabla de props) | Con herramientas | Diferencia |
|---|---:|---:|---:|
| GlitchText | 25 160 caracteres | 18 936 | −25 % |
| RotatingText | 24 042 | 9 349 | −61 % |
| FloatingLines (solo consulta: ficha + mapa + shaders) | 34 049 | 11 500 | −66 % |
| Galaxy | 32 500 | 12 042 | −63 % |
| LightRays | 32 623 | 11 468 | −65 % |
| SoftAurora | 28 984 | 11 090 | −62 % |
| Iridescence | 27 115 | 7 590 | −72 % |

## Lo que aportó cada herramienta

- `rb_ficha` sustituye a la demo (unos 10 000 caracteres por componente) para conocer las props: es el mayor ahorro en todos los casos.
- `rb_codigo resumen` (menos de 1 000 caracteres) basta para decidir qué rangos leer.
- `rb_codigo shaders` hace que en los fondos WebGL se lea un tercio del archivo; en texto el ahorro depende de cuánto del archivo sea lógica (GlitchText es casi todo bucle).
- `rb_preparar` ahorra escribir la cabecera, el mapeo de props y el ciclo de eventos de una pieza; el cuerpo hay que escribirlo igual.
- `rb_tecnica` aportó una trampa real que habría costado un fallo: `api.raf` da milisegundos y `frame()` de los pintores, segundos (se añadió a la receta durante la prueba).

## Errores encontrados y corregidos durante la prueba

- `rb_codigo props` no encontraba las props de componentes con `forwardRef((props, ref) => { const { … } = props })`: corregido (217 de 218; LogoLoop remite a la ficha).
- `rb_preparar` copiaba los valores por defecto con sus comillas y no marcaba como interacción props como `trigger` o `pauseOnHover`: corregido.
- La línea «Receta» de la cabecera salía vacía en componentes sin WebGL: ahora agrupa las técnicas en las recetas que existen.
- `crear_deck` no aceptaba `fx/experimental/…` como extra: ahora sí, solo para pruebas.

## Conclusión

Las herramientas compensan: reducen el contexto entre un 25 % y un 72 % y evitan errores de traducción conocidos. Se recomienda usarlas en el resto de L06 y, sobre todo, en L08 (25 fondos WebGL), donde el ahorro es mayor. La comparación no mide el tiempo de una persona ni de otro modelo: el mismo agente hizo las dos lecturas, así que el dato fiable es el de contexto.
