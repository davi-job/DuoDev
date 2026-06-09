import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Sidebar from '../../components/home/Sidebar'
import Topbar from '../../components/home/Topbar'
import { fetchMeuPerfil } from '../../lib/api'
import type { UserProfile } from '../../components/interfaces/interfaces'

const pillars = [
  {
    title: 'Trilhas práticas',
    description: 'Conteúdo organizado por tema, nível e objetivo de aprendizado.',
    badge: 'Catálogo vivo',
  },
  {
    title: 'Progresso visível',
    description: 'XP, streak, missões e recompensas mostram evolução real.',
    badge: 'Evolução contínua',
  },
  {
    title: 'Engajamento com propósito',
    description: 'Gamificação para manter ritmo sem perder foco pedagógico.',
    badge: 'Motivação saudável',
  },
]

const steps = [
  'Escolha uma categoria e entre em uma trilha.',
  'Conclua aulas, desafios e quizzes para acumular XP.',
  'Mantenha sua streak, resgate missões e suba no ranking.',
]

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMeuPerfil()
        setProfile(data)
      } catch (error) {
        console.error('Erro ao carregar home:', error)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const xp = profile?.gamification?.xp ?? profile?.xp ?? 0
  const level = profile?.gamification?.level ?? 1
  const title = profile?.gamification?.title ?? 'Aprendiz'
  const streak = profile?.streakCurrent ?? 0
  const equipped = profile?.gamification?.equippedCosmetics
  const themeLabel = equipped?.theme?.label ?? null
  const frameLabel = equipped?.frame?.label ?? null

  return (
    <div
      className="min-h-screen font-dm"
      style={{
        background:
          themeLabel === 'Tema: Floresta Duo'
            ? 'linear-gradient(180deg, #f4fbea 0%, #f5f5f0 36%, #fafcf7 100%)'
            : '#f5f5f0',
      }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col min-h-screen lg:ml-64">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-5 lg:p-8 xl:p-10">
          <div className="mx-auto max-w-6xl space-y-8">
            <section className="overflow-hidden rounded-[2rem] border border-gray-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf2_100%)] p-8 shadow-sm">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:items-center">
                <div>
                  <p className="mb-4 inline-flex rounded-full bg-green-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
                    Plataforma de aprendizado gamificada
                  </p>
                  <h1 className="font-syne text-4xl font-semibold leading-tight text-gray-900 lg:text-5xl">
                    Aprenda por trilhas, evolua com constância e veja seu progresso acontecer.
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-500">
                    O DuoDev combina trilhas, quizzes, desafios, missões e ranking para transformar o estudo em
                    uma jornada clara. A home mostra o que a plataforma faz. As trilhas ficam em categorias.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/trilhas"
                      className="rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-400"
                    >
                      Explorar trilhas
                    </Link>
                    <Link
                      to="/ranking"
                      className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      Ver ranking
                    </Link>
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Seu resumo</p>
                  {(themeLabel || frameLabel) && (
                    <div className="mt-3 rounded-2xl bg-[#f8fbf4] p-3 text-xs text-gray-600">
                      {frameLabel && (
                        <p>
                          <span className="font-medium text-gray-800">Moldura:</span> {frameLabel}
                        </p>
                      )}
                      {themeLabel && (
                        <p className="mt-1">
                          <span className="font-medium text-gray-800">Tema:</span> {themeLabel}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <StatCard label="XP" value={`${xp}`} />
                    <StatCard label="Nível" value={`${level}`} />
                    <StatCard label="Streak" value={`${streak} dias`} />
                    <StatCard label="Título" value={title} />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-gray-500">
                    {loading
                      ? 'Carregando seu resumo...'
                      : 'Seu perfil já acompanha progresso, streak, recompensas e missões dentro da plataforma.'}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {pillars.map((pillar) => (
                <article key={pillar.title} className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
                  <p className="inline-flex rounded-full bg-[#f8f8f3] px-3 py-1 text-[11px] font-medium text-gray-500">
                    {pillar.badge}
                  </p>
                  <h2 className="mt-4 font-syne text-2xl font-semibold text-gray-900">{pillar.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">{pillar.description}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <article className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="font-syne text-2xl font-semibold text-gray-900">Como funciona</h2>
                <div className="mt-5 grid gap-4">
                  {steps.map((step, index) => (
                    <div key={step} className="flex items-start gap-4 rounded-2xl bg-[#f8f8f3] p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600">{step}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="font-syne text-2xl font-semibold text-gray-900">O que você encontra</h2>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-gray-600">
                  <li>• Catálogo de trilhas por categoria e nível.</li>
                  <li>• Aulas, desafios e quizzes integrados ao progresso.</li>
                  <li>• Missões diárias e semanais com recompensa.</li>
                  <li>• Ranking semanal e histórico de temporadas.</li>
                  <li>• Streak, proteção de sequência e notificações internas.</li>
                </ul>
                <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm text-green-700">
                  Use a área de categorias para escolher sua próxima trilha. A home existe para orientar.
                </div>
              </article>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f8f8f3] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  )
}
