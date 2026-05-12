import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BookOpenIcon, BrainCircuitIcon, LayersIcon, FolderIcon } from 'lucide-react';

import { dashboardApi } from '../api/dashboard';
import TelaErro from '../components/TelaErro';
import type { StatusCount, CategoriaDashboard, UltimoConteudoItem } from '../types';

import './index.css';

export const Route = createFileRoute('/')({
    component: Home,
});

const STATUS_CORES: Record<string, string> = {
    publicado: '#9eea6c',
    rascunho: '#f59e0b',
    revisao: '#ef4444',
    arquivado: '#3178C6',
};

const STATUS_LABELS: Record<string, string> = {
    publicado: 'Publicado',
    rascunho: 'Rascunho',
    revisao: 'Revisão',
    arquivado: 'Arquivado',
};

const TIPO_CONFIG: Record<string, { label: string; cor: string }> = {
    aula: { label: 'Aula', cor: '#5B9BD5' },
    questao: { label: 'Questão', cor: '#3CEFB0' },
    desafio: { label: 'Desafio', cor: '#FF8A65' },
};

const STATUS_ORDEM = ['publicado', 'rascunho', 'revisao', 'arquivado'] as const;

function tempoRelativo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Agora';
    if (mins < 60) return `Há ${mins}min`;
    const horas = Math.floor(mins / 60);
    if (horas < 24) return `Há ${horas}h`;
    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'Ontem';
    return `Há ${dias} dias`;
}

function Home() {
    const hoje = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['dashboard'],
        queryFn: dashboardApi.buscar,
        staleTime: 0,
    });

    if (isLoading) return <div className="loading">Carregando painel...</div>;

    if (isError || !data) {
        return (
            <TelaErro
                mensagem="Não foi possível carregar o painel. Verifique a conexão com o servidor."
                onTentar={() => void refetch()}
            />
        );
    }

    const totalExercicios = data.totais.questoes + data.totais.desafios;

    return (
        <div className="home">
            <div className="home-header">
                <div>
                    <h4>Admin / Home</h4>
                    <h2>Painel Geral</h2>
                </div>
                <span className="data-hoje">{hoje}</span>
            </div>

            <div className="home-stats">
                <StatCard
                    icone={<FolderIcon size={18} />}
                    label="CATEGORIAS"
                    valor={data.totais.categorias}
                    sub={`${data.categoriasPorStatus.publicado} publicadas`}
                    cor="#3CEFB0"
                />
                <StatCard
                    icone={<LayersIcon size={18} />}
                    label="TRILHAS"
                    valor={data.totais.trilhas}
                    sub={`${data.trilhasPorStatus.publicado} publicadas`}
                    cor="#9eea6c"
                />
                <StatCard
                    icone={<BookOpenIcon size={18} />}
                    label="AULAS"
                    valor={data.totais.aulas}
                    sub="Total de aulas criadas"
                    cor="#5B9BD5"
                />
                <StatCard
                    icone={<BrainCircuitIcon size={18} />}
                    label="EXERCÍCIOS"
                    valor={totalExercicios}
                    sub={`${data.totais.questoes} questões · ${data.totais.desafios} desafios`}
                    cor="#FF8A65"
                />
            </div>

            <div className="home-grid">
                <div className="home-grid-esquerda">
                    <DonutCard titulo="Status das Categorias" status={data.categoriasPorStatus} />
                    <StatusBarras titulo="Status das Trilhas" status={data.trilhasPorStatus} />
                </div>
                <ConteudoPorCategoria categorias={data.trilhasPorCategoria} />
            </div>

            <UltimoConteudo itens={data.ultimoConteudo} />
        </div>
    );
}

function StatCard({
    icone,
    label,
    valor,
    sub,
    cor,
}: {
    icone: React.ReactNode;
    label: string;
    valor: number;
    sub: string;
    cor: string;
}) {
    return (
        <div className="stat-card">
            <div className="stat-icone" style={{ backgroundColor: `${cor}20`, color: cor }}>
                {icone}
            </div>
            <div className="stat-info">
                <span className="stat-label">{label}</span>
                <span className="stat-valor">{valor}</span>
                <span className="stat-sub">{sub}</span>
            </div>
        </div>
    );
}

