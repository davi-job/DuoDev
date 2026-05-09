import { createFileRoute } from '@tanstack/react-router';
import {
    TrendingUpIcon,
    TrendingDownIcon,
    UsersIcon,
    BookOpenIcon,
    BrainCircuitIcon,
    LayersIcon,
    PlusCircleIcon,
    EditIcon,
    Trash2Icon,
    CheckCircleIcon,
    GlobeIcon,
    FileCode2Icon,
    ServerIcon,
    SmartphoneIcon,
    DatabaseIcon,
} from 'lucide-react';

import './index.css';

export const Route = createFileRoute('/')({
    component: Home,
});

/* ─── Tudo mock / descartável ─── */

function Home() {
    const hoje = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="home">
            {/* Header */}
            <div className="home-header">
                <div>
                    <h4>Admin / Home</h4>
                    <h2>Painel Geral</h2>
                </div>
                <span className="data-hoje">{hoje}</span>
            </div>

            {/* Stats */}
            <div className="home-stats">
                <StatCard label="USUÁRIOS ATIVOS" valor="1.247" variacao="+12%" positivo />
                <StatCard label="CATEGORIAS" valor="8" variacao="+2 este mês" positivo />
                <StatCard label="AULAS CONCLUÍDAS" valor="4.832" variacao="+23%" positivo />
                <StatCard label="TAXA DE ABANDONO" valor="8.2%" variacao="-3.1%" positivo={false} />
            </div>

            {/* Cards em grid livre */}
            <div className="home-cards">
                <div style={{ gridArea: 'grafico' }}><GraficoBarras /></div>
                <div style={{ gridArea: 'atividade' }}><AtividadeRecente /></div>
                <div style={{ gridArea: 'top' }}><TopCategorias /></div>
                <div style={{ gridArea: 'donut' }}><DonutStatus /></div>
                <div style={{ gridArea: 'usuarios' }}><UsuariosPorCategoria /></div>
                <div style={{ gridArea: 'mini' }}><MiniEstatisticas /></div>
            </div>
        </div>
    );
}

/* ─── Componentes internos (tudo aqui, descartável) ─── */

function StatCard({
    label,
    valor,
    variacao,
    positivo,
}: {
    label: string;
    valor: string;
    variacao: string;
    positivo: boolean;
}) {
    return (
        <div className="stat-card">
            <span className="stat-label">{label}</span>
            <span className="stat-valor">{valor}</span>
            <span className={`stat-sub ${positivo ? 'positivo' : 'negativo'}`}>
                {positivo ? <TrendingUpIcon size={14} /> : <TrendingDownIcon size={14} />}
                {variacao}
            </span>
        </div>
    );
}

