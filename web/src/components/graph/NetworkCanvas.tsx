import cytoscape, { type Core, type EventObject } from 'cytoscape'
import fcose from 'cytoscape-fcose'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { LayoutName, StyledEdge, StyledNode } from './types'

cytoscape.use(fcose)

export interface NetworkCanvasHandle {
  fit: () => void
  zoomBy: (factor: number) => void
  focus: (id: string) => void
}

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

interface NetworkCanvasProps {
  nodes: StyledNode[]
  edges: StyledEdge[]
  layoutName: LayoutName
  selectedId: string | null
  onSelect: (id: string | null) => void
  onHover: (info: HoverInfo | null) => void
  onEdgeHover: (info: EdgeHoverInfo | null) => void
}

// Todos los layouts comparten fit + una animación corta: la red se ve
// "acomodarse" en vez de aparecer de golpe, y el ajuste de cámara al layout
// nuevo ocurre solo al terminar de animar (cytoscape lo maneja internamente
// cuando fit:true convive con animate:true).
const SHARED_LAYOUT_OPTS = { fit: true, padding: 40, animate: true, animationDuration: 550, animationEasing: 'ease-out' }

// cytoscape-fcose añade opciones propias (randomize, nodeRepulsion, ...) que no
// están representadas en los tipos de @types/cytoscape, de ahí el `any`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LAYOUTS: Record<LayoutName, any> = {
  fcose: {
    ...SHARED_LAYOUT_OPTS,
    name: 'fcose',
    quality: 'default',
    nodeRepulsion: 9000,
    idealEdgeLength: 90,
    edgeElasticity: 0.35,
    nestingFactor: 0.1,
    randomize: true,
  },
  concentric: {
    ...SHARED_LAYOUT_OPTS,
    name: 'concentric',
    concentric: (n: cytoscape.NodeSingular) => n.data('wins'),
    levelWidth: () => 1,
    minNodeSpacing: 28,
  },
  circle: { ...SHARED_LAYOUT_OPTS, name: 'circle', spacingFactor: 1.1 },
  grid: { ...SHARED_LAYOUT_OPTS, name: 'grid', spacingFactor: 1.1 },
}

