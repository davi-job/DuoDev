import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Sidebar from '../../components/home/Sidebar';
import Topbar from '../../components/home/Topbar';
import ModuleCard from '../../components/perfil/moduleCard';
import { fetchMeuProgresso } from '../../lib/api';
import type { UserTrailAPI } from '../../components/interfaces/interfaces';

export default function MeusConteudos() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [trails, setTrails] = useState<UserTrailAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const progresso = await fetchMeuProgresso();
                setTrails(progresso);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, []);

    const emAndamento = trails.filter((trail) => trail.progressoPct < 100);
    const concluidos = trails.filter((trail) => trail.progressoPct >= 100);

    return (
        <div className="min-h-screen bg-[#f5f5f0] font-dm">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col min-h-screen lg:ml-48">
                <Topbar onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-screen-xl mx-auto flex flex-col gap-8">
                        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h1 className="font-syne text-2xl font-semibold text-gray-900">
                                        Meus conteúdos
                                    </h1>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Acompanhe suas trilhas em andamento e o que você já concluiu.
                                    </p>
                                </div>
                                <div className="flex gap-3 flex-wrap">
                                    <div className="bg-[#f5f5f0] rounded-2xl px-4 py-3 min-w-[112px]">
                                        <p className="text-xs text-gray-400 mb-1">Em andamento</p>
                                        <p className="font-syne text-2xl font-bold text-green-500">{emAndamento.length}</p>
                                    </div>
                                    <div className="bg-[#f5f5f0] rounded-2xl px-4 py-3 min-w-[112px]">
                                        <p className="text-xs text-gray-400 mb-1">Concluídas</p>
                                        <p className="font-syne text-2xl font-bold text-gray-900">{concluidos.length}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {loading ? (
                            <p className="text-sm text-gray-400">Carregando seus conteúdos...</p>
                        ) : trails.length === 0 ? (
                            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <h2 className="font-syne text-lg font-semibold text-gray-900 mb-2">
                                    Nenhum conteúdo iniciado
                                </h2>
                                <p className="text-sm text-gray-400 mb-4">
                                    Quando você começar uma trilha, ela vai aparecer aqui.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/home')}
                                    className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-400 transition"
                                >
                                    Explorar trilhas
                                </button>
                            </section>
                        ) : (
                            <>
                                <section className="flex flex-col gap-4">
                                    <div>
                                        <h2 className="font-syne text-lg font-semibold text-green-500 mb-1">
                                            Em andamento
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            Continue de onde você parou.
                                        </p>
                                    </div>
                                    {emAndamento.length === 0 ? (
                                        <p className="text-sm text-gray-400">Nenhuma trilha em andamento.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {emAndamento.map((trail) => (
                                                <button
                                                    key={trail.trail.id}
                                                    type="button"
                                                    onClick={() => navigate(`/trilha/${trail.trail.id}`)}
                                                    className="text-left"
                                                >
                                                    <ModuleCard trail={trail} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                <section className="flex flex-col gap-4">
                                    <div>
                                        <h2 className="font-syne text-lg font-semibold text-gray-900 mb-1">
                                            Concluídas
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            Trilhas finalizadas no seu histórico.
                                        </p>
                                    </div>
                                    {concluidos.length === 0 ? (
                                        <p className="text-sm text-gray-400">Nenhuma trilha concluída ainda.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {concluidos.map((trail) => (
                                                <button
                                                    key={trail.trail.id}
                                                    type="button"
                                                    onClick={() => navigate(`/trilha/${trail.trail.id}`)}
                                                    className="text-left"
                                                >
                                                    <ModuleCard trail={trail} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
