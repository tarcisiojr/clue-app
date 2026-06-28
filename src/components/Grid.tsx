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

function symbol(state: CellState): string {
  if (state === 'has') return '✓'
  if (state === 'not') return '✕'
  return ''
}

// Coluna fixa (nome da carta): opaca, com borda à direita para um recorte
// limpo quando a tabela rola na horizontal.
const STICKY = 'sticky left-0 z-20 border-r border-line'

export function Grid({ edition, result, players, manualMarks, onCellTap }: Props) {
  const owners = [
    ...players,
    { id: ENVELOPE, name: 'Env.', isMe: false, handSize: 0 },
  ]

  return (
    <div className="md-elev-1 h-full overflow-auto rounded-2xl bg-surface">
      <table className="w-full border-collapse text-center">
        <thead>
          {/* Cabeçalho congelado no topo ao rolar verticalmente. */}
          <tr>
            <th
              className="sticky left-0 top-0 z-40 border-r border-line bg-surface2 px-2 py-2 text-left text-[11px] font-semibold text-sub"
            >
              <div className="w-[80px]">Carta</div>
            </th>
            {owners.map((owner) => (
              <th
                key={owner.id}
                className={`sticky top-0 z-30 min-w-[44px] bg-surface2 px-1 py-2 text-[11px] font-semibold ${
                  owner.id === ENVELOPE || owner.isMe ? 'text-accent' : 'text-sub'
                }`}
              >
                <div className="mx-auto max-w-[42px] truncate" title={owner.name}>
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
          className="bg-app px-2 py-1 text-left text-[10px] font-bold uppercase tracking-wider text-accent"
        >
          {/* Rótulo da categoria fixo à esquerda ao rolar na horizontal. */}
          <span className="sticky left-2 inline-block">{header}</span>
        </td>
      </tr>
      {cards.map((card) => {
        const row = result.grid[card.id] ?? {}
        const isSolution = row[ENVELOPE] === 'has'
        // Carta "eliminada" (comum ou fora de jogo): ninguém tem, nem o envelope.
        const isEliminated = owners.every((o) => row[o.id] === 'not')
        return (
          <tr key={card.id} className="border-t border-line">
            <td
              className={`${STICKY} px-2 py-1.5 text-left ${
                isSolution
                  ? 'bg-accentC font-semibold text-onAccentC'
                  : 'bg-app text-ink'
              }`}
            >
              <div
                className={`w-[80px] truncate text-[13px] ${
                  isEliminated && !isSolution
                    ? 'text-muted line-through decoration-muted/50'
                    : ''
                }`}
                title={card.name}
              >
                {card.name}
              </div>
            </td>
            {owners.map((owner) => {
              const state = row[owner.id] ?? 'unknown'
              const isManual = manualMarks[cellKey(card.id, owner.id)] !== undefined
              return (
                <td
                  key={owner.id}
                  className={`min-w-[44px] border-l border-line p-0 ${
                    owner.isMe ? 'bg-accent/[0.06]' : ''
                  }`}
                >
                  <button
                    onClick={() => onCellTap(card.id, owner.id)}
                    className="md-state relative flex h-9 w-full items-center justify-center"
                  >
                    {state === 'has' ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">
                        ✓
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-muted/50">
                        {symbol(state)}
                      </span>
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
