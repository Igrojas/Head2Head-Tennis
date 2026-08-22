import { useEffect, useMemo, useRef, useState } from 'react'
import { useFetchJSON } from '../../lib/useFetchJSON'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { dataUrl } from '../../lib/paths'
import { degreeCentrality } from '../../lib/centrality'
import { centralityColor, edgeIntensityColor, linScale } from '../../lib/scales'
import type { NetworkData } from '../../types'
import { Loader, ErrorState } from '../common/AsyncState'
import { NetworkCanvas, type NetworkCanvasHandle } from './NetworkCanvas'
import { NetworkControls } from './NetworkControls'
import { NetworkLegend } from './NetworkLegend'
import { NodeTooltip } from './NodeTooltip'
import { EdgeTooltip } from './EdgeTooltip'
import { PlayerDetailPanel } from './PlayerDetailPanel'
import type { LayoutName, StyledEdge, StyledNode } from './types'

const DEFAULT_MIN_WINS = 600
const DEFAULT_MIN_EDGE_MATCHES = 1
const DEFAULT_LAYOUT: LayoutName = 'fcose'
// Cuántos nodos por centralidad reciben el anillo de "hub" — una pista visual
// para no depender solo del color al identificar quién domina la red.
const HUB_COUNT = 5

interface HoverInfo {
  node: StyledNode
  x: number
  y: number
}

interface EdgeHoverInfo {
  edge: StyledEdge
  x: number
  y: number
}

export function NetworkGraph({ onSelectPlayer }: { onSelectPlayer: (name: string) => void }) {
  const state = useFetchJSON<NetworkData>(dataUrl('network.json'))

  if (state.status === 'loading' || state.status === 'idle') return <Loader label="Cargando el grafo de rivalidades…" />
  if (state.status === 'error') return <ErrorState message={state.error} />

  return <NetworkGraphReady data={state.data} onSelectPlayer={onSelectPlayer} />
}

