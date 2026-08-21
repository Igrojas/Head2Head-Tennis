"""
Genera los archivos estáticos que consume la app web (web/public/data) a
partir de los datos ya procesados en `data procesada/`. Se ejecuta una sola
vez (o cada vez que se regeneren los datos procesados); no corre en el
navegador.

Estrategia de tamaño: en vez de un único JSON gigante con el H2H de los 7500
jugadores que existieron (~14MB), se genera un catálogo liviano para
búsqueda (`players.json`) y un archivo H2H / rendimiento por jugador que el
front pide bajo demanda (fetch) solo cuando el usuario lo selecciona.

Uso:
    python3 scripts/export_web_data.py
"""
import json
import re
import unicodedata
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data procesada"
OUT = ROOT / "web" / "public" / "data"
(OUT / "h2h").mkdir(parents=True, exist_ok=True)
(OUT / "performance").mkdir(parents=True, exist_ok=True)

# Un jugador entra al catálogo buscable / H2H si jugó al menos esta cantidad
# de partidos profesionales (filtra byes de una sola aparición en 1968-1970).
CATALOG_MIN_MATCHES = 10

# Umbral mínimo de victorias para que un jugador entre al grafo de red (da
# margen para que el slider de la UI se pueda mover hacia abajo del default).
NETWORK_MIN_WINS = 200


def slugify(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "jugador"


def load_json(name: str):
    with open(SRC / name, "r", encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    most_wins = load_json("most_wins.json")
    h2h_raw = load_json("h2h.json")
    rend = pd.read_excel(SRC / "resultados_tenis.xlsx")

    slug_of: dict[str, str] = {}
    used_slugs: set[str] = set()
    for name in most_wins:
        base = slugify(name)
        slug = base
        i = 2
        while slug in used_slugs:
            slug = f"{base}-{i}"
            i += 1
        used_slugs.add(slug)
        slug_of[name] = slug

    catalog_names = {
        name for name, data in most_wins.items() if data["Total_Partidos"] >= CATALOG_MIN_MATCHES
    }

    # ---- players.json: catálogo liviano para búsqueda/autocomplete ----
    players = [
        {
            "name": name,
            "slug": slug_of[name],
            "wins": data["Victorias"],
            "totalMatches": data["Total_Partidos"],
            "winRate": round(data["Victorias"] / data["Total_Partidos"] * 100, 2)
            if data["Total_Partidos"]
            else 0,
        }
        for name, data in most_wins.items()
        if name in catalog_names
    ]
    players.sort(key=lambda p: p["wins"], reverse=True)
    with open(OUT / "players.json", "w", encoding="utf-8") as f:
        json.dump(players, f, ensure_ascii=False)

    # ---- h2h/<slug>.json: uno por jugador, bajo demanda ----
    h2h_by_player: dict[str, list[dict]] = {}
    for key_str, data in h2h_raw.items():
        player1, player2 = eval(key_str)  # datos propios, formato conocido
        if data["total_matches"] < 1 or player1 not in catalog_names:
            continue
        h2h_by_player.setdefault(player1, []).append(
            {
                "rival": player2,
                "wins": data["wins_player1"],
                "losses": data["total_matches"] - data["wins_player1"],
                "total": data["total_matches"],
            }
        )
    for name, rows in h2h_by_player.items():
        rows.sort(key=lambda r: r["total"], reverse=True)
        with open(OUT / "h2h" / f"{slug_of[name]}.json", "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False)

    # ---- performance/<slug>.json: rendimiento por año, uno por jugador ----
    perf_by_player: dict[str, list[dict]] = {}
    for jugador, group in rend.groupby("jugador"):
        if jugador not in catalog_names:
            continue
        rows = [
            {
                "year": int(r["año"]),
                "wins": int(r["victorias"]),
                "losses": int(r["derrotas"]) if not pd.isna(r["derrotas"]) else 0,
                "total": int(r["total partidos"]) if not pd.isna(r["total partidos"]) else 0,
                "rendimiento": round(float(r["Rendimiento"]), 2) if not pd.isna(r["Rendimiento"]) else 0,
            }
            for _, r in group.sort_values("año").iterrows()
        ]
        perf_by_player[jugador] = rows
        with open(OUT / "performance" / f"{slug_of[jugador]}.json", "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False)

    # ---- network.json: nodos + aristas para el grafo interactivo ----
    qualifying = {
        name for name, data in most_wins.items() if data["Victorias"] >= NETWORK_MIN_WINS
    }

    nodes = [
        {
            "id": name,
            "slug": slug_of[name],
            "wins": most_wins[name]["Victorias"],
            "totalMatches": most_wins[name]["Total_Partidos"],
            "winRate": round(
                most_wins[name]["Victorias"] / most_wins[name]["Total_Partidos"] * 100, 2
            )
            if most_wins[name]["Total_Partidos"]
            else 0,
        }
        for name in qualifying
    ]

    seen_pairs = set()
    edges = []
    for key_str, data in h2h_raw.items():
        p1, p2 = eval(key_str)
        if p1 not in qualifying or p2 not in qualifying:
            continue
        pair = frozenset((p1, p2))
        if pair in seen_pairs:
            continue
        seen_pairs.add(pair)
        edges.append(
            {
                "source": p1,
                "target": p2,
                "totalMatches": data["total_matches"],
                "winsSource": data["wins_player1"],
                "winsTarget": data["total_matches"] - data["wins_player1"],
            }
        )

    with open(OUT / "network.json", "w", encoding="utf-8") as f:
        json.dump({"nodes": nodes, "edges": edges, "minWins": NETWORK_MIN_WINS}, f, ensure_ascii=False)

    # ---- stats.json: cifras generales para el hero de la home ----
    total_matches = sum(d["Total_Partidos"] for d in most_wins.values()) // 2
    stats = {
        "playersTotal": len(most_wins),
        "playersCatalog": len(players),
        "totalMatches": total_matches,
        "yearFrom": int(rend["año"].min()),
        "yearTo": int(rend["año"].max()),
        "networkNodes": len(nodes),
        "networkEdges": len(edges),
    }
    with open(OUT / "stats.json", "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False)

    print(f"players catalog: {len(players)} (de {len(most_wins)} totales)")
    print(f"h2h files: {len(h2h_by_player)}")
    print(f"performance files: {len(perf_by_player)}")
    print(f"network nodes: {len(nodes)}, edges: {len(edges)}")


if __name__ == "__main__":
    main()
