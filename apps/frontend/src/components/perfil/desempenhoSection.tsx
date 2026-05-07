import type { UserTrailAPI } from "../interfaces/interfaces";

export default function DesempenhoSection({ trails }: { trails: UserTrailAPI[] }) {
    const totalAcertos = trails.reduce((s, t) => s + (t.acertos ?? Math.round(t.progressoPct * 0.8)), 0);
    const totalErros = trails.reduce((s, t) => s + (t.erros ?? Math.round(t.progressoPct * 0.3)), 0);
    const totalQ = totalAcertos + totalErros;
    const media = totalQ > 0 ? Math.round((totalAcertos / totalQ) * 100) : 0;

    const worst = [...trails]
        .filter((t) => {
            const a = t.acertos ?? Math.round(t.progressoPct * 0.8);
            const e = t.erros ?? Math.round(t.progressoPct * 0.3);
            return a + e > 0;
        })
        .sort((a, b) => {
            const ra = (a.acertos ?? 0) / Math.max(1, (a.acertos ?? 0) + (a.erros ?? 0));
            const rb = (b.acertos ?? 0) / Math.max(1, (b.acertos ?? 0) + (b.erros ?? 0));
            return ra - rb;
        })
        .slice(0, 2);

    return (
        <div className="flex flex-col gap-4">
            {/* Cards de resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    {
                        label: 'Total acertos',
                        value: totalAcertos,
                        color: 'text-green-500',
                        bg: 'bg-green-50',
                        border: 'border-green-100',
                        icon: '✅',
                    },
                    {
                        label: 'Total erros',
                        value: totalErros,
                        color: 'text-red-500',
                        bg: 'bg-red-50',
                        border: 'border-red-100',
                        icon: '❌',
                    },
                    {
                        label: 'Média geral',
                        value: `${media}%`,
                        color: 'text-blue-500',
                        bg: 'bg-blue-50',
                        border: 'border-blue-100',
                        icon: '📈',
                    },
                    {
                        label: 'Questões',
                        value: totalQ,
                        color: 'text-purple-500',
                        bg: 'bg-purple-50',
                        border: 'border-purple-100',
                        icon: '📝',
                    },
                ].map((c) => (
                    <div key={c.label} className={`${c.bg} border ${c.border} rounded-2xl p-4 flex flex-col gap-2`}>
                        <span className="text-base">{c.icon}</span>
                        <span className={`font-syne text-2xl font-bold ${c.color}`}>{c.value}</span>
                        <span className="text-xs text-gray-500">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Barras por trilha */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                <h3 className="font-syne text-sm font-semibold text-gray-800">Desempenho por trilha</h3>
                {trails.length === 0 && <p className="text-sm text-gray-400">Nenhuma trilha iniciada ainda.</p>}
                {trails.map((t) => {
                    const a = t.acertos ?? Math.round(t.progressoPct * 0.8);
                    const e = t.erros ?? Math.round(t.progressoPct * 0.3);
                    const tot = a + e;
                    const pct = tot > 0 ? Math.round((a / tot) * 100) : 0;
                    const barColor =
                        pct >= 70
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : pct >= 40
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                              : 'bg-gradient-to-r from-red-400 to-rose-400';
                    const textColor = pct >= 70 ? 'text-green-500' : pct >= 40 ? 'text-amber-500' : 'text-red-500';

                    return (
                        <div key={t.trail.id} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-gray-700">{t.trail.nome}</span>
                                <span className={`font-semibold ${textColor}`}>{pct}%</span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="flex gap-3 text-[11px] text-gray-400">
                                <span className="text-green-500">✓ {a} acertos</span>
                                <span className="text-red-400">✗ {e} erros</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sugestões */}
            {worst.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <span>💡</span>
                        <h3 className="font-syne text-sm font-semibold text-green-700">Sugestões para melhorar</h3>
                    </div>
                    <ul className="flex flex-col gap-2">
                        {worst.map((t) => (
                            <li key={t.trail.id} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                                Revise <strong className="text-gray-800 mx-1">{t.trail.nome}</strong> — sua taxa de
                                acertos está abaixo do ideal
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}