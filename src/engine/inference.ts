// Motor de inferência do Clue / Detetive.
//
// A grade (carta × dono) é DERIVADA dos eventos da partida por propagação lógica
// de restrições até o ponto-fixo (R1–R4), seguida de uma busca por contradição
// (R5) que captura deduções avançadas — aquelas que exigem análise de casos e que
// raramente são feitas no cartão de papel. Isso maximiza a precisão da marcação.

import {
  COMMON,
  ENVELOPE,
  type Card,
  type Category,
  type CellState,
  type Edition,
  type ManualMark,
  type Player,
  type SuggestionEvent,
} from '../domain/types'

export interface InferenceInput {
  edition: Edition
  players: Player[]
  /** Cartas que estão na sua mão (fato inicial). */
  myHand: string[]
  /** Cartas viradas/comuns, visíveis a todos (fora das mãos e do envelope). */
  commonCards?: string[]
  events: SuggestionEvent[]
  manualMarks: Record<string, ManualMark>
}

export interface CategorySolution {
  /** Carta deduzida como solução, ou null se ainda indefinida. */
  cardId: string | null
  /** Cartas ainda possíveis para o envelope nesta categoria. */
  candidates: string[]
}

export interface InferenceResult {
  /** grid[cardId][ownerId] = 'has' | 'not' | 'unknown'. */
  grid: Record<string, Record<string, CellState>>
  solution: Record<Category, CategorySolution>
  /** Verdadeiro se as informações registradas são logicamente inconsistentes. */
  contradiction: boolean
}

type Fact = 'has' | 'not'

/**
 * Limite de células (cartas × donos) para habilitar a busca aninhada (nest=1).
 * Um jogo padrão de 6 jogadores tem 21×8 = 168 células (inclui envelope e a
 * pilha comum), ainda barato. O limite protege apenas edições custom enormes.
 */
const MAX_CELLS_FOR_DEEP_SEARCH = 200

interface Disjunction {
  owner: string
  cards: string[]
}

/** Erro interno usado para abortar a propagação ao detectar inconsistência. */
class ContradictionError extends Error {}

/**
 * Resolvedor de restrições. Mantém o conjunto de fatos conhecidos e aplica as
 * regras de propagação. É clonável para permitir o raciocínio hipotético (R5).
 */
class Solver {
  /** card -> (owner -> fato). Ausência = desconhecido. */
  private facts = new Map<string, Map<string, Fact>>()
  private changed = false

  constructor(
    private readonly cards: Card[],
    private readonly owners: string[],
    private readonly players: Player[],
    private readonly disjunctions: Disjunction[],
    private readonly categories: Category[],
  ) {}

  clone(): Solver {
    const copy = new Solver(
      this.cards,
      this.owners,
      this.players,
      this.disjunctions,
      this.categories,
    )
    for (const [card, owners] of this.facts) {
      copy.facts.set(card, new Map(owners))
    }
    return copy
  }

  get(card: string, owner: string): Fact | undefined {
    return this.facts.get(card)?.get(owner)
  }

  /** Define um fato. Lança ContradictionError se conflitar com o já conhecido. */
  set(card: string, owner: string, value: Fact): void {
    let owners = this.facts.get(card)
    if (!owners) {
      owners = new Map()
      this.facts.set(card, owners)
    }
    const current = owners.get(owner)
    if (current !== undefined) {
      if (current !== value) throw new ContradictionError()
      return
    }
    owners.set(owner, value)
    this.changed = true
  }

  // R1 — Unicidade: cada carta tem exatamente um dono.
  private ruleUniqueness(): void {
    for (const card of this.cards) {
      let holder: string | null = null
      const unknown: string[] = []
      for (const owner of this.owners) {
        const f = this.get(card.id, owner)
        if (f === 'has') holder = owner
        else if (f === undefined) unknown.push(owner)
      }
      if (holder !== null) {
        for (const owner of this.owners) {
          if (owner !== holder) this.set(card.id, owner, 'not')
        }
      } else {
        if (unknown.length === 0) throw new ContradictionError()
        if (unknown.length === 1) this.set(card.id, unknown[0], 'has')
      }
    }
  }

  // R2 — Capacidade: cada jogador possui exatamente handSize cartas.
  private ruleCapacity(): void {
    for (const player of this.players) {
      let hasCount = 0
      const unknown: string[] = []
      for (const card of this.cards) {
        const f = this.get(card.id, player.id)
        if (f === 'has') hasCount++
        else if (f === undefined) unknown.push(card.id)
      }
      if (hasCount > player.handSize) throw new ContradictionError()
      const needed = player.handSize - hasCount
      if (needed > unknown.length) throw new ContradictionError()
      if (needed === 0 && unknown.length > 0) {
        for (const id of unknown) this.set(id, player.id, 'not')
      } else if (needed === unknown.length && needed > 0) {
        for (const id of unknown) this.set(id, player.id, 'has')
      }
    }
  }

