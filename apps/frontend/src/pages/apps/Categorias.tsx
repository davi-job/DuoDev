import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/home/Sidebar'
import Topbar from '../../components/home/Topbar'
import TrailCard from '../../components/home/TrailCard'
import { fetchLearningTrails, fetchMeuProgresso } from '../../lib/api'
import type { LearningTrailSummary, UserTrailAPI } from '../../components/interfaces/interfaces'

export default function Categorias() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trails, setTrails] = useState<LearningTrailSummary[]>([])
  const [progress, setProgress] = useState<UserTrailAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('Todas')

  useEffect(() => {
    async function load() {
      try {
        const [trailData, progressData] = await Promise.all([fetchLearningTrails(), fetchMeuProgresso()])
        setTrails(trailData)
        setProgress(progressData)
      } catch (error) {
        console.error('Erro ao carregar trilhas:', error)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const categories = useMemo(() => {
    const names = trails
      .map((trail) => trail.category?.name?.trim())
      .filter((name): name is string => Boolean(name))

    return ['Todas', ...Array.from(new Set(names))]
  }, [trails])

  const progressMap = useMemo(() => {
    return new Map(progress.map((item) => [item.trail.id, item]))
  }, [progress])

  const filteredTrails = useMemo(() => {
    const query = search.trim().toLowerCase()

    return trails.filter((trail) => {
      const categoryName = trail.category?.name ?? 'Sem categoria'
      const matchesCategory = activeCategory === 'Todas' || categoryName === activeCategory
      const matchesSearch =
        !query ||
        trail.name.toLowerCase().includes(query) ||
        trail.description.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query) ||
        trail.level.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [activeCategory, search, trails])

  return (
    <div className="min-h-screen bg-[#f5f5f0] font-dm">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col min-h-screen lg:ml-64">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto flex max-w-screen-xl flex-col gap-6">
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h1 className="font-syne text-3xl font-semibold text-gray-900">Trilhas</h1>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    Aqui fica o catálogo da plataforma. Escolha uma trilha, filtre por interesse e entre direto no
                    conteúdo que quiser estudar.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#f8f8f3] px-4 py-3">
                    <p className="text-xs text-gray-400">Trilhas</p>
                    <p className="mt-1 font-syne text-2xl font-bold text-green-500">{trails.length}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f8f8f3] px-4 py-3">
                    <p className="text-xs text-gray-400">Categorias</p>
                    <p className="mt-1 font-syne text-2xl font-bold text-gray-900">{categories.length - 1}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f8f8f3] px-4 py-3 col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-400">Em andamento</p>
                    <p className="mt-1 font-syne text-2xl font-bold text-gray-900">{progress.length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nome, categoria ou nível"
                  className="w-full rounded-2xl border border-gray-200 bg-[#f8f8f3] px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-green-400 focus:outline-none lg:max-w-md"
                />

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                        activeCategory === category
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {loading ? (
              <p className="text-sm text-gray-400">Carregando trilhas...</p>
            ) : filteredTrails.length === 0 ? (
              <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <h2 className="font-syne text-lg font-semibold text-gray-900">Nenhuma trilha encontrada</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Tente outro filtro ou volte para ver todas as trilhas publicadas.
                </p>
              </section>
            ) : (
              <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTrails.map((trail) => {
                  const currentProgress = progressMap.get(trail.id)?.progressoPct
                  const categoryName = trail.category?.name ?? 'Sem categoria'

                  return (
                    <div key={trail.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 px-1">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500 shadow-sm">
                          {categoryName}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500 shadow-sm">
                          {trail.status}
                        </span>
                      </div>
                      <TrailCard
                        id={trail.id}
                        name={trail.name}
                        level={trail.level}
                        duration={trail.duration ?? `Conclusão em ${trail.totalHours ?? 0}H`}
                        progress={currentProgress}
                        meta={`${trail.contentCounts.lessons} aulas · ${trail.contentCounts.questions} questões · ${trail.contentCounts.challenges} desafios`}
                        thumbColor={trail.thumbColor}
                      />
                    </div>
                  )
                })}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
