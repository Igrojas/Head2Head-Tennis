import altair as alt
import pandas as pd

def BuscarH2HJugador(diccionario, jugador):
    # Filtramos directamente con un diccionario de comprensión
    return {key: data for key, data in diccionario.items() if key[0] == jugador}

def GraficaH2H(nombre_jugador, H2HDict):
    H2Hjugador = BuscarH2HJugador(H2HDict, nombre_jugador)

    # Utilizamos list comprehensions para crear las listas
    Rival = [y for (x, y), data in H2Hjugador.items() if data["total_matches"] >= 1]
    victorias = [data["wins_player1"] for (x, y), data in H2Hjugador.items() if data["total_matches"] >= 1]
    Derrotas = [data["total_matches"] - data["wins_player1"] for (x, y), data in H2Hjugador.items() if data["total_matches"] >= 1]

    data = pd.DataFrame({
        'Rival': Rival,
        'Victorias': victorias,
        'Derrotas': Derrotas
    })

    # Calcular total de enfrentamientos
    data['Total'] = data['Victorias'] + data['Derrotas']
    data = data.sort_values(by='Total', ascending=False).head(10)

    # Crear el gráfico de barras apiladas
    chart = alt.Chart(data).transform_fold(
        ['Victorias', 'Derrotas'],
        as_=['Resultado', 'Cantidad']
    ).mark_bar().encode(
        y=alt.Y('Rival:N', sort='-x'),
        x='Cantidad:Q',
        color='Resultado:N',
        tooltip=['Rival', 'Victorias', 'Derrotas', 'Total']
    ).properties(
        width=600,
        height=400,
        title='Head-to-Head de ' + nombre_jugador 
    )

    return chart

def GraficaMasVictorias(MostWinsDict):

    # for player, stats in MostWinsDict.items():
    #     victorias = stats['Victorias']
    #     total_partidos = stats['Total_Partidos']
        
    #     # Calcular el rendimiento y almacenarlo en el diccionario
    #     if total_partidos > 0:
    #         rendimiento = victorias / total_partidos
    #     else:
    #         rendimiento = 0.0
        
    #     MostWinsDict[player]['Rendimiento'] = rendimiento

    df_most_wins = pd.DataFrame.from_dict(MostWinsDict, orient='index').reset_index()
    df_most_wins = df_most_wins.rename(columns={'index': 'Jugador'})

    top_20_victorias = df_most_wins.sort_values(by='Victorias', ascending=False).head(20)

    chart_victorias = alt.Chart(top_20_victorias).mark_bar().encode(
        x=alt.X('Victorias:Q', title='Victorias'),
        y=alt.Y('Jugador:N', title='Jugador', sort='-x'),
        color=alt.Color('Jugador:N', legend=None),
        tooltip=['Jugador', 'Victorias']
    ).properties(
        title='Top 20 jugadores con más victorias',
        width=600
    )
    return chart_victorias

def GraficaRendimiento(MostWinsDict):

    df_most_wins = pd.DataFrame.from_dict(MostWinsDict, orient='index').reset_index()
    df_most_wins = df_most_wins.rename(columns={'index': 'Jugador'})
    df_most_wins['Rendimiento'] = df_most_wins['Victorias'] / df_most_wins['Total_Partidos']
    df_most_wins = df_most_wins[df_most_wins['Total_Partidos'] >= 100]
    top_20_rendimiento = df_most_wins.sort_values(by='Rendimiento', ascending=False).head(20)

    chart_rendimiento = alt.Chart(top_20_rendimiento).mark_bar().encode(
        x=alt.X('Rendimiento:Q', title='Rendimiento'),
        y=alt.Y('Jugador:N', title='Jugador', sort='-x'),
        color=alt.Color('Jugador:N',  legend=None),
        tooltip=['Jugador', 'Rendimiento']
    ).properties(
        title='Top 20 jugadores con mejor rendimiento (más de 100 partidos)',
        width=600
    )

    text = chart_rendimiento.mark_text(
        align='left',
        baseline='middle',
        dx=10,
        # color ='black'
    ).encode(
        text=alt.Text('Rendimiento:Q', format='.3f')
    )

    chart_rendimiento = (chart_rendimiento + text).interactive()

    return chart_rendimiento