import { Icon } from './Icon'

interface Props {
  label: string
  selected: boolean
  onClick: () => void
  /** Cor de seleção: 'primary' (padrão) ou 'success' (verde, p/ "minhas cartas"). */
  tone?: 'primary' | 'success'
}

/**
 * Filter chip no estilo Material Design 3: contorno quando inativo, preenchido
 * com ícone de check quando selecionado.
 */
export function Chip({ label, selected, onClick, tone = 'primary' }: Props) {
  const selectedClasses =
    tone === 'success'
      ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-200'
      : 'border-accent bg-accentC text-onAccentC'
  return (
    <button
      onClick={onClick}
      className={`md-state inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition ${
        selected ? selectedClasses : 'border-outline/60 text-sub'
      }`}
    >
      {selected && <Icon name="check" size={16} />}
      {label}
    </button>
  )
}
