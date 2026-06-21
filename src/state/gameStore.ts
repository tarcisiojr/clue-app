import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  cellKey,
  type GameState,
  type ManualMark,
  type Player,
  type SuggestionResponse,
} from '../domain/types'
import { dealHandSizes, getEdition, resolveEdition } from '../domain/editions'
import { infer, type InferenceResult } from '../engine/inference'

type Phase = 'home' | 'setup' | 'game'

interface StoreState {
  phase: Phase
  game: GameState | null
  /** Resultado da inferência, recalculado a cada mudança (não persistido). */
  result: InferenceResult | null

  // Navegação / ciclo de vida da partida
  newGame: (editionId: string, playerCount: number) => void
  startGame: () => void
  abandonGame: () => void
  goToSetup: () => void
  goHome: () => void

  // Configuração (tela de Setup)
  setPlayerName: (index: number, name: string) => void
  setHandSize: (index: number, handSize: number) => void
  setMe: (index: number) => void
  toggleMyHandCard: (cardId: string) => void
  renameCard: (cardId: string, name: string) => void

  // Durante a partida
  addSuggestion: (
    suggesterId: string,
    cards: [string, string, string],
    responses: SuggestionResponse[],
  ) => void
  undoLastEvent: () => void
  cycleManualMark: (cardId: string, ownerId: string) => void
}

/** Gera um id único para entidades da partida. */
function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`
}

/** Recalcula a inferência a partir do estado atual da partida. */
function recompute(game: GameState | null): InferenceResult | null {
  if (!game) return null
  const edition = resolveEdition(game.editionId, game.cardNames)
  return infer({
    edition,
    players: game.players,
    myHand: game.myHand,
    events: game.events,
    manualMarks: game.manualMarks,
  })
}

/** Aplica uma alteração no estado da partida e recalcula a inferência. */
function withGame(
  state: StoreState,
  update: (game: GameState) => GameState,
): Partial<StoreState> {
  if (!state.game) return {}
  const now = Date.now()
  const game = { ...update(state.game), updatedAt: now }
  return { game, result: recompute(game) }
}

export const useGameStore = create<StoreState>()(
  persist(
    (set) => ({
      phase: 'home',
      game: null,
      result: null,

      newGame: (editionId, playerCount) => {
        const edition = getEdition(editionId)
        const handSizes = dealHandSizes(edition.cards.length, playerCount)
        const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
          id: makeId(),
          name: i === 0 ? 'Você' : `Jogador ${i + 1}`,
          handSize: handSizes[i],
          isMe: i === 0,
        }))
        const now = Date.now()
        const game: GameState = {
          editionId,
          cardNames: {},
          players,
          myHand: [],
          events: [],
          manualMarks: {},
          createdAt: now,
          updatedAt: now,
        }
        set({ phase: 'setup', game, result: recompute(game) })
      },

      startGame: () => set({ phase: 'game' }),
      goToSetup: () => set({ phase: 'setup' }),
      goHome: () => set({ phase: 'home' }),
      abandonGame: () => set({ phase: 'home', game: null, result: null }),

      setPlayerName: (index, name) =>
        set((s) =>
          withGame(s, (g) => {
            const players = g.players.map((p, i) => (i === index ? { ...p, name } : p))
            return { ...g, players }
          }),
        ),

      setHandSize: (index, handSize) =>
        set((s) =>
          withGame(s, (g) => {
            const players = g.players.map((p, i) =>
              i === index ? { ...p, handSize: Math.max(0, handSize) } : p,
            )
            return { ...g, players }
          }),
        ),

      setMe: (index) =>
        set((s) =>
          withGame(s, (g) => {
            const players = g.players.map((p, i) => ({ ...p, isMe: i === index }))
            // Ao trocar o "você", limpa a mão (pertencia a outro jogador).
            return { ...g, players, myHand: [] }
          }),
        ),

      toggleMyHandCard: (cardId) =>
        set((s) =>
          withGame(s, (g) => {
            const has = g.myHand.includes(cardId)
            const myHand = has
              ? g.myHand.filter((id) => id !== cardId)
              : [...g.myHand, cardId]
            return { ...g, myHand }
          }),
        ),

      renameCard: (cardId, name) =>
        set((s) =>
          withGame(s, (g) => {
            const cardNames = { ...g.cardNames }
            const trimmed = name.trim()
            if (trimmed) cardNames[cardId] = trimmed
            else delete cardNames[cardId]
            return { ...g, cardNames }
          }),
        ),

      addSuggestion: (suggesterId, cards, responses) =>
        set((s) =>
          withGame(s, (g) => ({
            ...g,
            events: [
              ...g.events,
              { id: makeId(), type: 'suggestion', suggesterId, cards, responses },
            ],
          })),
        ),

      undoLastEvent: () =>
        set((s) =>
          withGame(s, (g) => ({ ...g, events: g.events.slice(0, -1) })),
        ),

      cycleManualMark: (cardId, ownerId) =>
        set((s) =>
          withGame(s, (g) => {
            const key = cellKey(cardId, ownerId)
            const current = g.manualMarks[key]
            const next: ManualMark | undefined =
              current === undefined ? 'has' : current === 'has' ? 'not' : undefined
            const manualMarks = { ...g.manualMarks }
            if (next) manualMarks[key] = next
            else delete manualMarks[key]
            return { ...g, manualMarks }
          }),
        ),
    }),
    {
      name: 'clue-app:v1',
      // Persiste apenas dados essenciais; o resultado é recalculado ao reidratar.
      partialize: (s) => ({ phase: s.phase, game: s.game }),
      onRehydrateStorage: () => (state) => {
        if (state?.game) state.result = recompute(state.game)
      },
    },
  ),
)
