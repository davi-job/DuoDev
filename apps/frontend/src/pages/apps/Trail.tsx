import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowUpRight, BookOpen, BarChart2, Clock, Users, FileText, BrainCircuit, Code2 } from 'lucide-react';

import Sidebar from '../../components/home/Sidebar';
import Topbar from '../../components/home/Topbar';
import type { LearningContentItem, LearningTrailContentResponse } from '../../components/interfaces/interfaces';
import { fetchLearningTrailContent } from '../../lib/api';

function contentIcon(type: LearningContentItem['type']) {
    if (type === 'lesson') return <BookOpen className="w-4 h-4 text-green-600" />;
    if (type === 'question') return <BrainCircuit className="w-4 h-4 text-blue-500" />;
    return <Code2 className="w-4 h-4 text-amber-500" />;
}

function contentLabel(type: LearningContentItem['type']) {
    if (type === 'lesson') return 'Aula';
    if (type === 'question') return 'Questão';
    return 'Desafio';
}

export default function Trail() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState<LearningTrailContentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { trailId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!trailId) {
            setError('Trilha não encontrada.');
            setLoading(false);
            return;
        }

        const currentTrailId = trailId;

        async function loadTrail() {
            setLoading(true);
            setError('');

            try {
                const response = await fetchLearningTrailContent(currentTrailId);
                setData(response);
            } catch (err) {
                console.error(err);
                setError('Não foi possível carregar a trilha agora.');
            } finally {
                setLoading(false);
            }
        }

        loadTrail();
    }, [trailId]);

    const firstItem = data?.items[0] ?? null;
    const firstLesson = useMemo(
        () => data?.items.find((item) => item.type === 'lesson') ?? null,
        [data?.items],
    );
    function handleContinue() {
        if (!trailId) return;

        if (firstLesson) {
            navigate(`/trilha/${trailId}/aula/${firstLesson.id}`);
            return;
        }

        if (firstItem?.type === 'question') {
            navigate(`/trilha/${trailId}/quiz`);
            return;
        }

        if (firstItem?.type === 'challenge') {
            navigate(`/trilha/${trailId}/desafio/${firstItem.id}`);
        }
    }

    function openItem(item: LearningContentItem) {
        if (!trailId) return;

        if (item.type === 'lesson') {
            navigate(`/trilha/${trailId}/aula/${item.id}`);
            return;
        }

        if (item.type === 'question') {
            navigate(`/trilha/${trailId}/quiz`);
            return;
        }

        if (item.type === 'challenge') {
            navigate(`/trilha/${trailId}/desafio/${item.id}`);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f5f0] font-dm">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col min-h-screen lg:ml-64">
                <Topbar onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-8">
                    {loading ? (
                        <div className="max-w-6xl mx-auto text-base text-gray-400">Carregando trilha...</div>
                    ) : error || !data ? (
                        <div className="max-w-6xl mx-auto text-base text-red-500">{error || 'Trilha não encontrada.'}</div>
                    ) : (
                        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
                            <div className="flex-1 min-w-0">
                                <div
                                    className="w-full h-40 lg:h-52 rounded-3xl flex items-center justify-center mb-5 shadow-sm"
                                    style={{ backgroundColor: data.trail.thumbColor }}
                                >
                                    <div className="w-20 h-20 rounded-full bg-white/25 flex items-center justify-center">
                                        <BookOpen className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-2">
                                    <span className="text-xs font-semibold bg-green-500 text-white rounded-full px-3 py-1 uppercase tracking-wide">
                                        {data.trail.level}
                                    </span>
                                    {data.trail.category?.name ? (
                                        <span className="text-xs font-semibold bg-blue-500 text-white rounded-full px-3 py-1 uppercase tracking-wide">
                                            {data.trail.category.name}
                                        </span>
                                    ) : null}
                                </div>

                                <h1 className="text-3xl font-bold text-gray-800 mb-2">{data.trail.name}</h1>

                                <p className="text-base text-gray-500 leading-relaxed mb-6">{data.trail.description}</p>

                                <h2 className="text-xl font-bold text-green-500 mb-3">Conteúdo da trilha</h2>
                                {data.items.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-400">
                                        Essa trilha ainda não possui conteúdo publicado.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {data.items.map((item) => {
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => openItem(item)}
                                                    className="text-left rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                                                >
                                                    <div className="h-24 bg-gray-100 flex items-center justify-center">
                                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                                            {contentIcon(item.type)}
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <div className="flex items-center justify-between gap-3 mb-2">
                                                            <span className="text-xs font-semibold text-green-600 uppercase tracking-[0.18em]">
                                                                {contentLabel(item.type)}
                                                            </span>
                                                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                                                        </div>
                                                        <p className="text-base font-semibold text-gray-800 mb-1">{item.title}</p>
                                                        <p className="text-sm text-gray-500 leading-relaxed">
                                                            {item.type === 'lesson'
                                                                ? `${item.elements.length} elemento(s) nesta aula`
                                                                : item.type === 'question'
                                                                  ? `${item.alternatives.length} alternativa(s) disponíveis`
                                                                  : item.description || 'Desafio publicado para a trilha'}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <h2 className="text-xl font-bold text-green-500 mt-6 mb-3">Detalhes</h2>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-700">Hora de estudo</p>
                                            <p className="text-xs text-gray-400">{data.trail.duration || `${data.trail.totalHours ?? 0}h`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <BookOpen className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-700">Aulas</p>
                                            <p className="text-xs text-gray-400">{data.trail.contentCounts.lessons} aulas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <BarChart2 className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-700">Questões</p>
                                            <p className="text-xs text-gray-400">{data.trail.contentCounts.questions} questões</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-700">Desafios</p>
                                            <p className="text-xs text-gray-400">{data.trail.contentCounts.challenges} desafios</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-72 flex-shrink-0">
                                <div className="bg-white rounded-3xl shadow-sm p-5 sticky top-8 border border-gray-100">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Próximo passo</p>
                                    <div className="rounded-2xl bg-gray-50 p-4 mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            {firstItem ? contentIcon(firstItem.type) : <FileText className="w-4 h-4 text-gray-400" />}
                                            <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
                                                {firstItem ? contentLabel(firstItem.type) : 'Sem conteúdo'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {firstItem?.title ?? 'Essa trilha ainda não possui conteúdo disponível.'}
                                        </p>
                                    </div>
                                    <button
                                        className="w-full bg-green-400 hover:bg-green-500 transition-colors text-white font-semibold text-sm rounded-2xl py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleContinue}
                                        disabled={!firstLesson && firstItem?.type !== 'question' && firstItem?.type !== 'challenge'}
                                    >
                                        {firstLesson
                                            ? 'Começar aula'
                                            : firstItem?.type === 'question'
                                              ? 'Ir para quiz'
                                              : firstItem?.type === 'challenge'
                                                ? 'Abrir desafio'
                                                : 'Aguardando conteúdo'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
