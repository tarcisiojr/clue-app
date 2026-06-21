import { useMemo, useState } from 'react'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../domain/editions'
import type {
  Category,
  Edition,
  Player,
  SuggestionResponse,
} from '../domain/types'

type RespKind = 'none' | 'pass' | 'showed'
interface RespState {
  kind: RespKind
  cardShown?: string
}

interface Props {
  edition: Edition
  players: Player[]
  onClose: () => void
  onSave: (
    suggesterId: string,
    cards: [string, string, string],
    responses: SuggestionResponse[],
  ) => void
}

export function SuggestionModal({ edition, players, onClose, onSave }: Props) {
  const me = players.find((p) => p.isMe) ?? players[0]
  const [suggesterId, setSuggesterId] = useState(me.id)
  const firstOf = (cat: Category) =>
    edition.cards.find((c) => c.category === cat)!.id
  const [picks, setPicks] = useState<Record<Category, string>>({
    suspect: firstOf('suspect'),
    weapon: firstOf('weapon'),
    room: firstOf('room'),
  })
  const [responses, setResponses] = useState<Record<string, RespState>>({})

  const chosenCards = useMemo<[string, string, string]>(
    () => [picks.suspect, picks.weapon, picks.room],
    [picks],
  )

  const setResp = (playerId: string, next: RespState) =>
    setResponses((r) => ({ ...r, [playerId]: next }))

  const handleSave = () => {
    const out: SuggestionResponse[] = []
    for (const p of players) {
      if (p.id === suggesterId) continue
      const r = responses[p.id]
      if (!r || r.kind === 'none') continue
      if (r.kind === 'pass') out.push({ playerId: p.id, result: 'pass' })
      else
        out.push({
          playerId: p.id,
          result: 'showed',
          ...(r.cardShown ? { cardShown: r.cardShown } : {}),
        })
    }
    onSave(suggesterId, chosenCards, out)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-app">
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <button onClick={onClose} className="text-sm text-sub">
            Cancelar
          </button>
          <h2 className="font-bold text-ink">Registrar palpite</h2>
          <button
            onClick={handleSave}
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-bold text-slate-900"
          >
            Salvar
          </button>
        </header>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 pt-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))]">
          {/* Quem fez o palpite */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
              Quem fez o palpite
            </label>
            <div className="flex flex-wrap gap-2">
              {players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSuggesterId(p.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    p.id === suggesterId
                      ? 'border-accent bg-accent/20 text-accent'
                      : 'border-line text-sub'
                  }`}
                >
                  {p.name}
                  {p.isMe ? ' (você)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* As 3 cartas do palpite */}
          <div className="flex flex-col gap-2">
            {CATEGORY_ORDER.map((category) => (
              <div key={category}>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                  {CATEGORY_LABELS[category]}
                </label>
                <select
                  value={picks[category]}
                  onChange={(e) =>
                    setPicks((p) => ({ ...p, [category]: e.target.value }))
                  }
                  className="w-full rounded-lg bg-surface px-3 py-2.5 text-ink outline-none focus:ring-1 focus:ring-accent"
                >
                  {edition.cards
                    .filter((c) => c.category === category)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>

          {/* Respostas dos jogadores */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-semibold uppercase text-muted">
              Respostas (sentido horário)
            </label>
            {players
              .filter((p) => p.id !== suggesterId)
              .map((p) => {
                const r = responses[p.id] ?? { kind: 'none' as RespKind }
                return (
                  <div
                    key={p.id}
                    className="rounded-lg bg-surface/60 p-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">
                        {p.name}
                      </span>
                      <div className="flex shrink-0 overflow-hidden rounded-md border border-line">
                        {(
                          [
                            ['none', '—'],
                            ['pass', 'Passou'],
                            ['showed', 'Mostrou'],
                          ] as [RespKind, string][]
                        ).map(([kind, label]) => (
                          <button
                            key={kind}
                            onClick={() => setResp(p.id, { kind })}
                            className={`px-3 py-1.5 text-xs font-semibold ${
                              r.kind === kind
                                ? kind === 'showed'
                                  ? 'bg-emerald-500 text-slate-900'
                                  : kind === 'pass'
                                    ? 'bg-rose-500 text-slate-900'
                                    : 'bg-surface2 text-ink'
                                : 'text-sub'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {r.kind === 'showed' && (
                      <div className="mt-2">
                        <label className="mb-1 block text-[11px] text-muted">
                          Qual carta? (só se você viu)
                        </label>
                        <select
                          value={r.cardShown ?? ''}
                          onChange={(e) =>
                            setResp(p.id, {
                              kind: 'showed',
                              cardShown: e.target.value || undefined,
                            })
                          }
                          className="w-full rounded-md bg-app px-2 py-2 text-sm text-ink outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="">Não vi qual</option>
                          {chosenCards.map((id) => {
                            const card = edition.cards.find((c) => c.id === id)!
                            return (
                              <option key={id} value={id}>
                                {card.name}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
