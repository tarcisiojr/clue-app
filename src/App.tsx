import { useGameStore } from './state/gameStore'
import { Home } from './components/Home'
import { Setup } from './components/Setup'
import { GameScreen } from './components/GameScreen'

export default function App() {
  const phase = useGameStore((s) => s.phase)
  const hasGame = useGameStore((s) => s.game !== null)

  // Guarda: se não há partida carregada, sempre volta para a Home.
  if (!hasGame && phase !== 'home') {
    return <Home />
  }

  return (
    <div className="min-h-full">
      {phase === 'home' && <Home />}
      {phase === 'setup' && <Setup />}
      {phase === 'game' && <GameScreen />}
    </div>
  )
}
