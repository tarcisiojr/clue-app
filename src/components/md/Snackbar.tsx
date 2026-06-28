import { useEffect } from 'react'

interface Props {
  message: string
  /** Rótulo da ação opcional (ex.: "Desfazer"). */
  actionLabel?: string
  onAction?: () => void
  onDismiss: () => void
  /** Tempo até sumir sozinho, em ms. Padrão 4000. */
  duration?: number
}

/**
 * Snackbar no estilo Material Design 3: mensagem breve com ação opcional,
 * ancorada acima da navegação inferior, com auto-dispensa.
 */
export function Snackbar({
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 4000,
}: Props) {
  useEffect(() => {
    const id = setTimeout(onDismiss, duration)
    return () => clearTimeout(id)
  }, [onDismiss, duration, message])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(9rem_+_env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
      <div className="md-elev-3 pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl bg-surface3 px-4 py-3 text-sm text-ink animate-[snackbar-in_180ms_ease-out]">
        <span className="min-w-0 flex-1">{message}</span>
        {actionLabel && (
          <button
            onClick={() => {
              onAction?.()
              onDismiss()
            }}
            className="md-state shrink-0 rounded-lg px-2 py-1 text-sm font-bold text-accent"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
