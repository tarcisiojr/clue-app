import type { Card, Category, Edition } from './types'

/**
 * Monta a lista de cartas de uma edição a partir de nomes simples.
 * Os ids recebem o prefixo da edição para serem únicos e estáveis.
 */
function buildCards(
  editionId: string,
  groups: Record<Category, string[]>,
): Card[] {
  const prefixByCategory: Record<Category, string> = {
    suspect: 's',
    weapon: 'w',
    room: 'r',
  }
  const cards: Card[] = []
  for (const category of Object.keys(groups) as Category[]) {
    groups[category].forEach((name, index) => {
      cards.push({
        id: `${editionId}_${prefixByCategory[category]}${index + 1}`,
        category,
        name,
      })
    })
  }
  return cards
}

// Suspeitos e armas são compartilhados entre os modos Mansão e Praia
// (confirmado: Clue Mansão e Praia / Hasbro A5826 muda apenas os locais).
const SUSPEITOS = ['Green', 'Mostarda', 'Peacock', 'Plum', 'Scarlet', 'White']
const ARMAS = [
  'Chave Inglesa',
  'Castiçal',
  'Faca',
  'Revolver',
  'Cano de chumbo',
  'Corda',
]

// Locais do modo Mansão — transcritos exatamente do cartão de papel.
const LOCAIS_MANSAO = [
  'Banheiro',
  'Escritório',
  'Sala de Jantar',
  'Salão de Jogos',
  'Garagem',
  'Quarto',
  'Sala de Estar',
  'Cozinha',
  'Entrada',
]

// Locais do modo Praia — PLACEHOLDERS editáveis pelo jogador na configuração.
// A lista oficial não está publicada de forma confiável; ajuste os nomes no app.
const LOCAIS_PRAIA = [
  'Quiosque',
  'Píer',
  'Bar da Praia',
  'Vestiário',
  'Deck',
  'Cabana',
  'Restaurante',
  'Marina',
  'Orla',
]

export const EDITION_MANSAO: Edition = {
  id: 'mansao',
  name: 'Mansão',
  cards: buildCards('mansao', {
    suspect: SUSPEITOS,
    weapon: ARMAS,
    room: LOCAIS_MANSAO,
  }),
}

export const EDITION_PRAIA: Edition = {
  id: 'praia',
  name: 'Praia',
  cards: buildCards('praia', {
    suspect: SUSPEITOS,
    weapon: ARMAS,
    room: LOCAIS_PRAIA,
  }),
}

export const EDITIONS: Edition[] = [EDITION_MANSAO, EDITION_PRAIA]

export function getEdition(editionId: string): Edition {
  return EDITIONS.find((e) => e.id === editionId) ?? EDITION_MANSAO
}

/**
 * Retorna a edição com os nomes de carta sobrescritos pelo usuário aplicados.
 * Usado para que renomear locais (ex.: modo Praia) reflita em todo o app.
 */
export function resolveEdition(
  editionId: string,
  cardNames: Record<string, string>,
): Edition {
  const base = getEdition(editionId)
  return {
    ...base,
    cards: base.cards.map((card) => ({
      ...card,
      name: cardNames[card.id] ?? card.name,
    })),
  }
}

export const CATEGORY_LABELS: Record<Category, string> = {
  suspect: 'Suspeitos',
  weapon: 'Armas',
  room: 'Locais',
}

/** Rótulos no estilo do cartão de papel. */
export const CATEGORY_HEADERS: Record<Category, string> = {
  suspect: 'QUEM?',
  weapon: 'O QUÊ?',
  room: 'ONDE?',
}

export const CATEGORY_ORDER: Category[] = ['suspect', 'weapon', 'room']

/**
 * Distribui as cartas (exceto as 3 da solução) entre N jogadores e devolve
 * o tamanho de mão de cada um. As primeiras mãos recebem a carta extra quando
 * a divisão não é exata.
 */
export function dealHandSizes(totalCards: number, playerCount: number): number[] {
  const distributable = totalCards - 3 // 3 cartas vão para o envelope
  const base = Math.floor(distributable / playerCount)
  const extra = distributable % playerCount
  return Array.from({ length: playerCount }, (_, i) => base + (i < extra ? 1 : 0))
}
