import { useState } from 'react';
import Sidebar from '../../components/home/Sidebar';
import Topbar from '../../components/home/Topbar';
import { ArrowUpRight, ChevronRight, Clock, BookOpen, BarChart2, Users } from 'lucide-react';
import { useNavigate } from 'react-router';

const contents = [
    { title: 'Título', duration: 'CONCLUSÃO EM 10H' },
    { title: 'Título', duration: 'CONCLUSÃO EM 10H' },
    { title: 'Título', duration: 'CONCLUSÃO EM 10H' },
];

export default function Trail() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const goToQuiz = () => {
        navigate('/quiz');
    }

    return (
        <div className="min-h-screen bg-[#f5f5f0] font-dm">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col min-h-screen lg:ml-48">
                <Topbar onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left / Main Content */}
                        <div className="flex-1 min-w-0">
                            {/* Hero Banner */}
                            <div className="w-full h-40 lg:h-52 rounded-2xl bg-yellow-400 flex items-center justify-center mb-5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 48 48"
                                    className="w-16 h-16 opacity-80"
                                    fill="none"
                                >
                                    <path
                                        d="M24 6C14.06 6 6 14.06 6 24s8.06 18 18 18 18-8.06 18-18S33.94 6 24 6z"
                                        fill="#fff"
                                        fillOpacity="0.3"
                                    />
                                    <path
                                        d="M17 14h-3a2 2 0 00-2 2v16a2 2 0 002 2h3M31 14h3a2 2 0 012 2v16a2 2 0 01-2 2h-3"
                                        stroke="#fff"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M20 20l-4 4 4 4M28 20l4 4-4 4"
                                        stroke="#fff"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            {/* Tags */}
                            <div className="flex gap-2 mb-2">
                                <span className="text-xs font-semibold bg-green-500 text-white rounded-full px-3 py-0.5 uppercase tracking-wide">
                                    Iniciante
                                </span>
                                <span className="text-xs font-semibold bg-blue-500 text-white rounded-full px-3 py-0.5 uppercase tracking-wide">
                                    Introdução
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Python</h1>

                            {/* Description */}
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Neste curso gratuito, você aprenderá a desenvolver uma API de tarefas usando Java e
                                Spring Boot, criando um To-Do List do zero. O conteúdo inclui criação de rotas HTTP,
                                validação de parâmetros, integração com banco de dados, autenticação JWT com Spring
                                Security e deploy na plataforma Render. Um ótimo primeiro passo para quem quer aprender
                                Spring Boot e entender como funciona o desenvolvimento e publicação de APIs
                            </p>

                            {/* Conteúdos */}
                            <h2 className="text-lg font-bold text-green-500 mb-3">Conteúdos</h2>
                            <div className="relative">
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {contents.map((item, i) => (
                                        <div
                                            key={i}
                                            className="min-w-[160px] w-44 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"
                                        >
                                            <div className="h-24 bg-gray-300 flex items-center justify-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-8 h-8 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-3.5 2M12 20l3.5-2"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="p-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-green-500">
                                                        {item.title}
                                                    </span>
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                                                </div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
                                                    {item.duration}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Arrow right */}
                                    {/* <div className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow cursor-pointer">
                                        <ChevronRight className="w-4 h-4 text-white" />
                                    </div> */}
                                </div>
                            </div>

                            {/* Detalhes */}
                            <h2 className="text-lg font-bold text-green-500 mt-6 mb-3">Detalhes</h2>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-700">Hora de estudo</p>
                                        <p className="text-xs text-gray-400">7h</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-700">Aulas</p>
                                        <p className="text-xs text-gray-400">5 aulas</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <BarChart2 className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-700">Nível de dificuldade</p>
                                        <p className="text-xs text-gray-400">Iniciante</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-700">Alunos desta trilha</p>
                                        <p className="text-xs text-gray-400">3</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right / Progress Card */}
                        <div className="w-full lg:w-56 flex-shrink-0">
                            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-8">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Meu progresso</p>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden mr-3">
                                        <div className="h-full bg-green-400 rounded-full" style={{ width: '20%' }} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-600">20%</span>
                                </div>
                                <button className="mt-3 w-full bg-green-400 hover:bg-green-500 transition-colors text-white font-semibold text-sm rounded-xl py-2.5" onClick={goToQuiz}>
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Bottom left toast */}
            <div className="fixed bottom-4 left-4 bg-gray-800 text-white text-xs rounded-xl px-4 py-3 shadow-lg max-w-[180px]">
                <p className="mb-1">Não esqueça de avaliar o nosso projeto.</p>
                <button className="flex items-center gap-1 text-green-400 font-semibold hover:underline">
                    Avaliar agora <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
