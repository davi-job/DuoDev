import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Sidebar from '../../components/home/Sidebar';
import Topbar from '../../components/home/Topbar';
import { fetchMeuProgresso, fetchStreakStats, fetchStreakLogs } from '../../lib/api';
import type { JwtPayload, StreakLog, StreakStats, UserTrailAPI } from '../../components/interfaces/interfaces';
import ModuleCard from '../../components/perfil/moduleCard';
import DesempenhoSection from '../../components/perfil/desempenhoSection';
import StreakSection from '../../components/perfil/streakSection';
import Avatar from '../../components/perfil/avatar';

type Tab = 'modulos' | 'desempenho' | 'streaks';

export default function Perfil() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tab, setTab] = useState<Tab>('modulos');
    const [userName, setUserName] = useState('Usuário');
    const [userEmail, setUserEmail] = useState('');
    const [trails, setTrails] = useState<UserTrailAPI[]>([]);
    const [streakStats, setStreakStats] = useState<StreakStats>({ sequenciaAtual: 0, melhorSequencia: 0 });
    const [streakLogs, setStreakLogs] = useState<StreakLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                if (decoded.name) setUserName(decoded.name);
                if (decoded.email) setUserEmail(decoded.email);
            } catch {}
        }

        async function load() {
            try {
                const [progresso, stats, logs] = await Promise.all([
                    fetchMeuProgresso(),
                    fetchStreakStats(),
                    fetchStreakLogs(),
                ]);
                setTrails(progresso);
                setStreakStats(stats);
                setStreakLogs(logs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const concluidas = trails.filter((t) => t.progressoPct >= 100).length;
    const totalAcertos = trails.reduce((s, t) => s + (t.acertos ?? Math.round(t.progressoPct * 0.8)), 0);
    const totalErros = trails.reduce((s, t) => s + (t.erros ?? Math.round(t.progressoPct * 0.3)), 0);
    const totalQ = totalAcertos + totalErros;
    const media = totalQ > 0 ? Math.round((totalAcertos / totalQ) * 100) : 0;

    const TABS: { key: Tab; label: string; icon: string }[] = [
        { key: 'modulos', label: 'Módulos', icon: '📚' },
        { key: 'desempenho', label: 'Desempenho', icon: '📊' },
        { key: 'streaks', label: 'Streaks', icon: '🔥' },
    ];

    return (
        <div className="min-h-screen bg-[#f5f5f0] font-dm">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col min-h-screen lg:ml-48">
                <Topbar onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-screen-xl mx-auto flex flex-col gap-6">
                        {/* Hero */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                                <Avatar name={userName} />

                                <div className="flex-1 min-w-0">
                                    <h1 className="font-syne text-xl font-semibold text-gray-900 truncate">
                                        {userName}
                                    </h1>
                                    <p className="text-sm text-gray-400 mt-0.5 truncate">{userEmail}</p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <span className="text-xs bg-orange-50 text-orange-500 px-3 py-1 rounded-full font-medium border border-orange-100">
                                            🔥 {streakStats.sequenciaAtual} dias seguidos
                                        </span>
                                        <span className="text-xs bg-amber-50 text-amber-500 px-3 py-1 rounded-full font-medium border border-amber-100">
                                            ⭐ Melhor: {streakStats.melhorSequencia} dias
                                        </span>
                                        <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium border border-green-100">
                                            ✅ {concluidas} trilha{concluidas !== 1 ? 's' : ''} concluída
                                            {concluidas !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                                    {[
                                        { value: `${media}%`, label: 'Média acertos', color: 'text-green-500' },
                                        { value: trails.length, label: 'Trilhas', color: 'text-blue-500' },
                                        { value: totalErros, label: 'Erros totais', color: 'text-red-400' },
                                    ].map((s) => (
                                        <div
                                            key={s.label}
                                            className="flex flex-col items-center gap-0.5 bg-[#f5f5f0] rounded-2xl px-4 py-3 min-w-[72px]"
                                        >
                                            <span className={`font-syne text-xl font-bold ${s.color}`}>{s.value}</span>
                                            <span className="text-[11px] text-gray-400 text-center leading-tight">
                                                {s.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
                            {TABS.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        tab === t.key
                                            ? 'bg-green-400 text-white shadow-sm'
                                            : 'text-gray-400 hover:text-gray-700'
                                    }`}
                                >
                                    <span>{t.icon}</span>
                                    <span className="hidden sm:inline">{t.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Conteúdo */}
                        {loading ? (
                            <p className="text-sm text-gray-400">Carregando...</p>
                        ) : (
                            <>
                                {tab === 'modulos' && (
                                    <section className="flex flex-col gap-4">
                                        <div>
                                            <h2 className="font-syne text-lg font-semibold text-green-400 mb-1">
                                                Seus Módulos
                                            </h2>
                                            <p className="text-sm text-gray-400">
                                                Todos os módulos em andamento ou concluídos
                                            </p>
                                        </div>
                                        {trails.length === 0 ? (
                                            <p className="text-sm text-gray-400">Nenhum módulo iniciado ainda.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {trails.map((t) => (
                                                    <ModuleCard key={t.trail.id} trail={t} />
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                )}

                                {tab === 'desempenho' && (
                                    <section className="flex flex-col gap-4">
                                        <div>
                                            <h2 className="font-syne text-lg font-semibold text-green-400 mb-1">
                                                Desempenho
                                            </h2>
                                            <p className="text-sm text-gray-400">
                                                Média de acertos, erros e onde melhorar
                                            </p>
                                        </div>
                                        <DesempenhoSection trails={trails} />
                                    </section>
                                )}

                                {tab === 'streaks' && (
                                    <section className="flex flex-col gap-4">
                                        <div>
                                            <h2 className="font-syne text-lg font-semibold text-green-400 mb-1">
                                                Streaks de Estudo
                                            </h2>
                                            <p className="text-sm text-gray-400">
                                                Acompanhe sua consistência de estudos
                                            </p>
                                        </div>
                                        <StreakSection stats={streakStats} logs={streakLogs} />
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
