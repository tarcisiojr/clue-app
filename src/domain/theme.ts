import type { Category } from './types'

/** Emoji/motivo de cada modo, usado nos cabeçalhos e cartões de seleção. */
export const MODE_MOTIF: Record<string, string> = {
  mansao: '🔍',
  praia: '🏖️',
}

/** Cor da barra de status (meta theme-color) por tema. */
export const MODE_THEME_COLOR: Record<string, string> = {
  mansao: '#17120d',
  praia: '#061c25',
}

/** Frase de clima exibida no cabeçalho de cada modo. */
export const MODE_TAGLINE: Record<string, string> = {
  mansao: 'Um crime na mansão',
  praia: 'Mistério à beira-mar',
}

/** Ícone de cada categoria de carta. */
export const CATEGORY_ICON: Record<Category, string> = {
  suspect: '🕵️',
  weapon: '🔪',
  room: '🚪',
}

/** Retorna o atributo data-theme válido para um id de edição. */
export function themeFor(editionId: string | undefined): string {
  return editionId && editionId in MODE_MOTIF ? editionId : 'mansao'
}
