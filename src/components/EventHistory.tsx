import type { Edition, Player, SuggestionEvent } from '../domain/types'

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
      <p className="rounded-lg bg-slate-800/40 px-3 py-4 text-center text-sm text-slate-500">
        Nenhum palpite registrado ainda.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Histórico ({events.length})
        </span>
        <button
          onClick={onUndo}
          className="rounded-md bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200"
        >
          ↶ Desfazer último
        </button>
      </div>
      <ol className="flex flex-col gap-2">
        {events.map((event, index) => (
          <li
            key={event.id}
            className="rounded-lg bg-slate-800/50 p-2 text-sm"
          >
            <div className="text-slate-200">
              <span className="font-semibold text-amber-300">
                {nameOfPlayer(event.suggesterId)}
              </span>{' '}
              <span className="text-slate-400">#{index + 1}:</span>{' '}
              {event.cards.map((id) => nameOfCard(id)).join(' · ')}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {event.responses.length === 0 && (
                <span className="text-xs text-slate-500">ninguém respondeu</span>
              )}
              {event.responses.map((r) => (
                <span
                  key={r.playerId}
                  className={`rounded px-1.5 py-0.5 text-[11px] ${
                    r.result === 'showed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
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
