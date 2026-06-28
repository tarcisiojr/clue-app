import { useState } from 'react'
import { resolveEdition } from '../domain/editions'
import { MODE_MOTIF } from '../domain/theme'
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
  const [tab, setTab] = useState<'grid' | 'history'>('grid')

  const edition = resolveEdition(game.editionId, game.cardNames)

  if (!result) return null

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      {/* Cabeçalho (app bar) — fixo no topo do shell */}
      <header className="flex shrink-0 items-center justify-between border-b border-line bg-app/95 px-4 pb-3 pt-[calc(0.75rem_+_env(safe-area-inset-top))] backdrop-blur">
        <button onClick={goHome} className="text-sm text-sub">
          ≡ Início
        </button>
        <h1 className="font-display flex items-center gap-1.5 text-lg font-bold text-ink">
          <span>{MODE_MOTIF[game.editionId]}</span>
          {edition.name}
        </h1>
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="px-2 text-lg text-sub"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-lg border border-line bg-surface shadow-xl">
              <button
                onClick={() => {
                  setShowMenu(false)
                  goToSetup()
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-surface2"
              >
                Reconfigurar partida
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Área de conteúdo — a única que rola */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-4">
        {result.contradiction && (
          <div className="rounded-lg border border-rose-500 bg-rose-500/15 px-3 py-2 text-sm text-rose-200">
            ⚠ Há informações contraditórias. Revise o histórico ou as marcações
            manuais.
          </div>
        )}

        {/* O painel de solução fica sempre visível, independente da aba. */}
        <SolutionPanel edition={edition} result={result} />

        {tab === 'grid' ? (
          <>
            <Grid
              edition={edition}
              result={result}
              players={game.players}
              manualMarks={game.manualMarks}
              onCellTap={cycleManualMark}
            />
            <p className="text-center text-[11px] text-muted">
              ✓ tem · ✕ não tem · vazio = indefinido. Toque numa célula para
              marcar manualmente (• azul).
            </p>
          </>
        ) : (
          <EventHistory
            edition={edition}
            players={game.players}
            events={game.events}
            onUndo={undoLastEvent}
          />
        )}
      </div>

      {/* Barra inferior (app bar) — parte fixa do shell */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-line bg-app/95 px-4 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-xl bg-accent px-4 py-3.5 text-lg font-bold text-slate-900 shadow-lg transition active:scale-[0.99]"
        >
          + Registrar palpite
        </button>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface/70 p-1">
          <button
            onClick={() => setTab('grid')}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              tab === 'grid' ? 'bg-surface2 text-ink' : 'text-sub'
            }`}
          >
            📋 Preenchimento
          </button>
          <button
            onClick={() => setTab('history')}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              tab === 'history' ? 'bg-surface2 text-ink' : 'text-sub'
            }`}
          >
            🕑 Histórico{game.events.length > 0 ? ` (${game.events.length})` : ''}
          </button>
        </div>
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
