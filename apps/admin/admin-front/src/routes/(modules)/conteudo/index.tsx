import { useMemo, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import MesaDeDados from '../../../components/MesaDeDados';
import ModuleHeader from '../../../components/ModuleHeader';
import StatusPill from '../../../components/StatusPill';
import DataBox from '../../../components/DataBox';
import BarraFiltros, { type AbaFiltro } from '../../../components/BarraFiltros';
import PainelLateral from '../../../components/PainelLateral';
import FormularioCategoria from '../../../components/FormularioCategoria';
import CelulaCategoria from '../../../components/CelulaCategoria';
import DialogoConfirmacao from '../../../components/DialogoConfirmacao';
import { useToast } from '../../../components/Toast';
import TelaErro from '../../../components/TelaErro';

import { categoriasApi } from '../../../api/categorias';
import { exportImportApi } from '../../../api/exportImport';
import { STATUS_CONFIG, type Categoria, type StatusCategoria, type CreateCategoriaDto } from '../../../types';

import '../Categorias.css';

export const Route = createFileRoute('/(modules)/conteudo/')({
    validateSearch: (search: Record<string, unknown>) => ({
        status: typeof search.status === 'string' ? search.status : 'todos',
    }),
    component: Conteudo,
});

function Conteudo() {
    const { mostrarToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { status: abaAtiva } = Route.useSearch();
    const setAbaAtiva = (status: string) =>
        void navigate({ to: '/conteudo', search: { status } });
    const [termoBusca, setTermoBusca] = useState('');

    const [painelAberto, setPainelAberto] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState<Categoria | undefined>(undefined);
    const [painelKey, setPainelKey] = useState(0);

    const [categoriaExcluindo, setCategoriaExcluindo] = useState<Categoria | undefined>(undefined);

    const { data: categorias = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['categorias'],
        queryFn: categoriasApi.listar,
    });

    const criarMutation = useMutation({
        mutationFn: (dto: CreateCategoriaDto) => categoriasApi.criar(dto),
        onSuccess: (nova) => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            fecharPainel();
            void navigate({ to: '/conteudo/$categoriaId', params: { categoriaId: nova.id } });
        },
        onError: () => mostrarToast('erro', 'Erro ao criar categoria.'),
    });

    const atualizarMutation = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: CreateCategoriaDto }) =>
            categoriasApi.atualizar(id, dto),
        onSuccess: (_, { dto }) => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            fecharPainel();
            mostrarToast('sucesso', `Categoria "${dto.name}" atualizada.`);
        },
        onError: () => mostrarToast('erro', 'Erro ao atualizar categoria.'),
    });

    const removerMutation = useMutation({
        mutationFn: (id: string) => categoriasApi.remover(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            const nome = categoriaExcluindo?.name ?? '';
            setCategoriaExcluindo(undefined);
            mostrarToast('sucesso', `Categoria "${nome}" excluída.`);
        },
        onError: () => mostrarToast('erro', 'Erro ao excluir categoria.'),
    });

    const abas: AbaFiltro[] = [
        { valor: 'todos', label: 'Todos', quantidade: categorias.length },
        ...Object.entries(STATUS_CONFIG).map(([valor, cfg]) => ({
            valor,
            label: cfg.label,
            quantidade: categorias.filter((c) => c.status === valor).length,
        })),
    ];

    const categoriasFiltradas = useMemo(() => {
        return categorias.filter((cat) => {
            const passaAba = abaAtiva === 'todos' || cat.status === abaAtiva;
            const passaBusca =
                termoBusca === '' || cat.name.toLowerCase().includes(termoBusca.toLowerCase());
            return passaAba && passaBusca;
        });
    }, [categorias, abaAtiva, termoBusca]);

    const totalTrilhas = categorias.reduce((acc, c) => acc + c.totalTrails, 0);
    const totalAulas = categorias.reduce((acc, c) => acc + c.totalLessons, 0);
    const totalQuestoes = categorias.reduce((acc, c) => acc + c.totalQuestions, 0);

    const dadosTabela = categoriasFiltradas.map((cat) => {
        const cfg = STATUS_CONFIG[cat.status as StatusCategoria];
        return [
            <button
                key={cat.id}
                className="celula-link"
                onClick={() => void navigate({ to: '/conteudo/$categoriaId', params: { categoriaId: cat.id } })}
            >
                <CelulaCategoria name={cat.name} icon={cat.icon} thumbColor={cat.thumbColor} />
            </button>,
            <StatusPill cor={cfg.cor} texto={cfg.label} />,
            cat.totalTrails,
            cat.totalLessons,
            cat.totalQuestions,
        ];
    });

    const inputImportRef = useRef<HTMLInputElement>(null);
    const [importando, setImportando] = useState(false);
    const [exportando, setExportando] = useState(false);

    async function handleExportar() {
        setExportando(true);
        try {
            const data = await exportImportApi.exportar();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `duodev-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            mostrarToast('erro', 'Erro ao exportar conteúdo.');
        } finally {
            setExportando(false);
        }
    }

    async function handleImportar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        setImportando(true);
        try {
            const text = await file.text();
            const json = JSON.parse(text) as { categories?: unknown[] };
            if (!Array.isArray(json.categories)) {
                mostrarToast('erro', 'Arquivo inválido: campo "categories" não encontrado.');
                return;
            }
            const resultado = await exportImportApi.importar({ categories: json.categories });
            const { criados, pulados } = resultado;
            const msg = [
                `${criados.categorias} categorias, ${criados.trilhas} trilhas,`,
                `${criados.aulas} aulas, ${criados.questoes} questões, ${criados.desafios} desafios criados.`,
                pulados.categorias > 0 ? `${pulados.categorias} puladas (já existiam).` : '',
            ].filter(Boolean).join(' ');
            mostrarToast('sucesso', msg);
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } catch {
            mostrarToast('erro', 'Erro ao importar: verifique se o arquivo é um JSON válido.');
        } finally {
            setImportando(false);
        }
    }

    function abrirNova() {
        setCategoriaEditando(undefined);
        setPainelKey((k) => k + 1);
        setPainelAberto(true);
    }

    function abrirEdicaoRapida(indiceFiltrado: number) {
        setCategoriaEditando(categoriasFiltradas[indiceFiltrado]);
        setPainelKey((k) => k + 1);
        setPainelAberto(true);
    }

    function fecharPainel() {
        setPainelAberto(false);
        setCategoriaEditando(undefined);
    }

    function handleSalvar(dados: CreateCategoriaDto) {
        if (categoriaEditando) {
            atualizarMutation.mutate({ id: categoriaEditando.id, dto: dados });
        } else {
            criarMutation.mutate(dados);
        }
    }

    function pedirExclusao(indiceFiltrado: number) {
        setCategoriaExcluindo(categoriasFiltradas[indiceFiltrado]);
    }

    function confirmarExclusao() {
        if (categoriaExcluindo) {
            removerMutation.mutate(categoriaExcluindo.id);
        }
    }

    if (isLoading) return <div className="loading">Carregando categorias...</div>;

    if (isError) {
        return (
            <TelaErro
                mensagem="Não foi possível carregar as categorias. Verifique a conexão com o servidor."
                onTentar={() => void refetch()}
            />
        );
    }

    return (
        <>
            <input
                ref={inputImportRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={(e) => void handleImportar(e)}
            />

            <ModuleHeader
                path={[{ label: 'Admin' }, { label: 'Conteúdo' }]}
                title="Conteúdo"
                btnLabel="Nova Categoria"
                btnOnClick={abrirNova}
                acoes={
                    <>
                        <button
                            className="btn-sec"
                            onClick={() => inputImportRef.current?.click()}
                            disabled={importando}
                        >
                            {importando ? 'Importando...' : 'Importar JSON'}
                        </button>
                        <button
                            className="btn-sec"
                            onClick={() => void handleExportar()}
                            disabled={exportando}
                        >
                            {exportando ? 'Exportando...' : 'Exportar JSON'}
                        </button>
                    </>
                }
            />

            <section className="data">
                <div className="boxList">
                    <DataBox
                        titulo="CATEGORIAS"
                        valor={String(categorias.length)}
                        texto={`${categorias.filter((c) => c.status === 'publicado').length} publicadas`}
                    />
                    <DataBox titulo="TRILHAS" valor={String(totalTrilhas)} texto="Em todas as categorias" />
                    <DataBox titulo="AULAS" valor={String(totalAulas)} texto="Em todas as trilhas" />
                    <DataBox titulo="QUESTÕES" valor={String(totalQuestoes)} texto="Em todas as trilhas" />
                </div>

                <BarraFiltros
                    abas={abas}
                    abaAtiva={abaAtiva}
                    onMudarAba={setAbaAtiva}
                    termoBusca={termoBusca}
                    onMudarBusca={setTermoBusca}
                    placeholderBusca="Buscar categoria..."
                />

                <MesaDeDados
                    headers={['CATEGORIA', 'STATUS', 'TRILHAS', 'AULAS', 'QUESTÕES', 'AÇÕES']}
                    data={dadosTabela}
                    onEditar={abrirEdicaoRapida}
                    onExcluir={pedirExclusao}
                />
            </section>

            <PainelLateral
                aberto={painelAberto}
                onFechar={fecharPainel}
                titulo={categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                subtitulo={categoriaEditando ? 'Edição rápida' : 'Preencha os dados da nova categoria'}
            >
                <FormularioCategoria
                    key={painelKey}
                    categoria={categoriaEditando}
                    onSalvar={handleSalvar}
                    onCancelar={fecharPainel}
                />
            </PainelLateral>

            <DialogoConfirmacao
                aberto={!!categoriaExcluindo}
                titulo="Excluir Categoria"
                mensagem={`Tem certeza que deseja excluir "${categoriaExcluindo?.name}"? Esta ação não pode ser desfeita.`}
                textoBotaoConfirmar="Excluir"
                variante="perigo"
                onConfirmar={confirmarExclusao}
                onCancelar={() => setCategoriaExcluindo(undefined)}
            />
        </>
    );
}
