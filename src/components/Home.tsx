import { useState } from 'react'
import { EDITIONS } from '../domain/editions'
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
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-5 py-8">
      <header className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 shadow-lg">
          <svg viewBox="0 0 64 64" className="h-10 w-10">
            <circle cx="27" cy="27" r="16" fill="#384e75" stroke="#94a3b8" strokeWidth="4" />
            <line x1="40" y1="40" x2="54" y2="54" stroke="#f5c453" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Detetive</h1>
        <p className="mt-1 text-sm text-slate-400">
          Marcador inteligente de pistas — deduz por você.
        </p>
      </header>

      {hasSaved && (
        <button
          onClick={resumeGame}
          className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-900 shadow transition active:scale-[0.99]"
        >
          ▶ Continuar partida
        </button>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                    ? 'border-amber-500 bg-slate-800 text-slate-100'
                    : 'border-slate-700 bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="text-lg font-semibold">{edition.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {edition.cards.length} cartas
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                    ? 'border-amber-500 bg-slate-800 text-slate-100'
                    : 'border-slate-700 bg-slate-800/40 text-slate-300'
                }`}
              >
                {n}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-500">
          Inclui você. A dedução fica mais forte com 3 ou mais jogadores.
        </p>
      </section>

      <button
        onClick={() => newGame(editionId, playerCount)}
        className="mt-2 rounded-xl bg-emerald-500 px-4 py-4 text-lg font-bold text-slate-900 shadow-lg transition active:scale-[0.99]"
      >
        Nova partida
      </button>

      {hasSaved && (
        <p className="text-center text-xs text-amber-400/80">
          Iniciar uma nova partida substitui a atual.
        </p>
      )}
    </div>
  )
}
