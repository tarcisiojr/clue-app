import { describe, expect, it } from 'vitest'
import { infer, type InferenceInput } from './inference'
import { ENVELOPE, type Card, type Category, type Edition, type Player } from '../domain/types'

// --- Utilidades de teste -----------------------------------------------------

/** Edição compacta para cenários: 3 suspeitos, 3 armas, 3 locais (9 cartas). */
function smallEdition(): Edition {
  const cards: Card[] = []
  const add = (prefix: string, category: Category) => {
    for (let i = 1; i <= 3; i++) cards.push({ id: `${prefix}${i}`, category, name: `${prefix}${i}` })
  }
  add('S', 'suspect')
  add('W', 'weapon')
  add('R', 'room')
  return { id: 'small', name: 'Small', cards }
}

function player(id: string, handSize: number, isMe = false): Player {
  return { id, name: id, handSize, isMe }
}

function baseInput(partial: Partial<InferenceInput>): InferenceInput {
  return {
    edition: smallEdition(),
    players: [],
    myHand: [],
    events: [],
    manualMarks: {},
    ...partial,
  }
}

// --- R1/sua mão --------------------------------------------------------------

describe('fatos da própria mão', () => {
  it('marca suas cartas como suas e exclui os demais donos', () => {
    const result = infer(
      baseInput({
        players: [player('me', 3, true), player('A', 3)],
        myHand: ['S1', 'W1', 'R1'],
      }),
    )
    expect(result.grid.S1.me).toBe('has')
    expect(result.grid.S1.A).toBe('not')
    expect(result.grid.S1[ENVELOPE]).toBe('not')
    // Conhecendo sua mão completa, as demais cartas não são suas.
    expect(result.grid.S2.me).toBe('not')
    expect(result.contradiction).toBe(false)
  })
})

// --- R6 passar ---------------------------------------------------------------

describe('jogador que passa', () => {
  it('marca "não tem" para as 3 cartas do palpite', () => {
    const result = infer(
      baseInput({
        players: [player('me', 2, true), player('A', 2), player('B', 2)],
        events: [
          {
            id: 'e1',
            type: 'suggestion',
            suggesterId: 'me',
            cards: ['S1', 'W1', 'R1'],
            responses: [{ playerId: 'A', result: 'pass' }],
          },
        ],
      }),
    )
    expect(result.grid.S1.A).toBe('not')
    expect(result.grid.W1.A).toBe('not')
    expect(result.grid.R1.A).toBe('not')
  })
})

// --- carta mostrada a você ---------------------------------------------------

describe('carta mostrada diretamente a você', () => {
  it('marca "tem" para o jogador que mostrou', () => {
    const result = infer(
      baseInput({
        players: [player('me', 3, true), player('A', 3)],
        events: [
          {
            id: 'e1',
            type: 'suggestion',
            suggesterId: 'me',
            cards: ['S1', 'W1', 'R1'],
            responses: [{ playerId: 'A', result: 'showed', cardShown: 'S1' }],
          },
        ],
      }),
    )
    expect(result.grid.S1.A).toBe('has')
    expect(result.grid.S1.me).toBe('not')
    expect(result.grid.S1[ENVELOPE]).toBe('not')
  })
})

// --- R4 disjunção ------------------------------------------------------------

describe('resolução de disjunção (R4)', () => {
  it('deduz a carta mostrada quando as outras duas estão descartadas', () => {
    const result = infer(
      baseInput({
        players: [player('me', 2, true), player('A', 2), player('B', 2)],
        events: [
          // A passou em palpites que descartam S1 e W1 para A.
          {
            id: 'e1',
            type: 'suggestion',
            suggesterId: 'B',
            cards: ['S1', 'W2', 'R2'],
            responses: [{ playerId: 'A', result: 'pass' }],
          },
          {
            id: 'e2',
            type: 'suggestion',
            suggesterId: 'B',
            cards: ['S3', 'W1', 'R3'],
            responses: [{ playerId: 'A', result: 'pass' }],
          },
          // A mostrou (carta desconhecida) num palpite {S1,W1,R1} -> só pode ser R1.
          {
            id: 'e3',
            type: 'suggestion',
            suggesterId: 'me',
            cards: ['S1', 'W1', 'R1'],
            responses: [{ playerId: 'A', result: 'showed' }],
          },
        ],
      }),
    )
    expect(result.grid.R1.A).toBe('has')
  })
})

