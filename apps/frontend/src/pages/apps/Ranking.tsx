import { useEffect, useState } from 'react'

import Sidebar from '../../components/home/Sidebar'
import Topbar from '../../components/home/Topbar'
import LeaderboardWidget from '../../components/home/LeaderboardWidget'
import {
  fetchRankingUserDetail,
  fetchSeasonLeaderboardHistory,
  fetchWeeklyLeaderboard,
  fetchWeeklyRewardHistory,
} from '../../lib/api'
import type {
  RankingUserDetail,
  SeasonLeaderboardHistoryEntry,
  SeasonLeaderboardHistoryResponse,
  WeeklyLeaderboardResponse,
  WeeklyRewardHistoryEntry,
} from '../../components/interfaces/interfaces'

type LeaderboardFilter = 'all' | 'title' | 'frame' | 'theme' | 'badge'
type CosmeticFilter = Exclude<LeaderboardFilter, 'all'>

const FILTERS: Array<{ value: LeaderboardFilter; label: string; description: string }> = [
  { value: 'all', label: 'Todos', description: 'Exibe o ranking completo.' },
  { value: 'title', label: 'Com título', description: 'Mostra quem equipou título.' },
  { value: 'frame', label: 'Com moldura', description: 'Mostra quem tem moldura ativa.' },
  { value: 'theme', label: 'Com tema', description: 'Mostra quem alterou o tema.' },
  { value: 'badge', label: 'Com selo', description: 'Mostra quem exibiu selo.' },
]

