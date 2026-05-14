import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, BookOpen, BrainCircuit, ImageIcon } from 'lucide-react';

import Sidebar from '../../components/home/Sidebar';
import Topbar from '../../components/home/Topbar';
import type { LearningLessonItem, LearningTrailContentResponse } from '../../components/interfaces/interfaces';
import { fetchLearningTrailContent } from '../../lib/api';

export default function LessonPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState<LearningTrailContentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { trailId, lessonId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!trailId) {
            setError('Trilha não encontrada.');
            setLoading(false);
            return;
        }

        const currentTrailId = trailId;

        async function loadLesson() {
            setLoading(true);
            setError('');

            try {
                const response = await fetchLearningTrailContent(currentTrailId);
                setData(response);
            } catch (err) {
                console.error(err);
                setError('Não foi possível carregar a aula agora.');
            } finally {
                setLoading(false);
            }
        }

        loadLesson();
    }, [trailId]);

    const lessons = useMemo(
        () => (data?.items.filter((item): item is LearningLessonItem => item.type === 'lesson') ?? []),
        [data?.items],
    );
    const firstQuestion = useMemo(
        () => data?.items.find((item) => item.type === 'question') ?? null,
        [data?.items],
    );

    const currentLessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
    const lesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex] : null;
    const nextLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex + 1] ?? null : null;

    function goBackToTrail() {
        if (trailId) {
            navigate(`/trilha/${trailId}`);
        }
    }

    function goToNextLesson() {
        if (trailId && nextLesson) {
            navigate(`/trilha/${trailId}/aula/${nextLesson.id}`);
        }
    }

    function goToQuiz() {
        if (trailId && firstQuestion) {
            navigate(`/trilha/${trailId}/quiz`);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f5f0] font-dm">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col min-h-screen lg:ml-64">
                <Topbar onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-8">
                    {loading ? (
                        <div className="max-w-4xl mx-auto text-base text-gray-400">Carregando aula...</div>
                    ) : error || !data || !lesson ? (
                        <div className="max-w-4xl mx-auto text-base text-red-500">{error || 'Aula não encontrada.'}</div>
                    ) : (
                        <div className="max-w-4xl mx-auto flex flex-col gap-6">
                            <button
                                type="button"
                                onClick={goBackToTrail}
                                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar para a trilha
                            </button>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Aula</p>
                                        <h1 className="font-syne text-2xl font-semibold text-gray-900">{lesson.title}</h1>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-400 mb-8">
                                    {data.trail.name} · {lesson.elements.length} elemento(s)
                                </p>

                                <div className="flex flex-col gap-6">
                                    {lesson.elements
                                        .slice()
                                        .sort((a, b) => a.order - b.order)
                                        .map((element) => (
                                            <section
                                                key={element.id}
                                                className="rounded-2xl border border-gray-100 bg-[#fcfcf8] p-5"
                                            >
                                                {element.type === 'texto' ? (
                                                    <div className="text-gray-700 whitespace-pre-line leading-7 text-base">
                                                        {element.content}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <ImageIcon className="w-4 h-4" />
                                                            Imagem da aula
                                                        </div>
                                                        <img
                                                            src={element.content}
                                                            alt="Elemento visual da aula"
                                                            className="w-full rounded-2xl border border-gray-100 object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </section>
                                        ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Próximo passo</p>
                                    <p className="text-sm text-gray-500">
                                        {nextLesson
                                            ? `Continue para a próxima aula: ${nextLesson.title}`
                                            : firstQuestion
                                              ? 'As aulas acabaram. Siga para o quiz desta trilha.'
                                              : 'Você chegou ao fim das aulas publicadas desta trilha.'}
                                    </p>
                                </div>

                                {nextLesson ? (
                                    <button
                                        type="button"
                                        onClick={goToNextLesson}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-green-400 text-white text-sm font-semibold hover:bg-green-500 transition-colors"
                                    >
                                        Próxima aula
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={goToQuiz}
                                        disabled={!firstQuestion}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-green-400 text-white text-sm font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Ir para o quiz
                                        <BrainCircuit className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
