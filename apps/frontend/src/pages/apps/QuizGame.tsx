import { useState, useEffect, useRef } from 'react';
import { X, Check, Trophy } from 'lucide-react';

import type {
    CodeReadingQuestion,
    FillBlankQuestion,
    MultipleChoiceQuestion,
} from '../../components/interfaces/interfaces';
import { questions } from '../../components/quizGame/questions';
import { RotateCcw, House } from 'lucide-react';
import { useNavigate } from 'react-router';
// import { updateUserPreferences } from '../../lib/api'; // Removed import
// import { toast } from 'sonner'; // Removed import

// Componente de Confete
const Confetti = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const palette = [
            '#97C459',
            '#639922',
            '#FAC775',
            '#BA7517',
            '#85B7EB',
            '#378ADD',
            '#ED93B1',
            '#D4537E',
            '#5DCAA5',
            '#1D9E75',
            '#F0997B',
            '#D85A30',
        ];
        const shapes = ['circle', 'rect', 'ribbon'] as const;

        const timers: ReturnType<typeof setTimeout>[] = [];

        for (let i = 0; i < 120; i++) {
            const el = document.createElement('div');
            const color = palette[Math.floor(Math.random() * palette.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const size = 6 + Math.random() * 7;
            const delay = Math.random() * 3;
            const dur = 1.6 + Math.random() * 1.4;
            const drift = (Math.random() - 0.5) * 140;

            Object.assign(el.style, {
                position: 'absolute',
                top: '-20px',
                left: `${Math.random() * 100}%`,
                width: `${shape === 'ribbon' ? Math.round(size * 0.35) : size}px`,
                height: `${shape === 'ribbon' ? size * 2.5 : size}px`,
                background: color,
                borderRadius: shape === 'circle' ? '50%' : shape === 'rect' ? '2px' : '1px',
                opacity: String(0.75 + Math.random() * 0.25),
                willChange: 'transform',
                filter: Math.random() > 0.5 ? 'brightness(1.1)' : 'brightness(0.9)',
            });

            el.animate(
                [
                    { transform: `translateY(-20px) translateX(0) rotate(0deg) scaleX(1)`, opacity: '1' },
                    {
                        transform: `translateY(45vh) translateX(${drift * 0.5}px) rotate(200deg) scaleX(-1)`,
                        opacity: '1',
                        offset: 0.5,
                    },
                    { transform: `translateY(105vh) translateX(${drift}px) rotate(380deg) scaleX(1)`, opacity: '0' },
                ],
                {
                    duration: dur * 1000,
                    delay: delay * 1000,
                    fill: 'forwards',
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                },
            );

            container.appendChild(el);
            const t = setTimeout(() => el.remove(), (delay + dur + 0.2) * 1000);
            timers.push(t);
        }

        return () => {
            timers.forEach(clearTimeout);
            container.innerHTML = '';
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />;
};

export default function QuizGame() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    // const [loading, setLoading] = useState(false); // Removed loading state

    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/home');
    };

    const goBack = () => {
        navigate(-1);
    };

    const question = questions[currentIndex];
    const progress = (currentIndex / questions.length) * 100;

    function handleAnswer() {
        if (feedback) return;

        let isCorrect = false;

        if (question.type === 'multiple-choice' || question.type === 'code-reading') {
            isCorrect = selectedOption === question.correct;
        } else if (question.type === 'fill-blank') {
            isCorrect = selectedWords.join(' ') === question.correctOrder.join(' ');
        }

        setFeedback(isCorrect ? 'correct' : 'incorrect');
        if (isCorrect) setScore((s) => s + 1);
    }

    function handleNext() {
        if (currentIndex + 1 >= questions.length) {
            setFinished(true);
            setShowConfetti(true);
            // Remove o confete após 4 segundos
            setTimeout(() => setShowConfetti(false), 4000);
            // The actual navigation to home and marking onboarding complete will happen when user clicks "Início"
        } else {
            setCurrentIndex((i) => i + 1);
            setSelectedOption(null);
            setSelectedWords([]);
            setFeedback(null);
        }
    }

    function handleSkip() {
        handleNext();
        setFeedback(null);
    }

    function handleWordClick(word: string) {
        if (feedback) return;
        const q = question as FillBlankQuestion;
        if (selectedWords.length < q.correctOrder.length) {
            setSelectedWords((prev) => [...prev, word]);
        }
    }

    function handleRemoveWord(idx: number) {
        if (feedback) return;
        setSelectedWords((prev) => prev.filter((_, i) => i !== idx));
    }

    const canAnswer =
        question.type === 'fill-blank'
            ? selectedWords.length === (question as FillBlankQuestion).correctOrder.length
            : selectedOption !== null;

    if (finished) {
        return (
            <>
                {showConfetti && <Confetti />}
                <div className="min-h-screen bg-white flex items-center justify-center font-dm px-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-10 max-w-sm w-full text-center shadow-sm">
                        {/* Ícone */}
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <Trophy className="w-7 h-7 text-green-600" />
                        </div>

                        {/* Títulos */}
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Quiz concluído</p>
                        <h2 className="text-xl font-medium text-gray-800 mb-6">
                            {score / questions.length >= 0.8
                                ? 'Boa trabalho!'
                                : score / questions.length >= 0.5
                                  ? 'Quase lá!'
                                  : 'Continue praticando!'}
                        </h2>

                        {/* Pontuação principal */}
                        <div className="flex items-baseline justify-center gap-1 mb-1">
                            <span className="text-5xl font-medium text-gray-900">{score}</span>
                            <span className="text-xl text-gray-400">/ {questions.length}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-5">
                            {Math.round((score / questions.length) * 100)}% de acerto
                        </p>

                        {/* Barra */}
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-700"
                                style={{ width: `${(score / questions.length) * 100}%` }}
                            />
                        </div>

                        {/* Mini cards */}
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

                        {/* Botões */}
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={() => {
                                    setCurrentIndex(0);
                                    setScore(0);
                                    setFeedback(null);
                                    setSelectedOption(null);
                                    setSelectedWords([]);
                                    setFinished(false);
                                    setShowConfetti(false);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <RotateCcw size={15} /> Tentar novamente
                            </button>
                            <button
                                onClick={goToHome}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                            >
                                <House size={15} /> Início
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-dm">
            {/* Feedback Banner */}
            {feedback === 'correct' && (
                <div className="w-full bg-green-400 px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-gray-800" strokeWidth={3} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-base leading-tight">Correto!</p>
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
                        <p className="font-bold text-gray-800 text-base leading-tight">Incorreta :(</p>
                        <p className="text-gray-700 text-sm">Siga para a próxima questão</p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl mx-auto w-full">
                {/* Header bar */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={goBack} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    {/* Progress bar */}
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="flex items-start gap-3 mb-8">
                    <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{currentIndex + 1}</span>
                    </div>
                    <p className="text-gray-800 font-medium text-base pt-1">{question.question}</p>
                </div>

                {/* Question Body */}
                <div className="flex-1">
                    {/* Multiple Choice */}
                    {(question.type === 'multiple-choice' || question.type === 'code-reading') && (
                        <>
                            {question.type === 'code-reading' && (
                                <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-mono text-gray-700 mb-5 overflow-x-auto leading-relaxed">
                                    {(question as CodeReadingQuestion).code.split('\n').map((line, i) => (
                                        <div key={i} className="flex gap-3">
                                            <span className="text-gray-400 select-none w-5 text-right flex-shrink-0">
                                                {i + 1}
                                            </span>
                                            <span>{line}</span>
                                        </div>
                                    ))}
                                </pre>
                            )}
                            <div className="space-y-2.5">
                                {(question as MultipleChoiceQuestion).options.map((opt) => {
                                    const isSelected = selectedOption === opt.label;
                                    const isCorrect =
                                        feedback && opt.label === (question as MultipleChoiceQuestion).correct;
                                    const isWrong = feedback && isSelected && !isCorrect;

                                    return (
                                        <button
                                            key={opt.label}
                                            onClick={() => !feedback && setSelectedOption(opt.label)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                        ${
                                                isCorrect
                                                    ? 'border-green-400 bg-green-50'
                                                    : isWrong
                                                      ? 'border-red-400 bg-red-50'
                                                      : isSelected
                                                        ? 'border-green-400 bg-green-50'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                        >
                                            <span
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${
                                                    isCorrect
                                                        ? 'bg-green-400 text-white'
                                                        : isWrong
                                                          ? 'bg-red-400 text-white'
                                                          : isSelected
                                                            ? 'bg-green-400 text-white'
                                                            : 'bg-gray-100 text-gray-500'
                                            }`}
                                            >
                                                {opt.label}
                                            </span>
                                            <span className="text-sm text-gray-700">{opt.text}</span>
                                            <div className="ml-auto">
                                                {isCorrect ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : isWrong ? (
                                                    <X className="w-4 h-4 text-red-400" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Fill Blank */}
                    {question.type === 'fill-blank' && (
                        <>
                            {/* Answer area */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="font-mono text-base text-gray-700">
                                    {(question as FillBlankQuestion).sentence.split('___').map((part, i, arr) => (
                                        <span key={i}>
                                            {part}
                                            {i < arr.length - 1 && (
                                                <span
                                                    className={`inline-block min-w-[80px] border-b-2 mx-1 px-2 text-center ${
                                                        selectedWords[i]
                                                            ? 'border-green-400 text-gray-800'
                                                            : 'border-gray-300 text-gray-400'
                                                    }`}
                                                >
                                                    {selectedWords[i] || '______'}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </p>
                            </div>

                            {/* Área de resposta (remover ou manter como resumo) */}
                            <div className="border border-gray-200 rounded-xl px-4 py-3 mb-6 min-h-[52px] flex flex-wrap gap-2 items-center bg-white">
                                {selectedWords.length === 0 ? (
                                    <span className="text-gray-300 text-sm">Clique nas palavras para completar...</span>
                                ) : (
                                    selectedWords.map((word, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleRemoveWord(i)}
                                            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-700 hover:border-red-300 hover:bg-red-50 transition-colors"
                                        >
                                            {word}
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Word bank */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {(question as FillBlankQuestion).blanks.map((word, i) => {
                                    const used = selectedWords.includes(word);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => !used && handleWordClick(word)}
                                            disabled={used || !!feedback}
                                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                        ${
                                                used
                                                    ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                                                    : 'border-gray-300 text-gray-700 bg-white hover:border-green-400 hover:bg-green-50'
                                            }`}
                                        >
                                            {word}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-8 pt-4">
                    <button
                        onClick={handleSkip}
                        className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors border border-gray-200 rounded-xl px-4 py-2"
                    >
                        Pular
                    </button>

                    {feedback ? (
                        <button
                            onClick={handleNext}
                            className="bg-green-400 hover:bg-green-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
                        >
                            Próxima
                        </button>
                    ) : (
                        <button
                            onClick={handleAnswer}
                            disabled={!canAnswer}
                            className={`font-semibold text-sm px-6 py-2.5 rounded-xl transition-all
                ${
                                canAnswer
                                    ? 'bg-green-400 hover:bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            Responder
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}