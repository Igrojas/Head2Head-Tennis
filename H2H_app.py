import streamlit as st
import pandas as pd
import glob
from collections import defaultdict
import altair as alt
from pyvis.network import Network
from utils import *
import json 

###### CARGA DE ARCHIVOS #####

MostWinsDict = json.loads(open('data procesada/most_wins.json', 'r').read())
TotalPartidos = json.loads(open('data procesada/total_partidos.json', 'r').read())

with open('data procesada/h2h.json', 'r') as f:
    H2HDict_str = json.load(f)

H2HDict = {eval(k): v for k, v in H2HDict_str.items()}


st.title("""
         Mejores tenistas de la historias
         """)

st.header("""
Datos historicos de los mayores Head to Head de la historia del tenis
""")


#  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # 
st.title('Head-to-Head de Tenistas')

nombre_jugador = st.text_input('Ingrese el nombre del tenista', 'Roger Federer')

if nombre_jugador:
    chart = GraficaH2H(nombre_jugador, H2HDict)
    st.altair_chart(chart)

#  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # 
st.header("""
Tenistas con mas victorias en la historia del tenis
""")


chart_victorias = GraficaMasVictorias(MostWinsDict)
st.altair_chart(chart_victorias)
 

#  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # 
st.header("""
Tenistas con mejor rendimiento 
""")
chart_rendimiento = GraficaRendimiento(MostWinsDict)

st.latex(r'''
Rendimiento = \frac{\text{Victorias}}{\text{Total de Partidos}}
''')


st.write("""
El rendimiento se calcula dividiendo el número de victorias por el total de partidos jugados.
          Esta fórmula nos da una medida de la efectividad del jugador en términos de victorias.
""")

st.altair_chart(chart_rendimiento)

#  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # #  # # # # # 

st.markdown("""
## Grafo de Tenistas con Más de 600 Victorias

Un **grafo** es una estructura compuesta por nodos (o vértices) y aristas (o enlaces) que conectan pares de nodos. Los grafos son útiles para representar relaciones y conexiones en diversas áreas, como redes sociales, sistemas de transporte, y en este caso, los enfrentamientos directos entre tenistas.

## Construcción del Grafo de Tenistas

En este grafo, consideramos a los tenistas con más de 600 victorias. Los **nodos** representan a estos tenistas, y las **aristas** representan todos los enfrentamientos directos entre ellos.

### Pasos para la Construcción:

1. **Selección de Tenistas**:
   - Filtramos los datos para incluir solo a los tenistas con más de 600 victorias.

2. **Creación de Nodos**:
   - Cada tenista con más de 600 victorias se convierte en un nodo del grafo.

3. **Creación de Aristas**:
   - Para cada par de tenistas, si han jugado uno contra el otro, se crea una arista que conecta sus nodos respectivos. El peso de la arista puede representar el número de enfrentamientos directos entre ellos.

4. **Visualización en Streamlit**:
   - Utilizamos la biblioteca Pyvis para generar y visualizar el grafo interactivo en Streamlit.

Este enfoque nos permite visualizar de manera clara y dinámica las relaciones y rivalidades más significativas en el tenis, destacando a los jugadores más exitosos y sus enfrentamientos directos.
""")

st.markdown("""
En este análisis, utilizamos la **centralidad de grado** para explorar las interacciones entre tenistas con más de 600 victorias en su carrera.
             La centralidad de grado se representa con un gradiente de colores, donde tonos más oscuros indican una mayor centralidad.
             El objetivo es identificar quién es el tenista que ha enfrentado a más jugadores con esta distinción,
             lo que revela su nivel de competencia frente a los mejores en la historia del tenis.

""")

with open('tennis_top_players.html', 'r', encoding='utf-8') as f:
    html_content = f.read()
    st.components.v1.html(html_content, height=600)