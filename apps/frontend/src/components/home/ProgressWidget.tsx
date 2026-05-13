interface UserTrailAPI {
  trail: { id: string; nome: string }
  progressoPct: number
}

interface ProgressWidgetProps {
  trails: UserTrailAPI[]
}

export default function ProgressWidget({ trails }: ProgressWidgetProps) {
  return (
    <div className="bg-white rounded-3xl p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-5">
        🔥 Seu progresso
      </h3>
      {trails.length === 0 ? (
        <p className="text-base text-gray-400">Nenhuma trilha em andamento.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {trails.map((ut) => (
            <div key={ut.trail.id}>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{ut.trail.nome}</span>
                <span>{ut.progressoPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${ut.progressoPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
