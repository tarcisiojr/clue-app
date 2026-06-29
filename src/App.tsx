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

  // Sincroniza a cor do tema com a barra de status e o fundo de html/body.
  useEffect(() => {
    const color = MODE_THEME_COLOR[theme] ?? '#17120d'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', color)
    document.documentElement.style.backgroundColor = color
    document.body.style.backgroundColor = color
  }, [theme])

  // Altura real do viewport via window.innerHeight — no PWA standalone do iOS o
  // 100dvh/100% às vezes reporta menos que a tela, deixando uma faixa embaixo.
  // Medir com JS e aplicar como variável CSS resolve em qualquer aparelho.
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`,
      )
    }
    setHeight()
    window.addEventListener('resize', setHeight)
    window.addEventListener('orientationchange', setHeight)
    return () => {
      window.removeEventListener('resize', setHeight)
      window.removeEventListener('orientationchange', setHeight)
    }
  }, [])

  const showHome = phase === 'home' || !hasGame

  // App shell: altura medida por JS (fallback 100dvh). O body não rola; só a área
  // de conteúdo de cada tela rola, como num app nativo.
  return (
    <div
      data-theme={theme}
      className="app-bg overflow-hidden"
      style={{ height: 'var(--app-height, 100dvh)' }}
    >
      {showHome && <Home />}
      {!showHome && phase === 'setup' && <Setup />}
      {!showHome && phase === 'game' && <GameScreen />}
    </div>
  )
}
