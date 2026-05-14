import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Code2, Trophy } from 'lucide-react';

import Sidebar from '../../components/home/Sidebar';
import Topbar from '../../components/home/Topbar';
import type { LearningChallengeItem, LearningTrailContentResponse } from '../../components/interfaces/interfaces';
import { fetchLearningTrailContent } from '../../lib/api';

export default function ChallengePage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState<LearningTrailContentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { trailId, challengeId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!trailId) {
            setError('Trilha não encontrada.');
            setLoading(false);
            return;
        }

        const currentTrailId = trailId;

        async function loadChallenge() {
            setLoading(true);
            setError('');

            try {
                const response = await fetchLearningTrailContent(currentTrailId);
                setData(response);
            } catch (err) {
                console.error(err);
                setError('Não foi possível carregar o desafio.');
            } finally {
                setLoading(false);
            }
        }

        loadChallenge();
    }, [trailId]);

    const challenge = useMemo(
        () =>
            data?.items.find(
                (item): item is LearningChallengeItem => item.type === 'challenge' && item.id === challengeId,
            ) ?? null,
        [challengeId, data?.items],
    );

    return (
        <div className="min-h-screen bg-[#f5f5f0] font-dm">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col min-h-screen lg:ml-64">
                <Topbar onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-8">
                    {loading ? (
                        <div className="max-w-4xl mx-auto text-base text-gray-400">Carregando desafio...</div>
                    ) : error || !data || !challenge ? (
                        <div className="max-w-4xl mx-auto text-base text-red-500">{error || 'Desafio não encontrado.'}</div>
                    ) : (
                        <div className="max-w-4xl mx-auto flex flex-col gap-6">
                            <button
                                type="button"
                                onClick={() => navigate(`/trilha/${trailId}`)}
                                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar para a trilha
                            </button>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                                        <Code2 className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Desafio</p>
                                        <h1 className="font-syne text-2xl font-semibold text-gray-900">{challenge.title}</h1>
                                    </div>
                                </div>

                                {challenge.description ? (
                                    <p className="text-base text-gray-600 leading-7 mb-6">{challenge.description}</p>
                                ) : null}

                                <div className="rounded-3xl border border-amber-100 bg-amber-50/60 p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Trophy className="w-5 h-5 text-amber-500" />
                                        <h2 className="font-syne text-lg font-semibold text-gray-900">Instruções</h2>
                                    </div>
                                    <div className="text-base text-gray-700 whitespace-pre-line leading-7">
                                        {challenge.instructions || 'Nenhuma instrução adicional foi publicada para este desafio.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
