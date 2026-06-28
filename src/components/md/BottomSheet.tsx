import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'

interface Props {
  title: ReactNode
  /**
   * Ação opcional no canto direito do cabeçalho (ex.: botão Salvar). Recebe a
   * função `close` para disparar o fechamento animado após executar a ação.
   */
  headerAction?: (close: () => void) => ReactNode
  onClose: () => void
  children: ReactNode
}

/**
 * Bottom sheet no estilo Material Design 3 com animação de entrada/saída:
 * o backdrop faz fade e o painel desliza de baixo. O fechamento toca a animação
 * de saída antes de desmontar (via [onClose]) e suporta arrastar para baixo.
 */
export function BottomSheet({ title, headerAction, onClose, children }: Props) {
  const [closing, setClosing] = useState(false)
  const [dragY, setDragY] = useState(0)
  const startY = useRef<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Inicia a saída e desmonta ao terminar a animação.
  const requestClose = useCallback(() => setClosing(true), [])

  useEffect(() => {
    if (!closing) return
    const id = setTimeout(onClose, 220)
    return () => clearTimeout(id)
  }, [closing, onClose])

  // Fecha com a tecla Esc (uso em desktop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [requestClose])

  // Arrastar para baixo para dispensar.
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) setDragY(delta)
  }
  const onTouchEnd = () => {
    if (dragY > 90) requestClose()
    setDragY(0)
    startY.current = null
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 ${
        closing ? 'overlay-out' : 'overlay-in'
      }`}
      onClick={requestClose}
    >
      <div
        ref={panelRef}
        className={`flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-app ${
          closing ? 'sheet-out' : 'sheet-in'
        }`}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Alça (também área de arraste) */}
        <div
          className="flex cursor-grab justify-center pb-1 pt-2 active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <span className="h-1 w-9 rounded-full bg-outline/50" />
        </div>

        <header className="flex items-center gap-2 px-2 pb-2">
          <button
            onClick={requestClose}
            aria-label="Fechar"
            className="md-state flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sub"
          >
            <Icon name="close" size={22} />
          </button>
          <h2 className="font-display flex-1 truncate text-lg text-ink">{title}</h2>
          {headerAction?.(requestClose)}
        </header>

        <div className="overflow-y-auto px-4 pb-[calc(1.25rem_+_env(safe-area-inset-bottom))] pt-1">
          {children}
        </div>
      </div>
    </div>
  )
}
