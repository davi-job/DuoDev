import type { GamificationMission } from '../interfaces/interfaces'

interface MissionWidgetProps {
  daily: GamificationMission[]
  weekly: GamificationMission[]
}

function MissionList({
  title,
  missions,
}: {
  title: string
  missions: GamificationMission[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{title}</h4>
        <span className="text-xs text-gray-400">
          {missions.filter((mission) => mission.status === 'completed').length}/{missions.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {missions.map((mission) => {
          const progressPct = Math.min(100, Math.round((mission.progress / mission.target) * 100))

          return (
            <div
              key={mission.id}
              className={`rounded-2xl border p-4 transition ${
                mission.status === 'completed'
                  ? 'border-green-100 bg-green-50/70'
                  : 'border-gray-100 bg-[#f8f8f3]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg ${
                    mission.status === 'completed' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  {mission.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{mission.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{mission.description}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        mission.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-white text-gray-500'
                      }`}
                    >
                      {mission.progress}/{mission.target}
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        mission.status === 'completed'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-[#9EEA6C] to-[#244C4E]'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MissionWidget({ daily, weekly }: MissionWidgetProps) {
  const hasMissions = daily.length > 0 || weekly.length > 0

  return (
    <div className="rounded-3xl bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            🎯 Missões ativas
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Metas curtas para manter ritmo diário e progresso semanal.
          </p>
        </div>
      </div>

      {!hasMissions ? (
        <p className="text-sm text-gray-400">Carregando missões personalizadas...</p>
      ) : (
        <div className="flex flex-col gap-5">
          <MissionList title="Hoje" missions={daily} />
          <MissionList title="Semana" missions={weekly} />
        </div>
      )}
    </div>
  )
}