// --- R2 capacidade -----------------------------------------------------------

describe('capacidade da mão (R2)', () => {
  it('marca o restante como "não tem" quando a mão está completa', () => {
    const result = infer(
      baseInput({
        players: [player('me', 1, true), player('A', 1)],
        events: [
          {
            id: 'e1',
            type: 'suggestion',
            suggesterId: 'me',
            cards: ['S1', 'W1', 'R1'],
            responses: [{ playerId: 'A', result: 'showed', cardShown: 'S1' }],
          },
        ],
      }),
    )
    // A só tem 1 carta e já a conhecemos -> todas as demais são "não tem".
    expect(result.grid.S1.A).toBe('has')
    expect(result.grid.W1.A).toBe('not')
    expect(result.grid.R2.A).toBe('not')
  })
})

// --- R3 solução por categoria ------------------------------------------------

describe('detecção da solução por categoria (R3)', () => {
  it('deduz o suspeito do envelope quando os demais estão localizados', () => {
    const result = infer(
      baseInput({
        players: [player('me', 3, true), player('A', 3)],
        myHand: ['S1', 'W1', 'R1'],
        events: [
          {
            id: 'e1',
            type: 'suggestion',
            suggesterId: 'me',
            cards: ['S2', 'W2', 'R2'],
            responses: [{ playerId: 'A', result: 'showed', cardShown: 'S2' }],
          },
        ],
      }),
    )
    // S1 (você) e S2 (A) localizados -> S3 está no envelope.
    expect(result.solution.suspect.cardId).toBe('S3')
    expect(result.grid.S3[ENVELOPE]).toBe('has')
  })
})

// --- R5 dedução por contradição (2 níveis) -----------------------------------

describe('dedução por contradição (R5, raciocínio aninhado)', () => {
  it('deduz a carta comum quando o jogador mostrou em dois palpites com 1 carta na mão', () => {
    const result = infer(
      baseInput({
        players: [player('A', 1), player('me', 5, true)],
        events: [
          {
            id: 'e1',
            type: 'suggestion',
            suggesterId: 'me',
            cards: ['S1', 'W1', 'R1'],
            responses: [{ playerId: 'A', result: 'showed' }],
          },
          {
            id: 'e2',
            type: 'suggestion',
            suggesterId: 'me',
            cards: ['S1', 'W2', 'R2'],
            responses: [{ playerId: 'A', result: 'showed' }],
          },
        ],
      }),
    )
    // A tem só 1 carta e mostrou nos dois palpites; a única em comum é S1.
    expect(result.grid.S1.A).toBe('has')
    expect(result.contradiction).toBe(false)
  })
})

// --- Detecção de inconsistência ----------------------------------------------

describe('detecção de contradição', () => {
  it('sinaliza quando os dados são logicamente impossíveis', () => {
    const result = infer(
      baseInput({
        players: [player('me', 1, true), player('A', 5)],
        myHand: ['S1'],
        events: [
          {
            id: 'e1',
            type: 'suggestion',
            suggesterId: 'A',
            cards: ['S1', 'W1', 'R1'],
            // A afirma ter S1, mas S1 está na SUA mão.
            responses: [{ playerId: 'me', result: 'pass' }, { playerId: 'A', result: 'showed', cardShown: 'S1' }],
          },
        ],
      }),
    )
    expect(result.contradiction).toBe(true)
  })
})
