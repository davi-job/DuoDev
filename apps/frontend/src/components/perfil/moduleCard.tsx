import type { UserTrailAPI } from "../interfaces/interfaces";

export default function ModuleCard({ trail }: { trail: UserTrailAPI }) {
    const isDone = trail.progressoPct >= 100;
    const acertos = trail.acertos ?? Math.round(trail.progressoPct * 0.8);
    const erros = trail.erros ?? Math.round(trail.progressoPct * 0.3);
    const total = acertos + erros;
    const pctAcertos = total > 0 ? Math.round((acertos / total) * 100) : 0;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-syne text-sm font-semibold text-gray-800">{trail.trail.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {trail.trail.nivel} · {trail.trail.totalHoras}h
                    </p>
                </div>
                <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${isDone ? 'bg-green-100 text-green-600' : 'bg-amber-50 text-amber-500'}`}
                >
                    {isDone ? '✓ Concluído' : 'Em progresso'}
                </span>
            </div>

            <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Progresso</span>
                    <span className="font-medium text-gray-600">{trail.progressoPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
                        style={{ width: `${trail.progressoPct}%` }}
                    />
                </div>
            </div>

            {total > 0 && (
                <div className="flex items-center gap-3 text-xs pt-0.5 border-t border-gray-50">
                    <span className="flex items-center gap-1 text-green-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                        {acertos} acertos
                    </span>
                    <span className="flex items-center gap-1 text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                        {erros} erros
                    </span>
                    <span className="ml-auto font-semibold text-gray-600">{pctAcertos}% correto</span>
                </div>
            )}
        </div>
    );
}
