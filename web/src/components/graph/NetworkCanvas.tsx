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

interface NetworkCanvasProps {
  nodes: StyledNode[]
  edges: StyledEdge[]
  layoutName: LayoutName
  selectedId: string | null
  onSelect: (id: string | null) => void
  onHover: (info: HoverInfo | null) => void
}

// cytoscape-fcose añade opciones propias (randomize, nodeRepulsion, ...) que no
// están representadas en los tipos de @types/cytoscape, de ahí el `any`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LAYOUTS: Record<LayoutName, any> = {
  fcose: {
    name: 'fcose',
    animate: false,
    quality: 'default',
    nodeRepulsion: 9000,
    idealEdgeLength: 90,
    edgeElasticity: 0.35,
    nestingFactor: 0.1,
    randomize: true,
  },
  concentric: {
    name: 'concentric',
    animate: false,
    concentric: (n: cytoscape.NodeSingular) => n.data('wins'),
    levelWidth: () => 1,
    minNodeSpacing: 28,
  },
  circle: { name: 'circle', animate: false, spacingFactor: 1.1 },
  grid: { name: 'grid', animate: false, spacingFactor: 1.1 },
}

export const NetworkCanvas = forwardRef<NetworkCanvasHandle, NetworkCanvasProps>(function NetworkCanvas(
  { nodes, edges, layoutName, selectedId, onSelect, onHover },
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
            color: '#eef3ee',
            'font-size': 10,
            'text-valign': 'bottom',
            'text-margin-y': 4,
            'text-outline-width': 2,
            'text-outline-color': '#0a0f0c',
            'border-width': 2,
            'border-color': 'rgba(255,255,255,0.25)',
            'overlay-padding': 4,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 'data(width)',
            'line-color': '#4a7057',
            'curve-style': 'haystack',
            'haystack-radius': 0,
            opacity: 0.35,
          },
        },
        {
          selector: 'node:selected',
          style: { 'border-color': '#d7ff5f', 'border-width': 4 },
        },
        {
          selector: '.faded',
          style: { opacity: 0.08 },
        },
        {
          selector: '.highlighted',
          style: { opacity: 1 },
        },
        {
          selector: 'edge.highlighted',
          style: { 'line-color': '#d7ff5f', opacity: 0.9, width: 'data(width)' },
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
        },
        x: (box?.left ?? 0) + pos.x,
        y: (box?.top ?? 0) + pos.y,
      })
    })
    cy.on('mouseout', 'node', () => onHover(null))
    cy.on('dragfree', 'node', () => onHover(null))

    return () => {
      cy.destroy()
      cyRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reemplaza elementos cuando cambian los datos filtrados.
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.elements().remove()
    cy.add([
      ...nodes.map((n) => ({ group: 'nodes' as const, data: { ...n } })),
      ...edges.map((e) => ({ group: 'edges' as const, data: { ...e } })),
    ])
    cy.layout(LAYOUTS[layoutName]).run()
    cy.fit(undefined, 40)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges])

  // Re-ejecuta solo el layout si el usuario lo cambia (sin recrear elementos).
  useEffect(() => {
    const cy = cyRef.current
    if (!cy || cy.elements().length === 0) return
    cy.layout(LAYOUTS[layoutName]).run()
    cy.fit(undefined, 40)
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
