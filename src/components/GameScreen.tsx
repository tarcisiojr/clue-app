import { useState } from 'react'
import { resolveEdition } from '../domain/editions'
import { MODE_MOTIF } from '../domain/theme'
import { useGameStore } from '../state/gameStore'
import { SolutionPanel } from './SolutionPanel'
import { Grid } from './Grid'
import { EventHistory } from './EventHistory'
import { SuggestionModal } from './SuggestionModal'
import { Icon, type IconName } from './md/Icon'

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
      {/* Top app bar (MD3) */}
      <header className="flex h-16 shrink-0 items-center gap-1 bg-app/90 px-1 pt-[env(safe-area-inset-top)] backdrop-blur">
        <IconButton icon="home" label="Início" onClick={goHome} />
        <h1 className="font-display flex min-w-0 flex-1 items-center justify-center gap-1.5 text-xl font-bold text-ink">
          <span>{MODE_MOTIF[game.editionId]}</span>
          <span className="truncate">{edition.name}</span>
        </h1>
        <div className="relative">
          <IconButton
            icon="more"
            label="Mais opções"
            onClick={() => setShowMenu((v) => !v)}
          />
          {showMenu && (
            <div className="md-elev-2 absolute right-1 top-12 z-30 w-52 overflow-hidden rounded-xl border border-line bg-surface2 py-1">
              <button
                onClick={() => {
                  setShowMenu(false)
                  goToSetup()
                }}
                className="md-state block w-full px-4 py-3 text-left text-sm text-ink"
              >
                Reconfigurar partida
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Área de conteúdo — a única que rola */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-8 pt-2">
        {result.contradiction && (
          <div className="flex items-start gap-2 rounded-2xl bg-error/15 px-4 py-3 text-sm text-error">
            <Icon name="close" size={18} className="mt-0.5 shrink-0" />
            <span>
              Há informações contraditórias. Revise o histórico ou as marcações
              manuais.
            </span>
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
            <p className="px-1 text-center text-[11px] leading-relaxed text-muted">
              ✓ tem · ✕ não tem · vazio = indefinido. Toque numa célula para
              marcar manualmente (• destacado).
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

      {/* Extended FAB (MD3) — ação principal, sobreposto à navegação inferior */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowModal(true)}
          className="md-elev-3 md-state absolute -top-7 right-4 z-10 flex h-14 items-center gap-2 rounded-2xl bg-accentC px-5 font-semibold text-onAccentC"
        >
          <Icon name="add" size={24} />
          Registrar palpite
        </button>

        {/* Bottom navigation bar (MD3) */}
        <nav className="flex items-stretch gap-1 border-t border-line bg-app/90 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur">
          <NavItem
            icon="grid"
            label="Preenchimento"
            active={tab === 'grid'}
            onClick={() => setTab('grid')}
          />
          <NavItem
            icon="history"
            label="Histórico"
            badge={game.events.length}
            active={tab === 'history'}
            onClick={() => setTab('history')}
          />
        </nav>
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

/** Botão de ícone circular do MD3 (área de toque de 48px). */
function IconButton({
  icon,
  label,
  onClick,
}: {
  icon: IconName
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="md-state flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sub"
    >
      <Icon name={icon} size={24} />
    </button>
  )
}

/** Item de uma bottom navigation bar do MD3, com indicador (pílula) no ativo. */
function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: IconName
  label: string
  active: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-1 py-1"
    >
      <span
        className={`relative flex h-8 w-16 items-center justify-center rounded-full transition-colors ${
          active ? 'bg-accentC text-onAccentC' : 'text-sub'
        }`}
      >
        <Icon name={icon} size={22} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-onAccent">
            {badge}
          </span>
        )}
      </span>
      <span
        className={`text-xs ${active ? 'font-semibold text-ink' : 'text-sub'}`}
      >
        {label}
      </span>
    </button>
  )
}
