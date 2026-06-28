import { useEffect } from 'react'
import { useGameStore } from './state/gameStore'
import { themeFor, MODE_THEME_COLOR } from './domain/theme'
import { Home } from './components/Home'
import { Setup } from './components/Setup'
import { GameScreen } from './components/GameScreen'

export default function App() {
  const phase = useGameStore((s) => s.phase)
  const editionId = useGameStore((s) => s.game?.editionId)
  const hasGame = useGameStore((s) => s.game !== null)

  // Na Home (sem partida) usa o tema padrão (Mansão); nas demais telas, o do modo.
  const theme = phase === 'home' || !hasGame ? 'mansao' : themeFor(editionId)

  // Sincroniza a cor do tema com: (1) a barra de status; (2) o fundo de html/body.
  // Pintar html/body com a cor do tema garante que qualquer faixa de safe area
  // (zona do home indicator no PWA) fique invisível — mesma cor da barra inferior.
  useEffect(() => {
    const color = MODE_THEME_COLOR[theme] ?? '#17120d'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', color)
    document.documentElement.style.backgroundColor = color
    document.body.style.backgroundColor = color
  }, [theme])

  const showHome = phase === 'home' || !hasGame

  // App shell: preenche o viewport do PWA (100dvh + cadeia height:100%) e o body
  // não rola; só a área de conteúdo de cada tela rola, como num app nativo.
  return (
    <div
      data-theme={theme}
      className="app-bg h-[100dvh] overflow-hidden"
    >
      {showHome && <Home />}
      {!showHome && phase === 'setup' && <Setup />}
      {!showHome && phase === 'game' && <GameScreen />}
    </div>
  )
}
