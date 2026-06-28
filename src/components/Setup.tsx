import { useState } from 'react'
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getEdition,
  resolveEdition,
} from '../domain/editions'
import { CATEGORY_ICON } from '../domain/theme'
import { useGameStore } from '../state/gameStore'
import { Chip } from './md/Chip'

export function Setup() {
  const game = useGameStore((s) => s.game)!
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const setHandSize = useGameStore((s) => s.setHandSize)
  const setMe = useGameStore((s) => s.setMe)
  const toggleMyHandCard = useGameStore((s) => s.toggleMyHandCard)
  const toggleCommonCard = useGameStore((s) => s.toggleCommonCard)
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

  // Cartas viradas (comuns): o que sobra após o envelope (3) e as mãos definidas.
  // Derivar das mãos mantém tudo consistente mesmo se o usuário ajustar os tamanhos.
  const commonCards = game.commonCards ?? []
  const totalHands = game.players.reduce((sum, p) => sum + p.handSize, 0)
  const commonTarget = Math.max(0, baseEdition.cards.length - 3 - totalHands)
  const commonMismatch = commonCards.length !== commonTarget

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      {/* Cabeçalho (app bar) */}
      <header className="flex shrink-0 items-center justify-between border-b border-line bg-app/95 px-4 pb-3 pt-[calc(0.75rem_+_env(safe-area-inset-top))] backdrop-blur">
        <button onClick={abandonGame} className="text-sm text-sub">
          ← Sair
        </button>
        <h1 className="font-display text-lg font-bold text-ink">
          {edition.name}
        </h1>
        <span className="w-10" />
      </header>

      {/* Área rolável com a configuração */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4 pt-5">
      {/* Jogadores */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Jogadores e mãos
        </h2>
        <div className="flex flex-col gap-2">
          {game.players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-2 rounded-2xl bg-surface p-2"
            >
              <button
                onClick={() => setMe(index)}
                title="Marcar como você"
                className={`md-state h-9 shrink-0 rounded-lg px-2.5 text-xs font-bold transition ${
                  player.isMe
                    ? 'bg-accent text-onAccent'
                    : 'bg-surface2 text-sub'
                }`}
              >
                {player.isMe ? 'VOCÊ' : 'eu?'}
              </button>
              <input
                value={player.name}
                onChange={(e) => setPlayerName(index, e.target.value)}
                onFocus={(e) => e.target.select()}
                className="min-w-0 flex-1 rounded-lg bg-app px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setHandSize(index, player.handSize - 1)}
                  aria-label="Menos uma carta"
                  className="md-state flex h-9 w-9 items-center justify-center rounded-full bg-surface2 text-lg text-ink"
                >
                  −
                </button>
                <span className="w-6 text-center tabular-nums text-ink">
                  {player.handSize}
                </span>
                <button
                  onClick={() => setHandSize(index, player.handSize + 1)}
                  aria-label="Mais uma carta"
                  className="md-state flex h-9 w-9 items-center justify-center rounded-full bg-surface2 text-lg text-ink"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted">
          O número é a quantidade de cartas na mão de cada jogador.
        </p>
      </section>

      {/* Sua mão */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Suas cartas
          </h2>
          <span
            className={`text-xs font-semibold ${
              handMismatch ? 'text-accent' : 'text-emerald-400'
            }`}
          >
            {handSelected} / {handTarget}
          </span>
        </div>
        {CATEGORY_ORDER.map((category) => (
          <div key={category}>
            <div className="mb-1 text-[11px] font-semibold uppercase text-muted">
              {CATEGORY_LABELS[category]}
            </div>
            <div className="flex flex-wrap gap-2">
              {edition.cards
                .filter((c) => c.category === category)
                .map((card) => (
                  <Chip
                    key={card.id}
                    label={card.name}
                    tone="success"
                    selected={game.myHand.includes(card.id)}
                    onClick={() => toggleMyHandCard(card.id)}
                  />
                ))}
            </div>
          </div>
        ))}
      </section>

      {/* Cartas viradas (comuns) — só quando sobram cartas na distribuição */}
      {commonTarget > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Cartas viradas
            </h2>
            <span
              className={`text-xs font-semibold ${
                commonMismatch ? 'text-accent' : 'text-emerald-400'
              }`}
            >
              {commonCards.length} / {commonTarget}
            </span>
          </div>
          <p className="-mt-1 text-xs text-muted">
            Sobram {commonTarget} carta(s) na mesa, viradas para todos verem.
            Marque-as para o app eliminá-las da dedução.
          </p>
          {CATEGORY_ORDER.map((category) => (
            <div key={category}>
              <div className="mb-1 text-[11px] font-semibold uppercase text-muted">
                {CATEGORY_ICON[category]} {CATEGORY_LABELS[category]}
              </div>
              <div className="flex flex-wrap gap-2">
                {edition.cards
                  .filter((c) => c.category === category)
                  .map((card) => (
                    <Chip
                      key={card.id}
                      label={card.name}
                      selected={commonCards.includes(card.id)}
                      onClick={() => toggleCommonCard(card.id)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Editor de nomes (locais do Praia, etc.) */}
      <section className="flex flex-col gap-2">
        <button
          onClick={() => setShowNames((v) => !v)}
          className="md-state flex items-center justify-between rounded-2xl bg-surface px-4 py-3 text-sm text-sub"
        >
          <span>Editar nomes das cartas</span>
          <span>{showNames ? '▲' : '▼'}</span>
        </button>
        {showNames && (
          <div className="flex flex-col gap-3 rounded-2xl bg-surface p-3">
            <p className="text-xs text-muted">
              Ajuste os nomes conforme suas cartas (ex.: locais do modo Praia).
            </p>
            {CATEGORY_ORDER.map((category) => (
              <div key={category} className="flex flex-col gap-1.5">
                <div className="text-[11px] font-semibold uppercase text-muted">
                  {CATEGORY_LABELS[category]}
                </div>
                {baseEdition.cards
                  .filter((c) => c.category === category)
                  .map((card) => (
                    <input
                      key={card.id}
                      defaultValue={game.cardNames[card.id] ?? card.name}
                      onFocus={(e) => e.target.select()}
                      onBlur={(e) => renameCard(card.id, e.target.value)}
                      placeholder={card.name}
                      className="rounded-lg bg-app px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"
                    />
                  ))}
              </div>
            ))}
          </div>
        )}
      </section>
      </div>

      {/* Barra inferior fixa do shell */}
      <div className="shrink-0 border-t border-line bg-app/95 px-4 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <button
          onClick={startGame}
          className="md-state md-elev-1 w-full rounded-full bg-accent px-4 py-3.5 text-lg font-bold text-onAccent"
        >
          Começar partida
        </button>
      </div>
    </div>
  )
}