export default function Ranking() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboardResponse | null>(null)
  const [rewardHistory, setRewardHistory] = useState<WeeklyRewardHistoryEntry[]>([])
  const [seasonHistory, setSeasonHistory] = useState<SeasonLeaderboardHistoryResponse | null>(null)
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<CosmeticFilter[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<RankingUserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [leaderboardData, rewardHistoryData, seasonHistoryData] = await Promise.all([
          fetchWeeklyLeaderboard(),
          fetchWeeklyRewardHistory(),
          fetchSeasonLeaderboardHistory(),
        ])
        setLeaderboard(leaderboardData)
        setRewardHistory(rewardHistoryData)
        setSeasonHistory(seasonHistoryData)
        setSelectedSeasonId(seasonHistoryData.currentSeason?.id ?? seasonHistoryData.seasons[0]?.id ?? null)
        setSelectedUserId((current) => current ?? leaderboardData.currentUser?.userId ?? leaderboardData.top[0]?.userId ?? null)
      } catch (error) {
        console.error('Erro ao carregar ranking:', error)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null)
      return
    }

    let cancelled = false

    async function loadUserDetail() {
      setDetailLoading(true)
      try {
        const detail = await fetchRankingUserDetail(selectedUserId)
        if (!cancelled) {
          setSelectedUser(detail)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar detalhes do usuário:', error)
          setSelectedUser(null)
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false)
        }
      }
    }

    void loadUserDetail()

    return () => {
      cancelled = true
    }
  }, [selectedUserId])

  const selectedSeason =
    seasonHistory?.seasons.find((season) => season.id === selectedSeasonId) ?? seasonHistory?.currentSeason ?? null

  function toggleFilter(filter: CosmeticFilter) {
    setSelectedFilters((current) => {
      if (current.includes(filter)) {
        return current.filter((item) => item !== filter)
      }

      return [...current.filter((item) => item !== filter), filter]
    })
  }

  function clearFilters() {
    setSelectedFilters([])
    setSearchQuery('')
  }

  const visibleEntries = (leaderboard?.top ?? []).filter((entry) => {
    const matchesFilters =
      selectedFilters.length === 0 ||
      selectedFilters.every((filter) => {
        switch (filter) {
          case 'title':
            return Boolean(entry.equippedTitle)
          case 'frame':
            return Boolean(entry.equippedFrame)
          case 'theme':
            return Boolean(entry.equippedTheme)
          case 'badge':
            return Boolean(entry.equippedBadge)
          default:
            return true
        }
      })

    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query.length === 0 ||
      [
        entry.name,
        entry.equippedTitle,
        entry.equippedBadge,
        entry.equippedFrame,
        entry.equippedTheme,
        String(entry.rank),
        String(entry.weeklyScore),
        String(entry.xp),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))

    return matchesFilters && matchesSearch
  })

  function formatSeasonPeriod(season: SeasonLeaderboardHistoryEntry) {
    const startsAt = new Date(season.startsAt)
    const endsAt = new Date(season.endsAt)

    return `${startsAt.toLocaleDateString('pt-BR')} - ${endsAt.toLocaleDateString('pt-BR')}`
  }

  function renderCosmeticType(type?: string) {
    switch (type) {
      case 'title':
      case 'titulo':
        return 'Título'
      case 'frame':
      case 'moldura':
        return 'Moldura'
      case 'theme':
      case 'tema':
        return 'Tema'
      case 'badge':
      case 'selo':
        return 'Selo'
      default:
        return 'Cosmético'
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] font-dm">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:ml-64">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto flex max-w-screen-xl flex-col gap-6">
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h1 className="font-syne text-2xl font-semibold text-gray-900">Ranking semanal</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Acompanhe quem mais avançou nos últimos 7 dias. O placar privilegia consistência,
                progresso em trilhas e conclusão real de conteúdo.
              </p>
            </section>

            {!loading && leaderboard && (
              <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-syne text-lg font-semibold text-gray-900">Filtros do ranking</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      Marque mais de um filtro ou busque por nome, cargo, selo ou cosmético.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f8f8f3] px-3 py-1 text-xs font-medium text-gray-500">
                    {visibleEntries.length} usuário(s) visível(is)
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                  <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                    <span className="text-sm text-gray-400">⌕</span>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Buscar por pessoa, título, selo ou cosmético"
                      className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Limpar filtros
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {FILTERS.filter((filter) => filter.value !== 'all').map((filter) => {
                    const active = selectedFilters.includes(filter.value as CosmeticFilter)
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => toggleFilter(filter.value as CosmeticFilter)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        title={filter.description}
                      >
                        {filter.label}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
                  <span className="rounded-full bg-[#f8f8f3] px-2.5 py-1">
                    {selectedFilters.length ? `${selectedFilters.length} filtro(s) ativo(s)` : 'Nenhum filtro ativo'}
                  </span>
                  {selectedFilters.map((filter) => (
                    <span key={filter} className="rounded-full bg-[#f8f8f3] px-2.5 py-1">
                      {FILTERS.find((item) => item.value === filter)?.label}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {loading ? (
              <p className="text-sm text-gray-400">Carregando ranking...</p>
            ) : !leaderboard ? (
              <p className="text-sm text-gray-400">Não foi possível carregar o ranking agora.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                <LeaderboardWidget
                  entries={visibleEntries}
                  currentUser={leaderboard.currentUser}
                  periodLabel={leaderboard.period.label}
                  projectedReward={leaderboard.currentUserReward}
                  selectedUserId={selectedUserId}
                  onSelectUser={setSelectedUserId}
                />

                <div className="flex flex-col gap-4">
                  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="font-syne text-lg font-semibold text-gray-900">Detalhes do usuário</h2>
                    {detailLoading ? (
                      <p className="mt-4 text-sm text-gray-400">Carregando detalhes...</p>
                    ) : selectedUser ? (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-2xl bg-[#f8f8f3] p-4">
                          <p className="text-sm font-semibold text-gray-900">{selectedUser.name}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {selectedUser.xp} XP · 🔥 {selectedUser.streakCurrent} streak · melhor {selectedUser.streakBest}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedUser.gamification.unlockedBadges.map((badge) => (
                              <span
                                key={badge.id}
                                className="rounded-full border border-violet-100 bg-white px-2.5 py-1 text-[11px] font-medium text-violet-700"
                              >
                                {badge.icon} {badge.label}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Badges desbloqueados</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedUser.gamification.unlockedBadges.length === 0 ? (
                              <p className="text-sm text-gray-400">Nenhum badge desbloqueado ainda.</p>
                            ) : (
                              selectedUser.gamification.unlockedBadges.map((badge) => (
                                <div
                                  key={badge.id}
                                  className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-[#f8f8f3] px-3 py-2"
                                >
                                  <span>{badge.icon}</span>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{badge.label}</p>
                                    <p className="text-xs text-gray-500">{badge.description}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Cosméticos desbloqueados</p>
                          <div className="mt-3 flex flex-col gap-2">
                            {selectedUser.gamification.unlockedCosmetics.length === 0 ? (
                              <p className="text-sm text-gray-400">Nenhum cosmético desbloqueado ainda.</p>
                            ) : (
                              selectedUser.gamification.unlockedCosmetics.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-2xl border border-gray-100 bg-white px-3 py-2"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                                    <span className="rounded-full bg-[#f8f8f3] px-2.5 py-1 text-[11px] font-medium text-gray-500">
                                      {renderCosmeticType(item.type)}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Equipados</p>
                          <div className="mt-3 grid gap-2">
                            {[
                              selectedUser.gamification.equippedCosmetics?.title,
                              selectedUser.gamification.equippedCosmetics?.frame,
                              selectedUser.gamification.equippedCosmetics?.theme,
                              selectedUser.gamification.equippedCosmetics?.badge,
                            ].some(Boolean) ? (
                              <>
                                {selectedUser.gamification.equippedCosmetics?.title && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">Título:</span>{' '}
                                    {selectedUser.gamification.equippedCosmetics.title.label}
                                  </p>
                                )}
                                {selectedUser.gamification.equippedCosmetics?.frame && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">Moldura:</span>{' '}
                                    {selectedUser.gamification.equippedCosmetics.frame.label}
                                  </p>
                                )}
                                {selectedUser.gamification.equippedCosmetics?.theme && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">Tema:</span>{' '}
                                    {selectedUser.gamification.equippedCosmetics.theme.label}
                                  </p>
                                )}
                                {selectedUser.gamification.equippedCosmetics?.badge && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">Selo:</span>{' '}
                                    {selectedUser.gamification.equippedCosmetics.badge.label}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-gray-400">Nenhum cosmético equipado.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-gray-400">
                        Clique em um usuário do ranking para ver badges, cosméticos e loadout.
                      </p>
                    )}
                  </section>

                  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="font-syne text-lg font-semibold text-gray-900">Temporada atual</h2>
                    {seasonHistory?.currentSeason ? (
                      <div className="mt-4 rounded-2xl bg-[#f8f8f3] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{seasonHistory.currentSeason.label}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {formatSeasonPeriod(seasonHistory.currentSeason)} ·{' '}
                              {seasonHistory.currentSeason.participants} participantes
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
                            {seasonHistory.currentSeason.status}
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-xs text-gray-500">Podium parcial</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              {seasonHistory.currentSeason.podium.length} colocados
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-xs text-gray-500">Recompensas</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              {seasonHistory.currentSeason.rewardCount}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-gray-400">Nenhuma temporada encontrada.</p>
                    )}
                  </section>

                  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="font-syne text-lg font-semibold text-gray-900">Faixas de recompensa</h2>
                    <div className="mt-4 flex flex-col gap-3">
                      {leaderboard.rewardTiers.map((tier) => (
                        <div key={tier.id} className="rounded-2xl bg-[#f8f8f3] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900">{tier.label}</p>
                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
                              {tier.placement}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">{tier.reward}</p>
                          <p className="mt-1 text-xs text-gray-500">{tier.cosmetic}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="font-syne text-lg font-semibold text-gray-900">Como subir no ranking</h2>
                    <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500">
                      <p>1. Estude em mais dias da semana, não só em sessões longas isoladas.</p>
                      <p>2. Movimente trilhas diferentes para ganhar score recorrente.</p>
                      <p>3. Feche trilhas iniciadas para receber o maior peso de progressão.</p>
                      <p>4. Proteja sua streak, porque ela funciona como bônus constante.</p>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="font-syne text-lg font-semibold text-gray-900">Histórico de recompensas</h2>
                    <div className="mt-4 flex flex-col gap-3">
                      {rewardHistory.length === 0 ? (
                        <p className="text-sm text-gray-400">Nenhuma recompensa semanal entregue ainda.</p>
                      ) : (
                        rewardHistory.map((entry) => (
                          <div key={entry.id} className="rounded-2xl bg-[#f8f8f3] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-gray-900">
                                {entry.season?.label ?? 'Temporada semanal'}
                              </p>
                              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
                                {entry.rank ? `${entry.rank}º lugar` : 'Participação'}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">{entry.reward}</p>
                            <p className="mt-1 text-xs text-gray-500">{entry.cosmetic}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="font-syne text-lg font-semibold text-gray-900">Histórico sazonal</h2>
                    <p className="mt-2 text-sm text-gray-400">
                      Veja temporadas encerradas, pódio e sua colocação em cada ciclo.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(seasonHistory?.seasons ?? []).map((season) => (
                        <button
                          key={season.id}
                          type="button"
                          onClick={() => setSelectedSeasonId(season.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            selectedSeason?.id === season.id
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {season.label}
                        </button>
                      ))}
                    </div>

                    {selectedSeason && (
                      <div className="mt-5 rounded-2xl bg-[#f8f8f3] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{selectedSeason.label}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {formatSeasonPeriod(selectedSeason)} · {selectedSeason.participants} participantes
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
                            {selectedSeason.status}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Seu resultado</p>
                            {selectedSeason.currentUser ? (
                              <div className="mt-2 space-y-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {selectedSeason.currentUser.rank}º lugar
                                </p>
                                <p className="text-xs text-gray-500">{selectedSeason.currentUser.score} pontos</p>
                                <p className="text-xs text-gray-500">{selectedSeason.currentUser.reward}</p>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-gray-400">Você não apareceu nesta temporada.</p>
                            )}
                          </div>

                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Sua recompensa</p>
                            {selectedSeason.currentUserReward ? (
                              <div className="mt-2 space-y-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {selectedSeason.currentUserReward.deliveryStatus}
                                </p>
                                <p className="text-xs text-gray-500">{selectedSeason.currentUserReward.reward}</p>
                                <p className="text-xs text-gray-500">{selectedSeason.currentUserReward.cosmetic}</p>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-gray-400">Sem recompensa registrada para você.</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Pódio</p>
                          <div className="mt-3 grid gap-3">
                            {selectedSeason.podium.length === 0 ? (
                              <p className="text-sm text-gray-400">Sem snapshots salvos para essa temporada.</p>
                            ) : (
                              selectedSeason.podium.map((entry) => (
                                <div key={entry.userId} className="rounded-2xl bg-white px-4 py-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {entry.rank}º {entry.name}
                                      </p>
                                      <p className="mt-1 text-xs text-gray-500">
                                        {entry.score} pontos · {entry.xp} XP · 🔥 {entry.streakCurrent}
                                      </p>
                                    </div>
                                    <span className="rounded-full bg-[#f8f8f3] px-2.5 py-1 text-[11px] font-medium text-gray-500">
                                      {entry.reward}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