function GraficoBarras() {
    const meses = [
        { label: 'Jan', valor: 65 },
        { label: 'Fev', valor: 45 },
        { label: 'Mar', valor: 80 },
        { label: 'Abr', valor: 52 },
        { label: 'Mai', valor: 90 },
        { label: 'Jun', valor: 70 },
        { label: 'Jul', valor: 85 },
        { label: 'Ago', valor: 60 },
        { label: 'Set', valor: 95 },
        { label: 'Out', valor: 75 },
        { label: 'Nov', valor: 88 },
        { label: 'Dez', valor: 42 },
    ];

    return (
        <div className="grafico-card">
            <span className="grafico-titulo">Aulas concluídas por mês</span>
            <div className="grafico-barras">
                {meses.map((m) => (
                    <div key={m.label} className="barra-grupo">
                        <div
                            className="barra"
                            style={{
                                height: `${m.valor}%`,
                                backgroundColor: m.valor > 75 ? '#9eea6c' : m.valor > 50 ? '#9eea6c80' : '#9eea6c40',
                            }}
                        />
                        <span className="barra-label">{m.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AtividadeRecente() {
    const atividades = [
        { icone: <PlusCircleIcon size={14} />, cor: '#3CEFB0', texto: 'Categoria "Mobile" criada', tempo: 'Há 2 horas' },
        { icone: <EditIcon size={14} />, cor: '#F7DF1E', texto: 'Trilha "React Básico" editada', tempo: 'Há 3 horas' },
        { icone: <CheckCircleIcon size={14} />, cor: '#9eea6c', texto: '12 questões publicadas', tempo: 'Há 5 horas' },
        { icone: <Trash2Icon size={14} />, cor: '#ef4444', texto: 'Aula duplicada removida', tempo: 'Há 8 horas' },
        { icone: <PlusCircleIcon size={14} />, cor: '#3CEFB0', texto: 'Desafio "FizzBuzz" criado', tempo: 'Há 1 dia' },
        { icone: <EditIcon size={14} />, cor: '#F7DF1E', texto: 'Categoria "Backend" atualizada', tempo: 'Há 1 dia' },
        { icone: <CheckCircleIcon size={14} />, cor: '#9eea6c', texto: 'Trilha "SQL" publicada', tempo: 'Há 2 dias' },
    ];

    return (
        <div className="atividade-card">
            <span className="atividade-titulo">Atividade Recente</span>
            <div className="atividade-lista">
                {atividades.map((a, i) => (
                    <div key={i} className="atividade-item">
                        <div
                            className="atividade-icone"
                            style={{ backgroundColor: `${a.cor}20`, color: a.cor }}
                        >
                            {a.icone}
                        </div>
                        <div className="atividade-info">
                            <span>{a.texto}</span>
                            <span>{a.tempo}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DonutStatus() {
    const dados = [
        { label: 'Publicado', valor: 4, cor: '#9eea6c' },
        { label: 'Rascunho', valor: 2, cor: '#f59e0b' },
        { label: 'Revisão', valor: 1, cor: '#ef4444' },
        { label: 'Arquivado', valor: 1, cor: '#3178C6' },
    ];
    const total = dados.reduce((s, d) => s + d.valor, 0);

    // Calcular segmentos do donut SVG
    const raio = 52;
    const circunferencia = 2 * Math.PI * raio;
    let offset = 0;

    return (
        <div className="donut-card">
            <span className="donut-titulo">Status das Categorias</span>
            <div className="donut-conteudo">
                <svg className="donut-svg" viewBox="0 0 140 140">
                    {dados.map((d) => {
                        const proporcao = d.valor / total;
                        const dashLength = proporcao * circunferencia;
                        const dashGap = circunferencia - dashLength;
                        const currentOffset = offset;
                        offset += dashLength;

                        return (
                            <circle
                                key={d.label}
                                cx="70"
                                cy="70"
                                r={raio}
                                fill="none"
                                stroke={d.cor}
                                strokeWidth="16"
                                strokeDasharray={`${dashLength} ${dashGap}`}
                                strokeDashoffset={-currentOffset}
                                strokeLinecap="butt"
                                transform="rotate(-90 70 70)"
                            />
                        );
                    })}
                    <text x="70" y="66" textAnchor="middle" fill="var(--text-primary)" fontSize="24" fontWeight="900">
                        {total}
                    </text>
                    <text x="70" y="84" textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">
                        categorias
                    </text>
                </svg>

                <div className="donut-legenda">
                    {dados.map((d) => (
                        <div key={d.label} className="legenda-item">
                            <div className="legenda-cor" style={{ backgroundColor: d.cor }} />
                            <span>
                                {d.label} ({d.valor})
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function UsuariosPorCategoria() {
    const categorias = [
        { nome: 'Fundamentos', icone: <GlobeIcon size={14} />, cor: '#3CEFB0', usuarios: 482, conclusao: 67 },
        { nome: 'JavaScript', icone: <FileCode2Icon size={14} />, cor: '#F7DF1E', usuarios: 351, conclusao: 43 },
        { nome: 'Backend', icone: <ServerIcon size={14} />, cor: '#5B9BD5', usuarios: 198, conclusao: 31 },
        { nome: 'Mobile', icone: <SmartphoneIcon size={14} />, cor: '#FF8A65', usuarios: 124, conclusao: 22 },
        { nome: 'Banco de Dados', icone: <DatabaseIcon size={14} />, cor: '#3178C6', usuarios: 215, conclusao: 54 },
    ];

    const maxUsuarios = Math.max(...categorias.map((c) => c.usuarios));

    return (
        <div className="card-aux">
            <span className="card-aux-titulo">Usuários por Categoria</span>
            <div className="resumo-lista">
                {categorias.map((cat) => (
                    <div key={cat.nome} className="resumo-item">
                        <div className="resumo-item-esquerda">
                            <div
                                className="resumo-item-icone"
                                style={{ backgroundColor: `${cat.cor}20`, color: cat.cor }}
                            >
                                {cat.icone}
                            </div>
                            <span className="resumo-item-nome">{cat.nome}</span>
                        </div>
                        <div className="resumo-item-direita">
                            <div className="resumo-barra-bg">
                                <div
                                    className="resumo-barra-fill"
                                    style={{
                                        width: `${(cat.usuarios / maxUsuarios) * 100}%`,
                                        backgroundColor: cat.cor,
                                    }}
                                />
                            </div>
                            <span className="resumo-item-valor" title={`${cat.conclusao}% concluem`}>
                                {cat.usuarios}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TopCategorias() {
    const top = [
        { nome: 'JavaScript', icone: <FileCode2Icon size={16} />, cor: '#F7DF1E', pos: 2 },
        { nome: 'Fundamentos', icone: <GlobeIcon size={16} />, cor: '#3CEFB0', pos: 1 },
        { nome: 'Banco de Dados', icone: <DatabaseIcon size={16} />, cor: '#3178C6', pos: 3 },
    ];

    const alturas = ['65%', '90%', '50%'];

    return (
        <div className="card-aux">
            <span className="card-aux-titulo">Top Categorias</span>
            <div className="podium">
                {top.map((cat, i) => (
                    <div key={cat.nome} className="podium-item">
                        <div
                            className="podium-icone"
                            style={{ backgroundColor: `${cat.cor}20`, color: cat.cor }}
                        >
                            {cat.icone}
                        </div>
                        <div
                            className="podium-barra"
                            style={{ height: alturas[i], backgroundColor: `${cat.cor}15` }}
                        >
                            <span className="podium-posicao">{cat.pos}°</span>
                            <span className="podium-nome">{cat.nome}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MiniEstatisticas() {
    return (
        <div className="card-aux">
            <span className="card-aux-titulo">Resumo Geral</span>
            <div className="mini-stats">
                <div className="mini-stat">
                    <span className="mini-stat-label">TRILHAS</span>
                    <span className="mini-stat-valor">26</span>
                    <span className="mini-stat-sub">em 8 categorias</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-label">QUESTÕES</span>
                    <span className="mini-stat-valor">530</span>
                    <span className="mini-stat-sub">87% ativas</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-label">DESAFIOS</span>
                    <span className="mini-stat-valor">42</span>
                    <span className="mini-stat-sub">12 novos</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-label">MÉDIA/DIA</span>
                    <span className="mini-stat-valor">89</span>
                    <span className="mini-stat-sub">aulas concluídas</span>
                </div>
            </div>
        </div>
    );
}
