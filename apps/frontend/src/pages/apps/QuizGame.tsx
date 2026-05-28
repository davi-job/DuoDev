import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { X, Check, Trophy, RotateCcw, House } from 'lucide-react';

import type {
    CodeReadingQuestion,
    FillBlankQuestion,
    LearningQuestionItem,
    MultipleChoiceQuestion,
} from '../../components/interfaces/interfaces';
import { fetchLearningTrailContent, submitTrailQuiz } from '../../lib/api';

type QuizQuestion = MultipleChoiceQuestion | FillBlankQuestion | CodeReadingQuestion;

const Confetti = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const palette = ['#97C459', '#639922', '#FAC775', '#BA7517', '#85B7EB', '#378ADD', '#ED93B1', '#D4537E'];
        const timers: ReturnType<typeof setTimeout>[] = [];

        for (let i = 0; i < 120; i++) {
            const el = document.createElement('div');
            const color = palette[Math.floor(Math.random() * palette.length)];
            const size = 6 + Math.random() * 7;
            const delay = Math.random() * 3;
            const dur = 1.6 + Math.random() * 1.4;
            const drift = (Math.random() - 0.5) * 140;

            Object.assign(el.style, {
                position: 'absolute',
                top: '-20px',
                left: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: color,
                borderRadius: '50%',
                opacity: String(0.75 + Math.random() * 0.25),
                willChange: 'transform',
            });

            el.animate(
                [
                    { transform: 'translateY(-20px) translateX(0) rotate(0deg)', opacity: '1' },
                    {
                        transform: `translateY(45vh) translateX(${drift * 0.5}px) rotate(200deg)`,
                        opacity: '1',
                        offset: 0.5,
                    },
                    { transform: `translateY(105vh) translateX(${drift}px) rotate(380deg)`, opacity: '0' },
                ],
                {
                    duration: dur * 1000,
                    delay: delay * 1000,
                    fill: 'forwards',
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                },
            );

            container.appendChild(el);
            const timer = setTimeout(() => el.remove(), (delay + dur + 0.2) * 1000);
            timers.push(timer);
        }

        return () => {
            timers.forEach(clearTimeout);
            container.innerHTML = '';
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />;
};

function mapQuestion(item: LearningQuestionItem): QuizQuestion | null {
    if (item.questionType === 'fill-blank') {
        if (!item.sentence || !item.correctOrder.length || !item.blanks.length) {
            return null;
        }

        return {
            id: item.id,
            type: 'fill-blank',
            question: item.title,
            sentence: item.sentence,
            blanks: item.blanks,
            correctOrder: item.correctOrder,
        };
    }

    if (!item.alternatives.length || !item.answer) {
        return null;
    }

    const correctIndex = item.alternatives.findIndex((alternative) => alternative.id === item.answer);
    const correctLabel =
        correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : String.fromCharCode(65);

    const options = item.alternatives.map((alternative, index) => ({
        label: String.fromCharCode(65 + index),
        text: alternative.text,
    }));

    if (item.questionType === 'code-reading') {
        return {
            id: item.id,
            type: 'code-reading',
            question: item.title,
            code: item.codeSnippet ?? '',
            options,
            correct: correctLabel,
        };
    }

    return {
        id: item.id,
        type: 'multiple-choice',
        question: item.title,
        options,
        correct: correctLabel,
    };
}