function NetworkGraphReady({ data, onSelectPlayer }: { data: NetworkData; onSelectPlayer: (name: string) => void }) {
  const winsBounds = useMemo<[number, number]>(() => {
    const values = data.nodes.map((n) => n.wins)
    return [Math.min(...values), Math.max(...values)]
  }, [data.nodes])
  const edgeMatchesBounds = useMemo<[number, number]>(() => {
    const values = data.edges.map((e) => e.totalMatches)
    return [1, Math.max(...values)]
  }, [data.edges])

  const [minWinsDraft, setMinWinsDraft] = useState(() => Math.max(DEFAULT_MIN_WINS, winsBounds[0]))
  const [minEdgeDraft, setMinEdgeDraft] = useState(DEFAULT_MIN_EDGE_MATCHES)
  const minWins = useDebouncedValue(minWinsDraft)
  const minEdgeMatches = useDebouncedValue(minEdgeDraft)

  const [layoutName, setLayoutName] = useState<LayoutName>(DEFAULT_LAYOUT)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const [edgeHover, setEdgeHover] = useState<EdgeHoverInfo | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null)
  const canvasRef = useRef<NetworkCanvasHandle>(null)

  const filteredNodeSet = useMemo(() => {
    const set = new Set<string>()
    data.nodes.forEach((n) => {
      if (n.wins >= minWins) set.add(n.id)
    })
    return set
  }, [data.nodes, minWins])

  const filteredEdges = useMemo(
    () =>
      data.edges.filter(
        (e) => filteredNodeSet.has(e.source) && filteredNodeSet.has(e.target) && e.totalMatches >= minEdgeMatches,
      ),
    [data.edges, filteredNodeSet, minEdgeMatches],
  )

  const filteredNodes = useMemo(() => data.nodes.filter((n) => filteredNodeSet.has(n.id)), [data.nodes, filteredNodeSet])

  const centralityMap = useMemo(() => degreeCentrality(filteredNodes, filteredEdges), [filteredNodes, filteredEdges])

  const hubIds = useMemo(() => {
    return new Set(
      [...centralityMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, HUB_COUNT)
        .map(([id]) => id),
    )
  }, [centralityMap])

  const { styledNodes, styledEdges, nodesById } = useMemo(() => {
    const nodeWins = filteredNodes.map((n) => n.wins)
    const wMin = Math.min(...nodeWins, 0)
    const wMax = Math.max(...nodeWins, 1)
    const edgeCounts = filteredEdges.map((e) => e.totalMatches)
    const eMax = Math.max(...edgeCounts, 1)
    // Con muchos nodos las etiquetas se amontonan: se ocultan y se confía en el hover/búsqueda.
    const showLabels = filteredNodes.length <= 60

    const nodes: StyledNode[] = filteredNodes.map((n) => ({
      id: n.id,
      label: n.id,
      nodeLabel: showLabels ? n.id : '',
      wins: n.wins,
      totalMatches: n.totalMatches,
      winRate: n.winRate,
      centrality: centralityMap.get(n.id) ?? 0,
      // Rango amplio (18–128px) a propósito: con poca diferencia entre extremos
      // los nodos se leen todos "iguales". El exponente 0.85 además separa un
      // poco más el grueso de la distribución, no solo los outliers.
      size: 18 + ((n.wins - wMin) / Math.max(1, wMax - wMin)) ** 0.85 * (128 - 18),
      color: centralityColor(centralityMap.get(n.id) ?? 0),
      isHub: hubIds.has(n.id),
    }))

    const edges: StyledEdge[] = filteredEdges.map((e) => {
      const intensity = e.totalMatches / eMax
      return {
        id: `${e.source}__${e.target}`,
        source: e.source,
        target: e.target,
        totalMatches: e.totalMatches,
        winsSource: e.winsSource,
        winsTarget: e.winsTarget,
        width: linScale(Math.sqrt(e.totalMatches), 1, Math.sqrt(eMax), 1.4, 9),
        intensity,
        color: edgeIntensityColor(intensity),
      }
    })

    return { styledNodes: nodes, styledEdges: edges, nodesById: new Map(nodes.map((n) => [n.id, n])) }
  }, [filteredNodes, filteredEdges, centralityMap, hubIds])

  // Foco pendiente desde la búsqueda: espera a que el nodo exista en el set filtrado.
  useEffect(() => {
    if (!pendingFocusId) return
    if (!nodesById.has(pendingFocusId)) return
    const id = requestAnimationFrame(() => {
      canvasRef.current?.focus(pendingFocusId)
      setPendingFocusId(null)
    })
    return () => cancelAnimationFrame(id)
  }, [pendingFocusId, nodesById])

  function handleSearchSelect(name: string) {
    const node = data.nodes.find((n) => n.id === name)
    if (!node) return
    if (node.wins < minWinsDraft) {
      setMinWinsDraft(node.wins)
    }
    setPendingFocusId(name)
  }

  function handleReset() {
    setMinWinsDraft(Math.max(DEFAULT_MIN_WINS, winsBounds[0]))
    setMinEdgeDraft(DEFAULT_MIN_EDGE_MATCHES)
    setLayoutName(DEFAULT_LAYOUT)
    setSelectedId(null)
  }

  const searchPlayers = useMemo(
    () => data.nodes.map((n) => ({ name: n.id, slug: n.slug, wins: n.wins, totalMatches: n.totalMatches, winRate: n.winRate })),
    [data.nodes],
  )

  const selectedNode = selectedId ? nodesById.get(selectedId) ?? null : null

  return (
    <div
      className={
        expanded
          ? 'fixed inset-0 z-40 flex flex-col bg-ink-950'
          : 'flex flex-col overflow-hidden rounded-xl border border-ink-800'
      }
    >
      <NetworkControls
        minWins={minWinsDraft}
        minWinsBounds={winsBounds}
        onMinWinsChange={setMinWinsDraft}
        minEdgeMatches={minEdgeDraft}
        edgeMatchesBounds={edgeMatchesBounds}
        onMinEdgeMatchesChange={setMinEdgeDraft}
        layoutName={layoutName}
        onLayoutChange={setLayoutName}
        nodeCount={styledNodes.length}
        edgeCount={styledEdges.length}
        searchPlayers={searchPlayers}
        onSearchSelect={handleSearchSelect}
        onFit={() => canvasRef.current?.fit()}
        onZoomIn={() => canvasRef.current?.zoomBy(1.3)}
        onZoomOut={() => canvasRef.current?.zoomBy(1 / 1.3)}
        onReset={handleReset}
        expanded={expanded}
        onToggleExpanded={() =>
          setExpanded((v) => {
            if (v) {
              // Al salir de pantalla completa, el scroll de la página quedó donde estaba
              // antes de fijar el contenedor; volvemos a ubicar la sección del grafo.
              requestAnimationFrame(() => document.getElementById('grafo')?.scrollIntoView({ block: 'start' }))
            }
            return !v
          })
        }
      />

      <div className={`flex flex-1 flex-col sm:flex-row ${expanded ? '' : 'h-[75vh] min-h-[560px]'}`}>
        <div className="relative flex-1 bg-ink-950">
          <NetworkCanvas
            ref={canvasRef}
            nodes={styledNodes}
            edges={styledEdges}
            layoutName={layoutName}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onHover={setHover}
            onEdgeHover={setEdgeHover}
          />
          {hover && <NodeTooltip node={hover.node} x={hover.x} y={hover.y} />}
          {!hover && edgeHover && <EdgeTooltip edge={edgeHover.edge} x={edgeHover.x} y={edgeHover.y} />}
        </div>

        {selectedNode && (
          <PlayerDetailPanel
            node={selectedNode}
            edges={styledEdges}
            onClose={() => setSelectedId(null)}
            onOpenProfile={onSelectPlayer}
            onFocusRival={(name) => {
              if (nodesById.has(name)) setSelectedId(name)
              canvasRef.current?.focus(name)
            }}
          />
        )}
      </div>

      <NetworkLegend />
    </div>
  )
}