  // R3 — Envelope/categoria: 1 carta por categoria no envelope.
  private ruleEnvelope(): void {
    // Uma carta é do envelope se nenhum jogador a possui E ela não é comum.
    for (const card of this.cards) {
      if (this.get(card.id, ENVELOPE) === undefined) {
        const allPlayersNot = this.players.every(
          (p) => this.get(card.id, p.id) === 'not',
        )
        const notCommon = this.get(card.id, COMMON) === 'not'
        if (allPlayersNot && notCommon) this.set(card.id, ENVELOPE, 'has')
      }
      if (this.get(card.id, ENVELOPE) === 'has') {
        for (const p of this.players) this.set(card.id, p.id, 'not')
        this.set(card.id, COMMON, 'not')
      }
    }
    // Exatamente uma carta por categoria no envelope.
    for (const category of this.categories) {
      const catCards = this.cards.filter((c) => c.category === category)
      const envHas = catCards.filter((c) => this.get(c.id, ENVELOPE) === 'has')
      if (envHas.length > 1) throw new ContradictionError()
      if (envHas.length === 1) {
        for (const c of catCards) {
          if (c.id !== envHas[0].id) this.set(c.id, ENVELOPE, 'not')
        }
      } else {
        const envUnknown = catCards.filter(
          (c) => this.get(c.id, ENVELOPE) === undefined,
        )
        if (envUnknown.length === 0) throw new ContradictionError()
        if (envUnknown.length === 1) this.set(envUnknown[0].id, ENVELOPE, 'has')
      }
    }
  }

  // R4 — Disjunção: quem mostrou possui ≥1 das cartas do palpite.
  private ruleDisjunction(): void {
    for (const d of this.disjunctions) {
      const satisfied = d.cards.some((c) => this.get(c, d.owner) === 'has')
      if (satisfied) continue
      const candidates = d.cards.filter((c) => this.get(c, d.owner) !== 'not')
      if (candidates.length === 0) throw new ContradictionError()
      if (candidates.length === 1) this.set(candidates[0], d.owner, 'has')
    }
  }

  /** Aplica R1–R4 repetidamente até estabilizar. */
  propagate(): void {
    do {
      this.changed = false
      this.ruleUniqueness()
      this.ruleCapacity()
      this.ruleEnvelope()
      this.ruleDisjunction()
    } while (this.changed)
  }

  /**
   * R5 — Raciocínio hipotético (busca por contradição).
   *
   * Para cada célula desconhecida testa assumir 'has' e 'not'; se um valor levar
   * a contradição, o outro é certo. O parâmetro `nest` controla a profundidade
   * de aninhamento das hipóteses:
   *   - nest 0: 1 hipótese + propagação (captura pouco além de R1–R4);
   *   - nest 1: hipótese aninhada (captura deduções por análise de casos que
   *     ninguém faz no papel, ex.: "mostrou em dois palpites com 1 carta na mão").
   *
   * Repete em passos até estabilizar (apenas no nível superior).
   */
  search(nest: number): void {
    let progress = true
    while (progress) progress = this.searchPass(nest)
  }

  /** Uma varredura por todas as células desconhecidas. Retorna se houve dedução. */
  private searchPass(nest: number): boolean {
    let changed = false
    for (const card of this.cards) {
      for (const owner of this.owners) {
        if (this.get(card.id, owner) !== undefined) continue

        if (this.leadsToContradiction(card.id, owner, 'has', nest)) {
          this.set(card.id, owner, 'not')
          this.propagate()
          changed = true
          continue
        }
        if (this.leadsToContradiction(card.id, owner, 'not', nest)) {
          this.set(card.id, owner, 'has')
          this.propagate()
          changed = true
        }
      }
    }
    return changed
  }

  private leadsToContradiction(
    card: string,
    owner: string,
    value: Fact,
    nest: number,
  ): boolean {
    const trial = this.clone()
    try {
      trial.set(card, owner, value)
      trial.propagate()
      // Hipótese aninhada (limitada): uma única varredura, sem laço, p/ custo controlado.
      if (nest > 0) trial.searchPass(nest - 1)
      return false
    } catch (err) {
      if (err instanceof ContradictionError) return true
      throw err
    }
  }

  snapshot(): Map<string, Map<string, Fact>> {
    return this.facts
  }
}

/**
 * Executa toda a inferência e devolve a grade completa e a solução parcial/total.
 * Nunca lança: em caso de inconsistência, retorna `contradiction: true` com a
 * melhor grade obtida até o conflito.
 */
