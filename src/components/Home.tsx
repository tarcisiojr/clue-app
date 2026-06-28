import { useState } from 'react'
import { EDITIONS } from '../domain/editions'
import { MODE_MOTIF, MODE_TAGLINE } from '../domain/theme'
import { useGameStore } from '../state/gameStore'

const PLAYER_OPTIONS = [2, 3, 4, 5, 6]

export function Home() {
  const newGame = useGameStore((s) => s.newGame)
  const resumeGame = useGameStore((s) => s.startGame)
  const savedGame = useGameStore((s) => s.game)

  const [editionId, setEditionId] = useState(EDITIONS[0].id)
  const [playerCount, setPlayerCount] = useState(4)

  const hasSaved = savedGame !== null

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pb-4 pt-[calc(2rem_+_env(safe-area-inset-top))]">
      <header className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface shadow-lg">
          <svg viewBox="0 0 64 64" className="h-10 w-10">
            <circle cx="27" cy="27" r="16" fill="#384e75" stroke="#94a3b8" strokeWidth="4" />
            <line x1="40" y1="40" x2="54" y2="54" stroke="#f5c453" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Detetive
        </h1>
        <p className="mt-1 text-sm text-sub">
          Marcador inteligente de pistas — deduz por você.
        </p>
      </header>

      {hasSaved && (
        <button
          onClick={resumeGame}
          className="rounded-xl bg-accent px-4 py-3 font-semibold text-slate-900 shadow transition active:scale-[0.99]"
        >
          ▶ Continuar partida
        </button>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Modo de jogo
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {EDITIONS.map((edition) => {
            const selected = edition.id === editionId
            return (
              <button
                key={edition.id}
                onClick={() => setEditionId(edition.id)}
                className={`rounded-xl border-2 px-4 py-5 text-center transition ${
                  selected
                    ? 'border-accent bg-surface text-ink'
                    : 'border-line bg-surface/40 text-sub'
                }`}
              >
                <div className="text-3xl">{MODE_MOTIF[edition.id]}</div>
                <div className="font-display mt-1 text-lg font-semibold">
                  {edition.name}
                </div>
                <div className="mt-0.5 text-[11px] text-muted">
                  {MODE_TAGLINE[edition.id]}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Número de jogadores
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {PLAYER_OPTIONS.map((n) => {
            const selected = n === playerCount
            return (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                className={`rounded-lg border-2 py-3 text-lg font-semibold transition ${
                  selected
                    ? 'border-accent bg-surface text-ink'
                    : 'border-line bg-surface/40 text-sub'
                }`}
              >
                {n}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted">
          Inclui você. A dedução fica mais forte com 3 ou mais jogadores.
        </p>
      </section>
      </div>

      {/* Barra inferior fixa do shell */}
      <div className="shrink-0 border-t border-line bg-app/95 px-5 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <button
          onClick={() => newGame(editionId, playerCount)}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-lg font-bold text-slate-900 shadow-lg transition active:scale-[0.99]"
        >
          Nova partida
        </button>
        {hasSaved && (
          <p className="mt-1.5 text-center text-xs text-accent/80">
            Iniciar uma nova partida substitui a atual.
          </p>
        )}
      </div>
    </div>
  )
}
