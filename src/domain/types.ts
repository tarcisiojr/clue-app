// Modelo de domínio do jogo Clue / Detetive.
// As três categorias de cartas que compõem a solução do crime.
export type Category = 'suspect' | 'weapon' | 'room'

/** Uma carta do jogo (suspeito, arma ou cômodo/local). */
export interface Card {
  id: string
  category: Category
  /** Nome padrão da carta (pode ser sobrescrito pelo jogador na configuração). */
  name: string
}

/** Um modo de jogo (Mansão ou Praia) com seu conjunto de cartas. */
export interface Edition {
  id: string
  name: string
  cards: Card[]
}

/** Um jogador da partida. A ordem do array representa o sentido horário da mesa. */
export interface Player {
  id: string
  name: string
  /** Quantidade de cartas na mão deste jogador. */
  handSize: number
  /** Verdadeiro para o próprio usuário do app. */
  isMe: boolean
}

/** Identificador do "envelope" da solução, tratado como um dono especial das cartas. */
export const ENVELOPE = 'envelope' as const

/**
 * Identificador da pilha de cartas "comuns" — as que sobram na distribuição e
 * ficam viradas para cima, visíveis a todos. Não pertencem a nenhum jogador
 * nem ao envelope, mas o motor as trata como um dono especial para manter a
 * regra de unicidade (toda carta tem exatamente um dono).
 */
export const COMMON = 'common' as const

/**
 * Dono de uma carta: o id de um jogador ou o envelope.
 * Cada carta pertence a exatamente um dono.
 */
export type OwnerId = string

/** Estado conhecido de uma célula (carta × dono). */
export type CellState = 'has' | 'not' | 'unknown'

/** Resposta de um jogador a um palpite. */
export interface SuggestionResponse {
  playerId: string
  /** 'pass' = não tinha nenhuma das 3; 'showed' = mostrou uma carta. */
  result: 'pass' | 'showed'
  /** Carta exibida — só preenchida quando foi mostrada a você. */
  cardShown?: string
}

/** Um palpite registrado durante a partida. */
export interface SuggestionEvent {
  id: string
  type: 'suggestion'
  /** Quem fez o palpite. */
  suggesterId: string
  /** As 3 cartas do palpite: [suspeito, arma, cômodo]. */
  cards: [string, string, string]
  /**
   * Respostas em sentido horário a partir do jogador à esquerda do sugeridor.
   * Jogadores não alcançados (depois de quem mostrou) não entram na lista.
   */
  responses: SuggestionResponse[]
}

export type GameEvent = SuggestionEvent

/** Marcação manual feita pelo usuário diretamente na grade (override do motor). */
export type ManualMark = 'has' | 'not'

/** Estado completo e persistível de uma partida. */
export interface GameState {
  editionId: string
  /** Sobrescritas de nome por id de carta (usado p/ acertar locais do modo Praia). */
  cardNames: Record<string, string>
  players: Player[]
  /** Cartas que estão na SUA mão (fato inicial da partida). */
  myHand: string[]
  /** Cartas viradas/comuns, visíveis a todos (fora das mãos e do envelope). */
  commonCards: string[]
  events: SuggestionEvent[]
  /** Marcações manuais: chave `${cardId}:${ownerId}` -> 'has' | 'not'. */
  manualMarks: Record<string, ManualMark>
  createdAt: number
  updatedAt: number
}

/** Chave canônica de uma célula da grade. */
export function cellKey(cardId: string, ownerId: OwnerId): string {
  return `${cardId}:${ownerId}`
}
