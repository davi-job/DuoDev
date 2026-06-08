import type { WeeklyLeaderboardEntry } from '../interfaces/interfaces'

interface LeaderboardWidgetProps {
  entries: WeeklyLeaderboardEntry[]
  currentUser: WeeklyLeaderboardEntry | null
  periodLabel: string
}

function PodiumBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>
  if (rank === 2) return <span className="text-lg">🥈</span>
  if (rank === 3) return <span className="text-lg">🥉</span>
  return <span className="text-xs font-semibold text-gray-400">#{rank}</span>
}

export default function LeaderboardWidget({
  entries,
  currentUser,
  periodLabel,
}: LeaderboardWidgetProps) {
  return (
    <div className="rounded-3xl bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            🏆 Ranking semanal
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {periodLabel}. O placar considera consistência, movimento em trilhas e streak.
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">Ainda não há atividade suficiente para montar o ranking.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className={`rounded-2xl border px-4 py-3 ${
                entry.isCurrentUser ? 'border-green-200 bg-green-50/80' : 'border-gray-100 bg-[#f8f8f3]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                  <PodiumBadge rank={entry.rank} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {entry.name}
                        {entry.isCurrentUser ? ' • você' : ''}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {entry.studyDays} dia(s) de estudo • {entry.trailMoves} movimento(s) em trilha
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-syne text-xl font-bold text-[#244C4E]">{entry.weeklyScore}</p>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">score</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                      ✨ {entry.xp} XP
                    </span>
                    <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700">
                      🔥 {entry.streakCurrent} streak
                    </span>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                      🚀 {entry.trailStarts} novas
                    </span>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                      ✅ {entry.completedTrails} concluída(s)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentUser && !entries.some((entry) => entry.userId === currentUser.userId) && (
        <div className="mt-4 rounded-2xl border border-dashed border-green-200 bg-green-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green-700">
            Sua posição
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                #{currentUser.rank} • {currentUser.name}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser.studyDays} dia(s) de estudo • {currentUser.trailMoves} movimento(s)
              </p>
            </div>
            <p className="font-syne text-lg font-bold text-[#244C4E]">{currentUser.weeklyScore}</p>
          </div>
        </div>
      )}
    </div>
  )
}
