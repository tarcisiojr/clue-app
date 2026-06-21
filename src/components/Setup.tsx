import { useState } from 'react'
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getEdition,
  resolveEdition,
} from '../domain/editions'
import { useGameStore } from '../state/gameStore'

export function Setup() {
  const game = useGameStore((s) => s.game)!
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const setHandSize = useGameStore((s) => s.setHandSize)
  const setMe = useGameStore((s) => s.setMe)
  const toggleMyHandCard = useGameStore((s) => s.toggleMyHandCard)
  const renameCard = useGameStore((s) => s.renameCard)
  const startGame = useGameStore((s) => s.startGame)
  const abandonGame = useGameStore((s) => s.abandonGame)

  const [showNames, setShowNames] = useState(false)

  const edition = resolveEdition(game.editionId, game.cardNames)
  const baseEdition = getEdition(game.editionId)
  const meIndex = game.players.findIndex((p) => p.isMe)
  const me = game.players[meIndex]
  const handSelected = game.myHand.length
  const handTarget = me?.handSize ?? 0
  const handMismatch = handSelected !== handTarget

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-4 pb-6 pt-[calc(1.5rem_+_env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <button onClick={abandonGame} className="text-sm text-slate-400">
          ← Sair
        </button>
        <h1 className="text-lg font-bold text-slate-100">
          Configurar — {edition.name}
        </h1>
        <span className="w-10" />
      </header>

      {/* Jogadores */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Jogadores e mãos
        </h2>
        <div className="flex flex-col gap-2">
          {game.players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-2 rounded-lg bg-slate-800/60 p-2"
            >
              <button
                onClick={() => setMe(index)}
                title="Marcar como você"
                className={`h-9 shrink-0 rounded-md px-2 text-xs font-bold transition ${
                  player.isMe
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {player.isMe ? 'VOCÊ' : 'eu?'}
              </button>
              <input
                value={player.name}
                onChange={(e) => setPlayerName(index, e.target.value)}
                className="min-w-0 flex-1 rounded-md bg-slate-900 px-2 py-2 text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setHandSize(index, player.handSize - 1)}
                  className="h-9 w-9 rounded-md bg-slate-700 text-lg text-slate-200"
                >
                  −
                </button>
                <span className="w-6 text-center tabular-nums text-slate-200">
                  {player.handSize}
                </span>
                <button
                  onClick={() => setHandSize(index, player.handSize + 1)}
                  className="h-9 w-9 rounded-md bg-slate-700 text-lg text-slate-200"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          O número é a quantidade de cartas na mão de cada jogador.
        </p>
      </section>

      {/* Sua mão */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Suas cartas
          </h2>
          <span
            className={`text-xs font-semibold ${
              handMismatch ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {handSelected} / {handTarget}
          </span>
        </div>
        {CATEGORY_ORDER.map((category) => (
          <div key={category}>
            <div className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
              {CATEGORY_LABELS[category]}
            </div>
            <div className="flex flex-wrap gap-2">
              {edition.cards
                .filter((c) => c.category === category)
                .map((card) => {
                  const selected = game.myHand.includes(card.id)
                  return (
                    <button
                      key={card.id}
                      onClick={() => toggleMyHandCard(card.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        selected
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                          : 'border-slate-700 bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      {card.name}
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </section>

      {/* Editor de nomes (locais do Praia, etc.) */}
      <section className="flex flex-col gap-2">
        <button
          onClick={() => setShowNames((v) => !v)}
          className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-300"
        >
          <span>Editar nomes das cartas</span>
          <span>{showNames ? '▲' : '▼'}</span>
        </button>
        {showNames && (
          <div className="flex flex-col gap-3 rounded-lg bg-slate-800/40 p-3">
            <p className="text-xs text-slate-500">
              Ajuste os nomes conforme suas cartas (ex.: locais do modo Praia).
            </p>
            {CATEGORY_ORDER.map((category) => (
              <div key={category} className="flex flex-col gap-1.5">
                <div className="text-[11px] font-semibold uppercase text-slate-500">
                  {CATEGORY_LABELS[category]}
                </div>
                {baseEdition.cards
                  .filter((c) => c.category === category)
                  .map((card) => (
                    <input
                      key={card.id}
                      defaultValue={game.cardNames[card.id] ?? card.name}
                      onBlur={(e) => renameCard(card.id, e.target.value)}
                      placeholder={card.name}
                      className="rounded-md bg-slate-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={startGame}
        className="sticky bottom-[calc(1rem_+_env(safe-area-inset-bottom))] mt-2 rounded-xl bg-emerald-500 px-4 py-4 text-lg font-bold text-slate-900 shadow-lg transition active:scale-[0.99]"
      >
        Começar partida
      </button>
    </div>
  )
}
