export interface TabItem {
  id: string
  label: string
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
}

// Control tipo "cuadro de posiciones": una sola fila de pestañas que
// reemplaza el scroll largo por secciones — cambiar de vista es un clic, no
// un scroll. La pestaña activa se resuelve con un fondo sólido en vez de un
// simple subrayado, para que se lea de un vistazo incluso en el celular.
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto px-2 py-2 sm:px-4">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 font-display text-sm transition-colors ${
              isActive ? 'bg-clay-500 text-paper' : 'text-ink-300 hover:bg-ink-800 hover:text-paper'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
