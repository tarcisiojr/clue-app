import { useState } from 'react'
import { resolveEdition } from '../domain/editions'
import { useGameStore } from '../state/gameStore'
import { SolutionPanel } from './SolutionPanel'
import { Grid } from './Grid'
import { EventHistory } from './EventHistory'
import { SuggestionModal } from './SuggestionModal'

export function GameScreen() {
  const game = useGameStore((s) => s.game)!
  const result = useGameStore((s) => s.result)
  const goHome = useGameStore((s) => s.goHome)
  const goToSetup = useGameStore((s) => s.goToSetup)
  const addSuggestion = useGameStore((s) => s.addSuggestion)
  const undoLastEvent = useGameStore((s) => s.undoLastEvent)
  const cycleManualMark = useGameStore((s) => s.cycleManualMark)

  const [showModal, setShowModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const edition = resolveEdition(game.editionId, game.cardNames)

  if (!result) return null

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur">
        <button onClick={goHome} className="text-sm text-slate-400">
          ≡ Início
        </button>
        <h1 className="text-base font-bold text-slate-100">{edition.name}</h1>
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="px-2 text-lg text-slate-300"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
              <button
                onClick={() => {
                  setShowMenu(false)
                  goToSetup()
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-700"
              >
                Reconfigurar partida
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 py-4 pb-24">
        {result.contradiction && (
          <div className="rounded-lg border border-rose-500 bg-rose-500/15 px-3 py-2 text-sm text-rose-200">
            ⚠ Há informações contraditórias. Revise o histórico ou as marcações
            manuais.
          </div>
        )}

        <SolutionPanel edition={edition} result={result} />

        <Grid
          edition={edition}
          result={result}
          players={game.players}
          manualMarks={game.manualMarks}
          onCellTap={cycleManualMark}
        />

        <p className="text-center text-[11px] text-slate-500">
          ✓ tem · ✕ não tem · vazio = indefinido. Toque numa célula para marcar
          manualmente (• azul).
        </p>

        <EventHistory
          edition={edition}
          players={game.players}
          events={game.events}
          onUndo={undoLastEvent}
        />
      </div>

      {/* Botão de ação fixo */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-xl bg-amber-500 px-4 py-4 text-lg font-bold text-slate-900 shadow-lg transition active:scale-[0.99]"
        >
          + Registrar palpite
        </button>
      </div>

      {showModal && (
        <SuggestionModal
          edition={edition}
          players={game.players}
          onClose={() => setShowModal(false)}
          onSave={(suggesterId, cards, responses) => {
            addSuggestion(suggesterId, cards, responses)
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
