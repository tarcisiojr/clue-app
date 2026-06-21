import {
  CATEGORY_HEADERS,
  CATEGORY_ORDER,
} from '../domain/editions'
import type { Edition } from '../domain/types'
import type { InferenceResult } from '../engine/inference'

interface Props {
  edition: Edition
  result: InferenceResult
}

export function SolutionPanel({ edition, result }: Props) {
  const nameOf = (id: string) =>
    edition.cards.find((c) => c.id === id)?.name ?? '?'

  const solvedCount = CATEGORY_ORDER.filter(
    (c) => result.solution[c].cardId !== null,
  ).length
  const allSolved = solvedCount === CATEGORY_ORDER.length

  return (
    <section
      className={`rounded-xl border p-3 ${
        allSolved
          ? 'border-emerald-500 bg-emerald-500/10'
          : 'border-slate-700 bg-slate-800/50'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">
          {allSolved ? '🎉 Crime resolvido!' : 'Solução'}
        </h2>
        <span className="text-xs text-slate-400">{solvedCount}/3</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {CATEGORY_ORDER.map((category) => {
          const sol = result.solution[category]
          const solved = sol.cardId !== null
          return (
            <div
              key={category}
              className={`rounded-lg p-2 text-center ${
                solved ? 'bg-emerald-500/20' : 'bg-slate-900/60'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {CATEGORY_HEADERS[category]}
              </div>
              {solved ? (
                <div className="mt-1 text-sm font-bold text-emerald-300">
                  {nameOf(sol.cardId!)}
                </div>
              ) : (
                <div className="mt-1 text-xs text-slate-400">
                  {sol.candidates.length} possíveis
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
