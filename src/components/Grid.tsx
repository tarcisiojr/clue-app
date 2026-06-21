import {
  CATEGORY_HEADERS,
  CATEGORY_ORDER,
} from '../domain/editions'
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

function cellClasses(state: CellState): string {
  if (state === 'has') return 'bg-emerald-500/25 text-emerald-300'
  if (state === 'not') return 'text-slate-600'
  return 'text-slate-700'
}

export function Grid({
  edition,
  result,
  players,
  manualMarks,
  onCellTap,
}: Props) {
  const owners = [...players, { id: ENVELOPE, name: 'Env.', isMe: false, handSize: 0 }]

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="bg-slate-800">
            <th className="sticky left-0 z-10 bg-slate-800 px-2 py-2 text-left text-[11px] font-semibold text-slate-400">
              Carta
            </th>
            {owners.map((owner) => (
              <th
                key={owner.id}
                className={`px-1 py-2 text-[11px] font-semibold ${
                  owner.id === ENVELOPE
                    ? 'text-amber-400'
                    : owner.isMe
                      ? 'text-amber-300'
                      : 'text-slate-300'
                }`}
              >
                <div className="mx-auto max-w-[3.5rem] truncate" title={owner.name}>
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
                header={CATEGORY_HEADERS[category]}
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
          className="sticky left-0 bg-slate-900 px-2 py-1 text-left text-[10px] font-bold uppercase tracking-wider text-amber-500/80"
        >
          {header}
        </td>
      </tr>
      {cards.map((card) => {
        const isSolution = result.grid[card.id]?.[ENVELOPE] === 'has'
        return (
          <tr
            key={card.id}
            className={`border-t border-slate-800 ${
              isSolution ? 'bg-amber-500/10' : ''
            }`}
          >
            <td
              className={`sticky left-0 z-10 max-w-[7.5rem] truncate px-2 py-2 text-left text-sm ${
                isSolution
                  ? 'bg-slate-900 font-semibold text-amber-300'
                  : 'bg-slate-900 text-slate-200'
              }`}
              title={card.name}
            >
              {card.name}
            </td>
            {owners.map((owner) => {
              const state = result.grid[card.id]?.[owner.id] ?? 'unknown'
              const isManual = manualMarks[cellKey(card.id, owner.id)] !== undefined
              return (
                <td key={owner.id} className="border-l border-slate-800 p-0">
                  <button
                    onClick={() => onCellTap(card.id, owner.id)}
                    className={`relative flex h-10 w-full items-center justify-center text-base font-bold ${cellClasses(
                      state,
                    )}`}
                  >
                    {symbol(state)}
                    {isManual && (
                      <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-sky-400" />
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
