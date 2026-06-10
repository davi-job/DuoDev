import { useNavigate } from 'react-router'
import type { UserTrailAPI } from '../interfaces/interfaces'

interface FocusWidgetProps {
  trails: UserTrailAPI[]
}

function getTrailAccuracy(trail: UserTrailAPI) {
  const acertos = trail.acertos ?? 0
  const erros = trail.erros ?? 0
  const total = acertos + erros

  if (total === 0) {
    return Math.max(20, Math.round(trail.progressoPct * 0.8))
  }

  return Math.round((acertos / total) * 100)
}

export default function FocusWidget({ trails }: FocusWidgetProps) {
  const navigate = useNavigate()

  const weakest = [...trails]
    .filter((trail) => trail.progressoPct > 0)
    .sort((a, b) => {
      const accuracyDiff = getTrailAccuracy(a) - getTrailAccuracy(b)
      if (accuracyDiff !== 0) return accuracyDiff
      return a.progressoPct - b.progressoPct
    })
    .slice(0, 2)

  return (
    <div className="rounded-3xl bg-white p-6">
      <div className="mb-5">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          💡 Foco adaptativo
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          Sugestões baseadas nas trilhas que mais pedem revisão agora.
        </p>
      </div>

      {weakest.length === 0 ? (
        <p className="text-sm text-gray-400">
          Comece uma trilha para receber recomendações personalizadas de revisão.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {weakest.map((trail) => {
            const accuracy = getTrailAccuracy(trail)

            return (
              <button
                key={trail.trail.id}
                type="button"
                onClick={() => navigate(`/trilha/${trail.trail.id}`)}
                className="rounded-2xl border border-gray-100 bg-[#f8f8f3] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{trail.trail.nome}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      Sua precisão está abaixo do ideal. Revise esta trilha para proteger streak e subir no ranking.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
                    {accuracy}% acerto
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600">
                    Revisão sugerida
                  </span>
                  <span className="rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-600">
                    {trail.progressoPct}% concluído
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
