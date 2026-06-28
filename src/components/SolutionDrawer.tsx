import { useState } from 'react'
import { CATEGORY_HEADERS, CATEGORY_ORDER } from '../domain/editions'
import { CATEGORY_ICON } from '../domain/theme'
import type { Edition } from '../domain/types'
import type { InferenceResult } from '../engine/inference'
import { Icon } from './md/Icon'
import { BottomSheet } from './md/BottomSheet'

interface Props {
  edition: Edition
  result: InferenceResult
}

/**
 * Solução em formato compacto: uma barra sempre visível (ocupa pouco espaço,
 * dando área ao grid) que abre um drawer (bottom sheet) com o detalhe completo.
 */
export function SolutionDrawer({ edition, result }: Props) {
  const [open, setOpen] = useState(false)

  const nameOf = (id: string) =>
    edition.cards.find((c) => c.id === id)?.name ?? '?'
  const solvedCount = CATEGORY_ORDER.filter(
    (c) => result.solution[c].cardId !== null,
  ).length
  const allSolved = solvedCount === CATEGORY_ORDER.length

  return (
    <>
      {/* Barra compacta */}
      <button
        onClick={() => setOpen(true)}
        className={`md-state flex w-full items-center gap-2 rounded-full px-3 py-2 ${
          allSolved ? 'bg-accentC text-onAccentC' : 'bg-surface text-ink'
        }`}
      >
        <span className="text-sm font-bold">
          {allSolved ? '🎉 Resolvido' : 'Solução'}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            allSolved ? 'bg-onAccentC/20' : 'bg-surface2 text-sub'
          }`}
        >
          {solvedCount}/3
        </span>
        {/* Mini resumo por categoria */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          {CATEGORY_ORDER.map((category) => {
            const sol = result.solution[category]
            return (
              <span
                key={category}
                className="flex min-w-0 items-center gap-0.5 text-xs text-sub"
              >
                <span className="leading-none">{CATEGORY_ICON[category]}</span>
                <span className="truncate">
                  {sol.cardId ? (
                    <span className="font-semibold text-accent">
                      {nameOf(sol.cardId)}
                    </span>
                  ) : (
                    sol.candidates.length
                  )}
                </span>
              </span>
            )
          })}
        </div>
        <Icon name="tune" size={18} className="shrink-0 text-sub" />
      </button>

      {/* Drawer (bottom sheet) com o detalhe */}
      {open && (
        <BottomSheet
          title={allSolved ? '🎉 Crime resolvido!' : 'Solução'}
          onClose={() => setOpen(false)}
        >
          <div className="grid grid-cols-3 gap-2">
            {CATEGORY_ORDER.map((category) => {
              const sol = result.solution[category]
              const solved = sol.cardId !== null
              return (
                <div
                  key={category}
                  className={`flex flex-col items-center rounded-2xl px-2 py-3 text-center ${
                    solved ? 'bg-accent/25' : 'bg-surface'
                  }`}
                >
                  <div className="text-2xl leading-none">
                    {CATEGORY_ICON[category]}
                  </div>
                  <div className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    {CATEGORY_HEADERS[category]}
                  </div>
                  {solved ? (
                    <div className="font-display mt-1 text-sm text-accent">
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

          <p className="pt-4 text-center text-[11px] leading-relaxed text-muted">
            ✓ tem · ✕ não tem · vazio = indefinido. Toque numa célula da grade
            para marcar manualmente (• destacado).
          </p>
        </BottomSheet>
      )}
    </>
  )
}
