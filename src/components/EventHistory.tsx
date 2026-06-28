import type { Edition, Player, SuggestionEvent } from '../domain/types'
import { Icon } from './md/Icon'

interface Props {
  edition: Edition
  players: Player[]
  events: SuggestionEvent[]
  onUndo: () => void
}

export function EventHistory({ edition, players, events, onUndo }: Props) {
  const nameOfCard = (id: string) =>
    edition.cards.find((c) => c.id === id)?.name ?? '?'
  const nameOfPlayer = (id: string) =>
    players.find((p) => p.id === id)?.name ?? '?'

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface px-4 py-10 text-center">
        <Icon name="history" size={32} className="text-muted" />
        <p className="text-sm text-muted">Nenhum palpite registrado ainda.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {events.length} palpite(s)
        </span>
        <button
          onClick={onUndo}
          className="md-state flex items-center gap-1.5 rounded-full bg-surface2 px-3.5 py-2 text-xs font-semibold text-ink"
        >
          <Icon name="undo" size={16} />
          Desfazer último
        </button>
      </div>
      <ol className="flex flex-col gap-2">
        {events.map((event, index) => (
          <li
            key={event.id}
            className="rounded-2xl bg-surface p-3 text-sm"
          >
            <div className="text-ink">
              <span className="font-semibold text-accent">
                {nameOfPlayer(event.suggesterId)}
              </span>{' '}
              <span className="text-sub">#{index + 1}:</span>{' '}
              {event.cards.map((id) => nameOfCard(id)).join(' · ')}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {event.responses.length === 0 && (
                <span className="text-xs text-muted">ninguém respondeu</span>
              )}
              {event.responses.map((r) => (
                <span
                  key={r.playerId}
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    r.result === 'showed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-error/15 text-error'
                  }`}
                >
                  {nameOfPlayer(r.playerId)}{' '}
                  {r.result === 'pass'
                    ? 'passou'
                    : r.cardShown
                      ? `mostrou ${nameOfCard(r.cardShown)}`
                      : 'mostrou'}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
