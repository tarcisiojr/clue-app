// Feedback tátil (vibração) no estilo de apps nativos. Silencioso e seguro
// onde a API não existe (desktop / iOS Safari ignoram). Usado em toques-chave.

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // Ignora ambientes que bloqueiam a API.
    }
  }
}

/** Toque leve — seleção, alternância de célula, troca de aba. */
export const tapLight = () => vibrate(10)

/** Toque médio — ação confirmada (registrar palpite). */
export const tapMedium = () => vibrate(18)

/** Padrão de sucesso — crime resolvido. */
export const tapSuccess = () => vibrate([12, 40, 24])
