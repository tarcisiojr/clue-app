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

  // Mantém a cor da barra de status do navegador/PWA em sintonia com o tema.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', MODE_THEME_COLOR[theme] ?? '#17120d')
  }, [theme])

  const showHome = phase === 'home' || !hasGame

  // App shell: cadeia height:100% (html → body → #root → app) preenche o viewport
  // do PWA standalone INCLUINDO as safe areas — assim a barra inferior cobre a
  // zona do home indicator (em vez de sobrar o fundo). O body não rola; só a
  // área de conteúdo de cada tela rola, como num app nativo.
  return (
    <div
      data-theme={theme}
      className="app-bg h-full overflow-hidden"
    >
      {showHome && <Home />}
      {!showHome && phase === 'setup' && <Setup />}
      {!showHome && phase === 'game' && <GameScreen />}
    </div>
  )
}