export default function QuizGame() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [trailName, setTrailName] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [questionIds, setQuestionIds] = useState<string[]>([]);

    const navigate = useNavigate();
    const { trailId } = useParams();

    useEffect(() => {
        if (!trailId) {
            setError('Trilha não encontrada.');
            setLoading(false);
            return;
        }

        const currentTrailId = trailId;

        async function loadQuiz() {
            setLoading(true);
            setError('');

            try {
                const response = await fetchLearningTrailContent(currentTrailId);
                setTrailName(response.trail.name);

                const quizQuestions = response.items
                    .filter((item): item is LearningQuestionItem => item.type === 'question')
                    .map(mapQuestion)
                    .filter((item): item is QuizQuestion => item !== null);

                setQuestions(quizQuestions);
                setQuestionIds(quizQuestions.map((item) => String(item.id)));

                if (!quizQuestions.length) {
                    setError('Essa trilha ainda não possui questões publicadas.');
                }
            } catch (err) {
                console.error(err);
                setError('Não foi possível carregar o quiz da trilha.');
            } finally {
                setLoading(false);
            }
        }

        loadQuiz();
    }, [trailId]);

    const question = questions[currentIndex];
    const progress = questions.length ? (currentIndex / questions.length) * 100 : 0;

    function resetState() {
        setCurrentIndex(0);
        setScore(0);
        setFeedback(null);
        setSelectedOption(null);
        setSelectedWords([]);
        setFinished(false);
        setShowConfetti(false);
    }

    function goToTrail() {
        if (trailId) navigate(`/trilha/${trailId}`);
        else navigate('/home');
    }

    function handleAnswer() {
        if (!question || feedback) return;

        let isCorrect = false;

        if (question.type === 'multiple-choice' || question.type === 'code-reading') {
            isCorrect = selectedOption === question.correct;
        } else {
            isCorrect = selectedWords.join(' ') === question.correctOrder.join(' ');
        }

        setFeedback(isCorrect ? 'correct' : 'incorrect');
        if (isCorrect) setScore((current) => current + 1);
    }

    async function handleNext() {
        if (currentIndex + 1 >= questions.length) {
            if (trailId) {
                try {
                    await submitTrailQuiz(trailId, {
                        questionIds,
                        correctAnswers: score,
                        incorrectAnswers: questions.length - score,
                    });
                } catch (err) {
                    console.error(err);
                }
            }
            setFinished(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
            return;
        }

        setCurrentIndex((index) => index + 1);
        setSelectedOption(null);
        setSelectedWords([]);
        setFeedback(null);
    }

    function handleSkip() {
        handleNext();
        setFeedback(null);
    }

    function handleWordClick(word: string) {
        if (!question || question.type !== 'fill-blank' || feedback) return;
        if (selectedWords.length < question.correctOrder.length) {
            setSelectedWords((prev) => [...prev, word]);
        }
    }

    function handleRemoveWord(index: number) {
        if (feedback) return;
        setSelectedWords((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    }

    const canAnswer = question
        ? question.type === 'fill-blank'
            ? selectedWords.length === question.correctOrder.length
            : selectedOption !== null
        : false;

    if (loading) {
        return <div className="min-h-screen bg-white flex items-center justify-center text-base text-gray-400">Carregando quiz...</div>;
    }

    if (error || !question) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
                    <p className="text-sm uppercase tracking-[0.18em] text-gray-400 mb-3">Quiz</p>
                    <h1 className="font-syne text-2xl font-semibold text-gray-900 mb-3">Nada para responder</h1>
                    <p className="text-base text-gray-500 mb-6">{error || 'Nenhuma questão disponível.'}</p>
                    <button
                        type="button"
                        onClick={goToTrail}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
                    >
                        <House size={16} />
                        Voltar para a trilha
                    </button>
                </div>
            </div>
        );
    }

    if (finished) {
        return (
            <>
                {showConfetti && <Confetti />}
                <div className="min-h-screen bg-white flex items-center justify-center font-dm px-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-10 max-w-sm w-full text-center shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <Trophy className="w-7 h-7 text-green-600" />
                        </div>

                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Quiz concluído</p>
                        <h2 className="text-xl font-medium text-gray-800 mb-2">{trailName || 'Trilha concluída'}</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            {score / questions.length >= 0.8
                                ? 'Bom trabalho!'
                                : score / questions.length >= 0.5
                                  ? 'Quase lá!'
                                  : 'Continue praticando!'}
                        </p>

                        <div className="flex items-baseline justify-center gap-1 mb-1">
                            <span className="text-5xl font-medium text-gray-900">{score}</span>
                            <span className="text-xl text-gray-400">/ {questions.length}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-5">
                            {Math.round((score / questions.length) * 100)}% de acerto
                        </p>

                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-700"
                                style={{ width: `${(score / questions.length) * 100}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {[
                                { label: 'Acertos', value: score, color: 'text-green-600' },
                                { label: 'Erros', value: questions.length - score, color: 'text-red-500' },
                                { label: 'Total', value: questions.length, color: 'text-gray-700' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="bg-gray-50 rounded-xl py-3">
                                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                                    <p className={`text-xl font-medium ${color}`}>{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={resetState}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <RotateCcw size={15} /> Tentar novamente
                            </button>
                            <button
                                onClick={goToTrail}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                            >
                                <House size={15} /> Trilha
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-dm">
            {feedback === 'correct' && (
                <div className="w-full bg-green-400 px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-gray-800" strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-gray-900 font-semibold">Resposta correta</p>
                        <p className="text-gray-700 text-sm">Siga para a próxima questão</p>
                    </div>
                </div>
            )}

            {feedback === 'incorrect' && (
                <div className="w-full bg-red-400 px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                        <X className="w-5 h-5 text-gray-800" strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-gray-900 font-semibold">Resposta incorreta</p>
                        <p className="text-gray-700 text-sm">Siga para a próxima questão</p>
                    </div>
                </div>
            )}

            <div className="px-4 py-5 md:px-8 flex-1 flex flex-col">
                <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <span className="text-lg leading-none">←</span>
                            Voltar
                        </button>
                        <button
                            onClick={handleSkip}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Pular
                        </button>
                    </div>

                    <div className="mb-4">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                            <span>{trailName}</span>
                            <span>
                                {currentIndex + 1} / {questions.length}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex-1">
                        <div className="flex flex-col gap-6 h-full">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
                                    {question.type === 'multiple-choice'
                                        ? 'Múltipla escolha'
                                        : question.type === 'code-reading'
                                          ? 'Leitura de código'
                                          : 'Complete a frase'}
                                </p>
                                <p className="text-gray-800 font-medium text-base pt-1">{question.question}</p>
                            </div>

                            {(question.type === 'multiple-choice' || question.type === 'code-reading') && (
                                <div className="flex flex-col gap-3">
                                    {question.type === 'code-reading' && (
                                        <pre className="bg-gray-950 text-gray-100 rounded-2xl p-5 overflow-x-auto text-sm leading-6">
                                            {question.code}
                                        </pre>
                                    )}

                                    <div className="grid grid-cols-1 gap-3">
                                        {question.options.map((option) => {
                                            const isSelected = selectedOption === option.label;
                                            const isCorrect =
                                                feedback && option.label === question.correct;
                                            const isWrong =
                                                feedback === 'incorrect' && isSelected && option.label !== question.correct;

                                            return (
                                                <button
                                                    key={option.label}
                                                    type="button"
                                                    onClick={() => setSelectedOption(option.label)}
                                                    disabled={!!feedback}
                                                    className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${
                                                        isCorrect
                                                            ? 'border-green-400 bg-green-50'
                                                            : isWrong
                                                              ? 'border-red-400 bg-red-50'
                                                              : isSelected
                                                                ? 'border-green-300 bg-green-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-semibold">
                                                            {option.label}
                                                        </span>
                                                        <span className="text-sm text-gray-700">{option.text}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {question.type === 'fill-blank' && (
                                <div className="flex flex-col gap-5">
                                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base leading-8 text-gray-800">
                                        {question.sentence.split('___').map((part, index, array) => (
                                            <span key={`${part}-${index}`}>
                                                {part}
                                                {index < array.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveWord(index)}
                                                        className={`inline-block min-w-[80px] border-b-2 mx-1 px-2 text-center ${
                                                            selectedWords[index]
                                                                ? 'border-green-400 text-green-600 font-medium'
                                                                : 'border-gray-300 text-gray-300'
                                                        }`}
                                                    >
                                                        {selectedWords[index] || '___'}
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="border border-gray-200 rounded-xl px-4 py-3 min-h-[52px] flex flex-wrap gap-2 items-center bg-white">
                                        {selectedWords.length === 0 && (
                                            <span className="text-gray-300 text-sm">Clique nas palavras para completar...</span>
                                        )}
                                        {selectedWords.map((word, index) => (
                                            <button
                                                key={`${word}-${index}`}
                                                type="button"
                                                onClick={() => handleRemoveWord(index)}
                                                className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium"
                                            >
                                                {word}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {question.blanks.map((word, index) => {
                                            const usedCount = selectedWords.filter((selected) => selected === word).length;
                                            const sourceCount = question.blanks.filter((candidate) => candidate === word).length;
                                            const disabled = usedCount >= sourceCount || !!feedback;

                                            return (
                                                <button
                                                    key={`${word}-${index}`}
                                                    type="button"
                                                    onClick={() => handleWordClick(word)}
                                                    disabled={disabled}
                                                    className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-green-300 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    {word}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-5">
                        {!feedback ? (
                            <button
                                type="button"
                                onClick={handleAnswer}
                                disabled={!canAnswer}
                                className="px-5 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirmar resposta
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => void handleNext()}
                                className="px-5 py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors"
                            >
                                Próxima questão
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
