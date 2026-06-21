import { describe, expect, it } from 'vitest'
import { infer } from './inference'
import { EDITION_MANSAO } from '../domain/editions'
import type { Player, SuggestionEvent } from '../domain/types'

describe('desempenho — jogo completo 6 jogadores', () => {
  it('recalcula rapidamente um estado denso', () => {
    const players: Player[] = Array.from({ length: 6 }, (_, i) =>
      ({ id: `p${i}`, name: `p${i}`, handSize: 3, isMe: i === 0 }),
    )
    const cards = EDITION_MANSAO.cards
    const suspects = cards.filter((c) => c.category === 'suspect')
    const weapons = cards.filter((c) => c.category === 'weapon')
    const rooms = cards.filter((c) => c.category === 'room')
    const events: SuggestionEvent[] = []
    for (let i = 0; i < 12; i++) {
      events.push({
        id: `e${i}`,
        type: 'suggestion',
        suggesterId: `p${i % 6}`,
        cards: [
          suspects[i % suspects.length].id,
          weapons[i % weapons.length].id,
          rooms[i % rooms.length].id,
        ],
        responses: [{ playerId: `p${(i + 1) % 6}`, result: 'showed' }],
      })
    }
    const start = performance.now()
    const result = infer({
      edition: EDITION_MANSAO,
      players,
      myHand: [suspects[0].id, weapons[0].id, rooms[0].id],
      events,
      manualMarks: {},
    })
    const elapsed = performance.now() - start
    // Deve responder com folga (uso por turno); limite generoso p/ runners de CI lentos.
    expect(elapsed).toBeLessThan(4000)
    expect(result.grid).toBeTruthy()
    // Log informativo do tempo gasto.
    console.log(`infer 6 jogadores: ${elapsed.toFixed(1)}ms`)
  })
})