export const NetworkCanvas = forwardRef<NetworkCanvasHandle, NetworkCanvasProps>(function NetworkCanvas(
  { nodes, edges, layoutName, selectedId, onSelect, onHover, onEdgeHover },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  // Init / destroy una sola vez.
  useEffect(() => {
    if (!containerRef.current) return
    const cy = cytoscape({
      container: containerRef.current,
      minZoom: 0.15,
      maxZoom: 4,
      wheelSensitivity: 0.25,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            width: 'data(size)',
            height: 'data(size)',
            label: 'data(nodeLabel)',
            color: '#f3efe4',
            'font-family': "'Public Sans', system-ui, sans-serif",
            'font-size': 11,
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-outline-width': 2,
            'text-outline-color': '#0a0f0c',
            'border-width': 2,
            'border-color': 'rgba(243,239,228,0.3)',
            'overlay-padding': 6,
            'transition-property': 'border-width, border-color, background-color, opacity',
            'transition-duration': 140,
            'z-index': 1,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 'data(width)',
            'line-color': 'data(color)',
            'line-cap': 'round',
            'curve-style': 'haystack',
            'haystack-radius': 0,
            // @types/cytoscape solo tipa `opacity` como número; en runtime cytoscape
            // sí acepta la sintaxis mapData(...) como en el resto de props data-driven.
            opacity: 'mapData(intensity, 0, 1, 0.45, 0.95)' as unknown as number,
            'transition-property': 'opacity, line-color, width',
            'transition-duration': 140,
          },
        },
        {
          // Anillo distintivo para los nodos más conectados del recorte actual:
          // una pista visual adicional al color, para no depender solo de tono.
          selector: 'node.hub',
          style: {
            'outline-width': 3,
            'outline-color': '#d7ff5f',
            'outline-offset': 3,
            'outline-opacity': 0.85,
          },
        },
        {
          selector: 'node.hovered',
          style: { 'border-width': 4, 'border-color': '#f3efe4', 'z-index': 20 },
        },
        {
          selector: 'node:selected',
          style: { 'border-color': '#d7ff5f', 'border-width': 5, 'z-index': 30 },
        },
        {
          selector: '.faded',
          style: { opacity: 0.06 },
        },
        {
          selector: 'node.highlighted',
          style: { opacity: 1, 'z-index': 15 },
        },
        {
          selector: 'edge.highlighted',
          style: { 'line-color': '#d7ff5f', opacity: 0.95, width: 'data(width)' },
        },
      ],
      layout: { name: 'preset' },
    })
    cyRef.current = cy

    cy.on('tap', 'node', (evt: EventObject) => {
      onSelect(evt.target.id())
    })
    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) onSelect(null)
    })
    cy.on('mouseover', 'node', (evt: EventObject) => {
      const n = evt.target
      n.addClass('hovered')
      onEdgeHover(null)
      const pos = n.renderedPosition()
      const box = containerRef.current?.getBoundingClientRect()
      onHover({
        node: {
          id: n.id(),
          label: n.data('label'),
          nodeLabel: n.data('nodeLabel'),
          size: n.data('size'),
          color: n.data('color'),
          wins: n.data('wins'),
          totalMatches: n.data('totalMatches'),
          winRate: n.data('winRate'),
          centrality: n.data('centrality'),
          isHub: n.data('isHub'),
        },
        x: (box?.left ?? 0) + pos.x,
        y: (box?.top ?? 0) + pos.y,
      })
    })
    cy.on('mouseout', 'node', (evt: EventObject) => {
      evt.target.removeClass('hovered')
      onHover(null)
    })
    cy.on('dragfree', 'node', (evt: EventObject) => {
      evt.target.removeClass('hovered')
      onHover(null)
    })

    cy.on('mouseover', 'edge', (evt: EventObject) => {
      const e = evt.target
      onHover(null)
      const pos = e.renderedMidpoint()
      const box = containerRef.current?.getBoundingClientRect()
      onEdgeHover({
        edge: {
          id: e.id(),
          source: e.data('source'),
          target: e.data('target'),
          width: e.data('width'),
          totalMatches: e.data('totalMatches'),
          winsSource: e.data('winsSource'),
          winsTarget: e.data('winsTarget'),
          intensity: e.data('intensity'),
          color: e.data('color'),
        },
        x: (box?.left ?? 0) + pos.x,
        y: (box?.top ?? 0) + pos.y,
      })
    })
    cy.on('mouseout', 'edge', () => onEdgeHover(null))

    return () => {
      cy.destroy()
      cyRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reemplaza elementos cuando cambian los datos filtrados: entran con un
  // fade-in mientras el layout los acomoda, en vez de aparecer de golpe.
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.elements().remove()
    const added = cy.add([
      ...nodes.map((n) => ({ group: 'nodes' as const, data: { ...n }, classes: n.isHub ? 'hub' : '' })),
      ...edges.map((e) => ({ group: 'edges' as const, data: { ...e } })),
    ])
    added.style('opacity', 0)
    cy.layout(LAYOUTS[layoutName]).run()
    added
      .animate({ style: { opacity: 1 } }, { duration: 550, easing: 'ease-out', complete: () => added.removeStyle('opacity') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges])

  // Re-ejecuta solo el layout si el usuario lo cambia (sin recrear elementos).
  useEffect(() => {
    const cy = cyRef.current
    if (!cy || cy.elements().length === 0) return
    cy.layout(LAYOUTS[layoutName]).run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutName])

  // Selección + resaltado de vecindario.
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.elements().unselect()
    cy.elements().removeClass('faded highlighted')
    if (!selectedId) return
    const node = cy.$id(selectedId)
    if (node.empty()) return
    node.select()
    const neighborhood = node.closedNeighborhood()
    cy.elements().difference(neighborhood).addClass('faded')
    neighborhood.addClass('highlighted')
  }, [selectedId])

  useImperativeHandle(ref, () => ({
    fit: () => cyRef.current?.fit(undefined, 40),
    zoomBy: (factor) => {
      const cy = cyRef.current
      if (!cy) return
      cy.zoom({ level: cy.zoom() * factor, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } })
    },
    focus: (id) => {
      const cy = cyRef.current
      if (!cy) return
      const node = cy.$id(id)
      if (node.empty()) return
      cy.animate({ center: { eles: node }, zoom: Math.max(cy.zoom(), 1.4) }, { duration: 400 })
      onSelect(id)
    },
  }))

  return <div ref={containerRef} className="h-full w-full" />
})
