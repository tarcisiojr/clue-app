import { CATEGORY_HEADERS, CATEGORY_ORDER } from '../domain/editions'
import { CATEGORY_ICON } from '../domain/theme'
import {
  ENVELOPE,
  cellKey,
  type CellState,
  type Edition,
  type ManualMark,
  type Player,
} from '../domain/types'
import type { InferenceResult } from '../engine/inference'

interface Props {
  edition: Edition
  result: InferenceResult
  players: Player[]
  manualMarks: Record<string, ManualMark>
  onCellTap: (cardId: string, ownerId: string) => void
}

// Larguras fixas para a tabela transbordar e rolar na horizontal quando há
// muitos jogadores (em vez de espremer as colunas).
const NAME_COL = 'w-[116px] min-w-[116px]'
const OWNER_COL = 'w-[52px] min-w-[52px]'

function symbol(state: CellState): string {
  if (state === 'has') return '✓'
  if (state === 'not') return '✕'
  return ''
}

function cellClasses(state: CellState): string {
  if (state === 'has') return 'text-emerald-300'
  if (state === 'not') return 'text-muted/60'
  return ''
}

export function Grid({ edition, result, players, manualMarks, onCellTap }: Props) {
  const owners = [
    ...players,
    { id: ENVELOPE, name: 'Env.', isMe: false, handSize: 0 },
  ]

  return (
    <div className="md-elev-1 overflow-x-auto rounded-2xl bg-surface">
      <table className="border-separate border-spacing-0 text-center">
        <thead>
          <tr>
            <th
              className={`sticky left-0 z-20 bg-surface2 px-3 py-2.5 text-left text-[11px] font-semibold text-sub ${NAME_COL}`}
            >
              Carta
            </th>
            {owners.map((owner) => (
              <th
                key={owner.id}
                className={`bg-surface2 px-1 py-2.5 text-[11px] font-semibold ${OWNER_COL} ${
                  owner.id === ENVELOPE || owner.isMe ? 'text-accent' : 'text-sub'
                }`}
              >
                <div className="mx-auto max-w-[3rem] truncate" title={owner.name}>
                  {owner.id === ENVELOPE ? '📩' : owner.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORY_ORDER.map((category) => {
            const cards = edition.cards.filter((c) => c.category === category)
            return (
              <CategoryRows
                key={category}
                header={`${CATEGORY_ICON[category]} ${CATEGORY_HEADERS[category]}`}
                cards={cards}
                owners={owners}
                result={result}
                manualMarks={manualMarks}
                onCellTap={onCellTap}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CategoryRows({
  header,
  cards,
  owners,
  result,
  manualMarks,
  onCellTap,
}: {
  header: string
  cards: Edition['cards']
  owners: Player[]
  result: InferenceResult
  manualMarks: Record<string, ManualMark>
  onCellTap: (cardId: string, ownerId: string) => void
}) {
  return (
    <>
      <tr>
        <td
          colSpan={owners.length + 1}
          className="sticky left-0 z-10 bg-app/60 px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-accent"
        >
          {header}
        </td>
      </tr>
      {cards.map((card) => {
        const row = result.grid[card.id] ?? {}
        const isSolution = row[ENVELOPE] === 'has'
        // Carta "eliminada" (comum ou já fora de jogo): ninguém tem, nem o envelope.
        const isEliminated = owners.every((o) => row[o.id] === 'not')
        return (
          <tr key={card.id} className={isSolution ? 'bg-accent/10' : undefined}>
            <td
              className={`sticky left-0 z-10 truncate border-t border-line px-3 py-2.5 text-left text-sm ${NAME_COL} ${
                isSolution
                  ? 'bg-app font-semibold text-accent'
                  : isEliminated
                    ? 'bg-app text-muted line-through decoration-muted/50'
                    : 'bg-app text-ink'
              }`}
              title={card.name}
            >
              {card.name}
            </td>
            {owners.map((owner) => {
              const state = row[owner.id] ?? 'unknown'
              const isManual = manualMarks[cellKey(card.id, owner.id)] !== undefined
              return (
                <td
                  key={owner.id}
                  className={`border-l border-t border-line p-0 ${OWNER_COL}`}
                >
                  <button
                    onClick={() => onCellTap(card.id, owner.id)}
                    className={`md-state relative flex h-11 w-full items-center justify-center text-base font-bold ${cellClasses(
                      state,
                    )}`}
                  >
                    {state === 'has' ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                        {symbol(state)}
                      </span>
                    ) : (
                      symbol(state)
                    )}
                    {isManual && (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                </td>
              )
            })}
          </tr>
        )
      })}
    </>
  )
}
