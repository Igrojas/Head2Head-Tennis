# Head2Head Tennis

Un recorrido por los números de los grandes del tenis: head-to-head, rankings
históricos, rendimiento por temporada y un **grafo interactivo de
rivalidades** entre los jugadores con más victorias de la historia del ATP
(1968–2023).

Los datos base son del repositorio de [Jeff Sackmann](https://github.com/JeffSackmann/tennis_atp).

## Estructura del repositorio

```
web/                    App web (React + Vite + TypeScript + Tailwind) — la interfaz actual
scripts/
  export_web_data.py    Genera web/public/data/*.json a partir de data procesada/
data/, data1998/,
tennis_atp-master/       CSV crudos de partidos ATP por temporada (fuente original)
data procesada/          H2H, victorias y rendimiento ya agregados (JSON/XLSX)
Head2Head.ipynb,
TenisDataAnalisis.ipynb  Notebooks originales de exploración y preparación de datos
H2H_app.py, utils.py     App original en Streamlit (se mantiene como referencia histórica)
```

## App web

La interfaz principal es una SPA estática en `web/` (sin backend: todos los
datos se sirven como JSON pre-calculado bajo `web/public/data`).

```bash
python3 scripts/export_web_data.py   # genera web/public/data/ (primera vez / tras actualizar datos)
cd web
npm install
npm run dev       # desarrollo con recarga en caliente
npm run build      # build de producción en web/dist
npm run preview    # sirve el build de producción localmente
```

`web/dist` es un sitio 100% estático: se puede publicar tal cual en GitHub
Pages, Vercel, Netlify o cualquier hosting estático.

### Por qué se dejó Streamlit

La versión original (`H2H_app.py`) usaba Streamlit + Altair + un grafo Pyvis
embebido en un iframe fijo de 600px, sin filtros ni forma de manipularlo. La
versión en `web/` resuelve eso con una interfaz propia (React + Tailwind) y,
sobre todo, con un grafo construido en **Cytoscape.js** en vez de Pyvis:

- Ocupa toda la sección (hasta pantalla completa), no un iframe pequeño.
- Se puede arrastrar, hacer zoom/pan, y ajustar en vivo el umbral mínimo de
  victorias (qué jugadores entran al grafo) y el mínimo de enfrentamientos
  directos por arista (para reducir el ruido visual).
- La centralidad de grado (qué tan "hub de rivalidades" es un jugador) se
  recalcula en el cliente cada vez que cambian los filtros, en vez de quedar
  fija a un único recorte de datos como en la versión original.
- Buscador con autocompletado que salta y centra la vista en cualquier
  jugador, bajando el umbral automáticamente si hace falta para mostrarlo.
- Al hacer clic en un nodo se abre un panel con sus estadísticas y la lista
  completa de rivales dentro del grafo actual, con acceso directo a su perfil
  H2H completo.
- Layouts alternables (orgánico por rivalidad, concéntrico por victorias,
  circular, grilla) y leyenda de tamaño/color/grosor.

### Generar los datos

`web/public/data/` completo es un artefacto generado, **no se versiona en
git** (son ~5000 archivos y ~35MB derivados de `data procesada/`). Hay que
generarlo localmente antes de correr `npm run dev` / `npm run build` por
primera vez —y también en cualquier pipeline de despliegue— con:

```bash
python3 scripts/export_web_data.py
```

Esto lee `data procesada/{most_wins,h2h}.json` y `resultados_tenis.xlsx`, y
escribe en `web/public/data/`:

- `players.json`: catálogo liviano para el buscador (jugadores con ≥10
  partidos).
- `network.json`: nodos y aristas del grafo (jugadores con ≥200 victorias de
  carrera y sus enfrentamientos directos entre sí).
- `stats.json`: cifras generales para la portada.
- `h2h/<slug>.json` y `performance/<slug>.json`: un archivo por jugador,
  cargado bajo demanda solo cuando se selecciona en la UI (evita mandar los
  ~14MB de H2H de los 7500 jugadores en un solo archivo).

## App original (Streamlit)

Se conserva `H2H_app.py` / `utils.py` como referencia:

```bash
pip install -r requirements.txt
streamlit run H2H_app.py
```