export function infer(input: InferenceInput): InferenceResult {
  const { edition, players, myHand, events, manualMarks } = input
  const commonCards = input.commonCards ?? []
  const cards = edition.cards
  // Donos exibidos na grade (jogadores + envelope) e donos internos do solver,
  // que incluem a pilha comum para manter a regra de unicidade.
  const displayOwners = [...players.map((p) => p.id), ENVELOPE]
  const solverOwners = [...displayOwners, COMMON]
  const categories = uniqueCategories(cards)

  const disjunctions: Disjunction[] = []
  const solver = new Solver(cards, solverOwners, players, disjunctions, categories)

  let contradiction = false

  // Profundidade da busca por contradição: usa raciocínio aninhado (nest=1) para
  // jogos de tamanho usual; cai para nest=0 em edições muito grandes (custom) para
  // manter a resposta rápida.
  const cellCount = cards.length * solverOwners.length
  const nest = cellCount <= MAX_CELLS_FOR_DEEP_SEARCH ? 1 : 0

  try {
    applyInitialFacts(solver, {
      cards,
      players,
      myHand,
      commonCards,
      events,
      manualMarks,
      disjunctions,
    })
    solver.propagate()
    solver.search(nest)
  } catch (err) {
    if (err instanceof ContradictionError) contradiction = true
    else throw err
  }

  return {
    grid: buildGrid(solver, cards, displayOwners),
    solution: buildSolution(solver, cards, categories),
    contradiction,
  }
}

function uniqueCategories(cards: Card[]): Category[] {
  const seen = new Set<Category>()
  const result: Category[] = []
  for (const c of cards) {
    if (!seen.has(c.category)) {
      seen.add(c.category)
      result.push(c.category)
    }
  }
  return result
}

function applyInitialFacts(
  solver: Solver,
  ctx: {
    cards: Card[]
    players: Player[]
    myHand: string[]
    commonCards: string[]
    events: SuggestionEvent[]
    manualMarks: Record<string, ManualMark>
    disjunctions: Disjunction[]
  },
): void {
  const { cards, players, myHand, commonCards, events, manualMarks, disjunctions } = ctx
  const me = players.find((p) => p.isMe)
  const handSet = new Set(myHand)
  const commonSet = new Set(commonCards)

  // Cartas comuns (viradas): pertencem à pilha comum e a mais ninguém.
  for (const card of cards) {
    if (commonSet.has(card.id)) {
      solver.set(card.id, COMMON, 'has')
      for (const p of players) solver.set(card.id, p.id, 'not')
      solver.set(card.id, ENVELOPE, 'not')
    } else {
      // Nenhuma outra carta pertence à pilha comum (ela é totalmente conhecida).
      solver.set(card.id, COMMON, 'not')
    }
  }

  // Sua mão: você possui essas cartas e nenhuma outra (você conhece sua mão).
  if (me) {
    for (const id of myHand) solver.set(id, me.id, 'has')
    if (myHand.length === me.handSize) {
      for (const card of cards) {
        if (!handSet.has(card.id)) solver.set(card.id, me.id, 'not')
      }
    }
  }

  // Eventos de palpite.
  for (const event of events) {
    for (const response of event.responses) {
      if (response.result === 'pass') {
        for (const cardId of event.cards) solver.set(cardId, response.playerId, 'not')
      } else if (response.result === 'showed') {
        if (response.cardShown) {
          solver.set(response.cardShown, response.playerId, 'has')
        } else {
          disjunctions.push({ owner: response.playerId, cards: [...event.cards] })
        }
      }
    }
  }

  // Marcações manuais do usuário (override direto na grade).
  for (const [key, mark] of Object.entries(manualMarks)) {
    const sep = key.lastIndexOf(':')
    const cardId = key.slice(0, sep)
    const ownerId = key.slice(sep + 1)
    solver.set(cardId, ownerId, mark)
  }
}

function buildGrid(
  solver: Solver,
  cards: Card[],
  owners: string[],
): Record<string, Record<string, CellState>> {
  const grid: Record<string, Record<string, CellState>> = {}
  for (const card of cards) {
    const row: Record<string, CellState> = {}
    for (const owner of owners) {
      row[owner] = solver.get(card.id, owner) ?? 'unknown'
    }
    grid[card.id] = row
  }
  return grid
}

function buildSolution(
  solver: Solver,
  cards: Card[],
  categories: Category[],
): Record<Category, CategorySolution> {
  const solution = {} as Record<Category, CategorySolution>
  for (const category of categories) {
    const catCards = cards.filter((c) => c.category === category)
    let cardId: string | null = null
    const candidates: string[] = []
    for (const c of catCards) {
      const env = solver.get(c.id, ENVELOPE)
      if (env === 'has') cardId = c.id
      if (env !== 'not') candidates.push(c.id)
    }
    solution[category] = { cardId, candidates }
  }
  return solution
}
