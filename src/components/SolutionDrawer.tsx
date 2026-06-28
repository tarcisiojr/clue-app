import { useState } from 'react'
import { CATEGORY_HEADERS, CATEGORY_ORDER } from '../domain/editions'
import { CATEGORY_ICON } from '../domain/theme'
import type { Edition } from '../domain/types'
import type { InferenceResult } from '../engine/inference'
import { Icon } from './md/Icon'

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
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-app pb-[calc(1.5rem_+_env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pb-1 pt-2">
              <span className="h-1 w-9 rounded-full bg-outline/50" />
            </div>
            <div className="flex items-center justify-between px-4 pb-3">
              <h2 className="font-display text-lg text-ink">
                {allSolved ? '🎉 Crime resolvido!' : 'Solução'}
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="md-state flex h-10 w-10 items-center justify-center rounded-full text-sub"
              >
                <Icon name="close" size={22} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 px-4">
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

            <p className="px-4 pt-4 text-center text-[11px] leading-relaxed text-muted">
              ✓ tem · ✕ não tem · vazio = indefinido. Toque numa célula da grade
              para marcar manualmente (• destacado).
            </p>
          </div>
        </div>
      )}
    </>
  )
}
