import {
  CATEGORY_HEADERS,
  CATEGORY_ORDER,
} from '../domain/editions'
import { CATEGORY_ICON } from '../domain/theme'
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
      className={`md-elev-1 rounded-3xl p-4 ${
        allSolved ? 'bg-accentC' : 'bg-surface'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2
          className={`font-display text-xl font-semibold ${
            allSolved ? 'text-onAccentC' : 'text-ink'
          }`}
        >
          {allSolved ? '🎉 Crime resolvido!' : 'Solução'}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            allSolved
              ? 'bg-onAccentC/20 text-onAccentC'
              : 'bg-surface2 text-sub'
          }`}
        >
          {solvedCount}/3
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {CATEGORY_ORDER.map((category) => {
          const sol = result.solution[category]
          const solved = sol.cardId !== null
          return (
            <div
              key={category}
              className={`rounded-2xl p-2.5 text-center ${
                solved ? 'bg-accent/25' : 'bg-app/50'
              }`}
            >
              <div className="text-xl leading-none">{CATEGORY_ICON[category]}</div>
              <div className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                {CATEGORY_HEADERS[category]}
              </div>
              {solved ? (
                <div className="font-display mt-1 text-sm font-bold text-accent">
                  {nameOf(sol.cardId!)}
                </div>
              ) : (
                <div className="mt-1 text-xs text-sub">
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