function DonutCard({ titulo, status }: { titulo: string; status: StatusCount }) {
    const total = STATUS_ORDEM.reduce((s, k) => s + status[k], 0);
    const raio = 52;
    const circunferencia = 2 * Math.PI * raio;
    let offset = 0;

    return (
        <div className="card">
            <span className="card-titulo">{titulo}</span>
            <div className="donut-conteudo">
                <svg className="donut-svg" viewBox="0 0 140 140">
                    {total === 0 ? (
                        <circle
                            cx="70" cy="70" r={raio}
                            fill="none"
                            stroke="var(--border-primary)"
                            strokeWidth="16"
                        />
                    ) : (
                        STATUS_ORDEM.map((key) => {
                            if (status[key] === 0) return null;
                            const proporcao = status[key] / total;
                            const dashLength = proporcao * circunferencia;
                            const dashGap = circunferencia - dashLength;
                            const currentOffset = offset;
                            offset += dashLength;
                            return (
                                <circle
                                    key={key}
                                    cx="70" cy="70" r={raio}
                                    fill="none"
                                    stroke={STATUS_CORES[key]}
                                    strokeWidth="16"
                                    strokeDasharray={`${dashLength} ${dashGap}`}
                                    strokeDashoffset={-currentOffset}
                                    transform="rotate(-90 70 70)"
                                />
                            );
                        })
                    )}
                    <text x="70" y="66" textAnchor="middle" fill="var(--text-primary)" fontSize="24" fontWeight="900">
                        {total}
                    </text>
                    <text x="70" y="84" textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">
                        total
                    </text>
                </svg>
                <div className="donut-legenda">
                    {STATUS_ORDEM.map((key) => (
                        <div key={key} className="legenda-item">
                            <div className="legenda-cor" style={{ backgroundColor: STATUS_CORES[key] }} />
                            <span>
                                {STATUS_LABELS[key]}{' '}
                                <span className="legenda-num">({status[key]})</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatusBarras({ titulo, status }: { titulo: string; status: StatusCount }) {
    const total = STATUS_ORDEM.reduce((s, k) => s + status[k], 0);

    return (
        <div className="card">
            <span className="card-titulo">{titulo}</span>
            <div className="status-barras">
                {total > 0 && (
                    <div className="status-barra-stacked">
                        {STATUS_ORDEM.map((key) => {
                            if (status[key] === 0) return null;
                            return (
                                <div
                                    key={key}
                                    className="status-barra-segmento"
                                    style={{
                                        width: `${(status[key] / total) * 100}%`,
                                        backgroundColor: STATUS_CORES[key],
                                    }}
                                    title={`${STATUS_LABELS[key]}: ${status[key]}`}
                                />
                            );
                        })}
                    </div>
                )}
                <div className="status-lista">
                    {STATUS_ORDEM.map((key) => (
                        <div key={key} className="status-item">
                            <div className="status-item-esq">
                                <div className="legenda-cor" style={{ backgroundColor: STATUS_CORES[key] }} />
                                <span>{STATUS_LABELS[key]}</span>
                            </div>
                            <span className="status-item-num">{status[key]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ConteudoPorCategoria({ categorias }: { categorias: CategoriaDashboard[] }) {
    const maxTrilhas = Math.max(...categorias.map((c) => c.totalTrilhas), 1);
    const maxConteudo = Math.max(...categorias.map((c) => c.totalConteudo), 1);

    return (
        <div className="card">
            <span className="card-titulo">Conteúdo por Categoria</span>
            {categorias.length === 0 ? (
                <p className="vazio">Nenhuma categoria cadastrada.</p>
            ) : (
                <div className="cat-lista">
                    <div className="cat-header">
                        <span>Categoria</span>
                        <span>Trilhas</span>
                        <span>Conteúdo</span>
                    </div>
                    {categorias.map((cat) => (
                        <div key={cat.id} className="cat-item">
                            <div className="cat-nome">
                                <div className="cat-cor" style={{ backgroundColor: cat.thumbColor }} />
                                <Link
                                    to="/conteudo/$categoriaId"
                                    params={{ categoriaId: cat.id }}
                                    className="cat-link"
                                >
                                    {cat.nome}
                                </Link>
                            </div>
                            <div className="cat-barra-wrap">
                                <div className="cat-barra-bg">
                                    <div
                                        className="cat-barra-fill"
                                        style={{
                                            width: `${(cat.totalTrilhas / maxTrilhas) * 100}%`,
                                            backgroundColor: '#9eea6c',
                                        }}
                                    />
                                </div>
                                <span className="cat-num">{cat.totalTrilhas}</span>
                            </div>
                            <div className="cat-barra-wrap">
                                <div className="cat-barra-bg">
                                    <div
                                        className="cat-barra-fill"
                                        style={{
                                            width: `${(cat.totalConteudo / maxConteudo) * 100}%`,
                                            backgroundColor: '#5B9BD5',
                                        }}
                                    />
                                </div>
                                <span className="cat-num">{cat.totalConteudo}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function UltimoConteudo({ itens }: { itens: UltimoConteudoItem[] }) {
    return (
        <div className="card">
            <span className="card-titulo">Últimos Conteúdos Criados</span>
            {itens.length === 0 ? (
                <p className="vazio">Nenhum conteúdo cadastrado ainda.</p>
            ) : (
                <div className="feed-lista">
                    <div className="feed-header">
                        <span>Título</span>
                        <span>Trilha</span>
                        <span>Criado</span>
                    </div>
                    {itens.map((item) => {
                        const cfg = TIPO_CONFIG[item.tipo] ?? { label: item.tipo, cor: '#888' };
                        return (
                            <div key={item.id} className="feed-item">
                                <div className="feed-titulo">
                                    <span
                                        className="tipo-badge"
                                        style={{ backgroundColor: `${cfg.cor}20`, color: cfg.cor }}
                                    >
                                        {cfg.label}
                                    </span>
                                    <span>{item.title}</span>
                                </div>
                                <span className="feed-trilha">{item.trail_name}</span>
                                <span className="feed-tempo">{tempoRelativo(item.created_at)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
