import { lazy, Suspense, useState } from 'react'
import { Header } from './components/layout/Header'
import { Hero } from './components/layout/Hero'
import { Footer } from './components/layout/Footer'
import { Section } from './components/layout/Section'
import { PlayersProvider, usePlayers } from './lib/PlayersContext'
import { PlayerCombobox } from './components/common/PlayerCombobox'
import { Loader } from './components/common/AsyncState'

// Recharts y Cytoscape son las dependencias más pesadas: se cargan bajo
// demanda para no inflar el bundle inicial con secciones que están debajo
// del pliegue.
const H2HChart = lazy(() => import('./components/charts/H2HChart').then((m) => ({ default: m.H2HChart })))
const TopWinsChart = lazy(() => import('./components/charts/TopWinsChart').then((m) => ({ default: m.TopWinsChart })))
const TopPerformanceChart = lazy(() =>
  import('./components/charts/TopPerformanceChart').then((m) => ({ default: m.TopPerformanceChart })),
)
const PerformanceByYearChart = lazy(() =>
  import('./components/charts/PerformanceByYearChart').then((m) => ({ default: m.PerformanceByYearChart })),
)
const NetworkGraph = lazy(() => import('./components/graph/NetworkGraph').then((m) => ({ default: m.NetworkGraph })))

const FEATURED_PLAYERS = [
  'Roger Federer',
  'Rafael Nadal',
  'Novak Djokovic',
  'Pete Sampras',
  'Bjorn Borg',
  'John McEnroe',
  'Jimmy Connors',
  'Andre Agassi',
  'Andy Murray',
  'Stan Wawrinka',
  'Carlos Alcaraz',
  'Jannik Sinner',
]

function App() {
  const [h2hPlayer, setH2hPlayer] = useState<string | null>('Roger Federer')
  const [perfPlayer, setPerfPlayer] = useState<string | null>('Rafael Nadal')

  function openFullProfile(name: string) {
    setH2hPlayer(name)
    setPerfPlayer(name)
    document.getElementById('h2h')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PlayersProvider>
      <Header />
      <main className="flex-1">
        <Hero />

        <Section
          id="h2h"
          eyebrow="Rivalidades"
          title="Head-to-Head de tenistas"
          description={
            <>
              El Head-to-Head (H2H) compara el historial de enfrentamientos entre dos tenistas: quién ganó más veces y
              con qué margen. <strong className="text-white">Los rivales de los grandes suelen ser otros grandes.</strong>
            </>
          }
        >
          <PlayerSelector value={h2hPlayer} onChange={setH2hPlayer} />
          <div className="mt-6">
            <Suspense fallback={<Loader />}>
              <H2HChart player={h2hPlayer} />
            </Suspense>
          </div>
        </Section>

        <Section
          id="rankings"
          wide
          eyebrow="Rankings históricos"
          title="Victorias vs. rendimiento"
          description="¿Son los mejores los que más ganan, o los que ganan con mejor porcentaje? Ambas vistas cuentan una historia distinta."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-court-200">Top 20 · más victorias de carrera</h3>
              <Suspense fallback={<Loader />}>
                <TopWinsChart />
              </Suspense>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-court-200">Top 20 · mejor rendimiento (mín. 100 partidos)</h3>
              <Suspense fallback={<Loader />}>
                <TopPerformanceChart />
              </Suspense>
            </div>
          </div>
        </Section>

        <Section
          id="rendimiento"
          eyebrow="Trayectoria"
          title="Rendimiento individual por año"
          description={
            <>
              Porcentaje de victorias respecto al total de partidos jugados cada temporada. La línea roja marca el 80%,
              el umbral que suelen tocar las mejores versiones de un jugador.
            </>
          }
        >
          <PlayerSelector value={perfPlayer} onChange={setPerfPlayer} />
          <div className="mt-6">
            <Suspense fallback={<Loader />}>
              <PerformanceByYearChart player={perfPlayer} />
            </Suspense>
          </div>
        </Section>

        <Section
          id="grafo"
          wide
          eyebrow="La pieza central"
          title="Grafo de rivalidades ATP"
          description={
            <>
              Cada nodo es un tenista con al menos 200 victorias de carrera; cada arista, un cruce directo entre ambos.
              Arrastra los nodos, haz zoom, ajusta el umbral de victorias y de enfrentamientos para explorar distintos
              recortes de la historia del tenis, y haz clic en un jugador para ver el detalle de sus rivalidades.
            </>
          }
        >
          <Suspense fallback={<Loader label="Cargando el grafo…" />}>
            <NetworkGraph onSelectPlayer={openFullProfile} />
          </Suspense>
        </Section>
      </main>
      <Footer />
    </PlayersProvider>
  )
}

function PlayerSelector({ value, onChange }: { value: string | null; onChange: (name: string) => void }) {
  const { players } = usePlayers()
  return <PlayerCombobox players={players} value={value} onChange={onChange} quickPicks={FEATURED_PLAYERS} />
}

export default App
