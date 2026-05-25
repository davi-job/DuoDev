import { useState } from 'react';
import type { StreakLog, StreakStats } from '../interfaces/interfaces';
import type { StreakPeriod } from '../types/types';

/* ── Helpers de streak ── */
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const WEEK_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getStreakByPeriod(logs: StreakLog[], period: StreakPeriod) {
    const now = new Date();
    if (period === 'week') {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now);
            d.setDate(now.getDate() - (6 - i));
            const iso = d.toISOString().slice(0, 10);
            return {
                label: WEEK_LABELS[d.getDay()],
                active: logs.some((l) => l.dataRegistro?.slice(0, 10) === iso && l.concluido),
            };
        });
    }
    if (period === 'month') {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return {
                label: String(day),
                active: logs.some((l) => l.dataRegistro?.slice(0, 10) === iso && l.concluido),
            };
        });
    }
    return MONTH_LABELS.map((label, i) => {
        const prefix = `${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
        return { label, active: logs.some((l) => l.dataRegistro?.startsWith(prefix) && l.concluido) };
    });
}

export default function StreakSection({ stats, logs }: { stats: StreakStats; logs: StreakLog[] }) {
    const [period, setPeriod] = useState<StreakPeriod>('week');
    const data = getStreakByPeriod(logs, period);
    const active = data.filter((d) => d.active).length;
    const totalDias = logs.filter((l) => l.concluido).length;

    return (
        <div className="flex flex-col gap-4">
            {/* Resumo de stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Sequência atual', value: stats.sequenciaAtual, icon: '🔥', color: 'text-orange-500' },
                    { label: 'Melhor sequência', value: stats.melhorSequencia, icon: '⭐', color: 'text-amber-500' },
                    { label: 'Dias estudados', value: totalDias, icon: '📅', color: 'text-green-500' },
                ].map((c) => (
                    <div
                        key={c.label}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1"
                    >
                        <span className="text-xl">{c.icon}</span>
                        <span className={`font-syne text-3xl font-bold ${c.color}`}>{c.value}</span>
                        <span className="text-xs text-gray-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Gráfico */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h3 className="font-syne text-sm font-semibold text-gray-800">Histórico de Streaks</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {active} dia{active !== 1 ? 's' : ''} de estudo no período selecionado
                        </p>
                    </div>
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                        {(['week', 'month', 'year'] as StreakPeriod[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                                    period === p
                                        ? 'bg-white text-green-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                    {data.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div
                                title={d.label}
                                className={`rounded-lg transition-all duration-300 ${
                                    period === 'week' ? 'w-9 h-9' : period === 'month' ? 'w-7 h-7' : 'w-10 h-10'
                                } ${d.active ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-sm shadow-green-200' : 'bg-gray-100'}`}
                            />
                            {(period === 'week' || period === 'year') && (
                                <span className="text-[10px] text-gray-400">{d.label}</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gray-100" />
                        <span>Sem estudo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gradient-to-br from-green-400 to-emerald-500" />
                        <span>Estudou</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
